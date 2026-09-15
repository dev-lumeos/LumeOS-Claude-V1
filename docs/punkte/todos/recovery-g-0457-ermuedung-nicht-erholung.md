---
nr: G-457
typ: befund
modul: recovery
schwere: mittel
angelegt: 2026-09-08
braucht: []
kind_von: G-450
entscheidung: null
beruehrt:
  dateien:
    - apps/web/src/app/v2/recovery/ansicht.tsx
zahlen:
  gemessen: 2026-09-08
---

# G-457 - die Karte zeigt Ermuedung, nicht Erholung

## Befund

Aus G-450, Claude Code, 2026-09-08:

> *,,Die Karte zeigt ERMUEDUNG, nicht Erholung
(`Ready <=25 %`) ? beim Lesen der Zahlen ist das der
Unterschied zwischen *rot* und *gut*."*

`[cmd]` **Die Legende:** `Ready <=25%` | `Caution 26-60%` |
`Rest >60%`

`[read]` **Eine NIEDRIGE Zahl ist gut.**

`[read]` **Aber die Kachel heisst *,,Muscle recovery"* und die
Spalte *,,RECOVERY"*** ? **das legt das Gegenteil nahe.**

## Warum es zaehlt

`[cmd]` **`Brachioradialis 10%` am 04. September** ? **ein
Leser denkt *,,zu 10 Prozent erholt"*, gemeint ist *,,zu 10
Prozent ermuedet"*.**

`[read]` **Nein, umgekehrt** ? **und genau das ist das
Problem: ICH habe es beim Schreiben dieses Punktes verwechselt.**

## Was zu entscheiden ist

**a** ? **Die Zahl umdrehen** ? **100 % = erholt.**

`[read]` **Dann stimmt der Name, aber die Formel rechnet
Ermuedung.**

**b** ? **Den Namen aendern** ? **`Muscle fatigue`, Spalte
`ERMUEDUNG`.**

`[read]` **Dann stimmt die Zahl, aber die Kachel heisst
anders als das Modul.**

`[cmd]` **Die Formel heisst `calcMuscleRecovery`** ? **miss,
was sie wirklich rechnet.**
