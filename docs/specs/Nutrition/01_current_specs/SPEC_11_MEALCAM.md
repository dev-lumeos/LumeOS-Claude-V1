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
stehen auf null.**

`[read]` **Das ist ein Katalogvorrang, kein Retrieval-Score.**
`[read]` **Der multimodale Retriever braucht seine eigene
Aehnlichkeit** — **visuell, semantisch, Facettenabgleich.**

`[read]` **`sort_weight` geht als Vorrang ein, es ersetzt die
Bewertung nicht.** `[read]` **Was es ersetzt: eine selbst erfundene
Taxonomie-Gewichtung.**

## 2a · Kandidaten haben einen Typ

`[read]` **Seit Abschnitt 4c ist ein Rezept ein moeglicher Treffer**
— **damit reicht eine Liste von Food-IDs nicht mehr.**

    candidates[]
      entity_type    BLS_FOOD | GLOBAL_RECIPE | USER_RECIPE
      entity_id
      match_reason
      rank

`[cmd]` **`match_reason` gibt es bereits in `food_search`** (C-391)
— **zehn Wege, von `name_exact` bis `token_group`.**

**Beispiel *Spaghetti Napoli*:**

    BLS_FOOD        Spaghetti gekocht
    GLOBAL_RECIPE   Spaghetti Napoli
    USER_RECIPE     Meine Spaghetti Napoli

`[read]` **Ein bekanntes Gericht ist oft besser als Rezept
aufloesbar als durch sichtbares Zerlegen in alle Zutaten.**

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

## 4 · Ein Posten ohne Naehrwerte gibt es nicht

**Tom, 2026-09-07:** *,,es gibt die auswahl NUR parent ohne
naehrstoffe nicht, wenn es nicht erkannt wird muss der user es
deklarieren."*

`[read]` **Damit faellt der dritte Weg** — **kein
Quick-Add-artiger Posten aus MealCam.**

    EXACT_MATCH    Naehrwerte aus dem BLS-Eintrag
    PARENT_MATCH   der Nutzer waehlt die Zubereitung -> Exact
    AMBIGUOUS      der Nutzer waehlt aus den Kandidaten -> Exact
    NO_MATCH       der Nutzer deklariert

`[read]` **`PARENT_MATCH` ist kein Endzustand im Tagebuch** — **es
ist ein Zwischenstand, den der Nutzer aufloest.**

`[cmd]` **Und `meal_items.nutrients` traegt 96 Schluessel** — nicht
drei Makros. `[read]` **Ein halb gefuellter Posten waere in 96
Feldern halb falsch.**

### Wann der Nutzer deklarieren muss

`[read]` **Die Regel steht in Abschnitt 5:** **was `NOT_VISIBLE` ist,
kann das Modell nicht bestimmen** — **also fragt es.**

`[cmd]` **Beispiel: `172` gegrillt gegen `162` gebraten im Ofen** —
**auf einem Foto meist nicht unterscheidbar.** `[read]` **Der Nutzer
waehlt, das Modell raet nicht.**

`[read]` **Und was `VISIBLE` ist, wird angenommen** — **Huehnerbrust
ist Huehnerbrust.**

## 4a · Ein Posten kann eine Zusammensetzung sein

**Tom, 2026-09-07:** *,,nutrients detailliert speichern (oder wir
bauen fuer bls nutrient rezepte mit sammlungen von nutrients=xy),
darstellung kann eine sammlung verschiedener nutrients von bls
sein."*

`[cmd]` **Das gibt es bereits:** `nutrition.recipe_ingredients`
**traegt `food_source`, `food_id`, `custom_food_id`, `amount_g`** —
**eine Sammlung von BLS-Eintraegen mit Mengen.**

`[read]` **Eine Sauce ist kein einzelner BLS-Eintrag** — **sie ist
Oel plus Tomate plus Gewuerz.**

`[read]` **MealCam braucht dafuer kein neues Modell:** **wo ein
Posten aus mehreren BLS-Eintraegen besteht, entsteht ein Rezept.**

`[cmd]` **Und E-45 kennt die Herkunft `buddy`** — **ein von der
Maschine vorgeschlagenes Rezept ist vorgesehen.**

### Was daraus folgt

    ein BLS-Eintrag      -> meal_item mit food_id
    mehrere Eintraege    -> Rezept, dann Ghost Entries (E-40)

