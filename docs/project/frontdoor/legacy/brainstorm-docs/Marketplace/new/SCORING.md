# Marketplace Module — Scoring Engine

## 1. Product Search Score

```typescript
// packages/scoring/src/marketplace.ts

interface ProductMetrics {
  purchase_count:  number;
  avg_rating:      number;
  review_count:    number;
  days_since_created: number;
  is_promoted:     boolean;
  goal_match_score: number;  // 0–1 (User Goal Match)
  difficulty_match: boolean;
}

function calcProductSearchScore(m: ProductMetrics): number {
  const popularity   = Math.min(100, m.purchase_count / 20);       // 0–100, cap bei 2000 Käufen
  const rating       = m.avg_rating > 0 ? (m.avg_rating / 5) * 100 : 50;
  const ratingConf   = Math.min(1, m.review_count / 50);           // 0–1 Konfidenz bei < 50 Reviews
  const ratingWeighted = rating * ratingConf + 50 * (1 - ratingConf);
  const recency      = Math.max(0, 100 - m.days_since_created / 3); // Abfall über ~300 Tage
  const personalized = m.goal_match_score * 100;
  const diffBonus    = m.difficulty_match ? 10 : 0;
  const promotedBonus = m.is_promoted ? 50 : 0;

  return Math.round(
    popularity    * 0.30 +
    ratingWeighted * 0.20 +
    recency        * 0.10 +
    personalized   * 0.30 +
    diffBonus      * 0.10 +
    promotedBonus
  );
}
```

---

## 2. Goal Match Score

```typescript
function calcGoalMatchScore(
  productGoals:   string[],   // product.goal_alignments
  userGoalPhase:  string,     // z.B. 'lean_bulk'
  userSubtype:    string      // z.B. 'muscle_gain'
): number {
  const PHASE_TO_GOALS: Record<string, string[]> = {
    lean_bulk:    ['muscle_gain', 'strength', 'performance'],
    fat_loss:     ['fat_loss', 'body_composition'],
    maintenance:  ['general', 'health', 'lifestyle'],
    recomp:       ['muscle_gain', 'fat_loss', 'body_composition'],
    contest_prep: ['muscle_gain', 'fat_loss', 'performance'],
  };

  const relevantGoals = new Set([
    ...(PHASE_TO_GOALS[userGoalPhase] ?? []),
    userSubtype,
  ]);

  const matches = productGoals.filter(g => relevantGoals.has(g)).length;
  return productGoals.length > 0 ? matches / productGoals.length : 0;
}
```

---

## 3. Wallet Transaction — Atomarer Checkout

```typescript
async function processCheckout(
  buyerId: string,
  productId: string,
): Promise<CheckoutResult> {
  const product = await getProduct(productId);
  const wallet  = await getWallet(buyerId);

  // Precheck
  const total = product.price_cents;
  const available = wallet.voucher_balance_cents + wallet.revenue_balance_cents;
  if (available < total) throw new InsufficientFundsError();

  // Atomar via DB-Transaktion
  return await db.transaction(async (tx) => {
    // 1. Voucher zuerst belastet
    let remaining = total;
    const voucherDebit = Math.min(wallet.voucher_balance_cents, remaining);
    remaining -= voucherDebit;
    const revenueDebit = remaining;

    // 2. Wallet Debit
    await tx.update(wallets).set({
      voucher_balance_cents: wallet.voucher_balance_cents - voucherDebit,
      revenue_balance_cents: wallet.revenue_balance_cents - revenueDebit,
      total_spent_cents:     wallet.total_spent_cents + total,
    }).where(eq(id, buyerId));

    // 3. Order erstellen
    const order = await tx.insert(orders).values({
      buyer_id: buyerId,
      creator_id: product.creator_id,
      total_cents: total,
      fee_cents:   calcFee(total, product),
      creator_revenue_cents: total - calcFee(total, product),
      status: 'completed',
      purchased_at: new Date(),
    }).returning();

    // 4. Creator Revenue gutschreiben
    const creatorRevenue = order.creator_revenue_cents;
    await tx.update(wallets).set({
      revenue_balance_cents: creatorWallet.revenue_balance_cents + creatorRevenue,
      total_earned_cents: creatorWallet.total_earned_cents + creatorRevenue,
    }).where(eq(owner_id, product.creator_id));

    // 5. Transaction Log
    await tx.insert(wallet_transactions).values({
      from_wallet_id: buyerWallet.id,
      to_wallet_id:   creatorWallet.id,
      gross_amount_cents: total,
      fee_cents:          calcFee(total, product),
      net_amount_cents:   creatorRevenue,
      type: 'purchase',
      reference_type: 'product',
      reference_id: productId,
    });

    // 6. License erstellen
    const license = await tx.insert(product_licenses).values({
      order_id: order.id,
      user_id: buyerId,
      product_id: productId,
      license_type: product.pricing_model === 'one_time' ? 'lifetime' : 'subscription',
    }).returning();

    return { order, license };
  });
}
```

