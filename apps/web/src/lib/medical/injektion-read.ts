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

// ── E-79: DIE KONFIGURIERTEN FLAECHEN ───────────────────────────────
//
// **Tom, 2026-09-08:** *„der user waehlt: peptide oder enhanced,
// wieviel, nadel, moegliche injektionspunkte — und wir verwalten es.
// rotationsplaene gemaess KONFIGURIERTEN injektionspunkten. wenn er
// triceps waehlt weil er lokal ein tendonproblem hat, dann zeigen wir
// den triceps und keinen rotationsvorschlag, weil nur triceps
// vorhanden ist."*
//
// `[cmd]` **C-455 hat `medical.user_injection_site_selections`
// gebaut** — `(user_id, substance_id, route, body_area_code)` eindeutig,
// dazu `needle_gauge` und `needle_length_in`.
//
// `[cmd]` **`body_area_code` ist auf 21 Werte beschraenkt** (CHECK,
// gemessen) — dieselben 21 Flaechen, die
// `packages/ui/src/koerperkarte-pfade.ts` zeichnet. **Das IST E-79.**
//
// `[cmd]` **Und die Rotation steht in der Datenbank, nicht hier:**
// `medical.suggest_configured_injection_area(p_substance_id, p_route)`
// gibt die am laengsten geruhte KONFIGURIERTE Flaeche —
// **mit `WHERE (SELECT count(*) FROM selected) > 1`.**
//
// `[read]` **Eine Flaeche heisst: kein Vorschlag** — die Regel steht im
// SQL, und diese Datei erfindet sie nicht noch einmal daneben.

// `[read]` **Weitergereicht, nicht zweimal gefuehrt** — zwei Listen
// fuer denselben CHECK heissen zwei Listen.
export { INJEKTIONSWEGE, type Injektionsweg } from './koerperflaechen'
import type { Injektionsweg } from './koerperflaechen'

/** Eine konfigurierte Flaeche fuer eine Substanz. */
export type KonfigurierteFlaeche = {
  id: string
  substance_id: string
  substanz_name: string | null
  route: string
  body_area_code: string
  needle_gauge: string | null
  needle_length_in: number | null
}

/** Was die Datenbank als naechste Flaeche vorschlaegt — oder nichts. */
export type Rotationsvorschlag = {
  body_area_code: string
  suggestion_reason: string
}

export type KonfigurationsStand = {
  flaechen: KonfigurierteFlaeche[]
  /** `null` heisst: kein Vorschlag — bei genau EINER Flaeche so gewollt. */
  vorschlag: Rotationsvorschlag | null
  fehler: string | null
}

/**
 * Die konfigurierten Flaechen des Nutzers, und was daraus folgt.
 *
 * `[read]` **Der Vorschlag wird NUR geholt, wenn eine Substanz gemeint
 * ist** — `suggest_configured_injection_area` fragt je Substanz und
 * Weg, nicht global.
 */
