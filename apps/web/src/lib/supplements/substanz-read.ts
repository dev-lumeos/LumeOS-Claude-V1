// Lese-I/O fuer die Substanzdatenbank.
//
// ── C-252: umgestellt auf den neuen Katalog (2026-08-23) ────────────
//
// `[cmd]` **Gelesen wird jetzt `supplements.supplements`** (566 Zeilen,
// 17 Spalten) plus die Detailtabellen — nicht mehr die Breittabelle
// `supplements.substance_catalog` (566 Zeilen, 67 flache Spalten).
// Beide stehen noch nebeneinander; das Loeschen der alten ist Schritt 5.
//
// ── DIE SICHTBARKEITSREGEL ──────────────────────────────────────────
//
// `[cmd]` **`im_katalog` ist eine generierte Spalte** (C-243) und
// entscheidet, was in den Katalog gehoert: **290 true, 276 false**
// (gemessen 2026-08-23). Die 276 tragen weder Beschreibung noch
// Evidenzgrad. **Ohne `.eq('im_katalog', true)` stehen 566 Eintraege
// in der Liste, davon 276 leer.**
//
// ── DIE BRUECKE ZUR ALTEN TABELLE ───────────────────────────────────
//
// `[cmd]` **`supplements.slug` ist die alte `substance_catalog.id`** —
// bei allen 566 identisch (gemessen 2026-08-23). Die IDs selbst sind
// NICHT vergleichbar: alt ist `text`, neu ist `uuid`.
//
// `[read]` **Deshalb traegt der Listeneintrag beides.** Der Anker
// `substance_catalog:<id>`, den der Stack in `notes` schreibt, bleibt
// damit gueltig, ohne dass `stack-read`/`stack-write` angefasst werden
// muessen (die gehoeren C-250). `[cmd]` Live traegt ohnehin **0 von 11
// `stack_items`** einen Anker.
//
// ── DEUTSCH IST LEER, UEBERALL ──────────────────────────────────────
//
// `[cmd]` **Gemessen am 2026-08-23: JEDE `*_de`-Freitextspalte des
// Schemas ist leer** — `name_de` 0/566, `description_de` 0/290,
// `summary_de` 0/288, `pregnancy_note_de` 0/237, `storage_de` 0/54,
// `metabolism_de` 0/290. Gefuellt ist durchweg `*_en`. Einzige
// Ausnahme sind die drei handgepflegten `supplement_groups.label_de`.
//
// `[read]` **Darum `text()` auf jedem Textfeld**, nicht nur beim Namen:
// erst `de`, dann `en`. Das ist laut Spec so gewollt, bis uebersetzt
// ist — es ist kein Datenfehler und wird nicht als Luecke gemeldet.
//
// Laeuft ausschliesslich serverseitig.
import fs from 'node:fs'
import path from 'node:path'

import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { createSessionClient } from '@lumeos/shared/session'

// `[read]` **`text()` steht seit C-254 in `substanz-luecken.ts`** — es
// ist reine Rechnung ohne I/O, und dort ist es pruefbar: diese Datei
// zieht `next/headers` und laesst sich in einem Test nicht laden
// (gegengeprobt 2026-08-23, `require() ES Module ... in a cycle`).
import { text, jsonNull } from './substanz-luecken'


/** Ein Herkunftsvermerk aus `evidence_provenance` — je Feldpfad. */
export type Herkunft = {
  source_id: string
  evidence_class: string
  as_of: string
}

/** Schlanke Zeile fuer die Katalogliste. */
export type SubstanzListenEintrag = {
  id: string
  /**
   * C-252: die alte `substance_catalog.id`. Traegt den Anker, den der
   * Stack in `notes` schreibt — die neue `id` ist ein UUID und passt
   * dort nicht.
   */
  slug: string
  name: string
  domain: string
  compound_type: string | null
  category: string | null
  /** Die Kategorie aus `supplement_categories` (23 Zeilen). */
  canonical_category: string | null
  /**
   * Die Kurzbeschreibung und die Gruppe (`supplement` · `enhanced` ·
   * `peptide`) aus `supplement_groups`. `[cmd]` Gemessen 2026-08-23
   * ueber die 290 sichtbaren: Beschreibung 290, Gruppe 290.
   */
  description: string | null
  gruppe: string | null
  /** `supplements.evidence_grade` — bei allen 290 gesetzt (A–F). */
  grad: string | null
  /**
   * G-186: die Zwecke, fuer die Suche.
   *
   * `[cmd]` **318/318 gefuellt, aber 842 VERSCHIEDENE Werte** auf 895
   * Eintraege (gemessen 2026-08-25) — es sind Saetze, keine
   * Schlagworte. **Deshalb kein Filter, sondern Suchtext.**
   */
  zwecke: string[]
}

/**
 * Der volle Satz. Alle Tiefen-Bloecke sind optional — sie fehlen,
 * solange der Pipeline-Lauf c9c741f nicht live eingespielt ist, und
 * sie fehlen je Substanz, wo die Recherche nichts hergab.
 */
