# Coach Module Migration Documentation

## Migration Overview

The Coach module represents a complete shift from reactive fitness apps to proactive AI-powered coaching. This migration consolidates multiple legacy coaching approaches into a unified, intelligent system.

## Legacy System Consolidation

### From Multiple Coaching Sources
```
Legacy Sources → Unified Coach System
├── Manual Tracking Apps → Buddy Autonomous System
├── Generic Fitness Apps → Personalized AI Coach  
├── Static Meal Plans → Dynamic AI Meal Coaching
├── One-size-fits-all Programs → Adaptive Coaching
└── Human-only Coaching → Human + AI Hybrid
```

### Data Migration Sources

#### Legacy Coaching Apps
- MyFitnessPal coaching suggestions
- Fitbit premium coaching
- Noom behavioral coaching data
- Nike Training Club workout recommendations

#### Human Coaching Records
- Personal trainer session notes
- Nutrition consultant recommendations
- Previous coaching program data
- Goal setting and progress records

#### Behavioral Tracking Data
- Habit tracking apps (Habitica, Streaks)
- Mood and motivation logs
- Food diary notes and observations
- Workout feedback and ratings

## Database Migration Scripts

### Initial Coach Schema Setup
```sql
-- Migration: 001_create_coach_tables.sql
CREATE TABLE coach_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  conversation_title TEXT,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  persona_id VARCHAR(50) DEFAULT 'buddy',
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE coach_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES coach_conversations(id) ON DELETE CASCADE,
  role VARCHAR(10) NOT NULL,
  content TEXT NOT NULL,
  message_index INTEGER NOT NULL,
  timestamp_utc TIMESTAMPTZ DEFAULT NOW(),
  model_used VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(conversation_id, message_index)
);

CREATE INDEX idx_coach_conversations_user ON coach_conversations(user_id);
CREATE INDEX idx_coach_messages_conversation ON coach_messages(conversation_id);
```

### Buddy Autonomous System
```sql
-- Migration: 002_buddy_system.sql
CREATE TABLE buddy_daily_state (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  nutrition_score NUMERIC(5,2),
  training_score NUMERIC(5,2),
  recovery_score NUMERIC(5,2),
  supplements_score NUMERIC(5,2),
  overall_score NUMERIC(5,2),
  trend_direction VARCHAR(20),
  calculated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

CREATE TABLE buddy_decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  decision_type VARCHAR(50) NOT NULL,
  reasoning TEXT,
  action_status VARCHAR(20) DEFAULT 'pending',
  confidence NUMERIC(3,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_buddy_daily_state_user_date ON buddy_daily_state(user_id, date);
CREATE INDEX idx_buddy_decisions_user_type ON buddy_decisions(user_id, decision_type);
```

### Memory and Learning System
```sql
-- Migration: 003_coach_memory_system.sql
CREATE TABLE coach_memory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  memory_type VARCHAR(30),
  category VARCHAR(30),
  content TEXT NOT NULL,
  confidence NUMERIC(3,2),
  access_count INTEGER DEFAULT 0,
  last_accessed TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE knowledge_base (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR(50),
  evidence_level VARCHAR(10),
  source VARCHAR(200),
  embedding_vector VECTOR(1536),
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_coach_memory_user_type ON coach_memory(user_id, memory_type);
CREATE INDEX idx_knowledge_base_category ON knowledge_base(category);
```

### Coach Configuration and Profiles
```sql
-- Migration: 004_coach_profiles.sql
CREATE TABLE coach_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  preferred_persona VARCHAR(30) DEFAULT 'buddy',
  communication_style VARCHAR(30) DEFAULT 'balanced',
  reminder_frequency VARCHAR(20) DEFAULT 'moderate',
  autonomy_level VARCHAR(20) DEFAULT 'collaborative',
  primary_focus VARCHAR(30),
  coaching_objectives TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE TABLE buddy_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  rule_name VARCHAR(100) NOT NULL,
  rule_type VARCHAR(30),
  trigger_event VARCHAR(50),
  conditions JSONB,
  action_definition JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_coach_profiles_user ON coach_profiles(user_id);
CREATE INDEX idx_buddy_rules_user_type ON buddy_rules(user_id, rule_type);
```

