---
nr: A-104
typ: fehler
modul: quer
schwere: hoch
angelegt: 2026-10-06
agent: codex
beauftragt: 2026-10-06
erledigt: 2026-10-06
commit: 89844a2d

braucht: []
kind_von: G-562

quellen:
  - docs/punkte/erledigt/goals-g-0562-die-teilphasen-haben-keine-zeitachse-mehr.md

beruehrt:
  tabellen: []
  dateien:
    - supabase/_pipeline/kette.json
---

# Live hinkt der Kette hinterher, und niemand zaehlt wie weit

## Auftrag - Kopf

    AUFTRAG FUER Codex - A-104: Abstand zwischen Kette und Live messen
    Bereich: supabase/_pipeline/, Live nur LESEND
    Fremd:   apps/, packages/, tools/. docs/ gehoert dem Orchestrator.
    Stand:   2026-10-06

## Befund

`[cmd]` 06.10.: G-562 liess sich nicht live einspielen, weil G-560 live
fehlt - `goals.goal_programs` und `goals.goal_program_positions` gibt es
live nicht, `contest_prep` traegt live weder `duration_ratio_pct` noch
`dauer_anteil`. G-560 ist seit Tagen abgenommen. **Abgenommen heisst
,in der Kette gruen", nicht ,live".** Live wird nur gezielt eingespielt
(G-602 bis G-605), was dazwischen lag, ist nie angekommen.

`[annahme]` G-560 ist nicht der einzige Schritt.

## Was zu tun ist

1. Frische Wegwerf-Kette bauen, Schema beider Seiten vergleichen
   (Schemata, Tabellen, Spalten, Funktionen mit Rumpf-Hash, Trigger,
   Policies, Grants). Live nur lesen.
2. Jede Abweichung einem Kettenschritt (`kette.json`-id) und, wo
   moeglich, einem Punkt zuordnen. Tabelle: Objekt, Art, Kette/Live,
   Schritt, Punkt.
3. Auch Katalogdaten vergleichen, die Schritte schreiben (z. B.
   `goal_strategies.sub_phases`) - Zeilenzahl und Inhalts-Hash je
   Katalogtabelle.
4. Die Reihenfolge vorschlagen, in der die fehlenden Schritte live
   muessten, mit Abhaengigkeiten. **Nichts einspielen.**
5. Wegwerf-DBs loeschen und zaehlen. Kein Commit.

## Abnahme - 2026-10-06, Messung (kein Code-Commit)

`[read]` Bericht und Rohdaten liegen in `backup/a104/` (vom Orchestrator aus
`_validierung/` dorthin verschoben, damit Messausgaben nicht in die Kette
geraten): `a104-bericht.md`, `a104-abweichungen.csv` (3.254 Zeilen),
`a104-schema-diff.json`, `a104-catalog-diff.json`, `a104-attribution.json`
und drei Hilfsskripte.

`[read]` **Ergebnis:** Kette 355 Schritte gruen. Sieben ganze Schritte
fehlen live, mit Abhaengigkeiten:

    C-417  recipe_curation_catalog/_ingredients, decide_recipe_curation_candidate
    G-524  goals.record_adaptive_tdee (Writer), danach Backfill
    G-561  sechs Guard-Zellen in goal_strategies (NICHT den ganzen Seed)
    G-558  goal_phase_start mit 8 Argumenten (live 7)
    G-560  goal_programs, goal_program_positions -> danach G-562
    C-551  exercise_muscles-Spalten umbenannt, muscle_role_volume_rules
    C-546  anatomy_sources, muscle_origins/insertions/innervations/pain_referrals,
           recovery.muscle_symptom_observations

`[read]` **Kein pauschaler Nachzug:** live ist teils GROESSER als die
Kette - Supplements 617/593, `product_content_candidates` +260.611,
Stack-Vorlagen +1. Dazu 12 App-Funktionen mit anderem Rumpf, Policy- und
Grant-Abweichungen (u. a. `berechne_zielwerte` live fuer PUBLIC
ausfuehrbar, `supplement_forms_read` live ohne SELECT-Grant) - eigene
Pruefung, A-106.

`[cmd]` Orchestrator nachgemessen: `goals.goal_programs` und
`goal_program_positions` live nicht vorhanden (06.10.).

Folgepunkte: A-105 (Live-Nachzug der sieben Schritte), A-106
(Funktions-, Policy-, Grant- und Katalogabweichungen einzeln).