`[read]` **Der zweite Weg ist gebaut:** `[cmd]` **E-40 schreibt je
Zutat eine Zeile in `meal_items`, einzeln anpassbar.**

### Der Sammelpunkt: Spaghetti Napoli

**Tom, 2026-09-07:**

    Spaghetti Napoli
      Spaghetti (Teigwaren)          -- ein BLS-Eintrag
      Tomatensauce                   -- Rezept als Sammelpunkt
        Tomate
        Olivenoel
        Zwiebel
        Gewuerz

`[read]` **Zwei Ebenen:** **die Mahlzeit traegt Posten, ein Posten
kann selbst eine Sammlung sein.**

`[cmd]` **`recipe_ingredients` traegt `food_source`, `food_id`,
`custom_food_id`, `amount_g`** — **die Sammlung ist gebaut.**

**Tom:** *,,dann kann der user immer noch loeschen / aendern /
hinzufuegen."*

`[cmd]` **Und das ist E-40:** **je Zutat eine Zeile in `meal_items`,
einzeln anpassbar.** `[read]` **Wer die Zwiebel weglaesst, streicht
eine Zeile** — **das Rezept bleibt.**

## 4b · MealCam legt Rezepte an, der Admin sieht sie

**Tom, 2026-09-07:** *,,mealcam kann rezepte im userprofil erstellen,
das rezept muss aber auch im adminbereich zur validierung
auftauchen, dann koennen wir einen ausbau administrieren."*

### Zwei Wirkungen aus einem Vorgang

    im Nutzerprofil    das Rezept ist sofort benutzbar
    im Adminbereich    es erscheint zur Pruefung

`[read]` **Der Nutzer wartet nicht auf eine Freigabe** — **sein
Rezept gehoert ihm.**

`[read]` **Aber jedes MealCam-Rezept ist zugleich ein Vorschlag an
den Katalog** — **wenn hundert Nutzer *Tomatensauce* fotografieren,
entsteht daraus eine kuratierte Zusammensetzung.**

### Der Weg existiert bereits, fuer Lebensmittel

`[cmd]` **`nutrition.food_curation_candidates`:** `food_id`,
`target_type`, `target_field`, `proposed_value`, `source`, `reason`,
`status`, `reviewer`. **0 Zeilen.**

`[cmd]` **`status`:** `pending`, `accepted`, `rejected`,
`superseded`.

`[cmd]` **`target_type`:** `category_assignment`, `display_name`,
`alias`, `preference_item_mapping`.

`[read]` **Kein Wert fuer Rezepte** — **das ist die Luecke.**

`[cmd]` **Und `food_curation_decisions` fuehrt die Entscheidung
getrennt:** `candidate_id`, `decision`, `reviewer`, `reason`.

`[read]` **Zwei Tabellen statt einer Statusspalte** — **die
Entscheidung ist ein eigener Vorgang mit Begruendung.**

### Was zu bauen ist

`[read]` **Ein `target_type` fuer Rezeptvorschlaege** — **oder eine
eigene Kandidatentabelle, wenn ein Rezept zu viel traegt fuer
`proposed_value`.**

`[cmd]` **`recipes.source` kennt `buddy`** (E-45) — **ein
maschinell erzeugtes Rezept ist im Schema vorgesehen.**

### Die Herkunft ist ein eigenes Feld

`[cmd]` **`recipes.source` traegt heute vier Werte** — `user`,
`coach`, `marketplace`, `buddy` (E-45).

`[read]` **Das beschreibt, WEM ein Rezept gehoert** — **nicht,
WODURCH es entstanden ist.**

**Vorschlag: ein zweites Feld.**

    source       user | coach | marketplace | buddy
    created_via  manual | mealcam | buddy | researcher | admin

`[read]` **Ein MealCam-Rezept gehoert dem Nutzer (`source = user`)
und entstand durch die Kamera (`created_via = mealcam`).**

`[read]` **Spaeter muss unterscheidbar sein:** **Buddy hat
vorgeschlagen, MealCam hat aus einem Foto erzeugt, ein Researcher hat
recherchiert.** `[read]` **Fuer Herkunft, Qualitaet und Training.**

`[cmd]` **Als C-411, dort zu entscheiden.**

### Und was der Admin damit tut

`[read]` **Ein angenommener Vorschlag wird nicht zum Nutzerrezept
zurueck** — **er wird Katalogmaterial.**

