# Masterprompt: Workorder Batch Plan
# docs/project/prompts/MASTERPROMPT_WORKORDER_BATCH_PLAN.md

Nutze diesen Prompt um aus fertigen, geprüften WOs einen sicheren Ausführungsplan zu erstellen.

---

## Prompt (kopierbar)

```
Du bist Batch-Planer für das LUMEOS-Projekt.

Ich habe folgende geprüfte Workorders:

[WORKORDER_LIST]

---

Erstelle einen sicheren Ausführungsplan.

## Analyse-Aufgaben:

### 1. Abhängigkeiten erkennen
- Welche WOs sind voneinander abhängig?
- Welche blocked_by fehlen noch?
- Ergänze blocked_by wo nötig.

### 2. Scope-Konflikte erkennen
- Welche WOs haben überlappende scope_files?
- Diese dürfen nicht parallel laufen.
- Scope-Lock-Konflikte würden sie beim Dispatch blockieren.

### 3. Risikodomänen trennen
- DB-Migrationen müssen isoliert laufen.
- High-Risk WOs (security/auth/rls) dürfen nicht parallel mit anderen High-Risk WOs laufen.
- Approval-pflichtige WOs müssen vor Night-Run entschieden werden.

### 4. Parallele Kandidaten erkennen
- WOs mit nicht-überlappenden scope_files und gleicher oder ähnlicher Priorität.
- Nur wenn keine Abhängigkeiten bestehen.

### 5. Night-Run vs. Daytime trennen
Night-Run AUTONOMOUS (darf nachts laufen):
  - risk_category: standard, docs, i18n, test

Night-Run CAUTIOUS (läuft, aber Spark D mandatory):
  - risk_category: security, auth, rls, shared-core, architecture

Daytime Only (erst Approval, dann Dispatch):
  - risk_category: db-migration, payments, medical, release

### 6. Approval-Batch markieren
- Alle WOs die Approval brauchen.
- Reihenfolge: Approval einholen → dann diese WOs in Queue.

---

## Ausgabe-Struktur

---
# Workorder Batch Plan

## Sichere Ausführungsreihenfolge

1. [WO-xxx] — [Begründung, z.B. "Types zuerst, keine Abhängigkeiten"]
2. [WO-xxx] — [Begründung, z.B. "hängt von WO-001 ab"]
3. [WO-xxx] ← parallel zu [WO-xxx] möglich — [Begründung]
4. [WO-xxx] — einzeln, Approval vorhanden
...

## Parallelisierbar (können gleichzeitig laufen)

| WO A | WO B | Warum parallel OK |
|---|---|---|
| WO-... | WO-... | keine scope-Überlappung |

## Muss einzeln laufen

| WO | Warum |
|---|---|
| WO-... | DB-Migration, globaler Lock |
| WO-... | scope-Konflikt mit WO-xxx |

## Vor Ausführung: Approval erforderlich

| WO | risk_category | Approval-Befehl |
|---|---|---|
| WO-... | db-migration | npx tsx system/approval/approval-cli.ts grant APP-xxx |

## Night-Run Batch

Folgende WOs können autonom nachts laufen:

1. WO-... (standard)
2. WO-... (docs)
3. WO-... (test)

Cautious (laufen nachts mit Spark D):

4. WO-... (auth)
5. WO-... (rls)

## Daytime Only (nicht nachts)

- WO-... (db-migration) — erst Approval, dann tagsüber
- WO-... (payments) — erst Approval, dann tagsüber

## Überarbeitete blocked_by Vorschläge

[Falls blocked_by-Felder fehlten, korrigierte Versionen ausgeben]

## Risiken

[Bekannte Risiken in diesem Batch]
---

Antworte auf Deutsch.
```

---

## Platzhalter-Erklärung

| Platzhalter | Was einfügen |
|---|---|
| `[WORKORDER_LIST]` | Alle WOs als JSON-Liste, bereits reviewed |

---

## Wann nutzen?

Nutze diesen Prompt:
- Wenn du einen Batch von 3+ WOs aus einer Spec hast
- Bevor du Night-Run aktivierst
- Wenn du unsicher bist welche WOs parallel laufen können
- Um Approval-WOs vom autonomen Batch zu trennen

## Typischer Ablauf für einen Feature-Batch

```bash
# 1. Batch-Plan erstellen (mit diesem Prompt)
# 2. Approval-WOs zuerst entscheiden
npx tsx system/approval/approval-cli.ts list

# 3. Night-Run vorbereiten
npx tsx system/control-plane/night-run-policy.ts status
npx tsx system/control-plane/stop-rules.ts --dry-run

# 4. Night-Run aktivieren
npx tsx system/control-plane/night-run-policy.ts activate

# 5. Morgens: Reports prüfen
npx tsx system/reports/morning-report.ts
npx tsx system/reports/failed-wo-report.ts
```
