---
nr: G-585
typ: befund
modul: quer
schwere: mittel
angelegt: 2026-10-02
commit: f4be19e2
erledigt: 2026-10-02
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

---

## Abnahme — 2026-10-02, kein Commit (A3: nichts geändert)

`[cmd]` **Die Inventur steht und hat nichts angefasst** — `git status` auf
`apps/`, `packages/` und `docs/` ist leer, Gate grün, 2.550 Tests.
**A3 war die Bedingung, und sie ist eingehalten.**

| Lage | Zahl |
| --- | --- |
| tot — 0 fremde Aufrufer, 0 Tests, auch intern ungenutzt | **56** |
| nur intern — 0 fremde, in der eigenen Datei benutzt | 328 |
| geliehen — nur von Tests gerufen | 279 |
| einmalig — genau 1 fremder Aufrufer | 1.329 |
| mehrfach | 957 |

Heuhaufen: **796 Dateien**, 2.949 benannte Ausfuhren, Kommentare
abgestreift (Block, Zeile und JSX) — die Falle aus G-446.

`[cmd]` **Mein Auftrag nannte drei Bäume. Es sind sechs Apps.** Er hat es
gemessen und korrigiert: `apps/admin` (11 Dateien) ruft
`isCurrentUserAdmin` aus `packages/shared` — **mit nur drei Bäumen hätte
die Liste eine lebende Ausfuhr als tot gemeldet.** Gezählt hat er über die
drei des Auftrags, gesucht über vier. **Das ist die vierte Teilmessung von
mir in zwei Tagen**, nach den zehn Trennern, den vier Präsens-Zeilen und
den 86 Rückfällen.

`[read]` **Der erste Lauf meldete 385 tot, und er hat seine eigene Zahl
angezweifelt, weil sie unplausibel war.** Die Stichprobe zeigte: vier von
fünf werden in der eigenen Datei benutzt. **385 wurde zu 56 — nicht durch
eine Messung am Bestand, sondern durch Zweifel am Zähler.** Das ist die
Lehre, die ich mitnehme.

`[cmd]` **Drei Befunde sind daraus Punkte geworden:**

    G-587  createServiceClient ohne Aufrufer, umgeht die RLS   next/
    G-588  sechs Serveraktionen ohne Aufrufer                  todos/
    G-589  328 Ausfuhren zu viel, und wie 385 zu 56 wurde      todos/

`[cmd]` **Selbst nachgemessen bei G-587**, weil es das Einzige mit
Sicherheitsbezug ist: `createServiceClient`
(`packages/shared/src/supabase/server.ts:6`) nutzt
`SUPABASE_SERVICE_ROLE_KEY` und hat **null Aufrufer** — die restlichen
Treffer sind Werkzeugzwischenspeicher. **Eine unbenutzte Ausfuhr ist
harmlos, diese nicht.**

`[read]` **Und drei Einträge, die beim Entfernen Schaden machen würden:**
`DashboardEntwurf`, `TrendBadge` und `Datumsnavigation` stehen als
Zeichenkette in Vollständigkeitsprüfern. **Kein Aufrufer — aber wer sie
löscht, macht einen Wächter rot, ohne es zu erwarten.** Das gehört in
jeden Punkt, der sie anfasst.