`[cmd]` **Wie `food_tags_kuriert` bei den Tags** (E-55, C-366):
**eine Ueberlagerung, die den Import ueberlebt.**

### Was der Admin sieht

    Zusammensetzung des Rezepts        ja
    wie oft es vorkommt                ja, aggregiert
    wer es angelegt hat                nein
    das private Mahlzeitenfoto         nein

`[read]` **Ein Foto nur bei ausdruecklicher, eigener Einwilligung**
— **nicht als Beiwerk der Rezeptfreigabe.**

### Drei Zwecke, drei Einwilligungen

    private Ernaehrungshistorie
    Beitrag zum globalen Katalog
    Modelltraining

`[read]` **Das sind drei verschiedene Sachen.** `[cmd]` **E-20
verlangt bereits getrennte Zwecke mit je eigener Einwilligung.**

`[read]` **Wer sein Rezept dem Katalog beisteuert, hat damit weder
sein Tagebuch geoeffnet noch dem Training zugestimmt.**

`[read]` **Der Nutzer merkt davon nichts** — **sein Rezept bleibt
seins.** `[read]` **Aber der naechste, der Tomatensauce
fotografiert, bekommt einen besseren Vorschlag.**

## 4d · Wann etwas ein eigener Posten ist

**Die Regel:**

> **MealCam erkennt die hoechste visuell trennbare Einheit, fuer die
> ein kanonischer Eintrag existiert.** **Nicht sichtbare Zutaten
> werden nicht aus dem Bild erfunden.**

    Spaghetti Napoli
      sichtbar getrennt: Spaghetti | Tomatensauce
      -> zwei Posten

    Tomatensauce als globales Rezept
      -> Tomate, Oel, Zwiebel, Gewuerz

`[read]` **MealCam muss die Zwiebel nicht sehen** — **sie kommt aus
`DATABASE`, nicht aus `IMAGE`.**

`[cmd]` **Und Abschnitt 5 haelt das fest:** **die Quelle je
Eigenschaft ist ein Datentyp.**

`[read]` **Sagt der Nutzer *keine Zwiebel drin*, wird die Instanz
angepasst** — **nicht das Rezept.**

## 4e · Vorlage und Instanz sind zwei Sachen

    GLOBAL_RECIPE        Vorlage
      Tomate 70 %
      Oel 10 %
      Zwiebel 10 %

    Instanz im Tagebuch  was der Nutzer gegessen hat
      Tomate
      Oel
      keine Zwiebel

`[read]` **Der Katalog aendert sich durch eine einzelne Anpassung
nicht.**

`[read]` **Aber die Anpassung ist ein Kurationssignal** — **wenn
hundert Nutzer die Zwiebel streichen, sagt das etwas ueber die
Vorlage.**

`[cmd]` **Und E-42 kennt das Muster:** **geloggte Positionen sind
eingefroren, die Vorlage bleibt.**

## 4c · Zwei Wege zu einem globalen Rezept

**Tom, 2026-09-07:** *,,wir werden bald automatische researcher
haben. der kann genau solche rezepte mit bild, ingredients,
kochanleitungen, etc recherchieren und als knowledge ablegen, daraus
koennen wir globale rezepte erstellen."*

`[read]` **Damit ist die Kuration nicht mehr die einzige Quelle.**

    von unten   MealCam-Rezepte -> Kuration -> Katalog
    von oben    Researcher -> wissen -> Katalog

`[read]` **Der zweite Weg ist der schnellere:** **ein recherchiertes
Rezept liegt im Bestand, bevor jemand es fotografiert.**

`[read]` **Und der erste bleibt der genauere:** **er sagt, was
Nutzer tatsaechlich essen** — **nicht, was ein Kochbuch schreibt.**

### Der Ort existiert

`[cmd]` **Das `wissen`-Schema traegt zehn Tabellen**, darunter
`buddy_knowledge_records`, `evidence_register_entries`,
`knowledge_gap_records`.

`[read]` **Recherchiertes Wissen landet dort, nicht in
`nutrition`** — **und wird von dort in einen Katalogeintrag
uebersetzt.**

`[read]` **Das ist dieselbe Trennung wie bei den Tags:** `[cmd]`
**der Import fuellt `food_tags`, die Kuration `food_tags_kuriert`,
und `food_tags_effective` vereint beides** (E-55).

### Was sich fuer MealCam aendert

