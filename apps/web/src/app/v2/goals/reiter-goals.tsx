'use client'

// G-648 — der Reiter Goals 1:1 nach dem Entwurf
// (`docs/spezifikation/goals-ziel-setzen/entwurf/Main.dc.html`, Dossier 8.4–8.6).
//
//   Steuerung      Karte mit Start · Trend · Ziel, Fortschritt, Prognose,
//                  Tagesziel, Phase, Modulen; Details (Verlauf, Kennzahlen,
//                  Wochen, Meilensteine) und Bearbeiten IN der Karte;
//                  Zustaende aktiv / pausiert / eingefroren / kein Ziel
//                  (+ ohne laufende Phase, G-637 — der Entwurf kennt ihn nicht)
//   Diese Woche    Bewegung gegen Soll, Balken grau = Soll, Farbe = erreicht
//   Module         vier Kacheln, Beitrag zum steuernden Ziel, Engpass
//   Messziele      Kacheln je Kategorie mit Lage, Details mit Datenpunkten,
//                  Bearbeiten in der Kachel
//   Abgeschlossen  eingefrorene Ziele, offen wie im Entwurf
//
// `[read]` **Keine Attrappen-Zahl:** jede Zahl kommt aus einem Leseweg. Was die
// Kette noch nicht liefert, steht als Abschnitt mit „kommt" und dem Punkt
// (G-650 Verlauf/Prognose/Wochen, G-627 Anpassung).
//
// `[read]` **Farben aus den Tokens** (`goals.css`, Klassen `ge-*`), die Masse
// aus dem Entwurf.
import * as React from 'react'
import { useRouter } from 'next/navigation'

import { KeinZielWarnung } from '../kein-ziel-warnung'
import { verlaufAktion, zielSpeichern } from './ziel-aktionen'
import {
  ABSCHLUSS, KATEGORIE_NAME, KATEGORIE_REIHE, LAGE_TEXT, MODUL_NAME,
  istAbgeschlossen, kalenderwoche, kategorieVon, lageVon,
  moduleVon, quelleLesbar, steuerZustand, steuerziel, wertMitEinheit,
  type Modul,
} from '../../../lib/goals/reiter'
import { MESSARTEN, einheitLesbar, type Kategorie } from '../../../lib/goals/messziel'
import { phasenLauf, wocheText } from '../../../lib/goals/plan'
import { PHASENARTEN } from '../../../lib/goals/phase-regeln'
import { GRUND_TEXT, aktionen } from '../../../lib/goals/zustand'
import { ArchivierenKnopf, LoeschenFrage, NeuStartenFluss } from './lebenszyklus'
import { richtungen } from '../../../lib/goals/zielwahl'
import type { Koerpermessung, Meilenstein, Phase, ZielFortschritt, Zielphase } from '../../../lib/goals/lesen'
import type { Strategie } from '../../../lib/goals/strategie-read'
import type { Anpassungswoche, Plan } from '../../../lib/goals/plan-read'
import { anpassungZeile } from './plan-seite'
import type { Zielvorschlag, Zielwerte } from '../../../lib/profile/zielwerte-read'
import type { Ausblick, Messwoche, Modulkacheln, Verlauf, Wochendaten } from '../../../lib/goals/reiter-read'

/** `prognose.plan_status` ohne Datum (G-653) — je Schluessel ein Satz. */
export const PLAN_STATUS: Record<string, string> = {
  kein_aktiver_plan: 'kein aktiver Plan', nicht_im_plan: 'Plan endet vor dem Ziel', nicht_absehbar: 'nicht absehbar',
}
/** Gruende aus `controlling_goal_outlook.prognose.grund` (G-650) — je Schluessel ein Satz. */
export const PROGNOSE_GRUND: Record<string, string> = {
  ziel_nicht_aktiv: 'Ziel ruht', kein_gewichts_ziel: 'kein Gewichtsziel', keine_gewichtsmessung: 'noch keine Messung',
  zu_wenig_trenddaten: 'zu wenig Trenddaten (4 Wochen)', tempo_entgegen_ziel: 'nicht absehbar – Tempo gegen das Ziel', tempo_zu_gering: 'nicht absehbar – Tempo zu gering',
}

const datumDe = (iso: string | null) => iso ? iso.split('-').reverse().join('.') : '—'
const kurzDe = (iso: string | null) => iso ? `${iso.slice(8, 10)}.${iso.slice(5, 7)}.` : '—'
const zahl = (n: number, s = 0) => n.toLocaleString('de-DE', { minimumFractionDigits: s, maximumFractionDigits: s })
/** Vorzeichen wie im Entwurf: „−0,3", „+0,21", „±0,0". */
const vz = (n: number, s = 1) => (Math.abs(n) < 10 ** -s / 2 ? '±' : n > 0 ? '+' : '−') + zahl(Math.abs(n), s)
const tageBis = (frist: string | null, heute: string) =>
  frist ? Math.round((Date.parse(`${frist}T12:00:00Z`) - Date.parse(`${heute}T12:00:00Z`)) / 86400000) : null
