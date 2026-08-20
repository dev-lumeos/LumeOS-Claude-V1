// Lesepfad fuer den Interactions-Tab und das Extended-Gate (G-110).
//
// **DAS REGELWERK LIEGT IN DER DATENBANK** (C-133):
// `supplements.rule_catalog` mit 64 Regeln und
// `supplements.rule_assessment(user_id, entry_date)` mit drei
// Zustaenden. `[read]` Hier wird nichts nachgerechnet und nichts
// bewertet — nur geholt und geordnet.
//
// **DIE GRENZE, DIE HIER BESONDERS GILT** (C-108, F-02):
// *„Nennen ja, bewerten nein."* Eine kuratierte Zeile zeigen, wenn
// beide Seiten im Stack sind. **Kein Score, keine Blockade, keine
// Zeitplan-Urteile.** Der einzige Effekt bei Risikoregeln ist
// `physician_referral` — und der steht als Wort da, nicht als Handlung.
//
// Laeuft ausschliesslich serverseitig.
import { createSessionClient } from '@lumeos/shared/session'

function text(v: unknown): string | null {
  return typeof v === 'string' && v.length > 0 ? v : null
}

function liste(v: unknown): string[] {
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : []
}

/** Die drei Zustaende, die `rule_assessment` kennt. */
export type Regelzustand = 'fulfilled' | 'not_fulfilled' | 'missing_input'

export type Regel = {
  rule_id: string
  /** `warning`, `medication` oder `nutrient_gap`. */
  rule_type: string | null
  /** Feiner: `interaction`, `safety`, `lab_interference` … */
  rule_kind: string | null
  message: string | null
  severity: string | null
  /** `physician_referral`, `information`, `lab_context` … */
  aktion: string | null
  zustand: Regelzustand
  /**
   * Die Datenpfade, die fehlen. **Nur bei `missing_input` gefuellt.**
   *
   * `[read]` Das ist der Kern von C-132: eine Regel, die auf fehlende
   * Daten trifft, **faellt nicht stumm durch** — sie sagt, was fehlt.
   */
  fehlt: string[]
  /** Was die Regel im Stack gefunden hat — nur bei `fulfilled` interessant. */
  kontext: Record<string, unknown> | null
}

export type RegelStand = {
  regeln: Regel[]
  /** Zaehler je Zustand, fuer die Kopfzeile. */
  erfuellt: number
  nichtErfuellt: number
  fehlend: number
  /** Wieviele Regeln der Katalog fuehrt — die Bezugsgroesse. */
  katalog: number
  fehler: string | null
}

const LEER: RegelStand = {
  regeln: [], erfuellt: 0, nichtErfuellt: 0, fehlend: 0, katalog: 0, fehler: null,
}

/**
 * Die Regeln des Tages, mit ihrer Art aus dem Katalog.
 *
 * `[cmd]` `rule_assessment` gibt `rule_type`, aber **nicht**
 * `rule_kind` zurueck — die feinere Einteilung (21 `interaction`,
 * 9 `safety`, 4 `lab_interference` …) steht nur im Katalog. Deshalb
 * zwei Abfragen und ein Zusammenfuehren ueber `rule_id`.
 */
