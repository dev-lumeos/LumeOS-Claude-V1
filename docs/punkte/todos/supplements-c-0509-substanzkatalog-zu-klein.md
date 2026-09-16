---
nr: C-509
typ: befund
modul: supplements
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: C-505
entscheidung: null
beruehrt:
  tabellen: [supplements.supplements]
zahlen:
  gemessen: 2026-09-08
  verknuepft: 305080
  gesamt: 3000982
---

# C-509 - der Substanzkatalog ist zu klein

## Befund

`[cmd]` **Nach C-505: 305.080 von 3.000.982 Zeilen verknuepft
(10 %).**

> *,,Nur 2.785 eindeutige, exakte Katalogtreffer wurden
nachverknuepft; keine Zuordnung geraten."*

`[read]` **Die Zurueckhaltung war richtig** ? **aber sie zeigt
das eigentliche Problem.**

`[cmd]` **`supplements.supplements`: 596 Substanzen.**
`[cmd]` **`supplement_aliases`: 2.843 Aliase.**
`[cmd]` **Eindeutige Zutaten in DSLD: rund 14.677 je
Datei.**

`[read]` **596 reichen fuer die Wirkstoffe eines
Supplementkatalogs nicht.**

## Wo die Quelle herkommen koennte

`[cmd]` **`product_content_candidates` traegt 1,7 Mio
Kandidaten (C-485)** ? **die haeufigsten sind der Anfang.**

`[read]` **Ein Stoff, der in 10.000 Produkten vorkommt, ist
wichtiger als einer in dreien.**

### Drei Wege

**a** ? **Die haeufigsten Kandidaten aufnehmen.**

`[cmd]` **MISS: wie viele Produkte deckt man mit den ersten
100, 500, 1.000 Kandidaten ab?**

**b** ? **Eine externe Quelle.**

`[read]` **Fuer Wirkstoffe: PubChem, ChEBI, die
DSLD-Kategorien selbst.**

`[read]` **Fuer Hilfsstoffe: die E-Nummern-Liste,
FDA GRAS.**

**c** ? **Die Klassifikation reicht.**

`[read]` **C-505 hat Naehrwert, Wirkstoff, Hilfsstoff,
Kandidat getrennt** ? **vielleicht braucht ein Hilfsstoff gar
keinen Katalogeintrag, sondern nur ein Etikett.**

`[cmd]` **Fuer die Allergiepruefung reicht der NAME** ?
`allergen_aliases` **arbeitet mit Text (C-498).**

## Was zuerst zu messen ist

    A  die 100 haeufigsten Kandidaten: welche sind
       Wirkstoffe, welche Hilfsstoffe?
    B  wie viele PRODUKTE deckt man damit ab?
    C  braucht ein Hilfsstoff einen Katalogeintrag,
       oder reicht das Etikett aus C-505?

`[read]` **Punkt C entscheidet, ob es 500 oder 14.000 neue
Eintraege braucht.**
