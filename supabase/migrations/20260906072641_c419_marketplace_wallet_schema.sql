-- C-419: Marketplace-Wallet und Katalogstruktur. Buchungen und Katalogdaten
-- liegen absichtlich im registrierten Kettenschritt 419, nie in der Migration.
BEGIN;

CREATE SCHEMA IF NOT EXISTS marketplace;

CREATE TABLE marketplace.wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  owner_type TEXT NOT NULL CHECK (owner_type IN ('user', 'creator', 'gym', 'vendor', 'brand')),
  voucher_balance_cents INTEGER NOT NULL DEFAULT 0 CHECK (voucher_balance_cents >= 0),
  revenue_balance_cents INTEGER NOT NULL DEFAULT 0 CHECK (revenue_balance_cents >= 0),
  voucher_expires_at TIMESTAMPTZ,
  currency TEXT NOT NULL DEFAULT 'EUR' CHECK (currency = 'EUR'),
  stripe_customer_id TEXT,
  stripe_connect_account_id TEXT,
  can_payout BOOLEAN NOT NULL DEFAULT false,
  auto_topup_enabled BOOLEAN NOT NULL DEFAULT false,
  auto_topup_threshold_cents INTEGER NOT NULL DEFAULT 0 CHECK (auto_topup_threshold_cents >= 0),
  auto_topup_amount_cents INTEGER NOT NULL DEFAULT 0 CHECK (auto_topup_amount_cents >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK ((owner_type IN ('creator', 'gym', 'vendor', 'brand')) = can_payout),
  CHECK (owner_type = 'user' OR revenue_balance_cents >= 0),
  CHECK (owner_type <> 'user' OR revenue_balance_cents = 0),
  CHECK (owner_type IN ('user', 'creator') OR voucher_balance_cents = 0)
);

CREATE TABLE marketplace.wallet_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_group_id UUID NOT NULL,
  from_wallet_id UUID REFERENCES marketplace.wallets(id) ON DELETE RESTRICT,
  to_wallet_id UUID REFERENCES marketplace.wallets(id) ON DELETE RESTRICT,
  gross_amount_cents INTEGER NOT NULL CHECK (gross_amount_cents > 0),
  fee_cents INTEGER NOT NULL DEFAULT 0 CHECK (fee_cents >= 0),
  net_amount_cents INTEGER NOT NULL CHECK (net_amount_cents >= 0),
  from_balance_type TEXT CHECK (from_balance_type IN ('voucher', 'revenue')),
  to_balance_type TEXT CHECK (to_balance_type IN ('voucher', 'revenue')),
  type TEXT NOT NULL CHECK (type IN ('subscription_credit', 'topup', 'purchase', 'payout', 'bonus', 'refund', 'ai_usage', 'promotion_payment', 'revenue_credit')),
  reference_type TEXT,
  reference_id UUID,
  stripe_payment_id TEXT,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (net_amount_cents + fee_cents = gross_amount_cents),
  CHECK (from_wallet_id IS NOT NULL OR to_wallet_id IS NOT NULL)
);
CREATE INDEX wallet_transactions_from_created_at_idx ON marketplace.wallet_transactions(from_wallet_id, created_at DESC);
CREATE INDEX wallet_transactions_to_created_at_idx ON marketplace.wallet_transactions(to_wallet_id, created_at DESC);
CREATE INDEX wallet_transactions_type_created_at_idx ON marketplace.wallet_transactions(type, created_at DESC);
CREATE INDEX wallet_transactions_group_idx ON marketplace.wallet_transactions(transaction_group_id);

