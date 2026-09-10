// Placeholder modules — keep the shell coherent when navigating, signaling this isn't built out yet.

const ModuleStub = ({ id, title, sub, icon, accent, sections }) => (
  <>
    <div className="module-header">
      <div className="module-title-block">
        <div className="module-title-row">
          <span className="module-title">{title}</span>
          <Pill>Preview · not in this round</Pill>
        </div>
        <div className="module-sub">{sub}</div>
      </div>
      <div className="module-actions">
        <button className="btn btn-ghost"><Icon name="plus" className="ic ic-sm" /> Add</button>
        <button className="btn"><Icon name="settings" className="ic ic-sm" /> Configure</button>
      </div>
    </div>
    <div className="grid g-cols-3" style={{gap: 12, marginBottom: 16}}>
      {sections.kpis.map((k, i) => (
        <KPI key={i} label={k.label} value={k.value} unit={k.unit} delta={k.delta} deltaVariant={k.deltaVariant} spark={k.spark} sparkColor={accent} />
      ))}
    </div>
    <Card>
      <div style={{display: "flex", flexDirection: "column", alignItems: "center", padding: "32px 20px", gap: 12, textAlign: "center"}}>
        <div style={{
          width: 44, height: 44, borderRadius: 10,
          background: `color-mix(in oklch, ${accent} 14%, transparent)`,
          border: `1px solid color-mix(in oklch, ${accent} 30%, var(--border))`,
          color: accent, display: "grid", placeItems: "center"
        }}>
          <Icon name={icon} className="ic" style={{width: 20, height: 20}} />
        </div>
        <div>
          <div style={{fontSize: 14, fontWeight: 600, marginBottom: 4}}>{sections.message.title}</div>
          <div style={{fontSize: 12, color: "var(--fg-muted)", maxWidth: 420, lineHeight: 1.5}}>{sections.message.body}</div>
        </div>
        <div style={{display: "flex", gap: 6, marginTop: 6}}>
          <button className="btn btn-primary"><Icon name="plus" className="ic ic-sm" /> {sections.message.cta}</button>
          <button className="btn"><Icon name="search" className="ic ic-sm" /> Browse</button>
        </div>
      </div>
      <div className="divider" style={{margin: 0}} />
      <div style={{padding: 16}}>
        <div className="eyebrow" style={{marginBottom: 10}}>Planned surfaces</div>
        <div className="grid g-cols-3" style={{gap: 8}}>
          {sections.surfaces.map((s, i) => (
            <div key={i} style={{padding: 12, background: "var(--surface-2)", borderRadius: 6}}>
              <div style={{fontSize: 12, fontWeight: 500, marginBottom: 3}}>{s.t}</div>
              <div className="dim" style={{fontSize: 11, lineHeight: 1.45}}>{s.d}</div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  </>
);

const STUB_DATA = {
  supplements: {
    title: "Supplements", icon: "supplements", accent: "var(--acc-suppl)",
    sub: "Stack builder, interaction check, compliance tracking",
    sections: {
      kpis: [
        { label: "Stack items",     value: "8",    unit: "active", delta: "+1 this wk" },
        { label: "Compliance 30d",  value: "94",   unit: "%", delta: "+3", deltaVariant: "pos", spark: [82,84,86,88,90,92,94] },
        { label: "Next dose",       value: "2:14", unit: "h", delta: "Mg · ZMA" },
      ],
      message: {
        title: "Supplements module preview",
        body: "Stack scheduling, interaction warnings, evidence-level tagging, and compliance heatmaps — coming in the next round.",
        cta: "Add supplement",
      },
      surfaces: [
        { t: "Stack Builder",     d: "Dosage, timing windows, weekday cadence" },
        { t: "Database",          d: "Search supplements with ingredient breakdown" },
        { t: "Compliance log",    d: "Streaks and skip reasons" },
        { t: "Interactions",      d: "Auto-warnings on conflicting combinations" },
        { t: "Cost tracker",      d: "Monthly spend per stack and per item" },
        { t: "Buddy reminders",   d: "Smart nudges if stack drifts" },
      ]
    }
  },
  goals: {
    title: "Goals & Body", icon: "goals", accent: "var(--acc-goals)",
    sub: "Active goals, milestones, body composition, measurements",
    sections: {
      kpis: [
        { label: "Active goals",  value: "3",    unit: "tracked" },
        { label: "Body fat",      value: "13.8", unit: "%", delta: "-1.2 in 4wk", deltaVariant: "pos", spark: [15.2,15.0,14.6,14.3,14.0,13.9,13.8] },
        { label: "Weight",        value: "79.4", unit: "kg", delta: "-1.1 in 4wk", deltaVariant: "pos", spark: [80.5,80.3,80.0,79.8,79.6,79.5,79.4] },
      ],
      message: {
        title: "Goals & Body module preview",
        body: "Goal-creator with cross-module linking (e.g. body comp → nutrition + training), milestone timelines, and FFMI / TDEE calculators.",
        cta: "New goal",
      },
      surfaces: [
        { t: "Goal dashboard",     d: "Cards with progress bars and milestones" },
        { t: "Body metrics",       d: "Weight, BF%, muscle mass trends" },
        { t: "Measurements",       d: "Circumferences + photo progression" },
        { t: "Body composition",   d: "FFMI / BMI / BMR / TDEE calculators" },
        { t: "Linked plans",       d: "Auto-adjust nutrition & training to goals" },
        { t: "Timeline view",      d: "Multi-goal gantt across the year" },
      ]
    }
  },
  medical: {
    title: "Medical", icon: "medical", accent: "var(--acc-medic)",
    sub: "Labs, medications, history, appointments",
    sections: {
      kpis: [
        { label: "Last labs",     value: "23",   unit: "days ago" },
        { label: "Biomarkers",    value: "47",   unit: "tracked" },
        { label: "Out of range",  value: "2",    unit: "items", delta: "Ferritin · 25-OH-D" },
      ],
      message: {
        title: "Medical module preview",
        body: "Sensitive, calm surface for lab uploads, medication tracking, and appointment management. Coach access is opt-in per category.",
        cta: "Upload labs",
      },
      surfaces: [
        { t: "Lab results",        d: "PDF upload + manual entry with reference ranges" },
        { t: "Biomarker trends",   d: "Ferritin, Vit D, Testosterone over time" },
        { t: "Medications",        d: "Log with dosage and adherence" },
        { t: "Medical history",    d: "Injuries, surgeries, diagnoses timeline" },
        { t: "Appointments",       d: "Calendar with notes per visit" },
        { t: "Documents",          d: "Encrypted store for reports and prescriptions" },
      ]
    }
  },
  coach: {
    title: "Coach Portal", icon: "coach", accent: "var(--acc-coach)",
    sub: "Multi-athlete dashboard for the coaching side of LumeOS",
    sections: {
      kpis: [
        { label: "Athletes",      value: "14",  unit: "active" },
        { label: "Needs attn.",   value: "3",   unit: "alerts", delta: "2 compliance · 1 sleep" },
        { label: "MRR",           value: "€4,820", unit: "this mo", delta: "+€420", deltaVariant: "pos" },
      ],
      message: {
        title: "Coach Portal preview",
        body: "Separate workspace for coaches (training / nutrition / supplement / medical). Athletes assign permissions per module from their side.",
        cta: "Invite athlete",
      },
      surfaces: [
        { t: "Athlete list",       d: "Quick-stats + alert highlights" },
        { t: "Athlete detail",     d: "Shared module views with comment threads" },
        { t: "Plan library",       d: "Re-usable training & nutrition plans" },
        { t: "Messaging",          d: "Direct channel per athlete" },
        { t: "Compliance grid",    d: "At-a-glance adherence matrix" },
        { t: "Onboarding",         d: "QR-code and invite link flow" },
      ]
    }
  },
  buddy: {
    title: "Buddy", icon: "buddy", accent: "var(--acc-buddy)",
    sub: "Standalone view for the AI assistant — chat, memory, decisions",
    sections: {
      kpis: [
        { label: "Conversations", value: "412",  unit: "total" },
        { label: "Decisions/wk",  value: "23",   unit: "auto + manual" },
        { label: "Tokens 30d",    value: "1.8M", unit: "in / out" },
      ],
      message: {
        title: "Buddy module preview",
        body: "Already present as a context panel everywhere. This module is the deep view: full chat history, memory editing, decision feed, and personality settings.",
        cta: "Open chat",
      },
      surfaces: [
        { t: "Chat",               d: "Conversational UI with cross-module context" },
        { t: "Memory",             d: "Edit what Buddy remembers" },
        { t: "Decision feed",      d: "Timeline of suggested + automated actions" },
        { t: "Personality",        d: "Tone, frequency, proactivity sliders" },
        { t: "Insights",           d: "Pattern detection across modules" },
        { t: "Avatar states",      d: "Idle · Thinking · Responding · Alert · Celebrating" },
      ]
    }
  },
  marketplace: {
    title: "Marketplace", icon: "marketplace", accent: "var(--acc-mkt)",
    sub: "Verified-only marketplace for plans, supplements, coaches",
    sections: {
      kpis: [
        { label: "Categories",    value: "6",    unit: "browsable" },
        { label: "Saved items",   value: "23",   unit: "wishlist" },
        { label: "This year",     value: "8",    unit: "purchases", delta: "€312" },
      ],
      message: {
        title: "Marketplace module preview",
        body: "Closed-economy: only verified suppliers. Plans + supplements + coaching packages + equipment. Coach recommendations attach to listings.",
        cta: "Browse",
      },
      surfaces: [
        { t: "Discover",           d: "Featured / trending / by category" },
        { t: "Product detail",     d: "Coach endorsements + evidence level" },
        { t: "Coach marketplace",  d: "Profiles, ratings, booking" },
        { t: "Plan store",         d: "Training & nutrition plans" },
        { t: "Orders",             d: "History, downloads, subscriptions" },
        { t: "Seller dashboard",   d: "For verified creators" },
      ]
    }
  },
  admin: {
    title: "Admin", icon: "admin", accent: "var(--acc-admin)",
    sub: "Internal LumeOS console — operators only",
    sections: {
      kpis: [
        { label: "DAU",           value: "12,402", unit: "users" },
        { label: "Uptime 30d",    value: "99.98",  unit: "%" },
        { label: "Open incidents",value: "0",      unit: "all clear", delta: "0 in 7d", deltaVariant: "pos" },
      ],
      message: {
        title: "Admin module preview",
        body: "User management, content moderation, system health, and Food-DB curation. Role-gated.",
        cta: "Open users",
      },
      surfaces: [
        { t: "Users",              d: "Search, ban/verify, role assignment" },
        { t: "Moderation",         d: "Marketplace + coach verification queue" },
        { t: "Analytics",          d: "DAU / MAU / feature adoption" },
        { t: "System health",      d: "API + DB + error logs" },
        { t: "Food-DB curation",   d: "Duplicate merging, nutrient corrections" },
        { t: "Audit log",          d: "Privileged action trail" },
      ]
    }
  },
};

window.ModuleStub = ModuleStub;
window.STUB_DATA = STUB_DATA;
