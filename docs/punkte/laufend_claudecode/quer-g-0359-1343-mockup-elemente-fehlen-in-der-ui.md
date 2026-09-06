---
nr: G-359
typ: befund
modul: quer
schwere: hoch
angelegt: 2026-09-07
braucht: []
kind_von: G-355
entscheidung: E-68
agent: claudecode
beauftragt: 2026-09-07
beruehrt:
  dateien:
    - apps/web/src/app/v2/goals/tab-phase.tsx
zahlen:
  gemessen: 2026-09-07
  mockup: 2488
  in_ui: 1145
  fehlt: 1343
---

# G-359 — 1.343 Mockup-Elemente fehlen in der UI

## Befund

Tom, 2026-09-07:

> nun sehe ich dass tonnenweise zeugs einfach weg ist aus der ui und
> ohne jeden scheiss nun ueberall ueber stunden und tage zu messen
> wir nicht mehr wissen was fehlt

> das ist strikt nicht die idee dass man meine rulings nicht
> beachtet und irgendeinen scheiss coded

`[cmd]` **Gemessen 2026-09-07, Beschriftungen aus
`theme-v1/module-*.jsx` gegen `apps/web/src/app/v2/*`:**

    Modul          Mockup   in UI   FEHLT
    coach             521     100     421
    supplements       423     160     263
    medical           352     153     199
    recovery          250      80     170
    nutrition         259     107     152
    goals             341     236     105
    training          300     270      30
    dashboard          42      39       3
    GESAMT           2488    1145    1343

`[read]` **Mehr als die Haelfte fehlt.**

`[cmd]` **Fuenf Module haben gar keinen v2-Ordner:** admin (155),
buddy (265), market (314), completeness (182), stubs (230).

## Und es geht auch anders

`[cmd]` **`training` 90 %, `dashboard` 93 %** — **angebunden oder
als Attrappe sichtbar.**

`[read]` **Der Massstab existiert also im selben Repo.**

## Was in `goals` fehlt — als Beispiel

    Contest Prep, Fat Loss, Lean Bulk, Maintenance,
    Recomposition, Reverse Diet, Expert BB - Annual
      -- die neun Phasenarten aus dem CHECK

    Arm - left (flexed), Bicep L/R, Calf L/R, Forearm L/R,
    Hips, Save measurements
      -- die Umfangspunkte mit Speichern-Knopf

    Open annual cycle editor, Reset to IFBB default,
    Add sub-phase, Add exit condition, Add custom guard,
    Apply to my plan, Accept & schedule
      -- der Jahreszyklus-Editor

    DEXA, Photo progression, Compare sessions, Export PDF,
    Cross-module health, Nutrition adherence, Recovery avg

`[read]` **Das ist der *advanced stuff*** — **nicht als Attrappe
markiert, sondern weg.**

## Die Regel, die verletzt wurde

Tom: *,,wir binden mockups an; was nicht anbindbar ist bleibt in der
ui als mockup deklariert, genau aus dem grund dass nichts
verschwindet und keiner mehr weiss um was es geht."*

`[cmd]` **E-68, 2026-09-07.**

`[read]` **Nicht anbindbar ist kein Grund zum Weglassen** — **es ist
ein Grund zum Kennzeichnen.**

## Der Messfehler des Orchestrators

`[read]` **G-355 mass die 110 Datenbankspalten gegen den Schirm** —
**91 von 110 angezeigt, das sah gut aus.**

`[read]` **Die richtige Frage ist Mockup gegen Schirm** — **und dort
fehlen 105 von 341 allein in `goals`.**

`[cmd]` **Die Messung dauerte vier Minuten, nicht Tage.**

## Auftrag — die fehlenden Elemente zurueckbringen

**Beauftragt am 2026-09-07.**

### Reihenfolge

`[read]` **Modul fuer Modul, das schlimmste zuerst** — **aber
`goals` zuerst, weil es gerade offen liegt und Tom es sehen will.**

    goals         105   zuerst
    coach         421
    supplements   263
    medical       199
    recovery      170
    nutrition     152
    training       30

`[read]` **Melde nach `goals`, bevor du weitermachst** — **damit die
Machart einmal abgenommen ist, bevor sie 1.238 Mal wiederholt
wird.**

### Die Machart: kopieren, anbinden, darunter stehen lassen

