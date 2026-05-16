# Buddy / AI Coach Module — Konsolidiertes Wissen
> Konsolidiert aus 24 Alt-Dokumenten | 2026-04-17
> Quellen: 08_BUDDY_COMPLETE.md (1551 Zeilen), coach-buddy-killer-feature.md (1590 Zeilen),
> coach-buddy-intervention-contract.md, coach-buddy-output-contract.md,
> coach-buddy-vision-DE.md, ai-coach-architecture-variants.md,
> coach_API.md, coach_FEATURES.md, coach_DATABASE.md,
> aicoach_COACH-IDEAS.md, coachmod_PRD.md, lumeos-ai-coach-strategy.md,
> BUDDY_FLOATING_WIDGET.md, aicoach_PRD.md, aicoach_TODO.md,
> coachmod_M3-CHECKLIST.md, coachmod_TODO.md, coach_README.md,
> coach_RESEARCH.md, coach_MIGRATION.md, coach_COMPONENTS.md,
> 09_BUDDY_SYSTEM_ROLE.md.rtf, 10_DECISION_SYSTEM_PRINCIPLES.md.rtf,
> 08_MODULE_COACH_AI.md

---

## 1. Kernformel (unveränderlich)

```
Buddy = Gehirn
LumeOS = Betriebssystem
UI = Anzeige

Körperdaten → Buddy → Entscheidung/Empfehlung → Aktion im Ökosystem
```

**Buddy ist nicht ein Feature. Buddy ist das zentrale System.**
LumeOS visualisiert was Buddy weiss. Das LLM ist die austauschbare Kommunikationsschicht.
Die Buddy-Engine (State / Memory / Watcher / Rules) ist das echte Asset.

**Ein Superagent.** Keine Multi-Agent-Architektur. Ein zentraler Buddy mit internen Modulen.

---

## 2. Was Buddy IST — und NICHT IST

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

---

## 3. System-Architektur (6 Layers)

```
Layer 1 — INPUT
  App Inputs · Coach Inputs · Health Data · Commerce Data · System Events

Layer 2 — NORMALISIERUNG
  Einheiten · Zeitachse · Muskelgruppen-Mapping · Zielbezug · Food-Preference

Layer 3 — USER STATE
  Memory (Fakten, Präferenzen, Ziele, History, Coach-Regeln)
  Aktueller Status (heute: Makros, Training, Recovery, Supps)
  Scores (Nutrition, Recovery, BSS, Training Volume)
  Freigaben (was darf Buddy autonom?)
  Behavioral Signature (Muster + Trigger, ab 8 Wochen Daten)

Layer 4 — WATCHER (Event-basiert, Sensor-System)
  Erkennt Muster in State-Veränderungen
  Produziert Events → Rule Engine

Layer 5 — DECISION ENGINE
  Regelbasiert (if/then, Scores, Priorities, Trigger)
  Intervention Selection (Buckets + Typen)
  Safety Gates (Medical, Supplement, Manipulation Guard)
  Cooldowns + Intervention Load Limits
  Conflict Resolution: Safety > Recovery > Training > Nutrition > Behavior
  KEIN ML in v1 — deterministisch + testbar

Layer 6 — BUDDY INTERFACE
  Chat (Text, Streaming SSE)
  Voice (STT Whisper + TTS, Gym-Commands <200ms)
  UI Action Cards (Empfehlungen, Buttons, Quick Actions)
  Push Notifications (Smart, lernende Frequenz)
  Commerce Actions (Bestellen, Buchen)
  Floating Widget (B13, immer sichtbar)
  Coach Dashboard (Human Coaches: Client-Übersicht)
```

---

## 4. Hybrid AI Architektur (Variante C — gewählt)

**Deterministische Engines für alles Messbare, LLM für alles Menschliche.**

| Domäne | Wer entscheidet | Warum |
|---|---|---|
| TDEE/Macro Berechnung | Deterministisch | Keine Halluzination |
| Supplement Interactions | Deterministisch | Sicherheitskritisch |
| Medical Alerts | Deterministisch | Lebensrelevant |
| Scoring (0-100) | Deterministisch | Konsistenz |
| Training Volume/Deload | Deterministisch | Wissenschaftlich berechenbar |
| Recovery Score | Deterministisch | Formel-basiert |
| Erklärungen | LLM | Menschliche Sprache |
| Cross-Module Analyse | LLM | Pattern Recognition |
| Wissensfragen | LLM + RAG | Flexibilität |
| Motivation, Persona, Ton | LLM | Empathie, Persönlichkeit |

