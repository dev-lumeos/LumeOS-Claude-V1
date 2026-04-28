// features/training/BodyComposition.js
// Training → Körper: Stats-Grid, Gewicht/KFA-Charts, Lean vs Fat, Ratios, Messungen

window.Training_BodyComposition = function() {
  const current = {weight:85.2,bf:18.0,lean:69.9,ffmi:21.1,waist:84,hip:97};
  const wData = [88.2,87.8,87.4,87.1,86.8,86.4,86.1,85.8,85.2];
  const bfData = [19.5,19.2,19.0,18.8,18.5,18.3,18.1,18.0,18.0];
  const history = [
    {date:'27. Apr',w:85.2,bf:18.0,note:'Wochenmessung'},
    {date:'20. Apr',w:85.8,bf:18.3,note:''},
    {date:'13. Apr',w:86.4,bf:18.6,note:'Monatsmessung'},
    {date:'1. Apr', w:87.2,bf:19.0,note:'Monatsstart'},
  ];
  const maxW = Math.max(...wData), minW = Math.min(...wData);
  const maxBF= Math.max(...bfData),minBF= Math.min(...bfData);

  return `
    <div style="display:grid;grid-template-columns:1fr 280px;gap:16px;align-items:start">
      <div style="display:flex;flex-direction:column;gap:12px">

        <div class="card-grid" style="margin-bottom:0">
          ${[
            {l:'Gewicht',v:`${current.weight}`,u:'kg',c:'#1d4ed8',bg:'#eff6ff',delta:'↓ -3.0kg (4W)'},
            {l:'Körperfett',v:`${current.bf}`,u:'%',c:'#c2410c',bg:'#fff7ed',delta:'↓ -1.5% (4W)'},
            {l:'Muskelmasse',v:`${current.lean}`,u:'kg',c:'#15803d',bg:'#f0fdf4',delta:'↑ +0.3kg (4W)'},
            {l:'FFMI',v:`${current.ffmi}`,u:'',c:'#7c3aed',bg:'#faf5ff',delta:'Good · Ziel: 23'},
          ].map(s=>`
            <div style="background:${s.bg};border-radius:var(--r-md);padding:12px;border:1px solid ${s.c}15">
              <div style="font-size:22px;font-weight:var(--fw-bold);color:${s.c}">${s.v}<span style="font-size:12px">${s.u}</span></div>
              <div style="font-size:var(--text-micro);color:var(--text-muted);margin-top:1px">${s.l}</div>
              <div style="font-size:var(--text-micro);color:${s.c};font-weight:600;margin-top:2px">${s.delta}</div>
            </div>`).join('')}
        </div>

        <div class="card">
          <div class="card-header"><div class="card-title">Gewicht — 4 Wochen</div><div class="badge badge-green">↓ -3.0 kg</div></div>
          <div style="display:flex;align-items:flex-end;height:52px;gap:3px;margin-bottom:6px">
            ${wData.map((v,i)=>`
              <div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:1px">
                <div style="width:100%;background:${i===8?'var(--brand-600)':'var(--brand-100)'};border-radius:2px 2px 0 0;height:${((v-minW)/(maxW-minW))*46+4}px"></div>
                ${i%3===0?`<div style="font-size:8px;color:var(--text-muted)">${v}</div>`:''}
              </div>`).join('')}
          </div>
          <div style="display:flex;justify-content:space-between;font-size:var(--text-micro);color:var(--text-muted)"><span>${wData[0]} kg</span><span>Ziel: 82 kg</span><span>${wData[8]} kg</span></div>
        </div>

        <div class="card">
          <div class="card-header"><div class="card-title">Körperfett % — 4 Wochen</div><div class="badge badge-green">↓ -1.5%</div></div>
          <div style="display:flex;align-items:flex-end;height:40px;gap:3px;margin-bottom:4px">
            ${bfData.map((v,i)=>`
              <div style="flex:1;background:${i===8?'#ef4444':'#fca5a5'};border-radius:2px 2px 0 0;height:${((v-minBF)/(maxBF-minBF))*34+4}px"></div>`).join('')}
          </div>
          <div style="display:flex;justify-content:space-between;font-size:var(--text-micro);color:var(--text-muted)"><span>${bfData[0]}%</span><span>Ziel: 15%</span><span>${bfData[8]}%</span></div>
        </div>

        <div class="card">
          <div class="card-header"><div class="card-title">📐 Körper-Ratios</div></div>
          ${[
            {n:'Taille / Hüfte',   v:(current.waist/current.hip).toFixed(2),ref:'< 0.90',ok:true, note:`${current.waist}/${current.hip} cm`},
            {n:'Schulter / Taille',v:'1.31',ref:'> 1.25',ok:true, note:'~110/84 cm (Schätzung)'},
            {n:'FFMI',            v:`${current.ffmi}`,ref:'> 20 Good',ok:true, note:'Fat-Free Mass Index'},
          ].map(r=>`
            <div class="data-row">
              <div>
                <div class="data-label">${r.n}</div>
                <div style="font-size:var(--text-micro);color:var(--text-muted)">${r.note} · Ref: ${r.ref}</div>
              </div>
              <div style="display:flex;align-items:center;gap:6px">
                <span style="font-size:var(--text-sm);font-weight:var(--fw-bold);color:${r.ok?'var(--brand-700)':'#ef4444'}">${r.v}</span>
                <span>${r.ok?'✅':'⚠️'}</span>
              </div>
            </div>`).join('')}
        </div>
      </div>

      <div style="display:flex;flex-direction:column;gap:12px">
        <div class="card">
          <div class="card-header"><div class="card-title">📝 Neue Messung</div></div>
          ${[{l:'Gewicht (kg)',ph:'85.2',type:'number'},{l:'Körperfett (%)',ph:'18.0',type:'number'}].map(f=>`
            <div style="margin-bottom:8px">
              <div style="font-size:var(--text-micro);font-weight:var(--fw-medium);color:var(--text-secondary);margin-bottom:3px">${f.l}</div>
              <div style="border:1px solid var(--surface-border);border-radius:var(--r-md);padding:8px 10px;font-size:var(--text-sm);font-weight:var(--fw-bold);color:var(--text-muted);background:var(--surface-card-alt)">${f.ph}</div>
            </div>`).join('')}
          <div style="font-size:var(--text-micro);color:var(--text-muted);margin-bottom:8px">Datum: 27. Apr 2026 · Morgens, nüchtern</div>
          <div style="padding:8px;text-align:center;border-radius:var(--r-md);background:var(--brand-600);color:#fff;font-size:var(--text-xs);font-weight:var(--fw-semibold);cursor:pointer">Speichern</div>
        </div>

        <div class="card">
          <div class="card-header"><div class="card-title">History</div></div>
          ${history.map(h=>`
            <div class="data-row">
              <div>
                <div class="data-label">${h.date}${h.note?` · ${h.note}`:''}</div>
                <div style="font-size:var(--text-micro);color:var(--text-muted)">KFA: ${h.bf}%</div>
              </div>
              <div class="data-val">${h.w} kg</div>
            </div>`).join('')}
        </div>

        <div class="card">
          <div class="card-header"><div class="card-title">Muskelmasse vs. Fett</div></div>
          <div style="display:flex;align-items:flex-end;height:40px;gap:2px;margin-bottom:6px">
            ${[{l:69.0,f:18.2},{l:69.2,f:18.2},{l:69.5,f:18.2},{l:69.7,f:18.0},{l:69.9,f:18.0}].map((d,i)=>{
              const total=d.l+d.f;
              return `<div style="flex:1;display:flex;flex-direction:column-reverse">
                <div style="width:100%;background:var(--brand-400);height:${(d.l/total)*36}px;border-radius:2px 2px 0 0"></div>
                <div style="width:100%;background:#fca5a5;height:${(d.f/total)*36}px;margin-top:1px"></div>
              </div>`;}).join('')}
          </div>
          <div style="display:flex;gap:10px;font-size:var(--text-micro)">
            <div style="display:flex;align-items:center;gap:4px;color:var(--brand-700)"><div style="width:8px;height:8px;border-radius:2px;background:var(--brand-400)"></div>${current.lean}kg Muskelmasse</div>
            <div style="display:flex;align-items:center;gap:4px;color:#ef4444"><div style="width:8px;height:8px;border-radius:2px;background:#fca5a5"></div>${(current.weight-current.lean).toFixed(1)}kg Fett</div>
          </div>
        </div>
      </div>
    </div>
  `;
};