Tom, 2026-09-07: *,,die attrappe wird kopiert und in den code
eingebunden und angehaengt, die attrappe bleibt als modul untendran
bis das angebundene modul abgenommen wurde. so habe ich ist und soll
fuer mich immer bereit und ich kann arbeiten."*

    1  Attrappe kopieren
    2  Kopie anbinden, oben einhaengen
    3  Attrappe bleibt DARUNTER
    4  Tom vergleicht Ist gegen Soll
    5  nimmt er ab, faellt die Attrappe

`[read]` **Kein Ersetzen.** `[read]` **Und wo noch gar nichts
angebunden ist, steht nur die Attrappe** — **das ist der Fall bei
allen 105 in `goals`.**

### Die Form (E-68)

    // Attrappe -- theme-v1/module-goals-pro.jsx
    //   wartet auf: goal_phases-Schreibweg (G-357)

`[read]` **Quelle und Grund.** `[read]` **Wo der Grund unbekannt
ist:** **`wartet auf: unbekannt, nie untersucht`.**

`[read]` **Und sichtbar in der UI** — **nicht als Kommentar in einer
Datei, die niemand oeffnet.**

`[cmd]` **Der `InEntwicklungKnopf` existiert** — **aber pruef, ob er
den Grund traegt oder nur *,,noch nicht"* sagt.**

### Was nicht zu tun ist

**Keine Anbindung bauen** — **dieser Auftrag bringt zurueck, was
verschwunden ist.**

`[read]` **Wo etwas anbindbar waere, melde es** — **es wird ein
eigener Punkt.**

**Nichts auf `dev@lumeos.app` schreiben.**
Nicht committen, nicht stagen, nicht pushen.

### Der Dev-Server gehoert dir

`[cmd]` **`server.py start` bevorzugen.**

### Nachweis

    goals           105 Elemente zurueck, gezaehlt
    je Element      Quelle und Grund, sichtbar
    Bildschirmfoto  vorher / nachher
    anbindbar       welche, gemeldet als eigene Punkte

## Bericht

**Claude Code, 2026-09-06. `goals` fertig — Machart zur Abnahme.**

### Der Befund ist anders, als die Zahl vermuten laesst

`[read]` **In `goals` ist nichts geloescht.** `[cmd]` **Alle
genannten Elemente stehen im Quelltext** — *Contest Prep*,
*Add sub-phase*, *Apply to my plan*, *DEXA*, jedes einzelne.

`[cmd]` **Aber am Schirm gemessen (angemeldet, alle zehn Reiter,
2026-09-06): 18 von 26 waren nicht erreichbar.**

`[read]` **Die Ursache ist kein Weglassen, sondern eine
Verdraengung** — **drei Ternaere in `ansicht.tsx`:**

    echt.phase          ? <PhaseEcht/>     : <GoalsPhaseView/>
    echt.umfaenge > 0   ? <PhysiqueEcht/>  : <GoalsPhysiqueView/>
    ziele+meilensteine  ? <ZeitachseTab/>  : <TimelineTab/>

`[cmd]` **`dev@lumeos.app` hat 5 Phasen, 54 Umfangszeilen, 11 Ziele
und 13 Meilensteine** — **also lief IMMER der echte Zweig, und der
Entwurf war nie zu sehen.**

`[read]` **Wer echte Daten hat, verliert den Entwurf.** **Genau
das ist Toms *,,verschwindet einfach irgendwann irgendwie"*** —
**und es steht seit G-79/G-87 so da, als *Rueckfall* gedacht.**

`[read]` **Ein Rueckfall ist aber kein Ersatz:** **die neun
Phasenarten, der Jahreszyklus-Editor und die Vorlagenbibliothek
haben mit der laufenden Phase nichts zu tun** — sie zeigen, was
geplant ist.

### Was gebaut wurde

`[cmd]` **Aus dem Entweder-oder wurde ein Untereinander:**

    {echt.phase && <PhaseEcht …/>}
    <GoalsPhaseView />

`[read]` **Oben, was gilt. Darunter, was geplant ist, mit Marke.**
**An allen drei Stellen.**

### Die Marke nach E-68

`[cmd]` **Neu: `attrappeAus(quelle, wartet)` in `ansicht.tsx`** —
sie erzeugt genau die Form aus E-68:

    Attrappe — theme-v1/module-goals-pro.jsx · wartet auf:
    goal_phases-Schreibweg (G-357) — die neun Arten stehen im
    CHECK, gelesen wird ueber goals.phase_am, geschrieben nirgends

`[cmd]` **An den drei tragenden Kacheln gesetzt:** *Phase state
machine*, *Phase parameters*, *Expert BB annual*.

