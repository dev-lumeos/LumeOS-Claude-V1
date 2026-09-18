---
nr: G-476
typ: fehler
modul: quer
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: G-474
entscheidung: null
agent: claudecode
beauftragt: 2026-09-08
erledigt: 2026-09-08
commit: 855916ed
beruehrt:
  dateien:
    - tools/schuss.mjs
zahlen:
  gemessen: 2026-09-08
---

# G-476 - der Produktionsbau nimmt den Dev-Server mit

## Befund

`[cmd]` **Nach G-474 gemessen: `3200` horcht nicht mehr,
`3220` laeuft.**

`[cmd]` **Tom:** *,,server laeuft nicht"*

`[read]` **`_g474-anstrich.mjs` startet den Produktionsbau
und beendet ihn** ? **dabei ist der Dev-Server gestorben.**

## Warum es zaehlt

`[read]` **Die Regel lautet: NIE start, neustart,
aufraeumen** ? **weil Tom den Server besitzt.**

`[read]` **Ein Werkzeug, das ihn versehentlich beendet,
bricht dieselbe Regel.**

## Was zu messen ist

    A  beendet _g474-anstrich.mjs zu breit?
       (alle node-Prozesse statt nur seinem)
    B  oder faellt 3200 aus einem anderen Grund?
    C  kann das Werkzeug seinen eigenen Prozess
       merken und nur den beenden?

`[cmd]` **`tools/lauf.py` hat `CREATE_NO_WINDOW` und
`shell=False`** ? **miss, ob das Werkzeug dieselbe Bauform
nutzt.**

## Abnahmebedingungen

    A1  die Ursache, gemessen.
    A2  das Werkzeug beendet NUR seinen eigenen Bau.
    A3  Gegenprobe: 3200 laeuft waehrend und nach
        einem Werkzeuglauf.
    A4  KEIN Server gestartet -- gemeldet, wenn einer
        fehlt.

## Bericht

**Claude Code, 2026-09-18.**

### Der Stand in einem Satz

`[cmd]` **`taskkill /F /T` traf eine TOTE, neu vergebene PID** ?
**und `/T` nahm den ganzen Baum darunter mit, in dem Toms
Dev-Server hing.** `[read]` **Behoben, und das Werkzeug startet
jetzt nur noch auf ausdrueckliche Erlaubnis.**

### A1 ? die Ursache, gemessen

`[cmd]` **Am Ende von `_g474-anstrich.mjs` stand:**

    taskkill /F /T /PID <pid der cmd-Huelle>

`[cmd]` **Gemessen, wie lange diese Huelle lebt**
(`tools/_g476-huelle.mjs`, eigener Port 3299):

    1s   huelleLebt=true    portOffen=true
    2s   huelleLebt=true    portOffen=true
    3s   huelleLebt=true    portOffen=true
    4s   huelleLebt=true    portOffen=true
    5s   huelleLebt=true    portOffen=true
    6s   huelleLebt=FALSE   portOffen=true

`[read]` **Die `cmd`-Huelle aus `shell: true` stirbt nach rund
fuenf Sekunden ? der Server laeuft weiter.**

`[cmd]` **Am Ende des Laufs war `eigenerServer.pid` also ein
toter PID.** `[cmd]` **Gegenprobe an einem eigenen, harmlosen
Baum** (`tools/_g476-baum.mjs`): **`taskkill` meldete `Fehler
128`** ? *,,Prozess nicht gefunden"*.

`[read]` **Und genau das ist die Gefahr:** **Windows vergibt
freie PIDs neu.** **Trifft die Nummer inzwischen einen fremden
Prozess, nimmt `/T` dessen ganzen Baum mit.** **Hier: den
Dev-Server auf 3200.**

`[read]` **Der Fehler war doppelt abgesichert falsch** ? eine
gemerkte PID UND ein Baumabschuss. **Jedes fuer sich reicht
schon.**

### A2 ? das Werkzeug beendet nur seinen eigenen Bau

`[cmd]` **Drei Sicherungen, jede einzeln noetig:**

    1  nur wenn DIESES Werkzeug den Server gestartet hat
    2  der Prozess wird ueber den PORT gesucht, nicht ueber
       eine gemerkte PID
    3  OHNE `/T` ? genau ein Prozess, kein Baum

`[cmd]` **Der Port ist die einzige verlaessliche Kennung** ? er
sagt, wer JETZT dort antwortet. `[cmd]` **Ueber `netstat`, nicht
ueber PowerShell:** `Get-NetTCPConnection` und `Get-CimInstance`
**brauchten hier ueber 60 Sekunden** und liessen die Messung in
die Frist laufen.

