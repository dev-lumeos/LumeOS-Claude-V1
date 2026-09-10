// Coach Portal — Calendar · Client notes · Coach library · Notification centre
// Plus bulk actions for the roster.

// ── Calendar ─────────────────────────────────────────
const CAL_EVENTS = {
  "2026-09-07": [{ t: "09:00", who: "Lukas Bauer",   kind: "checkin", label: "Weekly check-in" }],
  "2026-09-08": [{ t: "07:30", who: "Marcus Weber",  kind: "session", label: "Session review · Legs" },
                 { t: "16:00", who: "Elena Schmidt", kind: "call",    label: "Onboarding call" }],
  "2026-09-09": [{ t: "10:00", who: "Sophie Klein",  kind: "checkin", label: "Weekly check-in" },
                 { t: "14:00", who: "Roster",        kind: "deadline",label: "Block 3 ends · reassign" }],
  "2026-09-10": [{ t: "08:00", who: "Lukas Bauer",   kind: "prep",    label: "Prep review · 6 weeks out" },
                 { t: "11:00", who: "Niko Brandt",   kind: "checkin", label: "Bi-weekly check-in" },
                 { t: "17:30", who: "Daniel Vogel",  kind: "call",    label: "Plateau discussion" }],
  "2026-09-11": [{ t: "09:30", who: "Anna Frey",     kind: "checkin", label: "Weekly check-in" }],
  "2026-09-12": [{ t: "10:00", who: "Mira Stahl",    kind: "session", label: "Form review · video" }],
  "2026-09-14": [{ t: "09:00", who: "Lukas Bauer",   kind: "checkin", label: "Weekly check-in" },
                 { t: "13:00", who: "Carla Roth",    kind: "call",    label: "Plan handover" }],
  "2026-09-15": [{ t: "08:00", who: "Roster",        kind: "deadline",label: "Monthly invoices due" }],
  "2026-09-17": [{ t: "08:00", who: "Lukas Bauer",   kind: "prep",    label: "Prep review · 5 weeks out" }],
};

const CAL_KIND = {
  checkin:  { c: "var(--acc-coach)",  l: "Check-in" },
  session:  { c: "var(--acc-train)",  l: "Session" },
  call:     { c: "var(--acc-recov)",  l: "Call" },
  prep:     { c: "var(--acc-goals)",  l: "Prep review" },
  deadline: { c: "var(--warn)",       l: "Deadline" },
};

