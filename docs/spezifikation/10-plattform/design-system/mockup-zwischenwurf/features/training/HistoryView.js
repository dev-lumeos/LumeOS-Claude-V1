// features/training/HistoryView.js — DEEP REBUILD
// WorkoutComparison, PRBoard + AchievementBadges, StrengthStandards, MuscleBalance, WeeklyVolumeTrend

window.Training_HistoryView = function() {
  const workouts = [
    {date:'27. Apr',type:'Push Day',dur:'42min',vol:'2.700kg',sets:16,
     exercises:[
       {n:'Bankdrücken',   curr:[[90,8,'✅'],[90,8,'✅'],[92,8,'✅🏆'],[92,null,'🔲']],prev:[[90,8],[90,8],[90,7],[87,8]], delta:'+2kg PR 🏆'},
       {n:'Schrägbank DB', curr:[[34,10,'✅'],[34,9,'✅'],[30,10,'✅']],            prev:[[30,10],[30,9],[28,10]],          delta:'+4kg'},
       {n:'Schulterdrücken',curr:[[60,8,'✅'],[60,8,'✅']],                          prev:[[60,8],[57,8]],                   delta:'→ stabil'},
     ]},
    {date:'24. Apr',type:'Legs Day',dur:'65min',vol:'15.820kg',sets:20,
     exercises:[
       {n:'Kniebeugen',curr:[[100,8,'✅'],[100,8,'✅'],[100,7,'✅'],[97,8,'✅']],prev:[[97,8],[97,7],[95,8],[92,8]],delta:'+3kg'},
       {n:'Leg Press',  curr:[[160,10,'✅'],[160,10,'✅'],[155,10,'✅']],          prev:[[155,10],[155,10],[150,10]],    delta:'+5kg'},
     ]},
    {date:'23. Apr',type:'Pull Day',dur:'52min',vol:'9.640kg',sets:14,exercises:[]},
    {date:'21. Apr',type:'Push Day',dur:'55min',vol:'10.890kg',sets:18,exercises:[]},
    {date:'19. Apr',type:'Cardio',   dur:'32min',vol:'—',      sets:0, exercises:[]},
  ];
  const prs = [
    {rank:1,ex:'Bankdrücken',    e1rm:117,best:'92×8',  date:'heute',  new:true,  tier:'gold'},
    {rank:2,ex:'Kniebeugen',     e1rm:124,best:'105×6', date:'20. Apr',new:false, tier:'silver'},
    {rank:3,ex:'Kreuzheben',     e1rm:147,best:'130×5', date:'16. Apr',new:false, tier:'silver'},
    {rank:4,ex:'Schulterdrücken',e1rm:79, best:'62×8',  date:'14. Apr',new:false, tier:'bronze'},
    {rank:5,ex:'Klimmzüge',      e1rm:86, best:'BW+15×6',date:'22. Apr',new:false,tier:'bronze'},
  ];
  const tierColor = {gold:'#f59e0b',silver:'#94a3b8',bronze:'#92400e'};
  const standards = [
    {ex:'Bankdrücken',  e1rm:117,bwX:1.38,level:'Intermediate',pct:60,c:'#22c55e'},
    {ex:'Kniebeugen',   e1rm:124,bwX:1.46,level:'Intermediate',pct:58,c:'#22c55e'},
    {ex:'Kreuzheben',   e1rm:147,bwX:1.73,level:'Intermediate',pct:70,c:'#22c55e'},
    {ex:'OHP',          e1rm:79, bwX:0.93,level:'Beginner',     pct:35,c:'#3b82f6'},
  ];
  const weeklyVol = [65,72,78,84,80,75,88,82,79,86,90,85];
  const badges = [
    {icon:'🔥',name:'Week Warrior',desc:'7-Tage Streak',tier:'silver',earned:true},
    {icon:'💪',name:'Century Club', desc:'100kg Satz',  tier:'bronze',earned:true},
    {icon:'🏗️',name:'Iron Mountain',desc:'100k kg Ges.',tier:'silver',earned:true},
    {icon:'📅',name:'Dedicated',    desc:'50 Workouts', tier:'silver',earned:true},
    {icon:'⭐',name:'Perfect Mach.',desc:'4 perfekte W.',tier:'gold',  earned:false},
  ];

  return `
    <div style="display:grid;grid-template-columns:1fr 252px;gap:16px;align-items:start">
      <div style="display:flex;flex-direction:column;gap:12px">

        <div class="card">
          <div class="card-header"><div class="card-title">📋 Letzte Workouts</div><div class="badge badge-gray">17 April</div></div>
          ${workouts.map(w=>`
            <div style="border-bottom:1px solid var(--surface-border);padding:2px 0">
              <div style="display:flex;align-items:center;gap:10px;padding:10px 0;cursor:pointer"
                onclick="(function(el){const d=el.nextElementSibling;d.style.display=d.style.display==='none'?'block':'none'})(this)">
                <div style="width:8px;height:8px;border-radius:50%;flex-shrink:0;background:${w.type.includes('Push')?'var(--accent-training)':w.type.includes('Pull')?'var(--accent-coach)':w.type.includes('Leg')?'var(--accent-goals)':'var(--accent-supplements)'}"></div>
                <div style="flex:1">
                  <div style="font-size:var(--text-sm);font-weight:var(--fw-semibold);color:var(--text-primary)">${w.type}</div>
                  <div style="font-size:var(--text-micro);color:var(--text-muted)">${w.date} · ${w.dur} · ${w.vol}${w.sets?` · ${w.sets} Sets`:''}</div>
                </div>
                <div style="font-size:12px;color:var(--text-muted)">›</div>
              </div>
              <div style="display:none;padding:8px 12px;background:var(--surface-card-alt);border-radius:var(--r-md);margin-bottom:8px">
                ${w.exercises.map(ex=>`
                  <div style="margin-bottom:8px">
                    <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px">
                      <span style="font-size:var(--text-xs);font-weight:var(--fw-bold);color:var(--text-primary)">${ex.n}</span>
                      <span style="font-size:var(--text-micro);color:${ex.delta.includes('PR')?'var(--accent-training)':'var(--brand-700)'};font-weight:600">${ex.delta}</span>
                    </div>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px">
                      <div><div style="font-size:var(--text-micro);color:var(--text-muted);margin-bottom:2px">Letzte Session</div><div style="display:flex;gap:3px;flex-wrap:wrap">${ex.prev.map((s,i)=>`<span style="font-size:var(--text-micro);background:var(--surface-hover);border-radius:3px;padding:2px 5px;color:var(--text-muted)">S${i+1}:${s[0]}×${s[1]}</span>`).join('')}</div></div>
                      <div><div style="font-size:var(--text-micro);color:var(--text-muted);margin-bottom:2px">Heute</div><div style="display:flex;gap:3px;flex-wrap:wrap">${ex.curr.map((s,i)=>`<span style="font-size:var(--text-micro);background:${s[2]?.includes('🏆')?'#fef9c3':s[2]?.includes('✅')?'var(--brand-50)':'var(--surface-hover)'};border-radius:3px;padding:2px 5px">${s[0]}×${s[1]??'—'} ${s[2]||''}</span>`).join('')}</div></div>
                    </div>
                  </div>`).join('')}
                ${!w.exercises.length?`<div style="font-size:var(--text-micro);color:var(--text-muted)">Workout-Details nicht verfügbar</div>`:''}
              </div>
            </div>`).join('')}
        </div>

        <div class="card">
          <div class="card-header"><div class="card-title">📈 Wöchentliches Volumen (12W)</div></div>
          <div style="display:flex;align-items:flex-end;height:56px;gap:3px;margin-bottom:6px">
            ${weeklyVol.map((v,i)=>`
              <div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:1px">
                <div style="width:100%;background:${i===11?'var(--accent-training)':v>85?'#fed7aa':'#ffedd5'};border-radius:2px 2px 0 0;height:${(v/90)*50}px"></div>
                ${i%4===0?`<div style="font-size:8px;color:var(--text-muted)">KW${6+i}</div>`:''}
              </div>`).join('')}
          </div>
          <div style="display:flex;justify-content:space-between;font-size:var(--text-micro);color:var(--text-muted)"><span>Ø 81k kg/W</span><span style="color:var(--accent-training)">KW17: 85k</span></div>
        </div>

        <div class="card">
          <div class="card-header"><div class="card-title">💪 Kraft-Standards</div><div class="badge badge-blue">85kg KG</div></div>
          <div style="font-size:var(--text-micro);color:var(--brand-700);font-weight:600;margin-bottom:10px">Big Three Total: 388 kg · 4.56× KG</div>
          ${standards.map(s=>`
            <div style="margin-bottom:10px">
              <div style="display:flex;justify-content:space-between;margin-bottom:3px">
                <span style="font-size:var(--text-xs);font-weight:var(--fw-medium);color:var(--text-primary)">${s.ex}</span>
                <span style="font-size:var(--text-micro);font-weight:var(--fw-bold);color:${s.c}">${s.level} · ${s.bwX}× BW · ${s.e1rm}kg</span>
              </div>
              <div style="position:relative;height:5px;background:var(--surface-hover);border-radius:3px">
                <div style="height:100%;width:${s.pct}%;background:linear-gradient(90deg,#8b5cf6,#6366f1);border-radius:3px"></div>
              </div>
            </div>`).join('')}
        </div>
      </div>

      <div style="display:flex;flex-direction:column;gap:12px">
        <div class="card">
          <div class="card-header"><div class="card-title">🏆 Personal Records</div></div>
          ${prs.map(r=>`
            <div style="display:flex;align-items:center;gap:8px;padding:7px 0;border-bottom:1px solid var(--surface-border)">
              <div style="width:22px;height:22px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;flex-shrink:0;background:${tierColor[r.tier]}20;color:${tierColor[r.tier]};border:1px solid ${tierColor[r.tier]}">${r.rank}</div>
              <div style="flex:1;min-width:0">
                <div style="font-size:var(--text-xs);font-weight:var(--fw-semibold);color:var(--text-primary)">${r.ex}${r.new?' 🆕':''}</div>
                <div style="font-size:var(--text-micro);color:var(--text-muted)">${r.best} · ${r.date}</div>
              </div>
              <div style="text-align:right;flex-shrink:0">
                <div style="font-size:11px;font-weight:var(--fw-bold);color:var(--accent-training)">${r.e1rm} kg</div>
                <div style="font-size:var(--text-micro);color:var(--text-muted)">e1RM</div>
              </div>
            </div>`).join('')}
        </div>

        <div class="card">
          <div class="card-header"><div class="card-title">🏅 Achievements</div><div style="font-size:var(--text-micro);color:var(--text-muted)">4/20</div></div>
          <div class="progress-track" style="margin-bottom:10px"><div class="progress-fill" style="width:20%;background:var(--accent-training)"></div></div>
          <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:6px">
            ${badges.map(b=>`
              <div style="text-align:center;opacity:${b.earned?1:.35}">
                <div style="font-size:20px">${b.icon}</div>
                <div style="font-size:8px;color:${b.earned?'var(--text-primary)':'var(--text-muted)'};font-weight:${b.earned?600:400};line-height:1.2;margin-top:2px">${b.name}</div>
                <div style="font-size:7px;color:${tierColor[b.tier]};font-weight:700;text-transform:uppercase">${b.tier}</div>
              </div>`).join('')}
          </div>
        </div>

        <div class="card">
          <div class="card-header"><div class="card-title">⚖️ Muskel-Balance</div></div>
          ${[{l:'Push',v:48,c:'var(--accent-training)'},{l:'Pull',v:38,c:'var(--accent-coach)'},{l:'Legs',v:14,c:'var(--accent-goals)'}].map(b=>`
            <div style="margin-bottom:6px">
              <div style="display:flex;justify-content:space-between;font-size:var(--text-xs);margin-bottom:3px">
                <span style="color:var(--text-secondary)">${b.l}</span><span style="font-weight:600;color:${b.c}">${b.v}%</span>
              </div>
              <div class="progress-track" style="height:5px"><div class="progress-fill" style="width:${b.v}%;background:${b.c}"></div></div>
            </div>`).join('')}
          <div style="font-size:var(--text-micro);color:var(--semantic-warning-text);margin-top:4px">⚠️ Legs unter 20% — mehr Beintraining</div>
        </div>

        <div class="card">
          <div class="card-header"><div class="card-title">April Zusammenfassung</div></div>
          <div class="data-row"><div class="data-label">Workouts</div><div class="data-val">17/20 geplant</div></div>
          <div class="data-row"><div class="data-label">Gesamtvolumen</div><div class="data-val">198k kg</div></div>
          <div class="data-row"><div class="data-label">Ø Dauer</div><div class="data-val">56 min</div></div>
          <div class="data-row"><div class="data-label">Adherenz</div><div class="data-val" style="color:var(--brand-700)">85%</div></div>
        </div>
      </div>
    </div>`;
};
