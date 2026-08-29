# Offene Fragen an Tom

**Erzeugt von `tools/fragen-index.mjs`. Nicht von Hand aendern.**

`[cmd]` **32 Punkte tragen `typ: entscheidung`
und sind keiner Entscheidung zugeordnet.**

`[read]` **Jeder Satz unten steht woertlich in der genannten
Punktdatei.** Das Gate prueft es bei jedem Lauf — wer hier
hineinschreibt, macht es rot.

**Wenn eine Frage entschieden ist:** ein ADR in
`docs/entscheidungen/`, und der Punkt bekommt `entscheidung: E-xx`.
Dann faellt er hier heraus.

`[read]` **Was aufbereitet gehoert, gehoert in die Punktdatei** —
nicht in diese Uebersicht.

---

# Hoch

## C-323 — Micro-Flags Warnschwelle und Formulierung festlegen

**Modul:** nutrition · **angelegt:** 2026-08-27 · **Datei:** `laufend_claudecode/nutrition-c-0323-micro-flags-warnschwelle-und-formulierung-festlegen.md`

## Befund

Offene Frage aus C-49: ab wann Unterversorgung gewarnt wird und mit welcher Formulierung.

## C-342 — Vitamin A in IE gegen Mikrogramm

**Modul:** nutrition · **angelegt:** 2026-08-29 · **Datei:** `todos/nutrition-c-0342-vitamin-a-in-ie-gegen-mikrogramm.md`

## Befund

Aus C-324, Codex, 2026-08-29. **Vom Orchestrator nachgemessen.**

`[cmd]` **Der Bestand fuehrt Vitamin A in Mikrogramm
Retinol-Aequivalent** — `nutrient_defs` und
`nutrient_reference_values` beide.

`[cmd]` **NRF9.3 rechnet gegen 5.000 IU.**

`[read]` **Und die Umrechnung ist formabhaengig:** Retinol und
Beta-Carotin haben verschiedene Faktoren. `[cmd]` **C-149 hat Vitamin
A und E deshalb ausdruecklich ohne Zuordnung gelassen.**

## Die Frage

**Wie soll NRF9.3 mit Vitamin A umgehen?**

`[read]` **Drei Wege, alle mit Kosten:**

**Faktor setzen und begruenden.** `[read]` Ein pauschaler Faktor waere
eine Annahme ueber die Zusammensetzung — **genau das, was C-149
verweigert hat.**

**Vitamin A weglassen.** `[read]` Dann ist es NRF8.3, **und die
Validierungsstudien gelten nicht mehr** — sie sind fuer die
Neunerfassung gerechnet.

**Gegen einen Mikrogramm-Richtwert rechnen.** `[read]` Der
EFSA-Zielwert steht im Bestand. **Dann ist es nicht mehr die
Originalfassung** — E-25 haelt fest, dass die Studienlage fuer die
Originalwerte gilt.

`[read]` **Der dritte Weg ist der ehrlichste, wenn er benannt wird:**
*,,NRF9.3 mit europaeischen Referenzwerten"* ist eine eigene Formel,
**aber sie waere durchgehend eine.** Die anderen beiden mischen.

---

# Mittel

## A-43 — Coach-Permissions pro Subfunktion

**Modul:** coach · **angelegt:** 2026-08-21 · **Datei:** `todos/coach-a-0043-coach-permissions-pro-subfunktion.md`

## Befund

(neu 2026-08-21).
  **Entscheidung fuer Tom.** Abgespalten von A-37.

  `[read]` **A-37 traegt zwei Titel** — in `TODO.md` *„Zwoelf ADRs"*, in
  der Entscheidungsliste *„Coach-Permissions pro Subfunktion"*. **Das
  ist ein eigener Punkt.**

  `[cmd]` **`ADR_COACH_PERMISSIONS_V1`:** *„User kann **pro Modul und
  Subfunktion** freigeben"* — mit Beispielen: `nutrition.diary`,
  `nutrition.water`, `nutrition.micronutrient`, `nutrition.mealcam_*`.

  `[cmd]` **Gebaut ist nur pro Modul** — `client_permissions` hat
  `nutrition_visibility`, nicht `nutrition_diary_visibility`.

  `[read]` **Das betrifft die Kernanforderung des Coach-Portals.**
  **Zu entscheiden: reicht die Modulstufe, oder kommt die Feinstufe?**

  `[cmd]` **F-06 hat gemessen, dass die Freigabe ueberhaupt erst seit
  C-162 wirkt** — 22 `coach_read`-Policies ueber sechs Module. **Eine
  Feinstufe waere sechs mal soviel.**

## C-29 — Drei Namensschichten und eine Kuration, die den Kettenlauf überlebt

**Modul:** nutrition · **angelegt:** 2026-08-14 · **Datei:** `todos/nutrition-c-0029-drei-namensschichten-und-eine-kuration-die-den-kettenlauf-uberlebt.md`

## Befund

