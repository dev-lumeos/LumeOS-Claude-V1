# Buddy / AI Coach Module — Import Pipeline
> Spec Phase 8 | Seed-Daten, Cron Jobs, Knowledge Base, Setup

---

## Übersicht

Die Import-Pipeline umfasst:
1. DB-Setup (Schema + Grants)
2. System-Regeln Seed
3. Knowledge Base Seed (RAG)
4. Default Journey Checkpoints
5. Feature Gate Config Seed
6. Cron Jobs Setup
7. Verifikation

---

## Phase 1: System-Regeln Seed

```sql
INSERT INTO buddy.buddy_rules
  (rule_name, category, trigger_event, conditions, action_definition,
   priority, cooldown_hours, is_system_rule, created_by)
VALUES

-- Nutrition Rules
('protein_gap_end_of_day',
 'nutrition', 'daily_refresh',
 '[{"field": "nutrition_state.protein_gap_g", "operator": ">", "value": 30},
   {"field": "current_time", "operator": ">=", "value": "18:00"}]',
 '{"type": "alert", "level": "warning", "template": "protein_gap_evening"}',
 7, 12, true, 'system'),

('calorie_deficit_large_3d',
 'nutrition', 'daily_refresh',
 '[{"field": "nutrition_state.calorie_gap_kcal", "operator": "<", "value": -500,
   "consecutive_days": 3}]',
 '{"type": "alert", "level": "warning", "template": "calorie_deficit_large"}',
 8, 24, true, 'system'),

('extreme_calorie_deficit',
 'nutrition', 'meal_logged',
 '[{"field": "nutrition_state.calories_today", "operator": "<", "value": 800},
   {"field": "current_time", "operator": ">=", "value": "18:00"}]',
 '{"type": "alert", "level": "critical", "template": "extreme_deficit",
   "also": "pause_weight_loss_recommendations"}',
 10, 6, true, 'system'),

-- Training Rules
('missed_workouts_3x_7d',
 'training', 'daily_refresh',
 '[{"field": "training_state.missed_workouts_7d", "operator": ">=", "value": 3}]',
 '{"type": "notify_coach", "template": "low_compliance"}',
 6, 48, true, 'system'),

('pain_flag_exercise',
 'training', 'workout_completed',
 '[{"field": "safety_state.pain_flags", "operator": "not_empty", "value": null}]',
 '{"type": "alert", "level": "warning", "template": "pain_detected",
   "also": "suggest_exercise_swap"}',
 9, 12, true, 'system'),

('training_volume_spike',
 'training', 'workout_completed',
 '[{"field": "training_state.volume_delta_pct", "operator": ">", "value": 40}]',
 '{"type": "alert", "level": "info", "template": "volume_spike_monitor"}',
 5, 72, true, 'system'),

-- Recovery Rules
('recovery_low_heavy_day',
 'recovery', 'sleep_logged',
 '[{"field": "recovery_state.recovery_score", "operator": "<", "value": 50},
   {"field": "training_state.heavy_training_day_flag", "operator": "==", "value": true}]',
 '{"type": "training_adjustment", "reduce_volume_pct": 20,
   "template": "recovery_low_training_adjusted"}',
 8, 24, true, 'system'),

('sleep_score_low_3d',
 'recovery', 'sleep_logged',
 '[{"field": "recovery_state.bad_sleep_days_consecutive", "operator": ">=", "value": 3}]',
 '{"type": "alert", "level": "warning", "template": "sleep_trend_bad"}',
 7, 48, true, 'system'),

-- Safety Rules
('dizziness_report',
 'general', 'check_in',
 '[{"field": "safety_state.dizziness_flags", "operator": "==", "value": true}]',
 '{"type": "escalate_to_coach", "template": "dizziness_alert",
   "also": "pause_training_actions"}',
 10, 6, true, 'system'),

('rapid_weight_loss',
 'general', 'bodyweight_logged',
 '[{"field": "body_state.rapid_weight_loss_flag", "operator": "==", "value": true}]',
 '{"type": "alert", "level": "critical", "template": "rapid_weight_loss"}',
 10, 12, true, 'system'),

-- Behavior Rules
('logging_dropout_5d',
 'general', 'daily_refresh',
 '[{"field": "behavior_state.logging_consistency_score", "operator": "<", "value": 0.3,
   "days": 5}]',
 '{"type": "message", "template": "compliance_nudge"}',
 5, 120, true, 'system'),

-- Supplement Rules
('pin_day_missed',
 'supplements', 'daily_refresh',
 '[{"field": "supplements_state.pin_day_today", "operator": "==", "value": true},
   {"field": "supplements_state.pin_done", "operator": "==", "value": false},
   {"field": "current_time", "operator": ">=", "value": "20:00"}]',
 '{"type": "alert", "level": "critical", "template": "pin_day_reminder"}',
 9, 6, true, 'system');
```

