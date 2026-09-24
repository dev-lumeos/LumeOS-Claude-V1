// Die Enhanced-Katalogeintraege — G-499/N1.
//
// ══ WARUM SIE NICHT MEHR IN `spec-daten.ts` STEHEN ═════════════════
//
// `[cmd]` **Gemessen am 2026-09-24, Produktionsbau:** im Seitenchunk
// lagen **13 von 15 gesuchten Mustern** — nicht vier Namen, sondern
// `half_life`, `legal_status`, `Schedule III`, `Rx only`, `PCT`,
// `AAS`, `mode:"enhanced"`, `detection_days`.
//
// `[cmd]` **Woertlich aus `page-0a6ae767eea23a46.js`:**
// `{id:"hcg", name:"HCG", mode:"enhanced", cat:"PCT",` — mit
// `dose`, `half_life` und `legal_status`.
//
// `[read]` **Mein Bericht zu G-499 sagte, dort staenden *„nur Namen
// und Preise, keine Dosis, kein Schema"*. Das war falsch** — ich
// hatte nach vier Namen gesucht statt nach den FELDERN.
//
// ── DIE KETTE, GEMESSEN ─────────────────────────────────────────
//
//     spec-daten.ts         traegt test_cyp, hcg, dose,
//                           half_life, legal_status
//     fehlende-kacheln.tsx  importiert GAP_ROWS + INTERACTION_DB
//     ansicht.tsx           importiert fehlende-kacheln
//     tabs.tsx              importiert fehlende-kacheln
//
// `[read]` **`ansicht.tsx` und `tabs.tsx` laufen auf JEDEM Reiter**
// — die Liste ging an jeden Besucher, auch an den, der nie auf
// Extended klickt.
//
// `[read]` **Derselbe fuenfte Weg wie bei `daten-extended.ts`, nur
// eine Datei weiter: ein Modul ist unteilbar.** `fehlende-kacheln`
// holt zwei kleine Konstanten — und bekommt den ganzen Katalog
// dazu, weil Baumschnitt nicht greift, wenn der Rest gebraucht
// wird.
//
// `[cmd]` **Niemand im Seitenbuendel liest die Felder ueberhaupt:**
// `tab-spec.tsx` nutzt aus `CATALOG` nur `id`, `name`,
// `cost_per_serving` und `inStack` — `half_life` und
// `legal_status` kommen in keiner Anzeige vor. **Reine Nutzlast.**
import type { KatalogEintrag } from './spec-daten'

/** Die 17 Enhanced-Eintraege — Hormone, Peptide, PCT. */
export const CATALOG_ENHANCED: KatalogEintrag[] = [
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

/**
 * Die Wechselwirkungspaare, die Enhanced-Stoffe nennen — G-499/N1.
 *
 * `[cmd]` **Sie standen in `INTERACTION_DB` in `spec-daten.ts`** und
 * gingen damit ueber `fehlende-kacheln.tsx` an jeden Besucher —
 * **mit Wirkhinweis und Abstandsregel.**
 *
 * `[read]` **Nicht geloescht, nur verschoben** — wer Extended baut,
 * braucht sie; die vier uebrigen Paare tragen die Kachel weiter.
 */
export const INTERACTION_DB_ENHANCED = [
  { a: "Anastrozole", b: "Testosterone Cypionate", severity: "info",     timing: "take_together", note: "Intended pairing — AI controls aromatization from exogenous T.", blocks: false },
  { a: "Nandrolone Decanoate", b: "Anastrozole",   severity: "warning",  timing: "avoid",         note: "Nandrolone is progestagenic — AI does not control prolactin. Needs cabergoline instead.", blocks: false },
  { a: "Oxandrolone", b: "MK-677",                 severity: "critical", timing: "avoid",         note: "Both raise hepatic load and fasting glucose. Combined use exceeds safe threshold without medical supervision.", blocks: true },
];
