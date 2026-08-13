# Arbeitsblatt Anzeigenamen — die 100 wichtigsten Lebensmittel

`[cmd]` Erzeugt 2026-08-13 von
`supabase/_pipeline/_validierung/anzeigenamen-arbeitsblatt.ts`.

**124 Begriffe geprüft, davon 12 ohne jeden Treffer.**

Je Begriff steht hier: was die Suche **heute** liefert, und was der
Bestand unter diesem Stichwort **überhaupt hat**. Die drei Felder am
Ende jeder Zeile sind zum Ausfüllen — Anzeigename, Aliase, Notiz.

`[cmd]` **Warum das nötig ist:** `name_display` ist bei allen 7.140
Lebensmitteln gefüllt, aber **identisch mit `name_de`** — Kettenschritt
020 setzt ihn per `COALESCE` auf den BLS-Namen. Der Mechanismus steht,
er ist nur leer. `food_search` liest bereits
`COALESCE(NULLIF(name_display,''), name_de, …)`; ein gefülltes Feld
wirkt **sofort**, ohne Codeänderung.

`[Sicher]` **Der Grund, warum das kein Schönheitsthema ist:** `[cmd]`
`Reis poliert, roh` hat 351 kcal, `Reis poliert, gekocht` hat 117 —
**Faktor 3**. Wer 200 g gekochten Reis wiegt und den rohen Eintrag
wählt, verbucht 702 statt 234 kcal. Der Name muss die Unterscheidung
tragen, nicht nur erwähnen.

---
## Eiweiss — Fleisch

### `haehnchenbrust`
Suche liefert:
1. `V416100` Hähnchen Brustfilet, roh
2. `V416172` Hähnchen Brustfilet, gegrillt
3. `V416142` Hähnchen Brustfilet, geschmort ohne Fett

Im Bestand (nach Gewicht):
| Code | Gew | Zub | name_de |
|---|---|---|---|
| `V997100` | 450 | 100 | Hähnchenbrustfilet im eigenen Saft, Konserve |
| `Y562032` | 0 | 032 | Hähnchenbrustfilet gebraten |
| `Y591112` | 0 | 112 | Hähnchenbrustfilet paniert, gebraten |
| `Y562133` | 0 | 133 | Hähnchenbrustfilet gebraten, mit Schmorgurken |
| `X425813` | 0 | 813 | Chinesische Suppe scharf, mit Hähnchenbrustfilet |
| `Y560723` | 0 | 723 | Pilaw mit gedünstetem Hähnchenbrustfilet und Sauce |

**Anzeigename:** _(offen)_  **Aliase:** _(offen)_  **Notiz:** _(offen)_

### `haehnchenschenkel`
Suche liefert:
1. `V4A5172` Hähnchen Oberschenkel, mit Haut, gegrillt
2. `V4A5142` Hähnchen Oberschenkel, mit Haut, geschmort ohn
3. `V4B5172` Hähnchen Unterschenkel, mit Haut, gegrillt

Im Bestand (nach Gewicht):
| Code | Gew | Zub | name_de |
|---|---|---|---|
| `Y569523` | 0 | 523 | Hähnchenschenkel gekocht, in Currysauce |
| `Y599012` | 0 | 012 | Hähnchenschenkel gekocht (mit Fett und Salz) |
| `Y569122` | 0 | 122 | Hähnchenschenkel/Hähnchenkeule, gebraten im Ofen |
| `Y569533` | 0 | 533 | Hähnchenschenkel mariniert, gebraten, mit Curryjog |

**Anzeigename:** _(offen)_  **Aliase:** _(offen)_  **Notiz:** _(offen)_

### `putenbrust`
Suche liefert:
1. `W561000` Putenbrust, Kochpökelware, geräuchert
2. `X1A3000` Glasnudelsalat mit Putenbrust, Gemüse und Essi

Im Bestand (nach Gewicht):
| Code | Gew | Zub | name_de |
|---|---|---|---|
| `W561000` | 570 | 000 | Putenbrust, Kochpökelware, geräuchert |
| `X1A3000` | 0 | 000 | Glasnudelsalat mit Putenbrust, Gemüse und Essigmar |

**Anzeigename:** _(offen)_  **Aliase:** _(offen)_  **Notiz:** _(offen)_

### `rinderhack`
Suche liefert:
1. `U010100` Rind Hackfleisch, roh
2. `U011172` Rind Hackfleisch, gegrillt
3. `U010142` Rind Hackfleisch, geschmort ohne Fett

Im Bestand (nach Gewicht):
| Code | Gew | Zub | name_de |
|---|---|---|---|
| `Y038213` | 0 | 213 | Bologneser Sauce mit Rinderhackfleisch |
| `X469753` | 0 | 753 | Chili con carne (mit Rinderhackfleisch) |
| `X9A4000` | 0 | 000 | Burrito gefüllt mit Gemüse, Rinderhackfleisch und |
| `X7A3020` | 0 | 020 | Eier-Frischteigwaren Ravioli, gefüllt mit Rinderha |
| `X338653` | 0 | 653 | Haschee mit Rinderhackfleisch von dunkler/brauner |
| `Y0A2000` | 0 | 000 | Blätterteigtaschen gefüllt mit Rinderhackfleisch u |

**Anzeigename:** _(offen)_  **Aliase:** _(offen)_  **Notiz:** _(offen)_

### `rindersteak`
Suche liefert:
1. `U216172` Rind Filetsteak gegrillt
2. `U216100` Rind Filetsteak roh
3. `U131100` Rind Steak (Rücken) roh

Im Bestand (nach Gewicht):
| Code | Gew | Zub | name_de |
|---|---|---|---|
| `Y135432` | 20 | 432 | Rindersteak gegrillt |
| `Y135132` | 20 | 132 | Rindersteak gegrillt, mit Kräuterbutter |
| `Y184512` | 0 | 512 | Rindersteak gebraten (mit Fett und Salz) |

**Anzeigename:** _(offen)_  **Aliase:** _(offen)_  **Notiz:** _(offen)_

### `rinderfilet`
Suche liefert:
1. `U211100` Rind Filet/Lende, roh
2. `U211200` Rind Filet/Lende, tiefgefroren
3. `U216172` Rind Filetsteak gegrillt

Im Bestand (nach Gewicht):
| Code | Gew | Zub | name_de |
|---|---|---|---|
| `Y114022` | 0 | 022 | Rinderfiletsteak gebraten |
| `Y114033` | 0 | 033 | Rinderfiletsteak gebraten, mit Sauce |
| `Y111012` | 0 | 012 | Rinderfilet mariniert, gebraten im Ofen |
| `Y111123` | 0 | 123 | Rinderfilet gebraten im Ofen, mit Sauce |
| `Y160122` | 0 | 122 | Rinderfilet gebraten im Ofen, ohne Sauce |
| `Y114012` | 0 | 012 | Rinderfiletsteak gebraten, mit Kräuterbutter |

**Anzeigename:** _(offen)_  **Aliase:** _(offen)_  **Notiz:** _(offen)_

### `schweinefilet`
Suche liefert:
1. `Y311132` Schweinefilet mariniert, gegrillt, mit Orange
2. `Y311522` Schweinefilet gedünstet
3. `Y311112` Schweinefilet geschmort, mit Sauce

Im Bestand (nach Gewicht):
| Code | Gew | Zub | name_de |
|---|---|---|---|
| `Y311132` | 70 | 132 | Schweinefilet mariniert, gegrillt, mit Orange |
| `Y311522` | 20 | 522 | Schweinefilet gedünstet |
| `Y311112` | 0 | 112 | Schweinefilet geschmort, mit Sauce |

**Anzeigename:** _(offen)_  **Aliase:** _(offen)_  **Notiz:** _(offen)_

