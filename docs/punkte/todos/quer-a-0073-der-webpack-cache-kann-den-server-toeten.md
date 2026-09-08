---
nr: A-73
typ: befund
modul: quer
schwere: mittel
angelegt: 2026-09-08
braucht: []
kind_von: null
entscheidung: null
beruehrt:
  dateien:
    - tools/server.py
zahlen:
  gemessen: 2026-09-08
  cache_dateien: 103
  cache_gb: 0.18
---

# A-73 — der Webpack-Cache kann den Server toeten

## Befund

**2026-09-08, Claude Code, nach einem Serverausfall.**

`[cmd]` **Im Log:**

    Restoring pack from .next/cache/webpack/client-development.pack.gz
    failed: TypeError: Cannot read properties of undefined
    (reading 'hasStartTime')

`[read]` **Der Server erreichte *Ready* und starb Sekunden spaeter
beim Kompilieren von `/login`.**

`[read]` **Deshalb liefen `status` und Log auseinander:** `[cmd]`
**`status` fragt den Port und sagte *keiner laeuft*, das Log zeigte
einen erfolgreichen Start** — **beide hatten recht.**

## Die Behebung

`[cmd]` **Nur `.next/cache/webpack` geloescht** — **103 Dateien,
0,18 GB.** `[cmd]` **Nicht `.next` selbst.**

`[read]` **Und er hat vorher gemessen:** **der Server war gestoppt,
`admin` (3210) und `coach` (3220) waren die einzigen anderen
Next-Prozesse, keiner beruehrt `apps/web/.next`.**

`[cmd]` **Danach: Port 3200, Antwort in 0,2 s, `/login` HTTP 200.**

## Warum es ein Punkt ist

`[cmd]` **`tools/server.py` kennt den Cache nicht** — **`aufraeumen`
raeumt Chrome-Leichen ab.**

`[read]` **Der Fall ist behebbar, aber niemand weiss wie, bis
jemand das Log liest.**

`[cmd]` **Und `CLAUDE.md` sagt nur: *`.next` wird nie geloescht***
(B-18/G-109) — **ueber den Cache darin steht nichts.**

## Vorschlag

`[read]` **`server.py start` liest das Log nach `hasStartTime` und
sagt, was zu tun ist.**

`[read]` **Oder ein eigener Befehl `cache-weg`** — **der nur
`.next/cache/webpack` entfernt und vorher prueft, dass der Server
steht.**

`[read]` **Nicht automatisch loeschen** — **ein Cache, der von
selbst verschwindet, verbirgt, dass etwas nicht stimmt.**

## Nebenbefund

`[cmd]` **275 node-Prozesse auf der Maschine** — **20 `tsserver.js`,
10 typings-installer aus Editoren, 3 Next-Server aus
`D:\GitHub\AMF`.**

`[cmd]` **RAM war nie das Problem: 138 von 255 GB frei, node
insgesamt 11 GB.**

`[read]` **Er hat das gemessen, bevor er etwas angefasst hat** —
**die Behebung war keine Vermutung ueber Speicherdruck.**

## Zweite Ursache, gemessen 2026-09-08

Tom: *,,es geht mir auf den sack dass claude jedesmal den server
abschiesst und dann 20 minuten den fehler sucht."*

`[cmd]` **Claude Code hat seine eigene frueherer Diagnose
widerlegt:** **das `&` war es nicht.**

`[cmd]` **Gemessen: das Log endet auf einer normal bedienten
Anfrage, kein Absturz** — **um 16:45:14, als die Sitzung endete.**

`[cmd]` **Die Prozesskette:** `claude.exe -> bash -> bash -> bash
-> python` — **alles ein Enkel von `claude.exe`.**

`[cmd]` **`DETACHED_PROCESS | CREATE_NEW_PROCESS_GROUP` loest nur
die Konsole** — **nicht das Job Object, ueber das Windows den Baum
abraeumt.**

`[cmd]` **44 Startmarken im Log** — **jede Sitzung startete neu.**

### Die Entscheidung

Tom startet ihn einmal in seiner eigenen Konsole:

    python tools/server.py start

`[read]` **Dann lebt er in Toms Baum.**

`[read]` **Keine geplante Aufgabe, kein Dienst** — **eine
dauerhafte Aenderung an Toms Maschine waere mehr, als das Problem
kostet.**

`[read]` **Und Claude Code hat es nicht ungefragt installiert** —
richtig.
