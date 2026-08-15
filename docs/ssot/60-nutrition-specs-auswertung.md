# Vier Nutrition-Specs: Auswertung

`[cmd]` Erhoben 2026-08-15. Anlass: A-11 — `[cmd]` 78 von 84 Dateien im
Register stehen auf `offen`. `[read]` `SPEC_05_FOOD_TAXONOMY.md` wurde am
vierten Tag der Arbeit an genau seinen Fragen gelesen, nach zwei
gemessenen und gefallenen Modellen (C-28, C-33).

**Dies ist Schritt 1 des Ablaufs aus `00-KONSOLIDIERUNG.md`: lesen.**
Schritt 2 — besprechen — steht aus. Nichts hier ist entschieden; was Tom
nicht bestätigt hat, gilt nicht.

**Zur Markierung:** Was in einer Spec steht, ist `[read]`. Eine
Spec-Aussage über den Bestand wird nur dann `[cmd]`, wenn ich sie gegen
die laufende Datenbank oder die Pipeline-Dateien nachgemessen habe.

---

## 1. `ADR_MEALCAM_V1.md` und `ADR_MEALCAM_CONSENT.md`

### Was sie entscheiden

`ADR_MEALCAM_V1` (`[read]`, Status „Final"):
- MealCam ist V1, Barcode-Scanner ist Phase 2 — begründet mit
  Differenzierung gegenüber Wettbewerbern.
- Der Ablauf ist festgelegt: Bild → Erkennung → Portionsschätzung →
  BLS-Matching → bei schlechtem Match Custom-Food-Vorschlag →
  Confidence je Food → **Nutzerbestätigung je Eintrag**.
- **„MealCam darf NIE automatisch finale Meal Items schreiben."**
- Der Vision-Anbieter ist ausdrücklich **nicht** entschieden; die Spec
  ist anbieterunabhängig.

`ADR_MEALCAM_CONSENT` (`[read]`, Status „Final"):
- Bilder sind **standardmässig privat**. Keine Nutzung für Training
  oder Auswertung ohne ausdrückliche Freigabe.
- Freigabe ist **Opt-in und ausdrücklich nicht im Onboarding**
  (`training_consent: true | false`).
- **Jederzeit widerrufbar**; bei Widerruf werden Bilder aus dem
  Trainingspool entfernt, bestätigte Diary-Nährwerte bleiben.
- Coach und Admin sehen Bilder nur bei ausdrücklicher Freigabe.
- Festgelegt ist auch die Datenstruktur je Scan, inklusive
  `user_corrections`.

### Wo sie dem Ist-Zustand widersprechen

**Nirgends — es gibt noch nichts.** `[cmd]` Weder eine MealCam-Tabelle
noch ein `training_consent`-Feld existiert im Schema; `nutrition` führt
17 Tabellen, keine davon betrifft MealCam. Die ADRs beschreiben
Ungebautes, also kann der Bestand ihnen nicht widersprechen.

### Wo sie einer anderen Spec-Datei widersprechen

**Sie lösen den erwarteten Widerspruch NICHT.** `[read]` Beide ADRs
erwähnen `source` mit keinem Wort. Der in C-34 belegte Konflikt bleibt
also offen — **das ist das Ergebnis dieser Prüfung, kein Versäumnis.**

Dafür bringt eine dritte Datei die Entscheidung fast von selbst:
siehe `ADR_BLS_ONLY` unten.

### Für C-18 relevant

`[read]` Der Consent-ADR legt ein Muster fest, das über MealCam
hinausreicht: **privat als Standard, Opt-in getrennt vom Onboarding,
jederzeit widerrufbar.** `[cmd]` C-18 baut gerade ein Suchprotokoll —
also ebenfalls eine Sammlung von Nutzerverhalten zur späteren
Verbesserung.

`[annahme]` Ob die Consent-Regel auf Suchbegriffe anzuwenden ist, sagt
die ADR nicht; sie spricht nur von Bildern. **Das ist eine
Produktentscheidung für Tom**, und sie sollte fallen, bevor das
Protokoll produktiv Daten sammelt — nachträglich eingeholte
Einwilligung ist teurer als vorher bedachte.

---

## 2. `SPEC_09_SCORING.md`

### Was sie entscheidet

`[read]` Neun Abschnitte, alles deterministisch und ohne KI:
- **Nutrition Daily Score** (0–100): misst Erfüllung der Makro-Targets,
  mit Level-Multiplikatoren und Schwellen.
- **Plan Compliance Score**, **Mikronährstoff-Flags**,
  **Water Compliance**.
- Ausgaben für Goals, für „Pending Actions" und für den AI-Buddy.
- Grundsätze: reine Funktionen, **Scores werden nie gespeichert**,
  Implementierungsort `packages/scoring/src/nutrition.ts`.

### Die Sorge des Registers ist ausgeräumt

`[read]` Das Register vermerkte: *„grenzt vermutlich an das Scoring aus
C-38; vor dem Bau prüfen, ob dieselbe Kennzahl gemeint ist."*

`[cmd]` **Nein.** `SPEC_09` enthält **null** Vorkommen von
`sort_weight`. Es geht um eine völlig andere Kennzahl:

| | C-38 / SPEC_05 | SPEC_09 |
|---|---|---|
| misst | Relevanz eines **Lebensmittels** | Zielerfüllung eines **Tages** |
| Bereich | 0–1000 | 0–100 |
| Speicherung | fest in `nutrition.foods` | `[read]` nie gespeichert |
| Ort | Kette, SQL | `packages/scoring/` |

**Es ist keine dritte Fassung der Formel.** `[cmd]` Anders als `SPEC_08`,
das eine zweite Fassung enthielt, deren U/V-Regel am Bestand
nachweislich falsch war.

### Wo sie dem Ist-Zustand widerspricht

`[read]` *„RDA-Werte kommen direkt aus `nutrition.nutrient_defs.rda_male`
/ `rda_female`. Kein Hardcoding im Scoring-Code — immer aus DB."*

`[cmd]` **Die Spalten existieren, sind aber vollständig leer:**

| | |
|---|---|
| `nutrient_defs` gesamt | `[cmd]` 138 |
| davon mit `rda_male` | `[cmd]` **0** |
| davon mit `rda_female` | `[cmd]` **0** |

Die Mikronährstoff-Flags aus Abschnitt 3 können damit **heute nichts
berechnen**. Der Daily Score braucht ausserdem Targets — `[cmd]`
`nutrition.nutrition_targets` existiert nicht.

### Wo sie einer anderen Spec-Datei widerspricht

**`SPEC_09` gegen `NUTRITION_NEXT_SPEC_DECISIONS` Abschnitt 8** —
zwei Orte für dieselben Referenzwerte:

| | |
|---|---|
| `[read]` `SPEC_09` | RDA aus `nutrient_defs.rda_male` / `rda_female` |
| `[read]` Abschnitt 8 | eigene Tabelle `nutrient_reference_values` mit RDA, AI, UL, `target_range`, abhängig von Alter, Geschlecht, Schwangerschaft, Stillzeit |

`[cmd]` `nutrient_reference_values` existiert nicht. Die
`nutrient_defs`-Spalten tragen nur **zwei** Werte je Nährstoff
(männlich/weiblich) und können Alter, Schwangerschaft oder UL gar nicht
abbilden. **Die beiden Entwürfe schliessen einander aus.**

---

## 3. `ADR_BLS_ONLY.md`

### Was sie entscheidet

`[read]` (Status „Final"):
- **BLS 4.0 ist die einzige Master-Datenquelle für V1.**
  OpenFoodFacts und USDA sind nicht Teil von V1 „und werden auch nicht
  für Phase 2 eingeplant ohne explizite erneute Entscheidung".
- Begründet über eine Vergleichstabelle: keine Deduplikation nötig,
  bundesbehördliche Pflege, 138 Nährstoffe, hohe Relevanz für
  DE-Nutzer.
- **Vier erlaubte `source`-Werte für `foods_custom`:**
  `user`, `manual`, `import`, `admin`.
- `openfoodfacts` ist als Wert ausdrücklich entfernt.
- Phase 2: BLS-5.0-Update und Barcode-Lookup, je separat zu entscheiden.

### Nennt sie Ausnahmen? — Nein

**Die in C-34 angenommenen „benannten Ausnahmen" trägt sie nicht.**
`[read]` Die ADR kennt keine Ausnahme für Supplements oder
thailändische Küche. Ihre einzigen Öffnungen sind die vier
`source`-Werte, und die betreffen **wer** einen Eintrag anlegt, nicht
**welche fremde Datenquelle** einfliessen darf.

Beide vermuteten Ausnahmen sind anderswo geregelt, und beide gehen in
die entgegengesetzte Richtung:

| | |
|---|---|
| **Supplements** | `[read]` Abschnitt 20: *„Nutrition-Modul speichert keine Supplement-Produkte"* — eigenes Modul, Abfrage per API. Also **keine** Ausnahme in Nutrition, sondern Zuständigkeit ausserhalb. |
| **Thai** | `[read]` Abschnitt 16: Thai ist in V1 **nur strukturell** vorbereitet. *„Food-Namen brauchen Schema für Thai, Werte können später kommen"*, *„keine künstliche Thai-Fallback-Suche"*. Also **keine** eigenen Thai-Einträge. |

`[cmd]` Der Bestand folgt Abschnitt 16 heute wörtlich: **0 von 7.140**
Einträgen tragen einen `name_th`, und es gibt **0** Aliase in
thailändischer Schrift — das Schema ist da, die Werte fehlen, genau wie
vorgesehen.

### Wo sie einer anderen Spec-Datei widerspricht

**Hier fällt die Entscheidung im C-34-Widerspruch — zwei gegen eins:**

| Datei | `source`-Werte |
|---|---|
| `[read]` `ADR_BLS_ONLY` (Final) | `user`, `manual`, `import`, `admin` |
| `[read]` `ADR_CUSTOM_FOODS_V1` (Final) | dieselben vier, plus ausdrücklich *„Nicht erlaubt: `mealcam` als source — MealCam erstellt Custom Foods als `user`"* |
| `[read]` `SPEC_02_PATCH_ENTITY07_CUSTOMFOOD` | `user \| mealcam` |

`[annahme]` Zwei ADRs im Status „Final" nennen dieselbe Viererliste, die
Patch-Datei steht allein. **Die Entscheidung trifft Tom** — aber die
Beweislage ist einseitig.

---

## 4. `NUTRITION_NEXT_SPEC_DECISIONS.md`

`[read]` 21 Abschnitte. Abschnitt 3 und 4 sind laut Register in C-34
aufgegangen; hier der Rest.

### Was noch trägt — und was der Bestand dazu sagt

| # | Thema | Stand am Bestand |
|---|---|---|
| 1 | V1-Scope: 12 Pflichtbereiche | `[cmd]` gebaut: Food Search, BLS-DB, Meals/Diary, Meal Items mit Snapshot, Water Logs. **Offen:** Nutrition Targets, Custom Foods, Micronutrient Review, MealCam, Preferences (teilweise) |
| 2 | BLS als Quelle | deckungsgleich mit `ADR_BLS_ONLY` |
| 5 | 16 V1-Tags | `[cmd]` **alle 16 sind als `tag_definitions` angelegt** — Soll und Ist stimmen exakt überein |
| 6 | Preferences/Onboarding | `[cmd]` `food_preferences` + `food_preference_items` existieren |
| 7 | Micronutrient Review | braucht die Supplements-API — nicht gebaut |
| 8 | `nutrient_reference_values` | `[cmd]` existiert nicht; **widerspricht SPEC_09**, siehe oben |
| 12 | Diary Snapshots | `[cmd]` **umgesetzt** — `meal_items` trägt `food_source` und `frozen_at` |
| 13 | Nutrition Targets | `[cmd]` Tabelle existiert nicht (gehört zu Goals/C-06) |
| 14 | Water Logs | `[cmd]` umgesetzt in `055`/`056`, inhaltlich deckungsgleich |
| 16 | Thai nur strukturell | `[cmd]` genau so: Schema da, 0 Werte |
| 20 | Supplements-Grenze | Nutrition speichert keine Supplement-Produkte |

### Die Ranking-Regeln aus Abschnitt 4 gegen die gebaute Suche

`[read]` Abschnitt 4 nennt zwölf Ranking-Regeln. `[cmd]` Gegen
`073_suchfilter.sql` geprüft:

| Regel | Stand |
|---|---|
| exakter Name-Match oben | `[cmd]` gebaut (Stufe 1.0) |
| exakter Alias-Match danach | `[cmd]` gebaut (0.95) |
| Prefix vor Fuzzy | `[cmd]` gebaut (0.85 / 0.80 / 0.75) |
| **Custom Foods bevorzugt** | `[cmd]` **fehlt** — keine Custom-Tabelle |
| **Häufig genutzte Foods mit Boost** | `[cmd]` **fehlt** — kein Nutzungszähler in `food_search` |
| **Kategorie-Match als Boost** | `[cmd]` **fehlt** |
| **Tags als Boost bei Tag-Suchbegriff** | `[cmd]` **fehlt** |
| Quelle anzeigen (BLS/Custom) | `[cmd]` fehlt |

`[annahme]` Vier der fehlenden Regeln hängen an Custom Foods (C-34) und
am Nutzungsprotokoll (C-18) — sie sind nicht vergessen, sondern noch
nicht baubar. Gemessen ist nur, dass sie fehlen.

### Abschnitt 5 verlangt mehr, als die Tabelle kann

`[read]` *„Tag-Quelle oder Reason-Feld"*, „manuelle Tag-Overrides",
„Admin darf Tags bei BLS Foods korrigieren", „Tags müssen erklärbar
sein".

`[cmd]` `nutrition.food_tags` trägt genau drei Spalten:
`food_id`, `tag_code`, `confidence`. **Kein Quellen- oder Grundfeld**,
also auch keine Unterscheidung zwischen automatisch abgeleitet und
manuell gesetzt.

`[cmd]` Und von den 16 definierten Tags sind **nur vier vergeben**:

```
low_carb 4.659 · low_fat 2.648 · high_protein 1.400 · high_fiber 558
```

Die zwölf übrigen — `vegan`, `vegetarian`, `gluten_free`, `halal`,
`kosher`, `thai_food`, `ultra_processed` und weitere — sind **definiert,
aber an keinem einzigen Lebensmittel gesetzt**. `[annahme]` Sie brauchen
Kuration oder eine Ableitung aus der Warengruppe; beides ist nicht
gebaut.

---

## Widersprüche

Die Liste, die Tom eine Entscheidung abverlangt.

### A — Spec gegen Spec

| # | Widerspruch | Beweislage |
|---|---|---|
| **A1** | **`source`-Werte für Custom Foods.** `ADR_BLS_ONLY` und `ADR_CUSTOM_FOODS_V1` (beide „Final"): vier Werte ohne `mealcam`. `SPEC_02_PATCH_ENTITY07_CUSTOMFOOD`: `user \| mealcam`. | `[read]` 2 ADRs gegen 1 Patch. Die MealCam-ADRs schweigen dazu. |
| **A2** | **Ort der Referenzwerte.** `SPEC_09`: RDA aus `nutrient_defs.rda_male/female`. Abschnitt 8: eigene Tabelle `nutrient_reference_values` mit RDA/AI/UL und Alters-/Geschlechtsabhängigkeit. | `[cmd]` Beide Orte heute leer bzw. nicht vorhanden. Die `nutrient_defs`-Spalten können Abschnitt 8 **nicht** abbilden. |
| **A3** | **Supplements im Micronutrient Review.** Abschnitt 7 und 20 setzen eine Supplements-V1-API voraus. | `[read]` Kein Modul, keine API im Repo. `[annahme]` Damit ist „Micronutrient Review" aus dem V1-Pflichtscope faktisch blockiert. |

### B — Spec gegen Ist-Zustand

| # | Widerspruch | Beleg |
|---|---|---|
| **B1** | `SPEC_09` liest RDA „immer aus DB" — die Spalten sind leer. | `[cmd]` 0 von 138 mit `rda_male`, 0 mit `rda_female` |
| **B2** | Abschnitt 5 verlangt ein Quellen-/Grundfeld an Tags. | `[cmd]` `food_tags` hat nur `food_id, tag_code, confidence` |
| **B3** | Abschnitt 5 führt 16 V1-Tags. | `[cmd]` 16 definiert, **4 vergeben**, 12 an null Lebensmitteln |
| **B4** | Abschnitt 4 verlangt Custom-, Häufigkeits-, Kategorie- und Tag-Boost im Ranking. | `[cmd]` keiner davon in `073_suchfilter.sql` |
| **B5** | Abschnitt 1 führt „Nutrition Targets" als V1-Pflicht. | `[cmd]` Tabelle existiert nicht |
| **B6** | `SPEC_09` nennt `packages/scoring/src/nutrition.ts` als Implementierungsort. | `[cmd]` `packages/scoring/` existiert nicht |

**Nichts davon habe ich aufgelöst.** Die Widersprüche stehen hier, damit
sie besprochen werden können.

---

## Vorschläge für die TODO — nicht eingetragen

`[read]` Auftragsgemäss nur als Vorschlag; `docs/todo/TODO.md` ist
unverändert.

1. **`source`-Werte festschreiben** (A1). Kleine Entscheidung, blockiert
   C-34. Vorschlag: den vier Werten der beiden ADRs folgen und die
   Patch-Datei als überholt vermerken.
2. **Ort der Referenzwerte entscheiden** (A2), bevor jemand
   Mikronährstoff-Flags baut. Die Spaltenlösung ist einfacher, kann
   aber UL und Altersabhängigkeit nicht — das ist die eigentliche Frage.
3. **RDA-Werte beschaffen** (B1). Ohne sie ist der halbe `SPEC_09`
   unbaubar. Ob die BLS-Quelle sie mitliefert, ist ungeprüft.
4. **Consent-Frage für C-18 klären**, bevor das Suchprotokoll Daten
   sammelt. `[read]` Der MealCam-Consent-ADR setzt „privat als Standard,
   Opt-in getrennt vom Onboarding" — ob das auch für Suchbegriffe gilt,
   sagt keine Spec.
5. **Tag-Kuration als eigener Punkt** (B3). Zwölf definierte Tags ohne
   eine einzige Zuweisung sind ein stiller Ausfall: die Tabelle
   existiert, die Oberfläche könnte danach filtern, und es käme nie ein
   Treffer.

---

## Was diese Auswertung nicht sagt

- **Sie ersetzt das Gespräch nicht.** `[read]` Nach
  `00-KONSOLIDIERUNG.md` ist ein Inhalt, der niemandem aufgefallen ist,
  nicht entschieden — er ist ungelesen. Alle vier Dateien stehen jetzt
  auf `gelesen`, **keine auf `aufgeloest`**.

- **Sie deckt vier von 84 Dateien ab.** `[cmd]` Danach stehen 74 auf
  `offen`. Insbesondere `SPEC_06_DATABASE_SCHEMA.md` (64 KB, auf
  `gelesen`, Spaltenebene offen) und `SPEC_07_API.md` sind ungeprüft.

- **Sie prüft nur Aussagen über den Bestand.** Produktentscheidungen —
  ob MealCam vor dem Barcode-Scanner kommt, ob Thai warten kann — sind
  wiedergegeben, nicht bewertet. Das ist Toms Feld.

- **`ADR_IMPROVEMENTS_PACKAGE.md` (6,7 KB) blieb ungelesen**, obwohl es
  im selben Ordner liegt und die grösste der ADR-Dateien ist. Es stand
  nicht im Auftrag. `[annahme]` Der Name deutet auf gesammelte
  Nachbesserungen — möglicherweise mit Bezug zu den hier gefundenen
  Widersprüchen.
