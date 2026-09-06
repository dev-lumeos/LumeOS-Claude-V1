// C-415: 075 darf die effektiven Tags erst lesen, nachdem C-366 sie erzeugt.
import assert from 'node:assert/strict'
import fs from 'node:fs'
import test from 'node:test'

type Step = {
  id: string
  path: string
  depends_on: string[]
}

const steps = (JSON.parse(fs.readFileSync('supabase/_pipeline/kette.json', 'utf8')) as {
  steps: Step[]
}).steps

test('C-415: der C-366-Aufbau der effektiven Tags kommt vor 075', () => {
  const viewStep = steps.findIndex(step => step.id === '366_schema')
  const precedenceStep = steps.findIndex(step => step.id === '366_precedence')
  const searchStep = steps.findIndex(step => step.id === '075')

  assert.ok(viewStep >= 0, 'C-366-Sichtaufbau fehlt in der Kette')
  assert.ok(precedenceStep > viewStep, 'C-366-Prioritaet muss nach dem Sichtaufbau laufen')
  assert.ok(searchStep > precedenceStep, '075 darf erst nach C-366 laufen')
  assert.equal(steps[viewStep]?.path, 'supabase/migrations/20260902073231_c366_curated_food_tags.sql')
  assert.equal(steps[precedenceStep]?.path, 'supabase/migrations/20260902073543_c366_curated_tag_precedence.sql')
  assert.ok(steps[searchStep]?.depends_on.includes('366_precedence'))
})
