// Marketplace · Block D — Creator side: onboarding, product builder, bundle builder,
// sales analytics, promotion slots + ROI, review responses, refunds
// per SPEC_03 F3/F4/F7/F8/F9, SPEC_05 §5/§9, SPEC_09 §6, SPEC_10

const PROMO_SLOTS = [
  { t: "daily_boost",      l: "Daily boost",      price: 999,   dur: "24 hours", place: "Top 10 in category" },
  { t: "weekly_boost",     l: "Weekly boost",     price: 4999,  dur: "7 days",   place: "Top 10 in category" },
  { t: "category_feature", l: "Category feature", price: 9999,  dur: "7 days",   place: "Exclusive category banner" },
  { t: "homepage",         l: "Homepage",         price: 24999, dur: "7 days",   place: "Homepage featured section" },
];

const ACTIVE_PROMOS = [
  { id: "PS-341", product: "5/3/1 BBB · 12 weeks", slot: "weekly_boost", cost: 4999, from: "10 May", to: "17 May",
    impressions: 8_420, clicks: 512, conversions: 18, avgPrice: 3900, status: "active" },
  { id: "PS-338", product: "Training Periodization · 3 month", slot: "daily_boost", cost: 999, from: "6 May", to: "7 May",
    impressions: 1_240, clicks: 68, conversions: 2, avgPrice: 54000, status: "ended" },
  { id: "PS-330", product: "5/3/1 BBB · 12 weeks", slot: "category_feature", cost: 9999, from: "18 Apr", to: "25 Apr",
    impressions: 22_100, clicks: 1_180, conversions: 41, avgPrice: 3900, status: "ended" },
];

const CREATOR_PRODUCTS = [
  { id: "CP-1", title: "5/3/1 BBB · 12 weeks", type: "training_program", price: 3900, status: "live",
    views: 18_400, purchases: 312, rating: 4.8, reviews: 118, revenue: 973_440, updated: "14 Apr" },
  { id: "CP-2", title: "Training Periodization · 3 month", type: "session", price: 54000, status: "live",
    views: 4_200, purchases: 14, rating: 4.9, reviews: 12, revenue: 604_800, updated: "2 Mar" },
  { id: "CP-3", title: "Powerbuilding Bundle · Train + Eat", type: "bundle", price: 6900, status: "draft",
    views: 0, purchases: 0, rating: 0, reviews: 0, revenue: 0, updated: "16 May" },
];

const PENDING_REVIEWS = [
  { id: "R-882", product: "5/3/1 BBB · 12 weeks", by: "Anna F.", at: "2 days ago", rating: 3,
    title: "Good but the spreadsheet is confusing",
    body: "Programming is solid. The tracking sheet that comes with it took me a week to understand and I nearly gave up in week two." },
  { id: "R-879", product: "5/3/1 BBB · 12 weeks", by: "Erik L.", at: "5 days ago", rating: 5,
    title: "Ran it twice", body: "Second cycle now. Added 12.5 kg on squat across both." },
];

const REFUND_REQUESTS = [
  { id: "RF-44", order: "O-2419", product: "5/3/1 BBB · 12 weeks", by: "Jonas B.", at: "3 days ago",
    price: 3900, fee: 780, reason: "Not what I expected — wanted hypertrophy, this is strength",
    daysSince: 6, auto: true, prior: 0, status: "pending" },
  { id: "RF-41", order: "O-2402", product: "Training Periodization · 3 month", by: "Carla R.", at: "12 days ago",
    price: 54000, fee: 5400, reason: "Scheduling conflict, could not attend sessions",
    daysSince: 22, auto: false, prior: 1, status: "review" },
];

const dmoney = (c) => "€" + (c / 100).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function promoROI(p) {
  const revenue = p.conversions * p.avgPrice;
  const roi = p.cost > 0 ? (revenue - p.cost) / p.cost : 0;
  const ctr = p.impressions > 0 ? p.clicks / p.impressions : 0;
  const cvr = p.clicks > 0 ? p.conversions / p.clicks : 0;
  return { revenue, roi_pct: Math.round(roi * 100), ctr_pct: +(ctr * 100).toFixed(2), cvr_pct: +(cvr * 100).toFixed(1), profitable: roi > 0 };
}

// ══ Seller dashboard v2 ═══════════════════════════════
window.MarketSellerV2 = () => {
  const [sub, setSub] = useState("overview");
  const [modal, setModal] = useState(null);
  return (
    <>
      <div style={{padding: 13, background: "color-mix(in srgb, var(--acc-mkt) 5%, var(--surface))", border: "1px solid color-mix(in srgb, var(--acc-mkt) 22%, var(--border))", borderRadius: 8, marginBottom: 14, display: "flex", alignItems: "center", gap: 12}}>
        <div style={{width: 40, height: 40, borderRadius: 9, background: "var(--acc-mkt)", color: "var(--bg)", display: "grid", placeItems: "center", fontWeight: 600, fontSize: 14}}>TM</div>
        <div style={{flex: 1}}>
          <div style={{display: "flex", alignItems: "center", gap: 8, marginBottom: 2}}>
            <span style={{fontSize: 14, fontWeight: 600}}>Tom Müller</span>
            <Pill variant="pos">✓ Verified creator</Pill>
            <Pill>80% revenue share</Pill>
          </div>
          <div className="muted" style={{fontSize: 11.5}}>Creator since March 2024 · 326 sales · {dmoney(1_578_240)} lifetime · 4.8 ★ across 130 reviews</div>
        </div>
        <button className="btn" onClick={() => setModal("onboarding")}><Icon name="shield" className="ic ic-sm"/>Verification</button>
      </div>

      <div style={{display: "flex", gap: 8, marginBottom: 14, alignItems: "center", flexWrap: "wrap"}}>
        <div style={{display: "flex", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, padding: 2, gap: 1}}>
          {[["overview","Overview"],["products","Products"],["promotions","Promotions"],["reviews","Reviews"],["refunds","Refunds"]].map(([k, l]) => (
            <button key={k} onClick={() => setSub(k)} className={sub === k ? "btn btn-primary" : "btn btn-ghost"} style={{height: 22, fontSize: 11, padding: "0 10px", borderRadius: 4}}>{l}</button>
          ))}
        </div>
        <div className="spacer"/>
        <button className="btn" onClick={() => setModal("bundle")}><Icon name="layers" className="ic ic-sm"/>Bundle builder</button>
        <button className="btn btn-primary" onClick={() => setModal("product")}><Icon name="plus" className="ic ic-sm"/>New product</button>
      </div>

      {sub === "overview"   && <SellerOverview/>}
      {sub === "products"   && <SellerProducts onNew={() => setModal("product")}/>}
      {sub === "promotions" && <SellerPromotions onBuy={() => setModal("boost")}/>}
      {sub === "reviews"    && <SellerReviews/>}
      {sub === "refunds"    && <SellerRefunds/>}

      {modal === "product"    && <ProductBuilderModal onClose={() => setModal(null)}/>}
      {modal === "bundle"     && <BundleBuilderModal onClose={() => setModal(null)}/>}
      {modal === "boost"      && <BoostModal onClose={() => setModal(null)}/>}
      {modal === "onboarding" && <CreatorOnboardingModal onClose={() => setModal(null)}/>}
    </>
  );
};

