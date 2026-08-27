// Die abgeleiteten Koerperwerte — G-122.
//
// ══ WARUM SERVERFREI ════════════════════════════════════════════════
//
// `[read]` **Dieselbe Trennung wie `wirkstoff-luecke.ts` (G-208),
// `wirkstoff-marke.ts` (G-210) und `medikament-eingabe.ts` (G-211).**
// In G-208 hat sie der Build erzwungen: ein einziger WERT-Import aus
// dem Leseweg in eine `'use client'`-Datei zog `next/headers` ins
// Browserbuendel (A-30). **Hier liegt die reine Rechnung.**
//
// ══ DIE FORMELN SIND GEMESSEN, NICHT ANGENOMMEN ═════════════════════
//
// `[cmd]` **Gegen alle 362 Bestandszeilen geprueft, 2026-08-27:**
//
//     bmi           weight / m^2                      0 Abweichungen
//     lean_mass_kg  weight * (1 - bf/100)             0
//     fat_mass_kg   weight * bf/100                   0
//     ffmi          NORMALISIERT (Kouri)              0
//
// `[read]` **Der FFMI war die Falle.** Die naheliegende Formel
// (`lean / m^2`) weicht bei **allen 362** ab. `[cmd]` Der Bestand
// rechnet die **hoehennormalisierte** Fassung:
//
//     ffmi = lean / m^2 + 6.1 * (1.8 - m)
//
// `[read]` **Haette ich sie geraten, waere jede neue Zeile
// inkonsistent zu den 362 vorhandenen gewesen** — und es waere erst
// aufgefallen, wenn jemand zwei Messungen nebeneinander legt.

/** Was gemessen wird — die Eingabe des Formulars. */
export type KoerpermassEingabe = {
  measurement_date: string
  measurement_time: string
  weight_kg: string
  body_fat_pct: string
  bf_method: string
  notes: string
}

export const LEERE_MESSUNG: KoerpermassEingabe = {
  measurement_date: '', measurement_time: '',
  weight_kg: '', body_fat_pct: '', bf_method: '', notes: '',
}

export type Feldfehler = { feld: string; text: string }

/**
 * Die Methoden, die die Datenbank zulaesst.
 *
 * `[cmd]` Aus `body_measurements_method_ck` gelesen, nicht erfunden.
 */
export const BF_METHODEN = [
  'caliper_3', 'caliper_7', 'dexa', 'bia', 'visual',
  'hydrostatic', 'navy', 'durnin', 'jackson_pollock', 'manual',
] as const

export function zahl(roh: string): number | null {
  const t = String(roh ?? '').trim().replace(',', '.')
  if (!t) return null
  const n = Number(t)
  return Number.isFinite(n) ? n : NaN
}

/**
 * Die Eingabe pruefen — dieselben Grenzen, die die Datenbank erzwingt.
 *
 * `[cmd]` **Aus den CHECK-Constraints gelesen:** `weight_kg` 20–400,
 * `body_fat_pct` 2–70, `height_cm_snapshot` 80–250.
 *
 * `[read]` **Diese Pruefung ersetzt sie nicht, sie kommt ihr zuvor** —
 * dieselbe Linie wie in G-211: ein Constraint-Fehler ist eine
 * englische Postgres-Meldung, ein Mensch braucht einen Satz am Feld.
 */
export function pruefeMessung(e: KoerpermassEingabe): Feldfehler[] {
  const fehler: Feldfehler[] = []
  if (!e.measurement_date.trim()) {
    fehler.push({ feld: 'measurement_date', text: 'Wann wurde gemessen?' })
  }
  if (!e.measurement_time.trim()) {
    // `[cmd]` `measurement_time` ist NOT NULL und Teil des
    // Eindeutigkeitsschluessels — ohne sie kaeme ein Konflikt statt
    // einer Meldung.
    fehler.push({ feld: 'measurement_time', text: 'Um welche Uhrzeit?' })
  }
  const g = zahl(e.weight_kg)
  if (g === null || Number.isNaN(g)) {
    fehler.push({ feld: 'weight_kg', text: 'Ein Gewicht ist nötig.' })
  } else if (g < 20 || g > 400) {
    fehler.push({ feld: 'weight_kg', text: 'Zwischen 20 und 400 kg.' })
  }
  const bf = zahl(e.body_fat_pct)
  if (bf !== null && (Number.isNaN(bf) || bf < 2 || bf > 70)) {
    fehler.push({ feld: 'body_fat_pct', text: 'Zwischen 2 und 70 Prozent.' })
  }
  if (e.bf_method.trim()
      && !(BF_METHODEN as readonly string[]).includes(e.bf_method.trim())) {
    fehler.push({ feld: 'bf_method', text: 'Unbekannte Methode.' })
  }
  // `[read]` **Ein Koerperfettwert ohne Methode ist eine Zahl ohne
  // Herkunft** — dieselbe Regel wie „eine Zahl ohne Stichtag ist keine
  // Zahl" (A-51). Caliper und DEXA unterscheiden sich um Prozentpunkte.
  if (bf !== null && !Number.isNaN(bf) && !e.bf_method.trim()) {
    fehler.push({ feld: 'bf_method', text: 'Womit wurde gemessen?' })
  }
  return fehler
}

