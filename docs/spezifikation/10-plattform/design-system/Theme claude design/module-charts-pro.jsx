// Chart primitives — upgraded craft: layered glow, lifted fills, gradient areas.
// Overrides Ring / Meter / Sparkline / LineChart from shared.jsx and adds new ones.
// Loads after shared.jsx, so unqualified global references pick these up at call time.

// Six-stop glow stack, the technique the reference kit uses for depth.
function glow(color, strength = 1) {
  const s = [
    [100, 80, 0.23], [41.778, 33.422, 0.1653], [22.336, 17.869, 0.1371],
    [12.522, 10.017, 0.115], [6.65, 5.32, 0.0929], [2.767, 2.214, 0.0647],
  ];
  return s.map(([y, b, a]) =>
    `0 ${(y * 0.16 * strength).toFixed(2)}px ${(b * 0.22 * strength).toFixed(2)}px color-mix(in srgb, ${color} ${(a * 100 * strength).toFixed(1)}%, transparent)`
  ).join(", ");
}
window.chartGlow = glow;

// ── Ring · donut with glow and soft track ────────────────
window.Ring = ({ value, max = 100, size = 120, stroke = 8, color = "var(--acc)", track, label = "", sub, dim = false }) => {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(value / max, 1));
  const uid = React.useMemo(() => "rg" + Math.random().toString(36).slice(2, 8), []);
  return (
    <div className="ring" style={{ width: size, height: size, position: "relative", flexShrink: 0 }}>
      <svg width={size} height={size} style={{ display: "block", overflow: "visible" }}>
        <defs>
          <linearGradient id={uid} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%"   stopColor={color} stopOpacity="1" />
            <stop offset="100%" stopColor={color} stopOpacity="0.72" />
          </linearGradient>
          <filter id={uid + "f"} x="-40%" y="-40%" width="180%" height="180%">
            <feDropShadow dx="0" dy="2" stdDeviation={stroke * 0.5} floodColor={color} floodOpacity="0.45" />
          </filter>
        </defs>
        <circle
          cx={size / 2} cy={size / 2} r={r}
          stroke={track || "var(--surface-2)"} strokeWidth={stroke} fill="none"
        />
        {pct > 0 && (
          <circle
            cx={size / 2} cy={size / 2} r={r}
            stroke={`url(#${uid})`} strokeWidth={stroke} fill="none"
            strokeDasharray={c} strokeDashoffset={c * (1 - pct)} strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            filter={dim ? undefined : `url(#${uid}f)`}
            style={{ transition: "stroke-dashoffset 0.55s cubic-bezier(0.22,0.68,0.35,1)" }}
          />
        )}
      </svg>
      <div className="ring-label" style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 1 }}>
        <span className="v num" style={{ fontSize: Math.max(13, size * 0.24), fontWeight: 500, letterSpacing: "-0.03em", lineHeight: 1 }}>{value}</span>
        {label && <span className="l" style={{ fontSize: Math.max(8.5, size * 0.085), color: "var(--fg-dim)", textTransform: "uppercase", letterSpacing: "0.06em", fontFamily: "var(--font-mono)" }}>{label}</span>}
        {sub && <span className="dim" style={{ fontSize: 9.5, marginTop: 1 }}>{sub}</span>}
      </div>
    </div>
  );
};

// ── Meter · lifted fill that overhangs its track, with colored glow ──
window.Meter = ({ value, max = 100, color = "var(--acc)", tall = false, flat = false }) => {
  const pct = Math.max(0, Math.min((value / max) * 100, 100));
  const trackH = tall ? 8 : 5;
  const fillH = flat ? trackH : trackH + 3;
  return (
    <div style={{ position: "relative", height: fillH, display: "flex", alignItems: "center" }}>
      <div style={{
        position: "absolute", left: 0, right: 0, height: trackH,
        background: "var(--surface-2)", borderRadius: 999,
      }} />
      {pct > 0 && (
        <div style={{
          position: "absolute", left: 0, height: fillH, width: pct + "%",
          background: color, borderRadius: 999,
          boxShadow: flat ? "none" : glow(color, 0.9),
          transition: "width 0.45s cubic-bezier(0.22,0.68,0.35,1)",
        }} />
      )}
    </div>
  );
};

