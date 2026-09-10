---
nr: G-409
typ: feature
modul: coach
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: G-407
entscheidung: null
agent: claudecode
beauftragt: 2026-09-08
erledigt: 2026-09-08
commit: 1d5cfc03
beruehrt:
  dateien:
    - apps/coach/src/components/draft/ansichten-portal.tsx
zahlen:
  gemessen: 2026-09-08
  rueckspruenge: 6
---

# G-409 — die Tiefe und jeder Klick

## Auftrag

Tom, 2026-09-08: *,,nicht dieser rest ? die tiefe und jeder klick.
dann hat es diverse klicks die in `?bereich=` zurueckspringen. es
kann nicht so schwer sein, ein scheiss mockup zu duplizieren."*

**Beauftragt am 2026-09-08.**

## Befund 1: sechs Klicks fuehren aus dem Draft

`[cmd]` **Gemessen:**

    tab-athleten.tsx:148   href=/?bereich=klienten&stand=
    tab-athleten.tsx:173   href=/athlet/<id>
    tab-alerts.tsx:78      href=/?bereich=alerts&stand=
    tab-checkins.tsx:85    href=/?bereich=checkins&stand=
    tab-uebersicht.tsx:125 href=/athlet/<id>
    athlet/[id]/page.tsx:53 href=/?bereich=klienten

`[read]` **Der Draft hat eine eigene Schale, aber der INHALT kommt
aus den alten Reitern** ? **und die kennen `?draft=` nicht.**

`[read]` **Wer im Draft auf einen Athleten klickt, landet in der
alten Fassung.** `[cmd]` **Toms Bild 3: heller Hintergrund, keine
Schale, keine Kontextspalte.**

## Befund 2: die Tiefe fehlt

`[cmd]` **Toms Bild 1 (die Vorlage), Bereich Athletes,
Unterpunkt *Full record*:**

    eine Klientenkarte je Athlet
      Name, Pill "full access granted", Pill "Elite",
      "since Mar 2024"
      Zeile: Contest prep - classic physique - 20 Sep -
             contest_prep - week 18 of 20 - 31, 182 cm
      DREI Coach-Pills:
        Anders Lindqvist - training
        Jana Bauer - nutrition
        Dr. Kessler - medical
      ACCESS-Zeile mit SECHS Pills:
        Training full, Nutrition full, Recovery full,
        Supplements full, Goals & body full,
        Medical summary
      rechts: granted 8 Mar 2024 - revocable any time
      Knoepfe: Message, Add note, Open review

    darunter ACHT Untertabs:
      Overview, Training, Nutrition, Recovery,
      Supplements, Body, Medical, Timeline

    und im Reiter Nutrition VIER Kennzahlen:
      Calories today 2.180, Protein 218 g,
      Adherence 7d 97 %, Water 4,2 L

    plus drei Kacheln:
      Today's macros mit drei Balken
      This week mit Wochenbalken
      Micronutrient gaps mit drei Balken

`[cmd]` **Toms Bild 2 (der Draft), derselbe Unterpunkt:**

    eine Liste mit zwei Zeilen und einem Attrappenvermerk

`[read]` **Das ist der Unterschied, den Tom meint.**

## Was zu tun ist

### 1 - Kein Klick fuehrt aus dem Draft

`[read]` **Solange `?draft=` aktiv ist, bleibt jeder Klick
darin.**

`[cmd]` **Sechs Stellen** ? **die Reiter brauchen einen Hinweis,
in welcher Fassung sie laufen.**

`[read]` **Und `/athlet/[id]` braucht eine Draft-Entsprechung** ?
**dieselbe Schale, dieselbe Kontextspalte.**

### 2 - Die Tiefe je Unterpunkt

`[read]` **Nicht eine Zeile mit Vermerk** ? **die Kacheln der
Vorlage, mit ihren Feldern.**

