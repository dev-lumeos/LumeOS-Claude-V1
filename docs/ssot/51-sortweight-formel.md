# `sort_weight` nach der Spec-Formel: berechnen und messen

`[cmd]` Erhoben 2026-08-16 gegen die laufende lokale Instanz
(`nutrition.foods`, 7.140 Einträge).

- Formel als Datendatei: `supabase/_pipeline/daten/sortweight-formel.json`
- Ableitung: `supabase/_pipeline/_ableitung/sortweight-berechnen.ts`
- Grundlage: `docs/specs/Nutrition/01_current_specs/SPEC_05_FOOD_TAXONOMY.md`,
  Abschnitt „Sort Weight System"

**Es wurde nichts geschrieben.** Kein `UPDATE` auf `nutrition.foods`,
keine Änderung an `food_search`, `food_aliases`, `search_synonyms`. Die
berechneten Werte liegen in der Hilfstabelle
`nutrition._sortweight_neu`; die Messung des Maßstabs lief auf einer
Wegwerf-Datenbank, die danach verworfen wurde.

---

## Das Ergebnis in einer Zeile

`[cmd]` **Der MealCam-Maßstab steigt von 31 auf 33 von 37.** Über der
Untergrenze von 31, unter dem Ziel von 34.

| | alt | neu |
|---|---|---|
| Sollwert auf Platz 1 | `[cmd]` 31 / 37 (84 %) | `[cmd]` **33 / 37 (89 %)** |
| in den ersten drei | `[cmd]` 35 | `[cmd]` 35 |
| in den Top 10 | `[cmd]` 36 | `[cmd]` 36 |
| verschiedene Werte | `[cmd]` 62 | `[cmd]` 93 |

Die Formel löst drei Fälle (`lachs`, `kartoffeln`, `spinat`) und bricht
einen (`quinoa`). Netto +2.

---

## Schritt 1 — worauf die Formel bauen kann

### Nährwerte: tragfähig

| Nährstoff | Einträge mit Wert | fehlend |
|---|---|---|
| `PROT625` | `[cmd]` 7.117 | 23 |
| `FAT` | `[cmd]` 7.112 | 28 |
| `FIBT` | `[cmd]` 7.087 | 53 |
| `FAPUN3` | `[cmd]` 7.019 | 121 |

`[cmd]` Kein einziger Wert ist NULL, wo die Zeile existiert — Fehlen
heißt „keine Zeile", nicht „Wert 0". Das Skript liest die Werte als
`null` und prüft vor jedem Bonus auf `!== null`; **ein fehlender Wert
löst keinen Zuschlag aus.**

### `processing_level`: vorhanden, aber wertlos

`[cmd]` Die Spalte existiert und ist zu 100 % gefüllt — **mit einem
einzigen Wert: `raw`, für alle 7.140 Einträge.** Auch
`X357160 Meerrettichschaum` und `X320243 Bechamelsauce` stehen dort als
`raw`.

**Der Abzug `ultra_processed = −250` kann nicht feuern.** Er ist in der
Datendatei mit `"wirkt": false` und Begründung hinterlegt, nicht
stillschweigend durch etwas anderes ersetzt.

### Tags: die Spec verlangt welche, die es nicht gibt

`[cmd]` `nutrition.food_tags` kennt genau vier Codes:

| Tag | Einträge |
|---|---|
| `low_carb` | 4.659 |
| `low_fat` | 2.648 |
| `high_protein` | 1.400 |
| `high_fiber` | 558 |

Die Spec verlangt `offal tag` und `liver tag` für die Innereien-Abzüge
(−400 / −380). **Beide existieren nicht.** Die Abzüge laufen deshalb
über den Namen — eine Abweichung, keine Umsetzung der Spec.

### Core-Fitness-Liste: 30 Einträge, 29 belegt, 1 fehlt

Die Spec nennt die Liste in vier Blöcken; ausgezählt sind es **30
Einträge**, nicht 36. `[cmd]` 10 tragen einen festen BLS-Code, 20 nur
eine Gattung. Jeder wurde einmal nachgeschlagen:

