---
nr: G-473
typ: fehler
modul: quer
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: G-471
entscheidung: null
agent: claudecode
beauftragt: 2026-09-08
erledigt: 2026-09-08
commit: cbe4b928
beruehrt:
  dateien:
    - apps/web/src/components/shell/app-shell.tsx
zahlen:
  gemessen: 2026-09-08
---

# G-473 - der Absturzpunkt im unverkleinerten Code

## Stand aus G-471

`[cmd]` **Die Bedingung ist eine UND-Verknuepfung:**

    angemeldeter Reiter  UND  /v2  UND  Produktionsbau

`[cmd]` **A1: KEINE Ausnahme, 0 Konsolenzeilen, Speicher 10 MB
und flach, `Inspector.targetCrashed` nach 1,5 s.**

`[cmd]` **`/dashboard`, `/nutrition`, `/training` leben,
`/v2` toetet. Der Dev-Server besteht alle fuenf Ziele.**

`[cmd]` **Sieben Verdaechtige ausgeschlossen:** `navigator.locks`,
`ResizeObserver`, `requestAnimationFrame`, Canvas/WebGL,
Speichermangel, kopfloser Betrieb, G-470.

## Und eine Berichtigung zu G-470

> *,,*Der Produktionsbau ist anmeldefaehig* gilt nur auf
HTTP-Ebene. Der BROWSER kommt nicht an."*

`[read]` **Meine G-470-Abnahme war zu weit** ? **HTTP 200 und
ein lebender Reiter sind zwei Sachen.**

## Abnahmebedingungen

    A1  der Absturzpunkt, im unverkleinerten Code.
    A2  behoben, und der Reiter bleibt stehen.
    A3  eine angemeldete /v2-Route im Produktionsbau,
        im BROWSER geoeffnet. Foto.
    A4  ein Waechter, der es faengt. Sabotageprobe.
    A5  Gegenprobe: der Dev-Server bleibt unveraendert,
        3200 und 3220 laufen weiter.
    A6  vier Module unveraendert.
    A7  apps/web 1831 oder mehr, apps/coach 65.
    A8  NIE .next loeschen, nie next build direkt.
        Nur pnpm gate oder
        pnpm --filter @lumeos/web build.

## Bericht

**Claude Code, 2026-09-17.**

### Der Stand in einem Satz

`[cmd]` **Der Befund aus G-471 war FALSCH eingegrenzt** ? **es
liegt weder an der Anmeldung noch an `/v2`.** `[cmd]` **Der
Reiter stirbt im Produktionsbau bei der ZWEITEN Navigation, egal
wohin.** `[read]` **Die Ursache im Quelltext ist weiterhin nicht
gefunden ? A2 und A3 sind offen.**

### A1 ? der Absturzpunkt: eine Berichtigung statt einer Zeile

`[cmd]` **Gebaut mit Quellkarten** (`LUMEOS_SOURCEMAPS=1`, 66 s
statt 46 s, 18 Karten) ? **und der Absturz war damit trotzdem
nicht lesbar, weil es keinen Javascript-Fehler gibt.**

`[cmd]` **Was die Quellkarten stattdessen ermoeglicht haben, war
die saubere Eingrenzung. Gemessen, je in einem EIGENEN Reiter:**

    Route            1. Aufruf   2. Aufruf
    /login              200         TOT
    /dashboard          200         TOT
    /v2/dashboard       200         TOT

`[cmd]` **Dev-Server, fuenfmal dieselbe Route:**

    /dashboard  200 200 200 200 200

`[read]` **Der zweite Aufruf toetet ? und zwar JEDE Route.**
**Kein `/v2`, keine Sitzung, keine Huelle.**

#### Wie die falsche Eingrenzung zustande kam

`[cmd]` **G-471 hat gemessen:** *angemeldeter Reiter + `/v2` +
Produktionsbau*. `[read]` **Alle drei Merkmale waren echt ? aber
keines war die Ursache.**

