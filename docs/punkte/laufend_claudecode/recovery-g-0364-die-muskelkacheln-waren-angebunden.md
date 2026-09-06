---
nr: G-364
typ: befund
modul: recovery
schwere: hoch
angelegt: 2026-09-07
braucht: []
kind_von: null
entscheidung: E-69
agent: claudecode
beauftragt: 2026-09-07
beruehrt:
  dateien:
    - apps/web/src/app/v2/recovery/tab-messwerte.tsx
zahlen:
  gemessen: 2026-09-07
  commit: f725899d
---

# G-364 — die Muskelkacheln waren angebunden

## Befund

**Tom, 2026-09-07:**

> DIE WAREN ANGEBUNDEN UND HABEN VOLLUMFAENGLICH FUNKTIONIERT

> http://127.0.0.1:3200/v2/recovery ALS MUSCLE READINESS UND KONNTE
> FULL MAP KLICKEN UND LANDETE AUF
> http://127.0.0.1:3200/v2/recovery?tab=muscles

`[cmd]` **Gemessen: `f725899d`, 2026-08-18** — *,,three muscle
levels, visible shapes, checkins bound"*.

`[cmd]` **Und `tab-messwerte.tsx` liest heute noch echt:**

    von ./kontext              useRecovery
    von ./muskel-zuordnung     alsErmuedung, KARTE_ZU_RECOVERY

`[read]` **Die Anbindung ist da.**

`[cmd]` **Aber daneben:**

    von ./motor      MUSCLE_GROUPS_BODYMAP, MUSCLE_LABEL, MUSCLE_STA...
    von ./ansicht    ATTRAPPE

`[read]` **Entwurfskonstanten und ein Attrappen-Vermerk in derselben
Datei.**

## Was das heisst

`[read]` **Niemand hat die Anbindung entfernt.** `[read]` **Jemand
hat einen Vermerk daraufgesetzt und die angezeigten Werte auf
Entwurfsdaten zurueckgestellt** — **waehrend der Leseweg
danebenliegt.**

`[cmd]` **Die Kachel sagt: *,,noch nicht an die vorhandenen
Recovery-Daten angebunden — die Zahlen sind erfunden."***

`[read]` **Das ist falsch, und es steht seit Wochen da.**

`[read]` **Und es ist die schlimmste Sorte von Vermerk** — **er
behauptet einen Mangel, den es nicht gibt, und verhindert damit,
dass jemand nachsieht.**

## Auftrag

**Beauftragt am 2026-09-07.**

`[read]` **Miss zuerst, was `useRecovery` und `KARTE_ZU_RECOVERY`
heute liefern** — **und warum die Kachel trotzdem
`MUSCLE_GROUPS_BODYMAP` anzeigt.**

`[cmd]` **`f725899d` vom 18.08. zeigt, wie es lief** — **`git show`
sagt, was seither dazwischenkam.**

`[read]` **Dann: die echten Werte anzeigen, den Vermerk entfernen.**

`[read]` **Und pruef dasselbe fuer *Muscle readiness* auf dem
Today-Reiter und *Per-muscle detail*** — **beide tragen denselben
Vermerk.**

### Und dann such nach demselben Muster

`[read]` **Ein Attrappen-Vermerk auf einer angebundenen Kachel ist
schlimmer als eine fehlende Kachel** — **er luegt ueber den
Zustand.**

`[cmd]` **`ATTRAPPE` wird aus `ansicht.tsx` importiert** — **zaehl,
wie viele Kacheln ihn tragen und gleichzeitig echte Daten lesen.**

### Nachweis

    was liefert useRecovery      gemessen, mit Zahl
    warum Entwurfsdaten          Fundstelle
    echte Werte am Schirm        Bildschirmfoto
    dasselbe Muster              wie viele Kacheln, gezaehlt

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
