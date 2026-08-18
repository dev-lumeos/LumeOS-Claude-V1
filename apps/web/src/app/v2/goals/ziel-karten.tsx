'use client'

// Die Zielkarten und die Meilensteine — **echte Werte.**
//
// FORM: `theme-v1/module-goals.jsx:257-313` (`GoalCard`) — Symbolfeld,
// Typzeile, Titel, `current → target`, Fortschrittsbalken, Frist.
// INHALT: `goals.user_goals` mit `goals.goal_progress_at`, dazu
// `goals.goal_milestones` mit `goals.goal_milestone_status`.
//
// **DIE ÜBERSICHT ZEIGT, SIE ERFASST NICHT.** `[read]` Der
// Umsetzungsplan: *„Goals ist der Massstab, an dem Buddy misst — keine
// eigenständige Dateneingabe."* Diese Datei hat deshalb keinen
// Schreibpfad und kein Eingabefeld.
//
// **KEINE BEWERTUNG.** `[read]` *„Ob jemand sein Ziel ‚gut' verfolgt,
// ist eine Aussage über einen Menschen."* Die Attrappe führt dafür
// `pace: 'ahead' | 'on-track' | 'behind'` — drei Urteile über die
// Person. `[cmd]` **Die Datenbank führt so etwas nicht**, und hier wird
// es nicht erfunden: gezeigt werden Fortschritt in Prozent (gerechnet),
// die Frist (ein Datum) und `progress_status` (die Auskunft der
// Funktion darüber, ob sie rechnen konnte).
import * as React from 'react'
import { Card, Icon, Pill, Row } from '@lumeos/ui'

import type { Meilenstein, ZielFortschritt } from '../../../lib/goals/lesen'

/**
 * Was `progress_status` sagt — die Funktion über sich selbst, nicht
 * über die Nutzerin.
 *
 * `[cmd]` `not_implemented_workout_sets` steht heute am Kraftziel
 * „Bankdruecken stabilisieren": `goal_progress_at` kann es nicht
 * rechnen, weil Sätze aus `training` nicht verknüpft sind. **Das wird
 * gezeigt, nicht kaschiert** — eine leere Prozentzahl ohne Grund sähe
 * aus wie ein Fehler.
 */
const STATUS_TEXT: Record<string, string> = {
  measured: 'aus Messwerten gerechnet',
  not_implemented_workout_sets: 'Kraftziele brauchen Saetze aus training — nicht angebunden',
  no_measurement: 'keine Messung im Zeitraum',
  no_start_value: 'kein Startwert hinterlegt',
}

const MEILENSTEIN_TEXT: Record<string, string> = {
  open: 'offen',
  achieved: 'erreicht',
  missed: 'verfehlt',
}

/** `[cmd]` Lagefarben, keine Wertung: erreicht/offen/verfehlt sind Zustaende. */
const MEILENSTEIN_VARIANTE: Record<string, 'pos' | 'warn' | undefined> = {
  achieved: 'pos',
  missed: 'warn',
  open: undefined,
}

function z(n: number | null | undefined, stellen = 1): string {
  return n == null ? '—' : n.toFixed(stellen)
}

/** Tage bis zur Frist, gegen den echten Stichtag. */
function bisFrist(frist: string | null, stichtag: string): string {
  if (!frist) return '—'
  const a = new Date(`${stichtag}T12:00:00`)
  const b = new Date(`${frist}T12:00:00`)
  if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime())) return '—'
  const tage = Math.round((b.getTime() - a.getTime()) / 86400000)
  if (tage === 0) return 'heute'
  return tage > 0 ? `noch ${tage} Tage` : `${Math.abs(tage)} Tage vorbei`
}

