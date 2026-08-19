# BLS-Codestruktur: was der Code bereits kodiert

`[cmd]` Erhoben 2026-08-13. Anlass: Nach `43-…` war eine Rangfolge über
80 Zubereitungswörter geplant. Toms Einwand — *„die BLS-Codes definieren das
schon, was soll dieser Aufwand?"* — trifft zu. Der Aufwand entfällt.

## Erster Buchstabe: Warengruppe

`[cmd]` 20 Gruppen. Die vier grössten sind zugleich der Kern des Suchproblems:

| | | Beispiel |
|---|---|---|
| **X** | 1.165 | Chinakohl gedünstet mit geriebenem Käse |
| **Y** | 885 | Schokoladenpudding, zubereitet aus Pulver |
| U | 685 | Kalb Brust, Rohpökelware, geräuchert |
| G | 560 | Wirsing roh |
| T | 520 | Dorsch/Kabeljau, paniert |
| D | 466 | Käsekuchen mit Streuseln |
| V | 462 | Pute Brust, ohne Haut, gegrillt |
| W | 375 | Krakauer Schinkenwurst |
| M | 279 | Edamer mind. 50 % Fett i. Tr. |
| F | 275 | Brombeere roh |

**X und Y sind zusammen 2.050 Fertiggerichte** — genau das, was bei der Suche
nach „Hähnchenbrust" vor dem rohen Filet stand.

## Stellen 5 bis 7: Zubereitung

`[cmd]` 59 Codes mit mindestens 20 Einträgen. Die häufigsten:

| Code | | Bedeutung |
|---|---|---|
| `000` | 984 | keine Zubereitungsvariante (Gin, Baiser, Brownies) |
| `100` | 847 | **roh** |
| `200` | 398 | tiefgefroren |
| `132` | 231 | gekocht |
| `182` | 228 | gebraten (Pfanne) |
| `162` | 217 | gebraten (Ofen) |
| `600` | 212 | geräuchert |
| `400` | 194 | Konserve |
| `152` | 149 | gedünstet |
| `142` | 144 | geschmort |
| `172` | 96 | gegrillt |

**Korrektur einer Annahme:** `000` ist *nicht* „roh". `[cmd]` Dort stehen
Weizenknusperbrot, Limonade, Brownies, Sheabutter — Produkte ohne Rohzustand.
`100` ist roh, belegt durch 508 von 847 Namen mit „roh".

## Der eigentliche Fund: `sort_weight` kodiert es schon

`[cmd]` Bei allen 7.140 gefüllt, 0 bis 980. Der Mittelwert je Warengruppe:

| Gruppe | | Schnitt | min | max |
|---|---|---|---|---|
| T Fisch | 520 | 695 | 550 | 980 |
| M Milch | 279 | 664 | 560 | 830 |
| H Hülsenfrüchte | 142 | 650 | 500 | 820 |
| C Getreide | 231 | 640 | 550 | 900 |
| F Obst | 275 | 619 | 480 | 660 |
| G Gemüse | 560 | 612 | 430 | 830 |
| V Fleisch | 462 | 414 | 250 | 730 |
| D Süsswaren | 466 | 339 | 190 | 340 |
| P Alkohol | 119 | 180 | 180 | 180 |
| **Y Gerichte** | 885 | **1** | 0 | 70 |
| **X Suppen/Gerichte** | 1.165 | **0** | 0 | 0 |

`[Sicher]` **X und Y stehen auf null.** Die 2.050 Fertiggerichte sind bereits
als unterste Priorität markiert. Die Rangordnung existiert, ist vollständig
gefüllt und trifft fachlich das Richtige.

Auch die Zubereitung schlägt durch: `[cmd]` `152` gedünstet 649, `600`
geräuchert 574, `100` roh 523 — und die Gerichtscodes ziehen den Schnitt der
X/Y-Gruppen auf null.

## Was daraus folgt

**Die 80 Zubereitungswörter aus `43-…` werden nicht gebraucht.** Sie waren der
Versuch, aus Namen zu erschliessen, was Code und `sort_weight` bereits sagen.

