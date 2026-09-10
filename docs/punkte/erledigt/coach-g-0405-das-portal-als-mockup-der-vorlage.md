---
nr: G-405
typ: feature
modul: coach
schwere: hoch
angelegt: 2026-09-10
braucht: []
kind_von: G-404
entscheidung: null
agent: claudecode
beauftragt: 2026-09-10
erledigt: 2026-09-08
commit: eeab96ae
beruehrt:
  dateien:
    - apps/coach/src/components/portal-draft-nav.ts
    - apps/coach/src/components/portal-draft-schale.tsx
    - apps/coach/src/components/portal-draft-kontext.ts
    - apps/coach/src/components/portal-draft-kontextspalte.tsx
    - apps/coach/src/components/portal-draft-seite.tsx
    - apps/coach/src/app/portal.css
    - apps/coach/src/app/page.tsx
    - apps/coach/src/lib/__tests__/portal-draft.test.ts
    - tools/_g405-schirm.mjs
zahlen:
  gemessen: 2026-09-10
  bereiche: 11
  unterpunkte: 35
  pills: 30
  aktionen: 17
  attrappen: 28
  proben: 45
---

# G-405 — Das Portal als Mockup der Vorlage

## Auftrag

Tom, 2026-09-10:

> wie waers wenn du das nun als mockup erzeugen laesst und nicht
> irgend eine abhandlung davon. ich habe den direkten vergleich.

Die Vorlage liegt im Repo:
`docs/spezifikation/10-plattform/design-system/coach-portal-draft/`,
sechzehn Coach-Module. Massgeblich ist
`module-coach-portal-shell.jsx`, 296 Zeilen.

> Was Daten hat, wird angebunden — was nicht, traegt den
> Attrappenvermerk mit dem Namen der fehlenden Tabelle. Wie in
> G-398.

Verbote: *„apps/web NICHT anfassen. Nichts in supabase/."* /
*„DER DEV-SERVER: Port 3220 laeuft. Nie start, neustart,
aufraeumen."* / *„Nicht committen."*

## Bericht

### Was gebaut ist

`?draft=<bereich>` zeigt die Schale der Vorlage. **Die bestehende
Fassung bleibt Wort fuer Wort, was sie war** — `?bereich=` ist
unveraendert, kein Lesezeichen wird ungueltig. Ein Umbau haette das
Gebaute ersetzt, und dann gaebe es nichts zu vergleichen.

### A1 — vier Gruppen, elf Bereiche, die Badges

`[cmd]` **Am Schirm gemessen** (`tools/_g405-schirm.mjs`, nicht im
Quelltext gezaehlt):

    Gruppen in der Leiste         5   (4 aus CP_NAV + Workspaces)
    Eintraege in der Leiste      12   (11 Bereiche + LumeOS)
    Badges                        4

`[cmd]` **Die Badges tragen GEMESSENE Zahlen, nicht die der
Vorlage:**

    Vorlage    gemessen   Quelle
    14         2          relationships, coach_id=…001, status=active
    7          1          checkins, status=submitted
    7 warn     3          alerts, status<>done
    12         1          messages, read_at is null, sender<>ich

`[cmd]` **Die Rohzahl der Tabelle waere falsch gewesen:**
`coach.relationships` fuehrt **6 Zeilen — verteilt auf ZWEI Coaches
zu je drei.** `[read]` **Der angemeldete Coach hat drei, davon zwei
aktiv.** **6 haette alle Coaches gezaehlt, nicht diesen.**

### A2 — 35 Unterpunkte, im Inhalt

`[cmd]` **Am Schirm gezaehlt, je Bereich:**

    athletes  8    checkins  3    assist   13    plans     3
    library   2    alerts    2    analytics 4
    overview  0    calendar  0    inbox     0    team      0
                                              ---------------
                                              Summe      35

