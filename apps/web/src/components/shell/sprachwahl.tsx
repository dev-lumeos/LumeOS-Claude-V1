'use client'

// Die Sprachwahl in der Kopfzeile.
//
// `[read]` Tom: die Wahl gehoert an zwei Stellen — hier neben
// Nachtmodus, Kontext und Commands, und im Profil unter
// `/v2/settings`, damit sie ueber Geraete hinweg gilt.
//
// DIESE Stelle schreibt ein Cookie. Das ist absichtlich dieselbe
// Mechanik wie beim Nachtmodus: der Server kennt den Wert beim ersten
// Rendern und schreibt `lang` direkt ins HTML — kein Aufblitzen der
// falschen Sprache.
//
// `[cmd]` Ueber Geraete hinweg gilt sie damit noch NICHT. Dafuer
// braucht `public.profiles` eine `locale`-Spalte; das ist Schemaarbeit
// und gehoert Codex. Was fehlt, steht im Bericht.
import * as React from 'react'
import { useRouter } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { Icon } from '@lumeos/ui'

import { InEntwicklung } from '@lumeos/ui'

import { SPRACHEN, SPRACH_COOKIE, type Sprache } from '../../i18n/sprachen'

/** Kurzform fuer die Schaltflaeche. */
const KUERZEL: Record<Sprache, string> = { de: 'DE', en: 'EN', th: 'TH' }

// ══ C-177 / E-36: der Hinweis bei Thai ══════════════════════════════
//
// **Tom, 2026-08-30:** *,,lassen wir die sprachauswahl aber setzen ein
// modal darueber wenn es gewaehlt wird mit ‚noch nicht entwickelt'
// oder sowas"*.
//
// `[read]` **Die Wahl bleibt** — sie wird gesetzt wie jede andere, und
// die Oberflaeche uebersetzt sich. **Nur die Suche findet nichts**,
// und genau das sagt der Hinweis.
//
// `[cmd]` **Gemessen am 2026-08-30:** `nutrition.food_aliases` traegt
// **32.845 Zeilen — 25.705 `de`, 7.140 `en`, 0 `th`.**
//
// `[cmd]` **Und die Namensspalten sind auch leer:** `foods.name_th`
// bei **0 von 7.140**, `nutrient_defs.name_th` bei **0 von 138.**
// `[read]` **Die Punktdatei sagte, die 138 `name_th` seien da** — das
// stimmt heute nicht; gemeldet im Bericht.
//
// `[read]` **Der Grund muss die Datenfrage tragen, nicht eine
// Bauzeit:** BLS 4.0 ist die einzige Lebensmittelquelle (E-03) und
// fuehrt keine thailaendischen Namen. **Woher sie kaemen, ist offen —
// das ist keine Frage von „noch nicht gebaut".**
const THAI_GRUND =
  'Die Sprache ist gesetzt und die Oberfläche übersetzt sich. Was fehlt, '
  + 'ist die Lebensmittelsuche: '
  + 'nutrition.food_aliases führt 32.845 Einträge — 25.705 deutsche, '
  + '7.140 englische und keinen einzigen thailändischen (gemessen '
  + '2026-08-30). Auch foods.name_th ist bei allen 7.140 Einträgen leer. '
  + 'Das ist keine Frage der Bauzeit, sondern der Quelle: BLS 4.0 ist '
  + 'die einzige Lebensmitteldatenbank (E-03) und führt keine '
  + 'thailändischen Namen. Woher sie kämen, ist offen.'

export function Sprachwahl() {
  const aktuell = useLocale() as Sprache
  const t = useTranslations('Sprache')
  const router = useRouter()
  const [offen, setOffen] = React.useState(false)
  // C-177: der Hinweis, wenn Thai gewaehlt wurde.
  const [hinweis, setHinweis] = React.useState(false)
  const huelle = React.useRef<HTMLDivElement>(null)

  // Klick daneben schliesst — sonst bleibt die Liste offen stehen.
  React.useEffect(() => {
    if (!offen) return
    const zu = (e: MouseEvent) => {
      if (huelle.current && !huelle.current.contains(e.target as Node)) setOffen(false)
    }
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') setOffen(false) }
    document.addEventListener('mousedown', zu)
    window.addEventListener('keydown', esc)
    return () => {
      document.removeEventListener('mousedown', zu)
      window.removeEventListener('keydown', esc)
    }
  }, [offen])

  function waehle(s: Sprache) {
    // Ein Jahr, damit die Wahl das Neuladen ueberlebt. `SameSite=Lax`
    // reicht: das Cookie steuert nur die Anzeige.
    document.cookie = `${SPRACH_COOKIE}=${s}; path=/; max-age=31536000; SameSite=Lax`
    setOffen(false)
    // C-177 / E-36: Thai wird gesetzt wie jede andere Sprache — und
    // danach steht der Hinweis da. `[read]` **Erst setzen, dann
    // hinweisen:** ein Hinweis VOR dem Setzen waere eine Rueckfrage,
    // und die hat Tom nicht verlangt. Die Wahl gilt, sie ist nur
    // unvollstaendig gedeckt.
    if (s === 'th') setHinweis(true)
    // Die Nachrichten kommen aus der Serverkomponente — `refresh()`
    // holt sie neu, ohne die Seite neu aufzubauen.
    router.refresh()
  }

  return (
    <div ref={huelle} style={{ position: 'relative' }}>
      <button
        type="button"
        className="v2-icon-btn"
        aria-haspopup="listbox"
        aria-expanded={offen}
        aria-label={t('label')}
        title={t('label')}
        onClick={() => setOffen(o => !o)}
        style={{ width: 'auto', padding: '0 8px', gap: 4, fontSize: 11 }}
      >
        <Icon name="message" className="v2-ic v2-ic-sm" />
        {KUERZEL[aktuell] ?? aktuell}
      </button>

      {offen && (
        <div role="listbox" aria-label={t('label')} className="v2-sprachliste">
          {SPRACHEN.map(s => (
            <button
              key={s}
              type="button"
              role="option"
              aria-selected={s === aktuell}
              className="v2-sprachwahl"
              data-on={s === aktuell ? 'true' : undefined}
              onClick={() => waehle(s)}
            >
              <span className="v2-num" style={{ width: 22, fontSize: 10 }}>{KUERZEL[s]}</span>
              <span style={{ flex: 1, textAlign: 'left' }}>{t(s)}</span>
              {s === aktuell && <Icon name="check" className="v2-ic v2-ic-sm" />}
            </button>
          ))}
        </div>
      )}

      {/* C-177 / E-36: derselbe Baustein wie an 134 anderen Stellen —
          `packages/ui/src/in-entwicklung.tsx`, mit `grund`. **Nichts
          gebaut, nur ein weiterer Aufrufer.**

          `teilweise` ist neu (C-177): hier TUT die Wahl etwas, nur
          nicht vollstaendig. Ohne das Prop behauptet der Baustein
          *„er tut noch nichts"* — und das waere falsch. */}
      {hinweis && (
        <InEntwicklung
          titel="Thai"
          grund={THAI_GRUND}
          teilweise
          onClose={() => setHinweis(false)}
        />
      )}
    </div>
  )
}