CREATE TABLE marketplace.subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  price_cents INTEGER NOT NULL CHECK (price_cents >= 0),
  wallet_credit_cents INTEGER NOT NULL CHECK (wallet_credit_cents >= 0),
  billing_interval TEXT NOT NULL DEFAULT 'month' CHECK (billing_interval IN ('month', 'year')),
  features JSONB NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(features) = 'object'),
  ai_credits_included INTEGER NOT NULL DEFAULT 0 CHECK (ai_credits_included >= 0),
  is_active BOOLEAN NOT NULL DEFAULT true,
  stripe_price_id TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE marketplace.creators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  creator_type TEXT NOT NULL CHECK (creator_type IN ('coach', 'influencer', 'brand', 'nutritionist', 'gym')),
  display_name TEXT NOT NULL CHECK (btrim(display_name) <> ''),
  bio TEXT,
  avatar_url TEXT,
  certifications TEXT[] NOT NULL DEFAULT '{}',
  specialties TEXT[] NOT NULL DEFAULT '{}',
  is_verified BOOLEAN NOT NULL DEFAULT false,
  verification_level TEXT NOT NULL DEFAULT 'pending' CHECK (verification_level IN ('pending', 'basic', 'verified', 'premium')),
  total_sales INTEGER NOT NULL DEFAULT 0 CHECK (total_sales >= 0),
  total_revenue_cents INTEGER NOT NULL DEFAULT 0 CHECK (total_revenue_cents >= 0),
  avg_product_rating NUMERIC(3, 2),
  revenue_share_pct INTEGER NOT NULL DEFAULT 80 CHECK (revenue_share_pct BETWEEN 0 AND 100),
  stripe_account_id TEXT,
  can_create_bundles BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE marketplace.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES marketplace.creators(id) ON DELETE RESTRICT,
  product_type TEXT NOT NULL CHECK (product_type IN ('training_program', 'meal_plan', 'supplement_protocol', 'recovery_protocol', 'bundle', 'ai_persona', 'equipment', 'digital', 'session')),
  title TEXT NOT NULL CHECK (btrim(title) <> ''),
  description TEXT,
  short_description TEXT,
  cover_image_url TEXT,
  preview_images TEXT[] NOT NULL DEFAULT '{}',
  price_cents INTEGER NOT NULL CHECK (price_cents >= 0),
  compare_at_price_cents INTEGER CHECK (compare_at_price_cents IS NULL OR compare_at_price_cents >= price_cents),
  currency TEXT NOT NULL DEFAULT 'EUR' CHECK (currency = 'EUR'),
  pricing_model TEXT NOT NULL DEFAULT 'one_time' CHECK (pricing_model IN ('one_time', 'subscription', 'free')),
  subscription_interval TEXT CHECK (subscription_interval IS NULL OR subscription_interval IN ('month', 'year')),
  difficulty TEXT CHECK (difficulty IS NULL OR difficulty IN ('beginner', 'intermediate', 'advanced')),
  duration_weeks INTEGER CHECK (duration_weeks IS NULL OR duration_weeks > 0),
  equipment TEXT[] NOT NULL DEFAULT '{}',
  goal_alignments TEXT[] NOT NULL DEFAULT '{}',
  tags TEXT[] NOT NULL DEFAULT '{}',
  language TEXT NOT NULL DEFAULT 'de' CHECK (language IN ('de', 'en', 'th')),
  is_active BOOLEAN NOT NULL DEFAULT false,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  search_score NUMERIC NOT NULL DEFAULT 0,
  purchase_count INTEGER NOT NULL DEFAULT 0 CHECK (purchase_count >= 0),
  view_count INTEGER NOT NULL DEFAULT 0 CHECK (view_count >= 0),
  avg_rating NUMERIC(3, 2),
  review_count INTEGER NOT NULL DEFAULT 0 CHECK (review_count >= 0),
  content JSONB NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(content) = 'object'),
  stripe_product_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX products_type_active_idx ON marketplace.products(product_type, is_active);
CREATE INDEX products_creator_idx ON marketplace.products(creator_id);
CREATE INDEX products_score_idx ON marketplace.products(search_score DESC) WHERE is_active;
CREATE INDEX products_goals_idx ON marketplace.products USING GIN(goal_alignments);
CREATE INDEX products_tags_idx ON marketplace.products USING GIN(tags);
CREATE INDEX products_fts_idx ON marketplace.products USING GIN(to_tsvector('english', title || ' ' || COALESCE(description, '')));

CREATE TABLE marketplace.product_bundles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bundle_id UUID NOT NULL REFERENCES marketplace.products(id) ON DELETE CASCADE,
  component_id UUID NOT NULL REFERENCES marketplace.products(id) ON DELETE RESTRICT,
  component_type TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  UNIQUE (bundle_id, component_id),
  CHECK (bundle_id <> component_id)
);

