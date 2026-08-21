// Die Naehrstoffordnung aus `nutrition.nutrient_defs` (G-101, C-54),
// seit G-121 mit den Werten der langen Form (C-157), seit G-122 mit
// dem echten Baum aus `parent_code` (C-161) und der gespeicherten
// Ansicht (`public.user_display_preferences`).
//
// **DIE HIERARCHIE KOMMT AUS `parent_code`, NICHT MEHR AUS DER
// STUFE.** `[cmd]` C-161: 40 Wurzeln, 98 Kinder, maximal 4 Ebenen
// tief. `display_tier` bleibt Anzeigeprioritaet — der fruehere
// Zwei-Pass-Bau aus Stufe und Sortierung ist ersetzt, weil er riet,
// was die Tabelle jetzt weiss (164-naehrstoffbaum.md: „Die Anzeige
// darf nicht mehr aus Stufe und Sortierung ableiten").
//
// **DIE GRUPPEN FOLGEN DER WURZEL:** `[cmd]` 28 Kinder tragen ein
// anderes `group_de` als ihr Elternknoten — die kompletten Aeste
// Fettsaeuren (36), Aminosaeuren (19), Kohlenhydrate (11),
// Ballaststoffe (6), Organische Saeuren (5) und Zuckeralkohole (3)
// haengen unter Makronaehrstoff-Wurzeln. Sechs der zwoelf Gruppen
// haben deshalb KEINE Wurzel. Eine Karte je Gruppe mit lokal
// abgeschnittenen Baeumen wuerde denselben Ast zerreissen; die Karten
// folgen darum der Gruppe der Wurzel (6 Karten), der Baum darunter
// der echten Elternbeziehung — wie im Mockup, wo die Gruppen aus den
// Top-Level-Eintraegen kommen.
//
// **WOHER DIE WERTE KOMMEN (G-121):** `nutrition.nutrient_summary_
// window(user, stichtag, tage)` — `p_days = 1` ist die Tagessumme.
// Fenster > 1 zeigt den Schnitt je protokolliertem Tag.
//
// **WOHER ZIEL UND OBERGRENZE KOMMEN:** `daily_reference_assessment`
// — die persoenliche Auswahl trifft die Datenbank. `[cmd]` Seit C-161
// liefert sie alle 138 Codes (154 Zeilen, 45 mit Prozentwert).
//
// **DIE GESPEICHERTE ANSICHT** (G-122, Tom: „danach wird die letzte
// Sicht gespeichert fuer den User") liegt in
// `public.user_display_preferences` unter `nutrition.nutrient_tree` —
// in der Datenbank, nicht im Browser: wer am Rechner eine Gruppe
// oeffnet, findet sie am Telefon offen. Ohne Zeile gilt „alles zu".
//
// Laeuft ausschliesslich serverseitig.
import { createSessionClient } from '@lumeos/shared/session'

import { getReferenceAssessment } from './reference-assessment-read'
import {
  ANSICHT_SCHLUESSEL, KARTEN_REIHENFOLGE, karteFuerWurzel, normalisiere,
  pruefeAnsicht, type GespeicherteAnsicht,
} from './naehrstoff-anzeige'

function zahl(v: unknown): number | null {
  if (v === null || v === undefined) return null
  const n = typeof v === 'string' ? Number(v) : v
  return typeof n === 'number' && Number.isFinite(n) ? n : null
}

function text(v: unknown): string | null {
  return typeof v === 'string' && v.length > 0 ? v : null
}

/** Aussage ueber eine ZAHL gegen ihre Referenz — kein Urteil ueber die
 *  Person. `null` heisst: kein Wert oder keine Referenz. */
export type NaehrstoffStatus = 'unter' | 'im' | 'ueber'

