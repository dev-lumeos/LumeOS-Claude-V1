# Buddy / AI Coach Module — Features

## Core Features (MVP implementiert)

### 1. Multi-Persona Chat System

5 wählbare Persönlichkeiten. Persona pro User konfigurierbar, auch pro Journey-Checkpoint.

- 🔬 Scientist · 💪 Motivator · 🎖️ Drill Sergeant · 😊 Best Friend · 🧘 Zen Master
- Context-Aware Chat mit Conversation Memory (letzte 20 Nachrichten)
- Streaming Responses (SSE)
- Sprache folgt User: User switcht DE/EN/TH → Coach switcht mit
- Scientist Guard: Keine Studien-Zitate in speech_text, nur in Evidence Cards

Code: `routes/chat.ts` · `coach_conversations` · `BuddyChat.tsx`

---

### 2. Cross-Module Context Builder

Buddy sieht ALLES (mit Permission) und verbindet die Punkte.

```typescript
interface CoachContext {
  user:         { name, age, goal, trainingLevel, coachName, coachPersonality };
  preferences:  UserPreference[];
  recentMemories: CoachMemory[];
  milestones:   Milestone[];
  currentState: {
    mode: 'chat'|'workout'|'meal_question'|'supplement_check';
    workoutSession?: ActiveWorkoutSession;
    timeOfDay: string;
    daysSinceLastWorkout: number;
  };
  recentData: {
    last7dNutrition:    DailyNutritionSummary[];
    lastWorkout:        WorkoutSummary;
    currentGoalProgress: GoalProgress;
    latestRecoveryScore: number;
    latestSleepData?:   SleepData;
    activeSupplements:  SupplementCycle[];
    latestBloodwork?:   BloodworkResult;
    todaysMacrosRemaining: MacroTargets;
  };
  relevantKnowledge: RAGResult[];
}
```

---

### 3. App Butler (Action Execution)

Alles was User manuell macht, geht über den Butler per Text oder Voice.

- Intent Recognition (LLM) → Action Router → API-Call → Confirm
- Smart Confirmation: einfache Actions direkt, komplexe mit Vorschau
- Undo: "Das war falsch, waren nur 150g"
- Confidence <0.8 → Rückfrage statt falsch buchen

**Abgedeckte Aktionen:**
```
Nutrition:   Log Meal, Copy Yesterday, Quick Log (Wasser, Shake)
Supplements: Log Intake, Check Stack, Pin Day Status
Recovery:    Morning Check-In, Log Sleep
Training:    Log Set/Session
Weight:      Log Bodyweight
Overview:    Daily Briefing, Weekly Summary, Module Status
```

Code: `routes/actions.ts` · `ActionExecutor.tsx`

---

### 4. Proaktiver Wächter (Hintergrund-Monitoring)

Coach meldet sich von sich aus. User muss nie Dashboards checken.

**3 Prioritäts-Level:**
- 🔴 CRITICAL → Sofort-Push
- 🟠 WARNING → Nächster Briefing-Slot
- 🟡 INFO → Passiv im Feed

**Was überwacht wird:**
- Ernährung: Nichts geloggt 24h, Crash-Diät-Alarm (<800 kcal), Protein 3 Tage <50%
- Supplements: Pin Day vergessen, neue Interaktion, Compliance <50%
- Recovery: Score <30 + Training geplant, Schlaf <5h × 3 Nächte
- Cross-Module: Widersprüche (Defizit + Masse-Cycle), Plateau (14+ Tage)

**Smart Mute:** Lernfähig — 3× dismisst → heruntergestuft. Nachtmodus: nur CRITICAL.

Code: `routes/alerts.ts` · `ProactiveWatcher.tsx` (Background Worker)

---

### 5. Journey Heartbeat (Konfigurierbares Daily Briefing)

User definiert seine tägliche Journey. Pro User vollständig konfigurierbar.

**Konfigurierbar:** Uhrzeit · Inhalte (welche Module) · Tage · Persona pro Slot · Push vs. in-App

**Kontextbewusst:** Nach schlechtem Schlaf (5h) anderer Ton als nach 8h Schlaf.

Code: `routes/journey.ts` · `journey` DB-Tabelle · `JourneySettings.tsx`

---

### 6. Live Workout Session Mode

Buddy führt durch jedes Workout via Voice (Gym-Mode).

**State Machine:**
```
IDLE → SESSION_START → EXERCISE_INTRO → SET_ACTIVE → SET_COMPLETE → REST →
  NEXT_SET | NEXT_EXERCISE → SESSION_COMPLETE → SUMMARY
```

**Smart Features:**
- Progressive Overload Detection: 2 Sessions im Rep-Range → Gewicht erhöhen
- Fatigue Detection: Reps fallend → Volume-Anpassung anbieten
- Form Reminders (lernend, welche Cues der User braucht)
- Superset Flow: Auto-Scroll, kein extra Rest
- Zeitdruck-Handling: "Nur 30 Min" → Supersets vorschlagen