(neu 2026-08-14). Setzt C-28 voraus.

  **Zwei Befunde, die das nötig machen:**

  `[cmd]` **Der heutige Importschritt überschreibt jede Handarbeit.**
  `supabase/_pipeline/03_bls_import/030_apply_local.sql:48` trägt
  `on conflict (bls_code) do update set … name_display = excluded.name_display`.
  Jeder Aufbau — und der läuft in unter zehn Sekunden, also oft — setzt
  den CSV-Wert zurück.

  **Das ist keine Eigenschaft der Kette, sondern dieses einen Skripts**
  (Tom, 2026-08-14). Neue BLS-Codes kommen dazu, Quellwerte ändern sich
  gelegentlich — ein Schritt, der **gezielt** aktualisiert und kuratierte
  Felder unangetastet lässt, löst das sauber. Was bleibt, ist eine
  Reihenfolge: **dieses Skript wird umgebaut, bevor der erste Name
  kuriert wird.** Solange es unverändert läuft, ist jede Handarbeit beim
  nächsten Aufbau verloren.

  `[cmd]` **Die Anzeigespalten sind heute reine Kopien.** `name_display`
  ist bei **7.140 von 7.140** identisch mit `name_de` — null Abweichungen.
  `name_display_en` ist identisch mit `name_en`, `name_display_th` und
  `name_th` sind durchgehend leere Zeichenketten. Die Spalten tragen
  keine Information; sie sind Platzhalter für genau diese Arbeit.

  **Die drei Schichten:**

  | Schicht | Inhalt | editierbar | Zweck |
  |---|---|---|---|
  | Quellname `name_de`/`name_en` | amtlicher BLS-Wortlaut | **nein** | Prüfbarkeit gegen die Arbeitsmappe |
  | Anzeigename (je Zuordnung) | wie der Mensch es nennt | ja | Anzeige und Sortierung |
  | Suchnamen `food_aliases` | alle Schreibweisen | ja | was gefunden wird |

  `name_de` bleibt unveränderlich. `[cmd]` Der Bestand ist gegen die
  amtliche Arbeitsmappe verifiziert — 698.092 Werte, 353 Abweichungen,
  alle Rundungen. Diese Prüfbarkeit hängt am unveränderten Wortlaut. Wer
  den Quellnamen überschreibt, kann nie wieder gegen die Quelle prüfen.

  **`name_en` ist der maschinelle Startwert** (Befund 2026-08-14 am
  Reis-Fall). `[cmd]` Der englische BLS-Name ist durchgängig
  menschenlesbarer als der deutsche: `Reis poliert, roh` heißt dort
  **White rice raw**, `Reis unpoliert` heißt **Brown rice**. Die
  deutsche Fachsprache des BLS (poliert/unpoliert) hat im Englischen
  keine Entsprechung. Der Gattungsname ist damit für einen grossen Teil
  des Bestands keine Erfindung, sondern eine Übersetzung aus einem Feld,
  das bereits vorhanden ist — Handarbeit fällt nur dort an, wo auch das
  Englische Fachsprache bleibt. Vor der Kuration zu messen: bei wie
  vielen Arten weicht `name_en` inhaltlich von `name_de` ab und ist
  dabei das gebräuchlichere Wort.

  **Umfang:**
  - Override-Tabelle je kuratierter Zuordnung (nicht je Art — siehe
    C-36), angewandt in einem Kettenschritt unter
    `02_human_layer/` — nach dem Import, wie `024_suchsynonyme.sql` es
    bereits vormacht.
  - Umbenennung `name_display` → `name_display_de`. `[cmd]` 246
    Vorkommen in 32 Dateien. Ein eigener Commit, keine Vermischung.
  - **Offene Entscheidung für Tom:** Erzeugt ein gepflegter Gattungsname
    automatisch einen Alias, oder nur einen Vorschlag zum Bestätigen?
    Automatisch ist bequemer, aber eine Zuordnung wie „Hüttenkäse" auf
    einen Frischkäse ist eine inhaltliche Aussage, die falsch sein kann.

## G-134 — Die vier Filtergruppen gibt es in den Daten nicht

**Modul:** nutrition · **angelegt:** 2026-08-20 · **Datei:** `todos/nutrition-g-0134-die-vier-filtergruppen-gibt-es-in-den-daten-nicht.md`

## Befund

(neu
  2026-08-20). **Entscheidung.** Befund aus C-164.

  `[cmd]` **`tag_type` traegt drei Werte:** `diet` (9 Codes),
  `processing` (2), `allergen` (3).

  `[read]` **Die Oberflaeche zeigt vier Gruppen** — Ernaehrungsform,
  Naehrwert, Verarbeitung, Allergene. **„Ernaehrungsform" und „Naehrwert"
  sind beide `diet`.**

  `[cmd]` **Folge:** *„Wer stumpf nach `tag_type` gruppiert, verodert
  `vegan` mit `high_protein`."*

  `[read]` **Damit ist die Gruppierung eine Entscheidung, keine
  Ablesung.** **Entweder eine Gruppenspalte in `tag_definitions`, oder
  die Zuordnung bleibt in der Anzeige** — dann steht sie an zwei
  Stellen.

## G-136 — Zwei Kartenzuordnungen sind Auslegung

**Modul:** nutrition · **angelegt:** 2026-08-20 · **Datei:** `todos/nutrition-g-0136-zwei-kartenzuordnungen-sind-auslegung.md`

## Befund

(neu
  2026-08-20). **Entscheidung fuer Tom.** Aus G-129.

  `[cmd]` **Die Acht-Karten-Liste aus GO-22 nennt sie nicht** — der
  Agent hat entschieden und markiert:

  | | wohin | Begruendung |
  |---|---|---|
  | **`FIBT` Ballaststoffe** | **Kohlenhydrate** | *„sind Kohlenhydrate; Cronometer ebenso"* |
  | Wasser, Alkohol, Organische Saeuren, Rohasche | **Sonstige** | *„die Liste laesst ihnen keinen anderen Platz"* |

  `[cmd]` **Je eine Zeile in `karteFuerWurzel`**, falls es anders sein
  soll.

  `[read]` **Beide sind vertretbar.** Ballaststoffe unter Kohlenhydrate
  ist fachlich richtig. **Wasser bei *„Sonstige"* ist der schwaechere
  Teil** — es ist einer der sechs Naehrstoffklassen, aber eine eigene
  Karte fuer einen Eintrag waere seltsam.

## G-152 — Der Aktivitaetsstrom des Dashboards

**Modul:** nutrition · **angelegt:** 2026-08-20 · **Datei:** `todos/nutrition-g-0152-der-aktivitaetsstrom-des-dashboards.md`

## Befund

(neu 2026-08-20,
  aus G-100).

  `[cmd]` **Er waere baubar** — anders als der Tagesverlauf braucht er
  keine Dauer, nur Zeitpunkt, Modul und einen Satz. Die Zeitpunkte
  liegen vollstaendig vor: `meals.meal_time` **725/725**,
  `intake_logs.intake_time` **360/360**,
  `workout_sessions.started_time` **30/30**.

  `[read]` **Was fehlt, ist eine Entscheidung, keine Spalte:** Es gibt
  keine gemeinsame Ereignistabelle. Sechs Abfragen je Seitenaufruf,
  nach Zeit gemischt — **oder** eine Sicht in der Datenbank, die das
  einmal tut. Das Zweite waere die Loesung, das Erste die Abkuerzung.

## G-226 — V1-Status-Marker fehlen für Recipes/Shopping/MealPlans Components in SPEC_10

**Modul:** nutrition · **angelegt:** 2026-08-28 · **Datei:** `todos/nutrition-g-0226-v1-status-marker-fehlen-fuer-recipes-shopping-mealplans-co.md`

## Befund

**Aus `OPUS_REVIEW_NUTRITION_03_UI_FLOWS_READINESS.md`, IMP-4.**
`[read]` **Wortlaut der Review, nicht vom Orchestrator formuliert.**

`ADR_RECIPES_SCHEMA_ONLY.md`:
> V1: Schema vorbereiten — kein Full-UI, kein Full-API Pflicht.
> Wenn Zeit knapp: Recipes, Meal Plans und Shopping Lists komplett auf Phase 2 verschoben.

