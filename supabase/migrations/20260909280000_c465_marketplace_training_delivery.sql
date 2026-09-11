BEGIN;

CREATE TABLE marketplace.delivery_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  license_id uuid NOT NULL UNIQUE REFERENCES marketplace.product_licenses(id) ON DELETE RESTRICT,
  program_id uuid NOT NULL REFERENCES training.programs(id) ON DELETE RESTRICT,
  program_assignment_id uuid NOT NULL UNIQUE REFERENCES training.program_assignments(id) ON DELETE RESTRICT,
  revoked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX delivery_results_license_idx ON marketplace.delivery_results(license_id);
ALTER TABLE marketplace.delivery_results ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON marketplace.delivery_results TO authenticated;
GRANT ALL ON marketplace.delivery_results TO service_role;
CREATE POLICY delivery_results_select_own ON marketplace.delivery_results FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM marketplace.product_licenses l WHERE l.id=license_id AND l.user_id=(SELECT auth.uid())));

CREATE FUNCTION marketplace.create_training_program_purchase(p_buyer_id uuid, p_product_id uuid, p_fee_cents integer)
RETURNS TABLE(order_id uuid, order_item_id uuid, license_id uuid)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, pg_temp AS $$
DECLARE p marketplace.products%ROWTYPE; o uuid; i uuid; l uuid; fee integer;
BEGIN
  SELECT * INTO p FROM marketplace.products WHERE id=p_product_id AND is_active FOR SHARE;
  IF NOT FOUND OR p.product_type <> 'training_program' THEN RAISE EXCEPTION 'only active training_program products are deliverable' USING ERRCODE='22023'; END IF;
  IF p.duration_weeks IS NULL OR p.duration_weeks < 1 OR jsonb_typeof(p.content->'routine') <> 'object' OR coalesce(nullif(btrim(p.content->'routine'->>'name'),''),'')='' THEN RAISE EXCEPTION 'training program needs duration and routine payload' USING ERRCODE='22023'; END IF;
  fee := coalesce(p_fee_cents,0); IF fee < 0 OR fee > p.price_cents THEN RAISE EXCEPTION 'invalid fee' USING ERRCODE='22023'; END IF;
  INSERT INTO marketplace.orders(buyer_id,creator_id,total_cents,fee_cents,creator_revenue_cents,status,purchased_at) VALUES(p_buyer_id,p.creator_id,p.price_cents,fee,p.price_cents-fee,'completed',now()) RETURNING id INTO o;
  INSERT INTO marketplace.order_items(order_id,product_id,price_cents) VALUES(o,p.id,p.price_cents) RETURNING id INTO i;
  INSERT INTO marketplace.product_licenses(order_id,user_id,product_id,delivery_status) VALUES(o,p_buyer_id,p.id,'pending') RETURNING id INTO l;
  RETURN QUERY SELECT o,i,l;
END $$;

CREATE FUNCTION marketplace.deliver_training_program(p_license_id uuid)
RETURNS TABLE(assignment_id uuid)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, pg_temp AS $$
DECLARE l marketplace.product_licenses%ROWTYPE; p marketplace.products%ROWTYPE; r uuid; pr uuid; a uuid;
BEGIN
  SELECT * INTO l FROM marketplace.product_licenses WHERE id=p_license_id FOR UPDATE;
  IF NOT FOUND OR NOT l.is_active THEN RAISE EXCEPTION 'active license required' USING ERRCODE='22023'; END IF;
  SELECT dr.program_assignment_id INTO a FROM marketplace.delivery_results dr WHERE dr.license_id=l.id;
  IF FOUND THEN RETURN QUERY SELECT a; RETURN; END IF;
  SELECT * INTO p FROM marketplace.products WHERE id=l.product_id;
  IF p.product_type <> 'training_program' THEN RAISE EXCEPTION 'license is not a training program' USING ERRCODE='22023'; END IF;
  INSERT INTO training.routines(user_id,source,name,description,days_per_week) VALUES(l.user_id,'marketplace',p.content->'routine'->>'name',p.content->'routine'->>'description',nullif(p.content->'routine'->>'days_per_week','')::smallint) RETURNING id INTO r;
  INSERT INTO training.programs(user_id,source,name,description,duration_weeks) VALUES(l.user_id,'marketplace',p.title,p.description,p.duration_weeks) RETURNING id INTO pr;
  INSERT INTO training.program_days(program_id,routine_id,week_number,day_of_week,label) VALUES(pr,r,1,0,p.content->'routine'->>'name');
  INSERT INTO training.program_assignments(program_id,user_id,status,confirmed_at,started_at) VALUES(pr,l.user_id,'running',now(),current_date) RETURNING id INTO a;
  INSERT INTO marketplace.delivery_results(license_id,program_id,program_assignment_id) VALUES(l.id,pr,a);
  UPDATE marketplace.product_licenses SET delivery_status='delivered',delivered_at=now(),delivery_results=jsonb_build_object('training_program_assignment_id',a) WHERE id=l.id;
  RETURN QUERY SELECT a;
END $$;

CREATE FUNCTION marketplace.revoke_training_program_license(p_license_id uuid) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, pg_temp AS $$
DECLARE a uuid;
BEGIN
  UPDATE marketplace.product_licenses SET is_active=false WHERE id=p_license_id AND is_active;
  SELECT program_assignment_id INTO a FROM marketplace.delivery_results WHERE license_id=p_license_id;
  IF a IS NOT NULL THEN UPDATE training.program_assignments SET status='ended',ended_at=current_date WHERE id=a AND status <> 'ended'; UPDATE marketplace.delivery_results SET revoked_at=coalesce(revoked_at,now()) WHERE license_id=p_license_id; END IF;
END $$;
REVOKE ALL ON FUNCTION marketplace.create_training_program_purchase(uuid,uuid,integer), marketplace.deliver_training_program(uuid), marketplace.revoke_training_program_license(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION marketplace.create_training_program_purchase(uuid,uuid,integer), marketplace.deliver_training_program(uuid), marketplace.revoke_training_program_license(uuid) TO service_role;
COMMIT;
