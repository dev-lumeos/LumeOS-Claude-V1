// Recovery der Oberflaeche v2.
//
// `[cmd]` Die Seitenleiste fuehrt seit G-02 einen Eintrag `Recovery`
// mit `href: /v2/recovery` (packages/ui/src/shell/nav.ts:72).
//
// **G-55: Diese Seite liest jetzt.** Bis hierher stand hier, es gebe
// „gar kein Schema" und der Begriff `recovery` komme in
// `supabase/_pipeline/` in keiner SQL-Datei vor. `[cmd]` Das stimmt
// seit Kettenschritt 120 nicht mehr:
// `supabase/_pipeline/12_recovery/120_recovery_checkins.sql` legt
// `recovery.checkins` an — Schlaf, Stimmung, Muskelkater, Stress,
// Ruhepuls, HRV.
//
// `[read]` Angebunden ist nur, was ERFASST wurde. Der Erholungswert
// bleibt Attrappe: er ist `SPEC_09` und hat dieselbe offene Frage wie
// C-49 — welche Gewichtung gilt. Eine Zahl zu zeigen, die niemand
// beschlossen hat, waere eine Behauptung.
import type { Metadata } from 'next'

import { ladeCheckins } from '../../../lib/recovery/checkin-read'
import { RecoveryAnsicht } from './ansicht'
import './recovery.css'

export const metadata: Metadata = {
  title: 'Recovery · LumeOS',
}

export default async function V2RecoveryPage() {
  const checkins = await ladeCheckins()
  return <RecoveryAnsicht checkins={checkins} />
}
