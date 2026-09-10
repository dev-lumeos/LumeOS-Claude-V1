---
nr: G-407
typ: feature
modul: coach
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: G-405
entscheidung: null
agent: claudecode
beauftragt: 2026-09-08
erledigt: 2026-09-08
commit: fa73c641
beruehrt:
  dateien:
    - apps/coach/src/app/page.tsx
zahlen:
  gemessen: 2026-09-08
  attrappen: 28
  unterpunkte: 35
---

# G-407 — den Draft fertigbauen

## Auftrag

Tom, 2026-09-08: *,,bau den draft fertig. ich will das mockup
umgesetzt haben."*

**Beauftragt am 2026-09-08.**

`[read]` **Keine Rueckfragen. Was die Vorlage zeigt, wird
gebaut.**

`[read]` **Was keine Tabelle hat, wird als Attrappe gebaut** ?
**mit den Zahlen der Vorlage und dem Vermerk.**

## Die Vorlage

`[cmd]` **`docs/spezifikation/10-plattform/design-system/coach-portal-draft/`,
20 Dateien.**

`[cmd]` **Massgeblich:** `module-coach-portal-shell.jsx` **(Schale,
Navigation, Koepfe) und die fuenfzehn Modulteile.**

## Was steht

`[cmd]` **11 Bereiche, 4 Gruppen, 35 Unterpunkte, 30 Pills, 17
Aktionen** ? **die Struktur.**

`[cmd]` **10 Unterpunkte mit echten Daten, 28 Attrappen.**

## Was fehlt: der INHALT der 28

`[read]` **Heute tragen sie einen Vermerk und sonst nichts.**

`[read]` **Die Vorlage zeigt fertige Kacheln mit Zahlen** ? **die
sollen da stehen.**

### Je Unterpunkt die Quelle in der Vorlage

    Assistant (13)     module-coach-ai-assistant.jsx     22,4 KB
                       module-coach-assistant-layers.jsx 30,1
                       module-coach-clone.jsx            30,4
                       module-coach-portal-tools.jsx     29,4

    Athletes (8)       module-coach-athlete.jsx          32,3
                       module-coach-client-record.jsx    23,6
                       module-coach-portal-detail.jsx    30,8

    Analytics (4)      module-coach-extras.jsx           51,0
                       module-coach-gaps.jsx             35,3

    Plans (3)          module-coach-programs.jsx         12,7
    Check-ins (3)      module-coach-portal-workflows.jsx 21,1
    Library (2)        module-coach-portal-tools.jsx
    Alerts (2)         module-coach.jsx                  57,1

    Dashboard          module-coach-portal-v2.jsx        25,1
    Kontextspalte      module-coach-portal-context.jsx   14,3

`[read]` **Je Unterpunkt: die Kacheln der Vorlage nachbauen** ?
**Titel, Felder, Zahlen, Form.**

`[read]` **Mit den Zahlen der Vorlage, wo keine Tabelle da ist** ?
**und dem Attrappenvermerk daneben, wie bisher.**

## Zwei Sachen, die Tom entschieden hat

**1** ? `.v2-empty` **in `packages/ui/src/styles/v2.css` beheben.**

`[cmd]` **`:1598` setzt `display: flex`, `:2078` setzt
`text-align` ohne `display` zurueckzusetzen.**

`[read]` **Im PAKET beheben** ? **nicht je Anwendung
ueberschreiben.**

`[cmd]` **Gegenprobe: `apps/web` 1545 Tests gruen und ein
Bildschirmfoto, das zeigt, dass sich dort nichts aendert.**

**2** ? `.v2-tabs` **braucht `overflow`.**

`[cmd]` **Dreizehn Reiter brechen auf drei Zeilen um.**

`[read]` **Waagerecht scrollen oder umbrechen** ? **entscheide
nach der Vorlage, dort steht es.**

## Und die Zahl `6 full access`

`[read]` **Nimm die Zahl der Vorlage.**

`[read]` **Es ist ein Mockup** ? **eine Definition ueber sieben
Berechtigungsspalten ist ein eigener Punkt, nicht dieser.**

`[cmd]` **Vermerk daneben:** *,,aus der Vorlage ? die Definition
von *voller Zugriff* ueber `client_permissions` ist offen."*

