---
nr: C-560
typ: fehler
modul: quer
schwere: mittel
angelegt: 2026-10-04
agent: codex
beauftragt: 2026-10-04
erledigt: 2026-10-04
commit: 404e181c

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

## Abnahme - 2026-10-04, Commit `404e181c`

`[cmd]` **Diff:** genau zwei Dateien, +108/-41. Gate beim Commit gruen.
Sein Lauf: 183 Proben, 21 -> 0 Befunde, frische Kette 346 Schritte gruen,
Seed-Quelltest 11/11, 2 Wegwerf-Datenbanken geloescht, 0 verbleibend.

`[read]` **Zielwerte:** das alte Formel-Insert (G-511) stand vor den
Phasen und schrieb 0 Zeilen; es ist entfernt. Neu: drei manuelle
Snapshots fuer die Phasen `...0101`, `...0102`, `...0201`, je mit
`phase_id`. **Die aktiven Ziele von test-user erzeugen damit weiterhin
0 Zielwerte** - Folge der unmoeglichen Doppelkonstellation, geht in C-561.

`[read]` **Einkaufsliste:** C-251 jetzt im kanonischen Seed, 6 Positionen
mit BLS-Codes.

`[read]` **Proben mit tragfaehigem Grund:** C-344 3 -> 4 (Magnesium EFSA
und NAM), Cycling nur noch test-user, zwei Trainings- und zwei
Supplement-Proben am lokalen Lauftag (`TODAY_DATE = tagIso()`).

`[read]` **Zwei Proben ohne tragfaehigen Grund - C-561:**
Mangel-Szenario `total_assessed >= 17` -> `= 7` (warum werden 10
Naehrstoffe weniger bewertet?) und Omega-3 `GOAL` -> `AI`, obwohl die
Meldung der Probe weiter ,gegen Goals-Ziel" sagt. Beide sind im Commit,
weil sie den Bestand korrekt beschreiben - ob der Bestand richtig ist,
klaert C-561.
