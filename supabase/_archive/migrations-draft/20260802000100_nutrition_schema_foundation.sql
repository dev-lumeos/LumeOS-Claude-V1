-- STATUS: DRAFT — NICHT ANWENDEN (Job D-12, Rückbau 2026-08-02)
-- Ziel: `supabase db reset` soll den verifizierten Container-Zustand vom
--       2026-08-02 reproduzieren. Quelle: backup/schema/2026-08-01_nutrition_schema.sql,
--       verifiziert per docker exec psql am 2026-08-02 (read-only).
-- Abweichung zur historischen Migration 20240522_001:
--   - KEIN `CREATE EXTENSION pg_trgm` — die Extension ist im Container NICHT
--     installiert (pg_extension geprüft 2026-08-02). Offene Frage O-1 in
--     docs/ssot/31-migrations-rueckbau.md.
--   - KEIN `GRANT USAGE ... TO authenticated, service_role` — die Schema-ACL
--     im Container ist Default (nspacl IS NULL). Offene Frage O-2.
-- pgcrypto ist im Container vorhanden (Supabase-Standardimage); der Aufruf
-- hier ist idempotent.

-- UP
CREATE SCHEMA IF NOT EXISTS nutrition;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- DOWN (Rollback)
-- DROP SCHEMA IF EXISTS nutrition;
-- pgcrypto nicht droppen — Bestandteil des Supabase-Images.
