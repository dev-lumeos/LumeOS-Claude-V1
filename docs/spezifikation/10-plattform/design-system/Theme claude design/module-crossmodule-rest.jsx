// Cross-module remainder
// Recovery stress tab · Goals photo upload · Marketplace wallet · Auth walkthrough

// ── Recovery · stress ────────────────────────────────────────
const STRESS_TODAY = { score: 44, band: "moderate", hrvImpact: -4, trend: "up" };
const STRESS_SOURCES = [
  { k: "Work load",        v: 62, note: "Two deadlines this week" },
  { k: "Sleep debt",       v: 48, note: "1.6 h short across 5 nights" },
  { k: "Training load",    v: 55, note: "ACWR 1.08 — inside the window" },
  { k: "Life events",      v: 20, note: "Nothing logged" },
  { k: "Caffeine timing",  v: 51, note: "200 mg at 17:30 on training days" },
  { k: "Alcohol",          v: 5,  note: "None in 14 days" },
];
const STRESS_BANDS = [
  { to: 25,  label: "Low",       color: "var(--pos)",  desc: "Full training capacity" },
  { to: 50,  label: "Moderate",  color: "var(--acc-recov)", desc: "Normal load, watch sleep" },
  { to: 75,  label: "Elevated",  color: "var(--warn)", desc: "Cut volume 10–20 %" },
  { to: 100, label: "High",      color: "var(--neg)",  desc: "Deload or rest day" },
];
const STRESS_14D = [38, 41, 36, 44, 52, 48, 42, 39, 45, 51, 47, 43, 46, 44];