## Data Migration Procedures

### Legacy Coaching Data Migration
```sql
-- Migrate legacy personal trainer notes
INSERT INTO coach_memory (
  user_id, memory_type, category, content, confidence, created_at
)
SELECT 
  user_id,
  'preference',
  'training',
  trainer_notes,
  0.8,
  session_date
FROM legacy_trainer_sessions
WHERE trainer_notes IS NOT NULL;

-- Migrate nutrition consultant recommendations  
INSERT INTO coach_memory (
  user_id, memory_type, category, content, confidence, created_at
)
SELECT 
  user_id,
  'recommendation',
  'nutrition', 
  consultant_recommendation,
  0.9,
  consultation_date
FROM legacy_nutrition_consultations;
```

### Behavioral Pattern Migration
```sql
-- Extract patterns from habit tracking data
INSERT INTO coach_memory (
  user_id, memory_type, category, content, confidence
)
SELECT 
  user_id,
  'pattern',
  'behavior',
  'User consistently ' || habit_name || ' on ' || successful_days,
  (success_count::float / total_attempts) as confidence
FROM (
  SELECT 
    user_id,
    habit_name,
    COUNT(*) as total_attempts,
    SUM(CASE WHEN completed THEN 1 ELSE 0 END) as success_count,
    ARRAY_AGG(DISTINCT EXTRACT(dow FROM date)) as successful_days
  FROM legacy_habit_tracking
  GROUP BY user_id, habit_name
  HAVING COUNT(*) >= 10
) patterns;
```

### Goal and Preference Migration
```sql
-- Migrate user goals and preferences
INSERT INTO coach_profiles (
  user_id, primary_focus, coaching_objectives, 
  communication_style, reminder_frequency
)
SELECT 
  user_id,
  CASE 
    WHEN primary_goal LIKE '%weight%' THEN 'nutrition'
    WHEN primary_goal LIKE '%muscle%' THEN 'training'
    WHEN primary_goal LIKE '%wellness%' THEN 'recovery'
    ELSE 'nutrition'
  END as primary_focus,
  ARRAY[primary_goal, secondary_goal],
  CASE 
    WHEN communication_pref = 'direct' THEN 'direct'
    WHEN communication_pref = 'supportive' THEN 'supportive'
    ELSE 'balanced'
  END,
  CASE
    WHEN reminder_level = 'high' THEN 'high'
    WHEN reminder_level = 'low' THEN 'low'
    ELSE 'moderate'
  END
FROM legacy_user_preferences
WHERE primary_goal IS NOT NULL;
```

## API Migration

### Legacy Endpoint Mapping
```
Legacy Coaching APIs → New Coach API
├── /api/v1/suggestions/{type} → /api/coach/coaching/suggestions/{type}
├── /api/v1/chat → /api/coach/chat
├── /api/v1/preferences → /api/coach/profile
├── /api/v1/goals → /api/coach/coaching/goals
└── /api/v1/progress → /api/coach/coaching/weekly-report
```

### Response Format Migration
```json
// Legacy format
{
  "suggestion": "Try eating more protein",
  "confidence": 0.8
}

// New format
{
  "ok": true,
  "data": {
    "response": "Based on your recent training, I recommend increasing your protein intake to 1.8g per kg of body weight.",
    "reasoning": "Your muscle protein synthesis window is optimal post-workout, and higher protein will support recovery.",
    "confidence": 0.85,
    "persona_used": "buddy",
    "related_insights": ["training_recovery", "nutrition_timing"],
    "suggested_actions": [
      {
        "action": "log_protein_rich_meal",
        "timing": "within_30_minutes_post_workout"
      }
    ]
  }
}
```

