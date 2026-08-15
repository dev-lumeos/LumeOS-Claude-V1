// Marketplace · Auth · Admin — three modules in one file (compact, full per spec)

// ═══════════════════════════════════════════════════════════
// MARKETPLACE
// ═══════════════════════════════════════════════════════════

const MARKETPLACE_CATEGORIES = ["All", "Supplements", "Equipment", "Coaching", "Plans"];
const MARKETPLACE_PRODUCTS = [
  { id: "p1",  name: "Creatine Monohydrate · 1kg",         cat: "Supplements", price: 24.90, rating: 4.9, reviews: 1240, vendor: "Bulk Powders", verified: true,  inStack: true,  evidence: "A",  img: "supplements" },
  { id: "p2",  name: "Whey Isolate · Vanilla 2kg",         cat: "Supplements", price: 62.00, rating: 4.8, reviews: 880,  vendor: "ESN",          verified: true,  inStack: true,  evidence: "A",  img: "supplements" },
  { id: "p3",  name: "Nordic Naturals Omega-3 (60ct)",     cat: "Supplements", price: 38.50, rating: 4.9, reviews: 412,  vendor: "Nordic Naturals", verified: true, inStack: true, evidence: "A",  img: "supplements" },
  { id: "p4",  name: "Magnesium Glycinate · 90ct",         cat: "Supplements", price: 18.90, rating: 4.7, reviews: 234,  vendor: "Pure Encapsulations", verified: true, inStack: true, evidence: "A", img: "supplements" },
  { id: "p5",  name: "Olympic Barbell · 20kg",             cat: "Equipment",  price: 220.00, rating: 4.8, reviews: 80,  vendor: "Rogue Fitness", verified: true,  img: "training" },
  { id: "p6",  name: "Adjustable Dumbbells · pair 2-32kg", cat: "Equipment",  price: 580.00, rating: 4.6, reviews: 162, vendor: "Powerblock",    verified: true,  img: "training" },
  { id: "p7",  name: "12-week Hypertrophy Plan",            cat: "Plans",      price: 49.00,  rating: 4.9, reviews: 412, vendor: "Anders Lindqvist", verified: true, img: "training" },
  { id: "p8",  name: "Marathon Sub-3 Program",              cat: "Plans",      price: 89.00,  rating: 4.7, reviews: 188, vendor: "Coach Erik",       verified: true, img: "training" },
  { id: "p9",  name: "1-on-1 Nutrition Coaching",           cat: "Coaching",   price: 120.00, rating: 4.8, reviews: 64,  vendor: "Jana Bauer",        verified: true, img: "nutrition", recurring: "monthly" },
  { id: "p10", name: "Training Periodization · 3 month",    cat: "Coaching",   price: 540.00, rating: 4.9, reviews: 88,  vendor: "Anders Lindqvist", verified: true, img: "training",  recurring: "3 months" },
  { id: "p11", name: "Beta-Alanine · 500g Bulk",            cat: "Supplements", price: 19.90, rating: 4.5, reviews: 88,  vendor: "Bulk Powders", verified: true,  evidence: "B+", img: "supplements" },
  { id: "p12", name: "Power rack with safety pins",         cat: "Equipment",  price: 880.00, rating: 4.8, reviews: 24,  vendor: "Rogue Fitness", verified: true,  img: "training" },
];

const COACH_PROFILES = [
  { id: "cp1", name: "Anders Lindqvist",  type: "Training",  price: "€180/mo", rating: 4.9, reviews: 88,  athletes: 14, since: "5 yr", bio: "Periodization specialist. NSCA-CSCS. Performance Lab Stockholm." },
  { id: "cp2", name: "Jana Bauer",         type: "Nutrition", price: "€120/mo", rating: 4.8, reviews: 64,  athletes: 9, since: "4 yr", bio: "Sports nutrition · DGE certified. Recomp specialist." },
  { id: "cp3", name: "David Park",         type: "Supplement",price: "€60/mo",  rating: 4.7, reviews: 142, athletes: 22, since: "3 yr", bio: "Examine.com contributor. Evidence-led, no upsell." },
  { id: "cp4", name: "Dr. M. Kessler",     type: "Medical",   price: "€680/yr", rating: 5.0, reviews: 38,  athletes: 12, since: "12 yr", bio: "Endokrinologe · DGE-Mitglied. TRT specialist." },
  { id: "cp5", name: "Erik Lange",         type: "Training",  price: "€140/mo", rating: 4.7, reviews: 41,  athletes: 8,  since: "3 yr", bio: "Powerlifting + endurance hybrid coach." },
  { id: "cp6", name: "Hanna Brodersen",    type: "Recovery",  price: "€90/mo",  rating: 4.8, reviews: 56,  athletes: 6,  since: "2 yr", bio: "Sleep + HRV coaching. Whoop + Garmin specialist." },
];

const ORDERS = [
  { id: "O-2415", date: "2026-05-12", items: 2, total: 81.00, status: "delivered", products: ["Whey Isolate", "Magnesium Glycinate"] },
  { id: "O-2398", date: "2026-04-28", items: 1, total: 38.50, status: "delivered", products: ["Nordic Naturals Omega-3"] },
  { id: "O-2387", date: "2026-04-14", items: 1, total: 49.00, status: "delivered", products: ["12-week Hypertrophy Plan"] },
  { id: "O-2351", date: "2026-03-22", items: 3, total: 120.40, status: "delivered", products: ["Creatine", "Beta-Alanine", "Caffeine"] },
];

const SUBSCRIPTIONS = [
  { id: "s1", item: "Anders Lindqvist · Training", price: "€180/mo", since: "Aug 2024", nextBill: "Jun 12", status: "active" },
  { id: "s2", item: "Jana Bauer · Nutrition",      price: "€120/mo", since: "Jan 2026", nextBill: "Jun 18", status: "active" },
  { id: "s3", item: "Nordic Naturals · quarterly", price: "€38.50/q", since: "2024", nextBill: "Jul 28", status: "active" },
];

