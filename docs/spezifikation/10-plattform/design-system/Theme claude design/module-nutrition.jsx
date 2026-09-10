// Nutrition module

const NutritionModule = () => {
  const [tab, setTab] = useState("diary");
  const [mealCamOpen, setMealCamOpen] = useState(false);

  return (
    <>
      <div className="module-header module-hero-lite">
        <div className="module-title-block">
          <div className="module-title-row">
            <span className="module-title">Nutrition</span>
            <Pill>Sat · May 16</Pill>
            <Pill variant="acc">138-nutrient tracking</Pill>
          </div>
          <div className="module-sub">Diary, micronutrient analysis, and meal planning · BLS 4.0 · Max Rubner-Institut</div>
        </div>
        <div className="module-actions">
          <button className="btn btn-ghost"><Icon name="chevron_left" className="ic ic-sm" /></button>
          <button className="btn btn-ghost"><Icon name="chevron_right" className="ic ic-sm" /></button>
          <button className="btn" onClick={() => window.dispatchEvent(new CustomEvent("open-nutrition-modal", {detail: {type: "quickadd"}}))}><Icon name="bolt" className="ic ic-sm" /> Quick-add</button>
          <button className="btn" onClick={() => window.dispatchEvent(new CustomEvent("open-nutrition-modal", {detail: {type: "macrocalc"}}))}><Icon name="trend_up" className="ic ic-sm" /> Recalc macros</button>
          <button className="btn"><Icon name="search" className="ic ic-sm" /> Find food</button>
          <button className="btn btn-primary" onClick={() => setMealCamOpen(true)}><Icon name="camera" className="ic ic-sm" /> MealCam</button>
        </div>
      </div>

      <Tabs
        items={[
          { id: "diary",     label: "Diary",     icon: "edit",       count: 3 },
          { id: "insights",  label: "Insights",  icon: "sparkles" },
          { id: "nutrients", label: "Nutrients", icon: "layers",     count: 138 },
          { id: "foods",     label: "Food DB",   icon: "search" },
          { id: "plans",     label: "Meal plans",icon: "calendar",   count: 2 },
          { id: "prefs",     label: "Preferences", icon: "settings" },
          { id: "planner",   label: "Planner",   icon: "calendar" },
        ]}
        active={tab}
        onChange={setTab}
      />

      {tab === "diary" && <NutritionDiary />}
      {tab === "insights" && <NutritionInsights />}
      {tab === "nutrients" && <NutrientAnalysisView />}
      {tab === "foods" && <NutritionFoods />}
      {tab === "planner" && <NutritionPlanner />}
      {tab === "plans"   && window.MealPlansView && <window.MealPlansView />}
      {tab === "prefs"   && window.FoodPreferencesView && <window.FoodPreferencesView />}

      {mealCamOpen && <MealCamModal onClose={() => setMealCamOpen(false)} />}
      <NutritionModalLauncher/>
    </>
  );
};

const NutritionModalLauncher = () => {
  const [m, setM] = useState(null);
  useEffect(() => {
    const h = e => setM(e.detail);
    window.addEventListener("open-nutrition-modal", h);
    return () => window.removeEventListener("open-nutrition-modal", h);
  }, []);
  if (!m) return null;
  const close = () => setM(null);
  if (m.type === "macrocalc" && window.MacroCalculatorModal) return <window.MacroCalculatorModal onClose={close}/>;
  if (m.type === "recipe" && window.RecipeBuilderModal) return <window.RecipeBuilderModal onClose={close}/>;
  if (m.type === "food" && window.FoodDetailModal) return <window.FoodDetailModal food={m.food} onClose={close}/>;
  if (m.type === "quickadd" && window.QuickAddModal) return <window.QuickAddModal onClose={close}/>;
  if (m.type === "customfood" && window.CustomFoodModal) return <window.CustomFoodModal onClose={close}/>;
  if (m.type === "nutsettings" && window.NutritionSettingsModal) return <window.NutritionSettingsModal onClose={close}/>;
  return null;
};

// --- DIARY ---
// Dual ring — outer track = goal, inner arc = consumed, remaining shown as ghost arc
const DualRing = ({ value, target, size = 92, stroke = 7, color = "var(--acc-nutri)", label = "" }) => {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.min(value / target, 1);
  const over = value > target;
  return (
    <div className="ring" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        {/* goal track (full circle, dim) */}
        <circle cx={size/2} cy={size/2} r={r} stroke="var(--surface-2)" strokeWidth={stroke} fill="none" />
        {/* remaining segment — subtle dashed to read as "still to eat" */}
        <circle cx={size/2} cy={size/2} r={r}
          stroke="color-mix(in oklch, var(--acc-nutri) 22%, transparent)"
          strokeWidth={stroke} fill="none"
          strokeDasharray={`${c * (1 - pct)} ${c}`}
          strokeDashoffset={-c * pct}
          strokeLinecap="butt" />
        {/* consumed arc */}
        <circle cx={size/2} cy={size/2} r={r}
          stroke={over ? "var(--warn)" : color}
          strokeWidth={stroke} fill="none"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.5s ease" }} />
      </svg>
      <div className="ring-label">
        <span className="v" style={{fontSize: 22}}>{value.toLocaleString()}</span>
        <span className="l" style={{fontSize: 9}}>of {target.toLocaleString()} {label}</span>
      </div>
    </div>
  );
};

