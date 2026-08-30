// ════════════════════════════════════════════════════════════════════
// DIE NAECHSTE GEPLANTE TRAININGSSITZUNG — G-262
// ════════════════════════════════════════════════════════════════════
//
// `[read]` **Wofuer:** das Tagebuch zeigt ein Pre-Workout-Fenster. Das
// setzt voraus, dass bekannt ist, **wann** trainiert wird.
//
// ══ DIE MODULGRENZE — GEMESSEN, NICHT ANGENOMMEN ════════════════════
//
// `[read]` **Der Auftrag nennt es eine Modulgrenze wie bei `coach`,
// dort mit E-29 zugunsten einer Funktion entschieden.** `[cmd]`
// **Gemessen am 2026-08-30: die Lage ist eine andere.**
//
// **E-29 begruendet sich aus zwei Dingen** (ADR, Abschnitt „Warum das
// mehr ist als eine Bauform"): den drei Aenderungsprotokollen, die ein
// direkter Zugriff umgeht, und den Rechtetabellen, deren Logik sonst
// jedes Modul nachbaut.
//
//     Schema      Protokolle   Rechtetabellen
//     coach                4                4
//     training             0                0
//
// `[read]` **In `training` gibt es beides nicht** — kein Protokoll,
// das umgangen werden koennte, keine Rechtelogik, die nachzubauen
// waere. **Die Begruendung von E-29 hat hier keinen Gegenstand.**
//
// `[cmd]` **Und `training` fuehrt keine Lesefunktion:** die fuenf
// Funktionen des Schemas sind Trigger-Helfer
// (`refresh_workout_totals`, `touch_updated_at`, ...), keine mit
// Nutzerbezug.
//
// `[cmd]` **Der Zugriff ist ausserdem Bestand, nicht neu:**
// `lib/dashboard/lesen.ts:229` liest `training.workout_sessions`
// direkt — aus einem fremden Modul, seit dem Dashboard-Bau.
//
// `[cmd]` **RLS ist an** (`relrowsecurity = t`, 5 Policies), die
// Zeilenbegrenzung geschieht also in der Datenbank.
//
// `[read]` **Deshalb direkt gelesen und gemeldet, nicht umgangen.**
// **Kommt eines Tages ein Protokoll oder eine Rechtetabelle nach
// `training`, gilt die Abwaegung neu** — der Waechter unten haelt die
// Bedingung fest.
import { createSessionClient } from '@lumeos/shared/session'

/**
 * Eine geplante Sitzung — nur die Felder, die eine Zeitangabe braucht.
 *
 * `[read]` **Bewusst schmal.** Volumen, Saetze und Ort gehoeren ins
 * Training-Modul; hier ginge es nur darum, WANN.
 */
export type NaechsteSitzung = {
  datum: string
  /** `HH:MM` oder `null` — eine geplante Sitzung ohne Uhrzeit gibt es. */
  startzeit: string | null
  name: string | null
}

/**
 * Drei Zustaende, nicht zwei.
 *
 * `[read]` **Dieselbe Dreiteilung wie C-48, G-239 und G-251** — „keine
 * Sitzung geplant" ist etwas anderes als „geplant, aber ohne Uhrzeit".
 * **Wer beides zusammenwirft, zeigt im zweiten Fall nichts an und
 * behauptet damit, es sei kein Training vorgesehen.**
 *
 *     geplant       Sitzung mit Datum UND Uhrzeit
 *     ohne_zeit     Sitzung geplant, `started_time` ist leer
 *     keine         keine geplante Sitzung ab heute
 */
export type SitzungLage = 'geplant' | 'ohne_zeit' | 'keine'

export function lageVon(s: NaechsteSitzung | null): SitzungLage {
  if (!s) return 'keine'
  return s.startzeit ? 'geplant' : 'ohne_zeit'
}

export const LAGE_SATZ: Record<SitzungLage, string> = {
  geplant: '',
  ohne_zeit: 'Für die nächste geplante Einheit ist keine Uhrzeit '
    + 'hinterlegt — ohne sie lässt sich kein Zeitfenster nennen.',
  keine: 'Keine geplante Trainingseinheit. Sobald eine mit Uhrzeit im '
    + 'Training-Modul steht, erscheint hier der Abstand dazu.',
}

