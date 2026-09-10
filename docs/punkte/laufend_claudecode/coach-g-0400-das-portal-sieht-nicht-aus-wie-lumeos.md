---
nr: G-400
typ: befund
modul: coach
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: G-398
entscheidung: null
agent: claudecode
beauftragt: 2026-09-08
beruehrt:
  dateien:
    - apps/coach/src/app/tokens.css
zahlen:
  gemessen: 2026-09-08
  tokens_coach: 73
  globals_web: 1184
---

# G-400 — das Portal sieht nicht aus wie LumeOS

## Befund

Tom, 2026-09-08, nach dem Blick auf 3220: *,,alles
schwachsinn."*

`[cmd]` **Bildschirmfoto `backup/g398-overview.png` nachgesehen:
weisser Hintergrund, andere Typografie, kein Modulkopf.**

`[read]` **Die Karten sind richtig eingeordnet** ? **aber es sieht
nicht aus wie LumeOS.**

## Warum

`[cmd]` **`apps/coach/src/app/layout.tsx` laedt:**

    @lumeos/ui/styles.css
    ./tokens.css      73 Zeilen
    ./portal.css     281 Zeilen

`[cmd]` **`apps/web` laedt `globals.css`** ? **1.184 Zeilen, plus
`AppShell`, `next-intl`, Modus-Cookie.**

### Die Tokens sind eine Kopie

`[cmd]` **`tokens.css`, Zeile 1-7:**

> *,,KOPIE aus `apps/web/src/styles/themes/lume.css` (Stand
> 2026-08-20), Werte unveraendert ? `v2.css` (aus `@lumeos/ui`)
> braucht sie, und `apps/web` darf von diesem Auftrag nicht
> angefasst werden (F-07). Wer die Tokens aendert, aendert BEIDE
> Dateien ? oder zieht sie in ein Paket."*

`[cmd]` **Stand 2026-08-20** ? **drei Wochen alt.**

`[read]` **Und `apps/web` hat seither elf Modul-Akzenttokens
bekommen** (G-384).

### Und die Klassen sind eigene

`[cmd]` **`portal.css`:** *,,eigene Klassen unter `cp-`, damit
keine Regel die v2-Bausteine aus `@lumeos/ui` trifft."*

    .cp-shell   .cp-kopf   ...

`[read]` **`apps/web` nutzt `v2-module-header`,
`v2-module-hero-lite`, `v2-kopf-mitte`** ? **das Portal keines
davon.**

`[read]` **Zwei Designs im selben Haus.**

### Der helle Modus

`[cmd]` **`layout.tsx`: der Modus kommt aus
`prefers-color-scheme`** ? **KEIN Modus-Cookie in dieser App.**

`[cmd]` **`apps/web` liest den Cookie** ? **deshalb dort dunkel,
hier hell.**

`[read]` **Wer zwischen den Anwendungen wechselt, sieht zwei
verschiedene Produkte.**

## Was zu entscheiden ist

**a** ? **Die Tokens nach `packages/ui`**, beide Anwendungen
darauf.

`[cmd]` **Der Kommentar in `tokens.css` schlaegt es selbst vor.**

`[read]` **Loest die Kopie, aber nicht die `cp-`-Klassen.**

**b** ? **Das Portal auf die `v2-`-Bausteine umstellen.**

`[read]` **Dann sieht es aus wie LumeOS** ? **aber es ist ein
anderer Aufbau: kein Tageswechsler, keine Modulnavigation, ein
Athlet statt eines Tages.**

`[cmd]` **G-399 hat denselben Befund im Kleinen:** **der
Referenz-Trenner steht jetzt zweimal.**

**c** ? **Beides.** `[read]` **Tokens ins Paket, Klassen
angleichen, Modus-Cookie teilen.**

## Was gemessen werden muss

`[read]` **Welche `cp-`-Klasse hat ein `v2-`-Gegenstueck?**

`[cmd]` **281 Zeilen `portal.css` gegen 1.184 `globals.css`** ?
**die Schnittmenge ist zu messen, nicht zu schaetzen.**

