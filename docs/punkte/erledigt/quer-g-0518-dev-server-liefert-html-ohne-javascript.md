---
nr: G-518
typ: fehler
modul: quer
schwere: hoch
angelegt: 2026-09-27

braucht: []
kind_von: null
entscheidung: null

agent: claudecode
beauftragt: 2026-09-27
erledigt: 2026-09-27
commit: a6aa15ad

beruehrt:
  dateien:
    - apps/web/next.config.js
    - apps/coach/next.config.js
    - apps/admin/next.config.js
    - tools/dist-dir-sperre.js
    - tools/next-zustand.mjs

zahlen:
  gemessen: 2026-09-27
  next_prozesse: 6
  anwendungen: 3
  bau_chunks_im_dev_verzeichnis: 22
  dev_buendel_daneben: 4
---

# G-518 - der Dev-Server liefert HTML ohne JavaScript

## Der Befund in einem Satz (A4)

`[cmd]` **Ein `next build` OHNE `LUMEOS_DIST_DIR` schreibt nach
`apps/web/.next` — in das Verzeichnis, aus dem der laufende
Dev-Server ausliefert.**

**Die Zeile, die es belegt:**

    apps/web/.next/BUILD_ID        9Gr-DMlsJLyVv6vA_Zhks
    apps/web/.next-gate/BUILD_ID   M191AWaoOQ5UC1-_xp4al

`[read]` **Zwei verschiedene Kennungen heisst: zwei getrennte
Baulaeufe.** `[cmd]` **Der Gate-Bau ging RICHTIG nach
`.next-gate`** — **der zweite kam von einem direkten
`npx next build`, und der traf `.next`.**

`[read]` **Der Verursacher war ich selbst:** am 2026-09-26 habe
ich in G-512 und G-513 dreimal `npx next build` aus `apps/web`
gerufen, um den Produktionsbau zu pruefen. **Der Befehl umgeht
`scripts/gate-build.js`.**

## Warum es zweimal nicht gefunden wurde

`[read]` **Der Dev-Server repariert sich selbst.** `[cmd]`
**Gemessen: die Manifeste tragen 11:51:40** — **der Bau hatte sie
um 10:36 ueberschrieben, beim naechsten Uebersetzen hat der
Dev-Server sie neu geschrieben.**

`[read]` **Ein Neustart zeigt Gruen und loescht den Beweis.**
`[read]` **Genau deshalb sah es am 08.09. wie behoben aus und war
am 27.09. wieder da.**

## A1 - der rote Zustand

`[read]` **NICHT AUFTRETEND zum Messzeitpunkt.** `[cmd]` **Alle
acht Adressen, die das HTML anfordert, liefern 200:**

    Adresse                              HTTP  Datei  Manifest
    app-pages-internals.js               200   ja     ja
    app/layout.js                        200   ja     ja
    app/login/page.js                    200   ja     ja
    main-app.js                          200   ja     ja
    polyfills.js                         200   ja     ja
    webpack.js                           200   ja     ja
    css/app/layout.css                   200   ja     ja
    css/app/login/page.css               200   ja     ja

`[read]` **Der Auftrag sagt: nicht erzwingen, nicht raten.**
**Also nicht erzwungen.**

`[cmd]` **Die SPUR des Vorfalls lag aber noch da** — und sie
traegt den ganzen Befund:

    apps/web/.next/static/chunks/
      10:23:24  polyfills.js               Dev
      10:23:38  main-app.js                Dev
      10:23:38  app-pages-internals.js     Dev
      11:51:40  webpack.js                 Dev
      10:36:40 – 10:42:39   22 gehashte Bau-Chunks

`[read]` **Zwei Generationen in einem Verzeichnis.** `[cmd]` **Die
Manifeste gehoeren nur EINER davon** — **die andere wird 404.**
**Das ist der Zustand, den Tom gesehen hat.**

`[cmd]` **Und `apps/coach/.next` zeigt dieselbe Uhrzeit von der
anderen Seite:** **alle 516 Dateien in der Minute 10:36
geschrieben, null Bau-Chunks uebrig** — **dort wurde das
Verzeichnis ABGERAEUMT und neu gefuellt.**

## A2 - wieviele Prozesse laufen