`[read]` **Der Grund:** **die Anmeldeprobe navigiert selbst.**
Sie ruft `/login`, sendet das Formular, wartet ? **und der
darauffolgende Aufruf von `/v2` war schon der zweite oder
dritte.** `[cmd]` **Ein FRISCHER Reiter ueberlebte `/v2`, weil es
fuer ihn der erste war.**

`[cmd]` **Der Beleg:** eine Vorseite ohne Anmeldung genuegt.

    Vorseite      -> /v2/dashboard
    /login           TOT      (nur besucht, NICHT angemeldet)
    /dashboard       TOT
    /nutrition       TOT
    /                lebt     (Umleitung, kein zweiter Anstrich)
    (keine)          lebt

`[read]` **,,Angemeldet" hiess in Wahrheit ,,hat schon einmal
navigiert".**

#### Die Spur, mit Zeitstempeln

`[cmd]` **Der minimale Fall** (`/dashboard` zweimal):

        2 ms  frameStartedLoading
       48 ms  webpack / main-app / layout … (14 Buendel)
      901 ms  frameStoppedLoading
      902 ms  PAGE CRASH

`[read]` **852 ms Stille ? kein `domContentEventFired`, keine
Konsolenzeile, keine Ausnahme.** `[cmd]` **Der gesunde Reiter
laedt in derselben Phase drei weitere Buendel und meldet nach
465 ms `domContentEventFired`.**

### A2 und A3 ? NICHT erfuellt

`[read]` **Die Ursache im Quelltext ist nicht gefunden, also ist
nichts behoben, und es gibt kein Foto einer angemeldeten
`/v2`-Route im Browser.**

`[cmd]` **Was in diesem Auftrag zusaetzlich ausgeschlossen
wurde ? je mit Messung:**

    Verdacht                      Gegenprobe             Ergebnis
    Endlos-Rekursion              Stapel 500k und 30M    stuerzt weiter
    Speichermangel (Heap)         4 GB zugeteilt         stuerzt weiter
    Umleitungsschleife            Wege verfolgt: 2       ausgeschlossen
    SVG-Pfade (NaN/Infinity)      `d` neutralisiert      stuerzt weiter
    SVG ganz                      createElementNS ersetzt stuerzt weiter
    Sitzungskeks                  document.cookie leer   stuerzt weiter
    localStorage                  geleert                stuerzt weiter
    history.pushState-Schleife    gedrosselt (50)        stuerzt weiter
    Chromium-Protokoll            --enable-logging       keine Zeile
    CPU-Profil                    Profiler.start         0 Proben
    Messwerkzeug selbst           9 Altbrowser beendet   stuerzt weiter

`[cmd]` **Elf weitere Verdaechtige, zusammen mit den sieben aus
G-471: achtzehn.** `[read]` **Keiner war es.**

`[read]` **Ich habe wieder nichts gebaut, was ich nicht belegen
kann.** `[cmd]` **Geaendert wurde nur der Quellkarten-Schalter in
`next.config.js`** ? **kein Anwendungscode.**

**Was das Bild zusammengenommen sagt:**

`[read]` **Kein Javascript-Fehler, kein Stapelueberlauf, kein
Speichermangel, kein Profil, keine Chromium-Zeile** ? **der
Renderer wird beendet, ohne dass Javascript daran beteiligt
ist.** `[read]` **Das deutet auf die Ebene DARUNTER:** den
Anstrich selbst (Layout, Rasterung, Schriftauswahl) oder auf
etwas, das beim ZWEITEN Anstrich anders ist als beim ersten.

**Der naechste Schritt waere:**

`[cmd]` **`--disable-gpu`, `--disable-software-rasterizer`,
`--single-process`** ? **wenn der Absturz unter einem davon
ausbleibt, liegt er im Anstrich, nicht im Code.**

`[cmd]` **Und: dieselbe Messung in einem ANDEREN Browser.**
`[read]` **Firefox ist auf dieser Maschine nicht installiert**
(gemessen in G-471) ? **ohne zweiten Browser bleibt offen, ob es
ein Chromium-Fehler ist.**

