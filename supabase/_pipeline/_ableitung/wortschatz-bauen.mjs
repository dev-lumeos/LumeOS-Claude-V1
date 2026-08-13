// Erzeugt apps/web/src/lib/nutrition/generated/such-wortschatz.ts
//
// Der Wortschatz ist die Grundlage der Zerlegung. Er entsteht aus drei
// Quellen, alle belegt, keine erfunden:
//   1. german-decompounder (LGPL) — allgemeine Sprache
//   2. nutrition.foods                — der Bestand selbst
//   3. die Handliste aus 024          — Woerter, die keine Quelle kennt
//
// Alles wird beim Erzeugen GEFALTET. `[cmd]` Das kostet nichts: 14.517
// Eintraege fallen auf 14.502, und alle 11 Kollisionen sind ss/ß-Paare
// DESSELBEN Wortes (fuss/fuß, mass/maß) — keine zwei verschiedenen
// Woerter fallen zusammen.
import fs from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'

const C = 'supabase_db_LumeOS-Claude-V1'
// Wie in den Pruefskripten: PGDATABASE entscheidet, Vorgabe ist die
// laufende Datenbank. Dieses Skript LIEST nur (foods, search_synonyms)
// und schreibt ausschliesslich in apps/web/.../generated/.
const DB = process.env.PGDATABASE || 'postgres'
const sql = q => execFileSync('docker',
  ['exec', '-i', C, 'psql', '-U', 'postgres', '-d', DB, '-q', '-t', '-A', '-c', q],
  { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 })

const falte = s => s.toLowerCase()
  .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
  .replace(/[^a-z0-9]+/g, ' ').replace(/\s+/g, ' ').trim()

const woerterbuch = fs.readFileSync('docs/ssot/daten/quellen/dictionary-de.txt', 'utf8')
  .split('\n').map(z => falte(z.trim())).filter(w => w && !w.includes(' '))

const bestand = sql(`SELECT DISTINCT lower(w) FROM nutrition.foods f,
     unnest(regexp_split_to_array(regexp_replace(f.name_de,'[^[:alpha:] ]',' ','g'),'\\s+')) AS w
     WHERE length(w) >= 4`).trim().split('\n').map(w => falte(w.trim())).filter(w => w && !w.includes(' '))

const synonyme = sql(`SELECT term FROM nutrition.search_synonyms`)
  .trim().split('\n').map(w => falte(w.trim())).filter(Boolean)

const alle = [...new Set([...woerterbuch, ...bestand, ...synonyme])].sort()

const ziel = 'apps/web/src/lib/nutrition/generated/such-wortschatz.ts'
fs.mkdirSync(path.dirname(ziel), { recursive: true })
fs.writeFileSync(ziel,
`// ERZEUGT — nicht von Hand bearbeiten.
// Erzeugt von supabase/_pipeline/_ableitung/wortschatz-bauen.mjs
//
// Quellen (alle belegt, nichts erfunden):
//   german-decompounder (LGPL, Uwe Schindler / Björn Jacke)
//     docs/ssot/daten/quellen/dictionary-de.txt          ${String(woerterbuch.length).padStart(6)} Woerter
//   nutrition.foods (BLS-Namen, Woerter ab 4 Zeichen)    ${String(bestand.length).padStart(6)} Woerter
//   nutrition.search_synonyms (Kettenschritt 024)        ${String(synonyme.length).padStart(6)} Woerter
//                                                        ------
//   nach Faltung und Entdopplung                         ${String(alle.length).padStart(6)} Woerter
//
// Alle Eintraege sind GEFALTET wie normalizeFoodSearchText bzw.
// nutrition.search_fold. Damit zerlegen "hühnerbrust" und
// "huehnerbrust" identisch — was der Anlass dieses Wortschatzes war.

export const SUCH_WORTSCHATZ: ReadonlySet<string> = new Set([
${alle.map(w => `  '${w.replace(/'/g, "\\'")}',`).join('\n')}
])
`, { encoding: 'utf8' })

// --- Zweites Erzeugnis: die Synonyme fuer die App ---
// Sie stehen in der Datenbank (024), aber die Zerlegung laeuft in der
// App und braucht sie dort. Eine Abfrage pro Suchanfrage waere teurer
// als eine erzeugte Tabelle, und die Werte aendern sich nur, wenn die
// Kette neu laeuft.
const paare = sql(`SELECT term || '|' || array_to_string(targets, ',')
                   FROM nutrition.search_synonyms ORDER BY term`)
  .trim().split('\n').map(z => z.split('|')).filter(([t]) => t)

const zielSyn = 'apps/web/src/lib/nutrition/generated/such-synonyme.ts'
fs.writeFileSync(zielSyn,
`// ERZEUGT — nicht von Hand bearbeiten.
// Erzeugt von supabase/_pipeline/_ableitung/wortschatz-bauen.mjs
// aus nutrition.search_synonyms (Kettenschritt 024).
//
// GERICHTET: term ist, was der Nutzer tippt; targets sind Woerter, die
// im Bestand vorkommen. Die Richtung ist der Filter — sie haelt die
// Beleidigungen draussen, die ein ungerichteter Thesaurus mitliefert
// (\`[cmd]\` kartoffel -> piefke). Begruendung je Eintrag in 024.
//
// ${String(paare.length).padStart(5)} Eintraege, davon 12 von Hand.

export const SUCH_SYNONYME: Readonly<Record<string, readonly string[]>> = {
${paare.map(([t, z]) => `  '${t.replace(/'/g, "\\'")}': [${z.split(',').map(x => `'${x.replace(/'/g, "\\'")}'`).join(', ')}],`).join('\n')}
}
`, { encoding: 'utf8' })

console.log('geschrieben:', ziel)
console.log('geschrieben:', zielSyn, '(' + paare.length + ' Eintraege)')
console.log('  Woerterbuch:', woerterbuch.length)
console.log('  Bestand    :', bestand.length)
console.log('  Synonyme   :', synonyme.length)
console.log('  gesamt     :', alle.length)
