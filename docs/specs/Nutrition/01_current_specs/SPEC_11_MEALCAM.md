# SPEC_11 — MealCam

**Stand 2026-09-07.** Loest die Kurzfassung in `ADR_MEALCAM_V1.md`
ab und praezisiert `ADR_MEALCAM_CONSENT.md`.

Quellen: `docs/BrainstormDocs/Nutrition/mealcambrainstorm.md`
(Blueprint V1), `docs/ssot/44-bls-codestruktur.md` (gemessen
2026-08-13), `ADR_MEALCAM_V1.md`, `ADR_MEALCAM_CONSENT.md`,
`SPEC_03` Flow 5, `SPEC_04` Feature 8, E-20, E-40, E-43, C-378.

---

## 1 · Was MealCam ist

**Eine Kette, die aus einem Foto interne Food-IDs macht** — **kein
Modell, das Naehrwerte errechnet.**

    Foto
      -> Regionen erkennen
      -> sichtbare Eigenschaften bestimmen
      -> Kandidaten aus dem BLS holen
      -> so genau aufloesen, wie die Evidenz reicht
      -> Portion getrennt schaetzen
      -> Nutzer bestaetigt
      -> Meal Items schreiben

`[read]` **Der Unterschied zum naheliegenden Weg ist der Kern:**
**das Modell waehlt aus einer uebergebenen Kandidatenliste, es
erinnert sich nicht an IDs.**

`[cmd]` **Sonst muesste es 7.140 Lebensmittel auswendig kennen** —
**und waere am Tag der naechsten BLS-Version falsch.**

---

## 2 · Die drei Achsen stehen im BLS-Code

`[cmd]` **Gemessen 2026-08-13, `docs/ssot/44-bls-codestruktur.md`.**

    V 123 456
    ^ ^^^ ^^^
    |  |   +-- Stellen 5-7: Zubereitung
    |  +------ Stellen 2-4: Lebensmittel
    +--------- Stelle 1:   Warengruppe (20 Gruppen)

### Warengruppe

`[cmd]` **20 Gruppen.** `X` 1.165 und `Y` 885 sind **2.050
Fertiggerichte** — **genau das, was bei der Suche vor dem rohen
Filet stand.**

### Zubereitung

`[cmd]` **59 Codes mit mindestens 20 Eintraegen. Die haeufigsten:**

    000   984   keine Zubereitungsvariante
    100   847   roh
    200   398   tiefgefroren
    132   231   gekocht
    182   228   gebraten (Pfanne)
    162   217   gebraten (Ofen)
    600   212   geraeuchert
    152   149   geduenstet
    142   144   geschmort
    172    96   gegrillt

`[read]` **Alle Geschwister auf derselben Ebene.** `[read]`
**`gekocht` (132) ist kein Elternteil von `gegrillt` (172)** —
**der Blueprint zeichnet das falsch** (Punkt 3:
`Cooked -> Grilled | Roasted | Fried`).

**Tom, 2026-09-07:** *,,wenn sie gekocht ist ist sie nicht
gegrillt."*

`[cmd]` **Und `000` ist nicht *roh*** — dort stehen Weizenknusperbrot,
Limonade, Brownies. **`100` ist roh.**

### Was daraus folgt

`[read]` **Die Facetten aus Blueprint Punkt 3 sind keine neue
Taxonomie** — **sie stehen im Code.**

`[read]` **Und die Regel aus `44-…` gilt auch hier:** *,,Bevor eine
Rangordnung gebaut wird: nachsehen, ob die Quelle sie
mitliefert."*

`[cmd]` **`sort_weight` ist bei allen 7.140 gefuellt** — **X und Y
stehen auf null.** **Der Retriever braucht keine eigene
Gewichtung.**

---

## 3 · Aufloesungsgrade

**Vier Zustaende, mechanisch am BLS-Code definiert:**

    EXACT_MATCH    alle sieben Stellen bestimmt
    PARENT_MATCH   Stellen 1-4 sicher, 5-7 offen
    AMBIGUOUS      mehrere Kandidaten bleiben plausibel
    NO_MATCH       kein geeigneter interner Eintrag

`[read]` **`PARENT_MATCH` heisst nicht *,,gekochte Huehnerbrust"***
— **es heisst *,,Huehnerbrust, Zubereitung unbestimmt"*.**

