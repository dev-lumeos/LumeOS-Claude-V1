-- =============================================================
-- 022 — Ableitbare Suchaliase erzeugen
-- Datum: 2026-08-13 · Laeuft NACH 020. Idempotent.
-- Grundlage: docs/ssot/41-lebensmittelsuche-wortschatz.md
-- =============================================================
--
-- ANLASS: `[cmd]` 1.928 von 1.944 zweiwortigen Namenskoepfen (99,2 %)
-- sind unerreichbar, wenn ein Mensch sie zusammenschreibt. Die Suche
-- vergleicht tokenweise als Teilstring — "haehnchenbrust" steckt NICHT
-- in "haehnchen brustfilet", das Leerzeichen steht dazwischen.
--
-- Ein Leerzeichen im Bestandsnamen ist eine Mauer, ein fehlendes in der
-- Anfrage nicht: `[cmd]` "gemuese mischung" und "gemuesemischung"
-- liefern beide 55 Treffer, weil beide Woerter im zusammengeschriebenen
-- Namen als Teilstring stecken. Die Ableitung schliesst genau diese
-- Asymmetrie.
--
-- =============================================================
-- WARUM `source = 'derived'` UND NICHT 'editorial'
-- =============================================================
-- `[cmd]` Heute stehen ALLE 21.420 Aliase auf 'editorial', obwohl sie
-- mechanisch aus dem Namen erzeugt sind (Name, Name gefaltet,
-- Uebersetzung). Nichts daran ist redaktionell.
--
-- Das ist bis heute nur eine Fehlbezeichnung. Mit diesem Schritt wird es
-- teuer: nach dem Einspielen liesse sich Abgeleitetes nicht mehr von
-- Gepflegtem trennen — und genau diese Trennung braucht der naechste
-- Schritt (Dialektaliase aus Fehlsuchen, siehe TODO). Wer spaeter
-- fragt "welche Aliase hat ein Mensch gepflegt?", bekaeme 35.000
-- ununterscheidbare Zeilen.
--
-- 'ai_generated' waere ebenfalls falsch: hier laeuft kein Modell,
-- sondern `replace(name, ' ', '')`. Eine Zeichenkettenumformung als
-- KI-Erzeugnis zu markieren, verschleiert die Herkunft in die andere
-- Richtung.
--
-- Deshalb ein vierter Wert. Der CHECK wird erweitert, nicht ersetzt —
-- bestehende Zeilen bleiben gueltig.
-- =============================================================

BEGIN;

-- --- Schritt 1: 'derived' als Herkunft zulassen ---
ALTER TABLE nutrition.food_aliases
  DROP CONSTRAINT IF EXISTS food_aliases_source_check;
ALTER TABLE nutrition.food_aliases
  ADD CONSTRAINT food_aliases_source_check
  CHECK (source = ANY (ARRAY['editorial','ai_generated','user','derived','curated_nebenname']));

COMMENT ON COLUMN nutrition.food_aliases.source IS
  'editorial = von Hand gepflegt · ai_generated = von einem Modell '
  'vorgeschlagen · user = aus Nutzereingabe · derived = mechanisch aus '
  'dem Bestandsnamen abgeleitet (Kettenschritt 022), reproduzierbar und '
  'nicht pflegebeduerftig · curated_nebenname = kuratierter Nebenname '
  'aus anzeigenamen.jsonl.';

-- --- Schritt 2: Kopf ohne Leerzeichen ---
-- Der Kopf ist der Teil vor dem ersten Komma: "Haehnchen Brustfilet"
-- aus "Haehnchen Brustfilet, roh". Das ist der Teil, den ein Mensch
-- zusammenschreibt; der Rest hinter dem Komma ist Zubereitung.
-- Nur Koepfe MIT Leerzeichen erzeugen etwas Neues.
INSERT INTO nutrition.food_aliases (food_id, alias, locale, source)
SELECT f.id,
       nutrition.search_fold(replace(btrim(regexp_replace(split_part(f.name_de, ',', 1), '\([^)]*\)?', '', 'g')), ' ', '')),
       'de', 'derived'
FROM nutrition.foods f
WHERE COALESCE(f.name_de,'') <> ''
  AND btrim(split_part(f.name_de, ',', 1)) LIKE '% %'
  AND length(nutrition.search_fold(replace(btrim(regexp_replace(split_part(f.name_de, ',', 1), '\([^)]*\)?', '', 'g')), ' ', ''))) >= 4
ON CONFLICT DO NOTHING;

-- --- Schritt 3: ganzer Name ohne Trennzeichen ---
-- Faengt die Faelle, in denen jemand die Zubereitung mittippt
-- ("haehnchenbrustfiletroh") und dient als Auffangnetz fuer Namen ohne
-- Komma. Klammerinhalte fliegen auch hier raus — sie sind Zusaetze
-- ("(Ofen)", "(Pfanne)"), keine Namensbestandteile.
INSERT INTO nutrition.food_aliases (food_id, alias, locale, source)
SELECT f.id,
       nutrition.search_fold(regexp_replace(
         regexp_replace(f.name_de, '\([^)]*\)?', '', 'g'), '[^[:alnum:]]+', '', 'g')),
       'de', 'derived'