const tagMinus = (tag: string, n: number) => {
  const d = new Date(`${tag}T12:00:00Z`); d.setUTCDate(d.getUTCDate() - n)
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`
}

/** Gewicht wie im Entwurf: eine Nachkommastelle („85,0 kg"); andere Einheiten wie gehabt. */
const wertKg = (n: number | null, einheit: string | null) => n !== null && einheit === 'kg' ? `${zahl(n, 1)} kg` : wertMitEinheit(n, einheit)

/** „kommt" mit dem Punkt, der es liefert. */
function Kommt({ was, punkt }: { was?: string; punkt: string }) {
  return <span className="ge-kommt" data-kommt={punkt}>{was ? `${was} — ` : ''}kommt ({punkt})</span>
}

// ── Symbole des Entwurfs ─────────────────────────────────────────
const SVG = (p: { children: React.ReactNode; w?: number }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={p.w ?? 1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{p.children}</svg>
)
const I = {
  waage: <SVG><path d="M4 20h16l-2-12H6z" /><path d="M9 8a3 3 0 0 1 6 0" /><path d="M12 12l2-2" /></SVG>,
  kraft: <SVG><path d="M6 7v10M3 9v6M18 7v10M21 9v6M6 12h12" /></SVG>,
  koerper: <SVG><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="3.5" /><circle cx="12" cy="12" r="0.8" /></SVG>,
  gew: <SVG><path d="M4 12a8 8 0 0 1 14-5.3M20 12a8 8 0 0 1-14 5.3M18 3v4h-4M6 21v-4h4" /></SVG>,
  nutri: <SVG w={2}><path d="M5 19c0-8 6-14 14-14 0 8-6 14-14 14z" /><path d="M5 19l7-7" /></SVG>,
  train: <SVG w={2}><path d="M6 7v10M3 9v6M18 7v10M21 9v6M6 12h12" /></SVG>,
  recov: <SVG w={2}><path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" /></SVG>,
  supp: <SVG w={2}><path d="M10.5 3.5a5 5 0 0 1 7 7l-7 7a5 5 0 0 1-7-7z" /><path d="M7 7l10 10" /></SVG>,
  mess: <SVG w={2}><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="3.5" /></SVG>,
}
const KAT: Record<Kategorie, { ton: string; farbe: string; ico: React.ReactNode }> = {
  kraft: { ton: 'ge-ton-train', farbe: 'var(--acc-train)', ico: I.kraft },
  koerper: { ton: 'ge-ton-goals', farbe: 'var(--acc-goals)', ico: I.koerper },
  gewohnheit: { ton: 'ge-ton-recov', farbe: 'var(--acc-recov)', ico: I.gew },
  eigenes: { ton: 'ge-ton-goals', farbe: 'var(--acc-goals)', ico: I.koerper },
}
const MODUL_ICO: Record<Modul, { ico: React.ReactNode; farbe: string }> = {
  training: { ico: I.train, farbe: 'var(--acc-train)' }, nutrition: { ico: I.nutri, farbe: 'var(--acc-nutri)' },
  recovery: { ico: I.recov, farbe: 'var(--acc-recov)' }, supplements: { ico: I.supp, farbe: 'var(--acc-suppl)' },
  medical: { ico: I.mess, farbe: 'var(--acc-medic)' }, koerper: { ico: I.mess, farbe: 'var(--acc-goals)' },
}
const ModulPill = ({ m, name }: { m: Modul; name?: string }) => (
  <span className="ge-pill" data-messziel-modul={m} style={{ color: undefined }}>
    <span style={{ color: MODUL_ICO[m].farbe, display: 'inline-flex' }}>{MODUL_ICO[m].ico}</span>{name ?? MODUL_NAME[m]}
  </span>
)

// ── Steuerung ────────────────────────────────────────────────────

/** Die Phase eines Ziels: laufend aus `phase_am`, sonst die offene aus der Tabelle (pausiert). */
function phaseZu(goalId: string, phasen: Phase[], offene: Zielphase[]) {
  const p = phasen.find(x => x.goal_id === goalId) ?? null
  const o = offene.find(x => x.goal_id === goalId) ?? null
  if (!p && !o) return null
  return {
    phase_type: p?.phase_type ?? o?.phase_type ?? null,
    gueltig_ab: p?.gueltig_ab ?? o?.gueltig_ab ?? null,
    projected_end_date: p?.projected_end_date ?? o?.projected_end_date ?? null,
    actual_end_date: p?.actual_end_date ?? o?.actual_end_date ?? null,
    strategie_code: o?.strategie_code ?? null,
    zielrate: (p as { zielrate_pct_kg_woche?: number | null } | null)?.zielrate_pct_kg_woche ?? o?.zielrate_pct_kg_woche ?? null,
  }
}

type SteuerProps = {
  ziele: ZielFortschritt[]; phasen: Phase[]; offenePhasen: Zielphase[]; zielwerte: Zielwerte | null; vorschlag: Zielvorschlag | null
  strategien: Strategie[]; plaene: Plan[]; messungen: Koerpermessung[]; meilensteine: Meilenstein[]; woche: Wochendaten
  stichtag: string; onZielSetzen: () => void; onPhaseEngine: () => void
}

function Steuerung(p: SteuerProps) {
  const router = useRouter()
  const [offen, setOffen] = React.useState(false)
  const [edit, setEdit] = React.useState(false)
  const [frage, setFrage] = React.useState(false)
  const [loeschen, setLoeschen] = React.useState(false)
  const [fehler, setFehler] = React.useState<string | null>(null)
  const st = steuerziel(p.ziele)
  const zustand = steuerZustand({
    herkunft: p.zielwerte?.herkunft ?? null, ruhend: !!p.zielwerte?.ruhendes_ziel,
    steuerziel: st, laufendePhaseZumZiel: !!(st && p.phasen.some(x => x.goal_id === st.goal_id)),
  })
  // Das Ziel, das die Karte zeigt: laufend, pausiert (ruhend) oder eingefroren.
  const gid = zustand === 'pausiert' ? p.zielwerte?.ruhendes_ziel?.goal_id
    : zustand === 'eingefroren' ? p.zielwerte?.eingefroren?.goal_id : st?.goal_id
  const g = gid ? p.ziele.find(z => z.goal_id === gid) ?? null : null
  const kcalErh = p.zielwerte?.kcal ?? null
  const typ = <span className="ge-typ">Steuerung · bestimmt Kalorien und Makros</span>

  const kopfSq = <div className="ge-sq ge-ton-goals">{I.waage}</div>
  const leer = zustand === 'kein_ziel' || (zustand !== 'ohne_phase' && !g)

  if (leer || zustand === 'ohne_phase') {
    return (
      <section aria-label="Steuerung" className="ge-card" data-steuerung={leer ? 'kein_ziel' : 'ohne_phase'}
               style={{ padding: 20, display: 'flex', gap: 14, alignItems: 'flex-start', ...(leer ? { borderColor: 'var(--neg)', borderWidth: 2 } : {}) }}>
        {kopfSq}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>{typ}</div>
          {leer ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }} data-kein-ziel="kein_aktives_ziel">
              <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--neg)' }}>Kein Ziel aktiv – du läufst auf Erhaltung</div>
              <div style={{ color: 'var(--fg-muted)' }}>
                Tagesziel: {kcalErh !== null ? <><span className="ge-num">{zahl(kcalErh)} kcal</span> (Erhaltung aus deinem TDEE)</> : 'nicht berechenbar'}
                {p.zielwerte?.protein_g != null && <> · <span className="ge-num">{zahl(p.zielwerte.protein_g)} g</span> Protein</>}.
                {' '}Ohne Ziel gibt es keinen Plan, keine Prognose und keine Anpassung.
              </div>
              <div><button type="button" className="ge-btn ge-btn-p" data-kein-ziel-setzen onClick={p.onZielSetzen}>Ziel setzen</button></div>
            </div>
          ) : (
            // G-637 — nicht im Entwurf: Ziel aktiv, aber keine laufende Phase.
            <KeinZielWarnung herkunft="ziel_ohne_laufende_phase" kcal={kcalErh} protein={p.zielwerte?.protein_g ?? null} ruhend={null}
                             luecke={p.zielwerte?.luecke ?? (st ? { title: st.title, letzte_phase_ende: null, recommended_next: null } : null)}
                             weg={<button type="button" className="ge-btn ge-btn-p" data-steuerung-phase onClick={p.onPhaseEngine}>Nächste Phase wählen</button>} />
          )}
        </div>
      </section>
    )
  }

  const z = g!
  const ph = phaseZu(z.goal_id, p.phasen, p.offenePhasen)
  const variante = ph?.strategie_code ? p.strategien.find(s => s.code === ph.strategie_code) ?? null : null
  const richtung = variante ? richtungen(p.strategien).find(r => r.gruppe === variante.auswahl_gruppe)?.standard.label ?? null : null
  const art = PHASENARTEN.find(a => a.id === ph?.phase_type)?.name ?? null
  const kopfName = variante ? `${richtung ? `${richtung} · ` : ''}${variante.label}` : art ?? z.title
  const plan = p.plaene.find(x => x.goal_id === z.goal_id && x.status !== 'abgeschlossen') ?? null
  const pct = z.progress_status === 'measured' && z.progress_pct !== null ? Math.max(0, Math.min(100, z.progress_pct)) : null
  const kcal = p.zielwerte?.kcal ?? p.vorschlag?.kcal ?? null
  const protein = p.zielwerte?.protein_g ?? p.vorschlag?.protein_g ?? null
  // G-645/2: dieselbe Rechnung wie der Planer (`phasenLauf`), nicht eine zweite.
  const woche = ph ? wocheText(phasenLauf(ph, p.stichtag), variante?.max_duration_weeks ?? null) : null
  const rest = tageBis(z.target_date, p.stichtag)
  const trend = p.woche.trend.heute
  // G-648 Rest: Prognose, Tempo, Soll und Wochen aus `controlling_goal_outlook` (G-650)
  const ausblick = p.woche.ausblick ?? null
  const lage = p.woche.lage?.lage ?? null
  const pausiert = zustand === 'pausiert'
  const eis = zustand === 'eingefroren'
  const grund = p.zielwerte?.eingefroren?.grund ?? z.zustand.grund
  const eisAm = p.zielwerte?.eingefroren?.am ?? z.zustand.eingefroren_am
  const chip = pausiert ? { t: 'pausiert', k: 'ge-rot' }
    : eis ? (grund === 'erreicht' ? { t: 'erreicht', k: 'ge-lage-voraus' } : { t: grund === 'beendet' ? 'beendet' : 'Frist abgelaufen', k: 'ge-grau' })
      : null
  // Wochen seit Beginn fuer die Loeschfrage — dieselbe Rechnung wie die Phase
  // (G-645/2); der Entwurf zaehlt so: „Woche 17" ↔ „17 Wochen Verlauf".
  const verlaufWochen = z.gueltig_ab ? phasenLauf({ gueltig_ab: z.gueltig_ab, projected_end_date: null, actual_end_date: null }, p.stichtag).woche : null

  return (
    <section aria-label="Steuerung" className="ge-card" data-steuerung={pausiert ? 'pausiert' : eis ? 'eingefroren' : 'laeuft'} data-steuerziel={z.goal_id}
             style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14, ...(pausiert ? { borderColor: 'var(--neg)', borderWidth: 2 } : {}) }}>
      <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
        {kopfSq}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
            {typ}
            {chip && <span className={`ge-chip ${chip.k}`} data-steuerung-chip>{chip.t}</span>}
            {/* G-654: Lage aus `controlling_goal_lage_at` (Toleranz 10 % des Zielwegs); ohne Lage keine Pille. */}
            {!chip && lage && <span className={`ge-chip ge-lage-${lage}`} data-steuerung-lage={lage}
                                    title={p.woche.lage?.abweichung_kg != null ? `${vz(p.woche.lage.abweichung_kg, 1)} kg gegen Plan` : undefined}>{LAGE_TEXT[lage]}</span>}
            <span className="ge-num" style={{ marginLeft: 'auto', fontSize: 10.5, color: 'var(--fg-subtle)' }}>
              {z.target_date ? `Frist ${datumDe(z.target_date)}${rest !== null ? ` · ${rest >= 0 ? `noch ${rest} Tage` : `${-rest} Tage vorbei`}` : ''}` : 'ohne Frist'}
            </span>
            <div style={{ display: 'flex', gap: 2 }}>
              <button type="button" className="ge-btn ge-btn-g ge-ico" aria-label="Details" aria-expanded={offen} data-steuerung-details
                      onClick={() => { setOffen(o => !o); setEdit(false) }}>{offen ? '▴' : '▾'}</button>
              <button type="button" className="ge-btn ge-btn-g ge-ico" aria-label={`${z.title} bearbeiten`} data-steuerung-bearbeiten
                      onClick={() => { setEdit(e => !e); setOffen(false) }}>✎</button>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'baseline' }}>
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, letterSpacing: '-.01em' }} data-steuerung-variante data-ziel-richtung={variante?.code ?? ''}>{kopfName}</h2>
              {!variante && <span className="ge-kommt" data-steuerung-ohne-variante title="Die Variante steht in goal_phases.strategie_code (G-609).">ohne Variante</span>}
              <span style={{ color: 'var(--fg-subtle)', fontSize: 12 }}>„{z.title}“</span>
            </div>
            <div style={{ fontSize: 12, color: 'var(--fg-muted)' }} data-steuerung-plan>
              Plan dahinter: {plan ? <><b>{plan.name}</b> · {plan.positionen.length} Phase{plan.positionen.length === 1 ? '' : 'n'}</> : <b>{art ?? '—'}</b>}
              {' · '}<button type="button" className="ge-link" onClick={p.onPhaseEngine}>in der Phase engine erweitern</button>{' '}
              <span style={{ color: 'var(--fg-subtle)' }}>(ab Pro)</span>
            </div>

            {pausiert && (
              <>
                <div className="ge-hinweis-rot" data-steuerung-pausiert style={{ padding: '10px 14px', display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center', justifyContent: 'space-between' }}>
                  <span><b>Pausiert{p.zielwerte?.ruhendes_ziel?.seit ? ` seit ${kurzDe(p.zielwerte.ruhendes_ziel.seit)}` : ''}</b> – du läufst auf Erhaltung
                    {kcalErh !== null && <> (<span className="ge-num">{zahl(kcalErh)} kcal</span>)</>}. Die Phase bleibt gespeichert.</span>
                  <button type="button" className="ge-btn" data-fortsetzen onClick={() => setFrage(f => !f)}>Fortsetzen …</button>
                </div>
                {frage && (
                  <div data-fortsetzen-frage style={{ border: '1px solid var(--border-strong)', borderRadius: 8, padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <b>Wie fortsetzen?</b>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      <button type="button" className="ge-btn ge-btn-p" data-kein-ziel-fortsetzen onClick={async () => {
                        setFehler(null)
                        const r = await zielSpeichern(z.goal_id, { status: 'active' })
                        if (r.ok) { setFrage(false); router.refresh() } else setFehler(r.fehler)
                      }}>Mit den alten Daten weiter</button>
                      <button type="button" className="ge-btn" data-fortsetzen-anpassen onClick={p.onZielSetzen}>Zuerst anpassen</button>
                    </div>
                  </div>
                )}
              </>
            )}

            {eis && (
              <div className="ge-hinweis-grau" data-steuerung-eingefroren style={{ padding: '10px 14px', display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center', justifyContent: 'space-between' }}>
                <span><b>{grund === 'erreicht'
                  ? `Erreicht am ${datumDe(eisAm)}${z.current_value !== null ? ` mit ${wertMitEinheit(z.current_value, z.target_unit)}` : ''}.`
                  : grund === 'beendet' ? `Beendet am ${datumDe(eisAm)}.`
                    : `Frist ${datumDe(z.target_date)} abgelaufen${z.current_value !== null ? ` bei ${wertMitEinheit(z.current_value, z.target_unit)}` : ''}${z.target_value !== null ? ` (von ${zahl(z.target_value, 1)})` : ''}.`}</b>
                {' '}Das Ziel ist eingefroren; seitdem gilt Erhaltung{kcalErh !== null && <> (<span className="ge-num">{zahl(kcalErh)} kcal</span>)</>} mit Warnung.</span>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {aktionen(z.zustand).neuStarten && <NeuStartenFluss ziel={z} heute={p.stichtag} primaer />}
                  {aktionen(z.zustand).loeschen && <button type="button" className="ge-btn ge-btn-r" data-ziel-loeschen={z.goal_id} onClick={() => setLoeschen(true)}>Löschen</button>}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, fontSize: 12, flexWrap: 'wrap' }} data-steuerung-werte>
              <span><span style={{ color: 'var(--fg-subtle)' }}>Start </span><span className="ge-num" style={{ fontWeight: 500 }}>{wertKg(z.start_value, z.target_unit)}</span></span>
              <span data-steuerung-trend><span style={{ color: 'var(--fg-subtle)' }}>Trend </span><span className="ge-num" style={{ fontWeight: 500 }}>{trend !== null ? `${zahl(trend, 1)} kg` : '—'}</span></span>
              <span style={{ color: 'var(--fg-dim)' }}>→</span>
              <span><span style={{ color: 'var(--fg-subtle)' }}>Ziel </span><span className="ge-num" style={{ fontWeight: 600, color: 'var(--acc-goals)' }}>{wertKg(z.target_value, z.target_unit)}</span></span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }} data-steuerung-fortschritt={pct ?? ''}>
              <div className="ge-bar" style={{ flex: 1, height: 8 }}><div style={{ width: pct === null ? 0 : `${Math.max(2, pct)}%`, background: 'var(--acc-goals)' }} /></div>
              <span className="ge-num" style={{ fontSize: 13, fontWeight: 600, color: 'var(--acc-goals)', width: 44, textAlign: 'right' }}>{pct !== null ? `${zahl(pct)} %` : '—'}</span>
            </div>
            {/* Flex statt Raster: eine Rasterspalte waechst nicht mit „2.714 kcal · 170 g P" (nowrap) und der
                Wert lief in die Spalte Phase. Als Flex-Kind ist die Mindestbreite der Text selbst. */}
            <div data-steuerung-kennzahlen style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              <div data-prognose-plan style={{ flex: '1 1 170px' }}><div className="ge-eb">nach Plan erreicht</div>
                {ausblick === null ? <div style={{ fontSize: 13, fontWeight: 600 }}><Kommt punkt="G-650" /></div>
                  : ausblick.prognose.plan_datum ? <div className="ge-num" style={{ fontSize: 15, fontWeight: 600 }}>{datumDe(ausblick.prognose.plan_datum)}</div>
                    : <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg-muted)', whiteSpace: 'nowrap' }}>{PLAN_STATUS[ausblick.prognose.plan_status ?? ''] ?? '—'}</div>}</div>
              <div data-prognose-tempo={ausblick?.prognose.status ?? ''} style={{ flex: '1 1 170px' }}><div className="ge-eb">bei deinem Tempo</div><div style={{ fontSize: 13, fontWeight: 600 }}>
                {ausblick === null ? <Kommt punkt="G-650" /> : ausblick.prognose.status === 'datum' ? <span className="ge-num">{datumDe(ausblick.prognose.datum)}</span>
                  : <span style={{ color: 'var(--warn)' }}>{PROGNOSE_GRUND[ausblick.prognose.grund ?? ''] ?? 'nicht absehbar'}</span>}
                {/* Entwurf: „nicht absehbar · −0,1 kg/Wo" — das Tempo der letzten 4 Wochen; zwei Stellen wie „Tempo 4 Wochen" in den Details */}
                {ausblick?.kennzahlen.tempo_4w_kg_pro_woche != null && <span className="ge-num" data-prognose-tempo-wert
                  style={{ color: ausblick.prognose.status === 'datum' ? undefined : 'var(--warn)' }}> · {vz(ausblick.kennzahlen.tempo_4w_kg_pro_woche, 2)} kg/Wo</span>}</div></div>
              <div data-steuerung-kcal style={{ flex: '1 1 170px' }}><div className="ge-eb">Tagesziel</div>
                <div className="ge-num" style={{ fontSize: 15, fontWeight: 600, whiteSpace: 'nowrap' }}>{kcal !== null
                  ? `${zahl(kcal)} kcal${protein !== null ? ` · ${zahl(protein)} g P` : ''}` : '—'}</div></div>
              <div data-steuerung-woche style={{ flex: '1 1 170px' }}><div className="ge-eb">Phase</div><div style={{ fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap' }}>{woche ?? '—'}</div></div>
            </div>
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }} data-steuerung-module>
              {(['nutrition', 'training', 'recovery', 'supplements'] as const).map(m => <ModulPill key={m} m={m} />)}
            </div>
          </div>
        </div>
      </div>

      {offen && <SteuerDetails z={z} ausblick={ausblick} trend={trend} messungen={p.messungen} meilensteine={p.meilensteine}
                                anpassungen={plan?.anpassungen} stichtag={p.stichtag} onPhaseEngine={p.onPhaseEngine} />}
      {edit && <SteuerBearbeiten z={z} variante={variante?.label ?? art} onZielSetzen={p.onZielSetzen}
                                 onLoeschen={() => setLoeschen(true)} onFertig={() => setEdit(false)} />}
      {loeschen && <LoeschenFrage ziel={z} art="steuer" verlaufWochen={verlaufWochen} onZu={() => setLoeschen(false)} />}
      {fehler && <div style={{ fontSize: 11.5, color: 'var(--neg)' }}>{fehler}</div>}
    </section>
  )
}

const ZEITRAUM = [['4w', '4 Wochen', 28], ['3m', '3 Monate', 91], ['all', 'alles', null]] as const
const MONAT = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez']

/** Prognoselinie bis zur Prognose, hoechstens bis zum Achsenende — dort auf der Geraden zum Ziel. */
export function prognoseEnde(vonTag: string, vonKg: number, prognose: string, zielKg: number, bis: string): { tag: string; kg: number } {
  if (prognose <= bis) return { tag: prognose, kg: zielKg }
  const t = (d: string) => Date.parse(`${d}T12:00:00Z`)
  const f = (t(bis) - t(vonTag)) / ((t(prognose) - t(vonTag)) || 1)
  return { tag: bis, kg: vonKg + (zielKg - vonKg) * f }
}

/** Anpassung wie im Entwurf: „+100 kcal", „keine (Logtage < 5)", „läuft"; der Grund steht im Titel. */
export function AnpassungZelle({ a }: { a: ReturnType<typeof anpassungZeile> }) {
  if (a.anp === null) return <td><Kommt punkt="G-627" /></td>
  const text = a.grund === 'Woche läuft noch' || a.grund === 'Protokoll folgt nach dem Tageslauf' ? 'läuft' : a.anp === 'keine' && a.grund && a.grund !== '–' ? `keine (${a.grund})` : a.anp
  return <td title={a.grund} data-steuerung-anpassung={a.regel ?? ''}>{text}</td>
}

function SteuerDetails({ z, ausblick, trend, messungen, meilensteine, anpassungen, stichtag, onPhaseEngine }: {
  z: ZielFortschritt; ausblick: Ausblick | null; trend: number | null; messungen: Koerpermessung[]; meilensteine: Meilenstein[]
  /** G-627: Wochenprotokoll des laufenden Plans (`goal_weekly_adjustments_at`). */
  anpassungen?: Anpassungswoche[] | null
  stichtag: string; onPhaseEngine: () => void
}) {
  const [bereich, setBereich] = React.useState<typeof ZEITRAUM[number][0]>('3m')
  const tage = ZEITRAUM.find(r => r[0] === bereich)![2]
  const von = tage ? tagMinus(stichtag, tage) : (z.gueltig_ab ?? messungen[0]?.measurement_date ?? stichtag)
  const prognose = ausblick?.prognose.status === 'datum' ? ausblick.prognose.datum : null
  // Entwurf: die Achse endet an der Frist; eine spaetere Prognose wird am Rand abgeschnitten (sonst 2028 auf 3 Monate)
  const bis = [stichtag, z.target_date ?? prognose].filter((d): d is string => !!d).sort().at(-1)!
  // Trend (Wochenende) und Soll nach Plan je Woche — aus der Kette (G-650)
  const wochen = (ausblick?.wochen ?? []).filter(w => w.woche_bis >= von)
  const roh = messungen.filter(m => m.weight_kg !== null && m.measurement_date >= von && m.measurement_date <= stichtag)
    .sort((a, b) => a.measurement_date.localeCompare(b.measurement_date))
  const werte = roh.map(m => m.weight_kg as number).concat([z.start_value, z.target_value, trend, ...wochen.flatMap(w => [w.trend_kg, w.soll_kg])].filter((x): x is number => x !== null))
  const lo = Math.floor(Math.min(...werte, 1e9) * 2) / 2, hi = Math.ceil(Math.max(...werte, -1e9) * 2) / 2
  const sp = hi - lo || 1
  const t0 = Date.parse(`${von}T12:00:00Z`), t1 = Date.parse(`${bis}T12:00:00Z`)
  const x = (tag: string) => 40 + ((Date.parse(`${tag}T12:00:00Z`) - t0) / ((t1 - t0) || 1)) * 590
  const y = (kg: number) => 148 - ((kg - lo) / sp) * 128
  const monate: Array<{ x: number; t: string }> = []
  for (let d = new Date(t0); d.getTime() <= t1; d.setUTCMonth(d.getUTCMonth() + 1, 1)) {
    const tag = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-01`
    if (tag >= von) monate.push({ x: x(tag), t: MONAT[d.getUTCMonth()]! })
  }
  const schritt = Math.ceil(monate.length / 6)
  const eigene = meilensteine.filter(m => m.goal_id === z.goal_id)
  const k = ausblick?.kennzahlen ?? null
  const letzte = wochen.filter(w => w.trend_kg !== null).at(-1) ?? null
  const sollText = (s: string | null) => s === 'achieved' ? 'erreicht' : s === 'missed' ? 'verfehlt' : 'offen'
  return (
    <div data-steuerung-details={z.goal_id} style={{ borderTop: '1px solid var(--border)', paddingTop: 14, display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
        <span className="ge-eb" style={{ marginRight: 6 }}>Verlauf</span>
        {ZEITRAUM.map(([id, label]) => (
          <button key={id} type="button" className={`ge-chip${bereich === id ? ' ge-chip-an' : ''}`} data-zeitraum={id} onClick={() => setBereich(id)}>{label}</button>
        ))}
      </div>
      <div style={{ overflowX: 'auto' }}>
        <svg viewBox="0 0 640 180" width="100%" style={{ maxWidth: 820, display: 'block' }} role="img" aria-label="Gewichtsverlauf mit Plan und Ziel" data-verlauf-bild={roh.length}>
          {[hi, (hi + lo) / 2, lo].map((v, i) => (
            <g key={i}>
              <line x1="40" x2="630" y1={y(v)} y2={y(v)} stroke={i === 0 ? 'none' : 'var(--border)'} />
              <text x="36" y={y(v) + 4} fontSize="10" textAnchor="end" fill="var(--fg-muted)">{zahl(v, v % 1 ? 1 : 0)}</text>
            </g>
          ))}
          {z.target_value !== null && <line x1="40" x2="630" y1={y(z.target_value)} y2={y(z.target_value)} stroke="var(--acc-goals)" strokeDasharray="2 3" />}
          {/* Plan: Soll nach den Plan-Positionen je Wochenende (G-650 `plan_soll_am`) */}
          {wochen.some(w => w.soll_kg !== null) && (
            <polyline points={wochen.filter(w => w.soll_kg !== null).map(w => `${x(w.woche_bis)},${y(w.soll_kg!)}`).join(' ')} fill="none" stroke="var(--fg-dim)" strokeDasharray="5 4" data-plan-linie />
          )}
          {roh.length > 0 && <polyline points={roh.map(m => `${x(m.measurement_date)},${y(m.weight_kg as number)}`).join(' ')} fill="none" stroke="var(--border-strong)" strokeWidth="1" data-waage-linie />}
          {wochen.some(w => w.trend_kg !== null) && (
            <polyline points={wochen.filter(w => w.trend_kg !== null).map(w => `${x(w.woche_bis)},${y(w.trend_kg!)}`).join(' ')} fill="none" stroke="var(--acc-goals)" strokeWidth="2" data-trend-linie />
          )}
          {letzte && prognose && z.target_value !== null && (() => {
            const ende = prognoseEnde(letzte.woche_bis, letzte.trend_kg!, prognose, z.target_value, bis)
            return <line x1={x(letzte.woche_bis)} y1={y(letzte.trend_kg!)} x2={x(ende.tag)} y2={y(ende.kg)} stroke="var(--acc-goals)" strokeDasharray="3 3" data-prognose-linie />
          })()}
          {z.target_value !== null && <text x="600" y={y(z.target_value) - 6} fontSize="10" fill="var(--acc-goals)">Ziel</text>}
          {monate.filter((_, i) => i % schritt === 0).map(m => <text key={m.x} x={m.x + 4} y="172" fontSize="10" fill="var(--fg-muted)">{m.t}</text>)}
        </svg>
      </div>
      <div style={{ fontSize: 11.5, color: 'var(--fg-muted)' }}>grau = Waage · gelb = Trend · gestrichelt grau = Plan · gelb gestrichelt = Prognose{ausblick === null && <> · <Kommt punkt="G-650" /></>}</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 10 }} data-steuerung-kennzahlen>
        <div><div className="ge-eb">Veränderung gesamt</div><div className="ge-num" style={{ fontWeight: 600 }}>{k?.veraenderung_gesamt_kg != null ? `${vz(k.veraenderung_gesamt_kg)} kg` : '—'}</div></div>
        <div data-kennzahl="tempo"><div className="ge-eb">Tempo 4 Wochen</div><div className="ge-num" style={{ fontWeight: 600 }}>{k === null ? <Kommt punkt="G-650" /> : k.tempo_4w_kg_pro_woche !== null ? `${vz(k.tempo_4w_kg_pro_woche, 2)} kg/Wo` : '—'}</div></div>
        <div data-kennzahl="soll"><div className="ge-eb">Soll</div><div className="ge-num" style={{ fontWeight: 600 }}>{k?.soll_kg_pro_woche != null ? `${vz(k.soll_kg_pro_woche, 2)} kg/Wo` : '—'}</div></div>
        <div><div className="ge-eb">verbleibend</div><div className="ge-num" style={{ fontWeight: 600 }}>{k?.verbleibend_kg != null ? `${zahl(Math.abs(k.verbleibend_kg), 1)} kg` : '—'}</div></div>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 18 }}>
        <div style={{ flex: '2 1 420px', minWidth: 0, overflowX: 'auto' }}>
          <div className="ge-eb" style={{ marginBottom: 4 }}>Wochen</div>
          <table className="ge-tbl" data-steuerung-wochen>
            <thead><tr><th>Woche</th><th>Trend</th><th>Δ</th><th>Soll Δ</th><th>Ø kcal</th><th>Anpassung</th></tr></thead>
            <tbody>
              {ausblick === null && <tr><td colSpan={6}><Kommt was="Wochenwerte" punkt="G-650" /> · <Kommt was="Anpassung" punkt="G-627" /></td></tr>}
              {[...(ausblick?.wochen ?? [])].reverse().slice(0, 6).map(w => (
                <tr key={w.woche_ab} data-steuerung-woche-zeile={w.woche_ab}>
                  <td>KW {kalenderwoche(w.woche_ab)}{w.vollstaendig ? '' : ' (läuft)'}</td>
                  <td className="ge-num">{w.trend_kg !== null ? zahl(w.trend_kg, 2) : '—'}</td>
                  <td className="ge-num">{w.trend_delta_kg !== null ? vz(w.trend_delta_kg, 2) : '—'}</td>
                  <td className="ge-num">{w.soll_delta_kg !== null ? vz(w.soll_delta_kg, 2) : '—'}</td>
                  <td className="ge-num">{w.durchschnitt_kcal !== null ? zahl(Math.round(w.durchschnitt_kcal)) : '—'}</td>
                  <AnpassungZelle a={anpassungZeile(anpassungen, w.woche_ab, w.vollstaendig, w.woche_ab === ausblick?.wochen.at(-1)?.woche_ab)} />
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ flex: '1 1 240px', minWidth: 0 }} data-details-meilensteine={eigene.length}>
          <div className="ge-eb" style={{ marginBottom: 4 }}>Meilensteine</div>
          {eigene.length === 0 && <div style={{ fontSize: 12, color: 'var(--fg-subtle)', padding: '6px 0' }}>Keine Meilensteine.</div>}
          {eigene.map(m => (
            <div key={m.milestone_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid var(--border)', fontSize: 12 }}>
              <span style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', border: '2px solid var(--acc-goals)', background: m.computed_status === 'achieved' ? 'var(--acc-goals)' : undefined }} />{m.title}</span>
              <span style={{ color: 'var(--fg-subtle)' }}>{m.computed_status === 'achieved' || m.computed_status === 'missed' || !m.target_date ? sollText(m.computed_status) : `offen · ${kurzDe(m.target_date)}`}</span>
            </div>
          ))}
          <div style={{ marginTop: 10 }}><button type="button" className="ge-link" onClick={onPhaseEngine}>Phasen dieses Ziels im Reiter Phase engine →</button></div>
        </div>
      </div>
    </div>
  )
}

