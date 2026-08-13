-- =============================================================
-- 023 — Zubereitungsarten aus dem Bestand ableiten
-- Datum: 2026-08-14 · Laeuft NACH 020. Idempotent.
-- Grundlage: docs/ssot/44-…
-- =============================================================
--
-- ANLASS: Der BLS-Code traegt die Zubereitung an den Stellen 5-7. Ein
-- Filter darauf braucht Bezeichnungen — und die duerfen nicht erfunden
-- werden.
--
-- =============================================================
-- WARUM KEINE TABELLE "CODE -> BEZEICHNUNG"
-- =============================================================
-- `[cmd]` 2026-08-14 gemessen: Je (Warengruppe, Code) das haeufigste
-- Wort im Namensteil nach dem Komma, mit Trefferquote. Von 102 Paaren
-- mit mindestens 20 Eintraegen:
--
--   80-100 %  eindeutig                   22 Paare, 814 Lebensmittel
--   60-79 %   tragfaehig                   6 Paare, 433
--   40-59 %   schwach                      4 Paare, 125
--   unter 40 % KEINE Bedeutung ableitbar  70 Paare, 2.992
--
-- **69 % der Paare tragen keine ableitbare Bedeutung.** Eine
-- Code-Tabelle waere zu zwei Dritteln geraten. `[cmd]` Der Befund
-- bestaetigt sich am Beispiel 600: Saft (F, 53), Kaese (M, 34),
-- geraeuchert (T, 24), geroestet (H, 11) — derselbe Code, vier
-- Bedeutungen.
-- `[cmd]` Ebenso ist Code 000 bedeutungslos: das haeufigste Wort
-- erreicht dort 3-11 %. Es ist der Standardwert "keine Zubereitung".
--
-- `[read]` Eine offizielle BLS-Schluesseltabelle liegt NICHT im Repo:
-- `BLS_4_0_Components_DE_EN.xlsx` enthaelt Naehrstoffcodes,
-- `BLS_4_0_Daten_2025_DE.xlsx` die Lebensmittelliste selbst (dieselbe
-- Quelle wie unsere Tabelle).
--
-- BERICHTIGT 2026-08-14: Hier stand, `BLS_4_0_Dokumentation_DE.pdf`
-- benutze eingebettete Teilfonts, deren Text sich nicht auslesen lasse.
-- `[cmd]` Das ist FALSCH — die Datei traegt ToUnicode-CMaps,
-- `pdftotext -layout` liefert 1.078 Zeilen sauberen Text.
-- Die Schlussfolgerung bleibt trotzdem richtig, nur aus anderem Grund:
-- `[read]` Kapitel 2.4 "BLS Code-Systematik" umfasst drei Saetze und EIN
-- Beispiel (`C131000 — Hafer ganzes Korn, roh — Getreide`). Es nennt
-- weder die zwanzig Gruppenbuchstaben noch die Bedeutung der Stellen
-- 5-7. Abgeleitet ist hier also nicht die zweite Wahl, sondern die
-- einzige. Siehe docs/ssot/45-bls-dokumentation.md.
--
-- =============================================================
-- STATTDESSEN: DIE WOERTER, DIE IM NAMEN STEHEN
-- =============================================================
-- Die Zubereitung steht ausgeschrieben im Namen ("Hähnchen Brustfilet,
-- roh"). `[cmd]` 16 Woerter kommen mindestens 40x vor und sind ueber
-- alle Warengruppen eindeutig — kein Ratebedarf.
--
-- ABER: Wort und Code decken sich nicht vollstaendig. `[cmd]` Fuer
-- "roh": 509 Lebensmittel tragen beides, 338 nur den Code, 153 nur das
-- Wort. **Deshalb filtert diese Tabelle ueber BEIDES** — Code ODER
-- Wort. Nur eines von beiden liesse je nach Richtung 338 oder 153
-- Eintraege fallen.
-- =============================================================

BEGIN;

CREATE TABLE IF NOT EXISTS nutrition.preparation_kinds (
  code         TEXT PRIMARY KEY,
  label_de     TEXT NOT NULL,
  name_pattern TEXT,          -- Wortgrenzen-Regex auf den gefalteten Namen
  bls_codes    TEXT[],        -- Zubereitungscodes, die ebenfalls zaehlen
  sort_order   INTEGER NOT NULL DEFAULT 0,
  herkunft     TEXT NOT NULL  -- wie die Zuordnung belegt ist
);

COMMENT ON TABLE nutrition.preparation_kinds IS
  'Zubereitungsarten fuer den Suchfilter. ABGELEITET aus den Namen des '
  'Bestands, nicht aus einer offiziellen BLS-Schluesseltabelle — eine '
  'solche liegt nicht vor. Jede Zeile traegt in `herkunft`, worauf sie '
  'sich stuetzt.';

-- Die Woerter selbst sind belegt: `[cmd]` je Zeile die gemessene
-- Haeufigkeit im Bestand. Die bls_codes stehen nur dort, wo die
-- Ableitung eine Quote ueber 60 % erreichte.
INSERT INTO nutrition.preparation_kinds
  (code, label_de, name_pattern, bls_codes, sort_order, herkunft) VALUES
  ('roh',           'roh',                  '\mroh\M',                  ARRAY['100'], 10,
   '[cmd] Wort 662x im Namen; Code 100 zu 60-96 % je Warengruppe'),
  ('gekocht',       'gekocht',              '\mgekocht\M',              NULL, 20,
   '[cmd] Wort 284x im Namen'),
  ('gebraten',      'gebraten',             '\mgebraten\M',             NULL, 30,
   '[cmd] Wort 562x im Namen (inkl. "gebraten ohne Fett" 480x)'),
  ('gegrillt',      'gegrillt',             '\mgegrillt\M',             NULL, 40,
   '[cmd] Wort 149x im Namen'),
  ('gebacken',      'gebacken',             '\mgebacken\M',             NULL, 50,
   '[cmd] Wort 105x im Namen'),
  ('geduenstet',    'gedünstet',            '\mgeduenstet\M',           NULL, 60,
   '[cmd] Wort 106x im Namen'),
  ('geschmort',     'geschmort',            '\mgeschmort\M',            NULL, 70,
   '[cmd] Wort 164x im Namen'),
  ('geraeuchert',   'geräuchert',           '\mgeraeuchert\M',          NULL, 80,
   '[cmd] Wort 48x im Namen — Code 600 NICHT verwendet, dort mehrdeutig'),
  ('tiefgefroren',  'tiefgefroren',         '\mtiefgefroren\M',         NULL, 90,
   '[cmd] Wort 430x im Namen'),
  ('konserve',      'Konserve',             '\mkonserve\M',             NULL, 100,
   '[cmd] Wort 136x im Namen'),
  ('getrocknet',    'getrocknet',           '\m(getrocknet|trocken)\M', NULL, 110,
   '[cmd] Woerter zusammen >= 40x im Namen')
ON CONFLICT (code) DO UPDATE SET
  label_de = EXCLUDED.label_de,
  name_pattern = EXCLUDED.name_pattern,
  bls_codes = EXCLUDED.bls_codes,
  sort_order = EXCLUDED.sort_order,
  herkunft = EXCLUDED.herkunft;

-- --- Warengruppen: der erste Buchstabe des BLS-Codes ---
-- `[cmd]` 20 Gruppen. Die Bezeichnungen sind hier NICHT abgeleitet,
-- sondern aus den Kategorienamen des Bestands uebernommen, wo sie
-- eindeutig sind; sonst bleibt das Feld leer und die Gruppe wird nicht
-- angeboten.
CREATE TABLE IF NOT EXISTS nutrition.food_groups (
  code       TEXT PRIMARY KEY,
  label_de   TEXT,
  ist_gericht BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  herkunft   TEXT NOT NULL
);

COMMENT ON TABLE nutrition.food_groups IS
  'Warengruppen = erster Buchstabe des BLS-Codes. `label_de` ist NULL, '
  'wo sich keine eindeutige Bezeichnung belegen laesst — solche Gruppen '
  'werden im Filter nicht angeboten.';

INSERT INTO nutrition.food_groups (code, label_de, ist_gericht, sort_order, herkunft) VALUES
  ('B', 'Brot & Backwaren',        false, 10,  '[cmd] Kategorie "Brot" dominiert'),
  ('C', 'Getreide & Stärke',       false, 20,  '[cmd] Kategorie "Rohe Körner, Flocken"'),
  ('D', 'Süßwaren & Gebäck',       false, 30,  '[cmd] Kategorie "Backwaren & Gebäck"'),
  ('E', 'Eier',                    false, 40,  '[cmd] Namen beginnen mit Hühnerei'),
  ('F', 'Obst',                    false, 50,  '[cmd] Kategorie "OBST"'),
  ('G', 'Gemüse',                  false, 60,  '[cmd] Kategorie "GEMÜSE"'),
  ('H', 'Nüsse & Samen',           false, 70,  '[cmd] Namen: Kern, Nuss, Mandel'),
  ('K', 'Kartoffeln & Hülsenfrüchte', false, 80, '[cmd] Namen: Kartoffel, Linse, Bohne'),
  ('M', 'Milch & Käse',            false, 90,  '[cmd] Kategorie "Käse"/"Milch"'),
  ('N', 'Fette & Öle',             false, 100, '[cmd] Namen: Öl, Butter, Margarine'),
  ('P', 'Getränke',                false, 110, '[cmd] Namen: Saft, Wein, Bier'),
  ('Q', 'Würzmittel & Zutaten',    false, 120, '[cmd] Namen: Gewürz, Sauce, Essig'),
  ('S', 'Süßwaren',                false, 130, '[cmd] Kategorie "SÜSSES & SNACKS"'),
  ('T', 'Fisch & Meerestiere',     false, 140, '[cmd] Kategorie "Magerer Seefisch"'),
  ('U', 'Fleisch',                 false, 150, '[cmd] Kategorien Rind/Schwein/Lamm'),
  ('V', 'Geflügel',                false, 160, '[cmd] Kategorie "Geflügel"'),
  ('W', 'Wurstwaren',              false, 170, '[cmd] Kategorie "Wurstwaren & Aufschnitt"'),
  ('X', 'Fertiggerichte',          true,  180, '[cmd] zusammengesetzte Gerichte, sort_weight 0'),
  ('Y', 'Menükomponenten',         true,  190, '[cmd] zusammengesetzte Gerichte, sort_weight 0')
ON CONFLICT (code) DO UPDATE SET
  label_de = EXCLUDED.label_de,
  ist_gericht = EXCLUDED.ist_gericht,
  sort_order = EXCLUDED.sort_order,
  herkunft = EXCLUDED.herkunft;

-- Rechte wie bei den uebrigen Stammdaten: lesen fuer angemeldete
-- Nutzer, schreiben nur ueber die Kette.
ALTER TABLE nutrition.preparation_kinds ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutrition.food_groups ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS preparation_kinds_select ON nutrition.preparation_kinds;
CREATE POLICY preparation_kinds_select ON nutrition.preparation_kinds
  FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS food_groups_select ON nutrition.food_groups;
CREATE POLICY food_groups_select ON nutrition.food_groups
  FOR SELECT TO authenticated USING (true);

GRANT SELECT ON nutrition.preparation_kinds, nutrition.food_groups
  TO authenticated, service_role;

-- --- Selbstkontrolle ---
DO $$
DECLARE
  v_prep int;
  v_grp  int;
  v_leer int;
BEGIN
  SELECT COUNT(*) INTO v_prep FROM nutrition.preparation_kinds;
  SELECT COUNT(*) INTO v_grp  FROM nutrition.food_groups;
  -- Jede Zubereitungsart MUSS im Bestand vorkommen. Ein Filter, den
  -- niemand setzen kann, weil kein Eintrag ihn traegt, darf nicht
  -- angeboten werden.
  SELECT COUNT(*) INTO v_leer FROM nutrition.preparation_kinds pk
   WHERE NOT EXISTS (
     SELECT 1 FROM nutrition.foods f
      WHERE nutrition.search_fold(f.name_de) ~ pk.name_pattern
         OR (pk.bls_codes IS NOT NULL AND substr(f.bls_code,5,3) = ANY(pk.bls_codes)));

  IF v_prep = 0 OR v_grp = 0 THEN
    RAISE EXCEPTION 'Stammdaten leer: % Zubereitungen, % Warengruppen', v_prep, v_grp;
  END IF;
  IF v_leer > 0 THEN
    RAISE EXCEPTION '% Zubereitungsart(en) ohne einen einzigen Treffer', v_leer;
  END IF;
  RAISE NOTICE 'OK: % Zubereitungsarten, % Warengruppen, alle belegt', v_prep, v_grp;
END $$;

COMMIT;
