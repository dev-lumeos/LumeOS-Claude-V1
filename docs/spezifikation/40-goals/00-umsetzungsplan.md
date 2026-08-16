# Goals — Umsetzungsplan

`[cmd]` Erstellt am 2026-08-16, Zweig `dev`. Verfahren:
`docs/spezifikation/00-UMSETZUNGSPLAENE.md`.

**Dieser Plan baut nichts.** Er liest, misst und legt vor.

---

## Was Goals ist

`[read]` Die Goals-Spec sagt über sich selbst: *„Goals ist kein weiteres
Feature-Modul — es ist der Betriebssystem-Kern, um den alle anderen
Module rotieren. Alle Scores sind relativ zum Ziel, nicht absolut."*

`[read]` **`00_MASTER_VISION.md` trägt das mit, gewichtet es aber
anders.** Kernprinzip 1 lautet dort *„Buddy IST das Produkt — alle
Module sind Features die Buddy's Wissen nähren"*; Goals-centric ist
Prinzip **2**: *„jede Empfehlung beantwortet: Bringt dich das näher ans
Ziel?"*. Goals ist in der Vision also nicht der Kern, sondern der
**Massstab**, an dem Buddy seine Empfehlungen misst. `[cmd]` Das Wort
„Goals" kommt in der 175-zeiligen Vision **einmal** vor (in genau diesem
Prinzip), „Buddy" **22-mal**. Der Abschnitt „Kernprodukt" gehört Buddy;
einen Abschnitt über Goals gibt es nicht.

Praktisch heisst das für diesen Plan: Goals liefert die Bezugsgrössen,
gegen die andere Module rechnen — heute konkret die vier Zahlen, die die
Nutrition-Ringe füllen. Es ist keine eigenständige Dateneingabe.

---

## 1. Quellen

`aufgeloest` **nur nach Bestätigung durch Tom**. Was gelesen wurde, ist
`gelesen`.

### Spec — `docs/specs/Goals/` (10 Dateien)

| Datei | Grösse | Stand |
|---|---:|---|
| `DATABASE.md` | 13 KB | gelesen |
| `SCORING.md` | 10 KB | gelesen |
| `PHASE_MODELS.md` | 6,9 KB | gelesen |
| `CONSOLIDATED_KNOWLEDGE.md` | 6,6 KB | gelesen |
| `API.md` | 7,7 KB | gelesen |
| `FEATURES.md` | 5,4 KB | gelesen |
| `COMPONENTS.md` | 5,2 KB | gelesen |
| `STRATEGY.md` | 4,2 KB | gelesen |
| `README.md` | 3,7 KB | gelesen |
| `OPEN_ITEMS.md` | 3,1 KB | gelesen |

`[read]` Der Auftrag nannte 11 Dateien; `[cmd]` es sind **10** plus
`WebPlatform/SPEC_08_GOALS_UI.md` (248 Zeilen, gelesen) — zusammen 11.

### Umfeld

| Datei | Stand |
|---|---|
| `docs/specs/00_MASTER_VISION.md` (175 Z) | gelesen |
| `docs/specs/Core/ONBOARDING_ADR.md` (112 Z) | gelesen |
| `theme-v1/module-goals.jsx` (903 Z) | gelesen |
| `theme-v1/module-goals-pro.jsx` (905 Z) | gelesen |
| `theme-v1/module-goals-editor.jsx` (569 Z) | gelesen |
| `theme-v1/module-onboarding.jsx` (361 Z) | gelesen |

### Brainstorm — `docs/BrainstormDocs/Goals/` (24 Dateien)

**Stand: `offen`.** `[read]` Vorstufe; nur zu lesen, wenn eine Frage
offen bleibt.

`[cmd]` **Ein Befund vorab:** `BrainstormDocs/Goals/new/` enthält
zehn Dateien mit denselben Namen wie `docs/specs/Goals/`. Stichprobe
`DATABASE.md` und `SCORING.md`: **byte-identisch**. Die „konsolidierte
Fassung" ist an dieser Stelle eine Kopie, keine Synthese. Die übrigen
14 Brainstorm-Dateien (`goalsmod_*`, `lumeos-goals-strategy.md`,
`07_MODULE_GOALS.md` …) sind damit **nicht** ausgewertet — dort können
Entscheidungen liegen, die es nicht in die Spec geschafft haben.

