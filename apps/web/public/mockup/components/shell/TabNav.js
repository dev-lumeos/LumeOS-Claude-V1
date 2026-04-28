// TabNav.js
// Mirrors: src/components/shell/TabNav.tsx
// Shell: Horizontale Tab-Navigation mit Accent-Color je Modul

window.renderTabNav = function(module, activeTab) {
  const tabs = module.tabs.map((t, i) =>
    `<div class="tab-btn${i === activeTab ? ' active' : ''}" onclick="switchTab(${i})">${t}</div>`
  ).join('');

  return `
  <div style="display:flex;gap:4px;padding:14px var(--layout-content-pad) 0;border-bottom:1px solid var(--surface-border);overflow-x:auto;flex-shrink:0;-ms-overflow-style:none;scrollbar-width:none">
    ${tabs}
  </div>`;
};

document.head.insertAdjacentHTML('beforeend', `<style>
.tab-btn { display:flex;align-items:center;gap:6px;padding:7px 14px;border-radius:var(--r-md) var(--r-md) 0 0;cursor:pointer;font-size:var(--text-xs);font-weight:var(--fw-medium);color:var(--text-tertiary);transition:var(--transition-fast);border:1px solid transparent;border-bottom:none;white-space:nowrap;user-select:none;margin-bottom:-1px;background:transparent; }
.tab-btn:hover { color:var(--text-secondary);background:var(--surface-hover); }
.tab-btn.active { background:var(--surface-card);border-color:var(--surface-border);color:var(--brand-700); }
</style>`);
