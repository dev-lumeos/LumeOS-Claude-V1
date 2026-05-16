# Coach Buddy Intervention Contract — JSON Schema v0.1

> Dieses Dokument definiert die Datenstrukturen für die Adaptive Intervention Engine
> und zeigt 5 vollständige Beispiel-Interventionen als Output Contract Payloads.

---

## 1. JSON Schemas

### 1.1 context_vector

```json
{
  "id": "ctx-uuid",
  "user_id": "user-uuid",
  "computed_at": "2026-03-15T07:30:00Z",
  
  "features": {
    "sleep_3d_avg": 5.2,
    "missed_workouts_7d": 2,
    "protein_adherence_7d": 0.58,
    "training_streak_days": 0,
    "stress_proxy": 0.75,
    "time_of_day": "morning",
    "day_of_week": "wednesday",
    "days_since_last_workout": 3,
    "nutrition_trend_7d": "declining",
    "check_in_mood_3d_avg": 2.3,
    "active_injury": null,
    "relationship_weeks": 18
  },
  
  "relationship": {
    "trust_score": 0.82,
    "push_tolerance": 0.71,
    "preferred_tone": "direct",
    "identity_phase": "reinforce"
  },
  
  "behavioral_signature": {
    "stress_pattern": {
      "detected": true,
      "pattern": "skips_training",
      "confidence": 0.74,
      "sample_size": 11,
      "first_observed": "2026-01-15",
      "last_confirmed": "2026-03-10"
    },
    "motivation_type": {
      "detected": true,
      "pattern": "quantitative",
      "confidence": 0.81,
      "sample_size": 23
    },
    "dropout_risk": {
      "detected": true,
      "day": "wednesday",
      "time": "17:00-18:00",
      "confidence": 0.68,
      "sample_size": 8
    },
    "protein_collapse": {
      "detected": true,
      "threshold_g": 140,
      "confidence": 0.72,
      "sample_size": 6
    },
    "morning_completion_rate": 0.95,
    "evening_completion_rate": 0.60
  },

  "intervention_limits": {
    "max_intervention_intensity": 0.6,
    "intervention_load_7d": {
      "total": 3,
      "max_total": 5,
      "confrontations": 1,
      "max_confrontations": 2,
      "identity_statements": 1,
      "max_identity_statements": 3
    }
  }
}
```

### 1.2 intervention_log

```json
{
  "intervention_id": "int-uuid",
  "user_id": "user-uuid",
  "timestamp": "2026-03-15T07:31:00Z",
  
  "context_vector_id": "ctx-uuid",
  
  "intervention_type": "confrontation",
  "tone_variant": "direct",
  "content_summary": "Direkte Konfrontation: 3 Tage kein Training, bekanntes Stress-Muster",
  
  "hypothesis_id": null,
  "expected_outcome": "engaged",
  
  "selection": {
    "bucket": "high_stress__missed_workout",
    "candidates_scored": [
      { "type": "confrontation", "tone": "direct", "score": 0.84 },
      { "type": "encouragement", "tone": "soft", "score": 0.35 },
      { "type": "adjustment", "tone": "analytical", "score": 0.62 }
    ],
    "selected": "confrontation__direct",
    "backup": "adjustment__analytical",
    "selection_reason": "historical_effectiveness_0.82_over_12_interventions"
  },
  
  "observed_outcome": null,
  "effectiveness_score": null,
  "emitted_events": [],
  "cooldown_until": "2026-03-17T07:31:00Z"
}
```

### 1.3 intervention_outcome (nachträglich befüllt)

```json
{
  "intervention_id": "int-uuid",
  "observed_outcome": "accepted",
  "adherence_delta_7d": 0.18,
  "session_within_24h": true,
  "behavior_shift": true,
  "effectiveness_score": 0.85,
  "emitted_events": ["evt-workout-next-day", "evt-check-in-positive"]
}
```

