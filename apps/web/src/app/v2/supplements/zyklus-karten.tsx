'use client'

// Zyklen, Protokolle und die Injektionskonfiguration — G-423.
//
// ══ WAS HIER NEU IST ════════════════════════════════════════════════
//
// `[cmd]` **C-456 und C-455 haben die Tabellen und Funktionen
// gebaut** — und keiner der fuenf Schreibwege hatte einen Aufrufer.
// **Gebaut und unerreichbar**, dieselbe Lage wie das `LogPhotoModal`
// vor G-421.
//
// `[read]` **Die Tabellen sind leer** — deshalb steht ueberall ein
// benannter Leerhinweis statt einer Null (E-72).
import * as React from 'react'
import { Card, Pill, Icon } from '@lumeos/ui'

import {
  zyklusStartenAktion, zyklusStatusAktion, protokollAusVorlageAktion,
  konfigAnlegenAktion, konfigEntfernenAktion,
} from './zyklus-aktionen'
import type { ZyklusStand } from '../../../lib/supplements/zyklus-read'
import type { KonfigurationsStand } from '../../../lib/medical/injektion-read'
// `[read]` **Nur der TYP und die Konstanten** — die Schreibwege
// liegen serverseitig, ein Wert-Import zoege sie ueber die
// `'use client'`-Grenze (die Lehre aus G-412).
import { KOERPERFLAECHEN } from '../../../lib/medical/koerperflaechen'

/** Die drei Zustaende der Vorlage, als Marke. */
const STATUS_TON: Record<string, 'pos' | 'warn' | undefined> = {
  active: 'pos',
  paused: 'warn',
  stopped: undefined,
}

const STATUS_TEXT: Record<string, string> = {
  active: 'läuft',
  paused: 'pausiert',
  stopped: 'beendet',
}

/**
 * Die Zyklen des Nutzers — starten, pausieren, beenden.
 *
 * `[cmd]` **Die drei Zustaende stammen aus dem CHECK** auf
 * `user_supplement_cycles.status`: `active | paused | stopped`.
 */
