# Recovery Module Features

## 😴 Core Recovery Features

### Daily Recovery Assessment
- **Morning Check-in System**: Comprehensive daily recovery evaluation
- **Sleep Tracking**: Duration, quality, bedtime/wake time logging
- **Subjective Feeling Scale**: 1-10 overall recovery assessment
- **Mood Tracking**: Motivated, good, neutral, tired, sick categories
- **Energy Level Monitoring**: 1-10 perceived energy scale
- **File:** `src/api/recovery/routes/checkin.ts`

### Muscle Soreness Mapping
- **Interactive Body Map**: Visual muscle group selection
- **Soreness Scale**: 0-3 intensity levels per muscle group
- **Hotspot Detection**: Identify frequently sore muscle groups
- **Recovery Patterns**: Track soreness trends over time
- **File:** `apps/app/modules/recovery/components/MuscleRecoveryMap.tsx`

### Recovery Score Calculation
- **Weighted Algorithm**: Multi-factor scoring system (0-100)
- **Component Breakdown**: Individual scores for each factor
- **Training Readiness**: AI-powered intensity recommendations
- **Trend Analysis**: 7-day, 30-day recovery patterns
- **File:** `src/api/recovery/utils/computeScore.ts`

## 📊 Advanced Analytics

### Recovery Score Formula
```typescript
interface RecoveryScoreComponents {
  sleep_quality_score: number;    // 30% weight - (sleep_quality/10) × 30
  sleep_hours_score: number;      // 15% weight - min(hours, 8)/8 × 15
  subjective_feeling_score: number; // 15% weight - (feeling/10) × 15
  soreness_score: number;         // 10% weight - (1 - avg_soreness/3) × 10
  training_load_score: number;    // 15% weight - based on recent training
  nutrition_score: number;        // 10% weight - nutrition compliance
  mood_score: number;            // 5% weight - mood multiplier
  modality_bonus: number;        // 0-5 bonus points for recovery activities
}
```

### HRV Integration
- **Heart Rate Variability Tracking**: RMSSD, pNN50 measurements
- **Device Integration**: HRV4Training, Elite HRV, Oura, Whoop
- **Autonomic Balance**: Sympathetic/parasympathetic analysis
- **Training Readiness**: HRV-based workout recommendations
- **File:** `src/api/recovery/routes/hrv.ts`

### Sleep Stage Analysis
- **Deep Sleep Tracking**: Recovery-critical sleep phase monitoring
- **REM Sleep Analysis**: Mental recovery and learning consolidation
- **Sleep Efficiency**: Time asleep vs. time in bed calculations
- **Wake Frequency**: Sleep fragmentation tracking
- **Integration**: Oura, Whoop, Apple Health, Eight Sleep

## 🛀 Recovery Modality Tracking

### Supported Modalities
- **Sauna**: Temperature, duration, immediate/next-day effects
- **Cold Plunge**: Temperature, duration, protocol tracking
- **Massage**: Type (deep tissue, sports, Swedish), duration, cost
- **Stretching**: Duration, focus areas, effectiveness rating
- **Meditation**: Duration, type, stress reduction impact
- **Active Recovery**: Light cardio, yoga, mobility work
- **File:** `src/api/recovery/routes/modalities.ts`

### Effectiveness Tracking
- **Immediate Effects**: 1-10 rating post-modality
- **Next-Day Impact**: Recovery score improvement measurement
- **Cost-Benefit Analysis**: ROI calculations for paid treatments
- **Personal Optimization**: AI recommendations based on user response
- **Pattern Recognition**: Identify most effective modalities per user

## ⚠️ Overtraining Detection

### Automated Alert System
- **Declining Recovery Scores**: 3+ days below personal threshold
- **HRV Decline**: Significant drops from personal baseline
- **Poor Sleep Patterns**: Consistent sleep quality degradation
- **Excessive Soreness**: Persistent muscle fatigue indicators
- **File:** `apps/app/modules/recovery/components/OvertrainingAlert.tsx`

