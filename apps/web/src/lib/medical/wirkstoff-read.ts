// Lese-I/O fuer den Wirkstoffkatalog — G-208.
//
// ══ WAS SEIT DEM 2026-08-27 DASTEHT ═════════════════════════════════
//
// `[cmd]` **Gemessen 2026-08-27 gegen die laufende Instanz, und die
// Zahlen des Auftrags stimmen alle:**
//
//     medical.medication_active_substances       498
//     medical.medication_user_texts              498   (alle 498)
//     medical.medication_faq                   2.313   (alle 498, 3-6 je)
//     medical.medication_reproductive_evidence   498
//
// **Es gab keine Seite, die davon etwas zeigt.** Diese Datei ist der
// Leseweg dorthin.
//
// ══ EIGENE DATEI, NICHT IN `lesen.ts` ═══════════════════════════════
//
// `[read]` **`lesen.ts` ist der Lesepfad fuer die Befunde der
// angemeldeten Nutzerin** — Werte, Marker, Symptome, alles
// nutzergebunden. **Der Wirkstoffkatalog ist es nicht:** er ist fuer
// alle gleich, `authenticated` hat SELECT, und die Zeilenrechte
// begrenzen nichts. Zwei Zustaendigkeiten, zwei Dateien.
//
// ══ WARUM DIE LISTE MIT DER SEITE KOMMT UND DAS DETAIL NICHT ════════
//
// `[cmd]` **Gemessen 2026-08-27:**
//
//     Listenzeile (id, Name, ATC, kurz_was_de)      83 kB fuer 498
//     alle deutschen Nutzertexte                 1.145 kB
//     alle FAQ-Antworten                           700 kB
//
// `[read]` **83 kB kommen mit der Seite, 1,8 MB nicht.** Dasselbe
// Muster wie im Substanzkatalog (C-224): die Liste serverseitig, das
// Detail ueber `/api/medical/wirkstoff` je aufgeklappter Zeile. **Der
// Unterschied ist hier groesser als dort** — die Medikamententexte
// sind laenger als die Supplement-Texte.
//
// Laeuft ausschliesslich serverseitig.
import { createSessionClient } from '@lumeos/shared/session'

import {
  feld, textFeld, grundAus, atcCodes, type Feld,
} from './wirkstoff-luecke'
// G-210: Handelsnamen. `[read]` **Nur der Typ und die reine
// Rechnung** — die Datei ist serverfrei, damit die Anzeige sie als
// Wert importieren darf (A-30, in G-208 am Build gelernt).
import {
  markenJeWirkstoff, type Marke, type ProduktZeile,
} from './wirkstoff-marke'

/** Eine Zeile der Katalogliste. */
export type WirkstoffZeile = {
  id: string
  name: string
  /** Die ATC-Codes, schon aus der JSON-Zeichenkette geholt. */
  atc: string[]
  /** Der Einzeiler aus `kurz_was_de` — bei allen 498 gefuellt. */
  kurz: string | null
  /**
   * Wofuer der Stoff eingesetzt wird — fuer die Suche.
   *
   * `[cmd]` **2 bis 4 Eintraege je Wirkstoff, bei allen 498 gefuellt.**
   * `[read]` **Wie bei G-186 kein Filter, sondern Suchtext:** es sind
   * Indikationen in Alltagssprache (*„Bluthochdruck"*,
   * *„Nachbehandlung nach Herzinfarkt"*), keine Schlagworte aus einer
   * gepflegten Liste.
   */
  wofuer: string[]
  /**
   * Die Handelsnamen dieses Wirkstoffs — G-210.
   *
   * ══ DER ANLASS ════════════════════════════════════════════════════
   *
   * **Tom hat nach *Scemblix* gesucht und nichts gefunden.** `[cmd]`
   * Scemblix steht zweimal in `medication_products`, beide Zeilen
   * sauber auf `Asciminib` verknuepft — **die Suche aus G-208 sah nur
   * `medication_active_substances`.**
   *
   * `[cmd]` **Gemessen 2026-08-27: 448 Produkte, 428 verschiedene
   * Marken, 380 der 498 Wirkstoffe haben mindestens eine** (die
   * uebrigen 118 keine; 380 + 118 = 498, die Rechnung geht auf).
   *
   * `[read]` **Leer heisst hier NICHT „gibt es nicht"** — es heisst,
   * dass der Bestand fuer diesen Wirkstoff keinen Handelsnamen fuehrt.
   * Der Unterschied ist derselbe wie in G-208 zwischen *begruendet
   * leer* und *nicht bearbeitet*.
   */
  marken: Marke[]
}

