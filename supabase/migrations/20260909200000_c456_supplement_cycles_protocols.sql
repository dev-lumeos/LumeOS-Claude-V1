-- C-456: Struktur fuer Zyklusverlauf, PCT-Vorlagen und datierte Tageslisten.
BEGIN;

ALTER TABLE supplements.supplement_protocol_items ADD COLUMN IF NOT EXISTS weeks_start integer, ADD COLUMN IF NOT EXISTS weeks_end integer;
ALTER TABLE supplements.supplement_protocol_items DROP CONSTRAINT IF EXISTS supplement_protocol_items_weeks_check;
ALTER TABLE supplements.supplement_protocol_items ADD CONSTRAINT supplement_protocol_items_weeks_check CHECK ((weeks_start IS NULL AND weeks_end IS NULL) OR (weeks_start >= 1 AND weeks_end >= weeks_start));
ALTER TABLE supplements.supplement_protocols ADD COLUMN IF NOT EXISTS started_at date NOT NULL DEFAULT current_date;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM supplements.intake_schedule) THEN
    RAISE EXCEPTION 'C-456: intake_schedule enthaelt bereits Zeilen ohne Datum und Herkunft; keine Zuordnung wird erfunden';
  END IF;
END $$;

ALTER TABLE supplements.intake_schedule ADD COLUMN IF NOT EXISTS schedule_date date, ADD COLUMN IF NOT EXISTS timing text, ADD COLUMN IF NOT EXISTS source_kind text, ADD COLUMN IF NOT EXISTS protocol_item_id uuid;
ALTER TABLE supplements.intake_schedule DROP CONSTRAINT IF EXISTS intake_schedule_protocol_item_id_fkey;
ALTER TABLE supplements.intake_schedule ADD CONSTRAINT intake_schedule_protocol_item_id_fkey FOREIGN KEY (protocol_item_id) REFERENCES supplements.supplement_protocol_items(id) ON DELETE CASCADE;
ALTER TABLE supplements.intake_schedule DROP CONSTRAINT IF EXISTS intake_schedule_stack_item_id_fkey;
ALTER TABLE supplements.intake_schedule ADD CONSTRAINT intake_schedule_stack_item_id_fkey FOREIGN KEY (stack_item_id) REFERENCES supplements.stack_items(id) ON DELETE CASCADE;
ALTER TABLE supplements.intake_schedule ALTER COLUMN schedule_date SET NOT NULL, ALTER COLUMN source_kind SET NOT NULL;
ALTER TABLE supplements.intake_schedule DROP CONSTRAINT IF EXISTS intake_schedule_source_check;
ALTER TABLE supplements.intake_schedule ADD CONSTRAINT intake_schedule_source_check CHECK ((source_kind = 'stack' AND stack_item_id IS NOT NULL AND protocol_item_id IS NULL) OR (source_kind = 'protocol' AND protocol_item_id IS NOT NULL AND stack_item_id IS NULL));
CREATE UNIQUE INDEX IF NOT EXISTS uq_intake_schedule_stack_day ON supplements.intake_schedule (user_id, schedule_date, stack_item_id) WHERE source_kind = 'stack';
CREATE UNIQUE INDEX IF NOT EXISTS uq_intake_schedule_protocol_day ON supplements.intake_schedule (user_id, schedule_date, protocol_item_id) WHERE source_kind = 'protocol';

CREATE TABLE IF NOT EXISTS supplements.supplement_protocol_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), code text NOT NULL UNIQUE CHECK (btrim(code) <> ''),
  name_de text NOT NULL CHECK (btrim(name_de) <> ''), name_en text, name_th text, description_de text,
  source text NOT NULL DEFAULT 'legacy_cycleplanner' CHECK (source IN ('legacy_cycleplanner')),
  is_active boolean NOT NULL DEFAULT true, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS supplements.supplement_protocol_template_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), template_id uuid NOT NULL REFERENCES supplements.supplement_protocol_templates(id) ON DELETE CASCADE,
  supplement_id uuid NOT NULL REFERENCES supplements.supplements(id) ON DELETE RESTRICT,
  dose_amount numeric(12,4) NOT NULL CHECK (dose_amount > 0), dose_unit text NOT NULL CHECK (btrim(dose_unit) <> ''), timing text, with_meal boolean NOT NULL DEFAULT false,
  weeks_start integer NOT NULL CHECK (weeks_start >= 1), weeks_end integer NOT NULL CHECK (weeks_end >= weeks_start), sort_order integer NOT NULL DEFAULT 0 CHECK (sort_order >= 0),
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), UNIQUE (template_id, sort_order)
);
CREATE INDEX IF NOT EXISTS idx_supplement_protocol_templates_active ON supplements.supplement_protocol_templates (is_active, code);
CREATE INDEX IF NOT EXISTS idx_supplement_protocol_template_items_template ON supplements.supplement_protocol_template_items (template_id, sort_order);
DROP TRIGGER IF EXISTS supplement_protocol_templates_touch_updated_at ON supplements.supplement_protocol_templates;
CREATE TRIGGER supplement_protocol_templates_touch_updated_at BEFORE UPDATE ON supplements.supplement_protocol_templates FOR EACH ROW EXECUTE FUNCTION supplements.touch_updated_at();
DROP TRIGGER IF EXISTS supplement_protocol_template_items_touch_updated_at ON supplements.supplement_protocol_template_items;
CREATE TRIGGER supplement_protocol_template_items_touch_updated_at BEFORE UPDATE ON supplements.supplement_protocol_template_items FOR EACH ROW EXECUTE FUNCTION supplements.touch_updated_at();

ALTER TABLE supplements.supplement_protocol_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplements.supplement_protocol_template_items ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON supplements.supplement_protocol_templates, supplements.supplement_protocol_template_items TO authenticated;
GRANT ALL ON supplements.supplement_protocol_templates, supplements.supplement_protocol_template_items TO service_role;
DROP POLICY IF EXISTS supplement_protocol_templates_select ON supplements.supplement_protocol_templates;
CREATE POLICY supplement_protocol_templates_select ON supplements.supplement_protocol_templates FOR SELECT TO authenticated USING (is_active);
DROP POLICY IF EXISTS supplement_protocol_template_items_select ON supplements.supplement_protocol_template_items;
CREATE POLICY supplement_protocol_template_items_select ON supplements.supplement_protocol_template_items FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM supplements.supplement_protocol_templates t WHERE t.id = supplement_protocol_template_items.template_id AND t.is_active));

COMMENT ON COLUMN supplements.stack_items.cycling IS 'C-456, SPEC_02_ENTITIES.md:245-247 und SPEC_09_SCORING.md:163-175: der laufende Zustand am Stack-Eintrag, aus dem die Tagesformel rechnet; supplements.user_supplement_cycles ist der Verlauf mit Ereignissen. current_phase ist im bestehenden JSONB-Vertrag noch nicht erzwungen.';
COMMENT ON TABLE supplements.user_supplement_cycles IS 'C-456, SCHEMA_NEUAUFBAU.md:322: Verlauf eines Zyklus mit Ereignissen; nicht die Eingabe der Tagesformel am Stack-Eintrag.';
COMMENT ON TABLE supplements.supplement_protocol_templates IS 'C-456: Verbatim uebernommene PCT_TEMPLATES aus dem alten CyclePlanner; Vorlagen sind keine medizinische Empfehlung und werden beim Anwenden in Nutzerprotokolle kopiert.';
COMMIT;
