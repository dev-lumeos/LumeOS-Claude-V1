---
nr: G-202
typ: feature
modul: supplements
schwere: mittel
angelegt: 2026-08-27
braucht: []
kind_von: null
kinder: []
entscheidung: null
agent: codex
beauftragt: 2026-08-30
beruehrt:
  tabellen: []
  dateien: ["tools/supplement-kern-dubletten-pruefen.mjs", "backup/c276/supplement-kern-dubletten.json"]
zahlen: null
---

# G-202 - der Dublettenpruefer schreibt bei jedem Gate-Lauf

## Befund

(neu 2026-08-27).

  `[cmd]` **`tools/supplement-kern-dubletten-pruefen.mjs` schreibt
  `backup/c276/supplement-kern-dubletten.json` bei jedem Lauf neu** —
  nur `checked_at` aendert sich, der Inhalt bleibt (412 / 0 / 4
  Gruppen). **Damit erzeugt jeder Commit eine geaenderte Datei im
  Arbeitsverzeichnis**, weil der Pre-Commit-Hook das Gate faehrt.

  `[read]` **Das ist Rauschen, das jeden `git status` verunreinigt** —
  und ein Nachweis, der bei jedem Lauf einen neuen Stichtag traegt,
  belegt nicht mehr, wann er erhoben wurde.

  **Zu tun:** entweder nur bei Aenderung schreiben, oder nur mit
  ausdruecklichem Schalter — nicht bei jedem Gate.

## Auftrag — drei Werkzeugschaeden

**Mitbeauftragt: A-49, C-316.** Bericht in diese Datei.

`[read]` **Beauftragt am 2026-08-30.**

### 1 · G-202 — der Dublettenpruefer schreibt bei jedem Gate-Lauf

`[cmd]` **`backup/c276/supplement-kern-dubletten.json` aendert sich
bei jedem `pnpm gate`, weil nur `checked_at` neu gesetzt wird.**

`[read]` **Der Orchestrator setzt die Datei seit dem 27.08. vor jedem
Commit zurueck** — **dutzende Male, von Hand, in jedem Ablauf.**
`[cmd]` **Und Claude Code hat sie zweimal als fremde Aenderung
gemeldet**, weil sie im `git status` auftauchte, ohne dass jemand sie
angefasst hatte.

`[read]` **Ein Werkzeug, das bei jedem Lauf eine Datei aendert, ohne
dass sich etwas geaendert hat, erzeugt Rauschen** — und Rauschen
kostet Aufmerksamkeit, die anderswo fehlt.

`[read]` **Der Zeitstempel gehoert nicht in die Datei, oder die Datei
gehoert nicht ins Repo.** **Miss, was sie traegt, bevor du
entscheidest.**

### 2 · A-49 — der Attrappen-Waechter traegt eine veraltete Behauptung

`[read]` **Das ist A-62 in seiner ersten Erscheinung:** ein Waechter,
der eine Abwesenheit sichert, **und die Sache ist inzwischen da.**

`[cmd]` **Am 30.08. sind drei weitere Faelle aufgetreten** — eine
Karte, die *,,fehlt im Schema"* sagte, ein Waechter, der `lifecycle`
verbot, und einer, der seinen Beleg in einem Kommentar fand.

`[read]` **Miss, was dieser hier behauptet und ob es noch stimmt.**

### 3 · C-316 — NAC ohne deutschen Namen

`[cmd]` **Die Substanz steht im Katalog mit `slug = nac` und ohne
`name_de`.**

`[read]` **Kein Katalogausbau** — ein fehlender Name ist eine
Datenluecke, kein Ausbau. `[read]` **Und miss, ob es weitere gibt:**
eine einzelne fehlende Zeile ist ein Tippfehler, **zwanzig sind ein
Importfehler.**

### Was nicht zu tun ist

**Keine Namen erfinden** — was nicht belegt ist, bleibt leer.
**Kein Katalogausbau.**
`apps/` nicht anfassen.
Nicht committen, nicht stagen, nicht pushen.

### Nachweis

    Dublettendatei       aendert sie sich noch bei jedem Lauf?
    Waechter A-49        was behauptet er, stimmt es
    Substanzen ohne      Zahl - einer oder viele?
      name_de
    Gate                 gruen, und der Baum bleibt sauber

`[read]` **Die letzte Zeile ist der eigentliche Nachweis fuer
G-202:** **nach diesem Auftrag soll `git status` nach einem
Gate-Lauf leer sein.**

### Regeln

`tools/lauf.py`, keine Konsolenfenster.
**Wegwerf-Datenbank, Vollsicherung vor jedem Live-Eingriff.**

**Wenn eine Vorgabe nicht aufgeht: melden, nicht passend machen.**

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