/** Ein Frage-Antwort-Paar aus `medication_faq`. */
export type WirkstoffFrage = { frage: string; antwort: string }

/** Der volle Satz eines Wirkstoffs. */
export type WirkstoffSatz = {
  id: string
  name: string
  atc: string[]
  /** Die Felder je Reiter — jedes mit seinem Zustand (G-208). */
  ueberblickFelder: Feld[]
  einnahmeFelder: Feld[]
  sicherheitFelder: Feld[]
  /** Freitext, der keine Kachel ist. */
  kurz: string | null
  wofuer: string[]
  wieWirkt: string | null
  wasBringtEs: string | null
  wannWie: string | null
  werNicht: string[]
  wechselwirkung: string | null
  recht: string | null
  mythen: string[]
  /** Der Grund, wenn es keine Mythen gibt (`null_context`). */
  mythenGrund: string | null
  /** Die Vorsichtsmassnahmen als Liste — leer heisst nicht „keine". */
  vorsicht: string[]
  vorsichtGrund: string | null
  gegenanzeigen: string[]
  /** Die Risikomarker, die auf `true` stehen. */
  risiken: string[]
  schwangerschaft: SchwangerschaftsLage | null
  fragen: WirkstoffFrage[]
  /** Die Quellenverweise des Wirkstoffs. */
  quellen: string[]
}

/**
 * Was zu Schwangerschaft, Stillzeit und Fruchtbarkeit vorliegt.
 *
 * `[cmd]` **Gemessen 2026-08-27:** `pregnancy` leer bei **147** von
 * 498, `lactation` bei 147, `fertility` bei 143. **`missing_*` ist bei
 * 496 bzw. 438 gesetzt** — auch hier traegt der Bestand die
 * Begruendung selbst, in Codes wie `NOT_REPORTED_IN_LABEL`.
 */
export type SchwangerschaftsLage = {
  /** `KNOWN_RISK`, `NO_HUMAN_DATA` … — der Zustand aus `state`. */
  schwangerschaftStand: string | null
  schwangerschaftText: string | null
  stillzeitStand: string | null
  stillzeitText: string | null
  fruchtbarkeitStand: string | null
  fruchtbarkeitText: string | null
  /** Die Felder, die das Etikett nicht berichtet — als Zahl. */
  nichtBerichtet: number
}

function medicalDb() {
  return createSessionClient().schema('medical')
}

function txt(v: unknown): string | null {
  return typeof v === 'string' && v.trim() ? v.trim() : null
}

function liste(v: unknown): string[] {
  if (!Array.isArray(v)) return []
  return v.map(e => String(e ?? '').trim()).filter(Boolean)
}

/**
 * Die Katalogliste.
 *
 * `[read]` **Kein Sichtbarkeitsfilter wie `im_katalog` bei den
 * Supplements** — `[cmd]` dort halten 276 leere Zeilen den Katalog
 * sauber (C-243). **Hier tragen alle 498 sowohl Text als auch FAQ**,
 * gemessen 2026-08-27. Es gibt nichts auszublenden, und ein Filter
 * ohne Wirkung waere eine Behauptung ueber die Daten, die nicht gilt.
 */
