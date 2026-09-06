-- C-419: Katalogwerte und der einzige Buchungsweg entstehen im Pipelinezustand.
-- Eine fehlgeschlagene Buchung wirft eine Ausnahme; PostgreSQL rollt alle bis
-- dahin gemachten Zeilenaenderungen derselben Funktionsausfuehrung zurueck.
BEGIN;

INSERT INTO marketplace.subscription_plans (name, price_cents, wallet_credit_cents, ai_credits_included, features, sort_order)
VALUES
  ('Lumeos Basic', 999, 999, 20, '{"modules":"all","support":"standard"}'::jsonb, 10),
  ('Lumeos Plus', 1999, 1999, 50, '{"modules":"all","support":"priority"}'::jsonb, 20),
  ('Lumeos Pro', 2999, 2999, 100, '{"modules":"all","support":"priority","coach_tools":true}'::jsonb, 30)
ON CONFLICT (name) DO NOTHING;

INSERT INTO marketplace.fee_schedules (product_family, acquisition_channel, fee_bps)
VALUES
  ('digital', 'discovery', 2000), ('digital', 'coach', 1000), ('digital', 'promoted', 2500),
  ('physical', 'discovery', 1500), ('physical', 'coach', 800),
  ('session', 'discovery', 2000), ('session', 'coach', 1000)
ON CONFLICT (product_family, acquisition_channel) DO NOTHING;

INSERT INTO marketplace.promotion_slot_catalog (slot_type, price_cents, duration_hours)
VALUES
  ('daily_boost', 999, 24), ('weekly_boost', 4999, 168),
  ('category_feature', 9999, 168), ('homepage', 24999, 168)
ON CONFLICT (slot_type) DO NOTHING;

CREATE OR REPLACE FUNCTION marketplace.touch_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $function$
BEGIN
  NEW.updated_at := statement_timestamp();
  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS wallets_touch_updated_at ON marketplace.wallets;
DROP TRIGGER IF EXISTS creators_touch_updated_at ON marketplace.creators;
DROP TRIGGER IF EXISTS products_touch_updated_at ON marketplace.products;
CREATE TRIGGER wallets_touch_updated_at BEFORE UPDATE ON marketplace.wallets
  FOR EACH ROW EXECUTE FUNCTION marketplace.touch_updated_at();
CREATE TRIGGER creators_touch_updated_at BEFORE UPDATE ON marketplace.creators
  FOR EACH ROW EXECUTE FUNCTION marketplace.touch_updated_at();
CREATE TRIGGER products_touch_updated_at BEFORE UPDATE ON marketplace.products
  FOR EACH ROW EXECUTE FUNCTION marketplace.touch_updated_at();

CREATE OR REPLACE FUNCTION marketplace.update_product_rating()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $function$
DECLARE
  v_product_id uuid := COALESCE(NEW.product_id, OLD.product_id);
BEGIN
  UPDATE marketplace.products p
  SET avg_rating = (SELECT round(avg(r.rating)::numeric, 2) FROM marketplace.product_reviews r WHERE r.product_id = v_product_id AND r.is_visible),
      review_count = (SELECT count(*) FROM marketplace.product_reviews r WHERE r.product_id = v_product_id AND r.is_visible),
      updated_at = statement_timestamp()
  WHERE p.id = v_product_id;
  RETURN COALESCE(NEW, OLD);
END;
$function$;
DROP TRIGGER IF EXISTS product_reviews_update_rating ON marketplace.product_reviews;
CREATE TRIGGER product_reviews_update_rating
  AFTER INSERT OR UPDATE OR DELETE ON marketplace.product_reviews
  FOR EACH ROW EXECUTE FUNCTION marketplace.update_product_rating();

CREATE OR REPLACE FUNCTION marketplace.book_wallet_purchase(
  p_buyer_wallet_id uuid,
  p_seller_wallet_id uuid,
  p_gross_amount_cents integer,
  p_product_family text,
  p_acquisition_channel text,
  p_reference_type text DEFAULT NULL,
  p_reference_id uuid DEFAULT NULL,
  p_description text DEFAULT NULL
)
RETURNS TABLE (transaction_group_id uuid, voucher_debit_cents integer, revenue_debit_cents integer, fee_cents integer, seller_revenue_cents integer)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $function$
DECLARE
  v_buyer marketplace.wallets%ROWTYPE;
  v_seller marketplace.wallets%ROWTYPE;
  v_fee_bps integer;
  v_group_id uuid := gen_random_uuid();
  v_voucher_debit integer;
  v_revenue_debit integer;
  v_fee integer;
  v_seller_revenue integer;