`[read]` **Und ob der Aufbau ueberhaupt derselbe sein soll** ?
**ein Arbeitsplatz ist kein Tagebuch.**

## Der Abstand, gemessen — nicht nur grafisch

Tom, 2026-09-08: *,,das hat nichts, gar nichts, nicht mal 1% etwas
mit meiner coaching plattform zu tun. weder grafisch noch
inhaltlich."*

`[read]` **Er hat recht, und der Orchestrator hat es nie
gemessen.**

### Der Kopf

`[cmd]` **Die Vorlage (`module-coach.jsx`, `CoachPortalStandalone`):**

    <div className="module-header">
      <div className="module-title-block">
        <span className="module-title">Coach Portal</span>
        <Pill variant="acc">separate platform</Pill>
        <Pill className="mono">coach.lumeos.app</Pill>
        <Pill>{n} athletes</Pill>
        <Pill><Icon name="alert"/>{m} alerts</Pill>
        <div className="module-sub">
          Coach workspace ? read-only on client data
          ? every call permission-checked</div>
      <div className="module-actions">
        <button className="btn">Broadcast</button>
        <button className="btn btn-primary">New plan</button>

`[cmd]` **Gebaut: `cp-kopf` mit Titel, zwei Pills, E-Mail
rechts.**

`[read]` **Kein `module-header`, keine Aktionen, kein
Untertitel.**

### Die Reiter

`[cmd]` **Die Vorlage traegt ZAEHLER je Reiter:**
`Athletes 3`, `Smart alerts 7`, `Rules 6`, `Plans 4`,
`Workflows 4`, `Programs 4`, `Messages 7`.

`[cmd]` **Gebaut: drei von sechzehn haben einen Zaehler.**

### Der Overview

`[cmd]` **Die Vorlage:**

    vier Kennzahlen MIT TREND
      Active athletes    3     +2 last 30d
      Median compliance  91%   30-day rolling   gruen
      Alerts open        7     3 athletes affected  gelb
      MRR ? 30d          4.820 +420 vs prior 30d

    Athletes needing attention
      Avatar, Name, Plan, "last 2d",
      Pill "2 alerts", Compliance farbig,
      KLICKBAR -> athleteDet-Modal

    Today's sessions logged   6 of 14 + Sparkline

`[cmd]` **Gebaut:**

    vier Zahlen OHNE Trend
      Aktive Athleten 2 von 3
      Check-ins eingereicht 1
      Alerts offen 2
      Vorschlaege offen 1

    Athleten: drei Namen mit Datum-Pill

`[read]` **Kein Avatar, keine Compliance, keine Farbe, kein Klick,
keine Sparkline.**

### Was das heisst

`[read]` **Der Unterschied ist nicht *,,noch nicht angebunden"*** ?
**es ist eine andere Anwendung.**

`[cmd]` **Die Vorlage zeigt einen Arbeitsplatz mit Kennzahlen,
Verlaeufen und Handlungen.** `[cmd]` **Gebaut ist eine Liste.**

`[read]` **Und der Orchestrator hat in G-391 und G-398 nur Karten
GEZAEHLT** ? **nie gemessen, ob eine Karte zeigt, was die Vorlage
zeigt.**

`[read]` **Eine Karte mit dem richtigen Titel und der falschen
Form gilt in beiden Auftraegen als *,,angebunden"*.**

## Was daraus folgt

**Der Abgleich muss auf Feldebene gehen, nicht auf Kartenebene.**

    je Karte  welche Felder zeigt die Vorlage?
              welche zeigt der Bau?
              welche fehlen, und warum

`[cmd]` **Beispiel `Athletes needing attention`:**

    Vorlage   Avatar, Name, Plan, letzte Sitzung,
              Alertzahl, Compliance farbig, Klick
    Bau       Name, Datum
    fehlt     5 von 7 Feldern

`[read]` **Das ist der Massstab, den beide Auftraege nicht
hatten.**

## Auftrag

Tom, 2026-09-08: *,,das hat nicht mal 1% etwas mit meiner coaching
plattform zu tun. weder grafisch noch inhaltlich."*

