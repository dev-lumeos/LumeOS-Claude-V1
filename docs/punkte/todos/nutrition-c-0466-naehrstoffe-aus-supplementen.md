---
nr: C-466
typ: feature
modul: nutrition
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: null
entscheidung: E-35
beruehrt:
  tabellen: [supplements.supplement_nutrients]
zahlen:
  gemessen: 2026-09-08
  zuordnungen: 17
  supplemente: 596
---

# C-466 — Naehrstoffe aus Supplementen in der Nutrients-Ansicht

## Die Frage

Tom, 2026-09-08:

> in nutrients bilden wir viele infos ab, aber nur aus nutrition.
> irgendwann wird buddy bei unterziel massnahmen ergreifen und
> entweder ernaehrung umstellen oder supplements empfehlen, um die
> luecken zu fuellen. was fuer heute und spaeter fehlt, ist eine
> erweiterung von nutrients mit der momentanen supplementierung:
> in die uebersicht eine supplementierungsspalte, in details die
> verknuepfung durch supplement mit details.

## Die Bruecke EXISTIERT — und ist fast leer

`[cmd]` **`supplements.supplement_nutrients`:**

    id, supplement_id, status, nutrient_code,
    amount_per_serving, unit, conversion_factor,
    source, created_at, updated_at

`[cmd]` **Zwei Fremdschluessel:**

    nutrient_code   -> nutrition.nutrient_defs(code)
    supplement_id   -> supplements.supplements(id)

`[read]` **Genau die Verknuepfung, die Tom beschreibt.**

`[cmd]` **17 Zeilen.** `[cmd]` **596 Supplemente, davon 17 mit
Naehrstoffen** ? **weniger als drei Prozent.**

`[cmd]` **Die 17 sind:** **Folat (B9) 400 ug, Zink 15 mg** ? **und
fuenfzehn weitere.**

## Was E-35 dazu schon entschieden hat

`[cmd]` **E-35, 2026-08-30, Tom:**

> das ist fernab von jeder spec und modullogik, dass tagesbilanzen
> nicht pro modul vorhanden sind und wenn noetig fuer dashboard
> oder buddy summiert werden

**Die Regel:**

    Jedes Modul rechnet seine eigene Tagesbilanz.
    Summiert wird OBEN -- im Dashboard oder in Buddy,
    nicht im Modul.

`[cmd]` **Und die Begruendung:** **die Obergrenzen fuer Magnesium,
Niacin und Folsaeure gelten NUR fuer Supplemente** (C-344) ?
**wer sie gegen eine gemischte Summe haelt, bekommt in beide
Richtungen falsche Antworten.**

`[read]` **Also: die Spalte in Nutrients zeigt den Supplementanteil
GETRENNT, nicht eingerechnet.**

## Der Stand heute

`[cmd]` **`supplements` hat KEINE Tagesfunktion** ? **null
Funktionen mit `daily`, `tages` oder `summary`.**

`[cmd]` **`intake_logs`: 810 Einnahmen.**

`[cmd]` **Davon erreichen 360 einen Naehrstoffcode** ? **ueber
`stack_items.supplement_id` und `supplement_nutrients`.**

`[cmd]` **Und die Naehrstoffe dahinter sind DREI:**
`FAPUN3` (Omega-3), `MG` (Magnesium), `VITD` (Vitamin D).

`[read]` **E-35 sagte am 30.08.: *,,von 360 Einnahmen erreichen 90
einen Naehrstoffcode, alle denselben"*.**

`[read]` **Heute sind es 360 von 810 und drei verschiedene** ?
**es ist gewachsen, aber die Grundlage fehlt weiter.**

## Was fehlt, in drei Stufen

### 1 · Die Daten

`[cmd]` **579 von 596 Supplementen haben KEINE
Naehrstoffzuordnung.**

`[read]` **Ein Multivitamin ohne `supplement_nutrients`-Zeilen
taucht in keiner Bilanz auf.**

`[cmd]` **C-163 hiess *,,94 Substanzen ohne maschinenlesbare
Naehrstoffe"*** ? **nachsehen, was dort entschieden wurde.**

### 2 · Die Tagesbilanz in Supplements

