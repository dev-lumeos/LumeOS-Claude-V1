---
nr: G-240
typ: befund
modul: supplements
schwere: hoch
angelegt: 2026-08-28
braucht: []
kind_von: null
entscheidung: null
agent: claudecode
beauftragt: 2026-08-28
beruehrt:
  dateien: [docs/spezifikation/00-MODULSTAND.md]
zahlen: null
---

# G-240 — der massgebliche Supplements-Mockup ist ungelesen

## Befund

**Aus der Modulstand-Erhebung vom 2026-08-28**,
`docs/spezifikation/00-MODULSTAND.md`.

`[cmd]` **226 KB in vier `.jsx`-Dateien** unter
`docs/spezifikation/10-plattform/design-system/theme-v1/`:
`module-supplements.jsx` (1.606 Zeilen, 6 Reiter), `-spec.jsx`
(1.082), `-modals.jsx` (704), `-injection.jsx` (524).

`[cmd]` **Der `.js`-Ordner `apps/web/public/mockup/features/supplements/`
enthaelt dagegen vier Spiegel-Stubs von zusammen 120 Zeilen** mit
hartkodiertem Beispiel-Stack. `[read]` **Er ist nicht die
Zielgestalt.**

`[read]` **Was zu tun ist:** den `.jsx`-Bestand gegen `v2/supplements/`
(24 Dateien) halten. **Sechs Reiter im Mockup — Today, Stack,
Database, Compliance, Interactions, Cost.** `[cmd]` **`Cost` kommt im
gebauten Stand nicht vor.**

## Auftrag

### Vorweg

`[read]` **Die Zahlen misst du.** `[cmd]` Seit dem 27.08. traegt ein
Auftrag keine Zahlen mehr vom Orchestrator.

`[read]` **Und der Mockup ist aus der Spec entstanden, mit Abgleich
zum alten Repo.** **Wenn du einen Unterschied findest, ist die erste
Frage, ob du richtig hingesehen hast** — nicht, ob jemand etwas
erfunden hat. `[cmd]` **Das hat dir in G-239 die Codesysteme
gerettet** (`CLD` gegen `CL`) und mir am 28.08. dreimal einen falschen
Befund erspart, als ich endlich nachgesehen habe.

### Die Quellen, in dieser Reihenfolge

    docs/spezifikation/10-plattform/design-system/theme-v1/
        module-supplements.jsx           1.606 Zeilen, 6 Reiter
        module-supplements-spec.jsx      1.082
        module-supplements-modals.jsx      704
        module-supplements-injection.jsx   524

    docs/specs/Supplements/              13 Dateien, SPEC_01-10
        plus SCHEMA_NEUAUFBAU.md
        plus "Injection Planner - Spec Change Request"

    apps/web/src/app/v2/supplements/     24 Dateien

`[cmd]` **NICHT `apps/web/public/mockup/features/supplements/`** —
das sind vier Spiegel-Stubs von zusammen 120 Zeilen mit hartkodiertem
Beispiel-Stack. **Ich habe sie am 28.08. fuer den Mockup gehalten und
drei Stunden verloren.**

### Zu tun

**Je Reiter ein Urteil.** `[cmd]` **Der Mockup fuehrt sechs:** Today ·
Stack · Database · Compliance · Interactions · Cost.

    stimmen sie ueberein         belegt
    im Mockup, nicht gebaut      benannt
    gebaut, nicht im Mockup      woher kommt es?
    widerspruechlich             beide Aussagen nennen, nicht
                                 aufloesen

`[cmd]` **`Cost` kommt im gebauten Stand nicht vor** — pruef das und
sag, was der Mockup dort zeigt.

`[read]` **Und der Injektionsplaner hat eine eigene Spec-Aenderung**
(*,,Spec Change Request"*, 17,9 KB). `[cmd]` Gebaut ist
`tab-injektionen.tsx` mit 27 KB. **Pruef, ob die Aenderung darin
angekommen ist.**

### Was nicht zu tun ist

**Nichts bauen.** `[read]` **Dies ist die Analyse vor dem Bau.** Was
du findest, wird ein Punkt und dann ein Auftrag.
**Keine Spec und keinen Mockup aendern.**
**Keinen Code aus dem Vorgaengerrepo uebernehmen** — Struktur ja,
Code nie.
**Kein Katalogausbau** — Tom, 27.08.: *,,Schluss mit
Katalogdetails."*
Nicht committen, nicht stagen, nicht pushen.

### Nachweis

    Reiter im Mockup             6, je benannt
    Reiter gebaut                Zahl
    vollstaendig                 Zahl
    fehlend                      je einzeln
    ueberzaehlig                 je einzeln, mit Herkunft
    widerspruechlich             je einzeln, beide Aussagen
    Injektionsplaner             Spec-Aenderung angekommen?
    Attrappen im Modul           Zahl

`[read]` **Und die Frage, die am Ende beantwortet sein muss:** was
kann gebaut werden, ohne dass eine Entscheidung fehlt? **Daraus wird
der Bauauftrag.**

### Regeln

`tools/lauf.py` fuer jeden Befehl, keine Konsolenfenster.
**Lesend, ohne Schreibvorgaenge.**
`[cmd]` **Der Dev-Server beendet sich von selbst** (G-205), falls du
ihn fuer eine Sichtpruefung brauchst.

**Wenn eine Vorgabe nicht aufgeht: melden, nicht passend machen.**

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
