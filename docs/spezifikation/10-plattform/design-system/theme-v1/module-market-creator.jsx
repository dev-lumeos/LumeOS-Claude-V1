// Marketplace · Creator profile view + Block C (scoring, fees)

const CREATOR_PROFILES = {
  "Anders Lindqvist": {
    name: "Anders Lindqvist", handle: "@anderslindqvist", type: "coach", avatar: "CA",
    verified: true, level: "verified", since: "March 2023",
    bio: "Strength and physique coach. Twelve years in the gym, eight coaching. I build programmes that survive a bad week — progression that adapts rather than programmes that break.",
    certs: ["NSCA-CSCS", "Precision Nutrition L1", "IFBB Prep Coach"],
    specs: ["Hypertrophy", "Powerbuilding", "Contest prep", "Lean bulk"],
    stats: { sales: 3_842, revenue_cents: 1_642_000, rating: 4.8, reviews: 512, products: 6, students: 214, response: "4h" },
    share: 80,
    location: "Stockholm, SE", languages: ["English", "Swedish"],
    products: ["P-2201", "P-2120"],
    sales30: [42, 38, 51, 47, 62, 58, 71, 66, 74, 69, 82, 78],
    ratingDist: [6, 11, 28, 118, 349],
    reviews: [
      { by: "Lukas B.", at: "12 May", rating: 5, product: "12-Week Lean Bulk Bundle", body: "Programme is honest about what it needs. Twelve weeks, four days, no gimmicks." },
      { by: "Daniel V.", at: "3 May", rating: 5, product: "Competition Prep Persona", body: "Changed how the AI coach talks to me during peak week. Worth the nine euros." },
      { by: "Sophie K.", at: "28 Apr", rating: 4, product: "12-Week Lean Bulk Bundle", body: "Strong but equipment-heavy — check the list first if you train at home." },
    ],
  },
  "Jana Bauer": {
    name: "Jana Bauer", handle: "@janabauer", type: "nutritionist", avatar: "JB",
    verified: true, level: "verified", since: "January 2024",
    bio: "Sports nutrition, DGE certified. I work with weight trends and lab markers, not with willpower. Every plan comes with a shopping list and a fallback for travel weeks.",
    certs: ["DGE certified", "ISSN Sports Nutritionist"],
    specs: ["Recomposition", "Cutting", "Refeed protocols", "Lab-informed nutrition"],
    stats: { sales: 1_430, revenue_cents: 684_000, rating: 4.9, reviews: 288, products: 3, students: 96, response: "6h" },
    share: 80,
    location: "Berlin, DE", languages: ["German", "English"],
    products: ["P-2174", "P-2145"],
    sales30: [18, 22, 19, 26, 24, 31, 28, 34, 30, 38, 35, 41],
    ratingDist: [2, 4, 12, 62, 208],
    reviews: [
      { by: "Elena S.", at: "9 May", rating: 5, product: "Cut · 8 Weeks Meal Plan", body: "The shopping list per week is the part nobody else does properly." },
      { by: "Tom M.", at: "1 May", rating: 5, product: "1-on-1 Nutrition Consultation", body: "Went through my bloodwork before the call. Prepared, not generic." },
    ],
  },
  "David Park": {
    name: "David Park", handle: "@davidpark", type: "coach", avatar: "DP",
    verified: true, level: "verified", since: "June 2023",
    bio: "Evidence-led supplementation. I will tell you when something does not work — most of my consultations end with a shorter stack than the one you arrived with.",
    certs: ["Examine.com contributor", "BSc Nutritional Science"],
    specs: ["Supplement protocols", "Interaction screening", "Cycle support"],
    stats: { sales: 2_240, revenue_cents: 425_000, rating: 4.7, reviews: 142, products: 2, students: 64, response: "12h" },
    share: 80,
    location: "Remote", languages: ["English"],
    products: ["P-2160"],
    sales30: [28, 31, 26, 34, 29, 38, 33, 41, 36, 44, 39, 47],
    ratingDist: [3, 5, 14, 44, 76],
    reviews: [
      { by: "Niko B.", at: "6 May", rating: 5, product: "Evidence Stack · Foundation", body: "Cut my stack from fourteen items to eight and my bloodwork improved." },
    ],
  },
  "Erik Lange": {
    name: "Erik Lange", handle: "@eriklange", type: "coach", avatar: "CM",
    verified: true, level: "premium", since: "August 2022",
    bio: "Autoregulated training. RPE-first programming for lifters who cannot promise the same energy every week.",
    certs: ["NASM-CPT", "RTS Mentorship"],
    specs: ["Autoregulation", "PPL", "Intermediate progression"],
    stats: { sales: 940, revenue_cents: 272_000, rating: 4.6, reviews: 118, products: 2, students: 41, response: "8h" },
    share: 80,
    location: "Lisbon, PT", languages: ["English", "Portuguese"],
    products: ["P-2188"],
    sales30: [12, 15, 13, 18, 16, 21, 19, 24, 20, 26, 23, 28],
    ratingDist: [2, 4, 10, 38, 64],
    reviews: [{ by: "Felix K.", at: "2 May", rating: 5, product: "PPL Hypertrophy Pro", body: "First programme that told me what to do on a bad day instead of assuming I would hit the numbers." }],
  },
  "Hanna Brodersen": {
    name: "Hanna Brodersen", handle: "@hannab", type: "coach", avatar: "HB",
    verified: true, level: "basic", since: "November 2025",
    bio: "Sleep and recovery coaching built on HRV data rather than sleep-hygiene checklists.",
    certs: ["Sleep Science Coach (SSC)"],
    specs: ["Sleep optimisation", "HRV interpretation", "Circadian anchoring"],
    stats: { sales: 420, revenue_cents: 84_000, rating: 4.8, reviews: 56, products: 1, students: 22, response: "5h" },
    share: 80,
    location: "Hamburg, DE", languages: ["German", "English"],
    products: ["P-2131"],
    sales30: [6, 8, 7, 11, 9, 14, 12, 16, 13, 18, 15, 21],
    ratingDist: [1, 1, 4, 16, 34],
    reviews: [{ by: "Mira S.", at: "11 May", rating: 5, product: "Sleep Optimisation · 4 Weeks", body: "Anchored my wake time for four weeks. HRV baseline moved 6 ms." }],
  },
  "Dr. M. Kessler": {
    name: "Dr. M. Kessler", handle: "@drkessler", type: "coach", avatar: "MK",
    verified: true, level: "premium", since: "May 2021",
    bio: "Endocrinologist and sports physician. I read bloodwork before I read training logs. Consultations are medical, not motivational — and I will decline anything that belongs with your GP.",
    certs: ["Facharzt für Endokrinologie", "DGE member", "Sports medicine (DGSP)"],
    specs: ["TRT management", "Bloodwork interpretation", "Enhanced protocol safety", "Hormone panels"],
    stats: { sales: 310, revenue_cents: 892_000, rating: 5.0, reviews: 38, products: 2, students: 12, response: "36h" },
    share: 80,
    location: "Berlin, DE", languages: ["German", "English"],
    products: [],
    sales30: [4, 5, 4, 7, 6, 8, 7, 9, 8, 11, 9, 12],
    ratingDist: [0, 0, 0, 2, 36],
    reviews: [
      { by: "Tom M.", at: "23 Apr", rating: 5, product: "Quarterly panel review", body: "Went through 44 markers, flagged the two that mattered and left the rest alone. No supplement upsell." },
      { by: "Daniel V.", at: "2 Apr", rating: 5, product: "TRT protocol consultation", body: "Told me plainly that my plan was wrong and why. Rare." },
    ],
  },
  "Powerblock": {
    name: "Powerblock", handle: "@powerblock", type: "brand", avatar: "PB",
    verified: true, level: "premium", since: "February 2022",
    bio: "Adjustable dumbbell manufacturer. Direct sales into LumeOS with equipment tagging so your routines know what you own.",
    certs: ["Verified vendor", "EU warranty partner"],
    specs: ["Home gym equipment", "Adjustable weights"],
    stats: { sales: 240, revenue_cents: 1_392_000, rating: 4.6, reviews: 162, products: 4, students: 0, response: "24h" },
    share: 85,
    location: "Munich, DE", languages: ["German", "English"],
    products: ["P-2108"],
    sales30: [4, 6, 5, 8, 7, 9, 6, 11, 8, 12, 9, 14],
    ratingDist: [4, 8, 18, 52, 80],
    reviews: [{ by: "Marcus W.", at: "20 Apr", rating: 5, product: "Adjustable Dumbbells · 2–32 kg", body: "Arrived in three days, tagged into my equipment list automatically." }],
  },
};

