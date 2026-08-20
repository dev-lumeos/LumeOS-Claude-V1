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
// **G-90: Diese Seite liest.** `[cmd]` Bis hierher stand hier, ein
// `coach`-Schema gebe es nicht. **Das stimmt seit C-119 nicht mehr:**
// `supabase/_pipeline/15_coach/150_coach_permissions_autonomy.sql`
// legt sechs Tabellen an — Rechte, Autonomy, zwei Aenderungslogs,
// wartende Aktionen und ein Aktionslog.
//
// `[cmd]` **Lesbar sind sie heute trotzdem nicht:** `coach` ist nicht
// fuer PostgREST freigegeben. Gemessen am 2026-08-20, angemeldet:
// `Invalid schema: coach`, waehrend `recovery`, `training` und `goals`
// im selben Lauf lesen. Die Freigabe gehoert in die
// Supabase-Konfiguration und damit zu Codex — gemeldet im Bericht 139.
//
// `[read]` **Der Leseweg ist trotzdem gebaut** (Muster G-65): faellt
// die Abfrage aus, zeigt die Oberflaeche einen Leerzustand mit Grund
// statt einer Attrappe. Sobald das Schema freigegeben ist, stehen die
// Zeilen da, ohne dass hier etwas zu aendern waere.
//
// `[cmd]` Der Coach Portal gehoert NICHT hierher: er steht seit G-02
// unter WORKSPACES als externer Link auf coach.lumeos.app
// (`nav.ts:86`). Die Vorlage traegt ihn zwar in derselben Datei, aber
// hinter einer fest verdrahteten Weiche — Beleg in
// docs/ssot/102-coach-mockup.md.
import type { Metadata } from 'next'

import { ladeCoachRechte } from '../../../../lib/coach/rechte-read'
import { CoachAnsicht } from '../ansicht'
import '../coach.css'

export const metadata: Metadata = {
  title: 'Human Coaches · LumeOS',
}

export const dynamic = 'force-dynamic'

export default async function V2CoachHumanPage() {
  const stand = await ladeCoachRechte()
  return <CoachAnsicht stand={stand} />
}