`SPEC_10_COMPONENTS.md` listet:
- 5 Recipe Components (`RecipeList`, `RecipeCard`, `RecipeBuilder`, `RecipeDetail`, `RecipeLogModal`)
- 3 Shopping List Components (`ShoppingListView`, `ShoppingListDetail`, `ShoppingListItem`)
- 8 Meal Plan Components (`MealPlanList`, `MealPlanCard`, ...)

Ohne V1-Status-Hinweis. Reader interpretiert sie als V1-Pflicht.

`SPEC_10_PASS2_PATCH.md` adressiert das nicht. Der Pass-2-Patch ergänzt nur neue Components.

`SPEC_03_USER_FLOWS.md §Flow 7` (Rezepte) und §Flow 8 (Einkaufsliste) sind als komplette V1-Flows beschrieben — ohne Phase-2-Markierung.

**Konsequenz:** WO-Generator könnte vollen Recipe-Builder als V1-Pflicht-WO schreiben, obwohl ADR sagt: optional.

## Stand

`[read]` **Die Review stammt aus der Spec-Phase und ist nicht gegen
den heutigen Stand geprueft.** `[cmd]` **Sie kennt die Entscheidungen
vom 27./28.08. nicht** — was sie fordert, kann inzwischen entschieden
oder erledigt sein.

## G-227 — SPEC_03 §Flow 6 Custom Food erstellen via Barcode-Scan widerspricht Phase-2-Status

**Modul:** nutrition · **angelegt:** 2026-08-28 · **Datei:** `todos/nutrition-g-0227-spec-03-flow-6-custom-food-erstellen-via-barcode-scan-wide.md`

## Befund

**Aus `OPUS_REVIEW_NUTRITION_03_UI_FLOWS_READINESS.md`, IMP-5.**
`[read]` **Wortlaut der Review, nicht vom Orchestrator formuliert.**

`NUTRITION_NEXT_SPEC_DECISIONS.md §1` und `§23`: Barcode Scanner ist Phase 2.
`ADR_MEALCAM_V1.md`: Barcode Scanner ist Phase 2.

`SPEC_03_USER_FLOWS.md §Flow 6 (Custom Food erstellen)`:
> 1. Aus Food Search: kein Ergebnis → "Selbst anlegen"
>    ODER: **Barcode-Scan** → nicht gefunden → "Custom erstellen"
>    ODER: direkt über "+ Eigenes Food" Button

`SPEC_04_FEATURES.md §Feature 4 (Custom Foods)` listet Barcode-Scanning als V1-Feature ("Erstellungs-Wege: 2. Barcode-Scan"). Bezieht sich auf `ADR_IMPROVEMENTS_PACKAGE.md #19` (außerhalb dieses Review-Scopes, aber in Review 1 als Phase-2-konfliktig markiert).

**Konsequenz:** UI-Komponenten könnten Barcode-Scan-Einstieg implementieren, was Phase 2 ist.

## Stand

`[read]` **Die Review stammt aus der Spec-Phase und ist nicht gegen
den heutigen Stand geprueft.** `[cmd]` **Sie kennt die Entscheidungen
vom 27./28.08. nicht** — was sie fordert, kann inzwischen entschieden
oder erledigt sein.

**Verwandter Punkt:** E-19 (Cam ist Endausbau); Tom 27.08.: Barcode/QR "kommt aber spaeter". `[read]` **Nicht zusammengelegt** — ob es
derselbe Befund ist, gehoert geprueft, nicht angenommen.

## G-228 — Score Level Multiplier inkonsistent zwischen SPEC_04 und SPEC_07

**Modul:** nutrition · **angelegt:** 2026-08-28 · **Datei:** `todos/nutrition-g-0228-score-level-multiplier-inkonsistent-zwischen-spec-04-und-s.md`

## Befund

**Aus `OPUS_REVIEW_NUTRITION_03_UI_FLOWS_READINESS.md`, IMP-6.**
`[read]` **Wortlaut der Review, nicht vom Orchestrator formuliert.**

`SPEC_04_FEATURES.md §Feature 11 (Nutrition Score)`:
> level_multiplier: beginner 0.75 | intermediate 0.90 | advanced 1.00 | **elite 1.10**

`SPEC_07_API.md §8 Score Response`:
```json
{
  "level_multiplier": 0.90,
  "user_level": "intermediate"
}
```

Vier Level in SPEC_04 (beginner/intermediate/advanced/elite). SPEC_07-Response zeigt nur `intermediate` als Beispiel. Es ist nicht spezifiziert, woher `user_level` kommt — User-Profil-Feld? Wo gepflegt? Settings-UI? Nicht belegt.

`SPEC_10` `NutritionScoreCard` zeigt Score 0–100 + Status, aber keine UI für Level-Multiplier-Erklärung oder -Auswahl.

**Konsequenz:** Score-Berechnung hat externen Input (`user_level`), dessen UI-/API-Pfad nicht spezifiziert ist. Workorder ist blockiert bis das geklärt ist.

## Stand

`[read]` **Die Review stammt aus der Spec-Phase und ist nicht gegen
den heutigen Stand geprueft.** `[cmd]` **Sie kennt die Entscheidungen
vom 27./28.08. nicht** — was sie fordert, kann inzwischen entschieden
oder erledigt sein.

## G-229 — Admin-Override-Flow für Tag-Korrekturen nicht belegt

**Modul:** nutrition · **angelegt:** 2026-08-28 · **Datei:** `todos/nutrition-g-0229-admin-override-flow-fuer-tag-korrekturen-nicht-belegt.md`

## Befund

**Aus `OPUS_REVIEW_NUTRITION_03_UI_FLOWS_READINESS.md`, IMP-7.**
`[read]` **Wortlaut der Review, nicht vom Orchestrator formuliert.**

`NUTRITION_NEXT_SPEC_DECISIONS.md §5`:
> manuell gepflegte Tag-Liste für schwierige Tags
> Admin darf Tags bei BLS Foods korrigieren
> User darf Tags bei Custom Foods selbst setzen

`SPEC_06_DATABASE_SCHEMA.md` Trigger `auto_tag_food` — automatisch.
Manueller Override-Mechanismus für Admin nicht belegt:
- Kein Admin-API-Endpoint in SPEC_07 oder SPEC_07_PASS2_PATCH (nicht belegt)
- Kein Admin-UI in SPEC_10 (nicht belegt)
- Trigger löscht alle bestehenden Tags vor INSERT (`DELETE FROM food_tags WHERE food_id = p_food_id;`) — dadurch würde ein manueller Admin-Override beim nächsten `UPDATE foods` automatisch überschrieben.