**Beauftragt am 2026-09-08.**

`[read]` **Der Orchestrator hat in G-391 und G-398 Karten
gezaehlt. Das war der Fehler.**

`[read]` **Dieser Auftrag misst FELDER.**

### 1 · Zuerst: die Vorlage vollstaendig lesen

`[cmd]` **`theme-v1/module-coach.jsx`, ab
`CoachPortalStandalone`** ? **und die sieben weiteren Dateien.**

`[read]` **Nicht die Kartentitel** ? **den Inhalt.**

**Je Karte der Vorlage:**

    welche Felder zeigt sie?
    welche Farben, Pills, Zaehler?
    ist sie klickbar, und wohin?
    hat sie eine Sparkline, ein Modal, eine Liste?

`[cmd]` **Beispiel, vom Orchestrator gemessen:**

    Athletes needing attention
      Vorlage: Avatar, Name, Plan, "last 2d",
               Pill "2 alerts", Compliance farbig,
               Klick -> athleteDet-Modal
      Bau:     Name, Datum
      fehlt:   5 von 7

`[read]` **So sieht die Messung aus, die dieser Auftrag will** ?
**je Karte, nicht je Reiter.**

### 2 · Der Kopf

`[cmd]` **Die Vorlage nutzt `module-header`,
`module-title-block`, `module-title-row`, `module-sub`,
`module-actions`.**

`[cmd]` **`apps/coach` nutzt `cp-kopf`** ? **eine eigene Fassung.**

`[read]` **Miss, ob `v2-module-header` aus `@lumeos/ui`
verfuegbar ist** ? **`apps/coach` laedt bereits
`@lumeos/ui/styles.css`.**

`[read]` **Wenn ja: umstellen.** `[read]` **Wenn nein: melden,
was fehlt.**

`[cmd]` **Und der Kopf traegt in der Vorlage vier Pills und zwei
Aktionen** ? `Broadcast`, `New plan`.

### 3 · Die Reiter tragen Zaehler

`[cmd]` **Vorlage:** `Athletes 3`, `Smart alerts 7`, `Rules 6`,
`Plans 4`, `Workflows 4`, `Programs 4`, `Messages 7`.

`[cmd]` **Gebaut: drei von sechzehn.**

`[read]` **Ein Zaehler, der nicht rechenbar ist, bleibt weg** ?
**aber messen, welche rechenbar sind.**

### 4 · Die Tokens

`[cmd]` **`apps/coach/src/app/tokens.css` ist eine KOPIE aus
`apps/web/src/styles/themes/lume.css`, Stand 2026-08-20.**

`[cmd]` **Der Kommentar in Zeile 1-7 schlaegt selbst vor, sie in
ein Paket zu ziehen.**

`[read]` **Miss, was seit dem 20.08. in `lume.css` dazugekommen
ist** ? **G-384 nennt elf Modul-Akzenttokens.**

`[read]` **`packages/ui` waere der Ort** ? **melden, bevor du es
tust, aber diesmal MIT der Messung, was auseinanderlaeuft.**

### 5 · Der helle Modus

`[cmd]` **`layout.tsx`: der Modus kommt aus
`prefers-color-scheme`, kein Cookie.**

`[cmd]` **`apps/web` liest einen Cookie.**

`[read]` **Wer zwischen den Anwendungen wechselt, sieht zwei
Produkte** ? **miss, ob der Cookie teilbar ist (dieselbe
Domaene?).**

### Abnahmebedingungen

    A1  je Karte der Vorlage: Felder der Vorlage /
        Felder im Bau / fehlend. Eine Tabelle.
        Nicht "angebunden" -- die ZAHL der Felder.
    A2  der Kopf: v2-module-header verfuegbar? Belegt.
        Wenn ja: umgestellt, Bildschirmfoto.
    A3  die Zaehler: 16 Reiter / davon rechenbar /
        davon gesetzt.
    A4  die Tokens: was ist seit 2026-08-20 auseinander?
        Liste, nicht "eine Kopie".
    A5  der Modus: Cookie teilbar? Gemessen.
    A6  ein Bildschirmfoto je Reiter, DUNKEL.
    A7  apps/coach 13/13, apps/web 1545 unveraendert.