### Intervention Recommendations
```typescript
interface OvertrainingAlert {
  severity: 'low' | 'moderate' | 'high' | 'critical';
  triggers: string[];
  recommendations: {
    rest_days: number;
    training_modifications: string[];
    recovery_protocols: string[];
    nutrition_adjustments: string[];
  };
}
```

### Recovery Protocols
- **Structured Deload Weeks**: Planned volume/intensity reduction
- **Active Recovery Protocols**: Light movement prescriptions
- **Sleep Optimization Plans**: Hygiene and timing improvements
- **Stress Management**: Meditation, breathing exercises
- **Nutritional Support**: Anti-inflammatory foods, hydration

## 📈 Trend Analysis & Insights

### Recovery Pattern Recognition
- **Optimal Sleep Duration**: Personal sweet spot identification
- **Best Recovery Days**: Weekly pattern analysis
- **Training Impact**: Volume/intensity correlation with recovery
- **Lifestyle Factors**: Stress, alcohol, screen time effects
- **Seasonal Variations**: Recovery changes throughout year

### Predictive Analytics
- **Recovery Forecasting**: Predict tomorrow's readiness
- **Training Load Recommendations**: Optimal volume suggestions
- **Plateau Prevention**: Early intervention strategies
- **Periodization Support**: Recovery-informed training phases
- **Goal Achievement**: Recovery's impact on performance goals

## 🎯 Training Readiness System

### Readiness Categories
```typescript
type ReadinessLevel = 
  | 'excellent'   // 90-100: High intensity training recommended
  | 'good'        // 80-89:  Moderate to high intensity okay
  | 'moderate'    // 70-79:  Moderate intensity recommended
  | 'poor'        // 60-69:  Light training or skills work
  | 'rest'        // <60:    Rest day strongly recommended
```

### Intensity Recommendations
- **High Intensity Days**: PRs, max effort, competition prep
- **Moderate Intensity**: Standard training loads
- **Active Recovery**: Light movement, skill work, mobility
- **Complete Rest**: Sleep, nutrition focus, stress reduction
- **Deload Protocols**: Structured recovery week programming

### Integration with Training Module
- **Automatic Adjustments**: Workout intensity modifications
- **Coach Notifications**: Alert trainers to readiness changes
- **Programming Adaptations**: Periodization based on recovery
- **Load Management**: Prevent overreaching through monitoring

## 💤 Sleep Optimization

### Sleep Quality Assessment
- **Subjective Rating**: 1-10 sleep quality scale
- **Sleep Latency**: Time to fall asleep tracking
- **Wake Frequency**: Number of nighttime awakenings
- **Morning Grogginess**: Post-sleep fatigue assessment
- **Sleep Consistency**: Bedtime/wake time variability

### Environmental Monitoring
- **Room Temperature**: Optimal sleep environment tracking
- **Humidity Levels**: Sleep quality environmental factors
- **Noise Levels**: Impact on sleep fragmentation
- **Light Exposure**: Blue light and sleep onset correlation
- **Device Integration**: Smart thermostats, sleep sensors

### Sleep Hygiene Recommendations
- **Bedtime Optimization**: Personalized sleep schedule
- **Pre-Sleep Routines**: Evidence-based wind-down protocols
- **Screen Time Limits**: Blue light exposure recommendations
- **Caffeine Timing**: Last caffeine consumption guidelines
- **Alcohol Impact**: Sleep quality degradation tracking

## 🧘 Stress Management Integration

### Stress Level Tracking
- **Perceived Stress Scale**: 1-10 daily stress assessment
- **Stress Sources**: Work, personal, training categorization
- **Stress Duration**: Acute vs. chronic stress identification
- **Recovery Impact**: Stress correlation with recovery scores
- **Intervention Triggers**: Automated stress management prompts

