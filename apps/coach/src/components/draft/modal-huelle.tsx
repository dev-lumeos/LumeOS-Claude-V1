// Welches Modal offen ist — G-409/A5.
//
// ══ WARUM UEBER DIE ADRESSE ════════════════════════════════════════
//
// `[read]` **Die Vorlage haelt es im Browserzustand**
// (`useState(null)`, `shell.jsx:102`). `[cmd]` **Hier steht es in
// der Adresse (`&modal=alarm`)** — aus drei Gruenden:
//
//     1  ein Modal laesst sich verlinken und im Bild festhalten
//     2  die Gegenprobe kann es OEFFNEN, nicht nur den Knopf sehen
//     3  „Zurueck" schliesst es, statt die Seite zu verlassen
//
// `[read]` **Am Schirm sieht man denselben Kasten** — der Weg dahin
// ist ein anderer.
'use client'

import * as React from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

import { MODALE, type ModalName } from './modale'

export function DraftModal() {
  const router = useRouter()
  const params = useSearchParams()
  const name = params.get('modal') as ModalName | null
  const id = params.get('mid') ?? ''

  const schliessen = React.useCallback(() => {
    const p = new URLSearchParams(params.toString())
    p.delete('modal')
    p.delete('mid')
    router.push(`/?${p.toString()}`)
  }, [params, router])

  if (!name || !(name in MODALE)) return null
  const Modal = MODALE[name] as (p: { id: string, onClose: () => void }) => React.JSX.Element
  return <Modal id={id} onClose={schliessen} />
}

/**
 * Ein Knopf, der ein Modal oeffnet.
 *
 * `[read]` **Ein Verweis, kein `onClick`** — dann funktioniert er
 * auch ohne JavaScript, und die Gegenprobe kann ihn anklicken.
 */
export function ModalKnopf({ modal, mid, children, art }: {
  modal: ModalName
  mid?: string
  children: React.ReactNode
  art?: 'primaer'
}) {
  const params = useSearchParams()
  const p = new URLSearchParams(params.toString())
  p.set('modal', modal)
  if (mid) p.set('mid', mid)
  return (
    <a className={`v2-btn${art === 'primaer' ? ' v2-btn-primary' : ''}`} href={`/?${p.toString()}`}>
      {children}
    </a>
  )
}