### Was nicht zu tun ist

**`apps/web` NICHT anfassen.**
**Nichts anbinden, was Daten braucht, die es nicht gibt** ?
**aber die FORM darf gebaut werden, mit Attrappenvermerk.**
**Nichts in `packages/ui` ohne Meldung.**
Nicht committen, nicht stagen, nicht pushen.

### Der Dev-Server

`[cmd]` **Port 3220, Tom startet ihn.**
`[cmd]` **NIE `start`, `neustart`, `aufraeumen`.**

## Bericht

### A1 — je Karte die Felder, nicht der Titel

`[cmd]` **Gemessen 2026-09-10 durch Lesen der Vorlage, Zeile fuer
Zeile** — nicht per Muster: eine Regex ueber JSX zaehlt ein `<Pill>`
in einer Schleife als eins und verfehlt die Spalten einer Tabelle.

    Reiter      Karte                              Vorl.  Bau  fehlt
    ----------------------------------------------------------------
    overview    Active athletes (Kennzahl)             3    2      1
    overview    Median compliance (Kennzahl)           4    0      4
    overview    Alerts open (Kennzahl)                 4    3      1
    overview    MRR · 30d (Kennzahl)                   3    0      3
    overview    Athletes needing attention             7    4      3
    overview    Today's sessions logged                3    0      3
    overview    Recent achievements                    3    0      3
    athletes    Athletenliste                          7    3      4
    alerts      All open alerts                        6    4      2
    messages    Recent messages · all athletes         6    3      3
    consent     Freigaben je Athlet                    5    4      1
    autonomy    Autonomiestufen                        4    3      1
    workflows   Check-ins                              5    4      1
    onboard     Client onboarding                      4    2      2
    ----------------------------------------------------------------
    SUMME                                             64   32     32

`[cmd]` **`Athletes needing attention`: 7 Felder in der Vorlage, 4
gebaut** — die Messung des Orchestrators sagte 7 / 2. **Die zwei
Zusatzfelder sind in diesem Auftrag entstanden** (Avatar, Alert-Pill).

**Warum ein Feld fehlt — je Feld eingeordnet, nicht pauschal:**

    21x  keine-daten   es fehlt eine Spalte oder eine Tabelle
     7x  rechenbar     die Zeilen sind da, nur nicht gezeigt
     4x  form          reine Darstellung, jederzeit baubar

`[read]` **Die Dreiteilung ist der eigentliche Ertrag:** **sieben
Felder koennte man heute bauen**, ohne dass eine Tabelle entsteht.

**Was fehlt, je Grund (keine-daten):**

    3x  keine Compliance je Klient
    3x  keine Tabelle fuer Umsatz
    3x  keine Tabelle fuer Erfolge oder Meilensteine
    3x  keine Tabelle fuer Ablaeufe
    2x  keine Tabelle fuer Plaene
    1x  coach.alerts hat keine Spalte fuer Schweregrad
    1x  smartPriorityScore braucht severity und confidence
    1x  coach.client_consent_log ist leer (0 Zeilen)
    ... und der Vergleichszeitraum „letzte 30 Tage"

`[cmd]` **Die Tabelle steht als Modul in
`apps/coach/src/components/feld-abgleich.ts`** — nicht als Text im
Bericht, sondern als Daten, die ein Waechter prueft.

### A2 — der Kopf: alle sieben Klassen sind da

`[cmd]` **Gemessen in `packages/ui/src/styles/v2.css`, derselben
Datei, die `layout.tsx:3` als `@lumeos/ui/styles.css` laedt:**

    v2-module-header       10 Regeln
    v2-module-hero-lite     7
    v2-module-title         6
    v2-module-title-row     2
    v2-module-sub           2
    v2-module-actions       2
    v2-module-title-block   1

`[read]` **Es fehlte nichts** — das Portal hat sie nur nie benutzt.
`[cmd]` **Der sechzehnte A-71-Fall: Weg vorhanden, kein Aufrufer.**

