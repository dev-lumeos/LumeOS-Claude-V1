// Die Kacheln von Auswertung, Regeln, Team und Umsatz — G-407.
//
// `[read]` **Zwei dieser Vermerke nennen keine fehlende Tabelle,
// sondern eine ENTSCHEIDUNG:** Kennzahlen je Coach waeren
// Personennoten (T7), und Geld gehoert zum Marketplace (F-06 T8).
//
// `[cmd]` **Das ist ein anderer Grund als „keine Tabelle"** — und
// er gehoert in den Vermerk, sonst sucht jemand nach einer Tabelle,
// die niemand bauen wollte.
import * as React from 'react'
import { Card, Pill, Row, KPI, Meter, Sparkline } from '@lumeos/ui'

import {
  AUTONOMY_LEVELS, RULE_TRIGGERS, RULE_TEMPLATES, ACTIVE_RULES,
  SMART_ALERTS, COACH_ROLES, TEAM_MEMBERS, COACH_AUDIT, COACH_KPIS,
  COACH_PLANS, PORTAL_ATHLETES,
} from './daten-auswertung'
import {
  Streifen, Haken, Balken, Kasten, KastenKopf, Attrappe,
  Raster, Stapel, Auge,
} from './bausteine'

const KEINE_REGEL = 'keine Tabelle fuer Coach-Regeln'
const KEINE_KENNZAHL = 'keine Tabelle fuer Kennzahlen je Coach — '
  + 'Retention und Antwortzeit waeren Personennoten (T7, nicht entschieden)'
const KEIN_MODELL = 'keine Tabelle fuer Vorhersagen — coach.checkins '
  + 'traegt Ist-Werte, kein Modell'
const KEIN_GELD = 'keine Tabelle fuer Umsatz — Geld gehoert zum '
  + 'Marketplace (F-06 T8)'
const KEIN_TEAM = 'keine Tabelle fuer das Team und kein Pruefprotokoll — '
  + 'coach fuehrt 15 Tabellen, keine davon nennt Mitarbeiter'

const V = (quelle: string, fehlt: string) => <Attrappe fehlt={fehlt} quelle={quelle} />

// ── analytics · Analytics ───────────────────────────────────────

export function AnsichtAuswertung() {
  const k = COACH_KPIS
  return (
    <Stapel>
      <Raster spalten="repeat(4, 1fr)">
        <KPI
          label="Retention · 90 T"
          value={`${k.retention90d.value} %`}
          delta={`vs. ${k.retention90d.benchmark} % Richtwert`}
          deltaVariant="pos"
        />
        <KPI
          label="Zufriedenheit"
          value={`${k.satisfactionAvg.value} ★`}
          delta={`${Math.round(k.satisfactionAvg.response * 100)} % Ruecklauf`}
        />
        <KPI
          label="Ziele erreicht"
          value={`${k.goalCompletion.rate} %`}
          delta={`${k.goalCompletion.onTime} % puenktlich`}
        />
        <KPI
          label="Autonomie-Zuwachs"
          value={`+${k.autonomyProgression.avgLevelIncrease}`}
          delta={`${k.autonomyProgression.clientsProgressed} Athleten`}
        />
      </Raster>

      <Raster spalten="1.4fr 1fr">
        <Card title="Wirksamkeit" sub="gegen die Ziele">
          <Row
            label="Antwortzeit im Mittel"
            value={`${k.responseTime.avg} h · Ziel ${k.responseTime.target} h`}
          />
          <Row label="Perzentil (LumeOS)" value={`P${k.responseTime.percentile}`} />
          <Row label="Alarm bearbeitet in" value={`${k.alertResolution.avg} h`} />
          <Row label="Alarm-Erledigungsquote" value={`${k.alertResolution.rate} %`} />
          <Row
            label="Eingriffe von sich aus"
            value={`${k.proactiveInterventions.count} · ${k.proactiveInterventions.successRate} % erfolgreich`}
          />
          {V('COACH_KPIS', KEINE_KENNZAHL)}
        </Card>

        <Card title="Je Klient" sub="wirtschaftlich">
          <Row label="Umsatz je Klient" value={`€${k.revenuePerClient}`} />
          <Row label="Lebenswert" value={`€${k.ltv}`} />
          <Row label="Empfehlungsquote" value={`${Math.round(k.referralRate * 100)} %`} />
          <Row label="Ausweitung" value={`€${k.expansion}`} />
          {V('COACH_KPIS', KEIN_GELD)}
        </Card>
      </Raster>

      <Card title="Autonomie ueber die Liste" sub={`${AUTONOMY_LEVELS.length} Stufen`}>
        <Stapel gap={8}>
          {AUTONOMY_LEVELS.map(l => (
            <Kasten key={l.lvl}>
              <KastenKopf
                name={<><span className="v2-mono">{l.lvl}</span> · {l.name}</>}
                marken={<><Pill>{l.cadence}</Pill><Pill>{l.style}</Pill></>}
              />
              <div className="dk-streifen-text">{l.desc}</div>
            </Kasten>
          ))}
        </Stapel>
        {V('AUTONOMY_LEVELS', KEINE_KENNZAHL)}
      </Card>
    </Stapel>
  )
}

