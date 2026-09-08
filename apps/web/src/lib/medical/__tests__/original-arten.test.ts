// Die erlaubten Dateiarten — G-380.
//
// `[read]` **Was hier geprueft wird, ist die ABLEITUNG**, nicht die
// Liste selbst. Die Liste ist eine Abschrift des Buckets; ob sie mit
// ihm uebereinstimmt, kann kein Test in `apps/` beantworten — dafuer
// braeuchte er die Datenbank. `[cmd]` **Gemessen wurde sie am
// 2026-09-08 gegen `storage.buckets.allowed_mime_types`.**
//
// `[read]` **Pruefbar ist dagegen:** dass `accept` und der Klartext
// aus derselben Quelle kommen und nicht danebengeschrieben sind.
// **Das ist der Fehler, der hier realistisch passiert** — jemand
// ergaenzt eine Art in der einen Liste und vergisst die andere.
import { test } from 'node:test'
import assert from 'node:assert/strict'

import {
  ORIGINAL_ARTEN, ORIGINAL_ACCEPT,
  ORIGINAL_ARTEN_KLARTEXT, ORIGINAL_GROESSE_MAX, ORIGINAL_GROESSE_KLARTEXT,
} from '../original-arten'

test('accept nennt jede erlaubte Art, und nur die', () => {
  const imAccept = ORIGINAL_ACCEPT.split(',')
  // `[read]` Beide Richtungen: keine fehlt, keine ist zuviel.
  assert.deepEqual(imAccept, [...ORIGINAL_ARTEN])
})

test('der Klartext nennt so viele Arten wie die Liste', () => {
  // `[read]` Nicht die Namen vergleichen — `application/pdf` heisst
  // im Klartext `PDF`. **Die ANZAHL ist die Aussage:** wer eine Art
  // ergaenzt und den Klartext vergisst, faellt hier auf.
  const imKlartext = ORIGINAL_ARTEN_KLARTEXT.split(',').map(s => s.trim())
  assert.equal(imKlartext.length, ORIGINAL_ARTEN.length,
    `Klartext nennt ${imKlartext.length}, die Liste fuehrt ${ORIGINAL_ARTEN.length}`)
})

test('jede Art ist ein MIME-Typ, kein Dateiende', () => {
  // `[cmd]` `accept` nimmt beides (`.pdf` wie `application/pdf`) —
  // aber der Schreibweg vergleicht gegen `File.type`, und der ist
  // immer ein MIME-Typ. **Eine Endung in der Liste liefe dort ins
  // Leere**, ohne dass etwas rot wuerde.
  for (const a of ORIGINAL_ARTEN) {
    assert.match(a, /^[a-z]+\/[a-z0-9.+-]+$/, `${a} ist kein MIME-Typ`)
  }
})

test('die Groessenangabe stimmt mit der Zahl ueberein', () => {
  // `[read]` „20 MB" und `20971520` altern sonst getrennt.
  const mb = Number(ORIGINAL_GROESSE_KLARTEXT.replace(/[^\d]/g, ''))
  assert.equal(mb, Math.round(ORIGINAL_GROESSE_MAX / 1024 / 1024))
})
