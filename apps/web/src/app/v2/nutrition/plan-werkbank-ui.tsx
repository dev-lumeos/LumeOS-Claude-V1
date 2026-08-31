'use client'

// ════════════════════════════════════════════════════════════════════
// DIE WERKBANK — C-372 / G-306 / C-375
// ════════════════════════════════════════════════════════════════════
//
// **E-41, die Rollenteilung:**
//
//     Meal plans   Bibliothek: alle Plaene, aktivieren,
//                  „Bearbeiten" fuehrt in den Planner
//     Planner      Werkbank: Auflistung aller Plaene, neu anlegen,
//                  Positionen und Rezepte einfuegen
//
// **ADR #17:** ein aktiver Plan hat READ-ONLY Positionen.
// **Der Ausweg steht dort:** pausieren, Kopie erstellen, bearbeiten.
//
// `[read]` **Ohne Knopf ist die Regel eine Sackgasse** — deshalb
// steht „Kopie bearbeiten" an jedem gesperrten Plan.
//
// `[read]` **A-30:** nur Typen aus dem Leseweg, kein Wertimport.
import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Card, Pill, Icon, Empty } from '@lumeos/ui'

import type { PlanKurz } from '../../../lib/nutrition/plan-lesen'
import {
  sperreVon, SPERRE_MARKE, kopieHilft,
  WOCHEN_MIN, WOCHEN_MAX,
} from '../../../lib/nutrition/plan-werkbank'
import { statusText, herkunftVon, HERKUNFT_TEXT }
  from '../../../lib/nutrition/plan-lage'

async function senden(koerper: unknown): Promise<{
  ok: boolean; fehler?: string; daten?: Record<string, unknown>
}> {
  const antwort = await fetch('/api/nutrition/plan', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(koerper),
  })
  const k = await antwort.json().catch(() => null)
  if (antwort.ok) return { ok: true, daten: k ?? undefined }
  return { ok: false, fehler: k?.error ?? `Fehler ${antwort.status}` }
}

// ════════════════════════════════════════════════════════════════════
// C-372 — einen Plan anlegen, MIT Wochen
// ════════════════════════════════════════════════════════════════════
//
// **E-40:** *,,Was beim Anlegen zaehlt: Name, Beschreibung,
// Tagesziele, und wie viele Wochen."*
//
// `[read]` **Lebenszyklus und Startdatum stehen NICHT hier** — sie
// entstehen beim Aktivieren (Flow 3, Schritte 5 und 6). **Das alte
// Formular fragte beides und legte trotzdem einen Plan ohne Wochen
// an** (G-304).

