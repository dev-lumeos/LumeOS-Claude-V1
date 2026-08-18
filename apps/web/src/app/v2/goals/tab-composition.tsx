'use client'

// Der Composition-Tab — **echte Werte.**
//
// FORM: `theme-v1/module-goals.jsx:547-604` — dieselben vier Kacheln,
// dieselbe Spaltenteilung, dieselbe `CalcRow`-Zeile, dieselbe
// Körperfettskala. INHALT: `goals.body_composition_navy`,
// `goals.berechne_zielwerte`, `goals.body_measurements` und
// `public.profiles`.
//
// **DIE SPANNE GEHÖRT AN DEN WERT.** `[read]` Der Auftrag GO-16:
// *„Die Spanne gehört an den Wert, nicht in eine Fussnote — und der
// Vorbehalt steht in der Funktion. Zeig ihn."* Deshalb steht unter
// `11,38 %` die Spanne `7,88–14,88` und der Satz der Funktion
// wörtlich, nicht gekürzt.
//
// **KEINE BEWERTUNG.** `[read]` *„Ob jemand sein Ziel gut verfolgt, ist
// eine Aussage über einen Menschen."* Die Skala der Vorlage benennt
// Bereiche (`Athletic`, `Fitness`) — das sind Lagebezeichnungen wie
// `In range` bei Medical, solange sie sagen, **wo** ein Wert liegt.
// Der Satz *„0.8% above Athletic boundary"* der Vorlage ist dagegen
// eine Wertung mit erfundener Zahl; er kommt hier nicht vor.
import * as React from 'react'
import { Card, Ring, Row } from '@lumeos/ui'

import type {
  AdaptiverTdee, Koerperzusammensetzung, Koerpermessung, ProfilEingaben,
} from '../../../lib/goals/lesen'
import type { Zielvorschlag, Zielwerte } from '../../../lib/profile/zielwerte-read'

export type CompDaten = {
  navy: Koerperzusammensetzung | null
  vorschlag: Zielvorschlag | null
  zielwerte: Zielwerte | null
  tdee: AdaptiverTdee | null
  profil: ProfilEingaben | null
  alter: number | null
  juengsteMessung: Koerpermessung | null
  stichtag: string
}

function z(n: number | null | undefined, stellen = 1): string {
  return n == null ? '—' : n.toFixed(stellen)
}

/**
 * Eine Kennzahlzeile. [cmd] module-goals.jsx:606-621 — unverändert
 * übernommen, bis auf `status`: die Vorlage färbt `in`/`watch`/`out`,
 * also **gut/mittel/schlecht**. Hier gibt es nur `info` und `fehlt` —
 * eine Zahl ist da oder sie ist es nicht. Keine Ampel über einen
 * Menschen.
 */
function CalcRow({ label, value, unit, range, note, fehlt }: {
  label: string; value: string; unit: string; range: string; note: string
  fehlt?: boolean
}) {
  return (
    <div style={{
      padding: 10, background: 'var(--surface)',
      border: '1px solid var(--border)', borderRadius: 6,
    }}>
      <div style={{
        display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
        marginBottom: 3, gap: 8,
      }}>
        <span className="v2-eyebrow">{label}</span>
        <div>
          <span className="v2-num" style={{
            fontSize: 18, fontWeight: 500,
            color: fehlt ? 'var(--fg-dim)' : 'var(--fg)',
          }}>{value}</span>
          <span className="v2-dim v2-mono" style={{ fontSize: 10, marginLeft: 4 }}>{unit}</span>
        </div>
      </div>
      {range && <div className="v2-dim v2-mono" style={{ fontSize: 10, marginBottom: 4 }}>{range}</div>}
      {note && <div className="v2-muted" style={{ fontSize: 11, lineHeight: 1.45 }}>{note}</div>}
    </div>
  )
}

/**
 * Die Körperfettskala mit Spanne.
 *
 * `[cmd]` FORM: `module-goals.jsx:623-656`, Bereichsgrenzen unverändert
 * (2 · 5 · 13 · 17 · 25 · 35). **NEU ist der Spannenbalken**: die
 * Vorlage zeichnet einen Strich für den Wert, hier steht darunter das
 * Band von `body_fat_pct_min` bis `body_fat_pct_max`. Ohne es sähe
 * `11,38 %` nach einer Messung aus; es ist eine Schätzung mit ±3,5
 * Prozentpunkten.
 */
