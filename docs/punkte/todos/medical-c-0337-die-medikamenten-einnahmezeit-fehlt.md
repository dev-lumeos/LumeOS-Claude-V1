---
nr: C-337
typ: befund
modul: medical
schwere: mittel
angelegt: 2026-08-28
braucht: []
kind_von: C-327
entscheidung: null
beruehrt:
  tabellen: [medical.user_medications, supplements.rule_catalog]
zahlen: null
---

# C-337 — die Medikamenten-Einnahmezeit fehlt

## Befund

Aus C-327, Codex, 2026-08-28. **Als fachliche Grenze gemeldet, nicht
uebergangen.**

`[read]` **Eine Chelatbildner-Warnung haengt am Zeitfenster.** Eisen
und Kalzium binden sich gegenseitig — **aber nur, wenn sie zusammen
im Magen sind.** Zwei Stunden Abstand loesen das Problem.

`[cmd]` **`medical.user_medications` fuehrt keine Einnahmezeit.**
`[read]` **Damit kann die Regel nur sagen, dass beides genommen wird,
nicht ob es sich stoert.**

## Was das bedeutet

`[read]` **Die Warnung ist heute richtig und zu grob.** Sie feuert bei
jedem, der beides nimmt — **auch bei dem, der es bereits richtig
macht.**

`[read]` **Und eine Warnung, die man nicht abstellen kann, indem man
das Richtige tut, wird ignoriert.** Das ist schlimmer als keine.

## Verwandt

`[cmd]` **`supplements.intake_logs` traegt `intake_time`** — bei
Supplements ist die Uhrzeit da. **Bei Medikamenten nicht.**

`[read]` **Der Erfassungsweg aus G-211 koennte sie mitnehmen** — die
Frage ist, ob ein Nutzer sie einzugeben bereit ist, und ob eine
Angabe wie *,,morgens"* reicht.
