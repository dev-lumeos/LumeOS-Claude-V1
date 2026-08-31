// ModuleHeader.js
// Mirrors: src/components/shell/ModuleHeader.tsx
// Shell: Gradient-Header mit Icon, Titel, Beschreibung, KPI-Tiles (Glassmorphism)

window.renderModuleHeader = function(module) {
  const kpis = module.kpis.map(k =>
    `<div class="kpi-tile">
      <div class="kpi-val">${k.val}</div>
      <div class="kpi-lbl">${k.lbl}</div>
    </div>`
  ).join('');

  return `
  <div style="padding:20px var(--layout-content-pad) 0;flex-shrink:0">
    <div class="${module.gradient}" style="border-radius:var(--r-xl);padding:20px var(--layout-content-pad);position:relative;overflow:hidden">
      <div style="position:absolute;inset:0;background:linear-gradient(135deg,rgba(255,255,255,.08),rgba(255,255,255,0));pointer-events:none"></div>
      <div style="display:flex;align-items:flex-start;gap:14px">
        <div style="font-size:32px;flex-shrink:0;filter:drop-shadow(0 2px 4px rgba(0,0,0,.15))">${module.icon}</div>
        <div>
          <h1 style="font-size:var(--text-xl);font-weight:var(--fw-bold);color:var(--kpi-text);letter-spacing:-.3px">${module.title}</h1>
          <p style="font-size:var(--text-sm);color:rgba(255,255,255,.75);margin-top:2px">${module.desc}</p>
        </div>
      </div>
      <div style="display:flex;gap:10px;margin-top:16px">${kpis}</div>
    </div>
  </div>`;
};

document.head.insertAdjacentHTML('beforeend', `<style>
.kpi-tile { background:var(--kpi-tile-bg);backdrop-filter:blur(8px);border-radius:var(--r-lg);padding:10px 14px;flex:1;border:1px solid var(--kpi-tile-border); }
.kpi-val { font-size:17px;font-weight:var(--fw-bold);color:var(--kpi-text); }
.kpi-lbl { font-size:var(--text-micro);color:var(--kpi-label);margin-top:1px; }
</style>`);
