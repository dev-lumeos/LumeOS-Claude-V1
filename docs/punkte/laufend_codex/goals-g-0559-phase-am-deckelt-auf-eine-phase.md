---
nr: G-559
typ: fehler
modul: goals
schwere: hoch
angelegt: 2026-09-30
beauftragt: 2026-09-30
agent: codex

braucht: [G-538, G-544]
kind_von: G-544

quellen:
  - docs/punkte/erledigt/goals-g-0544-der-phase-reiter-zeigt-keine-zeitachse.md
  - docs/punkte/00-INDEX.md

beruehrt:
  tabellen:
    - goals.goal_phases
  funktionen:
    - goals.phase_am
  dateien:
    - apps/web/src/app/v2/goals/ansicht.tsx
    - apps/web/src/lib/goals/lesen.ts

zahlen:
  gemessen: 2026-09-30
  position_limit_1: 933
---

# `phase_am` deckelt auf eine Phase, und der Phasenkopf haengt daran

## Der Befund

`[cmd]` **`goals.phase_am()` endet auf `LIMIT 1`** — vom Orchestrator
selbst nachgelesen, Position 933 in `pg_get_functiondef`. Solange eine
Anzeige an dieser Funktion haengt, **kann** sie nur eine Phase zeigen,
egal was in der Tabelle steht.

`[cmd]` **Claude Code hat es beim Bau von G-544 gefunden und gemeldet,
statt es mitzunehmen:** die Zeitachse liest jetzt ueber
`ladeOffenePhasen` die Tabelle. **`PhaseEcht` oben im Reiter liest
weiter `phase_am`.** Die Kopfmarke hat er berichtigt, weil sie direkt
neben der neuen Achse eine andere Zahl behauptete — bei zwei offenen
Phasen stand dort *„Phase lean bulk"*.

`[read]` **Damit stehen zwei Wahrheiten im selben Reiter:** die Achse
zeigt zwei Phasen, der Phasenkopf eine. **Das ist der Zustand, den
G-544 zur Haelfte behoben hat.**

## Warum das mehr ist als eine Anzeige

`[read]` Seit G-538 laeuft der Eindeutigkeitsindex auf `goal_id`, nicht
auf `user_id` — **mehrere offene Phasen sind der Normalfall, nicht die
Ausnahme.** Eine Funktion, die davon eine zurueckgibt, gibt eine
beliebige zurueck. `[annahme]` **Welche, entscheidet die Sortierung im
Rumpf** — und wer sie nicht kennt, liest das Ergebnis als *die* Phase.

`[read]` **Zu klaeren ist deshalb nicht nur die Anzeige, sondern die
Funktion:** wer ruft `phase_am` sonst noch, und was erwartet der
Aufrufer? Eine Funktion mit `LIMIT 1` kann richtig sein, wenn sie
*,,die Phase an einem Stichtag fuer EIN Ziel"* heisst. Sie ist falsch,
wenn sie *,,die Phase des Nutzers"* heisst.

## Auftrag

    AUFTRAG FUER Codex - G-559: phase_am gibt eine Phase zurueck, wo
                                mehrere gelten
    Bereich: supabase/_pipeline/11_goals/
             supabase/_pipeline/_validierung/
             supabase/_pipeline/kette.json
    Fremd:   apps/ gehoert Claude Code, der gerade an G-539 baut
             (Phasen-Editor) - nichts dort anfassen. Die Anzeige, die
             an dieser Funktion haengt, ist SEIN Teil und wird hier
             nur gemeldet, nicht geaendert.
             docs/ gehoert dem Orchestrator, auch diese Datei: der
             Bericht kommt als Antwort, nicht als Anhang hier.
    Stand:   2026-09-30

**Zuerst lesen, vollstaendig:** diese Datei, und
`docs/sessions/2026-09-30-uebergabe.md` fuer den Stand von Goals.

**A1 — wer ruft die Funktion, und was erwartet der Aufrufer.** Miss es,
und sag, wie du abgegrenzt hast: Kettenschritte, andere Funktionen,
Sichten, Regeln, die Anwendung. **Je Aufrufer die Frage: braucht er
EINE Phase oder alle?** Ein Aufrufer, der eine Phase je Ziel meint, ist
richtig bedient; einer, der ,,die Phase des Nutzers" meint, ist seit
G-538 falsch.

**A2 — die Bedeutung festlegen, mit Beleg aus A1.** Zwei Wege, und die
Messung entscheidet, nicht der Geschmack:

    entweder  phase_am bekommt goal_id als Parameter und heisst dann
              ,,die Phase EINES Ziels an einem Stichtag" - der LIMIT 1
              ist dann richtig und wird begruendet
    oder      phase_am gibt eine Menge zurueck, und jeder Aufrufer
              entscheidet selbst

**Welcher Weg, sagt A1.** Wenn beide Bedeutungen gebraucht werden, sind
es zwei Funktionen mit verschiedenen Namen — **keine mit einem Schalter.**

**A3 — die Sortierung im Rumpf benennen.** Solange `LIMIT 1` steht,
entscheidet sie, WELCHE Phase zurueckkommt. Steht keine `ORDER BY` da,
ist das Ergebnis beliebig — **das ist zu melden, auch wenn es heute
zufaellig passt.**

**A4 — die Gegenprobe gegen den Seed, nicht nur den Bestand.** Die Lehre
aus G-556: die Kette baut neu. Ein Nutzer mit zwei offenen Phasen muss
im Seed vorkommen, sonst prueft nichts den neuen Fall.

**Nicht Teil:** die Anzeige in `apps/web` (`PhaseEcht`). Was die Funktion
kuenftig liefert, melde in einem Satz, damit der naechste Auftrag an
Claude Code darauf aufsetzen kann.

**Zu belegen:** Nachweise auf `test-user@lumeos.local` · voller
Kettenlauf gruen mit Schrittzahl · rote Gegenprobe zuerst · Wegwerf-DB
verworfen mit Zaehler · kein `db push` · nichts committen · welcher Lauf
die neue Probe aufruft.