function SteuerBearbeiten({ z, variante, onZielSetzen, onLoeschen, onFertig }: {
  z: ZielFortschritt; variante: string | null; onZielSetzen: () => void; onLoeschen: () => void; onFertig: () => void
}) {
  const router = useRouter()
  const [titel, setTitel] = React.useState(z.title)
  // Entwurf: „88,0“ — eine Stelle, Komma; das Speichern liest Komma wie Punkt
  const [ziel, setZiel] = React.useState(z.target_value !== null ? zahl(z.target_value, 1) : '')
  const [datum, setDatum] = React.useState(z.target_date ?? '')
  const [laeuft, setLaeuft] = React.useState(false)
  const [fehler, setFehler] = React.useState<string | null>(null)
  const schreib = async (a: Parameters<typeof zielSpeichern>[1]) => {
    setLaeuft(true); setFehler(null)
    const r = await zielSpeichern(z.goal_id, a)
    setLaeuft(false)
    if (r.ok) { onFertig(); router.refresh() } else setFehler(r.fehler)
  }
  const wert = ziel.trim() === '' ? null : Number(ziel.replace(',', '.'))
  return (
    <div data-steuerung-edit style={{ borderTop: '1px solid var(--border)', paddingTop: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <span className="ge-eb">Bearbeiten</span>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 12 }}>
        <div><label className="ge-lbl" htmlFor="st-titel">Titel</label><input id="st-titel" className="ge-inp" value={titel} onChange={e => setTitel(e.target.value)} /></div>
        <div><label className="ge-lbl" htmlFor="st-ziel">Zielgewicht</label><input id="st-ziel" className="ge-inp ge-num" inputMode="decimal" value={ziel} onChange={e => setZiel(e.target.value)} /></div>
        <div><label className="ge-lbl" htmlFor="st-datum">Zieldatum</label><input id="st-datum" className="ge-inp ge-num" type="date" value={datum} onChange={e => setDatum(e.target.value)} /></div>
        <div><span className="ge-lbl">Programm</span><button type="button" className="ge-btn" style={{ width: '100%' }} data-steuerung-programm onClick={onZielSetzen}>{variante ?? 'Programm'} · ändern …</button></div>
      </div>
      <div style={{ fontSize: 12, color: 'var(--fg-muted)' }}>Vor dem Speichern zeigt das System die neue Rechnung (kcal, Tempo, Datum) wie in „Ziel setzen“. <Kommt punkt="G-628" /></div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button type="button" className="ge-btn ge-btn-p" data-steuerung-speichern disabled={laeuft || !titel.trim() || (wert !== null && !Number.isFinite(wert))}
                  onClick={() => { void schreib({ title: titel.trim(), target_value: wert, target_date: datum || null }) }}>Speichern</button>
          <button type="button" className="ge-btn" data-steuerung-pausieren disabled={laeuft} onClick={() => { void schreib({ status: 'paused' }) }}>Pausieren</button>
          <button type="button" className="ge-btn" data-steuerung-beenden disabled={laeuft} onClick={() => { void schreib({ status: 'abandoned' }) }}>Beenden</button>
        </div>
        {/* G-639: nur mit Loeschweg (G-611) — sonst waere der Knopf eine Attrappe */}
        {aktionen(z.zustand).loeschen && <button type="button" className="ge-btn ge-btn-r" data-ziel-loeschen={z.goal_id} onClick={onLoeschen}>Löschen</button>}
      </div>
      {fehler && <div style={{ fontSize: 11.5, color: 'var(--neg)' }}>{fehler}</div>}
    </div>
  )
}

