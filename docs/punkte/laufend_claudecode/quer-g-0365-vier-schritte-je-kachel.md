---
nr: G-365
typ: feature
modul: quer
schwere: hoch
angelegt: 2026-09-07
braucht: []
kind_von: G-364
entscheidung: E-69
agent: claudecode
beauftragt: 2026-09-07
beruehrt:
  dateien:
    - apps/web/src/app/v2/training/ansicht.tsx
zahlen:
  gemessen: 2026-09-07
  verdaechtig: 23
---

# G-365 — vier Schritte je Kachel

## Anlass

`[cmd]` **G-364: drei Kacheln trugen einen Attrappen-Vermerk und
lasen echte Daten** — **`<RecMuscleMap />` wurde ohne Prop gerufen,
der Leseweg lag ungenutzt daneben.**

`[cmd]` **Und 23 weitere Kacheln tragen denselben moeglicherweise
falschen Vermerk.**

Tom, 2026-09-07: *,,und jetzt laesst claude jedes modul / jeden
subnavigationspunkt sauber pruefen."*

## Die vier Schritte, je Kachel

    1  Ist die Mockup-Kachel oben ueberhaupt vorhanden?
    2  Wenn angebunden: steht die Mockup-Kachel unten als Soll?
    3  Wenn Attrappe: war sie schon mal angebunden?
    4  Wenn Attrappe: was fehlt zum Anbinden?

`[read]` **Schritt 3 ist der wichtige** — **G-364 hat gezeigt, dass
ein Vermerk luegen kann.**

`[cmd]` **`git log -S` mit dem Kachelnamen oder der Lesefunktion
sagt es in Sekunden.**

## Je Modul, je Reiter

    recovery       9 Reiter
    training       8 Kacheln in ansicht.tsx -- staerkster Verdacht
    nutrition
    supplements
    medical
    goals
    dashboard

`[cmd]` **`training/ansicht.tsx` zuerst** — **`verlauf` und
`readiness` werden dort bereits durchgereicht.**

## Was das Ergebnis sein soll

**Eine Tabelle je Modul:**

    Kachel | oben? | unten? | war angebunden? | was fehlt

`[read]` **Damit kann Tom entscheiden, was er anpackt** — **statt
zu messen, ob ein Vermerk stimmt.**

## Nach jedem Modul melden

`[read]` **Nicht am Ende.** `[cmd]` **Tom nimmt einzeln ab.**

## Was nicht zu tun ist

`[read]` **Wo etwas anbindbar ist und der Leseweg danebenliegt:
anbinden** — **das war G-364.**

`[read]` **Wo ein Leseweg fehlt: melden, nicht bauen.**

**Nichts auf `dev@lumeos.app` schreiben.**
Nicht committen, nicht stagen, nicht pushen.

### Nachweis je Modul

    Tabelle         alle vier Spalten, je Kachel
    falsche Marken  gezaehlt und entfernt
    angebunden      wie viele, Bildschirmfoto
    fehlt           was genau, je Kachel

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
