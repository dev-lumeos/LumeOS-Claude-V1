---
nr: G-252
typ: messung
modul: nutrition
schwere: mittel
angelegt: 2026-08-28
braucht: []
kind_von: G-107
entscheidung: null
agent: claudecode
beauftragt: 2026-08-29
beruehrt:
  dateien: [apps/web/src/app/v2/nutrition/naehrstoff-ordnung-tab.tsx]
zahlen:
  gemessen: 2026-08-28
  kalt_ms: 6400
  warm_ms: 5800
---

# G-252 — die Ladezeit hat eine andere Ursache

## Befund

`[cmd]` **Der Nutrients-Reiter laedt bei 90 Tagen in 6,4 s kalt /
5,8 s warm** (G-249, Claude Code).

`[cmd]` **Ich hatte eine 90-Tage-RPC-Schleife als Ursache benannt.**
`[cmd]` **Codex hat in G-107 gemessen: es gibt keine.**

`[read]` **Die Ursache ist damit offen statt falsch beantwortet** —
und das ist der bessere Zustand.

## Was zu messen ist

**Woran liegen die 6,4 Sekunden?**

`[read]` **Kandidaten, ungeordnet und ungemessen:** die Menge der
geladenen Zeilen (138 Naehrstoffe mal 90 Tage), das seitenweise Laden
seit G-249 gegen den PostgREST-Deckel, die Baumberechnung im Browser,
oder etwas ganz anderes.

`[read]` **Nicht raten, welcher es ist** — das war der Fehler, der
diesen Punkt erzeugt hat.

`[cmd]` **`nutrition.reference_assessment_window()` existiert seit
G-107** und koennte die Antwort sein, sobald der Leseweg sie nutzt.
**Ob er es tut, ist Teil der Messung.**

## Auftrag

**Mitbeauftragt mit G-259 am 2026-08-29.** Der Auftragstext
und der Bericht stehen dort.
