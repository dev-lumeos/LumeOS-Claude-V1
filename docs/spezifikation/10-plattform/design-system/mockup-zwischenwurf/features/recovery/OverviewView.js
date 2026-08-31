// features/recovery/OverviewView.js — REBUILD
// MorningCheckin (compact), RecoveryScore (donut), RecoveryPromptCard, Schlaf-Summary, Vitals

window.Recovery_OverviewView = function() {
  const score = 78;
  const scoreColor = score>=80?'var(--brand-500)':score>=60?'#f59e0b':'#ef4444';
  const scoreLabel = score>=80?'Gut erholt':'Moderat erholt';
  const pct = score; // conic gradient percentage

  const checkinFields = [
    {icon:'😴',label:'Schlafqualität',val:7,max:10,stars:true},
    {icon:'⚡',label:'Energie heute',  val:7,max:10,stars:true},
    {icon:'😊',label:'Stimmung',       val:8,max:10,stars:true},
    {icon:'💪',label:'Muskelkater',    val:3,max:5, stars:true,invert:true},
    {icon:'🧠',label:'Stress',         val:2,max:5, stars:true,invert:true},
  ];

  return `
    <div style="background:var(--gradient-recovery);border-radius:var(--r-lg);padding:16px 20px;color:#fff;display:flex;align-items:center;gap:20px">
      <div style="position:relative;width:88px;height:88px;flex-shrink:0">
        <div style="width:88px;height:88px;border-radius:50%;background:conic-gradient(rgba(255,255,255,.9) 0% ${pct}%,rgba(255,255,255,.2) ${pct}% 100%)"></div>
        <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:64px;height:64px;border-radius:50%;background:rgba(59,130,246,.7);display:flex;flex-direction:column;align-items:center;justify-content:center">
          <div style="font-size:22px;font-weight:var(--fw-bold);color:#fff;line-height:1">${score}</div>
          <div style="font-size:var(--text-micro);color:rgba(255,255,255,.75)">Score</div>
        </div>
      </div>
      <div style="flex:1">
        <div style="font-size:var(--text-xl);font-weight:var(--fw-bold);color:#fff;margin-bottom:2px">${scoreLabel}</div>
        <div style="font-size:var(--text-xs);color:rgba(255,255,255,.8)">Moderates Training empfohlen · Tiefschlaf ↑ über Baseline</div>
        <div style="display:flex;gap:8px;margin-top:8px">
          ${[{l:'HRV',v:'58ms',ok:true},{l:'Puls',v:'52bpm',ok:true},{l:'SpO₂',v:'97%',ok:true}].map(k=>`
            <div style="background:rgba(255,255,255,.15);border-radius:var(--r-sm);padding:4px 8px;text-align:center">
              <div style="font-size:11px;font-weight:700;color:#fff">${k.v}</div>
              <div style="font-size:9px;color:rgba(255,255,255,.65)">${k.l}</div>
            </div>`).join('')}
        </div>
      </div>
    </div>

    <div class="card" style="border:1px solid var(--brand-200)">
      <div class="card-header"><div class="card-title">🌅 Morgen-Check-in</div><div class="badge badge-green">abgeschlossen</div></div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
        ${checkinFields.map(f=>`
          <div style="background:var(--surface-card-alt);border-radius:var(--r-md);padding:10px;border:1px solid var(--surface-border)">
            <div style="font-size:var(--text-micro);color:var(--text-muted);margin-bottom:4px">${f.icon} ${f.label}</div>
            <div style="display:flex;gap:2px">
              ${Array.from({length:f.max},(_,i)=>`
                <div style="width:${Math.floor(80/f.max)}px;height:6px;border-radius:2px;background:${i<f.val?(f.invert?i<3?'var(--brand-500)':'#f59e0b':'var(--brand-500)'):'var(--surface-hover)'}"></div>`).join('')}
            </div>
            <div style="font-size:var(--text-xs);font-weight:var(--fw-bold);color:${f.invert&&f.val>3?'#f59e0b':'var(--brand-700)'};margin-top:4px">${f.val}/${f.max}</div>
          </div>`).join('')}
        <div style="background:var(--surface-card-alt);border-radius:var(--r-md);padding:10px;border:1px solid var(--surface-border)">
          <div style="font-size:var(--text-micro);color:var(--text-muted);margin-bottom:4px">😄 Stimmung</div>
          <div style="display:flex;gap:4px;flex-wrap:wrap">
            ${['😴','😊','😐','😩'].map((e,i)=>`<span style="font-size:18px;opacity:${i===1?1:.3};cursor:pointer">${e}</span>`).join('')}
          </div>
          <div style="font-size:var(--text-micro);color:var(--brand-700);margin-top:4px;font-weight:600">😊 Gut</div>
        </div>
      </div>
    </div>

    <div class="ai-card" style="max-width:100%;background:linear-gradient(135deg,#eff6ff,#eef2ff)">
      <div class="ai-card-title">🤖 Recovery Empfehlung</div>
      <div class="ai-card-text">Score 78/100 — gut erholt. HRV 4ms über Baseline, Tiefschlaf 7min über Ø.<br><strong>Heute:</strong> Push Day möglich, aber Volumen bei 80% halten. Bankdrücken max. 3×8 statt 4×8.</div>
      <div class="ai-actions">
        <div class="ai-btn ai-btn-primary">Training anpassen</div>
        <div class="ai-btn ai-btn-secondary">Details</div>
      </div>
    </div>

    <div class="card">
      <div class="card-header"><div class="card-title">Schlafphasen — letzte Nacht</div><div class="card-meta">7h 24min · Effizienz 91%</div></div>
      <div style="display:flex;height:40px;border-radius:6px;overflow:hidden;gap:1px;margin-bottom:8px">
        ${[{w:5,c:'#e0e7ff',l:'Wach'},{w:10,c:'#93c5fd',l:'Leicht'},{w:28,c:'var(--accent-recovery)',l:'Tief'},{w:15,c:'#6366f1',l:'REM'},{w:18,c:'#93c5fd',l:'Leicht'},{w:24,c:'var(--accent-recovery)',l:'Tief'}].map(p=>`
          <div style="flex:${p.w};background:${p.c};height:100%"></div>`).join('')}
      </div>
      <div style="display:flex;gap:12px;flex-wrap:wrap">
        ${[{c:'var(--accent-recovery)',l:'Tiefschlaf 1h 42m'},{c:'#6366f1',l:'REM 1h 18m'},{c:'#93c5fd',l:'Leichtschlaf 4h 06m'},{c:'#e0e7ff',l:'Wach 18m'}].map(p=>`
          <div style="display:flex;align-items:center;gap:5px;font-size:var(--text-micro);color:var(--text-secondary)">
            <div style="width:8px;height:8px;border-radius:2px;background:${p.c}"></div>${p.l}
          </div>`).join('')}
      </div>
    </div>

    <div class="card-grid">
      <div class="stat-card"><div class="stat-val">7h 24m</div><div class="stat-lbl">Schlafdauer 🌙</div><div class="stat-delta delta-up">↑ +13min vs. Ø</div></div>
      <div class="stat-card"><div class="stat-val">58ms</div><div class="stat-lbl">HRV (RMSSD)</div><div class="stat-delta delta-up">↑ +4ms vs. Ø</div></div>
      <div class="stat-card"><div class="stat-val">52 bpm</div><div class="stat-lbl">Ruhepuls 💓</div><div class="stat-delta delta-up">↓ -2 vs. Ø</div></div>
      <div class="stat-card"><div class="stat-val">91%</div><div class="stat-lbl">Schlaf-Effizienz</div><div class="stat-delta delta-up">↑ gut</div></div>
    </div>`;
};
