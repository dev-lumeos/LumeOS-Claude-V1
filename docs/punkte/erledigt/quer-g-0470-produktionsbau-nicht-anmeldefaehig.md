---
nr: G-470
typ: fehler
modul: quer
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: G-469
entscheidung: null
erledigt: 2026-09-08
commit: 498f7b5b
beruehrt:
  dateien:
    - apps/web/src/middleware.ts
zahlen:
  gemessen: 2026-09-08
---

# G-470 - der Produktionsbau ist nicht anmeldefaehig

## Befund

Aus G-469, Claude Code, 2026-09-08:

> *,,Der Produktionsbau ist nicht anmeldefaehig ? der
Supabase-Client wirft dort serverseitig `document is not
defined`, `/login` leitet auf sich selbst zurueck. Fuer A2
umgangen (oeffentliche Routen), fuer echten Betrieb nicht."*

## Warum es zaehlt

`[cmd]` **G-469 hat gemessen: der Produktionsbau ist kalt
schneller als der Dev-Server warm (65-203 ms gegen
338-757 ms).**

`[read]` **Aber niemand kann sich dort anmelden** ? **also
laesst sich nichts Angemeldetes messen oder pruefen.**

`[read]` **Und fuer den echten Betrieb ist es ein
Sperrfehler.**

## Der Verdacht

`[cmd]` **`document is not defined` heisst: ein
Browser-Objekt wird auf dem Server benutzt.**

`[read]` **Im Entwicklungsmodus faellt es nicht auf, weil
Next.js dort anders buendelt.**

`[cmd]` **MISS, welcher Supabase-Client wo erzeugt wird** ?
**Server- und Browser-Client muessen getrennt sein.**

## Abnahmebedingungen

    A1  welche Stelle wirft? Gemessen, mit Stapel.
    A2  Anmeldung im Produktionsbau funktioniert.
    A3  eine angemeldete Route im Produktionsbau:
        Ladezeit gemessen.
    A4  Gegenprobe: der Dev-Server bleibt unveraendert.
    A5  vier Module unveraendert.
    A6  NIE .next loeschen, nie next build direkt.

## Gemessen 2026-09-08 - es gibt schon einen Waechter

`[cmd]` **Drei Stellen erzeugen einen Supabase-Client:**

    apps/web/src/middleware.ts
    apps/web/src/lib/__tests__/client-grenze.test.ts
    apps/web/src/lib/__tests__/abmelden.test.ts

`[read]` **`client-grenze.test.ts` heisst, dass jemand die
Trennung schon einmal bewacht hat** ? **lies sie, bevor du
baust.**

`[cmd]` **MISS, ob sie den Fall abdeckt oder ob sie ihn
verpasst** ? **wenn sie ihn verpasst, ist das der eigentliche
Befund.**

## Bericht

**Claude Code, 2026-09-17.**

### Der Stand in einem Satz

`[cmd]` **Eine Zeile in `packages/shared` hat den Produktionsbau
anmeldeunfaehig gemacht** ? **und der Waechter, der diese Grenze
bewachen sollte, hat eine ganz andere bewacht.**

### A1 ? welche Stelle wirft

`[cmd]` **Gemessen am laufenden Produktionsbau, mit Stapel:**

    ReferenceError: document is not defined
      at Object.s [as get]          <- `lesen`, client.ts:44
      at Object.getItem
      at rQ
      at rL.__loadSession
      at rL._useSession
      at rL._emitInitialSession
      at rL._recoverAndRefresh
      at rL._initialize