### 3 Pfade
- **Fast Path** (60%): Dashboard Cards, Scores → kein LLM, $0
- **Knowledge Path** (20%): Wissensfragen → RAG + Haiku, günstig
- **Hybrid Path** (20%): Cross-Module Analyse → Engines + LLM

### LLM Stack
- Primary: Z.AI GLM-4.7-Flash (OpenAI-compatible, $0 via Flatabo)
- Secondary: Claude Haiku (Budget-Tier)
- Premium: Claude Sonnet 4.x (Deep Analysis, Elite Tier)
- Local Fallback: Deterministic Coach (immer verfügbar, $0)

---

## 5. Interne Engines (11 + geplante)

| Engine | Inputs | Outputs |
|---|---|---|
| **Nutrition Engine** | food_events, macro_targets, bodyweight, meal_timing | nutrition_score, protein_gap, calorie_gap, macro_balance, micronutrient_deficits |
| **Training Engine** | set_logs, workout_templates, exercise_metadata, training_history, fatigue | training_readiness, progression_state, fatigue_flags, overreach_risk |
| **Recovery Engine** | sleep_duration, sleep_regularity, training_load, subjective_fatigue, HRV | recovery_score, recovery_drivers, deload_recommendation |
| **Biomarker Engine** | blood_values, reference_ranges, user_sex/age, lab_history | biomarker_risk_flags, drift_summary, escalation_recommendation |
| **Supplement Engine** | supplement_stack, dosage_data, UL/RDA, timing, interactions | stack_safety_score, interaction_flags, redundancy_flags, gap_suggestions |
| **Body Composition Engine** | bodyweight_history, goal, calorie_intake_history | composition_score, phase_state, projected_weight_change |
| **Behaviour Engine** | logging_consistency, routine_adherence, missed_targets | compliance_score, adherence_pattern, habit_focus_candidates |
| **Circadian Engine** | sleep_timing, meal_timing, training_timing, timezone | circadian_alignment_score, timing_flags, optimal_window_hints |
| **Energy Availability Engine** | calorie_intake, bodyweight_trend, expenditure, training_volume | energy_availability_score, underfueling_flags |
| **Stress Load Engine** | training_load, sleep_quality, subjective_stress, schedule_load | stress_load_score, overload_flags |
| **Electrolyte Engine** | sodium, potassium, magnesium intake, hydration | electrolyte_balance_score, imbalance_flags |
| **(Geplant)** | symptom, injury_risk, hormonal_pattern, digital_twin_simulation | — |

---

## 6. User Profile System (4 Layers)

```
Layer 1: STATIC (Onboarding)
  Name, Alter, Geschlecht, Größe, Gewicht, KF%, Ziel, Erfahrung,
  Trainingsfrequenz, Equipment, Sprache, Einheiten, Coach-Name & Persönlichkeit

Layer 2: PREFERENCES (wächst über Zeit — editierbar)
  Food: Likes, Dislikes, Allergien, Intoleranzen, Küchen, Diätform
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
- `buddy.user_coach_profile` — coach_name, personality, communication_style JSONB, wake_word
- `buddy.user_preferences` — category ENUM, key, value, learned_at, source
- `buddy.user_milestones` — type, title, achieved_at, celebrated BOOLEAN
- `buddy.coach_memory` — content, category, importance, timestamp

---

## 7. State System

State = aktuelle messbare Kondition. Buddy reasont auf State, nicht auf Rohdaten.

```
Raw Data → State Builder → State Objects → Watchers → Rule Engine
```

**State Domains:** Training, Nutrition, Recovery, Body, Behavior, Safety

**Composite Scores:** training_score, nutrition_score, recovery_score, adherence_score, risk_score

**DB:** `buddy.buddy_state` (1:1 pro User)

---

## 8. Watcher System

Watchers = Sensor-System. Buddy reagiert auf Events, denkt nicht konstant.

**Training Watchers:** missed_workout, exercise_failure_rate_high, volume_spike/drop, pain_flag
**Nutrition Watchers:** protein_gap_end_of_day, calorie_deficit_large, meal_skipped, hydration_low
**Recovery Watchers:** sleep_score_low, recovery_score_low, fatigue_trend_up, soreness_persistent
**Behavior Watchers:** logging_dropout, plan_rejection, adherence_drop, coach_message_ignored
**Safety Watchers:** pain_flag, dizziness_report, rapid_weight_loss, extreme_calorie_deficit
**V2 Watchers:** weight_plateau (14d), stress_pattern_training_skipped, weekend_nutrition_collapse

---

## 9. Rule Engine

Alle Entscheidungen laufen durch Rules. Kein Free-Form LLM-Reasoning für Decisions.

**Rule Format (JSON):**
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
  "cooldown": { "type": "hours", "value": 24 }
}
```