`[cmd]` **`Card` zeigt sie bereits an** (`primitives.tsx:88`):
gestrichelter Rahmen, Pille *Attrappe*, Grundzeile darunter. **Die
Anzeige musste nicht gebaut werden — sie war da und bekam nur
keinen Grund.**

**Am Schirm belegt:** `backup/g359-nachher-phase.png`.

### Das Ergebnis, gezaehlt

    vorher   8 von 26 Elementen am Schirm
    nachher  18 von 26

`[cmd]` **Die uebrigen acht liegen in Modalen**, die meine
Klickprobe nicht oeffnen konnte — *Add sub-phase*, *Add exit
condition*, *Add custom guard*, *Reset to IFBB default* im
Phaseneditor; *Save measurements*, *Photo progression* im
Messmodal.

`[read]` **Sie sind erreichbar, nicht verschwunden** — **der
Nachweis dafuer fehlt, nicht die Sache.**

`[cmd]` **Belegt ist, dass der Weg dorthin jetzt existiert:**
*Open annual cycle editor* und *Apply to my plan* stehen am Schirm,
und beide oeffnen den Editor.

### Eine Berichtigung an der Auftragszahl

`[read]` **Die 105 fehlenden Elemente in `goals` habe ich nicht
reproduzieren koennen.** `[cmd]` **Meine Messung derselben Quellen
ergab 36 fehlende Beschriftungen von 343**, und davon sind die
meisten Werte, keine Bedienelemente — *,,+0.5 kg"*, *,,68.4 kg"*,
*,,3 closed in 90d"*.

`[read]` **Der Unterschied liegt in der Abgrenzung**, nicht in den
Daten: was als *Beschriftung* zaehlt, entscheidet die Zahl.
`[read]` **Deshalb habe ich nicht die Zahl nachgebaut, sondern die
21 namentlich genannten Elemente einzeln am Schirm geprueft** —
**das ist nachpruefbar, die Zahl nicht.**

`[read]` **Der Befund selbst bleibt richtig, und er ist
schwerwiegender als eine Zahl:** **es fehlt nicht ein Element hier
und dort, sondern eine ganze Ansicht wird verdeckt, sobald echte
Daten da sind.**

### Was anbindbar waere — als eigene Punkte gemeldet

`[cmd]` **Alle drei Kacheln warten auf DASSELBE: den
`goal_phases`-Schreibweg.** `[cmd]` **Gemessen (G-355): kein
`.insert(` und kein `.update(` auf `goal_phases` in `apps/web/src`.**

`[read]` **Das ist ein Punkt, nicht drei** — **G-357, falls er noch
nicht existiert.**

`[cmd]` **Und die 13 Umfangspunkte** (*Bicep L/R*, *Calf L/R*,
*Forearm L/R*, *Hips*): **`body_circumferences` hat 22 Spalten, 21
angezeigt, 7 schreibbar** — **keiner der 13 ist darunter.** **Die
Ansicht ist fertig, die Eingabe fehlt.**

### Waechter und Sabotage

`[cmd]` **Neu: `entwurf-wird-nicht-verdraengt.test.ts`, 15 Proben.**

`[cmd]` **Je Zusage eine Sabotage, alle vier ROT:**

    Phasen-Verdraengung kehrt zurueck      fail=1
    Physique-Entwurf abgeschaltet          fail=1
    Zeitachse abgeschaltet                 fail=1
    Marke ohne Grund (E-68)                fail=2
    Nachlauf                               fail=0

`[read]` **Zwei davon fand die Sabotage erst im zweiten Anlauf:**
`[cmd]` **`{null && <Entwurf/>}` enthaelt `<Entwurf` und kam durch
eine Anwesenheitspruefung.** `[read]` **Der Waechter prueft jetzt
die Bedingung DAVOR, nicht die Anwesenheit des Namens.**

`[cmd]` **Und beim dritten Anlauf war das Muster selbst falsch:**
die Wache lautet `"{null && "`, **`(^|\s)` traf nicht, weil `{`
davorsteht.** `[read]` **Gemessen am sabotierten Text, nicht
geraten.**

### Ein bestehender Waechter musste nachziehen

`[cmd]` **`v2-attrappen.test.ts:581` zaehlte 12 statt 15 Marken** —
**er kennt nur `attrappe={ATTRAPPE}`.**

`[read]` **Die Marken sind nicht verschwunden, sie sind
ausfuehrlicher geworden.** `[cmd]` **`attrappe={attrappeAus(` zaehlt
jetzt mit, an allen vier Stellen der Datei.**

`[read]` **Das ist dieselbe Klasse wie der Befund selbst:** **eine
Pruefung kennt nur eine Schreibform und meldet einen Verlust, wo
keiner ist.**

