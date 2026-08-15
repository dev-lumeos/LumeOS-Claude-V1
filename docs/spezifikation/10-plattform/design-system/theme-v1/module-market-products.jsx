// Marketplace · Block B — Products, Bundles, Checkout state machine,
// Content delivery, Licenses, Reviews (per SPEC_01 §3, SPEC_02, SPEC_03 F1, SPEC_04 F3/F5, SPEC_10)

const PRODUCT_TYPES = [
  { t: "training_program",    l: "Training program",    api: "POST /api/training/routines",     icon: "training",    fee: "digital" },
  { t: "meal_plan",           l: "Meal plan",           api: "POST /api/nutrition/meal-plans",  icon: "nutrition",   fee: "digital" },
  { t: "supplement_protocol", l: "Supplement protocol", api: "POST /api/supplements/stacks",    icon: "supplements", fee: "digital", extra: "requires_confirmation: true" },
  { t: "recovery_protocol",   l: "Recovery protocol",   api: "POST /api/recovery/protocols",    icon: "recovery",    fee: "digital" },
  { t: "bundle",              l: "Bundle",              api: "→ all component APIs",            icon: "layers",      fee: "digital" },
  { t: "ai_persona",          l: "AI persona",          api: "POST /api/buddy/personas",        icon: "brain",       fee: "digital" },
  { t: "session",             l: "Coach session",       api: "POST /api/coach/sessions",        icon: "coach",       fee: "session" },
  { t: "equipment",           l: "Equipment",           api: "physical fulfilment",             icon: "marketplace", fee: "physical" },
  { t: "digital",             l: "Digital / other",     api: "POST /api/licenses",              icon: "file",        fee: "digital" },
];

const CATALOG = [
  {
    id: "P-2201", type: "bundle", title: "12-Week Lean Bulk Bundle",
    creator: { name: "Coach Alex", verified: true, level: "verified", share: 80 },
    price: 4900, compare: 7700, rating: 4.8, reviews: 234, purchases: 1_842, views: 18_400,
    difficulty: "intermediate", weeks: 12, equipment: ["Barbell", "Dumbbells", "Rack"],
    goals: ["muscle_gain", "strength", "performance"],
    short: "Training, nutrition and supplements aligned for a clean 12-week lean bulk.",
    components: [
      { type: "training_program",    title: "PPL Hypertrophy", detail: "4×/week · 12 weeks", price: 3900 },
      { type: "meal_plan",           title: "Lean Bulk Meal Plan", detail: "2,800 kcal · 5 meals", price: 2400 },
      { type: "supplement_protocol", title: "Beginner Bulk Stack", detail: "Creatine · Whey · D3", price: 1400 },
    ],
    promoted: true, created: 96,
  },
  {
    id: "P-2188", type: "training_program", title: "PPL Hypertrophy Pro",
    creator: { name: "Coach Maria", verified: true, level: "premium", share: 80 },
    price: 2900, compare: null, rating: 4.6, reviews: 118, purchases: 940, views: 9_200,
    difficulty: "intermediate", weeks: 12, equipment: ["Barbell", "Cables"],
    goals: ["muscle_gain", "strength"],
    short: "Training only. Six-day push-pull-legs with autoregulated top sets.",
    components: null, promoted: false, created: 210,
  },
  {
    id: "P-2174", type: "meal_plan", title: "Cut · 8 Weeks Meal Plan",
    creator: { name: "Jana Bauer", verified: true, level: "verified", share: 80 },
    price: 4900, compare: null, rating: 4.9, reviews: 224, purchases: 1_120, views: 11_800,
    difficulty: "beginner", weeks: 8, equipment: [],
    goals: ["fat_loss", "body_composition"],
    short: "2,100 kcal baseline with two refeed days a week and a shopping list per week.",
    components: null, promoted: false, created: 140,
  },
  {
    id: "P-2160", type: "supplement_protocol", title: "Evidence Stack · Foundation",
    creator: { name: "David Park", verified: true, level: "verified", share: 80 },
    price: 1900, compare: null, rating: 4.7, reviews: 142, purchases: 2_240, views: 14_100,
    difficulty: "beginner", weeks: null, equipment: [],
    goals: ["general", "health"],
    short: "Eight S- and A-grade supplements with dosing windows and interaction notes.",
    components: null, promoted: false, created: 320,
  },
  {
    id: "P-2145", type: "session", title: "1-on-1 Nutrition Consultation",
    creator: { name: "Jana Bauer", verified: true, level: "verified", share: 80 },
    price: 12000, compare: null, rating: 4.8, reviews: 64, purchases: 310, views: 4_200,
    difficulty: null, weeks: null, equipment: [],
    goals: ["general"], short: "60 minutes, video call, written follow-up within 48 hours.",
    components: null, promoted: false, created: 420,
  },
  {
    id: "P-2131", type: "recovery_protocol", title: "Sleep Optimisation · 4 Weeks",
    creator: { name: "Hanna Brodersen", verified: true, level: "basic", share: 80 },
    price: 2400, compare: null, rating: 4.8, reviews: 56, purchases: 420, views: 5_100,
    difficulty: "beginner", weeks: 4, equipment: [],
    goals: ["health", "general"],
    short: "Circadian anchoring, light protocol and a wind-down routine with daily tasks.",
    components: null, promoted: false, created: 60,
  },
  {
    id: "P-2120", type: "ai_persona", title: "Competition Prep Persona",
    creator: { name: "Coach Alex", verified: true, level: "verified", share: 80 },
    price: 900, compare: null, rating: 4.5, reviews: 38, purchases: 680, views: 7_400,
    difficulty: null, weeks: null, equipment: [],
    goals: ["performance"], short: "A stricter AI coach voice tuned for the final twelve weeks.",
    components: null, promoted: false, created: 45,
  },
  {
    id: "P-2108", type: "equipment", title: "Adjustable Dumbbells · 2–32 kg",
    creator: { name: "Powerblock", verified: true, level: "premium", share: 85 },
    price: 58000, compare: 64000, rating: 4.6, reviews: 162, purchases: 240, views: 8_900,
    difficulty: null, weeks: null, equipment: [],
    goals: ["general"], short: "Pair. Ships within Germany in three days.",
    components: null, promoted: false, created: 500,
  },
];