**Umgestellt, am Schirm gemessen:**

    Kopf                v2-module-header v2-module-hero-lite
    Titel               "Coach Portal"
    Pills               separate platform | coach.lumeos.app |
                        2 athletes | 3 alerts
    Untertitel          Coach workspace · read-only on client data
                        · every call permission-checked
    Aktionen            Broadcast, New plan  (beide abgeschaltet)

`[cmd]` **Vier Pills und zwei Aktionen wie die Vorlage**
(`module-coach.jsx:910-920`). `[cmd]` **Bildschirmfoto:
`backup/g400-overview.png`.**

`[read]` **Die zwei Aktionen sind gebaut, aber ohne Ziel** — es gibt
weder einen Schreibweg fuer Rundnachrichten noch eine Plantabelle.
**Sie sind deshalb `disabled` und tragen ihren Grund im `title`**
(C-426: kein Bedienelement ohne Wirkung). `[cmd]` **Ein Waechter
prueft beides.**

### A3 — die Zaehler: 16 Reiter, 8 rechenbar, 8 gesetzt

    Reiter        rechenbar   gesetzt   woraus
    ---------------------------------------------------------
    athletes         ja         ja      relationships, aktiv
    alerts           ja         ja      alerts, status<>done
    workflows        ja         ja      checkins, submitted
    messages         ja         ja      messages, ungelesen
    consent          ja         ja      client_permissions
    autonomy         ja         ja      client_autonomy
    onboard          ja         ja      relationships, invited
    intervene        ja         ja      pending_actions, pending
    ---------------------------------------------------------
    analytics       nein       nein     keine Metriken-Tabelle
    rules           nein       nein     keine Tabelle fuer Regeln
    patterns        nein       nein     keine Tabelle fuer Vorhersagen
    plans           nein       nein     keine Tabelle fuer Plaene
    programs        nein       nein     keine Tabelle fuer Programme
    revenue         nein       nein     keine Tabelle fuer Umsatz
    team            nein       nein     keine Tabelle fuer Teams
    overview        —          nein     der Reiter selbst zaehlt nichts

`[cmd]` **Vorher vier gesetzt, jetzt acht.** `[cmd]` **Am Schirm
sichtbar: SIEBEN** — `onboard` steht bei null (keine offene
Einladung), und **eine Null wird gar nicht erst gezeichnet**
(`page.tsx:132`, `zaehler[t.id] ? … : null`).

`[read]` **Der Unterschied zwischen „gesetzt" und „sichtbar" ist
E-72:** eine Null in der Reiterleiste saehe aus wie ein Ergebnis.
**Gesetzt 8, sichtbar 7, und der Grund ist gemessen** — nicht die
Rechnung fehlt, sondern die Zeile.

`[read]` **Ein Zaehler, der nicht rechenbar ist, bleibt weg** — eine
erfundene Zahl in der Leiste waere schlimmer als keine. `[cmd]` **Ein
Waechter faellt, wenn `rules`, `plans` oder `programs` eine bekommen.**

### A4 — die Tokens: DREI Unterschiede, nicht „eine Kopie"

`[cmd]` **Token fuer Token gegen `lume.css` verglichen, beide Bloecke
getrennt:**

    [data-theme='lume']                       34 dort : 32 hier
    [data-theme='lume'][data-mode='light']    25 : 25, identisch

**Die drei Unterschiede, vollstaendig:**

    --kurve-aus      FEHLTE    v2.css:574 setzt
                               `transition: … var(--kurve-aus)`
    --kurve-beides   FEHLTE    das Gegenstueck
    --acc            ABSICHT   hier var(--acc-coach) statt
                               var(--acc-dash) — das Portal IST das
                               Coach-Modul

`[read]` **Der Auftrag nimmt an, es seien elf Modul-Akzenttokens
auseinandergelaufen (G-384).** `[cmd]` **Gemessen: alle elf sind
vollstaendig vorhanden** — `--acc-admin`, `--acc-buddy`,
`--acc-coach`, `--acc-dash`, `--acc-goals`, `--acc-medic`,
`--acc-mkt`, `--acc-nutri`, `--acc-recov`, `--acc-suppl`,
`--acc-train`. **Die Kopie war naeher am Original als angenommen.**

