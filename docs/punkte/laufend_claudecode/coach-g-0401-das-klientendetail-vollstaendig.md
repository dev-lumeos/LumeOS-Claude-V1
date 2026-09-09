---
nr: G-401
typ: feature
modul: coach
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: G-400
entscheidung: null
agent: claudecode
beauftragt: 2026-09-08
beruehrt:
  dateien:
    - apps/coach/src/app/athlet/[id]/page.tsx
zahlen:
  gemessen: 2026-09-08
  altrepo_kb: 39
  heute_kb: 10
---

# G-401 — das Klientendetail, vollstaendig

## Warum dieser eine

Tom, 2026-09-08: *,,bau mir endlich eine vernuenftige coach
plattform."*

`[read]` **Sechzehn Reiter halb zu bauen war der Fehler von G-398.**

`[read]` **Dieser Auftrag baut EINEN vollstaendig** ? **den, an dem
ein Coach am meisten arbeitet.**

`[cmd]` **Das Altrepo: `ClientDetail.tsx`, 39,2 KB.**
`[cmd]` **LumeOS: `athlet/[id]/page.tsx`, 10,2 KB.**

## Was zuerst zu lesen ist

`[cmd]` **`docs/lehren/coach-plattform-altrepo.md`** ? **das
Ausmass, gemessen.**

`[cmd]` **Dann, in dieser Reihenfolge:**

    referenz/lumeos-2026/
      src/modules/human-coach/components/
        ClientDetail.tsx            39,2 KB
        ClientAdherenceDashboard.tsx 8,9
        AdherenceTrends.tsx          5,6
        AdherenceCard.tsx            4,2
      src/api/human-coach/
        routes/clients.ts           13,4
        services/adherence.ts       20,8
      docs/modules/human-coach/
        COMPONENTS.md               37 KB
        FEATURES.md

    theme-v1/module-coach.jsx
      athleteDet-Modal
      module-coach-athlete.jsx      31 KB, 10 Karten

`[read]` **`COMPONENTS.md` beschreibt die 72 Bauteile** ?
**ungelesen bis heute.**

## Der Massstab

`[read]` **NICHT: gibt es eine Karte mit diesem Namen.**

`[read]` **SONDERN: welche Felder, welche Handlungen, welche
Verlaeufe.**

`[cmd]` **Der Orchestrator hat es an einer Karte vorgemacht:**

    Athletes needing attention
      Vorlage: Avatar, Name, Plan, letzte Sitzung,
               Alertzahl, Compliance farbig,
               Klick -> Detail-Modal
      Bau:     Name, Datum
      fehlt:   5 von 7

`[read]` **So misst du jede Karte des Klientendetails.**

## Was gebaut wird

`[read]` **Die FORM vollstaendig** ? **auch wo die Daten fehlen.**

`[cmd]` **Mit Attrappenvermerk und dem Namen der fehlenden
Tabelle** ? **wie in G-398.**

`[read]` **Was Daten hat, wird angebunden.** `[read]` **Was keine
hat, zeigt die Form und sagt, was fehlt.**

`[cmd]` **Angebunden verfuegbar:** `coach.relationships`,
`client_permissions` **(22 Spalten),** `client_autonomy`
**(8 Achsen),** `coach.checkins`, `coach.alerts`,
`coach.action_log`, `coach.pending_actions`.

`[cmd]` **Plus je Athlet:** `training.workout_sessions` **(66
Zeilen),** `nutrition`, `recovery`, `supplements` ? **soweit die
Erlaubnis es zulaesst.**

## Und die Form der Anwendung

`[cmd]` **Das Altrepo hatte eine SEITENNAVIGATION mit
Live-Zaehlern** (`Sidebar.tsx`), **nicht sechzehn Reiter in einer
Zeile.**

    Dashboard
    Kunden       Klienten (activeClients)
                 Nachrichten (unread, warn wenn > 0)
                 Check-ins (pending, warn)
                 Alerts (unread, critical)
    Programme    Ernaehrung, Training, Feedback
    ...

`[read]` **Miss, ob das fuer LumeOS passt** ? **und melde es, bevor
du es baust.**

`[read]` **Dieser Auftrag aendert die Navigation NICHT** ? **er
baut einen Reiter.**

### Abnahmebedingungen

    A1  je Karte des Klientendetails: Felder der Vorlage /
        Felder im Bau / fehlend. EINE TABELLE mit
        Feldnamen, nicht mit dem Wort "angebunden".
    A2  was Daten hat, ist angebunden. Zahl: Felder /
        davon mit Daten / davon Attrappe.
    A3  je Attrappe: WELCHE Tabelle fehlt.
    A4  der Kopf nutzt module-header, nicht cp-kopf.
        Belegt, ob v2-module-header verfuegbar ist.
    A5  Bildschirmfoto, DUNKEL, mit einem echten Athleten.
    A6  was heute steht, bleibt. Titel gegen Titel.
    A7  apps/coach 13/13, apps/web 1545 unveraendert.

### Was nicht zu tun ist

**`apps/web` NICHT anfassen.**
**Die Navigation NICHT umbauen** ? **messen und melden.**
**Keinen Code aus dem Altrepo uebernehmen** ? **Struktur ja,
Code nie.**
**Nichts in `packages/ui` ohne Meldung.**
**Nichts in `supabase/`** ? **Codex arbeitet an C-456.**
Nicht committen, nicht stagen, nicht pushen.

### Der Dev-Server

`[cmd]` **Port 3220, Tom startet ihn.**
`[cmd]` **NIE `start`, `neustart`, `aufraeumen`.**

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
