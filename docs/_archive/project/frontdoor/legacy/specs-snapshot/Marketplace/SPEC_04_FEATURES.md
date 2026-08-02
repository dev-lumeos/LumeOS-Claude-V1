# Marketplace Module — Feature Specs
> Spec Phase 4 | Implementierungsdetails

---

## Feature 1: Wallet System — Atomare Transaktionen

### Wallet Debit (Purchase)
```typescript
async function walletDebit(
  buyerWalletId: string,
  amountCents:   number,
  description:   string,
  referenceId?:  string
): Promise<DebitResult> {
  return await db.transaction(async (tx) => {
    const wallet = await tx.query.wallets.findFirst({
      where: eq(id, buyerWalletId),
      lock: 'for update'  // Pessimistisches Locking
    });
    if (!wallet) throw new Error('Wallet not found');

    const available = wallet.voucher_balance_cents + wallet.revenue_balance_cents;
    if (available < amountCents) throw new InsufficientFundsError();

    // Voucher zuerst belastet
    const voucherDebit = Math.min(wallet.voucher_balance_cents, amountCents);
    const revenueDebit = amountCents - voucherDebit;

    await tx.update(wallets).set({
      voucher_balance_cents: wallet.voucher_balance_cents - voucherDebit,
      revenue_balance_cents: wallet.revenue_balance_cents - revenueDebit,
      total_spent_cents:     wallet.total_spent_cents + amountCents,
      updated_at:            new Date(),
    }).where(eq(id, buyerWalletId));

    return { voucherDebit, revenueDebit, newVoucher: wallet.voucher_balance_cents - voucherDebit };
  });
}
```

### Subscription Credit
```typescript
async function creditSubscriptionVoucher(userId: string, planId: string): Promise<void> {
  const plan = await getSubscriptionPlan(planId);
  await db.transaction(async (tx) => {
    await tx.update(wallets).set({
      voucher_balance_cents: sql`voucher_balance_cents + ${plan.wallet_credit_cents}`,
      updated_at: new Date(),
    }).where(eq(owner_id, userId));

    await tx.insert(wallet_transactions).values({
      to_wallet_id:    await getWalletId(userId),
      gross_amount_cents: plan.wallet_credit_cents,
      fee_cents:          0,
      net_amount_cents:   plan.wallet_credit_cents,
      to_balance_type:    'voucher',
      type:               'subscription_credit',
      reference_type:     'subscription',
      reference_id:       planId,
      description:        `Monatliches Membership Goodwill (${plan.name})`,
    });
  });
}
```

---

## Feature 2: Search Scoring (täglich via Cron)

```typescript
async function updateSearchScores() {
  const products = await getAllActiveProducts();

  for (const product of products) {
    const score = calcProductSearchScore({
      purchase_count:     product.purchase_count,
      avg_rating:         product.avg_rating,
      review_count:       product.review_count,
      days_since_created: daysSince(product.created_at),
      is_promoted:        hasActivePromotion(product.id),
      goal_match_score:   0,  // Personalisierung = per-request, nicht im Score
      difficulty_match:   false,
    });

    await db.update(products).set({ search_score: score })
      .where(eq(id, product.id));
  }
}
```

---

## Feature 3: Content Delivery nach Kauf

```typescript
const DELIVERY_APIS: Record<string, DeliveryConfig> = {
  training_program: {
    url:    'http://training:5200/api/training/routines',
    method: 'POST',
    sourceField: 'routine',
  },
  meal_plan: {
    url:    'http://nutrition:5100/api/nutrition/meal-plans',
    method: 'POST',
    sourceField: 'meal_plan',
  },
  supplement_protocol: {
    url:    'http://supplements:5300/api/supplements/stacks',
    method: 'POST',
    sourceField: 'stack',
    extra: { requires_confirmation: true },
  },
};

async function deliverContent(license: ProductLicense): Promise<void> {
  const product = await getProduct(license.product_id);
  const results: Record<string, unknown> = {};

  const components = product.product_type === 'bundle'
    ? await getBundleComponents(product.id)
    : [product];

  for (const comp of components) {
    const cfg = DELIVERY_APIS[comp.product_type];
    if (!cfg) continue;

    const payload = {
      ...comp.content[cfg.sourceField],
      user_id:    license.user_id,
      source:     'marketplace',
      product_id: comp.id,
      ...cfg.extra,
    };

    const res = await fetch(cfg.url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${INTERNAL_TOKEN}` },
      body:    JSON.stringify(payload),
    });

    if (res.ok) {
      const data = await res.json();
      results[comp.product_type] = data.data?.id;
    }
  }

  await db.update(product_licenses).set({
    delivery_status:  Object.keys(results).length === components.length ? 'delivered' : 'partial',
    delivered_at:     new Date(),
    delivery_results: results,
  }).where(eq(id, license.id));
}
```

---

## Feature 4: Creator Revenue

```typescript
async function creditCreatorRevenue(
  order: Order,
  product: Product
): Promise<void> {
  const fee      = order.fee_cents;
  const revenue  = order.total_cents - fee;
  const creator  = await getCreator(product.creator_id);

  await db.transaction(async (tx) => {
    await tx.update(wallets).set({
      revenue_balance_cents: sql`revenue_balance_cents + ${revenue}`,
      total_earned_cents:    sql`total_earned_cents + ${revenue}`,
    }).where(eq(owner_id, creator.user_id));

    await tx.insert(wallet_transactions).values({
      from_wallet_id:  await getWalletId(order.buyer_id),
      to_wallet_id:    await getWalletId(creator.user_id),
      gross_amount_cents: order.total_cents,
      fee_cents:          fee,
      net_amount_cents:   revenue,
      from_balance_type:  order.payment_method === 'wallet_revenue' ? 'revenue' : 'voucher',
      to_balance_type:    'revenue',
      type:               'revenue_credit',
      reference_type:     'order',
      reference_id:       order.id,
      description:        `Verkauf: ${product.title}`,
    });

    // Creator Sales-Stats updaten
    await tx.update(creators).set({
      total_sales:          sql`total_sales + 1`,
      total_revenue_cents:  sql`total_revenue_cents + ${revenue}`,
    }).where(eq(id, creator.id));
  });
}
```

---

## Feature 5: Review System (Anti-Fraud)

```typescript
async function canReview(userId: string, productId: string): Promise<boolean> {
  // Nur verified purchases können bewerten
  const license = await db.query.product_licenses.findFirst({
    where: and(eq(user_id, userId), eq(product_id, productId), eq(is_active, true))
  });
  if (!license) return false;

  // Nicht doppelt bewerten
  const existing = await db.query.product_reviews.findFirst({
    where: and(eq(reviewer_id, userId), eq(product_id, productId))
  });
  return !existing;
}