const LICENSES = [
  { id: "L-1141", product: "12-Week Lean Bulk Bundle", pid: "P-2201", type: "lifetime", from: "14 May 2026", until: null, active: true,
    status: "delivered", at: "14 May 18:02",
    results: [
      { mod: "Training",    obj: "Routine",  id: "rt_8f21", ok: true },
      { mod: "Nutrition",   obj: "Meal plan", id: "mp_2c04", ok: true },
      { mod: "Supplements", obj: "Stack",     id: "st_91ab", ok: true, note: "awaiting your confirmation" },
    ]},
  { id: "L-1128", product: "Cut · 8 Weeks Meal Plan", pid: "P-2174", type: "lifetime", from: "22 Mar 2026", until: null, active: true,
    status: "delivered", at: "22 Mar 09:14",
    results: [{ mod: "Nutrition", obj: "Meal plan", id: "mp_1f77", ok: true }] },
  { id: "L-1119", product: "Evidence Stack · Foundation", pid: "P-2160", type: "lifetime", from: "08 Feb 2026", until: null, active: true,
    status: "partial", at: "08 Feb 20:31",
    results: [{ mod: "Supplements", obj: "Stack", id: "st_44de", ok: true }, { mod: "Nutrition", obj: "Gap targets", id: null, ok: false, note: "endpoint returned 502 · retry available" }] },
  { id: "L-1102", product: "PPL Hypertrophy Pro", pid: "P-2188", type: "lifetime", from: "02 May 2026", until: null, active: false,
    status: "delivered", at: "02 May 10:15", refunded: true,
    results: [{ mod: "Training", obj: "Routine", id: "rt_5b90", ok: true, note: "deactivated on refund" }] },
];

const REVIEWS = {
  "P-2201": {
    dist: [4, 6, 12, 58, 154],
    items: [
      { by: "Lukas B.", at: "12 May", rating: 5, title: "Delivery just works", body: "Bought it, opened Training and the routine was there with all twelve weeks planned. Meal plan showed up as ghost entries the same evening.", helpful: 34, unhelpful: 1, verified: true,
        response: { by: "Coach Alex", at: "13 May", body: "Thanks Lukas — week 5 has the intensification block, watch the RPE cap there." } },
      { by: "Sophie K.", at: "28 Apr", rating: 4, title: "Strong, but equipment-heavy", body: "Needs a rack and a full dumbbell set. Home gym users should check the equipment list first.", helpful: 18, unhelpful: 2, verified: true, response: null },
      { by: "Marcus W.", at: "14 Apr", rating: 5, title: "The supplement stack is honest", body: "No proprietary blends, no upsell. Creatine, whey, D3 and that is it.", helpful: 12, unhelpful: 0, verified: true, response: null },
    ],
  },
};

const money = (c) => "€" + (c / 100).toFixed(2);