`[cmd]` **Die zwei Kurven sind nachgetragen.** `[read]` **Sie waren
kein Schoenheitsfehler:** `v2.css` setzt sie an zwei Stellen als
Uebergangsfunktion — **ohne das Token faellt der Uebergang stumm auf
den Vorgabewert zurueck.** **Kein Fehler, keine Warnung, nur eine
Animation, die anders aussieht als in `apps/web`.**

`[cmd]` **Ein Waechter liest jetzt aus `v2.css`, welche
`var(--kurve-*)` gebraucht werden, und prueft sie gegen
`tokens.css`** — er altert also mit, statt eine feste Liste zu
pflegen. **Dazu die elf Akzenttokens, aus `lume.css` gelesen.**

### A5 — der Modus: der Cookie ist NICHT teilbar

`[cmd]` **Gemessen:**

    apps/web    liest `lume-mode` serverseitig (layout.tsx:90-94)
                gesetzt in shell.tsx:79:
                  `${MODE_COOKIE}=${next}; path=/; max-age=…;
                   SameSite=Lax`
                -> KEIN `domain=`-Attribut

    apps/coach  liest keinen Cookie (layout.tsx:29)
                `prefers-color-scheme` vor dem ersten Paint

`[read]` **Ohne `domain=` ist ein Cookie hostgebunden.**
`[cmd]` **Und die Hosts sind verschieden:** `app.lumeos.app` gegen
`coach.lumeos.app` (`app-shell.tsx:36`). **Der Cookie erreicht das
Portal also nicht.**

`[read]` **Teilbar waere er mit `domain=.lumeos.app`** — das aendert
`apps/web`, und das verbietet dieser Auftrag. **Gemeldet, nicht
gebaut.**

`[cmd]` **Ortlich ist es anders:** 3200 und 3220 teilen den Host
`127.0.0.1`, dort WUERDE der Cookie ankommen — das Portal liest ihn
nur nicht.

`[read]` **Und genau das erklaert die hellen Fotos aus G-398:** der
kopflose Browser meldet standardmaessig hell, das Portal folgt ihm.
**Mit `colorScheme: 'dark'` ist es dunkel** — gemessen:
`data-mode="dark"`, Hintergrund `oklch(0.155 0.005 270)`.

### A6 — sechzehn Fotos, dunkel

`[cmd]` **`backup/g400-<reiter>.png`**, alle mit
`colorScheme: 'dark'` aufgenommen, angemeldet als
`coach@lumeos.app`.

`[cmd]` **Belegt, nicht behauptet:** das Skript liest vor dem ersten
Foto `data-mode` und die Hintergrundfarbe aus dem gerenderten
Dokument. **`dark` / `oklch(0.155 0.005 270)`.**

`[cmd]` **0 Konsolenfehler, 0 nackte Nullen** ueber alle sechzehn
Reiter.

### A7 — Tests

`[cmd]` **`apps/coach`: 18 pass / 0 fail** — fuenf neue Waechter
(vorher 13). `[cmd]` **tsc sauber in beiden Anwendungen.**

`[cmd]` **`apps/web`: 1544 pass / 1 fail** — und **der Fehlschlag ist
nicht meiner:**

    not ok 800 — G-317/Z. 371: die eine Zeile fasst Dauer,
                 Start und Herkunft
    Datei:       apps/web/src/lib/nutrition/__tests__/
                 plan-kopfkarte-zeilen.test.ts

`[cmd]` **Belegt:** `git diff HEAD -- apps/web docs/spezifikation
packages` ist **leer** — die fuenf Dateien, die dieser Test liest
(`module-nutrition-spec.jsx`, `plans-echt.tsx`,
`plan-eintraege.tsx`, `plan-lesen.ts`, `primitives.tsx`), sind
unberuehrt. `[cmd]` **Meine fuenf geaenderten Dateien liegen alle in
`apps/coach`.**

