// Die Daten der vier Spec-Tabs (G-45).
//
// QUELLE: theme-v1/module-supplements-spec.jsx
//   EVIDENCE_GRADES       Zeile   5-12   (sechs Evidenzstufen S-F)
//   CATALOG               Zeile  17-174  (44 Katalogeintraege)
//   ENHANCED_CATEGORIES   Zeile 176
//   BLOODWORK_PANEL       Zeile 179-188
//   STACK_TEMPLATES       Zeile 191-197
//   USER_STACKS           Zeile 199-204
//   FREQUENCY_OPTIONS     Zeile 206-212
//   INTERACTION_DB        Zeile 215-223
//   SEVERITY_META         Zeile 224-229
//   TIMING_LABEL          Zeile 230-233
//   INVENTORY             Zeile 236-245
//
// `[cmd]` MECHANISCH UEBERNOMMEN, nicht abgetippt — 226 Zeilen.
// Geaendert wurde nur `const` -> `export const`.
//
// **Die Typen stehen bewusst locker.** Die Vorlage fuehrt je Eintrag
// unterschiedliche Felder (ein Standard-Supplement hat kein
// `halfLife`, ein Peptid keinen `cost_per_serving`); ein strenger Typ
// haette bedeutet, die Daten zu begradigen. `[read]` Der Auftrag sagt
// ausdruecklich: uebernehmen wie es ist, nicht begradigen.
/* eslint-disable */

export type KatalogEintrag = {
  id: string
  name: string
  name_de?: string
  mode: 'standard' | 'enhanced'
  cat: string
  grade: string
  timing?: string[]
  dose?: string
  cost_per_serving?: number
  [k: string]: unknown
}

export type EvidenzStufe = { g: string; c: string; crit: string; ex: string; w: number }

export const EVIDENCE_GRADES: EvidenzStufe[] = [
  { g: "S", c: "var(--pos)",       crit: "Meta-Analysen + 300+ RCTs",              ex: "Creatine, Caffeine, Whey, Vitamin D", w: 1.0 },
  { g: "A", c: "var(--acc-recov)", crit: "Mehrere hochwertige RCTs",               ex: "Omega-3, Magnesium, Zinc, Beta-Alanine", w: 0.9 },
  { g: "B", c: "var(--acc-train)", crit: "Einige RCTs, konsistente Ergebnisse",    ex: "Ashwagandha, Melatonin, K2, Collagen", w: 0.75 },
  { g: "C", c: "var(--acc-goals)", crit: "Wenige Studien, gemischte Ergebnisse",   ex: "Turkesterone, Alpha-GPC, Berberine", w: 0.6 },
  { g: "D", c: "var(--warn)",      crit: "Anekdotisch, Tier-Studien, Hype",        ex: "BCAAs (bei ausreichend Protein)", w: 0.4 },
  { g: "F", c: "var(--neg)",       crit: "Widerlegt oder kein nachweisbarer Effekt",ex: "CLA, Tribulus, Deer Antler", w: 0.0 },
];

