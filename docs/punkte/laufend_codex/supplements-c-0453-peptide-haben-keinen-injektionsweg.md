---
nr: C-453
typ: befund
modul: supplements
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: C-445
entscheidung: null
agent: codex
beauftragt: 2026-09-08
beruehrt:
  tabellen: [supplements.supplements]
zahlen:
  gemessen: 2026-09-08
  supplements: 596
  injizierbar: 18
---

# C-453 — Peptide haben keinen Injektionsweg

## Befund

Tom, 2026-09-08: *,,dann fehlen noch ein paar punkte fuer peptides
? das sind auch supplement injektionen."*

`[read]` **Er hat recht, und die Spec sagt es ausdruecklich.**

`[cmd]` **`Injection Planner - Spec Change Request.md:21`:**

> *,,For any user on injectable protocols (TRT, HCG, peptides, GH,
> GLP-1 agonists) this is the highest-value missing feature."*

`[cmd]` **Und die sechs SubQ-Stellen sind genau dafuer da,
Zeile 65-74:**

    abd_l/r        Abdomen       1.0 ml  3 d  29G x 0.5"
                   ~2 cm lateral vom Nabel, pinch
    sq_delt_l/r    SubQ Deltoid  0.5 ml  3 d  29G x 0.5"
                   Posterior upper-arm fat
    thigh_sq_l/r   SubQ Thigh    1.0 ml  3 d  29G x 0.5"
                   Anterolateral fat pad

`[read]` **Die Karte zeigt sie heute nicht** ? **das ist G-396.**

## Was in der Datenbank fehlt

`[cmd]` **`supplements.supplements`: 596 Zeilen.**

`[cmd]` **Peptide im Katalog: `Semaglutid`, `Tirzepatid`** ?
**beide mit `form = NULL`.**

`[cmd]` **`supplement_pharmacology.route`:**

    oral                       250
    intramuscular               10
    intranasal,subcutaneous      7
    intravenous,subcutaneous     1

`[read]` **18 von 596 haben ueberhaupt einen injizierbaren Weg.**

`[read]` **Und die Werte sind kommaseparierte Zeichenketten, keine
Liste** ? **`intranasal,subcutaneous` ist EIN Feld.**

## Was die Spec verlangt

`[cmd]` **Zeile 16:**

    route TEXT NOT NULL
      -- oral | injection_im | injection_subq | topical | nasal

`[cmd]` **Zeile 36:** *,,`route` TEXT: `im` | `subq` ? must match
`enhanced_substances.route` family."*

`[cmd]` **Und `enhanced_substances` GIBT ES NICHT** ? **weder in
`supplements` noch anderswo.**

`[read]` **Die Spec verweist auf eine Tabelle, die nie gebaut
wurde** ? **`00-SPEC-ABGLEICH.md` fuehrt sie unter *,,Spec nennt,
Schema hat nicht"*.**

## Die drei Luecken

**1** ? **Kein `route` an der Substanz.** `[cmd]`
**`supplements.form` traegt *root extract*, *plant protein
isolate*** ? **das ist die Darreichungsform, nicht der Weg.**

**2** ? **`supplement_pharmacology.route` ist eine Zeichenkette.**
`[read]` **`intranasal,subcutaneous` laesst sich nicht abfragen,
ohne zu zerlegen.**

