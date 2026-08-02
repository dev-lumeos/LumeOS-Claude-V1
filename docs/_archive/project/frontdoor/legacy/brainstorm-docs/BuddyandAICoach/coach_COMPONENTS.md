# Coach Frontend Components

## Pages

### Main Coach Page
**File:** `apps/app/app/(app)/coach/page.tsx`
- AI Coach dashboard and overview
- Chat interface with Buddy
- Daily insights and recommendations
- Cross-module analysis display

### My Coach Page
**File:** `apps/app/app/(app)/coach/my-coach/page.tsx`  
- Personalized coach settings
- Coaching preferences configuration
- Conversation history
- Coach performance analytics

## Core Components

### CoachBuddy
**File:** `apps/app/modules/coach/CoachBuddy.tsx`
- Main AI coach interface wrapper
- Handles multiple coach personas (Buddy, Professional, Motivational)
- Context management and state persistence
- Integration with all Lumeos modules

### ChatInterface
**File:** `apps/app/modules/coach/components/ChatInterface.tsx`
- Real-time chat with AI coach
- Message streaming and typing indicators
- Context-aware conversations
- Multi-modal input support (text, voice, images)
- Conversation memory and recall

### BuddyDecisionFeed
**File:** `apps/app/modules/coach/components/BuddyDecisionFeed.tsx`
- Real-time decision feed from Buddy system
- Automated recommendations and suggestions
- Action approval/rejection interface
- Decision reasoning explanations
- Impact tracking for executed decisions

### InsightCards
**File:** `apps/app/modules/coach/components/InsightCards.tsx`
- Daily/weekly insights from cross-module analysis
- Pattern recognition results
- Performance trends visualization
- Goal progress insights
- Actionable recommendations

### PersonaSelector
**File:** `apps/app/modules/coach/components/PersonaSelector.tsx`
- Switch between different coach personalities
- Buddy (friendly), Professional (clinical), Motivational (energetic)
- Persona customization options
- Communication style preferences
- Response tone adjustments

### QuickCommands
**File:** `apps/app/modules/coach/components/QuickCommands.tsx`
- Rapid-fire commands for common actions
- Voice-activated shortcuts
- Quick logging (meals, workouts, recovery)
- Status queries and summaries
- Emergency override commands

## Advanced Components

### CoachAutonomyConfig
**File:** `apps/app/modules/coach/components/CoachAutonomyConfig.tsx`
- Configure Buddy autonomous decision-making
- Set intervention thresholds and limits
- Define approved/restricted actions
- Autonomy level settings (passive, moderate, active)
- Safety guardrails configuration

### WatcherSummary
**File:** `apps/app/modules/coach/components/WatcherSummary.tsx`
- Multi-user watcher system status
- Family/team coaching overview
- Alert aggregation across users
- Coaching load distribution
- Performance comparison dashboards

### MemoryExplorer
**File:** `apps/app/modules/coach/components/MemoryExplorer.tsx`
- Browse and manage coach memory system
- View conversation memory, preferences, patterns
- Memory confidence scores and validation
- Memory editing and deletion
- Learning progress visualization

### CrossModuleAnalytics
**File:** `apps/app/modules/coach/components/CrossModuleAnalytics.tsx`
- Comprehensive cross-module data analysis
- Correlation discovery between modules
- Pattern recognition visualization
- Predictive analytics results
- Multi-dimensional performance mapping

### ActionExecutor
**File:** `apps/app/modules/coach/components/ActionExecutor.tsx`
- Execute coach-suggested actions
- Preview action consequences
- Batch action execution
- Action history and rollback
- Success/failure tracking

### KnowledgeSearch
**File:** `apps/app/modules/coach/components/KnowledgeSearch.tsx`
- RAG-powered knowledge base search
- Scientific evidence lookup
- Contextual information retrieval
- Source credibility ratings
- Bookmark and reference management