export const CATALOG: KatalogEintrag[] = [
  // ── Standard ──
  { id: "creatine", name: "Creatine Monohydrate", name_de: "Kreatin Monohydrat", mode: "standard", cat: "Performance",
    grade: "S", timing: ["morning"], dose: "3–5 g", cost_per_serving: 0.14,
    nutrients_provided: {}, goals: ["strength","power","hydration"], inStack: true },
  { id: "whey", name: "Whey Protein Isolate", name_de: "Whey Isolat", mode: "standard", cat: "Protein",
    grade: "S", timing: ["post_workout"], dose: "20–40 g", cost_per_serving: 0.62,
    nutrients_provided: { PROT625: { amount: 27, unit: "g" }, CA: { amount: 250, unit: "mg" } }, goals: ["hypertrophy","recovery"], inStack: true },
  { id: "vitd", name: "Vitamin D3 + K2 (MK-7)", name_de: "Vitamin D3 + K2", mode: "standard", cat: "Vitamin",
    grade: "S", timing: ["morning"], dose: "1000–4000 IU", cost_per_serving: 0.21,
    nutrients_provided: { VITD: { amount: 4000, unit: "IU" }, VITK: { amount: 200, unit: "µg" } }, goals: ["immune","bone","mood"], inStack: true },
  { id: "caffeine", name: "Caffeine Anhydrous", name_de: "Koffein", mode: "standard", cat: "Stimulant",
    grade: "S", timing: ["pre_workout"], dose: "3–6 mg/kg", cost_per_serving: 0.02,
    nutrients_provided: {}, goals: ["performance","alertness"], inStack: true },
  { id: "omega3", name: "Omega-3 EPA/DHA", name_de: "Omega-3", mode: "standard", cat: "Fatty acid",
    grade: "A", timing: ["morning"], dose: "1–3 g", cost_per_serving: 0.64,
    nutrients_provided: { FAPUN3: { amount: 2000, unit: "mg" }, FAPUN3EPA: { amount: 640, unit: "mg" }, FAPUN3DHA: { amount: 480, unit: "mg" } }, goals: ["inflammation","cognition","cv"], inStack: true },
  { id: "magnesium", name: "Magnesium Glycinate", name_de: "Magnesium Glycinat", mode: "standard", cat: "Mineral",
    grade: "A", timing: ["evening"], dose: "200–400 mg", cost_per_serving: 0.41,
    nutrients_provided: { MG: { amount: 400, unit: "mg" } }, goals: ["sleep","hrv","relaxation"], inStack: true },
  { id: "betaala", name: "Beta-Alanine", name_de: "Beta-Alanin", mode: "standard", cat: "Performance",
    grade: "A", timing: ["pre_workout"], dose: "3.2–6 g", cost_per_serving: 0.10,
    nutrients_provided: {}, goals: ["endurance"], inStack: true },
  { id: "zinc", name: "Zinc Picolinate", name_de: "Zink Picolinat", mode: "standard", cat: "Mineral",
    grade: "A", timing: ["evening"], dose: "15–30 mg", cost_per_serving: 0.08,
    nutrients_provided: { ZN: { amount: 25, unit: "mg" } }, goals: ["immune","testosterone"], inStack: false },
  { id: "ashwa", name: "Ashwagandha (KSM-66)", name_de: "Ashwagandha", mode: "standard", cat: "Adaptogen",
    grade: "B", timing: ["evening"], dose: "300–600 mg", cost_per_serving: 0.60,
    nutrients_provided: {}, goals: ["cortisol","stress","sleep"], inStack: true },
  { id: "probiotic", name: "Probiotic · 50B CFU", name_de: "Probiotikum", mode: "standard", cat: "Gut health",
    grade: "B", timing: ["midday"], dose: "10–50B CFU", cost_per_serving: 1.66,
    nutrients_provided: {}, goals: ["microbiome","immunity"], inStack: true },
  { id: "melatonin", name: "Melatonin", name_de: "Melatonin", mode: "standard", cat: "Sleep",
    grade: "B", timing: ["evening"], dose: "0.5–3 mg", cost_per_serving: 0.05,
    nutrients_provided: {}, goals: ["sleep onset"], inStack: false },
  { id: "citrulline", name: "L-Citrulline Malate", name_de: "L-Citrullin Malat", mode: "standard", cat: "Performance",
    grade: "B", timing: ["pre_workout"], dose: "6–8 g", cost_per_serving: 0.22,
    nutrients_provided: {}, goals: ["pump","vasodilation"], inStack: false },
  { id: "coq10", name: "Coenzyme Q10", name_de: "Coenzym Q10", mode: "standard", cat: "Longevity",
    grade: "C", timing: ["morning"], dose: "100–200 mg", cost_per_serving: 0.48,
    nutrients_provided: {}, goals: ["mitochondria","cv"], inStack: false },
  { id: "turkest", name: "Turkesterone", name_de: "Turkesteron", mode: "standard", cat: "Performance",
    grade: "C", timing: ["morning"], dose: "500 mg", cost_per_serving: 1.10,
    nutrients_provided: {}, goals: ["hypertrophy (claimed)"], inStack: false },
  { id: "bcaa", name: "BCAAs", name_de: "BCAAs", mode: "standard", cat: "Amino acid",
    grade: "D", timing: ["pre_workout"], dose: "5–10 g", cost_per_serving: 0.30,
    nutrients_provided: {}, goals: ["anti-catabolic (claimed)"], inStack: false },
  { id: "tribulus", name: "Tribulus Terrestris", name_de: "Tribulus", mode: "standard", cat: "Adaptogen",
    grade: "F", timing: ["morning"], dose: "—", cost_per_serving: 0.25,
    nutrients_provided: {}, goals: ["libido (disproven)"], inStack: false },
  { id: "cla", name: "CLA", name_de: "CLA", mode: "standard", cat: "Fatty acid",
    grade: "F", timing: ["morning"], dose: "—", cost_per_serving: 0.18,
    nutrients_provided: {}, goals: ["fat loss (disproven)"], inStack: false },

  // ── Enhanced ──
  { id: "test_cyp", name: "Testosterone Cypionate", name_de: "Testosteron Cypionat", mode: "enhanced", cat: "AAS · Injectable",
    grade: "S", timing: ["injection"], dose: "100–200 mg/wk", cost_per_serving: 2.13, inStack: true,
    hepatotoxicity: "none", cv_risk: "moderate", androgenic: 100, anabolic: 100,
    requires_pct: true, requires_ai: true, requires_serm: false, aromatization: "moderate",
    detection_days: 90, half_life: "8 d",
    legal_status: { DE: "Rx only", US: "Schedule III", TH: "Rx only", UK: "Class C" } },
  { id: "test_e", name: "Testosterone Enanthate", name_de: "Testosteron Enantat", mode: "enhanced", cat: "AAS · Injectable",
    grade: "S", timing: ["injection"], dose: "100–250 mg/wk", cost_per_serving: 1.90, inStack: false,
    hepatotoxicity: "none", cv_risk: "moderate", androgenic: 100, anabolic: 100,
    requires_pct: true, requires_ai: true, requires_serm: false, aromatization: "moderate",
    detection_days: 90, half_life: "7 d",
    legal_status: { DE: "Rx only", US: "Schedule III", TH: "Rx only", UK: "Class C" } },
  { id: "nandrolone", name: "Nandrolone Decanoate", name_de: "Nandrolon Decanoat", mode: "enhanced", cat: "AAS · Injectable",
    grade: "A", timing: ["injection"], dose: "200–400 mg/wk", cost_per_serving: 2.40, inStack: false,
    hepatotoxicity: "low", cv_risk: "high", androgenic: 37, anabolic: 125,
    requires_pct: true, requires_ai: false, requires_serm: true, aromatization: "low",
    detection_days: 540, half_life: "15 d",
    legal_status: { DE: "Rx only", US: "Schedule III", TH: "banned", UK: "Class C" } },
  { id: "oxandrolone", name: "Oxandrolone (Anavar)", name_de: "Oxandrolon", mode: "enhanced", cat: "AAS · Oral",
    grade: "A", timing: ["morning"], dose: "20–50 mg/d", cost_per_serving: 1.80, inStack: false,
    hepatotoxicity: "moderate", cv_risk: "moderate", androgenic: 24, anabolic: 322,
    requires_pct: true, requires_ai: false, requires_serm: false, aromatization: "none",
    detection_days: 21, half_life: "9 h",
    legal_status: { DE: "Rx only", US: "Schedule III", TH: "Rx only", UK: "Class C" } },
  { id: "hcg", name: "HCG", name_de: "HCG", mode: "enhanced", cat: "PCT",
    grade: "A", timing: ["injection"], dose: "250–500 IU 2×/wk", cost_per_serving: 1.28, inStack: true,
    hepatotoxicity: "none", cv_risk: "low", androgenic: null, anabolic: null,
    requires_pct: false, requires_ai: false, requires_serm: false, aromatization: "none",
    detection_days: 7, half_life: "33 h",
    legal_status: { DE: "Rx only", US: "Rx only", TH: "Rx only", UK: "Rx only" } },
  { id: "anastrozole", name: "Anastrozole (Arimidex)", name_de: "Anastrozol", mode: "enhanced", cat: "Aromatase Inhibitor",
    grade: "S", timing: ["morning"], dose: "0.25–0.5 mg E3D", cost_per_serving: 0.41, inStack: true,
    hepatotoxicity: "low", cv_risk: "low", androgenic: null, anabolic: null,
    requires_pct: false, requires_ai: false, requires_serm: false, aromatization: "none",
    detection_days: 14, half_life: "46 h",
    legal_status: { DE: "Rx only", US: "Rx only", TH: "Rx only", UK: "Rx only" } },
  { id: "tamoxifen", name: "Tamoxifen (Nolvadex)", name_de: "Tamoxifen", mode: "enhanced", cat: "PCT",
    grade: "S", timing: ["morning"], dose: "20–40 mg/d", cost_per_serving: 0.32, inStack: false,
    hepatotoxicity: "moderate", cv_risk: "low", androgenic: null, anabolic: null,
    requires_pct: false, requires_ai: false, requires_serm: false, aromatization: "none",
    detection_days: 60, half_life: "5–7 d",
    legal_status: { DE: "Rx only", US: "Rx only", TH: "Rx only", UK: "Rx only" } },
  { id: "mk677", name: "MK-677 (Ibutamoren)", name_de: "MK-677", mode: "enhanced", cat: "GH Secretagogue",
    grade: "B", timing: ["evening"], dose: "10–25 mg/d", cost_per_serving: 1.60, inStack: true,
    hepatotoxicity: "low", cv_risk: "moderate", androgenic: null, anabolic: null,
    requires_pct: false, requires_ai: false, requires_serm: false, aromatization: "none",
    detection_days: 30, half_life: "6 h",
    legal_status: { DE: "not approved", US: "research only", TH: "grey", UK: "not approved" } },
  { id: "rad140", name: "RAD-140 (Testolone)", name_de: "RAD-140", mode: "enhanced", cat: "SARM",
    grade: "C", timing: ["morning"], dose: "10–20 mg/d", cost_per_serving: 1.40, inStack: false,
    hepatotoxicity: "moderate", cv_risk: "moderate", androgenic: 10, anabolic: 90,
    requires_pct: true, requires_ai: false, requires_serm: true, aromatization: "none",
    detection_days: 30, half_life: "20 h",
    legal_status: { DE: "not approved", US: "banned WADA", TH: "grey", UK: "not approved" } },
  { id: "lgd4033", name: "LGD-4033 (Ligandrol)", name_de: "LGD-4033", mode: "enhanced", cat: "SARM",
    grade: "C", timing: ["morning"], dose: "5–10 mg/d", cost_per_serving: 1.20, inStack: false,
    hepatotoxicity: "moderate", cv_risk: "moderate", androgenic: 20, anabolic: 120,
    requires_pct: true, requires_ai: false, requires_serm: true, aromatization: "none",
    detection_days: 21, half_life: "24 h",
    legal_status: { DE: "not approved", US: "banned WADA", TH: "grey", UK: "not approved" } },
  { id: "bpc157", name: "BPC-157", name_de: "BPC-157", mode: "enhanced", cat: "Peptide",
    grade: "C", timing: ["injection"], dose: "250–500 µg/d", cost_per_serving: 1.07, inStack: true,
    hepatotoxicity: "none", cv_risk: "low", androgenic: null, anabolic: null,
    requires_pct: false, requires_ai: false, requires_serm: false, aromatization: "none",
    detection_days: 7, half_life: "4 h",
    legal_status: { DE: "not approved", US: "research only", TH: "grey", UK: "not approved" } },
  { id: "tb500", name: "TB-500", name_de: "TB-500", mode: "enhanced", cat: "Peptide",
    grade: "C", timing: ["injection"], dose: "2–5 mg/wk", cost_per_serving: 2.20, inStack: false,
    hepatotoxicity: "none", cv_risk: "low", androgenic: null, anabolic: null,
    requires_pct: false, requires_ai: false, requires_serm: false, aromatization: "none",
    detection_days: 14, half_life: "2–3 d",
    legal_status: { DE: "not approved", US: "banned WADA", TH: "grey", UK: "not approved" } },
  { id: "hgh", name: "HGH (Somatropin)", name_de: "Wachstumshormon", mode: "enhanced", cat: "GH",
    grade: "A", timing: ["injection"], dose: "2–4 IU/d", cost_per_serving: 8.50, inStack: false,
    hepatotoxicity: "none", cv_risk: "moderate", androgenic: null, anabolic: null,
    requires_pct: false, requires_ai: false, requires_serm: false, aromatization: "none",
    detection_days: 14, half_life: "3 h",
    legal_status: { DE: "Rx only", US: "Schedule III", TH: "Rx only", UK: "Class C" } },
  { id: "semaglutide", name: "Semaglutide (Ozempic)", name_de: "Semaglutid", mode: "enhanced", cat: "GLP-1 Agonist",
    grade: "S", timing: ["injection"], dose: "0.25–2.4 mg/wk", cost_per_serving: 12.40, inStack: false,
    hepatotoxicity: "low", cv_risk: "low", androgenic: null, anabolic: null,
    requires_pct: false, requires_ai: false, requires_serm: false, aromatization: "none",
    detection_days: 35, half_life: "7 d",
    legal_status: { DE: "Rx only", US: "Rx only", TH: "Rx only", UK: "Rx only" } },
  { id: "tirzepatide", name: "Tirzepatide (Mounjaro)", name_de: "Tirzepatid", mode: "enhanced", cat: "GLP-1 Agonist",
    grade: "S", timing: ["injection"], dose: "2.5–15 mg/wk", cost_per_serving: 15.80, inStack: false,
    hepatotoxicity: "low", cv_risk: "low", androgenic: null, anabolic: null,
    requires_pct: false, requires_ai: false, requires_serm: false, aromatization: "none",
    detection_days: 35, half_life: "5 d",
    legal_status: { DE: "Rx only", US: "Rx only", TH: "Rx only", UK: "Rx only" } },
  { id: "nac", name: "NAC (Support)", name_de: "NAC", mode: "enhanced", cat: "Support",
    grade: "B", timing: ["morning"], dose: "600–1200 mg/d", cost_per_serving: 0.22, inStack: false,
    hepatotoxicity: "none", cv_risk: "low", androgenic: null, anabolic: null,
    requires_pct: false, requires_ai: false, requires_serm: false, aromatization: "none",
    detection_days: 0, half_life: "6 h",
    legal_status: { DE: "OTC", US: "OTB", TH: "OTC", UK: "OTC" } },
  { id: "tudca", name: "TUDCA (Support)", name_de: "TUDCA", mode: "enhanced", cat: "Support",
    grade: "B", timing: ["morning"], dose: "250–500 mg/d", cost_per_serving: 0.90, inStack: false,
    hepatotoxicity: "none", cv_risk: "low", androgenic: null, anabolic: null,
    requires_pct: false, requires_ai: false, requires_serm: false, aromatization: "none",
    detection_days: 0, half_life: "—",
    legal_status: { DE: "OTC", US: "OTC", TH: "OTC", UK: "OTC" } },
];