| Spec | gewählt | Begründung |
|---|---|---|
| Hähnchen Brustfilet | `V416100` | Code aus der Spec, existiert |
| Rind Hackfleisch | `U010100` | Code aus der Spec |
| Rind Filet/Lende | `U211100` | Code aus der Spec |
| Hühnerei roh | `E111100` | Code aus der Spec |
| Hühnerei Eiweiß | `E113100` | Spec sagt „Eiweiß", Bestand „Eiklar" |
| Tofu fest | `H861000` | Code aus der Spec; `[cmd]` der Bestand kennt nur `Tofu`, kein „fest" |
| Haferflocken | `C133000` | Code aus der Spec |
| Reis weiß poliert | `C352000` | Code aus der Spec |
| Kartoffel roh | `K110100` | Code aus der Spec |
| Pute Brust | `V486100` | Code aus der Spec |

**Die elf mehrdeutigen Fälle**, je mit Grund:

| Spec | gewählt | verworfen — und warum |
|---|---|---|
| Lachs (diverse T-Codes) | `T410100` Lachs roh | **nicht** `T094100` Lachsrogen — hat mit `sort_weight` 830 den höheren Wert, ist aber ein anderes Erzeugnis |
| Hering roh | `T102100` | nicht Heringsrogen, nicht Heringsfilet in Dillcreme |
| Mandeln | `H210100` Mandel süß | nicht `H220100` bitter (ungenießbar), nicht Mandeldrink, nicht Mandelöl |
| Walnüsse | `H120100` Walnuss | nicht Walnussöl |
| Avocado | `F502100` roh | nicht Guacamole |
| Brokkoli | `G312100` Broccoli roh | nicht Broccolicremesuppe |
| Tomate | `G561100` roh | nicht Tomatenmark, nicht Ketchup |
| Karotten | `G620100` Karotte/Möhre roh | nicht Karottensaftschorle |
| Banane | `F503100` roh | nicht Bananenchips, nicht Bananennektarschorle |
| Linsen getrocknet | `H725100` Linse reif | nicht `H730000` rot — die allgemeine Form gewählt |
| Paprika | `G543100` rot, roh | grün und gelb bewusst **nicht** aufgenommen; rot ist die übliche Lesart |

`[cmd]` **„Griechischer Joghurt" existiert im BLS nicht** (0 Treffer).
Ersatzweise steht `M141100` (Joghurt aus entrahmter Milch) in der Liste,
ausdrücklich als Ersatz gekennzeichnet.

---

## Schritt 2 — die Formel als Datendatei

`supabase/_pipeline/daten/sortweight-formel.json` trägt Basiswerte,
Zuschläge, Abzüge und die Core-Liste. Sie wird gelesen, nicht
ausgeführt — korrigierbar ohne Codeänderung.

### Die Ergänzung gegenüber der Spec: Zubereitung

Die Spec kennt keinen Zuschlag für die Grundform. Das heutige
`sort_weight` trägt ihn aber implizit (Block 32,
`nutrition.such_rang_zubereitung`), und ohne ihn fiele `Banane roh`
hinter `Banane getrocknet`.

Aufgenommen als `grundform_bonus = +120` für Zubereitungscode `100` oder
`000`. `[cmd]` Zusammen mit dem Spec-Abzug `zubereitet = −150` ergibt das
einen Ausschlag von **270 Punkten** zwischen Roh- und zubereiteter Form —
genug, um jede Basisdifferenz innerhalb einer Warengruppe zu überstimmen.

---

## Schritt 3 — die Messung

### Der Maßstab

```
                            alt        neu
Sollwert auf Platz 1     31 / 37    33 / 37
in den ersten drei          35         35
gar keine Treffer            0          0
```

**Was die Formel löst:**

| | alt | neu |
|---|---|---|
| `lachs` | Platz 2 hinter `Lachsrogen roh` | **Platz 1** |
| `kartoffeln` | Platz 2 hinter `Kartoffel-Schupfnudeln roh` | **Platz 1** |
| `spinat` | Platz 2 hinter `Eierteigwaren Tortelloni` | **Platz 1** |

**Was sie bricht:**

| | alt | neu |
|---|---|---|
| `quinoa` | Platz 1 | **Platz 2** hinter `Quinoa tricolore, roh` |

