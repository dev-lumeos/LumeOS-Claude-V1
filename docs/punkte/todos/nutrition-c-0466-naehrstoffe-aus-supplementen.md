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

## Was ich wissen muss, bevor ein Auftrag rausgeht

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
