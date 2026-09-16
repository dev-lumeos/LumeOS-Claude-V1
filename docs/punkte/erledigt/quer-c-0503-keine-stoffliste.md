---
nr: C-503
typ: feature
modul: quer
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: C-498
entscheidung: null
agent: codex
beauftragt: 2026-09-08
erledigt: 2026-09-08
commit: f59e991f
beruehrt:
  tabellen: [public.allergen_aliases]
zahlen:
  gemessen: 2026-09-08
---

# C-503 - die Vorschlaege kommen aus den Katalogen

## Toms Befund und seine Loesung

Tom, 2026-09-08, beim Ansehen der Settings:

> wie wird der abgleich aus menschlicher eingabe gegen reale
> eintraege in der db gemacht, sprich der match auf unsere id?

`[cmd]` **Der Befund stimmt:** `stoff_code` **ist NULL-faehig,
`allergen_aliases` zeigt auf Codes, die nirgends definiert
sind.**

`[cmd]` **Beleg aus G-455:** `lactose` **hat 418 woertliche
Zutatzeilen und trifft null.**

### Und sein Loesungsweg

> user gibt ein, ob es um nahrung/supplement/medikament geht,
> dementsprechend wissen wir, welche produktkataloge SSOT sind.
> also koennen wir anhand der eingabe gezielt auf die richtigen
> punkte leiten

> produktkatalog sollte doch in allen modulen entweder direkt
> in den eintraegen allergien etc haben oder zumindest
> verlinkung zu einer allergie table, dann koennen wir auch
> laut eingabe matches fuer den user generieren, die er
> anwaehlen kann

`[read]` **Keine neue Stoffliste** ? **die KATALOGE sind die
Stoffliste.**

`[read]` **Mein erster Vorschlag war eine neue
`public.allergens`-Tabelle** ? **ohne zu messen, was die
Kataloge tragen. Toms Weg ist besser.**

## Was die drei Kataloge tragen, gemessen

**NAHRUNG** ? `[cmd]` **`nutrition.tag_definitions`, 14 Tags:**

    high_protein, low_carb, low_fat, high_fiber,
    whole_food, ultra_processed, vegan, vegetarian,
    contains_nuts, contains_gluten, contains_lactose,
    thai_food, halal, kosher

`[cmd]` **Spalten:** `code`, `name_de`, `name_en`, `name_th`,
`tag_type`, `is_exclusion_relevant`, `icon`, `filter_group`.

`[read]` **`is_exclusion_relevant` sagt schon, welcher Tag zum
Ausschliessen taugt.**

`[cmd]` **`food_tags`: 7.109 von 7.140 Lebensmitteln
getaggt.**

**SUPPLEMENT** ? `[cmd]` **`supplements.supplement_warnings`,
`supplement_interactions`, und `product_contents` selbst.**

`[cmd]` **Die haeufigsten Zutaten: `Magnesium Stearate`
56.903, `Sucralose` 11.674.**

**MEDIKAMENT** ? `[cmd]` **NICHTS.**

`[read]` **Eine Penicillin-Allergie kann heute nirgends gegen
etwas geprueft werden.**

## Was zu bauen ist

**1** ? **Eine Vorschlagsfunktion je Art.**

    vorschlaege(art, eingabe)

      art = nahrung
        -> tag_definitions WHERE is_exclusion_relevant
        -> plus die Tags, die auch getaggt SIND

      art = supplement
        -> product_contents, haeufigste ingredient_name
        -> plus supplement_warnings

      art = medikament
        -> MELDEN, dass nichts da ist

`[read]` **Ein Tag ohne getaggte Lebensmittel wird gar nicht
angeboten.**

`[cmd]` **Mit `pg_trgm`, wie `search_supplier_products`
(C-495)** ? `laktose`, `milchzucker`, `nuesse` **muessen
treffen.**

**2** ? **`allergen_aliases` wird die Bruecke.**

`[read]` **Heute zeigt `stoff_code` ins Leere** ? **er soll auf
den KATALOGEINTRAG zeigen.**

    stoff_code = "nutrition:contains_lactose"
    stoff_code = "supplements:magnesium_stearate"

`[read]` **MISS, ob ein Praefix taugt oder eine eigene Spalte
besser ist** ? **die Entscheidung begruenden.**

**3** ? **Die drei bestehenden Allergien anbinden.**

`[cmd]` **`dev@lumeos.app`: `lactose` (nahrung),
`magnesium_stearate` (supplement), `soja` (nahrung).**

`[read]` **Sie sollen danach treffen** ? **`lactose` gegen
`contains_lactose` (7.109 getaggte Lebensmittel).**

## Zwei Befunde, die dabei herauskommen

`[cmd]` **`nutrition.foods` hat KEINE Allergenspalte** ? **nur
`foods_custom.custom_allergens`.**

