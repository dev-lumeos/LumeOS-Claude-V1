// Sidebar.js
// Mirrors: src/components/shell/Sidebar.tsx
// Shell: Linke Navigation — Brand, Module-Links, System-Links, User

window.renderSidebar = function(activeModule) {
  const nav = (key, icon, label, badge) =>
    `<div class="nav-item${activeModule===key?' active':''}" id="nav-${key}" onclick="switchModule('${key}')">
      <span class="nav-icon">${icon}</span>${label}
      ${badge ? `<span class="nav-badge">${badge}</span>` : ''}
    </div>`;

  return `
  <nav class="sidebar" id="app-sidebar" style="
    width:var(--sidebar-width);min-width:var(--sidebar-width);
    background:var(--sidebar-bg);border-right:1px solid var(--sidebar-border);
    display:flex;flex-direction:column;overflow-y:auto;overflow-x:hidden;z-index:10;
  ">
    <div style="padding:18px 16px 14px;display:flex;align-items:center;gap:10px;border-bottom:1px solid var(--sidebar-border)">
      <div style="width:30px;height:30px;border-radius:var(--r-md);background:linear-gradient(135deg,var(--brand-500),var(--brand-600));display:flex;align-items:center;justify-content:center;font-size:15px;flex-shrink:0">🌱</div>
      <div>
        <div style="font-size:15px;font-weight:var(--fw-bold);color:var(--text-primary);letter-spacing:-.3px">LUMEOS</div>
        <div style="font-size:var(--text-micro);color:var(--brand-600);font-weight:var(--fw-semibold);letter-spacing:.5px;text-transform:uppercase">Health OS</div>
      </div>
    </div>

    <div class="sidebar-section" style="padding:16px 8px 4px">
      <div style="font-size:var(--text-micro);font-weight:var(--fw-semibold);text-transform:uppercase;letter-spacing:.06em;color:var(--text-muted);padding:0 8px;margin-bottom:4px">Übersicht</div>
      ${nav('dashboard','📊','Dashboard')}
    </div>

    <div class="sidebar-section" style="padding:16px 8px 4px">
      <div style="font-size:var(--text-micro);font-weight:var(--fw-semibold);text-transform:uppercase;letter-spacing:.06em;color:var(--text-muted);padding:0 8px;margin-bottom:4px">Module</div>
      ${nav('nutrition','🍽️','Ernährung')}
      ${nav('training','🏋️','Training')}
      ${nav('coach','🤖','AI Coach','3')}
      ${nav('goals','🎯','Ziele')}
      ${nav('supplements','💊','Supplements')}
      ${nav('recovery','😴','Recovery')}
      ${nav('medical','🩺','Medical')}
      ${nav('intelligence','🧠','Intelligence')}
    </div>

    <div class="sidebar-section" style="padding:16px 8px 4px">
      <div style="font-size:var(--text-micro);font-weight:var(--fw-semibold);text-transform:uppercase;letter-spacing:.06em;color:var(--text-muted);padding:0 8px;margin-bottom:4px">System</div>
      ${nav('analytics','📈','Analytics')}
      ${nav('marketplace','🛒','Marketplace')}
      ${nav('admin','⚙️','Admin')}
    </div>

    <div style="margin-top:auto;padding:12px 16px;border-top:1px solid var(--sidebar-border);display:flex;align-items:center;gap:10px">
      <div style="width:30px;height:30px;border-radius:var(--r-full);background:linear-gradient(135deg,#667eea,#764ba2);display:flex;align-items:center;justify-content:center;font-size:12px;color:#fff;font-weight:var(--fw-semibold);flex-shrink:0">TK</div>
      <div>
        <div style="font-size:var(--text-xs);font-weight:var(--fw-semibold);color:var(--text-primary)">Tom K.</div>
        <div style="font-size:11px;color:var(--text-muted)">Pro Plan · Koh Samui</div>
      </div>
    </div>
  </nav>`;
};

// CSS helper
document.head.insertAdjacentHTML('beforeend', `<style>
.sidebar-section { padding: 16px 8px 4px; }
.nav-item { display:flex;align-items:center;gap:10px;padding:7px 10px;border-radius:var(--r-md);cursor:pointer;transition:var(--transition-colors);color:var(--sidebar-inactive-text);font-size:var(--text-sm);font-weight:var(--fw-normal);position:relative;user-select:none; }
.nav-item:hover { background:var(--sidebar-hover-bg);color:var(--text-secondary); }
.nav-item.active { background:var(--sidebar-active-bg);color:var(--sidebar-active-text);font-weight:var(--fw-medium); }
.nav-item.active::before { content:'';position:absolute;left:0;top:50%;transform:translateY(-50%);width:3px;height:60%;border-radius:0 3px 3px 0;background:var(--sidebar-active-bar); }
.nav-icon { font-size:16px;width:20px;text-align:center;flex-shrink:0; }
.nav-badge { margin-left:auto;font-size:var(--text-micro);font-weight:var(--fw-semibold);padding:1px 6px;border-radius:var(--r-full);background:var(--brand-100);color:var(--brand-700); }
</style>`);