const VERIFY_LEVELS = {
  pending:  { l: "Pending", c: "var(--fg-dim)",     d: "Application under review" },
  basic:    { l: "Basic",   c: "var(--acc-recov)",  d: "Email and social verified" },
  verified: { l: "Verified",c: "var(--pos)",        d: "ID and credentials confirmed" },
  premium:  { l: "Premium", c: "var(--acc-goals)",  d: "Track record audited · priority placement" },
};

const cmoney = (c) => "€" + (c / 100).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

window.CreatorProfileModal = ({ name, onClose, onOpenProduct }) => {
  const [tab, setTab] = useState("about");
  const c = CREATOR_PROFILES[name] || {
    name, handle: "@" + String(name).toLowerCase().replace(/[^a-z]/g, ""), type: "coach",
    avatar: String(name).split(" ").map(x => x[0]).join("").slice(0, 2).toUpperCase(),
    verified: true, level: "basic", since: "2025",
    bio: "Profile details are still being completed by this creator.",
    certs: [], specs: [],
    stats: { sales: 0, revenue_cents: 0, rating: 0, reviews: 0, products: 0, students: 0, response: "—" },
    share: 80, location: "—", languages: ["English"], products: [],
    sales30: [0,0,0,0,0,0,0,0,0,0,0,0], ratingDist: [0,0,0,0,0], reviews: [],
  };
  const vl = VERIFY_LEVELS[c.level];
  const products = (window.CATALOG || []).filter(p => c.products.includes(p.id));

  return (
    <div className="modal-veil" onClick={onClose}>
      <div className="modal" style={{width: 800, maxHeight: "92vh"}} onClick={e => e.stopPropagation()}>
        {/* Header banner */}
        <div style={{padding: "20px 20px 0", borderBottom: "1px solid var(--border)", position: "relative", background: "linear-gradient(180deg, color-mix(in srgb, var(--acc-mkt) 8%, transparent), transparent)"}}>
          <button className="icon-btn" onClick={onClose} style={{position: "absolute", top: 14, right: 14}}><Icon name="x" className="ic"/></button>
          <div style={{display: "flex", gap: 16, marginBottom: 16}}>
            <div style={{width: 76, height: 76, borderRadius: 16, background: "var(--acc-mkt)", color: "var(--bg)", display: "grid", placeItems: "center", fontWeight: 600, fontSize: 26, flexShrink: 0}}>{c.avatar}</div>
            <div style={{flex: 1, minWidth: 0}}>
              <div style={{display: "flex", alignItems: "center", gap: 8, marginBottom: 3, flexWrap: "wrap"}}>
                <span style={{fontSize: 19, fontWeight: 600, letterSpacing: "-0.02em"}}>{c.name}</span>
                <Pill style={{color: vl.c, borderColor: `color-mix(in srgb, ${vl.c} 35%, var(--border))`, background: `color-mix(in srgb, ${vl.c} 8%, transparent)`}}>
                  {c.verified && "✓ "}{vl.l}
                </Pill>
                <Pill>{c.type}</Pill>
              </div>
              <div className="mono dim" style={{fontSize: 11.5, marginBottom: 8}}>{c.handle} · {c.location} · creator since {c.since}</div>
              <div style={{display: "flex", gap: 14, flexWrap: "wrap"}}>
                {[
                  [c.stats.rating + " ★", `${c.stats.reviews} reviews`],
                  [c.stats.sales.toLocaleString(), "sales"],
                  [c.stats.products, "products"],
                  [c.stats.students, "coaching clients"],
                  [c.stats.response, "avg response"],
                ].map(([v, l]) => (
                  <div key={l}>
                    <div className="num" style={{fontSize: 14, fontWeight: 600}}>{v}</div>
                    <div className="dim" style={{fontSize: 10}}>{l}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <Tabs items={[
            { id: "about",    label: "About" },
            { id: "products", label: "Products", count: products.length },
            { id: "reviews",  label: "Reviews", count: c.stats.reviews },
            { id: "trust",    label: "Verification" },
          ]} active={tab} onChange={setTab}/>
        </div>

        <div className="modal-body" style={{padding: 18, overflowY: "auto"}}>
          {tab === "about" && (
            <>
              <div style={{fontSize: 13, lineHeight: 1.65, color: "var(--fg-muted)", marginBottom: 18, maxWidth: 620}}>{c.bio}</div>
              <div className="grid g-cols-2" style={{gap: 14, marginBottom: 16}}>
                <div>
                  <div className="eyebrow" style={{marginBottom: 7}}>Specialisations</div>
                  <div style={{display: "flex", gap: 5, flexWrap: "wrap"}}>{c.specs.map(s => <Pill key={s} variant="acc">{s}</Pill>)}</div>
                </div>
                <div>
                  <div className="eyebrow" style={{marginBottom: 7}}>Certifications</div>
                  <div style={{display: "flex", gap: 5, flexWrap: "wrap"}}>{c.certs.map(s => <Pill key={s}>{s}</Pill>)}</div>
                </div>
              </div>
              <div className="eyebrow" style={{marginBottom: 7}}>Sales · last 12 months</div>
              <Card className="card-tight" style={{padding: 12, marginBottom: 14}}>
                <Sparkline data={c.sales30} color="var(--acc-mkt)" h={60}/>
                <div style={{display: "flex", gap: 16, marginTop: 8, fontSize: 11}}>
                  <span className="muted">Lifetime revenue <span className="num" style={{color: "var(--fg)"}}>{cmoney(c.stats.revenue_cents)}</span></span>
                  <span className="muted">Revenue share <span className="num" style={{color: "var(--fg)"}}>{c.share}%</span></span>
                  <span className="muted">Languages <span style={{color: "var(--fg)"}}>{c.languages.join(", ")}</span></span>
                </div>
              </Card>
              <div style={{display: "flex", gap: 6}}>
                <button className="btn btn-primary"><Icon name="message" className="ic ic-sm"/>Contact</button>
                <button className="btn"><Icon name="bookmark" className="ic ic-sm"/>Follow</button>
                <button className="btn btn-ghost">Report</button>
              </div>
            </>
          )}

          {tab === "products" && (
            <div style={{display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12}}>
              {products.map(p => {
                const meta = (window.PRODUCT_TYPES || []).find(t => t.t === p.type) || { l: p.type, icon: "marketplace" };
                return (
                  <Card key={p.id} onClick={() => onOpenProduct?.(p)} style={{cursor: "pointer"}}>
                    <div style={{display: "flex", gap: 11}}>
                      <div className="placeholder-img" style={{width: 62, height: 62, borderRadius: 7, flexShrink: 0}}>
                        <Icon name={meta.icon} className="ic" style={{color: "var(--fg-dim)"}}/>
                      </div>
                      <div style={{flex: 1, minWidth: 0}}>
                        <div style={{display: "flex", gap: 6, marginBottom: 4}}><Pill>{meta.l}</Pill>{p.promoted && <Pill style={{color: "var(--acc-goals)"}}>promoted</Pill>}</div>
                        <div style={{fontSize: 12.5, fontWeight: 600, lineHeight: 1.3, marginBottom: 4}}>{p.title}</div>
                        <div style={{display: "flex", alignItems: "baseline", gap: 8}}>
                          <span className="num" style={{fontSize: 14, fontWeight: 600}}>{cmoney(p.price)}</span>
                          <span className="dim" style={{fontSize: 10}}>{p.rating} ★ ({p.reviews})</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}

          {tab === "reviews" && (
            <>
              <div style={{display: "flex", gap: 20, marginBottom: 16, alignItems: "center"}}>
                <div style={{textAlign: "center", minWidth: 90}}>
                  <div className="num" style={{fontSize: 34, fontWeight: 500, lineHeight: 1}}>{c.stats.rating}</div>
                  <div className="dim" style={{fontSize: 11, marginTop: 4}}>{c.stats.reviews} reviews</div>
                </div>
                <div style={{flex: 1}}>
                  {[5,4,3,2,1].map((s, i) => {
                    const n = c.ratingDist[4 - i];
                    const pct = Math.round((n / c.stats.reviews) * 100);
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
                {c.reviews.map((r, i) => (
                  <Card key={i} className="card-tight" style={{padding: 13}}>
                    <div style={{display: "flex", alignItems: "center", gap: 8, marginBottom: 5}}>
                      <span style={{fontSize: 12.5, fontWeight: 600}}>{r.by}</span>
                      <Pill variant="pos">verified</Pill>
                      <span className="num" style={{fontSize: 11, color: "var(--acc-goals)"}}>{"★".repeat(r.rating)}</span>
                      <span className="dim mono" style={{marginLeft: "auto", fontSize: 10}}>{r.at}</span>
                    </div>
                    <div className="dim mono" style={{fontSize: 10, marginBottom: 5}}>{r.product}</div>
                    <div className="muted" style={{fontSize: 12, lineHeight: 1.55}}>{r.body}</div>
                  </Card>
                ))}
              </div>
            </>
          )}

          {tab === "trust" && (
            <>
              <div style={{padding: 14, background: `color-mix(in srgb, ${vl.c} 7%, var(--surface))`, border: `1px solid color-mix(in srgb, ${vl.c} 26%, var(--border))`, borderRadius: 8, marginBottom: 16}}>
                <div style={{display: "flex", alignItems: "center", gap: 9, marginBottom: 5}}>
                  <Icon name="shield" className="ic" style={{color: vl.c}}/>
                  <span style={{fontSize: 14, fontWeight: 600, color: vl.c}}>{vl.l} creator</span>
                </div>
                <div className="muted" style={{fontSize: 12, lineHeight: 1.5}}>{vl.d}</div>
              </div>
              <div className="eyebrow" style={{marginBottom: 8}}>Verification ladder</div>
              <div className="col-gap" style={{gap: 6, marginBottom: 16}}>
                {Object.entries(VERIFY_LEVELS).map(([k, v]) => {
                  const reached = ["pending","basic","verified","premium"].indexOf(k) <= ["pending","basic","verified","premium"].indexOf(c.level);
                  return (
                    <div key={k} style={{display: "flex", gap: 10, alignItems: "center", padding: "10px 12px", background: "var(--surface)", border: `1px solid ${k === c.level ? `color-mix(in srgb, ${v.c} 32%, var(--border))` : "var(--border)"}`, borderRadius: 6, opacity: reached ? 1 : 0.5}}>
                      <div style={{width: 16, height: 16, borderRadius: 999, display: "grid", placeItems: "center", background: reached ? v.c : "var(--surface-2)", flexShrink: 0}}>
                        {reached && <Icon name="check" className="ic" style={{width: 10, height: 10, color: "var(--bg)", strokeWidth: 3}}/>}
                      </div>
                      <span style={{fontSize: 12.5, fontWeight: k === c.level ? 600 : 400}}>{v.l}</span>
                      <span className="muted" style={{fontSize: 11, marginLeft: 4}}>{v.d}</span>
                      {k === c.level && <Pill style={{marginLeft: "auto", color: v.c}}>current</Pill>}
                    </div>
                  );
                })}
              </div>
              <div className="col-gap" style={{gap: 0}}>
                <Row label="Payout account" value="Stripe Connect · verified"/>
                <Row label="Revenue share" value={c.share + "% · " + (100 - c.share) + "% platform fee"}/>
                <Row label="Refund rate" value="1.2% · below 5% threshold"/>
                <Row label="Dispute rate" value="0.3%"/>
                <Row label="Content review" value={c.level === "premium" ? "auto-publish" : "manual review before publish"}/>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

Object.assign(window, { CREATOR_PROFILES, VERIFY_LEVELS });