Und die Rangfolge braucht keine neue Gewichtung. `[cmd]` `food_search` wertet
`sort_weight` bereits aus — nur an **zweiter** Stelle, nach `text_rank`. Der
kennt drei Stufen: 1.0 exakt, 0.85 beginnt mit, 0.65 sonst.

`Hähnchen Brustfilet, roh` (V, ~414) und `Kohlrabi gefüllt mit
Hähnchenbrustfilet` (X, 0) landen beide auf `text_rank` 0.65 — **und dann
müsste `sort_weight` das Filet nach vorn bringen.**

Dass es das nicht tut, hat einen anderen Grund als die Gewichtung.
`[annahme]` Ungeklärt: entweder greift die Sortierung nicht wie gelesen, oder
die Trefferliste ist vorher schon beschnitten, oder ein Alias-Treffer bewertet
anders. **Das ist die nächste Messung** — und sie ist wichtiger als jede neue
Gewichtung, weil hier ein vorhandenes, korrekt gefülltes Feld wirkungslos
bleibt.

## Regel, die daraus folgt

*Bevor eine Rangordnung gebaut wird: nachsehen, ob die Quelle sie mitliefert.*
Der BLS-Code trägt Warengruppe und Zubereitung an festen Stellen, und
`sort_weight` hat beides bereits übersetzt. Zwei Systeme, die um dieselbe
Sortierung konkurrieren, sind schlechter als eines.

## C-99: Wo die 2.237 liegen

[cmd] Vor C-99 waren 4.903 von 7.140 Lebensmitteln mit `foods.category_id` verbunden; 2.237 waren leer. Die leeren Zeilen lagen nicht breit gestreut, sondern in wenigen Bloecken:

| Praefix | leer | Befund |
|---|---:|---|
| `X` | 1.165 | zusammengesetzte Gerichte |
| `Y` | 885 | Menuekomponenten / zubereitete Gerichte |
| `N` | 114 | alkoholfreie Getraenke, Wasser, Kaffee, Tee, Softdrinks |
| `V` | 56 | Schnecken, Pferd/Ziege/Kaninchen, Wildgefluegel, Pasteten, Gefluegel-Konserve |
| `U` | 17 | Fleisch-Konserven, Suppen, Fonds, Saucen |

[read] Das ist keine gleichmaessige Streuung. `N`, `X` und `Y` sind fehlende sichere Bruecken auf vorhandene Kategorien; `U`/`V` mischen Rohware, Wild, Brotaufstrich, Konserve, Suppe und Sauce und bleiben deshalb leer.

## C-99: Was die 4.903 ueber die Systematik sagen

[cmd] Die 4.903 bereits kategorisierten Lebensmittel belegten 32 `food_categories`; keine dieser Kategorien enthielt mehr als einen BLS-Praefix. Der bestehende Bestand ist damit als Massstab geeignet.

[cmd] Der gelernte Abgleich Praefix -> Anzeigegruppe reproduziert die 4.903 vollstaendig: `scope_foods = 4903`, `category_present = 4903`, `group_resolved = 4903`.

| Praefix | Gruppe | Zeilen |
|---|---|---:|
| `B` | Brot & Backwaren | 186 |
| `C` | Getreide & Staerke | 231 |
| `D` | Suesswaren & Gebaeck | 466 |
| `E` | Eier | 104 |
| `F` | Obst | 275 |
| `G` | Gemuese | 560 |
| `H` | Nuesse & Samen | 142 |
| `K` | Kartoffeln & Huelsenfruechte | 157 |
| `M` | Milch & Kaese | 279 |
| `P` | Getraenke | 119 |
| `Q` | Fette & Oele | 65 |
| `R` | Wuerzmittel & Zutaten | 97 |
| `S` | Suesswaren | 253 |
| `T` | Fisch & Meerestiere | 520 |
| `U` | Fleisch | 668 |
| `V` | Gefluegel | 406 |
| `W` | Wurstwaren | 375 |

