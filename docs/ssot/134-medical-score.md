# 134 — Health score, Alerts und Insights im Medical-Modul

**Auftrag G-84** · gemessen am 2026-08-20 gegen die laufende Instanz,
Konto `dev@lumeos.app` (`d15fb34f-…ae1a6`).

Herkunftsmarker: `[cmd]` gemessen · `[read]` gelesen · `[annahme]` angenommen.

---

## Was die Alerts zählen

**Sie zählten nichts.** `[cmd]` Im Kopf standen `Health score 87` aus
`calcOverallHealthScore()` und `6 alerts` aus `generateAlerts()` — beide
über den Entwurfskatalog `daten.ts` gerechnet, beide ohne jeden Bezug zu
den Befunden der angemeldeten Nutzerin. Dass die Zahl **6** dabei
zufällig mit der echten Zahl übereinstimmte, macht es nicht besser: sie
hätte sich bei jedem neuen Befund nicht bewegt.

**Jetzt zählt der Kopf die Lage der jüngsten Messung je Marker** — genau
das, was die Liste in jeder Zeile ohnehin zeigt. `zuReihen` hat die
jüngste Messung bereits gewählt und `lage`/`optimalLage` daran
gerechnet; die neue Rechnung summiert nur.

### Zwei Zahlen, nicht eine

`[read]` **Toms Entscheidung:** *„Ein Laborbereich ist die Referenz des
Labors — die steht auf dem Befund. Ein Optimalband ist eine Empfehlung
aus der Literatur. Sie zu addieren macht aus einer Messung und einer
Meinung eine Zahl."*

`[cmd]` Gemessen über 37 Marker:

| | Zahl | Herkunft der Grenze |
|---|---:|---|
| **ausserhalb des Laborbereichs** | **2** | Befund des Labors, sonst Katalog-Rückfall |
| **nur ausserhalb des Optimalbands** | **4** | `biomarker_reference_ranges`, `range_type='optimal'` |
| Summe — der Filter „Non-optimal only" | **6** | |
| ohne hinterlegten Bereich | 1 | zählt nirgends, kann nirgends „ausserhalb" sein |

`[cmd]` **Die sechs im Klartext**, damit die Zahl nachprüfbar ist:

| Marker | Wert | Grenze | Lage |
|---|---:|---|---|
| Glucose (fasting) | 102 mg/dL | Labor 70–99 | über Laborbereich |
| Glucose [Mass/volume] in Serum or Plasma | 102 mg/dL | Labor 70–99 | über Laborbereich |
| ALT | 28 U/L | optimal `<25 U/L` | nur ausserhalb Optimalband |
| Creatinine | 1,14 mg/dL | optimal 0,8–1,1 mg/dL | nur ausserhalb Optimalband |
| Homocysteine | 9,8 µmol/L | optimal `<7 µmol/L` | nur ausserhalb Optimalband |
| Insulin (fasting) | 7,4 µIU/mL | optimal 2–6 µIU/mL | nur ausserhalb Optimalband |

**Wer schon ausserhalb des Laborbereichs liegt, wird nicht zweimal
gezählt.** Sonst wäre die Summe grösser als die Zahl der Marker. Glucose
hat ohnehin kein Optimalband, fällt also nur in die erste Spalte.

### Das Wort „Alert" ist weg

`[read]` **Toms Auflage:** *„Es sagt ‚etwas stimmt nicht' — das ist ein
Urteil. ‚1 über dem Bereich' sagt dasselbe ohne Wertung."*

Der Kopf sagt jetzt `2 outside lab range` und `4 outside optimal band`.
Die Unterzeile derselben Kachel schreibt *„no diagnosis, no therapy
advice"*; ein Alarmwort daneben hätte ihr widersprochen. **Ein Wert über
dem Bereich ist eine Messung** — was er bedeutet, sagt die Anzeige
nicht, und das ist keine Auslassung, sondern die Regel.

### Die Brücke zum Filter

`[read]` **Toms zweite Auflage:** *„Wenn der Kopf 1 und 5 zeigt und der
Filter ‚Non-optimal only · 6', muss erkennbar sein, dass es dieselben
sechs sind."*

Unter der Kopfzeile steht deshalb ausgeschrieben:

> `2 + 4 = 6 markers — die gleichen, die „Non-optimal only" in
> Biomarkers zeigt · 1 ohne hinterlegten Bereich`

`[cmd]` Der Filter in `marker-liste.tsx:183-189` bildet dieselbe
Vereinigung (`lage` **oder** `optimalLage` ausserhalb). Beide Zahlen
stammen aus derselben `MarkerReihe[]`; sie können nicht auseinanderlaufen.

