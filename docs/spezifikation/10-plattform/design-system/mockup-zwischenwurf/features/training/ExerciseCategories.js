// features/training/ExerciseCategories.js
// Training → Kategorien: Muskelgruppen-Grid, Klick filtert Übungen

window.Training_ExerciseCategories = function() {
  const cats = [
    {name:'Brust',        icon:'🫁',count:94, color:'#ef4444',bg:'#fef2f2'},
    {name:'Rücken',       icon:'🔙',count:112,color:'#3b82f6',bg:'#eff6ff'},
    {name:'Schultern',    icon:'💪',count:78, color:'#8b5cf6',bg:'#f5f3ff'},
    {name:'Bizeps',       icon:'💪',count:52, color:'#06b6d4',bg:'#ecfeff'},
    {name:'Trizeps',      icon:'💪',count:48, color:'#f59e0b',bg:'#fffbeb'},
    {name:'Beine',        icon:'🦵',count:138,color:'#22c55e',bg:'#f0fdf4'},
    {name:'Gesäß',        icon:'🍑',count:56, color:'#ec4899',bg:'#fdf2f8'},
    {name:'Bauch/Core',   icon:'🎯',count:82, color:'#6366f1',bg:'#eef2ff'},
    {name:'Waden',        icon:'🦶',count:34, color:'#14b8a6',bg:'#f0fdfa'},
    {name:'Cardio',       icon:'🏃',count:65, color:'#f97316',bg:'#fff7ed'},
    {name:'Dehnung',      icon:'🧘',count:88, color:'#a855f7',bg:'#faf5ff'},
    {name:'Ganzkörper',   icon:'🔥',count:47, color:'#ef4444',bg:'#fef2f2'},
  ];
  const equips = [
    {name:'Langhantel',     icon:'🏋️',count:312},{name:'Kurzhantel',    icon:'🥊',count:198},
    {name:'Kabelzug',       icon:'🔗',count:156},{name:'Bodyweight',    icon:'🤸',count:234},
    {name:'Bänder',         icon:'📎',count:89}, {name:'Kettlebell',    icon:'🔔',count:72},
    {name:'Maschinen',      icon:'⚙️',count:145},{name:'Klimmzugstange',icon:'🧗',count:28},
  ];

  return `
    <div style="display:flex;flex-direction:column;gap:14px">

      <div class="card">
        <div class="card-header"><div class="card-title">💪 Nach Muskelgruppe</div><div class="badge badge-gray">1.200+ Übungen</div></div>
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px">
          ${cats.map(c=>`
            <div style="background:${c.bg};border-radius:var(--r-md);padding:12px 10px;text-align:center;cursor:pointer;border:1px solid ${c.color}20;transition:var(--transition-fast)">
              <div style="font-size:22px;margin-bottom:4px">${c.icon}</div>
              <div style="font-size:var(--text-xs);font-weight:var(--fw-semibold);color:var(--text-primary);margin-bottom:2px">${c.name}</div>
              <div style="font-size:var(--text-micro);color:${c.color};font-weight:var(--fw-bold)">${c.count} Übungen</div>
            </div>`).join('')}
        </div>
      </div>

      <div class="card">
        <div class="card-header"><div class="card-title">🏗️ Nach Equipment</div></div>
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px">
          ${equips.map(e=>`
            <div style="background:var(--surface-card-alt);border-radius:var(--r-md);padding:10px 6px;text-align:center;cursor:pointer;border:1px solid var(--surface-border)">
              <div style="font-size:18px;margin-bottom:3px">${e.icon}</div>
              <div style="font-size:var(--text-micro);font-weight:var(--fw-medium);color:var(--text-primary)">${e.name}</div>
              <div style="font-size:9px;color:var(--text-muted)">${e.count}</div>
            </div>`).join('')}
        </div>
      </div>

      <div class="card">
        <div class="card-header"><div class="card-title">🏆 Top Übungen nach Effektivität</div><div class="badge badge-blue">SFR-Score</div></div>
        ${[
          {n:'Kreuzheben',        score:98,cats:'Rücken · Beine · Core'},
          {n:'Kniebeugen',        score:96,cats:'Beine · Gesäß'},
          {n:'Klimmzüge',         score:95,cats:'Rücken · Bizeps'},
          {n:'Bankdrücken',       score:94,cats:'Brust · Schultern · Trizeps'},
          {n:'Schulterdrücken LH',score:91,cats:'Schultern · Trizeps'},
          {n:'Langhantel Rudern', score:89,cats:'Rücken · Bizeps · Trapez'},
        ].map((ex,i)=>`
          <div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--surface-border)">
            <div style="width:22px;height:22px;border-radius:50%;background:${i<3?'var(--accent-training)':'var(--surface-hover)'};display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;color:${i<3?'#fff':'var(--text-muted)'};flex-shrink:0">${i+1}</div>
            <div style="flex:1">
              <div style="font-size:var(--text-xs);font-weight:var(--fw-semibold);color:var(--text-primary)">${ex.n}</div>
              <div style="font-size:var(--text-micro);color:var(--text-muted)">${ex.cats}</div>
            </div>
            <div style="font-size:var(--text-xs);font-weight:var(--fw-bold);color:${ex.score>=95?'var(--brand-700)':'#f59e0b'}">${ex.score}/100</div>
          </div>`).join('')}
      </div>
    </div>
  `;
};
