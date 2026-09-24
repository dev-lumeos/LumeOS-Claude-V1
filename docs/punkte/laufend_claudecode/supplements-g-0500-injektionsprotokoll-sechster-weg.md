---
nr: G-500
typ: fehler
modul: supplements
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: G-499
entscheidung: E-88
agent: claudecode
beauftragt: 2026-09-08
beruehrt:
  dateien:
    - apps/web/src/app/v2/supplements/injektion-daten.ts
zahlen:
  gemessen: 2026-09-08
---

# G-500 - das Injektionsprotokoll ist der sechste Weg

## Der Befund

Aus G-499, Claude Code, 2026-09-08:

> *,,Der sechste Weg existiert. Einzige Restquelle ist
`injektion-daten.ts`. Der Injektionsreiter steht NICHT hinter
der Gradpruefung und hat sein eigenes Mockup ? ihn
umzuschreiben waere eine Entscheidung, also gemeldet statt
getan."*

`[read]` **Richtig gemeldet** ? **E-88 hat die Entscheidung
aber schon getroffen.**

## Was drinsteht, selbst gemessen

    compound: "Testosterone Cypionate", ml: 0.6, mg: 150,
      route: "im", needle: "23G x 1.5\""
    compound: "HCG", ml: 0.3, route: "subq",
      needle: "29G x 0.5\"", notes: "500 IU"

`[read]` **Das ist kein Katalog** ? **das ist ein
nachgestelltes Injektionsprotokoll mit Dosis, Weg und
Nadelstaerke.**

`[cmd]` **8,0 KB, 19 `compound`-Eintraege, und die 16 Namen
darin sind EINSTICHSTELLEN: Abdomen, Deltoid, Gluteus, Quad,
SubQ Thigh.**

## Die Entscheidung (E-88, uebertragen)

`[read]` **Die Referenz zeigt Extended-Inhalt, also folgt sie
Extendeds Regel** ? **das galt fuer `mockup-referenz.tsx`, es
gilt hier genauso.**

`[read]` **Der REITER bleibt** ? **es gibt Injektionen ohne
PED (B12, Vitamin D).** **Seine Attrappendaten gehen hinter
die Pruefung.**

## Und die Lehre aus der Nacharbeit gilt

> *,,Nach FELDERN messen, nicht nach Namen."*

`[cmd]` **`compound`, `route`, `needle`, `ml`, `mg` sind die
Felder** ? **suche danach, nicht nach *,,HCG"*.**

## Abnahmebedingungen

    A1  vorher/nachher nach FELDERN gemessen, nicht
        nach Namen.
    A2  compound, route, needle: 0 Chunks im Manifest.
    A3  mit Grad: der Reiter steht wie bisher. Foto.
    A4  ohne Grad: der Reiter bleibt bedienbar, die
        Attrappendaten fehlen mit einer Erklaerung. Foto.
    A5  ein siebter Weg? Das GANZE Manifest nach
        compound/route/needle/dose/mg durchsucht.
    A6  der Waechter deckt injektion-daten mit ab.
        Sabotageprobe.
    A7  apps/web 1995 oder mehr, apps/coach 65.

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_


## Bericht

**Claude Code, 2026-09-08.** `[cmd]` **Gemessen am eigenen
Produktionsbau** (`.next-g500`) **und im Browser auf 3200.**

### Alle Abnahmebedingungen erfuellt

`[cmd]` **`node tools/_g500-injektion.mjs` ? 22 Proben, alle
gruen, Austritt 0.** **`pnpm gate` GRUEN, 18 von 18.**
**`apps/web` 2.000** (1.995 + fuenf neue Waechter),
**`apps/coach` 65.**

### A1 ? nach FELDERN gemessen, ganzes Manifest

`[cmd]` **Vorher, 31 Seiten und 54 Chunks durchsucht:**

    compound:      2 Chunks   /v2/supplements/page
    route:"im"     1          /v2/supplements/page
    route:"subq"   1          /v2/supplements/page
    needle:        1          /v2/supplements/page
    maxMl          1          /v2/supplements/page
    daysAgo        1          /v2/supplements/page