export async function ladeWirkstoffListe(): Promise<WirkstoffZeile[]> {
  const db = medicalDb()
  // ══ G-210: die Marken kommen mit ═══════════════════════════════════
  //
  // `[cmd]` **Vier Abfragen statt zwei, alle nebeneinander** — die
  // Lehre aus G-190: sequenzielle `await` summieren sich, und
  // `tools/ladekette-pruefen.mjs` zaehlt sie.
  //
  // `[cmd]` **Der Zuwachs ist klein:** alle Marken und Hersteller
  // zusammen wiegen **16 kB** gegen 83 kB Listenzeilen (gemessen
  // 2026-08-27). Sie kommen deshalb mit der Seite, nicht per Route.
  //
  // `[read]` **Zwei Abfragen statt eines Joins**, weil PostgREST die
  // Kette `products → formulations → substances` nur ueber
  // eingebettete Ressourcen laufen liesse und die Richtung hier
  // umgekehrt ist. **Der Join passiert unten, in JavaScript, ueber
  // zwei Maps** — bei 448 und 453 Zeilen ist das billiger als eine
  // verschachtelte Auswahl.
  const [stoffe, texte, formen, produkte] = await Promise.all([
    db.from('medication_active_substances')
      .select('id, canonical_name, atc_code')
      .order('canonical_name'),
    db.from('medication_user_texts')
      .select('active_substance_id, kurz_was_de, wofuer_de'),
    db.from('medication_formulations')
      .select('id, active_substance_id'),
    db.from('medication_products')
      .select('formulation_id, brand_name, manufacturer, jurisdictions'),
  ])
  const fehler = stoffe.error?.message ?? texte.error?.message
    ?? formen.error?.message ?? produkte.error?.message
  if (fehler) throw new Error(fehler)

  const textNachId = new Map<string, Record<string, unknown>>()
  for (const r of (texte.data ?? []) as unknown as Array<Record<string, unknown>>) {
    const id = txt(r.active_substance_id)
    if (id) textNachId.set(id, r)
  }

  // `[cmd]` **453 Formulierungen, alle mit `active_substance_id`** —
  // gemessen 2026-08-27, keine einzige ohne. **10 tragen kein
  // Produkt**; sie erscheinen hier einfach nicht.
  const wirkstoffJeForm = new Map<string, string>()
  for (const r of (formen.data ?? []) as unknown as Array<Record<string, unknown>>) {
    const fid = txt(r.id)
    const sid = txt(r.active_substance_id)
    if (fid && sid) wirkstoffJeForm.set(fid, sid)
  }

  // ══ DIE AUFLOESUNG — UND WO SIE ABBRICHT ═══════════════════════════
  //
  // `[cmd]` **Gemessen 2026-08-27: alle 448 Produkte loesen sauber
  // auf, 0 unaufloesbar.** `formulation_id` ist `NOT NULL` und traegt
  // den Fremdschluessel `medication_products_formulation_id_fkey`.
  // **Der Auftrag vermutete Bruchstellen — die Datenbank laesst sie
  // nicht zu.**
  //
  // `[read]` **Die Regel steht in `wirkstoff-marke.ts`, nicht hier** —
  // dort ist sie ohne Datenbank pruefbar, und genau das war noetig:
  // **der Fall laesst sich am laufenden System nicht herstellen**
  // (beide Eingriffe wurden abgewiesen), am Datentyp dagegen schon.
  const { marken: markenJeWirkstoffId, unaufloesbar } = markenJeWirkstoff(
    (produkte.data ?? []) as unknown as ProduktZeile[],
    wirkstoffJeForm,
  )
  // `[read]` **Was nicht aufgeloest werden konnte, verschwindet nicht
  // still** — dieselbe Linie wie `befunde` in `symptome.ts` (G-207).
  // `[cmd]` Heute ist die Liste leer; waere sie es nicht, stuende es
  // im Serverprotokoll statt nirgends.
  if (unaufloesbar.length > 0) {
    console.warn('[wirkstoff-read] G-210: %d Produkte ohne aufloesbaren '
      + 'Wirkstoff, uebergangen: %o', unaufloesbar.length, unaufloesbar)
  }

  return ((stoffe.data ?? []) as unknown as Array<Record<string, unknown>>)
    .map(r => {
      const id = String(r.id ?? '')
      const u = textNachId.get(id)
      return {
        id,
        name: txt(r.canonical_name) ?? id,
        atc: atcCodes(r.atc_code),
        kurz: txt(u?.kurz_was_de),
        wofuer: liste(u?.wofuer_de),
        marken: markenJeWirkstoffId.get(id) ?? [],
      }
    })
    .filter(z => z.id)
}