`[cmd]` **`grep -l "'/T'" tools/*.mjs`** ? **nur noch
`_g476-baum.mjs`**, die Diagnose, die an einem EIGENEN Baum
misst, was `/T` anrichtet.

### A3 ? die Gegenprobe: 3200 laeuft waehrend und nach dem Lauf

`[cmd]` **Vorher:**

    3200: PID 1748816  HTTP 200
    3220: PID 1286652  HTTP 307

`[cmd]` **Nach einem vollen Lauf, der selbst startet und
beendet:**

    3200: PID 1748816  HTTP 200      <- dieselbe Kennung
    3220: PID 1286652  HTTP 307
    3251: 0 Listener                 <- eigener Bau sauber weg

`[cmd]` **Zweimal wiederholt, je dieselbe Kennung 1748816 und
null zurueckgelassene Listener.** `[read]` **Dreimal derselbe
Prozess** ? **der Dev-Server wurde nicht angefasst.**

### A4 ? kein Server gestartet, sondern gemeldet

`[read]` **Starten ist jetzt die AUSNAHME, nicht die Vorgabe.**
`[cmd]` **Ohne `LUMEOS_START=1`:**

    {
      "fehler": "Kein Produktionsbau auf Port 3251.",
      "sowirdsgemacht": [
        "1. pnpm --filter @lumeos/web build",
        "2. cd apps/web && LUMEOS_DIST_DIR=.next-gate npx next start -p 3251",
        "3. node tools/_g474-anstrich.mjs"
      ],
      "hinweis": "Mit LUMEOS_START=1 startet dieses Werkzeug den
                  Bau selbst und beendet NUR ihn (ueber den Port,
                  ohne /T)."
    }

`[read]` **Kein `?`, kein stiller Fehlschlag** ? genau Toms
Befund zu G-473, jetzt umgekehrt: **das Werkzeug sagt, was
fehlt, und was zu tun ist.**

`[cmd]` **Dieselbe Sperre in `_g476-huelle.mjs`** ? auch sie
muss einen Server starten, **und auch sie fragt erst.**

### A5 ? die vier Module

    /v2/nutrition     195.458 Zeichen / 13 Kacheln
    /v2/training      104.988 / 11
    /v2/medical       511.300 / 11
    /v2/goals          50.405 / 18
    /v2/supplements   482.399 / 18

`[read]` **Die KACHELZAHLEN sind unveraendert** (13/11/11/18/18),
**die Zeichenzahlen haben sich bei vieren bewegt.**

`[cmd]` **Nicht von mir:** `git status apps/ packages/` **ist
leer** ? **ich habe keinen Anwendungscode angefasst.** `[cmd]`
**Seit dem letzten Lauf liegt `812918d7 punkte(C-515): die
Wirkstoffe kuratieren`** ? das erklaert `/v2/supplements`
(+9.688) und `/v2/nutrition` (+1.092).

`[read]` **Gemeldet, nicht als ,,unveraendert" verbucht.**

### A6 ? die Waechter

    apps/web     1844 Proben   1844 gruen   0 rot
    apps/coach     65 Proben     65 gruen   0 rot
    tsc web        exit 0

**Neu: `g476-werkzeug-beendet-nur-eigenes.test.ts`, 5 Proben.**

    kein Werkzeug ruft `taskkill /T`
    wer startet, beendet ueber den PORT
    Starten braucht LUMEOS_START
    es GIBT ein startendes Werkzeug (sonst prueft nichts)
    KONTROLLE

`[cmd]` **Sabotage ? alle vier Faelle ROT, die Kontrolle
GRUEN:**

    URSPRUNG (/T zurueck)   ROT   <- der eigentliche Beleg
    gemerkte PID            ROT
    ohne LUMEOS_START       ROT
    kein Starter mehr       ROT
    KONTROLLE             GRUEN

`[read]` **Der erste Fall ist der wichtige:** **baut man `/T`
zurueck, wird die Reihe rot** ? **sie haette den Schaden
gefunden.**

#### Drei eigene Proben waren zuerst blind

`[cmd]` **1 ? Vorkommen statt Gebrauch (zweimal).** Die Sabotage
ersetzte `const pid = pidAmPort(PORT)` durch die gemerkte PID ?
**die Funktion stand noch in der Datei, die Probe blieb gruen.**
**Ebenso `DARF_STARTEN = true`:** das Wort `LUMEOS_START` blieb
stehen. `[read]` **Jetzt wird der GEBRAUCH geprueft**
(`= pidAmPort(`, `LUMEOS_START [!=]== '1'`).

