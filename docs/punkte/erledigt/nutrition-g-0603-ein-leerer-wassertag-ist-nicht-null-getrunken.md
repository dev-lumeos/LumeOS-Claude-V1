---
nr: G-603
typ: fehler
modul: nutrition
schwere: mittel
angelegt: 2026-10-04
agent: codex
beauftragt: 2026-10-04
erledigt: 2026-10-04
commit: 3a3ac5e6

braucht: [G-592]
kind_von: G-592

quellen:
  - docs/punkte/erledigt/nutrition-g-0592-die-hydration-zusammenfassung-hat-keinen-leser.md

beruehrt:
  tabellen:
    - nutrition.water_logs
  dateien: []
---

# Ein leerer Wassertag ist nicht „0 getrunken"

## Auftrag — Kopf

    AUFTRAG FUER Codex - G-603: hydration_day liefert fuer einen Tag ohne
                               Eintrag NULL, nicht 0
    Bereich: supabase/_pipeline/
    Fremd:   apps/, packages/, tools/. docs/ gehoert dem Orchestrator,
             auch diese Punktdatei.
    Stand:   2026-10-04

## Der Befund — von Claude Code gemessen (G-592)

`[cmd]` **`nutrition.hydration_day(test-user, 2026-10-04)`, 0 water_logs:**

    logged_ml 0 · log_count 0 · food_ml NULL · food_ml_missing 0
    total_ml 0 · total_complete TRUE · target_ml 2849 · progress_pct 0.0

**Die Funktion behauptet: nichts getrunken, Erfassung vollstaendig, 0 %.**
Die Fachregel steht seit langem im Code (`water-write.ts:127-129`):
*„Kein Eintrag heisst nicht ‚0 getrunken', sondern ‚nichts erfasst'."*
`[read]` **`total_complete = true` bei `food_ml = NULL` widerspricht schon
der eigenen Spalte.**

## Was zu tun ist

An einem Tag **ohne jeden Wassereintrag**: `logged_ml`, `total_ml` und
`progress_pct` sind `NULL`, `total_complete` ist `false`. `log_count` bleibt
0 (eine Zaehlung), `target_ml` bleibt (das Ziel haengt nicht am Eintrag).
**Tage mit Eintraegen rechnen wie bisher.** Vorher alle Aufrufer der
Funktion in der Datenbank zaehlen und nennen.

## Nachweise

Wegwerf-Kette gruen; Probe: leerer Tag → die vier Werte wie oben; Tag mit
einem Eintrag → unveraendert; Sabotage in beide Richtungen.

## Live

**Nur mit Toms Freigabe**, nach dem Muster von G-602/A3: Sicherung vorher,
genau diese eine Funktion, `NOTIFY pgrst`, Nachweis, Sicherung nachher.
Kein Commit. Danach zieht Claude Code `parseHydrationDay` und die Kachel
nach (G-592).

## Abnahme - 2026-10-04, Commit `3a3ac5e6`, live

`[cmd]` **Live nachgemessen** (test-user, 2026-10-04, kein Eintrag):
`logged_ml` NULL, `total_ml` NULL, `progress_pct` NULL,
`total_complete` f, `log_count` 0, `target_ml` 2849 - genau das Soll.

`[cmd]` **Sicherungen vorhanden:** `backup/g603-vorher.sql` 397.016 Byte,
`backup/g603-nachher.sql` 397.053 Byte. Nur die eine Funktion, kein Seed,
keine Datenzeile, `NOTIFY pgrst` laut Bericht.

Weiter mit G-592 bei Claude Code.
