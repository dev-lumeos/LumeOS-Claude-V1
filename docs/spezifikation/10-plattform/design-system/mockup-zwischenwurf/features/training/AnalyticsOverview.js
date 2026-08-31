// features/training/AnalyticsOverview.js
// Training → Analytik Übersicht: Stats-Grid, Achievement Badges, 12W Volume Trend, Streak Calendar

window.Training_AnalyticsOverview = function() {
  const stats = [
    {icon:'🏋️',val:'47',  lbl:'Workouts gesamt',delta:'↑ +17 vs. VJ'},
    {icon:'⚖️',val:'198k', lbl:'kg Volumen April', delta:'↑ +28% vs. März'},
    {icon:'🔥',val:'12',   lbl:'Wochen-Streak',    delta:'↑ Rekord: 14W'},
    {icon:'🏆',val:'8',    lbl:'PRs diesen Monat', delta:'↑ +3 vs. letzten'},
  ];
  const badges = [
    {icon:'🔥',name:'Week Warrior',   desc:'7-Tage Streak',    tier:'silver',earned:true},
    {icon:'💪',name:'Century Club',   desc:'100kg Satz',        tier:'bronze',earned:true},
    {icon:'🏗️',name:'Iron Mountain',  desc:'100.000 kg total',  tier:'silver',earned:true},
    {icon:'📅',name:'Dedicated',      desc:'50 Workouts',        tier:'silver',earned:true},
    {icon:'🔥',name:'Unstoppable',    desc:'14-Tage Streak',    tier:'gold',  earned:false},
    {icon:'⭐',name:'Perfect Machine',desc:'4 perfekte Wochen', tier:'gold',  earned:false},
    {icon:'🏆',name:'Centurion',      desc:'100 Workouts',      tier:'gold',  earned:false},
    {icon:'🌋',name:'Half Million',   desc:'500.000 kg total',  tier:'gold',  earned:false},
  ];
  const tierColor = {bronze:'#92400e',silver:'#64748b',gold:'#d97706',diamond:'#0ea5e9'};
  const weeklyVol = [52,65,71,78,76,80,85,78,82,88,82,85];
  // 12-week consistency (Mon-Sun × 12 weeks)
  const consistency = Array.from({length:12},(_,w)=>Array.from({length:7},(_,d)=>{
    const active = w*7+d < 79 ? (Math.random()>.35?1:0) : 0;
    return active ? Math.ceil(Math.random()*3) : 0;
  }));
  const heatCols = ['#1e293b','#166534','#16a34a','#22c55e'];

  return `
    <div style="display:flex;flex-direction:column;gap:12px">

      <div class="card-grid">
        ${stats.map(s=>`
          <div class="stat-card">
            <div style="font-size:18px;margin-bottom:4px">${s.icon}</div>
            <div class="stat-val" style="font-size:20px">${s.val}</div>
            <div class="stat-lbl">${s.lbl}</div>
            <div class="stat-delta delta-up">${s.delta}</div>
          </div>`).join('')}
      </div>

      <div style="background:#0f172a;border-radius:var(--r-lg);padding:14px">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
          <div style="font-size:var(--text-xs);font-weight:var(--fw-bold);color:#94a3b8;text-transform:uppercase;letter-spacing:.06em">Konsistenz — 12 Wochen</div>
          <div style="display:flex;align-items:center;gap:4px;background:rgba(249,115,22,.2);border-radius:var(--r-full);padding:3px 8px">
            <span style="font-size:12px">🔥</span><span style="font-size:var(--text-micro);font-weight:600;color:#fb923c">12W Streak</span>
          </div>
        </div>
        <div style="display:grid;grid-template-columns:20px repeat(12,1fr);gap:2px">
          <div></div>
          ${Array.from({length:12},(_,i)=>`<div style="font-size:9px;color:#475569;text-align:center">KW${6+i}</div>`).join('')}
          ${['Mo','Di','Mi','Do','Fr','Sa','So'].map((d,di)=>`
            <div style="font-size:9px;color:#475569;display:flex;align-items:center">${di%2===0?d:''}</div>
            ${consistency.map(w=>`<div style="aspect-ratio:1;border-radius:2px;background:${heatCols[w[di]]}"></div>`).join('')}
          `).join('')}
        </div>
        <div style="display:flex;align-items:center;gap:4px;margin-top:6px;justify-content:flex-end">
          <span style="font-size:9px;color:#475569">Weniger</span>
          ${heatCols.map(c=>`<div style="width:9px;height:9px;border-radius:2px;background:${c}"></div>`).join('')}
          <span style="font-size:9px;color:#475569">Mehr</span>
        </div>
      </div>

      <div class="card">
        <div class="card-header"><div class="card-title">🏅 Achievements</div><div style="font-size:var(--text-micro);color:var(--text-muted)">4/20 freigeschaltet</div></div>
        <div class="progress-track" style="margin-bottom:10px"><div class="progress-fill" style="width:20%;background:var(--accent-training)"></div></div>
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px">
          ${badges.map(b=>`
            <div style="text-align:center;opacity:${b.earned?1:.3}">
              <div style="font-size:22px">${b.icon}</div>
              <div style="font-size:8px;font-weight:${b.earned?600:400};color:${b.earned?'var(--text-primary)':'var(--text-muted)'};line-height:1.2;margin-top:2px">${b.name}</div>
              <div style="font-size:7px;color:${tierColor[b.tier]};font-weight:700;text-transform:uppercase">${b.tier}</div>
            </div>`).join('')}
        </div>
      </div>

      <div class="card">
        <div class="card-header"><div class="card-title">📈 Wöchentliches Volumen (12W)</div></div>
        <div style="display:flex;align-items:flex-end;height:52px;gap:3px;margin-bottom:6px">
          ${weeklyVol.map((v,i)=>`
            <div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:1px">
              <div style="width:100%;background:${i===11?'var(--accent-training)':v>80?'#fed7aa':'#ffedd5'};border-radius:2px 2px 0 0;height:${(v/88)*46}px"></div>
              ${i%4===0?`<div style="font-size:8px;color:var(--text-muted)">KW${6+i}</div>`:''}
            </div>`).join('')}
        </div>
        <div style="display:flex;justify-content:space-between;font-size:var(--text-micro);color:var(--text-muted)">
          <span>Ø 78k kg/Woche</span><span style="color:var(--accent-training)">Trend: ↑ +9%</span>
        </div>
      </div>
    </div>
  `;
};