function KoerperfettSkala({ k }: { k: Koerperzusammensetzung }) {
  const stops = [
    { label: 'Essential', from: 2, to: 5, color: 'var(--neg)' },
    { label: 'Athletic', from: 5, to: 13, color: 'var(--pos)' },
    { label: 'Fitness', from: 13, to: 17, color: 'var(--acc-recov)' },
    { label: 'Average', from: 17, to: 25, color: 'var(--warn)' },
    { label: 'High', from: 25, to: 35, color: 'var(--neg)' },
  ]
  const min = 2
  const max = 35
  const anteil = (v: number) => Math.max(0, Math.min(100, ((v - min) / (max - min)) * 100))
  const wert = k.body_fat_pct

  return (
    <div>
      <div style={{
        position: 'relative', height: 28, borderRadius: 4, overflow: 'hidden',
        display: 'flex', border: '1px solid var(--border)',
      }}>
        {stops.map(s => (
          <div key={s.label} style={{
            flex: s.to - s.from, background: s.color, opacity: 0.55,
            display: 'grid', placeItems: 'center', fontSize: 9.5,
            color: 'var(--bg)', fontWeight: 600, letterSpacing: '0.02em',
            fontFamily: 'var(--font-mono)',
          }}>{s.label.toUpperCase()}</div>
        ))}
        {/* Die Spanne als Band — der Teil, den die Vorlage nicht hat. */}
        {k.body_fat_pct_min != null && k.body_fat_pct_max != null && (
          <div style={{
            position: 'absolute', left: `${anteil(k.body_fat_pct_min)}%`,
            width: `${anteil(k.body_fat_pct_max) - anteil(k.body_fat_pct_min)}%`,
            top: 0, bottom: 0,
            background: 'color-mix(in oklch, var(--fg) 22%, transparent)',
            border: '1px solid color-mix(in oklch, var(--fg) 45%, transparent)',
          }} />
        )}
        {wert != null && (
          <div style={{
            position: 'absolute', left: `${anteil(wert)}%`, top: -4, bottom: -4,
            width: 2, background: 'var(--fg)', boxShadow: '0 0 0 2px var(--bg)',
          }} />
        )}
      </div>
      <div style={{
        display: 'flex', justifyContent: 'space-between', marginTop: 6,
        fontSize: 9.5, color: 'var(--fg-dim)', fontFamily: 'var(--font-mono)',
      }}>
        <span>2%</span><span>5%</span><span>13%</span><span>17%</span><span>25%</span><span>35%</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
        <span className="v2-num" style={{ fontSize: 22, fontWeight: 500 }}>
          {z(wert, 2)}<span className="v2-dim" style={{ fontSize: 11, marginLeft: 2 }}>%</span>
        </span>
        {/* Die Spanne steht NEBEN dem Wert, nicht darunter im Kleingedruckten. */}
        {k.body_fat_pct_min != null && k.body_fat_pct_max != null && (
          <span className="v2-mono" style={{ fontSize: 12, color: 'var(--fg-muted)' }}>
            {`${z(k.body_fat_pct_min, 2)} – ${z(k.body_fat_pct_max, 2)} %`}
          </span>
        )}
        <span className="v2-dim v2-mono" style={{ fontSize: 10.5, marginLeft: 'auto' }}>
          {`${k.method ?? 'navy'} · ${k.measurement_date}`}
        </span>
      </div>

      {/* Der Vorbehalt der Funktion, woertlich. Nicht gekuerzt, nicht
          umformuliert — er ist Teil der Aussage. */}
      {k.caution && (
        <>
          <div className="v2-divider" />
          <div className="v2-muted" style={{ fontSize: 11, lineHeight: 1.5 }}>{k.caution}</div>
        </>
      )}
    </div>
  )
}

