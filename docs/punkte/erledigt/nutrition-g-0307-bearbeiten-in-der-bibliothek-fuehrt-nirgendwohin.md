---
nr: G-307
typ: feature
modul: nutrition
schwere: mittel
angelegt: 2026-08-31
braucht: []
kind_von: C-372
entscheidung: E-41
agent: claudecode
beauftragt: 2026-09-01
erledigt: 2026-09-02
commit: 69abd8f0
beruehrt:
  dateien:
    - apps/web/src/app/v2/nutrition/tab-plans.tsx
zahlen: null
---

# G-307 — *Bearbeiten* in der Bibliothek fuehrt nirgendwohin

## Befund

Aus C-372, Claude Code, 2026-08-31.

`[cmd]` **E-41 verlangt:** *,,Bearbeiten fuehrt in den Planner, statt
in der Bibliothek selbst zu editieren."*

`[cmd]` **Das ist nicht verdrahtet.**

`[read]` **Ohne diesen Weg sind Bibliothek und Werkbank zwei Raeume
ohne Tuer.**

## Was zu tun ist

**Der Knopf oeffnet den Planner mit genau diesem Plan.**

`[cmd]` **Der Planner nimmt heute `plaene[0]`** — **es gibt keine
Auswahl** (G-304, Flow 3 Schritt 2).

`[read]` **Also gehoert beides zusammen:** die Auflistung im Planner
(E-41) **und der Sprung aus der Bibliothek dorthin.**

## Auftrag

**Mitbeauftragt mit G-302.** **Beauftragt am 2026-09-01.**

`[cmd]` **E-41: *Bearbeiten fuehrt in den Planner*.** **Nicht
verdrahtet.**

`[cmd]` **Und der Planner nimmt `plaene[0]`** — **es gibt keine
Auswahl** (G-304, Flow 3 Schritt 2). `[read]` **Beides gehoert
zusammen:** die Auflistung im Planner **und der Sprung aus der
Bibliothek dorthin.**

`[read]` **Ohne diesen Weg sind Bibliothek und Werkbank zwei Raeume
ohne Tuer.**

### Der Dev-Server gehoert dir

`[cmd]` **`server.py start` bevorzugen.**

### Nachweis

    Auflistung im Planner   alle Plaene, waehlbar
    Sprung                  Bibliothek -> Planner mit diesem Plan
    Zielzeile               bricht nicht mehr um, Bildschirmfoto

## Abnahme

**2026-09-02, mit G-311 abgenommen: gebaut.**

`[cmd]` **Der Werkbank-Sprung geht ueber `?plan=`**, mit Rueckfall
auf den ersten Plan bei veralteter Kennung.

`[read]` **Und die Ursache lag tiefer als der Punkt sagte:** der
Knopf setzte einen Client-Zustand, **der Plan wird auf dem Server
geladen** — sie konnten sich nie treffen.
