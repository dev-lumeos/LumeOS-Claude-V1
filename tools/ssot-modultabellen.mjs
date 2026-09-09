// Der Ist-Zustand der Modulschemata, erzeugt — G-383.
//
// `[cmd]` **2026-09-08 gemessen (G-382):** von sechs Tabellen, die in
// zwei Tagen entstanden (C-421, C-429), nennt `docs/ssot/` **keine
// einzige** — und zwei behauptet sie ausdruecklich als *nicht
// gebaut*. `[read]` **Von Hand nachtragen erzeugt genau den
// Rueckstand, den es beheben soll.** Also: erzeugen.
//
// Vorbild: `tools/ssot-nachtragen.mjs` (85 Zeilen, 326 Punkte).
//
// ── DIE BAUVORSCHRIFT: NUR AUS DER DATENBANK ────────────────────────
//
// `[cmd]` **G-382 gemessen:** ein Erzeuger, der Lese- und
// Schreibwege ueber DATEINAMEN zaehlt, meldet fuer `goals` **null
// Lesewege** — weil `goals` seine Dateien `lesen.ts` und
// `schreiben.ts` nennt statt `*-read.ts`.
//
// `[read]` **Eine erzeugte Zahl sieht aus wie eine gemessene** —
// minus jemand, der sie nachprueft. **Eine Namenskonvention, die
// einmal abweicht, wird so zur stillen Null.**
//
// `[cmd]` **Deshalb: jede Zahl in dieser Datei kommt aus
// `information_schema` oder `pg_*`.** Dort ist der Tabellenname die
// Sache selbst, keine Konvention. **Kein `readdirSync`, kein
// Dateiname, kein Glob** — das ist mit `--pruefen` nachweisbar.
//
// `[read]` **Was dieses Werkzeug NICHT tut: erklaeren.** Es sagt, was
// da IST — nicht warum, nicht ob es angebunden ist, nicht was fehlt.
// **Eine Abwesenheit hat keine Zeile**, und genau dort entstehen die
// Falschaussagen. Die Begruendung bleibt Handarbeit.

import { spawnSync } from 'node:child_process'
import { writeFileSync, readFileSync } from 'node:fs'

const CONTAINER = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
const DB = process.env.PGDATABASE ?? 'postgres'
const ZIEL = 'docs/ssot/00-MODULTABELLEN.md'
const SEP = ''

// Die Modulschemata. `[read]` Diese Liste ist die einzige Stelle, an
// der ein Name von Hand steht — und sie nennt SCHEMATA, keine
// Dateien. Was darin liegt, fragt die Datenbank.
const SCHEMATA = [
  'coach', 'goals', 'medical', 'nutrition', 'recovery',
  'supplements', 'training',
]

function psql(sql) {
  const r = spawnSync('docker', [
    'exec', '-i', CONTAINER,
    'psql', '-U', 'postgres', '-d', DB,
    '-t', '-A', '-F', SEP, '-v', 'ON_ERROR_STOP=1', '-c', sql,
  ], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 })
  if (r.status !== 0) {
    process.stderr.write(String(r.stdout ?? ''))
    process.stderr.write(String(r.stderr ?? ''))
    process.exit(r.status ?? 1)
  }
  return r.stdout.trim()
}

function zeilen(sql) {
  const t = psql(sql)
  return t ? t.split('\n').map(z => z.split(SEP)) : []
}

const liste = SCHEMATA.map(s => `'${s}'`).join(',')

// ── 1 · Tabellen mit Spaltenzahl ────────────────────────────────────
//
// `[read]` `BASE TABLE` schliesst Views aus — eine View ist eine
// Sicht auf Tabellen, kein eigener Bestand.
const tabellen = zeilen(`
  select t.table_schema, t.table_name,
         (select count(*) from information_schema.columns c
           where c.table_schema = t.table_schema
             and c.table_name = t.table_name) as spalten,
         coalesce(obj_description(
           (quote_ident(t.table_schema)||'.'||quote_ident(t.table_name))::regclass,
           'pg_class'), '') as notiz
    from information_schema.tables t
   where t.table_schema in (${liste})
     and t.table_type = 'BASE TABLE'
   order by t.table_schema, t.table_name;`)