export type SubstanzSatz = {
  id: string
  /** C-252: die alte `substance_catalog.id`, siehe Dateikopf. */
  slug?: string
  /** G-179: die deutschen Nutzertexte — `null`, wo keine Zeile existiert. */
  texte?: Nutzertexte | null
  /** G-179: 3-6 Alltagsfragen, nach `sort_order`. */
  fragen?: Frage[]
  /** G-182: die Quellenverweise — 290 von 290 gefuellt. */
  quellen?: Quelle[]
  /** G-182: die WADA-Klasse (S1.1, S2/S0 …) — 129 von 290. */
  wada_kategorie?: string | null
  /** G-186: Laborwirkungen — 90 der 318 haben welche. */
  laborwirkungen?: Laborwirkung[]
  /** G-186: Wechselwirkungen — 78 der 318 haben welche. */
  wechselwirkungen?: Wechselwirkung[]
  /** G-192: Community-Beobachtungen aus `wissen`, ohne Anleitungsfelder. */
  community?: CommunityHinweise | null
  /** G-179: die Unterformen, wenn dies ein Sammeleintrag ist. */
  formen?: Unterform[]
  canonical_name: string
  domain: string
  compound_type: string | null
  category: string | null
  subcategory: string | null
  chemical_form: string | null
  aliases: string[]
  cas_number: string | null
  external_ids: Record<string, unknown> | null
  evidence: Record<string, unknown> | null
  dosing: Record<string, unknown> | null
  pharmacology: Record<string, unknown> | null
  half_life: unknown
  half_life_status: string | null
  cyp: Record<string, unknown> | null
  // — die 60-Spalten-Tiefe (c9c741f), live erst nach dem Pipeline-Lauf —
  canonical_category?: string | null
  canonical_compound_type?: string | null
  canonical_routes?: string[] | null
  /** C-228: „was ist das ueberhaupt" und die Gruppe (Spalte `gruppe`). */
  description?: string | null
  gruppe?: string | null
  safety?: Record<string, unknown> | null
  interactions?: Record<string, unknown> | null
  regulatory?: Record<string, unknown> | null
  quality?: Record<string, unknown> | null
  warning_triggers?: Record<string, unknown> | null
  evidence_provenance?: Record<string, Herkunft> | null
  wada_status?: string | null
  /**
   * Der Satz zur WADA-Lage — G-184.
   *
   * `[cmd]` **Seit C-272 bei 320 von 320 gefuellt, vorher 0.** Er
   * beantwortet Toms Frage vom 2026-08-25 (*„gilt das auch fuer
   * bodybuilding?"*) mit den Ligen namentlich: NADOs, IPF, IFBB,
   * INBA/PNBA, WNBF, OCB, IFBB Professional League, NPC.
   *
   * `[read]` **Er wird ungekuerzt gezeigt.** Die Saetze tragen ihre
   * Quellen; wer sie strafft, loest die Belegkette.
   */
  wada_note?: string | null
  prescription_required?: boolean | null
  dose_ceiling_value?: number | null
  dose_ceiling_unit?: string | null
  missing_fields?: unknown[] | null
  missing_reason?: Record<string, unknown> | null
  last_verified?: string | null
  confidence?: number | null
  source_count?: number | null
  unii?: string | null
  pubchem_cid?: number | null
  chembl_id?: string | null
  inchikey?: string | null
  molecular_formula?: string | null
  molecular_weight?: number | null
  peptide_sequence?: string | null
}

/**
 * Die Nutzertexte einer Substanz (G-179, §9).
 *
 * `[read]` **Jedes Feld darf `null` sein, und das ist der Normalfall,
 * nicht die Ausnahme.** `[cmd]` Gemessen 2026-08-25: `zu_wenig_de` ist
 * bei **239 von 289** leer, weil die meisten Substanzen kein
 * Mangelbild haben. **Wo ein Feld leer ist, entfaellt der Abschnitt**
 * — die dritte Regel aus §9.
 */
export type Nutzertexte = {
  kurz_was: string | null
  wofuer: string[]
  wie_wirkt: string | null
  was_bringt_es: string | null
  zu_viel: string | null
  zu_wenig: string | null
  wann_wie: string | null
  wer_nicht: string[]
  mythen: string | null
  /** Nur bei Enhanced und Peptiden gefuellt (136 von 289). */
  irreversibel: string | null
  ueberwachung: string | null
  reinheit: string | null
  nicht_im_blut: string | null
  rechtslage_klartext: string | null
}

/** Eine Alltagsfrage aus `supplement_faq`. */
export type Frage = { frage: string; antwort: string }

/**
 * Eine Laborwirkung (G-186) — was der Stoff mit einem Messwert macht.
 *
 * `[cmd]` **222 Zeilen ueber 90 Substanzen**, alle im Katalog
 * (gemessen 2026-08-25). **Nur 156 davon sind verschieden** — Biotins
 * sieben sind drei; die Anzeige entdoppelt.
 *
 * `[read]` **Das ist die Ebene, die aus einem Katalog ein System
 * macht, das warnen kann.** Biotin taeuscht einen falsch-niedrigen
 * Troponinwert vor — *„Risk of MISSED myocardial infarction"*.
 */
export type Laborwirkung = {
  analyt: string
  richtung: string | null
  folge: string | null
}

/**
 * Eine Wechselwirkung (G-186).
 *
 * `[cmd]` **78 Zeilen ueber 78 Substanzen**, alle im Katalog.
 * `description_de` ist bei **0** gefuellt — gezeigt wird englisch.
 */
export type Wechselwirkung = {
  partner: string
  schwere: string | null
  beschreibung: string | null
}

export type CommunityMarken = {
  verbreitung: string | null
  vertrauen: string | null
  abgleich: string | null
  evidenz: string
  grenzen: string[]
}

export type CommunityNebenwirkung = CommunityMarken & {
  id: string
  effekt: string
  attribution: string | null
  onset: string | null
}

export type CommunityTradeoff = CommunityMarken & {
  id: string
  name: string
  tradeoff: string
}

export type CommunityMythos = CommunityMarken & {
  id: string
  mythos: string
  korrektur: string
}

export type CommunityQualitaet = CommunityMarken & {
  id: string
  signal: string
  anspruch: string | null
  studie: string | null
}

export type CommunityBegriff = {
  id: string
  begriff: string
  definition: string
  kontext: string | null
  grenzen: string[]
  evidenz: string
}

export type CommunityHinweise = {
  /**
   * G-199: die Evidenzklasse, sichtbar im Reiter.
   *
   * **Auftrag: *„`evidence_class` gehoert sichtbar hinein — dass es
   * Erfahrungsberichte sind und keine Studien, muss man sehen, ohne zu
   * suchen."*** `[cmd]` Bei allen 212 Zeilen `E`.
   */
  evidenzklasse: string
  nebenwirkungen: CommunityNebenwirkung[]
  tradeoffs: CommunityTradeoff[]
  mythen: CommunityMythos[]
  qualitaet: CommunityQualitaet[]
  begriffe: CommunityBegriff[]
}

