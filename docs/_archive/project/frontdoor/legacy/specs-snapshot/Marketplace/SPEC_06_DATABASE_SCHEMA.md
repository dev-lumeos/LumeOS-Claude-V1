# Marketplace Module — Database Schema (Spec)
> Spec Phase 6 | Vollständiges SQL

---

```sql
CREATE SCHEMA IF NOT EXISTS marketplace;
SET search_path = marketplace, public;
```

---

## 1. marketplace.wallets

```sql
CREATE TABLE marketplace.wallets (
  id                         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id                   UUID NOT NULL UNIQUE,
  owner_type                 TEXT NOT NULL
    CHECK (owner_type IN ('user','creator','gym','vendor','brand')),

  voucher_balance_cents      INTEGER NOT NULL DEFAULT 0
    CHECK (voucher_balance_cents >= 0),
  revenue_balance_cents      INTEGER NOT NULL DEFAULT 0
    CHECK (revenue_balance_cents >= 0),

  total_spent_cents          INTEGER NOT NULL DEFAULT 0,
  total_earned_cents         INTEGER NOT NULL DEFAULT 0,

  currency                   TEXT NOT NULL DEFAULT 'EUR',
  can_payout                 BOOLEAN NOT NULL DEFAULT false,
  auto_topup_enabled         BOOLEAN NOT NULL DEFAULT false,
  auto_topup_threshold_cents INTEGER DEFAULT 0,
  auto_topup_amount_cents    INTEGER DEFAULT 0,

  created_at                 TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                 TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE marketplace.wallets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "wallet_owner_select" ON marketplace.wallets FOR SELECT
  USING (auth.uid()::text = owner_id::text);
CREATE POLICY "wallet_service" ON marketplace.wallets FOR ALL
  TO service_role USING (true);
```

---

## 2. marketplace.wallet_transactions

```sql
CREATE TABLE marketplace.wallet_transactions (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  from_wallet_id      UUID REFERENCES marketplace.wallets(id),
  to_wallet_id        UUID REFERENCES marketplace.wallets(id),

  gross_amount_cents  INTEGER NOT NULL,
  fee_cents           INTEGER NOT NULL DEFAULT 0,
  net_amount_cents    INTEGER NOT NULL,

  from_balance_type   TEXT DEFAULT 'voucher'
    CHECK (from_balance_type IN ('voucher','revenue')),
  to_balance_type     TEXT DEFAULT 'voucher'
    CHECK (to_balance_type IN ('voucher','revenue')),

  type                TEXT NOT NULL
    CHECK (type IN ('subscription_credit','topup','purchase','payout','bonus',
                    'refund','ai_usage','promotion_payment','revenue_credit')),
  reference_type      TEXT,
  reference_id        UUID,

  stripe_payment_id   TEXT,
  description         TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_wt_from ON marketplace.wallet_transactions(from_wallet_id, created_at DESC);
CREATE INDEX idx_wt_to   ON marketplace.wallet_transactions(to_wallet_id, created_at DESC);
CREATE INDEX idx_wt_type ON marketplace.wallet_transactions(type, created_at DESC);

ALTER TABLE marketplace.wallet_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "wt_owner" ON marketplace.wallet_transactions FOR SELECT
  USING (
    from_wallet_id IN (SELECT id FROM marketplace.wallets WHERE owner_id = auth.uid()) OR
    to_wallet_id   IN (SELECT id FROM marketplace.wallets WHERE owner_id = auth.uid())
  );
```

---

## 3. marketplace.subscription_plans

```sql
CREATE TABLE marketplace.subscription_plans (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                 TEXT NOT NULL,
  price_cents          INTEGER NOT NULL,
  wallet_credit_cents  INTEGER NOT NULL,
  billing_interval     TEXT DEFAULT 'month'
    CHECK (billing_interval IN ('month','year')),
  features             JSONB DEFAULT '{}',
  ai_credits_included  INTEGER DEFAULT 0,
  is_active            BOOLEAN DEFAULT true,
  stripe_price_id      TEXT,
  sort_order           INTEGER DEFAULT 0,
  created_at           TIMESTAMPTZ DEFAULT now()
);
```

---

## 4. marketplace.creators

