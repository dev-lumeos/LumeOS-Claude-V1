# Goals Module — Strategie & Markt

## Markt-Landscape

**10 Apps analysiert** — 3 Tiers: Dumb Goals (MFP, YAZIO), Adaptive Goals (MacroFactor, Carbon, RP Strength), Psychology-First (Noom $400M+ Revenue)

| App | Preis | Stärke | Schwäche |
|---|---|---|---|
| **MacroFactor** | $72/yr | Beste Adaptive TDEE Engine | Kein Training-Volume, keine anderen Module |
| **Carbon Diet Coach** | $96/yr | Beste Phase Management (Reverse Diet, Prep) | Nur Nutrition, kein Training/Recovery |
| **RP Strength** | $120/yr | Bester Training-AI (MV/MEV/MAV/MRV) | Kein Nutrition/Recovery |
| **Noom** | $240/yr | Psychology/CBT — $400M+ Revenue | Kaum echtes Tracking |
| **MFP/YAZIO** | Free–$80 | Marktführer (MFP 200M User) | Statische Formeln, kein Adaptieren |

---

## Kritische Markt-Lücken

1. **NIEMAND hat Cross-Module Goals** — alle optimieren genau 1 Dimension
2. **Adaptive TDEE existiert isoliert** — MacroFactor lernt aus Daten, kennt aber Training-Volumen nicht
3. **Periodisierung existiert isoliert** — RP Strength hat Feedback-Loop, kennt aber Nutrition/Recovery nicht
4. **Contest Prep isoliert** — Carbon ist Benchmark, hat aber kein Supplement/Bloodwork-Tracking
5. **Psychology-First funktioniert** — Noom beweist: Behavioral Science > Feature-Tiefe

---

## User Personas

### Lena — Weight Loss Seeker (40%)
- **Profil:** 31J, will 10kg abnehmen, MFP-Nutzerin
- **Pain:** Statische 1500 kcal → Metabolismus adaptiert → Plateau nach 4 Wochen
- **Needs:** Adaptive TDEE, Phase Transitions, Nudges
- **Zahlungsbereitschaft:** $9.99/mo

### Kai — Strength Athlete (25%)
- **Profil:** 26J, Powerlifting, Excel für Annual Periodisierung
- **Pain:** Kein Tool plant 12-Monats-Cycle, keine Nutrition-Training Integration
- **Needs:** Strength Goals, Periodization, Lean Bulk Phase
- **Zahlungsbereitschaft:** $9.99/mo

### Nina — Bikini Competitor (15%)
- **Profil:** 28J, Contest Prep
- **Pain:** Carbon versteht Reverse Diet, hat aber kein Training/Supplement Tracking
- **Needs:** Contest Prep, Reverse Diet, Refeed, Peak Week, Supplement Cycling
- **Zahlungsbereitschaft:** $19.99/mo

### Frank — Longevity Optimizer (20%)
- **Profil:** 50J, präventive Gesundheit
- **Pain:** Fitness-Apps für junge Gym-Bros ausgelegt
- **Needs:** Health-based Goals (Biomarker), Muscle Preservation, Long-term Trends
- **Zahlungsbereitschaft:** $19.99/mo

---

## Lumeos USPs

### Primary USP: "Goals That Adapt to Your Entire Life"

MacroFactor passt Kalorien an dein Gewicht an.
**Lumeos passt ALLES an ALLES an:**
- TDEE lernt aus echtem Verbrauch
- Training-Volumen passt sich an Recovery an
- Supplement-Stack ändert sich mit Phase
- Bloodwork informiert Goals (Testosterone fällt → Cut pausieren?)
- Recovery Score limitiert Training-Volumen

Kein Competitor verbindet mehr als 2 dieser Dimensionen.

### Secondary USPs

1. **Adaptive > Static** — "Dein TDEE ist 2.847 kcal (nicht 2.500 wie eine Formel sagt)"
2. **Phase Management** — Fat Loss → Maintenance → Lean Bulk → Contest Prep → Reverse Diet
3. **Cross-Module Goals** — "Squat 150kg" = Training + Nutrition + Sleep + Creatine + Recovery >70%
4. **Body Composition Tracker** — 13 Umfänge + FFMI + Visual AI Poses (kein Competitor)
5. **Expert Annual Plan** — 12-Monats BB Periodisierung (nur Pro)

---

## Key Design-Entscheidungen

| Entscheidung | Rationale |
|---|---|
| Goals = Aggregation Point (nicht Feature) | Tom's Vision: Alle Empfehlungen durch Goals-Lens filtern |
| Adaptive TDEE ab Woche 2 | MacroFactor hat bewiesen: adaptive > Formeln, aber braucht 7–14 Tage Daten |
| Phase Transitions semi-automatisch | System empfiehlt, User bestätigt. Kein Überraschungs-Switch |
| Cross-Module Goals als Pro Feature | Power Feature + Upgrade-Trigger |
| Gewicht = 7-Tage Moving Average | Tägliche Schwankungen frustrieren User. MacroFactor/Happy Scale beweisen: Trend > Tagwert |
| Psychology-Layer (Nudges, Streaks, Milestones) | Noom macht $400M/yr primär mit Psychology |
| Expert Annual Plan nur Pro | Niche für advanced Athletes, hohe Zahlungsbereitschaft |
| Body Comp Tracker mit Visual AI | USP: kein Competitor kombiniert standardisierte Posen + AI + klassische Messungen |
