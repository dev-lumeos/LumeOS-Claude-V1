// Die Daten der Nutrition-Tabs aus der Vorlage.
//
// QUELLE: theme-v1/module-nutrition-spec.jsx
//   DIET_TAGS      Zeile 5-22
//   EU14_ALLERGENS Zeile 24
//   GHOST_ENTRIES  Zeile 326-332
//
// `[cmd]` MECHANISCH UEBERNOMMEN, nicht abgetippt. Abgetippte Zahlen
// driften; bei den Portionsgroessen des Vorgaengerrepos war das schon
// einmal Thema. Geaendert wurden nur `const` -> `export const` und die
// Typannotationen.
import type { DietTag, GhostEntry } from './typen'

export const DIET_TAGS: DietTag[] = [
  { code: "high_protein",    de: "Proteinreich",     type: "diet/fitness", rule: "PROT625 ≥ 20g/100g" },
  { code: "low_carb",        de: "Low-Carb",         type: "diet",         rule: "CHO ≤ 10g/100g" },
  { code: "low_fat",         de: "Fettarm",          type: "diet",         rule: "FAT ≤ 3g/100g" },
  { code: "high_fiber",      de: "Ballaststoffreich",type: "diet",         rule: "FIBT ≥ 6g/100g" },
  { code: "vegan",           de: "Vegan",            type: "diet",         rule: "kein Fleisch/Fisch/Ei/Milch" },
  { code: "vegetarian",      de: "Vegetarisch",      type: "diet",         rule: "kein Fleisch/Fisch" },
  { code: "gluten_free",     de: "Glutenfrei",       type: "diet",         rule: "NOT allergen_gluten" },
  { code: "lactose_free",    de: "Laktosefrei",      type: "diet",         rule: "NOT allergen_milk" },
  { code: "nut_free",        de: "Nussfrei",         type: "allergen",     rule: "NOT nuts AND NOT peanuts" },
  { code: "halal",           de: "Halal",            type: "religiös",     rule: "manuell annotiert" },
  { code: "kosher",          de: "Koscher",          type: "religiös",     rule: "manuell annotiert" },
  { code: "spicy",           de: "Scharf",           type: "Merkmal",      rule: "manuell annotiert" },
  { code: "thai_food",       de: "Thai Food",        type: "Küche",        rule: "manuell annotiert" },
  { code: "mediterranean",   de: "Mediterran",       type: "Küche",        rule: "manuell annotiert" },
  { code: "processed_food",  de: "Verarbeitet",      type: "processing",   rule: "processing_level = processed" },
  { code: "ultra_processed", de: "Hochverarbeitet",  type: "processing",   rule: "processing_level = ultra_processed" },
];

export const EU14_ALLERGENS: string[] = ["Gluten","Krebstiere","Eier","Fisch","Erdnüsse","Soja","Milch","Schalenfrüchte","Sellerie","Senf","Sesam","Schwefeldioxid","Lupinen","Weichtiere"];

export const GHOST_ENTRIES: GhostEntry[] = [
  { id: "g1", meal: "Breakfast",    time: "07:00", plan: "Recomp 5-Meal · Day 3", items: ["Haferflocken 80g","Whey 35g","Banane 120g"], status: "confirmed", kcal: 549 },
  { id: "g2", meal: "Snack",        time: "10:00", plan: "Recomp 5-Meal · Day 3", items: ["Hüttenkäse 200g","Mandeln 20g"],            status: "deviated",  kcal: 260, note: "Mandeln → Walnüsse" },
  { id: "g3", meal: "Lunch",        time: "13:00", plan: "Recomp 5-Meal · Day 3", items: ["Hähnchenbrust 180g","Basmati 200g","Salat"], status: "confirmed", kcal: 681 },
  { id: "g4", meal: "Pre-workout",  time: "16:30", plan: "Recomp 5-Meal · Day 3", items: ["Reiswaffeln 40g","Whey 30g"],               status: "pending",   kcal: 280 },
  { id: "g5", meal: "Dinner",       time: "20:00", plan: "Recomp 5-Meal · Day 3", items: ["Lachs 200g","Süßkartoffel 250g","Brokkoli"], status: "pending",  kcal: 720 },
];
