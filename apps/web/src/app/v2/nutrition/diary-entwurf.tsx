'use client'

// Die rechte Spalte des Diary, uebernommen.
//
// QUELLEN, unveraendert uebernommen:
//   SmartSuggestionsCard    theme-v1/module-completeness.jsx:693
//   NutritionScoreCard      theme-v1/module-nutrition-spec.jsx:44
//   NutritionPendingActions theme-v1/module-nutrition-spec.jsx:521
//   PreWorkoutOptimizer     theme-v1/module-completeness.jsx:653
//   Hydration, Micronutrient snapshot, Below threshold
//                           theme-v1/module-nutrition.jsx:232/253/274
//
// Reihenfolge wie in `NutritionDiary` (Zeile 227-289): Smart
// suggestions, Nutrition score, Pending actions, Pre-workout, Hydration,
// Micronutrient snapshot, Below threshold.
//
// Die Zahlen sind die des Entwurfs — Score 1, Pre-workout 68,
// Hydration 1.2/3.0 L, das Netzdiagramm, die drei Werte unter der
// Schwelle. Sie bleiben stehen, bis die jeweilige Kachel angebunden ist.
import * as React from 'react'
import {
  Card, Pill, Icon, Row, Ring, Meter, RadarChart, InEntwicklungKnopf,
} from '@lumeos/ui'

const ATTRAPPE = 'Aus dem Entwurf uebernommen. Die Zahlen sind erfunden, bis die Kachel eine Quelle hat.'

// --- Nutrition score, reine Funktion aus der Vorlage ---------------
// [cmd] module-nutrition-spec.jsx:37-42. Die Gewichtung steht dort;
// uebernommen wird sie unveraendert, samt Stufenfaktor.
// ── G-283 (2026-08-31): der stille Rueckfall ist raus ─────────────
//
// `[cmd]` **Gemessen am 2026-08-31:** die Datenbank kennt
// `beginner | advanced | pro | elite` (CHECK auf
// `public.profiles.experience_level`), **live 2x `pro`, 5x NULL.**
// **Diese Tabelle kannte `intermediate` und nicht `pro`.**
//
// `[cmd]` **Und die massgebliche Liste steht laengst im Code:**
// `EXPERIENCE_LEVELS` in `lib/profile/profile-model.ts:79` —
// **dieselben vier wie der CHECK.**
//
// `[read]` **Der alte Rueckfall `?? 0.90` gab einem `pro`-Nutzer den
// Faktor von `intermediate`** — **kein Absturz, keine Meldung, nur
// ein falscher Wert.** Dieselbe Klasse wie A-60.
//
// `[read]` **Welche vier Faktoren gelten, ist G-228 und gehoert
// Tom.** **Hier wird nur sichergestellt, dass ein unbekannter Name
// nicht stillschweigend zu einer Zahl wird.**
//
// `[cmd]` **`elite` bleibt bei 1,10, `beginner` bei 0,75, `advanced`
// bei 1,00** — die drei Namen stehen in beiden Listen und ihre Werte
// sind unstrittig. **`pro` hat keinen belegten Faktor**, deshalb
// steht dort `null` und nicht geraten.
const LEVEL_MULT: Record<string, number | null> = {
  beginner: 0.75,
  advanced: 1.00,
  elite: 1.10,
  // `[read]` **Offen bis G-228.** `null` heisst: der Name gilt, der
  // Faktor ist nicht entschieden. **Ein geratener Wert waere hier
  // schlimmer als keiner** — er saehe aus wie eine Antwort.
  pro: null,
}

/**
 * Der Stufenfaktor, oder `null`.
 *
 * `[read]` **Drei Faelle, nicht zwei:**
 *
 *     Zahl    der Name gilt und sein Faktor ist belegt
 *     null    der Name gilt, der Faktor ist offen (`pro`, G-228)
 *     null    der Name ist unbekannt — und dann sagt es die Anzeige
 *
 * `[read]` **Der Unterschied zwischen den letzten beiden ist fuer den
 * Aufrufer keiner:** in beiden Faellen gibt es keinen Score. **Fuer
 * die Anzeige schon** — deshalb `stufeGilt()` daneben.
 */
export function stufenFaktor(level: string): number | null {
  return LEVEL_MULT[level] ?? null
}

/** Kennt die Tabelle den Namen ueberhaupt? */
export function stufeGilt(level: string): boolean {
  return Object.prototype.hasOwnProperty.call(LEVEL_MULT, level)
}

