// Marketplace · Block C — Search scoring, goal match, fee matrix, bundle savings
// per SPEC_09 §1–§4, §7

const SCORE_WEIGHTS = [
  { k: "popularity",   w: 0.30, l: "Popularity",        d: "purchase_count / 20, capped at 100" },
  { k: "rating",       w: 0.20, l: "Rating · Bayesian", d: "weighted by review confidence against a prior of 70" },
  { k: "recency",      w: 0.10, l: "Recency",           d: "linear decay over 180 days" },
  { k: "personalized", w: 0.30, l: "Goal match",        d: "per-request, from your active goal phase" },
  { k: "diffBonus",    w: 0.10, l: "Difficulty match",  d: "10 points if it matches your level" },
];

const PHASE_TO_GOALS = {
  fat_loss:     ["fat_loss", "body_composition", "general"],
  lean_bulk:    ["muscle_gain", "strength", "performance"],
  maintenance:  ["general", "health", "lifestyle"],
  recomp:       ["muscle_gain", "fat_loss", "body_composition"],
  contest_prep: ["muscle_gain", "fat_loss", "performance"],
  reverse_diet: ["general", "health"],
};

const FEE_CONFIG = {
  digital:  { discovery: 0.20, coach: 0.10, promoted: 0.25 },
  physical: { discovery: 0.15, coach: 0.08, promoted: 0.20 },
  session:  { discovery: 0.20, coach: 0.10, promoted: 0.25 },
};

function calcGoalMatch(productGoals, phase, subtype) {
  const relevant = new Set([...(PHASE_TO_GOALS[phase] || ["general"]), subtype, "general"]);
  if (!productGoals || productGoals.length === 0) return 0.5;
  return productGoals.filter(g => relevant.has(g)).length / productGoals.length;
}

function calcSearchScore(p, phase, subtype, userDifficulty) {
  const popularity = Math.min(100, p.purchases / 20);
  const PRIOR_RATING = 70, PRIOR_COUNT = 10;
  const conf = p.reviews / (p.reviews + PRIOR_COUNT);
  const ratingW = (p.rating / 5) * 100 * conf + PRIOR_RATING * (1 - conf);
  const recency = Math.max(0, 100 - (p.created / 180) * 100);
  const gm = calcGoalMatch(p.goals, phase, subtype);
  const personalized = gm * 100;
  const diffMatch = p.difficulty === userDifficulty;
  const diffBonus = diffMatch ? 10 : 0;
  const promotedBonus = p.promoted ? 50 : 0;
  const base = popularity * 0.30 + ratingW * 0.20 + recency * 0.10 + personalized * 0.30 + diffBonus * 0.10;
  return {
    popularity, ratingW, recency, personalized, diffBonus, promotedBonus, gm, diffMatch,
    total: Math.min(200, Math.round(base + promotedBonus)),
    base: Math.round(base),
  };
}

function feeCategory(type) {
  if (type === "equipment") return "physical";
  if (type === "session") return "session";
  return "digital";
}

function calcFee(priceCents, type, traffic = "discovery", promoted = false) {
  const cat = feeCategory(type);
  const key = promoted ? "promoted" : traffic;
  const rate = FEE_CONFIG[cat]?.[key] ?? 0.20;
  return { rate, cat, key, fee: Math.round(priceCents * rate) };
}

const smoney = (c) => "€" + (c / 100).toFixed(2);

