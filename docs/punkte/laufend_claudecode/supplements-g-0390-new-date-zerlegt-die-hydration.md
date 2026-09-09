---
nr: G-390
typ: befund
modul: supplements
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: G-388
entscheidung: null
agent: claudecode
beauftragt: 2026-09-08
beruehrt:
  dateien:
    - apps/web/src/app/v2/supplements/tab-injektionen.tsx
zahlen:
  gemessen: 2026-09-08
  treffer: 1
---

# G-390 — `new Date()` zerlegt die Hydration

## Befund

`[cmd]` **`tab-injektionen.tsx:111`:**

    () => tageSeitInjektion(stand?.orte ?? [],
                            stand?.protokoll ?? [], new Date()),

`[cmd]` **Und `ansicht.tsx:193-195` warnt woertlich davor:**

> *,,G-74: Der Stichtag der Rechnungen. Kommt serverseitig; ohne ihn
> der juengste Protokolltag ? **nie `new Date()`**, das zerlegte die
> Hydration und rechnete im Browser anders als beim Rendern."*

`[read]` **G-74 hat das schon einmal behoben. G-388 hat es wieder
eingebaut.**

`[read]` **Die Warnung stand in der Datei, in die der Reiter
eingehaengt ist.**

## Warum es alle elf Reiter trifft

`[read]` **Claude Code hat gemessen: der Fehler erscheint auf allen
elf Reitern, nur im Supplements-Modul.**

`[cmd]` **Der Grund: `tab-injektionen` wird in `ansicht.tsx`
importiert** ? **die Berechnung laeuft beim Rendern der Schale,
nicht erst beim Oeffnen des Reiters.**

`[read]` **Ein Fehler in einem Reiter faellt auf die ganze Schale
zurueck.**

## Auftrag

**Beauftragt am 2026-09-08.**

### 1 · Den Stichtag durchreichen

`[cmd]` **`ansicht.tsx:196` hat ihn schon:**

    const stichtag = heuteProp
      ?? datenProp?.einnahmen.map(e => e.intake_date).sort().pop()
      ?? '1970-01-01'

`[read]` **Reich ihn an `tab-injektionen` durch** ? **wie an die
anderen Reiter.**

`[read]` **Und miss, ob `tageSeitInjektion` mit einem `string`
umgehen kann oder ein `Date` braucht.**

### 2 · Ein Waechter

`[read]` **G-74 hat es behoben, G-388 hat es wieder eingebaut** ?
**eine Warnung im Kommentar reicht nicht.**

`[cmd]` **`new Date()` ohne Argument in `apps/web/src/app/v2/`
darf es nicht geben.**

`[read]` **Miss, wie viele es heute gibt** ? **und ob alle falsch
sind oder manche berechtigt.**

`[read]` **Wenn berechtigte dabei sind: der Waechter braucht eine
Form, die sie durchlaesst** ? **nicht eine Ausnahmeliste.**

### 3 · Die zwei anderen Fundstellen

`[cmd]` **`tab-compliance.tsx:132` und `:204` nennen
`Math.random()` und `Date.now()` NUR im Kommentar** ? **als
Begruendung, warum sie es NICHT tun.**

`[cmd]` **`tab-spec.tsx:521` ebenso.**

`[read]` **Pruefen, nicht anfassen** ? **sie sind der Beleg, dass
die Regel bekannt war.**

### Abnahmebedingungen

    A1  der Fehler ist weg. Bildschirmfoto, Konsolenfehler 0.
    A2  auf allen elf Reitern. Zahl: 11 / davon sauber.
    A3  der Waechter faellt bei einem eingebauten `new Date()`.
        Gegenprobe, zurueckgebaut.
    A4  wie viele `new Date()` gibt es in v2? Zahl: gefunden /
        davon berechtigt, je mit Grund.
    A5  1518 Tests bleiben gruen.

### Was nicht zu tun ist

**Nichts in `supabase/`** ? **Codex arbeitet an C-441.**
**Kein `git stash`** ? **er hat gestern eine Kollision erzeugt.**
Nicht committen, nicht stagen, nicht pushen.

### Der Dev-Server

`[cmd]` **NIE `start`, `neustart`, `aufraeumen`.**

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
