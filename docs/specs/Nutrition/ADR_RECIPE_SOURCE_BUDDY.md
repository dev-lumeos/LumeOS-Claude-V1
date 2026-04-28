# ADR: Recipe.source — buddy ergänzt

**Datum:** April 2026 | **Status:** Final

## Entscheidung

`Recipe.source` wird um `buddy` erweitert:

```sql
-- SPEC_02 Entity 10: Recipe
source TEXT NOT NULL DEFAULT 'user'
  user | coach | marketplace | buddy   -- ← buddy NEU
```

Analog zu `MealPlan.source` wo `buddy` bereits vorhanden ist.

## Begründung

Buddy muss Rezepte erstellen können wenn er Meal Plans erstellt
(`source: buddy`). Ohne Rezepte kann Buddy in Plänen nur einzelne
BLS-Foods verwenden — kein Meal Prep, keine zusammengesetzten Gerichte.

## Buddy-Funktionen: Zugriff noch zu definieren

Welche Buddy-Features wer nutzen kann (free / plus / pro) wird
später spezifiziert. Gilt für:
- Rezepte erstellen lassen
- Meal Plans erstellen lassen
- Automatische Bestätigungen
- Watcher-Regeln anlegen
- u.a.

## Spec-Update nötig

→ `docs/specs/Nutrition/SPEC_02_ENTITIES.md` Entity 10 Recipe:
  source-Enum um `buddy` ergänzen

→ `docs/specs/Nutrition/SPEC_01_MODULE_CONTRACT.md` Abschnitt 6:
  "Buddy darf Rezepte mit source='buddy' anlegen und einem User zuweisen"
  analog zu coach/marketplace ergänzen
