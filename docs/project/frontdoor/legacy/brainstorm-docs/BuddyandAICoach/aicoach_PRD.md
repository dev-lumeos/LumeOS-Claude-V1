# AI Coach Module — Product Requirements Document

**Date:** 2026-02-24
**Status:** Sprint 1 — MVP Build
**Module:** AI Coach 🧠
**API Port:** 5500
**Architecture:** Hybrid (Variante C) — Deterministic Engines + LLM

---

## Overview

Der erste holistische AI Fitness Coach der Welt. Kennt ALLE User-Daten aus allen Modulen (Nutrition, Training, Supplements, Recovery) und gibt personalisierte, datenbasierte Empfehlungen. Hybrid-Architektur: Zahlen aus deterministischen Engines, Sprache aus LLM (Claude).

**USP:** "ChatGPT rät. Lumeos WEISS."

---

## Sprint 1 Scope (MVP)

### S1.1 — Chat Interface
- **Conversational UI**: Chat-Bubble-Style, User + Coach Messages
- **Streaming Response**: Tokens streamen live (SSE), kein Warten auf komplette Antwort
- **Message History**: Letzte 50 Messages persistent in DB, Sliding Window 20 im Context
- **Quick Actions**: Vordefinierte Buttons unter dem Chat ("Wie war mein Tag?", "Was soll ich essen?", "Trainingsempfehlung")
- **Typing Indicator**: Pulsierender Dot während Coach "denkt"
- **Markdown Support**: Coach kann **bold**, Listen, Tabellen, Emoji nutzen
- **i18n**: DE/EN/TH — Coach antwortet in der Sprache des Users

### S1.2 — Context Builder (Cross-Module Intelligence)
Der Coach sieht ALLES:

| Datenquelle | Was der Coach sieht | API Endpoint |
|-------------|-------------------|--------------|
| **Nutrition** | Heutige Macros, Ø 7d, Defizite, Score | `/api/nutrition/summary` |
| **Supplements** | Aktiver Stack, Compliance %, Interactions | `/api/supplements/stacks`, `/intake/compliance` |
| **Recovery** | Recovery Score, Schlaf, Soreness, Overtraining | `/api/recovery/score`, `/checkin` |
| **Training** | Letzte Workouts, Volume, Muskelgruppen | `/api/training/workouts` |
| **Targets** | Kcal/Protein/Carbs/Fat Ziele | `/api/nutrition/targets` |
| **Weight** | Aktuelles Gewicht, Trend | `/api/nutrition/weight` |
| **Settings** | User Preferences, Meal Schedule | `/api/nutrition/settings` |

### S1.3 — Persona System (5 Persönlichkeiten)
User wählt seinen Coach-Stil:

| Persona | Icon | Vibe | Prompt-Stil |
|---------|------|------|-------------|
| 🔬 Scientist | 🔬 | Evidenz-basiert, nüchtern | "Studien zeigen...", Zahlen, Referenzen |
| 💪 Motivator | 💪 | Energetisch, feiernd | "BOOM! 🔥", Emojis, Celebrations |
| 🎖️ Drill Sergeant | 🎖️ | Hart, direkt, keine Ausreden | "Keine Ausreden.", knapp, fordernd |
| 😊 Best Friend | 😊 | Locker, supportive | "Hey, lass uns mal schauen...", empathisch |
| 🧘 Sensei | 🧘 | Weise, geduldig | "Der Weg ist das Ziel.", langfristig denkend |

### S1.4 — Proactive Daily Briefing
- **Morning Briefing Card** auf Home: "Guten Morgen Tom! Hier ist dein Plan für heute..."
  - Recovery Score + Empfehlung (push/moderate/rest)
  - Nutrition Targets + Meal Suggestions
  - Supplement Reminder
  - Training Empfehlung basierend auf Recovery + Muscle Readiness
- **Evening Summary**: "Dein Tag: Nutrition 78%, Training ✅, Supps 5/6"
- Auto-generiert, KEIN LLM-Call nötig (Fast Path = $0)

