# `LumeOSmacmini/apps/coach` - die lauffaehige Coach-App

**Gemessen 2026-09-08.** Tom: *,,schau mal hier rein was vorhanden
ist."*

`[read]` **Dies ist ein ANDERES Verzeichnis als
`referenz/lumeos-2026/`** - `D:\GitHub\LumeOSmacmini`.

---

## Die App: 20 Routen, 61 KB

`[cmd]` **`app/(portal)/`:**

    rules/components/CoachRuleBuilder.tsx   30.411 B
    automations/page.tsx                    13.421
    rules/page.tsx                          11.236
    rules/hooks/useRules.ts                  2.795
    layout.tsx                                 596
    clients/[id]/page.tsx                      439
    autonomy/page.tsx                          387
    buddy/page.tsx                             380
    alerts/page.tsx                            377
    feedback/page.tsx                          322
    workouts/page.tsx                          270
    programs/page.tsx                          255
    analytics/page.tsx                         253
    page.tsx                                   253
    messages/page.tsx                          249
    settings/page.tsx                          249
    checkins/page.tsx                          246
    ai/page.tsx                                223
    knowledge/page.tsx                         190

`[cmd]` **Plus `app/(auth)/login/page.tsx` 4.195 B.**

## Die duennen Seiten sind HUELLEN

`[cmd]` **`clients/page.tsx`, 13 Zeilen:**

    const ClientList = dynamic(
      () => import('../../../../../src/modules/human-coach/components/ClientList'),
      { ssr: false })

    export default function ClientsPage() {
      const router = useRouter()
      return <ClientList onSelect={(id) => router.push(`/clients/${id}`)} />
    }

`[read]` **Die Substanz liegt in `src/modules/human-coach/`** -
**die App ist nur der Rahmen.**

`[read]` **Zwei Seiten sind Ausnahmen:** `rules/` **und**
`automations/` **tragen ihren Code selbst.**

## `src/modules/human-coach/` - 30 Dateien, 454 KB

    ProgramBuilder.tsx            49.640 B
    ClientDetail.tsx              39.160
    BuddyDashboard.tsx            34.802
    CoachDashboard.tsx            27.113
    KnowledgeManager.tsx          25.820
    CoachRoutineBuilder.tsx       23.675
    EnhancedCoachDashboard.tsx    22.850
    CoachAI.tsx                   22.274
    BuddyOverview.tsx             15.840
    EnhancedProtocol.tsx          15.469
    DecisionsPanel.tsx            14.967
    CheckinList.tsx               13.459
    CoachRuleBuilder.tsx          13.441
    AutomationManager.tsx         13.411
    ClientList.tsx                13.056
    CoachRulesList.tsx            12.504

`[read]` **Zwei `CoachRuleBuilder`** - **einer in der App (30 KB),
einer im Modul (13 KB).**

## Die Schale

    components/Sidebar.tsx      4.854 B
    components/MobileNav.tsx    2.018
    components/AuthCheck.tsx    1.476
    app/layout.tsx                528
    app/providers.tsx             729
    app/globals.css             2.837
    lib/api.ts                  3.318

`[read]` **Klein** - **die Navigation ist eine Datei, kein
Paket.**

`[cmd]` **Und `MobileNav.tsx`** - **eine mobile Fassung, die
LumeOS heute nicht hat.**

---

## Das ganze Repo

    worktrees   2.611 Dateien
    assets      7.012
    src           862
    apps          532
    docs          237
    research      193
    scripts       129
    packages       90
    supabase       90
    pipeline       60
    deploy         21
    imports        18

`[read]` **`worktrees/` mit 2.611 Dateien ist noch ungemessen** -
**vermutlich parallele Zweige.**

`[cmd]` **`LUMEOS_ANALYSIS/` mit 7 Dateien** - **ungelesen.**

---

## Was das fuer LumeOS heisst

`[read]` **Die App-Struktur ist die Vorlage:** **eine Route je
Bereich, `layout.tsx` mit Seitenleiste, Seiten als Huellen.**

`[read]` **LumeOS hat sechzehn Reiter in EINER Route** -
**`apps/coach/src/app/page.tsx` mit `?tab=`.**

`[cmd]` **Der Vorgaenger hatte zwanzig ROUTEN** -
`/clients`, `/clients/[id]`, `/rules`, `/automations`.

`[read]` **Das ist der Unterschied, den Tom meint, wenn er sagt
*,,gleiche strukturen wie lumeos"*** - **`apps/web` hat auch je
Modul eine Route.**
