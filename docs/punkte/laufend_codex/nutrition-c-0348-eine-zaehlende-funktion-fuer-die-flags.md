---
nr: C-348
typ: feature
modul: nutrition
schwere: mittel
angelegt: 2026-08-29
braucht: []
kind_von: G-260
entscheidung: null
agent: codex
beauftragt: 2026-08-29
beruehrt:
  tabellen: [nutrition.nutrient_reference_values]
zahlen:
  gemessen: 2026-08-29
  reiter_gesamt_ms: 6393
  davon_uebertragung_ms: 895
  jsonb_mb: 8.3
  flags: 10
---

# C-348 — eine zaehlende Funktion fuer die Flags

## Befund

Aus G-260, Claude Code, 2026-08-29.

`[cmd]` **Die Dauerregel kostet 2.971 ms**, davon **~895 ms fuer
8,3 MB `jsonb`, die entpackt und dann auf zehn Flags reduziert
werden.**

`[read]` **Die Nutzlast wird uebertragen, um sie wegzuwerfen.**

`[cmd]` **Der Reiter steht damit bei 6.393 ms** — unter C-189s neun
Sekunden, aber ueber den 3.426 ms ohne Flags.

## Was zu bauen ist

**Eine Funktion, die zaehlt statt zu liefern.**

`[read]` **Der Unterschied zum billigen Weg, den G-259 verboten hat:**
sie nutzt dieselbe Referenzlogik und gibt nur weniger zurueck —
**sie rechnet sie nicht nach.** `[read]` **Das ist zulaessig; das
Nachbauen waere die zweite Wahrheit, die E-31 zurueckgestellt hat.**

## Warum es sich lohnt

`[cmd]` **Mit Flags aendert sich die Auswahl je Zeitraum: 10/12/10.**
`[cmd]` **Ohne Flags liefert der `Auffaellig`-Filter bei 7, 30 und 90
Tagen dieselben zwoelf Codes.**

`[read]` **Tom hat sich fuer die Flags entschieden.** **Diese Funktion
macht die Entscheidung billig.**

## Auftrag

**Mitbeauftragt mit C-239 am 2026-08-29.** Der Auftragstext
und der Bericht stehen dort.
