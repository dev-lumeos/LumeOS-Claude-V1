'use client'

// Die Katalogsuche — 11.676 Marker aus `medical.biomarker_catalog`.
//
// **DIESE KACHEL IST KEINE ATTRAPPE MEHR.**
//
// `[read]` Der Auftrag G-46: *„Der Katalog ist die grösste Tabelle im
// Repo nach `food_nutrients` — die Anzeige muss suchen, nicht laden."*
// Deshalb kommt hier nie die ganze Tabelle an: ohne Begriff die 25
// häufigsten nach `common_test_rank`, mit Begriff die 25 besten
// Treffer. Gesucht wird auf dem Server, geliefert wird eine Seite.
//
// `[cmd]` Gemessen gegen die laufende Instanz (2026-08-18):
//   leere Suche      0,05 ms   (Index `biomarker_catalog_rank_idx`)
//   „glucose"        1,9 ms
//   „eisen"         23,2 ms    (Seq Scan über vier Namensspalten)
//
// MUSTER: `/v2/nutrition/suche` sucht über `rpc()` mit Begrenzung.
// `[cmd]` Hier gibt es keine Suchfunktion im Schema — `medical` führt
// nur `biomarker_marker_candidates`, `import_lab_report_rows`,
// `lab_result_values_read` — und **dieser Auftrag darf keine
// anlegen** („Kein Schema ändern, keine Migration"). Gesucht wird
// deshalb über PostgREST auf der Tabelle, mit demselben Grundsatz:
// begrenzt, serverseitig, sortiert.
import * as React from 'react'
import { Card, Icon, Pill } from '@lumeos/ui'

import type { KatalogTreffer } from '../../../lib/medical/lesen'

export function KatalogSuche({
  start, gesamt, suchen,
}: {
  start: KatalogTreffer[]
  gesamt: number
  suchen: (begriff: string) => Promise<KatalogTreffer[]>
}) {
  const [q, setQ] = React.useState('')
  const [treffer, setTreffer] = React.useState(start)
  const [laeuft, setLaeuft] = React.useState(false)
  const [fehler, setFehler] = React.useState<string | null>(null)

  // Entprellt: eine Anfrage je Tippause, nicht je Anschlag.
  React.useEffect(() => {
    let verworfen = false
    const zeitgeber = setTimeout(() => {
      setLaeuft(true)
      suchen(q)
        .then(r => { if (!verworfen) { setTreffer(r); setFehler(null) } })
        .catch((e: unknown) => {
          if (!verworfen) setFehler(e instanceof Error ? e.message : String(e))
        })
        .finally(() => { if (!verworfen) setLaeuft(false) })
    }, 220)
    return () => { verworfen = true; clearTimeout(zeitgeber) }
  }, [q, suchen])

  return (
    <Card
      title="Biomarker-Katalog"
      sub={`${gesamt.toLocaleString('de-DE')} Marker · LOINC 2.82`}
    >
      <div style={{ position: 'relative', marginBottom: 12 }}>
        <Icon
          name="search"
          className="v2-ic v2-ic-sm"
          style={{
            position: 'absolute', left: 10, top: '50%',
            transform: 'translateY(-50%)', color: 'var(--fg-subtle)',
          }}
        />
        <input
          value={q}
          onChange={e => setQ(e.target.value)}
          aria-label="Biomarker-Katalog durchsuchen"
          placeholder="Name, Kurzname, LOINC-Klasse…"
          style={{
            width: '100%', height: 32, background: 'var(--surface)',
            border: '1px solid var(--border)', borderRadius: 7,
            padding: '0 12px 0 30px', fontSize: 12, color: 'var(--fg)',
          }}
        />
      </div>

      {fehler && (
        <div
          className="v2-muted"
          style={{
            fontSize: 11.5, padding: 10, borderRadius: 6, marginBottom: 10,
            background: 'color-mix(in oklch, var(--warn) 6%, var(--surface))',
            border: '1px solid color-mix(in oklch, var(--warn) 22%, var(--border))',
          }}
        >
          {`Suche fehlgeschlagen: ${fehler}`}
        </div>
      )}

      <div className="v2-tbl-wrap">
        <table className="v2-tbl">
          <thead>
            <tr>
              <th>Marker</th>
              <th style={{ width: 100 }}>LOINC</th>
              <th style={{ width: 110 }}>Einheit</th>
              <th style={{ width: 150 }}>Klasse</th>
              <th style={{ width: 70, textAlign: 'right' }}>Rang</th>
            </tr>
          </thead>
          <tbody>
            {treffer.map(t => (
              <tr key={t.loinc_code}>
                <td>
                  <div style={{ fontSize: 12.5 }}>
                    {t.display_name ?? t.short_name ?? t.loinc_code}
                  </div>
                  {t.consumer_name && t.consumer_name !== t.display_name && (
                    <div className="v2-dim" style={{ fontSize: 10.5, marginTop: 2 }}>
                      {t.consumer_name}
                    </div>
                  )}
                </td>
                <td className="v2-mono" style={{ fontSize: 11 }}>{t.loinc_code}</td>
                <td className="v2-mono v2-muted" style={{ fontSize: 10.5 }}>
                  {t.example_units ?? '—'}
                </td>
                <td className="v2-muted" style={{ fontSize: 11 }}>
                  {t.loinc_class ? <Pill>{t.loinc_class}</Pill> : '—'}
                </td>
                <td className="v2-num v2-muted" style={{ textAlign: 'right', fontSize: 11 }}>
                  {t.common_test_rank}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {treffer.length === 0 && !laeuft && (
        <div style={{ padding: '20px 12px', textAlign: 'center' }}>
          <div className="v2-dim" style={{ fontSize: 12 }}>
            {`Kein Marker gefunden für „${q}".`}
          </div>
        </div>
      )}

      <div className="v2-divider" />
      <div className="v2-dim" style={{ fontSize: 10.5 }}>
        {laeuft
          ? 'Sucht…'
          : `${treffer.length} von ${gesamt.toLocaleString('de-DE')} gezeigt · `
            + 'die Suche liefert höchstens 25 Treffer auf einmal.'}
      </div>
    </Card>
  )
}