export function NeuerPlanForm({ heute, onFertig, onAbbruch }: {
  heute: string
  onFertig: (id: string) => void
  onAbbruch: () => void
}) {
  const [name, setName] = React.useState('')
  const [beschreibung, setBeschreibung] = React.useState('')
  const [wochen, setWochen] = React.useState('4')
  const [kcal, setKcal] = React.useState('')
  const [protein, setProtein] = React.useState('')
  const [kh, setKh] = React.useState('')
  const [fett, setFett] = React.useState('')
  const [laeuft, setLaeuft] = React.useState(false)
  const [fehler, setFehler] = React.useState<string | null>(null)

  const w = Number(wochen)
  const bereit = name.trim().length > 0
    && Number.isFinite(w) && w >= WOCHEN_MIN && w <= WOCHEN_MAX

  const zahl = (s: string): number | null => {
    const x = Number(s.replace(',', '.'))
    return s.trim() === '' || !Number.isFinite(x) ? null : x
  }

  async function anlegen() {
    setLaeuft(true); setFehler(null)
    const r = await senden({
      art: 'plan_werkbank',
      name: name.trim(),
      description: beschreibung.trim() || null,
      target_kcal: zahl(kcal),
      target_protein_g: zahl(protein),
      target_carbs_g: zahl(kh),
      target_fat_g: zahl(fett),
      wochen: Math.round(w),
      // `[read]` **Das Datum kommt vom Aufrufer, nie aus `new Date()`
      // im Schreibweg** — sonst rechnet der Server eine andere Woche
      // als der Browser.
      heute,
    })
    setLaeuft(false)
    if (!r.ok) { setFehler(r.fehler ?? 'Fehler'); return }
    onFertig(String(r.daten?.id ?? ''))
  }

  return (
    <Card title="Neuer Plan" sub="E-40 · die Werkbank">
      <div className="v2-col-gap" style={{ gap: 8 }}>
        <label style={{ fontSize: 10 }}>
          <span className="v2-eyebrow">Name</span>
          <input className="v2-feld" style={{ width: '100%' }} value={name}
                 aria-label="Planname"
                 onChange={e => setName(e.target.value)} />
        </label>

        <label style={{ fontSize: 10 }}>
          <span className="v2-eyebrow">Beschreibung (optional)</span>
          <input className="v2-feld" style={{ width: '100%' }} value={beschreibung}
                 aria-label="Beschreibung"
                 onChange={e => setBeschreibung(e.target.value)} />
        </label>

        <label style={{ fontSize: 10 }}>
          <span className="v2-eyebrow">Wie viele Wochen?</span>
          <input className="v2-feld" type="number" min={WOCHEN_MIN} max={WOCHEN_MAX}
                 style={{ width: 110 }} value={wochen}
                 aria-label="Anzahl Wochen"
                 onChange={e => setWochen(e.target.value)} />
        </label>

        <div className="v2-eyebrow">Tagesziele (optional)</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {([['kcal', kcal, setKcal], ['Protein g', protein, setProtein],
             ['KH g', kh, setKh], ['Fett g', fett, setFett]] as const).map(
            ([label, wert, setzen]) => (
              <label key={label} style={{ fontSize: 10 }}>
                <span className="v2-eyebrow">{label}</span>
                <input className="v2-feld" type="number" min="0"
                       style={{ width: 90 }} value={wert} aria-label={label}
                       onChange={e => setzen(e.target.value)} />
              </label>
            ))}
        </div>

        {/* `[cmd]` **E-40: Startdatum und Lebenszyklus gehoeren nicht
            hierher** — sie entstehen beim Aktivieren (Flow 3, 5+6).
            `[read]` **Der Satz steht da, damit die Abwesenheit eine
            Entscheidung ist und kein Vergessen.** */}
        <p className="v2-muted" style={{ fontSize: 10.5, lineHeight: 1.5 }}>
          Startdatum und Lebenszyklus werden beim <strong>Aktivieren</strong>{' '}
          gewählt, nicht hier — ein Plan ist wiederverwendbar und hängt
          nicht an einem Datum.
        </p>

        {fehler && (
          <p style={{ fontSize: 11, color: 'var(--neg)', margin: 0 }}>{fehler}</p>
        )}

        <div style={{ display: 'flex', gap: 6 }}>
          <button type="button" className="v2-btn v2-btn-primary"
                  disabled={!bereit || laeuft} onClick={anlegen}>
            {laeuft ? 'Legt an…' : `Plan mit ${Number.isFinite(w) ? w : 0} Wochen anlegen`}
          </button>
          <button type="button" className="v2-btn" onClick={onAbbruch}>
            Abbrechen
          </button>
        </div>
      </div>
    </Card>
  )
}

// ════════════════════════════════════════════════════════════════════
// G-306 — „Kopie bearbeiten", der Ausweg aus der Aktivsperre
// ════════════════════════════════════════════════════════════════════

