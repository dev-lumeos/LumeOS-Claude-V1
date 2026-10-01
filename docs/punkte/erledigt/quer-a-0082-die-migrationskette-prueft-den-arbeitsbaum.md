---
nr: A-82
typ: befund
modul: quer
schwere: mittel
angelegt: 2026-09-29

braucht: []
kind_von: null

quellen:
  - docs/punkte/00-INDEX.md

erledigt: 2026-10-01
commit: 724cfd29
beruehrt:
  tabellen: []
  dateien:
    - tools/migration-kette-pruefen.mjs
    - package.json

zahlen:
  gemessen: 2026-09-29
  blockaden_am_tag: 2
  betroffene_agenten: 2
  blockierte_bereiche: 3
---

# Die Migrationskette prueft den Arbeitsbaum, nicht das Staging

`[cmd]` **Zweimal am 2026-09-29 hat eine halbfertige Migration eines
Agenten den Commit eines anderen blockiert:**

    14:26  Claude Code, G-537 fertig, wollte apps/ committen
           ROT: 20260929115000_g536_goal_strategies.sql (Codex, 12:02)

    15:05  Orchestrator, reiner docs/-Commit, sechs Punktdateien
           ROT: 20260929080315_g538_goal_phase_targeting.sql (Codex, laufend)

`[read]` **Der Waechter hat sachlich recht** — eine Migration ohne
Kettenschritt ist ein echter Befund, und er soll gefunden werden. Das
Problem ist der **Zeitpunkt**: er prueft den ganzen Arbeitsbaum, also
auch Dateien, die gar nicht committet werden.

**Die Folge, und sie ist die teure:** waehrend ein Agent in
`supabase/` baut, kann niemand committen — nicht in `apps/`, nicht in
`docs/`, nicht in `tools/`. Und da drei Bereiche parallel bearbeitet
werden, ist das der Normalfall, nicht die Ausnahme.

`[read]` **Genau das erzeugt die Versuchung, die niemand will:**
`--no-verify`. Der Waechter, der Sorgfalt erzwingen soll, macht ihre
Umgehung zur Gewohnheit — und beim naechsten Mal umgeht sie jemand, der
tatsaechlich etwas Kaputtes committet.

## Was zu tun ist — und was ausdruecklich nicht

**Nicht** den Waechter entschaerfen. Er findet Richtiges.

Die Pruefung auf **das, was committet wird**, beziehen:
`git diff --cached --name-only` statt des Arbeitsbaums. Eine Migration,
die nicht im Staging steht, ist kein Bestandteil dieses Commits.

Dann gilt weiter: wer eine Migration committet, braucht ihren
Kettenschritt. Und wer eine halbfertige im Baum liegen hat, blockiert
niemanden.

`[annahme]` **Die gleiche Frage stellt sich fuer die anderen
Baum-Waechter** — `encoding-pruefen` zaehlt 21.619 Dateien, `specs` 159,
`quellen` 49 Mockups. Bei denen ist die Blockade unwahrscheinlicher, weil
ein halbfertiger Zustand dort selten rot wird. Zu pruefen, nicht zu
unterstellen: welcher Waechter liest den Baum, welcher das Staging.

## Bis dahin

`[read]` **Der Orchestrator wartet, statt zu umgehen.** Ein Docs-Commit,
der auf einen Agenten wartet, kostet Minuten; ein `--no-verify`, das zur
Gewohnheit wird, kostet die Pruefung.

Praktisch heisst das: Code und die zugehoerige Doku gehen **in einen
Commit**, wenn der Agent gemeldet hat. Das ist ohnehin das bessere
Paket — der Commit traegt dann den Bau und seine Abnahme.

## Abnahme 2026-10-01 — `724cfd29`

`[cmd]` **Mit A-84 behoben.** `migration-kette-pruefen --staging` liest
den Zustand nach dem Commit: HEAD plus Staging minus die Geloeschten, und
das Manifest ueber `git show :supabase/_pipeline/kette.json`.

`[cmd]` **Gegenprobe in beide Richtungen:**

    Migration nur im Arbeitsbaum      Baum rot, Staging GRUEN
    dieselbe im Staging               BEIDE rot
    aufgeraeumt                       beide gruen

`[read]` **Die zweite Zeile ist die, auf die es ankommt** — die Lockerung
laesst keine Migration ohne Kettenschritt durch. **Nur die Datei eines
anderen blockiert den eigenen Commit nicht mehr.**

`[cmd]` **Es war nicht nur die Dateiliste, sondern auch das Manifest.**
`kette.json` kam ebenfalls aus dem Arbeitsbaum — ein Agent, der einen
Kettenschritt eintraegt und noch nicht stagt, haette den Befund
andersherum verdeckt. Beide Seiten lesen jetzt dieselbe Quelle.
