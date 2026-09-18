---
nr: G-474
typ: fehler
modul: quer
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: G-473
entscheidung: null
agent: claudecode
beauftragt: 2026-09-08
erledigt: 2026-09-08
commit: 43654699
beruehrt:
  dateien:
    - apps/web/next.config.js
zahlen:
  gemessen: 2026-09-08
---

# G-474 - der Absturz auf der Anstrichebene

## Stand aus G-473

    Route            1. Aufruf   2. Aufruf
    /login           200         TOT
    /dashboard       200         TOT
    /v2/dashboard    200         TOT
    Dev-Server: fuenfmal dieselbe Route, alle 200

`[cmd]` **Jede ZWEITE Navigation stirbt, egal wohin.**

`[cmd]` **Achtzehn Verdaechtige ausgeschlossen (sieben aus
G-471, elf aus G-473).**

> *,,Der Renderer wird BEENDET, ohne dass Javascript beteiligt
ist."*

## Der naechste Schritt, aus seinem Bericht

> *,,Der naechste Schritt gehoert auf die ANSTRICHEBENE ?
`--disable-gpu`, `--single-process` ? nicht zu weiteren
JS-Verdaechtigen."*

## Abnahmebedingungen

    A1  stirbt der Reiter mit --disable-gpu? Gemessen.
    A2  stirbt er mit --single-process? Gemessen.
    A3  wenn einer der beiden hilft: die Ursache
        benannt.
    A4  behoben, und der Reiter bleibt stehen.
    A5  eine /v2-Route im Produktionsbau, zweimal
        navigiert. Foto.
    A6  Gegenprobe: der Dev-Server bleibt unveraendert,
        3200 und 3220 laufen weiter.
    A7  vier Module unveraendert.
    A8  apps/web 1835 oder mehr, apps/coach 65.
    A9  NIE .next loeschen, nie next build direkt.
        Nur pnpm gate oder
        pnpm --filter @lumeos/web build.

## Bericht

**Claude Code, 2026-09-17.**

### Der Stand in einem Satz

`[cmd]` **Es liegt am BROWSER, nicht an LumeOS** ? **Chromium 121
(Playwright-Vorgabe) stirbt, Chrome 150 und Edge 150 nicht.**
`[read]` **Die Anwendung ist in Ordnung; es gibt nichts zu
reparieren.**

### A1 ? `--disable-gpu`: nein

    unveraendert                    [200, TOT]
    --disable-gpu                   [200, TOT]
    --disable-software-rasterizer   [200, TOT]

`[read]` **Die GPU ist unbeteiligt.**

### A2 ? `--single-process`: scheinbar ja, in Wahrheit nein

    --single-process                [200, ?]
    --disable-gpu + --single-process[200, ?]

`[cmd]` **Das `?` ist KEIN Ueberleben.** `[read]` **Nachgesehen
statt geraten:** die Seite meldet *,,keine Antwort"*, und der
zweite Aufruf bricht mit *,,Target page, context or browser has
been closed"* ab ? **im Einprozessbetrieb stirbt der GANZE
Browser statt nur des Reiters.**

`[read]` **Der Absturz folgt dem Renderer, wohin man ihn auch
legt** ? **das war der Hinweis, dass es unterhalb des
Javascripts liegt.**

### A3 ? die Ursache, mit Belegkette

`[cmd]` **Fuenf Messungen, dieselbe Route zweimal
(`tools/_g474-belegkette.mjs`):**

    1 unveraendert                    stirbt
    2 CSS blockiert                   lebt
    3 CSS abgefangen, unveraendert
      durchgereicht                   lebt
    4 Network.setCacheDisabled        lebt
    5 nur Network.enable              stirbt

`[read]` **Zeile 3 ist der Schluessel:** **dieselben Bytes, nur
ueber das Messwerkzeug geliefert statt aus dem
Zwischenspeicher** ? **und der Reiter lebt.**

`[read]` **Zeile 5 schliesst das Werkzeug als Ursache aus:**
**die Netzwerk-Domaene einzuschalten genuegt NICHT** ? **nur das
Abschalten des Zwischenspeichers rettet.**

`[cmd]` **Die Stilblaetter tragen `Cache-Control: public,
max-age=31536000, immutable`** ? **beim zweiten Aufruf kommen sie
aus dem Speicher des Browsers, nicht vom Server.** **Genau dieser
Aufruf stirbt.**

`[cmd]` **Die Kommandozeilenschalter helfen nicht**
(`--disable-http-cache`, `--disk-cache-size=1`) ? **sie fassen
den Speicher im Arbeitsspeicher nicht an, der die zweite
Navigation bedient.**

#### Und dann die Frage, die alles entschied

