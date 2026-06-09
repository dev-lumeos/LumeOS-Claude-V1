# Goals Module — Konsolidiertes Wissen
> Konsolidiert aus 14 Alt-Dokumenten | 2026-04-17
> Quellen: 07_MODULE_GOALS.md, lumeos-goals-strategy.md, goal-phase-models.md,
> goals_DATABASE.md, goals_FEATURES.md, goals_API.md, goals_COMPONENTS.md,
> goals_README.md, goals_RESEARCH.md, goals_MIGRATION.md,
> goalsmod_PRD.md, goalsmod_API.md, goalsmod_RESEARCH.md, goalsmod_SPEC.md

---

## 1. Zweck & Status

**Port 5900. Zentraler Aggregation Point von LumeOS.**

Goals ist KEIN weiteres Feature-Modul — es ist der Betriebssystem-Kern um den alle anderen Module rotieren. Alle Scores sind relativ zum Ziel, nicht absolut. Jeder Alert und jede Empfehlung beantwortet: "Bringt dich das näher an dein Ziel?"

**Status:** ✅ Vollständig implementiert (2026-04-14)

---

## 2. Tom's Core Vision

> "Goals ist nicht ein weiteres Modul sondern der Aggregation Point. Alle Scores sind relativ zum Ziel, nicht absolut. Jeder Alert und jede Empfehlung muss beantworten: 'Bringt dich das näher an dein Ziel?'"

---

## 3. Goal-Typen

### Body Composition
- Körpergewicht (Verlust/Aufbau)
- Körperfettanteil
- Muskelmasse (Lean Mass Target)
- Körpermaße (Taille, Arme, Oberschenkel...)
- Visual Transformation (Foto-basiert)

### Performance
- Kraft-Ziele (1RM für spezifische Übungen)
- Ausdauer-Ziele
- Skill Acquisition

### Health
- Biomarker-Optimierung (z.B. LDL senken, Vitamin D erhöhen)
- Symptom-Auflösung
- Schlafqualität

### Lifestyle
- Gewohnheitsbildung
- Konsistenz-Ziele (z.B. 5×/Woche Training)

---

## 4. Goal Phase State Machine (7 Phasen)

```
FAT_LOSS → REVERSE_DIET → MAINTENANCE → LEAN_BULK → MINI_CUT
                                              ↓
                                        CONTEST_PREP → REVERSE_DIET
RECOMP (eigenständig)
EXPERT_BB_ANNUAL (12-Monats-Plan: Bulk → Maintenance → Prep → Peak → Reverse)
```

### Phase-Parameter (Kern)

| Phase | Kaloriendefizit/-überschuss | Protein | Max. Dauer |
|---|---|---|---|
| FAT_LOSS moderate | −400 bis −600 kcal | 1.8–2.4 g/kg | 20 Wochen |
| FAT_LOSS aggressive | −750 bis −1000 kcal | 2.3–3.1 g/kg | 8 Wochen |
| LEAN_BULK | +200 bis +400 kcal | 1.6–2.2 g/kg | 52 Wochen |
| MAINTENANCE | ±100 kcal | 1.4–2.0 g/kg | unbegrenzt |
| REVERSE_DIET | +50–150 kcal/Woche | halten | 16 Wochen |
| CONTEST_PREP | 4 Sub-Phasen über 16–24 Wochen | 2.3–3.1 g/kg | 24 Wochen |
| RECOMP | Training: TDEE+200, Rest: TDEE−300 | 2.0–2.4 g/kg | unbegrenzt |

---

## 5. Adaptive TDEE Engine

### Woche 1–2: Formula-basiert (Onboarding-Fallback)
Harris-Benedict Revised oder Mifflin-St Jeor + Activity Multiplier

### Ab Woche 2: Adaptive TDEE (MacroFactor-inspiriert)
```
TDEE = Intake ± ΔWeight (7700 kcal/kg)
Smoothing: Exponential Moving Average (α = 0.3)
Cross-Module Korrekturen: Training Load + Recovery Score
```

### Wöchentliche Auto-Adjustments
| Situation | Aktion |
|---|---|
| FAT_LOSS: kein Gewichtsverlust trotz >85% Compliance | −100 kcal |
| FAT_LOSS: Verlust >1.0 kg/Woche | +150 kcal |
| LEAN_BULK: Gewichtszunahme >0.75 kg/Woche | −100 kcal |
| LEAN_BULK: keine Zunahme trotz >85% Compliance | +100 kcal |
| Kraftverlust >10% | +20g Protein |

