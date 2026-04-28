# Training Module — Exercise Taxonomy & Sort System
> Spec Phase 5 | Klassifikation, Evaluation Scores, sort_weight

---

## Zweck

Ähnlich wie BLS-Daten für Nutrition sind Rohdaten der Exercise-DB wissenschaftlich/technisch
und nicht direkt user-freundlich. Dieser Layer übersetzt sie in nutzbare Strukturen.

---

## 1. Muscle Group Hierarchie

### Body Regions (Level 1) — 6 Hauptregionen

| Region | Slug | Muskelgruppen |
|---|---|---|
| Brust | chest | Pectoralis Major (Clavicular, Sternal, Costal) |
| Rücken | back | Latissimus, Upper Back, Lower Back, Rear Delts |
| Schultern | shoulders | Anterior/Lateral/Posterior Deltoid |
| Arme | arms | Bizeps (Long/Short Head), Trizeps (3 Köpfe), Unterarme |
| Core | core | Rectus Abdominis, Obliques, TVA, Serratus |
| Beine | legs | Quadrizeps, Hamstrings, Gesäß, Waden, Hüftbeuger, Adduktoren |

### Vollständige Taxonomie (Auswahl)

```
Brust
├── Obere Brust (Clavicular)
├── Mittlere Brust (Sternal)
└── Untere Brust (Costal)

Rücken
├── Latissimus Dorsi
├── Rhomboiden & mittlere Trapezmuskeln
├── Unterer Rücken (Erector Spinae)
└── Hintere Schulter (Rear Delts)

Schultern
├── Vorderer Deltamuskel
├── Seitlicher Deltamuskel
└── Hinterer Deltamuskel

Arme
├── Bizeps
│   ├── Langer Kopf
│   └── Kurzer Kopf
├── Trizeps
│   ├── Langer Kopf
│   ├── Lateraler Kopf
│   └── Medialer Kopf
└── Unterarme

Core
├── Gerader Bauchmuskel (oben/unten)
├── Schräge Bauchmuskeln (innen/außen)
├── Transversus Abdominis
└── Serratus Anterior

Beine
├── Quadrizeps
│   ├── Rectus Femoris
│   ├── Vastus Lateralis
│   ├── Vastus Medialis
│   └── Vastus Intermedius
├── Hamstrings
│   ├── Biceps Femoris
│   ├── Semitendinosus
│   └── Semimembranosus
├── Gesäß
│   ├── Gluteus Maximus
│   ├── Gluteus Medius
│   └── Gluteus Minimus
├── Waden
│   ├── Gastrocnemius
│   └── Soleus
├── Hüftbeuger
└── Adduktoren
```

---

## 2. Equipment-Kategorien (~40 kanonisch)

| Kategorie | Deutsch | Equipment (Beispiele) |
|---|---|---|
| free_weight | Freie Gewichte | Barbell, Dumbbell, EZ-Bar, Trap Bar, Kettlebell |
| machine | Maschinen | Lat Pulldown Machine, Leg Press, Chest Press Machine |
| cable | Kabel | Cable Machine (High/Low Pulley) |
| bodyweight | Körpergewicht | — (keine Ausrüstung) |
| band | Bänder | Resistance Band, Mini Band |
| cardio | Cardio | Treadmill, Rowing Machine, Bike, Elliptical |
| other | Sonstiges | Ab Roller, Dip Station, Pull-Up Bar, Box |

---

## 3. Exercise Evaluation Score (0–100)

### Was es ist
Effektivitätswert einer Übung für die primären Muskeln.
Basiert auf wissenschaftlicher Evidenz, nicht subjektiver Meinung.

### Berechnungsgrundlage

**Drei Faktoren:**

**A. Stimulus-to-Fatigue Ratio (SFR)**
Wie viel Muskelstimulus pro Einheit systemischer Erschöpfung.
- Hohe SFR: Isolation mit geringem Systemstress (z.B. Pec Deck, Cable Fly)
- Niedrige SFR: Compound mit hohem Systemstress (z.B. Deadlift)
- Kontextuell: Beide haben Platz, Isolation hat höhere SFR für Zielmuskel

