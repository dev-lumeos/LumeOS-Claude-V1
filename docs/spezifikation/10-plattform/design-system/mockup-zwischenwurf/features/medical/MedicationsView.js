// features/medical/MedicationsView.js
// Mirrors: src/features/medical/components/MedicationsView.tsx
window.Medical_MedicationsView = function() {
  return `
    <div class="card">
      <div class="card-header"><div class="card-title">Aktive Einnahmen</div></div>
      ${[
        {name:'Vitamin D3 5000 IU', type:'Supplement', freq:'täglich morgens', since:'Jan 2026'},
        {name:'Omega-3 2g EPA/DHA', type:'Supplement', freq:'täglich morgens', since:'Jan 2026'},
      ].map(m=>`
        <div style="display:flex;gap:10px;padding:10px 0;border-bottom:1px solid var(--surface-border)">
          <div style="width:8px;height:8px;border-radius:50%;background:var(--brand-500);flex-shrink:0;margin-top:4px"></div>
          <div style="flex:1">
            <div style="font-size:var(--text-sm);font-weight:var(--fw-medium);color:var(--text-primary)">${m.name}</div>
            <div style="font-size:var(--text-micro);color:var(--text-muted)">${m.type} · ${m.freq} · seit ${m.since}</div>
          </div>
          <div class="badge badge-green">aktiv</div>
        </div>`).join('')}
    </div>
    <div class="card">
      <div class="card-header"><div class="card-title">Keine Medikamente</div></div>
      <div style="padding:20px 0;text-align:center;color:var(--text-muted);font-size:var(--text-sm)">✅ Keine verschreibungspflichtigen Medikamente</div>
    </div>
  `;
};
