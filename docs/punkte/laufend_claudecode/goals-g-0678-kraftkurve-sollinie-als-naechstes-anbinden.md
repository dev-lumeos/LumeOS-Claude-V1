---
nr: G-678
typ: aufgabe
modul: goals
schwere: mittel
angelegt: 2026-10-18
agent: claudecode
beauftragt: 2026-10-18

braucht: []
kind_von: G-648

quellen:
  - docs/spezifikation/goals-ziel-setzen/entwurf/Main.dc.html
  - docs/spezifikation/goals-ziel-setzen/entwurf/PhaseEngine.dc.html

beruehrt:
  tabellen: []
  dateien:
    - apps/web/src/app/v2/goals
---
# Kraftkurve, Sollinie und "Als nächstes" an die neuen Leser binden

## Befund

`[cmd]` Seit 07f91713 gibt es drei neue Leser:
- `goals.measurement_points` liefert einen Punkt je Einheit.
- `goals.planlinien_am` liefert `vorwaerts_kg` und `historisch_kg`.
- `goals.goal_als_naechstes` liefert für dev nichts. Wie der Fall ohne Empfehlung aussieht, regelt G-677.

Die UI zeigt noch den alten Stand.

## Was zu tun ist (Claude Code)

- Die Kraftkurve mit einem Punkt je Einheit zeichnen.
- Die Sollinie aus `planlinien_am` nehmen.
- "Als nächstes" nur anzeigen, wenn der Leser etwas liefert.
- Abnahme gegen den Entwurf V57 auf test-user.

## Auftrag - Kopf

    AUFTRAG FUER claudecode - G-678 Kraftkurve, Sollinie, Als naechstes anbinden
    Bereich: apps/web
    Fremd:   supabase/_pipeline gehoert Codex, docs/ dem Orchestrator.
    Stand:   2026-10-18, HEAD cdacb9d6 (Nachtrag 13:25)

## Nachtrag - 2026-10-19 (G-677, Entscheid Tom)

Wenn goals.goal_als_naechstes nichts liefert und der Plan keine Folgephase hat, steht dort: "Nach Planende ohne Folgephase: Erhaltung. Phase ergänzen (✎)". Der Stift öffnet das Bearbeiten des Plans.
