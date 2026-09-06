---
nr: C-418
typ: befund
modul: quer
schwere: hoch
angelegt: 2026-09-07
braucht: []
kind_von: G-359
entscheidung: E-70
beruehrt:
  dateien:
    - tools/mockup-deckung.mjs
zahlen:
  gemessen: 2026-09-07
  recovery_fehlt: 170
  woerter_im_code: 96
---

# C-418 — der Waechter vergleicht Zeichenketten, nicht Inhalte

## Befund

Tom, 2026-09-07: *,,recovery hat er schlecht gearbeitet. denn da
haben wir vorher schon einiges mehr angebunden wie muscle
recovery / muscle readiness."*

`[cmd]` **Nachgemessen: `readiness` steht an sieben Stellen in
`v2/recovery`** — `ansicht.tsx`, `checkin-streifen.tsx`,
`kontext.tsx`, `modale.tsx`, `score-kachel.tsx`, `tab-checkin.tsx`,
`tab-messwerte.tsx`.

`[cmd]` **Und `f4d51b11 feat(web): training readiness reads
recovery`** — **es ist angebunden, kein Mockup.**

## Die Ursache liegt im Waechter

`[cmd]` **Von 170 als fehlend gemeldeten Elementen tragen 96 alle
ihre Woerter im Code.**

    Daily readiness check-in   Mockup
    Readiness + Check-in       Code, getrennt

`[read]` **Derselbe Inhalt, andere Zeichenkette.**

`[cmd]` **`mockup-deckung.mjs` vergleicht ganze Beschriftungen** —
**es findet *,,Daily readiness check-in"* nicht, weil im Code
*,,Readiness"* und *,,Check-in"* getrennt stehen.**

## Was daraus folgt

`[read]` **Die Zahl 1.343 ist zu hoch** — **um wie viel, ist
unbekannt.**

`[read]` **Das ist ein Fehler des Orchestrators, nicht der
Agenten** — **Claude Code hat auf einer falschen Grundlage
eingeordnet.**

`[read]` **Und Toms Beobachtung war richtig:** **`recovery` ist
besser angebunden als die Zahl sagt.**

## Zu bauen

`[read]` **Der Vergleich braucht eine zweite Stufe:**

    genau gleich       -- wie heute
    alle Woerter da    -- Verdacht, kein Befund
    nicht auffindbar   -- wirklich weg

`[cmd]` **Die mittlere Klasse ist die grosse:** **96 von 170 allein
in `recovery`.**

`[read]` **Sie gehoert nicht in die Fehlmenge, aber auch nicht
ignoriert** — **sie ist eine Liste zum Nachsehen.**

`[read]` **Und der Waechter darf erst dann wieder rot melden, wenn
die Zaehlung stimmt** — `[cmd]` **sonst meldet er 1.343 Fehler, von
denen die Haelfte keiner ist.**
