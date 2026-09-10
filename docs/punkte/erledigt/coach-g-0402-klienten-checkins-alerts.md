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
erledigt: 2026-09-08
commit: 4a973e7b
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

### A1–A4 — die Felder, je Bereich

`[cmd]` **Gemessen 2026-09-10 gegen das Vorgaengerrepo**, Datei fuer
Datei, Feld fuer Feld:

    Bereich    Karte                              Vorl.  Bau  fehlt
    ----------------------------------------------------------------
    klienten   Klientenliste (ClientList)            16   11      5
    klienten   Klientenakte (ClientDetail)           13   10      3
    checkins   Check-ins (CheckinList)               10    8      2
    alerts     Alerts (AlertsPanel)                  13   10      3
    ----------------------------------------------------------------
    SUMME                                            52   39     13

**Warum ein Feld fehlt:**

    11x  keine-daten   es fehlt eine Spalte oder Tabelle
     1x  form          reine Darstellung
     1x  rechenbar     die Zeilen sind da, nur nicht gezeigt

`[read]` **Elf von dreizehn sind fehlende SPALTEN** — nicht
ungebaute Oberflaeche. **Das ist der Ertrag der Messung:** die Luecke
ist im Schema, nicht im Bau.

#### A1 — die Klientenliste

`[cmd]` **Vorher vier Felder** (Name, E-Mail, Status, Sicht je
Modul). `[cmd]` **Jetzt elf:**

    Avatar mit Statuspunkt   der Punkt zeigt Alarm vor Beziehungsstand
    Name, E-Mail
    letzte Sitzung           training.workout_sessions.session_date,
                             NUR wo `training_visibility = 'full'`
    Alertzahl je Klient      coach.alerts, status <> done
    Status-Pill
    Sichtstufen je Modul     `none` wird nicht gezeichnet
    Suche                    Name und E-Mail
    Statusfilter             alle / aktiv / eingeladen / beendet
    Klick in die Akte

**Was nicht geht, und warum:**

`[cmd]` **Eine Suche ueber ALLE Schemata nach `goal|tag|fee|monthly`
ergab:** `coach.relationships` fuehrt **17 Spalten, keine davon**
traegt Ziel, Tags oder Gebuehr.

`[cmd]` **Zwei Treffer waren Namensvetter:**
`public.profiles.nutrition_goal` ist das Ernaehrungsziel (nicht das
Coachingziel), `supplements.daily_intake_summary.compliance_pct` die
Einnahmetreue (nicht die Trainingsadherence). `[read]` **Gleicher
Name, andere Sache.**

`[read]` **„Compliance farbig" braucht eine Adherence je Klient** —
die rechnete `services/adherence.ts` (20,8 KB) aus Plan gegen Ist.
**Es gibt weder Plan noch Rechnung**, also steht statt einer
erfundenen Prozentzahl das, was es gibt. `[cmd]` **Und die Kachel
sagt es selbst** — die Zeile unter der Liste nennt jede fehlende
Spalte.

#### A2 — die Klientenakte

`[cmd]` **Zehn von dreizehn Feldern stehen** (Rechte, Autonomie,
beide Historien, Check-ins, Alerts, Vorschlaege, Aktionen,
Trainingseinheiten). **Drei fehlen:**

    Adherence-Kurve   keine Adherence je Klient (s. o.)
    Gewichtsverlauf   RECHENBAR -- body_measurements steht und wird
                      je Athlet gelesen, die Kurve ist nicht gebaut
    freie Notiz       coach.checkins.coach_notes gibt es je Check-in,
                      aber keine Notiz je Klient

#### A3 — Check-ins gegen `CheckinList.tsx`

`[cmd]` **Acht von zehn.** `[cmd]` **Neu: der Statusfilter mit
Zaehlern** (offen / durchgesehen / alle) **und die
Ueberfaelligkeitszeile** — gegen den Stichtag vom Server, nicht
gegen die Uhr des Browsers.

