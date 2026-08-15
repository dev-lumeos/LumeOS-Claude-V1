// Marketplace · Block F — Personalised discovery home + Orders/Refund flow v2
// per SPEC_03 F1/F7/F10, SPEC_10 (MarketplaceHome, RecommendationSection, FeaturedBanner)

const ORDERS_V2 = [
  { id: "O-2431", at: "15 May 2026", product: "5/3/1 BBB · 12 weeks", pid: "CP-1", seller: "you",
    total: 3900, fee: 780, net: 3120, method: "wallet_voucher", status: "completed", licence: "L-1150", refundable: true, daysSince: 1 },
  { id: "O-2419", at: "10 May 2026", product: "12-Week Lean Bulk Bundle", pid: "P-2201", seller: "Anders Lindqvist",
    total: 4900, fee: 980, net: 3920, method: "wallet_voucher", status: "completed", licence: "L-1141", refundable: true, daysSince: 6 },
  { id: "O-2402", at: "22 Mar 2026", product: "Cut · 8 Weeks Meal Plan", pid: "P-2174", seller: "Jana Bauer",
    total: 4900, fee: 980, net: 3920, method: "wallet_voucher", status: "completed", licence: "L-1128", refundable: false, daysSince: 55 },
  { id: "O-2388", at: "2 May 2026", product: "PPL Hypertrophy Pro", pid: "P-2188", seller: "Erik Lange",
    total: 2900, fee: 580, net: 2320, method: "wallet_voucher", status: "refunded", licence: "L-1102", refundable: false, daysSince: 14,
    refundedAt: "9 May 2026", refundReason: "Overlapped with the bundle I bought a week later" },
  { id: "O-2380", at: "8 Feb 2026", product: "Evidence Stack · Foundation", pid: "P-2160", seller: "David Park",
    total: 1900, fee: 380, net: 1520, method: "wallet_voucher", status: "completed", licence: "L-1119", refundable: false, daysSince: 97 },
];

const REFUND_REASONS = [
  "Not what the description promised",
  "Bought by mistake",
  "Duplicate of something I already own",
  "Content quality below expectation",
  "Cannot use it — equipment or schedule",
  "Other",
];

const omoney = (c) => "€" + (c / 100).toFixed(2);

