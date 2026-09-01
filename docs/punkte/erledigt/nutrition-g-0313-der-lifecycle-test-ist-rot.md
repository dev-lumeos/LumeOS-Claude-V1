---
nr: G-313
typ: befund
modul: nutrition
schwere: mittel
angelegt: 2026-09-01
braucht: []
kind_von: C-379
entscheidung: E-44
agent: codex
beauftragt: 2026-09-01
erledigt: 2026-09-02
commit: 43e6154e
beruehrt:
  tabellen: [nutrition.meal_plans]
zahlen:
  gemessen: 2026-09-01
---

# G-313 — der Lifecycle-Test ist rot

## Befund

Aus B-20, Codex, 2026-09-01.

`[cmd]` **Der Lifecycle-Test ist rot**, weil seine Annahme ueber
ausschliesslich alte Nullwerte **nicht mehr zum Live-Bestand passt.**

`[read]` **Seit G-306 gibt es Plaene mit gesetztem Zyklus** —
`rollover_count` steht auf 1.

`[read]` **Der Test sicherte einen Zustand, der vorbei ist. A-62 in
Reinform.**

## Auftrag

**Mitbeauftragt mit G-312 am 2026-09-01.** Der Auftragstext
und der Bericht stehen dort.

## Abnahme

**2026-09-02, mit G-312 abgenommen: die Annahme nachgezogen.**

`[cmd]` **Lifecycle-Test 2/2 gruen.** Er prueft gueltige gespeicherte
Zyklen, mindestens einen gesetzten und einen erfolgten Rollover.

`[read]` **Und die Antwort auf meine Waechterfrage ist Nein:**
`[cmd]` **`abwesenheit-pruefen` prueft Pipeline-Struktur, keine
veraenderlichen Zeilenwerte.**

`[read]` **Meine Vermutung war falsch** — **eine Marke, die
Zeilenwerte prueft, faellt bei jedem Seed.**
