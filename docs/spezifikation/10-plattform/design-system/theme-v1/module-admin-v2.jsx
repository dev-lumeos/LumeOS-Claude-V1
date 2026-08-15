// Admin module v2 — per SPEC_01_UI_DESIGN + admin-panel-spec
// 11 areas: Dashboard · Users · Moderation · Analytics · System Health
//           · Exercises · Routines · Food DB · Content · Notifications
//           · Audit · Settings

const AD_USERS = [
  { id: "u1",  name: "Alex Fischer",   email: "alex@example.com",       tier: "Pro",   role: "user",  status: "active",    joined: "Mar 2026", last: "2h ago",  modules: 8,  logins: 142 },
  { id: "u2",  name: "Maria Schmidt",  email: "maria@example.com",      tier: "Free",  role: "user",  status: "active",    joined: "Apr 2026", last: "1d ago",  modules: 4,  logins: 38 },
  { id: "u3",  name: "Dr. M. Kessler", email: "kessler@clinic.example", tier: "—",     role: "coach", status: "verified",  joined: "Feb 2026", last: "4h ago",  modules: 7,  logins: 88 },
  { id: "u4",  name: "Tom Müller",     email: "tom@lumeos.app",         tier: "Plus",  role: "admin", status: "active",    joined: "Jan 2026", last: "now",     modules: 11, logins: 640 },
  { id: "u5",  name: "Anders Lindqvist", email: "anders@perflab.se",    tier: "—",     role: "coach", status: "verified",  joined: "Aug 2024", last: "6h ago",  modules: 9,  logins: 812 },
  { id: "u6",  name: "Jonas Becker",   email: "jonas@example.com",      tier: "Elite", role: "user",  status: "active",    joined: "Nov 2025", last: "30m ago", modules: 11, logins: 402 },
  { id: "u7",  name: "spam_9241",      email: "x9241@mailinator.com",   tier: "Free",  role: "user",  status: "banned",    joined: "May 2026", last: "3d ago",  modules: 0,  logins: 2 },
  { id: "u8",  name: "Lena Vogt",      email: "lena@example.com",       tier: "Pro",   role: "user",  status: "suspended", joined: "Dec 2025", last: "8d ago",  modules: 6,  logins: 96 },
];

const AD_MOD_QUEUE = [
  { id: "M-118", kind: "Marketplace listing", title: "MiracleFit Thermo Powder", by: "supplements-direct",
    severity: "CRITICAL", reason: "Potentially illegal substance — DMAA detected in ingredient list", at: "4h ago" },
  { id: "M-117", kind: "Coach verification", title: "J. Stevens · strength coach", by: "j.stevens@mail.example",
    severity: "MEDIUM", reason: "Credential PDF unreadable, certification body not recognised", at: "yesterday" },
  { id: "M-116", kind: "Marketplace listing", title: "Quick Cut Method · 4 weeks", by: "fitguru22",
    severity: "HIGH", reason: "Claims 8 kg fat loss in 4 weeks — unsupported medical claim", at: "2h ago" },
  { id: "M-114", kind: "User report", title: "Review on Whey Isolate", by: "user u-432",
    severity: "LOW", reason: "Promotional spam in review body", at: "3d ago" },
];

const AD_COACH_PENDING = [
  { id: "CV-9", name: "J. Stevens", type: "Training", docs: ["NASM-CPT.pdf", "ID_front.jpg"], specs: ["Strength", "Powerlifting"],
    applied: "12 May", flag: "Certification body not on approved list" },
  { id: "CV-8", name: "Priya Raman", type: "Nutrition", docs: ["RD_license.pdf", "ID_front.jpg", "insurance.pdf"], specs: ["Clinical nutrition", "Plant-based"],
    applied: "14 May", flag: null },
];

const AD_SERVICES = [
  { n: "Nutrition API",   s: "healthy", ms: 42, port: 5100 },
  { n: "Training API",    s: "healthy", ms: 38, port: 5200 },
  { n: "Supplements API", s: "healthy", ms: 46, port: 5300 },
  { n: "Recovery API",    s: "healthy", ms: 55, port: 5400 },
  { n: "Medical API",     s: "healthy", ms: 61, port: 5500 },
  { n: "Coach API",       s: "degraded",ms: 214, port: 5600 },
  { n: "Marketplace API", s: "healthy", ms: 48, port: 5700 },
  { n: "Buddy API",       s: "healthy", ms: 180, port: 5800 },
  { n: "Supabase DB",     s: "healthy", ms: 8,  port: 5432 },
  { n: "Auth Service",    s: "healthy", ms: 12, port: 5000 },
];

const AD_SPARKS = [
  { id: "Spark A · Qwen3.6-35B",   ip: "192.168.0.128", util: 72, temp: 68, power: 245, vram: 38, vramTotal: 64, s: "running" },
  { id: "Spark B · Qwen3-Coder",   ip: "192.168.0.188", util: 54, temp: 62, power: 220, vram: 32, vramTotal: 64, s: "running" },
  { id: "Spark C · Nemotron-30B",  ip: "192.168.0.99",  util: 41, temp: 58, power: 198, vram: 28, vramTotal: 64, s: "running" },
  { id: "Spark D · MiniMax 2.7",   ip: "192.168.0.101", util: 92, temp: 78, power: 288, vram: 56, vramTotal: 64, s: "hot" },
];

const AD_ERRORS = [
  { at: "14:22:08", svc: "nutrition-api", lvl: "error", msg: "BLS lookup failed: nutrient_id FAPUN3EPA not found for food 4021", n: 3 },
  { at: "13:48:31", svc: "coach-api",     lvl: "error", msg: "Timeout calling openclaw-bridge after 8000ms", n: 12 },
  { at: "11:02:14", svc: "buddy-api",     lvl: "warn",  msg: "Knowledge search returned 0 hits for query length > 400 chars", n: 5 },
  { at: "09:31:55", svc: "training-api",  lvl: "warn",  msg: "Garmin connector retry (attempt 2 of 3)", n: 8 },
  { at: "08:12:40", svc: "marketplace",   lvl: "error", msg: "Stripe webhook signature mismatch — event discarded", n: 1 },
];

const AD_EXERCISES = [
  { id: "E-0412", name: "Bench Press · Barbell", cat: "Compound", muscles: ["Chest","Triceps","Front delt"], equip: "Barbell", media: 3, video: true,  quality: "ok",   i18n: ["de","en","th"] },
  { id: "E-0418", name: "Incline DB Press",      cat: "Compound", muscles: ["Chest","Front delt"],          equip: "Dumbbell",media: 2, video: true,  quality: "ok",   i18n: ["de","en"] },
  { id: "E-1120", name: "Cable Crossover High",  cat: "Isolation",muscles: [],                              equip: "Cable",   media: 0, video: false, quality: "bad",  i18n: ["en"] },
  { id: "E-0733", name: "Zercher Squat",         cat: "Compound", muscles: ["Quads","Glutes","Core"],       equip: "Barbell", media: 1, video: false, quality: "warn", i18n: ["de","en"] },
  { id: "E-1544", name: "Nordic Hamstring Curl", cat: "Compound", muscles: ["Hamstrings"],                  equip: "Bodyweight", media: 2, video: true, quality: "ok", i18n: ["de","en","th"] },
  { id: "E-1801", name: "Landmine Press",        cat: "Compound", muscles: [],                              equip: "Barbell", media: 0, video: false, quality: "bad",  i18n: ["en"] },
];

