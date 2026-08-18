-- Die Nachweiskopien wieder wegraeumen — Gegenstueck zu
-- `medical-nachweis-an.sql`.
--
-- Aufruf (Standard: test-user@lumeos.local):
--   docker exec -i supabase_db_LumeOS-Claude-V1 psql -U postgres -d postgres \
--     -v ON_ERROR_STOP=1 \
--     < supabase/_pipeline/_testdaten/medical-nachweis-aus.sql
--
-- `[read]` Tom, 2026-08-18: „Die Gegenpruefung zaehlt Zeilen, nicht
-- Abwesenheit: lab_reports und lab_result_values muessen danach exakt
-- bei 2 und 6 stehen, und tom.seed muss sie alle haben. Eine Zaehlung
-- auf null bei test-user reicht nicht — sie koennte auch bedeuten, dass
-- zu viel geloescht wurde."
--
-- Deshalb zaehlt dieses Skript am Ende DREI Dinge:
--   1. das Zielkonto  — soll 0 und 0 sein
--   2. das Quellkonto — soll 2 und 6 sein
--   3. die Tabellen insgesamt — soll ebenfalls 2 und 6 sein
-- Erst wenn 2 und 3 uebereinstimmen, ist belegt, dass nur die Kopien
-- verschwunden sind und nichts sonst.

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

DELETE FROM medical.lab_result_values WHERE user_id = :ziel::uuid;
DELETE FROM medical.lab_reports       WHERE user_id = :ziel::uuid;

COMMIT;

\echo '=== 1. Zielkonto — Soll: 0 und 0 ==='
SELECT (SELECT count(*) FROM medical.lab_reports       WHERE user_id = :ziel::uuid) AS berichte,
       (SELECT count(*) FROM medical.lab_result_values WHERE user_id = :ziel::uuid) AS werte;

\echo '=== 2. Quellkonto tom.seed — Soll: 2 und 6 ==='
SELECT (SELECT count(*) FROM medical.lab_reports       WHERE user_id = :quelle::uuid) AS berichte,
       (SELECT count(*) FROM medical.lab_result_values WHERE user_id = :quelle::uuid) AS werte;

\echo '=== 3. Tabellen insgesamt — Soll: 2 und 6 (nichts sonst uebrig) ==='
SELECT (SELECT count(*) FROM medical.lab_reports)       AS berichte,
       (SELECT count(*) FROM medical.lab_result_values) AS werte;
