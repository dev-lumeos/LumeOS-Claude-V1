/**
 * G-640 (+ Loeschknopf G-639) — die App liest den wirksamen Zielzustand.
 *
 * `[cmd]` **Gegen die Kette, NICHT live** (Stand 2026-10-09):
 * `611_goal_freeze_archive_delete.sql` und `638_goal_plan_status_follows_goal.sql`.
 * Geprueft werden Signaturen, Rueckgabespalten, Gruende, jeder Fehlerschluessel
 * und der Rueckfall, solange die Funktionen fehlen.
 */
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import * as React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { AppRouterContext } from 'next/dist/shared/lib/app-router-context.shared-runtime'

import {
  GRUND_TEXT, aktionen, kettenfehler, fehlerSatz, nichtEingespielt, zustandAusListe, zustandAusStatus,
} from '../zustand'
import { alsHerkunft, ohneZiel } from '../../profile/zielwerte-hindernis'
import { KeinZielWarnung, eingefrorenSatz } from '../../../app/v2/kein-ziel-warnung'
import { ReiterGoals } from '../../../app/v2/goals/reiter-goals'
import type { Phase, ZielFortschritt } from '../lesen'
import type { Zielwerte } from '../../profile/zielwerte-read'

const HIER = dirname(fileURLToPath(import.meta.url))
const SRC = join(HIER, '..', '..', '..')
const KETTE = join(SRC, '..', '..', '..', 'supabase', '_pipeline', '11_goals')
const S611 = readFileSync(join(KETTE, '611_goal_freeze_archive_delete.sql'), 'utf8')
const S638 = readFileSync(join(KETTE, '638_goal_plan_status_follows_goal.sql'), 'utf8')
const lies = (p: string) => readFileSync(join(SRC, p), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '').replace(/^[ \t]*\/\/.*$/gm, '').replace(/\{\/\*[\s\S]*?\*\/\}/g, '')