### Authentication Updates
```typescript
// Legacy authentication
const legacyToken = 'simple-api-key';

// New JWT-based authentication
const jwtToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';

// Header format change
// Old: 'X-API-Key': legacyToken
// New: 'Authorization': `Bearer ${jwtToken}`
```

## Frontend Component Migration

### Legacy Components to New Components
```typescript
// Legacy simple chat component
interface LegacyChatComponent {
  sendMessage: (message: string) => void;
  messages: Message[];
}

// New multi-modal coach interface
interface CoachBuddyComponent {
  sendTextMessage: (message: string) => void;
  sendVoiceMessage: (audioBlob: Blob) => void;
  sendImageMessage: (imageFile: File, caption?: string) => void;
  conversations: Conversation[];
  activeBuddyDecisions: BuddyDecision[];
  crossModuleInsights: Insight[];
  personalizedRecommendations: Recommendation[];
}
```

### State Management Migration
```typescript
// Legacy simple state
interface LegacyCoachState {
  currentMessage: string;
  chatHistory: Message[];
  suggestions: Suggestion[];
}

// New comprehensive coach state
interface CoachState {
  // Conversation management
  activeConversation: Conversation | null;
  conversationHistory: Conversation[];
  streamingResponse: boolean;
  
  // Buddy system
  buddyDecisions: BuddyDecision[];
  dailyState: BuddyDailyState;
  autonomyConfig: AutonomyConfig;
  
  // Memory and learning
  userMemory: MemoryEntry[];
  learnedPreferences: Preference[];
  behaviorPatterns: Pattern[];
  
  // Cross-module integration
  nutritionData: NutritionSummary;
  trainingData: TrainingSummary;
  recoveryData: RecoverySummary;
  
  // Coaching configuration
  coachProfile: CoachProfile;
  activePersona: Persona;
  knowledgeBase: KnowledgeEntry[];
}
```

## Configuration Migration

### Environment Variable Updates
```bash
# Legacy configuration
COACH_API_URL=http://localhost:3006
OPENAI_API_KEY=legacy_openai_key
SIMPLE_COACHING_ENABLED=true

# New configuration
COACH_API_PORT=5500
ANTHROPIC_API_KEY=sk-ant-api03-...
ZAI_API_KEY=2571478a2adb4b8d...
BUDDY_ENABLED=true
BUDDY_AUTONOMY_LEVEL=collaborative
CROSS_MODULE_INSIGHTS=true
MEMORY_SYSTEM_ENABLED=true
KNOWLEDGE_BASE_VECTOR_SIZE=1536
```

### Feature Flag Migration
```typescript
// Legacy feature flags
interface LegacyFeatures {
  basicCoaching: boolean;
  mealSuggestions: boolean;
  workoutTips: boolean;
}

// New comprehensive feature flags
interface CoachingFeatures {
  // Core coaching
  aiCoaching: boolean;
  multiPersonaSupport: boolean;
  conversationMemory: boolean;
  
  // Buddy system
  buddyAutonomy: boolean;
  proactiveDecisions: boolean;
  crossModuleAnalysis: boolean;
  
  // Advanced features
  voiceInterface: boolean;
  imageAnalysis: boolean;
  predictiveAnalytics: boolean;
  ragKnowledgeBase: boolean;
  
  // Integration features
  humanCoachHandoff: boolean;
  deviceIntegrations: boolean;
  socialCoaching: boolean;
}
```

## Testing Migration

