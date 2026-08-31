// features/training/VolumeView.js
// Training → Volumen: Volume Landmarks (MEV/MAV/MRV), Muscle Volume Heatmap 4W, Countdown

window.Training_VolumeView = function() {
  const landmarks = [
    {m:'Brust',    sets:14,mev:10,mav:16,mrv:22,status:'optimal'},
    {m:'Rücken',   sets:12,mev:10,mav:18,mrv:25,status:'optimal'},
    {m:'Schultern',sets:8, mev:8, mav:14,mrv:20,status:'optimal'},
    {m:'Bizeps',   sets:8, mev:6, mav:10,mrv:16,status:'approaching'},
    {m:'Trizeps',  sets:8, mev:6, mav:10,mrv:16,status:'approaching'},
    {m:'Quadrizeps',sets:6,mev:8, mav:14,mrv:22,status:'below'},
    {m:'Hamstrings',sets:4,mev:6, mav:10,mrv:18,status:'below'},
    {m:'Gesäß',    sets:4,mev:6, mav:12,mrv:18,status:'below'},
    {m:'Waden',    sets:6,mev:6, mav:12,mrv:16,status:'optimal'},
    {m:'Bauch',    sets:4,mev:4, mav:10,mrv:20,status:'optimal'},
  ];
  const countdown = [
    {m:'Latissimus', last:'vor 3T',hrs:72, next:'Pull Day (Di)',ready:true},
    {m:'Bizeps',     last:'vor 3T',hrs:72, next:'Pull Day (Di)',ready:true},
    {m:'Quadrizeps', last:'vor 5T',hrs:120,next:'Legs Day (Mi)',ready:true},
    {m:'Brust',      last:'gestern',hrs:24,next:'48h warten',   ready:false},
    {m:'Schultern',  last:'gestern',hrs:24,next:'48h warten',   ready:false},
  ];
  const mev=n=>landmarks.find(l=>l.m===n)?.mev||0;
  const mrv=n=>landmarks.find(l=>l.m===n)?.mrv||20;
  const statusC={optimal:'var(--brand-500)',approaching:'#f59e0b',below:'#ef4444',over:'#a855f7'};
  const statusL={optimal:'✅ Optimal',approaching:'🟡 Nahe MRV',below:'⚠️ Unter MEV',over:'🔴 Über MRV'};

  const heatMuscles=['Brust','Rücken','Schultern','Bizeps','Trizeps','Quadrizeps','Gesäß','Hamstrings','Waden','Bauch','Trapez','Unterarme'];
  const heatData = heatMuscles.map(m=>{const base=landmarks.find(l=>l.m===m);return base?[Math.max(0,base.sets-4),Math.max(0,base.sets-2),Math.max(0,base.sets-1),base.sets]:[0,0,0,0]});
  const getCellBg=(v,mn)=>{const mv=mev(mn),mr=mrv(mn);if(!v)return'var(--surface-hover)';if(v<mv)return'#fca5a5';const r=v/mr;if(r<=.5)return'#86efac';if(r<=.75)return'#22c55e';if(r<=1)return'#15803d';return'#a855f7'};

  return `
    <div style="display:flex;flex-direction:column;gap:12px">

      <div class="card">
        <div class="card-header"><div class="card-title">📊 Volume Landmarks</div><div style="display:flex;gap:3px">
          ${['1W','2W','4W'].map((l,i)=>`<div style="font-size:var(--text-micro);padding:2px 6px;border-radius:var(--r-sm);background:${i===0?'var(--accent-training)':'var(--surface-hover)'};color:${i===0?'#fff':'var(--text-secondary)'};cursor:pointer">${l}</div>`).join('')}
        </div></div>
        <div style="font-size:var(--text-micro);color:var(--text-muted);margin-bottom:10px">MEV=Minimum · MAV=Optimum · MRV=Maximum (Sets/Woche)</div>
        ${landmarks.map(l=>{
          const maxDisplay=Math.max(l.mrv+4,l.sets+2);
          const barW=Math.min((l.sets/maxDisplay)*100,100);
          const mevPos=(l.mev/maxDisplay)*100;
          const mrvPos=(l.mrv/maxDisplay)*100;
          return `
            <div style="margin-bottom:10px">
              <div style="display:flex;justify-content:space-between;margin-bottom:3px">
                <span style="font-size:var(--text-xs);font-weight:var(--fw-medium);color:var(--text-primary)">${l.m}</span>
                <div style="display:flex;align-items:center;gap:6px">
                  <span style="font-size:var(--text-xs);font-weight:var(--fw-bold);color:${statusC[l.status]}">${l.sets} Sets</span>
                  <span style="font-size:9px;padding:1px 5px;border-radius:var(--r-full);background:${statusC[l.status]}20;color:${statusC[l.status]}">${statusL[l.status]}</span>
                </div>
              </div>
              <div style="position:relative;height:8px;background:var(--surface-hover);border-radius:4px;overflow:visible">
                <div style="position:absolute;left:${mevPos}%;top:-2px;width:2px;height:12px;background:#94a3b8;border-radius:1px" title="MEV:${l.mev}"></div>
                <div style="position:absolute;left:${mrvPos}%;top:-2px;width:2px;height:12px;background:#ef4444;border-radius:1px" title="MRV:${l.mrv}"></div>
                <div style="height:100%;width:${barW}%;background:${statusC[l.status]};border-radius:4px;opacity:.8"></div>
              </div>
              <div style="display:flex;justify-content:space-between;font-size:8px;color:var(--text-muted);margin-top:2px"><span>MEV:${l.mev}</span><span>MAV:${l.mav}</span><span>MRV:${l.mrv}</span></div>
            </div>`;
        }).join('')}
      </div>

      <div class="card">
        <div class="card-header"><div class="card-title">🔥 Volumen-Heatmap (4 Wochen)</div></div>
        <div style="overflow-x:auto">
          <div style="display:grid;grid-template-columns:72px repeat(4,1fr);gap:3px;min-width:260px;margin-bottom:4px">
            <div></div>
            ${['KW14','KW15','KW16','KW17'].map(w=>`<div style="font-size:var(--text-micro);color:var(--text-muted);text-align:center">${w}</div>`).join('')}
          </div>
          ${heatMuscles.map((mn,mi)=>`
            <div style="display:grid;grid-template-columns:72px repeat(4,1fr);gap:3px;margin-bottom:2px">
              <div style="font-size:var(--text-micro);color:var(--text-secondary);display:flex;align-items:center">${mn}</div>
              ${heatData[mi].map(v=>`
                <div style="aspect-ratio:1.4/1;border-radius:3px;background:${getCellBg(v,mn)};display:flex;align-items:center;justify-content:center">
                  <span style="font-size:8px;color:${v>=(mev(mn)||0)?'#fff':'var(--semantic-danger-text)'};font-weight:600">${v||''}</span>
                </div>`).join('')}
            </div>`).join('')}
        </div>
      </div>

      <div class="card">
        <div class="card-header"><div class="card-title">⏰ Muskel-Countdown</div></div>
        ${countdown.map(c=>`
          <div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--surface-border)">
            <div style="width:8px;height:8px;border-radius:50%;flex-shrink:0;background:${c.ready?'var(--brand-500)':'#ef4444'}"></div>
            <div style="flex:1">
              <div style="font-size:var(--text-xs);font-weight:var(--fw-semibold);color:var(--text-primary)">${c.m}</div>
              <div style="font-size:var(--text-micro);color:var(--text-muted)">Zuletzt: ${c.last} · ${c.hrs}h erholt</div>
            </div>
            <div style="font-size:var(--text-micro);font-weight:var(--fw-semibold);color:${c.ready?'var(--brand-700)':'#ef4444'};text-align:right">${c.next}</div>
          </div>`).join('')}
      </div>
    </div>
  `;
};
