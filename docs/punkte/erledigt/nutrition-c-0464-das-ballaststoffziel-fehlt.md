---
nr: C-464
typ: feature
modul: nutrition
schwere: mittel
angelegt: 2026-09-08
braucht: []
kind_von: G-415
entscheidung: E-80
agent: codex
beauftragt: 2026-09-08
erledigt: 2026-09-08
commit: c5efd107
beruehrt:
  tabellen: [goals.nutrition_targets]
zahlen:
  gemessen: 2026-09-11
---

# C-464 — das Ballaststoffziel fehlt

## Bericht

`nutrition.daily_summary` hatte den Messwert bereits (`fibt`, `fibt_missing`),
aber `goals.nutrition_targets` kein Fiberziel. Der fehlende Bezugswert betraf
den 0,15-Fiber-Anteil aus `SPEC_09_SCORING.md:56-61`.

Die vorhandenen Fettsäuren sind formelbasiert: `goals.berechne_zielwerte()`
berechnet Linolsäure aus 4 Energieprozent und Alpha-Linolensäure aus 0,5
Energieprozent (`110_goals_zielwerte.sql:326-336`). Vorher waren alle fünf
Live-Zielzeilen `herkunft=formel`; vier hatten beide Fettsäurewerte, eine noch
keine. Fiber folgt derselben gespeicherten Zielwert-Bauform: `fiber_g
NUMERIC(6,1)`, geliefert von `goals.berechne_zielwerte()` und gelesen durch
`goals.zielwerte_am()`.

Die 30,0 g sind belegt, nicht aus der DGE geraten: Nutrition nennt sie in
`SPEC_01_MODULE_CONTRACT.md:67` ausdrücklich als Fallback. Der Backfill
betrifft nur `herkunft = 'formel' AND fiber_g IS NULL`; manuell leere Werte
bleiben ehrlich leer.

[20260909270000_c464_nutrition_fiber_target.sql](/D:/GitHub/LumeOS-Claude-V1/supabase/migrations/20260909270000_c464_nutrition_fiber_target.sql)
legt die nullable Spalte mit CHECK 0 bis 100 an, erweitert Formel und
Zielwert-Leser und erhält `fiber_g` bei C-381s atomarer Coach-Fortschreibung
samt Undo-Schnappschuss. Seed und Konto-Kopie nehmen es ebenfalls mit. Der
Kettenschritt steht nach C-463/C-381.

Der Test
[nutrition-c464-fiber-target.test.ts](/D:/GitHub/LumeOS-Claude-V1/supabase/_pipeline/_validierung/nutrition-c464-fiber-target.test.ts)
war auf `lumeos_c463_final` zuerst rot: `fiber_g` existierte nicht. Danach
grün: Formel, gespeicherte Zeile, Leser und Fortschreibung liefern 30, alles
in einem ROLLBACK.

| Messung | Vorher | Nachher |
|---|---:|---:|
| Spalte `fiber_g` | nicht vorhanden | `numeric`, nullable, kein Default |
| Zielzeilen | 5 | 5 |
| Formel-Zeilen mit 30 g | 0 | 5 |
| Formel-Zeilen ohne Fiber | nicht möglich | 0 |
| Manuelle Zielzeilen | 0 | 0 |

Die Live-Migration meldete `UPDATE 5`. Leser, Berechnung und
`coach.bestaetige_aktion()` enthalten auf dev jeweils `fiber_g`.

## E-80

Die Faktoren sind reine Score-Regeln. `SPEC_09_SCORING.md:9-13` verlangt pure
Funktionen und nennt `packages/scoring/src/nutrition.ts`; dieses Paket fehlt
derzeit. Eine Modultabelle wäre falsch; C-464 baut die Faktoren nicht.

Live erlaubt `public.profiles.experience_level` die Werte `beginner | advanced
| pro | elite` (5 NULL, 2 `pro`). E-80s jüngere Entscheidung gilt:
`beginner 0,75`, `advanced 0,90`, `pro 1,00`, `elite 1,10`. Die ältere Spec
nennt noch `intermediate | advanced`; die spätere Umsetzung gehört in das
Scoring-Paket, nicht in Datenbankzustand.

## Sicherung und Prüfung

- Sicherung vor dem Einspielen:
  [20260911082527_c464_nutrition_fiber_target_vor_einspielen.dump](/D:/GitHub/LumeOS-Claude-V1/backup/schema/20260911082527_c464_nutrition_fiber_target_vor_einspielen.dump),
  26.508.022 Bytes, SHA-256
  `F3E22D423F4E4D68FF037F651C5A93902ED3386ADB524AF0F693BA4BA4508E7F`.
- Frischer Aufbau: 189 Schritte auf `lumeos_c464_final`,
  `SCHEMA VOLLSTAENDIG`, 881,4 s:
  [c464-vollkette-live-20260911.out](/D:/GitHub/LumeOS-Claude-V1/backup/c464-vollkette-live-20260911.out).
- Fachtest: 1/1 grün, 7,138 s:
  [c464-fiber-target-test.out](/D:/GitHub/LumeOS-Claude-V1/backup/c464-fiber-target-test.out).
- Punktelauf: grün, 617 Punkte, Soll 25 Befunde:
  [c464-punktelauf.out](/D:/GitHub/LumeOS-Claude-V1/backup/c464-punktelauf.out).

Apps, UI-Pakete und Dev-Server blieben unberührt. Nichts wurde committed,
gestaged oder gepusht.

## Abnahme

**2026-09-08, Orchestrator. Nachgemessen.**

    fiber_g in goals.nutrition_targets
    5 von 5 Formel-Zielwerten mit 30 g
    dev: kcal 2500, protein 170, fiber 30, herkunft formel
    Vollkette 881,4 s, Punktelauf gruen

`[cmd]` **Selbst gemessen: `fiber_g` da, fuenf Nutzer mit 30,0 g,
`dev@lumeos.app` dabei.**

### Die Bauform folgt den Fettsaeuren

`[cmd]` **`linoleic_acid_g` und `alpha_linolenic_acid_g` standen
schon mit `herkunft: formel`** ? **`fiber_g` genauso.**

`[read]` **Kein neuer Weg, kein neuer Begriff** ? **die dritte
Spalte derselben Art.**

### Was noch nicht wirkt

`[cmd]` **Die Score-Kachel zeigt weiter *,,Ballaststoffe: kein Ziel
im Schema"*** ? **sie liest die neue Spalte nicht.**

`[read]` **Das ist kein Fehler dieses Punktes** ? **die Kachel
gehoert Claude Code, und steht in G-417.**

**Abgenommen.**