const AD_ROUTINES = [
  { id: "RT-01", name: "PPL Hypertrophy",       kind: "template", owner: "system",           users: 3_412, copies: 1_820, rating: 4.8 },
  { id: "RT-02", name: "5/3/1 BBB · 12 weeks",  kind: "template", owner: "Tom Müller",       users: 312,   copies: 288,   rating: 4.8 },
  { id: "RT-03", name: "Beginner Linear",       kind: "template", owner: "system",           users: 5_240, copies: 4_110, rating: 4.6 },
  { id: "RT-04", name: "Upper-Lower Hyper",     kind: "template", owner: "Anders Lindqvist", users: 890,   copies: 620,   rating: 4.7 },
  { id: "RT-05", name: "My custom push day",    kind: "custom",   owner: "u-8241",           users: 1,     copies: 0,     rating: null },
];

const AD_FOOD_PENDING = [
  { id: "F-2201", name: "Oat milk · barista edition", src: "user-submitted", kcal: 48, p: 1.1, c: 6.8, f: 1.6, by: "u-1120", at: "2d ago", dupe: null },
  { id: "F-2198", name: "Protein bar · X-tend Cookie", src: "user-submitted", kcal: 380, p: 32, c: 34, f: 12, by: "u-4402", at: "3d ago", dupe: "F-1877 · 94% similar" },
  { id: "F-2190", name: "Bavarian wheat beer 0.5l",   src: "user-submitted", kcal: 45, p: 0.4, c: 3.6, f: 0, by: "u-9120", at: "5d ago", dupe: null },
];

const AD_DUPES = [
  { a: { id: "F-1877", name: "Protein bar · X-tend Cookies & Cream", kcal: 379, src: "BLS" },
    b: { id: "F-2198", name: "Protein bar · X-tend Cookie", kcal: 380, src: "user-submitted" }, sim: 0.94 },
  { a: { id: "F-0442", name: "Skyr natur 0,2% Fett", kcal: 63, src: "BLS" },
    b: { id: "F-1998", name: "Skyr natur (0.2%)", kcal: 64, src: "user-submitted" }, sim: 0.97 },
];

const AD_I18N = [
  { key: "nutrition.diary.empty",        de: "Noch nichts gegessen heute", en: "Nothing logged yet today", th: null },
  { key: "training.session.start",       de: "Session starten",            en: "Start session",            th: "เริ่มเซสชัน" },
  { key: "recovery.checkin.soreness",    de: "Muskelkater",                en: "Soreness",                 th: null },
  { key: "supplements.stack.empty",      de: null,                          en: "No supplements yet",       th: null },
  { key: "marketplace.checkout.confirm", de: "Kauf bestätigen",            en: "Confirm purchase",         th: "ยืนยันการซื้อ" },
];

const AD_AUDIT = [
  { at: "2026-05-16 14:22", actor: "tom@lumeos.app",   action: "user.view",        target: "user:u-432",       cat: "data_access", ip: "192.168.0.42" },
  { at: "2026-05-16 13:08", actor: "hanna@lumeos.app", action: "listing.remove",   target: "product:P-9912",   cat: "moderation",  ip: "192.168.0.51" },
  { at: "2026-05-16 09:14", actor: "tom@lumeos.app",   action: "coach.verify",     target: "coach:CV-7",       cat: "moderation",  ip: "192.168.0.42" },
  { at: "2026-05-15 18:32", actor: "system",           action: "listing.autoflag", target: "product:P-9912",   cat: "moderation",  ip: "—" },
  { at: "2026-05-15 16:00", actor: "erik@lumeos.app",  action: "user.export",      target: "user:u-118",       cat: "data_access", ip: "192.168.0.63" },
  { at: "2026-05-14 12:00", actor: "tom@lumeos.app",   action: "fooddb.merge",     target: "food:F-1877",      cat: "data",        ip: "192.168.0.42" },
  { at: "2026-05-13 11:00", actor: "system",           action: "user.autoban",     target: "user:u-7521",      cat: "user_management", ip: "—" },
  { at: "2026-05-12 22:00", actor: "hanna@lumeos.app", action: "gdpr.delete",      target: "user:u-6610",      cat: "auth",        ip: "192.168.0.51" },
];

const sevColor = (s) => s === "CRITICAL" ? "var(--neg)" : s === "HIGH" ? "var(--warn)" : s === "MEDIUM" ? "var(--acc-recov)" : "var(--fg-dim)";

// ══ Shell ═════════════════════════════════════════════
window.AdminModuleV2 = () => {
  const [tab, setTab] = useState("dashboard");
  const [modal, setModal] = useState(null);
  const modCount = AD_MOD_QUEUE.length + AD_COACH_PENDING.length;
  return (
    <>
      <div className="module-header">
        <div className="module-title-block">
          <div className="module-title-row">
            <span className="module-title">Admin</span>
            <Pill style={{color: "var(--neg)", borderColor: "color-mix(in srgb, var(--neg) 35%, var(--border))"}}>internal · admin.lumeos.app</Pill>
            <Pill><span className="dot" style={{background: "var(--warn)"}}/>1 service degraded</Pill>
            <Pill>role: admin</Pill>
          </div>
          <div className="module-sub">Business operations · users, content, analytics · separate from the Governance Console</div>
        </div>
        <div className="module-actions">
          <button className="btn" onClick={() => setModal("settings")}><Icon name="settings" className="ic ic-sm"/>Settings</button>
          <button className="btn"><Icon name="download" className="ic ic-sm"/>Export audit</button>
        </div>
      </div>

      <Tabs items={[
        { id: "dashboard",  label: "Dashboard" },
        { id: "users",      label: "Users", count: 12402 },
        { id: "moderation", label: "Moderation", count: modCount },
        { id: "analytics",  label: "Analytics" },
        { id: "system",     label: "System health" },
        { id: "exercises",  label: "Exercises", count: 1850 },
        { id: "routines",   label: "Routines" },
        { id: "fooddb",     label: "Food DB", count: 24 },
        { id: "content",    label: "Content · i18n" },
        { id: "notify",     label: "Notifications" },
        { id: "audit",      label: "Audit log" },
      ]} active={tab} onChange={setTab}/>

      <div style={{marginTop: 14}}>
        {tab === "dashboard"  && <AdDashboard/>}
        {tab === "users"      && <AdUsers/>}
        {tab === "moderation" && <AdModeration/>}
        {tab === "analytics"  && <AdAnalytics/>}
        {tab === "system"     && <AdSystem/>}
        {tab === "exercises"  && <AdExercises/>}
        {tab === "routines"   && <AdRoutines/>}
        {tab === "fooddb"     && <AdFoodDB/>}
        {tab === "content"    && <AdContent/>}
        {tab === "notify"     && <AdNotify/>}
        {tab === "audit"      && <AdAudit/>}
      </div>

      {modal === "settings" && <AdSettingsModal onClose={() => setModal(null)}/>}
    </>
  );
};