// Macro ring — consumed arc + ghost remaining arc, value + target stacked inside
const MacroRing = ({ cur, tgt, unit, color, size = 84 }) => {
  const stroke = size >= 92 ? 7 : 6;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.min(cur / tgt, 1);
  const over = cur > tgt;
  return (
    <div className="ring" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle cx={size/2} cy={size/2} r={r} stroke="var(--surface-2)" strokeWidth={stroke} fill="none" />
        <circle cx={size/2} cy={size/2} r={r}
          stroke={`color-mix(in oklch, ${color} 20%, transparent)`}
          strokeWidth={stroke} fill="none"
          strokeDasharray={`${c * (1 - pct)} ${c}`}
          strokeDashoffset={-c * pct} strokeLinecap="butt" />
        <circle cx={size/2} cy={size/2} r={r}
          stroke={over ? "var(--warn)" : color}
          strokeWidth={stroke} fill="none"
          strokeDasharray={c} strokeDashoffset={c * (1 - pct)}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.5s ease" }} />
      </svg>
      <div className="ring-label">
        <span className="v" style={{fontSize: size >= 92 ? 21 : 19, lineHeight: 1}}>{cur.toLocaleString()}</span>
        <span className="l" style={{fontSize: 9, marginTop: 2, letterSpacing: "0.02em", textTransform: "none"}}>
          / {tgt.toLocaleString()}{unit === "kcal" ? "" : unit}
        </span>
        <span className="num" style={{fontSize: 9, color: over ? "var(--warn)" : "var(--fg-dim)", marginTop: 1}}>
          {Math.round((cur / tgt) * 100)}%
        </span>
      </div>
    </div>
  );
};

