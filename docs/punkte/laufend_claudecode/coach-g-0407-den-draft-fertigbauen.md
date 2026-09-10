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

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
