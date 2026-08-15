// Shared UI primitives for LumeOS

const { useState, useEffect, useRef, useMemo, useCallback } = React;

// --- ICON LIBRARY (lucide-inspired, stroked) ---
const Icon = ({ name, className = "ic", style }) => {
  const paths = ICONS[name];
  if (!paths) return null;
  return (
    <svg className={className} style={style} viewBox="0 0 24 24">
      {paths}
    </svg>
  );
};

const p = (d) => <path d={d} key={d} />;
const ICONS = {
  search: <><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></>,
  plus: <><path d="M12 5v14" /><path d="M5 12h14" /></>,
  filter: <><path d="M3 6h18" /><path d="M7 12h10" /><path d="M10 18h4" /></>,
  more: <><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" /></>,
  chevron_left: <path d="m15 18-6-6 6-6" />,
  chevron_right: <path d="m9 18 6-6-6-6" />,
  chevron_down: <path d="m6 9 6 6 6-6" />,
  arrow_right: <><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></>,
  arrow_up: <><path d="M12 19V5" /><path d="m5 12 7-7 7 7" /></>,
  arrow_down: <><path d="M12 5v14" /><path d="m19 12-7 7-7-7" /></>,
  dashboard: <><rect x="3" y="3" width="7" height="9" rx="1" /><rect x="14" y="3" width="7" height="5" rx="1" /><rect x="14" y="12" width="7" height="9" rx="1" /><rect x="3" y="16" width="7" height="5" rx="1" /></>,
  nutrition: <><path d="M20 11.5A8.5 8.5 0 1 1 11.5 3 8.5 8.5 0 0 1 20 11.5Z" /><path d="M7 11h9" /><path d="M11 7v9" /></>,
  training: <><path d="M14.4 14.4 9.6 9.6" /><path d="M18.657 21.485a2 2 0 1 1-2.829-2.828l-1.767 1.768a2 2 0 1 1-2.829-2.829l6.364-6.364a2 2 0 1 1 2.829 2.829l-1.768 1.767a2 2 0 1 1 2.828 2.829z" transform="rotate(0 12 12)" /><path d="m21.5 21.5-1.4-1.4" /><path d="M3.9 3.9 2.5 2.5" /><path d="M6.404 12.768a2 2 0 1 1-2.829-2.829l1.768-1.767a2 2 0 1 1-2.828-2.829l2.828-2.828a2 2 0 1 1 2.829 2.828l1.767-1.768a2 2 0 1 1 2.829 2.829z" /></>,
  recovery: <><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></>,
  supplements: <><path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z" /><path d="m8.5 8.5 7 7" /></>,
  goals: <><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></>,
  medical: <><path d="M11 2v2" /><path d="M5 2v2" /><path d="M5 3H4a2 2 0 0 0-2 2v4a6 6 0 0 0 12 0V5a2 2 0 0 0-2-2h-1" /><path d="M8 15a6 6 0 0 0 12 0v-3" /><circle cx="20" cy="10" r="2" /></>,
  coach: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></>,
  buddy: <><circle cx="12" cy="12" r="10" /><path d="M8 14s1.5 2 4 2 4-2 4-2" /><path d="M9 9h.01" /><path d="M15 9h.01" /></>,
  marketplace: <><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7" /><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" /><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4" /><path d="M2 7h20" /></>,
  admin: <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" /></>,
  settings: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></>,
  bell: <><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></>,
  camera: <><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" /><circle cx="12" cy="13" r="3" /></>,
  flame: <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />,
  droplet: <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />,
  trend_up: <><path d="m23 6-9.5 9.5-5-5L1 18" /><path d="M17 6h6v6" /></>,
  trend_down: <><path d="m23 18-9.5-9.5-5 5L1 6" /><path d="M17 18h6v-6" /></>,
  timer: <><circle cx="12" cy="13" r="8" /><path d="M12 9v4l2 2" /><path d="M9 1h6" /><path d="M12 1v3" /></>,
  zap: <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />,
  check: <path d="m5 12 5 5L20 7" />,
  x: <><path d="M18 6 6 18" /><path d="m6 6 12 12" /></>,
  edit: <><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="m18.5 2.5 3 3L12 15l-4 1 1-4z" /></>,
  trash: <><path d="M3 6h18" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" /><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></>,
  play: <path d="m6 3 14 9-14 9z" />,
  pause: <><rect x="6" y="4" width="4" height="16" rx="0.5" /><rect x="14" y="4" width="4" height="16" rx="0.5" /></>,
  command: <path d="M18 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3H6a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3V6a3 3 0 0 0-3-3 3 3 0 0 0-3 3 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 3 3 0 0 0-3-3z" />,
  brain: <><path d="M9.5 2a2.5 2.5 0 0 1 0 5v8a2.5 2.5 0 0 1-5 0v-.5A2.5 2.5 0 0 1 2 12a2.5 2.5 0 0 1 2.5-2.5v-1A2.5 2.5 0 0 1 7 6V4.5A2.5 2.5 0 0 1 9.5 2z" /><path d="M14.5 2a2.5 2.5 0 0 0 0 5v8a2.5 2.5 0 0 0 5 0v-.5A2.5 2.5 0 0 0 22 12a2.5 2.5 0 0 0-2.5-2.5v-1A2.5 2.5 0 0 0 17 6V4.5A2.5 2.5 0 0 0 14.5 2z" /></>,
  alert: <><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><path d="M12 9v4" /><path d="M12 17h.01" /></>,
  sparkles: <><path d="m12 3-1.5 4.5L6 9l4.5 1.5L12 15l1.5-4.5L18 9l-4.5-1.5L12 3z" /></>,
  moon: <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />,
  sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2" /><path d="M12 20v2" /><path d="m5 5 1.5 1.5" /><path d="m17.5 17.5 1.5 1.5" /><path d="M2 12h2" /><path d="M20 12h2" /><path d="m5 19 1.5-1.5" /><path d="m17.5 6.5 1.5-1.5" /></>,
  layers: <><path d="m12 2 9 5-9 5-9-5z" /><path d="m3 12 9 5 9-5" /><path d="m3 17 9 5 9-5" /></>,
  pin: <><path d="M12 17v5" /><path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z" /></>,
  share: <><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><path d="m8.59 13.51 6.83 3.98" /><path d="m15.41 6.51-6.82 3.98" /></>,
  bookmark: <path d="m19 21-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />,
  calendar: <><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4" /><path d="M8 2v4" /><path d="M3 10h18" /></>,
  message: <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />,
  wifi_off: <><path d="M1 1l22 22" /><path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" /><path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" /><path d="M10.71 5.05A16 16 0 0 1 22.58 9" /><path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" /><path d="M8.53 16.11a6 6 0 0 1 6.95 0" /><path d="M12 20h.01" /></>,
  download: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="m7 10 5 5 5-5" /><path d="M12 15V3" /></>,
  copy: <><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></>,
};

