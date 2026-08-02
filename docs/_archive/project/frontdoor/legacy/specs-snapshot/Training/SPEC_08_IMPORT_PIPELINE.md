# Training Module — Import Pipeline
> Spec Phase 8 | Excel → DB Import

---

## Übersicht

Die Exercise-Daten liegen als Excel-Datei vor (2.343 Zeilen = Male + Female Varianten).
Der Import ist **einmalig** und resultiert in ~1.200 unique Exercises (nach Dedup).

```
Schritt 1:  Excel parsen → rohe JSON-Objekte
Schritt 2:  Male/Female deduplizieren → 1.200 unique
Schritt 3:  Categories normalisieren (bodyweight → Bodyweight)
Schritt 4:  Equipment normalisieren (82 → ~40 kanonische)
Schritt 5:  Muscle-Strings parsen → MuscleGroup IDs
Schritt 6:  tracking_type bestimmen
Schritt 7:  sort_weight berechnen
Schritt 8:  evaluation_score setzen
Schritt 9:  Image-URLs mappen (Cloudflare R2 Pattern)
Schritt 10: Video-URLs mappen
Schritt 11: DB Insert (exercises + exercise_muscles)
Schritt 12: Aliases seeden
Schritt 13: Verifikation
```

---

## Phase 1–2: Excel lesen + Deduplizieren

```python
import openpyxl
import json
from collections import defaultdict

wb = openpyxl.load_workbook('exercises_raw.xlsx', read_only=True)
ws = wb.active
rows = list(ws.iter_rows(values_only=True))
header = [str(h).strip().lower().replace(' ', '_') for h in rows[0]]

raw_exercises = []
for row in rows[1:]:
    obj = dict(zip(header, row))
    if obj.get('name'):
        raw_exercises.append(obj)

# Dedupliziere Male/Female:
# Male und Female Varianten haben identischen Namen ausser Suffix " - Male" / " - Female"
# Strategie: normalisiere Name, merge Image-URLs
def normalize_name(name: str) -> str:
    for suffix in [' - Male', ' - Female', ' (Male)', ' (Female)', '_male', '_female']:
        name = name.replace(suffix, '')
    return name.strip()

seen = {}
for ex in raw_exercises:
    key = normalize_name(ex['name']).lower()
    if key not in seen:
        seen[key] = ex
        seen[key]['_canonical_name'] = normalize_name(ex['name'])
    else:
        # Merge: wenn Female-Bild fehlt, übernehmen
        if 'female' in ex['name'].lower():
            seen[key]['image_female_start'] = ex.get('image_start')
            seen[key]['image_female_end']   = ex.get('image_end')

unique_exercises = list(seen.values())
print(f"Unique exercises after dedup: {len(unique_exercises)}")
# Expected: ~1.200
```

---

## Phase 3: Category-Normalisierung

```python
CATEGORY_MAP = {
    'bodyweight':  'Bodyweight',
    'Bodyweight':  'Bodyweight',
    'free weights': 'Free Weights',
    'Free Weights': 'Free Weights',
    'resistance':  'Resistance',
    'Resistance':  'Resistance',
    'cardio':      'Cardio',
    'Cardio':      'Cardio',
    'stretching':  'Stretching',
    'flexibility': 'Stretching',
    'strength':    'Free Weights',   # default für unbekannte Strength
}

def normalize_category(raw: str) -> str:
    if not raw:
        return 'Free Weights'  # Default
    return CATEGORY_MAP.get(raw.strip(), 'Free Weights')
```

---

## Phase 4: Equipment-Normalisierung

