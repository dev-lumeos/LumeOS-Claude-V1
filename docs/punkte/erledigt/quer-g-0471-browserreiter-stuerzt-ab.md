---
nr: G-471
typ: fehler
modul: quer
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: G-470
entscheidung: null
erledigt: 2026-09-08
commit: 5751ceea
beruehrt:
  dateien:
    - apps/web/src/components/shell/app-shell.tsx
zahlen:
  gemessen: 2026-09-08
---

# G-471 - der Browserreiter stuerzt im Produktionsbau ab

## Befund

Aus G-470, Claude Code, 2026-09-08:

> *,,Der Browserreiter stuerzt auf `/v2/*` im Produktionsbau ab
? Serverprotokoll LEER, HTTP 200, voller Inhalt. Rein
clientseitig, war bisher vom `document`-Fehler VERDECKT."*

## Abnahmebedingungen

    A1  die Ausnahme im Browser, mit Stapel.
    A2  welche Routen betroffen? TABELLE.
    A3  behoben, und der Reiter bleibt stehen.
    A4  ein Waechter, der es faengt. Sabotageprobe.
    A5  Gegenprobe: der Dev-Server bleibt unveraendert,
        3200 und 3220 laufen weiter.
    A6  vier Module unveraendert.
    A7  apps/web 1830 oder mehr, apps/coach 65.
    A8  NIE .next loeschen, nie next build direkt.
        Nur pnpm gate oder
        pnpm --filter @lumeos/web build.

## Bericht

**Claude Code, 2026-09-17.**

### Der Stand in einem Satz

`[cmd]` **Der Absturz ist reproduzierbar und eingegrenzt** ?
**angemeldeter Reiter plus `/v2`, nur im Produktionsbau.**
`[read]` **Die URSACHE ist NICHT gefunden, und A3 ist damit NICHT
erfuellt.**

### A1 ? die Ausnahme mit Stapel: es gibt keine

`[cmd]` **Gemessen ueber das DevTools-Protokoll
(`Runtime.exceptionThrown`, `Log.entryAdded`,
`Inspector.targetCrashed`):**

    Ausnahmen           0
    Konsolenzeilen      0
    Stapel              keiner
    Speicher vor dem    10 MB, flach
      Absturz
    Ereignis            page.crash + Inspector.targetCrashed
    Zeit bis zum Tod    ~1.400 bis 1.700 ms

`[read]` **Das ist KEIN Javascript-Fehler** ? ein solcher
hinterliesse eine Ausnahme. `[read]` **Und es ist kein
Speichermangel:** bei 10 MB und flacher Kurve stirbt kein Reiter
an vollem Speicher. **Der Renderer-Prozess wird beendet.**

`[cmd]` **Auch mit Kopf (nicht kopflos) stuerzt er ab** ? es ist
kein Artefakt des kopflosen Betriebs. `[cmd]` **Firefox war nicht
installiert**, der Gegenvergleich fehlt also.

### A2 ? welche Routen betroffen sind

`[cmd]` **Elf Routen, je in einem FRISCHEN Reiter:**

    /login /  /dashboard  /v2/settings  /v2/goals
    /v2/nutrition  /v2/training  /v2/recovery
    /v2/medical  /v2/supplements  /v2/coach

    alle HTTP 200, alle mit Inhalt, KEIN Absturz

`[read]` **Die Route allein ist es also nicht.**

`[cmd]` **Dieselben Routen im Reiter, der sich gerade ANGEMELDET
hat:**

    Ziel           Produktionsbau        Dev-Server
    /dashboard     200, lebt             200, lebt
    /nutrition     200, lebt             200, lebt
    /training      200, lebt             ?
    /v2            ABSTURZ (1.446 ms)    200, lebt
    /v2/goals      (uebersprungen)       200, lebt
    /v2/settings   (uebersprungen)       200, lebt

`[read]` **Die Bedingung ist eine UND-Verknuepfung:**

    angemeldeter Reiter  UND  /v2*  UND  Produktionsbau

