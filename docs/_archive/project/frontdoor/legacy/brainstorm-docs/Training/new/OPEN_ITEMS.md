# Training Module — Offene Punkte, Bugs & Geplante Features

## Status: 56/56 Tasks abgeschlossen (2026-02-27)

---

## 🔴 Kritische Bugs / Ausstehende Fixes

### Bug 1: Route-Reihenfolge (Exercise Smart-Search)
**Problem:** `/exercises/search` wird von `/exercises/:id` abgefangen wenn falsch gemounted.
**Fix:** Smart-Search Router MUSS vor dem allgemeinen Router gemounted sein.
```typescript
// RICHTIG:
app.route('/api/training/exercises/search', exerciseSearchRouter)
app.route('/api/training/exercises',         exercisesRouter)
```

### Bug 2: Volume Landmarks initial-Setup
**Problem:** Neue User haben keine Volume Landmarks Einträge.
**Fix:** Beim ersten Login oder ersten Training-Session → Default-Landmarks für alle Hauptmuskelgruppen anlegen.

---

## 🟡 Mittlere Priorität

### Feature: Marketplace Integration (Task #51)
**Status:** ⬜ Ausstehend
**Was fehlt:** Routine als Produkt im Marketplace listen, kaufen, zuweisen.
Routine-Schema unterstützt bereits `source: 'marketplace'` und `source_ref_id`.

### Feature: Wave + DUP + RPE Modelle im UI
**Status:** Engine in `packages/scoring/src/training.ts` implementiert
**Was fehlt:** Konfigurations-UI für User (ProgressionModel wählen, Parameter setzen)

### Feature: Videos für restliche Kategorien
**Status:** Abdominals + Back live (~274 Videos)
**Was fehlt:** Chest, Legs, Shoulders, Arms, Full Body etc. (~2.089 Videos verfügbar)

### Feature: Offline-Workout
**Status:** Konzeptuell definiert
**Was fehlt:** SQLite-Cache für Exercise-DB + Service Worker für Workout-Logging

---

## 🟢 Niedrige Priorität / Zukünftige Features

### Drag & Drop Reorder im Routine Builder
**Status:** Move Up/Down implementiert
**Plan:** react-beautiful-dnd oder @dnd-kit/core Integration

### Community Routine Sharing
**Beschreibung:** `is_public = true` auf routines → Discovery Feed, Kopieren

### Apple Watch Standalone-Logging
**Beschreibung:** Set-Logging ohne Handy via WatchKit (Phase 2)

### Wearable-Integration (HR, GPS)
**Beschreibung:** Herzfrequenz und GPS für Cardio-Tracking

### 3D Exercise Models
**Beschreibung:** Three.js Modelle (GymStreak-Inspiration) — Phase 3

### Form Check via Computer Vision
**Beschreibung:** Video-Analyse der Bewegungsausführung

---

## Offene Design-Fragen

| Frage | Empfehlung |
|---|---|
| Supersets: max. 3 Partner oder unbegrenzt? | Max. 3 für UI-Klarheit |
| Cardio in Live Workout State Machine? | Separater Tracking-Modus (Distance/Time) |
| Custom Exercises jemals? | NEIN für v1 — 1.200+ reichen |
| Apple Watch ohne Handy? | Phase 2 |
| Community Routine Discovery? | Phase 2 |

---

## Bekannte Technische Schulden

| Schuld | Beschreibung |
|---|---|
| `muscle_readiness` VIEW | Holt Training-Daten aus eigenem training_load_logs Table, aber Training Module schreibt direkt → sollte via POST /for-recovery kommen |
| Materialized View Refresh | `weekly_volume_summary` muss manuell/via Cron refreshed werden |
| `workout_sessions.prs_achieved` JSONB | Aktuell Snapshot, könnte normalized als FK zu `personal_records` sein |
| liveWorkoutStore State | Bei App-Reload verloren → sollte in localStorage persistiert werden |