`[read]` **Dieselbe Gestalt wie `nutrition.daily_summary`, aus
`intake_logs` und `supplement_nutrients`** (E-35).

`[read]` **Je Tag und Naehrstoff: wie viel kam aus Praeparaten.**

### 3 · Die Ansicht in Nutrients

`[read]` **Erst danach:**

    Uebersicht   eine Spalte je Naehrstoff:
                 "davon aus Supplementen"
    Details      welche Praeparate, welche Dosis,
                 verlinkt ins Supplements-Modul

---

## Toms Antworten, 2026-09-08

`[read]` **Kein Auftrag** ? **Tom: *,,mach erst nur ein todo
daraus, ich will das noch genauer ueberlegen."***

### 1 · Die Uebersicht zeigt beide uebereinander

Tom:

> uebersicht haben wir schnitt/tag. darin koennten wir in der
> auflistung beide werte uebereinander zeigen ? oben food,
> untendran supplements wo vorhanden, total zusammengerechnet.

    Vitamin D    11,2 ug      Nahrung
                 25,0 ug      Supplement
                 -------
                 36,2 ug      gesamt

`[read]` **Das ist Variante a und b zugleich:** **beide Werte
sichtbar, UND die Summe.**

`[read]` **Und *,,wo vorhanden"*** ? **wer kein Praeparat nimmt,
sieht eine Zeile, nicht drei.**

`[cmd]` **E-35 bleibt gewahrt:** **die beiden Bilanzen werden
getrennt GERECHNET, in der Ansicht zusammengefuehrt.**

### 1a · Berichtigt: keine Summe in der Uebersicht

Tom, 2026-09-08:

> nein. uebereinander ohne summe ? die summe haben wir weiter
> hinten schon in der auflistung. wir haben noch nicht von der
> detailansicht geredet.

    Vitamin D    11,2 ug      Nahrung
                 25,0 ug      Supplement

`[read]` **Zwei Zeilen, keine dritte.**

`[cmd]` **`nutrition.micronutrient_overview_items` traegt heute:**
`nutrient_code`, `label_de`, `display_order`, `value_source`,
`source_note`.

`[cmd]` **`value_source` steht auf `daily_reference_assessment`**
? **eine Quelle je Naehrstoff.**

`[read]` **Die Uebersicht braucht also eine ZWEITE Quelle je
Zeile** ? **nicht eine zweite Zeile in derselben Tabelle.**

`[read]` **Die Detailansicht ist noch nicht besprochen.**

### 2 · Was die Datenbank heute ueber Supplemente weiss

Tom: *,,deklariere mir das besser, zeig mir was fuer daten die db
beinhaltet."*

`[cmd]` **63 Tabellen im Schema `supplements`.**

#### Der Kern: 596 SUBSTANZEN, keine Produkte

`[cmd]` **`supplements.supplements`, 22 Spalten:**

    slug, group_id, category_id, parent_id
    name_de / _en / _th
    description_de / _en / _th
    form, form_note_de / _en / _th
    evidence_grade, source, is_active, im_katalog

`[read]` **Keine Marke. Keine Packungsgroesse. Kein Preis. Kein
Barcode.**

`[cmd]` **`form` beschreibt die Darreichung** ? **Kapsel, Pulver
? aber nicht, von wem.**

#### Was daran haengt (die wichtigsten)

    supplement_dosing         596   offizielle Etikettdosis,
                                    Leitliniendosis, studierte
                                    Bereiche, Obergrenze
    supplement_evidence       596   Evidenzlage
    supplement_pharmacology   577   Aufnahme, Halbwertszeit,
                                    Weg (route)
    supplement_regulatory   1.119   Zulassung je Land
    supplement_organ_risks  1.450   Organrisiken
    supplement_faq          1.970   Fragen und Antworten
    supplement_identifiers  1.259   CAS, PubChem, DSLD
    supplement_aliases      2.843   Namensvarianten
    supplement_field_sources 2.815  je Feld die Quelle
    entity_transporters     4.617   Transportproteine
    entity_cyp              3.001   Leberenzyme
    thailand_regulatory     1.061   Thailand
    supplement_wada           337   Dopingliste
    supplement_interactions    78   Wechselwirkungen
    supplement_lab_effects    271   Wirkung auf Laborwerte
    supplement_nutrients       17   <- die Naehrstoffbruecke