const MarketplaceModule = () => {
  const [tab, setTab] = useState("home");
  const [cat, setCat] = useState("All");
  return (
    <>
      <div className="module-header">
        <div className="module-title-block">
          <div className="module-title-row">
            <span className="module-title">Marketplace</span>
            <Pill variant="acc">{MARKETPLACE_PRODUCTS.length}+ verified products</Pill>
            <Pill><span className="dot" style={{background: "var(--pos)"}}/>{COACH_PROFILES.length} coaches</Pill>
          </div>
          <div className="module-sub">Verified-only · supplements, equipment, coaching, plans · 15% take rate funds Lumeos</div>
        </div>
        <div className="module-actions">
          <button className="btn"><Icon name="bookmark" className="ic ic-sm"/>Wishlist · 23</button>
          <button className="btn"><Icon name="marketplace" className="ic ic-sm"/>Cart · 0</button>
        </div>
      </div>
      <Tabs items={[
        { id: "home",          label: "Home" },
        { id: "browse",        label: "Browse", count: MARKETPLACE_PRODUCTS.length },
        { id: "coaches",       label: "Coaches", count: COACH_PROFILES.length },
        { id: "plans",         label: "Plan store" },
        { id: "licenses",      label: "Licenses", count: 4 },
        { id: "scoring",       label: "Scoring & fees" },
        { id: "buddy",         label: "Buddy & placements" },
        { id: "orders",        label: "Orders", count: ORDERS.length },
        { id: "subscriptions", label: "Subscriptions", count: SUBSCRIPTIONS.length },
        { id: "wallet",        label: "Wallet" },
        { id: "seller",        label: "Seller dashboard" },
      ]} active={tab} onChange={setTab}/>
      {tab === "home"          && window.MarketHome && <window.MarketHome/>}
      {tab === "browse"        && (window.MarketBrowseV2 ? <window.MarketBrowseV2/> : <MarketBrowse cat={cat} setCat={setCat}/>)}
      {tab === "coaches"       && <MarketCoaches/>}
      {tab === "plans"         && <MarketPlans/>}
      {tab === "licenses"      && window.MarketLicenses && <window.MarketLicenses/>}
      {tab === "scoring"       && window.MarketScoring && <window.MarketScoring/>}
      {tab === "buddy"         && window.MarketBuddyGateway && <window.MarketBuddyGateway/>}
      {tab === "orders"        && (window.MarketOrdersV2 ? <window.MarketOrdersV2/> : <MarketOrders/>)}
      {tab === "subscriptions" && (window.MarketSubsV2 ? <window.MarketSubsV2/> : <MarketSubs/>)}
      {tab === "wallet"        && (window.MarketWalletV2 ? <window.MarketWalletV2/> : window.MarketWallet ? <window.MarketWallet/> : null)}
      {tab === "seller"        && (window.MarketSellerV2 ? <window.MarketSellerV2/> : <MarketSeller/>)}
    </>
  );
};

