# Der Zubereitungsschlüssel je Warengruppe: ableiten, belegen, messen

`[cmd]` Erhoben 2026-08-16 gegen die laufende lokale Instanz
(`nutrition.foods`, 7.140 Einträge). Skripte:

- `supabase/_pipeline/_validierung/zubereitungsschluessel-ableiten.ts` (Schritt 1)
- `supabase/_pipeline/_validierung/artengruppierung-v2-messen.ts` (Schritte 3–5)

Klassifikation als Datendatei:
`supabase/_pipeline/daten/zubereitungsschluessel.json`.

Anlass: C-33, die Reparatur an dem Modell, das `48-artengruppierung-messung.md`
zu Fall gebracht hat. Nur lesende Abfragen; keine Änderung an
`nutrition.foods`, `food_search`, `food_aliases`, `search_synonyms`,
`preparation_kinds`, keine Spalte, keine Tabelle, kein Kettenschritt.

---

## Das Ergebnis in einem Satz

Die Reparatur **wirkt in die richtige Richtung, reicht aber nicht**:
`[cmd]` 39 → **47 von 100** einheitliche Gruppen, Abnahme 95 **nicht
erreicht**. `[cmd]` Von 48 echten Mischungen löst die neue Regel **eine**.

| | alt (C-28) | neu (C-33) | Abnahme |
|---|---|---|---|
| einheitliche Gruppen | `[cmd]` 39 / 100 | `[cmd]` **47 / 100** | 95 — nicht erreicht |
| ohne Gerichte (X/Y) | `[cmd]` 61 / 100 | `[cmd]` **60 / 100** | 95 — nicht erreicht |
| Gruppen gesamt | `[cmd]` 2.646 | `[cmd]` 2.714 | — |
| Gruppen ohne Vertreter | `[cmd]` 953 | `[cmd]` **0** (mit drittem Fall) | — |

---

## Schritt 1 — Kreuztabelle mit Beleg

`[cmd]` 652 Kombinationen aus Warengruppe und Stellen 5–7, davon **204
mit mindestens zehn Einträgen**; diese decken **5.776 der 7.140**
Einträge ab. Alle drei Zahlen bestätigen die Angaben in C-33.

### Wie der Beleg entsteht

Eine Zelle gilt als belegt, wenn ihre Namen ein gemeinsames Merkmal
tragen. Vier Kandidaten, in dieser Reihenfolge, vom stärksten zum
schwächsten:

| Art | Bedingung | Zellen |
|---|---|---|
| `suffix` | gemeinsames Wortsuffix im **ersten Wort** aller Namen | `[cmd]` 2 |
| `wort` | ein Wort kommt in **allen** Namen vor | `[cmd]` 56 |
| `mehrheit` | ein Wort in ≥ 80 % der Namen | `[cmd]` 26 |
| `wortteil` | ein Baustein aus fester Liste in ≥ 80 % der Namen | `[cmd]` 1 |
| **ungeklärt** | nichts davon | `[cmd]` **119** |

Wo nichts auffindbar war, steht „ungeklärt". Es wurde **keine Bedeutung
erfunden**, um eine Zelle zu füllen.

### Drei Korrekturen an meinem eigenen Belegverfahren

Der erste Anlauf war fehlerhaft, und zwar in einer Weise, die das
Ergebnis beschönigt hätte:

1. **Suffixe schnitten mitten im Wort.** `[cmd]` Es entstanden Merkmale
   wie `ne fett pfanne` und `rve abgetropft` — Fragmente, die nichts
   belegen. Behoben: nur an Wortgrenzen schneiden.
2. **Das Suffix wurde am Ende des ganzen Namens gesucht.** `[cmd]`
   Damit fiel `F`+`600` durch, obwohl es die Kronzeugen-Zelle ist:
   `Mehrfruchtsaft angereichert mit Vitaminen` endet auf „vitaminen",
   nur der **Kopf** endet auf „saft". Behoben: das erste Wort prüfen.
3. **Füllwörter belegten Zellen.** `[cmd]` `B`+`400` galt als belegt
   durch das Wort „mit" — jeder Brotname enthält es. Behoben: eine kurze
   Sperrliste (`mit`, `ohne`, `und`, …).

### Eine Korrektur an der Vorgabe aus C-33

C-33 schreibt: *„`F` + `600`: alle 53 Namen enden auf ‚saft' — belegt."*

`[cmd]` **Das trifft nicht zu.** Von den 53 Einträgen enthalten **48**
„saft", die übrigen fünf sind:

