'use client'

// Die Modale des Supplements-Moduls.
//
// `[cmd]` Die Vorlage fuehrt zwoelf (module-supplements.jsx:273-285),
// verteilt auf `module-supplements-modals.jsx` (elf) und den Rahmen.
//
// GEBAUT sind die, die aus den Tabs dieses Auftrags erreichbar sind.
// `[read]` Die uebrigen haengen an den vier Tabs, die dieser Durchgang
// nicht baut (Catalog, Stacks, Intelligence, Inventory, Injections) —
// sie stehen im Bericht.
//
// Alle sind ATTRAPPEN: es gibt kein `supplements`-Schema, also gibt es
// nichts zu speichern. Der Knopf, der speichern wuerde, sagt das.
import * as React from 'react'
import { Pill, Icon, Meter, InEntwicklungKnopf } from '@lumeos/ui'

import { STACK, type StackItem } from './daten'
// G-45: Orte und Zustandsrechnung des Injections-Tabs.
import { INJ_ORTE, INJ_PROTOKOLL } from './injektion-daten'
import { ortZustand } from './tab-injektionen'
import { useSupp, type ModalTyp } from './kontext'

/** Rahmen fuer alle Modale — Vorlage: `SuppModal` in -modals.jsx. */
function Rahmen({
  titel, sub, breite = 520, onClose, children, fuss, echt = false,
}: {
  titel: string
  sub?: string
  breite?: number
  onClose: () => void
  children: React.ReactNode
  fuss?: React.ReactNode
  /**
   * G-148: Das Fenster schreibt wirklich — dann keine Attrappenmarke.
   *
   * `[read]` **Der Befund aus G-135 gilt auch hier:** Eine Kachel, die
   * Entwurfszahlen ableitet, traegt keine Marke und wird vom Zaehler
   * nie gemeldet. **Umgekehrt genauso falsch:** ein Fenster, das
   * schreibt und trotzdem „Attrappe" sagt, ist eine Luege in die
   * andere Richtung.
   */
  echt?: boolean
}) {
  React.useEffect(() => {
    const auf = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', auf)
    return () => window.removeEventListener('keydown', auf)
  }, [onClose])

  return (
    <div className="v2-modal-veil" onClick={onClose} role="presentation">
      <div className="v2-modal" style={{ width: breite, maxHeight: '88vh' }}
           role="dialog" aria-modal="true" aria-label={titel}
           onClick={e => e.stopPropagation()}>
        <div className="v2-modal-h">
          <Icon name="supplements" className="v2-ic v2-ic-sm" />
          <span className="v2-card-title">{titel}</span>
          {sub && <span className="v2-card-sub">{sub}</span>}
          {!echt && <Pill variant="warn">Attrappe</Pill>}
          <div className="v2-spacer" />
          <button type="button" className="v2-icon-btn" onClick={onClose} aria-label="Schliessen">
            <Icon name="x" className="v2-ic v2-ic-sm" />
          </button>
        </div>
        <div className="v2-modal-body">{children}</div>
        <div className="v2-modal-f">
          <button type="button" className="v2-btn v2-btn-ghost" onClick={onClose}>Schliessen</button>
          {fuss}
        </div>
      </div>
    </div>
  )
}

/**
 * Der Satz, der an jedem Speichern-Knopf steht, der nicht schreibt.
 *
 * `[cmd]` **Er war falsch, seit es das Schema gibt.** `supplements`
 * fuehrt 14 Tabellen und 720 Einnahmezeilen. **Der Grund ist nicht
 * „kein Schema", sondern „keine Tabelle fuer DIESE Sache"** — und der
 * ist je Fenster verschieden. Deshalb nennt jedes seinen eigenen.
 */
function NichtsZuSpeichernWeil({ grund }: { grund: string }) {
  return (
    <p className="v2-hinweis" style={{ marginTop: 12 }}>
      <Icon name="alert" className="v2-ic v2-ic-sm" />
      <span>{grund}</span>
    </p>
  )
}

/** Die Fusszeile eines schreibenden Fensters. */
function SchreibFuss({
  laeuft, gesperrt, titel, onSpeichern, beschriftung,
}: {
  laeuft: boolean
  gesperrt?: string
  titel?: string
  onSpeichern: () => void
  beschriftung: string
}) {
  return (
    <button type="button" className="v2-btn v2-btn-primary"
            disabled={laeuft || !!gesperrt}
            title={gesperrt ?? titel}
            onClick={onSpeichern}>
      <Icon name="check" className="v2-ic v2-ic-sm" />
      {laeuft ? 'Speichert …' : beschriftung}
    </button>
  )
}

/** Die Fehlermeldung eines Schreibversuchs. */
function Schreibfehler({ text }: { text: string | null }) {
  if (!text) return null
  return (
    <p className="v2-hinweis" style={{ marginTop: 12, color: 'var(--neg)' }}>
      <Icon name="alert" className="v2-ic v2-ic-sm" />
      <span>{text}</span>
    </p>
  )
}