export const STUFE_OFFEN_SATZ =
  'Für diese Erfahrungsstufe ist kein Faktor hinterlegt — der Score '
  + 'bleibt offen, bis er entschieden ist (G-228).'

export const STUFE_UNBEKANNT_SATZ =
  'Unbekannte Erfahrungsstufe — der Score wird nicht berechnet, '
  + 'statt einen Faktor zu raten.'

/**
 * Der Score, oder `null`.
 *
 * `[cmd]` **Frueher: `LEVEL_MULT[level] ?? 0.90`.** `[read]` **Jetzt
 * gibt es keinen stillen Ersatzwert mehr** — wer keinen Faktor hat,
 * bekommt keinen Score, und die Anzeige sagt warum.
 */
export function nutritionScore(
  c: { protein: number; calorie: number; carbs: number; fat: number; fiber: number },
  level: string,
): number | null {
  const f = stufenFaktor(level)
  if (f === null) return null
  const raw = c.protein * 0.30 + c.calorie * 0.25 + c.carbs * 0.15 + c.fat * 0.15 + c.fiber * 0.15
  return Math.round(raw * f * 100) / 100
}

// ── G-263 (2026-08-30): `SmartSuggestionsCard` ist entfernt ──────
//
// `[read]` **Was sie zeigte:** vier Zeilen — "Same as yesterday",
// "Top breakfast (last 30d)", "Quick post-workout", "Saturday cheat
// meal", jede mit einem Knopf.
//
// `[cmd]` **Je Zeile gemessen** (Belege in
// `lib/nutrition/vorschlags-lage.ts`): eine ist anderswo gebaut
// (`wieGestern()`), eine hat kein Muster in den Daten, zwei sind
// Empfehlungen. **Keine traegt.**
//
// `[read]` **A-59: was keinen Aufrufer hat, wird geloescht, nicht
// stehengelassen** — sonst gilt es beim naechsten Auftrag als gebaut.

export function NutritionScoreCard() {
  // Die Werte der Vorlage, unveraendert.
  const compliance = { protein: 0.79, calorie: 0.68, carbs: 0.53, fat: 0.80, fiber: 0.69 }
  const level = 'advanced'
  const score = nutritionScore(compliance, level)
  // `[read]` **G-283: ohne Faktor kein Score.** Die Kachel zeigt dann
  // den Grund statt einer Zahl — ein Ring auf `0` waere eine Aussage
  // ueber den Nutzer, die niemand gemacht hat.
  const band = score === null
    ? { l: 'offen', c: 'var(--fg-dim)' }
    : score >= 80
      ? { l: 'ok', c: 'var(--pos)' }
      : score >= 50
        ? { l: 'warn', c: 'var(--warn)' }
        : { l: 'block', c: 'var(--neg)' }
  return (
    <Card
      title="Nutrition score"
      sub="deterministic · no AI"
      attrappe={ATTRAPPE}
      actions={
        <Pill style={{ borderColor: `color-mix(in srgb, ${band.c} 35%, var(--border))`, color: band.c }}>
          {band.l}
        </Pill>
      }
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
        {score === null
          ? (
            <div className="v2-muted" style={{ fontSize: 11.5, lineHeight: 1.5, flex: 1 }}>
              {stufeGilt(level) ? STUFE_OFFEN_SATZ : STUFE_UNBEKANNT_SATZ}
            </div>
          )
          : <Ring value={Math.round(score)} max={100} color={band.c} label="score" size={88} stroke={7} />}
        <div style={{ flex: 1 }}>
          <div className="v2-dim v2-num" style={{ fontSize: 10.5, lineHeight: 1.7 }}>
            protein 0.79 × 0.30<br />
            calorie 0.68 × 0.25<br />
            carbs&nbsp;&nbsp; 0.53 × 0.15<br />
            fat&nbsp;&nbsp;&nbsp;&nbsp; 0.80 × 0.15<br />
            fiber&nbsp;&nbsp; 0.69 × 0.15
          </div>
        </div>
      </div>
      {/* `[read]` **Drei Faelle, drei Texte.** „offen (G-228)" gilt
          nur fuer eine BEKANNTE Stufe ohne Faktor; ein unbekannter
          Name hat mit G-228 nichts zu tun und darf ihn nicht
          zitieren. */}
      <Row
        label="Level multiplier"
        value={stufenFaktor(level) !== null
          ? `${level} · ×${stufenFaktor(level)}`
          : stufeGilt(level)
            ? `${level} · offen (G-228)`
            : `${level} · unbekannt`}
      />
      <Row label="Thresholds" value="ok ≥ 80 · warn 50–79 · block < 50" />
      {/* `[cmd]` **G-283: hier stand *„Auth · experience_level"*** —
          und die Kachel setzt `level` fest auf `'advanced'`. **Sie las
          das Profil nie.** Ein Satz, der eine Quelle nennt, die nicht
          benutzt wird, ist eine Falschaussage. */}
      <Row label="Source of level" value="fest im Entwurf · liest kein Profil" />
    </Card>
  )
}

