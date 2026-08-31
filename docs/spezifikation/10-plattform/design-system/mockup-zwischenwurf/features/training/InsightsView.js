// features/training/InsightsView.js
// Training → Insights: Weekly Training Score, Patterns, Muscle Report Card, ProgressiveOverloadAdvisor

window.Training_InsightsView = function() {
  const score = 82;
  const breakdown = [
    {k:'Volumen',      v:85,c:'var(--accent-training)'},
    {k:'Konsistenz',   v:88,c:'var(--brand-600)'},
    {k:'Progression',  v:78,c:'#f59e0b'},
    {k:'Erholung',     v:74,c:'var(--accent-recovery)'},
    {k:'Balance',      v:65,c:'#a855f7'},
  ];
  const patterns = [
    {icon:'📅',type:'day',  title:'Montags niedriger Score',desc:'Dein Workout-Score ist Mo im Ø 6 Punkte niedriger als Mi/Do.',rec:'Mehr Schlaf Sonntagnacht, Volumen Mo reduzieren.'},
    {icon:'🌙',type:'time', title:'Beste Performance um 17-19h',desc:'Sessions nach 17h zeigen +12% mehr Volumen als Morgen-Sessions.',rec:'Training auf Abend planen wenn möglich.'},
    {icon:'💪',type:'volume',title:'Push-Volumen optimiert',desc:'Bankdrücken Progression über 3 Wochen konsistent — Double Progression läuft.',rec:'Weiter so! Nächste Woche +2.5kg möglich.'},
    {icon:'🔄',type:'muscle',title:'Legs vernachlässigt',desc:'Legs-Volumen bei 14% — unter den empfohlenen 30% des Gesamtvolumens.',rec:'Nächste Woche zusätzliche Bein-Session einplanen.'},
  ];
  const muscleReport = [
    {m:'Brust',    grade:'A',sets:14,mev:8,mrv:22,trend:'↑',rec:'Auf Kurs — Double Progression aktiv'},
    {m:'Rücken',   grade:'B',sets:12,mev:8,mrv:25,trend:'↑',rec:'Gut — könnte noch 2 Sätze mehr'},
    {m:'Schultern',grade:'B',sets:8, mev:6,mrv:20,trend:'→',rec:'Stabil — Rear Delt könnte mehr'},
    {m:'Beine',    grade:'D',sets:6, mev:8,mrv:22,trend:'↓',rec:'Kritisch unter MEV — priorisieren!'},
    {m:'Bizeps',   grade:'B',sets:8, mev:4,mrv:16,trend:'↑',rec:'Optimal — Curl-Variation ändern'},
  ];
  const overload = [
    {ex:'Bankdrücken',    rec:'increase_weight', target:'+2.5kg → 92.5kg×8',  curr:'90kg×8 (3W stabil)',color:'var(--brand-500)',icon:'⬆️'},
    {ex:'Kniebeugen',     rec:'increase_reps',   target:'+1 Rep → 100kg×9',   curr:'100kg×8',            color:'#3b82f6',icon:'🔄'},
    {ex:'Schulterdrücken',rec:'maintain',        target:'60kg×8 beibehalten', curr:'RPE optimal (7.5)',  color:'#8b5cf6',icon:'✊'},
    {ex:'Kreuzheben',     rec:'deload',          target:'Deload: 110kg×5',    curr:'Plateau 4 Sessions', color:'#f59e0b',icon:'⚠️'},
  ];
  const recColor = {increase_weight:'var(--semantic-success-bg)',increase_reps:'var(--semantic-info-bg)',maintain:'#f5f3ff',deload:'var(--semantic-warning-bg)'};
  const gradeColor = {A:'var(--brand-600)',B:'#3b82f6',C:'#f59e0b',D:'#ef4444'};

  return `
    <div style="display:flex;flex-direction:column;gap:12px">

      <div class="card">
        <div style="display:flex;align-items:center;gap:16px;margin-bottom:14px">
          <div style="position:relative;width:80px;height:80px;flex-shrink:0">
            <svg width="80" height="80" viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="32" fill="none" stroke="var(--surface-hover)" stroke-width="7"/>
              <circle cx="40" cy="40" r="32" fill="none" stroke="var(--brand-500)" stroke-width="7"
                stroke-dasharray="${(score/100)*201} 201" stroke-linecap="round" transform="rotate(-90 40 40)"/>
            </svg>
            <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);text-align:center">
              <div style="font-size:20px;font-weight:800;color:var(--brand-700)">${score}</div>
            </div>
          </div>
          <div style="flex:1">
            <div style="font-size:var(--text-sm);font-weight:var(--fw-bold);color:var(--text-primary);margin-bottom:2px">Wochen-Trainings-Score</div>
            <div style="font-size:var(--text-micro);color:var(--text-muted);margin-bottom:8px">↑ +4 vs. letzte Woche · Intermediate Level</div>
            ${breakdown.map(b=>`
              <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px">
                <span style="font-size:var(--text-micro);color:var(--text-secondary);width:80px">${b.k}</span>
                <div class="progress-track" style="flex:1;height:4px"><div class="progress-fill" style="width:${b.v}%;background:${b.c}"></div></div>
                <span style="font-size:var(--text-micro);font-weight:600;color:${b.c};width:24px;text-align:right">${b.v}</span>
              </div>`).join('')}
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header"><div class="card-title">🔍 Erkannte Muster</div><div class="badge badge-blue">KI-Analyse</div></div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
          ${patterns.map(p=>`
            <div style="background:var(--surface-card-alt);border-radius:var(--r-md);padding:10px;border:1px solid var(--surface-border)">
              <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px">
                <span style="font-size:14px">${p.icon}</span>
                <span style="font-size:var(--text-xs);font-weight:var(--fw-semibold);color:var(--text-primary)">${p.title}</span>
              </div>
              <div style="font-size:var(--text-micro);color:var(--text-muted);margin-bottom:4px;line-height:1.4">${p.desc}</div>
              <div style="font-size:var(--text-micro);color:var(--brand-700);font-style:italic">→ ${p.rec}</div>
            </div>`).join('')}
        </div>
      </div>

      <div class="card">
        <div class="card-header"><div class="card-title">🎓 Muskelgruppen Report Card</div></div>
        <div style="display:grid;grid-template-columns:60px auto auto 1fr auto;gap:4px;padding:4px 0;border-bottom:2px solid var(--surface-border);margin-bottom:4px">
          ${['Muskel','Grade','Sets/W','MEV → MRV','Trend'].map(h=>`<div style="font-size:var(--text-micro);color:var(--text-muted);font-weight:var(--fw-semibold)">${h}</div>`).join('')}
        </div>
        ${muscleReport.map(m=>`
          <div style="display:grid;grid-template-columns:60px auto auto 1fr auto;gap:4px;padding:7px 0;border-bottom:1px solid var(--surface-border);align-items:center">
            <div style="font-size:var(--text-xs);font-weight:var(--fw-medium);color:var(--text-primary)">${m.m}</div>
            <div style="width:22px;height:22px;border-radius:4px;background:${gradeColor[m.grade]}20;color:${gradeColor[m.grade]};font-size:11px;font-weight:800;display:flex;align-items:center;justify-content:center;border:1px solid ${gradeColor[m.grade]}">${m.grade}</div>
            <div style="font-size:var(--text-xs);font-weight:var(--fw-semibold);color:var(--text-primary);text-align:center">${m.sets}</div>
            <div style="padding:0 6px">
              <div style="position:relative;height:5px;background:var(--surface-hover);border-radius:3px">
                <div style="position:absolute;left:${(m.mev/m.mrv)*100}%;top:-2px;width:2px;height:9px;background:#f59e0b;border-radius:1px"></div>
                <div style="height:100%;width:${Math.min((m.sets/m.mrv)*100,100)}%;background:${gradeColor[m.grade]};border-radius:3px"></div>
              </div>
              <div style="display:flex;justify-content:space-between;font-size:8px;color:var(--text-muted);margin-top:1px"><span>MEV:${m.mev}</span><span>MRV:${m.mrv}</span></div>
            </div>
            <div style="font-size:13px">${m.trend}</div>
          </div>`).join('')}
      </div>

      <div class="card">
        <div class="card-header"><div class="card-title">📈 Progressive Overload Advisor</div></div>
        ${overload.map(o=>`
          <div style="background:${recColor[o.rec]};border-radius:var(--r-md);padding:10px 12px;margin-bottom:6px;border-left:3px solid ${o.color}">
            <div style="display:flex;align-items:center;gap:8px">
              <span style="font-size:16px">${o.icon}</span>
              <div style="flex:1">
                <div style="font-size:var(--text-xs);font-weight:var(--fw-semibold);color:var(--text-primary)">${o.ex}</div>
                <div style="font-size:var(--text-micro);color:var(--text-muted)">${o.curr}</div>
              </div>
              <div style="font-size:var(--text-micro);font-weight:var(--fw-bold);color:${o.color};text-align:right;max-width:130px">${o.target}</div>
            </div>
          </div>`).join('')}
      </div>
    </div>
  `;
};
