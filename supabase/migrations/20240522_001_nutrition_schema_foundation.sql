-- Migration: Nutrition Schema Foundation
-- Description: Creates the nutrition schema, installs required extensions (pg_trgm, pgcrypto), and sets up basic grants.
-- Tables: None (Tables are created in WO-NUTRITION-P1-003+)
-- RLS: None (No tables yet)

-- UP
CREATE SCHEMA IF NOT EXISTS nutrition;
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS pgcrypto;
GRANT USAGE ON SCHEMA nutrition TO authenticated, service_role;

-- DOWN (Rollback)
-- Revoke grants
-- REVOKE USAGE ON SCHEMA nutrition FROM authenticated, service_role;
-- Drop schema (Safe because no tables exist in this migration)
-- DROP SCHEMA IF EXISTS nutrition;