`[read]` **Und das ist genau die Grenze, die ein Foto zieht:** **die
Warengruppe sieht man, das Garverfahren oft nicht.**

`[cmd]` **`172` gegrillt und `162` gebraten (Ofen) unterscheiden sich
in einer Stelle** — **und auf einem Foto meist gar nicht.**

### `EXACT_MATCH` wird nicht erzwungen

`[read]` **Ein Parent-Treffer ist ein Erfolg, kein Fehlschlag.**

`[read]` **Wer erzwingt, dass immer eine Leaf-ID gewaehlt wird, baut
eine Maschine, die raet.**

---

## 4 · Was ein `PARENT_MATCH` in `meal_items` schreibt

`[cmd]` **`meal_items.nutrients` ist Pflicht und wird eingefroren.**
`[cmd]` **Ein Parent hat keine BLS-ID mit Naehrwerten.**

**Offen, zu entscheiden vor dem Bau.** Drei Wege:

`[read]` **Durchschnitt der Kinder** — **eine erfundene Zahl,
widerspricht C-378.**

`[read]` **Das haeufigste Kind** — **eine Annahme, die niemand
sieht.**

`[read]` **Keine Naehrwerte, wie ein Quick-Add-Posten** — **ehrlich,
aber der Nutzer bekommt keine Kalorien.**

`[cmd]` **Seit G-340 gibt es den Fall bereits:** `food_source =
'manual'` **traegt `nutrients` leer und `amount_g` als 1.**

`[read]` **Der dritte Weg folgt C-378** — *,,wenn die Daten nicht da
sind, erfinden wir sie nicht."* `[read]` **Und er hat einen
Ausweg: der Nutzer waehlt die Zubereitung nach, dann wird aus dem
Parent ein Exact.**

---

## 5 · Sichtbarkeit ist ein Datentyp

**Fuer jede Eigenschaft wird festgehalten, ob sie aus dem Bild
bestimmbar war.**

    VISIBLE
    PARTIALLY_VISIBLE
    NOT_VISIBLE

**Quellen:** `IMAGE`, `CROP`, `OCR`, `BARCODE`, `USER`, `DATABASE`,
`CONTEXT`.

`[read]` **Der Grund ist ein Fehler, der heute dreimal passiert
ist:** **eine Luecke wurde als *unbekannt* behandelt, wo sie *nicht
bestimmbar* heisst.**

`[cmd]` **C-398: die Vitamin-A-Funktion stieg bei jeder
Komponentenluecke aus, statt die vorhandenen zu summieren.**

**Tom, 2026-09-02:** *,,eine summe kann man bilden mit 0."*

### Die Regel

`[read]` **Eine Nutzerkorrektur an einer `NOT_VISIBLE`-Eigenschaft
darf nicht so ins Training gehen, als haette das Modell sie aus dem
Bild erkennen muessen.**

`[cmd]` **Beispiel: Salzmenge, Oelmenge, exakte Grammzahl,
Garzeit** — **nichts davon steht auf dem Foto.**

---

## 6 · Portion ist ein eigener Layer

**Erkennung und Mengenschaetzung sind zwei Probleme.**

    estimated_grams
    uncertainty
    method
    reference

`[read]` **Eine Korrektur *165 g -> 150 g* ist kein Erkennungsfehler**
— **sie wird getrennt gespeichert.**

`[cmd]` **Und `amount_g` ist in `meal_items` Pflicht** — **auch bei
`PARENT_MATCH`.**

---

## 7 · Mehrere Posten je Bild

**Ein Teller ist mehrere unabhaengig aufloesbare Items.**

`[cmd]` **Die Struktur existiert:** **E-40, Ghost Entries** —
**`meal_items` traegt eine Zeile je Zutat, einzeln anpassbar.**

`[read]` **MealCam schreibt in dieselbe Tabelle** — **kein zweites
Modell fuer Mahlzeiten.**

Je Region:

    region_id
    bounding_box
    facets
    candidate_food_ids
    resolution_state
    selected_food_id
    portion

`[read]` **Der Nutzer korrigiert einzelne Komponenten, ohne das
Meal neu zu erfassen.**

---

## 8 · Bestaetigung

**V1 ist bestaetigungspflichtig.**

`[cmd]` **`ADR_MEALCAM_V1`: *,,MealCam darf NIE automatisch finale
Meal Items schreiben."***

    + Gegrillte Huehnerbrust   165 g
    + Jasminreis               190 g
    + Brokkoli                  80 g
    ? Sauce                     unklar

