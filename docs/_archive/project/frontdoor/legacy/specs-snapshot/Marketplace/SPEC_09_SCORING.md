# Marketplace Module — Scoring Engine (Spec)
> Spec Phase 9 | Alle Algorithmen

---

## 1. Product Search Score (täglich Cron)

```typescript
// packages/scoring/src/marketplace.ts

interface ProductScoringInput {
  purchase_count:      number;
  avg_rating:          number;
  review_count:        number;
  days_since_created:  number;
  is_promoted:         boolean;
  goal_match_score:    number;  // 0–1 (personalisiert, per-request)
  difficulty_match:    boolean;
}

export function calcProductSearchScore(m: ProductScoringInput): number {
  // 1. Popularity (0–100): max bei 2000+ Käufen
  const popularity = Math.min(100, (m.purchase_count / 20));

  // 2. Rating weighted by Confidence (0–100)
  //    Weniger als 10 Reviews → abgeschwächt mit Bayesian Average
  const PRIOR_RATING = 70;   // Annahme für neue Produkte ohne Reviews
  const PRIOR_COUNT  = 10;
  const ratingConf   = m.review_count / (m.review_count + PRIOR_COUNT);
  const ratingNorm   = (m.avg_rating / 5) * 100;
  const ratingW      = ratingNorm * ratingConf + PRIOR_RATING * (1 - ratingConf);

  // 3. Recency (0–100): Linearer Abfall über 180 Tage
  const recency = Math.max(0, 100 - (m.days_since_created / 180) * 100);

  // 4. Personalized Goal Match (0–100)
  const personalized = m.goal_match_score * 100;

  // 5. Difficulty Match Bonus
  const diffBonus = m.difficulty_match ? 10 : 0;

  // 6. Promoted Bonus (addiert, kein Multiplikator)
  const promotedBonus = m.is_promoted ? 50 : 0;

  const baseScore = Math.round(
    popularity   * 0.30 +
    ratingW      * 0.20 +
    recency      * 0.10 +
    personalized * 0.30 +
    diffBonus    * 0.10 +
    promotedBonus
  );

  return Math.min(200, baseScore);  // Cap bei 200 (Promoted können höher sein)
}
```

---

## 2. Goal Match Score (per-request, personalisiert)

```typescript
const PHASE_TO_GOALS: Record<string, string[]> = {
  fat_loss:    ['fat_loss', 'body_composition', 'general'],
  lean_bulk:   ['muscle_gain', 'strength', 'performance'],
  maintenance: ['general', 'health', 'lifestyle'],
  recomp:      ['muscle_gain', 'fat_loss', 'body_composition'],
  contest_prep:['muscle_gain', 'fat_loss', 'performance'],
  reverse_diet:['general', 'health'],
};

export function calcGoalMatchScore(
  productGoals: string[],
  userGoalPhase: string,
  userSubtype: string
): number {
  const relevant = new Set([
    ...(PHASE_TO_GOALS[userGoalPhase] ?? ['general']),
    userSubtype,
    'general',
  ]);

  if (productGoals.length === 0) return 0.5;  // Produkt ohne Tags: Neutral
  const matches = productGoals.filter(g => relevant.has(g)).length;
  return matches / productGoals.length;
}
```

---

## 3. Fee Calculation

```typescript
const FEE_CONFIG: Record<string, Record<string, number>> = {
  digital:  { discovery: 0.20, coach: 0.10, promoted: 0.25 },
  physical: { discovery: 0.15, coach: 0.08, promoted: 0.20 },
  session:  { discovery: 0.20, coach: 0.10, promoted: 0.25 },
};

export function calcFee(
  priceCents:    number,
  productType:   string,
  trafficSource: 'discovery' | 'coach' = 'discovery',
  isPromoted:    boolean = false
): number {
  const category = ['equipment'].includes(productType) ? 'physical'
                  : productType === 'session' ? 'session' : 'digital';
  const key      = isPromoted ? 'promoted' : trafficSource;
  const rate     = FEE_CONFIG[category]?.[key] ?? 0.20;
  return Math.round(priceCents * rate);
}
```

---

## 4. Bundle Savings

```typescript
export function calcBundleSavings(
  componentPrices: number[],
  bundlePrice:     number
): { individual_total: number; savings: number; savings_pct: number } {
  const total    = componentPrices.reduce((s, p) => s + p, 0);
  const savings  = total - bundlePrice;
  const savingsPct = total > 0 ? Math.round((savings / total) * 100) : 0;
  return { individual_total: total, savings, savings_pct: savingsPct };
}
```

---

## 5. Wallet Debit (vollständig)

