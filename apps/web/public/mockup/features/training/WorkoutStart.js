// features/training/WorkoutStart.js
// Training → Starten: Quick-Start Routine Cards, Recovery-Banner, Leeres Training, Live Workout

window.Training_WorkoutStart = function() {
  const routines = [
    {name:'PPL Push Day A',      tag:'Heute geplant', color:'var(--accent-training)',bg:'#fff7ed',muscles:'Brust · Schultern · Trizeps',dur:'~52min',sets:18,vol:'~11k kg',rec:78,hot:true},
    {name:'PPL Pull Day B',      tag:'Morgen',        color:'var(--accent-coach)',  bg:'#eff6ff',muscles:'Rücken · Bizeps · Trapez',    dur:'~48min',sets:16,vol:'~9.8k kg',rec:null},
    {name:'PPL Legs Day C',      tag:'Mi 29. Apr',    color:'var(--accent-goals)',  bg:'#f5f3ff',muscles:'Quad · Hamstrings · Gesäß',   dur:'~65min',sets:20,vol:'~16k kg',rec:null},
    {name:'Zone 2 Cardio 30min', tag:'Optional',      color:'var(--accent-supplements)',bg:'#f0fdf4',muscles:'Ausdauer · Fettverbrennung', dur:'30min', sets:0, vol:'—',      rec:null},
  ];

  return `
    <div style="background:linear-gradient(135deg,var(--accent-training),#ef4444);border-radius:var(--r-lg);padding:16px 20px;color:#fff;margin-bottom:2px">
      <div style="font-size:var(--text-micro);color:rgba(255,255,255,.65);text-transform:uppercase;letter-spacing:.08em;margin-bottom:4px">Training — 27. Apr 2026</div>
      <div style="font-size:var(--text-xl);font-weight:var(--fw-bold);margin-bottom:6px">Wähle dein Workout</div>
      <div style="display:flex;gap:8px">
        ${[{icon:'🔥',val:'12',lbl:'Streak'},{icon:'✅',val:'4/4',lbl:'KW17'},{icon:'📊',val:'82%',lbl:'Adherenz'}].map(k=>`
          <div style="background:rgba(255,255,255,.15);border-radius:var(--r-sm);padding:5px 10px">
            <div style="font-size:11px;font-weight:700">${k.icon} ${k.val}</div>
            <div style="font-size:9px;opacity:.7">${k.lbl}</div>
          </div>`).join('')}
      </div>
    </div>

    <div class="ai-card" style="max-width:100%;margin:0">
      <div class="ai-card-title">⚡ Recovery-basierte Empfehlung</div>
      <div class="ai-card-text">Recovery Score 78 · HRV 58ms · Tiefschlaf 1h42m — <strong>Push Day heute optimal</strong>. Rücken 72h erholt. Volumen bei 85% empfohlen.</div>
      <div class="ai-actions">
        <div class="ai-btn ai-btn-primary">Push Day starten</div>
        <div class="ai-btn ai-btn-secondary">Anderes wählen</div>
      </div>
    </div>

    <div style="display:flex;flex-direction:column;gap:8px">
      ${routines.map(r=>`
        <div style="border-radius:var(--r-lg);border:${r.hot?`2px solid ${r.color}`:`1px solid var(--surface-border)`};background:${r.bg};padding:14px 16px;cursor:pointer">
          <div style="display:flex;align-items:center;gap:10px">
            <div style="flex:1">
              <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px">
                <span style="font-size:var(--text-sm);font-weight:var(--fw-bold);color:var(--text-primary)">${r.name}</span>
                <span style="font-size:var(--text-micro);padding:1px 6px;border-radius:var(--r-full);background:${r.color}20;color:${r.color};border:1px solid ${r.color}40;font-weight:600">${r.tag}</span>
                ${r.hot?`<span style="font-size:var(--text-micro);padding:1px 6px;border-radius:var(--r-full);background:var(--accent-training);color:#fff">🔥 Jetzt</span>`:''}
              </div>
              <div style="font-size:var(--text-micro);color:var(--text-muted);margin-bottom:4px">${r.muscles}</div>
              <div style="display:flex;gap:10px">
                ${[{v:r.dur,l:'Dauer'},{v:r.sets||'—',l:'Sätze'},{v:r.vol,l:'Volumen'}].map(s=>`
                  <span style="font-size:var(--text-micro);color:var(--text-secondary)"><strong>${s.v}</strong> ${s.l}</span>`).join('')}
              </div>
            </div>
            <div style="font-size:var(--text-sm);font-weight:var(--fw-bold);padding:8px 16px;border-radius:var(--r-md);background:${r.color};color:#fff;cursor:pointer;white-space:nowrap;flex-shrink:0">
              ▶ Start
            </div>
          </div>
        </div>`).join('')}
    </div>

    <div style="text-align:center;margin-top:4px">
      <div style="display:inline-flex;align-items:center;gap:6px;font-size:var(--text-xs);color:var(--text-secondary);padding:10px 20px;border-radius:var(--r-md);border:1px dashed var(--surface-border);cursor:pointer;background:var(--surface-card)">
        + Leeres Training starten
      </div>
    </div>
  `;
};
