// Coach → AI Coach der Oberflaeche v2 — NOCH NICHT GEBAUT.
//
// Diese Seite ist keine Attrappe des Moduls, sondern die ehrliche
// Auskunft, dass es fehlt. `[read]` G-29 hat den Umgang festgelegt:
// lieber ganze Tabs als halbe, und **was fehlt, steht in der
// Tableiste** — nicht im Bericht allein.
//
// **WARUM ES FEHLT:** `[cmd]` Die beiden Unterbereiche sind zusammen
// 306 KB Vorlage. Gezaehlt mit `tools/vollstaendigkeit.mjs`:
//   Human Coaches (module-coach*.jsx, 6 Dateien)  60 Posten
//   AI Coach      (module-buddy*.jsx,  4 Dateien) 41 Posten
// Human Coaches ist gebaut, AI Coach nicht. Der Auftrag nannte
// „elf Tabs" und „zwoelf Tabs"; gezaehlt sind es **zehn und zwanzig**.
//
// `[cmd]` `app.jsx:127`: `case "coach-ai": return <BuddyModule />;`
// `module-buddy.jsx:414` setzt `window.BuddyModule` — keine V2-Weiche,
// der Rahmen ist eindeutig. Die zwanzig Tabs stehen in
// module-buddy.jsx:26-45.
//
// `[read]` Tom zum Umfang: „Der AI Coach ist ein Teil von
// Buddy-Logik. Der effektive Endausbau, welcher DER BUDDY als App sein
// wird, wird viel umfangreicher sein." Gebaut wird das Modul, nicht
// der Endausbau.
//
// Der Stand steht in docs/ssot/102-coach-mockup.md.
import type { Metadata } from 'next'

import { Card } from '@lumeos/ui'

import '../coach.css'

export const metadata: Metadata = {
  title: 'AI Coach · LumeOS',
}

/** [cmd] module-buddy.jsx:26-45, in dieser Reihenfolge. Zwanzig. */
const TABS = [
  'Chat', 'Insights feed', 'Memory', 'Decisions', 'Personality',
  'Avatar states', 'Plan & gate', 'Engines', 'Journey', 'Watcher',
  'BSS', 'Signature', 'Interventions', 'Safety', 'Butler',
  'Voice / Live', 'Knowledge', 'Rules', 'Coach overrides', 'Clone & Gym',
]

export default function V2CoachAiPage() {
  return (
    <>
      <div className="v2-module-header v2-module-hero-lite">
        <div className="v2-module-title-block">
          <div className="v2-module-title-row">
            <span className="v2-module-title">AI Coach</span>
          </div>
          <div className="v2-module-sub">
            Noch nicht gebaut — die zwanzig Tabs der Vorlage stehen unten.
          </div>
        </div>
      </div>

      <Card
        title="Dieser Unterbereich fehlt noch"
        sub="20 Tabs · 41 Posten · module-buddy*.jsx, 109 KB"
        attrappe={
          'Nicht uebernommen, nicht vergessen. Human Coaches ist gebaut '
          + '(60 Posten), AI Coach steht aus — gezaehlt mit '
          + 'tools/vollstaendigkeit.mjs, Stand in docs/ssot/102-coach-mockup.md.'
        }
      >
        <div className="v2-muted" style={{ fontSize: 12, lineHeight: 1.55, marginBottom: 12 }}>
          Die Vorlage fuehrt hier zwanzig Tabs. Keiner davon ist uebernommen.
          Damit niemand eine fehlende Kachel fuer eine nicht vorgesehene haelt,
          stehen sie hier namentlich:
        </div>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {TABS.map(t => (
            <span
              key={t}
              className="v2-pill"
              style={{ fontSize: 11, opacity: 0.65 }}
            >
              {t}
            </span>
          ))}
        </div>
      </Card>
    </>
  )
}
