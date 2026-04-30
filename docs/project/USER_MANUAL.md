# LumeOS User Manual — Für Tom
# Stand: April 2026

Dieses Handbuch erklärt, wie du ab jetzt mit dem deterministischen LumeOS-System arbeitest.  
Kein Theorie-Overhead. Nur was du im Alltag brauchst.

---

## 1. Was dieses System jetzt ist

Das System führt Änderungen am Code nicht mehr direkt aus.  
Jede Arbeit läuft über **Workorders**.

So funktioniert es:

1. **Du schreibst eine Workorder** — kleiner, klar begrenzter Auftrag mit erlaubten Dateien und Kriterien
2. **Preflight prüft** — darf diese WO überhaupt starten? (Schema, Locks, Stop-Rules, Night-Policy)
3. **Dispatcher führt aus** — der Agent macht die Arbeit
4. **Files Enforcement blockiert** — kein Schreiben außerhalb erlaubter Dateien
5. **Locks verhindern Konflikte** — keine zwei WOs auf denselben Dateien gleichzeitig
6. **Review-Pipeline prüft** — Spark C bewertet das Ergebnis, eskaliert zu Spark D wenn nötig
7. **Approval Queue sammelt** — alles was menschliche Entscheidung braucht, landet dort
8. **Reports zeigen** — was passiert ist, was offen ist, was entschieden werden muss

Was du nicht mehr tun solltest: direkt und unstrukturiert im Repo arbeiten.

---

## 2. Die Grundregel

```
Ich arbeite nicht direkt chaotisch im Repo.
Ich arbeite über kleine Workorders.
Jede Workorder hat: Scope, Risiko, erlaubte Dateien, Akzeptanzkriterien und Validierung.
```

Eine gute Workorder ist klein, testbar und klar begrenzt.  
Eine schlechte Workorder: `"Mach das Nutrition Modul fertig."`

---

## 3. Tagesablauf

### Morgens

```bash
# 1. Morning Report öffnen
npx tsx system/reports/morning-report.ts

# 2. Action Required prüfen
# Steht oben im Report — Approvals, Stop-Regeln, Scope-Konflikte

# 3. Pending Approvals entscheiden
npx tsx system/approval/approval-cli.ts list

# 4. Failed/Blocked Runs prüfen
npx tsx system/reports/failed-wo-report.ts

# 5. Stop-Rules prüfen (Diagnose, kein echter Stop)
npx tsx system/control-plane/stop-rules.ts --dry-run

# 6. Modell-Qualität prüfen (optional, nicht täglich nötig)
npx tsx system/reports/model-quality-report.ts
```

Nach dem Report entscheidest du:

| Situation | Aktion |
|---|---|
| Pending Approval | `approval-cli.ts grant` oder `deny` |
| Failed Run | Fehler analysieren, WO anpassen, neu starten |
| Blocked Run | Laut Failed-Report Ursache lesen, beheben |
| Stop-Rule verletzt | Ursache beseitigen, dann weiterarbeiten |
| Alles OK | Neue Workorders schreiben und starten |

---

## 4. Vor einem Run — Checkliste

**Sparks prüfen** (manuell, weil Runtime Hardening noch offen ist):

```bash
curl http://192.168.0.128:8001/v1/models    # Spark A — Orchestrator
curl http://192.168.0.188:8001/v1/models    # Spark B — Coding Worker
curl http://192.168.0.99:8001/v1/models     # Spark C — Fast Reviewer
curl http://192.168.0.101:8001/v1/models    # Spark D — Senior Reviewer
```

Antwort kommt = Spark erreichbar.  
Keine Antwort = nicht starten, Spark zuerst prüfen.

**WO-Checkliste vor Dispatch:**

```
[ ] Spark erreichbar?
[ ] System Stop inaktiv?  →  stop-rules.ts --dry-run
[ ] Keine offenen Approvals?  →  approval-cli.ts list
[ ] Workorder klein genug (max. 3–5 Dateien)?
[ ] scope_files gesetzt?
[ ] risk_category gesetzt?
[ ] acceptance_criteria vorhanden?
[ ] negative_constraints (mindestens 4)?
[ ] validation_commands gesetzt?
[ ] files_blocked gesetzt wenn nötig?
[ ] rollback_hint vorhanden wenn db-migration?
```

