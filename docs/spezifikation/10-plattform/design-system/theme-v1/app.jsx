// LumeOS app root

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "theme": "dark",
  "density": "default",
  "rightPanel": true,
  "typePair": "inter_jbmono",
  "moduleAccentSet": "muted"
}/*EDITMODE-END*/;

const TYPE_PAIRS = {
  inter_jbmono:  { sans: "'Inter'", mono: "'JetBrains Mono'", label: "Inter · JetBrains Mono" },
  geist:         { sans: "'Geist'", mono: "'Geist Mono'", label: "Geist · Geist Mono" },
  manrope:       { sans: "'Manrope'", mono: "'JetBrains Mono'", label: "Manrope · JetBrains Mono" },
  ibm:           { sans: "'IBM Plex Sans'", mono: "'IBM Plex Mono'", label: "IBM Plex" },
};

const ACCENT_SETS = {
  muted: {
    label: "Muted (default)",
    dark: {
      "--acc-dash": "oklch(0.78 0.04 240)",
      "--acc-nutri": "oklch(0.78 0.10 70)",
      "--acc-train": "oklch(0.74 0.10 290)",
      "--acc-recov": "oklch(0.78 0.08 160)",
      "--acc-suppl": "oklch(0.76 0.10 25)",
      "--acc-goals": "oklch(0.80 0.10 95)",
      "--acc-medic": "oklch(0.76 0.09 15)",
      "--acc-coach": "oklch(0.78 0.08 200)",
      "--acc-buddy": "oklch(0.76 0.09 310)",
      "--acc-mkt":   "oklch(0.78 0.08 145)",
      "--acc-admin": "oklch(0.75 0.01 270)",
    },
  },
  vivid: {
    label: "Vivid",
    dark: {
      "--acc-dash": "oklch(0.78 0.07 240)",
      "--acc-nutri": "oklch(0.74 0.18 60)",
      "--acc-train": "oklch(0.68 0.20 295)",
      "--acc-recov": "oklch(0.74 0.16 160)",
      "--acc-suppl": "oklch(0.70 0.20 25)",
      "--acc-goals": "oklch(0.80 0.18 95)",
      "--acc-medic": "oklch(0.68 0.20 15)",
      "--acc-coach": "oklch(0.72 0.14 210)",
      "--acc-buddy": "oklch(0.70 0.18 310)",
      "--acc-mkt":   "oklch(0.72 0.16 145)",
      "--acc-admin": "oklch(0.72 0.04 270)",
    },
  },
  mono: {
    label: "Monochrome",
    dark: {
      "--acc-dash": "oklch(0.85 0.01 270)",
      "--acc-nutri": "oklch(0.85 0.01 270)",
      "--acc-train": "oklch(0.85 0.01 270)",
      "--acc-recov": "oklch(0.85 0.01 270)",
      "--acc-suppl": "oklch(0.85 0.01 270)",
      "--acc-goals": "oklch(0.85 0.01 270)",
      "--acc-medic": "oklch(0.85 0.01 270)",
      "--acc-coach": "oklch(0.85 0.01 270)",
      "--acc-buddy": "oklch(0.85 0.01 270)",
      "--acc-mkt":   "oklch(0.85 0.01 270)",
      "--acc-admin": "oklch(0.85 0.01 270)",
    },
  },
};

