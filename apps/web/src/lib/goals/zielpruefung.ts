// G-628 Teil 2 — Pruefungen nach Grad. **Reine Bausteine, kein I/O.**
//
// `[cmd]` **Die Regeln stehen in der Datenbank** (G-626,
// `goals.ziel_grenzen_pruefen` + `goals.experience_goal_limits`), nicht hier.
// Diese Datei kennt KEINEN Grenzwert — nur die Form der Befunde und was
// die Oberflaeche daraus macht (Dossier 8.2: „Eine Warnung braucht einen
// Bestaetigungs-Haken; gesperrt heisst: Feld rot mit Satz, welcher Grad es
// freigibt").
import { EXPERIENCE_LEVELS } from '../profile/profile-model'

/** Eine Zeile aus `ziel_grenzen_pruefen`: `(schluessel, art, hinweis)`. */
export type Rohbefund = { schluessel: string; art: string; hinweis: string }

export type Befund = {
  schluessel: string
  art: 'sperre' | 'warnung'
  hinweis: string
  /** Bei einer Sperre: der erste hoehere Grad, fuer den die Funktion sie nicht meldet. */
  freiAb: string | null
}

export type Pruefung =
  | { stand: 'geprueft'; befunde: Befund[]; tdee: number | null }
  /** Die Funktion ist (noch) nicht eingespielt — G-626 in der Kette, nicht live. */
  | { stand: 'nicht_eingespielt' }
  | { stand: 'fehler'; text: string }

/**
 * Ab welchem Grad ist eine Sperre frei? **Aus der Funktion selbst:** die
 * Befunde fuer die hoeheren Grade (in `EXPERIENCE_LEVELS`-Reihenfolge) —
 * der erste Grad, fuer den dieser Schluessel KEINE Sperre mehr ist.
 * `null`, wenn sie fuer alle hoeheren Grade bleibt.
 */
export function freiAb(schluessel: string, jeGrad: Array<{ grad: string; befunde: Rohbefund[] }>): string | null {
  const rang = (g: string) => (EXPERIENCE_LEVELS as readonly string[]).indexOf(g)
  const sortiert = [...jeGrad].sort((a, b) => rang(a.grad) - rang(b.grad))
  return sortiert.find(g => !g.befunde.some(b => b.schluessel === schluessel && b.art === 'sperre'))?.grad ?? null
}

/** Die hoeheren Grade als `EXPERIENCE_LEVELS` sie ordnet. */
export function hoehereGrade(grad: string | null): string[] {
  const i = (EXPERIENCE_LEVELS as readonly string[]).indexOf(grad ?? '')
  return EXPERIENCE_LEVELS.slice(i < 0 ? 0 : i + 1)
}

/** Rohbefunde → Befunde; unbekannte `art` gilt als Sperre (lieber zu streng). */
export function alsBefunde(roh: Rohbefund[], jeGrad: Array<{ grad: string; befunde: Rohbefund[] }>): Befund[] {
  return roh.map(r => {
    const art = r.art === 'warnung' ? 'warnung' : 'sperre'
    return { schluessel: r.schluessel, art, hinweis: r.hinweis,
      freiAb: art === 'sperre' ? freiAb(r.schluessel, jeGrad) : null }
  })
}

/**
 * „Weiter" erst ohne Sperre und mit allen Haken. `[read]` **Nicht
 * eingespielt** heisst: es gibt auch keinen Schreib-Waechter — der Weg ist
 * offen, die Oberflaeche sagt es. **Ein Fehler der Pruefung sperrt.**
 */
export function weiterErlaubt(p: Pruefung | null, bestaetigt: ReadonlySet<string>): boolean {
  if (!p) return false
  if (p.stand === 'nicht_eingespielt') return true
  if (p.stand === 'fehler') return false
  return p.befunde.every(b => b.art === 'warnung' && bestaetigt.has(b.schluessel))
}

/** Die bestaetigten Schluessel, die noch zu einem aktuellen Befund gehoeren. */
export function bestaetigteSchluessel(p: Pruefung | null, bestaetigt: ReadonlySet<string>): string[] {
  if (!p || p.stand !== 'geprueft') return []
  return p.befunde.filter(b => b.art === 'warnung' && bestaetigt.has(b.schluessel)).map(b => b.schluessel).sort()
}

/**
 * `G626_BLOCK:<s1,s2>` / `G626_CONFIRM:<s1>` aus dem Schreib-Waechter →
 * ein Satz. Die Hinweise kommen aus den Befunden der Vorschau (derselben
 * Funktion); ein unbekannter Schluessel wird genannt, nicht verschwiegen.
 */
export function waechterSatz(fehlertext: string, befunde: Befund[]): string | null {
  const m = /G626_(BLOCK|CONFIRM):([A-Za-z0-9_,]+)/.exec(fehlertext)
  if (!m) return null
  const teile = m[2]!.split(',').filter(Boolean).map(s =>
    befunde.find(b => b.schluessel === s)?.hinweis ?? `Grenze „${s}"`)
  return m[1] === 'BLOCK'
    ? `Die Prüfung lässt das Ziel nicht zu: ${teile.join(' ')}`
    : `Bitte bestätige zuerst: ${teile.join(' ')}`
}
