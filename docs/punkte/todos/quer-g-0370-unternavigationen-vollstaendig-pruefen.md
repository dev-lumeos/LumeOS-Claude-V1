---
nr: G-370
typ: befund
modul: quer
schwere: mittel
angelegt: 2026-09-07
braucht: []
kind_von: G-365
entscheidung: E-69
beruehrt:
  dateien:
    - apps/web/src/app/v2/medical/ansicht.tsx
zahlen:
  gemessen: 2026-09-07
  reiter: 85
  geprueft: 3
---

# G-370 — Unternavigationen vollstaendig pruefen

## Befund

Aus G-365, Claude Code, 2026-09-07, selbst offengelegt:

> *,,Der vollstaendige Unternavigations-Durchlauf ueber alle 85
> Reiter lief in eine Zeitgrenze. Geprueft sind die DREI gemeldeten
> Faelle."*

`[read]` **Das ist eine Luecke im Nachweis, keine Aussage ueber
Fehler** — **seine eigene Formulierung.**

## Die Klasse

`[cmd]` **Drei Faelle gefunden, alle gleich:** **die Referenz hing
in `ansicht.tsx`, wo der Unterreiter nicht bekannt ist** — **er ist
Zustand der Komponente und steht nicht in der Adresse.**

    medical/tracking   zeigte auf beiden Unterreitern denselben
                       Symptom-Mockup
    medical/import     zeigte alle sieben Kacheln, egal welcher
                       Unterreiter oben stand
                       auf "Manual entry": oben 1, unten 7
    goals/poses        zeigte immer `mandatory`, waehrend oben
                       `quarter` oder `detail` stand

`[cmd]` **Mit Sabotageprobe belegt:** `unter === 'history'` **auf
`true` gesetzt, die falsche Kachel erschien, zurueckgedreht.**

## Zu messen

`[read]` **Welche der 85 Reiter tragen eine Unternavigation?**

`[read]` **Und je solchem Reiter: folgt die Referenz unten dem
Unterreiter oben?**

`[cmd]` **Ein Reiter mit Unternavigation ist daran erkennbar, dass
er einen Zustand fuehrt, der nicht in der Adresse steht.**

`[read]` **Die drei behobenen sind der Massstab** — **dieselbe
Sabotageprobe je Fall.**

## Warum es zaehlt

`[read]` **Tom klickt durch und sieht unten etwas, das nicht zu oben
gehoert** — **und kann nicht vergleichen.**

`[cmd]` **E-69: die Referenz steht da, damit er Ist gegen Soll
sieht.** `[read]` **Eine falsche Referenz ist schlimmer als keine.**