### Gebaut ist eine reine Rechnung

`apps/web/src/lib/medical/lagezaehlung.ts` — ohne Datenbank, ohne React,
nach dem Muster von `lib/training/auswertung.ts` (G-69). Fünf Prüfungen
in `__tests__/lagezaehlung.test.ts` decken die Doppelzählung, die
Unterschreitung, den Leerfall und die Gruppierung ab.

### Ein Datenbefund, der dabei aufgefallen ist

`[cmd]` **Glukose steht zweimal in der Liste** — als zwei Marker, mit
einer Messung von 102 mg/dL:

| `loinc_code` | `marker_name_snapshot` | Werte | Zeitraum |
|---|---|---:|---|
| `1558-6` | Glucose (fasting) | 4 | 2025-12-06 … 2026-06-05 |
| *(NULL)* | Glucose [Mass/volume] in Serum or Plasma | 1 | 2026-06-06 |

Die zweite Zeile hat **gar keinen LOINC-Code** und fällt deshalb auf die
Schlüsselung über den Namen zurück — sie wird zu einem eigenen Marker.
**Der Kopf sagt darum „2 outside lab range", wo ein Mensch einen
erhöhten Nüchternglukosewert hat**, aufgenommen an zwei aufeinander
folgenden Tagen.

`[annahme]` Es sind mit hoher Wahrscheinlichkeit dieselbe Grösse. **Nicht
geändert**, weil eine Zusammenlegung eine Entscheidung über Identität
ist: ob ein unbenannter Rohmarker automatisch einem LOINC zugeschlagen
werden darf, gehört zur Zuordnung (C-72), nicht in eine Zählung. Es ist
einer der beiden nicht zugeordneten Rohmarker aus dem Abschnitt unten.

---

## Ob der Health score rechenbar ist

**Nein — und er ist deshalb ersatzlos aus dem Kopf entfernt**, nicht als
Attrappe stehengeblieben.

### Die Gruppierung trägt 23 von 37

`[cmd]` `medical.biomarker_spec_enrichment` führt **44 Zeilen in 8
Kategorien** (`cbc`, `hormone`, `inflammation`, `lipid`, `liver`,
`metabolic`, `thyroid`, `vitamins_minerals`). Über den LOINC-Code
verbunden:

| | Marker | Werte |
|---|---:|---:|
| zuordenbar | **23** | 93 |
| nicht zuordenbar | **14** | **47 von 140** |

**Ein Drittel der Werte fiele stillschweigend heraus.**

### Die 14 zerfallen in zwei sehr verschiedene Gruppen

`[read]` **Toms Auflage:** *„Melde beide getrennt, mit den LOINC-Paaren
im Klartext. Die fünf sind ein Codex-Auftrag von zwanzig Minuten; die
neun sind eine Frage an die Spec."*

**a) Fünf LOINC-Abweichungen** — die Grösse ist beidseits da, nur unter
verschiedenen Codes. Das ist Zuordnungsarbeit, keine fachliche Frage:

| Marker | Code der Daten | Code der Spec |
|---|---|---|
| Glucose | `1558-6` | `2345-7` |
| LDL Cholesterol | `13457-7` | `2089-1` |
| Hematocrit | `4544-3` | `20570-8` |
| Vitamin D (25-OH) | `14635-7` | `1989-3` |
| Magnesium (RBC) | `2601-3` | `2614-6` |

`[annahme]` Bei Glukose und Vitamin D sind die Codepaare **nicht
bedeutungsgleich** — `1558-6` ist *Fasting* glucose, `2345-7` die
allgemeine Serumglukose; das ist derselbe Unterschied, den G-80 an
`fasting_status` beschrieben hat. Eine Gleichsetzung ist eine
fachliche Entscheidung, kein Tippfehler.

**b) Neun echte Lücken** — die Spec kennt sie gar nicht:

ApoB · PSA · Zink · FSH · IGF-1 · Prolaktin · Calcium
· zwei Rohmarker ohne LOINC-Code (darunter die zweite Glukosezeile)

**ApoB fehlt, und LDL ist nur über eine Codeabweichung erreichbar** —
die beiden Marker, an denen kardiovaskuläres Risiko heute gemessen wird.

### Warum der Score deshalb weg ist statt blass

`[read]` **Toms Entscheidung:** *„Ein Gesundheitswert, der die beiden
wichtigsten Lipidmarker stillschweigend auslässt, ist schlechter als
keiner — er sieht aus wie ein Gesamtbild und ist ein Ausschnitt."*

