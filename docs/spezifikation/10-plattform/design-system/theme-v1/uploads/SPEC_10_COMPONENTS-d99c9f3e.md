# Buddy / AI Coach Module — Frontend Components (Spec)
> Spec Phase 10 | Seiten, Components, Hooks, Stores

---

## Pages

| Page / Route | Beschreibung | Tier |
|---|---|---|
| `/(app)/coach/` | Buddy Chat Hauptseite | Free+ |
| `/(app)/coach/settings/` | Coach-Einstellungen (Persona, Autonomy, Tier) | Free+ |
| `/(app)/coach/journey/` | Heartbeat / Daily Briefing konfigurieren | Plus+ |
| `/(app)/coach/history/` | Chat-Verlauf | Free+ |
| `/(app)/coach/memory/` | Memory-Transparenz (was weiss Buddy über mich?) | Free+ |
| `/(app)/coach/bss/` | Behavior Stability Score (90d View) | Plus+ |
| `/(app)/coach/alerts/` | Proaktive Alerts (Wächter) | Pro+ |
| `/(coach)/` | Human Coach Dashboard | Coach B2B |

---

## Core Buddy Chat Components (10)

| Component | Beschreibung |
|---|---|
| `BuddyChat` | Haupt-Chat Interface: Messages + Action Cards + Input |
| `BuddyMessageBubble` | Einzelne Nachricht (User oder Buddy, mit Tier-Badge wenn locked) |
| `BuddyActionCard` | Rich Cards: stat / comparison / list / chart / exercise / meal_plan |
| `BuddyEvidenceCard` | 📚 "Warum?"-Button expandiert Evidence aus Knowledge Base |
| `BuddyChoiceButtons` | Quick-Reply Buttons für `choices[]` aus Output Contract |
| `BuddyInputBar` | Textfeld + Mikrofon-Button (Pro+) + Kamera-Button |
| `BuddyVoiceRecorder` | STT Integration, Push-to-talk, Live-Transkription |
| `BuddyStreamingText` | Streaming SSE Text-Animation |
| `BuddySafetyBanner` | Persistent wenn `safety_flags: ["medical_content"]` |
| `BuddyPersonaBadge` | Aktive Persona (🔬💪🎖️😊🧘) in Chat-Header |

---

## Floating Widget Components (B13) (6)

| Component | Beschreibung |
|---|---|
| `BuddyFloatingWidget` | Draggable Bubble (Position in LocalStorage), expandierbares Panel |
| `FloatingStatusBubble` | Minimiert: Status-Emoji + Notification Badge |
| `FloatingOverviewTab` | Quick Stats: Kalorien, Protein, Training, Recovery |
| `FloatingActionsTab` | Smart Action Cards (urgent/recommended) basierend auf aktuellem State |
| `FloatingCommandsTab` | Sofort-Befehle ohne Chat zu öffnen |
| `FloatingSmartActionCard` | Einzelne Action: Icon + Label + Priority-Farbe + NavigateTo |

**Smart Action Generation:**
```
Nutrition:   protein < 60% → urgent "Protein nachbessern 🥩"
Training:    16–20 Uhr, kein Workout → recommended "Training einplanen 💪"
Recovery:    21+ Uhr → recommended "Bettzeit vorbereiten 🌙"
Supplements: pending > 0 → recommended "X Supps fällig 💊"
```

---

## Live Workout Session Components (8)

| Component | Beschreibung |
|---|---|
| `LiveWorkoutView` | Haupt-Screen für aktive Session |
| `WorkoutSessionHeader` | Übungsname, Set N/N, Timer, Energie-Level |
| `SetActiveScreen` | Während Set: Stille + Motivations-Text in letzten Reps |
| `SetCompleteInput` | Gewicht / Reps / RPE eingeben: Voice oder Manual Buttons |
| `RestTimerDisplay` | Countdown-Ring + "Los!" + "Mehr Zeit" + "Fertig" |
| `ProgressiveOverloadHint` | "Du machst konstant 12 Reps → Zeit für mehr Gewicht" |
| `FatigueWarningCard` | "Reps fallen ab: 12 → 10 → 7 — Volume kürzen?" |
| `WorkoutSummaryScreen` | Volume, PRs, Rating (💪😐😩), nächstes Training |

---

## Konfiguration / Settings Components (8)

