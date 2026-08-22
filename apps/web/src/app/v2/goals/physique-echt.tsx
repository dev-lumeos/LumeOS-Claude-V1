'use client'

// Die angebundene Fassung von „Physique ratios" (G-87).
//
// `[cmd]` **Was echt wird, und was nicht:**
//
//   Verhaeltnisse (Taille:Huefte, Schulter:Taille, Brust:Taille,
//   Arm:Bein), beide Symmetrien und die 13 Umfangsstellen — **echt**,
//   aus `goals.body_circumferences` ueber `ladeUmfaenge`.
//
//   „golden target 1.618", „V-Taper score", „Steve Reeves" und die
//   FFMI-Baender — **bleiben Attrappe**, in `tab-physique.tsx`.
//
// `[read]` **Der Grund steht im Auftrag:** *„Verhaeltnisse sind
// rechenbar … Das ist Arithmetik, keine Bewertung. Aber die Einstufung
// ist eine … Wenn das Mockup sie zeigt, brauchen sie eine Quelle —
// sonst Attrappe."*
//
// `[cmd]` **Gesucht, nicht gefunden:** `1.618`, `v_taper` und
// `Steve Reeves` stehen ausschliesslich in
// `docs/spezifikation/10-plattform/design-system/theme-v1/uploads/`
// (SCORING.md, FEATURES.md, CONSOLIDATED_KNOWLEDGE.md) — **das sind
// Begleitdateien des Entwurfs, keine Spezifikation.** Der Reeves-Wert
// ist ausserdem gar keine Rechnung: `daten.ts:438` gibt fest `88`
// zurueck. In der Datenbank kommt keine der drei Zahlen vor.
//
// `[read]` Dieselbe Regel wie bei MEV/MAV/MRV (C-105) und den
// Injektions-Ruhefenstern (C-109): **eine Zahl ohne Beleg wird nicht
// gebaut.**
import * as React from 'react'
import { Card, Pill, Row } from '@lumeos/ui'

import type { Umfangssatz, ProfilEingaben } from '../../../lib/goals/lesen'
import type { Koerperzusammensetzung } from '../../../lib/goals/lesen'
import {
  rechneVerhaeltnisse, vergleicheStellen, type Verhaeltnis, type Symmetrie,
  whrLage, whtrLage, bauchumfangLage, bmiLage, PROPORTION_HEURISTIKEN,
  type Grenzquelle,
} from '../../../lib/goals/verhaeltnisse'

/** „WHO 2008 · Grad A" — die Quelle steht an jeder Grenzzahl. */
function QuellenZeile({ q }: { q: Grenzquelle }) {
  return (
    <span className="v2-dim v2-mono" style={{ fontSize: 9 }}>
      {q.quelle} {q.jahr} · Grad {q.grad}
    </span>
  )
}

/** Ein Quotient als Kachel — Zahl gross, Herleitung klein darunter. */
function VerhaeltnisKachel({ titel, v, einheit = 'cm' }: {
  titel: string; v: Verhaeltnis; einheit?: string
}) {
  return (
    <Card className="v2-card-tight" style={{ padding: 12 }}>
      <div className="v2-eyebrow" style={{ marginBottom: 3 }}>{titel}</div>
      <div className="v2-num" style={{ fontSize: 20, fontWeight: 600 }}>
        {v.wert != null ? v.wert.toFixed(3) : '—'}
      </div>
      {/* `[read]` Die zwei Zutaten stehen darunter, damit der Quotient
          nachrechenbar ist — und **ohne Zielwert oder Ampel**: welche
          Richtung erwuenscht ist, sagt das Modul nicht. */}
      <div className="v2-dim v2-mono" style={{ fontSize: 10 }}>
        {v.zaehler != null && v.nenner != null
          ? `${v.zaehler.toFixed(1)} : ${v.nenner.toFixed(1)} ${einheit}`
          : 'nicht gemessen'}
      </div>
    </Card>
  )
}