// ══ Discovery home ════════════════════════════════════
window.MarketHome = () => {
  const [detail, setDetail] = useState(null);
  const catalog = window.CATALOG || [];
  const featured = catalog.find(p => p.promoted) || catalog[0];
  if (!featured) return null;

  const scored = window.calcSearchScore
    ? catalog.map(p => ({ p, s: window.calcSearchScore(p, "recomp", "body_composition", "intermediate") })).sort((a, b) => b.s.total - a.s.total)
    : catalog.map(p => ({ p, s: { total: 0, gm: 0 } }));

  const sections = [
    { t: "For your recomposition phase", d: "matched against your active goal and difficulty tier",
      items: scored.filter(x => x.s.gm >= 0.5).slice(0, 4).map(x => x.p) },
    { t: "Because you own the Lean Bulk Bundle", d: "creators and categories you already bought from",
      items: catalog.filter(p => ["P-2120", "P-2131", "P-2160"].includes(p.id)) },
    { t: "Trending this week", d: "highest purchase velocity in the last seven days",
      items: [...catalog].sort((a, b) => b.purchases - a.purchases).slice(0, 4) },
    { t: "New from verified creators", d: "published in the last 90 days",
      items: catalog.filter(p => p.created < 100) },
  ].filter(s => s.items.length > 0);

  const w = window.WALLET_STATE || { voucher_cents: 5250, revenue_cents: 84050 };

  return (
    <>
      {/* Featured banner */}
      <div style={{
        display: "flex", gap: 20, padding: 22, marginBottom: 18, borderRadius: 12, alignItems: "center",
        background: "linear-gradient(120deg, color-mix(in srgb, var(--acc-mkt) 14%, var(--surface)) 0%, var(--surface) 62%)",
        border: "1px solid color-mix(in srgb, var(--acc-mkt) 26%, var(--border))",
      }}>
        <div className="placeholder-img" style={{width: 168, height: 118, borderRadius: 9, flexShrink: 0}}>
          <Icon name="layers" className="ic" style={{width: 32, height: 32, color: "var(--fg-dim)"}}/>
        </div>
        <div style={{flex: 1, minWidth: 0}}>
          <div style={{display: "flex", alignItems: "center", gap: 7, marginBottom: 7}}>
            <Pill style={{color: "var(--acc-goals)", borderColor: "color-mix(in srgb, var(--acc-goals) 35%, var(--border))", background: "color-mix(in srgb, var(--acc-goals) 8%, transparent)"}}>Featured</Pill>
            <Pill variant="pos">saves {omoney(2800)}</Pill>
            <span className="dim" style={{fontSize: 10.5}}>{featured.rating}★ · {featured.reviews} reviews · {featured.purchases.toLocaleString()} sold</span>
          </div>
          <div style={{fontSize: 21, fontWeight: 600, letterSpacing: "-0.02em", marginBottom: 6}}>{featured.title}</div>
          <div className="muted" style={{fontSize: 12.5, lineHeight: 1.55, marginBottom: 12, maxWidth: 480}}>{featured.short}</div>
          <div style={{display: "flex", alignItems: "center", gap: 12}}>
            <span className="num" style={{fontSize: 20, fontWeight: 600}}>{omoney(featured.price)}</span>
            {featured.compare && <span className="num dim" style={{fontSize: 13, textDecoration: "line-through"}}>{omoney(featured.compare)}</span>}
            <button className="btn btn-primary" onClick={() => setDetail(featured)}>View bundle</button>
            <span className="dim" style={{fontSize: 11}}>Wallet {omoney(w.voucher_cents + w.revenue_cents)} · covered</span>
          </div>
        </div>
      </div>

      {/* Recommendation sections */}
      <div className="col-gap" style={{gap: 20}}>
        {sections.map(sec => (
          <div key={sec.t}>
            <div style={{display: "flex", alignItems: "baseline", gap: 10, marginBottom: 10}}>
              <span style={{fontSize: 14, fontWeight: 600, letterSpacing: "-0.01em"}}>{sec.t}</span>
              <span className="dim" style={{fontSize: 11}}>{sec.d}</span>
              <button className="btn btn-ghost btn-sm" style={{marginLeft: "auto"}}>See all →</button>
            </div>
            <div style={{display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 11}}>
              {sec.items.slice(0, 4).map(p => {
                const m = (window.PRODUCT_TYPES || []).find(t => t.t === p.type) || { l: p.type, icon: "marketplace" };
                return (
                  <Card key={p.id} onClick={() => setDetail(p)} className="card-tight" style={{padding: 11, cursor: "pointer"}}>
                    <div className="placeholder-img" style={{aspectRatio: "16/10", borderRadius: 6, marginBottom: 9, position: "relative"}}>
                      <Icon name={m.icon} className="ic" style={{width: 24, height: 24, color: "var(--fg-dim)"}}/>
                      {p.promoted && <div style={{position: "absolute", top: 5, right: 5, padding: "2px 7px", background: "var(--acc-goals)", color: "var(--bg)", fontSize: 8.5, fontWeight: 700, borderRadius: 3}}>PROMOTED</div>}
                    </div>
                    <div style={{fontSize: 12, fontWeight: 600, lineHeight: 1.3, marginBottom: 3, minHeight: 31}}>{p.title}</div>
                    <div className="dim" style={{fontSize: 10, marginBottom: 7}}>{p.creator.name} · {p.rating}★</div>
                    <div style={{display: "flex", alignItems: "baseline", justifyContent: "space-between"}}>
                      <span className="num" style={{fontSize: 14, fontWeight: 600}}>{omoney(p.price)}</span>
                      <Pill style={{fontSize: 9}}>{m.l}</Pill>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {detail && window.MarketProductDetail && <window.MarketProductDetail p={detail} onClose={() => setDetail(null)}/>}
    </>
  );
};

// ══ Orders v2 with refund flow ════════════════════════
window.MarketOrdersV2 = () => {
  const [refund, setRefund] = useState(null);
  const [detail, setDetail] = useState(null);
  return (
    <>
      <div className="grid g-cols-4" style={{gap: 10, marginBottom: 14}}>
        {[
          ["Orders · lifetime", ORDERS_V2.length],
          ["Spent · lifetime", omoney(ORDERS_V2.filter(o => o.status === "completed").reduce((s, o) => s + o.total, 0))],
          ["Refunded", omoney(ORDERS_V2.filter(o => o.status === "refunded").reduce((s, o) => s + o.total, 0))],
          ["Refundable now", ORDERS_V2.filter(o => o.refundable).length + " orders"],
        ].map(([l, v]) => (
          <Card key={l} className="card-tight" style={{padding: 13}}>
            <div className="eyebrow" style={{marginBottom: 4}}>{l}</div>
            <div className="num" style={{fontSize: 18, fontWeight: 500}}>{v}</div>
          </Card>
        ))}
      </div>

      <Card title="Order history" sub="fourteen-day refund window on digital products">
        <table className="tbl">
          <thead>
            <tr>
              <th style={{width: 90}}>Order</th>
              <th style={{width: 110}}>Date</th>
              <th>Product</th>
              <th style={{width: 130}}>Seller</th>
              <th style={{width: 90, textAlign: "right"}}>Total</th>
              <th style={{width: 120}}>Paid from</th>
              <th style={{width: 100}}>Status</th>
              <th style={{width: 130, textAlign: "right"}}></th>
            </tr>
          </thead>
          <tbody>
            {ORDERS_V2.map(o => (
              <tr key={o.id} className="clickable" style={{cursor: "pointer", opacity: o.status === "refunded" ? 0.65 : 1}} onClick={() => setDetail(o)}>
                <td className="num">{o.id}</td>
                <td className="num muted">{o.at}</td>
                <td style={{fontSize: 12}}>{o.product}</td>
                <td className="muted" style={{fontSize: 11.5}}>{o.seller}</td>
                <td className="num" style={{textAlign: "right"}}>{omoney(o.total)}</td>
                <td className="mono dim" style={{fontSize: 10.5}}>{o.method}</td>
                <td>{o.status === "completed" ? <Pill variant="pos">completed</Pill> : <Pill variant="block">refunded</Pill>}</td>
                <td style={{textAlign: "right"}}>
                  {o.refundable && <button className="btn btn-sm btn-ghost" onClick={e => { e.stopPropagation(); setRefund(o); }}>Request refund</button>}
                  {!o.refundable && o.status === "completed" && <span className="dim" style={{fontSize: 10.5}}>window closed</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {refund && <RefundRequestModal o={refund} onClose={() => setRefund(null)}/>}
      {detail && <OrderDetailModal o={detail} onClose={() => setDetail(null)} onRefund={() => { setRefund(detail); setDetail(null); }}/>}
    </>
  );
};

const OrderDetailModal = ({ o, onClose, onRefund }) => (
  <div className="modal-veil" onClick={onClose}>
    <div className="modal" style={{width: 580}} onClick={e => e.stopPropagation()}>
      <div className="modal-h">
        <div style={{width: 26, height: 26, borderRadius: 6, background: "color-mix(in srgb, var(--acc-mkt) 18%, transparent)", border: "1px solid color-mix(in srgb, var(--acc-mkt) 35%, transparent)", color: "var(--acc-mkt)", display: "grid", placeItems: "center"}}><Icon name="marketplace" className="ic"/></div>
        <div style={{flex: 1}}>
          <div style={{fontSize: 14, fontWeight: 600}}>{o.id}</div>
          <div className="dim" style={{fontSize: 11}}>{o.at} · {o.product}</div>
        </div>
        <button className="icon-btn" onClick={onClose}><Icon name="x" className="ic"/></button>
      </div>
      <div className="modal-body">
        <div className="eyebrow" style={{marginBottom: 8}}>Payment</div>
        <div className="col-gap" style={{gap: 0, marginBottom: 14}}>
          <Row label="Total paid" value={omoney(o.total)}/>
          <Row label="Payment method" value={o.method}/>
          <Row label="Platform fee" value={omoney(o.fee)}/>
          <Row label={"Credited to " + o.seller} value={omoney(o.net)}/>
        </div>
        <div className="eyebrow" style={{marginBottom: 8}}>Licence</div>
        <div style={{padding: 12, background: o.status === "refunded" ? "color-mix(in srgb, var(--neg) 6%, var(--surface))" : "var(--surface)", border: `1px solid ${o.status === "refunded" ? "color-mix(in srgb, var(--neg) 24%, var(--border))" : "var(--border)"}`, borderRadius: 7, marginBottom: 14}}>
          <div style={{display: "flex", alignItems: "center", gap: 8, marginBottom: 4}}>
            <span className="mono" style={{fontSize: 12}}>{o.licence}</span>
            {o.status === "refunded" ? <Pill variant="block">deactivated</Pill> : <Pill variant="pos">active · lifetime</Pill>}
          </div>
          <div className="muted" style={{fontSize: 11, lineHeight: 1.45}}>
            {o.status === "refunded"
              ? `Refunded on ${o.refundedAt}. Content was removed from your modules and the licence no longer grants access.`
              : "Content is live in your modules. Re-delivery is available from the Licenses tab if anything went missing."}
          </div>
        </div>
        {o.status === "refunded" && (
          <>
            <div className="eyebrow" style={{marginBottom: 6}}>Refund reason given</div>
            <div className="muted" style={{fontSize: 12, lineHeight: 1.5, fontStyle: "italic", padding: 11, background: "var(--surface)", borderRadius: 6}}>&ldquo;{o.refundReason}&rdquo;</div>
          </>
        )}
        {o.refundable && (
          <div style={{padding: 11, background: "color-mix(in srgb, var(--acc-recov) 6%, var(--surface))", border: "1px solid color-mix(in srgb, var(--acc-recov) 22%, var(--border))", borderRadius: 6, fontSize: 11.5, color: "var(--fg-muted)", lineHeight: 1.5}}>
            Purchased {o.daysSince} {o.daysSince === 1 ? "day" : "days"} ago — inside the fourteen-day window. A refund is credited as voucher balance, not cash.
          </div>
        )}
      </div>
      <div className="modal-f">
        <button className="btn btn-ghost" onClick={onClose}>Close</button>
        <button className="btn btn-ghost"><Icon name="download" className="ic ic-sm"/>Invoice</button>
        {o.refundable && <button className="btn" onClick={onRefund}>Request refund</button>}
      </div>
    </div>
  </div>
);

const RefundRequestModal = ({ o, onClose }) => {
  const [step, setStep] = useState(1);
  const [reason, setReason] = useState(null);
  const auto = o.daysSince <= 14;
  return (
    <div className="modal-veil" onClick={onClose}>
      <div className="modal" style={{width: 560}} onClick={e => e.stopPropagation()}>
        <div className="modal-h">
          <div style={{width: 26, height: 26, borderRadius: 6, background: "color-mix(in srgb, var(--acc-recov) 18%, transparent)", border: "1px solid color-mix(in srgb, var(--acc-recov) 35%, transparent)", color: "var(--acc-recov)", display: "grid", placeItems: "center"}}><Icon name="refresh" className="ic"/></div>
          <div style={{flex: 1}}>
            <div style={{fontSize: 14, fontWeight: 600}}>Request refund</div>
            <div className="dim" style={{fontSize: 11}}>{o.product} · {o.id}</div>
          </div>
          <button className="icon-btn" onClick={onClose}><Icon name="x" className="ic"/></button>
        </div>
        <div className="modal-body">
          {step === 1 && (
            <>
              <div className="eyebrow" style={{marginBottom: 8}}>Why are you returning this</div>
              <div className="col-gap" style={{gap: 5, marginBottom: 14}}>
                {REFUND_REASONS.map(r => (
                  <button key={r} onClick={() => setReason(r)} style={{
                    textAlign: "left", padding: "10px 12px", borderRadius: 6, cursor: "pointer", fontSize: 12,
                    background: reason === r ? "color-mix(in srgb, var(--acc-recov) 9%, var(--surface))" : "var(--surface)",
                    border: `1px solid ${reason === r ? "color-mix(in srgb, var(--acc-recov) 32%, var(--border))" : "var(--border)"}`,
                    color: "var(--fg)",
                  }}>
                    {reason === r && <Icon name="check" className="ic ic-sm" style={{display: "inline", marginRight: 7, color: "var(--acc-recov)"}}/>}
                    {r}
                  </button>
                ))}
              </div>
              <div className="eyebrow" style={{marginBottom: 5}}>Detail · optional but helps the creator</div>
              <textarea placeholder="What went wrong?" style={{width: "100%", minHeight: 64, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, padding: 10, fontSize: 12, fontFamily: "var(--font-sans)", resize: "vertical", outline: "none"}}/>
            </>
          )}
          {step === 2 && (
            <>
              <div style={{padding: 14, background: auto ? "color-mix(in srgb, var(--pos) 7%, var(--surface))" : "color-mix(in srgb, var(--warn) 7%, var(--surface))", border: `1px solid ${auto ? "color-mix(in srgb, var(--pos) 25%, var(--border))" : "color-mix(in srgb, var(--warn) 25%, var(--border))"}`, borderRadius: 8, marginBottom: 14}}>
                <div style={{display: "flex", alignItems: "center", gap: 8, marginBottom: 6}}>
                  <Icon name={auto ? "check" : "alert"} className="ic" style={{color: auto ? "var(--pos)" : "var(--warn)"}}/>
                  <span style={{fontSize: 13, fontWeight: 600, color: auto ? "var(--pos)" : "var(--warn)"}}>
                    {auto ? "Approves automatically" : "Goes to manual review"}
                  </span>
                </div>
                <div className="muted" style={{fontSize: 11.5, lineHeight: 1.5}}>
                  {auto
                    ? `Purchased ${o.daysSince} days ago with no prior refunds on your account — this is processed immediately.`
                    : `Purchased ${o.daysSince} days ago, outside the fourteen-day window. A person reviews it within three to five business days.`}
                </div>
              </div>
              <div className="eyebrow" style={{marginBottom: 8}}>What happens</div>
              <div className="col-gap" style={{gap: 5, marginBottom: 14}}>
                {[
                  [`${omoney(o.total)} credited to your voucher balance`, "not cash — this is how refunds work on LumeOS"],
                  ["Licence deactivated", `${o.licence} stops granting access`],
                  ["Content removed from your modules", "on next app launch"],
                  [`${o.seller} loses ${omoney(o.net)}`, "the platform fee is reversed too"],
                ].map(([t, d], i) => (
                  <div key={i} style={{display: "flex", gap: 9, alignItems: "flex-start", padding: "9px 11px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6}}>
                    <span className="num dim" style={{fontSize: 10, width: 12, flexShrink: 0, marginTop: 2}}>{i + 1}</span>
                    <div><div style={{fontSize: 12}}>{t}</div><div className="dim" style={{fontSize: 10.5}}>{d}</div></div>
                  </div>
                ))}
              </div>
              <div style={{padding: 11, background: "var(--surface-2)", borderRadius: 6}}>
                <div className="eyebrow" style={{marginBottom: 5}}>Your reason</div>
                <div className="muted" style={{fontSize: 11.5, fontStyle: "italic"}}>&ldquo;{reason}&rdquo;</div>
              </div>
            </>
          )}
          {step === 3 && (
            <div style={{textAlign: "center", padding: "16px 0"}}>
              <div style={{width: 46, height: 46, borderRadius: 999, background: "color-mix(in srgb, var(--pos) 18%, transparent)", border: "1px solid color-mix(in srgb, var(--pos) 40%, var(--border))", display: "grid", placeItems: "center", margin: "0 auto 12px"}}>
                <Icon name="check" className="ic" style={{width: 22, height: 22, color: "var(--pos)", strokeWidth: 2.5}}/>
              </div>
              <div style={{fontSize: 15, fontWeight: 600, marginBottom: 5}}>{auto ? "Refunded" : "Request submitted"}</div>
              <div className="muted" style={{fontSize: 12, lineHeight: 1.55, maxWidth: 380, margin: "0 auto 16px"}}>
                {auto
                  ? `${omoney(o.total)} is back in your voucher balance. The licence has been deactivated.`
                  : "You will hear back within three to five business days. Nothing changes until then."}
              </div>
              {auto && (
                <div className="col-gap" style={{gap: 0, textAlign: "left", maxWidth: 340, margin: "0 auto"}}>
                  <Row label="Voucher before" value={omoney(5250)}/>
                  <Row label="Refund credited" value={"+ " + omoney(o.total)}/>
                  <Row label="Voucher now" value={omoney(5250 + o.total)}/>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="modal-f">
          {step === 1 && <>
            <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" disabled={!reason} onClick={() => setStep(2)}>Continue</button>
          </>}
          {step === 2 && <>
            <button className="btn btn-ghost" onClick={() => setStep(1)}>Back</button>
            <button className="btn btn-primary" onClick={() => setStep(3)}>Submit request</button>
          </>}
          {step === 3 && <button className="btn btn-primary" onClick={onClose}>Done</button>}
        </div>
      </div>
    </div>
  );
};

Object.assign(window, { ORDERS_V2, REFUND_REASONS });
