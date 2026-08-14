# Nutrition-Schema: Spec gegen Ist

`[cmd]` Erhoben 2026-08-14 nach Abschluss des Kettenneuaufbaus aus C-38,
Anker `9994a5e`. Quelle für den Sollwert:
`docs/specs/Nutrition/01_current_specs/SPEC_06_DATABASE_SCHEMA.md`
(64 KB, 18 Abschnitte) — Altbestand und Datenquelle, kein Sollwert im
Sinne der Rangfolge. Was hier steht, ist die Grundlage für die
Modularbeit, nicht deren Ergebnis.

**Zur Entstehung, und zu zwei eigenen Fehlschlüssen dabei.** `[cmd]` Eine
erste Erhebung am selben Abend meldete `meals`, `meal_items` und
`water_logs` als fehlend — **das stimmte**. Ursache und Reparatur stehen
in `docs/ssot/53-kettenluecke.md`: die Schritte `052` bis `056` standen
in `supabase/README.md` unter *„Herkunft der Baseline-Struktur"* statt in
der Aufbaureihenfolge.

Die zweite Erhebung, nach der Reparatur, fand die Tabellen vor — und ich
erklärte die erste daraufhin zum Messfehler an einer Datenbank im Umbau.
**Auch das war falsch.** Die naheliegende Erklärung, dass in der
Zwischenzeit repariert wurde, habe ich nicht geprüft, sondern eine
plausible erfunden.

Zweimal übereilt geschlossen, einmal in jede Richtung. Wer den
Schemazustand misst, hält fest, **wann** gemessen wurde und **was
dazwischen lief** — sonst beschreiben zwei richtige Messungen scheinbar
zwei Wahrheiten.

---

## Der Abgleich

`[cmd]` 22 Objekte spezifiziert, **14 vorhanden, 8 fehlen**.

| Objekt | in der DB | angelegt in | in der README-Kette |
|---|---|---|---|
| `nutrient_defs` | ja | Baseline (`migrations/`) | — |
| `food_categories` | ja | `020_food_human_layer.sql` | ja |
| `foods` | ja | Baseline | — |
| `food_nutrients` | ja | Baseline | — |
| `tag_definitions` | ja | `020_food_human_layer.sql` | ja |
| `food_tags` | ja | `020_food_human_layer.sql` | ja |
| `food_aliases` | ja | `020_food_human_layer.sql` | ja |
| `foods_custom` | **fehlt** | nirgends | — |
| `food_preferences` | ja | `050_preferences_foundation.sql` | ja |
| `food_preference_items` | ja | `050_preferences_foundation.sql` | ja |
| `meals` | ja | `052_diary_foundation.sql` | ja |
| `meal_items` | ja | `052_diary_foundation.sql` | ja |
| `recipes` | **fehlt** | nirgends | — |
| `recipe_items` | **fehlt** | nirgends | — |
| `meal_plans` | **fehlt** | nirgends | — |
| `meal_plan_days` | **fehlt** | nirgends | — |
| `meal_plan_items` | **fehlt** | nirgends | — |
| `meal_plan_logs` | **fehlt** | nirgends | — |
| `water_logs` | ja | `055_water_logs.sql` | **nein** |
| `nutrition_targets` | **fehlt** | nirgends | — |
| `micro_flags` | **fehlt** | nirgends | — |
| `daily_nutrition_summary` | **anderer Name** | `053_daily_summary.sql` | **nein** |

`[cmd]` Die acht fehlenden sind **nirgends im Repo angelegt** — kein
`CREATE TABLE` in einer Pipeline-Datei. Sie existieren nur in der Spec.
Das ist Bauvorrat, kein Verlust.

`[cmd]` In der Datenbank, aber nicht in der Spec: `food_groups`,
`preparation_kinds`, `search_synonyms`, `food_curation_candidates`,
`food_curation_decisions`, `hydration_summary`.

---

## Befund 1: die Tagessicht heisst anders — und ist besser

`[cmd]` Die Spec nennt sie `daily_nutrition_summary`, gebaut heisst sie
**`nutrition.daily_summary`**. Wer morgen nach dem Spec-Namen sucht,
findet nichts.

**Wichtiger ist der inhaltliche Unterschied, und er geht zugunsten des
gebauten Standes:**