---

## 5. Workorder schreiben

### Pflichtfelder

| Feld | Was rein gehört |
|---|---|
| `workorder_id` | Format `WO-[modul]-[nummer]`, z.B. `WO-nutrition-042` |
| `agent_id` | Welcher Agent — z.B. `micro-executor`, `db-migration-agent` |
| `task` | Konkrete Aufgabe — genau und begrenzt |
| `risk_category` | Kategorie — bestimmt Routing und Approval |
| `scope_files` | Nur diese Dateien darf der Agent schreiben |
| `acceptance_criteria` | Was muss nach dem Run wahr sein? |
| `negative_constraints` | Mindestens 4 — was der Agent NICHT tun darf |
| `validation_commands` | Standard: `["pnpm tsc --noEmit"]` |

### Optionale Felder

| Feld | Wann nötig |
|---|---|
| `files_blocked` | Wenn der Agent bestimmte Pfade explizit nicht anfassen darf |
| `rollback_hint` | **Pflicht bei `db-migration`** |
| `blocked_by` | Wenn diese WO erst nach einer anderen starten darf |
| `context_files` | Dateien zum Lesen, nicht zum Schreiben |

---

### Beispiel: Low-Risk Workorder

```json
{
  "workorder_id": "WO-nutrition-042",
  "agent_id": "micro-executor",
  "task": "Add a TypeScript helper function calculateBMI(weightKg, heightM) to services/nutrition-api/src/utils/metrics.ts. Returns number (kg/m²). Add JSDoc.",
  "risk_category": "standard",
  "scope_files": [
    "services/nutrition-api/src/utils/metrics.ts"
  ],
  "acceptance_criteria": [
    "function calculateBMI is exported",
    "returns number",
    "JSDoc with @param and @returns",
    "TypeScript compiles without errors"
  ],
  "negative_constraints": [
    "NIEMALS außerhalb scope_files schreiben",
    "NIEMALS Side-Effects oder Logging",
    "NIEMALS neue Dependencies hinzufügen",
    "NIEMALS bestehende Exports ändern"
  ],
  "validation_commands": ["pnpm tsc --noEmit", "pnpm test"]
}
```

---

### Beispiel: High-Risk Workorder (db-migration)

```json
{
  "workorder_id": "WO-db-007",
  "agent_id": "db-migration-agent",
  "task": "Add user_goals table to Supabase: id uuid, user_id uuid references auth.users, goal_type text, target_value numeric, created_at timestamptz. RLS: only owner can read/write.",
  "risk_category": "db-migration",
  "scope_files": [
    "supabase/migrations/20260429_001_add_user_goals.sql"
  ],
  "rollback_hint": "DROP TABLE IF EXISTS user_goals; — keine abhängigen Tabellen",
  "acceptance_criteria": [
    "table user_goals created",
    "RLS enabled on user_goals",
    "migration is idempotent"
  ],
  "negative_constraints": [
    "NIEMALS bestehende Tabellen ändern",
    "NIEMALS RLS deaktivieren",
    "NIEMALS supabase db push aufrufen",
    "NIEMALS DROP TABLE ohne Rollback-Plan"
  ],
  "validation_commands": ["pnpm tsc --noEmit"],
  "requires_approval": true
}
```

---

## 6. Risk Categories — was bedeutet was?

