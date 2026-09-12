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

import { EINORDNUNG, RECOVERY_ZU_KARTE, flaechenFuer } from './muskel-zuordnung'

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
// `[cmd]` **G-430: der Wert darf eine LISTE sein** — `Obliques` deckt
// die Bauchseite UND die Flanke. **Die Einzelwerte bleiben
// gueltig**, `flaechenVonMuskel()` macht aus beidem eine Liste.
export const MUSKEL_ZU_FLAECHE: Record<string, string | string[]> = {
  // ── Schultern (8) ────────────────────────────────────────────────
  Shoulders: 'deltoids',
  Deltoids: 'deltoids',
  'Front Shoulders': 'deltoids',
  'Rear Deltoids': 'deltoids',
  // Die Rotatorenmanschette liegt unter dem Deltoid — die Karte hat
  // keine eigene Flaeche dafuer. Sie faellt auf die Schulter, weil
  // dort ihre Wirkung sichtbar ist.
  // `[cmd]` **G-430: `Teres Minor` ist die AUSNAHME** — er gehoert
  // zur Manschette, hat aber seit der Aufteilung einen eigenen Pfad
  // und steht deshalb unten bei den Ruecken-Muskeln.
  'Rotator Cuff': 'deltoids',
  Infraspinatus: 'deltoids',
  Subscapularis: 'deltoids',
  // `[cmd]` **G-430: `Teres Minor` hat seit der Aufteilung eine
  // eigene Flaeche.** **Hier stand `'deltoids'`** — mit der
  // Begruendung *„die Karte hat keine eigene Flaeche dafuer"*.
  // **Jetzt hat sie eine** (Pfad 1/4 von `upper-back`).
  'Teres Minor': 'teres-minor',

  // ── Brust (5) ────────────────────────────────────────────────────
  Chest: 'chest',
  'Pectoralis Major': 'chest',
  'Clavicular Head': 'chest',
  'Sternal Head': 'chest',
  'Upper Chest': 'chest',

  // ── Ruecken (10) ─────────────────────────────────────────────────
  //
  // ══ G-430: sechs Namen fielen auf EINE Flaeche ═══════════════════
  //
  // `[cmd]` **Hier stand sechsmal `'upper-back'`** — und Tom hat es
  // benannt: *„muskel-ebenen.ts wirft heute sechs Namen auf
  // upper-back."*
  //
  // `[cmd]` **G-425 hat gemessen, dass `upper-back` DREI Muskelpaare
  // buendelte.** **Jetzt zeigt jeder Name auf seinen Muskel:**
  //
  //     latissimus dorsi -> latissimus     (Pfad 3/6)
  //     Teres Major      -> teres-major    (Pfad 2/5)
  //     erector spinae   -> erector-spinae (Pfad 2/3 unten)
  //
  // `[read]` **`Back`, `Upper Back` und `Mid Back` sind GRUPPEN, kein
  // einzelner Muskel** — sie bleiben auf dem Latissimus, weil er die
  // groesste und namensgebende Flaeche des oberen Ruecken ist.
  // `[annahme]` **Genauer waere, sie ueber `parent_id` auf alle
  // Kinder zu verteilen** — das kann `verdichte` heute nicht, und es
  // waere eine zweite Aenderung im selben Durchgang.
  Back: 'latissimus',
  'Upper Back': 'latissimus',
  'Mid Back': 'latissimus',
  // `[cmd]` **Rhomboids hat KEINEN Pfad** (A6) — er liegt unter dem
  // Trapezmuskel, und die Vorlage zeichnet ihn nicht. **Er faellt auf
  // den Trapez, weil dort seine Wirkung sichtbar ist** — dieselbe
  // Begruendung wie bei der Rotatorenmanschette oben.
  // `[read]` **Die Luecke steht in `LUECKEN`** (`lib/koerper/
  // hierarchie-read.ts`) und wird am Schirm genannt, statt zu fehlen.
  Rhomboids: 'trapezius',
  'Teres Major': 'teres-major',
  'latissimus dorsi': 'latissimus',
  'levator scapulae': 'trapezius',
  Trapezius: 'trapezius',
  // `[read]` **Die Flanke ist nicht der Rueckenstrecker** (G-425) —
  // `Lower Back` ist die Gruppe, `erector spinae` der Muskel.
  'Lower Back': 'erector-spinae',
  'erector spinae': 'erector-spinae',

  // ── Rumpf (7) ────────────────────────────────────────────────────
  Core: 'abs',
  Abdominals: 'abs',
  'Lower Abs': 'abs',
  'Rectus Abdominis': 'abs',
  'Transverse Abdominis': 'abs',
  // ══ G-430: die Flanke gehoert zum Rumpf, nicht zum Ruecken ═══════
  //
  // `[cmd]` **G-425 am Bild:** *„kleiner Fleck seitlich ueber der
  // Huefte -> Flanke (Obliquus externus / QL)"* — **und ausdruecklich:
  // *„Die Flanke hat keinen [Namen]."***
  //
  // `[cmd]` **Nachgezaehlt in `107_muscle_groups_hierarchy.sql`: die
  // 96 kennen genau ZWEI schraege Bauchmuskeln** — `Obliques` und
  // `Internal Oblique`. **Kein `Quadratus Lumborum`, kein `Flank`,
  // kein `Obliquus externus`.**
  //
  // `[read]` **Also wird KEIN Name erfunden** — `Obliques` ist die
  // Gruppe, und sie deckt beide Flaechen: die Bauchseite vorne und
  // die Flanke hinten. **Der Obliquus externus zieht wirklich
  // dorthin**, das ist keine Naeherung zweier fremder Muskeln.
  //
  // `[read]` **Ohne diesen Eintrag bliebe `flanke` fuer immer grau** —
  // eine Flaeche, die als faerbbar gilt und nie Farbe bekommt.
  Obliques: ['obliques', 'flanke'],
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
  // ══ G-431: Beinbeuger und Gesaess sind aufgeteilt ═══════════════
  //
  // `[cmd]` **Am Bild bestimmt** (`docs/bilder/g431/`):
  // `hamstring` **traegt je Seite ZWEI breite Straenge** — aussen der
  // Biceps femoris, innen Semitendinosus/Semimembranosus.
  // `gluteal` **eine grosse Masse und eine kleine Kappe oben aussen**
  // — Maximus und Medius.
  //
  // `[read]` **Die Namen standen schon in `training.muscle_groups`** —
  // keiner ist erfunden.
  //
  // `[read]` **`Hamstrings` und `Glutes` sind GRUPPEN**, kein
  // einzelner Muskel — sie faerben beide Teile.
  Hamstrings: ['biceps-femoris', 'semitendinosus'],
  'Biceps Femoris': 'biceps-femoris',
  // `[cmd]` **Semimembranosus und Semitendinosus liegen
  // uebereinander** — die Vorlage zeichnet EINEN medialen Strang.
  // **Beide fallen darauf**, wie `Rotator Cuff` auf `deltoids`.
  Semimembranosus: 'semitendinosus',
  Semitendinosus: 'semitendinosus',
  Glutes: ['gluteus-maximus', 'gluteus-medius'],
  'Gluteus Maximus': 'gluteus-maximus',
  'Gluteus Medius': 'gluteus-medius',
  // `[cmd]` **Gluteus minimus liegt UNTER dem Medius** — die Vorlage
  // zeichnet ihn nicht. **Er faellt auf den Medius**, unter dem er
  // liegt; die Luecke steht in `LUECKEN`.
  'Gluteus Minimus': 'gluteus-medius',
  Buttocks: ['gluteus-maximus', 'gluteus-medius'],
  Hips: 'gluteus-medius',
  'Hip Rotators': 'gluteus-medius',
  piriformis: 'gluteus-maximus',
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

/** G-430: die Flaechen eines Muskelnamens — immer als Liste. */
export function flaechenVonMuskel(name: string): string[] {
  const v = MUSKEL_ZU_FLAECHE[name]
  if (!v) return []
  return Array.isArray(v) ? v : [v]
}

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
    // `[cmd]` **G-430: ein Muskelname kann mehrere Flaechen faerben.**
    for (const flaeche of flaechenVonMuskel(name)) {
      if (!MUSKELN[flaeche]) continue
      const e = summe[flaeche] ?? { s: 0, n: 0 }
      e.s += wert
      e.n += 1
      summe[flaeche] = e
    }
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
  return Object.keys(RECOVERY_ZU_KARTE)
    .filter(slug => flaechenFuer(slug).includes(flaeche))
}

export function muskelnZurFlaeche(flaeche: string): string[] {
  // `[cmd]` **G-430: ueber `flaechenVonMuskel`** — ein Vergleich
  // `id === flaeche` saehe eine Liste nie als Treffer.
  return Object.keys(MUSKEL_ZU_FLAECHE)
    .filter(name => flaechenVonMuskel(name).includes(flaeche))
    .sort()
}