export function NutritionPendingActions() {
  return (
    <Card title="Pending actions" sub="feeds Buddy's daily TODO" attrappe={ATTRAPPE}>
      <div className="v2-col-gap" style={{ gap: 6 }}>
        {([
          { t: '2 ghost entries still open', s: 'Pre-workout 16:30 · Dinner 20:00', trigger: 'meal_plan pending', sev: 'warn', act: 'Confirm' },
          { t: 'Water below 80% of target', s: '1.2 L logged + 0.6 L from food = 1.8 of 3.0 L', trigger: 'after 18:00', sev: 'warn', act: 'Log water' },
          { t: 'Protein 38 g short', s: '142 of 180 g · dinner should cover it', trigger: 'daily target', sev: 'info', act: 'See suggestions' },
        ] as const).map(a => {
          const c = a.sev === 'warn' ? 'var(--warn)' : 'var(--acc-nutri)'
          return (
            <div key={a.t} style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: 10,
              background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 6,
            }}>
              <div style={{ width: 3, alignSelf: 'stretch', background: c, borderRadius: 2 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12.5, fontWeight: 500 }}>{a.t}</div>
                <div className="v2-dim" style={{ fontSize: 10.5, marginTop: 2 }}>{a.s}</div>
              </div>
              <span className="v2-dim v2-num" style={{ fontSize: 9.5 }}>{a.trigger}</span>
              <InEntwicklungKnopf titel={a.act} className="v2-btn v2-btn-sm">{a.act}</InEntwicklungKnopf>
            </div>
          )
        })}
      </div>
    </Card>
  )
}

export function PreWorkoutOptimizer() {
  const u = 2 * Math.PI * 34
  return (
    <Card
      title="Pre-workout window · 17:30 session"
      sub="optimal nutrition timing"
      attrappe={ATTRAPPE}
      actions={<InEntwicklungKnopf titel="Why this?" className="v2-btn v2-btn-ghost v2-btn-sm">Why this?</InEntwicklungKnopf>}
    >
      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          <div className="v2-ring" style={{ width: 76, height: 76 }}>
            <svg width="76" height="76">
              <circle cx="38" cy="38" r="34" stroke="var(--surface-2)" strokeWidth="6" fill="none" />
              <circle cx="38" cy="38" r="34" stroke="var(--acc-nutri)" strokeWidth="6" fill="none"
                      strokeDasharray={u} strokeDashoffset={u * (1 - 0.68)} strokeLinecap="round" />
            </svg>
            <div className="v2-ring-label"><span className="v2-v" style={{ fontSize: 24 }}>68</span></div>
          </div>
          <Pill variant="acc" style={{ fontSize: 9.5 }}>optimal</Pill>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4, letterSpacing: '-0.01em' }}>Eat by 16:00</div>
          <div className="v2-muted" style={{ fontSize: 11.5, marginBottom: 8 }}>90 min before training</div>
          <div className="v2-muted" style={{ fontSize: 11.5, lineHeight: 1.5 }}>
            Window is 60–120 min before compound lifting. You have{' '}
            <span className="v2-num" style={{ color: 'var(--fg)' }}>2h 28m</span>.
          </div>
        </div>
      </div>
      <div className="v2-divider" />
      <div className="v2-eyebrow" style={{ marginBottom: 6 }}>Suggested macros for this pre-workout</div>
      <div className="v2-grid v2-g-cols-3" style={{ gap: 8, marginBottom: 12 }}>
        {[
          { l: 'Carbs', v: '60 g', s: 'fast-acting' },
          { l: 'Protein', v: '25-30 g', s: 'lean source' },
          { l: 'Fat', v: '<10 g', s: 'minimal · slows digestion' },
        ].map(m => (
          <Card key={m.l} className="v2-card-tight" style={{ padding: 10 }}>
            <div className="v2-eyebrow">{m.l}</div>
            <div className="v2-num" style={{ fontSize: 16 }}>{m.v}</div>
            <div className="v2-dim" style={{ fontSize: 10 }}>{m.s}</div>
          </Card>
        ))}
      </div>
      <div className="v2-eyebrow" style={{ marginBottom: 6 }}>Suggested foods from your favorites</div>
      <div className="v2-col-gap" style={{ gap: 4 }}>
        {[
          { n: 'Basmati rice + Whey + Banana', m: '~450 kcal · 28P · 65C · 4F' },
          { n: 'Oatmeal + Whey + Honey', m: '~430 kcal · 30P · 60C · 5F' },
          { n: 'Sourdough + Turkey + Berries', m: '~420 kcal · 28P · 58C · 6F' },
        ].map(f => (
          <div key={f.n} style={{
            padding: '8px 10px', background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 5, fontSize: 11.5, display: 'flex', gap: 8, alignItems: 'center',
          }}>
            <span style={{ flex: 1 }}>{f.n}</span>
            <span className="v2-num v2-dim">{f.m}</span>
            <InEntwicklungKnopf titel="Add" className="v2-btn v2-btn-sm">Add</InEntwicklungKnopf>
          </div>
        ))}
      </div>
    </Card>
  )
}