`[cmd]` **Sechs, und sie bilden drei saubere Paare:**

    PID       gestartet          was
    1128308   27.09. 10:23:16    next dev -p 3200   (web)
    1288484   27.09. 10:23:17      -> start-server, Port 3200
    1262264   27.09. 10:23:17    next dev -p 3220   (coach)
    1293952   27.09. 10:23:17      -> start-server, Port 3220
    117736    14.08. 08:32:30    next dev -p 3210   (admin)
    653096    01.09. 11:12:30      -> start-server, Port 3210

`[cmd]` **Ueber `ParentProcessId` geprueft: 653096 haengt an
117736** — **kein Waisenprozess.** `[read]` **Der Abstand von
18 Tagen heisst nur, dass der Admin-Server seinen Arbeiter am
01.09. neu gestartet hat.**

`[read]` **KEIN zweiter Server auf demselben `.next`** — **der
erste Verdaechtige des Auftrags ist widerlegt.**

`[cmd]` **Und `apps/admin/.next` ist sauber** — der Prozess vom
14.08. hat nichts damit zu tun.

## A3 - schreibt ausser dem Dev-Server jemand in .next

`[cmd]` **JA — und das ist die Ursache.**

    apps/web/.next        BUILD_ID, prerender-manifest.json,
                          routes-manifest.json, export-marker.json,
                          required-server-files.json
                          alle 10:36:39/40
    apps/coach/.next      516 Dateien, alle in der Minute 10:36
    apps/web/.next-gate   BUILD_ID 10:36:40
    apps/coach/.next-gate BUILD_ID 10:36:39

`[read]` **Die fuenf genannten Dateien erzeugt ein `next dev`
NICHT** — **nur ein Produktionsbau.** `[read]` **Liegen sie in
`.next`, war dort ein Bau.**

`[cmd]` **Die `LUMEOS_DIST_DIR`-Trennung selbst ist DICHT:** das
Gate ruft `scripts/gate-build.js`, das setzt die Variable, und
`.next-gate` hat die Artefakte bekommen. `[read]` **Undicht ist
nicht die Trennung, sondern ihre Umgehbarkeit** — **sie war ein
ANGEBOT, keine Regel.**

`[cmd]` **B-18 hat das 2026-08-06 schon einmal behoben** und den
Mechanismus in `apps/web/next.config.js:4-9` beschrieben: *,,Der
Build raeumt `.next` beim Start ab und schreibt es neu, waehrend
der laufende Dev-Server dieselben Dateien fortschreibt."*
`[read]` **Die Beschreibung stimmt bis heute — nur die
Durchsetzung fehlte.**

## A5 - die Behebung, die den Zustand unmoeglich macht

`[cmd]` **`tools/dist-dir-sperre.js`, gerufen aus allen drei
`next.config.js`:**

    baut  = NODE_ENV === 'production' && argv enthaelt 'build'
    ohne LUMEOS_DIST_DIR  ->  Abbruch mit Anleitung

`[read]` **Sie greift an A4 an:** **der Bau kann `.next` gar
nicht mehr treffen, ausser jemand setzt die Variable bewusst
darauf.**

`[read]` **Kein Neustart, kein Aufraeum-Automatismus.** `[cmd]`
**`.next` wurde nicht angefasst** — **es hat sich waehrend der
Messung selbst bereinigt, als der Dev-Server neu uebersetzte.**

`[read]` **Eine Stelle fuer drei Anwendungen** — drei Kopien
waeren drei Stellen, an denen die Regel altern kann.

**Die Meldung nennt den Ausweg:**

    [G-518] `next build` wuerde in apps/web/.next schreiben — in
    das Verzeichnis, aus dem der Dev-Server ausliefert.
    Statt dessen:  pnpm --filter @lumeos/web build
    Oder bewusst:  LUMEOS_DIST_DIR=.next-gate next build
    Zustand pruefen:  node tools/next-zustand.mjs

## A6 - Sabotageprobe

`[cmd]` **Die Sperre selbst, je Anwendung:**

    npx next build in apps/web     ABGEWIESEN
    npx next build in apps/coach   ABGEWIESEN
    npx next build in apps/admin   ABGEWIESEN
    pnpm --filter @lumeos/web build  laeuft durch
      -> .next-gate/BUILD_ID  BTRMv0jhLN32zItCDV8WL