export function KopieKnopf({ plan, onFertig }: {
  plan: PlanKurz; onFertig: (id: string) => void
}) {
  const [offen, setOffen] = React.useState(false)
  const [pausieren, setPausieren] = React.useState(false)
  const [laeuft, setLaeuft] = React.useState(false)
  const [fehler, setFehler] = React.useState<string | null>(null)

  async function kopieren() {
    setLaeuft(true); setFehler(null)
    const r = await senden({
      art: 'plan_kopieren', id: plan.id, original_pausieren: pausieren,
    })
    setLaeuft(false)
    if (!r.ok) { setFehler(r.fehler ?? 'Fehler'); return }
    setOffen(false)
    onFertig(String(r.daten?.id ?? ''))
  }

  if (!offen) {
    return (
      <button type="button" className="v2-btn v2-btn-sm v2-btn-primary"
              onClick={() => setOffen(true)}>
        <Icon name="copy" className="v2-ic v2-ic-sm" /> Kopie bearbeiten
      </button>
    )
  }

  return (
    <div style={{
      border: '1px solid var(--acc-nutri)', borderRadius: 6, padding: 8,
      marginTop: 6, background: 'var(--surface-2)', fontSize: 11.5,
    }}>
      <p style={{ margin: '0 0 6px', lineHeight: 1.5 }}>
        Es entsteht ein <strong>Entwurf</strong> mit denselben{' '}
        {plan.wochen} Wochen und {plan.positionen} Positionen. Der laufende
        Plan behält sein Protokoll.
      </p>
      {/* `[cmd]` **Der ADR nennt das Pausieren als ersten Schritt** —
          `[read]` **hier ist es eine Wahl:** wer eine Variante baut,
          laesst das Original laufen. */}
      <label style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
        <input type="checkbox" checked={pausieren}
               aria-label="Original pausieren"
               onChange={e => setPausieren(e.target.checked)} />
        <span>Original dabei pausieren</span>
      </label>
      {fehler && (
        <p style={{ fontSize: 10.5, color: 'var(--neg)', margin: '0 0 6px' }}>{fehler}</p>
      )}
      <div style={{ display: 'flex', gap: 6 }}>
        <button type="button" className="v2-btn v2-btn-sm v2-btn-primary"
                disabled={laeuft} onClick={kopieren}>
          {laeuft ? 'Kopiert…' : 'Kopie anlegen'}
        </button>
        <button type="button" className="v2-btn v2-btn-sm"
                onClick={() => setOffen(false)}>
          Abbrechen
        </button>
      </div>
    </div>
  )
}

// ════════════════════════════════════════════════════════════════════
// Die Auflistung aller Plaene — E-41
// ════════════════════════════════════════════════════════════════════

