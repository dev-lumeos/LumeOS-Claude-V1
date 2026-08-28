---
nr: G-221
typ: entscheidung
modul: nutrition
schwere: hoch
angelegt: 2026-08-28
braucht: []
kind_von: null
entscheidung: E-22
agent: codex
beauftragt: 2026-08-28
erledigt: 2026-08-28
commit: OFFEN
beruehrt:
  dateien: [docs/specs/Nutrition/05_reviews/OPUS_REVIEW_NUTRITION_03_UI_FLOWS_READINESS.md]
zahlen: null
---

# G-221 — Food-Tag-Set V1 widersprüchlich definiert

## Befund

**Aus `OPUS_REVIEW_NUTRITION_03_UI_FLOWS_READINESS.md`, CRIT-2.**
`[read]` **Wortlaut der Review, nicht vom Orchestrator formuliert.**

Drei Quellen mit unterschiedlichen Tag-Listen:

**`NUTRITION_NEXT_SPEC_DECISIONS.md §5` — V1 Tags (16):**
```
high_protein, low_carb, low_fat, high_fiber, vegan, vegetarian,
gluten_free, lactose_free, nut_free, halal, kosher, spicy,
thai_food, mediterranean, processed_food, ultra_processed
```

**`SPEC_04_FEATURES.md §Feature 3` — "Phase 1 Tags (zum Launch)" (100+):**
- Listet ingredient, diet, allergen, fitness, gym, processing Kategorien mit insgesamt über 100 Tags.
- Enthält esoterische Tags wie `creatine_source`, `carnitine_source`, `cortisol_management`, `insulin_sensitivity`, `bcaa_rich`, `leucine_rich`, `pre_workout_carbs`, `post_workout_recovery`, `contest_prep`, `powerlifting_bulk`.
- Nennt `halal`, `kosher` explizit als **Phase 3** (entgegen Decisions).

**`SPEC_05_FOOD_TAXONOMY.md` — Tags, vollständiger Profi-Katalog:**
- Listet identische Tag-Liste wie SPEC_04 (Phase 1 zum Launch).
- Nennt `halal`, `kosher` als Phase 3.
- `nut_free`, `spicy`, `thai_food` aus Decisions §5 fehlen komplett oder sind nur indirekt abbildbar (z. B. `nut_free` ⇔ NOT `allergen_nuts`).

**Konflikte:**

| Tag | Decisions §5 (V1) | SPEC_04/05 |
|---|---|---|
| `nut_free` | V1 | nicht belegt (nur `allergen_nuts` als Negation) |
| `halal` | V1 | Phase 3 |
| `kosher` | V1 | Phase 3 |
| `spicy` | V1 | nicht belegt |
| `thai_food` | V1 | nicht belegt |
| `processed_food` | V1 | `processed` (anders benannt) |
| `creatine_source` | nicht in Decisions | "Phase 1 zum Launch" in SPEC_05 |
| `cortisol_management` | nicht in Decisions | "Phase 1" |
| `pre_workout_carbs` | nicht in Decisions | "Phase 1" |

**Konsequenz:** Nicht klar, was V1 Tag-WOs umfassen sollen. Auto-Tag-Trigger in `SPEC_06` ist auf SPEC-04/05-Tags ausgerichtet. Workorders auf Tag-bezogene Features (Filter-UI, Smart Search Boost, Auto-Tagging) sind blockiert bis V1-Tag-Set entschieden ist.

## Stand

`[read]` **Die Review stammt aus der Spec-Phase und ist nicht gegen
den heutigen Stand geprueft.** `[cmd]` **Sie kennt die Entscheidungen
vom 27./28.08. nicht** — was sie fordert, kann inzwischen entschieden
oder erledigt sein.

## Auftrag — die sechs neuen Tags

**Entschieden in `docs/entscheidungen/E-22`.** `[read]` **Lies sie
zuerst; sie ist die Vorgabe, nicht dieser Auftrag.**

