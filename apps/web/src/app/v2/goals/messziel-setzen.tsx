'use client'

// G-628 Teil 3 — Weg B „Messziel hinzufügen" (Dossier 8.3, Entwurf
// `ZielSetzen.dc.html` B1/B2).
//
// `[read]` **B1 Art, B2 Details.** Was waehlbar ist, sagt
// `goals.measurement_source_options`; den Startwert haelt die Kette beim
// Anlegen fest, und der Dialog zeigt ihn danach so, wie er gespeichert ist.
// `[read]` **Kein Weg zu Phase oder Strategie** — angelegt wird nur ueber
// `measurement_goal_create`.
import * as React from 'react'
import { Icon } from '@lumeos/ui'

import { GField, GInput, GModal, Karte } from './modale'
import { messquellenAktion, messzielAnlegenAktion, messzielVorschauAktion, uebungenAktion } from './ziel-aktionen'
import { messungAnlegenAktion } from './koerpermass-aktionen'
import { umfangAnlegenAktion } from './umfang-aktionen'
import {
  MESSARTEN, STELLEN, artenVon, einheitLesbar, gewohnheitsVorschlag, startSatz, widerspruch,
  type Kategorie, type Messart, type Messformular, type Rhythmus, type Vorschau,
} from '../../../lib/goals/messziel'
import { quelleLesbar, wertMitEinheit } from '../../../lib/goals/reiter'
import { BF_METHODEN } from '../../../lib/goals/koerpermass-rechnung'
import type { Umfangsfeld } from '../../../lib/goals/umfang-rechnung'
import type { Messquellen, Uebung } from '../../../lib/goals/messziel-io'

const KATEGORIEN: Array<[Kategorie | 'endurance' | 'health', string, string]> = [
  ['koerper', 'Körper', 'Gewicht, Körperfett, Umfang'],
  ['kraft', 'Kraft', 'eine Übung, 1RM oder Gewicht × Wdh.'],
  ['gewohnheit', 'Gewohnheit', 'pro Woche, mit Serie'],
  ['eigenes', 'Eigenes', 'eigene Einheit, Werte selbst eingetragen'],
  ['endurance', 'Ausdauer', 'kommt mit dem Cardio-Modul'],
  ['health', 'Gesundheit', 'vorgemerkt, kommt mit Medical'],
]

const Chip = ({ an, aus, onClick, children, ...rest }: {
  an: boolean; aus?: boolean; onClick: () => void; children: React.ReactNode
} & Record<`data-${string}`, string>) => (
  <button type="button" className="v2-btn v2-btn-sm" aria-pressed={an} disabled={aus} onClick={onClick} {...rest}
          style={{ background: an ? 'color-mix(in oklch, var(--acc-goals) 14%, var(--surface))' : undefined, opacity: aus ? 0.5 : 1 }}>
    {children}
  </button>
)

