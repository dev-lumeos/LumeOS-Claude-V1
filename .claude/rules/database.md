# Database Rules

## Migrations
- Immer reversibel (UP + DOWN)
- Naming: {timestamp}_{description}.sql
- Kein DROP ohne requires_rollback_plan
- Kein DELETE CASCADE ohne Review

## RLS
- Alle Tabellen haben RLS enabled
- Kein Public Read ohne explizite Policy
- Service Role nur für Server-to-Server

## Schema
- Tabellen: snake_case, plural
- PKs: UUID mit gen_random_uuid()
- Timestamps: created_at + updated_at immer
- Soft Delete: deleted_at (kein hard delete)

## Environments
- coding/* ↔ local-dev (Supabase)
- dev      ↔ remote-dev
- main     ↔ remote-main
- Nie remote-main direkt ändern ohne PR

## Security
- Medical Daten: security-specialist Review Pflicht
- Auth Changes: security-specialist Review Pflicht
- Keine Credentials in Migrations