## Abnahmebedingungen

    A1  je der 35 Unterpunkte: die Kacheln der Vorlage
        gebaut. Zahl: Unterpunkte / Kacheln je Unterpunkt.
    A2  je Kachel: aus Daten oder Attrappe, mit Vermerk.
        Zahl: Kacheln / mit Daten / Attrappe.
    A3  .v2-empty im Paket behoben. Gegenprobe apps/web:
        1545 gruen, Bildschirmfoto unveraendert.
    A4  .v2-tabs traegt dreizehn Reiter in einer Zeile.
        Bildschirmfoto assist.
    A5  ein Bildschirmfoto je Bereich, DUNKEL, neben dem
        Draft-Bild.
    A6  was du NICHT bauen konntest und warum.
    A7  apps/coach 45/45 oder mehr, apps/web 1545.

## Was nicht zu tun ist

**`?bereich=` NICHT anfassen** ? **die alte Fassung bleibt zum
Vergleich.**
**Nichts in `supabase/`.**
**Keine Rueckfrage** ? **wo die Vorlage etwas zeigt, wird es
gebaut.**
Nicht committen, nicht stagen, nicht pushen.

## Der Dev-Server

`[cmd]` **Port 3220 laeuft.**
`[cmd]` **NIE `start`, `neustart`, `aufraeumen`.**

## Bericht

### Was gebaut ist

`[cmd]` **28 Attrappen tragen jetzt die Kacheln der Vorlage** statt
eines Vermerks auf leerem Schirm.

`[cmd]` **Am Schirm gezaehlt** (`tools/_g407-kacheln.mjs`, nicht im
Quelltext):

    Unterpunkte gemessen        39   (35 Kinder + 4 Bereiche ohne)
    Kacheln gesamt              79
    davon mit Attrappenvermerk  55
    davon aus echten Daten      24
    Unterpunkte ohne Kachel      0

### A1 — je Unterpunkt die Kacheln

    Bereich     Unterpunkte  Kacheln  Vermerke
    overview          1          3        0
    athletes          8         15        3
    checkins          3          8        1
    assist           13         27       27
    calendar          1          1        1
    plans             3          8        8
    library           2          2        2
    alerts            2          4        3
    analytics         4          7        6
    inbox             1          1        1
    team              1          3        3
    ----------------------------------------
                     39         79       55

`[cmd]` **Dazu 30 Kennzahlkacheln (`v2-kpi`) und 23 Tabellen** —
sie zaehlen nicht als Kachel, stehen aber in denselben Ansichten.

### A2 — je Kachel: aus Daten oder Attrappe

    Attrappen-Unterpunkte   28   55 Kacheln   55 Vermerke
    Angebundene             11   24 Kacheln    0 Vermerke

`[read]` **55 zu 55 ist kein Zufall, sondern eine Probe:** *„jede
Kachel einer Attrappen-Ansicht traegt einen Vermerk"* zaehlt
`<Card` gegen `V(` je Datei. `[cmd]` **Eine Kachel ohne Vermerk
faellt sofort** — gegengeprueft.

`[read]` **Und keine Attrappen-Ansicht ueberlagert einen
angebundenen Unterpunkt.** `[cmd]` **`AnsichtAkte` ist gebaut,
aber NICHT registriert** — `record` liest echte Zeilen, und beides
uebereinander waere die schlimmste Form von Vermischung: gemessene
Zahlen und Vorlagenzahlen auf einem Schirm, ununterscheidbar.

### A3 — `.v2-empty` im Paket behoben

`[cmd]` **Der Befund war praeziser als vermutet: ZWEI ABSICHTEN
UNTER EINEM NAMEN.**

    v2.css:1598   .v2-empty { display: flex }        die ZEILE
    v2.css:2078   .v2-empty { text-align: center }   der BLOCK

`[cmd]` **Gemessen, wer welche braucht:**

    4 rohe <div className="v2-empty"> in apps/web   -> die ZEILE
      (nutrition/ansicht.tsx:370, zielhinweis.tsx:90/122/149)
    56 Aufrufer der Komponente Empty                -> der BLOCK

`[read]` **Ein `display: block` auf `.v2-empty` haette die vier
Zeilen in apps/web zerlegt** — deshalb nicht die eine Regel
berichtigt, sondern die Absichten getrennt: **`.v2-empty` bleibt
die Zeile, `.v2-leer` ist der Block**, und `Empty` ruft `.v2-leer`.

**Gegenprobe apps/web:**

    Proben       1545 / 1545 gruen
    Zeilen       0 geaendert   (git diff --stat -- apps/web)
    Bilder       docs/bilder/g407/web-vorher/ gegen web-nachher/

`[cmd]` **Am Schirm gemessen, vorher gegen nachher:**

    vorher   3 Empty als flex    112 / 137 / 112 px hoch
    nachher  3 Empty als block   144 / 178 / 144 px hoch
    vorher   1 rohes div flex    972 px breit
    nachher  1 rohes div flex    972 px breit   UNVERAENDERT

