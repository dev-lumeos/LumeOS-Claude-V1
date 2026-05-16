# Training Module Migration Guide

Consolidated documentation for migrating old training module implementations to current architecture.

---

## Overview

This document consolidates legacy documentation and provides migration paths for:
- Old muscle group system → New junction table
- Legacy equipment field → Equipment FK
- Separate coach tables → Unified routine system
- Legacy API endpoints → Current REST API

---

## Database Schema Migration

### Muscle Groups System

**Old Schema:**
```sql
-- exercises table had array fields
CREATE TABLE exercises (
  primary_muscles TEXT[],
  secondary_muscles TEXT[]
);

-- Example data
primary_muscles: ['chest', 'shoulders']
secondary_muscles: ['triceps']
```

**New Schema:**
```sql
-- Junction table with explicit roles
CREATE TABLE exercise_muscles (
  exercise_id UUID REFERENCES exercises(id),
  muscle_group_id UUID REFERENCES muscle_groups(id),
  role TEXT CHECK (role IN ('primary', 'secondary'))
);

-- Example data (normalized)
exercise_muscles:
  {exercise_id: 'bench-press', muscle_group_id: 'chest', role: 'primary'}
  {exercise_id: 'bench-press', muscle_group_id: 'shoulders', role: 'primary'}
  {exercise_id: 'bench-press', muscle_group_id: 'triceps', role: 'secondary'}
```

**Migration Script:**
```sql
-- Step 1: Create muscle_groups table and populate
INSERT INTO muscle_groups (name, body_region) VALUES
  ('Chest', 'chest'),
  ('Shoulders', 'shoulders'),
  ('Triceps', 'arms'),
  ('Back', 'upper_back'),
  ('Biceps', 'arms'),
  ('Quads', 'legs'),
  ('Hamstrings', 'legs'),
  ('Glutes', 'legs'),
  ('Calves', 'legs'),
  ('Abs', 'core');

-- Step 2: Migrate primary_muscles
INSERT INTO exercise_muscles (exercise_id, muscle_group_id, role)
SELECT 
  e.id,
  mg.id,
  'primary'
FROM exercises e
CROSS JOIN LATERAL unnest(e.primary_muscles) AS muscle_name
JOIN muscle_groups mg ON LOWER(mg.name) = LOWER(muscle_name)
WHERE e.primary_muscles IS NOT NULL;

-- Step 3: Migrate secondary_muscles
INSERT INTO exercise_muscles (exercise_id, muscle_group_id, role)
SELECT 
  e.id,
  mg.id,
  'secondary'
FROM exercises e
CROSS JOIN LATERAL unnest(e.secondary_muscles) AS muscle_name
JOIN muscle_groups mg ON LOWER(mg.name) = LOWER(muscle_name)
WHERE e.secondary_muscles IS NOT NULL
ON CONFLICT (exercise_id, muscle_group_id) DO NOTHING;

-- Step 4: Verify migration
SELECT 
  e.name,
  COUNT(*) FILTER (WHERE em.role = 'primary') as primary_count,
  COUNT(*) FILTER (WHERE em.role = 'secondary') as secondary_count
FROM exercises e
LEFT JOIN exercise_muscles em ON e.id = em.exercise_id
GROUP BY e.id, e.name
HAVING COUNT(*) FILTER (WHERE em.role = 'primary') = 0;  -- Find missing entries

-- Step 5: Keep legacy fields for compatibility (optional)
-- ALTER TABLE exercises DROP COLUMN primary_muscles;
-- ALTER TABLE exercises DROP COLUMN secondary_muscles;
```

---

### Equipment System

**Old Schema:**
```sql
CREATE TABLE exercises (
  equipment TEXT  -- 'Barbell', 'Dumbbells', etc.
);
```

**New Schema:**
```sql
CREATE TABLE equipment (
  id UUID PRIMARY KEY,
  name TEXT UNIQUE,
  category TEXT
);

ALTER TABLE exercises 
  ADD COLUMN equipment_id UUID REFERENCES equipment(id);
```

**Migration Script:**
```sql
-- Step 1: Create equipment table and populate
INSERT INTO equipment (name, category) VALUES
  ('Barbell', 'free_weights'),
  ('Dumbbells', 'free_weights'),
  ('Cables', 'cables'),
  ('Machine', 'machines'),
  ('Bodyweight', 'bodyweight'),
  ('Resistance Bands', 'bands');

-- Step 2: Link exercises
UPDATE exercises e
SET equipment_id = eq.id
FROM equipment eq
WHERE LOWER(e.equipment) = LOWER(eq.name);

-- Step 3: Handle missing equipment
UPDATE exercises
SET equipment_id = (SELECT id FROM equipment WHERE name = 'Bodyweight')
WHERE equipment IS NULL OR equipment = '';

-- Step 4: Verify
SELECT equipment, COUNT(*) 
FROM exercises 
WHERE equipment_id IS NULL 
GROUP BY equipment;
```

