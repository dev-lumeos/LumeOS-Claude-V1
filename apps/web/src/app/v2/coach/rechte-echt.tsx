'use client'

// Die echten Kacheln fuer Rechte, Autonomy und beide Historien (G-90).
//
// **DIE ZWEI ACHSEN SIND GETRENNT — und die Oberflaeche sagt es.**
//
// `[read]` Tom, 2026-08-19: *„In Permissions setzt der User, was der
// Coach sehen darf und wie autonom es sein soll. Unter Autonomy setzt
// der Coach den Level seines Users. Das sind zwei verschiedene
// Sachen."*
//
// `[cmd]` **Durchgesetzt wird es im Schema, nicht hier:**
// `client_permissions` nimmt Schreibzugriffe nur von `client_id`,
// `client_autonomy` nur von `coach_id`
// (`150_coach_permissions_autonomy.sql`). **Die Oberflaeche macht die
// Trennung sichtbar** — Rechte mit Bedienelementen, Autonomy als
// Anzeige mit dem Hinweis, wer sie setzt.
//
// `[read]` **Der Prüfstein aus der Recherche (F-04):** *„Der Klient
// hatte keine Stimme"*, *„RLS war Attrappe"*, *„kein Mechanismus, der
// eine neue Antwort zwang, die alte abzuloesen"*. Alle drei sind hier
// beantwortet: der Klient setzt selbst, die Zeilenrechte sind echt und
// gemessen, und die Historie kommt aus einem Trigger, den man nicht
// umgehen kann.
import * as React from 'react'
import { Card, Pill, Empty, Icon } from '@lumeos/ui'

import {
  MODULE, SICHT, SICHT_TEXT, SICHT_FARBE, MODUL_LABEL, HEIKEL,
  STUFEN, stufeName, feldLabel, feldWert,
  type Modul, type Sicht,
} from '../../../lib/coach/rechte-modell'
import type {
  CoachRechteStand, Logzeile, Rechtezeile, WartendeAktion,
} from '../../../lib/coach/rechte-read'
import { setzeRecht, entscheideAktion } from '../../../lib/coach/rechte-schreiben'

/**
 * Der Hinweis, der erklaert, warum nichts dasteht.
 *
 * `[read]` **Leerzustand ist nicht Attrappe** (Muster G-65). Eine
 * Attrappe zeigt erfundene Zahlen; ein Leerzustand zeigt keine und
 * sagt, woran es liegt. Der Unterschied ist fuer den Leser der
 * wichtigste im ganzen Modul.
 */
function Hinweis({ fehler }: { fehler: string | null }) {
  if (!fehler) return null
  const nichtFreigegeben = /invalid schema/i.test(fehler)
  return (
    <div style={{
      display: 'flex', gap: 10, padding: 12, marginBottom: 14,
      background: 'color-mix(in oklch, var(--warn) 6%, var(--surface))',
      border: '1px solid color-mix(in oklch, var(--warn) 28%, var(--border))',
      borderRadius: 6,
    }}>
      <Icon name="alert" className="v2-ic v2-ic-sm"
            style={{ color: 'var(--warn)', flexShrink: 0, marginTop: 1 }} />
      <div style={{ fontSize: 11.5, lineHeight: 1.55 }}>
        {nichtFreigegeben ? (
          <>
            <strong>Die Tabellen sind da, aber nicht erreichbar.</strong>{' '}
            Das Schema <span className="v2-mono">coach</span> ist für die
            Datenschnittstelle nicht freigegeben — die sechs Tabellen aus
            C-119 existieren, PostgREST kennt sie nicht.{' '}
            <span className="v2-dim">Meldung: {fehler}</span>
          </>
        ) : (
          <><strong>Nicht geladen.</strong> <span className="v2-dim">{fehler}</span></>
        )}
      </div>
    </div>
  )
}

// ═══ RECHTE ══════════════════════════════════════════════════════

