import assert from 'node:assert/strict'
import test from 'node:test'

import { ADMIN_ROLE, isAdminFromAppMetadata } from '../admin-role'

test('admin role value matches what 061 checks in the database', () => {
  assert.equal(ADMIN_ROLE, 'admin')
})

test('app_metadata with role admin is the only way in', () => {
  assert.equal(isAdminFromAppMetadata({ role: 'admin' }), true)
  assert.equal(isAdminFromAppMetadata({ role: 'admin', provider: 'email' }), true)
})

test('default is not admin — unknown never becomes allowed', () => {
  assert.equal(isAdminFromAppMetadata(null), false)
  assert.equal(isAdminFromAppMetadata(undefined), false)
  assert.equal(isAdminFromAppMetadata({}), false)
  assert.equal(isAdminFromAppMetadata({ provider: 'email' }), false)
  assert.equal(isAdminFromAppMetadata({ role: 'user' }), false)
  assert.equal(isAdminFromAppMetadata({ role: 'Admin' }), false)
  assert.equal(isAdminFromAppMetadata({ role: '' }), false)
})

test('a non-string role never grants admin', () => {
  // Defensiv: der Wert kommt aus dem JWT und ist nicht typisiert.
  assert.equal(isAdminFromAppMetadata({ role: true } as never), false)
  assert.equal(isAdminFromAppMetadata({ role: 1 } as never), false)
  assert.equal(isAdminFromAppMetadata({ role: ['admin'] } as never), false)
  assert.equal(isAdminFromAppMetadata({ role: { value: 'admin' } } as never), false)
})

test('user_metadata style payloads are not accepted as app_metadata', () => {
  // [cmd] 2026-08-06 belegt: ein Nutzer kann user_metadata.role selbst
  // auf "admin" setzen (PUT /auth/v1/user mit {"data":{...}} gelingt).
  // Diese Funktion bekommt ausschliesslich app_metadata — der Aufrufer
  // in admin-session.ts reicht nichts anderes herein. Der Test haelt
  // fest, dass ein verschachteltes user_metadata nicht durchschlaegt.
  assert.equal(isAdminFromAppMetadata({ user_metadata: { role: 'admin' } } as never), false)
})