**Was unverändert offen bleibt:** `milch` (FEHL), `paprika` (Platz 4),
`erdnussbutter` (Platz 2). `[read]` Die Vermutung in C-38, die Formel
erledige `milch` und `erdnussbutter` mit, hat sich **nicht bestätigt** —
beide stehen unverändert.

### Kennzahlen der Verteilung

| | alt | neu |
|---|---|---|
| verschiedene Werte | `[cmd]` 62 | `[cmd]` 93 |
| Mittelwert | `[cmd]` 355 | `[cmd]` 385 |
| an der Obergrenze 1000 | — | `[cmd]` 121 |
| an der Untergrenze 0 | — | `[cmd]` 2.165 |
| unverändert | — | `[cmd]` 2.345 |

`[cmd]` Von den 2.165 Nullwerten sind **1.976 Fertiggerichte (X/Y)** und
**119 Alkohol (P)** — beide werden durch Basis minus Abzug rechnerisch
negativ und auf 0 begrenzt. Die übrigen 70 sind Innereien und
Fettgewebe.

### Die Spec-Beispiele

**„Hafer" — die Spec erwartet Haferflocken ganz oben:**

```
neu 1000 (alt 900)  Hafer Flocken          <- wie erwartet
neu  850 (alt 700)  Hafer ganzes Korn, roh
neu  850 (alt 700)  Hafer Grieß / Grütze / Kleie / Schrot / Mehl
neu  820 (alt 600)  Haferdrink ungesüßt
neu  670 (alt 520)  Hafervollkornbrot / Haferbrot
```

**„Rind" — die Spec erwartet Hackfleisch oben, Innereien tief:**

```
neu 1000 (alt 600)  Rind Hackfleisch, roh  <- wie erwartet
neu 1000 (alt 530)  Rind Tatar, Steak, Roulade, Rostbraten … (8 Stück)
   …
neu    0 (alt 380)  Rind Leber, gebraten
neu    0 (alt 400)  Rind Herz, tiefgefroren
neu    0 (alt 250)  Rind Magen/Kutteln, gekocht
```

Beide Beispiele treffen die Erwartung der Spec **der Reihenfolge nach**.
Die absoluten Werte weichen ab: die Spec nennt 950 für Haferflocken und
920 für Rind Hackfleisch, die Formel liefert für beide 1000, weil die
Summe die Obergrenze überschreitet.

`[annahme]` Die Spec-Beispiele sind vermutlich von Hand geschätzt und
nicht mit der eigenen Formel nachgerechnet — gemessen ist das nicht.

---

## Drei Fehler in meiner eigenen Umsetzung, gefunden und behoben

Sie stehen hier, weil jeder einzelne die Zahlen nach oben verzerrt
hätte:

1. **`Leberhack` bekam keinen Innereien-Abzug.** `[cmd]` `U080100 Rind
   Leberhack, roh` stieg von 400 auf 900 und stand unter den zwanzig
   größten Anstiegen. Ursache: `\bleber\b` trifft das Kompositum
   „leberhack" nicht. Behoben durch Wegfall der rechten Wortgrenze.

2. **Ein paniertes Schnitzel erreichte die Obergrenze 1000.** `[cmd]`
   `U952000 Schwein Schnitzel, paniert, gebraten` trägt
   Zubereitungscode `000` und galt damit als Grundform. `[cmd]` 41
   Einträge tragen `000` und nennen im Namen eine Zubereitung — der BLS
   benutzt `000` für „einzige Form" **und** für „zubereitet ohne
   Variante". Behoben: der Name schlägt den Code.

3. **Vier Bratenstücke fielen auf 0.** `[cmd]` `Schwein Dünner Bug
   (ohne Fett und Schwarte) roh` traf die Fettgewebe-Regel, obwohl der
   Name das Gegenteil sagt. 8 Einträge betroffen. Behoben: „Schwarte"
   zählt nur, wenn das Stück die Schwarte **ist**. `[cmd]` Danach 980
   statt 0.

---

## Wo die Spec vom Bestand abweicht

