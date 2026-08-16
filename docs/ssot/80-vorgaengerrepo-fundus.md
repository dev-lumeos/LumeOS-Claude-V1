# Was im Vorgängerrepo schon gelöst ist

`[cmd]` Erstellt 2026-08-15 durch Überfliegen von
`referenz/lumeos-2026/`. **Nicht vollständig** — ein Wegweiser, keine
Inventur.

**Tom, 2026-08-15:** *„Man muss nicht die Welt neu erfinden, es gibt
Lösungen, wenn man recherchiert und richtig ableitet."* Und: *„Überflieg
das alte Repo und merk dir, was wir sonst noch für Daten, Formeln und
Lösungen schon haben — dann musst du nicht immer wieder suchen."*

---

## Warum es diese Datei gibt

Dreimal an einem Tag wurde etwas als offene Frage behandelt, das gelöst
war:

| | |
|---|---|
| **TDEE-Formeln** | als „muss recherchiert werden" eingestuft — `[cmd]` `src/modules/onboarding/utils/calculateTDEE.ts` rechnet sie vollständig |
| **Portionsgrössen** | als Kuration von 7.140 Einträgen beschrieben — `[cmd]` `scripts/seed-portions.py` löst es mit ~100 kategoriebasierten Definitionen |
| **Einheiten-Umrechnung** | als offene Designfrage behandelt — jede Ernährungs-App rechnet um und zeigt absolut |

`[read]` **`referenz/` ist gesperrt fürs Schreiben, nicht fürs Lesen.**
22 Stashes, 19 ungepushte Commits — es wird dort nichts verändert.

**Was übernommen wird, wird gemessen.** `[cmd]` Das alte Schema ist ein
anderes: `public.foods` mit UUID gegen `nutrition.foods` mit `bls_code`,
`daily_nutrition_aggregates` gegen `daily_summary`. Der Code ist ein
belegter Ausgangspunkt, keine fertige Lösung.

---

## Struktur des alten Repos

| | |
|---|---|
| `supabase/migrations/` | **75 Migrationen**, `000` bis `073` plus datierte — das vollständige Datenmodell |
| `packages/` | `scoring`, `rules-engine`, `contracts`, `permissions`, `types`, `ui`, `auth`, `utils`, `config`, `supabase` |
| `src/api/` | Hono-Dienste je Modul |
| `src/modules/`, `apps/app/modules/` | die Oberflächen, modulweise |
| `scripts/` | Import- und Pflegeskripte, teils Python |
| `research/` | `ai-coach`, `b2b`, `coach`, `enhanced-supplements`, `goals`, `gym` |
| `design-system/` | `components`, `tokens` |

---

## Fundstellen nach Thema

### Ernährung und Ziele

| | |
|---|---|
| **TDEE, BMR, Aktivitätsfaktor** | `src/modules/onboarding/utils/calculateTDEE.ts` — Mifflin-St Jeor, Multiplikator angewandt, `goalModifiers` als Prozentsatz |
| | `src/modules/nutrition/hooks/useTDEE.ts`, `apps/app/modules/nutrition/components/TDEECalculator.tsx` |
| **Makro-Verteilung** | `apps/app/modules/nutrition/components/NutritionTargetEditor.tsx` — `[cmd]` Kohlenhydrate als Restgrösse |
| **Adaptive TDEE** | `apps/app/modules/goals/components/nutrition/AdaptiveTDEESidebar.tsx` |
| **Portionen** | `scripts/seed-portions.py` (~100 kategoriebasiert), `supabase/migrations/002_…` (`foods_portions`), `hooks/useFoodPortions.ts` |
| **Nährstoff-Erläuterungen** | `apps/app/modules/nutrition/data/nutrientDetails.ts` |
| **Nutrition-Score** | `packages/scoring/src/nutrition.ts` (92 Z) mit `nutrition.test.ts` (245 Z) und `thresholds.ts` |
| **BLS-Import** | `scripts/convert-bls-foods.py`, `import-foods-cloud.py`, `import-nutrients-full.py` |

### Training

| | |
|---|---|
| **1RM** | `apps/app/modules/training/components/OneRepMaxCalculator.tsx` — `[cmd]` 42 Fundstellen zu Epley/Brzycki |
| **Volumen, Tonnage, ACWR** | `SessionTonnageCard.tsx`, `TrainingReadinessScore.tsx` |
| **Muskelermüdung** | `MuscleFatigueHeatmap.tsx`, `MuscleReadinessWidget.tsx` |
| **Progression** | `ProgressiveOverloadAdvisor.tsx`, `migrations/033_exercise_progression_config.sql` |
| **Übungsdaten** | `scripts/import-exercises.ts`, `import-free-exercise-db.ts`, `migrations/036_exercise_aliases.sql` |
| **Periodisierung** | `migrations/038_periodization.sql`, `044_workout_engine.sql` |

### Körper und Messung

| | |
|---|---|
| **Körperfett, FFMI, Kaliper** | `apps/app/modules/goals/components/BodyCompositionView.tsx` — `[cmd]` 51 Fundstellen (Jackson-Pollock, Durnin, Navy) |
| **Umfänge** | `CircumferenceEntry.tsx`, `migrations/037_body_measurements.sql` |
| **Ratios** | `RatiosCard.tsx` — Schulter-Taille, V-Taper |

### Recovery und Medical

| | |
|---|---|
| **HRV, RMSSD, Readiness** | `apps/app/modules/training/hooks/useRecoveryIntel.ts` — `[cmd]` 30 Fundstellen |
| **Biomarker** | `apps/app/modules/medical/data/biomarkerDetails.ts` |
| **Biomarker-Synonyme** | `medical/data/biomarkerSynonyms.ts` — `[read]` dieselbe Aufgabe wie die Lebensmittel-Aliase |
| **Medical-Schema** | `migrations/015_medical.sql` |

