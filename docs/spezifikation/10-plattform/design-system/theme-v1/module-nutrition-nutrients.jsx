// Nutrition · Nutrient analysis — full 138-nutrient tree
// Hierarchical grouping: parent totals + drill-down children + per-nutrient detail

// ── DATA ──────────────────────────────────────────────────
// Each entry: { id, name, parent?, amount, target, ul?, unit, status,
//   what, def, tox, sources, notes? }
// status: in | low | high | warn
// parent links a child to its parent (e.g. Sugar → Carbohydrate)
// Targets reflect a 36yo male athlete (Tom), 184cm, 79kg, very active.

const NUTRIENT_TREE = [
  // ─── ENERGY & MACROS ────────────────────────────────
  { id: "energy",  name: "Energy",         group: "Macronutrients", amount: 1847, target: 2700, ul: null,  unit: "kcal", status: "low",
    what: "Total daily caloric intake. Drives weight balance and training capacity.",
    def: "Insufficient intake leads to muscle catabolism, hormonal disruption (low T, thyroid), poor recovery, mood drop.",
    tox: "Chronic excess produces fat gain, insulin resistance, inflammation, cardiovascular strain.",
    sources: ["All foods proportional to caloric density"] },
  { id: "water",   name: "Water",          group: "Macronutrients", amount: 1.2,  target: 3.0,  ul: null,  unit: "L", status: "low",
    what: "Hydration. Drives thermoregulation, blood volume, performance.",
    def: "Headaches, low HRV, performance loss, dark urine, cramping.",
    tox: "Hyponatremia (extreme intake without electrolytes) — confusion, seizures.",
    sources: ["Water", "Tea/coffee (counts)", "Soups", "Fruits (watermelon, cucumber)", "Vegetables"] },
  { id: "alcohol", name: "Alcohol",        group: "Macronutrients", amount: 0,    target: 0,    ul: 14,    unit: "g/wk", status: "in",
    what: "Ethanol. Provides 7 kcal/g, no nutritional value.",
    def: "—",
    tox: "Liver damage, sleep disruption, T suppression, training impairment > 2 drinks.",
    sources: ["Beer", "Wine", "Spirits"] },

  // PROTEIN
  { id: "protein", name: "Protein",        group: "Macronutrients", amount: 142,  target: 180, ul: null,   unit: "g",  status: "low",
    what: "Macro of amino acids. Drives muscle protein synthesis, immune function, enzymes, hormones.",
    def: "Sarcopenia, slow recovery, hair loss, edema, weakened immunity.",
    tox: "Practically: GI distress > 4g/kg. Renal stress only in pre-existing kidney disease.",
    sources: ["Whey isolate", "Chicken breast", "Salmon", "Eggs", "Greek yogurt", "Lean beef"] },
  // 9 EAAs
  { id: "histidine",     name: "Histidine",     parent: "protein", group: "Essential AAs", amount: 3.4, target: 1.3, unit: "g", status: "in",
    what: "EAA · precursor to histamine. Important for tissue repair and pH buffering (via carnosine).",
    def: "Rare. Anemia, growth issues in children.",
    tox: "Possible psychiatric effects in extreme doses.",
    sources: ["Beef", "Tuna", "Chicken", "Whey", "Eggs"] },
  { id: "isoleucine",    name: "Isoleucine",    parent: "protein", group: "Essential AAs", amount: 6.8, target: 1.4, unit: "g", status: "in",
    what: "BCAA · drives muscle recovery, glucose uptake, hemoglobin formation.",
    def: "Muscle weakness, hypoglycemia, fatigue.",
    tox: "GI distress at high isolated doses.",
    sources: ["Eggs", "Soy", "Meat", "Fish", "Whey"] },
  { id: "leucine",       name: "Leucine",       parent: "protein", group: "Essential AAs", amount: 12.1, target: 2.7, unit: "g", status: "in",
    what: "Primary mTOR trigger for muscle protein synthesis. Most anabolically potent AA.",
    def: "Reduced MPS, slow recovery.",
    tox: "Possible interference with other BCAAs at isolated 5g+ doses.",
    sources: ["Whey", "Chicken breast", "Beef", "Pumpkin seeds", "Eggs"] },
  { id: "lysine",        name: "Lysine",        parent: "protein", group: "Essential AAs", amount: 9.0, target: 2.4, unit: "g", status: "in",
    what: "EAA · collagen synthesis, calcium absorption, carnitine production.",
    def: "Slow wound healing, anemia, immune dysfunction. Often low in grain-heavy diets.",
    tox: "GI distress > 6g/day.",
    sources: ["Beef", "Tuna", "Chicken", "Beans", "Whey"] },
  { id: "methionine",    name: "Methionine",    parent: "protein", group: "Essential AAs", amount: 3.1, target: 1.1, unit: "g", status: "in",
    what: "Sulfur-containing EAA · methylation, creatine synthesis, glutathione precursor.",
    def: "Liver issues, fatty acid metabolism disruption.",
    tox: "Elevated homocysteine — pair with B6, B12, folate.",
    sources: ["Eggs", "Brazil nuts", "Fish", "Sesame seeds", "Chicken"] },
  { id: "phenylalanine", name: "Phenylalanine", parent: "protein", group: "Essential AAs", amount: 5.8, target: 1.4, unit: "g", status: "in",
    what: "EAA · precursor to tyrosine, dopamine, adrenaline.",
    def: "Cognitive fog, low mood.",
    tox: "Avoid in phenylketonuria (PKU).",
    sources: ["Soy", "Beef", "Chicken", "Eggs", "Pumpkin seeds"] },
  { id: "threonine",     name: "Threonine",     parent: "protein", group: "Essential AAs", amount: 5.6, target: 1.4, unit: "g", status: "in",
    what: "EAA · immune function, gut mucin production, collagen.",
    def: "Gut wall integrity issues, fatty liver.",
    tox: "Rare at dietary levels.",
    sources: ["Cottage cheese", "Beef", "Soy", "Lentils", "Eggs"] },
  { id: "tryptophan",    name: "Tryptophan",    parent: "protein", group: "Essential AAs", amount: 1.9, target: 0.7, unit: "g", status: "in",
    what: "EAA · precursor to serotonin (mood) and melatonin (sleep).",
    def: "Low mood, disrupted sleep, irritability.",
    tox: "Sedation, GI symptoms at supplemental doses.",
    sources: ["Turkey", "Eggs", "Cottage cheese", "Salmon", "Oats"] },
  { id: "valine",        name: "Valine",        parent: "protein", group: "Essential AAs", amount: 7.7, target: 1.8, unit: "g", status: "in",
    what: "BCAA · muscle metabolism, tissue repair, nitrogen balance.",
    def: "Muscle weakness, neurological symptoms.",
    tox: "Possible at isolated supplemental doses.",
    sources: ["Whey", "Beef", "Tuna", "Eggs", "Soy"] },
  // Conditional
  { id: "arginine",      name: "Arginine",      parent: "protein", group: "Conditional AAs", amount: 8.1, target: null, unit: "g", status: "in",
    what: "Precursor to nitric oxide. Conditional EAA — body makes it but demand can exceed supply.",
    def: "Poor wound healing, reduced vasodilation, immune dysfunction.",
    tox: "GI distress at high doses.",
    sources: ["Pumpkin seeds", "Sesame", "Soy", "Turkey", "Walnut"] },
  { id: "glutamine",     name: "Glutamine",     parent: "protein", group: "Conditional AAs", amount: 18, target: null, unit: "g", status: "in",
    what: "Most abundant AA. Fuel for gut cells and immune cells; important during stress/injury.",
    def: "Gut permeability, immune dysfunction (during severe stress only).",
    tox: "Rare. Possible at 30g+ supplemental doses.",
    sources: ["Beef", "Eggs", "Tofu", "Cabbage", "Whey"] },
  { id: "bcaa_total",    name: "BCAAs (total)", parent: "protein", group: "Sum (informational)", amount: 26.6, target: 6.0, unit: "g", status: "in",
    what: "Sum of leucine + isoleucine + valine. Drives MPS and energy for muscle.",
    def: "Reduced recovery, fatigue.",
    tox: "Rare. Isolated BCAA supplementation may displace other AAs.",
    sources: ["Whey", "Chicken", "Beef", "Eggs", "Fish"] },

  // CARBOHYDRATE
  { id: "carbs",   name: "Carbohydrate",   group: "Macronutrients", amount: 168, target: 320, ul: null,    unit: "g", status: "low",
    what: "Primary energy substrate for training. Spares protein, replenishes glycogen.",
    def: "Glycogen depletion, lethargy, poor training, sleep issues, low T3.",
    tox: "Excess (relative to expenditure) drives fat gain and insulin issues.",
    sources: ["Rice", "Oats", "Sweet potato", "Banana", "Bread"] },
  { id: "sugar",      name: "Sugar (total)",      parent: "carbs", group: "Simple", amount: 42, target: null, ul: 50, unit: "g", status: "in",
    what: "All mono- and disaccharides (added + naturally occurring).",
    def: "—",
    tox: "Insulin spikes, dental caries, fatty liver at chronic excess.",
    sources: ["Fruit", "Dairy (lactose)", "Honey", "Soft drinks", "Sweets"] },
  { id: "added_sugar", name: "Added sugar",        parent: "sugar", group: "Avoid", amount: 6, target: 0, ul: 25, unit: "g", status: "in",
    what: "Sugar added during processing or cooking. Excludes naturally-occurring sugars in whole foods.",
    def: "—",
    tox: "AHA limits at 36g/d (M) · 25g/d (F). Drives insulin and metabolic dysfunction.",
    sources: ["Soft drinks", "Sweets", "Sauces", "Yogurt (flavored)", "Breakfast cereal"] },
  { id: "fiber",   name: "Fiber",          parent: "carbs", group: "Complex", amount: 24, target: 35, unit: "g", status: "low",
    what: "Indigestible plant carbohydrate. Feeds gut microbiome, regulates blood sugar, satiety.",
    def: "Constipation, dysbiosis, glucose spikes, hunger, higher cholesterol.",
    tox: "GI distress at sudden jumps. Increase gradually.",
    sources: ["Oats", "Beans", "Berries", "Avocado", "Lentils"] },
  { id: "fiber_soluble", name: "Soluble fiber", parent: "fiber", group: "Sub", amount: 8, target: 10, unit: "g", status: "in",
    what: "Forms gel in water. Slows digestion, lowers LDL, feeds bacteria.",
    def: "Less lipid control, less satiety.",
    tox: "Bloating at sudden increase.",
    sources: ["Oats", "Beans", "Apples", "Citrus", "Psyllium"] },
  { id: "fiber_insoluble", name: "Insoluble fiber", parent: "fiber", group: "Sub", amount: 16, target: 25, unit: "g", status: "low",
    what: "Adds bulk. Promotes regularity, reduces colon cancer risk.",
    def: "Constipation.",
    tox: "GI distress, malabsorption at extreme levels.",
    sources: ["Whole grains", "Nuts", "Cauliflower", "Green beans", "Bran"] },
  { id: "starch",  name: "Starch",         parent: "carbs", group: "Complex", amount: 102, target: null, unit: "g", status: "in",
    what: "Polysaccharide. Main glycogen source for muscles.",
    def: "Glycogen depletion.",
    tox: "Excess drives glucose load.",
    sources: ["Rice", "Pasta", "Potato", "Bread", "Oats"] },

  // FAT
  { id: "fat",     name: "Fat",            group: "Macronutrients", amount: 72,  target: 90,  ul: null,    unit: "g", status: "low",
    what: "Hormone production, vitamin absorption, satiety, structural lipids.",
    def: "Low hormone production (T, estrogen), poor fat-soluble vitamin status, dry skin.",
    tox: "Excess kcal-load drives fat gain. Quality matters more than amount.",
    sources: ["Olive oil", "Salmon", "Avocado", "Nuts", "Eggs"] },
  { id: "sat_fat", name: "Saturated fat",  parent: "fat", group: "Quality", amount: 18, target: null, ul: 22, unit: "g", status: "in",
    what: "Saturated fatty acids. Stable for cooking. Health effect depends on context (source, total diet).",
    def: "—",
    tox: "Chronic excess + processed foods linked to atherogenic LDL.",
    sources: ["Beef", "Butter", "Cheese", "Coconut", "Egg yolk"] },
  { id: "mufa",    name: "Monounsaturated", parent: "fat", group: "Quality", amount: 27, target: null, unit: "g", status: "in",
    what: "Oleic acid (omega-9). Cardio-protective, anti-inflammatory.",
    def: "Linked to higher cardiovascular risk in deficiency.",
    tox: "Only via caloric excess.",
    sources: ["Olive oil", "Avocado", "Almonds", "Pecans", "Macadamia"] },
  { id: "pufa",    name: "Polyunsaturated", parent: "fat", group: "Quality", amount: 21, target: null, unit: "g", status: "in",
    what: "Sum of omega-3 + omega-6. Essential for cell membranes, signaling.",
    def: "Inflammation, dry skin, cognitive issues.",
    tox: "Excess omega-6 ratio promotes inflammation.",
    sources: ["Fatty fish", "Walnuts", "Flax", "Soybean oil", "Sunflower oil"] },
  { id: "omega3",  name: "Omega-3 (total)", parent: "pufa", group: "Essential", amount: 0.9, target: 1.6, unit: "g", status: "low",
    what: "Anti-inflammatory PUFA family. EPA+DHA most active forms.",
    def: "Higher inflammation, cardiovascular risk, mood issues, dry skin.",
    tox: "Bleeding risk at high doses + anticoagulants.",
    sources: ["Salmon", "Sardines", "Flax", "Walnuts", "Algae oil"] },
  { id: "epa",     name: "EPA",             parent: "omega3", group: "Marine", amount: 0.32, target: 0.5, unit: "g", status: "low",
    what: "Eicosapentaenoic acid. Most studied marine omega-3 for inflammation.",
    def: "Higher CRP, slower recovery, mood symptoms.",
    tox: "Bleeding risk > 5g/d.",
    sources: ["Salmon", "Sardines", "Mackerel", "Krill oil", "Algae oil"] },
  { id: "dha",     name: "DHA",             parent: "omega3", group: "Marine", amount: 0.41, target: 0.5, unit: "g", status: "low",
    what: "Docosahexaenoic acid. Brain and retinal structural lipid.",
    def: "Cognitive issues, retinal degradation, dry eye.",
    tox: "Same as EPA.",
    sources: ["Salmon", "Sardines", "Tuna", "Algae oil", "Cod liver oil"] },
  { id: "ala",     name: "ALA",             parent: "omega3", group: "Plant", amount: 0.17, target: 1.6, unit: "g", status: "low",
    what: "Alpha-linolenic acid (plant omega-3). Poor conversion to EPA/DHA (5-10%).",
    def: "—",
    tox: "Rare.",
    sources: ["Flax seeds", "Chia", "Walnuts", "Hemp seeds", "Canola"] },
  { id: "omega6",  name: "Omega-6 (LA+ARA)", parent: "pufa", group: "Essential", amount: 19.2, target: 17, unit: "g", status: "in",
    what: "Pro-inflammatory family (in excess). Ratio to omega-3 matters more than absolute amount.",
    def: "Skin issues, immune dysfunction.",
    tox: "High ratio (> 10:1 to omega-3) promotes inflammation.",
    sources: ["Soybean oil", "Corn oil", "Sunflower oil", "Walnuts", "Pumpkin seeds"] },
  { id: "trans",   name: "Trans fat",       parent: "fat", group: "Avoid", amount: 0.4, target: 0, ul: 2, unit: "g", status: "in",
    what: "Industrial trans fats from hydrogenation. Naturally-occurring CLA is benign.",
    def: "—",
    tox: "Cardiovascular disease, insulin resistance, inflammation. Avoid completely.",
    sources: ["Margarine (old formulas)", "Fried fast food", "Baked goods", "Industrial pastries"] },
  { id: "cholesterol", name: "Cholesterol", parent: "fat", group: "Other", amount: 412, target: null, ul: null, unit: "mg", status: "in",
    what: "Sterol. Dietary cholesterol has modest effect on blood cholesterol in most people.",
    def: "Rare.",
    tox: "In hyper-responders, dietary intake matters. Otherwise low priority.",
    sources: ["Eggs", "Liver", "Shellfish", "Butter", "Beef"] },

  // ─── VITAMINS ────────────────────────────────────────
  // Fat-soluble
  { id: "vit_a",   name: "Vitamin A (total RAE)", group: "Fat-soluble vitamins", amount: 780, target: 900, ul: 3000, unit: "µg RAE", status: "in",
    what: "Retinol + provitamin A carotenoids. Vision, immune, gene expression.",
    def: "Night blindness, skin issues, immune dysfunction.",
    tox: "Headaches, liver damage, birth defects (retinol form).",
    sources: ["Liver", "Sweet potato", "Carrot", "Spinach", "Egg yolk"] },
  { id: "retinol", name: "Retinol",        parent: "vit_a", group: "Form", amount: 320, target: null, unit: "µg", status: "in",
    what: "Preformed vitamin A. From animal foods. Most bioavailable form.",
    def: "—",
    tox: "Hypervitaminosis A at chronic > 3000µg.",
    sources: ["Liver", "Egg yolk", "Butter", "Cheese", "Fortified dairy"] },
  { id: "carotene", name: "β-Carotene",     parent: "vit_a", group: "Form", amount: 4600, target: null, unit: "µg", status: "in",
    what: "Provitamin A. Converts to retinol as needed — no toxicity from excess.",
    def: "—",
    tox: "Carotenodermia (orange skin). Smoker lung cancer risk at supplemental doses.",
    sources: ["Sweet potato", "Carrot", "Pumpkin", "Kale", "Spinach"] },

  { id: "vit_d",   name: "Vitamin D",       group: "Fat-soluble vitamins", amount: 30, target: 20, ul: 100, unit: "µg", status: "in",
    what: "Hormone for calcium absorption, immune, bone health. Skin synthesis via UV-B.",
    def: "Bone loss, muscle weakness, immune dysfunction, low mood.",
    tox: "Hypercalcemia at chronic supplementation > 250µg.",
    sources: ["Sun exposure", "Salmon", "Sardines", "Egg yolk", "Fortified dairy"] },
  { id: "vit_e",   name: "Vitamin E",       group: "Fat-soluble vitamins", amount: 12, target: 15, unit: "mg α-TE", status: "low",
    what: "α-tocopherol family. Antioxidant for membranes, especially PUFAs.",
    def: "Hemolytic anemia, neuropathy.",
    tox: "Bleeding risk at > 1000mg/d, anticoagulant interaction.",
    sources: ["Sunflower seeds", "Almonds", "Hazelnuts", "Avocado", "Olive oil"] },
  { id: "vit_k",   name: "Vitamin K (total)", group: "Fat-soluble vitamins", amount: 104, target: 120, unit: "µg", status: "low",
    what: "Coagulation + bone Ca routing.",
    def: "Easy bruising, slow clotting, low bone density.",
    tox: "Rare. Interferes with warfarin.",
    sources: ["Kale", "Spinach", "Broccoli", "Natto", "Cheese"] },
  { id: "vit_k1",  name: "K1 (phylloquinone)", parent: "vit_k", group: "Form", amount: 92, target: null, unit: "µg", status: "in",
    what: "Plant-based form. Primary role: coagulation.",
    def: "Bleeding.",
    tox: "Rare.",
    sources: ["Spinach", "Kale", "Broccoli", "Lettuce", "Brussels sprouts"] },
  { id: "vit_k2",  name: "K2 (menaquinone)", parent: "vit_k", group: "Form", amount: 12, target: null, unit: "µg", status: "in",
    what: "Bacterial/animal form. Routes calcium to bone (away from arteries).",
    def: "Arterial calcification, low bone density.",
    tox: "Rare.",
    sources: ["Natto", "Aged cheese", "Egg yolk", "Liver", "Fermented foods"] },

  // Water-soluble (B-complex + C + Choline)
  { id: "vit_b1",  name: "Thiamin (B1)",    group: "B vitamins", amount: 1.4, target: 1.2, unit: "mg", status: "in",
    what: "Carb metabolism, nerve function.",
    def: "Beriberi, Wernicke's encephalopathy, peripheral neuropathy.",
    tox: "Rare.",
    sources: ["Pork", "Whole grains", "Sunflower seeds", "Beans", "Trout"] },
  { id: "vit_b2",  name: "Riboflavin (B2)", group: "B vitamins", amount: 1.8, target: 1.3, unit: "mg", status: "in",
    what: "Energy production (FAD coenzyme).",
    def: "Cracks at mouth corners, sore throat, anemia.",
    tox: "Rare. Bright yellow urine at high doses (harmless).",
    sources: ["Liver", "Eggs", "Milk", "Almonds", "Mushrooms"] },
  { id: "vit_b3",  name: "Niacin (B3)",     group: "B vitamins", amount: 24, target: 16, ul: 35, unit: "mg", status: "in",
    what: "NAD precursor. Energy metabolism.",
    def: "Pellagra (4 D's: diarrhea, dermatitis, dementia, death).",
    tox: "Niacin flush, liver damage at supplemental > 1000mg.",
    sources: ["Chicken", "Tuna", "Beef", "Peanuts", "Mushrooms"] },
  { id: "vit_b5",  name: "Pantothenic acid (B5)", group: "B vitamins", amount: 6.4, target: 5, unit: "mg", status: "in",
    what: "Coenzyme A. Energy + fatty acid metabolism.",
    def: "Very rare — found in nearly all foods.",
    tox: "GI distress at very high doses.",
    sources: ["Chicken", "Eggs", "Whole grains", "Avocado", "Sweet potato"] },
  { id: "vit_b6",  name: "Pyridoxine (B6)", group: "B vitamins", amount: 1.9, target: 1.7, ul: 100, unit: "mg", status: "in",
    what: "AA metabolism, neurotransmitter synthesis.",
    def: "Dermatitis, depression, anemia, irritability.",
    tox: "Peripheral neuropathy at > 200mg chronic.",
    sources: ["Tuna", "Chicken", "Salmon", "Banana", "Sweet potato"] },
  { id: "vit_b7",  name: "Biotin (B7)",     group: "B vitamins", amount: 38, target: 30, unit: "µg", status: "in",
    what: "Fatty acid + glucose metabolism. Hair/skin.",
    def: "Very rare. Skin rash, hair loss.",
    tox: "Rare. Interferes with thyroid labs at high doses.",
    sources: ["Eggs", "Almonds", "Cauliflower", "Cheese", "Sweet potato"] },
  { id: "vit_b9",  name: "Folate (B9)",     group: "B vitamins", amount: 380, target: 400, ul: 1000, unit: "µg DFE", status: "low",
    what: "DNA synthesis, methylation, red blood cells.",
    def: "Megaloblastic anemia, neural tube defects in pregnancy, fatigue.",
    tox: "Masks B12 deficiency at > 1000µg synthetic.",
    sources: ["Leafy greens", "Beans", "Liver", "Asparagus", "Fortified grains"] },
  { id: "vit_b12", name: "Cobalamin (B12)", group: "B vitamins", amount: 4.2, target: 2.4, unit: "µg", status: "in",
    what: "Red blood cells, nerve myelination, methylation.",
    def: "Macrocytic anemia, neuropathy, cognitive decline. Vegans at risk.",
    tox: "Practically zero.",
    sources: ["Liver", "Clams", "Beef", "Salmon", "Fortified yeast"] },
  { id: "choline", name: "Choline",         group: "B vitamins", amount: 480, target: 550, unit: "mg", status: "low",
    what: "Phospholipid + neurotransmitter (acetylcholine) precursor.",
    def: "Fatty liver, cognitive issues, muscle damage.",
    tox: "Fishy body odor at very high doses.",
    sources: ["Egg yolk", "Liver", "Beef", "Salmon", "Soybeans"] },

  { id: "vit_c",   name: "Vitamin C",       group: "Other water-soluble", amount: 92, target: 90, ul: 2000, unit: "mg", status: "in",
    what: "Antioxidant, collagen, iron absorption, immune.",
    def: "Scurvy: bleeding gums, fatigue, poor wound healing.",
    tox: "GI distress, kidney stones at > 2000mg.",
    sources: ["Citrus", "Berries", "Bell pepper", "Broccoli", "Kiwi"] },

  // ─── MINERALS ────────────────────────────────────────
  // Major (>100 mg/d need)
  { id: "calcium",   name: "Calcium",       group: "Major minerals", amount: 740, target: 1000, ul: 2500, unit: "mg", status: "low",
    what: "Bone, muscle contraction, nerve signaling.",
    def: "Osteoporosis, muscle cramps, tetany.",
    tox: "Kidney stones, arterial calcification (esp. without K2).",
    sources: ["Dairy", "Sardines (w/ bones)", "Tofu", "Kale", "Almonds"] },
  { id: "phosphorus", name: "Phosphorus",    group: "Major minerals", amount: 1380, target: 700, ul: 4000, unit: "mg", status: "in",
    what: "Bone matrix + energy (ATP). Pairs with calcium.",
    def: "Very rare. Bone weakness, muscle issues.",
    tox: "Soft tissue calcification, bone resorption in CKD.",
    sources: ["Dairy", "Meat", "Fish", "Beans", "Whole grains"] },
  { id: "magnesium", name: "Magnesium",      group: "Major minerals", amount: 240, target: 350, ul: 350, unit: "mg", status: "low",
    what: "Cofactor for > 300 enzymes. Sleep, HRV, muscle relaxation.",
    def: "Cramps, poor sleep, low HRV, anxiety, hypertension.",
    tox: "Diarrhea (from supplements). Practically safe via food.",
    sources: ["Pumpkin seeds", "Spinach", "Almonds", "Dark chocolate", "Avocado"] },
  { id: "sodium",    name: "Sodium",         group: "Major minerals", amount: 2140, target: 2000, ul: 2300, unit: "mg", status: "in",
    what: "Fluid balance, BP, nerve. Athletes need more.",
    def: "Hyponatremia (cramps, confusion, fatigue).",
    tox: "Hypertension in salt-sensitive individuals.",
    sources: ["Salt", "Processed foods", "Cheese", "Olives", "Pickles"] },
  { id: "potassium", name: "Potassium",      group: "Major minerals", amount: 3140, target: 3500, unit: "mg", status: "low",
    what: "Fluid balance, BP regulation, nerve.",
    def: "Cramps, fatigue, irregular heartbeat.",
    tox: "Cardiac arrhythmia at > 18g (mostly from supplements).",
    sources: ["Potato", "Banana", "Spinach", "Beans", "Yogurt"] },
  { id: "chloride",  name: "Chloride",       group: "Major minerals", amount: 3200, target: 2300, ul: 3600, unit: "mg", status: "in",
    what: "Fluid balance, stomach acid.",
    def: "Rare.",
    tox: "Tied to sodium toxicity.",
    sources: ["Salt", "Seaweed", "Tomatoes", "Lettuce", "Olives"] },
  { id: "sulfur",    name: "Sulfur",         group: "Major minerals", amount: 1100, target: null, unit: "mg", status: "in",
    what: "Component of methionine, cysteine, glutathione.",
    def: "Rare.",
    tox: "Rare.",
    sources: ["Eggs", "Garlic", "Onion", "Cabbage", "Beef"] },

  // Trace
  { id: "iron",      name: "Iron",           group: "Trace minerals", amount: 14, target: 18, ul: 45, unit: "mg", status: "low",
    what: "Oxygen transport (hemoglobin). Athletes lose more via sweat/foot-strike.",
    def: "Anemia, fatigue, poor performance, low mood.",
    tox: "Liver damage, cardiovascular risk (heme iron, men more sensitive).",
    sources: ["Liver", "Beef", "Spinach", "Lentils", "Pumpkin seeds"] },
  { id: "zinc",      name: "Zinc",           group: "Trace minerals", amount: 11, target: 11, ul: 40, unit: "mg", status: "in",
    what: "Immune function, testosterone, wound healing, taste.",
    def: "Slow healing, low T, hair loss, taste loss, immune dysfunction.",
    tox: "Suppresses copper absorption at chronic > 40mg.",
    sources: ["Oysters", "Beef", "Pumpkin seeds", "Lentils", "Cashews"] },
  { id: "copper",    name: "Copper",         group: "Trace minerals", amount: 1.4, target: 0.9, ul: 10, unit: "mg", status: "in",
    what: "Iron metabolism, connective tissue, antioxidant enzymes.",
    def: "Anemia (despite iron), neutropenia, neuropathy.",
    tox: "Liver damage, GI distress.",
    sources: ["Liver", "Oysters", "Dark chocolate", "Cashews", "Sesame"] },
  { id: "manganese", name: "Manganese",      group: "Trace minerals", amount: 4.2, target: 2.3, ul: 11, unit: "mg", status: "in",
    what: "Bone, glucose metabolism, antioxidant enzymes.",
    def: "Very rare.",
    tox: "Neurological symptoms (parkinsonism) at extreme intake.",
    sources: ["Whole grains", "Nuts", "Tea", "Mussels", "Pineapple"] },
  { id: "iodine",    name: "Iodine",         group: "Trace minerals", amount: 132, target: 150, ul: 1100, unit: "µg", status: "low",
    what: "Thyroid hormone synthesis.",
    def: "Goiter, hypothyroidism, cognitive issues in developing brains.",
    tox: "Hyperthyroidism in susceptible individuals.",
    sources: ["Iodized salt", "Seaweed", "Cod", "Dairy", "Eggs"] },
  { id: "selenium",  name: "Selenium",       group: "Trace minerals", amount: 124, target: 55, ul: 400, unit: "µg", status: "in",
    what: "Thyroid + antioxidant enzymes (glutathione peroxidase).",
    def: "Keshan disease, hypothyroidism, immune dysfunction.",
    tox: "Selenosis: hair loss, nail brittleness, garlic breath.",
    sources: ["Brazil nuts (extreme)", "Tuna", "Sardines", "Eggs", "Sunflower seeds"] },
  { id: "chromium",  name: "Chromium",       group: "Trace minerals", amount: 32, target: 35, unit: "µg", status: "in",
    what: "Enhances insulin action (modest effect).",
    def: "Glucose intolerance (rare).",
    tox: "Rare. Possible at > 1mg supplements.",
    sources: ["Broccoli", "Grape juice", "Whole grains", "Garlic", "Brewer's yeast"] },
  { id: "molybdenum", name: "Molybdenum",    group: "Trace minerals", amount: 86, target: 45, ul: 2000, unit: "µg", status: "in",
    what: "Cofactor for enzymes that break down sulfites and purines.",
    def: "Very rare.",
    tox: "Very rare at dietary levels.",
    sources: ["Beans", "Lentils", "Whole grains", "Nuts", "Dairy"] },
  { id: "fluoride",  name: "Fluoride",       group: "Trace minerals", amount: 2.4, target: 4, ul: 10, unit: "mg", status: "low",
    what: "Dental + bone strength.",
    def: "Dental caries.",
    tox: "Dental fluorosis (mild cosmetic). Skeletal fluorosis at extremes.",
    sources: ["Tap water (fluoridated)", "Tea", "Fish (with bones)", "Toothpaste", "Coffee"] },
  { id: "boron",     name: "Boron",          group: "Trace minerals", amount: 1.4, target: 1, ul: 20, unit: "mg", status: "in",
    what: "Bone health, hormone metabolism (possibly).",
    def: "Possible role in osteoporosis.",
    tox: "Nausea, vomiting at extreme doses.",
    sources: ["Avocado", "Prunes", "Raisins", "Almonds", "Apples"] },

  // ─── BIOACTIVES ──────────────────────────────────────
  { id: "polyphenols", name: "Polyphenols (total)", group: "Bioactives", amount: 920, target: 650, unit: "mg", status: "in",
    what: "Plant antioxidants. Anti-inflammatory, gut microbiome support.",
    def: "Less antioxidant capacity, more inflammation.",
    tox: "Possible iron malabsorption at extreme intake.",
    sources: ["Berries", "Dark chocolate", "Coffee", "Tea", "Olive oil"] },
  { id: "flavonoids",  name: "Flavonoids",        parent: "polyphenols", group: "Sub-class", amount: 320, target: 250, unit: "mg", status: "in",
    what: "Quercetin, catechins, anthocyanins family.",
    def: "—",
    tox: "Rare at dietary doses.",
    sources: ["Berries", "Tea", "Onion", "Apple", "Citrus"] },
  { id: "lutein",      name: "Lutein + Zeaxanthin", parent: "polyphenols", group: "Carotenoid", amount: 4.8, target: 6, unit: "mg", status: "low",
    what: "Carotenoids concentrated in macula. Eye health, blue light protection.",
    def: "Possible age-related macular degeneration risk.",
    tox: "Rare.",
    sources: ["Kale", "Spinach", "Egg yolk", "Corn", "Bell pepper"] },
  { id: "lycopene",    name: "Lycopene",          parent: "polyphenols", group: "Carotenoid", amount: 8.2, target: 6, unit: "mg", status: "in",
    what: "Red carotenoid. Prostate + cardiovascular protective effects.",
    def: "—",
    tox: "Lycopenodermia (orange skin) at extreme intake.",
    sources: ["Tomato (cooked)", "Watermelon", "Grapefruit (pink)", "Papaya", "Guava"] },
  { id: "egcg",        name: "EGCG",              parent: "polyphenols", group: "Catechin", amount: 180, target: 200, unit: "mg", status: "low",
    what: "Green tea catechin. Antioxidant, mild thermogenic.",
    def: "—",
    tox: "Possible liver issues at extreme supplemental doses (fasting).",
    sources: ["Green tea", "Matcha", "Black tea (less)", "White tea", "—"] },
  { id: "creatine_diet", name: "Creatine (dietary)", group: "Other compounds", amount: 1.4, target: 2, unit: "g", status: "low",
    what: "From red meat and fish. Tom supplements 5g/d on top.",
    def: "Without supplementation: lower phosphocreatine stores.",
    tox: "Rare. Bloating at high supplementation.",
    sources: ["Beef", "Salmon", "Herring", "Pork", "Cod"] },
  { id: "carnitine",   name: "L-Carnitine",       group: "Other compounds", amount: 290, target: null, unit: "mg", status: "in",
    what: "Mitochondrial fatty acid transport. Endogenously synthesized.",
    def: "Very rare.",
    tox: "GI distress at supplemental > 3g.",
    sources: ["Red meat", "Pork", "Fish", "Milk", "Chicken"] },
  { id: "taurine",     name: "Taurine",           group: "Other compounds", amount: 410, target: null, unit: "mg", status: "in",
    what: "Sulfonic acid. Cardiovascular, neurological, energy.",
    def: "Rare in adults.",
    tox: "Rare.",
    sources: ["Shellfish", "Tuna", "Beef", "Chicken (dark)", "Turkey"] },
  { id: "coq10",       name: "Coenzyme Q10",      group: "Other compounds", amount: 8, target: null, unit: "mg", status: "in",
    what: "Mitochondrial electron carrier. Declines with age + statins.",
    def: "Possibly relevant in heart disease + statin users.",
    tox: "Rare.",
    sources: ["Beef heart", "Sardines", "Beef", "Mackerel", "Peanuts"] },
  { id: "caffeine_in", name: "Caffeine (food)",   group: "Other compounds", amount: 280, target: null, ul: 400, unit: "mg", status: "in",
    what: "Adenosine antagonist. Stimulant, performance enhancer.",
    def: "—",
    tox: "Sleep disruption, anxiety, palpitations.",
    sources: ["Coffee", "Tea", "Dark chocolate", "Cacao", "Yerba mate"] },
];