---

## 6. Cross-Module Progress Tracking

Alle Module liefern täglich Contribution Scores → Goals aggregiert zu Overall Goal Progress.

### Beispiel: "8kg Muskelaufbau in 6 Monaten"
```
Nutrition:   Protein-Compliance 92% → +15 Progress Points
Training:    Volume +12% MoM     → +20 Progress Points
Recovery:    Avg Score 78        → +10 Progress Points
Supplements: Compliance 88%      → +5 Progress Points
Medical:     Testosterone 620    → +5 Progress Points
─────────────────────────────────────────
Overall Goal Progress: 68% on track
Bottleneck: Schlaf (6.2h avg) limitiert Recovery
```

### Module Contribution Gewichte (je nach Ziel-Typ)

| Goal-Typ | Nutrition | Training | Recovery | Supplements | Medical |
|---|---|---|---|---|---|
| Fat Loss | 40% | 25% | 20% | 10% | 5% |
| Muscle Gain | 30% | 35% | 20% | 10% | 5% |
| Strength | 25% | 40% | 20% | 10% | 5% |
| Health | 25% | 20% | 20% | 15% | 20% |

---

## 7. Body Composition Tracker

Sub-Feature im Goals-Modul. Zwei Tracking-Methoden:

### Klassische Messungen
- Körperfett% (Methoden: Caliper 3/7-Falten, DEXA, BIA, Visuell, Hydrostatisch)
- Muskelmasse = Gewicht × (1 − KF%/100)
- FFMI = Muskelmasse / Größe² + 6.1 × (1.8 − Größe)
- 13 Umfänge: Hals, Schultern, Brust, Oberarm L/R, Unterarm L/R, Taille, Hüfte, Oberschenkel L/R, Wade L/R

### Automatisch berechnete Ratios
- Schulter-Taille-Ratio (Ziel: >1.618 = Goldener Schnitt)
- V-Taper Score
- Arm-Symmetrie %, Bein-Symmetrie %
- Steve Reeves Proportions-Score

### Visual AI (Kamera-basiert)
- 8 IFBB Mandatory Poses
- 4 Quarter Turns (Standard Progress)
- 9 Muscle Close-Ups
- AI-Analyse (Muskel-Scores, Conditioning, Symmetrie)
- Side-by-Side Vergleich + Slider (Vorher/Nachher)

---

## 8. Datenbank-Kern

| Tabelle | Beschreibung |
|---|---|
| `goals.user_goals` | Alle Ziele eines Users |
| `goals.goal_phases` | Aktuelle Phase + Parameter |
| `goals.goal_milestones` | Meilensteine (25/50/75/100%) |
| `goals.goal_contributions` | Täglich von anderen Modulen eingehend |
| `goals.tdee_settings` | Adaptive TDEE + Phase-Parameter |
| `goals.goal_adjustments` | Automatische/manuelle Zielanpassungen |
| `goals.body_measurements` | Körperfett%, Gewicht, Muskelmasse |
| `goals.body_circumferences` | 13 Umfangmessungen |
| `goals.progress_photos` | Foto-Sessions mit Pose-Metadaten |

---

## 9. Cross-Module Verbindungen

| Modul | Was Goals bekommt | Was Goals gibt |
|---|---|---|
| Nutrition | Daily Score, Macro Compliance | TDEE-Ziele, Macro-Targets, Phase |
| Training | Volume Progress, Strength | Training-Frequenz-Empfehlung |
| Recovery | Recovery Score, Readiness | Rest-Day-Empfehlung |
| Supplements | Compliance Score | Phase-basierte Stack-Prioritäten |
| Medical | System Scores, Biomarker | Health Goal Targets |
| Buddy | — | Goal-Status für Empfehlungen |

---

## 10. TDEE Formeln (Fallback)

```typescript
// Harris-Benedict Revised (Onboarding Default)
if (male) return 88.362 + 13.397×weight + 4.799×height − 5.677×age;
if (female) return 447.593 + 9.247×weight + 3.098×height − 4.330×age;

// Activity Multiplier
sedentary: 1.2 | light: 1.375 | moderate: 1.55 | active: 1.725 | very_active: 1.9

// Ab Woche 2: Adaptive via echte Gewichts- + Kaloriendaten
TDEE = (Weekly Intake − ΔWeight × 7700) / 7  → EMA(α=0.3)
```