### Legacy Test Updates
```typescript
// Legacy simple coaching test
describe('Legacy Coaching API', () => {
  it('should return meal suggestion', async () => {
    const response = await request(app)
      .get('/api/v1/suggestions/meal')
      .expect(200);
    expect(response.body.suggestion).toBeTruthy();
  });
});

// New comprehensive coaching tests
describe('Coach API v2', () => {
  it('should provide contextual meal coaching', async () => {
    const response = await request(app)
      .post('/api/coach/chat')
      .send({
        message: "What should I eat for breakfast?",
        persona: "buddy",
        include_context: true
      })
      .expect(200);
      
    expect(response.body.ok).toBe(true);
    expect(response.body.data.response).toContain('breakfast');
    expect(response.body.data.persona_used).toBe('buddy');
    expect(response.body.data.context_included).toBe(true);
  });

  it('should make autonomous buddy decisions', async () => {
    const response = await request(app)
      .get('/api/coach/buddy/dashboard')
      .expect(200);
      
    expect(response.body.data.daily_state).toBeTruthy();
    expect(response.body.data.decisions).toBeInstanceOf(Array);
  });
});
```

### Memory System Testing
```typescript
describe('Coach Memory System', () => {
  it('should learn and recall user preferences', async () => {
    // Store preference
    await request(app)
      .post('/api/coach/memory')
      .send({
        memory_type: 'preference',
        category: 'nutrition',
        content: 'User prefers high-protein breakfasts',
        confidence: 0.9
      });

    // Verify recall in conversation
    const chatResponse = await request(app)
      .post('/api/coach/chat')
      .send({
        message: "What's good for breakfast?",
        include_context: true
      });

    expect(chatResponse.body.data.response)
      .toMatch(/protein|high-protein/i);
  });
});
```

## Known Issues and Solutions

### Migration Challenges

#### Legacy Data Quality
**Problem**: Inconsistent data formats from multiple legacy sources
**Solution**: Data cleaning and normalization pipeline
```sql
-- Clean legacy coaching notes
UPDATE coach_memory 
SET content = TRIM(REGEXP_REPLACE(content, '\s+', ' ', 'g'))
WHERE memory_type = 'preference' 
AND content ~ '\s{2,}';

-- Normalize confidence scores
UPDATE coach_memory 
SET confidence = LEAST(confidence, 1.0)
WHERE confidence > 1.0;
```

#### Context Building Performance
**Problem**: Slow response times when building conversation context
**Solution**: Optimized context building with caching
```typescript
// Implement context caching
const contextCache = new LRUCache<string, ConversationContext>({
  max: 1000,
  ttl: 1000 * 60 * 15 // 15 minutes
});

async function buildContext(userId: string, useCache = true): Promise<ConversationContext> {
  const cacheKey = `context:${userId}`;
  
  if (useCache && contextCache.has(cacheKey)) {
    return contextCache.get(cacheKey)!;
  }
  
  const context = await buildContextFromDatabase(userId);
  contextCache.set(cacheKey, context);
  return context;
}
```

#### Memory Explosion
**Problem**: Unlimited memory growth causing storage and performance issues
**Solution**: Memory lifecycle management
```sql
-- Implement memory decay and cleanup
UPDATE coach_memory 
SET confidence = confidence * 0.95
WHERE last_accessed < NOW() - INTERVAL '30 days';

DELETE FROM coach_memory 
WHERE confidence < 0.1 
AND created_at < NOW() - INTERVAL '1 year';
```

#### AI Model Consistency
**Problem**: Different responses for similar inputs across model versions
**Solution**: Model versioning and response consistency tracking
```typescript
interface ModelConfig {
  primary_model: string;
  fallback_model: string;
  temperature: number;
  max_tokens: number;
  consistency_seed?: string; // For reproducible responses
}

// Track response consistency
async function trackResponseConsistency(
  input: string, 
  response: string, 
  model: string
): Promise<void> {
  await sql`
    INSERT INTO response_consistency_log 
    (input_hash, response, model_used, created_at)
    VALUES (md5(${input}), ${response}, ${model}, NOW())
  `;
}
```

## Performance Optimizations