| Component | Beschreibung |
|---|---|
| `PersonaSelector` | 5 Persona-Cards mit Preview-Satz + Beispiel-Ton |
| `AutonomyLevelSlider` | Slider 1–5 mit Beschreibung was jede Stufe erlaubt |
| `InterventionThresholdPicker` | low/medium/high/urgent_only mit Erklärung |
| `FeatureTierDisplay` | Aktueller Tier + Vergleich + Upgrade CTA |
| `ModuleAccessToggles` | Pro Modul Toggle (Medical: opt-in mit Warnung) |
| `NotificationPreferences` | Quiet Hours, Push-Kategorien, Frequenz |
| `CommunicationStyleSliders` | Humor, Direktheit, Detail-Level (je 1–5) |
| `BuddyMemoryView` | Liste aller Memory-Einträge mit Delete-Option |

---

## Journey / Heartbeat Components (4)

| Component | Beschreibung |
|---|---|
| `JourneySettings` | Alle Checkpoints als Karten + Hinzufügen/Deaktivieren |
| `CheckpointEditor` | Modal: Uhrzeit, Module, Persona, Push, Tage |
| `CheckpointPreviewCard` | Vorschau eines generierten Briefings |
| `TimezoneSelector` | Zeitzonen-Auswahl für korrekte Zeitpunkte |

---

## BSS / Analytics Components (4)

| Component | Beschreibung |
|---|---|
| `BSSOverview` | BSS Total + Trend + Sub-Scores als Balken |
| `BSSHistoryChart` | Verlauf der letzten 12 Snapshots |
| `StabilityBreakdown` | Training / Nutrition / Recovery / Dropout / Bounceback |
| `GoalAlignmentBreakdown` | Training-Align / Nutrition-Align / Body-Align |

---

## Proaktive Alerts Components (3)

| Component | Beschreibung |
|---|---|
| `AlertFeed` | Liste aller Alerts mit Level-Farbe (rot/orange/gelb) |
| `AlertCard` | Einzelner Alert + Dismiss + Inhalt |
| `AlertNotificationBadge` | In Navigation: Anzahl aktiver Alerts |

---

## AI Clone Components (Coach B2B) (3)

| Component | Beschreibung |
|---|---|
| `CloneConfigView` | Coach: Methodik-Text + Escalation Rules konfigurieren |
| `CloneTrainingInterface` | Coach: Methodik-Docs hochladen + Status |
| `CloneChatClient` | Client: Chat mit Clone (gleiche Oberfläche wie BuddyChat) |

---

## Custom Hooks (18)

| Hook | Beschreibung | Tier |
|---|---|---|
| `useBuddyChat(conversationId?)` | Chat-Verlauf + sendMessage | Free+ |
| `useBuddyStream()` | SSE Streaming Subscription | Plus+ |
| `useBuddyDashboard()` | Daily State + Scores + Decisions | Free+ |
| `useBuddyState()` | Aktueller User State (alle Scores) | Free+ |
| `useBuddyTrends(days, modules)` | Trend-Analyse | Plus+ |
| `useBuddyMemory(type?, category?)` | Memory-Einträge | Free+ |
| `useBuddyMemoryActions()` | createMemory, deleteMemory | Free+ |
| `useBuddyAlerts(level?)` | Proaktive Alerts | Pro+ |
| `useBuddyAlertActions()` | dismiss, bulkDismiss | Pro+ |
| `useBuddyJourney()` | Heartbeat-Konfiguration lesen | Plus+ |
| `useBuddyJourneyActions()` | saveJourney, triggerCheckpoint | Plus+ |
| `useBuddyProfile()` | Coach-Profil + Feature-Tier | Free+ |
| `useBuddyProfileActions()` | updatePersona, updateAutonomy, updateTier | Free+ |
| `useBuddyActions()` | App Butler: logMeal, logWater, logWeight, ... | Pro+ |
| `useLiveWorkout()` | Session State Machine | Free+ |
| `useBuddyQuickStats()` | Floating Widget: Tages-Daten | Free+ |
| `useSmartActions()` | Floating Widget: Smart Action Cards | Free+ |
| `useBuddyBSS()` | BSS aktuell + History | Plus+ |

---

## Stores (3)

