// features/intelligence/PatternsView.js
// Mirrors: src/features/intelligence/components/PatternsView.tsx
window.Intelligence_PatternsView = function() {
  const patterns = [
    {icon:'📅', name:'Montag-Tief',      freq:'8/8 Wochen',  conf:'100%', detail:'Health Score Mo Ø6 Punkte unter Wochenschnitt'},
    {icon:'🌙', name:'Spätes Essen → schlechter Schlaf', freq:'14/18 Fälle', conf:'78%', detail:'Mahlzeiten nach 21h → Tiefschlaf -18min im Schnitt'},
    {icon:'💪', name:'Bestes Training nach langer Nacht', freq:'22/26 Fälle', conf:'85%', detail:'Schlaf >7.5h → Workout-Leistung +12%'},
    {icon:'💊', name:'Supplement-Ausfall → HRV-Abfall', freq:'7/9 Fälle',   conf:'78%', detail:'Tage ohne Magnesium → HRV -6ms nächster Morgen'},
    {icon:'🍽️', name:'Hohe Protein-Tage → bessere Stimmung', freq:'18/24 Fälle', conf:'75%', detail:'Protein >160g korreliert mit höherem Wohlbefinden'},
  ];
  return `
    <div class="card">
      <div class="card-header"><div class="card-title">Erkannte Muster</div></div>
      ${patterns.map(p=>`
        <div style="display:flex;gap:10px;padding:10px 0;border-bottom:1px solid var(--surface-border)">
          <span style="font-size:20px;flex-shrink:0">${p.icon}</span>
          <div style="flex:1">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:3px">
              <div style="font-size:var(--text-xs);font-weight:var(--fw-semibold);color:var(--text-primary)">${p.name}</div>
              <div class="badge badge-green">${p.conf}</div>
            </div>
            <div style="font-size:var(--text-micro);color:var(--text-secondary);line-height:1.4">${p.detail}</div>
            <div style="font-size:var(--text-micro);color:var(--text-muted);margin-top:2px">Häufigkeit: ${p.freq}</div>
          </div>
        </div>`).join('')}
    </div>
  `;
};
