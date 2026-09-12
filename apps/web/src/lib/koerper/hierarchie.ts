// G-430 — die Rechnung auf dem Muskelbaum. OHNE Serverimporte.
//
// ══ WARUM DIESE DATEI GETRENNT STEHT ════════════════════════════════
//
// `[cmd]` **Die Rechnung stand zuerst in `hierarchie-read.ts`**, und
// `modale.tsx` (`'use client'`) importierte `elternteilVon`, `nameVon`
// und `LUECKEN` von dort. `[cmd]` **Am Schirm gemessen: HTTP 500 auf
// `/login`**, mit genau dieser Spur:
//
//     You're importing a component that needs next/headers.
//       packages/shared/src/supabase/session.ts
//       -> lib/koerper/hierarchie-read.ts
//       -> v2/recovery/modale.tsx   ('use client')
//
// `[read]` **`tsc` blieb dabei gruen** — der Typ stimmt ja. **Dieselbe
// Falle wie bei `injektion-flaechen.ts` (G-423) und `injektion-karte.ts`
// (G-396):** ein WERT-Import aus einem Leseweg zieht `next/headers`
// ueber die Client-Grenze und legt die ganze Anwendung lahm.
//
// `[read]` **Nur der TYP darf aus dem Leseweg kommen.** Alles, was ein
// Browser ausfuehrt, steht hier.
//
// `[read]` **Und die Rechnung ist ohne Datenbank pruefbar** — die
// Funktionen nehmen die Zeilen entgegen, statt sie zu holen. So
// laufen sie in einem Test, und die Sabotageprobe kann sie mit
// erfundenen Baeumen fuettern.

/** Eine Flaeche des Baums, wie sie in `public.koerperflaechen` steht. */
export type Flaeche = {
  id: string
  parent_id: string | null
  code: string
  name_de: string | null
  name_en: string | null
  ebene: number | null
  /** `muskel` oder `umriss` — Umrisse tragen nie einen Zustand. */
  art: string | null
  seite: string | null
  muscle_group_id: string | null
}

export type HierarchieStand = {
  flaechen: Flaeche[]
  /** `null`, wenn gelesen wurde; sonst der Grund. */
  fehler: string | null
}

/**
 * Alle Nachfahren einer Flaeche, ohne sie selbst.
 *
 * `[read]` **Das IST der Klick auf den Elternteil:** wer
 * `wurzel-ruecken` waehlt, faerbt `latissimus`, `teres-major`,
 * `teres-minor`, `trapezius`, `erector-spinae`, `flanke`.
 */
export function kinderVon(flaechen: Flaeche[], code: string): Flaeche[] {
  const start = flaechen.find(f => f.code === code)
  if (!start) return []
  const aus: Flaeche[] = []
  // `[read]` **Breitensuche mit Zaehler** — ein Zyklus in den Daten
  // haengte sonst die Seite auf, und `parent_id` ist ungeprueft.
  let rand = [start.id]
  let runden = 0
  while (rand.length > 0 && runden < 10) {
    const naechste: string[] = []
    for (const f of flaechen) {
      if (f.parent_id && rand.includes(f.parent_id) && !aus.some(x => x.id === f.id)) {
        aus.push(f)
        naechste.push(f.id)
      }
    }
    rand = naechste
    runden += 1
  }
  return aus
}

/**
 * Der Weg von der Wurzel bis zur Flaeche, sie eingeschlossen.
 *
 * `[read]` **Das IST „Per-muscle detail zeigt den Elternteil"** —
 * `latissimus` -> `wurzel-ruecken > latissimus`.
 */
export function pfadZu(flaechen: Flaeche[], code: string): Flaeche[] {
  const nach = new Map(flaechen.map(f => [f.id, f]))
  let k = flaechen.find(f => f.code === code) ?? null
  const aus: Flaeche[] = []
  let runden = 0
  while (k && runden < 10) {
    aus.unshift(k)
    k = k.parent_id ? nach.get(k.parent_id) ?? null : null
    runden += 1
  }
  return aus
}

/** Der direkte Elternteil, oder `null` bei einer Wurzel. */
export function elternteilVon(flaechen: Flaeche[], code: string): Flaeche | null {
  const f = flaechen.find(x => x.code === code)
  if (!f?.parent_id) return null
  return flaechen.find(x => x.id === f.parent_id) ?? null
}