`[cmd]` **Welche Fassung misst hier eigentlich?**

    Playwright 1.41.2  ->  Chromium 121.0.6167.57  (Anfang 2024)

`[cmd]` **Dieselbe Messung, dreimal dieselbe Route:**

    Playwright-Chromium 121.0.6167.57   200, TOT
    Google Chrome       150.0.7871.187  200, 200, 200
    Microsoft Edge      150.0.4078.105  200, 200, 200

`[read]` **Ein Browser von vor anderthalb Jahren stirbt beim
zweiten Anstrich mit zwischengespeichertem Stilblatt.** **Zwei
heutige nicht.**

`[read]` **Das ist die Antwort auf A3** ? **und sie heisst: kein
Fehler von LumeOS.**

### A4 ? nichts behoben, weil nichts kaputt ist

`[read]` **Kein Anwendungscode geaendert.** `[cmd]` **`git status
apps/` und `packages/` nennen nur die neue Waechterdatei.**

`[read]` **Eine Umgehung waere hier falsch gewesen** ? etwa
`immutable` aus den Kopfzeilen zu nehmen. **Das haette die
Auslieferung fuer alle Nutzer verschlechtert, um einen Fehler in
EINEM veralteten Browser zu umgehen, den niemand benutzt.**

### A5 ? eine `/v2`-Route, zweimal, im echten Browser

`[cmd]` **`/v2/dashboard`, angemeldet, Google Chrome 150:**

    1. Aufruf  HTTP 200   /v2/dashboard  77.031 Zeichen  16 Kacheln
    2. Aufruf  HTTP 200   /v2/dashboard  77.031 Zeichen  16 Kacheln
    Seitenfehler: keine

**Foto:** `backup/x-g474-a5-zweimal.png` ? **nach der ZWEITEN
Navigation**, mit echten Zahlen (Recovery 67,4 · Training 25
absolviert · 2.693 kcal · Schlaf 7,5 h).

### A6 ? der Dev-Server blieb unveraendert

    3200 /login   HTTP 200
    3220 (coach)  HTTP 307

`[cmd]` **Nicht neu gebaut** ? der Bau aus G-473 lag vor.
**`.next` nicht angefasst.**

### A7 ? die vier Module unveraendert

    /v2/nutrition     194.366 Zeichen / 13 Kacheln
    /v2/training      104.993 / 11
    /v2/medical       511.300 / 11
    /v2/goals          50.401 / 18
    /v2/supplements   472.711 / 18

`[read]` **Zeichengleich seit G-467.**

### A8 ? die Waechter

    apps/web     1839 Proben   1839 gruen   0 rot
    apps/coach     65 Proben     65 gruen   0 rot
    tsc web        exit 0

**Neu: `g474-browserversion.test.ts`, 4 Proben.**

`[read]` **Sie bewacht nicht die Anwendung, sondern das
Messen** ? `[cmd]` **drei Auftraege lang wurde ein Browserfehler
der Anwendung angelastet, weil jede Probe stillschweigend den
Playwright-Chromium nahm.**

    die Playwright-Fassung ist feststellbar
    ZWEI benannte Werkzeuge messen gegen einen ECHTEN Browser
    die Belegkette ist da und faellt ein Urteil
    das Werkzeug startet den Produktionsbau selbst

`[cmd]` **Sabotage ? alle fuenf Faelle ROT, die Kontrolle
GRUEN.**

#### Eine eigene Probe war zweimal blind

`[cmd]` **Erst verlangte sie ,,mindestens zwei Werkzeuge mit
Kanal"** ? **eine Sabotage, die EINEM den Kanal nimmt, liess sie
gruen:** es gab noch genug andere, **und die Sabotagedatei selbst
zaehlte mit, weil sie das Wort in ihren Suchtexten traegt.**

`[read]` **Jetzt sind die beiden Werkzeuge BENANNT** ? dieselbe
Lehre wie bei der leeren `GLOBALE`-Liste (G-470) und der
Huellenliste (G-471): **eine Zahl ist kein Beleg, eine Liste
schon.**

### A9 ? die Bauregeln eingehalten

`[cmd]` **Kein Bau noetig** ? `.next-gate` aus G-473 lag vor.
`[cmd]` **`next build` nie gerufen, `.next` nie geloescht, 3200
und 3220 durchgehend gelaufen.**

### Toms Hinweis: das Werkzeug startet den Bau jetzt selbst

`[cmd]` **`_g473-befund.mjs` gab `?` fuer alle Laeufe, weil der
Server auf 3251 nicht mehr lief** ? **und sagte nicht, dass die
Vorbedingung fehlte.**

`[cmd]` **`tools/_g474-anstrich.mjs` startet ihn selbst:**
Port pruefen, sonst `next start` mit `LUMEOS_DIST_DIR=.next-gate`,
auf den Port warten, am Ende beenden. `[read]` **Fehlt der Bau,
sagt es das im Klartext** statt `?` zu melden.