### Vorweg

`[read]` **Die Zahlen misst du.** `[cmd]` Seit dem 27.08. traegt ein
Auftrag keine Zahlen mehr vom Orchestrator.

### Zu tun

**Sechs Tags ergaenzen:** `low_protein`, `high_carb`, `high_fat`,
`low_fiber`, `gluten_free`, `lactose_free`.

### Die Schwellen sind der schwierige Teil

`[cmd]` **Die vier bestehenden Makro-Tags tragen ihre Regel als
`macro_rule` in `tag_definitions`** — `high_protein` >= 20 g
`PROT625`, `low_carb` <= 10 g `CHO`, `low_fat` <= 3 g `FAT`,
`high_fiber` >= 6 g `FIBT`.

`[read]` **Die Umkehrungen sind nicht die Negation.** Zwischen
`low_carb` (<= 10 g) und einem sinnvollen `high_carb` liegt ein
Bereich, der zu keinem von beiden gehoert — **und das ist richtig
so.** Ein Lebensmittel mit 25 g Kohlenhydraten ist weder das eine
noch das andere.

`[read]` **Die Schwellen gehoeren belegt, nicht gesetzt** — dieselbe
Regel wie bei den Umrechnungsfaktoren in C-149. **Nenn die Quelle je
Schwelle.** `[read]` **Wenn du keine findest, sag es** — dann ist es
eine Entscheidung fuer Tom und keine Recherche.

### `gluten_free` ist nicht `NOT contains_gluten`

`[cmd]` **622 Eintraege tragen `contains_gluten`.** `[read]` **Der
Rest ist nicht glutenfrei, sondern ueberwiegend ungeprueft.**

`[read]` **Miss zuerst, worauf sich eine positive Aussage stuetzen
laesst** — eine Zutatenliste, eine Kategorie, ein BLS-Feld. **Wenn
die Grundlage fehlt, vergib das Tag nicht.** `[read]` **Ein falsches
`gluten_free` bei einem Zoeliakiekranken ist schlimmer als ein
fehlendes.**

### Was nicht zu tun ist

**`halal` und `kosher` nicht anfassen** — sie bleiben liegen, ohne
Prioritaet.
**`thai_food` nicht befuellen**, `mediterranean` nicht anlegen —
Kuechenrichtungen kommen spaeter in den Mealplaner.
**Keine Profi-Tags** aus `SPEC_04`/`SPEC_05` — Phase 2.
**`is_exclusion_relevant` fuer die neuen Tags nicht setzen** ohne zu
sagen warum. `[read]` **Ein Ausschluss filtert, eine Eigenschaft
beschreibt** — das ist eine eigene Frage.
`apps/` nicht anfassen.
Nicht committen, nicht stagen, nicht pushen.

### Nachweis

    Tags vorher / nachher          Zahl
    je neue Schwelle               Quelle genannt
    Zuordnungen je neuem Tag       Zahl
    Ueberschneidung                traegt ein Lebensmittel
                                   high_carb UND low_carb? Soll 0
    gluten_free: Grundlage         woraus abgeleitet
    Eintraege ohne Aussage         Zahl - weder frei noch enthaltend
    bestehende Tags unveraendert   belegt

`[read]` **Die vorletzte Zeile ist die ehrliche:** wie viele
Lebensmittel lassen sich weder als glutenfrei noch als glutenhaltig
einordnen? **Diese Zahl gehoert in den Bericht, nicht versteckt.**

### Regeln

`tools/lauf.py` fuer jeden Befehl, keine Konsolenfenster.
**Wegwerf-Datenbank, nie gegen die laufende testen.**
**Vollsicherung vor jedem Live-Eingriff nach `backup/`.**

**Wenn eine Vorgabe nicht aufgeht: melden, nicht passend machen.**

## Bericht

