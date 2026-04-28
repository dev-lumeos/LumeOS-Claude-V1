// features/recovery/HRVView.js
// Mirrors: src/features/recovery/components/HRVView.tsx
window.Recovery_HRVView = function() {
  const hrv = [52,55,49,58,54,61,57,53,59,62,56,58,54,60,57,52,61,58,55,63,59,56,62,58,54,61,57,53,59,58];
  const baseline = 54;
  const max = Math.max(...hrv);
  return `
    <div class="card">
      <div class="card-header"><div class="card-title">HRV — 30 Tage (RMSSD)</div></div>
      <div style="display:flex;align-items:flex-end;height:72px;gap:2px;margin-bottom:6px;position:relative">
        <div style="position:absolute;bottom:${(baseline/max)*68}px;left:0;right:0;height:1px;background:rgba(234,179,8,.6);border-top:1px dashed rgba(234,179,8,.6)"></div>
        ${hrv.map((v,i)=>`
          <div style="flex:1;background:${v>=60?'var(--accent-coach)':v>=54?'var(--accent-recovery)':'#fca5a5'};border-radius:1px 1px 0 0;height:${(v/max)*68}px"></div>`).join('')}
      </div>
      <div style="display:flex;justify-content:space-between;font-size:var(--text-micro);color:var(--text-muted)">
        <span>29. März</span><span>Baseline: ${baseline}ms</span><span>Heute: ${hrv[hrv.length-1]}ms</span>
      </div>
    </div>
    <div class="card-grid">
      <div class="stat-card"><div class="stat-val">${hrv[hrv.length-1]}ms</div><div class="stat-lbl">Heute</div><div class="stat-delta delta-up">↑ über Baseline</div></div>
      <div class="stat-card"><div class="stat-val">${Math.round(hrv.reduce((a,b)=>a+b)/hrv.length)}ms</div><div class="stat-lbl">Ø 30 Tage</div></div>
      <div class="stat-card"><div class="stat-val">${max}ms</div><div class="stat-lbl">Maximum</div></div>
      <div class="stat-card"><div class="stat-val">${Math.min(...hrv)}ms</div><div class="stat-lbl">Minimum</div></div>
    </div>
    <div class="card">
      <div class="card-header"><div class="card-title">Interpretation</div></div>
      <div style="font-size:var(--text-xs);color:var(--text-secondary);line-height:1.6">
        HRV von <strong>58ms</strong> liegt <strong>+4ms über deiner Baseline</strong> — gutes Zeichen für Erholungsbereitschaft.<br><br>
        🟢 HRV ≥60ms: Hohe Intensität möglich<br>
        🟡 HRV 50-60ms: Normales Training<br>
        🔴 HRV &lt;50ms: Regeneration empfohlen
      </div>
    </div>
  `;
};
