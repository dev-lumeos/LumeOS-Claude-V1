// features/training/ScheduleView.js
// Training → Wochenplan: Aktiver Plan, 7-Tage Grid, Sequential Preview, Nächste 4 Wochen

window.Training_ScheduleView = function() {
  const days = [
    {d:'Mo',r:'Push Day A', color:'var(--accent-training)',today:true},
    {d:'Di',r:'Pull Day B', color:'var(--accent-coach)'},
    {d:'Mi',r:'Legs Day C', color:'var(--accent-goals)'},
    {d:'Do',r:'Rest',       color:'var(--text-muted)',rest:true},
    {d:'Fr',r:'Push Day B', color:'var(--accent-training)'},
    {d:'Sa',r:'Cardio',     color:'var(--accent-supplements)'},
    {d:'So',r:'Rest',       color:'var(--text-muted)',rest:true},
  ];
  const coming4w = [
    {week:'KW 17',dates:'28. Apr – 4. Mai', days:['Push','Pull','Legs','Rest','Push','Cardio','Rest'],done:0,planned:7},
    {week:'KW 18',dates:'5. Mai – 11. Mai',  days:['Pull','Legs','Rest','Push','Pull','Rest','Legs'],done:0,planned:6},
    {week:'KW 19',dates:'12. Mai – 18. Mai', days:['Push','Pull','Legs','Rest','Push','Cardio','Rest'],done:0,planned:7},
    {week:'KW 20',dates:'19. Mai – 25. Mai', days:['DELOAD','DELOAD','DELOAD','Rest','DELOAD','DELOAD','Rest'],done:0,planned:5,deload:true},
  ];
  const typeColor = (r) => r==='Push'?'var(--accent-training)':r==='Pull'?'var(--accent-coach)':r==='Legs'?'var(--accent-goals)':r==='Cardio'?'var(--accent-supplements)':r==='DELOAD'?'#3b82f6':'var(--text-muted)';

  return `
    <div style="display:flex;flex-direction:column;gap:12px">

      <div class="card" style="background:linear-gradient(135deg,var(--accent-training),#ef4444);color:#fff">
        <div style="font-size:var(--text-micro);color:rgba(255,255,255,.65);text-transform:uppercase;margin-bottom:4px">Nächstes geplantes Workout</div>
        <div style="font-size:var(--text-xl);font-weight:var(--fw-bold);margin-bottom:2px">Push Day A — Montag 17:00</div>
        <div style="font-size:var(--text-xs);color:rgba(255,255,255,.8)">Bankdrücken · Schulter · Trizeps · ~52min · 18 Sätze</div>
        <div style="margin-top:10px;display:flex;gap:8px;align-items:center">
          <div style="background:rgba(255,255,255,.2);border-radius:var(--r-sm);padding:4px 10px;font-size:var(--text-xs);font-weight:var(--fw-semibold);cursor:pointer">▶ Starten</div>
          <div style="background:rgba(255,255,255,.15);border-radius:var(--r-sm);padding:4px 10px;font-size:var(--text-xs);cursor:pointer">Überspringen</div>
          <div style="margin-left:auto;font-size:var(--text-micro);opacity:.7">Streak: 🔥 12 Tage</div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <div class="card-title">Aktiver Plan — PPL Split</div>
          <div style="display:flex;gap:4px">
            <div style="font-size:var(--text-micro);padding:3px 8px;border-radius:var(--r-sm);background:var(--surface-hover);cursor:pointer">Bearbeiten</div>
            <div style="font-size:var(--text-micro);padding:3px 8px;border-radius:var(--r-sm);background:var(--accent-training);color:#fff;cursor:pointer">+ Plan</div>
          </div>
        </div>
        <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:3px;margin-bottom:10px">
          ${days.map(d=>`
            <div style="text-align:center">
              <div style="font-size:var(--text-micro);color:var(--text-muted);margin-bottom:3px">${d.d}</div>
              <div style="border-radius:var(--r-sm);padding:8px 2px;background:${d.today?d.color+'20':d.rest?'var(--surface-hover)':'var(--surface-card-alt)'};border:${d.today?`2px solid ${d.color}`:`1px solid var(--surface-border)`};cursor:pointer">
                <div style="font-size:var(--text-micro);font-weight:var(--fw-semibold);color:${d.today?d.color:'var(--text-secondary)'};line-height:1.2">${d.r.split(' ').slice(0,2).join(' ')}</div>
                ${d.today?`<div style="font-size:9px;color:${d.color};font-weight:700">Heute</div>`:''}
              </div>
            </div>`).join('')}
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          ${['Push=var(--accent-training)','Pull=var(--accent-coach)','Legs=var(--accent-goals)','Cardio=var(--accent-supplements)'].map(e=>{const[l,c]=e.split('=');return`<div style="display:flex;align-items:center;gap:4px;font-size:var(--text-micro);color:var(--text-secondary)"><div style="width:8px;height:8px;border-radius:50%;background:${c}"></div>${l}</div>`}).join('')}
        </div>
      </div>

      <div class="card">
        <div class="card-header"><div class="card-title">Nächste 4 Wochen Vorschau</div><div class="badge badge-blue">Periodisierung</div></div>
        ${coming4w.map(w=>`
          <div style="padding:8px 0;border-bottom:1px solid var(--surface-border)">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:5px">
              <div>
                <span style="font-size:var(--text-xs);font-weight:var(--fw-semibold);color:var(--text-primary)">${w.week}</span>
                <span style="font-size:var(--text-micro);color:var(--text-muted);margin-left:6px">${w.dates}</span>
                ${w.deload?`<span class="badge badge-blue" style="margin-left:6px">Deload</span>`:''}
              </div>
              <span style="font-size:var(--text-micro);color:var(--text-muted)">${w.planned} Sessions</span>
            </div>
            <div style="display:flex;gap:3px">
              ${w.days.map(d=>`
                <div style="flex:1;height:20px;border-radius:2px;background:${d==='Rest'?'var(--surface-hover)':typeColor(d)+'30'};display:flex;align-items:center;justify-content:center">
                  <span style="font-size:8px;font-weight:600;color:${typeColor(d)}">${d==='Rest'?'R':d==='DELOAD'?'D':d.charAt(0)}</span>
                </div>`).join('')}
            </div>
          </div>`).join('')}
      </div>
    </div>
  `;
};