// ── Diese Woche + Module ─────────────────────────────────────────

/** Balkenbreiten je Zeile: der groessere von Soll (100) und Erreicht fuellt die Spur. */
export function balken(istPct: number): { soll: number; ist: number } {
  const m = Math.max(100, istPct)
  return { soll: Math.round(10000 / m), ist: Math.round((istPct * 100) / m) }
}

function DieseWoche({ ziele, phasen, offenePhasen, woche, stichtag }: {
  ziele: ZielFortschritt[]; phasen: Phase[]; offenePhasen: Zielphase[]; woche: Wochendaten; stichtag: string
}) {
  const st = steuerziel(ziele)
  const ph = st ? phaseZu(st.goal_id, phasen, offenePhasen) : null
  const { heute, vorwoche } = woche.trend
  const delta = heute !== null && vorwoche !== null ? heute - vorwoche : null
  // Soll Δ dieser Woche nach Plan (G-650); vorher aus der Phasenrate
  const dieseWoche = woche.ausblick?.wochen.at(-1) ?? null
  const soll = woche.ausblick ? dieseWoche?.soll_delta_kg ?? null : ph?.zielrate != null && vorwoche !== null ? (ph.zielrate * vorwoche) / 100 : null
  const aktiv = ziele.filter(g => g.goal_role === 'measurement' && g.zustand.zustand === 'active')
  const kraft = aktiv.filter(g => kategorieVon(g) === 'kraft')
  const fett = aktiv.filter(g => g.measurement_type === 'body_fat')
  const gewohnheit = aktiv.filter(g => g.measurement_rhythm === 'weekly')
  const trainingsZiel = gewohnheit.find(g => g.measurement_type === 'training_sessions_week') ?? null
  // Soll: das Wochenziel, sonst die aktive Routine (Tom 16.10.: Balken und „x / 4")
  const trainingsSoll = trainingsZiel?.target_value ?? woche.trainingsSoll ?? null
  type Z = { key: string; t: string; ico: React.ReactNode; ton: string; v: React.ReactNode; ist: number | null; gut: boolean | null }
  // Erreicht in % des Solls, nach oben offen — der Balken zeigt ein Ueberschiessen (Entwurf: Kniebeuge Soll 40, erreicht 70)
  const quote = (ist: number | null, ziel: number | null) => (ist !== null && ziel ? Math.max(0, (ist / ziel) * 100) : null)
  // ganze Prozent: 84,86 − 84,7 ist in Gleitkomma 0,1599… — ohne Runden hiesse genau erreicht 99,99 %, also verfehlt
  const gewichtQuote = delta !== null && soll ? Math.max(0, Math.round((delta / soll) * 100)) : null
  // G-654: Bewegung der Woche je Messziel (`measurement_goal_week_at`); ohne Soll kein Balken, keine Wertung.
  const messZeile = (g: ZielFortschritt, key: string, t: string, ico: React.ReactNode, ton: string): Z => {
    const w = woche.messwochen?.[g.goal_id] ?? null
    const d = w?.delta_woche ?? null, s = w?.soll_delta_woche ?? null
    const q = d !== null && s ? Math.max(0, Math.round((d / s) * 100)) : null
    const e = einheitLesbar(g.target_unit)
    return { key, t, ico, ton, ist: q, gut: q === null ? null : q >= 100,
      v: d !== null ? `${vz(d)}${e ? ` ${e}` : ''}` : <span className="ge-kommt">keine Messung vor dieser Woche</span> }
  }
  const zeilen: Z[] = [
    { key: 'gewicht', t: 'Gewicht (Trend)', ico: I.waage, ton: 'ge-ton-goals', ist: gewichtQuote, gut: gewichtQuote === null ? null : gewichtQuote >= 100,
      v: delta !== null ? `${vz(delta)} kg` : <span className="ge-kommt">{heute === null ? 'noch kein Trend' : 'keine Messung vor dieser Woche'}</span> },
    ...kraft.map(g => messZeile(g, `kraft-${g.goal_id}`, g.title, I.kraft, 'ge-ton-train')),
    ...fett.map(g => messZeile(g, `fett-${g.goal_id}`, 'Körperfett', I.koerper, 'ge-ton-goals')),
    {
      key: 'trainings', t: 'Training', ico: I.gew, ton: 'ge-ton-recov',
      ist: quote(woche.trainings, trainingsSoll), gut: trainingsSoll ? (woche.trainings ?? 0) >= trainingsSoll : null,
      v: woche.trainings === null ? '—' : trainingsSoll ? `${woche.trainings} / ${zahl(trainingsSoll)}`
        : <span title="Kein Wochenziel für Trainings und keine aktive Routine mit Tagen je Woche">{woche.trainings} / –</span>,
    },
    ...gewohnheit.filter(g => g !== trainingsZiel).map(g => ({
      key: `gewohnheit-${g.goal_id}`, t: g.title, ico: I.gew, ton: 'ge-ton-recov',
      ist: quote(g.current_value, g.target_value), gut: g.current_value !== null && g.target_value !== null ? g.current_value >= g.target_value : null,
      v: g.current_value !== null ? `${wertMitEinheit(g.current_value, null)} / ${wertMitEinheit(g.target_value, null)}` : '—',
    })),
  ]
  return (
    <section aria-label="Diese Woche" className="ge-card" style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span className="ge-eb">Diese Woche · KW {kalenderwoche(stichtag)}</span><span style={{ fontSize: 11, color: 'var(--fg-subtle)' }}>Bewegung gegen Soll</span>
      </div>
      {zeilen.map(z => (
        <div key={z.key} data-woche={z.key} style={{ display: 'grid', gridTemplateColumns: '28px 1fr 110px 80px', gap: 10, alignItems: 'center', padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
          <div className={`ge-mi ${z.ton}`}>{z.ico}</div>
          {/* Entwurf: der Titel steht in einer Zeile — lange Messziel-Titel enden auf „…" (ganz im title) */}
          <span data-woche-titel title={z.t} style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', minWidth: 0 }}>{z.t}</span>
          <div className="ge-bar">{z.ist !== null && <>
            <div data-woche-soll-breite={balken(z.ist).soll} style={{ width: `${balken(z.ist).soll}%`, background: 'var(--border-strong)' }} />
            <div data-woche-ist-breite={balken(z.ist).ist} style={{ width: `${balken(z.ist).ist}%`, background: z.gut ? 'var(--pos)' : 'var(--warn)' }} />
          </>}</div>
          <span className="ge-num" style={{ textAlign: 'right', fontWeight: 600, color: z.gut === null ? undefined : z.gut ? 'var(--pos)' : 'var(--warn)' }}>{z.v}</span>
        </div>
      ))}
      <div style={{ fontSize: 11, color: 'var(--fg-subtle)' }}>grau = Soll der Woche · Farbe = erreicht</div>
    </section>
  )
}

const MODULE_DER_KETTE = ['nutrition', 'training', 'recovery', 'supplements'] as const
const MODUL_TON: Record<typeof MODULE_DER_KETTE[number], string> = {
  nutrition: 'ge-ton-nutri', training: 'ge-ton-train', recovery: 'ge-ton-recov', supplements: 'ge-ton-suppl',
}

const KACHEL_GRUND: Record<string, string> = {
  kein_kalorienlog: 'kein Kalorienlog', kein_wochenziel: 'kein Wochenziel',
  kein_recovery_score: 'kein Recovery-Score', keine_entschiedene_einnahme: 'keine entschiedene Einnahme',
}
const tageText = (n: number) => `${n} ${n === 1 ? 'Tag' : 'Tage'}`

/**
 * G-522: eine Kachel aus `goal_module_cards_at` — Wert, Untertitel wie im Entwurf und die Zahl
 * fuer den Ampelpunkt. `[read]` **Die App rechnet nichts nach**; fehlt der Wert, steht der Grund.
 */
export function kachelAnzeige(m: typeof MODULE_DER_KETTE[number], k: Modulkacheln): { v: string; s: string; ampel: number | null } {
  const grund = (g: string | null) => KACHEL_GRUND[g ?? ''] ?? (g ? g.replace(/_/g, ' ') : 'kein Wert')
  if (m === 'training') {
    const t = k.training
    return t.wert === null
      ? { v: '—', s: grund(t.grund), ampel: null }
      : { v: `${t.wert} / ${t.wochenziel !== null ? zahl(t.wochenziel) : '?'}`, s: 'Einheiten diese Woche', ampel: t.score }
  }
  const x = k[m]
  if (x.wert === null) return { v: '—', s: grund(x.grund), ampel: null }
  if (m === 'nutrition') return { v: `${zahl(x.wert, 1)} %`, s: `kcal-Treue ${tageText(x.tage)}`, ampel: x.wert }
  if (m === 'recovery') return { v: zahl(x.wert, 1), s: `Score Ø ${tageText(x.tage)}`, ampel: x.wert }
  return { v: `${zahl(x.wert, 1)} %`, s: 'Einnahme-Treue', ampel: x.wert }
}

/** G-522: der Engpass aus der Kette (`goal_bottleneck`) — kein eigener in der App. */
export function engpassSatz(k: Modulkacheln | null | undefined): string {
  if (!k) return 'erst mit Beiträgen.'
  if (k.engpass) return `${MODUL_NAME[k.engpass.module as Modul] ?? k.engpass.module} – ${k.engpass.grund}.`
  return k.engpass_grund === 'kein_deutlicher_engpass' ? 'kein deutlicher Engpass.' : 'erst mit Modulwerten.'
}

function Module({ ziele, woche, onCrossModule }: { ziele: ZielFortschritt[]; woche: Wochendaten; onCrossModule: () => void }) {
  const st = steuerziel(ziele)
  const k = woche.kacheln ?? null
  return (
    <section aria-label="Module" className="ge-card" style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span className="ge-eb">Module · Beitrag zum steuernden Ziel</span>
        <button type="button" className="ge-link" style={{ fontSize: 11.5 }} onClick={onCrossModule}>Cross-module →</button>
      </div>
      {!st && !k && <div className="ge-kommt" data-module-leer>Ohne steuerndes Ziel gibt es keinen Beitrag.</div>}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: 10 }}>
        {MODULE_DER_KETTE.map(m => {
          const a = k ? kachelAnzeige(m, k) : { v: '—', s: '', ampel: null }
          // Die Verlaufslinie zeigt die geschriebenen Tagesbeitraege — gezeichnet, nicht gerechnet.
          const reihe = woche.beitraege.filter(b => b.module === m && b.contribution_score !== null)
            .sort((x, y) => x.contribution_date.localeCompare(y.contribution_date)).map(b => (b.contribution_score as number) / 100)
          const punkt = a.ampel === null ? 'var(--border-strong)' : a.ampel >= 80 ? 'var(--pos)' : a.ampel >= 60 ? 'var(--warn)' : 'var(--neg)'
          return (
            <div key={m} data-modul={m} style={{ border: '1px solid var(--border)', borderRadius: 8, padding: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <div className={`ge-mi ${MODUL_TON[m]}`}>{MODUL_ICO[m].ico}</div>
                <span style={{ fontWeight: 600, fontSize: 12.5 }}>{MODUL_NAME[m]}</span>
                <span style={{ marginLeft: 'auto', width: 8, height: 8, borderRadius: '50%', background: punkt }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 8 }}>
                <div>
                  <div className="ge-num" data-modul-wert style={{ fontSize: 17, fontWeight: 600 }}>{a.v}</div>
                  <div style={{ fontSize: 11, color: 'var(--fg-subtle)' }}>{k ? a.s : <Kommt was="Modulkacheln" punkt="G-522" />}</div>
                </div>
                {reihe.length > 1 && (
                  <svg viewBox="0 0 70 24" width="70" height="24" aria-hidden="true">
                    <polyline points={reihe.map((v, i) => `${(i * 70) / (reihe.length - 1)},${(22 - v * 20).toFixed(1)}`).join(' ')} fill="none" stroke={MODUL_ICO[m].farbe} strokeWidth="1.8" />
                  </svg>
                )}
              </div>
            </div>
          )
        })}
      </div>
      <div className="ge-hinweis-gelb" data-engpass={k?.engpass?.module ?? k?.engpass_grund ?? ''} style={{ fontSize: 12.5, padding: '8px 10px', display: 'flex', gap: 8, alignItems: 'center' }}>
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--warn)', flexShrink: 0 }} />
        <span><b>Engpass:</b> {engpassSatz(k)}</span>
      </div>
    </section>
  )
}