---

## 4. Fee Berechnung

```typescript
const FEE_RATES: Record<string, Record<string, number>> = {
  digital: {
    discovery:  0.20,  // 20% wenn User über Lumeos Discovery kam
    coach:      0.10,  // 10% wenn User über Coach-Referral kam
    promoted:   0.25,  // 25% wenn Product promoted ist
  },
  physical: {
    discovery: 0.15,
    coach:     0.08,
  },
  session: {
    discovery: 0.20,
    coach:     0.10,
  },
};

function calcFee(priceCents: number, product: Product, trafficSource = 'discovery'): number {
  const category = product.product_type === 'session' ? 'session'
                  : ['equipment'].includes(product.product_type) ? 'physical' : 'digital';
  const rate = FEE_RATES[category][trafficSource] ?? 0.20;
  const boosted = product.is_promoted ? 0.05 : 0;
  return Math.round(priceCents * (rate + boosted));
}
```

---

## 5. Subscription Credit Processing (Cron)

```typescript
// Monatlich via Cron: Abo-Erneuerung → Wallet Voucher
async function processSubscriptionCredits() {
  const renewals = await getDueSubscriptions();

  for (const sub of renewals) {
    const plan = await getSubscriptionPlan(sub.plan_id);

    // Stripe Charge
    const charge = await stripe.charge(sub.stripe_customer_id, plan.price_cents);
    if (!charge.success) continue;

    // Goodwill Voucher ins Wallet
    await addVoucherCredit(sub.user_id, plan.wallet_credit_cents, 'subscription_credit');

    // AI Credits resetten wenn Plan includet
    if (plan.ai_credits_included > 0) {
      await resetAICredits(sub.user_id, plan.ai_credits_included);
    }
  }
}
```

---

## 6. Content Delivery nach Kauf

```typescript
async function deliverContent(license: ProductLicense): Promise<DeliveryResult> {
  const product = await getProduct(license.product_id);
  const results: DeliveryResult[] = [];

  if (product.product_type === 'bundle') {
    const components = await getBundleComponents(product.id);
    for (const c of components) {
      results.push(await deliverComponent(c, license.user_id));
    }
  } else {
    results.push(await deliverComponent(product, license.user_id));
  }

  const allOk = results.every(r => r.status === 'delivered');
  await updateLicense(license.id, {
    delivery_status: allOk ? 'delivered' : 'failed',
    delivered_at:    allOk ? new Date() : null,
  });

  return { status: allOk ? 'delivered' : 'partial', results };
}

async function deliverComponent(product: Product, userId: string): Promise<DeliveryResult> {
  const content = product.content;

  switch (product.product_type) {
    case 'training_program':
      const routine = await callTrainingAPI('POST', '/api/training/routines', {
        ...content.routine, user_id: userId, source: 'marketplace', product_id: product.id
      });
      return { type: 'training_program', id: routine.id, status: 'delivered' };

    case 'meal_plan':
      const plan = await callNutritionAPI('POST', '/api/nutrition/meal-plans', {
        ...content.meal_plan, user_id: userId, source: 'marketplace'
      });
      return { type: 'meal_plan', id: plan.id, status: 'delivered' };

    case 'supplement_protocol':
      const stack = await callSupplementsAPI('POST', '/api/supplements/stacks', {
        ...content.stack, user_id: userId, source: 'marketplace', requires_confirmation: true
      });
      return { type: 'supplement_stack', id: stack.id, status: 'delivered' };

    default:
      return { type: product.product_type, status: 'delivered' };
  }
}
```