// ── GROUP TOTALS — synthetic parent rows ──
const GROUP_ORDER = [
  "Macronutrients",
  "Fat-soluble vitamins",
  "B vitamins",
  "Other water-soluble",
  "Major minerals",
  "Trace minerals",
  "Bioactives",
  "Other compounds",
];

// ── COMPONENTS ─────────────────────────────────────────────
const STATUS_COLOR = {
  in:   "var(--pos)",
  low:  "var(--warn)",
  high: "var(--warn)",
  warn: "var(--warn)",
  out:  "var(--neg)",
};
const STATUS_LABEL = {
  in:   "in range",
  low:  "below target",
  high: "above target",
  warn: "watch",
  out:  "out of range",
};

const NutrientAnalysisView = () => {
  const [period, setPeriod] = useState("today");
  const [scope, setScope] = useState("all");
  const [expanded, setExpanded] = useState({});
  const [selected, setSelected] = useState(null);

  const toggle = id => setExpanded(e => ({...e, [id]: !e[id]}));

  // Group nutrients by group, top-level only (children are nested via parent links)
  const topLevel = NUTRIENT_TREE.filter(n => !n.parent);
  const groups = GROUP_ORDER.map(g => ({
    name: g,
    items: topLevel.filter(n => n.group === g),
  })).filter(g => g.items.length > 0);

  const allItems = NUTRIENT_TREE;
  const inRange = allItems.filter(n => n.status === "in").length;
  const low = allItems.filter(n => n.status === "low").length;
  const high = allItems.filter(n => n.status === "high" || n.status === "out").length;

  return (
    <div>
      {/* Top controls */}
      <div style={{display: "flex", gap: 8, marginBottom: 14, alignItems: "center", flexWrap: "wrap"}}>
        <div style={{display: "flex", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, padding: 2}}>
          {["today","7d","30d","90d"].map(p => (
            <button key={p} className={period === p ? "btn btn-primary" : "btn btn-ghost"}
              style={{height: 24, fontSize: 11, padding: "0 10px", borderRadius: 4}}
              onClick={() => setPeriod(p)}>{p === "today" ? "Today" : p + " avg"}</button>
          ))}
        </div>
        <div style={{display: "flex", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, padding: 2}}>
          {[["all","All"],["watch","Out of range"],["deficient","Deficient only"]].map(([k,l]) => (
            <button key={k} className={scope === k ? "btn btn-primary" : "btn btn-ghost"}
              style={{height: 24, fontSize: 11, padding: "0 10px", borderRadius: 4}}
              onClick={() => setScope(k)}>{l}</button>
          ))}
        </div>
        <div className="spacer"/>
        <span className="dim" style={{fontSize: 11, fontFamily: "var(--font-mono)"}}>{allItems.length} nutrients tracked</span>
        <button className="btn btn-ghost"><Icon name="download" className="ic ic-sm"/> Export</button>
        <button className="btn"><Icon name="filter" className="ic ic-sm"/> Filter</button>
      </div>

      {/* Summary strip */}
      <div className="grid g-cols-4" style={{gap: 10, marginBottom: 16}}>
        <Card className="card-tight" style={{padding: 14}}>
          <div className="eyebrow" style={{marginBottom: 4}}>Tracked</div>
          <div className="num" style={{fontSize: 22, fontWeight: 500}}>{allItems.length}</div>
          <div className="dim" style={{fontSize: 11}}>nutrients in your profile</div>
        </Card>
        <Card className="card-tight" style={{padding: 14}}>
          <div className="eyebrow" style={{marginBottom: 4}}>In range</div>
          <div className="num" style={{fontSize: 22, fontWeight: 500, color: "var(--pos)"}}>{inRange}</div>
          <div className="dim" style={{fontSize: 11}}>{Math.round((inRange / allItems.length) * 100)}% of total</div>
        </Card>
        <Card className="card-tight" style={{padding: 14}}>
          <div className="eyebrow" style={{marginBottom: 4}}>Below target</div>
          <div className="num" style={{fontSize: 22, fontWeight: 500, color: "var(--warn)"}}>{low}</div>
          <div className="dim" style={{fontSize: 11}}>need attention today</div>
        </Card>
        <Card className="card-tight" style={{padding: 14}}>
          <div className="eyebrow" style={{marginBottom: 4}}>Over UL</div>
          <div className="num" style={{fontSize: 22, fontWeight: 500, color: high > 0 ? "var(--neg)" : "var(--fg-dim)"}}>{high}</div>
          <div className="dim" style={{fontSize: 11}}>upper limit exceeded</div>
        </Card>
      </div>

      {/* Trees */}
      <div className="col-gap" style={{gap: 14}}>
        {groups.map(g => (
          <Card key={g.name}>
            <div className="card-h" style={{marginBottom: 8}}>
              <span className="card-title">{g.name}</span>
              <span className="card-sub">{g.items.length} top-level · {countDescendants(g.items)} entries total</span>
              <div className="card-actions">
                <span className="dim mono" style={{fontSize: 10}}>{summarize(g.items)}</span>
              </div>
            </div>
            <NutrientTable items={g.items} expanded={expanded} toggle={toggle} onSelect={setSelected} depth={0} scope={scope}/>
          </Card>
        ))}
      </div>

      {selected && <NutrientDetailModal n={selected} onClose={() => setSelected(null)}/>}
    </div>
  );
};

