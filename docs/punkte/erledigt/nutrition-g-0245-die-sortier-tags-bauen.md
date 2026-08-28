---
nr: G-245
typ: feature
modul: nutrition
schwere: mittel
angelegt: 2026-08-28
braucht: []
kind_von: G-221
entscheidung: E-23
agent: codex
beauftragt: 2026-08-28
erledigt: 2026-08-28
commit: 28f311cd
beruehrt:
  tabellen: [nutrition.tag_definitions]
zahlen:
  gemessen: 2026-08-28
  gebaute_tags: 14
---

# G-245 — die Sortier-Tags bauen

## Befund

`[cmd]` Fuer `low_protein`, `high_carb` und `low_fiber` fand Codex in
G-221 **keine belastbare Schwelle** — und daraus wurde eine Frage nach
Grenzwerten, die falsch gestellt war.

## Entschieden: E-23

Tom, 2026-08-28: *,,der suchfilter filtert schon grob, dann fuehrt
dieser tag die sortierung der resultate aus sprich oben sort high to
low for highcarb"*.

**Sie brauchen keine Schwelle. Sie sind eine Sortierrichtung.**

    Filter    grob, ueber Suche und vorhandene Filter
    Tag       sortiert das Ergebnis - obenauf, nicht anstelle

**Acht Achsen** (Tom, 2026-08-28): Kalorien, Protein, Kohlenhydrate
und Fett, je hoch und niedrig.

`[read]` **Kalorien sind neu**, es gibt keinen Kalorien-Tag.
`[read]` **Ballaststoffe sind nicht dabei** — `low_fiber` war meine
Annahme, nicht Toms Liste.

`[read]` **Nicht global:** wer *vegan* filtert und nach Protein
absteigend sortiert, bekommt **vegane Lebensmittel nach Protein
geordnet** — nicht alle proteinreichen.

`[read]` **Die vier bestehenden Tags sind Auslobungen** — *,,fettarm"*
und *,,ballaststoffreich"* sind rechtlich definiert, deshalb tragen
sie einen Grenzwert. **`high_carb` ist keine Auslobung; es gibt keine
Quelle, weil es die Frage nicht gibt.**

## Die Sortierung existiert bereits

`[cmd]` **`nutrition.food_search` traegt `p_sort text` und kennt
vier Werte:**

    relevance · protein_desc · kcal_asc · name_asc

`[read]` **Zwei Achteln der Liste sind damit gebaut** —
`protein_desc` ist *Protein hoch*, `kcal_asc` ist *Kalorien niedrig*.
**Und die Benennung ist bereits die richtige Form:**
`<naehrstoff>_<richtung>`, keine Tags, kein Grenzwert.

`[cmd]` **Es fehlen sechs:** `protein_asc`, `kcal_desc`,
`carbs_desc`, `carbs_asc`, `fat_desc`, `fat_asc`.

`[cmd]` **Und der Rueckfall ist still:**

    CASE WHEN p_sort IN ('relevance','protein_desc','kcal_asc',
                         'name_asc')
         THEN p_sort ELSE 'relevance' END

`[read]` **Wer `carbs_desc` schickt, bekommt Relevanz und merkt es
nicht** — dieselbe Klasse wie `unsupported_operator` vor C-313b.

## Was zu bauen ist

**Die Sortierung, nicht die Zuordnung.** `[read]` **Ein Sortier-Tag
erzeugt keine Zeilen in `food_tags`** — es ist eine Abfrageoption.

`[cmd]` **`tag_definitions.macro_rule` traegt heute `{op, value,
nutrient_code}`.** `[read]` **Ein Sortier-Tag braucht Naehrstoff und
Richtung, keinen Wert** — oder er gehoert nicht in
`tag_definitions`, sondern in die Suche. **Das ist die
Bauentscheidung, und sie gehoert gemessen, nicht geraten:** wie
sortiert `food_search` heute?

`[read]` **Und die Gegenprobe ist einfach:** bei `high_carb` muss die
erste Zeile mehr Kohlenhydrate haben als die letzte. **Wenn nicht,
sortiert etwas anderes.**

## Unberuehrt

**Die fuenf Filter-Tags bleiben, wie sie sind** — `high_protein`,
`low_carb`, `low_fat`, `high_fiber`, `high_fat`.

## Auftrag

### Vorweg

`[read]` **Die Zahlen misst du.** `[cmd]` Seit dem 27.08. traegt ein
Auftrag keine Zahlen mehr vom Orchestrator.

### Zu tun

**Sechs Sortierwerte ergaenzen:** `protein_asc`, `kcal_desc`,
`carbs_desc`, `carbs_asc`, `fat_desc`, `fat_asc`.

**Und den stillen Rueckfall sichtbar machen.** `[read]` **Wie, ist
deine Entscheidung** — werfen, melden, oder im Ergebnis kennzeichnen.
`[cmd]` **Das Muster steht in C-313b:** ein unbekannter Wert soll
nicht stillschweigend zu etwas anderem werden.

