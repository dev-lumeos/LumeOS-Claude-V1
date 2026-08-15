// Marketplace · Block A — Wallet per SPEC_05 / SPEC_02
// Two balances (voucher / revenue), 9 transaction types, owner matrix,
// debit simulator, top-up, payout, AI micro-transactions

const WALLET_OWNER_TYPES = [
  { t: "user",    voucher: true,  revenue: false, payout: false, d: "Normal user — subscription goodwill only" },
  { t: "creator", voucher: true,  revenue: true,  payout: true,  d: "Coach · influencer · nutritionist" },
  { t: "gym",     voucher: false, revenue: true,  payout: true,  d: "B2B — gym partner" },
  { t: "vendor",  voucher: false, revenue: true,  payout: true,  d: "B2B — supplement brand" },
  { t: "brand",   voucher: false, revenue: true,  payout: true,  d: "B2B — brand partner" },
];

const TX_TYPES = [
  { t: "subscription_credit", from: "—",              to: "voucher", d: "Monthly subscription → goodwill voucher" },
  { t: "topup",               from: "— (Stripe)",     to: "voucher", d: "Manual top-up" },
  { t: "purchase",            from: "voucher/revenue",to: "revenue", d: "Product purchase" },
  { t: "payout",              from: "revenue",        to: "— (Stripe)", d: "Payout to creator / B2B" },
  { t: "bonus",               from: "—",              to: "voucher", d: "Achievement bonus" },
  { t: "refund",              from: "—",              to: "voucher", d: "Refund credited as voucher" },
  { t: "ai_usage",            from: "voucher",        to: "—",       d: "AI micro-transaction" },
  { t: "promotion_payment",   from: "revenue",        to: "—",       d: "Paid boost slot" },
  { t: "revenue_credit",      from: "—",              to: "revenue", d: "Creator earnings credit" },
];

// Tom is a creator (sells the 5/3/1 plan) → both balances, can_payout
const WALLET_STATE = {
  owner_type: "creator",
  can_payout: true,
  voucher_cents: 5250,
  revenue_cents: 84050,
  total_spent_cents: 41820,
  total_earned_cents: 1842000,
  currency: "EUR",
  auto_topup_enabled: true,
  auto_topup_threshold_cents: 1000,
  auto_topup_amount_cents: 2500,
};

const AI_CREDITS = {
  plan: "Lumeos Plus",
  included: 50,
  used: 34,
  resets: "1 June",
  costs: [
    { f: "MealCam scan",        lumeos: "~€0.01",  charge: 2,  unit: "per scan",       used: 22 },
    { f: "AI Coach request",    lumeos: "~€0.005–0.02", charge: 3, unit: "per request", used: 8 },
    { f: "AI workout generation", lumeos: "~€0.01", charge: 2, unit: "per generation", used: 3 },
    { f: "Bloodwork OCR import", lumeos: "~€0.02", charge: 5, unit: "per upload",      used: 1 },
    { f: "Knowledge search",    lumeos: "~€0.002", charge: 0, unit: "included in plan", used: 0 },
  ],
};

const WALLET_TXNS = [
  { id: "tx-118", at: "16 May 09:14", type: "ai_usage",            gross: -2,     fee: 0,    net: -2,     from: "voucher", to: "—",       ref: "ai_feature · MealCam", desc: "MealCam scan · lunch" },
  { id: "tx-117", at: "15 May 21:40", type: "revenue_credit",      gross: 3900,   fee: 780,  net: 3120,   from: "—",       to: "revenue", ref: "order · O-2431",       desc: "Sale: 5/3/1 BBB · 12 weeks" },
  { id: "tx-116", at: "14 May 18:02", type: "purchase",            gross: -4900,  fee: 980,  net: -4900,  from: "voucher", to: "revenue", ref: "product · P-2201",     desc: "12-Week Lean Bulk Bundle" },
  { id: "tx-115", at: "14 May 18:02", type: "topup",               gross: 5000,   fee: 0,    net: 5000,   from: "— (Stripe)", to: "voucher", ref: "stripe · pi_3Qk…",   desc: "Wallet top-up" },
  { id: "tx-114", at: "12 May 08:00", type: "subscription_credit", gross: 1999,   fee: 0,    net: 1999,   from: "—",       to: "voucher", ref: "subscription · plus",  desc: "Monthly membership goodwill (Lumeos Plus)" },
  { id: "tx-113", at: "10 May 14:22", type: "promotion_payment",   gross: -4999,  fee: 0,    net: -4999,  from: "revenue", to: "—",       ref: "promotion · weekly",   desc: "Weekly boost · 5/3/1 BBB" },
  { id: "tx-112", at: "08 May 11:30", type: "payout",              gross: -50000, fee: 0,    net: -50000, from: "revenue", to: "— (Stripe)", ref: "stripe · po_1Nx…",  desc: "Payout to bank account" },
  { id: "tx-111", at: "05 May 16:48", type: "bonus",               gross: 500,    fee: 0,    net: 500,    from: "—",       to: "voucher", ref: "achievement",          desc: "30-day logging streak bonus" },
  { id: "tx-110", at: "02 May 10:15", type: "refund",              gross: 2900,   fee: 0,    net: 2900,   from: "—",       to: "voucher", ref: "order · O-2388",       desc: "Refund: PPL Hypertrophy Pro" },
  { id: "tx-109", at: "28 Apr 19:20", type: "revenue_credit",      gross: 54000,  fee: 5400, net: 48600,  from: "—",       to: "revenue", ref: "order · O-2380",       desc: "Sale: Training Periodization · 3 month (coach traffic)" },
];

