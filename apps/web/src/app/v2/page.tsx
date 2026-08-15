// Nachweisseite der Oberflaeche v2 (G-01).
//
// Zweck: zeigen, dass die Route steht, das Stylesheet greift und die
// Tokens ankommen. KEIN Modul, KEINE Navigation, KEINE Datenschicht —
// das ist G-02 aufwaerts.
//
// Die Seite liest nichts aus der Datenbank. Sie muss nichts lesen:
// geprueft wird die Darstellung, nicht der Inhalt.
import { v2 } from '@lumeos/ui'

// Die elf Modulakzente. Sie stammen aus denselben Tokens wie die alte
// Oberflaeche — deshalb ist ihr Erscheinen hier der Beleg, dass v2 auf
// der geteilten Tokenschicht sitzt und keine eigene mitbringt.
const AKZENTE = [
  ['--acc-dash', 'Dashboard'],
  ['--acc-nutri', 'Nutrition'],
  ['--acc-train', 'Training'],
  ['--acc-recov', 'Recovery'],
  ['--acc-suppl', 'Supplements'],
  ['--acc-goals', 'Goals'],
  ['--acc-medic', 'Medical'],
  ['--acc-coach', 'Coach'],
  ['--acc-buddy', 'Buddy'],
  ['--acc-mkt', 'Marketplace'],
  ['--acc-admin', 'Admin'],
] as const

// Die drei Statusfarben. Sie stehen hier, weil sie im Hellmodus des
// Entwurfs FEHLTEN und im Repo am 2026-08-15 repariert wurden
// (d19e651). Wer den Modus umschaltet, sieht auf dieser Seite sofort,
// ob die Reparatur noch traegt: bleiben die drei im Tagmodus lesbar,
// ist sie da.
const STATUS = [
  ['--pos', 'pos'],
  ['--warn', 'warn'],
  ['--neg', 'neg'],
] as const

export default function V2Page() {
  return (
    <main className={v2('module-header')} style={{ padding: '2rem' }}>
      <div className={v2('module-title-block')}>
        <div className={v2('eyebrow')}>G-01</div>
        <h1 className={v2('module-title')}>Oberflaeche v2</h1>
        <p className={v2('module-sub')}>
          Parallelstruktur steht. Diese Seite baut noch keine Oberflaeche —
          sie zeigt, dass die Route greift und die Tokens ankommen.
          Bausteine folgen in G-02.
        </p>
      </div>

      <section className={v2('card')} style={{ marginTop: '1.5rem' }}>
        <div className={v2('card-title')}>Modulakzente</div>
        <div className={v2('card-sub')}>
          geteilte Tokenschicht, dieselben Werte wie in der bestehenden
          Oberflaeche
        </div>
        <div className={v2('g-cols-4')} style={{ marginTop: '1rem' }}>
          {AKZENTE.map(([token, name]) => (
            <div key={token} className={v2('kpi')}>
              <div
                className={v2('kpi-acc-bar')}
                style={{ background: `var(${token})` }}
              />
              <div className={v2('kpi-label')}>{name}</div>
              <div className={v2('kpi-value', 'mono')} style={{ fontSize: '0.7rem' }}>
                {token}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className={v2('card')} style={{ marginTop: '1rem' }}>
        <div className={v2('card-title')}>Statusfarben in beiden Modi</div>
        <div className={v2('card-sub')}>
          im Entwurf fehlten sie im Hellmodus — hier muessen sie in beiden
          lesbar sein
        </div>
        <div className={v2('row')} style={{ marginTop: '1rem', gap: '0.5rem' }}>
          {STATUS.map(([token, name]) => (
            <span
              key={token}
              className={v2('pill')}
              style={{
                borderColor: `color-mix(in oklch, var(${token}) 40%, var(--border))`,
                background: `color-mix(in oklch, var(${token}) 10%, var(--surface))`,
                color: `var(${token})`,
              }}
            >
              {name}
            </span>
          ))}
        </div>
      </section>
    </main>
  )
}