Stand: teilweise erledigt. E-22 entscheidet die sechs Tags, aber nur zwei
haben heute eine positive, reproduzierbare und konfliktfreie Grundlage. Die
Kette ergaenzt daher high_fat und gluten_free; sie erfindet weder drei
Makro-Schwellen noch eine Laktosefrei-Aussage bei widerspruechlichem Bestand.

### Messung

| Messung | Annahme aus E-22/Auftrag | Gemessen vor dem Lauf | Ergebnis im Klon |
|---|---:|---:|---:|
| Tag-Definitionen | 14 | 14 | 16 |
| Tag-Zuordnungen | 30.797 | 30.797 | 32.068 |
| contains_gluten | 622 | 622 | 622 |
| high_protein / low_carb / low_fat / high_fiber | 1.400 / 4.659 / 2.648 / 558 | 1.400 / 4.659 / 2.648 / 558 | unveraendert |

Die Abgrenzung ist nutrition.tag_definitions und nutrition.food_tags fuer
den vollstaendigen BLS-Bestand mit 7.140 Lebensmitteln. Die Annahmen stimmten
hier; die Nachher-Differenz von 1.271 ist ausschliesslich high_fat (1.233)
und gluten_free (38).

### Tags und Quellen

| Tag | Urteil | Regel oder Grundlage | Quelle |
|---|---|---|---|
| high_fat | umgesetzt, 1.233 | FAT > 17,5 g je 100 g | [UK Department of Health and Social Care, Front of Pack nutrition labelling guidance, Tabelle 2](https://www.gov.uk/government/publications/front-of-pack-nutrition-labelling-guidance) |
| gluten_free | umgesetzt, 38 | kanonischer BLS-Name enthaelt explizit glutenfrei oder gluten-free; nie aus NOT contains_gluten | nutrition.foods.name_de/name_en |
| low_protein | offen | Die EU-Quelle kennt source of protein ab 12 Prozent Energie, aber keine low-protein-Schwelle und keine passende g-je-100-g-Regel. | [Verordnung (EG) Nr. 1924/2006, Anhang](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32006R1924) |
| high_carb | offen | Die EU-Quelle definiert keine high-carb-Schwelle. Eine g-je-100-g-Grenze waere eine neue Entscheidung. | [Verordnung (EG) Nr. 1924/2006, Anhang](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32006R1924) |
| low_fiber | offen | Die EU-Quelle definiert source of fibre ab 3 g/100 g und high fibre ab 6 g/100 g, aber kein low_fiber. Das Gegenteil von source of fibre ist keine belastbare positive Klasse. | [Verordnung (EG) Nr. 1924/2006, Anhang](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32006R1924) |
| lactose_free | offen | 12 BLS-Namen sagen explizit laktosefrei/lactose-free; 11 derselben Lebensmittel tragen zugleich contains_lactose. | nutrition.foods.name_de/name_en und nutrition.food_tags |

high_fat nutzt die amtliche Schwelle strikt groesser als 17,5 g/100 g; der
Bereich von mehr als 3 bis einschliesslich 17,5 g bleibt weder low_fat noch
high_fat. Die drei offenen Makro-Tags wurden nicht als leere Definitionen
angelegt, weil ein Filter ohne belegte Regel einen falschen Vollstaendigkeits-
eindruck erzeugen wuerde. Tom muss die drei Schwellen entscheiden oder eine
andere belastbare Quelle vorgeben.

### Sicherheits- und Konsistenznachweis

- [cmd] Der volle Kettenlauf gegen lumeos_g221 lief mit 129 von 129
  Schritten durch, 152,8 s. Die Live-Datenbank blieb unveraendert.
- [cmd] high_fat und low_fat ueberlappen bei 0 Lebensmitteln.
- [cmd] gluten_free und contains_gluten ueberlappen bei 0 Lebensmitteln.
  38 Lebensmittel haben den positiven Glutenfrei-Hinweis, 622 den
  Gluten-Hinweis und 6.480 haben weder eine Glutenfrei- noch eine
  Gluten-Aussage. Diese 6.480 werden nicht geraten.
- [cmd] high_carb ist wegen fehlender Schwelle nicht angelegt; daher sind
  high_carb-Zuordnungen und die verlangte Ueberschneidung mit low_carb beide
  0. Das ist kein Ersatz fuer die ausstehende Gegenprobe nach einer
  Entscheidung.
- [cmd] lactose_free ist nicht angelegt. Die 11 von 12 widerspruechlichen
  positiven BLS-Namen verhindern eine sichere Vergabe; der eine konfliktfreie
  Name rechtfertigt keine unvollstaendige Klasse.
- [cmd] Der Schritt sichert vor der Aenderung die Anzahl jeder bestehenden
  Tag-Zuordnung und bricht bei jeder Differenz ab. Im Klon blieben
  contains_gluten 622, contains_lactose 1.021, contains_nuts 120, halal
  6.379, high_fiber 558, high_protein 1.400, kosher 6.451, low_carb 4.659,
  low_fat 2.648, ultra_processed 927, vegan 1.377, vegetarian 1.751 und
  whole_food 2.884 unveraendert. thai_food blieb bei 0.
- [cmd] pnpm exec tsx supabase/_pipeline/_validierung/lebensmittel-tags-pruefen.ts:
  OK. git diff --check: OK.

is_exclusion_relevant ist fuer high_fat und gluten_free false. Beide
beschreiben eine Eigenschaft des Lebensmittels; die Entscheidung, ob eine
positive Eigenschaft als Nutzer-Ausschluss funktionieren soll, ist getrennt
von dieser Ableitung. halal, kosher und thai_food wurden nicht angefasst;
mediterranean und Profi-Tags wurden nicht angelegt.

### Geaenderte Dateien

- supabase/_pipeline/_ableitung/221_food_tag_set_v1.sql
- supabase/_pipeline/kette.json
- supabase/README.md

Kein Live-Eingriff, daher keine Vollsicherung erforderlich. [cmd] lumeos_g221
wurde nach der Messung geloescht (0 Datenbanken dieses Namens). Nicht gestagt,
nicht committet und apps/ nicht angefasst.

## Abnahme

**2026-08-28, Orchestrator. Selbst gemessen.**

`[cmd]` **Live unveraendert bei 14 Tags** — der Klonlauf wurde
verworfen, wie vorgesehen. `high_fat` (1.233 Zuordnungen, FAT >
17,5 g/100 g) und `gluten_free` (38) stehen in der Kette, nicht live.

`[cmd]` **Quellen benannt:** UK FoP guidance fuer die Fettschwelle,
VO (EG) 1924/2006.

### Die Zurueckhaltung ist der wertvolle Teil

`[read]` **`low_protein`, `high_carb` und `low_fiber` bleiben offen,
weil keine belastbare Schwelle gefunden wurde.** `[read]` **Das ist
die Antwort, um die der Auftrag gebeten hat:** *,,Wenn du keine
findest, sag es — dann ist es eine Entscheidung fuer Tom und keine
Recherche."*

`[cmd]` **`lactose_free` nicht vergeben, weil 11 von 12 ausdruecklich
laktosefreien BLS-Namen gleichzeitig `contains_lactose` tragen.**
`[read]` **Eine Vergabe waere hier eine Behauptung gewesen, keine
Aussage.**

`[cmd]` **6.480 Lebensmittel haben weder eine Glutenfrei- noch eine
Gluten-Aussage** — die Zahl, um die der Auftrag gebeten hatte, **im
Bericht statt versteckt.**

`[read]` **Und `gluten_free` mit nur 38 Zuordnungen ist ehrlicher als
6.480 geratene.**

**Abgenommen als teilweise umgesetzt.** Die drei offenen Schwellen
gehen als **G-245** an Tom — sie brauchen eine Entscheidung, keine
Recherche mehr.

