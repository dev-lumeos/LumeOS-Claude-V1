# 171 — Health score und die fünf System-Scores

**Auftrag:** G-135 · **Datum:** 2026-08-21 · **Herkunft:** Claude Code
(Orchestrator) · **Stand:** gemessen am 2026-08-21

---

## Wie viele Marker treffen

### Die Spec sucht über Namen — das trägt nicht

`[cmd]` **SPEC_09 vergleicht drei Namensfelder:**

```js
v.biomarker_name === name || v.biomarker_common_name === name ||
v.biomarker_abbreviation === name
```

`[cmd]` **Über den Namen treffen 23 der 26 Spec-Marker.** Die drei
Fehlenden, einzeln geprüft:

| Marker | Befund |
|---|---|
| `Total Testosterone` | **Kein echter Fehler.** Der Bestand nennt ihn `Testosterone, Total` — **bei identischem LOINC 2986-8.** |
| `Prolactin` | **Echte Lücke.** Der Nutzer hat 4 Werte (2842-3), `biomarker_spec_enrichment` hat keine Zeile dazu. |
| `HOMA-IR` | **Kein Laborwert.** Er wird aus Glukose × Insulin gerechnet, steht in keinem Befund. |

`[read]` **Deshalb ordnet dieser Bau über LOINC zu, nicht über den
Namen.** Ein Namensvergleich verliert `Total Testosterone` und damit
ein Sechstel des Hormonsystems, ohne dass etwas fehlt.

### Die Gruppierung stand die ganze Zeit in der Tabelle

`[cmd]` **`medical.biomarker_spec_enrichment.system_groups`** — ein
Textarray, 49 Zeilen, davon **27 mit Gruppe:**

| System | Codes | Gewicht |
|---|---:|---:|
| cardiovascular | 7 | 0,25 |
| liver | 6 | 0,15 |
| hormonal | 6 | 0,20 |
| metabolic | 4 | 0,25 |
| kidney | 4 | 0,15 |

`[read]` **G-84 nannte Gruppierung und Gewichtung „zwei Unbekannte".**
Die eine steht in dieser Spalte, die andere in SPEC_09. **Beide waren da,
bevor die Frage gestellt wurde.**

### Was der Nutzer davon hat

`[cmd]` **18 der 37 Marker des Kontos `dev@lumeos.app` fallen in ein
System.** Die übrigen 19 verteilen sich so:

- **10 stehen in `enrichment`, aber ohne `system_groups`** — Ferritin,
  Hämoglobin, Vitamin B12, Vitamin D, SHBG, LH, Hämatokrit, Magnesium,
  Gesamtcholesterin, freies Testosteron.
- **9 fehlen ganz** — ApoB, Calcium, FSH, IGF-1, Prolactin, PSA, Zink
  und zwei Zeilen ohne LOINC (`Unbekannter Marker X`,
  `Glucose [Mass/volume] …`).

`[cmd]` **ApoB ist der Fall, den Tom in G-84 genannt hat**, und er
besteht weiter: **der Bestand führt ihn unter 1884-6, `enrichment`
unter 1869-7** — dieselbe Grösse, zwei Codes. **LDL dagegen trifft**
(13457-7).

---

## Was die fünf Systeme zeigen

`[cmd]` **Am 2026-08-21 im Browser gemessen, Konto `dev@lumeos.app`:**

| System | Score | Marker | Gewicht |
|---|---:|---|---:|
| Herz-Kreislauf | **90** | 5 von 6 | 25 % |
| Stoffwechsel | **72** | 3 von 3 | 25 % |
| Hormone | **100** | 6 von 6 | 20 % |
| Leber | **92** | 3 von 6 | 15 % |
| Niere | **75** | 1 von 4 | 15 % |
| **Gesamt** | **86** | 5 von 5 Systemen · 100 % des Gewichts | |

`[cmd]` **Nachgerechnet:** 90·0,25 + 72·0,25 + 100·0,20 + 92·0,15 +
75·0,15 = 85,55 → **86.**

### Der Stoffwechsel, nachgerechnet — und eine eigene Fehlmessung

`[cmd]` **Drei Marker, jüngste Messung vom 2026-06-05:**

| Marker | Wert | Laborbereich | Optimalband | Punkte |
|---|---:|---|---|---:|
| Glukose (nüchtern) | **102** | 70–99 | 70–85 | **40** — über dem Laborbereich |
| Insulin (nüchtern) | 7,4 | 2,6–24,9 | 2–6 | **75** — über dem Optimalband |
| HbA1c | 5,4 | 4,0–5,7 | 4,5–5,4 | **100** |

(40 + 75 + 100) / 3 = 71,67 → **72.**

`[read]` **Meine SQL-Vorhersage sagte 83 und war falsch.** Sie sortierte
nach `created_at` statt nach dem Befunddatum und griff damit die
**ältesten** Werte (Glukose 88 statt 102). **Die Anzeige hat recht** —
sie nimmt die jüngste Messung, dieselbe, die die Markerliste zeigt.

