// features/dashboard/IntelligenceView.js
// Mirrors: src/features/dashboard/components/IntelligenceView.tsx
// Dashboard · Intelligence: Cross-Module Korrelationen ausführlich, Patterns, Alerts

window.Dashboard_IntelligenceView = function() {
  const corrs = [
    {a:'Tiefschlaf',   b:'Workout-Leistung', r:0.73, trend:'↑', color:'var(--brand-700)'},
    {a:'Protein >150g',b:'HRV-Anstieg',      r:0.61, trend:'↑', color:'var(--brand-600)'},
    {a:'Ashwagandha',  b:'Ruhepuls -3bpm',   r:0.58, trend:'↑', color:'var(--brand-600)'},
    {a:'Kaloriendefizit',b:'Schlafqualität', r:-0.42, trend:'↓', color:'var(--semantic-warning-text)'},
    {a:'Training-Volumen',b:'Hunger nächster Tag',r:0.51, trend:'↑', color:'var(--semantic-info-text)'},
  ];
  return `
    <div class="card">
      <div class="card-header"><div class="card-title">Stärkste Korrelationen</div><div class="badge badge-blue">letzte 30T</div></div>
      ${corrs.map(c=>`
        <div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--surface-border)">
          <div style="flex:1">
            <div style="font-size:var(--text-xs);font-weight:var(--fw-medium);color:var(--text-primary)">${c.a} → ${c.b}</div>
          </div>
          <div style="font-size:var(--text-xs);font-weight:var(--fw-bold);color:${c.color};min-width:40px;text-align:right">r=${c.r}</div>
          <div style="width:60px;height:6px;background:var(--surface-hover);border-radius:3px;overflow:hidden">
            <div style="height:100%;background:${c.color};border-radius:3px;width:${Math.abs(c.r)*100}%"></div>
          </div>
        </div>`).join('')}
    </div>
    <div class="card">
      <div class="card-header"><div class="card-title">Erkannte Muster</div></div>
      ${[
        {icon:'📅', pattern:'Montags niedrigste Energie', conf:'87%', detail:'Konsistent über 8 Wochen'},
        {icon:'🌙', pattern:'Spätes Essen stört Tiefschlaf', conf:'74%', detail:'Ab 21:00 Uhr messbar'},
        {icon:'💪', pattern:'Bestes Training nach 7h+ Schlaf', conf:'91%', detail:'Volumen +12% im Schnitt'},
      ].map(p=>`
        <div style="display:flex;gap:10px;padding:8px 0;border-bottom:1px solid var(--surface-border)">
          <span style="font-size:18px;flex-shrink:0">${p.icon}</span>
          <div style="flex:1">
            <div style="font-size:var(--text-xs);font-weight:var(--fw-medium);color:var(--text-primary)">${p.pattern}</div>
            <div style="font-size:var(--text-micro);color:var(--text-muted)">${p.detail}</div>
          </div>
          <div class="badge badge-green">${p.conf}</div>
        </div>`).join('')}
    </div>
    <div class="card">
      <div class="card-header"><div class="card-title">Aktive Alerts</div><div class="badge badge-orange">1 mittel</div></div>
      <div style="display:flex;gap:10px;padding:10px;background:rgba(234,179,8,.08);border-radius:var(--r-md);border:1px solid rgba(234,179,8,.2)">
        <span style="font-size:18px">⚠️</span>
        <div>
          <div style="font-size:var(--text-xs);font-weight:var(--fw-medium);color:var(--text-primary)">Vitamin D 3 Tage unter 62%</div>
          <div style="font-size:var(--text-micro);color:var(--text-muted);margin-top:2px">Empfehlung: Supplementierung oder mehr Sonnenlicht</div>
        </div>
      </div>
    </div>
  `;
};
