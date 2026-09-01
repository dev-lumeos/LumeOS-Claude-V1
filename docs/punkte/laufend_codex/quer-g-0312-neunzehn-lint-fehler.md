---
nr: G-312
typ: befund
modul: quer
schwere: mittel
angelegt: 2026-09-01
braucht: []
kind_von: A-23
entscheidung: null
agent: codex
beauftragt: 2026-09-01
beruehrt:
  dateien:
    - .eslintrc.json
zahlen:
  gemessen: 2026-09-01
  web_fehler: 18
  coach_fehler: 1
---

# G-312 — neunzehn Lint-Fehler

## Befund

Aus B-20/A-23, Codex, 2026-09-01.

`[cmd]` **Seit der Einrichtung laeuft Lint im Gate:** Admin Exit 0,
**Web 18 Fehler und 3 Warnungen, Coach 1 Fehler.**

`[cmd]` **Der Gate ist deshalb rot — 22 Teilschritte statt 15.**

`[read]` **Das ist der richtige Zustand.** **Ein Gate, das gruen war,
weil ein Schritt nicht lief, war das halbe Gruen aus G-303.**

## Auftrag — den Gate wieder gruen machen

**Mitbeauftragt: G-313.** Bericht in diese Datei.

**Beauftragt am 2026-09-01.**

`[read]` **Du hast den Gate ehrlich gemacht. Jetzt raeum auf, was er
zeigt.**

`[cmd]` **Web 18 Fehler und 3 Warnungen, Coach 1 Fehler.**

`[read]` **Erst messen und einordnen, dann beheben:** **welche sind
echte Fehler, welche Regeln, die fuer dieses Repo nicht passen?**
`[read]` **Eine Regel abzuschalten, weil sie nervt, ist der falsche
Weg** — eine, die fuer Next.js gedacht ist und hier nichts schuetzt,
gehoert begruendet weg.

### G-313 — der rote Lifecycle-Test

`[cmd]` **Die Annahme ueber ausschliesslich alte Nullwerte passt
nicht mehr** — seit G-306 gibt es Plaene mit gesetztem Zyklus.

`[read]` **Die Annahme nachziehen, nicht den Test abschalten.**

`[read]` **Und pruef, ob `tools/abwesenheit-pruefen.mjs` ihn haette
fangen koennen** — **er sichert Aussagen ueber Fehlendes, und *alle
Werte sind NULL* ist eine.**

### Was nicht zu tun ist

**Keine Regel abschalten ohne Begruendung. Keinen Test loeschen.**
Nicht committen, nicht stagen, nicht pushen.

### Der Dev-Server gehoert dir nicht

`[cmd]` **Kein `neustart`, kein `start`, kein `aufraeumen`.**

### Nachweis

    je Fehler        echter Fehler oder unpassende Regel
    behoben          wie viele, wie
    abgeschaltet     welche Regel, mit Begruendung
    Lifecycle-Test   gruen, Annahme nachgezogen
    Gate             Exit und Teilschritte

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
