'use client'

// Die Substanzdatenbank: Liste und Detailansicht (C-224).
//
// `[cmd]` `substance_catalog` (566 Zeilen, 290 mit Kimi-Tiefe) wurde
// von der Oberflaeche bis C-224 nie gelesen — „wir recherchieren nicht
// daten dass sie dann rumliegen" (Tom, 2026-08-22). Diese Karte haengt
// unter dem Catalog-Tab; der 44er-`supplement_catalog` daneben bleibt
// unberuehrt.
//
// **Jeder Block zeigt seine Herkunft daneben** — source_id,
// Evidenzklasse und Stichtag aus `evidence_provenance`. Ein Feld ohne
// Vermerk traegt sichtbar „ohne Herkunft". Wo nichts steht, steht
// nichts: kein Platzhalter, keine Null, kein Strich.
//
// **Zuteilbar zum gewaehlten Stack** — ueber den bestehenden
// Schreibweg (`/api/supplements/intake?was=position`, G-148), erweitert
// um die Stackwahl. Dosis und Einheit tippt der Nutzer; hier wird
// keine Zahl vorbefuellt, die wie eine Empfehlung aussaehe.
//
// KEINE Kategorienfilter, KEINE Farben je Kategorie — das haengt an
// C-197 (Codex) und kommt danach.
import * as React from 'react'
import { Card, Pill, Icon } from '@lumeos/ui'

import type {
  EigenerStack, SubstanzListenEintrag, SubstanzSatz,
} from '../../../lib/supplements/substanz-read'
import {
  baueBloecke, benannteLuecken, type Block, type Feld,
} from '../../../lib/supplements/substanz-anzeige'
// C-227: Kategorienfilter und Farben — Quelle canonical_category.
import {
  UNZUGEORDNET_ID, UNZUGEORDNET_TEXT, filtereKategorien,
  kategorieFarbe, kategorieLabel, kategorieVon, zaehleKategorien,
} from '../../../lib/supplements/substanz-kategorien'

const TIMINGS = ['morning', 'midday', 'evening', 'pre_workout',
  'post_workout', 'bedtime', 'with_meal', 'any'] as const
const FREQUENZEN = ['daily', 'weekdays', 'training_days', 'custom'] as const

/**
 * Die Kategorie-Kennzeichnung — Farbe UND Text, nie nur Farbe.
 * `unzugeordnet` erklaert sich per title, statt wie eine Restklasse
 * auszusehen.
 */
function KategoriePill({ kategorie }: { kategorie: string }) {
  const farbe = kategorieFarbe(kategorie)
  return (
    <span
      className="v2-pill"
      title={kategorie === UNZUGEORDNET_ID ? UNZUGEORDNET_TEXT : undefined}
      style={{
        fontSize: 9, color: farbe,
        borderColor: `color-mix(in oklch, ${farbe} 45%, var(--border))`,
        background: `color-mix(in oklch, ${farbe} 10%, transparent)`,
      }}
    >
      {kategorieLabel(kategorie)}
    </span>
  )
}

/** Die Herkunfts-Pill an jedem Feld — Klasse · Quelle · Stichtag. */
function HerkunftPill({ f }: { f: Feld }) {
  if (!f.herkunft) {
    return (
      <span className="v2-mono" style={{
        fontSize: 8.5, color: 'var(--warn)', whiteSpace: 'nowrap',
      }}>ohne Herkunft</span>
    )
  }
  const h = f.herkunft
  return (
    <span className="v2-mono v2-dim" style={{ fontSize: 8.5, whiteSpace: 'nowrap' }}>
      {[h.evidence_class, h.source_id, h.as_of].filter(Boolean).join(' · ')}
    </span>
  )
}