`[read]` **Die Tags haengen an `food_tags`, nicht am
Lebensmittel** ? **miss, ob die 31 ohne Tag wirklich keins
brauchen.**

`[cmd]` **Und `medical` hat nichts** ? **das ist ein eigener
Punkt, nicht dieser.**

`[read]` **MELDEN, nicht bauen.**

## Der Freitext bleibt

`[read]` **Wer etwas hat, das in keinem Katalog steht, traegt
es ein.**

`[cmd]` **`stoff_text` bleibt** ? **aber die Oberflaeche sagt,
dass es dann NICHT gegen Produkte prueft.**

`[read]` **Der Unterschied zwischen *,,ich habe es notiert"*
und *,,LumeOS schuetzt mich davor"*.**

## Abnahmebedingungen

    A1  je Art: welcher Katalog, wie viele Eintraege
        taugen als Vorschlag? TABELLE.
    A2  eine Vorschlagsfunktion, die "laktose",
        "milchzucker", "nuesse" trifft. Drei Belege.
    A3  ein Tag ohne getaggte Lebensmittel wird NICHT
        vorgeschlagen. Belegt.
    A4  allergen_aliases zeigt auf Katalogeintraege.
        Die Form begruendet.
    A5  die drei Allergien von dev treffen danach.
        Zahl je Allergie.
    A6  medikament: gemeldet, dass nichts da ist.
    A7  Gegenprobe: ein erfundener Code faellt auf.
    A8  Sicherung, Vollkette, ALLE Waechter.

## Was nicht zu tun ist

**KEINE neue Stoffliste** ? **die Kataloge sind sie.**

**KEINEN Alias raten** ? **C-502 hat die Grenze gezogen:
`Milk Protein Isolate` enthaelt Laktose, `Whey Protein
Isolate` weitgehend nicht.**

**`medical` NICHT bauen** ? **melden.**

**`apps/` nicht anfassen** ? **G-459 baut die Oberflaeche.**

## Bericht

### Umsetzung

- Neue strukturelle Migration: `20260916074600_c503_allergy_catalog_suggestions.sql`.
  Sie legt Trigramm-GIN-Indizes auf die normalisierte DSLD-Zutat und den
  Aliastext an, validiert kanonische Codes per Trigger und stellt
  `allergy_catalog_suggestions(art, eingabe, limit)` sowie
  `user_allergy_catalog_matches(user_id)` bereit.
- Neue Datenstufe: `503_allergy_catalog_data.sql`. Sie belegt nur drei
  nachweisbare Aliase fuer Laktose (darunter BLS `S116000`,
  `Milchzucker (Laktose)`), bindet die vorhandenen drei Magnesium-Stearat-
  Schreibweisen an den DSLD-Code und legt `contains_soy` nach der vorhandenen
  Nutrition-Spezifikation `(soja|tofu|tempeh)` an. Es wurde kein
  Supplement-Alias fuer Laktose oder Soja geraten.
- `stoff_text` bleibt absichtlich Freitext. Der Produktabgleich betrachtet
  ausschliesslich kanonische `stoff_code`-Werte; ohne solchen Code liefert er
  keinen Produkttreffer. Die Funktion liefert mit
  `product_check_available` die Anzeigegrundlage fuer die Oberflaeche.

| Art | SSOT fuer Vorschlaege | Taugliche Eintraege | Ergebnis |
| --- | --- | ---: | --- |
| nahrung | `nutrition.tag_definitions` + tatsaechlich vorhandene `food_tags` | 6 | gluten 622, lactose 1.021, nuts 120, soy 60, vegan 1.377, vegetarian 1.751 Lebensmittel |
| supplement | normalisierte `product_contents` + `supplement_warnings` | 85.828 Zutaten-Codes + 290 Warnungsnamen | Trigrammsuche; Zutaten und Warnungen werden gemeinsam gerankt |
| medikament | kein Katalog mit Allergie-Verknuepfung | 0 | sichtbare Lueckenmeldung, keine Medikamententreffer |

Die `food_tags`-Abdeckung bleibt bei 7.109 von 7.140 Lebensmitteln; 31
Lebensmittel haben keinen Tag. Sie sind nicht nachweisbar allergenfrei:
17 Namen wirken wie Teig-, Pasta- oder Backwaren. `foods_custom` hat zwar
`custom_allergens`, aber aktuell keine befuellte Zeile. Das ist eine
Katalogluecke, kein Grund, die 31 stillschweigend als sicher zu behandeln.

### Abnahme