async function submitReview(userId: string, productId: string, data: ReviewInput): Promise<void> {
  if (!await canReview(userId, productId)) throw new ForbiddenError('Keine Bewertungsberechtigung');

  const order = await getOrderForProduct(userId, productId);

  await db.transaction(async (tx) => {
    await tx.insert(product_reviews).values({
      product_id:  productId,
      reviewer_id: userId,
      order_id:    order.id,
      rating:      data.rating,
      title:       data.title,
      content:     data.content,
    });

    // Aggregierte Stats updaten
    await updateProductRating(tx, productId);
  });
}
```

---

## Feature 6: Personalized Recommendations

```typescript
interface RecommendationContext {
  userId:       string;
  goalPhase?:   string;
  goalSubtype?: string;
  userLevel?:   string;
  recentlyViewed?: string[];
}

async function getPersonalizedRecommendations(
  ctx: RecommendationContext,
  limit = 5
): Promise<Product[]> {
  // 1. Basis-Abfrage: aktive, verifizierte Produkte
  const candidates = await getActiveProducts();

  // 2. Scoring
  const scored = candidates.map(p => ({
    ...p,
    personalScore: calcProductSearchScore({
      purchase_count:     p.purchase_count,
      avg_rating:         p.avg_rating,
      review_count:       p.review_count,
      days_since_created: daysSince(p.created_at),
      is_promoted:        false,
      goal_match_score:   calcGoalMatchScore(p.goal_alignments, ctx.goalPhase ?? '', ctx.goalSubtype ?? ''),
      difficulty_match:   p.difficulty === ctx.userLevel,
    }),
  }));

  // 3. Bereits gekaufte rausfiltern
  const purchased = await getUserLicenses(ctx.userId);
  const purchasedIds = new Set(purchased.map(l => l.product_id));

  return scored
    .filter(p => !purchasedIds.has(p.id))
    .sort((a, b) => b.personalScore - a.personalScore)
    .slice(0, limit);
}
```

---

## Feature 7: Promotion Slot Aktivierung

```typescript
async function activatePromotionSlot(
  creatorId:    string,
  productId:    string,
  slotType:     string,
): Promise<PromotionSlot> {
  const SLOT_COSTS: Record<string, number> = {
    daily_boost:      999,    // €9.99
    weekly_boost:     4999,   // €49.99
    category_feature: 9999,   // €99.99
    homepage:         24999,  // €249.99
  };

  const SLOT_DURATIONS: Record<string, number> = {
    daily_boost:      1,
    weekly_boost:     7,
    category_feature: 7,
    homepage:         7,
  };

  const cost = SLOT_COSTS[slotType];
  if (!cost) throw new Error('Invalid slot type');

  return await db.transaction(async (tx) => {
    // Revenue Wallet belasten
    const creatorWallet = await getCreatorWallet(creatorId);
    if (creatorWallet.revenue_balance_cents < cost) throw new InsufficientFundsError();

    await tx.update(wallets).set({
      revenue_balance_cents: sql`revenue_balance_cents - ${cost}`,
    }).where(eq(owner_id, creatorId));

    // Promotion Slot erstellen
    const slot = await tx.insert(promotion_slots).values({
      product_id:  productId,
      creator_id:  creatorId,
      slot_type:   slotType,
      starts_at:   new Date(),
      ends_at:     addDays(new Date(), SLOT_DURATIONS[slotType]),
      cost_cents:  cost,
      is_active:   true,
    }).returning();

    return slot[0];
  });
}
```
