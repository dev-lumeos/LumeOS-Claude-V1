# Lumeos Recovery — Metrics & Algorithms

## Recovery Score Inputs

### Primary Metrics (Wearable-imported)
| Metric | Source | Weight | Why |
|--------|--------|--------|-----|
| **HRV (rMSSD)** | Apple Health / Oura / WHOOP | 25% | ANS Balance = best single predictor |
| **Resting Heart Rate** | Apple Health | 15% | Lower = more recovered |
| **Sleep Duration** | Apple Health | 15% | vs. personal need (7-9h) |
| **Sleep Quality** | Apple Health (stages) | 15% | Deep + REM % |
| **Respiratory Rate** | Apple Health | 5% | Elevated = stress/illness |
| **SpO2** | Apple Health | 5% | Low = altitude/illness |

### Secondary Metrics (Lumeos-computed)
| Metric | Source | Weight | Why |
|--------|--------|--------|-----|
| **Training Load (acute)** | Training Module | 10% | High volume yesterday → less recovered |
| **Nutrition Quality** | Nutrition Module | 5% | Low protein, low calories → recovery ↓ |
| **Supplement Compliance** | Supplement Module | 3% | Missed recovery supps → factor |
| **Subjective Readiness** | User Input (AM) | 2% | "How do you feel? 1-10" |

### Tertiary Metrics (Optional, high-value)
| Metric | Source | Modifier |
|--------|--------|----------|
| **Cortisol** | Bloodwork | If elevated → Recovery ↓↓ |
| **CRP (hs)** | Bloodwork | If elevated → Inflammation → Recovery ↓ |
| **Testosterone** | Bloodwork | If low → Recovery capacity ↓ |
| **Hematocrit** | Bloodwork | If >50% → Cardiovascular stress |

---

## Muscle Recovery Map — Algorithm

### Per-Muscle-Group Recovery Calculation:

```
recovery_pct = base_recovery(hours_since_training)
             × sleep_modifier(sleep_quality)
             × nutrition_modifier(protein_intake, calorie_balance)
             × hrv_modifier(hrv_vs_baseline)
             × soreness_modifier(subjective_soreness)
             × volume_modifier(sets_per_muscle_last_session)
```

### Base Recovery Curve (hours since training):
| Hours | Recovery % | Status |
|-------|-----------|--------|
| 0-12 | 10-30% | 🔴 Actively recovering |
| 12-24 | 30-50% | 🔴 Still recovering |
| 24-48 | 50-75% | 🟡 Approaching ready |
| 48-72 | 75-90% | 🟢 Ready for moderate |
| 72-96 | 90-100% | 🟢 Fully recovered |
| 96+ | 95-100% | ⚪ Risk of detraining |

### Volume Modifier (sets per muscle group):
| Sets | Recovery Modifier | Note |
|------|------------------|------|
| 1-6 | 1.1x (faster) | Low volume |
| 7-12 | 1.0x (normal) | Moderate |
| 13-18 | 0.85x (slower) | High volume |
| 19-24 | 0.7x (much slower) | Very high |
| 25+ | 0.5x (very slow) | Near MRV |

### Sleep Modifier:
| Sleep Quality | Modifier |
|--------------|----------|
| Excellent (>85%) | 1.15x |
| Good (70-85%) | 1.0x |
| Fair (50-70%) | 0.85x |
| Poor (<50%) | 0.65x |

### Nutrition Modifier:
| Factor | Modifier |
|--------|----------|
| Protein >2g/kg + Surplus | 1.1x |
| Protein >1.6g/kg + Maintenance | 1.0x |
| Protein <1.6g/kg OR Deficit >500kcal | 0.8x |
| Protein <1.2g/kg AND Deficit >500kcal | 0.6x |

---

## Muscle Groups for Recovery Map

| Group | Sub-Groups | Typical Recovery (hours) |
|-------|-----------|------------------------|
| **Chest** | Upper, Mid, Lower | 48-72h |
| **Back** | Lats, Upper Back, Lower Back, Traps | 48-72h |
| **Shoulders** | Front Delt, Side Delt, Rear Delt | 48-72h |
| **Biceps** | Long Head, Short Head | 36-48h |
| **Triceps** | Long Head, Lateral, Medial | 36-48h |
| **Forearms** | Flexors, Extensors | 24-48h |
| **Quads** | Vastus Lateralis/Medialis/Intermedius, Rectus Femoris | 72-96h |
| **Hamstrings** | Biceps Femoris, Semitendinosus | 72-96h |
| **Glutes** | Gluteus Maximus, Medius, Minimus | 72-96h |
| **Calves** | Gastrocnemius, Soleus | 48-72h |
| **Core** | Rectus Abdominis, Obliques, Erectors | 24-48h |

---

## Overtraining Detection

### Warning Signals (combine multiple):
| Signal | Source | Threshold |
|--------|--------|-----------|
| HRV consistently below baseline | Wearable | >10% below 14-day avg for 5+ days |
| Resting HR elevated | Wearable | >5bpm above baseline for 3+ days |
| Sleep quality declining | Wearable | <65% for 3+ consecutive nights |
| Subjective fatigue increasing | User input | ≤3/10 for 3+ days |
| Performance decreasing | Training Module | Strength/Volume ↓ despite effort ↑ |
| Mood/motivation low | User input | Pattern over 5+ days |
| Frequent illness | User input | 2+ colds in 4 weeks |
| Cortisol elevated | Bloodwork | >25 µg/dL (AM) |
| Testosterone decreased | Bloodwork | >20% drop from baseline |

### Overtraining Score:
- 0-2 signals: Normal
- 3-4 signals: ⚠️ Warning — suggest deload
- 5-6 signals: 🟠 High Risk — recommend deload week
- 7+ signals: 🔴 Overtraining Likely — recommend rest + doctor

---

## Recovery Modality Tracking

| Modality | What to Log | Expected Benefit |
|----------|------------|-----------------|
| **Sauna** | Duration (min), Temp (°C/°F), Wet/Dry | HRV↑, Blood Flow↑, Sleep Quality↑ |
| **Cold Plunge** | Duration (min), Temp (°C/°F) | Inflammation↓, Alertness↑, Mood↑ |
| **Contrast Therapy** | Hot/Cold alternating | Circulation↑, Recovery↑ |
| **Massage** | Type (Deep Tissue, Sports, Thai), Duration | Soreness↓, Blood Flow↑, ROM↑ |
| **Foam Rolling** | Duration, Body Parts | Soreness↓, ROM↑ |
| **Percussion (Theragun)** | Duration, Body Parts | Soreness↓, Blood Flow↑ |
| **Compression (Normatec)** | Duration, Body Parts | Edema↓, Recovery↑ |
| **Stretching/Mobility** | Duration, Type (Static/Dynamic/Yoga) | ROM↑, Injury Prevention |
| **Meditation** | Duration, Type (Guided/Unguided) | Stress↓, HRV↑, Sleep↑ |
| **Breathwork** | Duration, Type (Box/Wim Hof/4-7-8) | Stress↓, HRV↑, Parasympathetic↑ |
| **Nap** | Duration | Alertness↑, Recovery↑ (20-30min optimal) |
| **Walk (Active Recovery)** | Duration, Intensity | Blood Flow↑, Mood↑, Recovery↑ |
