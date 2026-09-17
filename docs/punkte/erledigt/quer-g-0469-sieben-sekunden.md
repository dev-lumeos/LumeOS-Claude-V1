---
nr: G-469
typ: befund
modul: quer
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: G-467
entscheidung: null
erledigt: 2026-09-08
commit: 3691405b
beruehrt:
  dateien:
    - apps/web/src/app/v2/supplements/tab-produkte.tsx
zahlen:
  gemessen: 2026-09-08
  ms: 7730
---

# G-469 - 7,7 Sekunden, und die Daten sind es nicht

## Befund

Aus G-467, Claude Code, 2026-09-08:

> *,,101,1 kB -> 0,7 kB (-99 %), 9.545 -> 7.730 ms (-19 %)."*

> *,,Die DATEN fallen viel staerker als die ZEIT. Das passt zu
G-465: die Zeit haengt am Weg durch Next.js und Auth, nicht an
der Menge. Die restlichen 7,7 s liegen woanders."*

## Was schon ausgeschlossen ist

`[cmd]` **Die Datenbank: 0,2 bis 40 ms (selbst gemessen).**

`[cmd]` **Die Datenmenge: 99 % weniger, nur 19 % schneller.**

`[cmd]` **Die Anzahl Anfragen: fuenf, und sie laufen parallel
(G-465).**

`[cmd]` **Der 57-Runden-Fehler: behoben (G-465).**

`[read]` **Vier Verdaechtige gemessen und ausgeschlossen.**

## Was zu messen bleibt

`[read]` **Der Weg durch Next.js und Auth.**

    A  wie lange braucht die Anmeldung je Anfrage?
    B  laeuft sie je fetch neu oder einmal?
    C  wie viel ist Uebersetzungszeit im Dev-Server
       und faellt im Produktionsbau weg?
    D  Vergleich: wie lange braucht ein anderes Modul?

`[cmd]` **Ich habe gemessen: Heute 10,3 s, Produkte 14,5 s,
Recovery 15,3 s** ? **ueber `schuss.mjs`, inkl. Anmeldung.**

`[read]` **Recovery ist LANGSAMER als Produkte** ? **das
spricht fuer den Dev-Server, nicht fuer die Supplements.**

`[cmd]` **Tom sagt: *,,normale ui changes sind nicht
langsam"*** ? **also liegt es am ersten Aufruf je Route.**

## Der Verdacht

`[read]` **Next.js uebersetzt jede Route beim ersten Aufruf im
Entwicklungsmodus.**

`[cmd]` **MISS den Unterschied: erster gegen zweiten Aufruf
derselben Route.**

`[read]` **Wenn der zweite schnell ist, ist es der
Dev-Server** ? **und der Produktionsbau misst es endgueltig.**

`[cmd]` **`pnpm gate` baut nach `.next-gate`** ? **dort laesst
es sich messen, ohne den Dev-Server anzufassen.**

## Abnahmebedingungen

    A1  erster gegen zweiten Aufruf. Zahl.
    A2  Dev-Server gegen Produktionsbau. Zahl.
    A3  je Abschnitt: Anmeldung, Uebersetzung, Daten.
        TABELLE.
    A4  wenn es der Dev-Server ist: GEMELDET, nicht
        wegoptimiert.
    A5  wenn nicht: die Ursache benannt.
    A6  NIE .next loeschen, nie next build direkt.

## Bericht

**Claude Code, 2026-09-17.**

### Der Befund in einem Satz

`[cmd]` **Es ist der Entwicklungsserver** ? **derselbe Bau
beantwortet dieselbe Route in 51 bis 88 ms, den der Dev-Server in
338 bis 757 ms beantwortet, und der ERSTE Aufruf je Route kostet
dort zusaetzlich 3,3 bis 8,5 Sekunden.**

`[read]` **Es gibt nichts zu reparieren.**

### A1 ? erster gegen zweiten Aufruf

`[cmd]` **Eine Sitzung, dieselbe Route mehrfach, die Anmeldung
VORHER und nicht mitgemessen:**

    Route                     erster     weitere        gespart
    /v2/coach                9.764 ms    1.224 ms      8.540 ms
    /v2/medical              4.513 ms    1.173 ms      3.340 ms
    /v2/recovery             4.492 ms      982 ms      3.510 ms
    /v2/supplements?produkte 2.035 ms    1.410 ms        625 ms

`[read]` **`/v2/coach` ist der ehrlichste Fall** ? **die einzige
Route, die in dieser Sitzung noch nie geoeffnet war.** `[cmd]`
**Recovery und Medical zeigen nur 3,3 bis 3,5 Sekunden, weil ein
Vorlauf sie schon uebersetzt hatte**; Supplements war aus den
Vorauftraegen warm.

