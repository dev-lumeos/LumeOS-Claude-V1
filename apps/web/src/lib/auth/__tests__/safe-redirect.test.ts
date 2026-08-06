import assert from 'node:assert/strict'
import test from 'node:test'

import { DEFAULT_REDIRECT, safeRedirect } from '../safe-redirect'

test('internal targets pass through unchanged', () => {
  assert.equal(safeRedirect('/dashboard'), '/dashboard')
  assert.equal(safeRedirect('/nutrition/foods'), '/nutrition/foods')
  assert.equal(safeRedirect('/nutrition/foods?q=kuerbis&page=2'), '/nutrition/foods?q=kuerbis&page=2')
  assert.equal(safeRedirect('/'), '/')
})

test('protocol-relative targets are rejected — this was a real open redirect', () => {
  // [cmd] 2026-08-06 gegen den laufenden Dev-Server:
  //   GET /auth/callback?redirect=%2F%2Fevil.com -> Location: http://evil.com/
  // Die alte Pruefung war raw.startsWith('/') — `//evil.com` bestand sie.
  assert.equal(safeRedirect('//evil.com'), DEFAULT_REDIRECT)
  assert.equal(safeRedirect('//evil.com/pfad'), DEFAULT_REDIRECT)
  assert.equal(safeRedirect('///evil.com'), DEFAULT_REDIRECT)
})

test('backslash variants are rejected too', () => {
  // Manche Browser behandeln \ wie / — /\evil.com waere sonst erneut
  // protokollrelativ.
  assert.equal(safeRedirect('/\\evil.com'), DEFAULT_REDIRECT)
  assert.equal(safeRedirect('/\\\\evil.com'), DEFAULT_REDIRECT)
})

test('absolute urls are rejected', () => {
  assert.equal(safeRedirect('https://evil.com'), DEFAULT_REDIRECT)
  assert.equal(safeRedirect('http://evil.com'), DEFAULT_REDIRECT)
  assert.equal(safeRedirect('evil.com'), DEFAULT_REDIRECT)
  assert.equal(safeRedirect('javascript:alert(1)'), DEFAULT_REDIRECT)
})

test('empty and non-string input falls back to the default', () => {
  assert.equal(safeRedirect(''), DEFAULT_REDIRECT)
  assert.equal(safeRedirect(null), DEFAULT_REDIRECT)
  assert.equal(safeRedirect(undefined), DEFAULT_REDIRECT)
  assert.equal(safeRedirect(42 as never), DEFAULT_REDIRECT)
  assert.equal(safeRedirect(['/dashboard'] as never), DEFAULT_REDIRECT)
})

test('a path that merely looks external stays internal', () => {
  // /evil.com ist ein PFAD auf der eigenen Herkunft — zulaessig.
  assert.equal(safeRedirect('/evil.com'), '/evil.com')
})
