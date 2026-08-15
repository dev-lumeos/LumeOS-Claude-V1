// Supplements · Injection Planner — site rotation, volume limits, needle guidance, log

// ── Injection sites (IM + SubQ) ────────────────────────────
// x/y are % coords on a 100×120 body outline (front view; back sites flagged)
const INJ_SITES = [
  { id: "glute_l",  name: "Gluteus L",      short: "GL", route: "im",   maxMl: 3.0, restDays: 7,  view: "back",  x: 38, y: 55, needle: "23G × 1.5\"", note: "Ventro-dorsal upper outer quadrant" },
  { id: "glute_r",  name: "Gluteus R",      short: "GR", route: "im",   maxMl: 3.0, restDays: 7,  view: "back",  x: 62, y: 55, needle: "23G × 1.5\"", note: "Ventro-dorsal upper outer quadrant" },
  { id: "vglute_l", name: "Ventroglutal L", short: "VL", route: "im",   maxMl: 2.5, restDays: 7,  view: "front", x: 33, y: 52, needle: "23G × 1.25\"", note: "Safest IM site · no sciatic risk" },
  { id: "vglute_r", name: "Ventroglutal R", short: "VR", route: "im",   maxMl: 2.5, restDays: 7,  view: "front", x: 67, y: 52, needle: "23G × 1.25\"", note: "Safest IM site · no sciatic risk" },
  { id: "quad_l",   name: "Quad L",         short: "QL", route: "im",   maxMl: 2.0, restDays: 5,  view: "front", x: 37, y: 74, needle: "25G × 1\"",   note: "Vastus lateralis · outer third" },
  { id: "quad_r",   name: "Quad R",         short: "QR", route: "im",   maxMl: 2.0, restDays: 5,  view: "front", x: 63, y: 74, needle: "25G × 1\"",   note: "Vastus lateralis · outer third" },
  { id: "delt_l",   name: "Deltoid L",      short: "DL", route: "im",   maxMl: 1.0, restDays: 5,  view: "front", x: 19, y: 27, needle: "25G × 1\"",   note: "3 finger-widths below acromion" },
  { id: "delt_r",   name: "Deltoid R",      short: "DR", route: "im",   maxMl: 1.0, restDays: 5,  view: "front", x: 81, y: 27, needle: "25G × 1\"",   note: "3 finger-widths below acromion" },
  { id: "lat_l",    name: "Lat L",          short: "LL", route: "im",   maxMl: 1.5, restDays: 7,  view: "back",  x: 24, y: 40, needle: "25G × 1\"",   note: "Advanced site · thin muscle" },
  { id: "lat_r",    name: "Lat R",          short: "LR", route: "im",   maxMl: 1.5, restDays: 7,  view: "back",  x: 76, y: 40, needle: "25G × 1\"",   note: "Advanced site · thin muscle" },
  { id: "abd_l",    name: "Abdomen L",      short: "AL", route: "subq", maxMl: 1.0, restDays: 3,  view: "front", x: 42, y: 44, needle: "29G × 0.5\"", note: "2 cm from navel · pinch fold" },
  { id: "abd_r",    name: "Abdomen R",      short: "AR", route: "subq", maxMl: 1.0, restDays: 3,  view: "front", x: 58, y: 44, needle: "29G × 0.5\"", note: "2 cm from navel · pinch fold" },
  { id: "sq_delt_l",name: "SubQ Delt L",    short: "SL", route: "subq", maxMl: 0.5, restDays: 3,  view: "front", x: 15, y: 33, needle: "29G × 0.5\"", note: "Posterior upper arm fat pad" },
  { id: "sq_delt_r",name: "SubQ Delt R",    short: "SR", route: "subq", maxMl: 0.5, restDays: 3,  view: "front", x: 85, y: 33, needle: "29G × 0.5\"", note: "Posterior upper arm fat pad" },
  { id: "thigh_sq_l",name:"SubQ Thigh L",   short: "TL", route: "subq", maxMl: 1.0, restDays: 3,  view: "front", x: 31, y: 66, needle: "29G × 0.5\"", note: "Anterolateral fat pad" },
  { id: "thigh_sq_r",name:"SubQ Thigh R",   short: "TR", route: "subq", maxMl: 1.0, restDays: 3,  view: "front", x: 69, y: 66, needle: "29G × 0.5\"", note: "Anterolateral fat pad" },
];