`[cmd]` **Die Stelle:**
`packages/shared/src/supabase/client.ts:44`

    function lesen(name: string): string | undefined {
      const treffer = document.cookie   <- hier
        .split('; ')

`[cmd]` **Und der Weg dorthin, gemessen:**

    app-shell.tsx:257   createClient() in einem useMemo
    layout.tsx:119      <AppShell> im WURZEL-Layout

`[read]` **`useMemo` laeuft beim Serveranstrich MIT** ? anders als
`useEffect`. `[cmd]` **Und weil `AppShell` im Wurzel-Layout
steht, traf es JEDE Seite**, nicht nur die Anmeldung.

`[read]` **Im Entwicklungsmodus faellt es nicht auf** ? Next.js
buendelt dort anders, und die Ausnahme blieb aus. **Der Verdacht
aus dem Auftrag war richtig.**

### A2 ? deckt `client-grenze.test.ts` den Fall ab?

`[cmd]` **NEIN. Gemessen: die Datei nennt `document`, `window`,
`localStorage` und `sessionStorage` KEIN EINZIGES MAL.**

`[read]` **Sie bewacht eine andere Grenze** ? **`Map`/`Set` in den
Prop-Signaturen von `'use client'`-Komponenten** (A-60): eine Map
ueber die Grenze kommt leer an, weil React nach JSON serialisiert.

`[read]` **Zwei verschiedene Fragen, ein aehnlicher Name:**

    client-grenze        was ueberlebt die Serialisierung?
    (fehlte bis jetzt)   was existiert auf dem Server ueberhaupt?

`[read]` **Das ist der eigentliche Befund des Auftrags** ? **nicht
dass ein Waechter versagt hat, sondern dass es ihn nie gab.**
`[read]` **Der Name hat die Luecke verdeckt:** wer
*,,client-grenze"* liest, haelt die Grenze fuer bewacht.

### A3 ? die Anmeldung im Produktionsbau

`[cmd]` **Die Behebung: zwei Rueckfaelle in `client.ts`.**

    lesen()      typeof document === 'undefined' -> undefined
    schreiben()  typeof document === 'undefined' -> return

`[read]` **Nicht den Aufruf verschoben** ? `useMemo` ist dort
richtig. `[read]` **Ein Klient, der auf dem Server keine Kekse
findet, ist ein gueltiger Zustand:** **es gibt dort keine
Browsersitzung zu lesen.** **Die Sitzung setzt die Middleware
ueber `NextResponse.cookies`.**

`[cmd]` **Neu gebaut (38 s) und gemessen:**

    Ausnahmen im Serverprotokoll   vorher: bei jedem Aufruf
                                   nachher: 0

    /login          HTTP 200
    /               HTTP 200
    /v2/dashboard   HTTP 307  (Umleitung, richtig)

`[cmd]` **Und die Anmeldung selbst:**

    auth/v1/token?grant_type=password   HTTP 200
    Keks sb-127-auth-token              2.614 Zeichen
    angemeldet                          ja

`[cmd]` **Drei geschuetzte Routen, angemeldet, im
Produktionsbau:**

    /v2/settings                  HTTP 200   50.004 Zeichen
    /v2/goals                     HTTP 200   99.793 Zeichen
    /v2/supplements?tab=produkte  HTTP 200  500.721 Zeichen

`[read]` **Volle Inhalte, keine Umleitung** ? **der Produktionsbau
ist anmeldefaehig.**

### A4 ? Ladezeit einer angemeldeten Route

`[cmd]` **Je viermal, aus einer angemeldeten Sitzung:**

    Route                          Produktionsbau       Dev-Server
    /v2/settings                897 / 2282 764 716   730 / 693 814 611
    /v2/goals                   313 /  212 185 236  1529 / 342 384 326
    /v2/supplements?produkte    584 /  518 514 595   894 / 709 629 646

`[read]` **Eingeschwungen ist der Produktionsbau durchweg
schneller** ? **bei `/v2/goals` um Faktor 1,6 bis 1,8.**

`[read]` **Die 2.282 ms bei `/v2/settings` sind ein Ausreisser**
(der Kurzspeicher der Allergietreffer aus G-465 laeuft nach 60
Sekunden ab) ? **die beiden folgenden Laeufe liegen bei 764 und
716 ms.** **Gemeldet, nicht geglaettet.**

### Ein zweiter Befund: der Reiter stuerzt ab

`[cmd]` **Auf `/v2/*` im Produktionsbau stirbt der
BROWSERREITER** ? `Page crashed`, **ohne Konsolenmeldung.**

`[cmd]` **Das Serverprotokoll bleibt dabei LEER** ? keine
Ausnahme, HTTP 200, voller Inhalt. `[read]` **Es ist also nichts
Serverseitiges**, sondern etwas im Browser nach dem Anstrich.

`[read]` **Deshalb ist A4 mit `fetch` aus einer angemeldeten
Sitzung gemessen** ? derselbe Weg durch Middleware, Auth und
Server-Render, **nur ohne React im Reiter.**

`[read]` **Das ist ein eigener Punkt** ? **er war vor diesem
Auftrag durch den `document`-Fehler verdeckt** und wird erst
jetzt sichtbar. **Gemeldet, nicht angefasst.**

### A6 ? der Waechter, geschaerft

**Neu: `apps/web/src/lib/__tests__/browser-global-grenze.test.ts`,
3 Proben.**

`[read]` **Er prueft die WIRKUNG, nicht das Wort:** `[cmd]`
**`document` in einer Datei zu verbieten waere falsch** ?
`packages/shared` MUSS den Keks im Browser lesen (F-07/G-411).
**Gesucht wird ein Zugriff OHNE `typeof`-Absicherung in derselben
Funktion.**

`[cmd]` **Die dritte Probe haelt die Abgrenzung fest:**
`client-grenze.test.ts` **darf keines der vier Objekte nennen** ?
**sonst ueberschneiden sich die beiden, und einer gehoert
entfernt statt doppelt gepflegt.**

#### Die Sabotageprobe beantwortet die entscheidende Frage

`[cmd]` **Der wichtigste Fall ist der URSPRUNGSZUSTAND** ? nimmt
man die Absicherung wieder heraus, ist der Code genau der, der
den Produktionsbau lahmgelegt hat:

    URSPRUNG (lesen)       ROT
    URSPRUNG (schreiben)   ROT
    Erkennung leer         ROT
    Abgrenzung aufgeweicht ROT
    KONTROLLE              GRUEN

`[read]` **Damit ist belegt: dieser Waechter haette G-470
gefunden.**

#### Drei eigene Fehler dabei

`[cmd]` **1 ? die Erlaubnisliste war der blinde Fleck.** Eine
Sabotage, die `GLOBALE` leert, liess die Probe gruen ? **kein
Objekt zu suchen heisst, nichts zu finden.** `[read]` **Jetzt
prueft die Probe ihre eigene Liste zuerst.**

`[cmd]` **2 ? die Sabotage entfernte den RUMPF statt der
Pruefung** (`return` -> `{ }`). **Die `typeof`-Zeile blieb stehen,
und der Waechter sah zu Recht eine Absicherung** ? die Probe war
nicht blind, die Sabotage war zu schwach.

`[cmd]` **3 ? `\\n` gegen eine CRLF-Datei.** `[read]` **Und diesmal
andersherum als in G-469:** `client.ts` **hat CRLF,**
`tab-produkte.tsx` **hatte LF.** **Die Zeilenenden gelten je
Datei** ? nachgemessen, nicht angenommen.

### A5 ? der Dev-Server blieb unveraendert

    3200 /login   HTTP 200
    3220 (coach)  HTTP 307
    beide Prozesse hoeren weiter

`[cmd]` **Die Kennung von 3200 hat gewechselt** (1335264 ->
1691016) ? **Next hat sich nach der Aenderung in
`packages/shared` selbst neu geladen.** `[read]` **Kein `start`,
kein `neustart`, kein `aufraeumen`** ? **das ist das heisse
Nachladen, und es ist bei `packages/` erwartbar.**

`[cmd]` **`apps/coach` gegengeprueft** ? die App, die den
Cookie-Scope aus F-07 nutzt:

    Anmeldung   auth 200, Keks sb-127-coach-auth-token
    Landung     http://127.0.0.1:3220/

`[read]` **Der Weg mit Scope funktioniert weiter** ? **die
Aenderung beruehrt nur den Fall OHNE `document`.**

### A7 ? die vier Module unveraendert

    /v2/nutrition     194.366 Zeichen / 13 Kacheln
    /v2/training      104.993 / 11
    /v2/medical       511.300 / 11
    /v2/goals          50.401 / 18
    /v2/supplements   472.711 / 18

`[read]` **Zeichengleich mit G-467 und G-469.**

### A8 ? die Waechter

    apps/web     1830 Proben   1830 gruen   0 rot
    apps/coach     65 Proben     65 gruen   0 rot
    tsc web        exit 0
    tsc coach      exit 0

### Der Aufraeumpunkt: `.next-dev/`

`[cmd]` **GEMESSEN ? es gehoert in `.gitignore`, und die
Pauschalregel ist unbedenklich:**

    .gitignore nennt einzeln:  .next/  und  .next-gate/
    im Baum liegen:            apps/web/.next        ignoriert
                               apps/web/.next-gate   ignoriert
                               apps/coach/.next      ignoriert
                               apps/coach/.next-gate ignoriert
                               apps/web/.next-dev    NICHT ignoriert

    git ls-files | grep -E '(^|/)\.next[^/]*/'   ->  LEER

`[read]` **Keine einzige Datei unter irgendeinem
`.next*`-Verzeichnis ist getrackt** ? **dieselbe Pruefung, mit der
B-18 die Zeile `.next-gate/` begruendet hat** (sie steht als
Kommentar darueber).

`[read]` **Vorschlag: `.next*/` statt zweier Einzelzeilen** ?
**dann faellt jede kuenftige `distDir`-Variante von selbst
heraus.** `[cmd]` **Nicht geaendert** ? `.gitignore` **war nicht
Gegenstand des Auftrags, und die Entscheidung ueber eine
Pauschalregel gehoert Tom.**

`[cmd]` **`apps/web/.next-dev/` (217 kB) liegt weiter im Baum** ?
**nicht geloescht.**

### Was gebaut wurde

    NEU        lib/__tests__/browser-global-grenze.test.ts   3 Proben
               tools/_g470-anmeldung.mjs    A3, was der Browser sieht
               tools/_g470-keks.mjs         die Kekse beider Server
               tools/_g470-angemeldet.mjs   A4, angemeldete Routen
               tools/_g470-sabotage.mjs     4 + 1 Kontrolle

    GEAENDERT  packages/shared/src/supabase/client.ts
                 zwei typeof-Rueckfaelle in `lesen` und `schreiben`

`[cmd]` **Nichts in `supabase/`, nichts committet.**

### Was offen bleibt

`[read]` **Der Browserreiter stuerzt auf `/v2/*` im
Produktionsbau ab** ? Serverprotokoll leer, HTTP 200, voller
Inhalt. **Ein eigener Punkt; er war bis jetzt verdeckt.**

`[read]` **`.gitignore` sollte `.next*/` fuehren** ? gemessen und
unbedenklich, **aber nicht von mir geaendert.**

`[read]` **`apps/web/.next-dev/` gehoert geloescht** ? **im Baum
loescht nur Tom.**

`[read]` **Ein Neustart ist NICHT noetig** ? die Aenderung liegt
in `packages/shared`, **und Next hat 3200 bereits selbst neu
geladen** (neue Prozesskennung, Seite antwortet).

## Abnahme

**2026-09-08, Orchestrator. Nachgemessen.**

`[cmd]` **Die behobene Stelle,
`packages/shared/src/supabase/client.ts`:**

    Z78   if (typeof document === 'undefined') return undefined
    Z91   if (typeof document === 'undefined') return

`[cmd]` **Und der Kommentar daneben:** *,,`typeof document ===
'undefined'` ist die Pruefung, nicht `typeof window` ?
gemessen wird genau das Objekt, das benutzt wird."*

`[cmd]` **Proben: web 1830/1830, coach 65/65.**

`[cmd]` **`browser-global-grenze.test.ts` ist neu,
`_g470-sabotage.mjs` exit 0:** *,,Alle Proben koennen rot
werden, die Kontrolle bleibt gruen."*

### A2 ist der eigentliche Befund, und er stimmt

`[cmd]` **`client-grenze.test.ts` selbst gelesen:**

    document          NEIN
    window            NEIN
    localStorage      NEIN
    sessionStorage    NEIN
    Map, Set, A-60    ja

> *,,Es war kein Versagen, sondern eine LUECKE, die der NAME
verdeckt hat. Wer *client-grenze* liest, haelt die Grenze fuer
bewacht ? tatsaechlich sind es ZWEI Fragen: was ueberlebt die
Serialisierung, und was existiert auf dem Server ueberhaupt."*

`[read]` **Ein Waechter, dessen NAME mehr verspricht, als er
prueft** ? **das ist gefaehrlicher als gar keiner.**

### Der Weg zum Fehler

> *,,`app-shell.tsx:257` ruft `createClient()` im `useMemo`
(laeuft beim Serveranstrich MIT), AppShell steht im
Wurzel-Layout -> jede Seite."*

`[read]` **`useMemo` laeuft beim Serveranstrich, `useEffect`
nicht** ? **eine Zeile im Wurzel-Layout hat jede Seite
lahmgelegt.**

### Und die Zahl

    /v2/goals   Prod 185-313 ms   Dev 326-1.529 ms
    auth 200, Keks 2.614 Zeichen, 0 Ausnahmen
    drei geschuetzte Routen HTTP 200

`[read]` **Der Produktionsbau meldet sich an.**

**Abgenommen.**