**Priority Order:** Safety > Recovery > Training > Nutrition > Behavior

**Design Rules (Non-Negotiable):**
- Rules enthalten kein Free-Form Reasoning
- Rules rufen keine LLMs direkt auf
- Rules evaluieren nur State und Event Fields
- Rules sind testbar mit Fixtures
- Rules sind editierbar ohne Code-Änderungen

---

## 10. Output Contract (JSON Schema v0.1)

LLM liefert strukturiert. UI/Voice rendert nur. Alle Zahlen aus Engine-Fields.

```json
{
  "$schema": "coach-response-v0.1",
  "intent": "string (required)",
  "speech_text": "string",
  "ui_cards": [{ "type": "stat|comparison|list|chart|exercise|meal_plan|action_prompt|EVIDENCE_CARD", "title": "...", "data": {}, "priority": "high|normal|low" }],
  "actions": [{ "id": "uuid", "type": "...", "params": {}, "requires_confirmation": false }],
  "safety_flags": [],
  "evidence": [{ "source_id": "kb:doc-id", "title": "...", "relevance": 0.0 }],
  "expects_input": false,
  "input_type": "free_text|number|choice|rating|confirm",
  "choices": []
}
```

**Evidence-Pflicht:**
- Keine Studien-Claims in speech_text
- Evidence NUR in UI Cards (EVIDENCE_CARD Typ)
- Kein RAG-Treffer = keine wissenschaftliche Behauptung

---

## 11. 5 Personas

| Persona | Icon | Stil | Vibe |
|---|---|---|---|
| Scientist | 🔬 | Evidenz-basiert | "Der Winkel aktiviert den oberen Brustanteil stärker." |
| Motivator | 💪 | Energetisch, feiernd | "BOOM! Neuer PR! 🔥" |
| Drill Sergeant | 🎖️ | Hart, direkt | "Keine Ausreden. Wir sind hier um zu arbeiten." |
| Best Friend | 😊 | Locker, supportive | "Hey, lass uns schauen was heute drin ist." |
| Zen Master | 🧘 | Weise, geduldig | "Spüre die Kontraktion. Der Weg ist das Ziel." |

**Scientist Guard:**
- ❌ "EMG-Studien zeigen...", "Meta-Analysen belegen..."
- ✅ "Der Winkel aktiviert diesen Muskel stärker."
- Evidence NUR in UI Cards

---

## 12. ⚙️ KONFIGURIERBARKEIT — Das Schlüsselprinzip

### Konfigurierbar per User-Ebene

**Pro User einstellbar:**
```typescript
interface BuddyUserConfig {
  coach_name:        string;                    // "Alex", "Dr. Kim"
  coach_personality: PersonaType;               // scientist|motivator|drill|friend|zen
  communication_style: {
    humor:         boolean;
    directness:    1 | 2 | 3 | 4 | 5;
    detail_level:  1 | 2 | 3 | 4 | 5;
    language:      'de' | 'en' | 'th';
  };
  autonomy_level:    1 | 2 | 3 | 4 | 5;         // Wie viel darf Buddy autonom?
  intervention_threshold: 'low'|'medium'|'high'; // Wann schreitet Buddy ein?
  notification_preferences: NotificationConfig;
  journey_checkpoints:      JourneyCheckpoint[]; // Heartbeat Schedule
  feature_tier:             'free'|'plus'|'pro'|'elite';
  module_access: {
    nutrition:    boolean;
    training:     boolean;
    recovery:     boolean;
    supplements:  boolean;
    medical:      boolean;    // Sensitiv — opt-in
    goals:        boolean;
  };
}
```

### Konfigurierbar per Abo-Tier

