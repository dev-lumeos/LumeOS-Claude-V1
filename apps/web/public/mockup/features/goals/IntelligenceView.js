// features/goals/IntelligenceView.js
// Mirrors: src/features/goals/components/IntelligenceView.tsx
window.Goals_IntelligenceView = function() {
  return `
    <div class="card">
      <div class="card-header"><div class="card-title">Goal Alignment Score</div></div>
      <div style="display:flex;gap:12px;margin-bottom:14px">
        ${[
          {mod:'🍽️ Ernährung',  score:87, color:'var(--accent-nutrition)'},
          {mod:'🏋️ Training',   score:82, color:'var(--accent-training)'},
          {mod:'😴 Recovery',   score:78, color:'var(--accent-recovery)'},
          {mod:'💊 Supplements',score:94, color:'var(--accent-supplements)'},
        ].map(m=>`
          <div style="flex:1;text-align:center">
            <div style="font-size:20px;font-weight:var(--fw-bold);color:${m.color}">${m.score}</div>
            <div style="font-size:var(--text-micro);color:var(--text-muted)">${m.mod}</div>
          </div>`).join('')}
      </div>
      <div style="height:6px;background:var(--surface-hover);border-radius:3px;overflow:hidden">
        <div style="height:100%;background:linear-gradient(to right,var(--accent-nutrition),var(--brand-600));border-radius:3px;width:85%"></div>
      </div>
      <div style="font-size:var(--text-micro);color:var(--text-muted);margin-top:4px;text-align:right">Gesamt-Alignment: 85%</div>
    </div>
    <div class="card">
      <div class="card-header"><div class="card-title">Cross-Module Empfehlungen</div></div>
      ${[
        {icon:'💡', text:'Training-Volumen passt zur Gewichtsabnahme — weiter so'},
        {icon:'⚠️', text:'Kaloriendefizit könnte Muskelaufbau-Ziel beeinflussen'},
        {icon:'✅', text:'Supplement-Stack optimal für Recovery und Performance'},
      ].map(r=>`
        <div style="display:flex;gap:10px;padding:8px 0;border-bottom:1px solid var(--surface-border)">
          <span style="font-size:16px;flex-shrink:0">${r.icon}</span>
          <span style="font-size:var(--text-xs);color:var(--text-secondary);line-height:1.5">${r.text}</span>
        </div>`).join('')}
    </div>
  `;
};
