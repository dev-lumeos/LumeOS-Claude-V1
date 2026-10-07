---
nr: G-614
typ: fehler
modul: goals
schwere: hoch
angelegt: 2026-10-07
agent: codex
beauftragt: 2026-10-07

braucht: []
kind_von: G-612

quellen:
  - docs/punkte/todos/goals-g-0612-drei-auswahlen-und-keine-ordnung.md
  - docs/spezifikation/10-plattform/design-system/theme-v1/module-goals-pro.jsx
  - docs/specs/Goals/PHASE_MODELS.md

beruehrt:
  tabellen:
    - goals.goal_strategies
  dateien: []
---

# Der Strategiekatalog kennt seine Karte und seinen Mindestgrad

## Auftrag - Kopf

    AUFTRAG FUER Codex - G-614: goal_strategies bekommt phasen_karte und min_erfahrung
    Bereich: supabase/_pipeline/ (Kette), danach Live nach Toms Freigabe
    Fremd:   apps/, packages/, tools/. docs/ gehoert dem Orchestrator.
    Stand:   2026-10-07

## Grundlage

Die Oberflaeche wird nach dem Mockup gebaut (`module-goals-pro.jsx:5-68`,
Spec `PHASE_MODELS.md`): **sieben Phasenkarten**, die 17 Strategien als
Varianten darin. Tom hat den Mindestgrad je Strategie festgelegt (07.10.).
Heute sind die Reiter fest im Code (`strategie-regeln.ts:34-40`) und die
Sperre kennt nur `beginner` (`:92-108`).

## Soll je Strategie

| code | phasen_karte | min_erfahrung |
|---|---|---|
| lose | fat_loss | beginner |
| conservative_cut, moderate_cut, mini_cut | fat_loss | advanced |
| aggressive_cut | fat_loss | pro |
| gain | lean_bulk | beginner |
| clean_bulk, lean_bulk | lean_bulk | advanced |
| aggressive_bulk | lean_bulk | pro |
| maintain | maintenance | beginner |
| body_recomp | recomp | advanced |
| contest_prep, peak_week | contest_prep | pro |
| reverse_diet | reverse_diet | advanced (Tom bestaetigt noch) |
| expert_bb_annual, custom, maintenance_diet_break | expert_bb_annual | pro |

## Was zu tun ist

1. Messen: bestehende Felder `tier`, `category`, `requirements`
   (`min_experience`), wer liest sie. Nichts davon still entfernen.
2. Zwei Spalten mit CHECK: `phasen_karte` in den sieben Mockup-Ids,
   `min_erfahrung` in `beginner|advanced|pro|elite`; Werte wie oben,
   NOT NULL. Probe: jede der 17 Zeilen traegt beide, jede Karte hat
   mindestens eine Strategie.
3. Kette gruen, `testdaten-pruefen` 0 Befunde, Sabotage beidseitig.
4. Live nach Toms Freigabe nach dem Muster A-105: Sicherung, nur diese
   Spalten und Werte, `NOTIFY pgrst`, Nachweis, Sicherung, **danach Gate
   gruen**. Kein Commit.

---

## Auftrag - ERSETZT den obigen (2026-10-07, 14:15)

    AUFTRAG FUER Codex - G-614: goal_strategies bekommt auswahl_gruppe, min_erfahrung, standard
    Bereich: supabase/_pipeline/ (Kette), danach Live
    Fremd:   apps/, packages/, tools/. docs/ gehoert dem Orchestrator.
    Stand:   2026-10-07

**Neue Bauart nach Recherche (Tom 07.10.: ,das wo da ist ist nicht
brauchbar" - direkt bauen):** zwei Werkzeuge statt einer Liste.
(A) ,Ziel setzen": Richtung Abnehmen/Halten/Aufbauen, darin Varianten.
(B) ,Planer": mehrphasige Plaene auf einer Zeitachse. Reverse Diet ist
ein empfohlener Uebergang, keine Erstwahl. **Die 7-Karten-Spalte
`phasen_karte` aus dem ersten Auftrag entfaellt.**

| code | auswahl_gruppe | min_erfahrung | standard |
|---|---|---|---|
| lose | abnehmen | beginner | ja |
| conservative_cut, moderate_cut, mini_cut | abnehmen | advanced | |
| aggressive_cut | abnehmen | pro | |
| maintain | halten | beginner | ja |
| body_recomp | halten | advanced | |
| maintenance_diet_break | halten | pro | |
| gain | aufbauen | beginner | ja |
| lean_bulk, clean_bulk | aufbauen | advanced | |
| aggressive_bulk | aufbauen | pro | |
| reverse_diet | uebergang | advanced (Tom bestaetigt noch) | |
| contest_prep, peak_week, expert_bb_annual, custom | plan | pro | |

1. Messen: `tier`, `category`, `requirements` (`min_experience`),
   `next_codes` und wer sie liest - nichts still entfernen.
2. Drei Spalten mit CHECK: `auswahl_gruppe` in
   `abnehmen|halten|aufbauen|uebergang|plan`, `min_erfahrung` in
   `beginner|advanced|pro|elite`, `standard boolean` (genau eine Zeile
   je Gruppe abnehmen/halten/aufbauen). NOT NULL, Werte wie oben.
3. Probe: 17 Zeilen tragen alle drei, je Richtungsgruppe genau ein
   Standard mit `beginner`. Kette gruen, `testdaten-pruefen` 0 Befunde,
   Sabotage beidseitig.
4. **Live freigegeben** (Tom 14:09, ,gleich einbauen"): Muster A-105 -
   Sicherung, nur diese Spalten und Werte, `NOTIFY pgrst`, Nachweis,
   Sicherung, danach Gate gruen. Kein Commit.

## Bestaetigt - 2026-10-07 14:19, Tom

`reverse_diet` = `advanced`, geht so live.