`[cmd]` **Der Waechter, vier Eingriffe, jeder von seiner eigenen
Zusicherung gefangen:**

    coach ruft die Sperre nicht  ->  3    ROT
    NODE_ENV-Pruefung weg        ->  5    ROT
    LUMEOS_DIST_DIR ignoriert    ->  6    ROT
    rmSync im Werkzeug           -> 12    ROT
    alles zurueck                -> 12/12 GRUEN

`[cmd]` **Rueckbau byteidentisch** (`cmp` gegen die Sicherung,
drei Dateien).

## A7 - das Werkzeug

`[cmd]` **`tools/next-zustand.mjs`** — benennt den Zustand in
Klartext, mit Behebung.

    node tools/next-zustand.mjs          alle drei
    node tools/next-zustand.mjs web      eine
    node tools/next-zustand.mjs --json   fuer Werkzeuge

**Drei Befunde, jeder mit eigenem Namen:**

    BUILD_IN_DEV_VERZEICHNIS   Bauartefakte in .next,
                               beide BUILD_ID genannt
    DEV_BUENDEL_FEHLEN         main-app.js & Co. sind weg
    ZWEI_GENERATIONEN          gehashte Chunks neben Dev-Buendeln

`[cmd]` **Am vergifteten Zustand belegt** (vor der Selbstheilung):

    web    :3200  apps\web\.next  ->  VERGIFTET
      [BUILD_IN_DEV_VERZEICHNIS]
        build_id:       9Gr-DMlsJLyVv6vA_Zhks
        build_id_gate:  M191AWaoOQ5UC1-_xp4al
      [ZWEI_GENERATIONEN]
        22 gehashte Bau-Chunks neben 4 Dev-Buendeln
    coach  :3220  sauber
    admin  :3210  sauber

`[read]` **Es startet nichts, beendet nichts, loescht nichts** —
**eine Zusicherung prueft das** (`rmSync`, `unlinkSync`, `spawn`,
`exec`, `kill` kommen im Quelltext nicht vor).

`[cmd]` **Rueckgabe 1 bei vergiftet, 0 bei sauber** — damit laesst
es sich in eine Kette haengen.

`[read]` **Ergaenzend zu G-517:** `schuss.mjs` meldet den Zustand,
wenn eine Probe darueber stolpert; **dieses Werkzeug beantwortet
die Frage auf Zuruf, ohne Browser und ohne Server.**

## A8 - Abgrenzung

`[cmd]` **Angefasst:** drei `next.config.js` (je drei Zeilen),
zwei neue Dateien in `tools/`, ein Waechter.

`[cmd]` **`pnpm gate` 18 von 18 GRUEN** mit der Sperre.

`[cmd]` **Nichts in `supabase/`** — die Aenderungen dort sind
Codex' C-544/C-546/C-551 und G-511.

`[cmd]` **Beide Server liefern:** 3200 und 3220, `/login` 200 und
`main-app.js` 200.

`[cmd]` **Nicht committet.**

## Nacharbeit, 2026-09-27 — N1 bis N4

`[read]` **Zwei Loecher, beide im Waechter. Der Befund traegt, die
Behebung sass richtig.**

### N1 — die Sperre prueft jetzt den WERT

`[cmd]` **Die erste Fassung fragte `if (process.env.LUMEOS_DIST_DIR)
return`** — **Anwesenheit, nicht Wert.** `[read]` **Damit ging
`LUMEOS_DIST_DIR=.next next build` durch und richtete genau den
Schaden an, gegen den die Sperre steht.**

`[cmd]` **Jetzt wird der normalisierte letzte Abschnitt
verglichen** — **fuenf Schreibweisen gemessen, alle abgewiesen:**

    .next          ABGEWIESEN
    ./.next        ABGEWIESEN
    .next/         ABGEWIESEN
    apps/web/.next ABGEWIESEN
    .\.next        ABGEWIESEN
    .next-gate     laesst durch

`[cmd]` **Am echten Befehl belegt:**

    LUMEOS_DIST_DIR=.next      npx next build  -> [G-518] Abbruch
    LUMEOS_DIST_DIR=.next-gate npx next build  -> 0 Treffer