User-Tags für Custom Foods:
- Decisions §5: "User darf Tags bei Custom Foods selbst setzen"
- `foods_custom` hat `custom_allergens TEXT[]` (EU-14 Allergene), aber kein generisches Tag-Feld.
- Kein API-Endpoint für `POST /foods/custom/:id/tags` in SPEC_07.

**Konsequenz:** Wenn V1 Admin-Tag-Korrekturen oder User-Custom-Tags verlangt, sind diese Pfade nicht implementierbar.

---

## Stand

`[read]` **Die Review stammt aus der Spec-Phase und ist nicht gegen
den heutigen Stand geprueft.** `[cmd]` **Sie kennt die Entscheidungen
vom 27./28.08. nicht** — was sie fordert, kann inzwischen entschieden
oder erledigt sein.

**Verwandter Punkt:** C-31 (Admin-Oberflaeche fuer die Kuration). `[read]` **Nicht zusammengelegt** — ob es
derselbe Befund ist, gehoert geprueft, nicht angenommen.

## G-250 — die vier Zustaende fehlen in der Ordnung

**Modul:** nutrition · **angelegt:** 2026-08-28 · **Datei:** `todos/nutrition-g-0250-die-vier-zustaende-fehlen-in-der-ordnung.md`

## Befund

Aus G-249, Claude Code, 2026-08-28. **Als Verlust gemeldet, nicht
versteckt.**

`[read]` **Die Ordnung bildet ihren Status aus `goals.nutrition_targets`**
— dem persoenlichen Ziel aus den Goals. `[read]` **Die vier Zustaende
aus G-239 stammen aus `daily_reference_assessment`** — der
wissenschaftlichen Referenz.

    gedeckt · zu wenig · ueber der Obergrenze · kein Richtwert

`[read]` **Beides in einer Zeile zu mischen haette zwei Wahrheiten
ergeben:** *,,unter Ziel"* nach deinem Goal und *,,gedeckt"* nach EFSA
koennen gleichzeitig gelten.

`[cmd]` ***,,Kein Richtwert"* als eigene Aussage steht jetzt nur noch
im Modal.**

## Die Entscheidung

**Soll die Ordnung beide Achsen fuehren?**

`[read]` **Das ist dieselbe Frage wie bei den Regeln in G-218** —
`severity` und `recommended_action_type` sind zwei Achsen, und die
Messung ergab: **innerhalb `critical` redundant, ueber den Katalog
nicht.**

`[read]` **Hier waere zu messen, wie oft die beiden Aussagen
auseinandergehen.** `[read]` **Wenn selten: eine Achse reicht, mit
Vermerk beim Rest. Wenn oft: beide, und die Zeile muss sagen, welche
sie meint.**

`[cmd]` **Und die Datenlage traegt es:** 60 Naehrstoffe haben ein
persoenliches Ziel, die uebrigen 78 nur die Referenz. **Bei diesen 78
gibt es gar keinen Widerspruch.**

## G-254 — sechs Kacheln brauchen eine Entscheidung

**Modul:** nutrition · **angelegt:** 2026-08-29 · **Datei:** `todos/nutrition-g-0254-sechs-kacheln-brauchen-eine-entscheidung.md`

## Befund

Aus G-11, Claude Code, 2026-08-29. **Bewusst nicht gebaut.**

`[read]` **Vier Kacheln im Diary, zwei in Plans.** `[read]` **Je
Kachel dieselbe Frage: woraus soll die Zahl entstehen?**

`[read]` **Der Bericht nennt drei Beispiele, und sie zeigen, dass es
keine Bauentscheidung ist:** *,,was ist ein Vorschlag, was misst ein
Score, was ist ein *ghost entry*."*

## G-72 — Acht Spalten ohne Wirkung und ohne Kachel

**Modul:** nutrition · **angelegt:** 2026-08-19 · **Datei:** `todos/nutrition-g-0072-acht-spalten-ohne-wirkung-und-ohne-kachel.md`

## Befund

(neu
  2026-08-19). **Entscheidung fuer Tom.** Rest aus G-65.

  `[cmd]` **`cooking_skill`, `prep_time_max_min`, `budget_level`,
  `meals_per_day`, `snacks_per_day`, `meal_prep_ok`,
  `preferred_cuisines`, `planner_notes`** — gespeichert, ohne Wirkung,
  **und das Mockup hat fuer keine eine Stelle.**

  `[read]` **Der Agent hat richtig gemeldet statt gebaut:** *„Der
  Auftrag sagte „Zeigen ja" — aber das Mockup hat fuer keine eine
  Stelle, und eine zu erfinden waere eine doppelte Erfindung."*

  `[cmd]` **Sie stammen aus Schritt 3 des Vorgaenger-Assistenten** —
  Kochen & Alltag. **Und sie wirken erst mit Rezepten und
  Essensplaenen**, die es nicht gibt.

  **Zu entscheiden:** Kachel dazu, oder liegenlassen bis Meal plans?

## C-241 — Das Nachweiskonto traegt weder Essensplaene noch Medikamente

**Modul:** quer · **angelegt:** 2026-08-23 · **Datei:** `todos/quer-c-0241-das-nachweiskonto-traegt-weder-essensplaene-noch-medikamente.md`

## Befund

(neu 2026-08-23). Aus der Pruefung von G-161 und der
  Vorbereitung von G-162.

  `[cmd]` `nutrition.meal_plans` — gesamt 2, `dev@lumeos.app` 1,
  **`test-user@lumeos.local` 0**. Ebenso Wochen 6/3/0, Tage 42/21/0,
  Eintraege 112/56/0.
  `[cmd]` `medical.user_medications` — gesamt 2, `dev` 1,
  **`test-user` 0**.

  `[read]` **Die Folge ist konkret, nicht theoretisch:** G-161 musste
  seinen Nachweis auf `dev@lumeos.app` fuehren, gegen die Regel. Und
  **G-162 ist in seinem medical-Teil gar nicht beauftragbar** — der
  Punkt nennt *„`user_medications` 2"*, das ist die Gesamtzahl. Ein
  Agent saehe auf dem Nachweiskonto eine leere Liste und koennte nicht
  belegen, dass die Kachel liest.

  `[read]` **Beides ist in der Uebergabe als *bewusst leer* vermerkt.**
  Die Entscheidung ist also nicht *„vergessen"*, sondern *„soll das so
  bleiben"* — und wenn ja, wie ein Agent dort etwas belegen soll.
  Seeds gehoeren in die Kette, also zu Codex.

## E-10 — RLS neu bewerten, sobald `main` produktiv wird

**Modul:** quer · **angelegt:** 2026-08-01 · **Datei:** `todos/quer-e-0010-rls-neu-bewerten-sobald-main-produktiv-wird.md`

## Befund

