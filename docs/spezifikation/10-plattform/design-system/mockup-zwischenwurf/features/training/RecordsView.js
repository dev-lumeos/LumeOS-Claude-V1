// features/training/RecordsView.js
// Training → Rekorde: PR Board Top 8, Achievement Timeline, PR Velocity

window.Training_RecordsView = function() {
  const prs = [
    {rank:1,ex:'Kreuzheben',     best:'130kg×5', e1rm:'147kg',date:'16. Apr',tier:'gold',  new:false},
    {rank:2,ex:'Kniebeugen',     best:'105kg×6', e1rm:'124kg',date:'20. Apr',tier:'gold',  new:false},
    {rank:3,ex:'Bankdrücken',    best:'92kg×8',  e1rm:'117kg',date:'heute',  tier:'gold',  new:true},
    {rank:4,ex:'Klimmzüge',      best:'BW+15×6', e1rm:'~86kg',date:'22. Apr',tier:'silver',new:false},
    {rank:5,ex:'Schulterdrücken',best:'62kg×8',  e1rm:'79kg', date:'14. Apr',tier:'silver',new:false},
    {rank:6,ex:'Langhantel Row', best:'80kg×8',  e1rm:'101kg',date:'8. Apr', tier:'bronze',new:false},
    {rank:7,ex:'Bizeps Curl LH', best:'50kg×6',  e1rm:'57kg', date:'10. Apr',tier:'bronze',new:false},
    {rank:8,ex:'Dips',           best:'BW+20×8', e1rm:'~72kg',date:'18. Apr',tier:'bronze',new:false},
  ];
  const tierBg    = {gold:'#fef9c3',silver:'#f1f5f9',bronze:'#fff7ed'};
  const tierColor = {gold:'#d97706', silver:'#64748b',bronze:'#92400e'};
  const tierMedal = {gold:'🥇',silver:'🥈',bronze:'🥉'};
  const prHistory = [
    {date:'27. Apr',ex:'Bankdrücken',    delta:'+2kg (+1.7%)', icon:'💪'},
    {date:'24. Apr',ex:'Leg Press',      delta:'+5kg (+3.2%)', icon:'🦵'},
    {date:'22. Apr',ex:'Klimmzüge',      delta:'+2.5kg (+4%)', icon:'🧗'},
    {date:'20. Apr',ex:'Kniebeugen',     delta:'+3kg (+2.5%)', icon:'🦵'},
    {date:'18. Apr',ex:'Dips',           delta:'+2.5kg',        icon:'💪'},
    {date:'16. Apr',ex:'Kreuzheben',     delta:'+5kg (+3.5%)', icon:'💀'},
  ];
  const prVelocity = [2,1,3,2,4,3,4,2,3,5,4,3]; // PRs per week, last 12W

  return `
    <div style="display:grid;grid-template-columns:1fr 280px;gap:16px;align-items:start">
      <div style="display:flex;flex-direction:column;gap:12px">

        <div class="card">
          <div class="card-header"><div class="card-title">🏆 Personal Records Board</div><div class="badge badge-orange">8 Rekorde</div></div>
          ${prs.map(r=>`
            <div style="display:flex;align-items:center;gap:10px;padding:9px 0;border-bottom:1px solid var(--surface-border);background:${r.new?tierBg[r.tier]:'transparent'};margin:0 -4px;padding-left:4px;padding-right:4px;border-radius:var(--r-sm)">
              <span style="font-size:18px;flex-shrink:0">${tierMedal[r.tier]}</span>
              <div style="flex:1;min-width:0">
                <div style="display:flex;align-items:center;gap:6px;margin-bottom:2px">
                  <span style="font-size:var(--text-xs);font-weight:var(--fw-bold);color:var(--text-primary)">${r.ex}</span>
                  ${r.new?`<span style="font-size:9px;padding:1px 5px;border-radius:var(--r-full);background:var(--accent-training);color:#fff;font-weight:700">🆕 Neu</span>`:''}
                </div>
                <div style="font-size:var(--text-micro);color:var(--text-muted)">${r.best} · ${r.date}</div>
              </div>
              <div style="text-align:right;flex-shrink:0">
                <div style="font-size:13px;font-weight:var(--fw-bold);color:${tierColor[r.tier]}">${r.e1rm}</div>
                <div style="font-size:var(--text-micro);color:var(--text-muted)">e1RM</div>
              </div>
            </div>`).join('')}
        </div>

        <div class="card">
          <div class="card-header"><div class="card-title">📅 PR Timeline</div><div class="badge badge-blue">letzte 30 Tage</div></div>
          ${prHistory.map((h,i)=>`
            <div style="display:flex;gap:10px;padding:8px 0;border-bottom:1px solid var(--surface-border)">
              <div style="display:flex;flex-direction:column;align-items:center">
                <div style="width:10px;height:10px;border-radius:50%;background:var(--brand-600);margin-top:3px"></div>
                ${i<prHistory.length-1?`<div style="width:1px;flex:1;background:var(--surface-border);margin-top:3px"></div>`:''}
              </div>
              <div style="flex:1">
                <div style="font-size:var(--text-xs);font-weight:var(--fw-semibold);color:var(--text-primary)">${h.icon} ${h.ex}</div>
                <div style="font-size:var(--text-micro);color:var(--brand-700);font-weight:600">${h.delta}</div>
                <div style="font-size:var(--text-micro);color:var(--text-muted)">${h.date}</div>
              </div>
            </div>`).join('')}
        </div>
      </div>

      <div style="display:flex;flex-direction:column;gap:12px">
        <div class="card">
          <div class="card-header"><div class="card-title">📈 PR Velocity</div></div>
          <div style="font-size:var(--text-micro);color:var(--text-muted);margin-bottom:8px">PRs pro Woche (12 Wochen)</div>
          <div style="display:flex;align-items:flex-end;height:44px;gap:3px;margin-bottom:6px">
            ${prVelocity.map((v,i)=>`
              <div style="flex:1;background:${i===11?'var(--brand-600)':v>=4?'var(--brand-300)':'var(--brand-100)'};border-radius:2px 2px 0 0;height:${(v/5)*40}px"></div>`).join('')}
          </div>
          <div style="display:flex;justify-content:space-between;font-size:var(--text-micro);color:var(--text-muted)">
            <span>KW 6</span><span>Ø 2.8/W</span><span>KW 17</span>
          </div>
        </div>

        <div class="card">
          <div class="card-header"><div class="card-title">Tier-Verteilung</div></div>
          ${[{t:'Gold',n:3,c:'#d97706'},{t:'Silver',n:2,c:'#64748b'},{t:'Bronze',n:3,c:'#92400e'}].map(t=>`
            <div class="data-row">
              <div style="display:flex;align-items:center;gap:6px;flex:1">
                <span>${{Gold:'🥇',Silver:'🥈',Bronze:'🥉'}[t.t]}</span>
                <span class="data-label">${t.t}</span>
              </div>
              <div style="display:flex;align-items:center;gap:8px">
                <div class="progress-track" style="width:60px;height:4px"><div class="progress-fill" style="width:${(t.n/8)*100}%;background:${t.c}"></div></div>
                <span class="data-val" style="color:${t.c}">${t.n}</span>
              </div>
            </div>`).join('')}
        </div>

        <div class="card">
          <div class="card-header"><div class="card-title">Monatliche Stats</div></div>
          <div class="data-row"><div class="data-label">PRs diesen Monat</div><div class="data-val" style="color:var(--brand-700)">8</div></div>
          <div class="data-row"><div class="data-label">Letzte PR</div><div class="data-val">heute · Bankdrücken</div></div>
          <div class="data-row"><div class="data-label">Bester Monat</div><div class="data-val">Feb 2026 (11 PRs)</div></div>
          <div class="data-row"><div class="data-label">Longest PR Streak</div><div class="data-val">4 Wochen</div></div>
        </div>
      </div>
    </div>
  `;
};