---

## Phase 2: Knowledge Base Seed (Kern-Einträge)

```sql
-- Beispiel-Einträge; vollständige KB = separate JSON-Datei
INSERT INTO buddy.knowledge_base (title, content, summary, category, evidence_level, tags)
VALUES
('Kreatin Monohydrat — Wirksamkeit',
 'Kreatin Monohydrat ist eines der am besten erforschten Supplemente für Kraft und Muskelmasse. Regelmäßige Einnahme (3-5g täglich) erhöht intramuskuläre Kreatinspeicher...',
 'Kreatin Monohydrat ist effektiv für Kraft und Muskelmasse. Dauereinnahme 3-5g/Tag empfohlen.',
 'supplements', 'A',
 ARRAY['creatine', 'strength', 'muscle_growth']),

('Progressive Overload Prinzip',
 'Progressive Overload bedeutet die schrittweise Erhöhung des Trainingsreizes über Zeit. Dies kann durch mehr Gewicht, mehr Wiederholungen, mehr Sets oder kürzere Pausen erreicht werden...',
 'Training muss progressiv überlastet werden um Fortschritt zu erzielen.',
 'training', 'A+',
 ARRAY['progressive_overload', 'strength', 'hypertrophy']),

('Protein-Timing und Muskelproteinsynthese',
 'Die Muskelproteinsynthese (MPS) wird durch Proteinaufnahme stimuliert. Für maximale MPS werden 20-40g hochwertige Proteine pro Mahlzeit empfohlen...',
 'Protein gleichmäßig über den Tag verteilt für optimale Muskelproteinsynthese.',
 'nutrition', 'A',
 ARRAY['protein', 'muscle_growth', 'timing']),

('Schlaf und Erholung',
 'Schlaf ist die wichtigste Erholungsintervention. Während des Tiefschlafs wird Wachstumshormon ausgeschüttet, Muskelreparatur findet statt...',
 '7-9h Schlaf ist für optimale Erholung und Muskelwachstum essentiell.',
 'recovery', 'A+',
 ARRAY['sleep', 'recovery', 'growth_hormone']),

('Magnesium und Schlafqualität',
 'Magnesium spielt eine Rolle bei der Regulierung von GABA-Rezeptoren, die an der Schlafregulation beteiligt sind...',
 'Magnesium kann Schlafqualität verbessern, besonders bei Mangelversorgung.',
 'supplements', 'B',
 ARRAY['magnesium', 'sleep', 'recovery']);
```

---

## Phase 3: Feature Gate Config Seed

```typescript
// packages/scoring/src/buddy.ts — FEATURE_TIERS
// Diese Map ist Code-seitig definiert. Middleware liest aus DB:

// In DB: feature_tier_config Tabelle (für A/B Testing)
CREATE TABLE IF NOT EXISTS buddy.feature_tier_config (
  feature_key   TEXT PRIMARY KEY,
  required_tier TEXT NOT NULL,
  ab_test_id    TEXT,
  is_active     BOOLEAN DEFAULT true
);

INSERT INTO buddy.feature_tier_config (feature_key, required_tier) VALUES
('chat_basic',          'free'),
('insights_feed',       'free'),
('chat_unlimited',      'plus'),
('journey_heartbeat',   'plus'),
('all_personas',        'plus'),
('voice_input',         'pro'),
('action_execution',    'pro'),
('proactive_watcher',   'pro'),
('push_alerts',         'pro'),
('gym_finder',          'pro'),
('training_plans',      'elite'),
('cycle_consulting',    'elite'),
('weekly_deep_report',  'elite'),
('ai_clone',            'coach_b2b')
ON CONFLICT (feature_key) DO NOTHING;
```

---

## Phase 4: Default Journey Checkpoints

