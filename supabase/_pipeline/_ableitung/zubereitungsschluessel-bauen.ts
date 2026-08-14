// Erzeugt supabase/_pipeline/daten/zubereitungsschluessel.json aus der
// Kreuztabelle plus einer HANDKLASSIFIKATION.
//
// Die Klassifikation selbst steht hier von Hand — sie ist eine
// Entscheidung, keine Ableitung. Der BELEG kommt aus den Daten, die
// EINORDNUNG von mir, und strittige Faelle sind markiert.
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const C = 'supabase_db_LumeOS-Claude-V1'
const DB = process.env.PGDATABASE ?? 'postgres'
const SEP = ''
const sql = (t: string) => execFileSync('docker',
  ['exec', C, 'psql', '-U', 'postgres', '-d', DB, '-t', '-A', '-F', SEP, '-c', t],
  { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 })
  .split('\n').map(z => z.trimEnd()).filter(Boolean).map(z => z.split(SEP))

const roh = sql(`SELECT left(bls_code,1), substr(bls_code,5,3), bls_code,
  replace(coalesce(name_de,''),chr(1),' ') FROM nutrition.foods ORDER BY bls_code;`)
type Z = { wg: string; z: string; code: string; name: string }
const eintraege: Z[] = roh.map(r => ({ wg: r[0], z: r[1], code: r[2], name: r[3] }))
const zellen = new Map<string, Z[]>()
for (const e of eintraege) {
  const k = e.wg + e.z
  const v = zellen.get(k); if (v) v.push(e); else zellen.set(k, [e])
}

const falte = (s: string) => s.toLowerCase()
  .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
  .replace(/[^a-z0-9]+/g, ' ').replace(/\s+/g, ' ').trim()

const BAUSTEINE = ['saft','nektar','mehl','pulver','staerke','kleie','flocken','gries',
  'schrot','kern','drink','creme','mus','mark','getrocknet','geraeuchert','geroestet',
  'gesalzen','gezuckert','gekocht','gebraten','gegrillt','gebacken','geduenstet',
  'geschmort','tiefgefroren','konserve','roh']
const FUELL = new Set(['mit','ohne','und','oder','aus','der','die','das','vom','zum','art','ganzes'])

function beleg(liste: Z[]) {
  const namen = liste.map(e => falte(e.name)).filter(Boolean)
  if (!namen.length) return { art: 'ungeklaert', merkmal: '', anteil: 0 }
  const koepfe = namen.map(n => n.split(' ')[0]).filter(Boolean)
  const kk = koepfe.reduce((a, b) => (a.length <= b.length ? a : b), koepfe[0] ?? '')
  for (let n = Math.min(kk.length, 12); n >= 3; n--) {
    const kand = kk.slice(-n)
    if (/^\d+$/.test(kand)) continue
    if (koepfe.every(x => x.endsWith(kand))) return { art: 'suffix', merkmal: kand, anteil: 1 }
  }
  const zae = new Map<string, number>()
  for (const n of namen) for (const w of new Set(n.split(' '))) {
    if (w.length < 3 || /^\d+$/.test(w)) continue
    zae.set(w, (zae.get(w) ?? 0) + 1)
  }
  const s = [...zae.entries()].filter(([w]) => !FUELL.has(w))
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
  if (s.length) {
    const [w, n] = s[0]; const a = n / namen.length
    if (a === 1) return { art: 'wort', merkmal: w, anteil: a }
    if (a >= 0.8) return { art: 'mehrheit', merkmal: w, anteil: a }
  }
  let best: [string, number] | null = null
  for (const b of BAUSTEINE) {
    const n = namen.filter(x => x.includes(b)).length
    if (n / namen.length >= 0.8 && (!best || n > best[1])) best = [b, n]
  }
  if (best) return { art: 'wortteil', merkmal: best[0], anteil: best[1] / namen.length }
  return { art: 'ungeklaert', merkmal: '', anteil: 0 }
}