**B. Mechanical Tension in Stretch-Position**
Übungen die den Muskel in gestreckter/verlängerter Position belasten = mehr hypertrophes Signal.
- Hoch: Incline Dumbbell Fly, Bulgarian Split Squat, Romanian Deadlift
- Niedrig: Leg Extension (nur Peak-Kontraktion), Upright Row

**C. EMG-Aktivierung (% Maximum Voluntary Contraction)**
Prozentuale Aktivierung des Zielmuskels aus Elektromyographie-Daten.
- Basis: ExRx.net + Peer-Reviewed Studien
- Benchmark: ~85%+ MVC = sehr hohe Aktivierung

### Score-Formel

```typescript
evaluation_score = Math.round(
  sfr_score * 0.40 +        // 0–100: SFR Wert
  stretch_bonus * 0.35 +    // 0 oder 35: Stretch in dehnter Position
  emg_score * 0.25          // 0–100: EMG Aktivierung
);
```

### Beispiele

| Übung | Primäre Muskeln | Score | Begründung |
|---|---|---|---|
| Incline DB Press | Obere Brust | 92 | Hoher Stretch, gute EMG, gute SFR |
| Barbell Bench Press | Brust | 85 | Compound, gute EMG, moderate SFR |
| Pec Deck / Butterfly | Brust | 78 | Guter Stretch, hohe Isolation |
| Cable Crossover (Low) | Untere Brust | 74 | Guter Stretch, moderate SFR |
| Dips | Brust/Trizeps | 70 | Gute Brust, aber geteilter Stimulus |
| Push-Up | Brust | 55 | Keine externe Last, begrenzte Progression |
| Pull-Up | Lats | 94 | Voller ROM, Stretch, hohe Aktivierung |
| Lat Pulldown | Lats | 88 | Sehr gute Aktivierung, kontrollierter ROM |
| Romanian Deadlift | Hamstrings | 96 | Maximaler Stretch unter Last |
| Leg Curl | Hamstrings | 72 | Gute Isolation, kein Stretch |
| Bulgarian Split Squat | Quads/Gesäß | 91 | Maximaler Stretch |
| Barbell Squat | Quads | 85 | Compound, aber geteilter Stimulus |
| Leg Extension | Quads | 65 | Kein Stretch, nur Peak |

---

## 4. sort_weight System (0–1000)

### Zweck
Steuert Suchreihenfolge wenn kein Suchbegriff eingegeben wird.
Relevanteste Übungen für LumeOS-User zuerst.

### Suchformel
```sql
ORDER BY
  (similarity(name_display, $query) * 0.65)
  + (sort_weight / 1000.0 * 0.35)
DESC
```

### Basis-Scores nach Kategorie

| Kategorie | Basis | Begründung |
|---|---|---|
| Free Weights (Compound) | 850 | Höchster Trainingswert |
| Free Weights (Isolation) | 780 | Gut, aber sekundär |
| Cable (Compound) | 800 | Sehr effektiv |
| Cable (Isolation) | 750 | Gut für Hypertrophie |
| Bodyweight (Compound) | 820 | Hoher Wert, überall machbar |
| Machine (Compound) | 720 | Solide, aber weniger frei |
| Machine (Isolation) | 680 | Nischenübungen |
| Cardio | 500 | Nützlich, aber anders |
| Stretching | 400 | Wichtig, aber nischig |

### Modifikatoren

| Bedingung | Bonus/Malus |
|---|---|
| Core LumeOS Fitness Exercise (+200 hardcoded) | +200 |
| evaluation_score ≥ 85 | +80 |
| evaluation_score ≥ 70 | +40 |
| stretch_position = true | +30 |
| difficulty = beginner | +20 (Zugänglichkeit) |
| difficulty = advanced | −20 (Nische) |
| exercise_type = cardio | −100 |
| exercise_type = stretching | −150 |
| category = Bodyweight UND bekannte Übung | +30 |
| Video vorhanden | +15 |

### Core LumeOS Fitness Exercises (+200)

Exercises die für die Mehrheit der LumeOS-User am relevantesten sind:

