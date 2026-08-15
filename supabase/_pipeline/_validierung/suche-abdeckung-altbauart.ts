// Die ALTE Bauart auf der HEUTIGEN Datenbank.
//
// Warum: 48,0 % (alt, 2026-08-14) gegen 79,5 % (neu) waere ein
// Aepfel-Birnen-Vergleich — die alte Zahl fragte, ob das GEZOGENE
// Lebensmittel in der Trefferliste auftaucht, die neue fragt, ob das
// RICHTIGE oben steht. Um zu wissen, wieviel davon auf C-38 entfaellt
// und wieviel auf die geaenderte Frage, wird die alte Bauart hier
// unveraendert wiederholt.
import { execFileSync } from 'node:child_process'
import { buildFoodSearchGroups } from '../../../apps/web/src/lib/nutrition/food-search'

const C = 'supabase_db_LumeOS-Claude-V1'
const SEP = ''
const sql = (q: string) => execFileSync('docker',
  ['exec', C, 'psql', '-U', 'postgres', '-d', 'postgres', '-t', '-A', '-F', SEP, '-c', q],
  { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024, timeout: 30_000 })
  .split('\n').map(z => z.trim()).filter(Boolean).map(z => z.split(SEP))

const foods = sql(`select bls_code, name_de, split_part(name_de, ',', 1) from nutrition.foods order by bls_code;`)

// UNVERAENDERT aus der ersten Fassung, inkl. der Beiwoerter.
const ZUBEREITUNG = /^(roh|frisch|gekocht|gebacken|gebraten|gegrillt|ged[üu]nstet|geschmort|ger[äa]uchert|getrocknet|frittiert|paniert|pochiert|gegart|gesalzen|ges[üu][ßs]t|gezuckert|abgetropft|tiefgefroren|mager|fettarm|ohne|mit|und|im|in|aus|wie)$/i
function menschlich(kopf: string): string {
  return kopf.replace(/\(.*?\)/g, ' ').split(/[\s\/]+/)
    .map(w => w.replace(/[^A-Za-zÄÖÜäöüß0-9]/g, ''))
    .filter(w => w.length >= 3 && !ZUBEREITUNG.test(w))
    .slice(0, 2).join(' ').toLowerCase()
    .replace(/ä/g,'ae').replace(/ö/g,'oe').replace(/ü/g,'ue').replace(/ß/g,'ss')
}

const schritt = Math.max(1, Math.floor(foods.length / 150))
const gewaehlt = foods.filter((_, i) => i % schritt === 0)

let platz1 = 0, top10 = 0, nichts = 0, gepr = 0
for (const [code, , kopf] of gewaehlt) {
  const q = menschlich(kopf)
  if (q.length < 3) continue
  gepr++
  const g = JSON.stringify(buildFoodSearchGroups(q)).replace(/'/g, "''")
  const qq = q.replace(/'/g, "''")
  const r = sql(`select coalesce(x->>'bls_code','') from (
      select (nutrition.food_search('${qq}','${qq}',ARRAY[]::text[],NULL,NULL,NULL,NULL,NULL,10,0,NULL,NULL,NULL,'${g}'::jsonb))::jsonb j
    ) t, lateral jsonb_array_elements(j->'foods') with ordinality e(x,o);`)
  const p = r.findIndex(([c]) => c === code)
  if (r.length === 0) nichts++
  else if (p === 0) { platz1++; top10++ }
  else if (p >= 0) top10++
}

const n = gewaehlt.length
console.log('ALTE Bauart (gezogenes Food muss auftauchen), HEUTIGE Datenbank')
console.log(`  geprueft         : ${gepr} von ${n}`)
console.log(`  Platz 1          : ${platz1}  (${(100 * platz1 / n).toFixed(1)} %)`)
console.log(`  in den ersten 10 : ${top10}  (${(100 * top10 / n).toFixed(1)} %)`)
console.log(`  gar nichts       : ${nichts}  (${(100 * nichts / n).toFixed(1)} %)`)
console.log('')
console.log('Vergleichswert 2026-08-14 (dieselbe Bauart, vor Block 32 und C-38):')
console.log('  48,0 % Platz 1 · 90,8 % in den ersten zehn · 0 % gar nichts')
