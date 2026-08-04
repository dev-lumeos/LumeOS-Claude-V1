# DB Environments — LumeOS
# Status: AKTIV (nur lokale Umgebung)
# Supabase Cloud wird später eingerichtet

---

## Übersicht

| Umgebung | Status | Zweck |
|----------|--------|-------|
| **Local** | ✅ AKTIV | Entwicklung + Control Plane |
| **Cloud Dev** | 🔜 Später | LumeOS App (Nutrition, Training etc.) |
| **Cloud Prod** | 🔜 Später | Produktions-Daten |

---

## Lokale Supabase (aktuell genutzt)

```
Host:         localhost
API URL:      http://127.0.0.1:54321
DB:           postgresql://postgres:postgres@127.0.0.1:54322/postgres
Studio:       http://127.0.0.1:54323
```

### Keys (aus supabase status -o env holen)
```bash
# Live Keys abrufen:
supabase status -o env

# In .env eintragen:
SUPABASE_URL=http://127.0.0.1:54321
SUPABASE_SERVICE_ROLE_KEY=<aus supabase status>
SUPABASE_ANON_KEY=<aus supabase status>
```

**Wichtig:** Die Demo-Keys aus `.env.example` funktionieren nur wenn Supabase
mit dem Standard-JWT-Secret gestartet wird. Immer die Live-Keys aus
`supabase status -o env` verwenden.

### Tabellen (Control Plane)

```
workorders              → WO Queue + States + Classifier Fields
governance_artefacts    → Artefakt Audit-Trail
wo_failure_events       → Failure Pattern Detection
execution_tokens        → Replay Protection (Nonce UNIQUE)
```

### Migrations

```
supabase/migrations/
  20260423120000_control_plane_tables.sql   → Basis-Tabellen + Enums + RLS
  20260424_002_wo_classifier_fields.sql     → 12 Classifier Extension Fields
```

### Befehle

```bash
supabase start          # Lokale Supabase starten
supabase stop           # Stoppen
supabase status         # Status + URLs
supabase status -o env  # Keys als env-Format
supabase db reset       # Komplett neu aufbauen (alle Migrations)
supabase migration up   # Neue Migrations anwenden
```

### RLS (Row Level Security)

Alle Control Plane Tabellen haben RLS aktiviert.
Zugriff nur mit Service Role Key (nicht Anon Key).

```sql
-- Prüfen ob RLS aktiv:
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';
```

---

## Supabase Cloud Dev (später)

**Zweck:** LumeOS App-Daten (Nutrition, Training, Coach, User-Profile)

```
Wird eingerichtet wenn:
  - Nutrition-API implementiert wird
  - User-Auth benötigt wird
  - Daten von mehreren Geräten synchronisiert werden sollen
```

**Geplante Tabellen:**
```
users / profiles
diary_days, meal_logs, meal_items
daily_nutrition_summaries
foods, food_portions
training_sessions
supplement_logs
```

**Trennung:**
```
Lokal  → Control Plane (WOs, Governance, Audit)
Cloud  → App-Daten (User, Nutrition, Training etc.)
```

Die Control Plane Daten bleiben **immer lokal** auf dem Threadripper.
Keine Control Plane Daten gehen in die Cloud.

---

## Supabase Cloud Prod (später)

Wird definiert wenn Cloud Dev eingerichtet ist.
Separate Projekt-ID, separate Keys, kein Shared Schema mit Dev.
