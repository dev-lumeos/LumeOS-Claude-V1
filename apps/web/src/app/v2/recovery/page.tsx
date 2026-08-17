// Recovery der Oberflaeche v2 — der uebernommene Entwurf, ganz Attrappe.
//
// `[cmd]` Die Seitenleiste fuehrt seit G-02 einen Eintrag `Recovery`
// mit `href: /v2/recovery` (packages/ui/src/shell/nav.ts:72). Er zeigte
// bis hierher ins Leere.
//
// DIESE SEITE LIEST NICHTS. `[cmd]` Anders als bei Training, wo
// wenigstens 1.416 Uebungen als Stammdaten liegen, gibt es hier
// **gar kein Schema**: der Begriff `recovery` kommt in
// `supabase/_pipeline/` in keiner einzigen SQL-Datei vor. Es ist nichts
// anzubinden, also wird nichts geladen — eine Serverkomponente ohne
// Datenzugriff waere Fassade. Was zuerst echte Daten bekommen koennte,
// steht in docs/ssot/92-recovery-mockup.md.
import type { Metadata } from 'next'

import { RecoveryAnsicht } from './ansicht'
import './recovery.css'

export const metadata: Metadata = {
  title: 'Recovery · LumeOS',
}

export default function V2RecoveryPage() {
  return <RecoveryAnsicht />
}
