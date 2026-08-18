// Die drei Ebenen der Koerperkarte (G-55).
//
// `[read]` Tom, 2026-08-18: „dem Total/Anzahl zusammenfassender
// Muskeln die Farbe" — **ein Mittel, kein Maximum.**
//
// | Ebene   | was sie zeigt                                      |
// |---------|----------------------------------------------------|
// | Flaeche | die faerbbaren Bereiche der Karte                  |
// | Gruppe  | die 18 Zeilen der Recovery-Liste                   |
// | Muskel  | die 96 aus `training.muscle_groups` (C-73)         |
//
// `[cmd]` C-73 gemessen: 96 Namen, 89 Eltern-Beziehungen, sieben
// Wurzeln (Legs 41 · Arms 21 · Back 10 · Shoulders 8 · Core 7 ·
// Chest 5 · Neck 4). Quelle ist die Kettendatei
// `supabase/_pipeline/10_training/107_muscle_groups_hierarchy.sql`,
// nicht die laufende Datenbank.
import { MUSKELN } from '@lumeos/ui'

import { EINORDNUNG, RECOVERY_ZU_KARTE } from './muskel-zuordnung'

/**
 * Muskelname (C-73) -> Flaechen-ID der Karte.
 *
 * `[cmd]` **Jede der 96 hat ein Ziel.** `null` gibt es hier nicht:
 * eine Gruppe ohne Flaeche waere ein Muskel, den die Karte nicht
 * zeigen kann — und der faellt am Bildschirm nicht auf.
 *
 * Wo die Karte gruenlicher zeichnet als C-73 unterscheidet, faellt
 * mehreres auf dieselbe Flaeche. Das ist der Normalfall und der Grund
 * fuer die Mittelung: `Quadriceps`, `Rectus Femoris` und `Thighs`
 * teilen sich `quadriceps`.
 */
export const MUSKEL_ZU_FLAECHE: Record<string, string> = {
  // ── Schultern (8) ────────────────────────────────────────────────
  Shoulders: 'deltoids',
  Deltoids: 'deltoids',
  'Front Shoulders': 'deltoids',
  'Rear Deltoids': 'deltoids',
  // Die Rotatorenmanschette liegt unter dem Deltoid — die Karte hat
  // keine eigene Flaeche dafuer. Sie faellt auf die Schulter, weil
  // dort ihre Wirkung sichtbar ist.
  'Rotator Cuff': 'deltoids',
  Infraspinatus: 'deltoids',
  Subscapularis: 'deltoids',
  'Teres Minor': 'deltoids',

  // ── Brust (5) ────────────────────────────────────────────────────
  Chest: 'chest',
  'Pectoralis Major': 'chest',
  'Clavicular Head': 'chest',
  'Sternal Head': 'chest',
  'Upper Chest': 'chest',

  // ── Ruecken (10) ─────────────────────────────────────────────────
  Back: 'upper-back',
  'Upper Back': 'upper-back',
  'Mid Back': 'upper-back',
  Rhomboids: 'upper-back',
  'Teres Major': 'upper-back',
  'latissimus dorsi': 'upper-back',
  'levator scapulae': 'trapezius',
  Trapezius: 'trapezius',
  'Lower Back': 'lower-back',
  'erector spinae': 'lower-back',

  // ── Rumpf (7) ────────────────────────────────────────────────────
  Core: 'abs',
  Abdominals: 'abs',
  'Lower Abs': 'abs',
  'Rectus Abdominis': 'abs',
  'Transverse Abdominis': 'abs',
  Obliques: 'obliques',
  'Internal Oblique': 'obliques',

  // ── Arme (21) ────────────────────────────────────────────────────
  Arms: 'biceps',
  Biceps: 'biceps',
  Brachialis: 'biceps',
  Triceps: 'triceps',
  Forearms: 'forearm',
  Brachioradialis: 'forearm',
  'Forearm Flexors': 'forearm',
  'Forearm Extensors': 'forearm',
  'Wrist Flexors': 'forearm',
  'Wrist Extensors': 'forearm',
  'Flexor Carpi Radialis': 'forearm',
  'Flexor Carpi Ulnaris': 'forearm',
  'Flexor Digitorum Profundus': 'forearm',
  'Fingers Flexors': 'forearm',
  'Grip Muscles': 'forearm',
  'Palmaris Longus': 'forearm',
  'Pronator Teres': 'forearm',
  'Extensor Carpi Radialis': 'forearm',
  'Extensor Carpi Radialis Brevis': 'forearm',
  'Extensor Carpi Radialis Longus': 'forearm',
  'Extensor Carpi Ulnaris': 'forearm',

  // ── Nacken (4) ───────────────────────────────────────────────────
  'Neck Muscles': 'neck',
  Scalenes: 'neck',
  Sternocleidomastoid: 'neck',
  'splenius capitis': 'neck',

  // ── Beine (41) ───────────────────────────────────────────────────
  Legs: 'quadriceps',
  'Upper Legs': 'quadriceps',
  Thighs: 'quadriceps',
  Quadriceps: 'quadriceps',
  'Rectus Femoris': 'quadriceps',
  Hamstrings: 'hamstring',
  'Biceps Femoris': 'hamstring',
  Semimembranosus: 'hamstring',
  Semitendinosus: 'hamstring',
  Glutes: 'gluteal',
  'Gluteus Maximus': 'gluteal',
  'Gluteus Medius': 'gluteal',
  'Gluteus Minimus': 'gluteal',
  Buttocks: 'gluteal',
  Hips: 'gluteal',
  'Hip Rotators': 'gluteal',
  piriformis: 'gluteal',
  // Die Karte kennt nur die Innenseite (`adductors`). Huefte und
  // Beuger liegen anatomisch daneben und fallen deshalb dorthin —
  // **nicht** auf `gluteal`, das ist ein anderer Muskel.
  Adductors: 'adductors',
  'Hip Adductors': 'adductors',
  'Adductor Longus': 'adductors',
  'adductor brevis': 'adductors',
  'adductor magnus': 'adductors',
  'Inner Thigh': 'adductors',
  'Hip Flexors': 'adductors',
  Iliopsoas: 'adductors',
  // `[cmd]` DIE AUSSENSEITE HAT KEINE EIGENE FLAECHE. Die Karte fuehrt
  // `adductors` (innen), nicht `abductors` (aussen) — in G-26 gemessen
  // und seither so gefuehrt. Sie fallen auf den Quadrizeps, weil das
  // die naechstliegende sichtbare Flaeche der Oberschenkelaussenseite
  // ist. `[annahme]` Das ist eine Naeherung; genauer waere eine eigene
  // Flaeche, die es in der Vorlage nicht gibt.
  Abductors: 'quadriceps',
  'Hip Abductors': 'quadriceps',
  'Outer Thigh': 'quadriceps',
  'Tensor Fasciae Latae': 'quadriceps',
  // Unterschenkel: Wade gegen Schienbein.
  'Lower Legs': 'calves',
  Calves: 'calves',
  Soleus: 'calves',
  Peroneals: 'calves',
  'Peroneus Brevis': 'calves',
  'Fibularis Muscles': 'calves',
  'Achilles Tendon': 'calves',
  'Flexor Digitorum Longus': 'calves',
  'Tibialis Posterior': 'calves',
  'Foot Muscles': 'calves',
  Tibialis: 'tibialis',
  'Anterior Tibialis': 'tibialis',
}

