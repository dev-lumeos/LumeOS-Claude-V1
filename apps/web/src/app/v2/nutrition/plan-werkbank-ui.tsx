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
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, Pill, Icon, Empty } from '@lumeos/ui'

import type { PlanKurz } from '../../../lib/nutrition/plan-lesen'
import {
  darfWeiterverkaufen, KEIN_WEITERVERKAUF_MARKE, KEIN_WEITERVERKAUF_SATZ,
  ABLAUF_WEGE, WEG_TEXT, WEG_ERKLAERUNG, vorschlagFuer, vorschlagSatz,
  ABLAUF_FRAGE_TITEL, ablaufFrage,
  WOCHEN_MIN, WOCHEN_MAX,
  type AblaufWeg,
  // G-309: Flow 3, Schritte 5-7 — aktivieren.
  AKTIVIEREN_TITEL, startVorgabe, startGrenze, startErlaubt, startFehler,
  pausiertSatz, ZYKLUS_WAEHLBAR, ZYKLUS_FEHLT_SATZ,
} from '../../../lib/nutrition/plan-werkbank'
import { ZYKLUS_TEXT, ZYKLUS_ERKLAERUNG, zyklusVon }
  from '../../../lib/nutrition/plan-lage'
import { statusText, herkunftVon, HERKUNFT_TEXT }
  from '../../../lib/nutrition/plan-lage'
// C-377: die Laufzeit steht in den Tagen, nicht in `start_date` (G-298).
import { laufzeitVon, LAUFZEIT_MARKE }
  from '../../../lib/nutrition/plan-eintrag-lage'

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

// ══ „Kopie bearbeiten" ist entfernt — G-306/E-42 ═══════════════════
//
// `[cmd]` **E-42 hebt die Sperre auf, zu der dieser Knopf der Ausweg
// war.** `[read]` **Ein Ausweg ohne Sperre ist keiner.**
//
// **Tom, 2026-08-31:** *,,wenn wir den einschraenken dass er nicht
// editieren kann dann bescheisst er sich ja selber."*

// ════════════════════════════════════════════════════════════════════
// C-377/C-373 — die Frage beim Ablauf
// ════════════════════════════════════════════════════════════════════
//
// **Tom:** *,,ist ein kompletter plan abgelaufen muss eine meldung
// kommen und geklaert werden wie es weiter geht, renew/anderen
// wochenplan/manuelle erfassung."*
//
// `[cmd]` **Heute stand dort *aktiv · abgelaufen* und sonst nichts.**

// ════════════════════════════════════════════════════════════════════
// EINEN PLAN AKTIVIEREN — G-309, Flow 3, Schritte 5–7
// ════════════════════════════════════════════════════════════════════
//
// `[cmd]` **Am 2026-09-01 gemessen: es gab keinen Aktivieren-Knopf.**
// `[read]` **Damit war Flow 3 an Schritt 4 zu Ende** — und ohne
// aktiven Plan gibt es keine Ghost Entries, also auch nichts zu
// bestaetigen. **Das war die Wurzel des leeren `meal_plan_logs`.**