// ── Sparkline · gradient area, rounded joins, end dot ────
window.Sparkline = ({ data, color = "currentColor", w = 100, h = 28, strokeWidth = 1.6, fill = true, dot = true }) => {
  if (!data || data.length < 2) return null;
  const min = Math.min(...data), max = Math.max(...data);
  const range = max - min || 1;
  const step = w / (data.length - 1);
  const pts = data.map((v, i) => [i * step, h - ((v - min) / range) * (h - 5) - 2.5]);
  const uid = React.useMemo(() => "sp" + Math.random().toString(36).slice(2, 8), []);
  // smooth path with mid-point quadratics
  let d = `M ${pts[0][0]} ${pts[0][1]}`;
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1], [x1, y1] = pts[i];
    const mx = (x0 + x1) / 2;
    d += ` Q ${mx} ${y0} ${mx} ${(y0 + y1) / 2} Q ${mx} ${y1} ${x1} ${y1}`;
  }
  const area = d + ` L ${w} ${h} L 0 ${h} Z`;
  const last = pts[pts.length - 1];
  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", height: h, overflow: "visible" }} preserveAspectRatio="none">
      <defs>
        <linearGradient id={uid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={color} stopOpacity="0.28" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {fill && <path d={area} fill={`url(#${uid})`} />}
      <path d={d} fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
      {dot && <circle cx={last[0]} cy={last[1]} r="2.2" fill={color} vectorEffect="non-scaling-stroke" />}
    </svg>
  );
};

// ── LineChart · smoothed, gradient fill, receding grid ───
window.LineChart = ({ series, h = 160, xLabels, color = "var(--acc)", showArea = true, range, yFmt }) => {
  const ss = (Array.isArray(series[0]) || typeof series[0] === "number") ? [{ data: series, color }] : series;
  const all = ss.flatMap(s => s.data).filter(v => typeof v === "number" && isFinite(v));
  if (!all.length) return null;
  const [min, max] = range || [Math.min(...all) * 0.92, Math.max(...all) * 1.06];
  const span = (max - min) || 1;
  const w = 600;
  const pad = { l: 34, r: 10, t: 10, b: xLabels ? 20 : 8 };
  const iw = w - pad.l - pad.r, ih = h - pad.t - pad.b;
  const toX = (i, n) => pad.l + (n <= 1 ? 0 : (i / (n - 1)) * iw);
  const toY = v => pad.t + ih - ((v - min) / span) * ih;
  const uid = React.useMemo(() => "lc" + Math.random().toString(36).slice(2, 8), []);

  const smooth = (pts) => {
    let d = `M ${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
    for (let i = 1; i < pts.length; i++) {
      const [x0, y0] = pts[i - 1], [x1, y1] = pts[i];
      const mx = (x0 + x1) / 2;
      d += ` Q ${mx.toFixed(1)} ${y0.toFixed(1)} ${mx.toFixed(1)} ${((y0 + y1) / 2).toFixed(1)} Q ${mx.toFixed(1)} ${y1.toFixed(1)} ${x1.toFixed(1)} ${y1.toFixed(1)}`;
    }
    return d;
  };

  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", height: h, overflow: "visible" }} preserveAspectRatio="none">
      <defs>
        {ss.map((s, i) => (
          <linearGradient key={i} id={`${uid}-${i}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor={s.color || color} stopOpacity="0.22" />
            <stop offset="100%" stopColor={s.color || color} stopOpacity="0" />
          </linearGradient>
        ))}
      </defs>
      {[0, 0.25, 0.5, 0.75, 1].map((t, i) => (
        <g key={i}>
          <line x1={pad.l} x2={w - pad.r} y1={pad.t + t * ih} y2={pad.t + t * ih}
            stroke="var(--border)" strokeWidth="1" strokeOpacity={i === 4 ? 1 : 0.55} />
          <text x={pad.l - 7} y={pad.t + t * ih + 3.2} textAnchor="end" fontSize="9"
            fill="var(--fg-dim)" fontFamily="var(--font-mono)">
            {yFmt ? yFmt(max - t * span) : Math.round(max - t * span)}
          </text>
        </g>
      ))}
      {ss.map((s, si) => {
        const pts = s.data.map((v, i) => [toX(i, s.data.length), toY(v)]);
        const d = smooth(pts);
        const dashed = s.dashed || si > 0 && ss.length > 1 && (s.color === "var(--fg-dim)");
        return (
          <g key={si}>
            {showArea && si === 0 && ss.length > 0 && (
              <path d={d + ` L ${pts[pts.length - 1][0].toFixed(1)} ${pad.t + ih} L ${pts[0][0].toFixed(1)} ${pad.t + ih} Z`} fill={`url(#${uid}-${si})`} />
            )}
            <path d={d} fill="none" stroke={s.color || color} strokeWidth={si === 0 ? 1.8 : 1.2}
              strokeLinecap="round" strokeLinejoin="round"
              strokeDasharray={dashed ? "3 3" : undefined}
              vectorEffect="non-scaling-stroke" />
            {si === 0 && pts.length <= 16 && pts.map((p, i) => (
              <circle key={i} cx={p[0]} cy={p[1]} r="2" fill="var(--bg)" stroke={s.color || color} strokeWidth="1.4" vectorEffect="non-scaling-stroke" />
            ))}
          </g>
        );
      })}
      {xLabels && xLabels.map((l, i) => l ? (
        <text key={i} x={toX(i, xLabels.length)} y={h - 4} textAnchor="middle" fontSize="9"
          fill="var(--fg-dim)" fontFamily="var(--font-mono)">{l}</text>
      ) : null)}
    </svg>
  );
};