| Spec verlangt | Bestand liefert | Folge |
|---|---|---|
| `processing_level = 'ultra_processed'` (−250) | `[cmd]` durchgängig `raw`, auch für Bechamelsauce | **Abzug wirkungslos.** Fertiggerichte werden allein über das X/Y-Präfix erfasst |
| `offal tag`, `liver tag` | `[cmd]` nur `low_carb`, `low_fat`, `high_protein`, `high_fiber` | Innereien-Abzüge laufen über Namensmuster statt Tags |
| „Griechischer Joghurt" | `[cmd]` 0 Treffer | Ersatz `M141100`, gekennzeichnet |
| „Tofu fest" (`H861000`) | `[cmd]` Eintrag heißt nur `Tofu` | Code stimmt, Name nicht |
| „Olivenöl nativ extra" | `[cmd]` nur `Olivenöl` (`Q120000`) | keine Güteklasse im Bestand |
| `whole_food` = raw **und** C/G/F/H/T | `[cmd]` „raw" ist Code `100`; 111 Grundformen tragen `000` | **Ursache der `quinoa`-Regression**, siehe unten |
| E einmal als Eier (750), einmal als Teigwaren (580) | beides unter `E` | über den Namen getrennt |
| U (Muskel) 780 gegen U (Fett) 100 | keine Kennzeichnung | über den Namen getrennt |
| V (Geflügel) 760 gegen V (Innereien) 300 | keine Kennzeichnung | über den Namen getrennt |
| Basiswerte für 23 Präfixe | `[cmd]` der Bestand nutzt 20 | drei Spec-Zeilen sind Untergruppen, keine Präfixe |

### Die `quinoa`-Regression im Einzelnen

`[cmd]` Live stehen beide Quinoa-Einträge auf **700**; die
Namenslänge-Stufe aus `073_suchfilter.sql` entscheidet dann für
`Quinoa weiß, roh` — den erwarteten Treffer.

Die Formel gibt `Quinoa tricolore, roh` (`C118100`) **910** und
`Quinoa weiß, roh` (`C118000`) **850**. Der Unterschied ist der
`whole_food`-Bonus von +60, den die Spec an den Code `100` bindet.
Beide sind roh; nur einer trägt `100`.

`[cmd]` **111 Einträge** in C/G/F/H/T tragen `000` und gehen dadurch
leer aus, **24 davon** haben ein `100`-Geschwister in derselben Gruppe —
also dieselbe Konstellation wie Quinoa.

Ich habe die Regel **nicht** angepasst. Sie steht so in der Spec, und
die Aufgabe verlangt, Widersprüche zu melden statt sie aufzulösen. Eine
Erweiterung auf `000` wäre eine Änderung der Spec, keine Umsetzung.

---

## Was diese Messung nicht sagt

- **Sie sagt nicht, dass 33 von 37 das Optimum der Formel ist.** Der
  `grundform_bonus` von +120 ist ein gesetzter Wert; andere Höhen wurden
  nicht durchprobiert. `[annahme]` Die Wirkung dürfte flach sein, weil
  der Abstand zur zubereiteten Form mit 270 Punkten ohnehin groß ist —
  gemessen ist es nicht.

- **Sie sagt nichts über die Wirkung auf die Reihenfolge insgesamt.**
  Gemessen sind 37 Zutaten. `[cmd]` 4.795 Einträge ändern ihren Wert;
  was das für alle übrigen Suchanfragen bedeutet, ist offen.

- **Sie sagt nichts über die 121 Einträge an der Obergrenze.** Sie sind
  untereinander nicht mehr unterscheidbar — `sort_weight` kann dort
  nicht mehr ordnen. Dasselbe gilt verschärft für die 2.165 auf 0,
  darunter **alle** Fertiggerichte: die Rangfolge innerhalb der
  Gerichte geht vollständig verloren. `[annahme]` Für die Suche nach
  Zutaten ist das unkritisch, weil Gerichte ohnehin hinten stehen
  sollen; für eine Suche nach Gerichten wäre es ein Rückschritt. Nicht
  gemessen.

- **Sie sagt nichts über die Namensmuster-Regeln.** Innereien, Blut,
  Fettgewebe und Laborschnitte werden über Wortlisten erkannt, weil die
  Tags fehlen. Drei Fehler dieser Art habe ich gefunden und behoben;
  `[annahme]` ob weitere existieren, ist nicht systematisch geprüft.