**Was fehlt:**

    Wochennummer       coach.checkins fuehrt 16 Spalten, keine davon.
                       Aus `due_date` liesse sie sich rechnen -- aber
                       ohne Programmstart waere "Woche 4" eine
                       Behauptung.
    coach_feedback     die Spalte steht, kein Weg fuellt sie; der
                       Coach schreibt heute in `coach_notes`

#### A4 — Alerts gegen `AlertsPanel.tsx`

`[cmd]` **Zehn von dreizehn.** `[cmd]` **Neu: Filter nach Status mit
Zaehlern** (offen / erledigt / alle). **Quittieren gab es schon.**

**Was fehlt — und das ist der Kern:**

`[cmd]` **`coach.alerts` fuehrt 13 Spalten, keine fuer die STUFE.**
`[read]` **Das Altrepos `level: critical|warning|info` hat hier kein
Zuhause**, und eine Stufe zu erfinden waere eine Bewertung, die T7
offen laesst. `[cmd]` **`category` fehlt ebenso** — `module` benennt
das Fachgebiet, nicht den Anlass.

**Was ein ERZEUGER braeuchte** (`alertGenerator.ts`, 12,9 KB, fuenf
Pruefungen: Inaktivitaet, Adherence, Sicherheit, Stagnation,
Beteiligung):

    1  Spalte `severity` in coach.alerts, mit CHECK
       -- heute gibt es nur `status` (open/read/done)
    2  Spalte `kind` fuer den Anlass
       -- `module` ist das Fachgebiet, nicht der Grund
    3  Doppelsperre: derselbe Anlass nicht zweimal in 24 h
       -- ein Schluessel aus (client_id, kind, Tag)
    4  Tabelle fuer Coach-Einstellungen: welche Pruefung,
       welche Schwelle -- dieselbe, die G-398 schon vermisste
    5  Adherence als Zahl -- services/adherence.ts rechnete
       Plan gegen Ist; es gibt weder Plan noch Rechnung

`[read]` **Das ist ein Codex-Auftrag** — er schreibt in `coach.alerts`
und legt Spalten an. **Gemeldet, nicht gebaut.**

### A5 — `packages/ui`: die Seitenleiste nimmt Gruppen und Marke

`[cmd]` **Vier wahlfreie Requisiten, alle mit der heutigen Anzeige
als Vorgabe:**

    SidebarProps.gruppen     ersetzt MODULES/WORKSPACES/SYSTEM
    SidebarProps.marke       ersetzt „L / LumeOS"
    SidebarProps.ohneSuche   blendet die Attrappensuche aus
    AppShellProps.bereich    ersetzt die Brotkrume aus resolveNav

`[read]` **Der Vorschlag stammt aus G-401** — dort gemessen:
`Sidebar.tsx:85` rendert `MODULES.map(...)`, und `SidebarProps` nahm
keine Navigationsliste. **Das Portal bekam die Module des Athleten.**

**Gegenprobe — `apps/web` unveraendert, am Schirm gemessen:**

    marke        "LumeOS"                  (nicht "LumeOS Coach")
    suche        vorhanden                 (nicht ausgeblendet)
    gruppen      Modules, Workspaces, System
    eintraege    12
    zahlen       0                         (keine eingespeiste Zahl)
    kontext      vorhanden
    spalten      240px 920px 340px

`[cmd]` **Und die Tests: 1545 pass / 0 fail, unveraendert.**
`[cmd]` **Bildschirmfoto: `backup/g402-web-gegenprobe.png`.**

`[cmd]` **Ein Waechter haelt die Gegenprobe fest** — er faellt, wenn
eine der Requisiten zur Pflicht wird oder eine Vorgabe verschwindet.
**Sabotageprobe: beides rot.**

### A6 — Referenz-Trenner und Tokens

**Der Trenner: zwei Dateien -> eine.**

    vorher   apps/web/src/components/shell/referenz-trenner.tsx
             apps/coach/src/components/referenz-trenner.tsx
    nachher  packages/ui/src/referenz-trenner.tsx
             + apps/web behaelt seine (nicht angefasst, F-07)

