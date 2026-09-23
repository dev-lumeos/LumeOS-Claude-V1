---
nr: C-534
typ: befund
modul: nutrition
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: C-507
entscheidung: C-507
agent: codex
beauftragt: 2026-09-23
erledigt: 2026-09-08
commit: OFFEN
beruehrt:
  tabellen: [nutrition.foods]
zahlen:
  gemessen: 2026-09-23
---

# C-534 - welche Lebensmittelgruppen gibt es?

## Ergebnis in einem Satz

Die Daten enthalten zwei vorhandene Gruppierungen, aber keine davon kann
heute einen verlaesslichen Beginner-Parent bestimmen: `category_id` ist
zu grob und die BLS-Staemme sind zu uneinheitlich. Ein Parent muss eine
kuratierte, echte Lebensmittelzeile werden; er darf nicht aus Makros
gemittelt oder aus `raw` geraten werden.

## A1 - vorhandene Gruppierungen

`nutrition.food_categories` hat 518 Knoten (13 Wurzeln, Ebenen 1 bis 4).
Nur 33 Kategorien tragen Foods; 73 der 7.140 Foods haben gar keine
`category_id`. Die zehn groessten belegten Kategorien sind:

| Kategorie | Foods |
|---|---:|
| Fertiggerichte & Zubereitungen | 2.050 |
| Gemuese | 560 |
| Backwaren & Gebaeck (Snack-Kategorie) | 466 |
| Wurstwaren & Aufschnitt | 375 |
| Magerer Seefisch | 361 |
| Obst | 275 |
| Suesses & Snacks | 253 |
| Getraenke | 233 |
| Rohe Koerner, Flocken & Pseudogetreide | 231 |
| Lamm & Schaf | 191 |

Sie sind Navigationskategorien, keine Variantenfamilien. Ein einzelner
Parent fuer `Gemuese` oder `Magerer Seefisch` waere fachlich keine
Vorgabe, sondern eine willkuerliche Auswahl.

Der feinere, vorhandene Schluessel ist der vierstellige BLS-Stamm. Er
liefert 2.646 Gruppen; die bestehende, nur an vier belegten
Erzeugnisklassen erweiterte BLS-Regel liefert 2.714. Ihre zehn groessten
Gruppen haben nur 14 bis 18 Eintraege:

| BLS-Gruppe | Foods | Aktueller Vertreter nach BLS-Rang | Tagebuch-Kandidat | Eintraege im Tagebuch |
|---|---:|---|---|---:|
| X2A1 | 18 | Chinakohlsalat mit Essigmarinade | derselbe | 0 |
| Y8A4 | 17 | Griessbrei mit Erdbeersauce, roh | derselbe | 0 |
| G480 | 16 | Speisezwiebel, roh | derselbe | 0 |
| G620 | 15 | Karotte/Moehre, roh | Karotte/Moehre, gekocht | 154 |
| K701 | 15 | Champignon, roh | Champignon, getrocknet | 0 |
| D7A7 | 14 | Plunderteig, roh | derselbe | 0 |
| G090 | 14 | Gemuesemischung Kaisergemuese, roh | derselbe | 0 |
| G490 | 14 | Knoblauch, roh | derselbe | 0 |
| G710 | 14 | Bohne gruen, roh | Bohne gruen, gekocht | 124 |
| T410 | 14 | Lachs, roh | Lachs, geduenstet | 114 |

Der vorhandene BLS-Rang bevorzugt absichtlich die Codes `100` und `000`,
also Roh- oder Grundform. Das widerspricht Toms Regel fuer Beginner und
ist daher kein Parent-Mechanismus.

## A2 - Parentvorschlag und messbare Grenze

Der Beispielfall ist fachlich eindeutig kuratierbar:

| Variantenfamilie | Parentvorschlag | Beleg |
|---|---|---|
| Hähnchenbrust ohne Haut | `V4A6172` - Hähnchen Brust, ohne Haut, gegrillt | echte BLS-Zeile; gegart und exakt Toms vorgegebene Form, nicht gemittelt |
| Karotte/Moehre (`G620`) | `G620132` - Karotte/Moehre, gekocht | 154 Tagebucheintraege; der Rohvertreter wuerde Toms Regel verletzen |
| Bohne gruen (`G710`) | gekochte BLS-Zeile | 124 Tagebucheintraege auf der gekochten Variante |
| Lachs (`T410`) | geduenstete BLS-Zeile | 114 Tagebucheintraege auf der geduensteten Variante |

Diese drei Tagebuchwerte sind nur ein Beleg fuer die vorliegende
Testdatenmenge, nicht fuer eine globale Verzehrhaeufigkeit: 9.078
Tagebuchpositionen benutzen nur 51 verschiedene Foods (0,71 % des
Katalogs) und beruehren nur 46 von 2.646 BLS-Gruppen. Fuer die anderen
2.600 Gruppen gibt es keine gemessene Verzehrbasis.

