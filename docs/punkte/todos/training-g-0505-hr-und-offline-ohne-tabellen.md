---
nr: G-505
typ: befund
modul: training
schwere: niedrig
angelegt: 2026-09-08
braucht: []
kind_von: G-25
entscheidung: null
beruehrt:
  dateien:
    - apps/web/src/app/v2/training/tabs-offline-hr.tsx
zahlen:
  gemessen: 2026-09-08
---

# G-505 - HR zones und Offline sync haben keine Tabellen

## Die Kacheln

`[cmd]` **Zwoelf Kacheln UEBER der Linie, zwei Reiter:**

    hrzones   Time in zone, Per-set response,
              HR trace                            (7 Marken)
    offline   Outbox, Sync log, IndexedDB,
              Conflict resolution                 (5 Marken)

## Der Grund, gemessen

`[cmd]` **Es gibt keine Tabelle dafuer** - Suche ueber
`information_schema.tables` nach `%heart%`, `%hr_%`,
`%offline%`, `%outbox%`, `%sync%`: **null Treffer in allen
Schemata.**

`[read]` **Das ist etwas anderes als bei Plan (G-503):** dort
stehen leere Tabellen, hier fehlt die Struktur ganz.

## Warum ein eigener Punkt

`[read]` **Beide Reiter sind Geraetesachen, keine
Trainingsdaten.** `[read]` **HR braucht eine Quelle
(Brustgurt, Uhr), Offline braucht einen Client-Speicher** -
beides Entscheidungen ueber die Plattform, nicht ueber das
Modul.

`[read]` **Solange keine Quelle entschieden ist, ist die
Marke richtig** und die Kacheln zeigen den Entwurf.

## Zu klaeren

`[read]` **Zuerst: soll LumeOS HR-Daten fuehren?** `[read]`
**Und: ist Offline ein Ziel fuer V1?** **Ohne diese zwei
Antworten hat ein Schema keinen Zweck.**

## Abnahmebedingungen

    A1  eine Entscheidung je Reiter: gebaut,
        verschoben oder verworfen (E-70).
    A2  bei ,,verworfen": die Kacheln verschwinden
        nicht, sie sagen es (E-70).