const OHNE_SCHEMA = 'Es gibt kein `supplements`-Schema — hier laesst sich noch nichts speichern.'

function NichtsZuSpeichern() {
  return (
    <p className="v2-hinweis" style={{ marginTop: 12 }}>
      <Icon name="alert" className="v2-ic v2-ic-sm" />
      <span>{OHNE_SCHEMA}</span>
    </p>
  )
}

export function SupplementsModale({
  modal, onClose,
}: {
  modal: { type: ModalTyp; payload?: unknown } | null
  onClose: () => void
}) {
  if (!modal) return null
  const p = modal.payload as Record<string, unknown> | undefined

  switch (modal.type) {
    case 'add':
    case 'catalogAdd':
    case 'catalogAddEnh':
      return (
        <AddFenster payload={p} onClose={onClose}
                    enhanced={modal.type === 'catalogAddEnh'} />
      )

    case 'skip':
      return <SkipFenster payload={p} onClose={onClose} />

    case 'product':
      return (
        <Rahmen titel={String(p?.name ?? 'Product')} breite={620}
                sub={p?.inStack ? 'in stack' : 'not in stack'} onClose={onClose}>
          <p className="v2-muted" style={{ fontSize: 12, lineHeight: 1.55 }}>
            Die Vorlage zeigt hier Herstellerangaben, Preisvergleich und
            Studienlage. `[cmd]` Alles davon braucht einen Produktkatalog
            — es gibt keinen.
          </p>
          <NichtsZuSpeichern />
        </Rahmen>
      )

    case 'interaction':
      return (
        <Rahmen titel="Interaction" breite={600} onClose={onClose}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
            {String(p?.pair ?? p?.title ?? '')}
          </div>
          <div className="v2-muted" style={{ fontSize: 12, lineHeight: 1.55 }}>
            {String(p?.note ?? p?.detail ?? p?.description ?? '')}
          </div>
        </Rahmen>
      )

    case 'reorder':
      return <ReorderFenster payload={p} onClose={onClose} />

    case 'addLab':
      return (
        <Rahmen titel="Add lab result" onClose={onClose}>
          <div className="v2-grid v2-g-cols-2" style={{ gap: 10 }}>
            <div>
              <div className="v2-eyebrow" style={{ marginBottom: 4 }}>Marker</div>
              <input className="v2-feld" placeholder="Ferritin" />
            </div>
            <div>
              <div className="v2-eyebrow" style={{ marginBottom: 4 }}>Value</div>
              <input className="v2-feld" placeholder="142 ng/mL" />
            </div>
          </div>
          <NichtsZuSpeichern />
        </Rahmen>
      )

    case 'addSideEffect':
      return (
        <Rahmen titel="Log side effect" onClose={onClose}>
          <div className="v2-eyebrow" style={{ marginBottom: 4 }}>What happened</div>
          <textarea className="v2-feld" rows={3} placeholder="…" />
          <NichtsZuSpeichern />
        </Rahmen>
      )

    case 'addCompound':
      return (
        <Rahmen titel="Add compound" sub="extended protocol" onClose={onClose}>
          <div className="v2-eyebrow" style={{ marginBottom: 4 }}>Compound</div>
          <input className="v2-feld" placeholder="Name" />
          <NichtsZuSpeichern />
        </Rahmen>
      )

    case 'planCycle':
      return (
        <Rahmen titel="Plan cycle" breite={600} onClose={onClose}>
          <p className="v2-muted" style={{ fontSize: 12, lineHeight: 1.55 }}>
            Die Vorlage plant hier Zyklen mit Beginn, Dauer und Pause.
            `[read]` Das Vorgaengerrepo hat dafuer `CyclePlanner.tsx` und
            `BloodLevelChart.tsx` — beides liegt bereit, braucht aber ein
            Schema.
          </p>
          <NichtsZuSpeichern />
        </Rahmen>
      )

    case 'permissions':
      return (
        <Rahmen titel="Coach permissions" onClose={onClose}>
          <p className="v2-muted" style={{ fontSize: 12, lineHeight: 1.55 }}>
            Wer sieht welchen Teil des Stacks. Braucht die Coach-Anbindung.
          </p>
          <NichtsZuSpeichern />
        </Rahmen>
      )

    case 'logDose':
      return <LogDoseFenster payload={p} onClose={onClose} />

    // G-45: das Fenster des Injections-Tabs
    // (module-supplements-injection.jsx:389-511).
    //
    // `[cmd]` DIE PRUEFUNG IST DER KERN DIESES FENSTERS, nicht
    // Beiwerk: die Vorlage sperrt den Speichern-Knopf, wenn die Menge
    // ueber der Ortsgrenze liegt oder das Ruhefenster noch laeuft.
    // Uebernommen samt Sperre — ein Fenster, das die Grenze zeigt und
    // trotzdem speichern liesse, waere schlechter als keines.
    case 'logInjection':
      return <LogInjektionFenster onClose={onClose} />

    default:
      return null
  }
}