// ---- HANDKLASSIFIKATION ----
// Schluessel: "WG+Code" oder "*+Code" (gilt fuer alle Warengruppen).
// Wert: [klasse, bemerkung, strittig]
type Eintrag = [string, string, boolean]
const HAND: Record<string, Eintrag> = {
  // --- ERZEUGNIS: aus derselben Ausgangsware wird etwas anderes ---
  'F600': ['erzeugnis', 'Fruchtsaft — anderer Naehrwert, andere Menge, andere Suchabsicht als die Frucht', false],
  'F700': ['erzeugnis', 'Fruchtnektar — Saft plus Wasser und Zucker, eigenes Erzeugnis', false],
  'G600': ['erzeugnis', 'Gemuesesaft', false],
  'N100': ['erzeugnis', 'Getraenk aus Kaffee/Tee — die Bohne ist nicht das Getraenk', false],

  // --- ZUBEREITUNG: dieselbe Art, anders behandelt ---
  '*100': ['zubereitung', 'roh', false],
  '*000': ['zubereitung', 'Grundform ohne Zubereitungsvariante', false],
  'C032': ['zubereitung', 'gekocht', false],
  'C132': ['zubereitung', 'gekocht', false],
  'E032': ['zubereitung', 'gekocht', false],
  'E082': ['zubereitung', 'gekocht, dann gebraten ohne Fett', false],
  'E132': ['zubereitung', 'gekocht', false],
  'F152': ['zubereitung', 'geduenstet', false],
  'F400': ['zubereitung', 'getrocknet — Trockenobst bleibt die Frucht', true],
  'F902': ['zubereitung', 'Konserve, abgetropft', false],
  'G132': ['zubereitung', 'gekocht', false],
  'G142': ['zubereitung', 'geschmort ohne Fett', false],
  'G152': ['zubereitung', 'geduenstet', false],
  'G162': ['zubereitung', 'gebacken', false],
  'G182': ['zubereitung', 'gebraten ohne Fett (Pfanne)', false],
  'G200': ['zubereitung', 'tiefgefroren', false],
  'G232': ['zubereitung', 'tiefgefroren, gekocht', false],
  'G242': ['zubereitung', 'tiefgefroren, geschmort', false],
  'G252': ['zubereitung', 'tiefgefroren, geduenstet', false],
  'G262': ['zubereitung', 'tiefgefroren, gebacken', false],
  'G282': ['zubereitung', 'tiefgefroren, gebraten', false],
  'G400': ['zubereitung', 'getrocknet (Kraeuter) — hier ist der Zweifel am groessten', true],
  'G802': ['zubereitung', 'gesaeuert, abgetropft', false],
  'G902': ['zubereitung', 'Konserve, abgetropft', false],
  'H600': ['zubereitung', 'geroestet', false],
  'K152': ['zubereitung', 'geduenstet', false],
  'K182': ['zubereitung', 'gebraten ohne Fett (Pfanne)', false],
  'K200': ['zubereitung', 'tiefgefroren', false],
  'K400': ['zubereitung', 'getrocknet', true],
  'K432': ['zubereitung', 'getrocknet, gekocht', false],
  'M200': ['zubereitung', 'Fettstufe — dieselbe Sorte, anderer Fettgehalt', true],
  'M300': ['zubereitung', 'Fettstufe', true],
  'M400': ['zubereitung', 'Fettstufe', true],
  'M500': ['zubereitung', 'Fettstufe', true],
  'M600': ['zubereitung', 'Fettstufe', true],
  'M700': ['zubereitung', 'Fettstufe', true],
  'M800': ['zubereitung', 'Fettstufe', true],
  'T152': ['zubereitung', 'geduenstet', false],
  'T162': ['zubereitung', 'gebraten ohne Fett (Ofen)', false],
  'T172': ['zubereitung', 'gegrillt', false],
  'T182': ['zubereitung', 'gebraten ohne Fett (Pfanne)', false],
  'T200': ['zubereitung', 'tiefgefroren', false],
  'T232': ['zubereitung', 'tiefgefroren, gekocht', false],
  'T252': ['zubereitung', 'tiefgefroren, geduenstet', false],
  'T262': ['zubereitung', 'tiefgefroren, gebraten (Ofen)', false],
  'T272': ['zubereitung', 'tiefgefroren, gegrillt', false],
  'T282': ['zubereitung', 'tiefgefroren, gebraten (Pfanne)', false],
  'T400': ['zubereitung', 'gesalzen', false],
  'T600': ['zubereitung', 'geraeuchert', false],
  'T702': ['zubereitung', 'in Oel, Konserve, abgetropft', false],
  'U132': ['zubereitung', 'gekocht', false],
  'U142': ['zubereitung', 'geschmort ohne Fett', false],
  'U162': ['zubereitung', 'gebraten ohne Fett (Ofen)', false],
  'U172': ['zubereitung', 'gegrillt', false],
  'U182': ['zubereitung', 'gebraten ohne Fett (Pfanne)', false],
  'U200': ['zubereitung', 'tiefgefroren', false],
  'U232': ['zubereitung', 'tiefgefroren, gekocht', false],
  'U242': ['zubereitung', 'tiefgefroren, geschmort', false],
  'U262': ['zubereitung', 'tiefgefroren, gebraten (Ofen)', false],
  'U272': ['zubereitung', 'tiefgefroren, gegrillt', false],
  'U282': ['zubereitung', 'tiefgefroren, gebraten (Pfanne)', false],
  'U700': ['zubereitung', 'geraeuchert/Rohpoekelware', true],
  'V132': ['zubereitung', 'gekocht', false],
  'V142': ['zubereitung', 'geschmort ohne Fett', false],
  'V162': ['zubereitung', 'gebraten ohne Fett (Ofen)', false],
  'V172': ['zubereitung', 'gegrillt', false],
  'V182': ['zubereitung', 'gebraten ohne Fett (Pfanne)', false],
  'V200': ['zubereitung', 'tiefgefroren', false],
  'V232': ['zubereitung', 'tiefgefroren, gekocht', false],
  'V242': ['zubereitung', 'tiefgefroren, geschmort', false],
  'V262': ['zubereitung', 'tiefgefroren, gebraten (Ofen)', false],
  'V272': ['zubereitung', 'tiefgefroren, gegrillt', false],
  'V282': ['zubereitung', 'tiefgefroren, gebraten (Pfanne)', false],
  'W032': ['zubereitung', 'gekocht', false],
  'W082': ['zubereitung', 'gebraten ohne Fett (Pfanne)', false],
}