export function PlanListe({ plaene, heute, aktiv, onWaehlen }: {
  plaene: readonly PlanKurz[]
  heute: string
  /** Welcher Plan ist in der Werkbank offen? */
  aktiv: string | null
  onWaehlen: (id: string) => void
}) {
  const router = useRouter()
  const [neu, setNeu] = React.useState(false)
  const neuLaden = React.useCallback(() => { router.refresh() }, [router])

  if (neu) {
    return (
      <NeuerPlanForm
        heute={heute}
        onFertig={id => { setNeu(false); neuLaden(); if (id) onWaehlen(id) }}
        onAbbruch={() => setNeu(false)}
      />
    )
  }

  return (
    <div className="v2-col-gap" style={{ gap: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span className="v2-eyebrow">Alle Pläne</span>
        <span className="v2-num v2-dim" style={{ fontSize: 10.5 }}>
          {plaene.length}
        </span>
        <div className="v2-spacer" />
        <button type="button" className="v2-btn v2-btn-sm v2-btn-primary"
                onClick={() => setNeu(true)}>
          <Icon name="plus" className="v2-ic v2-ic-sm" /> Neuer Plan
        </button>
      </div>

      {plaene.length === 0 && (
        <Card>
          <Empty
            title="Noch kein Plan"
            sub="Ein Plan besteht aus Wochen und Tagen — „Neuer Plan“ legt beides an."
            icon="calendar"
          />
        </Card>
      )}

      {plaene.map(p => {
        const sperre = sperreVon(p.status, p.darf_bearbeiten)
        const marke = SPERRE_MARKE[sperre.art]
        const herkunft = herkunftVon(p.plan_origin)
        const offen = aktiv === p.id
        return (
          <Card key={p.id} style={offen
            ? { border: '1px solid var(--acc-nutri)' }
            : undefined}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap',
            }}>
              <span style={{ fontSize: 13.5, fontWeight: 600 }}>{p.name}</span>
              <Pill variant={p.status === 'active' ? 'pos' : undefined}>
                {statusText(p.status)}
              </Pill>
              {/* `[read]` **Zwei Sperren, zwei Marken** (E-41) — sie
                  haben verschiedene Auswege und duerfen nicht wie eine
                  aussehen. */}
              {marke && <Pill>{marke}</Pill>}
              {herkunft !== 'unbekannt' && herkunft !== 'self_created' && (
                <Pill variant="acc">{HERKUNFT_TEXT[herkunft]}</Pill>
              )}
              <span className="v2-num v2-dim" style={{ marginLeft: 'auto', fontSize: 10.5 }}>
                {p.wochen} Wochen · {p.tage} Tage · {p.positionen} Positionen
              </span>
            </div>

            {p.description && (
              <div className="v2-muted" style={{ fontSize: 11.5, marginTop: 4 }}>
                {p.description}
              </div>
            )}

            {/* Der Grund der Sperre — und der Ausweg, wenn es einen gibt. */}
            {sperre.art !== 'offen' && (
              <div className="v2-dim" style={{
                fontSize: 10.5, marginTop: 6, lineHeight: 1.5,
              }}>
                {sperre.satz}
                {sperre.art === 'aktiv' && <> {sperre.ausweg}</>}
              </div>
            )}

            <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
              {sperre.art === 'offen' && (
                <button type="button"
                        className={offen ? 'v2-btn v2-btn-sm v2-btn-primary' : 'v2-btn v2-btn-sm'}
                        onClick={() => onWaehlen(p.id)}>
                  {offen ? 'In der Werkbank' : 'Bearbeiten'}
                </button>
              )}
              {/* `[read]` **Der Ausweg nur, wo er hilft** — bei fremder
                  Herkunft fuehrte eine Kopie um die Entscheidung des
                  Erstellers herum. */}
              {kopieHilft(sperre) && (
                <KopieKnopf plan={p} onFertig={id => { neuLaden(); if (id) onWaehlen(id) }} />
              )}
              {!offen && sperre.art !== 'offen' && !kopieHilft(sperre) && (
                <span className="v2-dim" style={{ fontSize: 10.5 }}>
                  Nur ansehen und aktivieren.
                </span>
              )}
            </div>
          </Card>
        )
      })}
    </div>
  )
}


/**
 * Die Werkbank-Liste mit ihrem Zustand.
 *
 * `[read]` **Ein eigener Baustein, weil `ansicht.tsx` eine
 * Serverkomponente ist** und `useState` dort nicht laufen kann.
 * **Kein zweiter Ort fuer dieselbe Sache** — er ruft `PlanListe`.
 */
export function PlanWerkbank({ plaene, heute }: {
  plaene: readonly PlanKurz[]; heute: string
}) {
  // `[read]` **Der aktive Plan ist vorgewaehlt** — das Raster darunter
  // zeigt ohnehin ihn, und zwei verschiedene Auswahlen nebeneinander
  // waeren verwirrend.
  const [gewaehlt, setGewaehlt] = React.useState<string | null>(
    () => plaene.find(p => p.is_active)?.id ?? plaene[0]?.id ?? null,
  )
  return (
    <PlanListe
      plaene={plaene}
      heute={heute}
      aktiv={gewaehlt}
      onWaehlen={setGewaehlt}
    />
  )
}