export const ENHANCED_CATEGORIES = ["AAS · Injectable","AAS · Oral","SARM","Peptide","GH","GH Secretagogue","GLP-1 Agonist","PCT","Aromatase Inhibitor","Support"];

export const BLOODWORK_PANEL = [
  { grp: "Hormones", m: ["Total Testosterone","Free Testosterone","Estradiol (sensitive)","LH","FSH","SHBG","Prolactin","IGF-1","TSH"] },
  { grp: "Blood",    m: ["Hematocrit","Hemoglobin"] },
  { grp: "Lipids",   m: ["HDL","LDL","Triglycerides"] },
  { grp: "Liver",    m: ["ALT","AST","GGT","Bilirubin"] },
  { grp: "Kidney",   m: ["Creatinine","BUN","eGFR"] },
  { grp: "Prostate", m: ["PSA"] },
  { grp: "Metabolic",m: ["Fasting Glucose","HbA1c"] },
  { grp: "Inflammation", m: ["hs-CRP"] },
];

export const STACK_TEMPLATES = [
  { id: "tpl1", name: "Muscle Building Starter", items: ["Creatine","Vitamin D3","Omega-3","Magnesium"], goal: "hypertrophy" },
  { id: "tpl2", name: "Daily Health Basics",     items: ["Vitamin D3","Omega-3","Magnesium","K2"],       goal: "health" },
  { id: "tpl3", name: "Fat Loss Stack",          items: ["Caffeine","Creatine","Omega-3","Vitamin D3"],  goal: "fat loss" },
  { id: "tpl4", name: "Recovery & Sleep",        items: ["Magnesium","Omega-3","Melatonin","Glycine"],   goal: "recovery" },
  { id: "tpl5", name: "Longevity",               items: ["Vitamin D3","K2","Omega-3","Magnesium","CoQ10","NAC"], goal: "longevity" },
];