### Supplements

| | |
|---|---|
| **Halbwertszeit, Blutspiegel** | `apps/app/modules/supplements/components/BloodLevelChart.tsx` — `[cmd]` 28 Fundstellen |
| **Zyklusplanung** | `CyclePlanner.tsx` |
| **Schema** | `migrations/008_supplements.sql`, `050_supplements_schema_expansion.sql` |

### Buddy und Regeln

| | |
|---|---|
| **Regelwerk** | `packages/rules-engine/src/` — `nutrition.ts`, `safety.ts` |
| **Buddy-Grundlage** | `migrations/052_buddy_v1_foundation.sql` bis `059_memory_confidence_decay.sql` |
| **Wissensbasis** | `057_buddy_knowledge_rag.sql`, `scripts/seed-knowledge-*.ts` |
| **Beobachter** | `apps/app/modules/coach/buddyWatcher.ts` |

### Querschnitt

| | |
|---|---|
| **Rechte und Stufen** | `packages/permissions/`, `migrations/051_tier_permissions.sql`, `018_coach_permissions.sql` |
| **Verträge** | `packages/contracts/` — 7 Dateien |
| **Mehrsprachigkeit** | `apps/app/i18n/translations/` — de, en, **th** |
| **Suchindizes** | `migrations/20260322_smart_search_indexes.sql` |

---

## Testdaten — 52 Seed-Dateien

`[read]` Tom, 2026-08-15: *„Zum Beispiel wirst du auch Seeds für Meals
finden, die wir mühelos umschreiben können, damit wir Mahlzeitendaten
zum Testen haben. Dasselbe Supplements normal und extended — und und
und. Wir waren sehr weit in dieser Version."*

`[cmd]` Es ist mehr als eine Handvoll Beispielsätze:

| | | |
|---|---|---|
| `scripts/seed-knowledge-full.ts` | 86 KB | Buddys Wissensbasis |
| `scripts/seed-medical.ts` | 36 KB | Biomarker, Befunde |
| `supabase/seed.disabled/seed_supplements.sql` | 35 KB | Supplements |
| `scripts/seed-training.sql` | 34 KB | Trainingsdaten |
| `supabase/seed-complete.sql` | 25 KB | **alle Nutzerdaten in einer Datei** |
| `scripts/seed-dev-showcase-complete.ts` | 24 KB | Vorführbestand |
| `scripts/seed-marketplace.ts` | 20 KB | Marktplatz |
| `scripts/seed-complete-users.ts` | 20 KB | Nutzer mit Verlauf |
| `scripts/seed-portions.py` | 8 KB | Portionsgrössen |
| `src/api/training/seeds/seed_routines.sql` | 9 KB | Trainingspläne |

Dazu fünf Dokumentationsdateien: `SEED_INDEX.md`, `SEED_README.md`,
`SEED_DATA.md`, `SEED_SUMMARY.md`, `EXECUTE_SEED.md`.

### Was `seed-complete.sql` enthält

`[read]` Laut `SEED_DATA.md` **drei vollständige Testnutzer** — Tom
Miller, Max Schmidt, Sarah Johnson — je mit:

Profil · Nutrition · Körpermesswerte **mit Verlauf** · Training ·
Supplements · Recovery · Abonnement und Guthaben.

Dazu fünf durchgespielte Prüfszenarien (Dashboard, Ernährungserfassung,
Trainingspläne, Fortschritt, Stufenrechte).

### Warum das hier zählt

`[cmd]` `nutrition.meals` und `meal_items` haben **0 Zeilen**. Deshalb
steht in mehreren Punkten „auf Daten wartend“:

- **C-49** — Tages-Score ohne Tage, an denen er sich zeigen liesse
- **GO-13 bis GO-17** — die adaptive TDEE braucht zwei volle Wochen
  Gewichts- und Kaloriendaten
- **G-05** — das Dashboard trägt aus Modulen zusammen, die nichts haben
- `[cmd]` **C-23** — die Abdeckungsmessung misst gegen geratene
  Begriffe statt gegen echte Anfragen

**Ein umgeschriebener Seed löst keinen dieser Punkte fachlich** — aber
er macht sie prüfbar, bevor der erste echte Nutzer etwas einträgt.

### Was beim Umschreiben zu beachten ist

`[cmd]` Das alte Schema passt nicht: `public.foods` mit UUID gegen
`nutrition.foods` mit `bls_code`, `daily_nutrition_aggregates` gegen
`daily_summary`, andere Spaltennamen in `meal_items`.

**Und Testdaten gehören nicht in die Kette.** `[read]` Die Kette baut
den Sollzustand einer leeren Datenbank; Testnutzer sind ein eigener,
ausdrücklich aufgerufener Schritt. Sonst steht in der Vorführung
irgendwann Sarah Johnsons Frühstück.

---

## Was diese Datei nicht sagt

- **Ob der Code richtig rechnet.** `[read]` *Aus der Existenz einer Sache
  folgt nicht ihre Funktion.* Er lief, das ist alles.
- **Ob er zum heutigen Schema passt.** `[cmd]` Er passt fast nie
  unverändert — andere Schlüssel, andere Schemata, andere Tabellen.
- **Wie vollständig er ist.** Dies war ein Überfliegen, keine Prüfung.
- **Wo die Zahlen herkommen.** `[cmd]` Beim Portions-Seed steht keine
  Quelle. Übernahme heisst nicht Beleg.

**Vor jeder Übernahme gilt der Ablauf aus
`docs/spezifikation/00-UMSETZUNGSPLAENE.md`, Schritt 1b:** dort suchen,
hier messen, Abweichungen benennen.
