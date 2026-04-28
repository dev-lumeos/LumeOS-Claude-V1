# Supplements Module — Database Schema
> Spec Phase 6 | Vollständiges SQL-Schema

---

```sql
CREATE SCHEMA IF NOT EXISTS supplements;
SET search_path = supplements, public;
```

---

## 1. supplements.supplement_catalog

```sql
CREATE TABLE supplements.supplement_catalog (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                 TEXT NOT NULL,
  name_de              TEXT,
  name_en              TEXT,
  name_th              TEXT,
  slug                 TEXT UNIQUE NOT NULL,

  category             TEXT NOT NULL
    CHECK (category IN ('Vitamins','Minerals','Performance','Recovery','Adaptogens',
                        'Sleep','Gut Health','Longevity','Amino Acids','Hormones','Other')),
  subcategory          TEXT,
  form                 TEXT,

  -- Evidence
  evidence_grade       TEXT NOT NULL DEFAULT 'C'
    CHECK (evidence_grade IN ('S','A','B','C','D','F')),
  evidence_summary     TEXT,
  evidence_sources     JSONB DEFAULT '[]',
  side_effects         TEXT[] DEFAULT '{}',
  contraindications    TEXT[] DEFAULT '{}',
  allergy_flags        TEXT[] DEFAULT '{}',

  -- Dosierung
  typical_dose_min     NUMERIC(10,3),
  typical_dose_max     NUMERIC(10,3),
  dose_unit            TEXT DEFAULT 'mg',
  serving_size         TEXT,
  best_timing          TEXT,
  timing_default       TEXT DEFAULT 'morning'
    CHECK (timing_default IN ('morning','midday','evening','pre_workout','post_workout','bedtime')),
  absorption_notes     TEXT,
  requires_food        BOOLEAN DEFAULT false,
  requires_empty_stomach BOOLEAN DEFAULT false,

  -- Cycling
  requires_cycling     BOOLEAN DEFAULT false,
  cycling_protocol     JSONB,
  half_life_hours      INTEGER,

  -- Cross-Modul: Nutrition
  -- Keys = BLS-Nährstoff-Codes (VITD, MG, ZN, FAPUN3, ...)
  nutrients_provided   JSONB DEFAULT '{}',

  -- Meta
  benefits             TEXT[] DEFAULT '{}',
  priority             TEXT DEFAULT 'nice_to_have'
    CHECK (priority IN ('essential','top_needed','nice_to_have','avoid')),
  cost_per_serving     NUMERIC(8,3),
  is_active            BOOLEAN DEFAULT true,
  created_at           TIMESTAMPTZ DEFAULT now(),
  updated_at           TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_supp_catalog_category  ON supplements.supplement_catalog(category);
CREATE INDEX idx_supp_catalog_evidence  ON supplements.supplement_catalog(evidence_grade);
CREATE INDEX idx_supp_catalog_name_trgm ON supplements.supplement_catalog
  USING GIN (name gin_trgm_ops);
CREATE INDEX idx_supp_catalog_name_de_trgm ON supplements.supplement_catalog
  USING GIN (name_de gin_trgm_ops);
CREATE INDEX idx_supp_catalog_nutrients ON supplements.supplement_catalog
  USING GIN (nutrients_provided);

ALTER TABLE supplements.supplement_catalog ENABLE ROW LEVEL SECURITY;
CREATE POLICY "supplement_catalog_select" ON supplements.supplement_catalog
  FOR SELECT USING (is_active = true);
```

---

## 2. supplements.enhanced_substances

