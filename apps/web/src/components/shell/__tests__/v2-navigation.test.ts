// GO-01: `resolveNav` muss jede Route der Seitenleiste treffen.
//
// ANLASS: `[cmd]` /v2/settings fiel auf das Dashboard zurueck — die
// Kopfzeile schrieb „Dashboard", die Seitenleiste hob den falschen
// Eintrag hervor. Grund: `resolveNav` lief nur ueber MODULES, und
// Settings steht unter SYSTEM.
//
// Der Fehler war seit G-02 da und fiel erst auf, als Settings die erste
// echte Seite bekam. Ein leerer Eintrag zeigt nicht, dass er falsch
// aufgeloest wird.
import { test } from 'node:test'
import assert from 'node:assert/strict'

import { MODULES, SETTINGS_ENTRY, resolveNav } from '@lumeos/ui'

test('jede Route der Seitenleiste loest auf sich selbst auf', () => {
  for (const m of MODULES) {
    const r = resolveNav(m.href)
    assert.equal(r.entry.id, m.id, `${m.href} loest auf ${r.entry.id} auf`)

    for (const s of m.sub ?? []) {
      const rs = resolveNav(s.href)
      // Der Untereintrag gewinnt, wenn sein Pfad laenger ist; bei
      // gleichem Pfad (Tagebuch = Modulwurzel) genuegt das Modul.
      assert.equal(rs.entry.id, m.id, `${s.href} loest auf das falsche Modul auf`)
    }
  }
})

test('Settings loest auf Settings auf, nicht auf das Dashboard', () => {
  const r = resolveNav(SETTINGS_ENTRY.href)
  assert.equal(r.entry.id, 'settings',
    'Ohne SETTINGS_ENTRY in resolveNav faellt /v2/settings auf das Dashboard zurueck')
  assert.equal(r.entry.label, 'Settings')
})

test('Unterseiten von Settings loesen ebenfalls auf Settings auf', () => {
  assert.equal(resolveNav('/v2/settings/profil').entry.id, 'settings')
})

test('ein unbekannter Pfad faellt auf das Dashboard zurueck', () => {
  // Das ist Absicht, nicht der Fehler von oben: fuer /v2 selbst gibt es
  // keinen eigenen Eintrag ausser dem Dashboard.
  assert.equal(resolveNav('/v2/gibtesnicht').entry.id, 'dashboard')
  assert.equal(resolveNav('/v2').entry.id, 'dashboard')
})

test('der laengere Pfad gewinnt', () => {
  // Geprueft an Coach, weil Nutrition seit der Tab-Umstellung keine
  // Untereintraege mehr hat. Die Regel selbst gilt weiter.
  const r = resolveNav('/v2/coach/ai')
  assert.equal(r.entry.id, 'coach')
  assert.equal(r.sub?.id, 'coach-ai',
    'Der Unterpfad muss den Untereintrag treffen, nicht nur das Modul')
})

test('Nutrition fuehrt keine Untereintraege mehr', () => {
  // [read] Tom, 2026-08-16: "Was soll die Subnavigation links?" Die
  // Vorlage fuehrt sieben Tabs IM MODUL; die Untereintraege waren eine
  // Erfindung aus G-03. Ohne diesen Test kaeme die naechste Seite unter
  // /v2/nutrition/... wieder als Untereintrag zurueck.
  const nutrition = MODULES.find(m => m.id === 'nutrition')
  assert.ok(nutrition, 'Nutrition muss es geben')
  assert.equal(nutrition!.sub, undefined,
    'Die Tabs stehen in der Seite, nicht in der Seitenleiste')

  // Die Suche bleibt trotzdem beim Modul — sonst faellt sie aufs
  // Dashboard zurueck und die Seitenleiste zeigt den falschen Eintrag.
  assert.equal(resolveNav('/v2/nutrition/suche').entry.id, 'nutrition')
  assert.equal(resolveNav('/v2/nutrition/suche').sub, undefined)
})
