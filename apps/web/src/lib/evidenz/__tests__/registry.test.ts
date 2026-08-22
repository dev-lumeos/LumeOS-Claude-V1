// C-180: Waechter ueber das Evidenzregister — in BEIDE Richtungen.
//
// Richtung 1 (Vollstaendigkeit): die Zaehlung je Einstufung muss den
// neun gemessenen Zahlen der crawl_025-Registry entsprechen. Faellt
// ein Eintrag heraus oder kommt einer dazu, wird es rot.
// Richtung 2 (Bindung): die Konstanten, die gestern (C-105, C-124,
// GO-21, G-89) umgesetzt wurden, sind an ihre Registry-Einstufung
// gebunden. Verdreht jemand einen Eintrag im generierten Register
// oder nutzt eine gesperrte Konstante, wird es rot.
import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'

import { EVIDENZ_REGISTRY, holeEvidenz, type EvidenzHandling } from '../registry'

const HAUPT = Object.values(EVIDENZ_REGISTRY)
  .filter(e => e.registerDatei === 'constant_evidence_registry')
const RECOVERY = Object.values(EVIDENZ_REGISTRY)
  .filter(e => e.registerDatei === 'recovery_modality_evidence')

test('die 181er-Zaehlung je Einstufung stimmt mit der Quelle ueberein', () => {
  const soll: Record<EvidenzHandling, number> = {
    USE_DIRECTIONAL_GUIDANCE: 133,
    LABEL_HEURISTIC: 15,
    REQUIRE_CONTEXT: 13,
    KEEP_NUMERIC: 6,
    DO_NOT_IMPLEMENT: 4,
    USE_RANGE: 4,
    PERSONALIZE: 3,
    REMOVE_NUMERIC_VALUE: 2,
    REPO_REVIEW_REQUIRED: 1,
  }
  assert.equal(HAUPT.length, 181)
  for (const [handling, zahl] of Object.entries(soll)) {
    assert.equal(
      HAUPT.filter(e => e.handling === handling).length, zahl,
      `${handling}: erwartet ${zahl}`)
  }
})

test('die 32 Recovery-Records sind alle REMOVE_NUMERIC_VALUE', () => {
  assert.equal(RECOVERY.length, 32)
  assert.ok(RECOVERY.every(e => e.handling === 'REMOVE_NUMERIC_VALUE'))
  assert.ok(RECOVERY.every(e => !e.wertNutzbar))
})

test('wertNutzbar ist genau die Umkehrung der drei Sperr-Einstufungen', () => {
  for (const e of Object.values(EVIDENZ_REGISTRY)) {
    const gesperrt = ['DO_NOT_IMPLEMENT', 'REMOVE_NUMERIC_VALUE', 'REPO_REVIEW_REQUIRED']
      .includes(e.handling)
    assert.equal(e.wertNutzbar, !gesperrt, e.id)
  }
})

test('eine unbekannte Konstante kracht statt undefined zu liefern', () => {
  assert.throws(() => holeEvidenz('GIBT_ES_NICHT'), /unbekannte Konstante/)
})

test('das Register traegt bewusst keine Zahlenwerte', () => {
  // `current_value` darf nicht ins Erzeugnis gelangen — sonst koennte
  // eine REMOVE_NUMERIC_VALUE-Zahl doch in eine Oberflaeche rutschen.
  const quelle = fs.readFileSync(
    new URL('../registry.ts', import.meta.url), 'utf8')
  // Als FELD (mit Doppelpunkt) darf es nicht vorkommen — der
  // Kommentarkopf, der das Weglassen begruendet, darf es nennen.
  assert.ok(!/current_value\s*:|currentValue\s*:/.test(quelle))
})

// ── Richtung 2: die Bindungen der vier umgesetzten Punkte ────────

test('GO-21: die WHO-Grenzwerte sind KEEP_NUMERIC mit Grad A', () => {
  for (const id of ['BP-WHR-001', 'BP-WHTR-002', 'BP-WC-003', 'BP-BMI-004']) {
    const e = holeEvidenz(id)
    assert.equal(e.handling, 'KEEP_NUMERIC', id)
    assert.equal(e.grad, 'A', id)
    assert.ok(e.wertNutzbar, id)
    assert.ok(e.quelle && e.jahr, `${id}: Quelle und Jahr muessen stehen`)
  }
})