| Bedingung | Messung / Beleg |
| --- | --- |
| A1 | Tabelle oben: 6 Nahrungsvorschlaege, 85.828 normalisierte DSLD-Zutaten-Codes plus 290 Warnungsnamen, Medikament 0. |
| A2 | `laktose` -> `nutrition:contains_lactose` (1.021); `milchzucker` -> derselbe Code (BLS-Nachweis); `nuesse` -> `nutrition:contains_nuts` (120). |
| A3 | Frischaufbau-Test fuegt transaktional einen exclusion-relevanten, aber ungetaggten Tag ein: Vorschlagzahl 0. |
| A4 | Praefix entschieden: `nutrition:` und `supplements:` sind selbstbeschreibend, benoetigen keine neue polymorphe Tabelle und verhindern kuenftige Namenskollisionen (heute 0 gemessene Kollisionen). `art` bleibt die Eingabeentscheidung; eine zweite Spalte wuerde Quelle und Validierung doppeln. Trigger pruefen den Zielkatalog bei jedem neuen/geaenderten Code. |
| A5 | `dev@lumeos.app` ist live umgebunden: `nutrition:contains_lactose` 1.021 Food-Treffer, `nutrition:contains_soy` 60 Food-Treffer, `supplements:magnesium_stearate` 56.948 Produktinhalts-Treffer. |
| A6 | `medikament` liefert: „Kein Medikamentenkatalog mit Allergie-Verknuepfung vorhanden; Freitext wird nicht gegen Medikamente geprueft.“ Gemessen: nur `medication_active_substances.contraindications` als unverbundenes JSONB-Feld, kein Produktkatalog. |
| A7 | `nutrition:does_not_exist` wird durch die Katalogvalidierung abgelehnt (`false`). |
| Rechte | `anon` hat auf Vorschlaege, neuen Katalogabgleich und bestehenden Produktabgleich kein Execute; `authenticated` hat Execute. Der Trigramm-Plan nutzt `product_contents_ingredient_name_fold_trgm_idx`. |
| A8 | Sicherung `backup/schema/20260916074500_c503_vorher.sql`; Vollkette nach `c503_final` gruen (870,1 s); C-503-Frischaufbau 4/4, C-498–C-500-Regression 4/4. Alle Waechter gelaufen: Turbo typecheck/test/build 18/18 gruen. Rot bleiben fremd: G-444, drei ueberholte Abwesenheitsbehauptungen; Web-Lint `React.useId` bedingt in `apps/web/src/app/v2/nutrition/insights-kacheln.tsx`; Testdatenwaechter mit den bekannten 15 aelteren Abweichungen. `migration-datenlogik-pruefen` ist gruen (44/44). |

Keine App-Datei, kein Dev-Server und kein Commit.

## Abnahme

**2026-09-08, Orchestrator. Nachgemessen, LIVE.**

`[cmd]` **Selbst getestet, `allergy_catalog_suggestions`:**

    "laktose"      nutrition:contains_lactose   1.021
    "milchzucker"  nutrition:contains_lactose   1.021
    "nuesse"       nutrition:contains_nuts        120
    "qzvwxjplk"    0 Treffer

`[read]` **Und die Herkunft steht in der Antwort:**
`nutrition.tag_definitions`.

### Die Codes sind umgestellt

`[cmd]` **`dev@lumeos.app`:**

    nutrition:contains_lactose      (nahrung)
    nutrition:contains_soy          (nahrung)
    supplements:magnesium_stearate  (supplement)

`[read]` **Vorher standen dort `lactose`, `soja`,
`magnesium_stearate`** ? **Codes, die auf nichts zeigten.**

`[cmd]` **Treffer: Laktose 1.021, Soja 60, Magnesium-Stearat
56.948.**

`[read]` **Aus G-455:** *,,`lactose` trifft null"* ? **jetzt
1.021.**

### Toms Weg hat getragen

`[cmd]` **Nahrung: 6 Tags. Supplements: 85.828 Zutaten-Codes
plus 290 Warnungsnamen. Medikament: meldet die Kataloglueke.**

`[read]` **Keine neue Stoffliste** ? **die Kataloge sind sie.**

`[read]` **Und Nahrung liefert SECHS Tags, nicht vierzehn** ?
**nur die mit `is_exclusion_relevant` UND getaggten
Lebensmitteln.**

`[cmd]` **Genau die Auflage:** *,,ein Tag ohne getaggte
Lebensmittel wird NICHT vorgeschlagen."*

### Die Praefixe werden validiert

`[cmd]` **Vier Waechterfunktionen:**
`validate_user_allergy_catalog_code`,
`validate_allergen_alias_catalog_code`,
`allergy_catalog_code_is_valid`,
`user_allergy_catalog_matches`.

> *,,Erfundene Codes werden abgewiesen."*

`[read]` **Die Bruecke ist nicht nur gebaut, sie ist
bewacht.**

### Mein Fehler beim Pruefen

`[cmd]` **Ich habe `allergen_vorschlaege` gerufen** ? **die
Funktion heisst `allergy_catalog_suggestions`.**

`[read]` **Zwoelfter geratener Name heute.**

**Abgenommen.**