const AdDashboard = () => (
  <div>
    <div className="grid g-cols-4" style={{gap: 10, marginBottom: 14}}>
      {[
        ["DAU", "1,842", "+12% wow", [1620,1680,1710,1755,1790,1812,1842], "var(--acc-coach)"],
        ["MAU", "12,402", "+8% mom", [11200,11480,11720,11950,12140,12280,12402], "var(--acc-mkt)"],
        ["Mod queue", String(AD_MOD_QUEUE.length), "1 critical", null, "var(--warn)"],
        ["Uptime · 30d", "99.8%", "SLA 99.5%", null, "var(--pos)"],
      ].map(([l, v, s, spark, c]) => (
        <Card key={l} className="card-tight" style={{padding: 14, position: "relative", overflow: "hidden"}}>
          <div style={{position: "absolute", top: 0, left: 0, right: 0, height: 2, background: c, opacity: 0.6}}/>
          <div className="eyebrow" style={{marginBottom: 5}}>{l}</div>
          <div className="num" style={{fontSize: 22, fontWeight: 500, marginBottom: 3}}>{v}</div>
          <div className="dim" style={{fontSize: 10.5, marginBottom: spark ? 7 : 0}}>{s}</div>
          {spark && <Sparkline data={spark} color={c} h={26}/>}
        </Card>
      ))}
    </div>
    <div className="grid" style={{gridTemplateColumns: "1.5fr 1fr", gap: 14}}>
      <Card title="DAU · last 90 days" sub="daily active users">
        <LineChart h={200} range={[1200, 2000]} xLabels={["Feb","","","Mar","","","Apr","","","May"]}
          series={[{ data: [1310,1372,1418,1466,1512,1554,1601,1668,1742,1842], color: "var(--acc-coach)" }]}/>
      </Card>
      <Card title="Module adoption" sub="% of MAU using each module">
        {[["Training",84],["Nutrition",78],["Recovery",72],["Supplements",56],["Goals",48],["Coach",34],["Medical",22],["Marketplace",18]].map(([m, p]) => (
          <div key={m} style={{display: "grid", gridTemplateColumns: "96px 1fr 38px", gap: 9, alignItems: "center", marginBottom: 6, fontSize: 11.5}}>
            <span>{m}</span>
            <div style={{height: 6, background: "var(--surface-2)", borderRadius: 999}}>
              <div style={{height: "100%", width: p + "%", background: "var(--acc-coach)", borderRadius: 999}}/>
            </div>
            <span className="num" style={{textAlign: "right"}}>{p}%</span>
          </div>
        ))}
      </Card>
    </div>
    <div style={{height: 14}}/>
    <Card title="Recent activity" sub="last 20 actions across all users">
      <table className="tbl">
        <tbody>
          {[
            ["14:24", "u-1120", "logged a workout", "Training"],
            ["14:22", "tom@lumeos.app", "viewed user u-432", "Admin"],
            ["14:19", "u-8802", "purchased 12-Week Lean Bulk Bundle", "Marketplace"],
            ["14:14", "u-4402", "submitted a food entry", "Nutrition"],
            ["14:11", "u-6610", "requested account deletion", "Auth"],
            ["14:02", "system", "auto-flagged listing P-9912", "Moderation"],
          ].map((r, i) => (
            <tr key={i}>
              <td className="num muted" style={{width: 70}}>{r[0]}</td>
              <td className="mono" style={{width: 170, fontSize: 11}}>{r[1]}</td>
              <td style={{fontSize: 12}}>{r[2]}</td>
              <td style={{width: 120}}><Pill>{r[3]}</Pill></td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  </div>
);

const AdUsers = () => {
  const [q, setQ] = useState("");
  const [tier, setTier] = useState("All");
  const [role, setRole] = useState("All");
  const [status, setStatus] = useState("All");
  const [det, setDet] = useState(null);
  const rows = AD_USERS.filter(u => {
    if (q && !(u.name + u.email).toLowerCase().includes(q.toLowerCase())) return false;
    if (tier !== "All" && u.tier !== tier) return false;
    if (role !== "All" && u.role !== role) return false;
    if (status !== "All" && u.status !== status) return false;
    return true;
  });
  return (
    <>
      <div style={{display: "flex", gap: 8, marginBottom: 14}}>
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search name or email…" style={{flex: 1, height: 32, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, padding: "0 12px", fontSize: 12}}/>
        {[["Tier", tier, setTier, ["All","Free","Plus","Pro","Elite","—"]],
          ["Role", role, setRole, ["All","user","coach","admin"]],
          ["Status", status, setStatus, ["All","active","verified","suspended","banned"]]].map(([l, v, set, opts]) => (
          <select key={l} value={v} onChange={e => set(e.target.value)} style={{height: 32, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, padding: "0 10px", fontSize: 12}}>
            {opts.map(o => <option key={o} value={o}>{o === "All" ? l + " · all" : o}</option>)}
          </select>
        ))}
      </div>
      <Card>
        <table className="tbl">
          <thead><tr><th>Name</th><th>Email</th><th style={{width: 70}}>Tier</th><th style={{width: 70}}>Role</th><th style={{width: 90}}>Status</th><th style={{width: 90}}>Joined</th><th style={{width: 90}}>Last active</th><th style={{width: 190, textAlign: "right"}}>Actions</th></tr></thead>
          <tbody>
            {rows.map(u => (
              <tr key={u.id} className="clickable" style={{cursor: "pointer", opacity: u.status === "banned" ? 0.6 : 1}} onClick={() => setDet(u)}>
                <td style={{fontSize: 12.5, fontWeight: 500}}>{u.name}</td>
                <td className="mono dim" style={{fontSize: 11}}>{u.email}</td>
                <td>{u.tier === "—" ? <span className="dim">—</span> : <Pill>{u.tier}</Pill>}</td>
                <td><Pill variant={u.role === "admin" ? "acc" : ""}>{u.role}</Pill></td>
                <td>{u.status === "banned" ? <Pill variant="block">banned</Pill> : u.status === "suspended" ? <Pill variant="warn">suspended</Pill> : <Pill variant="pos">{u.status}</Pill>}</td>
                <td className="num muted">{u.joined}</td>
                <td className="num muted">{u.last}</td>
                <td style={{textAlign: "right"}} onClick={e => e.stopPropagation()}>
                  <button className="btn btn-sm btn-ghost" onClick={() => setDet(u)}>View</button>
                  <button className="btn btn-sm btn-ghost">Role</button>
                  <button className="btn btn-sm btn-ghost" style={{color: "var(--warn)"}}>Suspend</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      {det && <AdUserDrawer u={det} onClose={() => setDet(null)}/>}
    </>
  );
};

const AdUserDrawer = ({ u, onClose }) => (
  <div className="modal-veil" onClick={onClose}>
    <div className="modal" style={{width: 620, maxHeight: "92vh"}} onClick={e => e.stopPropagation()}>
      <div className="modal-h">
        <div style={{width: 30, height: 30, borderRadius: 7, background: "var(--surface-2)", display: "grid", placeItems: "center", fontSize: 11, fontWeight: 600}}>{u.name.split(" ").map(x => x[0]).join("").slice(0,2)}</div>
        <div style={{flex: 1}}>
          <div style={{display: "flex", alignItems: "center", gap: 7}}>
            <span style={{fontSize: 14, fontWeight: 600}}>{u.name}</span>
            <Pill variant={u.role === "admin" ? "acc" : ""}>{u.role}</Pill>
            {u.status === "banned" ? <Pill variant="block">banned</Pill> : <Pill variant="pos">{u.status}</Pill>}
          </div>
          <div className="mono dim" style={{fontSize: 11}}>{u.email} · {u.id}</div>
        </div>
        <button className="icon-btn" onClick={onClose}><Icon name="x" className="ic"/></button>
      </div>
      <div className="modal-body" style={{overflowY: "auto"}}>
        <div className="grid g-cols-4" style={{gap: 9, marginBottom: 14}}>
          {[["Tier", u.tier], ["Joined", u.joined], ["Modules on", u.modules + " / 11"], ["Logins", u.logins]].map(([l, v]) => (
            <div key={l} style={{padding: 10, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6}}>
              <div className="eyebrow" style={{marginBottom: 3}}>{l}</div>
              <div className="num" style={{fontSize: 13}}>{v}</div>
            </div>
          ))}
        </div>
        <div className="eyebrow" style={{marginBottom: 7}}>Subscription</div>
        <div className="col-gap" style={{gap: 0, marginBottom: 14}}>
          <Row label="Plan" value={u.tier === "—" ? "coach seat · no consumer plan" : "Lumeos " + u.tier}/>
          <Row label="Status" value={u.status === "active" ? "paid · renews monthly" : u.status}/>
          <Row label="Wallet voucher" value="€52.50"/>
          <Row label="Lifetime spend" value="€418.20"/>
        </div>
        <div className="eyebrow" style={{marginBottom: 7}}>Login history · last 5</div>
        <table className="tbl" style={{marginBottom: 14}}>
          <tbody>
            {[["16 May 14:02","192.168.0.42","Chrome · macOS"],["15 May 08:31","84.112.x.x","iOS app"],["14 May 19:44","84.112.x.x","iOS app"],["13 May 07:12","192.168.0.42","Chrome · macOS"],["12 May 21:03","84.112.x.x","iOS app"]].map((r, i) => (
              <tr key={i}><td className="num muted" style={{width: 120}}>{r[0]}</td><td className="mono dim" style={{width: 130, fontSize: 11}}>{r[1]}</td><td style={{fontSize: 11.5}}>{r[2]}</td></tr>
            ))}
          </tbody>
        </table>
        <div className="eyebrow" style={{marginBottom: 7}}>Audit events for this user</div>
        <div className="col-gap" style={{gap: 4, marginBottom: 14}}>
          {AD_AUDIT.filter(a => a.target.includes("u-") ).slice(0, 3).map((a, i) => (
            <div key={i} style={{display: "flex", gap: 9, padding: "8px 10px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, fontSize: 11.5}}>
              <span className="num dim" style={{width: 110}}>{a.at.slice(5)}</span>
              <span className="mono">{a.action}</span>
              <span className="dim" style={{marginLeft: "auto"}}>{a.actor}</span>
            </div>
          ))}
        </div>
        <div style={{padding: 13, background: "color-mix(in srgb, var(--neg) 6%, var(--surface))", border: "1px solid color-mix(in srgb, var(--neg) 24%, var(--border))", borderRadius: 7}}>
          <div className="eyebrow" style={{marginBottom: 8, color: "var(--neg)"}}>Danger zone</div>
          <div style={{display: "flex", gap: 6, flexWrap: "wrap"}}>
            <button className="btn btn-sm">Change role</button>
            <button className="btn btn-sm" style={{color: "var(--warn)", borderColor: "color-mix(in srgb, var(--warn) 32%, var(--border))"}}>Suspend</button>
            <button className="btn btn-sm" style={{color: "var(--neg)", borderColor: "color-mix(in srgb, var(--neg) 32%, var(--border))"}}>Ban</button>
            <button className="btn btn-sm" style={{color: "var(--neg)", borderColor: "color-mix(in srgb, var(--neg) 32%, var(--border))"}}>Delete · GDPR</button>
          </div>
          <div className="dim" style={{fontSize: 10.5, marginTop: 8}}>Every action requires confirmation and is written to the audit log with your account and IP.</div>
        </div>
      </div>
    </div>
  </div>
);

const AdModeration = () => {
  const [sub, setSub] = useState("queue");
  return (
    <>
      <div style={{display: "flex", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, padding: 2, gap: 1, width: "fit-content", marginBottom: 14}}>
        {[["queue","Content queue"],["coaches","Coach verification"]].map(([k, l]) => (
          <button key={k} onClick={() => setSub(k)} className={sub === k ? "btn btn-primary" : "btn btn-ghost"} style={{height: 22, fontSize: 11, padding: "0 10px", borderRadius: 4}}>{l}</button>
        ))}
      </div>
      {sub === "queue" && (
        <div className="col-gap" style={{gap: 9}}>
          {AD_MOD_QUEUE.map(m => {
            const c = sevColor(m.severity);
            return (
              <Card key={m.id} style={{position: "relative"}}>
                <div style={{position: "absolute", left: 0, top: 12, bottom: 12, width: 3, background: c, borderRadius: "0 2px 2px 0"}}/>
                <div style={{paddingLeft: 10}}>
                  <div style={{display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap"}}>
                    <Pill style={{color: c, borderColor: `color-mix(in srgb, ${c} 35%, var(--border))`, background: `color-mix(in srgb, ${c} 8%, transparent)`}}>{m.severity}</Pill>
                    <span className="mono dim" style={{fontSize: 10.5}}>{m.id}</span>
                    <Pill>{m.kind}</Pill>
                    <span className="dim mono" style={{marginLeft: "auto", fontSize: 10}}>{m.at}</span>
                  </div>
                  <div style={{fontSize: 13.5, fontWeight: 600, marginBottom: 4}}>{m.title}</div>
                  <div className="muted" style={{fontSize: 12, lineHeight: 1.5, marginBottom: 4}}>{m.reason}</div>
                  <div className="dim mono" style={{fontSize: 10.5, marginBottom: 11}}>submitted by {m.by}</div>
                  <div style={{display: "flex", gap: 6}}>
                    <button className="btn btn-sm">Investigate</button>
                    <button className="btn btn-sm" style={{color: "var(--neg)", borderColor: "color-mix(in srgb, var(--neg) 32%, var(--border))"}}>Remove</button>
                    <button className="btn btn-sm">Approve</button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
      {sub === "coaches" && (
        <div className="col-gap" style={{gap: 11}}>
          {AD_COACH_PENDING.map(c => (
            <Card key={c.id}>
              <div style={{display: "flex", alignItems: "center", gap: 8, marginBottom: 10, flexWrap: "wrap"}}>
                <span className="mono dim" style={{fontSize: 10.5}}>{c.id}</span>
                <span style={{fontSize: 13.5, fontWeight: 600}}>{c.name}</span>
                <Pill>{c.type} coach</Pill>
                {c.flag ? <Pill variant="warn">needs attention</Pill> : <Pill variant="pos">docs complete</Pill>}
                <span className="dim mono" style={{marginLeft: "auto", fontSize: 10}}>applied {c.applied}</span>
              </div>
              <div className="grid g-cols-2" style={{gap: 12, marginBottom: 11}}>
                <div>
                  <div className="eyebrow" style={{marginBottom: 6}}>Submitted documents</div>
                  <div className="col-gap" style={{gap: 4}}>
                    {c.docs.map(d => (
                      <div key={d} style={{display: "flex", gap: 8, alignItems: "center", padding: "7px 10px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 5, fontSize: 11.5}}>
                        <Icon name="file" className="ic ic-sm" style={{color: "var(--fg-muted)"}}/>
                        <span className="mono">{d}</span>
                        <button className="btn btn-sm btn-ghost" style={{marginLeft: "auto"}}>Open</button>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="eyebrow" style={{marginBottom: 6}}>Specialisations</div>
                  <div style={{display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 10}}>{c.specs.map(s => <Pill key={s}>{s}</Pill>)}</div>
                  {c.flag && (
                    <div style={{padding: 10, background: "color-mix(in srgb, var(--warn) 7%, var(--surface))", border: "1px solid color-mix(in srgb, var(--warn) 25%, var(--border))", borderRadius: 6, fontSize: 11.5, color: "var(--fg-muted)", lineHeight: 1.45}}>{c.flag}</div>
                  )}
                </div>
              </div>
              <div style={{display: "flex", gap: 6}}>
                <button className="btn btn-primary btn-sm">Verify</button>
                <button className="btn btn-sm">Request more documents</button>
                <button className="btn btn-sm btn-ghost" style={{color: "var(--neg)"}}>Reject</button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  );
};

const AdAnalytics = () => (
  <div className="grid g-cols-2" style={{gap: 14}}>
    <Card title="User growth · 90 days">
      <LineChart h={180} range={[40000, 55000]} xLabels={["Feb","","","Mar","","","Apr","","","May"]}
        series={[{ data: [42000,43200,44500,45800,46200,47000,47800,48400,48700,48920], color: "var(--acc-coach)" }]}/>
    </Card>
    <Card title="Revenue · MRR 90 days">
      <LineChart h={180} range={[50000, 80000]} xLabels={["Feb","","","Mar","","","Apr","","","May"]}
        series={[{ data: [54000,57000,60000,62000,64000,67000,69000,71000,73000,74200], color: "var(--acc-mkt)" }]}/>
    </Card>
    <Card title="Tier distribution" sub="12,402 paying + free">
      <div style={{display: "flex", height: 34, borderRadius: 7, overflow: "hidden", border: "1px solid var(--border)", marginBottom: 12}}>
        {[["Free",66,"var(--fg-dim)"],["Pro",25,"var(--acc-coach)"],["Elite",9,"var(--acc-goals)"]].map(([l, p, c]) => (
          <div key={l} style={{flex: p, background: c, opacity: 0.55, display: "grid", placeItems: "center", fontSize: 10.5, fontFamily: "var(--font-mono)", color: "var(--fg)"}}>{l} {p}%</div>
        ))}
      </div>
      <Row label="Free" value="8,240 · 66%"/>
      <Row label="Pro" value="3,120 · 25%"/>
      <Row label="Elite" value="1,042 · 9%"/>
      <div className="divider"/>
      <Row label="Conversion · 30d" value="3.4%"/>
      <Row label="Churn · 30d" value="2.8% / mo"/>
    </Card>
    <Card title="Feature adoption" sub="daily active per module">
      {[["Meal log",91],["Workout log",86],["Buddy chat",72],["Recovery check-in",64],["Supplement track",58],["MealCam",41]].map(([l, p]) => (
        <div key={l} style={{display: "grid", gridTemplateColumns: "120px 1fr 38px", gap: 9, alignItems: "center", marginBottom: 6, fontSize: 11.5}}>
          <span>{l}</span>
          <div style={{height: 6, background: "var(--surface-2)", borderRadius: 999}}><div style={{height: "100%", width: p + "%", background: "var(--acc-mkt)", borderRadius: 999}}/></div>
          <span className="num" style={{textAlign: "right"}}>{p}%</span>
        </div>
      ))}
    </Card>
    <Card title="Training stats" style={{gridColumn: "span 1"}}>
      <Row label="Avg workouts / week" value="3.8"/>
      <Row label="Avg session duration" value="68 min"/>
      <Row label="Most popular split" value="PPL · 42% of users"/>
      <Row label="Most logged exercise" value="Bench Press · 84,120 sets"/>
    </Card>
    <Card title="Nutrition stats">
      <Row label="MealCam scans / day" value="4,820"/>
      <Row label="Avg calories tracked" value="2,410 kcal"/>
      <Row label="Users hitting protein target" value="58%"/>
      <Row label="Custom foods submitted / wk" value="112"/>
    </Card>
  </div>
);

const AdSystem = () => (
  <div className="col-gap" style={{gap: 14}}>
    <Card title="Service status" sub="10 services · 1 degraded">
      <div style={{display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 9}}>
        {AD_SERVICES.map(s => {
          const c = s.s === "healthy" ? "var(--pos)" : s.s === "degraded" ? "var(--warn)" : "var(--neg)";
          return (
            <div key={s.n} style={{padding: 11, background: "var(--surface)", border: `1px solid color-mix(in srgb, ${c} 26%, var(--border))`, borderRadius: 7}}>
              <div style={{display: "flex", alignItems: "center", gap: 6, marginBottom: 5}}>
                <span style={{width: 7, height: 7, borderRadius: 999, background: c, flexShrink: 0}}/>
                <span style={{fontSize: 11.5, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"}}>{s.n}</span>
              </div>
              <div className="num" style={{fontSize: 14, color: s.ms > 150 ? "var(--warn)" : "var(--fg)"}}>{s.ms}<span className="dim" style={{fontSize: 10}}>ms</span></div>
              <div className="dim mono" style={{fontSize: 9.5, marginTop: 2}}>:{s.port}</div>
            </div>
          );
        })}
      </div>
    </Card>
    <Card title="Spark cluster" sub="read-only mirror of the Governance Console runtime view">
      <div className="grid g-cols-4" style={{gap: 10}}>
        {AD_SPARKS.map(s => {
          const hot = s.s === "hot";
          return (
            <div key={s.id} style={{padding: 12, background: "var(--surface)", border: `1px solid ${hot ? "color-mix(in srgb, var(--warn) 30%, var(--border))" : "var(--border)"}`, borderRadius: 7}}>
              <div style={{display: "flex", alignItems: "center", gap: 6, marginBottom: 3}}>
                <span style={{width: 7, height: 7, borderRadius: 999, background: hot ? "var(--warn)" : "var(--pos)"}}/>
                <span style={{fontSize: 11.5, fontWeight: 600}}>{s.id.split(" · ")[0]}</span>
              </div>
              <div className="dim mono" style={{fontSize: 9.5, marginBottom: 9}}>{s.id.split(" · ")[1]} · {s.ip}</div>
              {[["GPU util", s.util + "%", s.util, 100, s.util > 85 ? "var(--warn)" : "var(--acc-mkt)"],
                ["Temp", s.temp + "°C", s.temp, 90, s.temp > 75 ? "var(--warn)" : "var(--acc-recov)"],
                ["VRAM", s.vram + " / " + s.vramTotal + " GB", s.vram, s.vramTotal, "var(--acc-buddy)"]].map(([l, v, cur, max, c]) => (
                <div key={l} style={{marginBottom: 7}}>
                  <div style={{display: "flex", justifyContent: "space-between", fontSize: 10, marginBottom: 3}}>
                    <span className="dim">{l}</span><span className="num">{v}</span>
                  </div>
                  <div style={{height: 4, background: "var(--surface-2)", borderRadius: 999}}>
                    <div style={{height: "100%", width: (cur / max * 100) + "%", background: c, borderRadius: 999}}/>
                  </div>
                </div>
              ))}
              <div className="dim mono" style={{fontSize: 9.5}}>{s.power} W</div>
            </div>
          );
        })}
      </div>
    </Card>
    <Card title="Error logs" sub="last 24 hours · grouped by message">
      <table className="tbl">
        <thead><tr><th style={{width: 90}}>Time</th><th style={{width: 130}}>Service</th><th style={{width: 70}}>Level</th><th>Message</th><th style={{width: 60, textAlign: "right"}}>Count</th><th style={{width: 80, textAlign: "right"}}></th></tr></thead>
        <tbody>
          {AD_ERRORS.map((e, i) => (
            <tr key={i}>
              <td className="num muted">{e.at}</td>
              <td className="mono" style={{fontSize: 11}}>{e.svc}</td>
              <td>{e.lvl === "error" ? <Pill variant="block">error</Pill> : <Pill variant="warn">warn</Pill>}</td>
              <td className="muted" style={{fontSize: 11.5}}>{e.msg}</td>
              <td className="num" style={{textAlign: "right"}}>{e.n}×</td>
              <td style={{textAlign: "right"}}><button className="btn btn-sm btn-ghost">Trace</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
    <Card title="Database" sub="PostgreSQL · Supabase">
      <div className="grid g-cols-4" style={{gap: 10}}>
        {[["Total size","18.4 GB"],["Largest table","training.sets · 6.2 GB"],["Row count","142.8 M"],["Last migration","2026-05-12 · 0184_market_wallets"]].map(([l, v]) => (
          <div key={l} style={{padding: 11, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6}}>
            <div className="eyebrow" style={{marginBottom: 3}}>{l}</div>
            <div className="num" style={{fontSize: 12.5}}>{v}</div>
          </div>
        ))}
      </div>
    </Card>
  </div>
);

const AdExercises = () => {
  const [q, setQ] = useState("");
  const [flag, setFlag] = useState("All");
  const rows = AD_EXERCISES.filter(e => {
    if (q && !e.name.toLowerCase().includes(q.toLowerCase())) return false;
    if (flag === "Issues" && e.quality === "ok") return false;
    return true;
  });
  const bad = AD_EXERCISES.filter(e => e.quality !== "ok").length;
  return (
    <>
      <div className="grid g-cols-4" style={{gap: 10, marginBottom: 14}}>
        {[["Total exercises","1,850"],["Unique movements","1,200"],["Missing data", bad + " of 6 shown"],["Media assets","4,645 img · 2,363 video"]].map(([l, v]) => (
          <Card key={l} className="card-tight" style={{padding: 13}}>
            <div className="eyebrow" style={{marginBottom: 4}}>{l}</div>
            <div className="num" style={{fontSize: 17, fontWeight: 500}}>{v}</div>
          </Card>
        ))}
      </div>
      <div style={{display: "flex", gap: 8, marginBottom: 14}}>
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search 1,850 exercises…" style={{flex: 1, height: 32, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, padding: "0 12px", fontSize: 12}}/>
        <select value={flag} onChange={e => setFlag(e.target.value)} style={{height: 32, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, padding: "0 10px", fontSize: 12}}>
          <option>All</option><option>Issues</option>
        </select>
        <button className="btn"><Icon name="download" className="ic ic-sm"/>Export CSV</button>
        <button className="btn"><Icon name="plus" className="ic ic-sm"/>Bulk assign muscles</button>
      </div>
      <Card>
        <table className="tbl">
          <thead><tr><th style={{width: 80}}>ID</th><th>Name</th><th style={{width: 90}}>Category</th><th>Muscles</th><th style={{width: 100}}>Equipment</th><th style={{width: 90}}>Media</th><th style={{width: 110}}>Languages</th><th style={{width: 100}}>Quality</th></tr></thead>
          <tbody>
            {rows.map(e => (
              <tr key={e.id} className="clickable" style={{cursor: "pointer"}}>
                <td className="num muted">{e.id}</td>
                <td style={{fontSize: 12.5, fontWeight: 500}}>{e.name}</td>
                <td className="muted">{e.cat}</td>
                <td>{e.muscles.length ? <div style={{display: "flex", gap: 3, flexWrap: "wrap"}}>{e.muscles.map(m => <Pill key={m} style={{fontSize: 9.5}}>{m}</Pill>)}</div> : <span style={{color: "var(--neg)", fontSize: 11}}>none assigned</span>}</td>
                <td className="muted" style={{fontSize: 11.5}}>{e.equip}</td>
                <td className="num" style={{color: e.media === 0 ? "var(--neg)" : "var(--fg)"}}>{e.media} img{e.video && " · vid"}</td>
                <td>{["de","en","th"].map(l => (
                  <span key={l} className="mono" style={{fontSize: 9.5, marginRight: 4, color: e.i18n.includes(l) ? "var(--pos)" : "var(--fg-dim)"}}>{l}</span>
                ))}</td>
                <td>{e.quality === "ok" ? <Pill variant="pos">ok</Pill> : e.quality === "warn" ? <Pill variant="warn">incomplete</Pill> : <Pill variant="block">missing data</Pill>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </>
  );
};

const AdRoutines = () => (
  <Card title="Routines & templates" sub="system templates and user routines across the platform">
    <table className="tbl">
      <thead><tr><th style={{width: 80}}>ID</th><th>Name</th><th style={{width: 100}}>Kind</th><th style={{width: 160}}>Owner</th><th style={{width: 90, textAlign: "right"}}>Users</th><th style={{width: 90, textAlign: "right"}}>Copies</th><th style={{width: 80, textAlign: "right"}}>Rating</th><th style={{width: 80, textAlign: "right"}}></th></tr></thead>
      <tbody>
        {AD_ROUTINES.map(r => (
          <tr key={r.id} className="clickable" style={{cursor: "pointer"}}>
            <td className="num muted">{r.id}</td>
            <td style={{fontSize: 12.5, fontWeight: 500}}>{r.name}</td>
            <td><Pill variant={r.kind === "template" ? "acc" : ""}>{r.kind}</Pill></td>
            <td className="muted" style={{fontSize: 11.5}}>{r.owner}</td>
            <td className="num" style={{textAlign: "right"}}>{r.users.toLocaleString()}</td>
            <td className="num muted" style={{textAlign: "right"}}>{r.copies.toLocaleString()}</td>
            <td className="num" style={{textAlign: "right"}}>{r.rating ? r.rating + " ★" : "—"}</td>
            <td style={{textAlign: "right"}}><button className="btn btn-sm btn-ghost">Edit</button></td>
          </tr>
        ))}
      </tbody>
    </table>
  </Card>
);

const AdFoodDB = () => {
  const [sub, setSub] = useState("pending");
  return (
    <>
      <div className="grid g-cols-4" style={{gap: 10, marginBottom: 14}}>
        {[["Total entries","7,140"],["Pending review","24"],["Duplicate flags","7"],["Last import","01 May · BLS 4.0"]].map(([l, v]) => (
          <Card key={l} className="card-tight" style={{padding: 13}}>
            <div className="eyebrow" style={{marginBottom: 4}}>{l}</div>
            <div className="num" style={{fontSize: 17, fontWeight: 500, color: l.includes("Pending") || l.includes("Duplicate") ? "var(--warn)" : "var(--fg)"}}>{v}</div>
          </Card>
        ))}
      </div>
      <div style={{display: "flex", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, padding: 2, gap: 1, width: "fit-content", marginBottom: 14}}>
        {[["pending","Pending review"],["dupes","Duplicate merger"]].map(([k, l]) => (
          <button key={k} onClick={() => setSub(k)} className={sub === k ? "btn btn-primary" : "btn btn-ghost"} style={{height: 22, fontSize: 11, padding: "0 10px", borderRadius: 4}}>{l}</button>
        ))}
      </div>
      {sub === "pending" && (
        <div className="col-gap" style={{gap: 9}}>
          {AD_FOOD_PENDING.map(f => (
            <Card key={f.id}>
              <div style={{display: "flex", alignItems: "center", gap: 8, marginBottom: 9, flexWrap: "wrap"}}>
                <span className="mono dim" style={{fontSize: 10.5}}>{f.id}</span>
                <span style={{fontSize: 13, fontWeight: 600}}>{f.name}</span>
                <Pill>{f.src}</Pill>
                {f.dupe && <Pill variant="warn">possible duplicate</Pill>}
                <span className="dim mono" style={{marginLeft: "auto", fontSize: 10}}>by {f.by} · {f.at}</span>
              </div>
              <div className="grid g-cols-4" style={{gap: 9, marginBottom: 11}}>
                {[["Energy", f.kcal + " kcal"],["Protein", f.p + " g"],["Carbs", f.c + " g"],["Fat", f.f + " g"]].map(([l, v]) => (
                  <div key={l} style={{padding: 10, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6}}>
                    <div className="eyebrow" style={{marginBottom: 3}}>{l}</div>
                    <div className="num" style={{fontSize: 13}}>{v}</div>
                  </div>
                ))}
              </div>
              {f.dupe && <div style={{padding: 10, background: "color-mix(in srgb, var(--warn) 7%, var(--surface))", border: "1px solid color-mix(in srgb, var(--warn) 25%, var(--border))", borderRadius: 6, fontSize: 11.5, marginBottom: 11}}>Matches existing entry <span className="mono">{f.dupe}</span></div>}
              <div style={{display: "flex", gap: 6}}>
                <button className="btn btn-primary btn-sm">Approve</button>
                <button className="btn btn-sm">Edit values</button>
                <button className="btn btn-sm">Flag duplicate</button>
                <button className="btn btn-sm btn-ghost" style={{color: "var(--neg)"}}>Reject</button>
              </div>
            </Card>
          ))}
        </div>
      )}
      {sub === "dupes" && (
        <div className="col-gap" style={{gap: 11}}>
          {AD_DUPES.map((d, i) => (
            <Card key={i}>
              <div style={{display: "flex", alignItems: "center", gap: 8, marginBottom: 11}}>
                <span style={{fontSize: 12.5, fontWeight: 600}}>Similarity {Math.round(d.sim * 100)}%</span>
                <Pill variant="warn">review before merge</Pill>
              </div>
              <div className="grid g-cols-2" style={{gap: 11, marginBottom: 11}}>
                {[["Keep", d.a], ["Merge into above", d.b]].map(([lbl, x]) => (
                  <div key={x.id} style={{padding: 12, background: "var(--surface)", border: `1px solid ${lbl === "Keep" ? "color-mix(in srgb, var(--pos) 26%, var(--border))" : "var(--border)"}`, borderRadius: 7}}>
                    <div className="eyebrow" style={{marginBottom: 5, color: lbl === "Keep" ? "var(--pos)" : "var(--fg-dim)"}}>{lbl}</div>
                    <div style={{fontSize: 12.5, fontWeight: 600, marginBottom: 3}}>{x.name}</div>
                    <div className="dim mono" style={{fontSize: 10.5}}>{x.id} · {x.src} · {x.kcal} kcal</div>
                  </div>
                ))}
              </div>
              <div style={{display: "flex", gap: 6}}>
                <button className="btn btn-primary btn-sm">Merge</button>
                <button className="btn btn-sm">Keep both</button>
                <button className="btn btn-sm btn-ghost">Compare all nutrients</button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  );
};

const AdContent = () => {
  const langs = ["de", "en", "th"];
  const coverage = langs.map(l => ({ l, pct: Math.round(AD_I18N.filter(k => k[l]).length / AD_I18N.length * 100) }));
  return (
    <>
      <div className="grid g-cols-3" style={{gap: 10, marginBottom: 14}}>
        {coverage.map(c => (
          <Card key={c.l} className="card-tight" style={{padding: 14}}>
            <div className="eyebrow" style={{marginBottom: 5}}>{c.l.toUpperCase()} coverage</div>
            <div className="num" style={{fontSize: 22, fontWeight: 500, marginBottom: 7, color: c.pct === 100 ? "var(--pos)" : c.pct >= 80 ? "var(--warn)" : "var(--neg)"}}>{c.pct}%</div>
            <div style={{height: 6, background: "var(--surface-2)", borderRadius: 999}}>
              <div style={{height: "100%", width: c.pct + "%", background: c.pct === 100 ? "var(--pos)" : c.pct >= 80 ? "var(--warn)" : "var(--neg)", borderRadius: 999}}/>
            </div>
          </Card>
        ))}
      </div>
      <Card title="Translation keys" sub="missing entries highlighted · edit inline">
        <table className="tbl">
          <thead><tr><th style={{width: 240}}>Key</th><th>DE</th><th>EN</th><th>TH</th></tr></thead>
          <tbody>
            {AD_I18N.map(k => (
              <tr key={k.key}>
                <td className="mono" style={{fontSize: 11}}>{k.key}</td>
                {langs.map(l => (
                  <td key={l}>
                    {k[l]
                      ? <span style={{fontSize: 11.5}}>{k[l]}</span>
                      : <button className="btn btn-sm" style={{color: "var(--neg)", borderColor: "color-mix(in srgb, var(--neg) 30%, var(--border))", height: 22, fontSize: 10.5}}>+ add {l}</button>}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </>
  );
};

const AdNotify = () => (
  <div className="grid" style={{gridTemplateColumns: "1.3fr 1fr", gap: 14}}>
    <Card title="Send push notification" sub="all users or a segment">
      <div className="col-gap" style={{gap: 12}}>
        <div>
          <div className="eyebrow" style={{marginBottom: 4}}>Audience</div>
          <select style={{width: "100%", height: 32, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, padding: "0 10px", fontSize: 12}}>
            <option>All users · 12,402</option>
            <option>Pro + Elite only · 4,162</option>
            <option>Inactive 14 days · 1,840</option>
            <option>Coaches only · 248</option>
          </select>
        </div>
        <div><div className="eyebrow" style={{marginBottom: 4}}>Title</div><input placeholder="Short headline" style={{width: "100%", height: 32, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, padding: "0 10px", fontSize: 12}}/></div>
        <div><div className="eyebrow" style={{marginBottom: 4}}>Body</div><textarea placeholder="Message body…" style={{width: "100%", minHeight: 70, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, padding: 10, fontSize: 12, fontFamily: "var(--font-sans)", resize: "vertical", outline: "none"}}/></div>
        <div style={{display: "flex", gap: 6}}>
          <button className="btn btn-primary">Send now</button>
          <button className="btn">Schedule</button>
          <button className="btn btn-ghost">Preview</button>
        </div>
      </div>
    </Card>
    <div className="col-gap" style={{gap: 14}}>
      <Card title="Recent sends">
        {[["14 May","Weekly recap is live","All · 12,402","open 34%"],["8 May","New: phase engine in Goals","Pro + Elite","open 51%"],["1 May","We missed you","Inactive 14d","open 12%"]].map((r, i) => (
          <div key={i} style={{padding: "9px 0", borderBottom: i < 2 ? "1px solid var(--border)" : "none"}}>
            <div style={{display: "flex", alignItems: "baseline", gap: 8, marginBottom: 2}}>
              <span className="num dim" style={{fontSize: 10.5, width: 46}}>{r[0]}</span>
              <span style={{fontSize: 12, fontWeight: 500}}>{r[1]}</span>
              <span className="num dim" style={{marginLeft: "auto", fontSize: 10.5}}>{r[3]}</span>
            </div>
            <div className="dim" style={{fontSize: 10.5, paddingLeft: 54}}>{r[2]}</div>
          </div>
        ))}
      </Card>
      <Card title="Feedback queue" sub="from users, flagged items first">
        {[["Exercise E-1120 has no instructions","3 reports","warn"],["MealCam misreads oat milk","8 reports","warn"],["Love the phase engine","—",""]].map((r, i) => (
          <div key={i} style={{padding: "9px 0", borderBottom: i < 2 ? "1px solid var(--border)" : "none", display: "flex", alignItems: "center", gap: 8}}>
            <span style={{fontSize: 11.5, flex: 1}}>{r[0]}</span>
            {r[1] !== "—" && <Pill variant={r[2]}>{r[1]}</Pill>}
          </div>
        ))}
      </Card>
    </div>
  </div>
);

const AdAudit = () => {
  const [cat, setCat] = useState("All");
  const [q, setQ] = useState("");
  const cats = ["All", "user_management", "content", "data_access", "data", "system", "auth", "moderation"];
  const rows = AD_AUDIT.filter(a => {
    if (cat !== "All" && a.cat !== cat) return false;
    if (q && !(a.actor + a.action + a.target).toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });
  return (
    <>
      <div style={{display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap", alignItems: "center"}}>
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search actor, action or target…" style={{flex: 1, minWidth: 220, height: 32, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, padding: "0 12px", fontSize: 12}}/>
        <select value={cat} onChange={e => setCat(e.target.value)} style={{height: 32, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, padding: "0 10px", fontSize: 12}}>
          {cats.map(c => <option key={c}>{c}</option>)}
        </select>
        <button className="btn"><Icon name="download" className="ic ic-sm"/>Export CSV</button>
      </div>
      <Card title="Audit trail" sub={`${rows.length} of 24,820 entries`}>
        <table className="tbl">
          <thead><tr><th style={{width: 150}}>Timestamp</th><th style={{width: 170}}>Actor</th><th style={{width: 160}}>Action</th><th>Target</th><th style={{width: 150}}>Category</th><th style={{width: 120}}>IP</th></tr></thead>
          <tbody>
            {rows.map((a, i) => (
              <tr key={i}>
                <td className="num muted" style={{fontSize: 11}}>{a.at}</td>
                <td className="mono" style={{fontSize: 11}}>{a.actor}</td>
                <td className="mono" style={{fontSize: 11.5}}>{a.action}</td>
                <td className="mono dim" style={{fontSize: 11}}>{a.target}</td>
                <td><Pill>{a.cat}</Pill></td>
                <td className="mono dim" style={{fontSize: 10.5}}>{a.ip}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </>
  );
};

const AdSettingsModal = ({ onClose }) => (
  <div className="modal-veil" onClick={onClose}>
    <div className="modal" style={{width: 600, maxHeight: "90vh"}} onClick={e => e.stopPropagation()}>
      <div className="modal-h">
        <div style={{width: 26, height: 26, borderRadius: 6, background: "color-mix(in srgb, var(--acc-admin) 18%, transparent)", border: "1px solid color-mix(in srgb, var(--acc-admin) 35%, var(--border))", color: "var(--acc-admin)", display: "grid", placeItems: "center"}}><Icon name="settings" className="ic"/></div>
        <div style={{flex: 1}}><div style={{fontSize: 14, fontWeight: 600}}>Admin settings</div><div className="dim" style={{fontSize: 11}}>platform · moderation · notifications</div></div>
        <button className="icon-btn" onClick={onClose}><Icon name="x" className="ic"/></button>
      </div>
      <div className="modal-body" style={{overflowY: "auto"}}>
        {[
          ["Platform", [["Maintenance mode","off"],["Open registration","on"],["Referral programme","on"],["New coach applications","open"]]],
          ["Moderation", [["Auto-flag threshold","0.75 confidence"],["Banned ingredient list","42 entries"],["Auto-ban after reports","5 confirmed"],["Review SLA","24 hours"]]],
          ["Notifications", [["Admin alert email","ops@lumeos.app"],["Critical alert channel","Slack #ops-critical"],["Uptime alert threshold","< 99.5% / 1h"],["Queue alert threshold","> 10 pending"]]],
        ].map(([sec, rows]) => (
          <div key={sec} style={{marginBottom: 16}}>
            <div className="eyebrow" style={{marginBottom: 8}}>{sec}</div>
            <div className="col-gap" style={{gap: 0}}>
              {rows.map(([l, v]) => <Row key={l} label={l} value={v}/>)}
            </div>
          </div>
        ))}
      </div>
      <div className="modal-f">
        <button className="btn btn-ghost" onClick={onClose}>Close</button>
        <button className="btn btn-primary">Save changes</button>
      </div>
    </div>
  </div>
);

Object.assign(window, { AD_USERS, AD_MOD_QUEUE, AD_SERVICES, AD_SPARKS, AD_AUDIT });