---

## 2. Ist-Zustand, gemessen

`[cmd]` Alles in diesem Abschnitt selbst gemessen am 2026-08-16 gegen
`supabase_db_LumeOS-Claude-V1`, Datenbank `postgres`.

### Datenbank

| Frage | Messung |
|---|---|
| Schema `goals` | **existiert nicht** — 14 Schemata, keines davon |
| `nutrition.weight_logs` | existiert nicht |
| `nutrition.nutrition_targets` | existiert nicht |
| `nutrition.daily_nutrition_summary` | existiert nicht |
| `nutrition.daily_summary` | **existiert** (Sicht, 70 Spalten) |
| `nutrition.meals` | 0 Zeilen |
| `nutrition.meal_items` | 0 Zeilen |
| `nutrition.water_logs` | 0 Zeilen |
| `nutrition.foods` | 7.140 Zeilen |
| `public.profiles` | 2 Zeilen |

`[cmd]` Die 14 Schemata: `_realtime`, `auth`, `extensions`, `graphql`,
`graphql_public`, `net`, `nutrition`, `public`, `realtime`, `storage`,
`supabase_functions`, `supabase_migrations`, `training`, `vault`.

### `public.profiles` — die Spalten sind da, die Werte nicht

`[cmd]` Vorhandene Spalten: `birth_date`, `biological_sex`, `height_cm`,
`body_weight_kg`, `activity_level`, `nutrition_goal`, dazu
`pregnancy_started_on/_ended_on` und `lactation_started_on/_ended_on`.

`[cmd]` **Belegung über beide Zeilen:**

| Spalte | gefüllt |
|---|---:|
| `birth_date` | **0 von 2** |
| `biological_sex` | **0 von 2** |
| `height_cm` | **0 von 2** |
| `body_weight_kg` | **0 von 2** |
| `activity_level` | **0 von 2** |
| `nutrition_goal` | **0 von 2** |

**Das ist der eigentliche Blocker, nicht die fehlenden Tabellen.** Die
vier Harris-Benedict-Eingaben existieren als Spalten und sind
durchgängig leer, weil nichts sie füllt — es gibt kein Onboarding und
keine Profilpflege in der Oberfläche.

`[cmd]` `activity_level` erlaubt genau die fünf Werte, die
`SCORING.md` als `ACTIVITY_MULTIPLIER` führt: `sedentary`, `light`,
`moderate`, `active`, `very_active`. Diese Schnittstelle passt.

### Code und Oberfläche

| Frage | Messung |
|---|---|
| `packages/scoring/` | **existiert nicht** (12 Pakete, keines davon) |
| `apps/web/src/app/goals/page.tsx` | existiert, **110 Zeilen, reine Attrappe** |
| `/v2/goals` | existiert nicht |
| `30-module/core/goals/` | Ordner existiert, **leer** |
| Nutrition-Ringe | `target={null}`, Hinweis „Keine Ringe, weil es keine Ziele gibt" |

`[cmd]` Die 12 Pakete: `branch-db-core`, `config`, `contracts`,
`memory-core`, `prompts`, `retrieval-core`, `rules`, `shared`, `skills`,
`tool-adapters`, `types`, `ui`.

### Was die Spec über sich selbst behauptet

`[read]` `CONSOLIDATED_KNOWLEDGE.md` und `OPEN_ITEMS.md` tragen beide
im Kopf *„Status: Vollständig implementiert (2026-04-14)"* — mit 30+
Komponenten, 18 Hooks, 14 API-Routen auf Port 5900.

`[cmd]` Gemessen: **nichts davon existiert in diesem Repo.** Der Vermerk
beschreibt das Vorgängerrepo.

---

## 3. Widersprüche

**Notiert, nicht aufgelöst.**

### W-1 · Spec gegen Ist: die beiden Quellen der adaptiven TDEE

`[read]` `OPEN_ITEMS.md`, Bug 1: *„Gewicht kommt aus
`nutrition.weight_logs`, Kalorien aus
`nutrition.daily_nutrition_summary`."*

`[cmd]` Die erste Tabelle existiert nicht. Die zweite heisst gebaut
`nutrition.daily_summary` — und liefert `enercc` bereits als
Tagessumme mit Fehlzähler.

### W-2 · Spec gegen Ist: „vollständig implementiert"