`[cmd]` **Sie stehen IM INHALT** (`.dp-inhalt .v2-tabs`), **nicht in
der Leiste** — die Regel aus Zeile 2 der Vorlage: *„Sidebar carries
parents only."* `[cmd]` **Eine Probe misst die Wirkung:** kein Kind
darf als Bereich auftauchen.

### A3 — der Modulkopf je Bereich

`[cmd]` **Gemessen: 30 Pills, 17 Aktionen** — genau die Zahlen aus
`CP_META`.

`[read]` **Wo eine Pill messbar ist, wird sie ersetzt** und traegt
`data-echt` samt Titel *„aus der Datenbank gezaehlt"*. `[read]`
**Wo nicht, bleibt der Text der Vorlage** und sein Titel sagt
*„aus dem Draft (CP_META) — es gibt keine Daten dafuer"*.

### A4 — die Kontextspalte

`[cmd]` **306 px, gemessen in allen elf Bereichen.** `[cmd]` **Sie
kennt den Bereich** — 11 Abschnitte aus `OPS_CTX`, je mit Nachricht,
Zustand, Schnellaktionen, Erkenntnissen und vier Kennzahlen (44
Aktionen, 26 Erkenntnisse, 44 Kennzahlen).

`[cmd]` **Der Schalter wurde gedrueckt, nicht behauptet:**

    vor:   1 Spalte, Raster 222px 1072px 306px
    nach:  0 Spalten, Raster 222px 1378px

### A5 — die Bilder

`docs/bilder/g405/` — elf Bereiche, dunkel
(`colorScheme: 'dark'`), dazu `overview-kontext-zu.png` und
`messung.json` mit allen Zahlen.

### A6 — was NICHT gebaut werden konnte

`[cmd]` **28 Attrappen, 13 verschiedene Gruende.** Nach Gewicht:

    13x  keine Tabelle fuer den Assistenten — weder Entwuerfe
         noch Gedaechtnis noch Kosten
         (der ganze Bereich assist, alle 13 Unterpunkte)

     3x  keine Tabelle fuer Plaene oder Programme
         (plans, programs, builder)

     2x  keine Tabelle fuer eigene Uebungen oder Rezepte
         (lib-ex, lib-meal)

     1x  keine Tabelle fuer freie Notizen je Klient —
         coach.checkins.coach_notes gibt es je Check-in
     1x  keine Adherence je Klient — services/adherence.ts rechnete
         sie im Vorgaenger aus Plan gegen Ist; es gibt weder Plan
         noch Rechnung
     1x  coach.checkin_templates steht und wird gelesen (2 Zeilen) —
         es fehlt der SCHREIBWEG
     1x  keine Tabelle fuer Coach-Regeln
     1x  keine Tabelle fuer Kennzahlen je Coach — Retention und
         Antwortzeit waeren Personennoten (T7)
     1x  keine Tabelle fuer Vorhersagen — coach.checkins traegt
         Ist-Werte, kein Modell
     1x  keine Tabelle fuer Umsatz — Geld gehoert zum Marketplace
         (F-06 T8)
     1x  keine Tabelle fuer Termine oder einen Kalender
     1x  keine Tabelle fuer Benachrichtigungen — coach.messages
         fuehrt Nachrichten je Beziehung, nicht Ereignisse
     1x  keine Tabelle fuer das Team und kein Pruefprotokoll —
         coach fuehrt 15 Tabellen, keine davon nennt Mitarbeiter

`[read]` **Der groesste Einzelbefund ist der Assistent:** dreizehn
Unterpunkte, kein einziger mit einer Tabelle.

**Zwei Zahlen bleiben aus der Vorlage stehen, obwohl Daten da sind:**
`6 full access` und `6 of 14`. `[cmd]` **`coach.client_permissions`
fuehrt die Rechte je MODUL** (`training_visibility`,
`medical_visibility`, … sieben Spalten), **nicht als einen Schalter.**
`[read]` **„Voller Zugriff" waere eine erfundene Regel** — welche der
sieben Spalten muessten dafuer `full` sein? **Nicht entschieden, also
nicht gerechnet.** `TabConsent` zeigt die Rechte je Modul richtig.

