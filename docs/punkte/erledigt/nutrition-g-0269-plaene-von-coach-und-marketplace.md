---
nr: G-269
typ: feature
modul: nutrition
schwere: mittel
angelegt: 2026-08-29
braucht: []
kind_von: G-267
entscheidung: null
agent: claudecode
beauftragt: 2026-08-30
erledigt: 2026-08-30
commit: 9ca3e6e9
beruehrt:
  tabellen: [nutrition.meal_plans]
zahlen: null
---
# G-269 — Plaene von Coach und Marketplace

## Befund

**Tom, 2026-08-29:** *,,da muss noch eine komponente sein fuer
plaene des coaches oder marketplace"*.

`[read]` **Ein Plan kann von drei Stellen kommen:** selbst erstellt,
vom Coach zugewiesen, aus dem Marktplatz bezogen. **Die Oberflaeche
kennt heute nur den ersten Fall.**

`[cmd]` **G-238 fuehrt denselben Befund aus der Spec-Sicht:**
`Plan.source = 'buddy'` steht in `SPEC_10` ohne Ausloeser in der
Oberflaeche.

`[read]` **Und die Herkunft ist mehr als ein Etikett:** ein
Coach-Plan darf vermutlich nicht frei bearbeitet werden, ein
gekaufter auch nicht. `[cmd]` **Das beruehrt `coach.client_autonomy`
und E-29.**

## Auftrag

**Mitbeauftragt mit G-271 am 2026-08-29.** Der Auftragstext
und der Bericht stehen dort.

## Zwischenstand, 2026-08-29

**Aus G-271 gemessen:** die Autonomieachse existiert bereits — es fehlt die Herkunftsspalte und die Regel.
**Die Messung steht dort.**

## Auftrag

**Der Schemateil ist mit C-342 an Codex beauftragt (2026-08-29):**
die Herkunftsspalte und die Autonomieregel. **Die Oberflaeche folgt
danach.**

## Auftrag

**Mitbeauftragt mit G-267 am 2026-08-30.** Der Auftragstext
und der Bericht stehen dort.

## Abnahme

**2026-08-30, mit G-267 abgenommen.** Messung und Urteil stehen
dort.