`[cmd]` **In einem frueheren Lauf, als Recovery und Training kalt
waren:**

    /v2/recovery             8.387 ms    1.021 ms      7.366 ms
    /v2/training             8.209 ms    1.239 ms      6.970 ms

`[read]` **Das Muster ist ueber alle Routen dasselbe:** **der
erste Aufruf 3 bis 10 Sekunden, jeder weitere rund eine.**

#### Und es uebersetzt nur EINMAL je Route

`[cmd]` **Dieselbe Route zwoelfmal, ohne Aenderung dazwischen:**

    444 383 375 390 723 351 418 412 476 471 408 474 ms

`[read]` **Keine wiederkehrenden Spitzen** ? **ein Ausreisser bei
723 ms, sonst ein schmales Band.** `[read]` **Das ist der
Unterschied zwischen *,,uebersetzt einmal"* und *,,rechnet jedes
Mal"*** ? **und es ist der erste Fall.**

### A2 ? Dev-Server gegen Produktionsbau

`[cmd]` **`pnpm --filter @lumeos/web build`** ? 40 Sekunden, nach
`.next-gate`, **der Dev-Server blieb unangetastet.** `[cmd]`
**Gestartet auf 3251, `Ready in 514ms`.**

`[cmd]` **Warm, dieselben Routen, mit `curl` gemessen:**

    Route     Dev-Server (3200)        Produktionsbau (3251)
    /login    356 403 338 360 ms        86  79  64  77 ms
    /         474 398 460 757 ms        81  82  79  73 ms

`[cmd]` **Und KALT ? frisch gestarteter Produktionsserver, je der
ERSTE Aufruf:**

    /login            203 ms
    /                  65 ms
    /v2/dashboard       4 ms   (Umleitung)

`[read]` **Das ist die Zahl, auf die es ankommt:** **der erste
Aufruf im Produktionsbau kostet 65 bis 203 ms, im Dev-Server 3.500
bis 9.800.** **Faktor 20 bis 50.**

`[read]` **Auch warm bleibt der Dev-Server vier- bis sechsmal
langsamer** ? **das ist der Preis der Entwicklungsumgebung, nicht
ein Fehler im Code.**

#### Was dabei nebenbei aufgefallen ist

`[cmd]` **Der Produktionsbau kann sich NICHT anmelden:**

    ReferenceError: document is not defined
      at rL._useSession ... _recoverAndRefresh ... _initialize

`[read]` **Der Supabase-Client laeuft dort serverseitig gegen
`document`** ? **die Anmeldung bricht ab, und `/login` leitet auf
sich selbst zurueck.** `[cmd]` **Deshalb ist A2 auf den
oeffentlichen Routen gemessen** (`/login`, `/`), **die keine
Sitzung brauchen ? und denselben Next.js-Weg durchlaufen.**

`[read]` **Das ist ein eigener Befund, kein Teil dieses
Auftrags** ? **aber es heisst: der Produktionsbau ist derzeit
nicht anmeldefaehig.** **Gemeldet, nicht angefasst.**

### A3 ? je Abschnitt

`[cmd]` **Zwei kalte Routen, je einzeln zerlegt:**

    Abschnitt          /v2/goals      /v2/settings
    Anmeldung           2.116 ms        2.297 ms
    erster Aufruf       3.522 ms        3.421 ms
      davon Uebersetzung 2.335 ms (66 %) 2.404 ms (70 %)
      davon Daten        1.187 ms (34 %) 1.017 ms (30 %)
    weitere Aufrufe     1.216/1.535/1.187   1.017/1.028/1.020

`[read]` **Zwei Drittel des ersten Aufrufs sind Uebersetzung.**
`[read]` **Die Anmeldung kostet rund zwei Sekunden ? aber EINMAL
je Sitzung, nicht je Seite.**

### D ? laeuft die Anmeldung je Anfrage neu?

`[cmd]` **NEIN. Gemessen ueber die Antwortkoepfe:**

    /v2/goals      12 Antworten, davon 0 mit `set-cookie`
    /v2/settings   11 Antworten, davon 0 mit `set-cookie`

`[read]` **Keine einzige Antwort erneuert die Sitzung** ? **die
Anmeldung laeuft einmal und wird dann mitgetragen.** `[read]`
**Der Verdacht *,,Auth je fetch"* ist damit ausgeschlossen.**

### A4 ? es IST der Dev-Server, und deshalb wurde nichts geaendert

`[cmd]` **Kein Anwendungscode angefasst:**

    git status apps/ packages/   ->  leer