export const USER_STACKS = [
  { id: "s1", name: "Stack v3.2 · current", source: "user",        items: 10, active: true,  since: "Mar 2026" },
  { id: "s2", name: "Cut phase stack",      source: "coach",       items: 8,  active: false, since: "Jan 2026" },
  { id: "s3", name: "Travel minimal",       source: "user",        items: 4,  active: false, since: "Nov 2025" },
  { id: "s4", name: "Longevity (template)", source: "template",    items: 6,  active: false, since: "—" },
];

export const FREQUENCY_OPTIONS = [
  { id: "daily",         label: "Daily",          days: 30 },
  { id: "weekdays",      label: "Weekdays",       days: 22 },
  { id: "training_days", label: "Training days",  days: 21 },
  { id: "custom",        label: "Custom",         days: 15 },
  { id: "cycling",       label: "Cycling",        days: 20 },
];

export const INTERACTION_DB = [
  { a: "Anastrozole", b: "Testosterone Cypionate", severity: "info",     timing: "take_together", note: "Intended pairing — AI controls aromatization from exogenous T.", blocks: false },
  { a: "Caffeine",    b: "Ashwagandha",            severity: "caution",  timing: "separate_4h",   note: "Opposing autonomic effects. Current gap 4.5h is within tolerance.", blocks: false },
  { a: "Magnesium",   b: "Whey Protein Isolate",   severity: "caution",  timing: "separate_2h",   note: "Whey delivers ~250mg calcium which competes for Mg absorption (~10-15%).", blocks: false },
  { a: "Zinc",        b: "Magnesium Glycinate",    severity: "warning",  timing: "separate_2h",   note: "High-dose zinc reduces magnesium uptake. Split across morning/evening.", blocks: false },
  { a: "Nandrolone Decanoate", b: "Anastrozole",   severity: "warning",  timing: "avoid",         note: "Nandrolone is progestagenic — AI does not control prolactin. Needs cabergoline instead.", blocks: false },
  { a: "Oxandrolone", b: "MK-677",                 severity: "critical", timing: "avoid",         note: "Both raise hepatic load and fasting glucose. Combined use exceeds safe threshold without medical supervision.", blocks: true },
  { a: "Vitamin D3",  b: "Magnesium Glycinate",    severity: "info",     timing: "take_together", note: "Mg is a cofactor for vitamin D activation — synergistic.", blocks: false },
];

