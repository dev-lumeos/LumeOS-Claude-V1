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

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