---

### Routine System Consolidation

**Old Schema:**
```sql
-- Separate tables for user and coach routines
CREATE TABLE user_routines (
  id UUID PRIMARY KEY,
  user_id UUID,
  name TEXT
);

CREATE TABLE coach_routines (
  id UUID PRIMARY KEY,
  coach_id UUID,
  client_ids UUID[]
);
```

**New Schema:**
```sql
-- Unified table with type discrimination
CREATE TABLE routines (
  id UUID PRIMARY KEY,
  user_id UUID,
  creator_type TEXT CHECK (creator_type IN ('user', 'coach', 'marketplace')),
  creator_id UUID,
  assigned_to UUID[]
);
```

**Migration Script:**
```sql
-- Step 1: Migrate user routines
INSERT INTO routines (
  user_id, creator_type, creator_id, name, description, days_per_week
)
SELECT 
  user_id,
  'user',
  user_id,
  name,
  description,
  days_per_week
FROM user_routines;

-- Step 2: Migrate coach routines
INSERT INTO routines (
  user_id, creator_type, creator_id, assigned_to, name, description
)
SELECT 
  coach_id,
  'coach',
  coach_id,
  client_ids,
  name,
  description
FROM coach_routines;

-- Step 3: Drop old tables
-- DROP TABLE user_routines;
-- DROP TABLE coach_routines;
```

---

## API Endpoint Migration

### Old API Structure

```
GET  /api/v1/exercises/search
GET  /api/v1/exercises/:id/details
POST /api/v1/workouts/start
POST /api/v1/workouts/:id/log-set
GET  /api/v1/user/routines
POST /api/v1/coach/assign-routine
```

### New API Structure

```
GET  /api/training/exercises
GET  /api/training/exercises/:id
POST /api/training/sessions
POST /api/training/sessions/:sid/exercises/:eid/sets
GET  /api/training/routines
PUT  /api/training/coach/routines/:id/assign
```

### Code Migration

**Old Code:**
```typescript
// Old API client
async function startWorkout() {
  const res = await fetch('/api/v1/workouts/start', {
    method: 'POST',
    body: JSON.stringify({ date: '2026-03-25' })
  });
  return res.json();
}

async function logSet(workoutId: string, exerciseId: string, set: SetData) {
  const res = await fetch(`/api/v1/workouts/${workoutId}/log-set`, {
    method: 'POST',
    body: JSON.stringify({ exerciseId, ...set })
  });
  return res.json();
}
```

**New Code:**
```typescript
// New API client
async function startWorkout() {
  const res = await fetch('/api/training/sessions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ date: '2026-03-25', started_at: new Date().toISOString() })
  });
  const { data } = await res.json();
  return data;
}

async function addExercise(sessionId: string, exerciseId: string) {
  const res = await fetch(`/api/training/sessions/${sessionId}/exercises`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ exercise_id: exerciseId, sort_order: 0 })
  });
  return res.json();
}

async function logSet(
  sessionId: string, 
  exerciseId: string, 
  set: { set_number: number; weight_kg: number; reps: number }
) {
  const res = await fetch(
    `/api/training/sessions/${sessionId}/exercises/${exerciseId}/sets`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...set, completed: true })
    }
  );
  return res.json();
}
```

---

## Response Format Changes

### Old Format
```json
{
  "success": true,
  "data": { ... },
  "error": null
}
```

### New Format
```json
{
  "ok": true,
  "data": { ... }
}
```

**Error Format Change:**

**Old:**
```json
{
  "success": false,
  "error": "Exercise not found",
  "data": null
}
```

**New:**
```json
{
  "ok": false,
  "error": "Exercise not found",
  "code": "NOT_FOUND",
  "details": {}
}
```

---

## Frontend Component Migration

### Old Component Structure

```typescript
// Old: Class components with lifecycle methods
class WorkoutLogger extends React.Component {
  componentDidMount() {
    this.fetchSession();
  }
  
  fetchSession() {
    fetch(`/api/v1/workouts/${this.props.id}`)
      .then(res => res.json())
      .then(data => this.setState({ session: data.data }));
  }
}
```

