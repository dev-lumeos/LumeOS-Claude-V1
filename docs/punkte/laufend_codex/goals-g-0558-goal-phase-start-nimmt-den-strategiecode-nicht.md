---
nr: G-558
typ: fehler
modul: goals
schwere: hoch
angelegt: 2026-09-30
beauftragt: 2026-09-30
agent: codex

braucht: [G-543, G-554]
kind_von: G-543

quellen:
  - supabase/_pipeline/11_goals/111_goals_ziele_phasen.sql
  - apps/web/src/lib/goals/phasenziel-write.ts

beruehrt:
  tabellen:
    - goals.goal_phases
  funktionen:
    - goals.goal_phase_start
  dateien:
    - supabase/_pipeline/11_goals/
    - supabase/_pipeline/_validierung/

zahlen:
  gemessen: 2026-09-30
  parameter_heute: 7
  phasen_mit_strategie_code: 5
  phasen_gesamt: 5
---

# `goal_phase_start` nimmt den Strategiecode nicht entgegen

## Der Befund

`[cmd]` **Die Spalte ist da, die Funktion ist dahinter zurueck.**
Selbst gelesen am 2026-09-30 aus `pg_get_function_arguments`:

    goal_phase_start(
      p_phase_type text,
      p_goal_id uuid,
      p_gueltig_ab date DEFAULT CURRENT_DATE,
      p_projected_end_date date DEFAULT NULL,
      p_variant text DEFAULT NULL,
      p_parameters jsonb DEFAULT '{}',
      p_zielrate_pct_kg_woche numeric DEFAULT NULL
    )

**Sieben Parameter, keiner davon fuer `strategie_code`** — waehrend
alle **5** Zeilen in `goals.goal_phases` den Code fuehren (nach G-543
und G-556 gemessen, 5 von 5).

`[read]` **Die Folge sieht der Nutzer.** Die Oberflaeche aus G-554
laesst bei `body_composition` eine Strategie waehlen und muss danach
melden, dass die Wahl nicht ankommt (`strategieOffen`). Wer heute eine
Phase ueber die Funktion anlegt, bekommt eine Phase ohne Strategie —
und damit ohne Rate, ohne Dauergrenze, ohne Zielrechnung aus G-543.
**Der Weg, den G-543 gebaut hat, ist ueber die Funktion nicht
erreichbar.**

`[cmd]` **Das war A5 aus G-543** und ist beim Abschluss von G-543 offen
geblieben. Ein offener Unterpunkt in einem abgeschlossenen Punkt ist
keine Ablage — deshalb steht er hier als eigener Punkt.

## Auftrag

**A1 — der Parameter.** `goal_phase_start` nimmt `p_strategie_code text
DEFAULT NULL` und schreibt ihn. Die Stelle in der Kette, nicht live.
Der Fremdschluessel auf `goals.goal_strategies` muss greifen: ein
unbekannter Code scheitert. **In beide Richtungen belegen** — bekannter
Code kommt an, erfundener Code wird abgewiesen, mit der Meldung
woertlich.

**A2 — die Rate folgt der Strategie, nicht dem Aufrufer.** Wird ein
Code uebergeben und keine `p_zielrate_pct_kg_woche`, uebernimmt die
Funktion die Katalograte. Wird beides uebergeben, gilt der Aufrufer und
die Abweichung wird in der Zeile sichtbar — das ist der persoenliche
Override aus G-543, und dort liegt der Unterschied bei 78 kcal. Mit
Zahlen belegen, nicht mit der Existenz der Spalte.

**A3 — gegen den Seed pruefen, nicht nur gegen den Bestand.** Die Lehre
aus G-556: die Kette baut neu, sie repariert nicht. Der neue Parameter
muss im vollen Kettenlauf gruen sein, und die drei Seedphasen muessen
ihn dort benutzen statt ihn nachtraeglich zu bekommen.

**A4 — die Probe muss laufen koennen.** Neue Gegenproben nicht nur nach
`supabase/_pipeline/_validierung/` legen: dieses Verzeichnis laeuft in
keinem Gate (A-77, hier nachgemessen — keine `package.json` nennt es,
die Kette ruft genau `schema-vollstaendigkeit-pruefen.ts` auf). **Im
Bericht sagen, welcher Lauf die neue Probe aufruft.** Fuehrt kein Lauf
sie auf, ist das zu melden statt sie ,,dauerhaft" zu nennen.

## Was hier nicht hingehoert

Die zwei G-536-Rechnungstests, die noch die Semantik vor G-543
erwarten. Die sind ein Befund von A-77 und kein Teil dieses Auftrags —
aber wer sie anfasst, schreibt in den Bericht, welcher Lauf sie prueft.