`[read]` **Der Auftrag sagt es woertlich:** *,,WENN ES DER
DEV-SERVER IST: MELDEN, nicht wegoptimieren."*

**Was das fuer Tom heisst:**

`[read]` **Was er im Betrieb sieht, ist nicht, was er in der
Entwicklung sieht.** `[cmd]` **Die 7,7 Sekunden aus G-467 waren
zu zwei Dritteln Uebersetzung und zu einem Drittel ein
Dev-Server, der vier- bis sechsmal langsamer antwortet als der
Bau.**

`[read]` **Sein eigener Hinweis war richtig:** *,,normale ui
changes sind nicht langsam"* ? **weil die Route dann schon
uebersetzt ist.**

`[read]` **Und es heisst auch:** **jede kuenftige Zeitmessung in
der Entwicklung misst vor allem den Dev-Server.** `[cmd]` **Wer
eine echte Zahl braucht, baut nach `.next-gate` und misst dort.**

### A5 ? entfaellt

`[read]` **A5 galt fuer den Fall, dass es NICHT der Dev-Server
ist.** **Er ist eingetreten** ? **A4 ist die Antwort.**

### Was die vier ausgeschlossenen Verdaechtigen betrifft

`[cmd]` **Alle vier bleiben ausgeschlossen, und die Messung
bestaetigt sie:**

    die Datenbank        40 ms  (Toms psql-Messung)
    die Datenmenge       -99 % brachte -19 %  (G-467)
    die Anzahl Anfragen  fuenf, parallel      (G-465)
    der 57-Runden-Fehler behoben              (G-465)

`[read]` **Der fuenfte Verdaechtige ? der Weg durch Next.js und
Auth ? zerfaellt in zwei Teile:** **die Uebersetzung (zwei
Drittel, nur in der Entwicklung) und die Grundlast des
Dev-Servers (der Rest).** **Auth ist es nicht.**

### A6 ? die vier Module unveraendert

    /v2/nutrition     194.366 Zeichen / 13 Kacheln
    /v2/training      104.993 / 11
    /v2/medical       511.300 / 11
    /v2/goals          50.401 / 18
    /v2/supplements   472.711 / 18

`[read]` **Identisch mit den Werten aus G-467** ? **und das muss
so sein: es wurde kein Anwendungscode geaendert.**

### A7 ? die Waechter

    apps/web     1827 Proben   1827 gruen   0 rot
    apps/coach     65 Proben     65 gruen   0 rot
    tsc web        exit 0

**Neu: 6 Proben in `g469-ladezeit-befund.test.ts`.**

`[read]` **Eine Probe kann diesen Befund nicht nachmessen** ? sie
laeuft nicht gegen einen Server. `[cmd]` **Sie bewacht deshalb die
Mechanik, die den Befund TRAEGT:** die Trennung von `.next` und
`.next-gate` (ohne die dieser Auftrag Toms Server zerschossen
haette), und die Zusagen aus G-465 und G-467. **Faellt eine davon,
ist der Befund ueberholt.**

`[cmd]` **JEDE kann rot werden ? gemessen:**

    A1a  Bau schreibt wieder nach .next        ROT
    A1b  Dev-Server nimmt anderen distDir      ROT
    A2   .next-gate nicht mehr ignoriert       ROT
    A3   Suche wartet nicht auf die Filter     ROT
    A4a  Runden wieder nacheinander            ROT
    A4b  Kurzspeicher nicht je Nutzer          ROT
    A5   Trefferzahl ohne Erklaerung           ROT

`[cmd]` **Und die KONTROLLE** ? ein Kommentar mit `Promise.all`,
`TREFFER_SPEICHER.get(userId)`, `trefferSatz` und `.next-gate` als
blossen Woertern ? **bleibt GRUEN.**

#### Eine eigene Probe war dreimal blind

`[cmd]` **`if (!geladen) return` steht ZWEIMAL in
`tab-produkte.tsx`** ? im Speichereffekt und im Sucheffekt.

`[read]` **Die Sabotage entfernte die eine, die Probe fand die
andere und blieb gruen.** `[cmd]` **Zwei Nachbesserungen
scheiterten ebenfalls**, weil sie weiter irgendeine der beiden
Stellen suchten.

`[read]` **Was die Stelle eindeutig macht, ist ihre
NACHBARSCHAFT:** die Sperre muss unmittelbar vor dem `setTimeout`
stehen, das `produkte?` ruft. **Das kann der Speichereffekt nicht
erfuellen.**