### A7 — apps/web unberuehrt

    apps/web Proben     1545 / 1545 gruen
    apps/web Zeilen     0 geaendert  (git diff --stat)

### Zehn Unterpunkte sind angebunden

    athletes, record, onboard, autonomy, autohist, consent,
    messages, workflows, alerts, intervene

`[cmd]` **Jede dahinterliegende Tabelle traegt Zeilen** (gemessen
2026-09-10): relationships 6, messages 6, alerts 6, checkins 6,
client_permissions 4, client_autonomy 4, pending_actions 2,
action_log 1.

### Die Proben

`[cmd]` **45 Proben gruen** (33 alt + 12 neu).

`[cmd]` **Acht Gegenproben, jede einzeln verifiziert** — dass die
Sabotage in der Datei ankam UND dass sie danach zurueckgesetzt war:

    Unterpunkt faellt weg          -> ROT (die 35 Unterpunkte)
    Unterpunkt umbenannt           -> ROT (die 35 Unterpunkte)
    Attrappe verliert den Grund    -> ROT (jede Attrappe nennt …)
    Bereich verliert Einordnung    -> ROT (jeder Bereich ohne …)
    Raster veraendert              -> ROT (die Schale traegt …)
    Schalter verliert die Wirkung  -> ROT (der Schalter hat …)
    Kontextspalte verliert Bereich -> ROT (die Kontextspalte kennt …)
    Pill verschwindet              -> ROT (Pills und Aktionen)

`[read]` **Die Erwartungen stehen nicht in der Probe** — sie werden
aus `module-coach-portal-shell.jsx` gelesen. **Aendert jemand die
Vorlage, aendert sich die Erwartung mit.**

### Zwei Befunde am Schirm, die kein Zaehler gefunden haette

`[cmd]` **1. Unter der gemessenen Pill „2 active" stand
„14 active clients".** `[read]` **Die Unterzeile kommt aus
CP_SECTIONS, und ich hatte nur die Pills ersetzt** — eine gemessene
und eine erfundene Zahl, zwei Zeilen uebereinander. **Genau eine der
elf Unterzeilen traegt eine Zahl.** Berichtigt.

`[cmd]` **2. Die 13 Unterreiter des Assistenten brachen auf DREI
Zeilen um.** `[cmd]` **`.v2-tabs` im Paket hat kein `overflow`.**
Unter `.dp-inhalt` scrollen sie jetzt waagerecht wie in der Vorlage.

`[read]` **Beide waren in `messung.json` unsichtbar** — die Zahlen
stimmten in beiden Faellen.

## Ein Befund im Paket — nicht berichtigt

`[cmd]` **`packages/ui/src/styles/v2.css` definiert `.v2-empty`
ZWEIMAL:**

    :1598   display: flex        (eine Zeile: Symbol, Titel, Grund)
    :2078   text-align: center   (ohne display zurueckzusetzen)

`[read]` **Die zweite Regel gewinnt, die Zeilenrichtung bleibt** —
darum stand der Attrappengrund NEBEN dem Titel und las sich wie eine
Bildunterschrift.

`[read]` **Nicht im Paket berichtigt:** es gehoert allen Apps, und
apps/web haengt an der heutigen Darstellung. `[cmd]` **Unter
`.dp-inhalt` ueberschrieben**, damit es nur die Draft-Fassung trifft.

**Das ist eine Meldung, keine Aenderung** — Tom entscheidet, ob das
Paket berichtigt wird.

## Neustart

`[read]` **Nicht noetig** — nur `apps/coach/src` und eine CSS-Datei,
beides laedt heiss nach. **Kein `packages/ui`, keine
Umgebungsvariable, keine Abhaengigkeit.**

## Abnahme

**2026-09-08, Orchestrator. Nachgemessen.**

    A1  11 Bereiche / 4 Gruppen (+Workspaces)
    A2  35 Unterpunkte, im INHALT
    A3  30 Pills / 17 Aktionen
    A4  Raster 222px 1072px 306px, Schalter gedrueckt
    A5  zwoelf Bildschirmfotos
    A6  28 Attrappen, 13 Gruende
    A7  apps/web 1545 unveraendert