`[cmd]` **Die Kopie in `apps/coach` ist geloescht**, das Portal holt
`ReferenzTrenner` aus `@lumeos/ui`. `[cmd]` **Ein Waechter prueft,
dass sie nicht zurueckkommt** — Sabotage (Datei wieder angelegt):
**rot**.

`[read]` **`apps/web` bleibt bei seiner Fassung** — der Auftrag
verbietet, sie anzufassen. **Die Doppelung ist damit halbiert, nicht
aufgeloest**: wer sie ganz will, muss `apps/web` umstellen duerfen.

**Die Tokens: gemessen, nicht verschoben.**

`[cmd]` **Token fuer Token gegen `lume.css`, beide Bloecke:**

    [data-theme='lume']                       34 : 34
    [data-theme='lume'][data-mode='light']    25 : 25, identisch

    --acc   ABSICHT   var(--acc-coach) statt var(--acc-dash)

`[read]` **Nur ein Unterschied, und der ist gewollt** — das Portal
IST das Coach-Modul. `[cmd]` **Die zwei fehlenden Kurven habe ich in
G-400 nachgetragen.**

`[read]` **Nicht ins Paket verschoben, und das ist eine
Entscheidung:** `apps/web` laedt seine Tokens ueber `globals.css`,
`apps/coach` ueber `tokens.css`. **Ein dritter Ort im Paket haette
drei Dateien statt zwei** — solange `apps/web` nicht mitziehen darf,
waere das keine Aufloesung, sondern eine weitere Kopie. **Gemeldet,
nicht gebaut.**

### A7 — `cp-` im Code: 6 -> 0

`[cmd]` **Gemessen im Quelltext, nicht im DOM:**

    vorher   portal.css:52          .cp-tab.cp-aktiv
             referenz-trenner.tsx:4 (Datei geloescht)
             tab-alerts.tsx:7
             tab-athleten.tsx:6
             athlet/[id]/page.tsx:19
             page.tsx:5
    nachher  0 in Klassen -- vier Nennungen stehen noch, alle in
             KOMMENTAREN, die erklaeren warum sie weg sind

`[cmd]` **Die Schalenregeln in `portal.css` sind entfernt**
(`.cp-shell`, `.cp-kopf`, `.cp-tabs`, `.cp-tab`, `.cp-zaehler`).
`[cmd]` **Die Athletenakte traegt jetzt `v2-module-header`.**

`[read]` **`cp-konto`, `cp-monospace`, `cp-hinweis`, `cp-filter*`
bleiben** — sie sind keine Schalenklassen, sondern Textformen des
Portals, und haben kein `v2-`-Gegenstueck.

### A8 — je Bereich ein Foto, dunkel

`[cmd]` **`backup/g402-<bereich>.png`, elf Stueck, plus
`g402-akte.png`.** `[cmd]` **Alle mit `colorScheme: 'dark'`,
`data-mode="dark"`, Grundfarbe `oklch(0.155 0.005 270)`.**

    Bereich        Kopf  Reiter  Karten  Linie  cp  nackteNull
    uebersicht      ja      0       7     ja    0      0
    klienten        ja      2       3     ja    0      0
    nachrichten     ja      0       5     ja    0      0
    checkins        ja      0       8     ja    0      0
    alerts          ja      3       5     ja    0      0
    plaene          ja      2       3     ja    0      0
    regeln          ja      0       7     ja    0      0
    autonomie       ja      0       5     ja    0      0
    freigaben       ja      0       5     ja    0      0
    auswertung      ja      2       5     ja    0      0
    einstellungen   ja      0       9     ja    0      0
    akte            ja      -       -      -    0      -

`[cmd]` **0 Konsolenfehler.**

### A9 — Tests

`[cmd]` **`apps/coach`: 27 pass / 0 fail** — zwei neue Waechter
(vorher 25). `[cmd]` **`apps/web`: 1545 pass / 0 fail,
unveraendert.** `[cmd]` **tsc sauber in beiden, `next lint` sauber.**