`[read]` **Ein globales Rezept ist ein Kandidat, den der Resolver
vorschlagen kann** — **wie ein BLS-Eintrag.**

`[cmd]` **Damit waechst der Kandidatenraum aus Abschnitt 2** — **nicht
nur 7.140 BLS-Eintraege, sondern auch kuratierte
Zusammensetzungen.**

`[read]` **Und die Untergrenze aus 17a wird beantwortbar:**
**erkennt MealCam die Zwiebel, oder schlaegt es *Tomatensauce* vor?**
**Wenn ein globales Rezept existiert, schlaegt es das Rezept vor.**

### Was das nicht heisst

`[read]` **Ein recherchiertes Rezept ist keine Naehrwertquelle.**

`[cmd]` **E-43: BLS 4.0 ist die einzige Lebensmittelquelle.**

`[read]` **Ein globales Rezept nennt Zutaten und Mengen** — **die
Naehrwerte kommen weiter aus dem BLS-Eintrag je Zutat.**

`[read]` **Und ein Researcher darf keine Naehrwerte liefern** —
**dieselbe Regel wie fuer das Vision-Modell** (Regel 9).

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

### Die Mahlzeit steht vor dem Foto

**Tom, 2026-09-07:** *,,klickt user mealcam deklariert er zuerst was
das fuer eine mahlzeit ist, das kann auch eine geplante sein oder
eine neue."*

    MealCam oeffnen
      -> welche Mahlzeit?
           eine geplante aus dem Plan
           eine bestehende des Tages
           eine neue, mit Zeit und Name
      -> Foto
      -> Erkennung
      -> Bestaetigung
      -> Posten in diese Mahlzeit

`[read]` **Damit ist G-346 fuer MealCam beantwortet:** **die
Mahlzeit wird gewaehlt, nicht abgeleitet.**

`[cmd]` **Und der geplante Fall ist der interessante:** **wer einen
Plan aktiv hat, fotografiert, was er geplant hatte** — **die
Ghost-Eintraege sind der Vergleichsmassstab.**

`[read]` **Das Ergebnis kann also *bestaetigt* oder *abweichend*
sein** (E-42, Protokollzeilen `confirmed` / `deviated`).

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

### Auch der Weg zur Aufloesung wird festgehalten

`[read]` **Nicht nur *Vorhersage -> Korrektur*, sondern was
dazwischen geschah.**

    resolution_events[]   append-only

      initial_candidates   gegrillt, im Ofen gebraten
      state                AMBIGUOUS
      action               ASK_USER
      question             "Gegrillt oder aus dem Ofen?"
      answer               gegrillt
      final                BLS_xxx

`[read]` **Daraus laesst sich spaeter lernen, bei welcher
Unsicherheit welche Rueckfrage geholfen hat.**

`[read]` **V1 braucht dafuer kein Modell** — **aber die Rohdaten
duerfen nicht verloren gehen.**

`[cmd]` **Dasselbe Argument wie fuer den Lernspeicher: nicht
nachruestbar.**

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

### Der Rest gehoert in eine eigene Spec

`[read]` **Was MealCam braucht, brauchen spaeter auch MedicationCam,
PrescriptionCam und Buddy:**

    Capability Discovery
    sichere Kopplung
    Gateway-Authentifizierung
    LAN-Erkennung
    private Fernverbindung
    Zustandspruefung
    Protokollversionen
    Verfuegbarkeit
    Datenschutz-Wegewahl
    LOCAL_ONLY und Eskalationsregeln
    Modell- und Pipeline-Versionsmeldung

`[read]` **Das gehoert nicht in SPEC_11 kopiert** — **es gehoert in
eine Infrastruktur-Spec, auf die SPEC_11 verweist.**

    SPEC_11 MealCam
      braucht ->  SPEC_AI_INFRASTRUKTUR

`[read]` **Dann gilt dieselbe Infrastruktur automatisch fuer jedes
weitere Modul, das ein Modell ruft.**

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
 5. `PARENT_MATCH` ist ein gueltiger Zwischenstand, kein
    Tagebucheintrag -- der Nutzer loest ihn auf.
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

## 16a · Woran V1 gemessen wird

`[read]` **Ohne Massstab laesst sich keine Modellgeneration mit der
naechsten vergleichen.**

### Der Produkt-Massstab

> **Anteil der Mahlzeiten, die mit hoechstens einer Korrektur
> richtig erfasst werden.**

