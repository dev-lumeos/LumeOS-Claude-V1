'use client'

// Die zehn Vorlagenkarten ohne Gegenstueck — G-391.
//
// **Tom, 2026-09-08:** *„coach mockup erstellen, ueberlagernd mit dem
// bestehenden was schon gebaut ist."*
//
// ══ WARUM NUR ZEHN VON 62 ═══════════════════════════════════════════
//
// `[cmd]` **Gemessen 2026-09-09: die acht Vorlagen tragen 62 Karten
// mit Namen** (`<Card|CMod … title=`). `[cmd]` **23 haben bereits ein
// Gegenstueck** in `mockup-referenz.tsx` und `ai/mockup-referenz.tsx`
// (G-365). **Von den uebrigen 39 stehen 29 in
// `tools/vollstaendigkeit.mjs` unter `coach.bekanntOffen`** — der
// Trainerarbeitsplatz, der seit G-02 als externer Link auf
// `coach.lumeos.app` steht und **nicht in dieses Modul gehoert**
// (`docs/ssot/102-coach-mockup.md`, `human/page.tsx:33`).
//
// `[read]` **Bleiben zehn, die weder gebaut noch begruendet sind.**
// **Genau die stehen hier** — mit dem Zustand, den die Datenbank
// hergibt, und dem Grund, warum sie fehlen.
//
// ══ DIE ZEHN, JE MIT STUFE ══════════════════════════════════════════
//
//     VisualRuleBuilder        Building blocks         blockiert
//                              Rule canvas             blockiert
//     PatternAnalysisView      Adherence forecast      blockiert
//                              Risk indicators         baubar
//                              Day-of-week pattern     angebunden
//                              Event impact analysis   blockiert
//     InterventionEngineView   Active interventions    baubar
//     ConsentFlowView          Client consent          baubar
//     AlertBatching            Batched                 angebunden
//     AuditLogV2               Audit log               baubar
//
// `[cmd]` **Drei der sechs Ansichten stehen im SSOT als „Portal"**
// (`102-coach-mockup.md:175/176/179` — `PatternAnalysisView`,
// `InterventionEngineView`, `ConsentFlowView`), **aber NICHT in
// `bekanntOffen`.** `[read]` **Ein Widerspruch zwischen zwei
// Verzeichnissen desselben Sachverhalts** — gemeldet, nicht
// aufgeloest: welches von beiden gilt, entscheidet Tom.
//
// `[cmd]` **Und zwei Vorlagen kennt das Werkzeug gar nicht:**
// `module-coach-portal-v2.jsx` und `-portal-workflows.jsx` stehen in
// keiner Zeile von `vollstaendigkeit.mjs` — **elf Karten, die keine
// Zaehlung je gesehen hat.**
import * as React from 'react'
import { Card, Pill } from '@lumeos/ui'

import { ReferenzTrenner } from '@/components/shell/referenz-trenner'

const Q_EXTRAS = 'theme-v1/module-coach-extras.jsx'
const Q_GAPS = 'theme-v1/module-coach-gaps.jsx'
const Q_PORTAL = 'theme-v1/module-coach-portal-v2.jsx'

/**
 * Der Attrappenvermerk: Quelle und WORAUF gewartet wird.
 *
 * `[read]` **Ein Vermerk mit falschem Grund ist schlimmer als eine
 * fehlende Kachel** — er verhindert, dass jemand nachsieht. **Also
 * steht hier die gemessene Tabelle, nicht eine Vermutung.**
 */
function fehlt(quelle: string, wartet: string): string {
  return `Attrappe — ${quelle} · wartet auf: ${wartet}`
}

/** Die Stufe als Marke, damit man sie nicht lesen muss. */
function Stufe({ art }: { art: 'angebunden' | 'baubar' | 'blockiert' }) {
  const farbe = art === 'angebunden' ? 'var(--pos)'
    : art === 'baubar' ? 'var(--warn)' : 'var(--fg-dim)'
  return (
    <span className="v2-mono" style={{ fontSize: 9.5, color: farbe }}>{art}</span>
  )
}