function SymmetrieKachel({ titel, s }: { titel: string; s: Symmetrie }) {
  return (
    <Card className="v2-card-tight" style={{ padding: 12 }}>
      <div className="v2-eyebrow" style={{ marginBottom: 4 }}>{titel}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
        <span className="v2-num" style={{ fontSize: 18 }}>
          {s.prozent != null ? `${s.prozent.toFixed(1)}%` : '—'}
        </span>
        <span className="v2-dim v2-mono" style={{ fontSize: 10 }}>
          {s.links != null && s.rechts != null
            ? `L ${s.links.toFixed(1)} · R ${s.rechts.toFixed(1)} cm`
            : 'nicht gemessen'}
          {s.differenz_cm != null && s.differenz_cm !== 0
            && ` · ${s.differenz_cm > 0 ? '+' : ''}${s.differenz_cm.toFixed(1)} rechts`}
        </span>
      </div>
    </Card>
  )
}

export function PhysiqueEcht({ saetze, navy, stichtag, profil = null }: {
  saetze: Umfangssatz[]
  navy: Koerperzusammensetzung | null
  stichtag: string
  profil?: ProfilEingaben | null
}) {
  const v = React.useMemo(() => rechneVerhaeltnisse(saetze), [saetze])
  const stellen = React.useMemo(() => vergleicheStellen(saetze), [saetze])
  if (!v) return null

  const vorherTag = saetze.length > 1
    ? saetze[saetze.length - 2].measurement_date : null

  // GO-21: die belegten Einordnungen. Ohne gesetztes Geschlecht gibt
  // es keine Schwelle — dann steht nur das Verhaeltnis.
  const geschlecht = profil?.biological_sex ?? null
  const taille = v.taille_huefte.zaehler
  const whr = whrLage(v.taille_huefte.wert, geschlecht)
  const whtr = whtrLage(taille, profil?.height_cm ?? null)
  const bauch = bauchumfangLage(taille, geschlecht)
  const bmi = bmiLage(navy?.weight_kg ?? profil?.body_weight_kg ?? null, profil?.height_cm ?? null)

  return (
    <div className="v2-grid-14">
      <div className="v2-col-gap" style={{ gap: 14 }}>
        <Card
          title="Physique ratios"
          sub={`gemessen am ${v.stichtag ?? '—'} · ${v.belegte_stellen} von 13 Stellen`}
        >
          <div className="v2-grid v2-g-cols-2" style={{ gap: 10, marginBottom: 10 }}>
            <VerhaeltnisKachel titel="Schulter : Taille" v={v.schulter_taille} />
            <VerhaeltnisKachel titel="Taille : Hüfte" v={v.taille_huefte} />
            <VerhaeltnisKachel titel="Brust : Taille" v={v.brust_taille} />
            <VerhaeltnisKachel titel="Arm : Oberschenkel" v={v.arm_bein} />
          </div>
          <div className="v2-grid v2-g-cols-2" style={{ gap: 10 }}>
            <SymmetrieKachel titel="Arm-Symmetrie" s={v.arm_symmetrie} />
            <SymmetrieKachel titel="Bein-Symmetrie" s={v.bein_symmetrie} />
          </div>
          <div className="v2-divider" />
          <div className="v2-dim" style={{ fontSize: 10.5, lineHeight: 1.55 }}>
            Quotienten aus den gemessenen Umfängen. Die belegten
            Grenzwerte (WHO) stehen in der Kachel darunter, die
            Traditionswerte als beschriftete Heuristik daneben — beides
            seit GO-21/G-89 mit Quelle. Die Symmetrie ist die kleinere
            Seite am Mittel beider — 100 % heisst gleich lang.
          </div>
        </Card>

        {/* GO-21: die vier Grad-A-Einordnungen, jede mit Quelle und
            Jahr. Sprachregel: „unter/ueber dem Grenzwert", nie
            „gesund". Ohne Geschlecht keine Schwelle. */}
        <Card title="Einordnung" sub="WHO-Grenzwerte · Risikomarker, keine Diagnose">
          <div className="v2-grid v2-g-cols-2" style={{ gap: 10 }}>
            <Card className="v2-card-tight" style={{ padding: 12 }}>
              <div className="v2-eyebrow" style={{ marginBottom: 3 }}>Taille : Hüfte (WHR)</div>
              <div className="v2-num" style={{ fontSize: 18, fontWeight: 600 }}>
                {v.taille_huefte.wert != null ? v.taille_huefte.wert.toFixed(3) : '—'}
              </div>
              <div style={{ fontSize: 10.5, lineHeight: 1.5 }}>
                {whr.schwelle == null
                  ? <span className="v2-dim">Grenzwert erst mit gesetztem Geschlecht</span>
                  : whr.lage == null ? <span className="v2-dim">nicht gemessen</span>
                    : <>{whr.lage === 'unter' ? 'unter' : 'über'} dem Grenzwert {whr.schwelle.toFixed(2)}</>}
              </div>
              <QuellenZeile q={whr.quelle} />
            </Card>
            <Card className="v2-card-tight" style={{ padding: 12 }}>
              <div className="v2-eyebrow" style={{ marginBottom: 3 }}>Taille : Grösse (WHtR)</div>
              <div className="v2-num" style={{ fontSize: 18, fontWeight: 600 }}>
                {whtr.verhaeltnis.wert != null ? whtr.verhaeltnis.wert.toFixed(3) : '—'}
              </div>
              <div style={{ fontSize: 10.5, lineHeight: 1.5 }}>
                {whtr.lage == null
                  ? <span className="v2-dim">braucht Taille und Körpergrösse</span>
                  : <>{whtr.lage === 'unter' ? 'unter' : 'über'} dem Grenzwert 0,5</>}
              </div>
              <QuellenZeile q={whtr.quelle} />
            </Card>
            <Card className="v2-card-tight" style={{ padding: 12 }}>
              <div className="v2-eyebrow" style={{ marginBottom: 3 }}>Bauchumfang</div>
              <div className="v2-num" style={{ fontSize: 18, fontWeight: 600 }}>
                {taille != null ? `${taille.toFixed(1)} cm` : '—'}
              </div>
              <div style={{ fontSize: 10.5, lineHeight: 1.5 }}>
                {bauch.stufen == null
                  ? <span className="v2-dim">Grenzwerte erst mit gesetztem Geschlecht</span>
                  : bauch.lage == null ? <span className="v2-dim">nicht gemessen</span>
                    : bauch.lage === 'unter'
                      ? <>unter dem Grenzwert {bauch.stufen.erhoeht} cm</>
                      : bauch.lage === 'erhoeht'
                        ? <>über {bauch.stufen.erhoeht} cm (erhöhtes Risiko)</>
                        : <>über {bauch.stufen.deutlich} cm (deutlich erhöhtes Risiko)</>}
              </div>
              <QuellenZeile q={bauch.quelle} />
            </Card>
            <Card className="v2-card-tight" style={{ padding: 12 }}>
              <div className="v2-eyebrow" style={{ marginBottom: 3 }}>BMI</div>
              <div className="v2-num" style={{ fontSize: 18, fontWeight: 600 }}>
                {bmi.wert != null ? bmi.wert.toFixed(1) : '—'}
              </div>
              <div style={{ fontSize: 10.5, lineHeight: 1.5 }}>
                {bmi.klasse == null
                  ? <span className="v2-dim">braucht Gewicht und Körpergrösse</span>
                  : <>WHO-Klasse: {bmi.klasse}</>}
              </div>
              <QuellenZeile q={bmi.quelle} />
              <div className="v2-dim" style={{ fontSize: 9.5, marginTop: 3, lineHeight: 1.4 }}>
                {bmi.vorbehalt}
              </div>
            </Card>
          </div>
        </Card>

        <Card
          title="13 Umfangsstellen"
          sub={vorherTag
            ? `${v.stichtag} gegen ${vorherTag} · cm`
            : `${v.stichtag} · cm · kein Vorwert`}
        >
          <div className="v2-tbl-wrap">
            <table className="v2-tbl">
              <thead>
                <tr>
                  <th>Stelle</th>
                  <th style={{ width: 80, textAlign: 'right' }}>Jetzt</th>
                  <th style={{ width: 80, textAlign: 'right' }}>Vorher</th>
                  <th style={{ width: 70, textAlign: 'right' }}>Δ</th>
                </tr>
              </thead>
              <tbody>
                {stellen.map(s => (
                  <tr key={String(s.schluessel)}>
                    <td>{s.name}</td>
                    <td className="v2-num" style={{ textAlign: 'right', fontWeight: 500 }}>
                      {s.jetzt != null ? s.jetzt.toFixed(1) : '—'}
                    </td>
                    <td className="v2-num v2-muted" style={{ textAlign: 'right' }}>
                      {s.vorher != null ? s.vorher.toFixed(1) : '—'}
                    </td>
                    {/* `[read]` **Ohne Farbe.** Die Vorlage faerbt eine
                        wachsende Taille rot und einen wachsenden Arm
                        gruen — welche Richtung erwuenscht ist, haengt
                        vom Ziel ab. Das Vorzeichen sagt dasselbe. */}
                    <td className="v2-num" style={{ textAlign: 'right' }}>
                      {s.differenz != null
                        ? `${s.differenz > 0 ? '+' : ''}${s.differenz.toFixed(1)}`
                        : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <div className="v2-col-gap" style={{ gap: 14 }}>
        {/* `[cmd]` **Koerperfett und FFMI werden nicht neu gerechnet** —
            `goals.body_composition_navy` liefert beides samt Spanne,
            Verfahren und Warnhinweis. Der Auftrag: *„Koerperfett ist
            schon da … Nicht neu rechnen."* Die Kachel zeigt, was die
            Funktion sagt. */}
        {navy && (
          <Card title="Körperzusammensetzung" sub={`gemessen am ${navy.measurement_date}`}>
            <Row label="Körperfett"
                 value={navy.body_fat_pct != null ? `${navy.body_fat_pct.toFixed(2)} %` : '—'} />
            {navy.body_fat_pct_min != null && navy.body_fat_pct_max != null && (
              <Row label="Spanne"
                   value={`${navy.body_fat_pct_min.toFixed(2)} – ${navy.body_fat_pct_max.toFixed(2)} %`} />
            )}
            <Row label="FFMI" value={navy.ffmi != null ? navy.ffmi.toFixed(2) : '—'} />
            <Row label="Fettfreie Masse"
                 value={navy.lean_mass_kg != null ? `${navy.lean_mass_kg.toFixed(1)} kg` : '—'} />
            <Row label="Gewicht"
                 value={navy.weight_kg != null ? `${navy.weight_kg.toFixed(1)} kg` : '—'} />
            <Row label="Verfahren" value={navy.method ?? '—'} />
            {navy.caution && (
              <>
                <div className="v2-divider" />
                {/* `[read]` **Der Warnhinweis der Funktion steht mit da.**
                    Er nennt den Standardfehler von ±3,5 Prozentpunkten —
                    eine Zahl ohne ihre Unsicherheit waere genauer, als
                    das Verfahren ist. */}
                <div className="v2-dim" style={{ fontSize: 10.5, lineHeight: 1.55 }}>
                  {navy.caution}
                </div>
              </>
            )}
          </Card>
        )}

        {/* G-89: Tradition, als solche beschriftet (Grad E,
            LABEL_HEURISTIC). KEINE Einfaerbung nach Richtung — in
            einer Aufbauphase ist eine wachsende Taille normal. Die
            FFMI-25-Grenze fehlt bewusst: widersprüchliche Evidenz
            (BP-FFMI-005, DO_NOT_IMPLEMENT). */}
        <Card title="Traditionswerte" sub="Heuristik aus der Bodybuilding-Literatur — keine Messlatte">
          <div className="v2-col-gap" style={{ gap: 10 }}>
            {PROPORTION_HEURISTIKEN.map(h => (
              <div key={h.registryId}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 12, fontWeight: 600 }}>{h.name}</span>
                  {/* C-180: der Grad kommt aus dem Register, nicht
                      aus einem Kommentar. */}
                  <Pill style={{ fontSize: 9 }}>Heuristik{h.grad ? ` · Grad ${h.grad}` : ''}</Pill>
                </div>
                <div className="v2-dim" style={{ fontSize: 10, marginTop: 2 }}>{h.herkunft}</div>
                {h.registryId === 'BP-GR-006' && (
                  <div className="v2-num" style={{ fontSize: 11.5, marginTop: 3 }}>
                    Schulter : Taille gemessen{' '}
                    {v.schulter_taille.wert != null ? v.schulter_taille.wert.toFixed(3) : '—'}
                    <span className="v2-dim"> · Tradition 1,618</span>
                  </div>
                )}
                {h.registryId === 'BP-CLASSIC-010' && (() => {
                  const j = saetze[saetze.length - 1]
                  const arm = j.upper_arm_left_cm != null && j.upper_arm_right_cm != null
                    ? (j.upper_arm_left_cm + j.upper_arm_right_cm) / 2
                    : j.upper_arm_left_cm ?? j.upper_arm_right_cm
                  const wade = j.calf_left_cm != null && j.calf_right_cm != null
                    ? (j.calf_left_cm + j.calf_right_cm) / 2
                    : j.calf_left_cm ?? j.calf_right_cm
                  return (
                    <div className="v2-num" style={{ fontSize: 11.5, marginTop: 3 }}>
                      Hals {j.neck_cm?.toFixed(1) ?? '—'} · Arm {arm?.toFixed(1) ?? '—'} · Wade {wade?.toFixed(1) ?? '—'} cm
                      <span className="v2-dim"> · Tradition: gleich gross</span>
                    </div>
                  )
                })()}
                {h.formeln.length > 0 && (
                  <div className="v2-dim v2-mono" style={{ fontSize: 9.5, marginTop: 3, lineHeight: 1.5 }}>
                    {h.formeln.join(' · ')}
                    {h.registryId !== 'BP-CLASSIC-010' && (
                      <span> — Handgelenk/Knöchel/Becken werden nicht gemessen, kein Ist-Vergleich</span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="v2-divider" />
          <div className="v2-dim" style={{ fontSize: 10, lineHeight: 1.5 }}>
            Tradition, keine Studie (Einstufung je Zeile aus dem
            Evidenzregister). Ohne Richtungsfarbe: welche Richtung
            erwünscht ist, hängt von der Phase ab.
          </div>
        </Card>

        <Card title="Messreihe" sub={`bis ${stichtag}`}>
          <Row label="Umfangssätze" value={String(saetze.length)} />
          <Row label="Erster" value={saetze[0]?.measurement_date ?? '—'} />
          <Row label="Jüngster" value={v.stichtag ?? '—'} />
          <Row label="Belegte Stellen" value={`${v.belegte_stellen} von 13`} />
          <div className="v2-divider" />
          <div className="v2-dim" style={{ fontSize: 10.5, lineHeight: 1.55 }}>
            Die Reihe endet am Stichtag. Spätere Sätze liegen in der
            Datenbank, zählen hier aber nicht mit — ein künftiger
            Messwert ist kein gemessener.
          </div>
        </Card>
      </div>
    </div>
  )
}
