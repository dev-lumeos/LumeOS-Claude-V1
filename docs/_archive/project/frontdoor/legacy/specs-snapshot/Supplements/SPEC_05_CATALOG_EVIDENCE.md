# Supplements Module — Supplement Catalog & Evidence System
> Spec Phase 5 | Klassifikation, Evidence-Grades, Seed-Daten

---

## 1. Supplement-Kategorien (Standard)

| Kategorie | Slug | Deutsch | Beispiele |
|---|---|---|---|
| Vitamins | vitamins | Vitamine | D3, K2, C, B12, B6, B-Komplex, A, E, Folat |
| Minerals | minerals | Mineralstoffe | Magnesium, Zinc, Iron, Calcium, Potassium, Selenium |
| Performance | performance | Performance | Creatine, Beta-Alanine, Citrulline, Caffeine, Pre-WO |
| Recovery | recovery | Recovery | Omega-3, Collagen, HMB, Taurine, Glutamine |
| Adaptogens | adaptogens | Adaptogene | Ashwagandha, Rhodiola, Ginseng, Lion's Mane |
| Sleep | sleep | Schlaf | Melatonin, Glycine, L-Theanine, GABA, Magnesium |
| Gut Health | gut_health | Darm | Probiotics, Prebiotics, Digestive Enzymes, Psyllium |
| Longevity | longevity | Longevity | NMN, CoQ10, NAC, Resveratrol, Berberine, Fisetin |
| Amino Acids | amino_acids | Aminosäuren | EAA, BCAA, L-Carnitine, L-Tyrosine, Taurine |
| Hormones | hormones | Hormone | DHEA, Pregnenolone (legal, mild) |
| Other | other | Sonstiges | Electrolytes, Creatine HCl, Caffeine + L-Theanine |

---

## 2. Evidence-System — Vollständige Seed-Daten

### Tier S (★★★★★) — Stärkste Evidenz

| Name | Dose | Timing | Primary Effect |
|---|---|---|---|
| Creatine Monohydrate | 3–5g täglich | Jederzeit | Kraft ↑, Muskelmasse ↑, Recovery ↑ |
| Whey Protein | 20–40g/Serving | Post-Workout | Muskelproteinsynthese ↑ |
| Caffeine | 3–6mg/kg (max 400mg) | 30–60min Pre-WO | Performance ↑, Ausdauer ↑, Fokus ↑ |
| Vitamin D3 | 2.000–5.000 IU täglich | Mit Fett | Knochen, Immunsystem, Hormonsystem |

### Tier A (★★★★) — Gute Evidenz

| Name | Dose | Timing | Primary Effect |
|---|---|---|---|
| Omega-3 (EPA+DHA) | 1–3g täglich | Mit Mahlzeit | Anti-Inflammation, Recovery, Herz |
| Magnesium (Glycinat/Malat) | 200–400mg | Abends | Sleep ↑, Recovery ↑, Krämpfe ↓ |
| Zinc | 15–30mg | Mit Mahlzeit | Testosteron, Immunsystem |
| Beta-Alanine | 3.2–6.4g täglich | Täglich (chronic loading) | Ausdauer ↑ (Carnosin-Puffer) |
| Citrulline Malate | 6–8g | 30–60min Pre-WO | Pump ↑, Ausdauer ↑, Fatigue ↓ |
| Electrolytes (Na+K+Mg) | Variabel | During Training | Hydration, Performance |
| Vitamin K2 (MK-7) | 100–200µg | Mit Vitamin D + Fett | Calcium-Routing → Knochen |

### Tier B (★★★) — Moderate Evidenz

| Name | Dose | Timing | Primary Effect |
|---|---|---|---|
| Ashwagandha (KSM-66) | 300–600mg | Morgens oder abends | Cortisol ↓, Testosteron ↑, Stress ↓ |
| Melatonin | 0.5–3mg | 30–60min vor Schlaf | Sleep Onset ↑ |
| Probiotics | CFU-abhängig | Morgens nüchtern | Gut Health, Immunsystem |
| Collagen (Typ I/II) | 10–15g | Morgens oder Pre-WO | Gelenke, Sehnen, Haut |
| HMB (β-Hydroxy β-Methylbutyrat) | 3g täglich | Split 3×1g | Anti-Katabolismus |
| Taurine | 1–3g | Pre-Workout | Ausdauer ↑, Antioxidant |
| Berberine | 500mg 2–3x täglich | Vor Mahlzeit | Blutzucker ↓, Lipide ↓ |
| CoQ10 | 100–300mg | Mit Fett | Herzgesundheit, Energie |
| NAC (N-Acetyl Cysteine) | 600–1200mg | Mit oder ohne Mahlzeit | Antioxidant, Leber, Atemwege |
| Rhodiola Rosea | 200–400mg | Morgens | Stress ↓, Kognition ↑ |