/**
 * Ein Wirkstoff mit allem, was die Tafel zeigt.
 *
 * `[read]` **Vier Tabellen in einem `Promise.all`** — die Lehre aus
 * G-190: sequenzielle `await` summieren sich, und `tools/
 * ladekette-pruefen.mjs` zaehlt sie inzwischen. Sie haengen nicht
 * voneinander ab, also laufen sie nebeneinander.
 */
export async function ladeWirkstoff(id: string): Promise<WirkstoffSatz | null> {
  const db = medicalDb()
  const [stoff, text, faq, repro] = await Promise.all([
    db.from('medication_active_substances')
      .select('id, canonical_name, atc_code, cas_number, pharmacology,'
        + ' precautions, contraindications, risk_flags, sources,'
        + ' evidence_provenance')
      .eq('id', id).maybeSingle(),
    db.from('medication_user_texts')
      .select('active_substance_id, kurz_was_de, wofuer_de, wie_wirkt_de,'
        + ' was_bringt_es_de, zu_viel_de, zu_wenig_de, wann_wie_de,'
        + ' wer_nicht_de, mythen_de, verschreibungspflicht_klartext_de,'
        + ' absetzen_de, wechselwirkung_alltag_de, null_context')
      .eq('active_substance_id', id).maybeSingle(),
    db.from('medication_faq')
      .select('frage_de, antwort_de, sort_order')
      .eq('active_substance_id', id).order('sort_order'),
    db.from('medication_reproductive_evidence')
      .select('pregnancy, lactation, fertility,'
        + ' missing_pregnancy_lactation, missing_fertility_sex')
      .eq('active_substance_id', id).maybeSingle(),
  ])

  const fehler = stoff.error?.message ?? text.error?.message
    ?? faq.error?.message ?? repro.error?.message
  if (fehler) throw new Error(fehler)
  if (!stoff.data) return null

  const s = stoff.data as unknown as Record<string, unknown>
  const u = (text.data ?? null) as unknown as Record<string, unknown> | null
  const prov = s.evidence_provenance
  const nk = u?.null_context

  // ══ DIE KACHELN, UND WARUM SIE IHRE BEGRUENDUNG MITBRINGEN ═══════
  //
  // `[read]` **Jede Kachel bekommt den Ort, an dem ihre Begruendung
  // steht** — nicht `null`. Ohne das faellt sie auf „nicht
  // bearbeitet", und genau das ist die Luege, gegen die G-208
  // gebaut ist: 9 Mischpraeparate saehen aus wie 9 Luecken.
  const cas = feld('cas', 'CAS-Nummer', s.cas_number,
    grundAus(prov, 'c292_identifiers'))
  const atcListe = atcCodes(s.atc_code)
  const atc = feld('atc', 'ATC-Code', atcListe.join(' · '), null)
  const pharma = (s.pharmacology ?? null) as Record<string, unknown> | null
  const mechanismus = feld('mechanismus', 'Wirkmechanismus',
    pharma?.mechanism_of_action,
    grundAus(prov, 'c292_mechanism_of_action'))

  const ueberblickFelder = [cas, atc, mechanismus]

  const einnahmeFelder = [
    textFeld('wann_wie', 'Wann und wie', u?.wann_wie_de, nk, 'wann_wie_de'),
    textFeld('absetzen', 'Absetzen', u?.absetzen_de, nk, 'absetzen_de'),
  ]

  // `[cmd]` **`precautions` ist die Kachel, an der sich der ganze
  // Auftrag entscheidet:** 105 leer, **davon 4 begruendet, 101
  // nicht.** Alle anderen Felder sind entweder vollstaendig begruendet
  // oder vollstaendig gefuellt.
  const vorsichtListe = liste(s.precautions)
  const vorsichtGrund = grundAus(prov, 'c292_precautions')
  const sicherheitFelder = [
    feld('vorsicht', 'Vorsichtsmassnahmen',
      vorsichtListe.length ? String(vorsichtListe.length) : null, vorsichtGrund),
    textFeld('zu_viel', 'Bei zu viel', u?.zu_viel_de, nk, 'zu_viel_de'),
    textFeld('zu_wenig', 'Bei zu wenig', u?.zu_wenig_de, nk, 'zu_wenig_de'),
  ]

  return {
    id: String(s.id ?? id),
    name: txt(s.canonical_name) ?? String(s.id ?? id),
    atc: atcListe,
    ueberblickFelder,
    einnahmeFelder,
    sicherheitFelder,
    kurz: txt(u?.kurz_was_de),
    wofuer: liste(u?.wofuer_de),
    wieWirkt: txt(u?.wie_wirkt_de),
    wasBringtEs: txt(u?.was_bringt_es_de),
    wannWie: txt(u?.wann_wie_de),
    werNicht: liste(u?.wer_nicht_de),
    wechselwirkung: txt(u?.wechselwirkung_alltag_de),
    recht: txt(u?.verschreibungspflicht_klartext_de),
    mythen: mythenAus(u?.mythen_de),
    mythenGrund: nullGrund(nk, 'mythen_de'),
    vorsicht: vorsichtListe,
    vorsichtGrund,
    gegenanzeigen: liste(s.contraindications),
    risiken: risikenAus(s.risk_flags),
    schwangerschaft: schwangerschaftAus(repro.data),
    fragen: fragenAus(faq.data),
    quellen: quellenAus(s.sources),
  }
}