```sql
CREATE TABLE supplements.enhanced_substances (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                 TEXT NOT NULL,
  name_de              TEXT,
  name_en              TEXT,
  aliases              TEXT[] DEFAULT '{}',
  category             TEXT NOT NULL
    CHECK (category IN ('AAS','SARM','Peptide','GH','AI','SERM','PCT',
                        'GLP1','Support','Other')),
  description          TEXT,
  chemical_name        TEXT,
  molecular_weight     INTEGER,
  half_life_hours      NUMERIC(8,2),

  -- Dosierung
  route                TEXT NOT NULL
    CHECK (route IN ('oral','injection_im','injection_subq','topical','nasal','sublingual')),
  typical_dose_min     NUMERIC(10,3),
  typical_dose_max     NUMERIC(10,3),
  dose_unit            TEXT DEFAULT 'mg',
  frequency            TEXT,

  -- Sicherheit
  hepatotoxicity_level TEXT DEFAULT 'none'
    CHECK (hepatotoxicity_level IN ('none','low','moderate','high','severe')),
  cardiovascular_risk  TEXT DEFAULT 'low'
    CHECK (cardiovascular_risk IN ('none','low','moderate','high','severe')),
  androgenic_rating    INTEGER,
  anabolic_rating      INTEGER,

  -- PCT & AI
  requires_pct         BOOLEAN DEFAULT false,
  requires_ai          BOOLEAN DEFAULT false,
  requires_serm        BOOLEAN DEFAULT false,
  aromatization        TEXT DEFAULT 'none'
    CHECK (aromatization IN ('none','low','moderate','high')),

  -- Warnings
  warnings             TEXT[] DEFAULT '{}',
  contraindications    TEXT[] DEFAULT '{}',
  drug_interactions    TEXT[] DEFAULT '{}',
  side_effects         JSONB DEFAULT '{}',

  -- Rechtliches
  legal_status         JSONB DEFAULT '{}',
  detection_time_days  INTEGER,

  is_active            BOOLEAN DEFAULT true,
  created_at           TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_enhanced_category  ON supplements.enhanced_substances(category);
CREATE INDEX idx_enhanced_name_trgm ON supplements.enhanced_substances
  USING GIN (name gin_trgm_ops);
CREATE INDEX idx_enhanced_aliases   ON supplements.enhanced_substances
  USING GIN (aliases);

ALTER TABLE supplements.enhanced_substances ENABLE ROW LEVEL SECURITY;
-- Enhanced Substances nur für User mit enhanced_mode = true
CREATE POLICY "enhanced_select" ON supplements.enhanced_substances
  FOR SELECT USING (
    is_active = true AND
    EXISTS (
      SELECT 1 FROM supplements.user_supplement_settings uss
      WHERE uss.user_id = auth.uid()::uuid AND uss.enhanced_mode = true
    )
  );
```

---

## 3. supplements.supplement_interactions

```sql
CREATE TABLE supplements.supplement_interactions (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  supplement1_id        UUID REFERENCES supplements.supplement_catalog(id),
  supplement1_name      TEXT,
  supplement2_id        UUID REFERENCES supplements.supplement_catalog(id),
  supplement2_name      TEXT,
  enhanced1_id          UUID REFERENCES supplements.enhanced_substances(id),
  enhanced2_id          UUID REFERENCES supplements.enhanced_substances(id),

  interaction_type      TEXT NOT NULL
    CHECK (interaction_type IN ('synergy','absorption','conflict','timing','contraindication')),
  severity              TEXT NOT NULL
    CHECK (severity IN ('info','caution','warning','critical')),

  description_en        TEXT NOT NULL,
  description_de        TEXT,
  recommendation_en     TEXT,
  recommendation_de     TEXT,
  timing_recommendation TEXT
    CHECK (timing_recommendation IN ('separate_2h','separate_4h','separate_8h',
                                     'take_together','avoid',NULL)),

  evidence_level        TEXT DEFAULT 'moderate'
    CHECK (evidence_level IN ('low','moderate','high')),
  evidence_sources      TEXT[] DEFAULT '{}',

  blocks_intake         BOOLEAN DEFAULT false,
  requires_confirmation BOOLEAN DEFAULT false,
  is_active             BOOLEAN DEFAULT true,

  CONSTRAINT participants_check CHECK (
    (supplement1_id IS NOT NULL OR supplement1_name IS NOT NULL) AND
    (supplement2_id IS NOT NULL OR supplement2_name IS NOT NULL OR
     enhanced2_id IS NOT NULL)
  )
);

CREATE INDEX idx_interactions_s1_id ON supplements.supplement_interactions(supplement1_id);
CREATE INDEX idx_interactions_s2_id ON supplements.supplement_interactions(supplement2_id);
CREATE INDEX idx_interactions_s1_name ON supplements.supplement_interactions(supplement1_name);
CREATE INDEX idx_interactions_s2_name ON supplements.supplement_interactions(supplement2_name);
CREATE INDEX idx_interactions_severity ON supplements.supplement_interactions(severity);

ALTER TABLE supplements.supplement_interactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "interactions_select" ON supplements.supplement_interactions
  FOR SELECT USING (is_active = true);
```

---

## 4. supplements.user_supplement_settings

```sql
CREATE TABLE supplements.user_supplement_settings (
  user_id                UUID PRIMARY KEY,
  enhanced_mode          BOOLEAN DEFAULT false,
  enhanced_accepted_at   TIMESTAMPTZ,
  enhanced_age_verified  BOOLEAN DEFAULT false,
  reminder_morning       TEXT DEFAULT '08:00',
  reminder_evening       TEXT DEFAULT '21:00',
  reminder_pre_workout   TEXT,
  low_stock_days         INTEGER DEFAULT 7,
  updated_at             TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE supplements.user_supplement_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "settings_owner" ON supplements.user_supplement_settings
  USING (auth.uid()::text = user_id::text);
```