`[read]` **Der Nutzer kann alles bestaetigen, einzelne Posten
korrigieren, die Portion aendern oder einen Posten verwerfen.**

`[read]` **Kein Formularzwang.**

### Stufen

    A  Schatten       nur Analyse, keine Schreibvorgaenge
    B  Bestaetigung   jede Erfassung wird bestaetigt   <- V1
    C  Vorauswahl     System waehlt, Nutzer bestaetigt das Meal
    D  Auto-Log       spaeter, nur fuer sichere Faelle

`[read]` **V1 ist Stufe B.** **Nicht mit D anfangen.**

---

## 9 · Einwilligung

`[cmd]` **`wissen.vision_contract_records` existiert bereits** — 15
Zeilen, mit `can_display`, `can_store`, `can_train`, `status`.

`[cmd]` **Und E-20 verlangt zwei getrennte Zwecke mit je eigener
Einwilligung**, nicht ein einzelnes `training_consent`.

**Zustaende:**

    PRIVATE_ONLY
    ALLOW_INTERNAL_EVAL
    ALLOW_MODEL_IMPROVEMENT_ANONYMIZED
    ALLOW_TRAINING
    REVOKED

`[read]` **Keine stillschweigende Trainingsfreigabe.**

`[cmd]` **Bei Widerruf: Bilder aus dem Trainingspool entfernen** —
**bestaetigte Naehrwerte im Tagebuch bleiben** (`ADR_MEALCAM_
CONSENT`).

`[cmd]` **Coach sieht Bilder nur bei ausdruecklicher Freigabe.**

---

## 10 · Vorhersage ist nicht Wahrheit

**Vier Zustaende, und keiner wird automatisch zum naechsten.**

    UNCONFIRMED
    USER_CONFIRMED
    SOURCE_VERIFIED
    EXPERT_VERIFIED

`[read]` **Der Grund steht in E-56:** `[cmd]` **eine Zahl aus
`vorschlags-lage.ts` stand dort als Messung** — **berichtigt am
2026-09-07.**

`[read]` **Was aus einem Modell kommt, traegt das bis zur
Bestaetigung sichtbar.**

---

## 11 · Der Lernspeicher

**Von Tag 1, nicht nachruestbar.**

Je Vorhersage:

    capture_id, region_id
    pipeline_version, retriever_version, resolver_version,
      portion_model_version, food_taxonomy_version
    candidate_food_ids[], candidate_ranks[]
    predicted_id, resolution_state
    user_selected_id, ground_truth_status
    facets[], visible_attributes[], non_visible_attributes[]
    portion_prediction, portion_correction
    consent, timestamp

### Kandidatenbeziehungen

`[read]` **Nicht jeder andere Kandidat ist ein Gegenbeispiel.**

    EXACT_POSITIVE
    PARENT_POSITIVE
    MASKED_AMBIGUOUS          visuell nicht unterscheidbar
    HARD_NEGATIVE_ATTRIBUTE   ein Merkmal ist falsch
    TRUE_NEGATIVE

`[cmd]` **Beispiel: Wahrheit *gegrillte Huehnerbrust* (172).**

    PARENT_POSITIVE            Huehnerbrust, Zubereitung offen
    HARD_NEGATIVE_ATTRIBUTE    rohe Huehnerbrust (100)
                               gegrillter Huehnerschenkel
    MASKED_AMBIGUOUS           gebraten im Ofen (162),
                               wenn im Bild nicht unterscheidbar

`[read]` **Ein maskierter Kandidat darf nicht als Gegenbeispiel
trainiert werden** — **sonst lernt das Modell, sicher zu sein, wo
es unsicher sein muesste.**

---

## 12 · Fähigkeit statt Modellname

`[cmd]` **MealCam ruft keinen Modellendpunkt direkt auf.**

    MealCam
      -> AI Provider Interface
      -> Gateway
      -> Router
      -> lokale/private Infrastruktur

**Gefordert werden Faehigkeiten:**

    FOOD_REGION_DETECTION
    FOOD_VISUAL_ANALYSIS
    FOOD_RETRIEVAL
    FOOD_ENTITY_RESOLUTION
    PORTION_ESTIMATION
    OCR

`[read]` **Nicht *,,rufe North Micro auf Port 8000"*.**