// ── Messziele ────────────────────────────────────────────────────

function useVerlauf(g: ZielFortschritt, stichtag: string, an: boolean) {
  const [v, setV] = React.useState<Verlauf | null>(null)
  const [fehler, setFehler] = React.useState<string | null>(null)
  const woechentlich = g.measurement_rhythm === 'weekly'
  React.useEffect(() => {
    if (!an) return
    void verlaufAktion(g.goal_id, stichtag, woechentlich).then(r => (r.ok ? setV(r.verlauf) : setFehler(r.fehler)))
  }, [g.goal_id, stichtag, woechentlich, an])
  return { v, fehler }
}

/** Monat wie im Entwurf: „Feb 2027". */
const monatDe = (iso: string) => `${['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'][Number(iso.slice(5, 7)) - 1]} ${iso.slice(0, 4)}`
/** G-654: „+3,9 kg/Wo"; ohne Woche (abgeschlossen) oder ohne Tempo „—". */
export const messTempo = (mw: Messwoche | null | undefined, einheit: string | null) =>
  mw?.tempo_pro_woche != null ? `${vz(mw.tempo_pro_woche)}${einheitLesbar(einheit) ? ` ${einheitLesbar(einheit)}` : ''}/Wo` : '—'
/** G-654: Monat der Prognose, sonst „nicht absehbar"; ohne Woche „—". */
export const messPrognose = (mw: Messwoche | null | undefined) =>
  mw?.prognose_status === 'datum' && mw.prognose_datum ? monatDe(mw.prognose_datum) : mw ? 'nicht absehbar' : '—'