**Brust:** Barbell Bench Press, Incline DB Press, Dips, Push-Up
**Rücken:** Pull-Up, Barbell Row, Lat Pulldown, Cable Row
**Schultern:** OHP (Barbell), DB Shoulder Press, Lateral Raise
**Arme:** Barbell Curl, Cable Curl, Triceps Pushdown, Skull Crusher
**Beine:** Barbell Squat, Romanian Deadlift, Leg Press, Bulgarian Split Squat, Hip Thrust
**Core:** Plank, Ab Wheel Rollout, Hanging Leg Raise, Cable Crunch
**Compound Multipurpose:** Deadlift, Overhead Press, Power Clean

---

## 5. Name Display System

### Problem
Exercise-Namen aus der Datenbank sind englische technische Namen, nicht immer user-freundlich.

### Strategie
- `name` (EN canonical): Original aus Datenbank, für die Suche
- `name_de` (DE): Übersetzt, user-freundlich
- `name_th` (TH): Übersetzt (1.850/1.850 bereits übersetzt)

### Konventionen
- Kurzname bevorzugt: "Barbell Bench Press" → "Bankdrücken (Langhantel)"
- Equipment in Klammern wenn disambiguierend
- Keine technischen Kürzel (keine BLS-Codes, keine ID-Suffixe)

| Name (EN canonical) | name_de | name_th |
|---|---|---|
| Barbell Bench Press | Bankdrücken (Langhantel) | เบนช์เพรส (บาร์เบล) |
| Pull-Up | Klimmzug | ดึงข้อ |
| Romanian Deadlift | Rumänisches Kreuzheben | เดดลิฟต์ท่ารูมาเนีย |
| Bulgarian Split Squat | Bulgarische Kniebeugen | สควอทแยกขาบัลแกเรีย |
| Cable Lateral Raise | Seitheben (Kabel) | ยกด้านข้าง (สาย) |
| Hip Thrust | Hüftstrecker / Beckenheben | ฮิปทรัสต์ |

---

## 6. Muscle Filter Groups (für UI)

Der Exercise Library zeigt 6 Filter-Gruppen (Body Regions) für die Muskelgruppen-Filterung.

```typescript
const MUSCLE_FILTER_GROUPS = {
  chest: {
    label: 'Brust',
    muscle_slugs: ['pectoralis_major', 'upper_chest', 'lower_chest', 'serratus']
  },
  back: {
    label: 'Rücken',
    muscle_slugs: ['latissimus_dorsi', 'rhomboids', 'mid_traps', 'lower_back', 'teres_major']
  },
  shoulders: {
    label: 'Schultern',
    muscle_slugs: ['anterior_deltoid', 'lateral_deltoid', 'posterior_deltoid', 'upper_traps']
  },
  arms: {
    label: 'Arme',
    muscle_slugs: ['biceps', 'biceps_long_head', 'biceps_short_head', 'triceps',
                   'triceps_long_head', 'triceps_lateral', 'brachialis', 'forearms']
  },
  core: {
    label: 'Core',
    muscle_slugs: ['rectus_abdominis', 'obliques', 'transverse_abdominis', 'hip_flexors']
  },
  legs: {
    label: 'Beine',
    muscle_slugs: ['quadriceps', 'hamstrings', 'glutes', 'calves', 'adductors',
                   'gluteus_medius', 'hip_abductors']
  }
};
```

---

## 7. Workout Template Presets (System-Routines)

Vorgefertigte Routinen-Templates die als Startpunkte dienen.

| Template | Split | Tage/Woche | Zielgruppe |
|---|---|---|---|
| Full Body A/B | Ganzkörper | 3 | Beginner |
| Upper/Lower | Ober-/Unterkörper | 4 | Intermediate |
| PPL (Push/Pull/Legs) | 3-Split | 3–6 | Intermediate+ |
| Bro-Split | Brust/Rücken/Schultern/Arme/Beine | 5 | Bodybuilding |
| PHUL | Power Upper/Lower + Hypertrophie U/L | 4 | Powerbuilding |
| 5/3/1 | Squat/Bench/Deadlift/OHP | 4 | Kraft |
| Minimalist | 2–3 Compound/Session | 2–3 | Vielbeschäftigte |