// Injection log — most recent first. daysAgo drives rotation state.
const INJ_LOG = [
  { id: "i1",  date: "2026-08-14", site: "glute_r",  compound: "Testosterone Cypionate", ml: 0.6, mg: 150, route: "im",   needle: "23G × 1.5\"", pain: 1, notes: "" , daysAgo: 1 },
  { id: "i2",  date: "2026-08-12", site: "abd_l",    compound: "HCG",                    ml: 0.3, mg: null, route: "subq", needle: "29G × 0.5\"", pain: 0, notes: "500 IU", daysAgo: 3 },
  { id: "i3",  date: "2026-08-11", site: "glute_l",  compound: "Testosterone Cypionate", ml: 0.6, mg: 150, route: "im",   needle: "23G × 1.5\"", pain: 1, notes: "" , daysAgo: 4 },
  { id: "i4",  date: "2026-08-09", site: "abd_r",    compound: "HCG",                    ml: 0.3, mg: null, route: "subq", needle: "29G × 0.5\"", pain: 0, notes: "500 IU", daysAgo: 6 },
  { id: "i5",  date: "2026-08-08", site: "vglute_r", compound: "BPC-157",                ml: 0.25, mg: 0.25, route: "subq", needle: "29G × 0.5\"", pain: 0, notes: "near elbow site", daysAgo: 7 },
  { id: "i6",  date: "2026-08-07", site: "quad_l",   compound: "Testosterone Cypionate", ml: 0.6, mg: 150, route: "im",   needle: "25G × 1\"",  pain: 2, notes: "slight soreness 24h", daysAgo: 8 },
  { id: "i7",  date: "2026-08-05", site: "abd_l",    compound: "HCG",                    ml: 0.3, mg: null, route: "subq", needle: "29G × 0.5\"", pain: 0, notes: "", daysAgo: 10 },
  { id: "i8",  date: "2026-08-04", site: "vglute_l", compound: "Testosterone Cypionate", ml: 0.6, mg: 150, route: "im",   needle: "23G × 1.25\"", pain: 1, notes: "", daysAgo: 11 },
  { id: "i9",  date: "2026-08-02", site: "delt_r",   compound: "BPC-157",                ml: 0.25, mg: 0.25, route: "subq", needle: "29G × 0.5\"", pain: 1, notes: "", daysAgo: 13 },
  { id: "i10", date: "2026-08-01", site: "glute_r",  compound: "Testosterone Cypionate", ml: 0.6, mg: 150, route: "im",   needle: "23G × 1.5\"", pain: 1, notes: "", daysAgo: 14 },
];

function siteState(siteId) {
  const site = INJ_SITES.find(s => s.id === siteId);
  const last = INJ_LOG.find(l => l.site === siteId);
  if (!last) return { status: "fresh", c: "var(--pos)", label: "fresh", daysAgo: null, site };
  const remaining = site.restDays - last.daysAgo;
  if (remaining > 1)  return { status: "resting", c: "var(--neg)",  label: `${remaining}d rest left`, daysAgo: last.daysAgo, site, last };
  if (remaining >= 0) return { status: "soon",    c: "var(--warn)", label: "ready tomorrow", daysAgo: last.daysAgo, site, last };
  return { status: "ready", c: "var(--pos)", label: "ready", daysAgo: last.daysAgo, site, last };
}

// Rotation plan: next 7 scheduled injections with recommended site
const INJ_SCHEDULE = [
  { date: "2026-08-17", day: "Mon", compound: "Testosterone Cypionate", ml: 0.6, route: "im",   suggested: "vglute_l", why: "longest rested IM site (13d)" },
  { date: "2026-08-18", day: "Tue", compound: "HCG",                    ml: 0.3, route: "subq", suggested: "thigh_sq_l", why: "never used · rotates away from abdomen" },
  { date: "2026-08-20", day: "Thu", compound: "Testosterone Cypionate", ml: 0.6, route: "im",   suggested: "quad_r",   why: "9d since quad use, contralateral to last" },
  { date: "2026-08-21", day: "Fri", compound: "HCG",                    ml: 0.3, route: "subq", suggested: "abd_r",    href: true, why: "abdomen rest satisfied (12d)" },
  { date: "2026-08-24", day: "Mon", compound: "Testosterone Cypionate", ml: 0.6, route: "im",   suggested: "vglute_r", why: "completes 4-site IM rotation" },
  { date: "2026-08-25", day: "Tue", compound: "HCG",                    ml: 0.3, route: "subq", suggested: "sq_delt_l",why: "spreads SubQ load to arms" },
  { date: "2026-08-27", day: "Thu", compound: "Testosterone Cypionate", ml: 0.6, route: "im",   suggested: "glute_l",  why: "glute rest satisfied (16d)" },
];