// ── patterns · Pattern analysis ─────────────────────────────────

export function AnsichtMuster() {
  return (
    <Stapel>
      <Streifen
        icon="trend_up"
        titel="Was sich wiederholt"
        text={'Die Vorlage sucht Muster ueber Wochen — Erfuellung gegen '
          + 'Erholung, Volumen gegen Schlaf. Dafuer braucht es ein Modell '
          + 'und eine Reihe, nicht nur den letzten Wert.'}
      />
      <Raster spalten="1fr 1fr">
        <Card title="Erfuellung je Athlet" sub={`${PORTAL_ATHLETES.length} Athleten`}>
          <Stapel gap={10}>
            {PORTAL_ATHLETES.map(a => (
              <Balken
                key={a.id}
                label={a.name}
                wert={a.compliance}
                note={`${a.plan} · zuletzt ${a.lastSession}`}
              />
            ))}
          </Stapel>
          {V('PORTAL_ATHLETES', KEIN_MODELL)}
        </Card>
        <Card title="Wo Alarme haengen" sub="je Athlet offen">
          <Stapel gap={6}>
            {PORTAL_ATHLETES.map(a => (
              <Row
                key={a.id}
                label={a.name}
                sub={a.tags.join(' · ')}
                value={a.alerts === 0
                  ? <Pill variant="pos">0</Pill>
                  : <Pill variant="warn">{a.alerts}</Pill>}
              />
            ))}
          </Stapel>
          {V('PORTAL_ATHLETES', KEIN_MODELL)}
        </Card>
      </Raster>
    </Stapel>
  )
}

// ── revenue · Revenue ───────────────────────────────────────────