### Was nicht zu tun ist

**Keine Tags anlegen.** `[read]` **Ein Sortierwert erzeugt keine
Zeilen in `food_tags`** — die fuenf Filter-Tags (`high_protein`,
`low_carb`, `low_fat`, `high_fiber`, `high_fat`) bleiben unberuehrt.

**Keine Ballaststoff-Sortierung.** `[cmd]` Toms Liste nennt Kalorien,
Protein, Kohlenhydrate und Fett — **`low_fiber` war meine Annahme.**

**Die Sortierung ersetzt keinen Filter.** `[read]` Sie ordnet, was
Suche und Filter uebrig lassen — **nie den ganzen Katalog anstelle
einer Suche.**

`apps/` nicht anfassen.
Nicht committen, nicht stagen, nicht pushen.

### Nachweis

    Sortierwerte vorher / nachher   4 / 10
    je Wert: erste gegen letzte     bei `carbs_desc` muss die erste
      Zeile                         Zeile mehr Kohlenhydrate haben
    mit Filter kombiniert           z. B. `vegan` + `protein_desc`:
                                    nur vegane Treffer, nach Protein
    unbekannter Wert                nicht mehr still - belegt
    Laufzeit                        ms vorher / nachher, je Wert
    bestehende vier                 unveraendert - belegt

`[read]` **Die zweite Zeile ist die eigentliche Probe, und sie ist so
einfach wie die Sache:** bei `carbs_desc` muss oben mehr stehen als
unten. **Wenn nicht, sortiert etwas anderes.**

`[read]` **Die dritte ist die, die den Unterschied zu einem Filter
belegt.** Ein `protein_desc` ohne Filter zeigt den ganzen Katalog
sortiert; mit `vegan` nur die veganen. **Beides muss gehen.**

### Regeln

`tools/lauf.py` fuer jeden Befehl, keine Konsolenfenster.
**Wegwerf-Datenbank, nie gegen die laufende testen.**
**Vollsicherung vor jedem Live-Eingriff nach `backup/`.**
`[cmd]` **`food_search` ist gemessen empfindlich** — C-121 fuehrt
*,,die Suche ist langsamer geworden"*, C-191/C-192 *,,`p_user_id`
kostet das Dreifache"*. **Miss die Laufzeit vorher und nachher.**

**Wenn eine Vorgabe nicht aufgeht: melden, nicht passend machen.**

## Bericht

Stand: erledigt. E-23 ordnet die acht Makroachsen als Suchsortierung ein,
nicht als Tags oder Nahrungs-Auslobungen. Der finale food_search-Vertrag in
Schritt 075 hat jetzt zehn gueltige Werte: relevance, name_asc sowie die
acht Richtungen fuer Protein, Kalorien, Kohlenhydrate und Fett.

### Messung

| Messung | Ausgangsannahme | Vorher im Klon | Nachher im Klon |
|---|---:|---:|---:|
| unterstuetzte Sortierwerte | 4 / 10 | 4 | 10 |
| Tag-Definitionen | 14 im Punkt-Frontmatter | 16 | 16 |
| food_tags | keine neue Zuordnung | 32.068 | 32.068 |

Die Zahl 14 im Punkt ist ueberholt: G-221 hatte inzwischen high_fat und
gluten_free eingebracht. Abgrenzung sind nutrition.tag_definitions und
nutrition.food_tags im vollstaendigen Kettenklon. G-245 schreibt keine
dieser Tabellen.

| Sortierung | Vorher, ms | Nachher, ms |
|---|---:|---:|
| relevance | 244,897 | 265,594 |
| protein_desc | 189,961 | 192,330 |
| protein_asc | 249,657 (stiller relevance-Rueckfall) | 188,813 |
| kcal_asc | 192,346 | 197,034 |
| kcal_desc | 254,969 (stiller relevance-Rueckfall) | 186,455 |
| carbs_desc | 237,570 (stiller relevance-Rueckfall) | 193,990 |
| carbs_asc | 235,789 (stiller relevance-Rueckfall) | 189,326 |
| fat_desc | 245,714 (stiller relevance-Rueckfall) | 189,627 |
| fat_asc | 249,706 (stiller relevance-Rueckfall) | 187,979 |
| name_asc | 202,461 | 186,976 |

Die Einzelmessungen sind warme Einzelaufrufe auf zwei Wegwerf-Datenbanken;
bei den vier bestehenden Richtungen liegt die Aenderung zwischen -7,7 und
+8,5 Prozent und ist kein belastbarer Regressionseffekt. Die sechs neuen
Werte wurden vorher nicht ausgefuehrt, sondern still als relevance behandelt.

### Funktionsnachweis