export function AktivierenFrage({ plan, laufender, heute, onFertig, onAbbruch }: {
  plan: PlanKurz
  /** Der Plan, der gerade laeuft — oder `null`. */
  laufender: PlanKurz | null
  heute: string
  onFertig: () => void
  onAbbruch: () => void
}) {
  const [start, setStart] = React.useState(() => startVorgabe(heute))
  const [zyklus, setZyklus] = React.useState<'once' | 'rollover'>('once')
  const [laeuft, setLaeuft] = React.useState(false)
  const [fehler, setFehler] = React.useState<string | null>(null)

  async function aktivieren() {
    // `[read]` **Erst pruefen, dann senden** — der Serverweg pruefte
    // das Fenster nicht, und ein Startdatum in drei Wochen waere
    // stillschweigend durchgegangen.
    if (!startErlaubt(start, heute)) {
      setFehler(startFehler(heute))
      return
    }
    setLaeuft(true); setFehler(null)
    // `[cmd]` **EIN Aufruf, nicht drei** — `plan_aendern` traegt
    // `status`, `start_date` und `lifecycle_type` zugleich. **Das
    // Pausieren des laufenden Plans macht der Schreibweg** (G-309),
    // nicht die Anzeige.
    const r = await senden({
      art: 'plan_aendern', id: plan.id,
      status: 'active', start_date: start, lifecycle_type: zyklus,
    })
    setLaeuft(false)
    if (!r.ok) { setFehler(r.fehler ?? 'Fehler'); return }
    onFertig()
  }

  return (
    <div style={{
      border: '1px solid var(--acc-nutri)', borderRadius: 6, padding: 10,
      marginTop: 8, background: 'var(--surface-2)',
    }}>
      <div style={{ fontSize: 12.5, fontWeight: 600, marginBottom: 6 }}>
        {AKTIVIEREN_TITEL}
      </div>

      {/* Flow 3, Schritt 7: der bestehende Plan wird pausiert — und
          das steht VORHER da, nicht als Ueberraschung danach. */}
      {laufender && laufender.id !== plan.id && (
        <p className="v2-muted" style={{
          fontSize: 11, margin: '0 0 8px', lineHeight: 1.5,
        }}>
          {pausiertSatz(laufender.name)}
        </p>
      )}

      {/* Flow 3, Schritt 5: Startdatum. */}
      <label style={{ fontSize: 10, display: 'block', marginBottom: 8 }}>
        <span className="v2-eyebrow">Startdatum</span>
        <input className="v2-feld" type="date" value={start}
               aria-label="Startdatum" style={{ width: '100%' }}
               min={heute} max={startGrenze(heute)}
               onChange={e => setStart(e.target.value)} />
      </label>

      {/* Flow 3, Schritt 6: Lifecycle. */}
      <div className="v2-eyebrow" style={{ marginBottom: 4 }}>Lebenszyklus</div>
      <div className="v2-col-gap" style={{ gap: 4, marginBottom: 8 }}>
        {ZYKLUS_WAEHLBAR.map(w => (
          <button
            key={w}
            type="button"
            onClick={() => setZyklus(w)}
            aria-pressed={zyklus === w}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
              gap: 2, padding: '7px 9px', borderRadius: 6, cursor: 'pointer',
              textAlign: 'left', width: '100%', color: 'inherit',
              background: zyklus === w ? 'var(--bg-elev)' : 'var(--surface)',
              border: `1px solid ${zyklus === w ? 'var(--acc-nutri)' : 'var(--border)'}`,
            }}
          >
            <span style={{ fontSize: 11.5, fontWeight: zyklus === w ? 600 : 400 }}>
              {ZYKLUS_TEXT[zyklusVon(w)]}
            </span>
            <span className="v2-dim" style={{ fontSize: 10.5, lineHeight: 1.45 }}>
              {ZYKLUS_ERKLAERUNG[zyklusVon(w)]}
            </span>
          </button>
        ))}
      </div>

      {/* `[cmd]` **`sequence` fehlt, und der Satz sagt warum** — der
          CHECK verlangt `next_plan_id`, und den Planpicker aus
          Schritt 6 gibt es nicht. `[read]` **Eine Wahl, die beim
          Speichern scheitert, ist schlimmer als eine, die fehlt.** */}
      <p className="v2-dim" style={{ fontSize: 10, margin: '0 0 8px', lineHeight: 1.45 }}>
        {ZYKLUS_FEHLT_SATZ}
      </p>

      {fehler && (
        <p style={{ fontSize: 10.5, color: 'var(--neg)', margin: '0 0 6px' }}>{fehler}</p>
      )}

      <div style={{ display: 'flex', gap: 6 }}>
        <button type="button" className="v2-btn v2-btn-sm v2-btn-primary"
                disabled={laeuft} onClick={aktivieren}>
          {laeuft ? 'Aktiviert…' : 'Aktivieren'}
        </button>
        <button type="button" className="v2-btn v2-btn-sm"
                disabled={laeuft} onClick={onAbbruch}>
          Abbrechen
        </button>
      </div>
    </div>
  )
}