- **Sie sagt nichts über `is_custom`.** Die Suchformel der Spec setzt
  Custom Foods immer nach vorn. Ob die Spalte existiert und gefüllt ist,
  wurde nicht erhoben — sie gehört nicht zu `sort_weight`.

---

## Stand und was fehlt

> **Stand des ersten Durchgangs, überholt am 2026-08-16.** Alle drei
> Punkte sind im zweiten Durchgang entschieden und gemessen — siehe
> unten. Der Abschnitt bleibt stehen, weil er den damaligen Kenntnis-
> stand festhält.

`[cmd]` Die Berechnung ist fertig und reproduzierbar, die Werte liegen
in `nutrition._sortweight_neu`. **Angewendet ist nichts.**

Vor einer Anwendung zu entscheiden:

1. **Die `whole_food`-Regel** — bei der Spec bleiben (Quinoa-Regression
   in Kauf nehmen) oder auf `000` erweitern (Abweichung von der Spec,
   betrifft 111 Einträge).
2. **Das Ziel 34 ist nicht erreicht**, die Untergrenze 31 aber
   übertroffen. Ob 33 reicht, ist eine Entscheidung, keine Messung.
3. **Die Nullwerte der Fertiggerichte** — falls die Rangfolge innerhalb
   der Gerichte gebraucht wird, muss die Untergrenze anders gesetzt
   werden.

---
---

# Zweiter Durchgang: zwei Formelfehler behoben

`[cmd]` Erhoben 2026-08-16. Anlass: Tom hat entschieden, dass **zwei
Regeln der Spec selbst fehlerhaft sind**. Die Formel war korrekt nach
Spec umgesetzt; korrigiert wird die Spec, nicht die Umsetzung.

Beide Änderungen stehen in `sortweight-formel.json`. Die gestrichenen
Abzüge sind **nicht gelöscht, sondern als `"wirkt": false` mit Grund
gekennzeichnet** — wie zuvor bei `processing_level`.

## Das Ergebnis in einer Zeile

`[cmd]` **Der MealCam-Maßstab steigt von 33 auf 34 von 37. Das Ziel ist
erreicht.** Die Zahl der Nullwerte fällt von 2.165 auf 145.

| | erster Durchgang | zweiter Durchgang |
|---|---|---|
| Sollwert auf Platz 1 | `[cmd]` 33 / 37 | `[cmd]` **34 / 37 (92 %)** |
| in den ersten drei | `[cmd]` 35 | `[cmd]` 35 |
| auf 0 | `[cmd]` 2.165 | `[cmd]` **145** |
| auf 1000 | `[cmd]` 121 | `[cmd]` 123 |
| Stufen gesamt | `[cmd]` 93 | `[cmd]` **95** |
| Mittelwert | `[cmd]` 385 | `[cmd]` 413 |

---

## Fehler 1 — Doppelbestrafung, zwei Abzüge gestrichen

**Die Ursache:** Die Basis kodiert die Warengruppe bereits (`X` 200,
`Y` 240, `P` 180). Der Modifikator „Fertiggericht −300" bzw. „Alkohol
−300" zog dieselbe Eigenschaft ein zweites Mal ab; das Ergebnis wurde
negativ und `CLAMP` machte 0 daraus.

**Gestrichen:** `fertiggericht` (−300, X/Y) und `alkohol` (−300, P).
Alle übrigen Modifikatoren unverändert — auch Innereien, Fettgewebe,
zubereitete Varianten und Laborschnitte.

## Was die Streichung der Abzüge bewirkt hat

Die Stufenverteilung je Warengruppe, vorher und nachher. **Das ist die
Kennzahl dieser Korrektur, nicht der Maßstab allein.**

