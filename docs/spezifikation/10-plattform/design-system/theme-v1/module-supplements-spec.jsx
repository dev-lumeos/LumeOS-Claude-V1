// Supplements · Spec-alignment — Evidence S-F, unified catalog (standard + enhanced),
// stacks/templates, intake flow, intelligence engine, inventory, pending actions

// ── Block A: Evidence grading S–F ─────────────────────────
const EVIDENCE_GRADES = [
  { g: "S", c: "var(--pos)",       crit: "Meta-Analysen + 300+ RCTs",              ex: "Creatine, Caffeine, Whey, Vitamin D", w: 1.0 },
  { g: "A", c: "var(--acc-recov)", crit: "Mehrere hochwertige RCTs",               ex: "Omega-3, Magnesium, Zinc, Beta-Alanine", w: 0.9 },
  { g: "B", c: "var(--acc-train)", crit: "Einige RCTs, konsistente Ergebnisse",    ex: "Ashwagandha, Melatonin, K2, Collagen", w: 0.75 },
  { g: "C", c: "var(--acc-goals)", crit: "Wenige Studien, gemischte Ergebnisse",   ex: "Turkesterone, Alpha-GPC, Berberine", w: 0.6 },
  { g: "D", c: "var(--warn)",      crit: "Anekdotisch, Tier-Studien, Hype",        ex: "BCAAs (bei ausreichend Protein)", w: 0.4 },
  { g: "F", c: "var(--neg)",       crit: "Widerlegt oder kein nachweisbarer Effekt",ex: "CLA, Tribulus, Deer Antler", w: 0.0 },
];
const EVIDENCE_WEIGHT = Object.fromEntries(EVIDENCE_GRADES.map(e => [e.g, e.w]));
const gradeMeta = g => EVIDENCE_GRADES.find(e => e.g === g) || EVIDENCE_GRADES[3];

