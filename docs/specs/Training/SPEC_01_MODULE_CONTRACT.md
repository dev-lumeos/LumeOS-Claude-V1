# Training Module — Module Contract
> Spec Phase 1 | Final

---

## 1. Zweck

Das Training-Modul ist das zentrale System für Workout-Management in LumeOS.

**Kernaufgaben:**
- Exercise-Datenbank (1.200+ Übungen, DE/EN/TH)
- Routine-Verwaltung (user / coach / marketplace)
- Live-Workout-Tracking mit Progressive Overload
- Training-Analytics (Volume, PRs, Balance, Landmarks)
- Cross-Module-Integration mit Goals, Recovery, Nutrition

Interpretation — was der User tun soll, warum, wie es sich auf Ernährung und Recovery auswirkt — macht Buddy. Das Modul liefert Rohdaten und Compliance-Score.

---

## 2. Prinzipien

| Prinzip | Bedeutung |
|---|---|
| **Self-contained** | Kein harter Laufzeit-Zwang zu anderen Modulen |
| **Goals-informed** | Volume-Targets kommen von Goals |
| **Speed-First** | Set-Logging in <3 Sekunden — Speed ist #1 UX-Priorität |
| **3-sprachig** | DB: name_de, name_en, name_th — TH initial NULL, später befüllbar |
| **Snapshot-Prinzip** | Workout-Set-Daten werden eingefroren |
| **No Custom Exercises** | 1.200+ Übungen sind ausreichend — kein User-Upload |
| **Schema-Isolation** | Alle Tabellen im Schema `training` |

---

## 3. Inputs

### 3.1 Von Goals — Volume-Targets (täglich)
```
GET http://goals:5900/api/goals/targets/today?user_id=:uid
```
| Feld | Beschreibung |
|---|---|
| `weekly_sessions_target` | Geplante Sessions/Woche |
| `goal_phase` | bulk / cut / maintain / prep |
| `volume_modifier` | Multiplikator auf MAV-Basislinie |
| `preferred_split` | PPL / Upper-Lower / Full Body |

### 3.2 Von Recovery — Readiness Score (vor Session)
```
GET http://recovery:5400/api/recovery/readiness?user_id=:uid
```
| Feld | Beschreibung |
|---|---|
| `readiness_score` | 0–100 |
| `muscle_readiness` | Record<muscle_group, 0–100> |
| `hrv_status` | normal / elevated / suppressed |
| `recommendation` | train_normal / reduce_volume / rest |

### 3.3 Von Medical — Biomarker-Warnungen (optional)
| Feld | Wirkung |
|---|---|
| `crp_elevated` | → Trainingsvolumen reduzieren |
| `testosterone_low` | → Intensität anpassen |
| `injury_flags` | → betroffene Muskelgruppen ausschliessen |

---

## 4. Outputs

### 4.1 → Goals: Training Adherence
```
POST http://goals:5900/api/goals/contributions
```
```json
{
  "module": "training",
  "date": "2026-04-15",
  "compliance_score": 85,
  "details": {
    "sessions_completed": 4,
    "sessions_planned": 5,
    "total_volume_kg": 18500,
    "strength_progress_pct": 2.1,
    "muscle_balance_score": 78,
    "prs_this_week": 2
  }
}
```

### 4.2 → Recovery: Training Load
```
POST http://recovery:5400/api/recovery/training-load
```
```json
{
  "session_id": "uuid",
  "date": "2026-04-15",
  "volume_kg": 4200,
  "intensity_avg_rpe": 7.8,
  "muscles_worked": [
    { "muscle": "chest", "sets": 12, "volume_kg": 1800 },
    { "muscle": "triceps", "sets": 9, "volume_kg": 720 }
  ],
  "session_duration_min": 52
}
```