// ══ Scoring tab ═══════════════════════════════════════
window.MarketScoring = () => {
  const [phase, setPhase] = useState("recomp");
  const [subtype, setSubtype] = useState("body_composition");
  const [diff, setDiff] = useState("intermediate");
  const [sel, setSel] = useState("P-2201");
  const [sub, setSub] = useState("ranking");

  const catalog = window.CATALOG || [];
  const scored = catalog
    .map(p => ({ p, s: calcSearchScore(p, phase, subtype, diff) }))
    .sort((a, b) => b.s.total - a.s.total);
  const picked = scored.find(x => x.p.id === sel) || scored[0];

  return (
    <>
      <div style={{display: "flex", gap: 8, marginBottom: 14, alignItems: "center", flexWrap: "wrap"}}>
        <div style={{display: "flex", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, padding: 2, gap: 1}}>
          {[["ranking","Live ranking"],["breakdown","Score breakdown"],["fees","Fee matrix"],["bundle","Bundle savings"]].map(([k, l]) => (
            <button key={k} onClick={() => setSub(k)} className={sub === k ? "btn btn-primary" : "btn btn-ghost"} style={{height: 22, fontSize: 11, padding: "0 10px", borderRadius: 4}}>{l}</button>
          ))}
        </div>
      </div>

      {(sub === "ranking" || sub === "breakdown") && (
        <Card className="card-tight" style={{padding: 13, marginBottom: 14, background: "color-mix(in srgb, var(--acc-goals) 5%, var(--surface))", border: "1px solid color-mix(in srgb, var(--acc-goals) 22%, var(--border))"}}>
          <div style={{display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap"}}>
            <div className="eyebrow" style={{color: "var(--acc-goals)"}}>Personalisation inputs</div>
            <div style={{display: "flex", gap: 8, alignItems: "center"}}>
              <span className="dim" style={{fontSize: 11}}>Goal phase</span>
              <select value={phase} onChange={e => setPhase(e.target.value)} style={{height: 26, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 5, padding: "0 8px", fontSize: 11.5}}>
                {Object.keys(PHASE_TO_GOALS).map(k => <option key={k} value={k}>{k}</option>)}
              </select>
            </div>
            <div style={{display: "flex", gap: 8, alignItems: "center"}}>
              <span className="dim" style={{fontSize: 11}}>Subtype</span>
              <select value={subtype} onChange={e => setSubtype(e.target.value)} style={{height: 26, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 5, padding: "0 8px", fontSize: 11.5}}>
                {["body_composition","muscle_gain","fat_loss","strength","performance","health","general"].map(k => <option key={k}>{k}</option>)}
              </select>
            </div>
            <div style={{display: "flex", gap: 8, alignItems: "center"}}>
              <span className="dim" style={{fontSize: 11}}>Your level</span>
              <select value={diff} onChange={e => setDiff(e.target.value)} style={{height: 26, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 5, padding: "0 8px", fontSize: 11.5}}>
                {["beginner","intermediate","advanced"].map(k => <option key={k}>{k}</option>)}
              </select>
            </div>
            <span className="dim mono" style={{fontSize: 10.5, marginLeft: "auto"}}>relevant goals: {[...new Set([...(PHASE_TO_GOALS[phase] || []), subtype, "general"])].join(" · ")}</span>
          </div>
        </Card>
      )}

      {sub === "ranking" && (
        <Card title="Ranked results" sub="score recomputed live from the inputs above">
          <table className="tbl">
            <thead>
              <tr>
                <th style={{width: 36}}>#</th>
                <th>Product</th>
                <th style={{width: 110}}>Goal match</th>
                <th style={{width: 180}}>Score composition</th>
                <th style={{width: 70, textAlign: "right"}}>Base</th>
                <th style={{width: 70, textAlign: "right"}}>Boost</th>
                <th style={{width: 70, textAlign: "right"}}>Score</th>
              </tr>
            </thead>
            <tbody>
              {scored.map(({ p, s }, i) => (
                <tr key={p.id} className="clickable" style={{cursor: "pointer", background: p.id === sel ? "color-mix(in srgb, var(--acc-mkt) 6%, transparent)" : undefined}}
                    onClick={() => { setSel(p.id); setSub("breakdown"); }}>
                  <td className="num dim">{i + 1}</td>
                  <td>
                    <div style={{fontSize: 12.5, fontWeight: 500}}>{p.title}</div>
                    <div className="dim" style={{fontSize: 10}}>{p.creator.name} · {p.purchases.toLocaleString()} sold · {p.rating}★</div>
                  </td>
                  <td>
                    <div style={{display: "flex", alignItems: "center", gap: 6}}>
                      <div style={{flex: 1, height: 5, background: "var(--surface-2)", borderRadius: 999}}>
                        <div style={{height: "100%", width: (s.gm * 100) + "%", background: s.gm > 0.6 ? "var(--pos)" : s.gm > 0.3 ? "var(--warn)" : "var(--neg)", borderRadius: 999}}/>
                      </div>
                      <span className="num" style={{fontSize: 10.5, width: 30, textAlign: "right"}}>{Math.round(s.gm * 100)}%</span>
                    </div>
                  </td>
                  <td>
                    <div style={{display: "flex", height: 14, borderRadius: 3, overflow: "hidden", border: "1px solid var(--border)"}}>
                      {[
                        [s.popularity * 0.30, "var(--acc-mkt)"],
                        [s.ratingW * 0.20, "var(--acc-goals)"],
                        [s.recency * 0.10, "var(--acc-recov)"],
                        [s.personalized * 0.30, "var(--acc-coach)"],
                        [s.diffBonus * 0.10, "var(--acc-train)"],
                        [s.promotedBonus, "var(--neg)"],
                      ].filter(([v]) => v > 0.5).map(([v, c], j) => (
                        <div key={j} style={{flex: v, background: c, opacity: 0.75}}/>
                      ))}
                    </div>
                  </td>
                  <td className="num muted" style={{textAlign: "right"}}>{s.base}</td>
                  <td className="num" style={{textAlign: "right", color: s.promotedBonus ? "var(--neg)" : "var(--fg-dim)"}}>{s.promotedBonus ? "+" + s.promotedBonus : "—"}</td>
                  <td className="num" style={{textAlign: "right", fontSize: 14, fontWeight: 600}}>{s.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{display: "flex", gap: 14, marginTop: 12, flexWrap: "wrap", fontSize: 10.5, color: "var(--fg-muted)"}}>
            {[["Popularity","var(--acc-mkt)"],["Rating","var(--acc-goals)"],["Recency","var(--acc-recov)"],["Goal match","var(--acc-coach)"],["Difficulty","var(--acc-train)"],["Promoted","var(--neg)"]].map(([l, c]) => (
              <span key={l} style={{display: "inline-flex", alignItems: "center", gap: 5}}>
                <span style={{width: 9, height: 9, borderRadius: 2, background: c, opacity: 0.75}}/>{l}
              </span>
            ))}
          </div>
        </Card>
      )}

      {sub === "breakdown" && picked && (
        <div className="grid" style={{gridTemplateColumns: "1.4fr 1fr", gap: 14}}>
          <Card title={picked.p.title} sub="score derivation, term by term">
            <div className="col-gap" style={{gap: 9, marginBottom: 14}}>
              {[
                ["Popularity",       picked.s.popularity,   0.30, `${picked.p.purchases.toLocaleString()} purchases ÷ 20, capped at 100`],
                ["Rating · Bayesian",picked.s.ratingW,      0.20, `${picked.p.rating}★ over ${picked.p.reviews} reviews, confidence ${(picked.p.reviews / (picked.p.reviews + 10)).toFixed(2)}`],
                ["Recency",          picked.s.recency,      0.10, `${picked.p.created} days old, linear decay over 180`],
                ["Goal match",       picked.s.personalized, 0.30, `${picked.p.goals.filter(g => new Set([...(PHASE_TO_GOALS[phase] || []), subtype, "general"]).has(g)).length} of ${picked.p.goals.length} tags relevant to ${phase}`],
                ["Difficulty match", picked.s.diffBonus,    0.10, picked.s.diffMatch ? `${picked.p.difficulty} matches your level` : `${picked.p.difficulty || "n/a"} · no match`],
              ].map(([l, val, w, note]) => (
                <div key={l}>
                  <div style={{display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 4}}>
                    <span style={{fontSize: 12, fontWeight: 500}}>{l}</span>
                    <span className="num" style={{fontSize: 11.5}}>
                      <span className="dim">{val.toFixed(1)} × {w}</span> = <span style={{color: "var(--fg)", fontWeight: 600}}>{(val * w).toFixed(1)}</span>
                    </span>
                  </div>
                  <div style={{height: 6, background: "var(--surface-2)", borderRadius: 999, marginBottom: 3}}>
                    <div style={{height: "100%", width: Math.min(100, val) + "%", background: "var(--acc-mkt)", borderRadius: 999}}/>
                  </div>
                  <div className="dim" style={{fontSize: 10.5}}>{note}</div>
                </div>
              ))}
            </div>
            <div className="divider"/>
            <div className="mono" style={{fontSize: 11.5, padding: 12, background: "var(--surface-2)", borderRadius: 6, lineHeight: 1.8, color: "var(--fg-muted)"}}>
              base = {(picked.s.popularity * 0.30).toFixed(1)} + {(picked.s.ratingW * 0.20).toFixed(1)} + {(picked.s.recency * 0.10).toFixed(1)} + {(picked.s.personalized * 0.30).toFixed(1)} + {(picked.s.diffBonus * 0.10).toFixed(1)} = <span style={{color: "var(--fg)"}}>{picked.s.base}</span><br/>
              {picked.s.promotedBonus > 0 && <>promoted bonus = <span style={{color: "var(--neg)"}}>+{picked.s.promotedBonus}</span><br/></>}
              <span className="dim">─────────────────────────</span><br/>
              search_score = min(200, {picked.s.base}{picked.s.promotedBonus ? " + " + picked.s.promotedBonus : ""}) = <span style={{color: "var(--fg)", fontWeight: 600}}>{picked.s.total}</span>
            </div>
          </Card>
          <div className="col-gap" style={{gap: 14}}>
            <Card title="Weights" sub="fixed for every product">
              {SCORE_WEIGHTS.map(w => (
                <div key={w.k} style={{padding: "9px 0", borderBottom: "1px solid var(--border)"}}>
                  <div style={{display: "flex", justifyContent: "space-between", marginBottom: 2}}>
                    <span style={{fontSize: 12}}>{w.l}</span>
                    <span className="num" style={{fontSize: 12, fontWeight: 600}}>{w.w.toFixed(2)}</span>
                  </div>
                  <div className="dim" style={{fontSize: 10.5, lineHeight: 1.4}}>{w.d}</div>
                </div>
              ))}
              <div style={{padding: "9px 0"}}>
                <div style={{display: "flex", justifyContent: "space-between", marginBottom: 2}}>
                  <span style={{fontSize: 12}}>Promoted bonus</span>
                  <span className="num" style={{fontSize: 12, fontWeight: 600, color: "var(--neg)"}}>+50</span>
                </div>
                <div className="dim" style={{fontSize: 10.5}}>added flat, not multiplied · score capped at 200</div>
              </div>
            </Card>
            <Card title="Phase → goal map" sub="which tags count as relevant">
              {Object.entries(PHASE_TO_GOALS).map(([k, v]) => (
                <div key={k} style={{padding: "7px 0", borderBottom: "1px solid var(--border)"}}>
                  <div className="mono" style={{fontSize: 11, marginBottom: 3, color: k === phase ? "var(--acc-goals)" : "var(--fg)"}}>{k}{k === phase && " ← active"}</div>
                  <div style={{display: "flex", gap: 4, flexWrap: "wrap"}}>{v.map(g => <Pill key={g} style={{fontSize: 9.5}}>{g}</Pill>)}</div>
                </div>
              ))}
            </Card>
          </div>
        </div>
      )}

      {sub === "fees" && <FeeMatrix/>}
      {sub === "bundle" && <BundleSavings/>}
    </>
  );
};

const FeeMatrix = () => {
  const [price, setPrice] = useState(4900);
  const [type, setType] = useState("bundle");
  const [traffic, setTraffic] = useState("discovery");
  const [promoted, setPromoted] = useState(false);
  const [share, setShare] = useState(80);

  const { rate, cat, key, fee } = calcFee(price, type, traffic, promoted);
  const net = price - fee;
  const creator = Math.round(net * (share / 100));
  const lumeos = price - creator;

  return (
    <div className="grid" style={{gridTemplateColumns: "1fr 1.3fr", gap: 14}}>
      <Card title="Fee calculator" sub="calcFee() + calcCreatorRevenue()">
        <div className="col-gap" style={{gap: 12}}>
          <div>
            <div className="eyebrow" style={{marginBottom: 4}}>Sale price</div>
            <div style={{position: "relative"}}>
              <input type="number" value={price / 100} onChange={e => setPrice(Math.round(+e.target.value * 100))} style={{width: "100%", height: 32, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, padding: "0 34px 0 10px", fontSize: 12.5, fontFamily: "var(--font-mono)"}}/>
              <span className="dim mono" style={{position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", fontSize: 11}}>EUR</span>
            </div>
          </div>
          <div>
            <div className="eyebrow" style={{marginBottom: 4}}>Product type</div>
            <select value={type} onChange={e => setType(e.target.value)} style={{width: "100%", height: 32, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, padding: "0 10px", fontSize: 12}}>
              {(window.PRODUCT_TYPES || []).map(t => <option key={t.t} value={t.t}>{t.l} → {feeCategory(t.t)}</option>)}
            </select>
          </div>
          <div>
            <div className="eyebrow" style={{marginBottom: 4}}>Traffic source</div>
            <div style={{display: "flex", gap: 6}}>
              {[["discovery","Discovery"],["coach","Coach referral"]].map(([k, l]) => (
                <button key={k} onClick={() => setTraffic(k)} className={traffic === k ? "btn btn-primary" : "btn"} style={{flex: 1, height: 30, fontSize: 11.5}}>{l}</button>
              ))}
            </div>
          </div>
          <div>
            <div className="eyebrow" style={{marginBottom: 4}}>Promoted listing</div>
            <div style={{display: "flex", gap: 6}}>
              {[[false,"No"],[true,"Yes · higher rate"]].map(([k, l]) => (
                <button key={String(k)} onClick={() => setPromoted(k)} className={promoted === k ? "btn btn-primary" : "btn"} style={{flex: 1, height: 30, fontSize: 11.5}}>{l}</button>
              ))}
            </div>
          </div>
          <div>
            <div className="eyebrow" style={{marginBottom: 4}}>Creator revenue share</div>
            <div style={{display: "flex", gap: 6}}>
              {[75, 80, 85, 90].map(s => (
                <button key={s} onClick={() => setShare(s)} className={share === s ? "btn btn-primary" : "btn"} style={{flex: 1, height: 30, fontSize: 11.5}}>{s}%</button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      <div className="col-gap" style={{gap: 14}}>
        <Card title="Split" sub={`${cat} · ${key} · ${(rate * 100).toFixed(0)}%`}>
          <div style={{display: "flex", height: 40, borderRadius: 7, overflow: "hidden", border: "1px solid var(--border)", marginBottom: 12}}>
            <div style={{flex: creator, background: "color-mix(in srgb, var(--pos) 28%, var(--surface))", display: "grid", placeItems: "center", fontSize: 11.5, fontFamily: "var(--font-mono)"}}>
              creator {smoney(creator)}
            </div>
            <div style={{flex: lumeos, background: "color-mix(in srgb, var(--acc-mkt) 28%, var(--surface))", display: "grid", placeItems: "center", fontSize: 11.5, fontFamily: "var(--font-mono)", minWidth: 80}}>
              LumeOS {smoney(lumeos)}
            </div>
          </div>
          <div className="col-gap" style={{gap: 0}}>
            <Row label="Gross" value={smoney(price)}/>
            <Row label={`Platform fee · ${(rate * 100).toFixed(0)}%`} value={"− " + smoney(fee)}/>
            <Row label="Net after fee" value={smoney(net)}/>
            <Row label={`Creator share · ${share}%`} value={smoney(creator)}/>
            <Row label="LumeOS total" value={smoney(lumeos)}/>
          </div>
          <div className="mono" style={{fontSize: 11, padding: 11, background: "var(--surface-2)", borderRadius: 6, lineHeight: 1.7, color: "var(--fg-muted)", marginTop: 12}}>
            fee = round({price} × {rate}) = {fee}<br/>
            net = {price} − {fee} = {net}<br/>
            creator = round({net} × {share / 100}) = <span style={{color: "var(--pos)"}}>{creator}</span>
          </div>
        </Card>

        <Card title="Rate matrix" sub="SPEC_05 §4">
          <table className="tbl">
            <thead><tr><th>Category</th><th style={{width: 100, textAlign: "right"}}>Discovery</th><th style={{width: 100, textAlign: "right"}}>Coach</th><th style={{width: 100, textAlign: "right"}}>Promoted</th></tr></thead>
            <tbody>
              {Object.entries(FEE_CONFIG).map(([c, r]) => (
                <tr key={c} style={c === cat ? {background: "color-mix(in srgb, var(--acc-mkt) 6%, transparent)"} : undefined}>
                  <td className="mono" style={{fontSize: 11.5}}>{c}{c === cat && <Pill variant="acc" style={{marginLeft: 6}}>active</Pill>}</td>
                  {["discovery","coach","promoted"].map(k => (
                    <td key={k} className="num" style={{textAlign: "right", color: c === cat && k === key ? "var(--acc-mkt)" : "var(--fg)", fontWeight: c === cat && k === key ? 600 : 400}}>
                      {r[k] ? (r[k] * 100).toFixed(0) + "%" : "—"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <div className="dim" style={{fontSize: 11, marginTop: 10, lineHeight: 1.5}}>
            Coach referrals carry the lowest rate — a coach bringing their own client keeps more. Promoted listings pay five points more on top of the base rate.
          </div>
        </Card>
      </div>
    </div>
  );
};

const BundleSavings = () => {
  const bundles = (window.CATALOG || []).filter(p => p.components);
  return (
    <div className="col-gap" style={{gap: 14}}>
      {bundles.map(b => {
        const total = b.components.reduce((s, c) => s + c.price, 0);
        const savings = total - b.price;
        const pct = Math.round((savings / total) * 100);
        return (
          <Card key={b.id} title={b.title} sub={`${b.components.length} components · calcBundleSavings()`}>
            <div className="grid" style={{gridTemplateColumns: "1.4fr 1fr", gap: 16}}>
              <div>
                <div className="col-gap" style={{gap: 6, marginBottom: 12}}>
                  {b.components.map(c => {
                    const m = (window.PRODUCT_TYPES || []).find(t => t.t === c.type) || { l: c.type, icon: "marketplace" };
                    return (
                      <div key={c.type} style={{display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6}}>
                        <Icon name={m.icon} className="ic ic-sm" style={{color: "var(--acc-mkt)"}}/>
                        <span style={{fontSize: 12, flex: 1}}>{c.title}</span>
                        <span className="num" style={{fontSize: 12}}>{smoney(c.price)}</span>
                      </div>
                    );
                  })}
                </div>
                <div style={{display: "flex", height: 34, borderRadius: 7, overflow: "hidden", border: "1px solid var(--border)"}}>
                  <div style={{flex: b.price, background: "color-mix(in srgb, var(--acc-mkt) 26%, var(--surface))", display: "grid", placeItems: "center", fontSize: 11, fontFamily: "var(--font-mono)"}}>
                    you pay {smoney(b.price)}
                  </div>
                  <div style={{flex: savings, background: "color-mix(in srgb, var(--pos) 26%, var(--surface))", display: "grid", placeItems: "center", fontSize: 11, fontFamily: "var(--font-mono)"}}>
                    saved {smoney(savings)}
                  </div>
                </div>
              </div>
              <div>
                <div className="col-gap" style={{gap: 0, marginBottom: 12}}>
                  <Row label="Individual total" value={smoney(total)}/>
                  <Row label="Bundle price" value={smoney(b.price)}/>
                  <Row label="Savings" value={smoney(savings)}/>
                  <Row label="Savings percent" value={pct + "%"}/>
                </div>
                <div className="mono" style={{fontSize: 11, padding: 11, background: "var(--surface-2)", borderRadius: 6, lineHeight: 1.7, color: "var(--fg-muted)"}}>
                  individual_total = {b.components.map(c => c.price).join(" + ")} = {total}<br/>
                  savings = {total} − {b.price} = <span style={{color: "var(--pos)"}}>{savings}</span><br/>
                  savings_pct = round({savings} / {total} × 100) = <span style={{color: "var(--pos)"}}>{pct}%</span>
                </div>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

Object.assign(window, { calcSearchScore, calcGoalMatch, calcFee, FEE_CONFIG, PHASE_TO_GOALS, SCORE_WEIGHTS });