`[read]` **Zwei Treffer gehoerten nicht dazu, und das musste
gemessen werden, nicht angenommen:** `restDays` in
`/v2/goals` ist ein **Kalorienparameter**
(`trainingDays`/`restDays`), `compound` im Chunk `5541` ist die
Beschriftung des bereits gesperrten Extended-Reiters.

### A2 ? nachher null

    compound:              0 Seiten
    mg: 150                0
    ml: 0.6                0
    longest rested IM site 0
    slight soreness 24h    0

`[cmd]` **Im Seitenchunk gegengeprueft:** `Testosterone
Cypionate`, `HCG`, `BPC-157`, `500 IU` ? **alle weg.**
`Gluteus`, `Ventroglutal`, `Abdomen`, `Safest IM site` ?
**alle da.**

`[cmd]` **Und im Browser:**

    ohne Grad   0 Dateien mit einem Protokollfeld
    mit Grad    1 -- _..._injektion-entwurf_tsx.js

### A3 ? mit Grad unveraendert

`[cmd]` **`test-user@lumeos.local` (`pro`):**

    SITES READY      12 of 16 tracked
    RESTING          2
    NEXT INJECTION   Mon 08-17
                     Testosterone Cypionate · 0.6 ml IM
    Ventroglutal L   STATUS ready · LAST USED 11 d ago

**Bild:** `tools/_g500-mit-grad.png`

### A4 ? ohne Grad bedienbar, mit Erklaerung

`[cmd]` **`coach@lumeos.app` (NULL):**

    SITES READY      16 of 16 tracked
    RESTING          0
    NEXT INJECTION   --  (kein Plan erfasst)
    Ventroglutal L   STATUS fresh · LAST USED never