/**
 * Ein Quellenverweis aus `supplement_user_texts.sources` (G-182).
 *
 * `[cmd]` **290 von 290 gefuellt** (C-264), Gestalt
 * `[{ref, fields, verified}]` — `ref` ist der Verweis als Fliesstext
 * (*„Pandit et al., Andrologia 2016 (RCT, 250 mg 2x/d, 90 d)"*),
 * `fields` nennt die Felder, die daraus stammen.
 *
 * `[read]` **`verified` wird mitgefuehrt und angezeigt.** Ein Verweis,
 * den niemand geprueft hat, ist etwas anderes als einer, der geprueft
 * ist — das zu verschweigen waere dieselbe Sorte Fehler wie eine Zahl
 * ohne Herkunft.
 */
export type Quelle = {
  ref: string
  felder: string[]
  geprueft: boolean
}

/**
 * Eine Unterform unter dem Sammeleintrag (§9, vierte Regel).
 *
 * `[cmd]` 29 Formen unter 15 Sammeleintraegen; Magnesium hat sieben.
 * Jede traegt ihren eigenen Evidenzgrad — der Sammeleintrag selbst
 * traegt **keinen** (gemessen 2026-08-25).
 */
export type Unterform = {
  id: string
  slug: string
  name: string
  hinweis: string | null
  grad: string | null
}

export type EigenerStack = { id: string; name: string; is_active: boolean }

// C-252: die Luecken stehen serverfrei in `substanz-luecken.ts` —
// `substanz-detail.tsx` ist ein Client und darf aus dieser Datei nur
// Typen importieren (A-30). Hier nur weitergereicht.
export { OHNE_QUELLE, type OhneQuelle } from './substanz-luecken'

/**
 * Die Liste fuer den Katalog.
 *
 * `[cmd]` **290 Eintraege, nicht 566** — `im_katalog` haelt die 276
 * Zeilen ohne Beschreibung und ohne Evidenzgrad draussen (C-243).
 * Gegengeprobt am 2026-08-23: ohne den Filter sind es 566.
 *
 * `[read]` **Kategorie und Gruppe kommen ueber die Fremdschluessel**,
 * nicht aus einer Textspalte — `supplement_categories` (23) und
 * `supplement_groups` (3) fuehren die Beschriftungen einmal, statt sie
 * je Zeile zu wiederholen.
 */
export async function ladeSubstanzListe(): Promise<SubstanzListenEintrag[]> {
  const s = createSessionClient().schema('supplements')
  const { data, error } = await s
    .from('supplements')
    .select(
      'id, slug, name_de, name_en, description_de, description_en, form,'
      + ' evidence_grade, source,'
      + ' supplement_categories(name_de, name_en),'
      + ' supplement_groups(code, label_de, label_en),'
      // G-181 Punkt 5: die Listenzeile liest `kurz_was_de`.
      // `[cmd]` **103 der 318 Zeilen trugen die Schablone** *„… ist
      // eine Supplement-Substanz mit eigener Beleglage und eigenen
      // Grenzen"* aus `description` (gemessen 2026-08-25), waehrend
      // `kurz_was_de` danebenlag — **290 Records, alle verschieden.**
      // G-186 Punkt 3: `wofuer_de` in die Liste, damit die Suche es
      // mitdurchsucht. `[cmd]` 318/318 als Array gefuellt.
      + ' supplement_user_texts(kurz_was_de, kurz_was_en,'
      + ' wofuer_de, wofuer_en)')
    .eq('im_katalog', true)
    .order('sort_order')
    .order('name_en')
  if (error) throw new Error(error.message)
  return (data ?? []).map(r => {
    const x = r as unknown as Record<string, unknown>
    const kat = (x.supplement_categories ?? null) as Record<string, unknown> | null
    const grp = (x.supplement_groups ?? null) as Record<string, unknown> | null
    return {
      id: String(x.id),
      slug: String(x.slug ?? ''),
      // `[read]` Der Name faellt nie weg: `name_en` ist bei allen 566
      // gefuellt (gemessen), `name_de` bei keinem.
      name: text(x.name_de, x.name_en) ?? String(x.slug ?? ''),
      domain: String(x.source ?? ''),
      compound_type: text(null, x.form),
      category: text(kat?.name_de, kat?.name_en),
      canonical_category: text(kat?.name_de, kat?.name_en),
      // G-181: erst `kurz_was_de`, dann der Rueckfall auf
      // `description`. `[cmd]` Der Rueckfall betrifft **28 von 318** —
      // die Sammelnamen, die keine eigene Nutzertextzeile haben
      // (`Ashwagandha (KSM-66)`, `Biotin`, `Caffeine` …).
      description: (() => {
        const u = ersteZeile(x.supplement_user_texts)
        return text(u?.kurz_was_de, u?.kurz_was_en)
          ?? text(x.description_de, x.description_en)
      })(),
      zwecke: (() => {
        const u = ersteZeile(x.supplement_user_texts)
        for (const k of ['wofuer_de', 'wofuer_en']) {
          const w = u?.[k]
          if (Array.isArray(w)) {
            const rein = w.map(e => String(e ?? '').trim()).filter(Boolean)
            if (rein.length) return rein
          }
        }
        return []
      })(),
      // `[read]` Die Gruppe wird als `code` gefuehrt, nicht als Label —
      // `filtereGruppe` vergleicht gegen `supplement`/`enhanced`/
      // `peptide`, und die Beschriftung ist Sache der Anzeige.
      gruppe: typeof grp?.code === 'string' ? grp.code : null,
      grad: typeof x.evidence_grade === 'string' && x.evidence_grade
        ? x.evidence_grade : null,
    }
  })
}

/**
 * Der Einzelsatz fuer das Detail — aus dem Kopfsatz und den
 * Detailtabellen zusammengesetzt.
 *
 * `[read]` **Die Form von `SubstanzSatz` bleibt, wie sie war.** Die
 * Anzeige (`substanz-anzeige.ts`) baut daraus ihre Bloecke und laesst
 * jedes leere Feld weg — sie muss dafuer nicht wissen, dass die Werte
 * jetzt aus zehn Tabellen statt aus einer Zeile kommen.
 *
 * `[cmd]` **Angenommen wird `id` (uuid) ODER `slug`** (die alte
 * `substance_catalog.id`). Beides, weil der Stack-Anker in `notes` den
 * Slug traegt und die alten IDs `text` sind.
 */