/**
 * Das Fenster zum Erfassen einer Injektion (G-45).
 *
 * QUELLE: theme-v1/module-supplements-injection.jsx:389-511.
 *
 * `[cmd]` Eigene Komponente statt eines `case`-Zweigs, weil es
 * Zustand braucht: Ort, Menge und Schmerz aendern die Pruefung live.
 * Dieselbe Aufteilung wie bei den uebrigen zustandsbehafteten Fenstern.
 */
// ═══ G-148 · DIE SCHREIBENDEN FENSTER ═══════════════════════════
//
// QUELLE: theme-v1/module-supplements-modals.jsx — `LogDoseModal`
// (686), `LogSkipModal` (172), `AddSupplementModal` (103),
// `ReorderModal` (507).
//
// `[cmd]` **Was die Vorlage NICHT hat: einen Schreibweg.** Ihre
// Knoepfe rufen `onSave?.(…)` oder gar nichts. Die Felder sind
// uebernommen, die Anbindung ist neu.
//
// `[read]` **Und zwei Felder der Vorlage fehlen mit Absicht:**
// `LogDoseModal` fuehrt *„Site (injectable only)"* mit acht Orten —
// **das gehoert zu `Injections`, und C-109 wartet auf die Tabellen**
// (`INJ_SITES`, `INJ_LOG`). Ein Ort, der nirgends landet, waere ein
// Feld, das Arbeit verlangt und nichts tut.

/** Der gemeinsame Schreibaufruf der vier Fenster. */
function useSchreiben(onClose: () => void) {
  const { setFrisch } = useSupp()
  const [laeuft, setLaeuft] = React.useState(false)
  const [fehler, setFehler] = React.useState<string | null>(null)

  const senden = React.useCallback(async (
    pfad: string, init: RequestInit,
  ): Promise<boolean> => {
    setLaeuft(true)
    setFehler(null)
    try {
      const a = await fetch(pfad, init)
      const d = await a.json()
      if (!a.ok) throw new Error(d?.error ?? 'Speichern fehlgeschlagen.')
      if (d.daten) setFrisch(d.daten)
      onClose()
      return true
    } catch (e) {
      setFehler(e instanceof Error ? e.message : String(e))
      return false
    } finally {
      setLaeuft(false)
    }
  }, [onClose, setFrisch])

  return { laeuft, fehler, senden }
}

/**
 * Eine Einnahme erfassen (`LogDoseModal`).
 *
 * `[read]` **Die Menge ist aus dem Stack vorbelegt, nicht empfohlen.**
 * `typical_dose_min/max` bleiben aussen vor — sie sind auf allen 44
 * Katalogeintraegen leer, und G-91 hat die Spalte deshalb entfernt.
 */
function LogDoseFenster({
  payload, onClose,
}: { payload?: Record<string, unknown>; onClose: () => void }) {
  const { daten, stichtag } = useSupp()
  const { laeuft, fehler, senden } = useSchreiben(onClose)

  const vorgabeId = String(payload?.id ?? payload?.stack_item_id ?? '')
  const [positionId, setPositionId] = React.useState(vorgabeId)
  const [zeit, setZeit] = React.useState('')
  const [menge, setMenge] = React.useState('')
  const [notiz, setNotiz] = React.useState('')

  const positionen = daten?.positionen ?? []
  const gewaehlt = positionen.find(x => x.id === positionId) ?? null
  const gesperrt = !daten
    ? 'Ohne gelesene Daten gibt es keine Position, auf die gebucht werden koennte.'
    : !positionId ? 'Erst eine Position waehlen.' : undefined

  return (
    <Rahmen
      titel="Log dose"
      sub={gewaehlt ? `${gewaehlt.name} · ${stichtag}` : stichtag}
      echt={!!daten}
      onClose={onClose}
      fuss={
        <SchreibFuss
          laeuft={laeuft} gesperrt={gesperrt} beschriftung="Log dose"
          onSpeichern={() => void senden('/api/supplements/intake', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({
              stack_item_id: positionId,
              intake_date: stichtag,
              intake_time: zeit || null,
              status: 'taken',
              actual_dose: menge.trim() ? Number(menge.replace(',', '.')) : null,
              notes: notiz.trim() || null,
            }),
          })}
        />
      }
    >
      {!daten ? (
        <NichtsZuSpeichernWeil grund={OHNE_DATEN} />
      ) : (
        <>
          <div className="v2-eyebrow" style={{ marginBottom: 4 }}>Position</div>
          <select className="v2-feld" value={positionId} disabled={laeuft}
                  aria-label="Position"
                  onChange={e => setPositionId(e.target.value)}>
            <option value="">— waehlen —</option>
            {positionen.map(x => (
              <option key={x.id} value={x.id}>
                {x.name} · {x.dose} {x.dose_unit}
              </option>
            ))}
          </select>

          <div className="v2-grid v2-g-cols-2" style={{ gap: 10, marginTop: 10 }}>
            <div>
              <div className="v2-eyebrow" style={{ marginBottom: 4 }}>Time</div>
              <input className="v2-feld" type="time" value={zeit} disabled={laeuft}
                     aria-label="Uhrzeit"
                     onChange={e => setZeit(e.target.value)} />
            </div>
            <div>
              <div className="v2-eyebrow" style={{ marginBottom: 4 }}>
                Abweichende Menge
              </div>
              <input className="v2-feld" inputMode="decimal" disabled={laeuft}
                     aria-label="Abweichende Menge"
                     placeholder={gewaehlt ? `${gewaehlt.dose} ${gewaehlt.dose_unit}` : 'wie im Stack'}
                     value={menge} onChange={e => setMenge(e.target.value)} />
            </div>
          </div>

          <div className="v2-eyebrow" style={{ marginBottom: 4, marginTop: 10 }}>Note</div>
          <input className="v2-feld" value={notiz} disabled={laeuft}
                 aria-label="Notiz" placeholder="Optional"
                 onChange={e => setNotiz(e.target.value)} />

          {/* `[read]` Die Vorbelegung steht daneben, damit sichtbar ist,
              was ohne Eingabe gebucht wird. */}
          {gewaehlt && (
            <p className="v2-dim" style={{ fontSize: 10.5, marginTop: 8 }}>
              Ohne Eingabe wird die Menge aus dem Stack gebucht:{' '}
              <span className="v2-num">{gewaehlt.dose} {gewaehlt.dose_unit}</span>.
              Die Uhrzeit bleibt leer, wenn keine gesetzt ist.
            </p>
          )}
          <Schreibfehler text={fehler} />
        </>
      )}
    </Rahmen>
  )
}