### 1.4 bss_snapshot (Behavior Stability Score)

```json
{
  "user_id": "user-uuid",
  "computed_at": "2026-03-15T00:00:00Z",
  "period": "rolling_90d",
  
  "stability": {
    "training_consistency": {
      "workouts_per_week_avg": 4.2,
      "workouts_per_week_variance": 0.8,
      "score": 78
    },
    "nutrition_adherence_stability": {
      "macro_hit_rate_avg": 0.72,
      "macro_drift_variance": 0.12,
      "score": 68
    },
    "recovery_stability": {
      "sleep_avg_hours": 6.4,
      "sleep_variance": 1.1,
      "check_in_trend": "stable",
      "score": 55
    },
    "dropout_events": {
      "count_90d": 2,
      "score": 70
    },
    "bounceback_time": {
      "avg_days_to_return": 2.5,
      "score": 82
    },
    "stability_score": 71
  },
  
  "goal_alignment": {
    "training": {
      "target_per_week": 5,
      "actual_avg": 4.2,
      "alignment": 0.84,
      "trend": "stable"
    },
    "nutrition": {
      "protein_target_hit_rate": 0.72,
      "calorie_target_hit_rate": 0.78,
      "trend": "improving"
    },
    "body_composition": {
      "goal": "muscle_gain",
      "weight_trend": "gaining",
      "on_track": true
    },
    "alignment_score": 72
  },
  
  "bss_total": 71,
  "bss_formula": "stability_score(71) × 0.5 + alignment_score(72) × 0.5 = 71.5 → 71",
  "bss_trend": "improving",
  "bss_delta_vs_prior": 4
}
```

---

## 2. Fünf Beispiel-Interventionen (vollständige Output Contract Payloads)

### Beispiel 1: Stress-Dropout Prävention (Mittwoch 17:15)

**Context:** User hat Stress-Pattern "skippt Training bei Stress". Heute ist Mittwoch (sein Dropout-Tag). 2 Workouts diese Woche verpasst. Sleep 5.2h avg. Trust ist hoch (0.82). Engine wählt: confrontation / direct.

```json
{
  "intent": "check_in",
  "speech_text": "Mittwoch, 17 Uhr. Ich kenne das Muster. Letzte Woche dasselbe. Du willst skippen. Aber du bist seit 18 Wochen dabei — und du bist nicht der Typ der aufhört wenn es unbequem wird. 30 Minuten. Das reicht heute.",
  
  "ui_cards": [
    {
      "type": "stat",
      "title": "Diese Woche",
      "data": {
        "workouts_planned": 5,
        "workouts_done": 2,
        "days_remaining": 3,
        "streak_at_risk": true
      },
      "priority": "high"
    }
  ],
  
  "actions": [
    {
      "id": "int-wed-001",
      "type": "REQUEST_INPUT",
      "params": { "type": "choice" },
      "requires_confirmation": false
    }
  ],
  
  "safety_flags": [],
  "evidence": [],
  
  "expects_input": true,
  "input_type": "choice",
  "choices": ["Bin dabei, 30 Min", "Nicht heute", "Morgen doppelt"],
  
  "_intervention_meta": {
    "intervention_id": "int-wed-001",
    "context_vector_id": "ctx-wed-001",
    "intervention_type": "confrontation",
    "tone_variant": "direct",
    "bucket": "high_stress__missed_workout__dropout_day",
    "identity_statement": "du bist nicht der Typ der aufhört",
    "identity_phase": "reinforce",
    "cooldown_until": "2026-03-17T17:15:00Z"
  }
}
```

---

### Beispiel 2: Falscher Ton → Backup Intervention

**Context:** Letzte Intervention (encouraging/soft) wurde ignoriert. User hat nicht reagiert und kein Workout gemacht. Engine eskaliert zum Backup: adjustment / analytical.

