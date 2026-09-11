---
nr: G-421
typ: feature
modul: goals
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: null
entscheidung: null
agent: claudecode
beauftragt: 2026-09-08
beruehrt:
  dateien:
    - apps/web/src/app/v2/goals/ansicht.tsx
zahlen:
  gemessen: 2026-09-08
  fehlend: 6
---

# G-421 — die vier fehlenden Reiter in Goals & Body

## Befund

`[cmd]` **`tools/vollstaendigkeit.mjs goals`: 59 von 65.**

    FEHLT  CompTab       2 Unterkomp., 4 Kacheln
           + BodyFatScale
    FEHLT  GoalsTab      1 Unterkomp., 3 Kacheln
           + GoalCard
    FEHLT  MeasureTab    3 Kacheln
    FEHLT  MetricsTab

`[read]` **Vier Reiter, zwei Unterbauteile.**

## Was schon da ist

`[cmd]` **`apps/web/src/app/v2/goals`, 17 Dateien:**

    tab-phase.tsx        37,5 KB
    tab-composition.tsx  13,5
    tab-koerper.tsx      11,8
    tab-physique.tsx     16,7
    tab-timeline.tsx      8,8
    phase-editor.tsx     45,4
    modale.tsx           25,6
    ziel-karten.tsx      13,1
    mockup-referenz.tsx  41,2

`[read]` **Miss ZUERST, ob die vier wirklich fehlen** ? **oder ob
sie unter anderem Namen dastehen.**

`[cmd]` **`tab-composition.tsx` koennte `CompTab` sein,
`ziel-karten.tsx` koennte `GoalCard` sein,
`tab-koerper.tsx` koennte `MeasureTab` sein.**

`[read]` **Das Werkzeug misst NAMEN** ? **der Orchestrator hat
heute viermal Namen geraten und lag jedes Mal falsch.**

## Die Datenlage

`[cmd]` **Alle Tabellen tragen Daten:**

    user_goals                   11
    body_measurements           362
    body_circumferences          54
    goal_milestones              13
    goal_phases                   5
    nutrition_targets             5
    phase_transition_responses    0
    progress_photos               0   (C-463, neu)

`[read]` **Zwei sind leer** ? **`progress_photos` ist heute
gebaut worden, die Modale schreiben noch nicht hinein.**

## Die Vorlage

`[cmd]` **`docs/spezifikation/10-plattform/design-system/coach-portal-draft/`:**

    module-goals.jsx         50,7 KB
    module-goals-pro.jsx     52,5
    module-goals-editor.jsx  35,7

`[read]` **`-pro` ist groesser als die Grundfassung** ? **miss,
was darin steht und ob es die Vorlage ist.**

## Was zu tun ist

**1** ? **Messen, welche der vier wirklich fehlen.**

`[read]` **Am SCHIRM, nicht im Werkzeug** ? **welche Reiter zeigt
Goals & Body heute, und was steht darin?**

**2** ? **Je fehlendem Reiter: die Kacheln der Vorlage.**

`[read]` **Dieselbe Regel wie im Coach-Portal:** **kopieren, nicht
erfinden.**

`[read]` **Wo Daten da sind: anbinden.** `[read]` **Wo nicht: die
Form mit den Zahlen der Vorlage, plus Vermerk mit dem Namen der
fehlenden Tabelle.**

**3** ? **`LogPhotoModal` schreibt jetzt irgendwohin.**

`[cmd]` **C-463 hat `goals.progress_photos` und den Bucket
`goals-progress-photos` gebaut** ? **privat, vier
Owner-Policies.**

`[cmd]` **13 Spalten:** `session_date`, `pose_type`, `pose_name`,
`pose_number`, `photo_url`, `thumbnail_url`, `notes`,
`is_private`.

`[read]` **Miss, ob das Modal heute schon dorthin zeigt** ? **oder
ob es noch ins Leere schreibt.**

## Abnahmebedingungen

    A1  welche der vier fehlen WIRKLICH? Am Schirm
        gemessen, mit Bildschirmfoto je Reiter.
    A2  je fehlendem: die Kacheln der Vorlage. Felder der
        Vorlage / gebaut / fehlend, als TABELLE.
    A3  was Daten hat, ist angebunden. Zahl: Felder /
        mit Daten / Attrappe.
    A4  LogPhotoModal: schreibt es in progress_photos?
        Gemessen. Wenn nein: angebunden.
    A5  Bildschirmfoto je Reiter, DUNKEL.
    A6  was du NICHT bauen konntest und warum.
    A7  apps/web 1575 oder mehr.

## Was nicht zu tun ist

**Nichts in `supabase/`** ? **Codex arbeitet an C-460.**
**Die Mockup-Referenz BLEIBT** ? **Tom nimmt sie ab.**
**Keine Zahl erfinden** ? **die Vorlage nennt sie.**
Nicht committen, nicht stagen, nicht pushen.

## Und eine Warnung aus heute

`[cmd]` **G-420: Kettenlaeufe setzen Testdaten zurueck.**

`[cmd]` **`dev@lumeos.app` stand heute morgen auf `vegan`, jetzt
auf `omnivore`** ? **ein Kettenlauf hat es geaendert.**

`[read]` **Wer eine Zahl misst, die aus einem Seed stammt, sollte
es benennen.**

## Der Dev-Server

`[cmd]` **3200 laeuft** (PID 1332072), **3220 laeuft.**
`[cmd]` **NIE `start`, `neustart`, `aufraeumen`.**

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