const MINDEST = 10
const gross = [...zellen.entries()].filter(([, v]) => v.length >= MINDEST)
  .sort((a, b) => a[0].localeCompare(b[0]))

const zeilen = gross.map(([k, liste]) => {
  const b = beleg(liste)
  const hand = HAND[k] ?? HAND['*' + k.slice(1)]
  return {
    warengruppe: k[0],
    code: k.slice(1),
    eintraege: liste.length,
    beleg: b.art === 'ungeklaert' ? null : { art: b.art, merkmal: b.merkmal, anteil: Number(b.anteil.toFixed(2)) },
    klasse: hand ? hand[0] : (b.art === 'ungeklaert' ? 'ungeklaert' : 'unklassifiziert'),
    bemerkung: hand ? hand[1] : null,
    strittig: hand ? hand[2] : false,
    beispiele: liste.slice(0, 3).map(e => e.name),
  }
})

const ziel = 'supabase/_pipeline/daten/zubereitungsschluessel.json'
fs.mkdirSync(path.dirname(ziel), { recursive: true })
fs.writeFileSync(ziel, JSON.stringify({
  erhoben: '2026-08-16',
  anlass: 'C-33 — die Bedeutung der Stellen 5-7 haengt von der Warengruppe ab',
  quelle: 'abgeleitet aus nutrition.foods; die amtliche BLS-Dokumentation enthaelt keine Schluesselliste',
  mindestgroesse: MINDEST,
  kombinationen_gesamt: zellen.size,
  kombinationen_erfasst: zeilen.length,
  klassen: {
    zubereitung: 'dieselbe Art, anders behandelt — bleibt in der Gruppe',
    erzeugnis: 'etwas anderes aus derselben Ausgangsware — bildet eine eigene Gruppe',
    ungeklaert: 'kein gemeinsames Merkmal auffindbar — keine Bedeutung erfunden',
    unklassifiziert: 'Merkmal belegt, aber nicht von Hand eingeordnet',
  },
  zellen: zeilen,
}, null, 2) + '\n', { encoding: 'utf8' })

const z = (k: string) => zeilen.filter(x => x.klasse === k).length
console.log('geschrieben:', ziel)
console.log('  Zellen erfasst   :', zeilen.length)
console.log('  zubereitung      :', z('zubereitung'))
console.log('  erzeugnis        :', z('erzeugnis'))
console.log('  ungeklaert       :', z('ungeklaert'))
console.log('  unklassifiziert  :', z('unklassifiziert'))
console.log('  davon strittig   :', zeilen.filter(x => x.strittig).length)
