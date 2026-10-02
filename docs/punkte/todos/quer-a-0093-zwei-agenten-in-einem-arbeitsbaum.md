---
nr: A-93
typ: fehler
modul: quer
schwere: hoch
angelegt: 2026-10-02

braucht: []
kind_von: A-81

quellen:
  - docs/punkte/erledigt/medical-g-0578-der-laborimport-hat-keine-oberflaeche.md
  - docs/punkte/erledigt/goals-g-0576-weight-als-untertyp-eigenes-ohne.md

beruehrt:
  tabellen: []
  dateien:
    - package.json
    - .githooks/
---

# Zwei Agenten in einem Arbeitsbaum, und der Commit zahlt dafuer

## Der Befund

`[cmd]` **Dieselbe Ursache hat an drei Tagen vier Mal Schaden
angerichtet**, und jedes Mal anders:

    2026-09-30  G-576  ein Commit nahm Claude Codes laufende
                       ladefehler.ts-Umbenennung mit; korrigiert mit
                       git reset --soft HEAD~1
    2026-10-01  G-560  Gate ROT am ersten Schritt (tools/__tests__),
                       weil A-91 dort gerade zwei rote Proben hatte;
                       --no-verify, Rest des Gates einzeln belegt
    2026-10-02  A-92   Gate ROT an @lumeos/web#build, weil G-579
                       mitten im Umbau stand (plan-werkbank-ui.tsx:227,
                       Cannot find name 'Zyklusauswahl'); drei Commits
                       mit --no-verify
    2026-10-02  G-578  der Commit traegt sechs Zeilen aus G-579: die
                       drei Plansprung-Fachtexte in ladefehler.ts, von
                       mir als ganzer Pfad gestagt

`[read]` **Das sind zwei verschiedene Fehler mit einer Ursache.**

**Erstens: das Gate baut den Arbeitsbaum, nicht den Index.** Ein Commit,
dessen Staging sauber ist, wird rot, weil ein anderer Agent im selben
Baum gerade mitten in einer Datei steht. `[read]` **Der Nachweis gilt
dann fuer einen Stand, den niemand committen will** — und der Ausweg
`--no-verify` kostet genau die Sicherheit, fuer die das Gate existiert.

**Zweitens: `git add <pfad>` nimmt alles, was in der Datei steht.** Bei
einer Datei, die zwei Auftraege anfassen — und
`apps/web/src/lib/fehler/ladefehler.ts` ist seit G-555 genau so eine, sie
gehoert allen Modulen —, wandert fremde Arbeit mit. `[cmd]` **Die Regel
„vor jedem Commit `git diff --cached --name-only` UND den vollstaendigen
`git status` lesen" hat das zweimal gefangen und einmal nicht:** sie
zeigt Pfade, keine Hunks. **Der Pfad sah richtig aus.**

## Was zu entscheiden ist, vor dem Bau

`[read]` **Drei Wege, und sie kosten sehr verschieden viel:**

1. **Das Gate auf den Index richten.** Technisch: in einer temporaeren
   Auscheckung des Index bauen (`git stash --keep-index`, oder ein
   `git worktree` aus dem Index). **Dann misst der Nachweis genau den
   Commit.** Kostet Laufzeit je Commit und eine robuste
   Aufraeumbehandlung — ein abgebrochener Lauf darf keinen halben
   Arbeitsbaum zuruecklassen.
2. **Je Agent ein eigener `git worktree`.** Dann gibt es das Problem
   nicht mehr, aber drei Arbeitsbaeume heissen drei `.next`, drei
   `node_modules`-Verknuepfungen und drei Dev-Server-Haeuser. `[cmd]`
   **Bei 414,4 MiB je Dump und der heutigen Platzlage ist das nicht
   gratis** (A-79).
3. **Nur die Staging-Seite haerten:** ein Waechter, der vor dem Commit
   prueft, ob eine gestagte Datei Zeilen traegt, die zu einer anderen
   Punktnummer gehoeren — die Punktnummer steht in den Kommentaren
   (`G-579:`), das ist maschinell lesbar. **Billig, faengt aber nur den
   zweiten Fehler, nicht den ersten.**

`[annahme]` **3 zuerst, dann 1** — der Staging-Waechter ist in einer
Stunde gebaut und haette den G-578-Fehler gefangen; das Gate auf den
Index zu richten ist der eigentliche Fix, aber er beruehrt jeden Commit
jedes Agenten. **Das ist eine Vermutung, und die Entscheidung gehoert
Tom.**

**Nicht Teil:** die Laufzeit des Gates selbst und der naechtliche
Vollauf (A-90, A-91).

**Zu belegen, sobald entschieden:** der Waechter mit Sabotage in beide
Richtungen — eine gestagte Datei mit fremder Punktnummer muss rot werden,
eine ohne gruen · die vier Faelle oben als Proben nachgestellt · `pnpm
gate` gruen.
