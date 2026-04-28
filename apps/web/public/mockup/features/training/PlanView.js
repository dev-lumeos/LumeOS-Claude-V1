// features/training/PlanView.js — ENHANCED
// ScheduleView, Periodisierung, VolumeLandmarks (MEV/MAV/MRV), Nächstes Workout

window.Training_PlanView = function() {
  const plan = [
    {day:'Mo',full:'Montag',    date:'27. Apr',type:'Push Day',  focus:'Brust, Schultern, Trizeps',  status:'heute',   color:'var(--accent-training)'},
    {day:'Di',full:'Dienstag',  date:'28. Apr',type:'Pull Day',  focus:'Rücken, Bizeps, Rear Delt',  status:'geplant', color:'var(--accent-coach)'},
    {day:'Mi',full:'Mittwoch',  date:'29. Apr',type:'Legs Day',  focus:'Quad, Hamstrings, Gesäß',     status:'geplant', color:'var(--accent-goals)'},
    {day:'Do',full:'Donnerstag',date:'30. Apr',type:'Rest',      focus:'Aktive Erholung + Stretching',status:'rest',    color:'var(--text-muted)'},
    {day:'Fr',full:'Freitag',   date:'1. Mai', type:'Push Day',  focus:'Variation + höheres Volumen', status:'geplant', color:'var(--accent-training)'},
    {day:'Sa',full:'Samstag',   date:'2. Mai', type:'Cardio',    focus:'30min Zone 2 Laufen',         status:'optional',color:'var(--accent-supplements)'},
    {day:'So',full:'Sonntag',   date:'3. Mai', type:'Rest',      focus:'Vollständige Erholung',       status:'rest',    color:'var(--text-muted)'},
  ];
  const landmarks = [
    {name:'Brust',     sets:14, mev:10, mav:16, mrv:22, status:'optimal'},
    {name:'Rücken',    sets:12, mev:10, mav:18, mrv:24, status:'optimal'},
    {name:'Schultern', sets:8,  mev:8,  mav:14, mrv:20, status:'optimal'},
    {name:'Bizeps',    sets:8,  mev:6,  mav:10, mrv:16, status:'approaching'},
    {name:'Trizeps',   sets:8,  mev:6,  mav:10, mrv:16, status:'approaching'},
    {name:'Quadrizeps',sets:6,  mev:8,  mav:14, mrv:22, status:'below'},
    {name:'Beinbeuger',sets:4,  mev:6,  mav:10, mrv:18, status:'below'},
  ];
  const statusColor = {heute:'var(--accent-training)',geplant:'var(--semantic-info-text)',rest:'var(--text-muted)',optional:'var(--semantic-warning-text)'};
  const statusBadge = {heute:'badge-orange',geplant:'badge-blue',rest:'badge-gray',optional:'badge-gray'};
  const lmColor = {optimal:'var(--brand-500)',approaching:'#f59e0b',below:'#ef4444',over:'#a855f7'};
  const lmBg   = {optimal:'var(--semantic-success-bg)',approaching:'var(--semantic-warning-bg)',below:'var(--semantic-danger-bg)',over:'#f3e8ff'};
  const lmLabel= {optimal:'✅ Optimal',approaching:'🟡 Nahe MRV',below:'⚠️ Unter MEV',over:'🔴 Über MRV'};

  return `
    <div style="display:grid;grid-template-columns:1fr 260px;gap:16px;align-items:start">
      <div style="display:flex;flex-direction:column;gap:12px">

        <div class="card" style="background:linear-gradient(135deg,var(--accent-training),#f97316);color:#fff">
          <div style="font-size:var(--text-micro);color:rgba(255,255,255,.65);text-transform:uppercase;letter-spacing:.08em;margin-bottom:4px">Nächstes Workout</div>
          <div style="font-size:var(--text-xl);font-weight:var(--fw-bold);margin-bottom:4px">Push Day — heute 17:00</div>
          <div style="font-size:var(--text-xs);color:rgba(255,255,255,.8);margin-bottom:12px">Brust · Schultern · Trizeps · ~55min</div>
          <div style="display:flex;gap:8px">
            <div style="flex:1;padding:8px;background:rgba(255,255,255,.15);border-radius:var(--r-md);text-align:center">
              <div style="font-size:12px;font-weight:700">5</div><div style="font-size:9px;opacity:.75">Übungen</div>
            </div>
            <div style="flex:1;padding:8px;background:rgba(255,255,255,.15);border-radius:var(--r-md);text-align:center">
              <div style="font-size:12px;font-weight:700">18</div><div style="font-size:9px;opacity:.75">Sätze</div>
            </div>
            <div style="flex:1;padding:8px;background:rgba(255,255,255,.15);border-radius:var(--r-md);text-align:center">
              <div style="font-size:12px;font-weight:700">~55</div><div style="font-size:9px;opacity:.75">Minuten</div>
            </div>
            <div style="flex:1;padding:8px;background:rgba(255,255,255,.15);border-radius:var(--r-md);text-align:center;cursor:pointer">
              <div style="font-size:12px;font-weight:700">▶</div><div style="font-size:9px;opacity:.75">Starten</div>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-header"><div class="card-title">Wochenplan — KW 18</div><div class="badge badge-orange">PPL Split</div></div>
          <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:3px;margin-bottom:10px">
            ${plan.map(d=>`
              <div style="text-align:center">
                <div style="font-size:var(--text-micro);color:var(--text-muted);margin-bottom:3px">${d.day}</div>
                <div style="border-radius:var(--r-sm);padding:8px 2px;background:${d.status==='rest'?'var(--surface-hover)':d.status==='heute'?'#fff7ed':'var(--surface-card-alt)'};border:${d.status==='heute'?'2px solid var(--accent-training)':'1px solid var(--surface-border)'};cursor:pointer">
                  <div style="font-size:var(--text-micro);font-weight:var(--fw-bold);color:${d.color};line-height:1.2">${d.type}</div>
                  <div style="font-size:9px;color:var(--text-muted);margin-top:2px;line-height:1.2">${d.date}</div>
                </div>
              </div>`).join('')}
          </div>
          ${plan.map(d=>`
            <div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--surface-border)">
              <div style="min-width:64px"><div style="font-size:var(--text-xs);font-weight:var(--fw-semibold);color:${statusColor[d.status]}">${d.full}</div><div style="font-size:var(--text-micro);color:var(--text-muted)">${d.date}</div></div>
              <div style="flex:1"><div style="font-size:var(--text-sm);font-weight:var(--fw-medium);color:var(--text-primary)">${d.type}</div><div style="font-size:var(--text-micro);color:var(--text-muted)">${d.focus}</div></div>
              <div class="badge ${statusBadge[d.status]}">${d.status}</div>
            </div>`).join('')}
        </div>

        <div class="card">
          <div class="card-header"><div class="card-title">📊 Volume Landmarks</div><div class="badge badge-blue">diese Woche</div></div>
          <div style="font-size:var(--text-micro);color:var(--text-muted);margin-bottom:10px">MEV = Minimales effektives Volumen · MAV = Optimum · MRV = Maximum</div>
          ${landmarks.map(l=>{
            const fillPct = Math.min((l.sets/l.mrv)*100, 105);
            const mavPct  = (l.mav/l.mrv)*100;
            const mevPct  = (l.mev/l.mrv)*100;
            return `
              <div style="margin-bottom:10px">
                <div style="display:flex;justify-content:space-between;margin-bottom:3px">
                  <span style="font-size:var(--text-xs);font-weight:var(--fw-medium);color:var(--text-primary)">${l.name}</span>
                  <div style="display:flex;align-items:center;gap:6px">
                    <span style="font-size:var(--text-xs);font-weight:var(--fw-bold);color:${lmColor[l.status]}">${l.sets} Sets</span>
                    <span style="font-size:9px;padding:1px 5px;border-radius:var(--r-full);background:${lmBg[l.status]};color:${lmColor[l.status]}">${lmLabel[l.status]}</span>
                  </div>
                </div>
                <div style="position:relative;height:8px;background:var(--surface-hover);border-radius:4px;overflow:visible">
                  <div style="position:absolute;left:${mevPct}%;top:-2px;width:2px;height:12px;background:#94a3b8;border-radius:1px" title="MEV: ${l.mev}"></div>
                  <div style="position:absolute;left:${mavPct}%;top:-2px;width:2px;height:12px;background:var(--brand-500);border-radius:1px" title="MAV: ${l.mav}"></div>
                  <div style="height:100%;width:${fillPct}%;background:${lmColor[l.status]};border-radius:4px;opacity:.8"></div>
                </div>
                <div style="display:flex;justify-content:space-between;font-size:9px;color:var(--text-muted);margin-top:2px"><span>MEV:${l.mev}</span><span>MAV:${l.mav}</span><span>MRV:${l.mrv}</span></div>
              </div>`;
          }).join('')}
        </div>
      </div>

      <div style="display:flex;flex-direction:column;gap:12px">
        <div class="card">
          <div class="card-header"><div class="card-title">Periodisierung</div></div>
          <div class="data-row"><div class="data-label">Aktueller Block</div><div class="data-val">Hypertrophie B2</div></div>
          <div class="data-row"><div class="data-label">Woche</div><div class="data-val">3 / 6</div></div>
          <div class="data-row"><div class="data-label">Progression</div><div class="data-val" style="color:var(--brand-700)">+5% Volumen</div></div>
          <div class="data-row"><div class="data-label">Nächste Deload</div><div class="data-val">KW 20</div></div>
          <div class="data-row"><div class="data-label">Split</div><div class="data-val">PPL · 4-5×/W</div></div>
          <div style="margin-top:10px">
            <div style="font-size:var(--text-micro);color:var(--text-muted);margin-bottom:6px">Block-Fortschritt</div>
            <div class="progress-track"><div class="progress-fill" style="width:50%;background:var(--accent-training)"></div></div>
          </div>
        </div>
        <div class="card">
          <div class="card-header"><div class="card-title">Push/Pull/Legs Balance</div></div>
          ${[{l:'Push',v:48,c:'var(--accent-training)'},{l:'Pull',v:38,c:'var(--accent-coach)'},{l:'Legs',v:14,c:'var(--accent-goals)'}].map(b=>`
            <div style="margin-bottom:8px">
              <div style="display:flex;justify-content:space-between;font-size:var(--text-xs);margin-bottom:3px">
                <span style="color:var(--text-secondary)">${b.l}</span>
                <span style="font-weight:var(--fw-semibold);color:${b.c}">${b.v}%</span>
              </div>
              <div class="progress-track" style="height:5px"><div class="progress-fill" style="width:${b.v}%;background:${b.c}"></div></div>
            </div>`).join('')}
          <div style="font-size:var(--text-micro);color:var(--semantic-warning-text);margin-top:4px">⚠️ Legs unter 20% — mehr Beintraining empfohlen</div>
        </div>
      </div>
    </div>`;
};