Dazu kommt eine zweite, ungetroffene Entscheidung: **die Gewichtung.**
Der Entwurf setzt `cardiovascular .25 · metabolic .25 · hormonal .20 ·
liver .15 · kidney .15`. `[cmd]` Diese Zahlen stehen **nirgends in der
Datenbank** und in keiner Spezifikation — sie stammen aus
`daten.ts:SYSTEM_WEIGHTS`. **Eine Gewichtung ist eine Entscheidung, keine
Messung.** Sie zu übernehmen, weil sie im Entwurf steht, hiesse sie
treffen, ohne sie zu treffen.

`[cmd]` Die acht Kategorien der Datenbank passen ausserdem **nicht** auf
die fünf Systeme des Entwurfs (`cbc`, `inflammation`, `thyroid` und
`vitamins_minerals` haben dort keine Entsprechung; `kidney` hat in der
Datenbank keine). Auch das ist eine Zuordnungsentscheidung.

**Die Kachel im Dashboard bleibt** — sie trägt die Attrappenmarke und
sagt an Ort und Stelle, dass die Zahlen erfunden sind. `[read]` Das ist
die Regel aus G-37: *„Was das Mockup zeigt, bleibt."* **Der Kopf ist
etwas anderes** — dort stand die Zahl ohne Marke, neben zwei echten.

---

## Was `Tracking` und `Insights` bräuchten

Beide Tabs sind vollständig Attrappe und bleiben es. `[cmd]` Alle 20
Marken im Modul sind unverändert (8 in `tab-tracking.tsx`, 7 in
`tab-biomarker.tsx`, 5 in `ansicht.tsx`).

### `Tracking` · 7 Einträge

Zwei Unterreiter: **Symptome** und **Medikamente**.

`[cmd]` **Für Symptome gibt es keine Tabelle** — im gesamten Schema
existiert nichts, was auf `symptom` passt (geprüft gegen
`information_schema.tables`). Der Tab zeigt fünf erfundene Symptome aus
`daten.ts` und eine Zuordnung Symptom → Biomarker
(`SYMPTOM_BIOMARKER_MAP`), die es als Daten ebenfalls nicht gibt.
**Es bräuchte eine Tabelle mit Zeilenschutz** (Symptom, Datum, Stärke,
gelöst ja/nein) — und die Zuordnungstabelle wäre eine fachliche
Entscheidung, keine Ableitung.

`[cmd]` **Für Medikamente gibt es das Schema bereits:**
`medical.user_medications` (**2 Zeilen**),
`medical.medication_products` (124), `medication_formulations` (119),
`medication_active_substances` (56). Der Tab zeigt stattdessen vier
erfundene Präparate aus `MEDICATIONS_V2`. **Der Knopf „Add medication"
ist bereits als `InEntwicklungKnopf` gesperrt** mit der Begründung
*„Medikamente brauchen eine Tabelle `medical.medications`"* — `[cmd]`
**diese Begründung ist überholt**, das Schema heisst
`medical.user_medications` und existiert. Der Tab ist damit der
nächstliegende Anbindungskandidat des Moduls.

`[cmd]` **Was den Medikamenten fehlt, ist die Überwachung.** Die
Attrappe zeigt `monitoring_overdue` und `next_due` — solche Spalten gibt
es in `user_medications` nicht. Vier der sechs Einträge in der
Alerts-Kachel sind genau diese erfundene Fälligkeit.

### `Insights` · 6 Einträge

Vier Flächen: **Korrelationen**, **Supplement-Wirksamkeit**,
**Bevölkerungsvergleich**, **Arztbericht**.

`[cmd]` **Korrelationen** (`CORRELATIONS`) und **Supplement-Wirksamkeit**
(`SUPPLEMENT_BIOMARKER_MAP`, `calcSupplementEffectiveness`) haben keine
Datengrundlage. Es gibt `supplements.supplement_catalog` und
`supplements.supplement_interactions`, aber **keine Brücke Supplement →
Biomarker**. Eine Wirksamkeitsaussage bräuchte ausserdem Messungen vor
und nach der Einnahme über einen Zeitraum — und wäre, sobald sie
„wirkt/wirkt nicht" sagt, genau die Bewertung, die das Modul nicht
abgibt.