const MarketBrowse = ({ cat, setCat }) => {
  const [q, setQ] = useState("");
  const products = MARKETPLACE_PRODUCTS.filter(p => {
    if (cat !== "All" && p.cat !== cat) return false;
    if (q && !p.name.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });
  return (
    <div>
      <div style={{display: "flex", gap: 8, marginBottom: 14}}>
        <div style={{flex: 1, position: "relative"}}>
          <Icon name="search" className="ic ic-sm" style={{position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--fg-subtle)"}}/>
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search marketplace · products, brands, vendors…" style={{width: "100%", height: 34, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 7, padding: "0 12px 0 32px", fontSize: 12}}/>
        </div>
        <button className="btn"><Icon name="filter" className="ic ic-sm"/>Filters</button>
        <select style={{height: 34, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 7, padding: "0 10px", fontSize: 12}}>
          <option>Sort · Featured</option><option>Sort · Price ↑</option><option>Sort · Rating</option><option>Sort · Newest</option>
        </select>
      </div>
      <div style={{display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap"}}>
        {MARKETPLACE_CATEGORIES.map(c => (
          <button key={c} onClick={() => setCat(c)} className={cat === c ? "pill pill-acc" : "pill"} style={{cursor: "pointer", padding: "4px 12px", fontSize: 11.5}}>{c}</button>
        ))}
      </div>
      <div style={{display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12}}>
        {products.map(p => <ProductCard key={p.id} p={p}/>)}
      </div>
    </div>
  );
};

const ProductCard = ({ p }) => (
  <Card className="card-tight" style={{padding: 12, cursor: "pointer"}}>
    <div className="placeholder-img" style={{aspectRatio: "1", borderRadius: 6, marginBottom: 10, position: "relative"}}>
      <Icon name={p.img} className="ic" style={{width: 32, height: 32, color: "var(--fg-dim)"}}/>
      {p.verified && <Pill variant="pos" style={{position: "absolute", top: 6, left: 6, fontSize: 9}}>Verified</Pill>}
      {p.inStack && <Pill variant="acc" style={{position: "absolute", top: 6, right: 6, fontSize: 9}}>In stack</Pill>}
    </div>
    <div style={{fontSize: 12.5, fontWeight: 600, marginBottom: 3, lineHeight: 1.3, minHeight: 32}}>{p.name}</div>
    <div className="dim" style={{fontSize: 10.5, marginBottom: 6}}>{p.vendor} {p.evidence ? `· Evidence ${p.evidence}` : ""}</div>
    <div style={{display: "flex", alignItems: "center", justifyContent: "space-between"}}>
      <span className="num" style={{fontSize: 15, fontWeight: 600}}>€{p.price.toFixed(2)}{p.recurring ? <span className="dim" style={{fontSize: 10, marginLeft: 2}}>/{p.recurring}</span> : ""}</span>
      <span className="dim" style={{fontSize: 10}}>{p.rating} ★ ({p.reviews})</span>
    </div>
  </Card>
);

const MarketCoaches = () => {
  const [prof, setProf] = useState(null);
  return (
  <>
  <div className="grid g-cols-3" style={{gap: 12}}>
    {COACH_PROFILES.map(c => (
      <Card key={c.id} style={{cursor: "pointer"}} onClick={() => setProf(c.name)}>
        <div style={{display: "flex", alignItems: "center", gap: 10, marginBottom: 10}}>
          <div style={{width: 44, height: 44, borderRadius: 10, background: "var(--acc-coach)", color: "var(--bg)", display: "grid", placeItems: "center", fontWeight: 600, fontSize: 14}}>{c.name.split(" ").map(x => x[0]).join("")}</div>
          <div style={{flex: 1}}>
            <div style={{fontSize: 13, fontWeight: 600}}>{c.name}</div>
            <div className="dim mono" style={{fontSize: 10}}>{c.type} · {c.athletes} athletes</div>
          </div>
        </div>
        <div className="muted" style={{fontSize: 11.5, lineHeight: 1.5, marginBottom: 10}}>{c.bio}</div>
        <div style={{display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8}}>
          <span className="num" style={{fontSize: 14, fontWeight: 600}}>{c.price}</span>
          <span className="dim" style={{fontSize: 10}}>{c.rating} ★ · {c.reviews} reviews</span>
        </div>
        <div style={{display: "flex", gap: 6}}>
          <button className="btn btn-primary btn-sm" style={{flex: 1}} onClick={e => e.stopPropagation()}>Hire coach</button>
          <button className="btn btn-ghost btn-sm" onClick={e => { e.stopPropagation(); setProf(c.name); }}>View profile</button>
        </div>
      </Card>
    ))}
  </div>
  {prof && window.CreatorProfileModal && <window.CreatorProfileModal name={prof} onClose={() => setProf(null)}/>}
  </>
  );
};

const MarketPlans = () => (
  <div className="grid g-cols-3" style={{gap: 12}}>
    {MARKETPLACE_PRODUCTS.filter(p => p.cat === "Plans").map(p => <ProductCard key={p.id} p={p}/>)}
    {[
      { id: "tp1", name: "Beginner Linear · 12 weeks",   vendor: "Anders Lindqvist", price: 29.00, rating: 4.7, reviews: 540, cat: "Plans", img: "training", evidence: "A" },
      { id: "tp2", name: "5/3/1 BBB · 12 weeks",         vendor: "Tom Müller",        price: 39.00, rating: 4.8, reviews: 312, cat: "Plans", img: "training", evidence: "A" },
      { id: "tp3", name: "Cut · 8 weeks meal plan",      vendor: "Jana Bauer",       price: 49.00, rating: 4.9, reviews: 224, cat: "Plans", img: "nutrition", evidence: "A" },
    ].map(p => <ProductCard key={p.id} p={p}/>)}
  </div>
);

const MarketOrders = () => (
  <Card title="Order history" sub={`${ORDERS.length} orders · last 90 days`}>
    <table className="tbl">
      <thead><tr><th style={{width: 90}}>Order</th><th style={{width: 100}}>Date</th><th>Items</th><th style={{width: 80, textAlign: "right"}}>Total</th><th style={{width: 100}}>Status</th><th style={{width: 100, textAlign: "right"}}>Action</th></tr></thead>
      <tbody>
        {ORDERS.map(o => (
          <tr key={o.id}>
            <td className="num">{o.id}</td>
            <td className="num muted">{o.date}</td>
            <td className="muted" style={{fontSize: 11.5}}>{o.products.join(" · ")}</td>
            <td className="num" style={{textAlign: "right"}}>€{o.total.toFixed(2)}</td>
            <td><Pill variant="pos">{o.status}</Pill></td>
            <td style={{textAlign: "right"}}><button className="btn btn-ghost btn-sm">Re-order</button></td>
          </tr>
        ))}
      </tbody>
    </table>
  </Card>
);

const MarketSubs = () => (
  <Card title="Active subscriptions" sub={`${SUBSCRIPTIONS.length} ongoing · €338.50 / mo equivalent`}>
    <table className="tbl">
      <thead><tr><th>Subscription</th><th style={{width: 100, textAlign: "right"}}>Price</th><th style={{width: 100}}>Since</th><th style={{width: 100}}>Next bill</th><th style={{width: 80}}>Status</th><th style={{width: 100, textAlign: "right"}}>Action</th></tr></thead>
      <tbody>
        {SUBSCRIPTIONS.map(s => (
          <tr key={s.id}>
            <td>{s.item}</td>
            <td className="num" style={{textAlign: "right"}}>{s.price}</td>
            <td className="num muted">{s.since}</td>
            <td className="num muted">{s.nextBill}</td>
            <td><Pill variant="pos">{s.status}</Pill></td>
            <td style={{textAlign: "right"}}><button className="btn btn-ghost btn-sm">Manage</button></td>
          </tr>
        ))}
      </tbody>
    </table>
  </Card>
);

const MarketSeller = () => (
  <div>
    <div style={{padding: 14, background: "color-mix(in oklch, var(--acc-mkt) 5%, var(--surface))", border: "1px solid color-mix(in oklch, var(--acc-mkt) 22%, var(--border))", borderRadius: 8, marginBottom: 14}}>
      <div style={{display: "flex", alignItems: "center", gap: 10, marginBottom: 4}}>
        <Icon name="marketplace" className="ic" style={{color: "var(--acc-mkt)"}}/>
        <div style={{fontSize: 13, fontWeight: 600}}>Seller dashboard · Tom Müller</div>
        <Pill variant="acc">Verified seller · since Mar 2024</Pill>
      </div>
      <div className="muted" style={{fontSize: 11.5}}>2 listings · 312 customers · €18,420 lifetime revenue · 4.8 ★ avg</div>
    </div>
    <div className="grid g-cols-4" style={{gap: 10, marginBottom: 14}}>
      <Card className="card-tight" style={{padding: 12}}><div className="eyebrow">Revenue · 30d</div><div className="num" style={{fontSize: 20}}>€2,420</div><div className="dim" style={{fontSize: 11}}>+18% vs prior 30d</div></Card>
      <Card className="card-tight" style={{padding: 12}}><div className="eyebrow">Units sold · 30d</div><div className="num" style={{fontSize: 20}}>62</div><div className="dim" style={{fontSize: 11}}>Plan + 1-on-1</div></Card>
      <Card className="card-tight" style={{padding: 12}}><div className="eyebrow">Take rate</div><div className="num" style={{fontSize: 20}}>15%</div><div className="dim" style={{fontSize: 11}}>Lumeos fee</div></Card>
      <Card className="card-tight" style={{padding: 12}}><div className="eyebrow">Net · 30d</div><div className="num" style={{fontSize: 20, color: "var(--pos)"}}>€2,057</div><div className="dim" style={{fontSize: 11}}>after fees</div></Card>
    </div>
    <Card title="Your listings">
      <table className="tbl">
        <thead><tr><th>Product</th><th style={{width: 100}}>Type</th><th style={{width: 90, textAlign: "right"}}>Price</th><th style={{width: 90, textAlign: "right"}}>Units</th><th style={{width: 90, textAlign: "right"}}>Revenue</th><th style={{width: 80}}>Status</th></tr></thead>
        <tbody>
          <tr><td>5/3/1 BBB · 12 weeks</td><td><Pill>Plan</Pill></td><td className="num right">€39.00</td><td className="num right">312</td><td className="num right">€12,168</td><td><Pill variant="pos">live</Pill></td></tr>
          <tr><td>Training Periodization · 3 month</td><td><Pill>Coaching</Pill></td><td className="num right">€540.00</td><td className="num right">14</td><td className="num right">€7,560</td><td><Pill variant="pos">live</Pill></td></tr>
        </tbody>
      </table>
    </Card>
  </div>
);

window.MarketplaceModule = MarketplaceModule;

// ═══════════════════════════════════════════════════════════
// AUTH (Onboarding · Login · Register · Profile-Setup)
// ═══════════════════════════════════════════════════════════

const AuthModule = () => {
  const [tab, setTab] = useState("onboarding");
  return (
    <>
      <div className="module-header">
        <div className="module-title-block">
          <div className="module-title-row">
            <span className="module-title">Authentication</span>
            <Pill>Logged in · Tom Müller</Pill>
            <Pill variant="acc">athlete · pro</Pill>
          </div>
          <div className="module-sub">Onboarding flow · login · register · privacy preview</div>
        </div>
        <div className="module-actions">
          <button className="btn" onClick={() => window.dispatchEvent(new CustomEvent("open-profile-settings"))}><Icon name="settings" className="ic ic-sm"/>Open settings</button>
        </div>
      </div>
      <Tabs items={[
        { id: "onboarding", label: "Onboarding flow" },
        { id: "login",      label: "Login screen" },
        { id: "register",   label: "Register" },
        { id: "profile",    label: "Profile setup" },
        { id: "privacy",    label: "Privacy" },
      ]} active={tab} onChange={setTab}/>
      {tab === "onboarding" && (window.AuthWalkthrough ? <><window.AuthWalkthrough/><div style={{height: 14}}/><OnboardingFlow/></> : <OnboardingFlow/>)}
      {tab === "login"      && <LoginScreen/>}
      {tab === "register"   && <RegisterScreen/>}
      {tab === "profile"    && <ProfileSetupScreen/>}
      {tab === "privacy"    && <PrivacyPreview/>}
    </>
  );
};

const OnboardingFlow = () => {
  const steps = [
    { n: 1, title: "Welcome",           desc: "Brand intro · what Lumeos does" },
    { n: 2, title: "Name & basics",     desc: "Display name · sex · age · height · weight · location" },
    { n: 3, title: "Goals",             desc: "Primary goal · secondary goals · timeframe" },
    { n: 4, title: "Activity level",    desc: "Training history · weekly frequency · current sport" },
    { n: 5, title: "Choose modules",    desc: "Pick the 4 modules you'll use most · others stay hidden" },
    { n: 6, title: "Connect devices",   desc: "Garmin · Polar · Whoop · Apple Health · Withings" },
    { n: 7, title: "Buddy persona",     desc: "Scientist · Motivator · Drill · Friend · Zen" },
    { n: 8, title: "Privacy defaults",  desc: "Coach visibility · Buddy access · data export" },
    { n: 9, title: "Tier choice",       desc: "Free · Pro (€8/mo) · Elite (€18/mo) · Coach B2B" },
    { n: 10, title: "Done",              desc: "First-week walkthrough · Buddy says hi" },
  ];
  return (
    <Card title="10-step first-run flow" sub="targets ≤ 7 minutes total · skippable steps · resume on next login">
      <div className="col-gap" style={{gap: 8}}>
        {steps.map(s => (
          <div key={s.n} style={{display: "flex", alignItems: "center", gap: 14, padding: 12, background: "var(--bg-elev)", border: "1px solid var(--border)", borderRadius: 6}}>
            <div style={{width: 32, height: 32, borderRadius: 999, background: s.n <= 5 ? "var(--acc-coach)" : "var(--surface-2)", color: s.n <= 5 ? "var(--bg)" : "var(--fg-muted)", display: "grid", placeItems: "center", fontWeight: 600, fontSize: 13}}>{s.n}</div>
            <div style={{flex: 1}}>
              <div style={{fontSize: 13, fontWeight: 600, marginBottom: 2}}>{s.title}</div>
              <div className="muted" style={{fontSize: 11.5}}>{s.desc}</div>
            </div>
            {s.n <= 5 && <Pill variant="pos">designed</Pill>}
            {s.n > 5 && <Pill>spec'd</Pill>}
          </div>
        ))}
      </div>
      <div className="divider"/>
      <div className="muted" style={{fontSize: 11.5, lineHeight: 1.55}}>
        Click any step to preview the screen. Onboarding state persists per-account · can be re-entered from Settings → Account → Re-run onboarding.
      </div>
    </Card>
  );
};

const LoginScreen = () => (
  <div style={{maxWidth: 420, margin: "20px auto", padding: 32, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12}}>
    <div style={{textAlign: "center", marginBottom: 24}}>
      <div style={{width: 48, height: 48, borderRadius: 12, background: "var(--fg)", color: "var(--bg)", display: "inline-grid", placeItems: "center", fontWeight: 700, fontSize: 22, letterSpacing: "-0.04em", marginBottom: 12}}>L</div>
      <div style={{fontSize: 18, fontWeight: 600, letterSpacing: "-0.02em"}}>Welcome back to LumeOS</div>
    </div>
    <div className="col-gap" style={{gap: 10}}>
      <button className="btn" style={{height: 40, justifyContent: "center"}}>Continue with Apple</button>
      <button className="btn" style={{height: 40, justifyContent: "center"}}>Continue with Google</button>
      <button className="btn" style={{height: 40, justifyContent: "center"}}>Continue with Passkey</button>
    </div>
    <div style={{textAlign: "center", margin: "16px 0", color: "var(--fg-dim)", fontSize: 11, fontFamily: "var(--font-mono)", display: "flex", alignItems: "center", gap: 10}}>
      <div style={{flex: 1, height: 1, background: "var(--border)"}}/>OR<div style={{flex: 1, height: 1, background: "var(--border)"}}/>
    </div>
    <div className="col-gap" style={{gap: 10}}>
      <input placeholder="email@example.com" defaultValue="tom.mueller@example.de" style={{height: 36, background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 7, padding: "0 12px", fontSize: 13}}/>
      <input type="password" placeholder="••••••••" defaultValue="••••••••••" style={{height: 36, background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 7, padding: "0 12px", fontSize: 13}}/>
      <button className="btn btn-primary" style={{height: 40, justifyContent: "center"}}>Sign in</button>
    </div>
    <div style={{display: "flex", justifyContent: "space-between", marginTop: 16, fontSize: 11.5}}>
      <a className="dim" style={{cursor: "pointer"}}>Forgot password?</a>
      <a className="dim" style={{cursor: "pointer"}}>Create account →</a>
    </div>
  </div>
);

const RegisterScreen = () => (
  <div style={{maxWidth: 480, margin: "20px auto", padding: 32, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12}}>
    <div style={{fontSize: 18, fontWeight: 600, marginBottom: 6}}>Create your LumeOS account</div>
    <div className="muted" style={{fontSize: 12, marginBottom: 20}}>Step 1 of 10 · takes ~6 minutes total · skippable</div>
    <div className="col-gap" style={{gap: 12}}>
      <div className="grid g-cols-2" style={{gap: 8}}>
        <input placeholder="First name" defaultValue="Tom" style={{height: 36, background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 7, padding: "0 12px", fontSize: 13}}/>
        <input placeholder="Last name"  defaultValue="Müller" style={{height: 36, background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 7, padding: "0 12px", fontSize: 13}}/>
      </div>
      <input placeholder="Email" defaultValue="tom.mueller@example.de" style={{height: 36, background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 7, padding: "0 12px", fontSize: 13}}/>
      <input type="password" placeholder="Password (12+ chars)" style={{height: 36, background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 7, padding: "0 12px", fontSize: 13}}/>
      <div className="grid g-cols-3" style={{gap: 8}}>
        <input placeholder="DOB" type="date" defaultValue="1990-03-12" style={{height: 36, background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 7, padding: "0 12px", fontSize: 13}}/>
        <select defaultValue="male" style={{height: 36, background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 7, padding: "0 12px", fontSize: 13}}><option>male</option><option>female</option><option>non-binary</option><option>prefer not to say</option></select>
        <input placeholder="Country" defaultValue="DE" style={{height: 36, background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 7, padding: "0 12px", fontSize: 13}}/>
      </div>
      <label style={{display: "flex", gap: 6, alignItems: "flex-start", fontSize: 11.5, color: "var(--fg-muted)"}}>
        <input type="checkbox" defaultChecked style={{marginTop: 2}}/>
        I agree to LumeOS <a className="dim" style={{cursor: "pointer"}}>Terms</a> and <a className="dim" style={{cursor: "pointer"}}>Privacy Policy</a> (GDPR-compliant).
      </label>
      <button className="btn btn-primary" style={{height: 40, justifyContent: "center"}}>Continue · Step 2 of 10 →</button>
    </div>
  </div>
);

const ProfileSetupScreen = () => (
  <Card title="Profile setup" sub="step 9 of 10 · pre-fill from onboarding · editable later in Settings">
    <div className="grid g-cols-2" style={{gap: 16}}>
      <div className="col-gap" style={{gap: 12}}>
        <div style={{display: "flex", alignItems: "center", gap: 12}}>
          <div style={{width: 64, height: 64, borderRadius: 14, background: "linear-gradient(135deg, var(--acc-train), var(--acc-recov))", color: "var(--bg)", display: "grid", placeItems: "center", fontWeight: 600, fontSize: 22}}>TM</div>
          <div><div style={{fontSize: 13, fontWeight: 600}}>Avatar</div><button className="btn btn-sm" style={{marginTop: 4}}>Upload photo</button></div>
        </div>
        <div><div className="eyebrow" style={{marginBottom: 4}}>Display name</div><input defaultValue="Tom Müller" style={{width: "100%", height: 32, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, padding: "0 10px", fontSize: 12}}/></div>
        <div><div className="eyebrow" style={{marginBottom: 4}}>Bio</div><input defaultValue="Recreational lifter · climbing on Sundays · 36" style={{width: "100%", height: 32, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, padding: "0 10px", fontSize: 12}}/></div>
        <div className="grid g-cols-3" style={{gap: 8}}>
          <div><div className="eyebrow" style={{marginBottom: 4}}>Weight</div><input defaultValue="79.4" style={{width: "100%", height: 30, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, padding: "0 10px", fontSize: 12}}/></div>
          <div><div className="eyebrow" style={{marginBottom: 4}}>Unit</div><select defaultValue="kg" style={{width: "100%", height: 30, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, padding: "0 10px", fontSize: 12}}><option>kg</option><option>lbs</option></select></div>
          <div><div className="eyebrow" style={{marginBottom: 4}}>Height</div><input defaultValue="184" style={{width: "100%", height: 30, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, padding: "0 10px", fontSize: 12}}/></div>
        </div>
        <div className="grid g-cols-2" style={{gap: 8}}>
          <div><div className="eyebrow" style={{marginBottom: 4}}>Time zone</div><select defaultValue="Europe/Berlin" style={{width: "100%", height: 30, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, padding: "0 10px", fontSize: 12}}><option>Europe/Berlin (UTC+1)</option><option>UTC</option><option>America/New_York</option></select></div>
          <div><div className="eyebrow" style={{marginBottom: 4}}>Language</div><select defaultValue="en" style={{width: "100%", height: 30, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, padding: "0 10px", fontSize: 12}}><option value="en">English</option><option>Deutsch</option><option>Français</option></select></div>
        </div>
      </div>
      <div className="col-gap" style={{gap: 12}}>
        <div className="eyebrow">Units & locale</div>
        {[
          ["Weight", "kg / lbs", "kg"],
          ["Length", "cm / inch", "cm"],
          ["Distance", "km / mi", "km"],
          ["Energy", "kcal / kJ", "kcal"],
          ["Temperature", "°C / °F", "°C"],
          ["Time", "24h / 12h", "24h"],
          ["First day of week", "Mon / Sun", "Mon"],
        ].map(([k, opts, def]) => (
          <Row key={k} label={k} value={def} sub={opts}/>
        ))}
      </div>
    </div>
    <div className="divider"/>
    <div style={{display: "flex", gap: 6, justifyContent: "flex-end"}}>
      <button className="btn btn-ghost">Skip · use defaults</button>
      <button className="btn btn-primary">Continue · Step 10 of 10 →</button>
    </div>
  </Card>
);

const PrivacyPreview = () => (
  <Card title="Privacy defaults · what new users see" sub="GDPR-compliant · all defaults restrictive · users opt-in">
    <div className="dim" style={{fontSize: 12, marginBottom: 14, lineHeight: 1.55}}>
      During onboarding (step 8), users see this matrix and consent explicitly. Sliders default to "off" except for self-access.
    </div>
    <table className="tbl">
      <thead><tr><th>Module</th><th style={{width: 110}}>You</th><th style={{width: 110}}>Coaches</th><th style={{width: 110}}>Buddy</th><th style={{width: 110}}>Lumeos (anon)</th></tr></thead>
      <tbody>
        {["Nutrition","Training","Recovery","Supplements","Medical","Body comp"].map(m => (
          <tr key={m}>
            <td>{m}</td>
            <td><Pill variant="pos">full</Pill></td>
            <td><Pill>off (opt-in)</Pill></td>
            <td><Pill variant="acc">aggregate</Pill></td>
            <td><Pill>off</Pill></td>
          </tr>
        ))}
      </tbody>
    </table>
    <div className="divider"/>
    <div className="col-gap" style={{gap: 6}}>
      <Row label="Cookies · essential" value="required"/>
      <Row label="Cookies · analytics" value="opt-in (off by default)"/>
      <Row label="Marketing emails" value="opt-in"/>
      <Row label="Crash reports · anonymized" value="opt-in"/>
      <Row label="Right to data export" value="always available · ZIP/JSON"/>
      <Row label="Right to deletion" value="14-day grace · then permanent"/>
    </div>
  </Card>
);

window.AuthModule = AuthModule;

// ═══════════════════════════════════════════════════════════
// ADMIN
// ═══════════════════════════════════════════════════════════

const ADMIN_USERS = [
  { id: "u1",  name: "Tom Müller",          email: "tom@…",         tier: "Pro",     role: "user",  status: "active",  joined: "2023-04",   verified: true,  modules: 11 },
  { id: "u2",  name: "Anders Lindqvist",   email: "anders@…",      tier: "Coach",   role: "coach", status: "active",  joined: "2021-08",   verified: true,  modules: 12 },
  { id: "u3",  name: "Jana Bauer",          email: "jana@…",        tier: "Coach",   role: "coach", status: "active",  joined: "2022-01",   verified: true,  modules: 9 },
  { id: "u4",  name: "Lukas Bauer",         email: "lukas@…",       tier: "Elite",   role: "user",  status: "active",  joined: "2024-03",   verified: true,  modules: 11 },
  { id: "u5",  name: "Sophie Klein",        email: "sophie@…",      tier: "Pro",     role: "user",  status: "active",  joined: "2025-09",   verified: true,  modules: 8 },
  { id: "u6",  name: "Marcus Weber",        email: "marcus@…",      tier: "Pro",     role: "user",  status: "active",  joined: "2024-11",   verified: true,  modules: 11 },
  { id: "u7",  name: "Spam Bot",            email: "spam@…",        tier: "Free",    role: "user",  status: "banned",  joined: "2026-05-14", verified: false, modules: 0 },
  { id: "u8",  name: "Dr. Kessler",         email: "kessler@…",     tier: "Coach",   role: "coach", status: "pending", joined: "2026-05-15", verified: false, modules: 7 },
];

const ADMIN_MODERATION = [
  { id: "mod1", item: "Plan listing · Quick Cut Method", reporter: "auto-detect", reason: "unverified claims", severity: "HIGH", age: "2h" },
  { id: "mod2", item: "Coach profile · J. Stevens",       reporter: "user@…",      reason: "credentials questionable",   severity: "MEDIUM", age: "yesterday" },
  { id: "mod3", item: "Product · MiracleFit Powder",      reporter: "auto-detect", reason: "banned ingredient (DMAA)",     severity: "CRITICAL", age: "4h" },
  { id: "mod4", item: "Review on Whey Isolate (user u432)", reporter: "user@…",   reason: "spam/promotional", severity: "LOW", age: "3d" },
];

const AdminModule = () => {
  const [tab, setTab] = useState("dashboard");
  return (
    <>
      <div className="module-header">
        <div className="module-title-block">
          <div className="module-title-row">
            <span className="module-title">Admin</span>
            <Pill style={{borderColor: "color-mix(in oklch, var(--neg) 35%, var(--border))", color: "var(--neg)"}}>internal · operators only</Pill>
            <Pill><span className="dot" style={{background: "var(--pos)"}}/>All systems · operational</Pill>
          </div>
          <div className="module-sub">Operator console · users, moderation, analytics, system health, food DB curation</div>
        </div>
        <div className="module-actions">
          <button className="btn"><Icon name="download" className="ic ic-sm"/>Export incident log</button>
        </div>
      </div>
      <Tabs items={[
        { id: "dashboard",   label: "Dashboard" },
        { id: "users",       label: "Users",       count: 12402 },
        { id: "moderation",  label: "Moderation",  count: ADMIN_MODERATION.length },
        { id: "analytics",   label: "Analytics" },
        { id: "system",      label: "System health" },
        { id: "fooddb",      label: "Food DB" },
        { id: "audit",       label: "Audit log" },
      ]} active={tab} onChange={setTab}/>
      {tab === "dashboard"  && <AdminDashboard/>}
      {tab === "users"      && <AdminUsers/>}
      {tab === "moderation" && <AdminModeration/>}
      {tab === "analytics"  && <AdminAnalytics/>}
      {tab === "system"     && <AdminSystem/>}
      {tab === "fooddb"     && <AdminFoodDB/>}
      {tab === "audit"      && <AdminAudit/>}
    </>
  );
};

const AdminDashboard = () => (
  <div>
    <div className="grid g-cols-4" style={{gap: 10, marginBottom: 14}}>
      <Card className="card-tight" style={{padding: 14}}><div className="eyebrow">DAU</div><div className="num" style={{fontSize: 22}}>12,402</div><div className="dim" style={{fontSize: 11}}>+3.2% wow</div></Card>
      <Card className="card-tight" style={{padding: 14}}><div className="eyebrow">MAU</div><div className="num" style={{fontSize: 22}}>48,920</div><div className="dim" style={{fontSize: 11}}>+1.8% mom</div></Card>
      <Card className="card-tight" style={{padding: 14}}><div className="eyebrow">Open mod queue</div><div className="num" style={{fontSize: 22, color: "var(--warn)"}}>{ADMIN_MODERATION.length}</div><div className="dim" style={{fontSize: 11}}>1 critical</div></Card>
      <Card className="card-tight" style={{padding: 14}}><div className="eyebrow">Uptime 30d</div><div className="num" style={{fontSize: 22, color: "var(--pos)"}}>99.98%</div><div className="dim" style={{fontSize: 11}}>SLA 99.9</div></Card>
    </div>
    <div className="grid" style={{gridTemplateColumns: "1.4fr 1fr", gap: 14}}>
      <Card title="DAU/MAU · 30 days">
        <LineChart h={200} range={[10000, 14000]} xLabels={["Apr 16","","","","May 1","","","","May 16"]} series={[{ data: [10800, 11200, 11500, 11800, 12000, 12200, 12100, 12400, 12402], color: "var(--acc-coach)" }]}/>
      </Card>
      <Card title="Module adoption · top 5">
        {[["Training", 84],["Nutrition", 78],["Recovery", 72],["Supplements", 56],["Goals", 48]].map(r => (
          <div key={r[0]} style={{display: "grid", gridTemplateColumns: "100px 1fr 40px", gap: 10, alignItems: "center", fontSize: 11.5, marginBottom: 6}}>
            <span>{r[0]}</span>
            <div style={{height: 6, background: "var(--surface-2)", borderRadius: 999}}><div style={{height: "100%", width: `${r[1]}%`, background: "var(--acc-coach)", borderRadius: 999}}/></div>
            <span className="num" style={{textAlign: "right"}}>{r[1]}%</span>
          </div>
        ))}
      </Card>
    </div>
  </div>
);

const AdminUsers = () => (
  <Card title="User management" sub={`12,402 active · 8 of 12,402 shown · search/filter to drill`}>
    <div style={{display: "flex", gap: 8, marginBottom: 14}}>
      <input placeholder="Search by name, email, ID…" style={{flex: 1, height: 32, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, padding: "0 12px", fontSize: 12}}/>
      <select style={{height: 32, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, padding: "0 10px", fontSize: 12}}><option>All tiers</option><option>Free</option><option>Pro</option><option>Elite</option><option>Coach</option></select>
      <select style={{height: 32, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, padding: "0 10px", fontSize: 12}}><option>All status</option><option>active</option><option>pending</option><option>banned</option></select>
    </div>
    <table className="tbl">
      <thead><tr><th>Name</th><th>Email</th><th style={{width: 70}}>Tier</th><th style={{width: 70}}>Role</th><th style={{width: 80}}>Status</th><th style={{width: 90}}>Joined</th><th style={{width: 70, textAlign: "right"}}>Modules</th><th style={{width: 110, textAlign: "right"}}>Actions</th></tr></thead>
      <tbody>
        {ADMIN_USERS.map(u => (
          <tr key={u.id}>
            <td>{u.name} {u.verified ? "✓" : ""}</td>
            <td className="mono dim" style={{fontSize: 11}}>{u.email}</td>
            <td><Pill variant={u.tier === "Coach" ? "acc" : ""}>{u.tier}</Pill></td>
            <td><Pill>{u.role}</Pill></td>
            <td><Pill variant={u.status === "active" ? "pos" : u.status === "banned" ? "block" : "warn"}>{u.status}</Pill></td>
            <td className="num muted">{u.joined}</td>
            <td className="num" style={{textAlign: "right"}}>{u.modules}</td>
            <td style={{textAlign: "right"}}><button className="btn btn-ghost btn-sm">Manage</button></td>
          </tr>
        ))}
      </tbody>
    </table>
  </Card>
);

const AdminModeration = () => (
  <Card title="Content moderation queue" sub={`${ADMIN_MODERATION.length} open · 1 critical · auto + community reports`}>
    <div className="col-gap" style={{gap: 6}}>
      {ADMIN_MODERATION.map(m => {
        const color = m.severity === "CRITICAL" ? "var(--neg)" : m.severity === "HIGH" ? "var(--warn)" : m.severity === "MEDIUM" ? "var(--acc-recov)" : "var(--fg-dim)";
        return (
          <Card key={m.id} className="card-tight" style={{padding: 12}}>
            <div style={{display: "flex", gap: 12, alignItems: "center"}}>
              <div style={{width: 3, alignSelf: "stretch", background: color, borderRadius: 2}}/>
              <div style={{flex: 1}}>
                <div style={{display: "flex", alignItems: "center", gap: 6, marginBottom: 3}}>
                  <Pill style={{color, borderColor: `color-mix(in oklch, ${color} 35%, var(--border))`}}>{m.severity}</Pill>
                  <span style={{fontSize: 13, fontWeight: 600}}>{m.item}</span>
                  <span className="dim mono" style={{marginLeft: "auto", fontSize: 10}}>{m.age}</span>
                </div>
                <div className="muted" style={{fontSize: 11.5}}>Reporter: <span className="mono">{m.reporter}</span> · Reason: {m.reason}</div>
              </div>
              <div style={{display: "flex", gap: 6}}>
                <button className="btn btn-ghost btn-sm">Investigate</button>
                <button className="btn btn-sm" style={{color: "var(--neg)", borderColor: "color-mix(in oklch, var(--neg) 35%, var(--border))"}}>Remove</button>
                <button className="btn btn-sm">Approve</button>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  </Card>
);

const AdminAnalytics = () => (
  <div className="grid g-cols-2" style={{gap: 14}}>
    <Card title="User growth · 90d">
      <LineChart h={180} range={[40000, 55000]} xLabels={["Feb","","","Mar","","","Apr","","","May"]} series={[{ data: [42000, 43200, 44500, 45800, 46200, 47000, 47800, 48400, 48700, 48920], color: "var(--acc-coach)" }]}/>
    </Card>
    <Card title="Revenue · 90d (MRR)">
      <LineChart h={180} range={[50000, 80000]} xLabels={["Feb","","","Mar","","","Apr","","","May"]} series={[{ data: [54000, 57000, 60000, 62000, 64000, 67000, 69000, 71000, 73000, 74200], color: "var(--acc-mkt)" }]}/>
    </Card>
    <Card title="Top 5 features (usage · 30d)">
      {[
        ["Meal log",     91],
        ["Workout log",  86],
        ["Buddy chat",   72],
        ["Recovery checkin", 64],
        ["Supplement track", 58],
      ].map(r => (
        <div key={r[0]} style={{display: "grid", gridTemplateColumns: "120px 1fr 40px", gap: 10, alignItems: "center", fontSize: 11.5, marginBottom: 6}}>
          <span>{r[0]}</span>
          <div style={{height: 6, background: "var(--surface-2)", borderRadius: 999}}><div style={{height: "100%", width: `${r[1]}%`, background: "var(--acc-coach)", borderRadius: 999}}/></div>
          <span className="num right">{r[1]}%</span>
        </div>
      ))}
    </Card>
    <Card title="Tier distribution">
      <Row label="Free"   value="62% · 7,690"/>
      <Row label="Pro"    value="28% · 3,475"/>
      <Row label="Elite"  value="8% · 992"/>
      <Row label="Coach"  value="2% · 248"/>
      <div className="divider"/>
      <Row label="Conversion · 30d" value="3.4%"/>
      <Row label="Churn · 30d"      value="2.1%"/>
    </Card>
  </div>
);

const AdminSystem = () => (
  <div className="grid g-cols-2" style={{gap: 14}}>
    <Card title="API health · 24h">
      <Row label="api.lumeos.app · core" value="✓ 99.99% · p99 142ms"/>
      <Row label="coach.lumeos.app"        value="✓ 99.97% · p99 188ms"/>
      <Row label="ai.lumeos.app · LLM"    value="✓ 99.92% · p99 1.2s"/>
      <Row label="admin.lumeos.app"       value="✓ 100%"/>
      <Row label="cdn (asset)"             value="✓ 99.99%"/>
      <div className="divider"/>
      <Row label="DB latency p99" value="14ms · within SLO"/>
      <Row label="Queue depth"     value="42 · normal"/>
    </Card>
    <Card title="Error logs · last 50">
      <table className="tbl">
        <thead><tr><th style={{width: 100}}>When</th><th>Error</th><th style={{width: 70}}>Severity</th></tr></thead>
        <tbody>
          <tr><td className="num muted">14:22</td><td>OpenClaw timeout (1 occurrence)</td><td><Pill variant="warn">WARN</Pill></td></tr>
          <tr><td className="num muted">11:08</td><td>Supabase RLS deny (probe)</td><td><Pill>INFO</Pill></td></tr>
          <tr><td className="num muted">08:32</td><td>Garmin connector retry (3×)</td><td><Pill variant="warn">WARN</Pill></td></tr>
        </tbody>
      </table>
    </Card>
    <Card title="Spark fabric · live" style={{gridColumn: "span 2"}}>
      <div className="grid g-cols-5" style={{gap: 10}}>
        {[
          { name: "Spark1", model: "Qwen3.6-35B", temp: 71, util: 87, state: "up" },
          { name: "Spark2", model: "Qwen3-Coder", temp: 62, util: 54, state: "up" },
          { name: "Spark3", model: "Nemotron",    temp: 58, util: 41, state: "up" },
          { name: "Spark4", model: "MiniMax 2.7", temp: 78, util: 92, state: "warn" },
          { name: "Spark5", model: "MiniMax 2.7", temp: 51, util: 22, state: "up" },
        ].map(s => (
          <Card key={s.name} className="card-tight" style={{padding: 10}}>
            <div style={{display: "flex", alignItems: "center", gap: 6, marginBottom: 4}}>
              <span style={{width: 6, height: 6, borderRadius: 999, background: s.state === "up" ? "var(--pos)" : "var(--warn)"}}/>
              <span style={{fontSize: 12, fontWeight: 600}}>{s.name}</span>
            </div>
            <div className="dim mono" style={{fontSize: 10, marginBottom: 4}}>{s.model}</div>
            <div className="num" style={{fontSize: 12}}>{s.temp}°C · {s.util}%</div>
          </Card>
        ))}
      </div>
    </Card>
  </div>
);

const AdminFoodDB = () => (
  <Card title="Food DB curation" sub="BLS · Bundeslebensmittelschlüssel · 7,140 entries · German source of truth">
    <div className="grid g-cols-4" style={{gap: 10, marginBottom: 14}}>
      <Card className="card-tight" style={{padding: 12}}><div className="eyebrow">Total entries</div><div className="num" style={{fontSize: 18}}>10,840</div></Card>
      <Card className="card-tight" style={{padding: 12}}><div className="eyebrow">Pending review</div><div className="num" style={{fontSize: 18, color: "var(--warn)"}}>24</div></Card>
      <Card className="card-tight" style={{padding: 12}}><div className="eyebrow">Duplicate flags</div><div className="num" style={{fontSize: 18}}>7</div></Card>
      <Card className="card-tight" style={{padding: 12}}><div className="eyebrow">User-submitted</div><div className="num" style={{fontSize: 18}}>412</div></Card>
    </div>
    <table className="tbl">
      <thead><tr><th>Food</th><th style={{width: 100}}>Source</th><th style={{width: 80, textAlign: "right"}}>kcal/100g</th><th style={{width: 100}}>Status</th><th style={{width: 120, textAlign: "right"}}>Action</th></tr></thead>
      <tbody>
        {[
          ["Oat milk · barista", "user-submitted", 48, "review"],
          ["Bavarian wheat beer", "user-submitted", 45, "review"],
          ["Quinoa · puffed",  "BLS",            372, "approved"],
          ["Protein bar · X-tend", "user-submitted", 380, "duplicate? (3x)"],
          ["Salmon · Sockeye, wild", "BLS",      168, "approved"],
        ].map((r, i) => (
          <tr key={i}>
            <td>{r[0]}</td>
            <td><Pill>{r[1]}</Pill></td>
            <td className="num right">{r[2]}</td>
            <td>{r[3] === "approved" ? <Pill variant="pos">{r[3]}</Pill> : r[3] === "review" ? <Pill variant="warn">{r[3]}</Pill> : <Pill>{r[3]}</Pill>}</td>
            <td style={{textAlign: "right"}}><button className="btn btn-sm">Review</button></td>
          </tr>
        ))}
      </tbody>
    </table>
  </Card>
);

const AdminAudit = () => (
  <Card title="Audit log · last 8 entries of 24,820" sub="all admin actions · privileged · GDPR-traceable">
    <table className="tbl">
      <thead><tr><th style={{width: 140}}>Timestamp</th><th style={{width: 140}}>Actor</th><th>Action</th><th style={{width: 110}}>Category</th></tr></thead>
      <tbody>
        {[
          ["2026-05-16 14:22","admin/Tom",       "viewed user u-432",                "data-access"],
          ["2026-05-16 13:08","admin/Hanna",     "removed listing · MiracleFit",     "moderation"],
          ["2026-05-16 09:14","admin/Tom",       "approved Coach Dr. Kessler",       "team"],
          ["2026-05-15 18:32","system",          "auto-flagged DMAA product",        "moderation"],
          ["2026-05-15 16:00","admin/Erik",      "exported user data · u-118",       "export"],
          ["2026-05-14 12:00","admin/Tom",       "ran Food DB dedup · 12 merged",    "curation"],
          ["2026-05-13 11:00","system",          "auto-banned spam account · u-7521","ban"],
          ["2026-05-12 22:00","admin/Hanna",     "responded to GDPR delete request", "compliance"],
        ].map((r, i) => (
          <tr key={i}>
            <td className="num muted" style={{fontSize: 11}}>{r[0]}</td>
            <td className="mono">{r[1]}</td>
            <td>{r[2]}</td>
            <td><Pill>{r[3]}</Pill></td>
          </tr>
        ))}
      </tbody>
    </table>
  </Card>
);

window.AdminModule = AdminModule;
