# Supplements Module — Supplement Database & Evidence System

## Übersicht

Kuratierte Supplement-Datenbank — kein automatisierter Import aus NIH DSLD oder Open Food Facts.
Alle Einträge wissenschaftlich geprüft, mit korrekten Evidence Grades.

---

## Evidence-System (S bis F)

| Grade | Kriterium | Beispiele |
|---|---|---|
| **S** | Meta-Analysen + 300+ RCTs, konsistente große Effekte | Creatine, Caffeine, Whey, Vitamin D |
| **A** | Mehrere hochwertige RCTs | Omega-3, Magnesium, Zinc, Beta-Alanine, Citrulline |
| **B** | Einige RCTs, moderate Evidenz | Ashwagandha, Melatonin, K2, Collagen, HMB, NAC, CoQ10 |
| **C** | Wenige Studien, gemischte Ergebnisse | Turkesterone, Alpha-GPC, Berberine, Lion's Mane |
| **D** | Anekdotisch / Hype / Tier-Studien | BCAAs (bei ausreichend Protein), CLA, Tribulus |
| **F** | Widerlegt / kein nachweisbarer Effekt | Glutamine (gesunde Athleten), Deer Antler Velvet |

---

## Supplement-Kategorien

| Kategorie | Beispiele |
|---|---|
| Vitamins | D3, K2, C, B12, B6, A, E, Folat, B-Komplex |
| Minerals | Magnesium, Zinc, Iron, Calcium, Potassium, Selenium |
| Performance | Creatine, Beta-Alanine, Citrulline, Caffeine |
| Recovery | Omega-3, Collagen, HMB, Taurine |
| Adaptogens | Ashwagandha, Rhodiola, Lion's Mane, Ginseng |
| Sleep | Melatonin, Glycine, L-Theanine |
| Gut Health | Probiotics, Prebiotics, Digestive Enzymes |
| Longevity | NMN, CoQ10, NAC, Resveratrol, Berberine, Fisetin |
| Amino Acids | EAA, L-Carnitine, L-Tyrosine, Taurine |
| Hormones | DHEA, Pregnenolone (legal, mild) |

---

## Kern-Supplements Seed-Daten

### Tier S

| Name | Dose | Timing | Hauptwirkung |
|---|---|---|---|
| Creatine Monohydrate | 3–5g/Tag | Jederzeit | Kraft ↑, Muskelmasse ↑, Recovery ↑ |
| Vitamin D3 | 2.000–5.000 IU | Morgens mit Fett | Knochen, Immunsystem, Hormone |
| Caffeine | 100–400mg | 30–60min Pre-WO | Performance ↑, Fokus ↑ |
| Whey Protein | 20–40g | Post-Workout | Muskelproteinsynthese ↑ |

### Tier A

| Name | Dose | Timing | Hauptwirkung |
|---|---|---|---|
| Omega-3 (EPA+DHA) | 1–3g/Tag | Mit Mahlzeit | Anti-Inflammation, Recovery |
| Magnesium Glycinat | 200–400mg | Abends | Sleep ↑, Recovery ↑, Krämpfe ↓ |
| Zinc Bisglycinate | 15–30mg | Mit Mahlzeit | Testosteron, Immunsystem |
| Beta-Alanine | 3.2–6.4g | Täglich (split) | Ausdauer ↑ (Carnosin) |
| Citrulline Malate | 6–8g | Pre-Workout | Pump ↑, Fatigue ↓ |
| Vitamin K2 (MK-7) | 100–200µg | Mit Vitamin D | Calcium-Routing |

### Tier B

| Name | Dose | Timing | Hauptwirkung |
|---|---|---|---|
| Ashwagandha KSM-66 | 300–600mg | Morgens/Abends | Cortisol ↓, Stress ↓ |
| Melatonin | 0.5–3mg | 30min vor Schlaf | Sleep Onset ↑ |
| Collagen Typ I+III | 10–15g | Morgens | Gelenke, Sehnen, Haut |
| HMB | 3g (3×1g) | Split | Anti-Katabolismus |
| NAC | 600–1200mg | Täglich | Glutathion ↑, Leber |
| CoQ10 | 100–300mg | Mit Fett | Mitochondrien, Herz |