```
Orangennektar mit Süßungsmitteln
Apfelnektar mit Süßungsmitteln
Smoothie purpur (Früchte)
Smoothie grün (Früchte/Gemüse)
Smoothie gelb (Früchte)
```

Die Zelle ist damit nicht durch ein *gemeinsames* Merkmal belegt,
sondern durch ein Merkmal in 91 % der Namen. Sie ist als `wortteil`
mit ihrem Anteil ausgewiesen, nicht als gesicherter Beleg. An der
Einordnung ändert das nichts; an ihrer Härte schon.

### Warum 119 Zellen ungeklärt bleiben — und warum das richtig ist

`[cmd]` 65 der 119 sind Gerichtszellen (X/Y). Die übrigen zeigen ein
klares Muster: **dort ist die Ziffer keine Zubereitung, sondern eine
laufende Nummer.**

| Zelle | Einträge | Beispiele |
|---|---|---|
| `B` 000/100/…/800 | `[cmd]` je 10–62 | Vollkornbrot **mit Ölsamen** · **mit Sonnenblumenkernen** · **mit Kürbiskernen** · **mit Nüssen** |
| `D` 000–800 | `[cmd]` je 21–105 | Sachertorte · Nuss-Sahnetorte · Linzer Torte |
| `Q` 000 | `[cmd]` 59 | Olivenöl · Haselnussöl · Palmfett |
| `R` 000 | `[cmd]` 55 | Speisesalz · Meersalz · Jodsalz |

Bei Brot kodiert die Ziffer die **Zutat**, bei Torten die **Sorte**, bei
Ölen und Salzen gar nichts — es ist eine Aufzählung. `[annahme]` Ein
gemeinsames Merkmal kann es dort nicht geben, weil keines existiert;
gemessen ist nur, dass keines gefunden wurde.

---

## Schritt 2 — zwei Klassen

`supabase/_pipeline/daten/zubereitungsschluessel.json`, 204 Zellen:

| Klasse | Zellen | Bedeutung |
|---|---|---|
| `zubereitung` | `[cmd]` **104** | dieselbe Art, anders behandelt — bleibt in der Gruppe |
| `erzeugnis` | `[cmd]` **4** | etwas anderes aus derselben Ausgangsware — eigene Gruppe |
| `ungeklärt` | `[cmd]` **96** | kein Merkmal auffindbar |
| davon strittig markiert | `[cmd]` **11** | siehe unten |

### Die vier Erzeugniszellen

| Zelle | Einträge | Beleg |
|---|---|---|
| `F` 600 | `[cmd]` 53 | `wortteil:saft` (91 %) — Fruchtsaft |
| `F` 700 | `[cmd]` 14 | `suffix:nektar` — Fruchtnektar |
| `G` 600 | `[cmd]` 10 | `suffix:gemuesesaft` — Gemüsesaft |
| `N` 100 | `[cmd]` 12 | `wort:getraenk` — Kaffee/Tee als Getränk, nicht als Bohne |

Nur vier. Das ist wenig, und es ist der Grund, warum Schritt 4 so
mager ausfällt — dazu unten.

---

## Schritt 3 — neue Gruppierung, dieselbe Messung

Die Messung ist **unverändert** übernommen: gleiche Stichprobenregel
(jede n-te Gruppe, deterministisch), gleiches Einheitlichkeitsmerkmal,
gleiche Abnahme. `preparation_kinds` wurde nicht ergänzt, die
Zusatzliste nicht erweitert — sonst hätte der Vergleich die
Regeländerung gemessen statt die Gruppierung.

```
                              Grundmenge  Stichprobe  einheitlich
  alt  (C-28, vier Stellen)         1400         100           39
  neu  (+ Erzeugnisklasse)          1375         100           47
  neu, ohne Gerichte (X/Y)           934         100           60
```

`[cmd]` **47 von 100. Die Abnahme von 95 ist nicht erreicht.**

`[cmd]` 68 Gruppen sind neu entstanden (2.646 → 2.714); 89 Einträge
wurden abgespalten (53 + 14 + 10 + 12).

### Die Regel tut, was sie soll — an den Fällen, für die sie gebaut ist

`[cmd]` Gegenprobe an den Kronzeugen:

```
F201: aus 1 Gruppe werden 2
   F201       Aprikose roh | gedünstet | getrocknet | gezuckert Konserve
   F201/600   Aprikosensaft
F603: aus 1 Gruppe werden 3
   F603       Orange roh
   F603/600   Orangensaft
   F603/700   Orangennektar
T410: aus 1 Gruppe werden 1
   T410       alle 14 Lachs-Einträge, roh bis geräuchert bis Konserve
```

