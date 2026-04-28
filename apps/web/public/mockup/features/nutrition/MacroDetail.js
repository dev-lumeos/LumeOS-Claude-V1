// features/nutrition/MacroDetail.js — SPEC_10_COMPONENTS: hierarchischer Makro-Baum
// Period Selector: Heute/7d/14d/30d | Fett/KH/Protein aufklappbar | 3 Ebenen tief

window.Nutrition_MacroDetail = function() {
  // State: open rows keyed by "macro:rowKey"
  if (!window._macroOpen) window._macroOpen = {fat:true, cho:true, prot:true};

  const bar = (v, total, color) => {
    const pct = total > 0 ? Math.min((v/total)*100, 100) : 0;
    return `<div style="flex:1;height:5px;background:var(--surface-hover);border-radius:3px;overflow:hidden"><div style="height:100%;width:${pct}%;background:${color};border-radius:3px"></div></div>`;
  };

  const row = (depth, name, val, unit, pct, color, hasChildren, key, note) => {
    const indent = depth * 14;
    const toggleKey = `macro_${key}`;
    const isOpen = window[toggleKey] !== false; // default open
    return `
      <div style="display:flex;align-items:center;gap:8px;padding:5px 0;border-bottom:1px solid var(--surface-border);padding-left:${indent}px;cursor:${hasChildren?'pointer':'default'}"
        ${hasChildren?`onclick="window['${toggleKey}']=!window['${toggleKey}'];this.closest('.macro-section').querySelectorAll('[data-parent=${JSON.stringify(key)}]').forEach(e=>e.style.display=window['${toggleKey}']?'flex':'none');this.querySelector('.toggle-icon').textContent=window['${toggleKey}']?'▼':'▶'"`:''}
      >
        ${hasChildren?`<span class="toggle-icon" style="font-size:9px;color:var(--text-muted);width:12px;flex-shrink:0">${isOpen?'▼':'▶'}</span>`:`<span style="width:12px;flex-shrink:0"></span>`}
        <div style="flex:1;min-width:0">
          <div style="font-size:var(--text-xs);font-weight:${depth===0?'var(--fw-bold)':'var(--fw-normal)'};color:${depth===0?'var(--text-primary)':'var(--text-secondary)'}">${name}${note?` <span style="font-size:9px;color:#22c55e;font-weight:600">${note}</span>`:''}</div>
        </div>
        ${bar(val, val/(pct/100||1), color)}
        <div style="width:36px;text-align:right;font-size:var(--text-xs);font-weight:var(--fw-semibold);color:var(--text-primary);flex-shrink:0">${val}${unit}</div>
        <div style="width:32px;text-align:right;font-size:var(--text-micro);color:var(--text-muted);flex-shrink:0">${pct}%</div>
      </div>`;
  };

  const section = (id, emoji, title, total, color, bg, children) => `
    <div class="macro-section" style="border:1px solid var(--surface-border);border-radius:var(--r-lg);overflow:hidden;background:var(--surface-card)">
      <div style="display:flex;align-items:center;justify-content:space-between;padding:12px 14px;background:${bg};cursor:pointer"
        onclick="window._macroOpen['${id}']=!window._macroOpen['${id}'];this.nextElementSibling.style.display=window._macroOpen['${id}']?'block':'none';this.querySelector('.sec-arrow').textContent=window._macroOpen['${id}']?'▼':'▶'">
        <div style="display:flex;align-items:center;gap:8px">
          <span style="font-size:16px">${emoji}</span>
          <span style="font-size:var(--text-sm);font-weight:var(--fw-bold);color:var(--text-primary)">${title}</span>
        </div>
        <div style="display:flex;align-items:center;gap:8px">
          <span style="font-size:var(--text-sm);font-weight:var(--fw-bold);color:${color}">${total}</span>
          <span class="sec-arrow" style="font-size:10px;color:var(--text-muted)">▼</span>
        </div>
      </div>
      <div style="padding:0 14px 6px">${children}</div>
    </div>`;

  const fat = [
    row(0,'Gesättigte Fettsäuren', 18.2,'g',29,'#ef4444',true,'fat_sat'),
    `<div data-parent="fat_sat" style="display:flex;flex-direction:column">
      ${row(1,'Palmitinsäure',11.1,'g',18,'#ef4444',false,'fat_pal')}
      ${row(1,'Stearinsäure', 4.8,'g', 8,'#ef4444',false,'fat_ste')}
      ${row(1,'Myristinsäure',2.3,'g', 4,'#ef4444',false,'fat_myr')}
    </div>`,
    row(0,'Einfach ungesättigt',   27.8,'g',45,'#f59e0b',true,'fat_mufa'),
    `<div data-parent="fat_mufa" style="display:flex;flex-direction:column">
      ${row(1,'Ölsäure (C18:1)',26.4,'g',42,'#f59e0b',false,'fat_ole')}
      ${row(1,'Palmitolein',   1.4,'g', 2,'#f59e0b',false,'fat_pam')}
    </div>`,
    row(0,'Mehrfach ungesättigt',  11.4,'g',18,'#22c55e',true,'fat_pufa'),
    `<div data-parent="fat_pufa" style="display:flex;flex-direction:column">
      ${row(1,'Linolsäure (LA ω6)', 9.8,'g',16,'#22c55e',false,'fat_la')}
      ${row(1,'EPA (ω3)',          0.4,'g', 1,'#22c55e',false,'fat_epa')}
      ${row(1,'DHA (ω3)',          0.2,'g', 0,'#22c55e',false,'fat_dha')}
      ${row(1,'ALA (ω3)',          1.0,'g', 2,'#22c55e',false,'fat_ala')}
    </div>`,
    row(0,'Trans-Fettsäuren',        2.4,'g', 4,'#a855f7',false,'fat_trans'),
  ].join('');

  const cho = [
    row(0,'Stärke',          134.2,'g',68,'#3b82f6',false,'cho_sta'),
    row(0,'Zucker gesamt',    42.1,'g',21,'#f59e0b',true,'cho_sug'),
    `<div data-parent="cho_sug" style="display:flex;flex-direction:column">
      ${row(1,'Glucose',  14.8,'g', 7,'#f59e0b',false,'cho_glu')}
      ${row(1,'Fructose', 12.3,'g', 6,'#f59e0b',false,'cho_fru')}
      ${row(1,'Saccharose',11.6,'g', 6,'#f59e0b',false,'cho_sac')}
      ${row(1,'Lactose',   3.4,'g', 2,'#f59e0b',false,'cho_lac')}
    </div>`,
    row(0,'Ballaststoffe',    22.1,'g',11,'#22c55e',true,'cho_fib'),
    `<div data-parent="cho_fib" style="display:flex;flex-direction:column">
      ${row(1,'Löslich',    7.8,'g', 4,'#22c55e',false,'cho_sol')}
      ${row(1,'Unlöslich', 14.3,'g', 7,'#22c55e',false,'cho_ins')}
    </div>`,
  ].join('');

  const prot = [
    row(0,'Essentielle AAs',  68.4,'g',48,'#3b82f6',true,'prot_ess'),
    `<div data-parent="prot_ess" style="display:flex;flex-direction:column">
      ${row(1,'Leucin (LEU)',  12.4,'g', 9,'#3b82f6',false,'prot_leu','← mTOR Trigger')}
      ${row(1,'Lysin (LYS)',    9.2,'g', 6,'#3b82f6',false,'prot_lys')}
      ${row(1,'Isoleucin (ILE)',7.1,'g', 5,'#3b82f6',false,'prot_ile')}
      ${row(1,'Valin (VAL)',    7.8,'g', 5,'#3b82f6',false,'prot_val')}
      ${row(1,'Phenylalanin',  6.1,'g', 4,'#3b82f6',false,'prot_phe')}
      ${row(1,'Threonin',      5.9,'g', 4,'#3b82f6',false,'prot_thr')}
      ${row(1,'Methionin',     3.8,'g', 3,'#3b82f6',false,'prot_met')}
      ${row(1,'Tryptophan',    1.8,'g', 1,'#3b82f6',false,'prot_trp')}
      ${row(1,'Histidin',      4.3,'g', 3,'#3b82f6',false,'prot_his')}
    </div>`,
    row(0,'Nicht-essentielle',73.9,'g',52,'#a855f7',true,'prot_ness'),
    `<div data-parent="prot_ness" style="display:flex;flex-direction:column">
      ${row(1,'Alanin',  8.4,'g', 6,'#a855f7',false,'prot_ala')}
      ${row(1,'Glycin',  7.2,'g', 5,'#a855f7',false,'prot_gly')}
      ${row(1,'Glutamin',9.8,'g', 7,'#a855f7',false,'prot_gln','← Darm-Schutz')}
      ${row(1,'Arginin', 6.1,'g', 4,'#a855f7',false,'prot_arg')}
      ${row(1,'Tyrosin', 5.4,'g', 4,'#a855f7',false,'prot_tyr')}
      ${row(1,'Andere', 37.0,'g',26,'#a855f7',false,'prot_oth')}
    </div>`,
  ].join('');

  return `
    <div style="display:flex;flex-direction:column;gap:12px">
      <div style="display:flex;align-items:center;justify-content:space-between">
        <div style="font-size:var(--text-sm);font-weight:var(--fw-bold);color:var(--text-primary)">Makro-Detail-Analyse</div>
        <div style="display:flex;gap:3px">
          ${['Heute','7d','14d','30d'].map((l,i)=>`<div style="padding:4px 8px;border-radius:var(--r-sm);background:${i===0?'var(--accent-nutrition)':'var(--surface-hover)'};color:${i===0?'#fff':'var(--text-secondary)'};font-size:var(--text-micro);cursor:pointer">${l}</div>`).join('')}
        </div>
      </div>
      ${section('fat','🫒','Fett · 62.4g gesamt','62.4g','#f59e0b','#fffbeb',fat)}
      ${section('cho','🍞','Kohlenhydrate · 198.4g gesamt','198.4g','#3b82f6','#eff6ff',cho)}
      ${section('prot','🥩','Protein · 142.3g gesamt','142.3g','#a855f7','#faf5ff',prot)}
    </div>`;
};
