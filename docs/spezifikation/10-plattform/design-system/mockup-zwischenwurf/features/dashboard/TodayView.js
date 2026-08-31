// features/dashboard/TodayView.js
// Dashboard · Heute: MorningBriefing, HealthMomentum, PredictiveInsights, QuickWins, ActionPlan

window.Dashboard_TodayView = function() {
  const momentum = [
    {day:'Mo',score:82},{day:'Di',score:79},{day:'Mi',score:84},
    {day:'Do',score:86},{day:'Fr',score:81},{day:'Sa',score:83},{day:'So',score:87},
  ];
  return `
    <div style="background:linear-gradient(135deg,#1a1a2e,#16213e);border-radius:var(--r-lg);padding:18px 20px;color:#fff">
      <div style="font-size:var(--text-micro);color:rgba(255,255,255,.5);text-transform:uppercase;letter-spacing:.08em;margin-bottom:4px">Montag, 27. April 2026 · Koh Samui 🌤 28°C</div>
      <div style="font-size:var(--text-xl);font-weight:var(--fw-bold);margin-bottom:10px">Guten Morgen, Tom! 👋</div>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        ${[
          {icon:'🧠',val:'87/100',lbl:'Health Score'},
          {icon:'🔥',val:'12 Tage',lbl:'Streak'},
          {icon:'😴',val:'Gut · 78',lbl:'Recovery'},
          {icon:'🏋️',val:'Push Day',lbl:'Heute geplant'},
        ].map(k=>`
          <div style="background:rgba(255,255,255,.12);border-radius:var(--r-md);padding:6px 10px;border:1px solid rgba(255,255,255,.08)">
            <div style="font-size:var(--text-micro);color:rgba(255,255,255,.55)">${k.icon} ${k.lbl}</div>
            <div style="font-size:var(--text-xs);font-weight:var(--fw-semibold);color:#fff">${k.val}</div>
          </div>`).join('')}
      </div>
    </div>

    <div class="card">
      <div class="card-header"><div class="card-title">⚡ Health Momentum (7 Tage)</div><div class="badge badge-green">↑ Trend</div></div>
      <div style="display:flex;gap:4px;align-items:flex-end;height:52px;margin-bottom:6px">
        ${momentum.map((m,i)=>`
          <div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:2px">
            <div style="font-size:9px;color:var(--text-muted)">${m.score}</div>
            <div style="width:100%;border-radius:2px 2px 0 0;background:${i===6?'var(--brand-600)':m.score>=85?'var(--brand-300)':'var(--brand-100)'};height:${((m.score-70)/30)*36}px"></div>
            <div style="font-size:var(--text-micro);color:var(--text-muted)">${m.day}</div>
          </div>`).join('')}
      </div>
      <div style="display:flex;justify-content:space-between;font-size:var(--text-micro);color:var(--text-muted)">
        <span>Ø 83.1 diese Woche</span>
        <span style="color:var(--brand-700);font-weight:var(--fw-semibold)">↑ +4.1 vs. Vorwoche</span>
      </div>
    </div>

    <div class="card">
      <div class="card-header"><div class="card-title">🔮 Predictive Insights</div><div class="badge badge-blue">KI-Prognose</div></div>
      ${[
        {icon:'💪',title:'Starkes Workout wahrscheinlich',detail:'Recovery 78 + Tiefschlaf 1h42 → +12% Volumen erwartet vs. Ø'},
        {icon:'🍽️',title:'Protein-Fenster optimal nutzen',detail:'Pre-Workout 15:30 Uhr: 30-40g Protein + schnelle KH empfohlen'},
        {icon:'😴',title:'Früh schlafen heute Abend',detail:'Morgen Leg Day — 7.5h+ Schlaf für maximale Muskelregeneration'},
      ].map(p=>`
        <div style="display:flex;gap:10px;padding:9px 0;border-bottom:1px solid var(--surface-border)">
          <span style="font-size:18px;flex-shrink:0">${p.icon}</span>
          <div>
            <div style="font-size:var(--text-xs);font-weight:var(--fw-semibold);color:var(--text-primary)">${p.title}</div>
            <div style="font-size:var(--text-micro);color:var(--text-muted);margin-top:2px;line-height:1.4">${p.detail}</div>
          </div>
        </div>`).join('')}
    </div>

    <div class="card">
      <div class="card-header"><div class="card-title">🏆 Quick Wins — höchster Impact heute</div></div>
      ${[
        {rank:'1',icon:'🏋️',action:'Push Day um 17:00 Uhr durchziehen',impact:'+15 Pkt',done:false},
        {rank:'2',icon:'🥗',action:'Mittagessen jetzt loggen',impact:'+8 Pkt',done:false},
        {rank:'3',icon:'💊',action:'Abend-Supplements nehmen (Mg + Ashwa)',impact:'+5 Pkt',done:false},
      ].map(w=>`
        <div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--surface-border)">
          <div style="width:22px;height:22px;border-radius:var(--r-full);background:var(--brand-600);display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:var(--fw-bold);color:#fff;flex-shrink:0">${w.rank}</div>
          <span style="font-size:16px;flex-shrink:0">${w.icon}</span>
          <div style="flex:1;font-size:var(--text-xs);color:var(--text-primary)">${w.action}</div>
          <div style="font-size:var(--text-micro);font-weight:var(--fw-bold);color:var(--brand-700);white-space:nowrap">${w.impact}</div>
        </div>`).join('')}
    </div>

    <div class="card-grid-3">
      ${[
        {mod:'nutrition', icon:'🍽️',val:'87%', lbl:'Ernährung'},
        {mod:'training',  icon:'🏋️',val:'82%', lbl:'Training'},
        {mod:'recovery',  icon:'😴',val:'78',  lbl:'Recovery'},
        {mod:'goals',     icon:'🎯',val:'68%', lbl:'Ziele'},
        {mod:'supplements',icon:'💊',val:'4/6',lbl:'Suppl.'},
        {mod:'medical',   icon:'🩺',val:'gut', lbl:'Medical'},
      ].map(m=>`
        <div class="stat-card" onclick="switchModule('${m.mod}')" style="cursor:pointer;text-align:center;padding:10px 6px">
          <div style="font-size:16px;margin-bottom:3px">${m.icon}</div>
          <div class="stat-val" style="font-size:15px">${m.val}</div>
          <div class="stat-lbl">${m.lbl}</div>
        </div>`).join('')}
    </div>

    <div class="card">
      <div class="card-header"><div class="card-title">Heute's Action Plan</div><div class="badge badge-blue">4 Tasks</div></div>
      ${[
        {done:true, text:'Frühstück geloggt ✓'},
        {done:true, text:'Morgen-Supplements genommen ✓'},
        {done:false,text:'Push Day Workout — 17:00 Uhr'},
        {done:false,text:'Abendessen eintragen'},
      ].map(t=>`
        <div class="data-row">
          <div class="data-label" style="${t.done?'text-decoration:line-through;color:var(--text-muted)':''}">${t.text}</div>
          ${t.done?'<span style="color:var(--brand-600)">✓</span>':'<div style="width:14px;height:14px;border-radius:50%;border:2px solid var(--surface-border)"></div>'}
        </div>`).join('')}
    </div>
  `;
};
