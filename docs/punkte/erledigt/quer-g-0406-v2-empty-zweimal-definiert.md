---
nr: G-406
typ: befund
modul: quer
schwere: mittel
angelegt: 2026-09-08
braucht: []
kind_von: G-405
entscheidung: null
erledigt: 2026-09-08
commit: 8f5709cb
beruehrt:
  dateien:
    - packages/ui/src/styles/v2.css
zahlen:
  gemessen: 2026-09-08
---

# G-406 — `.v2-empty` zweimal definiert

## Befund

Aus G-405, Claude Code, 2026-09-08.

`[cmd]` **`packages/ui/src/styles/v2.css`:**

    :1598   .v2-empty { display: flex; ... }
    :2078   .v2-empty { text-align: center; ... }

`[read]` **Die zweite setzt `display` nicht zurueck** ? **der
Attrappengrund stand neben dem Titel statt darunter.**

`[cmd]` **Er hat es unter `.dp-inhalt` ueberschrieben** ? **nur
fuer die Draft-Fassung.**

> *,,Das Paket gehoert allen Apps, und `apps/web` haengt an der
> heutigen Darstellung."*

## Die Entscheidung

`[read]` **Im Paket beheben** ? **dann sieht `apps/web`
moeglicherweise anders aus.**

`[read]` **Oder je Anwendung ueberschreiben** ? **dann steht es
bald dreimal.**

`[cmd]` **Miss zuerst, wie viele Stellen in `apps/web`
`.v2-empty` benutzen** ? **wenn es wenige sind, ist die Behebung
pruefbar.**

## Und ein zweiter

`[cmd]` **`.v2-tabs` hat kein `overflow`** ? **dreizehn Reiter
brechen auf drei Zeilen um.**

`[read]` **Der Assistent hat dreizehn** ? **das trifft heute nur
den Draft, aber jedes Modul, das waechst.**

## Entschieden am 2026-09-08

Tom: *,,bau den draft fertig."*

`[read]` **Im Paket beheben, mit Gegenprobe** ? **nicht je
Anwendung ueberschreiben.**

**Geht in G-407, A3 und A4.**