— viele
  Legacy-Tabellen sind `UNRESTRICTED`. Bei Dummydaten unkritisch (Entscheidung
  Tom), bei echten Nutzerdaten nicht. *Vgl. D-14 — derselbe Befund lokal:
  9 von 11 `nutrition`-Tabellen ohne RLS, obwohl die Migration es beschreibt.
  Das Muster wiederholt sich über zwei unabhängige Instanzen.*

## C-123 — Recovery — die neun Entscheidungen

**Modul:** recovery · **angelegt:** 2026-08-19 · **Datei:** `todos/recovery-c-0123-recovery-die-neun-entscheidungen.md`

## Befund

(neu 2026-08-19).
  **Von Tom entschieden am 2026-08-19.** Grundlage fuer die Bauauftraege.

  | | Entscheidung |
  |---|---|
  | **E1** | **Nur `manual`.** *Die Wearables kommen spaeter.* |
  | **E2** | Soreness: **nur gemeldete Muskeln > 0** |
  | **E3** | **Sechs Readiness-Stufen**, Texte einzeln abnehmen |
  | **E4** | **siehe unten** |
  | **E5** | **Recherchieren** statt setzen |
  | **E6** | **Stress-Score bauen** — nicht zurueckstellen |
  | **E7** | **Eine Erholungskurve** |
  | **E8** | **Recherchieren** |
  | **E9** | Naehrstoff-Term: **Rueckfall 70**, als Rueckfall markiert |

  ### E4 — die wichtigste Praezisierung

  **Tom:** *„Wichtig: Wir bewerten nur Fakten. Die Empfehlung sehe ich
  als angebracht, wenn die Datenlage dem entspricht — **aber nicht wegen
  eines Uebertrainingssymptoms.**"*

  `[read]` **Der Arzt-Hinweis haengt an mehreren Signalen ueber Zeit**,
  nicht an einem Ausschlag. **Ein schlechter Tag ist kein Befund.**

  `[cmd]` **Was daraus folgt:** Die neun Signale werden gezaehlt und
  gezeigt — **die Empfehlung erscheint erst, wenn mehrere ueber mehrere
  Tage zusammenkommen.** Wie viele und wie lange, muss die Recherche
  aus E5/E8 mitbeantworten.

  ### E6 weicht vom Vorschlag ab

  `[cmd]` **Der Entwurf schlug zurueckstellen vor, Tom sagt bauen.**
  `[read]` Stress steht im Check-in und wirkt auf die Erholung — ihn
  wegzulassen hiesse, einen erfassten Wert unbenutzt zu lassen.

## C-167 — `MODALITY_BONUS` hat elf Modalitaeten, wir kennen vier

**Modul:** recovery · **angelegt:** 2026-08-20 · **Datei:** `todos/recovery-c-0167-modality-bonus-hat-elf-modalitaeten-wir-kennen-vier.md`

## Befund

(neu 2026-08-20). Aus SSOT 173. **Betrifft C-124.**

  `[cmd]` **Der Entwurf:**

  ```
  sauna 2.0 · massage 2.5 · cold_plunge 1.5 · contrast_therapy 2.0
  nap 1.5 · meditation 1.0 · breathwork 1.0 · yoga 0.75
  foam_rolling 0.5 · stretching 0.5 · active_recovery 0.5
  MAX_DAILY_BONUS = 5.0
  ```

  `[cmd]` **`recovery.modality_log` kennt vier** — Sauna, Dehnen,
  Massage, Eisbad.

  `[read]` **C-124 fuehrt die Werte als unbelegt** — **das bleibt
  richtig**, sie sind Entwurfswerte. **Aber die Liste ist laenger als
  gedacht, und der Deckel von 5,0 ist eine Entscheidung, die niemand
  kennt.**

## C-218 — Frontend und Datenbank normieren den Recovery-Score verschieden

**Modul:** recovery · **angelegt:** 2026-08-22 · **Datei:** `todos/recovery-c-0218-frontend-und-datenbank-normieren-den-recovery-score-verschieden.md`

## Befund

(neu 2026-08-22). Aus C-181 und C-215.

  `[cmd]` **Fable rechnet `subtotal/85 × 100`** (C-181), damit die
  Readiness-Schwellen 90/80/70/60/40 ihre Skala behalten.
  `[cmd]` **Codex laesst den Term ersatzlos wegfallen** (C-215):
  `manual_v2_c215`, `training_load_points` 0,00.

  `[cmd]` **Live vorher 79,4 mit `training_load_points` 10,50. Nach der
  Kette 68,9.** Ein Szenariotag faellt auf 35,3.

  `[cmd]` **`GEWICHTE.trainingslast: 15` steht weiter in `score.ts`** —
  mit `roh: 'entfaellt — C-181, ACWR ohne Beleg'`, aber das Gewicht ist
  da.

  `[read]` **Beide Wege sind fuer sich begruendet, zusammen ergeben sie
  zwei Skalen.** Zu entscheiden: normiert wird auf 100, oder die Skala
  faellt auf 85 und die Schwellen wandern mit. **Nicht beides.**

  `[read]` Und der Nutzer sieht eine Verschlechterung um zehn Punkte.
  Das ist die richtige Zahl — aber sie gehoert erklaert, nicht
  kommentarlos angezeigt.

---

## M — Die Module sagen die Unwahrheit ueber sich selbst

`[cmd]` **Aufgenommen am 2026-08-22** (C-217 Code, G-155 Bild).
Werkzeuge: `tools/_modul-bestand.py`, `tools/_g155-bestand.mjs`.
Maschinenlesbar: `backup/modul-bestand.json`, `backup/bestand/aufnahme.json`
(128 Eintraege), 128 Bildschirmfotos.

`[cmd]` **Gegengeprueft: 25 von 25 Zeilenzahlen exakt.** Der Bestand
stimmt, die Oberflaeche nicht.

`[read]` **Der Befund in einem Satz:** Sieben Module tragen einen
Pauschalbanner *„das Schema gibt es noch nicht"*. **Bei sechs ist er
falsch.** Und der groesste Posten ist nicht fehlendes Schema, sondern
**Daten liegen und werden nicht gelesen**.

`[cmd]` **Gesamtlage, Marken gegen Kacheln:**

