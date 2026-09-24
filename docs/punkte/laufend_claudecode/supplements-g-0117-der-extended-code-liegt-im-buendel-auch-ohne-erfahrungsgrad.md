---
nr: G-117
typ: feature
modul: supplements
schwere: mittel
angelegt: 2026-08-20
braucht: []
kind_von: G-110
kinder: []
entscheidung: null
agent: claudecode
beauftragt: 2026-09-08
beruehrt:
  tabellen: []
  dateien: []
zahlen: null
---

# G-117 - Der Extended-Code liegt im Buendel, auch ohne Erfahrungsgrad

## Befund

(neu 2026-08-20, aus G-110).

  `[cmd]` **Das Gate haelt die Daten, nicht den Code.** Gemessen: bei
  statischem Import steht „Active protocols" in **einem von sieben**
  JS-Chunks der Seite — auch fuer jemanden, dessen Grad nicht reicht.

  `[cmd]` **Ein `dynamic({ ssr: false })` behebt es** (der Chunk war
  danach nicht mehr im Seitenmanifest) — **und macht den Tab leer:** er
  zeigte gar nichts mehr, auch nicht den Ladehinweis. **Zurueckgenommen.**

  `[read]` **Wie schwer es wiegt:** Die Protokolle selbst kommen NICHT
  mit — nur die Attrappenzahlen des Entwurfs. Wer den Code liest,
  erfaehrt nichts ueber den Nutzer. **Sobald Extended echte Daten
  fuehrt, wird es ernst.**

## G-118 zusammengelegt, 2026-09-08

`[cmd]` **G-117 und G-118 sind derselbe Befund aus G-110** ?
**einer beschreibt ihn, der andere stellt die Frage dazu.**

Aus G-118:

> *,,Das Gate haelt ? serverseitig gegen `experience_level`.
ABER der Code wird trotzdem ausgeliefert."*

> *,,Zu klaeren: Reicht das Gate, oder soll der Code gar nicht
erst zum Browser? Es geht um PED-Protokolle ? die Frage ist
nicht rein technisch."*

## Die Antwort, 2026-09-08

`[read]` **Das Gate haelt die DATEN. Was ausgeliefert wird,
ist der Entwurf mit Attrappenzahlen** ? **wer den Code liest,
erfaehrt nichts ueber den Nutzer.**

`[read]` **Aber er erfaehrt, DASS es PED-Protokolle gibt und
wie sie aufgebaut sind** ? **und sobald Extended echte Daten
fuehrt, wird aus dem Entwurf ein Leseweg.**

`[cmd]` **Der erste Versuch nahm `dynamic({ ssr: false })`** ?
**das haelt den Chunk heraus UND macht den Reiter leer, auch
den Ladehinweis. Zurueckgenommen, richtig.**

`[read]` **Das war das falsche Werkzeug: `dynamic` verschiebt
das Laden, es entscheidet nicht ueber das Ausliefern.**

### Was zu messen ist

`[cmd]` **Next.js App Router kennt Servergrenzen** ? **eine
Serverkomponente, die bei zu niedrigem Grad NICHTS rendert,
liefert auch nichts aus.**

    A  wo liegt die Grenze heute? extended-gate.tsx,
       kontext.tsx -- Server oder Client?
    B  was steht in welchem Chunk? Vorher messen,
       nicht schaetzen.
    C  haelt eine Servergrenze den Chunk heraus UND
       den Reiter am Leben?
    D  was sieht ein Nutzer mit zu niedrigem Grad?
       Eine Erklaerung, kein leeres Feld -- die Lehre
       aus G-482 und G-486.

## Abnahmebedingungen

    A1  vorher: in wie vielen Chunks steht der
        Extended-Code? Zahl.
    A2  nachher: null. Gemessen, nicht behauptet.
    A3  ein Nutzer mit Grad sieht den Reiter
        unveraendert. Foto.
    A4  ein Nutzer ohne Grad sieht eine Erklaerung,
        kein leeres Feld. Foto.
    A5  das serverseitige Gate bleibt -- die Grenze
        ERSETZT es nicht, sie kommt dazu.
    A6  ein Waechter faengt einen Rueckfall.
        Sabotageprobe.
    A7  die elf anderen Reiter unveraendert.
    A8  apps/web 1982 oder mehr, apps/coach 65.

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_

