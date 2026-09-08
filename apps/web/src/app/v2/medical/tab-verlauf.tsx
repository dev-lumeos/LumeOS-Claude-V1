'use client'

// Verlauf, Termine und Dokumente — G-376.
//
// `[cmd]` **QUELLE: `theme-v1/module-medical.jsx:398`** (`MedHistory`,
// die senkrechte Zeitachse mit Punktmarken), **`:444`**
// (`MedDocuments`) und der Appointments-Reiter derselben Datei.
//
// ## E-74 traegt diesen Reiter
//
// Tom, 2026-09-08: *„dessen inhalt mit herkunft bei fragen des users
// wiedergeben."*
//
// `[read]` **Jede Zeile sagt, woher sie kommt** — wer, wann, und ob
// ein Dokument dahinterliegt. **LumeOS sagt nicht „du hast X",
// sondern „Dr. Y hat am Z. X festgestellt".**
//
// `[read]` **Und nichts wird bewertet** (E-74): kein Wert bekommt
// eine Farbe fuer „schlecht", keine Diagnose wird abgeleitet. Die
// Kachel zeigt, was dasteht, und nennt den Urheber.
import * as React from 'react'
import { Card, Pill, Icon } from '@lumeos/ui'

import type { DokumenteStand } from '../../../lib/medical/dokumente-read'
import {
  ereignisAnlegen, terminAnlegen, terminAendern,
  originalHochladen, originalOeffnen,
} from './dokumente-aktionen'

/** Die drei Arten aus `health_events_event_type_check`. */
const ARTEN: Array<[string, string]> = [
  ['diagnosis', 'Diagnose'],
  ['treatment', 'Behandlung'],
  ['operation', 'Operation'],
]

/** Die fuenf aus `health_events_source_kind_check`. */
const HERKUNFT: Array<[string, string]> = [
  ['clinician', 'Arzt / Klinik'],
  ['user', 'selbst eingetragen'],
  ['document', 'aus einem Dokument'],
  ['import', 'importiert'],
  ['seed', 'Testdaten'],
]

/** Die drei aus `appointments_appointment_type_check`. */
const TERMINARTEN: Array<[string, string]> = [
  ['doctor', 'Arzt'],
  ['labor', 'Labor'],
  ['other', 'Sonstiges'],
]

const ART_LABEL = Object.fromEntries([...ARTEN, ['lab_report', 'Befund']])
const HERKUNFT_LABEL = Object.fromEntries(HERKUNFT)

function tagText(iso: string): string {
  if (!iso) return '—'
  const d = new Date(iso.length <= 10 ? `${iso}T12:00:00` : iso)
  return d.toLocaleDateString('de-CH', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

/**
 * Die Herkunftszeile — der Kern von E-74.
 *
 * `[read]` **Sie steht an JEDER Zeile**, nicht nur wo es interessant
 * ist. Eine Zeile ohne Herkunft waere eine Behauptung.
 */
function Herkunft({ art, wer, wann, beleg }: {
  art: string; wer: string; wann: string | null; beleg: string | null
}) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 6,
      flexWrap: 'wrap', marginTop: 5,
    }} data-herkunft>
      <Icon name="user" className="v2-ic v2-ic-sm" style={{ color: 'var(--fg-dim)' }} />
      <span className="v2-muted" style={{ fontSize: 11 }}>
        {wer}
        <span className="v2-dim"> · {HERKUNFT_LABEL[art] ?? art}</span>
        {wann && <span className="v2-dim"> · erfasst {tagText(wann)}</span>}
      </span>
      {beleg && (
        <Pill className="v2-mono" style={{ fontSize: 9.5 }}>
          <Icon name="medical" className="v2-ic v2-ic-sm" />Dokument
        </Pill>
      )}
    </div>
  )
}