`[read]` **Das ist eine SUBSTANZDATENBANK** ? **tief, mehrsprachig,
mit Quellenangabe je Feld.**

#### Und was ein Produkt braeuchte

`[cmd]` **`supplement_dosing.official_label_dose`** ? **die
Etikettdosis steht da, aber je SUBSTANZ, nicht je Produkt.**

`[cmd]` **`supplement_portions`, 79 Zeilen:**

    "Belegte Studiengroesse" 1500 mg
    "Belegte Studiengroesse"  250 mg
    Quelle: c257_from_studied_dose_ranges

`[read]` **Auch das sind Studienmengen, keine Packungsangaben.**

`[read]` **Ein Produkt haette:**

    Marke              Now Foods
    Produktname        Zinc Picolinate
    Packung            120 Kapseln
    je Portion         50 mg Zink
    Zutatenliste       Zink 50 mg, Reismehl, Gelatine
    Barcode / GTIN
    Preis, Haendler

`[cmd]` **Davon hat die Datenbank: NICHTS.**

`[cmd]` **`supplement_quality` (237 Zeilen) traegt
`counterfeit_risk` und `contamination_risk`** ? **also
Faelschungsrisiko je Substanz, aber keine Marke, gegen die man
das haelt.**

#### Was das fuer die Naehrstoffbruecke heisst

`[cmd]` **`supplement_nutrients` zeigt auf
`supplements.supplements(id)`** ? **auf eine SUBSTANZ.**

    Zink (Substanz) -> ZN 15 mg

`[read]` **Aber ein Nutzer nimmt kein *,,Zink"*** ? **er nimmt ein
Praeparat mit 50 mg Zinkpicolinat, und das sind 10 mg
elementares Zink.**

`[cmd]` **`conversion_factor` in `supplement_nutrients` ist genau
dafuer da** ? **die Salzform in den Elementgehalt umrechnen.**

`[read]` **Solange die Datenbank Substanzen fuehrt, muss der
Nutzer die Dosis selbst eintragen** ? **und `stack_items.dose`
traegt sie.**

`[cmd]` **12 Stack-Positionen heute.**

#### Die Frage, die daraus folgt

`[read]` **Zwei Wege:**

    a  Substanzen bleiben, der Nutzer traegt die Dosis ein
       -> supplement_nutrients sagt nur, WELCHER Naehrstoff
          in welcher Umrechnung
       -> die Menge kommt aus stack_items.dose

    b  Produkte kommen dazu, als eigene Ebene
       -> supplements (Substanz)
          + products (Marke, Packung, je Portion)
          + intake zeigt auf das Produkt
       -> Herstellerdaten, Barcode, Etikett

`[read]` **Weg a geht heute** ? **und braucht nur, dass die 596
Substanzen ihre Naehrstoffzuordnung bekommen.**

`[read]` **Weg b ist ein eigenes Datenmodell** ? **und die Frage,
woher die Herstellerdaten kommen (DSLD? OpenFoodFacts? von
Hand?).**

`[cmd]` **`supplement_identifiers` traegt schon `DSLD`** ? **die
amerikanische Etikettdatenbank. Messen, was dort steht.**

### 2b · Die urspruengliche Notiz

Tom:

> ich werde mir supplements nochmal ueberdenken. ich denke, da
> muessen herstellerdaten rein und nicht von uns
> zusammengewuerfelte, recherchierte supplements.

`[read]` **Das aendert die Grundlage.**

`[cmd]` **Heute: 596 Substanzen, 17 mit Naehrstoffzuordnung** ?
**recherchiert, nicht vom Hersteller.**

`[read]` **Ein Praeparat hat eine Marke, eine Packungsgroesse, eine
Zutatenliste je Portion** ? **das ist ein anderes Datenmodell als
*,,Substanz mit Wirkung"*.**

