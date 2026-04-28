# Marketplace Module — Import Pipeline
> Spec Phase 8 | Seed-Daten, Onboarding, Setup

---

## Übersicht

Pipeline enthält:
1. Seed: Subscription Plans
2. Seed: Featured/System Creators
3. Seed: Lumeos-curated Demo-Produkte
4. Cron Jobs Setup
5. Verifikation

---

## Phase 1: Subscription Plans Seed

```sql
INSERT INTO marketplace.subscription_plans
  (name, price_cents, wallet_credit_cents, billing_interval, ai_credits_included, features, sort_order)
VALUES
('Lumeos Basic',
 999, 999, 'month', 20,
 '{"modules": ["nutrition","training","supplements","recovery","goals"],
   "ai": "basic", "marketplace": true}',
 10),

('Lumeos Plus',
 1999, 1999, 'month', 50,
 '{"modules": ["nutrition","training","supplements","recovery","goals","medical"],
   "ai": "full", "marketplace": true, "advanced_goals": true}',
 20),

('Lumeos Pro',
 2999, 2999, 'month', 150,
 '{"modules": "all", "ai": "full", "marketplace": true,
   "advanced_goals": true, "human_coach": true, "expert_plans": true}',
 30),

-- Jahres-Pläne (2 Monate gratis)
('Lumeos Plus Yearly',
 19990, 19990, 'year', 600,
 '{"same_as": "Lumeos Plus"}',
 25),

('Lumeos Pro Yearly',
 29990, 29990, 'year', 1800,
 '{"same_as": "Lumeos Pro"}',
 35);
```

---

## Phase 2: System Creator (Lumeos Curated)

```sql
-- Lumeos eigener Creator-Account für kuratierte Bundles
INSERT INTO marketplace.creators
  (user_id, creator_type, display_name, bio, is_verified, verification_level,
   revenue_share_pct, can_create_bundles)
VALUES
('00000000-0000-0000-0000-000000000001',  -- Lumeos System Account
 'coach',
 'Lumeos Curated',
 'Professionell kuratierte Programme vom LumeOS Team',
 true, 'premium',
 0,       -- 100% geht an Lumeos
 true);
```

---

## Phase 3: Demo Products Seed (Development)

```sql
-- Demo: Training Program
INSERT INTO marketplace.products
  (creator_id, product_type, title, short_description, price_cents,
   goal_alignments, difficulty, duration_weeks, tags, is_verified, avg_rating, review_count)
VALUES
((SELECT id FROM marketplace.creators WHERE display_name = 'Lumeos Curated'),
 'training_program',
 'PPL Hypertrophy (Kostenlos)',
 '3-Split Push/Pull/Legs für Anfänger, 4×/Woche, 8 Wochen',
 0,
 ARRAY['muscle_gain','strength'],
 'beginner', 8,
 ARRAY['ppl','hypertrophy','beginner','free'],
 true, 4.6, 87),

-- Demo: Bundle
((SELECT id FROM marketplace.creators WHERE display_name = 'Lumeos Curated'),
 'bundle',
 '12-Week Lean Bulk Bundle',
 'Das Komplettpaket für nachhaltigen Muskelaufbau: Training + Ernährung + Supplements',
 4900,
 ARRAY['muscle_gain','strength'],
 'intermediate', 12,
 ARRAY['lean_bulk','bundle','complete','popular'],
 true, 4.8, 234),

-- Demo: Meal Plan
((SELECT id FROM marketplace.creators WHERE display_name = 'Lumeos Curated'),
 'meal_plan',
 'Lean Bulk Meal Plan (2800 kcal)',
 'Wöchentliche Meal Plans für nachhaltigen Masseaufbau mit 180g Protein',
 1900,
 ARRAY['muscle_gain'],
 'intermediate', 12,
 ARRAY['lean_bulk','meal_plan','high_protein'],
 true, 4.5, 56);
```

---

## Phase 4: Wallet-Initialisierung (User Onboarding)

```typescript
// Trigger: Neuer User registriert sich → Wallet anlegen
async function initUserWallet(userId: string): Promise<void> {
  await db.insert(marketplace.wallets).values({
    owner_id:   userId,
    owner_type: 'user',
    can_payout: false,
  }).onConflictDoNothing();  // Idempotent
}

// Trigger: User wird Creator → Wallet auf can_payout = true setzen
async function upgradeToCreator(userId: string): Promise<void> {
  // 1. Creator-Profil anlegen
  const creator = await db.insert(marketplace.creators).values({
    user_id:          userId,
    creator_type:     'coach',  // Default, kann geändert werden
    display_name:     '...',
    revenue_share_pct: 80,
  }).returning();

  // 2. Wallet upgraden
  await db.update(marketplace.wallets).set({
    can_payout: true,
  }).where(eq(owner_id, userId));
}
```

---

## Phase 5: Cron Jobs

```typescript
// 1. Täglich 02:00: Search Scores aktualisieren
async function dailySearchScoreUpdate() {
  // Für alle aktiven Produkte
  // Recalculate search_score basierend auf purchase_count, avg_rating, recency
  // + active promotion bonus
  await updateAllProductSearchScores();
}

// 2. Täglich 03:00: Abgelaufene Promotions deaktivieren
async function cleanupExpiredPromotions() {
  await db.update(marketplace.promotion_slots).set({ is_active: false })
    .where(and(lte(ends_at, new Date()), eq(is_active, true)));
}

// 3. Monatlich (1. des Monats): Subscription Credits
async function monthlySubscriptionCredits() {
  const dueRenewals = await getDueSubscriptionRenewals();
  for (const renewal of dueRenewals) {
    const stripe = await chargeStripe(renewal);
    if (stripe.success) {
      await creditSubscriptionVoucher(renewal.user_id, renewal.plan_id);
    }
  }
}

// 4. Täglich: Delivery-Retry für failed Licenses
async function retryFailedDeliveries() {
  const failed = await db.query.product_licenses.findMany({
    where: and(eq(delivery_status, 'failed'), gte(created_at, subDays(new Date(), 7)))
  });
  for (const license of failed) {
    await deliverContent(license);
  }
}
```

---

## Phase 6: Content Delivery APIs (Modul-Calls)

```
Training Module (5200):
  POST http://training:5200/api/training/routines
  Body: { ...routine, user_id, source: 'marketplace', product_id }
  Auth: Service Token (INTERNAL_SERVICE_TOKEN)

Nutrition Module (5100):
  POST http://nutrition:5100/api/nutrition/meal-plans
  Body: { ...meal_plan, user_id, source: 'marketplace' }
  Auth: Service Token

Supplements Module (5300):
  POST http://supplements:5300/api/supplements/stacks
  Body: { ...stack, user_id, source: 'marketplace', requires_confirmation: true }
  Auth: Service Token
  Note: requires_confirmation: true → User wird in Supplements App benachrichtigt
```

---

## Verifikation

```sql
-- Subscription Plans vorhanden?
SELECT name, price_cents, wallet_credit_cents FROM marketplace.subscription_plans WHERE is_active = true;
-- Erwartet: 3–5 Pläne

-- System Creator vorhanden?
SELECT display_name, verification_level FROM marketplace.creators WHERE display_name = 'Lumeos Curated';

-- Demo Produkte?
SELECT product_type, title, price_cents FROM marketplace.products WHERE is_verified = true LIMIT 10;

-- Wallets werden angelegt?
SELECT COUNT(*) FROM marketplace.wallets WHERE owner_type = 'user';
```