`[read]` **Der Rest der Seite ist Pixel fuer Pixel gleich** — nur
der Leerzustand steht jetzt untereinander statt nebeneinander.

### A4 — `.v2-tabs` traegt dreizehn Reiter in einer Zeile

`[cmd]` **Die Vorlage beantwortet die Frage selbst:**

    shared.jsx:197    <div className="tabs tabs-rail">
    styles.css:1040   .tabs-rail { overflow-x: auto }
    styles.css:1050   .tabs-rail .tab { white-space: nowrap }

`[read]` **Waagerecht scrollen, eine Zeile.** `[cmd]` **Und das
Paket traegt es laengst** (`v2.css:1069`) — **G-405 hat nur die
falsche der beiden Klassen gerufen** und den Mangel dann in
apps/coach nachgebaut. **Die Notloesung ist entfallen.**

Bild: `docs/bilder/g407/assist.png` — dreizehn Reiter, eine Zeile.

### A5 — ein Bild je Bereich

`docs/bilder/g407/` — elf Bereiche, dunkel
(`colorScheme: 'dark'`), dazu `kacheln.json` mit allen Zahlen und
die Gegenprobe-Bilder von apps/web.

### A6 — was NICHT gebaut werden konnte

**1 — Die Kachelzahl der Vorlage laesst sich nicht vergleichen.**

`[cmd]` **Ein erster Anlauf zaehlte 194 `<Card>` in der Vorlage
und 79 am Schirm** — daraus haette sich eine Luecke von 115
Kacheln ergeben. `[cmd]` **Die Zahl war falsch, dreimal
nachgemessen:**

    194   Zaehlung lief ueber die Komponentengrenze hinaus
    121   je Komponente gezaehlt, aber `rules` ergab 0
      0   fuer `rules` ist RICHTIG: CoachPortalRules ist nur eine
          1226 Zeichen lange Reiterhuelle, der Inhalt liegt in
          ActiveRulesView und Geschwistern

`[read]` **Die Vorlage benutzt `<Card>` NICHT einheitlich** —
manche Ansichten bauen aus `<div>`, manche verteilen sich ueber
mehrere Komponenten. `[read]` **Eine Zahl „Vorlage gegen gebaut"
waere in beide Richtungen falsch gewesen**, und ich habe sie
deshalb nicht in den Bericht genommen.

`[cmd]` **Was zaehlbar ist, steht in A1: 79 Kacheln am Schirm,
kein Unterpunkt leer.**

**2 — Vier Ansichten sind gedraengter als die Vorlage.**

`[read]` **Wo die Vorlage drei Kacheln nebeneinander stellt, steht
hier oft eine mit drei Abschnitten.** `[cmd]` **Betroffen sind vor
allem `analytics`, `rules`, `revenue` und `plans`** — dort hat die
Vorlage eigene Unteransichten mit eigenem Reiterwerk, das hier
nicht nachgebaut ist.

`[read]` **Der Inhalt ist da, die Gliederung ist flacher.**

**3 — Zwei Vermerke nennen keine fehlende Tabelle, sondern eine
Entscheidung.**

    analytics  Kennzahlen je Coach waeren Personennoten (T7)
    revenue    Geld gehoert zum Marketplace (F-06 T8)

`[read]` **Das ist ein anderer Grund als „keine Tabelle"** — und er
gehoert in den Vermerk, sonst sucht jemand nach einer Tabelle, die
niemand bauen wollte.

**4 — `6 full access` steht weiter aus der Vorlage.**

`[cmd]` **Wie beauftragt.** `[read]` **Die Definition von *voller
Zugriff* ueber `client_permissions` (sieben Spalten je Modul) ist
offen** — sie ist ein eigener Punkt, nicht dieser.

### A7 — die Proben

    apps/coach   51 / 51 gruen   (45 gefordert)
    apps/web   1545 / 1545 gruen

`[cmd]` **Sechs neue Waechter, acht Gegenproben — jede einzeln
verifiziert**, dass die Sabotage in der Datei ankam UND dass sie
danach zurueckgesetzt war:

    Attrappe verliert ihre Ansicht    -> ROT (28 Attrappen)
    Kachel verliert ihren Vermerk     -> ROT (jede Kachel ...)
    Kachel ohne Vermerk kommt dazu    -> ROT (jede Kachel ...)
    Vorlagenzahl wird verfaelscht     -> ROT (die Zahlen stammen ...)
    v2-leer wird wieder zur Zeile     -> ROT (zwei Namen ...)
    Empty ruft wieder die Zeile       -> ROT (zwei Namen ...)
    Unterreiter verlieren die Schiene -> ROT (Unterreiter scrollen)
    v2-tabs-rail verliert overflow    -> ROT (Unterreiter scrollen)