// --- COMPONENTS ---
const Card = ({ title, sub, actions, children, className = "", style, accent, onClick }) => (
  <div className={`card ${className}`} style={style} onClick={onClick}>
    {(title || actions) && (
      <div className="card-h">
        {accent && <span className="dot" style={{background: accent}} />}
        {title && <span className="card-title">{title}</span>}
        {sub && <span className="card-sub">{sub}</span>}
        <div className="card-actions">{actions}</div>
      </div>
    )}
    {children}
  </div>
);

const Pill = ({ children, variant = "" }) => (
  <span className={`pill ${variant ? "pill-" + variant : ""}`}>{children}</span>
);

const Sparkline = ({ data, color = "currentColor", w = 120, h = 30, strokeWidth = 1.4, fill = true }) => {
  if (!data || data.length === 0) return null;
  const min = Math.min(...data), max = Math.max(...data);
  const range = max - min || 1;
  const step = w / (data.length - 1);
  const points = data.map((v, i) => [i * step, h - ((v - min) / range) * (h - 4) - 2]);
  const d = points.map((pt, i) => (i === 0 ? "M" : "L") + pt[0].toFixed(1) + " " + pt[1].toFixed(1)).join(" ");
  const dArea = d + ` L ${w} ${h} L 0 ${h} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", height: h }} preserveAspectRatio="none">
      {fill && <path d={dArea} fill={color} opacity="0.12" />}
      <path d={d} fill="none" stroke={color} strokeWidth={strokeWidth} vectorEffect="non-scaling-stroke" />
    </svg>
  );
};

const KPI = ({ label, value, unit, delta, deltaVariant, spark, sparkColor }) => (
  <div className="kpi">
    <span className="kpi-acc-bar" />
    <div className="kpi-label">{label}</div>
    <div className="kpi-value num">
      {value}
      {unit && <span className="unit">{unit}</span>}
    </div>
    {delta && (
      <div className={`kpi-delta ${deltaVariant || ""}`}>
        {deltaVariant === "pos" && <Icon name="arrow_up" className="ic ic-sm" />}
        {deltaVariant === "neg" && <Icon name="arrow_down" className="ic ic-sm" />}
        {delta}
      </div>
    )}
    {spark && (
      <div className="kpi-spark">
        <Sparkline data={spark} color={sparkColor || "var(--acc)"} h={30} />
      </div>
    )}
  </div>
);

const Ring = ({ value, max = 100, size = 120, stroke = 8, color = "var(--acc)", track = "var(--surface-2)", label = "" }) => {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.min(value / max, 1);
  return (
    <div className="ring" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={r} stroke={track} strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2} cy={size / 2} r={r}
          stroke={color} strokeWidth={stroke} fill="none"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.5s ease" }}
        />
      </svg>
      <div className="ring-label">
        <span className="v">{value}</span>
        <span className="l">{label}</span>
      </div>
    </div>
  );
};

const Meter = ({ value, max = 100, color = "var(--acc)", tall = false }) => (
  <div className={`meter ${tall ? "meter-tall" : ""}`}>
    <i style={{ width: Math.min(100, (value / max) * 100) + "%", background: color }} />
  </div>
);

const Row = ({ label, value, icon, sub }) => (
  <div className="row">
    <span className="row-l">
      {icon}
      {label}
      {sub && <span className="dim" style={{fontSize:11}}>{sub}</span>}
    </span>
    <span className="row-r num">{value}</span>
  </div>
);

const ModuleHero = ({ icon, title, sub, pills, actions, stats }) => (
  <div className="module-hero">
    <div className="mh-medallion"><Icon name={icon} className="ic" /></div>
    <div className="mh-body">
      <div className="mh-title-row">
        <span className="mh-title">{title}</span>
        {pills}
      </div>
      {sub && <div className="mh-sub">{sub}</div>}
    </div>
    {stats && (
      <div className="mh-stats">
        {stats.map((s, i) => (
          <div key={i} className="mh-stat">
            <div className="mh-stat-l">{s.label}</div>
            <div className="mh-stat-v">{s.value}</div>
            {s.sub && <div className="mh-stat-s">{s.sub}</div>}
          </div>
        ))}
      </div>
    )}
    {actions && <div className="mh-actions">{actions}</div>}
  </div>
);

const Tabs = ({ items, active, onChange }) => (
  <div className="tabs tabs-rail">
    {items.map(t => (
      <div
        key={t.id}
        className={`tab ${active === t.id ? "active" : ""}`}
        onClick={() => onChange(t.id)}
      >
        {t.icon && <Icon name={t.icon} className="ic ic-sm" />}
        {t.label}
        {t.count != null && <span className="count num">{t.count}</span>}
      </div>
    ))}
  </div>
);

// --- AREA / LINE CHART ---
const LineChart = ({ series, h = 160, yLabels, xLabels, color = "var(--acc)", showArea = true, range }) => {
  // series: [{data:[], color}, ...] OR plain array
  const ss = Array.isArray(series[0]) || typeof series[0] === "number" ? [{ data: series, color }] : series;
  const all = ss.flatMap(s => s.data);
  const [min, max] = range || [Math.min(...all) * 0.9, Math.max(...all) * 1.05];
  const w = 600;
  const pad = { l: 28, r: 8, t: 8, b: 18 };
  const iw = w - pad.l - pad.r;
  const ih = h - pad.t - pad.b;
  const toX = (i, n) => pad.l + (i / (n - 1)) * iw;
  const toY = (v) => pad.t + ih - ((v - min) / (max - min)) * ih;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", height: h }} preserveAspectRatio="none">
      {/* y grid */}
      {[0, 0.25, 0.5, 0.75, 1].map((t, i) => (
        <g key={i}>
          <line x1={pad.l} x2={w - pad.r} y1={pad.t + t * ih} y2={pad.t + t * ih} stroke="var(--border)" strokeWidth="1" />
          <text x={pad.l - 6} y={pad.t + t * ih + 3} textAnchor="end" fontSize="9" fill="var(--fg-dim)" fontFamily="var(--font-mono)">
            {Math.round(max - t * (max - min))}
          </text>
        </g>
      ))}
      {ss.map((s, si) => {
        const pts = s.data.map((v, i) => [toX(i, s.data.length), toY(v)]);
        const d = pts.map((pt, i) => (i === 0 ? "M" : "L") + pt[0].toFixed(1) + " " + pt[1].toFixed(1)).join(" ");
        const dArea = d + ` L ${pts[pts.length - 1][0]} ${pad.t + ih} L ${pts[0][0]} ${pad.t + ih} Z`;
        return (
          <g key={si}>
            {showArea && si === 0 && <path d={dArea} fill={s.color || color} opacity="0.08" />}
            <path d={d} fill="none" stroke={s.color || color} strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
            {pts.map((pt, i) => (
              <circle key={i} cx={pt[0]} cy={pt[1]} r="2" fill={s.color || color} />
            ))}
          </g>
        );
      })}
      {xLabels && xLabels.map((l, i) => (
        <text key={i} x={toX(i, xLabels.length)} y={h - 4} textAnchor="middle" fontSize="9" fill="var(--fg-dim)" fontFamily="var(--font-mono)">
          {l}
        </text>
      ))}
    </svg>
  );
};

// --- RADAR CHART ---
const RadarChart = ({ data, h = 220, color = "var(--acc)" }) => {
  // data: [{ label, value (0-1), target? }]
  const w = h;
  const cx = w / 2, cy = h / 2;
  const r = Math.min(w, h) / 2 - 26;
  const n = data.length;
  const pt = (i, v) => {
    const angle = (i / n) * 2 * Math.PI - Math.PI / 2;
    return [cx + Math.cos(angle) * r * v, cy + Math.sin(angle) * r * v];
  };
  const polyPath = (vals) => vals.map((v, i) => (i === 0 ? "M" : "L") + pt(i, v).map(x => x.toFixed(1)).join(" ")).join(" ") + " Z";
  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", height: h }}>
      {[0.25, 0.5, 0.75, 1].map((rr, i) => (
        <polygon key={i}
          points={Array.from({ length: n }, (_, j) => pt(j, rr).join(",")).join(" ")}
          fill="none" stroke="var(--border)" strokeWidth="1"
        />
      ))}
      {data.map((d, i) => (
        <line key={i} x1={cx} y1={cy} x2={pt(i, 1)[0]} y2={pt(i, 1)[1]} stroke="var(--border)" strokeWidth="1" />
      ))}
      {/* target */}
      {data.some(d => d.target != null) && (
        <path d={polyPath(data.map(d => d.target ?? 0.8))} fill="none" stroke="var(--fg-dim)" strokeWidth="1" strokeDasharray="3 3" />
      )}
      <path d={polyPath(data.map(d => d.value))} fill={color} opacity="0.18" />
      <path d={polyPath(data.map(d => d.value))} fill="none" stroke={color} strokeWidth="1.5" />
      {data.map((d, i) => (
        <circle key={i} cx={pt(i, d.value)[0]} cy={pt(i, d.value)[1]} r="2.5" fill={color} />
      ))}
      {data.map((d, i) => {
        const [x, y] = pt(i, 1.15);
        return (
          <text key={i} x={x} y={y + 3} textAnchor="middle" fontSize="9" fill="var(--fg-muted)" fontFamily="var(--font-mono)">
            {d.label}
          </text>
        );
      })}
    </svg>
  );
};

// --- ORB (Buddy animated geometric) ---
const BuddyOrb = ({ state = "idle", size = 72 }) => {
  const t = useTime();
  // state: idle | thinking | responding | alert | celebrating
  const speed = state === "thinking" ? 2.4 : state === "responding" ? 1.6 : state === "celebrating" ? 3 : 0.8;
  const a = Math.sin(t * speed) * 0.5 + 0.5;
  const b = Math.sin(t * speed * 1.3 + 1.2) * 0.5 + 0.5;
  const c = Math.sin(t * speed * 0.7 + 2.4) * 0.5 + 0.5;
  const stateColor = {
    idle: "var(--acc-buddy)",
    thinking: "var(--acc-coach)",
    responding: "var(--acc-recov)",
    alert: "var(--warn)",
    celebrating: "var(--acc-nutri)"
  }[state] || "var(--acc-buddy)";
  const r = size / 2;
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <defs>
        <radialGradient id="orb-g" cx="50%" cy="40%">
          <stop offset="0%" stopColor={stateColor} stopOpacity="0.9" />
          <stop offset="100%" stopColor={stateColor} stopOpacity="0.05" />
        </radialGradient>
        <filter id="blur"><feGaussianBlur stdDeviation="2" /></filter>
      </defs>
      <circle cx="50" cy="50" r="42" fill="url(#orb-g)" opacity={0.5 + a * 0.4} />
      <circle cx={50 + (a - 0.5) * 18} cy={50 + (b - 0.5) * 18} r={18 + c * 6} fill={stateColor} opacity="0.55" filter="url(#blur)" />
      <circle cx={50 + (b - 0.5) * 12} cy={50 + (c - 0.5) * 12} r={12 + a * 4} fill={stateColor} opacity="0.7" filter="url(#blur)" />
      <circle cx="50" cy="50" r={6 + a * 2} fill={stateColor} />
      <circle cx="50" cy="50" r={3} fill="var(--bg)" opacity="0.6" />
    </svg>
  );
};

function useTime() {
  const [t, setT] = useState(0);
  useEffect(() => {
    let raf, start;
    const tick = (now) => {
      if (!start) start = now;
      setT((now - start) / 1000);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);
  return t;
}

// Export
Object.assign(window, {
  Icon, ICONS,
  Card, Pill, Sparkline, KPI, Ring, Meter, Row, Tabs, ModuleHero,
  LineChart, RadarChart, BuddyOrb,
  useTime
});
