---
nr: G-517
typ: fehler
modul: quer
schwere: mittel
angelegt: 2026-09-27
braucht: []
kind_von: null
entscheidung: null
agent: claudecode
beauftragt: 2026-09-27
beruehrt:
  dateien:
    - tools/schuss.mjs
zahlen:
  gemessen: 2026-09-27
---

# G-517 - die Probe meldet die Zeitueberschreitung, nicht die Ursache

## Was passiert ist

`[cmd]` **2026-09-27: Tom meldete *,,ich hab ueberall 404"*.
`schuss.mjs` sagte dazu:**

    page.waitForURL: Timeout 60000ms exceeded.
    waiting for navigation until "load"

`[read]` **Das sagt, dass etwas nicht geschah ? nicht,
warum.**

`[cmd]` **Die Ursache, mit einer eigenen Probe gefunden:**

    404  /_next/static/chunks/main-app.js
    404  /_next/static/chunks/app-pages-internals.js
    404  /_next/static/chunks/app/login/page.js
    404  /_next/static/css/app/login/page.css

`[read]` **Das HTML kam, KEIN JavaScript lud. Der Anmeldeknopf
tat nichts, weil kein Code hinter ihm war.**

`[cmd]` **Behoben durch Neustart beider `next dev`-Prozesse,
`.next` unangetastet ? die Projektregel sagt genau das.**

## Warum es ein Punkt ist

`[read]` **Claude Code hat den Schirmnachweis ZWEIMAL
aufgeschoben (G-510, G-513), weil die Probe nur
*ERR_CONNECTION_REFUSED* sagte.**

`[cmd]` **Und der Orchestrator hat daraufhin G-474 verdaechtigt
(der alte Chromium) ? falsch.**

`[read]` **Eine Probe, die die Ursache verschweigt, kostet
zwei Laeufe und eine falsche Faehrte.**

## Zu bauen

`[read]` **`schuss.mjs` zaehlt Konsolenfehler bereits ? es
meldet sie nur nicht, wenn es VORHER abbricht.**

    1  bei einer Zeitueberschreitung: die gesammelten
       404er und Konsolenfehler ausgeben, bevor
       geworfen wird
    2  der Sonderfall "kein JS geladen" beim Namen
       genannt -- er hat eine bekannte Ursache und
       eine bekannte Behebung
    3  die Behebung im Text: beenden, starten,
       .next bleibt

## Abnahmebedingungen

    A1  bei einer Zeitueberschreitung stehen die 404er
        im Bericht. Gegenprobe erzwungen.
    A2  "kein JS geladen" wird beim Namen genannt.
    A3  die Behebung steht dabei.
    A4  ein normaler Lauf bleibt unveraendert kurz.
    A5  Sabotageprobe: ein kuenstlicher 404 wird
        gemeldet.

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_