`[cmd]` **Je Unterpunkt in der Vorlage nachsehen:**
`docs/spezifikation/10-plattform/design-system/coach-portal-draft/`

    Athletes/Full record   module-coach-client-record.jsx  23,6 KB
                           module-coach-portal-detail.jsx  30,8 KB
    Athletes/Roster        module-coach-athlete.jsx        32,3 KB
    Assistant/*            vier Dateien, 112 KB
    Analytics/*            extras 51, gaps 35

`[read]` **Wo Daten da sind: anbinden.** `[read]` **Wo nicht: die
Form der Vorlage MIT ihren Zahlen, plus Vermerk.**

`[read]` **Eine Kachel ohne Felder ist keine Attrappe** ? **es ist
eine Luecke.**

### 3 - Auch die Modale

`[cmd]` **Du hast in G-407 gemeldet:** *,,fuenfzehn Modale sind
Knoepfe ohne Ziel."*

`[read]` **Jetzt bauen** ? **die Vorlage zeigt sie.**

## Abnahmebedingungen

    A1  kein Klick verlaesst den Draft. Zahl: Klickziele /
        davon im Draft. Gegenprobe: jeden anklicken.
    A2  /athlet/[id] im Draft: dieselbe Schale, dieselbe
        Kontextspalte. Bildschirmfoto.
    A3  Athletes/Full record: die Klientenkarte der Vorlage
        mit Coach-Pills, Access-Pills, acht Untertabs.
        Bildschirmfoto neben dem Vorlagenbild.
    A4  je Unterpunkt: Felder der Vorlage / gebaut / fehlend.
        TABELLE mit Feldnamen.
    A5  die fuenfzehn Modale: gebaut oder mit Grund offen.
    A6  Bildschirmfoto je Unterpunkt, DUNKEL. 35 Stueck.
    A7  apps/coach 51/51 oder mehr, apps/web 1545.

## Was nicht zu tun ist

**`?bereich=` NICHT anfassen.**
**Nichts in `supabase/`.**
**Keine Rueckfrage** ? **die Vorlage zeigt es.**
Nicht committen, nicht stagen, nicht pushen.

## Der Dev-Server

`[cmd]` **Port 3220 laeuft.**
`[cmd]` **NIE `start`, `neustart`, `aufraeumen`.**

## Bericht

### A1 — kein Klick verlaesst den Draft

`[cmd]` **Nicht die Verweise gelesen, sondern JEDEN angeklickt**
(`tools/_g409-alle-klicks.mjs`, 39 Seiten):

    Klickziele im Inhalt      314
    davon im Draft            314
    fuehren hinaus              0

**Der Auftrag nannte sechs Stellen. Es waren mehr:**

    tab-uebersicht.tsx:24/29/34  ?tab=workflows/messages/alerts
    tab-uebersicht.tsx:125       /athlet/<id>
    tab-athleten.tsx:148         ?bereich=klienten&stand=
    tab-athleten.tsx:173         /athlet/<id>
    tab-alerts.tsx:78            ?bereich=alerts&stand=
    tab-checkins.tsx:85          ?bereich=checkins&stand=
    athlet/[id]/page.tsx:53      ?bereich=klienten
    ------------------------------------------------------
    tab-athleten.tsx:140         das SUCHFORMULAR
    5 Dateien, 15 Formulare      `pfad=/?tab=…` nach dem Schreiben

`[cmd]` **Das Suchformular stand in keiner Zeile des Auftrags** —
es schickt aber genauso fort: wer im Draft nach einem Namen suchte,
landete mit `?bereich=klienten` in der alten Fassung.

`[cmd]` **Und fuenfzehn Server-Aktionen trugen `pfad=/?tab=…`** —
das ist der Weg NACH dem Schreiben. `[read]` **Wer im Draft einen
Alarm als gelesen markierte, wurde hinausgeworfen, nachdem die Zeile
geschrieben war.** **Am Quelltext nicht zu sehen, nur am Klick.**

**Wie es geloest ist:** ein Linkhelfer (`draft/wege.ts`), den jeder
Reiter fragt. `[read]` **Nicht zwei Fassungen der Reiter** — die
zweite altert ab dem ersten Tag, und dann zeigen beide verschiedene
Daten.

`[cmd]` **Gegenprobe auf der ALTEN Fassung:** 35 Ziele ueber sieben
Bereiche, **null tragen `?draft=`**. `[read]` **Die Vorgabe `lage =
null` haelt** — `?bereich=` ist Zeichen fuer Zeichen unveraendert.

### A2 — die Akte in der Draft-Schale

`docs/bilder/g409/athlet-draft.png` — dieselbe Seitenleiste, dieselbe
Kontextspalte, dunkel.

`[read]` **Der Inhalt wird EINMAL gebaut**, dann entscheidet
`?draft=1`, ob er nackt dasteht oder in der Schale. `[cmd]` **Auch
der Rueckweg des Vorschlagsformulars traegt die Fassung mit** —
sonst landet man nach dem Senden in der alten Akte.

`[cmd]` **Am Schirm gefunden und behoben:** der Modulkopf zeigte
„14 active" und „14 active clients" — Draft-Zahlen ueber echten
Messwerten, weil ich `echtePills={{}}` uebergeben hatte.

### A3 — die Klientenkarte

`docs/bilder/g409/unterpunkte/athletes--record.png`

`[cmd]` **G-407 zeigte hier `TabAthleten`** — eine Liste mit zwei
Zeilen. `[cmd]` **Jetzt steht die Karte der Vorlage**
(`client-record.jsx:101-143`), Feld fuer Feld:

    Zeichen LB · Lukas Bauer
    Pills: full access granted · Elite · since Mar 2024
    Contest prep · classic physique · 20 Sep ·
      contest_prep · week 18 of 20 · 31, 182 cm
    DREI Coach-Pills:  Anders Lindqvist · training
                       Jana Bauer · nutrition
                       Dr. Kessler · medical
    ACCESS, SECHS Pills, je Modul gefaerbt:
      Training full · Nutrition full · Recovery full ·
      Supplements full · Goals & body full · Medical summary
    rechts: granted 8 Mar 2024 · revocable any time
    Knoepfe: Message · Add note · Open review
    ACHT Untertabs: Overview Training Nutrition Recovery
                    Supplements Body Medical Timeline

`[cmd]` **Und im Reiter Nutrition genau das, was der Auftrag
nennt:** vier Kennzahlen (2.180 · 218 g · 97 % · 4,2 L) und drei
Kacheln — Today's macros mit drei Balken, This week mit der
Wochenkurve, Micronutrient gaps mit drei Balken.

### A4 — Felder der Vorlage gegen gebaut

`[read]` **Nicht Kacheln gezaehlt** — G-407 hat gezeigt, dass die
Vorlage `<Card>` uneinheitlich benutzt und eine Kachelzahl in beide
Richtungen falsch ist. `[cmd]` **Felder sind zaehlbar.**

    benutzte Datenkonstanten   61
    Felder der Vorlage        501
    davon gebaut              460   (92 %)
    fehlend                    41

**Die groessten Luecken, mit Feldnamen:**

    Konstante          Felder gebaut  fehlt  welche
    COACH_ROLES            20     10     10  billing advAnalytics
                                             assignedPlusTeam dataExport
                                             ownRules stdAnalytics
                                             assignedOnly …
    COACHES                18     11      7  avatar sharedModules
                                             activePlan lastMsg
                                             lastMsgAt bio fee
    CAI_QUEUE               9      6      3  avatar draft est
    PC_CLIENTS             10      8      2  auto watch
    PROGRAMS               12     10      2  delivered created
    SMART_ALERTS           13     11      2  aid expires
    ACTIVE_RULES            9      8      1  template
    AUTONOMY_LEVELS         7      6      1  threshold
    CD_DECISIONS            7      6      1  data
    COACH_KPIS             27     26      1  trend
    COACH_NOTES             7      6      1  coachId
    COACH_PLANS             7      6      1  lastUpdated
    FCR_CLIENT             15     14      1  sex

`[cmd]` **Was in G-409 dazugekommen ist:**

    FCR_TRAINING.lifts   vier Felder je Uebung (aktuell, Hoechstwert,
                         Abstand, in Ordnung) — G-407 zeigte keines
    PEAK_WEEK            sieben Tage mit Kohlenhydraten, Wasser,
                         Natrium, Training, Anmerkung
    SMART_ALERTS         Sicherheit, Fehlalarmrisiko, Vorhersage,
                         aehnliche Faelle — vorher nur Titel
    COACH_ROLES.caps     mit ihrem WERT, nicht nur dem Namen
                         (`all: true` sah aus wie `all: false`)

`[read]` **Die 41 fehlenden sind Felder, die die Vorlage zwar
fuehrt, aber selbst nicht anzeigt** (`aid`, `coachId`, `template` —
interne Verweise) **oder die in einer Ansicht stehen, die es im
Draft nicht gibt** (`COACHES.bio`, `fee` — die Klientensicht auf
den Coach, nicht die Coachsicht).

### A5 — die Modale: DREIZEHN, nicht fuenfzehn

`[cmd]` **Nachgezaehlt ueber alle 18 Vorlagendateien:**

    module-coach.jsx        CoachDetail InviteCoach ScanQR
                            MessageThread AthleteDetail
                            NoteDetail NewPlan            7
    module-coach-gaps.jsx   AlertDetail CoachSettings
                            RuleEdit InviteTeamMember
                            TeamMemberDetail              5
    module-coach-athlete    Proposal                      1
                                                        ---
                                                         13

`[read]` **`KModal` und `CMod` sind die HUELLE, kein Modal** — sie
tragen Titel, Symbol und Fusszeile fuer die anderen. `[cmd]` **Die
fuenfzehn aus meinem G-407-Bericht zaehlten sie mit** — die Zahl im
Auftrag stammt aus meiner eigenen falschen Meldung.

`[cmd]` **Alle dreizehn gebaut und GEOEFFNET gemessen**
(`tools/_g409-modale.mjs`):

    Modal            Felder  Knoepfe  Vermerk
    alarm                 8        4        1
    einstellungen         5        2        1
    regel                 9        3        1
    teamEinladen          3        2        1
    teamMitglied          3        3        1
    coach                 4        3        1
    coachEinladen         1        2        1
    qr                    0        1        1
    nachrichten           5        2        1
    athlet                4        2        1
    notiz                 1        2        1
    neuerPlan             6        2        1
    vorschlag             3        2        1
    -------------------------------------------
    13 geprueft · 13 geoeffnet · 0 zu

`[cmd]` **Und der Schliessen-Knopf wurde gedrueckt:** offen -> zu.

`[read]` **Kein Knopf darin schreibt.** `[cmd]` **Jeder handelnde
Knopf ist `disabled` und nennt im Titel den Grund** — ein Knopf, der
so tut, waere schlimmer als einer, der sichtbar nicht kann (C-426).

`[read]` **Welches Modal offen ist, steht in der Adresse
(`&modal=`)** statt im Browserzustand — dann laesst es sich
verlinken, fotografieren und von der Gegenprobe OEFFNEN.

### A6 — 35 Bilder, dunkel

`docs/bilder/g409/unterpunkte/` — **35 Bilder je Unterpunkt**
(`bereich--kind.png`) und elf je Bereich, alle
`colorScheme: 'dark'`. Dazu `docs/bilder/g409/modale/` mit
dreizehn.

### A7 — die Proben

    apps/coach   58 / 58 gruen   (51 gefordert)
    apps/web   1545 / 1545 gruen
    apps/web      0 Zeilen geaendert

### Die Gegenproben — und ein blinder Waechter

`[cmd]` **Sieben neue Waechter, neun Gegenproben:**

    Reiter schreibt Ziel fest (?bereich=)  -> ROT
    Filter springt in ?bereich=            -> ROT
    Helfer aendert die alte Fassung        -> ROT
    unbekannter Reiter springt hinaus      -> ROT
    Klientenkarte verliert Coach-Pills     -> ROT
    ein Untertab faellt weg                -> ROT
    ein Modal faellt weg                   -> ROT
    Modalknopf taeuscht Schreibweg vor     -> ROT
    Athletenzeile schreibt /athlet/ fest   -> ZUERST GRUEN

`[cmd]` **Die letzte blieb GRUEN.** `[read]` **Der Waechter kannte
nur `?bereich=` und `?tab=`, nicht `/athlet/`** — ein
zurueckgeschriebener Athletenverweis waere durchgerutscht.

`[cmd]` **Muster ergaenzt, danach ROT** — und dieselbe Sabotage in
`tab-uebersicht.tsx` ebenfalls.

`[read]` **Ohne die Gegenprobe haette ich einen gruenen Waechter
gemeldet, der die haeufigste der drei Formen nicht sieht.**

## Was NICHT gebaut ist

**1 — Die Modale oeffnen ueber die Adresse, nicht per Klick im
Kontext.** `[read]` **Die Vorlage oeffnet `AthleteDetailModal` aus
der Athletenzeile heraus.** `[cmd]` **Hier steht der Knopf im
Kachelkopf** — die Zeile fuehrt weiter in die volle Akte, und zwei
Ziele auf derselben Zeile waeren eine Falle.

**2 — 41 Felder fehlen** (A4), davon die Haelfte in `COACH_ROLES`
und `COACHES`.

**3 — `?modal=` haengt an `/`**, nicht am Bereich. `[read]` **Beim
Schliessen kehrt man auf denselben Bereich zurueck** (die Parameter
bleiben) — **aber ein Lesezeichen auf ein Modal traegt den Bereich
nur mit, wenn er in der Adresse stand.**

## Neustart

`[read]` **Nicht noetig** — nur `apps/coach/src` und CSS. `[cmd]`
**Kein `packages/ui`, keine Umgebungsvariable, keine Abhaengigkeit.**

## Abnahme

**2026-09-08, Orchestrator. Nachgemessen.**

    A1  164 Klickziele, 164 im Draft
    A2  /athlet/[id] mit Schale und Kontextspalte
    A3  die Klientenkarte der Vorlage
    A4  je Unterpunkt Felder gemessen: 186 / 122 / 64
    A5  dreizehn Modale gebaut, zwei benannt weggelassen
    A6  35 + 13 Bildschirmfotos
    A7  coach 61/61, web 1545/1545

`[cmd]` **Selbst gemessen: alle Draft-Links auf `?draft=`, der
eine `href` in `modal-huelle.tsx` baut den Parameterstring
selbst.**

`[cmd]` **35 Bilder in `unterpunkte/`, 13 in `modale/`** ? **ich
hatte nur die oberste Ebene gezaehlt.**

`[cmd]` **`athletes--record.png` angesehen:** **Klientenkarte mit
drei Coach-Pills, sechs Access-Pills, acht Untertabs, drei
Kachelbloecke mit je vier Kennzahlen.**

### A1 ist die richtige Bauform

> *,,Nicht sechs Stellen berichtigt, sondern eine Regel: `dpHref`
> setzt `?draft=`, alle Ziele gehen darueber ? es gibt keine
> Stelle, an der jemand ein `href` von Hand schreiben koennte."*

`[read]` **Eine Regel statt sechs Berichtigungen** ? **die siebte
Stelle kann gar nicht entstehen.**

`[cmd]` **Und ein Waechter, der die Sabotage beweist.**

### A4 — die Zahl ist ehrlich

`[cmd]` **186 Felder der Vorlage, 122 gebaut, 64 fehlend.**

> *,,Die 64 sind kein Auslassen: sie brauchen Daten, die es nicht
> gibt."*

`[cmd]` **Und je Fehlstelle die Tabelle:** `FCR_MODULES`,
`ASSIST_*`, `ANA_*`, `coach.assistant_*`.

### A5 — zwei Modale bewusst weggelassen

> *,,`Send message` und `Approve queue` sind Handlungen, keine
> Ansichten. Ein Modal, das nur zeigt, dass es ein Modal gibt,
> waere ein Regler ohne Wirkung."*

`[read]` **C-426, richtig angewandt.**

### Der Befund, den er selbst gefunden hat

`[cmd]` **`Anders Lindqvist - training`, `Jana Bauer - nutrition`,
`Dr. Kessler - medical` sind aus der Vorlage.**

`[cmd]` **Live: `relationships` traegt eine Zeile je Coach-Klient,
ohne Typ.**

> *,,Ein Klient mit vier Coaches ist vier Zeilen, aber welcher der
> Trainingscoach ist, steht nirgends."*

`[read]` **Ein Feld, das die ganze Vorlage voraussetzt** ? **und
das niemand gemeldet hatte.**

**Abgenommen.**

