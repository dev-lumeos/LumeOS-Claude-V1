---
nr: C-358
typ: befund
modul: coach
schwere: mittel
angelegt: 2026-08-30
braucht: []
kind_von: C-354
entscheidung: null
agent: codex
beauftragt: 2026-08-30
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

**Mitbeauftragt mit C-352 am 2026-08-30.** Der Auftragstext
und der Bericht stehen dort.

## Die Anzeigeseite ist entschieden, 2026-08-30

**Aus G-258, Claude Code.**

`[cmd]` **Drei Zustaende, nicht zwei: offen / abgelaufen / erledigt.**

`[read]` ***Abgelaufen* ist nicht *erledigt*** — **niemand hat
bestaetigt oder abgelehnt, die Frist ist blos verstrichen.** `[read]`
**Wer beides zusammenwirft, behauptet eine Entscheidung, die nie
gefallen ist.**

`[cmd]` **Die Unterzeile liest deshalb *,,2 abgelaufen"*, nicht *,,2
offen"*** — **was bei dieser Datenlage schlicht falsch waere.**

`[cmd]` **Alle 3 Zeilen in `pending_actions` sind abgelaufen**, 2 fuer
`dev`.

`[read]` **Die Anzeige entscheidet, sie schreibt nicht.** **Der
Schreibweg bleibt diese Frage** — und sie ist damit kleiner geworden:
**es geht nur noch darum, ob `status` je auf `expired` gesetzt wird,
nicht darum, was der Nutzer sieht.**