| risk_category | Darf automatisch laufen? | Braucht Spark D? | Braucht Approval? | Wann nutzen |
|---|:---:|:---:|:---:|---|
| `standard` | ✅ ja | ❌ nein | ❌ nein | Normale Code-Änderungen |
| `docs` | ✅ ja | ❌ nein | ❌ nein | Nur Dokumentation |
| `i18n` | ✅ ja | ❌ nein | ❌ nein | Nur Übersetzungen |
| `test` | ✅ ja | ❌ nein | ❌ nein | Nur Testdateien |
| `security` | ⚠️ vorsichtig | ✅ ja | ❌ nein | Sicherheitsrelevanter Code |
| `auth` | ⚠️ vorsichtig | ✅ ja | ❌ nein | Login, Sessions, Tokens |
| `rls` | ⚠️ vorsichtig | ✅ ja | ❌ nein | Supabase Row Level Security |
| `shared-core` | ⚠️ vorsichtig | ✅ ja | ❌ nein | Shared Packages (breaking changes) |
| `architecture` | ⚠️ vorsichtig | ✅ ja | ❌ nein | Strukturelle Änderungen |
| `db-migration` | 🔴 nein | ✅ ja | ✅ **ja** | Supabase Schema-Änderungen |
| `payments` | 🔴 nein | ✅ ja | ✅ **ja** | Stripe, Billing, Checkout |
| `medical` | 🔴 nein | ✅ ja | ✅ **ja** | Health Data, HIPAA-sensitiv |
| `release` | 🔴 nein | ✅ ja | ✅ **ja** | Deployment, CI/CD, Versionierung |

**Faustregel:**
- Grün (`standard`, `docs`, `i18n`, `test`) = einfach laufen lassen
- Gelb (`security`, `auth`, `rls`, `shared-core`, `architecture`) = läuft, aber Spark D reviewt immer
- Rot (`db-migration`, `payments`, `medical`, `release`) = erst Approval, dann Start

---

## 7. Was Preflight macht

Preflight ist die Startkontrolle. Läuft vor jedem Dispatch automatisch.

### Ergebnisse

| Ergebnis | Bedeutung | Was tun |
|---|---|---|
| **GO** | Kann starten | nichts — läuft automatisch |
| **HOLD** | Temporär blockiert | Ursache beheben, dann nochmal |
| **REJECT** | Workorder kaputt oder unzulässig | WO reparieren |

### Typische HOLD-Gründe

- Workorder läuft bereits
- Wartet auf Approval
- `blocked_by` noch nicht fertig
- Scope-Lock Konflikt (andere WO hat dieselben Dateien)
- DB-Migration-Lock aktiv
- System Stop aktiv
- Night-Run-Policy blockiert (Kategorie braucht Approval)

### Typische REJECT-Gründe

- Schema ungültig (Format-Fehler in der WO)
- Agent nicht in Registry
- `scope_files` leer
- `rollback_hint` fehlt bei `db-migration`
- WO ist bereits `done` oder `failed`

---

## 8. Approval Queue benutzen

### Wann entsteht ein Approval?

- Review-Pipeline ergibt `HUMAN_NEEDED`
- WO-Kategorie ist `db-migration`, `payments`, `medical` oder `release`
- Manuelle `requires_approval: true` in der WO

### Befehle

```bash
# Alle offenen Approvals anzeigen
npx tsx system/approval/approval-cli.ts list

# Alle Approvals (auch erledigte)
npx tsx system/approval/approval-cli.ts all

# Details zu einem Approval anzeigen
npx tsx system/approval/approval-cli.ts show APP-20260429-123456

# Approval freigeben
npx tsx system/approval/approval-cli.ts grant APP-20260429-123456

# Approval ablehnen (mit Begründung)
npx tsx system/approval/approval-cli.ts deny APP-20260429-123456 "Scope zu groß"

# Abgelaufene Approvals aufräumen
npx tsx system/approval/approval-cli.ts expire
```

### Wann grant, wann deny?

**Grant** wenn:
- Der vorgeschlagene Schritt ist sinnvoll
- Scope und Dateien passen zum Auftrag
- Du den Risk verstehst und trägst

**Deny** wenn:
- Die Änderung geht zu weit
- Scope stimmt nicht
- Timing ist falsch (z.B. andere Migration läuft noch)

**Wichtig:** Ein Approval bedeutet nicht "alles ist sicher". Es bedeutet: du hast diesen konkreten Schritt in diesem Kontext freigegeben.