`[cmd]` **Selbst gemessen: 12 Bilder in `docs/bilder/g405/`, 20
Vorlagendateien im Repo, `apps/coach` 45/45 gruen.**

`[cmd]` **`athletes.png` angesehen:** **vier Gruppen, acht
Unterpunkte in der Inhaltsleiste, Kontextspalte mit Ops-Assistent,
Zahlen aus der Datenbank.**

### Der Nebeneinanderbau war richtig

> *,,Die bestehende Fassung ist unangetastet: `?bereich=` ist Wort
> fuer Wort, was sie war. Ein Umbau haette das Gebaute ersetzt, und
> dann gaebe es nichts zu vergleichen."*

`[read]` **Tom sagte: *,,ich habe den direkten vergleich"*** ?
**genau dafuer.**

### Die Badges tragen GEMESSENE Zahlen

`[cmd]` **Vorlage 14/7/7/12, gebaut 2/1/3/1.**

> *,,Die Rohzahl der Tabelle waere falsch gewesen:
> `relationships` fuehrt 6 Zeilen, aber verteilt auf zwei Coaches
> zu je drei ? 6 haette alle gezaehlt, nicht diesen."*

`[read]` **Derselbe Fehler wie *Today's sessions* in G-398** ?
**eine Tabelle im Leseweg ist nicht dasselbe wie die richtige
Zahl.** `[read]` **Diesmal hat er es vorher gesehen.**

### A6 — der Assistent ist der groesste Befund

`[cmd]` **Dreizehn Unterpunkte, KEIN EINZIGER mit einer Tabelle.**

`[read]` **Und er hat in `docs/specs/HumanCoach/` keine
Entsprechung** ? **die Spec kennt zwoelf Tabs, keinen
Assistenten.**

`[cmd]` **Dann Plaene und Programme (3), Bibliothek (2), je einer
fuer Regeln, Kalender, Team, Umsatz, Vorhersagen.**

### Zwei Zahlen hat er stehen lassen

`[cmd]` **`6 full access` und `6 of 14`.**

> *,,`client_permissions` fuehrt die Rechte je Modul (sieben
> Spalten), nicht als einen Schalter ? welche muessten fuer
> *voller Zugriff* `full` sein? Nicht entschieden, also nicht
> gerechnet."*

`[read]` **Eine Zahl, die eine Definition braucht, wird nicht
geschaetzt.**

### Zwei Befunde, die nur das Bild zeigte

`[cmd]` **Unter der Pill *2 active* stand *14 active clients*** ?
**genau eine der elf Unterzeilen traegt eine Zahl.**

`[cmd]` **Und die 13 Assistenten-Reiter brachen auf drei Zeilen
um** ? **`.v2-tabs` im Paket hat kein `overflow`.**

`[read]` **Dieselbe Lehre wie `--surface-1` in G-400.**

### Der Paketbefund, gemeldet statt geaendert

`[cmd]` **`v2.css` definiert `.v2-empty` ZWEIMAL** ? **`:1598`
setzt `display: flex`, `:2078` setzt `text-align: center` ohne
`display` zurueckzusetzen.**

`[read]` **Er hat es unter `.dp-inhalt` ueberschrieben** ?
**damit es nur die Draft-Fassung trifft.**

> *,,Das Paket gehoert allen Apps, und `apps/web` haengt an der
> heutigen Darstellung."*

### Und die Waechter lesen die Vorlage

> *,,Die Erwartungen stehen nicht in der Probe, sie werden aus
> `module-coach-portal-shell.jsx` gelesen: aendert die Vorlage
> sich, aendert sich die Erwartung mit."*

`[read]` **Ein Waechter mit fest eingetragener Zahl veraltet** ?
**dieser nicht.**

**Abgenommen.**