```python
EQUIPMENT_NORMALIZATION = {
    'ab roller':             'Ab Roller',
    'ab wheel':              'Ab Roller',
    'barbell':               'Barbell',
    'bar':                   'Barbell',
    'dumbbell':              'Dumbbell',
    'dumbbells':             'Dumbbell',
    'dumbells':              'Dumbbell',
    'cable':                 'Cable Machine',
    'cables':                'Cable Machine',
    'cable machine':         'Cable Machine',
    'machine':               'Smith Machine',
    'smith machine':         'Smith Machine',
    'smith':                 'Smith Machine',
    'none':                  'None (Bodyweight)',
    'none (bodyweight)':     'None (Bodyweight)',
    'body only':             'None (Bodyweight)',
    'bodyweight':            'None (Bodyweight)',
    'pull-up bar':           'Pull-Up Bar',
    'pullup bar':            'Pull-Up Bar',
    'chin-up bar':           'Pull-Up Bar',
    'ez-bar':                'EZ-Bar',
    'e-z curl bar':          'EZ-Bar',
    'kettlebell':            'Kettlebell',
    'kettlebells':           'Kettlebell',
    'resistance band':       'Resistance Band',
    'bands':                 'Resistance Band',
    'band':                  'Resistance Band',
    'foam roll':             'Foam Roller',
    'foam roller':           'Foam Roller',
    'medicine ball':         'Medicine Ball',
    'stability ball':        'Medicine Ball',
    'bench':                 'Bench',
    'flat bench':            'Bench',
    'incline bench':         'Incline Bench',
    'preacher bench':        'Preacher Bench',
    'dip station':           'Dip Station',
    'dip bars':              'Dip Station',
    'trx':                   'TRX / Suspension',
    'suspension':            'TRX / Suspension',
    'box':                   'Box',
    'plyo box':              'Box',
    'treadmill':             'Treadmill',
    'rowing machine':        'Rowing Machine',
    'stationary bike':       'Stationary Bike',
    'bike':                  'Stationary Bike',
    'elliptical':            'Elliptical',
    'leg press':             'Leg Press Machine',
    'lat pulldown':          'Lat Pulldown Machine',
    'leg curl':              'Leg Curl Machine',
    'leg extension':         'Leg Extension Machine',
}

def normalize_equipment(raw: str) -> str:
    if not raw:
        return 'None (Bodyweight)'
    return EQUIPMENT_NORMALIZATION.get(raw.strip().lower(), raw.strip())
```

---

## Phase 5: Muscle-String Parsing

```python
# Muskel-Strings aus der Rohdatei sind oft Komma-separierte Listen
# mit lateinischen Namen oder Umgangssprache
# Beispiel: "Pectoralis Major, Anterior Deltoid, Triceps Brachii"

MUSCLE_NAME_MAP = {
    'chest':                  'Pectoralis Major',
    'pectorals':              'Pectoralis Major',
    'pectoralis major':       'Pectoralis Major',
    'upper chest':            'Upper Chest',
    'lower chest':            'Lower Chest',
    'lats':                   'Latissimus Dorsi',
    'latissimus dorsi':       'Latissimus Dorsi',
    'middle back':            'Rhomboids',
    'rhomboids':              'Rhomboids',
    'lower back':             'Lower Back',
    'erector spinae':         'Lower Back',
    'shoulders':              'Lateral Deltoid',
    'anterior deltoid':       'Anterior Deltoid',
    'lateral deltoid':        'Lateral Deltoid',
    'posterior deltoid':      'Posterior Deltoid',
    'rear deltoid':           'Posterior Deltoid',
    'biceps':                 'Biceps Brachii',
    'biceps brachii':         'Biceps Brachii',
    'triceps':                'Triceps Brachii',
    'triceps brachii':        'Triceps Brachii',
    'brachialis':             'Brachialis',
    'forearms':               'Forearms',
    'abs':                    'Rectus Abdominis',
    'abdominals':             'Rectus Abdominis',
    'rectus abdominis':       'Rectus Abdominis',
    'obliques':               'Obliques',
    'core':                   'Transverse Abdominis',
    'hip flexors':            'Hip Flexors',
    'quadriceps':             'Quadriceps',
    'quads':                  'Quadriceps',
    'hamstrings':             'Hamstrings',
    'glutes':                 'Gluteus Maximus',
    'gluteus maximus':        'Gluteus Maximus',
    'gluteus medius':         'Gluteus Medius',
    'calves':                 'Calves',
    'adductors':              'Adductors',
}

def parse_muscles(muscle_string: str, role: str) -> list[str]:
    if not muscle_string:
        return []
    muscles = []
    for part in muscle_string.split(','):
        normalized = MUSCLE_NAME_MAP.get(part.strip().lower())
        if normalized:
            muscles.append(normalized)
    return muscles
```

---

## Phase 6: tracking_type bestimmen

```python
def determine_tracking_type(category: str, exercise_name: str, equipment: str) -> str:
    name_lower = exercise_name.lower()
    cat_lower = category.lower()

    if cat_lower in ('cardio',):
        if any(w in name_lower for w in ['run', 'sprint', 'cycle', 'row', 'swim']):
            return 'distance_duration'
        return 'duration'

    if cat_lower in ('stretching', 'yoga', 'flexibility'):
        return 'duration'

    if equipment in ('None (Bodyweight)',) or cat_lower == 'bodyweight':
        if any(w in name_lower for w in ['plank', 'hold', 'wall sit', 'hang']):
            return 'duration'
        return 'reps_only'

    return 'weight_reps'  # Default für alle anderen
```

---

## Phase 7: sort_weight berechnen

