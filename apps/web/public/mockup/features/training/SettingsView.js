// features/training/SettingsView.js — NEW
// SPEC_04_FEATURES: Equipment, Frequenz, Split, Progression Model, Einheiten, PR-Formel

window.Training_SettingsView = function() {
  const equipment = ['Gym','Langhanteln','Kurzhanteln','Kabelzug','Maschinen','Bodyweight','Bänder','Kettlebell'];
  const active_eq = ['Gym','Langhanteln','Kurzhanteln','Kabelzug','Maschinen'];
  const splits = [
    {id:'ppl',  label:'Push / Pull / Legs', desc:'3-6×/W · Hypertrophie', active:true},
    {id:'ul',   label:'Upper / Lower',       desc:'4×/W · Kraft + Masse',  active:false},
    {id:'fb',   label:'Full Body',           desc:'3×/W · Einsteiger',     active:false},
    {id:'bro',  label:'Bro Split',           desc:'5×/W · Isolation',      active:false},
    {id:'pps',  label:'Push + Pull + Squat', desc:'Variation PPL',         active:false},
  ];
  const progressions = [
    {id:'double',label:'Double Progression', desc:'Erst Reps, dann Gewicht — Standard für Hypertrophie',active:true},
    {id:'linear',label:'Linear Progression', desc:'+2.5kg jede Session — ideal für Anfänger',          active:false},
    {id:'dup',   label:'DUP',                desc:'Kraft/Hypertrophie/Power täglich wechseln',          active:false},
    {id:'rpe',   label:'RPE-Autoregulation', desc:'Gewicht nach Tagesverfassung — für Fortgeschrittene',active:false},
    {id:'wave',  label:'Wave Loading',       desc:'75%→85%→95% Wellen, dann Deload',                    active:false},
  ];
  const toggle = (on) => `<div style="width:40px;height:22px;border-radius:11px;background:${on?'var(--accent-training)':'var(--surface-border)'};position:relative;cursor:pointer;flex-shrink:0"><div style="position:absolute;top:2px;${on?'right:2px':'left:2px'};width:18px;height:18px;border-radius:50%;background:#fff;box-shadow:var(--shadow-sm)"></div></div>`;

  return `
    <div style="display:flex;flex-direction:column;gap:14px">

      <div class="card" style="background:linear-gradient(135deg,#fff7ed,#fffbf5);border:1px solid #fed7aa">
        <div style="display:flex;align-items:center;gap:10px">
          <span style="font-size:24px">🏋️</span>
          <div>
            <div style="font-size:var(--text-sm);font-weight:var(--fw-bold);color:#92400e">Training konfiguriert</div>
            <div style="font-size:var(--text-micro);color:#78350f">PPL Split · Double Progression · Gym-Equipment · 4-5×/Woche</div>
          </div>
          <div style="margin-left:auto;font-size:var(--text-micro);padding:4px 10px;border-radius:var(--r-full);background:var(--accent-training);color:#fff;cursor:pointer">Anpassen</div>
        </div>
      </div>

      <div class="card">
        <div class="card-header"><div class="card-title">🏗️ Equipment</div></div>
        <div style="font-size:var(--text-micro);color:var(--text-muted);margin-bottom:10px">Was steht dir zur Verfügung? (Mehrfachauswahl)</div>
        <div style="display:flex;gap:6px;flex-wrap:wrap">
          ${equipment.map(e=>`
            <div style="padding:5px 12px;border-radius:var(--r-full);border:1px solid ${active_eq.includes(e)?'var(--accent-training)':'var(--surface-border)'};background:${active_eq.includes(e)?'#fff7ed':'var(--surface-hover)'};font-size:var(--text-xs);font-weight:${active_eq.includes(e)?'var(--fw-semibold)':'var(--fw-normal)'};color:${active_eq.includes(e)?'var(--accent-training)':'var(--text-secondary)'};cursor:pointer">
              ${active_eq.includes(e)?'✓ ':''}${e}
            </div>`).join('')}
        </div>
      </div>

      <div class="card">
        <div class="card-header"><div class="card-title">📅 Trainingsfrequenz</div><div style="font-size:var(--text-sm);font-weight:var(--fw-bold);color:var(--accent-training)">4-5 Tage/Woche</div></div>
        <div style="position:relative;height:6px;background:var(--surface-hover);border-radius:3px;margin-bottom:8px">
          <div style="position:absolute;height:100%;width:62.5%;background:var(--accent-training);border-radius:3px"></div>
          <div style="position:absolute;top:50%;left:62.5%;transform:translate(-50%,-50%);width:16px;height:16px;border-radius:50%;background:#fff;border:2px solid var(--accent-training);box-shadow:var(--shadow-sm)"></div>
        </div>
        <div style="display:flex;justify-content:space-between;font-size:var(--text-micro);color:var(--text-muted)">
          ${[2,3,4,5,6,7].map((n,i)=>`<span style="${i===2||i===3?'color:var(--accent-training);font-weight:600':''}">　${n}　</span>`).join('')}
        </div>
        <div style="font-size:var(--text-micro);color:var(--text-muted);margin-top:6px">2=Minimal | 4-5=Optimal für Hypertrophie | 6-7=Advanced</div>
      </div>

      <div class="card">
        <div class="card-header"><div class="card-title">🗓️ Bevorzugter Split</div></div>
        <div style="display:flex;flex-direction:column;gap:6px">
          ${splits.map(s=>`
            <div style="display:flex;align-items:center;gap:10px;padding:9px 12px;border-radius:var(--r-md);border:1px solid ${s.active?'var(--accent-training)':'var(--surface-border)'};background:${s.active?'#fff7ed':'var(--surface-card)'};cursor:pointer">
              <div style="width:16px;height:16px;border-radius:50%;border:2px solid ${s.active?'var(--accent-training)':'var(--surface-border)'};background:${s.active?'var(--accent-training)':'transparent'};display:flex;align-items:center;justify-content:center;flex-shrink:0">
                ${s.active?'<div style="width:6px;height:6px;border-radius:50%;background:#fff"></div>':''}
              </div>
              <div style="flex:1">
                <div style="font-size:var(--text-xs);font-weight:${s.active?'var(--fw-semibold)':'var(--fw-normal)'};color:${s.active?'var(--accent-training)':'var(--text-primary)'}">${s.label}</div>
                <div style="font-size:var(--text-micro);color:var(--text-muted)">${s.desc}</div>
              </div>
            </div>`).join('')}
        </div>
      </div>

      <div class="card">
        <div class="card-header"><div class="card-title">📈 Progression-Methode</div></div>
        <div style="display:flex;flex-direction:column;gap:6px">
          ${progressions.map(p=>`
            <div style="display:flex;gap:10px;padding:9px 12px;border-radius:var(--r-md);border:1px solid ${p.active?'var(--accent-training)':'var(--surface-border)'};background:${p.active?'#fff7ed':'var(--surface-card)'};cursor:pointer">
              <div style="width:16px;height:16px;border-radius:50%;border:2px solid ${p.active?'var(--accent-training)':'var(--surface-border)'};background:${p.active?'var(--accent-training)':'transparent'};display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px">
                ${p.active?'<div style="width:6px;height:6px;border-radius:50%;background:#fff"></div>':''}
              </div>
              <div>
                <div style="font-size:var(--text-xs);font-weight:${p.active?'var(--fw-semibold)':'var(--fw-normal)'};color:${p.active?'var(--accent-training)':'var(--text-primary)'}">${p.label}</div>
                <div style="font-size:var(--text-micro);color:var(--text-muted)">${p.desc}</div>
              </div>
            </div>`).join('')}
        </div>
      </div>

      <div class="card">
        <div class="card-header"><div class="card-title">⚙️ Weitere Einstellungen</div></div>
        <div style="display:flex;align-items:center;justify-content:space-between;padding:7px 0;border-bottom:1px solid var(--surface-border)">
          <div><div style="font-size:var(--text-xs);color:var(--text-primary)">Gewichtseinheit</div><div style="font-size:var(--text-micro);color:var(--text-muted)">kg oder lbs</div></div>
          <div style="display:flex;gap:0">
            ${['kg','lbs'].map((u,i)=>`<div style="padding:4px 12px;border-radius:${i===0?'var(--r-sm) 0 0 var(--r-sm)':'0 var(--r-sm) var(--r-sm) 0'};background:${i===0?'var(--accent-training)':'var(--surface-hover)'};color:${i===0?'#fff':'var(--text-secondary)'};font-size:var(--text-xs);font-weight:${i===0?'var(--fw-bold)':'var(--fw-normal)'};cursor:pointer">${u}</div>`).join('')}
          </div>
        </div>
        <div style="display:flex;align-items:center;justify-content:space-between;padding:7px 0;border-bottom:1px solid var(--surface-border)">
          <div><div style="font-size:var(--text-xs);color:var(--text-primary)">1RM Formel</div><div style="font-size:var(--text-micro);color:var(--text-muted)">Für PR-Berechnung</div></div>
          <div style="display:flex;gap:0">
            ${['Brzycki','Epley'].map((f,i)=>`<div style="padding:4px 12px;border-radius:${i===0?'var(--r-sm) 0 0 var(--r-sm)':'0 var(--r-sm) var(--r-sm) 0'};background:${i===0?'var(--accent-training)':'var(--surface-hover)'};color:${i===0?'#fff':'var(--text-secondary)'};font-size:var(--text-xs);font-weight:${i===0?'var(--fw-bold)':'var(--fw-normal)'};cursor:pointer">${f}</div>`).join('')}
          </div>
        </div>
        <div style="display:flex;align-items:center;justify-content:space-between;padding:7px 0;border-bottom:1px solid var(--surface-border)">
          ${toggle(true)}<span style="font-size:var(--text-xs);color:var(--text-secondary);flex:1;margin-left:10px">PR-Feier Animation bei neuem Rekord</span>
        </div>
        <div style="display:flex;align-items:center;justify-content:space-between;padding:7px 0;border-bottom:1px solid var(--surface-border)">
          ${toggle(true)}<span style="font-size:var(--text-xs);color:var(--text-secondary);flex:1;margin-left:10px">Post-Workout Feedback abfragen</span>
        </div>
        <div style="display:flex;align-items:center;justify-content:space-between;padding:7px 0">
          ${toggle(false)}<span style="font-size:var(--text-xs);color:var(--text-muted);flex:1;margin-left:10px">RPE/RIR Tracking aktivieren</span>
        </div>
      </div>

      <div class="card">
        <div class="card-header"><div class="card-title">🕐 Standard Rest Timer</div></div>
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px">
          ${[{v:60,l:'60s'},{v:90,l:'90s',active:true},{v:120,l:'2min'},{v:180,l:'3min'}].map(r=>`
            <div style="padding:8px;text-align:center;border-radius:var(--r-md);border:1px solid ${r.active?'var(--accent-training)':'var(--surface-border)'};background:${r.active?'#fff7ed':'var(--surface-card)'};cursor:pointer">
              <div style="font-size:var(--text-xs);font-weight:${r.active?'var(--fw-bold)':'var(--fw-normal)'};color:${r.active?'var(--accent-training)':'var(--text-secondary)'}">${r.l}</div>
              ${r.active?`<div style="font-size:var(--text-micro);color:var(--accent-training)">Standard</div>`:''}
            </div>`).join('')}
        </div>
      </div>
    </div>`;
};
