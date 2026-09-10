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

## Warum das der Anhaltspunkt ist

`[read]` **`apps/coach` (Maerz) zeigt, WIE es aussah.**

`[read]` **`worktrees/coach/navigation` (Mai) zeigt, WOHIN es
gehen sollte** ? **wer die Zerlegung gemacht hat, hat sie fuer
einen Neubau gemacht.**

`[cmd]` **`OLD PATH` je Datei sagt, woher jedes Stueck kam** ?
**der Rueckweg ist dokumentiert.**

`[read]` **Und `STATUS` sagt, was fertig war** ? **120 Complete.**

---

## Was noch ungemessen ist

`[cmd]` **`worktrees/` hat elf Zweige:**

    admin, auth, buddy, coach, goals, marketplace,
    medical, nutrition, recovery, supplements, training

`[cmd]` **Zusammen 2.611 Dateien** ? **nur `coach` ist gemessen.**

`[read]` **Wenn dieselbe Zerlegung fuer alle Module existiert, ist
das die Struktur des ganzen Neubaus.**

`[cmd]` **Und `LUMEOS_ANALYSIS/` mit sieben Dateien** ?
**ungelesen.**