**3** ? **Zeile 109 der Spec:** *,,Computed on read from active
stack items where `route IN ('injection_im','injection_subq')"*.

`[read]` **Der Injektionsplaner soll die Stellen aus dem AKTIVEN
STACK ableiten** ? **wer kein injizierbares Mittel nimmt, sieht
keine Karte.**

`[cmd]` **Das geht heute nicht** ? **es gibt keinen Weg von einem
Stack-Eintrag zu *,,das wird injiziert"*.**

## Was zu messen ist

`[read]` **Wie viele Peptide der Katalog ueberhaupt fuehrt** ?
**zwei gefundene bei einer Namenssuche ist wenig.**

`[cmd]` **`docs/kimi_research/supplement_performance_database/`
koennte mehr haben.**

`[read]` **Und was das Altrepo dazu sagt** ?
`referenz/lumeos-2026/research/enhanced-supplements/`, **13
Dateien, 95 KB.**

## Berichtigt 2026-09-08 — der Katalog ist dokumentiert

Tom: *,,wir haben den katalog neu aufgebaut, sollte auch
dokumentiert sein."*

`[read]` **Er ist es. Der Orchestrator hat
`SCHEMA_NEUAUFBAU.md` in der Trefferliste gesehen und NICHT
geoeffnet.**

`[cmd]` **`docs/specs/Supplements/SCHEMA_NEUAUFBAU.md`, 470
Zeilen, *,,gegen vier Quellen geprueft"*.**

### Was oben falsch stand

`[read]` **`enhanced_substances` ist keine Luecke** ? **sie wurde
BEWUSST abgelehnt** (Zeile 345):

> *,,Das ist eine zweite Substanztabelle ? genau der Fehler, den
> dieses Dokument behebt. Eine Gruppe ist keine eigene Tabelle."*

`[cmd]` **Und Zeile 368 sagt, wohin `route` gehoert:**
`supplement_pharmacology` ? **genau dort liegt es.**

`[read]` **Der Orchestrator hat es als Fehler gemeldet, wo eine
Entscheidung stand.**

## Der echte Befund

`[cmd]` **`supplement_groups`: drei Gruppen.**

    supplement   312
    enhanced     191
    peptide       93

`[cmd]` **93 Peptide im Katalog.**

`[cmd]` **Und ihr Injektionsweg:**

    Semaglutid    route = oral
    Tirzepatid    route = oral
    die uebrigen 91   kein Eintrag

`[read]` **Zwei haben einen Weg, und BEIDE sind falsch.**

Tom: *,,praktisch alle peptides werden entweder in den bauch oder
bei bpc157/tb500 an die problemstellen unter die haut injiziert."*

`[cmd]` **Semaglutid und Tirzepatid sind GLP-1-Agonisten** ?
**subkutan, Bauch, Oberschenkel oder Oberarm.**

`[read]` **`oral` ist bei beiden schlicht falsch.**

## Was daraus folgt

**1** ? **`supplement_pharmacology.route` fuer 93 Peptide fuellen.**

`[cmd]` **Die Spec kennt vier Werte** (`Injection Planner:16`):
`oral | injection_im | injection_subq | topical | nasal`.

`[cmd]` **Und heute stehen dort `oral`, `intramuscular`,
`intranasal,subcutaneous`** ? **drei Schreibweisen fuer dasselbe.**

**2** ? **Die Zwei berichtigen.**

**3** ? **Und BPC-157 / TB-500 sind ein Sonderfall.**

Tom: *,,an die problemstellen unter die haut."*

`[read]` **Das ist keine feste Stelle** ? **die Injektion folgt der
Verletzung, nicht einer Rotation.**

`[read]` **Der Injektionsplaner kann das nicht abbilden** ? **er
kennt 16 feste Orte.**

`[read]` **Miss, ob die Spec dazu etwas sagt** ? **und wenn nicht,
ist es eine Entscheidung: eine freie Stelle, oder gar keine
Rotation fuer diese Mittel.**

## Eine Recherchewelle

Tom: *,,dann muessen wir nochmal eine recherchewelle machen."*

`[cmd]` **Vorhanden:**

    docs/kimi_research/supplement_performance_database/
    referenz/lumeos-2026/research/enhanced-supplements/  95 KB
    referenz/lumeos-2026/research/supplements/          312 KB

`[read]` **Erst messen, was davon Wege nennt** ? **bevor neu
recherchiert wird.**

## Das Altrepo, gemessen statt vermutet

Tom: *,,das alte repo hat keine peptides, und wenn einzelne."*

`[cmd]` **32 Dateien mit Treffern, aber er hat recht:** **kein
Katalog.**

`[cmd]` **Die hoechsten Trefferzahlen sind
Wettbewerbsanalysen** ? `competitive-analysis.md` **(33),**
`peptiq.md` **(4)** ? **Marktbeobachtung, keine Substanzdaten.**

### Zwei Dateien sind trotzdem brauchbar

**1** ? `supabase/seed.disabled/seed_supplements.sql:140-153`

`[cmd]` **13 Peptide, JE MIT `subcutaneous`:**

    BPC-157      TB-500      Ipamorelin   CJC-1295
    GHRP-6       GHRP-2      Sermorelin   Tesamorelin
    PT-141       Melanotan II  AOD-9604   Epitalon
    GHK-Cu

`[read]` **Mit Halbwertszeit, Dosisbereich, Einheit und
Frequenz** ? **kein Katalog, aber belastbare Einzeldaten.**

**2** ? `research/enhanced-supplements/data/compound-taxonomy.md`

`[cmd]` **Die vollstaendigere Quelle, mit Route je Verbindung:**

    Performance Peptides (~15)   alle SubQ
      BPC-157      SubQ/Oral   Tissue Repair, Gut Healing
      TB-500       SubQ        Tissue Repair
      CJC-1295, Ipamorelin, GHRP-2/6, Hexarelin,
      Sermorelin, Tesamorelin, AOD-9604,
      Melanotan II, PT-141, Selank (Nasal/SubQ)

    GLP-1                       alle SubQ
      Semaglutide   Ozempic/Wegovy   SubQ  Weekly
      Tirzepatide   Mounjaro/Zepbound SubQ Weekly
      Liraglutide, Retatrutide, Survodutide

    HGH                         alle SubQ
      Somatropin, Genotropin, Norditropin,
      Omnitrope, Somapacitan

`[cmd]` **Semaglutid und Tirzepatid stehen dort als `SubQ`** ?
**unsere Datenbank sagt `oral`.**

`[read]` **Die Berichtigung braucht keine neue Recherche** ? **die
Quelle liegt im Repo.**

### Und BPC-157 ist der Sonderfall, den Tom nennt

`[cmd]` **`SubQ/Oral`** ? **zwei Wege fuer dieselbe Substanz.**

Tom: *,,bei bpc157/tb500 an die problemstellen unter die haut."*

`[read]` **Das ist weder `abd` noch `sq_delt`** ? **es ist die
Stelle, die weh tut.**

`[read]` **Der Planer kennt 16 feste Orte** ? **eine
verletzungsnahe Injektion passt in keinen davon.**

## Was daraus folgt

**Die Recherchewelle ist kleiner als gedacht:**

    berichtigen   Semaglutid, Tirzepatid: oral -> injection_subq
    uebernehmen   ~30 Verbindungen aus compound-taxonomy.md
    offen         die uebrigen ~60 der 93

`[read]` **Und die Werteliste vereinheitlichen** ? **heute stehen
`oral`, `intramuscular`, `intranasal,subcutaneous` nebeneinander,
die Spec will `oral | injection_im | injection_subq | topical |
nasal`.**

## Gelesen 2026-09-08 — die Spec definiert alles

Tom: *,,dann lies die specs und altes repo."*

`[read]` **Der Orchestrator hat vier Runden lang gefragt, was
definiert ist. Es steht seit Wochen da.**

### `SPEC_06_DATABASE_SCHEMA.md:104-105`

    route TEXT NOT NULL
      CHECK (route IN ('oral','injection_im','injection_subq',
                       'topical','nasal','sublingual'))

`[cmd]` **Sechs Werte, verbindlich.**

`[cmd]` **Live: `supplement_pharmacology.route` hat KEINEN
CHECK** ? **und traegt `intranasal,subcutaneous` als eine
Zeichenkette.**

### `SPEC_08_IMPORT_PIPELINE.md:161-221`

`[cmd]` **Vier Substanzen als Vorlage, je mit Weg:**

    Testosterone Enanthate   AAS       injection_im
    Ostarine (MK-2866)       SARM      oral
    BPC-157                  Peptide   injection_subq
    Semaglutide              GLP1      injection_subq

`[cmd]` **Und BPC-157 traegt die Warnung:** *,,Oral und SubQ
verfuegbar"* ? **genau Toms Punkt, in der Spec.**

`[cmd]` **Semaglutide:** `injection_subq`, `0.25`?`2.4 mg`,
`weekly`, Halbwertszeit `168 h`.

`[read]` **Die Datenbank sagt `oral`** ? **der Import hat die Spec
nicht befolgt.**

### Die Kategorien

`[cmd]` **`SPEC_06:97`:** `'GLP1','Support','Other'` **? es gibt
eine Kategorienliste mit CHECK.**

`[read]` **Damit ist auch die Zuordnung Substanz -> Weg nicht
frei** ? **`AAS` ist `injection_im`, `Peptide` und `GLP1` sind
`injection_subq`.**

## Was daraus wirklich folgt

`[read]` **KEINE Recherchewelle noetig.**

    1  den CHECK auf supplement_pharmacology.route nachziehen
       -- sechs Werte aus SPEC_06:105
    2  die kommaseparierten Werte zerlegen
       -- 'intranasal,subcutaneous' ist kein gueltiger Wert
    3  die 93 Peptide auf injection_subq setzen
       -- SPEC_08 nennt es je Kategorie, nicht je Substanz
    4  Semaglutid und Tirzepatid berichtigen
       -- beide oral, beide falsch

`[read]` **Punkt 3 ist der Kern:** **der Weg haengt an der
KATEGORIE, nicht an jeder einzelnen Substanz.**

`[cmd]` **93 Peptide, eine Regel** ? **statt 93 Recherchen.**

`[read]` **Ausnahmen sind BPC-157 (`SubQ/Oral`) und Selank
(`Nasal/SubQ`)** ? **die stehen in `compound-taxonomy.md` und in
der Spec-Warnung.**

## Auftrag

Tom, 2026-09-08: *,,bau die grundlagen in der db, bevor du
irgendwas anbinden willst."*

**Beauftragt am 2026-09-08.**

`[read]` **Nichts an der Oberflaeche. Die Karte wartet, bis die
Daten stehen.**

### 1 · Der CHECK

`[cmd]` **`SPEC_06_DATABASE_SCHEMA.md:104-105`:**

    route TEXT NOT NULL
      CHECK (route IN ('oral','injection_im','injection_subq',
                       'topical','nasal','sublingual'))

`[cmd]` **`supplement_pharmacology.route` hat heute KEINEN
CHECK.**

`[read]` **Erst die Werte bereinigen, dann den CHECK setzen** ?
**andersherum faellt er sofort.**

### 2 · Die kommaseparierten Werte

`[cmd]` **Live gemessen:**

    oral                       250
    intramuscular               10
    intranasal,subcutaneous      7
    intravenous,subcutaneous     1

`[read]` **Drei Probleme in vier Zeilen:**

**a** ? **`intramuscular` heisst in der Spec `injection_im`.**
**b** ? **`intranasal,subcutaneous` ist EIN Feld mit zwei
Werten.**
**c** ? **`intravenous` steht nicht in der Werteliste.**

`[read]` **Miss zuerst, ob eine Substanz wirklich zwei Wege hat**
? **oder ob die Quelle beides genannt hat und einer der uebliche
ist.**

`[cmd]` **BPC-157 ist der Beleg, dass es zwei geben KANN:**
`SPEC_08:206` ? *,,Oral und SubQ verfuegbar."*

`[read]` **Wenn zwei Wege noetig sind: eine Spalte reicht nicht.**
`[read]` **Melde, bevor du eine zweite anlegst** ? **das ist eine
Entscheidung.**

### 3 · Die 93 Peptide

`[cmd]` **`supplement_groups`: `supplement` 312, `enhanced` 191,
`peptide` 93.**

`[cmd]` **Und `route` haben zwei davon** ? **Semaglutid und
Tirzepatid, beide `oral`.**

`[cmd]` **`SPEC_08:218` sagt fuer Semaglutide `injection_subq`.**

`[read]` **Der Weg haengt an der KATEGORIE, nicht an jeder
Substanz** ? **`SPEC_08` nennt vier Klassen:**

    AAS       injection_im
    SARM      oral
    Peptide   injection_subq
    GLP1      injection_subq

`[read]` **Miss, ob `supplements` eine Kategoriespalte traegt** ?
`SPEC_06:97` **nennt einen CHECK mit `'GLP1','Support','Other'`.**

`[read]` **Wenn ja: die Regel je Kategorie, nicht 93 Einzelfaelle.**

### 4 · Die Ausnahmen

`[cmd]` **Aus `compound-taxonomy.md` im Altrepo:**

    BPC-157   SubQ/Oral
    Selank    Nasal/SubQ

`[read]` **Zwei Faelle, beide belegt** ? **die uebrigen folgen der
Kategorie.**

### Abnahmebedingungen

    A1  hat `supplements` eine Kategoriespalte? Gemessen,
        mit Werteverteilung.
    A2  die vier bestehenden route-Werte bereinigt.
        Zahl vorher/nachher je Wert.
    A3  zwei Wege je Substanz: noetig? Gemessen, mit
        Vorschlag -- NICHT gebaut.
    A4  die 93 Peptide: route gesetzt. Zahl vorher/nachher.
    A5  der CHECK steht. Gegenprobe: ein ungueltiger Wert
        wird abgelehnt.
    A6  Semaglutid und Tirzepatid: injection_subq.
    A7  Sicherung vor dem Einspielen: Pfad, Groesse,
        Pruefsumme.
    A8  Vollkette und Punktelauf gruen.

### Was nicht zu tun ist

**`apps/` NICHT anfassen** ? **die Karte wartet.**
**Keinen Weg erfinden** ? **was die Spec oder
`compound-taxonomy.md` nicht nennt, bleibt NULL und wird
gemeldet.**
**Keine zweite Spalte fuer den zweiten Weg** ? **melden.**
**Den Dev-Server nicht anfassen.**
Nicht committen, nicht stagen, nicht pushen.

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
