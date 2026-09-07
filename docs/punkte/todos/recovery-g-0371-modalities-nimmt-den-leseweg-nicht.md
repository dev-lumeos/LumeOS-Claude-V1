---
nr: G-371
typ: befund
modul: recovery
schwere: mittel
angelegt: 2026-09-07
braucht: []
kind_von: A-71
entscheidung: null
beruehrt:
  dateien:
    - apps/web/src/app/v2/recovery/tab-modalitaeten.tsx
zahlen:
  gemessen: 2026-09-07
---

# G-371 — `modalities` nimmt den Leseweg nicht

## Befund

Aus G-365, Claude Code, 2026-09-07:

> *,,recovery/modalities hat einen angebundenen Leseweg, den die
> Kachel nicht nimmt."*

`[read]` **Fuenfter Fall von A-71** — **der Leseweg liegt ungenutzt
daneben.**

    G-364   <RecMuscleMap /> ohne Prop                3 Kacheln
    G-365   Today-Sitzung aus festem Objekt           1
    G-365   Modalitaeten, modality_log ungenutzt      4
    G-365   Rechenweg las TDEE_STATE statt tdee-Prop  1
    G-365   modalities nimmt den Leseweg nicht        ?

`[cmd]` **Vier Modalitaetskacheln wurden am 07.09. angebunden** —
**eine weitere nicht.**

## Zu messen

`[read]` **Welche Kachel, und welcher Leseweg liegt daneben?**

`[cmd]` **`recovery.modality_log` traegt 178 Zeilen.**

`[read]` **Und ob dieselbe Ursache vorliegt:** **eine Komponente
ohne Prop gerufen, waehrend die Funktion daneben steht.**