Siehe oben. `[read]` Die Spec sagt fertig, `[cmd]` die Messung sagt
null. **Wer den Kopf ungeprüft liest, hält ein Modul für fertig, das bei
null anfängt.**

### W-3 · Spec gegen Spec: drei Vokabulare für dasselbe

| Ort | Anzahl | Werte |
|---|---:|---|
| `profiles.nutrition_goal` `[cmd]` | 6 | `lose_weight`, `maintain`, `gain_muscle`, `recomposition`, `performance`, `health` |
| `ONBOARDING_ADR.md` Step 4 `[read]` | 12 | „12 Goal-Typen (lean_bulk, moderate_cut, contest_prep…)" |
| `DATABASE.md` `goal_phases.phase_type` `[read]` | 9 | `fat_loss`, `lean_bulk`, `maintenance`, `recomp`, `contest_prep`, `reverse_diet`, `expert_bb_annual`, `mini_cut`, `peak_week` |

Dazu `goal_type` in `user_goals` mit vier Klassen
(`body_composition`, `performance`, `health`, `lifestyle`). **Vier
Listen, keine Abbildung zwischen ihnen.**

### W-4 · Spec gegen Spec: zwei Schwellenwerte für denselben Algorithmus

`[read]` Die wöchentliche Anpassung steht **zweimal**, mit
unterschiedlichen Zahlen:

| Bedingung | `SCORING.md` | `PHASE_MODELS.md` |
|---|---|---|
| fat_loss, Plateau | `weightTrend > -0.05` | `weightTrend > -0.1` |
| lean_bulk, zu schnell | `> 0.8` | `> 0.75` |

`PHASE_MODELS.md` prüft zusätzlich `hrv7d`, `SCORING.md` nicht.

### W-5 · Die Makros lassen sich aus der Spec nicht ausrechnen

`[read]` Protein steht als **Bereich je kg** (`1.8–2.4`), Fett als
**Prozentbereich** (`25–35 %`) oder Untergrenze (`0.5 g/kg`). `[cmd]`
Kohlenhydrate kommen in keiner Herleitung vor, und die
Umrechnungsfaktoren (4/4/9 kcal je g) stehen in **keiner** Goals-Datei.

**Für die vier Ring-Zahlen fehlt damit die Regel, die aus den Bereichen
einen Wert macht.** Das ist keine Lücke im Ist-Zustand, sondern in der
Spec.

### W-6 · Die TDEE-Formeln liefern BMR, nicht TDEE

`[read]` `calcHarrisBenedict` und `calcMifflin` geben den
Grundumsatz zurück. `ACTIVITY_MULTIPLIER` ist als Tabelle definiert,
wird im gezeigten Ablauf aber **nirgends angewandt**. Wer die Funktion
so benutzt, wie sie dasteht, bekommt einen um Faktor 1,2–1,9 zu
niedrigen Wert.

### W-7 · Zwei SQL-Fehler in `DATABASE.md`

`[read]` `goal_phases` endet mit `UNIQUE (user_id) WHERE (is_active =
true)` — diese Syntax gibt es in PostgreSQL nicht; es braucht einen
partiellen `UNIQUE INDEX`. `[read]` `goal_adjustments` schreibt
`goal_id UUID FK → goals.user_goals` — ein Pfeil, kein SQL.

Die Datei ist also **nicht ausführbar wie abgedruckt**.

### W-8 · Rechenfehler in `calcGoalProgress`

`[read]` Die Funktion summiert `totalWeight` über Gewichte, die sich zu
`1.0` addieren, und teilt am Ende durch diese Summe. Die Division ist
ein No-Op. Kein Fehler im Ergebnis, aber ein Hinweis darauf, dass der
Code nicht gelaufen ist.

### W-9 · Ordnerkonvention

`[read]` `00-INDEX.md` ordnet Module unter `30-module/core/` ein und
reserviert `40-…` für *„abgegrenzte Bauaufträge"*; `[cmd]`
`40-lieferungen/` existiert bereits. Dieser Plan liegt auftragsgemäss
unter `40-goals/`. `[cmd]` `30-module/core/goals/` existiert und ist
leer. **Wo der Plan dauerhaft liegen soll, entscheidet Tom.**

---

## 4. Die Schritte

Kennungen zum Anlegen in `docs/todo/TODO.md`. **Der Plan trägt
Begründung und Reihenfolge, die TODO den Stand.**

