// Nachweisseite der Oberflaeche v2 (G-01, erweitert in G-02).
//
// Zweig: die Huelle steht — Navigation, Kopfzeile, Inhaltsbereich,
// Kontextspalte. KEINE Modulinhalte; die sind G-03 und G-06.
//
// Die Seite zeigt die geteilten Bausteine einmal in Betrieb, damit
// belegbar ist, dass sie greifen. Sie ist kein Modul und wird beim
// Umschalten (G-07) ersetzt.
import { Card, KPI, Pill, Ring, Meter, Row, ModuleHero } from '@lumeos/ui'
import { AkzentProbe } from './akzent-probe'

const AKZENTE = [
  ['--acc-dash', 'Dashboard'],
  ['--acc-nutri', 'Nutrition'],
  ['--acc-train', 'Training'],
  ['--acc-recov', 'Recovery'],
  ['--acc-suppl', 'Supplements'],
  ['--acc-goals', 'Goals'],
  ['--acc-medic', 'Medical'],
  ['--acc-coach', 'Coach'],
  ['--acc-buddy', 'Buddy'],
  ['--acc-mkt', 'Marketplace'],
  ['--acc-admin', 'Admin'],
] as const

export default function V2Page() {
  return (
    <>
      <ModuleHero
        icon="dashboard"
        title="Oberflaeche v2 · Huelle"
        sub="G-02: Seitenleiste, Kopfzeile und Kontextspalte stehen. Die Modulinhalte folgen in G-03."
        pills={<><Pill variant="acc">G-02</Pill><Pill>Attrappe</Pill></>}
        stats={[
          { label: 'Bausteine', value: '9', sub: 'aus shared.jsx' },
          { label: 'Symbole', value: '51', sub: 'getypt' },
          { label: 'Klassen', value: '145', sub: 'Praefix v2-' },
        ]}
      />

      <AkzentProbe akzente={AKZENTE} />

      <div className="v2-grid v2-g-cols-2" style={{ marginTop: 16 }}>
        <Card title="Bausteine" sub="einmal in Betrieb">
          <div className="v2-grid v2-g-cols-2" style={{ marginBottom: 12 }}>
            <KPI label="Kalorien" value="2.145" unit="kcal" delta="+120"
                 deltaVariant="pos" spark={[10, 14, 12, 18, 16, 22, 20]} />
            <KPI label="Protein" value="148" unit="g" delta="-12" deltaVariant="neg" />
          </div>
          <Row label="Ring, Meter, Pill" value="Beispiel" />
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 12 }}>
            <Ring value={72} label="Score" size={92} />
            <div style={{ flex: 1 }}>
              <Meter value={72} />
              <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
                <Pill variant="pos">pos</Pill>
                <Pill variant="warn">warn</Pill>
                <Pill variant="neg">neg</Pill>
                <Pill variant="acc">acc</Pill>
              </div>
            </div>
          </div>
        </Card>

        <Card title="Was hier NICHT steht" sub="mit Absicht">
          <Row label="Modulinhalte" value="G-03 / G-06" />
          <Row label="Buddy-Antworten" value="Attrappe" />
          <Row label="Befehlspalette" value="fehlt" />
          <Row label="Benachrichtigungen" value="fehlt" />
          <p style={{
            marginTop: 12, fontSize: 12, lineHeight: 1.5, color: 'var(--fg-muted)',
          }}>
            Bedienelemente ohne Funktion sind deaktiviert statt still. Ein
            Knopf, der nichts tut, ist ein Versprechen — ein deaktivierter
            ist eine Aussage.
          </p>
        </Card>
      </div>
    </>
  )
}