export async function ladeSubstanz(id: string): Promise<SubstanzSatz | null> {
  const s = createSessionClient().schema('supplements')
  const istUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
  const { data, error } = await s
    .from('supplements')
    .select(
      '*,'
      + ' supplement_categories(name_de, name_en),'
      + ' supplement_groups(code, label_de, label_en),'
      + ' supplement_dosing(*), supplement_pharmacology(*),'
      + ' supplement_safety(*), supplement_evidence(*),'
      + ' supplement_regulatory(*), supplement_quality(*),'
      + ' supplement_interactions(*), supplement_monitoring(*),'
      // G-186: die Laborwirkungen — 222 Zeilen ueber 90 Substanzen.
      + ' supplement_lab_effects(analyte_de, analyte_en, direction,'
      + ' clinical_consequence_de, clinical_consequence_en),'
      + ' supplement_identifiers(*), supplement_aliases(alias),'
      // C-107: WADA und die Warnschwellen. **Nicht `supplement_organ_risks`** —
      // 1.446 seiner 1.450 Zeilen sagen `unknown` (gemessen 2026-08-23),
      // das waeren fuenf Organzeilen „unbekannt" je Substanz.
      + ' supplement_wada(wada_status, wada_category, detection_time_days,'
      + ' note_de, note_en),'
      + ' supplement_warnings(dose_ceiling, doctor_consult_flags,'
      + ' no_ceiling_reason_de, no_ceiling_reason_en, warning_de, warning_en),'
      // G-179: die Nutzertexte — das, was §9 als Detail beschreibt.
      // `[read]` Bis hierher zeigte das Detail `description` aus dem
      // Kopfsatz, also den englischen Recherchesatz. Die deutschen
      // Nutzertexte lagen daneben und wurden **von niemandem gelesen**.
      + ' supplement_user_texts(kurz_was_de, kurz_was_en, wofuer_de, wofuer_en,'
      + ' wie_wirkt_de, wie_wirkt_en, was_bringt_es_de, was_bringt_es_en,'
      + ' zu_viel_de, zu_viel_en, zu_wenig_de, zu_wenig_en,'
      + ' wann_wie_de, wann_wie_en, wer_nicht_de, wer_nicht_en,'
      + ' mythen_de, mythen_en, irreversibel_de, irreversibel_en,'
      + ' ueberwachung_de, ueberwachung_en, reinheit_de, reinheit_en,'
      + ' nicht_im_blut_de, nicht_im_blut_en,'
      + ' rechtslage_klartext_de, rechtslage_klartext_en, sources),'
      + ' supplement_faq(frage_de, frage_en, antwort_de, antwort_en, sort_order),'
      // G-179, §9 vierte Regel: die Unterformen unter dem Sammelnamen.
      // `[cmd]` 29 Formen unter 15 Sammeleintraegen, alle mit
      // `form_note_de` und eigenem Grad — **heute unsichtbar** (C-244).
      // Der Selbstbezug laeuft ueber `supplements_parent_id_fkey`.
      + ' formen:supplements!parent_id('
      + ' id, slug, name_de, name_en, form, form_note_de, form_note_en,'
      + ' evidence_grade, sort_order, im_katalog),'
      + ' supplement_field_sources(field_name, source_id, as_of, evidence_class)')
    .eq(istUuid ? 'id' : 'slug', id)
    .maybeSingle()
  if (error) throw new Error(error.message)
  if (!data) return null
  const x = data as unknown as Record<string, unknown>

  const kat = (x.supplement_categories ?? null) as Record<string, unknown> | null
  const grp = (x.supplement_groups ?? null) as Record<string, unknown> | null
  const dos = ersteZeile(x.supplement_dosing)
  const pha = ersteZeile(x.supplement_pharmacology)
  const saf = ersteZeile(x.supplement_safety)
  const evi = ersteZeile(x.supplement_evidence)
  const reg = ersteZeile(x.supplement_regulatory)
  const qua = ersteZeile(x.supplement_quality)
  const wad = ersteZeile(x.supplement_wada)
  const wrn = ersteZeile(x.supplement_warnings)

  return {
    id: String(x.id),
    slug: String(x.slug ?? ''),
    texte: nutzertexte(x.supplement_user_texts),
    fragen: alleFragen(x.supplement_faq),
    quellen: alleQuellen(ersteZeile(x.supplement_user_texts)?.sources),
    wada_kategorie: text(null, wad?.wada_category),
    // G-184: `note_de` wurde seit jeher mitgelesen (Zeile 431), aber
    // nie hier durchgereicht — die Anzeige konnte sie gar nicht sehen.
    wada_note: text(wad?.note_de, wad?.note_en),
    laborwirkungen: alleLaborwirkungen(x.supplement_lab_effects),
    wechselwirkungen: alleWechselwirkungen(x.supplement_interactions),
    community: await ladeCommunityHinweise(String(x.slug ?? '')),
    formen: alleFormen(x.formen),
    canonical_name: text(x.name_de, x.name_en) ?? String(x.slug ?? ''),
    domain: String(x.source ?? ''),
    compound_type: text(null, x.form),
    category: text(kat?.name_de, kat?.name_en),
    subcategory: null,
    chemical_form: text(null, x.form),
    aliases: alleAliasse(x.supplement_aliases),
    cas_number: kennung(x.supplement_identifiers, 'cas'),
    external_ids: kennungen(x.supplement_identifiers),
    evidence: blockOhneMeta(evi),
    dosing: blockOhneMeta(dos),
    pharmacology: blockOhneMeta(pha),
    half_life: pha?.half_life ?? null,
    half_life_status: (pha?.status as string) ?? null,
    cyp: null,
    canonical_category: text(kat?.name_de, kat?.name_en),
    canonical_compound_type: text(null, x.form),
    canonical_routes: pha?.route ? [String(pha.route)] : null,
    description: text(x.description_de, x.description_en),
    gruppe: typeof grp?.code === 'string' ? grp.code : null,
    safety: blockOhneMeta(saf),
    interactions: alleZeilen(x.supplement_interactions),
    regulatory: blockOhneMeta(reg),
    quality: blockOhneMeta(qua),
    // C-107: die Warnschwellen.
    //
    // `[cmd]` **Gemessen 2026-08-23, und die Zeilenzahl taeuscht hier:**
    // `dose_ceiling` ist zwar bei allen 290 Zeilen `is not null` — aber
    // **258 davon tragen das JSON-Literal `null`. Echt gefuellt sind
    // 32.** Die uebrigen erklaeren sich ueber `no_ceiling_reason`
    // (258 englisch), und genau das gehoert angezeigt: **warum** es
    // keine Obergrenze gibt, statt einer leeren Zeile.
    //
    // `[cmd]` `doctor_consult_flags` echt gefuellt: **128 von 290**.
    // `warning_de`/`warning_en`: **0 von 290** — der Warntext fehlt
    // ganz. Er wandert trotzdem durch; `jsonNull` wirft die
    // `null`-Literale weg, und was spaeter gefuellt wird, erscheint
    // von selbst.
    warning_triggers: blockOhneMeta(jsonNull(wrn)),
    evidence_provenance: feldQuellen(x.supplement_field_sources),
    // C-107: WADA-Status. `[cmd]` Echter Inhalt, gemessen 2026-08-23:
    // 163 `not_prohibited` · 124 `prohibited` · 3 `monitored`.
    // `detection_time_days` ist bei 0 von 290 gesetzt und erscheint
    // deshalb nicht.
    wada_status: text(null, wad?.wada_status),
    prescription_required: (reg?.prescription_required as boolean) ?? null,
    dose_ceiling_value: null,
    dose_ceiling_unit: (dos?.dose_unit as string) ?? null,
    last_verified: null,
    unii: kennung(x.supplement_identifiers, 'unii'),
    chembl_id: kennung(x.supplement_identifiers, 'chembl'),
    inchikey: kennung(x.supplement_identifiers, 'inchikey'),
  } as SubstanzSatz
}