function BlockKarte({ b }: { b: Block }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div className="v2-eyebrow" style={{ marginBottom: 6 }}>{b.titel}</div>
      <div className="v2-col-gap" style={{ gap: 6 }}>
        {b.felder.map(f => (
          <div key={f.pfad} style={{
            padding: '7px 10px', background: 'var(--surface)',
            border: '1px solid var(--border)', borderRadius: 5,
          }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'baseline', marginBottom: 2 }}>
              <span style={{ fontSize: 11.5, fontWeight: 600 }}>{f.label}</span>
              <span style={{ marginLeft: 'auto' }}><HerkunftPill f={f} /></span>
            </div>
            {f.zeilen.map((z, i) => (
              <div key={i} className="v2-muted" style={{ fontSize: 11, lineHeight: 1.5 }}>{z}</div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

/** Das Zuteilformular — Stackwahl, Dosis, Einheit, Timing, Frequenz. */
function ZuteilFormular({ satz, stacks }: { satz: SubstanzSatz; stacks: EigenerStack[] }) {
  const [stackId, setStackId] = React.useState(stacks[0]?.id ?? '')
  const [dose, setDose] = React.useState('')
  const [einheit, setEinheit] = React.useState('')
  const [timing, setTiming] = React.useState<string>('any')
  const [frequenz, setFrequenz] = React.useState<string>('daily')
  const [meldung, setMeldung] = React.useState<string | null>(null)
  const [laeuft, setLaeuft] = React.useState(false)

  if (stacks.length === 0) {
    return (
      <div className="v2-dim" style={{ fontSize: 11, lineHeight: 1.5 }}>
        Kein eigener Stack — zuerst unter „Stack" einen anlegen.
      </div>
    )
  }

  async function zuteilen() {
    setLaeuft(true)
    setMeldung(null)
    try {
      const antwort = await fetch('/api/supplements/intake?was=position', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          custom_name: satz.canonical_name,
          dose: Number(dose),
          dose_unit: einheit,
          timing, frequency: frequenz,
          stack_id: stackId,
          notes: `substance_catalog:${satz.id}`,
        }),
      })
      const j = await antwort.json() as { error?: string }
      setMeldung(antwort.ok
        ? `Zugeteilt zu „${stacks.find(s => s.id === stackId)?.name ?? 'Stack'}".`
        : j.error ?? 'Fehlgeschlagen.')
    } catch (e) {
      setMeldung(e instanceof Error ? e.message : String(e))
    } finally {
      setLaeuft(false)
    }
  }

  const feldStil: React.CSSProperties = { fontSize: 11.5, minWidth: 0 }
  return (
    <div>
      <div className="v2-eyebrow" style={{ marginBottom: 6 }}>Zum Stack zuteilen</div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
        <select className="v2-feld" style={{ ...feldStil, flex: '1 1 140px' }}
                value={stackId} onChange={e => setStackId(e.target.value)}
                aria-label="Stack">
          {stacks.map(s => (
            <option key={s.id} value={s.id}>
              {s.name}{s.is_active ? ' · aktiv' : ''}
            </option>
          ))}
        </select>
        {/* Dosis und Einheit tippt der Nutzer — nichts vorbefuellt. */}
        <input className="v2-feld" style={{ ...feldStil, width: 70 }} value={dose}
               onChange={e => setDose(e.target.value)} placeholder="Dosis"
               inputMode="decimal" aria-label="Dosis" />
        <input className="v2-feld" style={{ ...feldStil, width: 64 }} value={einheit}
               onChange={e => setEinheit(e.target.value)} placeholder="Einheit"
               aria-label="Einheit" />
        <select className="v2-feld" style={{ ...feldStil, width: 110 }} value={timing}
                onChange={e => setTiming(e.target.value)} aria-label="Timing">
          {TIMINGS.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
        </select>
        <select className="v2-feld" style={{ ...feldStil, width: 110 }} value={frequenz}
                onChange={e => setFrequenz(e.target.value)} aria-label="Frequenz">
          {FREQUENZEN.map(f => <option key={f} value={f}>{f.replace(/_/g, ' ')}</option>)}
        </select>
        <button type="button" className="v2-btn v2-btn-primary"
                disabled={laeuft || !(Number(dose) > 0) || !einheit.trim()}
                onClick={zuteilen}>
          <Icon name="plus" className="v2-ic v2-ic-sm" />
          Zuteilen
        </button>
      </div>
      {meldung && (
        <div style={{ fontSize: 11, marginTop: 6 }} className="v2-muted">{meldung}</div>
      )}
    </div>
  )
}

function SubstanzModal({
  satz, stacks, onClose,
}: {
  satz: SubstanzSatz
  stacks: EigenerStack[]
  onClose: () => void
}) {
  const bloecke = baueBloecke(satz)
  const luecken = benannteLuecken(satz)
  return (
    <div className="v2-modal-veil" onClick={onClose} role="presentation">
      <div className="v2-modal" onClick={e => e.stopPropagation()}
           role="dialog" aria-modal="true" aria-label={satz.canonical_name}
           style={{ maxWidth: 680 }}>
        <div className="v2-modal-h">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 15, fontWeight: 600 }}>{satz.canonical_name}</span>
              {/* C-227: dieselbe Kennzeichnung wie in der Liste. */}
              <KategoriePill kategorie={kategorieVon({
                canonical_category: satz.canonical_category ?? null,
              })} />
            </div>
            <div className="v2-dim v2-mono" style={{ fontSize: 10, marginTop: 2 }}>
              {[satz.compound_type, satz.category, satz.chemical_form, satz.id]
                .filter(Boolean).join(' · ')}
            </div>
          </div>
          <button type="button" className="v2-btn v2-btn-ghost v2-btn-sm" onClick={onClose}>
            <Icon name="x" className="v2-ic v2-ic-sm" />
          </button>
        </div>
        <div className="v2-modal-body" style={{ overflowY: 'auto' }}>
          {satz.aliases.length > 0 && (
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 12 }}>
              {satz.aliases.slice(0, 8).map(a => <Pill key={a}>{a}</Pill>)}
            </div>
          )}

          {bloecke.map(b => <BlockKarte key={b.titel} b={b} />)}

          {/* Die benannten Luecken — der Grund, wie er dasteht. */}
          {luecken.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <div className="v2-eyebrow" style={{ marginBottom: 6 }}>
                Benannte Lücken
              </div>
              {luecken.map(l => (
                <div key={l.feld} className="v2-dim" style={{ fontSize: 10.5, lineHeight: 1.55 }}>
                  <span className="v2-mono">{l.feld}</span> — {l.grund}
                </div>
              ))}
            </div>
          )}

          {bloecke.length === 0 && (
            <div className="v2-muted" style={{ fontSize: 11.5, marginBottom: 14 }}>
              Zu dieser Substanz liegen über Name, Einordnung und Aliasse
              hinaus keine Rechercheblöcke vor.
            </div>
          )}
        </div>
        <div className="v2-modal-f" style={{ display: 'block' }}>
          <ZuteilFormular satz={satz} stacks={stacks} />
        </div>
      </div>
    </div>
  )
}

