# Buddy / AI Coach Module — Frontend Components

## Pages + Navigation

| Page/Route | Beschreibung |
|---|---|
| `/(app)/coach/` | Buddy Chat Hauptseite |
| `/(app)/coach/settings/` | Buddy-Einstellungen (Persona, Journey, Alerts) |
| `/(app)/coach/journey/` | Heartbeat Konfiguration |
| `/(app)/coach/history/` | Chat-Verlauf |
| `/(app)/coach/memory/` | Buddy Memory (was weiss er über mich?) |

---

## Core Buddy Components (10)

| Component | Beschreibung |
|---|---|
| `BuddyChat` | Haupt-Chat Interface (Text + Rich Cards + Actions) |
| `BuddyMessageBubble` | Einzelne Nachricht (User oder Buddy) |
| `BuddyActionCard` | Rich Cards: stat/comparison/list/chart/exercise/meal_plan |
| `BuddyChoiceButtons` | Quick-Reply Buttons für `choices[]` aus Output Contract |
| `BuddyEvidenceCard` | 📚 "Warum?"-Button → Wissenschaftliche Quellen |
| `BuddyInputBar` | Text + Mikrofon + Kamera Button |
| `BuddyVoiceButton` | STT Integration, Push-to-talk |
| `BuddyStreamingText` | Streaming SSE Text-Animation |
| `BuddySafetyBanner` | Persistent bei `safety_flags: ["medical_content"]` |
| `BuddyPersonaIndicator` | Anzeige aktiver Persona (🔬💪🎖️😊🧘) |

---

## Floating Widget (B13)

| Component | Beschreibung |
|---|---|
| `BuddyFloatingWidget` | Draggable Bubble mit expandierbarem Panel |
| `MiniCommandCenter` | 3-Tab Panel: Overview, Actions, Commands |
| `FloatingOverviewTab` | Quick Stats: Kalorien, Protein, Training, Recovery |
| `FloatingActionsTab` | Smart Action Cards (urgent/recommended) |
| `FloatingCommandsTab` | Instant AI Commands ohne Chat-Öffnen |
| `FloatingSmartActionCard` | Einzelne Action mit Priority + Navigation |
| `FloatingStatusBubble` | Minimierter Zustand: Emoji + Badge |

---

## Live Workout Mode Components (8)

| Component | Beschreibung |
|---|---|
| `LiveWorkoutView` | Haupt-Screen für aktive Session |
| `WorkoutSessionHeader` | Übungsname, Set-Fortschritt, Timer |
| `SetActiveScreen` | Während Set: Stille + Motivations-Text in letzten Reps |
| `SetCompleteInput` | Gewicht / Reps / RPE eingeben (Voice oder Manual) |
| `RestTimerDisplay` | Countdown + "Los!" + "Mehr Zeit" Button |
| `ProgressiveOverloadHint` | "Du machst konstant 12 Reps → Zeit für mehr Gewicht" |
| `FatigueWarningCard` | "Reps fallen ab → Volume kürzen?" |
| `WorkoutSummaryScreen` | Volume, PRs, Rating (💪😐😩), Nächstes Training |

---

## Settings Components (6)

| Component | Beschreibung |
|---|---|
| `PersonaSelector` | 5 Personas mit Vorschau-Text |
| `AutonomyLevelSlider` | Level 1–5 mit Konsequenzen-Erklärung |
| `InterventionThresholdPicker` | low / medium / high / urgent_only |
| `ModuleAccessToggles` | Welche Module darf Buddy sehen? (Medical: opt-in) |
| `FeatureTierDisplay` | Aktueller Tier + Upgrade CTA |
| `NotificationPreferences` | Quiet Hours, Kanäle, Kategorien |

---

## Journey / Heartbeat Components (4)

| Component | Beschreibung |
|---|---|
| `JourneySettings` | Master-Settings: Checkpoints konfigurieren |
| `CheckpointEditor` | Uhrzeit, Module, Persona, Push, Tage |
| `JourneyPreview` | Vorschau wie ein Checkpoint aussieht |
| `TimezoneSelector` | Zeitzone für korrekte Briefings |

---

## Memory & Transparency Components (3)

| Component | Beschreibung |
|---|---|
| `BuddyMemoryView` | Was weiss Buddy über mich? (Liste aller Memory-Einträge) |
| `MemoryItemCard` | Einzelner Memory-Eintrag + "Löschen"-Option |
| `BuddyAuditLog` | Welche Entscheidungen hat Buddy getroffen? |

---

## Proaktive Alerts Components (3)

| Component | Beschreibung |
|---|---|
| `AlertFeed` | Liste aller proaktiven Alerts (critical/warning/info) |
| `AlertCard` | Einzelner Alert mit Level-Farbe + Dismiss |
| `AlertBadge` | Notification Badge in Navigation |