const NutritionDiary = () => {
  const target = { kcal: 2700, p: 180, c: 320, f: 90 };
  const cur = { kcal: 1847, p: 142, c: 168, f: 72 };
  const meals = [
    {
      slot: "Breakfast", time: "07:42",
      items: [
        { name: "Oats · rolled", qty: "80g", kcal: 304, p: 11, c: 54, f: 5 },
        { name: "Whey protein · vanilla", qty: "35g", kcal: 138, p: 27, c: 4, f: 2 },
        { name: "Banana", qty: "120g", kcal: 107, p: 1.3, c: 27, f: 0.4 },
        { name: "Blueberries", qty: "100g", kcal: 57, p: 0.7, c: 14, f: 0.3 },
      ],
    },
    {
      slot: "Snack", time: "10:14",
      items: [
        { name: "Cottage cheese · low-fat", qty: "200g", kcal: 144, p: 24, c: 7, f: 2.5 },
        { name: "Almonds", qty: "20g", kcal: 116, p: 4, c: 4, f: 10 },
      ],
    },
    {
      slot: "Lunch", time: "13:08",
      items: [
        { name: "Chicken breast · grilled", qty: "180g", kcal: 297, p: 56, c: 0, f: 6.5 },
        { name: "Basmati rice · cooked", qty: "200g", kcal: 260, p: 5.4, c: 56, f: 0.6 },
        { name: "Mixed greens + olive oil", qty: "150g", kcal: 124, p: 2.6, c: 5, f: 11 },
      ],
    },
    { slot: "Snack",  time: "16:00", items: [], suggestion: "Pre-workout · 60g carbs + 25g protein" },
    { slot: "Dinner", time: "20:00", items: [], suggestion: "≈ 850 kcal remaining" },
  ];

  const remaining = {
    kcal: target.kcal - cur.kcal,
    p: target.p - cur.p,
    c: target.c - cur.c,
    f: target.f - cur.f,
  };

  return (
    <div className="grid" style={{gridTemplateColumns: "1.5fr 1fr", gap: 16}}>
      <div className="col-gap" style={{gap: 12}}>
        {/* Day summary strip — ring for calories, linear bars for macros (MFP/Cronometer pattern) */}
        <Card>
          <div style={{display: "flex", gap: 20, alignItems: "center"}}>
            <div style={{display: "flex", flexDirection: "column", alignItems: "center", gap: 6, flexShrink: 0}}>
              <MacroRing cur={cur.kcal} tgt={target.kcal} unit="kcal" color="var(--acc-nutri)" size={96} />
              <div className="num" style={{fontSize: 10, color: "var(--fg-dim)"}}>{remaining.kcal.toLocaleString()} kcal left</div>
            </div>
            <div style={{flex: 1, display: "flex", flexDirection: "column", gap: 12}}>
              {[
                { l: "Protein", c: cur.p, t: target.p, color: "var(--acc-train)" },
                { l: "Carbs",   c: cur.c, t: target.c, color: "var(--acc-recov)" },
                { l: "Fat",     c: cur.f, t: target.f, color: "var(--acc-goals)" },
              ].map(m => {
                const pct = Math.round((m.c / m.t) * 100);
                return (
                  <div key={m.l}>
                    <div style={{display: "flex", alignItems: "baseline", gap: 8, marginBottom: 5}}>
                      <span className="eyebrow" style={{width: 56}}>{m.l}</span>
                      <span className="num" style={{fontSize: 14, fontWeight: 500}}>
                        {m.c}<span style={{fontSize: 10, color: "var(--fg-dim)", marginLeft: 1}}>/{m.t}g</span>
                      </span>
                      <span className="num dim" style={{fontSize: 10, marginLeft: "auto"}}>{m.t - m.c}g left</span>
                      <span className="num" style={{fontSize: 11, color: pct >= 100 ? "var(--pos)" : "var(--fg-muted)", width: 34, textAlign: "right"}}>{pct}%</span>
                    </div>
                    <Meter value={m.c} max={m.t} color={m.color} tall />
                  </div>
                );
              })}
            </div>
          </div>
        </Card>

        {/* Meals */}
        {meals.map((m, i) => (
          <MealCard key={i} meal={m} />
        ))}
      </div>

      {/* Side: water + micro snapshot */}
      <div className="col-gap" style={{gap: 12}}>
        {window.SmartSuggestionsCard && <window.SmartSuggestionsCard />}
        {window.NutritionScoreCard && <window.NutritionScoreCard />}
        {window.NutritionPendingActions && <window.NutritionPendingActions />}
        {window.PreWorkoutOptimizer && <window.PreWorkoutOptimizer />}
        <Card title="Hydration" sub="Today" actions={<button className="btn btn-ghost" style={{height: 22, fontSize: 11, padding: "0 8px"}}><Icon name="plus" className="ic ic-sm" /> +250ml</button>}>
          <div style={{display: "flex", alignItems: "baseline", gap: 6, marginBottom: 8}}>
            <span className="num" style={{fontSize: 28, fontWeight: 500}}>1.2</span>
            <span className="dim" style={{fontSize: 12}}>/ 3.0 L</span>
          </div>
          <Meter value={1.2} max={3.0} color="var(--acc-recov)" tall />
          <div style={{display: "flex", gap: 4, marginTop: 10}}>
            {Array.from({length: 12}).map((_, i) => (
              <div key={i} style={{
                flex: 1, height: 20, borderRadius: 2,
                background: i < 5 ? "var(--acc-recov)" : "var(--surface-2)",
                opacity: i < 5 ? 0.7 + (i / 12) * 0.3 : 1
              }} />
            ))}
          </div>
          <div style={{marginTop: 6, fontSize: 10, color: "var(--fg-dim)", display: "flex", justifyContent: "space-between"}}>
            <span>5 of 12 glasses</span>
            <span className="num">38% behind 14d avg</span>
          </div>
        </Card>

        <Card title="Micronutrient snapshot" sub="vs target · today" actions={<button className="btn btn-ghost" style={{height: 22, fontSize: 11, padding: "0 8px"}}>Deep dive →</button>}>
          <RadarChart
            color="var(--acc-nutri)"
            data={[
              { label: "Vit C", value: 0.82, target: 0.8 },
              { label: "Vit D", value: 0.42, target: 0.8 },
              { label: "Iron", value: 0.91, target: 0.8 },
              { label: "Ca",   value: 0.74, target: 0.8 },
              { label: "Mg",   value: 0.68, target: 0.8 },
              { label: "Zn",   value: 0.85, target: 0.8 },
              { label: "B12",  value: 0.93, target: 0.8 },
              { label: "ω-3",  value: 0.55, target: 0.8 },
            ]}
            h={220}
          />
          <div style={{marginTop: 8, fontSize: 10, color: "var(--fg-muted)", display: "flex", gap: 12}}>
            <span className="row-gap"><span className="dot" style={{background: "var(--acc-nutri)"}} />Today</span>
            <span className="row-gap"><span style={{width: 8, height: 1.5, background: "var(--fg-dim)", display: "block"}} />Target</span>
          </div>
        </Card>

        <Card title="Below threshold" sub="3 of 117" actions={<button className="icon-btn"><Icon name="filter" className="ic ic-sm" /></button>}>
          {[
            { name: "Vitamin D", val: "8.4 µg", tgt: "20 µg", pct: 42 },
            { name: "Omega-3", val: "0.9 g", tgt: "1.6 g", pct: 55 },
            { name: "Magnesium", val: "240 mg", tgt: "350 mg", pct: 68 },
          ].map((n, i) => (
            <div key={i} style={{padding: "8px 0", borderBottom: i < 2 ? "1px solid var(--border)" : "none"}}>
              <div style={{display: "flex", justifyContent: "space-between", marginBottom: 4}}>
                <span style={{fontSize: 12}}>{n.name}</span>
                <span className="num" style={{fontSize: 11, color: "var(--warn)"}}>{n.val} / {n.tgt}</span>
              </div>
              <Meter value={n.pct} color="var(--warn)" />
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
};

const MealCard = ({ meal }) => {
  const [open, setOpen] = useState(meal.items.length > 0);
  const total = meal.items.reduce((acc, it) => ({
    kcal: acc.kcal + it.kcal, p: acc.p + it.p, c: acc.c + it.c, f: acc.f + it.f
  }), {kcal: 0, p: 0, c: 0, f: 0});
  return (
    <Card className="card-tight" style={{padding: meal.items.length === 0 ? 14 : 0}}>
      <div
        style={{padding: meal.items.length === 0 ? 0 : "12px 14px", display: "flex", alignItems: "center", gap: 10, cursor: "pointer"}}
        onClick={() => setOpen(o => !o)}
      >
        <span className="num" style={{fontSize: 10, color: "var(--fg-dim)", width: 40}}>{meal.time}</span>
        <span style={{fontSize: 13, fontWeight: 600}}>{meal.slot}</span>
        {meal.items.length === 0 ? (
          <span className="dim" style={{fontSize: 11}}>· {meal.suggestion || "Empty"}</span>
        ) : (
          <span className="dim" style={{fontSize: 11}}>· {meal.items.length} items</span>
        )}
        <div className="spacer" />
        {meal.items.length > 0 && (
          <span className="num" style={{fontSize: 12}}>
            {total.kcal}<span className="dim" style={{fontSize: 10}}> kcal</span>
            <span className="dim" style={{margin: "0 6px"}}>·</span>
            {total.p}<span className="dim" style={{fontSize: 10}}>g P</span>
          </span>
        )}
        <button className="icon-btn"><Icon name="plus" className="ic ic-sm" /></button>
        {meal.items.length > 0 && (
          <button className="icon-btn"><Icon name="chevron_down" className="ic ic-sm" style={{transform: open ? "" : "rotate(-90deg)", transition: "0.2s"}} /></button>
        )}
      </div>
      {open && meal.items.length > 0 && (
        <div style={{padding: "0 14px 10px"}}>
        <table className="tbl tbl-meal">
          <tbody>
            {meal.items.map((it, i) => (
              <tr key={i}>
                <td style={{width: 18}}><span className="dot" style={{background: "var(--acc-nutri)", opacity: 0.5}} /></td>
                <td className="name">{it.name}</td>
                <td className="muted num" style={{width: 44, textAlign: "right"}}>{it.qty.replace(/g$/, '')}<span className="dim" style={{fontSize: 10, marginLeft: 2}}>g</span></td>
                <td className="num" style={{width: 58, textAlign: "right"}}>{it.kcal}<span className="dim" style={{fontSize: 10, marginLeft: 2}}>kcal</span></td>
                <td className="num" style={{width: 40, textAlign: "right"}}>{it.p}<span className="dim" style={{fontSize: 10, marginLeft: 2}}>g</span></td>
                <td className="num" style={{width: 40, textAlign: "right"}}>{it.c}<span className="dim" style={{fontSize: 10, marginLeft: 2}}>g</span></td>
                <td className="num" style={{width: 40, textAlign: "right"}}>{it.f}<span className="dim" style={{fontSize: 10, marginLeft: 2}}>g</span></td>
                <td style={{width: 20}}><button className="icon-btn"><Icon name="more" className="ic ic-sm" /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      )}
      {!open && meal.items.length === 0 && (
        <div style={{display: "flex", gap: 6, marginTop: 10}}>
          <button className="btn"><Icon name="camera" className="ic ic-sm"/> MealCam</button>
          <button className="btn"><Icon name="search" className="ic ic-sm"/> Search</button>
          <button className="btn"><Icon name="copy" className="ic ic-sm"/> Same as yesterday</button>
        </div>
      )}
    </Card>
  );
};

// --- INSIGHTS ---
const NutritionInsights = () => (
  <div className="grid" style={{gridTemplateColumns: "1fr 1fr", gap: 16}}>
    <Card title="Calorie balance" sub="14 days" actions={<Pill>kcal vs target</Pill>}>
      <LineChart
        series={[
          { data: [2580, 2710, 2680, 2520, 2740, 2890, 2410, 2670, 2530, 2620, 2780, 2650, 2510, 1847], color: "var(--acc-nutri)" },
          { data: Array(14).fill(2700), color: "var(--fg-dim)" }
        ]}
        h={180}
        xLabels={["", "", "Mon", "", "", "Thu", "", "", "Sun", "", "", "Wed", "", "Today"]}
        range={[1500, 3200]}
      />
    </Card>
    <Card title="Macro split · 14d avg" sub="Target ratio: 28 / 47 / 25">
      <div className="col-gap" style={{gap: 10, marginTop: 8}}>
        {[
          { l: "Protein", v: 31, t: 28, color: "var(--acc-train)" },
          { l: "Carbs",   v: 44, t: 47, color: "var(--acc-recov)" },
          { l: "Fat",     v: 25, t: 25, color: "var(--acc-goals)" },
        ].map(m => (
          <div key={m.l}>
            <div style={{display: "flex", justifyContent: "space-between", marginBottom: 4}}>
              <span className="eyebrow">{m.l}</span>
              <span className="num" style={{fontSize: 11}}>{m.v}% <span className="dim">/ {m.t}%</span></span>
            </div>
            <Meter value={m.v} max={50} color={m.color} tall />
          </div>
        ))}
      </div>
      <div className="divider" />
      <Row label="Avg calories" value="2,617 kcal" />
      <Row label="Highest day" value="Tue · 2,890" />
      <Row label="Lowest day"  value="Wed · 2,410" />
      <Row label="Days at target ±100" value="9 of 14" />
    </Card>

    <Card title="Micronutrient trend" sub="30 days · top 8" style={{gridColumn: "span 2"}}>
      <NutrientHeatmap />
    </Card>
    {window.NutritionHeatmapView && <div style={{gridColumn: "span 2"}}><window.NutritionHeatmapView /></div>}
  </div>
);

const NutrientHeatmap = () => {
  const nutrients = ["Vit D", "Omega-3", "Magnesium", "Iron", "B12", "Calcium", "Zinc", "Vit C"];
  const days = 30;
  // pseudo-stable data
  const data = nutrients.map(() =>
    Array.from({length: days}, () => Math.max(0, Math.min(1, 0.55 + (Math.random() - 0.4) * 0.6)))
  );
  return (
    <div>
      <div style={{display: "grid", gridTemplateColumns: "80px 1fr", gap: 4}}>
        {nutrients.map((n, i) => (
          <React.Fragment key={i}>
            <div style={{fontSize: 11, color: "var(--fg-muted)", display: "flex", alignItems: "center"}}>{n}</div>
            <div style={{display: "grid", gridTemplateColumns: `repeat(${days}, 1fr)`, gap: 2}}>
              {data[i].map((v, j) => (
                <div
                  key={j}
                  title={`${n} · day ${j + 1}: ${Math.round(v * 100)}%`}
                  style={{
                    height: 16,
                    background: v >= 0.8 ? "var(--pos)" : v >= 0.5 ? "var(--warn)" : "var(--neg)",
                    opacity: 0.25 + v * 0.7,
                    borderRadius: 2,
                  }}
                />
              ))}
            </div>
          </React.Fragment>
        ))}
      </div>
      <div style={{display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 10, fontSize: 10, color: "var(--fg-muted)"}}>
        <span className="row-gap"><span style={{width: 10, height: 10, background: "var(--neg)", opacity: 0.6, borderRadius: 2}} /> {"<50%"}</span>
        <span className="row-gap"><span style={{width: 10, height: 10, background: "var(--warn)", opacity: 0.6, borderRadius: 2}} /> 50–80%</span>
        <span className="row-gap"><span style={{width: 10, height: 10, background: "var(--pos)", opacity: 0.6, borderRadius: 2}} /> {">80%"}</span>
      </div>
    </div>
  );
};

// --- NUTRIENTS DEEP DIVE ---
const NutritionNutrients = () => {
  const groups = [
    {
      name: "Macronutrients",
      items: [
        { n: "Protein", v: "142 g", t: "180 g", pct: 79, color: "var(--acc-train)" },
        { n: "Carbohydrate", v: "168 g", t: "320 g", pct: 53, color: "var(--acc-recov)" },
        { n: "  Sugar",   v: "42 g", t: "—", pct: 0, color: "var(--fg-dim)", sub: true },
        { n: "  Fiber",   v: "24 g", t: "35 g", pct: 68, color: "var(--pos)", sub: true },
        { n: "Fat", v: "72 g", t: "90 g", pct: 80, color: "var(--acc-goals)" },
        { n: "  Saturated", v: "18 g", t: "<22 g", pct: 82, color: "var(--fg-muted)", sub: true },
        { n: "  PUFA",      v: "21 g", t: "—", pct: 0, color: "var(--fg-dim)", sub: true },
      ]
    },
    {
      name: "Fat-soluble vitamins",
      items: [
        { n: "Vitamin A", v: "780 µg", t: "900 µg", pct: 87, color: "var(--pos)" },
        { n: "Vitamin D", v: "8.4 µg", t: "20 µg", pct: 42, color: "var(--warn)" },
        { n: "Vitamin E", v: "12 mg", t: "15 mg", pct: 80, color: "var(--pos)" },
        { n: "Vitamin K", v: "104 µg", t: "120 µg", pct: 87, color: "var(--pos)" },
      ]
    },
    {
      name: "Water-soluble vitamins",
      items: [
        { n: "Vitamin C", v: "92 mg",  t: "90 mg",  pct: 102, color: "var(--pos)" },
        { n: "Thiamin (B1)", v: "1.4 mg", t: "1.2 mg", pct: 117, color: "var(--pos)" },
        { n: "Riboflavin (B2)", v: "1.8 mg", t: "1.3 mg", pct: 138, color: "var(--pos)" },
        { n: "Niacin (B3)", v: "24 mg", t: "16 mg", pct: 150, color: "var(--pos)" },
        { n: "B6", v: "1.9 mg", t: "1.7 mg", pct: 112, color: "var(--pos)" },
        { n: "Folate (B9)", v: "380 µg", t: "400 µg", pct: 95, color: "var(--pos)" },
        { n: "B12", v: "4.2 µg", t: "2.4 µg", pct: 175, color: "var(--pos)" },
      ]
    },
    {
      name: "Minerals",
      items: [
        { n: "Calcium", v: "740 mg", t: "1000 mg", pct: 74, color: "var(--warn)" },
        { n: "Iron",    v: "14 mg",  t: "18 mg",   pct: 78, color: "var(--warn)" },
        { n: "Magnesium", v: "240 mg", t: "350 mg", pct: 68, color: "var(--warn)" },
        { n: "Potassium", v: "3,140 mg", t: "3,500 mg", pct: 90, color: "var(--pos)" },
        { n: "Zinc", v: "11 mg", t: "11 mg", pct: 100, color: "var(--pos)" },
        { n: "Sodium", v: "2,140 mg", t: "<2300 mg", pct: 93, color: "var(--pos)" },
      ]
    },
  ];
  return (
    <div>
      <div style={{display: "flex", gap: 8, marginBottom: 16}}>
        <button className="btn">Today</button>
        <button className="btn btn-ghost">7d avg</button>
        <button className="btn btn-ghost">30d avg</button>
        <div className="spacer" />
        <button className="btn btn-ghost"><Icon name="download" className="ic ic-sm" /> Export</button>
      </div>
      <div className="grid g-cols-2" style={{gap: 16}}>
        {groups.map(g => (
          <Card key={g.name} title={g.name} sub={`${g.items.length} of 117`}>
            <table className="tbl">
              <tbody>
                {g.items.map((it, i) => (
                  <tr key={i}>
                    <td style={{paddingLeft: it.sub ? 12 : 0, color: it.sub ? "var(--fg-muted)" : "var(--fg)"}}>{it.n}</td>
                    <td className="num" style={{width: 80, textAlign: "right"}}>{it.v}</td>
                    <td className="muted num" style={{width: 60, textAlign: "right"}}>{it.t}</td>
                    <td style={{width: 80}}>{it.pct > 0 && <Meter value={Math.min(it.pct, 100)} color={it.color} />}</td>
                    <td className="num" style={{width: 36, textAlign: "right", color: it.color}}>{it.pct > 0 ? `${it.pct}%` : ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        ))}
      </div>
    </div>
  );
};

// --- FOOD DB ---
const NutritionFoods = () => {
  const [query, setQuery] = useState("");
  const foods = [
    { name: "Oats · rolled, dry",    src: "BLS", kcal: 379, p: 13, c: 67, f: 7,   fav: true },
    { name: "Whey protein isolate",  src: "BLS", kcal: 380, p: 88, c: 7, f: 1,  fav: true },
    { name: "Chicken breast · raw",  src: "BLS", kcal: 165, p: 31, c: 0, f: 3.6, fav: true },
    { name: "Salmon · Atlantic, raw",src: "BLS", kcal: 208, p: 20, c: 0, f: 13 },
    { name: "Basmati rice · dry",    src: "BLS", kcal: 360, p: 8, c: 79, f: 0.5 },
    { name: "Sweet potato · raw",    src: "BLS", kcal: 86,  p: 1.6, c: 20, f: 0.1 },
    { name: "Banana · medium",       src: "BLS", kcal: 89,  p: 1.1, c: 23, f: 0.3 },
    { name: "Almonds · raw",         src: "BLS", kcal: 579, p: 21, c: 22, f: 50 },
    { name: "Greek yogurt 2%",       src: "BLS",  kcal: 73,  p: 10, c: 4, f: 1.9 },
    { name: "Eggs · large, whole",   src: "BLS", kcal: 155, p: 13, c: 1.1, f: 11 },
    { name: "Olive oil · extra virgin", src: "BLS", kcal: 884, p: 0, c: 0, f: 100 },
    { name: "Spinach · raw",         src: "BLS", kcal: 23,  p: 2.9, c: 3.6, f: 0.4 },
  ];
  const filtered = query ? foods.filter(f => f.name.toLowerCase().includes(query.toLowerCase())) : foods;
  return (
    <div>
      <div style={{display: "flex", gap: 8, marginBottom: 16}}>
        <div style={{flex: 1, position: "relative"}}>
          <Icon name="search" className="ic ic-sm" style={{position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--fg-subtle)"}} />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search across 7,140 foods · BLS (Bundeslebensmittelschlüssel)"
            style={{
              width: "100%", height: 32, background: "var(--surface)", border: "1px solid var(--border)",
              borderRadius: 6, padding: "0 12px 0 30px", fontSize: 12, outline: "none"
            }}
          />
        </div>
        <button className="btn"><Icon name="filter" className="ic ic-sm" /> Filters</button>
        <button className="btn btn-primary" onClick={() => window.dispatchEvent(new CustomEvent("open-nutrition-modal", {detail: {type: "customfood"}}))}><Icon name="plus" className="ic ic-sm" /> Custom food</button>
      </div>

      <div style={{display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap"}}>
        {["All", "Favorites", "Recent", "Meat", "Fish", "Grains", "Dairy", "Produce", "Beverages", "Supplements"].map((c, i) => (
          <Pill key={c} variant={i === 0 ? "acc" : ""}>{c}</Pill>
        ))}
      </div>

      <Card>
        <table className="tbl">
          <thead>
            <tr>
              <th style={{width: 30}}></th>
              <th>Food</th>
              <th style={{width: 70}}>Source</th>
              <th style={{width: 70, textAlign: "right"}}>kcal/100g</th>
              <th style={{width: 60, textAlign: "right"}}>P</th>
              <th style={{width: 60, textAlign: "right"}}>C</th>
              <th style={{width: 60, textAlign: "right"}}>F</th>
              <th style={{width: 80, textAlign: "right"}}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((f, i) => (
              <tr key={i} style={{cursor: "pointer"}} onClick={() => window.dispatchEvent(new CustomEvent("open-nutrition-modal", {detail: {type: "food", food: f}}))}>
                <td>{f.fav && <Icon name="bookmark" className="ic ic-sm" style={{color: "var(--acc-nutri)", fill: "currentColor"}} />}</td>
                <td>{f.name}</td>
                <td><Pill>{f.src}</Pill></td>
                <td className="num" style={{textAlign: "right"}}>{f.kcal}</td>
                <td className="num" style={{textAlign: "right"}}>{f.p}</td>
                <td className="num" style={{textAlign: "right"}}>{f.c}</td>
                <td className="num" style={{textAlign: "right"}}>{f.f}</td>
                <td style={{textAlign: "right"}}>
                  <button className="btn" style={{height: 22, fontSize: 11, padding: "0 8px"}}><Icon name="plus" className="ic ic-sm"/>Add</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
};

const NutritionPlanner = () => {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const slots = ["Breakfast", "Lunch", "Dinner", "Snacks"];
  return (
    <div>
      <div style={{display: "flex", gap: 8, marginBottom: 16}}>
        <button className="btn btn-ghost"><Icon name="chevron_left" className="ic ic-sm" /></button>
        <button className="btn">Week of May 12–18</button>
        <button className="btn btn-ghost"><Icon name="chevron_right" className="ic ic-sm" /></button>
        <div className="spacer" />
        <button className="btn"><Icon name="copy" className="ic ic-sm" /> Copy week</button>
        <button className="btn btn-primary" onClick={() => window.dispatchEvent(new CustomEvent("open-nutrition-modal", {detail: {type: "recipe"}}))}><Icon name="plus" className="ic ic-sm" /> New recipe</button>
      </div>
      <Card>
        <div style={{display: "grid", gridTemplateColumns: "100px repeat(7, 1fr)", gap: 6}}>
          <div></div>
          {days.map((d, i) => (
            <div key={d} style={{padding: 6, fontSize: 11, color: i === 5 ? "var(--acc)" : "var(--fg-muted)", textAlign: "center", fontWeight: i === 5 ? 600 : 400}}>
              {d} <span className="num dim" style={{fontSize: 10}}>{12 + i}</span>
            </div>
          ))}
          {slots.map(s => (
            <React.Fragment key={s}>
              <div style={{padding: "10px 6px", fontSize: 11, fontWeight: 500, color: "var(--fg-muted)", borderTop: "1px solid var(--border)"}}>{s}</div>
              {days.map((d, di) => (
                <div key={d} style={{
                  padding: 8, minHeight: 60, borderTop: "1px solid var(--border)",
                  background: di === 5 ? "color-mix(in oklch, var(--acc) 5%, transparent)" : "transparent",
                  fontSize: 11
                }}>
                  {planSample(s, di)}
                </div>
              ))}
            </React.Fragment>
          ))}
        </div>
      </Card>
    </div>
  );
};

const planSample = (slot, di) => {
  const map = {
    Breakfast: ["Oats + Whey", "Oats + Whey", "Eggs · 3", "Oats + Whey", "Eggs · 3", "Oats + Whey", "Skyr bowl"],
    Lunch:     ["Chicken + Rice", "Salmon + Sweet Pot.", "Chicken + Rice", "Beef + Rice", "Chicken + Rice", "Chicken + Rice", "Tuna salad"],
    Dinner:    ["Pasta + Mince", "Stir-fry tofu", "Chicken curry", "Lentil bowl", "Pizza · cheat", "Roast chicken", "Risotto"],
    Snacks:    ["Cottage + Berries", "Skyr + Almonds", "Banana + PB", "Skyr + Almonds", "Pretzels", "Cottage + Berries", "Apple"],
  };
  return (
    <div style={{fontSize: 11, color: "var(--fg)"}}>
      <div style={{marginBottom: 2}}>{map[slot][di]}</div>
      <div className="num dim" style={{fontSize: 10}}>{Math.round(400 + Math.random() * 400)} kcal</div>
    </div>
  );
};

// --- MEALCAM MODAL ---
const MealCamModal = ({ onClose }) => {
  const [step, setStep] = useState(1); // 1=capture, 2=detect, 3=review
  return (
    <div className="modal-veil" onClick={onClose}>
      <div className="modal" style={{width: 720}} onClick={e => e.stopPropagation()}>
        <div className="modal-h">
          <Icon name="camera" className="ic" style={{color: "var(--acc-nutri)"}} />
          <div style={{flex: 1}}>
            <div style={{fontWeight: 600, fontSize: 14}}>MealCam</div>
            <div className="dim" style={{fontSize: 11}}>Step {step} of 3 · AI food recognition</div>
          </div>
          <button className="icon-btn" onClick={onClose}><Icon name="x" className="ic" /></button>
        </div>
        <div className="modal-body">
          {step === 1 && (
            <>
              <div className="placeholder-img" style={{aspectRatio: "4/3", marginBottom: 12, fontSize: 11}}>
                drop photo · paste · take picture
              </div>
              <div style={{display: "flex", gap: 8}}>
                <button className="btn"><Icon name="camera" className="ic ic-sm" /> Capture</button>
                <button className="btn">Upload photo</button>
                <button className="btn btn-ghost">Paste URL</button>
              </div>
              <div className="dim" style={{fontSize: 11, marginTop: 10}}>Tip: Capture the full plate from above for best detection. Online only.</div>
            </>
          )}
          {step === 2 && (
            <>
              <div className="cam-frame" style={{marginBottom: 12, background: "linear-gradient(135deg, oklch(0.32 0.04 80), oklch(0.28 0.03 120))"}}>
                <div className="bbox" style={{left: "8%", top: "22%", width: "38%", height: "44%"}}>
                  <span className="bbox-label">CHICKEN · 180g · 94%</span>
                </div>
                <div className="bbox" style={{left: "48%", top: "12%", width: "42%", height: "32%"}}>
                  <span className="bbox-label">RICE · 200g · 87%</span>
                </div>
                <div className="bbox" style={{left: "52%", top: "52%", width: "38%", height: "38%"}}>
                  <span className="bbox-label">GREENS · 150g · 76%</span>
                </div>
              </div>
              <div className="dim" style={{fontSize: 11}}>3 foods detected · adjusting weights in step 3</div>
            </>
          )}
          {step === 3 && (
            <div className="col-gap">
              {[
                { n: "Chicken breast · grilled", q: 180, kcal: 297, conf: 94 },
                { n: "Basmati rice · cooked",   q: 200, kcal: 260, conf: 87 },
                { n: "Mixed greens + olive oil", q: 150, kcal: 124, conf: 76 },
              ].map((f, i) => (
                <Card key={i} className="card-tight" style={{padding: 12}}>
                  <div style={{display: "flex", alignItems: "center", gap: 10}}>
                    <span className="dot" style={{background: "var(--acc-nutri)"}} />
                    <span style={{fontSize: 13, fontWeight: 500, flex: 1}}>{f.n}</span>
                    <Pill variant={f.conf >= 90 ? "pos" : "warn"}>{f.conf}% confident</Pill>
                  </div>
                  <div style={{display: "flex", gap: 10, marginTop: 10, alignItems: "center"}}>
                    <input type="range" min="50" max="400" defaultValue={f.q} style={{flex: 1, accentColor: "var(--acc-nutri)"}} />
                    <span className="num" style={{width: 60, textAlign: "right"}}>{f.q}g</span>
                    <span className="num dim" style={{width: 60, textAlign: "right"}}>{f.kcal} kcal</span>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
        <div className="modal-f">
          {step > 1 ? <button className="btn btn-ghost" onClick={() => setStep(s => s - 1)}><Icon name="chevron_left" className="ic ic-sm" /> Back</button> : <div />}
          <div className="spacer" />
          {step < 3 ? (
            <button className="btn btn-primary" onClick={() => setStep(s => s + 1)}>Next <Icon name="arrow_right" className="ic ic-sm" /></button>
          ) : (
            <button className="btn btn-primary" onClick={onClose}><Icon name="check" className="ic ic-sm" /> Log meal</button>
          )}
        </div>
      </div>
    </div>
  );
};

window.NutritionModule = NutritionModule;
