---
nr: G-273
typ: feature
modul: nutrition
schwere: mittel
angelegt: 2026-08-29
braucht: []
kind_von: C-348
entscheidung: null
agent: claudecode
beauftragt: 2026-08-30
erledigt: 2026-08-30
commit: 12ffc1bf
beruehrt:
  dateien:
    - apps/web/src/app/v2/nutrition/naehrstoff-ordnung-tab.tsx
zahlen:
  gemessen: 2026-08-29
  bytes_vorher: 8298086
  bytes_nachher: 1814
  reiter_ms: 6393
---

# G-273 — den Reiter auf die zaehlende Funktion umstellen

## Befund

Aus C-239/C-348, Codex, 2026-08-29.

`[cmd]` **Die zaehlende Funktion liefert dieselben zehn Flags mit
1.814 statt 8.298.086 Byte** — minus 99,98 Prozent.

`[cmd]` **Der UI-Aufrufer ist unangetastet** — die Funktion liegt
bereit, der Reiter nutzt sie nicht.

## Was daran haengt

`[cmd]` **Der Reiter steht bei 6.393 ms**, davon rund 895 ms
Uebertragung.

`[read]` **Tom hat sich in G-260 fuer die Flags entschieden und die
Ladezeit in Kauf genommen.** **Diese Umstellung macht die
Entscheidung billiger, ohne sie zu aendern.**

`[read]` **Der Nachweis ist Ergebnisgleichheit:** dieselben Flags,
dieselben Tageszaehlungen. **Eine schnellere Anzeige mit anderen
Zahlen waere keine Verbesserung.**

## Auftrag

**Mitbeauftragt mit G-272 am 2026-08-29.** Der Auftragstext
und der Bericht stehen dort.

## Blockiert, 2026-08-30

`[cmd]` **`nutrition.reference_assessment_window_flags` existiert
nicht in der laufenden Datenbank.** Sie liegt in
`supabase/_pipeline/05_user_tabellen/059d_…sql`, **78 Zeilen, nie
eingespielt.**

`[read]` **Das ist der C-195-Fall aus `CLAUDE.md`: die Kette ist
gruen, die Aenderung steht nicht dort, wo man sie sieht.**

`[read]` **Nicht angebunden, weil ein Aufruf auf eine nicht
existierende Funktion die Seite bricht** — und `supabase/` war
gesperrt. **Richtig entschieden.**

`[cmd]` **Die Funktion passt:** dieselben Regeln wie `flagVon` — 80
Prozent, mindestens vier Tage, 0,5 Anteil. `[cmd]` **Der Reiter steht
bei 6.898 ms.**

**Wartet auf C-349.**

## Auftrag — jetzt entblockt

**Mitbeauftragt mit G-275 am 2026-08-30.** Bericht dort.

`[cmd]` **`nutrition.reference_assessment_window_flags` ist seit dem
30.08. live** (C-349). **Der Blocker ist weg.**

`[read]` **Die Regeln stimmen mit deinem `flagVon` ueberein** — 80
Prozent, mindestens vier Tage, 0,5 Anteil. `[cmd]` **Codex hat es
belegt: dieselben zehn Flag-Zeilen, dieselben Tageszaehler.**

`[read]` **Der Nachweis ist Ergebnisgleichheit** — dieselben Flags
vor und nach der Umstellung. **Eine schnellere Anzeige mit anderen
Zahlen waere keine Verbesserung.**

`[cmd]` **Der Reiter stand zuletzt bei 6.898 ms, davon rund 895 ms
Uebertragung von 8,3 MB `jsonb`.** **Miss vorher und nachher.**

## Abnahme

**2026-08-30, mit G-275 abgenommen.**

`[cmd]` **Ergebnisgleichheit belegt: 9 / 11 / 10 Flags, in allen drei
Fenstern identisch.**

`[cmd]` **Aber die Umstellung spart keine Zeit** — today 2.993 /
2.531 ms, intel 2.889 / 2.500 ms.

`[read]` **Die Begruendung fuer C-348 war eine Ersparnis von rund
895 ms fuer 8,3 MB `jsonb`.** **Die Messung findet sie nicht.**

`[read]` **Als C-353 angelegt** — die Frage ist, wo die Zeit
tatsaechlich liegt, nicht ob die Umstellung richtig war. **Weniger
Uebertragung ist fuer sich schon richtig.**
