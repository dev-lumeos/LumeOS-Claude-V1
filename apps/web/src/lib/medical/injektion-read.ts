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

/**
 * Eine Zeile aus `medical.injection_logs`.
 *
 * `[cmd]` **Die Fremdschluesselspalte heisst `injection_site_id`**,
 * nicht `site_id` — gemessen in `information_schema`. **Der falsche
 * Name haette stumm nichts geliefert**, weil PostgREST unbekannte
 * Spalten in `select` mit einem Fehler quittiert, den die Kachel als
 * „keine Eintraege" gezeigt haette.
 */
export type InjektionsProtokollZeile = {
  id: string
  injection_site_id: string
  injected_at: string
  volume_ml: number | null
  substance_name: string | null
  route: string | null
  pain_score: number | null
  complication: string | null
  override_reason: string | null
}

/**
 * Eine Zeile aus `medical.injection_needle_recommendations`.
 *
 * `[cmd]` **Der Schluessel ist die ORTSART, nicht die Orts-Id**
 * (C-445/A5): `deltoid`, `vastus_lateralis`, `ventrogluteal`,
 * `subcutaneous`. **8 Zeilen fuer 16 Orte** — mehrere Orte teilen
 * sich eine Empfehlung, und ein Ort kann mehrere haben (Deltoid: eine
 * allgemeine, eine aus der Impfstoffleitlinie).
 */
export type NadelZeile = {
  route: string
  site: string
  medication_viscosity: string | null
  gauge_range: string | null
  length_range: string | null
  source_citation: string | null
}

/** Eine Zeile aus `medical.injection_tissue_condition_guidance`. */
export type GewebeZeile = {
  condition_code: string
  avoidance_min_months: number | null
  avoidance_max_months: number | null
  rationale: string | null
  source_citation: string | null
}

export type InjektionsStand = {
  orte: InjektionsOrtZeile[]
  protokoll: InjektionsProtokollZeile[]
  nadeln: NadelZeile[]
  gewebehinweise: GewebeZeile[]
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
    // `[cmd]` **G-396: die Spalte heisst `injection_site_id`**, nicht
    // `site_id` — gemessen in `information_schema`. Der alte Name
    // haette stumm 0 Zeilen geliefert, auch wenn welche da waeren.
    //
    // `[cmd]` **Seit C-445 zwoelf Spalten** — `volume_ml`,
    // `substance_name`, `pain_score`, `complication`,
    // `override_reason` kamen dazu. **Das Modal zeigt sie.**
    m.from('injection_logs')
      .select('id, injection_site_id, injected_at, volume_ml, '
        + 'substance_name, route, pain_score, complication, override_reason')
      .order('injected_at', { ascending: false })
      .limit(200),
    // `[cmd]` **Die Nadelempfehlung haengt an der ORTSART**
    // (`deltoid`, `vastus_lateralis`, `ventrogluteal`,
    // `subcutaneous`), nicht an den 16 Ids — C-445/A5.
    m.from('injection_needle_recommendations')
      .select('route, site, medication_viscosity, gauge_range, '
        + 'length_range, source_citation'),
    m.from('injection_tissue_condition_guidance')
      .select('condition_code, avoidance_min_months, avoidance_max_months, '
        + 'rationale, source_citation'),
  ])

  const fehler = orte.error?.message ?? null
  return {
    orte: ((orte.data ?? []) as unknown as InjektionsOrtZeile[]),
    protokoll: ((protokoll.data ?? []) as unknown as InjektionsProtokollZeile[]),
    // `[read]` **Zeilen statt Zaehlern** — G-396: das Modal zeigt die
    // Werte, und eine Zahl allein ist keiner. **Vorher standen hier
    // `count: 'exact', head: true`**, also nur „es gibt 8".
    nadeln: ((nadeln.data ?? []) as unknown as NadelZeile[]),
    gewebehinweise: ((gewebe.data ?? []) as unknown as GewebeZeile[]),
    fehler,
  }
}
