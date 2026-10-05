---
nr: C-561
typ: fehler
modul: quer
schwere: mittel
angelegt: 2026-10-04
agent: codex
beauftragt: 2026-10-05
erledigt: 2026-10-05
commit: 306378cb

braucht: [C-560]
kind_von: C-560

quellen:
  - docs/punkte/erledigt/quer-c-0560-der-testdatenpruefer-wird-gruen.md

beruehrt:
  tabellen:
    - goals.nutrition_targets
  dateien:
    - supabase/_pipeline/_validierung/testdaten-pruefen.ts
---

# Zwei Testproben beschreiben den Bestand, nicht das Soll

## Befund

`[read]` C-560 (`404e181c`) hat zwei Proben auf den gemessenen Bestand
gezogen, ohne zu begruenden, dass der Bestand gewollt ist:

1. **Mangel-Szenario** (`micronutrient_below_threshold`, Max, Szenariotag):
   vorher `total_assessed >= 17`, jetzt `= 7`. **Zehn Naehrstoffe weniger
   bewertet** - Regression oder gewollte Aenderung der Referenzwerte?
2. **Omega-3 (ALA)** in `micronutrient_snapshot`: vorher `GOAL`, jetzt
   `AI`. Die Fehlermeldung der Probe sagt weiter ,gegen Goals-Ziel".
   `[annahme]` Ursache: die aktiven Ziele von test-user erzeugen im Seed
   0 Zielwerte, also faellt ALA auf den AI-Referenzwert zurueck.

## Was zu tun ist

Je Probe: Ursache messen (welcher Commit, welche Zeilen), dann entweder
Soll begruenden oder Bestand reparieren. Haengt fuer (2) an der Regel
,hoechstens ein aktives Kalorienziel" - erst nach Toms Entscheidung.

## Auftrag - Kopf

    AUFTRAG FUER Codex - C-561: als Teil von G-604 beauftragt (2026-10-04)
    Bereich: supabase/_pipeline/

## Abnahme - 2026-10-05, Commit `306378cb`

`[read]` **(1) Mangel-Szenario 7 ist richtig:** der kuratierte Snapshot
fuehrt acht Stoffe, Zink ist mangels vollstaendiger Quelldaten nicht
bewertbar, also 7/7 unter 75 %.

`[read]` **(2) Omega-3 `AI` war richtig - die Praemisse dieses Punkts war
falsch.** E-87 (Tom, 01.10.) macht die Tagesreferenz zielfrei; nur die
Meldung der Probe war veraltet. Sie lautet jetzt ,gegen den zielfreien
TDEE-Referenzwert". `[cmd]` Live-Quelle `tdee_alpha_linolenic_acid`.
