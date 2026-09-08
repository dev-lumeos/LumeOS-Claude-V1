---
nr: G-371
typ: befund
modul: recovery
schwere: mittel
angelegt: 2026-09-07
braucht: []
kind_von: A-71
entscheidung: null
agent: claudecode
beauftragt: 2026-09-07
erledigt: 2026-09-07
commit: 259d7d0f
beruehrt:
  dateien:
    - apps/web/src/app/v2/recovery/modalitaeten-kachel.tsx
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

## Auftrag

**Mitbeauftragt mit G-370 am 2026-09-07.** Der Auftragstext
und der Bericht stehen dort.

## Abnahme

**2026-09-07, mit G-370 abgenommen: grundlos, mein Befund war falsch.

`[cmd]` **`ModalitaetenKachel` ist angebunden:** `page.tsx:36` laedt,
`:45` reicht durch, `ansicht.tsx:434` zeigt — **auf `today`.**

`[cmd]` **89 Eintraege, 4 Arten, echte Deltas.**

`[cmd]` **Die 178 aus dem Auftrag sind der Tabellenstand:** `dev`
**89, `tom.seed` 89** — **RLS, kein Verlust.**

`[read]` **Claude Code hat den Befund in G-365 ohne den
`today`-Reiter gemeldet und ihn selbst widerlegt.**

**Geschlossen als grundlos.**