function countDescendants(items) {
  let count = items.length;
  items.forEach(it => {
    const children = NUTRIENT_TREE.filter(n => n.parent === it.id);
    count += children.length;
    children.forEach(c => {
      const subchildren = NUTRIENT_TREE.filter(n => n.parent === c.id);
      count += subchildren.length;
    });
  });
  return count;
}

function summarize(items) {
  const allInGroup = collectAll(items);
  const inR = allInGroup.filter(n => n.status === "in").length;
  return `${inR} of ${allInGroup.length} in range`;
}

function collectAll(items) {
  const result = [];
  items.forEach(it => {
    result.push(it);
    const children = NUTRIENT_TREE.filter(n => n.parent === it.id);
    children.forEach(c => {
      result.push(c);
      const sub = NUTRIENT_TREE.filter(n => n.parent === c.id);
      result.push(...sub);
    });
  });
  return result;
}

const NutrientTable = ({ items, expanded, toggle, onSelect, depth, scope }) => {
  const filtered = items.filter(it => {
    if (scope === "watch") return it.status !== "in" || hasChildOutOfRange(it.id);
    if (scope === "deficient") return it.status === "low" || hasChildLow(it.id);
    return true;
  });

  return (
    <table className="tbl">
      {depth === 0 && (
        <thead>
          <tr>
            <th></th>
            <th>Nutrient</th>
            <th style={{width: 110, textAlign: "right"}}>Amount</th>
            <th style={{width: 110}}>Target / range</th>
            <th style={{width: 130}}>Progress</th>
            <th style={{width: 60, textAlign: "right"}}>%</th>
            <th style={{width: 100}}>Status</th>
            <th style={{width: 28}}></th>
          </tr>
        </thead>
      )}
      <tbody>
        {filtered.map(it => (
          <NutrientRow key={it.id} it={it} expanded={expanded} toggle={toggle} onSelect={onSelect} depth={depth} scope={scope}/>
        ))}
      </tbody>
    </table>
  );
};

