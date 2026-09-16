---
nr: C-510
typ: fehler
modul: supplements
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: C-505
entscheidung: null
agent: codex
beauftragt: 2026-09-08
beruehrt:
  tabellen: [supplements.product_contents]
zahlen:
  gemessen: 2026-09-08
  mappings: 39
---

# C-510 - das Mapping ist buchstabengenau

## Toms Befund

Tom, 2026-09-08, am Schirm:

> das ist schwachsinn und garantiert nicht schwer zu matchen

> so eine triviale scheisse, welche ich mit manuellem
> spaltenumbenennen in 10 minuten erledigt haette

`[read]` **Er hat recht.**

## Gemessen

`[cmd]` **Die 39 Mappings aus C-496 sind DA:**

    Vitamin C -> VITC     Calcium -> CA
    Iron -> FE            Zinc -> ZN
    Magnesium -> MG       Vitamin B6 -> VITB6

`[cmd]` **Und trotzdem:**

    Zutat        supplement_id   nutrient_code
    -----------  -------------   -------------
    Biotin       ja              NEIN
    Thiamin      ja              NEIN
    Calcium      NEIN            CA
    Iron         NEIN            FE
    Zinc         NEIN            ZN
    Vitamin C    NEIN            VITC
    Vitamin B6   NEIN            VITB6
    Magnesium    NEIN            MG

## Zwei Fehler

**1** ? **Das Mapping ist buchstabengenau.**

`[cmd]` **Das Mapping heisst `Thiamine` mit `e`, die Zutat
heisst `Thiamin`.**

`[read]` **`Folate` und `Folic Acid` sind beide drin ? aber
`Thiamin` fehlt neben `Thiamine`.**

`[cmd]` **MISS, welche der 39 Namen in `product_contents`
ueberhaupt WOERTLICH vorkommen** ? **und welche Schreibweisen
daneben stehen.**

**2** ? **`supplement_id` und `nutrient_code` sind unabhaengig
gefuellt.**

`[read]` **`Biotin` hat eine `supplement_id`, aber kein
Naehrstoff-Mapping.**

`[cmd]` **LumeOS hat KEINE `biotin`-Spalte in `foods`** ?
**also ist das richtig.**

`[read]` **Aber `Calcium` hat `CA` und trotzdem keine
`supplement_id`** ? **das ist ein Loch.**

## Was zu bauen ist

**1** ? **Die Mappings um die vorkommenden Schreibweisen
erweitern.**

`[read]` **Nicht raten** ? **messen, welche Namen in den
3.000.982 Zeilen stehen.**

`[cmd]` **Fuer die 31 LumeOS-Naehrstoffspalten** ? `enercc`,
`prot625`, `fat`, `cho`, `fibt`, `sugar`, `fasat`, `nacl`,
`water_g`, `alc`, `vita_ug`, `vitd_ug`, `vite_mg`, `vitk_ug`,
`vitc_mg`, `thia_mg`, `ribf_mg`, `nia_mg`, `vitb6_ug`,
`fol_ug`, `vitb12_ug`, `na_mg`, `k_mg`, `ca_mg`, `mg_mg`,
`p_mg`, `fe_mg`, `zn_mg`, `id_ug`, `cu_ug`, `mn_ug`.

`[read]` **Je Spalte: welche DSLD-Namen meinen sie?**

**2** ? **Die `supplement_id` nachziehen, wo ein
`nutrient_code` existiert.**

`[read]` **Ein Naehrstoff IST eine Substanz** ? `Calcium`,
`Iron`, `Zinc` **stehen vermutlich in `supplements.supplements`
(596 Eintraege).**

`[cmd]` **MISS: wie viele der 31 Naehrstoffe haben einen
Substanzeintrag?**

## Was das bringt

`[cmd]` **In Toms Beispiel: 62 Wirkstoffzeilen, davon 24
*auswertbar*.**

`[read]` **Nach der Berichtigung sollten es die meisten
sein** ? **`Calcium`, `Iron`, `Zinc`, `Vitamin C`, `Vitamin
B6`, `Magnesium`, `Phosphorus`, `Potassium`, `Sodium`,
`Iodine`, `Copper` sind alle LumeOS-Spalten.**

## Was NICHT zu tun ist

**KEINE Zuordnung raten** ? **aber eine Schreibvariante ist
kein Raten.**

`[read]` **`Thiamin` und `Thiamine` sind derselbe Stoff** ?
**`Vitamin B1` steht schon als drittes Mapping da.**

**`apps/` nicht anfassen** ? **G-464 baut die Anzeige.**

## Abnahmebedingungen

    A1  je der 31 Naehrstoffspalten: welche DSLD-Namen
        kommen vor? TABELLE nach Haeufigkeit.
    A2  die Mappings erweitert. Zahl vorher/nachher.
    A3  wie viele der 31 haben einen Substanzeintrag?
    A4  supplement_id nachgezogen, wo nutrient_code
        existiert. Zahl.
    A5  Toms Beispielprodukt: wie viele der 62 sind
        nachher auswertbar?
    A6  Gegenprobe: ein erfundener Name -> kein
        Mapping.
    A7  Sicherung, Vollkette, ALLE Waechter.

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_