`[cmd]` **Drei Faelle, sauber getrennt** (`_g471-lage.mjs`):

    A  angemeldeter Reiter -> /v2       ABSTURZ
    B  FRISCHER Reiter     -> /v2       200, lebt
    C  angemeldeter Reiter -> /dashboard, /nutrition, /training
                                        200, lebt

`[read]` **`/v2` ist die Grenze** ? nicht `/v2/settings`, wie ich
in G-470 geschrieben hatte. **Die Huelle toetet, nicht die
Unterseite.**

`[read]` **Auch ein Umweg hilft nicht:** erst `/`, dann `/v2` ?
**derselbe Absturz.** **Der Reiter traegt etwas aus der Anmeldung
mit.**

### A3 ? NICHT erfuellt

`[read]` **Der Reiter stuerzt weiterhin ab.**

`[cmd]` **Was ausgeschlossen wurde, je mit Messung:**

    Verdacht                       Gegenprobe          Ergebnis
    navigator.locks (LockManager)  abgeschaltet        stuerzt weiter
    ResizeObserver-Schleife        ersetzt             stuerzt weiter
    requestAnimationFrame-Schleife gedrosselt (400)    stuerzt weiter
    Canvas/WebGL                   getContext -> null  stuerzt weiter
    Speichermangel                 10 MB, flach        ausgeschlossen
    kopfloser Betrieb              mit Kopf gemessen   stuerzt weiter
    G-470 (document)               neu gebaut          stuerzt weiter

`[read]` **Sieben Verdaechtige gemessen und ausgeschlossen** ?
**und keiner war es.**

`[read]` **Ich habe die Ursache nicht gefunden, und ich baue
nichts, was ich nicht belegen kann.** `[cmd]` **Kein
Anwendungscode geaendert** ? `git status apps/` **nennt nur die
Waechterdatei.**

**Was als naechstes zu messen waere:**

`[read]` **Der Unterschied zwischen frischem und angemeldetem
Reiter ist der Schluessel** ? beide laden dieselbe Seite, einer
stirbt. `[cmd]` **Zu vergleichen waere, was der angemeldete
Reiter an Zustand traegt:** Speicherobjekte (`localStorage`,
`sessionStorage`), offene Verbindungen, laufende Zeitgeber der
Supabase-Sitzung.

`[read]` **Und der Bau selbst:** `next build` **mit Quellkarten,
dann den Absturzpunkt im unverkleinerten Code suchen.** **Das
waere der naechste Auftrag.**

### Ein Fehler in meiner eigenen Messung

`[cmd]` **Die ersten sechs Messreihen liefen gegen einen Bau von
11:17 ? meine G-470-Behebung stammt von 11:38.** `[read]` **Der
laufende Bau war aelter als die Behebung.**

`[cmd]` **Neu gebaut (46 s) und alles wiederholt:** **der Absturz
bleibt.** `[read]` **Der Befund haelt also** ? **aber er war
zwischenzeitlich nicht belegt, und das gehoert gesagt.**

`[cmd]` **Eine Aussage aus G-470 muss ich berichtigen:** dort
steht *,,der Produktionsbau ist anmeldefaehig"*. `[read]`
**Richtig ist:** **die Anmeldung gelingt auf HTTP-Ebene** (auth
200, Keks gesetzt, geschuetzte Routen liefern ueber `fetch`
HTTP 200 mit vollem Inhalt) ? **aber der BROWSER kommt nicht
an:** nach der Anmeldung bleibt er auf
`/login?redirect=%2Fdashboard` stehen, **weil die Weiterleitung
nach `/v2` den Reiter toetet.**

### A4 ? ein Waechter, der die Klasse faengt

**Ergaenzt: `browser-global-grenze.test.ts`** (aus G-470) **um
eine vierte Probe.**

