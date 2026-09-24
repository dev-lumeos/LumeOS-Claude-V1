// Das Injektionsprotokoll des Entwurfs — G-500, E-88.
//
// ══ WARUM ES NICHT MEHR IN `injektion-daten.ts` STEHT ══════════════
//
// `[cmd]` **Gemessen am 2026-09-08 (Produktionsbau, nach FELDERN):**
// `compound:`, `route:"im"`, `route:"subq"`, `needle:`, `maxMl` und
// `daysAgo` lagen im Seitenchunk von `/v2/supplements` — **fuer
// jeden Besucher, auch ohne Erfahrungsgrad.**
//
// `[cmd]` **Alle 17 `compound`-Eintraege nennen PED-Stoffe:**
// Testosterone Cypionate (9x), HCG (6x), BPC-157 (2x) — **mit
// Dosis (`mg`), Menge (`ml`), Weg (`route`) und Nadelstaerke
// (`needle`).** `[read]` **Das ist kein Katalog, sondern ein
// nachgestelltes Injektionsprotokoll.**
//
// **Tom, E-88 (uebertragen):** *„Die Referenz zeigt
// Extended-INHALT, also folgt sie Extendeds Regel."*
//
// ── WAS HIER NICHT STEHT: DIE ORTE ──────────────────────────────
//
// `[read]` **`INJ_ORTE` bleibt in `injektion-daten.ts`** — die 16
// Einstichstellen sind Anatomie, kein Wirkstoff: Gluteus, Quad,
// Deltoid, Abdomen, mit Ruhefenster und Nadelempfehlung.
// `[cmd]` **Gemessen: kein `compound`, kein `mg` darin.**
//
// `[read]` **Der REITER bleibt deshalb bedienbar** — es gibt
// Injektionen ohne PED (B12, Vitamin D). **Ohne Protokoll stehen
// alle 16 Orte auf `fresh`**, das ist die richtige Aussage fuer
// jemanden ohne erfasste Einnahmen.
//
// `[read]` **Ein Modul ist unteilbar** (G-499): solange das
// Protokoll neben den Orten stand, zogen `modale.tsx` und
// `tab-injektionen.tsx` es mit ins Buendel — **beide brauchen nur
// die Orte.**
import type { InjEintrag, InjPlan } from './injektion-daten'

export const INJ_PROTOKOLL: InjEintrag[] = [
  { id: "i1",  date: "2026-08-14", site: "glute_r",  compound: "Testosterone Cypionate", ml: 0.6, mg: 150, route: "im",   needle: "23G × 1.5\"", pain: 1, notes: "" , daysAgo: 1 },
  { id: "i2",  date: "2026-08-12", site: "abd_l",    compound: "HCG",                    ml: 0.3, mg: null, route: "subq", needle: "29G × 0.5\"", pain: 0, notes: "500 IU", daysAgo: 3 },
  { id: "i3",  date: "2026-08-11", site: "glute_l",  compound: "Testosterone Cypionate", ml: 0.6, mg: 150, route: "im",   needle: "23G × 1.5\"", pain: 1, notes: "" , daysAgo: 4 },
  { id: "i4",  date: "2026-08-09", site: "abd_r",    compound: "HCG",                    ml: 0.3, mg: null, route: "subq", needle: "29G × 0.5\"", pain: 0, notes: "500 IU", daysAgo: 6 },
  { id: "i5",  date: "2026-08-08", site: "vglute_r", compound: "BPC-157",                ml: 0.25, mg: 0.25, route: "subq", needle: "29G × 0.5\"", pain: 0, notes: "near elbow site", daysAgo: 7 },
  { id: "i6",  date: "2026-08-07", site: "quad_l",   compound: "Testosterone Cypionate", ml: 0.6, mg: 150, route: "im",   needle: "25G × 1\"",  pain: 2, notes: "slight soreness 24h", daysAgo: 8 },
  { id: "i7",  date: "2026-08-05", site: "abd_l",    compound: "HCG",                    ml: 0.3, mg: null, route: "subq", needle: "29G × 0.5\"", pain: 0, notes: "", daysAgo: 10 },
  { id: "i8",  date: "2026-08-04", site: "vglute_l", compound: "Testosterone Cypionate", ml: 0.6, mg: 150, route: "im",   needle: "23G × 1.25\"", pain: 1, notes: "", daysAgo: 11 },
  { id: "i9",  date: "2026-08-02", site: "delt_r",   compound: "BPC-157",                ml: 0.25, mg: 0.25, route: "subq", needle: "29G × 0.5\"", pain: 1, notes: "", daysAgo: 13 },
  { id: "i10", date: "2026-08-01", site: "glute_r",  compound: "Testosterone Cypionate", ml: 0.6, mg: 150, route: "im",   needle: "23G × 1.5\"", pain: 1, notes: "", daysAgo: 14 },
];

export const INJ_PLAN: InjPlan[] = [
  { date: "2026-08-17", day: "Mon", compound: "Testosterone Cypionate", ml: 0.6, route: "im",   suggested: "vglute_l", why: "longest rested IM site (13d)" },
  { date: "2026-08-18", day: "Tue", compound: "HCG",                    ml: 0.3, route: "subq", suggested: "thigh_sq_l", why: "never used · rotates away from abdomen" },
  { date: "2026-08-20", day: "Thu", compound: "Testosterone Cypionate", ml: 0.6, route: "im",   suggested: "quad_r",   why: "9d since quad use, contralateral to last" },
  { date: "2026-08-21", day: "Fri", compound: "HCG",                    ml: 0.3, route: "subq", suggested: "abd_r",    href: true, why: "abdomen rest satisfied (12d)" },
  { date: "2026-08-24", day: "Mon", compound: "Testosterone Cypionate", ml: 0.6, route: "im",   suggested: "vglute_r", why: "completes 4-site IM rotation" },
  { date: "2026-08-25", day: "Tue", compound: "HCG",                    ml: 0.3, route: "subq", suggested: "sq_delt_l",why: "spreads SubQ load to arms" },
  { date: "2026-08-27", day: "Thu", compound: "Testosterone Cypionate", ml: 0.6, route: "im",   suggested: "glute_l",  why: "glute rest satisfied (16d)" },
];