---

## 5. supplements.user_stacks

```sql
CREATE TABLE supplements.user_stacks (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL,
  name              TEXT NOT NULL,
  description       TEXT,
  goal              TEXT DEFAULT 'custom'
    CHECK (goal IN ('muscle_building','fat_loss','recovery_sleep','health',
                    'longevity','performance','custom')),
  source            TEXT DEFAULT 'user'
    CHECK (source IN ('user','coach','marketplace','template')),
  source_ref_id     UUID,

  is_active         BOOLEAN DEFAULT false,
  is_enhanced       BOOLEAN DEFAULT false,
  total_monthly_cost NUMERIC(8,2),
  item_count        INTEGER DEFAULT 0,

  created_at        TIMESTAMPTZ DEFAULT now(),
  updated_at        TIMESTAMPTZ DEFAULT now(),

  CONSTRAINT unique_active_stack_per_user
    EXCLUDE (user_id WITH =) WHERE (is_active = true)
);

CREATE INDEX idx_user_stacks_user    ON supplements.user_stacks(user_id);
CREATE INDEX idx_user_stacks_active  ON supplements.user_stacks(user_id, is_active);

ALTER TABLE supplements.user_stacks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "stacks_owner" ON supplements.user_stacks
  USING (auth.uid()::text = user_id::text);
```

---

## 6. supplements.stack_items

```sql
CREATE TABLE supplements.stack_items (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stack_id                UUID NOT NULL REFERENCES supplements.user_stacks(id) ON DELETE CASCADE,

  supplement_id           UUID REFERENCES supplements.supplement_catalog(id),
  enhanced_substance_id   UUID REFERENCES supplements.enhanced_substances(id),
  mode                    TEXT NOT NULL DEFAULT 'standard'
    CHECK (mode IN ('standard','enhanced')),

  custom_name             TEXT,
  notes                   TEXT,

  dose                    NUMERIC(10,3) NOT NULL,
  dose_unit               TEXT NOT NULL DEFAULT 'mg',
  frequency               TEXT NOT NULL DEFAULT 'daily'
    CHECK (frequency IN ('daily','weekdays','training_days','custom','cycling')),
  timing                  TEXT NOT NULL DEFAULT 'morning'
    CHECK (timing IN ('morning','midday','evening','pre_workout','post_workout','bedtime')),

  cycling                 JSONB,
  sort_order              INTEGER DEFAULT 0,
  is_active               BOOLEAN DEFAULT true,
  added_at                TIMESTAMPTZ DEFAULT now(),

  CONSTRAINT supplement_xor CHECK (
    (supplement_id IS NOT NULL AND enhanced_substance_id IS NULL) OR
    (supplement_id IS NULL AND enhanced_substance_id IS NOT NULL)
  )
);

CREATE INDEX idx_stack_items_stack      ON supplements.stack_items(stack_id);
CREATE INDEX idx_stack_items_supplement ON supplements.stack_items(supplement_id);
CREATE INDEX idx_stack_items_sort       ON supplements.stack_items(stack_id, sort_order);

ALTER TABLE supplements.stack_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "stack_items_owner" ON supplements.stack_items
  USING (EXISTS (
    SELECT 1 FROM supplements.user_stacks us
    WHERE us.id = stack_items.stack_id AND auth.uid()::text = us.user_id::text
  ));
```

### Trigger: Stack item_count updaten

```sql
CREATE OR REPLACE FUNCTION supplements.update_stack_count()
RETURNS TRIGGER AS $$
DECLARE v_stack_id UUID;
BEGIN
  v_stack_id := COALESCE(NEW.stack_id, OLD.stack_id);
  UPDATE supplements.user_stacks SET
    item_count = (SELECT COUNT(*) FROM supplements.stack_items WHERE stack_id = v_stack_id AND is_active = true),
    updated_at = now()
  WHERE id = v_stack_id;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_stack_item_count
  AFTER INSERT OR UPDATE OF is_active OR DELETE ON supplements.stack_items
  FOR EACH ROW EXECUTE FUNCTION supplements.update_stack_count();
```

---

## 7. supplements.intake_logs

