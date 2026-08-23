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