CREATE TABLE marketplace.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  creator_id UUID REFERENCES marketplace.creators(id) ON DELETE RESTRICT,
  total_cents INTEGER NOT NULL CHECK (total_cents >= 0),
  fee_cents INTEGER NOT NULL DEFAULT 0 CHECK (fee_cents >= 0),
  creator_revenue_cents INTEGER NOT NULL DEFAULT 0 CHECK (creator_revenue_cents >= 0),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'refunded', 'disputed', 'cancelled')),
  payment_method TEXT NOT NULL DEFAULT 'wallet_voucher' CHECK (payment_method IN ('wallet_voucher', 'wallet_revenue', 'stripe')),
  purchased_at TIMESTAMPTZ,
  refunded_at TIMESTAMPTZ,
  refund_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (fee_cents + creator_revenue_cents = total_cents)
);
CREATE INDEX orders_buyer_created_at_idx ON marketplace.orders(buyer_id, created_at DESC);
CREATE INDEX orders_creator_created_at_idx ON marketplace.orders(creator_id, created_at DESC);
CREATE INDEX orders_status_idx ON marketplace.orders(status);

CREATE TABLE marketplace.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES marketplace.orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES marketplace.products(id) ON DELETE RESTRICT,
  price_cents INTEGER NOT NULL CHECK (price_cents >= 0),
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0)
);

CREATE TABLE marketplace.product_licenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES marketplace.orders(id) ON DELETE RESTRICT,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES marketplace.products(id) ON DELETE RESTRICT,
  license_type TEXT NOT NULL DEFAULT 'lifetime' CHECK (license_type IN ('lifetime', 'subscription')),
  valid_from TIMESTAMPTZ NOT NULL DEFAULT now(),
  valid_until TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  delivery_status TEXT NOT NULL DEFAULT 'pending' CHECK (delivery_status IN ('pending', 'delivered', 'failed', 'partial')),
  delivered_at TIMESTAMPTZ,
  delivery_results JSONB NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(delivery_results) = 'object'),
  UNIQUE (user_id, product_id),
  CHECK (valid_until IS NULL OR valid_until >= valid_from)
);
CREATE INDEX product_licenses_user_active_idx ON marketplace.product_licenses(user_id, is_active);
CREATE INDEX product_licenses_product_idx ON marketplace.product_licenses(product_id);

CREATE TABLE marketplace.product_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES marketplace.products(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES marketplace.orders(id) ON DELETE RESTRICT,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title TEXT,
  content TEXT,
  helpful_votes INTEGER NOT NULL DEFAULT 0 CHECK (helpful_votes >= 0),
  unhelpful_votes INTEGER NOT NULL DEFAULT 0 CHECK (unhelpful_votes >= 0),
  creator_response TEXT,
  responded_at TIMESTAMPTZ,
  is_verified BOOLEAN NOT NULL DEFAULT true,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (product_id, reviewer_id),
  CHECK ((creator_response IS NULL) = (responded_at IS NULL))
);
CREATE INDEX product_reviews_product_visible_idx ON marketplace.product_reviews(product_id, is_visible);

CREATE TABLE marketplace.promotion_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES marketplace.products(id) ON DELETE CASCADE,
  creator_id UUID NOT NULL REFERENCES marketplace.creators(id) ON DELETE RESTRICT,
  slot_type TEXT NOT NULL CHECK (slot_type IN ('daily_boost', 'weekly_boost', 'category_feature', 'homepage')),
  category TEXT,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  cost_cents INTEGER NOT NULL CHECK (cost_cents >= 0),
  impressions INTEGER NOT NULL DEFAULT 0 CHECK (impressions >= 0),
  clicks INTEGER NOT NULL DEFAULT 0 CHECK (clicks >= 0),
  conversions INTEGER NOT NULL DEFAULT 0 CHECK (conversions >= 0),
  is_active BOOLEAN NOT NULL DEFAULT true,
  CHECK (ends_at > starts_at)
);
CREATE INDEX promotion_slots_active_idx ON marketplace.promotion_slots(ends_at) WHERE is_active;

CREATE TABLE marketplace.fee_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_family TEXT NOT NULL CHECK (product_family IN ('digital', 'physical', 'session')),
  acquisition_channel TEXT NOT NULL CHECK (acquisition_channel IN ('discovery', 'coach', 'promoted')),
  fee_bps INTEGER NOT NULL CHECK (fee_bps BETWEEN 0 AND 10000),
  is_active BOOLEAN NOT NULL DEFAULT true,
  UNIQUE (product_family, acquisition_channel)
);

