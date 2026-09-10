# Wo der letzte Stand des Coach-Portals liegt

**Gemessen 2026-09-08.** Tom: *,,ich weiss bloss nicht mehr, wo der
letzte stand coach portal liegt mit allen funktionen drin, dass wir
wenigstens einen anhaltspunkt haben wohin es geht."*

---

## Die Kandidaten, verglichen

    Ort                          Dateien   KB   juengste Aenderung
    ------------------------------------------------------------
    macmini apps/coach                37  257   2026-03-26 13:22
    altrepo apps/coach                37  257   2026-03-26 13:22
    macmini src/modules/human-coach   30  454   2026-03-21 23:02
    altrepo src/modules/human-coach   30  454   2026-03-21 23:02
    macmini src/modules/coach         52  403   2026-03-21 23:02
    LumeOS apps/coach heute           38  215   2026-09-10

`[cmd]` **`LumeOSmacmini` und `referenz/lumeos-2026` sind
DASSELBE** ? **gleiche Dateizahl, gleiche Groesse, gleiche
Zeitstempel.**

`[read]` **Es gibt also nur EINEN alten Stand, nicht zwei.**

---

## Der neuere Stand: `worktrees/coach/navigation/`

`[cmd]` **`D:\GitHub\LumeOSmacmini\worktrees\coach\navigation\`**

`[cmd]` **279 Dateien, 321 KB, juengste Aenderung 2026-05-03
18:11** ? **sechs Wochen NEUER als `apps/coach`.**

### Was es ist

`[read]` **Keine Anwendung** ? **eine ZERLEGUNG.**

`[cmd]` **Jede Datei traegt einen Kopf:**

    /**
     * MODULE: coach
     * NAV: dashboard
     * SUBNAV: overview
     * NAME: getCoachMetrics
     * TYPE: Pure Function
     * SALVAGE: ...
     * ISOLATED: ...
     * OLD PATH: src/api/human-coach/services/dashboard.ts:610
     * STATUS: WIP
     */

`[read]` **Jemand hat die 2,8 MB Coach-Code auseinandergenommen und
je Funktion einer Navigationsstelle zugeordnet** ? **mit
Herkunftspfad und Zeilennummer.**

### Die Struktur

    dashboard/overview          116 Dateien
    monitoring/alerts            48
    programs/training-plans      44
    monitoring/client-ai         40
    clients/client-list          16
    clients/messages             10
    programs/meal-plans           5

`[cmd]` **Fuenf Gruppen, sieben Unterbereiche.**

`[read]` **Das ist die Navigation, die Tom sucht** ? **nicht
sechzehn Reiter, sondern Gruppen mit Unterpunkten.**

### Was drinsteht

    Route Handler   121
    Pure Function    71
    Utility          52
    React Component  27
    Type              8

    STATUS: Complete  120
            WIP        83
            Partial    76

`[read]` **120 von 279 sind als *Complete* markiert.**

`[read]` **Und die Hooks sind alle da** ? `useCoachStats`,
`useAlerts`, `useAllThreads`, `useClients`, `useClientDetail`,
`useClientPermissions`, `useCheckins`, `usePrograms`,
`useProgramDetail`, `useMessages`, `useMessageThreads`,
`useSendMessage`, `useAssignProgram`, `useCreateProgram`,
`useUpdateProgram`, `useDeleteProgram`, `useCreateCheckin`,
`useReviewCheckin`, `useDismissAlert`, `useEnhancedAlerts`,
`useUpdatePermissions`, `useUpdateClientNotes`,
`useUpdateCoachProfile`, `useAddClient`, `useClientTrends`,
`useAnalyticsOverview`.

`[cmd]` **26 Hooks** ? **das ist die Schnittstelle des Portals.**

---

## BERICHTIGT 2026-09-08 - keine Vorlage

Tom: *,,das sind alte api extractionen."*

`[read]` **Die 279 Dateien sind ZWISCHENMATERIAL** - **jemand hat
alte Endpunkte auseinandergenommen, nicht einen Neubau geplant.**

`[read]` **`STATUS: WIP` und `SALVAGE:` sind Arbeitsmarken einer
Extraktion, keine Zielbeschreibung.**

`[read]` **Nicht als Vorlage lesen.**

### Was daran trotzdem brauchbar bleibt

`[cmd]` **`OLD PATH` je Datei** - **wenn jemand wissen will, wo
eine Funktion im alten Code stand, steht es dort mit
Zeilennummer.**

`[cmd]` **Die 26 Hooks** (`useCoachStats`, `useClients`,
`useCheckins`, `usePrograms`, ...) - **sie zeigen, welche
Datenwege das Portal brauchte.**

`[read]` **Beides ist Nachschlagewerk, nicht Bauplan.**

## Der Stand, der gilt

`[cmd]` **`apps/coach` (26.03.) plus `src/modules/human-coach`
(21.03.)** - **das ist der letzte lauffaehige Stand.**

    apps/coach                  37 Dateien, 257 KB
      20 Routen, die meisten als Huelle
      rules/ und automations/ tragen Code selbst
    src/modules/human-coach     30 Dateien, 454 KB
      ProgramBuilder 49 KB, ClientDetail 39 KB,
      CoachDashboard 27 KB, KnowledgeManager 26 KB
    src/modules/coach           52 Dateien, 403 KB

`[read]` **Zusammen 1.114 KB in 119 Dateien.**

`[read]` **Das ist der Anhaltspunkt** - **nicht zum Kopieren,
sondern um zu sehen, was ein Coach tun koennen musste.**

---

## Was noch ungemessen ist

`[cmd]` **`worktrees/` hat elf Zweige:**

    admin, auth, buddy, coach, goals, marketplace,
    medical, nutrition, recovery, supplements, training

`[cmd]` **Zusammen 2.611 Dateien** ? **nur `coach` ist gemessen.**

`[read]` **Vermutlich dieselben API-Extraktionen** - **nach Toms
Auskunft kein Neubauplan.**

`[read]` **Nur nachsehen, wenn jemand einen alten Endpunkt sucht.**

`[cmd]` **Und `LUMEOS_ANALYSIS/` mit sieben Dateien** ?
**ungelesen.**