// ── New: IndicatorCard · ring + value + trend, reference layout ──
window.IndicatorCard = ({ pct, value, label, sub, color = "var(--acc)", delta, deltaDir, size = 76 }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 15 }}>
    <window.Ring value={pct} max={100} size={size} stroke={7} color={color} label="" />
    <div style={{ flex: 1, minWidth: 0 }}>
      <div className="num" style={{ fontSize: 20, fontWeight: 500, letterSpacing: "-0.02em", lineHeight: 1.15, marginBottom: 2 }}>{value}</div>
      <div style={{ fontSize: 11.5, color: "var(--fg-muted)", marginBottom: delta ? 5 : 0 }}>{label}</div>
      {delta && (
        <div style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 7px", borderRadius: 999,
          background: `color-mix(in srgb, ${deltaDir === "down" ? "var(--neg)" : "var(--pos)"} 12%, transparent)`,
          border: `1px solid color-mix(in srgb, ${deltaDir === "down" ? "var(--neg)" : "var(--pos)"} 26%, transparent)` }}>
          <span className="num" style={{ fontSize: 10, color: deltaDir === "down" ? "var(--neg)" : "var(--pos)" }}>
            {deltaDir === "down" ? "↓" : "↑"} {delta}
          </span>
        </div>
      )}
      {sub && <div className="dim" style={{ fontSize: 10.5, marginTop: 4 }}>{sub}</div>}
    </div>
  </div>
);

