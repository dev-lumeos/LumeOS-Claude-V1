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

import { SPRACHEN, SPRACH_COOKIE, type Sprache } from '../../i18n/sprachen'

/** Kurzform fuer die Schaltflaeche. */
const KUERZEL: Record<Sprache, string> = { de: 'DE', en: 'EN', th: 'TH' }

export function Sprachwahl() {
  const aktuell = useLocale() as Sprache
  const t = useTranslations('Sprache')
  const router = useRouter()
  const [offen, setOffen] = React.useState(false)
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
    </div>
  )
}