/**
 * Die Rechtematrix — **was der Nutzer setzen kann.**
 *
 * Je Modul zwei Dinge, wie das Schema sie fuehrt: die Sichtstufe
 * (`*_visibility`, drei Werte) und ob der Coach ohne Bestaetigung
 * aendern darf (`*_auto_apply`, ja/nein).
 */
export function RechteEcht({ stand }: { stand: CoachRechteStand }) {
  const [meldung, setMeldung] = React.useState<string | null>(null)
  const [laeuft, setLaeuft] = React.useState<string | null>(null)

  async function aendern(
    coachId: string, modul: Modul,
    feld: { sicht?: Sicht; autoAendern?: boolean },
  ) {
    setLaeuft(`${coachId}:${modul}`)
    setMeldung(null)
    const r = await setzeRecht({ coachId, modul, ...feld })
    setLaeuft(null)
    if (!r.ok) setMeldung(r.fehler)
  }

  if (stand.rechte.length === 0) {
    return (
      <>
        <Hinweis fehler={stand.fehler} />
        <Card
          title="Coach-Rechte"
          sub="Sichtbarkeit und Änderungsrecht je Modul — gesetzt vom Klienten"
        >
          <Empty
            title="Noch kein Coach freigeschaltet"
            sub={stand.fehler
              ? 'Sobald das Schema erreichbar ist, stehen hier die Freigaben je Coach.'
              : 'Sobald ein Coach verknüpft ist, wird hier je Modul freigegeben.'}
            icon="admin"
          />
          <div className="v2-divider" />
          <ModellErklaerung />
        </Card>
      </>
    )
  }

  return (
    <div className="v2-col-gap" style={{ gap: 14 }}>
      <Hinweis fehler={stand.fehler} />
      {meldung && (
        <div style={{
          padding: 10, borderRadius: 6, fontSize: 11.5,
          background: 'color-mix(in oklch, var(--neg) 7%, var(--surface))',
          border: '1px solid color-mix(in oklch, var(--neg) 30%, var(--border))',
        }}>{meldung}</div>
      )}

      {stand.rechte.map(r => (
        <Card
          key={r.id}
          title={`Coach ${r.coach_id.slice(0, 8)}`}
          sub={`zuletzt geändert ${r.updated_at.slice(0, 16).replace('T', ' ')}`}
        >
          <div className="v2-tbl-wrap">
            <table className="v2-tbl">
              <thead>
                <tr>
                  <th style={{ width: 210 }}>Modul</th>
                  <th style={{ width: 150 }}>Sicht</th>
                  <th style={{ width: 130 }}>ohne Bestätigung</th>
                  <th>Was das heißt</th>
                </tr>
              </thead>
              <tbody>
                {MODULE.map(m => {
                  const sicht = r.sicht[m]
                  const auto = r.autoAendern[m]
                  const busy = laeuft === `${r.coach_id}:${m}`
                  return (
                    <tr key={m}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontSize: 12.5 }}>{MODUL_LABEL[m]}</span>
                          {HEIKEL[m] && (
                            <Pill style={{
                              fontSize: 9, color: 'var(--warn)',
                              borderColor: 'color-mix(in oklch, var(--warn) 30%, var(--border))',
                            }}>heikel</Pill>
                          )}
                        </div>
                        {HEIKEL[m] && (
                          <div className="v2-dim" style={{ fontSize: 10, marginTop: 2 }}>
                            {HEIKEL[m]}
                          </div>
                        )}
                      </td>
                      <td>
                        <select
                          value={sicht}
                          disabled={busy}
                          aria-label={`${MODUL_LABEL[m]} · Sicht`}
                          onChange={e => aendern(r.coach_id, m, { sicht: e.target.value as Sicht })}
                          style={{
                            width: '100%', height: 24, fontSize: 11, padding: '0 6px',
                            borderRadius: 5, background: 'var(--surface)',
                            border: `1px solid ${sicht === 'none' ? 'var(--border)'
                              : `color-mix(in oklch, ${SICHT_FARBE[sicht]} 35%, var(--border))`}`,
                            color: SICHT_FARBE[sicht], fontFamily: 'var(--font-mono)',
                          }}
                        >
                          {SICHT.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                      <td>
                        {/* `[read]` Das ist Toms zweite Haelfte: „und ob
                            er ohne Bestaetigung aendern darf". Bei
                            `none` waere es sinnlos — der Coach sieht
                            das Modul gar nicht. */}
                        <label style={{
                          display: 'flex', alignItems: 'center', gap: 6,
                          fontSize: 11, cursor: sicht === 'none' ? 'not-allowed' : 'pointer',
                          opacity: sicht === 'none' ? 0.4 : 1,
                        }}>
                          <input
                            type="checkbox"
                            checked={auto}
                            disabled={busy || sicht === 'none'}
                            aria-label={`${MODUL_LABEL[m]} · ohne Bestätigung ändern`}
                            onChange={e => aendern(r.coach_id, m, { autoAendern: e.target.checked })}
                          />
                          <span className="v2-mono">{auto ? 'ja' : 'nein'}</span>
                        </label>
                      </td>
                      <td className="v2-muted" style={{ fontSize: 11, lineHeight: 1.45 }}>
                        {SICHT_TEXT[sicht]}
                        {auto && sicht !== 'none' && (
                          <> <strong>Änderungen greifen ohne Rückfrage.</strong></>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          {r.expires_at && (
            <div className="v2-dim v2-mono" style={{ fontSize: 10, marginTop: 8 }}>
              {`läuft ab ${r.expires_at.slice(0, 10)}`}
            </div>
          )}
          <div className="v2-divider" />
          <div className="v2-dim" style={{ fontSize: 10.5, lineHeight: 1.5 }}>
            Jede Änderung schreibt eine Zeile in die Historie — das erledigt
            ein Trigger der Datenbank, nicht die Oberfläche.
          </div>
        </Card>
      ))}
    </div>
  )
}

/** Warum die zwei Achsen getrennt sind — einmal ausgeschrieben. */
function ModellErklaerung() {
  return (
    <div style={{ display: 'grid', gap: 10 }}>
      <div style={{ fontSize: 11.5, lineHeight: 1.6 }}>
        <strong>Zwei Achsen, zwei Zuständigkeiten.</strong>
      </div>
      <div style={{
        display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: 10,
      }}>
        <div style={{
          padding: 10, borderRadius: 6, background: 'var(--bg-elev)',
          border: '1px solid var(--border)',
        }}>
          <div className="v2-eyebrow" style={{ marginBottom: 4 }}>Rechte</div>
          <div style={{ fontSize: 11.5, lineHeight: 1.5 }}>
            <strong>Der Klient setzt.</strong> Was ein Coach sehen darf, und ob
            er ohne Bestätigung ändern darf — je Modul.
          </div>
        </div>
        <div style={{
          padding: 10, borderRadius: 6, background: 'var(--bg-elev)',
          border: '1px solid var(--border)',
        }}>
          <div className="v2-eyebrow" style={{ marginBottom: 4 }}>Autonomy</div>
          <div style={{ fontSize: 11.5, lineHeight: 1.5 }}>
            <strong>Der Coach setzt.</strong> Den Reifegrad seines Athleten,
            fünf Stufen — eine Einschätzung, kein Recht.
          </div>
        </div>
      </div>
      <div className="v2-dim" style={{ fontSize: 10.5, lineHeight: 1.5 }}>
        Die Trennung steht in der Datenbank, nicht nur hier: Rechte nehmen
        Schreibzugriffe nur vom Klienten an, Autonomy nur vom Coach.
      </div>
    </div>
  )
}

// ═══ HISTORIE ════════════════════════════════════════════════════

/**
 * Die Aenderungshistorie — **append-only, aus einem Trigger.**
 *
 * `[read]` Der Auftrag nennt den Grund: *„Wer eine Freigabe
 * zurücknimmt, muss sehen können, dass es geschehen ist."* Genau das
 * fehlte dem Vorgaenger — die Recherche haelt fest, dass Rechte dort
 * *„in place ueberschrieben"* wurden und das dokumentierte
 * `coach_client_autonomy_log` **nie eine Migration bekam.**
 */
export function HistorieEcht({
  titel, zeilen, leerText,
}: {
  titel: string
  zeilen: Logzeile[]
  leerText: string
}) {
  if (zeilen.length === 0) {
    return (
      <Card title={titel} sub="append-only · jede Änderung mit Alt- und Neuwert">
        <Empty title="Noch keine Änderung" sub={leerText} icon="history" />
      </Card>
    )
  }
  return (
    <Card title={titel} sub={`${zeilen.length} Einträge · append-only`}>
      <div className="v2-tbl-wrap">
        <table className="v2-tbl">
          <thead>
            <tr>
              <th style={{ width: 140 }}>Wann</th>
              <th style={{ width: 80 }}>Art</th>
              <th>Was sich geändert hat</th>
            </tr>
          </thead>
          <tbody>
            {zeilen.map(z => (
              <tr key={z.id}>
                <td className="v2-num v2-muted" style={{ fontSize: 11 }}>
                  {z.changed_at.slice(0, 16).replace('T', ' ')}
                </td>
                <td>
                  <Pill variant={z.change_kind === 'delete' ? 'neg'
                    : z.change_kind === 'insert' ? 'pos' : undefined}>
                    {z.change_kind}
                  </Pill>
                </td>
                <td>
                  {z.felder.length === 0 ? (
                    <span className="v2-dim" style={{ fontSize: 11 }}>
                      keine inhaltliche Änderung
                    </span>
                  ) : (
                    <div className="v2-col-gap" style={{ gap: 3 }}>
                      {z.felder.map(f => (
                        <div key={f.feld} style={{ fontSize: 11 }}>
                          <span style={{ color: 'var(--fg-muted)' }}>{feldLabel(f.feld)}</span>
                          <span className="v2-mono">
                            {'  '}{feldWert(f.feld, f.alt)}
                            <span className="v2-dim"> → </span>
                            {feldWert(f.feld, f.neu)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

// ═══ AUTONOMY ════════════════════════════════════════════════════

/**
 * Die Autonomy-Stufen — **Anzeige, nicht Bedienung.**
 *
 * `[cmd]` Der Auftrag sperrt beides ausdruecklich: keine
 * Autonomy-Wirkung, und gesetzt wird sie ohnehin vom Coach auf seiner
 * Plattform. **Hier stehen die Stufen und wer sie gesetzt hat.**
 *
 * `[cmd]` **Nicht mit `experience_level` verwechseln** — der steht
 * seit C-140 in `profiles` und ist Selbstauskunft. Autonomy ist
 * Fremdeinschaetzung durch den Coach. Der Hinweis steht in der
 * Kachel, weil die zwei sonst verwechselt werden.
 */
export function AutonomieEcht({ stand }: { stand: CoachRechteStand }) {
  if (stand.autonomie.length === 0) {
    return (
      <>
        <Hinweis fehler={stand.fehler} />
        <Card title="Autonomy" sub="vom Coach gesetzt · fünf Stufen je Modul">
          <Empty
            title="Noch keine Einstufung"
            sub={stand.fehler
              ? 'Sobald das Schema erreichbar ist, steht hier die Einstufung des Coaches.'
              : 'Dein Coach hat noch keine Stufe gesetzt.'}
            icon="trend_up"
          />
          <div className="v2-divider" />
          <StufenLeiter />
        </Card>
      </>
    )
  }

  return (
    <div className="v2-col-gap" style={{ gap: 14 }}>
      <Hinweis fehler={stand.fehler} />
      {stand.autonomie.map(a => (
        <Card
          key={a.id}
          title={`Einstufung durch Coach ${a.coach_id.slice(0, 8)}`}
          sub={`zuletzt geändert ${a.updated_at.slice(0, 16).replace('T', ' ')}`}
        >
          <div className="v2-col-gap" style={{ gap: 6 }}>
            {MODULE.map(m => {
              const n = a.level[m]
              return (
                <div key={m} style={{
                  display: 'grid', gridTemplateColumns: '130px 1fr 150px',
                  gap: 10, alignItems: 'center', fontSize: 11.5,
                }}>
                  <span style={{ color: 'var(--fg-muted)' }}>{MODUL_LABEL[m]}</span>
                  <div style={{ display: 'flex', gap: 3 }}>
                    {[1, 2, 3, 4, 5].map(s => (
                      <div key={s} style={{
                        flex: 1, height: 8, borderRadius: 2,
                        background: s <= n ? 'var(--acc-coach)' : 'var(--surface-2)',
                        opacity: s <= n ? 0.85 : 1,
                      }} />
                    ))}
                  </div>
                  <span className="v2-mono" style={{ fontSize: 10.5 }}>
                    {n} · {stufeName(n)}
                  </span>
                </div>
              )
            })}
          </div>
          <div className="v2-divider" />
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', fontSize: 11 }}>
            <span className="v2-muted">
              Sicherheitsstufe <span className="v2-num">{a.safety_level}</span>
              <span className="v2-dim"> von 3</span>
            </span>
          </div>
          {a.coach_note && (
            <div style={{ marginTop: 8, fontSize: 11.5, lineHeight: 1.5 }}>
              <span className="v2-eyebrow">Notiz des Coaches</span>
              <div style={{ marginTop: 3 }}>{a.coach_note}</div>
            </div>
          )}
          <div className="v2-divider" />
          <StufenLeiter />
        </Card>
      ))}
    </div>
  )
}

function StufenLeiter() {
  return (
    <>
      <div className="v2-eyebrow" style={{ marginBottom: 6 }}>Die fünf Stufen</div>
      <div className="v2-col-gap" style={{ gap: 4 }}>
        {STUFEN.map(s => (
          <div key={s.stufe} style={{
            display: 'grid', gridTemplateColumns: '26px 110px 1fr',
            gap: 8, fontSize: 11, alignItems: 'baseline',
          }}>
            <span className="v2-num" style={{ color: 'var(--acc-coach)' }}>{s.stufe}</span>
            <span style={{ fontWeight: 500 }}>{s.name}</span>
            <span className="v2-muted">{s.text}</span>
          </div>
        ))}
      </div>
      <div className="v2-divider" />
      <div className="v2-dim" style={{ fontSize: 10.5, lineHeight: 1.5 }}>
        <strong>Der Coach setzt diese Stufe, nicht du</strong> — sie beschreibt
        seine Einschätzung deiner Selbständigkeit. Sie ist etwas anderes als
        der Erfahrungsgrad in den Einstellungen, den du selbst angibst.
        Eine Wirkung im Produkt hat sie heute nicht.
      </div>
    </>
  )
}

// ═══ WARTENDE AKTIONEN ═══════════════════════════════════════════

/**
 * Was auf Bestaetigung wartet — **Toms *„mit Bestaetigung des
 * Users"***.
 *
 * `[cmd]` Die Tabelle traegt Vorschau (`preview`), 10-Minuten-Verfall
 * (`expires_at`) und `confirmed_at`/`confirmed_by`. **Gebaut ist der
 * Zustandswechsel, nicht die Ausfuehrung** — was fehlt, steht im
 * Bericht.
 */
export function WartendEcht({ stand }: { stand: CoachRechteStand }) {
  const [meldung, setMeldung] = React.useState<string | null>(null)
  const [laeuft, setLaeuft] = React.useState<string | null>(null)

  const offen = stand.wartend.filter(a => a.status === 'pending')
  const erledigt = stand.wartend.filter(a => a.status !== 'pending')

  async function entscheiden(id: string, w: 'confirmed' | 'rejected') {
    setLaeuft(id); setMeldung(null)
    const r = await entscheideAktion(id, w)
    setLaeuft(null)
    if (!r.ok) setMeldung(r.fehler)
  }

  if (stand.wartend.length === 0) {
    return (
      <>
        <Hinweis fehler={stand.fehler} />
        <Card title="Wartet auf dich" sub="Coach-Vorschläge mit Vorschau und 10-Minuten-Frist">
          <Empty
            title="Nichts offen"
            sub={stand.fehler
              ? 'Sobald das Schema erreichbar ist, stehen hier die Vorschläge.'
              : 'Kein Coach hat etwas vorgeschlagen.'}
            icon="check"
          />
        </Card>
      </>
    )
  }

  return (
    <div className="v2-col-gap" style={{ gap: 14 }}>
      <Hinweis fehler={stand.fehler} />
      {meldung && (
        <div style={{
          padding: 10, borderRadius: 6, fontSize: 11.5,
          background: 'color-mix(in oklch, var(--neg) 7%, var(--surface))',
          border: '1px solid color-mix(in oklch, var(--neg) 30%, var(--border))',
        }}>{meldung}</div>
      )}
      <Card title="Wartet auf dich" sub={`${offen.length} offen · ${erledigt.length} entschieden`}>
        <div className="v2-col-gap" style={{ gap: 8 }}>
          {offen.map(a => (
            <AktionsKarte key={a.id} a={a} laeuft={laeuft === a.id}
                          onEntscheiden={entscheiden} />
          ))}
          {offen.length === 0 && (
            <Empty title="Nichts offen" sub="Alle Vorschläge sind entschieden." icon="check" />
          )}
        </div>
      </Card>
    </div>
  )
}

function AktionsKarte({ a, laeuft, onEntscheiden }: {
  a: WartendeAktion
  laeuft: boolean
  onEntscheiden: (id: string, w: 'confirmed' | 'rejected') => void
}) {
  const abgelaufen = new Date(a.expires_at).getTime() < Date.now()
  return (
    <div style={{
      padding: 12, borderRadius: 6, background: 'var(--surface)',
      border: `1px solid ${abgelaufen ? 'var(--border)'
        : 'color-mix(in oklch, var(--warn) 28%, var(--border))'}`,
      opacity: abgelaufen ? 0.6 : 1,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
        <span style={{ fontSize: 12.5, fontWeight: 600 }}>{a.action_type}</span>
        <Pill>{MODUL_LABEL[a.module as Modul] ?? a.module}</Pill>
        {abgelaufen
          ? <Pill variant="neg">abgelaufen</Pill>
          : <Pill variant="warn">offen</Pill>}
      </div>
      {/* `[read]` Die Vorschau ist der Sinn des Musters: der Nutzer
          sieht, was geschieht, BEVOR es geschieht. */}
      {Object.keys(a.preview).length > 0 && (
        <div className="v2-mono" style={{
          fontSize: 10.5, lineHeight: 1.6, padding: 8, borderRadius: 4,
          background: 'var(--bg-elev)', marginBottom: 8,
        }}>
          {Object.entries(a.preview).map(([k, v]) => (
            <div key={k}>
              <span className="v2-dim">{k}: </span>{String(v)}
            </div>
          ))}
        </div>
      )}
      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <button type="button" className="v2-btn v2-btn-primary v2-btn-sm"
                disabled={laeuft || abgelaufen}
                onClick={() => onEntscheiden(a.id, 'confirmed')}>
          <Icon name="check" className="v2-ic v2-ic-sm" />Bestätigen
        </button>
        <button type="button" className="v2-btn v2-btn-ghost v2-btn-sm"
                disabled={laeuft || abgelaufen}
                onClick={() => onEntscheiden(a.id, 'rejected')}>
          Ablehnen
        </button>
        <div className="v2-spacer" />
        <span className="v2-dim v2-mono" style={{ fontSize: 10 }}>
          {abgelaufen ? 'Frist verstrichen'
            : `gültig bis ${a.expires_at.slice(11, 16)}`}
        </span>
      </div>
    </div>
  )
}