`[read]` **Zweite eigene Fehlmessung im selben Auftrag:** Eine frühere
SQL verlangte `lab_reference_*` auf der Rohzeile und fand deshalb nur
13 statt 18 Marker. **Die Anwendung kennt zusätzlich den
Katalogrückfall.** Beide Male war die gemessene Zahl der Anzeige die
richtige.

---

## Wie Lücken dargestellt sind

**Jede Kachel nennt ihre Vollständigkeit** — `3 von 6 Markern`, nicht
nur `92`. `[read]` Dasselbe Muster wie bei den Nährstoffen (G-121):
*„11 von 14 Positionen"*.

`[cmd]` **Und der Kopf nennt das Gewicht:** *„5 von 5 Systemen · 100 %
des Gewichts erfasst"*. **Ein Wert aus zwei Systemen ist etwas anderes
als einer aus fünf, auch wenn beide 82 heissen.**

### Vier Regeln für Lücken, alle geprüft

| Fall | Verhalten | Test |
|---|---|---|
| System ohne Marker | `score: null`, Kachel zeigt `—` | ✓ |
| System ohne jeden Wert | Gewicht fällt aus `totalW`, die übrigen normalisieren | ✓ |
| Gar kein System mit Wert | **`score: null`, nicht 0** | ✓ |
| Marker ohne Laborbereich | zählt in `ohne_bereich`, geht **nicht** in den Schnitt | ✓ |

`[read]` **Die Spec liefert `score: 0`, wenn nichts da ist.** *Null wäre
eine Aussage („alles schlecht") statt einer Leerstelle* — deshalb
`null`.

### Kein Statuswort

`[cmd]` **Die Spec kennt `optimal | normal | warn | critical`.**

`[read]` **`warn` und `critical` sind Urteile über eine Lage.** G-60 hat
schon *„Optimal"* entschärft (*„benennt keine Lage"*), und die
Kopfzeile sagt selbst *„no diagnosis, no therapy advice"*. **Gezeigt
werden die Zahl, ihre Herkunft und ihre Vollständigkeit** — die
Schwellen stehen im Rechenweg unter der Karte:

```
je Marker: im Laborbereich und im Optimalband 100 · im Laborbereich 75 ·
ausserhalb des Laborbereichs 40
Zuordnung ueber LOINC aus biomarker_spec_enrichment.system_groups
```

`[read]` **Auch die Punktevergabe weicht von der Spec ab, und zwar
begründet.** Die Spec kennt sechs Flags über eine Spalte
`current_flag`, die es bei uns nicht gibt. Unsere Entsprechung sind
`lage` und `optimalLage` — **getrennt geführt seit G-84**, weil Tom
entschieden hat: *„Ein Laborbereich ist die Referenz des Labors. Ein
Optimalband ist eine Empfehlung aus der Literatur."* **Der Laborbereich
wiegt deshalb schwerer.**

---

## Was an der Spec nicht stimmt

**1. Der Namensvergleich trägt nicht** (siehe oben) — er verliert
`Total Testosterone` an einer blossen Schreibweise.

**2. `?? 50` erfindet eine Zahl.** `[cmd]` `FLAG_SCORE[val.current_flag]
?? 50` gibt einem unbekannten Flag 50 Punkte. **Hier bekommt ein Marker
ohne Bereich keinen Punktwert, sondern wird gezählt** (`ohne_bereich`).

**3. `score: 0` bei leerer Datenlage** — behandelt „nichts gemessen"
wie „alles schlecht". Ersetzt durch `null`.

**4. `HOMA-IR` steht als Marker in `SYSTEM_MARKERS`**, ist aber ein
Rechenwert aus zwei anderen. `[cmd]` In keinem Befund, in keinem
Katalog. **Damit hat `metabolic` faktisch drei Marker, nicht vier.**

**5. Fünf `spec_name` stehen doppelt** — `LDL Cholesterol` als 2089-1
**und** 13457-7, ebenso Glukose, Hämatokrit, Magnesium, Vitamin D.
`[cmd]` **Ein naives Zählen ergibt „7 von 7" für Herz-Kreislauf, obwohl
es sechs Substanzen sind.** Gezählt werden deshalb Substanzen, nicht
Zeilen; und ein Marker, der unter beiden Codes vorläge, geht nur einmal
in den Schnitt (Test vorhanden, im Bestand tritt der Fall heute nicht
auf).

`[read]` **Damit sind es fünf Funde, nicht die sieben aus A-20** — jene
zählte andere Stellen (Magnesium/Methämoglobin, invertierte Skala,
Formelfehler). **Die hier gefundenen betreffen ausschliesslich das
Scoring.**

---

## Was gemessen wurde