### A4 ? ein Waechter, mit Sabotageprobe

**Neu: `g473-quellkarten.test.ts`, 4 Proben.**

`[read]` **Er bewacht NICHT den Absturz** ? das kann eine
Datei-Probe nicht, solange die Ursache unbekannt ist. **Er
bewacht das WERKZEUG**, mit dem der naechste Anlauf messen kann:

    der Schalter haengt an LUMEOS_SOURCEMAPS
    der normale Bau bleibt OHNE Karten
    `!!process.env` waere zu locker (auch `0` schaltete ein)
    der Bau bleibt von `.next` getrennt (B-18)

`[cmd]` **Sabotage ? alle vier Faelle werden ROT, die Kontrolle
bleibt GRUEN:**

    Schalter weg        ROT
    fest an             ROT
    jeder Wert (`!!`)   ROT
    Bau nach .next      ROT
    KONTROLLE         GRUEN

### A5 ? der Dev-Server blieb unveraendert

    3200 /login   HTTP 200
    3220 (coach)  HTTP 307
    beide hoeren weiter

`[cmd]` **Zweimal gebaut (66 s, 46 s), beide nach `.next-gate`** ?
**`.next` nicht angefasst.**

### A6 ? die vier Module unveraendert

    /v2/nutrition     194.366 Zeichen / 13 Kacheln
    /v2/training      104.993 / 11
    /v2/medical       511.300 / 11
    /v2/goals          50.401 / 18
    /v2/supplements   472.711 / 18

`[read]` **Zeichengleich mit G-467, G-469, G-470 und G-471.**

### A7 ? die Waechter

    apps/web     1835 Proben   1835 gruen   0 rot
    apps/coach     65 Proben     65 gruen   0 rot
    tsc web        exit 0

### A8 ? die Bauregeln eingehalten

`[cmd]` **Nur `pnpm --filter @lumeos/web build`**, zweimal, je
nach `.next-gate`. `[cmd]` **`next build` nie direkt, `.next` nie
geloescht, 3200 und 3220 durchgehend gelaufen.**

### Was gebaut wurde

    NEU        lib/__tests__/g473-quellkarten.test.ts   4 Proben
               tools/_g473-befund.mjs      der Befund in einem Lauf
               tools/_g473-anzahl.mjs      der minimale Fall
               tools/_g473-paare.mjs       welche Vorseite toetet
               tools/_g473-eintritt.mjs    Sitzung oder Uebergang?
               tools/_g473-phase.mjs       die Spur mit Zeitstempeln
               tools/_g473-profil.mjs      CPU-Profil (0 Proben)
               tools/_g473-rekursion.mjs   Ausnahmen im Reiter
               tools/_g473-schleife.mjs    Umleitungsschleife
               tools/_g473-svg.mjs         SVG-Verdacht
               tools/_g473-grenzen.mjs     Stapel und Heap
               tools/_g473-verdacht.mjs    Sitzungsbausteine
               tools/_g473-belege.mjs      welche Huelle je Seite
               tools/_g473-chromelog.mjs   Chromium-Protokoll
               tools/_g473-ohne-cdp.mjs    ohne Messwerkzeug
               tools/_g473-sabotage.mjs    4 + 1 Kontrolle

    GEAENDERT  apps/web/next.config.js
                 Quellkarten hinter LUMEOS_SOURCEMAPS
               tools/_g470-sabotage.mjs
                 (aus G-471, die zwei Huellenfaelle)

`[cmd]` **Kein Anwendungscode geaendert.** `[cmd]` **Nichts in
`supabase/`, nichts committet.**

### Was offen bleibt

`[read]` **Der Absturz selbst** ? **A2 und A3 offen.** **Aber die
Bedingung ist jetzt viel kleiner und ohne Anmeldung
reproduzierbar:** `[cmd]` **zweimal dieselbe Route im
Produktionsbau, `tools/_g473-befund.mjs`.**

`[read]` **Der naechste Auftrag sollte bei der Anstrichebene
ansetzen** (`--disable-gpu`, `--single-process`) ? **nicht bei
weiteren Javascript-Verdaechtigen.** **Achtzehn sind
ausgeschlossen.**

