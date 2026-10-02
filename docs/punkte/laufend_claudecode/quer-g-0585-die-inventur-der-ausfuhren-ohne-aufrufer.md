---
nr: G-585
typ: befund
modul: quer
schwere: mittel
angelegt: 2026-10-02
agent: claudecode
beauftragt: 2026-10-02

braucht: [G-583]
kind_von: G-583

quellen:
  - docs/punkte/erledigt/quer-g-0583-drei-reste-ohne-aufrufer.md
  - docs/punkte/erledigt/nutrition-g-0581-ein-modal-ohne-aufrufer-mit-eigener-wahrheit.md
  - docs/punkte/erledigt/quer-g-0571-sechs-schreibwege-ohne-aufrufer.md

beruehrt:
  tabellen: []
  dateien:
    - apps/web/src
    - apps/coach/src
    - packages
---

# Die Inventur der Ausfuhren ohne Aufrufer

## Auftrag — Kopf

    AUFTRAG FUER Claude Code - G-585: einmal zaehlen, was niemand ruft
    Bereich: apps/web/src · apps/coach/src · packages/
             (nur LESEN und melden - keine Entfernung in diesem Punkt)
    Fremd:   supabase/ gehoert Codex (C-295). docs/ gehoert dem
             Orchestrator, auch diese Punktdatei.
    Stand:   2026-10-02

## Warum dieser Punkt kommt

`[cmd]` **Sieben Faelle derselben Klasse sind einzeln und durch Zufall
gefunden worden:** `logPhoto` (G-421), `messungAnlegenAktion` (G-422),
`muskelwerte()` (G-441), `wertKommtVonGruppe` (G-446/G-583),
`LiveWorkout` (G-217/G-583), `MealPlanActivationModal` samt
`plan-detail-lage.ts` (G-581) — **und sechs Datenbankfunktionen auf der
anderen Seite** (G-571, mit G-582 geschlossen).

`[read]` **Jeder einzelne war ein Nebenfund.** Niemand hat je die Liste
gemacht. **Dieser Punkt macht die Liste, und zwar genau einmal** — damit
die naechsten nicht wieder zufaellig auffallen.

## Auftrag

**A1 — zaehlen, ohne Kommentare, ueber alle drei Baeume.** Je Ausfuhr
(`export function`, `export const`, Default-Ausfuhr) die Zahl der
**echten Aufrufer**: Importe und Verwendungen, **ohne** Kommentare, ohne
Tests, ohne die eigene Datei. `[cmd]` **Die Falle kennst du:** in G-446
blieb der Waechter gruen, weil der Name in seiner eigenen Begruendung
ueberlebte, und in G-583 hielt ein leerer Import
(`import { } from './plan-detail'`) eine ganze Datei am Leben. **Ein
leerer Import ist kein Aufrufer.**

**A2 — die Liste, nach Lage geordnet**, nicht alphabetisch:

    tot       0 Aufrufer, niemand nennt es ausser Kommentaren
    geliehen  nur von Tests gerufen
    einmalig  genau 1 Aufrufer (das ist normal, nur als Zahl)

`[read]` **Zu jedem toten Eintrag ein Satz:** welcher Punkt hat ihn
ausgetragen, und steht die Begruendung in der Datei? **Wenn kein Punkt
dazu existiert, ist das selbst der Fund.**

**A3 — nichts entfernen.** `[read]` **Das ist der ganze Unterschied zu
G-583:** dort waren drei Faelle entschieden, hier ist nichts entschieden.
**Eine Inventur, die nebenbei loescht, ist keine Inventur.** Ich mache
aus der Liste Punkte, je nach Groesse einen oder mehrere.

**A4 — die Zahl, die du oben nennst, muss nachzaehlbar sein:** nenne den
Befehl, mit dem du gezaehlt hast, und die Dateizahl, ueber die er lief.
`[cmd]` In G-583 waren es 701 Dateien — **diese Zahl gehoert in den
Bericht**, sonst weiss der naechste nicht, was „alle" bedeutete.

**Nicht Teil:** Entfernen (folgt als eigene Punkte), `supabase/` und die
sechs Datenbankfunktionen (G-571, geschlossen).

**Zu belegen:** die Liste · der Zaehlbefehl und die Dateizahl · je totem
Eintrag der austragende Punkt oder der Hinweis, dass keiner existiert ·
`pnpm gate` gruen · **nichts geaendert ausser dieser einen Sache: nichts.**
Wenn der Lauf dich zwingt, etwas zu aendern, ist das ein Befund.

`[read]` **Keine Datenbank, kein Kettenlauf, kein Schirm.**