export function MedVerlauf({ stand }: { stand: DokumenteStand }) {
  const [laeuft, setLaeuft] = React.useState(false)
  const [meldung, setMeldung] = React.useState<string | null>(null)
  const [filter, setFilter] = React.useState('alle')

  // Formularfelder — Ereignis
  const [eArt, setEArt] = React.useState('diagnosis')
  const [eDatum, setEDatum] = React.useState('')
  const [eTitel, setETitel] = React.useState('')
  const [eWer, setEWer] = React.useState('')
  const [eHerkunft, setEHerkunft] = React.useState('clinician')

  // Formularfelder — Termin
  const [tArt, setTArt] = React.useState('doctor')
  const [tBeginn, setTBeginn] = React.useState('')
  const [tTitel, setTTitel] = React.useState('')

  async function tue(was: () => Promise<{ ok: boolean; fehler?: string }>) {
    setLaeuft(true)
    setMeldung(null)
    try {
      const a = await was()
      // `[read]` **Ein Fehler wird gezeigt, nicht geschluckt** — sonst
      // sieht ein misslungener Klick aus wie keiner.
      if (!a.ok) setMeldung(a.fehler ?? 'Hat nicht geklappt.')
    } finally {
      setLaeuft(false)
    }
  }

  const gefiltert = filter === 'alle'
    ? stand.zeitachse
    : stand.zeitachse.filter(z => z.art === filter)

  return (
    <div className="v2-grid v2-grid-14" style={{ gap: 14 }}>
      <div className="v2-col-gap" style={{ gap: 14 }}>
        {/* ══ Zeitachse ═══════════════════════════════════════════ */}
        <Card
          title="Verlauf"
          sub={stand.zeitachse.length > 0
            ? `${gefiltert.length} von ${stand.zeitachse.length} Einträgen`
            : 'health_timeline'}
        >
          <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
            <span className="v2-eyebrow" style={{ alignSelf: 'center', marginRight: 4 }}>
              Filter
            </span>
            {[['alle', 'Alle'], ...ARTEN, ['lab_report', 'Befunde']].map(([k, l]) => (
              <button key={k} type="button" aria-pressed={filter === k}
                      className={filter === k ? 'v2-pill v2-pill-acc' : 'v2-pill'}
                      style={{ cursor: 'pointer', padding: '3px 10px', fontSize: 11 }}
                      onClick={() => setFilter(k)}>
                {l}
              </button>
            ))}
          </div>

          {stand.zeitachse.length === 0 && (
            // `[read]` **Ein benannter Leerhinweis, keine nackte Null**
            // (E-72): er sagt, WAS leer ist.
            <div className="v2-dim" style={{ fontSize: 11.5, lineHeight: 1.5 }}>
              Noch kein Eintrag in <span className="v2-mono">health_timeline</span>.
              Diagnosen, Behandlungen und Operationen erscheinen hier,
              sobald sie erfasst sind — mit ihrer Herkunft.
            </div>
          )}

          {gefiltert.length > 0 && (
            <div style={{ position: 'relative', paddingLeft: 24 }}>
              {/* Die senkrechte Linie der Vorlage
                  (`module-medical.jsx:412`). */}
              <div style={{
                position: 'absolute', left: 8, top: 0, bottom: 0,
                width: 1, background: 'var(--border)',
              }} />
              <div className="v2-col-gap" style={{ gap: 12 }}>
                {gefiltert.map(z => (
                  <div key={z.id} style={{ position: 'relative' }}>
                    <div style={{
                      position: 'absolute', left: -24, top: 8,
                      width: 16, height: 16, borderRadius: 999,
                      background: 'var(--bg)',
                      border: '2px solid var(--acc-medic)',
                      display: 'grid', placeItems: 'center',
                    }}>
                      <Icon name="medical" className="v2-ic" style={{
                        width: 7, height: 7, color: 'var(--acc-medic)',
                      }} />
                    </div>
                    <div style={{
                      padding: 12, background: 'var(--bg-elev)',
                      border: '1px solid var(--border)', borderRadius: 6,
                    }}>
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4,
                      }}>
                        <span className="v2-num v2-dim" style={{ fontSize: 10 }}>
                          {tagText(z.datum)}
                        </span>
                        <Pill>{ART_LABEL[z.art] ?? z.art}</Pill>
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 3 }}>
                        {z.titel}
                      </div>
                      {z.details && (
                        <div className="v2-muted" style={{ fontSize: 12, lineHeight: 1.5 }}>
                          {z.details}
                        </div>
                      )}
                      {/* E-74: die Herkunft an JEDER Zeile. */}
                      <Herkunft art={z.herkunftArt} wer={z.herkunftWer}
                                wann={z.herkunftWann} beleg={z.belegId} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>

        {/* ══ Ereignis erfassen ═══════════════════════════════════ */}
        <Card title="Ereignis erfassen"
              sub="was ein Arzt festgestellt hat — mit Herkunft">
          <div className="v2-col-gap" style={{ gap: 6 }}>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <select aria-label="Art" value={eArt} className="v2-feld"
                      onChange={e => setEArt(e.target.value)}
                      style={{ flex: 1, minWidth: 130 }}>
                {ARTEN.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
              </select>
              <input aria-label="Datum" type="date" value={eDatum}
                     onChange={e => setEDatum(e.target.value)}
                     className="v2-feld" style={{ flex: 1, minWidth: 140 }} />
            </div>
            <input aria-label="Titel" value={eTitel}
                   onChange={e => setETitel(e.target.value)}
                   placeholder="Was wurde festgestellt?"
                   className="v2-feld" />
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <input aria-label="Wer" value={eWer}
                     onChange={e => setEWer(e.target.value)}
                     placeholder="Wer? z. B. Dr. Meier, Kantonsspital"
                     className="v2-feld" style={{ flex: 2, minWidth: 180 }} />
              <select aria-label="Herkunft" value={eHerkunft} className="v2-feld"
                      onChange={e => setEHerkunft(e.target.value)}
                      style={{ flex: 1, minWidth: 150 }}>
                {HERKUNFT.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
              </select>
              <button type="button" className="v2-btn v2-btn-sm"
                      disabled={laeuft || !eTitel.trim() || !eWer.trim() || !eDatum}
                      onClick={() => void tue(() => ereignisAnlegen({
                        art: eArt, datum: eDatum, titel: eTitel,
                        herkunftArt: eHerkunft, herkunftWer: eWer,
                      })).then(() => { setETitel(''); setEWer('') })}>
                Erfassen
              </button>
            </div>
            {/* `[read]` **Der Urheber ist Pflicht** — E-74: ohne ihn
                waere der Eintrag eine Behauptung. */}
            <div className="v2-dim" style={{ fontSize: 10.5 }}>
              LumeOS stellt keine Diagnose — es hält fest, was jemand
              festgestellt hat. Deshalb ist „Wer?&ldquo; ein Pflichtfeld.
            </div>
          </div>
        </Card>
      </div>

      <div className="v2-col-gap" style={{ gap: 14 }}>
        {/* ══ Termine ═════════════════════════════════════════════ */}
        <Card title="Termine"
              sub={stand.termine.length > 0
                ? `${stand.termine.length} erfasst`
                : 'appointments'}>
          {stand.termine.length === 0 && (
            <div className="v2-dim" style={{ fontSize: 11.5, lineHeight: 1.5 }}>
              Kein Termin in <span className="v2-mono">appointments</span>.
              Arzt, Labor und Nachsorge lassen sich hier festhalten.
            </div>
          )}
          <div className="v2-col-gap" style={{ gap: 6 }}>
            {stand.termine.map(t => (
              <div key={t.id} style={{
                padding: 9, borderRadius: 6, background: 'var(--surface)',
                border: '1px solid var(--border)',
                opacity: t.status === 'cancelled' ? 0.55 : 1,
              }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap',
                }}>
                  <span className="v2-num v2-dim" style={{ fontSize: 10 }}>
                    {tagText(t.beginn)}
                  </span>
                  <span style={{
                    fontSize: 12, fontWeight: 500, flex: 1, minWidth: 0,
                    textDecoration: t.status === 'cancelled' ? 'line-through' : 'none',
                  }}>
                    {t.titel ?? TERMINARTEN.find(([k]) => k === t.art)?.[1] ?? t.art}
                  </span>
                  <Pill variant={t.status === 'cancelled' ? undefined : 'acc'}>
                    {t.status}
                  </Pill>
                </div>
                {t.status !== 'cancelled' && (
                  <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                    <button type="button" className="v2-btn v2-btn-ghost v2-btn-sm"
                            disabled={laeuft}
                            onClick={() => void tue(
                              () => terminAendern(t.id, { status: 'completed' }))}>
                      Erledigt
                    </button>
                    <button type="button" className="v2-btn v2-btn-ghost v2-btn-sm"
                            disabled={laeuft}
                            onClick={() => void tue(
                              () => terminAendern(t.id, { status: 'cancelled' }))}>
                      Absagen
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="v2-divider" />
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <select aria-label="Terminart" value={tArt} className="v2-feld"
                    onChange={e => setTArt(e.target.value)}
                    style={{ flex: 1, minWidth: 110 }}>
              {TERMINARTEN.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
            </select>
            <input aria-label="Zeitpunkt" type="datetime-local" value={tBeginn}
                   onChange={e => setTBeginn(e.target.value)}
                   className="v2-feld" style={{ flex: 1, minWidth: 170 }} />
            <input aria-label="Titel des Termins" value={tTitel}
                   onChange={e => setTTitel(e.target.value)}
                   placeholder="Titel" className="v2-feld"
                   style={{ flex: 1, minWidth: 120 }} />
            <button type="button" className="v2-btn v2-btn-sm"
                    disabled={laeuft || !tBeginn}
                    onClick={() => void tue(() => terminAnlegen({
                      art: tArt, beginn: tBeginn, titel: tTitel,
                    })).then(() => { setTTitel(''); setTBeginn('') })}>
              Termin anlegen
            </button>
          </div>
        </Card>

        {/* ══ Dokumente ═══════════════════════════════════════════ */}
        <Card title="Dokumente"
              sub={stand.dokumente.length > 0
                ? `${stand.dokumente.filter(d => d.pfad).length} von `
                  + `${stand.dokumente.length} mit Datei`
                : 'lab_reports'}>
          {stand.dokumente.length === 0 && (
            <div className="v2-dim" style={{ fontSize: 11.5, lineHeight: 1.5 }}>
              Kein Befund in <span className="v2-mono">lab_reports</span>.
              Originale lassen sich einem Befund zuordnen, sobald einer
              da ist.
            </div>
          )}
          <div className="v2-col-gap" style={{ gap: 6 }}>
            {stand.dokumente.map(d => (
              <div key={d.id} style={{
                padding: 9, borderRadius: 6, background: 'var(--surface)',
                border: '1px solid var(--border)',
              }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap',
                }}>
                  <span className="v2-num v2-dim" style={{ fontSize: 10 }}>
                    {tagText(d.datum)}
                  </span>
                  <span style={{ fontSize: 12, flex: 1, minWidth: 0 }}>
                    {d.titel ?? d.labor ?? 'Befund'}
                  </span>
                  {d.pfad
                    ? (
                      <button type="button" className="v2-btn v2-btn-sm"
                              disabled={laeuft}
                              onClick={() => void (async () => {
                                const a = await originalOeffnen(d.pfad!)
                                if (a.ok && a.url) window.open(a.url, '_blank')
                                else setMeldung(a.fehler ?? 'Kein Zugriff.')
                              })()}>
                        Öffnen
                      </button>
                    )
                    : (
                      <label className="v2-btn v2-btn-ghost v2-btn-sm"
                             style={{ cursor: 'pointer' }}>
                        Datei wählen
                        <input type="file" hidden
                               aria-label={`Original für ${d.titel ?? d.datum}`}
                               onChange={e => {
                                 const f = e.target.files?.[0]
                                 if (!f) return
                                 const fd = new FormData()
                                 fd.set('berichtId', d.id)
                                 fd.set('datei', f)
                                 void tue(() => originalHochladen(fd))
                               }} />
                      </label>
                    )}
                </div>
                {d.pfad && (
                  // `[cmd]` **E-75: `file_ref` traegt den PFAD** — die
                  // URL entsteht erst beim Klick und laeuft ab.
                  <div className="v2-dim v2-mono" style={{ fontSize: 9.5, marginTop: 4 }}>
                    {d.pfad}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>

        {meldung && (
          <div className="v2-insight v2-neg">
            <div className="v2-insight-mark" />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="v2-insight-body">{meldung}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