Aprikose und Aprikosensaft trennen sich, Lachs roh und Lachs geräuchert
bleiben zusammen — genau die Vorgabe aus C-33.

---

## Schritt 4 — was die neue Regel von den echten Mischungen löst

**Das ist die Zahl, die in C-33 als ungemessen vermerkt war.**

`[cmd]` **48 echte Mischungen in der Stichprobe, davon löst die neue
Regel genau 1. 47 bleiben ungelöst.**

Das ist ernüchternd, und die Ursache ist eindeutig: **die ungelösten
Fälle liegen fast alle in Zellen, die als „ungeklärt" ausgewiesen sind.**

| Gruppe | warum ungelöst |
|---|---|
| `B106` `B406` `B6A5` | Ziffer kodiert die **Zutat** (Ölsamen / Sonnenblumenkerne / Nüsse), keine Zubereitung |
| `D300` `D422` `D483` `D655` `D753` | Ziffer kodiert die **Sorte** (Sachertorte / Linzer Torte) |
| `C433` | Hirse Mehl `000` gegen Braunhirse Mehl `100` — verschiedene Pflanzen |
| `C660` | Haferdrink ungesüßt `000` gegen gesüßt `300` — Rezepturvariante |
| `M113` | H-Milch entrahmt / fettarm / Vollmilch — Fettstufe |
| `P273` | Roséwein `000` gegen Rotling `100` |
| `W154` | Schinkenmettwurst `000` gegen Salami `500` |

`P273` und `W154` sind die beiden in C-33 vorab benannten Fälle; sie
bestätigen sich. **Kuration, kein Fehler der Regel** — das gilt aber für
weit mehr Fälle als erwartet.

`[annahme]` Die Regel könnte deutlich mehr lösen, wenn die ungeklärten
Zellen klassifiziert wären. Ob sie klassifizierbar sind, ist **nicht
gemessen** — bei Brot und Torten spricht der Augenschein dagegen, weil
die Ziffer dort eine Aufzählung ist.

---

## Schritt 5 — Vertreter, dritter Fall

Dritter Fall ergänzt: fehlt `100` und `000`, entscheidet das höchste
`sort_weight` innerhalb der Gruppe.

| | eindeutig | mehrere | ohne |
|---|---|---|---|
| alt, ohne dritten Fall | `[cmd]` 1.564 | `[cmd]` 129 | `[cmd]` 953 |
| alt, mit drittem Fall | `[cmd]` 2.065 | `[cmd]` 581 | `[cmd]` **0** |
| neu, ohne dritten Fall | `[cmd]` 1.567 | `[cmd]` 128 | `[cmd]` 1.019 |
| **neu, mit drittem Fall** | `[cmd]` **2.131** | `[cmd]` 583 | `[cmd]` **0** |

**Der dritte Fall beseitigt die Lücke vollständig.** Pumpernickel
bekommt einen Vertreter.

Der Preis steht daneben und ist nicht klein: `[cmd]` die Zahl der
Gruppen mit **mehreren** gleichrangigen Vertretern steigt von 128 auf
**583**. Wo bisher „kein Vertreter" stand, steht jetzt bei rund 450
Gruppen „mehrere gleichrangige" — die Entscheidung ist verschoben, nicht
getroffen. `[annahme]` Ein weiteres Merkmal (Namenslänge, wie in
`073_suchfilter.sql`) würde das vermutlich auflösen; gemessen ist es
nicht.

---

## Wo die Klassifikation streitbar ist

`[cmd]` 11 Zellen sind als strittig markiert. **Tom entscheidet diese,
nicht ich.** Ich habe jeweils entschieden, damit die Messung laufen
kann, und den Zweifel hier notiert.

### Die sieben Käse-Fettstufen — `M` 200/300/400/500/600/700/800

`[cmd]` 209 Einträge. Die Ziffer kodiert den Fettgehalt:

```
M6…600  Weichkäse mind. 45 % Fett i. Tr.
M6…700  Weichkäse mind. 50 % Fett i. Tr.
```

**Entschieden als `zubereitung`** — derselbe Käse, andere Fettstufe, also
bleibt er in der Gruppe. **Der Zweifel:** Für einen Nutzer, der Kalorien
zählt, sind 45 % und 50 % Fett *nicht* dasselbe Lebensmittel. Man könnte
sie als eigene Erzeugnisse führen. Dagegen spricht, dass die Suche dann
`Weichkäse` in sieben Gruppen zersplittert.