```python
CORE_FITNESS_EXERCISES = {
    'Barbell Bench Press', 'Incline Dumbbell Press', 'Dips', 'Push-Up',
    'Pull-Up', 'Chin-Up', 'Barbell Row', 'Seated Cable Row', 'Lat Pulldown',
    'Overhead Press', 'Dumbbell Shoulder Press', 'Lateral Raise',
    'Barbell Curl', 'Cable Curl', 'Triceps Pushdown', 'Skull Crusher',
    'Barbell Squat', 'Romanian Deadlift', 'Deadlift', 'Leg Press',
    'Bulgarian Split Squat', 'Hip Thrust', 'Plank', 'Ab Wheel Rollout',
    'Hanging Leg Raise', 'Cable Crunch'
}

BASE_SCORES = {
    'Free Weights': 820, 'Resistance': 760, 'Bodyweight': 780,
    'Cardio': 500, 'Stretching': 400,
}

def calculate_sort_weight(exercise: dict) -> int:
    name        = exercise.get('_canonical_name', '')
    category    = exercise.get('category', 'Free Weights')
    tracking    = exercise.get('tracking_type', 'weight_reps')
    difficulty  = exercise.get('difficulty', 'intermediate')
    eval_score  = exercise.get('evaluation_score', 50)
    has_video   = bool(exercise.get('video_url'))
    stretch     = exercise.get('stretch_position', False)

    # Basis
    base = BASE_SCORES.get(category, 600)

    # Compound vs. Isolation (aus Movement Pattern)
    movement = exercise.get('movement_pattern', '')
    if movement in ('push', 'pull', 'squat', 'hinge'):
        base += 30  # Compound-Bonus

    bonus = 0

    # Core LumeOS Fitness Exercise
    if name in CORE_FITNESS_EXERCISES:
        bonus += 200

    # Evaluation Score
    if eval_score >= 85:
        bonus += 80
    elif eval_score >= 70:
        bonus += 40

    # Stretch Position
    if stretch:
        bonus += 30

    # Difficulty
    if difficulty == 'beginner':
        bonus += 20
    elif difficulty == 'advanced':
        bonus -= 20

    # Video vorhanden
    if has_video:
        bonus += 15

    # Cardio/Stretching Malus
    if tracking == 'duration':
        bonus -= 50
    if tracking == 'distance_duration':
        bonus -= 30

    return max(0, min(1000, base + bonus))
```

---

## Phase 8: Image-URL Mapping (Cloudflare R2)

```python
R2_BASE_URL = 'https://r2.lumeos.app/exercises'

def map_image_urls(exercise_name: str) -> dict:
    """
    Pattern: {exercise_name_slug}_{gender}_{position}.jpg
    Beispiel: barbell_bench_press_male_start.jpg
    """
    slug = exercise_name.lower().replace(' ', '_').replace('/', '_')
    return {
        'image_male_start':   f"{R2_BASE_URL}/{slug}_male_start.jpg",
        'image_male_end':     f"{R2_BASE_URL}/{slug}_male_end.jpg",
        'image_female_start': f"{R2_BASE_URL}/{slug}_female_start.jpg",
        'image_female_end':   f"{R2_BASE_URL}/{slug}_female_end.jpg",
    }
```

---

## Phase 9–11: DB Insert

```python
import psycopg2

def import_exercises(exercises: list, conn):
    cur = conn.cursor()

    # Equipment-Lookup Table
    cur.execute("SELECT name, id FROM training.equipment")
    equipment_ids = dict(cur.fetchall())

    # MuscleGroup-Lookup
    cur.execute("SELECT name, id FROM training.muscle_groups")
    muscle_ids = dict(cur.fetchall())

    for ex in exercises:
        equipment_id = equipment_ids.get(ex['equipment'])

        # Exercise einfügen
        cur.execute("""
            INSERT INTO training.exercises
              (name, name_de, category, exercise_type, tracking_type,
               movement_pattern, discipline, difficulty, equipment_id,
               image_male_start, image_male_end, image_female_start, image_female_end,
               video_url, instructions, tips, common_mistakes,
               evaluation_score, sfr_rating, stretch_position, mechanical_tension,
               sort_weight, source)
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
            RETURNING id
        """, (
            ex['_canonical_name'], ex.get('name_de'),
            ex['category'], ex.get('exercise_type', 'strength'),
            ex['tracking_type'], ex.get('movement_pattern'), ex.get('discipline', 'general'),
            ex.get('difficulty', 'intermediate'), equipment_id,
            ex.get('image_male_start'), ex.get('image_male_end'),
            ex.get('image_female_start'), ex.get('image_female_end'),
            ex.get('video_url'), ex.get('instructions'), ex.get('tips'),
            ex.get('common_mistakes', []),
            ex.get('evaluation_score'), ex.get('sfr_rating'),
            ex.get('stretch_position', False), ex.get('mechanical_tension'),
            ex['sort_weight'], 'exercise_animatic'
        ))
        exercise_id = cur.fetchone()[0]

        # Muskel-Zuordnungen
        for muscle_name in ex.get('primary_muscles', []):
            mg_id = muscle_ids.get(muscle_name)
            if mg_id:
                cur.execute("""
                    INSERT INTO training.exercise_muscles (exercise_id, muscle_group_id, role)
                    VALUES (%s, %s, 'primary') ON CONFLICT DO NOTHING
                """, (exercise_id, mg_id))

        for muscle_name in ex.get('secondary_muscles', []):
            mg_id = muscle_ids.get(muscle_name)
            if mg_id:
                cur.execute("""
                    INSERT INTO training.exercise_muscles (exercise_id, muscle_group_id, role)
                    VALUES (%s, %s, 'secondary') ON CONFLICT DO NOTHING
                """, (exercise_id, mg_id))

    conn.commit()
    print(f"Imported {len(exercises)} exercises")
```

