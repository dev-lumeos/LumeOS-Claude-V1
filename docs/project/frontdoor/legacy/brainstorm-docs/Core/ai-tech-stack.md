# AI Coach — Technical Stack & Build vs Buy

## Core AI Components

### 1. LLM Engine (Chat + Reasoning)
| Option | Pro | Contra | Cost |
|--------|-----|--------|------|
| **OpenAI GPT-4o** | Best general, fast, tool calling | US-hosted, teuer bei Scale | $2.50-15/1M tokens |
| **Anthropic Claude 3.5** | Safety, long context, reasoning | Teurer | $3-15/1M tokens |
| **Open Source (Llama 3, Mistral)** | Self-hosted, free, DSGVO | Qualität niedriger, GPU nötig | GPU cost |
| **Fine-tuned Model** | Domain-specific, consistent | Training aufwand, Daten nötig | $$$$ initial |

**Empfehlung:** GPT-4o-mini für Standard-Chat ($0.15/1M input), GPT-4o für komplexe Analysen. Fine-tune langfristig.

### 2. Structured Engines (Deterministic)
| Engine | Build/Buy | Technology | Notes |
|--------|-----------|-----------|-------|
| TDEE Calculator | **BUILD** | TypeScript | Simple math, see formulas |
| Adaptive TDEE | **BUILD** | TypeScript + Stats | Exponential moving average |
| Macro Calculator | **BUILD** | TypeScript | Deterministic from goals |
| Periodization | **BUILD** | TypeScript + Rules | Rule engine + ML |
| Supplement Interactions | **BUY DATA** | DB (NIH DSLD) | Free data, own engine |
| Bloodwork Analysis | **BUILD** | TypeScript + Ranges DB | Optimal ranges from research |
| Recovery Score | **BUILD** | TypeScript + HRV algo | HRV4Training als Referenz |
| Correlation Engine | **BUILD** | Python/TypeScript + Stats | Cross-module correlations |

### 3. Computer Vision
| Feature | Build/Buy | Options | Notes |
|---------|-----------|---------|-------|
| **Form Check** | **BUY API** | Kemtai API, MediaPipe | Kemtai = medical-validated |
| **Food Photo** | **BUY API** | Nutritionix Vision, LogMeal | LogMeal API = good accuracy |
| **Body Comp Scan** | **BUILD** | MediaPipe + own model | Zing Coach approach |
| **Bloodwork OCR** | **BUY API** | Google Vision / AWS Textract | Commodity OCR + own parser |

### 4. Proactive System (Notifications + Nudges)
| Component | Technology | Notes |
|-----------|-----------|-------|
| Scheduling Engine | Cron + Event-driven | Meal timing, workouts, supplements |
| Trigger System | Rule engine | HRV low → alert, Streak broken → nudge |
| Personalization | ML model | When to nudge (nicht zu viel, nicht zu wenig) |
| Delivery | Push + In-App | iOS/Android Push + In-App Messages |

---

## Context Builder — How the AI Coach "Thinks"

```typescript
interface UserContext {
  // Core Profile
  profile: {
    name: string;
    age: number;
    gender: 'M' | 'F';
    weight: number;        // kg, current
    height: number;        // cm
    bodyFat?: number;      // %
    experience: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    persona: 'scientist' | 'motivator' | 'drill_sergeant' | 'best_friend' | 'sensei';
  };

  // Goal State
  goal: {
    type: GoalPhase;       // FAT_LOSS, LEAN_BULK, CONTEST_PREP...
    startDate: Date;
    targetDate: Date;
    progress: number;      // 0-100%
    weekNumber: number;    // Week 6 of 12
    dailyCalories: number;
    macros: { protein: number; carbs: number; fat: number };
    adaptiveTDEE: number;
  };

  // Recent Data (last 7 days)
  recentTraining: {
    sessions: number;
    totalVolume: number;
    prHit: boolean;
    musclesSore: string[];
    lastWorkout: string;   // "gestern, Upper Body, 45 min"
  };

  recentNutrition: {
    avgCalories: number;
    avgProtein: number;
    adherence: number;     // 0-100%
    missedMeals: number;
  };

  recentRecovery: {
    avgHRV: number;
    hrvTrend: 'up' | 'stable' | 'down';
    avgSleep: number;      // hours
    recoveryScore: number; // 0-100
  };

  supplements: {
    activeStack: string[];
    adherence: number;     // 0-100%
    missedToday: string[];
  };

  // Alerts / Flags
  alerts: string[];
  // e.g. ["weight stalled 2 weeks", "HRV declining", "protein consistently low"]
}

function buildPrompt(context: UserContext, userMessage: string): string {
  return `
You are ${context.profile.name}'s personal AI fitness coach.
Personality: ${context.profile.persona}
Goal: ${context.goal.type} (Week ${context.goal.weekNumber}, ${context.goal.progress}% complete)
TDEE: ${context.goal.adaptiveTDEE} kcal | Target: ${context.goal.dailyCalories} kcal
Macros: ${context.goal.macros.protein}P / ${context.goal.macros.carbs}C / ${context.goal.macros.fat}F

Recent 7 Days:
- Training: ${context.recentTraining.sessions} sessions, ${context.recentTraining.prHit ? 'NEW PR! 🎉' : 'no PR'}
- Nutrition: ${context.recentNutrition.adherence}% adherence, avg ${context.recentNutrition.avgProtein}g protein
- Recovery: HRV ${context.recentRecovery.hrvTrend}, Sleep ${context.recentRecovery.avgSleep}h, Score ${context.recentRecovery.recoveryScore}
- Supplements: ${context.supplements.adherence}% adherence

${context.alerts.length > 0 ? 'ALERTS: ' + context.alerts.join(', ') : 'No alerts.'}

User says: "${userMessage}"

Respond as their AI coach. Use their data. Be specific. Give actionable advice.
If calculation needed, use the structured engine (tool call).
`;
}
```

---

## Cost Estimation (per User/Month)

| Component | Cost/User/Month | Notes |
|-----------|----------------|-------|
| LLM (GPT-4o-mini, ~30 chats/mo) | $0.05-0.15 | 30 prompts × ~1K tokens |
| LLM (GPT-4o, ~5 complex/mo) | $0.10-0.30 | Weekly reports, bloodwork |
| CV Form Check (10 exercises/mo) | $0.20-0.50 | Kemtai API or MediaPipe |
| Food Photo (30 photos/mo) | $0.10-0.30 | LogMeal API |
| Push Notifications | $0.01 | Firebase/APNs |
| Storage (logs, data) | $0.05 | Cloud storage |
| **TOTAL** | **$0.50-1.30/user/mo** | At scale |

**Margin bei $9.99/mo Subscription: 87-95%** 🔥

---

## Build Roadmap

### Phase 1: MVP (Month 1-3)
- LLM Chat (GPT-4o-mini) mit User Profile + Goal State
- Basic Goal Engine (TDEE + Macros + Phase)
- Training recommendations (text-based)
- Proactive: Daily macro summary, Weekly report

### Phase 2: Intelligence (Month 4-6)
- Adaptive TDEE (aus echten Daten)
- Cross-Module Insights (Training × Nutrition)
- Supplement recommendations
- Food Photo logging (API)
- Personality selection

### Phase 3: Advanced (Month 7-12)
- CV Form Check (Kemtai API oder eigen)
- Recovery-aware coaching (HRV integration)
- Bloodwork analysis
- Coach AI Clone
- Voice interaction
- Contest Prep mode