`[cmd]` **2 ? die eigene Sabotagedatei als Fundstelle.** Sie
fuehrt `/T` und den Startaufruf als SUCHTEXT. `[read]`
**Ausgenommen an der SACHE, nicht am Namen:** wer Dateien
zurueckschreibt (`writeFileSync`) und `--test` ruft, beschreibt
Aenderungen, statt sie auszufuehren.

`[cmd]` **3 ? zu enge Schreibweise.** `LUMEOS_START === '1'`
machte `_g476-huelle.mjs` faelschlich rot, die mit
`!== '1'` abriegelt ? **beides sind gueltige Tore.**

### Was gebaut wurde

    NEU        lib/__tests__/g476-werkzeug-beendet-nur-eigenes.test.ts
               tools/_g476-huelle.mjs     A1: wie lange lebt die Huelle
               tools/_g476-baum.mjs       was `/T` anrichtet
               tools/_g476-sabotage.mjs   4 + 1 Kontrolle

    GEAENDERT  tools/_g474-anstrich.mjs
                 kein `/T`, Beenden ueber den Port,
                 Starten nur mit LUMEOS_START=1
               tools/_g476-huelle.mjs     dieselbe Sperre

`[cmd]` **Kein Anwendungscode geaendert.** `[cmd]` **Nichts in
`supabase/`, nichts committet.**

### Was offen bleibt

`[read]` **Die Regel gilt jetzt fuer Werkzeuge mit** ? aber sie
steht nur in diesem Waechter, nicht in `CLAUDE.md`. `[cmd]`
**Wenn Tom sie dort haben will, gehoert ein Satz in
`docs/lehren/werkzeuge.md`:** *,,Ein Werkzeug beendet nur, was es
selbst gestartet hat ? ueber den Port, nie ueber eine gemerkte
PID, nie mit `/T`."*

`[read]` **`apps/web/.next-dev/` liegt weiter im Baum, und
`.gitignore` fuehrt `.next/` und `.next-gate/` einzeln statt
`.next*/`** ? beides aus G-469/G-470 gemeldet, unveraendert.

`[read]` **Ein Neustart ist NICHT noetig** ? es wurde kein
Anwendungscode geaendert, und 3200 und 3220 laufen unveraendert
weiter.

## Abnahme

**2026-09-08, Orchestrator. Nachgemessen.**

`[cmd]` **3200 laeuft mit PID 1748816** ? **genau die aus
seinem Bericht.** **3220 unveraendert.**

`[cmd]` **Proben: web 1844/1844, coach 65/65.**

### Die Ursache war doppelt falsch

> *,,Die cmd-Huelle aus `shell: true` stirbt nach ~5 s, der
Server laeuft weiter. Am Ende des Laufs war die gemerkte PID
also TOT ? Windows vergibt freie PIDs NEU, und `/T` nimmt den
ganzen Baum unter der Nummer mit."*

    1s-5s   huelleLebt=true    portOffen=true
    6s      huelleLebt=FALSE   portOffen=true

`[read]` **Eine gemerkte Prozessnummer, die inzwischen einem
anderen gehoert** ? **und `/T` nimmt dessen ganzen Baum mit.**

`[read]` **Das erklaert, warum es Toms Server traf und nicht
irgendeinen.**

### Und er hat sich entschuldigt

> *,,Entschuldigung ? mein Werkzeug hat deinen Server
getoetet."*

### Die Behebung

`[cmd]` **Ueber den PORT beendet, ohne `/T`, und nur wenn das
Werkzeug selbst gestartet hat.**

`[cmd]` **Ohne `LUMEOS_START=1` startet es nichts und meldet
die drei noetigen Befehle.**

`[read]` **Und `netstat` statt PowerShell** ? *,,das brauchte
>60 s"*.

### Drei Proben waren blind

> *,,Zweimal prueft ich das VORKOMMEN statt den GEBRAUCH
(`pidAmPort` stand noch da, `LUMEOS_START` auch), einmal
flaggte sich meine eigene Sabotagedatei."*

`[read]` **Sechste Form desselben Fehlers heute.**

### Und A5 sauber getrennt

> *,,Vier Zeichenzahlen sind gewandert ? nicht von mir
(`git status apps/` leer), sondern durch Codex C-515."*

**Abgenommen.**

