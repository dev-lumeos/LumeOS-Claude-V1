---
nr: G-280
typ: befund
modul: quer
schwere: mittel
angelegt: 2026-08-30
braucht: []
kind_von: G-277
entscheidung: null
beruehrt:
  dateien: [tools/server.py]
zahlen:
  gemessen: 2026-08-30
  speicher_gb: 1.5
  login_ms: 1600
---

# G-280 — der Dev-Server ueberlebt lange Testlaeufe nicht

## Befund

Aus G-277, Claude Code, 2026-08-30.

`[cmd]` **Der Server musste waehrend eines Auftrags mehrfach neu
gestartet werden.** `[cmd]` **Vor dem Neustart: 1,5 GB Speicher,
`/login` in 1,6 Sekunden.**

`[cmd]` **G-205 kennt das Beenden von selbst.** `[read]` **Hier ist es
anders: er laeuft weiter und wird langsam.**

## Warum es zaehlt

`[read]` **Jede Messung gegen einen ausgehungerten Server ist
wertlos** — **und man sieht ihm nicht an, dass er es ist.**

`[cmd]` **Claude Code hat alle Zahlen des Auftrags gegen einen frisch
gestarteten Server gemessen und es dazugesagt.** `[read]` **Das ist
die richtige Handhabung, aber sie haengt daran, dass jemand daran
denkt.**

## Zu messen

**Ab wann wird er langsam, und woran liegt es?**

`[read]` **Kandidaten:** die Zahl der kompilierten Routen, offene
Datenbankverbindungen, der Speicher selbst. `[read]` **Und ob
`tools/server.py` einen Zustand melden kann, der *,,ausgehungert"*
heisst** — dann waere die Handhabung nicht mehr auf Aufmerksamkeit
angewiesen.

## Auftrag — den Server messbar machen

`[read]` **Vorbereitet am 2026-08-30.**

### Das Ergebnis

`[read]` **Nach diesem Auftrag sagt `tools/server.py`, ob der Server
noch belastbar ist** — **statt dass jemand daran denken muss.**

### Warum es zaehlt

`[cmd]` **Claude Code musste ihn am 30.08. mehrfach neu starten.**
`[cmd]` **Vor dem Neustart: 1,5 GB, `/login` in 1,6 Sekunden.**

`[read]` **Jede Messung gegen einen ausgehungerten Server ist wertlos,
und man sieht ihm nicht an, dass er es ist.** `[read]` **Er hat alle
Zahlen gegen einen frischen gemessen und es dazugesagt** — **richtig,
aber es haengt an seiner Aufmerksamkeit.**

### Was zu messen ist

**Ab wann wird er langsam, und woran liegt es?**

`[read]` **Kandidaten, ungeordnet:** Zahl der kompilierten Routen,
offene Datenbankverbindungen, Speicher, etwas anderes.

`[read]` **Und *,,unklar"* ist eine zulaessige Antwort**, wenn sie
sagt, was ausgeschlossen wurde. `[cmd]` **In G-252 waren fuenf
Kandidaten falsch und die Ursache stand auf keinem.**

### Was zu bauen ist, wenn die Messung es traegt

`[cmd]` **`tools/server.py` kennt `status`** — **ein Zustand
*,,ausgehungert"* waere die kleinste nuetzliche Ergaenzung.**

`[read]` **Kein automatischer Neustart** — **wer misst, soll wissen,
dass er neu starten muss, nicht ueberrascht werden.**

### Was nicht zu tun ist

**Kein `.next` loeschen, kein `next build` direkt.**
`apps/` nicht anfassen.
Nicht committen, nicht stagen, nicht pushen.

### Nachweis

    Schwelle             ab wann wird er langsam, gemessen
    Ursache              benannt oder als unklar gemeldet
    Zustandsmeldung      gebaut oder begruendet nicht
    Gegenprobe           frischer Server meldet gesund

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
