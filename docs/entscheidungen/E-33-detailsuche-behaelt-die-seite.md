---
nr: E-33
getroffen: 2026-08-29
von: Tom
status: gueltig
loest_ab: null
abgeloest_durch: null
betrifft: [G-266]
modul: nutrition
---

# E-33 — die Detailsuche behaelt ihre Seite

## Frage

`[cmd]` **Der Verweis *,,Detailsuche mit Naehrwerten"* fuehrt aus dem
Food-DB-Reiter auf `/v2/nutrition/suche`.** **Tom, 2026-08-29:**
*,,koennte man direkt da als pulldown einbinden unter filters oder
mach andere vorschlaege"*.

## Entscheidung

Tom, 2026-08-29, auf drei gemessene Vorschlaege: **Weg C.**

**Die eigene Seite bleibt, aber der Zustand wandert mit.**

## Warum

`[read]` **Eine Detailsuche ueber 138 Naehrstoffe ist keine
Verfeinerung, sondern eine andere Suche.** **Ein Ausklappbereich, der
eine halbe Seite fuellt, waere eine Seite mit schlechterem Rahmen.**

`[cmd]` **Und die Haelfte ist bereits gebaut:** seit G-265 liest die
Zielseite `?food=` und `?q=` beim Laden — **gemessen mit gefuelltem
Feld, drei Treffern und ausgewaehltem Lebensmittel.**

`[read]` **Was fehlt, ist der Weg zurueck** — und dass der Verweis
mehr mitnimmt als nichts. **Wer mit *,,reis"* im Feld hinueberwechselt,
findet es dort wieder.**
