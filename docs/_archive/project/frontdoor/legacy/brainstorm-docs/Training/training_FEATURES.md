# Training Module Features

## 💪 Core Training Features

### Exercise Database
- **Comprehensive Library**: 1,448+ exercises with detailed metadata
- **Rich Media**: 4,633+ videos and images for proper form
- **Smart Filtering**: By muscle group, equipment, difficulty, category
- **Exercise Types**: Strength, cardio, flexibility, plyometric, rehabilitation
- **File:** `src/api/training/routes/exercises.ts`

### Live Workout Tracking
- **Real-time Logging**: Track sets, reps, weight, RPE during workout
- **Rest Timer**: Customizable rest periods with alerts
- **Volume Calculations**: Automatic volume load computation
- **Workout Notes**: Session notes and mood tracking
- **Files:** `apps/app/modules/training/components/LiveWorkout.tsx`

### Progressive Overload Engine
- **Multiple Models**: Linear, Double Progression, Wave, RPE-based, Daily Undulating
- **Automatic Suggestions**: AI-powered progression recommendations  
- **Plateau Detection**: Identify stagnation and recommend deloads
- **Customizable Parameters**: User-specific progression rates
- **Files:** `src/api/training/routes/progression.ts`, `apps/app/modules/training/components/ProgressiveOverloadEngine.tsx`

### Routine Management
- **Template System**: Pre-built and custom training routines
- **Drag-and-Drop Builder**: Visual routine construction
- **Program Periodization**: Planned training phases
- **Routine Sharing**: Community routines and templates
- **Files:** `src/api/training/routes/routines.ts`, `apps/app/modules/training/components/RoutineBuilder.tsx`

## 📊 Advanced Analytics

### Training Volume Tracking
- **Weekly Volume**: Total volume load per muscle group
- **Volume Distribution**: Muscle group volume pie charts
- **Volume Trends**: 8-week volume progression analysis
- **Deload Recommendations**: Volume reduction protocols
- **File:** `src/api/training/routes/insights.ts`

### Strength Progression Analysis
- **1RM Tracking**: Estimated and actual one-rep maxes
- **Strength Standards**: Compare to population benchmarks
- **Progression Rate**: Strength gain velocity tracking
- **Plateau Identification**: Stagnation detection algorithms
- **Files:** `apps/app/modules/training/components/StrengthProgressChart.tsx`

### Performance Insights
- **Training Frequency**: Sessions per week analysis
- **Workout Duration**: Average session length tracking
- **Intensity Monitoring**: RPE and %1RM distribution
- **Recovery Indicators**: Volume-fatigue relationship
- **File:** `apps/app/modules/training/components/VolumeTracker.tsx`

## 🎯 Progressive Overload Models

### Linear Progression
```typescript
interface LinearProgression {
  model: 'linear';
  progressionRate: number; // e.g., 0.025 = 2.5%
  frequency: 'session' | 'week'; 
  weightIncrement: number; // kg increase
}
```
**Use Case:** Beginner strength training with consistent progression

### Double Progression  
```typescript
interface DoubleProgression {
  model: 'double';
  repRange: [number, number]; // e.g., [8, 12]
  weightIncrement: number;
  setsTarget: number;
}
```
**Use Case:** Hypertrophy training with rep progression then weight

### Wave Loading
```typescript
interface WaveProgression {
  model: 'wave';
  waveLength: number; // weeks per wave (typically 3-4)
  intensityWave: number[]; // [75, 85, 95, 65] % intensities
  currentWeek: number;
}
```
**Use Case:** Periodized strength training with planned variations

### RPE-Based Autoregulation
```typescript
interface RPEProgression {
  model: 'rpe';
  targetRPE: number; // e.g., 8 = 2 reps in reserve
  rpeRange: [number, number]; // [7, 9] acceptable range
  adjustmentFactor: number; // weight change per RPE unit
}
```
**Use Case:** Advanced training with day-to-day autoregulation

### Daily Undulating Periodization
```typescript
interface DUPProgression {
  model: 'daily_undulating';
  schedule: {
    monday: { reps: number; intensity: number; };
    wednesday: { reps: number; intensity: number; };
    friday: { reps: number; intensity: number; };
  };
  weeklyProgression: number;
}
```
**Use Case:** Varied daily training stimuli

## 🛠️ Training Tools

### Plate Calculator
- **Weight Combinations**: Calculate barbell plate loading
- **Multiple Standards**: Support for kg/lbs and different plate sets
- **Visual Loading**: Show plate arrangement on bar
- **Quick Adjustments**: Nearest achievable weight suggestions
- **File:** `apps/app/modules/training/components/PlateCalculator.tsx`

### Rest Timer
- **Customizable Duration**: Set-specific rest periods
- **Background Tracking**: Continue timer when switching apps
- **Smart Suggestions**: Exercise-type based rest recommendations
- **Audio/Haptic Alerts**: Configurable notification types
- **File:** `apps/app/modules/training/components/RestTimer.tsx`

### 1RM Calculator
- **Multiple Formulas**: Brzycki, Epley, McGlothin, Lombardi
- **Rep Max Conversions**: Convert between different rep ranges
- **Percentage Calculator**: Training percentages from 1RM
- **Historical Tracking**: 1RM progression over time