---

## Enhanced Mode Taxonomy

### 10 Kategorien (~85 Compounds)

| Kategorie | Anzahl | Beispiele |
|---|---|---|
| AAS Testosterone Esters | ~8 | Test E, Test C, Test P, Nebido, Sustanon |
| Oral AAS | ~10 | Dianabol, Anavar, Winstrol, Anadrol |
| Injectable AAS | ~12 | Deca, Tren A/E, Boldenone, Masteron, Primo |
| SARMs | ~8 | Ostarine, LGD-4033, RAD-140, MK-677 |
| Performance Peptides | ~15 | BPC-157, TB-500, CJC-1295, Ipamorelin |
| GLP-1 Agonists | ~5 | Semaglutide, Tirzepatide, Liraglutide |
| Growth Hormone | ~5 | Somatropin, Genotropin, Norditropin |
| PCT Compounds | ~6 | Clomid, Nolvadex, hCG, Enclomiphene |
| Aromatase Inhibitors | ~4 | Anastrozole, Letrozole, Exemestane |
| Support Supplements | ~12 | TUDCA, NAC, Milk Thistle, CoQ10, Hawthorn |

---

## Kern-Interactions Seed-Daten

### Konflikte / Warnungen

| S1 | S2 | Typ | Severity | Empfehlung |
|---|---|---|---|---|
| Calcium | Iron | absorption | warning | separate_2h |
| Zinc | Copper | absorption | caution | supplement_both |
| Caffeine | Melatonin | conflict | warning | separate_8h |
| St. John's Wort | SSRIs | contraindication | **critical** | BLOCK |
| St. John's Wort | Birth Control | contraindication | **critical** | BLOCK |
| Warfarin | Omega-3 | contraindication | **critical** | BLOCK |
| Warfarin | Vitamin K2 | contraindication | **critical** | BLOCK |

### Synergien ✅

| S1 | S2 | Effekt |
|---|---|---|
| Vitamin D3 | Vitamin K2 | K2 leitet Calcium zu Knochen |
| Vitamin C | Iron | Aufnahme ×2–3 |
| Magnesium | Vitamin D3 | Mg aktiviert Vitamin D |
| Creatine | Beta-Alanine | Komplementäre Wirkmechanismen |

---

## Timing-Regeln

| Regel | Timing | Begründung |
|---|---|---|
| Fettlösliche Vitamine (A/D/E/K) | Mit fettreicher Mahlzeit | Fett nötig für Absorption |
| Iron | Nüchtern / 2h nach Mahlzeit | Optimale Aufnahme |
| Calcium | >2h Abstand zu Iron | Transporter-Konkurrenz |
| Magnesium Glycinat | Abends | Relaxation + Sleep benefit |
| Caffeine | Cutoff 14–16 Uhr | Sleep nicht stören |
| Probiotics | Morgens nüchtern | pH-Optimum |
| Creatine | Jederzeit | Saturationseffekt |

---

## BLS-Code Mapping für Gap Analysis

```typescript
// Nährstoffmangel → Supplement-Empfehlung
const NUTRIENT_TO_SUPPLEMENT = {
  'VITD':   ['Vitamin D3'],
  'FAPUN3': ['Omega-3'],
  'MG':     ['Magnesium Glycinate'],
  'ZN':     ['Zinc Bisglycinate'],
  'FE':     ['Iron'],
  'VITB12': ['Vitamin B12'],
  'VITC':   ['Vitamin C'],
  'VITK':   ['Vitamin K2 MK-7'],
};
```

---

## Import-Dateistruktur

```
src/import/supplements/
  01_seed_catalog.sql       Standard Supplements (S/A/B/C/D)
  02_seed_enhanced.sql      Enhanced Substances (~85)
  03_seed_interactions.sql  Conflicts + Synergies
  04_seed_templates.sql     Goal-Based Templates
  05_verify.sql
  run_all.sh
```
