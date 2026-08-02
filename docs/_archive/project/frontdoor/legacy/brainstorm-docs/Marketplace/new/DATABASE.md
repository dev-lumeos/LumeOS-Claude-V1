# Marketplace Module — Database Schema

## Schema & Übersicht

Alle Marketplace-Tabellen im Schema `marketplace`. Wallet-System ist zentral.

---

## Tabellen-Index

| Tabelle | Beschreibung |
|---|---|
| `marketplace.wallets` | Wallet pro Owner (User/Creator/B2B) |
| `marketplace.wallet_transactions` | Alle Wallet-Bewegungen |
| `marketplace.subscription_plans` | Abo-Pläne + Wallet-Credits |
| `marketplace.user_subscriptions` | Aktive User-Abos |
| `marketplace.creators` | Creator-Profile + Verifizierung |
| `marketplace.products` | Produkt-Katalog |
| `marketplace.product_bundles` | Bundle-Komponenten |
| `marketplace.orders` | Käufe + Status |
| `marketplace.order_items` | Einzelne Positionen in Order |
| `marketplace.product_licenses` | Zugang nach Kauf |
| `marketplace.product_reviews` | Bewertungen (nur Verified) |
| `marketplace.promotion_slots` | Paid Boost Slots |

---

## 1. marketplace.wallets

```sql
CREATE TABLE marketplace.wallets (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id         UUID NOT NULL UNIQUE,
  owner_type       TEXT NOT NULL
    CHECK (owner_type IN ('user','creator','gym','vendor','brand')),

  -- Zwei Salden
  voucher_balance_cents INTEGER NOT NULL DEFAULT 0
    CHECK (voucher_balance_cents >= 0),
  revenue_balance_cents INTEGER NOT NULL DEFAULT 0
    CHECK (revenue_balance_cents >= 0),

  -- Lifetime Statistiken
  total_spent_cents  INTEGER NOT NULL DEFAULT 0,
  total_earned_cents INTEGER NOT NULL DEFAULT 0,

  -- Konfiguration
  currency           TEXT NOT NULL DEFAULT 'EUR',
  can_payout         BOOLEAN NOT NULL DEFAULT false,
  auto_topup_enabled BOOLEAN NOT NULL DEFAULT false,
  auto_topup_threshold_cents INTEGER DEFAULT 0,
  auto_topup_amount_cents    INTEGER DEFAULT 0,

  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE marketplace.wallets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "wallet_owner" ON marketplace.wallets FOR ALL
  USING (auth.uid()::text = owner_id::text);
```

---

## 2. marketplace.wallet_transactions

```sql
CREATE TABLE marketplace.wallet_transactions (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  from_wallet_id   UUID REFERENCES marketplace.wallets(id),
  to_wallet_id     UUID REFERENCES marketplace.wallets(id),

  gross_amount_cents  INTEGER NOT NULL,
  fee_cents           INTEGER NOT NULL DEFAULT 0,
  net_amount_cents    INTEGER NOT NULL,

  -- Welcher Saldo wurde belastet/gutgeschrieben
  from_balance_type TEXT DEFAULT 'voucher'
    CHECK (from_balance_type IN ('voucher','revenue')),
  to_balance_type   TEXT DEFAULT 'voucher'
    CHECK (to_balance_type IN ('voucher','revenue')),

  type             TEXT NOT NULL
    CHECK (type IN ('subscription_credit','topup','purchase','payout','bonus',
                    'refund','ai_usage','promotion_payment','revenue_credit')),
  reference_type   TEXT,
  reference_id     UUID,

  stripe_payment_id TEXT,
  description       TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_wt_from  ON marketplace.wallet_transactions(from_wallet_id, created_at DESC);
CREATE INDEX idx_wt_to    ON marketplace.wallet_transactions(to_wallet_id, created_at DESC);
CREATE INDEX idx_wt_type  ON marketplace.wallet_transactions(type, created_at DESC);
```

---

## 3. marketplace.subscription_plans

```sql
CREATE TABLE marketplace.subscription_plans (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                 TEXT NOT NULL,
  price_cents          INTEGER NOT NULL,
  wallet_credit_cents  INTEGER NOT NULL,  -- = price_cents (1:1 Goodwill)
  billing_interval     TEXT DEFAULT 'month'
    CHECK (billing_interval IN ('month','year')),
  features             JSONB DEFAULT '{}',
  ai_credits_included  INTEGER DEFAULT 0,
  is_active            BOOLEAN DEFAULT true,
  stripe_price_id      TEXT,
  created_at           TIMESTAMPTZ DEFAULT now()
);
```