`[cmd]` **`ADR_MEALCAM_V1`: *,,Spec ist Provider-agnostisch."***

`[read]` **`LOCAL_ONLY` darf nie still in die Cloud eskalieren.**

---

## 13 · Was V1 enthaelt

    Kamera und Upload
    mehrere Posten je Bild
    sichtbare Eigenschaften
    Kandidatensuche gegen den BLS
    vier Aufloesungsgrade
    einfache Portionsschaetzung
    Bestaetigung durch den Nutzer
    Schreibweg in meal_items
    Lernspeicher mit Versionsangaben
    Einwilligung
    Provider-Abstraktion

## 14 · Was V1 nicht enthaelt

    RL / Policy-Optimierung
    kontinuierliches Lernen
    grosser synthetischer Simulator
    Distillation
    Mehrexperten-Ensemble
    automatische Selbstverbesserung

`[read]` **Aber die Datenstrukturen duerfen diese Faehigkeiten nicht
verbauen.**

---

## 15 · Reihenfolge

    Phase 0   Vertraege, Lernspeicher, Provider-Abstraktion,
              Einwilligung
    Phase 1   Kamera, Erkennung, Suche, Aufloesung, Portion,
              Bestaetigung, Schreibweg
    Phase 2   Kandidatenraenge, Korrekturen, Sichtbarkeit,
              Qualitaetsschranke
    Phase 3   eigene lokale Modelle
    Phase 4   gezieltes Nachfragen, Crop, OCR
    Phase 5   Selbstverbesserung

`[read]` **Phase 0 zuerst, weil sie nicht nachruestbar ist.** `[read]`
**Ein Erkennungsmodell laesst sich austauschen, ein fehlender
Lernspeicher nicht rueckwirkend fuellen.**

---

## 16 · Unverrueckbare Regeln

 1. Kein Modell erfindet eine interne ID.
 2. Vorhersage ist nie Wahrheit.
 3. Nicht sichtbare Eigenschaften werden nicht als visuell gelernt.
 4. `EXACT_MATCH` wird nicht erzwungen.
 5. `PARENT_MATCH` ist ein gueltiges Ergebnis.
 6. Mehrere legitime Positive sind moeglich.
 7. Mehrdeutige Kandidaten werden nicht zu Gegenbeispielen.
 8. Portion und Identitaet bleiben getrennt.
 9. Naehrwerte kommen aus dem BLS, nicht aus dem Modell (E-43,
    C-378).
10. Korrekturen werden von Tag 1 strukturiert gespeichert.
11. Training braucht Qualitaetsschranke und Einwilligung.
12. Keine unkontrollierte Selbstaenderung im Betrieb.
13. MealCam haengt an keinem bestimmten Modell.
14. Lokale Infrastruktur ist erstklassig, Cloud ist optional.
15. `LOCAL_ONLY` eskaliert nie still.
16. Ein Modellwechsel aendert die Fachlogik nicht.
17. Jedes Ergebnis ist ueber Versionen nachvollziehbar.

---

## 17 · Was noch zu entscheiden ist

`[read]` **Naehrwerte bei `PARENT_MATCH`** — Abschnitt 4. **Das ist
die groesste offene Frage.**

`[read]` **Wie tief die Region-Erkennung geht:** **ein Teller mit
Sauce ist ein Posten oder zwei?**

`[read]` **Ob `AMBIGUOUS` den Nutzer fragt oder als Parent
schreibt** — **Blueprint Punkt 7 nennt neun moegliche Aktionen,
V1 braucht zwei oder drei.**

`[read]` **Und ob MealCam eine Mahlzeit anlegen darf** — **derselbe
Fall wie G-346 bei Quick-Add.**

---

## 18 · Was bereits steht

`[cmd]` **`wissen.vision_contract_records`** — 15 Zeilen, drei
Einwilligungsspalten.

`[cmd]` **`meal_items` mit `food_source`** — `bls`, `custom`,
`manual`; **seit G-340 ist der manuelle Weg gebaut.**

`[cmd]` **`food_search` mit `match_reason`** (C-391) — **der
Retriever sagt, warum ein Treffer kam.**

`[cmd]` **`sort_weight` bei allen 7.140** — **die Rangfolge ist
gefuellt.**

`[cmd]` **Und die Attrappe steht an der richtigen Stelle mit
Vermerk** (G-276, C-193: rein statisch, kein Leseweg).