CREATE TABLE marketplace.promotion_slot_catalog (
  slot_type TEXT PRIMARY KEY CHECK (slot_type IN ('daily_boost', 'weekly_boost', 'category_feature', 'homepage')),
  price_cents INTEGER NOT NULL CHECK (price_cents >= 0),
  duration_hours INTEGER NOT NULL CHECK (duration_hours > 0),
  is_active BOOLEAN NOT NULL DEFAULT true
);

ALTER TABLE marketplace.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace.wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace.creators ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace.product_bundles ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace.product_licenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace.product_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace.promotion_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace.fee_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace.promotion_slot_catalog ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON ALL TABLES IN SCHEMA marketplace FROM PUBLIC, anon, authenticated;
GRANT USAGE ON SCHEMA marketplace TO authenticated, service_role;
GRANT SELECT ON ALL TABLES IN SCHEMA marketplace TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA marketplace TO service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA marketplace TO service_role;

CREATE POLICY wallets_select_own ON marketplace.wallets FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = owner_id);
CREATE POLICY wallet_transactions_select_own ON marketplace.wallet_transactions FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM marketplace.wallets w WHERE w.id = from_wallet_id AND w.owner_id = (SELECT auth.uid()))
    OR EXISTS (SELECT 1 FROM marketplace.wallets w WHERE w.id = to_wallet_id AND w.owner_id = (SELECT auth.uid()))
  );
CREATE POLICY subscription_plans_select_active ON marketplace.subscription_plans FOR SELECT TO authenticated USING (is_active);
CREATE POLICY creators_select_public_or_own ON marketplace.creators FOR SELECT TO authenticated
  USING (is_verified OR user_id = (SELECT auth.uid()));
CREATE POLICY products_select_public_or_own ON marketplace.products FOR SELECT TO authenticated
  USING (is_active OR EXISTS (SELECT 1 FROM marketplace.creators c WHERE c.id = creator_id AND c.user_id = (SELECT auth.uid())));
CREATE POLICY product_bundles_select_visible ON marketplace.product_bundles FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM marketplace.products p WHERE p.id = bundle_id AND p.is_active));
CREATE POLICY orders_select_buyer_or_creator ON marketplace.orders FOR SELECT TO authenticated
  USING (buyer_id = (SELECT auth.uid()) OR EXISTS (SELECT 1 FROM marketplace.creators c WHERE c.id = creator_id AND c.user_id = (SELECT auth.uid())));
CREATE POLICY order_items_select_order_party ON marketplace.order_items FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM marketplace.orders o WHERE o.id = order_id AND (o.buyer_id = (SELECT auth.uid()) OR EXISTS (SELECT 1 FROM marketplace.creators c WHERE c.id = o.creator_id AND c.user_id = (SELECT auth.uid())))));
CREATE POLICY product_licenses_select_own ON marketplace.product_licenses FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));
CREATE POLICY product_reviews_select_visible_or_own ON marketplace.product_reviews FOR SELECT TO authenticated
  USING (is_visible OR reviewer_id = (SELECT auth.uid()));
CREATE POLICY promotion_slots_select_active_or_own ON marketplace.promotion_slots FOR SELECT TO authenticated
  USING (is_active OR EXISTS (SELECT 1 FROM marketplace.creators c WHERE c.id = creator_id AND c.user_id = (SELECT auth.uid())));
CREATE POLICY fee_schedules_select_active ON marketplace.fee_schedules FOR SELECT TO authenticated USING (is_active);
CREATE POLICY promotion_slot_catalog_select_active ON marketplace.promotion_slot_catalog FOR SELECT TO authenticated USING (is_active);

COMMENT ON TABLE marketplace.wallets IS 'C-419: Voucher ist nicht auszahlbar und verfaellt; Revenue ist nur fuer Creator und B2B auszahlbar.';
COMMENT ON TABLE marketplace.wallet_transactions IS 'C-419: Unveraenderbares Buchungsjournal. Mehrere Zeilen einer atomaren Buchung tragen dieselbe transaction_group_id.';

COMMIT;
