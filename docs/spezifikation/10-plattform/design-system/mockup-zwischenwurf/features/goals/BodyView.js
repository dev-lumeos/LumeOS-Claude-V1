// features/goals/BodyView.js
// Ziele · Körper: Stats-Grid, RatiosCard (Taille/Hüfte/Schulter), Umfang-Tabelle, Verlauf

window.Goals_BodyView = function() {
  return `
    <div class="card-grid">
      <div style="background:linear-gradient(135deg,#eff6ff,#dbeafe);border-radius:var(--r-md);padding:14px;text-align:center;border:1px solid #bfdbfe">
        <div style="font-size:26px;font-weight:var(--fw-bold);color:#1d4ed8">85.2</div>
        <div style="font-size:var(--text-xs);color:#1d4ed8;font-weight:var(--fw-medium)">kg Gewicht</div>
        <div style="font-size:var(--text-micro);color:#3b82f6;margin-top:2px">↓ -0.6 diese Woche</div>
      </div>
      <div style="background:linear-gradient(135deg,#fff7ed,#ffedd5);border-radius:var(--r-md);padding:14px;text-align:center;border:1px solid #fed7aa">
        <div style="font-size:26px;font-weight:var(--fw-bold);color:#c2410c">~18%</div>
        <div style="font-size:var(--text-xs);color:#c2410c;font-weight:var(--fw-medium)">Körperfett</div>
        <div style="font-size:var(--text-micro);color:#ea580c;margin-top:2px">↓ -0.5% Monat</div>
      </div>
      <div style="background:linear-gradient(135deg,#f0fdf4,#dcfce7);border-radius:var(--r-md);padding:14px;text-align:center;border:1px solid #bbf7d0">
        <div style="font-size:26px;font-weight:var(--fw-bold);color:#15803d">69.9</div>
        <div style="font-size:var(--text-xs);color:#15803d;font-weight:var(--fw-medium)">kg Muskelmasse</div>
        <div style="font-size:var(--text-micro);color:#16a34a;margin-top:2px">↑ +0.3 Monat</div>
      </div>
      <div style="background:linear-gradient(135deg,#faf5ff,#ede9fe);border-radius:var(--r-md);padding:14px;text-align:center;border:1px solid #ddd6fe">
        <div style="font-size:26px;font-weight:var(--fw-bold);color:#7c3aed">21.1</div>
        <div style="font-size:var(--text-xs);color:#7c3aed;font-weight:var(--fw-medium)">FFMI</div>
        <div style="font-size:var(--text-micro);color:#8b5cf6;margin-top:2px">Good · Ziel: 23</div>
      </div>
    </div>

    <div class="card">
      <div class="card-header"><div class="card-title">📐 Körper-Ratios</div><div class="badge badge-green">optimal</div></div>
      ${[
        {name:'Taille / Hüfte',    val:'0.87',ref:'< 0.90',status:'✅',note:'84cm / 97cm'},
        {name:'Schulter / Taille', val:'1.31',ref:'> 1.25',status:'✅',note:'110cm / 84cm (Schätzung)'},
        {name:'Oberschenkel / Hüfte',val:'0.62',ref:'0.60-0.65',status:'✅',note:'60cm / 97cm'},
      ].map(r=>`
        <div class="data-row">
          <div>
            <div class="data-label">${r.name}</div>
            <div style="font-size:var(--text-micro);color:var(--text-muted)">${r.note} · Ref: ${r.ref}</div>
          </div>
          <div style="display:flex;align-items:center;gap:6px">
            <div style="font-size:var(--text-sm);font-weight:var(--fw-bold);color:var(--brand-700)">${r.val}</div>
            <span>${r.status}</span>
          </div>
        </div>`).join('')}
    </div>

    <div class="card">
      <div class="card-header"><div class="card-title">Körperumfänge — 27. Apr 2026</div></div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
        ${[
          {name:'Taille',    val:'84 cm', prev:'85 cm', up:true},
          {name:'Hüfte',     val:'97 cm', prev:'97.5 cm',up:true},
          {name:'Brust',     val:'102 cm',prev:'101 cm', up:false},
          {name:'Schulter',  val:'110 cm',prev:'109 cm', up:false},
          {name:'Oberarm L', val:'38 cm', prev:'37.5 cm',up:false},
          {name:'Oberarm R', val:'38.5 cm',prev:'38 cm', up:false},
          {name:'Oberschenkel L',val:'60 cm',prev:'59 cm',up:false},
          {name:'Oberschenkel R',val:'60.5 cm',prev:'59.5 cm',up:false},
        ].map(m=>`
          <div style="background:var(--surface-card-alt);border-radius:var(--r-md);padding:10px;border:1px solid var(--surface-border)">
            <div style="font-size:var(--text-micro);color:var(--text-muted);margin-bottom:2px">${m.name}</div>
            <div style="font-size:var(--text-sm);font-weight:var(--fw-bold);color:${m.up?'var(--brand-700)':'var(--semantic-danger-text)'}">${m.val}</div>
            <div style="font-size:var(--text-micro);color:var(--text-muted)">${m.up?'↓':'↑'} war ${m.prev}</div>
          </div>`).join('')}
      </div>
    </div>

    <div class="card">
      <div class="card-header"><div class="card-title">Gewichtsverlauf</div></div>
      <div style="display:flex;align-items:flex-end;height:56px;gap:5px;margin-bottom:6px">
        ${[88.2,87.8,87.4,87.1,86.8,86.4,86.1,85.8,85.2].map((v,i)=>`
          <div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:1px">
            <div style="width:100%;background:${i===8?'var(--brand-600)':'var(--brand-200)'};border-radius:2px 2px 0 0;height:${((v-84.5)/(88.5-84.5))*52}px"></div>
            ${i%3===0?`<div style="font-size:8px;color:var(--text-muted)">${v}</div>`:''}
          </div>`).join('')}
      </div>
      <div style="display:flex;justify-content:space-between;font-size:var(--text-micro);color:var(--text-muted)">
        <span>1. Apr</span><span>Ziel: 82 kg</span><span>Heute: 85.2 kg</span>
      </div>
    </div>
  `;
};