window.PortalCalendar = () => {
  const [sel, setSel] = useState("2026-09-10");
  const year = 2026, month = 8; // September
  const first = new Date(year, month, 1);
  const startDow = (first.getDay() + 6) % 7; // Monday-first
  const days = new Date(year, month + 1, 0).getDate();
  const cells = [...Array(startDow).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)];
  while (cells.length % 7) cells.push(null);
  const key = (d) => `2026-09-${String(d).padStart(2, "0")}`;
  const today = 10;
  const selEvents = CAL_EVENTS[sel] || [];
  const upcoming = Object.entries(CAL_EVENTS).flatMap(([d, evs]) => evs.map(e => ({ ...e, d }))).filter(e => e.d >= "2026-09-10").slice(0, 7);

  return (
    <div className="grid" style={{ gridTemplateColumns: "1.5fr 1fr", gap: 14 }}>
      <Card title="September 2026" sub={`${Object.values(CAL_EVENTS).flat().length} scheduled events`}
        actions={<><button className="btn btn-sm btn-ghost"><Icon name="chevron_left" className="ic ic-sm"/></button><button className="btn btn-sm btn-ghost">Today</button><button className="btn btn-sm btn-ghost"><Icon name="chevron_right" className="ic ic-sm"/></button></>}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginBottom: 6 }}>
          {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map(d => (
            <div key={d} className="eyebrow" style={{ textAlign: "center", fontSize: 9.5 }}>{d}</div>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
          {cells.map((d, i) => {
            if (!d) return <div key={i} />;
            const k = key(d);
            const evs = CAL_EVENTS[k] || [];
            const isToday = d === today;
            const isSel = k === sel;
            return (
              <div key={i} onClick={() => setSel(k)} style={{
                minHeight: 62, padding: 6, cursor: "pointer", borderRadius: 6,
                background: isSel ? "color-mix(in srgb, var(--acc-coach) 10%, var(--surface))" : evs.length ? "var(--surface)" : "transparent",
                border: `1px solid ${isSel ? "color-mix(in srgb, var(--acc-coach) 38%, var(--border))" : isToday ? "color-mix(in srgb, var(--fg) 24%, var(--border))" : "var(--border)"}`,
              }}>
                <div className="num" style={{ fontSize: 10.5, fontWeight: isToday ? 700 : 500, color: isToday ? "var(--fg)" : "var(--fg-muted)", marginBottom: 4 }}>{d}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {evs.slice(0, 3).map((e, j) => (
                    <div key={j} style={{ height: 3, borderRadius: 999, background: CAL_KIND[e.kind].c, opacity: 0.85 }} />
                  ))}
                  {evs.length > 3 && <span className="dim mono" style={{ fontSize: 8 }}>+{evs.length - 3}</span>}
                </div>
              </div>
            );
          })}
        </div>
        <div className="divider" />
        <div style={{ display: "flex", gap: 13, flexWrap: "wrap" }}>
          {Object.entries(CAL_KIND).map(([k, v]) => (
            <span key={k} style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 10.5, color: "var(--fg-muted)" }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: v.c }} />{v.l}
            </span>
          ))}
        </div>
      </Card>

      <div className="col-gap" style={{ gap: 14 }}>
        <Card title={new Date(sel).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })} sub={`${selEvents.length} event${selEvents.length === 1 ? "" : "s"}`}
          actions={<button className="btn btn-sm"><Icon name="plus" className="ic ic-sm"/>Add</button>}>
          {selEvents.length === 0
            ? <div className="dim" style={{ fontSize: 12, padding: "18px 0", textAlign: "center" }}>Nothing scheduled.</div>
            : selEvents.map((e, i) => (
              <div key={i} style={{ display: "flex", gap: 11, padding: "10px 0", borderBottom: i < selEvents.length - 1 ? "1px solid var(--border)" : "none" }}>
                <span className="num" style={{ fontSize: 11.5, width: 40, flexShrink: 0, color: "var(--fg-muted)" }}>{e.t}</span>
                <span style={{ width: 3, borderRadius: 2, background: CAL_KIND[e.kind].c, flexShrink: 0 }} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 2 }}>{e.label}</div>
                  <div className="dim" style={{ fontSize: 10.5 }}>{e.who}</div>
                </div>
              </div>
            ))}
        </Card>

        <Card title="Upcoming" sub="next 7 events">
          {upcoming.map((e, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 9, padding: "8px 0", borderBottom: i < upcoming.length - 1 ? "1px solid var(--border)" : "none" }}>
              <span className="num dim" style={{ fontSize: 10, width: 52, flexShrink: 0 }}>{e.d.slice(8)} Sep</span>
              <span style={{ width: 6, height: 6, borderRadius: 999, background: CAL_KIND[e.kind].c, flexShrink: 0 }} />
              <span style={{ fontSize: 11.5, flex: 1, minWidth: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{e.label}</span>
              <span className="dim" style={{ fontSize: 10.5 }}>{e.who.split(" ")[0]}</span>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
};

// ── Client notes ─────────────────────────────────────
const CN_NOTES = [
  { id: "n1", who: "Lukas Bauer",   at: "2026-09-09 18:22", tag: "prep",     pinned: true,  body: "Water retention up 1.2 kg after Saturday's meal out. Not fat gain — sodium. Told him to hold the plan and re-weigh Wednesday." },
  { id: "n2", who: "Sophie Klein",  at: "2026-09-08 11:04", tag: "injury",   pinned: true,  body: "Left knee discomfort on the descent, not the drive. Swapped back squat for hack squat this block. Physio referral if it persists past two weeks." },
  { id: "n3", who: "Marcus Weber",  at: "2026-09-07 20:40", tag: "form",     pinned: false, body: "Deadlift video: hips rise before the bar on set 4. Cued 'chest up, push the floor away' — set 5 was clean. Watch again next session." },
  { id: "n4", who: "Elena Schmidt", at: "2026-09-06 09:15", tag: "adherence",pinned: false, body: "Third missed Friday in a row. She works late Thursdays. Moving the session to Saturday morning from next week." },
  { id: "n5", who: "Daniel Vogel",  at: "2026-09-04 16:30", tag: "plateau",  pinned: false, body: "Bench stalled at 105 for three weeks. Volume is fine, intensity too low. Adding a heavy triple on the top set." },
  { id: "n6", who: "Niko Brandt",   at: "2026-09-03 08:12", tag: "nutrition",pinned: false, body: "Protein consistently 30 g under target. Not a compliance issue — his portion estimate is off. Sent him a scale and a reference sheet." },
  { id: "n7", who: "Anna Frey",     at: "2026-09-01 19:50", tag: "mindset",  pinned: false, body: "Comparing herself to other clients on the leaderboard. Turned the leaderboard off for her account and reframed the goal around her own baseline." },
];

const CN_TAGS = { prep: "var(--acc-goals)", injury: "var(--neg)", form: "var(--acc-train)", adherence: "var(--warn)", plateau: "var(--acc-mkt)", nutrition: "var(--acc-nutri)", mindset: "var(--acc-buddy)" };

window.PortalClientNotes = () => {
  const [q, setQ] = useState("");
  const [tag, setTag] = useState("All");
  const rows = CN_NOTES.filter(n => {
    if (tag !== "All" && n.tag !== tag) return false;
    if (q && !(n.who + n.body).toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });
  const pinned = rows.filter(n => n.pinned);
  const rest = rows.filter(n => !n.pinned);

  const NoteCard = ({ n }) => (
    <Card style={{ position: "relative" }}>
      <div style={{ position: "absolute", left: 0, top: 12, bottom: 12, width: 3, background: CN_TAGS[n.tag], borderRadius: "0 2px 2px 0" }} />
      <div style={{ paddingLeft: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
          <span style={{ fontSize: 12.5, fontWeight: 600 }}>{n.who}</span>
          <Pill style={{ color: CN_TAGS[n.tag], borderColor: `color-mix(in srgb, ${CN_TAGS[n.tag]} 32%, var(--border))` }}>{n.tag}</Pill>
          {n.pinned && <Pill variant="acc">pinned</Pill>}
          <span className="dim mono" style={{ marginLeft: "auto", fontSize: 10 }}>{n.at.slice(5, 16)}</span>
        </div>
        <div className="muted" style={{ fontSize: 12, lineHeight: 1.55, marginBottom: 9 }}>{n.body}</div>
        <div style={{ display: "flex", gap: 6 }}>
          <button className="btn btn-sm btn-ghost">Edit</button>
          <button className="btn btn-sm btn-ghost">{n.pinned ? "Unpin" : "Pin"}</button>
          <button className="btn btn-sm btn-ghost">Open client</button>
        </div>
      </div>
    </Card>
  );

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search notes by client or content…"
          style={{ flex: 1, minWidth: 220, height: 32, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, padding: "0 12px", fontSize: 12 }} />
        <select value={tag} onChange={e => setTag(e.target.value)} style={{ height: 32, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, padding: "0 10px", fontSize: 12 }}>
          {["All", ...Object.keys(CN_TAGS)].map(t => <option key={t}>{t}</option>)}
        </select>
        <button className="btn btn-primary"><Icon name="plus" className="ic ic-sm" />New note</button>
      </div>
      {pinned.length > 0 && (
        <>
          <div className="eyebrow" style={{ marginBottom: 8 }}>Pinned</div>
          <div className="col-gap" style={{ gap: 9, marginBottom: 16 }}>{pinned.map(n => <NoteCard key={n.id} n={n} />)}</div>
        </>
      )}
      <div className="eyebrow" style={{ marginBottom: 8 }}>All notes · {rest.length}</div>
      <div className="col-gap" style={{ gap: 9 }}>{rest.map(n => <NoteCard key={n.id} n={n} />)}</div>
    </div>
  );
};

// ── Coach library · exercises ────────────────────────
const LIB_EX = [
  { id: "CX-01", name: "Paused Zercher Squat · 3ct", cat: "Compound", muscles: ["Quads","Glutes","Core"], equip: "Barbell", video: true,  assigned: 6, note: "Front-loaded, forces upright torso. Good for clients who fold forward." },
  { id: "CX-02", name: "Deficit Snatch-Grip RDL",    cat: "Compound", muscles: ["Hamstrings","Upper back"], equip: "Barbell", video: true,  assigned: 4, note: "Longer ROM, big upper-back demand. Cap at RPE 8." },
  { id: "CX-03", name: "Half-Kneeling Cable Press",  cat: "Compound", muscles: ["Chest","Front delt","Core"], equip: "Cable", video: false, assigned: 9, note: "Anti-rotation press. My default shoulder-friendly horizontal push." },
  { id: "CX-04", name: "Seated DB Powell Raise",     cat: "Isolation",muscles: ["Rear delt","Rotator cuff"], equip: "Dumbbell", video: true, assigned: 12, note: "Cuff health for everyone benching above 100 kg." },
  { id: "CX-05", name: "Slant-Board Reverse Nordic", cat: "Isolation",muscles: ["Quads","Hip flexors"], equip: "Bodyweight", video: true, assigned: 7, note: "Knee-friendly quad lengthening. Two sets, no failure." },
  { id: "CX-06", name: "Landmine Meadows Row",       cat: "Compound", muscles: ["Lats","Rear delt","Biceps"], equip: "Barbell", video: false, assigned: 5, note: "Unilateral, low axial load. Fits deload weeks." },
];

window.PortalLibraryExercises = () => {
  const [q, setQ] = useState("");
  const [sel, setSel] = useState([]);
  const rows = LIB_EX.filter(e => !q || e.name.toLowerCase().includes(q.toLowerCase()));
  const toggle = (id) => setSel(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  return (
    <div>
      <div className="grid g-cols-4" style={{ gap: 10, marginBottom: 14 }}>
        {[["Custom exercises", LIB_EX.length], ["With video", LIB_EX.filter(e => e.video).length], ["Total assignments", LIB_EX.reduce((s, e) => s + e.assigned, 0)], ["From platform library", "1,850"]].map(([l, v]) => (
          <Card key={l} className="card-tight" style={{ padding: 13 }}>
            <div className="eyebrow" style={{ marginBottom: 4 }}>{l}</div>
            <div className="num" style={{ fontSize: 18, fontWeight: 500 }}>{v}</div>
          </Card>
        ))}
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search your exercises…"
          style={{ flex: 1, height: 32, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, padding: "0 12px", fontSize: 12 }} />
        <button className="btn"><Icon name="search" className="ic ic-sm" />Browse platform library</button>
        <button className="btn btn-primary"><Icon name="plus" className="ic ic-sm" />New exercise</button>
      </div>
      {sel.length > 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "9px 13px", marginBottom: 12, background: "color-mix(in srgb, var(--acc-coach) 8%, var(--surface))", border: "1px solid color-mix(in srgb, var(--acc-coach) 30%, var(--border))", borderRadius: 7 }}>
          <span className="num" style={{ fontSize: 11.5, fontWeight: 600 }}>{sel.length} selected</span>
          <div className="spacer" />
          <button className="btn btn-sm">Assign to clients</button>
          <button className="btn btn-sm">Add to routine</button>
          <button className="btn btn-sm btn-ghost" onClick={() => setSel([])}>Clear</button>
        </div>
      )}
      <Card>
        <table className="tbl">
          <thead><tr><th style={{ width: 30 }}></th><th>Exercise</th><th style={{ width: 90 }}>Category</th><th>Muscles</th><th style={{ width: 100 }}>Equipment</th><th style={{ width: 70 }}>Video</th><th style={{ width: 90, textAlign: "right" }}>Assigned</th></tr></thead>
          <tbody>
            {rows.map(e => (
              <tr key={e.id} className="clickable" style={{ cursor: "pointer" }}>
                <td onClick={ev => { ev.stopPropagation(); toggle(e.id); }}>
                  <input type="checkbox" checked={sel.includes(e.id)} readOnly style={{ accentColor: "var(--acc-coach)", cursor: "pointer" }} />
                </td>
                <td>
                  <div style={{ fontSize: 12.5, fontWeight: 500, marginBottom: 2 }}>{e.name}</div>
                  <div className="dim" style={{ fontSize: 10.5, lineHeight: 1.35 }}>{e.note}</div>
                </td>
                <td className="muted">{e.cat}</td>
                <td><div style={{ display: "flex", gap: 3, flexWrap: "wrap" }}>{e.muscles.map(m => <Pill key={m} style={{ fontSize: 9.5 }}>{m}</Pill>)}</div></td>
                <td className="muted" style={{ fontSize: 11.5 }}>{e.equip}</td>
                <td>{e.video ? <Pill variant="pos">yes</Pill> : <span className="dim" style={{ fontSize: 11 }}>—</span>}</td>
                <td className="num" style={{ textAlign: "right" }}>{e.assigned}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
};

// ── Coach library · meals ────────────────────────────
const LIB_MEAL = [
  { id: "CM-01", name: "High-protein overnight oats", kcal: 520, p: 42, c: 58, f: 12, tag: "Breakfast", assigned: 11, note: "Skyr base, whey, oats, berries. Prep the night before, zero morning friction." },
  { id: "CM-02", name: "Chicken · rice · greens bowl", kcal: 680, p: 58, c: 72, f: 14, tag: "Lunch",   assigned: 14, note: "The default. Scales cleanly from cut to bulk by adjusting rice only." },
  { id: "CM-03", name: "Salmon, potato, asparagus",   kcal: 620, p: 44, c: 48, f: 26, tag: "Dinner",   assigned: 8,  note: "Omega-3 anchor. Twice weekly for anyone not supplementing fish oil." },
  { id: "CM-04", name: "Pre-workout rice cakes + whey",kcal: 340, p: 28, c: 52, f: 3,  tag: "Pre",      assigned: 12, note: "60–90 min before. Low fat and fibre so it clears fast." },
  { id: "CM-05", name: "Cottage cheese + berries",    kcal: 240, p: 28, c: 18, f: 6,  tag: "Snack",    assigned: 9,  note: "Casein before bed. Keeps overnight amino availability up." },
  { id: "CM-06", name: "Lentil bolognese",            kcal: 560, p: 32, c: 78, f: 12, tag: "Dinner",   assigned: 4,  note: "Plant-based option. Pair with a whey shake to close the leucine gap." },
];

window.PortalLibraryMeals = () => {
  const [q, setQ] = useState("");
  const [sel, setSel] = useState([]);
  const rows = LIB_MEAL.filter(m => !q || m.name.toLowerCase().includes(q.toLowerCase()));
  const toggle = (id) => setSel(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  return (
    <div>
      <div className="grid g-cols-4" style={{ gap: 10, marginBottom: 14 }}>
        {[["Custom meals", LIB_MEAL.length], ["Avg protein", Math.round(LIB_MEAL.reduce((s, m) => s + m.p, 0) / LIB_MEAL.length) + " g"], ["Total assignments", LIB_MEAL.reduce((s, m) => s + m.assigned, 0)], ["BLS foods available", "7,140"]].map(([l, v]) => (
          <Card key={l} className="card-tight" style={{ padding: 13 }}>
            <div className="eyebrow" style={{ marginBottom: 4 }}>{l}</div>
            <div className="num" style={{ fontSize: 18, fontWeight: 500 }}>{v}</div>
          </Card>
        ))}
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search your meals…"
          style={{ flex: 1, height: 32, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, padding: "0 12px", fontSize: 12 }} />
        <button className="btn"><Icon name="search" className="ic ic-sm" />Browse BLS database</button>
        <button className="btn btn-primary"><Icon name="plus" className="ic ic-sm" />New recipe</button>
      </div>
      {sel.length > 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "9px 13px", marginBottom: 12, background: "color-mix(in srgb, var(--acc-nutri) 8%, var(--surface))", border: "1px solid color-mix(in srgb, var(--acc-nutri) 30%, var(--border))", borderRadius: 7 }}>
          <span className="num" style={{ fontSize: 11.5, fontWeight: 600 }}>{sel.length} selected</span>
          <div className="spacer" />
          <button className="btn btn-sm">Assign to clients</button>
          <button className="btn btn-sm">Add to meal plan</button>
          <button className="btn btn-sm btn-ghost" onClick={() => setSel([])}>Clear</button>
        </div>
      )}
      <Card>
        <table className="tbl">
          <thead><tr><th style={{ width: 30 }}></th><th>Meal</th><th style={{ width: 90 }}>Slot</th><th style={{ width: 70, textAlign: "right" }}>kcal</th><th style={{ width: 60, textAlign: "right" }}>P</th><th style={{ width: 60, textAlign: "right" }}>C</th><th style={{ width: 60, textAlign: "right" }}>F</th><th style={{ width: 90, textAlign: "right" }}>Assigned</th></tr></thead>
          <tbody>
            {rows.map(m => (
              <tr key={m.id} className="clickable" style={{ cursor: "pointer" }}>
                <td onClick={ev => { ev.stopPropagation(); toggle(m.id); }}>
                  <input type="checkbox" checked={sel.includes(m.id)} readOnly style={{ accentColor: "var(--acc-nutri)", cursor: "pointer" }} />
                </td>
                <td>
                  <div style={{ fontSize: 12.5, fontWeight: 500, marginBottom: 2 }}>{m.name}</div>
                  <div className="dim" style={{ fontSize: 10.5, lineHeight: 1.35 }}>{m.note}</div>
                </td>
                <td><Pill>{m.tag}</Pill></td>
                <td className="num" style={{ textAlign: "right" }}>{m.kcal}</td>
                <td className="num" style={{ textAlign: "right" }}>{m.p}<span className="dim" style={{ fontSize: 9.5, marginLeft: 2 }}>g</span></td>
                <td className="num muted" style={{ textAlign: "right" }}>{m.c}<span className="dim" style={{ fontSize: 9.5, marginLeft: 2 }}>g</span></td>
                <td className="num muted" style={{ textAlign: "right" }}>{m.f}<span className="dim" style={{ fontSize: 9.5, marginLeft: 2 }}>g</span></td>
                <td className="num" style={{ textAlign: "right" }}>{m.assigned}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
};

// ── Notification centre ──────────────────────────────
const NC_ITEMS = [
  { id: "N-01", kind: "alert",   at: "12 min ago",  who: "Sophie Klein",  title: "Overtraining risk · critical", body: "Third consecutive day of recovery below 60 with RPE above 8.5.", unread: true },
  { id: "N-02", kind: "message", at: "38 min ago",  who: "Lukas Bauer",   title: "New message", body: "\"Weight is up 1.2 kg since Saturday — should I worry?\"", unread: true },
  { id: "N-03", kind: "checkin", at: "1 h ago",     who: "Marcus Weber",  title: "Check-in submitted", body: "Weekly form complete · adherence 96 % · two open questions.", unread: true },
  { id: "N-04", kind: "system",  at: "2 h ago",     who: "Platform",      title: "Program delivered", body: "Week 4 of Powerbuilding 12 sent to 6 clients automatically.", unread: true },
  { id: "N-05", kind: "alert",   at: "4 h ago",     who: "Elena Schmidt", title: "Adherence drop", body: "Nutrition adherence fell 20 points over the last 7 days.", unread: false },
  { id: "N-06", kind: "message", at: "yesterday",   who: "Niko Brandt",   title: "New message", body: "\"Sent the deadlift video from today's session.\"", unread: false },
  { id: "N-07", kind: "billing", at: "yesterday",   who: "Platform",      title: "Payment received", body: "€180 · Lukas Bauer · September retainer.", unread: false },
  { id: "N-08", kind: "checkin", at: "2 days ago",  who: "Anna Frey",     title: "Check-in overdue", body: "No submission for 9 days. Two automated reminders sent.", unread: false },
  { id: "N-09", kind: "system",  at: "3 days ago",  who: "Platform",      title: "Consent expiring", body: "Elena Schmidt's data access expires in 90 days.", unread: false },
];

const NC_KIND = {
  alert:   { c: "var(--neg)",        i: "alert",   l: "Alert" },
  message: { c: "var(--acc-coach)",  i: "message", l: "Message" },
  checkin: { c: "var(--acc-recov)",  i: "check",   l: "Check-in" },
  system:  { c: "var(--fg-dim)",     i: "settings",l: "System" },
  billing: { c: "var(--acc-mkt)",    i: "marketplace", l: "Billing" },
};

window.PortalNotificationCenter = () => {
  const [filter, setFilter] = useState("all");
  const [read, setRead] = useState([]);
  const isUnread = (n) => n.unread && !read.includes(n.id);
  const rows = NC_ITEMS.filter(n => filter === "all" ? true : filter === "unread" ? isUnread(n) : n.kind === filter);
  const unreadCount = NC_ITEMS.filter(isUnread).length;

  return (
    <div className="grid" style={{ gridTemplateColumns: "1.5fr 1fr", gap: 14 }}>
      <div>
        <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap", alignItems: "center" }}>
          {[["all", `All · ${NC_ITEMS.length}`], ["unread", `Unread · ${unreadCount}`], ["alert", "Alerts"], ["message", "Messages"], ["checkin", "Check-ins"], ["system", "System"], ["billing", "Billing"]].map(([k, l]) => (
            <button key={k} onClick={() => setFilter(k)} className={filter === k ? "pill pill-acc" : "pill"} style={{ cursor: "pointer", padding: "4px 11px", fontSize: 11 }}>{l}</button>
          ))}
          <div className="spacer" />
          <button className="btn btn-sm btn-ghost" onClick={() => setRead(NC_ITEMS.map(n => n.id))}>Mark all read</button>
        </div>
        <div className="col-gap" style={{ gap: 7 }}>
          {rows.map(n => {
            const k = NC_KIND[n.kind];
            const un = isUnread(n);
            return (
              <div key={n.id} onClick={() => setRead(r => r.includes(n.id) ? r : [...r, n.id])} style={{
                display: "flex", gap: 12, padding: 13, cursor: "pointer", borderRadius: 8,
                background: un ? "color-mix(in srgb, var(--acc-coach) 5%, var(--surface))" : "var(--surface)",
                border: `1px solid ${un ? "color-mix(in srgb, var(--acc-coach) 24%, var(--border))" : "var(--border)"}`,
              }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 7, flexShrink: 0,
                  background: `color-mix(in srgb, ${k.c} 14%, transparent)`,
                  border: `1px solid color-mix(in srgb, ${k.c} 30%, var(--border))`,
                  color: k.c, display: "grid", placeItems: "center",
                }}><Icon name={k.i} className="ic ic-sm" /></div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 12.5, fontWeight: un ? 600 : 500 }}>{n.title}</span>
                    <Pill style={{ color: k.c, borderColor: `color-mix(in srgb, ${k.c} 30%, var(--border))`, fontSize: 9.5 }}>{k.l}</Pill>
                    {un && <span style={{ width: 6, height: 6, borderRadius: 999, background: "var(--acc-coach)" }} />}
                    <span className="dim mono" style={{ marginLeft: "auto", fontSize: 10 }}>{n.at}</span>
                  </div>
                  <div className="muted" style={{ fontSize: 11.5, lineHeight: 1.45, marginBottom: 3 }}>{n.body}</div>
                  <div className="dim mono" style={{ fontSize: 10 }}>{n.who}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="col-gap" style={{ gap: 14 }}>
        <Card title="Delivery preferences" sub="how each type reaches you">
          {[["Critical alerts", "push · SMS · bypasses quiet hours"], ["High alerts", "push · in-app"], ["Messages", "push · batched every 30 min"], ["Check-ins", "in-app only"], ["System", "in-app only"], ["Billing", "email · in-app"]].map(([k, v]) => (
            <Row key={k} label={k} value={v} />
          ))}
          <div className="divider" />
          <button className="btn btn-ghost" style={{ width: "100%" }} onClick={() => window.dispatchEvent(new CustomEvent("coach-modal", { detail: { type: "settings" } }))}>
            <Icon name="settings" className="ic ic-sm" />Edit quiet hours & batching
          </button>
        </Card>
        <Card title="This week" sub="notification volume">
          {window.BarSeries && <window.BarSeries data={[8, 14, 11, 19, 12, 6, 4]} labels={["M","T","W","T","F","S","S"]} h={80} color="var(--acc-coach)" highlight={3} />}
          <div className="divider" />
          <Row label="Total" value="74"/>
          <Row label="Acted on" value="68 · 92 %"/>
          <Row label="Median response" value="1.8 h"/>
        </Card>
      </div>
    </div>
  );
};