// ── Unified catalog: standard + enhanced in one DB ─────────
const CATALOG = [
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

const ENHANCED_CATEGORIES = ["AAS · Injectable","AAS · Oral","SARM","Peptide","GH","GH Secretagogue","GLP-1 Agonist","PCT","Aromatase Inhibitor","Support"];

// 30+ marker bloodwork panel
const BLOODWORK_PANEL = [
  { grp: "Hormones", m: ["Total Testosterone","Free Testosterone","Estradiol (sensitive)","LH","FSH","SHBG","Prolactin","IGF-1","TSH"] },
  { grp: "Blood",    m: ["Hematocrit","Hemoglobin"] },
  { grp: "Lipids",   m: ["HDL","LDL","Triglycerides"] },
  { grp: "Liver",    m: ["ALT","AST","GGT","Bilirubin"] },
  { grp: "Kidney",   m: ["Creatinine","BUN","eGFR"] },
  { grp: "Prostate", m: ["PSA"] },
  { grp: "Metabolic",m: ["Fasting Glucose","HbA1c"] },
  { grp: "Inflammation", m: ["hs-CRP"] },
];

// ── Block B: stacks + templates ───────────────────────────
const STACK_TEMPLATES = [
  { id: "tpl1", name: "Muscle Building Starter", items: ["Creatine","Vitamin D3","Omega-3","Magnesium"], goal: "hypertrophy" },
  { id: "tpl2", name: "Daily Health Basics",     items: ["Vitamin D3","Omega-3","Magnesium","K2"],       goal: "health" },
  { id: "tpl3", name: "Fat Loss Stack",          items: ["Caffeine","Creatine","Omega-3","Vitamin D3"],  goal: "fat loss" },
  { id: "tpl4", name: "Recovery & Sleep",        items: ["Magnesium","Omega-3","Melatonin","Glycine"],   goal: "recovery" },
  { id: "tpl5", name: "Longevity",               items: ["Vitamin D3","K2","Omega-3","Magnesium","CoQ10","NAC"], goal: "longevity" },
];

const USER_STACKS = [
  { id: "s1", name: "Stack v3.2 · current", source: "user",        items: 10, active: true,  since: "Mar 2026" },
  { id: "s2", name: "Cut phase stack",      source: "coach",       items: 8,  active: false, since: "Jan 2026" },
  { id: "s3", name: "Travel minimal",       source: "user",        items: 4,  active: false, since: "Nov 2025" },
  { id: "s4", name: "Longevity (template)", source: "template",    items: 6,  active: false, since: "—" },
];

const FREQUENCY_OPTIONS = [
  { id: "daily",         label: "Daily",          days: 30 },
  { id: "weekdays",      label: "Weekdays",       days: 22 },
  { id: "training_days", label: "Training days",  days: 21 },
  { id: "custom",        label: "Custom",         days: 15 },
  { id: "cycling",       label: "Cycling",        days: 20 },
];

// ── Block C: interactions with severity protocol ──────────
const INTERACTION_DB = [
  { a: "Anastrozole", b: "Testosterone Cypionate", severity: "info",     timing: "take_together", note: "Intended pairing — AI controls aromatization from exogenous T.", blocks: false },
  { a: "Caffeine",    b: "Ashwagandha",            severity: "caution",  timing: "separate_4h",   note: "Opposing autonomic effects. Current gap 4.5h is within tolerance.", blocks: false },
  { a: "Magnesium",   b: "Whey Protein Isolate",   severity: "caution",  timing: "separate_2h",   note: "Whey delivers ~250mg calcium which competes for Mg absorption (~10-15%).", blocks: false },
  { a: "Zinc",        b: "Magnesium Glycinate",    severity: "warning",  timing: "separate_2h",   note: "High-dose zinc reduces magnesium uptake. Split across morning/evening.", blocks: false },
  { a: "Nandrolone Decanoate", b: "Anastrozole",   severity: "warning",  timing: "avoid",         note: "Nandrolone is progestagenic — AI does not control prolactin. Needs cabergoline instead.", blocks: false },
  { a: "Oxandrolone", b: "MK-677",                 severity: "critical", timing: "avoid",         note: "Both raise hepatic load and fasting glucose. Combined use exceeds safe threshold without medical supervision.", blocks: true },
  { a: "Vitamin D3",  b: "Magnesium Glycinate",    severity: "info",     timing: "take_together", note: "Mg is a cofactor for vitamin D activation — synergistic.", blocks: false },
];
const SEVERITY_META = {
  critical: { c: "var(--neg)",       label: "critical", action: "Einnahme gesperrt + Pflicht-Alert" },
  warning:  { c: "var(--warn)",      label: "warning",  action: "Alert + Timing-Empfehlung · Bestätigung nötig" },
  caution:  { c: "var(--acc-goals)", label: "caution",  action: "Hinweis anzeigen" },
  info:     { c: "var(--acc-recov)", label: "info",     action: "Passiv anzeigen (Synergie)" },
};
const TIMING_LABEL = {
  separate_2h: "2 h Abstand", separate_4h: "4 h Abstand", separate_8h: "8 h Abstand",
  take_together: "zusammen einnehmen", avoid: "Kombination vermeiden",
};

// ── Block D: inventory ────────────────────────────────────
const INVENTORY = [
  { id: "creatine",  name: "Creatine Monohydrate", stock: 18,  unit: "servings", perDay: 1,    expiry: "2027-08", threshold: 7 },
  { id: "omega3",    name: "Omega-3 EPA/DHA",      stock: 8,   unit: "servings", perDay: 1,    expiry: "2026-11", threshold: 7 },
  { id: "vitd",      name: "Vitamin D3 + K2",      stock: 34,  unit: "servings", perDay: 1,    expiry: "2027-03", threshold: 7 },
  { id: "whey",      name: "Whey Isolate",         stock: 22,  unit: "servings", perDay: 0.71, expiry: "2027-01", threshold: 7 },
  { id: "magnesium", name: "Magnesium Glycinate",  stock: 28,  unit: "servings", perDay: 1,    expiry: "2026-09", threshold: 7 },
  { id: "ashwa",     name: "Ashwagandha KSM-66",   stock: 12,  unit: "servings", perDay: 1,    expiry: "2026-08", threshold: 7 },
  { id: "betaala",   name: "Beta-Alanine",         stock: 41,  unit: "servings", perDay: 0.57, expiry: "2027-06", threshold: 7 },
  { id: "test_cyp",  name: "Testosterone Cyp.",    stock: 6,   unit: "doses",    perDay: 0.29, expiry: "2027-02", threshold: 4 },
];

// ══════════════════════════════════════════════════════════
// VIEWS
// ══════════════════════════════════════════════════════════

// Unified catalog browser — reads standard + enhanced from one source
window.SuppCatalogView = () => {
  const [mode, setMode] = React.useState("all");
  const [grade, setGrade] = React.useState("all");
  const [q, setQ] = React.useState("");
  const [sel, setSel] = React.useState(null);
  const rows = CATALOG
    .filter(s => mode === "all" || s.mode === mode)
    .filter(s => grade === "all" || s.grade === grade)
    .filter(s => !q || (s.name + s.name_de + s.cat).toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => "SABCDF".indexOf(a.grade) - "SABCDF".indexOf(b.grade));
  return (
    <div>
      <div style={{display: "flex", gap: 8, marginBottom: 12, alignItems: "center", flexWrap: "wrap"}}>
        <div style={{flex: 1, minWidth: 220, position: "relative"}}>
          <Icon name="search" className="ic ic-sm" style={{position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--fg-subtle)"}}/>
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search catalog · name, name_de, category…"
            style={{width: "100%", height: 32, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, padding: "0 12px 0 30px", fontSize: 12}}/>
        </div>
        <div style={{display: "flex", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, padding: 2, gap: 1}}>
          {[["all","All"],["standard","Standard"],["enhanced","Enhanced"]].map(([k,l]) => (
            <button key={k} onClick={() => setMode(k)} className={mode === k ? "btn btn-primary" : "btn btn-ghost"} style={{height: 24, fontSize: 11, padding: "0 12px", borderRadius: 4}}>{l}</button>
          ))}
        </div>
        <span className="dim mono" style={{fontSize: 10.5}}>{rows.length} of {CATALOG.length}</span>
      </div>

      <div style={{display: "flex", gap: 5, marginBottom: 12, alignItems: "center", flexWrap: "wrap"}}>
        <span className="eyebrow" style={{marginRight: 4}}>Evidence</span>
        <button onClick={() => setGrade("all")} className={grade === "all" ? "pill pill-acc" : "pill"} style={{cursor: "pointer", padding: "3px 10px", fontSize: 11}}>All</button>
        {EVIDENCE_GRADES.map(e => (
          <button key={e.g} onClick={() => setGrade(e.g)} className="pill" style={{
            cursor: "pointer", padding: "3px 12px", fontSize: 11, fontWeight: 600,
            borderColor: grade === e.g ? e.c : `color-mix(in srgb, ${e.c} 30%, var(--border))`,
            color: e.c, background: grade === e.g ? `color-mix(in srgb, ${e.c} 14%, transparent)` : `color-mix(in srgb, ${e.c} 5%, transparent)`,
          }}>{e.g}</button>
        ))}
      </div>

      <Card style={{padding: 0}}>
        <table className="tbl">
          <thead>
            <tr>
              <th style={{paddingLeft: 14}}>Supplement</th>
              <th style={{width: 60}}>Grade</th>
              <th style={{width: 150}}>Category</th>
              <th style={{width: 70}}>Mode</th>
              <th style={{width: 130}}>Dose</th>
              <th style={{width: 110}}>Timing</th>
              <th style={{width: 90, textAlign: "right"}}>€/serving</th>
              <th style={{width: 80}}>In stack</th>
              <th style={{width: 30}}></th>
            </tr>
          </thead>
          <tbody>
            {rows.map(s => {
              const gm = gradeMeta(s.grade);
              return (
                <tr key={s.id} className="clickable" style={{cursor: "pointer"}} onClick={() => setSel(s)}>
                  <td style={{paddingLeft: 14}}>
                    <div style={{fontSize: 12.5, fontWeight: 500}}>{s.name}</div>
                    <div className="dim" style={{fontSize: 10}}>{s.name_de}</div>
                  </td>
                  <td>
                    <span style={{
                      display: "inline-grid", placeItems: "center", width: 22, height: 22, borderRadius: 5,
                      background: `color-mix(in srgb, ${gm.c} 18%, transparent)`,
                      border: `1px solid color-mix(in srgb, ${gm.c} 40%, transparent)`,
                      color: gm.c, fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700,
                    }}>{s.grade}</span>
                  </td>
                  <td className="muted" style={{fontSize: 11.5}}>{s.cat}</td>
                  <td>{s.mode === "enhanced"
                    ? <Pill style={{fontSize: 9, borderColor: "color-mix(in srgb, var(--acc-medic) 35%, var(--border))", color: "var(--acc-medic)"}}>enhanced</Pill>
                    : <Pill style={{fontSize: 9}}>standard</Pill>}</td>
                  <td className="num" style={{fontSize: 11}}>{s.dose}</td>
                  <td className="muted mono" style={{fontSize: 10.5}}>{s.timing.join(", ")}</td>
                  <td className="num" style={{textAlign: "right", fontSize: 11.5}}>€{s.cost_per_serving.toFixed(2)}</td>
                  <td>{s.inStack ? <Pill variant="pos" style={{fontSize: 9}}>active</Pill> : <span className="dim">—</span>}</td>
                  <td><Icon name="chevron_right" className="ic ic-sm" style={{color: "var(--fg-dim)"}}/></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>

      <div style={{height: 14}}/>
      <Card title="Evidence grading" sub="S bis F · curated, not open-source">
        <table className="tbl">
          <thead><tr><th style={{width: 60}}>Grade</th><th style={{width: 70, textAlign: "right"}}>Weight</th><th style={{width: 300}}>Criterion</th><th>Examples</th></tr></thead>
          <tbody>
            {EVIDENCE_GRADES.map(e => (
              <tr key={e.g}>
                <td>
                  <span style={{display: "inline-grid", placeItems: "center", width: 22, height: 22, borderRadius: 5,
                    background: `color-mix(in srgb, ${e.c} 18%, transparent)`, border: `1px solid color-mix(in srgb, ${e.c} 40%, transparent)`,
                    color: e.c, fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700}}>{e.g}</span>
                </td>
                <td className="num" style={{textAlign: "right", color: e.c}}>{e.w.toFixed(2)}</td>
                <td style={{fontSize: 11.5}}>{e.crit}</td>
                <td className="muted" style={{fontSize: 11.5}}>{e.ex}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="dim" style={{fontSize: 11, marginTop: 10, lineHeight: 1.5}}>
          Weight feeds the evidence-weighted compliance score exported to Goals. Grade F contributes 0 — taking it doesn't raise your score.
        </div>
      </Card>

      {sel && <window.CatalogDetailModal item={sel} onClose={() => setSel(null)}/>}
    </div>
  );
};

window.CatalogDetailModal = ({ item: s, onClose }) => {
  const gm = gradeMeta(s.grade);
  const isEnh = s.mode === "enhanced";
  const riskColor = v => ({ none: "var(--pos)", low: "var(--acc-recov)", moderate: "var(--warn)", high: "var(--neg)", severe: "var(--neg)" }[v] || "var(--fg-dim)");
  return (
    <div className="modal-veil" onClick={onClose}>
      <div className="modal" style={{width: 720, maxHeight: "92vh"}} onClick={e => e.stopPropagation()}>
        <div className="modal-h">
          <span style={{display: "grid", placeItems: "center", width: 30, height: 30, borderRadius: 7,
            background: `color-mix(in srgb, ${gm.c} 18%, transparent)`, border: `1px solid color-mix(in srgb, ${gm.c} 40%, transparent)`,
            color: gm.c, fontFamily: "var(--font-mono)", fontSize: 14, fontWeight: 700}}>{s.grade}</span>
          <div style={{flex: 1}}>
            <div style={{display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap"}}>
              <span style={{fontSize: 15, fontWeight: 600}}>{s.name}</span>
              {isEnh && <Pill style={{borderColor: "color-mix(in srgb, var(--acc-medic) 35%, var(--border))", color: "var(--acc-medic)"}}>enhanced</Pill>}
              <Pill>{s.cat}</Pill>
            </div>
            <div className="dim" style={{fontSize: 11}}>{s.name_de} · {gm.crit}</div>
          </div>
          <button className="icon-btn" onClick={onClose}><Icon name="x" className="ic"/></button>
        </div>
        <div className="modal-body" style={{padding: 16, overflowY: "auto"}}>
          <div className="grid g-cols-4" style={{gap: 8, marginBottom: 14}}>
            <Card className="card-tight" style={{padding: 10}}><div className="eyebrow">Dose</div><div className="num" style={{fontSize: 13}}>{s.dose}</div></Card>
            <Card className="card-tight" style={{padding: 10}}><div className="eyebrow">Timing</div><div style={{fontSize: 11.5}}>{s.timing.join(", ")}</div></Card>
            <Card className="card-tight" style={{padding: 10}}><div className="eyebrow">€ / serving</div><div className="num" style={{fontSize: 13}}>€{s.cost_per_serving.toFixed(2)}</div></Card>
            <Card className="card-tight" style={{padding: 10}}><div className="eyebrow">Evidence weight</div><div className="num" style={{fontSize: 13, color: gm.c}}>{gm.w.toFixed(2)}</div></Card>
          </div>

          {/* nutrients_provided */}
          {Object.keys(s.nutrients_provided || {}).length > 0 && (
            <>
              <div className="eyebrow" style={{marginBottom: 6}}>nutrients_provided · reported to Nutrition</div>
              <Card className="card-tight" style={{padding: 0, marginBottom: 14}}>
                <table className="tbl" style={{margin: 0}}>
                  <thead><tr><th style={{paddingLeft: 12, width: 140}}>BLS code</th><th style={{width: 110, textAlign: "right"}}>Amount</th><th>Feeds micro summation</th></tr></thead>
                  <tbody>
                    {Object.entries(s.nutrients_provided).map(([code, d]) => (
                      <tr key={code}>
                        <td style={{paddingLeft: 12}} className="mono">{code}</td>
                        <td className="num" style={{textAlign: "right"}}>{d.amount} {d.unit}</td>
                        <td className="dim" style={{fontSize: 11}}>counted in Nutrition daily total</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            </>
          )}

          {/* Enhanced special fields */}
          {isEnh && (
            <>
              <div className="eyebrow" style={{marginBottom: 6}}>Risk profile</div>
              <div className="grid g-cols-4" style={{gap: 8, marginBottom: 12}}>
                <Card className="card-tight" style={{padding: 10}}>
                  <div className="eyebrow">Hepatotoxicity</div>
                  <div style={{fontSize: 12.5, fontWeight: 600, color: riskColor(s.hepatotoxicity), textTransform: "capitalize"}}>{s.hepatotoxicity}</div>
                </Card>
                <Card className="card-tight" style={{padding: 10}}>
                  <div className="eyebrow">CV risk</div>
                  <div style={{fontSize: 12.5, fontWeight: 600, color: riskColor(s.cv_risk), textTransform: "capitalize"}}>{s.cv_risk}</div>
                </Card>
                <Card className="card-tight" style={{padding: 10}}>
                  <div className="eyebrow">Aromatization</div>
                  <div style={{fontSize: 12.5, fontWeight: 600, color: riskColor(s.aromatization), textTransform: "capitalize"}}>{s.aromatization}</div>
                </Card>
                <Card className="card-tight" style={{padding: 10}}>
                  <div className="eyebrow">Detection window</div>
                  <div className="num" style={{fontSize: 13}}>{s.detection_days} d</div>
                </Card>
              </div>

              {(s.androgenic != null || s.anabolic != null) && (
                <>
                  <div className="eyebrow" style={{marginBottom: 6}}>Ratings · 0–500+ scale (testosterone = 100/100)</div>
                  <Card className="card-tight" style={{padding: 12, marginBottom: 12}}>
                    {[["Androgenic", s.androgenic], ["Anabolic", s.anabolic]].map(([l, v]) => (
                      <div key={l} style={{display: "grid", gridTemplateColumns: "90px 1fr 50px", gap: 10, alignItems: "center", marginBottom: 6}}>
                        <span style={{fontSize: 11.5, color: "var(--fg-muted)"}}>{l}</span>
                        <div style={{position: "relative", height: 8, background: "var(--surface-2)", borderRadius: 999}}>
                          <div style={{position: "absolute", left: 0, top: 0, bottom: 0, width: `${Math.min((v / 350) * 100, 100)}%`, background: v > 200 ? "var(--warn)" : "var(--acc-medic)", borderRadius: 999}}/>
                          <div style={{position: "absolute", left: `${(100/350)*100}%`, top: -3, bottom: -3, width: 1, background: "var(--fg-dim)"}} title="Testosterone reference = 100"/>
                        </div>
                        <span className="num" style={{textAlign: "right", fontSize: 12}}>{v}</span>
                      </div>
                    ))}
                    <div className="dim mono" style={{fontSize: 9.5, marginTop: 6}}>marker = testosterone reference (100)</div>
                  </Card>
                </>
              )}

              <div className="eyebrow" style={{marginBottom: 6}}>Required ancillaries</div>
              <div style={{display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap"}}>
                {[["PCT", s.requires_pct], ["AI", s.requires_ai], ["SERM", s.requires_serm]].map(([l, req]) => (
                  <Pill key={l} style={{
                    borderColor: req ? "color-mix(in srgb, var(--warn) 40%, var(--border))" : "var(--border)",
                    color: req ? "var(--warn)" : "var(--fg-dim)",
                    background: req ? "color-mix(in srgb, var(--warn) 7%, transparent)" : "var(--surface)",
                  }}>{req ? `requires ${l}` : `no ${l}`}</Pill>
                ))}
                <Pill>half-life {s.half_life}</Pill>
                <Pill style={{borderColor: "color-mix(in srgb, var(--neg) 35%, var(--border))", color: "var(--neg)"}}>cycling required</Pill>
              </div>

              <div className="eyebrow" style={{marginBottom: 6}}>Legal status by jurisdiction</div>
              <div className="grid g-cols-4" style={{gap: 8, marginBottom: 12}}>
                {Object.entries(s.legal_status).map(([j, v]) => (
                  <Card key={j} className="card-tight" style={{padding: 10}}>
                    <div className="eyebrow">{j}</div>
                    <div style={{fontSize: 11.5, marginTop: 2, color: v.includes("banned") || v.includes("not approved") ? "var(--neg)" : v.includes("Rx") || v.includes("Schedule") || v.includes("Class") ? "var(--warn)" : "var(--pos)"}}>{v}</div>
                  </Card>
                ))}
              </div>

              <div style={{padding: 12, background: "color-mix(in srgb, var(--acc-medic) 6%, var(--surface))", border: "1px solid color-mix(in srgb, var(--acc-medic) 25%, var(--border))", borderRadius: 7, fontSize: 11.5, color: "var(--fg-muted)", lineHeight: 1.55}}>
                <Icon name="medical" className="ic ic-sm" style={{display: "inline", verticalAlign: "middle", marginRight: 5, color: "var(--acc-medic)"}}/>
                Adding this to a stack requires physician name, cycling protocol, and a Pre-Cycle bloodwork panel. LumeOS tracks — it does not prescribe.
              </div>
            </>
          )}

          {!isEnh && (
            <>
              <div className="eyebrow" style={{marginBottom: 6}}>Goals it supports</div>
              <div style={{display: "flex", gap: 4, flexWrap: "wrap"}}>{(s.goals || []).map(g => <Pill key={g}>{g}</Pill>)}</div>
            </>
          )}
        </div>
        <div className="modal-f">
          <button className="btn btn-ghost" onClick={onClose}>Close</button>
          <div className="spacer"/>
          {s.inStack
            ? <button className="btn">Edit in stack</button>
            : <button className="btn btn-primary"><Icon name="plus" className="ic ic-sm"/>Add to stack{isEnh ? " · gated" : ""}</button>}
        </div>
      </div>
    </div>
  );
};

// ── Stacks + templates ────────────────────────────────────
window.SuppStacksView = () => (
  <div className="grid" style={{gridTemplateColumns: "1.4fr 1fr", gap: 14}}>
    <div className="col-gap" style={{gap: 14}}>
      <Card title="My stacks" sub="only one active at a time · DB EXCLUDE constraint"
        actions={<button className="btn btn-sm"><Icon name="plus" className="ic ic-sm"/>New stack</button>}>
        <div className="col-gap" style={{gap: 6}}>
          {USER_STACKS.map(s => (
            <div key={s.id} style={{
              display: "flex", alignItems: "center", gap: 10, padding: 12, borderRadius: 7,
              background: s.active ? "color-mix(in srgb, var(--acc-suppl) 8%, var(--surface))" : "var(--surface)",
              border: `1px solid ${s.active ? "color-mix(in srgb, var(--acc-suppl) 32%, var(--border))" : "var(--border)"}`,
            }}>
              <div style={{flex: 1, minWidth: 0}}>
                <div style={{display: "flex", alignItems: "center", gap: 8, marginBottom: 3}}>
                  <span style={{fontSize: 13, fontWeight: 600}}>{s.name}</span>
                  {s.active && <Pill variant="acc" style={{fontSize: 9}}>active</Pill>}
                  <Pill style={{fontSize: 9}}>{s.source}</Pill>
                </div>
                <div className="dim mono" style={{fontSize: 10}}>{s.items} items · since {s.since}</div>
              </div>
              {!s.active && <button className="btn btn-sm">Activate</button>}
              <button className="btn btn-ghost btn-sm">Edit</button>
            </div>
          ))}
        </div>
        <div style={{marginTop: 10, padding: 10, background: "var(--surface)", borderRadius: 6, fontSize: 11, color: "var(--fg-muted)", lineHeight: 1.5}}>
          Activating a stack automatically deactivates all others. Intake logs generate from the active stack only.
        </div>
      </Card>

      <Card title="System templates" sub="5 curated starting points">
        <div className="col-gap" style={{gap: 6}}>
          {STACK_TEMPLATES.map(t => (
            <div key={t.id} style={{padding: 12, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 7}}>
              <div style={{display: "flex", alignItems: "center", gap: 8, marginBottom: 6}}>
                <span style={{fontSize: 12.5, fontWeight: 600}}>{t.name}</span>
                <Pill style={{fontSize: 9}}>{t.goal}</Pill>
                <button className="btn btn-sm" style={{marginLeft: "auto"}}>Use template</button>
              </div>
              <div style={{display: "flex", gap: 4, flexWrap: "wrap"}}>
                {t.items.map(i => <Pill key={i} style={{fontSize: 9.5}}>{i}</Pill>)}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
    <div className="col-gap" style={{gap: 14}}>
      <Card title="Frequency options" sub="days per month used for cost + compliance">
        {FREQUENCY_OPTIONS.map(f => (
          <Row key={f.id} label={f.label} value={`${f.days} d/mo`} sub={f.id}/>
        ))}
      </Card>
      <Card title="Item customization" sub="per stack item">
        <Row label="Custom name" value='"Morning Magnesium"'/>
        <Row label="Own dose" value="can deviate from rec."/>
        <Row label="Own timing" value="any slot"/>
        <Row label="Cycling config" value="{on_weeks, off_weeks}"/>
        <div className="divider"/>
        <div className="dim" style={{fontSize: 11, lineHeight: 1.5}}>
          Cycling config drives intake-log generation: during an off week no log is created at all.
        </div>
      </Card>
    </div>
  </div>
);

// ── Intelligence engine ───────────────────────────────────
const GAP_ROWS = [
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

window.SuppIntelligenceView = () => {
  const gaps = GAP_ROWS.map(r => {
    const total = r.nutrition + r.supp;
    const pct = Math.round((total / r.rda) * 100);
    return { ...r, total, pct, is_gap: pct < 80, redundant: r.supp > 0 && pct > 150 };
  });
  const gapCount = gaps.filter(g => g.is_gap).length;
  const redundant = gaps.filter(g => g.redundant);
  return (
    <div>
      <div className="grid g-cols-4" style={{gap: 10, marginBottom: 14}}>
        <Card className="card-tight" style={{padding: 14}}>
          <div className="eyebrow">Gaps · below 80% RDA</div>
          <div className="num" style={{fontSize: 22, color: gapCount ? "var(--warn)" : "var(--pos)"}}>{gapCount}</div>
          <div className="dim" style={{fontSize: 11}}>of {gaps.length} tracked</div>
        </Card>
        <Card className="card-tight" style={{padding: 14}}>
          <div className="eyebrow">Redundancies</div>
          <div className="num" style={{fontSize: 22, color: redundant.length ? "var(--warn)" : "var(--pos)"}}>{redundant.length}</div>
          <div className="dim" style={{fontSize: 11}}>multi-source &gt; 150% RDA</div>
        </Card>
        <Card className="card-tight" style={{padding: 14}}>
          <div className="eyebrow">Session today</div>
          <div className="num" style={{fontSize: 16}}>Push B</div>
          <div className="dim" style={{fontSize: 11}}>pre/post items active</div>
        </Card>
        <Card className="card-tight" style={{padding: 14}}>
          <div className="eyebrow">Monthly cost</div>
          <div className="num" style={{fontSize: 22}}>€{CATALOG.filter(s => s.inStack).reduce((sum, s) => sum + s.cost_per_serving * 30, 0).toFixed(0)}</div>
          <div className="dim" style={{fontSize: 11}}>{CATALOG.filter(s => s.inStack).length} active items</div>
        </Card>
      </div>

      <div className="grid" style={{gridTemplateColumns: "1.5fr 1fr", gap: 14}}>
        <Card title="Gap analysis" sub="Nutrition micros + supplement contribution vs. RDA">
          <table className="tbl">
            <thead><tr><th>Nutrient</th><th style={{width: 90, textAlign: "right"}}>Food</th><th style={{width: 90, textAlign: "right"}}>Supps</th><th style={{width: 90, textAlign: "right"}}>Total</th><th style={{width: 80, textAlign: "right"}}>RDA</th><th style={{width: 120}}>Coverage</th><th style={{width: 70, textAlign: "right"}}>%</th></tr></thead>
            <tbody>
              {gaps.map(g => (
                <tr key={g.code} style={g.is_gap ? {background: "color-mix(in srgb, var(--warn) 5%, transparent)"} : undefined}>
                  <td>
                    <div style={{fontSize: 12}}>{g.name}</div>
                    <div className="dim mono" style={{fontSize: 9.5}}>{g.code}</div>
                  </td>
                  <td className="num muted" style={{textAlign: "right"}}>{g.nutrition}</td>
                  <td className="num" style={{textAlign: "right", color: g.supp > 0 ? "var(--acc-suppl)" : "var(--fg-dim)"}}>{g.supp || "—"}</td>
                  <td className="num" style={{textAlign: "right", fontWeight: 500}}>{g.total}</td>
                  <td className="num muted" style={{textAlign: "right", fontSize: 11}}>{g.rda} {g.unit}</td>
                  <td>
                    <div style={{position: "relative", height: 6, background: "var(--surface-2)", borderRadius: 999}}>
                      <div style={{position: "absolute", left: 0, top: 0, bottom: 0, width: `${Math.min((g.nutrition / g.rda) * 100, 100)}%`, background: "var(--acc-nutri)", borderRadius: 999}}/>
                      <div style={{position: "absolute", left: `${Math.min((g.nutrition / g.rda) * 100, 100)}%`, top: 0, bottom: 0, width: `${Math.min((g.supp / g.rda) * 100, 100 - Math.min((g.nutrition / g.rda) * 100, 100))}%`, background: "var(--acc-suppl)", borderRadius: 999}}/>
                      <div style={{position: "absolute", left: "80%", top: -2, bottom: -2, width: 1, background: "var(--fg-dim)"}}/>
                    </div>
                  </td>
                  <td className="num" style={{textAlign: "right", color: g.is_gap ? "var(--warn)" : g.pct > 150 ? "var(--acc-goals)" : "var(--pos)"}}>{g.pct}%</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{display: "flex", gap: 14, marginTop: 10, fontSize: 10, color: "var(--fg-muted)"}}>
            <span className="row-gap"><span style={{width: 10, height: 8, background: "var(--acc-nutri)", borderRadius: 2}}/>from food</span>
            <span className="row-gap"><span style={{width: 10, height: 8, background: "var(--acc-suppl)", borderRadius: 2}}/>from supplements</span>
            <span className="row-gap"><span style={{width: 1, height: 10, background: "var(--fg-dim)"}}/>80% gap threshold</span>
          </div>
        </Card>

        <div className="col-gap" style={{gap: 14}}>
          <Card title="Redundancy detection" sub="multiple sources · over 150% RDA">
            {redundant.length === 0
              ? <div className="dim" style={{fontSize: 12, padding: 12, textAlign: "center"}}>No redundancies detected.</div>
              : redundant.map(r => (
                  <div key={r.code} style={{padding: 10, background: "color-mix(in srgb, var(--acc-goals) 6%, var(--surface))", border: "1px solid color-mix(in srgb, var(--acc-goals) 25%, var(--border))", borderRadius: 6, marginBottom: 6}}>
                    <div style={{display: "flex", alignItems: "center", gap: 8, marginBottom: 4}}>
                      <span style={{fontSize: 12.5, fontWeight: 600}}>{r.name}</span>
                      <span className="num" style={{marginLeft: "auto", color: "var(--acc-goals)", fontSize: 12}}>{r.pct}% RDA</span>
                    </div>
                    <div className="dim" style={{fontSize: 10.5, lineHeight: 1.45}}>
                      {r.total} {r.unit} total · {r.supp} from supplements + {r.nutrition} from food. Consider reducing the supplemental dose.
                    </div>
                  </div>
                ))}
          </Card>

          <Card title="Training-aware timing" sub="reads today's session from Training">
            <div style={{padding: 10, background: "color-mix(in srgb, var(--acc-train) 6%, var(--surface))", border: "1px solid color-mix(in srgb, var(--acc-train) 25%, var(--border))", borderRadius: 6, marginBottom: 10}}>
              <div style={{fontSize: 12.5, fontWeight: 600, marginBottom: 3}}>Push B today · 17:30</div>
              <div className="dim" style={{fontSize: 11}}>Pre- and post-workout items are active.</div>
            </div>
            <div className="eyebrow" style={{marginBottom: 6}}>Pre-workout</div>
            {["Beta-Alanine · 3.2 g", "Caffeine · 200 mg"].map(i => (
              <div key={i} className="row" style={{padding: "6px 0"}}>
                <span className="row-l" style={{fontSize: 11.5}}>{i}</span>
                <Pill variant="pos" style={{fontSize: 9}}>active</Pill>
              </div>
            ))}
            <div className="eyebrow" style={{marginBottom: 6, marginTop: 10}}>Post-workout</div>
            <div className="row" style={{padding: "6px 0"}}>
              <span className="row-l" style={{fontSize: 11.5}}>Whey Isolate · 30 g</span>
              <Pill variant="pos" style={{fontSize: 9}}>active</Pill>
            </div>
            <div className="divider"/>
            <div className="dim mono" style={{fontSize: 10, lineHeight: 1.6}}>
              rest day → pre-workout items get<br/>suggested_skip = true, post = []
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

// ── Interaction checker ───────────────────────────────────
window.SuppInteractionsView = () => {
  const order = ["critical","warning","caution","info"];
  const rows = [...INTERACTION_DB].sort((a, b) => order.indexOf(a.severity) - order.indexOf(b.severity));
  const counts = Object.fromEntries(order.map(s => [s, rows.filter(r => r.severity === s).length]));
  const blocking = rows.filter(r => r.blocks);
  return (
    <div>
      <div className="grid g-cols-4" style={{gap: 10, marginBottom: 14}}>
        {order.map(s => {
          const m = SEVERITY_META[s];
          return (
            <Card key={s} className="card-tight" style={{padding: 14, borderLeft: `2px solid ${m.c}`}}>
              <div className="eyebrow" style={{color: m.c}}>{m.label}</div>
              <div className="num" style={{fontSize: 22, color: m.c}}>{counts[s]}</div>
              <div className="dim" style={{fontSize: 10.5, lineHeight: 1.4, marginTop: 2}}>{m.action}</div>
            </Card>
          );
        })}
      </div>

      {blocking.length > 0 && (
        <div style={{padding: 14, background: "color-mix(in srgb, var(--neg) 8%, var(--surface))", border: "1px solid color-mix(in srgb, var(--neg) 35%, var(--border))", borderRadius: 8, marginBottom: 14}}>
          <div style={{display: "flex", alignItems: "center", gap: 10, marginBottom: 6}}>
            <Icon name="alert" className="ic" style={{color: "var(--neg)"}}/>
            <span style={{fontSize: 13.5, fontWeight: 600, color: "var(--neg)"}}>{blocking.length} intake blocked</span>
            <Pill style={{borderColor: "color-mix(in srgb, var(--neg) 40%, var(--border))", color: "var(--neg)"}}>blocks_intake = true</Pill>
          </div>
          <div className="muted" style={{fontSize: 12, lineHeight: 1.55}}>
            {blocking.map(b => `${b.a} + ${b.b}`).join(" · ")} — logging is disabled until resolved or a physician override is recorded.
          </div>
          <div style={{display: "flex", gap: 6, marginTop: 10}}>
            <button className="btn btn-sm">Resolve · adjust stack</button>
            <button className="btn btn-ghost btn-sm">Record physician override</button>
          </div>
        </div>
      )}

      <Card title="Detected interactions" sub="rule-based · deterministic · runs on add, activate, and daily generation">
        <div className="col-gap" style={{gap: 6}}>
          {rows.map((r, i) => {
            const m = SEVERITY_META[r.severity];
            return (
              <div key={i} style={{
                padding: 12, borderRadius: 7,
                background: `color-mix(in srgb, ${m.c} 5%, var(--surface))`,
                border: `1px solid color-mix(in srgb, ${m.c} 25%, var(--border))`,
              }}>
                <div style={{display: "flex", alignItems: "center", gap: 8, marginBottom: 5, flexWrap: "wrap"}}>
                  <Pill style={{borderColor: `color-mix(in srgb, ${m.c} 40%, var(--border))`, color: m.c, fontWeight: 600, fontSize: 9.5}}>{m.label}</Pill>
                  <span style={{fontSize: 12.5, fontWeight: 500}}>{r.a}</span>
                  <span className="dim">+</span>
                  <span style={{fontSize: 12.5, fontWeight: 500}}>{r.b}</span>
                  <Pill style={{marginLeft: "auto", fontSize: 9.5}}>{TIMING_LABEL[r.timing]}</Pill>
                  {r.blocks && <Pill style={{borderColor: "color-mix(in srgb, var(--neg) 40%, var(--border))", color: "var(--neg)", fontSize: 9.5}}>blocks intake</Pill>}
                </div>
                <div className="muted" style={{fontSize: 11.5, lineHeight: 1.5}}>{r.note}</div>
                {r.severity === "warning" && (
                  <div style={{display: "flex", gap: 6, marginTop: 8}}>
                    <button className="btn btn-sm">Acknowledge</button>
                    <button className="btn btn-ghost btn-sm">Apply timing fix</button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};

// ── Inventory ─────────────────────────────────────────────
window.SuppInventoryView = () => {
  const rows = INVENTORY.map(i => {
    const daysLeft = Math.floor(i.stock / i.perDay);
    const expMonths = (new Date(i.expiry + "-01") - new Date("2026-08-15")) / (1000 * 60 * 60 * 24 * 30);
    return { ...i, daysLeft, low: daysLeft < i.threshold, expSoon: expMonths < 1 };
  });
  const low = rows.filter(r => r.low);
  const expSoon = rows.filter(r => r.expSoon);
  return (
    <div>
      <div className="grid g-cols-4" style={{gap: 10, marginBottom: 14}}>
        <Card className="card-tight" style={{padding: 14}}>
          <div className="eyebrow">Items tracked</div>
          <div className="num" style={{fontSize: 22}}>{rows.length}</div>
        </Card>
        <Card className="card-tight" style={{padding: 14}}>
          <div className="eyebrow">Low stock</div>
          <div className="num" style={{fontSize: 22, color: low.length ? "var(--warn)" : "var(--pos)"}}>{low.length}</div>
          <div className="dim" style={{fontSize: 11}}>&lt; threshold days</div>
        </Card>
        <Card className="card-tight" style={{padding: 14}}>
          <div className="eyebrow">Expiring soon</div>
          <div className="num" style={{fontSize: 22, color: expSoon.length ? "var(--warn)" : "var(--pos)"}}>{expSoon.length}</div>
          <div className="dim" style={{fontSize: 11}}>within 30 days</div>
        </Card>
        <Card className="card-tight" style={{padding: 14}}>
          <div className="eyebrow">Reorder value</div>
          <div className="num" style={{fontSize: 22}}>€{low.reduce((s, r) => s + (CATALOG.find(c => c.id === r.id)?.cost_per_serving || 0) * 90, 0).toFixed(0)}</div>
          <div className="dim" style={{fontSize: 11}}>3-month resupply</div>
        </Card>
      </div>

      <Card title="Inventory" sub="consumption rate → days remaining"
        actions={<button className="btn btn-sm"><Icon name="download" className="ic ic-sm"/>Reorder low stock</button>}>
        <table className="tbl">
          <thead>
            <tr>
              <th>Item</th>
              <th style={{width: 90, textAlign: "right"}}>Stock</th>
              <th style={{width: 100, textAlign: "right"}}>Per day</th>
              <th style={{width: 90, textAlign: "right"}}>Days left</th>
              <th style={{width: 140}}>Runway</th>
              <th style={{width: 90}}>Expiry</th>
              <th style={{width: 100}}>Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.sort((a, b) => a.daysLeft - b.daysLeft).map(r => (
              <tr key={r.id}>
                <td>{r.name}</td>
                <td className="num" style={{textAlign: "right"}}>{r.stock} <span className="dim" style={{fontSize: 10}}>{r.unit}</span></td>
                <td className="num muted" style={{textAlign: "right"}}>{r.perDay.toFixed(2)}</td>
                <td className="num" style={{textAlign: "right", fontWeight: 500, color: r.low ? "var(--warn)" : "var(--fg)"}}>{r.daysLeft} d</td>
                <td><Meter value={Math.min(r.daysLeft, 60)} max={60} color={r.low ? "var(--warn)" : r.daysLeft < 21 ? "var(--acc-goals)" : "var(--pos)"} tall/></td>
                <td className="num muted" style={{fontSize: 11, color: r.expSoon ? "var(--warn)" : undefined}}>{r.expiry}</td>
                <td>
                  {r.low ? <Pill variant="warn" style={{fontSize: 9}}>low stock</Pill>
                    : r.expSoon ? <Pill variant="warn" style={{fontSize: 9}}>expiring</Pill>
                    : <Pill variant="pos" style={{fontSize: 9}}>ok</Pill>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="divider"/>
        <div className="dim mono" style={{fontSize: 10, lineHeight: 1.7}}>
          daily_use = Σ (dose × days_per_week / 7) per item<br/>
          days_left = current_stock / daily_use<br/>
          low_stock alert when days_left &lt; threshold (default 7)<br/>
          expiry alert 30 days before date · expired items flagged
        </div>
      </Card>
    </div>
  );
};

// ── Compliance score + pending actions ────────────────────
window.SuppScoreCard = () => {
  const items = CATALOG.filter(s => s.inStack && s.mode === "standard");
  const takenIds = ["creatine","vitd","omega3","probiotic"];
  const working = items.length;
  const taken = takenIds.length;
  const base = Math.round((taken / working) * 100);
  const weighted = items.reduce((sum, i) => sum + (takenIds.includes(i.id) ? EVIDENCE_WEIGHT[i.grade] : 0), 0) / items.length;
  const score = Math.round(weighted * 100);
  const status = score >= 80 ? { l: "ok", c: "var(--pos)" } : score >= 50 ? { l: "warn", c: "var(--warn)" } : { l: "low", c: "var(--neg)" };
  return (
    <Card title="Compliance score" sub="evidence-weighted · exported to Goals"
      actions={<Pill style={{borderColor: `color-mix(in srgb, ${status.c} 35%, var(--border))`, color: status.c}}>{status.l}</Pill>}>
      <div style={{display: "flex", alignItems: "center", gap: 16, marginBottom: 12}}>
        <Ring value={score} max={100} color={status.c} label="score" size={88} stroke={7}/>
        <div style={{flex: 1}}>
          <Row label="Base compliance" value={`${base}% · ${taken}/${working}`}/>
          <Row label="Evidence-weighted" value={`${score}%`}/>
          <Row label="Pending excluded" value="yes"/>
        </div>
      </div>
      <div className="eyebrow" style={{marginBottom: 6}}>Weight per grade</div>
      <div style={{display: "flex", gap: 4, flexWrap: "wrap"}}>
        {EVIDENCE_GRADES.map(e => (
          <Pill key={e.g} style={{borderColor: `color-mix(in srgb, ${e.c} 32%, var(--border))`, color: e.c, fontSize: 9.5}}>{e.g} = {e.w.toFixed(2)}</Pill>
        ))}
      </div>
      <div className="dim" style={{fontSize: 10.5, marginTop: 8, lineHeight: 1.5}}>
        Taking a grade-F supplement adds 0 to your score. High-evidence items carry the most weight.
      </div>
    </Card>
  );
};

window.SuppPendingActions = () => (
  <Card title="Pending actions" sub="feeds Buddy's daily TODO">
    <div className="col-gap" style={{gap: 6}}>
      {[
        { type: "take_supplement", t: "3 intakes pending past their slot", s: "Beta-Alanine + Caffeine 17:30 · Magnesium 22:00", c: "var(--warn)", act: "Mark taken" },
        { type: "low_stock",       t: "Omega-3 below threshold", s: "8 servings · 8 days left · threshold 7", c: "var(--warn)", act: "Reorder" },
        { type: "interaction_unresolved", t: "Critical interaction unresolved", s: "Oxandrolone + MK-677 · blocks intake", c: "var(--neg)", act: "Resolve" },
        { type: "cycling_reminder", t: "Ashwagandha off-cycle starts tomorrow", s: "week 8 of 8 complete · 2 weeks off", c: "var(--acc-suppl)", act: "Acknowledge" },
        { type: "bloodwork_due",    t: "Mid-cycle bloodwork due", s: "MK-677 week 7 · 30+ marker panel", c: "var(--acc-medic)", act: "Book panel" },
      ].map((a, i) => (
        <div key={i} style={{display: "flex", alignItems: "center", gap: 10, padding: 10, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6}}>
          <div style={{width: 3, alignSelf: "stretch", background: a.c, borderRadius: 2}}/>
          <div style={{flex: 1, minWidth: 0}}>
            <div style={{fontSize: 12.5, fontWeight: 500}}>{a.t}</div>
            <div className="dim" style={{fontSize: 10.5, marginTop: 2}}>{a.s}</div>
          </div>
          <span className="dim mono" style={{fontSize: 9}}>{a.type}</span>
          <button className="btn btn-sm">{a.act}</button>
        </div>
      ))}
    </div>
  </Card>
);

// ── Add-to-stack modal that reads the catalog ─────────────
window.AddFromCatalogModal = ({ mode = "standard", onClose }) => {
  const [q, setQ] = React.useState("");
  const [sel, setSel] = React.useState(null);
  const [freq, setFreq] = React.useState("daily");
  const rows = CATALOG
    .filter(s => mode === "all" ? true : s.mode === mode)
    .filter(s => !s.inStack)
    .filter(s => !q || (s.name + s.name_de + s.cat).toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => "SABCDF".indexOf(a.grade) - "SABCDF".indexOf(b.grade));
  const isEnh = mode === "enhanced";
  return (
    <div className="modal-veil" onClick={onClose}>
      <div className="modal" style={{width: 760, maxHeight: "92vh"}} onClick={e => e.stopPropagation()}>
        <div className="modal-h">
          <div style={{width: 26, height: 26, borderRadius: 6,
            background: `color-mix(in srgb, ${isEnh ? "var(--acc-medic)" : "var(--acc-suppl)"} 18%, transparent)`,
            border: `1px solid color-mix(in srgb, ${isEnh ? "var(--acc-medic)" : "var(--acc-suppl)"} 38%, var(--border))`,
            color: isEnh ? "var(--acc-medic)" : "var(--acc-suppl)", display: "grid", placeItems: "center"}}><Icon name="plus" className="ic"/></div>
          <div style={{flex: 1}}>
            <div style={{fontSize: 14, fontWeight: 600}}>Add {isEnh ? "compound" : "supplement"} from catalog</div>
            <div className="dim" style={{fontSize: 11}}>{rows.length} available · evidence-sorted · reads the shared catalog</div>
          </div>
          <button className="icon-btn" onClick={onClose}><Icon name="x" className="ic"/></button>
        </div>
        <div className="modal-body" style={{padding: 16, overflowY: "auto"}}>
          <div style={{position: "relative", marginBottom: 12}}>
            <Icon name="search" className="ic ic-sm" style={{position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--fg-subtle)"}}/>
            <input value={q} onChange={e => setQ(e.target.value)} autoFocus placeholder="Search catalog…"
              style={{width: "100%", height: 32, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, padding: "0 12px 0 30px", fontSize: 12}}/>
          </div>
          <Card className="card-tight" style={{padding: 0, marginBottom: 14}}>
            <table className="tbl" style={{margin: 0}}>
              <thead><tr><th style={{width: 30, paddingLeft: 12}}></th><th>Name</th><th style={{width: 50}}>Grade</th><th style={{width: 130}}>Category</th><th style={{width: 110}}>Rec. dose</th><th style={{width: 80, textAlign: "right"}}>€/serv</th></tr></thead>
              <tbody>
                {rows.map(s => {
                  const gm = gradeMeta(s.grade);
                  const on = sel?.id === s.id;
                  return (
                    <tr key={s.id} onClick={() => setSel(s)} style={{cursor: "pointer", background: on ? `color-mix(in srgb, ${gm.c} 7%, transparent)` : undefined}}>
                      <td style={{paddingLeft: 12}}>
                        <span style={{width: 14, height: 14, borderRadius: 999, border: `1px solid ${on ? gm.c : "var(--border-strong)"}`, background: on ? gm.c : "transparent", display: "grid", placeItems: "center"}}>
                          {on && <span style={{width: 5, height: 5, borderRadius: 999, background: "var(--bg)"}}/>}
                        </span>
                      </td>
                      <td>
                        <div style={{fontSize: 12}}>{s.name}</div>
                        <div className="dim" style={{fontSize: 9.5}}>{s.name_de}</div>
                      </td>
                      <td>
                        <span style={{display: "inline-grid", placeItems: "center", width: 20, height: 20, borderRadius: 4,
                          background: `color-mix(in srgb, ${gm.c} 16%, transparent)`, border: `1px solid color-mix(in srgb, ${gm.c} 38%, transparent)`,
                          color: gm.c, fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700}}>{s.grade}</span>
                      </td>
                      <td className="muted" style={{fontSize: 11}}>{s.cat}</td>
                      <td className="num" style={{fontSize: 11}}>{s.dose}</td>
                      <td className="num" style={{textAlign: "right", fontSize: 11}}>€{s.cost_per_serving.toFixed(2)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Card>

          {sel && (
            <>
              <div className="eyebrow" style={{marginBottom: 8}}>Configure · {sel.name}</div>
              <div className="grid g-cols-3" style={{gap: 10, marginBottom: 12}}>
                <div>
                  <div className="eyebrow" style={{marginBottom: 4}}>Custom name</div>
                  <input placeholder={sel.name} style={{width: "100%", height: 30, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, padding: "0 10px", fontSize: 12}}/>
                </div>
                <div>
                  <div className="eyebrow" style={{marginBottom: 4}}>Your dose</div>
                  <input defaultValue={sel.dose.split("–")[0]} style={{width: "100%", height: 30, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, padding: "0 10px", fontSize: 12, fontFamily: "var(--font-mono)"}}/>
                </div>
                <div>
                  <div className="eyebrow" style={{marginBottom: 4}}>Timing</div>
                  <select defaultValue={sel.timing[0]} style={{width: "100%", height: 30, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, padding: "0 10px", fontSize: 12}}>
                    {["morning","midday","pre_workout","post_workout","evening","injection"].map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div className="eyebrow" style={{marginBottom: 6}}>Frequency</div>
              <div style={{display: "flex", gap: 5, marginBottom: 12, flexWrap: "wrap"}}>
                {FREQUENCY_OPTIONS.map(f => (
                  <button key={f.id} onClick={() => setFreq(f.id)} className={freq === f.id ? "btn btn-primary btn-sm" : "btn btn-sm"} style={{flex: 1}}>{f.label}</button>
                ))}
              </div>
              {freq === "cycling" && (
                <div className="grid g-cols-2" style={{gap: 10, marginBottom: 12}}>
                  <div><div className="eyebrow" style={{marginBottom: 4}}>on_weeks</div><input defaultValue="8" style={{width: "100%", height: 30, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, padding: "0 10px", fontSize: 12, fontFamily: "var(--font-mono)"}}/></div>
                  <div><div className="eyebrow" style={{marginBottom: 4}}>off_weeks</div><input defaultValue="4" style={{width: "100%", height: 30, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, padding: "0 10px", fontSize: 12, fontFamily: "var(--font-mono)"}}/></div>
                </div>
              )}
              {sel.mode === "enhanced" && (
                <>
                  <div className="eyebrow" style={{marginBottom: 6}}>Required for enhanced compounds</div>
                  <div className="grid g-cols-2" style={{gap: 10, marginBottom: 12}}>
                    <div><div className="eyebrow" style={{marginBottom: 4}}>Physician (required)</div><input placeholder="Dr. Name · Practice" style={{width: "100%", height: 30, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, padding: "0 10px", fontSize: 12}}/></div>
                    <div><div className="eyebrow" style={{marginBottom: 4}}>Prescription ref</div><input placeholder="RX-XXXXX" style={{width: "100%", height: 30, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, padding: "0 10px", fontSize: 12, fontFamily: "var(--font-mono)"}}/></div>
                  </div>
                  <div style={{padding: 10, background: "color-mix(in srgb, var(--acc-medic) 6%, var(--surface))", border: "1px solid color-mix(in srgb, var(--acc-medic) 25%, var(--border))", borderRadius: 6, fontSize: 11, color: "var(--fg-muted)", lineHeight: 1.5, marginBottom: 12}}>
                    Cycling protocol is mandatory · Pre-Cycle bloodwork panel will be scheduled ·
                    {sel.requires_pct && " PCT required ·"}{sel.requires_ai && " AI required ·"}{sel.requires_serm && " SERM required ·"}
                    {" "}detection window {sel.detection_days} days
                  </div>
                </>
              )}
              {/* live interaction preview */}
              <div className="eyebrow" style={{marginBottom: 6}}>Interaction check against active stack</div>
              {(() => {
                const hits = INTERACTION_DB.filter(x => x.a === sel.name || x.b === sel.name);
                if (hits.length === 0) return <div className="dim" style={{fontSize: 11.5, padding: 10, background: "var(--surface)", borderRadius: 6}}>No interactions found with your current stack.</div>;
                return hits.map((h, i) => {
                  const m = SEVERITY_META[h.severity];
                  return (
                    <div key={i} style={{padding: 10, background: `color-mix(in srgb, ${m.c} 6%, var(--surface))`, border: `1px solid color-mix(in srgb, ${m.c} 28%, var(--border))`, borderRadius: 6, marginBottom: 5}}>
                      <div style={{display: "flex", alignItems: "center", gap: 8, marginBottom: 3}}>
                        <Pill style={{borderColor: `color-mix(in srgb, ${m.c} 40%, var(--border))`, color: m.c, fontSize: 9}}>{m.label}</Pill>
                        <span style={{fontSize: 11.5}}>with {h.a === sel.name ? h.b : h.a}</span>
                        <Pill style={{marginLeft: "auto", fontSize: 9}}>{TIMING_LABEL[h.timing]}</Pill>
                      </div>
                      <div className="dim" style={{fontSize: 10.5, lineHeight: 1.45}}>{h.note}</div>
                    </div>
                  );
                });
              })()}
            </>
          )}
        </div>
        <div className="modal-f">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <div className="spacer"/>
          <button className="btn btn-primary" disabled={!sel} onClick={onClose}>
            <Icon name="check" className="ic ic-sm"/>Add to stack
          </button>
        </div>
      </div>
    </div>
  );
};

window.BloodworkPanelCard = () => (
  <Card title="Bloodwork panel" sub="30+ markers · Pre / Mid / Post cycle"
    actions={<button className="btn btn-sm"><Icon name="medical" className="ic ic-sm"/>Book panel</button>}>
    <div className="dim" style={{fontSize: 11.5, marginBottom: 12, lineHeight: 1.55}}>
      Tracked in the Medical module and correlated against your enhanced logs.
    </div>
    <div className="grid g-cols-2" style={{gap: 8}}>
      {BLOODWORK_PANEL.map(g => (
        <Card key={g.grp} className="card-tight" style={{padding: 10}}>
          <div className="eyebrow" style={{marginBottom: 5}}>{g.grp} · {g.m.length}</div>
          <div style={{display: "flex", gap: 3, flexWrap: "wrap"}}>
            {g.m.map(m => <Pill key={m} style={{fontSize: 9}}>{m}</Pill>)}
          </div>
        </Card>
      ))}
    </div>
    <div className="divider"/>
    <div style={{display: "flex", gap: 14, fontSize: 11, color: "var(--fg-muted)"}}>
      <span>Total <span className="num" style={{color: "var(--fg)"}}>{BLOODWORK_PANEL.reduce((s, g) => s + g.m.length, 0)} markers</span></span>
      <span>Last panel <span className="num" style={{color: "var(--fg)"}}>Apr 23</span></span>
      <span>Next <span className="num" style={{color: "var(--warn)"}}>due now · mid-cycle</span></span>
    </div>
  </Card>
);

Object.assign(window, {
  CATALOG, EVIDENCE_GRADES, EVIDENCE_WEIGHT, gradeMeta, ENHANCED_CATEGORIES,
  BLOODWORK_PANEL, STACK_TEMPLATES, USER_STACKS, FREQUENCY_OPTIONS,
  INTERACTION_DB, SEVERITY_META, TIMING_LABEL, INVENTORY,
});