/**
 * Die Mythen — und die Falle, die dabei sichtbar wurde.
 *
 * `[cmd]` **`mythen_de` ist `jsonb` mit DREI Gestalten, gemessen
 * 2026-08-27:**
 *
 *     Zeichenkette   260   ein Fliesstext mit mehreren Mythen darin
 *     Array          123   120 mit einem Eintrag, 3 mit zweien
 *     null           115   mit `null_context`-Begruendung
 *
 * `[read]` **Wer nur `Array.isArray` prueft, verliert 260 von 383.**
 * Wer nur `String(v)` nimmt, zeigt bei 123 das Literal
 * `["Mythos: …"]`. **Beides ist dieselbe Sorte Fehler wie G-191** —
 * ein technisch gefuelltes Feld, das als Unsinn ankommt.
 */
function mythenAus(v: unknown): string[] {
  if (v === null || v === undefined) return []
  if (Array.isArray(v)) return liste(v)
  if (typeof v === 'string') {
    const t = v.trim()
    return t ? [t] : []
  }
  return []
}

function nullGrund(nk: unknown, feldName: string): string | null {
  if (!nk || typeof nk !== 'object') return null
  const b = (nk as Record<string, unknown>)[feldName]
  if (!b || typeof b !== 'object') return null
  const s = (b as Record<string, unknown>).reason_status
  return typeof s === 'string' && s.trim() ? s.trim() : null
}

/**
 * Die Risikomarker, die auf `true` stehen.
 *
 * `[cmd]` **`risk_flags` ist bei allen 498 ein Objekt mit neun
 * Booleschen**, gemessen 2026-08-27: `bleeding_risk` 196,
 * `myelosuppression_risk` 170, `nephrotoxicity_risk` 149,
 * `hepatotoxicity_risk` 135, `seizure_risk` 123, `hypoglycemia_risk`
 * 95, `QT_risk` 60, `hyperkalemia_risk` 45, `serotonergic_risk` 40.
 *
 * `[read]` **Nur `true` wird gezeigt.** Ein `false` heisst hier
 * *„geprueft, trifft nicht zu"* — neun Zeilen davon je Wirkstoff
 * waeren Rauschen, und die Zahl der geprueften steht als eine Zeile
 * darunter (dieselbe Linie wie *„geprueft, ohne Befund"* in G-186).
 */