### S1.5 — Smart Insights (Cross-Module)
Proaktive Insights die Module verbinden:
- "Dein Protein ist 30g unter Ziel, aber du hast Heavy Legs trainiert → Regeneration verzögert sich"
- "Recovery Score 45% + schlechter Schlaf → heute leichteres Training empfohlen"
- "Supplement Compliance nur 60% diese Woche → Reminder einschalten?"
- "Dein Gewicht stagniert seit 2 Wochen → TDEE anpassen?"

### S1.6 — Safety Layer
- **Medical Disclaimer**: Automatisch bei Health-Themen
- **Calculation Guard**: Zahlen IMMER aus deterministischen Engines, NIE aus LLM
- **Supplement Safety**: Interaction-Check IMMER deterministisch
- **No Diagnosis**: Coach gibt NIE medizinische Diagnosen
- **Enhanced Mode Awareness**: Bei aktivem Cycle → extra vorsichtig, Disclaimer

---

## Database Schema (Migration 011)

```sql
-- Coach conversations
CREATE TABLE coach_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',
  title TEXT,
  persona TEXT DEFAULT 'best_friend' CHECK (persona IN ('scientist','motivator','drill_sergeant','best_friend','sensei')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Coach messages
CREATE TABLE coach_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES coach_conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',
  role TEXT NOT NULL CHECK (role IN ('user','assistant','system')),
  content TEXT NOT NULL,
  context_snapshot JSONB DEFAULT '{}',
  tokens_used INT DEFAULT 0,
  model TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Daily briefings (cached)
CREATE TABLE coach_briefings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  briefing_type TEXT NOT NULL CHECK (briefing_type IN ('morning','evening')),
  content JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date, briefing_type)
);

-- Coach settings per user
CREATE TABLE coach_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001' UNIQUE,
  persona TEXT DEFAULT 'best_friend',
  language TEXT DEFAULT 'de',
  proactive_enabled BOOLEAN DEFAULT true,
  daily_briefing BOOLEAN DEFAULT true,
  insight_notifications BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_coach_conversations_user ON coach_conversations(user_id);
CREATE INDEX idx_coach_messages_conversation ON coach_messages(conversation_id);
CREATE INDEX idx_coach_messages_created ON coach_messages(created_at);
CREATE INDEX idx_coach_briefings_user_date ON coach_briefings(user_id, date);

-- RLS
ALTER TABLE coach_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE coach_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE coach_briefings ENABLE ROW LEVEL SECURITY;
ALTER TABLE coach_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY coach_conversations_user ON coach_conversations FOR ALL USING (user_id = '00000000-0000-0000-0000-000000000001');
CREATE POLICY coach_messages_user ON coach_messages FOR ALL USING (user_id = '00000000-0000-0000-0000-000000000001');
CREATE POLICY coach_briefings_user ON coach_briefings FOR ALL USING (user_id = '00000000-0000-0000-0000-000000000001');
CREATE POLICY coach_settings_user ON coach_settings FOR ALL USING (user_id = '00000000-0000-0000-0000-000000000001');
```

---

## API Endpoints (Port 5500)

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/coach/conversations | List conversations |
| POST | /api/coach/conversations | Create new conversation |
| GET | /api/coach/conversations/:id/messages | Get messages |
| POST | /api/coach/chat | Send message + get AI response (SSE stream) |
| GET | /api/coach/briefing?date=&type= | Get daily briefing |
| POST | /api/coach/briefing/generate | Generate briefing for today |
| GET | /api/coach/insights | Get proactive insights |
| GET | /api/coach/settings | Get coach settings |
| PUT | /api/coach/settings | Update settings (persona, language, etc.) |
| GET | /api/coach/context | Get current context snapshot (debug) |
| POST | /api/coach/quick-action | Execute quick action (pre-defined prompts) |

---

## UI Components