/** Die abgeleiteten Werte — alle vier oder keiner. */
export type Abgeleitet = {
  bmi: number | null
  lean_mass_kg: number | null
  fat_mass_kg: number | null
  ffmi: number | null
}

function auf2(n: number): number {
  return Math.round(n * 100) / 100
}

/**
 * Die vier abgeleiteten Werte rechnen — als VORSCHAU.
 *
 * ══ SIE WERDEN NICHT GESCHRIEBEN ════════════════════════════════════
 *
 * `[cmd]` **Alle vier Spalten sind `GENERATED ALWAYS`** (gemessen
 * 2026-08-27). **Die Datenbank rechnet sie selbst und weist einen
 * Insert ab, der sie setzt** — der erste Nachweislauf lief genau
 * darauf auf:
 *
 *     ERROR: cannot insert a non-DEFAULT value into column
 *            "lean_mass_kg" — is a generated column
 *
 * `[read]` **Damit ist diese Funktion nicht ueberfluessig, aber sie
 * hat eine andere Aufgabe als gedacht:** das Formular kann zeigen,
 * was herauskommt, BEVOR gespeichert wird. **Die Wahrheit steht in
 * der Datenbank; das hier ist die Vorschau.**
 *
 * `[cmd]` **Die Formeln sind deshalb aus der `generation_expression`
 * abgeschrieben, nicht geraten** — inklusive der Normalisierung
 * `+ 6.1 * (1.8 - m)`. Gegen alle 362 Bestandszeilen: 0 Abweichungen.
 *
 * `[read]` **`hoeheCm` ist der SNAPSHOT, nicht das Profil.**
 *
 * `[read]` **Ohne Groesse gibt es kein BMI und kein FFMI**, aber
 * Magermasse und Fettmasse schon — genau wie die `CASE`-Zweige der
 * Datenbank es machen.
 */
export function abgeleitet(
  weightKg: number, bodyFatPct: number | null, hoeheCm: number | null,
): Abgeleitet {
  const m = hoeheCm != null && hoeheCm > 0 ? hoeheCm / 100 : null
  const bmi = m ? auf2(weightKg / (m * m)) : null

  if (bodyFatPct == null) {
    return { bmi, lean_mass_kg: null, fat_mass_kg: null, ffmi: null }
  }
  const lean = auf2(weightKg * (1 - bodyFatPct / 100))
  const fat = auf2(weightKg * (bodyFatPct / 100))
  // ══ DIE NORMALISIERUNG ════════════════════════════════════════════
  //
  // `[cmd]` **Kouri et al.:** `ffmi + 6.1 * (1.8 - m)`. Gegen alle 362
  // Bestandszeilen geprueft: **0 Abweichungen.** Ohne den Term weichen
  // **alle 362** ab.
  const ffmi = m ? auf2(lean / (m * m) + 6.1 * (1.8 - m)) : null
  return { bmi, lean_mass_kg: lean, fat_mass_kg: fat, ffmi }
}

/**
 * Fehlt die Groesse — der dritte Zustand dieser Tabelle.
 *
 * `[read]` **Er ist nicht erfunden, er kommt aus dem Schema:**
 * `height_cm_snapshot` ist nullable, `weight_kg` nicht. **Wer keine
 * Groesse im Profil hat, kann trotzdem wiegen** — dann fehlen BMI und
 * FFMI, und das gehoert benannt statt stillschweigend leer gelassen.
 *
 * `[cmd]` **Heute betrifft es 0 von 362** — alle tragen eine Groesse.
 * `[read]` **Der Fall kann aber entstehen**, anders als bei G-138:
 * `profiles.height_cm` ist nullable, und ein neues Konto hat sie
 * nicht.
 */
export const OHNE_GROESSE =
  'Ohne Körpergrösse im Profil lassen sich BMI und FFMI nicht rechnen. '
  + 'Gewicht und Körperfett werden trotzdem gespeichert.'