| Wert | erster Nahrungswert | Wert auf Platz 100 | Ordnung |
|---|---:|---:|---|
| protein_desc | 88,300 g | 31,472 g | absteigend |
| protein_asc | 0,000 g | 0,000 g | aufsteigend, Gleichstand an der Grenze |
| kcal_desc | 900 kcal | 611 kcal | absteigend |
| kcal_asc | 0 kcal | 14 kcal | aufsteigend |
| carbs_desc | 100,000 g | 72,619 g | absteigend |
| carbs_asc | 0,000 g | 0,000 g | aufsteigend, Gleichstand an der Grenze |
| fat_desc | 100,000 g | 59,300 g | absteigend |
| fat_asc | 0,000 g | 0,000 g | aufsteigend, Gleichstand an der Grenze |

[cmd] Vorher gab carbs_desc sort = relevance zurueck, erste und letzte
Zeile hatten jeweils 0 g Kohlenhydrate. Nachher liefert carbs_desc 100,000 g
oben und 72,619 g auf Platz 100. Damit ist die verlangte Gegenprobe nicht
nur eine Namenspruefung.

[cmd] Vegan plus protein_desc: total 1.377, alle 100 Lebensmittel der
abgerufenen Seite tragen vegan, Protein oben 88,300 g, unten 14,850 g. Die
Sortierung ordnet also die gefilterte Menge und ersetzt den Filter nicht.

[cmd] Die bisherigen Werte waren vor und nach dem Umbau an erster und
hundertster Stelle identisch:

| Wert | erste BLS-Code | hundertste BLS-Code |
|---|---|---|
| relevance | H861000 | U575100 |
| protein_desc | H011000 | Y583212 |
| kcal_asc | R553000 | F3B2902 |
| name_asc | T041152 | Y810242 |

### Sichtbarer Rueckfall

Unbekannte Werte werden weiterhin kontrolliert auf relevance zurueckgefuehrt,
damit die Suche lauffaehig bleibt. Sie sind aber nicht mehr still:

~~~json
{
  "sort": "relevance",
  "unsupported_sort": {
    "code": "unsupported_sort",
    "requested_sort": "not_a_sort",
    "supported_sorts": [
      "relevance", "protein_desc", "protein_asc", "kcal_desc", "kcal_asc",
      "carbs_desc", "carbs_asc", "fat_desc", "fat_asc", "name_asc"
    ]
  }
}
~~~

Damit kann jeder Aufrufer den Fehler unterscheiden, statt eine andere
Sortierung als seine angeforderte zu lesen. Es wurden keine Tags, keine
Ballaststoff-Sortierung und keine Filterregeln angelegt oder geaendert.

### Nachweis und Dateien

- [cmd] Voller Kettenlauf gegen lumeos_g245_after: 129 von 129 Schritten,
  152,9 s.
- [cmd] Sortier-, Filter- und Rueckfallproben ausschliesslich im Klon.
- [cmd] git diff --check: OK.

Geaendert:

- supabase/_pipeline/07_lesefunktionen/075_preference_search_application.sql
- supabase/README.md

Kein Live-Eingriff, daher keine Vollsicherung erforderlich. [cmd] Beide
Wegwerf-Datenbanken wurden nach Abschluss geloescht (0 Datenbanken dieser
Namen). Nicht gestagt, nicht committet und apps/ nicht angefasst.

## Abnahme

**2026-08-28, Orchestrator. Selbst gemessen.**

`[cmd]` **Im Kettenschritt stehen alle zehn Werte:** `relevance`,
`protein_desc`, `protein_asc`, `kcal_desc`, `kcal_asc`, `carbs_desc`,
`carbs_asc`, `fat_desc`, `fat_asc`, `name_asc`.

`[cmd]` **Der Rueckfall ist nicht mehr still:** `code:
unsupported_sort` mit `requested_sort` und `supported_sorts`.

`[read]` **Das ist besser als die drei Wege, die ich in C-313b
vorgeschlagen hatte.** Die Suche faellt weiterhin auf `relevance`
zurueck — **also bekommt der Nutzer Ergebnisse** — aber sie sagt
dazu, was sie nicht verstanden hat **und welche Werte gehen.** **Ein
Aufrufer kann sich korrigieren, ohne die Signatur zu lesen.**

`[cmd]` `carbs_desc` sortiert 100,000 g vor 72,619 g. `vegan +
protein_desc` liefert nur vegane Treffer, absteigend nach Protein.
**Die vier bestehenden an Position 1 und 100 identisch.**

`[cmd]` **Live nicht eingespielt** — war nicht beauftragt, richtig so.

### Und wieder ein Messfehler von mir

`[cmd]` **Ich habe den Kettenschritt nach Dateinamen gesucht** —
*,,sort"* oder *,,245"* — **und nichts gefunden.** Er heisst
`075_preference_search_application.sql`, weil die Funktion dort steht.
`[read]` **Die Aenderung stand im `git status`, den ich zwei Befehle
spaeter gelesen habe.**

**Abgenommen.**