// ── Entwurfsdaten, wie in der Vorlage ───────────────────────────────
//
// `[cmd]` **Aus den Vorlagen abgeschrieben, nicht erfunden** — die
// Kachel soll aussehen wie der Entwurf. `[read]` **Angebunden wird
// hier nichts** (der Auftrag sagt es ausdruecklich).
const BAUSTEINE: Array<[string, string]> = [
  ['Trigger', 'adherence drops below X%'],
  ['Trigger', 'no check-in for N days'],
  ['Condition', 'autonomy level is at most N'],
  ['Action', 'send message from template'],
  ['Action', 'propose plan change'],
  ['Action', 'notify coach'],
]

const RISIKO: Array<[string, number, string]> = [
  ['Adherence sinkt 3 Wochen', 4, 'var(--neg)'],
  ['Check-in ueberfaellig', 3, 'var(--warn)'],
  ['Schlaf unter Zielwert', 2, 'var(--warn)'],
  ['Gewicht ausserhalb Band', 1, 'var(--fg-dim)'],
]

const WOCHENTAGE: Array<[string, number]> = [
  ['Mo', 82], ['Di', 78], ['Mi', 74], ['Do', 71],
  ['Fr', 63], ['Sa', 48], ['So', 51],
]

const EINGRIFFE: Array<[string, string, string]> = [
  ['Nachricht statt Anruf', 'laeuft', 'seit 4 d'],
  ['Plan um eine Woche gestreckt', 'laeuft', 'seit 11 d'],
  ['Check-in-Rhythmus halbiert', 'beendet', 'vor 3 d'],
]

const FREIGABEN: Array<[string, string]> = [
  ['Nutrition', 'voll'], ['Training', 'voll'], ['Recovery', 'nur Zusammenfassung'],
  ['Goals', 'voll'], ['Supplements', 'keine'], ['Medical', 'keine'],
]

function Balken({ wert, farbe = 'var(--acc-coach)' }: { wert: number, farbe?: string }) {
  return (
    <div style={{ flex: 1, height: 6, background: 'var(--surface-2)', borderRadius: 3 }}>
      <div style={{ width: `${wert}%`, height: '100%', background: farbe, borderRadius: 3 }} />
    </div>
  )
}

/**
 * Die zehn Karten, die keine Zaehlung kennt.
 *
 * `[read]` **Unter der Linie**, wie E-69 es verlangt — sie sind der
 * Soll-Stand, nicht der Ist-Stand.
 */