/**
 * Eine Zeile der Sicht `supplements.community_anzeige` (C-280).
 *
 * `[cmd]` **28 Spalten, flach** — nicht mehr `raw` als JSON. Die
 * Sicht traegt je Zeile nur die Felder ihrer Art; die uebrigen sind
 * `null`.
 */
type CommunityZeile = {
  anzeige_typ: string
  record_key: string
  evidence_class: string | null
  substance_ids: string[] | null
  side_effect: string | null
  community_attribution_note: string | null
  prevalence: string | null
  onset_context: string | null
  attribution_confidence: string | null
  community_consistency: string | null
  scientific_alignment: string | null
  limitations: string | null
  community_evidence_grade: string | null
  name: string | null
  expected_tradeoff: string | null
  quality_signal: string | null
  quality_claim: string | null
  independent_testing: string | null
  quality_sources: string | null
  term: string | null
  community_definition: string | null
  community_claim: string | null
  community_resolution: string | null
}

/**
 * Die Community-Hinweise einer Substanz — G-199.
 *
 * ══ WARUM DIESE FUNKTION NEU GESCHRIEBEN IST ═══════════════════════
 *
 * `[cmd]` **G-192 hat den Reiter gebaut, aber nie befuellt.** Sie las
 * `wissen.community_records` ueber einen Service-Role-Client — und
 * gab `null` zurueck, sobald PostgREST das Schema `wissen` nicht
 * kennt. **Genau das war der Fall**, also blieb der Reiter leer.
 *
 * `[cmd]` **Seit C-280 gibt es `supplements.community_anzeige`** —
 * 212 Zeilen, 28 Spalten, im Fachschema. `authenticated` hat SELECT,
 * **sie kommt ueber den normalen Sitzungsclient an.** Kein
 * Service-Role-Umweg, keine zweite Verbindung.
 *
 * ══ WAS ANKOMMT, GEMESSEN ══════════════════════════════════════════
 *
 * `[cmd]` **Gemessen 2026-08-26:** `substance_ids` traegt **Slugs**
 * (`sub_xxxx`), nicht UUIDs — 64 der 212 Zeilen sind gefuellt.
 * **Sie treffen 49 der 412 sichtbaren Substanzen.**
 *
 * `[cmd]` **Der Klassen-Rueckfall greift nicht:** `substance_class`
 * (37 Zeilen) benutzt ein eigenes Vokabular (`aas_19nor`, `sarms`,
 * `gh_igf`) — **0 Treffer** gegen `supplement_groups.code`, wo nur
 * `supplement`, `enhanced` und `peptide` stehen. **146 der 212 Zeilen
 * tragen weder Kennung noch Klasse.**
 *
 * `[read]` **Deshalb nur ueber `substance_ids`.** Eine Zuordnung ueber
 * eine Klasse, die es im Katalog nicht gibt, waere geraten.
 */
