// Die Daten des Injections-Tabs (G-45).
//
// QUELLE: theme-v1/module-supplements-injection.jsx
//   INJ_SITES     Zeile  5-21   (16 Injektionsorte)
//   INJ_LOG       Zeile 25-36   (10 Eintraege, juengster zuerst)
//   INJ_SCHEDULE  Zeile 49-57   (7 geplante Injektionen)
//
// `[cmd]` MECHANISCH UEBERNOMMEN, nicht abgetippt. Geaendert wurde nur
// `const` -> `export const` und die Typannotation.
//
// `[cmd]` WARUM EIGENE ORTE UND NICHT `INJEKTIONS_ORTE` AUS
// packages/ui: Die beiden Listen decken sich nur zu acht von sechzehn.
// Die Vorlage fuehrt hier acht Orte, die es dort nicht gibt
// (`vglute_*`, `abd_*`, `sq_delt_*`, `thigh_sq_*` — die SubQ-Stellen)
// und sechs Felder je Ort, die dort fehlen: `route`, `maxMl`,
// `restDays`, `needle`, `short`, `note`. Ohne sie gibt es weder
// Ruhefenster noch Volumengrenze noch Nadelempfehlung — also genau
// das, worum es in diesem Tab geht.
//
// **Entscheidung Tom, 2026-08-18:** Vorlage 1:1 im Modul,
// `packages/ui` bleibt unangetastet.

/** IM = intramuskulaer, SubQ = subkutan. */
export type Weg = 'im' | 'subq'

export type InjOrt = {
  id: string
  name: string
  /** Zweibuchstabiges Kuerzel, steht im Punkt auf der Karte. */
  short: string
  route: Weg
  /** Hoechstmenge je Injektion in Millilitern. */
  maxMl: number
  /** Ruhefenster in Tagen, bevor der Ort wieder dran ist. */
  restDays: number
  view: 'front' | 'back'
  /** Prozentkoordinate im viewBox 100x120 der Vorlage. */
  x: number
  y: number
  needle: string
  note: string
}

export type InjEintrag = {
  id: string
  date: string
  site: string
  compound: string
  ml: number
  mg: number | null
  route: Weg
  needle: string
  /** 0-3, wie in der Vorlage. */
  pain: number
  notes: string
  daysAgo: number
}

export type InjPlan = {
  date: string
  day: string
  compound: string
  ml: number
  route: Weg
  suggested: string
  why: string
  href?: boolean
}

export const INJ_ORTE: InjOrt[] = [
  { id: "glute_l",  name: "Gluteus L",      short: "GL", route: "im",   maxMl: 3.0, restDays: 7,  view: "back",  x: 38, y: 55, needle: "23G × 1.5\"", note: "Ventro-dorsal upper outer quadrant" },
  { id: "glute_r",  name: "Gluteus R",      short: "GR", route: "im",   maxMl: 3.0, restDays: 7,  view: "back",  x: 62, y: 55, needle: "23G × 1.5\"", note: "Ventro-dorsal upper outer quadrant" },
  { id: "vglute_l", name: "Ventroglutal L", short: "VL", route: "im",   maxMl: 2.5, restDays: 7,  view: "front", x: 33, y: 52, needle: "23G × 1.25\"", note: "Safest IM site · no sciatic risk" },
  { id: "vglute_r", name: "Ventroglutal R", short: "VR", route: "im",   maxMl: 2.5, restDays: 7,  view: "front", x: 67, y: 52, needle: "23G × 1.25\"", note: "Safest IM site · no sciatic risk" },
  { id: "quad_l",   name: "Quad L",         short: "QL", route: "im",   maxMl: 2.0, restDays: 5,  view: "front", x: 37, y: 74, needle: "25G × 1\"",   note: "Vastus lateralis · outer third" },
  { id: "quad_r",   name: "Quad R",         short: "QR", route: "im",   maxMl: 2.0, restDays: 5,  view: "front", x: 63, y: 74, needle: "25G × 1\"",   note: "Vastus lateralis · outer third" },
  { id: "delt_l",   name: "Deltoid L",      short: "DL", route: "im",   maxMl: 1.0, restDays: 5,  view: "front", x: 19, y: 27, needle: "25G × 1\"",   note: "3 finger-widths below acromion" },
  { id: "delt_r",   name: "Deltoid R",      short: "DR", route: "im",   maxMl: 1.0, restDays: 5,  view: "front", x: 81, y: 27, needle: "25G × 1\"",   note: "3 finger-widths below acromion" },
  { id: "lat_l",    name: "Lat L",          short: "LL", route: "im",   maxMl: 1.5, restDays: 7,  view: "back",  x: 24, y: 40, needle: "25G × 1\"",   note: "Advanced site · thin muscle" },
  { id: "lat_r",    name: "Lat R",          short: "LR", route: "im",   maxMl: 1.5, restDays: 7,  view: "back",  x: 76, y: 40, needle: "25G × 1\"",   note: "Advanced site · thin muscle" },
  { id: "abd_l",    name: "Abdomen L",      short: "AL", route: "subq", maxMl: 1.0, restDays: 3,  view: "front", x: 42, y: 44, needle: "29G × 0.5\"", note: "2 cm from navel · pinch fold" },
  { id: "abd_r",    name: "Abdomen R",      short: "AR", route: "subq", maxMl: 1.0, restDays: 3,  view: "front", x: 58, y: 44, needle: "29G × 0.5\"", note: "2 cm from navel · pinch fold" },
  { id: "sq_delt_l",name: "SubQ Delt L",    short: "SL", route: "subq", maxMl: 0.5, restDays: 3,  view: "front", x: 15, y: 33, needle: "29G × 0.5\"", note: "Posterior upper arm fat pad" },
  { id: "sq_delt_r",name: "SubQ Delt R",    short: "SR", route: "subq", maxMl: 0.5, restDays: 3,  view: "front", x: 85, y: 33, needle: "29G × 0.5\"", note: "Posterior upper arm fat pad" },
  { id: "thigh_sq_l",name:"SubQ Thigh L",   short: "TL", route: "subq", maxMl: 1.0, restDays: 3,  view: "front", x: 31, y: 66, needle: "29G × 0.5\"", note: "Anterolateral fat pad" },
  { id: "thigh_sq_r",name:"SubQ Thigh R",   short: "TR", route: "subq", maxMl: 1.0, restDays: 3,  view: "front", x: 69, y: 66, needle: "29G × 0.5\"", note: "Anterolateral fat pad" },
];

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
