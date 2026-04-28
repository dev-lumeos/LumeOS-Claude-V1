// features/nutrition/HeatmapView.js
// Mirrors: src/features/nutrition/components/HeatmapView.tsx
// Ernährung · Heatmap: 7x5 Kalender-Grid mit Farb-Intensität für Kalorien-Coverage

window.Nutrition_HeatmapView = function() {
  const days = ['Mo','Di','Mi','Do','Fr','Sa','So'];
  const weeks = [
    [72,85,91,88,76,95,82],
    [88,92,78,96,83,70,89],
    [91,87,94,82,88,93,76],
    [84,96,89,91,85,78,92],
    [88,82,95,87,90,null,null],
  ];
  const getColor = (pct) => {
    if (!pct) return 'var(--surface-hover)';
    if (pct >= 95) return 'var(--brand-700)';
    if (pct >= 85) return 'var(--brand-500)';
    if (pct >= 75) return 'var(--brand-200)';
    return '#fca5a5';
  };

  return `
    <div class="card">
      <div class="card-header"><div class="card-title">Kalorien-Heatmap (April 2026)</div></div>
      <div style="display:grid;grid-template-columns:24px repeat(7,1fr);gap:4px;margin-bottom:8px">
        <div></div>
        ${days.map(d=>`<div style="font-size:var(--text-micro);color:var(--text-muted);text-align:center">${d}</div>`).join('')}
      </div>
      ${weeks.map((week, wi)=>`
        <div style="display:grid;grid-template-columns:24px repeat(7,1fr);gap:4px;margin-bottom:4px">
          <div style="font-size:var(--text-micro);color:var(--text-muted);display:flex;align-items:center">KW${16+wi}</div>
          ${week.map(pct=>`
            <div style="aspect-ratio:1;border-radius:4px;background:${getColor(pct)};display:flex;align-items:center;justify-content:center;cursor:default"
              title="${pct?pct+'%':'—'}">
              ${pct?`<span style="font-size:9px;color:${pct>=85?'white':'var(--text-secondary)'};font-weight:600">${pct}</span>`:''}
            </div>`).join('')}
        </div>`).join('')}
      <div style="display:flex;gap:12px;margin-top:12px;flex-wrap:wrap">
        ${[
          {c:'var(--brand-700)',   l:'≥95% (optimal)'},
          {c:'var(--brand-500)',   l:'85-94%'},
          {c:'var(--brand-200)',   l:'75-84%'},
          {c:'#fca5a5',            l:'<75%'},
          {c:'var(--surface-hover)',l:'kein Eintrag'},
        ].map(l=>`
          <div style="display:flex;align-items:center;gap:4px;font-size:var(--text-micro);color:var(--text-secondary)">
            <div style="width:10px;height:10px;border-radius:2px;background:${l.c};border:1px solid var(--surface-border)"></div>${l.l}
          </div>`).join('')}
      </div>
    </div>
    <div class="card">
      <div class="card-header"><div class="card-title">Protein-Heatmap (April 2026)</div></div>
      <div style="display:grid;grid-template-columns:24px repeat(7,1fr);gap:4px;margin-bottom:8px">
        <div></div>
        ${days.map(d=>`<div style="font-size:var(--text-micro);color:var(--text-muted);text-align:center">${d}</div>`).join('')}
      </div>
      ${weeks.map((week, wi)=>`
        <div style="display:grid;grid-template-columns:24px repeat(7,1fr);gap:4px;margin-bottom:4px">
          <div style="font-size:var(--text-micro);color:var(--text-muted);display:flex;align-items:center">KW${16+wi}</div>
          ${week.map(pct=>{
            const pp = pct ? Math.round(pct * 0.95 + Math.random()*5) : null;
            const c = !pp?'var(--surface-hover)':pp>=90?'#1d4ed8':pp>=80?'#3b82f6':pp>=70?'#93c5fd':'#fca5a5';
            return `<div style="aspect-ratio:1;border-radius:4px;background:${c}"></div>`;
          }).join('')}
        </div>`).join('')}
    </div>
  `;
};