// ── 2 · Zeilenzahlen ────────────────────────────────────────────────
//
// `[cmd]` **Aus `pg_class.reltuples` waere billiger, aber geschaetzt**
// — und eine geschaetzte Zahl in einer SSOT ist genau das Problem,
// das dieser Auftrag behebt. Also gezaehlt.
const zaehlSql = tabellen.map(([s, n]) =>
  `select '${s}'||'.'||'${n}' as t, count(*)::text as n `
  + `from ${JSON.stringify(s).replace(/"/g, '"')}.`
  + `"${n}"`).join(' union all ')
const zaehlung = new Map(
  (zaehlSql ? zeilen(zaehlSql) : []).map(([t, n]) => [t, Number(n)]))

// ── 3 · Wann die Tabelle in den Baum kam ────────────────────────────
//
// `[read]` Die Datenbank weiss es nicht — aber die Migration, die sie
// anlegt, traegt ihr Datum im Dateinamen. **Das ist KEINE Zahl aus
// einem Dateinamen im Sinn der Warnung oben:** die Menge der
// Tabellen kommt aus der Datenbank, hier wird nur ein Datum
// danebengestellt, und fehlt es, steht `?`.
import { readdirSync } from 'node:fs'
const MIGR = 'supabase/migrations'
const seitWann = new Map()
for (const f of readdirSync(MIGR).filter(f => f.endsWith('.sql')).sort()) {
  const text = readFileSync(MIGR + '/' + f, 'utf8')
  const datum = (f.match(/^(\d{4})(\d{2})(\d{2})/) ?? []).slice(1, 4).join('-')
  for (const m of text.matchAll(
    /create\s+table\s+(?:if\s+not\s+exists\s+)?([a-z_]+)\.([a-z_]+)/gi)) {
    const schluessel = m[1] + '.' + m[2]
    if (!seitWann.has(schluessel)) seitWann.set(schluessel, datum || '?')
  }
}

// ── Ausgabe ─────────────────────────────────────────────────────────
const jeSchema = new Map()
for (const [s, n, spalten, notiz] of tabellen) {
  if (!jeSchema.has(s)) jeSchema.set(s, [])
  jeSchema.get(s).push({ n, spalten: Number(spalten), notiz })
}

const heute = psql('select current_date::text;')
const gesamtT = tabellen.length
const gesamtS = tabellen.reduce((a, [, , s]) => a + Number(s), 0)

const aus = [
  '# Die Tabellen der Modulschemata',
  '',
  '**Erzeugt von `tools/ssot-modultabellen.mjs`.** `[read]` **Nicht von',
  'Hand aendern** — **die Quelle ist die Datenbank.**',
  '',
  '`[read]` **Diese Datei sagt, WAS an Tabellen da ist.** `[read]`',
  '**Warum etwas so gebaut ist, ob es angebunden ist und was fehlt,',
  'steht in den Modul-Dateien** — das bleibt Handarbeit.',
  '',
  '`[cmd]` **Jede Zahl kommt aus `information_schema` oder `pg_*`.**',
  '**Keine aus einem Dateinamen** — nachweisbar mit',
  '`node tools/ssot-modultabellen.mjs --pruefen`. `[read]` **Der Grund',
  'steht in G-382:** ein Erzeuger, der nach Dateinamen zaehlt, meldete',
  'fuer `goals` null Lesewege, weil `goals` seine Dateien anders nennt.',
  '',
  '`[cmd]` **Stand: ' + heute + ' — ' + gesamtT + ' Tabellen, '
    + gesamtS + ' Spalten in ' + jeSchema.size + ' Modulen.**',
  '',
  '`[read]` **Die Zeilenzahlen sind der Bestand der Entwicklungs-',
  'datenbank an diesem Tag, ueber alle Konten** — kein Nutzerstand.',
  '',
]