---

## 4. marketplace.creators

```sql
CREATE TABLE marketplace.creators (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL UNIQUE,
  creator_type     TEXT NOT NULL
    CHECK (creator_type IN ('coach','influencer','brand','nutritionist','gym')),
  display_name     TEXT NOT NULL,
  bio              TEXT,
  avatar_url       TEXT,
  certifications   TEXT[] DEFAULT '{}',
  specializations  TEXT[] DEFAULT '{}',
  is_verified      BOOLEAN DEFAULT false,
  verification_level TEXT DEFAULT 'pending'
    CHECK (verification_level IN ('pending','basic','verified','premium')),
  total_sales      INTEGER DEFAULT 0,
  total_revenue_cents INTEGER DEFAULT 0,
  avg_product_rating NUMERIC(3,2),
  revenue_share_pct INTEGER DEFAULT 80,   -- Standard: 80% für Discovery Traffic
  stripe_account_id TEXT,                  -- Stripe Connect
  can_create_bundles BOOLEAN DEFAULT false,
  created_at       TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE marketplace.creators ENABLE ROW LEVEL SECURITY;
CREATE POLICY "creator_owner" ON marketplace.creators FOR ALL
  USING (auth.uid()::text = user_id::text);
```

---

## 5. marketplace.products

```sql
CREATE TABLE marketplace.products (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id       UUID NOT NULL REFERENCES marketplace.creators(id),

  product_type     TEXT NOT NULL
    CHECK (product_type IN ('training_program','meal_plan','supplement_protocol',
                            'recovery_protocol','bundle','ai_persona',
                            'equipment','digital','session')),
  title            TEXT NOT NULL,
  description      TEXT,
  short_description TEXT,

  price_cents      INTEGER NOT NULL CHECK (price_cents >= 0),
  compare_price_cents INTEGER,      -- Durchgestrichener Original-Preis
  pricing_model    TEXT DEFAULT 'one_time'
    CHECK (pricing_model IN ('one_time','subscription','free')),

  category         TEXT,
  tags             TEXT[] DEFAULT '{}',
  goal_alignments  TEXT[] DEFAULT '{}',
  difficulty       TEXT
    CHECK (difficulty IN ('beginner','intermediate','advanced',NULL)),
  duration_weeks   INTEGER,
  equipment_required TEXT[] DEFAULT '{}',

  media_urls       TEXT[] DEFAULT '{}',
  preview_url      TEXT,

  is_active        BOOLEAN DEFAULT true,
  is_verified      BOOLEAN DEFAULT false,
  is_featured      BOOLEAN DEFAULT false,
  is_free          BOOLEAN DEFAULT false,

  avg_rating       NUMERIC(3,2) DEFAULT 0,
  review_count     INTEGER DEFAULT 0,
  purchase_count   INTEGER DEFAULT 0,
  view_count       INTEGER DEFAULT 0,

  -- Ranking Score (täglich berechnet)
  search_score     NUMERIC(8,4) DEFAULT 0,

  -- Content (JSONB — eigentlicher Produktinhalt)
  content          JSONB DEFAULT '{}',
  -- training_program: {routine_id oder Routine-Schema}
  -- meal_plan: {meal_plan_schema}
  -- supplement_protocol: {stack_schema}

  stripe_product_id TEXT,
  created_at       TIMESTAMPTZ DEFAULT now(),
  updated_at       TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_products_type       ON marketplace.products(product_type, is_active);
CREATE INDEX idx_products_creator    ON marketplace.products(creator_id);
CREATE INDEX idx_products_score      ON marketplace.products(search_score DESC);
CREATE INDEX idx_products_goals      ON marketplace.products USING GIN(goal_alignments);
CREATE INDEX idx_products_tags       ON marketplace.products USING GIN(tags);
CREATE INDEX idx_products_title_fts  ON marketplace.products
  USING GIN(to_tsvector('english', title || ' ' || COALESCE(description, '')));
```

---

## 6. marketplace.product_bundles

```sql
CREATE TABLE marketplace.product_bundles (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bundle_id    UUID NOT NULL REFERENCES marketplace.products(id) ON DELETE CASCADE,
  component_id UUID NOT NULL REFERENCES marketplace.products(id),
  component_type TEXT NOT NULL,   -- training_program | meal_plan | supplement_protocol | recovery_protocol
  sort_order   INTEGER DEFAULT 0,
  UNIQUE (bundle_id, component_id)
);
```