export function CoachPortalReferenz({ reiter }: { reiter: string }) {
  return (
    <>
      <ReferenzTrenner reiter={reiter} quelle="fuenf Vorlagen ohne Gegenstueck" />

      {/* ══ E-72: kein nackter Rahmen ═══════════════════════════
          `[read]` **Was diese Karten sind, steht ueber ihnen** —
          sonst liest sie jemand als gebaute Kacheln. */}
      <Card title="Zehn Karten ohne Gegenstueck"
            sub="gemessen 2026-09-09 · 62 Vorlagenkarten, 23 gebaut, 29 begruendet offen">
        <div className="v2-dim" style={{ fontSize: 11.5, lineHeight: 1.6 }}>
          Die acht Coach-Vorlagen tragen <strong>62</strong> Karten mit Namen.
          {' '}<strong>23</strong> haben ein Gegenstueck unter dieser Linie,
          {' '}<strong>29</strong> stehen in{' '}
          <span className="v2-mono">tools/vollstaendigkeit.mjs</span>
          {' '}unter <span className="v2-mono">coach.bekanntOffen</span> —
          {' '}der Trainerarbeitsplatz, der als eigene App unter
          {' '}<span className="v2-mono">coach.lumeos.app</span> laeuft.
          {' '}<strong>Diese zehn stehen in keiner der beiden Listen.</strong>
        </div>
        <div className="v2-divider" />
        <div className="v2-dim" style={{ fontSize: 10.5, lineHeight: 1.6 }}>
          <span className="v2-mono">module-coach-portal-v2.jsx</span> und
          {' '}<span className="v2-mono">-portal-workflows.jsx</span> stehen in
          {' '}keiner Zeile des Zaehlwerkzeugs — elf Karten, die noch keine
          {' '}Zaehlung gesehen hat.
        </div>
      </Card>

      {/* ══ VisualRuleBuilder ═══════════════════════════════════ */}
      <Card title="Building blocks" sub="Trigger · Condition · Action"
            actions={<Stufe art="blockiert" />}
            attrappe={fehlt(Q_EXTRAS,
              'eine Tabelle fuer Coach-Regeln — gemessen 2026-09-09: das '
              + 'Schema `coach` fuehrt 15 Tabellen, keine davon traegt '
              + 'Regeln. `wissen.rule_engine_rules` gibt es (64 Zeilen), '
              + 'das sind aber Substanz-Wechselwirkungen')}>
        <div className="v2-col-gap" style={{ gap: 5 }}>
          {BAUSTEINE.map(([art, text]) => (
            <div key={text} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '7px 10px', background: 'var(--bg-elev)',
              border: '1px solid var(--border)', borderRadius: 5,
            }}>
              <Pill style={{ fontSize: 8.5 }}>{art}</Pill>
              <span style={{ fontSize: 11.5 }}>{text}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card title="Rule canvas" sub="Regeln aus Bausteinen zusammensetzen"
            actions={<Stufe art="blockiert" />}
            attrappe={fehlt(Q_EXTRAS,
              'eine Tabelle fuer Coach-Regeln — dieselbe wie oben. '
              + 'Das Altrepo hat `CoachRuleBuilder.tsx` (27 KB)')}>
        <div className="v2-dim" style={{ fontSize: 11.5, lineHeight: 1.6 }}>
          Der Entwurf zeigt eine Flaeche, auf der Bausteine zu einer Regel
          {' '}verbunden werden. <strong>Ohne Tabelle gibt es nichts zu
          {' '}speichern</strong> — die Flaeche waere ein Formular ohne Ziel.
        </div>
      </Card>

      {/* ══ PatternAnalysisView ═════════════════════════════════ */}
      <Card title="Adherence forecast · 30 days" sub="Vorhersage mit Konfidenzband"
            actions={<Stufe art="blockiert" />}
            attrappe={fehlt(Q_GAPS,
              'eine Tabelle fuer Vorhersagen — es gibt keine. '
              + '`coach.checkins` traegt 6 Zeilen Ist-Werte, kein Modell '
              + 'und keine Prognose')}>
        <div className="v2-dim" style={{ fontSize: 11.5, lineHeight: 1.6 }}>
          Der Entwurf zeigt eine Kurve mit Konfidenzband.
          {' '}<strong>Eine Vorhersage ist eine Rechnung, kein Messwert</strong> —
          {' '}sie braucht ein Modell und einen Ort, an dem ihr Ergebnis steht.
        </div>
      </Card>

      <Card title="Risk indicators" sub="ueber die Kohorte"
            actions={<Stufe art="baubar" />}
            attrappe={fehlt(Q_GAPS,
              'einen Leseweg — `coach.alerts` gibt es (13 Spalten, 6 Zeilen), '
              + 'aber keine Datei liest sie. Das Altrepo hat '
              + '`buddyWatcher.ts` (37 KB)')}>
        <div className="v2-col-gap" style={{ gap: 7 }}>
          {RISIKO.map(([text, n, farbe]) => (
            <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ flex: 1, fontSize: 11.5 }}>{text}</span>
              <span className="v2-num" style={{ fontSize: 12, color: farbe }}>{n}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card title="Day-of-week pattern" sub="Adherence nach Wochentag"
            actions={<Stufe art="angebunden" />}
            attrappe={fehlt(Q_GAPS,
              'nichts — `coach.checkins` hat 6 Zeilen UND einen Leseweg. '
              + 'Die Kachel ist nur nicht gebaut')}>
        <div className="v2-col-gap" style={{ gap: 6 }}>
          {WOCHENTAGE.map(([tag, pct]) => (
            <div key={tag} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span className="v2-mono" style={{ width: 24, fontSize: 10.5 }}>{tag}</span>
              <Balken wert={pct} />
              <span className="v2-num v2-dim" style={{ fontSize: 10.5, width: 32, textAlign: 'right' }}>
                {pct}%
              </span>
            </div>
          ))}
        </div>
      </Card>

      <Card title="Event impact analysis" sub="wie Lebensereignisse die Einhaltung treffen"
            actions={<Stufe art="blockiert" />}
            attrappe={fehlt(Q_GAPS,
              'eine Tabelle fuer Lebensereignisse — `medical.health_events` '
              + 'gibt es, sie traegt aber medizinische Ereignisse, nicht '
              + 'Urlaub, Umzug oder Krankheit des Kindes')}>
        <div className="v2-dim" style={{ fontSize: 11.5, lineHeight: 1.6 }}>
          Der Entwurf setzt Ereignisse (Reise, Krankheit, Umzug) neben den
          {' '}Adherence-Verlauf. <strong>Die Ereignisse selbst hat niemand
          {' '}erfasst</strong> — es gibt kein Feld, in das sie ein Klient
          {' '}eintragen koennte.
        </div>
      </Card>

      {/* ══ InterventionEngineView ══════════════════════════════ */}
      <Card title="Active interventions" sub="laufende Eingriffe"
            actions={<Stufe art="baubar" />}
            attrappe={fehlt(Q_GAPS,
              'einen Leseweg fuer `coach.action_log` — `coach.pending_actions` '
              + 'wird gelesen (2 Zeilen), `coach.action_log` nicht (1 Zeile). '
              + 'Das Altrepo hat `buddyWatcher.ts`')}>
        <div className="v2-col-gap" style={{ gap: 6 }}>
          {EINGRIFFE.map(([text, status, wann]) => (
            <div key={text} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '8px 10px', background: 'var(--bg-elev)',
              border: '1px solid var(--border)', borderRadius: 5,
            }}>
              <span style={{ flex: 1, fontSize: 11.5 }}>{text}</span>
              <Pill variant={status === 'laeuft' ? 'warn' : undefined}
                    style={{ fontSize: 8.5 }}>{status}</Pill>
              <span className="v2-dim v2-mono" style={{ fontSize: 10 }}>{wann}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* ══ ConsentFlowView ═════════════════════════════════════ */}
      <Card title="Client consent · per module sharing" sub="je Modul, mit Zeitstempel"
            actions={<Stufe art="baubar" />}
            attrappe={fehlt(Q_GAPS,
              'einen Leseweg — `coach.client_consent_log` gibt es '
              + '(9 Spalten), sie ist aber LEER: 0 Zeilen. Erst schreiben, '
              + 'dann lesen. Das Altrepo hat `CoachOverridePanel.tsx`')}>
        <div className="v2-col-gap" style={{ gap: 5 }}>
          {FREIGABEN.map(([modul, art]) => (
            <div key={modul} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ flex: 1, fontSize: 11.5 }}>{modul}</span>
              <span className="v2-dim" style={{ fontSize: 10.5 }}>{art}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* ══ module-coach-portal-v2.jsx — vom Werkzeug ungesehen ═ */}
      <Card title="Batched" sub="gebuendelte Vorschlaege"
            actions={<Stufe art="angebunden" />}
            attrappe={fehlt(Q_PORTAL,
              'nichts — `coach.pending_actions` hat 2 Zeilen UND einen '
              + 'Leseweg. Diese Vorlage steht in keiner Zeile von '
              + '`vollstaendigkeit.mjs`')}>
        <div className="v2-dim" style={{ fontSize: 11.5, lineHeight: 1.6 }}>
          Der Entwurf buendelt mehrere Vorschlaege zu einer Freigabe.
          {' '}<span className="v2-mono">pending_actions</span> traegt
          {' '}<span className="v2-mono">status</span> und
          {' '}<span className="v2-mono">expires_at</span> — die Buendelung
          {' '}selbst hat keine Spalte.
        </div>
      </Card>

      <Card title="Audit log" sub="wer hat wann was geaendert"
            actions={<Stufe art="baubar" />}
            attrappe={fehlt(Q_PORTAL,
              'einen Leseweg fuer `coach.action_log` — 12 Spalten, 1 Zeile, '
              + 'keine Datei liest sie')}>
        <div className="v2-dim" style={{ fontSize: 11.5, lineHeight: 1.6 }}>
          <span className="v2-mono">action_log</span> traegt
          {' '}<span className="v2-mono">executed_at</span>,
          {' '}<span className="v2-mono">executed_by</span>,
          {' '}<span className="v2-mono">undone_at</span> und
          {' '}<span className="v2-mono">undo_data</span> — die Ruecknahme ist
          {' '}also vorgesehen. <strong>Gelesen wird sie nirgends.</strong>
        </div>
      </Card>
    </>
  )
}