`[read]` **Der Auftrag nennt 1545 als Sollwert** — der Fehlschlag
bestand vorher und ist ein eigener Punkt.

**Sabotageprobe, je Waechter einzeln:**

    Kopf wieder cp-kopf                -> ROT
    eine Pill entfernt                 -> ROT
    Untertitel entfernt                -> ROT
    Knopf wieder anklickbar            -> ROT
    erfundener Zaehler fuer rules      -> ROT
    rechenbarer Zaehler entfernt       -> ROT
    Kurventoken entfernt               -> ROT
    Akzenttoken entfernt               -> ROT
    Feld ohne Grund im Abgleich        -> ROT

**Alle zurueckgenommen, 18/18 gruen.**

`[cmd]` **Die Akzenttoken-Probe war zunaechst gruen** —
`--acc-recov` steht ZWEIMAL in `tokens.css` (Nacht- und Tagblock),
und `replace(…, 1)` traf nur das erste. `[read]` **Das war mein
Messfehler, kein blinder Waechter**: mit allen Vorkommen wurde er
rot. **Die Probe belegt seither selbst, dass die Sabotage ankam**,
bevor sie ein Urteil faellt.

### Was gebaut ist — und was bewusst nicht

**Gebaut, weil die Daten es tragen:**

    Kopf              v2-module-header, 4 Pills, Untertitel,
                      2 Aktionen (abgeschaltet, mit Grund)
    Zaehler           vier weitere: consent, autonomy, onboard,
                      intervene
    Kennzahlen        die dritte Zeile je Kachel — „n Athleten
                      betroffen", „von n gesamt", „n eingeladen"
    Athletenzeile     Avatar aus Initialen (wie `avatar: "LB"`),
                      Alert-Pill je Klient

**Nicht gebaut, mit Grund:**

    Compliance        keine Spalte, in keiner Tabelle
    Plan je Athlet    keine Plantabelle
    MRR / Revenue     Geld gehoert zum Marketplace (F-06 T8)
    Sparkline         rechenbar, aber sie braucht eine
                      Tagesreihe aus training.workout_sessions --
                      ein Leseweg, den dieser Auftrag nicht
                      anlegen darf
    Farbe der Zahl    `KPI.deltaVariant` kennt nur `pos` und `neg`
                      (primitives.tsx:397) -- die Vorlage faerbt
                      gelb. Das waere eine Aenderung in
                      `packages/ui`: GEMELDET, nicht gebaut.

### Zwei Punkte fuer `packages/ui`

`[read]` **Beide gemeldet, keiner gebaut** — der Auftrag verlangt
die Meldung.

**1 — `KPI.deltaVariant` braucht `warn`.** `[cmd]` **Heute nur `pos`
und `neg`** (`primitives.tsx:397`). **Die Vorlage faerbt „Alerts
open" gelb**, und das ist mit dem heutigen Baustein nicht
darstellbar.

**2 — Die Tokens gehoeren ins Paket.** `[cmd]` **Der Kommentar in
`tokens.css:1-7` schlaegt es selbst vor.** `[read]` **Nach dieser
Messung ist der Abstand klein** (drei Tokens, einer davon Absicht)
— **aber er entsteht immer wieder neu, solange zwei Dateien
dieselbe Wahrheit tragen.** `[cmd]` **Der neue Waechter faengt es
jetzt wenigstens ab.**

### Was nicht angefasst ist

**1 — `apps/web`:** `git diff HEAD` ist leer.
**2 — `packages/ui`:** unberuehrt, beide Befunde gemeldet.
**3 — `supabase/`:** die zwei geaenderten Dateien sind Codex' C-456.
**4 — Nichts angebunden**, was Daten braucht, die es nicht gibt.

### Neustart

`[read]` **Nicht noetig** — nur `apps/coach/src`, das laedt heiss
nach. `[cmd]` **`tokens.css` und `portal.css` sind Stylesheets der
App, keine Paketdateien.**

## Abnahme

_(vom Orchestrator)_
