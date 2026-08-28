---
nr: C-327
typ: blocker
modul: medical
schwere: hoch
angelegt: 2026-08-28
braucht: []
kind_von: C-129
entscheidung: null
beruehrt:
  tabellen:
    - supplements.rule_catalog
  dateien: []
zahlen:
  gemessen: 2026-08-28
  medikamentenregeln: 20
  missing_input: 1
  fehlende_gruppenmitgliedschaft: 1
---

# C-327 - Die Chelationsregel kennt keine Gruppenmitgliedschaft

## Befund

`[cmd]` **Gemessen 2026-08-28 fuer `dev@lumeos.app`:**
`rule_assessment` gibt fuer `wr_drug_chelation_timing`
`evaluation_state = missing_input` und
`missing_inputs = {supplements.substance_group_membership}` zurueck.

`[cmd]` Von 20 Medikamentenregeln sind 1 `missing_input`, 7
`unsupported_operator` und 12 `not_fulfilled`. Die sieben unbekannten
Operatoren gehoeren in C-313; diese einzelne fehlende
Gruppenmitgliedschaft ist davon getrennt.

## Was zu tun ist

**Die Gruppenmitgliedschaft fuer die Regel auswertbar machen oder die
Regel fachlich als nicht auswertbar begruenden.** Ein fehlender Input
bleibt sichtbar; er darf nicht als nicht erfuellt erscheinen.