// ── Body map with site markers ─────────────────────────────
const InjBodyMap = ({ view, selected, onSelect, filterRoute }) => {
  const sites = INJ_SITES.filter(s => s.view === view && (filterRoute === "all" || s.route === filterRoute));
  return (
    <div style={{flex: 1, textAlign: "center"}}>
      <div className="eyebrow" style={{marginBottom: 8}}>{view === "front" ? "Front" : "Back"}</div>
      <svg viewBox="0 0 100 120" style={{width: "100%", maxWidth: 210}}>
        <path d="M 50 4 q -6 0 -8 5 q -2 5 0 9 q 0 4 2 6 q -8 2 -13 6 q -5 4 -6 12 v 12 q -1 4 -3 9 l -7 14 q -1 4 0 7 l 2 5 q 1 2 3 0 l 3 -7 q 1 -2 1 2 v 18 q 0 4 4 5 h 11 q 4 -1 5 -5 v -22 q 0 -2 2 -3 q 0 4 0 22 v 24 q 0 4 4 5 q 4 -1 4 -5 v -24 q 0 -18 0 -22 q 2 1 2 3 v 22 q 1 4 5 5 h 11 q 4 -1 4 -5 v -18 q 0 -4 1 -2 l 3 7 q 2 2 3 0 l 2 -5 q 1 -3 0 -7 l -7 -14 q -2 -5 -3 -9 v -12 q -1 -8 -6 -12 q -5 -4 -13 -6 q 2 -2 2 -6 q 2 -4 0 -9 q -2 -5 -8 -5 z"
          fill="var(--surface)" stroke="var(--border)" strokeWidth="0.6"/>
        {sites.map(s => {
          const st = siteState(s.id);
          const isSel = selected === s.id;
          return (
            <g key={s.id} onClick={() => onSelect(s.id)} style={{cursor: "pointer"}}>
              {isSel && <circle cx={s.x} cy={s.y} r={7} fill="none" stroke={st.c} strokeWidth="0.8" opacity="0.6"/>}
              <circle cx={s.x} cy={s.y} r={isSel ? 4.4 : 3.6}
                fill={st.c} opacity={st.status === "resting" ? 0.45 : 0.85}
                stroke={isSel ? "var(--fg)" : st.c} strokeWidth={isSel ? 0.7 : 0.3}/>
              <text x={s.x} y={s.y + 1.4} textAnchor="middle"
                style={{fontFamily: "var(--font-mono)", fontSize: 3.2, fill: "var(--bg)", fontWeight: 700, pointerEvents: "none"}}>{s.short}</text>
              {s.route === "subq" && (
                <circle cx={s.x} cy={s.y} r={isSel ? 6.2 : 5.4} fill="none" stroke={st.c} strokeWidth="0.35" strokeDasharray="1 1" opacity="0.7"/>
              )}
              <title>{s.name} · {st.label}{st.daysAgo != null ? ` · last ${st.daysAgo}d ago` : ""}</title>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

// ── Main view ──────────────────────────────────────────────
window.InjectionPlannerView = () => {
  const [sel, setSel] = React.useState("vglute_l");
  const [route, setRoute] = React.useState("all");
  const [tab, setTab] = React.useState("rotation");
  const s = INJ_SITES.find(x => x.id === sel);
  const st = siteState(sel);
  const resting = INJ_SITES.filter(x => siteState(x.id).status === "resting").length;
  const ready = INJ_SITES.filter(x => ["ready","fresh"].includes(siteState(x.id).status)).length;
  const overloaded = INJ_SITES.map(x => ({
    site: x,
    count30: INJ_LOG.filter(l => l.site === x.id && l.daysAgo <= 30).length,
  })).filter(x => x.count30 >= 3);

  return (
    <div>
      <div style={{display: "flex", gap: 8, marginBottom: 14, alignItems: "center", flexWrap: "wrap"}}>
        <div style={{display: "flex", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 7, padding: 2, gap: 1}}>
          {[["rotation","Rotation map"],["schedule","Schedule"],["log","Log"],["guide","Site guide"]].map(([k,l]) => (
            <button key={k} onClick={() => setTab(k)} className={tab === k ? "btn btn-primary" : "btn btn-ghost"} style={{height: 24, fontSize: 11, padding: "0 12px", borderRadius: 5}}>{l}</button>
          ))}
        </div>
        <div style={{display: "flex", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 7, padding: 2, gap: 1}}>
          {[["all","All"],["im","IM"],["subq","SubQ"]].map(([k,l]) => (
            <button key={k} onClick={() => setRoute(k)} className={route === k ? "btn btn-primary" : "btn btn-ghost"} style={{height: 24, fontSize: 11, padding: "0 10px", borderRadius: 5}}>{l}</button>
          ))}
        </div>
        <div className="spacer"/>
        <button className="btn btn-primary" onClick={() => window.dispatchEvent(new CustomEvent("supp-modal", {detail: {type: "logInjection"}}))}>
          <Icon name="plus" className="ic ic-sm"/>Log injection
        </button>
      </div>

      <div className="grid g-cols-4" style={{gap: 10, marginBottom: 14}}>
        <Card className="card-tight" style={{padding: 14}}>
          <div className="eyebrow">Sites ready</div>
          <div className="num" style={{fontSize: 22, color: "var(--pos)"}}>{ready}</div>
          <div className="dim" style={{fontSize: 11}}>of {INJ_SITES.length} tracked</div>
        </Card>
        <Card className="card-tight" style={{padding: 14}}>
          <div className="eyebrow">Resting</div>
          <div className="num" style={{fontSize: 22, color: resting ? "var(--warn)" : "var(--fg-dim)"}}>{resting}</div>
          <div className="dim" style={{fontSize: 11}}>within rest window</div>
        </Card>
        <Card className="card-tight" style={{padding: 14}}>
          <div className="eyebrow">Overused · 30d</div>
          <div className="num" style={{fontSize: 22, color: overloaded.length ? "var(--warn)" : "var(--pos)"}}>{overloaded.length}</div>
          <div className="dim" style={{fontSize: 11}}>≥ 3 uses per site</div>
        </Card>
        <Card className="card-tight" style={{padding: 14}}>
          <div className="eyebrow">Next injection</div>
          <div className="num" style={{fontSize: 15}}>Mon 17 Aug</div>
          <div className="dim" style={{fontSize: 11}}>Test Cyp · 0.6 ml IM</div>
        </Card>
      </div>

      {tab === "rotation" && (
        <div className="grid" style={{gridTemplateColumns: "1.3fr 1fr", gap: 14}}>
          <Card title="Rotation map" sub="click a site · dashed ring = SubQ · dimmed = resting">
            <div style={{display: "flex", gap: 20}}>
              <InjBodyMap view="front" selected={sel} onSelect={setSel} filterRoute={route}/>
              <InjBodyMap view="back"  selected={sel} onSelect={setSel} filterRoute={route}/>
            </div>
            <div style={{display: "flex", justifyContent: "center", gap: 14, marginTop: 12, fontSize: 10, color: "var(--fg-muted)", flexWrap: "wrap"}}>
              <span className="row-gap"><span style={{width: 10, height: 10, borderRadius: 999, background: "var(--pos)"}}/>ready</span>
              <span className="row-gap"><span style={{width: 10, height: 10, borderRadius: 999, background: "var(--warn)"}}/>ready tomorrow</span>
              <span className="row-gap"><span style={{width: 10, height: 10, borderRadius: 999, background: "var(--neg)", opacity: 0.45}}/>resting</span>
              <span className="row-gap"><span style={{width: 10, height: 10, borderRadius: 999, border: "1px dashed var(--fg-dim)"}}/>SubQ</span>
            </div>
          </Card>

          <div className="col-gap" style={{gap: 14}}>
            <Card title={s.name} sub={`${s.route.toUpperCase()} · ${s.note}`}>
              <div className="grid g-cols-2" style={{gap: 8, marginBottom: 12}}>
                <Card className="card-tight" style={{padding: 10}}>
                  <div className="eyebrow">Status</div>
                  <div style={{fontSize: 13, fontWeight: 600, color: st.c, marginTop: 2}}>{st.label}</div>
                </Card>
                <Card className="card-tight" style={{padding: 10}}>
                  <div className="eyebrow">Last used</div>
                  <div className="num" style={{fontSize: 13, marginTop: 2}}>{st.daysAgo != null ? `${st.daysAgo} d ago` : "never"}</div>
                </Card>
                <Card className="card-tight" style={{padding: 10}}>
                  <div className="eyebrow">Max volume</div>
                  <div className="num" style={{fontSize: 13, marginTop: 2}}>{s.maxMl.toFixed(1)} ml</div>
                </Card>
                <Card className="card-tight" style={{padding: 10}}>
                  <div className="eyebrow">Rest window</div>
                  <div className="num" style={{fontSize: 13, marginTop: 2}}>{s.restDays} d</div>
                </Card>
              </div>
              <div className="eyebrow" style={{marginBottom: 6}}>Needle recommendation</div>
              <div style={{padding: 10, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, marginBottom: 10}}>
                <div className="num" style={{fontSize: 13, fontWeight: 600}}>{s.needle}</div>
                <div className="dim" style={{fontSize: 10.5, marginTop: 2}}>
                  {s.route === "im" ? "Draw with 21G, inject with listed gauge · aspirate before push" : "Pinch fold · 45–90° · no aspiration needed"}
                </div>
              </div>
              <div className="eyebrow" style={{marginBottom: 6}}>Use history · last 30d</div>
              <div style={{display: "flex", gap: 3}}>
                {Array.from({length: 30}).map((_, i) => {
                  const d = 30 - i;
                  const used = INJ_LOG.some(l => l.site === sel && l.daysAgo === d);
                  return <div key={i} style={{flex: 1, height: 18, borderRadius: 2, background: used ? st.c : "var(--surface-2)", opacity: used ? 0.85 : 1}} title={`${d}d ago`}/>;
                })}
              </div>
              <div style={{display: "flex", justifyContent: "space-between", marginTop: 4}}>
                <span className="dim mono" style={{fontSize: 9}}>30d ago</span>
                <span className="dim mono" style={{fontSize: 9}}>today</span>
              </div>
            </Card>

            {overloaded.length > 0 && (
              <Card title="Overuse warnings" sub="≥ 3 injections in 30 days">
                {overloaded.map(o => (
                  <div key={o.site.id} style={{padding: 10, background: "color-mix(in srgb, var(--warn) 6%, var(--surface))", border: "1px solid color-mix(in srgb, var(--warn) 26%, var(--border))", borderRadius: 6, marginBottom: 6}}>
                    <div style={{display: "flex", alignItems: "center", gap: 8, marginBottom: 3}}>
                      <span style={{fontSize: 12.5, fontWeight: 600}}>{o.site.name}</span>
                      <span className="num" style={{marginLeft: "auto", color: "var(--warn)", fontSize: 12}}>{o.count30}× / 30d</span>
                    </div>
                    <div className="dim" style={{fontSize: 10.5, lineHeight: 1.45}}>
                      Repeated use raises scar-tissue and lipohypertrophy risk. Rotate to a contralateral or alternate site.
                    </div>
                  </div>
                ))}
              </Card>
            )}
          </div>
        </div>
      )}

      {tab === "schedule" && (
        <div className="grid" style={{gridTemplateColumns: "1.5fr 1fr", gap: 14}}>
          <Card title="Rotation plan · next 7 injections" sub="site suggested by longest-rest-first algorithm">
            <table className="tbl">
              <thead><tr><th style={{width: 90}}>Date</th><th>Compound</th><th style={{width: 70}}>Route</th><th style={{width: 70, textAlign: "right"}}>Volume</th><th style={{width: 130}}>Suggested site</th><th style={{width: 40}}></th></tr></thead>
              <tbody>
                {INJ_SCHEDULE.map((r, i) => {
                  const site = INJ_SITES.find(x => x.id === r.suggested);
                  const overLimit = r.ml > site.maxMl;
                  return (
                    <tr key={i}>
                      <td>
                        <div className="num" style={{fontSize: 11.5}}>{r.day} {r.date.slice(8)}</div>
                        <div className="dim mono" style={{fontSize: 9.5}}>{r.date.slice(0, 7)}</div>
                      </td>
                      <td style={{fontSize: 12}}>{r.compound}</td>
                      <td><Pill style={{fontSize: 9}}>{r.route.toUpperCase()}</Pill></td>
                      <td className="num" style={{textAlign: "right", color: overLimit ? "var(--neg)" : "var(--fg)"}}>{r.ml} ml</td>
                      <td>
                        <div style={{fontSize: 11.5, fontWeight: 500}}>{site.name}</div>
                        <div className="dim" style={{fontSize: 9.5, lineHeight: 1.35}}>{r.why}</div>
                      </td>
                      <td><button className="icon-btn" title="Change site"><Icon name="edit" className="ic ic-sm"/></button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className="divider"/>
            <div className="dim mono" style={{fontSize: 10, lineHeight: 1.7}}>
              suggestion = argmax(days_since_last) over sites where<br/>
              &nbsp;&nbsp;route matches AND volume ≤ site.max_ml AND<br/>
              &nbsp;&nbsp;days_since_last ≥ site.rest_days<br/>
              tie-break: prefer contralateral to previous injection
            </div>
          </Card>
          <div className="col-gap" style={{gap: 14}}>
            <Card title="Volume limits" sub="per site, per injection">
              <table className="tbl">
                <thead><tr><th>Site</th><th style={{width: 55}}>Route</th><th style={{width: 70, textAlign: "right"}}>Max</th><th style={{width: 60, textAlign: "right"}}>Rest</th></tr></thead>
                <tbody>
                  {INJ_SITES.filter(s => route === "all" || s.route === route).map(s => (
                    <tr key={s.id}>
                      <td style={{fontSize: 11.5}}>{s.name}</td>
                      <td><Pill style={{fontSize: 8.5}}>{s.route.toUpperCase()}</Pill></td>
                      <td className="num" style={{textAlign: "right", fontSize: 11}}>{s.maxMl.toFixed(1)} ml</td>
                      <td className="num muted" style={{textAlign: "right", fontSize: 11}}>{s.restDays} d</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
            <Card title="Weekly load" sub="volume by site · last 4 weeks">
              {["glute_l","glute_r","vglute_l","vglute_r","quad_l","abd_l","abd_r"].map(id => {
                const site = INJ_SITES.find(s => s.id === id);
                const ml = INJ_LOG.filter(l => l.site === id && l.daysAgo <= 28).reduce((s, l) => s + l.ml, 0);
                return (
                  <div key={id} style={{display: "grid", gridTemplateColumns: "110px 1fr 58px", gap: 10, alignItems: "center", marginBottom: 5}}>
                    <span style={{fontSize: 11}}>{site.name}</span>
                    <Meter value={ml} max={4} color={ml > 2.5 ? "var(--warn)" : "var(--acc-medic)"} tall/>
                    <span className="num" style={{textAlign: "right", fontSize: 10.5}}>{ml.toFixed(2)} ml</span>
                  </div>
                );
              })}
            </Card>
          </div>
        </div>
      )}

      {tab === "log" && (
        <Card title="Injection log" sub={`${INJ_LOG.length} entries · last 14 days`}
          actions={<button className="btn btn-sm"><Icon name="download" className="ic ic-sm"/>Export</button>}>
          <table className="tbl">
            <thead>
              <tr>
                <th style={{width: 100}}>Date</th>
                <th>Compound</th>
                <th style={{width: 130}}>Site</th>
                <th style={{width: 60}}>Route</th>
                <th style={{width: 80, textAlign: "right"}}>Volume</th>
                <th style={{width: 80, textAlign: "right"}}>Dose</th>
                <th style={{width: 110}}>Needle</th>
                <th style={{width: 90}}>Pain</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {INJ_LOG.map(l => {
                const site = INJ_SITES.find(s => s.id === l.site);
                return (
                  <tr key={l.id}>
                    <td>
                      <div className="num" style={{fontSize: 11.5}}>{l.date.slice(5)}</div>
                      <div className="dim mono" style={{fontSize: 9.5}}>{l.daysAgo}d ago</div>
                    </td>
                    <td style={{fontSize: 12}}>{l.compound}</td>
                    <td style={{fontSize: 11.5}}>{site.name}</td>
                    <td><Pill style={{fontSize: 8.5}}>{l.route.toUpperCase()}</Pill></td>
                    <td className="num" style={{textAlign: "right"}}>{l.ml} ml</td>
                    <td className="num muted" style={{textAlign: "right", fontSize: 11}}>{l.mg != null ? `${l.mg} mg` : "—"}</td>
                    <td className="num muted" style={{fontSize: 10.5}}>{l.needle}</td>
                    <td>
                      <div style={{display: "flex", gap: 2}}>
                        {[0,1,2,3].map(p => (
                          <div key={p} style={{width: 11, height: 5, borderRadius: 1, background: p <= l.pain ? (l.pain >= 2 ? "var(--warn)" : "var(--pos)") : "var(--surface-2)"}}/>
                        ))}
                      </div>
                    </td>
                    <td className="dim" style={{fontSize: 10.5}}>{l.notes || "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      )}

      {tab === "guide" && (
        <div className="grid g-cols-2" style={{gap: 14}}>
          <Card title="IM sites" sub="intramuscular · aspirate before injecting">
            {INJ_SITES.filter(s => s.route === "im").map(s => (
              <div key={s.id} style={{padding: 10, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, marginBottom: 6}}>
                <div style={{display: "flex", alignItems: "center", gap: 8, marginBottom: 3}}>
                  <span style={{display: "grid", placeItems: "center", width: 20, height: 20, borderRadius: 4, background: "color-mix(in srgb, var(--acc-medic) 18%, transparent)", border: "1px solid color-mix(in srgb, var(--acc-medic) 35%, transparent)", color: "var(--acc-medic)", fontFamily: "var(--font-mono)", fontSize: 9, fontWeight: 700}}>{s.short}</span>
                  <span style={{fontSize: 12.5, fontWeight: 600}}>{s.name}</span>
                  <span className="num dim" style={{marginLeft: "auto", fontSize: 10.5}}>{s.maxMl} ml · {s.restDays}d · {s.needle}</span>
                </div>
                <div className="dim" style={{fontSize: 10.5, paddingLeft: 28, lineHeight: 1.45}}>{s.note}</div>
              </div>
            ))}
          </Card>
          <div className="col-gap" style={{gap: 14}}>
            <Card title="SubQ sites" sub="subcutaneous · pinch fold, no aspiration">
              {INJ_SITES.filter(s => s.route === "subq").map(s => (
                <div key={s.id} style={{padding: 10, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, marginBottom: 6}}>
                  <div style={{display: "flex", alignItems: "center", gap: 8, marginBottom: 3}}>
                    <span style={{display: "grid", placeItems: "center", width: 20, height: 20, borderRadius: 999, background: "color-mix(in srgb, var(--acc-recov) 18%, transparent)", border: "1px dashed color-mix(in srgb, var(--acc-recov) 45%, transparent)", color: "var(--acc-recov)", fontFamily: "var(--font-mono)", fontSize: 9, fontWeight: 700}}>{s.short}</span>
                    <span style={{fontSize: 12.5, fontWeight: 600}}>{s.name}</span>
                    <span className="num dim" style={{marginLeft: "auto", fontSize: 10.5}}>{s.maxMl} ml · {s.restDays}d · {s.needle}</span>
                  </div>
                  <div className="dim" style={{fontSize: 10.5, paddingLeft: 28, lineHeight: 1.45}}>{s.note}</div>
                </div>
              ))}
            </Card>
            <Card title="Needle reference">
              <table className="tbl">
                <thead><tr><th>Purpose</th><th style={{width: 90}}>Gauge</th><th style={{width: 80}}>Length</th></tr></thead>
                <tbody>
                  <tr><td>Drawing (all)</td><td className="num">21G</td><td className="num muted">1.5"</td></tr>
                  <tr><td>IM glute / ventroglutal</td><td className="num">23G</td><td className="num muted">1.25–1.5"</td></tr>
                  <tr><td>IM quad / delt</td><td className="num">25G</td><td className="num muted">1"</td></tr>
                  <tr><td>SubQ all sites</td><td className="num">29–31G</td><td className="num muted">0.5"</td></tr>
                </tbody>
              </table>
              <div className="divider"/>
              <div className="dim" style={{fontSize: 10.5, lineHeight: 1.55}}>
                Reference only. Gauge and length depend on carrier oil viscosity and subcutaneous depth — confirm with your physician.
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Log injection modal ────────────────────────────────────
window.LogInjectionModal = ({ onClose }) => {
  const [site, setSite] = React.useState("vglute_l");
  const [ml, setMl] = React.useState(0.6);
  const [pain, setPain] = React.useState(1);
  const s = INJ_SITES.find(x => x.id === site);
  const st = siteState(site);
  const overLimit = ml > s.maxMl;
  const tooSoon = st.status === "resting";
  return (
    <div className="modal-veil" onClick={onClose}>
      <div className="modal" style={{width: 680, maxHeight: "92vh"}} onClick={e => e.stopPropagation()}>
        <div className="modal-h">
          <div style={{width: 26, height: 26, borderRadius: 6, background: "color-mix(in srgb, var(--acc-medic) 18%, transparent)", border: "1px solid color-mix(in srgb, var(--acc-medic) 38%, var(--border))", color: "var(--acc-medic)", display: "grid", placeItems: "center"}}><Icon name="medical" className="ic"/></div>
          <div style={{flex: 1}}>
            <div style={{fontSize: 14, fontWeight: 600}}>Log injection</div>
            <div className="dim" style={{fontSize: 11}}>Site rotation and volume are validated before saving</div>
          </div>
          <button className="icon-btn" onClick={onClose}><Icon name="x" className="ic"/></button>
        </div>
        <div className="modal-body" style={{padding: 16, overflowY: "auto"}}>
          <div className="grid g-cols-3" style={{gap: 10, marginBottom: 12}}>
            <div>
              <div className="eyebrow" style={{marginBottom: 4}}>Compound</div>
              <select style={{width: "100%", height: 30, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, padding: "0 10px", fontSize: 12}}>
                {(window.CATALOG || []).filter(c => c.mode === "enhanced" && c.timing.includes("injection")).map(c => <option key={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <div className="eyebrow" style={{marginBottom: 4}}>Date</div>
              <input type="date" defaultValue="2026-08-15" style={{width: "100%", height: 30, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, padding: "0 10px", fontSize: 12, fontFamily: "var(--font-mono)"}}/>
            </div>
            <div>
              <div className="eyebrow" style={{marginBottom: 4}}>Time</div>
              <input type="time" defaultValue="07:15" style={{width: "100%", height: 30, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, padding: "0 10px", fontSize: 12, fontFamily: "var(--font-mono)"}}/>
            </div>
          </div>

          <div className="eyebrow" style={{marginBottom: 6}}>Site · pick from map or list</div>
          <div style={{display: "flex", gap: 12, marginBottom: 12}}>
            <Card className="card-tight" style={{padding: 10, flex: 1}}>
              <div style={{display: "flex", gap: 12}}>
                <InjBodyMap view="front" selected={site} onSelect={setSite} filterRoute="all"/>
                <InjBodyMap view="back"  selected={site} onSelect={setSite} filterRoute="all"/>
              </div>
            </Card>
            <div style={{width: 210, display: "flex", flexDirection: "column", gap: 4, maxHeight: 240, overflowY: "auto"}}>
              {INJ_SITES.map(x => {
                const xs = siteState(x.id);
                const on = x.id === site;
                return (
                  <button key={x.id} onClick={() => setSite(x.id)} style={{
                    display: "flex", alignItems: "center", gap: 7, padding: "6px 8px", borderRadius: 5, cursor: "pointer", textAlign: "left",
                    background: on ? `color-mix(in srgb, ${xs.c} 10%, var(--surface))` : "var(--surface)",
                    border: `1px solid ${on ? `color-mix(in srgb, ${xs.c} 35%, var(--border))` : "var(--border)"}`,
                  }}>
                    <span style={{width: 6, height: 6, borderRadius: 999, background: xs.c, flexShrink: 0, opacity: xs.status === "resting" ? 0.5 : 1}}/>
                    <span style={{fontSize: 11, flex: 1, color: on ? "var(--fg)" : "var(--fg-muted)"}}>{x.name}</span>
                    <span className="dim mono" style={{fontSize: 9}}>{xs.daysAgo != null ? `${xs.daysAgo}d` : "new"}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid g-cols-3" style={{gap: 10, marginBottom: 12}}>
            <div>
              <div className="eyebrow" style={{marginBottom: 4}}>Volume · max {s.maxMl} ml</div>
              <input type="number" step="0.05" value={ml} onChange={e => setMl(Number(e.target.value))}
                style={{width: "100%", height: 30, background: "var(--surface)", border: `1px solid ${overLimit ? "var(--neg)" : "var(--border)"}`, borderRadius: 6, padding: "0 10px", fontSize: 12, fontFamily: "var(--font-mono)", color: overLimit ? "var(--neg)" : "var(--fg)"}}/>
            </div>
            <div>
              <div className="eyebrow" style={{marginBottom: 4}}>Dose</div>
              <input defaultValue="150" style={{width: "100%", height: 30, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, padding: "0 10px", fontSize: 12, fontFamily: "var(--font-mono)"}}/>
            </div>
            <div>
              <div className="eyebrow" style={{marginBottom: 4}}>Needle · recommended</div>
              <input defaultValue={s.needle} style={{width: "100%", height: 30, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, padding: "0 10px", fontSize: 12, fontFamily: "var(--font-mono)"}}/>
            </div>
          </div>

          <div className="eyebrow" style={{marginBottom: 6}}>Injection pain · 0–3</div>
          <div style={{display: "flex", gap: 5, marginBottom: 12}}>
            {["none","mild","moderate","severe"].map((l, i) => (
              <button key={l} onClick={() => setPain(i)} className={pain === i ? "btn btn-primary btn-sm" : "btn btn-sm"} style={{flex: 1}}>{i} · {l}</button>
            ))}
          </div>

          <div className="eyebrow" style={{marginBottom: 4}}>Notes</div>
          <input placeholder="Bleeding, lump, unusual soreness…" style={{width: "100%", height: 30, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, padding: "0 10px", fontSize: 12, marginBottom: 12}}/>

          {/* validation */}
          {(overLimit || tooSoon) && (
            <div style={{padding: 12, background: "color-mix(in srgb, var(--neg) 7%, var(--surface))", border: "1px solid color-mix(in srgb, var(--neg) 32%, var(--border))", borderRadius: 7, marginBottom: 10}}>
              <div style={{display: "flex", alignItems: "center", gap: 8, marginBottom: 4}}>
                <Icon name="alert" className="ic ic-sm" style={{color: "var(--neg)"}}/>
                <span style={{fontSize: 12.5, fontWeight: 600, color: "var(--neg)"}}>Validation</span>
              </div>
              <div className="col-gap" style={{gap: 3}}>
                {overLimit && <div className="mono" style={{fontSize: 11, color: "var(--fg-muted)"}}>volume {ml} ml exceeds {s.name} limit of {s.maxMl} ml</div>}
                {tooSoon && <div className="mono" style={{fontSize: 11, color: "var(--fg-muted)"}}>{s.name} used {st.daysAgo}d ago · rest window is {s.restDays}d</div>}
              </div>
            </div>
          )}
          {!overLimit && !tooSoon && (
            <div style={{padding: 10, background: "color-mix(in srgb, var(--pos) 6%, var(--surface))", border: "1px solid color-mix(in srgb, var(--pos) 26%, var(--border))", borderRadius: 6, fontSize: 11.5, color: "var(--fg-muted)"}}>
              <Icon name="check" className="ic ic-sm" style={{display: "inline", verticalAlign: "middle", marginRight: 5, color: "var(--pos)"}}/>
              {s.name} is clear · {st.daysAgo != null ? `last used ${st.daysAgo}d ago` : "never used"} · volume within {s.maxMl} ml limit
            </div>
          )}
        </div>
        <div className="modal-f">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <div className="spacer"/>
          {(overLimit || tooSoon) && <button className="btn btn-ghost btn-sm" style={{color: "var(--warn)"}}>Override with reason</button>}
          <button className="btn btn-primary" onClick={onClose} disabled={overLimit || tooSoon}>
            <Icon name="check" className="ic ic-sm"/>Log injection
          </button>
        </div>
      </div>
    </div>
  );
};

window.SuppInjectionLauncher = () => {
  const [m, setM] = React.useState(null);
  React.useEffect(() => {
    const h = e => setM(e.detail.type);
    window.addEventListener("supp-modal", h);
    return () => window.removeEventListener("supp-modal", h);
  }, []);
  if (m !== "logInjection" || !window.LogInjectionModal) return null;
  return <window.LogInjectionModal onClose={() => setM(null)}/>;
};

Object.assign(window, { INJ_SITES, INJ_LOG, INJ_SCHEDULE, siteState });