## Specialized Components

### VoiceInterface
**File:** `apps/app/modules/coach/components/VoiceInterface.tsx`
- Voice-to-text conversation interface
- Real-time speech recognition
- Voice command processing
- Hands-free coaching interactions
- Multi-language voice support

### ProgressPhotoAnalysis
**File:** `apps/app/modules/coach/components/ProgressPhotoAnalysis.tsx`
- AI-powered progress photo analysis
- Body composition change detection
- Visual progress tracking
- Before/after comparisons
- Automated measurement suggestions

### MealPhotoCoach
**File:** `apps/app/modules/coach/components/MealPhotoCoach.tsx`
- Claude Vision integration for meal analysis
- Real-time nutritional feedback
- Portion size coaching
- Meal improvement suggestions
- Food choice pattern analysis

### WorkoutFormCoach
**File:** `apps/app/modules/coach/components/WorkoutFormCoach.tsx`
- AI form analysis from workout videos
- Real-time technique feedback
- Injury prevention coaching
- Movement pattern optimization
- Exercise modification suggestions

### GoalCoachingDashboard
**File:** `apps/app/modules/coach/components/GoalCoachingDashboard.tsx`
- Goal-specific coaching interface
- Progress tracking and adjustments
- Milestone celebration and motivation
- Obstacle identification and solutions
- Goal refinement recommendations

### EmotionalWellnessCoach
**File:** `apps/app/modules/coach/components/EmotionalWellnessCoach.tsx`
- Mental health and motivation coaching
- Stress management guidance
- Confidence building exercises
- Habit formation psychology
- Burnout prevention and recovery

## Component Architecture

```
apps/app/modules/coach/
├── CoachBuddy.tsx                    # Main coach interface
├── components/
│   ├── ChatInterface.tsx            # Core chat functionality
│   ├── BuddyDecisionFeed.tsx        # Autonomous decision display
│   ├── InsightCards.tsx             # Daily insights and patterns
│   ├── PersonaSelector.tsx          # Coach personality selection
│   ├── QuickCommands.tsx            # Rapid command interface
│   ├── CoachAutonomyConfig.tsx      # Autonomy settings
│   ├── WatcherSummary.tsx           # Multi-user monitoring
│   ├── MemoryExplorer.tsx           # Memory system browser
│   ├── CrossModuleAnalytics.tsx     # Cross-module analysis
│   ├── ActionExecutor.tsx           # Action execution interface
│   ├── KnowledgeSearch.tsx          # RAG knowledge search
│   ├── VoiceInterface.tsx           # Voice interaction
│   ├── ProgressPhotoAnalysis.tsx    # Visual progress tracking
│   ├── MealPhotoCoach.tsx           # Meal photo analysis
│   ├── WorkoutFormCoach.tsx         # Exercise form coaching
│   ├── GoalCoachingDashboard.tsx    # Goal-specific guidance
│   └── EmotionalWellnessCoach.tsx   # Mental wellness support
├── hooks/
│   ├── useCoachChat.ts              # Chat functionality
│   ├── useBuddyDecisions.ts         # Decision management
│   ├── useCoachMemory.ts            # Memory operations
│   ├── useCrossModuleData.ts        # Multi-module data
│   ├── useVoiceCommands.ts          # Voice processing
│   └── useCoachInsights.ts          # Insight generation
├── stores/
│   ├── coachStore.ts                # Global coach state
│   ├── conversationStore.ts         # Chat history state
│   └── memoryStore.ts               # Memory system state
└── types/
    ├── coach.ts                     # Coach system types
    ├── conversation.ts              # Chat types
    ├── memory.ts                    # Memory types
    └── insights.ts                  # Analytics types
```

## Key Features

### Multi-Modal Interaction
- **Text Chat**: Traditional chat interface with rich formatting
- **Voice Commands**: Hands-free interaction for busy situations
- **Image Analysis**: Photo-based coaching for meals and progress
- **Video Analysis**: Form coaching from workout recordings
- **Gesture Control**: Future enhancement for hands-free navigation