---

## 9. Reports lesen

### Morning Report

```bash
npx tsx system/reports/morning-report.ts
```

Wo gespeichert: `system/reports/morning-report-YYYY-MM-DD.md`

Zeigt: Action Required, Pending Approvals, Failed/Blocked Runs, Completed Runs, Pipeline Metrics, Next Actions.

Mit `--since` für Zeitraum:
```bash
npx tsx system/reports/morning-report.ts 2026-04-29
```

---

### Run Summary

```bash
npx tsx system/reports/run-summary-generator.ts RUN-20260429-6298
npx tsx system/reports/run-summary-generator.ts --all
```

Wo gespeichert: `system/reports/runs/`

Zeigt: Was in einem einzelnen Run passiert ist — Status, Changed Files, Review-Ergebnisse, Fehler, Next Action.

---

### Failed WO Report

```bash
npx tsx system/reports/failed-wo-report.ts
```

Wo gespeichert: `system/reports/failed-wo-report.md`

Zeigt: Alle blockierten und fehlgeschlagenen Runs, sortiert nach Dringlichkeit — Approvals zuerst, dann Scope-Konflikte, dann Preflight-Fehler, dann normale Fehler.

---

### Model Quality Report

```bash
npx tsx system/reports/model-quality-report.ts
```

Wo gespeichert: `system/reports/model-quality-report.md`

Zeigt: Pass-Rate, invalid_json-Rate, Latenz und Escalation-Rate pro Tier (Spark C, Spark D). Nützlich nach Night-Runs oder wenn Reviews ungewöhnlich oft eskalieren.

---

### WO Dossier

```bash
# Einzelne WO
npx tsx system/reports/wo-dossier.ts WO-nutrition-001

# Alle abgeschlossenen WOs
npx tsx system/reports/wo-dossier.ts --all-completed
```

Wo gespeichert: `system/reports/dossiers/`

Zeigt: Vollständige Archivierung einer WO — alle Runs, Fehler, Reviews, Approvals, Changed Files, Follow-up-Empfehlung.

---

## 10. Was tun bei Fehlern?

| Fehler | Was bedeutet das | Was tun |
|---|---|---|
| `HUMAN_NEEDED` | Review-Pipeline hat eskaliert und braucht deine Entscheidung | `approval-cli.ts list` → grant oder deny |
| `BLOCKED_APPROVAL` | WO wartet auf Approval | `approval-cli.ts show <id>` → entscheiden |
| `BLOCKED_PREFLIGHT` | WO hat Schema-Fehler oder fehlendes Feld | WO-JSON prüfen: scope_files, agent_id, rollback_hint bei db-migration |
| `BLOCKED_SCOPE` | Scope-Lock-Konflikt mit anderer WO | Warten bis andere WO fertig, oder Scope prüfen |
| `BLOCKED_SYSTEM_STOP` | System Stop aktiv | `stop-rules.ts --dry-run` → Ursache beheben, dann Stop aufheben |
| `FAILED` | Run ist failed | Run Summary lesen: `run-summary-generator.ts <run_id>` |
| `invalid_json` | Spark C hat ungültige Antwort geliefert | Model Quality Report prüfen — Spark C Health checken |
| `rewrite_limit_exceeded` | Review-Pipeline hat 2x REWRITE ergebt | WO-Task klarer formulieren, WO neu starten |
| `scope_lock_conflict` | Zwei WOs wollen dieselben Dateien | Warten bis erste WO fertig |
| `files_scope_violation` | Agent hat versucht, Datei außerhalb scope_files zu schreiben | Scope-Fehler im Agent oder zu breite Permission — Run Summary lesen |
| `db_migration_conflict` | Zweite DB-Migration versucht parallel zu starten | Warten bis erste Migration fertig ist |

---

## 11. System Stop

System Stop verhindert, dass neue Runs starten.  
Er wird automatisch ausgelöst wenn Stop-Regeln verletzt sind.

### Stop-Regeln prüfen

```bash
npx tsx system/control-plane/stop-rules.ts --dry-run
```

