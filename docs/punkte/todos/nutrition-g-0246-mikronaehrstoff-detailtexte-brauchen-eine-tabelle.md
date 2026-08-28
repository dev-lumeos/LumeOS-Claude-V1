---
nr: G-246
typ: feature
modul: nutrition
schwere: mittel
angelegt: 2026-08-28
braucht: []
kind_von: G-239
entscheidung: null
beruehrt:
  dateien: [apps/web/public/mockup/features/nutrition/MicroDashboard.js]
zahlen: null
---

# G-246 — die Mikronaehrstoff-Detailtexte brauchen eine Tabelle

## Befund

Aus G-239, Claude Code, 2026-08-28.

`[read]` **Der Mockup zeigt je Naehrstoff Mangelfolgen,
Wechselwirkungen und Top-Quellen** — `MicroDashboard.js` traegt sie
als *,,Vollstaendige NUTRIENT_DETAILS aus `nutrientDetails.ts`
DE-Felder"*.

`[cmd]` **Im Bestand gibt es dafuer keine Tabelle.** Die
Bewertungsfunktion liefert Werte und Referenzen, keine Texte.

`[read]` **Bewusst nicht gebaut** — ein Text, der im Frontend fest
verdrahtet ist, waere dieselbe Klasse wie die acht hartkodierten
Lebensmittel in `useMealCam.ts` des Vorgaengerrepos.

## Verwandt

**C-210** — *,,Die 28 fehlenden Naehrstofftexte — was ist gemeint?"*
`[read]` **Vermutlich dieselbe Luecke aus anderer Richtung;
zusammenlegen oder abgrenzen, bevor gebaut wird.**

**G-237** (MIN-8 der Opus-Review) — `data/nutrientDetails.ts` als
statisches Array, `food_sources` veraltet.