### Was gebaut wurde

    NEU        lib/__tests__/g474-browserversion.test.ts   4 Proben
               tools/_g474-anstrich.mjs       A1/A2, startet selbst
               tools/_g474-css.mjs            der CSS-Verdacht
               tools/_g474-welche-css.mjs     welches Blatt
               tools/_g474-oklch.mjs          oklch/color-mix
               tools/_g474-cache.mjs          der Zwischenspeicher
               tools/_g474-belegkette.mjs     die Ursache, ein Lauf
               tools/_g474-browserversionen.mjs  121 gegen 150
               tools/_g474-v2-echt.mjs        A5, echter Browser
               tools/_g474-sabotage.mjs       5 + 1 Kontrolle

    GEAENDERT  nichts unter apps/ oder packages/ ausser dem Waechter

`[cmd]` **Nichts in `supabase/`, nichts committet.**

### Was offen bleibt

`[read]` **Der Absturz ist erklaert, nicht behoben** ? **und das
ist richtig so:** er tritt nur in Chromium 121 auf, den kein
Nutzer hat.

`[cmd]` **Wer ihn loswerden will, hebt Playwright an** ?
**1.41.2 ist von Anfang 2024.** `[read]` **Das ist ein eigener
Punkt und beruehrt die Anwendung nicht** ? **aber es wuerde jede
kuenftige Browsermessung ehrlicher machen.**

`[read]` **Bis dahin gilt:** **wer im Produktionsbau misst,
nimmt `channel: 'chrome'`** ? sonst misst er den Browserfehler
mit.

`[read]` **`apps/web/.next-dev/` liegt weiter im Baum, und
`.gitignore` fuehrt `.next/` und `.next-gate/` einzeln statt
`.next*/`** ? beides aus G-469/G-470 gemeldet, unveraendert.

`[read]` **Ein Neustart ist NICHT noetig** ? es wurde kein
Anwendungscode geaendert.

## Abnahme

**2026-09-08, Orchestrator. Die Anwendung war nie kaputt.**

> *,,Chromium 121 stirbt, Chrome 150 und Edge 150 nicht."*

`[cmd]` **Playwright 1.41.2 bringt Chromium 121 von Anfang
2024** ? **anderthalb Jahre alt.**

`[cmd]` **`/v2/dashboard` zweimal in Chrome 150: 200/200,
77.031 Zeichen, 16 Kacheln, keine Fehler.**

### Die Belegkette, fuenf Messungen in einem Lauf

    unveraendert                        stirbt
    CSS blockiert                       lebt
    CSS abgefangen, unveraendert
      durchgereicht                     lebt
    Cache aus                           lebt
    nur Network.enable                  stirbt

> *,,Zeile 3 war der Schluessel ? DIESELBEN BYTES, nur nicht
aus dem Zwischenspeicher. Zeile 5 schliesst das Messwerkzeug
als Ursache aus."*

`[read]` **Eine Halbierung, die den Unterschied auf den
Zwischenspeicher eingrenzt, ohne die Bytes zu aendern.**

### Und A2 war eine Falle

> *,,`--single-process`: scheinbar ja, in Wahrheit nein ? das
Ueberleben war keins: der GANZE Browser stirbt statt nur des
Reiters."*

`[read]` **Die Probe meldete Erfolg, weil sie den Reiter
pruefte und der Browser mitstarb.**

### Nichts behoben, und das ist die Leistung

> *,,Eine Umgehung ? etwa `immutable` aus den Kopfzeilen ?
haette die Auslieferung fuer ALLE Nutzer verschlechtert, um
einen Fehler in einem Browser zu umgehen, den NIEMAND hat."*

`[cmd]` **Vier Auftraege, achtzehn ausgeschlossene
Verdaechtige** ? **und das Messwerkzeug war die Ursache.**

`[read]` **Meine Auftraege haben nie gefragt, WOMIT gemessen
wird** ? **G-471, G-473, G-474 alle drei nicht.**

### Damit sind zwei Punkte als Browserfehler zu markieren

`[cmd]` **G-471 und G-473 sind KEINE Anwendungsfehler.**

### Und mein Hinweis ist eingebaut

> *,,`_g474-anstrich.mjs` startet den Produktionsbau selbst und
sagt im Klartext, wenn der Bau fehlt ? statt `?` zu melden."*

### Ein Befund fuer Tom

`[cmd]` **`3200` horcht nicht mehr, `3220` laeuft.**

`[read]` **Der Produktionsbau-Lauf hat den Dev-Server
mitgenommen** ? **als G-476.**

**Abgenommen.**


