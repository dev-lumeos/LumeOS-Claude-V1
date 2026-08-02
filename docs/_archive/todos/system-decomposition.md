# TODO: system/decomposition/ — Decomposition Layer

# Status: TEILWEISE OFFEN

# Erstellt: 24. April 2026

## Was da ist

```
system/decomposition/schemas/decomposition_spec_v1.md  ✅ vorhanden
```

## Was leer ist

```
system/decomposition/specs/      → Konkrete Decomposition Specs pro Modul
system/decomposition/validators/ → Validators für Decomposition Output
```

## Was rein soll

### decomposition/specs/

Pro LumeOS Modul eine Decomposition Spec:

- `nutrition_decomposition_v1.md` — wie wird Nutrition Feature in WOs aufgeteilt
- `training_decomposition_v1.md`
- `infra_decomposition_v1.md`

### decomposition/validators/

Regeln die prüfen ob ein dekomponiertes WO Set valide ist:

- Keine Circular Dependencies
- Alle Acceptance Criteria prüfbar
- Kein WO überschreitet max_lines_changed

## Wann angehen

Wenn WO Factory aktiv ist (system/prompts/wo-factory/). Macht erst Sinn wenn Spark C WOs automatisch erstellt.

## Prompt für Opus wenn bereit

```
WO Factory ist aktiv.

Erstelle für jedes LumeOS Modul eine Decomposition Spec in
system/decomposition/specs/:
- Wie wird ein Feature-Request in atomare WOs aufgeteilt
- Was sind typische WO-Sequenzen pro Modul
- Welche WOs können parallel laufen, welche sequenziell

Starte mit infra_decomposition_v1.md (einfachster Fall).
```