| Component | Description |
|-----------|-------------|
| CoachView | Main coach tab with chat + briefing |
| ChatInterface | Message bubbles, input, streaming |
| MessageBubble | Single message (user/coach), markdown render |
| QuickActions | Pre-defined action buttons |
| PersonaSelector | Choose coach personality |
| DailyBriefing | Morning/evening summary card |
| InsightCard | Proactive cross-module insight |
| CoachSettings | Persona, language, notifications |
| TypingIndicator | Animated dots while coach responds |
| CoachOnboarding | First-time setup (persona selection) |

---

## Context Builder Spec

```typescript
interface CoachContext {
  // Current date/time
  date: string;
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  dayOfWeek: string;
  
  // Nutrition (today)
  nutrition: {
    score: number;
    calories: { actual: number; target: number; remaining: number };
    protein: { actual: number; target: number };
    carbs: { actual: number; target: number };
    fat: { actual: number; target: number };
    water: { actual: number; target: number };
    mealsLogged: number;
    topDeficiencies: string[]; // Top 3 micro deficiencies
  };
  
  // Nutrition (7-day average)  
  nutritionWeekly: {
    avgScore: number;
    avgCalories: number;
    avgProtein: number;
    adherenceRate: number; // % days on target
  };
  
  // Weight
  weight: {
    current: number;
    trend7d: number; // change in kg over 7 days
    bmi: number;
  };
  
  // Recovery (today)
  recovery: {
    score: number;
    sleepHours: number;
    sleepQuality: number;
    feeling: number;
    mood: string;
    overtrainingLevel: string;
    soreMusles: string[];
  };
  
  // Supplements
  supplements: {
    compliance: number; // today %
    weeklyCompliance: number;
    taken: number;
    total: number;
    activeCycle: string | null;
    isPinDay: boolean;
    interactions: string[];
  };
  
  // Training (last 7 days)
  training: {
    workoutsThisWeek: number;
    lastWorkout: { date: string; type: string; duration: number } | null;
    muscleGroupsHit: string[];
    muscleGroupsMissed: string[];
  };
  
  // User profile
  user: {
    name: string;
    language: string;
    experience: string;
    goals: string[];
  };
}
```

---

## Persona System Prompts

Each persona gets a different system prompt that shapes tone, style, and communication approach. The factual content (data, calculations, safety) remains identical — only the delivery changes.

---

## Navigation Update

**Bottom Tabs (6):** Home 🏠 | Coach 🧠 | Diary 📖 | Training 🏋️ | Supps 💊 | Recovery 💤

Coach gets position 2 (after Home) because it's the central intelligence hub.

---

## Cross-Module Insight Rules

| Insight | Condition | Priority |
|---------|-----------|----------|
| Protein deficit + training | protein < 80% target AND trained today | HIGH |
| Low recovery + heavy training | recovery < 50 AND planned heavy workout | HIGH |
| Supplement compliance dropping | weekly compliance < 70% | MEDIUM |
| Weight stagnation | <0.1kg change over 14 days | MEDIUM |
| Sleep deficit pattern | avg sleep < 6h for 3+ days | HIGH |
| Overtraining risk | overtraining signals >= 3 | CRITICAL |
| Dehydration | water < 50% target by 14:00 | MEDIUM |
| Meal skipped | 0 meals logged by 12:00 | LOW |

---

## Acceptance Criteria

- [ ] AC1: Chat interface with streaming responses (SSE)
- [ ] AC2: Coach uses REAL user data from all modules (not fake/hardcoded)
- [ ] AC3: 5 personas selectable, each with distinct communication style
- [ ] AC4: Morning briefing card on Home with recovery + nutrition + training recommendation
- [ ] AC5: Cross-module insights (at least 5 insight types)
- [ ] AC6: Conversation history persisted in DB
- [ ] AC7: Quick action buttons ("Wie war mein Tag?", "Was soll ich essen?", etc.)
- [ ] AC8: Safety disclaimers on medical/supplement topics
- [ ] AC9: All UI text in DE/EN/TH
- [ ] AC10: Coach tab in bottom navigation
- [ ] AC11: Context builder aggregates data from all 4 existing APIs
- [ ] AC12: Evening summary available