/** Die Karte unter dem Catalog-Tab: Suche über 566, Klick öffnet das Detail. */
export function SubstanzKatalogKarte({
  liste, stacks,
}: {
  liste: SubstanzListenEintrag[]
  stacks: EigenerStack[]
}) {
  const [frage, setFrage] = React.useState('')
  const [satz, setSatz] = React.useState<SubstanzSatz | null>(null)
  const [ladeFehler, setLadeFehler] = React.useState<string | null>(null)

  // Deep-Link: `?substanz=<id>` oeffnet das Detail direkt — fuer
  // Verweise aus Berichten und fuer den Screenshot-Nachweis (schuss
  // klickt nicht). Nur beim ersten Rendern gelesen.
  React.useEffect(() => {
    const id = new URLSearchParams(window.location.search).get('substanz')
    if (id) void oeffne(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // C-227: Mehrfachauswahl — Peptide UND SARMs zugleich. Eine leere
  // Auswahl heisst „alle". Die Zaehler an den Knoepfen sind gezaehlt.
  const [kategorien, setKategorien] = React.useState<ReadonlySet<string>>(new Set())
  const kategorieZaehler = React.useMemo(() => zaehleKategorien(liste), [liste])

  function schalteKategorie(k: string) {
    setKategorien(alt => {
      const neu = new Set(alt)
      if (neu.has(k)) neu.delete(k)
      else neu.add(k)
      return neu
    })
  }

  const treffer = React.useMemo(() => {
    const f = frage.trim().toLowerCase()
    const nachKategorie = filtereKategorien(liste, kategorien)
    const menge = f
      ? nachKategorie.filter(s => s.name.toLowerCase().includes(f)
        || (s.category ?? '').toLowerCase().includes(f))
      : nachKategorie
    return { gezeigt: menge.slice(0, 30), gesamt: menge.length }
  }, [liste, frage, kategorien])

  async function oeffne(id: string) {
    setLadeFehler(null)
    try {
      const antwort = await fetch(`/api/supplements/substanz?id=${encodeURIComponent(id)}`)
      const j = await antwort.json() as { satz?: SubstanzSatz; error?: string }
      if (!antwort.ok || !j.satz) {
        setLadeFehler(j.error ?? 'Nicht geladen.')
        return
      }
      setSatz(j.satz)
    } catch (e) {
      setLadeFehler(e instanceof Error ? e.message : String(e))
    }
  }

  if (liste.length === 0) return null

  return (
    <Card
      title="Substanzdatenbank"
      sub={`${liste.length} Substanzen · supplements.substance_catalog`}
    >
      <div style={{ position: 'relative', marginBottom: 10 }}>
        <Icon name="search" className="v2-ic v2-ic-sm v2-supp-suchsymbol" />
        <input
          className="v2-feld"
          value={frage}
          onChange={e => setFrage(e.target.value)}
          placeholder="Substanz suchen · Name, Kategorie…"
          aria-label="Substanz suchen"
          style={{ paddingLeft: 30 }}
        />
      </div>

      {/* C-227: der Kategorienfilter. Nur Kategorien, die vorkommen —
          und jede mit Farbe UND Text. */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
        <span className="v2-eyebrow" style={{ alignSelf: 'center', marginRight: 4 }}>
          Kategorie
        </span>
        {kategorieZaehler.map(([k, n]) => {
          const farbe = kategorieFarbe(k)
          const aktiv = kategorien.has(k)
          return (
            <button
              key={k} type="button" onClick={() => schalteKategorie(k)}
              className="v2-pill" aria-pressed={aktiv}
              title={k === UNZUGEORDNET_ID ? UNZUGEORDNET_TEXT : undefined}
              style={{
                cursor: 'pointer', padding: '3px 10px', fontSize: 10.5,
                fontWeight: aktiv ? 600 : 400,
                color: farbe,
                borderColor: aktiv ? farbe : `color-mix(in oklch, ${farbe} 35%, var(--border))`,
                background: aktiv
                  ? `color-mix(in oklch, ${farbe} 16%, transparent)`
                  : `color-mix(in oklch, ${farbe} 5%, transparent)`,
              }}
            >
              {kategorieLabel(k)} · {n}
            </button>
          )
        })}
      </div>
      {kategorien.has(UNZUGEORDNET_ID) && (
        <div className="v2-dim" style={{ fontSize: 10, marginBottom: 8, lineHeight: 1.5 }}>
          unzugeordnet heißt: {UNZUGEORDNET_TEXT}.
        </div>
      )}

      <div className="v2-col-gap" style={{ gap: 0 }}>
        {treffer.gezeigt.map(s => (
          <div key={s.id} className="v2-row" style={{ cursor: 'pointer' }}
               onClick={() => oeffne(s.id)}>
            <span className="v2-row-l" style={{ minWidth: 0 }}>
              <span style={{
                fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>{s.name}</span>
              <KategoriePill kategorie={kategorieVon(s)} />
              {s.grad && <Pill style={{ fontSize: 9 }}>{s.grad}</Pill>}
            </span>
            <span className="v2-row-r v2-dim v2-mono" style={{ fontSize: 9.5 }}>
              {[s.compound_type, s.category].filter(Boolean).join(' · ')}
            </span>
          </div>
        ))}
      </div>
      <div className="v2-dim" style={{ fontSize: 10, marginTop: 8 }}>
        {treffer.gezeigt.length < treffer.gesamt
          ? `${treffer.gezeigt.length} von ${treffer.gesamt} Treffern — Suche verfeinern für mehr.`
          : `${treffer.gesamt} ${kategorien.size ? 'Treffer' : 'Einträge'}.`}
      </div>
      {ladeFehler && (
        <div style={{ fontSize: 11, color: 'var(--warn)', marginTop: 6 }}>{ladeFehler}</div>
      )}

      {satz && (
        <SubstanzModal satz={satz} stacks={stacks} onClose={() => setSatz(null)} />
      )}
    </Card>
  )
}