### Block A — was die Ringe füllt

Der kleinste Weg, der die Nutrition-Oberfläche ehrlich macht.
`[cmd]` Sie zeigt heute leere Ringe und schreibt darunter, dass es keine
Ziele gibt.

| Kennung | Schritt | Warum zuerst |
|---|---|---|
| **GO-01** | **Profilpflege in der Oberfläche.** Die sechs Felder in `public.profiles` befüllbar machen. | `[cmd]` Ohne sie ist jede Formel gegenstandslos: 0 von 2 Zeilen gefüllt. Kein neues Schema nötig — die Spalten stehen seit 2026-08-15. |
| **GO-02** | **Entscheidung: Makro-Regel.** Aus Phase + Gewicht die vier Zahlen ableiten — eine Regel, keine Bereiche. | Löst W-5. **Entscheidung für Tom**, kein Bauauftrag: welche Formel, welcher Punkt im Bereich, welche kcal-Faktoren. |
| **GO-03** | **`nutrition.nutrition_targets`** — eine Tabelle, vier Zahlen je Nutzerin und Gültigkeitsdatum, plus Herkunft (`formel` / `manuell`). | Die Ringe brauchen einen Ort. Bewusst in `nutrition`, nicht in einem neuen `goals`-Schema — siehe Abschnitt 5. |
| **GO-04** | **TDEE-Berechnung als reine Funktion**, mit Aktivitätsfaktor. Ergebnis nach `nutrition_targets`. | Löst W-6. Reine Funktion heisst: testbar ohne Datenbank, wie `diary-summary.ts`. |
| **GO-05** | **Ringe füllen.** `ProgressRing` nimmt `target` bereits optional entgegen; die Seite liest `nutrition_targets` statt `null`. | `[cmd]` Der Baustein ist aus G-03 vorhanden. Dieser Schritt ist klein — wenn A-01 bis A-04 stehen. |

`[annahme]` Nach GO-05 zeigt die Nutrition-Seite gefüllte Ringe für
Nutzerinnen mit ausgefülltem Profil und leere für alle anderen — mit
demselben ehrlichen Hinweis wie heute.

### Block B — Goals als Modul

Nach Abhängigkeiten geordnet. Erst sinnvoll, wenn Block A steht.

| Kennung | Schritt | Abhängig von |
|---|---|---|
| **GO-06** | **Entscheidung: Zielvokabular.** Die vier Listen aus W-3 auf eine bringen. | — (Entscheidung) |
| **GO-07** | `goals.user_goals` + `goals.goal_phases` — Ziele und aktive Phase. | GO-06 |
| **GO-08** | Phasenparameter aus `PHASE_MODELS.md` als Datei im Repo, nicht als Code. | GO-06, GO-02 |
| **GO-09** | Zielübersicht in `/v2/goals` — lesend, wie G-03 bei Nutrition. | GO-07 |
| **GO-10** | `goals.body_measurements` + Gewichtsverlauf. | GO-07 |
| **GO-11** | `goals.goal_milestones` und Fortschritt je Ziel. | GO-07, GO-10 |
| **GO-12** | Onboarding (7 Schritte laut ADR) — füllt GO-01 und GO-06 in einem Fluss. | GO-01, GO-06 |

`[read]` GO-12 steht bewusst spät: das Onboarding ist der bequeme Weg,
die Profildaten zu erheben, aber nicht der einzige. Ein Formular in den
Einstellungen (GO-01) reicht, um die Ringe zu füllen.

### Block C — was auf Daten wartet, die es nicht gibt

**Nicht terminierbar.** `[cmd]` `meals` und `meal_items` haben 0 Zeilen;
es gibt keinen Schreibpfad (C-03 ist ein eigener Auftrag).

| Kennung | Schritt | Wartet auf |
|---|---|---|
| **GO-13** | Adaptive TDEE (Woche 2+) | **Zwei volle Wochen** Gewichts- **und** Kaloriendaten |
| **GO-14** | Wöchentliche Auto-Anpassung (W-4 vorher entscheiden) | GO-13 |
| **GO-15** | `goals.goal_contributions` — Beiträge der Module | Training, Recovery, Supplements müssen Scores liefern |
| **GO-16** | Engpass-Erkennung und Zielerreichungswahrscheinlichkeit | GO-15 |
| **GO-17** | `goals.weekly_reports` | GO-15 |