```sql
CREATE TABLE supplements.intake_logs (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL,
  stack_item_id     UUID NOT NULL REFERENCES supplements.stack_items(id) ON DELETE CASCADE,
  date              DATE NOT NULL,
  mode              TEXT DEFAULT 'standard' CHECK (mode IN ('standard','enhanced')),

  status            TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','taken','skipped','snoozed')),
  taken_at          TIMESTAMPTZ,
  notes             TEXT,
  actual_dose       NUMERIC(10,3),
  actual_dose_unit  TEXT,

  created_at        TIMESTAMPTZ DEFAULT now(),
  updated_at        TIMESTAMPTZ DEFAULT now(),

  UNIQUE (user_id, stack_item_id, date)
);

CREATE INDEX idx_intake_user_date    ON supplements.intake_logs(user_id, date);
CREATE INDEX idx_intake_status       ON supplements.intake_logs(status);
CREATE INDEX idx_intake_compliance   ON supplements.intake_logs(user_id, date, status);

ALTER TABLE supplements.intake_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "intake_owner" ON supplements.intake_logs
  USING (auth.uid()::text = user_id::text);
```

---

## 8. supplements.user_inventory

```sql
CREATE TABLE supplements.user_inventory (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 UUID NOT NULL,
  supplement_id           UUID REFERENCES supplements.supplement_catalog(id),
  enhanced_substance_id   UUID REFERENCES supplements.enhanced_substances(id),
  product_name            TEXT NOT NULL,

  current_stock           NUMERIC(10,2),
  unit                    TEXT,
  purchase_date           DATE,
  expiry_date             DATE,

  low_stock_threshold     NUMERIC(10,2) DEFAULT 10,
  reorder_flag            BOOLEAN DEFAULT false,

  supplier                TEXT,
  cost_per_unit           NUMERIC(8,3),
  total_cost              NUMERIC(10,2),

  created_at              TIMESTAMPTZ DEFAULT now(),
  updated_at              TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_inventory_user ON supplements.user_inventory(user_id);
ALTER TABLE supplements.user_inventory ENABLE ROW LEVEL SECURITY;
CREATE POLICY "inventory_owner" ON supplements.user_inventory
  USING (auth.uid()::text = user_id::text);
```

---

## 9. supplements.stack_templates

```sql
CREATE TABLE supplements.stack_templates (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  name_de     TEXT,
  description TEXT,
  goal        TEXT,
  source      TEXT DEFAULT 'system' CHECK (source IN ('system','coach','community')),
  is_public   BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE supplements.stack_template_items (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id     UUID NOT NULL REFERENCES supplements.stack_templates(id) ON DELETE CASCADE,
  supplement_id   UUID NOT NULL REFERENCES supplements.supplement_catalog(id),
  dose            NUMERIC(10,3) NOT NULL,
  dose_unit       TEXT NOT NULL DEFAULT 'mg',
  timing          TEXT NOT NULL DEFAULT 'morning',
  frequency       TEXT NOT NULL DEFAULT 'daily',
  tier            TEXT NOT NULL DEFAULT 'good'
    CHECK (tier IN ('must','good','nice')),
  sort_order      INTEGER DEFAULT 0
);

ALTER TABLE supplements.stack_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "templates_select" ON supplements.stack_templates FOR SELECT USING (is_public = true);
```

---

## 10. VIEW: daily_intake_summary

```sql
CREATE OR REPLACE VIEW supplements.daily_intake_summary AS
SELECT
  il.user_id,
  il.date,
  il.mode,
  COUNT(*) FILTER (WHERE il.status != 'pending')  AS total_decided,
  COUNT(*) FILTER (WHERE il.status = 'taken')     AS total_taken,
  COUNT(*) FILTER (WHERE il.status = 'skipped')   AS total_skipped,
  COUNT(*) FILTER (WHERE il.status = 'pending')   AS total_pending,
  COUNT(*)                                         AS total_scheduled,
  CASE
    WHEN COUNT(*) FILTER (WHERE il.status != 'pending') > 0
    THEN ROUND(
      COUNT(*) FILTER (WHERE il.status = 'taken')::NUMERIC /
      COUNT(*) FILTER (WHERE il.status != 'pending') * 100, 1)
    ELSE NULL
  END AS compliance_pct
FROM supplements.intake_logs il
GROUP BY il.user_id, il.date, il.mode;
```

---

## 11. Grants

```sql
GRANT USAGE ON SCHEMA supplements TO authenticated, service_role;

GRANT SELECT ON
  supplements.supplement_catalog, supplements.enhanced_substances,
  supplements.supplement_interactions, supplements.stack_templates,
  supplements.stack_template_items TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON
  supplements.user_supplement_settings, supplements.user_stacks,
  supplements.stack_items, supplements.intake_logs,
  supplements.user_inventory TO authenticated;

GRANT ALL ON ALL TABLES IN SCHEMA supplements TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA supplements TO authenticated, service_role;
```