function ZielKarte({ g, stichtag }: { g: ZielFortschritt; stichtag: string }) {
  const farbe = 'var(--acc-goals)'
  const pct = g.progress_pct
  const gerechnet = g.progress_status === 'measured'

  return (
    <Card>
      <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
        <div style={{
          width: 40, height: 40, borderRadius: 8,
          background: `color-mix(in oklch, ${farbe} 16%, transparent)`,
          border: `1px solid color-mix(in oklch, ${farbe} 32%, var(--border))`,
          color: farbe, display: 'grid', placeItems: 'center', flexShrink: 0,
        }}>
          <Icon name="goals" className="v2-ic v2-ic-lg" />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap',
          }}>
            <span style={{
              fontSize: 11, color: 'var(--fg-dim)', fontFamily: 'var(--font-mono)',
              letterSpacing: '0.06em', textTransform: 'uppercase',
            }}>
              {(g.goal_type ?? '').replace(/_/g, ' ')}
            </span>
            {g.is_primary && <Pill variant="acc">primaer</Pill>}
            {g.status && g.status !== 'active' && <Pill>{g.status}</Pill>}
            <span className="v2-dim v2-mono" style={{ marginLeft: 'auto', fontSize: 10 }}>
              {`Frist ${g.target_date ?? '—'} · ${bisFrist(g.target_date, stichtag)}`}
            </span>
          </div>

          <div style={{
            fontSize: 15, fontWeight: 600, letterSpacing: '-0.01em', marginBottom: 8,
          }}>{g.title}</div>

          <div style={{
            display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 8,
            fontSize: 12, flexWrap: 'wrap',
          }}>
            <span>
              <span className="v2-dim">aktuell </span>
              <span className="v2-num" style={{ color: 'var(--fg)', fontWeight: 500 }}>
                {g.current_value != null ? `${z(g.current_value, 2)} ${g.target_unit ?? ''}` : '—'}
              </span>
            </span>
            <span className="v2-dim">→</span>
            <span>
              <span className="v2-dim">Ziel </span>
              <span className="v2-num" style={{ color: farbe, fontWeight: 500 }}>
                {g.target_value != null ? `${z(g.target_value, 2)} ${g.target_unit ?? ''}` : '—'}
              </span>
            </span>
            {g.start_value != null && (
              <span className="v2-dim v2-mono" style={{ fontSize: 10.5 }}>
                {`Start ${z(g.start_value, 2)}`}
              </span>
            )}
          </div>

          {/* Der Balken nur, wenn die Funktion rechnen konnte. Ein
              Balken bei 0 % ohne Grund saehe aus wie Stillstand. */}
          {gerechnet && pct != null ? (
            <>
              <div style={{
                height: 6, borderRadius: 3, background: 'var(--surface-2)',
                overflow: 'hidden', marginBottom: 4,
              }}>
                <div style={{
                  width: `${Math.max(0, Math.min(100, pct))}%`, height: '100%',
                  background: farbe,
                }} />
              </div>
              <div className="v2-dim v2-mono" style={{ fontSize: 10 }}>
                {`${pct.toFixed(1)} % · ${g.current_source ?? '—'}`}
                {g.measured_at ? ` · gemessen ${g.measured_at}` : ''}
              </div>
            </>
          ) : (
            <div className="v2-muted" style={{ fontSize: 11, lineHeight: 1.45 }}>
              {STATUS_TEXT[g.progress_status ?? ''] ?? g.progress_status ?? 'kein Fortschritt gerechnet'}
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}

export function ZielKarten({ ziele, meilensteine, stichtag }: {
  ziele: ZielFortschritt[]
  meilensteine: Meilenstein[]
  stichtag: string
}) {
  const abweichend = meilensteine.filter(
    m => m.stored_status && m.computed_status && m.stored_status !== m.computed_status)

  return (
    <div className="v2-grid-15">
      <div className="v2-col-gap" style={{ gap: 14 }}>
        {ziele.length === 0 ? (
          <Card title="Ziele">
            <div style={{ padding: '24px 8px', textAlign: 'center' }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>
                Noch keine Ziele
              </div>
              <div className="v2-dim" style={{ fontSize: 11.5 }}>
                Sobald ein Ziel angelegt ist, steht es hier mit seinem Verlauf.
              </div>
            </div>
          </Card>
        ) : (
          ziele.map(g => <ZielKarte key={g.goal_id} g={g} stichtag={stichtag} />)
        )}
      </div>

      <div className="v2-col-gap" style={{ gap: 14 }}>
        <Card
          title="Meilensteine"
          sub={`${meilensteine.length} · Stand ${stichtag}`}
        >
          {meilensteine.length === 0 ? (
            <div className="v2-dim" style={{ fontSize: 11.5, padding: '10px 0' }}>
              Keine Meilensteine hinterlegt.
            </div>
          ) : (
            <div className="v2-col-gap" style={{ gap: 6 }}>
              {meilensteine.map(m => (
                <div key={m.milestone_id} style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px',
                  background: 'var(--bg-elev)', border: '1px solid var(--border)',
                  borderRadius: 5,
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 500 }}>{m.title}</div>
                    <div className="v2-dim v2-mono" style={{ fontSize: 10 }}>
                      {`Ziel ${z(m.target_value, 1)} ${m.target_unit ?? ''}`}
                      {m.current_value != null ? ` · aktuell ${z(m.current_value, 2)}` : ''}
                      {m.target_date ? ` · bis ${m.target_date}` : ''}
                    </div>
                  </div>
                  <Pill variant={MEILENSTEIN_VARIANTE[m.computed_status ?? 'open']}>
                    {MEILENSTEIN_TEXT[m.computed_status ?? ''] ?? m.computed_status ?? '—'}
                  </Pill>
                </div>
              ))}
            </div>
          )}

          {/* `[read]` GO-11: „verfehlter Meilenstein verschwindet nicht."
              Und wenn gespeicherter und gerechneter Stand auseinander-
              laufen, IST die Abweichung die Aussage. */}
          {abweichend.length > 0 && (
            <>
              <div className="v2-divider" />
              <div className="v2-muted" style={{ fontSize: 11, lineHeight: 1.5 }}>
                {`${abweichend.length} Meilenstein(e) tragen einen anderen gespeicherten `}
                {'Stand als den gerechneten. Gezeigt ist der gerechnete — er folgt den Messwerten.'}
              </div>
            </>
          )}
        </Card>

        <Card title="Fortschritt · Herkunft" sub="woher die Zahlen kommen">
          {ziele.map(g => (
            <Row
              key={g.goal_id}
              label={g.title}
              value={g.progress_status === 'measured'
                ? `${z(g.progress_pct, 1)} % · ${g.current_source ?? '—'}`
                : (STATUS_TEXT[g.progress_status ?? ''] ?? '—')}
            />
          ))}
          <div className="v2-divider" />
          <div className="v2-dim" style={{ fontSize: 10.5, lineHeight: 1.45 }}>
            Gerechnet von goals.goal_progress_at gegen die juengste Messung —
            nicht die gespeicherte Spalte user_goals.progress_pct, die ein
            aelterer Stand sein kann.
          </div>
        </Card>
      </div>
    </div>
  )
}