```typescript
// buddyChatStore
interface BuddyChatStore {
  activeConversationId:  string | null;
  messages:              ChatMessage[];
  isStreaming:           boolean;
  pendingAction:         BuddyAction | null;
  safetyFlags:           string[];

  setConversation(id: string): void;
  addMessage(msg: ChatMessage): void;
  setStreaming(b: boolean): void;
  clearPendingAction(): void;
}

// buddyWorkoutStore
interface BuddyWorkoutStore {
  sessionId:        string | null;
  phase:            'idle'|'session_start'|'exercise_intro'|'set_active'|
                    'set_complete'|'rest'|'session_complete';
  routineId:        string | null;
  currentExercise:  number;
  currentSet:       number;
  restSeconds:      number;
  energyLevel:      number;    // 1-5 aus Pre-Session Check

  startSession(routineId: string): void;
  logSet(data: SetLogInput): void;
  startRest(seconds: number): void;
  nextSet(): void;
  nextExercise(): void;
  endSession(): void;
  reset(): void;
}

// buddyUIStore
interface BuddyUIStore {
  floatingExpanded:   boolean;
  floatingTab:        'overview' | 'actions' | 'commands';
  floatingPosition:   { x: number; y: number };
  alertsCount:        number;

  toggleWidget(): void;
  setTab(tab: string): void;
  savePosition(pos: { x: number; y: number }): void;
  setAlertsCount(n: number): void;
}
```

---

## Shared Contracts

```
packages/contracts/src/coach/
  output.ts          CoachResponse, UICard, UICardType, BuddyAction
  state.ts           BuddyState, StateSnapshot, ContextVector
  intervention.ts    InterventionLog, InterventionType, Bucket
  memory.ts          CoachMemory, MemoryType
  profile.ts         CoachProfile, PersonaType, FeatureTier
  rules.ts           BuddyRule, RuleCondition, RuleAction
  journey.ts         JourneyConfig, Checkpoint, CheckpointContent
  bss.ts             BSSSnapshot, StabilityScore, AlignmentScore
  actions.ts         ActionType, ActionPayload, ActionResult, ActionIntent
  engines.ts         EngineInput, EngineOutput (alle 11 Engines)
  scoring.ts         BSSInput, BSSResult, FeatureTier, PolicyGateResult
```

---

## i18n Keys (Auszug — 280+ total)

```
coach.buddy.greeting_morning            = "Guten Morgen, {name}!"
coach.buddy.persona.scientist           = "Scientist 🔬"
coach.buddy.persona.motivator           = "Motivator 💪"
coach.buddy.persona.drill_sergeant      = "Drill Sergeant 🎖️"
coach.buddy.persona.best_friend         = "Best Friend 😊"
coach.buddy.persona.zen_master          = "Zen Master 🧘"
coach.buddy.autonomy.1.label            = "Überwacht"
coach.buddy.autonomy.1.description      = "Alle Aktionen brauchen deine Bestätigung"
coach.buddy.autonomy.3.label            = "Kollaborativ (Standard)"
coach.buddy.autonomy.3.description      = "Buddy empfiehlt, du entscheidest"
coach.buddy.autonomy.5.label            = "Autonom"
coach.buddy.autonomy.5.description      = "Buddy handelt selbstständig"
coach.buddy.widget.on_track             = "Alles im grünen Bereich 💪"
coach.buddy.widget.warning              = "Aufmerksamkeit benötigt ⚠️"
coach.buddy.widget.off_track            = "Einiges aus dem Ruder 🔥"
coach.buddy.alert.critical              = "Kritisch 🔴"
coach.buddy.alert.warning               = "Hinweis 🟠"
coach.buddy.alert.info                  = "Info 🟡"
coach.buddy.feature.locked              = "Im {tier}-Plan verfügbar"
coach.buddy.feature.upgrade_cta         = "Jetzt upgraden"
coach.buddy.voice.listening             = "Höre zu..."
coach.buddy.voice.processing            = "Verarbeite..."
coach.buddy.action.confirm              = "Kauf bestätigen / Loggen?"
coach.buddy.memory.title                = "Was Buddy über dich weiss"
coach.buddy.memory.empty                = "Noch keine gespeicherten Präferenzen"
coach.buddy.safety.medical              = "Bitte konsultiere einen Arzt. Ich bin kein Ersatz für medizinische Beratung."
coach.buddy.bss.title                   = "Verhaltens-Stabilität"
coach.buddy.bss.improving               = "Verbessert sich 📈"
coach.buddy.bss.bounceback              = "Erholungszeit nach Rückfällen"
coach.journey.checkpoint.morning        = "Morgen-Briefing"
coach.journey.checkpoint.evening        = "Abend-Check"
coach.journey.checkpoint.weekly_review  = "Wochenreview"
```