export function AnsichtUmsatz() {
  const k = COACH_KPIS
  return (
    <Stapel>
      <Streifen
        icon="alert"
        titel="Geld gehoert zum Marketplace"
        text={'F-06 T8: die Abrechnung liegt nicht beim Coach-Modul. Die '
          + 'Vorlage zeigt sie hier — deshalb steht die Form, aber es gibt '
          + 'keine Tabelle, aus der sie lesen koennte.'}
        ton="warn"
      />
      <Raster spalten="repeat(4, 1fr)">
        <KPI label="Umsatz je Klient" value={`€${k.revenuePerClient}`} />
        <KPI label="Lebenswert" value={`€${k.ltv}`} />
        <KPI label="Ausweitung" value={`€${k.expansion}`} />
        <KPI label="Empfehlungen" value={`${Math.round(k.referralRate * 100)} %`} />
      </Raster>
      <Card title="Plaene" sub={`${COACH_PLANS.length} · was sich verkauft`}>
        <table className="cp-tabelle">
          <thead>
            <tr>
              <th>Name</th><th style={{ width: 110 }}>Art</th>
              <th style={{ width: 90, textAlign: 'right' }}>Zugewiesen</th>
              <th style={{ width: 80, textAlign: 'right' }}>Verkaeufe</th>
              <th style={{ width: 80, textAlign: 'right' }}>Bewertung</th>
            </tr>
          </thead>
          <tbody>
            {COACH_PLANS.map(p => (
              <tr key={p.id}>
                <td>{p.name}</td>
                <td><Pill>{p.category}</Pill></td>
                <td className="v2-num" style={{ textAlign: 'right' }}>{p.assignedTo}</td>
                <td className="v2-num" style={{ textAlign: 'right' }}>{p.sells}</td>
                <td className="v2-num" style={{ textAlign: 'right' }}>{p.rating}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {V('COACH_PLANS', KEIN_GELD)}
      </Card>
    </Stapel>
  )
}

// ── rules · Rules ───────────────────────────────────────────────

export function AnsichtRegeln() {
  const gefeuert = ACTIVE_RULES.reduce((s, r) => s + r.fired, 0)
  return (
    <Stapel>
      <Raster spalten="repeat(4, 1fr)">
        <KPI label="Regeln aktiv" value={ACTIVE_RULES.filter(r => r.active).length} />
        <KPI label="ausgeloest" value={gefeuert} />
        <KPI label="Fehlalarme" value={ACTIVE_RULES.reduce((s, r) => s + r.falsePositives, 0)} />
        <KPI label="Vorlagen" value={RULE_TEMPLATES.length} />
      </Raster>

      <Card title="Aktive Regeln" sub={`${ACTIVE_RULES.length}`}>
        <table className="cp-tabelle">
          <thead>
            <tr>
              <th>Name</th><th style={{ width: 100 }}>Schwere</th>
              <th style={{ width: 90, textAlign: 'right' }}>Athleten</th>
              <th style={{ width: 80, textAlign: 'right' }}>Male</th>
              <th style={{ width: 90, textAlign: 'right' }}>Fehlalarm</th>
              <th style={{ width: 120 }}>Zuletzt</th>
            </tr>
          </thead>
          <tbody>
            {ACTIVE_RULES.map(r => (
              <tr key={r.id}>
                <td>{r.name}</td>
                <td>
                  {/* `[cmd]` **Die Vorlage kennt CRITICAL, HIGH,
                      MEDIUM, LOW, INFO** — `WARNING` hatte ich
                      erfunden, `tsc` hat es gemeldet. */}
                  <Pill variant={r.severity === 'CRITICAL' ? 'neg'
                    : r.severity === 'HIGH' ? 'warn' : undefined}>
                    {r.severity}
                  </Pill>
                </td>
                <td className="v2-num" style={{ textAlign: 'right' }}>{r.assignedTo}</td>
                <td className="v2-num" style={{ textAlign: 'right' }}>{r.fired}</td>
                <td className="v2-num" style={{ textAlign: 'right' }}>{r.falsePositives}</td>
                <td className="v2-mono v2-dim">{r.lastFired}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {V('ACTIVE_RULES', KEINE_REGEL)}
      </Card>

      <Raster spalten="1fr 1.3fr">
        <Card title="Ausloeser" sub={`${RULE_TRIGGERS.length} Arten`}>
          <Stapel gap={8}>
            {RULE_TRIGGERS.map(t => (
              <Kasten key={t.id}>
                <KastenKopf name={t.label} />
                <div className="dk-streifen-text">{t.desc}</div>
              </Kasten>
            ))}
          </Stapel>
          {V('RULE_TRIGGERS', KEINE_REGEL)}
        </Card>

        <Card title="Vorlagen" sub={`${RULE_TEMPLATES.length} zum Uebernehmen`}>
          <Stapel gap={8}>
            {RULE_TEMPLATES.map(t => (
              <Kasten key={t.id}>
                <KastenKopf
                  name={t.name}
                  marken={<><Pill>{t.cat}</Pill><Pill>{t.diff}</Pill></>}
                  rechts={`★ ${t.rating} · ${t.downloads}x`}
                />
                <div className="dk-streifen-text">{t.desc}</div>
              </Kasten>
            ))}
          </Stapel>
          {V('RULE_TEMPLATES', KEINE_REGEL)}
        </Card>
      </Raster>
    </Stapel>
  )
}

// ── team · Team & audit ─────────────────────────────────────────

export function AnsichtTeam() {
  return (
    <Stapel>
      <Raster spalten="repeat(3, 1fr)">
        <KPI label="Mitglieder" value={TEAM_MEMBERS.length} />
        <KPI label="Athleten gesamt" value={TEAM_MEMBERS.reduce((s, m) => s + m.athletes, 0)} />
        <KPI label="Protokollzeilen" value={COACH_AUDIT.length} />
      </Raster>

      <Card title="Das Team" sub={`${TEAM_MEMBERS.length} Mitglieder`}>
        <table className="cp-tabelle">
          <thead>
            <tr>
              <th>Name</th><th style={{ width: 130 }}>Rolle</th>
              <th style={{ width: 90, textAlign: 'right' }}>Athleten</th>
              <th style={{ width: 80, textAlign: 'right' }}>Dabei</th>
              <th style={{ width: 90, textAlign: 'right' }}>Bewertung</th>
            </tr>
          </thead>
          <tbody>
            {TEAM_MEMBERS.map(m => {
              const rolle = COACH_ROLES.find(r => r.id === m.role)
              return (
                <tr key={m.id}>
                  <td>{m.name}</td>
                  <td><Pill>{rolle?.label ?? m.role}</Pill></td>
                  <td className="v2-num" style={{ textAlign: 'right' }}>{m.athletes}</td>
                  <td className="v2-num" style={{ textAlign: 'right' }}>{m.since}</td>
                  <td className="v2-num" style={{ textAlign: 'right' }}>{m.rating}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {V('TEAM_MEMBERS', KEIN_TEAM)}
      </Card>

      <Raster spalten="1fr 1.4fr">
        <Card title="Rollen" sub={`${COACH_ROLES.length}`}>
          <Stapel gap={8}>
            {COACH_ROLES.map(r => (
              <Kasten key={r.id}>
                <KastenKopf name={r.label} />
                <Stapel gap={4}>
                  {Object.keys(r.caps).map(c => <Haken key={c}>{c}</Haken>)}
                </Stapel>
              </Kasten>
            ))}
          </Stapel>
          {V('COACH_ROLES', KEIN_TEAM)}
        </Card>

        <Card title="Pruefprotokoll" sub={`${COACH_AUDIT.length} Eintraege`}>
          <Stapel gap={5}>
            {COACH_AUDIT.map((a, i) => (
              <Row
                key={i}
                label={<><Pill>{a.cat}</Pill> {a.action}</>}
                sub={a.who}
                value={<span className="v2-mono v2-dim">{a.ts}</span>}
              />
            ))}
          </Stapel>
          {V('COACH_AUDIT', KEIN_TEAM)}
        </Card>
      </Raster>
    </Stapel>
  )
}

/** Die fuenf dieser Gruppe. */
export const AUSWERTUNG_ANSICHTEN: Record<string, () => React.JSX.Element> = {
  analytics: AnsichtAuswertung,
  patterns: AnsichtMuster,
  revenue: AnsichtUmsatz,
  rules: AnsichtRegeln,
  team: AnsichtTeam,
}

/** `SMART_ALERTS` steht bereit, wird aber von `alerts` echt gelesen. */
export { SMART_ALERTS }
