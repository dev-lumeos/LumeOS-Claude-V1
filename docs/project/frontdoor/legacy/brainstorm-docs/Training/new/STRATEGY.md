# Training Module — Strategie & Markt

## Markt-Landscape

**9 Apps analysiert** — 3 Archetypen: Logging/Notebook (Strong, Hevy), AI Coach (Fitbod, Alpha Progression, RP Hypertrophy, GymStreak), Program Library (Boostcamp, StrongLifts, JEFIT)

**Marktgröße:** $12.12B (2025), 13.4% CAGR

| App | Downloads | Preis | Stärke | Schwäche |
|---|---|---|---|---|
| **Strong** | 10M+ | $5/mo | Speed + Simplicity | 3-Routinen-Limit Free |
| **Hevy** | 11M+ | Free/$10 | Community + Modern UI | Kein AI, Basic Nutrition |
| **Fitbod** | 4M+ | $13/mo | Bester AI Generator | Keine Nutrition-Integration |
| **Alpha Progression** | Niche | $10/mo | Exercise Eval Scores | Nische, kleines Team |
| **RP Hypertrophy** | Niche | $25/mo | Evidence-Based Periodization | Powerlifting-fokussiert |
| **Boostcamp** | 15M+ DL | Free | Quality Coach Programs | Kein Custom Programming |

---

## Kritische Markt-Lücken

1. **KEINE App verbindet Training + Nutrition auf hohem Niveau** — GymStreak versucht es oberflächlich
2. **Strong's 3-Routinen-Limit ist #1 Kritikpunkt** in 200K+ Reviews — massive Opportunity
3. **Exercise Evaluation Scores nur bei Alpha Progression** — kein Competitor hat das kopiert
4. **Feedback-Loop nur bei RP Hypertrophy** — brillant, aber niche
5. **Recovery-Integration fehlt überall** — Fitbod schätzt Muscle Recovery, kennt aber kein Nutrition/HRV

---

## User Personas

### Stefan — Frustrated Strong User (35%)
- **Profil:** 26J, trainiert seit 2 Jahren, nutzt Strong, will unbegrenzte Routinen
- **Pain:** 3-Routinen-Limit bei Strong Free
- **Needs:** Unlimited Routines (FREE), Fast Set Logging, Previous Performance, PR Detection
- **Zahlungsbereitschaft:** $9.99/mo wenn AI/Nutrition gut

### Lara — AI-Curious Intermediate (25%)
- **Profil:** 30J, weiblich, 1 Jahr Erfahrung, will KI-geführte Workouts
- **Pain:** Fitbod generiert langweilige Workouts, kennt ihre Ernährung nicht
- **Needs:** AI Workout Generation, Muscle Recovery Map, Feedback-Loop
- **Zahlungsbereitschaft:** $9.99/mo (günstiger als Fitbod $13/mo)

### Pavel — Evidence-Based Lifter (20%)
- **Profil:** 28J, kennt Mike Israetel, will MV/MAV/MRV tracken
- **Pain:** RP App ist zu Powerlifting-fokussiert, Alpha Progression hat keine Nutrition
- **Needs:** Volume Landmarks, Exercise Eval Scores, Periodization, RPE/RIR
- **Zahlungsbereitschaft:** $9.99–19.99/mo

### Jenny — Social Gym-Goer (20%)
- **Profil:** 22J, will Workouts teilen, Community Challenges
- **Needs:** Workout Feed, Share PRs, Social Features
- **Zahlungsbereitschaft:** Free/$4.99/mo

---

## Lumeos USPs

### Primary USP: "The First Training App That Knows What You Eat, How You Recover, and What Your Body Needs"

Strong weiß was du hebst. Fitbod schätzt deine Recovery.
**LumeOS WEISS:**
- Was du gehoben hast (Sets, Weight, Reps, RPE)
- Was du gegessen hast (138 BLS Mikronährstoffe)
- Wie erholt du bist (HRV, Sleep, Muscle Readiness)
- Was dein Ziel ist (Lean Bulk → MAV-Training, Kalorienüberschuss)

### Secondary USPs

1. **Unlimited Free Routines** — Strong's #1 Kritikpunkt eliminiert
2. **Exercise Evaluation Scores (0–100)** — SFR + Mechanical Tension + EMG, kein Competitor außer Alpha hat das
3. **Feedback-Loop** (Pump/Soreness → personalisierte Volume Landmarks)
4. **1.200+ Exercises** mit Male+Female Bildern, DE/EN/TH, Instructions+Tips
5. **All 3 Modes** — Log + AI + Coach Programs in einer App

---

## Kompetitive Positionierung

| Kriterium | Strong | Hevy | Fitbod | RP | **LumeOS** |
|---|:---:|:---:|:---:|:---:|:---:|
| Free Unlimited Routines | ❌ (3 max) | ✅ | ❌ | ❌ | ✅ |
| Exercise Library | 300+ | 400+ | 600+ | 300+ | **1.200+** |
| Male+Female Bilder | ❌ | ❌ | ❌ | ❌ | ✅ |
| DE/EN/TH | ❌ | ❌ | ❌ | ❌ | ✅ |
| Exercise Eval Scores | ❌ | ❌ | ❌ | ❌ | ✅ |
| Feedback-Loop | ❌ | ❌ | ❌ | ✅ (Best) | ✅ |
| Volume Landmarks | ❌ | ❌ | ❌ | ✅ | ✅ |
| Nutrition Integration | ❌ | ❌ | ❌ | ❌ | ✅ (Deep) |
| Recovery Integration | ❌ | ❌ | 🟡 | ❌ | ✅ |
| **Preis** | $5/mo | Free | $13/mo | $25/mo | **$9.99/mo** |

---

## Key Design-Entscheidungen

| Entscheidung | Rationale |
|---|---|
| Keine Custom Exercises | 1.200+ reichen für alle Gym-Use-Cases |
| Speed-First Set-Logging (<3s) | Strong's Erfolg basiert auf Speed — Logging zwischen Sets |
| Unlimited Routines (Free) | Strong's #1 Kritikpunkt → sofortiger Differenzierungsvorteil |
| 5 Progression Models | Linear für Beginner bis DUP für Advanced |
| Exercise Evaluation Scores | Alpha Progression hat das erfunden, niemand kopiert |
| Feedback-Loop (Pump/Soreness) | RP-Konzept zugänglich für alle, nicht nur Powerlifter |
| Schema `training` isoliert | Domain-Isolation, kein Cross-Schema-Join |
| Cloudflare R2 für Media | S3-kompatibel, ~15 GB Images + Videos |