const datumDe = (iso: string | null) => (iso ? iso.split('-').reverse().join('.') : '')
const zahlAus = (s: string) => { const n = Number(s.replace(',', '.')); return s.trim() !== '' && Number.isFinite(n) ? n : null }
const jetztZeit = () => { const d = new Date(); return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}` }

/**
 * „Jetzt messen" — ueber die BESTEHENDEN Messwege (`messungAnlegenAktion`,
 * `umfangAnlegenAktion`), dieselben Regeln wie im Modal „Log weight" /
 * „Measurements". `[read]` **Koerperfett braucht ein Gewicht** (`weight_kg`
 * NOT NULL) und eine Methode — der Messweg verlangt beides.
 */
function JetztMessen({ art, stelle, heute, onGemessen }: {
  art: 'body_weight' | 'body_fat' | 'circumference'; stelle: string | null; heute: string; onGemessen: () => void
}) {
  const [kg, setKg] = React.useState('')
  const [kfa, setKfa] = React.useState('')
  const [methode, setMethode] = React.useState('')
  const [cm, setCm] = React.useState('')
  const [laeuft, setLaeuft] = React.useState(false)
  const [fehler, setFehler] = React.useState<string | null>(null)
  const speichern = async () => {
    setLaeuft(true); setFehler(null)
    const r = art === 'circumference'
      ? await umfangAnlegenAktion({ measurement_date: heute, measurement_time: jetztZeit(), measurement_source: 'manual',
          notes: '', werte: { [stelle as Umfangsfeld]: cm } })
      : await messungAnlegenAktion({ measurement_date: heute, measurement_time: jetztZeit(), weight_kg: kg,
          body_fat_pct: art === 'body_fat' ? kfa : '', bf_method: art === 'body_fat' ? methode : '', notes: '' })
    setLaeuft(false)
    if (r.ok) onGemessen()
    else setFehler([r.text, ...r.felder.map(f => f.text)].join(' '))
  }
  return (
    <div data-jetzt-messen={art} className="v2-col-gap" style={{ gap: 6, marginTop: 6 }}>
      <div className="v2-grid v2-g-cols-3" style={{ gap: 8 }}>
        {art !== 'circumference' && (
          <GField label="Gewicht heute (kg)">
            <GInput aria-label="Gewicht heute" data-messen-feld="weight_kg" value={kg} inputMode="decimal" onChange={e => setKg(e.target.value)} />
          </GField>
        )}
        {art === 'body_fat' && <>
          <GField label="Körperfett (%)">
            <GInput aria-label="Körperfett heute" data-messen-feld="body_fat_pct" value={kfa} inputMode="decimal" onChange={e => setKfa(e.target.value)} />
          </GField>
          <GField label="Methode">
            <select className="v2-feld" style={{ width: '100%' }} data-messen-feld="bf_method" value={methode} onChange={e => setMethode(e.target.value)}>
              <option value="">wählen …</option>
              {BF_METHODEN.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </GField>
        </>}
        {art === 'circumference' && (
          <GField label={`${stelle ? STELLEN[stelle] ?? stelle : 'Stelle'} heute (cm)`}>
            <GInput aria-label="Umfang heute" data-messen-feld="umfang" value={cm} inputMode="decimal" onChange={e => setCm(e.target.value)} />
          </GField>
        )}
      </div>
      <div>
        <button type="button" className="v2-btn v2-btn-sm v2-btn-primary" data-jetzt-messen-speichern disabled={laeuft}
                onClick={() => { void speichern() }}>{laeuft ? 'Speichert …' : 'Jetzt messen'}</button>
      </div>
      {fehler && <div data-jetzt-messen-fehler style={{ fontSize: 11.5, color: 'var(--neg)' }}>{fehler}</div>}
    </div>
  )
}

export function MesszielSetzen({ heute, onClose, zurueck, steuerung = null }: {
  heute: string
  onClose: () => void
  /** null, wenn der Dialog direkt bei B1 begann („+ Messziel"). */
  zurueck: (() => void) | null
  /**
   * G-621: die Richtung des aktiven steuernden Ziels — `auswahl_gruppe` der
   * Strategie aus `strategie_code` seiner laufenden Phase.
   */
  steuerung?: { gruppe: string | null; name: string | null } | null
}) {
  const [schritt, setSchritt] = React.useState<'B1' | 'B2' | 'fertig'>('B1')
  const [quellen, setQuellen] = React.useState<Messquellen | null>(null)
  const [kat, setKat] = React.useState<Kategorie | null>(null)
  const [art, setArt] = React.useState<Messart | null>(null)
  const [ziel, setZiel] = React.useState('')
  const [frist, setFrist] = React.useState('')
  const [titel, setTitel] = React.useState('')
  const [rhythmus, setRhythmus] = React.useState<Rhythmus>('once')
  const [stelle, setStelle] = React.useState<string | null>(null)
  const [suche, setSuche] = React.useState('')
  const [uebungen, setUebungen] = React.useState<Uebung[]>([])
  const [uebung, setUebung] = React.useState<Uebung | null>(null)
  const [wdh, setWdh] = React.useState('5')
  const [einheit, setEinheit] = React.useState('')
  const [richtung, setRichtung] = React.useState<'more' | 'less' | null>(null)
  const [start, setStart] = React.useState('')
  const [laeuft, setLaeuft] = React.useState(false)
  const [fehler, setFehler] = React.useState<string | null>(null)
  const [fertigSatz, setFertigSatz] = React.useState('')
  // G-628 Teil 4: der Startwert vor dem Anlegen (G-634).
  const [vorschau, setVorschau] = React.useState<Vorschau | null>(null)
  const [vorschauFehler, setVorschauFehler] = React.useState<string | null>(null)
  const [neuMessen, setNeuMessen] = React.useState(0)

  React.useEffect(() => { void messquellenAktion().then(setQuellen) }, [])
  React.useEffect(() => {
    if (kat !== 'kraft') return
    const t = setTimeout(() => { void uebungenAktion(suche).then(setUebungen) }, 300)
    return () => clearTimeout(t)
  }, [kat, suche])

  const frei = (a: string) => quellen?.verfuegbar[a] === true
  const waehleKat = (k: Kategorie) => {
    const erste = artenVon(k).find(frei) ?? null
    setKat(k); setArt(erste); setFehler(null)
    setRhythmus(erste ? MESSARTEN[erste].rhythmus ?? 'once' : 'once')
  }
  const waehleArt = (a: Messart) => { setArt(a); setRhythmus(MESSARTEN[a].rhythmus ?? rhythmus) }

  React.useEffect(() => {
    if (schritt !== 'B2' || !art) return
    setVorschau(null); setVorschauFehler(null)
    const f: Messformular = { art, titel: '', ziel: '', frist: '', rhythmus, stelle, uebungId: uebung?.id ?? null, wdh, einheit, richtung, start }
    const t = setTimeout(() => {
      void messzielVorschauAktion(f, heute).then(r => {
        if (!r) return
        if (r.ok) setVorschau(r.vorschau)
        else setVorschauFehler(r.fehler)
      })
    }, 300)
    return () => clearTimeout(t)
    // `rhythmus`, `einheit`, `richtung` aendern den Startwert nicht — nur die sechs Parameter der Vorschau.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schritt, art, stelle, uebung?.id, wdh, start, heute, neuMessen])

  // Gewohnheit: „Schnitt + 1" ins leere Feld — editierbar, reine Anzeige.
  const vorschlagWert = art && MESSARTEN[art].kategorie === 'gewohnheit' && vorschau?.kennung === 'gemessen'
    ? gewohnheitsVorschlag(art, vorschau.wert) : null
  React.useEffect(() => {
    if (vorschlagWert !== null && ziel === '') setZiel(String(vorschlagWert).replace('.', ','))
  }, [vorschlagWert]) // eslint-disable-line react-hooks/exhaustive-deps

  const m = art ? MESSARTEN[art] : null
  const koerperOhneWert = !!m && m.kategorie === 'koerper' && vorschau?.kennung !== 'gemessen'
  const hinweis = art && vorschau?.kennung === 'gemessen'
    ? widerspruch({ art, ziel: zahlAus(ziel), start: vorschau.wert, gruppe: steuerung?.gruppe ?? null, steuerName: steuerung?.name ?? null })
    : null
  const einheitZiel = art === 'custom' ? einheit : einheitLesbar(m?.einheit ?? null)
  const vorschlag = !art ? '' : art === 'custom' ? ''
    : [m!.kategorie === 'kraft' ? uebung?.name : m!.name,
       art === 'circumference' && stelle ? STELLEN[stelle] : '',
       art === 'e1rm' ? '1RM' : art === 'weight_reps' ? `${wdh} Wdh.` : '',
       ziel ? `${ziel} ${einheitZiel}`.trim() : ''].filter(Boolean).join(' ')

  const anlegen = async () => {
    if (!art) return
    const f: Messformular = {
      art, titel: titel.trim() || vorschlag, ziel, frist, rhythmus, stelle,
      uebungId: uebung?.id ?? null, wdh, einheit, richtung, start,
    }
    setLaeuft(true); setFehler(null)
    const r = await messzielAnlegenAktion(f, heute)
    setLaeuft(false)
    if (!r.ok) { setFehler(r.fehler); return }
    setFertigSatz(`„${f.titel}“: ${startSatz(r.start)}`)
    setSchritt('fertig')
  }

  const fuss = (
    <>
      {schritt === 'B1' && <>
        <button type="button" className="v2-btn v2-btn-ghost" onClick={zurueck ?? onClose}>{zurueck ? 'Zurück' : 'Abbrechen'}</button>
        <button type="button" className="v2-btn v2-btn-primary" data-messziel-weiter disabled={!art}
                onClick={() => setSchritt('B2')}>Weiter</button>
      </>}
      {schritt === 'B2' && <>
        <button type="button" className="v2-btn v2-btn-ghost" onClick={() => { setFehler(null); setSchritt('B1') }}>Zurück</button>
        <button type="button" className="v2-btn v2-btn-primary" data-messziel-anlegen disabled={laeuft || koerperOhneWert}
                onClick={() => { void anlegen() }}>
          <Icon name="check" className="v2-ic v2-ic-sm" /> {laeuft ? 'Legt an …' : 'Messziel anlegen'}
        </button>
      </>}
      {schritt === 'fertig' && (
        <button type="button" className="v2-btn v2-btn-primary" onClick={onClose}>Zu den Zielen</button>
      )}
    </>
  )

  return (
    <GModal title={schritt === 'fertig' ? 'Fertig' : 'Messziel hinzufügen'} eyebrow="goals" onClose={onClose}
            footer={fuss} width={640}
            subtitle={schritt === 'fertig' ? undefined : (
              <span>{['1 Art', '2 Details'].map((l, i) => (
                <span key={l} style={{ fontWeight: (schritt === 'B1') === (i === 0) ? 700 : 400, marginRight: 10 }}>{l}</span>
              ))}</span>)}>
      <div data-messziel-setzen={schritt}>
        {schritt === 'B1' && (
          <div className="v2-col-gap" style={{ gap: 10 }}>
            <div className="v2-grid v2-g-cols-2" style={{ gap: 8 }}>
              {KATEGORIEN.map(([k, name, satz]) => {
                const offen = k === 'endurance' || k === 'health' ? frei(k) : artenVon(k).some(frei)
                return (
                  <Karte key={k} marke={`messziel-${k}`} kopf={name} an={kat === k}
                         onClick={offen && k !== 'endurance' && k !== 'health' ? () => waehleKat(k) : undefined}>
                    {satz}
                  </Karte>
                )
              })}
            </div>
            {kat && artenVon(kat).length > 1 && (
              <GField label={kat === 'gewohnheit' ? 'Was zählt' : kat === 'kraft' ? 'Messart' : 'Messgröße'}>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {artenVon(kat).map(a => (
                    <Chip key={a} an={art === a} aus={!frei(a)} onClick={() => waehleArt(a)} data-messziel-art={a}>
                      {MESSARTEN[a].name}{!frei(a) && <span data-messziel-kommt style={{ marginLeft: 6, fontSize: 10 }}>kommt</span>}
                    </Chip>
                  ))}
                </div>
              </GField>
            )}
          </div>
        )}

        {schritt === 'B2' && art && m && (
          <div className="v2-col-gap" style={{ gap: 4 }}>
            {art === 'circumference' && (
              <GField label="Stelle">
                <select className="v2-feld" style={{ width: '100%' }} data-messfeld="stelle" value={stelle ?? ''}
                        onChange={e => setStelle(e.target.value || null)}>
                  <option value="">wählen …</option>
                  {(quellen?.stellen ?? []).map(s => <option key={s} value={s}>{STELLEN[s] ?? s}</option>)}
                </select>
              </GField>
            )}
            {m.kategorie === 'kraft' && <>
              <GField label="Übung" sub={suche.trim().length < 2 ? 'zuletzt trainiert' : undefined}>
                <GInput aria-label="Übung suchen" data-messfeld="uebung-suche" value={suche} placeholder="Übung suchen …"
                        onChange={e => setSuche(e.target.value)} />
                <div style={{ display: 'flex', flexDirection: 'column', marginTop: 6 }}>
                  {uebungen.map(u => (
                    <Chip key={u.id} an={uebung?.id === u.id} onClick={() => setUebung(u)} data-messziel-uebung={u.id}>{u.name}</Chip>
                  ))}
                  {uebungen.length === 0 && <span className="v2-dim" style={{ fontSize: 11 }}>keine Übung gefunden</span>}
                </div>
              </GField>
              {art === 'weight_reps' && (
                <GField label="Wiederholungen">
                  <GInput aria-label="Wiederholungen" data-messfeld="wdh" value={wdh} inputMode="numeric"
                          onChange={e => setWdh(e.target.value)} />
                </GField>
              )}
            </>}
            {art === 'custom' && (
              <div className="v2-grid v2-g-cols-2" style={{ gap: 10 }}>
                <GField label="Einheit">
                  <GInput aria-label="Einheit" data-messfeld="einheit" value={einheit} placeholder="z. B. l"
                          onChange={e => setEinheit(e.target.value)} />
                </GField>
                <GField label="Startwert (selbst eingetragen)">
                  <GInput aria-label="Startwert" data-messfeld="start" value={start} inputMode="decimal"
                          onChange={e => setStart(e.target.value)} />
                </GField>
                <GField label="Besser ist">
                  <div style={{ display: 'flex', gap: 6 }}>
                    {(['more', 'less'] as const).map(r => (
                      <Chip key={r} an={richtung === r} onClick={() => setRichtung(r)} data-messziel-richtung={r}>
                        {r === 'more' ? 'mehr' : 'weniger'}
                      </Chip>
                    ))}
                  </div>
                </GField>
              </div>
            )}
            {/* ══ G-628 Teil 4: der Startwert VOR dem Anlegen (G-634) ══════
                `[read]` **Wert, Datum, Quelle kommen aus
                `measurement_goal_start_preview`** — dieselbe Abfrage, die der
                Snapshot beim Anlegen nutzt. Keine Startwertlogik hier. */}
            <div data-messziel-vorschau={vorschau?.kennung ?? (vorschauFehler ? 'fehler' : 'laedt')}
                 style={{ background: 'var(--surface-2)', borderRadius: 8, padding: '9px 12px', fontSize: 12, margin: '4px 0 8px' }}>
              {vorschauFehler ? <span style={{ color: 'var(--neg)' }}>{vorschauFehler}</span>
                : !vorschau ? <span className="v2-dim">Startwert wird gelesen …</span>
                : vorschau.kennung === 'gemessen' ? (
                  <>Start <b className="v2-num" data-vorschau-wert>{wertMitEinheit(vorschau.wert, art === 'custom' ? einheit || null : m.einheit)}</b>
                    <span className="v2-dim"> · {quelleLesbar(vorschau.quelle) ?? 'Quelle unbekannt'}{vorschau.datum ? ` am ${datumDe(vorschau.datum)}` : ''} · wird beim Anlegen festgehalten</span></>
                ) : m.kategorie === 'kraft' ? (
                  <span data-vorschau-erstes-training>Noch kein Wert mit dieser Übung — Start ist dein erstes Training danach.</span>
                ) : m.kategorie === 'koerper' ? (
                  <>
                    <b data-vorschau-erst-messen>Erst messen:</b> für {m.name}{art === 'circumference' && stelle ? ` (${STELLEN[stelle]})` : ''} gibt es noch keinen Wert.
                    <JetztMessen art={art as 'body_weight' | 'body_fat' | 'circumference'} stelle={stelle} heute={heute}
                                 onGemessen={() => setNeuMessen(n => n + 1)} />
                  </>
                ) : art === 'custom' ? <span className="v2-dim">Trag unten deinen Startwert ein.</span>
                : <span className="v2-dim">Noch kein Wert.</span>}
              {vorschlagWert !== null && (
                <div data-gewohnheit-vorschlag={vorschlagWert} style={{ marginTop: 4 }}>
                  Dein Schnitt der letzten 4 Wochen: <b className="v2-num">{wertMitEinheit(vorschau!.wert, m.einheit)}</b>.
                  {' '}Vorschlag: <b className="v2-num">{wertMitEinheit(vorschlagWert, m.einheit)}</b> (Schnitt + 1). Wiederkehrend jede Woche, mit Serie.
                </div>
              )}
            </div>
            <div className="v2-grid v2-g-cols-2" style={{ gap: 10 }}>
              <GField label={`Zielwert${einheitZiel ? ` (${einheitZiel})` : ''}`}>
                <GInput aria-label="Zielwert" data-messfeld="ziel" value={ziel} inputMode="decimal"
                        onChange={e => setZiel(e.target.value)} />
              </GField>
              <GField label="Frist (optional)">
                <GInput aria-label="Frist" data-messfeld="frist" type="date" value={frist} min={heute}
                        onChange={e => setFrist(e.target.value)} />
              </GField>
            </div>
            <GField label="Rhythmus">
              <div style={{ display: 'flex', gap: 6 }}>
                {(['once', 'weekly'] as const).map(r => (
                  <Chip key={r} an={rhythmus === r} aus={m.rhythmus !== null && m.rhythmus !== r}
                        onClick={() => setRhythmus(r)} data-messziel-rhythmus={r}>
                    {r === 'once' ? 'einmalig' : 'wöchentlich'}
                  </Chip>
                ))}
              </div>
            </GField>
            <GField label={art === 'custom' ? 'Titel' : 'Titel (vorgeschlagen)'}>
              <GInput aria-label="Titel" data-messfeld="titel" value={titel} placeholder={vorschlag || 'z. B. Wasser pro Tag'}
                      onChange={e => setTitel(e.target.value)} />
            </GField>
            {hinweis && (
              <div data-messziel-widerspruch role="note" style={{
                // Gelb wie im Entwurf. G-641: die srgb-Ausnahme aus G-628 Teil 4 ist
                // zurueckgefuehrt — seit die neutralen Tokens `none` tragen, mischt oklch richtig.
                background: 'color-mix(in oklch, var(--warn) 16%, var(--surface))',
                border: '1px solid color-mix(in oklch, var(--warn) 55%, var(--border))',
                borderRadius: 8, padding: '9px 12px', fontSize: 12, marginTop: 4,
              }}><b>Hinweis:</b> {hinweis}</div>
            )}
            <div className="v2-dim" style={{ fontSize: 11 }} data-messziel-start>Ein Messziel steuert nichts.</div>
          </div>
        )}

        {schritt === 'fertig' && (
          <div data-messziel-fertig style={{ fontSize: 13, lineHeight: 1.6 }}>
            Messziel angelegt. {fertigSatz} Es steht im Reiter Goals.
          </div>
        )}

        {fehler && <div data-messziel-fehler style={{ marginTop: 10, fontSize: 11.5, color: 'var(--neg)' }}>{fehler}</div>}
      </div>
    </GModal>
  )
}