| Feature | Free | Plus | Pro | Elite |
|---|:---:|:---:|:---:|:---:|
| Text-Chat | 5/Tag | ♾ | ♾ | ♾ |
| Insights Feed | ✅ | ✅ | ✅ | ✅ |
| Alle Personas | ❌ | ✅ | ✅ | ✅ |
| Journey/Heartbeat | ❌ | ✅ | ✅ | ✅ |
| Tages-Briefing | ❌ | ✅ | ✅ | ✅ |
| Voice Input | ❌ | ❌ | ✅ | ✅ |
| Action Execution (Meal loggen per Chat) | ❌ | ❌ | ✅ | ✅ |
| Proaktiver Wächter (Hintergrund-Monitoring) | ❌ | ❌ | ✅ | ✅ |
| Push Notifications | ❌ | ❌ | ✅ | ✅ |
| Gym Finder | ❌ | ❌ | ✅ | ✅ |
| Personalisierte Trainingspläne | ❌ | ❌ | ❌ | ✅ |
| Cycle-Beratung (Enhanced Mode) | ❌ | ❌ | ❌ | ✅ |
| Weekly Deep Report | ❌ | ❌ | ❌ | ✅ |
| AI Clone (Coach-Tier) | ❌ | ❌ | ❌ | Coach B2B |

**Feature Gate:**
```typescript
const FEATURE_TIERS: Record<string, SubscriptionTier> = {
  'chat_basic':        'free',
  'insights_feed':     'free',
  'chat_unlimited':    'plus',
  'journey_heartbeat': 'plus',
  'all_personas':      'plus',
  'voice_input':       'pro',
  'action_execution':  'pro',
  'proactive_watcher': 'pro',
  'push_alerts':       'pro',
  'gym_finder':        'pro',
  'training_plans':    'elite',
  'cycle_consulting':  'elite',
  'weekly_deep_report':'elite',
};
// Middleware-basiert, NICHT hardcoded in Components
// Tiers + Preise in DB/Config → A/B-Testing fähig
```

### Konfigurierbar per Coach (Human Coach)

Human Coach kann pro Client einstellen:
```typescript
interface CoachBuddyOverrides {
  client_id:          string;
  autonomy_level:     1 | 2 | 3 | 4 | 5;         // Überschreibt User-Default
  max_intervention_intensity: number;              // 0.0–1.0
  allowed_actions: string[];                       // Welche Aktionen darf Buddy autonom?
  blocked_rules: string[];                         // Welche Rules deaktiviert?
  custom_rules: CoachRule[];                       // Extra Regeln pro Client
  clone_enabled:      boolean;                     // AI Clone aktiv?
  clone_config:       CloneConfig;
}
```

### Konfigurierbar per Gym / B2B Partner

```typescript
interface GymBuddyConfig {
  gym_id:             string;
  branding:           BrandingConfig;              // Logo, Farben, Coach-Name
  whitelabel:         boolean;
  allowed_modules:    string[];                    // Welche Module integriert?
  custom_knowledge:   string[];                    // Eigene KB-Docs
  escalation_contact: string;                      // An wen eskaliert?
  transaction_config: GymTransactionConfig;        // Wallet-Anbindung
}
```

---

## 13. 5-Level Autonomy System (Buddy-Befugnisse)

| Level | Name | Erlaubte Aktionen | Default für |
|---|---|---|---|
| 1 | Supervised 🔒 | Keine (alles braucht Bestätigung) | Neue User |
| 2 | Guided 👋 | Wasser/Schlaf Reminders, Basic Hydration/Rest | Beginner |
| 3 | Collaborative 🤝 ⭐ | + Nutrition Recs, Supplement Timing, Minor Macro Adj (<5%), Recovery | **DEFAULT** |
| 4 | Adaptive ⚡ | + Deload Recs, Training Volume Adj, Exercise Substitution, Rest Day | Advanced User |
| 5 | Autonomous 🚀 | + Program Modifications, Goal Adjustments, Major Macro Changes (>5%), Phase Transitions | Elite |

**Recommendation Algorithm:**
Base = Level 3 → adjustiert nach:
- Experience Level (Beginner -1, Elite +1)
- Relationship Duration (<7 Tage -1, >90 Tage +1)
- Compliance Rate (<70% -1, >90% +1)
- Complexity Flags (Medical, Special Reqs: -1)