/** Der beste Datenpunkt in Richtung des Ziels (Ziel unter dem Start: der kleinste). */
export function besterPunkt<P extends { tag: string; wert: number }>(pkt: P[], g: Pick<ZielFortschritt, 'start_value' | 'target_value'>): P | null {
  if (!pkt.length) return null
  const runter = g.target_value !== null && g.start_value !== null && g.target_value < g.start_value
  return pkt.reduce((b, p) => (runter ? p.wert < b.wert : p.wert > b.wert) ? p : b)
}

function MessDetails({ g, stichtag, mw, bester = false }: { g: ZielFortschritt; stichtag: string; mw?: Messwoche | null; bester?: boolean }) {
  const { v, fehler } = useVerlauf(g, stichtag, true)
  const woechentlich = g.measurement_rhythm === 'weekly'
  const kat = kategorieVon(g)
  // Ein Datenpunkt einer Zaehl-Gewohnheit ist EINE Einheit — „1 pro Woche" waere falsch.
  const punktEinheit = g.target_unit === 'sessions_per_week' ? null : g.target_unit
  if (fehler) return <div data-details-fehler style={{ fontSize: 11.5, color: 'var(--neg)' }}>{fehler}</div>
  if (!v) return <div className="ge-kasten" style={{ fontSize: 11 }}>lädt …</div>
  const pkt = v.punkte
  const werte = pkt.map(p => p.wert).concat(g.target_value !== null ? [g.target_value] : [])
  const lo = Math.min(...werte, 1e9), hi = Math.max(...werte, -1e9), sp = hi - lo || 1
  // Zeitachse wie im Entwurf: bis zur Frist, sonst bis zur Prognose; die Prognose gestrichelt (`measurement_goal_week_at`)
  const prog = mw?.prognose_status === 'datum' ? mw.prognose_datum : null
  const erst = pkt[0]?.tag ?? stichtag, letzt = pkt.at(-1) ?? null
  const ende = [letzt?.tag ?? stichtag, g.target_date ?? prog].filter((d): d is string => !!d).sort().at(-1)!
  const tz = (d: string) => Date.parse(`${d}T12:00:00Z`)
  const x = (tag: string) => 30 + (tz(ende) === tz(erst) ? 190 : ((tz(tag) - tz(erst)) / (tz(ende) - tz(erst))) * 380)
  const prognoseBis = letzt && prog && g.target_value !== null ? prognoseEnde(letzt.tag, letzt.wert, prog, g.target_value, ende) : null
  const y = (w: number) => 110 - ((w - lo) / sp) * 90
  const wo = v.wochen.slice(-12)
  const kz = woechentlich
    ? [
      { l: 'Quote 12 Wo', v: wo.length ? `${zahl((wo.filter(w => w.erreicht).length / wo.length) * 100)} %` : '—' },
      { l: 'längste Serie', v: `${Math.max(0, ...v.wochen.map(w => w.serie))} Wochen` },
      { l: 'Ø pro Woche', v: wo.some(w => w.wert !== null) ? zahl(wo.reduce((a, w) => a + (w.wert ?? 0), 0) / wo.length, 1) : '—' },
    ]
    // G-654: Tempo der letzten 28 Tage und die Prognose daraus (`measurement_goal_week_at`)
    : [{ l: 'Start', v: messWert(g.start_value, { ...g, measurement_reps: null }) },
      { l: 'Tempo 4 Wo', v: messTempo(mw, g.target_unit) }, { l: 'voraussichtlich', v: messPrognose(mw) }]
  return (
    <div className="ge-kasten" data-details={g.goal_id}>
      {/* Entwurf (abgeschlossen): „Bester Wert 24.06. 104,0 kg" — in Richtung des Ziels */}
      {bester && besterPunkt(pkt, g) && <div data-bester-wert style={{ fontSize: 12.5 }}>Bester Wert {kurzDe(besterPunkt(pkt, g)!.tag)} {messWert(besterPunkt(pkt, g)!.wert, g)}.</div>}
      {pkt.length === 0 ? <div style={{ fontSize: 11, color: 'var(--fg-subtle)' }}>Noch keine Datenpunkte.</div> : (
        <svg viewBox="0 0 420 130" width="100%" style={{ display: 'block', maxWidth: 640 }} role="img" aria-label="Verlauf" data-verlauf-bild={pkt.length}>
          {g.target_value !== null && <line x1="30" x2="410" y1={y(g.target_value)} y2={y(g.target_value)} stroke="var(--acc-goals)" strokeDasharray="2 3" />}
          <polyline points={pkt.map(p => `${x(p.tag)},${y(p.wert)}`).join(' ')} fill="none" stroke={KAT[kat].farbe} strokeWidth="2" />
          {letzt && prognoseBis && <line x1={x(letzt.tag)} y1={y(letzt.wert)} x2={x(prognoseBis.tag)} y2={y(prognoseBis.kg)} stroke={KAT[kat].farbe} strokeDasharray="3 3" data-messziel-prognose />}
          {/* ein einzelner Punkt ist als Linie unsichtbar */}
          {pkt.length === 1 && <circle cx={x(pkt[0]!.tag)} cy={y(pkt[0]!.wert)} r="3" fill={KAT[kat].farbe} />}
          {g.target_value !== null && <text x="406" y={y(g.target_value) + (y(g.target_value) < 20 ? 14 : -6)} fontSize="10" textAnchor="end" fill="var(--acc-goals)">Ziel {wertMitEinheit(g.target_value, g.target_unit)}</text>}
        </svg>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))', gap: 8 }}>
        {kz.map(k => <div key={k.l}><div className="ge-eb">{k.l}</div><div className="ge-num" style={{ fontWeight: 600 }}>{k.v}</div></div>)}
      </div>
      <div style={{ overflowX: 'auto' }}>
        <div className="ge-eb" style={{ marginBottom: 4 }}>Datenpunkte</div>
        <table className="ge-tbl" data-details-punkte={pkt.length}>
          <thead><tr><th>Datum</th><th>Wert</th><th>Quelle</th></tr></thead>
          <tbody>
            {pkt.length === 0 && <tr><td colSpan={3} style={{ color: 'var(--fg-subtle)' }}>noch keine</td></tr>}
            {pkt.slice(-8).reverse().map((p, i) => (
              <tr key={i}><td className="ge-num">{kurzDe(p.tag)}</td>
                {/* Entwurf: „140,0" — kg und % mit einer Stelle, ohne Einheit (sie steht im Kopf) */}
                <td className="ge-num">{punktEinheit === 'kg' || punktEinheit === '%' ? zahl(p.wert, 1) : wertMitEinheit(p.wert, punktEinheit)}</td>
                <td data-punkt-einheit={p.einheit ?? ''}>{p.einheit ?? quelleLesbar(p.quelle) ?? 'Quelle unbekannt'}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function MessBearbeiten({ g, onLoeschen, onFertig }: { g: ZielFortschritt; onLoeschen: () => void; onFertig: () => void }) {
  const router = useRouter()
  const kat = kategorieVon(g)
  const [titel, setTitel] = React.useState(g.title)
  const [ziel, setZiel] = React.useState(g.target_value !== null ? String(g.target_value) : '')
  const [frist, setFrist] = React.useState(g.target_date ?? '')
  const [laeuft, setLaeuft] = React.useState(false)
  const [fehler, setFehler] = React.useState<string | null>(null)
  const art = g.measurement_type && g.measurement_type in MESSARTEN ? MESSARTEN[g.measurement_type as keyof typeof MESSARTEN].name : KATEGORIE_NAME[kat]
  const quelle = quelleLesbar(g.current_source)
  // Entwurf: „Back Squat · 1RM · fest“
  const fest = kat === 'kraft' ? { l: 'Übung · Messart', v: `${g.uebung ?? quelle ?? '—'} · ${messArtKurz(g) ?? art}` }
    : kat === 'koerper' ? { l: 'Messgröße', v: art } : kat === 'gewohnheit' ? { l: 'Quelle', v: quelle ?? art } : { l: 'Messart', v: art }
  const woechentlich = g.measurement_rhythm === 'weekly'
  const schreib = async (a: Parameters<typeof zielSpeichern>[1]) => {
    setLaeuft(true); setFehler(null)
    const r = await zielSpeichern(g.goal_id, a)
    setLaeuft(false)
    if (r.ok) { onFertig(); router.refresh() } else setFehler(r.fehler)
  }
  const wert = ziel.trim() === '' ? null : Number(ziel.replace(',', '.'))
  return (
    <div className="ge-kasten" data-messziel-edit={g.goal_id}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: 12 }}>
        <div><label className="ge-lbl" htmlFor={`t-${g.goal_id}`}>Titel</label><input id={`t-${g.goal_id}`} className="ge-inp" value={titel} onChange={e => setTitel(e.target.value)} /></div>
        <div><label className="ge-lbl" htmlFor={`z-${g.goal_id}`}>Zielwert</label><input id={`z-${g.goal_id}`} className="ge-inp ge-num" inputMode="decimal" value={ziel} onChange={e => setZiel(e.target.value)} /></div>
        <div><label className="ge-lbl" htmlFor={`f-${g.goal_id}`}>Frist</label>
          {woechentlich ? <div style={{ height: 36, display: 'flex', alignItems: 'center', color: 'var(--fg-muted)' }}>– · wiederkehrend</div>
            : <input id={`f-${g.goal_id}`} className="ge-inp ge-num" type="date" value={frist} onChange={e => setFrist(e.target.value)} />}</div>
        <div><span className="ge-lbl">{fest.l}</span><div style={{ height: 36, display: 'flex', alignItems: 'center', color: 'var(--fg-muted)' }}>{fest.v} · fest</div></div>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button type="button" className="ge-btn ge-btn-p" data-messziel-speichern disabled={laeuft || !titel.trim() || (wert !== null && !Number.isFinite(wert))}
                  onClick={() => { void schreib({ title: titel.trim(), target_value: wert, ...(woechentlich ? {} : { target_date: frist || null }) }) }}>Speichern</button>
          <button type="button" className="ge-btn" data-messziel-abschliessen disabled={laeuft} onClick={() => { void schreib({ status: 'abandoned' }) }}>Abschließen</button>
          <ArchivierenKnopf goalId={g.goal_id} vorherBeenden />
        </div>
        {aktionen(g.zustand).loeschen && <button type="button" className="ge-btn ge-btn-r" data-ziel-loeschen={g.goal_id} onClick={onLoeschen}>Löschen</button>}
      </div>
      {fehler && <div style={{ fontSize: 11.5, color: 'var(--neg)' }}>{fehler}</div>}
    </div>
  )
}

/** Kopfzeile wie im Entwurf: „Kraft · 1RM", „Kraft · 5 Wdh.", „Gewohnheit · wöchentlich". */
export function messArtKurz(g: Pick<ZielFortschritt, 'measurement_type' | 'measurement_rhythm' | 'measurement_reps'>): string | null {
  if (g.measurement_type === 'e1rm') return '1RM'
  if (g.measurement_type === 'weight_reps') return g.measurement_reps ? `${zahl(g.measurement_reps)} Wdh.` : 'Gewicht × Wdh.'
  if (g.measurement_rhythm === 'weekly') return 'wöchentlich'
  return g.measurement_type && g.measurement_type in MESSARTEN ? MESSARTEN[g.measurement_type as keyof typeof MESSARTEN].name : null
}

/** Aktueller Wert wie im Entwurf: kg und % mit einer Stelle („140,0 kg", „16,2 %"), bei Gewicht × Wdh. „× 5". */
export function messWert(n: number | null, g: Pick<ZielFortschritt, 'target_unit' | 'measurement_type' | 'measurement_reps'>): string {
  if (n === null) return '—'
  const e = einheitLesbar(g.target_unit)
  const w = e === 'kg' || e === '%' ? `${zahl(n, 1)} ${e}` : wertMitEinheit(n, g.target_unit)
  return g.measurement_type === 'weight_reps' && g.measurement_reps ? `${w} × ${zahl(g.measurement_reps)}` : w
}

function MesszielKachel({ g, stichtag, mw }: { g: ZielFortschritt; stichtag: string; mw: Messwoche | null }) {
  const [offen, setOffen] = React.useState(false)
  const [edit, setEdit] = React.useState(false)
  const [loeschen, setLoeschen] = React.useState(false)
  const kat = kategorieVon(g)
  const woechentlich = g.measurement_rhythm === 'weekly'
  const { v } = useVerlauf(g, stichtag, woechentlich)
  const { lage, text: lageText } = lageVon(g)
  const quelle = quelleLesbar(g.current_source)
  const pct = g.progress_status === 'measured' && g.progress_pct !== null ? Math.max(0, Math.min(100, g.progress_pct)) : null
  const art = messArtKurz(g)
  const rest = tageBis(g.target_date, stichtag)
  const frist = woechentlich ? 'wiederkehrend' : g.target_date ? `bis ${datumDe(g.target_date)}${rest !== null && rest >= 0 ? ` · ${rest} Tage` : ''}` : 'ohne Frist'
  const wo = v?.wochen.slice(-12) ?? []
  return (
    <div className="ge-card" data-messziel-kachel={g.goal_id} data-kategorie={kat} style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
        <div className={`ge-sq ${KAT[kat].ton}`}>{KAT[kat].ico}</div>
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span className="ge-typ">{KATEGORIE_NAME[kat]}{art && art !== KATEGORIE_NAME[kat] ? ` · ${art}` : ''}</span>
            {g.status !== 'active' && <span className="ge-chip ge-grau">{g.status === 'paused' ? 'pausiert' : g.status === 'on_hold' ? 'zurückgestellt' : g.status}</span>}
            {lage && <span className={`ge-chip ge-lage-${lage}`} data-lage={lage}>{lageText}</span>}
            <span className="ge-num" style={{ marginLeft: 'auto', fontSize: 10.5, color: 'var(--fg-subtle)' }}>{frist}</span>
            <div style={{ display: 'flex', gap: 2 }}>
              <button type="button" className="ge-btn ge-btn-g ge-ico" aria-expanded={offen} data-messziel-details={g.goal_id}
                      aria-label={`${g.title} Details`} onClick={() => { setOffen(o => !o); setEdit(false) }}>{offen ? '▴' : '▾'}</button>
              <button type="button" className="ge-btn ge-btn-g ge-ico" data-messziel-bearbeiten={g.goal_id}
                      aria-label={`${g.title} bearbeiten`} onClick={() => { setEdit(e => !e); setOffen(false) }}>✎</button>
            </div>
          </div>
          <div style={{ fontSize: 15, fontWeight: 600, letterSpacing: '-.01em' }}>{g.title}</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, fontSize: 12, flexWrap: 'wrap' }} data-messziel-werte>
            <span><span style={{ color: 'var(--fg-subtle)' }}>aktuell </span><span className="ge-num" style={{ fontWeight: 500 }}>{woechentlich ? (g.current_value !== null ? `${wertMitEinheit(g.current_value, g.target_unit === 'sessions_per_week' ? null : g.target_unit)} diese Woche` : '—') : messWert(g.current_value, g)}</span></span>
            <span style={{ color: 'var(--fg-dim)' }}>→</span>
            <span><span style={{ color: 'var(--fg-subtle)' }}>Ziel </span><span className="ge-num" style={{ fontWeight: 600, color: KAT[kat].farbe }}>{g.target_unit === 'sessions_per_week' && g.target_value !== null ? `${zahl(g.target_value)}× / Wo` : wertMitEinheit(g.target_value, g.target_unit)}</span></span>
          </div>
          {woechentlich ? (
            <div style={{ display: 'flex', gap: 4, alignItems: 'center' }} data-messziel-wochen={wo.length}>
              {wo.map(w => <span key={w.woche} title={`ab ${datumDe(w.woche)}: ${w.wert ?? '—'}`} style={{ width: 14, height: 14, borderRadius: 4, background: w.erreicht ? KAT.gewohnheit.farbe : 'var(--surface-2)' }} />)}
              <span style={{ fontSize: 11, color: 'var(--fg-subtle)', marginLeft: 6 }}>{v ? `${wo.length} Wochen · Serie ${v.wochen.at(-1)?.serie ?? 0}` : 'lädt …'}</span>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div className="ge-bar" style={{ flex: 1 }}><div style={{ width: `${pct ?? 0}%`, background: KAT[kat].farbe }} /></div>
              <span className="ge-num" style={{ fontSize: 13, fontWeight: 600, width: 40, textAlign: 'right', color: KAT[kat].farbe }}>{pct !== null ? `${zahl(pct)} %` : '—'}</span>
            </div>
          )}
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {moduleVon(g).map(m => <ModulPill key={m} m={m} name={m === 'koerper' ? 'Messungen' : undefined} />)}
            <span style={{ fontSize: 11, color: 'var(--fg-subtle)', alignSelf: 'center', marginLeft: 4 }} data-messziel-quelle>
              {g.uebung ?? quelle ?? (g.progress_status === 'measured' ? 'Quelle unbekannt' : 'noch kein Messwert')}
            </span>
          </div>
        </div>
      </div>
      {offen && <MessDetails g={g} stichtag={stichtag} mw={mw} />}
      {edit && <MessBearbeiten g={g} onLoeschen={() => setLoeschen(true)} onFertig={() => setEdit(false)} />}
      {loeschen && <LoeschenFrage ziel={g} art="mess" onZu={() => setLoeschen(false)} />}
    </div>
  )
}

function Messziele({ ziele, stichtag, onMessziel, messwochen }: { ziele: ZielFortschritt[]; stichtag: string; onMessziel: () => void; messwochen?: Record<string, Messwoche> }) {
  const offen = ziele.filter(g => g.goal_role !== 'controlling' && !istAbgeschlossen(g))
  return (
    <section aria-label="Messziele" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
        <span className="ge-eb">Messziele · steuern nichts, beliebig viele</span>
        <button type="button" className="ge-btn" data-messziele-neu onClick={onMessziel}>+ Messziel</button>
      </div>
      {offen.length === 0 && <div style={{ fontSize: 12, color: 'var(--fg-subtle)' }} data-messziele-leer>Noch kein Messziel.</div>}
      {KATEGORIE_REIHE.map(k => {
        const liste = offen.filter(g => kategorieVon(g) === k)
        if (!liste.length) return null
        return (
          <div key={k} data-messziel-gruppe={k} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--fg-muted)' }}>{KATEGORIE_NAME[k]}</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(460px,100%),1fr))', gap: 14, alignItems: 'start' }}>
              {liste.map(g => <MesszielKachel key={g.goal_id} g={g} stichtag={stichtag} mw={messwochen?.[g.goal_id] ?? null} />)}
            </div>
          </div>
        )
      })}
    </section>
  )
}

