# Paperclip — Funktion und Rolle in LumeOS

## Was Paperclip IST

Paperclip ist das **visuelle Frontend** für die LumeOS Work Order Pipeline.
Es liest aus der Supabase Control Plane DB und zeigt den Status unserer WOs an.

**Paperclip = Fenster in unser System. Nichts mehr.**

---

## Was Paperclip NICHT ist

- Kein Agent Orchestrator
- Keine Logik-Schicht
- Keine Approval Gates
- Keine Heartbeats
- Kein Ersatz für SAT-Check, Scheduler oder Governance Compiler
- Kein eigenständiges AI System

**Die gesamte Logik haben wir bereits gebaut:**
- SAT-Check (Port 9001) — deterministisch
- Scheduler (Port 9002) — WO Queue
- Governance Compiler (Port 9003) — Artefakt Erstellung
- Ed25519 Token — Signing/Verification
- triple_hash — Determinismus Beweis
- Spark A/B — Execution
- Supabase — Audit Trail

---

## Was Paperclip anzeigen soll

Paperclip verbindet sich mit der lokalen Supabase (Port 54322) und zeigt:

```
workorders            → WO ID, Status, created_at, agent_type, phase
governance_artefacts  → Hash, wo_id, compiled_by, compiled_at
wo_failure_events     → wo_id, failure_class, attempt, timestamp
execution_tokens      → nonce, wo_id, expires_at, verified
```

Das ist alles. Tom sieht live was durch Brain → Law → Muscle läuft.

---

## Aufgabe

Verbinde Paperclip mit unserer lokalen Supabase so dass die Work Order
Tabellen in der Paperclip UI sichtbar sind.

### Schritt 1: Supabase Connection prüfen

Unsere lokale Supabase läuft auf:
```
URL:      http://localhost:54321
DB:       postgresql://postgres:postgres@localhost:54322/postgres
```

Prüfe ob Paperclip bereits eine Verbindung zu dieser DB herstellen kann
oder ob sie ihre eigene embedded Postgres nutzt.

### Schritt 2: WO Tabellen in Paperclip sichtbar machen

Paperclip soll die folgenden Tabellen aus unserer Supabase lesen:
- `workorders`
- `governance_artefacts`
- `wo_failure_events`
- `execution_tokens`

### Schritt 3: Dashboard konfigurieren

Das Paperclip Dashboard soll zeigen:
- Liste aller Work Orders mit Status (pending/running/completed/failed)
- Timeline: wann wurde ein WO erstellt, wann kompiliert, wann executed
- Failure Events mit failure_class
- Execution Token Audit Trail

### Schritt 4: Testen

Füge einen Test-WO in die Supabase ein und prüfe ob er in Paperclip erscheint:

```sql
INSERT INTO workorders (id, wo_id, state, agent_type, created_at)
VALUES (gen_random_uuid(), 'WO-test-paperclip-001', 'pending', 'micro_executor', now());
```

Dann in Paperclip UI prüfen ob der WO sichtbar ist.

---

## Wichtig

- Paperclip darf KEINE eigene Logik ausführen
- Paperclip darf KEINE Agents starten
- Paperclip darf KEINE WOs erstellen oder modifizieren
- Paperclip ist **read-only** — nur lesen und anzeigen
- Die Governance-Compiler "Agent" Konfiguration in Paperclip
  die vorher existierte war falsch — das ist gelöscht

## Supabase Schema Referenz

Migration: `supabase/migrations/20260423120000_control_plane_tables.sql`

Tabellen:
- `workorders` — state ENUM, agent_type, phase, wo_id, artefakt_hash
- `governance_artefacts` — artefakt_hash, wo_id, compiled_by, artefakt_json
- `wo_failure_events` — wo_id, failure_class, attempt, node, timestamp
- `execution_tokens` — wo_id, nonce UNIQUE, signature, expires_at
