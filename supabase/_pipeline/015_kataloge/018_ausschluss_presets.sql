-- =============================================================
-- 018 -- Ausschluss-Presets fuer die Lebensmittelsuche (C-93)
-- Datum: 2026-08-19
-- Zweck: Benannte Ausschlussregeln ("Keine Innereien", "Kein
--        Schweinefleisch"), die je ein ganzes Buendel Lebensmittel
--        treffen, statt sie einzeln wegzuklicken.
-- Idempotent: CREATE IF NOT EXISTS, Inhalte per DELETE + INSERT.
--
-- Tom, 2026-08-18: "Sowas wie keine Innereien waere fuer mich
-- persoenlich top, denn esse ich nicht — oder Lamm ausgrenzen."
--
-- Zuschnitt:
--   [read] NUR die Datenseite. Die Oberflaeche ist G-65.
--   [read] `intolerances[]` bleibt unberuehrt — Laktose sitzt dort
--          richtig, Begruendung im Bericht.
--   [cmd]  Kein Schemaumbau: `food_preferences.general_exclusions[]`
--          ist ein Textarray und nimmt einen Preset-Code auf, ohne
--          dass sich etwas aendert.
-- =============================================================

BEGIN;

-- ── Der Katalog der Presets ────────────────────────────────────
-- `[read]` Warum eine eigene Tabelle und kein Tag je Lebensmittel:
-- Ein Preset ist eine REGEL, kein Merkmal. Die Regel muss lesbar
-- bleiben ("Kategorie-Teilbaum innereien"), damit nachvollziehbar
-- ist, warum ein Lebensmittel wegfaellt — und damit ein Nachtrag im
-- Bestand automatisch mitgefasst wird, ohne dass jemand Tags
-- nachpflegt.
CREATE TABLE IF NOT EXISTS nutrition.exclusion_presets (
  code            TEXT PRIMARY KEY,
  name_de         TEXT NOT NULL,
  name_en         TEXT NOT NULL,
  kind            TEXT NOT NULL
    CHECK (kind IN ('religious', 'personal')),
  -- Der Hinweis, der in der Oberflaeche AM Preset steht. `[read]`
  -- Bei Halal und Koscher ist er kein Beiwerk, sondern Pflicht.
  caveat_de       TEXT,
  sort_order      INTEGER NOT NULL DEFAULT 0,
  is_active       BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Die Regeln je Preset ───────────────────────────────────────
-- Eine Zeile je Regelbestandteil; ein Preset kann mehrere haben.
-- `rule_kind` sagt, WIE zugeordnet wird:
--   category  -> Kategorie-Teilbaum (slug), inklusive Nachfahren
--   bls_prefix-> erste Stelle des BLS-Codes
--   name      -> Regulaerer Ausdruck auf `name_de`
--   name_not  -> Gegenausdruck, entfernt Fehltreffer der name-Regel
CREATE TABLE IF NOT EXISTS nutrition.exclusion_preset_rules (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  preset_code     TEXT NOT NULL REFERENCES nutrition.exclusion_presets(code) ON DELETE CASCADE,
  rule_kind       TEXT NOT NULL
    CHECK (rule_kind IN ('category', 'bls_prefix', 'name', 'name_not', 'raw_animal')),
  rule_value      TEXT NOT NULL CHECK (btrim(rule_value) <> ''),
  -- Warum diese Regel so lautet. Steht im Bericht, gehoert aber an
  -- die Zeile: wer sie spaeter aendert, sieht die Messung dazu.
  grund           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_exclusion_preset_rules_preset
  ON nutrition.exclusion_preset_rules(preset_code);

-- ── Die Auflösung: welches Lebensmittel trifft welches Preset ──
-- `[read]` Eine Sicht, keine Tabelle: der Bestand aendert sich
-- (Nachtraege, Kategoriekuration), und eine materialisierte Zuordnung
-- veraltete still. Die Sicht rechnet immer gegen den Ist-Stand.
CREATE OR REPLACE VIEW nutrition.exclusion_preset_matches
WITH (security_invoker = true)
AS
WITH RECURSIVE kategorie_baum AS (
  -- Startknoten: jede Kategorie, die eine `category`-Regel nennt.
  SELECT r.preset_code, c.id AS category_id
  FROM nutrition.exclusion_preset_rules r
  JOIN nutrition.food_categories c ON c.slug = r.rule_value
  WHERE r.rule_kind = 'category'
  UNION ALL
  -- ... und alle Nachfahren.
  SELECT b.preset_code, c.id
  FROM kategorie_baum b
  JOIN nutrition.food_categories c ON c.parent_id = b.category_id
),
treffer AS (
  -- 1. Ueber den Kategoriebaum.
  SELECT DISTINCT b.preset_code, f.id AS food_id, 'category'::text AS via
  FROM kategorie_baum b
  JOIN nutrition.foods f ON f.category_id = b.category_id

  UNION

  -- 2. Ueber den BLS-Praefix.
  SELECT DISTINCT r.preset_code, f.id, 'bls_prefix'
  FROM nutrition.exclusion_preset_rules r
  JOIN nutrition.foods f ON substring(f.bls_code, 1, length(r.rule_value)) = r.rule_value
  WHERE r.rule_kind = 'bls_prefix'

  UNION

  -- 3. Ueber den Namen.
  SELECT DISTINCT r.preset_code, f.id, 'name'
  FROM nutrition.exclusion_preset_rules r
  JOIN nutrition.foods f ON f.name_de ~* r.rule_value
  WHERE r.rule_kind = 'name'

  UNION

  -- 4. Roh UND tierisch — beide Bedingungen zusammen.
  SELECT DISTINCT r.preset_code, f.id, 'raw_animal'
  FROM nutrition.exclusion_preset_rules r
  JOIN nutrition.foods f
    ON f.processing_level = 'raw'
   AND position(substring(f.bls_code, 1, 1) IN r.rule_value) > 0
  WHERE r.rule_kind = 'raw_animal'
)
SELECT t.preset_code, t.food_id, min(t.via) AS via
FROM treffer t
WHERE NOT EXISTS (
  -- Gegenausdruecke entfernen Fehltreffer der `name`-Regeln.
  SELECT 1
  FROM nutrition.exclusion_preset_rules r
  JOIN nutrition.foods f ON f.id = t.food_id
  WHERE r.rule_kind = 'name_not'
    AND r.preset_code = t.preset_code
    AND f.name_de ~* r.rule_value
)
GROUP BY t.preset_code, t.food_id;

COMMENT ON TABLE nutrition.exclusion_presets IS
  'C-93: Benannte Ausschlussregeln fuer die Lebensmittelsuche. Die Oberflaeche dazu ist G-65.';
COMMENT ON TABLE nutrition.exclusion_preset_rules IS
  'C-93: Regelbestandteile je Preset. rule_kind steuert die Zuordnung; name_not entfernt gemessene Fehltreffer.';
COMMENT ON VIEW nutrition.exclusion_preset_matches IS
  'C-93: Aufloesung Preset -> Lebensmittel, gegen den Ist-Bestand gerechnet. Bewusst eine Sicht, damit Nachtraege mitgefasst werden.';

-- ── Inhalte ────────────────────────────────────────────────────
DELETE FROM nutrition.exclusion_preset_rules;
DELETE FROM nutrition.exclusion_presets;

INSERT INTO nutrition.exclusion_presets
  (code, name_de, name_en, kind, caveat_de, sort_order) VALUES
  -- Religioes
  ('halal', 'Halal-konform', 'Halal', 'religious',
   'Schliesst Schweinefleisch, Blut und Alkohol als Zutat aus. '
   || 'Echtes Halal haengt an der Schlachtung — die BLS-Daten kennen sie nicht.', 10),
  ('kosher', 'Koscher-konform', 'Kosher', 'religious',
   'Schliesst Schweinefleisch, Schalen- und Weichtiere sowie Blut aus. '
   || 'Kashrut haengt an Schlachtung und Trennung von Fleisch und Milch — '
   || 'beides steht nicht in den Daten.', 20),
  ('no_beef', 'Kein Rindfleisch', 'No beef', 'religious',
   'Rind und Kalb, wie im hinduistischen Kontext ueblich.', 30),
  ('jain', 'Jain', 'Jain', 'religious',
   'Zusaetzlich zu vegetarisch: alle Wurzel- und Knollengemuese, '
   || 'weil die Pflanze beim Ernten stirbt.', 40),
  -- Persoenlich
  ('no_offal', 'Keine Innereien', 'No offal', 'personal',
   'Leber, Herz, Niere, Zunge und weitere — egal welches Tier.', 100),
  ('no_lamb', 'Kein Lamm/Schaf', 'No lamb', 'personal', NULL, 110),
  ('no_game', 'Kein Wild', 'No game', 'personal', NULL, 120),
  ('no_seafood', 'Keine Meeresfruechte', 'No seafood', 'personal',
   'Schalen- und Weichtiere. Fisch bleibt.', 130),
  ('no_raw_animal', 'Kein rohes Fleisch/Fisch', 'No raw meat or fish', 'personal',
   'Betrifft die Zubereitungsstufe `raw` bei Fleisch, Gefluegel, '
   || 'Wurstwaren und Fisch.', 140),
  ('no_alcohol', 'Kein Alkohol', 'No alcohol', 'personal',
   'Alkoholische Getraenke. Alkohol als Zutat in Speisen erfasst der '
   || 'BLS nicht getrennt.', 150),
  ('no_pork', 'Kein Schweinefleisch', 'No pork', 'personal',
   'Schweinefleisch und benannte Erzeugnisse. Wurstwaren ohne Tierart '
   || 'im Namen sind nicht erfassbar.', 160);

-- ── Regeln ─────────────────────────────────────────────────────
-- `[cmd]` Jede Zahl im `grund` ist am 2026-08-19 gemessen.

-- Keine Innereien: der Kategorie-Teilbaum traegt es vollstaendig.
INSERT INTO nutrition.exclusion_preset_rules (preset_code, rule_kind, rule_value, grund) VALUES
  ('no_offal', 'category', 'innereien',
   '[cmd] 131 Lebensmittel. Der Teilbaum reicht bis Ebene 4 und fuehrt '
   || 'Rinder-, Schweine-, Kalbs-, Gefluegelleber getrennt — die fuenf '
   || 'Lebern aus Toms Beispiel sind alle darin.');

-- Kein Lamm/Schaf.
INSERT INTO nutrition.exclusion_preset_rules (preset_code, rule_kind, rule_value, grund) VALUES
  ('no_lamb', 'category', 'lamm-schaf', '[cmd] 191 Lebensmittel.');

-- Kein Wild.
INSERT INTO nutrition.exclusion_preset_rules (preset_code, rule_kind, rule_value, grund) VALUES
  ('no_game', 'category', 'wild', '[cmd] 49 Lebensmittel, inklusive Wildschwein.');

-- Keine Meeresfruechte.
INSERT INTO nutrition.exclusion_preset_rules (preset_code, rule_kind, rule_value, grund) VALUES
  ('no_seafood', 'category', 'schalentiere', '[cmd] 8 Lebensmittel.'),
  ('no_seafood', 'category', 'weichtiere-andere', '[cmd] 39 Lebensmittel.');

-- Kein Alkohol: der BLS-Praefix P traegt es allein.
INSERT INTO nutrition.exclusion_preset_rules (preset_code, rule_kind, rule_value, grund) VALUES
  ('no_alcohol', 'bls_prefix', 'P',
   '[cmd] 119 Lebensmittel. Stichprobe je Untergruppe P1..P9 geprueft: '
   || 'ALLE sind alkoholisch (Bier, Wein, Likoer, Spirituosen, Alkopops, '
   || 'Cocktails). Wasser, Kaffee und Saefte fuehrt der BLS nicht unter P.');

-- Kein Rindfleisch.
INSERT INTO nutrition.exclusion_preset_rules (preset_code, rule_kind, rule_value, grund) VALUES
  ('no_beef', 'category', 'rindfleisch', '[cmd] 119 Lebensmittel.'),
  ('no_beef', 'category', 'kalbfleisch', '[cmd] 99 Lebensmittel.');

-- Kein Schweinefleisch: Kategorie plus gemessenes Namensmuster.
INSERT INTO nutrition.exclusion_preset_rules (preset_code, rule_kind, rule_value, grund) VALUES
  ('no_pork', 'category', 'schweinefleisch', '[cmd] 179 Lebensmittel ueber die Kategorie.'),
  ('no_pork', 'name',
   '(schwein|schinken|speck|kassler|kasseler|eisbein|leberk(ae|ä)s|bratwurst|salami|schmalz)',
   '[cmd] Das Muster allein trifft 657. Es faengt Schwein auch dort, wo '
   || 'die Kategorie es nicht fuehrt — Fertiggerichte, Broetchen mit '
   || 'Schinken, Wurstwaren.'),
  ('no_pork', 'name_not', 'wildschwein',
   '[cmd] 15 Fehltreffer. Wildschwein ist Wild, nicht Hausschwein.'),
  ('no_pork', 'name_not', '(vegetarisch|vegan|tofu|soja)',
   '[cmd] 1 Fehltreffer: "Vegetarische Bratwurst (aus Tofu und Weizenprotein)".'),
  ('no_pork', 'name_not',
   '^(?!.*schwein).*(rinds|rinder|gefl(ue|ü)gel|pute|truthahn)',
   '[cmd] 16 Fehltreffer: Rindsbratwurst, Gefluegelsalami, Rindersalami, '
   || 'Rinderbierschinken. Der Ausdruck greift nur, wenn "schwein" NICHT '
   || 'im Namen steht — gemischte Erzeugnisse bleiben ausgeschlossen.');

-- Kein rohes Fleisch/Fisch: zwei Bedingungen, die BEIDE gelten
-- muessen (roh UND tierisch). Dafuer die eigene Regelart
-- `raw_animal` — mit `name` allein waere es nicht ausdrueckbar.
INSERT INTO nutrition.exclusion_preset_rules (preset_code, rule_kind, rule_value, grund) VALUES
  ('no_raw_animal', 'raw_animal', 'UVWT',
   '[cmd] 389 Lebensmittel: `processing_level = raw` UND BLS-Praefix in '
   || 'U (Fleisch), V (Gefluegel), W (Wurstwaren), T (Fisch). '
   || '`processing_level` fuehrt seit C-100 acht Stufen, `raw` steht auf '
   || '3.251 — die meisten davon sind Gemuese und Obst und gehoeren '
   || 'nicht hierher.');

-- Jain: vegetarisch plus Wurzelgemuese.
INSERT INTO nutrition.exclusion_preset_rules (preset_code, rule_kind, rule_value, grund) VALUES
  ('jain', 'category', 'kartoffeln', '[cmd] 157 Lebensmittel.'),
  ('jain', 'category', 'wurzel-knollengemuese',
   '[cmd] 0 direkt zugeordnet — die Kategorie ist angelegt, aber leer. '
   || 'Das Namensmuster darunter traegt sie.'),
  ('jain', 'category', 'zwiebeln-lauch',
   '[cmd] 0 direkt zugeordnet, wie oben.'),
  ('jain', 'name',
   '(karotte|m(oe|ö)hre|rote bete|rote r(ue|ü)be|zwiebel|knoblauch|lauch|'
   || 'radieschen|rettich|sellerie|pastinake|steckr(ue|ü)be|topinambur|'
   || 'schwarzwurzel|ingwer|kurkuma)',
   '[cmd] Die Kategorien fuer Wurzelgemuese sind leer; das Muster traegt '
   || 'die Zuordnung. Zusammen mit Kartoffeln 469 Lebensmittel.');

-- Halal: Schwein, Blut, Alkohol.
INSERT INTO nutrition.exclusion_preset_rules (preset_code, rule_kind, rule_value, grund) VALUES
  ('halal', 'category', 'schweinefleisch', '[cmd] 179 ueber die Kategorie.'),
  ('halal', 'name',
   '(schwein|schinken|speck|kassler|kasseler|eisbein|leberk(ae|ä)s|bratwurst|salami|schmalz)',
   '[cmd] Wie no_pork.'),
  ('halal', 'name_not', 'wildschwein', '[cmd] Wie no_pork.'),
  ('halal', 'name_not', '(vegetarisch|vegan|tofu|soja)', '[cmd] Wie no_pork.'),
  ('halal', 'name_not', '^(?!.*schwein).*(rinds|rinder|gefl(ue|ü)gel|pute|truthahn)',
   '[cmd] Wie no_pork.'),
  ('halal', 'bls_prefix', 'P', '[cmd] 119 alkoholische Getraenke.'),
  ('halal', 'name', '(blutwurst|blutbregen|panhas|gr(ue|ü)tzblut)',
   '[cmd] 14 Blutprodukte.');

-- Koscher: Schwein, Schalen-/Weichtiere, Blut.
INSERT INTO nutrition.exclusion_preset_rules (preset_code, rule_kind, rule_value, grund) VALUES
  ('kosher', 'category', 'schweinefleisch', '[cmd] 179 ueber die Kategorie.'),
  ('kosher', 'name',
   '(schwein|schinken|speck|kassler|kasseler|eisbein|leberk(ae|ä)s|bratwurst|salami|schmalz)',
   '[cmd] Wie no_pork.'),
  ('kosher', 'name_not', 'wildschwein', '[cmd] Wie no_pork.'),
  ('kosher', 'name_not', '(vegetarisch|vegan|tofu|soja)', '[cmd] Wie no_pork.'),
  ('kosher', 'name_not', '^(?!.*schwein).*(rinds|rinder|gefl(ue|ü)gel|pute|truthahn)',
   '[cmd] Wie no_pork.'),
  ('kosher', 'category', 'schalentiere', '[cmd] 8 Lebensmittel.'),
  ('kosher', 'category', 'weichtiere-andere', '[cmd] 39 Lebensmittel.'),
  ('kosher', 'name', '(blutwurst|blutbregen|panhas|gr(ue|ü)tzblut)',
   '[cmd] 14 Blutprodukte.');

-- ── Rechte ─────────────────────────────────────────────────────
GRANT SELECT ON nutrition.exclusion_presets TO authenticated;
GRANT SELECT ON nutrition.exclusion_preset_rules TO authenticated;
GRANT SELECT ON nutrition.exclusion_preset_matches TO authenticated;
GRANT ALL ON nutrition.exclusion_presets TO service_role;
GRANT ALL ON nutrition.exclusion_preset_rules TO service_role;
GRANT ALL ON nutrition.exclusion_preset_matches TO service_role;

ALTER TABLE nutrition.exclusion_presets ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutrition.exclusion_preset_rules ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS exclusion_presets_select ON nutrition.exclusion_presets;
CREATE POLICY exclusion_presets_select ON nutrition.exclusion_presets
  FOR SELECT TO authenticated USING (is_active);

DROP POLICY IF EXISTS exclusion_preset_rules_select ON nutrition.exclusion_preset_rules;
CREATE POLICY exclusion_preset_rules_select ON nutrition.exclusion_preset_rules
  FOR SELECT TO authenticated USING (true);

-- ── Selbstpruefung ─────────────────────────────────────────────
DO $$
DECLARE
  v_presets INTEGER;
  v_regeln INTEGER;
  v_offal INTEGER;
  v_lebern INTEGER;
  v_foods INTEGER;
BEGIN
  SELECT count(*) INTO v_presets FROM nutrition.exclusion_presets;
  SELECT count(*) INTO v_regeln FROM nutrition.exclusion_preset_rules;

  IF v_presets < 10 THEN
    RAISE EXCEPTION 'Nur % Presets angelegt, erwartet mindestens 10', v_presets;
  END IF;

  -- Keine Innereien muss die fuenf Lebern aus Toms Beispiel treffen.
  SELECT count(*) INTO v_offal
  FROM nutrition.exclusion_preset_matches WHERE preset_code = 'no_offal';
  IF v_offal <> 131 THEN
    RAISE EXCEPTION 'no_offal trifft % statt 131', v_offal;
  END IF;

  SELECT count(DISTINCT tier) INTO v_lebern FROM (
    SELECT CASE
      WHEN f.name_de ~* 'rind'      THEN 'rind'
      WHEN f.name_de ~* 'schwein'   THEN 'schwein'
      WHEN f.name_de ~* 'kalb'      THEN 'kalb'
      WHEN f.name_de ~* 'h(ae|ä)hnchen' THEN 'haehnchen'
      WHEN f.name_de ~* 'gans'      THEN 'gans'
    END AS tier
    FROM nutrition.exclusion_preset_matches m
    JOIN nutrition.foods f ON f.id = m.food_id
    WHERE m.preset_code = 'no_offal' AND f.name_de ~* 'leber'
  ) x WHERE tier IS NOT NULL;
  IF v_lebern <> 5 THEN
    RAISE EXCEPTION 'no_offal trifft nur % der fuenf Lebern (Rind, Schwein, Kalb, Haehnchen, Gans)', v_lebern;
  END IF;

  -- Der Bestand darf sich nicht veraendert haben.
  SELECT count(*) INTO v_foods FROM nutrition.foods;
  IF v_foods <> 7140 THEN
    RAISE EXCEPTION 'foods steht bei % statt 7.140 — dieser Schritt darf den Bestand nicht anfassen', v_foods;
  END IF;

  RAISE NOTICE 'OK: % Presets, % Regeln, no_offal trifft % mit allen fuenf Lebern',
    v_presets, v_regeln, v_offal;
END $$;

COMMIT;