export function ZyklusKarte({ d, substanzen }: {
  d: ZyklusStand
  /** Die Substanzen des Stacks, aus denen sich ein Zyklus starten laesst. */
  substanzen: Array<{ id: string; name: string }>
}) {
  const [laeuft, setLaeuft] = React.useState<string | null>(null)
  const [fehler, setFehler] = React.useState<string | null>(null)
  const [wahl, setWahl] = React.useState('')

  async function starten() {
    if (!wahl) return
    setLaeuft('start'); setFehler(null)
    const r = await zyklusStartenAktion(wahl)
    setLaeuft(null)
    if (!r.ok) setFehler(r.text)
    else window.location.reload()
  }

  async function setzen(id: string, status: 'active' | 'paused' | 'stopped') {
    setLaeuft(id); setFehler(null)
    const r = await zyklusStatusAktion(id, status)
    setLaeuft(null)
    if (!r.ok) setFehler(r.text)
    else window.location.reload()
  }

  return (
    <Card title="Zyklen" sub={`${d.zyklen.length} · supplements.user_supplement_cycles`}
          actions={(
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <select aria-label="Substanz" value={wahl}
                      onChange={e => setWahl(e.target.value)}
                      className="v2-feld" style={{ height: 24, fontSize: 11 }}>
                <option value="">Substanz wählen …</option>
                {substanzen.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
              <button type="button" className="v2-btn v2-btn-primary v2-btn-sm"
                      disabled={!wahl || laeuft === 'start'}
                      onClick={() => { void starten() }}>
                <Icon name="plus" className="v2-ic v2-ic-sm" />
                {laeuft === 'start' ? 'Startet …' : 'Zyklus starten'}
              </button>
            </div>
          )}>
      {fehler && (
        <div style={{ fontSize: 11.5, color: 'var(--neg)', marginBottom: 8 }}>
          Nicht gespeichert: {fehler}
        </div>
      )}
      {d.zyklen.length === 0
        ? (
          // `[read]` **Ein benannter Leerhinweis, keine Null** (E-72).
          <div className="v2-muted" style={{ fontSize: 11.5, lineHeight: 1.55 }}>
            Noch kein Zyklus. Die Tabelle <code>user_supplement_cycles</code> ist
            seit C-456 da und leer — über „Zyklus starten" entsteht der erste.
          </div>
        )
        : (
          <div className="v2-col-gap" style={{ gap: 8 }}>
            {d.zyklen.map(z => (
              <div key={z.id} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '8px 10px', background: 'var(--surface)',
                border: '1px solid var(--border)', borderRadius: 6,
              }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 600 }}>
                    {z.substanz_name ?? z.supplement_id.slice(0, 8)}
                  </div>
                  <div className="v2-dim v2-num" style={{ fontSize: 10.5 }}>
                    {z.started_at?.slice(0, 10) ?? '—'}
                    {z.paused_at ? ` · pausiert ${z.paused_at.slice(0, 10)}` : ''}
                    {z.stopped_at ? ` · beendet ${z.stopped_at.slice(0, 10)}` : ''}
                  </div>
                </div>
                <Pill variant={STATUS_TON[z.status]}>
                  {STATUS_TEXT[z.status] ?? z.status}
                </Pill>
                {/* `[read]` **Nur die Uebergaenge, die etwas aendern** —
                    ein „pausieren" an einem beendeten Zyklus waere ein
                    Knopf, der nichts tut. */}
                {z.status === 'active' && (
                  <button type="button" className="v2-btn v2-btn-ghost v2-btn-sm"
                          disabled={laeuft === z.id}
                          onClick={() => { void setzen(z.id, 'paused') }}>
                    Pausieren
                  </button>
                )}
                {z.status === 'paused' && (
                  <button type="button" className="v2-btn v2-btn-ghost v2-btn-sm"
                          disabled={laeuft === z.id}
                          onClick={() => { void setzen(z.id, 'active') }}>
                    Fortsetzen
                  </button>
                )}
                {z.status !== 'stopped' && (
                  <button type="button" className="v2-btn v2-btn-ghost v2-btn-sm"
                          disabled={laeuft === z.id}
                          onClick={() => { void setzen(z.id, 'stopped') }}>
                    Beenden
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
    </Card>
  )
}

/**
 * Die Protokolle und die drei Vorlagen.
 *
 * `[cmd]` **Drei Vorlagen liegen bereit** (gemessen):
 * `standard_nolva_clomid`, `nolvadex_only_6_weeks`, `hcg_nolva`.
 */
export function ProtokollKarte({ d, substanzen }: {
  d: ZyklusStand
  substanzen: Array<{ id: string; name: string }>
}) {
  const [laeuft, setLaeuft] = React.useState(false)
  const [fehler, setFehler] = React.useState<string | null>(null)
  const [vorlage, setVorlage] = React.useState('')
  const [anker, setAnker] = React.useState('')

  async function anlegen() {
    if (!vorlage || !anker) return
    setLaeuft(true); setFehler(null)
    const r = await protokollAusVorlageAktion(vorlage, anker)
    setLaeuft(false)
    if (!r.ok) setFehler(r.text)
    else window.location.reload()
  }

  return (
    <Card title="Protokolle"
          sub={`${d.protokolle.length} · ${d.vorlagen.length} Vorlagen bereit`}>
      {fehler && (
        <div style={{ fontSize: 11.5, color: 'var(--neg)', marginBottom: 8 }}>
          Nicht angelegt: {fehler}
        </div>
      )}

      {/* Aus einer Vorlage anlegen. */}
      <div style={{
        display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center',
        marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid var(--border)',
      }}>
        <select aria-label="Vorlage" value={vorlage}
                onChange={e => setVorlage(e.target.value)}
                className="v2-feld" style={{ height: 26, fontSize: 11.5 }}>
          <option value="">Vorlage wählen …</option>
          {d.vorlagen.map(v => (
            <option key={v.id} value={v.code}>
              {v.name_de ?? v.code} ({v.posten} Posten)
            </option>
          ))}
        </select>
        <select aria-label="Ankersubstanz" value={anker}
                onChange={e => setAnker(e.target.value)}
                className="v2-feld" style={{ height: 26, fontSize: 11.5 }}>
          <option value="">Ankersubstanz …</option>
          {substanzen.map(s => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
        <button type="button" className="v2-btn v2-btn-primary v2-btn-sm"
                disabled={!vorlage || !anker || laeuft}
                onClick={() => { void anlegen() }}>
          {laeuft ? 'Legt an …' : 'Aus Vorlage anlegen'}
        </button>
      </div>

      {d.protokolle.length === 0
        ? (
          <div className="v2-muted" style={{ fontSize: 11.5, lineHeight: 1.55 }}>
            Noch kein Protokoll. Die drei Vorlagen stammen aus dem
            Vorgängerplaner (<code>legacy_cycleplanner</code>) und tragen
            zusammen {d.vorlagen.reduce((s, v) => s + v.posten, 0)} Posten.
          </div>
        )
        : (
          <div className="v2-col-gap" style={{ gap: 10 }}>
            {d.protokolle.map(p => (
              <div key={p.id}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 12.5, fontWeight: 600 }}>
                    {p.name_de ?? '(ohne Namen)'}
                  </span>
                  <Pill>{p.status}</Pill>
                  <span className="v2-dim v2-num" style={{ fontSize: 10.5 }}>
                    {p.started_at ?? '—'}
                  </span>
                </div>
                <div className="v2-dim" style={{ fontSize: 11, marginTop: 4 }}>
                  {p.posten.length === 0
                    ? 'keine Posten'
                    : p.posten.map(i => (
                      `${i.substanz_name ?? '?'} ${i.dose_amount ?? ''}${i.dose_unit ?? ''}`
                      + (i.weeks_start ? ` (Wo ${i.weeks_start}–${i.weeks_end ?? '?'})` : '')
                    )).join(' · ')}
                </div>
              </div>
            ))}
          </div>
        )}
    </Card>
  )
}

/**
 * E-79: die konfigurierten Injektionsflaechen.
 *
 * **Tom, 2026-09-08:** *„wenn er triceps waehlt weil er lokal ein
 * tendonproblem hat, dann zeigen wir den triceps und keinen
 * rotationsvorschlag, weil nur triceps vorhanden ist."*
 *
 * `[cmd]` **Diese Regel steht in der Datenbank, nicht hier:**
 * `suggest_configured_injection_area` traegt
 * `WHERE (SELECT count(*) FROM selected) > 1`.
 *
 * `[cmd]` **Am Schirm belegt** (2026-09-11): eine konfigurierte
 * Flaeche -> kein Vorschlag; zwei -> die laenger geruhte.
 */
export function InjektionsKonfigKarte({ k, substanzen }: {
  k: KonfigurationsStand
  substanzen: Array<{ id: string; name: string; wege: string[] }>
}) {
  const [laeuft, setLaeuft] = React.useState(false)
  const [fehler, setFehler] = React.useState<string | null>(null)
  const [substanz, setSubstanz] = React.useState('')
  const [weg, setWeg] = React.useState('injection_subq')
  const [flaeche, setFlaeche] = React.useState('')
  const [gauge, setGauge] = React.useState('')
  const [laenge, setLaenge] = React.useState('')

  const gewaehlteSubstanz = substanzen.find(s => s.id === substanz)

  async function anlegen() {
    setLaeuft(true); setFehler(null)
    const r = await konfigAnlegenAktion({
      substance_id: substanz,
      route: weg as 'injection_im' | 'injection_subq',
      body_area_code: flaeche,
      needle_gauge: gauge,
      needle_length_in: laenge,
    })
    setLaeuft(false)
    if (!r.ok) {
      setFehler(r.felder.length > 0
        ? r.felder.map(f => `${f.feld}: ${f.text}`).join(' · ')
        : r.text)
    } else window.location.reload()
  }

  async function entfernen(id: string) {
    setLaeuft(true); setFehler(null)
    const r = await konfigEntfernenAktion(id)
    setLaeuft(false)
    if (!r.ok) setFehler(r.text)
    else window.location.reload()
  }

  return (
    <Card title="Injektionspunkte · konfiguriert"
          sub={`${k.flaechen.length} Flächen · medical.user_injection_site_selections`}>
      {fehler && (
        <div style={{ fontSize: 11.5, color: 'var(--neg)', marginBottom: 8 }}>
          {fehler}
        </div>
      )}

      {/* Die Auswahl: Substanz, Weg, Flaeche, Nadel. */}
      <div style={{
        display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center',
        marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid var(--border)',
      }}>
        <select aria-label="Substanz" value={substanz}
                onChange={e => setSubstanz(e.target.value)}
                className="v2-feld" style={{ height: 26, fontSize: 11.5 }}>
          <option value="">Substanz …</option>
          {substanzen.map(s => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
        {/* `[cmd]` **Nur die Wege, die der Katalog fuer diese Substanz
            belegt** — der Trigger weist alles andere ab, und ein
            Knopf, der garantiert scheitert, ist eine Falle. */}
        <select aria-label="Weg" value={weg}
                onChange={e => setWeg(e.target.value)}
                className="v2-feld" style={{ height: 26, fontSize: 11.5 }}>
          {(gewaehlteSubstanz?.wege ?? ['injection_subq', 'injection_im'])
            .map(w => (
              <option key={w} value={w}>
                {w === 'injection_im' ? 'intramuskulär' : 'subkutan'}
              </option>
            ))}
        </select>
        <select aria-label="Fläche" value={flaeche}
                onChange={e => setFlaeche(e.target.value)}
                className="v2-feld" style={{ height: 26, fontSize: 11.5 }}>
          <option value="">Fläche …</option>
          {KOERPERFLAECHEN.map(f => (
            <option key={f} value={f}>{f}</option>
          ))}
        </select>
        <input aria-label="Nadelstärke" value={gauge}
               onChange={e => setGauge(e.target.value)}
               placeholder="29G" className="v2-feld"
               style={{ height: 26, fontSize: 11.5, width: 70 }} />
        <input aria-label="Nadellänge" value={laenge}
               onChange={e => setLaenge(e.target.value)}
               placeholder="0.5" className="v2-feld"
               style={{ height: 26, fontSize: 11.5, width: 70 }} />
        <button type="button" className="v2-btn v2-btn-primary v2-btn-sm"
                disabled={!substanz || !flaeche || laeuft}
                onClick={() => { void anlegen() }}>
          Fläche hinzufügen
        </button>
      </div>

      {k.flaechen.length === 0
        ? (
          <div className="v2-muted" style={{ fontSize: 11.5, lineHeight: 1.55 }}>
            Noch keine Fläche konfiguriert. Solange nichts gewählt ist, gibt es
            auch keinen Rotationsvorschlag — die Rotation läuft über die
            konfigurierten Punkte, nicht über den Katalog (E-79).
          </div>
        )
        : (
          <>
            <div className="v2-col-gap" style={{ gap: 6 }}>
              {k.flaechen.map(f => (
                <div key={f.id} style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '6px 10px', background: 'var(--surface)',
                  border: '1px solid var(--border)', borderRadius: 6,
                  fontSize: 11.5,
                }}>
                  <span style={{ flex: 1 }}>
                    <strong>{f.body_area_code}</strong>
                    {' · '}{f.substanz_name ?? f.substance_id.slice(0, 8)}
                    {' · '}{f.route === 'injection_im' ? 'IM' : 'SubQ'}
                  </span>
                  <span className="v2-dim v2-num" style={{ fontSize: 10.5 }}>
                    {f.needle_gauge ?? '—'}
                    {f.needle_length_in ? ` · ${f.needle_length_in}"` : ''}
                  </span>
                  <button type="button" className="v2-btn v2-btn-ghost v2-btn-sm"
                          disabled={laeuft}
                          onClick={() => { void entfernen(f.id) }}>
                    Entfernen
                  </button>
                </div>
              ))}
            </div>

            {/* ══ DIE REGEL AUS E-79, SICHTBAR ═══════════════════════ */}
            <div className="v2-divider" />
            <div style={{ fontSize: 11.5, lineHeight: 1.55 }}>
              {k.vorschlag
                ? (
                  <>
                    <Icon name="sparkles" className="v2-ic v2-ic-sm"
                          style={{ display: 'inline', color: 'var(--acc-suppl)', marginRight: 4 }} />
                    Nächster Vorschlag: <strong>{k.vorschlag.body_area_code}</strong>
                    <span className="v2-dim"> — {k.vorschlag.suggestion_reason}</span>
                  </>
                )
                : (
                  <span className="v2-muted">
                    Kein Rotationsvorschlag — dafür braucht es mindestens zwei
                    konfigurierte Flächen für dieselbe Substanz und denselben
                    Weg. Bei einer einzigen bleibt es bei dieser einen (E-79).
                  </span>
                )}
            </div>
          </>
        )}
    </Card>
  )
}
