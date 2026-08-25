// C-252: die Felder der alten Breittabelle, die im neuen Katalog keine
// Quelle haben.
//
// ── WARUM EINE EIGENE DATEI ─────────────────────────────────────────
//
// `[read]` **`substanz-read.ts` laeuft nur auf dem Server** — es zieht
// `createSessionClient` und damit `next/headers`. `substanz-detail.tsx`
// ist `'use client'`. Ein Wert-Import von dort zoege den Serverclient in
// das Browser-Bundle; genau der Fall, den A-30 gebaut hat und den
// `tools/serverimport-pruefen.mjs` im Gate sucht.
//
// `[read]` Deshalb dasselbe Muster wie bei `rechte-modell.ts` (G-90)
// und `extended-regel.ts` (G-167): **die Daten serverfrei daneben, die
// I/O bleibt drueben.** `substanz-anzeige.ts` haelt es genauso — es
// importiert aus `substanz-read` ausschliesslich Typen.

/**
 * Der Anzeigetext: deutsch, wenn es ihn gibt — sonst englisch.
 *
 * ── WARUM DAS NICHT NUR FUER DEN NAMEN GILT (C-254) ────────────────
 *
 * `[cmd]` **Gemessen am 2026-08-23: 25 `*_de`-Spalten tragen NIE
 * Deutsch**, alle im `supplements`-Schema — `name_de` 0/566,
 * `description_de` 0/290, `summary_de` 0/288, `pregnancy_note_de`
 * 0/237, `storage_de` 0/54, `metabolism_de` 0/290.
 *
 * `[cmd]` **Und der Rueckfall rettet dort wirklich etwas:** 566 Namen,
 * 290 Beschreibungen, 288 Zusammenfassungen kaemen sonst als
 * Leerstelle an.
 *
 * `[read]` **Umgekehrt gilt die Regel NICHT ueberall:**
 * `nutrition.foods.name_de` ist bei allen 7.140 Zeilen deutsch, und
 * `nutrition.nutrient_details` traegt de und en identisch gefuellt —
 * dort waere ein Rueckfall Zierrat. Welche Spalte welche ist, steht in
 * `tools/sprachrueckfall-pruefen.mjs`.
 *
 * `[cmd]` **`NULLIF(x,'')` allein genuegt nicht:** `name_de` ist
 * `NULL`, nicht Leerstring. Beides wird hier gefangen.
 */
export function text(de: unknown, en: unknown): string | null {
  const d = typeof de === 'string' ? de.trim() : ''
  if (d) return d
  const e = typeof en === 'string' ? en.trim() : ''
  return e || null
}

/**
 * Wirft `jsonb`-Felder weg, die das Literal `null` tragen (C-107).
 *
 * `[cmd]` **Der Anlass, gemessen 2026-08-23:**
 * `supplement_warnings.dose_ceiling` ist bei **290 von 290** Zeilen
 * `is not null` — **258 davon enthalten aber `null` als JSON-Wert.**
 * Echt gefuellt sind **32**.
 *
 * `[read]` **Ohne diesen Schritt stuende bei 258 Substanzen „null" in
 * der Warnschwellen-Kachel** — und eine hingeschriebene Null sieht aus
 * wie eine gemessene. `blockOhneMeta` faengt es nicht: dort ist es ein
 * vorhandenes Feld mit einem Wert, nur eben dem falschen.
 *
 * `[read]` **Leeres Objekt und leeres Array zaehlen genauso** — auch
 * sie sagen nichts, belegen aber eine Zeile.
 */
export function jsonNull(
  z: Record<string, unknown> | null,
): Record<string, unknown> | null {
  if (!z) return null
  const aus: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(z)) {
    if (v === null || v === undefined) continue
    if (Array.isArray(v) && v.length === 0) continue
    if (typeof v === 'object' && !Array.isArray(v) && Object.keys(v).length === 0) continue
    aus[k] = v
  }
  return Object.keys(aus).length ? aus : null
}

/**
 * Ein Feld, das der neue Katalog nicht traegt.
 *
 * `[read]` **Der Unterschied zwischen den beiden Arten ist der Punkt
 * dieser Liste:** `fehlt` heisst, es gibt gar keine Spalte — der Wert
 * ist beim Umbau entfallen. `leer` heisst, die Spalte existiert, sie
 * traegt aber bei keiner der 290 sichtbaren Substanzen einen Wert.
 * **Das erste ist eine Entscheidung, das zweite ein Datenstand.**
 */
export type OhneQuelle = {
  feld: string
  art: 'fehlt' | 'leer'
  grund: string
}

/**
 * `[cmd]` **Gemessen am 2026-08-23**, jedes Feld einzeln gegen die 290
 * sichtbaren Substanzen gezaehlt — nicht gegen die 566 der Tabelle.
 *
 * `[read]` **Nicht geraten und nicht gefuellt.** Der Auftrag sagt:
 * melden, nicht erfinden — *„eine erfundene 87 sieht aus wie eine
 * gemessene 87."*
 */
export const OHNE_QUELLE: OhneQuelle[] = [
  {
    feld: 'cyp',
    art: 'fehlt',
    grund: 'Die alte Breittabelle führte `cyp` als jsonb. Im neuen Schema '
      + 'gibt es dafür keine Spalte — auch nicht in `supplement_pharmacology`.',
  },
  {
    feld: 'warning_triggers',
    art: 'fehlt',
    grund: 'Kein Gegenstück. `supplement_warnings` ist eine eigene Tabelle, '
      + 'führt aber andere Felder als die Auslöser der alten Spalte.',
  },
  {
    feld: 'subcategory',
    art: 'fehlt',
    grund: 'Der neue Katalog kennt eine Ebene: `supplement_categories`, '
      + '23 Zeilen. Eine Unterkategorie gibt es nicht mehr.',
  },
  {
    feld: 'dose_ceiling_value',
    art: 'fehlt',
    grund: '`supplement_dosing.upper_limit` trägt die Obergrenze, aber ohne '
      + 'den getrennten Zahlenwert der alten Spalte — und nur bei 38 der 290.',
  },
  {
    feld: 'lab_effects',
    art: 'fehlt',
    grund: '`supplement_lab_effects` existiert als Tabelle; die Zuordnung zu '
      + 'den 290 ist nicht gemessen und wird deshalb nicht gezeigt.',
  },
  {
    feld: 'guideline_dose',
    art: 'leer',
    grund: 'Spalte vorhanden in `supplement_dosing`, bei 0 von 290 gefüllt.',
  },
  {
    feld: 'official_label_dose',
    art: 'leer',
    grund: 'Spalte vorhanden, bei 1 von 290 gefüllt.',
  },
  {
    feld: 'description_de',
    art: 'leer',
    grund: 'Bei 0 von 290 gefüllt — wie jede `*_de`-Freitextspalte des '
      + 'Schemas. Laut Spec so gewollt, bis übersetzt ist; die Anzeige '
      + 'weicht auf Englisch aus.',
  },
]
