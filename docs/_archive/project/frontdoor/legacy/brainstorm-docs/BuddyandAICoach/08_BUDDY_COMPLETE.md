# LUMEOS — Buddy: Vollständige Spezifikation
> Konsolidiert aus ALLEN Buddy-Dokumenten | 2026-04-14
> Quellen: BUDDY-MASTER-ARCHITECTURE.md, coach-buddy-killer-feature.md v1.6,
> coach-buddy-output-contract.md, coach-buddy-intervention-contract.md,
> BUDDY_AUTONOMY_SYSTEM.md, BUDDY_TECHNICAL_SPEC.md, BUDDY-V2-BLUEPRINT.md,
> BUDDY-V3-BLUEPRINT.md, ARCHITECTURE_SPECS/* (alle), BuddyV2-spec/* (alle),
> core/*, reasoning/*, execution/*, intelligence/*, cognition/*

---

## 1. Kernformel

```
Buddy = Gehirn
LumeOS = Betriebssystem
UI = Anzeige

Körperdaten → Buddy → Entscheidung/Empfehlung → Aktion im Ökosystem
```

Buddy ist nicht ein Feature. Buddy ist das zentrale System.
LumeOS visualisiert was Buddy weiss. Das LLM ist die austauschbare Kommunikationsschicht.
Die Buddy-Engine (State / Memory / Watcher / Rules) ist das echte Asset.

**Ein Superagent.** Keine Multi-Agent-Architektur. Ein zentraler Buddy mit internen Modulen.

---

## 2. Was Buddy ist — und nicht ist

### IST
- Persistenter, personalisierter AI-Coach der den User KENNT
- Zentrales Interface: Chat, Voice, Cards, Actions
- Entscheidungsengine: regelbasiert, deterministisch, testbar
- Monitoring-System: läuft dauerhaft pro User
- Automatisierungsplattform: löst Aktionen im System aus
- Eine Beziehung, kein Tool

### IST NICHT
- Kein generischer Chatbot mit Fitness-Prompt
- Kein eigenes LLM (LLM ist austauschbar)
- Kein autonomer Superagent der eigenständig entscheidet
- Kein Ersatz für Arzt, Physio oder Wettkampf-Coach
- Keine Black Box (User + Coach sehen Memory, Freigaben, Entscheidungen)
- Keine Magie — v1 ist deterministisch + testbar

---

## 3. System-Architektur (6 Layers)

```
Layer 1 — INPUT
  ├── App Inputs (Workout, Meal, Check-in, MealCam)
  ├── Coach Inputs (Regeln, Overrides, Freigaben)
  ├── Health Data (Wearables opt-in, Blutwerte, Weight)
  ├── Commerce Data (Wallet, Bestellungen)
  └── System Events (Timers, Reminders, Cron)

Layer 2 — NORMALISIERUNG
  ├── Einheiten-Konvertierung
  ├── Zeitachse + Eventbildung
  ├── Muskelgruppen-Mapping
  ├── Zielbezug-Berechnung
  └── Food-Preference Matching

Layer 3 — USER STATE
  ├── Memory (Fakten, Präferenzen, Ziele, Historie, Coach-Regeln)
  ├── Aktueller Status (heute: Makros, Training, Recovery, Supps)
  ├── Scores (Nutrition, Recovery, BSS, Training Volume)
  ├── Freigaben (was darf Buddy autonom?)
  └── Behavioral Signature (Muster + Trigger, ab 8 Wochen Daten)

Layer 4 — WATCHER (Event-basiert, Sensor-System)
  ├── Erkennt Muster in State-Veränderungen
  ├── Produziert Events → Rule Engine
  └── Vollständige Liste: Abschnitt 8

Layer 5 — DECISION ENGINE
  ├── Regelbasiert (if/then, Scores, Priorities, Trigger)
  ├── Intervention Selection (Buckets + Typen)
  ├── Safety Gates (Medical, Supplement, Manipulation Guard)
  ├── Cooldowns + Intervention Load Limits
  ├── Conflict Resolution: Safety > Recovery > Training > Nutrition > Behavior
  └── KEIN ML in v1 — deterministisch + testbar

Layer 6 — BUDDY INTERFACE
  ├── Chat (Text, Streaming SSE)
  ├── Voice (STT Whisper + TTS, Gym-Commands <200ms)
  ├── UI Action Cards (Empfehlungen, Buttons, Quick Actions)
  ├── Push Notifications (Smart, lernende Frequenz)
  ├── Commerce Actions (Bestellen, Buchen)
  └── Coach Dashboard (Human Coaches: Client-Übersicht)
```

---

## 4. Interne Engines (11 Engines)

Engines sind deterministisch. Sie berechnen, nicht erklären. LLM erklärt ihre Outputs.

| Engine | Inputs | Outputs |
|---|---|---|
| **Nutrition Engine** | food_events, macro_targets, bodyweight, meal_timing | nutrition_score, protein_gap, calorie_gap, macro_balance, micronutrient_deficits, recommendation_candidates |
| **Training Engine** | set_logs, workout_templates, exercise_metadata, training_history, fatigue | training_readiness, progression_state, fatigue_flags, overreach_risk, suggested_adjustments |
| **Recovery Engine** | sleep_duration, sleep_regularity, training_load, subjective_fatigue, HRV | recovery_score, recovery_drivers, deload_recommendation, sleep_priority_flag |
| **Biomarker Engine** | blood_values, reference_ranges, user_sex/age, lab_history | biomarker_risk_flags, drift_summary, escalation_recommendation, explanation_keys |
| **Supplement Engine** | supplement_stack, dosage_data, UL/RDA, timing, interactions | stack_safety_score, interaction_flags, redundancy_flags, gap_suggestions |
| **Body Composition Engine** | bodyweight_history, goal, calorie_intake_history, estimated_expenditure | composition_score, phase_state, projected_weight_change |
| **Behaviour Engine** | logging_consistency, routine_adherence, missed_targets, completion_rate | compliance_score, adherence_pattern, habit_focus_candidates |
| **Circadian Engine** | sleep_timing, wake_timing, meal_timing, training_timing, timezone | circadian_alignment_score, timing_flags, optimal_window_hints |
| **Energy Availability Engine** | calorie_intake, bodyweight_trend, expenditure, training_volume | energy_availability_score, underfueling_flags |
| **Stress Load Engine** | training_load, sleep_quality, subjective_stress, schedule_load | stress_load_score, overload_flags, workload_adjustment_candidates |
| **Electrolyte Engine** | sodium, potassium, magnesium intake, hydration | electrolyte_balance_score, imbalance_flags, intake_gaps |

**Geplante zukünftige Engines:** symptom, injury_risk, hormonal_pattern, digital_twin_simulation, intervention_learning

---

## 5. User Profile System (4 Layers)

```
Layer 1: STATIC (Onboarding)
  Name, Alter, Geschlecht, Größe, Gewicht, Körperfett
  Ziel, Erfahrungslevel, Trainingsfrequenz, Equipment, Sprache, Einheiten
  Coach-Name & Persönlichkeit

Layer 2: PREFERENCES (wächst über Zeit — editierbar)
  Food: Likes, Dislikes, Allergien, Intoleranzen, Küchen, Diätform, Global Exclusions
  Exercise: Präferenzen, Abneigungen
  Supplements: Budget, Darreichungsform
  Zeitfenster, Kochfähigkeit, Meal Prep
  Kommunikation: Humor, Direktheit, Detail-Level
  Motivations-Trigger

Layer 3: HISTORY (automatisch aus App-Daten)
  Training: Alle Workouts, Sets, Reps, Gewichte, RPE seit Tag 1
  Nutrition: Meals, Makros, Adherence, MealCam
  Körper: Gewichtsverlauf, Fotos, DEXA
  Blutwerte: Lab-Results mit Zeitverlauf
  Supplements: Zyklen, Compliance
  Schlaf/Recovery: Scores, Check-ins, HRV
  Verletzungen: Historie + aktuelle Einschränkungen
  Stimmung/Wellness: Tägliche Ratings

Layer 4: RELATIONSHIP (Coach-spezifisch)
  Gesprächs-Historie (Zusammenfassungen)
  Meilensteine (PRs, Streaks, Transformations-Punkte)
  Inside References (Witze, Motivations-Anker)
  Trust Score + Push Tolerance (lernt über Zeit)
  Coaching Feedback (was funktioniert, was nicht)
  Persönliche Notizen ("Prüfungsphase", "Urlaub nächste Woche")
```

**DB-Tabellen:**
- `user_coach_profile` — coach_name, personality, communication_style JSONB, wake_word
- `user_preferences` — category ENUM, key, value, learned_at, source
- `user_milestones` — type, title, achieved_at, celebrated BOOLEAN
- `coach_memory` — content, category, importance, timestamp (RAG-Embeddings)

---

## 6. State System

State = aktuelle messbare Kondition eines Users. Buddy reasont auf State, nicht auf Rohdaten.

```
State Flow:
Raw Data → State Builder → State Objects → Watchers monitor → Rule Engine evaluates
```

### State Domains

**Training State**
training_sessions_7d, training_sessions_30d, training_adherence_score,
exercise_failure_rate, training_volume_week, training_volume_delta, heavy_training_day_flag

**Nutrition State**
calories_today, protein_today, carbs_today, fat_today,
protein_target, calorie_target, macro_balance_score, hydration_score,
protein_gap, calorie_gap, micronutrient_deficits

**Recovery State**
sleep_hours, sleep_score, recovery_score, fatigue_score,
soreness_score, rest_day_gap, hrv_score

**Body State**
bodyweight, weight_trend_7d, weight_trend_14d,
rapid_weight_loss_flag, rapid_weight_gain_flag

**Behavior State**
logging_consistency_score, plan_rejection_rate,
coach_message_response_rate, adherence_score

**Safety State**
pain_flags, dizziness_flags, medical_flags, injury_risk, medical_escalation_required

### Composite Scores
training_score, nutrition_score, recovery_score, adherence_score, risk_score

**DB: `buddy_state` (1:1 pro User)**
```sql
user_id, training_score, nutrition_score, recovery_score,
adherence_score, risk_score, snapshot_json, updated_at
```

---

## 7. Event System

Jede bedeutende User-Aktion wird als Event repräsentiert.
Events sind append-only, idempotent, mit separatem event_timestamp + processing_timestamp.

```
Flow:
Event accepted → Schema validation → Event persisted → Queue dispatch
→ Processor updates state → Affected engines re-evaluate → Snapshots refreshed
```

### Event-Kategorien

**Capture Events**
meal_logged, meal_photo_captured, set_logged, bodyweight_logged,
supplement_taken, sleep_logged, note_added

**Session Events**
workout_started, workout_completed

**Import Events**
blood_test_imported, wearable_sync_completed, external_food_imported

**System Events**
event_synced, event_reprocessed, state_snapshot_updated

**Training Events**
workout_logged, workout_missed, exercise_failed, training_completed

**Recovery Events**
sleep_logged, recovery_score_updated

**Body Events**
bodyweight_logged

**Supplement Events**
supplement_taken

### Event Entity Schema
```sql
event_id, user_id, device_id, event_type, payload,
event_timestamp, created_at, sync_status, source, idempotency_key
```

**Sync States:** local_only | pending_sync | synced | failed | superseded

**Rebuild Capability:** User State muss aus Event History vollständig rekonstruierbar sein.

**Conflict Handling:** Prefer append + supersede. Kein silent destructive overwrite. Provenance erhalten.

**DB: `buddy_events` (append-only)**
```sql
id, user_id, event_type, source_engine, payload_json, created_at, processed_at
```

---

## 8. Watcher System

Watchers = Sensor-System von Buddy.
Buddy "denkt" nicht konstant. Buddy reagiert auf Events die Watchers produzieren.

```
State → Watcher detects pattern → Event generated → Rule Engine → Action
```

### Vollständige Watcher-Liste

**Training Watchers**
missed_workout, missed_workouts_3x_7d, exercise_failure_rate_high,
training_volume_spike, training_volume_drop, training_adherence_drop,
exercise_avoidance, pain_flag_exercise

**Nutrition Watchers**
protein_gap_end_of_day, calorie_deficit_large, calorie_surplus_large,
meal_skipped, meal_logging_dropout, micronutrient_risk, fiber_low, hydration_low

**Recovery Watchers**
sleep_score_low, recovery_score_low, fatigue_trend_up, rest_day_missing, soreness_persistent

**Behavior Watchers**
logging_dropout, plan_rejection, adherence_drop, coach_message_ignored

**Safety Watchers**
pain_flag, dizziness_report, rapid_weight_loss, rapid_weight_gain, extreme_calorie_deficit

### V2 Watcher-Erweiterungen
**Trend Watchers:** weight_plateau (14d), recovery_decline, compliance_drop
**Pattern Watchers:** training_skipped_after_bad_sleep, weekend_nutrition_collapse
**Risk Watchers:** pain_escalation, burnout_signals

---

## 9. Rule Engine

Alle Entscheidungen laufen durch Rules. Kein Free-Form LLM-Reasoning für Decisions.

```
Watcher Event → Rule Engine → Conditions evaluated → Decision produced → Action Layer
```

### Rule Format (JSON)
```json
{
  "rule_id": "RULE_RECOVERY_002",
  "name": "Low recovery before heavy training day",
  "domain": "recovery",
  "enabled": true,
  "priority": "high",
  "trigger": { "event_type": "sleep_logged" },
  "conditions": [
    { "field": "state.recovery_score", "operator": "<", "value": 50 },
    { "field": "state.heavy_training_day_flag", "operator": "==", "value": true }
  ],
  "decision": { "decision_type": "training_adjustment", "decision_key": "reduce_training_volume" },
  "actions": [
    { "action_type": "reduce_training_volume", "payload": { "percent": 20 } },
    { "action_type": "send_user_message", "payload": { "template": "recovery_low_training_adjusted" } }
  ],
  "cooldown": { "type": "hours", "value": 24 },
  "safety": { "policy_required": false, "escalate_if_blocked": false },
  "explanation": {
    "short": "Training volume was reduced because recovery is currently low.",
    "coach_note": "Heavy training day with recovery score below threshold."
  },
  "version": 1
}
```

### Condition Operators
`>`, `>=`, `<`, `<=`, `==`, `!=`, `in`, `not_in`

### Conflict Resolution
1. Higher priority wins
2. Safety rules override all
3. Same-priority → multiple non-conflicting decisions erlaubt
4. Cooldown blockiert wiederholte Duplikate

### Priority Order
Safety > Recovery > Training > Nutrition > Behavior

### Design Rules (Non-Negotiable)
- Rules enthalten kein Free-Form Reasoning
- Rules rufen keine LLMs direkt auf
- Rules evaluieren nur State und Event Fields
- Rules sind testbar mit Fixtures
- Rules sind editierbar ohne Code-Änderungen

### Vollständiger Rule Catalog

**Nutrition Rules**
protein_gap_end_of_day > 30g → suggest_high_protein_meal
calorie_deficit_large 3 days → notify_coach
hydration_low → suggest_hydration

**Training Rules**
missed_workouts_3x_7d → notify_coach
pain_flag_exercise → suggest_exercise_swap
training_volume_spike → monitor_recovery

**Recovery Rules**
recovery_score < 50 AND heavy_training_day → reduce_training_volume (-20%)
sleep_score_low 3 days → suggest_rest_day

**Behavior Rules**
logging_dropout > 5 days → send_compliance_nudge
coach_message_ignored → notify_coach

**Safety Rules**
dizziness_report → escalate_to_coach + pause_training_actions
rapid_weight_loss → notify_coach
extreme_calorie_deficit → stop_weight_loss_protocol + notify_coach
pain_flag → suggest_exercise_swap + notify_coach

### V2 Coach Automation Rules
```
IF soreness > 7         THEN replace exercise
IF weight stagnates 14d THEN increase carbs +25g
IF sleep < 5h           THEN reduce training intensity
IF pain_flag repeated   THEN notify coach
```

**DB: `buddy_decisions`**
```sql
id, user_id, event_id, rule_id, decision_type, confidence, explanation, created_at
```

---

## 10. Action Layer

Actions führen Decisions aus. Sie entscheiden nie selbst was zu tun ist.

### Vollständiger Action Catalog

**Messaging**
send_user_message, send_coach_alert, notify_coach

**Coaching Suggestions**
suggest_meal, suggest_snack, suggest_rest_day, suggest_sleep_focus, suggest_hydration,
suggest_high_protein_meal, suggest_exercise_swap

**Training Adjustments**
reduce_training_volume (percent), adjust_training_intensity, suggest_deload

**Session Actions (Live Workout)**
START_TIMER(seconds), EXTEND_TIMER(seconds), LOG_SET(weight, reps, rpe, notes),
NEXT_EXERCISE, REPEAT_LAST, PAUSE_SESSION, END_SESSION,
REQUEST_INPUT(type: weight|reps|rpe|energy|pain|choice|rating|confirm),
SHOW_SUMMARY(type: session|week)

**Commerce Actions**
ORDER_SUPPLEMENT, SUGGEST_MEAL, NOTIFY_COACH, ADJUST_WORKOUT

**Coach Commands (Coach-only)**
/override_rule, /adjust_macros, /adjust_calories, /force_deload,
/send_message, /create_task, /enable_automation, /disable_automation, /request_report

**Tasks**
create_coach_task, generate_weekly_report, generate_monthly_report,
activate_automation, pause_training_actions, stop_weight_loss_protocol

**Rules für Actions:**
- Actions sind Vorschläge/Commands. Events sind Wahrheit.
- Jede Action hat action_id (Idempotenz: doppelte Auslieferung = noop)
- action_result: { status: applied|rejected|noop, emitted_events: [] }
- Action kann 0..n Events erzeugen
- Kein State-Change ohne Event
- Coach Commands werden geloggt. High-Risk Commands brauchen Bestätigung.

**DB: `buddy_actions`**
```sql
id, decision_id, user_id, action_type, payload_json, status, executed_at
```

---

## 11. Memory System

### Memory Types

| Type | Beispiel | Decay |
|---|---|---|
| PREFERENCE | "mag keinen Fisch", "bevorzugt Dumbbells" | Nie (bis explizit geändert) |
| MILESTONE | PR, Streak, Habit erreicht | Nie |
| CONTEXT_NOTE | "Urlaub nächste Woche", "Prüfungsphase" | Ja (nach Relevanz) |
| COACHING_OUTCOME | "Deload hat geholfen", "Meal Prep klappt nicht" | Langsam |

**Preference Memory:** preferred_meals, disliked_foods, favorite_exercises, preferred_training_time

**Behavior Memory:** frequently_skipped_workouts, logging_pattern, coach_response_pattern, plan_rejection_pattern

**Success Memory:** meal_suggestion_success, exercise_swap_success, deload_success, compliance_nudge_success

### Memory Fields
raw_text, summary (1-2 Sätze), type, importance_score (0-1), ttl/decay,
source_event_id, retrieval_tags, confidence (0-1), evidence_count, last_seen

### Memory Rules
- Ein einzelnes Event erstellt kein Memory
- Wiederholtes Muster erhöht Confidence
- Ungenutztes Memory decayed über Zeit
- Memory wird NUR aus Events erzeugt, nicht aus jedem Chat
- Memory ist in 4 hierarchischen Schichten: Working / Episodic / Semantic / Procedural

### Memory Hierarchie (Technical)
```
Working Memory:    currentConversation, todayInteractions, immediateGoals, emotionalState
Episodic Memory:   conversationHistory, significantEvents, achievements, challenges, milestones
Semantic Memory:   userPreferences, healthGoals, personalityTraits, lifestylePatterns
Procedural Memory: effectiveStrategies, communicationPatterns, interventionHistory
```

**DB: `buddy_memory`**
```sql
id, user_id, memory_type, memory_key, memory_value_json,
confidence, last_seen, updated_at, evidence_count, source_event_id
```

---

## 12. Persona System (5 Stile)

**Persönlichkeit = Stil, nicht Modus.** Intensität passt sich an Relationship State an.
Drill Sergeant wird zu "Tough Love mit Empathie" bei hohem Stress.

| Persona | Vibe | Stil-Beispiel |
|---|---|---|
| 🔬 Scientist | Evidenz-basiert, nüchtern | "Der Winkel aktiviert den oberen Brustanteil stärker." |
| 💪 Motivator | Energetisch, feiernd | "BOOM! Neuer PR! 🔥" |
| 🎖️ Drill Sergeant | Hart, direkt | "Keine Ausreden. Wir sind hier um zu arbeiten." |
| 😊 Best Friend | Locker, supportive | "Hey, lass uns schauen was heute drin ist." |
| 🧘 Zen Master | Weise, geduldig | "Spüre die Kontraktion. Der Weg ist das Ziel." |

**Scientist Guard:**
- ❌ "EMG-Studien zeigen..." / "Meta-Analysen belegen..."
- ✅ "Der Winkel aktiviert diesen Muskel stärker."
- Evidence NUR in UI Cards (📚 Warum?-Button)
- Sobald Lab-Werte → Medical Gate übersteuert Ton komplett

**Emotional Coherence Model:**

Coach Relationship State:
- trust_score (0-1): steigt mit Zeit + positiven Interaktionen
- push_tolerance (0-1): wie viel Konfrontation verträgt User gerade?
- recent_adherence (0-1): letzte 7 Tage
- recent_stress (0-1): erkannte Stress-Signale
- relationship_weeks (int)

Einfluss auf Verhalten:
- trust LOW → ermutigend, nicht fordernd, keine harten Konfrontationen
- trust HIGH + push_tolerance HIGH → direkte Konfrontation erlaubt
- recent_stress HIGH → Ton weicher, unabhängig von gewählter Persönlichkeit
- recent_adherence LOW + trust HIGH → Coach darf konfrontieren: "Was ist los?"

---

## 13. Output Contract — JSON Schema v0.1

**LLM liefert strukturiert. UI/Voice rendert nur. Alle Zahlen aus Engine-Fields.**

```json
{
  "$schema": "coach-response-v0.1",
  "intent": "string (required)",
  "speech_text": "string — natürliche Sprache, gesprochen/angezeigt",
  "ui_cards": [
    {
      "type": "stat | comparison | list | chart | exercise | meal_plan | action_prompt | EVIDENCE_CARD",
      "title": "string",
      "data": {},
      "priority": "high | normal | low"
    }
  ],
  "actions": [
    {
      "id": "uuid",
      "type": "ACTION_TYPE",
      "params": {},
      "requires_confirmation": "boolean"
    }
  ],
  "safety_flags": [],
  "evidence": [
    { "source_id": "kb:doc-id", "title": "string", "relevance": 0.0 }
  ],
  "expects_input": "boolean",
  "input_type": "free_text | number | choice | rating | confirm",
  "choices": []
}
```

**Intent Values (v0.1):**
workout_intro, exercise_intro, set_prompt, set_feedback, rest_timer, motivation,
workout_summary, meal_suggestion, meal_feedback, supplement_info, health_info,
weekly_review, milestone, check_in, general_chat, safety_redirect, fatigue_warning

**Evidence-Pflicht:**
- Keine Studien-Claims, Jahreszahlen oder "Studie zeigt" im speech_text
- Evidence NUR in UI Cards (EVIDENCE_CARD Typ)
- Kein RAG-Treffer = keine wissenschaftliche Behauptung
- Keine frei erfundenen Studien, Jahreszahlen, Autorennamen

**Rendering:**
- Voice Mode: spricht nur speech_text, Actions im Hintergrund, UI Cards auf Screen
- Text Mode: speech_text als Chat-Bubble, UI Cards als Rich-Content, Actions als Buttons
- safety_flags nicht leer → Disclaimer-Banner persistent

---

## 14. Medical Safety Gate

### Buddy DARF
- ✅ Werte erklären + als auffällig markieren
- ✅ Trends nennen
- ✅ Erneute Tests vorschlagen (Marker benennen)
- ✅ Zur ärztlichen Abklärung raten

### Buddy DARF NICHT
- ❌ Diagnosen nennen oder Ursachen behaupten
- ❌ Dosierungen empfehlen (mg, g, IU)
- ❌ Therapien empfehlen
- ❌ Supplements aus Blutwerten ableiten (Entkopplung!)
- ❌ "Das erklärt deine Müdigkeit" sagen

### Safety Triggers
pain_flag, dizziness_report, extreme_calorie_deficit, rapid_weight_loss, medical_flag

### Safety Actions
notify_coach, escalate_to_coach, block_action, pause_training, stop_protocol

### Medication Gate
Medikament geloggt → Medical Gate overrules alles → Nur: "Kläre mit Arzt/Apotheker."
Keine Interaktions-Aussagen, keine Timing-Empfehlungen.

### Lab Reference Ranges
- Nur aus `lab_reference_ranges` Tabelle oder Labor-Metadaten
- LLM darf KEINE Ranges frei formulieren
- Kein Range in Daten → Wert nennen, NICHT als "auffällig" markieren

### Scientist Guard
- Keine Studien-Zitate im Speech
- Evidence nur in UI Cards
- Kein cite in speech_text

### Policy Gate (serverseitig, vor jedem Response)
- PASS → Antwort ist safe
- REDACT + SAFE_REWRITE → Problematische Teile entfernen/umschreiben
- BLOCK + ESCALATE → Komplett ersetzt durch Arzt-Verweis

### Safety Priority
Safety overrides Recovery, Training, Nutrition, Behavior — immer.

---

## 15. Supplement Dosing Policy

Coach darf:
- Supplement-Kategorien nennen (Vitamin D, Kreatin, Magnesium)
- Allgemeine Anwendungshinweise (Dauereinnahme, mit Mahlzeit)

Coach darf NICHT:
- Konkrete Mengen (mg, g, IU) empfehlen
- Markennamen oder Extrakt-Bezeichnungen (KSM-66, Creapure) empfehlen
- Supplements als Reaktion auf Laborwerte vorschlagen

**Supplement Reminder Policy:**
Reminders nur für status=ACTIVE + source=confirmed_by_user.
Keine Reminders für coach_suggested ohne explizite User-Bestätigung.

---

## 16. Manipulation Guard

### Verbotene Narrative
- ❌ Angst: "Wenn du aufhörst, verlierst du alles"
- ❌ Schuld: "Du hast dein Versprechen gebrochen"
- ❌ Streak-Shaming: "154 Tage — willst du das wirklich wegwerfen?"
- ❌ Künstlicher Druck: "Dein Streak ist in Gefahr!"
- ❌ Sozialer Vergleich als Druck: "Andere in deinem Alter schaffen mehr"

### Hard Caps

**max_intervention_intensity (0-1):**
```
0.0-0.3: Nur Encouragement + Adjustment
0.3-0.6: + Analytical Confrontation (Default)
0.6-0.8: + Direkte Konfrontation (nur trust ≥ 0.75)
0.8-1.0: Reserved — nur manuell freischaltbar
```
Engine darf max_intervention_intensity NIE autonom über 0.8 setzen.

**intervention_load_7d:**
```
max_interventions: 5/Woche
max_confrontations: 2/Woche
max_identity_statements: 3/Woche
→ Limit erreicht = Stille. Manchmal ist Nicht-Intervenieren die stärkste Intervention.
```

---

## 17. Adaptive Intervention Engine

Coach Buddy optimiert nicht "Antworten". Er optimiert **Verhaltensstabilität**.
Output ist kein Text. Output ist ein Intervention-Plan. Text ist nur Rendering.

### Die drei Moats

**Moat 1: Behavioral Signature**
Verhaltensmodell pro User aus Muster + Trigger + Reaktion:
- Stressphase → Training skippt
- Zahlen motivieren stärker als Empathie
- Protein unter Schwelle → Adherence kollabiert
- Bestimmte Wochentage/Uhrzeiten → Dropout-Risiko

Confidence-Thresholds (Pflicht pro Pattern):
```json
{ "detected": true, "confidence": 0.74, "sample_size": 11,
  "first_observed": "2026-01-15", "last_confirmed": "2026-03-10" }
```
- < 0.5: Pattern nicht verwenden
- 0.5-0.7: Intervention beeinflussen, keine Identity-Claims
- > 0.7: Identity Reinforcement erlaubt
- Minimum: 8 Wochen Events oder definierter Threshold

**Moat 2: Intervention Memory**
Jede Intervention als Experiment geloggt: Kontext → Intervention → Tonalität → Ergebnis.
Personalisiertes Playbook. Emergentes Wissen. Nicht exportierbar.

**Moat 3: Identity Reinforcement**
```
Phase 1 (Monat 1-2):  Observe — keine Identity-Claims
Phase 2 (Monat 3-4):  Mirror — "Du hast 3 Wochen durchgehalten"
Phase 3 (Monat 5+):   Reinforce — "Du bist jemand der nicht skippt"
```
Phase-Upgrade: trust_score ≥ 0.60 (Mirror) / ≥ 0.75 (Reinforce)

### Intervention Log Schema
```json
{
  "intervention_id": "uuid",
  "user_id": "uuid",
  "timestamp": "ISO",
  "context_vector_id": "uuid",
  "intervention_type": "confrontation | encouragement | adjustment | redirect | silence",
  "tone_variant": "direct | soft | humorous | analytical | tough_love",
  "observed_outcome": "accepted | rejected | ignored | engaged",
  "effectiveness_score": 0.85,
  "cooldown_until": "ISO",
  "selection": {
    "bucket": "high_stress__missed_workout",
    "candidates_scored": [...],
    "selected": "confrontation__direct",
    "backup": "adjustment__analytical",
    "selection_reason": "historical_effectiveness"
  }
}
```

### Context Vector (deterministisch, offline-berechenbar)
```json
{
  "features": {
    "sleep_3d_avg": 5.2,
    "missed_workouts_7d": 2,
    "protein_adherence_7d": 0.58,
    "training_streak_days": 0,
    "stress_proxy": 0.75,
    "time_of_day": "morning",
    "day_of_week": "wednesday"
  },
  "relationship": {
    "trust_score": 0.82,
    "push_tolerance": 0.71,
    "preferred_tone": "direct",
    "identity_phase": "reinforce"
  },
  "intervention_limits": {
    "max_intervention_intensity": 0.6,
    "intervention_load_7d": {
      "total": 3, "max_total": 5,
      "confrontations": 1, "max_confrontations": 2
    }
  }
}
```

### Intervention Selection Algorithm (v1 — deterministisch)
1. Bucket bestimmen (z.B. high_stress + missed_workout)
2. Candidate Interventions (feste Liste pro Bucket)
3. Score = historical_effectiveness × risk_penalty × fatigue_penalty
4. 1 Primary + 1 Backup (falls Primary abgelehnt)

**Cooldowns:**
- confrontation: 48h Default
- encouragement: 24h Default
- adjustment: 12h Default
- Safety Override: immer möglich

### Behavior Stability Score (BSS)

**BSS = (Stability × 0.5) + (Goal Alignment × 0.5)**

Stability allein reicht nicht: Stabil 2×/Woche bei Ziel 5× = BSS niedrig.

```
Stability Score: f(Varianz: Workouts/Woche, Makro-Drift, Sleep, Dropout-Events)
Alignment Score: f(Actual vs Target: Workouts, Makros, Body Composition Trend)

Beispiele:
  Stabil 2×/Woche, Ziel 5×  → Stability 90, Alignment 30 → BSS 60
  Schwankend 3-5×, Ziel 5×  → Stability 55, Alignment 75 → BSS 65
  Stabil 4-5×, Ziel 5×      → Stability 85, Alignment 90 → BSS 88
```

**Bounceback Time = strategisch stärkster Sub-Score.** Misst Resilienz, nicht Perfektion.

BSS wird aus Events berechnet (nie aus Chat), lokal, reproduzierbar.

**DB: `bss_snapshots`**
```json
{
  "user_id": "uuid", "computed_at": "ISO", "period": "rolling_90d",
  "stability": {
    "training_consistency": 78, "nutrition_adherence_stability": 68,
    "recovery_stability": 55, "dropout_events": 70, "bounceback_time": 82,
    "stability_score": 71
  },
  "goal_alignment": { "training": 84, "nutrition": 72, "body_composition": 80, "alignment_score": 72 },
  "bss_total": 71, "bss_trend": "improving", "bss_delta_vs_prior": 4
}
```

### 5 Beispiel-Interventionen (Output-Payloads)

**Beispiel 1: Stress-Dropout Prävention (Mittwoch 17:15)**
```json
{
  "intent": "check_in",
  "speech_text": "Mittwoch, 17 Uhr. Ich kenne das Muster. Du willst skippen. Aber du bist seit 18 Wochen dabei. 30 Minuten. Das reicht heute.",
  "choices": ["Bin dabei, 30 Min", "Nicht heute", "Morgen doppelt"]
}
```

**Beispiel 2: Eskalation nach ignorierter Intervention**
```json
{
  "speech_text": "Ich hab gestern weich gefragt. Hat nicht funktioniert. Hier sind die Zahlen: 3 Tage kein Training, Protein bei 58%. Das ist ein Abwärtstrend.",
  "choices": ["20 Min Compounds, bin dabei", "Morgen", "Diese Woche nicht"]
}
```

**Beispiel 3: Identity-Claim blockiert (Low Trust)**
Keine Identity-Statements bei trust_score 0.35. Nur neutrale Fakten.

**Beispiel 4: Cooldown aktiv — Intervention unterdrückt**
Keine Aktion. Stille ist auch eine Entscheidung.

**Beispiel 5: BSS-basierter Monatsreview**
```json
{
  "speech_text": "3 Monate. Dein Stability Score ist von 58 auf 71 gestiegen. Du wirst konsistenter — nicht nur stärker, stabiler. Rückfälle dauern kürzer.",
  "input_type": "free_text"
}
```

### Gold Path Tests (v1)
1. Stressphase erkannt → passende Intervention → Adherence steigt
2. Falscher Ton → User lehnt ab → Engine wählt Backup
3. Identity-Claim blockiert bei low trust_score
4. Intervention nicht wiederholt während Cooldown
5. BSS-Berechnung reproduzierbar aus Event Replay

---

## 18. Live Workout Session Mode

### State Machine
```
IDLE → SESSION_START → EXERCISE_INTRO → SET_ACTIVE → SET_COMPLETE → REST →
  ├── NEXT_SET → SET_ACTIVE (loop)
  └── NEXT_EXERCISE → EXERCISE_INTRO (loop)
      └── SESSION_COMPLETE → SUMMARY → IDLE
```

### Session Flow
```
SESSION_START:     Briefing + Energy Check (1-5). Low energy → modifiziertes Workout.
EXERCISE_INTRO:    "Letzte Woche: 24kg × 10. Heute: versuch 26kg."
SET_ACTIVE:        SCHWEIGEN während Set. Motivation nur in letzten Reps.
SET_COMPLETE:      "Gewicht? Reps? RPE?" → LOG_SET → START_TIMER
REST:              "30s." / "10s." / "Los!" → User: "Ready" oder "Mehr Zeit"
SESSION_COMPLETE:  Volume, PRs, Muscle Heatmap, Rating (💪/😐/😩)
```

### Smart Features
- **Progressive Overload:** 2+ Sessions top of rep range → Gewicht erhöhen vorschlagen
- **Fatigue Detection:** Reps >3 Sets fallend → Volume-Reduktion anbieten
- **RPE consistently 9-10:** Letzte 2 Übungen auf 2 Sets reduzieren anbieten
- **Form Reminders:** Erster Set oder user-aktiviert. Lernt welche Cues der User braucht.
- **Superset Flow:** Auto-Scroll zu nächstem Partner, kein extra Rest

### Zeitdruck-Handling
"Nur 30 Minuten" → Supersets vorschlagen: gleicher Stimulus in halber Zeit

### DB: Workout-Daten
```sql
workout_sessions:
  id, user_id, routine_id, started_at, completed_at, duration_minutes,
  overall_rating (1-3), coach_notes, energy_level (1-5),
  total_volume_kg, estimated_calories, prs_achieved JSONB

workout_sets:
  id, session_id, exercise_id, set_number, weight_kg, reps,
  rpe DECIMAL, rir INTEGER, tempo VARCHAR(10), rest_seconds,
  is_pr BOOLEAN, notes, logged_via (voice|manual|auto), completed_at
```

---

## 19. Voice I/O System

### STT (Speech-to-Text)
**Primary:** Whisper on-device (Apple Speech / Whisper.cpp)
- <200ms Latenz, offline-fähig, kostenlos

**Fallback:** OpenAI Whisper API ($0.006/min) oder Deepgram ($0.0043/min)

**Command Recognition (Low-Latency, kein LLM):**
"Fertig", "26 Kilo", "10 Reps", "Nächste", "Pause", "RPE 8", "War schwer", "War leicht"

**Gym-Challenges:** Noise Cancellation Preprocessing, Background Audio Session (EarPods)

### TTS (Text-to-Speech)
| Provider | Qualität | Latenz | Kosten | Phase |
|---|---|---|---|---|
| OpenAI TTS | Sehr gut | 500ms | $0.015/1k chars | Phase 1 |
| ElevenLabs | Exzellent | 300ms | $0.30/1k chars | Phase 2 Premium |
| Apple AVSpeech | OK | Instant | $0 | Offline Fallback |
| Coqui/Local | Variabel | 100ms | $0 | Alternativ |

### Local-First: Offline Workout Mode
Vollständiges Workout ohne Internet möglich. LLM-Features sind Nice-to-have.

---

## 20. Meal Planning Engine

### Plan-Generierung Inputs
- Makro-Targets (P/C/F, Kalorien)
- Food Preferences (Likes/Dislikes, Allergien)
- Meal-Struktur (Anzahl Mahlzeiten, Zeiten)
- Budget, Kochfähigkeit, Zeit, lokale Verfügbarkeit

### Dynamische Anpassung
Cheat Meal → Coach passt Restmakros an: "Kein Stress. Hier dein angepasster Abend."

### Kontextabhängige Vorschläge
- 14:00 nach Training → Post-Workout: schnelle Carbs + Protein
- 22:00, 40g Protein übrig → Casein Shake
- Im Restaurant → "Steak + Reis statt Pommes. ~P:45g C:50g F:15g"
- Sonntag → "Hier dein Prep-Plan für die Woche + Einkaufsliste"

---

## 21. Commerce Layer

Buddy erkennt Bedarf und verbindet mit Wirtschaft. Nicht aggressiv, bedarfsgesteuert.

| Trigger | Aktion |
|---|---|
| Post-Workout + protein_needed | Protein-Shake vorschlagen (Gym-Counter) |
| creatine_inventory < 5 days | "Soll ich nachbestellen?" |
| macro_gap_detected | Restaurant/Delivery vorschlagen |
| Equipment-Bedarf erkannt | Empfehlung im Marketplace |
| Coach-Session nötig | Termin buchen |

**Distribution über Zugehörigkeit:** User gehört zu Coach A + Gym B + Land C → sieht entsprechende Produkte. Wirkt wie Empfehlung, nicht wie Werbung.

**Flow:** User → Buddy → Transaktion → Provision für LumeOS

**V2 neue Tabellen:** commerce_recommendations, automation_logs, voice_commands

---

## 22. Coach Control Layer + Autonomy System

### 5-Level Autonomy System (Buddy-Befugnisse pro Client)

| Level | Name | Farbe | Erlaubte Aktionen |
|---|---|---|---|
| 1 | Supervised 🔒 | Red #ef4444 | Keine (alles braucht Coach-Approval) |
| 2 | Guided 👋 | Amber #f59e0b | Water/Sleep reminders, Basic hydration/rest suggestions |
| 3 | Collaborative 🤝 ⭐ DEFAULT | Blue #3b82f6 | + Nutrition recommendations, Supplement timing, Meal suggestions, Minor macro adjustments (<5%), Recovery suggestions |
| 4 | Adaptive ⚡ | Violet #8b5cf6 | + Deload recommendations, Training volume adjustments, Workout load modifications, Exercise substitutions, Rest day suggestions |
| 5 | Autonomous 🚀 | Green #10b981 | + Program modifications, Goal adjustments, Major macro changes (>5%), Training phase transitions, Supplement stack modifications |

**Recommendation Algorithm:**
Base = Level 3, dann adjustiert nach:
- Experience Level (Beginner -1, Elite +1)
- Relationship Duration (<7 Tage -1, >90 Tage +1)
- Compliance Rate (<70% -1, >90% +1)
- Complexity Flags (Medical, Special Reqs: -1)
Ergebnis: clamped auf 1-5

**DB: Autonomy**
```sql
-- In coach_clients:
ALTER TABLE coach_clients ADD COLUMN autonomy_level INT NOT NULL DEFAULT 3
  CHECK (autonomy_level >= 1 AND autonomy_level <= 5);

CREATE TABLE coach_client_autonomy_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id UUID NOT NULL, client_id UUID NOT NULL,
  old_level INT NOT NULL, new_level INT NOT NULL,
  changed_by UUID NOT NULL, reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Coach Commands (Direct)
```
/override_rule RULE_ID user_id duration
/adjust_macros user_id protein=190 carbs=240 fats=70
/send_message user_id "Take today lighter."
```
Alle Commands geloggt. High-Risk braucht Bestätigung.

### Coach sieht (Dashboard)
- Client-Zusammenfassungen (weekly, monthly)
- Buddy-Interventionen + Outcomes
- Alerts ("Client X braucht Aufmerksamkeit")
- Adherence pro Modul
- Autonomy Level + Change History

### Lock-in durch Produktlogik
Coach verliert Buddy/Monitoring/Client-Daten wenn Zahlung off-platform → natürliches Lock-in ohne Zwang.

---

## 23. Adaptive Complexity (4 User-Level)

Buddy skaliert was er zeigt basierend auf User-Level (automatisch aus experience_level + Nutzungsverhalten):

| Level | Zielgruppe | Was Buddy zeigt |
|---|---|---|
| 1 | Anfänger | "Trainiere Rücken", "Trink Wasser" — kein Overload |
| 2 | Ambitioniert | Trends, Fortschritt, Trainingsanpassungen |
| 3 | Poweruser/Biohacker | Muskelbelastungsmodelle, Recovery-Korrelationen, Advanced Analytics |
| 4 | Coach/Experte | Rohdaten, Parameter, Systemlogik, Client-Aggregationen |

---

## 24. Decision Boundary: Engine vs LLM

### Engine entscheidet (deterministisch, testbar, lokal)
Makros, Kalorien, Remaining Targets, TDEE, PR-Detection, Progressive Overload,
Fatigue/Deload Trigger, Recovery Score, BSS, Intervention-Typ + Intensität,
Safety Policy Checks, Notification Timing, Workout State Machine,
Supplement Reminders, Circadian Engine

### LLM entscheidet (nur Presentation, remote)
Sprache, Tonalität, Kürze, Motivation innerhalb erlaubter Events,
Erklärung von Engine-Entscheidungen, Dialog-Flow, Persönlichkeit

**Harte Regel: LLM darf keine Zahlen erfinden. Alle Zahlen kommen aus Engine-Fields.**

---

## 25. Local-First Architektur

**Lokal (On-Device):**
Rules Engine komplett, Workout Event Stream, Command Recognition (<200ms),
STT Primary (Whisper), Supplement Reminders, Notification Scheduling,
Offline Workout Mode (sync wenn online), Preference Storage, BSS-Berechnung

**Remote (Server):**
LLM Phrasing, RAG Search (KB + Memory), TTS Voice-Generierung,
Cross-Modul Intelligence, Meal Plan Generation, Weekly/Monthly Reviews, Sync + Backup

**Regel:** Deterministisch = lokal. LLM = remote.

---

## 26. Analytics Model

### Analytics Outputs (Aggregated Trends)

**Training:** training_adherence_7d/30d, volume_trend, exercise_failure_trend

**Nutrition:** protein_average_7d, calorie_adherence_7d, hydration_average, macro_balance_trend

**Recovery:** sleep_average_7d, recovery_average_7d, fatigue_trend, rest_day_pattern

**Body:** weight_trend_7d/30d, rapid_change_flags

**Behavior:** logging_consistency_7d, plan_rejection_trend, coach_response_delay

### Reports
- Daily Summary (morgens)
- Weekly Coach Report
- Monthly Progress Report

**DB: `buddy_insights`**
```sql
id, user_id, insight_type, period, value_json, created_at
```

---

## 27. API Surface

```
POST /buddy/events              → Engine Events akzeptieren
GET  /buddy/state/:userId       → Letzter State Snapshot
POST /buddy/evaluate/:userId    → Watcher + Rule Cycle manuell triggern
GET  /buddy/decisions/:userId   → Letzte Decisions
GET  /buddy/actions/:userId     → Letzte ausgeführte Actions
POST /buddy/coach-command       → Coach Command ausführen
GET  /buddy/insights/:userId    → Analytics + Insights
GET  /buddy/memory/:userId      → Memory Entries
POST /buddy/memory              → Memory manuell hinzufügen
DELETE /buddy/memory/:id        → Memory löschen

GET  /api/human-coach/clients/:id/autonomy         → Current + Recommendation
PUT  /api/human-coach/clients/:id/autonomy         → Level updaten
GET  /api/human-coach/clients/:id/autonomy/history → Audit Trail
GET  /api/human-coach/autonomy/levels              → Level-Beschreibungen
```

---

## 28. Vollständiges DB-Schema (Buddy-spezifisch)

```sql
-- State (1:1 pro User)
buddy_state: user_id, training_score, nutrition_score, recovery_score,
  adherence_score, risk_score, snapshot_json, updated_at

-- Events (append-only)
buddy_events: id, user_id, event_type, source_engine, payload_json,
  created_at, processed_at

-- Decisions
buddy_decisions: id, user_id, event_id, rule_id, decision_type,
  confidence, explanation, created_at

-- Actions
buddy_actions: id, decision_id, user_id, action_type, payload_json,
  status, executed_at

-- Memory
buddy_memory: id, user_id, memory_type, memory_key, memory_value_json,
  confidence, last_seen, updated_at, evidence_count, source_event_id

-- Automations (Coach-konfiguriert)
buddy_automations: id, user_id, coach_id, automation_type,
  trigger_spec_json, active, created_at, expires_at

-- Insights
buddy_insights: id, user_id, insight_type, period, value_json, created_at

-- Interventions
intervention_log: intervention_id, user_id, timestamp, context_vector_id,
  intervention_type, tone_variant, observed_outcome, effectiveness_score,
  cooldown_until, bucket, prior_intervention_id, escalation BOOLEAN

-- BSS Snapshots
bss_snapshots: user_id, computed_at, period, stability JSON,
  goal_alignment JSON, bss_total, bss_trend, bss_delta_vs_prior

-- User Coach Profile
user_coach_profile: user_id, coach_name, coach_personality ENUM,
  communication_style JSONB, wake_word

-- User Preferences
user_preferences: user_id, category ENUM, key, value,
  learned_at, source ENUM(onboarding|conversation|behavior|explicit)

-- User Milestones
user_milestones: user_id, type ENUM, title, description,
  achieved_at, celebrated BOOLEAN

-- V2 additional tables:
wearable_data, wearable_daily_summary, trend_metrics, trend_events,
training_adaptations, nutrition_adaptations, coach_rules, automation_logs,
voice_commands, compliance_metrics, weekly_reports
```

---

## 29. Cost Model (Stand Q1/2026)

| User-Typ | LLM | STT | TTS | Total/Monat |
|---|---|---|---|---|
| Casual (Text, 1-2 Interactions/Tag) | $0.25-0.50 | — | — | ~$0.50-0.80 |
| Active (Text+Voice, 3-5/Tag) | $1.00-2.00 | $0.90 | $0.50 | ~$3-4 |
| Heavy (Voice 5×/Woche) | $3-4 | $1.80 | $1.50 | ~$7-8 |

**Pricing-Implikation:**
- Premium ($14.99-24.99): Active User = 75-85% Marge ✅
- Heavy User: Marge 50-65% (Voice als Premium-Only + Token-Budgets per Tier)
- Mitigation: heavy = max 1 Voice-Session/Tag im Standard-Tier

---

## 30. Monetarisierung

**Free:** Text-Chat begrenzt (20 Messages/Tag), Basic Tracking, nur "Motivator" Persona

**Premium (Wallet-Voucher):**
Unlimitierter Text-Chat, Voice-Coaching, Live Workout Mode, alle Personas,
Meal Plans, Supplement Protocols, Proaktive Notifications, Cross-Modul Intelligence,
Reviews, Adaptive Intervention

**Pro (Coaches):**
White-Label Coach, Custom Voice (Voice Cloning), Custom Knowledge Base,
Client Dashboard, Revenue Share (Anteil der Client-Abos)

---

## 31. Buddy Versionen: V1 → V2 → V3

| Version | Rolle | Fokus |
|---|---|---|
| V1 | Buddy hilft | Text, Workout, Nutrition, Memory, Smart Notifications |
| V2 | Buddy arbeitet mit | Trends, Adaptive Training, Voice, Commerce, Wearables |
| V3 | Buddy begleitet + steuert | Digitaler Körperzwilling, Autonome Planung, Multimodal |

### V1 Phasen (aktuell)
- Phase A: Buddy Engine Service, User State Aggregator, Memory, Watcher, Rules, Action Layer
- Phase B: Chat Interface ✅, Personas ✅, Action Cards, Memory-Einsicht UI, Morning Briefing
- Phase C: Modul-Anbindung (Nutrition/Training ✅), Cross-Modul Reasoning, Goals als Bezugspunkt
- Phase D: Coach Layer (Regeln, Overrides, Autonomy, Alerts)
- Phase E: Commerce (Nachbestellung, Meal-Delivery, Wallet)
- Phase F: Voice / Vision / Advanced (STT/TTS, Gym Commands, Form Correction)
- Phase G: Adaptive Intelligence (Behavioral Signature, BSS, Emotional Coherence)

### V2 Erweiterungen
- Wearable Integration (Apple Health, Garmin, Whoop, Oura, Fitbit)
- Trend Engine (7/14/30-Tage Muster)
- Adaptive Training Engine (innerhalb Grenzen)
- Coach Automation Layer
- Multi-Level User Complexity
- Event Pipeline (Realtime), Watcher Scheduler, Commerce API

### V3 Zielarchitektur (3-5 Jahre)
- Digitaler Körperzwilling (individuelles Stoffwechsel-/Trainingsmodell pro User)
- Multimodale Wahrnehmung: Audio (Atemrhythmus, Reps zählen), Vision (Bewegungsqualität, Squat-Tiefe), Physiologie (Wearable + Verhalten)
- Autonome Langzeitplanung (Offseason → Lean Bulk → Cut → Peak)
- Ecosystem-Hub: Coaches, Gyms, Hersteller, Medical, Versicherungen
- Mehrere AI-Modell-Typen: Language, Decision, Prediction, Vision, Audio

---

## 32. Was bereits gebaut ist

| Component | Status |
|---|---|
| User Profiles + Food Preferences (180+ foods, Allergien, Ausschlüsse) | ✅ |
| AI Coach Chat (SSE Streaming) | ✅ Port 5500 |
| 5 Personas | ✅ coach_settings |
| Context Builder (alle Module → ein Context) | ✅ |
| Daily Briefing | ✅ coach_briefings |
| Cross-Module Insight Rules (8 Rules) | ✅ |
| Training / Nutrition / Supplements / Recovery / Medical / Goals APIs | ✅ |
| Progressive Overload Engine (5 Modelle) | ✅ |
| Food Preferences /for-ai Endpoint | ✅ |
| Wallet + Voucher System | 🟡 DB + basic API |
| Watcher System | 🟡 Teilweise (Deload, Nutrition Alerts) |
| **Buddy Engine (Central Coordinator)** | ❌ Noch nicht gebaut |
| **Decision Engine (formalized Rules)** | ❌ Noch nicht formalisiert |
| **Action Layer** | ❌ Noch nicht gebaut |
| Memory-Einsicht UI | ❌ |
| Voice (STT/TTS) | ❌ Phase F |
| Adaptive Intervention Engine | ❌ Phase G |

---

## 33. Die strategische Vision

**Was hier gebaut wird ist keine Fitness-App. Es ist eine Behavior Optimization Engine mit Fitness als Domain.**

Die Architektur (Behavioral Signature, Intervention Memory, BSS, Identity Reinforcement) ist domain-agnostisch. Fitness ist der Trainingsraum, nicht die Grenze.

Drei Kreisläufe:
1. **Wissen** — Coaching, Training, Nutrition, Recovery
2. **Community** — Athleten, Coaches, Gyms
3. **Geld** — Wallet, Marketplace, Provisionen

LumeOS wird zur Finanz- und Wirtschafts-Infrastruktur der Fitnessindustrie.

**Wenn V1 in Fitness funktioniert, ist die Architektur anwendbar auf:**
Lernen/Studium, Business-Routinen, Schlaf-Optimierung, Rehabilitation, Gewohnheitsaufbau

v1 = Fitness. Perfektioniert. Bewiesen. Dann erst Domain-Expansion.

**Buddy darf NIE das Gefühl erzeugen: "Die Maschine kontrolliert mich."**
**Buddy muss IMMER wirken wie: "Mein persönlicher Assistent."**

---

## 34. Implementierte DB-Tabellen (konkret)

### Coach-Modul Tabellen (Port 5500, Migration 011)

```sql
-- Conversations
CREATE TABLE coach_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT,
  persona TEXT DEFAULT 'best_friend'
    CHECK (persona IN ('scientist','motivator','drill_sergeant','best_friend','sensei')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Messages (Sliding Window: 50 persistent, 20 im Context)
CREATE TABLE coach_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES coach_conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user','assistant','system')),
  content TEXT NOT NULL,
  context_snapshot JSONB DEFAULT '{}',
  tokens_used INT DEFAULT 0,
  model TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Daily Briefings (cached, kein LLM-Call nötig = $0)
CREATE TABLE coach_briefings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  briefing_type TEXT NOT NULL CHECK (briefing_type IN ('morning','evening')),
  content JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date, briefing_type)
);

-- Coach Settings
CREATE TABLE coach_settings (
  user_id UUID NOT NULL UNIQUE,
  persona TEXT DEFAULT 'best_friend',
  language TEXT DEFAULT 'de',
  proactive_enabled BOOLEAN DEFAULT true,
  daily_briefing BOOLEAN DEFAULT true,
  insight_notifications BOOLEAN DEFAULT true
);
```

### Buddy Memory System (CB-026, Migration 20260316)

Zwei getrennte Memory-Tabellen mit unterschiedlichem Zweck:

**`buddy_memories`** — Strukturierte typisierte Memories (NEU, CB-026)
```sql
CREATE TABLE buddy_memories (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id),
  memory_type TEXT NOT NULL,  -- 'preference', 'goal', 'pattern', 'note'
  category TEXT,              -- 'nutrition', 'training', 'personal', 'recovery', etc.
  key TEXT NOT NULL,          -- 'favorite_exercise', 'injury_left_shoulder', etc.
  value JSONB NOT NULL,       -- strukturierte Daten
  confidence FLOAT DEFAULT 1.0,
  source TEXT DEFAULT 'user_input',  -- 'user_input', 'observed', 'inferred', 'coach_noted'
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, category, key)     -- Upsert möglich
);
```

**Memory Types in buddy_memories:**
- `preference` — Likes/Dislikes (food, exercises, supplements)
- `goal` — Targets + Objectives mit Datum
- `pattern` — Beobachtete Verhaltenspatterns (weekly_frequency, etc.)
- `note` — Wichtige Fakten: Verletzungen, Allergien, Constraints

**`coach_memory`** — Rohe Konversations-Snippets (alt, weiter in Betrieb)

Unterschied:
| Feature | `coach_memory` | `buddy_memories` |
|---|---|---|
| Struktur | Raw Text Snippets | Typed, Structured JSONB |
| Organisation | Flat List | Categorized + Keyed |
| Confidence | Nein | Ja (0-1) |
| Source-Tracking | Basic | Detailed |
| Uniqueness | By ID | By user + category + key |

### Conversation Memory Summarization

```sql
-- Summaries alter Konversationen
conversation_summaries: session_id, user_id, coach_id, summary_text,
  key_insights JSONB, action_items JSONB, topics TEXT[], sentiment TEXT,
  message_count INT, created_at

-- Memory aus Konversationen extrahiert (in coach_memory)
memory_types: preference, behavior, health_context, goal, limitation,
  milestone, feedback, personal_context

-- Auto-Summarization Settings
conversation_summarization_settings: coach_id, client_id, enabled,
  min_conversation_age_days (default 7), min_conversation_length (default 10)

-- Background Jobs
conversation_summarization_jobs: job_id, status, scheduled_at, completed_at
```

**Background Worker:**
- Automatische Summarization: stündlich
- Memory Cleanup: täglich
- Memory Decay: wöchentlich

### Coach Override System (D7, Migration 20250320)

```sql
-- Erweiterung von buddy_decisions:
ALTER TABLE buddy_decisions ADD COLUMN
  override_status TEXT,     -- 'none', 'approved', 'rejected', 'modified'
  override_reason TEXT,
  override_coach_id UUID REFERENCES users(id),
  override_at TIMESTAMPTZ,
  original_decision JSONB;  -- Preservation des originalen Entscheids

-- View für History
VIEW coach_override_history → buddy_decisions WHERE override_status IS NOT NULL
```

---

## 35. Inline Action Cards System

Coach AI kann direkt actionable Cards in Antworten einbetten via `<action>` Tags.

### Tag-Format
```typescript
// In AI-Response Text:
"Ich habe gemerkt du hast Haferflocken zum Frühstück. 
<action id=\"dec_001\" type=\"nutrition\" priority=\"high\" title=\"Frühstück loggen\" 
  description=\"100g Haferflocken + Banane loggen?\"></action>
Soll ich noch etwas hinzufügen?"
```

### Tag Attribute
| Attribute | Required | Values |
|---|---|---|
| id | ✅ | Unique string (Idempotenz) |
| type | ✅ | training, nutrition, recovery, supplement, lifestyle |
| priority | ❌ | high (red), medium (amber), low (blue) |
| title | ✅ | Kurze Beschreibung |
| description | ❌ | Detail-Text |

Frontend erkennt `<action>` Tags automatisch, rendert als interaktive Cards,
sendet User-Entscheidung zurück ans Backend.

---

## 36. Buddy Floating Widget (B13)

Immer zugängliches Mini-Command-Center. Draggable, Status-basierter Emoji-Indikator,
Notification Badge.

**3-Tab-Interface:**
- 📊 **Overview:** Key Metrics (Kalorien, Protein, Training) + Quick Actions
- ⚡ **Actions:** Smart Action Cards nach Priorität
- 💬 **Commands:** Instant AI Responses

**Features:**
- Auto-Refresh alle 5 Minuten
- Live Status Indicators
- Context-aware Suggestions (Tageszeit, Ziele, Defizite)
- Draggable Position (merkt sich Ort)

---

## 37. Cross-Module Insight Rules (8 definierte Regeln)

| Insight | Condition | Priority |
|---|---|---|
| Protein deficit + training | protein < 80% AND trained today | HIGH |
| Low recovery + heavy training | recovery < 50 AND planned heavy workout | HIGH |
| Supplement compliance dropping | weekly compliance < 70% | MEDIUM |
| Weight stagnation | <0.1kg change over 14 days | MEDIUM |
| Sleep deficit pattern | avg sleep < 6h for 3+ days | HIGH |
| Overtraining risk | overtraining signals >= 3 | CRITICAL |
| Dehydration | water < 50% target by 14:00 | MEDIUM |
| Meal skipped | 0 meals logged by 12:00 | LOW |

---

## 38. Coach Context Builder (vollständig)

```typescript
interface CoachContext {
  date, timeOfDay, dayOfWeek;
  nutrition: {
    score, calories { actual, target, remaining },
    protein { actual, target }, carbs, fat, water,
    mealsLogged, topDeficiencies  // Top 3 micro deficiencies
  };
  nutritionWeekly: { avgScore, avgCalories, avgProtein, adherenceRate };
  weight: { current, trend7d, bmi };
  recovery: { score, sleepHours, sleepQuality, feeling, mood, overtrainingLevel, soreMuscles };
  supplements: {
    compliance, weeklyCompliance, taken, total,
    activeCycle, isPinDay, interactions
  };
  training: { workoutsThisWeek, lastWorkout, muscleGroupsHit, muscleGroupsMissed };
  user: { name, language, experience, goals };
}
```

API für Context-Debug: `GET /api/coach/context`

---

## 39. Coach API Endpoints (vollständig, Port 5500)

```
GET  /api/coach/conversations              → List
POST /api/coach/conversations              → Create
GET  /api/coach/conversations/:id/messages → Messages
POST /api/coach/chat                       → Send + Stream (SSE)
GET  /api/coach/briefing?date=&type=       → Get Briefing
POST /api/coach/briefing/generate          → Generate Today
GET  /api/coach/insights                   → Proactive Insights
GET  /api/coach/settings                   → Settings
PUT  /api/coach/settings                   → Update (persona, language, etc.)
GET  /api/coach/context                    → Debug Context Snapshot
POST /api/coach/quick-action               → Pre-defined Prompts

GET    /api/coach/buddy/memory             → All Memories (filter: type, category)
GET    /api/coach/buddy/memory/stats       → Memory Statistics
POST   /api/coach/buddy/memory             → Add/Update (upsert)
PUT    /api/coach/buddy/memory/:id         → Update
DELETE /api/coach/buddy/memory/:id         → Delete
GET    /api/coach/buddy/memory/grouped     → Grouped by Category

POST /api/coach/conversations/:id/summarize      → Manual Summarization
GET  /api/coach/conversations/summaries          → List Summaries
PUT  /api/coach/memory/summarization-settings    → Configure
GET  /api/coach/memory/conversation-context      → Context für aktuellen Chat
POST /api/coach/memory/cleanup                   → Cleanup expired
POST /api/coach/memory/apply-decay               → Time-based decay
```

---

## 40. Coach Rule Builder (B11 — Human Coach Modul)

Visuelles Interface für Coaches zum Erstellen von Custom Alert Rules.

**Metriken für Regeln:**

Training: completed_workouts, workout_adherence_pct, avg_session_duration, total_volume, days_since_workout

Nutrition: avg_calories, avg_protein, protein_adherence_pct, calorie_adherence_pct, days_logged

Recovery: avg_sleep_hours, avg_stress_level, avg_soreness

Supplements: supplement_adherence_pct

Engagement: days_since_login, days_since_message, check_in_status

**Rule Builder Endpoints:** `/api/human-coach/rules`
```
GET  /schema    → Available metrics, operators, field types
GET  /          → List all rules
POST /          → Create rule
PUT  /:id       → Update rule
DELETE /:id     → Delete rule
POST /:id/toggle → Enable/Disable
```

**Coach Override Endpoints:**
```
GET /api/human-coach/decisions/pending               → Pending Buddy decisions
PUT /api/human-coach/decisions/:id/override          → Approve/Reject/Modify
GET /api/human-coach/decisions/overrides/:clientId   → Override History
```
