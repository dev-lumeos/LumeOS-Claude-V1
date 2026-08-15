'use client'

// Die elf Modulakzente zum Durchschalten.
//
// Der Auftrag verlangt den Nachweis, dass die Kopfzeile die Farbe
// wechselt. Beim Wandern durch die Module passiert das ueber die Route;
// diese Probe zeigt es an einer Stelle, ohne elf Seiten zu brauchen —
// sie setzt --acc auf ihrem eigenen Abschnitt.
import * as React from 'react'
import { Card, Pill } from '@lumeos/ui'

export function AkzentProbe({
  akzente,
}: {
  akzente: ReadonlyArray<readonly [string, string]>
}) {
  const [gewaehlt, setGewaehlt] = React.useState(0)
  const [token, name] = akzente[gewaehlt]

  return (
    <div style={{ marginTop: 16, ['--acc' as string]: `var(${token})` }}>
      <Card
        title="Modulakzent"
        sub="geteilte Tokenschicht"
        accent="var(--acc)"
        actions={<Pill variant="acc">{name}</Pill>}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {akzente.map(([t, n], i) => (
            <button
              key={t}
              type="button"
              onClick={() => setGewaehlt(i)}
              className={`v2-btn ${i === gewaehlt ? 'v2-btn-accent' : ''}`.trim()}
              style={{ ['--acc' as string]: `var(${t})` }}
              aria-pressed={i === gewaehlt}
            >
              <span
                className="v2-dot"
                style={{ background: `var(${t})`, marginRight: 6 }}
              />
              {n}
            </button>
          ))}
        </div>

        <div
          style={{
            marginTop: 14,
            padding: 12,
            borderRadius: 'var(--radius)',
            border: '1px solid color-mix(in oklch, var(--acc) 40%, var(--border))',
            background: 'color-mix(in oklch, var(--acc) 8%, var(--surface))',
          }}
        >
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--acc)' }}>
            {token}
          </div>
          <div style={{ fontSize: 12, color: 'var(--fg-muted)', marginTop: 4 }}>
            Diese Flaeche, der Punkt und der aktive Knopf lesen alle
            <code style={{ margin: '0 4px' }}>var(--acc)</code>
            — gesetzt wird er einmal weiter oben.
          </div>
        </div>
      </Card>
    </div>
  )
}
