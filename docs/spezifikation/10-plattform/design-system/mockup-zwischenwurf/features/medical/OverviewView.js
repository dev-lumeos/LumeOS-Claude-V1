// features/medical/OverviewView.js
// Mirrors: src/features/medical/components/OverviewView.tsx
window.Medical_OverviewView = function() {
  const areas = [
    {icon:'❤️', name:'Herz-Kreislauf', status:'gut',    note:'Letzter Check: März 2026'},
    {icon:'🩸', name:'Blutbild',        status:'gut',    note:'Alle Werte im Normbereich'},
    {icon:'🦋', name:'Schilddrüse',     status:'normal', note:'TSH 1.8 mU/L (Norm: 0.5-4.5)'},
    {icon:'💛', name:'Leber/Niere',     status:'gut',    note:'GOT, GPT, Kreatinin normal'},
  ];
  const statusColor = {gut:'badge-green', normal:'badge-blue', prüfen:'badge-orange'};
  return `
    <div class="card">
      <div class="card-header"><div class="card-title">Gesundheitsstatus</div><div style="font-size:var(--text-micro);color:var(--text-muted)">März 2026</div></div>
      ${areas.map(a=>`
        <div style="display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid var(--surface-border)">
          <span style="font-size:20px">${a.icon}</span>
          <div style="flex:1">
            <div style="font-size:var(--text-sm);font-weight:var(--fw-medium);color:var(--text-primary)">${a.name}</div>
            <div style="font-size:var(--text-micro);color:var(--text-muted)">${a.note}</div>
          </div>
          <div class="badge ${statusColor[a.status]}">${a.status}</div>
        </div>`).join('')}
    </div>
    <div class="card">
      <div class="card-header"><div class="card-title">Checkup-Verlauf</div></div>
      ${[
        {date:'März 2026', type:'Blutbild komplett', doc:'Dr. Müller'},
        {date:'Jan 2026',  type:'Sportmedizin Check', doc:'Dr. Klein'},
        {date:'Nov 2025',  type:'Schilddrüse + Leber', doc:'Dr. Müller'},
      ].map(c=>`
        <div class="data-row">
          <div>
            <div class="data-label">${c.type}</div>
            <div style="font-size:var(--text-micro);color:var(--text-muted)">${c.date} · ${c.doc}</div>
          </div>
          <div class="badge badge-green">✓</div>
        </div>`).join('')}
    </div>
  `;
};
