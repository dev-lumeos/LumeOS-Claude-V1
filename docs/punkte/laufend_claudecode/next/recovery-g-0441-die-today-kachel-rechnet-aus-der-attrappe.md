---
nr: G-441
typ: fehler
modul: recovery
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: G-440
entscheidung: null
beruehrt:
  dateien:
    - apps/web/src/app/v2/recovery/ansicht.tsx
zahlen:
  gemessen: 2026-09-08
---

# G-441 — die Today-Kachel rechnet weiter aus der Attrappe

## Befund

`[cmd]` **G-440 hat die Muscle-map-Kachel umgestellt** ? **die
Today-Kachel nicht.**

`[cmd]` **`ansicht.tsx:354`:**

    const recoveryValues = React.useMemo(() => {
      for (const slug of MUSCLE_GROUPS_BODYMAP) {
        const st = MUSCLE_STATE[slug]      <- die Attrappe
        ...

`[cmd]` **Und `:432` speist damit die `ErmuedungsKarte`** ? **im
Reiter `Today`, Kopfzeile *,,18 groups - click for the
calculation"*.**

`[read]` **Zwei Kacheln, dieselbe Karte, zwei Quellen.**

## Und eine tote Funktion

`[cmd]` **`ansicht.tsx:519`, `muskelwerte()`** ? **KEIN
Aufrufer.**

`[cmd]` **Ihr Kommentar sagt:** *,,Die Muskelwerte, wie Today und
Muscle map sie berechnen."*

`[read]` **Das stimmt nicht mehr** ? **Muscle map rechnet anders,
Today ruft sie nicht.**

`[cmd]` **Dritter Fall dieser Art** (G-422): **ein fertiges
Bauteil ohne Aufrufer.**

## Was zu tun ist

`[read]` **Die Today-Kachel liest dieselbe Quelle wie Muscle
map.**

`[cmd]` **G-440 hat den Rechenweg gebaut** ? **er wird
gerufen, nicht nachgebaut.**

`[read]` **Und `muskelwerte()` faellt weg oder bekommt einen
Aufrufer** ? **gemessen entscheiden.**

## Und die Kopfzeile

`[cmd]` **`18 groups`** ? **die Zahl kommt aus
`MUSCLE_GROUPS_BODYMAP`.**

`[cmd]` **Die Karte hat 43 Flaechen** (G-434), **die Hierarchie
105 Namen.**

`[read]` **Miss, was die Zahl sagen soll.**

## Was NICHT zu tun ist

`[read]` **`MUSCLE_STATE` nicht loeschen** ? **G-440 hat sie
stehen lassen, nur nicht mehr gelesen.**

`[read]` **Erst wenn NIEMAND sie liest, kann sie weg** ? **das
ist dieser Punkt.**

## Nachweiszeilen - Orchestrator, 2026-09-29

`[read]` **Dieser Punkt hatte keine numerierten Nachweiszeilen.** Hier
sind sie, aus dem Befund oben abgeleitet und um eine ergaenzt, die beim
Quellenabgleich aufgefallen ist.

**A1** — **Die Today-Kachel ruft den Rechenweg aus G-440**, sie baut ihn
nicht nach. `[cmd]` **`ansicht.tsx:354` liest heute `MUSCLE_STATE`** und
speist damit bei `:432` die `ErmuedungsKarte` im Reiter `Today`.
**Zwei Kacheln, dieselbe Karte, zwei Quellen** — danach eine.

**A2** — **`muskelwerte()` bei `ansicht.tsx:519` hat keinen Aufrufer.**
Gemessen entscheiden: **Aufrufer bekommen oder weg.** `[cmd]` **Dritter
Fall dieser Art** (G-422: ein fertiges Bauteil ohne Aufrufer). **Ihr
Kommentar behauptet, Today und Muscle map rechneten mit ihr** — das
stimmt nicht mehr, und ein Kommentar, der eine falsche Architektur
behauptet, ist schlimmer als keiner.

**A3** — **`MUSCLE_STATE` faellt erst, wenn NIEMAND sie liest.**
`[read]` G-440 hat sie stehen lassen und nur nicht mehr gelesen; **dieser
Punkt ist der, an dem das entschieden wird.** Miss die Leser, dann
entscheide — und wenn sie bleibt, steht ein Satz dabei, warum.

**A4** — **Die Kopfzeile ,,18 groups" ist zu messen, nicht zu
uebernehmen.** `[cmd]` Die Zahl kommt aus `MUSCLE_GROUPS_BODYMAP`; **die
Karte hat 43 Flaechen** (G-434), **die Hierarchie 105 Namen**. Drei
Zahlen fuer eine Aussage. **Miss, was die Zahl sagen SOLL**, und wenn
drei verschiedene Zahlen drei verschiedene Dinge sind, sagt die Kopfzeile
welches.

**A5 (neu, aus dem Quellenabgleich)** — **recovery ist gerade das Modul,
das an die Beitragstabelle gehaengt wird.**

`[cmd]` **G-522 A1 hat gemessen:** `recovery.scores.score` liegt als
einzige echte Tagesscore-Quelle vor — 370 Zeilen, 3 Nutzer, alle
gefuellt, dazu sieben Teilscores. `[cmd]` **Codex baut daraus in G-514
`goals.goal_contributions`.**

`[read]` **Miss, ob die Muskelwerte dieser Kachel und
`recovery.scores` dieselbe Wahrheit sind.** Wenn die Kachel im Browser
rechnet und die Beitragstabelle aus SQL liest, entstehen **zwei
Bauarten fuer dieselbe Aussage ohne Vertrag dazwischen** — genau der
Befund, den G-522 fuer nutrition gegen recovery schon erhoben hat.

`[cmd]` **Der Vertrag dafuer ist gebaut und abgenommen:**
`packages/scoring/src/beitrag.ts` (`dc55728a`, 36/36 gruen). **Wenn es
eine Abweichung gibt, wird sie GEMELDET, nicht stillschweigend
angeglichen** — welche Seite recht hat, ist eine Messung, nicht eine
Geschmacksfrage.

**A6** — **Nur `recovery` anfassen.** Vier andere Module zeichengleich
vorher/nachher, Testlaeufe gruen, Sabotageprobe je Waechter in beide
Richtungen. Nachweise auf `test-user@lumeos.local`. `[cmd]`
**`recovery.scores` reicht bis 2026-11-06 — 78 von 370 Zeilen liegen in
der Zukunft.** Wer ohne Filter mittelt, mittelt Zukunft ein.

---

## Vorbereiteter Auftrag - Claude Code, geschrieben 2026-09-29, 08:50

**Noch nicht raus.** Geht raus, wenn G-520 zurueck ist.

    Bereich: apps/web/src/app/v2/recovery/
    Fremd:   apps/web/src/app/v2/goals/ (dein laufender Auftrag G-520) ·
             supabase/ (Codex baut dort G-514) · docs/ (Orchestrator)

**Der Auftrag sind A1 bis A6 oben.** A5 ist der Grund, warum dieser
Punkt jetzt kommt und nicht spaeter: waehrend Codex recovery an die
Beitragstabelle haengt, ist der beste Zeitpunkt zu messen, ob die
Oberflaeche dieselbe Zahl zeigt.

Nichts committen, nichts pushen.
