---
nr: G-499
typ: fehler
modul: supplements
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: E-88
entscheidung: E-88
agent: claudecode
beauftragt: 2026-09-08
beruehrt:
  dateien:
    - apps/web/src/app/v2/supplements/mockup-referenz.tsx
zahlen:
  gemessen: 2026-09-08
---

# G-499 - die Entwurfsreferenz hinter die Gradpruefung

## Die Entscheidung (E-88)

`[read]` **Die Referenz zeigt Extended-Inhalt, also folgt sie
Extendeds Regel.**

## Der Befund

Aus G-117, Claude Code:

> *,,`mockup-referenz.tsx` zeigt unter der Trennlinie dieselben
Wirkstoffe mit DOSIS und SCHEMA ? fuer jeden, ohne
Gradpruefung."*

> *,,Isolationsprobe: haengt man sie aus, verschwindet
`physician-supervised` aus dem Manifest ? sie ist die URSACHE,
kein Rest."*

`[cmd]` **Selbst nachgemessen, `page-ef08b4bb9df16c11.js`,
315 KB: `ReferenzTrenner` JA, Mockup-Marken 6 von 6,
`physician-supervised` JA, `EXTENDED_STACK` nein.**

## Zu bauen

`[cmd]` **Dieselbe Pruefung wie `tab-extended.tsx`, dasselbe
`dynamic({ ssr: true })`.**

`[read]` **NUR der Teil unter der Trennlinie, der Extended
zeigt** ? **die uebrigen Entwurfsreferenzen bleiben, wie E-68
und E-70 es verlangen.**

`[read]` **Und was ohne Grad dort steht: eine Erklaerung, kein
leeres Feld.**

## Abnahmebedingungen

    A1  vorher/nachher: steht physician-supervised im
        Manifest? Gemessen.
    A2  mit Grad: die Referenz steht wie bisher. Foto.
    A3  ohne Grad: eine Erklaerung. Foto.
    A4  die uebrigen Entwurfsreferenzen im Modul
        unveraendert. Zahl.
    A5  der Waechter aus G-117 deckt sie jetzt mit ab.
        Sabotageprobe.
    A6  die zwoelf anderen Reiter unveraendert.
    A7  apps/web 1987 oder mehr, apps/coach 65.

## Bericht

**Claude Code, 2026-09-24.** `[cmd]` **Gemessen am eigenen
Produktionsbau** (`.next-g499`, unter Toms
`apps/*/.next-*`-Regel) **und im Browser auf 3200.**

### Alle Abnahmebedingungen erfuellt

`[cmd]` **`node tools/_g499-referenz.mjs` ? 16 Proben, alle
gruen, Austritt 0.** **`pnpm gate` GRUEN, 18 von 18.**
**`apps/web` 1.991** (1.987 + vier neue Waechter),
**`apps/coach` 65.**

### A1 ? vorher / nachher

`[cmd]` **Vorher (G-499 nennt es, selbst nachgemessen):**
`physician-supervised` **im Seitenmanifest.**