function risikenAus(v: unknown): string[] {
  if (!v || typeof v !== 'object') return []
  return Object.entries(v as Record<string, unknown>)
    .filter(([, w]) => w === true)
    .map(([k]) => k)
    .sort()
}

// `[cmd]` **`risikoLabel` stand bis zum Build hier und ist nach
// `wirkstoff-luecke.ts` umgezogen.** Der Grund ist A-30, und er trat
// beim ersten Bauversuch ein: `wirkstoff-tafel.tsx` ist
// `'use client'` und importierte die Funktion als WERT — damit zog
// sie diese Datei mit, und mit ihr `createSessionClient` und
// `next/headers`.
//
//     Import trace for requested module:
//     ../../packages/shared/src/supabase/session.ts
//     ./src/lib/medical/wirkstoff-read.ts
//     ./src/app/v2/medical/wirkstoff-tafel.tsx
//
// `[read]` **Die Typen waren nie das Problem** — `import type` wird
// beim Uebersetzen entfernt. **Ein einziger Wert-Import genuegt**,
// und genau davor warnt der Dateikopf von `substanz-luecken.ts`
// (C-252). Er stand da; die Falle wurde trotzdem gebaut.

/**
 * Schwangerschaft, Stillzeit, Fruchtbarkeit.
 *
 * `[read]` **`state` ist das, was der Nutzer zuerst braucht** —
 * `KNOWN_RISK` gegen `NO_HUMAN_DATA` ist der Unterschied zwischen
 * *„es ist bekannt gefaehrlich"* und *„niemand weiss es"*. **Das ist
 * dieselbe Unterscheidung wie im ganzen Auftrag**, nur an einer
 * Stelle, an der sie besonders zaehlt.
 */
function schwangerschaftAus(v: unknown): SchwangerschaftsLage | null {
  if (!v || typeof v !== 'object') return null
  const r = v as Record<string, unknown>
  const teil = (k: string): [string | null, string | null] => {
    const b = r[k]
    if (!b || typeof b !== 'object') return [null, null]
    const o = b as Record<string, unknown>
    const stand = txt(o.state)
    const felder = (o.fields ?? null) as Record<string, unknown> | null
    const summary = (felder?.risk_summary ?? null) as Record<string, unknown> | null
    return [stand, txt(summary?.value)]
  }
  const [ps, pt] = teil('pregnancy')
  const [ls, lt] = teil('lactation')
  const [fs, ft] = teil('fertility')
  const fehlend = (k: string): number => {
    const b = r[k]
    return b && typeof b === 'object' ? Object.keys(b as object).length : 0
  }
  if (!ps && !pt && !ls && !lt && !fs && !ft) return null
  return {
    schwangerschaftStand: ps, schwangerschaftText: pt,
    stillzeitStand: ls, stillzeitText: lt,
    fruchtbarkeitStand: fs, fruchtbarkeitText: ft,
    nichtBerichtet: fehlend('missing_pregnancy_lactation')
      + fehlend('missing_fertility_sex'),
  }
}

/** Die Alltagsfragen, nach `sort_order`. */
function fragenAus(v: unknown): WirkstoffFrage[] {
  if (!Array.isArray(v)) return []
  return v
    .map(z => z as Record<string, unknown>)
    .map(z => ({ frage: txt(z.frage_de) ?? '', antwort: txt(z.antwort_de) ?? '' }))
    .filter(f => f.frage && f.antwort)
}

/**
 * Die Quellenverweise.
 *
 * `[cmd]` **Bei allen 498 ein Array**, gemessen 2026-08-27. Die
 * Eintraege sind teils Objekte mit `url`, teils Zeichenketten.
 */
function quellenAus(v: unknown): string[] {
  if (!Array.isArray(v)) return []
  const aus: string[] = []
  for (const e of v) {
    if (typeof e === 'string' && e.trim()) { aus.push(e.trim()); continue }
    if (e && typeof e === 'object') {
      const o = e as Record<string, unknown>
      const s = txt(o.url) ?? txt(o.ref) ?? txt(o.source)
      if (s) aus.push(s)
    }
  }
  return Array.from(new Set(aus))
}
