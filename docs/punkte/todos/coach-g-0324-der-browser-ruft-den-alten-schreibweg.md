---
nr: G-324
typ: befund
modul: coach
schwere: hoch
angelegt: 2026-09-02
braucht: []
kind_von: C-381
entscheidung: null
beruehrt:
  tabellen: [coach.pending_actions]
zahlen:
  gemessen: 2026-09-02
---

# G-324 — der Browser ruft den alten Schreibweg

## Befund

Aus C-381, Codex, 2026-09-02.

`[cmd]` **`coach.bestaetige_aktion` ist live, und die UPDATE-Regel
an `pending_actions` ist entfernt** — nur noch `SELECT`, `INSERT`,
`DELETE`.

`[cmd]` **`entscheideAktion` im Browser schreibt weiterhin direkt.**

`[read]` **Damit ruft die Oberflaeche einen Weg, den es nicht mehr
gibt.**

## Was zu tun ist

**Den Aufruf auf die RPC umstellen.**

`[cmd]` **Die Funktion nimmt den Akteur aus `auth.uid()`** — **der
Aufruf braucht `confirmed_by` nicht mehr mitzugeben.**

`[read]` **Und die Fehlerfaelle sind jetzt echt:** fremd, abgelaufen,
unbekannter Aktionstyp. `[read]` **Die Oberflaeche muss sie
unterscheiden koennen** — **eine Meldung *,,fehlgeschlagen"* ohne
Grund war der Befund aus G-298.**

## Wie es zu belegen ist

`[cmd]` **Zwei Aktionen stehen auf `pending` und abgelaufen**,
20.08. und 01.09.

`[read]` **Sie sind der Testfall:** **der Browser muss sie anzeigen
und beim Bestaetigen die Ablaufmeldung bekommen.**
