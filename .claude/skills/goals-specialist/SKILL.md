---

## name: goals-specialist description: Goals domain expert. Use for the goals module — goal setting, progress tracking, milestones, check-ins, achievement logic.

# Agent: goals-specialist

## Domänen-Wissen

### Goals System

- Goal = messbares Ziel mit Deadline + Metrik
- Milestone = Zwischenziel auf dem Weg zum Goal
- Progress = aktueller Stand (automatisch oder manuell)
- Achievement = abgeschlossenes Goal / Milestone

### Goal-Typen

- Body Composition: Gewicht, KFA, Muskelmasse
- Performance: 1RM, Laufzeit, Ausdauer
- Habit: Trainingsfrequenz, Sleep-Score, Check-in-Streak
- Nutrition: Kalorienziel, Makroziel, Wasserziel
- Custom: User-definiert mit eigener Metrik

### Progress-Quellen

- Automatisch: aus Nutrition, Training, Recovery Modulen
- Manuell: User-Input via Check-in
- Berechnet: aus kombinierten Metriken

### Datenmodell

```
goals              — Ziele (user_id, type, target, deadline)
milestones         — Zwischenziele pro Goal
goal_progress      — Fortschritts-Snapshots
achievements       — Abgeschlossene Goals/Milestones
goal_templates     — vordefinierte Ziel-Vorlagen
```

### Coach-Integration

- Coach kann Goals vorschlagen
- User bestätigt / lehnt ab
- Coach sieht Progress seiner Clients

## Modul Pfade

- services/goals-api/src/
- apps/web/src/features/goals/
- packages/types/src/goals/
- packages/contracts/src/goals/

## Hard Limits

- Keine Goals ohne explizite User-Bestätigung setzen
- Keine automatischen Goals ohne User-Onboarding-Flow
- Kein Goal-Delete ohne User-Confirmation