function Abgeschlossen({ ziele, stichtag }: { ziele: ZielFortschritt[]; stichtag: string }) {
  const [auf, setAuf] = React.useState(true)
  const [details, setDetails] = React.useState<string | null>(null)
  const [loeschen, setLoeschen] = React.useState<string | null>(null)
  const zu = ziele.filter(istAbgeschlossen)
  if (zu.length === 0) return null
  return (
    <section aria-label="Abgeschlossen" className="ge-card" style={{ padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 6 }}>
      <button type="button" data-abgeschlossen={zu.length} aria-expanded={auf} onClick={() => setAuf(a => !a)}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', minHeight: 36, background: 'none', border: 0, font: 'inherit', cursor: 'pointer', textAlign: 'left', padding: 0, color: 'inherit' }}>
        <span className="ge-eb">Abgeschlossen · {zu.length}</span><span>{auf ? '▴' : '▾'}</span>
      </button>
      {auf && zu.map(g => {
        // G-640: Grund und Datum aus der Kette (goal_list_at); ohne sie der gespeicherte Status.
        const am = g.zustand.eingefroren_am ?? g.achievement_date
        const grund = g.zustand.grund
        const darf = aktionen(g.zustand)
        const kat = g.goal_role === 'controlling' ? null : kategorieVon(g)
        // Entwurf: „99,3 von 120 kg“, „erreicht 25.03.2026 · 84,0 kg“ — eine Stelle
        const eine = (n: number | null) => (n === null ? '—' : zahl(n, 1))
        const wert = g.target_value !== null ? `${eine(g.current_value)} von ${wertMitEinheit(g.target_value, g.target_unit)}` : null
        const info = grund === 'erreicht' ? `erreicht ${datumDe(am)}${g.current_value !== null ? ` · ${messWert(g.current_value, { ...g, measurement_reps: null })}` : ''}`
          : grund === 'beendet' ? `beendet ${datumDe(am)}`
            : `Frist ${datumDe(g.target_date ?? am)}${wert ? ` · ${wert}` : ''} · eingefroren`
        const pct = g.target_value !== null && g.start_value !== null && g.current_value !== null && g.target_value !== g.start_value
          ? Math.max(0, Math.round(((g.current_value - g.start_value) / (g.target_value - g.start_value)) * 100)) : null
        return (
          <div key={g.goal_id} data-abgeschlossen-ziel={grund ?? g.status}
               style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center', padding: '8px 10px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 6, marginTop: 6 }}>
            <div className={`ge-mi ${kat ? KAT[kat].ton : 'ge-ton-goals'}`}>{kat ? KAT[kat].ico : I.waage}</div>
            <div style={{ flex: '1 1 240px', minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: 12.5 }}>{g.title}</div>
              <div className="ge-num" style={{ fontSize: 10.5, color: 'var(--fg-subtle)' }}>{info}</div>
            </div>
            {/* Tom 16.10.: Chip und Knoepfe in EINER Zeile — eine Gruppe ohne Umbruch */}
            <div data-abgeschlossen-zeile style={{ display: 'flex', gap: 6, flexWrap: 'nowrap', alignItems: 'center', marginLeft: 'auto' }}>
            <span className={`ge-chip ${grund === 'erreicht' ? 'ge-lage-voraus' : 'ge-grau'}`} style={{ whiteSpace: 'nowrap' }} data-eingefroren-grund={grund ?? ''}>
              {grund === 'erreicht' ? '✓ erreicht' : grund ? GRUND_TEXT[grund] : ABSCHLUSS[g.status!] ?? g.status}</span>
              <button type="button" className="ge-btn" data-abgeschlossen-details={g.goal_id} aria-expanded={details === g.goal_id}
                      onClick={() => setDetails(d => (d === g.goal_id ? null : g.goal_id))}>Details</button>
              {darf.neuStarten && <NeuStartenFluss ziel={g} heute={stichtag} />}
              {/* G-648: Archivieren nur im Bearbeiten eines laufenden Messziels (Entwurf; Tom 16.10.). */}
              {darf.loeschen && <button type="button" className="ge-btn ge-btn-r" data-ziel-loeschen={g.goal_id} onClick={() => setLoeschen(g.goal_id)}>Löschen</button>}
            </div>
            {loeschen === g.goal_id && <LoeschenFrage ziel={g} art="abgeschlossen" onZu={() => setLoeschen(null)} />}
            {details === g.goal_id && (
              <div style={{ flexBasis: '100%', background: 'var(--surface)', borderRadius: 8, padding: '10px 12px', fontSize: 12.5, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <span data-abgeschlossen-text>Start {messWert(g.start_value, { ...g, measurement_reps: null })}{g.gueltig_ab ? ` (${kurzDe(g.gueltig_ab)})` : ''}
                  {' · '}Stand bei {grund === 'erreicht' ? 'Erreichen' : grund === 'beendet' ? 'Ende' : 'Frist'} {messWert(g.current_value, { ...g, measurement_reps: null })}{pct !== null ? ` · ${pct} %` : ''}.</span>
                {g.goal_role !== 'controlling' && <MessDetails g={g} stichtag={stichtag} bester />}
              </div>
            )}
          </div>
        )
      })}
    </section>
  )
}