| Modul | Marken | Kacheln | Schema | Zeilen | Lage |
|---|---:|---:|---|---:|---|
| supplements | 59 | 79 | da | 3.852 | 16 markierte Rueckfaelle neben echten Fassungen |
| coach/ai | 46 | 36 | **fehlt** | 0 | der einzige Banner, der stimmt |
| training | 38 | 56 | da | 9.946 | Banner nennt Tabellennamen, die nie existierten |
| recovery | 36 | 40 | da | 858 | Banner behauptet das Gegenteil der Datenbank |
| coach | 33 | 36 | da | 63 | Daten vollstaendig, Oberflaeche liest an einer Stelle |
| nutrition | 25 | 55 | da | 990.000+ | am weitesten echt; Plans-Tab Attrappe trotz Daten |
| goals | 23 | 71 | da | 450 | echt und Attrappen-Doppel je Tab |
| medical | 18 | 44 | da | 14.340 | Banner falsch, Detail-Banner praezise |
| dashboard | 12 | 8 | quer | — | haengt an den Quellmodulen |
| settings | 0 | 3 | — | 7 | echt |

### Die falschen Banner — eine Zeile je Modul

### Daten liegen, werden nicht gelesen — der groesste Posten

`[read]` Diese Punkte brauchen **kein Schema und keine Entscheidung**.
Die Tabellen sind da, gefuellt, und in denselben Modulen liest schon
etwas anderes daraus. **Das ist die billigste echte Arbeit im Repo.**

## G-106 — Der Readiness-Komposit waere ein zweiter Gesamtwert

**Modul:** recovery · **angelegt:** 2026-08-20 · **Datei:** `todos/recovery-g-0106-der-readiness-komposit-waere-ein-zweiter-gesamtwert.md`

## Befund

(neu 2026-08-20). Befund aus G-100. **Gemeldet statt gebaut.**

  `[cmd]` **Der Entwurf rechnet aus fuenf Anteilen einen Wert und
  schreibt *„Push hard"* daneben.**

  `[read]` **Zwei Gruende, warum er draussen blieb:** *„`recovery.scores`
  fuehrt bereits einen Gesamtwert mit sieben Anteilen (G-82) — **zwei
  Gesamtwerte nebeneinander waeren schlimmer als einer**."* Und *„Push
  hard"* ist Urteilssprache, wie *„Good"* (G-76) und *„Optimal"*
  (G-60).

  `[cmd]` **`Body battery` gibt es im Schema nicht** — *„keine Spalte
  `batter*` irgendwo."*

  **Zu entscheiden:** Faellt die Kachel weg, oder zeigt sie den
  vorhandenen Erholungswert?

## C-199 — `medication_regulatory` als eigene Entitaet

**Modul:** supplements · **angelegt:** 2026-08-22 · **Datei:** `todos/supplements-c-0199-medication-regulatory-als-eigene-entitaet.md`

## Befund

(neu 2026-08-22). **Zu entscheiden.**

  `[cmd]` Kimi fuehrt 498 Saetze mit `wada.status`, `wada.tue_context`
  und `change_history`. Im Repo liegt das als `regulatory_state jsonb`
  in `active_substances` — **es gibt keine vierte Tabelle.**

  `[cmd]` **WADA ist nur zu 11 % bewertet** (56 von 498).

  `[read]` **Fuer Wettkampfsportler ist WADA-Status eine Abfrage, kein
  Anhaengsel.** Als `jsonb` ist er nicht filterbar.

### Was gar kein Schema hat

## C-341 — was passiert mit gemeldeten Community-Beitraegen?

**Modul:** supplements · **angelegt:** 2026-08-29 · **Datei:** `todos/supplements-c-0341-was-passiert-mit-gemeldeten-community-beitraegen.md`

## Befund

**Aus E-28:** die Community wird nicht kuratiert, Nutzer schreiben.

`[read]` **Ohne Vorabpruefung braucht es einen Umgang mit dem, was
schiefgeht** — nicht Kuratierung, sondern das Uebliche: melden,
verbergen, sperren.

`[read]` **Und die inhaltliche Grenze aus E-28 muss durchsetzbar
sein:** Nebenwirkungen und Erfahrungen duerfen stehen,
**Dosierungsprotokolle nicht.** `[read]` **Wer entfernt einen Beitrag,
der ein Protokoll enthaelt, und wie faellt er auf?**

## Offen

`[read]` **Wer meldet, wer entscheidet, wie schnell.** `[read]` **Und
was mit dem Beitrag geschieht** — verborgen oder geloescht. **Bei
einem Gesundheitsprodukt ist das nicht dasselbe.**

## G-150 — Die Volltextsuche findet ueber Erklaertexte

**Modul:** supplements · **angelegt:** 2026-08-21 · **Datei:** `todos/supplements-g-0150-die-volltextsuche-findet-ueber-erklaertexte.md`

## Befund

(neu
  2026-08-21). Befund aus G-147. **Zu entscheiden, ob erwuenscht.**

  `[cmd]` **Die BCAA-Ursache war nicht der vermutete Zielwert:**
  *„„BCAA" stand woertlich in den `function_de`-Texten von Isoleucin und
  Valin, in keinem Leucin-Text — der Volltext-Zufall fand zwei."*

  `[cmd]` **Nachgemessen: `ILE` und `VAL` tragen *„BCAA"* im
  Erklaertext, `LEU` nicht.**

  `[read]` **Der Orchestrator hatte auf den Zielwert getippt** — Leucin
  ist der einzige der drei mit eigener Referenz. **Falsch geraten, der
  Agent hat gemessen.**

  ### Die Frage dahinter

  `[cmd]` **Die Suche durchsucht seit G-129 auch die 110
  Erklaertexte** — das war Absicht: *„wer „Skorbut" eingibt, sollte
  Vitamin C finden."*

  `[read]` **Aber sie findet dabei auch Zufallstreffer**, die kein Alias
  sind. **Seit G-147 ist der Alias sauber** — `bcaa` liefert drei.
  **Die Frage ist, ob der Volltexttreffer daneben stehen soll.**

  **Vorschlag:** Alias-Treffer und Texttreffer unterscheidbar zeigen.
  `[read]` **Wer *„Skorbut"* sucht, will den Texttreffer. Wer *„BCAA"*
  sucht, will die drei.**

## G-53 — `InjektionsKarte` in `packages/ui` hat keinen Aufrufer

**Modul:** supplements · **angelegt:** 2026-08-18 · **Datei:** `todos/supplements-g-0053-injektionskarte-in-packages-ui-hat-keinen-aufrufer.md`

## Befund

(neu 2026-08-18). Befund aus G-45.

  `[cmd]` **Gebaut und exportiert in G-26, von keinem Tab gerufen.** Die
  Supplements-Karte wurde nach Toms Entscheidung **im Modul** gebaut,
  weil die Vorlage sechs Felder je Ort fuehrt, die der Baustein nicht
  hat.

  `[read]` **Nicht loeschen, aber entscheiden:** entweder sie bekommt
  die fehlenden Felder und den Injections-Tab als Aufrufer, **oder sie
  faellt weg.** Ein Baustein ohne Aufrufer wird beim naechsten Mal ein
  zweites Mal gebaut — **das ist bereits passiert.**