---

## 14. Adaptive Intervention Engine (Der echte Moat)

**3 Moats:**

**Moat 1: Behavioral Signature (ab 8 Wochen)**
- Erkennt Muster: Stress → Training skippt, Protein unter Schwelle → Adherence kollabiert
- Confidence Thresholds: <0.5 = nicht verwenden, 0.5–0.7 = beeinflussen, >0.7 = Identity-Claims erlaubt

**Moat 2: Intervention Memory**
- Jede Intervention als Experiment geloggt
- Personalisiertes Playbook: was funktioniert bei DIESEM User
- Nicht exportierbar = Retention

**Moat 3: Identity Reinforcement Loop**
```
Monat 1-2 (Observe):  Keine Identity-Claims
Monat 3-4 (Mirror):   "Du hast 3 Wochen durchgehalten"
Monat 5+  (Reinforce): "Du bist jemand der nicht skippt"
```
Phase-Upgrade: trust_score ≥ 0.60 (Mirror) / ≥ 0.75 (Reinforce)

---

## 15. Manipulation Guard (unveränderlich)

**Verbotene Narrative:**
- ❌ Angst: "Wenn du aufhörst, verlierst du alles"
- ❌ Schuld: "Du hast dein Versprechen gebrochen"
- ❌ Streak-Shaming: "154 Tage — willst du das wirklich wegwerfen?"
- ❌ Sozialer Vergleich als Druck

**Hard Caps:**
```
max_intervention_intensity: 0.0–0.8 (nie autonom über 0.8)
intervention_load_7d:
  max_interventions:    5/Woche
  max_confrontations:   2/Woche
  max_identity_statements: 3/Woche
→ Limit erreicht = Stille
```

---

## 16. Behavior Stability Score (BSS)

**BSS = (Stability Score × 0.5) + (Goal Alignment × 0.5)**

Stability allein reicht nicht: Stabil 2×/Woche bei Ziel 5× = BSS niedrig.

```
Stability:   f(Varianz: Workouts/Woche, Makro-Drift, Sleep, Dropout-Events)
Alignment:   f(Actual vs Target: Workouts, Makros, Body Composition Trend)
Bounceback:  Wie schnell erholt sich User nach Rückfall (strategisch wichtigster Sub-Score)
```

Wird aus Events berechnet (nie aus Chat), lokal, reproduzierbar.

---

## 17. Medical Safety Gate

**Buddy DARF:**
- ✅ Werte erklären + als auffällig markieren
- ✅ Trends nennen
- ✅ Retest vorschlagen (Marker benennen)
- ✅ Zur ärztlichen Abklärung raten

**Buddy DARF NICHT:**
- ❌ Diagnosen
- ❌ Dosierungen (mg, g, IU)
- ❌ Therapieempfehlungen
- ❌ Supplements aus Blutwerten ableiten (Entkopplung!)

**Medication Gate:** Medikament geloggt → nur "Kläre mit Arzt/Apotheker."

**Policy Gate (serverseitig):**
- PASS → Antwort safe
- REDACT + SAFE_REWRITE → Problematische Teile entfernen
- BLOCK + ESCALATE → Komplett ersetzt durch Arzt-Verweis

---

## 18. Live Workout Session Mode

**State Machine:**
```
IDLE → SESSION_START → EXERCISE_INTRO → SET_ACTIVE → SET_COMPLETE → REST →
  ├── NEXT_SET → SET_ACTIVE
  └── NEXT_EXERCISE → EXERCISE_INTRO → SESSION_COMPLETE → SUMMARY → IDLE
```

**Gym Voice Commands (<200ms):**
"Fertig", "[N] Kilo", "[N] Reps", "Nächste", "Pause", "RPE [N]", "War schwer/leicht"

**Smart Features:**
- Progressive Overload Detection
- Fatigue Detection (Reps fallend → Volume-Anpassung)
- Form Reminders (lernend: welche Cues braucht der User)
- Superset Flow

---

## 19. Proaktiver Wächter

Coach meldet sich von sich aus — User muss nie Dashboards checken.

| Level | Trigger | Aktion |
|---|---|---|
| 🔴 CRITICAL | Sofort-Push | Supplement-Interaktion, Übertraining + Pin Day, Recovery <30 + Training |
| 🟠 WARNING | Nächster Briefing-Slot | Protein 3 Tage <50%, Schlaf <5h × 3 Nächte |
| 🟡 INFO | Passiv im Feed | Streak-Rekord, Meilenstein, PR |