async function ladeCommunityHinweise(slug: string): Promise<CommunityHinweise | null> {
  if (!slug) return null
  const client = createSessionClient()
  const { data, error } = await client
    .schema('supplements')
    .from('community_anzeige')
    // `[read]` **Die vier Anleitungsfelder sind nicht in der Sicht**
    // — sie koennen gar nicht ankommen (C-280). Der Waechter aus
    // G-192 bleibt trotzdem stehen.
    .select('anzeige_typ, record_key, evidence_class, substance_ids,'
      + ' side_effect, community_attribution_note, prevalence, onset_context,'
      + ' attribution_confidence, community_consistency, scientific_alignment,'
      + ' limitations, community_evidence_grade,'
      + ' name, expected_tradeoff,'
      + ' quality_signal, quality_claim, independent_testing, quality_sources,'
      + ' term, community_definition,'
      + ' community_claim, community_resolution')
    .contains('substance_ids', [slug])
  if (error) throw new Error(error.message)

  const zeilen = (data ?? []) as unknown as CommunityZeile[]
  const je = (typ: string) => zeilen.filter(z => z.anzeige_typ === typ)

  const nebenwirkungen = je('nebenwirkung').map(nebenwirkung)
    .filter(Boolean) as CommunityNebenwirkung[]
  const tradeoffs = je('stack_tradeoff').map(tradeoff)
    .filter(Boolean) as CommunityTradeoff[]
  const mythen = je('mythos').map(mythos)
    .filter(Boolean) as CommunityMythos[]
  const qualitaet = je('produktqualitaet').map(qualitaetsSignal)
    .filter(Boolean) as CommunityQualitaet[]
  const begriffListe = je('begriff').map(begriff)
    .filter(Boolean) as CommunityBegriff[]

  // `[read]` **Begriffe allein tragen keinen Reiter.** Ein
  // Woerterbuch ohne Befund ist kein Erfahrungsbericht — dieselbe
  // Linie wie in G-192.
  if (nebenwirkungen.length + tradeoffs.length + mythen.length
      + qualitaet.length === 0) {
    return null
  }
  return {
    // `[cmd]` **`evidence_class` ist bei allen 212 Zeilen `E`.**
    evidenzklasse: text(null, zeilen[0]?.evidence_class) ?? 'E',
    nebenwirkungen: sortCommunity(nebenwirkungen),
    tradeoffs: sortCommunity(tradeoffs),
    mythen: sortCommunity(mythen),
    qualitaet: sortCommunity(qualitaet),
    begriffe: begriffListe.sort((a, b) => a.begriff.localeCompare(b.begriff, 'de')),
  }
}

/** `limitations` ist in der Sicht EIN Text, im Typ eine Liste. */
function alsListe(v: string | null): string[] {
  const t = text(null, v)
  return t ? [t] : []
}

function nebenwirkung(r: CommunityZeile): CommunityNebenwirkung | null {
  const effekt = text(null, r.side_effect)
  if (!effekt) return null
  return {
    id: r.record_key,
    effekt,
    attribution: text(null, r.community_attribution_note),
    onset: text(null, r.onset_context),
    ...marken(r),
  }
}

function tradeoff(r: CommunityZeile): CommunityTradeoff | null {
  const wert = text(null, r.expected_tradeoff)
  if (!wert) return null
  return {
    id: r.record_key,
    name: text(null, r.name) ?? 'Community-Kombination',
    tradeoff: wert,
    ...marken(r),
  }
}

function mythos(r: CommunityZeile): CommunityMythos | null {
  const beobachtung = text(null, r.community_claim)
  const korrektur = text(null, r.community_resolution)
  if (!beobachtung || !korrektur) return null
  return { id: r.record_key, mythos: beobachtung, korrektur, ...marken(r) }
}

function qualitaetsSignal(r: CommunityZeile): CommunityQualitaet | null {
  const signal = text(null, r.quality_signal)
  if (!signal) return null
  return {
    id: r.record_key,
    signal,
    anspruch: text(null, r.quality_claim),
    studie: text(null, r.independent_testing),
    ...marken(r),
  }
}

function begriff(r: CommunityZeile): CommunityBegriff | null {
  const term = text(null, r.term)
  const definition = text(null, r.community_definition)
  if (!term || !definition) return null
  return {
    id: r.record_key, begriff: term, definition,
    kontext: null, grenzen: alsListe(r.limitations),
    evidenz: text(null, r.evidence_class) ?? 'E',
  }
}

function marken(r: CommunityZeile): CommunityMarken {
  return {
    verbreitung: text(null, r.prevalence),
    vertrauen: text(null, r.attribution_confidence)
      ?? text(null, r.community_consistency)
      ?? text(null, r.community_evidence_grade),
    abgleich: text(null, r.scientific_alignment),
    evidenz: text(null, r.evidence_class) ?? 'E',
    grenzen: alsListe(r.limitations),
  }
}

function wissenService() {
  const env = envMitRootFallback()
  const url = env.NEXT_PUBLIC_SUPABASE_URL ?? env.SUPABASE_URL
  const key = env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createSupabaseClient(url, key, { auth: { persistSession: false } })
}

