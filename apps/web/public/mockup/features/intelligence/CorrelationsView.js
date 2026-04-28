// features/intelligence/CorrelationsView.js
// Mirrors: src/features/intelligence/components/CorrelationsView.tsx
window.Intelligence_CorrelationsView = function() {
  const corrs = [
    {a:'Tiefschlaf >1.5h',    b:'Workout-Leistung',  r:0.73, days:30, dir:'pos'},
    {a:'Protein >150g',       b:'HRV nächster Tag',   r:0.61, days:30, dir:'pos'},
    {a:'Ashwagandha abends',  b:'Ruhepuls -3bpm',     r:0.58, days:45, dir:'pos'},
    {a:'Training-Volumen',    b:'Hunger nächster Tag',r:0.51, days:30, dir:'pos'},
    {a:'Kaloriendefizit >500',b:'Schlafqualität',     r:-0.42,days:14, dir:'neg'},
    {a:'Spätes Essen (>21h)', b:'Tiefschlaf',         r:-0.55,days:21, dir:'neg'},
    {a:'Kreatin',             b:'Kraft-Output',       r:0.44, days:60, dir:'pos'},
    {a:'HRV über Baseline',   b:'RPE bei gleichem Gewicht',r:0.67,days:30,dir:'pos'},
  ];
  return `
    <div class="card">
      <div class="card-header"><div class="card-title">Erkannte Korrelationen</div><div class="badge badge-blue">${corrs.length} gefunden</div></div>
      ${corrs.map(c=>`
        <div style="display:flex;align-items:center;gap:10px;padding:9px 0;border-bottom:1px solid var(--surface-border)">
          <div style="flex:1">
            <div style="font-size:var(--text-xs);font-weight:var(--fw-medium);color:var(--text-primary)">${c.a} → ${c.b}</div>
            <div style="font-size:var(--text-micro);color:var(--text-muted)">Zeitraum: ${c.days} Tage</div>
          </div>
          <div style="display:flex;flex-direction:column;align-items:flex-end;gap:3px">
            <div style="font-size:var(--text-xs);font-weight:var(--fw-bold);color:${c.dir==='pos'?'var(--brand-700)':'var(--semantic-danger-text)'}">r=${c.r}</div>
            <div style="width:48px;height:4px;background:var(--surface-hover);border-radius:2px;overflow:hidden">
              <div style="height:100%;background:${c.dir==='pos'?'var(--brand-500)':'#f87171'};width:${Math.abs(c.r)*100}%"></div>
            </div>
          </div>
        </div>`).join('')}
    </div>
  `;
};