**Gym Voice Commands (<200ms, kein LLM):**
"Fertig" · "[N] Kilo" · "[N] Reps" · "Nächste" · "Pause" · "RPE [N]" · "War schwer/leicht"

Code: `routes/buddy.ts` (session) · `LiveWorkoutView.tsx`

---

### 7. Memory System (4-Layer RAG)

Buddy erinnert sich — an Präferenzen, Meilensteine, Coaching-Erfahrungen.

**4 Memory Types:** PREFERENCE · MILESTONE · CONTEXT_NOTE · COACHING_OUTCOME

**Regeln:**
- Ein Event = kein Memory. Wiederholung erhöht Confidence.
- Ungenutztes Memory decayed
- Memory NUR aus Events (nie aus jedem Chat)
- Confidence < 0.5 → nicht verwenden

Code: `routes/buddy-memory.ts` · `coach_memory` DB-Tabelle

---

### 8. Rule Engine (vollständig konfigurierbar)

Alle Entscheidungen laufen durch deterministisch testbare Rules.

**Vollständiger Rule Catalog:**

Nutrition Rules:
- protein_gap_end_of_day > 30g → suggest_high_protein_meal
- calorie_deficit_large 3 days → notify_coach
- hydration_low → suggest_hydration

Training Rules:
- missed_workouts_3x_7d → notify_coach
- pain_flag_exercise → suggest_exercise_swap
- training_volume_spike → monitor_recovery

Recovery Rules:
- recovery_score < 50 AND heavy_training_day → reduce_training_volume (-20%)
- sleep_score_low 3 days → suggest_rest_day

Safety Rules:
- dizziness_report → escalate_to_coach + pause_training_actions
- rapid_weight_loss → notify_coach
- extreme_calorie_deficit → stop_weight_loss_protocol + notify_coach

**Konfigurierbar per User/Coach:** Custom Rules, Cooldowns, Enable/Disable per Rule

Code: `routes/buddy-rules.ts` · `buddy_rules` DB-Tabelle

---

### 9. Behavior Stability Score (BSS)

**BSS = (Stability × 0.5) + (Goal Alignment × 0.5)**

Rolling 90-Tage. Aus Events berechnet (nie Chat). Reproduzierbar.

Sub-Scores: Training Consistency · Nutrition Stability · Recovery Stability · Dropout Resilience · Bounceback Time

Code: `packages/scoring/src/buddy.ts`

---

### 10. Floating Widget (B13)

Always-accessible Mini-Kommandozentrale.

- Draggable Bubble (merkt sich Position)
- Status Emoji: 💪 on track, ⚠️ warning, 🔥 off track
- 3 Tabs: Overview (Quick Stats), Actions (Smart Cards), Commands (Instant AI)
- Notification Badge Count
- Auto-Refresh alle 5 Min
- Smart Actions: generiert basierend auf Nutrition/Training/Recovery/Supplement/Goal-State

Code: `BuddyFloatingWidget.tsx` · `useBuddyQuickStats` · `useSmartActions`

---

### 11. Adaptive Intervention Engine (Der echte Moat)

Behavioral Signature + Intervention Memory + Identity Reinforcement.

**Konfigurierbar:**
- `max_intervention_intensity` (0.0–0.8, nie über 0.8 autonom)
- `intervention_load_7d` (max 5/Woche, 2 Confrontations, 3 Identity-Statements)
- Cooldowns pro Interventions-Typ

Code: `routes/buddy-intervention.ts` · `intervention_log` DB-Tabelle

---

## Geplante Features

### Mittlere Priorität (Phase 3)
| Feature | Beschreibung |
|---|---|
| Voice Input vollständig | STT on-device (Whisper.cpp) + TTS Streaming |
| Visual Check-In | Spiegel-Selfie → AI Fortschritts-Analyse (Claude Vision) |
| Pattern Detective | Korrelations-Engine: "Dein Schlaf ist 40min länger ohne Koffein nach 18:00" |
| Gym Finder | Google Places API → Gyms in der Nähe mit AI Review-Analyse |
| Inline Rich Cards | Mini Macro-Ring, Supplement-Checklist direkt im Chat |

### Niedrige Priorität (Phase 4)
| Feature | Beschreibung |
|---|---|
| AI Clone (Coach B2B) | Coach trainiert AI mit eigener Methodik |
| Predictive Coach | "Bei deinem Trend erreichst du 83kg in 6 Wochen" |
| Challenges & Social | Personalisierte Challenges mit Wallet-Rewards |
| Reise-Modus | Timezone-Shift, lokale Food-DB, Gym Finder am neuen Standort |
| Adaptive Ziele | Ziele passen sich dem User an, nicht umgekehrt |
| Kontext-Gedächtnis für Commitments | "Letzte Woche wolltest du mehr Schlaf priorisieren — hattest du 7h?" |
| Form Check via Camera | Kemtai API Integration für Übungsform-Analyse |
