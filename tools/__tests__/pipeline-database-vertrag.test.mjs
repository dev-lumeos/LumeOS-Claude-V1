import assert from 'node:assert/strict'
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import test from 'node:test'

import { pruefePipelineDatenbankvertrag } from '../pipeline-database-vertrag.mjs'

async function mitDatei(inhalt, pruefung) {
  const wurzel = await mkdtemp(path.join(tmpdir(), 'lumeos-a88-'))
  const pipeline = path.join(wurzel, 'supabase', '_pipeline')
  const datei = path.join(pipeline, '_validierung', 'probe.test.ts')
  await mkdir(path.dirname(datei), { recursive: true })
  await writeFile(datei, inhalt, 'utf8')

  try {
    await pruefung(pipeline)
  } finally {
    await rm(wurzel, { recursive: true, force: true })
  }
}

test('A-88: der aktuelle Pipeline-Bestand erfuellt den Datenbankvertrag', async () => {
  const verstoesse = await pruefePipelineDatenbankvertrag(
    path.resolve('supabase', '_pipeline'),
  )
  assert.deepEqual(verstoesse, [])
})

test('A-88: PGDATABASE ohne Rueckfall bleibt gruen', async () => {
  await mitDatei(
    "const db = process.env.PGDATABASE\nif (!db || db === 'postgres') throw new Error('Wegwerf-Datenbank fehlt.')\n",
    async (pipeline) => assert.deepEqual(await pruefePipelineDatenbankvertrag(pipeline), []),
  )
})

test("A-88: ein eingebauter Rueckfall auf postgres wird rot", async () => {
  await mitDatei(
    "const db = process.env.PGDATABASE ?? 'postgres'\n",
    async (pipeline) => {
      const verstoesse = await pruefePipelineDatenbankvertrag(pipeline)
      assert.equal(verstoesse.length, 2)
      assert.match(verstoesse[0].grund + verstoesse[1].grund, /Rueckfall auf postgres/)
      assert.match(verstoesse[0].grund + verstoesse[1].grund, /fail-closed/)
    },
  )
})

test('A-88: ein eigener LUMEOS-Datenbankname wird rot', async () => {
  await mitDatei(
    "const db = process.env.LUMEOS_C999_DATABASE\n",
    async (pipeline) => {
      const verstoesse = await pruefePipelineDatenbankvertrag(pipeline)
      assert.equal(verstoesse.length, 1)
      assert.match(verstoesse[0].grund, /PGDATABASE/)
    },
  )
})

test('A-88: ein fest verdrahtetes -d postgres wird rot', async () => {
  await mitDatei(
    "const args = ['psql', '-d', 'postgres']\n",
    async (pipeline) => {
      const verstoesse = await pruefePipelineDatenbankvertrag(pipeline)
      assert.equal(verstoesse.length, 1)
      assert.match(verstoesse[0].grund, /fest verdrahtet/)
    },
  )
})