// ══ G-430: die Tabelle kennt die Aufteilung NOCH NICHT ═════════════
//
// `[cmd]` **Gemessen 2026-09-12** (`tools/_g430-eltern.mjs`), gegen
// die laufende Instanz:
//
//     latissimus       in koerperflaechen: NEIN
//     teres-major      NEIN     teres-minor   NEIN
//     erector-spinae   NEIN     flanke        NEIN
//     trapezius        JA  -> wurzel-ruecken
//
// `[cmd]` **Die Tabelle fuehrt weiter `upper-back` und `lower-back`**
// mit je zwei Kindern (`-l`, `-r`). **Die Karte zeichnet sie seit
// G-430 nicht mehr.**
//
// `[read]` **Die Zeilen zu ergaenzen hiesse `supabase/` anzufassen** —
// der Auftrag verbietet es ausdruecklich (*„Nichts in supabase/ — die
// Tabelle steht"*). **Also wird die Luecke ueberbrueckt, nicht
// versteckt:** die fuenf neuen Flaechen erben den Elternteil der
// Flaeche, aus der sie hervorgegangen sind.
//
// `[read]` **Diese Tabelle ist die EINZIGE Stelle, an der die
// Aufteilung im Code doppelt steht** — sie faellt weg, sobald die
// Zeilen in der Datenbank sind. **Der Waechter dazu nennt sie.**
export const AUS_AUFTEILUNG: Record<string, string> = {
  // ══ G-431: diese fuenf sind seit C-479 in der Tabelle ═══════════
  //
  // `[cmd]` **Gemessen 2026-09-12** (`tools/_g430-eltern.mjs`), nach
  // Codex' C-479: `latissimus`, `teres-major`, `teres-minor`,
  // `erector-spinae` und `flanke` stehen jetzt in
  // `public.koerperflaechen`, je unter `wurzel-ruecken`.
  //
  // `[read]` **Die Bruecke greift fuer sie nicht mehr** —
  // `elternteilMitAufteilung` nimmt den direkten Elternteil, sobald es
  // einen gibt. **Die Eintraege bleiben als Rueckfall stehen**, bis
  // jemand sie misst und entfernt; sie zu loeschen waere eine
  // Aenderung ohne Messung.
  latissimus: 'upper-back',
  'teres-major': 'upper-back',
  'teres-minor': 'upper-back',
  'erector-spinae': 'lower-back',
  flanke: 'lower-back',
  // ══ G-431: Bein und Gesaess ═══════════════════════════════════
  //
  // `[cmd]` **Dieselbe Lage wie oben** — die Karte zeichnet sie seit
  // G-431, `public.koerperflaechen` fuehrt weiter `gluteal` und
  // `hamstring`.
  'gluteus-maximus': 'gluteal',
  'gluteus-medius': 'gluteal',
  'biceps-femoris': 'hamstring',
  semitendinosus: 'hamstring',
}

/**
 * Der Elternteil — auch fuer die fuenf Flaechen aus der Aufteilung.
 *
 * `[read]` **Ohne diese Bruecke zeigt „Per-muscle detail" fuer genau
 * die Muskeln nichts an, um die es in G-430 geht.**
 */
export function elternteilMitAufteilung(
  flaechen: Flaeche[], code: string,
): { eltern: Flaeche | null; ueberBruecke: boolean } {
  const direkt = elternteilVon(flaechen, code)
  if (direkt) return { eltern: direkt, ueberBruecke: false }
  const alt = AUS_AUFTEILUNG[code]
  if (!alt) return { eltern: null, ueberBruecke: false }
  // `[read]` **Der Elternteil der ALTEN Flaeche** — `upper-back`
  // haengt an `wurzel-ruecken`, und dort gehoert der Latissimus hin.
  return { eltern: elternteilVon(flaechen, alt), ueberBruecke: true }
}

/**
 * Der Anzeigename, deutsch bevorzugt.
 *
 * `[read]` **Das Datenmodell fuehrt Sprachvarianten als Spalten**
 * (`00-konventionen.md`, Abschnitt 1) — also wird hier gewaehlt, nicht
 * uebersetzt.
 */
export function nameVon(f: Flaeche, sprache: 'de' | 'en' = 'de'): string {
  return (sprache === 'en' ? f.name_en : f.name_de) ?? f.name_de ?? f.code
}

// ══ DIE LUECKEN — gemessen, nicht erfunden (A6) ═════════════════════
//
// `[cmd]` **Drei Muskeln haben KEINEN Pfad auf der Karte** — gemessen
// 2026-09-12 gegen `training.muscle_groups`
// (`107_muscle_groups_hierarchy.sql`):
//
//     Rhomboids           Elternteil: Upper Back
//     Soleus              Elternteil: Calves
//     Internal oblique    Elternteil: Obliques
//
// `[read]` **Sie stehen in `training.muscle_groups`, die Karte
// zeichnet sie nicht.** `[read]` **Sie werden NICHT erfunden** — der
// Auftrag sagt es ausdruecklich, und ein erfundener Pfad waere eine
// Falschaussage ueber den Koerper.
//
// `[read]` **Die Luecke wird SICHTBAR gemacht**, statt zu fehlen.
export const LUECKEN: Array<{ muskel: string; elternteil: string; grund: string }> = [
  { muskel: 'Rhomboids', elternteil: 'Upper Back',
    grund: 'liegt unter dem Trapezmuskel, den die Vorlage als eine Fläche zeichnet' },
  { muskel: 'Soleus', elternteil: 'Calves',
    grund: 'liegt unter dem Gastrocnemius — die Wade ist ein Pfadsatz' },
  { muskel: 'Internal oblique', elternteil: 'Obliques',
    grund: 'liegt unter dem Obliquus externus — gezeichnet ist nur die äußere Schicht' },
  // ══ G-431: drei weitere, beim Pruefen der zwoelf gefunden ═══════
  //
  // `[cmd]` **Je Pfad ein Bild** (`docs/bilder/g431/`) — diese drei
  // stehen in `training.muscle_groups` und haben KEINEN Pfad:
  { muskel: 'Gluteus Minimus', elternteil: 'Glutes',
    grund: 'liegt unter dem Gluteus medius — die Vorlage zeichnet zwei Flächen, nicht drei' },
  { muskel: 'Semimembranosus', elternteil: 'Hamstrings',
    grund: 'liegt unter dem Semitendinosus — der mediale Strang ist EIN Pfadsatz' },
  // `[cmd]` **`Vastus Intermedius` stand hier kurz** — und ist
  // entfernt: **`107_muscle_groups_hierarchy.sql` fuehrt ihn NICHT.**
  // `[read]` **Eine Luecke fuer einen Muskel, den die Datenbank nicht
  // kennt, waere ein erfundener Name** — genau das verbietet der
  // Auftrag. **Nachgesehen, nicht angenommen.**
]
