// G-181: die Zahlenkacheln — und was NICHT hineinkommt.
//
// ══ DER KERN DIESER PRUEFUNG ════════════════════════════════════════
//
// `[cmd]` **Gemessen 2026-08-25 ueber alle 290 Nutzertexte:** nur 18
// tragen ueberhaupt eine Prozentzahl, 12 einen Bereich. **Bei 278 gibt
// es keine Wirkungszahl zu zeigen.**
//
// `[cmd]` **Und die Treffer sind zum Teil das Gegenteil einer
// Wirkung:** Beta-Carotin 18-28 % ist eine **Risikoerhoehung bei
// Rauchern**, BPC-157 und TB-500 60-70 % sind **Heilungsraten bei
// Ratten** aus Texten, die ausdruecklich sagen, dass Humanstudien
// fehlen.
//
// `[read]` **Deshalb pruefen die Tests hier zwei Richtungen:** dass
// die belegten Zahlen erscheinen — und dass die irrefuehrenden es
// NICHT tun.
import { test } from 'node:test'
import assert from 'node:assert/strict'

import { kachelnFuer, WIRKUNG } from '../substanz-kacheln'

test('Kreatin bekommt alle vier Kacheln', () => {
  // `[cmd]` `sub_9f9bb8c160`: Grad A, 3-5 g, 5-15 %, not_prohibited.
  const k = kachelnFuer('sub_9f9bb8c160', 'A', '3–5 g/Tag', 'not_prohibited')
  assert.deepEqual(k.map(x => x.id), ['beleglage', 'menge', 'wirkung', 'wada'])
  assert.equal(k[0].wert, 'A')
  assert.equal(k[2].wert, '5–15 %')
  assert.equal(k[3].wert, 'erlaubt')
})

test('ohne Menge und ohne Wirkungszahl bleiben zwei Kacheln', () => {
  // `[cmd]` Der Normalfall: Menge nur bei 83 von 318, Wirkungszahl
  // bei 5. **Zwei Kacheln sind besser als vier mit zwei Strichen.**
  const k = kachelnFuer('sub_xyz', 'C', null, 'not_prohibited')
  assert.deepEqual(k.map(x => x.id), ['beleglage', 'wada'])
  assert.equal(k.some(x => x.wert === '—' || x.wert === ''), false,
    'Keine Kachel darf einen Strich als Wert tragen.')
})

test('ohne alles entsteht keine einzige Kachel', () => {
  assert.deepEqual(kachelnFuer(null, null, null, null), [])
})

test('die irrefuehrenden Prozentzahlen sind NICHT in der Liste', () => {
  // ── Die eigentliche Zusage dieses Auftrags ──────────────────────
  //
  // `[read]` Eine Regex ueber `was_bringt_es_de` haette diese vier
  // gefunden und als Wirkung gezeigt. **Sie stehen bewusst nicht in
  // `WIRKUNG`:**
  //
  //   sub_f14e403589  Beta-Carotin  18-28 %  Risiko, kein Nutzen
  //   sub_...bpc      BPC-157       60-70 %  Ratten
  //   sub_...tb500    TB-500        60-70 %  Ratten
  //   sub_2293dc29f8  Ca-AKG        10-15 %  Lebensdauer bei Maeusen
  for (const slug of ['sub_f14e403589', 'sub_2293dc29f8']) {
    assert.equal(slug in WIRKUNG, false,
      `${slug} traegt eine Prozentzahl, die keine Leistungswirkung ist — `
      + 'sie darf keine Wirkungskachel bekommen (G-181).')
    const k = kachelnFuer(slug, 'B', null, 'not_prohibited')
    assert.equal(k.some(x => x.id === 'wirkung'), false)
  }
})

test('die Wirkungsliste bleibt klein und belegt', () => {
  // `[read]` **Fuenf Eintraege sind ehrlicher als 290 Kacheln, von
  // denen 278 raten.** Waechst die Liste, hat jemand die Zahl gelesen
  // — das ist der Sinn der gepflegten Liste.
  assert.ok(Object.keys(WIRKUNG).length <= 20,
    'Die Wirkungsliste ist kuratiert, keine Textausschlachtung.')
  for (const [slug, w] of Object.entries(WIRKUNG)) {
    assert.match(w.wert, /\d/, `${slug}: die Kachel braucht eine Zahl.`)
    assert.ok(w.hinweis.length > 0, `${slug}: eine Zeile Erklaerung fehlt.`)
    assert.ok(w.hinweis.length <= 42,
      `${slug}: der Hinweis muss in eine Kachelzeile passen.`)
  }
})

test('der Evidenzgrad bekommt Bedeutung und Klartext', () => {
  // `[cmd]` **G-198 hat die Namen umgestellt.** Hier stand
  // `'pos'`/`'warn'`/`'acc'` — ein DRITTES Vokabular neben den vier
  // Bedeutungen aus G-196. `[read]` Die Zuordnung selbst aendert sich
  // nicht: A ist eine Entwarnung, D eine Gefahr.
  assert.equal(kachelnFuer(null, 'A', null, null)[0].ton, 'entwarnung')
  assert.equal(kachelnFuer(null, 'D', null, null)[0].ton, 'gefahr')
  // `[read]` **C bekommt KEINE Farbe mehr.** Vorher trug es `acc`,
  // also die Wirkungsfarbe — dabei sagt der Grad nichts ueber die
  // Wirkung. *„Gemischt belegt"* ist keine der vier Aussagen.
  assert.equal(kachelnFuer(null, 'C', null, null)[0].ton, undefined)
  assert.match(kachelnFuer(null, 'A', null, null)[0].hinweis ?? '', /belegt/)
})

test('WADA: jeder Zustand traegt seine eigene Bedeutung', () => {
  // `[cmd]` **G-198:** dieselbe Zuordnung wie im Rechtslage-Block
  // (G-194) — verboten ist eine Gefahr, erlaubt eine Entwarnung,
  // beobachtet ein Pruefauftrag.
  const verboten = kachelnFuer(null, null, null, 'prohibited')
  assert.equal(verboten[0].wert, 'verboten')
  assert.equal(verboten[0].ton, 'gefahr')
  assert.equal(kachelnFuer(null, null, null, 'not_prohibited')[0].ton,
    'entwarnung')
  assert.equal(kachelnFuer(null, null, null, 'monitored')[0].ton, 'pruefen')
})

test('die Mengenkachel traegt die kurze Form, nicht den Satz', () => {
  // `[read]` Die Kachel wird auf eine Zahl hin gelesen. Steht ein
  // ganzer Satz dahinter, gehoert er in „Wann und wie".
  const k = kachelnFuer(null, null,
    '3–5 g/Tag; eine Ladephase mit 20 g über 5–7 Tage ist optional', null)
  assert.equal(k[0].wert, '3–5 g/Tag')
  assert.match(k[0].hinweis ?? '', /Ladephase/)
})

test('Leerraum zaehlt nicht als Wert', () => {
  assert.deepEqual(kachelnFuer(null, '  ', '  ', '  '), [])
})