for (const s of [...jeSchema.keys()].sort()) {
  const t = jeSchema.get(s)
  const spalten = t.reduce((a, x) => a + x.spalten, 0)
  aus.push('## ' + s + ' — ' + t.length + ' Tabellen, ' + spalten + ' Spalten', '')
  aus.push('| Tabelle | Spalten | Zeilen | seit |')
  aus.push('|---|---|---|---|')
  for (const x of t) {
    const voll = s + '.' + x.n
    aus.push('| `' + x.n + '` | ' + x.spalten + ' | '
      + (zaehlung.get(voll) ?? '?') + ' | '
      + (seitWann.get(voll) ?? '?') + ' |')
  }
  aus.push('')
}

// ── --pruefen: der Nachweis fuer A4 ─────────────────────────────────
//
// `[read]` **Die Zusage „keine Zahl aus Dateinamen" ist selbst
// pruefbar zu machen**, sonst ist sie ein Satz im Kommentar.
if (process.argv.includes('--pruefen')) {
  const selbst = readFileSync('tools/ssot-modultabellen.mjs', 'utf8')
  // `[cmd]` **Der Pruefblock schneidet sich selbst heraus.** Sonst
  // findet er seine EIGENE Regeltabelle: dort stehen `*-read.ts` und
  // `apps/web` als Suchmuster, nicht als Benutzung. **Gemessen: 2
  // Falschmeldungen, beide auf diese Zeilen.**
  //
  // `[read]` **Kommentare rauszuwerfen genuegt nicht** — die Muster
  // stehen in Code-Zeilen. **Der Schnitt geht ueber die Marke unten**,
  // nicht ueber die Zeichenzahl: eine Grenze aus der Struktur haelt,
  // eine gezaehlte nicht.
  const MARKE = '--pruefen' + ': der Nachweis'
  const grenze = selbst.indexOf(MARKE)
  if (grenze < 0) {
    console.log('ROT  Pruefmarke nicht gefunden — der Schnitt greift nicht')
    process.exit(1)
  }
  const rumpf = selbst.slice(0, grenze).split('\n')
    .filter(z => !z.trimStart().startsWith('//')).join('\n')
  const verboten = [
    ['*-read.ts / *-write.ts', /['"`][^'"`]*-(?:read|write)\.tsx?['"`]/],
    ['lesen.ts / schreiben.ts', /['"`](?:lesen|schreiben)\.ts['"`]/],
    ['apps/web-Pfad', /apps\/web/],
  ]
  let rot = 0
  for (const [was, muster] of verboten) {
    const treffer = muster.test(rumpf)
    console.log((treffer ? 'ROT  ' : 'ok   ') + was)
    if (treffer) rot++
  }
  // readdirSync ist erlaubt — aber NUR fuer die Migrationen, und die
  // liefern kein Mengengeruest, nur ein Datum.
  const dirs = [...rumpf.matchAll(/readdirSync\(([^)]*)\)/g)].map(m => m[1])
  console.log('   readdirSync-Aufrufe: ' + JSON.stringify(dirs)
    + (dirs.every(d => d.includes('MIGR')) ? '  (nur Migrationen: ok)' : '  ROT'))
  if (!dirs.every(d => d.includes('MIGR'))) rot++
  console.log(rot === 0
    ? '\n[pruefen] Keine Zahl aus Dateinamen abgeleitet.'
    : '\n[pruefen] ROT — ' + rot + ' Verstoss/Verstoesse.')
  process.exit(rot === 0 ? 0 : 1)
}

if (process.argv.includes('--schreiben')) {
  writeFileSync(ZIEL, aus.join('\n'), 'utf8')
  console.log('[modultabellen] ' + gesamtT + ' Tabellen, ' + gesamtS
    + ' Spalten -> ' + ZIEL)
} else {
  console.log('[modultabellen] ' + gesamtT + ' Tabellen, ' + gesamtS
    + ' Spalten in ' + jeSchema.size + ' Modulen (--schreiben zum Ablegen)')
  for (const s of [...jeSchema.keys()].sort()) {
    const t = jeSchema.get(s)
    console.log('  ' + s.padEnd(12) + String(t.length).padStart(3) + ' Tabellen, '
      + String(t.reduce((a, x) => a + x.spalten, 0)).padStart(4) + ' Spalten')
  }
}
