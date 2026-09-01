---
nr: G-318
typ: befund
modul: nutrition
schwere: hoch
angelegt: 2026-09-02
braucht: []
kind_von: null
entscheidung: null
beruehrt:
  dateien:
    - apps/web/src/app/v2/nutrition/mahlzeiten.tsx
zahlen:
  gemessen: 2026-09-02
---

# G-318 — Planner und Diary sehen einander nicht

## Befund

Tom, 2026-09-02: *,,was bringt ein planner wenn er in diary nicht
updated?"*

`[cmd]` **Die Naht existiert:** `ladeGhostEintraege(datum)` in
`plan-lesen.ts:793`, gerufen von der Route, angezeigt in
`mahlzeiten.tsx` — **dem Diary.**

`[cmd]` **Aber beide Reiter laden nur beim Oeffnen.**

`[read]` **Wer im Planner eine Position fuer heute aendert und ins
Diary wechselt, sieht den alten Stand** — bis er neu laedt.

## Was die Frage dahinter ist

`[read]` **Ein Plan wirkt erst ab seinem Startdatum.** `[cmd]`
**Flow 3 Schritt 5 setzt die Vorgabe auf morgen** — *,,Default:
morgen, max. 7 Tage im Voraus"*.

`[read]` **Damit ist die Wirkung eines frisch aktivierten Plans
morgen sichtbar, nicht heute.** **Das ist die Spec, kein Fehler.**

`[read]` **Aber eine Aenderung an einem laufenden Plan fuer heute
muss sofort ankommen** — **sonst plant man gegen eine Anzeige, die
nicht mitzieht.**

## Zu messen

`[read]` **Wann laedt das Diary die Ghost-Eintraege neu?**
`[cmd]` **Beim Reiterwechsel? Beim Datumswechsel? Gar nicht?**

`[read]` **Und was geschieht mit einem Ghost Entry, der schon
bestaetigt ist, wenn die Planposition sich aendert?** `[cmd]` **E-42:
geloggt ist eingefroren** — **die Anzeige muss das koennen.**

## Auftrag

`[read]` **Vorbereitet am 2026-09-02.**

Tom: *,,was bringt ein planner wenn er in diary nicht updated?"*

`[cmd]` **Die Naht existiert** — `ladeGhostEintraege(datum)` in
`plan-lesen.ts:793`, ueber die Route ins Diary. `[cmd]` **Beide
Reiter laden nur beim Oeffnen.**

### Zuerst messen, dann bauen

`[read]` **Wann laedt das Diary die Ghost-Eintraege neu?**
`[cmd]` **Beim Reiterwechsel? Beim Datumswechsel? Gar nicht?**

`[read]` **Geh es am Schirm:** Position im Planner fuer heute
aendern, ins Diary wechseln, **und sag was du siehst.**

### Und die zweite Frage

`[read]` **Was geschieht mit einem bestaetigten Ghost Entry, wenn die
Planposition sich aendert?**

`[cmd]` **E-42: geloggt ist eingefroren.** `[cmd]` **Und G-315 hat
belegt, dass die Sperre je Position greift.**

`[read]` **Die Anzeige muss das koennen** — ein bestaetigter Eintrag
darf sich nicht rueckwirkend aendern.

### Was nicht zu tun ist

**Kein Live-Abgleich** — ein Neuladen beim Reiterwechsel reicht.
**Nichts auf `dev@lumeos.app` schreiben** — vier Plaene und sechs
Logzeilen stehen dort zum Ansehen.

### Der Dev-Server gehoert dir

`[cmd]` **`server.py start` bevorzugen.**

### Nachweis

    Aenderung im Planner   im Diary sichtbar, ohne Neuladen
    bestaetigter Eintrag   bleibt, wie er war
    Datumswechsel          laedt neu
    Bildschirmfoto         beide Reiter, nacheinander