`[read]` **Eine Zahl, die der Nutzer spuert** — **nicht eine, die
nur im Bericht steht.**

### Die technischen Groessen

    Kandidatenausbeute      ist der richtige unter den ersten K?
    EXACT-Treffergenauigkeit
    falsche EXACT-Rate      der teuerste Fehler
    AMBIGUOUS-Erkennung     wird Unsicherheit erkannt?
    NO_MATCH-Genauigkeit
    bestaetigte ID          nach der Nutzerkorrektur
    Portionsabweichung      mittlerer Fehler
    Korrekturrate           je Mahlzeit
    Zeit Foto -> bestaetigt Median

`[read]` **Die falsche EXACT-Rate ist die wichtigste:** **ein
sicherer Irrtum ist schlimmer als ein eingestandenes *ich weiss es
nicht*.**

`[cmd]` **Und sie haengt an Abschnitt 3:** **`EXACT_MATCH` wird nicht
erzwungen** — **wer erzwingt, treibt genau diese Rate hoch.**

### Was V1 davon braucht

`[read]` **Die Groessen werden von Tag 1 erhoben, nicht von Tag 1
erfuellt.**

`[read]` **Ein Schwellenwert ohne Messreihe waere geraten** —
**dieselbe Klasse wie eine Zahl ohne Kommando** (A-58).

`[read]` **Also: messen, ein paar Wochen sammeln, dann
Schwellenwerte setzen.**

## 17 · Was Tom am 2026-09-07 entschieden hat

**Naehrwerte bei `PARENT_MATCH`** — `[cmd]` **es gibt keinen Posten
ohne Naehrwerte.** **Was nicht erkannt wird, deklariert der
Nutzer.** Abschnitt 4.

**Zusammensetzungen** — `[cmd]` **ein Posten kann eine Sammlung
mehrerer BLS-Eintraege sein.** `[cmd]` **`recipe_ingredients` traegt
das bereits.** Abschnitt 4a.

**`AMBIGUOUS`** — **zwei Aktionen: `ACCEPT` durch den Nutzer oder
`ASK_USER`.** `[read]` **Crop, OCR und Barcode sind Phase 4.**

**Die Mahlzeit** — `[cmd]` **wird vor dem Foto gewaehlt**, geplant
oder neu. Abschnitt 8.

**Rezepte** — `[cmd]` **MealCam legt sie im Nutzerprofil an, und
sie erscheinen im Adminbereich zur Validierung.** Abschnitt 4b.

## 17a · Was am 2026-09-07 nachgeschaerft wurde

`[read]` **Aus einer Durchsicht der Spec durch Codex.** **Acht
Punkte uebernommen, einer eingeschraenkt.**

    Kandidatentyp        2a   BLS_FOOD | GLOBAL_RECIPE | USER_RECIPE
    Segmentierung        4d   hoechste visuell trennbare Einheit
    Vorlage vs Instanz   4e   der Katalog aendert sich nicht
    created_via          4b   Herkunft getrennt vom Besitz
    resolution_events    11   auch der Weg zur Aufloesung
    sort_weight           2   Vorrang, kein Retrieval-Score
    AI-Infrastruktur     12   eigene Spec, SPEC_11 verweist
    Kurations-Privacy    4b   drei Zwecke, drei Einwilligungen
    Massstaebe          16a   erhoben ab Tag 1, Schwellen spaeter

`[read]` **Bei `sort_weight` war meine Formulierung zu stark:**
**ich schrieb *,,der Retriever braucht keine eigene Gewichtung"*.**

`[read]` **Richtig ist: er braucht keine neue Taxonomie-Gewichtung**
— **eine visuelle und semantische Aehnlichkeit braucht er sehr
wohl.** `[cmd]` **Berichtigt in Abschnitt 2.**

`[read]` **Und bei den Massstaeben habe ich eingeschraenkt:**
**erhoben ab Tag 1, Schwellenwerte erst nach einer Messreihe.**
`[read]` **Ein Schwellenwert ohne Daten waere geraten** (A-58).

## 17b · Was noch offen ist

`[read]` **Die Segmentierungsregel aus 4d ist gesetzt, aber
ungeprueft** — **sie muss sich an echten Bildern bewaehren.**

`[read]` **Und `SPEC_AI_INFRASTRUKTUR` existiert noch nicht** —
**Abschnitt 12 verweist auf etwas, das zu schreiben ist.**

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