const eur = (c) => (c / 100).toFixed(2);

const TX_META = {
  subscription_credit: { i: "calendar",    c: "var(--acc-coach)" },
  topup:               { i: "plus",        c: "var(--pos)" },
  purchase:            { i: "marketplace", c: "var(--acc-nutri)" },
  payout:              { i: "download",    c: "var(--acc-mkt)" },
  bonus:               { i: "check",       c: "var(--pos)" },
  refund:              { i: "refresh",     c: "var(--acc-recov)" },
  ai_usage:            { i: "brain",       c: "var(--acc-buddy)" },
  promotion_payment:   { i: "trend_up",    c: "var(--acc-goals)" },
  revenue_credit:      { i: "trend_up",    c: "var(--pos)" },
};

// ── Main wallet view ──────────────────────────────────
window.MarketWalletV2 = () => {
  const [sub, setSub] = useState("balances");
  const [modal, setModal] = useState(null);
  const w = WALLET_STATE;
  return (
    <>
      <div style={{display: "flex", gap: 8, marginBottom: 14, alignItems: "center", flexWrap: "wrap"}}>
        <div style={{display: "flex", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, padding: 2, gap: 1}}>
          {[["balances","Balances"],["transactions","Transactions"],["credits","AI credits"],["model","Wallet model"]].map(([k, l]) => (
            <button key={k} onClick={() => setSub(k)} className={sub === k ? "btn btn-primary" : "btn btn-ghost"} style={{height: 22, fontSize: 11, padding: "0 10px", borderRadius: 4}}>{l}</button>
          ))}
        </div>
        <div className="spacer"/>
        <button className="btn" onClick={() => setModal("topup")}><Icon name="plus" className="ic ic-sm"/>Top up</button>
        {w.can_payout && <button className="btn" onClick={() => setModal("payout")}><Icon name="download" className="ic ic-sm"/>Payout</button>}
        <button className="btn btn-ghost" onClick={() => setModal("debit")}><Icon name="bolt" className="ic ic-sm"/>Debit simulator</button>
      </div>

      {sub === "balances"     && <WalletBalances w={w}/>}
      {sub === "transactions" && <WalletTransactions/>}
      {sub === "credits"      && <WalletCredits/>}
      {sub === "model"        && <WalletModel/>}

      {modal === "topup"  && <TopUpModal onClose={() => setModal(null)}/>}
      {modal === "payout" && <PayoutModal w={w} onClose={() => setModal(null)}/>}
      {modal === "debit"  && <DebitSimModal w={w} onClose={() => setModal(null)}/>}
    </>
  );
};

