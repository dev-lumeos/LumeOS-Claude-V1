// `[cmd]` **2026-09-08.** Tom: *,,wenn das sauber gepflegt ist,
// brauchst nicht mehr 100 mal messen lassen, weil es vergessen hast,
// und kannst selber nachschauen."*
//
// `[read]` **Der Orchestrator hat heute dutzende Male `psql`
// gerufen, um Spalten zu zaehlen, die hier stehen koennten** ?
// **und wurde dreimal von Codex berichtigt, weil er nicht
// nachgesehen hat.**
//
// `[cmd]` **`user_conditions` statt `conditions`. `is_primary`
// existiert. `client_id` ist NOT NULL.** `[read]` **Drei Fragen,
// drei Berichtigungen, alle vermeidbar.**
//
// `[read]` **Dieses Werkzeug erzeugt, was oft gefragt wird:**
// **Funktionen, Policies, CHECKs, Sichten.** `[read]` **Tabellen
// und Spalten stehen in `00-MODULTABELLEN.md`** (G-383).
//
// `[read]` **Wie dort gilt: NUR aus der Datenbank ableiten** ?
// **kein Dateiname, keine Konvention.**

import { execFileSync } from 'node:child_process'
import { writeFileSync } from 'node:fs'

const DB = 'supabase_db_LumeOS-Claude-V1'
const MODULE = ['nutrition', 'goals', 'supplements', 'medical',
                'recovery', 'training', 'coach', 'public', 'wissen']

function frage(sql) {
  const roh = execFileSync('docker',
    ['exec', DB, 'psql', '-U', 'postgres', '-d', 'postgres',
     '-t', '-A', '-F', '\t', '-c', sql],
    { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 })
  return roh.split('\n').filter(z => z.trim()).map(z => z.split('\t'))
}

const liste = MODULE.map(m => "'" + m + "'").join(', ')

// `[read]` **Funktionen: der Name allein reicht nicht** ? **die
// Argumente sagen, ob man sie rufen kann.**
const funktionen = frage(`
  SELECT n.nspname, p.proname,
         pg_get_function_arguments(p.oid),
         CASE p.prokind WHEN 'f' THEN 'Funktion'
                        WHEN 'p' THEN 'Prozedur'
                        ELSE p.prokind::text END
    FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
   WHERE n.nspname IN (${liste})
   ORDER BY n.nspname, p.proname`)

// `[read]` **Policies: wer darf was.** `[cmd]` **417 Stueck** ?
// **die Bedingung gekuerzt, sonst liest es niemand.**
const policies = frage(`
  SELECT n.nspname, c.relname, pol.polname,
         CASE pol.polcmd WHEN 'r' THEN 'SELECT' WHEN 'a' THEN 'INSERT'
                         WHEN 'w' THEN 'UPDATE' WHEN 'd' THEN 'DELETE'
                         ELSE 'ALL' END,
         left(replace(coalesce(pg_get_expr(pol.polqual, pol.polrelid),
              pg_get_expr(pol.polwithcheck, pol.polrelid), '-'),
              chr(10), ' '), 90)
    FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
   WHERE n.nspname IN (${liste})
   ORDER BY n.nspname, c.relname, pol.polname`)

// `[read]` **CHECKs: die erlaubten Werte.** `[read]` **Genau das,
// was ein Agent aus dem Gedaechtnis falsch abschreibt** (G-373).
const checks = frage(`
  SELECT n.nspname, c.relname, con.conname,
         left(replace(pg_get_constraintdef(con.oid), chr(10), ' '), 130)
    FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
   WHERE con.contype = 'c' AND n.nspname IN (${liste})
   ORDER BY n.nspname, c.relname, con.conname`)

const sichten = frage(`
  SELECT n.nspname, c.relname,
         CASE WHEN 'security_invoker=true' = ANY(c.reloptions)
              THEN 'security_invoker' ELSE 'definer' END
    FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
   WHERE c.relkind = 'v' AND n.nspname IN (${liste})
   ORDER BY n.nspname, c.relname`)

function tabelle(kopf, zeilen) {
  const t = ['| ' + kopf.join(' | ') + ' |',
             '|' + kopf.map(() => '---').join('|') + '|']
  for (const z of zeilen) {
    t.push('| ' + z.map(s => (s ?? '').replace(/\|/g, '\\|')).join(' | ') + ' |')
  }
  return t
}

const heute = new Date().toISOString().slice(0, 10)
const zeilen = [
  '# Schema: Funktionen, Policies, CHECKs, Sichten',
  '',
  '**Erzeugt von `tools/ssot-schema.mjs`.** `[read]` **Nicht von Hand',
  'aendern** ? **die Quelle ist die Datenbank.**',
  '',
  '`[read]` **Tabellen und Spalten stehen in `00-MODULTABELLEN.md`.**',
  '',
  '`[cmd]` **Stand ' + heute + ': ' + funktionen.length + ' Funktionen, '
    + policies.length + ' Policies, ' + checks.length + ' CHECKs, '
    + sichten.length + ' Sichten.**',
  '',
  '## Funktionen und Prozeduren',
  '',
  '`[read]` **Der Name allein reicht nicht** ? **die Argumente sagen,',
  'ob man sie rufen kann.**',
  '',
  ...tabelle(['Modul', 'Name', 'Argumente', 'Art'], funktionen),
  '',
  '## Sichten',
  '',
  '`[read]` **`security_invoker` heisst: die Sicht laeuft mit den',
  'Rechten des Lesers, nicht des Erzeugers.**',
  '',
  ...tabelle(['Modul', 'Sicht', 'Rechte'], sichten),
  '',
  '## CHECK-Bedingungen',
  '',
  '`[read]` **Die erlaubten Werte** ? **genau das, was aus dem',
  'Gedaechtnis falsch abgeschrieben wird** (G-373).',
  '',
  ...tabelle(['Modul', 'Tabelle', 'Name', 'Bedingung'], checks),
  '',
  '## Policies',
  '',
  '`[read]` **Wer darf was.** `[cmd]` **Bedingung auf 90 Zeichen',
  'gekuerzt** ? **wer mehr braucht, fragt `pg_policy`.**',
  '',
  ...tabelle(['Modul', 'Tabelle', 'Policy', 'Recht', 'Bedingung'], policies),
  '',
]

if (process.argv.includes('--schreiben')) {
  writeFileSync('docs/ssot/00-SCHEMA.md', zeilen.join('\n'), 'utf8')
  console.log('[ssot-schema] ' + funktionen.length + ' Funktionen, '
    + policies.length + ' Policies, ' + checks.length + ' CHECKs -> docs/ssot/00-SCHEMA.md')
} else {
  console.log('[ssot-schema] ' + funktionen.length + ' Funktionen, '
    + policies.length + ' Policies, ' + checks.length + ' CHECKs, '
    + sichten.length + ' Sichten (--schreiben zum Ablegen)')
}
