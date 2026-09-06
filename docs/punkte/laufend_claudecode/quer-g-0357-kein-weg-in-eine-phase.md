---
nr: G-357
typ: feature
modul: quer
schwere: hoch
angelegt: 2026-09-07
braucht: []
kind_von: G-355
entscheidung: E-54
beruehrt:
  tabellen: [goals.goal_phases]
zahlen:
  gemessen: 2026-09-07
  phasenarten: 9
  zeilen: 5
---

# G-357 — kein Weg in eine Phase

## Befund

Aus G-355, Claude Code, 2026-09-07.

`[cmd]` **Keine der neun Phasenarten hat einen Schreibweg.**

    fat_loss, lean_bulk, maintenance, recomp,
    contest_prep, reverse_diet, expert_bb_annual,
    mini_cut, peak_week

`[cmd]` **`goal_phases` hat gar kein Insert** — **die fuenf Zeilen
sind Testdaten** (C-383).

`[cmd]` **Und die Tabelle traegt eine Zustandsmaschine:**
`transitioned_from`, `recommended_next`, `transition_reason`,
`projected_end_date`, `actual_end_date`, `variant`,
`parameters jsonb`.

`[read]` **Das ist der Kern von Toms Beobachtung:** `[read]` *,,da
hatten wir auch advanced stuff drin nicht nur so 0815 goals."*

`[read]` **Der advanced stuff steht im Schema und ist nicht
erreichbar.**

## Was zuerst zu klaeren ist

`[read]` **Ein Phasenwechsel ist kein Formular** — **er ist ein
Uebergang.**

`[read]` **Wer von `lean_bulk` nach `mini_cut` wechselt, hat einen
Grund** — `transition_reason` **ist dafuer da.**

`[read]` **Und `recommended_next` deutet an, dass das System
vorschlagen soll** — **wer schlaegt vor, und woraus?**

`[cmd]` **E-54: die Zeitachse gehoert zu den Zielen.** `[cmd]`
**E-67: die Phasenplanung gehoert in Goals, nicht ins Onboarding.**

`[read]` **Was fehlt, ist die Entscheidung, ob der Nutzer waehlt oder
das System vorschlaegt.**
