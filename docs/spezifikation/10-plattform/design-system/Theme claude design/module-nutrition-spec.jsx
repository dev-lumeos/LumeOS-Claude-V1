// Nutrition · Block B + C — Custom Foods, Quick-Add, Smart Search, Preferences,
// Nutrition Score, Meal Plans, Ghost Entries, Shopping Lists, Pending Actions, Settings

// ── V1 diet tags (16, per SPEC_04 F3) ─────────────────────
const DIET_TAGS = [
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

const EU14_ALLERGENS = ["Gluten","Krebstiere","Eier","Fisch","Erdnüsse","Soja","Milch","Schalenfrüchte","Sellerie","Senf","Sesam","Schwefeldioxid","Lupinen","Weichtiere"];

const MEAL_TYPES = [
  { id: "breakfast",    label: "Breakfast",    time: "07:00" },
  { id: "lunch",        label: "Lunch",        time: "13:00" },
  { id: "dinner",       label: "Dinner",       time: "20:00" },
  { id: "snack",        label: "Snack",        time: "16:00" },
  { id: "pre_workout",  label: "Pre-workout",  time: "16:30" },
  { id: "post_workout", label: "Post-workout", time: "19:30" },
  { id: "other",        label: "Other",        time: "—" },
];

// ── Nutrition Score (F11, pure function) ──────────────────
const LEVEL_MULT = { beginner: 0.75, intermediate: 0.90, advanced: 1.00, elite: 1.10 };
function nutritionScore(c, level = "intermediate") {
  const raw =
    c.protein * 0.30 + c.calorie * 0.25 + c.carbs * 0.15 + c.fat * 0.15 + c.fiber * 0.15;
  return Math.round(raw * (LEVEL_MULT[level] ?? 0.90) * 100) / 100;
}

window.NutritionScoreCard = () => {
  const compliance = { protein: 0.79, calorie: 0.68, carbs: 0.53, fat: 0.80, fiber: 0.69 };
  const level = "advanced";
  const score = nutritionScore(compliance, level);
  const band = score >= 80 ? { l: "ok", c: "var(--pos)" } : score >= 50 ? { l: "warn", c: "var(--warn)" } : { l: "block", c: "var(--neg)" };
  return (
    <Card title="Nutrition score" sub="deterministic · no AI" actions={<Pill style={{borderColor: `color-mix(in srgb, ${band.c} 35%, var(--border))`, color: band.c}}>{band.l}</Pill>}>
      <div style={{display: "flex", alignItems: "center", gap: 16, marginBottom: 12}}>
        <Ring value={Math.round(score)} max={100} color={band.c} label="score" size={88} stroke={7}/>
        <div style={{flex: 1}}>
          <div className="dim mono" style={{fontSize: 10.5, lineHeight: 1.7}}>
            protein 0.79 × 0.30<br/>
            calorie 0.68 × 0.25<br/>
            carbs&nbsp;&nbsp; 0.53 × 0.15<br/>
            fat&nbsp;&nbsp;&nbsp;&nbsp; 0.80 × 0.15<br/>
            fiber&nbsp;&nbsp; 0.69 × 0.15
          </div>
        </div>
      </div>
      <Row label="Level multiplier" value={`${level} · ×${LEVEL_MULT[level]}`}/>
      <Row label="Thresholds" value="ok ≥ 80 · warn 50–79 · block < 50"/>
      <Row label="Source of level" value="Auth · experience_level"/>
    </Card>
  );
};

// ── Custom Food editor (F4) ───────────────────────────────
window.CustomFoodModal = ({ onClose }) => {
  const [allergens, setAllergens] = React.useState([]);
  const toggle = a => setAllergens(s => s.includes(a) ? s.filter(x => x !== a) : [...s, a]);
  const Fld = ({ label, req, sub, children }) => (
    <div style={{marginBottom: 12}}>
      <div style={{display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 4}}>
        <label className="eyebrow">{label}{req && <span style={{color: "var(--neg)", marginLeft: 3}}>*</span>}</label>
        {sub && <span className="dim mono" style={{fontSize: 10}}>{sub}</span>}
      </div>
      {children}
    </div>
  );
  const Inp = p => <input {...p} style={{width: "100%", height: 30, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, padding: "0 10px", fontSize: 12, ...(p.mono ? {fontFamily: "var(--font-mono)"} : {})}}/>;
  return (
    <div className="modal-veil" onClick={onClose}>
      <div className="modal" style={{width: 720, maxHeight: "92vh"}} onClick={e => e.stopPropagation()}>
        <div className="modal-h">
          <div style={{width: 26, height: 26, borderRadius: 6, background: "color-mix(in srgb, var(--acc-nutri) 18%, transparent)", border: "1px solid color-mix(in srgb, var(--acc-nutri) 38%, var(--border))", color: "var(--acc-nutri)", display: "grid", placeItems: "center"}}><Icon name="plus" className="ic"/></div>
          <div style={{flex: 1}}>
            <div style={{fontSize: 14, fontWeight: 600}}>Custom food</div>
            <div className="dim" style={{fontSize: 11}}>Only visible to you · never merged into BLS data</div>
          </div>
          <button className="icon-btn" onClick={onClose}><Icon name="x" className="ic"/></button>
        </div>
        <div className="modal-body" style={{padding: 16, overflowY: "auto"}}>
          <div className="eyebrow" style={{marginBottom: 8}}>Names · 3-language</div>
          <div className="grid g-cols-3" style={{gap: 10}}>
            <Fld label="Name DE" req><Inp placeholder="z.B. Protein-Bowl"/></Fld>
            <Fld label="Name EN"><Inp placeholder="optional"/></Fld>
            <Fld label="Name TH"><Inp placeholder="optional"/></Fld>
          </div>
          <div className="grid g-cols-3" style={{gap: 10}}>
            <Fld label="Brand"><Inp placeholder="optional"/></Fld>
            <Fld label="Serving size" sub="g"><Inp mono placeholder="100"/></Fld>
            <Fld label="Barcode" sub="Phase 2"><Inp mono placeholder="—" disabled/></Fld>
          </div>
          <div className="divider"/>
          <div className="eyebrow" style={{marginBottom: 8}}>Required macros · per 100g</div>
          <div className="grid g-cols-4" style={{gap: 10}}>
            <Fld label="Energy" req sub="kcal"><Inp mono placeholder="0"/></Fld>
            <Fld label="Protein" req sub="g"><Inp mono placeholder="0"/></Fld>
            <Fld label="Fat" req sub="g"><Inp mono placeholder="0"/></Fld>
            <Fld label="Carbs" req sub="g"><Inp mono placeholder="0"/></Fld>
          </div>
          <div className="eyebrow" style={{marginBottom: 8}}>Optional</div>
          <div className="grid g-cols-4" style={{gap: 10}}>
            <Fld label="Fiber" sub="g"><Inp mono placeholder="—"/></Fld>
            <Fld label="Sugar" sub="g"><Inp mono placeholder="—"/></Fld>
            <Fld label="Saturated" sub="g"><Inp mono placeholder="—"/></Fld>
            <Fld label="Salt" sub="g"><Inp mono placeholder="—"/></Fld>
          </div>
          <div className="divider"/>
          <div className="eyebrow" style={{marginBottom: 8}}>Allergens · EU-14</div>
          <div className="dim" style={{fontSize: 11, marginBottom: 8, lineHeight: 1.5}}>
            Smart Search excludes these identically to BLS <span className="mono">allergen_*</span> tags. Custom foods need no other tags.
          </div>
          <div style={{display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 5}}>
            {EU14_ALLERGENS.map(a => {
              const on = allergens.includes(a);
              return (
                <button key={a} onClick={() => toggle(a)} style={{
                  display: "flex", alignItems: "center", gap: 7, padding: "7px 9px", borderRadius: 5, cursor: "pointer", fontSize: 11.5, textAlign: "left",
                  background: on ? "color-mix(in srgb, var(--neg) 10%, var(--surface))" : "var(--surface)",
                  border: `1px solid ${on ? "color-mix(in srgb, var(--neg) 35%, var(--border))" : "var(--border)"}`,
                  color: on ? "var(--neg)" : "var(--fg-muted)",
                }}>
                  <span style={{width: 13, height: 13, borderRadius: 3, border: `1px solid ${on ? "var(--neg)" : "var(--border-strong)"}`, background: on ? "var(--neg)" : "transparent", display: "grid", placeItems: "center", flexShrink: 0}}>
                    {on && <Icon name="check" className="ic" style={{width: 9, height: 9, color: "var(--bg)", strokeWidth: 3}}/>}
                  </span>
                  {a}
                </button>
              );
            })}
          </div>
        </div>
        <div className="modal-f">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <div className="spacer"/>
          <span className="dim mono" style={{fontSize: 10, alignSelf: "center", marginRight: 8}}>{allergens.length} allergens flagged</span>
          <button className="btn btn-primary" onClick={onClose}><Icon name="check" className="ic ic-sm"/>Create food</button>
        </div>
      </div>
    </div>
  );
};

// ── Quick-Add macros (F5a) ────────────────────────────────
window.QuickAddModal = ({ onClose }) => {
  const [v, setV] = React.useState({ kcal: "", p: "", c: "", f: "", label: "" });
  const Inp = ({ k, ph, suffix }) => (
    <div style={{position: "relative"}}>
      <input value={v[k]} onChange={e => setV(s => ({...s, [k]: e.target.value}))} placeholder={ph}
        style={{width: "100%", height: 34, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, padding: "0 40px 0 10px", fontSize: 13, fontFamily: "var(--font-mono)"}}/>
      <span className="dim mono" style={{position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", fontSize: 10}}>{suffix}</span>
    </div>
  );
  return (
    <div className="modal-veil" onClick={onClose}>
      <div className="modal" style={{width: 460}} onClick={e => e.stopPropagation()}>
        <div className="modal-h">
          <div style={{width: 26, height: 26, borderRadius: 6, background: "color-mix(in srgb, var(--acc-nutri) 18%, transparent)", border: "1px solid color-mix(in srgb, var(--acc-nutri) 38%, var(--border))", color: "var(--acc-nutri)", display: "grid", placeItems: "center"}}><Icon name="bolt" className="ic"/></div>
          <div style={{flex: 1}}>
            <div style={{fontSize: 14, fontWeight: 600}}>Quick-add macros</div>
            <div className="dim" style={{fontSize: 11}}>No food lookup · for meal prep in bulk</div>
          </div>
          <button className="icon-btn" onClick={onClose}><Icon name="x" className="ic"/></button>
        </div>
        <div className="modal-body" style={{padding: 16}}>
          <div className="col-gap" style={{gap: 10}}>
            <div><div className="eyebrow" style={{marginBottom: 4}}>Calories</div><Inp k="kcal" ph="0" suffix="kcal"/></div>
            <div className="grid g-cols-3" style={{gap: 8}}>
              <div><div className="eyebrow" style={{marginBottom: 4}}>Protein</div><Inp k="p" ph="0" suffix="g"/></div>
              <div><div className="eyebrow" style={{marginBottom: 4}}>Carbs</div><Inp k="c" ph="0" suffix="g"/></div>
              <div><div className="eyebrow" style={{marginBottom: 4}}>Fat</div><Inp k="f" ph="0" suffix="g"/></div>
            </div>
            <div>
              <div className="eyebrow" style={{marginBottom: 4}}>Label</div>
              <input value={v.label} onChange={e => setV(s => ({...s, label: e.target.value}))} placeholder='z.B. "Meal Prep Bowl"'
                style={{width: "100%", height: 34, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, padding: "0 10px", fontSize: 13}}/>
            </div>
            <div>
              <div className="eyebrow" style={{marginBottom: 4}}>Meal</div>
              <select style={{width: "100%", height: 34, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, padding: "0 10px", fontSize: 12.5}}>
                {MEAL_TYPES.map(m => <option key={m.id}>{m.label}</option>)}
              </select>
            </div>
          </div>
          <div style={{marginTop: 14, padding: 10, background: "var(--surface)", borderRadius: 6, fontSize: 11, color: "var(--fg-muted)", lineHeight: 1.5}}>
            <Icon name="alert" className="ic ic-sm" style={{display: "inline", verticalAlign: "middle", marginRight: 4, color: "var(--warn)"}}/>
            Quick-add produces no micronutrient data. The micro dashboard will show this entry as “no micro data”.
          </div>
        </div>
        <div className="modal-f">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={onClose}><Icon name="plus" className="ic ic-sm"/>Add</button>
        </div>
      </div>
    </div>
  );
};

// ── Food Preferences (F12) ────────────────────────────────
window.FoodPreferencesView = () => {
  const [diet, setDiet] = React.useState("omnivore");
  const diets = ["omnivore","vegetarian","vegan","pescatarian","keto","paleo","halal","kosher"];
  const [allergies, setAllergies] = React.useState(["Schalenfrüchte"]);
  const cats = [
    { n: "Fleisch",        s: "like" }, { n: "Fisch", s: "like" },
    { n: "Milchprodukte",  s: "neutral" }, { n: "Gemüse", s: "like" },
    { n: "Obst",           s: "neutral" }, { n: "Getreide", s: "neutral" },
    { n: "Hülsenfrüchte",  s: "dislike" }, { n: "Süßwaren", s: "dislike" },
  ];
  const foods = [
    { n: "Lachs · Atlantik",   s: "like" },
    { n: "Hähnchenbrust",      s: "like" },
    { n: "Haferflocken",       s: "like" },
    { n: "Rosenkohl",          s: "dislike" },
    { n: "Leber",              s: "dislike" },
  ];
  const scoreOf = s => s === "like" ? "+" : s === "dislike" ? "−" : "";
  const colOf   = s => s === "like" ? "var(--pos)" : s === "dislike" ? "var(--neg)" : "var(--fg-dim)";
  return (
    <div className="grid" style={{gridTemplateColumns: "1.4fr 1fr", gap: 14}}>
      <div className="col-gap" style={{gap: 14}}>
        <Card title="Diet type" sub="global — hard filter, applies before all scoring">
          <div style={{display: "flex", gap: 6, flexWrap: "wrap"}}>
            {diets.map(d => (
              <button key={d} onClick={() => setDiet(d)} className={diet === d ? "pill pill-acc" : "pill"} style={{cursor: "pointer", padding: "5px 12px", fontSize: 11.5, textTransform: "capitalize"}}>{d}</button>
            ))}
          </div>
        </Card>

        <Card title="Categories" sub="like +50 · dislike −50">
          <div style={{display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 6}}>
            {cats.map(c => (
              <div key={c.n} style={{display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6}}>
                <span style={{flex: 1, fontSize: 12}}>{c.n}</span>
                <span className="num" style={{fontSize: 12, color: colOf(c.s), width: 30, textAlign: "right"}}>{scoreOf(c.s)}{c.s !== "neutral" ? 50 : "—"}</span>
                <div style={{display: "flex", gap: 2}}>
                  {["like","neutral","dislike"].map(s => (
                    <button key={s} style={{
                      width: 22, height: 22, borderRadius: 4, cursor: "pointer",
                      background: c.s === s ? colOf(s) : "var(--surface-2)",
                      color: c.s === s ? "var(--bg)" : "var(--fg-dim)",
                      display: "grid", placeItems: "center", fontSize: 11, fontWeight: 600,
                    }}>{s === "like" ? "+" : s === "dislike" ? "−" : "·"}</button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Individual foods" sub="like +100 · dislike −100 · highest priority">
          <table className="tbl">
            <tbody>
              {foods.map(f => (
                <tr key={f.n}>
                  <td>{f.n}</td>
                  <td className="num" style={{width: 60, textAlign: "right", color: colOf(f.s)}}>{scoreOf(f.s)}100</td>
                  <td style={{width: 90}}><Pill style={{color: colOf(f.s)}}>{f.s}</Pill></td>
                  <td style={{width: 30}}><button className="icon-btn"><Icon name="trash" className="ic ic-sm"/></button></td>
                </tr>
              ))}
            </tbody>
          </table>
          <button className="btn btn-sm" style={{marginTop: 10}}><Icon name="plus" className="ic ic-sm"/>Add food preference</button>
        </Card>
      </div>

      <div className="col-gap" style={{gap: 14}}>
        <Card title="Allergies" sub="hard exclusion · no scoring override">
          <div className="dim" style={{fontSize: 11, marginBottom: 10, lineHeight: 1.5}}>
            Applies to BLS foods via <span className="mono">allergen_*</span> tags and custom foods via <span className="mono">custom_allergens[]</span>.
          </div>
          <div style={{display: "flex", gap: 5, flexWrap: "wrap"}}>
            {EU14_ALLERGENS.map(a => {
              const on = allergies.includes(a);
              return (
                <button key={a} onClick={() => setAllergies(s => on ? s.filter(x => x !== a) : [...s, a])}
                  className={on ? "pill" : "pill"} style={{
                    cursor: "pointer", padding: "4px 10px", fontSize: 11,
                    borderColor: on ? "color-mix(in srgb, var(--neg) 40%, var(--border))" : "var(--border)",
                    color: on ? "var(--neg)" : "var(--fg-muted)",
                    background: on ? "color-mix(in srgb, var(--neg) 8%, transparent)" : "var(--surface)",
                  }}>{a}</button>
              );
            })}
          </div>
        </Card>
        <Card title="Tag preferences" sub="like +30 · dislike −30">
          <div style={{display: "flex", gap: 5, flexWrap: "wrap"}}>
            {DIET_TAGS.slice(0, 10).map((t, i) => (
              <button key={t.code} className={i < 3 ? "pill pill-acc" : "pill"} style={{cursor: "pointer", padding: "4px 10px", fontSize: 11}}>
                {i < 3 ? "+ " : ""}{t.de}
              </button>
            ))}
          </div>
        </Card>
        <Card title="Priority order">
          <Row label="1 · Allergen" value="hard exclude"/>
          <Row label="2 · Diet type" value="hard exclude"/>
          <Row label="3 · Food" value="±100"/>
          <Row label="4 · Category" value="±50"/>
          <Row label="5 · Tag" value="±30"/>
          <Row label="6 · Prefix match" value="+20"/>
          <div className="divider"/>
          <div className="dim" style={{fontSize: 11, lineHeight: 1.5}}>Specific beats general — a liked food overrides a disliked category.</div>
        </Card>
      </div>
    </div>
  );
};

// ── Meal Plans + Ghost Entries (F7) ───────────────────────
const GHOST_ENTRIES = [
  { id: "g1", meal: "Breakfast",    time: "07:00", plan: "Recomp 5-Meal · Day 3", items: ["Haferflocken 80g","Whey 35g","Banane 120g"], status: "confirmed", kcal: 549 },
  { id: "g2", meal: "Snack",        time: "10:00", plan: "Recomp 5-Meal · Day 3", items: ["Hüttenkäse 200g","Mandeln 20g"],            status: "deviated",  kcal: 260, note: "Mandeln → Walnüsse" },
  { id: "g3", meal: "Lunch",        time: "13:00", plan: "Recomp 5-Meal · Day 3", items: ["Hähnchenbrust 180g","Basmati 200g","Salat"], status: "confirmed", kcal: 681 },
  { id: "g4", meal: "Pre-workout",  time: "16:30", plan: "Recomp 5-Meal · Day 3", items: ["Reiswaffeln 40g","Whey 30g"],               status: "pending",   kcal: 280 },
  { id: "g5", meal: "Dinner",       time: "20:00", plan: "Recomp 5-Meal · Day 3", items: ["Lachs 200g","Süßkartoffel 250g","Brokkoli"], status: "pending",  kcal: 720 },
];

window.MealPlansView = () => {
  const [tab, setTab] = React.useState("active");
  const confirmed = GHOST_ENTRIES.filter(g => g.status === "confirmed").length;
  const deviated  = GHOST_ENTRIES.filter(g => g.status === "deviated").length;
  const skipped   = GHOST_ENTRIES.filter(g => g.status === "skipped").length;
  const pending   = GHOST_ENTRIES.filter(g => g.status === "pending").length;
  const compliance = Math.round(((confirmed + deviated) / Math.max(1, confirmed + deviated + skipped)) * 100);
  const statusStyle = s => ({
    confirmed: { c: "var(--pos)",  l: "confirmed" },
    deviated:  { c: "var(--warn)", l: "deviated" },
    skipped:   { c: "var(--neg)",  l: "skipped" },
    pending:   { c: "var(--fg-dim)", l: "pending" },
  }[s]);
  return (
    <div>
      <div style={{display: "flex", gap: 8, marginBottom: 14, alignItems: "center"}}>
        <div style={{display: "flex", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 7, padding: 2, gap: 1}}>
          {[["active","Active plan"],["library","Plan library"],["shopping","Shopping list"]].map(([k,l]) => (
            <button key={k} onClick={() => setTab(k)} className={tab === k ? "btn btn-primary" : "btn btn-ghost"} style={{height: 24, fontSize: 11, padding: "0 12px", borderRadius: 5}}>{l}</button>
          ))}
        </div>
        <div className="spacer"/>
        <button className="btn"><Icon name="plus" className="ic ic-sm"/>New plan</button>
      </div>

      {tab === "active" && (
        <div className="grid" style={{gridTemplateColumns: "1.5fr 1fr", gap: 14}}>
          <div className="col-gap" style={{gap: 14}}>
            <Card>
              <div style={{display: "flex", alignItems: "center", gap: 16}}>
                <Ring value={compliance} max={100} color="var(--acc-nutri)" label="compliance" size={92} stroke={7}/>
                <div style={{flex: 1}}>
                  <div style={{display: "flex", alignItems: "center", gap: 8, marginBottom: 4}}>
                    <span style={{fontSize: 15, fontWeight: 600}}>Recomp 5-Meal Plan</span>
                    <Pill variant="acc">active</Pill>
                    <Pill>rollover</Pill>
                  </div>
                  <div className="muted" style={{fontSize: 12, marginBottom: 8}}>Day 3 of 7 · started May 14 · source: coach (Jana Bauer)</div>
                  <div className="dim mono" style={{fontSize: 10.5}}>
                    ({confirmed} confirmed + {deviated} deviated) / ({confirmed} + {deviated} + {skipped} skipped) = {compliance}% · {pending} pending not counted
                  </div>
                </div>
              </div>
            </Card>

            <Card title="Today's ghost entries" sub={`${pending} still open · confirm via MealCam or manually`}>
              <div className="col-gap" style={{gap: 6}}>
                {GHOST_ENTRIES.map(g => {
                  const st = statusStyle(g.status);
                  return (
                    <div key={g.id} style={{
                      padding: 12, borderRadius: 7,
                      background: g.status === "pending" ? "var(--surface)" : `color-mix(in srgb, ${st.c} 5%, var(--surface))`,
                      border: `1px solid ${g.status === "pending" ? "var(--border)" : `color-mix(in srgb, ${st.c} 25%, var(--border))`}`,
                      borderStyle: g.status === "pending" ? "dashed" : "solid",
                    }}>
                      <div style={{display: "flex", alignItems: "center", gap: 8, marginBottom: 5}}>
                        <span className="num dim" style={{fontSize: 10, width: 38}}>{g.time}</span>
                        <span style={{fontSize: 12.5, fontWeight: 600}}>{g.meal}</span>
                        <Pill style={{borderColor: `color-mix(in srgb, ${st.c} 35%, var(--border))`, color: st.c, fontSize: 9.5}}>{st.l}</Pill>
                        <span className="num dim" style={{marginLeft: "auto", fontSize: 11}}>{g.kcal} kcal</span>
                      </div>
                      <div className="muted" style={{fontSize: 11.5, paddingLeft: 46, lineHeight: 1.5}}>{g.items.join(" · ")}</div>
                      {g.note && <div style={{fontSize: 11, paddingLeft: 46, marginTop: 4, color: "var(--warn)", fontFamily: "var(--font-mono)"}}>↳ {g.note}</div>}
                      {g.status === "pending" && (
                        <div style={{display: "flex", gap: 6, marginTop: 8, paddingLeft: 46}}>
                          <button className="btn btn-primary btn-sm"><Icon name="check" className="ic ic-sm"/>Confirm as planned</button>
                          <button className="btn btn-sm"><Icon name="camera" className="ic ic-sm"/>MealCam</button>
                          <button className="btn btn-ghost btn-sm">Log deviation</button>
                          <button className="btn btn-ghost btn-sm">Skip</button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>

          <div className="col-gap" style={{gap: 14}}>
            <Card title="Plan settings">
              <Row label="Lifecycle" value="rollover"/>
              <Row label="Days count" value="7"/>
              <Row label="Started" value="May 14"/>
              <Row label="Next restart" value="May 21 · Day 1"/>
              <Row label="Confirm mode" value="ask"/>
              <div className="divider"/>
              <div style={{padding: 10, background: "color-mix(in srgb, var(--warn) 6%, var(--surface))", border: "1px solid color-mix(in srgb, var(--warn) 22%, var(--border))", borderRadius: 6, fontSize: 11, color: "var(--fg-muted)", lineHeight: 1.5}}>
                <Icon name="alert" className="ic ic-sm" style={{display: "inline", verticalAlign: "middle", marginRight: 4, color: "var(--warn)"}}/>
                Plan items are read-only while active. To edit: pause → duplicate → edit → re-activate. Protects compliance history.
              </div>
              <div style={{display: "flex", gap: 6, marginTop: 10}}>
                <button className="btn btn-sm">Pause plan</button>
                <button className="btn btn-ghost btn-sm">Duplicate</button>
              </div>
            </Card>
            <Card title="Lifecycle types">
              <Row label="once" value="ends after days_count"/>
              <Row label="rollover" value="restarts at Day 1"/>
              <Row label="sequence" value="activates next_plan_id"/>
            </Card>
            <Card title="7-day compliance">
              <Sparkline data={[100, 86, 100, 92, 80, 100, compliance]} color="var(--acc-nutri)" h={44}/>
              <div style={{display: "flex", gap: 14, marginTop: 8, fontSize: 11, color: "var(--fg-muted)"}}>
                <span>Avg <span className="num" style={{color: "var(--fg)"}}>94%</span></span>
                <span>Deviations <span className="num" style={{color: "var(--warn)"}}>4</span></span>
                <span>Skips <span className="num" style={{color: "var(--fg)"}}>1</span></span>
              </div>
            </Card>
          </div>
        </div>
      )}

      {tab === "library" && (
        <div className="grid g-cols-3" style={{gap: 12}}>
          {[
            { n: "Recomp 5-Meal Plan",   src: "coach",       days: 7,  kcal: 2700, active: true },
            { n: "Cut · 4-Meal 2200",     src: "coach",       days: 14, kcal: 2200 },
            { n: "High-Protein Lazy Week",src: "user",        days: 7,  kcal: 2650 },
            { n: "Travel week · flexible",src: "user",        days: 5,  kcal: 2500 },
            { n: "Lean bulk 3100",        src: "marketplace", days: 28, kcal: 3100 },
            { n: "Buddy auto-plan",       src: "buddy",       days: 7,  kcal: 2700 },
          ].map(p => (
            <Card key={p.n} className="card-tight" style={{padding: 14, cursor: "pointer", border: p.active ? "1px solid color-mix(in srgb, var(--acc-nutri) 35%, var(--border))" : undefined}}>
              <div style={{display: "flex", alignItems: "center", gap: 6, marginBottom: 6, flexWrap: "wrap"}}>
                <span style={{fontSize: 13, fontWeight: 600}}>{p.n}</span>
                {p.active && <Pill variant="acc" style={{fontSize: 9}}>active</Pill>}
              </div>
              <div style={{display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 10}}>
                <Pill style={{fontSize: 9.5}}>{p.src}</Pill>
                <Pill style={{fontSize: 9.5}}>{p.days} days</Pill>
                <Pill style={{fontSize: 9.5}}>{p.kcal} kcal</Pill>
              </div>
              <div style={{display: "flex", gap: 6}}>
                {!p.active && <button className="btn btn-primary btn-sm">Activate</button>}
                <button className="btn btn-ghost btn-sm">Preview</button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {tab === "shopping" && (
        <div className="grid" style={{gridTemplateColumns: "1.4fr 1fr", gap: 14}}>
          <Card title="Shopping list" sub="from Recomp 5-Meal Plan · 7 days · 1 serving"
            actions={<><button className="btn btn-ghost btn-sm">Print</button><button className="btn btn-sm"><Icon name="download" className="ic ic-sm"/>Export</button></>}>
            {[
              { cat: "Fleisch & Fisch", items: [["Hähnchenbrust", "1260 g"], ["Lachsfilet", "1400 g"]] },
              { cat: "Milchprodukte",   items: [["Hüttenkäse", "1400 g"], ["Whey Isolat", "455 g"], ["Skyr", "1000 g"]] },
              { cat: "Getreide",        items: [["Haferflocken", "560 g"], ["Basmatireis", "1400 g"], ["Reiswaffeln", "280 g"]] },
              { cat: "Gemüse & Obst",   items: [["Brokkoli", "1050 g"], ["Süßkartoffel", "1750 g"], ["Banane", "840 g"], ["Blaubeeren", "700 g"]] },
              { cat: "Fette & Nüsse",   items: [["Mandeln", "140 g"], ["Olivenöl", "150 ml"]] },
            ].map(g => (
              <div key={g.cat} style={{marginBottom: 14}}>
                <div className="eyebrow" style={{marginBottom: 6}}>{g.cat}</div>
                <div className="col-gap" style={{gap: 3}}>
                  {g.items.map(([n, q], i) => (
                    <div key={n} style={{display: "flex", alignItems: "center", gap: 10, padding: "7px 10px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 5}}>
                      <span style={{width: 15, height: 15, borderRadius: 4, border: `1px solid ${i < 2 ? "var(--pos)" : "var(--border-strong)"}`, background: i < 2 ? "var(--pos)" : "transparent", display: "grid", placeItems: "center", flexShrink: 0, cursor: "pointer"}}>
                        {i < 2 && <Icon name="check" className="ic" style={{width: 10, height: 10, color: "var(--bg)", strokeWidth: 3}}/>}
                      </span>
                      <span style={{flex: 1, fontSize: 12, textDecoration: i < 2 ? "line-through" : "none", opacity: i < 2 ? 0.5 : 1}}>{n}</span>
                      <span className="num dim" style={{fontSize: 11}}>{q}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </Card>
          <Card title="Scale list">
            <div className="eyebrow" style={{marginBottom: 6}}>Servings</div>
            <div style={{display: "flex", gap: 6, marginBottom: 14}}>
              {[1,2,3,4].map(n => <button key={n} className={n === 1 ? "btn btn-primary btn-sm" : "btn btn-sm"} style={{flex: 1}}>{n}×</button>)}
            </div>
            <Row label="Total items" value="14"/>
            <Row label="Checked" value="2 of 14"/>
            <Row label="Est. cost" value="≈ €78"/>
            <div className="divider"/>
            <button className="btn" style={{width: "100%"}}><Icon name="plus" className="ic ic-sm"/>Add item manually</button>
          </Card>
        </div>
      )}
    </div>
  );
};

// ── Pending Actions (F14) ─────────────────────────────────
window.NutritionPendingActions = () => (
  <Card title="Pending actions" sub="feeds Buddy's daily TODO">
    <div className="col-gap" style={{gap: 6}}>
      {[
        { t: "2 ghost entries still open", s: "Pre-workout 16:30 · Dinner 20:00", trigger: "meal_plan pending", sev: "warn", act: "Confirm" },
        { t: "Water below 80% of target", s: "1.2 L logged + 0.6 L from food = 1.8 of 3.0 L", trigger: "after 18:00", sev: "warn", act: "Log water" },
        { t: "Protein 38 g short", s: "142 of 180 g · dinner should cover it", trigger: "daily target", sev: "info", act: "See suggestions" },
      ].map((a, i) => {
        const c = a.sev === "warn" ? "var(--warn)" : "var(--acc-nutri)";
        return (
          <div key={i} style={{display: "flex", alignItems: "center", gap: 10, padding: 10, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6}}>
            <div style={{width: 3, alignSelf: "stretch", background: c, borderRadius: 2}}/>
            <div style={{flex: 1, minWidth: 0}}>
              <div style={{fontSize: 12.5, fontWeight: 500}}>{a.t}</div>
              <div className="dim" style={{fontSize: 10.5, marginTop: 2}}>{a.s}</div>
            </div>
            <span className="dim mono" style={{fontSize: 9.5}}>{a.trigger}</span>
            <button className="btn btn-sm">{a.act}</button>
          </div>
        );
      })}
    </div>
  </Card>
);

// ── Nutrition Settings (F15) ──────────────────────────────
window.NutritionSettingsModal = ({ onClose }) => {
  const [tier, setTier] = React.useState(3);
  return (
    <div className="modal-veil" onClick={onClose}>
      <div className="modal" style={{width: 640, maxHeight: "90vh"}} onClick={e => e.stopPropagation()}>
        <div className="modal-h">
          <div style={{width: 26, height: 26, borderRadius: 6, background: "color-mix(in srgb, var(--acc-nutri) 18%, transparent)", border: "1px solid color-mix(in srgb, var(--acc-nutri) 38%, var(--border))", color: "var(--acc-nutri)", display: "grid", placeItems: "center"}}><Icon name="settings" className="ic"/></div>
          <div style={{flex: 1}}>
            <div style={{fontSize: 14, fontWeight: 600}}>Nutrition settings</div>
            <div className="dim" style={{fontSize: 11}}>Key-value store · per user</div>
          </div>
          <button className="icon-btn" onClick={onClose}><Icon name="x" className="ic"/></button>
        </div>
        <div className="modal-body" style={{padding: 16, overflowY: "auto"}}>
          <div className="eyebrow" style={{marginBottom: 8}}>meal_schedule</div>
          <Card className="card-tight" style={{padding: 0, marginBottom: 14}}>
            <table className="tbl" style={{margin: 0}}>
              <thead><tr><th style={{paddingLeft: 12}}>Meal</th><th style={{width: 110}}>Time</th><th style={{width: 40}}></th></tr></thead>
              <tbody>
                {MEAL_TYPES.slice(0, 5).map(m => (
                  <tr key={m.id}>
                    <td style={{paddingLeft: 12}}>
                      <input defaultValue={m.label} style={{width: "100%", height: 26, background: "var(--bg-elev)", border: "1px solid var(--border)", borderRadius: 5, padding: "0 8px", fontSize: 11.5}}/>
                    </td>
                    <td><input type="time" defaultValue={m.time === "—" ? "12:00" : m.time} style={{width: "100%", height: 26, background: "var(--bg-elev)", border: "1px solid var(--border)", borderRadius: 5, padding: "0 6px", fontSize: 11.5, fontFamily: "var(--font-mono)"}}/></td>
                    <td><button className="icon-btn"><Icon name="trash" className="ic ic-sm"/></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
          <button className="btn btn-sm" style={{marginBottom: 16}}><Icon name="plus" className="ic ic-sm"/>Add meal slot</button>

          <div className="eyebrow" style={{marginBottom: 8}}>show_micros_tier</div>
          <div style={{display: "flex", gap: 6, marginBottom: 6}}>
            {[
              { t: 1, l: "Essential · 15" },
              { t: 2, l: "Athlete · +8" },
              { t: 3, l: "Medical · all 138" },
            ].map(o => (
              <button key={o.t} onClick={() => setTier(o.t)} className={tier === o.t ? "btn btn-primary btn-sm" : "btn btn-sm"} style={{flex: 1}}>{o.l}</button>
            ))}
          </div>
          <div className="dim" style={{fontSize: 10.5, marginBottom: 16}}>V1: all tiers visible without gate. Subscription gates ship with monetisation.</div>

          <div className="eyebrow" style={{marginBottom: 8}}>water_quick_amounts · ml</div>
          <div style={{display: "flex", gap: 6, marginBottom: 16}}>
            {[250, 500, 750, 1000].map(v => (
              <input key={v} defaultValue={v} style={{flex: 1, height: 30, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, padding: "0 10px", fontSize: 12, fontFamily: "var(--font-mono)", textAlign: "center"}}/>
            ))}
          </div>

          <div className="eyebrow" style={{marginBottom: 8}}>mealcam_threshold</div>
          <div style={{display: "flex", alignItems: "center", gap: 12, marginBottom: 6}}>
            <input type="range" min="0.5" max="0.95" step="0.05" defaultValue="0.85" style={{flex: 1, accentColor: "var(--acc-nutri)"}}/>
            <span className="num" style={{width: 44, textAlign: "right"}}>0.85</span>
          </div>
          <div className="dim" style={{fontSize: 10.5, marginBottom: 16}}>Confidence at which MealCam marks an item green. Never auto-adds — user tap always required.</div>

          <div className="eyebrow" style={{marginBottom: 8}}>meal_plan_confirm_mode</div>
          <div style={{display: "flex", gap: 6, marginBottom: 16}}>
            {["mealcam", "manual", "ask"].map((m, i) => (
              <button key={m} className={i === 2 ? "btn btn-primary btn-sm" : "btn btn-sm"} style={{flex: 1}}>{m}</button>
            ))}
          </div>

          <div className="eyebrow" style={{marginBottom: 8}}>morning_weigh_in</div>
          <div style={{display: "flex", alignItems: "center", gap: 10, padding: "9px 11px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6}}>
            <span style={{flex: 1, fontSize: 12}}>Track weight every morning</span>
            <div style={{width: 30, height: 17, borderRadius: 999, background: "var(--pos)", padding: 2}}>
              <div style={{width: 13, height: 13, borderRadius: 999, background: "var(--bg)", marginLeft: 13}}/>
            </div>
          </div>
        </div>
        <div className="modal-f">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={onClose}><Icon name="check" className="ic ic-sm"/>Save settings</button>
        </div>
      </div>
    </div>
  );
};

Object.assign(window, { DIET_TAGS, EU14_ALLERGENS, MEAL_TYPES, nutritionScore, GHOST_ENTRIES });