function envMitRootFallback(): Record<string, string | undefined> {
  const env: Record<string, string | undefined> = { ...process.env }
  if (env.SUPABASE_SERVICE_ROLE_KEY && (env.NEXT_PUBLIC_SUPABASE_URL || env.SUPABASE_URL)) {
    return env
  }
  for (const rel of ['.env', path.join('..', '..', '.env')]) {
    const datei = path.resolve(process.cwd(), rel)
    if (!fs.existsSync(datei)) continue
    for (const zeile of fs.readFileSync(datei, 'utf8').split(/\r?\n/)) {
      const rein = zeile.trim()
      if (!rein || rein.startsWith('#') || !rein.includes('=')) continue
      const [k, ...rest] = rein.split('=')
      if (!env[k]) env[k] = rest.join('=').trim().replace(/^['"]|['"]$/g, '')
    }
  }
  return env
}

function sortCommunity<T extends CommunityMarken>(items: T[]): T[] {
  const rang = new Map([
    ['WIDESPREAD', 0],
    ['COMMON', 1],
    ['RECURRING', 2],
    ['OCCASIONAL', 3],
    ['RARE', 4],
  ])
  return [...items].sort((a, b) => (rang.get(a.verbreitung ?? '') ?? 9)
    - (rang.get(b.verbreitung ?? '') ?? 9))
}

function arrayText(v: unknown): string[] {
  return Array.isArray(v)
    ? v.map(e => String(e ?? '').trim()).filter(Boolean)
    : []
}

/**
 * Die Nutzertexte, mit Sprachrueckfall je Feld (G-179).
 *
 * `[read]` **Der Rueckfall gilt hier fuer jedes Feld, nicht nur den
 * Namen** — die Regel aus C-254. `[cmd]` Bei den Nutzertexten ist
 * heute Deutsch gefuellt und Englisch leer; die Richtung kann sich
 * drehen, sobald uebersetzt wird.
 *
 * `[read]` **Leere Zeichenketten werden zu `null`.** Die Anzeige
 * fragt nur „ist da was" — sie soll nicht zwischen `''` und `null`
 * unterscheiden muessen, sonst entsteht ein leerer Abschnitt.
 */
function nutzertexte(v: unknown): Nutzertexte | null {
  const z = ersteZeile(v)
  if (!z) return null
  const t = (de: string, en: string) => text(z[de], z[en])
  const liste = (de: string, en: string): string[] => {
    for (const k of [de, en]) {
      const w = z[k]
      if (Array.isArray(w)) {
        const rein = w.map(e => String(e ?? '').trim()).filter(Boolean)
        if (rein.length) return rein
      }
    }
    return []
  }
  return {
    kurz_was: t('kurz_was_de', 'kurz_was_en'),
    wofuer: liste('wofuer_de', 'wofuer_en'),
    wie_wirkt: t('wie_wirkt_de', 'wie_wirkt_en'),
    was_bringt_es: t('was_bringt_es_de', 'was_bringt_es_en'),
    zu_viel: t('zu_viel_de', 'zu_viel_en'),
    zu_wenig: t('zu_wenig_de', 'zu_wenig_en'),
    wann_wie: t('wann_wie_de', 'wann_wie_en'),
    wer_nicht: liste('wer_nicht_de', 'wer_nicht_en'),
    mythen: t('mythen_de', 'mythen_en'),
    irreversibel: t('irreversibel_de', 'irreversibel_en'),
    ueberwachung: t('ueberwachung_de', 'ueberwachung_en'),
    reinheit: t('reinheit_de', 'reinheit_en'),
    nicht_im_blut: t('nicht_im_blut_de', 'nicht_im_blut_en'),
    rechtslage_klartext: t('rechtslage_klartext_de', 'rechtslage_klartext_en'),
  }
}

/**
 * Die Quellenverweise aus `sources` (G-182, Punkt 4).
 *
 * `[cmd]` Gestalt `[{ref, fields, verified}]`, **290 von 290
 * gefuellt** (gemessen 2026-08-25).
 *
 * `[read]` **`Record:`- und `Batch-Record:`-Verweise bleiben drin.**
 * Sie sind duerftig — *„Record: description, dosing.…"* nennt nur, aus
 * welchem Datensatzfeld etwas stammt —, aber sie wegzulassen hiesse,
 * eine bessere Quellenlage vorzutaeuschen, als es gibt.
 */
function alleQuellen(v: unknown): Quelle[] {
  if (!Array.isArray(v)) return []
  return v
    .map(z => z as Record<string, unknown>)
    .map(z => ({
      ref: typeof z.ref === 'string' ? z.ref.trim() : '',
      felder: Array.isArray(z.fields)
        ? z.fields.map(f => String(f ?? '').trim()).filter(Boolean) : [],
      geprueft: z.verified === true,
    }))
    .filter(q => q.ref.length > 0)
}

/**
 * Die Laborwirkungen — entdoppelt (G-186).
 *
 * `[cmd]` **222 Zeilen sind nur 156 verschiedene** (gemessen
 * 2026-08-25): `Vitamin B7 (biotin)` traegt sieben, davon drei
 * verschiedene. **Ohne Entdoppelung stuende dieselbe Warnung
 * dreimal.**
 *
 * `[read]` **Deutsch ist bei 0 von 222 gefuellt** — `analyte_de` und
 * `clinical_consequence_de` sind leer, `*_en` bei allen. Der Rueckfall
 * aus C-254 greift, gezeigt wird englisch.
 */
function alleLaborwirkungen(v: unknown): Laborwirkung[] {
  if (!Array.isArray(v)) return []
  const gesehen = new Set<string>()
  const aus: Laborwirkung[] = []
  for (const z of v) {
    const r = z as Record<string, unknown>
    const analyt = text(r.analyte_de, r.analyte_en)
    if (!analyt) continue
    const folge = text(r.clinical_consequence_de, r.clinical_consequence_en)
    const richtung = typeof r.direction === 'string' && r.direction.trim()
      ? r.direction.trim() : null
    const schluessel = `${analyt}|${richtung ?? ''}|${folge ?? ''}`
    if (gesehen.has(schluessel)) continue
    gesehen.add(schluessel)
    aus.push({ analyt, richtung, folge })
  }
  return aus
}

/**
 * Die Wechselwirkungen (G-186).
 *
 * `[cmd]` 78 Zeilen, `partner_label` und `severity` bei allen gefuellt,
 * `description_de` bei **0** — englisch mit Rueckfall.
 */
function alleWechselwirkungen(v: unknown): Wechselwirkung[] {
  if (!Array.isArray(v)) return []
  const gesehen = new Set<string>()
  const aus: Wechselwirkung[] = []
  for (const z of v) {
    const r = z as Record<string, unknown>
    const partner = typeof r.partner_label === 'string' && r.partner_label.trim()
      ? r.partner_label.trim() : null
    if (!partner) continue
    const beschreibung = text(r.description_de, r.description_en)
    const schluessel = `${partner}|${beschreibung ?? ''}`
    if (gesehen.has(schluessel)) continue
    gesehen.add(schluessel)
    aus.push({
      partner,
      schwere: typeof r.severity === 'string' && r.severity.trim()
        ? r.severity.trim() : null,
      beschreibung,
    })
  }
  return aus
}

/** Die Alltagsfragen, nach `sort_order`. */
function alleFragen(v: unknown): Frage[] {
  if (!Array.isArray(v)) return []
  return v
    .map(z => z as Record<string, unknown>)
    .map(z => ({
      frage: text(z.frage_de, z.frage_en) ?? '',
      antwort: text(z.antwort_de, z.antwort_en) ?? '',
      sort: typeof z.sort_order === 'number' ? z.sort_order : 0,
    }))
    .filter(f => f.frage && f.antwort)
    .sort((a, b) => a.sort - b.sort)
    .map(({ frage, antwort }) => ({ frage, antwort }))
}

/**
 * Die Unterformen eines Sammeleintrags (§9, vierte Regel).
 *
 * `[read]` **Nur Formen, die selbst im Katalog stehen.** Eine Form
 * hinter `im_katalog = false` waere sonst ueber den Sammeleintrag
 * doch sichtbar — und die Sichtbarkeitsregel aus C-243 umgangen.
 */
function alleFormen(v: unknown): Unterform[] {
  if (!Array.isArray(v)) return []
  return v
    .map(z => z as Record<string, unknown>)
    .filter(z => z.im_katalog === true)
    .map(z => ({
      id: String(z.id),
      slug: String(z.slug ?? ''),
      name: text(z.name_de, z.name_en) ?? String(z.slug ?? ''),
      hinweis: text(z.form_note_de, z.form_note_en),
      grad: typeof z.evidence_grade === 'string' && z.evidence_grade
        ? z.evidence_grade : null,
      sort: typeof z.sort_order === 'number' ? z.sort_order : 0,
    }))
    .sort((a, b) => a.sort - b.sort || a.name.localeCompare(b.name, 'de'))
    .map(({ sort: _sort, ...rest }) => rest)
}

/** Eine eingebettete 1:n-Beziehung, von der genau eine Zeile zaehlt. */
function ersteZeile(v: unknown): Record<string, unknown> | null {
  if (Array.isArray(v)) return (v[0] as Record<string, unknown>) ?? null
  return (v as Record<string, unknown>) ?? null
}

/**
 * Ein Detailblock ohne seine Verwaltungsspalten.
 *
 * `[read]` `id`, `supplement_id` und die Zeitstempel gehoeren zur
 * Tabelle, nicht zur Substanz — sie wuerden sonst als Anzeigefelder
 * auftauchen. Leere Werte laesst die Anzeige ohnehin weg.
 */
function blockOhneMeta(z: Record<string, unknown> | null): Record<string, unknown> | null {
  if (!z) return null
  const weg = new Set(['id', 'supplement_id', 'created_at', 'updated_at', 'source', 'status'])
  const aus: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(z)) {
    if (weg.has(k) || v === null || v === '') continue
    aus[k] = v
  }
  return Object.keys(aus).length ? aus : null
}

/**
 * Mehrere Zeilen einer 1:n-Beziehung als Block.
 *
 * `[cmd]` **G-177: die Zeilen heissen nach ihrem Gegenueber, nicht
 * „1", „2", „3".** Vorher riss der Wechselwirkungs-Block als *„1"* an
 * — das ist die Zeilennummer, nicht ihre Aussage. Bei Creatine steht
 * in `partner_label` *„caffeine interaction debated (likely
 * minimal)"*; das gehoert dorthin.
 */
function alleZeilen(v: unknown): Record<string, unknown> | null {
  if (!Array.isArray(v) || v.length === 0) return null
  const aus: Record<string, unknown> = {}
  v.forEach((z, i) => {
    const roh = z as Record<string, unknown>
    const rein = blockOhneMeta(roh)
    if (!rein) return
    const benennung = ['partner_label', 'organ', 'jurisdiction', 'lab_marker_id']
      .map(k => roh[k])
      .find(w => typeof w === 'string' && w.trim())
    const schluessel = typeof benennung === 'string' && benennung.trim()
      ? benennung.trim()
      : `${i + 1}`
    aus[aus[schluessel] ? `${schluessel} (${i + 1})` : schluessel] = rein
  })
  return Object.keys(aus).length ? aus : null
}

function alleAliasse(v: unknown): string[] {
  if (!Array.isArray(v)) return []
  return v.map(z => String((z as Record<string, unknown>).alias ?? '')).filter(Boolean)
}

function kennung(v: unknown, art: string): string | null {
  if (!Array.isArray(v)) return null
  const t = v.find(z => String((z as Record<string, unknown>).identifier_type ?? '')
    .toLowerCase() === art)
  const w = t ? (t as Record<string, unknown>).identifier_value : null
  return typeof w === 'string' && w ? w : null
}

function kennungen(v: unknown): Record<string, unknown> | null {
  if (!Array.isArray(v) || v.length === 0) return null
  const aus: Record<string, unknown> = {}
  for (const z of v) {
    const r = z as Record<string, unknown>
    const k = String(r.identifier_type ?? '')
    if (k && r.identifier_value) aus[k] = r.identifier_value
  }
  return Object.keys(aus).length ? aus : null
}

/**
 * Die Herkunftsvermerke, umgelegt auf die Form, die
 * `substanz-anzeige.ts` erwartet: Feldpfad -> Herkunft.
 *
 * `[cmd]` `supplement_field_sources` deckt 286 der 290 (2026-08-23).
 * `[read]` Ohne `source_id` gilt ein Vermerk nicht — dieselbe Regel
 * wie in `herkunftFuer` (C-229).
 */
function feldQuellen(v: unknown): Record<string, Herkunft> | null {
  if (!Array.isArray(v) || v.length === 0) return null
  const aus: Record<string, Herkunft> = {}
  for (const z of v) {
    const r = z as Record<string, unknown>
    const feld = String(r.field_name ?? '')
    if (!feld || !r.source_id) continue
    aus[feld] = {
      source_id: String(r.source_id),
      evidence_class: String(r.evidence_class ?? ''),
      as_of: String(r.as_of ?? ''),
    }
  }
  return Object.keys(aus).length ? aus : null
}

/**
 * Die eigenen Stacks — fuer die Zuteilung „zu gewaehltem Stack".
 * `[cmd]` Die Zeilenrechte begrenzen auf `user_id = auth.uid()`.
 */
export async function ladeEigeneStacks(): Promise<EigenerStack[]> {
  const client = createSessionClient()
  const { data: { user } } = await client.auth.getUser()
  if (!user) return []
  const { data, error } = await client.schema('supplements')
    .from('user_stacks')
    .select('id, name, is_active')
    .order('is_active', { ascending: false })
  if (error) return []
  return (data ?? []).map(r => {
    const x = r as unknown as Record<string, unknown>
    return {
      id: String(x.id),
      name: String(x.name),
      is_active: x.is_active === true,
    }
  })
}
