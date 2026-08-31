// features/marketplace/FeaturedView.js
window.Marketplace_FeaturedView = function() {
  return `
    ${[
      {icon:'🧬', name:'Kontinuierliche Glukose',    desc:'CGM-Daten direkt in LUMEOS. Echtzeit-Glukose, Insulin-Sensitivität und Ernährungs-Feedback.', tag:'Neu'},
      {icon:'🧠', name:'Neuro Performance',           desc:'HRV-basiertes Kognitions-Tracking. Beste Zeiten für Deep Work basierend auf deinen Biomarkern.', tag:'Featured'},
      {icon:'💆', name:'Stress & Mindfulness',        desc:'Integriertes Atemübungen-Modul mit HRV-Biofeedback und geführten Meditationen.', tag:'Popular'},
    ].map(a=>`
      <div class="card" style="border:2px solid var(--surface-border)">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">
          <div style="width:44px;height:44px;border-radius:var(--r-lg);background:var(--surface-hover);display:flex;align-items:center;justify-content:center;font-size:22px">${a.icon}</div>
          <div>
            <div style="font-size:var(--text-sm);font-weight:var(--fw-bold);color:var(--text-primary)">${a.name}</div>
            <div class="badge badge-blue" style="font-size:9px">${a.tag}</div>
          </div>
        </div>
        <div style="font-size:var(--text-xs);color:var(--text-secondary);line-height:1.5;margin-bottom:12px">${a.desc}</div>
        <div style="font-size:var(--text-xs);font-weight:var(--fw-semibold);color:var(--semantic-info-text);cursor:pointer">+ Jetzt installieren</div>
      </div>`).join('')}
  `;
};
