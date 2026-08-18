// Coach → Human Coaches der Oberflaeche v2 — der uebernommene Entwurf,
// ganz Attrappe.
//
// `[cmd]` Die Seitenleiste fuehrt seit G-02 einen Eintrag `Coach` mit
// zwei Unterpunkten (`packages/ui/src/shell/nav.ts:77-81`):
//   { id: 'coach-human', label: 'Human Coaches', href: /v2/coach/human }
//   { id: 'coach-ai',    label: 'AI Coach',      href: /v2/coach/ai }
// Beide zeigten bis hierher ins Leere. Diese Seite bedient den ersten.
//
// `[read]` Tom: „Coach Hauptnavigationspunkt mit 2 Subnav: Human
// Coaches und AI Coach. Zwei Subnav, weil die optional verfuegbar sein
// werden." Die Unterteilung ist hier richtig — anders als bei
// Nutrition, wo die Vorlage Tabs fuehrte und die Unterteilung falsch
// war.
//
// DIESE SEITE LIEST NICHTS. `[cmd]` Ein `coach`-Schema gibt es nicht —
// der Begriff kommt in `supabase/_pipeline/` in keiner SQL-Datei vor.
// Es ist nichts anzubinden, also wird nichts geladen.
//
// `[cmd]` Der Coach Portal gehoert NICHT hierher: er steht seit G-02
// unter WORKSPACES als externer Link auf coach.lumeos.app
// (`nav.ts:86`). Die Vorlage traegt ihn zwar in derselben Datei, aber
// hinter einer fest verdrahteten Weiche — Beleg in
// docs/ssot/102-coach-mockup.md.
import type { Metadata } from 'next'

import { CoachAnsicht } from '../ansicht'
import '../coach.css'

export const metadata: Metadata = {
  title: 'Human Coaches · LumeOS',
}

export default function V2CoachHumanPage() {
  return <CoachAnsicht />
}
