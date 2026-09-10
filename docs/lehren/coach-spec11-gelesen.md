# SPEC_11 - die Coach-Portal-Spec, gelesen

**2026-09-08.** Tom: *,,ich suche seit tagen coach sachen und alles
liegt da und du liest es nicht. sogar der vergleich coachansicht
useransicht."*

`[cmd]` **`docs/specs/HumanCoach/SPEC_11_UI_DESIGN.md`, 327
Zeilen, Stand Mai 2026.**

`[read]` **Der Orchestrator hat sie in keinem Auftrag genannt.**

---

## Der Kern: ZWEI Sichten, ein Role-Toggle

`[cmd]` **Zeile 14:** *,,Das Coach Portal hat ZWEI Sichten,
umschaltbar ueber einen Role-Toggle im Modul-Header."*

`[cmd]` **Zeile 38:** *,,Sichtbar nur wenn User sowohl Athlete als
auch Coach ist."*

    <RoleToggle>
      <RoleOption value="athlete" label="My coaches" />
      <RoleOption value="coach"   label="Coach portal" />
    </RoleToggle>

`[read]` **Das ist der Vergleich, den Tom meint** - **beide
Sichten in DERSELBEN App auf 3220, nicht getrennt auf zwei
Ports.**

`[cmd]` **Zeile 20:** *,,Gleiche Shell-Struktur wie `apps/web`
(Sidebar / Topbar / Context Panel). Imports aus `packages/ui`."*

`[read]` **Genau das, was Tom heute verlangt hat** - **es stand
seit Mai in der Spec.**

`[cmd]` **Accent: `--acc-coach`, slate-cyan,
`oklch(0.78 0.08 200)`.**

---

## Athlete-Sicht: 6 Tabs

    My Coaches     CoachCards je Coach-Typ (Training,
                   Nutrition, Supplement, Medical)
                   mit Name, Status, letzte Notiz, Gebuehr,
                   Bewertung, eigenem Akzent
                   + CoachingBalance (Summe monatlich)
                   + TrustCircleSidebar
                   + ActivitySparkline 30 Tage

    Coaches        erweiterte Cards: Cadence, Plan, Fee,
                   Rating, Shared-Modules-Pills

    Permissions    PermissionMatrix
                   Zeilen: Nutrition, Training, Recovery,
                           Supplements, Goals, Medical
                   Spalten: Training Coach, Nutrition Coach,
                            Medical Coach, Buddy
                   Werte: full | shared | summary | off

    Messages       Threads + Chat-Modal je Coach
    Notes          alle Coach-Notizen, nach Modul filterbar
    Invites        Pending + History, Resend/Cancel
                   InviteCoachModal mit QR-Code,
                   E-Mail, persoenlicher Notiz

---

## Coach-Portal-Sicht: 12 Tabs

    Overview       KpiGrid: Athletes, Avg Compliance,
                   Open Alerts, MRR
                   + AthletesNeedingAttention
                   + TodaySessions + RecentAchievements

    Athletes       Tabelle: Name, Plan, Compliance, Alerts,
                   Last Session, Autonomy Level
                   SMART PRIORITIZATION:
                     alerts x 30 + low_compliance_penalty
                     + days_since_last_session
                   Quick-Actions: Message, Call,
                     Adjust Plan, View Details
                   Klick -> AthleteDetailModal, 4 Tabs

    Analytics      Retention, Satisfaction, GoalCompletion,
                   AutonomyProgression
                   CoachEfficiency: Response Time,
                     Alert Resolution, Interventions/Monat
                   BusinessImpact: Avg LTV, Referral Rate

    Smart Alerts   FUENF Stufen: CRITICAL | HIGH | MEDIUM
                                 | LOW | INFO
                   je Alert: confidence, fpRisk, prediction
                   Smart Batching nach Athlet
                   Detail-Modal: Similar Cases,
                     "Was worked"-Log

    Rules          Vier Untersichten: Active | Marketplace
                                    | Visual Builder | History
                   VisualRuleBuilder:
                     BuildingBlocksPanel (Thresholds,
                       Trends, Time, Events)
                     RuleCanvas: WhenBlock, OnlyIfBlock,
                       ThenBlock
                     RuleSettingsPanel: segmentation,
                       schedule, escalation
                   Test-Replay: would fire N?, FP-Rate

    Autonomy       FUENF Stufen mit Cadence und Schwelle:
                     Novice       taeglich   Coach decides
                     Beginner     3x/Woche   Coach suggests
                     Intermediate 2x/Woche   Shared
                     Advanced     woechentl. Athlete proposes
                     Expert       monatlich  Athlete decides
                   Athletes-by-Level: Badge, Trend,
                     Time-at-Level, Promote/Demote

    Patterns       AdherenceForecast (likely/best/worst,
                     confidence)
                   RiskIndicators, DayOfWeekPattern,
                   EventImpactTable

    Interventions  StrategyCards mit Wirksamkeit:
                     educational 78, motivational 85,
                     practical 91
                   ActiveInterventionsTable mit
                     Outcome-Verfolgung

    Consent        ConsentTable: Athleten x Module,
                   mit Verlauf

    Plans          Bibliothek: Assigned-Count, Sold-Count,
                   Rating. Neu: Template / Clone /
                   Marketplace-Import

    Messages       eingehend mit Unread-Markern
    Revenue        12-Monats-MRR-Chart, Split nach
                   Retainers / Plan-Sales / One-offs
    Team & Audit   Permission-Matrix 3 Rollen x 13
                   Capabilities, Audit-Log mit Filter,
                   Suche, Export

---

## Sechs Modale

    AthleteDetailModal      Klick Athletenzeile
    AlertDetailModal        Klick Alert-Card
    CoachSettingsModal      "Settings" in Alerts
    RuleEditModal           Klick aktive Regel
    InviteTeamMemberModal   "Invite member"
    TeamMemberDetailModal   Klick Team-Mitglied

---

## Die elf Abnahmebedingungen der Spec

    [ ] Role-Toggle wechselt korrekt
    [ ] Athleten-Tabelle: Smart Prioritization sortiert
    [ ] 5-Level Alerts: Severity farbcodiert
    [ ] Visual Rule Builder: Canvas rendert Bloecke
    [ ] Autonomy: Level-Badges
    [ ] Pattern-Forecast: Confidence-Band
    [ ] Consent-Matrix: alle Athleten x Module
    [ ] AthleteDetailModal: 4 Tabs
    [ ] Team-Matrix: 3 Rollen x 13 Capabilities
    [ ] Audit-Log filterbar
    [ ] Cross-domain Auth: coach.lumeos.app mit
        app.lumeos.app geteilt

---

## Was der Orchestrator falsch gemacht hat

`[read]` **G-398 hat sechzehn Reiter aus `module-coach.jsx`
gezaehlt** - **die Spec nennt ZWOELF plus SECHS in der
Athletensicht.**

`[read]` **G-401 hat die Seitenleiste aus dem Altrepo abgeleitet**
- **Zeile 23-25 nennt beide Gruppen ausdruecklich.**

`[read]` **G-404 fragt, ob Settings in die Seitenleiste gehoert**
- **Zeile 305: `CoachSettingsModal`, Ausloeser ist der
Settings-Knopf IN Alerts.**

`[read]` **Und C-450 hat die Rollenfrage als offen behandelt** -
**Zeile 38 sagt: der Toggle erscheint, wenn der Nutzer die
`coach`-Rolle in der DB hat.**

`[cmd]` **Vier Auftraege, die eine Antwort in der Spec hatten.**