### Stress Reduction Protocols
- **Breathing Exercises**: Guided HRV-biofeedback sessions
- **Meditation Programs**: Mindfulness and recovery integration
- **Progressive Relaxation**: Systematic muscle tension release
- **Cognitive Strategies**: Stress reframing techniques
- **Lifestyle Modifications**: Work-life balance optimization

## 📱 Device Integration

### Wearable Device Support
- **Oura Ring**: Sleep, HRV, activity, temperature
- **Whoop Strap**: Strain, recovery, sleep coaching
- **Apple Watch**: Heart rate, sleep, activity data
- **Garmin Devices**: Body Battery, stress, sleep metrics
- **Fitbit**: Sleep stages, heart rate variability

### Health Platform Integration
- **Apple HealthKit**: iOS health data ecosystem
- **Google Fit**: Android health data synchronization
- **Strava**: Training load and recovery integration
- **MyFitnessPal**: Nutrition impact on recovery
- **HRV4Training**: Specialized HRV monitoring

### Data Synchronization
- **Real-time Sync**: Automatic device data import
- **Conflict Resolution**: Multiple device data reconciliation
- **Data Validation**: Outlier detection and correction
- **Privacy Controls**: User consent and data ownership
- **Offline Support**: Local data storage and sync

## 🎮 Gamification Features

### Recovery Streaks
- **Consistency Tracking**: Consecutive days of good recovery
- **Milestone Rewards**: Achievements for recovery habits
- **Challenge Participation**: 30-day sleep optimization
- **Social Sharing**: Recovery achievements with friends
- **Competitive Elements**: Recovery leaderboards (optional)

### Achievement System
- **Sleep Master**: Consistent 7+ hours for 30 days
- **Early Bird**: Consistent early bedtime for 2 weeks
- **Recovery Guru**: 90+ recovery score for 7 days
- **Stress Buster**: Successful stress management streak
- **Modality Explorer**: Try 5 different recovery modalities

## 🔄 Integration Architecture

### Cross-Module Data Flow
```typescript
interface RecoveryIntegration {
  // From Training Module
  training_load: number;
  fatigue_accumulation: number;
  workout_intensity: number;
  
  // From Nutrition Module
  nutrition_score: number;
  hydration_status: number;
  sleep_nutrition: number;
  
  // To Goals Module
  recovery_goal_progress: number;
  sleep_consistency: number;
  modality_adherence: number;
  
  // To Coach Module
  recovery_insights: string[];
  intervention_needs: string[];
  pattern_analysis: object;
}
```

### AI Coach Integration
- **Recovery Data Analysis**: Comprehensive pattern recognition
- **Personalized Recommendations**: AI-generated recovery advice
- **Intervention Timing**: Optimal moments for recovery prompts
- **Long-term Optimization**: Recovery habit formation coaching
- **Goal Alignment**: Recovery strategies for performance goals

### Human Coach Integration
- **Professional Oversight**: Coach access to recovery trends
- **Alert Notifications**: Critical recovery status alerts
- **Protocol Customization**: Coach-designed recovery programs
- **Progress Reporting**: Regular recovery assessment summaries
- **Intervention Coordination**: Collaborative recovery planning

## 📊 Reporting and Analytics

### Personal Dashboards
- **Recovery Overview**: Current status and trends
- **Sleep Analytics**: Detailed sleep pattern analysis
- **Modality Effectiveness**: Personal treatment optimization
- **Stress Patterns**: Life stress and recovery correlation
- **Goal Progress**: Recovery-related goal achievements

### Coach/Clinician Reports
- **Client Recovery Summary**: Professional oversight data
- **Intervention Recommendations**: Evidence-based suggestions
- **Risk Assessments**: Overtraining and injury risk factors
- **Progress Tracking**: Long-term recovery improvements
- **Treatment Effectiveness**: Recovery modality outcomes

### Export Capabilities
- **CSV Data Export**: Raw data for external analysis
- **PDF Reports**: Formatted recovery summaries
- **API Access**: Third-party integration capabilities
- **Research Participation**: Anonymized data contribution
- **Healthcare Provider Sharing**: Medical professional access