export function CompositionTab({ d }: { d: CompDaten }) {
  const { navy, vorschlag, zielwerte, profil, alter, juengsteMessung } = d

  const gewicht = navy?.weight_kg ?? juengsteMessung?.weight_kg ?? null
  const lean = navy?.lean_mass_kg ?? juengsteMessung?.lean_mass_kg ?? null
  const fett = gewicht != null && lean != null ? gewicht - lean : null
  const bmi = juengsteMessung?.bmi ?? null
  const ffmi = navy?.ffmi ?? juengsteMessung?.ffmi ?? null

  // Der Aktivitaetsfaktor ist nicht als Zahl gespeichert — er steckt in
  // `berechne_zielwerte`. Sichtbar ist deshalb die Stufe aus dem Profil
  // und das Verhaeltnis der zwei gerechneten Zahlen.
  const faktor = vorschlag?.bmr && vorschlag?.tdee
    ? vorschlag.tdee / vorschlag.bmr : null

  return (
    <div className="v2-grid v2-g-cols-2 v2-goals-comp">
      <Card
        title="Body composition calculators"
        sub={`aus Profil und Messung vom ${navy?.measurement_date ?? d.stichtag}`}
      >
        <div className="v2-col-gap" style={{ gap: 10 }}>
          <CalcRow
            label="BMI" value={z(bmi)} unit="" fehlt={bmi == null}
            range="Normal 18.5–24.9"
            note="Height-adjusted weight indicator. Not useful for trained athletes — use FFMI."
          />
          <CalcRow
            label="FFMI" value={z(ffmi, 2)} unit="kg/m²" fehlt={ffmi == null}
            range="18–22 natural · 22–25 advanced"
            note="Fat-free mass index. Aus Umfangsverfahren abgeleitet — traegt dessen Unsicherheit."
          />
          <CalcRow
            label="BMR" value={z(vorschlag?.bmr, 0)} unit="kcal/day"
            fehlt={vorschlag?.bmr == null}
            range="Mifflin-St Jeor"
            note="Basal metabolic rate. Energy used at complete rest."
          />
          <CalcRow
            label="TDEE" value={z(vorschlag?.tdee, 0)} unit="kcal/day"
            fehlt={vorschlag?.tdee == null}
            range={faktor ? `× ${faktor.toFixed(3)} (${profil?.activity_level ?? '—'})` : ''}
            note="Total daily expenditure — Mifflin-St Jeor mal Aktivitaetsfaktor, gerechnet von goals.berechne_zielwerte."
          />
          <CalcRow
            label="Lean mass" value={z(lean, 2)} unit="kg" fehlt={lean == null}
            range="" note="Aus Gewicht und Koerperfettanteil des Umfangsverfahrens."
          />
          <CalcRow
            label="Fat mass" value={z(fett, 2)} unit="kg" fehlt={fett == null}
            range="" note=""
          />
        </div>
        {vorschlag?.hindernis && (
          <>
            <div className="v2-divider" />
            <div className="v2-muted" style={{ fontSize: 11.5, lineHeight: 1.5 }}>
              {vorschlag.hindernis === 'profil_unvollstaendig'
                ? `Die Formel rechnet nicht: im Profil fehlen ${vorschlag.fehlende_felder.join(', ') || 'Angaben'}.`
                : 'Die Formel rechnet nicht: die Zielrichtung hat keinen Kalorienfaktor.'}
            </div>
          </>
        )}
      </Card>

      <div className="v2-col-gap" style={{ gap: 14 }}>
        <Card
          title="Body fat estimate · visual"
          sub="Umfangsverfahren (Navy) · DXA bleibt der Massstab"
        >
          {navy
            ? <KoerperfettSkala k={navy} />
            : (
              <div className="v2-dim" style={{ fontSize: 11.5, padding: '14px 0' }}>
                Noch keine Umfangsmessung, aus der sich der Koerperfettanteil
                ableiten liesse.
              </div>
            )}
        </Card>

        {/* `[read]` Der Auftrag: „Energy balance (Ring-Maximum) — kcal."
            Das Maximum ist echt. **Die Zufuhr ist es nicht** — es gibt
            keinen Tagesverbrauch, der hier ankaeme. Der Ring bleibt
            deshalb LEER statt gefuellt: dieselbe Regel wie C-75
            („Keine gefuellten Ringe ohne Ziel") — ein zu 68 % gefuellter
            Ring waere eine Falschaussage. Im Bericht. */}
        <Card
          title="Energy balance · today"
          sub={zielwerte?.kcal != null ? `Zielwert ${zielwerte.kcal.toFixed(0)} kcal` : 'ohne Zielwert'}
        >
          <div className="v2-goals-energie">
            <Ring
              value={0} max={zielwerte?.kcal ?? 0}
              color="var(--acc-nutri)" label="kcal" size={108} stroke={7}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <Row label="Zielwert (kcal)" value={zielwerte?.kcal != null ? `${zielwerte.kcal.toFixed(0)} kcal` : '—'} />
              <Row label="Herkunft" value={zielwerte?.herkunft ?? '—'} />
              <Row label="Gueltig ab" value={zielwerte?.gueltig_ab ?? '—'} />
              <Row label="Zielrichtung" value={zielwerte?.nutrition_goal ?? '—'} />
            </div>
          </div>
          <div className="v2-divider" />
          <div className="v2-muted" style={{ fontSize: 11, lineHeight: 1.45 }}>
            Der Ring zeigt das Ziel, nicht den Stand: eine Tagesaufnahme aus
            dem Tagebuch ist hier nicht angebunden. Ein gefuellter Ring waere
            eine Zahl, die niemand gemessen hat.
          </div>
        </Card>

        <Card title="Profile · inputs" sub="public.profiles">
          <Row label="Sex" value={profil?.biological_sex ?? '—'} />
          <Row label="Age" value={alter != null ? `${alter} years` : '—'} />
          <Row label="Height" value={profil?.height_cm != null ? `${z(profil.height_cm, 0)} cm` : '—'} />
          <Row
            label="Weight (latest)"
            value={gewicht != null ? `${z(gewicht, 2)} kg` : '—'}
          />
          <Row
            label="Body fat (latest)"
            value={navy?.body_fat_pct != null
              ? `${z(navy.body_fat_pct, 2)} % (${z(navy.body_fat_pct_min, 2)}–${z(navy.body_fat_pct_max, 2)})`
              : '—'}
          />
          <Row label="Activity level" value={profil?.activity_level ?? '—'} />
          <div className="v2-divider" />
          {/* `[cmd]` Das Profil fuehrt `body_weight_kg` = 85,000, die
              juengste Messung 84,18. Beides steht da, weil beides
              stimmt — die eine Zahl ist der Profilstand, die andere die
              Messung. Wer nur eine zeigte, verschwiege die andere. */}
          <div className="v2-dim" style={{ fontSize: 10.5, lineHeight: 1.45 }}>
            {profil?.body_weight_kg != null
              ? `Profilgewicht ${z(profil.body_weight_kg, 2)} kg · Messung ${z(gewicht, 2)} kg`
              : 'Kein Profilgewicht hinterlegt.'}
          </div>
        </Card>
      </div>
    </div>
  )
}