```json
{
  "intent": "check_in",
  "speech_text": "Ich hab gestern weich gefragt. Hat nicht funktioniert. Hier sind die Zahlen: 3 Tage kein Training, Protein bei 58% vom Ziel, Schlaf unter 6 Stunden. Das ist ein Abwärtstrend. Mein Vorschlag: Heute ein kurzes Workout, nur 20 Minuten, nur Compounds. Und heute Abend Protein nachholen.",
  
  "ui_cards": [
    {
      "type": "comparison",
      "title": "Letzte 7 Tage vs Durchschnitt",
      "data": {
        "workouts": { "current": 1, "avg": 4.2, "delta": -76 },
        "protein_adherence": { "current": 0.58, "avg": 0.78, "delta": -26 },
        "sleep": { "current": 5.2, "avg": 6.8, "delta": -24 }
      },
      "priority": "high"
    }
  ],
  
  "actions": [
    {
      "id": "int-backup-001",
      "type": "REQUEST_INPUT",
      "params": { "type": "choice" },
      "requires_confirmation": false
    }
  ],
  
  "safety_flags": [],
  "evidence": [],
  
  "expects_input": true,
  "input_type": "choice",
  "choices": ["20 Min Compounds, bin dabei", "Morgen", "Diese Woche nicht"],
  
  "_intervention_meta": {
    "intervention_id": "int-backup-001",
    "context_vector_id": "ctx-backup-001",
    "intervention_type": "adjustment",
    "tone_variant": "analytical",
    "bucket": "declining_adherence__prior_intervention_ignored",
    "prior_intervention_id": "int-soft-failed-001",
    "prior_outcome": "ignored",
    "escalation": true,
    "cooldown_until": "2026-03-18T08:00:00Z"
  }
}
```

---

### Beispiel 3: Identity-Claim blockiert (Low Trust)

**Context:** Neuer User, Woche 3. trust_score 0.35. Engine will Identity Reinforcement — aber Gate blockiert weil Trust zu niedrig.

```json
{
  "intent": "workout_summary",
  "speech_text": "Dritte Woche geschafft. 4 von 4 Workouts. Protein an 6 von 7 Tagen im Ziel. Das ist solide.",
  
  "ui_cards": [
    {
      "type": "stat",
      "title": "Woche 3",
      "data": {
        "workouts": "4/4",
        "protein_adherence": "6/7 Tage",
        "sleep_avg": "7.1h"
      },
      "priority": "normal"
    }
  ],
  
  "actions": [],
  
  "safety_flags": [],
  "evidence": [],
  
  "expects_input": false,
  
  "_intervention_meta": {
    "intervention_id": "int-w3-summary",
    "context_vector_id": "ctx-w3-001",
    "intervention_type": "encouragement",
    "tone_variant": "soft",
    "bucket": "weekly_review__positive",
    "identity_statement_blocked": true,
    "identity_block_reason": "trust_score_0.35_below_threshold_0.60",
    "note": "Engine wollte 'Du bist jemand der dranbleibt' — blockiert wegen low trust. Stattdessen: neutrale Fakten ohne Identity-Framing."
  }
}
```

---

### Beispiel 4: Cooldown aktiv — Intervention unterdrückt

**Context:** Gestern gab es eine direkte Konfrontation. Cooldown bis morgen. User hat heute wieder kein Workout gemacht. Engine will intervenieren — aber Cooldown blockiert.

```json
{
  "intent": "general_chat",
  "speech_text": "",
  
  "ui_cards": [],
  "actions": [],
  
  "safety_flags": [],
  "evidence": [],
  
  "expects_input": false,
  
  "_intervention_meta": {
    "intervention_id": null,
    "intervention_suppressed": true,
    "suppression_reason": "cooldown_active_until_2026-03-17T17:15:00Z",
    "prior_intervention_id": "int-wed-001",
    "note": "Keine Intervention. Cooldown respektieren. Nächster Slot: morgen 08:00."
  }
}
```