---

## 7. marketplace.orders

```sql
CREATE TABLE marketplace.orders (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id         UUID NOT NULL,
  creator_id       UUID REFERENCES marketplace.creators(id),

  total_cents      INTEGER NOT NULL,
  fee_cents        INTEGER NOT NULL DEFAULT 0,
  creator_revenue_cents INTEGER NOT NULL DEFAULT 0,

  status           TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','completed','refunded','disputed','cancelled')),
  payment_method   TEXT DEFAULT 'wallet_voucher'
    CHECK (payment_method IN ('wallet_voucher','wallet_revenue','stripe')),

  purchased_at     TIMESTAMPTZ,
  refunded_at      TIMESTAMPTZ,
  refund_reason    TEXT,

  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_orders_buyer  ON marketplace.orders(buyer_id, created_at DESC);
CREATE INDEX idx_orders_status ON marketplace.orders(status);
```

---

## 8. marketplace.order_items

```sql
CREATE TABLE marketplace.order_items (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id   UUID NOT NULL REFERENCES marketplace.orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES marketplace.products(id),
  price_cents INTEGER NOT NULL,
  quantity   INTEGER DEFAULT 1
);
```

---

## 9. marketplace.product_licenses

```sql
CREATE TABLE marketplace.product_licenses (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id     UUID NOT NULL REFERENCES marketplace.orders(id),
  user_id      UUID NOT NULL,
  product_id   UUID NOT NULL REFERENCES marketplace.products(id),

  license_type TEXT DEFAULT 'lifetime'
    CHECK (license_type IN ('lifetime','subscription')),
  valid_from   TIMESTAMPTZ NOT NULL DEFAULT now(),
  valid_until  TIMESTAMPTZ,  -- NULL für Lifetime
  is_active    BOOLEAN DEFAULT true,

  -- Content Delivery Status
  delivery_status TEXT DEFAULT 'pending'
    CHECK (delivery_status IN ('pending','delivered','failed')),
  delivered_at TIMESTAMPTZ,

  UNIQUE (user_id, product_id)
);

CREATE INDEX idx_licenses_user    ON marketplace.product_licenses(user_id, is_active);
CREATE INDEX idx_licenses_product ON marketplace.product_licenses(product_id);
```

---

## 10. marketplace.product_reviews

```sql
CREATE TABLE marketplace.product_reviews (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id   UUID NOT NULL REFERENCES marketplace.products(id),
  reviewer_id  UUID NOT NULL,
  order_id     UUID NOT NULL REFERENCES marketplace.orders(id),  -- Nur verified

  rating       INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title        TEXT,
  content      TEXT,
  helpful_votes INTEGER DEFAULT 0,
  unhelpful_votes INTEGER DEFAULT 0,

  creator_response TEXT,
  creator_responded_at TIMESTAMPTZ,

  is_verified  BOOLEAN DEFAULT true,
  is_visible   BOOLEAN DEFAULT true,
  created_at   TIMESTAMPTZ DEFAULT now(),

  UNIQUE (product_id, reviewer_id)
);

CREATE INDEX idx_reviews_product ON marketplace.product_reviews(product_id, is_visible);
```

---

## 11. marketplace.promotion_slots

```sql
CREATE TABLE marketplace.promotion_slots (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id   UUID NOT NULL REFERENCES marketplace.products(id),
  creator_id   UUID NOT NULL REFERENCES marketplace.creators(id),

  slot_type    TEXT NOT NULL
    CHECK (slot_type IN ('daily_boost','weekly_boost','category_feature','homepage')),
  category     TEXT,

  starts_at    TIMESTAMPTZ NOT NULL,
  ends_at      TIMESTAMPTZ NOT NULL,
  cost_cents   INTEGER NOT NULL,

  impressions  INTEGER DEFAULT 0,
  clicks       INTEGER DEFAULT 0,
  conversions  INTEGER DEFAULT 0,

  is_active    BOOLEAN DEFAULT true
);

CREATE INDEX idx_promo_active ON marketplace.promotion_slots(is_active, ends_at)
  WHERE is_active = true;
```

---

## Grants

```sql
GRANT USAGE ON SCHEMA marketplace TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA marketplace TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA marketplace TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA marketplace TO authenticated, service_role;
```