```sql
CREATE TABLE marketplace.creators (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              UUID NOT NULL UNIQUE,
  creator_type         TEXT NOT NULL
    CHECK (creator_type IN ('coach','influencer','brand','nutritionist','gym')),
  display_name         TEXT NOT NULL,
  bio                  TEXT,
  avatar_url           TEXT,
  certifications       TEXT[] DEFAULT '{}',
  specializations      TEXT[] DEFAULT '{}',
  is_verified          BOOLEAN DEFAULT false,
  verification_level   TEXT DEFAULT 'pending'
    CHECK (verification_level IN ('pending','basic','verified','premium')),
  total_sales          INTEGER DEFAULT 0,
  total_revenue_cents  INTEGER DEFAULT 0,
  avg_product_rating   NUMERIC(3,2),
  revenue_share_pct    INTEGER DEFAULT 80,
  stripe_account_id    TEXT,
  can_create_bundles   BOOLEAN DEFAULT false,
  created_at           TIMESTAMPTZ DEFAULT now(),
  updated_at           TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE marketplace.creators ENABLE ROW LEVEL SECURITY;
CREATE POLICY "creator_owner" ON marketplace.creators FOR ALL
  USING (auth.uid()::text = user_id::text);
CREATE POLICY "creator_public_select" ON marketplace.creators FOR SELECT
  USING (is_verified = true);
```

---

## 5. marketplace.products

```sql
CREATE TABLE marketplace.products (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id            UUID NOT NULL REFERENCES marketplace.creators(id),

  product_type          TEXT NOT NULL
    CHECK (product_type IN ('training_program','meal_plan','supplement_protocol',
                            'recovery_protocol','bundle','ai_persona',
                            'equipment','digital','session')),
  title                 TEXT NOT NULL,
  description           TEXT,
  short_description     TEXT,

  price_cents           INTEGER NOT NULL CHECK (price_cents >= 0),
  compare_price_cents   INTEGER,
  pricing_model         TEXT DEFAULT 'one_time'
    CHECK (pricing_model IN ('one_time','subscription','free')),

  category              TEXT,
  tags                  TEXT[] DEFAULT '{}',
  goal_alignments       TEXT[] DEFAULT '{}',
  difficulty            TEXT
    CHECK (difficulty IN ('beginner','intermediate','advanced',NULL)),
  duration_weeks        INTEGER,
  equipment_required    TEXT[] DEFAULT '{}',

  media_urls            TEXT[] DEFAULT '{}',
  preview_url           TEXT,

  is_active             BOOLEAN DEFAULT true,
  is_verified           BOOLEAN DEFAULT false,
  is_featured           BOOLEAN DEFAULT false,
  is_free               BOOLEAN DEFAULT false,

  avg_rating            NUMERIC(3,2) DEFAULT 0,
  review_count          INTEGER DEFAULT 0,
  purchase_count        INTEGER DEFAULT 0,
  view_count            INTEGER DEFAULT 0,
  search_score          NUMERIC(8,4) DEFAULT 0,

  content               JSONB DEFAULT '{}',

  stripe_product_id     TEXT,
  created_at            TIMESTAMPTZ DEFAULT now(),
  updated_at            TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_prod_type     ON marketplace.products(product_type, is_active);
CREATE INDEX idx_prod_creator  ON marketplace.products(creator_id);
CREATE INDEX idx_prod_score    ON marketplace.products(search_score DESC) WHERE is_active = true;
CREATE INDEX idx_prod_goals    ON marketplace.products USING GIN(goal_alignments);
CREATE INDEX idx_prod_tags     ON marketplace.products USING GIN(tags);
CREATE INDEX idx_prod_fts      ON marketplace.products
  USING GIN(to_tsvector('english', title || ' ' || COALESCE(description, '')));

ALTER TABLE marketplace.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "prod_public" ON marketplace.products FOR SELECT USING (is_active = true);
CREATE POLICY "prod_creator" ON marketplace.products FOR ALL
  USING (creator_id IN (SELECT id FROM marketplace.creators WHERE user_id = auth.uid()));
```

---

## 6. marketplace.product_bundles

```sql
CREATE TABLE marketplace.product_bundles (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bundle_id      UUID NOT NULL REFERENCES marketplace.products(id) ON DELETE CASCADE,
  component_id   UUID NOT NULL REFERENCES marketplace.products(id),
  component_type TEXT NOT NULL,
  sort_order     INTEGER DEFAULT 0,
  UNIQUE (bundle_id, component_id)
);
```

---

## 7. marketplace.orders

