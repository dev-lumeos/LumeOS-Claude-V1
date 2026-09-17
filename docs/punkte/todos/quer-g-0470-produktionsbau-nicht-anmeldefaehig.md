---
nr: G-470
typ: fehler
modul: quer
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: G-469
entscheidung: null
beruehrt:
  dateien:
    - apps/web/src/middleware.ts
zahlen:
  gemessen: 2026-09-08
---

# G-470 - der Produktionsbau ist nicht anmeldefaehig

## Befund

Aus G-469, Claude Code, 2026-09-08:

> *,,Der Produktionsbau ist nicht anmeldefaehig ? der
Supabase-Client wirft dort serverseitig `document is not
defined`, `/login` leitet auf sich selbst zurueck. Fuer A2
umgangen (oeffentliche Routen), fuer echten Betrieb nicht."*

## Warum es zaehlt

`[cmd]` **G-469 hat gemessen: der Produktionsbau ist kalt
schneller als der Dev-Server warm (65-203 ms gegen
338-757 ms).**

`[read]` **Aber niemand kann sich dort anmelden** ? **also
laesst sich nichts Angemeldetes messen oder pruefen.**

`[read]` **Und fuer den echten Betrieb ist es ein
Sperrfehler.**

## Der Verdacht

`[cmd]` **`document is not defined` heisst: ein
Browser-Objekt wird auf dem Server benutzt.**

`[read]` **Im Entwicklungsmodus faellt es nicht auf, weil
Next.js dort anders buendelt.**

`[cmd]` **MISS, welcher Supabase-Client wo erzeugt wird** ?
**Server- und Browser-Client muessen getrennt sein.**

## Abnahmebedingungen

    A1  welche Stelle wirft? Gemessen, mit Stapel.
    A2  Anmeldung im Produktionsbau funktioniert.
    A3  eine angemeldete Route im Produktionsbau:
        Ladezeit gemessen.
    A4  Gegenprobe: der Dev-Server bleibt unveraendert.
    A5  vier Module unveraendert.
    A6  NIE .next loeschen, nie next build direkt.

## Gemessen 2026-09-08 - es gibt schon einen Waechter

`[cmd]` **Drei Stellen erzeugen einen Supabase-Client:**

    apps/web/src/middleware.ts
    apps/web/src/lib/__tests__/client-grenze.test.ts
    apps/web/src/lib/__tests__/abmelden.test.ts

`[read]` **`client-grenze.test.ts` heisst, dass jemand die
Trennung schon einmal bewacht hat** ? **lies sie, bevor du
baust.**

`[cmd]` **MISS, ob sie den Fall abdeckt oder ob sie ihn
verpasst** ? **wenn sie ihn verpasst, ist das der eigentliche
Befund.**