### Database Optimization
```sql
-- Optimize frequent queries
CREATE INDEX CONCURRENTLY idx_coach_memory_user_category_confidence 
ON coach_memory(user_id, category, confidence DESC);

CREATE INDEX CONCURRENTLY idx_buddy_decisions_user_status_priority
ON buddy_decisions(user_id, action_status, priority);

-- Partition large tables
CREATE TABLE coach_messages_2026 PARTITION OF coach_messages
FOR VALUES FROM ('2026-01-01') TO ('2027-01-01');
```

### Caching Strategy
```typescript
// Multi-level caching
const memoryCache = new NodeCache({ stdTTL: 600 }); // 10 minutes
const redisCache = new Redis(process.env.REDIS_URL);

async function getCachedMemory(userId: string): Promise<MemoryEntry[]> {
  // L1: In-memory cache
  let memories = memoryCache.get<MemoryEntry[]>(`memories:${userId}`);
  if (memories) return memories;
  
  // L2: Redis cache
  const cached = await redisCache.get(`memories:${userId}`);
  if (cached) {
    memories = JSON.parse(cached);
    memoryCache.set(`memories:${userId}`, memories);
    return memories;
  }
  
  // L3: Database
  memories = await getMemoriesFromDatabase(userId);
  await redisCache.setex(`memories:${userId}`, 3600, JSON.stringify(memories));
  memoryCache.set(`memories:${userId}`, memories);
  return memories;
}
```

## Rollback Procedures

### Database Rollback
```sql
-- Rollback to legacy coaching tables
DROP TABLE IF EXISTS buddy_decisions CASCADE;
DROP TABLE IF EXISTS buddy_daily_state CASCADE;
DROP TABLE IF EXISTS coach_memory CASCADE;
DROP TABLE IF EXISTS knowledge_base CASCADE;

-- Restore simplified coaching structure
CREATE TABLE simple_coaching_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  suggestion_type VARCHAR(50),
  suggestion_text TEXT,
  user_reaction VARCHAR(20),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### API Rollback
```typescript
// Feature flag for rollback
if (config.USE_LEGACY_COACHING) {
  app.use('/api/coach', legacyCoachingRouter);
} else {
  app.use('/api/coach', newCoachingRouter);
}
```

## Post-Migration Validation

### Functionality Testing
```sql
-- Validate coach system functionality
SELECT 
  COUNT(*) as total_users_migrated,
  COUNT(DISTINCT cp.user_id) as users_with_profiles,
  COUNT(DISTINCT cm.user_id) as users_with_memory,
  COUNT(DISTINCT cc.user_id) as users_with_conversations
FROM users u
LEFT JOIN coach_profiles cp ON u.id = cp.user_id
LEFT JOIN coach_memory cm ON u.id = cm.user_id  
LEFT JOIN coach_conversations cc ON u.id = cc.user_id;
```

### Performance Monitoring
```typescript
// Monitor response times
const responseTimeHistogram = new prometheus.Histogram({
  name: 'coach_response_time_seconds',
  help: 'Coach API response time',
  labelNames: ['endpoint', 'persona', 'user_type'],
  buckets: [0.1, 0.5, 1, 2, 5, 10]
});

app.use('/api/coach/*', (req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    responseTimeHistogram
      .labels(req.path, req.body?.persona || 'none', 'regular')
      .observe(duration);
  });
  next();
});
```

### User Satisfaction Tracking
```sql
-- Monitor coaching effectiveness
CREATE VIEW coaching_effectiveness_summary AS
SELECT 
  DATE_TRUNC('week', created_at) as week,
  AVG(user_satisfaction_rating) as avg_satisfaction,
  COUNT(*) as total_conversations,
  COUNT(*) FILTER (WHERE user_satisfaction_rating >= 4) as positive_ratings,
  COUNT(*) FILTER (WHERE user_satisfaction_rating <= 2) as negative_ratings
FROM coach_conversations
WHERE created_at >= NOW() - INTERVAL '3 months'
GROUP BY DATE_TRUNC('week', created_at)
ORDER BY week DESC;
```