`[cmd]` **Die Meldung nennt den gesetzten Wert** — sonst sucht der
Leser, warum die Sperre trotz gesetzter Variable kam.

### N2/N3 — der Waechter fuehrt die Funktion jetzt AUS

`[read]` **Zwoelf von zwoelf Zusicherungen waren `assert.match`
auf den Quelltext; `pruefeDistDir` wurde nie gerufen.** `[cmd]`
**Die vier Sabotagen bewiesen damit nur, dass ein Textabgleich
Text trifft — die Klasse aus G-216.**

`[cmd]` **Jetzt mit gefaelschtem `process.argv`/`process.env`,
vier Faelle plus zwei:**

    FALL 1  Bau ohne Variable          assert.throws
    FALL 2  Bau nach .next-gate        assert.doesNotThrow
    FALL 3  Bau nach .next (N1)        assert.throws   x5
    FALL 4  next dev                   assert.doesNotThrow
            next start                 assert.doesNotThrow
            Meldung nennt Wert + App   assert.throws mit Pruefung

`[cmd]` **20 von 20 gruen.**

`[cmd]` **DIE PROBE, die N2/N3 belegt: die ALTE Fassung wieder
eingebaut** (`if (!baut || process.env.LUMEOS_DIST_DIR) return`):

    6 Zusicherungen ROT   (FALL 3 fuenfmal + die Meldung)
    zurueckgebaut         20 von 20 GRUEN

`[read]` **Der alte Waechter blieb bei genau dieser Aenderung
gruen.** **Das ist der Unterschied zwischen Text lesen und
Verhalten messen.**

### N4 — die Ursachenkette HERGESTELLT, nicht erschlossen

`[cmd]` **Kopie von `apps/web/.next` nach
`tools/_g518-probe/.next-probe`, dann `LUMEOS_DIST_DIR` auf die
Kopie und gebaut.** `[read]` **Toms Verzeichnisse unberuehrt, kein
Server angefasst.**

**VORHER (die Kopie, ein Dev-Zustand):**

    static/chunks/  main-app.js, app-pages-internals.js,
                    webpack.js, polyfills.js
    build-manifest.json nennt main-app.js:  ja

**NACHHER (derselbe Ordner, nach dem Bau):**

    angefordert von der Dev-Seite:  4
    davon fehlend:                  4

    main-app.js              FEHLT  -> 404
    app-pages-internals.js   FEHLT  -> 404
    webpack.js               FEHLT  -> 404
    polyfills.js             FEHLT  -> 404

    statt dessen da:         55 Dateien, davon 55 gehasht
    build-manifest nennt main-app.js:             False
    build-manifest nennt app-pages-internals.js:  False

`[read]` **Das ist Toms Meldung, Zeile fuer Zeile:** *,,404 auf
main-app.js, app-pages-internals.js"* — **hergestellt, nicht
erschlossen.**

`[cmd]` **Waehrend und nach der Probe:** `apps/web/.next` trug
weiterhin seine vier Dev-Buendel, und 3200 lieferte alle vier mit
200 aus.

`[read]` **Damit faellt *Indizienbeweis* weg.** **Die Kette
Bau -> fehlende Buendel -> 404 ist gemessen.**

### Eine Falschmeldung des eigenen Werkzeugs — gefunden und behoben

`[cmd]` **Bei der Schlusspruefung meldete `next-zustand.mjs`
`admin :3210 VERGIFTET`** mit `DEV_BUENDEL_FEHLEN` fuer
`main-app.js`, `app-pages-internals.js` und `webpack.js`.

`[cmd]` **Gegengemessen am HTTP: alle drei lieferten 200.**
`[cmd]` **Zweiter Aufruf, Sekunden spaeter: sauber.**

`[read]` **Die Ursache: der Dev-Server schreibt die Buendel beim
Uebersetzen neu, und fuer Sekundenbruchteile sind sie weg.** **Ein
einzelner Blick sieht einen Zwischenstand und nennt ihn einen
Befund.**

