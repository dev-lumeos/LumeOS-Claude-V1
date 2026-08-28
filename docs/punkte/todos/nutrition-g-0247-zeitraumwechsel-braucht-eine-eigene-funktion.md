---
nr: G-247
typ: feature
modul: nutrition
schwere: niedrig
angelegt: 2026-08-28
braucht: []
kind_von: G-239
entscheidung: null
beruehrt:
  dateien: [apps/web/public/mockup/features/nutrition/MacroDetail.js]
zahlen: null
---

# G-247 — der Zeitraumwechsel braucht eine eigene Funktion

## Befund

Aus G-239, Claude Code, 2026-08-28.

`[cmd]` **`nutrition.daily_reference_assessment(user_id, date)`
bewertet einen Tag.** `[read]` **Der Mockup fuehrt einen
Zeitraumwechsel Heute / 7d / 14d / 30d** — `MacroDetail.js` nennt ihn
im Kopf.

`[read]` **Ein Mittelwert ueber sieben Tage ist nicht die
Tagesbewertung siebenmal.** Bei einer Obergrenze zaehlt der
Einzeltag, bei einem Zielwert der Durchschnitt — **die Leserichtung
aus C-48 Regel 2 gilt auch hier, nur ueber die Zeit.**

`[read]` **Deshalb eine eigene Funktion und kein Schleifenaufruf.**