`[read]` **Vor Woche 2 gibt es nichts zu adaptieren.** Die adaptive TDEE
rechnet aus der Differenz zwischen zugeführten Kalorien und
Gewichtsänderung — beides muss über sieben Tage vorliegen. Mit 0 Zeilen
in `meals` ist der frühestmögliche Termin **zwei Wochen nach dem ersten
erfassten Tag**, und der erste erfasste Tag setzt C-03 voraus.

---

## 5. Was nicht gebaut wird

`[read]` Der wichtigste Abschnitt. Die Spec umfasst zehn Tabellen,
sieben Phasenmodelle, eine adaptive TDEE-Engine, Cross-Module-Beiträge
mit Gewichtungen je Zieltyp, 13 Umfangmessungen, Physique-Ratios und
Fotosessions mit IFBB-Posen und Bildanalyse. **Für gefüllte Ringe
braucht es vier Zahlen.**

### Kein `goals`-Schema für Block A

Die vier Ring-Zahlen gehören fachlich zu Nutrition und werden dort
gelesen. Ein eigenes Schema mit einer Tabelle darin wäre Vorratsbau; es
entsteht in GO-07, wenn es Ziele zu speichern gibt.

`[read]` Gegenargument, das gegen mich spricht: `tdee_settings` liegt in
der Spec im `goals`-Schema, und ein späteres Umziehen kostet eine
Migration. **Ich halte GO-03 in `nutrition` trotzdem für richtig** —
eine Tabelle am falschen Ort ist billiger zu verschieben als ein leeres
Schema zu rechtfertigen. Entscheidung liegt bei Tom.

### Nicht in diesem Zuschnitt

| Was | Warum nicht |
|---|---|
| **Fotosessions, IFBB-Posen, Bildanalyse** | `[read]` Braucht Dateiablage, Posenkatalog und ein Bildmodell. Kein Bezug zu den Ringen. |
| **13 Umfangmessungen, FFMI, V-Taper, Goldener Schnitt** | `[read]` Schöne Zahlen ohne Eingabemöglichkeit. Ohne GO-01 gibt es nicht einmal ein Gewicht. |
| **`expert_bb_annual`, `contest_prep`, `peak_week`** | `[read]` Drei der neun Phasen zielen auf Wettkampfbodybuilding. `[cmd]` Die Vision nennt als Zielgruppe „Fitness-Enthusiasten (Intermediate bis Advanced)" — Wettkampf ist ein Randfall, nicht der erste. |
| **Cross-Module-Beiträge mit Gewichtungen** | `[cmd]` Setzt voraus, dass Training, Recovery, Supplements und Medical täglich Scores liefern. Keines dieser Module tut das heute. |
| **Materialisierte Sicht `user_goal_dashboard`** | `[read]` Sie hätte denselben Aktualisierungsweg-Fehler, den C-04 bei `daily_summary` bewusst vermieden hat. Eine Sicht reicht, bis eine Messung etwas anderes zeigt. |
| **`packages/scoring/`** | `[cmd]` Existiert nicht. Die TDEE-Funktion (GO-04) passt neben die vorhandenen reinen Funktionen in `apps/web/src/lib/nutrition/`; ein eigenes Paket lohnt, wenn ein zweiter Verbraucher da ist. |
| **Szenario-Modellierung, Ziel-Vorlagen, Contest-Checkliste** | `[read]` Stehen in `OPEN_ITEMS.md` selbst als „mittlere Priorität" und sind dort ausdrücklich unfertig. |

### Was ausdrücklich offen bleibt

- **W-2 bis W-9 sind nicht aufgelöst.** Das ist Absicht.
- **Die 14 nicht ausgewerteten Brainstorm-Dateien.** `[cmd]` Nur
  `new/` ist in die Spec eingegangen, und zwar unverändert.
- **Ob dieser Plan unter `40-goals/` bleibt** (W-9).

---

## Anschluss

`[read]` Dieser Plan gehört in die Plantabelle im Kopf von
`docs/todo/TODO.md` — *„ohne diesen Eintrag existiert der Plan
praktisch nicht"*. `[read]` Die Punkte GO-01 bis GO-17 legt Tom an;
dieser Auftrag ändert die TODO nicht.