`[read]` **Und G-471 gehoert berichtigt:** dort steht *,,`/v2`
toetet"* und *,,angemeldeter Reiter"*. **Beides war eine
Nebenwirkung der Messung, nicht die Sache.**

`[read]` **`apps/web/.next-dev/` liegt weiter im Baum, und
`.gitignore` fuehrt weiter `.next/` und `.next-gate/` einzeln** ?
beides aus G-469/G-470 gemeldet, unveraendert.

`[read]` **Ein Neustart ist NICHT noetig** ? es wurde kein
Anwendungscode geaendert.

## Teilabnahme

**2026-09-08, Orchestrator. A1 berichtigt, A2/A3 offen.**

`[cmd]` **Kein Anwendungscode geaendert** ? **nur
`next.config.js` (Quellkartenschalter) und ein neuer
Waechter.**

`[cmd]` **Proben: web 1835/1835, coach 65/65.**

### Er hat seine EIGENE Eingrenzung widerlegt

> *,,Die Eingrenzung aus G-471 war FALSCH. Es liegt weder an
der Anmeldung noch an `/v2`."*

    Route            1. Aufruf   2. Aufruf
    /login           200         TOT
    /dashboard       200         TOT
    /v2/dashboard    200         TOT
    Dev-Server: fuenfmal dieselbe Route, alle 200

> *,,Meine Anmeldeprobe NAVIGIERT SELBST ? `/login` aufrufen,
Formular senden, warten. Der darauffolgende `/v2`-Aufruf war
schon der zweite oder dritte."*

> *,,*Angemeldet* hiess in Wahrheit *hat schon einmal
navigiert*."*

`[read]` **Die Vorbereitung der Probe wurde Teil der
gemessenen Bedingung** ? **und der Beleg ist sauber: `/login`
nur BESUCHT, nicht angemeldet, reicht schon.**

### Damit ist meine G-471-Abnahme falsch

`[cmd]` **Ich hatte geschrieben:** *,,`/dashboard`,
`/nutrition`, `/training` leben ? `/v2` toetet."*

`[read]` **Beides stimmt nicht.** **Ich habe seine Tabelle
uebernommen, ohne zu fragen, wie sie zustande kam.**

### Achtzehn Verdaechtige, und dann eine Halbierung

`[cmd]` **Elf weitere ausgeschlossen: Stapelueberlauf (500k und
30M), Heap (4 GB), Umleitungsschleife, SVG-Pfade, SVG ganz,
Sitzungskeks, `localStorage`, `history`-Schleife,
Chromium-Protokoll, CPU-Profil (0 Proben), und das Messwerkzeug
selbst (9 Altbrowser beendet).**

> *,,Der Renderer wird BEENDET, ohne dass Javascript beteiligt
ist. Der naechste Schritt gehoert auf die ANSTRICHEBENE ?
`--disable-gpu`, `--single-process` ? nicht zu weiteren
JS-Verdaechtigen."*

### Was ich nicht nachpruefen konnte

`[cmd]` **`_g473-befund.mjs` selbst gelaufen:
`zweiterAufrufStirbt: false`, alle Laeufe `?`.**

`[read]` **Der Produktionsbau auf 3251 laeuft nicht mehr** ?
**ich habe seine ARBEIT geprueft, nicht seinen Befund.**

**Teilabnahme. A1 berichtigt, A2 und A3 offen.**

## KEIN Anwendungsfehler ? G-474, 2026-09-08

`[cmd]` **Die Ursache war das MESSWERKZEUG:**
**Playwright 1.41.2 bringt Chromium 121 von Anfang 2024.**

`[cmd]` **Chrome 150 und Edge 150 sterben NICHT.**

`[read]` **Der hier beschriebene Absturz betrifft keinen
Nutzer** ? **er betrifft einen Browser, den niemand hat.**

`[read]` **Und meine Auftraege haben nie gefragt, WOMIT
gemessen wird.**