export function AblaufFrage({ plan, bis, tage, heute, onFertig }: {
  plan: PlanKurz
  bis: string
  tage: number
  heute: string
  onFertig: () => void
}) {
  const vorschlag = vorschlagFuer(plan.lifecycle_type)
  const [weg, setWeg] = React.useState<AblaufWeg>(vorschlag ?? 'neu_starten')
  const [start, setStart] = React.useState(heute)
  const [laeuft, setLaeuft] = React.useState(false)
  const [fehler, setFehler] = React.useState<string | null>(null)

  async function klaeren() {
    setLaeuft(true); setFehler(null)
    const r = await senden({
      art: 'ablauf_klaeren', id: plan.id, weg,
      ...(weg === 'neu_starten' ? { start_date: start } : {}),
    })
    setLaeuft(false)
    if (!r.ok) { setFehler(r.fehler ?? 'Fehler'); return }
    onFertig()
  }

  return (
    <div style={{
      border: '1px solid var(--warn)', borderRadius: 6, padding: 10,
      marginTop: 8, background: 'var(--surface-2)',
    }}>
      <div style={{ fontSize: 12.5, fontWeight: 600, marginBottom: 4 }}>
        {ABLAUF_FRAGE_TITEL}
      </div>
      <p className="v2-muted" style={{ fontSize: 11.5, margin: '0 0 8px', lineHeight: 1.5 }}>
        {ablaufFrage(bis, tage)}
      </p>

      {/* `[cmd]` **C-373: der Lebenszyklus bestimmt den VORSCHLAG,
          nicht die Handlung.** `[read]` **Bei `NULL` gibt es keinen
          Vorschlag** — dann stehen die drei Wege gleichwertig da. */}
      <p className="v2-dim" style={{ fontSize: 10.5, margin: '0 0 8px', lineHeight: 1.5 }}>
        {vorschlagSatz(plan.lifecycle_type)}
      </p>

      <div className="v2-col-gap" style={{ gap: 4, marginBottom: 8 }}>
        {ABLAUF_WEGE.map(w => (
          <button
            key={w}
            type="button"
            onClick={() => setWeg(w)}
            aria-pressed={weg === w}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
              gap: 2, padding: '7px 9px', borderRadius: 6, cursor: 'pointer',
              textAlign: 'left', width: '100%', color: 'inherit',
              background: weg === w ? 'var(--bg-elev)' : 'var(--surface)',
              border: `1px solid ${weg === w ? 'var(--acc-nutri)' : 'var(--border)'}`,
            }}
          >
            <span style={{ fontSize: 11.5, fontWeight: weg === w ? 600 : 400 }}>
              {WEG_TEXT[w]}
              {vorschlag === w && (
                <span className="v2-dim" style={{ fontWeight: 400 }}> · vorgeschlagen</span>
              )}
            </span>
            <span className="v2-dim" style={{ fontSize: 10.5, lineHeight: 1.45 }}>
              {WEG_ERKLAERUNG[w]}
            </span>
          </button>
        ))}
      </div>

      {weg === 'neu_starten' && (
        <label style={{ fontSize: 10, display: 'block', marginBottom: 8 }}>
          <span className="v2-eyebrow">Neuer Start</span>
          <input className="v2-feld" type="date" value={start}
                 aria-label="Neues Startdatum" style={{ width: '100%' }}
                 onChange={e => setStart(e.target.value)} />
        </label>
      )}

      {fehler && (
        <p style={{ fontSize: 10.5, color: 'var(--neg)', margin: '0 0 6px' }}>{fehler}</p>
      )}

      <button type="button" className="v2-btn v2-btn-sm v2-btn-primary"
              disabled={laeuft} onClick={klaeren}>
        {laeuft ? 'Übernimmt…' : 'Übernehmen'}
      </button>
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
  // G-309: welcher Plan wird gerade aktiviert? (Flow 3, Schritte 5–7)
  const [aktiviert, setAktiviert] = React.useState<string | null>(null)
  const neuLaden = React.useCallback(() => { router.refresh() }, [router])

  // `[read]` **Der laufende Plan** — er wird beim Aktivieren pausiert,
  // und die Frage sagt es vorher.
  const laufender = plaene.find(p => p.status === 'active') ?? null

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
        // C-375/E-42: das Flag sagt etwas, es sperrt nichts.
        const verkaeuflich = darfWeiterverkaufen(p.darf_weiterverkaufen)
        const herkunft = herkunftVon(p.plan_origin)
        // ══ C-377: wann ist die Frage OFFEN? ═════════════════
        //
        // `[cmd]` **Nicht schon, wenn der letzte Tag vorbei ist.**
        // `[read]` **Ein Plan, der auf `completed` steht, HAT die
        // Frage beantwortet** — sie noch einmal zu stellen hiesse,
        // die Entscheidung des Nutzers zu ignorieren.
        //
        // `[cmd]` **Am 2026-09-01 im Browser gemessen:** nach dem Weg
        // *,,anderen Plan aktivieren"* stand der Plan auf
        // `completed`, **und die Frage blieb trotzdem stehen.**
        // **Das war ein Fehler in dieser Bedingung, nicht im
        // Schreibweg.**
        const laufzeit = laufzeitVon(
          p.letzter_tag ? [p.letzter_tag] : [], heute)
        const laeuftNoch = p.status === 'active' || p.status === 'assigned'
        const abgelaufen = laufzeit.art === 'abgelaufen' && laeuftNoch
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
              {/* `[cmd]` **C-375/E-42: die Marke sagt, was nicht geht
                  — und das ist der WEITERVERKAUF, nicht das
                  Bearbeiten.** `[read]` **Der Plan gehoert dem
                  Kaeufer; er darf ihn aendern.** */}
              {!verkaeuflich && <Pill>{KEIN_WEITERVERKAUF_MARKE}</Pill>}
              {/* C-377: die Marke steht am Plan, die Frage darunter. */}
              {abgelaufen && LAUFZEIT_MARKE.abgelaufen && (
                <Pill>{LAUFZEIT_MARKE.abgelaufen}</Pill>
              )}
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

            {!verkaeuflich && (
              <div className="v2-dim" style={{
                fontSize: 10.5, marginTop: 6, lineHeight: 1.5,
              }}>
                {KEIN_WEITERVERKAUF_SATZ}
              </div>
            )}

            {/* ══ C-377: die Frage, nicht nur die Marke ══════════
                `[cmd]` **Heute stand dort *aktiv · abgelaufen* und
                sonst nichts** (G-304). `[read]` **Eine Marke ohne Weg
                ist eine Feststellung, keine Klaerung.** */}
            {abgelaufen && laufzeit.art === 'abgelaufen' && (
              <AblaufFrage
                plan={p}
                bis={laufzeit.bis}
                tage={laufzeit.tage}
                heute={heute}
                onFertig={neuLaden}
              />
            )}

            {/* ══ G-309: Flow 3, Schritte 5–7 ═══════════════════
                `[cmd]` **Hier stand nur *Bearbeiten*** — der
                Aktivierungsweg fehlte ganz. */}
            {aktiviert === p.id && (
              <AktivierenFrage
                plan={p}
                laufender={laufender}
                heute={heute}
                onFertig={() => { setAktiviert(null); neuLaden() }}
                onAbbruch={() => setAktiviert(null)}
              />
            )}

            <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
              {/* `[read]` **Ein laufender Plan wird nicht noch einmal
                  aktiviert** — er laeuft ja. **Ein pausierter schon:**
                  so holt man ihn zurueck. */}
              {p.status !== 'active' && aktiviert !== p.id && (
                <button type="button" className="v2-btn v2-btn-sm v2-btn-primary"
                        onClick={() => setAktiviert(p.id)}>
                  Aktivieren
                </button>
              )}
              {/* `[cmd]` **E-42: JEDER Plan ist bearbeitbar** — auch
                  ein aktiver, auch ein gekaufter. **Gesperrt sind
                  einzelne Positionen, sobald sie protokolliert
                  sind**, und das steht an der Position. */}
              <button type="button"
                      className={offen ? 'v2-btn v2-btn-sm v2-btn-primary' : 'v2-btn v2-btn-sm'}
                      onClick={() => onWaehlen(p.id)}>
                {offen ? 'In der Werkbank' : 'Bearbeiten'}
              </button>
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
  // ══ G-311: der Sprung geht ueber die URL ════════════════
  //
  // `[cmd]` **Vorher stand hier ein `useState`** — der Knopf setzte
  // ihn, **und das Raster darunter zeigte weiter den aktiven Plan.**
  // `[read]` **Der Zustand blieb im Client, der Plan wird auf dem
  // Server geladen** — sie konnten sich gar nicht treffen.
  //
  // `[read]` **Ueber `?plan=` liest ihn `ladePlan`**, und ein
  // Neuladen behaelt die Wahl.
  const router = useRouter()
  const params = useSearchParams()
  const ausUrl = params.get('plan')
  const gewaehlt = ausUrl
    ?? plaene.find(p => p.is_active)?.id ?? plaene[0]?.id ?? null

  return (
    <PlanListe
      plaene={plaene}
      heute={heute}
      aktiv={gewaehlt}
      onWaehlen={id => {
        const q = new URLSearchParams(params.toString())
        q.set('plan', id)
        // `[read]` **`scroll: false`** — der Nutzer steht in der
        // Liste; nach oben zu springen waere ein Ortswechsel, den er
        // nicht ausgeloest hat.
        router.push(`?${q.toString()}`, { scroll: false })
      }}
    />
  )
}