Zeigt was verletzt ist, ohne selbst einen Stop auszulösen.

### Automatische Stop-Trigger

| Regel | Schwellwert | Bedeutet |
|---|---|---|
| Zu viele failed Runs | ≥ 5 | Etwas ist grundlegend falsch |
| Zu viele pending Approvals | ≥ 3 | Entscheidungen aufgelaufen |
| invalid_json Rate zu hoch | ≥ 50% (min. 3 Samples) | Spark C antwortet kaputt |
| Scope-Verletzungen | ≥ 2 | Scope-Enforcement greift falsch |
| Spark C Escalation Rate | ≥ 80% (min. 5 Reviews) | Spark C zu schwach für aktuelle Aufgaben |

### Stop manuell triggern oder aufheben

Manuelles Triggern und Aufheben ist technisch vorhanden (`triggerSystemStop()` / `clearSystemStop()` in `system/state/state-manager.ts`), aber aktuell nicht als separates CLI-Kommando dokumentiert.

Um einen Stop programmatisch aufzuheben, wenn nötig:

```bash
# In Node.js REPL — nur wenn du weißt was du tust:
npx tsx -e "import { clearSystemStop } from './system/state/state-manager.js'; clearSystemStop().then(() => console.log('Stop cleared'))"
```

---

## 12. Night-Run benutzen

Night-Run ermöglicht unbeaufsichtigten Betrieb. Aber: **Spark Runtime Hardening ist noch offen** (systemd, Healthcheck-Timer, Auto-Restart). Sparks können hängen. Überprüfe vorher immer den Zustand.

### Status prüfen

```bash
npx tsx system/control-plane/night-run-policy.ts status
```

Zeigt: ob Night-Run aktiv ist, ob alle 5 Readiness-Checks bestanden sind, welche Kategorien erlaubt sind.

### Bereit-Check (für Scripting: Exit 0 = ready, Exit 1 = nicht ready)

```bash
npx tsx system/control-plane/night-run-policy.ts check
```

### Night-Run aktivieren / deaktivieren

```bash
npx tsx system/control-plane/night-run-policy.ts activate
npx tsx system/control-plane/night-run-policy.ts deactivate
```

### Was darf nachts laufen?

| Kategorie | Night-Run | Bedingung |
|---|---|---|
| `standard`, `docs`, `i18n`, `test` | ✅ AUTONOMOUS | Läuft ohne Approval |
| `security`, `auth`, `rls`, `shared-core`, `architecture` | ⚠️ CAUTIOUS | Läuft, aber Spark D mandatory |
| `db-migration`, `payments`, `medical`, `release` | 🔴 REQUIRES_APPROVAL | Braucht Approval in Queue vor Start |

### Readiness-Checks vor Night-Run

Das System prüft automatisch bei `check` / `status`:

1. Night-Run-Modus aktiviert?
2. System Stop inaktiv?
3. Stop-Rules alle grün?
4. Keine offenen Approvals?
5. Keine aktiven Runs?

Erst wenn alle 5 OK → Night-Run starten.

### Vorgehen für Night-Run

```bash
# 1. Sparks prüfen
curl http://192.168.0.128:8001/v1/models
curl http://192.168.0.188:8001/v1/models
curl http://192.168.0.99:8001/v1/models
curl http://192.168.0.101:8001/v1/models

# 2. Readiness prüfen
npx tsx system/control-plane/night-run-policy.ts status

# 3. Aktivieren
npx tsx system/control-plane/night-run-policy.ts activate

# 4. Morgens: Morning Report
npx tsx system/reports/morning-report.ts

# 5. Deaktivieren wenn nicht mehr gebraucht
npx tsx system/control-plane/night-run-policy.ts deactivate
```

---

## 13. Dossiers und Docs-Drift

### WO-Dossiers erstellen

```bash
# Alle abgeschlossenen WOs archivieren
npx tsx system/reports/wo-dossier.ts --all-completed

# Einzelne WO
npx tsx system/reports/wo-dossier.ts WO-nutrition-001
```