## GO-24 — *„Mineralstoffe"* als Gruppenbegriff?

**Modul:** supplements · **angelegt:** 2026-08-20 · **Datei:** `todos/supplements-go-0024-mineralstoffe-als-gruppenbegriff.md`

## Befund

(neu
  2026-08-20). **Produktfrage aus C-165.**

  `[cmd]` **`Elektrolyte` trifft fuenf Codes, `Spurenelemente` acht.**
  **Und *„Mineralstoffe"*?**

  `[read]` **Es waere die ganze Gruppe *Elemente* (16 Codes)** —
  **oder nichts**, weil die Karte schon so heisst. **Zu entscheiden, ob
  ein Alias auf eine ganze Karte zeigen darf.**

---

## K — Kimi-Bestand: Abgleich und Vertiefung

`[cmd]` **Aufgenommen am 2026-08-22 (C-194).** Der Bestand liegt unter
`backup/kimi-research/Kimi_Agent/supplement_performance_database/`,
untracked, 346 MB. **Er kommt nicht ins Repo** — der Pre-Commit-Hook
sperrt Dateien ueber 10 MB.

`[read]` **Der Befund, der die Gruppe begruendet:** Wir haben die
Huelle importiert und den Inhalt liegenlassen. `[cmd]`
`supplements.substance_catalog` hat **31 Spalten**, Kimi liefert
**146 Felder** je Substanz — **130 davon haben keine Repo-Spalte.**

`[read]` **Reihenfolge:** Schema vor Import, Import vor Oberflaeche.
K-01 bis K-03 haengen aneinander. Alles mit *„Schema fehlt"* ist
Codex; nichts davon ist Oberflaechenarbeit, solange die Daten fehlen.

### Substanzen — die dichteste Luecke

## E-07 — Lücke weibliche Darstellungen entscheiden

**Modul:** training · **angelegt:** 2026-08-01 · **Datei:** `todos/training-e-0007-lucke-weibliche-darstellungen-entscheiden.md`

## Befund

— 186 von 1.448
  Übungen (13 %). Bewusster Verzicht oder Produktionsauftrag über 1.262 Übungen?
  *Gehört in die Produktentscheidung, nicht in eine Fussnote.*
  **`[cmd]` 2026-08-07 gegen die laufende Instanz bestätigt: genau 186.**
  Die Zahl stimmt, sie war keine Schätzung. Aufschlüsselung:
  `image_female_start` 186, `image_female_end` 186 — dieselben Übungen,
  beide Felder gefüllt oder beide leer. Zum Vergleich `image_male_start`
  1.370 (95 %), `video_url` 1.274 (88 %), ganz ohne Medien 39 (2,7 %).
  Die Entscheidung bleibt offen; die Datenlage ist jetzt belegt.

  **Regel entschieden 2026-08-07 (Tom): Ist der Nutzer weiblich, wird die
  weibliche Darstellung gezeigt; fehlt sie, die männliche.**
  Umsetzung wartet auf die Nutzerverwaltung — kein neuer Auftrag heute.

  `[cmd]` 2026-08-07 gegen den Live-Bestand geprüft: Die Regel ist heute
  **nicht umsetzbar** und in der vorliegenden Form **unvollständig**.
  Beides gehört vor die Umsetzung, nicht danach.

  1. **Es gibt kein Geschlecht.** `public.profiles` trägt genau drei Spalten
     (`id`, `created_at`, `updated_at`); `[cmd]` kein Treffer auf
     `gender`/`sex`/`geschlecht` in `apps/`, `packages/` oder
     `supabase/_pipeline/`. Die Bedingung hat keinen Wert, den sie lesen
     könnte. Das Feld gehört zum Onboarding und damit zur Nutzerverwaltung.
  2. **Der Rückfall muss in beide Richtungen gehen.** `[cmd]` Genau **eine**
     Übung trägt ausschliesslich eine weibliche Darstellung ohne männliche —
     dort bekäme ein männlicher Nutzer nichts.
  3. **Es gibt einen dritten und vierten Fall.** `[cmd]` 37 Übungen haben
     Medien, aber kein Bild (nur Video); 39 haben gar keine Medien.

  Vollständige Regel, wie sie umzusetzen wäre: gewünschtes Geschlecht
  vorhanden → nimm es; sonst anderes Geschlecht vorhanden → nimm das; sonst
  Video vorhanden → nimm das; sonst kein Medium, und die Oberfläche sagt es.

  **Zahlenkorrektur `[cmd]` 2026-08-07:** Die oben belegten 186 galten für
  1.448 Übungen. Nach der Dublettenzusammenführung (1.448 → 1.416) sind es
  **170** mit weiblicher Darstellung, 1.339 mit männlicher. Die alten Zahlen
  bleiben stehen, weil sie zum damaligen Bestand gehören.

## G-88 — Die Sitzungskarte auf `Today`

**Modul:** training · **angelegt:** 2026-08-19 · **Datei:** `todos/training-g-0088-die-sitzungskarte-auf-today.md`

## Befund

(neu 2026-08-19).
  **Entscheidung fuer Tom.** Rest aus G-86.

  `[cmd]` **Teilweise baubar:** `planned_sets`, `planned_reps`,
  `planned_weight_kg` stehen auf **60 von 60** — **aber `rir` und
  `is_pr` sind 0 von 101.** Zwei von fuenf Spalten fehlen.

  `[read]` **Der Agent hat sie ganz beim Entwurf gelassen statt halb
  gefuellt** — richtig. **Zu entscheiden:** drei von fuenf zeigen und
  zwei weglassen, oder warten, bis die Seeds `rir` und `is_pr`
  liefern?

  `[cmd]` **Die Spalten existieren** — `workout_sets` traegt `rpe`,
  `rir`, `set_type`, `rest_seconds`, `logged_via`. **Sie sind nur
  leer.**

---

# Niedrig

## G-230 — `nutrition.water/page.tsx` und `nutrition.shopping-lists/page.tsx` als separate Pages

**Modul:** nutrition · **angelegt:** 2026-08-28 · **Datei:** `todos/nutrition-g-0230-nutrition-water-page-tsx-und-nutrition-shopping-lists-page.md`

## Befund

**Aus `OPUS_REVIEW_NUTRITION_03_UI_FLOWS_READINESS.md`, MIN-1.**
`[read]` **Wortlaut der Review, nicht vom Orchestrator formuliert.**