`[read]` **Die Rotationskarte, die Nadelempfehlung
(23G x 1.25"), das Ruhefenster (7 d) und die Volumengrenze
(2,5 ml) stehen vollstaendig** ? **der Reiter ist bedienbar,
nur ohne Beispielprotokoll.**

`[read]` **`fresh` und `never` sind die RICHTIGE Aussage**, nicht
ein Leerstand: wer keine Einnahmen erfasst hat, hat keine
benutzten Stellen.

**Bild:** `tools/_g500-ohne-grad.png`

### A5 ? ein siebter Weg?

`[read]` **Im Manifest: nein.** `[cmd]` **31 Seiten, 55 Chunks,
nach acht Feldern durchsucht ? kein Protokollfeld auf irgendeiner
Seite.**

`[read]` **Auf dem SCHIRM aber ja ? und zwar zweimal:**

**1 ? ein LITERAL im JSX.** `[cmd]` **`Test Cyp · 0.6 ml IM`
stand fest in der Auszeichnung von `tab-injektionen.tsx`**, ohne
Feld. `[read]` **Meine Feldsuche hat es nicht gefunden** ?
`compound:` trifft Daten, nicht Markup. **Der Schirm hat es
gezeigt.**

`[read]` **Die Lehre aus G-499 gilt in beide Richtungen:** nach
Feldern zu messen findet, was in DATEN steht ? **und uebersieht,
was jemand direkt hingeschrieben hat.** `[cmd]` **Behoben: die
Kachel liest jetzt `entwurfPlan[0]`**, ohne Grad steht dort
*,,kein Plan erfasst"*. **Ein Waechter faengt den Rueckfall.**

**2 ? die Auswahlliste `Substanz …`** zeigt ACE-031, Anamorelin,
AOD-9604, Boldenone, BPC-157. `[cmd]` **Gemessen: sie kommt aus
`ladeInjizierbareSubstanzen()`** (G-423) ? **ein SERVER-Leseweg
aus der Datenbank, nicht mein Entwurf.**

`[read]` **Das ist eine eigene Frage und nicht entschieden:**
*Gehoert der Substanzkatalog des Konfigurators hinter dieselbe
Pruefung?* **Ich habe ihn nicht angefasst** ? er ist angebunden,
kein Mockup.

### A6 ? der Waechter

`[cmd]` **`g117-extended-buendel.test.ts`: von 13 auf 18
Proben.** **Fuenf Sabotagen, jede trifft genau ihre Probe:**

    Protokoll zurueck nach injektion-daten.ts  -> 14 rot
    INJ_PROTOKOLL = [] (geloescht statt
      verschoben)                              -> 15 rot
    Protokoll statisch importiert              -> 16 rot
    Gradpruefung vor der Naht entfernt         -> 17 rot
    Wirkstoffliteral zurueck ins JSX           -> 18 rot

### Was gebaut wurde

    NEU  injektion-protokoll.ts   INJ_PROTOKOLL + INJ_PLAN
    NEU  injektion-entwurf.tsx    die Naht, dynamisch geholt
         injektion-daten.ts       nur noch die 16 ORTE
         tab-injektionen.tsx      Protokoll als Prop,
                                  ortZustand mit Parameter
         modale.tsx               Auswahlliste -> freies Feld
         ansicht.tsx              dynamic + Gradpruefung
                                  + Erklaersatz

`[read]` **`ortZustand` nimmt das Protokoll jetzt als Argument**
? **dieselbe Bauform wie `lib/medical/injektion-flaechen.ts`,
der angebundene Weg** (G-388). **Ohne Protokoll: `fresh`.**

`[cmd]` **Und die Benennung:** das Prop heisst
`entwurfProtokoll`, **nicht `protokoll`** ? zwei Zeilen tiefer
steht `const protokoll = stand?.protokoll ?? []`, **das ECHTE
aus der Datenbank.** `[read]` **Ein gleicher Name haette den
angebundenen Weg ueberdeckt.**

### Fuenf Fehler in meiner eigenen Probe

`[cmd]` **1 ? die inneren Reiter nie geoeffnet.** Der Reiter
startet auf `rotation`; die Wirkstoffe stehen in `Log` und
`Schedule`. **Die Probe meldete *,,mit Grad zeigt der Reiter
nichts"*** ? **gemessen war die falsche Ansicht.**

`[cmd]` **2 ? zum DRITTEN Mal mein eigener Kommentar.** In
`ansicht.tsx` UND `modale.tsx` standen die Suchtexte woertlich;
der Entwicklungsbau liefert Kommentare mit. **Beide
umgeschrieben.**

`[cmd]` **3 ? `500 IU` als Protokollfeld gefuehrt.** Es kommt
auch aus `medical/daten.ts` und betrifft `/v2/medical`.
`[read]` **Ein Muster, das zwei Module trifft, misst nicht mein
Modul.**

`[cmd]` **4 ? den Erklaersatz nach den Klicks gemessen**, nicht
im Startzustand ? er war da, die Probe sah ihn nicht.
**Und das Bild nach den Klicks aufgenommen:** es zeigte
`Katalog` statt des Injektionsreiters.

`[cmd]` **5 ? ein gefressener Backslash.** Beim Schreiben ueber
eine Shell-Heredoc wurde aus `export\s+const` ein
`exports+const`. `[read]` **Eine der beiden Proben blieb
dadurch GRUEN, weil sie auf `false` prueft** ? **ein kaputter
Ausdruck trifft nie, und *,,trifft nie"* heisst dort *,,ist in
Ordnung"*.** **Die gefaehrlichste Bauform.** Beide berichtigt,
die Sabotage belegt es.

`[read]` **Und noch etwas gelernt:** nach einer
Sabotage-Wiederherstellung war `// ══` zu `/ ══` geworden ?
**die Waechter blieben gruen, `tsc` fand es.** **Textproben und
Uebersetzung pruefen verschiedene Dinge; das Gate braucht
beide.**

### Neustart

`[read]` **Nicht noetig** ? nur `apps/web/src`.

`[cmd]` **`apps/web/.next-g500/` ist mein Messbau** ? faellt
unter `apps/*/.next-*`, bleibt bis zur Abnahme liegen.

### Selbst nachmessen

    node tools/_g500-injektion.mjs

`[cmd]` **Von Hand, das ganze Manifest:**

    cd apps/web
    grep -rl "compound:" .next-g500/static/chunks/
      -> nur der Extended-Chunk und injektion-entwurf,
         NICHT app/v2/supplements/page-*.js

### Werkzeuge

    tools/_g500-injektion.mjs   A1-A5, 22 Proben, Austritt 0/1
    tools/_g499-referenz.mjs    G-499, weiter gruen
    tools/_g117-reiter.mjs      zwoelf Reiter, weiter gruen