Eine automatische Parentwahl ist damit nicht belegt. `processing_level`
kennt nur grobe Klassen: Von 2.646 BLS-Gruppen haben 1.804 keinen
`cooked`-Eintrag, 318 genau einen und 524 mehrere. Die Spalte kann weder
Grill gegen Pfanne oder Ofen unterscheiden noch sagen, welche gegarte
Variante gegessen wird. Der Name traegt diese Achsen, aber ohne
kanonische Grammatik und mit den in C-507 benannten Zuschnitten,
Hautarten und Rezeptbestandteilen.

## A3 - Fertiggerichte

`is_prepared_dish` trennt nichts: alle 7.140 Foods tragen `false`.
Ein Clubsandwich mit Hähnchenbrust liegt zwar aufgrund seiner
`category_id` in `Fertiggerichte & Zubereitungen`, die Spalte selbst
liefert aber keine Trennung. Die Hähnchenbrust-Kategorie trennt das
Clubsandwich vom Grundprodukt, ist mit 35 Zeilen jedoch selbst zu grob:
18 Hähnchen-, 14 Puten- und 3 Entenbrustzeilen liegen darin zusammen.

## A4 - warum die Parentwahl zaehlt

Spannen je 100 g in drei vorhandenen Kategorien:

| Kategorie | kcal | Protein g | Fett g | Kohlenhydrate g |
|---|---:|---:|---:|---:|
| Hähnchenbrust & Filet | 104-250 | 20,99-37,87 | 0,62-17,43 | 0-2,35 |
| Magerer Seefisch | 51-694 | 4,40-79,20 | 0,41-75,00 | 0-27,56 |
| Rohe Koerner, Flocken & Pseudogetreide | 29-522 | 0-80,60 | 0-29,56 | 4-88,35 |

Auch innerhalb des Hähnchen-Falls ist der Parent nicht austauschbar:
`V4A6172` (gegrillt) hat 138 kcal und 28,41 g Protein, das rohe
Brustfilet `V416100` 109 kcal und 23,25 g; das marinierte gegrillte
Filet `V421072` 163 kcal, 27,34 g Protein und 2,13 g Kohlenhydrate.

## A5 - reicht processing_level plus Name?

Nein. Die vorhandene BLS-Gruppierung wurde erneut gemessen: Von 100
Gruppen mit mindestens zwei Eintraegen sind nur 47 einheitlich (ohne
Gerichte 60), nicht die geforderten 95. 47 echte Mischungen bleiben
offen, etwa Brote mit verschiedenen Zutaten, Milch mit verschiedenen
Fettstufen und Gerichte in den X/Y-Codes. `processing_level` und Name
reichen daher nicht fuer eine automatische, sichere Parentwahl.

## A6 - keine Umsetzung

Es wurde keine Spalte, keine Gruppe und kein Parent angelegt.
`nutrition.food_curation_candidates` und
`nutrition.food_curation_decisions` enthalten beide 0 Zeilen; es gibt
keine vorhandene Kurationsentscheidung, aus der ein Parent uebernommen
werden koennte. C-535 bleibt der Bauauftrag fuer die Parent-Beziehung.

## Abnahme

**2026-09-08, Orchestrator. Ein Messauftrag.**

> *,,Es gibt keine sichere automatische Parent-Wahl."*

`[cmd]` **Selbst nachgemessen:**

    is_prepared_dish   0 von 7.140 -- trennt nichts
    category_id        33 von 518 Kategorien belegt

`[cmd]` **Und seine Zahlen:**

    Haehnchenbrust-Kategorie   18 Haehnchen-, 14 Puten-,
                               3 Entenbrustzeilen
    BLS-Staemme                2.646 Gruppen,
                               47 von 100 einheitlich
    Tagebuchnutzung            46 von 2.646 Gruppen

`[read]` **Punkt B aus meinem Auftrag ist damit beantwortet:
*,,die, die man isst"* laesst sich NICHT ableiten.**

`[cmd]` **46 von 2.646 Gruppen haben ueberhaupt
Tagebuchnutzung** ? **zu wenig, um daraus auf den Rest zu
schliessen.**

### Und ein konkreter Parent

> *,,Der kuratierbare Parent fuer Toms Fall ist V4A6172 ?
Haehnchen Brust ohne Haut, gegrillt (138 kcal, 28,41 g
Protein je 100 g)."*

`[read]` **Einer von 2.646** ? **das ist die Groessenordnung
der Kuration.**

### Und ein Befund, den ich schon kenne

`[cmd]` **Er meldet `produkt-daumen.ts` als C-519-Nachzug** ?
**das ist G-490: der Waechter vergleicht den Spaltennamen ohne
die Tabelle. Die Datei liest `food_preference_items`, dort
steht die Spalte.**

**Abgenommen. Die Kuration entscheidet Tom.**