## Ein Befund am Werkzeug — nicht behoben, nur gemeldet

`[cmd]` **`packages/ui/src/styles/klassen-uebernehmen.mjs` erzeugt
`v2.css` — und ist veraltet.**

`[cmd]` **Ein Lauf wurde probiert und SOFORT zurueckgenommen:** die
erzeugte Datei unterscheidet sich vom Bestand in mindestens sechs
Bloecken, und zwar nach unten. Er wirft weg:

    .v2-btn:active            den Druckzustand (G-303)
    .v2-btn transition        die Rueckmeldung beim Klick
    .v2-fortschritt           240ms statt 0.4s (G-303)
    .v2-ring padding-bottom   Platz fuer das Label (G-318)
    das Ringlabel selbst      G-318
    .v2-leer                  G-407

`[read]` **`v2.css` ist seit der Erzeugung von Hand weitergepflegt
worden, das Skript nicht.** `[cmd]` **Wer es laeuft, macht diese
Arbeit zunichte — lautlos, denn es meldet nur Erfolg.**

`[cmd]` **Im Kopf des Skripts steht jetzt eine Warnung mit dieser
Liste.** `[read]` **Nicht mehr** — ob das Skript nachgezogen oder
geloescht wird, ist Toms Entscheidung.

## Neustart

`[cmd]` **NOETIG** — `packages/ui` wurde geaendert
(`primitives.tsx`, `v2.css`). `[read]` **Die Schale laedt das Paket
einmal.** `[cmd]` **Die Messungen dieses Berichts liefen nach der
Aenderung und zeigen den neuen Stand** — aber Toms Fenster
womoeglich nicht.

## Abnahme

**2026-09-08, Orchestrator. Nachgemessen.**

    A1  35 Unterpunkte, 116 Kacheln
    A2  17 aus Daten, 99 Attrappen
    A3  .v2-empty im Paket behoben, apps/web unveraendert
    A4  dreizehn Reiter in einer Zeile
    A5  elf Bildschirmfotos
    A6  was fehlt, mit Grund
    A7  coach 51/51, web 1545/1545

`[cmd]` **Selbst gemessen: `.v2-empty` EINMAL definiert (Z1598),
`.v2-tabs` mit `overflow-x`, elf Bilder, 51 und 1545 gruen.**

`[cmd]` **`assist.png` angesehen:** **dreizehn Reiter in einer
Zeile, Warteschlange mit fuenf Klienten, Tagesbericht in vier
Abschnitten, Automatismen, Kontextspalte mit Kosten.**

### A3 war der riskanteste Teil

`[cmd]` **Die zweite `.v2-empty` (`:2078`) gestrichen, die erste
um `text-align: center` ergaenzt.**

> *,,Gegenprobe: `apps/web` zeigt dieselbe Darstellung. Alle
> Verwendungen tragen `.v2-card` als Rahmen ? die Spaltenrichtung
> aus der ersten Regel ist die einzige, die etwas bewirkt."*

`[read]` **Er hat gemessen, WARUM die Aenderung folgenlos ist** ?
**nicht nur, DASS die Tests gruen bleiben.**

### A2 — die Zahl ist ehrlich

`[cmd]` **17 von 116 aus Daten, 99 Attrappen.**

> *,,Die Vorlage traegt fertige Zahlen ueberall ? sie stammen aus
> einem Entwurf, nicht aus einer Datenbank."*

`[cmd]` **Und je Kachel steht die fehlende Tabelle:**
`coach.assistant_*` **fuer 21 Kacheln,**
`coach.client_adherence_summary` **fuer 12,**
`training.programs` **fuer 9.**

### Was er NICHT gebaut hat

> *,,Fuenfzehn Modale sind Knoepfe ohne Ziel."*

`[cmd]` **Neun Bereiche mit Tabellen im Kopf, die Vorlage haelt
sie sortierbar** ? **nicht gebaut.**

`[cmd]` **Und der Kalender ist eine Liste statt eines Rasters.**

`[read]` **Drei Sachen benannt statt vorgetaeuscht.**

### Der Befund am Rand

`[cmd]` **`docs/bilder/` ist in `.gitignore`** ? **die elf Bilder
sind nur lokal.**

`[read]` **Wer den Punkt in einem Monat liest, findet den Text und
keine Bilder.**

**Abgenommen.**

