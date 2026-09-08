// G-324/C-269: Browser-Schreibwege duerfen keine geschuetzten Coach-Tabellen
// direkt aktualisieren. Die Server-Actions muessen die atomaren RPCs nutzen.
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import test from 'node:test'

function quelltext(): string {
  return fs.readFileSync(path.join(process.cwd(), 'src/lib/coach/rechte-schreiben.ts'), 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^[ \t]*\/\/.*$/gm, '')
}

function nachrichtenQuelltext(): string {
  return fs.readFileSync(path.join(process.cwd(), 'src/lib/coach/nachrichten-schreiben.ts'), 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^[ \t]*\/\/.*$/gm, '')
}

test('G-324: Entscheiden ruft ausschliesslich die sicheren Aktions-RPCs', () => {
  const source = quelltext()

  assert.match(source, /\.rpc\('bestaetige_aktion', \{ p_action_id: aktionId \}\)/,
    'Bestaetigen ruft coach.bestaetige_aktion(uuid) nicht auf.')
  assert.match(source, /\.rpc\('lehne_aktion_ab', \{ p_action_id: aktionId \}\)/,
    'Ablehnen hat keinen gleichwertigen sicheren RPC-Weg.')
  assert.doesNotMatch(source, /\.from\('pending_actions'\)/,
    'Der Browser-Schreibweg greift noch direkt auf pending_actions zu.')
  assert.doesNotMatch(source, /confirmed_by|confirmed_at/,
    'Der Browser darf Akteur oder Bestätigungszeit nicht liefern.')
})

test('C-269: Die Server-Action nimmt Einladungen nur ueber den Status-RPC zurueck', () => {
  const source = nachrichtenQuelltext()
  const start = source.indexOf('export async function nehmeEinladungZurueck')
  const ende = source.indexOf('\n/**', start)
  const ruecknahme = source.slice(start, ende)

  assert.notEqual(start, -1,
    'Der vorbereitete Ruecknahmeweg fehlt.')
  assert.match(ruecknahme, /\.rpc\('withdraw_relationship_invite', \{[\s\S]*?p_relationship_id: beziehungsId/,
    'Ruecknahme ruft coach.withdraw_relationship_invite nicht auf.')
  assert.doesNotMatch(ruecknahme, /\.from\('relationships'\)[\s\S]*?\.update\(/,
    'Einladungen duerfen nicht direkt aktualisiert werden.')
})
