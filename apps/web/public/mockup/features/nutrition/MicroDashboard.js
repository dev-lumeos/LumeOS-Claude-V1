// features/nutrition/MicroDashboard.js — Detail-Cards pro Nährstoff, Gruppen, Quick Summary
// Vollständige NUTRIENT_DETAILS aus nutrientDetails.ts DE-Felder

window.Nutrition_MicroDashboard = function() {
  // ── NUTRIENT DETAILS (aus nutrientDetails.ts DE-Felder) ──
  const ND = {
    VITA:{detail:'Vitamin A ist essentiell für Sehkraft (Nachtsehen) und Immunsystem. Als fettlösliches Vitamin kann es sich bei Überdosierung im Körper anreichern.',deficiency:'Nachtblindheit, erhöhte Infektanfälligkeit',excess:'Kopfschmerzen, Übelkeit, Leberschäden bei chronischer Überdosierung',interactions:'Zink wird für die Vitamin-A-Verwertung benötigt. Eisenmangel kann Vitamin-A-Status beeinträchtigen.',rda:'900μg (M), 700μg (F)',rda_ath:'Standard',ul:'3000μg',sources:['Leber','Karotten','Süßkartoffeln'],tip:null},
    VITD:{detail:'Vitamin D ist essentiell für Kalziumaufnahme und Knochengesundheit. Spielt eine wichtige Rolle bei Testosteronproduktion und Immunfunktion. Athleten haben oft einen Mangel.',deficiency:'Muskelschwäche, erhöhte Infektanfälligkeit, Knochenschmerzen, verlangsamte Recovery',excess:'Hyperkalzämie (zu viel Kalzium im Blut), Nierensteine, Übelkeit',interactions:'Verbessert Kalzium-Absorption. Magnesium wird für die Aktivierung von Vitamin D benötigt.',rda:'600IU (15μg)',rda_ath:'2000-5000IU',ul:'4000IU (100μg)',sources:['Fetter Fisch','Eier','Sonnenlicht'],tip:'Kritisch für Athleten! Bluttest empfohlen.'},
    VITE:{detail:'Vitamin E ist ein kraftvolles Antioxidans, das Zellen vor oxidativem Stress schützt. Wichtig für Athleten zur Reduktion von trainingsinduziertem oxidativem Stress.',deficiency:'Neuropathie, Muskelschwäche',excess:'Erhöhtes Blutungsrisiko, kann Blutgerinnung hemmen',interactions:'Synergistisch mit Vitamin C.',rda:'15mg',rda_ath:'15-30mg',ul:'1000mg',sources:['Nüsse','Samen','Pflanzenöle'],tip:null},
    VITK:{detail:'Vitamin K ist essentiell für die Blutgerinnung und spielt eine wichtige Rolle im Knochenstoffwechsel. Aktiviert Proteine für die Kalziumeinlagerung in Knochen.',deficiency:'Blutungsprobleme',excess:'Selten toxisch, kann jedoch Blutverdünner (Warfarin) beeinträchtigen',interactions:'Antagonist zu Blutverdünnern. Arbeitet synergistisch mit Vitamin D für Knochengesundheit.',rda:'120μg (M), 90μg (F)',rda_ath:'Standard',ul:null,sources:['Grünkohl','Spinat','Brokkoli'],tip:null},
    VITC:{detail:'Vitamin C ist ein starkes Antioxidans und essentiell für Kollagensynthese, Wundheilung und Immunfunktion. Verbessert Eisenaufnahme aus pflanzlichen Quellen.',deficiency:'Skorbut: Zahnfleischbluten, Wundheilungsstörungen',excess:'Durchfall, Magen-Darm-Beschwerden, erhöhtes Nierenstein-Risiko bei sehr hohen Dosen',interactions:'Verbessert Eisenaufnahme um das 3-4-fache. Synergistisch mit Vitamin E.',rda:'90mg (M), 75mg (F)',rda_ath:'200-1000mg',ul:'2000mg',sources:['Zitrusfrüchte','Paprika','Erdbeeren'],tip:'Recovery & Immunsystem-Boost!'},
    THIA:{detail:'Thiamin (Vitamin B1) ist essentiell für den Kohlenhydrat-Stoffwechsel und die Energieproduktion. Wichtig für Nervenfunktion und Muskelkontraktion.',deficiency:'Müdigkeit, Schwäche, Nervenschäden',excess:'Sehr selten toxisch, da wasserlöslich',interactions:'Synergistisch mit anderen B-Vitaminen im Energiestoffwechsel.',rda:'1.2mg (M), 1.1mg (F)',rda_ath:'1.5-2mg',ul:null,sources:['Vollkorn','Schweinefleisch','Hülsenfrüchte'],tip:null},
    RIBF:{detail:'Riboflavin (Vitamin B2) ist Co-Faktor in vielen enzymatischen Reaktionen, besonders im Energiestoffwechsel. Wichtig für Gesundheit von Haut, Augen und Nervensystem.',deficiency:'Rissige Lippen und Mundwinkel, Augenentzündung',excess:'Keine bekannten Toxizitätsprobleme, da wasserlöslich',interactions:'Wird für die Aktivierung von Vitamin B6 und Folsäure benötigt.',rda:'1.3mg (M), 1.1mg (F)',rda_ath:'1.5-2mg',ul:null,sources:['Milch','Eier','Mandeln'],tip:null},
    NIA:{detail:'Niacin (Vitamin B3) ist essentiell für die Funktion von über 400 Enzymen im Energiestoffwechsel. Kann aus Tryptophan synthetisiert werden.',deficiency:'Pellagra: Dermatitis, Diarrhö, Demenz',excess:'Niacin-Flush (Hautrötung, Juckreiz) bei hohen Dosen, Leberschäden bei Missbrauch',interactions:'Kann aus Tryptophan (Aminosäure) gebildet werden. B6 wird für diese Umwandlung benötigt.',rda:'16mg (M), 14mg (F)',rda_ath:'20mg',ul:'35mg (aus Supplements)',sources:['Fleisch','Fisch','Erdnüsse'],tip:null},
    PANTAC:{detail:'Pantothensäure (Vitamin B5) ist Bestandteil von Coenzym A, zentral im Fett-, Protein- und Kohlenhydrat-Stoffwechsel.',deficiency:'Müdigkeit, Kopfschmerzen (selten)',excess:'Sehr selten toxisch, mögliche Durchfälle bei sehr hohen Dosen',interactions:'Arbeitet synergistisch mit anderen B-Vitaminen.',rda:'5mg',rda_ath:'7mg',ul:null,sources:['Fleisch','Avocado','Pilze'],tip:null},
    VITB6:{detail:'Vitamin B6 ist essentiell für den Aminosäure-Stoffwechsel und wird besonders bei hoher Proteinzufuhr benötigt. Wichtig für Serotonin- und Dopamin-Synthese.',deficiency:'Anämie, Nervenstörungen, Depression',excess:'Nervenschäden (periphere Neuropathie) bei chronischer Überdosierung >100mg/Tag',interactions:'Benötigt für Niacin-Synthese aus Tryptophan. Synergistisch mit Magnesium.',rda:'1.3mg',rda_ath:'2-3mg',ul:'100mg',sources:['Hähnchen','Fisch','Kartoffeln'],tip:'Wichtig bei hoher Proteinzufuhr!'},
    BIOT:{detail:'Biotin (Vitamin B7) ist essentiell für Fettsäure-Synthese, Glukoneogenese und Aminosäure-Stoffwechsel. Bekannt für Haar-, Haut- und Nagelgesundheit.',deficiency:'Haarausfall, Hautrötung, Nagelschwäche',excess:'Keine bekannten Toxizitätsprobleme selbst bei hohen Dosen',interactions:'Rohe Eier (Avidin) blockieren Biotin-Absorption.',rda:'30μg',rda_ath:'30-50μg',ul:null,sources:['Eier','Lachs','Nüsse'],tip:null},
    FOL:{detail:'Folat (Folsäure) ist essentiell für DNA-Synthese und Zellteilung, besonders wichtig während Schwangerschaft. Arbeitet eng mit Vitamin B12 zusammen.',deficiency:'Anämie, Neuralrohrdefekte',excess:'Kann B12-Mangel maskieren, neurologische Symptome bei hohen Dosen möglich',interactions:'Arbeitet synergistisch mit B12. Zink wird für Folat-Stoffwechsel benötigt.',rda:'400μg DFE',rda_ath:'400-600μg',ul:'1000μg (aus Supplements)',sources:['Blattgemüse','Hülsenfrüchte','Zitrusfrüchte'],tip:null},
    VITB12:{detail:'Vitamin B12 ist essentiell für die Nervenfunktion, DNA-Synthese und Blutbildung. Kommt nur in tierischen Produkten vor — Veganer müssen supplementieren.',deficiency:'Neuropathie, Anämie, kognitive Beeinträchtigung — kann irreversibel sein!',excess:'Keine bekannten Toxizitätsprobleme',interactions:'Arbeitet synergistisch mit Folat. Benötigt Intrinsic Factor für Absorption.',rda:'2.4μg',rda_ath:'5-10μg',ul:null,sources:['Fleisch','Fisch','Milchprodukte'],tip:'Veganer benötigen Supplementierung!'},
    CA:{detail:'Calcium ist der am häufigsten vorkommende Mineralstoff im Körper und essentiell für Knochengesundheit, Muskelkontraktion und Nervenfunktion.',deficiency:'Osteoporose, Muskelkrämpfe',excess:'Nierensteine, Verstopfung, beeinträchtigte Aufnahme von Eisen und Zink',interactions:'Vitamin D verbessert Absorption. Kann Eisen- und Zink-Aufnahme hemmen.',rda:'1000mg',rda_ath:'1000-1500mg',ul:'2500mg',sources:['Milch','Käse','Brokkoli'],tip:'Wichtig für Knochendichte!'},
    MG:{detail:'Magnesium ist Co-Faktor in über 300 enzymatischen Reaktionen und essentiell für Energieproduktion, Muskelrelaxation und Schlafqualität.',deficiency:'Krämpfe, Schlafstörung, Müdigkeit',excess:'Durchfall bei Supplementierung, bei sehr hohen Dosen Atemdepression',interactions:'Wird für Vitamin-D-Aktivierung benötigt. Synergistisch mit Calcium und Vitamin B6.',rda:'400mg (M), 310mg (F)',rda_ath:'400-600mg',ul:'350mg (aus Supplements)',sources:['Nüsse','Spinat','Dunkle Schokolade'],tip:'Schlaf & Recovery Game-Changer!'},
    P:{detail:'Phosphor ist essentiell für Knochen, Zähne und ATP (Energiewährung). Bestandteil von DNA und Zellmembranen.',deficiency:'Selten — Schwäche, Knochenschmerzen',excess:'Kann Calcium-Absorption stören, Nierenschäden bei chronischem Überschuss',interactions:'Muss im Gleichgewicht mit Calcium stehen (Ca:P Verhältnis ~1:1 optimal).',rda:'700mg',rda_ath:'Standard',ul:'4000mg',sources:['Fleisch','Milchprodukte','Nüsse'],tip:null},
    K:{detail:'Kalium ist essentiell für Blutdruckregulation, Muskelkontraktion und Nervenfunktion. Wirkt antagonistisch zu Natrium. Kritisch für Prävention von Muskelkrämpfen.',deficiency:'Krämpfe, Herzrhythmusstörungen',excess:'Hyperkaliämie (gefährlich bei Nierenproblemen)',interactions:'Antagonist zu Natrium. Wichtig für Natrium-Kalium-Pumpe in Zellen.',rda:'3400mg (M), 2600mg (F)',rda_ath:'3500-4700mg',ul:null,sources:['Bananen','Kartoffeln','Spinat'],tip:'Anti-Krampf Mineral!'},
    NA:{detail:'Natrium ist essentiell für Flüssigkeitsbalance, Nervenfunktion und Muskelkontraktion. Athleten verlieren bedeutende Mengen durch Schweiß!',deficiency:'Hyponatriämie (gefährlich!), Krämpfe',excess:'Bluthochdruck bei empfindlichen Personen, Wasserretention',interactions:'Antagonist zu Kalium. Zu viel Natrium verdrängt Kalium.',rda:'<2300mg',rda_ath:'3000-5000mg',ul:'2300mg',sources:['Salz','Verarbeitete Lebensmittel'],tip:'Athleten brauchen MEHR Salz!'},
    FE:{detail:'Eisen ist essentiell für Hämoglobin und Sauerstofftransport. Häm-Eisen aus Fleisch wird besser absorbiert (15-35%) als Nicht-Häm-Eisen aus Pflanzen (2-20%).',deficiency:'Anämie, Müdigkeit, Leistungsabfall',excess:'Übelkeit, Erbrechen, Magen-Darm-Probleme, Organschäden',interactions:'Vitamin C verbessert Nicht-Häm-Eisen-Absorption um das 3-4-fache. Calcium hemmt Eisen-Absorption.',rda:'8mg (M), 18mg (F)',rda_ath:'15-20mg',ul:'45mg',sources:['Rotes Fleisch','Spinat','Hülsenfrüchte'],tip:'Kritisch für Ausdauerathleten!'},
    ZN:{detail:'Zink ist essentiell für über 300 Enzyme und kritisch für Testosteronproduktion, Immunfunktion und Wundheilung. Athleten verlieren Zink durch Schweiß.',deficiency:'Testosteron↓, Immunschwäche, langsame Wundheilung',excess:'Kupfermangel, Übelkeit, Immunsuppression bei chronischem Überschuss',interactions:'Hohe Zinkdosen hemmen Kupfer-Absorption. Synergistisch mit Vitamin A.',rda:'11mg (M), 8mg (F)',rda_ath:'15-30mg',ul:'40mg',sources:['Austern','Rindfleisch','Kürbiskerne'],tip:'Testosteron-Booster!'},
    SE:{detail:'Selen ist essentiell für Schilddrüsenhormone und ein kraftvolles Antioxidans. Eine Paranuss liefert bereits den Tagesbedarf!',deficiency:'Schilddrüsenprobleme, geschwächtes Immunsystem',excess:'Haarausfall, Nagelbrüchigkeit, Übelkeit, neurologische Symptome',interactions:'Synergistisch mit Vitamin E.',rda:'55μg',rda_ath:'55-100μg',ul:'400μg',sources:['Paranüsse','Fisch','Eier'],tip:null},
    ID:{detail:'Jod ist essentiell für Schilddrüsenhormone (T3, T4), die den Stoffwechsel regulieren. Jodiertes Salz hat Jodmangel in vielen Ländern eliminiert.',deficiency:'Hypothyreose, Kropf, Gewichtszunahme',excess:'Schilddrüsenfunktionsstörungen bei sehr hohen Dosen',interactions:'Synergistisch mit Selen für Schilddrüsenfunktion. Soja kann Jod-Absorption hemmen.',rda:'150μg',rda_ath:'150-200μg',ul:'1100μg',sources:['Jodiertes Salz','Meeresfrüchte','Algen'],tip:null},
    CU:{detail:'Kupfer ist essentiell für Eisenstoffwechsel und die Bildung roter Blutkörperchen. Wichtig für Bindegewebe und Nervensystem.',deficiency:'Anämie, Immunschwäche',excess:'Leberschäden, Magen-Darm-Probleme bei sehr hohen Dosen',interactions:'Hohe Zinkdosen können Kupfermangel verursachen.',rda:'900μg',rda_ath:'Standard',ul:'10mg',sources:['Leber','Nüsse','Schalentiere'],tip:null},
    MN:{detail:'Mangan ist Co-Faktor in vielen Enzymen und wichtig für Knochen, Wundheilung und Kohlenhydrat-Stoffwechsel.',deficiency:'Selten — Knochenproblemen',excess:'Neurologische Probleme bei chronischem Überschuss (sehr selten)',interactions:'Hohe Eisen- oder Calcium-Dosen können Mangan-Absorption beeinträchtigen.',rda:'2.3mg (M), 1.8mg (F)',rda_ath:'Standard',ul:'11mg',sources:['Nüsse','Vollkorn','Tee'],tip:null},
    CR:{detail:'Chrom verbessert die Insulinsensitivität und hilft bei der Blutzuckerregulation. Besonders wichtig für Kohlenhydrat- und Fettstoffwechsel.',deficiency:'Blutzucker-Probleme, Insulinresistenz',excess:'Nierenschäden bei sehr hohen Dosen (sehr selten)',interactions:'Arbeitet synergistisch mit Insulin. Vitamin C kann Chrom-Absorption verbessern.',rda:'35μg (M), 25μg (F)',rda_ath:'35-50μg',ul:null,sources:['Brokkoli','Fleisch','Vollkorn'],tip:null},
    MO:{detail:'Molybdän ist Co-Faktor für Enzyme, die am Abbau von Purinen und Schwefelaminosäuren beteiligt sind.',deficiency:'Sehr selten',excess:'Gichtähnliche Symptome bei sehr hohen Dosen (sehr selten)',interactions:'Hohe Molybdän-Dosen können Kupfer-Absorption beeinträchtigen.',rda:'45μg',rda_ath:'Standard',ul:'2mg',sources:['Hülsenfrüchte','Nüsse','Getreide'],tip:null},
    LEU:{detail:'Leucin ist der wichtigste mTOR-Trigger — der direkte Schalter für Muskelprotein-Synthese. Mindest-Schwelle: 2-3g pro Mahlzeit für maximalen anabolen Effekt.',deficiency:'Reduzierter Muskelaufbau, langsamere Protein-Synthese',excess:null,interactions:'Synergistisch mit Isoleucin + Valin (BCAA)',rda:'2-3g/Mahlzeit',rda_ath:'2-3g/Mahlzeit',ul:null,sources:['Whey Protein','Hähnchenbrust','Eier','Rindfleisch'],tip:'Leucin triggert mTOR — Muskelaufbau!'},
    F20D5N3:{detail:'EPA ist eine essentielle Omega-3-Fettsäure mit starker anti-entzündlicher Wirkung. Reduziert trainingsinduzierten oxidativen Stress und verbessert die Recovery.',deficiency:'Chronische Entzündung, langsame Recovery',excess:null,interactions:'Synergistisch mit DHA. Hemmt Omega-6-Stoffwechsel.',rda:'250mg',rda_ath:'1-2g',ul:null,sources:['Fetter Fisch','Fischöl'],tip:'Recovery Game-Changer!'},
    F22D6N3:{detail:'DHA ist essentiell für Gehirnfunktion und Sehkraft. Unterstützt kognitive Leistungsfähigkeit und Herzkreislauf-Gesundheit.',deficiency:'Kognitive Probleme, Sehprobleme',excess:null,interactions:'Synergistisch mit EPA.',rda:'250mg',rda_ath:'1-2g',ul:null,sources:['Lachs','Makrele','Algenöl'],tip:null},
  };

  // ── HEUTE'S MIKROS ──
  const TODAY = {
    vitamins: [
      {key:'VITA',name:'Vitamin A',    val:864,  rda:1200, unit:'μg', pct:72},
      {key:'VITD',name:'Vitamin D',    val:5.2,  rda:20,   unit:'μg', pct:26},
      {key:'VITE',name:'Vitamin E',    val:12.4, rda:15,   unit:'mg', pct:83},
      {key:'VITK',name:'Vitamin K',    val:98,   rda:120,  unit:'μg', pct:82},
      {key:'VITC',name:'Vitamin C',    val:142,  rda:90,   unit:'mg', pct:158},
      {key:'THIA',name:'Vitamin B1',   val:1.4,  rda:1.2,  unit:'mg', pct:117},
      {key:'RIBF',name:'Vitamin B2',   val:1.8,  rda:1.3,  unit:'mg', pct:138},
      {key:'NIA', name:'Niacin (B3)',  val:22,   rda:16,   unit:'mg', pct:138},
      {key:'PANTAC',name:'Panthens. B5',val:4.2, rda:5,    unit:'mg', pct:84},
      {key:'VITB6',name:'Vitamin B6',  val:2.1,  rda:1.3,  unit:'mg', pct:162},
      {key:'BIOT',name:'Biotin (B7)',  val:28,   rda:30,   unit:'μg', pct:93},
      {key:'FOL', name:'Folat',        val:287,  rda:400,  unit:'μg', pct:72},
      {key:'VITB12',name:'Vitamin B12',val:4.8,  rda:2.4,  unit:'μg', pct:200},
    ],
    fat_soluble: ['VITA','VITD','VITE','VITK'],
    water_soluble: ['VITC','THIA','RIBF','NIA','PANTAC','VITB6','BIOT','FOL','VITB12'],
    minerals: [
      {key:'CA', name:'Calcium',   val:740,  rda:1000, unit:'mg', pct:74},
      {key:'MG', name:'Magnesium', val:354,  rda:400,  unit:'mg', pct:89},
      {key:'P',  name:'Phosphor',  val:1240, rda:700,  unit:'mg', pct:177},
      {key:'K',  name:'Kalium',    val:3100, rda:3400, unit:'mg', pct:91},
      {key:'NA', name:'Natrium',   val:2840, rda:2300, unit:'mg', pct:123},
    ],
    trace: [
      {key:'FE', name:'Eisen',    val:14.2, rda:10,  unit:'mg', pct:142},
      {key:'ZN', name:'Zink',     val:12.4, rda:11,  unit:'mg', pct:113},
      {key:'SE', name:'Selen',    val:42,   rda:55,  unit:'μg', pct:76},
      {key:'ID', name:'Jod',      val:82,   rda:150, unit:'μg', pct:55},
      {key:'CU', name:'Kupfer',   val:1.2,  rda:0.9, unit:'mg', pct:133},
      {key:'MN', name:'Mangan',   val:3.4,  rda:2.3, unit:'mg', pct:148},
      {key:'CR', name:'Chrom',    val:28,   rda:35,  unit:'μg', pct:80},
      {key:'MO', name:'Molybdän', val:38,   rda:45,  unit:'μg', pct:84},
    ],
    amino: [
      {key:'LEU',name:'Leucin',       val:12.4,rda:null,unit:'g',pct:null},
      {key:'ILE',name:'Isoleucin',    val:7.1, rda:null,unit:'g',pct:null},
      {key:'VAL',name:'Valin',        val:7.8, rda:null,unit:'g',pct:null},
      {key:'LYS',name:'Lysin',        val:9.2, rda:null,unit:'g',pct:null},
      {key:'MET',name:'Methionin',    val:3.8, rda:null,unit:'g',pct:null},
      {key:'PHE',name:'Phenylalanin', val:6.1, rda:null,unit:'g',pct:null},
      {key:'THR',name:'Threonin',     val:5.9, rda:null,unit:'g',pct:null},
      {key:'TRP',name:'Tryptophan',   val:1.8, rda:null,unit:'g',pct:null},
      {key:'HIS',name:'Histidin',     val:4.3, rda:null,unit:'g',pct:null},
    ],
    fatty: [
      {key:'F20D5N3',name:'EPA (Omega-3)',  val:0.42,rda:0.25,unit:'g',pct:168},
      {key:'F22D6N3',name:'DHA (Omega-3)',  val:0.28,rda:0.25,unit:'g',pct:112},
      {key:'F18D2N6',name:'LA (Omega-6)',   val:9.8, rda:17,  unit:'g',pct:58},
      {key:'FASAT',  name:'Ges. Fettsäuren',val:18.2,rda:null,unit:'g',pct:null},
    ],
  };

  const allWithRda=[...TODAY.vitamins,...TODAY.minerals,...TODAY.trace,...TODAY.fatty].filter(n=>n.pct!==null);
  const optimal=allWithRda.filter(n=>n.pct>=80).length;
  const adequate=allWithRda.filter(n=>n.pct>=50&&n.pct<80).length;
  const deficit=allWithRda.filter(n=>n.pct<50).length;
  const noRda=[...TODAY.amino,...TODAY.fatty.filter(n=>!n.rda)].length;

  // ── COLORS ──
  const sColor = p => p===null?'#94a3b8':p>=80?'#22c55e':p>=50?'#eab308':'#ef4444';
  const sBar   = p => p===null?'var(--surface-hover)':p>=80?'#22c55e':p>=50?'#eab308':'#ef4444';
  const sBg    = p => p===null?'var(--surface-hover)':p>=80?'var(--semantic-success-bg)':p>=50?'var(--semantic-warning-bg)':'var(--semantic-danger-bg)';
  const sIcon  = p => p===null?'⚪':p>=80?'✅':p>=50?'⚠️':'🔴';

  // ── DETAIL CARD ──
  const detailCard = (key, pct) => {
    const d = ND[key];
    if (!d) return `<div style="background:var(--brand-50);border-radius:var(--r-md);padding:10px;margin-top:6px;font-size:var(--text-micro);color:var(--brand-700)">Keine Details verfügbar.</div>`;
    const isDeficit = pct !== null && pct < 50;
    const isSurplus = pct !== null && pct > 200;
    return `
      <div style="background:linear-gradient(135deg,#eff6ff,#eef2ff);border:1px solid #bfdbfe;border-radius:var(--r-md);padding:12px;margin-top:6px;font-size:var(--text-xs)">
        ${d.detail?`<div style="display:flex;gap:8px;margin-bottom:8px"><span>📋</span><div style="color:var(--text-secondary);line-height:1.5">${d.detail}</div></div>`:''}
        ${isDeficit?`<div style="background:#fef2f2;border:1px solid #fca5a5;border-radius:var(--r-sm);padding:8px 10px;margin-bottom:8px"><span style="font-weight:700;color:#b91c1c">🔴 MANGEL-RISIKO: </span><span style="color:#b91c1c">${d.deficiency}</span></div>`:
          `<div style="display:flex;gap:8px;margin-bottom:6px"><span>⚠️</span><div><span style="font-weight:600;color:var(--text-muted)">Bei Mangel: </span><span style="color:var(--text-secondary)">${d.deficiency}</span></div></div>`}
        ${isSurplus&&d.excess?`<div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:var(--r-sm);padding:8px 10px;margin-bottom:8px"><span style="font-weight:700;color:#c2410c">🔶 ÜBERSCHUSS: </span><span style="color:#c2410c">${d.excess}</span></div>`:
          d.excess?`<div style="display:flex;gap:8px;margin-bottom:6px"><span>🔶</span><div><span style="font-weight:600;color:var(--text-muted)">Bei Überschuss: </span><span style="color:var(--text-secondary)">${d.excess}</span></div></div>`:''}
        ${d.interactions?`<div style="display:flex;gap:8px;margin-bottom:6px"><span>🔄</span><div><span style="font-weight:600;color:var(--text-muted)">Wechselwirkungen: </span><span style="color:var(--text-secondary)">${d.interactions}</span></div></div>`:''}
        <div style="display:flex;gap:8px;margin-bottom:6px"><span>🎯</span><div><span style="font-weight:600;color:var(--text-muted)">RDA Standard: </span><span style="color:var(--text-secondary)">${d.rda}</span>${d.rda_ath&&d.rda_ath!=='Standard'?` | <span style="font-weight:600;color:var(--text-muted)">Athlet: </span><span style="color:var(--brand-700)">${d.rda_ath}</span>`:''}${d.ul?` | <span style="font-weight:600;color:var(--text-muted)">⛔ Obergrenze: </span><span style="color:#ef4444">${d.ul}</span>`:''}</div></div>
        <div style="display:flex;gap:8px;margin-bottom:${d.tip?'6px':'0'}"><span>🥗</span><div><span style="font-weight:600;color:var(--text-muted)">Top-Quellen: </span><span style="color:var(--text-secondary)">${d.sources?.join(', ')}</span></div></div>
        ${d.tip?`<div style="display:flex;gap:8px"><span>💡</span><div style="color:var(--brand-700);font-style:italic;font-weight:600">${d.tip}</div></div>`:''}
      </div>`;
  };

  // ── NUTRIENT ROW ──
  const nRow = (n) => {
    const toggleId = `micro_${n.key}`;
    const barPct = n.pct !== null ? Math.min(n.pct, 200) / 2 : 0; // scale 200%=100% bar
    return `
      <div id="row_${n.key}">
        <div style="display:flex;align-items:center;gap:8px;padding:7px 0;border-bottom:1px solid var(--surface-border);cursor:pointer"
          onclick="(function(el){const d=el.nextElementSibling;d.style.display=d.style.display==='none'?'block':'none';el.querySelector('.mi-arrow').textContent=d.style.display==='none'?'›':'▾'})(this)">
          <span style="font-size:12px;flex-shrink:0">${sIcon(n.pct)}</span>
          <div style="flex:1;font-size:var(--text-xs);font-weight:var(--fw-medium);color:var(--text-primary)">${n.name}</div>
          <div style="width:80px;height:4px;background:var(--surface-hover);border-radius:2px;overflow:hidden;flex-shrink:0">
            <div style="height:100%;width:${barPct}%;background:${sBar(n.pct)};border-radius:2px"></div>
          </div>
          <div style="width:52px;text-align:right;font-size:var(--text-micro);color:var(--text-muted);flex-shrink:0">${n.val}${n.unit}</div>
          <div style="width:30px;text-align:right;font-size:var(--text-micro);font-weight:var(--fw-bold);color:${sColor(n.pct)};flex-shrink:0">${n.pct!==null?n.pct+'%':'—'}</div>
          <span class="mi-arrow" style="font-size:12px;color:var(--text-muted);flex-shrink:0">›</span>
        </div>
        <div style="display:none">${detailCard(n.key, n.pct)}</div>
      </div>`;
  };

  // ── GROUP ──
  const group = (icon, title, items, badge, subGroups) => {
    const id = `mg_${title.replace(/\s/g,'')}`;
    const defCount = items.filter(n=>n.pct!==null&&n.pct<50).length;
    const optCount = items.filter(n=>n.pct!==null&&n.pct>=80).length;
    return `
      <div style="border:1px solid var(--surface-border);border-radius:var(--r-lg);overflow:hidden;background:var(--surface-card)">
        <div style="display:flex;align-items:center;padding:12px 14px;cursor:pointer;background:var(--surface-card-alt)"
          onclick="(function(el){const b=el.nextElementSibling;b.style.display=b.style.display==='none'?'block':'none';el.querySelector('.mg-arr').textContent=b.style.display==='none'?'▶':'▼'})(this)">
          <span style="font-size:16px;margin-right:8px">${icon}</span>
          <span style="font-size:var(--text-xs);font-weight:var(--fw-semibold);color:var(--text-primary);flex:1">${title} (${items.length})</span>
          ${defCount>0?`<span style="font-size:9px;padding:2px 6px;border-radius:var(--r-full);background:var(--semantic-danger-bg);color:var(--semantic-danger-text);font-weight:700;margin-right:6px">${defCount} Mangel</span>`:
            optCount>0?`<span style="font-size:9px;padding:2px 6px;border-radius:var(--r-full);background:var(--semantic-success-bg);color:var(--semantic-success-text);font-weight:700;margin-right:6px">✅ ${optCount}/${items.filter(n=>n.pct!==null).length}</span>`:''}
          <span class="mg-arr" style="font-size:10px;color:var(--text-muted)">▶</span>
        </div>
        <div style="display:none;padding:0 14px 6px">
          ${subGroups?subGroups(items):''}
          ${!subGroups?items.map(nRow).join(''):''}
        </div>
      </div>`;
  };

  const vitSubGroups = () => `
    <div style="padding:8px 0 2px">
      <div style="font-size:var(--text-micro);font-weight:var(--fw-semibold);color:var(--text-muted);text-transform:uppercase;letter-spacing:.06em;margin-bottom:4px;cursor:pointer"
        onclick="(function(el){const b=el.nextElementSibling;b.style.display=b.style.display==='none'?'block':'none'})(this)">
        Fettlöslich (A/D/E/K) ›</div>
      <div>${TODAY.vitamins.filter(v=>TODAY.fat_soluble.includes(v.key)).map(nRow).join('')}</div>
    </div>
    <div style="padding:4px 0 2px">
      <div style="font-size:var(--text-micro);font-weight:var(--fw-semibold);color:var(--text-muted);text-transform:uppercase;letter-spacing:.06em;margin-bottom:4px;cursor:pointer"
        onclick="(function(el){const b=el.nextElementSibling;b.style.display=b.style.display==='none'?'block':'none'})(this)">
        Wasserlöslich (B-Komplex + C) ›</div>
      <div>${TODAY.vitamins.filter(v=>TODAY.water_soluble.includes(v.key)).map(nRow).join('')}</div>
    </div>`;

  return `
    <div style="display:flex;flex-direction:column;gap:10px">
      <div style="display:flex;align-items:center;justify-content:space-between">
        <div style="font-size:var(--text-sm);font-weight:var(--fw-bold);color:var(--text-primary)">Mikronährstoffe</div>
        <div style="display:flex;gap:3px">
          ${['Heute','7d','14d','30d'].map((l,i)=>`<div style="padding:4px 8px;border-radius:var(--r-sm);background:${i===0?'var(--accent-nutrition)':'var(--surface-hover)'};color:${i===0?'#fff':'var(--text-secondary)'};font-size:var(--text-micro);cursor:pointer">${l}</div>`).join('')}
        </div>
      </div>

      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px">
        ${[{v:optimal,l:'Optimal',c:'#22c55e',bg:'var(--semantic-success-bg)'},{v:adequate,l:'Adequate',c:'#eab308',bg:'var(--semantic-warning-bg)'},{v:deficit,l:'Defizit',c:'#ef4444',bg:'var(--semantic-danger-bg)'},{v:noRda,l:'Kein RDA',c:'#94a3b8',bg:'var(--surface-hover)'}].map(s=>`
          <div style="background:${s.bg};border-radius:var(--r-md);padding:10px;text-align:center">
            <div style="font-size:20px;font-weight:var(--fw-bold);color:${s.c}">${s.v}</div>
            <div style="font-size:var(--text-micro);color:${s.c}">${s.l}</div>
          </div>`).join('')}
      </div>

      ${group('💊','Vitamine',TODAY.vitamins,'',vitSubGroups)}
      ${group('🪨','Mineralstoffe',TODAY.minerals,'')}
      ${group('🔬','Spurenelemente',TODAY.trace,'')}
      ${group('💪','Aminosäuren',TODAY.amino,'')}
      ${group('🫒','Fettsäuren',TODAY.fatty,'')}
    </div>`;
};
