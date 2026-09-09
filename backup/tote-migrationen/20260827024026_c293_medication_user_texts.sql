BEGIN;

CREATE TABLE IF NOT EXISTS medical.medication_user_texts (
  active_substance_id TEXT PRIMARY KEY REFERENCES medical.medication_active_substances(id) ON DELETE CASCADE,
  kurz_was_de TEXT NOT NULL CHECK (char_length(kurz_was_de) <= 140 AND btrim(kurz_was_de) <> ''),
  kurz_was_en TEXT,
  kurz_was_th TEXT,
  wofuer_de TEXT[] NOT NULL CHECK (cardinality(wofuer_de) > 0),
  wofuer_en TEXT[],
  wofuer_th TEXT[],
  wie_wirkt_de TEXT NOT NULL CHECK (btrim(wie_wirkt_de) <> ''),
  wie_wirkt_en TEXT,
  wie_wirkt_th TEXT,
  was_bringt_es_de TEXT NOT NULL CHECK (btrim(was_bringt_es_de) <> ''),
  was_bringt_es_en TEXT,
  was_bringt_es_th TEXT,
  zu_viel_de TEXT NOT NULL CHECK (btrim(zu_viel_de) <> ''),
  zu_viel_en TEXT,
  zu_viel_th TEXT,
  zu_wenig_de TEXT,
  zu_wenig_en TEXT,
  zu_wenig_th TEXT,
  wann_wie_de TEXT NOT NULL CHECK (btrim(wann_wie_de) <> ''),
  wann_wie_en TEXT,
  wann_wie_th TEXT,
  wer_nicht_de TEXT[] NOT NULL CHECK (cardinality(wer_nicht_de) > 0),
  wer_nicht_en TEXT[],
  wer_nicht_th TEXT[],
  mythen_de JSONB,
  mythen_en JSONB,
  mythen_th JSONB,
  verschreibungspflicht_klartext_de TEXT NOT NULL CHECK (btrim(verschreibungspflicht_klartext_de) <> ''),
  verschreibungspflicht_klartext_en TEXT,
  verschreibungspflicht_klartext_th TEXT,
  absetzen_de TEXT NOT NULL CHECK (btrim(absetzen_de) <> ''),
  absetzen_en TEXT,
  absetzen_th TEXT,
  wechselwirkung_alltag_de TEXT NOT NULL CHECK (btrim(wechselwirkung_alltag_de) <> ''),
  wechselwirkung_alltag_en TEXT,
  wechselwirkung_alltag_th TEXT,
  null_context JSONB NOT NULL DEFAULT '{}'::jsonb,
  sources JSONB NOT NULL DEFAULT '[]'::jsonb,
  source TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (mythen_de IS NULL OR jsonb_typeof(mythen_de) IN ('string', 'array')),
  CHECK (jsonb_typeof(null_context) = 'object'),
  CHECK (jsonb_typeof(sources) = 'array')
);

CREATE TABLE IF NOT EXISTS medical.medication_faq (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  active_substance_id TEXT NOT NULL REFERENCES medical.medication_active_substances(id) ON DELETE CASCADE,
  frage_de TEXT NOT NULL CHECK (btrim(frage_de) <> ''),
  frage_en TEXT,
  frage_th TEXT,
  antwort_de TEXT NOT NULL CHECK (btrim(antwort_de) <> ''),
  antwort_en TEXT,
  antwort_th TEXT,
  sort_order INTEGER NOT NULL CHECK (sort_order > 0),
  sources JSONB NOT NULL DEFAULT '[]'::jsonb,
  source TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (active_substance_id, sort_order),
  CHECK (jsonb_typeof(sources) = 'array')
);

CREATE INDEX IF NOT EXISTS idx_medication_faq_substance
  ON medical.medication_faq(active_substance_id, sort_order);

GRANT SELECT ON medical.medication_user_texts TO authenticated;
GRANT SELECT ON medical.medication_faq TO authenticated;
GRANT ALL ON medical.medication_user_texts TO service_role;
GRANT ALL ON medical.medication_faq TO service_role;

ALTER TABLE medical.medication_user_texts ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical.medication_faq ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS medication_user_texts_select ON medical.medication_user_texts;
CREATE POLICY medication_user_texts_select ON medical.medication_user_texts
  FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS medication_faq_select ON medical.medication_faq;
CREATE POLICY medication_faq_select ON medical.medication_faq
  FOR SELECT TO authenticated USING (true);

DROP TRIGGER IF EXISTS medication_user_texts_updated_at ON medical.medication_user_texts;
CREATE TRIGGER medication_user_texts_updated_at
  BEFORE UPDATE ON medical.medication_user_texts
  FOR EACH ROW EXECUTE FUNCTION medical.touch_updated_at();

DROP TRIGGER IF EXISTS medication_faq_updated_at ON medical.medication_faq;
CREATE TRIGGER medication_faq_updated_at
  BEFORE UPDATE ON medical.medication_faq
  FOR EACH ROW EXECUTE FUNCTION medical.touch_updated_at();

COMMIT;