export function ReiterGoals(p: {
  ziele: ZielFortschritt[]; phasen: Phase[]; zielwerte: Zielwerte | null; vorschlag: Zielvorschlag | null
  offenePhasen: Zielphase[]; plaene?: Plan[]
  messungen: Koerpermessung[]; meilensteine: Meilenstein[]; strategien: Strategie[]; woche: Wochendaten
  stichtag: string; onZielSetzen: () => void; onMessziel: () => void; onPhaseEngine: () => void; onCrossModule?: () => void
}) {
  return (
    <div className="ge" data-reiter-goals>
      <Steuerung ziele={p.ziele} phasen={p.phasen} offenePhasen={p.offenePhasen} zielwerte={p.zielwerte} vorschlag={p.vorschlag}
                 strategien={p.strategien} plaene={p.plaene ?? []} messungen={p.messungen} meilensteine={p.meilensteine} woche={p.woche}
                 stichtag={p.stichtag} onZielSetzen={p.onZielSetzen} onPhaseEngine={p.onPhaseEngine} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(340px,100%),1fr))', gap: 18 }}>
        <DieseWoche ziele={p.ziele} phasen={p.phasen} offenePhasen={p.offenePhasen} woche={p.woche} stichtag={p.stichtag} />
        <Module ziele={p.ziele} woche={p.woche} onCrossModule={p.onCrossModule ?? (() => {})} />
      </div>
      <Messziele ziele={p.ziele} stichtag={p.stichtag} onMessziel={p.onMessziel} messwochen={p.woche.messwochen} />
      <Abgeschlossen ziele={p.ziele} stichtag={p.stichtag} />
    </div>
  )
}