// HydrationCard ist ENTFALLEN: die Kachel ist angebunden und liegt
// jetzt in `hydration.tsx` — mit echten Zahlen aus `hydration_day` und
// den zwei Farben fuer getrunken / aus Lebensmitteln.

export function MicronutrientSnapshot() {
  return (
    <Card
      title="Micronutrient snapshot"
      sub="vs target · today"
      attrappe={ATTRAPPE}
      actions={
        <a href="/v2/nutrition?tab=nutrients" className="v2-btn v2-btn-ghost"
           style={{ height: 22, fontSize: 11, padding: '0 8px' }}>Deep dive →</a>
      }
    >
      <RadarChart
        color="var(--acc-nutri)"
        data={[
          { label: 'Vit C', value: 0.82, target: 0.8 },
          { label: 'Vit D', value: 0.42, target: 0.8 },
          { label: 'Iron', value: 0.91, target: 0.8 },
          { label: 'Ca', value: 0.74, target: 0.8 },
          { label: 'Mg', value: 0.68, target: 0.8 },
          { label: 'Zn', value: 0.85, target: 0.8 },
          { label: 'B12', value: 0.93, target: 0.8 },
          { label: 'ω-3', value: 0.55, target: 0.8 },
        ]}
        h={220}
      />
      <div style={{ marginTop: 8, fontSize: 10, color: 'var(--fg-muted)', display: 'flex', gap: 12 }}>
        <span className="v2-row-gap"><span className="v2-dot" style={{ background: 'var(--acc-nutri)' }} />Today</span>
        <span className="v2-row-gap"><span style={{ width: 8, height: 1.5, background: 'var(--fg-dim)', display: 'block' }} />Target</span>
      </div>
    </Card>
  )
}

export function BelowThreshold() {
  return (
    <Card
      title="Below threshold"
      sub="3 of 117"
      attrappe={ATTRAPPE}
      actions={
        <InEntwicklungKnopf titel="Filter" className="v2-icon-btn">
          <Icon name="filter" className="v2-ic v2-ic-sm" />
        </InEntwicklungKnopf>
      }
    >
      {[
        { name: 'Vitamin D', val: '8.4 µg', tgt: '20 µg', pct: 42 },
        { name: 'Omega-3', val: '0.9 g', tgt: '1.6 g', pct: 55 },
        { name: 'Magnesium', val: '240 mg', tgt: '350 mg', pct: 68 },
      ].map((n, i) => (
        <div key={n.name} style={{ padding: '8px 0', borderBottom: i < 2 ? '1px solid var(--border)' : 'none' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ fontSize: 12 }}>{n.name}</span>
            <span className="v2-num" style={{ fontSize: 11, color: 'var(--warn)' }}>{n.val} / {n.tgt}</span>
          </div>
          <Meter value={n.pct} color="var(--warn)" />
        </div>
      ))}
    </Card>
  )
}
