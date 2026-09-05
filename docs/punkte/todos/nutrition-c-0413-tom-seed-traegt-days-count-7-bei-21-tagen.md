---
nr: C-413
typ: befund
modul: nutrition
schwere: niedrig
angelegt: 2026-09-07
braucht: []
kind_von: C-404
entscheidung: E-62
beruehrt:
  tabellen: [nutrition.meal_plans]
zahlen:
  gemessen: 2026-09-07
  days_count: 7
  tage: 21
---

# C-413 — `tom.seed` traegt `days_count 7` bei 21 Tagen

## Befund

Nachgemessen bei der C-404-Abnahme, 2026-09-07.

    dev@lumeos.app         once, days_count 28, 28 Tage   stimmig
    tom.seed@example.com   once, days_count  7, 21 Tage   falsch

`[read]` **Dasselbe Muster wie bei `dev` vor C-404** — **anderes
Konto.**

`[read]` **Es war nicht im Auftrag, weil der Orchestrator nur `dev`
gemessen hatte** — **zum sechsten Mal eine Zahl ohne `user_id`.**

## Zu tun

`[cmd]` **E-62: `days_count` ist die Laufzeit** — **drei Wochen
heissen 21.**

`[read]` **Miss, ob die Seedquelle beide Konten gleich behandelt** —
`[cmd]` **C-404 hat die Lifecycle-Felder dort modelliert.**

`[read]` **Wenn ja, ist es ein Restbestand aus einem aelteren
Lauf** — **wenn nein, fehlt eine Stelle.**
