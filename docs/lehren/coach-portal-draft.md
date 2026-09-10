# Das Coach-Portal-Mockup: LumeOS-Draft

**2026-09-08.** Tom: *,,anderer ansatz betreffs mockup coach
portal. auf lumeos hats einen link zu coach portal, der das mockup
vom coachportal oeffnet ? vielleicht schnallst du dann um was es
geht."*

`[read]` **Jetzt ja.**

---

## Es ist eine EIGENE PLATTFORM, kein Modul

`[cmd]` **`shell.jsx:27`:**

    { id: "portal", label: "Coach Portal", icon: "coach",
      accent: "var(--acc-coach)",
      external: "coach.lumeos.app" }

`[read]` **Ein Eintrag unter WORKSPACES mit `external`** ? **er
verlaesst LumeOS.**

`[cmd]` **Und `module-coach-portal-shell.jsx:98` heisst
`CoachPortalPlatform`, nicht `Modul`:**

    gridTemplateColumns: rightOpen ? "222px 1fr 306px"
                                   : "222px 1fr"
    height: 100vh, width: 100vw
    "--acc": "var(--acc-coach)"

`[read]` **Ganzer Bildschirm, eigene Schale, eigener Akzent.**

`[cmd]` **Mit `onExit`** ? **es gibt einen Rueckweg nach LumeOS.**

---

## SECHZEHN Coach-Dateien, nicht acht

`[cmd]` **`docs/spezifikation/.../theme-v1/` hat acht.**
`[cmd]` **Der Draft hat sechzehn:**

    module-coach.jsx                    57,1 KB
    module-coach-extras.jsx             51,0
    module-coach-gaps.jsx               35,3
    module-coach-athlete.jsx            32,3
    module-coach-portal-detail.jsx      30,8   <- NEU
    module-coach-clone.jsx              30,4   <- NEU
    module-coach-assistant-layers.jsx   30,1   <- NEU
    module-coach-portal-tools.jsx       29,4   <- NEU
    module-coach-portal-v2.jsx          25,1
    module-coach-client-record.jsx      23,6   <- NEU
    module-coach-ai-assistant.jsx       22,4   <- NEU
    module-coach-portal-workflows.jsx   21,1
    module-coach-portal-shell.jsx       18,9   <- DIE SCHALE
    module-coach-portal-context.jsx     14,3   <- NEU
    module-coach-programs.jsx           12,7
    module-coach-meta.jsx               12,5

`[read]` **Acht Dateien, die der Orchestrator NIE gesehen hat** ?
**darunter die Schale und die Kontextspalte.**

---

## Die Navigation: vier Gruppen, elf Bereiche

`[cmd]` **`CP_NAV`, Zeile 4-24:**

    Coaching    Dashboard
                Athletes      Badge 14
                Check-ins     Badge 7
                Assistant
                Calendar

    Delivery    Plans
                Library
                Alerts        Badge 7, warn

    Insight     Analytics

    Practice    Notifications Badge 12
                Team & audit

`[read]` **Und der Kommentar Zeile 2 sagt die Regel:**

> *,,Sidebar carries parents only; children live in the content
> sub-nav."*

---

## Je Bereich eine Unternavigation

`[cmd]` **`CP_SECTIONS`, Zeile 42-96** ? **je Bereich Titel,
Untertitel und Kinder:**

    Athletes (8)      Roster, Full record, Client notes,
                      Onboarding, Autonomy levels,
                      Autonomy history, Adherence,
                      Consent & access

    Assistant (13)    Triage & chat, Your clone,
                      Per-client setup, Identity,
                      Decisions, Briefings, Voice notes,
                      Method memory, Portal actions,
                      Roster watcher, Tone calibration,
                      Guardrails, Cost & usage

    Analytics (4)     Performance, Patterns & forecast,
                      Interventions, Revenue

    Plans (3)         Plan library,
                      Programs - auto-delivery,
                      Program builder

    Check-ins (3)     Messages, Review workflows,
                      Check-in templates

    Library (2)       Exercises, Meals & recipes
    Alerts (2)        Smart alerts, Rule builder

    ohne Kinder       Dashboard, Calendar,
                      Notifications, Team & audit

`[cmd]` **Elf Bereiche, 35 Unterpunkte.**

---

## Je Bereich ein Modulkopf

`[cmd]` **`CP_META`, Zeile 27-39** ? **Symbol, Pills, Aktionen:**

    overview   14 athletes / 11 on track / 5 in queue
               [Broadcast] [New plan]
    athletes   14 active / 6 full access / 2 need decision
               [Invite client] [Export]
    checkins   7 received / 2 overdue / 3.2 h avg
               [Templates] [Reply next]
    assist     clone live 6 / 18 drafts 7d / 4.8 h saved
               [Per-client] [Approve queue]
    alerts     1 critical / 2 high / 4 lower
               [Rule builder]
    analytics  retention 92% / 4.8 Stern / 87% goals
               [Export]
    team       5 members / 1.420 audit entries
               [Invite member]

`[read]` **Die Pills tragen ZAHLEN, nicht Zustaende** ? **und je
Bereich andere.**

---

## Und eine Kontextspalte, die mitwandert

`[cmd]` **Zeile 291:**

    {rightOpen && window.PortalContextPanel &&
      <window.PortalContextPanel section={section}
                                 onNav={goSection} />}

`[read]` **Sie kennt den Bereich UND kann navigieren** ? **306 px,
abschaltbar.**

`[cmd]` **`module-coach-portal-context.jsx`, 14,3 KB.**

---

## Was das fuer LumeOS heisst

`[cmd]` **`apps/coach` hat heute: eine Route, sechzehn Reiter in
einer Zeile.**

`[cmd]` **Der Draft hat: vier Gruppen, elf Bereiche, 35
Unterpunkte, je Bereich einen eigenen Kopf, eine mitwandernde
Kontextspalte.**

`[read]` **G-401 hat fuenf Gruppen und elf Eintraege gebaut** ?
**nah dran, aber aus dem Altrepo abgeleitet statt aus dem
Draft.**

`[read]` **Und die 35 Unterpunkte fehlen ganz.**

### Der groesste Einzelposten: Assistant

`[cmd]` **13 Unterpunkte, vier Dateien
(`ai-assistant`, `assistant-layers`, `clone`, `portal-tools`),
zusammen 112 KB.**

`[read]` **Das ist kein Reiter** ? **es ist ein eigenes
Teilsystem.**

`[read]` **Und es hat in `docs/specs/HumanCoach/` KEINE
Entsprechung** ? **die Spec kennt zwoelf Tabs, keinen
Assistenten.**
