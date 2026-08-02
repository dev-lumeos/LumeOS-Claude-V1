# Recovery Frontend Components

## Pages

### Main Recovery Page
**File:** `apps/app/app/(app)/recovery/page.tsx`
- Central recovery dashboard
- Daily recovery score display
- Quick check-in interface
- Recovery trends overview

## Core Components

### MorningCheckin
**File:** `apps/app/modules/recovery/components/MorningCheckin.tsx`
- Daily recovery assessment form
- Sleep quality and duration input
- Subjective feeling rating (1-10)
- Mood selection (motivated, good, neutral, tired, sick)
- Muscle soreness mapping
- Auto-calculation of recovery score

### RecoveryTodayView
**File:** `apps/app/modules/recovery/components/RecoveryTodayView.tsx`
- Current day recovery status
- Recovery score with color coding
- Training readiness indicator
- Quick access to modify today's check-in
- Recovery recommendations

### RecoveryTrends
**File:** `apps/app/modules/recovery/components/RecoveryTrends.tsx`
- 7-day, 30-day recovery score charts
- Sleep pattern analysis
- Trend direction indicators (improving/declining/stable)
- Correlation with training load
- Pattern recognition insights

### MuscleRecoveryMap
**File:** `apps/app/modules/recovery/components/MuscleRecoveryMap.tsx`
- Interactive body diagram for soreness tracking
- Visual muscle group selection
- Soreness level indicator (0-3 scale)
- Heat map visualization of muscle fatigue
- Trend tracking for specific muscle groups

### SleepAnalyticsCard
**File:** `apps/app/modules/recovery/components/SleepAnalyticsCard.tsx`
- Sleep duration and quality metrics
- Sleep debt calculation
- Sleep consistency scoring
- Optimal sleep recommendations
- Integration with wearable devices

### OvertrainingAlert
**File:** `apps/app/modules/recovery/components/OvertrainingAlert.tsx`
- Overreaching detection algorithm
- Warning alerts for declining recovery
- Recommended intervention strategies
- Training load adjustment suggestions
- Recovery protocol recommendations

### RecoveryPromptCard
**File:** `apps/app/modules/recovery/components/RecoveryPromptCard.tsx`
- Smart reminders for check-ins
- Context-aware prompts based on training
- Motivational messaging for recovery habits
- One-tap quick check-in options

### DiaryTabView
**File:** `apps/app/modules/recovery/components/DiaryTabView.tsx`
- Historical recovery data browser
- Calendar view of recovery scores
- Detailed day-by-day breakdown
- Notes and observations tracking
- Export functionality for data

## Advanced Components

### RecoveryModalityTracker
**File:** `apps/app/modules/recovery/components/RecoveryModalityTracker.tsx`
- Log recovery activities (sauna, cold plunge, massage)
- Duration and intensity tracking
- Effectiveness rating for different modalities
- Personal modality library
- Cost tracking for professional services

### HRVDashboard
**File:** `apps/app/modules/recovery/components/HRVDashboard.tsx`
- Heart Rate Variability visualization
- HRV4Training integration
- RMSSD and heart rate trends
- Autonomic nervous system balance
- Training readiness based on HRV

### SleepStageAnalysis
**File:** `apps/app/modules/recovery/components/SleepStageAnalysis.tsx`
- Deep sleep, REM, light sleep breakdown
- Sleep efficiency calculations
- Wake frequency tracking
- Sleep quality optimization tips
- Device integration (Oura, Whoop, Apple Health)

### RecoveryGoalTracker
**File:** `apps/app/modules/recovery/components/RecoveryGoalTracker.tsx`
- Recovery-specific goals (sleep hours, consistency)
- Progress tracking toward recovery targets
- Streak counting for consistent habits
- Achievement badges and milestones
- Goal adjustment recommendations

### StressLevelIndicator
**File:** `apps/app/modules/recovery/components/StressLevelIndicator.tsx`
- Perceived stress level tracking (1-10)
- Stress source categorization
- Correlation with recovery scores
- Stress management technique suggestions
- Trend analysis for stress patterns

### RecoveryNutritionLink
**File:** `apps/app/modules/recovery/components/RecoveryNutritionLink.tsx`
- Recovery-supporting nutrition tracking
- Hydration status monitoring
- Anti-inflammatory food recommendations
- Supplement timing for sleep and recovery
- Integration with Nutrition module

## Component Structure

