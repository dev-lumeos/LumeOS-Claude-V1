---
nr: C-406
typ: feature
modul: nutrition
schwere: mittel
angelegt: 2026-09-07
braucht: []
kind_von: G-337
entscheidung: null
agent: codex
beauftragt: 2026-09-07
beruehrt:
  tabellen: [nutrition.food_preference_items]
zahlen:
  gemessen: 2026-09-07
  stellen: 4
---

# C-406 — `strong_avoid` an vier Stellen entfernen

## Befund

Aus G-337, Claude Code, 2026-09-07.

`[read]` **Der Nutzer braucht die mittlere Stufe je Lebensmittel
nicht.**

`[cmd]` **`strong_avoid` steht an vier Stellen in `supabase/`:**

    050_preferences_foundation.sql:63
    074_...:75
    075_preference_search_application.sql:263
    075_preference_search_application.sql:837

`[cmd]` **Der CHECK erlaubt sechs Werte, belegt sind drei:**
`boost 5`, `hard_exclude 2`, `soft_dislike 2`.

`[cmd]` **Kein Erzeuger setzt `strong_avoid`.**

## Was zu tun ist

`[read]` **Den Wert aus dem CHECK nehmen und die vier Stellen
bereinigen.**

`[read]` **Die mittlere Stufe bleibt ueber `intolerances`
erhalten** — **sie wirkt weiter** (`075:1053-1065`: `strong`
schliesst bei leerem Suchbegriff aus).

`[read]` **Sie kommt nur nicht mehr aus einem Wert, den niemand
setzt.**

## Warum es zaehlt

`[read]` **Ein CHECK-Wert ohne Schreibweg ist dieselbe Klasse wie
eine Funktion ohne Aufrufer** — **beim naechsten Auftrag wird er fuer
gebaut gehalten.**

`[cmd]` **Und `apps/` traegt ihn noch an vier Stellen** —
`vorlieben-aktionen.ts`, `daumen-schreiben.ts`, `food-search.ts`,
`daumen-schreiben.test.ts`. `[read]` **Melde, was dort nachzuziehen
ist** — **das ist ein UI-Auftrag.**

## Auftrag

**Mitbeauftragt mit C-405 am 2026-09-07.** Der Auftragstext
und der Bericht stehen dort.
