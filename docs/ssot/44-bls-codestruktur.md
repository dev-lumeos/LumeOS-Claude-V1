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
