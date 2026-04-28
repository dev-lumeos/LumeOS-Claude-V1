// features/analytics/ChartsView.js
window.Analytics_ChartsView = function() {
  const hours = Array.from({length:24},(_,i)=>i);
  const days = ['Mo','Di','Mi','Do','Fr','Sa','So'];
  const getActivity = (h,d) => {
    if(h<6||h>22) return 0;
    if(h>=6&&h<=8) return d<5?3:1;
    if(h>=12&&h<=13) return 2;
    if(h>=17&&h<=20) return d<5?4:3;
    return 1;
  };
  const colors = ['var(--surface-hover)','var(--brand-100)','var(--brand-200)','var(--brand-400,var(--brand-500))','var(--brand-600)'];
  return `
    <div class="card">
      <div class="card-header"><div class="card-title">Aktivitäts-Heatmap (Stunden × Wochentag)</div></div>
      <div style="display:grid;grid-template-columns:24px repeat(7,1fr);gap:2px;margin-bottom:6px">
        <div></div>
        ${days.map(d=>`<div style="font-size:var(--text-micro);color:var(--text-muted);text-align:center">${d}</div>`).join('')}
      </div>
      ${[6,8,10,12,14,16,18,20,22].map(h=>`
        <div style="display:grid;grid-template-columns:24px repeat(7,1fr);gap:2px;margin-bottom:2px">
          <div style="font-size:8px;color:var(--text-muted);display:flex;align-items:center">${h}h</div>
          ${days.map((_,d)=>`<div style="aspect-ratio:1.5;border-radius:2px;background:${colors[getActivity(h,d)]}"></div>`).join('')}
        </div>`).join('')}
      <div style="display:flex;gap:8px;margin-top:8px;align-items:center;font-size:var(--text-micro);color:var(--text-muted)">
        <span>Wenig</span>
        ${colors.map(c=>`<div style="width:12px;height:12px;border-radius:2px;background:${c}"></div>`).join('')}
        <span>Viel</span>
      </div>
    </div>
  `;
};