// ── New: DonutBreakdown · multi-segment ring with legend ──
window.DonutBreakdown = ({ segments, size = 132, stroke = 14, centerValue, centerLabel }) => {
  const total = segments.reduce((s, x) => s + x.value, 0) || 1;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  let offset = 0;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
      <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
        <svg width={size} height={size} style={{ display: "block", overflow: "visible" }}>
          <circle cx={size / 2} cy={size / 2} r={r} stroke="var(--surface-2)" strokeWidth={stroke} fill="none" />
          {segments.map((s, i) => {
            const frac = s.value / total;
            const dash = `${(c * frac - 2).toFixed(2)} ${(c * (1 - frac) + 2).toFixed(2)}`;
            const el = (
              <circle key={i}
                cx={size / 2} cy={size / 2} r={r}
                stroke={s.color} strokeWidth={stroke} fill="none"
                strokeDasharray={dash} strokeDashoffset={-c * offset}
                strokeLinecap="butt"
                transform={`rotate(-90 ${size / 2} ${size / 2})`}
                style={{ transition: "stroke-dashoffset 0.5s ease" }}
              />
            );
            offset += frac;
            return el;
          })}
        </svg>
        {centerValue != null && (
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <span className="num" style={{ fontSize: size * 0.19, fontWeight: 500, letterSpacing: "-0.025em", lineHeight: 1 }}>{centerValue}</span>
            {centerLabel && <span className="dim" style={{ fontSize: 9.5, marginTop: 3, fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{centerLabel}</span>}
          </div>
        )}
      </div>
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 8 }}>
        {segments.map((s, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <span style={{ width: 9, height: 9, borderRadius: 3, background: s.color, flexShrink: 0 }} />
            <span style={{ fontSize: 11.5, color: "var(--fg-muted)", flex: 1, minWidth: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.label}</span>
            <span className="num" style={{ fontSize: 11.5, fontWeight: 500 }}>{s.display ?? s.value}</span>
            <span className="num dim" style={{ fontSize: 10, width: 34, textAlign: "right" }}>{Math.round(s.value / total * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── New: BarSeries · gradient columns with baseline ──────
window.BarSeries = ({ data, labels, h = 96, color = "var(--acc)", highlight, fmt }) => {
  const max = Math.max(...data, 1);
  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${data.length}, 1fr)`, gap: 5, alignItems: "end", height: h }}>
        {data.map((v, i) => {
          const on = highlight == null || highlight === i;
          return (
            <div key={i} style={{ height: "100%", display: "flex", alignItems: "flex-end" }}>
              <div style={{
                width: "100%",
                height: Math.max(2, (v / max) * 100) + "%",
                background: on ? `linear-gradient(180deg, ${color}, color-mix(in srgb, ${color} 55%, transparent))` : "var(--surface-2)",
                borderRadius: "4px 4px 2px 2px",
                boxShadow: on ? glow(color, 0.55) : "none",
                transition: "height 0.4s cubic-bezier(0.22,0.68,0.35,1)",
              }} title={fmt ? fmt(v) : String(v)} />
            </div>
          );
        })}
      </div>
      {labels && (
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${data.length}, 1fr)`, gap: 5, marginTop: 7 }}>
          {labels.map((l, i) => (
            <span key={i} className="num" style={{ fontSize: 9, color: highlight === i ? "var(--fg)" : "var(--fg-dim)", textAlign: "center" }}>{l}</span>
          ))}
        </div>
      )}
    </div>
  );
};

// ── New: StatTile · KPI with sparkline underlay ──────────
window.StatTile = ({ label, value, unit, delta, deltaDir, spark, color = "var(--acc)" }) => (
  <div style={{
    position: "relative", overflow: "hidden",
    padding: 14, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8,
  }}>
    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: color, opacity: 0.55 }} />
    <div className="eyebrow" style={{ marginBottom: 6 }}>{label}</div>
    <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: delta ? 6 : 8 }}>
      <span className="num" style={{ fontSize: 22, fontWeight: 500, letterSpacing: "-0.025em", lineHeight: 1 }}>{value}</span>
      {unit && <span className="dim" style={{ fontSize: 10.5 }}>{unit}</span>}
    </div>
    {delta && (
      <div className="num" style={{ fontSize: 10.5, color: deltaDir === "down" ? "var(--neg)" : deltaDir === "up" ? "var(--pos)" : "var(--fg-muted)", marginBottom: 8 }}>
        {deltaDir === "down" ? "↓" : deltaDir === "up" ? "↑" : ""} {delta}
      </div>
    )}
    {spark && (
      <div style={{ marginLeft: -14, marginRight: -14, marginBottom: -14, opacity: 0.9 }}>
        <window.Sparkline data={spark} color={color} h={34} dot={false} />
      </div>
    )}
  </div>
);
