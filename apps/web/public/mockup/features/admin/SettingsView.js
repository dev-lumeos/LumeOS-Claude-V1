// features/admin/SettingsView.js
window.Admin_SettingsView = function() {
  const modules = [
    {key:'nutrition',    label:'🍽️ Ernährung',   active:true},
    {key:'training',     label:'🏋️ Training',    active:true},
    {key:'coach',        label:'🤖 AI Coach',     active:true},
    {key:'goals',        label:'🎯 Ziele',        active:true},
    {key:'supplements',  label:'💊 Supplements',  active:true},
    {key:'recovery',     label:'😴 Recovery',     active:true},
    {key:'medical',      label:'🩺 Medical',      active:true},
    {key:'intelligence', label:'🧠 Intelligence', active:true},
    {key:'analytics',    label:'📈 Analytics',    active:true},
    {key:'marketplace',  label:'🛒 Marketplace',  active:true},
    {key:'admin',        label:'⚙️ Admin',        active:true},
  ];
  return `
    <div class="card">
      <div class="card-header"><div class="card-title">Module</div></div>
      ${modules.map(m=>`
        <div style="display:flex;align-items:center;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--surface-border)">
          <div style="font-size:var(--text-sm);color:var(--text-primary)">${m.label}</div>
          <div style="width:36px;height:20px;border-radius:10px;background:${m.active?'var(--brand-500)':'var(--surface-border)'};position:relative;cursor:pointer">
            <div style="width:16px;height:16px;border-radius:50%;background:#fff;position:absolute;top:2px;${m.active?'right:2px':'left:2px'};box-shadow:0 1px 3px rgba(0,0,0,.2)"></div>
          </div>
        </div>`).join('')}
    </div>
    <div class="card">
      <div class="card-header"><div class="card-title">Erscheinungsbild</div></div>
      <div class="data-row"><div class="data-label">Theme</div><div class="badge badge-green">Light (Standard)</div></div>
      <div class="data-row"><div class="data-label">Sprache</div><div class="data-val">Deutsch</div></div>
      <div class="data-row"><div class="data-label">Einheiten</div><div class="data-val">Metrisch (kg, cm)</div></div>
    </div>
  `;
};