| WG | Einträge | auf 0 vorher | auf 0 nachher | Stufen vorher | Stufen nachher | Spanne nachher |
|---|---|---|---|---|---|---|
| **P** Alkohol | 119 | `[cmd]` **119 (100 %)** | `[cmd]` **0** | `[cmd]` **1** | `[cmd]` **2** | 30–300 |
| **X** Gerichte | 1.165 | `[cmd]` **1.114 (96 %)** | `[cmd]` **59 (5 %)** | `[cmd]` **3** | `[cmd]` **9** | 0–360 |
| **Y** Zubereitungen | 885 | `[cmd]` **862 (97 %)** | `[cmd]` **16 (2 %)** | `[cmd]` **4** | `[cmd]` **16** | 0–390 |
| B Brot | 186 | 0 | 0 | 11 | 11 | 300–870 |
| C Getreide | 231 | 0 | 0 | 16 | 13 | 450–1000 |
| D Backwaren | 466 | 1 | 1 | 9 | 9 | 0–500 |
| E Eier/Pasta | 104 | 0 | 0 | 12 | 12 | 430–1000 |
| F Obst | 275 | 0 | 0 | 12 | 10 | 330–1000 |
| G Gemüse | 560 | 0 | 0 | 15 | 14 | 430–1000 |
| H Nüsse | 142 | 0 | 0 | 25 | 22 | 400–1000 |
| K Kartoffeln | 157 | 0 | 0 | 15 | 15 | 320–870 |
| M Milch | 279 | 0 | 0 | 9 | 9 | 410–1000 |
| N Getränke | 114 | 0 | 0 | 5 | 5 | 150–520 |
| Q Fette | 65 | 0 | 0 | 6 | 6 | 240–780 |
| R Würzmittel | 97 | 0 | 0 | 11 | 11 | 110–730 |
| S Süßwaren | 253 | 1 | 1 | 10 | 10 | 0–490 |
| T Fisch | 520 | 0 | 0 | 18 | 16 | 550–1000 |
| U Fleisch | 685 | 9 | 9 | 23 | 23 | 0–1000 |
| V Geflügel | 462 | 57 | 57 | 21 | 21 | 0–1000 |
| W Wurst | 375 | 2 | 2 | 17 | 17 | 0–690 |
| **gesamt** | **7.140** | `[cmd]` **2.165** | `[cmd]` **145** | `[cmd]` **93** | `[cmd]` **95** | |

**Innerhalb der Gerichte ist wieder eine Reihenfolge entstanden:** `X`
von 3 auf 9 Stufen, `Y` von 4 auf 16. `[cmd]` Die verbleibenden 59 bzw.
16 Nullwerte kommen aus anderen Regeln (Innereien, Fettgewebe), nicht
aus dem gestrichenen Abzug.

**`P` bleibt mit 2 Stufen dünn**, und das ist ein eigener Befund:
`[cmd]` 104 Einträge stehen auf 300 (Basis 180 + Grundform 120), 15 auf
30 — das sind die mit Zubereitungscode. Die Nährwert-Zuschläge der
Formel greifen bei Getränken nicht, also unterscheidet innerhalb der
Alkoholika nichts mehr. `[annahme]` Für die Suche dürfte das
unkritisch sein, weil Alkohol mit Basis 180 ohnehin hinten steht;
gemessen ist es nicht.

Die kleinen Rückgänge bei C, F, G, H und T (je 2–3 Stufen) kommen von
Fehler 2: `whole_food` feuert jetzt öfter, wodurch Werte
zusammenfallen, die vorher 60 Punkte auseinanderlagen. Das ist die
beabsichtigte Wirkung.

---

## Fehler 2 — `whole_food` gilt auch für `000`

`[read]` `44-bls-codestruktur.md`: `000` heißt **nicht** „roh", sondern
„keine Zubereitungsvariante". `nutrition.such_rang_zubereitung` behandelt
`100` und `000` seit Block 32 gleichrangig. **Code schlägt Spec.**

**Geändert:** Der Bonus feuert bei `100` **oder** `000`.

`[cmd]` 111 Einträge in C/G/F/H/T tragen `000`, davon **24 mit einem
`100`-Geschwister in derselben Vierstellengruppe**. Die 24 sind die
interessanten, weil dort die alte Regel zwei gleichwertige Einträge
auseinanderzog. Die Quinoa-Gruppe ist der belegte Fall:

