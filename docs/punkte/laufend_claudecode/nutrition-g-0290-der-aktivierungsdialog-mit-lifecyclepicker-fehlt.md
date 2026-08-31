---
nr: G-290
typ: feature
modul: nutrition
schwere: mittel
angelegt: 2026-08-31
braucht: []
kind_von: null
entscheidung: null
agent: claudecode
beauftragt: 2026-08-31
beruehrt:
  dateien:
    - apps/web/src/app/v2/nutrition/tab-plans.tsx
zahlen: null
---

# G-290 — Der Aktivierungsdialog mit LifecyclePicker fehlt

## Befund

`[cmd]` **`SPEC_10` nennt `MealPlanActivationModal`:** *,,Startdatum +
Lifecycle-Wahl + Bestaetigung"* — **und `LifecyclePicker`:
*,,once / rollover / sequence Auswahl mit visueller
Sequenz-Preview"*.**

`[cmd]` **Gebaut ist keins von beiden.** `[cmd]` **Deshalb liest die
Karte *,,kein Lebenszyklus hinterlegt"* und *,,Was am Ende geschieht,
ist fuer diesen Plan nicht festgelegt"*.**

## Was da ist

`[cmd]` **Das Schema steht seit dem 30.08.:** `lifecycle_type`,
`start_date`, `days_count`, `next_plan_id`, `rollover_count`.
`[cmd]` **Vorgabe `'once'`, Tageszahl 7.**

`[read]` **Ein neuer Plan bekommt also einen Lebenszyklus — nur die
zwei Bestandsplaene nicht.** `[cmd]` **Die tragen `NULL`, weil ihre
Herkunft nicht belegbar war.**

`[read]` **Was fehlt, ist die Wahl beim Aktivieren.**

## Auftrag

**Mitbeauftragt mit G-286 am 2026-08-31.** Der Auftragstext
und der Bericht stehen dort.
