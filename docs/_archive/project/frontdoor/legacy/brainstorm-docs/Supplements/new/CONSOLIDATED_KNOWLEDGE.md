# Supplements Module — Konsolidiertes Wissen
> Konsolidiert aus 22 Alt-Dokumenten | 2026-04-15
> Quellen: 04_MODULE_SUPPLEMENTS.md, supplement-evidence-tiers.md,
> compound-taxonomy.md, supplements_DATABASE.md, supplements_FEATURES.md,
> supplements_RULES.md, supplements_RISKS.md, supplements_PROTOCOLS.md,
> supplements_VISION.md, lumeos-supplement-strategy.md, suppmod_PROJECT_STATUS.md,
> supplements_API.md, supplement-channels.md, suppmod_PRD.md, u.v.m.

---

## 1. Zweck & Status

Port 5300. Verwaltet Supplement-Stacks, Intake-Tracking, Interaction-Checking
und zielbasierte Empfehlungen. Unterstützt normale Supplements UND Enhanced Mode (PEDs)
mit strikt separierter Datenhaltung.

**Status (2026-02-23):** PRD drafted, M1 Backend in Arbeit (Agent Session läuft).
Logic fehlt noch komplett — Route existiert, UI/Actions fehlen.

---

## 2. Zwei Modi (Hard-Separated)

### Standard Mode (Default)
Normale Supplements: Vitamine, Mineralstoffe, Performance, Recovery, Longevity.
Sichtbar für alle User ohne Aktivierung.

### Enhanced Mode (PED — Opt-In)
Performance-Enhancing Drugs: AAS, SARMs, Peptide, GH, AI, SERM, PCT, GLP-1.
Nur nach expliziter User-Aktivierung sichtbar.
**Strikte UX-Trennung:** kein Vermischen in Default-Flows.
Separate Datenhaltung (enhanced_substances Tabelle).

---

## 3. Evidence-Grading System (Tier S bis F)

| Tier | Evidenz | Beispiele |
|---|---|---|
| S (★★★★★) | Meta-Analysen + RCTs, 300+ Studien | Creatine, Whey, Caffeine, Vitamin D |
| A (★★★★) | Mehrere hochwertige RCTs | Omega-3, Magnesium, Zinc, Beta-Alanine, Citrulline |
| B (★★★) | Einige RCTs, konsistent | Ashwagandha, Melatonin, K2, Probiotics, Collagen, HMB |
| C (★★) | Wenige Studien, gemischt | Turkesterone, Tongkat Ali, Boron, Alpha-GPC, Berberine |
| D (★) | Wenig/keine Evidenz, Hype | BCAAs (bei ausreichend Protein), Glutamine, CLA, Tribulus |
| F | Widerlegt | Deer Antler Velvet, BCAAs (überflüssig) |

---

## 4. Supplement-Kategorien

### Standard Supplements
| Kategorie | Beispiele |
|---|---|
| Vitamins | D3, K2, C, B-Komplex, A, E |
| Minerals | Magnesium, Zinc, Iron, Calcium, Potassium |
| Performance | Creatine, Beta-Alanine, Citrulline, Caffeine |
| Recovery | Omega-3, Collagen, HMB, Taurine |
| Hormones | DHEA, Pregnenolone (legal, mild) |
| Adaptogens | Ashwagandha, Rhodiola, Lion's Mane |
| Sleep | Melatonin, Glycine, L-Theanine |
| Gut Health | Probiotics, Prebiotics, Digestive Enzymes |
| Longevity | NMN, CoQ10, NAC, Resveratrol, Berberine |
| Amino Acids | EAA, L-Glutamine, L-Carnitine, Taurine |

### Enhanced Substances (~85 Compounds)
1. Testosterone Esters (~8): Test E, Test C, Test P, Nebido, Sustanon
2. Oral AAS (~10): Dianabol, Anavar, Winstrol, Anadrol, Turinabol
3. Injectable AAS (~12): Deca, NPP, Tren A/E, Boldenone, Masteron, Primo
4. SARMs (~8): Ostarine, LGD-4033, RAD-140, YK-11, MK-677, Cardarine
5. Performance Peptides (~15): BPC-157, TB-500, CJC-1295, Ipamorelin, GHRP-6
6. GLP-1 Agonists (~5): Semaglutide, Tirzepatide, Liraglutide
7. Growth Hormone (~5): Somatropin, Genotropin, Norditropin, Omnitrope
8. PCT Compounds (~6): Clomid, Nolvadex, hCG, Enclomiphene, Raloxifene
9. Aromatase Inhibitors (~4): Anastrozole, Letrozole, Exemestane, Formestane
10. Support Supplements (~12): TUDCA, NAC, Milk Thistle, CoQ10, Hawthorn Berry

---

## 5. Stack-System

- **Mehrere Stacks pro User** (z.B. "Daily", "Bulk Stack", "Cut Stack")
- **Nur 1 Stack gleichzeitig aktiv** → vereinfacht Daily Tracking
- **Stack-Aktivierung** deaktiviert automatisch alle anderen
- **Quellen:** user-created | coach-assigned | marketplace | template
- **Items** haben: Supplement, Dosis, Timing, Frequenz, Cycling, Custom-Name, Sort-Order

### Timing-Slots
morning | midday | evening | pre_workout | post_workout | bedtime

### Frequenz-Optionen
daily | weekdays | training_days | custom | cycling (On/Off-Wochen)

---

## 6. Intelligence Engine (Cross-Module — Kern-USP)