```
apps/app/modules/recovery/
├── components/
│   ├── MorningCheckin.tsx           # Daily assessment form
│   ├── RecoveryTodayView.tsx        # Current status dashboard
│   ├── RecoveryTrends.tsx           # Historical trend analysis
│   ├── MuscleRecoveryMap.tsx        # Soreness body mapping
│   ├── SleepAnalyticsCard.tsx       # Sleep metrics display
│   ├── OvertrainingAlert.tsx        # Overreaching detection
│   ├── RecoveryPromptCard.tsx       # Smart reminders
│   ├── DiaryTabView.tsx             # Historical data browser
│   ├── RecoveryModalityTracker.tsx  # Activity logging
│   ├── HRVDashboard.tsx             # HRV visualization
│   ├── SleepStageAnalysis.tsx       # Sleep stage breakdown
│   ├── RecoveryGoalTracker.tsx      # Goal progress tracking
│   ├── StressLevelIndicator.tsx     # Stress monitoring
│   └── RecoveryNutritionLink.tsx    # Nutrition integration
├── hooks/
│   ├── useRecoveryCheckin.ts        # Check-in CRUD operations
│   ├── useRecoveryScore.ts          # Score calculation logic
│   ├── useSleepTracking.ts          # Sleep data management
│   ├── useModalityTracking.ts       # Recovery activity tracking
│   └── useHRVData.ts               # HRV data integration
└── types/
    ├── recovery.ts                  # Recovery data types
    ├── sleep.ts                     # Sleep tracking types
    ├── hrv.ts                      # HRV measurement types
    └── modalities.ts               # Recovery activity types
```

## Key Features

### Daily Recovery Assessment
1. **Morning Check-in** → Complete recovery evaluation
2. **Sleep Tracking** → Duration, quality, consistency
3. **Soreness Mapping** → Muscle-specific fatigue levels
4. **Mood Assessment** → Psychological readiness
5. **Score Calculation** → Weighted algorithm for overall score

### Recovery Modality Tracking
- **Active Recovery**: Light exercise, stretching, yoga
- **Passive Recovery**: Sleep, rest, meditation
- **Therapeutic**: Massage, physiotherapy, chiropractic
- **Environmental**: Sauna, cold plunge, cryotherapy
- **Nutritional**: Hydration, anti-inflammatory foods, supplements

### Smart Recommendations
- **Training Adjustments**: Intensity modifications based on score
- **Sleep Optimization**: Bedtime recommendations, sleep hygiene
- **Stress Management**: Relaxation techniques, workload adjustments
- **Recovery Protocols**: Personalized modality suggestions
- **Nutrition Support**: Recovery-enhancing meal recommendations

### Data Integration
- **Wearable Devices**: Oura, Whoop, Apple Health, Garmin
- **HRV Monitors**: HRV4Training, Elite HRV, Kubios
- **Sleep Trackers**: Eight Sleep, ResMed, Withings
- **Smart Scales**: Bioimpedance, hydration status
- **Environmental**: Sleep environment monitoring

## Technology Integration

### State Management
- **Zustand**: Local recovery state
- **React Query**: Server state synchronization
- **IndexedDB**: Offline recovery data storage

### Data Visualization
- **Chart.js**: Recovery trend charts
- **D3.js**: Body mapping visualizations
- **Canvas API**: Custom recovery score gauges
- **SVG**: Interactive muscle group diagrams

### Device Integration
- **Web Bluetooth**: Direct device connectivity
- **HealthKit**: iOS health data integration
- **Google Fit**: Android health data sync
- **Webhooks**: Third-party service integration

### Performance Optimization
- **Lazy Loading**: Component loading on demand
- **Data Caching**: Efficient recovery data storage
- **Background Sync**: Automatic data synchronization
- **Offline Support**: Function without internet connection

## User Experience Features

### Personalization
- **Custom Soreness Map**: User-specific muscle groups
- **Personal Baselines**: Individual recovery norms
- **Adaptive Algorithms**: Learning from user patterns
- **Preference Learning**: Modality effectiveness tracking

### Gamification
- **Recovery Streaks**: Consecutive days of good recovery
- **Badges**: Achievements for recovery consistency
- **Challenges**: 30-day sleep optimization challenges
- **Social**: Share recovery achievements (optional)

### Accessibility
- **Voice Input**: Hands-free check-in completion
- **Color Blind Support**: Alternative visual indicators
- **Large Text**: Accessibility-compliant sizing
- **Screen Reader**: Full ARIA label support

## Integration Points

### With Training Module
- Receives training load and fatigue indicators
- Provides readiness scores for workout planning
- Adjusts recovery recommendations based on training phase

### With Nutrition Module
- Coordinates recovery nutrition recommendations
- Tracks hydration and anti-inflammatory foods
- Links poor recovery to nutritional deficiencies

### With Goals Module
- Reports recovery goal progress
- Adjusts recommendations based on performance goals
- Tracks recovery consistency as goal metric

### With Coach Module
- Provides recovery data for AI analysis
- Receives personalized recovery recommendations
- Reports recovery-related issues and concerns