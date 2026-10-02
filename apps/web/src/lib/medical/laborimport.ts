// Die Uebernahme geprueffter Befundzeilen — G-578. **Server-frei.**
//
// ══ DER BEFUND ═════════════════════════════════════════════════════
//
// `[cmd]` **`medical.import_lab_report_rows` hatte null Aufrufer** in
// `apps/web/src` und `packages/` — gezaehlt 2026-10-01, der einzige
// Treffer im ganzen Produkt war ein Kommentar
// (`katalog-suche.tsx:20`). **Dasselbe fuer die beiden
// OCR-Funktionen.**
//
// ══ DIE SIGNATUR, GEMESSEN STATT ANGENOMMEN ════════════════════════
//
// `[cmd]` **Aus `pg_proc` mit `prokind = 'f'`, 2026-10-01:**
//
//     medical.import_lab_report_rows(
//       p_user_id uuid, p_report_date date, p_report_time time,
//       p_lab_name text, p_title text, p_source text, p_rows jsonb)
//     RETURNS TABLE(report_id uuid, inserted_count int,
//                   exact_count int, ambiguous_count int,
//                   unknown_count int)
//
// `[read]` **Sie gibt eine TABELLE zurueck, keinen Skalar** — und sie
// legt den Bericht SELBST an. **Ein Aufrufer, der vorher eine
// `lab_reports`-Zeile schriebe, erzeugte zwei.**
//
// `[read]` **Und sie ordnet selbst zu:** je Zeile ruft sie
// `biomarker_marker_candidates(marker_name, unit)` und setzt
// `match_status` auf `exact`/`ambiguous`/`unknown`. **Die Oberflaeche
// darf keinen LOINC mitschicken** — sie hat keinen Parameter dafuer,
// und die Zuordnung ist Sache der Datenbank.
//
// ══ WAS DIE FUNKTION JE ZEILE VERLANGT ═════════════════════════════
//
// `[cmd]` **Aus dem Rumpf gelesen, beides wirft:**
//
//     marker_name   NULL oder leer -> 'medical import: marker_name missing'
//     unit          NULL oder leer -> 'medical import: unit missing'
//
// `[read]` **Alles Weitere ist freiwillig** (`value_numeric`,
// `value_text`, `value_operator`, die vier `lab_reference_*`,
// `notes`) — und `value_operator` faellt ohne Angabe auf `'='`.

/** Eine Zeile, wie die Funktion sie im `p_rows`-Array erwartet. */
export type ImportZeile = {
  /** `[cmd]` **Pflicht** — leer wirft `marker_name missing`. */
  marker_name: string
  /** `[cmd]` **Pflicht** — leer wirft `unit missing`. */
  unit: string
  value_numeric?: number | null
  value_text?: string | null
  value_operator?: string | null
  notes?: string | null
}

/**
 * Die Kopfdaten eines Berichts.
 *
 * `[cmd]` **`medical.lab_reports`, gemessen 2026-10-01:** von den
 * sieben Parametern sind nur `report_date` und `source` NOT NULL
 * (`source` mit Vorgabe `'manual'`). **`lab_name`, `title` und
 * `report_time` sind nullable** — sie duerfen fehlen, statt erfunden
 * zu werden.
 */
export type ImportKopf = {
  report_date: string
  report_time?: string | null
  lab_name?: string | null
  title?: string | null
  source: Importquelle
}

/**
 * Die Quellen, die `lab_reports_source_check` zulaesst.
 *
 * `[cmd]` **Aus `pg_constraint` gelesen, nicht erfunden** — fuenf
 * Werte. `[read]` **`seed` steht hier bewusst NICHT**: er gehoert den
 * Testdaten, nicht einem Nutzerimport.
 */
export const IMPORTQUELLEN = [
  'manual', 'pdf_upload', 'photo_ocr', 'lab_import',
] as const
export type Importquelle = (typeof IMPORTQUELLEN)[number]

export type Feldfehler = { feld: string; text: string }