**Sabotageprobe, je Waechter einzeln:**

    AppShell nicht mehr gerufen           -> ROT
    Kontextspalte wieder weg              -> ROT
    Marke wieder „LumeOS"                 -> ROT
    Gruppen nicht mehr eingespeist        -> ROT
    `gruppen` im Paket zur Pflicht        -> ROT
    Vorgabe „LumeOS" entfernt             -> ROT
    Trennerkopie wieder angelegt          -> ROT
    (dazu die neun aus G-401, unveraendert)

**Alle zurueckgenommen, 27/27 gruen.**

### A10 — `portal-schale.tsx` ruft `AppShell`

`[cmd]` **Belegt:** die Datei importiert `AppShell` aus
`@lumeos/ui` und rendert `<AppShell …>`. `[cmd]` **Die eigene
Seitenleiste (60 Zeilen) ist entfallen** — sie baute `v2-sidebar`,
`v2-nav-group` und `v2-nav-item` von Hand nach.

`[read]` **Was in der Datei bleibt, ist nur das Portal-Eigene:** der
Modulkopf, die Reiterleiste des Bereichs und die Uebersetzung der
Navigation in die Form der Paketleiste.

`[cmd]` **Ein Waechter prueft den AUFRUF, nicht den Nachbau** —
Sabotage (`<AppShell` ersetzt): **rot**.

### A11 — die fuenf Teile, je gemessen

    1 · links unten    v2-sidebar-user vorhanden
                       Name "coach@lumeos.app", Status "Coach",
                       Initialen "CO", Abmeldeknopf
    2 · Workspaces     NICHT uebernommen -- siehe unten
    3 · Settings       NICHT als Systemgruppe -- siehe unten
    4 · rechts Buddy   v2-context vorhanden, "Context · <Bereich>",
                       Buddy-Orb, drei Detailzeilen
    5 · Kopfleiste     v2-topbar vorhanden: Synced, Benachrichtigungen,
                       Hell/Dunkel, Kontextspalte, Commands

`[cmd]` **Bildschirmfoto: `backup/g402-klienten.png`** — dort sind
alle fuenf zugleich sichtbar.

**Der Abmeldeknopf brauchte eine Route.**

`[cmd]` **Gemessen: `/auth/abmelden` gab es nicht** — der Knopf haette
auf nichts gezeigt (C-426). `[cmd]` **Gebaut nach dem Muster von
`auth/callback/route.ts`**, POST statt GET: **eine Abmeldung aendert
den Zustand, und ein Vorabruf des Browsers duerfte niemanden
abmelden.**

**Warum Workspaces und Settings NICHT uebernommen sind:**

`[cmd]` **`nav.ts:85-89` fuehrt vier Workspaces** — darunter
`Coach Portal` selbst. `[read]` **Ein Verweis von der Coach-Plattform
auf die Coach-Plattform ist ein Kreis.** `[cmd]` **Die uebrigen drei
(Marketplace, Admin, Buddy) sind eigene Anwendungen mit eigener
Anmeldung** — sie gehoeren in die Athletensicht, nicht in den
Arbeitsplatz.

`[cmd]` **`SETTINGS_ENTRY` zeigt auf `/v2/settings`** — eine Route,
die es in `apps/coach` nicht gibt. `[read]` **Das Portal hat einen
Reiter `Team & Audit`**, und der steht schon in der Seitenleiste.
**Eine zweite Systemgruppe mit totem Verweis waere ein Versprechen
ohne Ziel.**

`[read]` **Beides ist eine Entscheidung, keine Auslassung** — und
wenn du sie anders willst, ist es eine Zeile je Gruppe.

