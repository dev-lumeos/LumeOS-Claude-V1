// EINMALIGER Erzeuger der Sollwertliste fuer C-23.
//
// Er wendet die im Messskript ausgeschriebene Regel an und legt das
// Ergebnis als Datendatei ab. Danach steht die Liste FEST — sie wird
// nicht bei jedem Lauf neu gerechnet, sonst bezoege die Pruefung ihre
// Sollwerte vom Prueflig.
//
// Jede Zeile traegt den Grund der Wahl, damit sie nachpruefbar ist.
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'

const C = 'supabase_db_LumeOS-Claude-V1'
const SEP = ''
const sql = (q: string) => execFileSync('docker',
  ['exec', C, 'psql', '-U', 'postgres', '-d', 'postgres', '-t', '-A', '-F', SEP, '-c', q],
  { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 })
  .split('\n').map(z => z.trim()).filter(Boolean).map(z => z.split(SEP))

const foods = sql(`select bls_code, name_de, split_part(name_de, ',', 1) from nutrition.foods order by bls_code;`)

const ZUBEREITUNG = /^(roh|frisch|gekocht|gebacken|gebraten|gegrillt|ged[üu]nstet|geschmort|ger[äa]uchert|getrocknet|frittiert|paniert|pochiert|gegart|gesalzen|ges[üu][ßs]t|gezuckert|abgetropft|tiefgefroren|mager|fettarm|ohne|mit|und|im|in|aus|wie)$/i
// Beiwoerter aus dem Bestandsnamen, die keine Anfrage sind.
// `[cmd]` 42 der 152 erzeugten Anfragen trugen so ein Wort:
// "zucchini fett", "schnittkaese mind", "mornaysauce von".
const BEIWORT = new Set(['fett','nach','mind','bunt','sauer','rot','einfach',
  'gefuellt','gemahlen','schnittfest','bologneser','amerikanische','italienische',
  'asiatische','europaeische','neuseelaender','berner','fuer','von','gebunden',
  'ungesuesst','suessungsmitteln','gewuerzauszuegen','essigmarinade','essigmarinde',
  'geduensteten','ofen','pfanne','muerbeteig','hefeteig','konserve','art','natur'])

function anfrage(kopf: string): string {
  return kopf.replace(/\(.*?\)/g, ' ').split(/[\s\/]+/)
    .map(w => w.replace(/[^A-Za-zÄÖÜäöüß0-9]/g, ''))
    .filter(w => w.length >= 3 && !ZUBEREITUNG.test(w))
    .map(w => w.toLowerCase().replace(/ä/g,'ae').replace(/ö/g,'oe').replace(/ü/g,'ue').replace(/ß/g,'ss'))
    .filter(w => !BEIWORT.has(w))
    .slice(0, 2).join(' ')
}

const schritt = Math.max(1, Math.floor(foods.length / 150))
const gewaehlt = foods.filter((_, i) => i % schritt === 0)

const faelle: Array<[string, string, string, string]> = []
let ausGrundform = 0, ausSelbst = 0, ohne = 0

for (const [code, name, kopf] of gewaehlt) {
  const q = anfrage(kopf)
  if (q.length < 3) {
    ohne++
    faelle.push(['', '', code, `keine brauchbare Anfrage aus "${name}" ableitbar`])
    continue
  }
  const bed = q.split(' ').map(w => `nutrition.search_fold(name_de) LIKE '%${w}%'`).join(' AND ')
  const kand = sql(`select bls_code, left(name_de,60) from nutrition.foods
    where substr(bls_code,5,3) in ('100','000') and ${bed}
    order by sort_weight desc, length(name_de) limit 1;`)
  if (kand.length) {
    ausGrundform++
    faelle.push([q, kand[0][0], code,
      `Grundform "${kand[0][1]}" — gezogen war "${name.slice(0, 40)}"`])
  } else {
    ausSelbst++
    faelle.push([q, code, code, `einzige Form: "${name.slice(0, 46)}"`])
  }
}

fs.writeFileSync('supabase/_pipeline/daten/abdeckung-sollwerte.json', JSON.stringify({
  erhoben: '2026-08-15',
  anlass: 'C-23 — Abdeckungsmessung mit Erwartungen statt ohne',
  regel: 'VON HAND GEPFLEGT nach der einmaligen Erzeugung. Diese Liste darf ihre Werte NICHT bei jedem Lauf aus der Datenbank neu ableiten — sonst bezieht die Pruefung ihre Sollwerte vom Prueflig und bestaetigt jeden Zustand.',
  stichprobe: `jedes ${schritt}. Lebensmittel nach bls_code, deterministisch`,
  sollwertregel: 'Grundform derselben Art (Zubereitungscode 100/000, Name traegt alle Anfragewoerter, hoechstes sort_weight, kuerzester Name). Gibt es keine, ist der Sollwert das gezogene Lebensmittel selbst.',
  kennzahlen: { gesamt: faelle.length, aus_grundform: ausGrundform, einzige_form: ausSelbst, ohne_anfrage: ohne },
  faelle,
}, null, 1) + '\n', { encoding: 'utf8' })

console.log(`geschrieben: ${faelle.length} Faelle`)
console.log(`  Sollwert = Grundform      : ${ausGrundform}`)
console.log(`  Sollwert = gezogenes Food : ${ausSelbst}  (einzige Form)`)
console.log(`  ohne brauchbare Anfrage   : ${ohne}`)