Dossiers landen in `system/reports/dossiers/`.

### Docs-Drift prüfen

```bash
npx tsx system/control-plane/docs-drift-checker.ts

# Nur kritische Drifts
npx tsx system/control-plane/docs-drift-checker.ts --blocking-only
```

Was die Ausgabe bedeutet:

```
BLOCKING: 0 / WARNING: 0 / OK: 12  →  alles sauber
BLOCKING: 1                         →  Dokumentation muss aktualisiert werden
```

Wenn BLOCKING > 0: der Report zeigt genau welche Datei aktualisiert werden muss.

---

## 14. Was Tom NICHT tun soll

```
✗  Keine großen unscharfen Workorders ("mach das ganze Modul fertig")
✗  Keine High-Risk-WOs nachts ohne vorherige Approval
✗  Keine direkten Massenänderungen im Repo ohne Workorder
✗  Keine DB-Migration ohne rollback_hint
✗  Keine Änderungen außerhalb scope_files erzwingen
✗  Keine parallelen WOs auf denselben Dateien manuell starten
✗  Keinen System Stop ignorieren
✗  Keine Spark-Reboots während aktiver Runs
✗  Runtime Hardening nicht mit Governance-Arbeiten vermischen
✗  BrainstormDocs nicht als Current-State-Referenz nutzen
```

---

## 15. Schnellreferenz

| Aufgabe | Befehl |
|---|---|
| Morning Report | `npx tsx system/reports/morning-report.ts` |
| Failed WO Report | `npx tsx system/reports/failed-wo-report.ts` |
| Model Quality Report | `npx tsx system/reports/model-quality-report.ts` |
| Run Summary (alle) | `npx tsx system/reports/run-summary-generator.ts --all` |
| Run Summary (einzeln) | `npx tsx system/reports/run-summary-generator.ts <run_id>` |
| WO Dossiers erstellen | `npx tsx system/reports/wo-dossier.ts --all-completed` |
| Pending Approvals | `npx tsx system/approval/approval-cli.ts list` |
| Approval freigeben | `npx tsx system/approval/approval-cli.ts grant <id>` |
| Approval ablehnen | `npx tsx system/approval/approval-cli.ts deny <id> "Grund"` |
| Stop-Rules prüfen | `npx tsx system/control-plane/stop-rules.ts --dry-run` |
| Night-Run Status | `npx tsx system/control-plane/night-run-policy.ts status` |
| Night-Run Ready-Check | `npx tsx system/control-plane/night-run-policy.ts check` |
| Night-Run aktivieren | `npx tsx system/control-plane/night-run-policy.ts activate` |
| Night-Run deaktivieren | `npx tsx system/control-plane/night-run-policy.ts deactivate` |
| Docs-Drift prüfen | `npx tsx system/control-plane/docs-drift-checker.ts` |

### Spark Healthchecks

```bash
curl http://192.168.0.128:8001/v1/models    # Spark A — Orchestrator
curl http://192.168.0.188:8001/v1/models    # Spark B — Coding Worker
curl http://192.168.0.99:8001/v1/models     # Spark C — Fast Reviewer
curl http://192.168.0.101:8001/v1/models    # Spark D — Senior Reviewer
```

### Dateipfade

| Was | Wo |
|---|---|
| Morning Report | `system/reports/morning-report-YYYY-MM-DD.md` |
| Run Summaries | `system/reports/runs/` |
| Failed WO Report | `system/reports/failed-wo-report.md` |
| Model Quality Report | `system/reports/model-quality-report.md` |
| WO Dossiers | `system/reports/dossiers/` |
| Approval Queue | `system/approval/queue.json` |
| Runtime State | `system/state/runtime_state.json` |
| Audit Log | `system/state/audit.jsonl` |
| Night-Run Policy | `system/control-plane/night-run-policy.json` |

---

*Dieses Manual wird bei Systemänderungen aktualisiert.  
Docs-Drift-Check: `npx tsx system/control-plane/docs-drift-checker.ts`*
