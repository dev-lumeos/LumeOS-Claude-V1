// Die Struktur des Coach-Portals — nach dem Draft, G-405.
//
// **Tom, 2026-09-10:** *„wie waers wenn du das nun als mockup
// erzeugen laesst und nicht irgend eine abhandlung davon. ich habe
// den direkten vergleich."*
//
// ══ DIE QUELLE ══════════════════════════════════════════════════════
//
// `[cmd]` **`coach-portal-draft/module-coach-portal-shell.jsx`**,
// 296 Zeilen, im Repo seit 2026-09-10. **Abgelesen, nicht erfunden:**
//
//     CP_NAV       Zeile   4-24    4 Gruppen, 11 Bereiche, 4 Badges
//     CP_META      Zeile  27-39    11 Bereiche, 30 Pills, 17 Aktionen
//     CP_SECTIONS  Zeile  42-96    11 Bereiche, 35 Unterpunkte
//
// `[cmd]` **Nachgezaehlt am 2026-09-10** — die Zahlen des Auftrags
// stimmen alle.
//
// ══ DIE REGEL AUS ZEILE 2 ═══════════════════════════════════════════
//
// > *„Sidebar carries parents only; children live in the content
// > sub-nav."*
//
// `[read]` **Die Seitenleiste fuehrt elf Bereiche, nicht 35.** **Die
// Unterpunkte stehen als Reiterleiste IM INHALT** — genau die
// Trennung, die G-401 fuer das alte Portal gebaut hat, jetzt mit den
// Namen des Drafts.

import type { IconName } from '@lumeos/ui'

/** Ein Unterpunkt eines Bereichs — die Reiterleiste im Inhalt. */
export type DraftKind = {
  id: string
  label: string
  /**
   * Woher der Inhalt kommt.
   *
   * `gebaut`    — ein Reiter, den das Portal schon hat
   * `attrappe`  — die Form steht, die Daten fehlen
   */
  art: 'gebaut' | 'attrappe'
  /** Bei `attrappe`: WAS fehlt, mit Tabellennamen (G-398). */
  fehlt?: string
}

export type DraftBereich = {
  id: string
  label: string
  icon: IconName
  /** Aus CP_NAV — nur vier Bereiche tragen eine. */
  badge?: string
  badgeVariant?: 'warn'
  /** Aus CP_SECTIONS. */
  titel: string
  sub: string
  /** Aus CP_META: [Variante, Text]. */
  pills: Array<[string, string]>
  /** Aus CP_META: [Symbol, Text]. */
  aktionen: Array<[IconName, string]>
  /** Aus CP_SECTIONS — `null`, wo der Draft keine fuehrt. */
  kinder: DraftKind[] | null
  /**
   * Nur fuer Bereiche OHNE Kinder.
   *
   * `[cmd]` **Vier tragen keine:** `overview`, `calendar`, `inbox`,
   * `team` (gemessen ueber `alleBereiche()`).
   *
   * `[read]` **Bei den anderen sieben traegt das KIND die Marke** —
   * dort ist immer ein Unterpunkt gewaehlt, und der sagt, ob er
   * gebaut ist. `[read]` **Ohne Kinder gaebe es niemanden, der es
   * sagt** — der Schirm bliebe leer ohne Grund, und Leerstand ohne
   * Grund sieht aus wie ein Fehler (E-72).
   */
  art?: 'gebaut' | 'attrappe'
  /** Die fehlende Tabelle, wenn `art === 'attrappe'`. */
  fehlt?: string
}

export type DraftGruppe = { grp: string, bereiche: DraftBereich[] }

// `[read]` **Wo eine fehlende Tabelle mehrfach vorkommt, steht
// derselbe Satz** — dann laesst sie sich zaehlen.
const KEIN_PLAN = 'keine Tabelle fuer Plaene oder Programme'
const KEIN_ASSIST = 'keine Tabelle fuer den Assistenten — weder Entwuerfe '
  + 'noch Gedaechtnis noch Kosten'
const KEINE_REGEL = 'keine Tabelle fuer Coach-Regeln'
const KEINE_BIB = 'keine Tabelle fuer eigene Uebungen oder Rezepte'

