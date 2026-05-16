# Training Module Frontend Components

Frontend React component documentation for LUMEOS Training Module.

**Framework:** React (Next.js App Router)  
**Location:** `apps/app/src/app/(app)/training/`  
**State Management:** React Context + Server Components  
**Styling:** Tailwind CSS

---

## ⚠️ Documentation Status

**Status:** Pending Frontend Analysis

This document is a placeholder pending analysis of the frontend codebase.

**To complete:**
1. Analyze `apps/app/src/app/(app)/training/` directory
2. Document React components structure
3. Map component to API endpoint relationships
4. Document state management patterns
5. Document UI/UX patterns and reusable components

---

## Expected Structure

Based on the API structure, the frontend likely includes:

### Page Components
- **Exercise Browser** (`/training/exercises`) - Search and filter exercises
- **Live Workout** (`/training/live`) - Real-time workout logging
- **Routine Manager** (`/training/routines`) - Create/edit routines
- **Training Calendar** (`/training/calendar`) - Monthly session view
- **Analytics Dashboard** (`/training/stats`) - Volume charts, PRs, balance
- **Social Feed** (`/training/social`) - Shared workouts, reactions
- **Periodization Planner** (`/training/periodization`) - Mesocycle management

### Reusable Components

**Expected:**
- `ExerciseCard` - Display exercise with image/video
- `SetLogger` - Input component for weight/reps/RPE/RIR
- `ProgressChart` - Line/bar charts for volume/frequency
- `MuscleMap` - Visual muscle group selector
- `RoutineBuilder` - Drag-and-drop exercise ordering
- `WorkoutSummary` - Post-workout stats display
- `PRBadge` - Highlight personal records
- `ShareButton` - Social sharing with visibility selector

### State Management

**Expected patterns:**
- Server Components for data fetching
- Client Components for interactive elements (logging sets, timers)
- React Context for workout session state
- Optimistic UI updates for set logging
- Real-time timer for workout duration

### API Integration

**Expected fetch patterns:**

```typescript
// Example: Live Workout Component
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function LiveWorkout({ sessionId }: { sessionId: string }) {
  const [session, setSession] = useState(null);
  const [timer, setTimer] = useState(0);
  
  useEffect(() => {
    // Fetch session with exercises
    fetch(`/api/training/sessions/${sessionId}`)
      .then(res => res.json())
      .then(data => setSession(data.data));
      
    // Start timer
    const interval = setInterval(() => setTimer(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, [sessionId]);
  
  const logSet = async (exerciseId: string, setData: SetInput) => {
    const res = await fetch(
      `/api/training/sessions/${sessionId}/exercises/${exerciseId}/sets`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(setData),
      }
    );
    
    if (res.ok) {
      // Optimistic update
      const newSet = await res.json();
      setSession(prev => ({
        ...prev,
        exercises: prev.exercises.map(ex =>
          ex.id === exerciseId
            ? { ...ex, sets: [...ex.sets, newSet.data] }
            : ex
        ),
      }));
    }
  };
  
  return (
    <div>
      <WorkoutTimer duration={timer} />
      {session?.exercises.map(ex => (
        <ExerciseLogger 
          key={ex.id} 
          exercise={ex} 
          onLogSet={(set) => logSet(ex.id, set)} 
        />
      ))}
      <FinishButton sessionId={sessionId} />
    </div>
  );
}
```

---

## Integration Points

### API Endpoints Used by Frontend

**Exercise Browser:**
```
GET /api/training/exercises?q={search}&muscle={muscle}
GET /api/training/exercises/{id}
GET /api/training/muscle-groups
GET /api/training/equipment
```

**Live Workout:**
```
POST /api/training/sessions
POST /api/training/sessions/{id}/exercises
POST /api/training/sessions/{sid}/exercises/{eid}/sets
PUT /api/training/sessions/{sid}/sets/{setId}
POST /api/training/sessions/{id}/finish
GET /api/training/progression/{exerciseId}/auto-fill
```

**Routine Manager:**
```
GET /api/training/routines
POST /api/training/routines
GET /api/training/routines/{id}
POST /api/training/routines/{id}/exercises
PUT /api/training/routines/{id}/exercises/bulk
```

**Analytics:**
```
GET /api/training/stats/volume?period=week
GET /api/training/stats/frequency
GET /api/training/stats/prs
GET /api/training/stats/muscle-balance
GET /api/training/progression/{exerciseId}/history
```

**Social:**
```
POST /api/training/social/share
GET /api/training/social/feed
POST /api/training/social/react
GET /api/training/social/challenges
```

---

## UI Patterns

### Progressive Disclosure

**Workout Session:**
1. Start session → Select routine or blank
2. Add exercises → Search/filter/favorites
3. Log sets → Auto-fill suggestions visible
4. Finish → Summary + PR celebration

### Real-time Feedback

**Set Logger:**
- Weight/reps input → instant estimated 1RM calculation
- RPE/RIR slider → visual intensity indicator
- Completed checkbox → volume tracker updates
- PR indicator → highlight when new record

### Data Visualization

**Charts:**
- Volume trend: Line chart (8-52 weeks)
- Frequency: Bar chart with streak indicator
- Muscle balance: Pie/donut chart with imbalance alerts
- PR timeline: Scatter plot with exercise grouping

---

## Accessibility

**Expected compliance:**
- WCAG 2.1 AA standards
- Keyboard navigation for all interactions
- Screen reader support for workout logging
- High contrast mode for outdoor use
- Focus indicators for all interactive elements

---

## Performance Optimizations

**Expected patterns:**
- Server Components for static content (exercise list)
- Client Components only where interactivity needed
- Debounced search inputs
- Infinite scroll for exercise browser
- Image lazy loading
- Optimistic UI updates (set logging)
- Local storage caching (draft workouts)

---

## Mobile Considerations

**Responsive Design:**
- Touch-friendly targets (min 44×44px)
- Swipe gestures for set deletion
- Bottom sheet modals for mobile
- Sticky session timer
- Offline support for active workouts (service worker)

---

## Future Documentation

When frontend analysis is complete, this document should include:

1. **Component Hierarchy** - Visual tree of all components
2. **Props API** - TypeScript interfaces for all components
3. **State Flow** - Diagram of state management
4. **Code Examples** - Real component implementations
5. **Styling Guide** - Tailwind classes, theme tokens
6. **Testing Patterns** - Unit/integration test examples

---

## Quick Start (Expected)

```bash
# Start dev server
cd apps/app
npm run dev

# Visit training module
open http://localhost:3000/training

# Build for production
npm run build
```

---

**Status:** Awaiting Frontend Analysis  
**Last Updated:** 2026-03-25