export const SEVERITY_META = {
  critical: { c: "var(--neg)",       label: "critical", action: "Einnahme gesperrt + Pflicht-Alert" },
  warning:  { c: "var(--warn)",      label: "warning",  action: "Alert + Timing-Empfehlung · Bestätigung nötig" },
  caution:  { c: "var(--acc-goals)", label: "caution",  action: "Hinweis anzeigen" },
  info:     { c: "var(--acc-recov)", label: "info",     action: "Passiv anzeigen (Synergie)" },
};

export const TIMING_LABEL = {
  separate_2h: "2 h Abstand", separate_4h: "4 h Abstand", separate_8h: "8 h Abstand",
  take_together: "zusammen einnehmen", avoid: "Kombination vermeiden",
};

export const INVENTORY = [
  { id: "creatine",  name: "Creatine Monohydrate", stock: 18,  unit: "servings", perDay: 1,    expiry: "2027-08", threshold: 7 },
  { id: "omega3",    name: "Omega-3 EPA/DHA",      stock: 8,   unit: "servings", perDay: 1,    expiry: "2026-11", threshold: 7 },
  { id: "vitd",      name: "Vitamin D3 + K2",      stock: 34,  unit: "servings", perDay: 1,    expiry: "2027-03", threshold: 7 },
  { id: "whey",      name: "Whey Isolate",         stock: 22,  unit: "servings", perDay: 0.71, expiry: "2027-01", threshold: 7 },
  { id: "magnesium", name: "Magnesium Glycinate",  stock: 28,  unit: "servings", perDay: 1,    expiry: "2026-09", threshold: 7 },
  { id: "ashwa",     name: "Ashwagandha KSM-66",   stock: 12,  unit: "servings", perDay: 1,    expiry: "2026-08", threshold: 7 },
  { id: "betaala",   name: "Beta-Alanine",         stock: 41,  unit: "servings", perDay: 0.57, expiry: "2027-06", threshold: 7 },
  { id: "test_cyp",  name: "Testosterone Cyp.",    stock: 6,   unit: "doses",    perDay: 0.29, expiry: "2027-02", threshold: 4 },
];