`[read]` **Sie bewacht die zwei HUELLEN** ?
`app/v2/shell.tsx` **und** `components/shell/app-shell.tsx` ?
**die auf JEDER Seite laufen.** `[cmd]` **Geprueft wird der ORT
des Zugriffs:** in `useEffect`/`useCallback`/Ereignisbehandlung
ist er richtig, **im Rumpf oder in einem `useMemo` nicht** ?
**genau die Form, die G-470 ausgeloest hat.**

`[read]` **Der Waechter faengt NICHT den Absturz selbst** ? das
kann eine Datei-Probe nicht, solange die Ursache unbekannt ist.
**Er faengt die KLASSE**, und er haelt fest, dass die Huellen
heute sauber sind.

`[cmd]` **Sabotage ? alle sechs Faelle werden ROT:**

    URSPRUNG (lesen)       document.cookie ohne Pruefung   ROT
    URSPRUNG (schreiben)   dito                            ROT
    Erkennung              GLOBALE geleert                 ROT
    Abgrenzung             client-grenze nennt document    ROT
    G-471 Huelle           document.* im Rumpf der Huelle  ROT
    G-471 Liste            eine Huelle entfernt            ROT
    KONTROLLE              nur als Wort im Kommentar     GRUEN

`[read]` **,,G-471 Liste" war zuerst BLIND** ? eine Huelle zu
entfernen liess die Probe gruen, **weil die andere noch reichte.**
`[cmd]` **Jetzt prueft sie ihre eigene Liste zuerst** ? dieselbe
Lehre wie bei der leeren `GLOBALE`-Liste in G-470.

### A5 ? der Dev-Server blieb unveraendert

    3200 /login   HTTP 200
    3220 (coach)  HTTP 307
    beide hoeren weiter

`[cmd]` **Und der Dev-Server zeigt den Absturz NICHT** ? alle
fuenf Ziele im angemeldeten Reiter leben:

    /dashboard 146 ms · /nutrition 1.492 · /v2 3.087
    /v2/goals 1.147 · /v2/settings 643      alle HTTP 200

`[read]` **Das ist zugleich der Beleg, dass es ein Fehler des
BAUS ist** ? derselbe Quelltext, anderes Ergebnis.

### A6 ? die vier Module unveraendert

    /v2/nutrition     194.366 Zeichen / 13 Kacheln
    /v2/training      104.993 / 11
    /v2/medical       511.300 / 11
    /v2/goals          50.401 / 18
    /v2/supplements   472.711 / 18

`[read]` **Zeichengleich mit G-467, G-469 und G-470.**

### A7 ? die Waechter

    apps/web     1831 Proben   1831 gruen   0 rot
    apps/coach     65 Proben     65 gruen   0 rot
    tsc web        exit 0

### A8 ? die Bauregeln eingehalten

`[cmd]` **Nur `pnpm --filter @lumeos/web build`** ? zweimal, je
nach `.next-gate` (38 s und 46 s). `[cmd]` **`.next` nicht
angefasst, `next build` nie direkt gerufen, 3200 und 3220
durchgehend gelaufen.**

### Was gebaut wurde

    NEU        tools/_g471-absturz.mjs        Stapel und Speicher
               tools/_g471-routen.mjs         A2, elf Routen
               tools/_g471-gleicher-reiter.mjs  Reiter oder Route?
               tools/_g471-reihe.mjs          welches Ziel toetet
               tools/_g471-stapel.mjs         feine Speicherabtastung
               tools/_g471-browser.mjs        Kopf/kopflos
               tools/_g471-locks.mjs          LockManager-Gegenprobe
               tools/_g471-bisektion.mjs      vier Browser-APIs
               tools/_g471-grund.mjs          Absturzgrund vom Browser
               tools/_g471-klickweg.mjs       der Nutzerweg
               tools/_g471-lage.mjs           der Befund in einem Lauf

    GEAENDERT  lib/__tests__/browser-global-grenze.test.ts
                 vierte Probe: die Huellen
               tools/_g470-sabotage.mjs
                 zwei Faelle fuer die neue Probe

`[cmd]` **Kein Anwendungscode geaendert** ? **die Ursache ist
nicht gefunden.** `[cmd]` **Nichts in `supabase/`, nichts
committet.**