### `schweineschnitzel`
Suche liefert:
1. `Y332532` Jägerschnitzel (Schweineschnitzel natur, gebra
2. `Y332212` Schweineschnitzel natur, gebraten
3. `Y333831` Schweineschnitzel natur, gebraten, mit Grundsa

Im Bestand (nach Gewicht):
| Code | Gew | Zub | name_de |
|---|---|---|---|
| `Y332212` | 0 | 212 | Schweineschnitzel natur, gebraten |
| `Y332132` | 0 | 132 | Schweineschnitzel paniert, gebraten |
| `Y333831` | 0 | 831 | Schweineschnitzel natur, gebraten, mit Grundsauce |
| `Y332532` | 0 | 532 | Jägerschnitzel (Schweineschnitzel natur, gebraten, |

**Anzeigename:** _(offen)_  **Aliase:** _(offen)_  **Notiz:** _(offen)_

### `lammfilet`
Suche liefert:
1. `Y413032` Lammfilet gebraten

Im Bestand (nach Gewicht):
| Code | Gew | Zub | name_de |
|---|---|---|---|
| `Y413032` | 0 | 032 | Lammfilet gebraten |

**Anzeigename:** _(offen)_  **Aliase:** _(offen)_  **Notiz:** _(offen)_

### `entenbrust`
Suche liefert:
1. `Y576312` Entenbrust gebraten im Ofen (mit Fett und Salz

Im Bestand (nach Gewicht):
| Code | Gew | Zub | name_de |
|---|---|---|---|
| `Y576312` | 0 | 312 | Entenbrust gebraten im Ofen (mit Fett und Salz) |

**Anzeigename:** _(offen)_  **Aliase:** _(offen)_  **Notiz:** _(offen)_


## Eiweiss — Fisch

### `lachs`
Suche liefert:
1. `T213272` Alaska-Pollack/Alaska-Seelachs, tiefgefroren,
2. `T412100` Buckellachs roh
3. `T412200` Buckellachs tiefgefroren

Im Bestand (nach Gewicht):
| Code | Gew | Zub | name_de |
|---|---|---|---|
| `T094100` | 830 | 100 | Lachsrogen roh |
| `T412100` | 830 | 100 | Buckellachs roh |
| `T094400` | 830 | 400 | Lachsrogen gesalzen |
| `T417600` | 830 | 600 | Wildlachs geräuchert |
| `T412200` | 830 | 200 | Buckellachs tiefgefroren |
| `T207172` | 830 | 172 | Köhler/Seelachs, gegrillt |

**Anzeigename:** _(offen)_  **Aliase:** _(offen)_  **Notiz:** _(offen)_

### `raeucherlachs`
Suche liefert:
1. `T410600` Lachs geräuchert (Räucherlachs)
2. `Y725153` Rührei gebraten, mit Räucherlachs

Im Bestand (nach Gewicht):
| Code | Gew | Zub | name_de |
|---|---|---|---|
| `T410600` | 780 | 600 | Lachs geräuchert (Räucherlachs) |
| `Y725153` | 0 | 153 | Rührei gebraten, mit Räucherlachs |

**Anzeigename:** _(offen)_  **Aliase:** _(offen)_  **Notiz:** _(offen)_

### `thunfisch`
Suche liefert:
1. `T121272` Thunfisch tiefgefroren, gegrillt
2. `T121200` Thunfisch tiefgefroren
3. `T121172` Thunfisch gegrillt

Im Bestand (nach Gewicht):
| Code | Gew | Zub | name_de |
|---|---|---|---|
| `T121272` | 870 | 272 | Thunfisch tiefgefroren, gegrillt |
| `T121200` | 830 | 200 | Thunfisch tiefgefroren |
| `T121100` | 780 | 100 | Thunfisch roh |
| `T121132` | 780 | 132 | Thunfisch pochiert |
| `T121172` | 780 | 172 | Thunfisch gegrillt |
| `T121902` | 750 | 902 | Thunfisch im eigenen Saft, Konserve, abgetropft |

**Anzeigename:** _(offen)_  **Aliase:** _(offen)_  **Notiz:** _(offen)_

### `thunfisch dose`
Suche liefert:
1. `T121902` Thunfisch im eigenen Saft, Konserve, abgetropf
2. `T121702` Thunfisch in Öl, Konserve, abgetropft
3. `T813900` Thunfisch in Tomatensauce, Konserve

*Im Bestand nichts unter diesem Stichwort gefunden.*

**Anzeigename:** _(offen)_  **Aliase:** _(offen)_  **Notiz:** _(offen)_

### `forelle`
Suche liefert:
1. `T420172` Forelle gegrillt
2. `T422600` Forelle geräuchert
3. `T422400` Forelle gesalzen

Im Bestand (nach Gewicht):
| Code | Gew | Zub | name_de |
|---|---|---|---|
| `T422100` | 780 | 100 | Forelle roh |
| `T420172` | 780 | 172 | Forelle gegrillt |
| `T422400` | 780 | 400 | Forelle gesalzen |
| `T422600` | 780 | 600 | Forelle geräuchert |
| `T422272` | 780 | 272 | Forelle tiefgefroren, gegrillt |
| `T424100` | 700 | 100 | Meerforelle roh |

**Anzeigename:** _(offen)_  **Aliase:** _(offen)_  **Notiz:** _(offen)_

### `kabeljau`
Suche liefert:
1. `T204172` Dorsch/Kabeljau, gegrillt
2. `T204272` Dorsch/Kabeljau, tiefgefroren, gegrillt
3. `T093400` Kabeljaurogen gesalzen

Im Bestand (nach Gewicht):
| Code | Gew | Zub | name_de |
|---|---|---|---|
| `T093100` | 830 | 100 | Kabeljaurogen roh |
| `T093400` | 830 | 400 | Kabeljaurogen gesalzen |
| `T204172` | 830 | 172 | Dorsch/Kabeljau, gegrillt |
| `T204272` | 830 | 272 | Dorsch/Kabeljau, tiefgefroren, gegrillt |
| `T204100` | 700 | 100 | Dorsch/Kabeljau, roh |
| `T204132` | 700 | 132 | Dorsch/Kabeljau, pochiert |

**Anzeigename:** _(offen)_  **Aliase:** _(offen)_  **Notiz:** _(offen)_

### `seelachs`
Suche liefert:
1. `T213272` Alaska-Pollack/Alaska-Seelachs, tiefgefroren,
2. `T207172` Köhler/Seelachs, gegrillt
3. `T207600` Köhler/Seelachs, geräuchert

Im Bestand (nach Gewicht):
| Code | Gew | Zub | name_de |
|---|---|---|---|
| `T207172` | 830 | 172 | Köhler/Seelachs, gegrillt |
| `T207600` | 830 | 600 | Köhler/Seelachs, geräuchert |
| `T207272` | 830 | 272 | Köhler/Seelachs, tiefgefroren, gegrillt |
| `T213272` | 830 | 272 | Alaska-Pollack/Alaska-Seelachs, tiefgefroren, gegr |
| `T207100` | 700 | 100 | Köhler/Seelachs, roh |
| `T207132` | 700 | 132 | Köhler/Seelachs, pochiert |

**Anzeigename:** _(offen)_  **Aliase:** _(offen)_  **Notiz:** _(offen)_

### `hering`
Suche liefert:
1. `T102600` Bückling (Hering) heiß geräuchert
2. `T102400` Hering gesalzen
3. `T102132` Hering pochiert

Im Bestand (nach Gewicht):
| Code | Gew | Zub | name_de |
|---|---|---|---|
| `T102600` | 980 | 600 | Bückling (Hering) heiß geräuchert |
| `T102100` | 900 | 100 | Hering roh |
| `T102400` | 900 | 400 | Hering gesalzen |
| `T102132` | 900 | 132 | Hering pochiert |
| `T103100` | 900 | 100 | Matjeshering mild gesalzen |
| `T103600` | 900 | 600 | Matjeshering mild gesalzen, geräuchert |

**Anzeigename:** _(offen)_  **Aliase:** _(offen)_  **Notiz:** _(offen)_

### `makrele`
Suche liefert:
1. `T107172` Makrele gegrillt
2. `T107600` Makrele geräuchert
3. `T107100` Makrele roh

Im Bestand (nach Gewicht):
| Code | Gew | Zub | name_de |
|---|---|---|---|
| `T107172` | 780 | 172 | Makrele gegrillt |
| `T107100` | 700 | 100 | Makrele roh |
| `T107600` | 700 | 600 | Makrele geräuchert |
| `T118100` | 700 | 100 | Schildmakrele/Stöcker, roh |
| `T118152` | 700 | 152 | Schildmakrele/Stöcker, gedünstet |
| `T118182` | 680 | 182 | Schildmakrele/Stöcker, gebraten ohne Fett (Pfanne) |

**Anzeigename:** _(offen)_  **Aliase:** _(offen)_  **Notiz:** _(offen)_

### `garnelen`
Suche liefert:
1. `T753272` Garnele/Granat/Krabbe, tiefgefroren, gegrillt
2. `T936100` Garnele paniert, tiefgefroren
3. `T753800` Garnele/Granat/Krabbe, Präserve

Im Bestand (nach Gewicht):
| Code | Gew | Zub | name_de |
|---|---|---|---|
| `Y689132` | 20 | 132 | Riesengarnelen mariniert, gegrillt |

**Anzeigename:** _(offen)_  **Aliase:** _(offen)_  **Notiz:** _(offen)_


## Eiweiss — Ei und Milch

### `eier`
Suche liefert:
1. `T512100` Schleie roh
2. `E632100` Dinkeleierteigwaren roh
3. `E632300` Dinkelvollkorneierteigwaren roh

Im Bestand (nach Gewicht):
| Code | Gew | Zub | name_de |
|---|---|---|---|
| `E432000` | 680 | 000 | Eierteigwaren roh |
| `E632100` | 680 | 100 | Dinkeleierteigwaren roh |
| `E438000` | 680 | 000 | Eier-Frischteigwaren roh |
| `E530000` | 680 | 000 | Vollkorneierteigwaren roh |
| `E612100` | 680 | 100 | Eierteigwaren glutenfrei, roh |
| `E632300` | 680 | 300 | Dinkelvollkorneierteigwaren roh |

**Anzeigename:** _(offen)_  **Aliase:** _(offen)_  **Notiz:** _(offen)_

### `eiklar`
Suche liefert:
1. `E113100` Hühnerei Eiklar, roh
2. `E113400` Hühnerei Eiklar, getrocknet
3. `E113500` Hühnerei Eiklar, Pulver

Im Bestand (nach Gewicht):
| Code | Gew | Zub | name_de |
|---|---|---|---|
| `E113100` | 880 | 100 | Hühnerei Eiklar, roh |
| `E113500` | 850 | 500 | Hühnerei Eiklar, Pulver |
| `E113400` | 850 | 400 | Hühnerei Eiklar, getrocknet |
| `E113162` | 680 | 162 | Hühnerei Eiklar, gebacken |
| `E108122` | 680 | 122 | Hühnerei Eiklar, pochiert |
| `E113132` | 530 | 132 | Hühnerei Eiklar, gekocht |

**Anzeigename:** _(offen)_  **Aliase:** _(offen)_  **Notiz:** _(offen)_

### `eigelb`
Suche liefert:
1. `E112400` Hühnerei Eigelb, getrocknet
2. `E112500` Hühnerei Eigelb, Pulver
3. `E112162` Hühnerei Eigelb, gebacken

Im Bestand (nach Gewicht):
| Code | Gew | Zub | name_de |
|---|---|---|---|
| `E112500` | 800 | 500 | Hühnerei Eigelb, Pulver |
| `E112400` | 800 | 400 | Hühnerei Eigelb, getrocknet |
| `E112100` | 680 | 100 | Hühnerei Eigelb, roh |
| `E112162` | 680 | 162 | Hühnerei Eigelb, gebacken |
| `E112132` | 530 | 132 | Hühnerei Eigelb, gekocht |
| `E112182` | 530 | 182 | Hühnerei Eigelb, gebraten ohne Fett (Pfanne) |

**Anzeigename:** _(offen)_  **Aliase:** _(offen)_  **Notiz:** _(offen)_

### `magerquark`
Suche liefert:
1. `M713100` Speisequark Magerstufe, Magerquark < 10 % Fett
2. `Y771510` Kräuterquark (aus Magerquark)
3. `Y882410` Quark (Magerstufe) mit Konfitüre

Im Bestand (nach Gewicht):
| Code | Gew | Zub | name_de |
|---|---|---|---|
| `M713100` | 660 | 100 | Speisequark Magerstufe, Magerquark < 10 % Fett i. |
| `Y771510` | 0 | 510 | Kräuterquark (aus Magerquark) |
| `Y771240` | 0 | 240 | Schnittlauchquark (aus Magerquark) |

**Anzeigename:** _(offen)_  **Aliase:** _(offen)_  **Notiz:** _(offen)_

### `huettenkaese`
**Suche: KEIN TREFFER**

*Im Bestand nichts unter diesem Stichwort gefunden.*

**Anzeigename:** _(offen)_  **Aliase:** _(offen)_  **Notiz:** _(offen)_

### `skyr`
Suche liefert:
1. `M710100` Skyr, Frischkäse < 10 % Fett i. Tr.

Im Bestand (nach Gewicht):
| Code | Gew | Zub | name_de |
|---|---|---|---|
| `M710100` | 660 | 100 | Skyr, Frischkäse < 10 % Fett i. Tr. |

**Anzeigename:** _(offen)_  **Aliase:** _(offen)_  **Notiz:** _(offen)_

### `griechischer joghurt`
**Suche: KEIN TREFFER**

Im Bestand (nach Gewicht):
| Code | Gew | Zub | name_de |
|---|---|---|---|
| `X203850` | 0 | 850 | Griechischer Salat |
| `X203460` | 0 | 460 | Griechischer Bauernsalat |

**Anzeigename:** _(offen)_  **Aliase:** _(offen)_  **Notiz:** _(offen)_

### `naturjoghurt`
Suche liefert:
1. `X469313` Spanisch Fricco (Kartoffel-Eintopf mit Schwein

Im Bestand (nach Gewicht):
| Code | Gew | Zub | name_de |
|---|---|---|---|
| `M820100` | 660 | 100 | Frischkäsezubereitung Natur < 10 % Fett i. Tr. |
| `M710700` | 660 | 700 | Frischkäsezubereitung Natur, mind. 50 % Fett i. Tr |
| `M710800` | 660 | 800 | Frischkäsezubereitung Natur, mind. 60 % Fett i. Tr |
| `M820200` | 660 | 200 | Frischkäsezubereitung Natur, mind. 10 % Fett i. Tr |
| `M820600` | 660 | 600 | Frischkäsezubereitung Natur, mind. 45 % Fett i. Tr |
| `M820500` | 660 | 500 | Frischkäsezubereitung Natur, mind. 40 % Fett i. Tr |

**Anzeigename:** _(offen)_  **Aliase:** _(offen)_  **Notiz:** _(offen)_

### `harzer kaese`
**Suche: KEIN TREFFER**

*Im Bestand nichts unter diesem Stichwort gefunden.*

**Anzeigename:** _(offen)_  **Aliase:** _(offen)_  **Notiz:** _(offen)_

### `mozzarella`
Suche liefert:
1. `M0A1000` Mozzarella mind. 20 % Fett i. Tr.
2. `M032100` Mozzarella mind. 45 % Fett i. Tr.
3. `R963100` Brotaufstrich Tomate-Mozzarella

Im Bestand (nach Gewicht):
| Code | Gew | Zub | name_de |
|---|---|---|---|
| `M0A1000` | 660 | 000 | Mozzarella mind. 20 % Fett i. Tr. |
| `M032100` | 660 | 100 | Mozzarella mind. 45 % Fett i. Tr. |
| `R963100` | 360 | 100 | Brotaufstrich Tomate-Mozzarella |
| `X208312` | 0 | 312 | Tomate-Mozzarella (Caprese) |
| `Y781112` | 0 | 112 | Mozzarella paniert, frittiert |
| `X5A8040` | 0 | 040 | Käsealternative Mozzarella-Art, vegan |

**Anzeigename:** _(offen)_  **Aliase:** _(offen)_  **Notiz:** _(offen)_

### `feta`
Suche liefert:
1. `M012200` Feta mind. 45 % Fett i. Tr.
2. `Y7A2040` Schafskäse (Feta) mit Tomaten und Oliven gebac

Im Bestand (nach Gewicht):
| Code | Gew | Zub | name_de |
|---|---|---|---|
| `M012200` | 660 | 200 | Feta mind. 45 % Fett i. Tr. |
| `Y7A2040` | 0 | 040 | Schafskäse (Feta) mit Tomaten und Oliven gebacken |

**Anzeigename:** _(offen)_  **Aliase:** _(offen)_  **Notiz:** _(offen)_

### `parmesan`
Suche liefert:
1. `M306400` Parmesan mind. 30 % Fett i. Tr.
2. `X060130` Baguette-Brötchen mit Parmaschinken, Parmesan,
3. `X860252` Reiskroketten mit Parmesan

Im Bestand (nach Gewicht):
| Code | Gew | Zub | name_de |
|---|---|---|---|
| `M306400` | 780 | 400 | Parmesan mind. 30 % Fett i. Tr. |
| `X860252` | 0 | 252 | Reiskroketten mit Parmesan |
| `X850133` | 0 | 133 | Risotto mit Butter und Parmesan |
| `X556263` | 0 | 263 | Tomaten gefüllt mit Kräuter-Brot-Parmesan-Mischung |
| `X060130` | 0 | 130 | Baguette-Brötchen mit Parmaschinken, Parmesan, Ruc |

**Anzeigename:** _(offen)_  **Aliase:** _(offen)_  **Notiz:** _(offen)_

### `gouda`
Suche liefert:
1. `M402600` Gouda 48 % Fett i. Tr.
2. `M402400` Gouda mind. 30 % Fett i. Tr.
3. `M402500` Gouda mind. 40 % Fett i. Tr.

Im Bestand (nach Gewicht):
| Code | Gew | Zub | name_de |
|---|---|---|---|
| `M402600` | 740 | 600 | Gouda 48 % Fett i. Tr. |
| `M402400` | 740 | 400 | Gouda mind. 30 % Fett i. Tr. |
| `M402500` | 740 | 500 | Gouda mind. 40 % Fett i. Tr. |
| `X720413` | 0 | 413 | Auflauf aus Eier-Frischteigwaren mit Pilzsauce von |

**Anzeigename:** _(offen)_  **Aliase:** _(offen)_  **Notiz:** _(offen)_

### `frischkaese`
Suche liefert:
1. `M7B1600` Frischkäse aus Schafmilch, Natur, mind. 45 % F
2. `M7A1600` Frischkäse aus Ziegenmilch, Natur, mind. 45 %
3. `M827100` Frischkäsezubereitung < 10 % Fett i. Tr., mit

Im Bestand (nach Gewicht):
| Code | Gew | Zub | name_de |
|---|---|---|---|
| `E438000` | 680 | 000 | Eier-Frischteigwaren roh |
| `E811000` | 680 | 000 | Frischteigwaren eifrei, roh |
| `E470000` | 680 | 000 | Eier-Frischteigwaren Ravioli (Gemüsefüllung) roh |
| `E603000` | 680 | 000 | Eier-Frischteigwaren Ravioli (Fleischfüllung) roh |
| `E470042` | 680 | 042 | Eier-Frischteigwaren Ravioli (Gemüsefüllung) gedäm |
| `E603022` | 680 | 022 | Eier-Frischteigwaren Ravioli (Fleischfüllung) gedä |

**Anzeigename:** _(offen)_  **Aliase:** _(offen)_  **Notiz:** _(offen)_

### `milch`
Suche liefert:
1. `M884000` Magermilchpulver
2. `M730100` Sauermilchkäse < 10 % Fett i. Tr.
3. `M886000` Buttermilchpulver

Im Bestand (nach Gewicht):
| Code | Gew | Zub | name_de |
|---|---|---|---|
| `M884000` | 830 | 000 | Magermilchpulver |
| `M730100` | 830 | 100 | Sauermilchkäse < 10 % Fett i. Tr. |
| `M886000` | 780 | 000 | Buttermilchpulver |
| `M882000` | 740 | 000 | Vollmilchpulver |
| `M881000` | 740 | 000 | Milchpulver mit hohem Fettgehalt (Sahnepulver, Rah |
| `C557000` | 700 | 000 | Fleischersatz gluten-, milch- und sojahaltig |

**Anzeigename:** _(offen)_  **Aliase:** _(offen)_  **Notiz:** _(offen)_

### `buttermilch`
Suche liefert:
1. `M886000` Buttermilchpulver
2. `M150000` Buttermilch
3. `M255000` Buttermilchdessert mit Sahne und Fruchtzuberei

Im Bestand (nach Gewicht):
| Code | Gew | Zub | name_de |
|---|---|---|---|
| `M886000` | 780 | 000 | Buttermilchpulver |
| `M150000` | 660 | 000 | Buttermilch |
| `M252000` | 560 | 000 | Buttermilchdrink mit Fruchtzubereitung, gesüßt |
| `M255000` | 560 | 000 | Buttermilchdessert mit Sahne und Fruchtzubereitung |
| `M259000` | 560 | 000 | Buttermilchdrink mit Fruchtzubereitung, gesüßt, an |
| `B227300` | 520 | 300 | Roggenbrot mit Buttermilch |

**Anzeigename:** _(offen)_  **Aliase:** _(offen)_  **Notiz:** _(offen)_


## Eiweiss — pflanzlich

### `tofu`
Suche liefert:
1. `H861062` Tofu gebacken
2. `H861100` Seidentofu
3. `H861132` Seidentofu gargezogen

Im Bestand (nach Gewicht):
| Code | Gew | Zub | name_de |
|---|---|---|---|
| `H861062` | 730 | 062 | Tofu gebacken |
| `H861000` | 650 | 000 | Tofu |
| `H861100` | 650 | 100 | Seidentofu |
| `H861032` | 650 | 032 | Tofu gargezogen |
| `H861132` | 650 | 132 | Seidentofu gargezogen |
| `H861042` | 650 | 042 | Tofu geschmort ohne Fett |

**Anzeigename:** _(offen)_  **Aliase:** _(offen)_  **Notiz:** _(offen)_

### `tempeh`
**Suche: KEIN TREFFER**

*Im Bestand nichts unter diesem Stichwort gefunden.*

**Anzeigename:** _(offen)_  **Aliase:** _(offen)_  **Notiz:** _(offen)_

### `seitan`
Suche liefert:
1. `C558000` Fleischersatz glutenhaltig (Seitan)

Im Bestand (nach Gewicht):
| Code | Gew | Zub | name_de |
|---|---|---|---|
| `C558000` | 780 | 000 | Fleischersatz glutenhaltig (Seitan) |

**Anzeigename:** _(offen)_  **Aliase:** _(offen)_  **Notiz:** _(offen)_

### `linsen`
Suche liefert:
1. `H725100` Linse reif
2. `H730000` Linse rot reif
3. `H730400` Linsenmehl

Im Bestand (nach Gewicht):
| Code | Gew | Zub | name_de |
|---|---|---|---|
| `H730400` | 780 | 400 | Linsenmehl |
| `H662100` | 650 | 100 | Linsensprossen/Linsenkeimlinge, roh |
| `S464000` | 240 | 000 | Schokoladen-Dragees (Schokolinsen) |
| `Y813552` | 0 | 552 | Hefeplinsen gebraten |
| `X572153` | 0 | 153 | Linsengemüse gekocht |
| `Y818242` | 0 | 242 | Quarkplinsen gebraten |

**Anzeigename:** _(offen)_  **Aliase:** _(offen)_  **Notiz:** _(offen)_

### `kichererbsen`
Suche liefert:
1. `H720400` Kichererbsenmehl
2. `G770400` Kichererbse reif
3. `H960000` Hummus/Kichererbsenmus

Im Bestand (nach Gewicht):
| Code | Gew | Zub | name_de |
|---|---|---|---|
| `H720400` | 730 | 400 | Kichererbsenmehl |
| `H960000` | 650 | 000 | Hummus/Kichererbsenmus |
| `X4A8030` | 0 | 030 | Kichererbsen-Eintopf |
| `X5A1030` | 0 | 030 | Kichererbsensnack gebacken |
| `X464913` | 0 | 913 | Kichererbsen-Tomaten-Eintopf |
| `X5A1020` | 0 | 020 | Kichererbsenbratlinge gebraten |

**Anzeigename:** _(offen)_  **Aliase:** _(offen)_  **Notiz:** _(offen)_

### `kidneybohnen`
Suche liefert:
1. `H742100` Kidneybohne reif
2. `H742902` Kidneybohne reif, Konserve, abgetropft
3. `H742132` Kidneybohne reif, gekocht

Im Bestand (nach Gewicht):
| Code | Gew | Zub | name_de |
|---|---|---|---|
| `X5A8020` | 0 | 020 | Kidneybohnen gedünstet |

**Anzeigename:** _(offen)_  **Aliase:** _(offen)_  **Notiz:** _(offen)_

### `schwarze bohnen`
**Suche: KEIN TREFFER**

*Im Bestand nichts unter diesem Stichwort gefunden.*

**Anzeigename:** _(offen)_  **Aliase:** _(offen)_  **Notiz:** _(offen)_

### `erbsen`
Suche liefert:
1. `G760400` Erbse reif
2. `H710400` Erbsenmehl
3. `H720400` Kichererbsenmehl

Im Bestand (nach Gewicht):
| Code | Gew | Zub | name_de |
|---|---|---|---|
| `H710400` | 780 | 400 | Erbsenmehl |
| `H720400` | 730 | 400 | Kichererbsenmehl |
| `G992100` | 660 | 100 | Gemüsemischung Erbsen-Karotten, roh |
| `G992162` | 660 | 162 | Gemüsemischung Erbsen-Karotten, gebacken |
| `G992152` | 660 | 152 | Gemüsemischung Erbsen-Karotten, gedünstet |
| `G992200` | 660 | 200 | Gemüsemischung Erbsen-Karotten, tiefgefroren |

**Anzeigename:** _(offen)_  **Aliase:** _(offen)_  **Notiz:** _(offen)_

### `sojabohnen`
Suche liefert:
1. `H862200` Miso/Sojabohnenpaste
2. `H620100` Sojabohnensprossen/Sojabohnenkeimlinge, roh
3. `H620902` Sojabohnensprossen/Sojabohnenkeimlinge, Konser

Im Bestand (nach Gewicht):
| Code | Gew | Zub | name_de |
|---|---|---|---|
| `H862200` | 650 | 200 | Miso/Sojabohnenpaste |
| `H620100` | 650 | 100 | Sojabohnensprossen/Sojabohnenkeimlinge, roh |
| `H620902` | 570 | 902 | Sojabohnensprossen/Sojabohnenkeimlinge, Konserve, |
| `X574512` | 0 | 512 | Sojabohnen (Edamame) gedünstet (mit Fett und Salz) |

**Anzeigename:** _(offen)_  **Aliase:** _(offen)_  **Notiz:** _(offen)_

### `edamame`
Suche liefert:
1. `G750100` Sojabohne unreif (Edamame) roh
2. `G750902` Sojabohne unreif (Edamame) Konserve, abgetropf
3. `X574512` Sojabohnen (Edamame) gedünstet (mit Fett und S

Im Bestand (nach Gewicht):
| Code | Gew | Zub | name_de |
|---|---|---|---|
| `G750100` | 660 | 100 | Sojabohne unreif (Edamame) roh |
| `G750902` | 580 | 902 | Sojabohne unreif (Edamame) Konserve, abgetropft |
| `X574512` | 0 | 512 | Sojabohnen (Edamame) gedünstet (mit Fett und Salz) |

**Anzeigename:** _(offen)_  **Aliase:** _(offen)_  **Notiz:** _(offen)_


## Kohlenhydrate — Reis und Getreide

### `reis`
Suche liefert:
1. `C352000` Reis poliert, roh
2. `C356000` Reis Grieß
3. `C457000` Reis Kleie

Im Bestand (nach Gewicht):
| Code | Gew | Zub | name_de |
|---|---|---|---|
| `C352000` | 900 | 000 | Reis poliert, roh |
| `C453000` | 700 | 000 | Reis Mehl |
| `C457000` | 700 | 000 | Reis Kleie |
| `C356000` | 700 | 000 | Reis Grieß |
| `C456000` | 700 | 000 | Reis Stärke |
| `C353100` | 700 | 100 | Wildreis roh |

**Anzeigename:** _(offen)_  **Aliase:** _(offen)_  **Notiz:** _(offen)_

### `basmatireis`
**Suche: KEIN TREFFER**

*Im Bestand nichts unter diesem Stichwort gefunden.*

**Anzeigename:** _(offen)_  **Aliase:** _(offen)_  **Notiz:** _(offen)_

### `jasminreis`
**Suche: KEIN TREFFER**

*Im Bestand nichts unter diesem Stichwort gefunden.*

**Anzeigename:** _(offen)_  **Aliase:** _(offen)_  **Notiz:** _(offen)_

### `naturreis`
**Suche: KEIN TREFFER**

Im Bestand (nach Gewicht):
| Code | Gew | Zub | name_de |
|---|---|---|---|
| `M820100` | 660 | 100 | Frischkäsezubereitung Natur < 10 % Fett i. Tr. |
| `M710700` | 660 | 700 | Frischkäsezubereitung Natur, mind. 50 % Fett i. Tr |
| `M710800` | 660 | 800 | Frischkäsezubereitung Natur, mind. 60 % Fett i. Tr |
| `M820200` | 660 | 200 | Frischkäsezubereitung Natur, mind. 10 % Fett i. Tr |
| `M820600` | 660 | 600 | Frischkäsezubereitung Natur, mind. 45 % Fett i. Tr |
| `M820500` | 660 | 500 | Frischkäsezubereitung Natur, mind. 40 % Fett i. Tr |

**Anzeigename:** _(offen)_  **Aliase:** _(offen)_  **Notiz:** _(offen)_

### `vollkornreis`
**Suche: KEIN TREFFER**

Im Bestand (nach Gewicht):
| Code | Gew | Zub | name_de |
|---|---|---|---|
| `C240000` | 700 | 000 | Emmer Vollkornmehl |
| `C221000` | 700 | 000 | Roggen Vollkornmehl |
| `C235000` | 700 | 000 | Dinkel Vollkornmehl |
| `C211000` | 700 | 000 | Weizen Vollkornmehl |
| `C241000` | 700 | 000 | Einkorn Vollkornmehl |
| `C235100` | 700 | 100 | Dinkel Vollkornschrot |

**Anzeigename:** _(offen)_  **Aliase:** _(offen)_  **Notiz:** _(offen)_

### `sushireis`
Suche liefert:
1. `X8A1100` Sushi-Reis (Grundrezept)

Im Bestand (nach Gewicht):
| Code | Gew | Zub | name_de |
|---|---|---|---|
| `R912000` | 280 | 000 | Sushi Ingwer (Gari) Konserve |
| `Y627112` | 0 | 112 | Sushi mit Lachs |
| `X8A1100` | 0 | 100 | Sushi-Reis (Grundrezept) |
| `X8A1090` | 0 | 090 | Sushi vegan, gefüllt mit Gemüse |

**Anzeigename:** _(offen)_  **Aliase:** _(offen)_  **Notiz:** _(offen)_

### `klebreis`
**Suche: KEIN TREFFER**

Im Bestand (nach Gewicht):
| Code | Gew | Zub | name_de |
|---|---|---|---|
| `C551000` | 870 | 000 | Weizenkleber/Weizengluten |

**Anzeigename:** _(offen)_  **Aliase:** _(offen)_  **Notiz:** _(offen)_

### `parboiled reis`
Suche liefert:
1. `C359042` Reis parboiled, poliert, geschmort ohne Fett
2. `C359000` Reis parboiled, poliert, roh
3. `C359032` Reis parboiled, poliert, gekocht

Im Bestand (nach Gewicht):
| Code | Gew | Zub | name_de |
|---|---|---|---|
| `C359000` | 700 | 000 | Reis parboiled, poliert, roh |
| `C359042` | 700 | 042 | Reis parboiled, poliert, geschmort ohne Fett |
| `C359032` | 550 | 032 | Reis parboiled, poliert, gekocht |
| `C359082` | 550 | 082 | Reis parboiled, poliert, gekocht, gebraten ohne Fe |

**Anzeigename:** _(offen)_  **Aliase:** _(offen)_  **Notiz:** _(offen)_

### `wildreis`
Suche liefert:
1. `C352000` Reis poliert, roh
2. `C359000` Reis parboiled, poliert, roh
3. `C351000` Reis unpoliert, roh

Im Bestand (nach Gewicht):
| Code | Gew | Zub | name_de |
|---|---|---|---|
| `T417600` | 830 | 600 | Wildlachs geräuchert |
| `T417400` | 780 | 400 | Wildlachs gesalzen |
| `C353100` | 700 | 100 | Wildreis roh |
| `T417100` | 700 | 100 | Wildlachs roh |
| `T417152` | 700 | 152 | Wildlachs gedünstet |
| `T417200` | 700 | 200 | Wildlachs tiefgefroren |

**Anzeigename:** _(offen)_  **Aliase:** _(offen)_  **Notiz:** _(offen)_

### `milchreis`
Suche liefert:
1. `C532100` Vollmilchschokolade mit Puffreis und Crispies
2. `S532000` Milchschokolade mit Knusperreis
3. `X810713` Apfelreis mit Milch 3,5 % Fett

Im Bestand (nach Gewicht):
| Code | Gew | Zub | name_de |
|---|---|---|---|
| `M884000` | 830 | 000 | Magermilchpulver |
| `M730100` | 830 | 100 | Sauermilchkäse < 10 % Fett i. Tr. |
| `M886000` | 780 | 000 | Buttermilchpulver |
| `M882000` | 740 | 000 | Vollmilchpulver |
| `M881000` | 740 | 000 | Milchpulver mit hohem Fettgehalt (Sahnepulver, Rah |
| `C557000` | 700 | 000 | Fleischersatz gluten-, milch- und sojahaltig |

**Anzeigename:** _(offen)_  **Aliase:** _(offen)_  **Notiz:** _(offen)_

### `haferflocken`
Suche liefert:
1. `C133000` Hafer Flocken
2. `C133032` Hafer Flocken, gekocht
3. `D701700` Haferflocken-Nussplätzchen

Im Bestand (nach Gewicht):
| Code | Gew | Zub | name_de |
|---|---|---|---|
| `D701600` | 340 | 600 | Haferflockenplätzchen |
| `D701700` | 340 | 700 | Haferflocken-Nussplätzchen |
| `Y823143` | 0 | 143 | Haferflockenauflauf mit Kakao |
| `X952133` | 0 | 133 | Haferflockenbrei gesüßt, mit Butter und Ei |
| `X454663` | 0 | 663 | Haferflockensuppe geröstet, mit Gemüsebrühe |
| `X475243` | 0 | 243 | Milchsuppe gesüßt, gebunden mit Haferflocken |

**Anzeigename:** _(offen)_  **Aliase:** _(offen)_  **Notiz:** _(offen)_

### `quinoa`
Suche liefert:
1. `C118100` Quinoa tricolore, roh
2. `C118000` Quinoa weiß, roh
3. `C530200` Quinoa gepufft, ungesüßt

Im Bestand (nach Gewicht):
| Code | Gew | Zub | name_de |
|---|---|---|---|
| `C118000` | 700 | 000 | Quinoa weiß, roh |
| `C118100` | 700 | 100 | Quinoa tricolore, roh |
| `C530200` | 600 | 200 | Quinoa gepufft, ungesüßt |
| `C118032` | 550 | 032 | Quinoa weiß, gekocht |
| `C118122` | 550 | 122 | Quinoa tricolore, gekocht |

**Anzeigename:** _(offen)_  **Aliase:** _(offen)_  **Notiz:** _(offen)_

### `couscous`
Suche liefert:
1. `C119200` Couscous (Hartweizen) roh
2. `C119232` Couscous (Hartweizen) gekocht
3. `X992163` Couscous (mit Fett und Salz)

Im Bestand (nach Gewicht):
| Code | Gew | Zub | name_de |
|---|---|---|---|
| `C119200` | 700 | 200 | Couscous (Hartweizen) roh |
| `C119232` | 550 | 232 | Couscous (Hartweizen) gekocht |
| `X992133` | 0 | 133 | Couscous mit Butter |
| `X992163` | 0 | 163 | Couscous (mit Fett und Salz) |
| `X9A1000` | 0 | 000 | Couscous gebraten mit Gemüse |

**Anzeigename:** _(offen)_  **Aliase:** _(offen)_  **Notiz:** _(offen)_

### `bulgur`
Suche liefert:
1. `C119100` Bulgur (Hartweizen) roh
2. `C119132` Bulgur (Hartweizen) gekocht
3. `X987612` Bulgur gekocht (mit Fett und Salz)

Im Bestand (nach Gewicht):
| Code | Gew | Zub | name_de |
|---|---|---|---|
| `C119100` | 700 | 100 | Bulgur (Hartweizen) roh |
| `C119132` | 550 | 132 | Bulgur (Hartweizen) gekocht |
| `X987612` | 0 | 612 | Bulgur gekocht (mit Fett und Salz) |
| `X553712` | 0 | 712 | Paprikaschoten gebacken, mit Bulgur-Gemüsefüllung |

**Anzeigename:** _(offen)_  **Aliase:** _(offen)_  **Notiz:** _(offen)_

### `hirse`
Suche liefert:
1. `C433100` Braunhirse Mehl
2. `C333100` Hirse Flocken
3. `C433000` Hirse Mehl

Im Bestand (nach Gewicht):
| Code | Gew | Zub | name_de |
|---|---|---|---|
| `C332000` | 700 | 000 | Hirse roh |
| `C433000` | 700 | 000 | Hirse Mehl |
| `C432000` | 700 | 000 | Hirse Schrot |
| `C333100` | 700 | 100 | Hirse Flocken |
| `C433100` | 700 | 100 | Braunhirse Mehl |
| `C334032` | 550 | 032 | Hirse gekocht |

**Anzeigename:** _(offen)_  **Aliase:** _(offen)_  **Notiz:** _(offen)_

### `buchweizen`
Suche liefert:
1. `C326000` Buchweizen Grieß
2. `C327000` Buchweizen Grütze
3. `C424000` Buchweizen Mehl

Im Bestand (nach Gewicht):
| Code | Gew | Zub | name_de |
|---|---|---|---|
| `C322000` | 700 | 000 | Buchweizen roh |
| `C424000` | 700 | 000 | Buchweizen Mehl |
| `C326000` | 700 | 000 | Buchweizen Grieß |
| `C327000` | 700 | 000 | Buchweizen Grütze |
| `C422000` | 700 | 000 | Buchweizen Schrot |
| `C421000` | 700 | 000 | Buchweizen Vollkornmehl |

**Anzeigename:** _(offen)_  **Aliase:** _(offen)_  **Notiz:** _(offen)_

### `polenta`
Suche liefert:
1. `C526000` Polenta (Maisgrieß mit Wasser, Fett und Salz)
2. `C526062` Polenta (Maisgrieß mit Wasser, Fett und Salz)
3. `C526082` Polenta (Maisgrieß mit Wasser, Fett und Salz)

Im Bestand (nach Gewicht):
| Code | Gew | Zub | name_de |
|---|---|---|---|
| `C526000` | 550 | 000 | Polenta (Maisgrieß mit Wasser, Fett und Salz) geko |
| `C526062` | 550 | 062 | Polenta (Maisgrieß mit Wasser, Fett und Salz) geko |
| `C526082` | 550 | 082 | Polenta (Maisgrieß mit Wasser, Fett und Salz) geko |
| `X9A2050` | 0 | 050 | Polenta (Maisbrei mit Wasser, Rapsöl und Salz) gek |
| `X986143` | 0 | 143 | Polenta (Maisbrei zubereitet mit Wasser, Rapsöl un |

**Anzeigename:** _(offen)_  **Aliase:** _(offen)_  **Notiz:** _(offen)_


## Kohlenhydrate — Beilagen und Brot

### `kartoffeln`
Suche liefert:
1. `E605000` Kartoffel-Schupfnudeln roh
2. `K420192` Batate/Süßkartoffel, frittiert, gesalzen
3. `K420162` Batate/Süßkartoffel, gebacken

Im Bestand (nach Gewicht):
| Code | Gew | Zub | name_de |
|---|---|---|---|
| `K240400` | 550 | 400 | Kartoffelkloß (aus rohen Kartoffeln) Trockenproduk |
| `K240500` | 400 | 500 | Kartoffelkloß (aus gekochten Kartoffeln) Trockenpr |
| `X641812` | 0 | 812 | Butterkartoffeln |
| `X613143` | 0 | 143 | Bechamelkartoffeln |
| `X651543` | 0 | 543 | Bratkartoffeln gesüßt |
| `X651912` | 0 | 912 | Bratkartoffeln mit Ei |

**Anzeigename:** _(offen)_  **Aliase:** _(offen)_  **Notiz:** _(offen)_

### `suesskartoffel`
Suche liefert:
1. `K420192` Batate/Süßkartoffel, frittiert, gesalzen
2. `K420162` Batate/Süßkartoffel, gebacken
3. `K420100` Batate/Süßkartoffel, roh

Im Bestand (nach Gewicht):
| Code | Gew | Zub | name_de |
|---|---|---|---|
| `K420100` | 550 | 100 | Batate/Süßkartoffel, roh |
| `K420162` | 550 | 162 | Batate/Süßkartoffel, gebacken |
| `K420192` | 550 | 192 | Batate/Süßkartoffel, frittiert, gesalzen |
| `K420132` | 400 | 132 | Batate/Süßkartoffel, gekocht |
| `K420182` | 400 | 182 | Batate/Süßkartoffel, gebraten ohne Fett (Pfanne) |
| `X699312` | 0 | 312 | Süßkartoffeln gedünstet (mit Fett und Salz) |

**Anzeigename:** _(offen)_  **Aliase:** _(offen)_  **Notiz:** _(offen)_

### `nudeln`
Suche liefert:
1. `C559000` Reisnudeln roh
2. `E605000` Kartoffel-Schupfnudeln roh
3. `E605300` Schupfnudeln eifrei, roh

Im Bestand (nach Gewicht):
| Code | Gew | Zub | name_de |
|---|---|---|---|
| `C559000` | 700 | 000 | Reisnudeln roh |
| `E605300` | 680 | 300 | Schupfnudeln eifrei, roh |
| `E605000` | 680 | 000 | Kartoffel-Schupfnudeln roh |
| `E605200` | 680 | 200 | Schupfnudeln schwäbisch, roh |
| `H030400` | 650 | 400 | Glasnudeln aus Mungbohnenstärke, roh |
| `C559032` | 550 | 032 | Reisnudeln gekocht |

**Anzeigename:** _(offen)_  **Aliase:** _(offen)_  **Notiz:** _(offen)_

### `vollkornnudeln`
**Suche: KEIN TREFFER**

Im Bestand (nach Gewicht):
| Code | Gew | Zub | name_de |
|---|---|---|---|
| `C240000` | 700 | 000 | Emmer Vollkornmehl |
| `C221000` | 700 | 000 | Roggen Vollkornmehl |
| `C235000` | 700 | 000 | Dinkel Vollkornmehl |
| `C211000` | 700 | 000 | Weizen Vollkornmehl |
| `C241000` | 700 | 000 | Einkorn Vollkornmehl |
| `C235100` | 700 | 100 | Dinkel Vollkornschrot |

**Anzeigename:** _(offen)_  **Aliase:** _(offen)_  **Notiz:** _(offen)_

### `spaghetti`
Suche liefert:
1. `X7A1020` Spaghetti Aglio e olio (Teigwaren eifrei, mit

Im Bestand (nach Gewicht):
| Code | Gew | Zub | name_de |
|---|---|---|---|
| `X7A1020` | 0 | 020 | Spaghetti Aglio e olio (Teigwaren eifrei, mit Knob |

**Anzeigename:** _(offen)_  **Aliase:** _(offen)_  **Notiz:** _(offen)_

### `vollkornbrot`
Suche liefert:
1. `B6A5100` Dinkelvollkornknäckebrot mit Ölsamen
2. `B6A5200` Dinkelvollkornknäckebrot mit Ölsamen und Hartk
3. `B131000` Hafervollkornbrot

Im Bestand (nach Gewicht):
| Code | Gew | Zub | name_de |
|---|---|---|---|
| `C240000` | 700 | 000 | Emmer Vollkornmehl |
| `C221000` | 700 | 000 | Roggen Vollkornmehl |
| `C235000` | 700 | 000 | Dinkel Vollkornmehl |
| `C211000` | 700 | 000 | Weizen Vollkornmehl |
| `C241000` | 700 | 000 | Einkorn Vollkornmehl |
| `C235100` | 700 | 100 | Dinkel Vollkornschrot |

**Anzeigename:** _(offen)_  **Aliase:** _(offen)_  **Notiz:** _(offen)_

### `dinkelbrot`
Suche liefert:
1. `B710500` Dinkelbrot
2. `B710600` Dinkelbrot mit Kürbiskernen
3. `B710700` Dinkelbrot mit Nüssen

Im Bestand (nach Gewicht):
| Code | Gew | Zub | name_de |
|---|---|---|---|
| `C238000` | 700 | 000 | Dinkel Grieß |
| `C237000` | 700 | 000 | Dinkel Kleie |
| `C236100` | 700 | 100 | Dinkel Flocken |
| `C235000` | 700 | 000 | Dinkel Vollkornmehl |
| `C234100` | 700 | 100 | Dinkel Mehl, Type 812 |
| `C234000` | 700 | 000 | Dinkel Mehl, Type 630 |

**Anzeigename:** _(offen)_  **Aliase:** _(offen)_  **Notiz:** _(offen)_

### `roggenbrot`
Suche liefert:
1. `B221000` Roggenbrot
2. `B227300` Roggenbrot mit Buttermilch
3. `B226700` Roggenbrot mit Kürbiskernen

Im Bestand (nach Gewicht):
| Code | Gew | Zub | name_de |
|---|---|---|---|
| `C126000` | 700 | 000 | Roggen Grieß |
| `C123000` | 700 | 000 | Roggen Flocken |
| `C221000` | 700 | 000 | Roggen Vollkornmehl |
| `C223200` | 700 | 200 | Roggen Mehl, Type 997 |
| `C223100` | 700 | 100 | Roggen Mehl, Type 815 |
| `C221100` | 700 | 100 | Roggen Vollkornschrot |

**Anzeigename:** _(offen)_  **Aliase:** _(offen)_  **Notiz:** _(offen)_

### `knaeckebrot`
Suche liefert:
1. `B6A5100` Dinkelvollkornknäckebrot mit Ölsamen
2. `B6A5200` Dinkelvollkornknäckebrot mit Ölsamen und Hartk
3. `B6A6000` Knäckebrot glutenfrei, laktosefrei

Im Bestand (nach Gewicht):
| Code | Gew | Zub | name_de |
|---|---|---|---|
| `B6A2000` | 520 | 000 | Roggenknäckebrot |
| `B6A2100` | 520 | 100 | Roggenvollkornknäckebrot |
| `B6A4000` | 520 | 000 | Mehrkornvollkornknäckebrot |
| `B6A1000` | 520 | 000 | Weizenknäckebrot mit Sesam |
| `B6A6000` | 520 | 000 | Knäckebrot glutenfrei, laktosefrei |
| `B6A2300` | 520 | 300 | Roggenvollkornknäckebrot mit Milch |

**Anzeigename:** _(offen)_  **Aliase:** _(offen)_  **Notiz:** _(offen)_

### `reiswaffeln`
Suche liefert:
1. `C532800` Reiswaffeln gesalzen
2. `C532900` Reiswaffeln schokoliert
3. `C532700` Reiswaffeln ungesalzen

Im Bestand (nach Gewicht):
| Code | Gew | Zub | name_de |
|---|---|---|---|
| `C532800` | 700 | 800 | Reiswaffeln gesalzen |
| `C532700` | 700 | 700 | Reiswaffeln ungesalzen |
| `C532900` | 700 | 900 | Reiswaffeln schokoliert |

**Anzeigename:** _(offen)_  **Aliase:** _(offen)_  **Notiz:** _(offen)_

### `mais`
Suche liefert:
1. `C346000` Mais Grieß
2. `C347000` Mais Grütze
3. `C443000` Mais Mehl

Im Bestand (nach Gewicht):
| Code | Gew | Zub | name_de |
|---|---|---|---|
| `C341000` | 700 | 000 | Mais roh |
| `C443000` | 700 | 000 | Mais Mehl |
| `C346000` | 700 | 000 | Mais Grieß |
| `C446000` | 700 | 000 | Mais Stärke |
| `C347000` | 700 | 000 | Mais Grütze |
| `C533100` | 700 | 100 | Maiswaffeln gesalzen |

**Anzeigename:** _(offen)_  **Aliase:** _(offen)_  **Notiz:** _(offen)_


## Gemuese

### `brokkoli`
Suche liefert:
1. `G312162` Broccoli gebacken
2. `G312152` Broccoli gedünstet
3. `G312100` Broccoli roh

*Im Bestand nichts unter diesem Stichwort gefunden.*

**Anzeigename:** _(offen)_  **Aliase:** _(offen)_  **Notiz:** _(offen)_

### `spinat`
Suche liefert:
1. `E609100` Eierteigwaren Tortelloni (Ricotta-Spinat-Füllu
2. `G210600` Gemüsesaft aus Spinat
3. `G213152` Neuseeländer Spinat gedünstet

Im Bestand (nach Gewicht):
| Code | Gew | Zub | name_de |
|---|---|---|---|
| `E609100` | 680 | 100 | Eierteigwaren Tortelloni (Ricotta-Spinat-Füllung) |
| `G211100` | 660 | 100 | Spinat roh |
| `G211162` | 660 | 162 | Spinat gebacken |
| `G211152` | 660 | 152 | Spinat gedünstet |
| `G211200` | 660 | 200 | Spinat tiefgefroren |
| `G210600` | 660 | 600 | Gemüsesaft aus Spinat |

**Anzeigename:** _(offen)_  **Aliase:** _(offen)_  **Notiz:** _(offen)_

### `zucchini`
Suche liefert:
1. `G582162` Zucchini gebacken
2. `G582152` Zucchini gedünstet
3. `G582172` Zucchini gegrillt

Im Bestand (nach Gewicht):
| Code | Gew | Zub | name_de |
|---|---|---|---|
| `G582100` | 660 | 100 | Zucchini roh |
| `G582172` | 660 | 172 | Zucchini gegrillt |
| `G582162` | 660 | 162 | Zucchini gebacken |
| `G582152` | 660 | 152 | Zucchini gedünstet |
| `G582142` | 660 | 142 | Zucchini geschmort ohne Fett |
| `G582802` | 660 | 802 | Zucchini gesäuert, abgetropft |

**Anzeigename:** _(offen)_  **Aliase:** _(offen)_  **Notiz:** _(offen)_

### `paprika`
Suche liefert:
1. `G542162` Gemüsepaprika gelb, gebacken
2. `G542152` Gemüsepaprika gelb, gedünstet
3. `G542172` Gemüsepaprika gelb, gegrillt

Im Bestand (nach Gewicht):
| Code | Gew | Zub | name_de |
|---|---|---|---|
| `G543100` | 660 | 100 | Gemüsepaprika rot, roh |
| `G541100` | 660 | 100 | Gemüsepaprika grün, roh |
| `G542100` | 660 | 100 | Gemüsepaprika gelb, roh |
| `G543072` | 660 | 072 | Gemüsepaprika rot, gegrillt |
| `G543162` | 660 | 162 | Gemüsepaprika rot, gebacken |
| `G541072` | 660 | 072 | Gemüsepaprika grün, gegrillt |

**Anzeigename:** _(offen)_  **Aliase:** _(offen)_  **Notiz:** _(offen)_

### `tomaten`
Suche liefert:
1. `G560600` Gemüsesaft aus Tomate, mit Salz
2. `G561162` Tomate gebacken
3. `G561152` Tomate gedünstet

Im Bestand (nach Gewicht):
| Code | Gew | Zub | name_de |
|---|---|---|---|
| `T824900` | 620 | 900 | Lachs in Tomatensauce, Konserve |
| `T831900` | 620 | 900 | Makrele in Tomatensauce Konserve |
| `T817900` | 620 | 900 | Sardine in Tomatensauce, Konserve |
| `T813900` | 620 | 900 | Thunfisch in Tomatensauce, Konserve |
| `T832900` | 620 | 900 | Miesmuschel in Tomatensauce Konserve |
| `T822900` | 620 | 900 | Heringsfilet in Tomatencreme/Tomatensauce, Konserv |

**Anzeigename:** _(offen)_  **Aliase:** _(offen)_  **Notiz:** _(offen)_

### `gurke`
Suche liefert:
1. `G520600` Gemüsesaft aus Gurke
2. `G520062` Gurke gebacken
3. `G520152` Gurke gedünstet

Im Bestand (nach Gewicht):
| Code | Gew | Zub | name_de |
|---|---|---|---|
| `G520100` | 660 | 100 | Gurke roh |
| `G520062` | 660 | 062 | Gurke gebacken |
| `G520152` | 660 | 152 | Gurke gedünstet |
| `G520600` | 660 | 600 | Gemüsesaft aus Gurke |
| `G520042` | 660 | 042 | Gurke geschmort ohne Fett |
| `G891202` | 660 | 202 | Senfgurke gesäuert, abgetropft |

**Anzeigename:** _(offen)_  **Aliase:** _(offen)_  **Notiz:** _(offen)_

### `karotten`
Suche liefert:
1. `G992162` Gemüsemischung Erbsen-Karotten, gebacken
2. `G992152` Gemüsemischung Erbsen-Karotten, gedünstet
3. `G992100` Gemüsemischung Erbsen-Karotten, roh

Im Bestand (nach Gewicht):
| Code | Gew | Zub | name_de |
|---|---|---|---|
| `G992100` | 660 | 100 | Gemüsemischung Erbsen-Karotten, roh |
| `G992162` | 660 | 162 | Gemüsemischung Erbsen-Karotten, gebacken |
| `G992152` | 660 | 152 | Gemüsemischung Erbsen-Karotten, gedünstet |
| `G992200` | 660 | 200 | Gemüsemischung Erbsen-Karotten, tiefgefroren |
| `G992262` | 660 | 262 | Gemüsemischung Erbsen-Karotten, tiefgefroren, geba |
| `G992252` | 660 | 252 | Gemüsemischung Erbsen-Karotten, tiefgefroren, gedü |

**Anzeigename:** _(offen)_  **Aliase:** _(offen)_  **Notiz:** _(offen)_

### `champignons`
Suche liefert:
1. `K701400` Champignon getrocknet
2. `K701162` Champignon gebacken
3. `K701152` Champignon gedünstet

Im Bestand (nach Gewicht):
| Code | Gew | Zub | name_de |
|---|---|---|---|
| `W395100` | 440 | 100 | Leberpastete mit Champignons |
| `W982600` | 440 | 600 | Getrüffelte Zungenpastete mit Champignons und Mürb |
| `Y2A1010` | 20 | 010 | Kalbfleischpudding mit Lachsschinken und Champigno |
| `Y720662` | 0 | 662 | Rührei gebraten mit Champignons |
| `X822312` | 0 | 312 | Grünkernrisotto mit Champignons |
| `X511463` | 0 | 463 | Champignons gefüllt, überbacken |

**Anzeigename:** _(offen)_  **Aliase:** _(offen)_  **Notiz:** _(offen)_

### `gruene bohnen`
Suche liefert:
1. `G710162` Bohne grün, gebacken
2. `G710152` Bohne grün, gedünstet
3. `G710802` Bohne grün, gesäuert, abgetropft

Im Bestand (nach Gewicht):
| Code | Gew | Zub | name_de |
|---|---|---|---|
| `X5A8000` | 0 | 000 | Grüne Bohnen gekocht |
| `X571143` | 0 | 143 | Grüne Bohnen gedünstet |
| `X571163` | 0 | 163 | Grüne Bohnen gekocht, in Butter geschwenkt |
| `X571153` | 0 | 153 | Grüne Bohnen gekocht, in Grundsauce hell/weiß |
| `X171242` | 0 | 242 | Grüne-Bohnen-Salat (gegart) mit Essigmarinade |
| `X465553` | 0 | 553 | Grüne-Bohnen-Suppe mit Gemüsebrühe und Kartoffeln |

**Anzeigename:** _(offen)_  **Aliase:** _(offen)_  **Notiz:** _(offen)_

### `rosenkohl`
Suche liefert:
1. `G332162` Rosenkohl gebacken
2. `G332152` Rosenkohl gedünstet
3. `G332100` Rosenkohl roh

Im Bestand (nach Gewicht):
| Code | Gew | Zub | name_de |
|---|---|---|---|
| `G332100` | 660 | 100 | Rosenkohl roh |
| `G332162` | 660 | 162 | Rosenkohl gebacken |
| `G332152` | 660 | 152 | Rosenkohl gedünstet |
| `G332200` | 660 | 200 | Rosenkohl tiefgefroren |
| `G332262` | 660 | 262 | Rosenkohl tiefgefroren, gebacken |
| `G332252` | 660 | 252 | Rosenkohl tiefgefroren, gedünstet |

**Anzeigename:** _(offen)_  **Aliase:** _(offen)_  **Notiz:** _(offen)_

### `blumenkohl`
Suche liefert:
1. `G311162` Blumenkohl gebacken
2. `G311142` Blumenkohl gedämpft
3. `G311152` Blumenkohl gedünstet

Im Bestand (nach Gewicht):
| Code | Gew | Zub | name_de |
|---|---|---|---|
| `G311100` | 660 | 100 | Blumenkohl roh |
| `G311142` | 660 | 142 | Blumenkohl gedämpft |
| `G311162` | 660 | 162 | Blumenkohl gebacken |
| `G311152` | 660 | 152 | Blumenkohl gedünstet |
| `G311200` | 660 | 200 | Blumenkohl tiefgefroren |
| `G311802` | 660 | 802 | Blumenkohl gesäuert, abgetropft |

**Anzeigename:** _(offen)_  **Aliase:** _(offen)_  **Notiz:** _(offen)_

### `weisskohl`
Suche liefert:
1. `M741600` Ricotta, Molkeneiweißkäse, mind. 45 % Fett i.
2. `G342162` Weißkohl gebacken
3. `G342152` Weißkohl gedünstet

Im Bestand (nach Gewicht):
| Code | Gew | Zub | name_de |
|---|---|---|---|
| `G342100` | 660 | 100 | Weißkohl roh |
| `G342162` | 660 | 162 | Weißkohl gebacken |
| `G342152` | 660 | 152 | Weißkohl gedünstet |
| `G342142` | 660 | 142 | Weißkohl geschmort ohne Fett |
| `G342132` | 510 | 132 | Weißkohl gekocht |
| `G342182` | 510 | 182 | Weißkohl gebraten ohne Fett (Pfanne) |

**Anzeigename:** _(offen)_  **Aliase:** _(offen)_  **Notiz:** _(offen)_

### `zwiebel`
Suche liefert:
1. `G486162` Frühlingszwiebel/Lauchzwiebel (ohne Laub) geba
2. `G486152` Frühlingszwiebel/Lauchzwiebel (ohne Laub) gedü
3. `G486142` Frühlingszwiebel/Lauchzwiebel (ohne Laub) gesc

Im Bestand (nach Gewicht):
| Code | Gew | Zub | name_de |
|---|---|---|---|
| `G484100` | 660 | 100 | Perlzwiebel roh |
| `G480100` | 660 | 100 | Speisezwiebel roh |
| `G488100` | 660 | 100 | Silberzwiebel roh |
| `G480500` | 660 | 500 | Speisezwiebel Pulver |
| `G484162` | 660 | 162 | Perlzwiebel gebacken |
| `G484152` | 660 | 152 | Perlzwiebel gedünstet |

**Anzeigename:** _(offen)_  **Aliase:** _(offen)_  **Notiz:** _(offen)_

### `knoblauch`
Suche liefert:
1. `G490162` Knoblauch gebacken
2. `G490152` Knoblauch gedünstet
3. `G491802` Knoblauch gesäuert, abgetropft

Im Bestand (nach Gewicht):
| Code | Gew | Zub | name_de |
|---|---|---|---|
| `G490100` | 660 | 100 | Knoblauch roh |
| `G490500` | 660 | 500 | Knoblauch Pulver |
| `G490162` | 660 | 162 | Knoblauch gebacken |
| `G490152` | 660 | 152 | Knoblauch gedünstet |
| `G490400` | 660 | 400 | Knoblauch getrocknet |
| `G490200` | 660 | 200 | Knoblauch tiefgefroren |

**Anzeigename:** _(offen)_  **Aliase:** _(offen)_  **Notiz:** _(offen)_

### `aubergine`
Suche liefert:
1. `G510162` Aubergine gebacken
2. `G510152` Aubergine gedünstet
3. `G510172` Aubergine gegrillt

Im Bestand (nach Gewicht):
| Code | Gew | Zub | name_de |
|---|---|---|---|
| `G510100` | 660 | 100 | Aubergine roh |
| `G510172` | 660 | 172 | Aubergine gegrillt |
| `G510162` | 660 | 162 | Aubergine gebacken |
| `G510152` | 660 | 152 | Aubergine gedünstet |
| `G510142` | 660 | 142 | Aubergine geschmort ohne Fett |
| `G510702` | 580 | 702 | Aubergine gegrillt, in Öl, Konserve, abgetropft |

**Anzeigename:** _(offen)_  **Aliase:** _(offen)_  **Notiz:** _(offen)_

### `kuerbis`
Suche liefert:
1. `H310100` Kürbiskern
2. `H310600` Kürbiskern geröstet ohne Fett
3. `G581802` Kürbis gesäuert, abgetropft

Im Bestand (nach Gewicht):
| Code | Gew | Zub | name_de |
|---|---|---|---|
| `H310100` | 770 | 100 | Kürbiskern |
| `H310600` | 770 | 600 | Kürbiskern geröstet ohne Fett |
| `G581802` | 660 | 802 | Kürbis gesäuert, abgetropft |
| `G581100` | 660 | 100 | Kürbis Pumpkin (C. pepo) roh |
| `G581000` | 660 | 000 | Kürbis Hokkaido (C. maxima) roh |
| `G581162` | 660 | 162 | Kürbis Pumpkin (C. pepo) gebacken |

**Anzeigename:** _(offen)_  **Aliase:** _(offen)_  **Notiz:** _(offen)_

### `spargel`
Suche liefert:
1. `G450162` Spargel gebacken
2. `G450142` Spargel gedämpft
3. `G450152` Spargel gedünstet

Im Bestand (nach Gewicht):
| Code | Gew | Zub | name_de |
|---|---|---|---|
| `G450100` | 660 | 100 | Spargel roh |
| `G450162` | 660 | 162 | Spargel gebacken |
| `G450142` | 660 | 142 | Spargel gedämpft |
| `G450152` | 660 | 152 | Spargel gedünstet |
| `G450200` | 660 | 200 | Spargel tiefgefroren |
| `G450242` | 660 | 242 | Spargel tiefgefroren, gedämpft |

**Anzeigename:** _(offen)_  **Aliase:** _(offen)_  **Notiz:** _(offen)_

### `rucola`
Suche liefert:
1. `G130100` Rucola roh
2. `X060130` Baguette-Brötchen mit Parmaschinken, Parmesan,

Im Bestand (nach Gewicht):
| Code | Gew | Zub | name_de |
|---|---|---|---|
| `G130100` | 660 | 100 | Rucola roh |
| `X060130` | 0 | 130 | Baguette-Brötchen mit Parmaschinken, Parmesan, Ruc |

**Anzeigename:** _(offen)_  **Aliase:** _(offen)_  **Notiz:** _(offen)_


## Obst

### `banane`
Suche liefert:
1. `F503400` Banane getrocknet
2. `F503100` Banane roh
3. `F503700` Bananennektar

Im Bestand (nach Gewicht):
| Code | Gew | Zub | name_de |
|---|---|---|---|
| `F503100` | 660 | 100 | Banane roh |
| `F503700` | 660 | 700 | Bananennektar |
| `F545100` | 660 | 100 | Kochbanane roh |
| `F503400` | 660 | 400 | Banane getrocknet |
| `F545162` | 660 | 162 | Kochbanane gebacken |
| `F545152` | 660 | 152 | Kochbanane gedünstet |

**Anzeigename:** _(offen)_  **Aliase:** _(offen)_  **Notiz:** _(offen)_

### `apfel`
Suche liefert:
1. `F110152` Apfel gedünstet
2. `F120152` Apfel geschält, gedünstet
3. `F120400` Apfel geschält, getrocknet

Im Bestand (nach Gewicht):
| Code | Gew | Zub | name_de |
|---|---|---|---|
| `F110600` | 660 | 600 | Apfelsaft |
| `F110100` | 660 | 100 | Apfel roh |
| `F110700` | 660 | 700 | Apfelnektar |
| `F506100` | 660 | 100 | Granatapfel roh |
| `F110152` | 660 | 152 | Apfel gedünstet |
| `F110400` | 660 | 400 | Apfel getrocknet |

**Anzeigename:** _(offen)_  **Aliase:** _(offen)_  **Notiz:** _(offen)_

### `blaubeeren`
Suche liefert:
1. `F304152` Heidelbeere gedünstet
2. `F304100` Heidelbeere roh
3. `F3A4902` Heidelbeere mit Süßungsmitteln, Konserve, abge

*Im Bestand nichts unter diesem Stichwort gefunden.*

**Anzeigename:** _(offen)_  **Aliase:** _(offen)_  **Notiz:** _(offen)_

### `erdbeeren`
Suche liefert:
1. `F301152` Erdbeere gedünstet
2. `F301400` Erdbeere getrocknet
3. `F301100` Erdbeere roh

Im Bestand (nach Gewicht):
| Code | Gew | Zub | name_de |
|---|---|---|---|
| `Y847650` | 0 | 650 | Erdbeeren gezuckert |
| `Y881510` | 0 | 510 | Quarkspeise mit Erdbeeren |
| `Y872460` | 0 | 460 | Erdbeeren mit Schlagsahne |
| `Y856550` | 0 | 550 | Buttermilchgelee mit Erdbeeren |
| `Y8A4070` | 0 | 070 | Joghurt 1,5 % Fett mit Erdbeeren |
| `Y880050` | 0 | 050 | Quarkspeise einfach, mit Erdbeeren |

**Anzeigename:** _(offen)_  **Aliase:** _(offen)_  **Notiz:** _(offen)_

### `himbeeren`
Suche liefert:
1. `F302152` Himbeere gedünstet
2. `F302400` Himbeere getrocknet
3. `F302100` Himbeere roh

Im Bestand (nach Gewicht):
| Code | Gew | Zub | name_de |
|---|---|---|---|
| `D3A4000` | 340 | 000 | Nussbiskuitrolle/Nussbiskuitroulade, mit Himbeeren |
| `Y847840` | 0 | 840 | Himbeeren gezuckert |
| `Y881610` | 0 | 610 | Quarkspeise mit Himbeeren |

**Anzeigename:** _(offen)_  **Aliase:** _(offen)_  **Notiz:** _(offen)_

### `orange`
Suche liefert:
1. `F603100` Orange roh
2. `F603700` Orangennektar
3. `F614600` Orangennektar mit Süßungsmitteln

Im Bestand (nach Gewicht):
| Code | Gew | Zub | name_de |
|---|---|---|---|
| `F603100` | 660 | 100 | Orange roh |
| `F603600` | 660 | 600 | Orangensaft |
| `F603700` | 660 | 700 | Orangennektar |
| `F614600` | 660 | 600 | Orangennektar mit Süßungsmitteln |
| `N310300` | 400 | 300 | Orangenlimonade |
| `N257000` | 400 | 000 | Fruchtsaftschorle Orange |

**Anzeigename:** _(offen)_  **Aliase:** _(offen)_  **Notiz:** _(offen)_

### `ananas`
Suche liefert:
1. `F501152` Ananas gedünstet
2. `F501400` Ananas getrocknet
3. `F501100` Ananas roh

Im Bestand (nach Gewicht):
| Code | Gew | Zub | name_de |
|---|---|---|---|
| `F501600` | 660 | 600 | Ananassaft |
| `F501100` | 660 | 100 | Ananas roh |
| `F501152` | 660 | 152 | Ananas gedünstet |
| `F501400` | 660 | 400 | Ananas getrocknet |
| `F563100` | 660 | 100 | Feijoa/Ananas-Guave, roh |
| `F5A1902` | 580 | 902 | Ananas in Fruchtsaft, Konserve, abgetropft |

**Anzeigename:** _(offen)_  **Aliase:** _(offen)_  **Notiz:** _(offen)_

### `mango`
Suche liefert:
1. `F516400` Mango getrocknet
2. `F516100` Mango roh
3. `G230162` Mangold gebacken

Im Bestand (nach Gewicht):
| Code | Gew | Zub | name_de |
|---|---|---|---|
| `F516600` | 660 | 600 | Mangosaft |
| `F516100` | 660 | 100 | Mango roh |
| `F516700` | 660 | 700 | Mangonektar |
| `G230100` | 660 | 100 | Mangold roh |
| `F564100` | 660 | 100 | Mangostane roh |
| `F564600` | 660 | 600 | Mangostanesaft |

**Anzeigename:** _(offen)_  **Aliase:** _(offen)_  **Notiz:** _(offen)_

### `kiwi`
Suche liefert:
1. `F514152` Kiwi gedünstet
2. `F514100` Kiwi roh
3. `F514600` Kiwisaft

Im Bestand (nach Gewicht):
| Code | Gew | Zub | name_de |
|---|---|---|---|
| `F514100` | 660 | 100 | Kiwi roh |
| `F514600` | 660 | 600 | Kiwisaft |
| `F514152` | 660 | 152 | Kiwi gedünstet |

**Anzeigename:** _(offen)_  **Aliase:** _(offen)_  **Notiz:** _(offen)_

### `wassermelone`
Suche liefert:
1. `F535100` Wassermelone roh

Im Bestand (nach Gewicht):
| Code | Gew | Zub | name_de |
|---|---|---|---|
| `F535100` | 660 | 100 | Wassermelone roh |

**Anzeigename:** _(offen)_  **Aliase:** _(offen)_  **Notiz:** _(offen)_

### `trauben`
Suche liefert:
1. `F310600` Traubensaft
2. `F317600` Traubensaft angereichert mit Eisen
3. `F311600` Traubensaft rot

Im Bestand (nach Gewicht):
| Code | Gew | Zub | name_de |
|---|---|---|---|
| `F310600` | 660 | 600 | Traubensaft |
| `F311600` | 660 | 600 | Traubensaft rot |
| `F312600` | 660 | 600 | Traubensaft weiß |
| `F317600` | 660 | 600 | Traubensaft angereichert mit Eisen |
| `Q330000` | 460 | 000 | Traubenkernöl |
| `D340200` | 340 | 200 | Traubentorte (Sandmasse) mit Vanillecreme und Klar |

**Anzeigename:** _(offen)_  **Aliase:** _(offen)_  **Notiz:** _(offen)_

### `birne`
Suche liefert:
1. `F130152` Birne gedünstet
2. `F130400` Birne getrocknet
3. `F130100` Birne roh

Im Bestand (nach Gewicht):
| Code | Gew | Zub | name_de |
|---|---|---|---|
| `F130100` | 660 | 100 | Birne roh |
| `F130600` | 660 | 600 | Birnensaft |
| `F130152` | 660 | 152 | Birne gedünstet |
| `F130400` | 660 | 400 | Birne getrocknet |
| `F134902` | 580 | 902 | Birne in Fruchtsaft, Konserve, abgetropft |
| `F133902` | 580 | 902 | Birne mit Süßungsmitteln, Konserve, abgetropft |

**Anzeigename:** _(offen)_  **Aliase:** _(offen)_  **Notiz:** _(offen)_

### `datteln`
Suche liefert:
1. `F504400` Dattel getrocknet
2. `F504100` Dattel roh

*Im Bestand nichts unter diesem Stichwort gefunden.*

**Anzeigename:** _(offen)_  **Aliase:** _(offen)_  **Notiz:** _(offen)_

### `rosinen`
Suche liefert:
1. `F840100` Rosine/Sultanine (Weinbeere getrocknet)
2. `B719000` Rosinenbrot glutenfrei
3. `D461400` Gugelhupf mit Rosinen (Hefeteig)

Im Bestand (nach Gewicht):
| Code | Gew | Zub | name_de |
|---|---|---|---|
| `B719000` | 520 | 000 | Rosinenbrot glutenfrei |
| `D430600` | 340 | 600 | Rosinenkuchen (Rührmasse) |
| `D7A5500` | 340 | 500 | Rosinenbrötchen (Hefeteig) |
| `D461400` | 340 | 400 | Gugelhupf mit Rosinen (Hefeteig) |
| `D752100` | 340 | 100 | Rosinen-Mandel-Schnecken (Hefeteig) |
| `S539700` | 240 | 700 | Vollmilchschokolade mit Rosinen und Haselnüssen |

**Anzeigename:** _(offen)_  **Aliase:** _(offen)_  **Notiz:** _(offen)_


## Fette, Nuesse, Samen

### `avocado`
Suche liefert:
1. `F502100` Avocado roh
2. `X389000` Avocadocreme (Guacamole)
3. `X445813` Avocadocremesuppe

Im Bestand (nach Gewicht):
| Code | Gew | Zub | name_de |
|---|---|---|---|
| `F502100` | 660 | 100 | Avocado roh |
| `X445813` | 0 | 813 | Avocadocremesuppe |
| `X389000` | 0 | 000 | Avocadocreme (Guacamole) |

**Anzeigename:** _(offen)_  **Aliase:** _(offen)_  **Notiz:** _(offen)_

### `mandeln`
Suche liefert:
1. `H220100` Mandel bitter
2. `H210100` Mandel süß
3. `H210200` Mandel süß, blanchiert

Im Bestand (nach Gewicht):
| Code | Gew | Zub | name_de |
|---|---|---|---|
| `H882100` | 650 | 100 | Frischecreme/Streichcreme, Basis Mandeln, vegan |
| `H511900` | 650 | 900 | Oliven grün, gefüllt mit Mandeln, gesäuert, abgetr |
| `D730300` | 340 | 300 | Spritzgebäck mit Mandeln (Rührmasse) |
| `S465000` | 240 | 000 | Mandeln gebrannt, dragiert |
| `S537000` | 240 | 000 | Vollmilchschokolade mit Mandeln |
| `S241600` | 240 | 600 | Speiseeis Vanille, überzogen mit Schokolade und Ma |

**Anzeigename:** _(offen)_  **Aliase:** _(offen)_  **Notiz:** _(offen)_

### `walnuesse`
Suche liefert:
1. `H120100` Walnuss
2. `H120400` Walnuss gemahlen
3. `H120610` Walnuss geröstet ohne Fett

*Im Bestand nichts unter diesem Stichwort gefunden.*

**Anzeigename:** _(offen)_  **Aliase:** _(offen)_  **Notiz:** _(offen)_

### `cashews`
**Suche: KEIN TREFFER**

*Im Bestand nichts unter diesem Stichwort gefunden.*

**Anzeigename:** _(offen)_  **Aliase:** _(offen)_  **Notiz:** _(offen)_

### `haselnuesse`
Suche liefert:
1. `S570300` Bitterschokolade mit Haselnüssen
2. `S581200` Milchschokoladen-Riegel gefüllt mit Karamellcr
3. `S580700` Schokolade weiß, mit Haselnüssen

Im Bestand (nach Gewicht):
| Code | Gew | Zub | name_de |
|---|---|---|---|
| `S570300` | 240 | 300 | Bitterschokolade mit Haselnüssen |
| `S580700` | 240 | 700 | Schokolade weiß, mit Haselnüssen |
| `S536000` | 240 | 000 | Vollmilchschokolade mit Haselnüssen |
| `S539700` | 240 | 700 | Vollmilchschokolade mit Rosinen und Haselnüssen |
| `S560400` | 240 | 400 | Zartbitter-/Halbbitterschokolade, mit Haselnüssen |
| `S541000` | 240 | 000 | Vollmilchschokolade mit Haselnüssen und Cornflakes |

**Anzeigename:** _(offen)_  **Aliase:** _(offen)_  **Notiz:** _(offen)_

### `erdnuesse`
Suche liefert:
1. `H110600` Erdnuss geröstet
2. `H110700` Erdnuss geröstet, gesalzen
3. `H880200` Erdnussbutter/Erdnusscreme

Im Bestand (nach Gewicht):
| Code | Gew | Zub | name_de |
|---|---|---|---|
| `C515300` | 600 | 300 | Cornflakes gesüßt, mit Zuckerglasur und Erdnüssen |
| `C515200` | 600 | 200 | Cornflakes gesüßt, mit Zuckerglasur und Erdnüssen, |
| `S538000` | 240 | 000 | Milchschokolade mit Erdnüssen |
| `S581100` | 240 | 100 | Milchschokoladen-Riegel gefüllt mit Karamell, gerö |
| `Y692423` | 0 | 423 | Fisch-Curry mit Seelachs und Erdnüssen |

**Anzeigename:** _(offen)_  **Aliase:** _(offen)_  **Notiz:** _(offen)_

### `erdnussbutter`
Suche liefert:
1. `H880200` Erdnussbutter/Erdnusscreme
2. `H110800` Erdnussmus

Im Bestand (nach Gewicht):
| Code | Gew | Zub | name_de |
|---|---|---|---|
| `H880200` | 730 | 200 | Erdnussbutter/Erdnusscreme |

**Anzeigename:** _(offen)_  **Aliase:** _(offen)_  **Notiz:** _(offen)_

### `olivenoel`
Suche liefert:
1. `Q120000` Olivenöl

Im Bestand (nach Gewicht):
| Code | Gew | Zub | name_de |
|---|---|---|---|
| `H510802` | 650 | 802 | Oliven grün, gesäuert, abgetropft |
| `H520800` | 650 | 800 | Oliven geschwärzt, in Salzlake, abgetropft |
| `H511900` | 650 | 900 | Oliven grün, gefüllt mit Mandeln, gesäuert, abgetr |
| `H510900` | 650 | 900 | Oliven grün, gefüllt mit Paprikapaste, gesäuert, a |
| `Q120000` | 460 | 000 | Olivenöl |
| `W298100` | 440 | 100 | Olivenpastete |

**Anzeigename:** _(offen)_  **Aliase:** _(offen)_  **Notiz:** _(offen)_

### `rapsoel`
Suche liefert:
1. `Q180000` Rapsöl/Rüböl
2. `Q4C4000` Rapsölmargarine Vollfett, angereichert mit Vit
3. `X5A2000` Champignons gedünstet in Essig, eingelegt in R

Im Bestand (nach Gewicht):
| Code | Gew | Zub | name_de |
|---|---|---|---|
| `Q180000` | 460 | 000 | Rapsöl/Rüböl |
| `Q4C4000` | 460 | 000 | Rapsölmargarine Vollfett, angereichert mit Vitamin |
| `X5A2000` | 0 | 000 | Champignons gedünstet in Essig, eingelegt in Rapsö |
| `X9A2050` | 0 | 050 | Polenta (Maisbrei mit Wasser, Rapsöl und Salz) gek |
| `X8A1010` | 0 | 010 | Reisflockenbrei ungesüßt, mit Wasser, Apfelsaft un |
| `X986143` | 0 | 143 | Polenta (Maisbrei zubereitet mit Wasser, Rapsöl un |

**Anzeigename:** _(offen)_  **Aliase:** _(offen)_  **Notiz:** _(offen)_

### `kokosoel`
Suche liefert:
1. `Q550000` Kokosöl
2. `Q550100` Kokosöl desodoriert

Im Bestand (nach Gewicht):
| Code | Gew | Zub | name_de |
|---|---|---|---|
| `H150100` | 650 | 100 | Kokos Fruchtfleisch, roh |
| `H154000` | 650 | 000 | Kokosmilch/Kokosnussmilch |
| `H151000` | 650 | 000 | Kokoswasser (Fruchtwasser) |
| `H150400` | 650 | 400 | Kokos Fruchtfleisch, geraspelt, getrocknet |
| `Q550000` | 460 | 000 | Kokosöl |
| `Q550200` | 460 | 200 | Kokosfett gehärtet |

**Anzeigename:** _(offen)_  **Aliase:** _(offen)_  **Notiz:** _(offen)_

### `leinsamen`
Suche liefert:
1. `H410100` Leinsamen
2. `H410600` Leinsamen geröstet ohne Fett
3. `H410400` Leinsamen geschrotet

Im Bestand (nach Gewicht):
| Code | Gew | Zub | name_de |
|---|---|---|---|
| `H410100` | 730 | 100 | Leinsamen |
| `H410400` | 730 | 400 | Leinsamen geschrotet |
| `H410600` | 730 | 600 | Leinsamen geröstet ohne Fett |
| `B6A2900` | 520 | 900 | Roggenvollkornknäckebrot mit Leinsamen und Weizenk |

**Anzeigename:** _(offen)_  **Aliase:** _(offen)_  **Notiz:** _(offen)_

### `chiasamen`
Suche liefert:
1. `H480100` Chia-Samen

*Im Bestand nichts unter diesem Stichwort gefunden.*

**Anzeigename:** _(offen)_  **Aliase:** _(offen)_  **Notiz:** _(offen)_

### `sonnenblumenkerne`
Suche liefert:
1. `H430100` Sonnenblumenkern
2. `H430610` Sonnenblumenkern geröstet ohne Fett
3. `H880100` Sonnenblumenkernaufstrich, Brotaufstrich pflan

Im Bestand (nach Gewicht):
| Code | Gew | Zub | name_de |
|---|---|---|---|
| `B226500` | 520 | 500 | Roggenbrot mit Sonnenblumenkernen |
| `B710900` | 520 | 900 | Dinkelbrot mit Sonnenblumenkernen |
| `B106500` | 520 | 500 | Vollkornbrot mit Sonnenblumenkernen |
| `B723400` | 520 | 400 | Laugengebäck mit Sonnenblumenkernen |
| `B526500` | 520 | 500 | Roggenbrötchen mit Sonnenblumenkernen |
| `B516500` | 520 | 500 | Weizenbrötchen mit Sonnenblumenkernen |

**Anzeigename:** _(offen)_  **Aliase:** _(offen)_  **Notiz:** _(offen)_

### `kuerbiskerne`
Suche liefert:
1. `H310100` Kürbiskern
2. `H310600` Kürbiskern geröstet ohne Fett
3. `B710600` Dinkelbrot mit Kürbiskernen

Im Bestand (nach Gewicht):
| Code | Gew | Zub | name_de |
|---|---|---|---|
| `B710600` | 520 | 600 | Dinkelbrot mit Kürbiskernen |
| `B226700` | 520 | 700 | Roggenbrot mit Kürbiskernen |
| `B106700` | 520 | 700 | Vollkornbrot mit Kürbiskernen |
| `B723200` | 520 | 200 | Laugengebäck mit Kürbiskernen |
| `B526700` | 520 | 700 | Roggenbrötchen mit Kürbiskernen |
| `B516700` | 520 | 700 | Weizenbrötchen mit Kürbiskernen |

**Anzeigename:** _(offen)_  **Aliase:** _(offen)_  **Notiz:** _(offen)_


## Sonstiges

### `honig`
Suche liefert:
1. `G622600` Gemüsesaft aus Karotte/Möhre, mit Honig
2. `G891102` Honiggurke gesäuert, abgetropft
3. `F533100` Honigmelone roh

Im Bestand (nach Gewicht):
| Code | Gew | Zub | name_de |
|---|---|---|---|
| `F533100` | 660 | 100 | Honigmelone roh |
| `F533600` | 660 | 600 | Honigmelonensaft |
| `G891102` | 660 | 102 | Honiggurke gesäuert, abgetropft |
| `G622600` | 660 | 600 | Gemüsesaft aus Karotte/Möhre, mit Honig |
| `C534300` | 600 | 300 | Cerealien extrudiert, gesüßt, ungefüllt, mit Fruch |
| `C534400` | 600 | 400 | Cerealien extrudiert, gesüßt, ungefüllt, mit Fruch |

**Anzeigename:** _(offen)_  **Aliase:** _(offen)_  **Notiz:** _(offen)_

### `zartbitterschokolade`
Suche liefert:
1. `S352000` Fondantkonfekt mit Zartbitterschokolade überzo
2. `S560000` Zartbitter-/Halbbitterschokolade
3. `S560600` Zartbitter-/Halbbitterschokolade, gefüllt mit

Im Bestand (nach Gewicht):
| Code | Gew | Zub | name_de |
|---|---|---|---|
| `S352000` | 240 | 000 | Fondantkonfekt mit Zartbitterschokolade überzogen |

**Anzeigename:** _(offen)_  **Aliase:** _(offen)_  **Notiz:** _(offen)_

### `kakao`
Suche liefert:
1. `M2A6100` Milchmischgetränk < 1 % Fett, mit Kakao/Schoko
2. `M206100` Milchmischgetränk < 1 % Fett, mit Kakao/Schoko
3. `M206200` Milchmischgetränk 1,5 % Fett, mit Kakao/Schoko

Im Bestand (nach Gewicht):
| Code | Gew | Zub | name_de |
|---|---|---|---|
| `M2A6100` | 660 | 100 | Milchmischgetränk < 1 % Fett, mit Kakao/Schoko, Zu |
| `M2H7300` | 560 | 300 | Milchshake 3,5 % Fett, mit Kakao/Schokolade, gesüß |
| `M206200` | 560 | 200 | Milchmischgetränk 1,5 % Fett, mit Kakao/Schokolade |
| `M206300` | 560 | 300 | Milchmischgetränk 3,5 % Fett, mit Kakao/Schokolade |
| `M206100` | 560 | 100 | Milchmischgetränk < 1 % Fett, mit Kakao/Schokolade |
| `M2Q4220` | 560 | 220 | Milchmischgetränk 1,5 % Fett, mit Kakao/Schokolade |

**Anzeigename:** _(offen)_  **Aliase:** _(offen)_  **Notiz:** _(offen)_

### `kaffee`
Suche liefert:
1. `M171500` Kaffeesahne mind. 10 % Fett
2. `M2I3200` Milchmischgetränk 1,5 % Fett, mit Kaffee und S
3. `M248000` Joghurt mind. 3,5 % Fett, mit Kaffeezubereitun

Im Bestand (nach Gewicht):
| Code | Gew | Zub | name_de |
|---|---|---|---|
| `M171500` | 660 | 500 | Kaffeesahne mind. 10 % Fett |
| `M2I3200` | 660 | 200 | Milchmischgetränk 1,5 % Fett, mit Kaffee und Süßun |
| `M208000` | 560 | 000 | Milchmischgetränk 3,5 % Fett, mit Kaffee, gesüßt |
| `M2A7200` | 560 | 200 | Milchmischgetränk 1,5 % Fett, mit Kaffee, gesüßt |
| `M2I5200` | 560 | 200 | Milchmischgetränk 1,5 % Fett, mit Kaffee, ungesüßt |
| `M248000` | 560 | 000 | Joghurt mind. 3,5 % Fett, mit Kaffeezubereitung, g |

**Anzeigename:** _(offen)_  **Aliase:** _(offen)_  **Notiz:** _(offen)_