[read] Genau hier war die reine Praefixregel zu grob: Die Anzeigegruppe `Getraenke` muss `N` und `P` tragen koennen; `Fette & Oele` haengt an Kategorie `fette-oele`, obwohl die belegten Foods den Praefix `Q` tragen; `Wuerzmittel & Zutaten` nimmt die `R`-Foods auf. Deshalb gehoert die Bruecke an `food_categories`, nicht als zweite geratene Praefixregel an `foods`.

## C-99: Wie die Regel gegen sie abschneidet

[cmd] Gebaut wurde `supabase/_pipeline/02_human_layer/023a_food_group_category_bridge.sql`. Strukturentscheidung: `food_categories.food_group_code` zeigt per Fremdschluessel auf `nutrition.food_groups(code)`. Das ist n:1: viele Feinkategorien gehoeren zu einer Anzeigegruppe.

[cmd] Der Schritt setzt 430 von 518 Kategorien auf eine `food_group_code`. Mischwurzeln bleiben bewusst leer, wenn eine einzige Anzeigegruppe falsch waere, etwa `fleisch-gefluegel`, `getreide-brot-pasta` und `fertiggerichte-zubereitungen`.

[cmd] Auf die 2.237 vorher leeren Foods wurden 2.164 sicher angewandt: `N` -> `getraenke` (114), `X`/`Y` -> `fertiggerichte-zubereitungen` (2.050). Danach stehen 7.067 von 7.140 Foods mit Kategorie, 73 bleiben leer.

[cmd] `food_search` liest bei `p_groups` jetzt zuerst `food_categories.food_group_code` und nutzt den BLS-Praefix nur als Rueckfall, wenn die Kategorie keine eindeutige Gruppe traegt. Die Bedingung wurde an beiden Stellen der Funktion nachgezogen: Trefferseite und Gesamtzahl.

[cmd] Die Food-DB-Pillenzahlen nach dem Live-Einspielen:

| Pille / Wurzel | vorher | nachher | Differenz |
|---|---:|---:|---:|
| Meat / `fleisch-gefluegel` | 1.449 | 1.449 | 0 |
| Fish / `fisch-meeresfruechte` | 520 | 520 | 0 |
| Grains / `getreide-brot-pasta` | 883 | 883 | 0 |
| Dairy / `milch-kaese` | 279 | 279 | 0 |
| Produce / `gemuese` | 717 | 717 | 0 |
| Fruit / `obst` | 275 | 275 | 0 |
| Beverages / `getraenke` | 119 | 233 | +114 |
| Eggs / `eier` | 104 | 104 | 0 |
| `fertiggerichte-zubereitungen` | 0 | 2.050 | +2.050 |

[cmd] Die 19 `food_groups` sind danach ebenfalls voll belegt: B 186, C 231, D 466, E 104, F 275, G 560, H 142, K 157, M 279, N 65, P 233, Q 97, S 253, T 520, U 685, V 462, W 375, X 1.165, Y 885.

## C-99: Was ohne Gruppe bleibt

[cmd] Leer bleiben 73 Foods: `U` 17 und `V` 56.

[read] Diese 73 sind bewusst nicht geraten. `U9` enthaelt Fleischkonserven, Ochsenschwanzsuppe, Fleischfond, Bratensosse, Meerrettichsosse und Sauce Hollandaise. `V` enthaelt Schnecken, Pferd, Ziege, Kaninchen, Wildgefluegel, Brotaufstriche, Pasteten und Gefluegel-Konserven.

[annahme] Fuer diese Reste braucht es eine eigene Kategorie-Kuration nach Namen und Zielkategorien. Eine pauschale Zuordnung zu Fleisch/Gefluegel oder Fertiggerichten waere genau die Art Regel, die bei den zwei frueheren Praefixversuchen gefallen ist.

[cmd] Nachweis: Kettenlauf auf Wegwerf-Datenbank `c99_bridge` lief gruen; `023a` meldete `OK: 430 Kategorien mit food_group_code, 7067 Foods kategorisiert, 73 bewusst leer`. `schema-vollstaendigkeit-pruefen.ts` meldete auf Wegwerf und live Exit 0 mit `Fremdschl. 17/17 vorhanden`. `testdaten-pruefen.ts` meldete live `OK: C-82 Testdaten stimmen`. `pnpm gate` lief gruen.