const WalletBalances = ({ w }) => (
  <div className="grid" style={{gridTemplateColumns: "1.5fr 1fr", gap: 14}}>
    <div className="col-gap" style={{gap: 14}}>
      {/* two balances side by side */}
      <div className="grid g-cols-2" style={{gap: 12}}>
        <Card style={{position: "relative", overflow: "hidden"}}>
          <div style={{position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "var(--acc-coach)"}}/>
          <div style={{display: "flex", alignItems: "center", gap: 8, marginBottom: 10}}>
            <div className="eyebrow">Voucher balance</div>
            <Pill>goodwill</Pill>
          </div>
          <div className="num" style={{fontSize: 30, fontWeight: 500, letterSpacing: "-0.02em", marginBottom: 4}}>€{eur(w.voucher_cents)}</div>
          <div className="muted" style={{fontSize: 11.5, lineHeight: 1.5, marginBottom: 12}}>
            From subscription credits and bonuses. Spent first on every purchase.
          </div>
          <div className="col-gap" style={{gap: 5}}>
            {[["Not cashable", "no payout claim"], ["Expires on cancellation", "goodwill, not e-money"], ["Spent first", "before revenue balance"]].map(([k, v]) => (
              <div key={k} style={{display: "flex", gap: 7, alignItems: "flex-start", fontSize: 11}}>
                <Icon name="check" className="ic" style={{width: 11, height: 11, color: "var(--acc-coach)", flexShrink: 0, marginTop: 2}}/>
                <span><span style={{color: "var(--fg)"}}>{k}</span> <span className="dim">· {v}</span></span>
              </div>
            ))}
          </div>
        </Card>

        <Card style={{position: "relative", overflow: "hidden"}}>
          <div style={{position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "var(--acc-mkt)"}}/>
          <div style={{display: "flex", alignItems: "center", gap: 8, marginBottom: 10}}>
            <div className="eyebrow">Revenue balance</div>
            <Pill variant="pos">cashable</Pill>
          </div>
          <div className="num" style={{fontSize: 30, fontWeight: 500, letterSpacing: "-0.02em", marginBottom: 4}}>€{eur(w.revenue_cents)}</div>
          <div className="muted" style={{fontSize: 11.5, lineHeight: 1.5, marginBottom: 12}}>
            Marketplace sales, coach sessions, B2B. Payable out via Stripe Connect.
          </div>
          <div className="col-gap" style={{gap: 5}}>
            {[["Payout via Stripe Connect", "1–3 business days"], ["Reinvestable", "buy boost slots, products"], ["Creator / B2B only", "users have no revenue balance"]].map(([k, v]) => (
              <div key={k} style={{display: "flex", gap: 7, alignItems: "flex-start", fontSize: 11}}>
                <Icon name="check" className="ic" style={{width: 11, height: 11, color: "var(--acc-mkt)", flexShrink: 0, marginTop: 2}}/>
                <span><span style={{color: "var(--fg)"}}>{k}</span> <span className="dim">· {v}</span></span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* spend order visual */}
      <Card title="Spend order" sub="voucher first, then revenue — never negative">
        <div style={{display: "flex", alignItems: "center", gap: 10, marginBottom: 12}}>
          <div style={{flex: w.voucher_cents, minWidth: 60, padding: "12px 14px", background: "color-mix(in srgb, var(--acc-coach) 14%, var(--surface))", border: "1px solid color-mix(in srgb, var(--acc-coach) 32%, var(--border))", borderRadius: 7}}>
            <div className="eyebrow" style={{color: "var(--acc-coach)", marginBottom: 3}}>1 · Voucher</div>
            <div className="num" style={{fontSize: 15}}>€{eur(w.voucher_cents)}</div>
          </div>
          <Icon name="arr_r" className="ic" style={{color: "var(--fg-dim)", flexShrink: 0}}/>
          <div style={{flex: 3, padding: "12px 14px", background: "color-mix(in srgb, var(--acc-mkt) 14%, var(--surface))", border: "1px solid color-mix(in srgb, var(--acc-mkt) 32%, var(--border))", borderRadius: 7}}>
            <div className="eyebrow" style={{color: "var(--acc-mkt)", marginBottom: 3}}>2 · Revenue</div>
            <div className="num" style={{fontSize: 15}}>€{eur(w.revenue_cents)}</div>
          </div>
        </div>
        <div className="mono" style={{fontSize: 11, padding: 11, background: "var(--surface-2)", borderRadius: 6, lineHeight: 1.7, color: "var(--fg-muted)"}}>
          voucherDebit = min(voucher_balance, amount)<br/>
          revenueDebit = amount − voucherDebit<br/>
          <span className="dim">CHECK voucher_balance_cents ≥ 0 · CHECK revenue_balance_cents ≥ 0</span>
        </div>
      </Card>

      <Card title="Lifetime" sub="all-time totals">
        <div className="grid g-cols-4" style={{gap: 10}}>
          {[
            ["Total spent",   "€" + eur(w.total_spent_cents)],
            ["Total earned",  "€" + eur(w.total_earned_cents)],
            ["Transactions",  WALLET_TXNS.length + " shown · 214 total"],
            ["Currency",      w.currency],
          ].map(([l, v]) => (
            <div key={l} style={{padding: 11, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6}}>
              <div className="eyebrow" style={{marginBottom: 3}}>{l}</div>
              <div className="num" style={{fontSize: 14}}>{v}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>

    <div className="col-gap" style={{gap: 14}}>
      <Card title="Your wallet type" sub={w.owner_type}>
        <div className="col-gap" style={{gap: 0}}>
          <Row label="Owner type" value={w.owner_type}/>
          <Row label="Voucher balance" value="enabled"/>
          <Row label="Revenue balance" value="enabled"/>
          <Row label="can_payout" value="true"/>
          <Row label="Stripe Connect" value="acct_1Nx… · verified"/>
        </div>
        <div className="divider"/>
        <div className="dim" style={{fontSize: 11, lineHeight: 1.5}}>
          You have a creator wallet because you sell on the marketplace. Regular users have voucher only and cannot request payouts.
        </div>
      </Card>

      <Card title="Auto top-up" sub={w.auto_topup_enabled ? "enabled" : "off"}>
        <Row label="Trigger below" value={"€" + eur(w.auto_topup_threshold_cents)}/>
        <Row label="Top-up amount" value={"€" + eur(w.auto_topup_amount_cents)}/>
        <Row label="Payment method" value="VISA · 4242"/>
        <div className="divider"/>
        <div className="dim" style={{fontSize: 11, lineHeight: 1.5, marginBottom: 10}}>
          Voucher balance is €{eur(w.voucher_cents)} — above the €{eur(w.auto_topup_threshold_cents)} threshold, no charge pending.
        </div>
        <button className="btn btn-ghost" style={{width: "100%"}}><Icon name="settings" className="ic ic-sm"/>Configure</button>
      </Card>

      <Card title="Subscription" sub="Lumeos Plus">
        <Row label="Price" value="€19.99 / month"/>
        <Row label="Voucher credit" value="€19.99 · 1:1"/>
        <Row label="AI credits" value="50 / month"/>
        <Row label="Next renewal" value="12 June"/>
        <div className="divider"/>
        <div style={{padding: 10, background: "color-mix(in srgb, var(--acc-coach) 6%, var(--surface))", border: "1px solid color-mix(in srgb, var(--acc-coach) 22%, var(--border))", borderRadius: 6, fontSize: 11, lineHeight: 1.5, color: "var(--fg-muted)"}}>
          The subscription fee is charged by Stripe and credited back as a goodwill voucher at par. It is not e-money and carries no cash claim.
        </div>
      </Card>
    </div>
  </div>
);

const WalletTransactions = () => {
  const [f, setF] = useState("all");
  const rows = f === "all" ? WALLET_TXNS : WALLET_TXNS.filter(t => t.type === f);
  const types = ["all", ...new Set(WALLET_TXNS.map(t => t.type))];
  return (
    <div>
      <div style={{display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap", alignItems: "center"}}>
        <span className="eyebrow" style={{marginRight: 4}}>Type</span>
        {types.map(t => (
          <button key={t} onClick={() => setF(t)} className={f === t ? "pill pill-acc" : "pill"} style={{cursor: "pointer", padding: "3px 10px", fontSize: 10.5}}>{t}</button>
        ))}
        <div className="spacer"/>
        <button className="btn btn-ghost"><Icon name="download" className="ic ic-sm"/>Export CSV</button>
      </div>
      <Card>
        <table className="tbl">
          <thead>
            <tr>
              <th style={{width: 110}}>When</th>
              <th style={{width: 160}}>Type</th>
              <th>Description</th>
              <th style={{width: 90, textAlign: "right"}}>Gross</th>
              <th style={{width: 80, textAlign: "right"}}>Fee</th>
              <th style={{width: 90, textAlign: "right"}}>Net</th>
              <th style={{width: 150}}>Balance flow</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(t => {
              const m = TX_META[t.type];
              const pos = t.net > 0;
              return (
                <tr key={t.id}>
                  <td className="num muted" style={{fontSize: 11}}>{t.at}</td>
                  <td>
                    <div style={{display: "flex", alignItems: "center", gap: 6}}>
                      <Icon name={m.i} className="ic ic-sm" style={{color: m.c}}/>
                      <span className="mono" style={{fontSize: 11}}>{t.type}</span>
                    </div>
                  </td>
                  <td style={{fontSize: 12}}>{t.desc}<div className="dim mono" style={{fontSize: 9.5}}>{t.ref}</div></td>
                  <td className="num" style={{textAlign: "right"}}>€{eur(Math.abs(t.gross))}</td>
                  <td className="num muted" style={{textAlign: "right"}}>{t.fee ? "€" + eur(t.fee) : "—"}</td>
                  <td className="num" style={{textAlign: "right", color: pos ? "var(--pos)" : "var(--fg)", fontWeight: 500}}>{pos ? "+" : "−"}€{eur(Math.abs(t.net))}</td>
                  <td>
                    <div style={{display: "flex", alignItems: "center", gap: 5, fontSize: 10}}>
                      <span className="mono dim">{t.from}</span>
                      <Icon name="arr_r" className="ic" style={{width: 9, height: 9, color: "var(--fg-dim)"}}/>
                      <span className="mono" style={{color: t.to === "voucher" ? "var(--acc-coach)" : t.to === "revenue" ? "var(--acc-mkt)" : "var(--fg-dim)"}}>{t.to}</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
      <div className="dim" style={{fontSize: 11, marginTop: 10, lineHeight: 1.5}}>
        Append-only ledger. Every purchase writes one transaction for the buyer debit and one <span className="mono">revenue_credit</span> for the seller, both inside the same database transaction.
      </div>
    </div>
  );
};

const WalletCredits = () => {
  const c = AI_CREDITS;
  const pct = Math.round((c.used / c.included) * 100);
  return (
    <div className="grid" style={{gridTemplateColumns: "1fr 1.4fr", gap: 14}}>
      <Card title="AI credits" sub={`${c.plan} · resets ${c.resets}`}>
        <div style={{display: "flex", alignItems: "center", gap: 16, marginBottom: 14}}>
          <Ring value={c.included - c.used} max={c.included} color="var(--acc-buddy)" label="left" size={88} stroke={7}/>
          <div>
            <div className="num" style={{fontSize: 24, fontWeight: 500}}>{c.used}<span className="dim" style={{fontSize: 13}}> / {c.included}</span></div>
            <div className="muted" style={{fontSize: 11.5}}>credits used this cycle · {pct}%</div>
          </div>
        </div>
        <div style={{padding: 11, background: "color-mix(in srgb, var(--acc-buddy) 6%, var(--surface))", border: "1px solid color-mix(in srgb, var(--acc-buddy) 22%, var(--border))", borderRadius: 6, fontSize: 11.5, lineHeight: 1.55, color: "var(--fg-muted)"}}>
          When the monthly allowance runs out, the wallet is charged automatically at the per-action rate below. Voucher balance is used first.
        </div>
      </Card>
      <Card title="Micro-transaction rates" sub="what each AI action costs">
        <table className="tbl">
          <thead><tr><th>Feature</th><th style={{width: 120}}>Cost to LumeOS</th><th style={{width: 120, textAlign: "right"}}>Wallet charge</th><th style={{width: 80, textAlign: "right"}}>Used</th></tr></thead>
          <tbody>
            {c.costs.map(x => (
              <tr key={x.f}>
                <td style={{fontSize: 12}}>{x.f}</td>
                <td className="num muted" style={{fontSize: 11}}>{x.lumeos}</td>
                <td className="num" style={{textAlign: "right"}}>{x.charge ? "€" + (x.charge / 100).toFixed(2) : <span className="dim">included</span>}<div className="dim" style={{fontSize: 9.5}}>{x.unit}</div></td>
                <td className="num" style={{textAlign: "right"}}>{x.used || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
};

const WalletModel = () => (
  <div className="col-gap" style={{gap: 14}}>
    <Card title="Owner types" sub="who gets which balance">
      <table className="tbl">
        <thead><tr><th style={{width: 110}}>owner_type</th><th style={{width: 90, textAlign: "center"}}>Voucher</th><th style={{width: 90, textAlign: "center"}}>Revenue</th><th style={{width: 90, textAlign: "center"}}>Payout</th><th>Description</th></tr></thead>
        <tbody>
          {WALLET_OWNER_TYPES.map(o => (
            <tr key={o.t} style={o.t === WALLET_STATE.owner_type ? {background: "color-mix(in srgb, var(--acc-mkt) 6%, transparent)"} : undefined}>
              <td className="mono" style={{fontSize: 11.5}}>{o.t}{o.t === WALLET_STATE.owner_type && <Pill variant="acc" style={{marginLeft: 6}}>you</Pill>}</td>
              <td style={{textAlign: "center", color: o.voucher ? "var(--pos)" : "var(--fg-dim)"}}>{o.voucher ? "✓" : "—"}</td>
              <td style={{textAlign: "center", color: o.revenue ? "var(--pos)" : "var(--fg-dim)"}}>{o.revenue ? "✓" : "—"}</td>
              <td style={{textAlign: "center", color: o.payout ? "var(--pos)" : "var(--fg-dim)"}}>{o.payout ? "✓" : "—"}</td>
              <td className="muted" style={{fontSize: 11.5}}>{o.d}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>

    <Card title="Transaction types" sub="9 types · append-only ledger">
      <table className="tbl">
        <thead><tr><th style={{width: 190}}>type</th><th style={{width: 150}}>from_balance</th><th style={{width: 130}}>to_balance</th><th>Description</th></tr></thead>
        <tbody>
          {TX_TYPES.map(t => {
            const m = TX_META[t.t];
            return (
              <tr key={t.t}>
                <td>
                  <div style={{display: "flex", alignItems: "center", gap: 6}}>
                    <Icon name={m.i} className="ic ic-sm" style={{color: m.c}}/>
                    <span className="mono" style={{fontSize: 11.5}}>{t.t}</span>
                  </div>
                </td>
                <td className="mono muted" style={{fontSize: 11}}>{t.from}</td>
                <td className="mono" style={{fontSize: 11, color: t.to === "voucher" ? "var(--acc-coach)" : t.to === "revenue" ? "var(--acc-mkt)" : "var(--fg-dim)"}}>{t.to}</td>
                <td className="muted" style={{fontSize: 11.5}}>{t.d}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </Card>

    <Card title="Invariants" sub="enforced at database level">
      <div className="col-gap" style={{gap: 6}}>
        {[
          "Subscription payment becomes a goodwill voucher — not e-money, no payout claim",
          "Voucher balance is not cashable and expires on cancellation",
          "Revenue balance exists only for creator and B2B wallets, payable via Stripe Connect",
          "Spend order is always voucher first, then revenue",
          "Every transaction is atomic — a single database transaction with row-level locking",
          "Neither balance can go negative — CHECK constraint, not application logic",
        ].map((r, i) => (
          <div key={i} style={{display: "flex", gap: 9, alignItems: "flex-start", padding: "9px 11px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6}}>
            <span className="num dim" style={{fontSize: 10, width: 14, flexShrink: 0}}>{i + 1}</span>
            <span style={{fontSize: 12, lineHeight: 1.45}}>{r}</span>
          </div>
        ))}
      </div>
    </Card>
  </div>
);

// ── Modals ────────────────────────────────────────────
const WModal = ({ title, sub, icon, accent, onClose, footer, children, width = 560 }) => (
  <div className="modal-veil" onClick={onClose}>
    <div className="modal" style={{width, maxHeight: "90vh"}} onClick={e => e.stopPropagation()}>
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

const TopUpModal = ({ onClose }) => {
  const [amt, setAmt] = useState(2500);
  const chips = [1000, 2500, 5000, 10000];
  return (
    <WModal title="Top up wallet" sub="Credited as voucher balance · Stripe" icon="plus" accent="var(--pos)" onClose={onClose}
      footer={<><button className="btn btn-ghost" onClick={onClose}>Cancel</button><button className="btn btn-primary">Pay €{eur(amt)} with Stripe</button></>}>
      <div className="eyebrow" style={{marginBottom: 8}}>Amount</div>
      <div style={{display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 12}}>
        {chips.map(c => (
          <button key={c} onClick={() => setAmt(c)} style={{
            padding: "14px 10px", borderRadius: 7, cursor: "pointer",
            background: amt === c ? "color-mix(in srgb, var(--pos) 12%, var(--surface))" : "var(--surface)",
            border: `1px solid ${amt === c ? "color-mix(in srgb, var(--pos) 38%, var(--border))" : "var(--border)"}`,
            color: amt === c ? "var(--pos)" : "var(--fg)",
          }}>
            <div className="num" style={{fontSize: 16, fontWeight: 600}}>€{c / 100}</div>
          </button>
        ))}
      </div>
      <div className="eyebrow" style={{marginBottom: 4}}>Custom amount</div>
      <div style={{position: "relative", marginBottom: 14}}>
        <input type="number" value={amt / 100} onChange={e => setAmt(Math.round(+e.target.value * 100))} style={{width: "100%", height: 34, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, padding: "0 32px 0 10px", fontSize: 13, fontFamily: "var(--font-mono)"}}/>
        <span className="dim mono" style={{position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", fontSize: 12}}>EUR</span>
      </div>
      <div className="col-gap" style={{gap: 0, marginBottom: 12}}>
        <Row label="Current voucher balance" value={"€" + eur(WALLET_STATE.voucher_cents)}/>
        <Row label="Top-up" value={"+ €" + eur(amt)}/>
        <Row label="After top-up" value={"€" + eur(WALLET_STATE.voucher_cents + amt)}/>
      </div>
      <div style={{padding: 11, background: "var(--surface)", borderRadius: 6, fontSize: 11.5, lineHeight: 1.5, color: "var(--fg-muted)"}}>
        Top-ups land in the voucher balance and are spent before any revenue. Like subscription credit, they carry no cash-out claim.
      </div>
    </WModal>
  );
};

const PayoutModal = ({ w, onClose }) => {
  const [amt, setAmt] = useState(50000);
  const over = amt > w.revenue_cents;
  return (
    <WModal title="Request payout" sub="Revenue balance → Stripe Connect" icon="download" onClose={onClose}
      footer={<><button className="btn btn-ghost" onClick={onClose}>Cancel</button><button className="btn btn-primary" disabled={over || amt <= 0}>Transfer €{eur(Math.max(0, amt))}</button></>}>
      <div className="grid g-cols-2" style={{gap: 10, marginBottom: 14}}>
        <div style={{padding: 12, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6}}>
          <div className="eyebrow" style={{marginBottom: 3}}>Revenue available</div>
          <div className="num" style={{fontSize: 18, color: "var(--acc-mkt)"}}>€{eur(w.revenue_cents)}</div>
        </div>
        <div style={{padding: 12, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6}}>
          <div className="eyebrow" style={{marginBottom: 3}}>Voucher · not payable</div>
          <div className="num dim" style={{fontSize: 18}}>€{eur(w.voucher_cents)}</div>
        </div>
      </div>
      <div className="eyebrow" style={{marginBottom: 4}}>Payout amount</div>
      <div style={{position: "relative", marginBottom: 6}}>
        <input type="number" value={amt / 100} onChange={e => setAmt(Math.round(+e.target.value * 100))} style={{width: "100%", height: 34, background: "var(--surface)", border: `1px solid ${over ? "var(--neg)" : "var(--border)"}`, borderRadius: 6, padding: "0 32px 0 10px", fontSize: 13, fontFamily: "var(--font-mono)"}}/>
        <span className="dim mono" style={{position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", fontSize: 12}}>EUR</span>
      </div>
      {over && <div style={{fontSize: 11, color: "var(--neg)", marginBottom: 10}}>Exceeds revenue balance by €{eur(amt - w.revenue_cents)}. Voucher balance cannot be paid out.</div>}
      <div style={{display: "flex", gap: 6, marginBottom: 14}}>
        {[10000, 25000, 50000, w.revenue_cents].map((c, i) => (
          <button key={i} onClick={() => setAmt(c)} className="btn btn-sm" style={{flex: 1}}>{i === 3 ? "All" : "€" + c / 100}</button>
        ))}
      </div>
      <div className="col-gap" style={{gap: 0, marginBottom: 12}}>
        <Row label="Destination" value="Stripe Connect · acct_1Nx…"/>
        <Row label="Bank account" value="DE89 •••• 3000"/>
        <Row label="Arrival" value="1–3 business days"/>
        <Row label="Revenue after payout" value={"€" + eur(Math.max(0, w.revenue_cents - amt))}/>
      </div>
      <div className="mono" style={{fontSize: 11, padding: 11, background: "var(--surface-2)", borderRadius: 6, lineHeight: 1.6, color: "var(--fg-muted)"}}>
        WalletTransaction{"{"} type: payout, from: creator (revenue, −€{eur(amt)}), to: null (Stripe) {"}"}
      </div>
    </WModal>
  );
};

const DebitSimModal = ({ w, onClose }) => {
  const [amt, setAmt] = useState(4900);
  const available = w.voucher_cents + w.revenue_cents;
  const insufficient = amt > available;
  const voucherDebit = Math.min(w.voucher_cents, amt);
  const revenueDebit = Math.max(0, amt - voucherDebit);
  return (
    <WModal title="Wallet debit simulator" sub="calcWalletDebit() — voucher first, then revenue" icon="bolt" accent="var(--acc-buddy)" onClose={onClose}
      footer={<button className="btn btn-ghost" onClick={onClose}>Close</button>}>
      <div className="eyebrow" style={{marginBottom: 4}}>Purchase amount</div>
      <div style={{position: "relative", marginBottom: 14}}>
        <input type="number" value={amt / 100} onChange={e => setAmt(Math.round(+e.target.value * 100))} style={{width: "100%", height: 34, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, padding: "0 32px 0 10px", fontSize: 13, fontFamily: "var(--font-mono)"}}/>
        <span className="dim mono" style={{position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", fontSize: 12}}>EUR</span>
      </div>
      <div style={{display: "flex", gap: 6, marginBottom: 16}}>
        {[2900, 4900, 9900, 200000].map(c => (
          <button key={c} onClick={() => setAmt(c)} className="btn btn-sm" style={{flex: 1}}>€{c / 100}</button>
        ))}
      </div>

      {insufficient ? (
        <div style={{padding: 14, background: "color-mix(in srgb, var(--neg) 8%, var(--surface))", border: "1px solid color-mix(in srgb, var(--neg) 30%, var(--border))", borderRadius: 7, marginBottom: 14}}>
          <div style={{display: "flex", alignItems: "center", gap: 8, marginBottom: 6}}>
            <Icon name="alert" className="ic" style={{color: "var(--neg)"}}/>
            <span style={{fontSize: 13, fontWeight: 600, color: "var(--neg)"}}>InsufficientFundsError</span>
          </div>
          <div className="muted" style={{fontSize: 11.5, lineHeight: 1.5}}>
            Available €{eur(available)}, requested €{eur(amt)} — short by <span className="num" style={{color: "var(--fg)"}}>€{eur(amt - available)}</span>. Checkout would show the top-up prompt.
          </div>
        </div>
      ) : (
        <>
          <div className="eyebrow" style={{marginBottom: 8}}>Debit split</div>
          <div style={{display: "flex", height: 34, borderRadius: 7, overflow: "hidden", border: "1px solid var(--border)", marginBottom: 12}}>
            {voucherDebit > 0 && (
              <div style={{flex: voucherDebit, background: "color-mix(in srgb, var(--acc-coach) 30%, var(--surface))", display: "grid", placeItems: "center", fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--fg)", minWidth: 60}}>
                voucher €{eur(voucherDebit)}
              </div>
            )}
            {revenueDebit > 0 && (
              <div style={{flex: revenueDebit, background: "color-mix(in srgb, var(--acc-mkt) 30%, var(--surface))", display: "grid", placeItems: "center", fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--fg)", minWidth: 60}}>
                revenue €{eur(revenueDebit)}
              </div>
            )}
          </div>
          <div className="mono" style={{fontSize: 11, padding: 12, background: "var(--surface-2)", borderRadius: 6, lineHeight: 1.8, color: "var(--fg-muted)"}}>
            available      = {w.voucher_cents} + {w.revenue_cents} = {available}<br/>
            voucherDebit   = min({w.voucher_cents}, {amt}) = <span style={{color: "var(--acc-coach)"}}>{voucherDebit}</span><br/>
            revenueDebit   = {amt} − {voucherDebit} = <span style={{color: "var(--acc-mkt)"}}>{revenueDebit}</span><br/>
            <span className="dim">─────────────────────────────</span><br/>
            new_voucher    = <span style={{color: "var(--fg)"}}>{w.voucher_cents - voucherDebit}</span> (€{eur(w.voucher_cents - voucherDebit)})<br/>
            new_revenue    = <span style={{color: "var(--fg)"}}>{w.revenue_cents - revenueDebit}</span> (€{eur(w.revenue_cents - revenueDebit)})
          </div>
        </>
      )}
    </WModal>
  );
};

Object.assign(window, { WALLET_STATE, WALLET_TXNS, TX_TYPES, WALLET_OWNER_TYPES, AI_CREDITS, eurFmt: eur });
