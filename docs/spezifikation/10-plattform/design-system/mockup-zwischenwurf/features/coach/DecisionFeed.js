// features/coach/DecisionFeed.js
// Mirrors: src/features/coach/components/DecisionFeed.tsx
// AI Coach · Entscheidungen: Feed von AI-Entscheidungen mit Datum, Aktion, Status

window.Coach_DecisionFeed = function() {
  const decisions = [
    {time:'Heute 06:42', icon:'🏋️', action:'Training-Volumen um 20% reduziert', reason:'HRV 58ms — unter Baseline von 62ms', status:'angenommen', badge:'badge-green'},
    {time:'Heute 06:42', icon:'🍽️', action:'Proteinziel auf 175g erhöht',         reason:'Gestern 8g unter Plan — Ausgleich empfohlen', status:'angenommen', badge:'badge-green'},
    {time:'Gestern 20:15',icon:'😴', action:'Schlafzeit-Empfehlung: 22:30 Uhr',  reason:'Cortisol-Pattern + nächster Push Day morgen', status:'angenommen', badge:'badge-green'},
    {time:'26. Apr',     icon:'💊', action:'Magnesium-Dosis auf 400mg erhöht',   reason:'3 Tage schlechte Schlafqualität erkannt', status:'angenommen', badge:'badge-green'},
    {time:'25. Apr',     icon:'🏃', action:'Rest Day empfohlen',                 reason:'Recovery Score < 70 für 2 Tage', status:'ignoriert',  badge:'badge-orange'},
    {time:'24. Apr',     icon:'🎯', action:'Kalorienziel temporär auf 2.200',    reason:'Trainingsvolumen-Peak diese Woche', status:'abgelehnt',  badge:'badge-red'},
  ];
  return `
    <div class="card">
      <div class="card-header"><div class="card-title">AI-Entscheidungen</div><div class="badge badge-blue">letzte 7 Tage</div></div>
      ${decisions.map(d=>`
        <div style="display:flex;gap:10px;padding:10px 0;border-bottom:1px solid var(--surface-border)">
          <span style="font-size:18px;flex-shrink:0">${d.icon}</span>
          <div style="flex:1">
            <div style="font-size:var(--text-xs);font-weight:var(--fw-medium);color:var(--text-primary)">${d.action}</div>
            <div style="font-size:var(--text-micro);color:var(--text-muted);margin-top:2px">${d.reason}</div>
            <div style="font-size:var(--text-micro);color:var(--text-muted);margin-top:2px">${d.time}</div>
          </div>
          <div class="badge ${d.badge}" style="align-self:flex-start;white-space:nowrap">${d.status}</div>
        </div>`).join('')}
    </div>
  `;
};