/**
 * Die Flaechen, die nie Farbe bekommen.
 *
 * `[cmd]` Sechs Formen zeichnen die Figur, tragen aber keinen Zustand.
 * Sie stehen so schon in `EINORDNUNG` (G-44) — hier nur als Liste,
 * damit die Pruefung sie nennen kann.
 */
export const OHNE_FARBE = ['head', 'hair', 'hands', 'feet', 'ankles', 'knees']

/** Die faerbbaren Flaechen — alles, was nicht Nicht-Muskel ist. */
export const FLAECHEN = Object.entries(EINORDNUNG)
  .filter(([, e]) => e.art === 'gruppe')
  .map(([id]) => id)

/**
 * Verdichtet Muskelwerte auf die Flaechen der Karte.
 *
 * `[read]` Tom: „dem Total/Anzahl zusammenfassender Muskeln die
 * Farbe" — **Mittel, kein Maximum.** Ein Maximum liesse eine Flaeche
 * rot aussehen, weil ein einziger von zwoelf Muskeln platt ist.
 *
 * `werte`: Ermuedung 0..100 je Muskelname aus C-73.
 */
export function verdichte(
  werte: Record<string, number | null | undefined>,
): Array<{ id: string; fatigue: number; anzahl: number }> {
  // Ein einfaches Objekt statt einer Map: das tsconfig-Ziel dieses
  // Pakets laesst das Iterieren einer Map nicht zu (TS2802).
  const summe: Record<string, { s: number; n: number }> = {}
  for (const [name, wert] of Object.entries(werte)) {
    if (wert == null) continue
    const flaeche = MUSKEL_ZU_FLAECHE[name]
    if (!flaeche || !MUSKELN[flaeche]) continue
    const e = summe[flaeche] ?? { s: 0, n: 0 }
    e.s += wert
    e.n += 1
    summe[flaeche] = e
  }
  return Object.entries(summe).map(([id, e]) => ({
    id,
    fatigue: Math.round(e.s / e.n),
    anzahl: e.n,
  }))
}

/**
 * Der Klick trennt wieder auf: Flaeche -> Gruppen -> Muskeln.
 *
 * `[read]` Der Auftrag: „Er liefert heute die Flaechen-ID — er muss die
 * dahinterliegenden Gruppen mitgeben."
 */
export function gruppenZurFlaeche(flaeche: string): string[] {
  return Object.entries(RECOVERY_ZU_KARTE)
    .filter(([, id]) => id === flaeche)
    .map(([slug]) => slug)
}

export function muskelnZurFlaeche(flaeche: string): string[] {
  return Object.entries(MUSKEL_ZU_FLAECHE)
    .filter(([, id]) => id === flaeche)
    .map(([name]) => name)
    .sort()
}
