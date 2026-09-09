// Lese-I/O fuer die Injektionsorte — G-388.
//
// ══ WAS DASTEHT, UND WAS NICHT ══════════════════════════════════════
//
// `[cmd]` **Gemessen 2026-09-09 gegen die laufende Instanz:**
//
//     medical.injection_sites                      4 Zeilen, 10 Spalten
//     medical.injection_logs                       0 Zeilen,  6 Spalten
//     medical.injection_site_conditions            0 Zeilen, 10 Spalten
//     medical.injection_needle_recommendations     8 Zeilen, 12 Spalten
//     medical.injection_tissue_condition_guidance  1 Zeile,   6 Spalten
//
// `[read]` **Die Attrappenmarke der Kachel behauptete das Gegenteil:**
// *„Es gibt keine Tabelle fuer Injektionen — weder Orte noch Protokoll
// noch Plan."* **Es gibt fuenf.** Diese Datei ist der Leseweg dorthin.
//
// ══ VIER ORTE, NICHT SECHZEHN ═══════════════════════════════════════
//
// `[cmd]` **`injection_sites` fuehrt anatomische REGIONEN ohne Seite:**
// `deltoid`, `vastus_lateralis`, `ventrogluteal`, `subcutaneous`.
// **Kein `delt_l`/`delt_r`.**
//
// `[read]` **Die Seitigkeit gehoert zur Erfassung, nicht zum Ort** —
// welche Schulter benutzt wurde, steht im Protokoll, nicht im Katalog.
// **Die Karte zeigt beide Seiten je Region**, weil eine Rotation genau
// das braucht; die Zuordnung steht in `KARTEN_ORTE` und ist Anzeige,
// keine erfundene Zeile.
//
// `[cmd]` **`subcutaneous` ist ein WEG, kein Ort** — es hat keinen
// anatomischen Punkt, und `INJEKTIONS_ORTE` in `packages/ui` fuehrt
// deshalb keinen. **Es faellt aus der Karte heraus, nicht aus der
// Liste.**
import { createSessionClient } from '@lumeos/shared/session'
// `[read]` **Die Rechnung und die Ortszuordnung stehen in
// `injektion-karte.ts`** — importfrei, damit die Kachel sie laden
// kann, ohne dieses Servermodul mitzuziehen (G-388: HTTP 500).
export { tageSeitInjektion, punktFuerOrt } from './injektion-karte'

/** Eine Zeile aus `medical.injection_sites`. */
export type InjektionsOrtZeile = {
  id: string
  route: string
  display_name: string
  /**
   * `[cmd]` **Bei allen vier Zeilen NULL** — und das ist eine Angabe,
   * kein fehlender Wert. `minimum_rest_days_reason` nennt den Grund:
   * *„E-57: Keine wissenschaftlich validierte Mindest-Ruhezeit fuer
   * wiederholte IM-Injektionen."*
   *
   * `[read]` **Eine Zahl hier waere erfunden.** Der Entwurf fuehrte
   * `restDays: 14` je Ort — genau die Sorte Zahl, die E-57 verbietet.
   */
  minimum_rest_days: number | null
  minimum_rest_days_reason: string | null
  rotation_required: boolean
  rotation_distance_mm: number | null
  rotation_quadrant_interval_days: number | null
}

/** Eine Zeile aus `medical.injection_logs`. */
export type InjektionsProtokollZeile = {
  id: string
  site_id: string
  injected_at: string
}

export type InjektionsStand = {
  orte: InjektionsOrtZeile[]
  protokoll: InjektionsProtokollZeile[]
  nadeln: number
  gewebehinweise: number
  fehler: string | null
}

/**
 * Der Stand der Injektionsorte.
 *
 * `[read]` **Jede Abfrage haelt ihren eigenen Rueckfall** — faellt das
 * Protokoll aus, bleiben die Orte gueltig. Ein gemeinsames `try` um
 * ein `Promise.all` machte die ganze Kachel leer.
 */
export async function ladeInjektionsStand(): Promise<InjektionsStand> {
  const m = createSessionClient().schema('medical')

  const [orte, protokoll, nadeln, gewebe] = await Promise.all([
    m.from('injection_sites')
      .select('id, route, display_name, minimum_rest_days, '
        + 'minimum_rest_days_reason, rotation_required, rotation_distance_mm, '
        + 'rotation_quadrant_interval_days')
      .order('display_name', { ascending: true }),
    // `[cmd]` **0 Zeilen, und es gibt keinen Schreibweg** (G-388/A3).
    // `[read]` **Trotzdem gelesen:** kommt der Schreibweg, zeigt die
    // Kachel ohne weitere Aenderung Daten.
    m.from('injection_logs')
      .select('id, site_id, injected_at')
      .order('injected_at', { ascending: false })
      .limit(50),
    m.from('injection_needle_recommendations')
      .select('source_key', { count: 'exact', head: true }),
    m.from('injection_tissue_condition_guidance')
      .select('condition_code', { count: 'exact', head: true }),
  ])

  const fehler = orte.error?.message ?? null
  return {
    orte: ((orte.data ?? []) as unknown as InjektionsOrtZeile[]),
    protokoll: ((protokoll.data ?? []) as unknown as InjektionsProtokollZeile[]),
    nadeln: nadeln.count ?? 0,
    gewebehinweise: gewebe.count ?? 0,
    fehler,
  }
}
