// Die Seitenleiste des Coach-Portals — G-401/A2.
//
// **Tom, 2026-09-08:** *„die coachplattform soll gleich aufgebaut
// sein wie lumeos. genau gleiche strukturen, also ja: sidenav und
// modulnav wie lumeos."*
//
// ══ WARUM EINE EIGENE LISTE UND NICHT `nav.ts` AUS DEM PAKET ════════
//
// `[cmd]` **`packages/ui/src/shell/nav.ts` fuehrt die sieben Module
// von `apps/web`** (dashboard, nutrition, training, recovery,
// supplements, goals, medical) **fest verdrahtet** — und
// `Sidebar.tsx:85` rendert `MODULES.map(...)`, ohne dass eine
// Requisite sie ersetzen koennte.
//
// `[cmd]` **Gemessen:** `SidebarProps` (`sidebar.tsx:37-50`) nimmt
// `pathname`, `linkAs`, `userName`, `userStatus`, `userInitials`,
// `userMenu`, `version` — **keine Navigationsliste.**
//
// `[read]` **Die Paketschale zeigte dem Coach also die Module des
// Athleten.** **Sie einspeisbar zu machen ist eine Aenderung in
// `packages/ui`** — die verbietet dieser Auftrag. **Gemeldet, nicht
// gebaut** (siehe Bericht).
//
// `[read]` **Die KLASSEN sind dieselben** (`v2-sidebar`,
// `v2-nav-group`, `v2-nav-item` …) — sie stehen in `v2.css`, und die
// laedt das Portal schon. **Gleiche Struktur, gleiche Optik, eigene
// Einträge.**
//
// ══ DIE GRUPPEN ═════════════════════════════════════════════════════
//
// `[cmd]` **Das Altrepo fuehrte fuenf Gruppen**
// (`referenz/lumeos-2026/apps/coach/components/Sidebar.tsx:22-48`) —
// **Struktur uebernommen, kein Code:**
//
//     (ohne Titel)   Dashboard
//     Kunden         Klienten, Nachrichten, Check-ins, Alerts
//     Programme      Ernaehrung, Training, Feedback
//     AI & Buddy     AI Butler, Buddy, Regeln, Wissen,
//                    Automations, Autonomie
//     (ohne Titel)   Analytics, Einstellungen
//
// `[cmd]` **Und es hatte Zaehler mit Stufen:** `badge`, dazu `warn`
// (ungelesene Nachrichten, offene Check-ins) und `critical`
// (kritische Alerts).
//
// `[read]` **Die sechzehn Reiter von heute sind darauf verteilt** —
// je Reiter gemessen, in welche Gruppe er gehoert. **Was das Portal
// nicht hat, steht auch nicht in der Liste**: kein AI Butler, kein
// Buddy, keine Wissensbasis — dafuer gibt es weder Reiter noch
// Tabelle.

// `[cmd]` **`IconName` ist exportiert** (`packages/ui/src/index.ts:29`)
// — ein `string` haette jeden Tippfehler durchgelassen, und `Icon`
// zeichnet dann nichts. `[read]` **Kein Cast**: ein Cast schaltet
// genau die Pruefung ab, die den Tippfehler findet.
import type { IconName } from '@lumeos/ui'

/** Ein Eintrag der Seitenleiste. */
export type PortalNavEintrag = {
  /** Der Bereich — gleich dem `?bereich=`-Parameter. */
  id: string
  label: string
  /** Ein Icon aus `@lumeos/ui` — getippt, nicht `string`. */
  icon: IconName
  /**
   * Die Reiter DIESES Bereichs — nicht alle sechzehn.
   *
   * `[read]` **Das ist der Kern von A4:** LumeOS zeigt je Modul eine
   * eigene Reiterleiste, nicht eine Zeile mit allem.
   */
  reiter: Array<{ id: string, label: string }>
  /**
   * Woraus der Zaehler faellt — oder `null`, wenn er nicht rechenbar
   * ist.
   *
   * `[read]` **Ein Zaehler ohne Daten bleibt weg** (G-400/A3): eine
   * erfundene Zahl in der Leiste waere schlimmer als keine.
   */
  zaehler: 'klienten' | 'ungelesen' | 'checkins' | 'alerts'
    | 'vorschlaege' | 'rechte' | 'autonomie' | 'einladungen' | null
  /** Die Stufe, wenn der Zaehler ueber null steht. */
  stufe?: 'warn' | 'critical'
}