const SellerOverview = () => (
  <div className="grid" style={{gridTemplateColumns: "1.5fr 1fr", gap: 14}}>
    <div className="col-gap" style={{gap: 14}}>
      <div className="grid g-cols-4" style={{gap: 10}}>
        {[
          ["Revenue · 30d", dmoney(242_000), "+18% vs prior"],
          ["Units sold", "62", "Plans + sessions"],
          ["Platform fee", dmoney(36_300), "15% blended"],
          ["Net · 30d", dmoney(205_700), "after fees"],
        ].map(([l, v, s]) => (
          <Card key={l} className="card-tight" style={{padding: 13}}>
            <div className="eyebrow" style={{marginBottom: 4}}>{l}</div>
            <div className="num" style={{fontSize: 19, fontWeight: 500}}>{v}</div>
            <div className="dim" style={{fontSize: 10.5}}>{s}</div>
          </Card>
        ))}
      </div>
      <Card title="Sales · last 12 months" sub="revenue and unit count">
        <LineChart h={190} range={[0, 320]}
          xLabels={["Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar","Apr","May"]}
          series={[
            { data: [96, 118, 142, 138, 164, 178, 152, 186, 204, 228, 242, 262], color: "var(--acc-mkt)" },
            { data: [22, 28, 34, 31, 39, 44, 36, 46, 51, 57, 58, 62], color: "var(--acc-goals)" },
          ]}/>
        <div style={{display: "flex", gap: 16, marginTop: 8, fontSize: 11, color: "var(--fg-muted)"}}>
          <span className="row-gap"><span className="dot" style={{background: "var(--acc-mkt)"}}/>Revenue (€ ×10)</span>
          <span className="row-gap"><span className="dot" style={{background: "var(--acc-goals)"}}/>Units</span>
        </div>
      </Card>
      <Card title="Product performance" sub="views → purchase conversion">
        <table className="tbl">
          <thead><tr><th>Product</th><th style={{width: 80, textAlign: "right"}}>Views</th><th style={{width: 80, textAlign: "right"}}>Sales</th><th style={{width: 90, textAlign: "right"}}>Conversion</th><th style={{width: 100, textAlign: "right"}}>Revenue</th></tr></thead>
          <tbody>
            {CREATOR_PRODUCTS.filter(p => p.status === "live").map(p => (
              <tr key={p.id}>
                <td style={{fontSize: 12}}>{p.title}</td>
                <td className="num muted" style={{textAlign: "right"}}>{p.views.toLocaleString()}</td>
                <td className="num" style={{textAlign: "right"}}>{p.purchases}</td>
                <td className="num" style={{textAlign: "right", color: (p.purchases / p.views) > 0.01 ? "var(--pos)" : "var(--fg)"}}>{((p.purchases / p.views) * 100).toFixed(2)}%</td>
                <td className="num" style={{textAlign: "right"}}>{dmoney(p.revenue)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
    <div className="col-gap" style={{gap: 14}}>
      <Card title="Payout" sub="revenue balance">
        <div className="num" style={{fontSize: 26, fontWeight: 500, marginBottom: 4}}>{dmoney(84_050)}</div>
        <div className="muted" style={{fontSize: 11.5, marginBottom: 12}}>Available to withdraw via Stripe Connect</div>
        <button className="btn btn-primary" style={{width: "100%"}}><Icon name="download" className="ic ic-sm"/>Request payout</button>
        <div className="divider"/>
        <Row label="Last payout" value={dmoney(50_000) + " · 8 May"}/>
        <Row label="Pending clearance" value={dmoney(3_900)}/>
        <Row label="Lifetime paid out" value={dmoney(1_494_190)}/>
      </Card>
      <Card title="Needs attention">
        {[
          { l: "2 reviews awaiting response", d: "one at 3 stars", to: "reviews" },
          { l: "1 refund auto-approves in 4h", d: "RF-44 · within 14-day window", to: "refunds" },
          { l: "Weekly boost ends tomorrow", d: "PS-341 · ROI +40%", to: "promotions" },
          { l: "Bundle draft unpublished", d: "Powerbuilding Bundle · 3 days old", to: "products" },
        ].map((x, i) => (
          <div key={i} style={{padding: "9px 0", borderBottom: i < 3 ? "1px solid var(--border)" : "none"}}>
            <div style={{fontSize: 12, fontWeight: 500, marginBottom: 2}}>{x.l}</div>
            <div className="dim" style={{fontSize: 10.5}}>{x.d}</div>
          </div>
        ))}
      </Card>
    </div>
  </div>
);

const SellerProducts = ({ onNew }) => (
  <Card title="Your products" sub={`${CREATOR_PRODUCTS.length} · 2 live, 1 draft`} actions={<button className="btn btn-sm" onClick={onNew}><Icon name="plus" className="ic ic-sm"/>New</button>}>
    <table className="tbl">
      <thead><tr><th>Product</th><th style={{width: 130}}>Type</th><th style={{width: 90, textAlign: "right"}}>Price</th><th style={{width: 80}}>Status</th><th style={{width: 80, textAlign: "right"}}>Sales</th><th style={{width: 80, textAlign: "right"}}>Rating</th><th style={{width: 90}}>Updated</th><th style={{width: 90, textAlign: "right"}}></th></tr></thead>
      <tbody>
        {CREATOR_PRODUCTS.map(p => {
          const m = (window.PRODUCT_TYPES || []).find(t => t.t === p.type) || { l: p.type };
          return (
            <tr key={p.id}>
              <td style={{fontSize: 12.5, fontWeight: 500}}>{p.title}</td>
              <td><Pill>{m.l}</Pill></td>
              <td className="num" style={{textAlign: "right"}}>{dmoney(p.price)}</td>
              <td>{p.status === "live" ? <Pill variant="pos">live</Pill> : <Pill variant="warn">draft</Pill>}</td>
              <td className="num" style={{textAlign: "right"}}>{p.purchases || "—"}</td>
              <td className="num" style={{textAlign: "right"}}>{p.rating ? p.rating + " ★" : "—"}</td>
              <td className="num muted">{p.updated}</td>
              <td style={{textAlign: "right"}}><button className="btn btn-sm btn-ghost">Edit</button></td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </Card>
);

const SellerPromotions = ({ onBuy }) => (
  <div className="col-gap" style={{gap: 14}}>
    <Card title="Buy a boost slot" sub="paid from revenue balance" actions={<button className="btn btn-sm btn-primary" onClick={onBuy}>Buy slot</button>}>
      <div className="grid g-cols-4" style={{gap: 10}}>
        {PROMO_SLOTS.map(s => (
          <div key={s.t} onClick={onBuy} style={{padding: 13, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 7, cursor: "pointer"}}>
            <div style={{fontSize: 12.5, fontWeight: 600, marginBottom: 3}}>{s.l}</div>
            <div className="num" style={{fontSize: 17, fontWeight: 600, marginBottom: 6}}>{dmoney(s.price)}</div>
            <div className="dim" style={{fontSize: 10.5, lineHeight: 1.45}}>{s.dur}<br/>{s.place}</div>
          </div>
        ))}
      </div>
    </Card>
    <Card title="Slot performance" sub="ROI computed from conversions × average price">
      <table className="tbl">
        <thead><tr><th style={{width: 80}}>ID</th><th>Product · slot</th><th style={{width: 90, textAlign: "right"}}>Impressions</th><th style={{width: 70, textAlign: "right"}}>Clicks</th><th style={{width: 70, textAlign: "right"}}>CTR</th><th style={{width: 80, textAlign: "right"}}>Conv.</th><th style={{width: 70, textAlign: "right"}}>CVR</th><th style={{width: 90, textAlign: "right"}}>Cost</th><th style={{width: 100, textAlign: "right"}}>Revenue</th><th style={{width: 80, textAlign: "right"}}>ROI</th></tr></thead>
        <tbody>
          {ACTIVE_PROMOS.map(p => {
            const r = promoROI(p);
            return (
              <tr key={p.id}>
                <td className="num">{p.id}</td>
                <td>
                  <div style={{fontSize: 12}}>{p.product}</div>
                  <div className="dim mono" style={{fontSize: 10}}>{p.slot} · {p.from}–{p.to} {p.status === "active" && <Pill variant="pos" style={{marginLeft: 4}}>active</Pill>}</div>
                </td>
                <td className="num muted" style={{textAlign: "right"}}>{p.impressions.toLocaleString()}</td>
                <td className="num muted" style={{textAlign: "right"}}>{p.clicks}</td>
                <td className="num" style={{textAlign: "right"}}>{r.ctr_pct}%</td>
                <td className="num" style={{textAlign: "right"}}>{p.conversions}</td>
                <td className="num" style={{textAlign: "right"}}>{r.cvr_pct}%</td>
                <td className="num muted" style={{textAlign: "right"}}>{dmoney(p.cost)}</td>
                <td className="num" style={{textAlign: "right"}}>{dmoney(r.revenue)}</td>
                <td className="num" style={{textAlign: "right", color: r.profitable ? "var(--pos)" : "var(--neg)", fontWeight: 600}}>{r.roi_pct > 0 ? "+" : ""}{r.roi_pct}%</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="mono" style={{fontSize: 11, padding: 11, background: "var(--surface-2)", borderRadius: 6, lineHeight: 1.7, color: "var(--fg-muted)", marginTop: 12}}>
        revenue = conversions × avg_product_price · roi = (revenue − cost) / cost<br/>
        ctr = clicks / impressions · conversion_rate = conversions / clicks
      </div>
    </Card>
  </div>
);

const SellerReviews = () => (
  <div className="col-gap" style={{gap: 12}}>
    <div style={{padding: 12, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 7, fontSize: 11.5, color: "var(--fg-muted)", lineHeight: 1.55}}>
      Responses appear publicly under the review. You cannot edit or remove a review — only reply once.
    </div>
    {PENDING_REVIEWS.map(r => (
      <Card key={r.id}>
        <div style={{display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap"}}>
          <span className="mono dim" style={{fontSize: 10.5}}>{r.id}</span>
          <span style={{fontSize: 12.5, fontWeight: 600}}>{r.by}</span>
          <Pill variant="pos">verified purchase</Pill>
          <span className="num" style={{fontSize: 11, color: r.rating >= 4 ? "var(--acc-goals)" : "var(--warn)"}}>{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</span>
          <span className="dim mono" style={{marginLeft: "auto", fontSize: 10}}>{r.product} · {r.at}</span>
        </div>
        <div style={{fontSize: 13, fontWeight: 600, marginBottom: 4}}>{r.title}</div>
        <div className="muted" style={{fontSize: 12, lineHeight: 1.55, marginBottom: 12}}>{r.body}</div>
        <div className="eyebrow" style={{marginBottom: 6}}>Your response</div>
        <textarea placeholder="Reply publicly…" style={{width: "100%", minHeight: 64, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, padding: 10, fontSize: 12, fontFamily: "var(--font-sans)", resize: "vertical", outline: "none"}}/>
        <div style={{display: "flex", gap: 6, marginTop: 8}}>
          <button className="btn btn-primary btn-sm">Post response</button>
          <button className="btn btn-ghost btn-sm">Report review</button>
        </div>
      </Card>
    ))}
  </div>
);

const SellerRefunds = () => (
  <div className="col-gap" style={{gap: 12}}>
    <Card className="card-tight" style={{padding: 13, background: "color-mix(in srgb, var(--acc-recov) 5%, var(--surface))", border: "1px solid color-mix(in srgb, var(--acc-recov) 22%, var(--border))"}}>
      <div className="eyebrow" style={{marginBottom: 7, color: "var(--acc-recov)"}}>Refund policy</div>
      <div className="col-gap" style={{gap: 4, fontSize: 11.5, color: "var(--fg-muted)"}}>
        <div>Fourteen-day window for digital products · refunded as wallet voucher, never cash</div>
        <div>Automatic approval when the purchase is under 14 days old and the buyer has no prior refunds</div>
        <div>Manual review otherwise · your revenue and the platform fee are both reversed</div>
      </div>
    </Card>
    {REFUND_REQUESTS.map(r => (
      <Card key={r.id}>
        <div style={{display: "flex", alignItems: "center", gap: 8, marginBottom: 8, flexWrap: "wrap"}}>
          <span className="mono dim" style={{fontSize: 10.5}}>{r.id}</span>
          <span style={{fontSize: 12.5, fontWeight: 600}}>{r.product}</span>
          {r.auto ? <Pill variant="warn">auto-approves</Pill> : <Pill>manual review</Pill>}
          <span className="dim mono" style={{marginLeft: "auto", fontSize: 10}}>{r.by} · order {r.order} · {r.at}</span>
        </div>
        <div className="muted" style={{fontSize: 12, lineHeight: 1.5, marginBottom: 12, fontStyle: "italic"}}>&ldquo;{r.reason}&rdquo;</div>
        <div className="grid g-cols-4" style={{gap: 10, marginBottom: 12}}>
          {[
            ["Days since purchase", r.daysSince + " days"],
            ["Prior refunds", r.prior === 0 ? "none" : r.prior + " on record"],
            ["Your revenue reversal", "− " + dmoney(r.price - r.fee)],
            ["Fee returned to you", "+ " + dmoney(r.fee) + " (platform)"],
          ].map(([l, v]) => (
            <div key={l} style={{padding: 10, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6}}>
              <div className="eyebrow" style={{marginBottom: 3}}>{l}</div>
              <div className="num" style={{fontSize: 12}}>{v}</div>
            </div>
          ))}
        </div>
        <div style={{display: "flex", gap: 6}}>
          <button className="btn btn-sm">Approve refund</button>
          <button className="btn btn-sm btn-ghost">Contest · open dispute</button>
          <button className="btn btn-sm btn-ghost">Message buyer</button>
        </div>
      </Card>
    ))}
  </div>
);

// ══ Modals ════════════════════════════════════════════
const DModal = ({ title, sub, icon, accent, onClose, footer, children, width = 640 }) => (
  <div className="modal-veil" onClick={onClose}>
    <div className="modal" style={{width, maxHeight: "92vh"}} onClick={e => e.stopPropagation()}>
      <div className="modal-h">
        <div style={{width: 26, height: 26, borderRadius: 6, background: `color-mix(in srgb, ${accent || "var(--acc-mkt)"} 18%, transparent)`, border: `1px solid color-mix(in srgb, ${accent || "var(--acc-mkt)"} 35%, transparent)`, color: accent || "var(--acc-mkt)", display: "grid", placeItems: "center"}}>
          <Icon name={icon} className="ic"/>
        </div>
        <div style={{flex: 1}}>
          <div style={{fontSize: 14, fontWeight: 600}}>{title}</div>
          {sub && <div className="dim" style={{fontSize: 11}}>{sub}</div>}
        </div>
        <button className="icon-btn" onClick={onClose}><Icon name="x" className="ic"/></button>
      </div>
      <div className="modal-body" style={{overflowY: "auto"}}>{children}</div>
      {footer && <div className="modal-f">{footer}</div>}
    </div>
  </div>
);

const CreatorOnboardingModal = ({ onClose }) => {
  const [step, setStep] = useState(3);
  const steps = [
    { n: 1, t: "Profile", d: "Type, name, bio, avatar, certifications, specialisations", done: true },
    { n: 2, t: "Identity verification", d: "Basic: email and social link · Verified: ID upload and credential proof", done: true },
    { n: 3, t: "Stripe Connect", d: "Bank connection for payouts", done: true },
    { n: 4, t: "First product", d: "Optional — you can publish later", done: false },
  ];
  return (
    <DModal title="Creator onboarding" sub="4 steps · verification takes 24–48 hours" icon="user" onClose={onClose}
      footer={<><button className="btn btn-ghost" onClick={onClose}>Close</button><button className="btn btn-primary">Continue setup</button></>}>
      <div className="col-gap" style={{gap: 7, marginBottom: 16}}>
        {steps.map(s => (
          <div key={s.n} onClick={() => setStep(s.n)} style={{
            display: "flex", gap: 12, alignItems: "flex-start", padding: 12, borderRadius: 7, cursor: "pointer",
            background: step === s.n ? "color-mix(in srgb, var(--acc-mkt) 8%, var(--surface))" : "var(--surface)",
            border: `1px solid ${step === s.n ? "color-mix(in srgb, var(--acc-mkt) 32%, var(--border))" : "var(--border)"}`,
          }}>
            <div style={{width: 24, height: 24, borderRadius: 999, display: "grid", placeItems: "center", flexShrink: 0,
              background: s.done ? "var(--pos)" : "var(--surface-2)", color: s.done ? "var(--bg)" : "var(--fg-muted)", fontSize: 11, fontWeight: 600}}>
              {s.done ? <Icon name="check" className="ic" style={{width: 12, height: 12, strokeWidth: 3}}/> : s.n}
            </div>
            <div style={{flex: 1}}>
              <div style={{fontSize: 12.5, fontWeight: 600, marginBottom: 2}}>{s.t}</div>
              <div className="muted" style={{fontSize: 11}}>{s.d}</div>
            </div>
            {s.done && <Pill variant="pos">complete</Pill>}
          </div>
        ))}
      </div>
      <div style={{padding: 13, background: "color-mix(in srgb, var(--pos) 6%, var(--surface))", border: "1px solid color-mix(in srgb, var(--pos) 24%, var(--border))", borderRadius: 7, marginBottom: 14}}>
        <div style={{display: "flex", alignItems: "center", gap: 8, marginBottom: 5}}>
          <Icon name="shield" className="ic ic-sm" style={{color: "var(--pos)"}}/>
          <span style={{fontSize: 12.5, fontWeight: 600, color: "var(--pos)"}}>Verified · approved 14 March 2024</span>
        </div>
        <div className="muted" style={{fontSize: 11.5, lineHeight: 1.5}}>ID confirmed, NSCA credential validated. You publish without manual review and keep 80% of net revenue.</div>
      </div>
      <div className="eyebrow" style={{marginBottom: 7}}>Verification levels</div>
      <table className="tbl">
        <thead><tr><th>Level</th><th>Requirement</th><th style={{width: 110}}>Review</th><th style={{width: 90, textAlign: "right"}}>Share</th></tr></thead>
        <tbody>
          <tr><td>Basic</td><td className="muted" style={{fontSize: 11.5}}>Email + social link</td><td className="muted">manual</td><td className="num right">75%</td></tr>
          <tr style={{background: "color-mix(in srgb, var(--pos) 5%, transparent)"}}><td>Verified <Pill variant="pos" style={{marginLeft: 5}}>you</Pill></td><td className="muted" style={{fontSize: 11.5}}>ID + credential proof</td><td className="muted">auto-publish</td><td className="num right">80%</td></tr>
          <tr><td>Premium</td><td className="muted" style={{fontSize: 11.5}}>Audited track record, 500+ sales</td><td className="muted">auto + priority</td><td className="num right">85%</td></tr>
        </tbody>
      </table>
    </DModal>
  );
};

const ProductBuilderModal = ({ onClose }) => {
  const [step, setStep] = useState(1);
  const [type, setType] = useState("training_program");
  const [price, setPrice] = useState(3900);
  const fee = (window.calcFee ? window.calcFee(price, type, "discovery", false) : { rate: 0.2, fee: Math.round(price * 0.2) });
  const net = price - fee.fee;
  const creator = Math.round(net * 0.8);

  return (
    <DModal title="New product" sub={`Step ${step} of 4`} icon="plus" onClose={onClose} width={700}
      footer={<>
        {step > 1 && <button className="btn btn-ghost" onClick={() => setStep(s => s - 1)}>Back</button>}
        <div className="spacer"/>
        <button className="btn btn-ghost" onClick={onClose}>Save draft</button>
        {step < 4
          ? <button className="btn btn-primary" onClick={() => setStep(s => s + 1)}>Continue →</button>
          : <button className="btn btn-primary" onClick={onClose}>Publish</button>}
      </>}>
      <div style={{display: "flex", gap: 3, marginBottom: 18}}>
        {[1,2,3,4].map(n => <div key={n} style={{flex: 1, height: 4, borderRadius: 999, background: n <= step ? "var(--acc-mkt)" : "var(--surface-2)"}}/>)}
      </div>

      {step === 1 && (
        <>
          <div className="eyebrow" style={{marginBottom: 8}}>Product type</div>
          <div style={{display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 14}}>
            {(window.PRODUCT_TYPES || []).map(t => (
              <button key={t.t} onClick={() => setType(t.t)} style={{
                padding: "12px 10px", borderRadius: 7, cursor: "pointer", textAlign: "left",
                background: type === t.t ? "color-mix(in srgb, var(--acc-mkt) 10%, var(--surface))" : "var(--surface)",
                border: `1px solid ${type === t.t ? "color-mix(in srgb, var(--acc-mkt) 35%, var(--border))" : "var(--border)"}`,
              }}>
                <Icon name={t.icon} className="ic" style={{color: type === t.t ? "var(--acc-mkt)" : "var(--fg-muted)", marginBottom: 6}}/>
                <div style={{fontSize: 12, fontWeight: type === t.t ? 600 : 500}}>{t.l}</div>
                <div className="dim mono" style={{fontSize: 9.5, marginTop: 3}}>{t.fee} fee tier</div>
              </button>
            ))}
          </div>
          <div style={{padding: 11, background: "var(--surface)", borderRadius: 6, fontSize: 11.5, color: "var(--fg-muted)", lineHeight: 1.5}}>
            Content lands in the buyer's module through <span className="mono">{(window.PRODUCT_TYPES || []).find(t => t.t === type)?.api}</span> — no files, no PDFs.
          </div>
        </>
      )}

      {step === 2 && (
        <>
          <div className="eyebrow" style={{marginBottom: 8}}>Source the content</div>
          <div className="col-gap" style={{gap: 7, marginBottom: 14}}>
            {[
              { l: "Pick from my routines", d: "Choose one of your 6 existing training routines", on: true },
              { l: "Build new in the editor", d: "Opens the Training module editor in a new tab", on: false },
              { l: "Import from a client plan", d: "Clone a plan you already assigned to an athlete", on: false },
            ].map(o => (
              <div key={o.l} style={{display: "flex", gap: 11, alignItems: "center", padding: 12, borderRadius: 7, cursor: "pointer",
                background: o.on ? "color-mix(in srgb, var(--acc-mkt) 9%, var(--surface))" : "var(--surface)",
                border: `1px solid ${o.on ? "color-mix(in srgb, var(--acc-mkt) 32%, var(--border))" : "var(--border)"}`}}>
                <div style={{width: 14, height: 14, borderRadius: 999, border: `2px solid ${o.on ? "var(--acc-mkt)" : "var(--border-strong)"}`, background: o.on ? "var(--acc-mkt)" : "transparent", flexShrink: 0}}/>
                <div><div style={{fontSize: 12.5, fontWeight: o.on ? 600 : 500}}>{o.l}</div><div className="muted" style={{fontSize: 11}}>{o.d}</div></div>
              </div>
            ))}
          </div>
          <div className="eyebrow" style={{marginBottom: 6}}>Selected routine</div>
          <div style={{padding: 12, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 7, display: "flex", alignItems: "center", gap: 11}}>
            <Icon name="training" className="ic" style={{color: "var(--acc-train)"}}/>
            <div style={{flex: 1}}><div style={{fontSize: 12.5, fontWeight: 600}}>5/3/1 BBB · 12 weeks</div><div className="muted" style={{fontSize: 11}}>4 days/week · 12 weeks · barbell required</div></div>
            <button className="btn btn-sm btn-ghost">Change</button>
          </div>
        </>
      )}

      {step === 3 && (
        <>
          <div style={{display: "grid", gridTemplateColumns: "2fr 1fr", gap: 12, marginBottom: 12}}>
            <div><div className="eyebrow" style={{marginBottom: 4}}>Title</div><input defaultValue="5/3/1 BBB · 12 weeks" style={{width: "100%", height: 32, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, padding: "0 10px", fontSize: 12}}/></div>
            <div><div className="eyebrow" style={{marginBottom: 4}}>Price</div>
              <div style={{position: "relative"}}>
                <input type="number" value={price / 100} onChange={e => setPrice(Math.round(+e.target.value * 100))} style={{width: "100%", height: 32, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, padding: "0 34px 0 10px", fontSize: 12, fontFamily: "var(--font-mono)"}}/>
                <span className="dim mono" style={{position: "absolute", right: 11, top: "50%", transform: "translateY(-50%)", fontSize: 11}}>EUR</span>
              </div>
            </div>
          </div>
          <div style={{marginBottom: 12}}><div className="eyebrow" style={{marginBottom: 4}}>Short description</div><input defaultValue="Wendler 5/3/1 with boring-but-big volume. Four days a week, twelve weeks." style={{width: "100%", height: 32, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, padding: "0 10px", fontSize: 12}}/></div>
          <div style={{display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 12}}>
            <div><div className="eyebrow" style={{marginBottom: 4}}>Difficulty</div><select defaultValue="intermediate" style={{width: "100%", height: 32, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, padding: "0 10px", fontSize: 12}}><option>beginner</option><option>intermediate</option><option>advanced</option></select></div>
            <div><div className="eyebrow" style={{marginBottom: 4}}>Duration</div><input defaultValue="12" style={{width: "100%", height: 32, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, padding: "0 10px", fontSize: 12}}/></div>
            <div><div className="eyebrow" style={{marginBottom: 4}}>Compare-at price</div><input placeholder="optional" style={{width: "100%", height: 32, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, padding: "0 10px", fontSize: 12}}/></div>
          </div>
          <div className="eyebrow" style={{marginBottom: 6}}>Goal alignments · drives search ranking</div>
          <div style={{display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 14}}>
            {["muscle_gain","strength","performance","fat_loss","body_composition","health","general"].map((g, i) => (
              <button key={g} className={i < 2 ? "pill pill-acc" : "pill"} style={{cursor: "pointer", padding: "4px 11px", fontSize: 11}}>{g}</button>
            ))}
          </div>
          <div style={{padding: 12, background: "color-mix(in srgb, var(--pos) 6%, var(--surface))", border: "1px solid color-mix(in srgb, var(--pos) 22%, var(--border))", borderRadius: 7}}>
            <div className="eyebrow" style={{marginBottom: 7, color: "var(--pos)"}}>Your take on each sale</div>
            <div className="col-gap" style={{gap: 0}}>
              <Row label="Buyer pays" value={dmoney(price)}/>
              <Row label={`Platform fee · ${(fee.rate * 100).toFixed(0)}% discovery`} value={"− " + dmoney(fee.fee)}/>
              <Row label="Your share · 80% of net" value={dmoney(creator)}/>
            </div>
          </div>
        </>
      )}

      {step === 4 && (
        <>
          <div className="eyebrow" style={{marginBottom: 8}}>Buyer preview</div>
          <Card className="card-tight" style={{padding: 14, marginBottom: 14}}>
            <div style={{display: "flex", gap: 13}}>
              <div className="placeholder-img" style={{width: 96, height: 96, borderRadius: 8, flexShrink: 0}}>
                <Icon name="training" className="ic" style={{color: "var(--fg-dim)"}}/>
              </div>
              <div style={{flex: 1}}>
                <div style={{display: "flex", gap: 5, marginBottom: 5}}><Pill>Training program</Pill><Pill>intermediate</Pill></div>
                <div style={{fontSize: 14, fontWeight: 600, marginBottom: 4}}>5/3/1 BBB · 12 weeks</div>
                <div className="muted" style={{fontSize: 11.5, lineHeight: 1.5, marginBottom: 8}}>Wendler 5/3/1 with boring-but-big volume. Four days a week, twelve weeks.</div>
                <div style={{display: "flex", alignItems: "baseline", gap: 10}}>
                  <span className="num" style={{fontSize: 16, fontWeight: 600}}>{dmoney(price)}</span>
                  <span className="dim" style={{fontSize: 10.5}}>Tom Müller ✓ · new listing</span>
                </div>
              </div>
            </div>
          </Card>
          <div className="col-gap" style={{gap: 6}}>
            {[
              ["Content delivery", "POST /api/training/routines on purchase"],
              ["Licence type", "lifetime · no expiry"],
              ["Review gate", "verified purchases only"],
              ["Publishing", "auto-publish · verified creator"],
              ["Refund window", "14 days · voucher credit"],
            ].map(([l, v]) => <Row key={l} label={l} value={v}/>)}
          </div>
        </>
      )}
    </DModal>
  );
};

const BundleBuilderModal = ({ onClose }) => {
  const [picked, setPicked] = useState(["CP-1"]);
  const own = CREATOR_PRODUCTS.filter(p => p.type !== "bundle");
  const partner = [
    { id: "X-1", title: "Cut · 8 Weeks Meal Plan", by: "Jana Bauer", price: 4900, type: "meal_plan" },
    { id: "X-2", title: "Evidence Stack · Foundation", by: "David Park", price: 1900, type: "supplement_protocol" },
  ];
  const all = [...own.map(p => ({ id: p.id, title: p.title, by: "You", price: p.price, type: p.type })), ...partner];
  const sel = all.filter(p => picked.includes(p.id));
  const total = sel.reduce((s, p) => s + p.price, 0);
  const [bundlePrice, setBundlePrice] = useState(6900);
  const savings = total - bundlePrice;
  const pct = total > 0 ? Math.round((savings / total) * 100) : 0;

  return (
    <DModal title="Bundle builder" sub="combine your products, optionally with partners" icon="layers" onClose={onClose} width={700}
      footer={<><button className="btn btn-ghost" onClick={onClose}>Cancel</button><button className="btn btn-ghost">Save draft</button><button className="btn btn-primary" disabled={sel.length < 2}>Create bundle</button></>}>
      <div className="eyebrow" style={{marginBottom: 8}}>Components · pick at least two</div>
      <div className="col-gap" style={{gap: 6, marginBottom: 16}}>
        {all.map(p => {
          const on = picked.includes(p.id);
          const m = (window.PRODUCT_TYPES || []).find(t => t.t === p.type) || { l: p.type, icon: "marketplace" };
          return (
            <div key={p.id} onClick={() => setPicked(x => on ? x.filter(i => i !== p.id) : [...x, p.id])} style={{
              display: "flex", gap: 11, alignItems: "center", padding: 11, borderRadius: 7, cursor: "pointer",
              background: on ? "color-mix(in srgb, var(--acc-mkt) 9%, var(--surface))" : "var(--surface)",
              border: `1px solid ${on ? "color-mix(in srgb, var(--acc-mkt) 32%, var(--border))" : "var(--border)"}`,
            }}>
              <div style={{width: 15, height: 15, borderRadius: 4, display: "grid", placeItems: "center", flexShrink: 0,
                background: on ? "var(--acc-mkt)" : "transparent", border: `1px solid ${on ? "var(--acc-mkt)" : "var(--border-strong)"}`}}>
                {on && <Icon name="check" className="ic" style={{width: 9, height: 9, color: "var(--bg)", strokeWidth: 3}}/>}
              </div>
              <Icon name={m.icon} className="ic ic-sm" style={{color: "var(--fg-muted)"}}/>
              <div style={{flex: 1}}>
                <div style={{fontSize: 12.5, fontWeight: on ? 600 : 500}}>{p.title}</div>
                <div className="dim" style={{fontSize: 10.5}}>{m.l} · {p.by}{p.by !== "You" && " · revenue split applies"}</div>
              </div>
              <span className="num" style={{fontSize: 12}}>{dmoney(p.price)}</span>
            </div>
          );
        })}
      </div>

      <div style={{display: "grid", gridTemplateColumns: "2fr 1fr", gap: 12, marginBottom: 14}}>
        <div><div className="eyebrow" style={{marginBottom: 4}}>Bundle title</div><input defaultValue="Powerbuilding Bundle · Train + Eat" style={{width: "100%", height: 32, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, padding: "0 10px", fontSize: 12}}/></div>
        <div><div className="eyebrow" style={{marginBottom: 4}}>Bundle price</div>
          <div style={{position: "relative"}}>
            <input type="number" value={bundlePrice / 100} onChange={e => setBundlePrice(Math.round(+e.target.value * 100))} style={{width: "100%", height: 32, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, padding: "0 34px 0 10px", fontSize: 12, fontFamily: "var(--font-mono)"}}/>
            <span className="dim mono" style={{position: "absolute", right: 11, top: "50%", transform: "translateY(-50%)", fontSize: 11}}>EUR</span>
          </div>
        </div>
      </div>

      {sel.length >= 2 ? (
        <div style={{padding: 13, background: savings > 0 ? "color-mix(in srgb, var(--pos) 6%, var(--surface))" : "color-mix(in srgb, var(--warn) 6%, var(--surface))", border: `1px solid ${savings > 0 ? "color-mix(in srgb, var(--pos) 24%, var(--border))" : "color-mix(in srgb, var(--warn) 24%, var(--border))"}`, borderRadius: 7}}>
          <div className="col-gap" style={{gap: 0, marginBottom: 10}}>
            <Row label="Individual total" value={dmoney(total)}/>
            <Row label="Bundle price" value={dmoney(bundlePrice)}/>
            <Row label="Buyer saves" value={savings > 0 ? dmoney(savings) + ` (${pct}%)` : "nothing — price is above component total"}/>
          </div>
          <div style={{display: "flex", height: 28, borderRadius: 6, overflow: "hidden", border: "1px solid var(--border)"}}>
            <div style={{flex: bundlePrice, background: "color-mix(in srgb, var(--acc-mkt) 26%, var(--surface))", display: "grid", placeItems: "center", fontSize: 10.5, fontFamily: "var(--font-mono)"}}>pays {dmoney(bundlePrice)}</div>
            {savings > 0 && <div style={{flex: savings, background: "color-mix(in srgb, var(--pos) 26%, var(--surface))", display: "grid", placeItems: "center", fontSize: 10.5, fontFamily: "var(--font-mono)"}}>saves {dmoney(savings)}</div>}
          </div>
        </div>
      ) : (
        <div style={{padding: 13, background: "var(--surface)", border: "1px dashed var(--border)", borderRadius: 7, textAlign: "center", fontSize: 11.5, color: "var(--fg-muted)"}}>
          Select at least two components to see the savings calculation.
        </div>
      )}
    </DModal>
  );
};

const BoostModal = ({ onClose }) => {
  const [slot, setSlot] = useState("weekly_boost");
  const [product, setProduct] = useState("CP-1");
  const s = PROMO_SLOTS.find(x => x.t === slot);
  const p = CREATOR_PRODUCTS.find(x => x.id === product);
  const est = { impressions: slot === "homepage" ? 42000 : slot === "category_feature" ? 22000 : slot === "weekly_boost" ? 8400 : 1200 };
  const estClicks = Math.round(est.impressions * 0.058);
  const estConv = Math.round(estClicks * 0.035);
  const estRev = estConv * (p?.price || 3900);
  const roi = Math.round(((estRev - s.price) / s.price) * 100);

  return (
    <DModal title="Buy a boost slot" sub="paid from revenue balance" icon="trend_up" accent="var(--acc-goals)" onClose={onClose}
      footer={<><button className="btn btn-ghost" onClick={onClose}>Cancel</button><button className="btn btn-primary">Pay {dmoney(s.price)} from revenue</button></>}>
      <div className="eyebrow" style={{marginBottom: 6}}>Product</div>
      <select value={product} onChange={e => setProduct(e.target.value)} style={{width: "100%", height: 32, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, padding: "0 10px", fontSize: 12, marginBottom: 14}}>
        {CREATOR_PRODUCTS.filter(x => x.status === "live").map(x => <option key={x.id} value={x.id}>{x.title} · {dmoney(x.price)}</option>)}
      </select>
      <div className="eyebrow" style={{marginBottom: 8}}>Slot</div>
      <div className="col-gap" style={{gap: 6, marginBottom: 14}}>
        {PROMO_SLOTS.map(x => (
          <div key={x.t} onClick={() => setSlot(x.t)} style={{
            display: "flex", gap: 11, alignItems: "center", padding: 12, borderRadius: 7, cursor: "pointer",
            background: slot === x.t ? "color-mix(in srgb, var(--acc-goals) 10%, var(--surface))" : "var(--surface)",
            border: `1px solid ${slot === x.t ? "color-mix(in srgb, var(--acc-goals) 34%, var(--border))" : "var(--border)"}`,
          }}>
            <div style={{width: 14, height: 14, borderRadius: 999, border: `2px solid ${slot === x.t ? "var(--acc-goals)" : "var(--border-strong)"}`, background: slot === x.t ? "var(--acc-goals)" : "transparent", flexShrink: 0}}/>
            <div style={{flex: 1}}>
              <div style={{fontSize: 12.5, fontWeight: slot === x.t ? 600 : 500}}>{x.l}</div>
              <div className="muted" style={{fontSize: 11}}>{x.dur} · {x.place}</div>
            </div>
            <span className="num" style={{fontSize: 13, fontWeight: 600}}>{dmoney(x.price)}</span>
          </div>
        ))}
      </div>
      <div className="eyebrow" style={{marginBottom: 7}}>Projection · based on your category averages</div>
      <div className="grid g-cols-4" style={{gap: 8, marginBottom: 12}}>
        {[
          ["Impressions", est.impressions.toLocaleString()],
          ["Clicks · 5.8% CTR", estClicks.toLocaleString()],
          ["Conversions · 3.5%", estConv],
          ["Revenue", dmoney(estRev)],
        ].map(([l, v]) => (
          <div key={l} style={{padding: 10, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6}}>
            <div className="eyebrow" style={{marginBottom: 3}}>{l}</div>
            <div className="num" style={{fontSize: 13}}>{v}</div>
          </div>
        ))}
      </div>
      <div style={{padding: 12, background: roi > 0 ? "color-mix(in srgb, var(--pos) 7%, var(--surface))" : "color-mix(in srgb, var(--warn) 7%, var(--surface))", border: `1px solid ${roi > 0 ? "color-mix(in srgb, var(--pos) 24%, var(--border))" : "color-mix(in srgb, var(--warn) 24%, var(--border))"}`, borderRadius: 7}}>
        <div style={{display: "flex", alignItems: "baseline", justifyContent: "space-between"}}>
          <span style={{fontSize: 12.5, fontWeight: 600, color: roi > 0 ? "var(--pos)" : "var(--warn)"}}>Projected ROI</span>
          <span className="num" style={{fontSize: 20, fontWeight: 600, color: roi > 0 ? "var(--pos)" : "var(--warn)"}}>{roi > 0 ? "+" : ""}{roi}%</span>
        </div>
        <div className="mono" style={{fontSize: 10.5, marginTop: 6, color: "var(--fg-muted)"}}>({dmoney(estRev)} − {dmoney(s.price)}) / {dmoney(s.price)}</div>
      </div>
    </DModal>
  );
};

Object.assign(window, { PROMO_SLOTS, ACTIVE_PROMOS, CREATOR_PRODUCTS, promoROI });