| | erster Durchgang | zweiter Durchgang |
|---|---|---|
| `C118000` Quinoa weiß, roh | `[cmd]` 850 | `[cmd]` **910** |
| `C118100` Quinoa tricolore, roh | `[cmd]` 910 | `[cmd]` **910** |

**Die Regression ist verschwunden.** `[cmd]` Beide stehen jetzt auf 910,
und die Namenslänge-Stufe aus `073_suchfilter.sql` entscheidet wieder
für `Quinoa weiß, roh` — den erwarteten Treffer. `quinoa` steht nicht
mehr in der Fehlerliste.

---

## Die drei verbleibenden Fälle

`[cmd]` Nach beiden Korrekturen bleiben drei von 37 offen. **Keiner
davon ist noch ein `sort_weight`-Problem** — das ist das Ergebnis dieser
Untersuchung.

### `paprika` — Platz 4

`[cmd]` Der gesuchte `Gemüsepaprika rot, roh` (`G543100`) trägt bereits
den **Höchstwert 1000**; `Paprikaspeckwurst` (`W277000`) nur 560. Er
verliert trotzdem.

Ursache ist die Wortgrenzenstufe aus Block 32: der Bestand schreibt
„Gemüsepaprika", der Nutzer tippt „paprika" — das ist dort nur ein
Treffer in der Wortmitte, während „Paprikaspeckwurst" mit dem Wort
beginnt. `[cmd]` Dahinter stehen zusätzlich `G541100` grün und
`G542100` gelb mit je 840. **Kein Gewicht kann das drehen**; es braucht
eine Namens- oder Synonymbrücke.

### `erdnussbutter` — Platz 2

`[cmd]` `Erdnussbutter/Erdnusscreme` (`H880200`) und `Erdnussmus`
(`H110800`) stehen **beide auf 610** — gleichauf. Die Namenslänge
entscheidet dann für das kürzere `Erdnussmus`.

Sachlich sind beide dasselbe Produkt. `[annahme]` Ein Gewicht kann das
nicht trennen, weil die Formel keine Handelsnamen kennt; das ist ein
Fall für die Kuration.

### `milch` — nicht in den Top 10

`[cmd]` Die Werte erklären es vollständig:

| | `PROT625` | `FAT` | neuer Wert |
|---|---|---|---|
| `M884000` Magermilchpulver | 34,3 | 0,5 | **1000** |
| `M141100` Joghurt aus entrahmter Milch | 5,3 | 0,1 | **980** |
| `M111300` Vollmilch frisch 3,5 % | 3,6 | 3,5 | **510** |

**Die Formel bevorzugt hier systematisch das Falsche.** Magermilchpulver
bekommt Protein-Zuschläge (+80, +120, +50 mager) und den Core-Bonus über
den Ersatz-Eintrag; Vollmilch bekommt keinen einzigen Nährwert-Zuschlag,
weil 3,6 g Protein unter jeder Schwelle liegen.

`[read]` Toms Vermutung aus C-38, die Formel erledige `milch` über
Verarbeitungsgrad und Core-Liste, hat sich damit **auch im zweiten
Durchgang nicht bestätigt** — und die Messung zeigt, warum: der
Verarbeitungsgrad steht nicht in den Daten (`processing_level` ist
durchgängig `raw`), und die Core-Liste enthält das Milchpulver
indirekt über den Joghurt-Ersatz. Ein Getränk, das zu 87 % aus Wasser
besteht, kann gegen ein Pulver keine Nährwertpunkte gewinnen.
`[annahme]` Es bräuchte eine Regel „Trinkform vor Pulverform"; die
steht nicht in der Spec und wurde nicht erfunden.

---

## Die Spec-Beispiele nach der Korrektur

Beide treffen weiterhin die erwartete Reihenfolge:

```
"Hafer"   1000  Hafer Flocken            <- wie die Spec erwartet
           910  Hafer ganzes Korn / Grieß / Grütze / Kleie / Schrot / Mehl
           880  Haferdrink ungesüßt
           670  Hafervollkornbrot / Haferbrot

"Rind"    1000  Rind Hackfleisch, roh    <- wie die Spec erwartet
           ...
             0  Rind Herz / Leber / Magen (Innereien)
```

---

## Zwei Befunde, die stehen bleiben