### Coaching Personas
```typescript
interface CoachPersona {
  id: 'buddy' | 'professional' | 'motivational' | 'zen';
  name: string;
  description: string;
  communicationStyle: 'casual' | 'formal' | 'energetic' | 'calm';
  specialties: string[];
  responsePatterns: {
    encouragement: string[];
    correction: string[];
    celebration: string[];
    concern: string[];
  };
}
```

### Autonomous Decision System
- **Decision Types**: Reminders, suggestions, interventions, celebrations
- **Autonomy Levels**: Passive (suggestions only), Active (automatic actions)
- **Safety Guardrails**: Prevent harmful or inappropriate decisions
- **User Approval**: Required for significant actions
- **Learning Loop**: Improve decisions based on user feedback

### Memory Management
- **Conversation Memory**: Context from past interactions
- **Preference Learning**: User preferences and patterns
- **Behavioral Patterns**: Recognition of habits and trends
- **Goal Tracking**: Progress toward objectives
- **Context Awareness**: Understanding of current situation

### Cross-Module Intelligence
```typescript
interface CrossModuleInsight {
  modules_involved: string[];
  correlation_type: 'positive' | 'negative' | 'neutral';
  strength: number; // 0-1 correlation strength
  insight: string;
  actionable_recommendations: string[];
  confidence: number;
}
```

## Technology Integration

### AI Model Integration
- **Claude Sonnet 4.0**: Primary conversation and reasoning
- **Z.AI GLM Models**: Lightweight tasks and intent detection
- **Claude Vision**: Image and photo analysis
- **Local Models**: Privacy-sensitive processing

### Real-Time Communication
- **WebSocket**: Real-time chat and decision updates
- **Server-Sent Events**: Streaming responses and notifications
- **Background Sync**: Offline capability with sync when online
- **Push Notifications**: Critical alerts and reminders

### Voice Processing
- **Web Speech API**: Browser-based speech recognition
- **OpenAI Whisper**: Advanced speech-to-text processing
- **Natural Language**: Command interpretation and execution
- **Voice Synthesis**: Text-to-speech for hands-free use

### Privacy and Security
- **Local Processing**: Sensitive data processed locally when possible
- **Encryption**: All communications encrypted in transit
- **Data Minimization**: Only necessary data sent to AI services
- **User Control**: Full control over data sharing and retention

## User Experience Features

### Adaptive Interface
- **Context-Aware UI**: Interface adapts to current activity
- **Progressive Disclosure**: Advanced features revealed as needed
- **Personalization**: Layout and features match user preferences
- **Accessibility**: Full accessibility compliance

### Learning and Improvement
- **Feedback Loops**: Continuous improvement from user interactions
- **A/B Testing**: Optimize coaching effectiveness
- **Performance Metrics**: Track coaching success rates
- **User Satisfaction**: Regular satisfaction surveys and adjustments

### Gamification Elements
- **Coaching Streaks**: Consecutive days of positive interactions
- **Achievement Unlocks**: New features unlocked through engagement
- **Progress Celebrations**: AI-generated celebrations for milestones
- **Challenge Participation**: Group and individual challenges

## Integration Points

### With Training Module
- Workout analysis and form feedback
- Progressive overload coaching
- Recovery-training balance guidance
- Performance optimization recommendations

### With Nutrition Module
- Meal planning and timing guidance
- Nutritional goal achievement coaching
- Food choice pattern analysis
- Metabolic optimization advice

### With Recovery Module
- Sleep optimization coaching
- Stress management guidance
- Recovery protocol recommendations
- Overtraining prevention alerts

### With Goals Module
- Goal setting and refinement
- Progress tracking and adjustments
- Milestone coaching and celebration
- Obstacle identification and solutions