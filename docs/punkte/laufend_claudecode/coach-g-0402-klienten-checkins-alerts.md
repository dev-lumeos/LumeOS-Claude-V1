---
nr: G-402
typ: feature
modul: coach
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: G-401
entscheidung: null
agent: claudecode
beauftragt: 2026-09-08
beruehrt:
  dateien:
    - apps/coach/src/app/athlet/[id]/page.tsx
zahlen:
  gemessen: 2026-09-08
  reiter_leer: 7
  karten_heute: 20
---

# G-402 — Klienten, Check-ins, Alerts

## Auftrag

Tom, 2026-09-08: *,,gib ihm alles, ich will endlich resultate
sehen."*

**Beauftragt am 2026-09-08.**

`[cmd]` **Die Schale steht (G-401). Dahinter sind 956 Zeilen und
20 Karten** ? `tab-leer` **bedient sieben von sechzehn
Bereichen.**

`[read]` **Dieser Auftrag baut die drei Bereiche, die OHNE neue
Tabellen gehen** ? **und raeumt die drei Doppelungen weg.**

## Zuerst lesen

`[cmd]` **`docs/sessions/2026-09-08-coach-was-fehlt.md`** ? **die
Liste.**
`[cmd]` **`docs/lehren/coach-plattform-altrepo.md`** ? **das
Ausmass.**

**Dann, je Bereich, im Altrepo:**

    Klienten    src/modules/human-coach/components/
                  ClientList.tsx            13,1 KB
                  ClientDetail.tsx          39,2
                  ClientAdherenceDashboard   8,9
                  AdherenceTrends.tsx        5,6
                  AdherenceCard.tsx          4,2
                src/api/human-coach/
                  routes/clients.ts         13,4
                  services/adherence.ts     20,8

    Check-ins   components/CheckinList.tsx  13,5
                routes/checkins.ts          16,5

    Alerts      components/AlertsPanel.tsx   7,9
                routes/alerts.ts            13,4
                routes/alerting.ts          13,6
                services/alertGenerator.ts  12,9

`[cmd]` **Und `docs/modules/human-coach/COMPONENTS.md`, 37 KB** ?
**dort sind die Bauteile beschrieben.**

`[read]` **Struktur ja, Code nie.**

## 1 · Klienten — der wichtigste Bereich

`[cmd]` **Heute: `tab-athleten.tsx`, 69 Zeilen, 2 Karten.**
`[cmd]` **Und `athlet/[id]/page.tsx`, 10,3 KB.**

`[cmd]` **Die Vorlage:** `module-coach-athlete.jsx`, **31 KB, 10
Karten** ? **plus `athleteDet`-Modal in `module-coach.jsx`.**

**Die Liste:**

`[read]` **Nicht Namen mit Datum** ? **Avatar, Name, Plan, letzte
Sitzung, Alertzahl, Compliance FARBIG, klickbar.**

**Das Detail:**

`[read]` **Was ein Coach ueber einen Klienten wissen muss** ?
**miss es aus `ClientDetail.tsx` und der Vorlage.**

`[cmd]` **Verfuegbar:** `coach.relationships`,
`client_permissions` **(22 Spalten),** `client_autonomy` **(8
Achsen),** `coach.checkins`, `coach.alerts`,
`coach.action_log`, `coach.pending_actions`.

`[cmd]` **Und je Athlet, soweit die Erlaubnis es zulaesst:**
`training.workout_sessions` **(66 Zeilen),** `nutrition`,
`recovery`, `supplements`.

## 2 · Check-ins

`[cmd]` **Heute: 176 Zeilen, 3 Karten** ? **der groesste
bestehende Reiter.**

`[cmd]` **`coach.checkins` steht.**

`[read]` **Miss gegen `CheckinList.tsx` (13,5 KB), was fehlt.**

## 3 · Alerts

`[cmd]` **Heute: 69 Zeilen, 2 Karten.** `[cmd]` **`coach.alerts`
steht.**

`[read]` **Der ERZEUGER fehlt** (`alertGenerator.ts`, 12,9 KB) ?
**das ist ein Codex-Auftrag, melde was er braeuchte.**

`[read]` **Bau die Ansicht** ? **Stufen, Filter, Quittieren.**

## 4 · Die drei Doppelungen aufloesen

`[cmd]` **`packages/ui` ist diesmal ERLAUBT** ? **mit Messung und
Gegenprobe, dass `apps/web` unveraendert bleibt.**

**a** ? `SidebarProps.gruppen` **und** `marke` **einspeisbar**
? **dein eigener Vorschlag aus G-401.**

`[read]` **Sonst bleibt die 240-Zeilen-Kopie.**

**b** ? **der Referenz-Trenner** ? **steht zweimal (G-399).**

**c** ? **die Tokens** ? `apps/coach/src/app/tokens.css` **ist
eine Kopie, Stand 2026-08-20.**

`[cmd]` **Du hast gemessen: nur `--acc` weicht ab, absichtlich.**

`[read]` **Also: die gemeinsamen nach `packages/ui`, `--acc`
bleibt lokal.**

## 5 · Die `cp-`-Reste

`[cmd]` **Sechs Stellen im Quelltext:** `portal.css:52`,
`referenz-trenner.tsx:4`, `tab-alerts.tsx:7`,
`tab-athleten.tsx:6`, `athlet/[id]/page.tsx:19`, `page.tsx:5`.

`[read]` **A3 mass *,,0 im DOM"*** ? **das ist nicht dasselbe wie
*,,0 im Code"*.**

### Abnahmebedingungen

    A1  Klientenliste: Felder der Vorlage / im Bau /
        fehlend. TABELLE mit Feldnamen.
    A2  Klientendetail: dasselbe.
    A3  Check-ins gegen CheckinList.tsx: dasselbe.
    A4  Alerts gegen AlertsPanel.tsx: dasselbe.
        Und: was braeuchte ein Erzeuger? Gemeldet.
    A5  packages/ui: Sidebar nimmt gruppen und marke.
        Gegenprobe: apps/web unveraendert, Foto.
    A6  Referenz-Trenner und Tokens: eine Fassung.
        Zahl: Dateien vorher / nachher.
    A7  cp- im Code: 6 -> 0. Gemessen, nicht im DOM.
    A8  je Bereich ein Bildschirmfoto, DUNKEL.
    A9  apps/coach 25/25 oder mehr, apps/web 1545
        unveraendert.

### Was nicht zu tun ist

**`apps/web` NICHT anfassen** ? **`packages/ui` schon, aber mit
Gegenprobe.**
**Keine Tabelle erfinden** ? **was fehlt, wird gemeldet.**
**Keinen Code aus dem Altrepo uebernehmen.**
**Die Bereiche 4 bis 10 NICHT anfangen** ? **Nachrichten, Regeln,
Programme brauchen Tabellen, die es nicht gibt.**
Nicht committen, nicht stagen, nicht pushen.

### Der Dev-Server

`[cmd]` **Port 3220, Tom startet ihn.**
`[cmd]` **NIE `start`, `neustart`, `aufraeumen`.**

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
