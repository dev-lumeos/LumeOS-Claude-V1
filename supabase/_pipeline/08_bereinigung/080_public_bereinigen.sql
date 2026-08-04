-- 080 Governance-Reste aus dem Schema public entfernen
--
-- Kontext: Der Governance-Cluster wurde am 2026-08-03 nach _archive/governance/
-- verschoben (Commit 59cb41e). In der Datenbank standen die zugehoerigen
-- Tabellen weiter in public und blockierten das Schema fuer Produktnutzung.
--
-- Vorpruefung [cmd] 2026-08-03:
--   keine Fremdschluessel von oder nach public
--   nutrition verweist nirgends auf public
--   update_updated_at haengt an genau einem Trigger auf workorders
--   die uebrigen 31 Funktionen in public gehoeren zur Erweiterung pg_trgm
--
-- Sicherung vor Ausfuehrung:
--   backup/schema/2026-08-03_public_vor_drop.sql
--   backup/data/2026-08-03_public_vor_drop.dump
--
-- Idempotent. Nach diesem Schritt ist public frei fuer Produktschemata.

BEGIN;

DROP TABLE IF EXISTS public.execution_tokens     CASCADE;
DROP TABLE IF EXISTS public.wo_failure_events    CASCADE;
DROP TABLE IF EXISTS public.governance_artefacts CASCADE;
DROP TABLE IF EXISTS public.workorders           CASCADE;

DROP FUNCTION IF EXISTS public.update_updated_at() CASCADE;

DROP TYPE IF EXISTS public.wo_state CASCADE;
DROP TYPE IF EXISTS public.wo_phase CASCADE;
DROP TYPE IF EXISTS public.wo_type  CASCADE;

COMMIT;