**Kein Output an User.** Stille ist auch eine Intervention-Entscheidung.

---

### Beispiel 5: BSS-basierter Monatsreview

**Context:** 3-Monats-Review. BSS ist von 58 auf 71 gestiegen. Trust ist hoch. Identity Phase: reinforce.

```json
{
  "intent": "weekly_review",
  "speech_text": "3 Monate. Dein Stability Score ist von 58 auf 71 gestiegen. Das heißt: du wirst konsistenter. Nicht nur stärker — stabiler. Die Aussetzer werden kürzer, du kommst schneller zurück. Vor 2 Monaten hat ein Rückfall 5 Tage gedauert. Jetzt 2. Das ist der eigentliche Fortschritt.",
  
  "ui_cards": [
    {
      "type": "chart",
      "title": "Behavior Stability Score — 90 Tage",
      "data": {
        "bss_current": 71,
        "bss_prior": 58,
        "bss_delta": 13,
        "bss_trend": "improving",
        "components": {
          "training_consistency": 78,
          "nutrition_stability": 68,
          "recovery_stability": 55,
          "dropout_resilience": 70,
          "bounceback_speed": 82
        }
      },
      "priority": "high"
    },
    {
      "type": "comparison",
      "title": "Bounceback-Zeit",
      "data": {
        "month_1": { "avg_days": 5.0 },
        "month_2": { "avg_days": 3.5 },
        "month_3": { "avg_days": 2.0 },
        "trend": "improving"
      },
      "priority": "normal"
    }
  ],
  
  "actions": [
    {
      "id": "review-q1-001",
      "type": "SHOW_SUMMARY",
      "params": { "type": "quarterly" },
      "requires_confirmation": false
    }
  ],
  
  "safety_flags": [],
  "evidence": [],
  
  "expects_input": true,
  "input_type": "free_text",
  
  "_intervention_meta": {
    "intervention_id": "int-review-q1",
    "context_vector_id": "ctx-review-q1",
    "intervention_type": "encouragement",
    "tone_variant": "direct",
    "bucket": "quarterly_review__bss_improving",
    "identity_statement": "du wirst konsistenter, nicht nur stärker — stabiler",
    "identity_phase": "reinforce",
    "bss_reference": {
      "current": 71,
      "prior": 58,
      "delta": 13
    }
  }
}
```

---

## 3. Schema-Regeln

### `_intervention_meta`
- Wird NICHT an den User gesendet
- Ist internes Logging/Debugging-Feld
- Wird in `intervention_log` Tabelle persistiert
- Enthält die Engine-Entscheidung + Begründung

### Idempotenz
- Jede Intervention hat `intervention_id`
- Doppelte Auslieferung mit gleicher ID = noop
- Cooldown verhindert zu häufige Wiederholung

### Outcome-Tracking
- `observed_outcome` wird NACHTRÄGLICH befüllt (nicht im Response)
- Tracking-Fenster: 24h nach Intervention (war es effektiv?)
- `effectiveness_score` wird aus Outcome-Feldern berechnet

### Identity Gates
- `identity_phase: observe` → keine Identity-Statements
- `identity_phase: mirror` → nur Beobachtungen ("du hast 3 Wochen durchgehalten")
- `identity_phase: reinforce` → aktive Statements ("du bist jemand der...")
- Phase-Upgrade nur bei `trust_score ≥ 0.60` (mirror) / `≥ 0.75` (reinforce)

### Cooldown
- Jede Intervention setzt `cooldown_until`
- Default: 48h für confrontation, 24h für encouragement, 12h für adjustment
- Während Cooldown: keine Intervention gleichen Typs
- Override nur bei Safety-Events (Verletzung, extreme Werte)

---

## 4. Versionierung

- Contract Version: `v0.1`
- Breaking Changes → Major Version Bump
- Neue optionale Felder → Minor Version
- `_intervention_meta` ist nicht Teil des User-Contracts — nur internes Schema
