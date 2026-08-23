// G-157 / G-163: der Rueckfall zeigt einen Hinweis, keine erfundene Zahl.
//
// `[cmd]` **Warum hier und nicht im Browser gemessen wird:**
// Ohne Sitzung leitet der Server auf `/login` um — der Tab wird gar
// nicht gerendert (gemessen 2026-08-23). Der leere Zweig greift nur bei
// einem angemeldeten Konto ohne Daten, und
// `test-user@lumeos.local` war an dem Tag nicht anmeldbar: das
// Passwort wurde um 09:42 geaendert, der crypt-Vergleich schlaegt fehl.
//
// `[read]` **Deshalb wird der Zweig hier direkt gerendert.** Das ist
// schwaecher als ein Browserbeleg — es prueft die Komponente, nicht die
// Seite. Was die Seite zeigt, ist getrennt gemessen: auf
// `dev@lumeos.app` stehen auf beiden Tabs echte Zahlen und **keine
// Spur des Entwurfs**.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { renderToStaticMarkup } from 'react-dom/server'
import * as React from 'react'

import { LeerHinweis } from '../leer-hinweis'

test('der Hinweis nennt den Grund und zeigt keine Zahl', () => {
  const html = renderToStaticMarkup(
    React.createElement(LeerHinweis, {
      titel: 'Nährstoffe',
      grund: 'Für dieses Konto ist keine Nährstoffordnung geladen.',
    }))

  assert.match(html, /Nährstoffe/)
  assert.match(html, /keine Nährstoffordnung geladen/)
  assert.match(html, /leere Fläche ist ehrlicher/,
    'Der Hinweis sagt, dass hier ein Entwurf stand.')

  // `[read]` **Die eigentliche Zusage:** keine Zahl mit Einheit. Der
  // alte Entwurf zeigte „18,3 g" und „648,4 mg" — erfunden, unmarkiert.
  // Ein Datum („23.08.2026") ist keine Messgroesse und bleibt erlaubt.
  const ohneDatum = html.replace(/\d{2}\.\d{2}\.\d{4}/g, '')
  assert.equal(/\d+[,.]\d+\s*(g|mg|µg|kcal|%)/.test(ohneDatum), false,
    'Der Hinweis darf keine Naehrwertzahl zeigen — sonst ist er ein Entwurf.')
})