### New Component Structure

```typescript
// New: Functional components with hooks
'use client';

import { useState, useEffect } from 'react';

export function WorkoutLogger({ sessionId }: { sessionId: string }) {
  const [session, setSession] = useState(null);
  
  useEffect(() => {
    fetch(`/api/training/sessions/${sessionId}`)
      .then(res => res.json())
      .then(({ data }) => setSession(data));
  }, [sessionId]);
  
  return (/* ... */);
}
```

---

## Breaking Changes

### v1.0 → v2.0

1. **Muscle Groups:**
   - Array fields removed
   - Use `/api/training/muscle-groups` to get all groups
   - Filter exercises via `muscle` query param

2. **Equipment:**
   - Equipment field now foreign key
   - Equipment objects include `{id, name, category}`

3. **Routines:**
   - Coach routines merged into main `routines` table
   - Use `creator_type` to distinguish
   - Client assignment via `assigned_to` array

4. **Session Logging:**
   - Explicit `workout_exercises` step required
   - Sets linked to `workout_exercise_id`, not `exercise_id`
   - Finish endpoint must be called to calculate summary

5. **Pagination:**
   - `offset` instead of `page` for most endpoints
   - Some endpoints use `hasMore` instead of `total`

---

## Deprecated Features

### Scheduled for Removal

1. **exercises.primary_muscles** (deprecated v1.5)
   - Use `exercise_muscles` table
   - Will be removed in v3.0

2. **exercises.equipment** (deprecated v1.5)
   - Use `equipment_id` FK
   - Will be removed in v3.0

3. **GET /api/training/sessions/:id/summary** (deprecated v2.0)
   - Use `/sessions/:id` (includes summary)
   - Will be removed in v2.5

---

## Rollback Plan

If migration fails, rollback steps:

1. **Database Rollback:**
   ```sql
   -- Restore from backup
   pg_restore -d lumeos backup_20260325.dump
   
   -- Or revert migrations
   ALTER TABLE exercises DROP COLUMN equipment_id;
   DROP TABLE exercise_muscles;
   DROP TABLE equipment;
   ```

2. **API Rollback:**
   - Deploy previous API version tag
   - Restore old route handlers
   - Revert database connection

3. **Frontend Rollback:**
   - Revert to previous component versions
   - Restore old API client
   - Clear user cache

---

## Testing Checklist

Before completing migration:

- [ ] All exercises have muscle groups in `exercise_muscles`
- [ ] All exercises have valid `equipment_id`
- [ ] User routines migrated with `creator_type='user'`
- [ ] Coach routines migrated with `creator_type='coach'`
- [ ] Assigned routines visible in client view
- [ ] Old API endpoints return 404 or redirect
- [ ] New API endpoints return correct format
- [ ] Frontend components fetch from new endpoints
- [ ] Error handling updated for new format
- [ ] User sessions remain valid post-migration

---

## Support & Troubleshooting

### Common Issues

**Issue:** Exercises missing muscle groups after migration

**Solution:**
```sql
-- Find exercises without muscles
SELECT e.id, e.name
FROM exercises e
LEFT JOIN exercise_muscles em ON e.id = em.exercise_id
WHERE em.id IS NULL;

-- Manual assignment
INSERT INTO exercise_muscles (exercise_id, muscle_group_id, role)
VALUES ('exercise-id', 'muscle-group-id', 'primary');
```

**Issue:** Coach routines not appearing for clients

**Solution:**
```sql
-- Check assignment
SELECT id, name, creator_type, assigned_to
FROM routines
WHERE creator_type = 'coach';

-- Add client to assignment
UPDATE routines
SET assigned_to = array_append(assigned_to, 'client-user-id')
WHERE id = 'routine-id';
```

**Issue:** API returns `ok: false` but no error message

**Solution:**
- Check server logs for stack trace
- Ensure all required fields included in request
- Verify authentication token is valid
- Check database connection

---

## Timeline

**Estimated migration duration:** 2-4 hours downtime

**Phase 1: Database (1h)**
- Run migration scripts
- Verify data integrity
- Create indexes

**Phase 2: API (30min)**
- Deploy new API version
- Update environment variables
- Smoke test endpoints

**Phase 3: Frontend (30min)**
- Deploy new frontend build
- Clear CDN cache
- Test critical flows

**Phase 4: Validation (1h)**
- Monitor error logs
- Test user workflows
- Verify coach features
- Check analytics data

---

**Last Updated:** 2026-03-25  
**Migration Version:** 1.0 → 2.0