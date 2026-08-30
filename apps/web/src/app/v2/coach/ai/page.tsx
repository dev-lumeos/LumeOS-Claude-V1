// Coach → AI Coach der Oberflaeche v2 — der uebernommene Entwurf,
// ganz Attrappe.
//
// `[cmd]` Die Seitenleiste fuehrt seit G-02 einen Eintrag `Coach` mit
// zwei Unterpunkten (`packages/ui/src/shell/nav.ts:77-81`):
//   { id: 'coach-human', label: 'Human Coaches', href: /v2/coach/human }
//   { id: 'coach-ai',    label: 'AI Coach',      href: /v2/coach/ai }
// Human Coaches steht seit G-40; diese Seite loest die dortige
// Platzhalterseite ab, die die zwanzig fehlenden Tabs benannte.
//
// `[cmd]` `app.jsx:127`: `case "coach-ai": return <BuddyModule />;`
// `module-buddy.jsx:414` setzt `window.BuddyModule` genau einmal —
// keine V2-Weiche, der Rahmen ist eindeutig.
//
// DIESE SEITE LIEST NICHTS. `[cmd]` Ein Buddy-Schema gibt es nicht —
// **gemessen am 2026-08-30:** kein Schema `buddy`, und keine der 12
// `coach`-Tabellen traegt Buddy-Material. Es ist nichts anzubinden,
// also wird nichts geladen.
//
// `[cmd]` **BERICHTIGT IN A-62:** hier stand zusaetzlich *„weder
// `buddy` noch `coach` kommt in `supabase/_pipeline/` in einem
// `CREATE TABLE` vor"*. **Fuer `coach` ist das seit C-119 falsch** —
// 13 `CREATE TABLE` in `15_coach/`, 12 Tabellen live.
//
// @abwesend coach.buddy_memory
// `[read]` **A-62: der Satz oben haengt an dieser Abwesenheit.**
// Sobald eine Buddy-Tabelle in der Pipeline steht, faellt
// `tools/abwesenheit-pruefen.mjs` und nennt diese Zeile — **statt dass
// „liest nichts" still zur Falschaussage wird.** Der Name ist der
// erste, den ein Buddy-Schema braucht (Gedaechtnis, SPEC/module-buddy);
// er ist der Wecker, nicht die Vorgabe.
//
// `[read]` Tom zum Umfang: „Der AI Coach ist ein Teil von
// Buddy-Logik. Der effektive Endausbau, welcher DER BUDDY als App sein
// wird, wird viel umfangreicher sein." Gebaut ist das Modul der
// Vorlage, nicht der Endausbau.
//
// `[read]` Was im Vorgaengerrepo danebenliegt — `buddy.ts` mit 54 KB,
// `buddyWatcher.ts` mit 38 KB, zwei Migrationen — steht in
// docs/ssot/106-ai-coach-mockup.md.
import type { Metadata } from 'next'

import { BuddyAnsicht } from './ansicht'
import './buddy.css'

export const metadata: Metadata = {
  title: 'AI Coach · LumeOS',
}

export default function V2CoachAiPage() {
  return <BuddyAnsicht />
}