`[cmd]` **`supplements.supplements` traegt heute Substanzen**
(Zink, Folat), **nicht Produkte** (*,,Now Foods Zinc Picolinate
50 mg, 120 Kapseln"*).

`[read]` **WARTET auf Toms Entscheidung** ? **ohne sie ist die
Datenfrage nicht beantwortbar.**

### 3 · Genommen ist genommen

Tom: *,,was fuer eine frage, genommen ist genommen."*

`[cmd]` **`intake_logs.status`** ? **nur der genommene Zustand
zaehlt.**

`[read]` **Meine Frage war ueberfluessig.**

### 4 · Zusammenzaehlen, und bei Ueberschreitung entscheiden

Tom:

> natuerlich zusammengezaehlt. wenn zu hoch, muss entschieden
> werden was sinn macht ? entweder supplementdosis runter oder
> ganz weg, oder kleine schritte mit foodanpassungen.

`[read]` **Die Warnung gilt der SUMME, nicht dem
Supplementanteil allein.**

`[read]` **Und sie ist kein Alarm, sondern der Anfang einer
Entscheidung:**

    Dosis runter
    Praeparat weg
    Ernaehrung anpassen

`[cmd]` **Das ist genau, was Tom eingangs beschrieb:** *,,buddy
wird bei unterziel massnahmen ergreifen und entweder ernaehrung
umstellen oder supplements empfehlen."*

`[read]` **Dieselbe Maschine, beide Richtungen** ? **Luecke
fuellen und Ueberschuss abbauen.**

`[cmd]` **Aber C-344 gilt weiter:** **die Obergrenzen fuer
Magnesium, Niacin und Folsaeure gelten NUR fuer Supplemente.**

`[read]` **Also: die SUMME wird gezeigt, die Grenze wird gegen
den richtigen Anteil geprueft** ? **je nach Naehrstoff die Summe
oder nur das Praeparat.**

`[read]` **Das ist die eine Stelle, die beim Bauen genau
gelesen werden muss.**

---

## Was offen bleibt

`[read]` **Punkt 2** ? **Herstellerdaten statt recherchierter
Substanzen.**

`[read]` **Ohne diese Entscheidung ist nicht klar, WORAUF die
Naehrstoffzuordnung zeigt** ? **auf eine Substanz oder auf ein
Produkt.**

`[read]` **Die Ansicht (Punkt 1) und die Rechenregel (Punkt 4)
sind entschieden** ? **die Datengrundlage nicht.**

---

## Urspruengliche Fragen (beantwortet)

`[read]` **Vier Fragen. Sie stehen in `00-FRAGEN.md`.**

**1** ? **Die Spalte in der Uebersicht: getrennt oder addiert?**

`[cmd]` **E-35 sagt: getrennt rechnen, oben summieren.**

`[read]` **Aber Nutrients IST die Naehrstoffansicht** ? **ist sie
das *,,oben"*, oder gehoert die Summe ins Dashboard?**

`[read]` **Drei Moeglichkeiten:**

    a  zwei Spalten nebeneinander
       Nahrung 11,2 ug | Supplement 25,0 ug
    b  eine Spalte mit Aufteilung im Detail
       36,2 ug (davon 25,0 aus Praeparaten)
    c  eine Zeile darunter
       "+ 25,0 ug aus Vitamin D3 5000 IU"

**2** ? **Die 579 Supplemente ohne Naehrstoffe: wer fuellt sie?**

`[read]` **Von Hand ist bei 579 nicht machbar.**

`[read]` **Aus dem Etikett? Aus einer Referenz? Nur die, die
jemand nutzt?**

`[cmd]` **Heute nutzen `stack_items` 12 Positionen** ? **das waere
ein kleiner Anfang.**

**3** ? **Was zaehlt als eingenommen?**

`[cmd]` **`intake_logs` hat `status`** ? **messen, welche Werte.**

`[read]` **Geplant und genommen sind nicht dasselbe** ? **eine
Bilanz darf nur das Genommene zaehlen.**

**4** ? **Die Obergrenzen.**

`[cmd]` **C-344: die Grenzen fuer Magnesium, Niacin und Folsaeure
gelten nur fuer Supplemente.**

`[read]` **Wenn Nutrients beide Anteile zeigt** ? **gegen welche
Referenz warnt es?**

`[read]` **Das ist keine Anzeigefrage, das ist eine
Sicherheitsfrage.**
