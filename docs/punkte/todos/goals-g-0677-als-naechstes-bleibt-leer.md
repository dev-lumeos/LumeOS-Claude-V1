---
nr: G-677
typ: befund
modul: goals
schwere: mittel
angelegt: 2026-10-18

braucht: []
kind_von: G-669

quellen:
  - docs/spezifikation/goals-ziel-setzen/entwurf/PhaseEngine.dc.html

beruehrt:
  tabellen: []
  dateien:
    - supabase/_pipeline/11_goals/669_next_phase_reader.sql
---
# "Als nächstes" bleibt leer, wenn der Plan keine Folgephase hat

## Befund

`[cmd]` 18.10.: `goals.goal_als_naechstes` liefert für Toms Lean Bulk auf dev nichts. Codex erzeugt eine Empfehlung nur aus einer gespeicherten Empfehlung oder einer belegten Regel.

`[read]` Der Entwurf (PhaseEngine.dc.html) kennt zwei Fälle:
- Hat der Plan eine nächste Phase, steht dort "Nächste Stufe laut Plan".
- Hat er keine, steht eine Empfehlung mit Datum, Dauer und Grund, zum Beispiel "Empfohlen ab 18.12.26: Mini Cut 4 Wochen. Grund: Körperfett steigt im Überschuss auf ~17 %".

`[read]` Die einzige Regel im Entwurf ist die Wache "Körperfett > 18 % → Mini Cut vorschlagen". Bei 16,2 % greift sie nicht.

## Offen (Tom)

Was steht da, wenn keine Regel greift? Vorschlag des Orchestrators: "Nach Planende ohne Folgephase: Erhaltung. Phase ergänzen (✎)". Eine erfundene Empfehlung gibt es nicht.

## Entschieden - 2026-10-19 07:05, Tom

Der Vorschlag gilt. Wenn der Leser nichts liefert und der Plan keine Folgephase hat, steht dort: "Nach Planende ohne Folgephase: Erhaltung. Phase ergänzen (✎)". Eine Empfehlung ohne Regel wird nicht erfunden.
Claude Code setzt das in G-678 um. Dieser Punkt schliesst mit der Abnahme von G-678.
