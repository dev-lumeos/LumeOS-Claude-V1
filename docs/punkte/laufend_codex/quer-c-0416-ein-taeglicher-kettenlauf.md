---
nr: C-416
typ: feature
modul: quer
schwere: hoch
angelegt: 2026-09-07
braucht: []
kind_von: C-415
entscheidung: null
agent: codex
beauftragt: 2026-09-07
beruehrt:
  dateien:
    - tools/backup-wachstum.mjs
zahlen:
  gemessen: 2026-09-07
  gate_sekunden: 31.6
  kette_sekunden: 266.6
  schritte: 157
---

# C-416 — ein taeglicher Kettenlauf

## Befund

Aus C-415, Codex, 2026-09-07.

`[cmd]` **Der Vollkettenlauf dauert 266,6 s ueber 157 Schritte.**
`[cmd]` **`pnpm gate` dauert 31,6 s.**

`[read]` **Seine Empfehlung: nicht ins Gate, sondern taeglich als
Wegwerf-Lauf** — **rund 4,5 Minuten am Tag.**

`[read]` **Richtig.** **Ein Vollauf je Commit waere achtmal so
teuer wie das Gate** — **und niemand wuerde ihn abwarten.**

## Warum es einen Waechter braucht

`[cmd]` **C-415 hat gezeigt: die Kette war seit dem 05.09. gebrochen
und niemand hat es gemerkt** — **weil alles live eingespielt wurde.**

`[read]` **Zwei Tage** — **und in dieser Zeit entstanden C-405,
C-407, C-408, C-411, C-412, C-413, C-414.**

`[read]` **Alles davon steht auf einem Fundament, das nicht neu
aufgebaut werden konnte.**

## Zu bauen

`[read]` **Ein taeglicher Lauf auf einer Wegwerf-Datenbank, der bis
zum Ende geht** — **und meldet, wenn nicht.**

`[cmd]` **Und die Meldung muss jemanden erreichen** — **C-410 hat
gezeigt, dass ein roter Test ohne Empfaenger eine Notiz ist.**

`[read]` **Wo die Meldung landet, ist zu klaeren:** `[cmd]` **es gibt
keinen CI-Lauf, Tom arbeitet am Desktop.**

`[read]` **Vielleicht reicht eine Datei, die der Punktelauf
liest** — **wie das Backup-Manifest.**

## Auftrag

**Mitbeauftragt: C-31, C-155.** Bericht in diese Datei.

**Beauftragt am 2026-09-07.**

### 1 · C-416 — der taegliche Lauf

`[read]` **Deine Empfehlung uebernommen:** **nicht ins Gate,
taeglich als Wegwerf-Lauf.**

`[cmd]` **266,6 s gegen 31,6 s Gate** — **achtmal so teuer.**

`[read]` **Die offene Frage ist, wo die Meldung landet:** `[cmd]`
**es gibt keinen CI-Lauf, Tom arbeitet am Desktop.**

`[read]` **Vielleicht reicht eine Datei, die der Punktelauf
liest** — **wie `backup/_manifests/`.** `[cmd]` **Dort meldet
`backup-wachstum.mjs` bei ueber sieben Tagen ohne Inventur.**

`[read]` **Miss, was am wenigsten kostet und trotzdem
ankommt.**

### 2 · C-31 — die Admin-Oberflaeche

`[cmd]` **Der Schreibweg steht seit heute:** `curate_food_tag` **mit
Rechteschranke.**

`[cmd]` **Und `recipe_curation_candidates` mit drei Tabellen**
(C-411).

`[read]` **Miss, was die Oberflaeche braeuchte** — **das ist ein
UI-Auftrag, aber du kennst die Vertraege.**

### 3 · C-155 — zwei Befunde in `@supabase/ssr`

`[cmd]` **Du hast gemessen: beide bestehen, der Admin nutzt den
gefaehrdeten Pfad.**

`[cmd]` **A-69 ersetzt es nicht** — **nur ein transitives
`ws`-Advisory ueberschneidet sich.**

`[read]` **Miss, was ein Wechsel kosten wuerde** — **nicht
wechseln.** `[read]` **Ein Abhaengigkeitswechsel beruehrt beide
Agenten gleichzeitig.**

### Was nicht zu tun ist

**Keine Abhaengigkeit aktualisieren.**
**Nie gegen die laufende Datenbank testen.**
`apps/` nicht anfassen.
Nicht committen, nicht stagen, nicht pushen.

### Der Dev-Server gehoert dir nicht

`[cmd]` **Kein `neustart`, kein `start`, kein `aufraeumen`.**

### Nachweis

    taeglicher Lauf   gebaut, Meldung erreicht jemanden
    Gegenprobe        ein eingebauter Bruch wird gemeldet
    C-31              was die Oberflaeche braucht
    C-155             was ein Wechsel kosten wuerde

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