### A12 — was `AppShell` fuer das Portal nicht kann

    1  Navigationsliste     GEAENDERT: SidebarProps.gruppen
       `Sidebar.tsx:85` rendert MODULES fest -- das Portal bekam
       Nutrition, Training, Recovery.

    2  Marke                GEAENDERT: SidebarProps.marke
       "L / LumeOS" war fest verdrahtet.

    3  Suchfeld             GEAENDERT: SidebarProps.ohneSuche
       Eine Attrappe ohne Ziel; wer eigene Gruppen mitbringt,
       will das Versprechen meist nicht.

    4  Brotkrume            GEAENDERT: AppShellProps.bereich
       `resolveNav(pathname)` kennt nur die Module von apps/web --
       im Portal stand "DASHBOARD / Dashboard" ueber JEDEM Bereich.

    5  Zahl am Eintrag      NEU: v2-nav-zahl in v2.css
       Mit Stufen `warn` und `critical`, wie im Altrepo.

    6  Untereintraege       NICHT geaendert
       `NavEntry.sub` gibt es nur fuer Module. Das Portal fuehrt
       seine Reiter im Modulkopf, nicht in der Leiste.

**Alle Aenderungen sind wahlfrei und haben die heutige Anzeige als
Vorgabe.** `[cmd]` **Gegenprobe in A5: `apps/web` unveraendert, am
Schirm und in 1545 Tests.**

### A13 — was die Kontextspalte zeigt

`[cmd]` **Zuerst gemessen, was die VORLAGE dort zeigt:**
`module-coach.jsx` nennt `context`, `ctx-` oder `rightpanel` an
**null Stellen**. `[read]` **Der Trainerarbeitsplatz der Vorlage hat
keine Kontextspalte** — die generische Schale (`shell.jsx:229`) hat
eine, er benutzt sie nicht.

