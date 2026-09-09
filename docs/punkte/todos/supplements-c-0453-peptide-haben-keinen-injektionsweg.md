---
nr: C-453
typ: befund
modul: supplements
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: C-445
entscheidung: null
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
