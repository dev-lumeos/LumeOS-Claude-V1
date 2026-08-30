---
nr: G-270
typ: befund
modul: nutrition
schwere: mittel
angelegt: 2026-08-29
braucht: []
kind_von: null
entscheidung: null
agent: claudecode
beauftragt: 2026-08-30
erledigt: 2026-08-30
commit: OFFEN
beruehrt:
  tabellen: [nutrition.meal_plan_logs]
zahlen: null
---
# G-270 — Drei Attrappen im Meal-plans-Reiter

## Befund

**Tom, 2026-08-29:** *,,Today's ghost entries attrappe · Lifecycle
types attrappe · 7-day compliance attrappe"*.

`[cmd]` **Alle drei tragen denselben Text:** *,,Aus dem Entwurf
uebernommen. Dieser Tab ist noch nicht an die vorhandenen
Essensplaene angebunden - die Zahlen sind erfunden."*

`[read]` **Sie haengen zusammen und an derselben Vorbedingung:**

    ghost entries     brauchen Plan-Eintraege mit Zustand
    Lifecycle types   brauchen einen Lebenszyklus im Schema
    7-day compliance  braucht beides und eine Zeitreihe

`[cmd]` **C-238:** `meal_plan_entries` hat keinen Status.
`[cmd]` **C-239:** `meal_plans` kennt keinen Lebenszyklus.
`[cmd]` **Und die rechte Kachel sagt es selbst:** *,,Lebenszyklus,
Startdatum und Bestaetigungsmodus fehlen im Schema."*

`[read]` **Also keine drei Anzeigefehler, sondern eine Datenluecke
mit drei Symptomen.**

## Auftrag

**Mitbeauftragt mit G-271 am 2026-08-29.** Der Auftragstext
und der Bericht stehen dort.

## Zwischenstand, 2026-08-29

**Aus G-271 gemessen:** fuenf Attrappen statt drei; die zwei weiteren unter *Shopping list*.
**Die Messung steht dort.**

## Auftrag

**Mitbeauftragt mit G-267 am 2026-08-30.** Der Auftragstext
und der Bericht stehen dort.

## Abnahme

**2026-08-30, mit G-267 abgenommen.** Messung und Urteil stehen
dort.
