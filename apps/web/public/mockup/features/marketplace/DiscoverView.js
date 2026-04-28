// features/marketplace/DiscoverView.js
window.Marketplace_DiscoverView = function() {
  const apps = [
    {icon:'⌚', name:'Apple Health',     desc:'Wearable-Daten synchronisieren',    cat:'Wearable',  installed:true},
    {icon:'🏃', name:'Strava',           desc:'Lauf- und Radfahrdaten',            cat:'Sport',     installed:false},
    {icon:'🍎', name:'MyFitnessPal',     desc:'Lebensmitteldatenbank Import',      cat:'Ernährung', installed:false},
    {icon:'🛌', name:'Oura Ring',        desc:'Sleep & HRV Tracking',             cat:'Schlaf',    installed:true},
    {icon:'💓', name:'Whoop',            desc:'Recovery & Strain Tracking',       cat:'Wearable',  installed:false},
    {icon:'🔬', name:'Nutrium',          desc:'Professionelle Ernährungsberatung',cat:'Ernährung', installed:false},
  ];
  return `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
      ${apps.map(a=>`
        <div class="card" style="padding:14px">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
            <div style="width:36px;height:36px;border-radius:var(--r-md);background:var(--surface-hover);display:flex;align-items:center;justify-content:center;font-size:18px">${a.icon}</div>
            <div>
              <div style="font-size:var(--text-sm);font-weight:var(--fw-semibold);color:var(--text-primary)">${a.name}</div>
              <div class="badge badge-gray" style="font-size:9px">${a.cat}</div>
            </div>
          </div>
          <div style="font-size:var(--text-micro);color:var(--text-muted);margin-bottom:10px;line-height:1.4">${a.desc}</div>
          <div style="font-size:var(--text-micro);font-weight:var(--fw-semibold);color:${a.installed?'var(--brand-700)':'var(--semantic-info-text)'};cursor:pointer">
            ${a.installed?'✓ Installiert':'+ Installieren'}
          </div>
        </div>`).join('')}
    </div>
  `;
};
