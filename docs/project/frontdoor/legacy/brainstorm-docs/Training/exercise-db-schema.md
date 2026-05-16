# Lumeos Exercise Database — Schema & Data Reference

## Exercise Schema

```typescript
interface Exercise {
  id: string;                    // UUID
  name: string;                  // "Barbell Bench Press"
  aliases: string[];             // ["Flat Bench", "Bench Press"]
  
  // Classification
  category: 'compound' | 'isolation' | 'bodyweight' | 'machine' | 'cable' | 'cardio';
  movement: 'push' | 'pull' | 'legs' | 'hinge' | 'squat' | 'carry' | 'rotation';
  plane: 'sagittal' | 'frontal' | 'transverse';
  
  // Muscles
  primaryMuscles: MuscleGroup[];  // ["chest"]
  secondaryMuscles: MuscleGroup[];// ["anterior_deltoid", "triceps"]
  
  // Equipment
  equipment: Equipment[];         // ["barbell", "flat_bench"]
  location: ('gym' | 'home' | 'outdoor')[];
  
  // Metrics
  trackingType: 'weight_reps' | 'weight_time' | 'bodyweight_reps' | 'distance_time' | 'time_only';
  
  // Media
  images: string[];               // URLs to demonstration images
  videoUrl?: string;              // Exercise demonstration video
  muscleMapHighlight: string;     // SVG overlay for muscle map
  
  // Metadata
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  instructions: string[];         // Step-by-step
  tips: string[];                 // Common mistakes, cues
  alternatives: string[];         // Exercise IDs für Substitution
  
  // Science
  emgActivation?: {               // EMG data (% MVC)
    [muscle: string]: number;     // e.g. { "chest": 95, "triceps": 60 }
  };
}
```

## Muscle Groups (Taxonomy)

```
UPPER BODY
├── Chest
│   ├── Upper Chest (Clavicular)
│   ├── Mid Chest (Sternal)
│   └── Lower Chest (Costal)
├── Back
│   ├── Lats (Latissimus Dorsi)
│   ├── Upper Back (Rhomboids, Mid Traps)
│   ├── Lower Back (Erector Spinae)
│   └── Rear Delts
├── Shoulders
│   ├── Anterior Deltoid
│   ├── Lateral Deltoid
│   └── Posterior Deltoid
├── Arms
│   ├── Biceps (Long Head, Short Head)
│   ├── Triceps (Long, Lateral, Medial Head)
│   └── Forearms (Flexors, Extensors)
└── Core
    ├── Rectus Abdominis (Upper, Lower)
    ├── Obliques (Internal, External)
    ├── Transverse Abdominis
    └── Serratus Anterior

LOWER BODY
├── Quadriceps
│   ├── Rectus Femoris
│   ├── Vastus Lateralis
│   ├── Vastus Medialis
│   └── Vastus Intermedius
├── Hamstrings
│   ├── Biceps Femoris
│   ├── Semitendinosus
│   └── Semimembranosus
├── Glutes
│   ├── Gluteus Maximus
│   ├── Gluteus Medius
│   └── Gluteus Minimus
├── Calves
│   ├── Gastrocnemius
│   └── Soleus
├── Hip Flexors
│   ├── Iliopsoas
│   └── Rectus Femoris
└── Adductors
    └── Adductor Magnus, Longus, Brevis
```

## Free Exercise Data Sources

| Source | Exercises | License | Data |
|--------|----------|---------|------|
| **free-exercise-db** (GitHub) | 800+ | Public Domain | Name, Muscles, Category, Images |
| **wger.de** | 400+ | AGPL | Name, Muscles, SVG Muscle Maps |
| **ExRx.net** | 1,600+ | Copyrighted (reference only) | Instructions, EMG, Classification |
| **USDA Exercise DB** | — | — | Does not exist |

### free-exercise-db (PRIMARY SOURCE)
- **URL:** github.com/yuhonas/free-exercise-db
- **Format:** JSON
- **Fields:** name, force, level, mechanic, equipment, primaryMuscles, secondaryMuscles, instructions, category, images
- **License:** Public Domain (CC0)
- **Quality:** Good, needs enrichment (no video, no EMG)

### wger.de (SUPPLEMENT)
- **URL:** wger.de/api/v2/
- **Format:** REST API + JSON
- **Fields:** name, description, muscles, equipment, category, images, SVG muscle maps
- **License:** AGPL (code), CC BY-SA (content)
- **Quality:** SVG Muscle Maps = unique asset

## Progressive Overload Model

```typescript
interface ProgressionAlgorithm {
  // Double Progression (most common)
  doubleProgression: {
    repRange: [number, number];  // e.g. [8, 12]
    rule: "When all sets hit top of range → increase weight";
    weightIncrease: {
      upper: 2.5,  // kg for upper body
      lower: 5.0,  // kg for lower body
    };
  };
  
  // Linear Periodization
  linearPeriodization: {
    week1: { sets: 3, reps: 12, rpe: 7 };
    week2: { sets: 3, reps: 10, rpe: 8 };
    week3: { sets: 4, reps: 8, rpe: 8.5 };
    week4: { sets: 4, reps: 6, rpe: 9 };
    week5: "DELOAD";
  };
  
  // RP-Style (Volume Landmarks)
  rpProgression: {
    MV: number;   // Minimum Effective Volume (sets/week)
    MAV: number;  // Maximum Adaptive Volume
    MRV: number;  // Maximum Recoverable Volume
    // Start at MV, ramp to MAV over mesocycle, deload at MRV
  };
}

// Volume Landmarks by Muscle Group (sets/week, research-based)
const volumeLandmarks = {
  chest:      { MV: 8,  MAV: 14, MRV: 22 },
  back:       { MV: 8,  MAV: 16, MRV: 24 },
  shoulders:  { MV: 6,  MAV: 14, MRV: 20 },
  biceps:     { MV: 4,  MAV: 10, MRV: 16 },
  triceps:    { MV: 4,  MAV: 10, MRV: 16 },
  quads:      { MV: 6,  MAV: 14, MRV: 22 },
  hamstrings: { MV: 4,  MAV: 10, MRV: 18 },
  glutes:     { MV: 4,  MAV: 12, MRV: 18 },
  calves:     { MV: 6,  MAV: 12, MRV: 18 },
  abs:        { MV: 0,  MAV: 10, MRV: 16 },
};
```

## Workout Templates

| Template | Split | Days/Week | Target |
|----------|-------|-----------|--------|
| Full Body | A/B | 3 | Beginner |
| Upper/Lower | U/L/U/L | 4 | Intermediate |
| PPL | Push/Pull/Legs | 3-6 | Intermediate+ |
| Bro Split | Chest/Back/Shoulders/Arms/Legs | 5 | Bodybuilding |
| Arnold Split | Chest+Back/Shoulders+Arms/Legs | 6 | Advanced BB |
| PHUL | Power Upper/Lower + Hypertrophy U/L | 4 | Powerbuilding |
| 5/3/1 | Squat/Bench/Deadlift/OHP | 4 | Strength |
| GZCLP | T1/T2/T3 | 3-4 | Beginner Strength |

## MVP Exercise Count Target: 500+
- 800+ from free-exercise-db (curated to ~500 quality)
- Enriched with wger.de muscle maps
- Custom additions for common gym exercises
- Cost: $0
