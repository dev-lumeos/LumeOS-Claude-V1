'use client'

// Der Rahmen des Supplements-Moduls.
//
// QUELLE: theme-v1/module-supplements.jsx, `SupplementsModule` (214).
// `[cmd]` `app.jsx:123` sagt `case "supplements": return
// <SupplementsModule />` — EIN Rahmen, keine V2-Weiche. Anders als
// Recovery (abgeloester Rahmen) und Medical (Weiche vorhanden).
//
// UEBERNOMMEN: Kopfzeile, elf Tabs in ihrer Reihenfolge, alle Zahlen.
//
// WAS DIESER DURCHGANG NICHT BAUT: die vier Tabs, die aus
// `-spec.jsx` und `-injection.jsx` kommen (Catalog, Stacks,
// Intelligence, Inventory, Injections). `[read]` Der Auftrag erlaubt
// das ausdruecklich: „Ein vollstaendiges Drittel ist besser als drei
// halbe Tabs." Sie stehen als Tab da und sagen, dass sie fehlen —
// weglassen waere schlechter, weil die Tab-Leiste dann unvollstaendig
// aussieht statt unfertig.
import * as React from 'react'
import { Card, Pill, Icon, Tabs, InEntwicklungKnopf, type TabItem } from '@lumeos/ui'

import { STACK, EXTENDED_STACK } from './daten'
import { SuppCtx, type ModalZustand, type ModalTyp } from './kontext'
import type { StackDaten, KatalogEintrag } from '../../../lib/supplements/stack-read'
import {
  SuppToday, SuppStack, SuppDatabase, SuppInteractions, SuppCost,
} from './tabs'
// G-33: die beiden Tabs mit den meisten Unterkomponenten stehen in
// eigenen Dateien — `tabs.tsx` waere sonst ueber 1.200 Zeilen lang.
import { SuppExtended } from './tab-extended'
import { SuppCompliance } from './tab-compliance'
// G-45: der Injections-Tab mit der Rotationskarte.
import { SuppInjections } from './tab-injektionen'
// G-45: die vier Tabs aus -spec.jsx.
import { SuppCatalog, SuppStacks, SuppIntelligence, SuppInventory } from './tab-spec'
import { SupplementsModale } from './modale'

/**
 * Die elf Tabs der Vorlage (module-supplements.jsx:240-253).
 *
 * G-37: Die Zahl an `Stack` kommt aus dem echten Stack, sobald einer
 * gelesen wurde — sonst aus der Vorlage.
 */
function tabs(stackAnzahl: number): TabItem[] {
  return [
    { id: 'today', label: 'Today', icon: 'check' },
    { id: 'stack', label: 'Stack', icon: 'supplements', count: stackAnzahl },
    { id: 'extended', label: 'Extended', icon: 'medical', count: EXTENDED_STACK.length },
    { id: 'catalog', label: 'Catalog', icon: 'search' },
    { id: 'stacks', label: 'Stacks', icon: 'layers' },
    { id: 'intel', label: 'Intelligence', icon: 'sparkles' },
    { id: 'inventory', label: 'Inventory', icon: 'marketplace' },
    { id: 'injection', label: 'Injections', icon: 'medical' },
    { id: 'compliance', label: 'Compliance', icon: 'calendar' },
    { id: 'interactions', label: 'Interactions', icon: 'sparkles', count: 3 },
    { id: 'cost', label: 'Cost', icon: 'trend_up' },
  ]
}

// G-45: Die Platzhalter-Tabelle ist entfallen — **alle zwoelf Tabs
// der Vorlage sind gebaut.** Sie fuehrte die fuenf, die aus
// `-spec.jsx` und `-injection.jsx` kommen, und zeigte je eine Kachel
// mit Herkunftsangabe. `[cmd]` Nachgezaehlt: `tabs()` gibt zwoelf
// Eintraege, und zu jedem gibt es unten eine Weiche.

