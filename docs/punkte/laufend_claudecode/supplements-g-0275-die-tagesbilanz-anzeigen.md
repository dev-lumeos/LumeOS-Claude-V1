---
nr: G-275
typ: feature
modul: supplements
schwere: hoch
angelegt: 2026-08-30
braucht: []
kind_von: C-351
entscheidung: E-35
beruehrt:
  tabellen: [supplements.intake_logs]
  dateien: [apps/web/src/app/v2/supplements/tabs.tsx]
zahlen:
  gemessen: 2026-08-30
  intake_logs: 744
  unklare_einnahmen: 513
agent: claudecode
beauftragt: 2026-08-30
---

# G-275 — die Supplement-Tagesbilanz anzeigen

## Befund

`[cmd]` **`supplements.daily_intake_summary` steht seit dem 30.08.
live** und wird von keiner Oberflaeche gerufen.

`[cmd]` **744 Einnahmen, davon 513 ohne belegte Naehrstoffmenge.**

`[read]` **Codex hat die Ehrlichkeit eingebaut:** die 513 bleiben
sichtbar, **statt als 0 zu gelten.** `[cmd]` **Nachweis am 19.08.:
FAPUN3 = 2 g bei vier Einnahmen — eine belegt, drei unbekannt.**

`[read]` **Diese Unterscheidung muss die Anzeige tragen**, sonst geht
sie unterwegs verloren.

## Auftrag

**Die Bilanz im Supplements-Reiter, mit der Trennung belegt gegen
unbekannt.**

`[read]` **E-35 gilt:** jedes Modul rechnet seine eigene Bilanz.
**Kein Griff nach `nutrition.daily_summary`** — die Summierung kommt
spaeter und gehoert ins Dashboard.

`[read]` **Und die Form steht schon:** die Mikronaehrstoff-Ansicht in
Nutrition zeigt seit G-239 vier Zustaende und trennt *unvollstaendig*
von *gedeckt*. **Dieselbe Unterscheidung, andere Quelle.**

### Was zu messen ist, bevor gebaut wird

`[cmd]` **Welche Naehrstoffe erreichen ueberhaupt eine Bilanz?**
`[cmd]` **`supplement_nutrients` traegt 17 Substanzen** — **das ist
wenig, und die Anzeige muss es sagen, statt eine leere Tabelle zu
zeigen.**

`[read]` **Und ob es einen Reiter gibt, der das schon zeigt** —
**Doppelungspruefung vor dem Bau, wie in G-253.**

### Was nicht zu tun ist

**Keine Summierung mit Nutrition.**
**Keine Menge raten** — 513 unbekannte bleiben unbekannt.
**Nichts auf `dev@lumeos.app` schreiben.**
Nicht committen, nicht stagen, nicht pushen.

### Nachweis

    Bilanz je Tag             echte Zahlen, ein Tag belegt
    belegt gegen unbekannt    unterscheidbar - Bildschirmfoto
    Naehrstoffe ohne Bilanz   sichtbar, nicht als 0
    Doppelung                 zeigt ein Reiter das schon?
    Attrappen                 vorher / nachher, am Schirm
    Ladezeit                  ms, kalt und warm

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