/**
 * Die Uebernahme pruefen, bevor sie die Datenbank erreicht.
 *
 * `[read]` **Die Funktion wirft bei fehlendem Namen oder fehlender
 * Einheit eine englische Postgres-Meldung ohne Zeilenbezug** — und
 * bricht dabei den GANZEN Import ab, weil sie in einer Schleife
 * laeuft. **Deshalb hier vorher, mit der Zeilennummer.**
 */
export function pruefeImport(
  kopf: ImportKopf, zeilen: ImportZeile[],
): Feldfehler[] {
  const fehler: Feldfehler[] = []
  if (!kopf.report_date?.trim()) {
    fehler.push({ feld: 'report_date', text: 'Wann wurde befundet?' })
  }
  if (!(IMPORTQUELLEN as readonly string[]).includes(kopf.source)) {
    fehler.push({ feld: 'source', text: 'Unbekannte Quelle.' })
  }
  // `[cmd]` **`lab_reports_report_time_check`: die Sekunde muss 0
  // sein.** `[read]` **Ein `<input type="time">` liefert `HH:MM`** —
  // der Fall tritt nur auf, wenn jemand Sekunden mitschickt.
  if (kopf.report_time && /^\d{2}:\d{2}:(?!00$)\d{2}$/.test(kopf.report_time)) {
    fehler.push({ feld: 'report_time', text: 'Nur volle Minuten.' })
  }
  if (zeilen.length === 0) {
    fehler.push({ feld: 'zeilen', text: 'Keine Zeile ausgewaehlt.' })
  }
  zeilen.forEach((z, i) => {
    if (!z.marker_name?.trim()) {
      fehler.push({ feld: `zeile.${i}.marker_name`, text: `Zeile ${i + 1}: kein Markername.` })
    }
    if (!z.unit?.trim()) {
      fehler.push({ feld: `zeile.${i}.unit`, text: `Zeile ${i + 1}: keine Einheit.` })
    }
  })
  return fehler
}

/**
 * Die Zeilen in die Form, die `p_rows` erwartet.
 *
 * `[read]` **Leere Felder fallen WEG, sie werden nicht `null`** — die
 * Funktion liest mit `NULLIF(v_row->>'x', '')`, beides ist also
 * gleichwertig; **weglassen macht die Nutzlast lesbar.**
 *
 * `[read]` **Kein `loinc_code`** — es gibt kein Feld dafuer, die
 * Zuordnung macht die Datenbank.
 */
export function alsZeilen(zeilen: ImportZeile[]): Record<string, unknown>[] {
  return zeilen.map(z => {
    const r: Record<string, unknown> = {
      marker_name: z.marker_name.trim(),
      unit: z.unit.trim(),
    }
    if (z.value_numeric !== null && z.value_numeric !== undefined
        && Number.isFinite(z.value_numeric)) {
      r.value_numeric = String(z.value_numeric)
    }
    if (z.value_text?.trim()) r.value_text = z.value_text.trim()
    if (z.value_operator?.trim()) r.value_operator = z.value_operator.trim()
    if (z.notes?.trim()) r.notes = z.notes.trim()
    return r
  })
}

/** Was die Funktion zurueckgibt — eine Zeile der `RETURNS TABLE`. */
export type Importergebnis = {
  report_id: string
  inserted_count: number
  exact_count: number
  ambiguous_count: number
  unknown_count: number
}

/**
 * Der Satz zum Ergebnis.
 *
 * `[read]` **Er nennt die drei Zustaende, die die Datenbank selbst
 * vergeben hat** — nicht eine Erfolgsmeldung ohne Inhalt. `[cmd]`
 * **`ambiguous` und `unknown` tragen `needs_verification = true`**
 * (aus dem Rumpf: `v_status <> 'exact'`), **sie sind uebernommen und
 * warten auf einen Menschen.**
 */
export function ergebnisSatz(e: Importergebnis): string {
  const teile = [`${e.inserted_count} Zeilen uebernommen`]
  teile.push(`${e.exact_count} zugeordnet`)
  if (e.ambiguous_count) teile.push(`${e.ambiguous_count} mehrdeutig`)
  if (e.unknown_count) teile.push(`${e.unknown_count} unbekannt`)
  const rest = e.ambiguous_count + e.unknown_count
  return teile.join(' · ')
    + (rest ? ` — ${rest} brauchen eine Pruefung.` : '')
}
