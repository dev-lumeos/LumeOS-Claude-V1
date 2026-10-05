---
nr: G-605
typ: fehler
modul: nutrition
schwere: niedrig
angelegt: 2026-10-05
agent: codex
beauftragt: 2026-10-05
erledigt: 2026-10-05
commit: 1a4b79d3

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

## Auftrag - Kopf

    AUFTRAG FUER Codex - G-605: 14-Tage-Schnitt ohne Eintraege ist NULL
    Bereich: supabase/_pipeline/
    Fremd:   apps/, packages/, tools/. docs/ gehoert dem Orchestrator.
    Stand:   2026-10-05

Vorher messen: wie rechnet `hydration_day` den Schnitt heute (Tage mit
Eintrag oder alle 14), und wer liest die vier Spalten. Nachweise:
Wegwerf-Kette gruen; leeres Fenster -> NULL/0 wie oben; Fenster mit
Eintraegen unveraendert; Sabotage beidseitig. Nie gegen Live, kein
Commit, Wegwerf-DBs loeschen und zaehlen.

## Abnahme - 2026-10-05, Commit `1a4b79d3`, NICHT live

`[cmd]` **Diff:** `056a_hydration_day.sql` - `AVG(COALESCE(h.total_ml, 0))`
und `COUNT(*)` werden `AVG(h.total_ml)` und `COUNT(h.total_ml)`; neue
Gegenprobe, Kettenregistrierung. Gate gruen.

`[read]` Vorher gemessen: leeres Fenster 0,0 ml ueber 14 Tage; zwei
erfasste Tage 107,1 ml ueber 14 statt 750 ml ueber 2 - **der Schnitt war
auch mit Eintraegen falsch**, nicht nur leer. Vollkette 350 Schritte
gruen, `testdaten-pruefen` 186/0.

`[cmd]` **Oberflaeche braucht nichts:** `parseHydrationDay` liest die
Spalten schon nullbar (`zahl()`), `hydration.tsx:262-265` zeigt den
Schnitt nur bei `!== null`. `avg_14d_days` laeuft ueber `zahlOder0`,
bei 0 richtig.

Offen: Live-Einspielen, wartet auf Toms Freigabe.

## Live - 2026-10-05

`[cmd]` **Live nachgemessen** (05.10.): test-user Schnitt/Tage/Delta
`NULL / 0 / NULL`; `dev@lumeos.app` 3095,9 ml ueber 14 Tage, Delta
-31,7 ml. Sicherungen `backup/g605-vorher.sql` 397.053 Byte,
`g605-nachher.sql` 397.160 Byte. Nur die eine Funktion, kein Seed, keine
Datenzeile, `NOTIFY pgrst` laut Bericht. G-603-Werte unveraendert.