`[cmd]` Diese Entscheidung verhindert unter anderem, dass `M710` zerfällt
(Skyr gegen Frischkäsezubereitung) — der Fall bleibt damit ungelöst.

### Drei Trocknungszellen — `F` 400, `G` 400, `K` 400

`[cmd]` 42 Einträge. **Entschieden als `zubereitung`.** Die Aufgabe gibt
Trockenobst ausdrücklich als Zubereitung vor, das habe ich übernommen.

**Der Zweifel ist bei `G` 400 am größten:** getrocknete Kräuter
(`Schnittlauch getrocknet`, `Petersilienblatt getrocknet`) werden anders
verwendet und anders dosiert als frische — eher ein eigenes Erzeugnis
als eine Zubereitung. Die Aufgabe nennt genau diesen Fall als streitbar.

### `U` 700 — Rohpökelware

`[cmd]` 14 Einträge. **Entschieden als `zubereitung`** (geräuchert).
**Der Zweifel:** Rohpökelware ist ein eigenständiges Erzeugnis der
Fleischverarbeitung, kein bloß behandeltes Stück Fleisch — Schwarzwälder
Schinken ist nicht „Schweinefleisch, geräuchert".

---

## Was diese Messung nicht sagt

- **Sie sagt nicht, dass die Erzeugnisklasse falsch ist.** `[cmd]` An
  den Fällen, für die sie gebaut wurde, wirkt sie: `F201`, `F310`,
  `F603` zerfallen richtig, `T410` bleibt zusammen. Sie deckt nur zu
  wenig ab — vier Zellen von 204.

- **Sie sagt nicht, dass die 96 ungeklärten Zellen unklassifizierbar
  sind.** Gemessen ist, dass mein Verfahren dort kein gemeinsames
  Merkmal findet. `[annahme]` Bei Brot und Torten spricht der Befund
  dafür, dass keines existiert; bei anderen Zellen kann es an meinem
  Verfahren liegen. Das ist nicht getrennt gemessen.

- **Sie sagt nichts über die Suchqualität.** Es wurde keine einzige
  Suchanfrage ausgeführt.

- **Die Stichprobe ist 100 Gruppen von 1.375** — rund 7 %. Bei 47 gegen
  eine Schwelle von 95 ist der Abstand groß genug, dass eine größere
  Stichprobe die Aussage kaum kippt. `[annahme]` Eine Fehlerrechnung
  wurde nicht durchgeführt.

- **Die Stichproben von alt und neu sind nicht dieselben Gruppen.** Die
  Regel „jede n-te" zieht aus einer veränderten Grundmenge (1.400 gegen
  1.375), die Auswahl verschiebt sich also. `[cmd]` Der Vergleich 39
  gegen 47 ist deshalb ein Vergleich zweier Stichproben, nicht derselben
  Gruppen vorher und nachher. Für die Größenordnung reicht das; für eine
  exakte Differenz nicht.

- **Sie sagt nichts über die 11 strittigen Zellen.** Deren Einordnung
  ist meine Entscheidung, nicht ein Messergebnis, und sie beeinflusst
  die Zahlen: `[cmd]` allein die sieben Käsezellen umfassen 209
  Einträge.

- **`44-bls-codestruktur.md` ist weiterhin an dieser Stelle falsch** und
  wurde auftragsgemäß **nicht** korrigiert.

---

## Folgerung

Die Abnahme ist nicht erreicht: `[cmd]` 47 von 100 statt 95, für
Nicht-Gerichte 60 statt 95. Die Erzeugnisklasse repariert **einen realen
Teil** des Problems — die Säfte und Nektare —, aber dieser Teil ist
kleiner als in C-33 angenommen.

Was diese Messung an Brauchbarem liefert:

1. **Der dritte Vertreterfall wirkt vollständig** — `[cmd]` 0 Gruppen
   ohne Vertreter statt 953. Das ist unabhängig vom Rest verwendbar.
2. **Die Ursache der verbleibenden Mischungen ist benannt:** in `B`, `D`
   und `C` kodiert die Ziffer Zutat, Sorte oder Rezeptur — keine
   Kategorie, die sich in „Zubereitung gegen Erzeugnis" pressen lässt.
3. **Die Klassifikation liegt als Datendatei vor** und ist korrigierbar,
   ohne Code anzufassen. Elf Zellen warten auf Toms Entscheidung.

Ob C-29/C-30 auf dieser Grundlage folgen können, entscheidet Tom.