/** Der Satz, wenn keine echten Daten gelesen wurden. */
const OHNE_DATEN =
  'Es sind keine Daten gelesen — ohne Sitzung oder nach einem Lesefehler '
  + 'gibt es keine Position, auf die gebucht werden koennte.'

/** Die Gruende der Vorlage (`LogSkipModal`, -modals.jsx:174-182). */
const SKIP_GRUENDE = [
  'Ran out / refill needed',
  'Forgot',
  'Cheat day / off-protocol',
  'Skipped pre-workout meal',
  'Sick / not training',
  'Cycle off-week',
  'Side effect (note required)',
]

/**
 * Eine Einnahme auslassen (`LogSkipModal`).
 *
 * `[cmd]` **Der Grund landet in `notes`.** Eine eigene Spalte gibt es
 * nicht; `intake_logs` fuehrt `status='skipped'` und `notes`. **Das
 * steht im Bericht als Befund**, nicht als Mangel dieses Fensters.
 */
function SkipFenster({
  payload, onClose,
}: { payload?: Record<string, unknown>; onClose: () => void }) {
  const { daten, stichtag } = useSupp()
  const { laeuft, fehler, senden } = useSchreiben(onClose)

  const vorgabeId = String(payload?.id ?? payload?.stack_item_id ?? '')
  const [positionId, setPositionId] = React.useState(vorgabeId)
  const [grund, setGrund] = React.useState('')
  const [notiz, setNotiz] = React.useState('')

  const positionen = daten?.positionen ?? []
  const gewaehlt = positionen.find(x => x.id === positionId) ?? null
  // Die Vorlage verlangt bei „Side effect" eine Notiz — uebernommen.
  const notizPflicht = grund.startsWith('Side effect')
  const gesperrt = !daten ? OHNE_DATEN
    : !positionId ? 'Erst eine Position waehlen.'
      : !grund ? 'Erst einen Grund waehlen.'
        : (notizPflicht && !notiz.trim())
            ? 'Bei „Side effect" ist eine Notiz Pflicht.'
            : undefined

  const text = [grund, notiz.trim()].filter(Boolean).join(' — ')

  return (
    <Rahmen
      titel="Log skip"
      sub={gewaehlt ? `${gewaehlt.name} · ${gewaehlt.dose} ${gewaehlt.dose_unit}` : stichtag}
      echt={!!daten}
      onClose={onClose}
      fuss={
        <SchreibFuss
          laeuft={laeuft} gesperrt={gesperrt} beschriftung="Log skip"
          onSpeichern={() => void senden('/api/supplements/intake', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({
              stack_item_id: positionId,
              intake_date: stichtag,
              status: 'skipped',
              notes: text || null,
            }),
          })}
        />
      }
    >
      {!daten ? (
        <NichtsZuSpeichernWeil grund={OHNE_DATEN} />
      ) : (
        <>
          <div className="v2-eyebrow" style={{ marginBottom: 4 }}>Position</div>
          <select className="v2-feld" value={positionId} disabled={laeuft}
                  aria-label="Position"
                  onChange={e => setPositionId(e.target.value)}>
            <option value="">— waehlen —</option>
            {positionen.map(x => (
              <option key={x.id} value={x.id}>
                {x.name} · {x.dose} {x.dose_unit}
              </option>
            ))}
          </select>

          <div className="v2-eyebrow" style={{ marginBottom: 6, marginTop: 12 }}>Reason</div>
          <div className="v2-col-gap" style={{ gap: 4 }}>
            {SKIP_GRUENDE.map(r => (
              <button
                key={r} type="button" disabled={laeuft}
                aria-pressed={grund === r}
                onClick={() => setGrund(r)}
                style={{
                  textAlign: 'left', padding: '8px 10px', fontSize: 12,
                  background: grund === r
                    ? 'color-mix(in oklch, var(--warn) 8%, var(--surface))'
                    : 'var(--surface)',
                  border: `1px solid ${grund === r
                    ? 'color-mix(in oklch, var(--warn) 35%, var(--border))'
                    : 'var(--border)'}`,
                  borderRadius: 6, cursor: 'pointer', color: 'var(--fg)',
                }}
              >
                {grund === r && (
                  <Icon name="check" className="v2-ic v2-ic-sm"
                        style={{ display: 'inline', marginRight: 6, color: 'var(--warn)' }} />
                )}
                {r}
              </button>
            ))}
          </div>

          <div className="v2-eyebrow" style={{ marginBottom: 4, marginTop: 12 }}>
            Note {notizPflicht ? '(Pflicht)' : '(optional)'}
          </div>
          <input className="v2-feld" value={notiz} disabled={laeuft}
                 aria-label="Notiz" placeholder="Add context…"
                 onChange={e => setNotiz(e.target.value)} />

          {/* `[cmd]` Der Grund landet in `notes` — es gibt keine eigene
              Spalte. Was gespeichert wird, steht hier, damit niemand
              eine Auswertung danach erwartet. */}
          <p className="v2-dim" style={{ fontSize: 10.5, marginTop: 8, lineHeight: 1.6 }}>
            Gespeichert wird <code>status=skipped</code> mit dem Grund als Notiz
            {text && <> — <span className="v2-num">{text}</span></>}.
            Ausgelassene Einnahmen zaehlen in die Compliance.
          </p>
          <Schreibfehler text={fehler} />
        </>
      )}
    </Rahmen>
  )
}