| Prüfung | Ergebnis |
|---|---|
| Spec-Marker über Namen | **23 von 26** |
| davon echte Lücken | **1** (Prolactin); +1 Rechenwert, +1 Namensvariante |
| Marker des Kontos in einem System | **18 von 37** |
| Gesamtwert | **86**, nachgerechnet 85,55 |
| Systeme mit Wert | **5 von 5**, Gewicht 100 % |
| Tests | **467 von 467 grün** (14 neue) |
| Attrappen auf `/v2/medical` | **5 gerendert** (Auftrag nannte 6) |
| Konsolenfehler | 2 (`data-mode`, bekannt aus G-123), **0 SVG** |
| **Zeilenschutz** | **`test-user`: keine Score-Karte, „0 von 5 Systemen · 0 %"** |

**Bildschirmfotos:** `backup/g135-medical-{1440,375}-{hell,dunkel}.png`.

### Der Zeilenschutz — und ein Fehlalarm auf dem Weg

`[cmd]` **Ein Zwischenstand zeigte beiden Konten dieselben 81** — auch
dem Konto mit 0 Biomarkern. **Das sah wie ein Leck aus und war keins:**
In `MedDashboard` stand eine Ableitung aus `calcOverallHealthScore()`
und `SYSTEM_META`, also aus den **erfundenen Zahlen des Entwurfs**. Die
sind für jedes Konto gleich.

`[read]` **Der Befund ist trotzdem lehrreich:** Eine Attrappe, die wie
echte Daten aussieht, ist von einem Zeilenschutzleck nicht zu
unterscheiden, solange man nur auf die Zahl schaut. **Erst der Vergleich
zweier Konten hat es aufgedeckt** — und der gehört deshalb in jeden
Auftrag.

---

## Geänderte Dateien

| Datei | Änderung |
|---|---|
| `apps/web/src/lib/medical/systemscore.ts` | **neu** — die Rechnung |
| `apps/web/src/lib/medical/__tests__/systemscore.test.ts` | **neu** — 14 Tests |
| `apps/web/src/lib/medical/lesen.ts` | `ladeSystemgruppen()` |
| `apps/web/src/app/v2/medical/echtdaten.ts` | Feld `scores` |
| `apps/web/src/app/v2/medical/page.tsx` | Score serverseitig rechnen |
| `apps/web/src/app/v2/medical/ansicht.tsx` | Karte angebunden, Marke weg |
| `apps/web/src/components/shell/__tests__/v2-attrappen.test.ts` | Erwartung 5→4 und 8→7 |

### Die Attrappenzahl — und was sie nicht sagt

`[cmd]` **Die Karte „Health score" trug NIE eine Marke**, auch nicht in
`HEAD`: sie stand seit G-84 ohne `attrappe={ATTRAPPE}` da, obwohl sie
mit Entwurfszahlen rechnete. **Die Zahl in `ansicht.tsx` bleibt deshalb
bei 4** — angebunden wurde eine Kachel, die nie als Attrappe
gekennzeichnet war.

`[read]` **Das ist der eigentliche Befund hinter dem Fehlalarm oben:**
Eine unmarkierte Kachel mit erfundenen Zahlen ist von einer echten
nicht zu unterscheiden. **Der Attrappenzähler hätte sie nie gemeldet.**

`[cmd]` **Die zweite Änderung im Test (8→7) stammt nicht aus diesem
Auftrag:** `tab-tracking.tsx` hatte bereits eine Marke weniger — die
Medikationskachel liest `user_medications`. Die Änderung lag
unversioniert im Arbeitsbaum; **sie erklärt auch, warum der Auftrag 6
Attrappen nannte und 5 gerendert werden.**

**Die Alerts sind nicht angefasst**, wie beauftragt. **Kein Schema
geändert, `nutrition` nicht berührt, die Markerliste unverändert.**

---

## Was offen bleibt

**1. Prolactin fehlt in `enrichment`.** `[cmd]` 4 Werte im Bestand,
LOINC 2842-3, keine Zeile. **Das ist ein Codex-Auftrag** — mit ihm
hätte `hormonal` sieben statt sechs Marker.

**2. ApoB hat zwei LOINC-Codes.** `[cmd]` Bestand 1884-6, `enrichment`
1869-7. **Ebenfalls Codex.** Bis dahin fehlt Herz-Kreislauf genau der
Marker, den Tom in G-84 genannt hat.

**3. Zehn Marker stehen in `enrichment` ohne `system_groups`** —
darunter Gesamtcholesterin, das inhaltlich zu `cardiovascular` gehört.
`[read]` **Ob sie zugeordnet werden sollen, ist eine
Produktentscheidung**, keine Datenlücke.

**4. `HOMA-IR` wäre rechenbar.** `[cmd]` Glukose und Insulin liegen
beide vor. **Nicht gebaut** — die Spec nennt ihn als Marker, nicht als
Rechenweg, und ein erfundener vierter Marker wäre schlechter als drei
echte.

**5. Sechs Hilfsskripte liegen unter `tools/_g135-*.mjs`.**
`[cmd]` `_g135-zeilenschutz.mjs` (zwei Konten im Vergleich) hat
Zweitnutzen, die übrigen fünf sind Wegwerfware.