FROM nutrition.foods f
WHERE COALESCE(f.name_de,'') <> ''
  AND length(nutrition.search_fold(regexp_replace(
        regexp_replace(f.name_de, '\([^)]*\)?', '', 'g'), '[^[:alnum:]]+', '', 'g'))) >= 4
ON CONFLICT DO NOTHING;

-- --- Schritt 4: Schraegstrich-Haelften einzeln ---
-- `[cmd]` 836 Namen tragen einen Schraegstrich: "Karotte/Moehre",
-- "Dorsch/Kabeljau", "Rind Hals/Kamm/Nacken". Beide Bezeichnungen sind
-- gemeint, aber nur die Gesamtzeichenkette ist heute auffindbar.
-- Das ist die vorhandene, funktionierende Antwort des Bestands auf
-- dieselbe Frage — hier wird sie nur konsequent angewandt.
--
-- ZWEI EINSCHRAENKUNGEN, im ersten Anlauf gemessen und dann eingebaut:
--
-- 1. KLAMMERN RAUS. `[cmd]` Ohne Bereinigung entstanden 1.492 Aliase mit
--    Klammern, darunter Bruchstuecke wie "speiseeis(frucht". Eine
--    oeffnende Klammer ohne schliessende ist kein Suchbegriff.
--
-- 2. NUR DAS LETZTE WORT-PAAR TEILEN. `[cmd]` Der naive Split an '/'
--    erzeugte aus "Champignonsauce von heller/weisser Grundsauce" das
--    Bruchstueck "weisser grundsauce" — das Adjektiv reisst vom
--    Substantiv ab und ergibt Unsinn. Deshalb wird nur geteilt, wenn
--    das Stueck EIN Wort ist (Karotte/Moehre, Dorsch/Kabeljau,
--    Hals/Kamm/Nacken) oder mit dem vorangehenden Wort ein sinnvolles
--    Paar bildet. Mehrwortige Stuecke werden uebersprungen.
--    *Lieber 200 Aliase weniger als 800 Bruchstuecke, die Fehltreffer
--    erzeugen.*
INSERT INTO nutrition.food_aliases (food_id, alias, locale, source)
SELECT DISTINCT f.id, nutrition.search_fold(btrim(teil)), 'de', 'derived'
FROM nutrition.foods f
CROSS JOIN LATERAL unnest(
  string_to_array(
    btrim(regexp_replace(split_part(f.name_de, ',', 1), '\([^)]*\)?', '', 'g')),
    '/')) AS teil
WHERE COALESCE(f.name_de,'') <> ''
  AND split_part(f.name_de, ',', 1) LIKE '%/%'
  AND btrim(teil) NOT LIKE '% %'          -- nur einwortige Stuecke
  AND btrim(teil) !~ '[()]'
  AND length(nutrition.search_fold(btrim(teil))) >= 4
ON CONFLICT DO NOTHING;

-- --- Schritt 5: Index auf den GEFALTETEN Alias ---
-- `[cmd]` Ohne diesen Index kostet die Ableitung Laufzeit: der Median
-- ueber fuenf typische Anfragen stieg von 68,5 ms auf 143,2 ms — mehr
-- als das Doppelte.
--
-- Der Grund ist nicht die Zeilenzahl allein, sondern dass der
-- VORHANDENE Trigram-Index nutzlos ist: er liegt auf `alias`, die
-- Abfrage filtert aber auf `search_fold(alias)`. `[cmd]` Der Plan zeigte
-- einen Seq Scan ueber alle Zeilen.
--
-- Ein Index auf den AUSDRUCK behebt das. Zulaessig, weil `[cmd]`
-- `search_fold` als IMMUTABLE deklariert ist (provolatile='i').
-- `[cmd]` Ergebnis: 143,2 ms -> 83,1 ms bei 52 % mehr Zeilen, und der
-- Plan nutzt einen Bitmap Heap Scan statt des Seq Scan.
CREATE INDEX IF NOT EXISTS idx_food_aliases_fold_trgm
  ON nutrition.food_aliases USING gin (nutrition.search_fold(alias) gin_trgm_ops);

-- --- Selbstkontrolle ---
DO $$
DECLARE
  v_derived int;
  v_gesamt  int;
  v_leer    int;
BEGIN
  SELECT COUNT(*) INTO v_derived FROM nutrition.food_aliases WHERE source='derived';
  SELECT COUNT(*) INTO v_gesamt  FROM nutrition.food_aliases;
  SELECT COUNT(*) INTO v_leer    FROM nutrition.food_aliases WHERE btrim(alias)='';

  IF v_derived = 0 THEN
    RAISE EXCEPTION 'Keine abgeleiteten Aliase entstanden — lief 020 vorher?';
  END IF;
  IF v_leer > 0 THEN
    RAISE EXCEPTION 'Leere Aliase entstanden: %', v_leer;
  END IF;
  RAISE NOTICE 'OK: % abgeleitete Aliase, % gesamt', v_derived, v_gesamt;
END $$;

COMMIT;
