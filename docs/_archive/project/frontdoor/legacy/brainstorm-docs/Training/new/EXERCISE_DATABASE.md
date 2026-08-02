# Training Module — Exercise Database

## Übersicht

Die Exercise-Datenbank ist der wichtigste Stammdaten-Bestand des Training-Moduls.

| Asset | Anzahl | Status |
|---|---|---|
| Excel-Rohdaten | 2.343 Zeilen (Male+Female) | ✅ importiert |
| Unique Exercises (nach Dedup) | ~1.200 | ✅ |
| Exercises in DB | 1.850 (inkl. Varianten) | ✅ |
| Mit Instructions | 1.748 (75%) | ✅ DE/TH übersetzt |
| Mit Tips | 1.744 (74%) | ✅ DE/TH übersetzt |
| Mit Primary Muscles | 1.743 (74%) | ✅ normalisiert |
| Mit Equipment | 1.645 (70%) | ✅ normalisiert |
| Bilder (Start/End, Male/Female) | 4.645 | ✅ Cloudflare R2 |
| Videos (~11 GB) | 2.363 | ✅ Abdominals+Back live |
| Muskelgruppen | 157 | ✅ DE/EN/TH |
| Equipment-Typen (kanonisch) | ~40 | ✅ normalisiert aus 82 |

---

## Import-Pipeline

### Schritt 1: Excel → Rohdaten
```
Input: exercises_raw.xlsx (2.343 Zeilen)
- Parse Header
- Male/Female Dedup: normalisiere Name → ~1.200 unique Exercises
- Image-URLs: Male → image_male_start/end, Female → image_female_start/end
```

### Schritt 2: Normalisierungen
```
Categories:  bodyweight → Bodyweight, free weights → Free Weights (casing)
Equipment:   82 Varianten → ~40 kanonisch
  ("Ab Roller", "Ab roller", "Ab wheel" → "Ab Roller")
Muscles:     komplexe Strings → normalisierte MuscleGroup IDs
  ("Pectoralis Major, Anterior Deltoid" → [uuid, uuid])
tracking_type: auto aus Category + Name + Equipment
  (Bodyweight + kein Weight-Tag → reps_only)
  (Sauna/Plank/etc → duration)
```

### Schritt 3: sort_weight Berechnung
Einmalig beim Import, deterministisch.

| Basis | Wert |
|---|---|
| Free Weights Compound | 850 |
| Cable Compound | 800 |
| Bodyweight Compound | 820 |
| Machine | 720 |
| Cardio | 500 |
| Stretching | 400 |

**Modifikatoren:**
- Core Fitness Exercise (hardcoded ~25 Exercises): +200
- evaluation_score ≥ 85: +80
- stretch_position = true: +30
- Video vorhanden: +15
- difficulty = advanced: −20

### Schritt 4: Exercise Evaluation Scores

Für ~150 wichtigste Exercises manuell/research-basiert gesetzt.
Rest: auto-berechnet aus SFR + Stretch Position.

**Formel:**
```typescript
evaluation_score = sfr_score * 0.40 + stretch_bonus * 0.35 + emg_score * 0.25
```

### Schritt 5: Canonical Names via Claude API

BLS-ähnliche technische Namen → user-freundliche Display-Namen.
Batch-Verarbeitung 100er Chunks.

### Schritt 6: Aliases seeden

~200 editorial Aliase für häufig gesuchte Exercises.
```sql
('Barbell Bench Press', 'Bench Press', 'en')
('Barbell Bench Press', 'Bankdrücken', 'de')
('Pull-Up', 'Klimmzug', 'de')
```

---

## Exercise Klassifikation

### category
| Wert | Beschreibung |
|---|---|
| Bodyweight | Kein Equipment, Körpergewicht |
| Free Weights | Barbell, Dumbbell, Kettlebell |
| Resistance | Maschinen, Kabel |
| Cardio | Laufen, Radfahren, Rudern |
| Stretching | Dehnen, Yoga, Mobility |

### tracking_type
| Wert | Beispiele |
|---|---|
| weight_reps | Bench Press, Squat, Row |
| reps_only | Pull-Up, Dip, Push-Up |
| duration | Plank, Sauna, Meditation |
| distance_duration | Laufen, Radfahren |

### movement_pattern
push · pull · squat · hinge · carry · rotation · other

### discipline
bodybuilding · powerlifting · olympic · general

---

## Muscle Group Taxonomie

### Body Regions (6)
chest · back · shoulders · arms · core · legs

### Beispiele (aus 157 Muskelgruppen)

**Chest:** Pectoralis Major, Upper Chest, Lower Chest
**Back:** Latissimus Dorsi, Rhomboids, Lower Back, Trapezius
**Shoulders:** Anterior/Lateral/Posterior Deltoid
**Arms:** Biceps Brachii, Triceps Brachii, Brachialis, Forearms
**Core:** Rectus Abdominis, Obliques, TVA, Hip Flexors
**Legs:** Quadriceps, Hamstrings, Gluteus Maximus/Medius, Calves, Adductors

---

## Exercise Evaluation Score — Beispiele

| Übung | Primärer Muskel | Score | Begründung |
|---|---|---|---|
| Romanian Deadlift | Hamstrings | 96 | Maximaler Stretch unter Last |
| Pull-Up | Lats | 94 | Voller ROM, Stretch, hohe Aktivierung |
| Bulgarian Split Squat | Quads/Gesäß | 91 | Maximaler Stretch |
| Incline DB Press | Obere Brust | 92 | Hoher Stretch, gute EMG |
| Barbell Bench Press | Brust | 85 | Compound, gute EMG |
| Lat Pulldown | Lats | 88 | Sehr gute Aktivierung |
| Barbell Squat | Quads | 85 | Compound, geteilter Stimulus |
| Leg Extension | Quads | 65 | Kein Stretch, nur Peak |
| Push-Up | Brust | 55 | Keine externe Last |

---

## Media Storage (Cloudflare R2)

```
Pattern: {exercise_name_slug}_{gender}_{position}.jpg
Beispiel: barbell_bench_press_male_start.jpg
          barbell_bench_press_female_end.jpg

Base URL: https://r2.lumeos.app/exercises/
```

Videos: 12 Kategorien, ~11 GB.
Live: Abdominals + Back.
Ausstehend: Chest, Legs, Shoulders, Arms, etc.

---

## Dateistruktur Import-Scripts

```
src/import/training/
  01_seed_muscle_groups.sql
  02_seed_equipment.sql
  03_import_exercises.py       (Excel → DB, Normalisierungen, sort_weight)
  04_seed_aliases.sql
  05_seed_strength_standards.sql
  06_verify_import.sql
  run_all.sh
```