test('G-89: die vier Traditionen sind LABEL_HEURISTIC, FFMI ist gesperrt', () => {
  for (const id of ['BP-GR-006', 'BP-REEVES-008', 'BP-MCCALLUM-009', 'BP-CLASSIC-010']) {
    assert.equal(holeEvidenz(id).handling, 'LABEL_HEURISTIC', id)
  }
  const ffmi = holeEvidenz('BP-FFMI-005')
  assert.equal(ffmi.handling, 'DO_NOT_IMPLEMENT')
  assert.equal(ffmi.wertNutzbar, false)
})

test('C-105: MAV ist DO_NOT_IMPLEMENT, das RP-Rahmenwerk Heuristik', () => {
  const mav = holeEvidenz('MAV')
  assert.equal(mav.handling, 'DO_NOT_IMPLEMENT')
  assert.equal(mav.wertNutzbar, false)
  assert.equal(holeEvidenz('RP_VOLUME_LANDMARKS_FRAMEWORK').handling, 'LABEL_HEURISTIC')
})

test('C-124: die Modalitaets-IDs des Motors stehen im Register, ohne nutzbaren Wert', () => {
  for (const id of ['REC_SAUNA_ENDURANCE_HEAT', 'REC_CWI_DOMS_ACUTE',
    'REC_CONTRAST_DOMS', 'REC_MASSAGE_DOMS', 'REC_STRETCH_STATIC_ROM_CHRONIC',
    'REC_ACTIVE_RECOVERY_PERF']) {
    const e = holeEvidenz(id)
    assert.equal(e.handling, 'REMOVE_NUMERIC_VALUE', id)
    assert.equal(e.wertNutzbar, false, id)
    assert.ok(e.grad, `${id}: Grad muss stehen`)
  }
  assert.equal(holeEvidenz('REC_SAUNA_ENDURANCE_HEAT').grad, 'C')
})

test('C-181: die ACWR-Entscheidungen stehen im Register wie beauftragt', () => {
  // Safe-Zone und Danger-Zone: Zahlen entfernt.
  assert.equal(holeEvidenz('C06_ACWR_SAFE_ZONE_08_13').handling, 'REMOVE_NUMERIC_VALUE')
  assert.equal(holeEvidenz('C07_ACWR_DANGER_ZONE_15').handling, 'REMOVE_NUMERIC_VALUE')
  // ACWR als Praediktor und die beiden Formelvarianten: nicht bauen.
  assert.equal(holeEvidenz('C05_ACWR_INJURY_PREDICTOR').handling, 'DO_NOT_IMPLEMENT')
  assert.equal(holeEvidenz('C01_ACWR_ROLLING_AVERAGE').handling, 'DO_NOT_IMPLEMENT')
  // Die Mathe-Kritik traegt Grad A — die belegte Richtung.
  assert.equal(holeEvidenz('C04_ACWR_MATH_CRITIQUE').grad, 'A')
  // Session-Load bleibt die belegte Kennzahl.
  const c10 = holeEvidenz('C10_SESSION_LOAD_SRPE_X_DURATION')
  assert.equal(c10.handling, 'KEEP_NUMERIC')
  assert.equal(c10.grad, 'B')
  assert.ok(c10.wertNutzbar)
})

test('die gemeldeten Sperr-Records sind genau die erwarteten', () => {
  const gesperrt = HAUPT
    .filter(e => e.handling === 'DO_NOT_IMPLEMENT' || e.handling === 'REPO_REVIEW_REQUIRED')
    .map(e => e.id)
    .sort()
  assert.deepEqual(gesperrt, [
    'BP-FFMI-005', 'BP-FFMI-ADJ-014', 'INJ_MAX_VOLUME_PER_SITE',
    'INJ_ZTRACK_PAIN_REDUCTION', 'MAV',
  ])
})

test('das Erzeugnis ist mit der JSON-Quelle synchron (falls sie liegt)', t => {
  const pfad = 'D:/GitHub/LumeOS-Claude-V1/backup/kimi-research/Kimi_Agent/'
    + 'supplement_performance_database/data/evidence/constant_evidence_registry.json'
  if (!fs.existsSync(pfad)) {
    t.skip('Quelle nicht auf dieser Maschine — Zaehl- und Bindungstests oben gelten trotzdem')
    return
  }
  const quelle = JSON.parse(fs.readFileSync(pfad, 'utf8')).records as Array<{
    constant_id: string; recommended_product_handling: string
  }>
  assert.equal(quelle.length, HAUPT.length)
  for (const r of quelle) {
    assert.equal(
      EVIDENZ_REGISTRY[r.constant_id]?.handling, r.recommended_product_handling,
      `${r.constant_id}: Erzeugnis weicht von der Quelle ab — Generator neu laufen lassen`)
  }
})
