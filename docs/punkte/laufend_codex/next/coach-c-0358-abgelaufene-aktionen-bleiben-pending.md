---
nr: C-358
typ: befund
modul: coach
schwere: mittel
angelegt: 2026-08-30
braucht: []
kind_von: C-354
entscheidung: null
beruehrt:
  tabellen: [coach.pending_actions]
zahlen:
  gemessen: 2026-08-30
  dev_zeilen: 2
---

# C-358 — abgelaufene Aktionen bleiben `pending`

## Befund

Aus C-354, Codex, 2026-08-30.

`[cmd]` **Die beiden `dev`-Zeilen in `coach.pending_actions` tragen
einen vergangenen `expires_at` und trotzdem `status = 'pending'`.**

`[cmd]` **`coach.offene_aktionen()` gibt beides unveraendert aus** —
**ein Verfall-Schreibweg wurde nicht gebaut.**

`[read]` **Richtig so; er war nicht beauftragt.**

## Die Frage

**Was ist eine abgelaufene, aber nicht abgelaufene Aktion?**

`[read]` **Drei Wege:** ein Schreibweg setzt sie auf `expired`.
**Oder die Funktion filtert sie.** **Oder die Anzeige zeigt sie mit
Vermerk.**

`[read]` **Der dritte ist der ehrlichste:** eine Aktion, die der Coach
gestellt hat und die niemand beantwortet hat, **verschwindet nicht
dadurch, dass eine Frist ablief.**

`[read]` **Und der erste braucht eine Entscheidung darueber, wer
schreibt** — ein Hintergrundlauf gibt es nicht, und ein Lesevorgang,
der schreibt, ist eine eigene Klasse.

## Auftrag

**Vorbereitet mit C-352 am 2026-08-30.** Der Auftragstext
und der Bericht stehen dort.
