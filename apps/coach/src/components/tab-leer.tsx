// Leerzustaende mit Ursache (Muster G-65): eine Kachel sagt, WORAN es
// haengt — fehlende Tabelle oder offene Entscheidung. Keine Attrappe,
// keine erfundene Zahl.
import { Card, Empty } from '@lumeos/ui'

export const LEERE_TABS: Record<string, { titel: string; grund: string }> = {
  analytics: {
    titel: 'Analytics',
    grund: 'Es gibt keine Metriken-Tabelle, und Coach-Kennzahlen wie Retention oder Response-Zeit waeren Personennoten — T7 liegt bei Tom. Zahlen je Athlet stehen in der Klientenakte.',
  },
  rules: {
    titel: 'Rules',
    grund: 'Regel-Tabellen existieren nicht. Das uebernehmbare Muster ist die ruleSchema-Whitelist des Vorgaengers ohne Medical-Metriken (F-06, 4.4) — eigener Bauauftrag.',
  },
  patterns: {
    titel: 'Patterns',
    grund: 'Prognosen (Adherence-Forecast, Risikofenster) haben weder Datenmodell noch Spec-Grundlage — die SPEC_11-Zahlen dazu waren erfunden (F-06, 2.3).',
  },
  intervene: {
    titel: 'Interventions',
    grund: 'Die Interventionsmaschine beruehrt Konfrontation und Identitaetsaussagen — E8 liegt bei Tom. Ohne Entscheidung wird hier nichts gebaut.',
  },
  plans: {
    titel: 'Plans',
    grund: 'Plan-Tabellen existieren nicht. Das Vertragsmuster des Vorgaengers (Zuweisung als Angebot, pending -> accepted) ist im Entwurf beschrieben — eigener Bauauftrag.',
  },
  programs: {
    titel: 'Programs',
    grund: 'Programm-Tabellen existieren nicht, und Auto-Delivery ist E4 (offen): liefert ein bestaetigtes Programm Woche fuer Woche ohne weitere Bestaetigung?',
  },
  revenue: {
    titel: 'Revenue',
    grund: 'Geld gehoert zum Marketplace, nicht ins Portal (F-06 T8) — und der Marketplace wartet auf die Rechtsklaerung.',
  },
  team: {
    titel: 'Team & Audit',
    grund: 'Team-Rollen existieren nicht (Skalierungsthema, T8). Die Aenderungshistorien der Rechte stehen im Consent-Tab.',
  },
}

export function TabLeer({ tab }: { tab: string }) {
  const eintrag = LEERE_TABS[tab]
  if (!eintrag) return null
  return (
    <Card title={eintrag.titel}>
      <Empty title="Bewusst leer" sub={eintrag.grund} />
    </Card>
  )
}
