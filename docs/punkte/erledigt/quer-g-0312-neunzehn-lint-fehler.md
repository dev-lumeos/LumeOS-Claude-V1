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
erledigt: 2026-09-02
commit: 43e6154e
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

**2026-09-02, Orchestrator. Nachgemessen.**

`[cmd]` **`pnpm lint`: Exit 0 fuer Web, Admin und Coach.**

### Alle 19 waren echte Fehler

`[cmd]` **`react/no-unescaped-entities`, jeder einzelne berechtigt.**
`[cmd]` **Keine Regel abgeschaltet** — die JSX-Texte tragen jetzt
Entities.

`[read]` **Das war die Frage im Auftrag: echte Fehler oder
unpassende Regeln?** **Die Antwort ist eindeutig, und sie haette auch
anders ausfallen koennen.**

`[cmd]` **Und die drei Warnungen sind mit behoben** — aktuelle
Trefferliste, aktueller `setTab`-Rueckruf, stabile
Stack-Positionsliste.

### G-313 — die Annahme nachgezogen, nicht der Test abgeschaltet

`[cmd]` **Lifecycle-Test 2/2 gruen.** `[cmd]` **Er prueft jetzt
gueltige gespeicherte Zyklen, mindestens einen gesetzten und einen
erfolgten Rollover** — statt *,,alle Werte NULL"*.

`[read]` **Der Test sichert damit den Zustand, der eingetreten ist,
statt den, der vorbei war.**

### Und die Antwort auf meine Waechterfrage ist Nein

`[cmd]` **`abwesenheit-pruefen` kann den Fall nicht fassen:** **er
prueft Pipeline-Struktur, keine veraenderlichen Zeilenwerte.**
`[cmd]` **Alle 10 Strukturmarken gelten.**

`[read]` **Meine Vermutung — *,,alle Werte sind NULL* ist eine
Abwesenheitsaussage"* — war falsch.** `[read]` **Der Waechter
unterscheidet Struktur von Inhalt, und das ist richtig so:** eine
Marke, die Zeilenwerte prueft, faellt bei jedem Seed.

### Der gemeldete rote Test ist inzwischen gruen

`[cmd]` **Er meldete den Gate rot wegen `plan-detail-lage.test.ts`
aus G-287** — und hat ihn nicht angefasst, weil er fachfremd war.

`[cmd]` **Nachgemessen: `pnpm --filter @lumeos/web test` Exit 0, 0
Fehlschlaege.** `[read]` **Claude Code hat die Datei im selben
Zeitraum bearbeitet** — der Test war zwischen zwei Baustellen
eingeklemmt.

`[read]` **Richtig, ihn stehen zu lassen.**

**Abgenommen.**

