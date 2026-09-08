// Die Setup-Karten nach dem Onboarding — G-353.
//
// ## Der Entwurf, in vier Regeln
//
// `[read]` **Tom, im Auftrag zu G-353:** *,,eine Karte ist ein
// Angebot, ein Schritt ist ein Weg."*
//
//     1  Eine Karte erscheint, wenn eine Sache LEER ist — nicht,
//        wenn ein Modul unkonfiguriert ist. Konfiguriert ist es
//        immer: jede `food_preferences`-Spalte hat eine Vorgabe
//        (G-222). Eine Karte, die auf ,,unkonfiguriert" wartet,
//        erscheint nie.
//
//     2  Sie verschwindet, wenn die Sache getan ist — nicht, wenn
//        jemand sie wegwischt. **Das braucht KEINE Spalte.** Ein
//        Wegwisch-Zustand vergisst, warum er gesetzt wurde: wer die
//        Karte wegwischt und sein Ziel spaeter doch setzt, haette
//        dieselbe leere Stelle und keine Einladung mehr.
//
//     3  Hoechstens EINE auf einmal. Fuenf Karten sind ein zweites
//        Onboarding, das man nicht ueberspringen kann.
//
//     4  Sie steht im Modul, nicht auf dem Dashboard — eine Karte
//        im Nutrition-Reiter kann ,,Ziel setzen" sagen, weil dort
//        die Zielwerte stehen.
//
// `[cmd]` **Gemessen auf `test-user@lumeos.local`, 2026-09-08:**
//
//     food_preferences   1 Zeile    Vorgabe steht  -> KEINE Karte
//     meal_plan_slots    4 Zeilen   gesetzt        -> KEINE Karte
//     user_goals         0 Zeilen   nur Nutzer     -> KARTE
//     goal_phases        0 Zeilen   nur Nutzer     -> KARTE
//
// `[read]` **Die Regel fragt die Tabelle, nicht ein Flag** — am
// 05.09. hatte dasselbe Konto noch 0 Vorlieben und 0 Slots, ein
// Seed-Lauf hat sie angelegt. **Ein Leerstand ist kein fester
// Zustand.**
//
// `[read]` **Warum nicht `ladeZiele`:** die ruft je Ziel eine RPC
// (`goal_progress_at`) auf. **Diese Frage braucht nur die Zahl.**

import { createSessionClient } from '@lumeos/shared/session'

/** Eine angebotene Einrichtung — nie mehr als eine je Ansicht. */
export type SetupKarte = {
  /** Stabile Kennung, auch fuer den Test. */
  id: 'ziel' | 'phase'
  titel: string
  satz: string
  knopf: string
  /** Wohin der Knopf fuehrt — dorthin, wo die Sache gesetzt wird. */
  ziel: string
}

/**
 * Die eine Karte, die gerade dran ist — oder `null`.
 *
 * `[read]` **Rang nach Wirkung, nicht nach Vollstaendigkeit:** ein
 * Ziel aendert Zielwerte und Makros, eine Phase nur die Rate.
 *
 * `[read]` **Der Erfahrungsgrad fehlt bewusst** — er ist die
 * dritte Sache, die leer sein kann, **aber seine Skala ist nicht
 * entschieden** (G-228/E-46). **Eine Karte fuer etwas ohne Skala
 * waere ein Angebot ohne Ziel.**
 */
export async function ladeSetupKarte(): Promise<SetupKarte | null> {
  const client = createSessionClient()
  const { data: { user } } = await client.auth.getUser()
  if (!user) return null
  const g = client.schema('goals')

  // `[read]` **`head: true` holt nur die Zahl**, keine Zeilen —
  // die Frage ist ,,gibt es ueberhaupt eine", nicht ,,welche".
  const [ziele, phasen] = await Promise.all([
    g.from('user_goals').select('id', { count: 'exact', head: true }),
    g.from('goal_phases').select('id', { count: 'exact', head: true }),
  ])

  // `[read]` **Ein Lesefehler ist kein Leerstand.** Wer bei einem
  // Fehler eine Karte zeigt, laedt zum Anlegen von etwas ein, das
  // vielleicht schon da ist.
  if (ziele.error || phasen.error) return null

  if ((ziele.count ?? 0) === 0) {
    return {
      id: 'ziel',
      titel: 'Setz dir ein Ziel',
      satz: 'Ohne Ziel rechnet LumeOS mit Standardwerten. '
        + 'Mit Ziel richten sich Kalorien und Makros danach.',
      knopf: 'Ziel setzen',
      ziel: '/v2/goals?tab=goals',
    }
  }

  if ((phasen.count ?? 0) === 0) {
    return {
      id: 'phase',
      titel: 'Wähl deine Phase',
      satz: 'Die Phase bestimmt das Tempo — Aufbau, Diaet oder '
        + 'Halten. Ohne sie bleibt die Rate neutral.',
      knopf: 'Phase wählen',
      ziel: '/v2/goals?tab=phase',
    }
  }

  return null
}
