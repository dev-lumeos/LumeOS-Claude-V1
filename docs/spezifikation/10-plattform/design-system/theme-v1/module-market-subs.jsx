// Marketplace · Block E — Subscriptions, Buddy transaction gateway,
// brand placement, personalised discovery home
// per SPEC_05 §6, SPEC_03 F5/F6/F11, SPEC_01 §7

const SUB_PLANS = [
  { id: "basic", name: "Lumeos Basic", price: 999,  credit: 999,  ai: 20,
    features: ["Core modules", "Basic AI"],
    detail: ["Nutrition, Training, Recovery", "20 MealCam scans per month", "Marketplace access"] },
  { id: "plus",  name: "Lumeos Plus",  price: 1999, credit: 1999, ai: 50, current: true,
    features: ["All modules", "Full AI", "Advanced goals"],
    detail: ["All eleven modules", "50 AI credits per month", "Phase engine and adaptive TDEE", "Full coach persona set"] },
  { id: "pro",   name: "Lumeos Pro",   price: 2999, credit: 2999, ai: 150,
    features: ["All modules", "Full AI", "Advanced goals", "Human coach", "Expert plans"],
    detail: ["Everything in Plus", "150 AI credits per month", "Human coach seat included", "Expert-tier plan library", "Priority support"] },
];

const SUB_HISTORY = [
  { at: "12 May 2026", plan: "Lumeos Plus", charged: 1999, credited: 1999, credits: 50, status: "paid" },
  { at: "12 Apr 2026", plan: "Lumeos Plus", charged: 1999, credited: 1999, credits: 50, status: "paid" },
  { at: "12 Mar 2026", plan: "Lumeos Plus", charged: 1999, credited: 1999, credits: 50, status: "paid" },
  { at: "12 Feb 2026", plan: "Lumeos Basic", charged: 999, credited: 999, credits: 20, status: "paid" },
  { at: "12 Jan 2026", plan: "Lumeos Basic", charged: 999, credited: 999, credits: 20, status: "paid" },
];

const BUDDY_RECS = [
  { id: "P-2201", why: "Your goal phase is recomp and this is the only bundle that covers training, nutrition and supplements together.", match: 0.83 },
  { id: "P-2188", why: "Training only, cheaper, same difficulty tier — if you would rather keep Jana's meal plan.", match: 0.67 },
];

const BRAND_PLACEMENTS = [
  { trigger: "Ferritin 28 ng/mL · below optimal", module: "Medical", gap: "Iron not in your stack",
    product: "Iron Bisglycinate 25 mg", brand: "Pure Encapsulations", price: 1299, rating: 4.7, buyers: 1_240,
    cpa: 380, evidence: "A", note: "Gentle on the stomach, well absorbed. Take away from calcium and coffee." },
  { trigger: "Omega-3 index 4.2% · below 8% target", module: "Nutrition", gap: "EPA/DHA at 55% of target",
    product: "Ultimate Omega 1280 mg", brand: "Nordic Naturals", price: 3850, rating: 4.9, buyers: 412,
    cpa: 620, evidence: "A", note: "Already in your stack — this is a refill prompt, not a new recommendation." },
];

const bmoney = (c) => "€" + (c / 100).toFixed(2);