export const DRAFT_NAV: DraftGruppe[] = [
  {
    grp: 'Coaching',
    bereiche: [
      {
        id: 'overview',
        label: 'Dashboard',
        icon: 'dashboard',
        titel: 'Dashboard',
        sub: "Roster health, attention scores and today's activity",
        pills: [['acc', '14 athletes'], ['', '11 on track'], ['warn', '5 in queue']],
        aktionen: [['message', 'Broadcast'], ['plus', 'New plan']],
        kinder: null,
        // `[read]` **Gebaut** — die Uebersicht liest denselben Stand
        // wie die bestehende Fassung (`TabUebersicht`).
        art: 'gebaut',
      },
      {
        id: 'athletes',
        label: 'Athletes',
        icon: 'user',
        badge: '14',
        titel: 'Athletes',
        sub: '14 active clients',
        pills: [['acc', '14 active'], ['', '6 full access'], ['warn', '2 need decision']],
        aktionen: [['plus', 'Invite client'], ['download', 'Export']],
        kinder: [
          { id: 'athletes', label: 'Roster', art: 'gebaut' },
          {
            id: 'record',
            label: 'Full record',
            art: 'gebaut',
          },
          {
            id: 'notes',
            label: 'Client notes',
            art: 'attrappe',
            fehlt: 'keine Tabelle fuer freie Notizen je Klient — '
              + 'coach.checkins.coach_notes gibt es je Check-in',
          },
          { id: 'onboard', label: 'Onboarding', art: 'gebaut' },
          { id: 'autonomy', label: 'Autonomy levels', art: 'gebaut' },
          { id: 'autohist', label: 'Autonomy history', art: 'gebaut' },
          {
            id: 'adherence',
            label: 'Adherence',
            art: 'attrappe',
            fehlt: 'keine Adherence je Klient — services/adherence.ts rechnete '
              + 'sie im Vorgaenger aus Plan gegen Ist; es gibt weder Plan '
              + 'noch Rechnung',
          },
          { id: 'consent', label: 'Consent & access', art: 'gebaut' },
        ],
      },
      {
        id: 'checkins',
        label: 'Check-ins',
        icon: 'message',
        badge: '7',
        titel: 'Check-ins',
        sub: 'Messages and guided review flows',
        pills: [['acc', '7 received'], ['warn', '2 overdue'], ['', '3.2 h avg']],
        aktionen: [['edit', 'Templates'], ['message', 'Reply next']],
        kinder: [
          { id: 'messages', label: 'Messages', art: 'gebaut' },
          { id: 'workflows', label: 'Review workflows', art: 'gebaut' },
          {
            id: 'chkedit',
            label: 'Check-in templates',
            art: 'attrappe',
            fehlt: 'coach.checkin_templates steht und wird gelesen (2 Zeilen) — '
              + 'es fehlt der Schreibweg, um eine Vorlage anzulegen',
          },
        ],
      },
      {
        id: 'assist',
        label: 'Assistant',
        icon: 'brain',
        titel: 'Assistant',
        sub: 'Triage, drafting, memory and everything it does on your behalf',
        pills: [['acc', 'clone live · 6'], ['', '18 drafts · 7d'], ['pos', '4.8 h saved']],
        aktionen: [['settings', 'Per-client'], ['check', 'Approve queue']],
        // `[read]` **Dreizehn Unterpunkte, keiner mit Daten** — der
        // Assistent ist im Haus nicht gebaut. **Das ist der groesste
        // Einzelbefund dieses Auftrags.**
        kinder: [
          { id: 'assist', label: 'Triage & chat', art: 'attrappe', fehlt: KEIN_ASSIST },
          { id: 'as-clone', label: 'Your clone', art: 'attrappe', fehlt: KEIN_ASSIST },
          { id: 'as-client', label: 'Per-client setup', art: 'attrappe', fehlt: KEIN_ASSIST },
          { id: 'as-ident', label: 'Identity', art: 'attrappe', fehlt: KEIN_ASSIST },
          { id: 'as-dec', label: 'Decisions', art: 'attrappe', fehlt: KEIN_ASSIST },
          { id: 'as-brief', label: 'Briefings', art: 'attrappe', fehlt: KEIN_ASSIST },
          { id: 'as-voice', label: 'Voice notes', art: 'attrappe', fehlt: KEIN_ASSIST },
          { id: 'as-method', label: 'Method memory', art: 'attrappe', fehlt: KEIN_ASSIST },
          { id: 'as-butler', label: 'Portal actions', art: 'attrappe', fehlt: KEIN_ASSIST },
          { id: 'as-watch', label: 'Roster watcher', art: 'attrappe', fehlt: KEIN_ASSIST },
          { id: 'as-tone', label: 'Tone calibration', art: 'attrappe', fehlt: KEIN_ASSIST },
          { id: 'as-guard', label: 'Guardrails', art: 'attrappe', fehlt: KEIN_ASSIST },
          { id: 'as-cost', label: 'Cost & usage', art: 'attrappe', fehlt: KEIN_ASSIST },
        ],
      },
      {
        id: 'calendar',
        label: 'Calendar',
        icon: 'calendar',
        titel: 'Calendar',
        sub: 'Check-ins, sessions and deadlines across the roster',
        pills: [['acc', '8 events'], ['warn', 'Thu overloaded']],
        aktionen: [['plus', 'New event']],
        kinder: null,
        // `[cmd]` **Keine Tabelle mit Terminen** — gemessen ueber
        // `information_schema`, 15 Tabellen im Schema coach.
        art: 'attrappe',
        fehlt: 'keine Tabelle fuer Termine oder einen Kalender',
      },
    ],
  },
  {
    grp: 'Delivery',
    bereiche: [
      {
        id: 'plans',
        label: 'Plans',
        icon: 'file',
        titel: 'Plans',
        sub: 'Reusable plans and scheduled programs',
        pills: [['acc', '6 templates'], ['', '4 live'], ['warn', '2 expiring']],
        aktionen: [['plus', 'New plan'], ['file', 'Builder']],
        kinder: [
          { id: 'plans', label: 'Plan library', art: 'attrappe', fehlt: KEIN_PLAN },
          { id: 'programs', label: 'Programs · auto-delivery', art: 'attrappe', fehlt: KEIN_PLAN },
          { id: 'builder', label: 'Program builder', art: 'attrappe', fehlt: KEIN_PLAN },
        ],
      },
      {
        id: 'library',
        label: 'Library',
        icon: 'layers',
        titel: 'Library',
        sub: 'Your own exercises and meals, assignable to clients',
        pills: [['acc', '6 exercises'], ['', '6 recipes'], ['warn', '2 no video']],
        aktionen: [['plus', 'New exercise'], ['camera', 'Add video']],
        kinder: [
          { id: 'lib-ex', label: 'Exercises', art: 'attrappe', fehlt: KEINE_BIB },
          { id: 'lib-meal', label: 'Meals & recipes', art: 'attrappe', fehlt: KEINE_BIB },
        ],
      },
      {
        id: 'alerts',
        label: 'Alerts',
        icon: 'alert',
        badge: '7',
        badgeVariant: 'warn',
        titel: 'Alerts',
        sub: 'Five severities with confidence scoring',
        pills: [['neg', '1 critical'], ['warn', '2 high'], ['', '4 lower']],
        aktionen: [['settings', 'Rule builder']],
        kinder: [
          { id: 'alerts', label: 'Smart alerts', art: 'gebaut' },
          { id: 'rules', label: 'Rule builder', art: 'attrappe', fehlt: KEINE_REGEL },
        ],
      },
    ],
  },
  {
    grp: 'Insight',
    bereiche: [
      {
        id: 'analytics',
        label: 'Analytics',
        icon: 'trend_up',
        titel: 'Analytics',
        sub: 'Performance, patterns, interventions and revenue',
        pills: [['pos', 'retention 92 %'], ['', '4.8 ★'], ['', '87 % goals']],
        aktionen: [['download', 'Export']],
        kinder: [
          {
            id: 'analytics',
            label: 'Performance',
            art: 'attrappe',
            fehlt: 'keine Tabelle fuer Kennzahlen je Coach — Retention und '
              + 'Antwortzeit waeren Personennoten (T7)',
          },
          {
            id: 'patterns',
            label: 'Patterns & forecast',
            art: 'attrappe',
            fehlt: 'keine Tabelle fuer Vorhersagen — coach.checkins traegt '
              + 'Ist-Werte, kein Modell',
          },
          {
            id: 'intervene',
            label: 'Interventions',
            art: 'gebaut',
          },
          {
            id: 'revenue',
            label: 'Revenue',
            art: 'attrappe',
            fehlt: 'keine Tabelle fuer Umsatz — Geld gehoert zum Marketplace '
              + '(F-06 T8)',
          },
        ],
      },
    ],
  },
  {
    grp: 'Practice',
    bereiche: [
      {
        id: 'inbox',
        label: 'Notifications',
        icon: 'bell',
        badge: '12',
        titel: 'Notifications',
        sub: 'Everything that happened while you were away',
        pills: [['acc', '5 unread'], ['', '42 this week']],
        aktionen: [['check', 'Mark all read']],
        kinder: null,
        // `[read]` **`coach.messages` traegt Nachrichten, keine
        // Benachrichtigungen** — das sind zwei Sachen. Die 12 im
        // Badge sind gemessen ungelesene Nachrichten; die
        // Benachrichtigungszentrale des Drafts hat keine Tabelle.
        art: 'attrappe',
        fehlt: 'keine Tabelle fuer Benachrichtigungen — coach.messages '
          + 'fuehrt Nachrichten je Beziehung, nicht Ereignisse',
      },
      {
        id: 'team',
        label: 'Team & audit',
        icon: 'shield',
        titel: 'Team & audit',
        sub: 'Roles, permissions and the full action trail',
        pills: [['acc', '5 members'], ['', '1,420 audit entries']],
        aktionen: [['plus', 'Invite member']],
        kinder: null,
        // `[cmd]` **Kein `coach.team`, kein `coach.audit_log`** —
        // gemessen ueber `information_schema`: 15 Tabellen im
        // Schema, keine davon fuehrt Mitarbeiter oder ein Protokoll
        // ueber sie.
        art: 'attrappe',
        fehlt: 'keine Tabelle fuer das Team und kein Pruefprotokoll — '
          + 'coach fuehrt 15 Tabellen, keine davon nennt Mitarbeiter',
      },
    ],
  },
]

/** Alle Bereiche, flach. */
export function alleBereiche(): DraftBereich[] {
  return DRAFT_NAV.flatMap(g => g.bereiche)
}

/** Alle Unterpunkte, flach — fuer Zaehlungen und Waechter. */
export function alleKinder(): Array<DraftKind & { bereich: string }> {
  return alleBereiche().flatMap(b =>
    (b.kinder ?? []).map(k => ({ ...k, bereich: b.id })))
}

/** Der Bereich zu einer Id. */
export function bereichVon(id: string): DraftBereich | null {
  return alleBereiche().find(b => b.id === id) ?? null
}
