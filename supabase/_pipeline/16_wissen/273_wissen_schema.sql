\set ON_ERROR_STOP on

BEGIN;

CREATE SCHEMA IF NOT EXISTS wissen;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE OR REPLACE FUNCTION wissen.touch_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END $$;

CREATE TABLE IF NOT EXISTS wissen.rule_engine_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_id text NOT NULL UNIQUE,
  rule_type text NOT NULL,
  message_key text,
  effect text,
  condition_paths text[] NOT NULL DEFAULT '{}',
  substance_ids text[] NOT NULL DEFAULT '{}',
  source_file text NOT NULL,
  raw jsonb NOT NULL,
  source text NOT NULL DEFAULT 'kimi:c273',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS wissen.rule_engine_field_specs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_key text NOT NULL,
  field_path text NOT NULL,
  raw jsonb NOT NULL,
  source_file text NOT NULL,
  source text NOT NULL DEFAULT 'kimi:c273',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (module_key, field_path)
);

CREATE TABLE IF NOT EXISTS wissen.rule_trait_mappings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mapping_scope text NOT NULL,
  source_key text NOT NULL,
  rule_trait text NOT NULL,
  raw jsonb NOT NULL,
  source_file text NOT NULL,
  source text NOT NULL DEFAULT 'kimi:c273',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (mapping_scope, source_key, rule_trait)
);

CREATE TABLE IF NOT EXISTS wissen.evidence_register_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  registry_name text NOT NULL,
  entry_key text NOT NULL,
  current_value jsonb,
  raw jsonb NOT NULL,
  source_file text NOT NULL,
  source text NOT NULL DEFAULT 'kimi:c273',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (registry_name, entry_key)
);

CREATE TABLE IF NOT EXISTS wissen.knowledge_gap_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dataset text NOT NULL,
  record_key text NOT NULL,
  gap_id text,
  field_path text,
  terminal_status text,
  hold_category text,
  raw jsonb NOT NULL,
  source_file text NOT NULL,
  source text NOT NULL DEFAULT 'kimi:c273',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (dataset, record_key)
);

CREATE TABLE IF NOT EXISTS wissen.product_entities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type text NOT NULL,
  external_id text NOT NULL,
  name text,
  ingredient_ids text[] NOT NULL DEFAULT '{}',
  brand_id text,
  manufacturer_id text,
  pricing jsonb,
  raw jsonb NOT NULL,
  source_file text NOT NULL,
  source text NOT NULL DEFAULT 'kimi:c273',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (entity_type, external_id)
);

CREATE TABLE IF NOT EXISTS wissen.vision_contract_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_name text NOT NULL,
  contract_key text NOT NULL,
  status text,
  can_display boolean,
  can_store boolean,
  can_train boolean,
  raw jsonb NOT NULL,
  source_file text NOT NULL,
  source text NOT NULL DEFAULT 'kimi:c273',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (contract_name, contract_key)
);

CREATE TABLE IF NOT EXISTS wissen.travel_medication_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dataset text NOT NULL,
  record_key text NOT NULL,
  country text,
  substance_id text,
  raw jsonb NOT NULL,
  source_file text NOT NULL,
  source text NOT NULL DEFAULT 'kimi:c273',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (dataset, record_key)
);

CREATE TABLE IF NOT EXISTS wissen.buddy_knowledge_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dataset text NOT NULL,
  record_key text NOT NULL,
  state_code text,
  allowed_buddy_language jsonb,
  forbidden_buddy_language jsonb,
  raw jsonb NOT NULL,
  source_file text NOT NULL,
  source text NOT NULL DEFAULT 'kimi:c273',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (dataset, record_key)
);

CREATE TABLE IF NOT EXISTS wissen.community_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dataset text NOT NULL,
  record_key text NOT NULL,
  admin_only boolean NOT NULL DEFAULT true,
  not_medical_recommendation boolean NOT NULL DEFAULT true,
  evidence_class text NOT NULL DEFAULT 'E',
  raw jsonb NOT NULL,
  source_file text NOT NULL,
  source text NOT NULL DEFAULT 'kimi:c273',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (dataset, record_key)
);

DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'rule_engine_rules',
    'rule_engine_field_specs',
    'rule_trait_mappings',
    'evidence_register_entries',
    'knowledge_gap_records',
    'product_entities',
    'vision_contract_records',
    'travel_medication_records',
    'buddy_knowledge_records',
    'community_records'
  ] LOOP
    EXECUTE format('ALTER TABLE wissen.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('DROP POLICY IF EXISTS %I ON wissen.%I', t || '_service_role_all', t);
    EXECUTE format(
      'CREATE POLICY %I ON wissen.%I FOR ALL TO service_role USING (true) WITH CHECK (true)',
      t || '_service_role_all',
      t
    );
    EXECUTE format('DROP TRIGGER IF EXISTS %I ON wissen.%I', t || '_touch_updated_at', t);
    EXECUTE format(
      'CREATE TRIGGER %I BEFORE UPDATE ON wissen.%I FOR EACH ROW EXECUTE FUNCTION wissen.touch_updated_at()',
      t || '_touch_updated_at',
      t
    );
    EXECUTE format('GRANT ALL ON TABLE wissen.%I TO service_role', t);
  END LOOP;
END $$;

DO $$
DECLARE
  v_tables int;
  v_public_grants int;
BEGIN
  SELECT count(*) INTO v_tables
  FROM information_schema.tables
  WHERE table_schema = 'wissen'
    AND table_type = 'BASE TABLE';

  SELECT count(*) INTO v_public_grants
  FROM information_schema.role_table_grants
  WHERE table_schema = 'wissen'
    AND grantee IN ('anon', 'authenticated');

  IF v_tables <> 10 THEN
    RAISE EXCEPTION 'C-273 wissen Tabellen %, erwartet 10', v_tables;
  END IF;
  IF v_public_grants <> 0 THEN
    RAISE EXCEPTION 'C-273 wissen darf keine anon/authenticated Grants tragen, gefunden %', v_public_grants;
  END IF;

  RAISE NOTICE 'OK C-273 Schema wissen: 10 Tabellen, service_role-only, keine anon/authenticated Grants';
END $$;

COMMIT;
