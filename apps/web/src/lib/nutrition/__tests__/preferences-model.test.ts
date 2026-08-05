import assert from 'node:assert/strict'
import test from 'node:test'

import {
  buildFoodPreferenceInsert,
  decideFoodPreferenceWrite,
  foodPreferenceDeleteSchema,
  foodPreferenceWriteSchema,
  httpStatusForPreferenceError,
  parseStoredFoodPreferenceItems,
  strengthForPreference,
  summarizeFoodPreferenceItems,
} from '../preferences-model'

const FOOD_ID = '11111111-1111-1111-1111-111111111111'

test('write schema accepts only uuid food ids and known preference kinds', () => {
  assert.equal(foodPreferenceWriteSchema.safeParse({ food_id: FOOD_ID, preference: 'liked' }).success, true)
  assert.equal(foodPreferenceWriteSchema.safeParse({ food_id: 'not-a-uuid', preference: 'liked' }).success, false)
  assert.equal(foodPreferenceWriteSchema.safeParse({ food_id: FOOD_ID, preference: 'favorite' }).success, false)
  assert.equal(foodPreferenceDeleteSchema.safeParse({ food_id: FOOD_ID }).success, true)
  assert.equal(foodPreferenceDeleteSchema.safeParse({}).success, false)
})

test('strength derivation matches the 050 check constraint values', () => {
  assert.equal(strengthForPreference('liked'), 'like')
  assert.equal(strengthForPreference('disliked'), 'soft_dislike')
  assert.equal(strengthForPreference('hard_exclude'), 'hard_exclude')
})

test('insert payload targets exactly one food and carries the user id', () => {
  const row = buildFoodPreferenceInsert('user-1', { food_id: FOOD_ID, preference: 'hard_exclude' })
  assert.deepEqual(row, {
    user_id: 'user-1',
    preference: 'hard_exclude',
    strength: 'hard_exclude',
    target_type: 'food',
    food_id: FOOD_ID,
    source: 'user',
  })
})

test('write decision separates insert, restage and duplicate', () => {
  assert.equal(decideFoodPreferenceWrite(undefined, 'liked'), 'insert')
  assert.equal(
    decideFoodPreferenceWrite({ id: 'a', food_id: FOOD_ID, preference: 'liked' }, 'liked'),
    'duplicate',
  )
  assert.equal(
    decideFoodPreferenceWrite({ id: 'a', food_id: FOOD_ID, preference: 'disliked' }, 'liked'),
    'update',
  )
})

test('summarize groups stored items into preview argument buckets', () => {
  const summary = summarizeFoodPreferenceItems([
    { id: 'a', food_id: 'f1', preference: 'liked' },
    { id: 'b', food_id: 'f2', preference: 'disliked' },
    { id: 'c', food_id: 'f3', preference: 'hard_exclude' },
    { id: 'd', food_id: 'f4', preference: 'liked' },
  ])
  assert.deepEqual(summary, {
    likedFoodIds: ['f1', 'f4'],
    dislikedFoodIds: ['f2'],
    excludedFoodIds: ['f3'],
  })
})

test('stored item parser drops malformed rows instead of failing', () => {
  const items = parseStoredFoodPreferenceItems([
    { id: 'a', food_id: 'f1', preference: 'liked' },
    { id: 'b', food_id: 'f2', preference: 'unknown_kind' },
    { id: 'c', preference: 'liked' },
    'garbage',
    null,
  ])
  assert.deepEqual(items, [{ id: 'a', food_id: 'f1', preference: 'liked' }])
  assert.deepEqual(parseStoredFoodPreferenceItems('not-an-array'), [])
})

test('error codes map to stable http status values', () => {
  assert.equal(httpStatusForPreferenceError('NO_SESSION'), 401)
  assert.equal(httpStatusForPreferenceError('VALIDATION_FAILED'), 400)
  assert.equal(httpStatusForPreferenceError('UNKNOWN_FOOD'), 400)
  assert.equal(httpStatusForPreferenceError('DUPLICATE_PREFERENCE'), 409)
  assert.equal(httpStatusForPreferenceError('NOT_FOUND'), 404)
  assert.equal(httpStatusForPreferenceError('DB_UNAVAILABLE'), 503)
  assert.equal(httpStatusForPreferenceError('WRITE_FAILED'), 500)
})