function hasChildOutOfRange(id) {
  const children = NUTRIENT_TREE.filter(n => n.parent === id);
  return children.some(c => c.status !== "in" || hasChildOutOfRange(c.id));
}
function hasChildLow(id) {
  const children = NUTRIENT_TREE.filter(n => n.parent === id);
  return children.some(c => c.status === "low" || hasChildLow(c.id));
}

const NutrientRow = ({ it, expanded, toggle, onSelect, depth, scope }) => {
  const children = NUTRIENT_TREE.filter(n => n.parent === it.id);
  const hasChildren = children.length > 0;
  const isOpen = expanded[it.id];
  const color = STATUS_COLOR[it.status] || "var(--fg-dim)";
  const pct = it.target != null && it.target > 0 ? Math.round((it.amount / it.target) * 100) : null;
  const ulPct = it.ul != null && it.ul > 0 ? Math.round((it.amount / it.ul) * 100) : null;

  return (
    <>
      <tr style={{cursor: "pointer"}}>
        <td style={{width: 28, paddingLeft: depth * 16}}>
          {hasChildren ? (
            <button className="icon-btn" onClick={(e) => { e.stopPropagation(); toggle(it.id); }} style={{width: 22, height: 22}}>
              <Icon name={isOpen ? "chevron_down" : "chevron_right"} className="ic ic-sm"/>
            </button>
          ) : (
            <span style={{display: "inline-block", width: 4, height: 4, borderRadius: 999, background: "var(--fg-dim)", marginLeft: 9, opacity: 0.5}}/>
          )}
        </td>
        <td onClick={() => onSelect(it)} style={{paddingLeft: 0}}>
          <div style={{display: "flex", alignItems: "center", gap: 8}}>
            <span style={{fontSize: depth === 0 ? 12.5 : 12, fontWeight: depth === 0 ? 600 : 400, color: depth === 0 ? "var(--fg)" : "var(--fg-muted)"}}>{it.name}</span>
            {it.group && depth > 0 && <span className="dim mono" style={{fontSize: 9.5}}>{it.group}</span>}
          </div>
        </td>
        <td onClick={() => onSelect(it)} className="num" style={{textAlign: "right", fontWeight: 500}}>
          {it.amount}<span className="dim" style={{fontSize: 10, marginLeft: 3}}>{it.unit}</span>
        </td>
        <td onClick={() => onSelect(it)} className="num muted" style={{fontSize: 11}}>
          {it.target != null ? `${it.target} ${it.unit}` : "—"}
          {it.ul != null && <span style={{display: "block", fontSize: 9.5, color: "var(--fg-dim)"}}>UL {it.ul}</span>}
        </td>
        <td onClick={() => onSelect(it)} style={{padding: "4px 8px 4px 0"}}>
          {it.target != null && (
            <div style={{position: "relative", height: 4, background: "var(--surface-2)", borderRadius: 999}}>
              <div style={{position: "absolute", left: 0, top: 0, bottom: 0, width: `${Math.min(pct, 100)}%`, background: color, borderRadius: 999}}/>
              {ulPct && (
                <div style={{position: "absolute", left: `${Math.min((it.ul / Math.max(it.target, it.amount)) * 100 * (it.target / it.ul), 100)}%`, top: -2, bottom: -2, width: 1, background: "var(--neg)"}}/>
              )}
            </div>
          )}
        </td>
        <td onClick={() => onSelect(it)} className="num" style={{textAlign: "right", color, fontWeight: 500, fontSize: 11.5}}>
          {pct != null ? `${pct}%` : "—"}
        </td>
        <td onClick={() => onSelect(it)}>
          <Pill style={{borderColor: `color-mix(in oklch, ${color} 35%, var(--border))`, color, background: `color-mix(in oklch, ${color} 8%, transparent)`}}>{STATUS_LABEL[it.status] || it.status}</Pill>
        </td>
        <td onClick={() => onSelect(it)}><Icon name="chevron_right" className="ic ic-sm" style={{color: "var(--fg-dim)"}}/></td>
      </tr>
      {hasChildren && isOpen && (
        <tr>
          <td colSpan="8" style={{padding: 0, background: "color-mix(in oklch, var(--surface-2) 50%, var(--surface))"}}>
            <div style={{paddingLeft: 16, paddingTop: 4, paddingBottom: 4}}>
              <NutrientTable items={children} expanded={expanded} toggle={toggle} onSelect={onSelect} depth={depth + 1} scope={scope}/>
            </div>
          </td>
        </tr>
      )}
    </>
  );
};