export type NaehrstoffKnoten = {
  code: string
  name: string
  einheit: string | null
  stufe: number
  sort: number
  /** Der Elterncode aus `parent_code` (C-161); `null` = Wurzel. */
  eltern: string | null
  /** `group_de` des Eintrags selbst (Karten folgen der Wurzel). */
  gruppe: string
  /** Normalisierte Suchfelder (G-127), getrennt nach Naehe: Name+Code
   *  fuer kurze Anfragen („EPA"), die Erklaertexte und Quellen erst ab
   *  vier Zeichen („Skorbut", „Lachs") — Regel in `trifftSuche`. */
  suchName: string
  suchText: string
  /** Der gezeigte Wert: Tag = Summe, Fenster = Schnitt je
   *  protokolliertem Tag. */
  wert: number | null
  /** Die Summe ueber das Fenster (beim Tag gleich `wert`). */
  summe: number | null
  /** Positionen im Fenster, die diesen Naehrstoff betrafen. */
  positionen: number
  /** Davon mit Wert / ohne Wert — „188 g aus 11 von 14 Positionen". */
  positionenMitWert: number
  positionenOhneWert: number
  /** Tage im Fenster mit Protokoll / davon vollstaendig fuer diesen
   *  Naehrstoff. */
  tageErfasst: number
  tageVollstaendig: number
  /** Ziel aus der persoenlichen Referenzauswahl (`target`-Zeile). */
  ziel: number | null
  zielMax: number | null
  zielArt: string | null
  /** Obergrenze (`upper_limit`-Zeile), falls gefuehrt. */
  obergrenze: number | null
  /** wert / ziel in Prozent, falls beides da ist. */
  prozent: number | null
  status: NaehrstoffStatus | null
  kinder: NaehrstoffKnoten[]
}

export type NaehrstoffGruppe = {
  name: string
  /** Alle Eintraege der Gruppe, auch die verschachtelten. */
  anzahl: number
  /** Wieviele davon einen Wert haben. */
  mitWert: number
  knoten: NaehrstoffKnoten[]
}

export type NaehrstoffOrdnung = {
  gruppen: NaehrstoffGruppe[]
  gesamt: number
  /** Wieviele Naehrstoffe im Fenster einen Wert tragen. */
  messbar: number
  /** Wieviele eine Referenz tragen, und wie die Zahlen dazu stehen. */
  mitReferenz: number
  unterZiel: number
  ueberObergrenze: number
  /** Das gewaehlte Fenster in Tagen (1 = der Stichtag selbst). */
  fenster: number
  stichtag: string
  /** Tage mit Protokoll im Fenster (Maximum ueber alle Zeilen). */
  tageErfasst: number
  /** Die gespeicherte Ansicht des Nutzers — `null` heisst: noch nie
   *  gespeichert, es gilt „alles zu". */
  gespeichert: GespeicherteAnsicht | null
  fehler: string | null
}

function zaehle(k: NaehrstoffKnoten): number {
  return 1 + k.kinder.reduce((s, x) => s + zaehle(x), 0)
}
function zaehleMitWert(k: NaehrstoffKnoten): number {
  return (k.wert !== null ? 1 : 0) + k.kinder.reduce((s, x) => s + zaehleMitWert(x), 0)
}

/**
 * Baut aus der flachen Liste den Wald ueber `eltern` (C-161).
 *
 * `[read]` Kein Raten mehr aus Stufe und Reihenfolge: jeder Knoten
 * haengt an seinem `parent_code`. Ein Eintrag, dessen Elternteil nicht
 * in der Liste steht, wird Wurzel — defensiv, die Fremdschluessel
 * schliessen den Fall eigentlich aus. Geschwister stehen nach
 * `sort_index`.
 */
export function baueWald(flach: NaehrstoffKnoten[]): NaehrstoffKnoten[] {
  const proCode = new Map<string, NaehrstoffKnoten>()
  for (const k of flach) proCode.set(k.code, k)

  const wurzeln: NaehrstoffKnoten[] = []
  for (const k of flach) {
    const eltern = k.eltern ? proCode.get(k.eltern) : undefined
    if (eltern && eltern !== k) eltern.kinder.push(k)
    else wurzeln.push(k)
  }

  const sortiere = (liste: NaehrstoffKnoten[]) => {
    liste.sort((a, b) => a.sort - b.sort)
    for (const k of liste) sortiere(k.kinder)
  }
  sortiere(wurzeln)
  return wurzeln
}

/** Eine Zeile der Fensterfunktion, aufs Noetige reduziert. */
type FensterZeile = {
  logged_day_count: number
  complete_day_count: number
  item_count: number
  value_count: number
  missing_count: number
  total_value: number | null
  avg_per_logged_day: number | null
}

/**
 * @param fensterWunsch Das Fenster aus der Adresse; `null` heisst
 *   „kein Parameter" — dann gilt das gespeicherte, sonst der Tag.
 */