// ══ Product grid ══════════════════════════════════════
window.MarketBrowseV2 = () => {
  const [cat, setCat] = useState("All");
  const [q, setQ] = useState("");
  const [detail, setDetail] = useState(null);
  const [checkout, setCheckout] = useState(null);

  const cats = ["All", "Bundles", "Training", "Nutrition", "Supplements", "Recovery", "Sessions", "Equipment"];
  const catMap = { Bundles: "bundle", Training: "training_program", Nutrition: "meal_plan", Supplements: "supplement_protocol", Recovery: "recovery_protocol", Sessions: "session", Equipment: "equipment" };
  const rows = CATALOG.filter(p => {
    if (cat !== "All" && p.type !== catMap[cat]) return false;
    if (q && !(p.title + p.creator.name).toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  return (
    <>
      <div style={{display: "flex", gap: 8, marginBottom: 12}}>
        <div style={{flex: 1, position: "relative"}}>
          <Icon name="search" className="ic ic-sm" style={{position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--fg-subtle)"}}/>
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search products, creators, goals…" style={{width: "100%", height: 34, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 7, padding: "0 12px 0 32px", fontSize: 12}}/>
        </div>
        <select style={{height: 34, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 7, padding: "0 10px", fontSize: 12}}>
          <option>Sort · Search score</option><option>Price ↑</option><option>Rating</option><option>Newest</option><option>Most purchased</option>
        </select>
      </div>
      <div style={{display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap"}}>
        {cats.map(c => (
          <button key={c} onClick={() => setCat(c)} className={cat === c ? "pill pill-acc" : "pill"} style={{cursor: "pointer", padding: "4px 12px", fontSize: 11.5}}>{c}</button>
        ))}
      </div>

      <div style={{display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12}}>
        {rows.map(p => <ProductCardV2 key={p.id} p={p} onOpen={() => setDetail(p)}/>)}
      </div>

      {detail && <ProductDetailModal p={detail} onClose={() => setDetail(null)} onBuy={() => { setCheckout(detail); setDetail(null); }}/>}
      {checkout && <CheckoutFlow p={checkout} onClose={() => setCheckout(null)}/>}
    </>
  );
};

const ProductCardV2 = ({ p, onOpen }) => {
  const meta = PRODUCT_TYPES.find(t => t.t === p.type);
  const savings = p.compare ? p.compare - p.price : 0;
  return (
    <Card onClick={onOpen} style={{cursor: "pointer", position: "relative", overflow: "hidden"}}>
      {p.promoted && <div style={{position: "absolute", top: 0, right: 0, padding: "3px 10px", background: "var(--acc-goals)", color: "var(--bg)", fontSize: 9, fontWeight: 700, letterSpacing: "0.06em", borderRadius: "0 0 0 6px"}}>PROMOTED</div>}
      <div className="placeholder-img" style={{aspectRatio: "16/10", borderRadius: 6, marginBottom: 11, position: "relative"}}>
        <Icon name={meta.icon} className="ic" style={{width: 28, height: 28, color: "var(--fg-dim)"}}/>
        {savings > 0 && <div style={{position: "absolute", bottom: 6, left: 6, padding: "2px 8px", background: "var(--pos)", color: "var(--bg)", fontSize: 9.5, fontWeight: 700, borderRadius: 4}}>SAVE {money(savings)}</div>}
      </div>
      <div style={{display: "flex", alignItems: "center", gap: 6, marginBottom: 5}}>
        <Pill>{meta.l}</Pill>
        {p.difficulty && <Pill>{p.difficulty}</Pill>}
      </div>
      <div style={{fontSize: 13, fontWeight: 600, lineHeight: 1.3, marginBottom: 4, minHeight: 34}}>{p.title}</div>
      <div className="muted" style={{fontSize: 11, marginBottom: 9}}>
        {p.creator.name} {p.creator.verified && <span style={{color: "var(--pos)"}}>✓</span>}
      </div>
      {p.components && (
        <div className="col-gap" style={{gap: 3, marginBottom: 9}}>
          {p.components.map(c => (
            <div key={c.type} style={{display: "flex", gap: 6, fontSize: 10.5, alignItems: "center"}}>
              <Icon name={PRODUCT_TYPES.find(t => t.t === c.type).icon} className="ic" style={{width: 10, height: 10, color: "var(--acc-mkt)", flexShrink: 0}}/>
              <span className="muted" style={{whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"}}>{c.title}</span>
            </div>
          ))}
        </div>
      )}
      <div style={{display: "flex", alignItems: "baseline", justifyContent: "space-between", marginTop: "auto"}}>
        <div>
          <span className="num" style={{fontSize: 16, fontWeight: 600}}>{money(p.price)}</span>
          {p.compare && <span className="num dim" style={{fontSize: 11, marginLeft: 6, textDecoration: "line-through"}}>{money(p.compare)}</span>}
        </div>
        <span className="dim" style={{fontSize: 10}}>{p.rating} ★ ({p.reviews})</span>
      </div>
    </Card>
  );
};

// ══ Product detail ════════════════════════════════════
const ProductDetailModal = ({ p, onClose, onBuy }) => {
  const [tab, setTab] = useState("overview");
  const meta = PRODUCT_TYPES.find(t => t.t === p.type);
  const w = window.WALLET_STATE || { voucher_cents: 5250, revenue_cents: 84050 };
  const available = w.voucher_cents + w.revenue_cents;
  const enough = available >= p.price;
  const rv = REVIEWS[p.id];
  const compTotal = p.components ? p.components.reduce((s, c) => s + c.price, 0) : 0;
  const savings = compTotal - p.price;

  return (
    <div className="modal-veil" onClick={onClose}>
      <div className="modal" style={{width: 780, maxHeight: "92vh"}} onClick={e => e.stopPropagation()}>
        <div className="modal-h">
          <div style={{width: 28, height: 28, borderRadius: 6, background: "color-mix(in srgb, var(--acc-mkt) 18%, transparent)", border: "1px solid color-mix(in srgb, var(--acc-mkt) 35%, transparent)", color: "var(--acc-mkt)", display: "grid", placeItems: "center"}}>
            <Icon name={meta.icon} className="ic"/>
          </div>
          <div style={{flex: 1}}>
            <div style={{display: "flex", alignItems: "center", gap: 7, marginBottom: 2}}>
              <span style={{fontSize: 15, fontWeight: 600}}>{p.title}</span>
              {p.promoted && <Pill style={{color: "var(--acc-goals)", borderColor: "color-mix(in srgb, var(--acc-goals) 35%, var(--border))"}}>promoted</Pill>}
            </div>
            <div className="dim" style={{fontSize: 11}}>{p.creator.name} · {p.rating} ★ ({p.reviews} reviews) · {p.purchases.toLocaleString()} purchases</div>
          </div>
          <button className="icon-btn" onClick={onClose}><Icon name="x" className="ic"/></button>
        </div>

        <div className="modal-body" style={{padding: 0, overflowY: "auto"}}>
          <div style={{padding: "0 18px"}}>
            <Tabs items={[
              { id: "overview", label: "Overview" },
              { id: "contents", label: p.components ? "Bundle contents" : "What you get" },
              { id: "reviews",  label: "Reviews", count: p.reviews },
              { id: "delivery", label: "Delivery" },
            ]} active={tab} onChange={setTab}/>
          </div>

          <div style={{padding: 18}}>
            {tab === "overview" && (
              <>
                <div className="placeholder-img" style={{aspectRatio: "21/9", borderRadius: 8, marginBottom: 14}}>
                  <Icon name={meta.icon} className="ic" style={{width: 36, height: 36, color: "var(--fg-dim)"}}/>
                </div>
                <div style={{fontSize: 13, lineHeight: 1.6, color: "var(--fg-muted)", marginBottom: 16}}>{p.short}</div>
                <div className="grid g-cols-4" style={{gap: 10, marginBottom: 16}}>
                  {[
                    ["Type", meta.l],
                    ["Difficulty", p.difficulty || "—"],
                    ["Duration", p.weeks ? p.weeks + " weeks" : "—"],
                    ["Licence", "lifetime"],
                  ].map(([l, v]) => (
                    <div key={l} style={{padding: 11, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6}}>
                      <div className="eyebrow" style={{marginBottom: 3}}>{l}</div>
                      <div style={{fontSize: 12}}>{v}</div>
                    </div>
                  ))}
                </div>
                <div className="eyebrow" style={{marginBottom: 6}}>Goal alignment</div>
                <div style={{display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 14}}>
                  {p.goals.map(g => <Pill key={g} variant={["muscle_gain","strength","performance"].includes(g) ? "acc" : ""}>{g}</Pill>)}
                </div>
                {p.equipment.length > 0 && (
                  <>
                    <div className="eyebrow" style={{marginBottom: 6}}>Equipment required</div>
                    <div style={{display: "flex", gap: 5, flexWrap: "wrap"}}>{p.equipment.map(e => <Pill key={e}>{e}</Pill>)}</div>
                  </>
                )}
              </>
            )}

            {tab === "contents" && (
              p.components ? (
                <>
                  <div className="col-gap" style={{gap: 8, marginBottom: 14}}>
                    {p.components.map(c => {
                      const cm = PRODUCT_TYPES.find(t => t.t === c.type);
                      return (
                        <div key={c.type} style={{display: "flex", alignItems: "center", gap: 12, padding: 13, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 7}}>
                          <div style={{width: 34, height: 34, borderRadius: 7, background: "color-mix(in srgb, var(--acc-mkt) 14%, var(--surface-2))", border: "1px solid var(--border)", display: "grid", placeItems: "center", color: "var(--acc-mkt)", flexShrink: 0}}>
                            <Icon name={cm.icon} className="ic"/>
                          </div>
                          <div style={{flex: 1}}>
                            <div style={{fontSize: 12.5, fontWeight: 600, marginBottom: 2}}>{c.title}</div>
                            <div className="muted" style={{fontSize: 11}}>{c.detail} · lands in {cm.l.split(" ")[0]}</div>
                          </div>
                          <span className="num dim" style={{fontSize: 12}}>{money(c.price)}</span>
                        </div>
                      );
                    })}
                  </div>
                  <div style={{padding: 14, background: "color-mix(in srgb, var(--pos) 7%, var(--surface))", border: "1px solid color-mix(in srgb, var(--pos) 25%, var(--border))", borderRadius: 7}}>
                    <div style={{display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4}}>
                      <span className="muted">Bought separately</span><span className="num" style={{textDecoration: "line-through"}}>{money(compTotal)}</span>
                    </div>
                    <div style={{display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 8}}>
                      <span className="muted">Bundle price</span><span className="num">{money(p.price)}</span>
                    </div>
                    <div style={{display: "flex", justifyContent: "space-between", alignItems: "baseline", paddingTop: 8, borderTop: "1px solid color-mix(in srgb, var(--pos) 25%, var(--border))"}}>
                      <span style={{fontSize: 13, fontWeight: 600, color: "var(--pos)"}}>You save</span>
                      <span className="num" style={{fontSize: 18, fontWeight: 600, color: "var(--pos)"}}>{money(savings)} <span style={{fontSize: 12}}>({Math.round((savings / compTotal) * 100)}%)</span></span>
                    </div>
                  </div>
                </>
              ) : (
                <div style={{padding: 13, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 7, display: "flex", gap: 12, alignItems: "center"}}>
                  <div style={{width: 34, height: 34, borderRadius: 7, background: "color-mix(in srgb, var(--acc-mkt) 14%, var(--surface-2))", display: "grid", placeItems: "center", color: "var(--acc-mkt)"}}><Icon name={meta.icon} className="ic"/></div>
                  <div><div style={{fontSize: 12.5, fontWeight: 600}}>{meta.l}</div><div className="muted" style={{fontSize: 11}}>Delivered to your {meta.l.split(" ")[0]} module on purchase</div></div>
                </div>
              )
            )}

            {tab === "reviews" && (
              rv ? (
                <>
                  <div style={{display: "flex", gap: 20, marginBottom: 16, alignItems: "center"}}>
                    <div style={{textAlign: "center", minWidth: 90}}>
                      <div className="num" style={{fontSize: 34, fontWeight: 500, lineHeight: 1}}>{p.rating}</div>
                      <div className="dim" style={{fontSize: 11, marginTop: 4}}>{p.reviews} reviews</div>
                    </div>
                    <div style={{flex: 1}}>
                      {[5,4,3,2,1].map((s, i) => {
                        const n = rv.dist[4 - i];
                        const pct = Math.round((n / p.reviews) * 100);
                        return (
                          <div key={s} style={{display: "grid", gridTemplateColumns: "16px 1fr 42px", gap: 8, alignItems: "center", marginBottom: 4}}>
                            <span className="num dim" style={{fontSize: 10.5}}>{s}★</span>
                            <div style={{height: 6, background: "var(--surface-2)", borderRadius: 999}}>
                              <div style={{height: "100%", width: pct + "%", background: "var(--acc-goals)", borderRadius: 999}}/>
                            </div>
                            <span className="num dim" style={{fontSize: 10, textAlign: "right"}}>{n}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div className="col-gap" style={{gap: 8}}>
                    {rv.items.map((r, i) => (
                      <Card key={i} className="card-tight" style={{padding: 13}}>
                        <div style={{display: "flex", alignItems: "center", gap: 8, marginBottom: 6}}>
                          <span style={{fontSize: 12.5, fontWeight: 600}}>{r.by}</span>
                          {r.verified && <Pill variant="pos">verified purchase</Pill>}
                          <span className="num" style={{fontSize: 11, color: "var(--acc-goals)"}}>{"★".repeat(r.rating)}</span>
                          <span className="dim mono" style={{marginLeft: "auto", fontSize: 10}}>{r.at}</span>
                        </div>
                        <div style={{fontSize: 12.5, fontWeight: 600, marginBottom: 4}}>{r.title}</div>
                        <div className="muted" style={{fontSize: 12, lineHeight: 1.55, marginBottom: 8}}>{r.body}</div>
                        <div style={{display: "flex", gap: 6, alignItems: "center"}}>
                          <button className="btn btn-sm btn-ghost">Helpful · {r.helpful}</button>
                          <button className="btn btn-sm btn-ghost">Not helpful · {r.unhelpful}</button>
                        </div>
                        {r.response && (
                          <div style={{marginTop: 10, padding: 11, background: "color-mix(in srgb, var(--acc-mkt) 6%, var(--surface-2))", borderLeft: "2px solid var(--acc-mkt)", borderRadius: "0 6px 6px 0"}}>
                            <div style={{fontSize: 11, fontWeight: 600, marginBottom: 3}}>{r.response.by} · creator <span className="dim mono" style={{fontWeight: 400, marginLeft: 4}}>{r.response.at}</span></div>
                            <div className="muted" style={{fontSize: 11.5, lineHeight: 1.5}}>{r.response.body}</div>
                          </div>
                        )}
                      </Card>
                    ))}
                  </div>
                  <div style={{marginTop: 12, padding: 11, background: "var(--surface)", borderRadius: 6, fontSize: 11.5, color: "var(--fg-muted)", lineHeight: 1.5}}>
                    Only verified purchases can review, once per product. Reviews are checked against an active licence before they are accepted.
                  </div>
                </>
              ) : <div className="dim" style={{padding: 20, textAlign: "center", fontSize: 12}}>No reviews yet.</div>
            )}

            {tab === "delivery" && (
              <>
                <div className="dim" style={{fontSize: 12, lineHeight: 1.55, marginBottom: 14}}>
                  Nothing is delivered as a PDF. On purchase the content is written straight into the target modules through their APIs, and the licence records which objects were created.
                </div>
                <table className="tbl">
                  <thead><tr><th>Component</th><th style={{width: 130}}>Target module</th><th>API call</th></tr></thead>
                  <tbody>
                    {(p.components || [{ type: p.type, title: p.title }]).map(c => {
                      const cm = PRODUCT_TYPES.find(t => t.t === c.type);
                      return (
                        <tr key={c.type}>
                          <td style={{fontSize: 12}}>{c.title}</td>
                          <td><Pill>{cm.l.split(" ")[0]}</Pill></td>
                          <td className="mono dim" style={{fontSize: 10.5}}>{cm.api}{cm.extra ? " · " + cm.extra : ""}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </>
            )}
          </div>
        </div>

        <div className="modal-f" style={{alignItems: "center", gap: 12}}>
          <div style={{flex: 1, display: "flex", alignItems: "center", gap: 10}}>
            <div>
              <span className="num" style={{fontSize: 20, fontWeight: 600}}>{money(p.price)}</span>
              {p.compare && <span className="num dim" style={{fontSize: 12, marginLeft: 7, textDecoration: "line-through"}}>{money(p.compare)}</span>}
            </div>
            <div style={{padding: "5px 10px", borderRadius: 6, fontSize: 11, background: enough ? "color-mix(in srgb, var(--pos) 8%, var(--surface))" : "color-mix(in srgb, var(--warn) 8%, var(--surface))", border: `1px solid ${enough ? "color-mix(in srgb, var(--pos) 28%, var(--border))" : "color-mix(in srgb, var(--warn) 28%, var(--border))"}`, color: enough ? "var(--pos)" : "var(--warn)"}}>
              Wallet {money(available)} {enough ? "· sufficient" : "· short " + money(p.price - available)}
            </div>
          </div>
          <button className="btn btn-ghost" onClick={onClose}>Close</button>
          <button className="btn btn-primary" onClick={onBuy}>Buy for {money(p.price)}</button>
        </div>
      </div>
    </div>
  );
};

// ══ Checkout state machine ════════════════════════════
const CheckoutFlow = ({ p, onClose }) => {
  const [phase, setPhase] = useState("preview");
  const [delivered, setDelivered] = useState({});
  const w = window.WALLET_STATE || { voucher_cents: 5250, revenue_cents: 84050 };
  const available = w.voucher_cents + w.revenue_cents;
  const short = p.price - available;
  const voucherDebit = Math.min(w.voucher_cents, p.price);
  const revenueDebit = Math.max(0, p.price - voucherDebit);
  const comps = p.components || [{ type: p.type, title: p.title }];

  const run = () => {
    setPhase("processing");
    comps.forEach((c, i) => {
      setTimeout(() => {
        setDelivered(d => ({ ...d, [c.type]: "delivered" }));
        if (i === comps.length - 1) setTimeout(() => setPhase("success"), 400);
      }, 700 * (i + 1));
    });
  };

  const PHASES = ["preview", "confirming", "processing", "success"];

  return (
    <div className="modal-veil" onClick={phase === "processing" ? undefined : onClose}>
      <div className="modal" style={{width: 560}} onClick={e => e.stopPropagation()}>
        <div className="modal-h">
          <div style={{width: 26, height: 26, borderRadius: 6, background: "color-mix(in srgb, var(--acc-mkt) 18%, transparent)", border: "1px solid color-mix(in srgb, var(--acc-mkt) 35%, transparent)", color: "var(--acc-mkt)", display: "grid", placeItems: "center"}}>
            <Icon name="marketplace" className="ic"/>
          </div>
          <div style={{flex: 1}}>
            <div style={{fontSize: 14, fontWeight: 600}}>Checkout</div>
            <div className="dim mono" style={{fontSize: 10.5}}>phase: {phase}</div>
          </div>
          {phase !== "processing" && <button className="icon-btn" onClick={onClose}><Icon name="x" className="ic"/></button>}
        </div>

        <div className="modal-body">
          {/* phase rail */}
          <div style={{display: "flex", gap: 4, marginBottom: 18}}>
            {PHASES.map(ph => {
              const idx = PHASES.indexOf(phase);
              const on = PHASES.indexOf(ph) <= idx;
              return <div key={ph} style={{flex: 1, height: 4, borderRadius: 999, background: on ? "var(--acc-mkt)" : "var(--surface-2)", opacity: ph === phase ? 1 : on ? 0.5 : 1}}/>;
            })}
          </div>

          {(phase === "preview" || phase === "confirming") && (
            <>
              <div style={{display: "flex", gap: 12, marginBottom: 16, alignItems: "center"}}>
                <div className="placeholder-img" style={{width: 64, height: 64, borderRadius: 7, flexShrink: 0}}>
                  <Icon name={PRODUCT_TYPES.find(t => t.t === p.type).icon} className="ic" style={{color: "var(--fg-dim)"}}/>
                </div>
                <div>
                  <div style={{fontSize: 13.5, fontWeight: 600, marginBottom: 2}}>{p.title}</div>
                  <div className="muted" style={{fontSize: 11.5}}>{p.creator.name} · lifetime licence</div>
                </div>
                <span className="num" style={{marginLeft: "auto", fontSize: 18, fontWeight: 600}}>{money(p.price)}</span>
              </div>

              {short > 0 ? (
                <div style={{padding: 14, background: "color-mix(in srgb, var(--warn) 8%, var(--surface))", border: "1px solid color-mix(in srgb, var(--warn) 30%, var(--border))", borderRadius: 7, marginBottom: 14}}>
                  <div style={{display: "flex", alignItems: "center", gap: 8, marginBottom: 6}}>
                    <Icon name="alert" className="ic" style={{color: "var(--warn)"}}/>
                    <span style={{fontSize: 13, fontWeight: 600, color: "var(--warn)"}}>Wallet too low</span>
                  </div>
                  <div className="muted" style={{fontSize: 11.5, lineHeight: 1.5, marginBottom: 10}}>
                    Short by <span className="num" style={{color: "var(--fg)"}}>{money(short)}</span>. Top up to continue.
                  </div>
                  <button className="btn btn-primary btn-sm">Top up {money(Math.ceil(short / 1000) * 1000)}</button>
                </div>
              ) : (
                <>
                  <div className="eyebrow" style={{marginBottom: 8}}>Payment split</div>
                  <div className="col-gap" style={{gap: 0, marginBottom: 14}}>
                    <Row label="Voucher balance" value={"− " + money(voucherDebit)}/>
                    {revenueDebit > 0 && <Row label="Revenue balance" value={"− " + money(revenueDebit)}/>}
                    <Row label="Wallet after purchase" value={money(available - p.price)}/>
                  </div>
                </>
              )}

              <div className="eyebrow" style={{marginBottom: 8}}>Will be added to</div>
              <div className="col-gap" style={{gap: 5}}>
                {comps.map(c => {
                  const cm = PRODUCT_TYPES.find(t => t.t === c.type);
                  return (
                    <div key={c.type} style={{display: "flex", gap: 9, alignItems: "center", padding: "9px 11px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6}}>
                      <Icon name={cm.icon} className="ic ic-sm" style={{color: "var(--acc-mkt)"}}/>
                      <span style={{fontSize: 12}}>{c.title}</span>
                      <span className="dim mono" style={{marginLeft: "auto", fontSize: 10}}>{cm.l.split(" ")[0]}</span>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {phase === "processing" && (
            <>
              <div style={{textAlign: "center", padding: "10px 0 18px"}}>
                <div className="num" style={{fontSize: 15, fontWeight: 600, marginBottom: 4}}>Delivering content…</div>
                <div className="muted" style={{fontSize: 11.5}}>Wallet debited · writing into your modules</div>
              </div>
              <div className="col-gap" style={{gap: 6}}>
                {comps.map(c => {
                  const cm = PRODUCT_TYPES.find(t => t.t === c.type);
                  const st = delivered[c.type];
                  return (
                    <div key={c.type} style={{display: "flex", gap: 10, alignItems: "center", padding: "11px 12px", background: "var(--surface)", border: `1px solid ${st ? "color-mix(in srgb, var(--pos) 28%, var(--border))" : "var(--border)"}`, borderRadius: 6}}>
                      <div style={{width: 18, height: 18, borderRadius: 999, display: "grid", placeItems: "center", background: st ? "var(--pos)" : "var(--surface-2)", flexShrink: 0}}>
                        {st ? <Icon name="check" className="ic" style={{width: 11, height: 11, color: "var(--bg)", strokeWidth: 3}}/> : null}
                      </div>
                      <span style={{fontSize: 12}}>{c.title}</span>
                      <span className="dim mono" style={{marginLeft: "auto", fontSize: 10}}>{st ? "delivered" : "pending…"}</span>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {phase === "success" && (
            <>
              <div style={{textAlign: "center", padding: "6px 0 18px"}}>
                <div style={{width: 46, height: 46, borderRadius: 999, background: "color-mix(in srgb, var(--pos) 18%, transparent)", border: "1px solid color-mix(in srgb, var(--pos) 40%, var(--border))", display: "grid", placeItems: "center", margin: "0 auto 12px"}}>
                  <Icon name="check" className="ic" style={{width: 22, height: 22, color: "var(--pos)", strokeWidth: 2.5}}/>
                </div>
                <div style={{fontSize: 16, fontWeight: 600, marginBottom: 4}}>Purchase complete</div>
                <div className="muted" style={{fontSize: 12}}>Licence L-1142 · lifetime · everything is live in your modules</div>
              </div>
              <div className="col-gap" style={{gap: 5, marginBottom: 14}}>
                {comps.map(c => {
                  const cm = PRODUCT_TYPES.find(t => t.t === c.type);
                  return (
                    <div key={c.type} style={{display: "flex", gap: 9, alignItems: "center", padding: "10px 11px", background: "color-mix(in srgb, var(--pos) 6%, var(--surface))", border: "1px solid color-mix(in srgb, var(--pos) 22%, var(--border))", borderRadius: 6}}>
                      <Icon name="check" className="ic ic-sm" style={{color: "var(--pos)"}}/>
                      <span style={{fontSize: 12}}>{c.title}</span>
                      <span className="dim mono" style={{marginLeft: "auto", fontSize: 10}}>→ {cm.l.split(" ")[0]}</span>
                    </div>
                  );
                })}
              </div>
              <div className="col-gap" style={{gap: 0}}>
                <Row label="Paid" value={money(p.price)}/>
                <Row label="Platform fee (20%)" value={money(Math.round(p.price * 0.2))}/>
                <Row label={"Credited to " + p.creator.name} value={money(p.price - Math.round(p.price * 0.2))}/>
              </div>
            </>
          )}
        </div>

        <div className="modal-f">
          {phase === "preview" && <>
            <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" disabled={short > 0} onClick={() => setPhase("confirming")}>Continue</button>
          </>}
          {phase === "confirming" && <>
            <button className="btn btn-ghost" onClick={() => setPhase("preview")}>Back</button>
            <button className="btn btn-primary" onClick={run}>Confirm purchase · {money(p.price)}</button>
          </>}
          {phase === "processing" && <button className="btn btn-ghost" disabled>Processing…</button>}
          {phase === "success" && <>
            <button className="btn btn-ghost" onClick={onClose}>Close</button>
            <button className="btn btn-primary" onClick={onClose}>Open in Training</button>
          </>}
        </div>
      </div>
    </div>
  );
};

// ══ Licenses tab ══════════════════════════════════════
window.MarketLicenses = () => (
  <div className="col-gap" style={{gap: 12}}>
    <div style={{padding: 12, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 7, fontSize: 11.5, color: "var(--fg-muted)", lineHeight: 1.55}}>
      Every purchase creates a licence that records what was delivered and where. Failed deliveries can be retried without buying again.
    </div>
    {LICENSES.map(l => (
      <Card key={l.id} style={{opacity: l.active ? 1 : 0.62}}>
        <div style={{display: "flex", alignItems: "center", gap: 10, marginBottom: 10, flexWrap: "wrap"}}>
          <span className="mono dim" style={{fontSize: 10.5}}>{l.id}</span>
          <span style={{fontSize: 13.5, fontWeight: 600}}>{l.product}</span>
          <Pill>{l.type}</Pill>
          {l.status === "delivered" && <Pill variant="pos">delivered</Pill>}
          {l.status === "partial" && <Pill variant="warn">partial</Pill>}
          {l.refunded && <Pill variant="block">refunded · licence inactive</Pill>}
          <span className="dim mono" style={{marginLeft: "auto", fontSize: 10}}>{l.from}{l.until ? " → " + l.until : " · no expiry"}</span>
        </div>
        <div className="col-gap" style={{gap: 5}}>
          {l.results.map((r, i) => (
            <div key={i} style={{display: "flex", gap: 9, alignItems: "center", padding: "9px 11px", background: r.ok ? "var(--surface)" : "color-mix(in srgb, var(--warn) 6%, var(--surface))", border: `1px solid ${r.ok ? "var(--border)" : "color-mix(in srgb, var(--warn) 25%, var(--border))"}`, borderRadius: 6}}>
              <Icon name={r.ok ? "check" : "alert"} className="ic ic-sm" style={{color: r.ok ? "var(--pos)" : "var(--warn)"}}/>
              <span style={{fontSize: 12}}>{r.mod} · {r.obj}</span>
              {r.id && <span className="mono dim" style={{fontSize: 10}}>{r.id}</span>}
              {r.note && <span className="dim" style={{fontSize: 10.5, marginLeft: 6}}>{r.note}</span>}
              {!r.ok && <button className="btn btn-sm" style={{marginLeft: "auto"}}>Retry delivery</button>}
            </div>
          ))}
        </div>
        {l.active && !l.refunded && (
          <div style={{display: "flex", gap: 6, marginTop: 10}}>
            <button className="btn btn-sm btn-ghost">Re-deliver all</button>
            <button className="btn btn-sm btn-ghost">Write review</button>
            <button className="btn btn-sm btn-ghost">Request refund</button>
          </div>
        )}
      </Card>
    ))}
  </div>
);

Object.assign(window, { CATALOG, PRODUCT_TYPES, LICENSES, REVIEWS });