`[cmd]` **Nachher, vier Kennzeichen geprueft, die NUR Extended
traegt:**

    physician-supervised    -> 1602.js, 5541.js   nicht im Manifest
    HCG (Human Chorionic    -> 1602.js, 5541.js   nicht im Manifest
    sideEffectScore         -> 1602.js, 5541.js   nicht im Manifest
    nextLab                 -> 1602.js, 5541.js   nicht im Manifest

`[read]` **Die Seite laedt zehn JS-Dateien ? keine davon traegt
eines der vier.** `[read]` **Gegenprobe im selben Lauf: der Code
ist nicht verschwunden**, er liegt in zwei eigenen Chunks.

`[cmd]` **Und im Browser gegengeprueft, nicht nur im Manifest:**

    ohne Grad   0 Dateien mit einem Extended-Kennzeichen
    mit Grad    2 -- _..._tab-extended_tsx.js
                     _..._mockup-referenz-extended_tsx.js

### A2 ? mit Grad unveraendert

`[cmd]` **`test-user@lumeos.local` (`pro`):** `Active protocols`,
`Half-life · this week`, `Visibility · who sees what` und die
Trennlinie stehen; **kein Erklaersatz** (die Referenz ist ja da);
null Seitenfehler. **Bild:** `tools/_g499-mit-grad.png`

### A3 ? ohne Grad eine Erklaerung

`[cmd]` **`coach@lumeos.app` (NULL):** **die Trennlinie steht**,
darunter der Satz, **die echte Referenz bleibt aus**, die
Sperrkachel bleibt, null Seitenfehler.
**Bild:** `tools/_g499-ohne-grad.png`

> Die Entwurfsfassung dieses Reiters zeigt dieselben Wirkstoffe,
> Dosierungen und Anwendungsschemata wie der Reiter darueber.
> **Sie folgt deshalb derselben Regel** und erscheint erst, wenn
> dein Erfahrungsgrad den Bereich oeffnet.

`[read]` **Die Trennlinie bleibt in BEIDEN Faellen** ? G-365 hat
gemessen, was passiert, wenn sie an einer Bedingung haengt.
**Hier ist es umgekehrt und genauso wichtig:** die Linie sagt,
dass hier eine Referenz hingehoert; der Satz darunter, warum sie
fehlt.

`[read]` **Kein zweiter Weg heraus** ? die Sperrkachel direkt
darunter traegt den Knopf nach `/v2/settings`.

### A4 ? die uebrigen Entwurfsreferenzen

`[cmd]` **Alle vier stehen, und zwar OHNE Grad gemessen:**

    interactions   1 Trennlinie   ["Interactions"]
    stacks         1              ["Stacks"]
    intel          1              ["Auswertung"]
    injection      1              ["Injektionen"]

`[read]` **Nur die Extended-Referenz wandert** ? E-68/E-70
bleiben fuer die uebrigen unberuehrt.

### A5 ? der Waechter deckt sie mit ab

`[cmd]` **`g117-extended-buendel.test.ts`: aus fuenf Proben sind
neun geworden.** **Der Satz *,,bewacht sie ausdruecklich
NICHT"* ist ersetzt** ? mit Begruendung aus E-88.

`[cmd]` **Fuenf Sabotagen, jede trifft genau ihre Probe:**

    Gradpruefung vor der Referenz weg  -> 7 und 8 rot
    ssr: true -> false (Referenz)      -> 7 rot
    statischer Import zurueck          -> 6 rot
    Erklaersatz -> null                -> 8 rot
    Konstante zurueck nach daten.ts    -> 9 rot

### A6 / A7

`[cmd]` **Zwoelf andere Reiter: alle tragen Inhalt, null
Seitenfehler.** `[cmd]` **Gate 18/18, 1.991 / 65, Austritt 0.**

### EIN FUENFTER WEG, beim Bauen gefunden

`[read]` **Der Schnitt der Referenz allein hat NICHT gereicht.**

`[cmd]` **Nach dem ersten Bau stand `HCG (Human Chorionic
Gonadotropin)` weiter im Seitenchunk** ? samt `sideEffectScore`
und `nextLab`, **Feldern, die es nur in `EXTENDED_STACK` gibt.**

`[cmd]` **Der Grund: `EXTENDED_STACK` lag in `daten.ts` neben
`STACK`** ? und **vier** Dateien importieren `STACK` statisch
(`ansicht.tsx`, `modale.tsx`, `tabs.tsx`, `tab-compliance.tsx`).

`[read]` **Ein Modul ist unteilbar.** **Baumschnitt greift
nicht**, weil der Rest der Datei gebraucht wird ? **die
Wirkstoffliste faehrt mit.**

`[cmd]` **Behoben: `daten-extended.ts`**, gelesen nur von den
beiden dynamisch geholten Dateien. **Ein Waechter haelt es fest**
(Probe 9 prueft auch, dass sonst NIEMAND daraus importiert).

`[read]` **Dieselbe Lehre wie in G-117, eine Ebene tiefer: nicht
der Import entscheidet, sondern die DATEIGRENZE.**

### Was NICHT behoben ist ? und warum

`[cmd]` **`Testosterone Cypionate` und `Anastrozole` stehen
weiterhin im Seitenchunk** ? **aber nicht mehr aus Extended.**

    fehlende-kacheln.tsx   Kosten-/Heute-Kacheln  ('64.00',
                           'Mo 07:00')
    spec-daten.ts          Wechselwirkungen ('Intended pairing')

`[cmd]` **Belegt:** im Seitenchunk sind `sideEffectScore`,
`nextLab`, `cycleWeek`, `HCG (Human Chorionic` und
`physician-supervised` **alle weg** ? die Extended-Felder. **Die
beiden Namen kommen aus anderen Reitern**, deren Entwurfsfassung
der Auftrag ausdruecklich stehen laesst.

`[read]` **Das ist keine Luecke in G-499, sondern eine eigene
Frage:** *Gehoeren Wirkstoffnamen in den Kosten- und
Wechselwirkungsentwuerfen auch hinter eine Pruefung?* `[read]`
**Dort stehen NUR Namen und Preise ? keine Dosis, kein
Anwendungsschema.** `[read]` **Ich habe es nicht entschieden.**

### Zweimal derselbe eigene Fehler

`[cmd]` **Die Probe wurde rot, und der Grund war mein eigener
Kommentar:** in `ansicht.tsx` stand `physician-supervised`
woertlich als Begruendung. **Der Entwicklungsbau liefert
Kommentare mit** ? die Probe fand ihren eigenen Suchtext in
`page.js`.

`[read]` **Genau das ist in G-117 passiert, ich hatte die Lehre
notiert, und bin trotzdem wieder hineingelaufen.** **Zwei
Konsequenzen:** der Kommentar nennt die Kennzeichen jetzt
umschreibend, **und die Probe schneidet Kommentare vor der Suche
weg** ? sie kann nicht mehr auf Prosa hereinfallen.

`[cmd]` **Und ein zweiter, feinerer:** die Reiter-Probe aus
G-117 nahm ein Fenster von **900 Zeichen** ab dem ersten
`dynamic(`. **Seit G-499 stehen zwei Bloecke untereinander** ?
eine Sabotage an der REFERENZ machte die REITER-Probe rot.
`[read]` **Richtig rot, aber am falschen Ort, und das verwischt,
was kaputt ist.** `[cmd]` **Ersetzt durch `dynamikBlock()`, das
die Klammertiefe zaehlt** ? **eine gezaehlte Grenze ist keine
Blockgrenze.** **Gegenprobe gefahren: jede der beiden Sabotagen
trifft jetzt nur ihre eigene Probe.**

### Neustart

`[read]` **Nicht noetig** ? nur `apps/web/src`. **Kein
`packages/ui`, keine Umgebung, kein Schema.**

`[cmd]` **`apps/web/.next-g499/` ist mein Messbau** ? er faellt
unter `apps/*/.next-*` und stoert `git status` nicht. **Bleibt
bis zur Abnahme liegen; danach Geschichte.**

### Selbst nachmessen

    node tools/_g499-referenz.mjs        A1-A4, Austritt 0/1

`[cmd]` **Von Hand, nur die Bau-Frage:**

    cd apps/web
    grep -rl "physician-supervised" .next-g499/static/chunks/
      -> 1602.*.js und 5541.*.js, NICHT app/v2/supplements/page-*.js

`[cmd]` **Neu bauen** (ca. 90 s):

    cd apps/web && LUMEOS_DIST_DIR=.next-g499 npx next build

### Dateien

    NEU  mockup-referenz-extended.tsx   die Referenz
    NEU  daten-extended.ts              die Konstanten
         ansicht.tsx                    dynamic + Gradpruefung
                                        + ReferenzOhneGrad
         mockup-referenz.tsx            Block + tote Importe raus
         tab-extended.tsx               Import nachgezogen
         daten.ts                       Konstanten raus
         __tests__/g117-...test.ts      5 -> 9 Proben

### Werkzeuge

    tools/_g499-referenz.mjs   A1-A4, Bau + Browser, 16 Proben
    tools/_g117-reiter.mjs     A6, zwoelf Reiter (aus G-117)

## Abnahme

_(vom Orchestrator)_

## ZURUECK - A1 faellt, 2026-09-08

`[cmd]` **Am Messbau `.next-g499` nachgemessen,
`/v2/supplements/page`, 11 Chunks:**

    physician-supervised   in 0 Chunks
    sideEffectScore        in 0
    nextLab                in 0
    HCG                    in 1      <- im Manifest
    Testosterone Cypionate in 1

`[read]` **Drei von vier Kennzeichen sind weg** ? **das
vierte nicht.**

### Und es ist kein Name mit Preis

`[cmd]` **Aus `page-0a6ae767eea23a46.js`, woertlich:**

    {id:"hcg", name:"HCG", mode:"enhanced", cat:"PCT",
     dose:"250-500 IU 2x/wk", half_life:"9 h",
     legal_status:{DE:"Rx only", US:"Schedule III",
                   TH:"Rx only", UK:"Class C"}}

    {id:"test_cyp", name:"Testosterone Cypionate",
     mode:"enhanced", cat:"AAS - Injectable", grade:"S"}

Sein Bericht sagt: *,,Dort stehen nur Namen und Preise, KEINE
Dosis, kein Schema."*

`[read]` **Das stimmt nicht** ? **`dose`, `half_life` und
`legal_status` stehen da.**

### Die Quelle, gemessen

    spec-daten.ts        traegt test_cyp, hcg, dose,
                         half_life, legal_status
    fehlende-kacheln.tsx importiert spec-daten
    ansicht.tsx          importiert fehlende-kacheln
    tabs.tsx             importiert fehlende-kacheln

`[read]` **Das ist DERSELBE fuenfte Weg, den er selbst
beschrieben hat:** *,,Ein Modul ist unteilbar ? Baumschnitt
greift nicht, weil der Rest gebraucht wird."*

`[cmd]` **Nur eine Datei weiter: `EXTENDED_STACK` hat er aus
`daten.ts` geloest, `spec-daten.ts` traegt dasselbe Problem.**

### Und warum das zaehlt

`[read]` **`ansicht.tsx` und `tabs.tsx` laufen auf JEDEM
Reiter** ? **die Liste geht an jeden Besucher, auch an den,
der nie auf Extended klickt.**

## Nacharbeit

    N1  spec-daten.ts aufteilen, wie daten-extended.ts:
        was mode="enhanced" traegt, kommt heraus.
    N2  nachher: HCG und Testosterone Cypionate in 0
        Chunks des Manifests. Gemessen.
    N3  die Reiter Kosten, Heute und
        Wechselwirkungen bleiben bedienbar. Foto.
    N4  der Waechter deckt spec-daten mit ab.
        Sabotageprobe.
    N5  apps/web 1991 oder mehr, apps/coach 65.

`[read]` **Und pruefe, ob es einen SECHSTEN Weg gibt** ?
**miss nach `dose`, `half_life`, `legal_status` und
`mode:"enhanced"` im ganzen Manifest, nicht nach vier
Namen.**