const App = () => {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [active, setActive] = useState("dashboard");
  const [dismissed, setDismissed] = useState([]);

  // Apply theme + accent + type
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", t.theme);
  }, [t.theme]);

  useEffect(() => {
    const set = ACCENT_SETS[t.moduleAccentSet] || ACCENT_SETS.muted;
    const vars = set.dark;
    const root = document.documentElement;
    Object.entries(vars).forEach(([k, v]) => root.style.setProperty(k, v));
  }, [t.moduleAccentSet, t.theme]);

  useEffect(() => {
    const pair = TYPE_PAIRS[t.typePair] || TYPE_PAIRS.inter_jbmono;
    document.documentElement.style.setProperty(
      "--font-sans",
      pair.sans + ", -apple-system, system-ui, sans-serif"
    );
    document.documentElement.style.setProperty(
      "--font-mono",
      pair.mono + ", ui-monospace, monospace"
    );
  }, [t.typePair]);

  // Determine which module + accent
  const cur = resolveNav(active);
  const accentVar = cur.accent.replace(/var\(|\)/g, "");

  // Reset dismissed on module switch
  useEffect(() => { setDismissed([]); }, [active]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
      const m = MODULES.find(x => x.shortcut === e.key);
      if (m) { setActive(m.id); e.preventDefault(); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const moduleEl = (() => {
    switch (active) {
      case "dashboard": return <DashboardModule />;
      case "nutrition": return <NutritionModule />;
      case "training":  return <TrainingModule />;
      case "recovery":  return window.RecoveryModuleV2 ? <window.RecoveryModuleV2 /> : <RecoveryModule />;
      case "supplements": return <SupplementsModule />;
      case "medical": return window.MedicalModuleV2 ? <window.MedicalModuleV2 /> : <MedicalModule />;
      case "goals": return <GoalsModule />;
      case "coach": case "coach-human": return <CoachModule />;
      case "coach-ai": return <BuddyModule />;
      case "portal": return <CoachPortalStandalone />;
      case "marketplace": return <MarketplaceModule />;
      case "auth": return <AuthModule />;
      case "admin": return window.AdminModuleV2 ? <window.AdminModuleV2 /> : <AdminModule />;
      default:
        if (STUB_DATA[active]) {
          const d = STUB_DATA[active];
          return <ModuleStub id={active} {...d} />;
        }
        return null;
    }
  })();

  return (
    <div
      className="app"
      data-pad={t.density}
      data-rightpanel={t.rightPanel ? "shown" : "hidden"}
      data-screen-label={`${cur.id} · ${cur.label}`}
      style={{"--acc": `var(${accentVar})`}}
    >
      <Sidebar active={active} setActive={setActive} />
      <main className="main">
        <Topbar
          moduleId={cur.id}
          moduleLabel={cur.label}
          syncState={active === "training" ? "offline" : "synced"}
          theme={t.theme}
          onToggleTheme={() => setTweak("theme", t.theme === "dark" ? "light" : "dark")}
          rightOpen={t.rightPanel}
          onToggleRight={() => setTweak("rightPanel", !t.rightPanel)}
        />
        <div className="content">{moduleEl}</div>
      </main>
      {t.rightPanel && (
        <ContextPanel
          moduleId={active}
          dismissed={dismissed}
          onCloseInsight={(i) => setDismissed(d => [...d, i])}
        />
      )}

      <LumeTweaks t={t} setTweak={setTweak} />
      <ProfileSettingsLauncher/>
      <OnboardingTestLauncher/>
    </div>
  );
};

const OnboardingTestLauncher = () => {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const h = () => setOpen(true);
    window.addEventListener("open-onboarding-test", h);
    return () => window.removeEventListener("open-onboarding-test", h);
  }, []);
  if (!open || !window.AuthWalkthrough) return null;
  return (
    <div className="modal-veil" onClick={() => setOpen(false)}>
      <div className="modal" style={{width: 720, maxHeight: "92vh"}} onClick={e => e.stopPropagation()}>
        <div className="modal-h">
          <div style={{width: 26, height: 26, borderRadius: 6, background: "color-mix(in srgb, var(--acc-coach) 18%, transparent)", border: "1px solid color-mix(in srgb, var(--acc-coach) 35%, var(--border))", color: "var(--acc-coach)", display: "grid", placeItems: "center"}}>
            <Icon name="play" className="ic"/>
          </div>
          <div style={{flex: 1}}>
            <div style={{fontSize: 14, fontWeight: 600}}>Onboarding simulation</div>
            <div className="dim" style={{fontSize: 11}}>Test surface · walk the first-run flow end to end</div>
          </div>
          <button className="icon-btn" onClick={() => setOpen(false)}><Icon name="x" className="ic"/></button>
        </div>
        <div className="modal-body" style={{overflowY: "auto"}}>
          <window.AuthWalkthrough/>
        </div>
      </div>
    </div>
  );
};

const ProfileSettingsLauncher = () => {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const h = () => setOpen(true);
    window.addEventListener("open-profile-settings", h);
    return () => window.removeEventListener("open-profile-settings", h);
  }, []);
  if (!open || !window.ProfileSettingsModal) return null;
  return <window.ProfileSettingsModal onClose={() => setOpen(false)}/>;
};

const LumeTweaks = ({ t, setTweak }) => (
  <TweaksPanel title="LumeOS · Tweaks">
    <TweakSection label="Appearance">
      <TweakRadio
        label="Theme"
        value={t.theme}
        onChange={v => setTweak("theme", v)}
        options={[{value: "dark", label: "Dark"}, {value: "light", label: "Light"}]}
      />
      <TweakRadio
        label="Density"
        value={t.density}
        onChange={v => setTweak("density", v)}
        options={[
          {value: "compact", label: "Compact"},
          {value: "default", label: "Default"},
          {value: "comfortable", label: "Spacious"},
        ]}
      />
      <TweakToggle
        label="Right context panel"
        value={t.rightPanel}
        onChange={v => setTweak("rightPanel", v)}
      />
    </TweakSection>

    <TweakSection label="Typography">
      <TweakSelect
        label="Type pair"
        value={t.typePair}
        onChange={v => setTweak("typePair", v)}
        options={Object.entries(TYPE_PAIRS).map(([k, v]) => ({value: k, label: v.label}))}
      />
    </TweakSection>

    <TweakSection label="Module accents">
      <TweakSelect
        label="Palette"
        value={t.moduleAccentSet}
        onChange={v => setTweak("moduleAccentSet", v)}
        options={Object.entries(ACCENT_SETS).map(([k, v]) => ({value: k, label: v.label}))}
      />
      <div style={{display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 4, paddingTop: 4}}>
        {Object.entries(ACCENT_SETS[t.moduleAccentSet].dark).map(([k, v]) => (
          <div key={k} title={k} style={{
            height: 22, borderRadius: 4, background: v,
            border: "1px solid var(--border)"
          }} />
        ))}
      </div>
    </TweakSection>
  </TweaksPanel>
);

window.App = App;
window.TWEAK_DEFAULTS = TWEAK_DEFAULTS;

// Bootstrap
ReactDOM.createRoot(document.getElementById("root")).render(<App />);
