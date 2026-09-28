---
nr: G-517
typ: fehler
modul: quer
schwere: mittel
angelegt: 2026-09-27
braucht: []
kind_von: null
entscheidung: null
agent: claudecode
beauftragt: 2026-09-27
erledigt: 2026-09-27
commit: 37a0eb15
beruehrt:
  dateien:
    - tools/schuss.mjs
zahlen:
  gemessen: 2026-09-27
---

# G-517 - die Probe meldet die Zeitueberschreitung, nicht die Ursache

## Was passiert ist

`[cmd]` **2026-09-27: Tom meldete *,,ich hab ueberall 404"*.
`schuss.mjs` sagte dazu:**

    page.waitForURL: Timeout 60000ms exceeded.
    waiting for navigation until "load"

`[read]` **Das sagt, dass etwas nicht geschah ? nicht,
warum.**

`[cmd]` **Die Ursache, mit einer eigenen Probe gefunden:**

    404  /_next/static/chunks/main-app.js
    404  /_next/static/chunks/app-pages-internals.js
    404  /_next/static/chunks/app/login/page.js
    404  /_next/static/css/app/login/page.css

`[read]` **Das HTML kam, KEIN JavaScript lud. Der Anmeldeknopf
tat nichts, weil kein Code hinter ihm war.**

`[cmd]` **Behoben durch Neustart beider `next dev`-Prozesse,
`.next` unangetastet ? die Projektregel sagt genau das.**

## Warum es ein Punkt ist

`[read]` **Claude Code hat den Schirmnachweis ZWEIMAL
aufgeschoben (G-510, G-513), weil die Probe nur
*ERR_CONNECTION_REFUSED* sagte.**

`[cmd]` **Und der Orchestrator hat daraufhin G-474 verdaechtigt
(der alte Chromium) ? falsch.**

`[read]` **Eine Probe, die die Ursache verschweigt, kostet
zwei Laeufe und eine falsche Faehrte.**

## Zu bauen

`[read]` **`schuss.mjs` zaehlt Konsolenfehler bereits ? es
meldet sie nur nicht, wenn es VORHER abbricht.**

    1  bei einer Zeitueberschreitung: die gesammelten
       404er und Konsolenfehler ausgeben, bevor
       geworfen wird
    2  der Sonderfall "kein JS geladen" beim Namen
       genannt -- er hat eine bekannte Ursache und
       eine bekannte Behebung
    3  die Behebung im Text: beenden, starten,
       .next bleibt

## Abnahmebedingungen

    A1  bei einer Zeitueberschreitung stehen die 404er
        im Bericht. Gegenprobe erzwungen.
    A2  "kein JS geladen" wird beim Namen genannt.
    A3  die Behebung steht dabei.
    A4  ein normaler Lauf bleibt unveraendert kurz.
    A5  Sabotageprobe: ein kuenstlicher 404 wird
        gemeldet.

## Bericht

**Claude Code, 2026-09-27.**

### Die Ursache im Werkzeug

`[cmd]` **Der `try`-Block hatte ein `finally`, aber KEIN `catch`**
(`schuss.mjs:243` alte Zaehlung). `[read]` **Die Ausnahme verliess
das Werkzeug mit Playwrights blosser Meldung — waehrend `fehler[]`
gefuellt danebenlag.**

`[cmd]` **Und 404er wurden ueberhaupt nicht gesammelt:** der
`requestfinished`-Beobachter faengt nur GELUNGENE Anfragen, und
`sammler` ist waehrend der Anmeldung `null`. `[read]` **Genau
dort, wo Toms Fehler auftrat, sah das Werkzeug nichts.**

