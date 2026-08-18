-- Medical-Testwerte voruebergehend einem ANMELDBAREN Konto zuordnen.
--
-- Aufruf (Standard: test-user@lumeos.local):
--   docker exec -i supabase_db_LumeOS-Claude-V1 psql -U postgres -d postgres \
--     -v ON_ERROR_STOP=1 \
--     < supabase/_pipeline/_testdaten/medical-nachweis-an.sql
--
-- Anderes Zielkonto: -v ziel_email="'jemand@example.com'" voranstellen.
--
-- WOZU:
-- `[cmd]` Die sechs Werte in `medical.lab_result_values` gehoeren
-- `tom.seed@example.com`. Dieses Konto hat KEIN Passwort
-- (`auth.users.encrypted_password IS NULL`) — es ist ein Seed-Konto,
-- kein Anmeldekonto. Die RLS-Regel auf `lab_result_values` lautet
-- `auth.uid() = user_id`; ohne Anmeldung kommt also keine Zeile an.
-- Wer die Anzeige mit echten Werten pruefen will, braucht sie unter
-- einem Konto, an dem man sich anmelden kann.
--
-- `[read]` Tom, 2026-08-18: „test-user@lumeos.local ist ein Pruefkonto,
-- kein Demokonto — und Testdaten, die ueber den Auftrag hinaus
-- stehenbleiben, tauchen spaeter als echte Werte in einer Messung auf."
-- Deshalb ist dieses Skript ein PAAR: `medical-nachweis-aus.sql` raeumt
-- die Kopien wieder weg, und die Gegenpruefung zaehlt Zeilen.
--
-- WAS ES NICHT TUT:
--   * kein Schemaeingriff, keine Migration — nur INSERT/DELETE
--   * `auth.users` wird nie angefasst
--   * die Zeilen von tom.seed bleiben unveraendert (kopiert, nicht verschoben)
--
-- Wiederholbar: raeumt das Zielkonto erst, kopiert dann neu.

\if :{?ziel_email}
\else
  \set ziel_email '''test-user@lumeos.local'''
\endif
\set quelle_email '''tom.seed@example.com'''

BEGIN;

SELECT id AS ziel_id   FROM auth.users WHERE email = :ziel_email   \gset
SELECT id AS quelle_id FROM auth.users WHERE email = :quelle_email \gset

\set ziel   '''' :ziel_id   ''''
\set quelle '''' :quelle_id ''''

-- Erst raeumen (wiederholbar), dann kopieren. Die Werte haengen per
-- Fremdschluessel am Bericht, also raeumt der Bericht sie mit.
DELETE FROM medical.lab_result_values WHERE user_id = :ziel::uuid;
DELETE FROM medical.lab_reports       WHERE user_id = :ziel::uuid;

-- 1. Die Berichte. Neue Ids, damit nichts mit der Quelle kollidiert.
CREATE TEMP TABLE nachweis_berichte ON COMMIT DROP AS
SELECT r.id AS quelle_id, gen_random_uuid() AS ziel_id
FROM medical.lab_reports r
WHERE r.user_id = :quelle::uuid;

INSERT INTO medical.lab_reports (
  id, user_id, report_date, report_time, lab_name, title, source, notes
)
SELECT n.ziel_id, :ziel::uuid, r.report_date, r.report_time,
       r.lab_name, r.title, r.source, r.notes
FROM medical.lab_reports r
JOIN nachweis_berichte n ON n.quelle_id = r.id
WHERE r.user_id = :quelle::uuid;

-- 2. Die Werte, ueber die Id-Zuordnung an den neuen Bericht gehaengt.
--    Nicht ueber Datum + Laborname: zwei Berichte desselben Labors am
--    selben Tag wuerden sich sonst gegenseitig einsammeln.
--    `[cmd]` `raw_marker_name`, `match_status`, `match_candidates` und
--    `match_source` MUESSEN mitkopiert werden. Sie stammen aus
--    `142_laborimport_matching.sql`, nicht aus dem Grundschema, und
--    eine Pruefbedingung verknuepft sie mit `loinc_code`:
--      match_status IN ('exact','manual_verified') AND loinc_code IS NOT NULL
--      OR match_status IN ('ambiguous','unknown') AND loinc_code IS NULL
--                                                 AND needs_verification
--    Wer sie weglaesst, bekommt den Vorgabewert `exact` bei leerem
--    `loinc_code` — und die Einfuegung scheitert an genau dieser
--    Bedingung. (Beim ersten Lauf hier passiert.)
INSERT INTO medical.lab_result_values (
  report_id, user_id, loinc_code, marker_name_snapshot, unit_snapshot,
  value_numeric, value_text, value_operator,
  lab_reference_low, lab_reference_high, lab_reference_text,
  lab_reference_unit, lab_reference_source,
  fasting_status, source, source_detail, entry_confidence,
  needs_verification, notes,
  raw_marker_name, match_status, match_candidates, match_source
)
SELECT n.ziel_id, :ziel::uuid, v.loinc_code, v.marker_name_snapshot, v.unit_snapshot,
       v.value_numeric, v.value_text, v.value_operator,
       v.lab_reference_low, v.lab_reference_high, v.lab_reference_text,
       v.lab_reference_unit, v.lab_reference_source,
       v.fasting_status, v.source, v.source_detail, v.entry_confidence,
       v.needs_verification, v.notes,
       v.raw_marker_name, v.match_status, v.match_candidates, v.match_source
FROM medical.lab_result_values v
JOIN nachweis_berichte n ON n.quelle_id = v.report_id
WHERE v.user_id = :quelle::uuid;

COMMIT;

\echo '=== Kopiert (Ziel) ==='
SELECT (SELECT count(*) FROM medical.lab_reports       WHERE user_id = :ziel::uuid) AS berichte,
       (SELECT count(*) FROM medical.lab_result_values WHERE user_id = :ziel::uuid) AS werte;

\echo '=== Quelle unveraendert? Soll: 2 und 6 ==='
SELECT (SELECT count(*) FROM medical.lab_reports       WHERE user_id = :quelle::uuid) AS berichte,
       (SELECT count(*) FROM medical.lab_result_values WHERE user_id = :quelle::uuid) AS werte;
