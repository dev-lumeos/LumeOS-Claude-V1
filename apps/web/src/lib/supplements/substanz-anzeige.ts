// Die Aufbereitung des Substanz-Details (C-224) — serverfrei und rein,
// damit der Waechtertest sie direkt prueft.
//
// **DIE ZWEI REGELN, die diese Woche mehrfach verletzt wurden:**
//
// 1. `[read]` **Kein Wert ohne Herkunft.** `evidence_provenance`
//    traegt je Feldpfad source_id, evidence_class und as_of — jedes
//    Feld, das hier durchlaeuft, bekommt seinen Vermerk angehaengt.
//    Findet sich keiner (weder der exakte Pfad noch der Block), traegt
//    das Feld `herkunft: null` und die Anzeige kennzeichnet es. Der
//    Waechter zaehlt diese Faelle.
//
// 2. `[read]` **Wo nichts steht, steht nichts.** Leere Arrays, leere
//    Strings, null — das Feld erscheint gar nicht. Kein Platzhalter,
//    keine Null, kein Strich, der wie ein Messwert aussieht. Wo
//    `missing_reason` einen Grund nennt, wird der GRUND gezeigt.
//
// Werte werden roh durchgereicht — nicht umgerechnet, nicht
// normalisiert. `dose_ceiling` ist Freitext mit Rechtsraum (C-223).
import type { Herkunft, SubstanzSatz } from './substanz-read'

export type Feld = {
  /** Der Pfad im Satz, z. B. `safety.contraindications`. */
  pfad: string
  label: string
  /** Anzeigezeilen, roh. Nie leer — leere Felder entstehen nicht. */
  zeilen: string[]
  herkunft: Herkunft | null
}

export type Block = { titel: string; felder: Feld[] }

/** Ein Wert, wie er dasteht — als Anzeigezeilen. */
function zeilenVon(v: unknown): string[] {
  if (v === null || v === undefined) return []
  if (typeof v === 'string') return v.trim() ? [v] : []
  if (typeof v === 'number' || typeof v === 'boolean') return [String(v)]
  if (Array.isArray(v)) return v.flatMap(zeilenVon)
  if (typeof v === 'object') {
    const aus: string[] = []
    for (const [k, w] of Object.entries(v as Record<string, unknown>)) {
      const teil = zeilenVon(w)
      if (teil.length === 1) aus.push(`${beschrifte(k)}: ${teil[0]}`)
      else for (const z of teil) aus.push(`${beschrifte(k)}: ${z}`)
    }
    return aus
  }
  return []
}

function beschrifte(schluessel: string): string {
  return schluessel.replace(/_/g, ' ')
}

/**
 * Der Herkunftsvermerk zu einem Pfad.
 *
 * `[cmd]` Die Registry fuehrt teils Feldpfade
 * (`external_ids.PubChem_CID`), teils ganze Bloecke (`pharmacology`) —
 * gesucht wird erst exakt, dann am Block.
 */
export function herkunftFuer(
  prov: Record<string, Herkunft> | null | undefined,
  pfad: string,
): Herkunft | null {
  if (!prov) return null
  const treffer = prov[pfad] ?? prov[pfad.split('.')[0]]
  if (!treffer || typeof treffer !== 'object') return null
  const h = treffer as unknown as Record<string, unknown>
  // `[read]` NUR `source_id` gilt als Herkunft (Nachtrag C-229,
  // 2026-08-23): die kurzlebige Duldung von `source_ref`/`crawl` ist
  // zurueckgebaut. `[cmd]` Der Preis, gemessen am 2026-08-23: 216 von
  // 2.147 Provenance-Eintraegen tragen nur source_ref und zeigen
  // damit „ohne Herkunft" — das ist die Wahrheit des Datenstands,
  // gemeldet an Codex.
  if (!h.source_id) return null
  return {
    source_id: String(h.source_id),
    evidence_class: String(h.evidence_class ?? ''),
    as_of: String(h.as_of ?? ''),
  }
}

function block(
  satz: SubstanzSatz,
  titel: string,
  quelle: Record<string, unknown> | null | undefined,
  pfadPraefix: string,
): Block | null {
  if (!quelle || typeof quelle !== 'object') return null
  const prov = satz.evidence_provenance ?? null
  const felder: Feld[] = []
  for (const [k, v] of Object.entries(quelle)) {
    const zeilen = zeilenVon(v)
    if (zeilen.length === 0) continue
    const pfad = `${pfadPraefix}.${k}`
    felder.push({ pfad, label: beschrifte(k), zeilen, herkunft: herkunftFuer(prov, pfad) })
  }
  return felder.length ? { titel, felder } : null
}