export async function ladeOrdnung(
  stichtag: string, fensterWunsch: number | null = null,
): Promise<NaehrstoffOrdnung> {
  const leer: NaehrstoffOrdnung = {
    gruppen: [], gesamt: 0, messbar: 0, mitReferenz: 0, unterZiel: 0,
    ueberObergrenze: 0, fenster: fensterWunsch ?? 1, stichtag,
    tageErfasst: 0, gespeichert: null, fehler: null,
  }
  try {
    const client = createSessionClient()
    const db = client.schema('nutrition')

    const { data: { user } } = await client.auth.getUser()
    if (!user) return { ...leer, fehler: 'Keine Sitzung' }

    // Erst die gespeicherte Ansicht — sie entscheidet das Fenster,
    // wenn die Adresse keines nennt. Ein PK-Zugriff, RLS-geschuetzt.
    let gespeichert: GespeicherteAnsicht | null = null
    try {
      const { data } = await client
        .from('user_display_preferences')
        .select('value')
        .eq('preference_key', ANSICHT_SCHLUESSEL)
        .maybeSingle()
      gespeichert = pruefeAnsicht((data as { value?: unknown } | null)?.value)
    } catch {
      gespeichert = null
    }
    const fenster = fensterWunsch ?? gespeichert?.fenster ?? 1

    // Die Gliederung kommt aus `nutrient_defs` — die Fensterfunktion
    // liefert nur Zeilen, wenn der Nutzer im Fenster protokolliert
    // hat, und ein leerer Tab waere die falsche Antwort auf einen
    // leeren Tag: die Ordnung existiert auch ohne Werte.
    const [defsR, fensterR, refsR, texteR] = await Promise.allSettled([
      db.from('nutrient_defs')
        .select('code, name_de, unit, group_de, display_tier, sort_index, parent_code')
        .order('sort_index', { ascending: true }),
      db.rpc('nutrient_summary_window', {
        p_user_id: user.id, p_end_date: stichtag, p_days: fenster,
      }),
      getReferenceAssessment(stichtag),
      // G-127: die Erklaertexte fuettern die Suche — „Skorbut" soll
      // Vitamin C finden, „Lachs" Omega-3. `[cmd]` 110 Zeilen,
      // 33.697 Zeichen insgesamt — kein Alias-Schema noetig.
      db.from('nutrient_details')
        .select('nutrient_code, function_de, deficiency_de, excess_de, '
          + 'detail_de, tip_de, top_sources_de'),
    ])

    if (defsR.status !== 'fulfilled' || defsR.value.error) {
      return {
        ...leer, fenster, gespeichert,
        fehler: defsR.status === 'fulfilled'
          ? defsR.value.error?.message ?? 'unbekannt'
          : 'Naehrstoffliste nicht gelesen',
      }
    }

    const defs = (defsR.value.data ?? []) as unknown as Array<Record<string, unknown>>

    const werte = new Map<string, FensterZeile>()
    if (fensterR.status === 'fulfilled' && !fensterR.value.error) {
      for (const r of (fensterR.value.data ?? []) as unknown as Array<Record<string, unknown>>) {
        const code = text(r.nutrient_code)
        if (!code) continue
        werte.set(code, {
          logged_day_count: zahl(r.logged_day_count) ?? 0,
          complete_day_count: zahl(r.complete_day_count) ?? 0,
          item_count: zahl(r.item_count) ?? 0,
          value_count: zahl(r.value_count) ?? 0,
          missing_count: zahl(r.missing_count) ?? 0,
          total_value: zahl(r.total_value),
          avg_per_logged_day: zahl(r.avg_per_logged_day),
        })
      }
    }

    // Je Code die Ziel- und die Obergrenzen-Zeile der persoenlichen
    // Auswahl. Mehrere Zeilen je Code sind normal (target + UL).
    const ziele = new Map<string, { min: number | null; max: number | null; art: string | null }>()
    const grenzen = new Map<string, number>()
    if (refsR.status === 'fulfilled') {
      for (const r of refsR.value) {
        if (r.reference_direction === 'target' && !ziele.has(r.nutrient_code)) {
          ziele.set(r.nutrient_code, {
            min: r.reference_value_min, max: r.reference_value_max,
            art: r.reference_kind,
          })
        }
        if (r.reference_direction === 'upper_limit' && r.reference_value_min !== null
          && !grenzen.has(r.nutrient_code)) {
          grenzen.set(r.nutrient_code, r.reference_value_min)
        }
      }
    }

    const texte = new Map<string, string>()
    if (texteR.status === 'fulfilled' && !texteR.value.error) {
      for (const r of (texteR.value.data ?? []) as unknown as Array<Record<string, unknown>>) {
        const code = text(r.nutrient_code)
        if (!code) continue
        const quellen = Array.isArray(r.top_sources_de)
          ? r.top_sources_de.filter((x): x is string => typeof x === 'string').join(' ')
          : ''
        texte.set(code, [
          r.function_de, r.deficiency_de, r.excess_de, r.detail_de,
          r.tip_de, quellen,
        ].filter((x): x is string => typeof x === 'string' && x.length > 0).join(' '))
      }
    }

    const flach: NaehrstoffKnoten[] = []
    let messbar = 0
    let mitReferenz = 0
    let unterZiel = 0
    let ueberObergrenze = 0
    let tageErfasst = 0
    for (const d of defs) {
      const code = text(d.code)
      const gruppe = text(d.group_de)
      if (!code || !gruppe) continue

      const z = werte.get(code)
      const wert = z === undefined ? null
        : fenster === 1 ? z.total_value : z.avg_per_logged_day
      if (wert !== null) messbar += 1
      if (z) tageErfasst = Math.max(tageErfasst, z.logged_day_count)

      const ziel = ziele.get(code) ?? null
      const obergrenze = grenzen.get(code) ?? null
      if (ziel || obergrenze !== null) mitReferenz += 1

      // Aussage ueber die Zahl: unter dem Ziel, ueber der Obergrenze,
      // sonst im Bereich — nur wo Wert UND Referenz existieren.
      let status: NaehrstoffStatus | null = null
      if (wert !== null && (ziel?.min != null || obergrenze !== null)) {
        if (obergrenze !== null && wert > obergrenze) status = 'ueber'
        else if (ziel?.min != null && wert < ziel.min) status = 'unter'
        else status = 'im'
      }
      if (status === 'unter') unterZiel += 1
      if (status === 'ueber') ueberObergrenze += 1

      flach.push({
        code,
        name: text(d.name_de) ?? code,
        einheit: text(d.unit),
        stufe: zahl(d.display_tier) ?? 1,
        sort: zahl(d.sort_index) ?? 0,
        eltern: text(d.parent_code),
        gruppe,
        suchName: normalisiere(`${code} ${text(d.name_de) ?? ''}`),
        suchText: normalisiere(texte.get(code) ?? ''),
        wert,
        summe: z?.total_value ?? null,
        positionen: z?.item_count ?? 0,
        positionenMitWert: z?.value_count ?? 0,
        positionenOhneWert: z?.missing_count ?? 0,
        tageErfasst: z?.logged_day_count ?? 0,
        tageVollstaendig: z?.complete_day_count ?? 0,
        ziel: ziel?.min ?? null,
        zielMax: ziel?.max != null && ziel.max !== ziel.min ? ziel.max : null,
        zielArt: ziel?.art ?? null,
        obergrenze,
        prozent: wert !== null && ziel?.min != null && ziel.min > 0
          ? (wert / ziel.min) * 100 : null,
        status,
        kinder: [],
      })
    }

    // Der Wald aus `parent_code`; die Karten kommen aus
    // `karteFuerWurzel` — seit G-129/GO-22 acht in fester
    // Reihenfolge: die drei Makro-Aeste (Kohlenhydrate, Fette,
    // Protein) tragen eigene Karten, die Aeste bleiben ganz.
    const proGruppe = new Map<string, NaehrstoffKnoten[]>()
    for (const w of baueWald(flach)) {
      const karte = karteFuerWurzel(w.code, w.gruppe)
      const liste = proGruppe.get(karte)
      if (liste) liste.push(w)
      else proGruppe.set(karte, [w])
    }

    const gruppen: NaehrstoffGruppe[] = []
    for (const name of Array.from(proGruppe.keys())) {
      const knoten = proGruppe.get(name) ?? []
      gruppen.push({
        name,
        anzahl: knoten.reduce((s, k) => s + zaehle(k), 0),
        mitWert: knoten.reduce((s, k) => s + zaehleMitWert(k), 0),
        knoten,
      })
    }
    const rang = (name: string): number => {
      const i = (KARTEN_REIHENFOLGE as readonly string[]).indexOf(name)
      return i === -1 ? KARTEN_REIHENFOLGE.length : i
    }
    gruppen.sort((a, b) => rang(a.name) - rang(b.name))

    return {
      gruppen, gesamt: defs.length, messbar, mitReferenz, unterZiel,
      ueberObergrenze, fenster, stichtag, tageErfasst, gespeichert,
      fehler: null,
    }
  } catch (e) {
    return { ...leer, fehler: e instanceof Error ? e.message : String(e) }
  }
}