// ══ Subscriptions v2 ══════════════════════════════════
window.MarketSubsV2 = () => {
  const [modal, setModal] = useState(null);
  const cur = SUB_PLANS.find(p => p.current);
  return (
    <>
      <div className="grid" style={{gridTemplateColumns: "1.5fr 1fr", gap: 14, marginBottom: 14}}>
        <Card title="Your plan" sub="renews 12 June" actions={<button className="btn btn-sm" onClick={() => setModal("change")}>Change plan</button>}>
          <div style={{display: "flex", alignItems: "center", gap: 16, marginBottom: 14}}>
            <div style={{padding: "14px 18px", background: "color-mix(in srgb, var(--acc-coach) 10%, var(--surface))", border: "1px solid color-mix(in srgb, var(--acc-coach) 32%, var(--border))", borderRadius: 9}}>
              <div style={{fontSize: 15, fontWeight: 600, marginBottom: 2}}>{cur.name}</div>
              <div className="num" style={{fontSize: 22, fontWeight: 600, color: "var(--acc-coach)"}}>{bmoney(cur.price)}<span className="dim" style={{fontSize: 11, fontWeight: 400}}> / month</span></div>
            </div>
            <div style={{flex: 1}}>
              <div className="col-gap" style={{gap: 0}}>
                <Row label="Voucher credited each month" value={bmoney(cur.credit) + " · 1:1"}/>
                <Row label="AI credits" value={cur.ai + " per month"}/>
                <Row label="Next charge" value="12 June · Stripe"/>
                <Row label="Member since" value="12 Jan 2026"/>
              </div>
            </div>
          </div>
          <div style={{padding: 12, background: "var(--surface)", borderRadius: 7, fontSize: 11.5, color: "var(--fg-muted)", lineHeight: 1.55}}>
            The subscription fee is charged by Stripe and returned to your wallet as a goodwill voucher at par. It is not electronic money, carries no cash-out claim, and any unspent balance expires if you cancel.
          </div>
        </Card>
        <Card title="This cycle" sub="12 May → 12 June">
          <div style={{display: "flex", alignItems: "center", gap: 14, marginBottom: 12}}>
            <Ring value={16} max={50} color="var(--acc-buddy)" label="credits" size={82} stroke={7}/>
            <div>
              <div className="num" style={{fontSize: 20, fontWeight: 500}}>34 <span className="dim" style={{fontSize: 12}}>/ 50 used</span></div>
              <div className="muted" style={{fontSize: 11}}>16 remaining · resets 12 June</div>
            </div>
          </div>
          <Row label="Voucher credited" value={bmoney(1999)}/>
          <Row label="Voucher spent" value={bmoney(1749)}/>
          <Row label="Voucher remaining" value={bmoney(5250)}/>
        </Card>
      </div>

      <Card title="Plans" sub="upgrade takes effect immediately, downgrade at next renewal">
        <div className="grid g-cols-3" style={{gap: 12}}>
          {SUB_PLANS.map(p => (
            <div key={p.id} style={{
              padding: 16, borderRadius: 9,
              background: p.current ? "color-mix(in srgb, var(--acc-coach) 8%, var(--surface))" : "var(--surface)",
              border: `1px solid ${p.current ? "color-mix(in srgb, var(--acc-coach) 34%, var(--border))" : "var(--border)"}`,
            }}>
              <div style={{display: "flex", alignItems: "center", gap: 7, marginBottom: 3}}>
                <span style={{fontSize: 14, fontWeight: 600}}>{p.name}</span>
                {p.current && <Pill variant="acc">current</Pill>}
              </div>
              <div className="num" style={{fontSize: 24, fontWeight: 600, marginBottom: 2}}>{bmoney(p.price)}</div>
              <div className="dim" style={{fontSize: 10.5, marginBottom: 12}}>per month · {bmoney(p.credit)} back as voucher</div>
              <div style={{padding: "8px 10px", background: "var(--surface-2)", borderRadius: 6, marginBottom: 12}}>
                <div className="num" style={{fontSize: 15, fontWeight: 600}}>{p.ai}</div>
                <div className="dim" style={{fontSize: 10}}>AI credits per month</div>
              </div>
              <div className="col-gap" style={{gap: 5, marginBottom: 14}}>
                {p.detail.map(d => (
                  <div key={d} style={{display: "flex", gap: 7, fontSize: 11, lineHeight: 1.4}}>
                    <Icon name="check" className="ic" style={{width: 11, height: 11, color: p.current ? "var(--acc-coach)" : "var(--fg-dim)", flexShrink: 0, marginTop: 2}}/>
                    <span className="muted">{d}</span>
                  </div>
                ))}
              </div>
              {p.current
                ? <button className="btn btn-ghost" style={{width: "100%"}} disabled>Current plan</button>
                : <button className="btn btn-primary" style={{width: "100%"}} onClick={() => setModal("change")}>{p.price > 1999 ? "Upgrade" : "Downgrade"}</button>}
            </div>
          ))}
        </div>
      </Card>

      <div style={{height: 14}}/>
      <Card title="Billing history" sub="each charge writes a subscription_credit transaction">
        <table className="tbl">
          <thead><tr><th style={{width: 120}}>Date</th><th>Plan</th><th style={{width: 100, textAlign: "right"}}>Charged</th><th style={{width: 130, textAlign: "right"}}>Voucher credited</th><th style={{width: 100, textAlign: "right"}}>AI credits</th><th style={{width: 80}}>Status</th></tr></thead>
          <tbody>
            {SUB_HISTORY.map((h, i) => (
              <tr key={i}>
                <td className="num muted">{h.at}</td>
                <td style={{fontSize: 12}}>{h.plan}</td>
                <td className="num" style={{textAlign: "right"}}>{bmoney(h.charged)}</td>
                <td className="num" style={{textAlign: "right", color: "var(--acc-coach)"}}>+ {bmoney(h.credited)}</td>
                <td className="num muted" style={{textAlign: "right"}}>{h.credits}</td>
                <td><Pill variant="pos">{h.status}</Pill></td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{display: "flex", gap: 6, marginTop: 12}}>
          <button className="btn btn-ghost btn-sm"><Icon name="download" className="ic ic-sm"/>Download invoices</button>
          <div className="spacer"/>
          <button className="btn btn-ghost btn-sm" style={{color: "var(--neg)"}}>Cancel subscription</button>
        </div>
      </Card>

      {modal === "change" && <PlanChangeModal onClose={() => setModal(null)}/>}
    </>
  );
};

const PlanChangeModal = ({ onClose }) => {
  const [pick, setPick] = useState("pro");
  const cur = SUB_PLANS.find(p => p.current);
  const next = SUB_PLANS.find(p => p.id === pick);
  const up = next.price > cur.price;
  const diff = Math.abs(next.price - cur.price);
  return (
    <div className="modal-veil" onClick={onClose}>
      <div className="modal" style={{width: 560}} onClick={e => e.stopPropagation()}>
        <div className="modal-h">
          <div style={{width: 26, height: 26, borderRadius: 6, background: "color-mix(in srgb, var(--acc-coach) 18%, transparent)", border: "1px solid color-mix(in srgb, var(--acc-coach) 35%, transparent)", color: "var(--acc-coach)", display: "grid", placeItems: "center"}}><Icon name="calendar" className="ic"/></div>
          <div style={{flex: 1}}><div style={{fontSize: 14, fontWeight: 600}}>Change plan</div><div className="dim" style={{fontSize: 11}}>from {cur.name}</div></div>
          <button className="icon-btn" onClick={onClose}><Icon name="x" className="ic"/></button>
        </div>
        <div className="modal-body">
          <div className="col-gap" style={{gap: 7, marginBottom: 14}}>
            {SUB_PLANS.filter(p => !p.current).map(p => (
              <div key={p.id} onClick={() => setPick(p.id)} style={{
                display: "flex", gap: 11, alignItems: "center", padding: 12, borderRadius: 7, cursor: "pointer",
                background: pick === p.id ? "color-mix(in srgb, var(--acc-coach) 9%, var(--surface))" : "var(--surface)",
                border: `1px solid ${pick === p.id ? "color-mix(in srgb, var(--acc-coach) 32%, var(--border))" : "var(--border)"}`,
              }}>
                <div style={{width: 14, height: 14, borderRadius: 999, border: `2px solid ${pick === p.id ? "var(--acc-coach)" : "var(--border-strong)"}`, background: pick === p.id ? "var(--acc-coach)" : "transparent", flexShrink: 0}}/>
                <div style={{flex: 1}}>
                  <div style={{fontSize: 12.5, fontWeight: pick === p.id ? 600 : 500}}>{p.name}</div>
                  <div className="muted" style={{fontSize: 11}}>{p.ai} AI credits · {p.features.join(" · ")}</div>
                </div>
                <span className="num" style={{fontSize: 13, fontWeight: 600}}>{bmoney(p.price)}</span>
              </div>
            ))}
          </div>
          <div style={{padding: 13, background: up ? "color-mix(in srgb, var(--pos) 6%, var(--surface))" : "color-mix(in srgb, var(--warn) 6%, var(--surface))", border: `1px solid ${up ? "color-mix(in srgb, var(--pos) 24%, var(--border))" : "color-mix(in srgb, var(--warn) 24%, var(--border))"}`, borderRadius: 7}}>
            <div className="eyebrow" style={{marginBottom: 7, color: up ? "var(--pos)" : "var(--warn)"}}>{up ? "Upgrade · effective immediately" : "Downgrade · effective 12 June"}</div>
            <div className="col-gap" style={{gap: 0}}>
              <Row label={up ? "Charged today (prorated)" : "Next charge"} value={bmoney(up ? Math.round(diff * 0.87) : next.price)}/>
              <Row label="Voucher credited" value={bmoney(up ? Math.round(diff * 0.87) : next.price)}/>
              <Row label="AI credits" value={cur.ai + " → " + next.ai}/>
              {!up && <Row label="Kept until renewal" value="all current features"/>}
            </div>
          </div>
        </div>
        <div className="modal-f">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={onClose}>Confirm · {next.name}</button>
        </div>
      </div>
    </div>
  );
};

// ══ Buddy gateway + brand placement ═══════════════════
window.MarketBuddyGateway = () => {
  const [buy, setBuy] = useState(null);
  const catalog = window.CATALOG || [];
  return (
    <>
      <div className="grid" style={{gridTemplateColumns: "1.4fr 1fr", gap: 14}}>
        <div className="col-gap" style={{gap: 14}}>
          <Card title="Buddy recommendation" sub="one-click purchase from the chat">
            <div style={{display: "flex", gap: 11, marginBottom: 14}}>
              <div style={{width: 32, height: 32, borderRadius: 8, background: "color-mix(in srgb, var(--acc-buddy) 20%, transparent)", border: "1px solid color-mix(in srgb, var(--acc-buddy) 38%, var(--border))", display: "grid", placeItems: "center", flexShrink: 0}}>
                <Icon name="brain" className="ic ic-sm" style={{color: "var(--acc-buddy)"}}/>
              </div>
              <div style={{flex: 1, padding: "11px 13px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "3px 10px 10px 10px", fontSize: 12.5, lineHeight: 1.55}}>
                Based on your recomp phase and the fact that you have no structured training block after week 5, two options are worth looking at. Your wallet covers either one.
              </div>
            </div>
            <div className="col-gap" style={{gap: 8}}>
              {BUDDY_RECS.map(r => {
                const p = catalog.find(x => x.id === r.id);
                if (!p) return null;
                const m = (window.PRODUCT_TYPES || []).find(t => t.t === p.type) || { icon: "marketplace", l: p.type };
                const w = window.WALLET_STATE || { voucher_cents: 5250, revenue_cents: 84050 };
                const enough = (w.voucher_cents + w.revenue_cents) >= p.price;
                return (
                  <div key={r.id} style={{padding: 13, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8}}>
                    <div style={{display: "flex", gap: 11, marginBottom: 9}}>
                      <div className="placeholder-img" style={{width: 52, height: 52, borderRadius: 7, flexShrink: 0}}>
                        <Icon name={m.icon} className="ic ic-sm" style={{color: "var(--fg-dim)"}}/>
                      </div>
                      <div style={{flex: 1, minWidth: 0}}>
                        <div style={{display: "flex", alignItems: "center", gap: 7, marginBottom: 3}}>
                          <span style={{fontSize: 12.5, fontWeight: 600}}>{p.title}</span>
                          <span className="dim" style={{fontSize: 10}}>{p.rating}★</span>
                        </div>
                        <div className="muted" style={{fontSize: 11, lineHeight: 1.45}}>{r.why}</div>
                      </div>
                    </div>
                    <div style={{display: "flex", alignItems: "center", gap: 9}}>
                      <span className="num" style={{fontSize: 15, fontWeight: 600}}>{bmoney(p.price)}</span>
                      <span className="dim" style={{fontSize: 10.5}}>wallet {bmoney(w.voucher_cents + w.revenue_cents)} {enough ? "· covered" : "· short"}</span>
                      <div style={{marginLeft: "auto", display: "flex", gap: 5, alignItems: "center"}}>
                        <span className="dim mono" style={{fontSize: 10}}>match {Math.round(r.match * 100)}%</span>
                        <button className="btn btn-sm" onClick={() => setBuy(p)}>Details</button>
                        <button className="btn btn-primary btn-sm" disabled={!enough} onClick={() => setBuy(p)}>Buy now</button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{marginTop: 12, padding: 11, background: "var(--surface-2)", borderRadius: 6, fontSize: 11.5, color: "var(--fg-muted)", lineHeight: 1.5}}>
              Say <span className="mono" style={{color: "var(--fg)"}}>"buy the first one"</span> in chat and Buddy asks for confirmation once, then runs checkout and delivery in the background.
            </div>
          </Card>

          <Card title="Brand placement" sub="triggered by gaps in your own data — never unprompted ads">
            <div className="col-gap" style={{gap: 10}}>
              {BRAND_PLACEMENTS.map((b, i) => (
                <div key={i} style={{padding: 13, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8}}>
                  <div style={{display: "flex", alignItems: "center", gap: 7, marginBottom: 8, flexWrap: "wrap"}}>
                    <Pill variant="warn">{b.trigger}</Pill>
                    <Pill>{b.module}</Pill>
                    <span className="dim" style={{fontSize: 10.5}}>{b.gap}</span>
                  </div>
                  <div style={{display: "flex", gap: 11, alignItems: "center"}}>
                    <div className="placeholder-img" style={{width: 46, height: 46, borderRadius: 7, flexShrink: 0}}>
                      <Icon name="supplements" className="ic ic-sm" style={{color: "var(--fg-dim)"}}/>
                    </div>
                    <div style={{flex: 1, minWidth: 0}}>
                      <div style={{display: "flex", alignItems: "center", gap: 6, marginBottom: 2}}>
                        <span style={{fontSize: 12.5, fontWeight: 600}}>{b.product}</span>
                        <Pill variant="pos">evidence {b.evidence}</Pill>
                      </div>
                      <div className="muted" style={{fontSize: 11, lineHeight: 1.45}}>{b.brand} · {b.rating}★ · {b.buyers.toLocaleString()} buyers</div>
                    </div>
                    <span className="num" style={{fontSize: 14, fontWeight: 600}}>{bmoney(b.price)}</span>
                    <button className="btn btn-primary btn-sm">Buy</button>
                  </div>
                  <div className="muted" style={{fontSize: 11, lineHeight: 1.45, marginTop: 8, paddingTop: 8, borderTop: "1px solid var(--border)"}}>{b.note}</div>
                  <div className="dim mono" style={{fontSize: 9.5, marginTop: 6}}>brand pays {bmoney(b.cpa)} CPA on conversion · disclosed placement</div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="col-gap" style={{gap: 14}}>
          <Card title="Gateway flow" sub="what happens on one-click">
            <div className="col-gap" style={{gap: 0}}>
              {[
                ["1", "User says buy", "in chat, or taps the card"],
                ["2", "Buddy confirms once", "product name and price read back"],
                ["3", "POST /orders/checkout", "atomic wallet debit, voucher first"],
                ["4", "Licence created", "lifetime, tied to your account"],
                ["5", "Content delivered", "written into the target modules"],
                ["6", "Buddy reports back", "with links into each module"],
              ].map(([n, t, d], i) => (
                <div key={n} style={{display: "flex", gap: 11, padding: "9px 0", borderBottom: i < 5 ? "1px solid var(--border)" : "none"}}>
                  <span className="num dim" style={{fontSize: 10.5, width: 12, flexShrink: 0, marginTop: 2}}>{n}</span>
                  <div><div style={{fontSize: 12, fontWeight: 500}}>{t}</div><div className="dim" style={{fontSize: 10.5}}>{d}</div></div>
                </div>
              ))}
            </div>
          </Card>
          <Card title="Placement rules">
            <div className="col-gap" style={{gap: 6}}>
              {[
                "Only fires when your own data shows a gap — no browsing-based targeting",
                "Always labelled as a paid placement",
                "Evidence grade shown next to every product",
                "Never appears if the nutrient is already covered by your stack",
                "One placement per module per week, maximum",
              ].map((r, i) => (
                <div key={i} style={{display: "flex", gap: 8, alignItems: "flex-start", fontSize: 11.5, lineHeight: 1.45}}>
                  <Icon name="check" className="ic" style={{width: 11, height: 11, color: "var(--pos)", flexShrink: 0, marginTop: 2}}/>
                  <span className="muted">{r}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {buy && window.CheckoutBridge && <window.CheckoutBridge p={buy} onClose={() => setBuy(null)}/>}
    </>
  );
};

Object.assign(window, { SUB_PLANS, SUB_HISTORY, BUDDY_RECS, BRAND_PLACEMENTS });