### Tier C (★★) — Begrenzte/gemischte Evidenz

| Name | Dose | Notes |
|---|---|---|
| Turkesterone | 500mg | Wenige Humanstudien, Hype > Evidenz |
| Tongkat Ali | 200–400mg | Einige positive Studien zu Testosteron |
| Boron | 3–10mg | Kleine Studien, vielversprechend |
| Alpha-GPC | 300–600mg | Moderate Evidenz für Power Output |
| Lion's Mane | 500–1000mg | Kognitive Funktion, NGF |
| NMN | 250–500mg | Longevity-Marker, wenige Humanstudien |
| Fisetin | 100–500mg | Senolytisch, Tierstudien gut |

### Tier D (★) — Wenig/keine Evidenz (Hype)

| Name | Claim | Realität |
|---|---|---|
| BCAAs | Muskelaufbau | Überflüssig bei ausreichend Gesamtprotein |
| Glutamine | Recovery | Kein Benefit bei gesunden Athleten |
| CLA | Fat Loss | Minimaler Effekt, teuer |
| Tribulus | Testosteron | Kein Effekt in Humanstudien |

---

## 3. Supplement-Interaktionen Seed-Daten

### Konflikte & Warnungen

| Supplement 1 | Supplement 2 | Typ | Severity | Empfehlung |
|---|---|---|---|---|
| Calcium | Iron | absorption | warning | separate_2h |
| Zinc | Copper | absorption | caution | supplement_both |
| Zinc | Iron | absorption | caution | different_times |
| Magnesium | Zinc | absorption | caution | different_times |
| Caffeine | Melatonin | conflict | high | separate_8h |
| St. John's Wort | SSRIs | contraindication | critical | BLOCK |
| St. John's Wort | Birth Control Pills | contraindication | critical | BLOCK |
| Blood Thinners (Warfarin) | Omega-3 | contraindication | critical | BLOCK |
| Blood Thinners (Warfarin) | Vitamin K2 | contraindication | critical | BLOCK |
| Vitamin A | Accutane (Isotretinoin) | contraindication | critical | BLOCK |
| High-dose Iron | Tea/Coffee | absorption | caution | separate_2h |

### Synergien ✅

| Supplement 1 | Supplement 2 | Typ | Note |
|---|---|---|---|
| Vitamin D3 | Vitamin K2 | synergy | K2 leitet Calcium zu Knochen |
| Vitamin C | Iron | synergy | C erhöht Eisenaufnahme 2–3× |
| Creatine | Beta-Alanine | synergy | Gut kombinierbar für Performance |
| Magnesium | Vitamin D | synergy | Mg aktiviert Vitamin D |
| Ashwagandha | Magnesium | synergy | Kombinierter Stress-Reduktions-Effekt |

---

## 4. Goal-Based Stack Empfehlungen (System-Templates)

### Template: Muskelaufbau (muscle_building)
```
MUST (Evidence S/A):
  Creatine Monohydrate  5g    täglich
  Vitamin D3            3000 IU morgens mit Fett
  Omega-3               2g    täglich mit Mahlzeit
  Magnesium Glycinat    400mg abends

GOOD (Evidence A/B):
  Zinc                  15mg  täglich mit Mahlzeit
  Collagen              10g   morgens oder pre_workout
  Ashwagandha KSM-66    600mg morgens

NICE (Evidence B/C):
  Citrulline Malate     6g    pre_workout
  Beta-Alanine          3.2g  täglich

Monatl. Kosten: ca. €40–60
```

### Template: Fat Loss (fat_loss)
```
MUST:
  Caffeine              200mg  pre_workout (falls nicht aus Kaffee)
  Creatine Monohydrate  5g     täglich (Muskelerhalt)
  Vitamin D3            3000IU morgens
  Omega-3               2g     täglich

GOOD:
  Magnesium             400mg  abends
  HMB                   3g     split 3×1g

NICE:
  Electrolytes          bei Low-Carb
  Berberine             500mg  vor Mahlzeiten

Monatl. Kosten: ca. €35–50
```