/**
 * Ein Supplement zum Stack (`AddSupplementModal`).
 *
 * `[cmd]` **Die Suche geht ueber den Katalog**, der im Kontext liegt.
 * Ohne Treffer bleibt der freie Name — `stack_items` fuehrt beides
 * (`supplement_id` oder `custom_name`).
 */
function AddFenster({
  payload, onClose, enhanced,
}: { payload?: Record<string, unknown>; onClose: () => void; enhanced: boolean }) {
  const { daten, katalog } = useSupp()
  const { laeuft, fehler, senden } = useSchreiben(onClose)

  const [suche, setSuche] = React.useState(String(payload?.name ?? ''))
  const [gewaehltId, setGewaehltId] = React.useState<string | null>(null)
  const [dosis, setDosis] = React.useState('')
  const [einheit, setEinheit] = React.useState('mg')
  const [timing, setTiming] = React.useState('morning')

  const treffer = React.useMemo(() => {
    const q = suche.trim().toLowerCase()
    if (!q) return []
    return katalog.filter(k => k.name.toLowerCase().includes(q)).slice(0, 8)
  }, [suche, katalog])

  const gewaehlt = katalog.find(k => k.id === gewaehltId) ?? null
  const zahl = Number(dosis.replace(',', '.'))
  const gesperrt = !daten ? OHNE_DATEN
    : !(zahl > 0) ? 'Eine Dosis groesser als 0 eingeben.'
      : !einheit.trim() ? 'Die Einheit fehlt.'
        : (!gewaehltId && !suche.trim()) ? 'Einen Namen eingeben oder waehlen.'
          : undefined

  return (
    <Rahmen
      titel="Add supplement" sub={enhanced ? 'enhanced' : 'standard'}
      echt={!!daten} onClose={onClose}
      fuss={
        <SchreibFuss
          laeuft={laeuft} gesperrt={gesperrt} beschriftung="Add to stack"
          onSpeichern={() => void senden('/api/supplements/intake?was=position', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({
              supplement_id: gewaehltId,
              custom_name: gewaehltId ? null : suche.trim(),
              dose: zahl, dose_unit: einheit.trim(), timing,
            }),
          })}
        />
      }
    >
      {!daten ? (
        <NichtsZuSpeichernWeil grund={OHNE_DATEN} />
      ) : (
        <>
          <div className="v2-eyebrow" style={{ marginBottom: 4 }}>
            Supplement <span className="v2-dim">· {katalog.length} im Katalog</span>
          </div>
          <input className="v2-feld" value={suche} disabled={laeuft}
                 aria-label="Supplement suchen" placeholder="Name suchen oder eingeben"
                 onChange={e => { setSuche(e.target.value); setGewaehltId(null) }} />

          {treffer.length > 0 && !gewaehltId && (
            <div className="v2-col-gap" style={{ gap: 3, marginTop: 6 }}>
              {treffer.map(k => (
                <button key={k.id} type="button" disabled={laeuft}
                        onClick={() => { setGewaehltId(k.id); setSuche(k.name) }}
                        style={{
                          textAlign: 'left', padding: '6px 9px', fontSize: 11.5,
                          background: 'var(--surface)', border: '1px solid var(--border)',
                          borderRadius: 6, cursor: 'pointer', color: 'var(--fg)',
                        }}>
                  {k.name}
                  {k.evidence_grade && (
                    <span className="v2-dim" style={{ marginLeft: 6 }}>
                      {k.evidence_grade}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
          {gewaehlt && (
            <p className="v2-dim" style={{ fontSize: 10.5, marginTop: 6 }}>
              Aus dem Katalog: <span className="v2-num">{gewaehlt.name}</span>
              {gewaehlt.category && <> · {gewaehlt.category}</>}
            </p>
          )}

          <div className="v2-grid v2-g-cols-3" style={{ gap: 10, marginTop: 12 }}>
            <div>
              <div className="v2-eyebrow" style={{ marginBottom: 4 }}>Dose</div>
              <input className="v2-feld" inputMode="decimal" value={dosis}
                     aria-label="Dosis" disabled={laeuft}
                     onChange={e => setDosis(e.target.value)} />
            </div>
            <div>
              <div className="v2-eyebrow" style={{ marginBottom: 4 }}>Unit</div>
              <select className="v2-feld" value={einheit} disabled={laeuft}
                      aria-label="Einheit"
                      onChange={e => setEinheit(e.target.value)}>
                {['mg', 'g', 'IU', 'µg', 'ml', 'capsules', 'softgels'].map(u => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>
            <div>
              <div className="v2-eyebrow" style={{ marginBottom: 4 }}>Timing</div>
              <select className="v2-feld" value={timing} disabled={laeuft}
                      aria-label="Zeitpunkt"
                      onChange={e => setTiming(e.target.value)}>
                {['morning', 'pre_workout', 'post_workout', 'with_meal', 'evening']
                  .map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          {/* `[read]` Keine Dosisempfehlung: `typical_dose_min/max` sind
              auf allen 44 Katalogeintraegen leer (G-91). */}
          <p className="v2-dim" style={{ fontSize: 10.5, marginTop: 10, lineHeight: 1.6 }}>
            Die Dosis wird nicht vorgeschlagen — der Katalog fuehrt keine.
          </p>
          <Schreibfehler text={fehler} />
        </>
      )}
    </Rahmen>
  )
}

/**
 * Bestand nachtragen (`ReorderModal`).
 *
 * `[cmd]` **Es gibt keine `user_inventory`-Tabelle.** Bestand und
 * Schwelle stehen in `stack_items` (`stock_remaining`,
 * `low_stock_threshold`) — dieselben Spalten, aus denen G-74
 * `tage_bis_leer` und `unter_schwelle` rechnet.
 *
 * `[read]` **Das Fenster bestellt nichts.** Es traegt nach, was da ist;
 * eine Bestellung braucht `shopping_lists` (C-175).
 */
function ReorderFenster({
  payload, onClose,
}: { payload?: Record<string, unknown>; onClose: () => void }) {
  const { daten } = useSupp()
  const { laeuft, fehler, senden } = useSchreiben(onClose)

  const knapp = React.useMemo(
    () => (daten?.positionen ?? []).filter(x => x.unter_schwelle === true),
    [daten])
  const vorgabe = String(payload?.id ?? '')
  const [positionId, setPositionId] = React.useState(
    vorgabe || knapp[0]?.id || '')
  const [bestand, setBestand] = React.useState('')

  const alle = daten?.positionen ?? []
  const gewaehlt = alle.find(x => x.id === positionId) ?? null
  const zahl = Number(bestand.replace(',', '.'))
  const gesperrt = !daten ? OHNE_DATEN
    : !positionId ? 'Erst eine Position waehlen.'
      : !(zahl >= 0) ? 'Eine Menge von 0 oder mehr eingeben.'
        : undefined

  return (
    <Rahmen
      titel="Bestand nachtragen"
      sub={knapp.length ? `${knapp.length} unter der Schwelle` : undefined}
      breite={560} echt={!!daten} onClose={onClose}
      fuss={
        <SchreibFuss
          laeuft={laeuft} gesperrt={gesperrt} beschriftung="Bestand setzen"
          onSpeichern={() => void senden('/api/supplements/intake', {
            method: 'PATCH',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ id: positionId, stock_remaining: zahl }),
          })}
        />
      }
    >
      {!daten ? (
        <NichtsZuSpeichernWeil grund={OHNE_DATEN} />
      ) : (
        <>
          {knapp.length > 0 && (
            <div style={{ marginBottom: 12 }}>
              {knapp.map(x => (
                <div key={x.id} style={{ padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
                    <span style={{ fontSize: 12, flex: 1 }}>{x.name}</span>
                    <span className="v2-num v2-dim" style={{ fontSize: 10.5 }}>
                      {x.stock_remaining} {x.stock_unit}
                      {x.low_stock_threshold !== null && <> · Schwelle {x.low_stock_threshold}</>}
                      {x.tage_bis_leer !== null && <> · noch {x.tage_bis_leer} Tage</>}
                    </span>
                  </div>
                  {x.low_stock_threshold !== null && x.stock_remaining !== null && (
                    <Meter value={x.stock_remaining}
                           max={Math.max(x.low_stock_threshold * 2, x.stock_remaining)}
                           color="var(--warn)" />
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="v2-eyebrow" style={{ marginBottom: 4 }}>Position</div>
          <select className="v2-feld" value={positionId} disabled={laeuft}
                  aria-label="Position"
                  onChange={e => setPositionId(e.target.value)}>
            <option value="">— waehlen —</option>
            {alle.map(x => (
              <option key={x.id} value={x.id}>
                {x.name} · {x.stock_remaining ?? '—'} {x.stock_unit ?? ''}
              </option>
            ))}
          </select>

          <div className="v2-eyebrow" style={{ marginBottom: 4, marginTop: 10 }}>
            Neuer Bestand {gewaehlt?.stock_unit && <span className="v2-dim">· {gewaehlt.stock_unit}</span>}
          </div>
          <input className="v2-feld" inputMode="decimal" value={bestand}
                 aria-label="Neuer Bestand" disabled={laeuft}
                 placeholder={gewaehlt?.stock_remaining !== null && gewaehlt
                   ? String(gewaehlt.stock_remaining) : 'Menge'}
                 onChange={e => setBestand(e.target.value)} />

          {/* G-124: die Abfrage nennt den Eintrag, nicht „wirklich?". */}
          {gewaehlt && (
            <p className="v2-dim" style={{ fontSize: 10.5, marginTop: 8, lineHeight: 1.6 }}>
              <span className="v2-num">{gewaehlt.name}</span>:{' '}
              <span className="v2-num">{gewaehlt.stock_remaining ?? '—'}</span> →{' '}
              <span className="v2-num">{bestand.trim() || '—'}</span> {gewaehlt.stock_unit ?? ''}.
              Bestellt wird nichts — dafuer fehlt `shopping_lists` (C-175).
            </p>
          )}
          <Schreibfehler text={fehler} />
        </>
      )}
    </Rahmen>
  )
}

function LogInjektionFenster({ onClose }: { onClose: () => void }) {
  const [ort, setOrt] = React.useState('vglute_l')
  const [ml, setMl] = React.useState(0.6)
  const [schmerz, setSchmerz] = React.useState(1)

  const s = INJ_ORTE.find(x => x.id === ort)!
  const st = ortZustand(ort)
  const ueberGrenze = ml > s.maxMl
  const zuFrueh = st.status === 'resting'
  const gesperrt = ueberGrenze || zuFrueh

  return (
    <Rahmen
      titel="Log injection"
      sub="Site rotation and volume are validated before saving"
      breite={680}
      onClose={onClose}
      fuss={(
        <>
          <button type="button" className="v2-btn v2-btn-ghost" onClick={onClose}>Cancel</button>
          <div className="v2-spacer" />
          {gesperrt && (
            <button type="button" className="v2-btn v2-btn-ghost v2-btn-sm" style={{ color: 'var(--warn)' }}>
              Override with reason
            </button>
          )}
          {/* `[cmd]` SEIT G-56 EIN ZWEIG STATT ZWEI.
              `InEntwicklungKnopf` kennt jetzt `disabled` — vorher stand
              hier ein doppelter Zweig, weil `packages/ui` in G-29/G-45
              gesperrt war und der gesperrte Zustand kein Zierrat ist:
              er verhindert das Speichern bei ueberschrittener Menge
              oder laufendem Ruhefenster. Der Knopf oeffnet dann auch
              das Attrappenfenster nicht. */}
          <InEntwicklungKnopf
            titel="Log injection"
            grund={OHNE_SCHEMA}
            className="v2-btn v2-btn-primary"
            disabled={gesperrt}
          >
            <Icon name="check" className="v2-ic v2-ic-sm" />Log injection
          </InEntwicklungKnopf>
        </>
      )}
    >
      <div className="v2-grid v2-g-cols-3" style={{ gap: 10, marginBottom: 12 }}>
        <div>
          <div className="v2-eyebrow" style={{ marginBottom: 4 }}>Compound</div>
          <select className="v2-feld" aria-label="Compound">
            {INJ_PROTOKOLL.map(l => l.compound)
              .filter((c, i, a) => a.indexOf(c) === i)
              .map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <div className="v2-eyebrow" style={{ marginBottom: 4 }}>Date</div>
          <input className="v2-feld v2-mono" type="date" defaultValue="2026-08-15" aria-label="Date" />
        </div>
        <div>
          <div className="v2-eyebrow" style={{ marginBottom: 4 }}>Time</div>
          <input className="v2-feld v2-mono" type="time" defaultValue="07:15" aria-label="Time" />
        </div>
      </div>

      <div className="v2-eyebrow" style={{ marginBottom: 6 }}>Site · pick from the list</div>
      <div className="v2-inj-wahl">
        {INJ_ORTE.map(x => {
          const xs = ortZustand(x.id)
          const an = x.id === ort
          return (
            <button
              key={x.id}
              type="button"
              onClick={() => setOrt(x.id)}
              className="v2-inj-wahl-knopf"
              aria-pressed={an}
              style={{
                background: an ? `color-mix(in oklch, ${xs.c} 10%, var(--surface))` : 'var(--surface)',
                border: `1px solid ${an ? `color-mix(in oklch, ${xs.c} 35%, var(--border))` : 'var(--border)'}`,
              }}
            >
              <span
                style={{
                  width: 6, height: 6, borderRadius: 999, background: xs.c,
                  flexShrink: 0, opacity: xs.status === 'resting' ? 0.5 : 1,
                }}
              />
              <span style={{ fontSize: 11, flex: 1, color: an ? 'var(--fg)' : 'var(--fg-muted)' }}>{x.name}</span>
              <span className="v2-dim v2-mono" style={{ fontSize: 9 }}>
                {xs.daysAgo != null ? `${xs.daysAgo}d` : 'new'}
              </span>
            </button>
          )
        })}
      </div>

      <div className="v2-grid v2-g-cols-3" style={{ gap: 10, marginBottom: 12 }}>
        <div>
          <div className="v2-eyebrow" style={{ marginBottom: 4 }}>Volume · max {s.maxMl} ml</div>
          <input
            className="v2-feld v2-mono"
            type="number"
            step="0.05"
            value={ml}
            onChange={e => setMl(Number(e.target.value))}
            aria-label="Volume"
            style={{
              border: `1px solid ${ueberGrenze ? 'var(--neg)' : 'var(--border)'}`,
              color: ueberGrenze ? 'var(--neg)' : 'var(--fg)',
            }}
          />
        </div>
        <div>
          <div className="v2-eyebrow" style={{ marginBottom: 4 }}>Dose</div>
          <input className="v2-feld v2-mono" defaultValue="150" aria-label="Dose" />
        </div>
        <div>
          <div className="v2-eyebrow" style={{ marginBottom: 4 }}>Needle · recommended</div>
          <input className="v2-feld v2-mono" defaultValue={s.needle} aria-label="Needle" />
        </div>
      </div>

      <div className="v2-eyebrow" style={{ marginBottom: 6 }}>Injection pain · 0–3</div>
      <div style={{ display: 'flex', gap: 5, marginBottom: 12 }}>
        {['none', 'mild', 'moderate', 'severe'].map((l, i) => (
          <button
            key={l}
            type="button"
            onClick={() => setSchmerz(i)}
            className={schmerz === i ? 'v2-btn v2-btn-primary v2-btn-sm' : 'v2-btn v2-btn-sm'}
            style={{ flex: 1 }}
          >
            {i} · {l}
          </button>
        ))}
      </div>

      <div className="v2-eyebrow" style={{ marginBottom: 4 }}>Notes</div>
      <input
        className="v2-feld"
        placeholder="Bleeding, lump, unusual soreness…"
        aria-label="Notes"
        style={{ marginBottom: 12 }}
      />

      {gesperrt ? (
        <div className="v2-inj-pruefung-rot">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <Icon name="alert" className="v2-ic v2-ic-sm" style={{ color: 'var(--neg)' }} />
            <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--neg)' }}>Validation</span>
          </div>
          <div className="v2-col-gap" style={{ gap: 3 }}>
            {ueberGrenze && (
              <div className="v2-mono" style={{ fontSize: 11, color: 'var(--fg-muted)' }}>
                volume {ml} ml exceeds {s.name} limit of {s.maxMl} ml
              </div>
            )}
            {zuFrueh && (
              <div className="v2-mono" style={{ fontSize: 11, color: 'var(--fg-muted)' }}>
                {s.name} used {st.daysAgo}d ago · rest window is {s.restDays}d
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="v2-inj-pruefung-gruen">
          <Icon
            name="check"
            className="v2-ic v2-ic-sm"
            style={{ display: 'inline', verticalAlign: 'middle', marginRight: 5, color: 'var(--pos)' }}
          />
          {s.name} is clear · {st.daysAgo != null ? `last used ${st.daysAgo}d ago` : 'never used'}
          {' '}· volume within {s.maxMl} ml limit
        </div>
      )}
    </Rahmen>
  )
}