window.RecoveryStress = () => (
  <div className="grid" style={{gridTemplateColumns: "1.4fr 1fr", gap: 16}}>
    <div className="col-gap" style={{gap: 14}}>
      <Card>
        <div style={{display: "flex", gap: 18, alignItems: "center", marginBottom: 14}}>
          <Ring value={STRESS_TODAY.score} max={100} color="var(--acc-recov)" label="stress" size={112} stroke={8}/>
          <div style={{flex: 1}}>
            <div className="eyebrow" style={{marginBottom: 5}}>Today · {STRESS_TODAY.band}</div>
            <div style={{fontSize: 15, fontWeight: 600, marginBottom: 6}}>Inside the working range</div>
            <div className="muted" style={{fontSize: 12, lineHeight: 1.55}}>
              Work pressure is the main contributor this week. It costs about {Math.abs(STRESS_TODAY.hrvImpact)} ms of overnight HRV,
              which is enough to notice but not enough to change the plan.
            </div>
          </div>
        </div>
        <div style={{position: "relative", height: 26, borderRadius: 5, overflow: "hidden", display: "flex", border: "1px solid var(--border)"}}>
          {STRESS_BANDS.map((b, i) => {
            const from = i === 0 ? 0 : STRESS_BANDS[i - 1].to;
            return (
              <div key={b.label} style={{flex: b.to - from, background: b.color, opacity: 0.4, display: "grid", placeItems: "center", fontSize: 9.5, fontFamily: "var(--font-mono)", color: "var(--bg)", fontWeight: 600}}>
                {b.label.toUpperCase()}
              </div>
            );
          })}
          <div style={{position: "absolute", left: `${STRESS_TODAY.score}%`, top: -3, bottom: -3, width: 2, background: "var(--fg)", boxShadow: "0 0 0 2px var(--bg)"}}/>
        </div>
        <div style={{display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 9.5, color: "var(--fg-dim)", fontFamily: "var(--font-mono)"}}>
          <span>0</span><span>25</span><span>50</span><span>75</span><span>100</span>
        </div>
      </Card>

      <Card title="Contributors" sub="what the score is made of">
        <div className="col-gap" style={{gap: 9}}>
          {STRESS_SOURCES.map(s => (
            <div key={s.k} style={{display: "grid", gridTemplateColumns: "130px 1fr 40px", gap: 10, alignItems: "center"}}>
              <div>
                <div style={{fontSize: 12}}>{s.k}</div>
                <div className="dim" style={{fontSize: 10}}>{s.note}</div>
              </div>
              <Meter value={s.v} color={s.v >= 60 ? "var(--warn)" : s.v >= 40 ? "var(--acc-recov)" : "var(--pos)"}/>
              <span className="num" style={{textAlign: "right", fontSize: 11.5}}>{s.v}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card title="14 days">
        <LineChart h={160} range={[25, 65]} xLabels={["", "", "", "", "May 8", "", "", "", "", "", "", "", "", "today"]}
          series={[{ data: STRESS_14D, color: "var(--acc-recov)" }]}/>
        <div style={{display: "flex", gap: 16, marginTop: 8, fontSize: 11, color: "var(--fg-muted)"}}>
          <span>Average <span className="num" style={{color: "var(--fg)"}}>44</span></span>
          <span>Peak <span className="num" style={{color: "var(--warn)"}}>52 · May 9</span></span>
          <span className="dim">Trend flat over the fortnight</span>
        </div>
      </Card>
    </div>

    <div className="col-gap" style={{gap: 14}}>
      <Card title="Log stress" sub="one tap, feeds the score">
        <div className="eyebrow" style={{marginBottom: 6}}>Right now</div>
        <div style={{display: "flex", gap: 3, marginBottom: 12}}>
          {Array.from({length: 10}).map((_, i) => (
            <button key={i} style={{
              flex: 1, height: 30, borderRadius: 4, cursor: "pointer",
              background: i < 4 ? "color-mix(in srgb, var(--acc-recov) 25%, transparent)" : "var(--surface-2)",
              border: `1px solid ${i === 3 ? "var(--acc-recov)" : "var(--border)"}`,
              color: i < 4 ? "var(--acc-recov)" : "var(--fg-dim)", fontFamily: "var(--font-mono)", fontSize: 10,
            }}>{i + 1}</button>
          ))}
        </div>
        <div className="eyebrow" style={{marginBottom: 6}}>Source</div>
        <div style={{display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 12}}>
          {["Work", "Sleep", "Training", "Family", "Travel", "Illness", "Money", "Other"].map(t => (
            <button key={t} className="pill" style={{cursor: "pointer", padding: "4px 10px", fontSize: 11}}>{t}</button>
          ))}
        </div>
        <button className="btn btn-primary" style={{width: "100%"}}><Icon name="check" className="ic ic-sm"/>Log</button>
      </Card>
      <Card title="What helps you" sub="from your own data">
        <div className="col-gap" style={{gap: 5}}>
          {[["Sauna", -9], ["Easy walk", -6], ["Cold plunge", -4], ["Meditation", -3], ["Extra hour of sleep", -11]].map(([k, v]) => (
            <div key={k} style={{display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 5, fontSize: 11.5}}>
              <span style={{flex: 1}}>{k}</span>
              <span className="num" style={{color: "var(--pos)"}}>{v} pts</span>
            </div>
          ))}
        </div>
        <div className="divider"/>
        <div className="muted" style={{fontSize: 11, lineHeight: 1.5}}>
          Average change in next-day stress score when logged. Sleep is the biggest lever by a clear margin.
        </div>
      </Card>
    </div>
  </div>
);

// ── Goals · photo upload ─────────────────────────────────────
window.PhotoUploadPanel = () => {
  const [poses, setPoses] = useState({ front: null, side: null, back: null });
  const pick = key => {
    const inp = document.createElement("input");
    inp.type = "file"; inp.accept = "image/*";
    inp.onchange = () => {
      const f = inp.files && inp.files[0];
      if (f) setPoses(p => ({ ...p, [key]: URL.createObjectURL(f) }));
    };
    inp.click();
  };
  const done = Object.values(poses).filter(Boolean).length;
  return (
    <Card title="New photo session" sub={`${done} of 3 captured · same light, same distance, same time of day`}
      actions={<button className="btn btn-sm" disabled={done === 0} onClick={() => setPoses({front: null, side: null, back: null})}>Clear</button>}>
      <div style={{display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 12}}>
        {["front", "side", "back"].map(k => (
          <div key={k} onClick={() => pick(k)} style={{
            aspectRatio: "9/16", borderRadius: 7, cursor: "pointer", overflow: "hidden", position: "relative",
            background: poses[k] ? "var(--surface-2)" : "var(--surface)",
            border: `1px ${poses[k] ? "solid" : "dashed"} ${poses[k] ? "var(--acc-goals)" : "var(--border)"}`,
          }}>
            {poses[k] ? (
              <>
                <img src={poses[k]} alt={k} style={{width: "100%", height: "100%", objectFit: "cover"}}/>
                <div style={{position: "absolute", bottom: 0, left: 0, right: 0, padding: "6px 8px", background: "linear-gradient(transparent, rgba(0,0,0,0.75))", fontSize: 10.5, textTransform: "capitalize", color: "#fff", fontFamily: "var(--font-mono)"}}>{k}</div>
              </>
            ) : (
              <div style={{position: "absolute", inset: 0, display: "grid", placeItems: "center", textAlign: "center", padding: 10}}>
                <div>
                  <Icon name="camera" className="ic" style={{width: 20, height: 20, color: "var(--fg-dim)", marginBottom: 6}}/>
                  <div style={{fontSize: 11, textTransform: "capitalize", marginBottom: 2}}>{k}</div>
                  <div className="dim" style={{fontSize: 10}}>tap to upload</div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      <div style={{display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 12}}>
        <div><div className="eyebrow" style={{marginBottom: 4}}>Date</div><input type="date" defaultValue="2026-05-16" style={{width: "100%", height: 30, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, padding: "0 10px", fontSize: 12}}/></div>
        <div><div className="eyebrow" style={{marginBottom: 4}}>Weight</div><input defaultValue="79.4" style={{width: "100%", height: 30, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, padding: "0 10px", fontSize: 12}}/></div>
        <div><div className="eyebrow" style={{marginBottom: 4}}>Body fat</div><input defaultValue="13.8" style={{width: "100%", height: 30, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, padding: "0 10px", fontSize: 12}}/></div>
      </div>
      <div style={{padding: 10, background: "var(--surface)", borderRadius: 6, fontSize: 11, color: "var(--fg-muted)", lineHeight: 1.5, marginBottom: 12}}>
        <Icon name="shield" className="ic ic-sm" style={{display: "inline", verticalAlign: "middle", marginRight: 5, color: "var(--pos)"}}/>
        Encrypted at rest. Not visible to any coach unless you attach the session to a shared goal.
      </div>
      <button className="btn btn-primary" style={{width: "100%"}} disabled={done < 3}>
        <Icon name="check" className="ic ic-sm"/>{done < 3 ? `${3 - done} pose${done === 2 ? "" : "s"} left` : "Save session"}
      </button>
    </Card>
  );
};

// ── Marketplace · wallet ─────────────────────────────────────
const WALLET = { balance: 142.5, pending: 38.5, currency: "€", locked: 0 };
const WALLET_TX = [
  { at: "2026-05-12", type: "purchase", desc: "Whey Isolate · ESN",              amount: -62.00, status: "settled",  ref: "O-2415" },
  { at: "2026-05-12", type: "purchase", desc: "Magnesium Glycinate · Pure Enc.", amount: -19.00, status: "settled",  ref: "O-2415" },
  { at: "2026-05-10", type: "payout",   desc: "Plan sales · 5/3/1 BBB (4×)",     amount: 132.60, status: "settled",  ref: "P-0088" },
  { at: "2026-05-08", type: "fee",      desc: "Marketplace take · 15 %",         amount: -23.40, status: "settled",  ref: "P-0088" },
  { at: "2026-04-28", type: "purchase", desc: "Nordic Naturals Omega-3",          amount: -38.50, status: "pending",  ref: "O-2398" },
  { at: "2026-04-14", type: "purchase", desc: "12-week Hypertrophy Plan",         amount: -49.00, status: "settled",  ref: "O-2387" },
];

window.MarketWallet = () => (
  <div className="grid" style={{gridTemplateColumns: "1.4fr 1fr", gap: 16}}>
    <div className="col-gap" style={{gap: 14}}>
      <div style={{display: "flex", gap: 12, padding: 14, background: "color-mix(in srgb, var(--acc-mkt) 5%, var(--surface))", border: "1px solid color-mix(in srgb, var(--acc-mkt) 22%, var(--border))", borderRadius: 8}}>
        <Icon name="marketplace" className="ic" style={{color: "var(--acc-mkt)", flexShrink: 0, marginTop: 2}}/>
        <div style={{flex: 1}}>
          <div style={{fontSize: 13, fontWeight: 600, marginBottom: 4}}>Closed economy</div>
          <div className="muted" style={{fontSize: 11.5, lineHeight: 1.55}}>
            Money moves only between verified accounts inside LumeOS. Sellers are vetted, payouts are held until delivery confirms,
            and the 15 % take funds the platform rather than advertising.
          </div>
        </div>
      </div>

      <Card title="Balance">
        <div style={{display: "flex", gap: 20, alignItems: "baseline", marginBottom: 14}}>
          <div>
            <div className="eyebrow" style={{marginBottom: 4}}>Available</div>
            <div className="num" style={{fontSize: 30, fontWeight: 500}}>{WALLET.currency}{WALLET.balance.toFixed(2)}</div>
          </div>
          <div>
            <div className="eyebrow" style={{marginBottom: 4}}>Pending</div>
            <div className="num" style={{fontSize: 18, color: "var(--warn)"}}>{WALLET.currency}{WALLET.pending.toFixed(2)}</div>
          </div>
          <div>
            <div className="eyebrow" style={{marginBottom: 4}}>Locked in escrow</div>
            <div className="num" style={{fontSize: 18, color: "var(--fg-dim)"}}>{WALLET.currency}{WALLET.locked.toFixed(2)}</div>
          </div>
          <div style={{marginLeft: "auto", display: "flex", gap: 6}}>
            <button className="btn"><Icon name="plus" className="ic ic-sm"/>Top up</button>
            <button className="btn btn-ghost">Withdraw</button>
          </div>
        </div>
        <div className="muted" style={{fontSize: 11, lineHeight: 1.5}}>
          Pending clears when the order is marked delivered — seven days for physical goods, immediately for plans.
        </div>
      </Card>

      <Card title="Transactions" sub={`${WALLET_TX.length} · last 60 days`}>
        <table className="tbl">
          <thead><tr><th style={{width: 100}}>Date</th><th style={{width: 90}}>Type</th><th>Description</th><th style={{width: 90}}>Ref</th><th style={{width: 90}}>Status</th><th style={{width: 90, textAlign: "right"}}>Amount</th></tr></thead>
          <tbody>
            {WALLET_TX.map((t, i) => (
              <tr key={i}>
                <td className="num muted">{t.at}</td>
                <td><Pill style={{fontSize: 9.5, color: t.type === "payout" ? "var(--pos)" : t.type === "fee" ? "var(--fg-dim)" : "var(--fg-muted)"}}>{t.type}</Pill></td>
                <td style={{fontSize: 12}}>{t.desc}</td>
                <td className="mono dim" style={{fontSize: 10.5}}>{t.ref}</td>
                <td><Pill variant={t.status === "settled" ? "pos" : "warn"}>{t.status}</Pill></td>
                <td className="num" style={{textAlign: "right", color: t.amount > 0 ? "var(--pos)" : "var(--fg)"}}>
                  {t.amount > 0 ? "+" : ""}{t.amount.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>

    <div className="col-gap" style={{gap: 14}}>
      <Card title="How a purchase settles" sub="closed-loop flow">
        <div className="col-gap" style={{gap: 0}}>
          {[
            ["1", "You confirm", "Funds move from balance to escrow"],
            ["2", "Seller ships", "Escrow holds · seller sees it as pending"],
            ["3", "Delivery confirmed", "Escrow releases to the seller"],
            ["4", "Platform take", "15 % deducted at release, not at purchase"],
            ["5", "Payout window", "Seller withdraws weekly or holds balance"],
          ].map(([n, t, d], i) => (
            <div key={n} style={{display: "flex", gap: 10, padding: "10px 0", borderBottom: i < 4 ? "1px solid var(--border)" : "none"}}>
              <div style={{width: 20, height: 20, borderRadius: 999, background: "var(--acc-mkt)", color: "var(--bg)", display: "grid", placeItems: "center", fontSize: 10, fontWeight: 600, flexShrink: 0}}>{n}</div>
              <div>
                <div style={{fontSize: 12, fontWeight: 500, marginBottom: 2}}>{t}</div>
                <div className="muted" style={{fontSize: 11, lineHeight: 1.4}}>{d}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>
      <Card title="Verification" sub="who may sell">
        <Row label="Business registration" value="required"/>
        <Row label="Product certificates" value="required · supplements"/>
        <Row label="Coach credentials" value="required · coaching"/>
        <Row label="Return policy" value="14 days · mandatory"/>
        <Row label="Sellers rejected 2026" value="41 of 118 applications"/>
      </Card>
    </div>
  </div>
);

Object.assign(window, { STRESS_SOURCES, WALLET, WALLET_TX });
