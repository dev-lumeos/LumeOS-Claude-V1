// G-430 — der Leseweg fuer `public.koerperflaechen`.
//
// ══ WARUM ES DIESE DATEI GIBT ═══════════════════════════════════════
//
// **Tom, 2026-09-08:** *„irgendwie entsteht hier ein ghetto. in der
// grafik ist der latissimus noch nicht anwaehlbar. ich sehe noch kein
// parent/child konzept."*
//
// `[cmd]` **C-468 hat `public.koerperflaechen` gebaut — 59 Zeilen,
// drei Ebenen, `parent_id`, `art`, `muscle_group_id` — und NIEMAND
// hat sie gelesen** (gemessen 2026-09-11, `rg` ueber `apps/`).
//
// `[read]` **Das hier ist der erste Leseweg.**
//
// ══ NUR DAS LESEN STEHT HIER ════════════════════════════════════════
//
// `[cmd]` **Die RECHNUNG liegt in `hierarchie.ts`, ohne Importe** —
// diese Datei zieht `next/headers` ueber `createSessionClient`, und
// ein Wert-Import daraus in eine `'use client'`-Komponente ergab
// **HTTP 500 auf `/login`** (gemessen 2026-09-12). **`tsc` blieb
// gruen.**
//
// ══ WAS SIE NICHT TUT ═══════════════════════════════════════════════
//
// `[cmd]` **Sie ersetzt `MUSKEL_ZU_FLAECHE` NICHT.** **Gemessen
// 2026-09-12** (`tools/_g430-tabelle.mjs`):
//
//     muskel-ebenen.ts fuehrt              96 Muskelnamen
//     davon ueber die Tabelle erreichbar   60
//     NICHT erreichbar                     36
//
// `[read]` **Die 36 sind keine Kleinigkeit** — darunter `Back`,
// `Rhomboids`, `Teres Major`, `Upper Back`, `Lower Back`, `Core`,
// `Arms`, `Legs`. **Wer heute umstellt, verliert 36 Muskeln, die
// heute Farbe bekommen.**
//
// `[read]` **Also: die Tabelle traegt die HIERARCHIE, die Handliste
// traegt die Abdeckung.** **Wenn die 36 nachgezogen sind, faellt die
// Handliste weg; bis dahin waere ihr Wegfall ein Verlust.**
import { createSessionClient } from '@lumeos/shared/session'

import type { Flaeche, HierarchieStand } from './hierarchie'

export type { Flaeche, HierarchieStand } from './hierarchie'

const LEER: HierarchieStand = { flaechen: [], fehler: null }

/**
 * Alle Flaechen, einmal gelesen.
 *
 * `[read]` **Serverseitig** — die Tabelle ist Stammdaten, und der
 * Aufrufer ist eine Serverkomponente.
 */
export async function ladeHierarchie(): Promise<HierarchieStand> {
  try {
    const s = createSessionClient()
    const { data, error } = await s
      .from('koerperflaechen')
      .select('id,parent_id,code,name_de,name_en,ebene,art,seite,muscle_group_id')
      .order('sortierung', { ascending: true })
    if (error) return { ...LEER, fehler: error.message }
    return { flaechen: (data ?? []) as Flaeche[], fehler: null }
  } catch (e) {
    return { ...LEER, fehler: e instanceof Error ? e.message : String(e) }
  }
}
