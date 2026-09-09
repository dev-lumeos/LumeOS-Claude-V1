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

## Auftrag — die Schale zuerst

Tom, 2026-09-08: *,,die coachplattform soll gleich aufgebaut sein
wie lumeos. genau gleiche strukturen, also ja: sidenav und
modulnav wie lumeos."*

`[read]` **Das aendert die Reihenfolge:** **erst die Schale, dann
die Inhalte.**

`[read]` **Sechzehn Reiter in einer Zeile waren falsch** ? **LumeOS
hat eine Seitenleiste mit Gruppen und darin je Modul eine
Reiterleiste.**

### Was `apps/web` hat

`[cmd]` **`apps/web/src/components/shell/app-shell.tsx`, 493
Zeilen:**

    Z25  moduleNav      die Module
    Z35  workspaceNav   WORKSPACES
    Z42  systemNav      SYSTEM

`[cmd]` **Dazu:** `theme-switcher.tsx`, `sprachwahl.tsx`,
`referenz-trenner.tsx`.

`[cmd]` **Und je Modul:** `v2/shell.tsx` **(159 Zeilen)** ? **der
Modulkopf mit `v2-module-header`, `v2-kopf-mitte`, dem
Tageswechsler-Anker aus G-392.**

`[cmd]` **Die Reiterleiste je Modul:** `v2-tabs`.

### Was `apps/coach` hat

`[cmd]` **`cp-shell`, `cp-kopf`** ? **eine eigene Fassung, 281
Zeilen `portal.css`.**

`[cmd]` **Keine Seitenleiste. Sechzehn Reiter in einer Zeile.**

### 1 · Die Schale uebernehmen

`[read]` **Miss zuerst, was `app-shell.tsx` an `apps/web`
bindet:**

`[cmd]` **`next-intl`? Modus-Cookie? `createClient` aus
`@lumeos/shared`?**

`[read]` **Was gemeinsam sein kann, gehoert nach `packages/ui`** ?
**melden, nicht einfach kopieren.**

`[cmd]` **Der Referenz-Trenner steht heute schon zweimal** ?
**G-399, derselbe Fehler.**

### 2 · Die Gruppen des Coach-Portals

`[read]` **Nicht die Module von `apps/web`** ? **die Arbeit eines
Coaches.**

`[cmd]` **Das Altrepo hatte vier Gruppen** (`Sidebar.tsx`):

    Dashboard
    Kunden       Klienten, Nachrichten, Check-ins, Alerts
    Programme    Ernaehrung, Training, Feedback
    ...          Regeln, Automatisierung, Autonomie,
                 Auswertung, Wissen, KI, Buddy, Einstellungen

`[cmd]` **Mit LIVE-ZAEHLERN aus `useCoachStats`, `useAlerts`,
`useAllThreads`** ? **`warn` wenn ungelesen, `critical` bei
kritischen Alerts.**

`[read]` **Die sechzehn Reiter von heute verteilen sich darauf** ?
**miss, welcher in welche Gruppe gehoert.**

### 3 · Der Modulkopf je Bereich

`[cmd]` **`v2-module-header` mit Titel, Pills, Untertitel,
Aktionen** ? **wie in der Vorlage
(`module-coach.jsx`, `CoachPortalStandalone`).**

`[cmd]` **Vier Pills:** `separate platform`, `coach.lumeos.app`,
Athletenzahl, Alerts.
`[cmd]` **Zwei Aktionen:** `Broadcast`, `New plan`.

`[read]` **Und darunter die Reiterleiste des Bereichs** ? **nicht
alle sechzehn.**

### 4 · Die Tokens

`[cmd]` **`apps/coach/src/app/tokens.css` ist eine Kopie, Stand
2026-08-20.**

`[read]` **Wenn die Schale gemeinsam wird, muessen es die Tokens
auch** ? **`packages/ui`.**

`[read]` **Melden mit der Messung, was seit dem 20.08.
auseinandergelaufen ist** ? **G-384 nennt elf
Modul-Akzenttokens.**

### 5 · Der Modus

`[cmd]` **`apps/coach` nimmt `prefers-color-scheme`, `apps/web`
einen Cookie** ? **deshalb ist das Portal hell.**

`[read]` **Miss, ob der Cookie teilbar ist** ? **dieselbe
Domaene?**

### Abnahmebedingungen

    A1  was bindet app-shell.tsx an apps/web? Liste.
        Was kann gemeinsam werden?
    A2  Seitenleiste mit Gruppen, wie apps/web.
        Zahl: Gruppen / Eintraege / davon mit Zaehler.
    A3  je Eintrag ein Modulkopf mit v2-module-header.
        Kein cp-kopf mehr.
    A4  die Reiterleiste je Bereich, nicht sechzehn in
        einer Zeile. Zahl: Bereiche / Reiter je Bereich.
    A5  dunkel wie apps/web. Bildschirmfoto beider
        nebeneinander.
    A6  die Tokens: was ist auseinander? Liste.
        packages/ui: gemeldet, nicht gebaut.
    A7  die 44 Referenzkarten aus G-398 bleiben,
        auf ihre Bereiche verteilt.
    A8  apps/coach 13/13, apps/web 1545 unveraendert.

### Was nicht zu tun ist

**`apps/web` NICHT anfassen.**
**Nichts in `packages/ui`** ? **melden, mit Messung.**
**Keine Inhalte bauen** ? **das ist der naechste Auftrag.**
**Keinen Code aus dem Altrepo uebernehmen** ? **Struktur ja,
Code nie.**
Nicht committen, nicht stagen, nicht pushen.

### Der Dev-Server

`[cmd]` **Port 3220, Tom startet ihn.**
`[cmd]` **NIE `start`, `neustart`, `aufraeumen`.**

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