export type PortalNavGruppe = {
  /** Ohne Titel bleibt die Gruppenbeschriftung weg — wie im Altrepo. */
  label: string | null
  eintraege: PortalNavEintrag[]
}

export const PORTAL_NAV: PortalNavGruppe[] = [
  {
    label: null,
    eintraege: [
      {
        id: 'uebersicht',
        label: 'Dashboard',
        icon: 'dashboard',
        reiter: [{ id: 'overview', label: 'Overview' }],
        zaehler: null,
      },
    ],
  },
  {
    label: 'Kunden',
    eintraege: [
      {
        id: 'klienten',
        label: 'Klienten',
        icon: 'user',
        // `[cmd]` **`athletes` und `onboard` gehoeren zusammen** — die
        // Liste und der Weg, wie einer dazukommt.
        reiter: [
          { id: 'athletes', label: 'Athletes' },
          { id: 'onboard', label: 'Onboarding' },
        ],
        zaehler: 'klienten',
      },
      {
        id: 'nachrichten',
        label: 'Nachrichten',
        icon: 'message',
        reiter: [{ id: 'messages', label: 'Messages' }],
        zaehler: 'ungelesen',
        stufe: 'warn',
      },
      {
        id: 'checkins',
        label: 'Check-ins',
        icon: 'check',
        reiter: [{ id: 'workflows', label: 'Check-ins' }],
        zaehler: 'checkins',
        stufe: 'warn',
      },
      {
        id: 'alerts',
        label: 'Alerts',
        icon: 'bell',
        // `[cmd]` **`alerts`, `patterns` und `intervene` sind EIN
        // Vorgang:** ein Alarm entsteht, man sieht das Muster, man
        // greift ein. **Die Vorlage fuehrt sie als drei Reiter**, das
        // Altrepo als einen Bereich.
        reiter: [
          { id: 'alerts', label: 'Smart alerts' },
          { id: 'patterns', label: 'Patterns' },
          { id: 'intervene', label: 'Interventions' },
        ],
        zaehler: 'alerts',
        stufe: 'critical',
      },
    ],
  },
  {
    label: 'Programme',
    eintraege: [
      {
        id: 'plaene',
        label: 'Plaene',
        icon: 'file',
        reiter: [
          { id: 'plans', label: 'Plans' },
          { id: 'programs', label: 'Programs' },
        ],
        zaehler: null,
      },
    ],
  },
  {
    label: 'Regeln & Rechte',
    eintraege: [
      {
        id: 'regeln',
        label: 'Regeln',
        icon: 'bolt',
        reiter: [{ id: 'rules', label: 'Rules' }],
        zaehler: null,
      },
      {
        id: 'autonomie',
        label: 'Autonomie',
        icon: 'shield',
        reiter: [{ id: 'autonomy', label: 'Autonomy' }],
        zaehler: 'autonomie',
      },
      {
        id: 'freigaben',
        label: 'Freigaben',
        icon: 'shield',
        reiter: [{ id: 'consent', label: 'Consent' }],
        zaehler: 'rechte',
      },
    ],
  },
  {
    label: null,
    eintraege: [
      {
        id: 'auswertung',
        label: 'Auswertung',
        icon: 'trend_up',
        reiter: [
          { id: 'analytics', label: 'Analytics' },
          { id: 'revenue', label: 'Revenue' },
        ],
        zaehler: null,
      },
      {
        id: 'einstellungen',
        label: 'Team & Audit',
        icon: 'settings',
        reiter: [{ id: 'team', label: 'Team & Audit' }],
        zaehler: null,
      },
    ],
  },
]

/** Alle Eintraege, flach — fuer Zaehlungen und Waechter. */
export function alleEintraege(): PortalNavEintrag[] {
  return PORTAL_NAV.flatMap(g => g.eintraege)
}

/**
 * Welcher Bereich einen Reiter fuehrt.
 *
 * `[read]` **Damit bleibt `?tab=` gueltig** — ein Link auf
 * `?tab=patterns` findet weiter seinen Platz, jetzt im Bereich
 * `alerts`. **Kein Lesezeichen wird ungueltig.**
 */
export function bereichFuerReiter(tab: string): PortalNavEintrag | null {
  for (const g of PORTAL_NAV) {
    for (const e of g.eintraege) {
      if (e.reiter.some(r => r.id === tab)) return e
    }
  }
  return null
}
