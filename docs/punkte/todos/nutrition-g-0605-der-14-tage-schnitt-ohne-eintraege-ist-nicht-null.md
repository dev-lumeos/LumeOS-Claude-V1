---
nr: G-605
typ: fehler
modul: nutrition
schwere: niedrig
angelegt: 2026-10-05

braucht: [G-603]
kind_von: G-592

quellen:
  - docs/punkte/erledigt/nutrition-g-0603-ein-leerer-wassertag-ist-nicht-null-getrunken.md

beruehrt:
  tabellen:
    - nutrition.water_logs
  dateien: []
---

# Der 14-Tage-Schnitt ohne Eintraege ist nicht ,0 ml"

## Befund

`[read]` Claude Code, Bericht G-592: `nutrition.hydration_day` meldet fuer
test-user, der nie Wasser eingetragen hat, `avg_14d_total_ml = 0.0` ueber
`avg_14d_days = 14` und `delta_vs_14d_ml = 0.0`. Die Kachel zeigt deshalb
am leeren Tag ,14d avg 0 ml". **Dieselbe Regelklasse wie G-603:** kein
Eintrag heisst nichts erfasst, nicht 0 getrunken.

## Was zu tun ist

Der Schnitt zaehlt nur Tage mit Eintrag. Ohne einen einzigen Tag im
Fenster: `avg_14d_total_ml`, `delta_vs_14d_ml`, `behind_14d_avg_pct` NULL,
`avg_14d_days` 0. Danach zeigt Claude Code ,—" statt ,0 ml".
Live nur mit Toms Freigabe nach dem Muster G-603.