### Was gebaut wurde

    seite.on('response')      Status >= 400 mitschreiben
    seite.on('requestfailed') Anfragen ohne Antwort
    keinJsGeladen()           der Sonderfall, am Muster
                              /_next/static/*.{js,css} erkannt
    befund()                  was im Abbruchbericht steht
    catch (e)                 die fehlende Haelfte

`[cmd]` **Der Bericht geht auf `stderr` als Klartext UND auf
`stdout` als JSON** — `[read]` **die Meldung darf nicht in
`stdout`, sonst zerbricht sie jeden Aufrufer, der die Ausgabe
einliest.**

### Die Abnahmebedingungen

**A1 — bei einer Zeitueberschreitung stehen die Fehler im
Bericht.** `[cmd]` **Erzwungen mit einem Selektor, den es nicht
gibt:**

    locator.click: Timeout 15000ms exceeded.
    1 Konsolenfehler, die ersten:
      Warning: Extra attributes from the server: data-mode

**A2 — „kein JS geladen" wird beim Namen genannt.** `[cmd]`
**Belegt in der Gegenprobe:**

    KEIN JAVASCRIPT GELADEN
    Das HTML kam, die Buendel unter /_next/static/ fehlen. Die
    Seite steht da und tut nichts — kein Knopf wirkt, und jede
    Route sieht aus, als fehle sie. Das ist KEIN Fehler der
    Anwendung.

**A3 — die Behebung steht dabei.**

    BEHEBUNG: Beide `next dev` beenden und neu starten. `.next`
    NICHT loeschen (Projektregel). Der laufende Prozess fordert
    uebersetzte Dateien an, die sein .next nicht hat.

**A4 — ein normaler Lauf bleibt unveraendert kurz.** `[cmd]`
**Gemessen, zweimal (vor und nach allen Aenderungen):**

    Schluessel  attrappen, breite, fehler, konsolenfehler,
                modus, pfad, titel, zeit, ziel
    Zeilen      32
    kein ok / abbruch / kaputt / diagnose

`[read]` **Der volle Fehlertext bleibt im normalen Lauf
erhalten** — **gekuerzt wird nur im Abbruchbericht**, wo dreissig
`at …`-Zeilen genau das verdecken, wofuer er da ist.

**A5 — ein kuenstlicher 404 wird gemeldet.** `[cmd]` **Durch das
ECHTE Werkzeug, `LUMEOS_SABOTAGE_404=1`:**

    page.waitForURL: Timeout 60000ms exceeded.
    KEIN JAVASCRIPT GELADEN
    Betroffen:
      404  /_next/static/chunks/app-pages-internals.js
      404  /_next/static/chunks/app/login/page.js
      404  /_next/static/chunks/app/layout.js
      (+ je eine „fehlgeschlagen"-Zeile)
    6 Konsolenfehler

`[read]` **Dieselben Dateien wie in Toms Vorfall** — die
Gegenprobe bildet ihn nach, ohne den Server anzufassen.

`[cmd]` **Die Sabotage haengt an einer UMGEBUNGSVARIABLEN, nicht
an einem Schalter** — `[read]` **ein `--sabotage` im Hilfetext
lockt dazu, ihn im Ernst zu benutzen.**

### Die Pruefung

`[cmd]` **`tools/__tests__/g517-schuss-meldet-die-ursache.test.mjs`
— 8 Zusicherungen, alle gruen.**

`[cmd]` **Sabotageprobe, vier Eingriffe, jeder von seiner eigenen
Zusicherung gefangen:**

    catch entfernt           -> 2 und 6   ROT
    response-Beobachter weg  -> 3         ROT
    Diagnosename weg         -> 4         ROT
    .next-Regel weg          -> 5         ROT
    alles zurueck            -> 8 von 8   GRUEN

`[cmd]` **Ein fuenfter Versuch kam gar nicht an** — der
Suchtext ging ueber einen Zeilenumbruch. `[read]` **Die
`assert`-Zeile hat die Nulloperation abgewiesen, statt eine
gruene Probe als Beleg zu nehmen.**

### Ein Befund daneben

`[cmd]` **`tools/__tests__/` laeuft NIRGENDS** — weder im Gate
(`package.json:10` nennt es nicht) noch ueber `turbo run test`
(`tools/` ist kein Paket). `[cmd]` **Die zwei vorhandenen
Waechter dort** (`backup-manifest`, `kettenlauf-status-pruefen`)
**laufen ebenso nicht.**

`[read]` **Das ist die Gewohnheit des Ordners** — sie werden von
Hand gerufen und aus der Punktdatei verlinkt (so
`nutrition-c-0400`). `[read]` **Ich habe das Gate NICHT
erweitert** — drei Waechter in den Gatelauf zu heben ist eine
Entscheidung ueber die Laufzeit des Gates, nicht Teil dieses
Auftrags.

`[cmd]` **Der Befehl steht hier, damit er auffindbar ist:**

    node --test tools/__tests__/g517-schuss-meldet-die-ursache.test.mjs

`[read]` **Wenn das ein eigener Punkt werden soll: drei
Waechter, eine Zeile im Gate.**

### Gelaufen

    pnpm gate               18 von 18     GRUEN
    node --test (Waechter)  8 von 8       GRUEN
    normaler schuss-Lauf    32 Zeilen, Schluessel unveraendert

## Abnahme


**Abgenommen am 2026-09-27, Commit `37a0eb15`.**

`[cmd]` **Selbst nachgemessen, nicht dem Bericht geglaubt:**
`tools/schuss.mjs:339` traegt jetzt `catch (e)` am aeusseren Block —
die Ausnahme verlaesst das Werkzeug nicht mehr. Und die 404er werden
an zwei Stellen gesammelt: `:119` ueber `a.status() >= 400`, `:123`
ueber `requestfailed`. Beides war der Befund, beides ist zu.

`[read]` **Offen und mitgenommen:** `tools/__tests__/` laeuft
nirgends — nicht im Gate, nicht ueber `turbo test`, weil `tools/`
kein Paket ist. Dort liegen inzwischen vier Waechter, darunter die
beiden, die genau das Werkzeug schuetzen, das den Dev-Server
schuetzt. **Das ist Toms Entscheidung ueber die Gate-Laufzeit und
steht seit vier Berichten aus.**