```typescript
// Bei User-Onboarding: Standard-Journey anlegen
async function createDefaultJourney(userId: string): Promise<void> {
  const defaultCheckpoints = [
    {
      id:          'morning',
      time:        '07:00',
      enabled:     true,
      persona:     'motivator',
      modules:     ['recovery', 'nutrition', 'supplements'],
      push:        true,
      active_days: [1, 2, 3, 4, 5],  // Mo–Fr
      content_config: {
        show_recovery: true, show_macros: true,
        show_supplements: true, show_goals: false,
      },
    },
    {
      id:          'evening',
      time:        '21:00',
      enabled:     true,
      persona:     'best_friend',
      modules:     ['nutrition', 'goals'],
      push:        false,
      active_days: [1, 2, 3, 4, 5, 6, 0],
      content_config: {
        show_recovery: false, show_macros: true,
        show_supplements: false, show_goals: true,
      },
    },
    {
      id:          'weekly_review',
      time:        '20:00',
      enabled:     true,
      persona:     'scientist',
      modules:     ['nutrition', 'training', 'recovery', 'goals'],
      push:        true,
      active_days: [0],  // Sonntag
    },
  ];

  await db.insert(buddy.coach_journey).values({
    user_id:     userId,
    checkpoints: defaultCheckpoints,
    timezone:    'UTC',
  }).onConflictDoNothing();
}
```

---

## Phase 5: Cron Jobs

```typescript
// src/api/coach/cron/index.ts

import { CronJob } from 'cron';

// Täglich 02:00: Proaktiver Wächter (alle User)
new CronJob('0 2 * * *', async () => {
  const users = await getAllActiveUsers();
  for (const userId of users) {
    await runWatcherForUser(userId);
  }
}, null, true, 'UTC');

// Täglich 03:00: BSS Berechnung
new CronJob('0 3 * * *', async () => {
  const users = await getUsersWithEnoughData();  // min. 60 Events
  for (const userId of users) {
    await computeAndStoreBSS(userId);
  }
}, null, true, 'UTC');

// Täglich 04:00: Behavioral Signature Update
new CronJob('0 4 * * *', async () => {
  const users = await getUsersWithEnoughData();  // min. 8 Wochen Daten
  for (const userId of users) {
    await updateBehavioralSignature(userId);
  }
}, null, true, 'UTC');

// Jede Minute: Journey Heartbeat Dispatcher
new CronJob('* * * * *', async () => {
  await processJourneyCheckpoints();
}, null, true, 'UTC');

// Täglich 06:00: Memory Decay
new CronJob('0 6 * * *', async () => {
  await decayOldMemories();
}, null, true, 'UTC');

// Wöchentlich Montag 05:00: Weekly Report Generation (Elite)
new CronJob('0 5 * * 1', async () => {
  const eliteUsers = await getUsersByTier('elite');
  for (const userId of eliteUsers) {
    await generateWeeklyDeepReport(userId);
  }
}, null, true, 'UTC');
```

---

## Phase 6: User-Onboarding Flow

```typescript
async function onboardNewUser(userId: string): Promise<void> {
  // 1. Coach Profile mit Defaults anlegen
  await db.insert(buddy.user_coach_profile).values({
    user_id:               userId,
    coach_name:            'Buddy',
    coach_personality:     'motivator',
    autonomy_level:        3,
    intervention_threshold: 'medium',
    feature_tier:          'free',
  }).onConflictDoNothing();

  // 2. Coach Preferences (leer starten)
  await db.insert(buddy.coach_profiles).values({
    user_id:      userId,
    feature_tier: 'free',
    module_access: {
      nutrition: true, training: true, recovery: true,
      supplements: true, medical: false, goals: true,
    },
  }).onConflictDoNothing();

  // 3. Default Journey anlegen
  await createDefaultJourney(userId);

  // 4. Initial Buddy State
  await db.insert(buddy.buddy_state).values({
    user_id: userId,
  }).onConflictDoNothing();
}
```

---

## Verifikation

```sql
-- System Rules vorhanden?
SELECT rule_name, category, priority FROM buddy.buddy_rules
WHERE is_system_rule = true ORDER BY priority DESC;
-- Erwartet: 12 System-Regeln

-- Knowledge Base?
SELECT category, COUNT(*) FROM buddy.knowledge_base GROUP BY category;
-- Erwartet: nutrition, training, recovery, supplements, medical

-- Feature Gate Config?
SELECT feature_key, required_tier FROM buddy.feature_tier_config
ORDER BY required_tier, feature_key;
-- Erwartet: 14 Einträge

-- User Onboarding?
SELECT COUNT(*) FROM buddy.user_coach_profile;
SELECT COUNT(*) FROM buddy.coach_journey;
-- Beide müssen übereinstimmen

-- Cron Jobs laufen?
SELECT * FROM buddy.buddy_state WHERE updated_at < now() - INTERVAL '25 hours';
-- Sollte leer sein (täglich aktualisiert)
```