---

## AI Clone Components (Coach B2B) (3)

| Component | Beschreibung |
|---|---|
| `CloneConfigView` | Coach: Clone-Methodik + Escalation Rules |
| `CloneTrainingInterface` | Coach: Methodik-Docs hochladen |
| `CloneChatClient` | Client: Chat mit AI Clone (im Stil des Coaches) |

---

## Custom Hooks (18)

| Hook | Beschreibung |
|---|---|
| `useBuddyChat(conversationId?)` | Chat-Verlauf + Send-Action |
| `useBuddyStream()` | SSE Streaming Subscription |
| `useBuddyDashboard()` | Daily State + Scores + Decisions |
| `useBuddyState()` | Aktueller User State (alle Scores) |
| `useBuddyTrends(days, modules)` | Trend-Analyse |
| `useBuddyMemory(type?, category?)` | Memory-Einträge |
| `useBuddyMemoryActions()` | create, delete Memory |
| `useBuddyAlerts(level?)` | Proaktive Alerts |
| `useBuddyAlertActions()` | dismiss, bulkDismiss |
| `useBuddyJourney()` | Heartbeat-Konfiguration |
| `useBuddyJourneyActions()` | save, triggerCheckpoint |
| `useBuddyProfile()` | Coach-Profil + Präferenzen |
| `useBuddyProfileActions()` | updatePersona, updateAutonomy |
| `useBuddyActions()` | App Butler: logMeal, logWeight, logCheckin, ... |
| `useLiveWorkout()` | Session State Machine |
| `useBuddyQuickStats()` | Für Floating Widget: Quick Stats |
| `useSmartActions()` | Für Floating Widget: Smart Action Cards |
| `useBuddyBSS()` | Behavior Stability Score |

---

## Stores (3)

```typescript
// buddyChatStore
interface BuddyChatStore {
  activeConversationId: string | null;
  isStreaming:          boolean;
  pendingAction:        BuddyAction | null;
  safetyFlags:          string[];

  setConversation(id: string): void;
  addMessage(msg: ChatMessage): void;
  setStreaming(b: boolean): void;
}

// buddyWorkoutStore
interface BuddyWorkoutStore {
  sessionId:      string | null;
  phase:          SessionPhase;
  currentExercise: Exercise | null;
  currentSet:     number;
  restSeconds:    number;

  startSession(routineId: string): void;
  nextSet(): void;
  nextExercise(): void;
  endSession(): void;
}

// buddyUIStore
interface BuddyUIStore {
  floatingWidgetExpanded:   boolean;
  floatingWidgetTab:        'overview'|'actions'|'commands';
  floatingWidgetPosition:   { x: number; y: number };
  alertsCount:              number;

  toggleWidget(): void;
  setWidgetTab(tab: string): void;
  savePosition(pos: {x:number;y:number}): void;
}
```

---

## i18n Keys (240+ Auszug)

```
coach.buddy.greeting_morning    = "Guten Morgen, {name}!"
coach.buddy.persona.scientist   = "Scientist 🔬"
coach.buddy.persona.motivator   = "Motivator 💪"
coach.buddy.persona.drill       = "Drill Sergeant 🎖️"
coach.buddy.persona.friend      = "Best Friend 😊"
coach.buddy.persona.zen         = "Zen Master 🧘"
coach.buddy.autonomy.1          = "Überwacht (alle Aktionen bestätigen)"
coach.buddy.autonomy.3          = "Kollaborativ (Standard)"
coach.buddy.autonomy.5          = "Autonom (Buddy entscheidet selbst)"
coach.buddy.widget.on_track     = "Alles im grünen Bereich 💪"
coach.buddy.widget.warning      = "Aufmerksamkeit benötigt ⚠️"
coach.buddy.alert.critical      = "Kritisch 🔴"
coach.buddy.alert.warning       = "Hinweis 🟠"
coach.buddy.feature.locked      = "Im {tier}-Tier verfügbar"
coach.buddy.voice.listening     = "Höre zu..."
coach.buddy.memory.what_i_know  = "Was Buddy über dich weiss"
coach.buddy.safety.medical      = "Bitte konsultiere einen Arzt."
```

---

## Shared Contracts

```
packages/contracts/src/coach/
  output.ts          CoachResponse, UICard, BuddyAction, OutputSchema
  state.ts           BuddyState, ContextVector, StateSnapshot
  intervention.ts    InterventionLog, InterventionType, Bucket
  memory.ts          CoachMemory, MemoryType
  profile.ts         CoachProfile, PersonaType, FeatureTier
  rules.ts           BuddyRule, RuleCondition, RuleAction
  journey.ts         JourneyConfig, Checkpoint
  bss.ts             BSSSnapshot, StabilityScore
  actions.ts         ActionType, ActionPayload, ActionResult
```
