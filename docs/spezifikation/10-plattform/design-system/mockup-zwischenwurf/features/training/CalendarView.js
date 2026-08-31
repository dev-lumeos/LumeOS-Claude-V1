// features/training/CalendarView.js — REBUILT
// Consistency Heatmap (12W GitHub-style), Monats-Kalender, Filter, Volumen-Bubbles, Wochensummary

window.Training_CalendarView = function() {
  // 12-week consistency heatmap data (Mon→Sun, 12 weeks)
  const heatWeeks = [
    [1,0,1,0,1,0,0],[1,1,0,1,0,1,0],[0,1,1,0,1,0,0],[1,0,1,1,0,0,1],
    [1,1,0,1,1,0,0],[0,1,1,0,1,0,0],[1,0,1,0,1,1,0],[1,1,0,1,0,1,0],
    [1,0,1,1,0,0,0],[1,1,0,1,1,0,0],[1,0,1,0,1,0,0],[1,1,0,1,0,0,0],
  ];
  const heatColors = ['#1e293b','#166534','#16a34a','#22c55e','#4ade80'];
  const intensity = (v) => v===0?0:Math.floor(Math.random()*3)+1; // 0-3 for non-zero days

  // April 2026 calendar: April 1 = Wednesday → offset 2 (Mon=0)
  const workouts = {
    7:{type:'pull',vol:'s'},8:{type:'push',vol:'m'},9:{type:'legs',vol:'l'},
    11:{type:'cardio',vol:'s'},13:{type:'push',vol:'l'},14:{type:'pull',vol:'m'},
    16:{type:'legs',vol:'l'},18:{type:'push',vol:'m'},19:{type:'cardio',vol:'s'},
    21:{type:'push',vol:'l'},22:{type:'pull',vol:'m'},23:{type:'legs',vol:'l'},
    25:{type:'cardio',vol:'s'},28:{type:'push',vol:'m',planned:true},
    29:{type:'pull',vol:'m',planned:true},30:{type:'legs',vol:'l',planned:true},
  };
  const typeColor = {push:'var(--accent-training)',pull:'var(--accent-coach)',legs:'var(--accent-goals)',cardio:'var(--accent-supplements)'};
  const volSize   = {s:7,m:9,l:11};
  const today     = 27;
  const dayNames  = ['Mo','Di','Mi','Do','Fr','Sa','So'];

  // streak calc: 4 consecutive active weeks shown = streak 4
  const streak = 4;
  const weekSessions = 4;
  const totalSessions = 47;

  return `
    <div style="display:flex;flex-direction:column;gap:12px">

      <div style="background:#0f172a;border-radius:var(--r-lg);padding:16px;color:#fff">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
          <div>
            <div style="font-size:var(--text-xs);font-weight:var(--fw-bold);color:#94a3b8;text-transform:uppercase;letter-spacing:.06em;margin-bottom:2px">Training Consistency</div>
            <div style="font-size:var(--text-xl);font-weight:var(--fw-bold);color:#fff">12 Wochen</div>
          </div>
          <div style="display:flex;gap:10px">
            ${[{icon:'🔥',val:streak,lbl:'Wochen-Streak'},{icon:'📅',val:weekSessions,lbl:'diese Woche'},{icon:'🏋️',val:totalSessions,lbl:'gesamt'}].map(s=>`
              <div style="text-align:center;background:rgba(255,255,255,.07);border-radius:var(--r-md);padding:8px 10px">
                <div style="font-size:14px;font-weight:var(--fw-bold);color:#fff">${s.val}</div>
                <div style="font-size:9px;color:#64748b">${s.lbl}</div>
              </div>`).join('')}
          </div>
        </div>
        <div style="display:grid;grid-template-columns:24px repeat(12,1fr);gap:2px">
          <div></div>
          ${Array.from({length:12},(_,i)=>`<div style="font-size:9px;color:#475569;text-align:center">KW${16+i}</div>`).join('')}
          ${dayNames.map((d,di)=>`
            <div style="font-size:9px;color:#475569;display:flex;align-items:center">${di%2===0?d:''}</div>
            ${heatWeeks.map((_,wi)=>{
              const v = heatWeeks[wi][di];
              const lvl = v ? (di===0||di===2||di===4?3:di===1||di===3?2:1) : 0;
              return `<div style="aspect-ratio:1;border-radius:2px;background:${heatColors[lvl]}"></div>`;
            }).join('')}
          `).join('')}
        </div>
        <div style="display:flex;align-items:center;gap:6px;margin-top:8px;justify-content:flex-end">
          <span style="font-size:9px;color:#475569">Weniger</span>
          ${heatColors.map(c=>`<div style="width:10px;height:10px;border-radius:2px;background:${c}"></div>`).join('')}
          <span style="font-size:9px;color:#475569">Mehr</span>
        </div>
      </div>

      <div class="card">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">
          <div style="font-size:14px;cursor:pointer;color:var(--text-muted)">‹</div>
          <div class="card-title" style="flex:1">April 2026</div>
          <div class="badge badge-orange">17 Workouts</div>
          <div style="font-size:14px;cursor:pointer;color:var(--text-muted)">›</div>
        </div>
        <div style="display:flex;gap:4px;margin-bottom:10px;flex-wrap:wrap">
          ${[{k:'all',l:'Alle',c:'var(--accent-training)'},{k:'push',l:'Push',c:'var(--accent-training)'},{k:'pull',l:'Pull',c:'var(--accent-coach)'},{k:'legs',l:'Legs',c:'var(--accent-goals)'},{k:'cardio',l:'Cardio',c:'var(--accent-supplements)'}].map((f,i)=>`
            <div style="font-size:var(--text-micro);padding:3px 8px;border-radius:var(--r-full);cursor:pointer;background:${i===0?f.c:'var(--surface-hover)'};color:${i===0?'#fff':'var(--text-secondary)'};border:1px solid ${i===0?f.c:'var(--surface-border)'}">${f.l}</div>`).join('')}
        </div>
        <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:2px;margin-bottom:4px">
          ${dayNames.map(d=>`<div style="font-size:var(--text-micro);color:var(--text-muted);text-align:center">${d}</div>`).join('')}
        </div>
        <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:2px">
          ${Array.from({length:2},()=>'<div></div>').join('')}
          ${Array.from({length:30},(_,i)=>{
            const day=i+1, w=workouts[day], isToday=day===today;
            const dotSize = w ? volSize[w.vol] : 0;
            return `<div style="aspect-ratio:1;border-radius:var(--r-sm);background:${isToday?'var(--brand-50)':'transparent'};border:${isToday?'2px solid var(--brand-500)':'1px solid var(--surface-border)'};display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;cursor:pointer;opacity:${w&&w.planned?.5:1}">
              <div style="font-size:10px;font-weight:${isToday?700:400};color:${isToday?'var(--brand-700)':'var(--text-secondary)'}">${day}</div>
              ${w?`<div style="width:${dotSize}px;height:${dotSize}px;border-radius:50%;background:${w.planned?'transparent':typeColor[w.type]};border:${w.planned?`1.5px dashed ${typeColor[w.type]}`:'none'}"></div>`:''}
            </div>`;
          }).join('')}
        </div>
        <div style="display:flex;gap:10px;margin-top:8px;flex-wrap:wrap">
          ${Object.entries({push:'Push',pull:'Pull',legs:'Legs',cardio:'Cardio'}).map(([k,v])=>`
            <div style="display:flex;align-items:center;gap:4px;font-size:var(--text-micro);color:var(--text-secondary)">
              <div style="width:8px;height:8px;border-radius:50%;background:${typeColor[k]}"></div>${v}
            </div>`).join('')}
          <div style="display:flex;align-items:center;gap:4px;font-size:var(--text-micro);color:var(--text-muted)"><div style="width:8px;height:8px;border-radius:50%;border:1.5px dashed var(--accent-training)"></div>Geplant</div>
        </div>
      </div>

      <div class="card-grid">
        <div class="stat-card"><div class="stat-val">4</div><div class="stat-lbl">Workouts KW 17</div><div class="stat-delta delta-up">↑ 4/4 Plan</div></div>
        <div class="stat-card"><div class="stat-val">85%</div><div class="stat-lbl">Monat-Adherenz</div><div class="stat-delta delta-up">↑ Best month</div></div>
        <div class="stat-card"><div class="stat-val">12.4T</div><div class="stat-lbl">Volumen diese W.</div><div class="stat-delta delta-up">↑ +8% vs. VW</div></div>
        <div class="stat-card"><div class="stat-val">17</div><div class="stat-lbl">April Sessions</div><div class="stat-delta delta-up">↑ +3 vs. März</div></div>
      </div>
    </div>`;
};