### 4.3 → Nutrition: Workout-Kontext
```
POST http://nutrition:5100/api/nutrition/training-context
```
```json
{
  "date": "2026-04-15",
  "workout_completed": true,
  "session_type": "push",
  "estimated_calories_burned": 380,
  "volume_kg": 4200,
  "recommended_protein_boost_g": 20
}
```

### 4.4 → Buddy: Echtzeit-Kontext
```
GET /api/training/for-ai
```
```json
{
  "training_status": "4/5 Sessions diese Woche · 18.500 kg Volume",
  "last_workout": "vor 1 Tag (Push Day)",
  "next_scheduled": "Heute: Pull Day",
  "strength_trend": { "bench_press": "+2.5kg", "squat": "+5kg" },
  "volume_vs_landmarks": { "chest": "MAV", "back": "unter MEV" },
  "flags": ["back_below_mev", "deload_approaching"],
  "pending_actions": [{ "type": "log_workout", "routine": "Pull Day" }]
}
```

---

## 5. Modul-Grenzen

### Training BESITZT:
- Exercise-Datenbank (1.200+ Übungen, importiert, read-only für User)
- Muscle Groups + Equipment (normalisierte Stammdaten)
- Routines (user / coach / marketplace — identisches Schema)
- Live Workout Sessions + Sets
- Progressive Overload Engine
- Personal Records
- Exercise Evaluation Scores
- Workout-Kalender + Schedule
- Volume Landmarks (personalisiert)
- Post-Workout Feedback (Pump/Soreness)
- Stats & Analytics

### Training BESITZT NICHT:
| Was | Wer |
|---|---|
| Recovery Score Berechnung | Recovery Modul |
| TDEE-Anpassung | Goals → Nutrition |
| Supplement Pre/Post Stack | Supplements Modul |
| Biomarker-Warnungen | Medical Modul |
| Coach-Profil + Abrechnung | Human Coach Modul |
| Gym-Management (B2B) | Gym Modul (separates Modul) |

### Schreib-Rechte anderer Module:
| Modul | Was es schreiben darf |
|---|---|
| Human Coach | Routines mit `source: 'coach'` anlegen und zuweisen |
| Marketplace | Routines mit `source: 'marketplace'` nach Kauf zuweisen |
| Buddy | Routines mit `source: 'buddy'` auf User-Anweisung erstellen |

---

## 6. Routine — Universelles Format

Routinen von user / coach / marketplace → identisches Schema.
User aktiviert immer selbst.

---

## 7. API-Übersicht

```
http://training:5200
  /api/training/exercises        Exercise-DB, Search, Detail
  /api/training/muscle-groups    Muskelgruppen-Baum
  /api/training/equipment        Equipment-Liste
  /api/training/routines         CRUD Routines
  /api/training/sessions         Workout Sessions (History)
  /api/training/sessions/live    Live Workout (aktive Session)
  /api/training/sets             Set-Logging
  /api/training/progression      Progressive Overload Engine
  /api/training/records          Personal Records
  /api/training/analytics        Stats, Volume, Balance
  /api/training/schedule         Wochenplan
  /api/training/for-ai           Buddy Context
  /api/training/for-goals        Compliance Export
  /api/training/for-recovery     Training Load Export
  /api/training/pending-actions  Offene User-Actions
```

---

## 8. Sprachen

**3-sprachig:** DE / EN / TH auf allen relevanten Feldern.
TH-Felder initial NULL — kein Pflichtfeld.
Exercises: name_de, name_en, name_th, instructions_de, instructions_th,
           tips_de, tips_th bereits übersetzt (1.850 Übungen).

---

## 9. Storage

| Ressource | Ort | Details |
|---|---|---|
| Images (4.645) | Cloudflare R2 | Start/End, Male/Female |
| Videos (2.363, ~11 GB) | Cloudflare R2 | 12 Kategorien |
| DB | Supabase PostgreSQL | Schema `training` |
| Live Session Cache | Redis (geplant) | Active Workout State |