```sql
CREATE TABLE marketplace.orders (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id               UUID NOT NULL,
  creator_id             UUID REFERENCES marketplace.creators(id),

  total_cents            INTEGER NOT NULL,
  fee_cents              INTEGER NOT NULL DEFAULT 0,
  creator_revenue_cents  INTEGER NOT NULL DEFAULT 0,

  status                 TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','completed','refunded','disputed','cancelled')),
  payment_method         TEXT DEFAULT 'wallet_voucher'
    CHECK (payment_method IN ('wallet_voucher','wallet_revenue','stripe')),

  purchased_at           TIMESTAMPTZ,
  refunded_at            TIMESTAMPTZ,
  refund_reason          TEXT,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_orders_buyer  ON marketplace.orders(buyer_id, created_at DESC);
CREATE INDEX idx_orders_status ON marketplace.orders(status);

ALTER TABLE marketplace.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "orders_owner" ON marketplace.orders FOR SELECT
  USING (auth.uid()::text = buyer_id::text);
```

---

## 8. marketplace.order_items

```sql
CREATE TABLE marketplace.order_items (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id    UUID NOT NULL REFERENCES marketplace.orders(id) ON DELETE CASCADE,
  product_id  UUID NOT NULL REFERENCES marketplace.products(id),
  price_cents INTEGER NOT NULL,
  quantity    INTEGER DEFAULT 1
);
```

---

## 9. marketplace.product_licenses

```sql
CREATE TABLE marketplace.product_licenses (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id         UUID NOT NULL REFERENCES marketplace.orders(id),
  user_id          UUID NOT NULL,
  product_id       UUID NOT NULL REFERENCES marketplace.products(id),

  license_type     TEXT DEFAULT 'lifetime'
    CHECK (license_type IN ('lifetime','subscription')),
  valid_from       TIMESTAMPTZ NOT NULL DEFAULT now(),
  valid_until      TIMESTAMPTZ,
  is_active        BOOLEAN DEFAULT true,

  delivery_status  TEXT DEFAULT 'pending'
    CHECK (delivery_status IN ('pending','delivered','failed','partial')),
  delivered_at     TIMESTAMPTZ,
  delivery_results JSONB DEFAULT '{}',

  UNIQUE (user_id, product_id)
);

CREATE INDEX idx_lic_user    ON marketplace.product_licenses(user_id, is_active);
CREATE INDEX idx_lic_product ON marketplace.product_licenses(product_id);

ALTER TABLE marketplace.product_licenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "lic_owner" ON marketplace.product_licenses FOR SELECT
  USING (auth.uid()::text = user_id::text);
```

---

## 10. marketplace.product_reviews

```sql
CREATE TABLE marketplace.product_reviews (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id           UUID NOT NULL REFERENCES marketplace.products(id),
  reviewer_id          UUID NOT NULL,
  order_id             UUID NOT NULL REFERENCES marketplace.orders(id),

  rating               INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title                TEXT,
  content              TEXT,
  helpful_votes        INTEGER DEFAULT 0,
  unhelpful_votes      INTEGER DEFAULT 0,

  creator_response     TEXT,
  creator_responded_at TIMESTAMPTZ,

  is_verified          BOOLEAN DEFAULT true,
  is_visible           BOOLEAN DEFAULT true,
  created_at           TIMESTAMPTZ DEFAULT now(),

  UNIQUE (product_id, reviewer_id)
);

CREATE INDEX idx_rev_product ON marketplace.product_reviews(product_id, is_visible);
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

CREATE INDEX idx_promo_active ON marketplace.promotion_slots(ends_at)
  WHERE is_active = true;
```

---

## 12. Triggers — Rating Aggregation

```sql
CREATE OR REPLACE FUNCTION marketplace.update_product_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE marketplace.products
  SET avg_rating    = (SELECT ROUND(AVG(rating)::NUMERIC, 2) FROM marketplace.product_reviews
                       WHERE product_id = NEW.product_id AND is_visible = true),
      review_count  = (SELECT COUNT(*) FROM marketplace.product_reviews
                       WHERE product_id = NEW.product_id AND is_visible = true),
      updated_at    = now()
  WHERE id = NEW.product_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_rating
  AFTER INSERT OR UPDATE OR DELETE ON marketplace.product_reviews
  FOR EACH ROW EXECUTE FUNCTION marketplace.update_product_rating();
```

---

## Grants

```sql
GRANT USAGE ON SCHEMA marketplace TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA marketplace TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA marketplace TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA marketplace TO authenticated, service_role;
```
