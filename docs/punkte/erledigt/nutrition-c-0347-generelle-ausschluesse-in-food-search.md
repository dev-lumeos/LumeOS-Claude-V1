---
nr: C-347
typ: entscheidung
modul: nutrition
schwere: hoch
angelegt: 2026-08-29
braucht: []
kind_von: G-116
entscheidung: E-30
agent: codex
beauftragt: 2026-08-29
erledigt: 2026-08-29
commit: 53670f2b
beruehrt:
  dateien:
    - supabase/_pipeline/07_lesefunktionen/075_preference_search_application.sql
zahlen:
  gemessen: 2026-08-29
  schokolade_vorher: 162
  schokolade_nachher: 0
  ultra_processed: 162
  contains_nuts: 10
---

# C-347 - generelle Ausschluesse in \`food_search\`

## Befund

Aus G-116, Claude Code, 2026-08-29: \`schokolade\` liefert ohne
Vorlieben 162 Treffer, mit Profil 0; \`cola\` 243 -> 42 und \`wurst\`
206 -> 42. Alle 162 Schokoladen tragen \`ultra_processed\`, nur 10
\`contains_nuts\`. Die Treffer existieren und werden bewertet, werden
aber durch einen generellen Ausschluss nicht angezeigt.

Starke Filter haben bereits die andere Semantik: Sie filtern ohne
Suchbegriff und ranken bei ausdruecklicher Suche ab. Generelle
Ausschluesse sind noch hart.

## Entscheidung und Auftrag

E-30 gilt: Wer ausdruecklich sucht, bekommt Treffer; ausgeschlossene
kommen zuletzt statt gar nicht. Das ist eine Reihenfolge, keine
Filterregel.

    schwarze Schokolade ausgeschlossen, Suche "schokolade"
      -> Vollmilch, weisse, Nuss zuerst - schwarze zuletzt

    ultra_processed ausgeschlossen, Suche "schokolade"
      -> alle Treffer tragen es; "alle anderen" ist leer

Generelle Ausschluesse erhalten deshalb dieselbe Stufe wie starke
Filter: ohne Suchbegriff wirken sie, mit Suchbegriff ranken sie ab.
Die Rangfolge muss die Ausschlusstiefe abbilden, nicht bloss
\`ausgeschlossen\` ja/nein.

Allergien sind kein genereller Ausschluss und bleiben unveraendert.
\`is_exclusion_relevant\` enthaelt \`contains_gluten\`,
\`contains_lactose\`, \`contains_nuts\`, \`vegan\` und
\`vegetarian\`. Keine Tags oder Vorlieben aendern. \`apps/\` nicht
anfassen, nicht committen, nicht stagen, nicht pushen.

## Bericht

### Ergebnis

\`[cmd]\` Erledigt in
\`supabase/_pipeline/07_lesefunktionen/075_preference_search_application.sql\`.
\`profile_general_exclusion\` ist bei einer nichtleeren Suche nicht mehr
hart. Ohne Suchbegriff bleibt er ein Ausschluss. Das betrifft nur diese
Quelle; harte Preference-Items, Diaetregeln und Allergien bleiben hart.

Die abgeleitete Tabelle trug vorher fuer alle generellen Ausschluesse
denselben \`source\`-Wert. Sie speichert nun
\`profile_general_exclusion:<code>\`, etwa
\`profile_general_exclusion:ultra_processed\`. Damit zaehlt
\`food_search\` die Ausschlusstiefe je Lebensmittel. Bei
\`sort = relevance\` kommt diese Tiefe vor der Textrelevanz: Tiefe 0 vor
1 vor 2. Innerhalb derselben Tiefe bleibt die vorhandene
Textrelevanzordnung unveraendert. Bestehende Profile werden beim
Einspielen des Blocks einmal in die materialisierte Suchwirkung
uebernommen; die Vorlieben selbst wurden nicht veraendert.

### Messung

\`[cmd]\` Vorher/Nachher auf zwei gleichartigen Wegwerf-Datenbanken,
gleicher Seed, je fuenf \`EXPLAIN (ANALYZE, TIMING OFF)\`-Laeufe,
Median in ms. Das vollstaendige Seed-Profil hat neben
\`ultra_processed\` die Allergie \`tree_nuts\`; die zehn
\`contains_nuts\`-Schokoladen bleiben deshalb bewusst verborgen.

| Suche | vorher | nachher | Laufzeit vorher -> nachher |
| --- | ---: | ---: | ---: |
| \`schokolade\` | 0 | 152 | 299.747 -> 311.081 ms |
| \`cola\` | 42 | 230 | 297.418 -> 315.292 ms |
| \`wurst\` | 42 | 206 | 296.499 -> 309.891 ms |

\`[cmd]\` Ohne Suchbegriff bleibt der Ausschluss wirksam: \`5292 ->
5292\` Treffer fuer das Seed-Profil.

\`[cmd]\` Gegenprobe des E-30-Falls mit einem Profil, das nur
\`ultra_processed\` und \`contains_nuts\` generell ausschliesst, ohne
Allergie: \`schokolade\` liefert \`162/162\`. Auf Seite 1 stehen 100
Treffer der Tiefe 1; ab Offset 150 folgen zwei weitere der Tiefe 1 und
dann die zehn Nuss-Treffer der Tiefe 2. Damit ist die Rangfolge nicht
das fruehere boolesche \`ausgeschlossen\`, sondern die Zahl der
getroffenen generellen Ausschluesse. Weil alle 162
\`ultra_processed\` tragen, gibt es in diesem Fall keine unbelastete
Gruppe; die bestehende Textrelevanz entscheidet innerhalb der Tiefe und
die Suche bleibt trotzdem vollstaendig.

\`[cmd]\` Allergie-Gegenprobe: \`tree_nuts\` wird in \`allergy_tag_map\`
auf \`contains_nuts\` abgebildet und mit Quelle \`profile_allergy\` als
\`hard\` materialisiert. Die neue Ausnahme prueft ausschliesslich
\`profile_general_exclusion\`; daher bleiben 10 der 162 Schokoladen mit
Nussallergie ausgeschlossen (152 sichtbar). Keine Tags wurden
veraendert.

\`[cmd]\` Ein Profil ohne Ausschluesse liefert fuer \`schokolade\`
dieselbe Liste (IDs und Reihenfolge) wie derselbe Aufruf ohne
\`p_user_id\`.

### Pruefung

\`[cmd]\` Neu:
\`supabase/_pipeline/_validierung/food-search-general-exclusions.test.ts\`.
Der Test richtet die Profile nur innerhalb einer Transaktion ein und
rollt sie zurueck. Rot vor der Aenderung: \`0 !== 162\`. Gruen danach:
\`1/1\` Tests bestanden. Er prueft den 162er-Fall, Tiefe 1 vor 2, den
leeren Suchbegriff, die unveraenderte Allergie und die
Null-Praeferenz-Gegenprobe.

\`[cmd]\` Das SQL wurde mit \`ON_ERROR_STOP=1\` in
\`lumeos_c276_probe\` eingespielt; \`git diff --check\` ist fehlerfrei.
\`apps/\` blieb unberuehrt. Nichts gestaged, committed oder gepusht.

## Abnahme

**2026-08-29, Orchestrator.**

`[cmd]` **`schokolade` 0 → 152 im vollstaendigen Seed-Profil.**
`[cmd]` **Die fehlenden 10 bleiben wegen `tree_nuts` verborgen** —
**Allergien bleiben hart, genau wie E-30 es verlangt.**

`[cmd]` **Ohne Allergie liefert der generelle Ausschlussfall 162 von
162.** `[read]` **Damit ist der Fall belegt, der die Regel erklaert:**
wenn alle Treffer den Ausschluss tragen, ist *,,alle anderen"* leer —
und trotzdem kommt jetzt etwas.

`[cmd]` **Tiefe 1 steht vor Tiefe 2, bei gleichem Ausschluss bleibt
die Textrelevanz erhalten.** `[read]` **Das ist die Rangfolge, die
Tom beschrieben hat** — nicht *ausgeschlossen ja/nein*, sondern wie
tief.

`[cmd]` **Neuer Transaktionstest** unter
`supabase/_pipeline/_validierung/`.

**Abgenommen.**