`[cmd]` **Behoben: zweimal nachsehen mit 700 ms Abstand, nur was
BEIDE Male fehlt, gilt.** `[read]` **Dieselbe Klasse wie *,,Marke
kann Zwischenstand sein"*** — **ich haette es Tom beinahe als
roten Zustand gemeldet.**

`[read]` **Der Befund bleibt damit: web und coach sauber, admin
sauber.** `[cmd]` **Ein echter roter Zustand ist waehrend dieses
Auftrags NICHT aufgetreten** — nur der hergestellte aus N4.

### Ein eigener Fehler bei der Nacharbeit

`[cmd]` **Das Probenverzeichnis lag unter `tools/_g518-probe/`** —
**git-ignoriert, aber `apps/web/tsconfig.json` erfasst es ueber
`"**/*.ts"`.** `[cmd]` **Folge: `tsc --noEmit` meldete 73 Fehler
(57 davon `TS2307` aus den Typdateien der Probe), und ein
Gate-Lauf fiel darauf.**

`[cmd]` **Nach dem Entfernen: 0 Fehler, exit 0.**

`[read]` **Ich habe die 73 Fehler beinahe als vorbestehenden
Befund gemeldet** — **erst die Frage *,,welche Datei denn?"* hat
gezeigt, dass es meine eigene Probe war.** `[read]` **Ein
Wegwerfverzeichnis gehoert in den Scratchpad, nicht unter
`tools/`.**

## Eine Sache, die offen bleibt

`[read]` **Der Vorfall vom 2026-09-08 ist nicht rueckwirkend
belegt** — **die Spur von damals ist weg.** `[cmd]` **Was belegt
ist: derselbe Mechanismus, dieselben vier Dateinamen, und ein
Neustart als vermeintliche Behebung.**

`[read]` **Ob es damals auch ein direkter `next build` war oder
etwas anderes mit derselben Wirkung, sage ich nicht** — **ich
kann es nicht messen.**

## Bericht

_(siehe oben — dieser Punkt IST der Bericht)_

## Abnahme


**Abgenommen am 2026-09-27, Commit `a6aa15ad`** — nach einer
Nacharbeit, die zwei Loecher geschlossen hat.

`[cmd]` **Drei der vier Punkte selbst nachgemessen:**

- **N1** — die Sperre normalisiert jetzt (Backslashes, abschliessende
  Schraegstriche, letzter Abschnitt gegen `.next`) und faengt damit
  alle Schreibweisen ueber die Form statt ueber eine Verbotsliste.
  Der leere Wert zaehlt korrekt als `.next`, `.next-gate` geht durch.
- **N2/N3** — der Waechter ruft `pruefeDistDir` tatsaechlich auf,
  sechs Zeilen mit `assert.throws` / `assert.doesNotThrow` gegen
  gefaelschtes `argv` und `env`. Vorher las er nur Text.
- **Die zwei Selbstbefunde stimmen:** `apps/web/tsconfig.json` ist
  byteidentisch (`git diff --stat` leer), `tools/_g518-probe/` ist
  weg, `git status` traegt keine Reste.

`[read]` **N4 konnte ich nicht nachpruefen** — die Kopie ist
geloescht, es bleibt ein Lauf mit seinen Zahlen. Aber es ist die
Reproduktion, die der Auftrag verlangt hat, und die vier fehlenden
Buendel decken sich mit Toms Meldung Zeile fuer Zeile.

`[read]` **Zwei Sachen bleiben stehen:** der Vorfall vom 2026-09-08
ist nicht rueckwirkend belegbar (die Spur ist weg, der Mechanismus
ist es), und `next-zustand.mjs` schaut zweimal mit 700 ms Abstand —
besser als einmal, aber es bleibt eine Uhr, und G-25 hat gezeigt,
dass feste Wartezeiten Falschbefunde erzeugen. Entschaerft, nicht
geloest.

`[read]` **Ein eigener Fehler beim Schliessen:** ich habe die Datei
zuerst nach `erledigt/` gezogen, bevor der Commit existierte — der
Punktewaechter fiel auf 27 statt 25 mit `Pflichtfeld fehlt: erledigt`
und `commit`. Zurueckgezogen, gemessen, und erst nach `a6aa15ad`
wieder bewegt. **Die Reihenfolge ist: committen, dann schliessen.**