export async function ladeRegeln(stichtag: string): Promise<RegelStand> {
  try {
    const client = createSessionClient()
    const { data: { user } } = await client.auth.getUser()
    if (!user) return LEER

    const db = client.schema('supplements')
    const [bewertung, katalog] = await Promise.allSettled([
      db.rpc('rule_assessment', { p_user_id: user.id, p_entry_date: stichtag }),
      db.from('rule_catalog').select('rule_id, rule_kind'),
    ])

    if (bewertung.status !== 'fulfilled' || bewertung.value.error) {
      return {
        ...LEER,
        fehler: bewertung.status === 'fulfilled'
          ? bewertung.value.error?.message ?? 'unbekannt'
          : 'Regelwerk nicht gelesen',
      }
    }

    const artJeRegel = new Map<string, string | null>()
    if (katalog.status === 'fulfilled' && !katalog.value.error) {
      for (const k of (katalog.value.data ?? []) as unknown as Array<Record<string, unknown>>) {
        const id = text(k.rule_id)
        if (id) artJeRegel.set(id, text(k.rule_kind))
      }
    }

    const roh = (bewertung.value.data ?? []) as unknown as Array<Record<string, unknown>>
    const regeln: Regel[] = roh.flatMap(r => {
      const id = text(r.rule_id)
      const zustand = text(r.evaluation_state)
      if (!id || !zustand) return []
      return [{
        rule_id: id,
        rule_type: text(r.rule_type),
        rule_kind: artJeRegel.get(id) ?? null,
        message: text(r.message_de),
        severity: text(r.severity),
        aktion: text(r.recommended_action_type),
        zustand: zustand as Regelzustand,
        fehlt: liste(r.missing_inputs),
        kontext: (r.matched_context ?? null) as Record<string, unknown> | null,
      }]
    })

    return {
      regeln,
      erfuellt: regeln.filter(r => r.zustand === 'fulfilled').length,
      nichtErfuellt: regeln.filter(r => r.zustand === 'not_fulfilled').length,
      fehlend: regeln.filter(r => r.zustand === 'missing_input').length,
      katalog: artJeRegel.size || regeln.length,
      fehler: null,
    }
  } catch (e) {
    return { ...LEER, fehler: e instanceof Error ? e.message : String(e) }
  }
}

// ── Das Gate von Extended ───────────────────────────────────────

/** Die vier Stufen, in aufsteigender Reihenfolge. */
export const GRADE = ['beginner', 'advanced', 'pro', 'elite'] as const
export type Grad = typeof GRADE[number]

/**
 * Ab welcher Stufe Extended offen ist.
 *
 * `[read]` **Tom (C-113):** *„Ich stelle mir vor, es ist nur für
 * bestimmte Level-User aktivierbar."* `advanced` ist die zweite von
 * vier — **wer sich selbst als Anfaenger einstuft, sieht die
 * Protokolle nicht.**
 *
 * `[read]` Die Grenze ist eine Produktentscheidung, keine gemessene
 * Groesse. Sie steht hier an einer Stelle, damit sie sich aendern
 * laesst, ohne sie zu suchen.
 */
export const GRAD_FUER_EXTENDED: Grad = 'advanced'

export function reichtDerGrad(grad: string | null): boolean {
  if (!grad) return false
  const i = (GRADE as readonly string[]).indexOf(grad)
  const noetig = (GRADE as readonly string[]).indexOf(GRAD_FUER_EXTENDED)
  return i >= 0 && i >= noetig
}

export type GateStand = {
  /** Der gespeicherte Grad, oder `null`. */
  grad: Grad | null
  /** Ob Extended offen ist. */
  offen: boolean
  fehler: string | null
}

/**
 * Der Erfahrungsgrad der angemeldeten Nutzerin.
 *
 * `[cmd]` **`public.profiles.experience_level`, seit C-140** —
 * nullable, kein Default, CHECK auf die vier Werte. Am 2026-08-20 auf
 * **allen 7 Profilen NULL**.
 *
 * `[read]` **Das Gate faellt serverseitig.** Bis G-110 war es ein
 * `useState(false)` im Browser: *„Wer klickt, sieht die Protokolle"*
 * (G-92). Jetzt entscheidet der gespeicherte Grad, und der Tab bekommt
 * die Inhalte gar nicht erst, wenn er nicht reicht.
 */
export async function ladeGate(): Promise<GateStand> {
  try {
    const client = createSessionClient()
    const { data: { user } } = await client.auth.getUser()
    if (!user) return { grad: null, offen: false, fehler: null }

    const { data, error } = await client
      .from('profiles')
      .select('experience_level')
      .eq('id', user.id)
      .maybeSingle()

    if (error) return { grad: null, offen: false, fehler: error.message }

    const grad = text((data ?? {} as Record<string, unknown>).experience_level)
    return {
      grad: (GRADE as readonly string[]).includes(grad ?? '') ? grad as Grad : null,
      offen: reichtDerGrad(grad),
      fehler: null,
    }
  } catch (e) {
    return { grad: null, offen: false, fehler: e instanceof Error ? e.message : String(e) }
  }
}