### Was offen bleibt

`[read]` **Der Absturz selbst** ? **A3 ist offen.** **Die
Bedingung ist eingegrenzt** (angemeldeter Reiter + `/v2` +
Produktionsbau), **die Ursache nicht.**

`[read]` **Der naechste Schritt waere ein Bau MIT Quellkarten** ?
dann laesst sich der Absturzpunkt im unverkleinerten Code suchen,
statt weiter Verdaechtige durchzuprobieren. `[read]` **Sieben
haben nichts ergeben.**

`[read]` **`apps/web/.next-dev/` liegt weiter im Baum** (aus
G-469), **und `.gitignore` fuehrt weiter `.next/` und
`.next-gate/` einzeln statt `.next*/`** ? beides aus G-470
gemeldet, **beides unveraendert.**

`[read]` **Ein Neustart ist NICHT noetig** ? es wurde kein
Anwendungscode geaendert.

## Teilabnahme

**2026-09-08, Orchestrator. Eingegrenzt, nicht behoben.**

`[cmd]` **Kein Anwendungscode geaendert** ? **nur
`browser-global-grenze.test.ts`.**

`[cmd]` **Proben: web 1831/1831, coach 65/65.**

### Was er ausgeschlossen hat

> *,,Sieben Verdaechtige gemessen und ausgeschlossen:
`navigator.locks`, `ResizeObserver`, `requestAnimationFrame`,
Canvas/WebGL, Speichermangel, kopfloser Betrieb, G-470. Keiner
war es."*

`[cmd]` **A1: KEINE Ausnahme** ? **0 Konsolenzeilen, Speicher
10 MB und flach, `Inspector.targetCrashed` nach 1,5 s.**

`[read]` **Kein JS-Fehler, kein Speichermangel** ? **der
Renderer-Prozess wird BEENDET.**

### Die Bedingung ist eine UND-Verknuepfung

    angemeldeter Reiter  UND  /v2  UND  Produktionsbau

`[cmd]` **`/dashboard`, `/nutrition`, `/training` leben** ?
**`/v2` toetet.**

`[cmd]` **Der Dev-Server besteht alle fuenf Ziele** ?
**gleicher Quelltext, anderes Ergebnis.**

### Und er hat eine eigene Aussage berichtigt

> *,,Eine G-470-Aussage muss ich berichtigen: *der
Produktionsbau ist anmeldefaehig* gilt nur auf HTTP-Ebene. Der
BROWSER kommt nicht an ? er bleibt auf `/login?redirect=...`
stehen, weil die Weiterleitung nach `/v2` den Reiter toetet. In
G-470 hatte ich das mit `fetch` gemessen und daraus zu viel
geschlossen."*

`[read]` **Damit ist meine G-470-Abnahme zu weit gegangen** ?
**ich habe *,,der Produktionsbau meldet sich an"* geschrieben,
gestuetzt auf seine HTTP-Messung.**

`[cmd]` **HTTP 200 und ein lebender Reiter sind zwei
Sachen** ? **dieselbe Klasse wie die 1.100 ms ueber `docker
exec`.**

### Und der erste Messlauf war unbelegt

> *,,Die ersten sechs Messreihen liefen gegen einen Bau von
11:17 ? meine G-470-Behebung ist von 11:38. Neu gebaut, der
Befund haelt, aber er war zwischenzeitlich unbelegt."*

`[read]` **Er hat gegen einen veralteten Bau gemessen, es
gemerkt und wiederholt.**

### A3 bleibt offen

> *,,Ich habe nichts gebaut, was ich nicht belegen kann."*

`[read]` **Das ist die richtige Entscheidung** ? **sieben
Fehlversuche haetten den Code beschaedigt.**

`[cmd]` **Sein naechster Schritt: ein Bau mit Quellkarten und
der Absturzpunkt im unverkleinerten Code** ? **als G-473.**

**Teilabnahme. A1, A2, A4 bis A7 erfuellt, A3 offen.**


