// features/training/PeriodizationView.js
// Training → Periodisierung: Aktiver Mesozyklus, Phase-Timeline, Volumen-Verlauf, Weekly Targets

window.Training_PeriodizationView = function() {
  const meso = {name:'Hypertrophie Block 2',type:'hypertrophy',weeks:6,currentWeek:3,
    daysLeft:22,base:12,peak:20,strategy:'linear_ramp',deload:true};
  const phasePct = Math.round((meso.currentWeek/meso.weeks)*100);
  const weekTargets = [12,14,16,18,20,10]; // last = deload
  const weeklyProgress = [
    {m:'Brust',    done:14,target:16,pct:88},
    {m:'Rücken',   done:12,target:16,pct:75},
    {m:'Schultern',done:8, target:12,pct:67},
    {m:'Beine',    done:6, target:14,pct:43},
    {m:'Bizeps',   done:8, target:10,pct:80},
    {m:'Trizeps',  done:8, target:10,pct:80},
  ];
  const phases = [
    {n:'Akkumulation',w:'KW 1-2',done:true, desc:'Volumen aufbauen'},
    {n:'Intensivierung',w:'KW 3-4',active:true,desc:'Intensität erhöhen'},
    {n:'Realisierung',  w:'KW 5',  done:false,desc:'Peak Leistung'},
    {n:'Deload',        w:'KW 6',  done:false,desc:'Regeneration -40%'},
  ];
  const statusColor = (pct) => pct>=80?'var(--brand-500)':pct>=60?'#f59e0b':'#ef4444';

  return `
    <div style="display:flex;flex-direction:column;gap:12px">

      <div style="background:linear-gradient(135deg,var(--brand-600),var(--brand-700));border-radius:var(--r-lg);padding:16px 20px;color:#fff">
        <div style="font-size:var(--text-micro);color:rgba(255,255,255,.65);text-transform:uppercase;letter-spacing:.06em;margin-bottom:4px">Aktiver Mesozyklus</div>
        <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:10px">
          <div>
            <div style="font-size:var(--text-xl);font-weight:var(--fw-bold)">${meso.name}</div>
            <div style="font-size:var(--text-xs);color:rgba(255,255,255,.75)">Hypertrophie-Block · Linear Ramp ${meso.base}→${meso.peak} Sets</div>
          </div>
          <div style="text-align:right">
            <div style="font-size:24px;font-weight:800">W${meso.currentWeek}/${meso.weeks}</div>
            <div style="font-size:var(--text-micro);color:rgba(255,255,255,.65)">${meso.daysLeft}T verbleibend</div>
          </div>
        </div>
        <div style="background:rgba(255,255,255,.2);border-radius:4px;height:8px;overflow:hidden;margin-bottom:4px">
          <div style="width:${phasePct}%;height:100%;background:#fff;border-radius:4px"></div>
        </div>
        <div style="font-size:var(--text-micro);color:rgba(255,255,255,.65)">${phasePct}% abgeschlossen</div>
      </div>

      <div class="card">
        <div class="card-header"><div class="card-title">Phase-Timeline</div></div>
        <div style="display:flex;gap:0;position:relative">
          <div style="position:absolute;top:16px;left:16px;right:16px;height:2px;background:var(--surface-border)"></div>
          ${phases.map((p,i)=>`
            <div style="flex:1;display:flex;flex-direction:column;align-items:center;position:relative;z-index:1">
              <div style="width:32px;height:32px;border-radius:50%;background:${p.done?'var(--brand-600)':p.active?'var(--accent-training)':'var(--surface-hover)'};border:2px solid ${p.done||p.active?'transparent':'var(--surface-border)'};display:flex;align-items:center;justify-content:center;font-size:12px;color:${p.done||p.active?'#fff':'var(--text-muted)'}">
                ${p.done?'✓':p.active?'▶':(i+1)}
              </div>
              <div style="font-size:var(--text-micro);font-weight:${p.active?'var(--fw-bold)':'var(--fw-normal)'};color:${p.active?'var(--accent-training)':'var(--text-secondary)'};margin-top:4px;text-align:center">${p.n}</div>
              <div style="font-size:9px;color:var(--text-muted);text-align:center">${p.w}</div>
              ${p.active?`<div style="font-size:9px;color:var(--accent-training);font-weight:600">← Aktuell</div>`:''}
            </div>`).join('')}
        </div>
        <div style="margin-top:10px;background:var(--semantic-info-bg);border-radius:var(--r-sm);padding:8px 10px;font-size:var(--text-micro);color:var(--semantic-info-text)">
          Intensivierungsphase (KW 3-4): Gewichte steigen +2.5kg, Volumen bei MAV, Fokus auf Progressive Overload
        </div>
      </div>

      <div class="card">
        <div class="card-header"><div class="card-title">Wochen-Volumen Ziele</div><div class="card-meta">Sätze/Muskelgruppe</div></div>
        <div style="display:flex;align-items:flex-end;height:56px;gap:4px;margin-bottom:6px">
          ${weekTargets.map((v,i)=>`
            <div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:1px">
              <div style="font-size:8px;color:var(--text-muted)">${v}</div>
              <div style="width:100%;background:${i===meso.currentWeek-1?'var(--accent-training)':i===meso.weeks-1?'#3b82f6':'var(--brand-100)'};border-radius:2px 2px 0 0;height:${(v/20)*48}px;border:${i===meso.currentWeek-1?'2px solid var(--brand-700)':'none'}"></div>
              <div style="font-size:8px;color:var(--text-muted)">W${i+1}${i===meso.weeks-1?' D':''}</div>
            </div>`).join('')}
        </div>
        <div style="font-size:var(--text-micro);color:var(--text-muted)">Ziel diese Woche: 16 Sätze/Muskelgruppe (Intensivierung)</div>
      </div>

      <div class="card">
        <div class="card-header"><div class="card-title">KW 17 Fortschritt</div><div class="badge badge-orange">4 Tage verbleibend</div></div>
        ${weeklyProgress.map(m=>`
          <div style="margin-bottom:8px">
            <div style="display:flex;justify-content:space-between;margin-bottom:3px">
              <span style="font-size:var(--text-xs);font-weight:var(--fw-medium);color:var(--text-primary)">${m.m}</span>
              <div style="display:flex;align-items:center;gap:6px">
                <span style="font-size:var(--text-micro);font-weight:600;color:${statusColor(m.pct)}">${m.pct}%</span>
                <span style="font-size:var(--text-micro);color:var(--text-muted)">${m.done}/${m.target} Sets</span>
              </div>
            </div>
            <div class="progress-track" style="height:5px">
              <div class="progress-fill" style="width:${m.pct}%;background:${statusColor(m.pct)}"></div>
            </div>
          </div>`).join('')}
      </div>
    </div>
  `;
};