### Gap Analysis (Nutrition → Supplements)
Food Log → Mikronährstoff-Totals (aus BLS 138-Nährstoffe) → RDA Comparison
→ "Dir fehlen 4.000 IU Vitamin D (nur 600 IU aus Food Log heute)"
→ "Empfehlung: Vitamin D3 4.000 IU Supplement"

### Redundancy Detection
Stack → Ingredient Overlap Analysis
→ "3 deiner Supplements enthalten Magnesium → 900mg = 225% RDA"
→ Spare $20/mo

### Training-Aware Stacks
Today's Workout-Typ → Pre/Post/Intra Stack anpassen
→ "Leg Day → Pre: Creatine 5g + Beta-Alanine 3.2g + Caffeine 200mg"
→ "Rest Day → Skip Pre-Workout, keep Vitamin D + Fish Oil"

### Meal-Based Timing Optimizer
Meal Schedule → Supplement Timing Optimization
→ "Vitamin D → Mittagessen (Fett nötig)"
→ "Iron → Nüchtern morgens"
→ "Calcium + Iron → 2h Abstand!"

### Effectiveness Tracking (via Medical)
Supplement Log + Bloodwork Over Time
→ "Vitamin D: 18 → 52 ng/mL in 3 Monaten ✅"

### Cost Optimizer
→ Monthly Stack Kosten berechnen
→ Redundancy-Removal Savings zeigen
→ Affiliate-Link zu günstigsten Quellen

---

## 7. Interaction System

### Interaction-Typen
| Typ | Beschreibung |
|---|---|
| synergy | Positive Kombination (Vitamin D + K2, Vitamin C + Iron) |
| absorption | Einer beeinflusst Aufnahme des anderen |
| conflict | Konkurrieren um Absorption (Calcium + Iron) |
| timing | Müssen zeitlich getrennt werden |
| contraindication | Kombination vermeiden (St. John's Wort + SSRIs = critical) |

### Severity-Levels
- `info` — neutrale Hinweise
- `caution` — leichte Bedenken
- `warning` — signifikante Issues, Timing-Trennung empfohlen
- `critical` — gefährliche Kombination, BLOCK (Einnahme gesperrt)

### Protokoll bei `critical`
Einnahme wird in UI gesperrt → Pflicht-Alert → User muss explizit bestätigen oder Stack anpassen.

---

## 8. Kern-Interactions (kuratiert)

| Kombination | Typ | Severity | Handlung |
|---|---|---|---|
| Calcium + Iron | conflict | warning | separate_2h |
| Vitamin D + K2 | synergy | info | take_together |
| Vitamin C + Iron | synergy | info | take_together |
| Magnesium + Zinc | absorption | caution | different_times |
| Caffeine + Melatonin | conflict | high | separate_8h |
| Zinc + Copper | absorption | caution | supplement_both |
| St. John's Wort + SSRIs | contraindication | critical | BLOCK |
| St. John's Wort + Birth Control | contraindication | critical | BLOCK |
| Blood thinners + Omega-3 | contraindication | critical | BLOCK |
| Blood thinners + Vitamin K | contraindication | critical | BLOCK |
| Oral AAS + Oral AAS (mehrere) | Enhanced+Enhanced | critical | BLOCK |
| Stimulants + Clenbuterol | Enhanced+Supp | critical | BLOCK |

---

## 9. Goal-Based Stack Presets

### Muskelaufbau
Must: Creatine 5g + Whey 30g Post-WO + Vitamin D 3000IU
Good: Omega-3 2g + Magnesium 400mg + Zinc 15mg
Nice: Citrulline 6g Pre-WO + Ashwagandha 600mg

### Fat Loss
Must: Caffeine 200mg Pre-WO + Creatine 5g + Vitamin D
Good: Omega-3 2g + Magnesium 400mg
Nice: HMB 3g (Anti-Katabolismus) + Electrolytes

### Recovery & Sleep
Must: Magnesium 400mg (abends) + Omega-3 2g
Good: Melatonin 1mg + Glycine 3g
Nice: Ashwagandha 300mg + Collagen 10g

### Longevity
Must: Vitamin D 3000IU + Omega-3 2g + Magnesium 400mg
Good: K2 200μg + Collagen 10g + Probiotics
Nice: Berberine 500mg + CoQ10 200mg + NAC 600mg

---

## 10. Enhanced Mode: Bloodwork Panel (Pflicht)

Pre/Mid/Post Cycle: Total T, Free T, Estradiol (sensitive), LH, FSH, SHBG,
Prolactin, Hematocrit, Hemoglobin, HDL/LDL, Triglycerides, ALT, AST, GGT,
Bilirubin, Creatinine, BUN, eGFR, PSA, Glucose, HbA1c, TSH, IGF-1, hs-CRP.

---

## 11. Cross-Module Verbindungen

| Modul | Verbindung |
|---|---|
| Goals | Compliance Score → Goal Progress |
| Nutrition | nutrients_provided ergänzt Mikro-Tracking (Gap Analysis) |
| Medical | Supplement-Logs für Biomarker-Korrelationen |
| Training | Workout-Typ → Training-Aware Stack Anpassung |
| Marketplace | Supplement-Produkte kaufbar, Affiliate-Links |
| Coach (Buddy) | Stack-Analyse, Defizit-Empfehlungen, Timing-Reminders |

---

## 12. Modul-Grenzen

**Supplements DARF:**
- Stacks verwalten (Standard + Enhanced)
- Intake planen und loggen
- Inventory tracken
- Interaktionen prüfen
- Kosten berechnen

**Supplements DARF NICHT:**
- Blutwerte interpretieren
- Medikamente managen
- Training planen
- Payments abwickeln
