---
nr: C-356
typ: messung
modul: nutrition
schwere: niedrig
angelegt: 2026-08-30
braucht: []
kind_von: C-353
entscheidung: null
agent: claudecode
beauftragt: 2026-08-30
beruehrt:
  dateien: [apps/web/src/app/v2/nutrition/naehrstoff-ordnung-tab.tsx]
zahlen:
  gemessen: 2026-08-30
  html_ms: 1620
  html_kb_1tag: 164
  html_kb_90tage: 700
---

# C-356 — woraus die 1.620 ms HTML bestehen

## Befund

Aus C-353, Claude Code, 2026-08-30.

`[cmd]` **Der Nutrients-Reiter braucht bei 90 Tagen 6.730 ms**, davon
**2.148 ms Datenbank** und **rund 1.620 ms HTML.**

`[cmd]` **Die Ursache ist gefunden: die Sparkline** — 90 Punkte je
Pfad statt einem, bei gleichen 102 Pfaden. **164 auf 700 kB.**

`[cmd]` **Ausgeschlossen:** die Zeilenzahl (konstant ~220 ms seit dem
nebenlaeufigen Laden) und die sichtbaren Zeilen (`tbody tr` bleibt bei
17).

## Was offen ist

`[read]` **Wie sich die 1.620 ms auf Serverrendering und Uebertragung
aufteilen.** `[read]` **Die Menge ist gemessen, ihre Aufteilung
nicht** — und er hat es so gesagt, statt zu schaetzen.

`[read]` **`schwere: niedrig`, weil der Reiter benutzbar ist** und
die Ursache bekannt. **Erst messen, wenn jemand die Sparkline aendern
will.**

## Auftrag

**Mitbeauftragt mit G-102 am 2026-08-30.** Der Auftragstext
und der Bericht stehen dort.

### Der Dev-Server gehoert dir

`[cmd]` **`server.py start` bevorzugen** — **er laesst einen gesunden
Server stehen** (G-280, Gegenprobe: 18 Starts unveraendert).

`[read]` **`neustart` nur, wenn `start` nicht reicht** — **er beendet
den Server hart, und Tom arbeitet auf demselben Port.**

`[cmd]` **Codex fasst ihn nicht an** — die Regel steht seit
2026-08-30 in `CLAUDE.md`.

## Bericht

**Claude Code, 2026-08-31.** Mitbeauftragt mit G-281. **Der
vollstaendige Bericht steht in [G-281](supplements-g-0281-der-treffergrund-in-der-katalogsuche.md#bericht).**

### Die Aufteilung ist eindeutig: praktisch ganz Server

`[cmd]` **Gemessen, `dev@lumeos.app`, warm, drei Laeufe:**

    Fenster  HTML    TTFB (Server)  Download  DOM-fertig
      1      164 kB      410 ms        11 ms      17 ms
     90      699 kB    4.183 ms        28 ms     100 ms

    Zuwachs: Server +3.773 ms · Download +17 ms · DOM +83 ms

`[cmd]` **Die Uebertragung faellt nicht ins Gewicht, weil komprimiert
wird:** 699 kB dekodiert gegen **120 kB uebertragen.**

`[cmd]` **Stabil:** TTFB bei 90 Tagen 4.183 / 4.416 / 4.130 ms.

### Und eine eigene Zahl ist damit berichtigt

`[read]` **In C-353 stand *„~1.620 ms HTML-Aufbau und -Uebertragung,
rund 3,0 ms je kB"*.** `[cmd]` **Der Anteil ist groesser und liegt
anders:** das Rendern kostet die Zeit, die Bytes kosten fast nichts.
**Die Zahl war aus einer Differenz gerechnet, nicht aus der
Zerlegung** — und eine Differenz sagt nicht, worin sie besteht.