`[cmd]` **Bevölkerungsvergleich** („vs. men 35–45 · NHANES reference
distribution") hat keine Quelle im Repo. `biomarker_reference_ranges`
führt eine Spalte `population`, die **560×** auf `general` steht (G-80
gemessen). Perzentile bräuchten eine Verteilung, nicht einen Bereich.

`[read]` **Arztbericht** ist die einzige Fläche, die ohne neue Daten
auskäme: sie fasst zusammen, was die Marker ohnehin hergeben. Sie ist
kein Datenproblem, sondern ein Bauauftrag (PDF, Struktur, rechtlicher
Hinweis).

---

## Was Attrappe bleibt und warum

| Fläche | Grund |
|---|---|
| `Health score` (Dashboard-Kachel) | 14 von 37 Markern nicht gruppierbar; Gewichtung ist eine ungetroffene Entscheidung |
| `Alerts` (Dashboard-Kachel) | zeigt vier erfundene Medikamenten-Fälligkeiten; `next_due` gibt es nicht |
| `Quick actions` | Ziele teils ungebaut |
| `Last panel` | „Days overdue" braucht ein Intervall, das nirgends steht |
| `Non-optimal markers` | inhaltlich dasselbe wie die neue Kopfzeile, aber über den Entwurfskatalog |
| `Tracking` · Symptome | keine Tabelle im Schema |
| `Tracking` · Medikamente | Schema da (2 Zeilen), Überwachungsspalten fehlen |
| `Insights` · Korrelationen | keine Datengrundlage |
| `Insights` · Supplement-Wirksamkeit | keine Brücke Supplement → Biomarker |
| `Insights` · Bevölkerungsvergleich | keine Verteilung, `population` 560× `general` |
| `Insights` · Arztbericht | kein Datenproblem, ein Bauauftrag |

**Nur der Kopf ist angebunden.** `[read]` Das ist Absicht: er stand
neben zwei echten Zahlen und trug keine Marke — dort ist eine erfundene
Zahl etwas anderes als in einer markierten Kachel.

---

## Nachweis

| Prüfung | Ergebnis |
|---|---|
| `pnpm gate` | 8/8 Aufgaben grün |
| Typecheck + Tests, ohne Cache erzwungen | 3/3, **393 Tests grün, 0 rot** (vorher 388 — fünf neue) |
| Attrappenmarken im Modul | **20**, unverändert |
| Kopfzahlen gegen SQL | **2 / 4 / 6 / 1** — Skript bildet `befund.ts` inklusive Textbereichs-Zerlegung nach |
| Angemeldet | `dev@lumeos.app`, hell und dunkel |
| Breiten | 1440 · 1024 · 768 · **375 px** — beide Pillen und die Brückenzeile brechen um, kein Überlauf |
| Zeilenschutz | `test-user@lumeos.local` (anmeldbar) sieht **0** Marker — auch beim ausdrücklichen Abfragen der fremden UUID |

`[cmd]` **Ein Messfehler der eigenen Arbeit, korrigiert:** die erste
SQL-Zählung ergab **1 + 5** statt **2 + 4**. Sie verglich nur die
numerischen Spalten. `befund.ts:bereichAusText` zerlegt aber auch
**Textbereiche** (`<5.7`, `>40`, `0.8–1.1`) in Grenzen — `[cmd]` von 560
Zeilen in `biomarker_reference_ranges` tragen die meisten nur Text. Die
Anzeige war richtig, die Prüfung war es nicht. **Erst der Blick auf die
gerenderte Seite hat es gezeigt**, nicht der Typecheck.

## Geändert

| Datei | |
|---|---|
| `apps/web/src/lib/medical/lagezaehlung.ts` | **neu** — die reine Rechnung |
| `apps/web/src/lib/medical/__tests__/lagezaehlung.test.ts` | **neu** — fünf Prüfungen |
| `apps/web/src/app/v2/medical/ansicht.tsx` | Kopf: zwei echte Zahlen statt Score und „alerts", Brückenzeile zum Filter |

## Offen — für Tom

1. **Die fünf LOINC-Abweichungen** sind ein Codex-Auftrag. Zwei davon
   (Glukose, Vitamin D) brauchen vorher eine fachliche Entscheidung,
   weil die Codepaare nicht dasselbe messen.
2. **Die neun Lücken** sind eine Frage an die Spec — ApoB und Calcium
   wiegen dabei am schwersten.
3. **Die doppelte Glukosezeile** — ein Rohmarker ohne LOINC erzeugt
   einen zweiten Marker und damit eine zweite Zählung.
4. **Die Gewichtung der Systeme** ist ungetroffen; ohne sie gibt es
   keinen Score, auch wenn die Gruppierung vollständig wäre.
5. **`medical.user_medications` existiert** — die Sperrbegründung am
   Knopf „Add medication" nennt eine Tabelle, die es unter anderem Namen
   längst gibt.
