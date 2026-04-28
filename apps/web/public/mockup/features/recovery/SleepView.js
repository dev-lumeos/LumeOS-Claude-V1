// features/recovery/SleepView.js
// Mirrors: src/features/recovery/components/SleepView.tsx
window.Recovery_SleepView = function() {
  const nights = [
    {day:'Mo',h:7.2,deep:1.3,rem:1.1,quality:74},
    {day:'Di',h:6.8,deep:1.1,rem:0.9,quality:68},
    {day:'Mi',h:7.5,deep:1.5,rem:1.2,quality:80},
    {day:'Do',h:8.1,deep:1.8,rem:1.4,quality:88},
    {day:'Fr',h:6.9,deep:1.2,rem:1.0,quality:70},
    {day:'Sa',h:7.4,deep:1.7,rem:1.3,quality:82},
    {day:'So',h:7.4,deep:1.7,rem:1.3,quality:78},
  ];
  const maxH = Math.max(...nights.map(n=>n.h));
  return `
    <div class="card">
      <div class="card-header"><div class="card-title">Schlaf-Qualität (7 Tage)</div></div>
      <div style="display:flex;align-items:flex-end;height:72px;gap:6px;margin-bottom:6px">
        ${nights.map((n,i)=>`
          <div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:3px">
            <div style="width:100%;background:${n.quality>=80?'var(--accent-recovery)':n.quality>=70?'#93c5fd':'#fca5a5'};border-radius:3px 3px 0 0;height:${(n.h/maxH)*64}px"></div>
            <div style="font-size:9px;color:var(--text-muted)">${n.day}</div>
          </div>`).join('')}
      </div>
      <div style="display:flex;justify-content:space-between;font-size:var(--text-micro);color:var(--text-muted)">
        <span>Ø: 7h 19min</span><span>Beste Nacht: Do 8h 06min</span>
      </div>
    </div>
    <div class="card">
      <div class="card-header"><div class="card-title">Schlafzeiten</div></div>
      ${nights.slice(-3).map(n=>`
        <div class="data-row">
          <div class="data-label">${n.day}</div>
          <div style="text-align:right">
            <div class="data-val">${n.h}h · Tiefschlaf ${n.deep}h · REM ${n.rem}h</div>
          </div>
        </div>`).join('')}
    </div>
    <div class="card">
      <div class="card-header"><div class="card-title">Insights</div></div>
      <div style="font-size:var(--text-xs);color:var(--text-secondary);line-height:1.6">
        Dein Tiefschlaf-Anteil ist <strong>23%</strong> (Ø: 19%). Ashwagandha abends korreliert mit +15min Tiefschlaf.
        <br><br>💡 Einschlafzeit optimal: 22:30 Uhr. Tatsächlich: 22:45 Uhr Ø.
      </div>
    </div>
  `;
};