### Deload Recommender
- **Fatigue Detection**: Identify overreaching signals
- **Deload Protocols**: Volume, intensity, and frequency reductions
- **Recovery Timeline**: Estimated recovery duration
- **Progressive Return**: Gradual return to previous loads
- **File:** `apps/app/modules/training/components/DeloadRecommender.tsx`

## 📋 Workout Session Features

### Session Management
```typescript
interface WorkoutSession {
  id: string;
  userId: string;
  routineId?: string;
  startedAt: Date;
  completedAt?: Date;
  durationMinutes?: number;
  totalVolumeKg: number;
  totalSets: number;
  totalReps: number;
  exercises: WorkoutExercise[];
  notes?: string;
  moodBefore?: string;
  moodAfter?: string;
  perceivedExertion: number; // 1-10 session RPE
}
```

### Set Tracking
```typescript
interface WorkoutSet {
  setNumber: number;
  reps: number;
  weightKg: number;
  rpe?: number; // Rate of Perceived Exertion
  restSeconds?: number;
  setType: 'working' | 'warmup' | 'dropset' | 'failure';
  tempo?: string; // "2-1-2-1" format
  notes?: string;
}
```

### Real-time Calculations
- **Volume Load**: `sets × reps × weight` per exercise
- **Training Density**: `total_volume / session_duration`
- **Intensity**: `average_weight / estimated_1rm`
- **Frequency**: `sessions_per_week` by muscle group

## 🧠 AI Integration

### Workout Recommendations
- **Exercise Selection**: Based on goals, equipment, time
- **Volume Prescription**: Optimal sets/reps for user level
- **Intensity Guidance**: %1RM or RPE recommendations
- **Progression Planning**: Multi-week training progression

### Form Analysis (Future)
- **Video Analysis**: AI form checking from camera
- **Rep Counting**: Automatic rep detection
- **Range of Motion**: Depth/ROM quality assessment
- **Injury Prevention**: Movement quality alerts

### Recovery Integration
- **Training Load**: Communicate with Recovery module
- **Readiness Scores**: Adjust intensity based on recovery
- **Sleep Quality**: Factor sleep into workout recommendations
- **HRV Integration**: Heart rate variability considerations

## 📊 Data Analytics

### Performance Metrics
```typescript
interface TrainingMetrics {
  weeklyVolume: number;
  volumeByMuscle: Record<string, number>;
  averageIntensity: number;
  trainingFrequency: number;
  sessionDuration: number;
  strengthProgression: Record<string, number>; // exercise -> % improvement
  adherenceRate: number; // planned vs actual workouts
}
```

### Trend Analysis
- **Volume Trends**: 8-week rolling volume analysis
- **Strength Trends**: Long-term 1RM progression
- **Frequency Patterns**: Training consistency analysis
- **Intensity Distribution**: RPE and %1RM patterns

### Comparative Analytics
- **Muscle Group Balance**: Identify imbalances
- **Strength Standards**: Compare to population norms
- **Personal Bests**: Track all-time achievements
- **Goal Progress**: Measure goal achievement rates

## 🔄 Integration Architecture

### Goals Module Integration
- **Receives:** Training goals (strength, hypertrophy, endurance)
- **Provides:** Workout compliance and progression data
- **Adjusts:** Programming based on goal changes

### Recovery Module Integration  
- **Receives:** Recovery readiness scores
- **Provides:** Training load and fatigue indicators
- **Adjusts:** Workout intensity based on recovery status

### Nutrition Module Integration
- **Coordinates:** Pre/post-workout nutrition timing
- **Provides:** Training days for macro cycling
- **Receives:** Energy availability for workout intensity

### Coach Module Integration
- **Provides:** Complete training data for AI analysis
- **Receives:** Workout recommendations and modifications
- **Reports:** Training issues, plateaus, and concerns

## 🔒 Data Management

### Workout Persistence
- **Real-time Backup**: Save workout data during session
- **Offline Capability**: Function without internet connection
- **Sync on Connect**: Upload when connectivity returns
- **Data Validation**: Ensure data integrity and completeness

### Personal Records
- **Automatic Detection**: Identify PRs during workouts
- **Historical Archive**: Maintain complete PR history
- **Achievement Notifications**: Celebrate new records
- **Video Capture**: Record PR attempts for review

### Export Capabilities
- **CSV Export**: Raw workout data for external analysis
- **PDF Reports**: Formatted training summaries
- **API Access**: Third-party integration capabilities
- **Backup Downloads**: Complete data portability

## 📱 Mobile Optimizations

### Offline Functionality
- **Cached Exercises**: Exercise database for offline use
- **Local Storage**: Workout data stored locally first
- **Background Sync**: Automatic sync when online
- **Conflict Resolution**: Handle sync conflicts gracefully

### Performance Features
- **Fast Loading**: Optimized component loading
- **Battery Efficiency**: Minimal background processing
- **Memory Management**: Efficient data structure usage
- **Network Optimization**: Minimal data transfer

### Hardware Integration
- **Camera**: Exercise form recording
- **Accelerometer**: Rep counting detection
- **Heart Rate**: Workout intensity monitoring
- **Haptic Feedback**: Rest timer and PR celebrations