```typescript
export interface WalletDebitResult {
  voucher_debited:       number;
  revenue_debited:       number;
  new_voucher_balance:   number;
  new_revenue_balance:   number;
}

export function calcWalletDebit(
  wallet:        { voucher_balance_cents: number; revenue_balance_cents: number },
  amountCents:   number
): WalletDebitResult {
  const available = wallet.voucher_balance_cents + wallet.revenue_balance_cents;
  if (available < amountCents) throw new Error('insufficient_funds');

  const voucherDebit = Math.min(wallet.voucher_balance_cents, amountCents);
  const revenueDebit = amountCents - voucherDebit;

  return {
    voucher_debited:     voucherDebit,
    revenue_debited:     revenueDebit,
    new_voucher_balance: wallet.voucher_balance_cents - voucherDebit,
    new_revenue_balance: wallet.revenue_balance_cents - revenueDebit,
  };
}
```

---

## 6. Promotion Slot ROI Berechnung

```typescript
export function calcPromotionROI(slot: PromotionSlot, avgProductPrice: number): PromotionROI {
  const revenue      = slot.conversions * avgProductPrice;
  const cost         = slot.cost_cents;
  const roi          = cost > 0 ? (revenue - cost) / cost : 0;
  const ctr          = slot.impressions > 0 ? slot.clicks / slot.impressions : 0;
  const convRate     = slot.clicks > 0 ? slot.conversions / slot.clicks : 0;

  return {
    impressions: slot.impressions,
    clicks:      slot.clicks,
    conversions: slot.conversions,
    revenue_cents: revenue,
    cost_cents:    cost,
    roi_pct:       Math.round(roi * 100),
    ctr_pct:       Math.round(ctr * 100),
    conversion_rate_pct: Math.round(convRate * 100),
    profitable:    roi > 0,
  };
}
```

---

## 7. Creator Revenue Share Berechnung

```typescript
export function calcCreatorRevenue(
  priceCents:      number,
  creator:         { revenue_share_pct: number },
  trafficSource:   'discovery' | 'coach',
  isPromoted:      boolean
): CreatorRevenueCalc {
  const fee         = calcFee(priceCents, 'digital', trafficSource, isPromoted);
  const netRevenue  = priceCents - fee;
  const creatorShare = Math.round(netRevenue * (creator.revenue_share_pct / 100));

  return {
    gross_cents:          priceCents,
    fee_cents:            fee,
    net_cents:            netRevenue,
    creator_cents:        creatorShare,
    lumeos_cents:         priceCents - creatorShare,
    creator_share_pct:    creator.revenue_share_pct,
  };
}
```

---

## 8. Subscription Credit Berechnung

```typescript
// Abo-Geld = weg. Voucher = Goodwill (1:1)
export function calcSubscriptionCredit(plan: SubscriptionPlan): SubscriptionCredit {
  return {
    price_charged_cents:   plan.price_cents,
    voucher_credited_cents: plan.wallet_credit_cents,  // = price_cents (1:1)
    ai_credits:             plan.ai_credits_included,
    voucher_type:           'goodwill',
    is_cashable:            false,
    expires_on_cancellation: true,
  };
}
```

---

## 9. Unit Tests

```typescript
describe('calcProductSearchScore', () => {
  it('promoted product ranks highest', () => {
    const promoted = calcProductSearchScore({
      purchase_count: 100, avg_rating: 4.5, review_count: 50,
      days_since_created: 30, is_promoted: true,
      goal_match_score: 0.8, difficulty_match: true,
    });
    const organic = calcProductSearchScore({
      purchase_count: 500, avg_rating: 4.9, review_count: 200,
      days_since_created: 30, is_promoted: false,
      goal_match_score: 0.8, difficulty_match: true,
    });
    expect(promoted).toBeGreaterThan(organic);
  });
});

describe('calcWalletDebit', () => {
  it('debits voucher first', () => {
    const r = calcWalletDebit(
      { voucher_balance_cents: 3000, revenue_balance_cents: 2000 },
      3500
    );
    expect(r.voucher_debited).toBe(3000);
    expect(r.revenue_debited).toBe(500);
    expect(r.new_voucher_balance).toBe(0);
    expect(r.new_revenue_balance).toBe(1500);
  });

  it('throws on insufficient funds', () => {
    expect(() => calcWalletDebit(
      { voucher_balance_cents: 100, revenue_balance_cents: 0 },
      200
    )).toThrow('insufficient_funds');
  });
});

describe('calcFee', () => {
  it('discovery digital = 20%', () => {
    expect(calcFee(4900, 'training_program', 'discovery', false)).toBe(980);
  });
  it('coach traffic digital = 10%', () => {
    expect(calcFee(4900, 'training_program', 'coach', false)).toBe(490);
  });
});
```