export async function ladeKonfiguration(
  substanzId?: string, weg?: Injektionsweg,
): Promise<KonfigurationsStand> {
  const db = createSessionClient()
  const { data, error } = await db
    .schema('medical')
    .from('user_injection_site_selections')
    .select('id, substance_id, route, body_area_code, needle_gauge, needle_length_in')
    .order('body_area_code', { ascending: true })

  if (error) return { flaechen: [], vorschlag: null, fehler: error.message }

  const zeilen = (data ?? []) as unknown as Array<Record<string, unknown>>

  // Die Namen der Substanzen in EINER Abfrage — nicht je Zeile eine.
  // `[read]` **`filter` statt `Set` ausbreiten** — ein `Set` laesst
  // sich beim Ziel dieses Pakets nicht ausbreiten (TS2802).
  const alleIds = zeilen.map(z => String(z.substance_id))
  const ids = alleIds.filter((v, i) => alleIds.indexOf(v) === i)
  const namen = new Map<string, string>()
  if (ids.length > 0) {
    const { data: subs } = await db
      .schema('supplements')
      .from('supplements')
      .select('id, name_de, name_en')
      .in('id', ids)
    for (const s of (subs ?? []) as unknown as Array<Record<string, unknown>>) {
      const n = (s.name_de || s.name_en) as string | null
      if (n) namen.set(String(s.id), n)
    }
  }

  const flaechen: KonfigurierteFlaeche[] = zeilen.map(z => ({
    id: String(z.id),
    substance_id: String(z.substance_id),
    substanz_name: namen.get(String(z.substance_id)) ?? null,
    route: String(z.route),
    body_area_code: String(z.body_area_code),
    needle_gauge: z.needle_gauge == null ? null : String(z.needle_gauge),
    needle_length_in: z.needle_length_in == null ? null : Number(z.needle_length_in),
  }))

  // ══ WELCHE SUBSTANZ IST GEMEINT? ══════════════════════════════════
  //
  // `[cmd]` **Am Schirm gemessen (2026-09-11): zwei konfigurierte
  // Flaechen, und trotzdem kein Vorschlag.** `[read]` **Der Grund war
  // hier:** die Seite ruft `ladeKonfiguration()` ohne Argumente, und
  // ohne Substanz wurde die Funktion nie gefragt.
  //
  // `[read]` **Ohne Angabe die erste konfigurierte Substanz nehmen** —
  // sie ist die einzige, zu der es ueberhaupt etwas vorzuschlagen
  // gibt. **Eine leere Anzeige waere hier kein Leerzustand, sondern
  // eine verschluckte Antwort.**
  const erste = flaechen[0]
  const fuerSubstanz = substanzId ?? erste?.substance_id
  const fuerWeg = weg ?? (erste?.route as Injektionsweg | undefined)

  let vorschlag: Rotationsvorschlag | null = null
  if (fuerSubstanz && fuerWeg) {
    // `[read]` **Die Funktion entscheidet, nicht diese Datei** — sie
    // gibt bei EINER konfigurierten Flaeche gar keine Zeile zurueck.
    const { data: v } = await db
      .schema('medical')
      .rpc('suggest_configured_injection_area', {
        p_substance_id: fuerSubstanz, p_route: fuerWeg,
      })
    const zeile = (Array.isArray(v) ? v[0] : null) as Record<string, unknown> | null
    if (zeile?.body_area_code) {
      vorschlag = {
        body_area_code: String(zeile.body_area_code),
        suggestion_reason: String(zeile.suggestion_reason ?? ''),
      }
    }
  }

  return { flaechen, vorschlag, fehler: null }
}

/** Eine Substanz, die laut Katalog gespritzt wird. */
export type InjizierbareSubstanz = {
  id: string
  name: string
  /** Die Wege, die `supplement_pharmacology` fuer sie belegt. */
  wege: string[]
}

/**
 * Die Substanzen, fuer die sich eine Flaeche konfigurieren laesst.
 *
 * `[read]` **Der Trigger `validate_injection_site_selection` verlangt
 * genau das:** eine im Katalog belegte Injektionsroute. **Eine Liste,
 * die mehr anboete, waere eine Falle** — jeder Versuch schluege fehl.
 */
export async function ladeInjizierbareSubstanzen(): Promise<InjizierbareSubstanz[]> {
  const { data, error } = await createSessionClient()
    .schema('supplements')
    .from('supplement_pharmacology')
    .select('route, supplement_id, supplements!inner(id, name_de, name_en)')
    .in('route', ['injection_im', 'injection_subq'])
  if (error) return []

  const nach = new Map<string, InjizierbareSubstanz>()
  for (const z of (data ?? []) as unknown as Array<Record<string, unknown>>) {
    const s = z.supplements as Record<string, unknown> | null
    if (!s) continue
    const id = String(s.id)
    const name = (s.name_de || s.name_en) as string | null
    // `[read]` **Ohne Namen keine Auswahl** — eine Zeile, die als
    // Kennung dastuende, koennte niemand lesen.
    if (!name) continue
    const vorhanden = nach.get(id)
    if (vorhanden) vorhanden.wege.push(String(z.route))
    else nach.set(id, { id, name, wege: [String(z.route)] })
  }
  const liste: InjizierbareSubstanz[] = []
  nach.forEach(v => { liste.push(v) })
  return liste.sort((a, b) => a.name.localeCompare(b.name))
}