| | Spec | gebaut |
|---|---|---|
| Makros | 8 Summen, alle `COALESCE(…, 0)` | 8 Summen |
| **Fehlzähler** | keine | `[cmd]` **9 Spalten `*_missing`** |
| Mikronährstoffe | 24 aus dem `nutrients`-JSONB | **keine** |
| Wasser | Unterabfrage in derselben Sicht | eigene Sicht `hydration_summary` |
| `security_invoker` | nicht erwähnt | `[cmd]` **gesetzt, bei beiden Sichten** |

**Die gebaute Sicht löst C-37 für die Makros bereits.** `enercc_missing`,
`prot625_missing` und die übrigen zählen, wie viele Positionen eines
Tages für diesen Nährstoff **keinen Wert** hatten. Damit lässt sich
„nicht erfasst" von „nicht enthalten" unterscheiden — genau das, was die
Spec mit ihrem durchgängigen `COALESCE(…, 0)` unmöglich macht: dort wird
ein fehlender Eisenwert zu null Milligramm Eisen.

**Was fehlt, ist die Mikronährstoffseite.** Die Spec listet 24 Werte aus
dem JSONB (Vitamine, Mineralstoffe, Omega-3/6, Leucin, essenzielle
Aminosäuren); die gebaute Sicht hat keinen davon. Bei einer Anwendung,
die Mikronährstoff-Warnungen vorsieht (`micro_flags`), ist das die
grössere Lücke.

**Zu entscheiden, bevor die Sicht erweitert wird:** Werden die Mikros mit
demselben Fehlzähler-Muster ergänzt (24 Werte × 2 Spalten = 48 zusätzliche
Spalten), oder trägt ein anderer Aufbau — etwa ein JSONB-Ergebnis mit
Wert und Abdeckungsgrad je Nährstoff? Die Spec-Variante mit 24 mal
`COALESCE(…, 0)` sollte **nicht** übernommen werden.

---

## Befund 2: vier Kettenschritte fehlen in der README

`[cmd]` `supabase/_pipeline/05_user_tabellen/` enthält sieben Dateien.
Die Kettentabelle in `supabase/README.md` führt drei davon (`050`, `051`,
`052`). Nicht aufgeführt:

- `053_daily_summary.sql`
- `054_preference_uniques.sql`
- `055_water_logs.sql`
- `056_hydration_summary.sql`

`[cmd]` Ihre Tabellen und Sichten **sind vorhanden**, sie laufen also.
Unvollständig ist die Dokumentation, nicht die Kette — die harmlose
Variante. Trotzdem zu beheben: eine Kettenbeschreibung, der vier von
sieben Schritten fehlen, führt beim nächsten Neuaufbau in genau die
Fehldiagnose, die oben beschrieben ist.

---

## Befund 3: die Stammdaten stehen nicht in der Kette

`[cmd]` `foods`, `food_nutrients` und `nutrient_defs` werden von **keiner**
Pipeline-Datei per `CREATE TABLE` angelegt — sie kommen aus der Baseline
unter `supabase/migrations/`. `[read]` Das entspricht der
Projektbeschreibung, ist aber beim Lesen der Kette nicht sichtbar: Wer
`_pipeline/` durchsucht, findet die drei wichtigsten Tabellen nicht.

---

## Was diese Erhebung nicht sagt

- **Nichts über Spaltenebene.** Verglichen wurde, ob ein Objekt
  existiert, nicht ob seine Spalten der Spec entsprechen. `meal_items`
  wurde stichprobenartig geprüft (`food_source`, `frozen_at`,
  Prüfbedingung vorhanden), die übrigen dreizehn nicht.
- **Nichts über Rechte und Policies.** Ob jede vorhandene Tabelle
  Zeilenschutz und Policies je Operation trägt, ist hier nicht gemessen.
- **Nichts über die Richtigkeit der Spec.** Wo Spec und Ist auseinander-
  gehen, ist der gebaute Stand nicht automatisch falsch — bei
  `daily_summary` ist er nachweislich besser.
- `[annahme]` Ob die acht fehlenden Objekte für V1 überhaupt gebraucht
  werden, ist offen. Rezepte und Essenspläne sind eigene Module.