BEGIN
  IF p_buyer_wallet_id IS NULL OR p_seller_wallet_id IS NULL OR p_buyer_wallet_id = p_seller_wallet_id THEN
    RAISE EXCEPTION 'wallet purchase needs two different wallets' USING ERRCODE = '22023';
  END IF;
  IF p_gross_amount_cents IS NULL OR p_gross_amount_cents <= 0 THEN
    RAISE EXCEPTION 'gross amount must be positive' USING ERRCODE = '22023';
  END IF;

  -- Deterministische Sperrreihenfolge verhindert gegeneinander laufende Kauefe.
  PERFORM 1 FROM marketplace.wallets w
  WHERE w.id IN (p_buyer_wallet_id, p_seller_wallet_id)
  ORDER BY w.id FOR UPDATE;

  SELECT * INTO v_buyer FROM marketplace.wallets WHERE id = p_buyer_wallet_id;
  SELECT * INTO v_seller FROM marketplace.wallets WHERE id = p_seller_wallet_id;
  IF NOT FOUND OR v_buyer.id IS NULL OR v_seller.id IS NULL THEN
    RAISE EXCEPTION 'wallet not found' USING ERRCODE = 'P0002';
  END IF;
  IF v_seller.owner_type = 'user' THEN
    RAISE EXCEPTION 'a user wallet cannot receive revenue' USING ERRCODE = '22023';
  END IF;
  IF v_buyer.voucher_balance_cents + v_buyer.revenue_balance_cents < p_gross_amount_cents THEN
    RAISE EXCEPTION 'insufficient wallet balance' USING ERRCODE = '22003';
  END IF;

  SELECT fee_bps INTO v_fee_bps
  FROM marketplace.fee_schedules
  WHERE product_family = p_product_family AND acquisition_channel = p_acquisition_channel AND is_active;
  IF v_fee_bps IS NULL THEN
    RAISE EXCEPTION 'no active fee schedule for %/%', p_product_family, p_acquisition_channel USING ERRCODE = '22023';
  END IF;

  -- Das ist die feste Ausgabeordnung: Voucher wird vollstaendig vor Revenue verbraucht.
  v_voucher_debit := LEAST(v_buyer.voucher_balance_cents, p_gross_amount_cents);
  v_revenue_debit := p_gross_amount_cents - v_voucher_debit;
  v_fee := round(p_gross_amount_cents * v_fee_bps / 10000.0)::integer;
  v_seller_revenue := p_gross_amount_cents - v_fee;

  UPDATE marketplace.wallets
  SET voucher_balance_cents = voucher_balance_cents - v_voucher_debit,
      revenue_balance_cents = revenue_balance_cents - v_revenue_debit
  WHERE id = v_buyer.id;
  UPDATE marketplace.wallets
  SET revenue_balance_cents = revenue_balance_cents + v_seller_revenue
  WHERE id = v_seller.id;

  IF v_voucher_debit > 0 THEN
    INSERT INTO marketplace.wallet_transactions (
      transaction_group_id, from_wallet_id, to_wallet_id, gross_amount_cents, fee_cents, net_amount_cents,
      from_balance_type, to_balance_type, type, reference_type, reference_id, description
    ) VALUES (
      v_group_id, v_buyer.id, v_seller.id, v_voucher_debit,
      round(v_fee * v_voucher_debit::numeric / p_gross_amount_cents)::integer,
      v_voucher_debit - round(v_fee * v_voucher_debit::numeric / p_gross_amount_cents)::integer,
      'voucher', 'revenue', 'purchase', p_reference_type, p_reference_id, p_description
    );
  END IF;
  IF v_revenue_debit > 0 THEN
    INSERT INTO marketplace.wallet_transactions (
      transaction_group_id, from_wallet_id, to_wallet_id, gross_amount_cents, fee_cents, net_amount_cents,
      from_balance_type, to_balance_type, type, reference_type, reference_id, description
    ) VALUES (
      v_group_id, v_buyer.id, v_seller.id, v_revenue_debit,
      v_fee - COALESCE((SELECT sum(wt.fee_cents)::integer FROM marketplace.wallet_transactions wt WHERE wt.transaction_group_id = v_group_id), 0),
      v_revenue_debit - (v_fee - COALESCE((SELECT sum(wt.fee_cents)::integer FROM marketplace.wallet_transactions wt WHERE wt.transaction_group_id = v_group_id), 0)),
      'revenue', 'revenue', 'purchase', p_reference_type, p_reference_id, p_description
    );
  END IF;

  RETURN QUERY SELECT v_group_id, v_voucher_debit, v_revenue_debit, v_fee, v_seller_revenue;
END;
$function$;

REVOKE ALL ON FUNCTION marketplace.touch_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION marketplace.update_product_rating() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION marketplace.book_wallet_purchase(uuid, uuid, integer, text, text, text, uuid, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION marketplace.book_wallet_purchase(uuid, uuid, integer, text, text, text, uuid, text) TO service_role;

COMMENT ON FUNCTION marketplace.book_wallet_purchase(uuid, uuid, integer, text, text, text, uuid, text) IS
  'C-419: Atomare Server-Buchung. Voucher zuerst, dann Revenue; Journal und beide Walletstaende aendern sich gemeinsam oder gar nicht.';

COMMIT;