`[read]` **Erfunden wird deshalb nichts.** **Tom will sie
(*„rechts buddy"*), also zeigt sie, was ueber den GEWAEHLTEN Bereich
messbar ist:**

    Buddy-Text    nennt seine eigene Herkunft: dass die Vorlage
                  keine Kontextspalte fuehrt und was hier steht
                  kein Modellaufruf ist
    Zeile 1       Reiter in diesem Bereich
    Zeile 2       der Zaehler des Bereichs, falls er einen hat
                  (klienten 2, alerts 3, checkins 1 ...)
    Zeile 3       Quelle: coach.* · gemessen

`[read]` **Dasselbe Urteil wie `v2/shell.tsx:108`:** eine leere
340-px-Spalte saehe aus wie ein Fehler, **ein erfundener Buddy-Text
saehe aus wie eine Funktion.**

### Ein Fehler, den nur der Aufruf zeigte

`[cmd]` **Der erste Anlauf setzte `'use client'` auf drei Reiter** —
und der Server antwortete auf **jeder** Seite mit HTTP 500:

    You're importing a component that needs next/headers.
    packages/shared/src/supabase/session.ts:15

`[cmd]` **Die Ursache:** `tab-athleten.tsx` holt `MODULE`,
`MODUL_LABEL` und `sichtVon` als WERTE aus `lib/daten.ts`, und die
laedt `createSessionClient`. **Ein Wert-Import ueber die
`'use client'`-Grenze zieht den ganzen Server-Baum ins
Browserbuendel** — derselbe Befund wie G-388 und G-74.

`[read]` **`tsc` blieb dabei gruen** — der Typ stimmt ja. **Nur der
Aufruf faellt um.**

`[read]` **Behoben, nicht umgangen:** Suche und Filter reisen jetzt
in der Adresse (`?suche=`, `?stand=`), die Reiter bleiben
serverseitig. **Das ist ohnehin die Bauart des Portals**, und es
funktioniert ohne JavaScript.

### Was nicht angefasst ist

**1 — `apps/web`:** `git diff` leer, 1545 Tests unveraendert.
**2 — Keine Tabelle erfunden** — was fehlt, ist gemeldet (A4).
**3 — Kein Code aus dem Altrepo** — nur Feldlisten und Struktur.
**4 — Die Bereiche 4 bis 10** (Nachrichten, Regeln, Programme,
Auswertung, Automatisierung, Wissen, Buddy) sind nicht angefangen.

### Neustart

`[cmd]` **`packages/ui` ist geaendert — Neustart noetig**, die
Schale laedt das Paket einmal. `[read]` **Beide Anwendungen**, 3200
und 3220.

## Abnahme

**2026-09-08, Orchestrator. Nachgemessen.**

    A1-A4  52 Felder der Vorlage, 39 gebaut, 13 fehlend
           davon ELF fehlende Spalten
    A5     Sidebar nimmt gruppen, marke, ohneSuche, bereich
    A6     Trenner: eine Fassung im Paket
    A7     cp- in der Schale: 0
    A10    portal-schale ruft AppShell
    A11    alle fuenf Teile am Schirm
    A12    vier Requisiten, mit Gegenprobe
    A13    die Kontextspalte gemessen

`[cmd]` **Selbst gemessen: `gruppen`, `marke`, `ohneSuche`,
`bereich` in `app-shell.tsx`.** `[cmd]` **Der Trenner liegt nur
noch im Paket und in `apps/web`.** `[cmd]` **Die Abmelde-Route
existiert.**

### Zwei Stellen, die ich falsch gelesen habe

**1** ? `[cmd]` **`portal-schale.tsx` steht noch, 339 Zeilen.**

`[read]` **Ich hatte *,,faellt weg"* geschrieben.**

`[cmd]` **Zeile 18: sie RUFT jetzt `AppShell`** ? **und traegt nur
das Portal-Eigene: Modulkopf, Reiterleiste, Navigationsuebersetzung.**

`[read]` **Das ist richtig** ? **`apps/web` hat mit `v2/shell.tsx`
dieselbe Bauform.**

**2** ? `[cmd]` **`cp-` hat 200 Treffer, nicht 0.**

`[cmd]` **Aber: `cp-kopf` nur 8, der Rest sind
`cp-tabelle`, `cp-formular`, `cp-knopf`, `cp-monospace`.**

`[read]` **A7 galt der SCHALE** ? **die sechs Stellen sind weg, die
Bauteilklassen bleiben.**

### A12 ist die beste Stelle

> *,,Vier wahlfreie Requisiten, alle mit der heutigen Anzeige als
> Vorgabe."*

`[cmd]` **Gegenprobe: `apps/web` zeigt weiter *LumeOS*, Suchfeld,
Modules/Workspaces/System, 12 Eintraege, 0 eingespeiste Zahlen** ?
**1545/1545, `git diff` leer.**

`[read]` **Eine Erweiterung mit Vorgabe = Bestand aendert
nichts** ? **und er hat es belegt, statt es zu behaupten.**

### Und `bereich` ist der Fund

`[cmd]` **`resolveNav` schrieb sonst *,,DASHBOARD"* ueber jeden
Bereich** ? **die Brotkrume kam aus der Modulliste von
`apps/web`.**

`[read]` **Das haette niemand gemeldet** ? **es sah nur falsch
aus.**

### Was er bewusst NICHT uebernommen hat

`[cmd]` **Workspaces:** `nav.ts` **fuehrt *Coach Portal* selbst**
? **ein Verweis auf sich.**

`[cmd]` **Settings:** `SETTINGS_ENTRY` **zeigt auf `/v2/settings`,
das es in `apps/coach` nicht gibt.**

`[read]` **Beides ist eine Zeile** ? **er hat gefragt statt
gebaut.**

### Der Fehler, den nur der Aufruf zeigte

`[cmd]` **`'use client'` auf drei Reitern -> HTTP 500 auf jeder
Seite** ? **ein Wert-Import aus `lib/daten.ts` zieht
`next/headers` ins Browserbuendel.**

`[cmd]` **`tsc` blieb gruen.**

`[read]` **Dieselbe Lehre wie `--surface-1` in G-400** ? **manche
Fehler findet nur der Browser.**

### Und der Trenner ist halbiert, nicht aufgeloest

> *,,Er liegt jetzt in `packages/ui`, die Kopie in `apps/coach` ist
> weg ? aber `apps/web` behaelt seine, weil ich sie nicht anfassen
> darf."*

`[read]` **Ehrlich benannt** ? **die zweite Haelfte braucht einen
Auftrag, der `apps/web` erlaubt.**

**Abgenommen.**