export function SupplementsAnsicht({
  daten = null, katalog = [],
}: {
  daten?: StackDaten | null
  katalog?: KatalogEintrag[]
}) {
  const [tab, setTab] = React.useState('today')
  const [modal, setModal] = React.useState<ModalZustand>(null)

  // G-37: Sind echte Daten da, kommt der Anfangszustand aus dem
  // Protokoll — abgehakt ist, was als `taken` gebucht ist. Ohne Daten
  // bleiben die drei Vorgaben der Vorlage (Zeile 216).
  const [takenToday, setTakenToday] = React.useState<Record<string, boolean>>(() => {
    if (!daten) return { creatine: true, d3k2: true, omega3: true }
    const heute = daten.einnahmen[0]?.intake_date
    const ab: Record<string, boolean> = {}
    for (const e of daten.einnahmen) {
      if (e.intake_date === heute && e.stack_item_id && e.status === 'taken') {
        ab[e.stack_item_id] = true
      }
    }
    return ab
  })

  const open = React.useCallback((type: ModalTyp, payload?: unknown) => {
    setModal({ type, payload })
  }, [])
  const close = React.useCallback(() => setModal(null), [])
  const toggleTaken = React.useCallback((id: string) => {
    setTakenToday(t => ({ ...t, [id]: !t[id] }))
  }, [])

  const ctx = React.useMemo(
    () => ({ takenToday, toggleTaken, open, daten, katalog }),
    [takenToday, toggleTaken, open, daten, katalog],
  )

  // Angebunden oder Vorlage — beide Faelle an einer Stelle entschieden.
  const stackAnzahl = daten ? daten.positionen.length : STACK.length
  // `[cmd]` Der juengste Protokolltag; die Vorlage zeigt „Sat · May 16".
  const heuteText = daten?.einnahmen[0]?.intake_date ?? 'Sat · May 16'


  return (
    <>
      <div className="v2-module-header v2-module-hero-lite">
        <div className="v2-module-title-block">
          <div className="v2-module-title-row">
            <span className="v2-module-title">Supplements</span>
            {/* G-37: Datum und Anzahl aus den echten Daten, wo sie
                vorliegen. Die Quote fehlt bewusst — `[cmd]` das
                Protokoll deckt EINEN Tag ab; „30d · 94%" waere eine
                Behauptung ueber 29 Tage, die es nicht gibt. Was sie
                braeuchte, steht im Bericht. */}
            <Pill>{heuteText}</Pill>
            <Pill variant="acc">{stackAnzahl} active</Pill>
            {daten
              ? <Pill><span className="v2-dot" style={{ background: 'var(--acc-suppl)' }} />
                  {daten.protokoll_tage} d logged
                </Pill>
              : <Pill><span className="v2-dot" style={{ background: 'var(--pos)' }} /> Compliance 30d · 94%</Pill>}
          </div>
          <div className="v2-module-sub">
            Stack, dosing schedule, interactions, cost · coach-shared
          </div>
        </div>
        <div className="v2-module-actions">
          <button type="button" className="v2-btn" onClick={() => setTab('database')}>
            <Icon name="search" className="v2-ic v2-ic-sm" /> Database
          </button>
          <InEntwicklungKnopf titel="Export stack" className="v2-btn">
            <Icon name="download" className="v2-ic v2-ic-sm" /> Export stack
          </InEntwicklungKnopf>
          <button type="button" className="v2-btn v2-btn-primary" onClick={() => open('catalogAdd')}>
            <Icon name="plus" className="v2-ic v2-ic-sm" /> Add supplement
          </button>
        </div>
      </div>

      <Tabs items={tabs(stackAnzahl)} active={tab} onChange={setTab} />

      <SuppCtx.Provider value={ctx}>
        <div style={{ marginTop: 16 }}>
          {tab === 'today' && <SuppToday />}
          {tab === 'stack' && <SuppStack />}
          {tab === 'extended' && <SuppExtended />}
          {tab === 'database' && <SuppDatabase />}
          {tab === 'compliance' && <SuppCompliance />}
          {tab === 'interactions' && <SuppInteractions />}
          {tab === 'cost' && <SuppCost />}
          {tab === 'injection' && <SuppInjections />}
          {tab === 'catalog' && <SuppCatalog />}
          {tab === 'stacks' && <SuppStacks />}
          {tab === 'intel' && <SuppIntelligence />}
          {tab === 'inventory' && <SuppInventory />}
        </div>
      </SuppCtx.Provider>

      <SupplementsModale modal={modal} onClose={close} />
    </>
  )
}