**Smart Mute:** 3× dismisst → heruntergestuft. Nachtmodus: nur CRITICAL.

---

## 20. Journey Heartbeat (konfigurierbares Daily Briefing)

User definiert seine tägliche Journey:

| Zeitpunkt | Default-Content | Konfigurierbar |
|---|---|---|
| 🌅 Morgen (z.B. 7:00) | Recovery Score, Schlaf, Plan für heute | ✅ |
| 🍽️ Pre-Meal (12:00, 18:00) | Makros-Stand, Essensvorschlag | ✅ |
| 💊 Supplement-Reminder | Welche Supps jetzt fällig | ✅ |
| 💉 Pin Day Alert | Injektionstag, Site Rotation | ✅ |
| 🏋️ Pre-Workout (16:00) | Recovery Check, Muskelgruppen-Empfehlung | ✅ |
| 🌙 Abend (21:00) | Tages-Review, was fehlt, Streak | ✅ |
| 📊 Wochen-Report (So 20:00) | Woche vs. Ziele, Trends | ✅ |

**Konfigurierbar:** Uhrzeiten, Inhalte, Tage, Persona pro Checkpoint, Push vs. in-App

---

## 21. App Butler (Voice/Text Action Execution)

Alles was User manuell macht, geht über den Butler:

| Modul | Beispiele |
|---|---|
| Nutrition | "Log 200g Hähnchen mit Reis" · "Kopiere gestern" · "Wie viel Protein fehlt?" |
| Supplements | "Supps genommen" · "Kreatin gecheckt" · "Wann Pin Day?" |
| Recovery | "Schlaf 7h, gut gefühlt" · "Recovery Score?" |
| Training | "Squats 5x5 100kg" · "Was trainiere ich heute?" |
| Wasser | "500ml Wasser" · "Wie viel fehlt noch?" |
| Gewicht | "86kg heute" |
| Überblick | "Briefing bitte" · "Wie war meine Woche?" |

**Architektur:** Input → STT (wenn Voice) → Intent (LLM) → Action Router → API-Call → Confirm

---

## 22. Memory System

**4 Typen:**
| Typ | Beispiel | Decay |
|---|---|---|
| PREFERENCE | "mag keinen Fisch" | Nie |
| MILESTONE | PR, Streak | Nie |
| CONTEXT_NOTE | "Urlaub nächste Woche" | Ja |
| COACHING_OUTCOME | "Deload hat geholfen" | Langsam |

**Memory Hierarchie (Technical):**
- Working Memory: currentConversation, todayInteractions, immediateGoals
- Episodic Memory: conversationHistory, significantEvents, achievements
- Semantic Memory: userPreferences, healthGoals, lifestylePatterns
- Procedural Memory: effectiveStrategies, interventionHistory

**Memory Regeln:**
- Einzelnes Event erstellt kein Memory
- Wiederholtes Muster erhöht Confidence
- Ungenutztes Memory decayed
- Memory NUR aus Events (nicht aus jedem Chat)

---

## 23. Voice I/O System

**STT:**
- Primary: Whisper on-device (Apple Speech / Whisper.cpp) — <200ms, offline
- Fallback: OpenAI Whisper API ($0.006/min) oder Deepgram ($0.0043/min)

**TTS:**
- Phase 1: OpenAI TTS ($0.015/1k chars, Streaming)
- Phase 2: ElevenLabs Premium ($0.30/1k chars, Voice Cloning)
- Fallback: Apple AVSpeech (Offline, gratis)

**Local-First:** Vollständiges Workout ohne Internet möglich.

---

## 24. Commerce Layer

| Trigger | Aktion |
|---|---|
| Post-Workout + protein_needed | Protein-Shake vorschlagen (Gym-Counter) |
| creatine_inventory < 5 days | "Soll ich nachbestellen?" |
| macro_gap_detected | Restaurant/Delivery vorschlagen |
| Equipment-Bedarf erkannt | Empfehlung im Marketplace |
| Coach-Session nötig | Termin buchen |