---

## Phase 12: Aliases seeden

```sql
INSERT INTO training.exercise_aliases (exercise_id, alias, locale)
SELECT id, 'Bench Press', 'en' FROM training.exercises WHERE name = 'Barbell Bench Press'
UNION ALL
SELECT id, 'Flat Bench', 'en' FROM training.exercises WHERE name = 'Barbell Bench Press'
UNION ALL
SELECT id, 'Bankdrücken', 'de' FROM training.exercises WHERE name = 'Barbell Bench Press'
UNION ALL
SELECT id, 'Pull-Up', 'en' FROM training.exercises WHERE name = 'Pull-Up'
UNION ALL
SELECT id, 'Klimmzug', 'de' FROM training.exercises WHERE name = 'Pull-Up'
UNION ALL
SELECT id, 'Chin-Up', 'en' FROM training.exercises WHERE name = 'Pull-Up'
UNION ALL
SELECT id, 'Squat', 'en' FROM training.exercises WHERE name = 'Barbell Squat'
UNION ALL
SELECT id, 'Kniebeugen', 'de' FROM training.exercises WHERE name = 'Barbell Squat'
UNION ALL
SELECT id, 'Deadlift', 'en' FROM training.exercises WHERE name = 'Deadlift'
UNION ALL
SELECT id, 'Kreuzheben', 'de' FROM training.exercises WHERE name = 'Deadlift'
ON CONFLICT DO NOTHING;
```

---

## Phase 13: Verifikation

```sql
-- Gesamt-Überblick
SELECT 'exercises' AS t, COUNT(*) FROM training.exercises
UNION ALL
SELECT 'exercise_muscles', COUNT(*) FROM training.exercise_muscles
UNION ALL
SELECT 'exercise_aliases', COUNT(*) FROM training.exercise_aliases;

-- Exercises ohne Muskeln (sollten 0 sein)
SELECT COUNT(*) FROM training.exercises e
WHERE NOT EXISTS (
  SELECT 1 FROM training.exercise_muscles em WHERE em.exercise_id = e.id
);

-- Sort Weight Distribution
SELECT
  CASE
    WHEN sort_weight >= 900 THEN '900-1000 (Top Core)'
    WHEN sort_weight >= 750 THEN '750-899 (Hoch)'
    WHEN sort_weight >= 600 THEN '600-749 (Mittel)'
    WHEN sort_weight >= 400 THEN '400-599 (Niedrig)'
    ELSE '0-399 (Minimal)'
  END AS range,
  COUNT(*) AS count
FROM training.exercises GROUP BY 1 ORDER BY 1;

-- Suchtest
SELECT name, name_de, sort_weight, evaluation_score
FROM training.exercises
WHERE similarity(name, 'bench press') > 0.2
   OR name_de ILIKE '%bankdrücken%'
ORDER BY (similarity(name, 'bench press') * 0.65) + (sort_weight/1000.0 * 0.35) DESC
LIMIT 8;

-- Category-Verteilung
SELECT category, COUNT(*) FROM training.exercises GROUP BY category ORDER BY 2 DESC;

-- tracking_type-Verteilung
SELECT tracking_type, COUNT(*) FROM training.exercises GROUP BY tracking_type;
```

---

## Dateistruktur

```
src/import/training/
  01_seed_muscle_groups.sql       Alle 157 Muskelgruppen
  02_seed_equipment.sql           ~40 kanonische Equipment-Typen
  03_import_exercises.py          Phase 1–11: Excel → DB
  04_seed_aliases.sql             Phase 12: Such-Aliase
  05_seed_strength_standards.sql  Referenz-Kraftwerte
  06_verify_import.sql            Phase 13: Verifikation
  run_all.sh                      Reihenfolge-Script
```