/** Gewicht je Stufe — Vorlage Zeile 13. */
export const EVIDENCE_WEIGHT: Record<string, number> =
  Object.fromEntries(EVIDENCE_GRADES.map(e => [e.g, e.w]))

/** Stufe nachschlagen, mit demselben Rueckfall wie die Vorlage (Zeile 14). */
export function gradeMeta(g: string): EvidenzStufe {
  return EVIDENCE_GRADES.find(e => e.g === g) ?? EVIDENCE_GRADES[3]
}

/** Naehrstoffluecken (Intelligence-Tab). Vorlage Zeile 577-588. */
export const GAP_ROWS = [
  { code: "VITD",   name: "Vitamin D",   nutrition: 420,  supp: 4000, rda: 800,  unit: "IU" },
  { code: "MG",     name: "Magnesium",   nutrition: 245,  supp: 400,  rda: 350,  unit: "mg" },
  { code: "FAPUN3", name: "Omega-3",     nutrition: 900,  supp: 2000, rda: 1600, unit: "mg" },
  { code: "ZN",     name: "Zinc",        nutrition: 11,   supp: 0,    rda: 11,   unit: "mg" },
  { code: "CA",     name: "Calcium",     nutrition: 740,  supp: 250,  rda: 1000, unit: "mg" },
  { code: "FE",     name: "Iron",        nutrition: 14,   supp: 0,    rda: 18,   unit: "mg" },
  { code: "ID",     name: "Iodine",      nutrition: 132,  supp: 0,    rda: 150,  unit: "µg" },
  { code: "SE",     name: "Selenium",    nutrition: 124,  supp: 0,    rda: 70,   unit: "µg" },
  { code: "VITK",   name: "Vitamin K",   nutrition: 104,  supp: 200,  rda: 120,  unit: "µg" },
  { code: "FOL",    name: "Folate",      nutrition: 380,  supp: 0,    rda: 400,  unit: "µg" },
];
