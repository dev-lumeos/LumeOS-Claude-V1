---
nr: C-560
typ: fehler
modul: quer
schwere: mittel
angelegt: 2026-10-04

braucht: [A-99]
kind_von: A-99

quellen:
  - docs/punkte/erledigt/quer-a-0099-der-testdatenpruefer-brach-ab-statt-rot-zu-werden.md

beruehrt:
  tabellen:
    - goals.nutrition_targets
  dateien:
    - supabase/_pipeline/_testdaten/testdaten-einspielen.ts
    - supabase/_pipeline/_validierung/testdaten-pruefen.ts
---

# Der Testdatenpruefer wird gruen

## Auftrag — Kopf

    AUFTRAG FUER Codex - C-560: testdaten-pruefen.ts laeuft gruen
    Bereich: supabase/_pipeline/
    Fremd:   apps/, packages/, tools/. docs/ gehoert dem Orchestrator,
             auch diese Punktdatei.
    Stand:   2026-10-04

## Der Befund — aus A-99, von dir gemessen

`[cmd]` **21 Befunde** nach A-99 (`48a9ab4c`):

| Art | Zahl | Ursache |
|---|---:|---|
| Seedluecke Zielwerte | 10 | `nutrition_targets` wird vor Zielen/Phasen erzeugt, das Insert schreibt 0 Zeilen |
| Seedluecke Einkaufsliste | 3 | C-251 nur in `eigenes-konto-fuellen.sql`, nicht im kanonischen Seed |
| Veraltete Proben | 8 | C-344-Zeilenzahl, Cycling-Nutzerkreis, Below-threshold-Soll, `GOAL` statt `AI`, zwei Trainingsdaten, zwei Supplement-Datumsannahmen |

## Was zu tun ist — wie C-558: bis gruen

1. **Zielwerte nach Zielen und Phasen erzeugen**, die drei historischen
   Szenarioziele sichern. Seit G-594 nimmt der Trigger eine genannte
   `phase_id` — **nenn sie im Seed**, statt auf die Mengenpruefung zu bauen.
2. **C-251 in `testdaten-einspielen.ts` uebernehmen**, sechs Positionen,
   referenziell verknuepft.
3. **Die 8 veralteten Proben** auf den gemessenen Stand ziehen — **je mit
   Grund im Bericht**: was hat sich am Bestand geaendert, und ist die
   Aenderung gewollt? **Eine Probe, deren Soll nur angepasst wird, damit
   sie gruen ist, ist kein Ergebnis.**
4. Kette fahren, `testdaten-pruefen.ts` fahren, bis 0 Befunde.

## Harte Regeln

Nie gegen Live. Wegwerf-Datenbanken danach loeschen, Anzahl nennen. Kein
Commit. Braucht eine Probe eine fachliche Entscheidung: melden.

**Erst nach G-602.**