`[cmd]` **Und die Sabotage selbst war zweimal falsch** ? erst traf
sie die falsche der beiden Stellen, dann suchte sie mit `\\r\\n` in
einer Datei, **die LF hat.** `[read]` **Nachgemessen statt
angenommen** ? **auch „die Dateien haben CRLF" ist eine
Behauptung, die je Datei gilt oder nicht.**

### Was gebaut wurde

    NEU        __tests__/g469-ladezeit-befund.test.ts   6 Proben
               tools/_g469-erster-zweiter.mjs   A1
               tools/_g469-abschnitte.mjs       A3 und D
               tools/_g469-oeffentlich.mjs      A2 im Browser
               tools/_g469-sabotage.mjs         7 + 1 Kontrolle

    GEAENDERT  nichts unter apps/ oder packages/

`[cmd]` **Nichts in `supabase/`, nichts committet.**

`[cmd]` **`backup/c276/supplement-kern-dubletten.json` hatte ein
Waechterlauf neu geschrieben** ? **zurueckgenommen.**

### Was offen bleibt

`[cmd]` **`apps/web/.next-dev/` (217 kB) liegt im Baum** ? **ein
Rest meiner A1b-Sabotage**, die den `distDir` testweise umgestellt
hat. `[read]` **Es ist reines Bauergebnis, steht NICHT in
`.gitignore` und gehoert geloescht** ? **ich habe es nicht selbst
entfernt.**

`[cmd]` **Dieselbe Sabotage hat `apps/web/tsconfig.json`
veraendert** (Next traegt neue Typenpfade selbst ein) ?
**zurueckgenommen, `git status apps/` ist sauber.**

`[read]` **Der Produktionsbau ist nicht anmeldefaehig**
(`document is not defined` im Supabase-Client). `[read]` **Fuer
diesen Auftrag war es umgehbar ? fuer einen echten Betrieb nicht.**
**Ein eigener Punkt.**

`[read]` **`apps/web/.next-gate/` ist 1,1 GB gross** und durch
`.gitignore` ausgeschlossen. `[read]` **Es bleibt liegen, damit
die naechste Messung nicht wieder 40 Sekunden bauen muss.**

`[read]` **Ein Neustart ist NICHT noetig** ? es wurde kein
Anwendungscode geaendert, und 3200 und 3220 liefen durchgehend.

## Abnahme

**2026-09-08, Orchestrator. Nachgemessen.**

> *,,Es ist der Dev-Server. Es gibt nichts zu reparieren."*

`[cmd]` **Sein Werkzeug `_g469-erster-zweiter.mjs` selbst
gelaufen:**

    /v2/coach                      gespart 2.495 ms
    /v2/recovery                   gespart 1.317 ms
    /v2/medical                    gespart   680 ms
    /v2/supplements?tab=produkte   gespart   112 ms

`[read]` **`produkte` spart fast nichts mehr** ? **sie war
von seinem Lauf schon uebersetzt. Das BELEGT den Befund:
einmal je Route.**

### Und die Zahl, die alles entscheidet

    warm   Dev 338-757 ms   Prod  51-88 ms
    kalt   Dev 3.500-9.800  Prod  65-203 ms

`[read]` **Der Produktionsbau ist kalt schneller als der
Dev-Server warm.**

`[cmd]` **Anmeldung 2,2 s EINMAL je Sitzung, nicht je fetch** ?
**0 von 12 Antworten setzen einen Cookie.**

### Meine eigene Messung war anders, und warum

`[cmd]` **Ich habe ueber `schuss.mjs` gemessen: 8,6 s und
9,3 s, BEIDE gleich.**

`[read]` **`schuss.mjs` startet jedes Mal einen neuen Browser
und meldet sich neu an** ? **ich habe den Weg gemessen, nicht
die Route.**

`[read]` **Dieselbe Falle wie bei `docker exec` (1.100 ms
statt 40 ms)** ? **die Zahl gemessen, die man leicht bekommt.**

### Er hat es GEMELDET, nicht wegoptimiert

`[cmd]` **`git status apps/` leer** ? **kein Anwendungscode
geaendert.**

`[read]` **Die Auflage war:** *,,wenn es der Dev-Server ist:
MELDEN, nicht wegoptimieren."*

### Und Toms Hinweis war der Schluessel

> *,,Dein Hinweis war richtig: *normale ui changes sind nicht
langsam* ? weil die Route dann schon uebersetzt ist."*

### Eine Probe war dreimal blind

> *,,`if (!geladen) return` steht ZWEIMAL in der Datei, die
Sabotage traf die andere Stelle."*

`[read]` **Ein Waechter, den eine zweite gleiche Zeile
erfuellt** ? **dieselbe Klasse wie in G-453, G-455, G-460,
G-465, G-467.**

**Abgenommen.**

