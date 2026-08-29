---
nr: C-323
typ: entscheidung
modul: nutrition
schwere: hoch
angelegt: 2026-08-27
braucht: []
kind_von: C-49
kinder: []
entscheidung: null
agent: claudecode
beauftragt: 2026-08-29
beruehrt:
  tabellen: []
  dateien: []
zahlen: null
---

# C-323 - Micro-Flags Warnschwelle und Formulierung festlegen

## Befund

Offene Frage aus C-49: ab wann Unterversorgung gewarnt wird und mit welcher Formulierung.

## Auftrag — Micro-Flags, auf den Bodybuilder zugeschnitten

**Tom, 2026-08-29:** *,,setz es um dass es fuer einen bodybuilder der
beste nutzen gibt"*.

### Vorweg

`[read]` **Dieser Auftrag traegt keine Zahlen vom Orchestrator.**
**Nenn Nutzer und Zeitraum bei jeder Messung.**

`[cmd]` **Es gibt keine `micro_flags`-Tabelle.** `[read]` **Die Frage
ist also nicht, welche Schwelle gilt, sondern woraus ein Flag
entsteht.**

### Was schon da ist

`[cmd]` **Die vier Zustaende stehen seit G-249** — gedeckt, zu wenig,
ueber der Obergrenze, kein Richtwert. `[cmd]` **Die Zeitraeume
7/30/90 seit G-247, der Verlauf mit drei Linien, die Pillen als
Filter.**

`[read]` **Ein Flag ist die Verdichtung davon zu einer Aussage** —
kein neuer Datenweg.

### Drei Vorgaben, die aus dem Bestand folgen

**1 · Dauer statt Hoehe.** `[read]` Ein Tag unter dem Ziel ist normal,
dreissig Tage sind ein Muster. `[cmd]` **Mit den Zeitraeumen aus E-24
ist das rechenbar:** *,,an 42 von 90 Tagen ueber der Grenze"* ist eine
Aussage, *,,heute 172 Prozent"* ist es nicht.

**2 · Die Leserichtung mitfuehren.** `[read]` **C-48 Regel 2:** 80
Prozent eines Zielwerts sind zu wenig, 80 Prozent einer Obergrenze
sind unbedenklich. `[read]` **Ein Flag ohne diese Richtung warnt
falschherum** — deshalb keine reine Prozentschwelle.

**3 · Unvollstaendiges ist kein Mangel.** `[cmd]` `vitc_missing`
feuert an nahezu allen Tagen. `[read]` **Ein Flag, das eine
unvollstaendige Summe als Unterversorgung meldet, erfindet einen
Mangel.** **Dieselbe Regel wie C-48 Regel 1.**

### Der Zuschnitt auf den Bodybuilder

`[read]` **Das ist der eigentliche Auftrag, und er ist eine
Messfrage.**

`[cmd]` **Miss zuerst, welche Naehrstoffe auf `dev` und den drei
Seed-Konten ueberhaupt auffaellig werden** — und ueber welche
Zeitraeume. `[read]` **Wenn dieselben fuenf immer auffallen, ist eine
Liste von fuenf nuetzlicher als eine Regel ueber 138.**

`[read]` **Und was einen Bodybuilder betrifft, unterscheidet sich vom
Durchschnitt:** hohe Proteinzufuhr, hohe Energiezufuhr, oft
Supplementierung. **Eisen, Zink, Magnesium, Vitamin D und Natrium
sind die naheliegenden Kandidaten — aber das ist meine Vermutung, und
sie gehoert gemessen, nicht uebernommen.**

`[cmd]` **Die Supplementeinnahmen liegen in `supplements.intake_logs`.**
`[read]` **Ob ein Flag sie mitzaehlen muss, ist eine echte Frage:**
wer Magnesium nimmt und in der Nahrung wenig hat, ist nicht
unterversorgt. **Miss, ob die Verbindung heute besteht** — und wenn
nicht, **sag es, statt sie zu bauen.**

### Was nicht zu tun ist

**Keine Prozentschwelle als einzige Regel.**
**Keinen Score bauen** — das ist C-324, Codex arbeitet daran.
**Keine Tabelle anlegen.**
**Keine Warnung erfinden, wo die Daten unvollstaendig sind.**
**Nichts auf `dev@lumeos.app` schreiben.**
Nicht committen, nicht stagen, nicht pushen.

### Nachweis

    auffaellige Naehrstoffe      gemessen, je Konto und Zeitraum
    Flags je Zeitraum            wie viele bei 7 / 30 / 90
    Leserichtung                 unter Ziel gegen ueber Grenze -
                                 Bildschirmfoto
    unvollstaendig               erzeugt kein Flag - belegt
    Supplemente                  zaehlen sie mit? gemessen
    Formulierung                 je Flag ein Satz, ohne Zahl
    Doppelung                    zeigt der Reiter das schon?
    Attrappen                    am Schirm gezaehlt (A-59)

`[read]` **Die vorletzte Zeile ist die, die ich dreimal uebersehen
habe — und die du in G-11 und G-253 selbst angewandt hast.**

### Regeln

`tools/lauf.py` fuer jeden Befehl, keine Konsolenfenster.
`[cmd]` **Der Dev-Server beendet sich von selbst** (G-205).
`[cmd]` **A-30, A-59, A-60 beachten.**
`[cmd]` **Die Seed-Daten reichen bis November 2026** — eine offene
Datumsgrenze faengt alles Zukuenftige mit.

**Wenn eine Vorgabe nicht aufgeht: melden, nicht passend machen.**

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