`SPEC_10_COMPONENTS.md §Verzeichnisstruktur` listet zwei separate Pages neben der 5-Tab-Hauptseite. Wenn Shopping Lists schema-only V1 sind, ist eine eigene Page-Datei doppelte Struktur. Konsistenz mit V1-Status (siehe IMP-4) nicht klar.

## Stand

`[read]` **Die Review stammt aus der Spec-Phase und ist nicht gegen
den heutigen Stand geprueft.** `[cmd]` **Sie kennt die Entscheidungen
vom 27./28.08. nicht** — was sie fordert, kann inzwischen entschieden
oder erledigt sein.

## G-235 — `MicroDashboard` Tier-System (Tier 1/2/3) und Subscription-Gates ungeklärt

**Modul:** nutrition · **angelegt:** 2026-08-28 · **Datei:** `todos/nutrition-g-0235-microdashboard-tier-system-tier-1-2-3-und-subscription-gat.md`

## Befund

**Aus `OPUS_REVIEW_NUTRITION_03_UI_FLOWS_READINESS.md`, MIN-6.**
`[read]` **Wortlaut der Review, nicht vom Orchestrator formuliert.**

`SPEC_04 §Feature 10`:
> V1: Alle Tiers sind ohne Einschränkung sichtbar.
> Subscription-Gates werden erst implementiert wenn Monetarisierung steht.
> `show_micros_tier` Setting ist frei konfigurierbar.

`SPEC_10` MicroDashboard zeigt Tier-System ohne Gating-Hinweis. UI-Verhalten bei `show_micros_tier = 1`: nicht spezifiziert.

## Stand

`[read]` **Die Review stammt aus der Spec-Phase und ist nicht gegen
den heutigen Stand geprueft.** `[cmd]` **Sie kennt die Entscheidungen
vom 27./28.08. nicht** — was sie fordert, kann inzwischen entschieden
oder erledigt sein.

**Verwandter Punkt:** G-140 (`display_tier` ist ein Abo-Tier, keine Baumebene). `[read]` **Nicht zusammengelegt** — ob es
derselbe Befund ist, gehoert geprueft, nicht angenommen.

## G-238 — `Plan.source = 'buddy'` in SPEC_10 ohne UI-Trigger

**Modul:** nutrition · **angelegt:** 2026-08-28 · **Datei:** `todos/nutrition-g-0238-plan-source-buddy-in-spec-10-ohne-ui-trigger.md`

## Befund

**Aus `OPUS_REVIEW_NUTRITION_03_UI_FLOWS_READINESS.md`, MIN-9.**
`[read]` **Wortlaut der Review, nicht vom Orchestrator formuliert.**

`SPEC_10 §MealPlanComponents` listet `MealPlanList` mit "Source-Badge". Source-Werte: `user | coach | marketplace | buddy`. Decisions §1: "Buddy MealPlan Builder" ist Phase 2.

UI zeigt also einen Quellentyp, dessen Erzeugungs-Flow Phase 2 ist. Konsistent mit `MealPlanCard` (Anzeige), aber widersprüchlich für UX-Erwartung (User sieht Buddy-Plan-Quelle, kann sie aber nicht erzeugen).

---

## Stand

`[read]` **Die Review stammt aus der Spec-Phase und ist nicht gegen
den heutigen Stand geprueft.** `[cmd]` **Sie kennt die Entscheidungen
vom 27./28.08. nicht** — was sie fordert, kann inzwischen entschieden
oder erledigt sein.

**Verwandter Punkt:** G-98 (Meal plans braucht einen Zustand und eine Herkunft). `[read]` **Nicht zusammengelegt** — ob es
derselbe Befund ist, gehoert geprueft, nicht angenommen.

## G-255 — drei Attrappen-Konstanten ohne Aufrufer

**Modul:** supplements · **angelegt:** 2026-08-29 · **Datei:** `todos/supplements-g-0255-drei-attrappen-konstanten-ohne-aufrufer.md`

## Befund

Aus G-253, Claude Code, 2026-08-29.

`[cmd]` **`USER_STACKS`, `STACK_TEMPLATES` und `FREQUENCY_OPTIONS`
haben keinen Renderer mehr** — nur einen Test, der prueft, dass sie
nicht leer sind.

`[read]` **A-59 sagt loeschen.** `[read]` **Er hat sie stehen lassen,
weil das Stehenlassen in G-249 eine ausdrueckliche Entscheidung von
Tom war und kein Versehen.**

## Die Frage

`[read]` **In G-249 galt: erst belegen, dass alles Wichtige im neuen
Weg ankommt, dann loeschen.** `[cmd]` **Hier ist das belegt** — die
Attrappenzahl steht auf 0, die drei Karten lesen echte Daten.

`[read]` **Der Unterschied zu G-249:** dort steckte bestellte Arbeit
in den geloeschten Dateien. **Hier sind es Beispieldaten aus dem
Entwurf.**

`[read]` **Und der Grund gegen das Aufheben ist A-59:** Code ohne
Aufrufer wird beim naechsten Auftrag fuer gebaut gehalten. `[cmd]`
**Genau das ist am 28.08. dreimal passiert.**

## G-219 — `LiveWorkout` hat keinen Aufrufer mehr

**Modul:** training · **angelegt:** 2026-08-28 · **Datei:** `todos/training-g-0219-liveworkout-ohne-aufrufer.md`

## Befund

`[cmd]` Aus G-217: `LiveWorkout` steht in `ansicht.tsx:966`, **ohne
Aufrufer.** Das Formular aus G-217 hat ihn ersetzt.

`[read]` **Claude Code hat ihn absichtlich stehengelassen und es
gesagt** — er zeigt die Zielgestalt: Pausenuhr, PR-Marke,
Zielvorgabe. **Dinge, die das Formular nicht hat und die jemand
gedacht hat.**

## Die Entscheidung

`[read]` **Der G-163-Beschluss sagt: Rueckfallfassungen bleiben nicht
als Notfallanzeige stehen.** `[read]` **Aber das hier ist keine
Rueckfallfassung, sondern ein Entwurf** — und in G-189 hat sich
gezeigt, was passiert, wenn man einen toten Zweig ersatzlos entfernt,
der nebenbei etwas trug.

**Zwei Wege:**

**Entfernen** und die Zielgestalt als Punkt festhalten. `[read]`
Sauber, aber die Gestalt ist dann Text statt Code.

**Stehenlassen**, mit einem Kommentar, der sagt, dass er kein
Aufrufer hat und warum er bleibt. `[read]` **Dann muss der
Attrappenzaehler ihn kennen**, sonst faellt er beim naechsten Zaehlen
wieder auf.

`[read]` **Kein Fall fuer einen Agenten** — es ist eine Frage, wie
lange ein Entwurf im Code stehen darf.