describe('G-640 — gegen die Signaturen', () => {
  it('goal_list_at: Parameter und Spalten; der Leser nutzt genau diese', () => {
    assert.match(S611, /CREATE FUNCTION goals\.goal_list_at\(p_user_id uuid,p_stichtag date/)
    assert.match(S611, /RETURNS TABLE \(goal_id uuid,title text,stored_status text,effective_status text,\s*freeze_reason text,frozen_on date,goal_role text\)/)
    assert.match(S611, /WHERE g\.user_id=p_user_id AND g\.archived_at IS NULL/, 'archivierte fallen in der Kette weg')
    const l = lies('lib/goals/lesen.ts')
    assert.match(l, /rpc\('goal_list_at', \{ p_user_id: userId, p_stichtag: stichtag \}\)/)
    assert.match(l, /alle\.filter\(z => zustaende!\.has\(z\.id as string\)\)/, 'archivierte stehen trotzdem in der Liste')
    assert.deepEqual(zustandAusListe({ goal_id: 'g', effective_status: 'eingefroren', freeze_reason: 'frist_abgelaufen', frozen_on: '2026-10-01' }),
      { zustand: 'eingefroren', grund: 'frist_abgelaufen', eingefroren_am: '2026-10-01', quelle: 'kette' })
  })
  it('jeder Grund aus goal_state_at hat einen Text — und der Rueckfall spiegelt die gespeicherten', () => {
    const gruende = Array.from(new Set(Array.from(S611.slice(S611.indexOf('CREATE FUNCTION goals.goal_state_at'), S611.indexOf('GRANT EXECUTE ON FUNCTION goals.goal_state_at'))
      .matchAll(/THEN '([a-z_]+)'/g)).map(m => m[1]!))).filter(g => g !== 'eingefroren')
    assert.deepEqual(gruende.sort(), ['beendet', 'erreicht', 'frist_abgelaufen'])
    for (const g of gruende) assert.ok(GRUND_TEXT[g as keyof typeof GRUND_TEXT], g)
    for (const [status, grund] of Array.from(S611.matchAll(/WHEN g\.status='([a-z]+)' THEN '([a-z_]+)'/g)).map(m => [m[1]!, m[2]!] as const)) {
      assert.equal(zustandAusStatus(status).grund, grund, `${status} → ${grund}`)
      assert.equal(zustandAusStatus(status).zustand, 'eingefroren')
    }
    assert.deepEqual(zustandAusStatus('active'), { zustand: 'active', grund: null, eingefroren_am: null, quelle: 'gespeichert' })
  })
  it('archive / delete / restart: Parameter wie in 611', () => {
    assert.match(S611, /CREATE FUNCTION goals\.goal_archive\(p_goal_id uuid\)/)
    assert.match(S611, /CREATE FUNCTION goals\.goal_delete\(p_goal_id uuid,p_confirm_history boolean DEFAULT false\)/)
    assert.match(S611, /CREATE FUNCTION goals\.goal_restart\(p_goal_id uuid,p_start_date date,p_target_date date\)\s*RETURNS uuid/)
    const w = lies('lib/goals/lebenszyklus-write.ts')
    assert.match(w, /rufe\('goal_archive', \{ p_goal_id: id \}\)/)
    assert.match(w, /rufe\('goal_delete', \{ p_goal_id: id, p_confirm_history: verlaufBestaetigt \}\)/)
    assert.match(w, /rufe\('goal_restart', \{ p_goal_id: id, p_start_date: start, p_target_date: ende \}\)/)
  })
  it('jeder Fehlerschluessel aus 611/638 wird ein Satz — nie das Praefix', () => {
    const roh = Array.from((S611 + S638).matchAll(/'(G611_BLOCK|G611_CONFIRM|G638_BLOCK):([a-z_]+):\s*([^']*)'/g))
    assert.ok(roh.length >= 9, `nur ${roh.length} Meldungen gefunden`)
    for (const m of roh) {
      const k = kettenfehler(`ERROR: ${m[0]!.slice(1, -1)}`)
      assert.ok(k, m[2])
      assert.ok(!/G6\d\d_/.test(k!.satz), `${m[2]}: Praefix im Satz`)
      assert.equal(k!.art, m[1] === 'G611_CONFIRM' ? 'confirm' : 'block')
      assert.notEqual(k!.satz, m[0], `${m[2]} kommt roh an`)
    }
    assert.match(kettenfehler('G611_CONFIRM:beenden_statt_loeschen: x')!.satz, /Lieber beenden\?/)
    assert.equal(fehlerSatz('G626_CONFIRM:diaetdauer'), 'G626_CONFIRM:diaetdauer', 'G-626 bleibt roh fuer den Dialog')
  })
  it('ziel_eingefroren: Herkunft aus der Kette, Warnung mit Titel und Weg', () => {
    assert.match(S611, /THEN 'ziel_eingefroren' ELSE b\.hindernis END/)
    assert.equal(alsHerkunft('ziel_eingefroren'), 'ziel_eingefroren')
    assert.equal(ohneZiel('ziel_eingefroren'), true)
    assert.match(lies('lib/profile/zielwerte-read.ts'), /if \(herkunft === 'ziel_eingefroren'\) \{[\s\S]{0,400}rpc\('goal_list_at'/)
    const h = renderToStaticMarkup(React.createElement(KeinZielWarnung, {
      herkunft: 'ziel_eingefroren', kcal: 2500, protein: 160, ruhend: null,
      eingefroren: { title: 'Lean Bulk', grund: 'erreicht', am: '2026-10-05' } }))
    assert.match(h, /„Lean Bulk“ ist abgeschlossen \(erreicht am 05\.10\.2026\) und eingefroren – du läufst auf Erhaltung\./)
    assert.match(h, /data-kein-ziel-weg="neu-starten"[^>]*>„Lean Bulk“ neu starten/)
    assert.equal(eingefrorenSatz({ title: 'X', grund: null, am: null }), '„X“ ist abgeschlossen und eingefroren – du läufst auf Erhaltung.')
  })
})

describe('G-640 — Rueckfall, solange G-611 fehlt', () => {
  it('fehlende Funktion heisst „nicht eingespielt" — kein Absturz', () => {
    assert.equal(nichtEingespielt({ code: 'PGRST202', message: 'x' }), true)
    assert.equal(nichtEingespielt({ code: '42883', message: 'x' }), true)
    assert.equal(nichtEingespielt({ code: '23514', message: 'x' }), false)
    assert.match(lies('lib/goals/lesen.ts'), /if \(!nichtEingespielt\(liste\.error\)\) throw/)
    assert.match(lies('lib/goals/lesen.ts'), /zustand: zustaende\?\.get\(z\.id as string\) \?\? zustandAusStatus\(text\(z\.status\)\)/)
    assert.match(lies('lib/goals/lebenszyklus-write.ts'), /if \(nichtEingespielt\(error\)\) \{\s*return \{ ok: false, art: 'nicht_eingespielt'/)
  })
  it('ohne Kette keine Knoepfe ohne Weg; mit Kette die Aktionen je Zustand', () => {
    assert.deepEqual(aktionen(zustandAusStatus('achieved')), { neuStarten: false, archivieren: false, loeschen: false, bearbeiten: false })
    assert.deepEqual(aktionen(zustandAusStatus('active')), { neuStarten: false, archivieren: false, loeschen: false, bearbeiten: true })
    const eis = zustandAusListe({ effective_status: 'eingefroren', freeze_reason: 'erreicht' })
    assert.deepEqual(aktionen(eis), { neuStarten: true, archivieren: true, loeschen: true, bearbeiten: false })
    assert.deepEqual(aktionen(zustandAusListe({ effective_status: 'active' })), { neuStarten: false, archivieren: false, loeschen: true, bearbeiten: true })
  })
})

// ── bis in die Anzeige ───────────────────────────────────────────

const Z = (o: Partial<ZielFortschritt>): ZielFortschritt => ({
  goal_id: 'm1', goal_type: 'body_composition', subtype: null, title: 'Gewicht 78', target_value: 78,
  target_unit: 'kg', start_value: 81.4, current_value: 80, current_source: 'goals.body_measurements',
  progress_pct: 40, progress_status: 'measured', lage: null, measured_at: '2026-10-08', target_date: '2026-12-31',
  gueltig_ab: '2026-10-01', linked_modules: [], status: 'active', is_primary: false, priority: 5,
  goal_role: 'measurement', measurement_type: 'body_weight', measurement_rhythm: 'once', measurement_site: null,
  achievement_date: null, zustand: zustandAusStatus('active'), ...o,
})
const ZW = (o: Partial<Zielwerte>): Zielwerte => ({
  gueltig_ab: '2026-10-09', kcal: 2500, protein_g: 160, carbs_g: null, fat_g: null, fiber_g: null,
  linoleic_acid_g: null, alpha_linolenic_acid_g: null, herkunft: 'formel', tdee: 2500, nutrition_goal: null,
  ruhendes_ziel: null, luecke: null, eingefroren: null, ...o,
})
const ROUTER = { push() {}, replace() {}, refresh() {}, back() {}, forward() {}, prefetch() {} }
const reiter = (ziele: ZielFortschritt[], zielwerte: Zielwerte, phasen: Phase[] = []) => renderToStaticMarkup(
  React.createElement(AppRouterContext.Provider, { value: ROUTER as never }, React.createElement(ReiterGoals, {
    ziele, phasen, offenePhasen: [], zielwerte, vorschlag: null, messungen: [], meilensteine: [], strategien: [],
    woche: { trainings: 0, beitraege: [], trend: { heute: null, vorwoche: null } }, stichtag: '2026-10-09',
    onZielSetzen: () => {}, onMessziel: () => {}, onPhaseEngine: () => {},
  })))

describe('G-640 — bis in die Anzeige', () => {
  it('Loeschknopf nur mit Loeschweg (G-639) — an jeder Stelle', () => {
    // G-648: Loeschen steht im Entwurf im Bearbeiten der Karte bzw. Kachel und im
    // Kasten des eingefrorenen Steuerziels; jeder Knopf haengt an `aktionen(...).loeschen`.
    const q = lies('app/v2/goals/reiter-goals.tsx')
    const knoepfe = q.match(/<button[^>]*data-ziel-loeschen=/g) ?? []
    const gesperrt = q.match(/\{aktionen\((?:z|g)\.zustand\)\.loeschen && <button[^>]*data-ziel-loeschen=/g) ?? []
    assert.equal(knoepfe.length, 4)
    assert.equal(gesperrt.length, 3, 'ein Loeschknopf ohne Weg (G-611)')
    assert.match(q, /\{darf\.loeschen && <button[^>]*data-ziel-loeschen=\{g\.goal_id\}/, 'Abgeschlossen: nur mit Weg')
    // Abgeschlossen ist offen — mit Kette ein Knopf, ohne keiner
    const eis = (z: ReturnType<typeof zustandAusListe> | ReturnType<typeof zustandAusStatus>) => reiter([Z({ status: 'achieved', zustand: z })], ZW({ herkunft: 'kein_aktives_ziel' }))
    assert.match(eis(zustandAusListe({ effective_status: 'eingefroren', freeze_reason: 'erreicht' })), /data-ziel-loeschen="m1"/)
    assert.ok(!/data-ziel-loeschen/.test(eis(zustandAusStatus('achieved'))), 'ohne G-611 ein Knopf ohne Weg')
  })
  it('eingefroren ohne gespeicherten Abschluss: steht unter Abgeschlossen, nicht bei den Messzielen, ohne Wertung', () => {
    const eis = Z({ status: 'active', progress_status: 'frozen', zustand: zustandAusListe({ effective_status: 'eingefroren', freeze_reason: 'frist_abgelaufen', frozen_on: '2026-10-01' }) })
    const h = reiter([eis], ZW({ herkunft: 'kein_aktives_ziel' }))
    assert.ok(!/data-messziel-kachel/.test(h), 'ein abgelaufenes Ziel steht noch bei den laufenden')
    assert.match(h, /Abgeschlossen · 1/)
    assert.ok(!/data-lage="(hinterher|im_plan|voraus)"/.test(h), 'ein eingefrorenes Ziel wird bewertet')
  })
  it('Steuerung eingefroren: Satz und „Neu starten"', () => {
    const st = Z({ goal_id: 'c1', goal_role: 'controlling', title: 'Lean Bulk', status: 'active',
      zustand: zustandAusListe({ effective_status: 'eingefroren', freeze_reason: 'erreicht', frozen_on: '2026-10-05' }) })
    const h = reiter([st], ZW({ herkunft: 'ziel_eingefroren', eingefroren: { goal_id: 'c1', title: 'Lean Bulk', grund: 'erreicht', am: '2026-10-05' } }))
    assert.match(h, /data-steuerung="eingefroren"/)
    assert.match(h, /Erreicht am 05\.10\.2026 mit 80 kg\.<\/b> Das Ziel ist eingefroren; seitdem gilt Erhaltung/)
    assert.match(h, /data-ziel-neu-starten="c1"/)
    assert.ok(!/data-steuerung="laeuft"/.test(h), 'ein eingefrorenes Steuerziel laeuft weiter (gespeichert active)')
  })
  it('Loeschen: EINE Frage wie im Entwurf, sie bestaetigt den Verlauf; Steuerziel mit „Stattdessen beenden"', () => {
    // `[cmd]` **G-648: Vorher zwei Stufen, und der Satz der Kette wiederholte „Lieber beenden?"**
    // (Schirm 16.10.). Der Entwurf fragt einmal und nennt den Verlust im Satz.
    const l = lies('app/v2/goals/lebenszyklus.tsx')
    assert.match(l, /const x = await zielLoeschenAktion\(ziel\.goal_id, true\)/)
    assert.match(l, /Verlauf und Meilensteine gehen verloren/)
    assert.match(l, /data-loeschen-stattdessen="beenden"[\s\S]{0,120}?>Stattdessen beenden</)
    assert.ok(!/Lieber beenden/.test(l.replace(/^\s*\/\/.*$/gm, '')), 'die zweite Stufe ist zurueck')
    assert.match(lies('app/v2/goals/ziel-aktionen.ts'), /fehler: fehlerSatz\(e\.fehler\)/)
  })
})