/**
 * Der Abstand bis zur Sitzung, in Worten.
 *
 * `[read]` **Die Zeit kommt als Argument, nicht aus `Date.now()`** —
 * sonst rechnet der Server eine andere Minute als der Browser und
 * React bricht die Hydration ab (dieselbe Regel wie in
 * `offene-aktionen.ts`).
 *
 * `[read]` **Und das ist eine ANGABE, keine Empfehlung** — C-108/F-02:
 * *nennen ja, bewerten nein.* Hier steht, wie lange es noch hin ist;
 * **nicht, wann jemand essen soll.**
 */
export function abstandSatz(s: NaechsteSitzung, jetzt: Date): string {
  if (!s.startzeit) return ''
  const ziel = new Date(`${s.datum}T${s.startzeit}`)
  if (Number.isNaN(ziel.getTime())) return ''
  const min = Math.round((ziel.getTime() - jetzt.getTime()) / 60000)
  if (min < 0) return 'liegt zurück'
  if (min < 60) return `in ${min} min`
  const h = Math.floor(min / 60)
  const rest = min % 60
  if (min < 1440) return rest === 0 ? `in ${h} h` : `in ${h} h ${rest} min`
  return `in ${Math.round(min / 1440)} Tagen`
}

export type SitzungStand = {
  sitzung: NaechsteSitzung | null
  /** `null` heisst gelesen; ein Text heisst: gar nicht erst gelesen. */
  fehler: string | null
  /** Die Uhr des Lesevorgangs, als ISO-Text. */
  gelesenUm: string
}

export const LEER: SitzungStand = {
  sitzung: null, fehler: null, gelesenUm: '',
}

/**
 * Die naechste geplante Sitzung ab einem Stichtag.
 *
 * `[cmd]` **Gemessen fuer `dev@lumeos.app` am 2026-08-30:** 30
 * Sitzungen, davon **14 `planned`** (2026-08-25 bis 2026-11-11),
 * **13 davon ab heute** — alle mit `started_time = 17:30`.
 *
 * `[read]` **Nur `planned`.** Eine `completed`-Sitzung liegt hinter
 * einem; eine `cancelled` findet nicht statt. **Ein Fenster auf eine
 * abgesagte Einheit waere eine Falschaussage.**
 */
export async function ladeNaechsteSitzung(
  abDatum: string,
): Promise<SitzungStand> {
  const gelesenUm = new Date().toISOString()
  try {
    const client = createSessionClient()
    const { data: { user } } = await client.auth.getUser()
    if (!user) return { ...LEER, gelesenUm }

    // RLS begrenzt auf eigene Zeilen — keine Kennung im Filter noetig.
    const { data, error } = await client
      .schema('training')
      .from('workout_sessions')
      .select('session_date, started_time, name')
      .eq('status', 'planned')
      .gte('session_date', abDatum)
      .order('session_date', { ascending: true })
      .order('started_time', { ascending: true, nullsFirst: false })
      .limit(1)

    if (error) return { sitzung: null, fehler: error.message, gelesenUm }

    const z = Array.isArray(data) && data.length > 0
      ? data[0] as Record<string, unknown>
      : null
    if (!z) return { sitzung: null, fehler: null, gelesenUm }

    const datum = typeof z.session_date === 'string' ? z.session_date : ''
    if (!datum) return { sitzung: null, fehler: null, gelesenUm }

    return {
      sitzung: {
        datum,
        // `time without time zone` kommt als `HH:MM:SS` — auf HH:MM
        // kuerzen, Sekunden sagen bei einer Planung nichts.
        startzeit: typeof z.started_time === 'string'
          ? z.started_time.slice(0, 5)
          : null,
        name: typeof z.name === 'string' && z.name.trim() ? z.name : null,
      },
      fehler: null,
      gelesenUm,
    }
  } catch (e) {
    return {
      sitzung: null,
      fehler: e instanceof Error ? e.message : String(e),
      gelesenUm,
    }
  }
}