### Template: Recovery & Sleep (recovery_sleep)
```
MUST:
  Magnesium Glycinat    400mg  abends
  Omega-3               2g     täglich

GOOD:
  Melatonin             1mg    30min vor Schlaf (bei Bedarf)
  Glycine               3g     abends/bedtime
  Vitamin D3            3000IU morgens

NICE:
  Ashwagandha           300mg  abends
  Collagen              10g    morgens
  Taurine               2g     abends

Monatl. Kosten: ca. €25–40
```

### Template: Daily Health Basics (health)
```
MUST:
  Vitamin D3            2000IU morgens
  Omega-3               1g     täglich
  Magnesium             200mg  abends

GOOD:
  Vitamin K2 MK-7       100µg  mit Vitamin D
  Probiotics            variabel morgens nüchtern
  Zinc                  10mg   täglich

Monatl. Kosten: ca. €20–35
```

### Template: Longevity (longevity)
```
MUST:
  Vitamin D3            3000IU morgens mit Fett
  Omega-3               2g     täglich
  Magnesium             400mg  abends

GOOD:
  Vitamin K2 MK-7       200µg  mit Vitamin D
  Collagen              10g    morgens
  Probiotics            CFU    morgens nüchtern
  CoQ10                 200mg  mit Fett

NICE:
  Berberine             500mg  vor Mahlzeiten
  NAC                   600mg  täglich
  NMN                   300mg  morgens
  Fisetin               100mg  täglich

Monatl. Kosten: ca. €50–70
```

---

## 5. Timing-Regeln (Absorption-Optimierung)

| Regel | Timing | Begründung |
|---|---|---|
| Fettlösliche Vitamine (A,D,E,K) | Mit fettreicher Mahlzeit | Fett nötig für Absorption |
| Iron | Nüchtern morgens oder 2h nach Mahlzeit | Leere Magenumgebung optimal |
| Iron | + Vitamin C gleichzeitig | C erhöht Aufnahme |
| Calcium | Mindestens 2h Abstand zu Iron | Konkurriert um Transporter |
| Magnesium (Glycinat) | Abends | Relaxation-Effekt, sleep benefit |
| Caffeine | Cutoff 14–16 Uhr (oder nach Bedarf) | Sleep nicht stören |
| Melatonin | 30–60min vor Schlaf | Optimales Timing |
| Probiotics | Morgens nüchtern | pH-Optimum für Überleben |
| Creatine | Jederzeit (Timing egal) | Saturationseffekt |
| Beta-Alanine | Split über den Tag | Kribbeln (Parästhesie) reduzieren |
| Whey Protein | Post-Workout oder als Mahlzeit | Schnelle Absorption |
| Ashwagandha | Mit Mahlzeit | Magenverträglichkeit |
| Zinc | Mit Mahlzeit, nicht nüchtern | Magenverträglichkeit |

---

## 6. Nutrient-Code Mapping (für Gap Analysis)

```typescript
// BLS-Codes → Supplement Names Mapping
// Basis für Gap Analysis: welcher BLS-Mangel → welches Supplement?
const NUTRIENT_TO_SUPPLEMENT: Record<string, string[]> = {
  'VITD':   ['Vitamin D3', 'Vitamin D2'],
  'FAPUN3': ['Omega-3', 'Fish Oil', 'Krill Oil', 'Flaxseed Oil'],
  'MG':     ['Magnesium Glycinate', 'Magnesium Malate', 'Magnesium Citrate'],
  'ZN':     ['Zinc', 'Zinc Bisglycinate', 'ZMA'],
  'FE':     ['Iron', 'Ferrous Bisglycinate', 'Ferric Pyrophosphate'],
  'CA':     ['Calcium', 'Calcium Carbonate', 'Calcium Citrate'],
  'VITB12': ['Vitamin B12', 'Methylcobalamin', 'Adenosylcobalamin'],
  'FOL':    ['Folate', 'Methylfolate', 'Folic Acid'],
  'VITC':   ['Vitamin C', 'Ascorbic Acid'],
  'VITK':   ['Vitamin K2 MK-7', 'Vitamin K1'],
  'ID':     ['Iodine', 'Potassium Iodide'],
  'CU':     ['Copper', 'Copper Bisglycinate'],
  'SE':     ['Selenium', 'Selenomethionine'],
};
```