### `processing_level` ist falsch gefüllt, nicht leer

`[cmd]` Alle 7.140 Einträge tragen `raw`, auch `Bechamelsauce` und
`Meerrettichschaum`. Das ist schlimmer als eine leere Spalte: eine leere
fällt auf, eine falsch gefüllte wird benutzt. Der Abzug
`ultra_processed = −250` bleibt wirkungslos. **In diesem Auftrag nicht
repariert.**

### Innereien laufen über Namensmuster — welche Einträge dadurch falsch stehen können

`[cmd]` `nutrition.food_tags` kennt weder `offal` noch `liver`, nur
`low_carb`, `low_fat`, `high_protein`, `high_fiber`. Die Abzüge laufen
deshalb über Wortmuster mit Wortgrenzen — und genau daran ist im ersten
Durchgang `Rind Leberhack` durchgerutscht.

Die Wortgrenzen sind nötig, damit **keine falschen Treffer** entstehen.
`[cmd]` Belegte Fälle, die ohne sie falsch abgewertet würden:
`Pute Brust, ohne Haut, mariniert` (enthält „nier"), `Seezunge roh` und
`Rotzunge roh` (enthalten „zunge", sind aber Fische) — alle drei stehen
korrekt bei 880–1000.

**Der Preis dafür — Einträge mit Innereien im Wortinneren, die
weiterhin hoch stehen:**

| Wert | Code | Name |
|---|---|---|
| `[cmd]` 800 | `V988100` | Leberknödel Konserve |
| `[cmd]` 640 | `W378100` | Gänseleber in Aspik |
| `[cmd]` 640 | `W365100` | Schweinekümmelmagen |
| `[cmd]` 630 | `U405200` | Kalb Nierenfett, tiefgefroren |
| `[cmd]` 610 | `V913500` | Gänseleberpastete getrüffelt |
| `[cmd]` 560 | `W386000` | Pfälzer Saumagen |
| `[cmd]` 560 | `W281000` | Milzwurst |

`[annahme]` Die Wurstwaren (`Leberwurst`, `Milzwurst`) sind vermutlich
richtig so — sie sind Wurst, kein Organ, und die Ausnahmeliste schließt
`leberwurst` bewusst aus. Strittig sind `Gänseleber in Aspik`,
`Schweinekümmelmagen`, `Kalb Nierenfett` und `Pfälzer Saumagen`: das
sind Innereien, und sie stehen zu hoch. **Nicht behoben** — das wäre
eine dritte Spec-Abweichung, und zwei sind entschieden.

---

## Was der zweite Durchgang nicht sagt

- **Er sagt nicht, dass 34 von 37 das Optimum ist.** Nach Erreichen des
  Ziels wurde nicht weiter angepasst. Die drei offenen Fälle sind
  benannt und keiner davon über `sort_weight` lösbar.

- **Er sagt nichts über die 123 Einträge auf 1000.** Sie bleiben
  untereinander ununterscheidbar; `sort_weight` kann dort nicht ordnen.
  `[cmd]` Allein `U` stellt 62 davon.

- **Er sagt nichts über die Wirkung auf andere Suchanfragen.**
  `[cmd]` 6.660 der 7.140 Einträge ändern ihren Wert (480 bleiben
  gleich). Gemessen sind 37 Zutaten.

- **`P` mit 2 Stufen ist nicht geprüft worden.** Ob die fehlende
  Binnenordnung der Alkoholika in der Suche auffällt, wurde nicht
  gemessen.

- **Die 24 `000`-Einträge mit `100`-Geschwister** sind gezählt, aber
  nur einer (Quinoa) ist im Ergebnis nachgeprüft. `[annahme]` Die
  übrigen 23 dürften sich gleich verhalten.

---

## Stand nach dem zweiten Durchgang

`[cmd]` Die Werte liegen in `nutrition._sortweight_neu`, 7.140 Zeilen.
**`nutrition.foods` ist unverändert** — dort stehen weiterhin die 62
alten Werte, der Live-Maßstab misst weiterhin 31 von 37. Die Messung
lief auf `wegwerf_c38b`, danach verworfen.

Zur Anwendung fehlt nur noch die Freigabe.