const NutrientDetailModal = ({ n, onClose }) => {
  const color = STATUS_COLOR[n.status] || "var(--fg-dim)";
  const pct = n.target != null && n.target > 0 ? (n.amount / n.target) * 100 : null;
  const ulPct = n.ul != null && n.ul > 0 ? (n.amount / n.ul) * 100 : null;
  const children = NUTRIENT_TREE.filter(x => x.parent === n.id);
  const parent = n.parent ? NUTRIENT_TREE.find(x => x.id === n.parent) : null;

  // Fake 14-day trend for visualization
  const trend = Array.from({length: 14}, (_, i) => {
    if (n.target == null) return n.amount;
    return n.amount * (0.7 + (i / 14) * 0.5 + Math.sin(i * 0.7) * 0.15);
  });

  return (
    <div className="modal-veil" onClick={onClose}>
      <div className="modal" style={{width: 720, maxHeight: "88vh"}} onClick={e => e.stopPropagation()}>
        <div className="modal-h">
          <div style={{
            width: 30, height: 30, borderRadius: 7,
            background: `color-mix(in oklch, ${color} 18%, transparent)`,
            border: `1px solid color-mix(in oklch, ${color} 35%, transparent)`,
            color, display: "grid", placeItems: "center"
          }}>
            <Icon name="nutrition" className="ic"/>
          </div>
          <div style={{flex: 1}}>
            <div style={{display: "flex", alignItems: "center", gap: 8, marginBottom: 2, flexWrap: "wrap"}}>
              <span style={{fontSize: 15, fontWeight: 600}}>{n.name}</span>
              <Pill>{n.group}</Pill>
              {parent && <Pill className="mono" style={{fontSize: 10}}>under {parent.name}</Pill>}
              <Pill style={{borderColor: `color-mix(in oklch, ${color} 35%, var(--border))`, color, background: `color-mix(in oklch, ${color} 8%, transparent)`}}>{STATUS_LABEL[n.status]}</Pill>
            </div>
            <div className="muted" style={{fontSize: 11.5}}>{n.what}</div>
          </div>
          <button className="icon-btn" onClick={onClose}><Icon name="x" className="ic"/></button>
        </div>
        <div className="modal-body" style={{padding: 18, overflowY: "auto"}}>
          {/* Numbers */}
          <div className="grid g-cols-4" style={{gap: 10, marginBottom: 16}}>
            <Card className="card-tight" style={{padding: 12}}>
              <div className="eyebrow" style={{marginBottom: 3}}>Today's amount</div>
              <div className="num" style={{fontSize: 18, fontWeight: 500, color}}>{n.amount}<span className="dim" style={{fontSize: 10, marginLeft: 2}}>{n.unit}</span></div>
              <div className="dim" style={{fontSize: 10}}>{pct != null ? `${pct.toFixed(0)}% of target` : ""}</div>
            </Card>
            <Card className="card-tight" style={{padding: 12}}>
              <div className="eyebrow" style={{marginBottom: 3}}>Target (RDA)</div>
              <div className="num" style={{fontSize: 18, fontWeight: 500}}>{n.target != null ? n.target : "—"}<span className="dim" style={{fontSize: 10, marginLeft: 2}}>{n.target != null ? n.unit : ""}</span></div>
              <div className="dim" style={{fontSize: 10}}>recommended daily</div>
            </Card>
            <Card className="card-tight" style={{padding: 12}}>
              <div className="eyebrow" style={{marginBottom: 3}}>Upper limit (UL)</div>
              <div className="num" style={{fontSize: 18, fontWeight: 500, color: ulPct > 100 ? "var(--neg)" : "var(--fg)"}}>{n.ul != null ? n.ul : "—"}<span className="dim" style={{fontSize: 10, marginLeft: 2}}>{n.ul != null ? n.unit : ""}</span></div>
              <div className="dim" style={{fontSize: 10}}>{ulPct != null ? `${ulPct.toFixed(0)}% of UL` : "no defined UL"}</div>
            </Card>
            <Card className="card-tight" style={{padding: 12}}>
              <div className="eyebrow" style={{marginBottom: 3}}>14-day avg</div>
              <div className="num" style={{fontSize: 18, fontWeight: 500}}>{(trend.reduce((s, v) => s + v, 0) / trend.length).toFixed(1)}<span className="dim" style={{fontSize: 10, marginLeft: 2}}>{n.unit}</span></div>
              <Sparkline data={trend} color={color} h={20}/>
            </Card>
          </div>

          {/* Range visual */}
          {n.target != null && (
            <>
              <div className="eyebrow" style={{marginBottom: 6}}>Where you are on the spectrum</div>
              <Card className="card-tight" style={{padding: 14, marginBottom: 16}}>
                <NutrientSpectrum amount={n.amount} target={n.target} ul={n.ul} unit={n.unit} color={color}/>
              </Card>
            </>
          )}

          {/* Children if any */}
          {children.length > 0 && (
            <>
              <div className="eyebrow" style={{marginBottom: 6}}>Composition · {children.length} sub-nutrient{children.length === 1 ? "" : "s"}</div>
              <table className="tbl" style={{marginBottom: 16}}>
                <tbody>
                  {children.map(c => {
                    const cColor = STATUS_COLOR[c.status];
                    return (
                      <tr key={c.id}>
                        <td>{c.name}</td>
                        <td className="num" style={{textAlign: "right"}}>{c.amount}<span className="dim" style={{fontSize: 10, marginLeft: 2}}>{c.unit}</span></td>
                        <td className="muted num">{c.target != null ? `target ${c.target}` : "—"}</td>
                        <td><Pill style={{borderColor: `color-mix(in oklch, ${cColor} 35%, var(--border))`, color: cColor}}>{STATUS_LABEL[c.status]}</Pill></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </>
          )}

          {/* Deficiency & Toxicity */}
          <div className="grid g-cols-2" style={{gap: 12, marginBottom: 16}}>
            <Card className="card-tight" style={{padding: 14, background: "color-mix(in oklch, var(--warn) 5%, var(--surface))", border: "1px solid color-mix(in oklch, var(--warn) 22%, var(--border))"}}>
              <div className="eyebrow" style={{color: "var(--warn)", marginBottom: 6}}>If too little</div>
              <div style={{fontSize: 12, lineHeight: 1.55, color: "var(--fg)"}}>{n.def}</div>
            </Card>
            <Card className="card-tight" style={{padding: 14, background: "color-mix(in oklch, var(--neg) 5%, var(--surface))", border: "1px solid color-mix(in oklch, var(--neg) 22%, var(--border))"}}>
              <div className="eyebrow" style={{color: "var(--neg)", marginBottom: 6}}>If too much</div>
              <div style={{fontSize: 12, lineHeight: 1.55, color: "var(--fg)"}}>{n.tox}</div>
            </Card>
          </div>

          {/* Sources */}
          <div className="eyebrow" style={{marginBottom: 6}}>Top food sources</div>
          <div style={{display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16}}>
            {n.sources.map((s, i) => (
              <div key={i} style={{padding: "6px 12px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 5, fontSize: 12}}>
                <span className="dim mono" style={{fontSize: 10, marginRight: 6}}>{(i + 1).toString().padStart(2, "0")}</span>{s}
              </div>
            ))}
          </div>

          {/* Cross-module hints */}
          <div className="eyebrow" style={{marginBottom: 6}}>Linked modules</div>
          <div className="col-gap" style={{gap: 6}}>
            <div style={{padding: 8, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 5, fontSize: 11.5, display: "flex", alignItems: "center", gap: 8}}>
              <Icon name="supplements" className="ic ic-sm" style={{color: "var(--acc-suppl)"}}/>
              Supplement coverage: {coverageNote(n)}
            </div>
            <div style={{padding: 8, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 5, fontSize: 11.5, display: "flex", alignItems: "center", gap: 8}}>
              <Icon name="medical" className="ic ic-sm" style={{color: "var(--acc-medic)"}}/>
              Bloodwork relevance: {labNote(n)}
            </div>
          </div>
        </div>
        <div className="modal-f">
          <button className="btn btn-ghost" onClick={onClose}>Close</button>
          <button className="btn"><Icon name="trend_up" className="ic ic-sm"/>30-day trend</button>
          <button className="btn btn-primary"><Icon name="search" className="ic ic-sm"/>Find foods rich in {n.name.split(" ")[0]}</button>
        </div>
      </div>
    </div>
  );
};

function coverageNote(n) {
  const map = {
    omega3: "Yes · Omega-3 EPA/DHA (2 g/d)",
    epa: "Yes · via Omega-3 supplement",
    dha: "Yes · via Omega-3 supplement",
    vit_d: "Yes · D3 4000 IU/d",
    vit_k2: "Yes · K2 (MK-7) 200 µg/d",
    magnesium: "Yes · Mg Glycinate 400 mg/d (evening)",
    creatine_diet: "Yes · Creatine Monohydrate 5 g/d (morning)",
    protein: "Yes · Whey Isolate 30 g post-workout",
  };
  return map[n.id] || "Not currently covered by an active supplement";
}
function labNote(n) {
  const map = {
    vit_d: "Tracked · 25-OH-D 48 ng/mL · in range",
    iron: "Tracked · Ferritin 142 ng/mL · in range",
    vit_b12: "Tracked · not in current panel",
    calcium: "Indirect · via metabolic panel",
    magnesium: "Not in routine panel · serum Mg unreliable anyway",
    omega3: "Optional · Omega-3 index not in standard panel",
  };
  return map[n.id] || "Not in your current lab panel";
}

const NutrientSpectrum = ({ amount, target, ul, unit, color }) => {
  // Visualize: 0 → deficient → target → optimal → UL → toxic
  const max = ul != null ? ul * 1.1 : target * 2;
  const targetPos = (target / max) * 100;
  const ulPos = ul != null ? (ul / max) * 100 : 95;
  const amountPos = Math.min((amount / max) * 100, 100);
  return (
    <div>
      <div style={{position: "relative", height: 24, borderRadius: 4, overflow: "hidden", display: "flex", border: "1px solid var(--border)"}}>
        {/* Deficient zone (0 - 70% of target) */}
        <div style={{width: `${targetPos * 0.7}%`, background: "var(--neg)", opacity: 0.4}}/>
        {/* Low zone (70-100% of target) */}
        <div style={{width: `${targetPos * 0.3}%`, background: "var(--warn)", opacity: 0.4}}/>
        {/* Optimal zone (target to UL or 2× target) */}
        <div style={{width: `${(ulPos - targetPos) * 0.95}%`, background: "var(--pos)", opacity: 0.4}}/>
        {/* High zone */}
        {ul != null && <div style={{width: `${100 - ulPos + (ulPos - targetPos) * 0.05}%`, background: "var(--neg)", opacity: 0.5}}/>}
        {/* Marker for current */}
        <div style={{position: "absolute", left: `${amountPos}%`, top: -3, bottom: -3, width: 2, background: color, boxShadow: "0 0 0 2px var(--bg)"}}/>
        {/* Target marker */}
        <div style={{position: "absolute", left: `${targetPos}%`, top: -6, bottom: -6, width: 1, background: "var(--fg)", opacity: 0.5}}/>
      </div>
      <div style={{display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 9.5, color: "var(--fg-dim)", fontFamily: "var(--font-mono)"}}>
        <span>0</span>
        <span style={{position: "absolute", left: `${targetPos}%`, marginLeft: -16, marginTop: 0}}>target {target}</span>
        {ul != null && <span style={{position: "absolute", left: `${ulPos}%`, marginLeft: -12, marginTop: 0}}>UL {ul}</span>}
        <span>{max.toFixed(0)} {unit}</span>
      </div>
      <div style={{display: "flex", justifyContent: "space-between", marginTop: 16, fontSize: 10, color: "var(--fg-muted)"}}>
        <span className="row-gap"><span style={{width: 10, height: 10, background: "var(--neg)", opacity: 0.4, borderRadius: 2}}/>Deficient</span>
        <span className="row-gap"><span style={{width: 10, height: 10, background: "var(--warn)", opacity: 0.4, borderRadius: 2}}/>Below target</span>
        <span className="row-gap"><span style={{width: 10, height: 10, background: "var(--pos)", opacity: 0.4, borderRadius: 2}}/>Optimal</span>
        {ul != null && <span className="row-gap"><span style={{width: 10, height: 10, background: "var(--neg)", opacity: 0.5, borderRadius: 2}}/>Over UL</span>}
        <span className="row-gap"><span style={{width: 2, height: 10, background: color}}/>You</span>
      </div>
    </div>
  );
};

window.NutrientAnalysisView = NutrientAnalysisView;
window.NUTRIENT_TREE = NUTRIENT_TREE;