**Buddy als Transaction Gateway (Tom's Vision):**
User → Buddy: "Ich brauche neues Protein" → Buddy empfiehlt + kauft nach Bestätigung

---

## 25. Scope-Begrenzung

Buddy ist kein ChatGPT-Ersatz:
- ✅ Fitness, Ernährung, Supplements, Recovery, Training, Gesundheit
- ❌ Programmierung, Politik, Finanzen, Gedichte, allgemeine Wissensfragen
- Grauzone erlaubt: Stressmanagement, Schlaf, Motivation (im Fitness-Kontext)

**Zwei Schutzebenen:**
1. Regex Scope Guard (serverseitig, 0 API-Calls für Off-Topic)
2. System Prompt SCOPE-BEGRENZUNG (subtilere Off-Topic)

---

## 26. Kosten-Übersicht

| Tier | LLM | STT | TTS | Gesamt/User/Mo |
|---|---|---|---|---|
| Free | ~$0.01 (5 Msgs) | — | — | ~$0.01 |
| Plus | ~$0.15–0.30 | — | — | ~$0.15–0.30 |
| Pro | ~$0.30–0.75 | ~$1.80 | ~$0.90 | ~$3.50 |
| Elite | ~$0.75–1.30 | ~$1.80 | ~$0.90 | ~$4.50–5.00 |

Abo-Preise (TBD): ~$9.99–29.99/mo → Marge 75–90%

---

## 27. Floating Widget (B13)

Immer zugänglich, ohne Navigation.

- Draggable Bubble mit Status-Emoji (💪 on track, ⚠️ warning, 🔥 off track)
- 3 Tabs: Overview (Quick Stats), Actions (Smart Cards), Commands (Instant AI)
- Auto-Refresh alle 5 Minuten
- Notification Badge Count
- Generiert Smart Actions basierend auf: Nutrition State, Training Context, Recovery, Supplements, Goal Alignment

---

## 28. Gym Finder

- 📍 Geolocation → Google Places API → Gyms in der Nähe
- ⭐ Rating + AI Review-Zusammenfassung
- 💰 Preise, 🕐 Öffnungszeiten, 📸 Fotos
- Filter: 24h, Pool, Sauna, Personal Trainer, CrossFit, Freihantelbereich
- Monetarisierung: Premium-Listing für Gyms, Tageskarten über Wallet

---

## 29. AI Clone (Coach B2B)

Coach trainiert AI mit eigener Methodik:
1. Upload: Protocols, Q&A Sessions, Methodologie-Docs
2. Clone antwortet wie der Coach — mit Client's echten Lumeos-Daten
3. Escalation-Regeln definierbar (wenn komplex → echter Coach)
4. Revenue: Coach zahlt Business-Tier, Clients bekommen "24/7 Coach-Zugang"

---

## 30. Datenbank-Kern

| Tabelle | Beschreibung |
|---|---|
| `buddy.user_coach_profile` | Coach-Name, Persönlichkeit, Kommunikationsstil, Wake Word |
| `buddy.user_preferences` | Food/Exercise/Supplement/Schedule Präferenzen |
| `buddy.user_milestones` | PRs, Streaks, Transformations-Meilensteine |
| `buddy.coach_memory` | RAG-gespeichert, Kontext für Antworten |
| `buddy.buddy_state` | Tagesscores, Trends, Flags (1:1 pro User) |
| `buddy.buddy_events` | Alle Events (append-only) |
| `buddy.buddy_decisions` | Rule-Engine Entscheidungen |
| `buddy.buddy_actions` | Ausgeführte Aktionen |
| `buddy.buddy_rules` | Konfigurierbare Regeln pro User/Coach/System |
| `buddy.bss_snapshots` | Behavior Stability Score (90-Tage-Rolling) |
| `buddy.intervention_log` | Vollständige Interventions-History |
| `buddy.buddy_daily_state` | Tägliche State-Aggregation |
| `buddy.coach_conversations` | Chat-Verläufe |
| `buddy.coach_messages` | Einzelne Nachrichten |
| `buddy.knowledge_base` | RAG-Wissensdatenbank |
| `buddy.coach_journey` | User Journey / Heartbeat Konfiguration |
| `buddy.coach_alerts` | Proaktive Alerts (Wächter) |
| `buddy.coach_profiles` | User Coach-Profil (Präferenzen, Tier, Autonomy) |
| `buddy.coach_automations` | Konfigurierbare Automatisierungen |
