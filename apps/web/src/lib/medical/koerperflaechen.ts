// Die 21 Koerperflaechen der Injektionsauswahl — G-423, E-79.
//
// ══ WARUM DIESE DATEI GETRENNT STEHT ════════════════════════════════
//
// `[cmd]` **Sie stand zuerst in `injektion-konfig-write.ts`**, und die
// Kachel importierte sie von dort. `[cmd]` **Am Schirm gemessen:
// HTTP 500 auf JEDER Seite**, auch auf `/login`:
//
//     You're importing a component that needs next/headers.
//     Import trace:
//       packages/shared/src/supabase/session.ts
//       -> lib/medical/injektion-konfig-write.ts
//       -> app/v2/supplements/zyklus-karten.tsx   ('use client')
//
// `[read]` **`tsc` blieb dabei gruen** — der Typ stimmt ja. **Dieselbe
// Klasse wie G-412** (`stufenFaktor is not a function`), nur schlimmer:
// dort fiel eine Kachel aus, hier die ganze Anwendung.
//
// `[read]` **Eine Konstante, die beide Seiten brauchen, gehoert in
// eine Datei ohne Serverimporte** — genau wie `injektion-karte.ts` es
// fuer die Rechnung schon macht.
//
// ══ WOHER DIE LISTE KOMMT ═══════════════════════════════════════════
//
// `[cmd]` **Aus dem CHECK auf
// `medical.user_injection_site_selections.body_area_code`**, gemessen
// gegen `pg_constraint` — nicht aus dem Kopf.
//
// `[cmd]` **Abgleich mit `packages/ui/src/koerperkarte-pfade.ts`,
// 2026-09-11:**
//
//     in beiden             20 Flaechen
//     nur im CHECK          latissimus
//     nur in der Karte      hair
//
// `[read]` **`hair` ist keine Injektionsflaeche** — dass die Karte sie
// zeichnet, ist richtig; dass der CHECK sie nicht erlaubt, auch.
//
// `[read]` **`latissimus` ist die echte Luecke:** die Datenbank
// erlaubt ihn, die Karte hat keinen Pfad. **Eine Auswahl darauf liesse
// sich schreiben und nicht zeichnen.** `[cmd]` **Gemeldet, nicht
// geflickt** — `packages/ui` gehoert allen Apps, und ein Pfad ist eine
// Zeichnung, keine Vermutung.

/** Die 21 Flaechen, die der CHECK erlaubt. */
export const KOERPERFLAECHEN = [
  'chest', 'abs', 'obliques', 'biceps', 'quadriceps', 'knees',
  'tibialis', 'gluteal', 'hamstring', 'triceps', 'deltoids',
  'trapezius', 'neck', 'forearm', 'adductors', 'calves', 'head',
  'hands', 'ankles', 'feet', 'latissimus',
] as const
export type Koerperflaeche = typeof KOERPERFLAECHEN[number]

/** Die Wege, die `user_injection_site_selections.route` erlaubt. */
export const INJEKTIONSWEGE = ['injection_im', 'injection_subq'] as const
export type Injektionsweg = typeof INJEKTIONSWEGE[number]
