# Supplements Module — Strategie & Markt

## Markt-Landscape

**8 Apps analysiert** — 4 Archetypen: Scanner+Stack (SuppCo, SuppTrack), AI Timing (Supplements AI), Biomarker+Correlation (Staqc, Bearable), Medical Reminder (MyTherapy, CareClinic)

**Supplement-Markt:** $177B global (2025), 9% CAGR

| App | Downloads | Stärke | Schwäche |
|---|---|---|---|
| **MyTherapy** | 10M+ | Beste Medication Reminder UX | Medication-fokussiert, keine Supplements Intelligence |
| **SuppCo** | 160K+ Products | Größte Supplement DB | Keine Nutrition/Training, basic UX |
| **Supplements AI** | — | AI-basierte Timing-Optimierung | Keine Food/Training Integration |
| **Staqc** | 200K+ | Biomarker + Supplement Correlation | Kleine DB, kein Nutrition/Training |
| **Bearable** | 200K+ | Beste "What affects what?" UX | Kein Supplement-Fokus |

---

## Kritische Markt-Lücken

1. **KEINE App weiß was du ISST** — kein Supplement-Tracker kennt deinen Food Log
2. **KEINE App kennt dein Training** — "Leg Day → anderer Pre/Post Stack" unmöglich ohne Integration
3. **Redundancy Detection existiert NIRGENDWO** — "3 Supplements enthalten Magnesium" = niemand erkennt das
4. **Timing-Optimierung ist isoliert** — Supplements AI kann Timing berechnen, kennt aber deine Mahlzeiten nicht
5. **Keine App verbindet Supplements mit Bloodwork** — "Wirkt mein Vitamin D?" nur via Bluttest nachvollziehbar

---

## User Personas

### Mike — Gym Bro Stack Builder (35%)
- **Profil:** 25J, nimmt 5–8 Supplements, gibt $80+/mo aus
- **Pain:** Unsicher ob alles nötig ist, Timing verwirrend, Reddit widersprüchlich
- **Needs:** Stack Manager, Training-Aware Timing, Redundancy Check, Cost Overview
- **Zahlungsbereitschaft:** $9.99/mo

### Sandra — Health-Conscious Woman (25%)
- **Profil:** 35J, nimmt Vitamin D, Iron, B12, Magnesium, Probiotik
- **Pain:** Arzt sagt "nimm Eisen" aber nicht wann/wie/mit was
- **Needs:** Timing Optimizer, Meal-based Timing, Interaction Warnings
- **Zahlungsbereitschaft:** $9.99/mo

### Dr. Thomas — Biohacker/Longevity (20%)
- **Profil:** 45J, nimmt 15+ Supplements, gibt $300+/mo aus
- **Pain:** Komplexe Interactions bei 15+ Supps, will Daten nicht Meinungen
- **Needs:** Full Interaction Matrix, Evidence Grades, Bloodwork Integration
- **Zahlungsbereitschaft:** $19.99/mo

### Anna — Casual Vitamin Taker (20%)
- **Profil:** 28J, nimmt Multivitamin + Vitamin D + manchmal Magnesium
- **Pain:** Vergisst Supplements, weiß nicht ob Multivitamin reicht
- **Needs:** Simple Reminders, Nutrition Gap Check, Basic Stack
- **Zahlungsbereitschaft:** Free / $4.99/mo

---

## Lumeos USPs

### Primary USP: Gap Analysis aus echtem Food Log
Kein Competitor kann das:
"Dir fehlen 4.000 IU Vitamin D pro Tag (nur 600 IU aus deinem heutigen Food Log)"

Mitbewerber schätzen Deficiencies aus Lifestyle-Quiz.
LumeOS **berechnet** sie aus 138 BLS-Mikronährstoffen des täglichen Food Logs. 10× genauer.

### Secondary USPs

1. **Training-Aware Timing** — "Leg Day → Creatine + Beta-Alanine Pre, Magnesium Post"
2. **Redundancy Detection** — "3 Supplements → 226% RDA Magnesium → spare $20/mo"
3. **Evidence Grades (S/A/B/C/D/F)** — Transparent wer was behauptet
4. **Interaction Checker** — Regelbasiert, deterministisch, critical = BLOCK
5. **nutrients_provided mit BLS-Codes** — Echte Mikronährstoff-Summierung

---

## Kompetitive Positionierung

| Feature | SuppCo | Supplements AI | Staqc | **LumeOS** |
|---|:---:|:---:|:---:|:---:|
| Evidence Grades | ❌ | ❌ | ❌ | ✅ S/A/B/C/D/F |
| Gap Analysis | ❌ | 🟡 Quiz | ❌ | ✅ Echter Food Log |
| Redundancy Detection | ❌ | ❌ | ❌ | ✅ |
| Training-Aware Timing | ❌ | ❌ | ❌ | ✅ |
| Interaction Checker | 🟡 | ❌ | ❌ | ✅ Critical = BLOCK |
| Bloodwork Correlation | ❌ | ❌ | ✅ (Best) | ✅ |
| Enhanced Mode (PEDs) | ❌ | ❌ | ❌ | ✅ |

---

## Key Design-Entscheidungen

| Entscheidung | Rationale |
|---|---|
| Kuratierte DB statt NIH DSLD | Kontrolle über Evidence Grades, keine Datenmüll-Imports |
| Evidence Grade S bis F | Transparenz — nicht alle Supplements sind gleich |
| Nur 1 aktiver Stack | Vereinfacht Daily Tracking massiv |
| Standard/Enhanced hard-separated | Rechtlich + UX — kein versehentliches Sehen |
| Interaction Checker regelbasiert | Kein AI-Feeling, deterministisch, Critical = BLOCK |
| nutrients_provided mit BLS-Codes | Basis für echte Mikronährstoff-Gap-Analysis |
| Evidence-gewichteter Score | Vergessenes Creatine (S) = mehr Malus als Glutamin (D) |