/** Skalare Spalten als Zusatzfelder eines Blocks. */
function feld(
  satz: SubstanzSatz, pfad: string, label: string, wert: unknown,
): Feld | null {
  const zeilen = zeilenVon(wert)
  if (zeilen.length === 0) return null
  return {
    pfad, label, zeilen,
    herkunft: herkunftFuer(satz.evidence_provenance ?? null, pfad),
  }
}

/**
 * Alle Bloecke der Detailansicht, in der Ordnung des Auftrags.
 * Bloecke ohne ein einziges gefuelltes Feld entstehen nicht.
 */
export function baueBloecke(satz: SubstanzSatz): Block[] {
  const bloecke: Array<Block | null> = [
    block(satz, 'Sicherheit', satz.safety, 'safety'),
    block(satz, 'Wechselwirkungen', satz.interactions, 'interactions'),
    (() => {
      const b = block(satz, 'Rechtslage', satz.regulatory, 'regulatory')
        ?? { titel: 'Rechtslage', felder: [] }
      // Die Spalten neben dem jsonb — nur wenn nicht schon im Block.
      if (!b.felder.some(f => f.pfad.endsWith('wada_status'))) {
        const f = feld(satz, 'regulatory.wada_status', 'WADA-Status', satz.wada_status)
        if (f) b.felder.push(f)
      }
      if (!b.felder.some(f => f.pfad.endsWith('prescription_required'))) {
        const f = feld(satz, 'regulatory.prescription_required',
          'Verschreibungspflicht', satz.prescription_required)
        if (f) b.felder.push(f)
      }
      return b.felder.length ? b : null
    })(),
    block(satz, 'Pharmakokinetik', satz.pharmacology, 'pharmacology'),
    block(satz, 'Qualität', satz.quality, 'quality'),
    (() => {
      const b = block(satz, 'Warnschwellen', satz.warning_triggers, 'warning_triggers')
        ?? { titel: 'Warnschwellen', felder: [] }
      // dose_ceiling_value/-unit sind Freitext mit Rechtsraum — roh.
      const f = feld(satz, 'warning_triggers.dose_ceiling', 'dose ceiling',
        satz.dose_ceiling_value != null
          ? `${satz.dose_ceiling_value} ${satz.dose_ceiling_unit ?? ''}`.trim()
          : null)
      if (f && !b.felder.some(x => x.pfad.includes('dose_ceiling'))) b.felder.push(f)
      return b.felder.length ? b : null
    })(),
    (() => {
      const b = block(satz, 'Kennungen', satz.external_ids, 'external_ids')
        ?? { titel: 'Kennungen', felder: [] }
      for (const [pfad, label, wert] of [
        ['external_ids.UNII', 'UNII', satz.unii],
        ['external_ids.PubChem_CID', 'PubChem CID', satz.pubchem_cid],
        ['external_ids.ChEMBL_ID', 'ChEMBL', satz.chembl_id],
        ['external_ids.InChIKey', 'InChIKey', satz.inchikey],
        ['external_ids.molecular_formula', 'Summenformel', satz.molecular_formula],
        ['cas_number', 'CAS', satz.cas_number],
      ] as Array<[string, string, unknown]>) {
        if (b.felder.some(f => f.pfad === pfad)) continue
        const f = feld(satz, pfad, label, wert)
        if (f) b.felder.push(f)
      }
      return b.felder.length ? b : null
    })(),
    block(satz, 'Evidenz', satz.evidence, 'evidence'),
  ]
  return bloecke.filter((b): b is Block => b !== null)
}

/**
 * Die Felder, die einen Wert zeigen, aber keinen Herkunftsvermerk
 * tragen — der Waechter haelt diese Liste bei Substanzen mit
 * gefuellter Registry auf null.
 */
export function ohneHerkunft(bloecke: Block[]): string[] {
  return bloecke.flatMap(b => b.felder.filter(f => !f.herkunft).map(f => f.pfad))
}

/**
 * C-229: die Startsicht des Details — ALLE Bloecke zu.
 *
 * `[read]` Tom: „das sind zusatzinfos die keiner sehen muss wenn er
 * es nicht explizit will." Der Waechter haelt diese Menge leer; wer
 * einen Block aufgeklappt starten lassen will, muss hier vorbei.
 */
export function startOffen(): Set<string> {
  return new Set()
}

/** Die benannten Luecken — `missing_reason` je Feld, wie es dasteht. */
export function benannteLuecken(satz: SubstanzSatz): Array<{ feld: string; grund: string }> {
  const mr = satz.missing_reason
  if (!mr || typeof mr !== 'object') return []
  return Object.entries(mr)
    .filter(([, g]) => typeof g === 'string' && g)
    .map(([feldName, grund]) => ({ feld: beschrifte(feldName), grund: String(grund) }))
}
