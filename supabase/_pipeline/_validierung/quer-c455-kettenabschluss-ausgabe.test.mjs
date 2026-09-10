// C-455: Unter Windows darf die Abschlusspruefung nicht im shell-Puffer
// verschwinden. Sie muss ihre FEHLT-Liste direkt an den Kettenlauf ausgeben.
import assert from 'node:assert/strict'
import fs from 'node:fs'
import test from 'node:test'

const source = fs.readFileSync('supabase/_pipeline/kette-ausfuehren.ts', 'utf8')

test('C-455: die Abschlusspruefung erbt stdout und stderr', () => {
  const finalCheck = source.match(/function runFinalCheck\(db: string\): void \{([\s\S]*?)\n\}/)
  assert.ok(finalCheck, 'runFinalCheck fehlt')
  assert.match(finalCheck[1], /stdio:\s*'inherit'/,
    'runFinalCheck muss Ausgabe direkt durchreichen; shell:true mit Capture verschluckt sie unter Windows')
})