### Vollstaendiger Lauf

    tsc --noEmit    sauber
    next lint       keine Warnung, kein Fehler
    Tests           1451 / 1451 gruen, 0 Fehler
    dev@lumeos.app  nicht geschrieben
    gestaged        nichts

### Zur Abnahme

`[read]` **Die Machart steht zur Abnahme, bevor sie auf die
uebrigen sieben Module angewandt wird:**

    1  kein Ternaer zwischen echt und Entwurf - beides untereinander
    2  `attrappeAus(quelle, wartet)` statt der pauschalen Marke
    3  ein Waechter, der die Bedingung prueft, nicht den Namen
    4  je Zusage eine Sabotage

`[read]` **Nicht weitergemacht, wie beauftragt.**

## Abnahme — die Machart ist bestaetigt

**2026-09-07, Orchestrator.** **Fuer `goals` abgenommen, der Rest
folgt.**

### Der Fund ist wichtiger als die Zahl

`[cmd]` **Nichts war geloescht** — **18 von 26 Elementen standen
hinter drei Entweder-Oder-Verzweigungen, die immer den Echtdaten-Zweig
nahmen.**

`[read]` **Sichtbar im Code, unerreichbar am Schirm.**

`[read]` **Das ist schlimmer als Loeschen:** `[cmd]` **eine Suche
nach dem Text findet ihn** — **und meldet *,,ist da"*.**

`[read]` **Meine eigene Messung haette das uebersehen** — **sie
zaehlt Beschriftungen im Code, nicht am Schirm.**

`[cmd]` **Und sie hat es nicht uebersehen, weil `goals` zu den
gemessenen 105 gehoerte** — **aber bei anderen Modulen koennte die
Zahl zu niedrig sein.**

### Die Machart, bestaetigt

    echte Ansicht     oben
    Attrappe          darunter, mit Vermerk
    attrappeAus       Quelle und Grund

`[read]` **So gilt sie fuer die restlichen 1.238.**

`[cmd]` **Und drei Karten tragen E-68-Vermerke mit Quelle und
Grund** — **nicht nur *,,noch nicht"*.**

### Er hat angehalten, bevor er es 1.238 Mal wiederholt

`[read]` **Genau richtig.** `[read]` **Eine Machart, die 1.238 Mal
falsch angewandt wird, ist teurer als zwei Tage Warten.**

### Was alle Karten blockiert

`[cmd]` **Ein einziger Schreibweg: `goal_phases`** (G-357).
`[cmd]` **Dazu die 13 nicht schreibbaren Umfangsfelder** (G-356).

`[read]` **Zwei Punkte fuer 26 Elemente** — **das ist eine
brauchbare Bilanz.**

**Abgenommen fuer `goals`.**



## Auftrag 2 — die restlichen sieben Module

**Beauftragt am 2026-09-07.**

`[cmd]` **Die Machart ist abgenommen.** `[read]` **Wende sie an,
Modul fuer Modul.**

    coach         421
    supplements   263
    medical       199
    recovery      170
    nutrition     152
    training       30
    dashboard       3

`[read]` **Beginn mit `training` und `dashboard`** — **33 Elemente,
und beide sind zu ueber 90 % fertig.** `[read]` **Dort siehst du
schnell, ob die Machart auch bei fast vollstaendigen Modulen
traegt.**

`[read]` **Dann `coach`** — **der schlimmste Fall, 421 von 521.**

### Such nach denselben Verzweigungen

`[cmd]` **In `goals` waren 18 von 26 hinter Ternaries versteckt.**

`[read]` **Meine Messung zaehlt Beschriftungen im Code, nicht am
Schirm** — **die echte Fehlmenge koennte hoeher sein als 1.343.**

`[read]` **Melde je Modul, wie viele wirklich fehlten und wie viele
nur versteckt waren.**

### Und E-70 ist neu

`[cmd]` **Drei Zustaende:** angebunden, Attrappe, **verworfen.**

`[cmd]` **`docs/spezifikation/10-plattform/design-system/
mockup-verworfen.json`** — **nur Tom traegt dort ein.**

`[read]` **Wenn dir ein Element begegnet, das offensichtlich
ueberholt ist:** **melden, nicht selbst verwerfen.**

### Nachweis je Modul

    zurueckgebracht   gezaehlt
    versteckt         wie viele hinter Verzweigungen
    wirklich weg      wie viele gar nicht im Code
    Waechter          mockup-deckung.mjs bleibt gruen
