---
nr: G-586
typ: fehler
modul: quer
schwere: hoch
angelegt: 2026-10-02
agent: claudecode
beauftragt: 2026-10-02

braucht: [G-553]
kind_von: G-553

quellen:
  - docs/punkte/erledigt/goals-g-0553-ein-tokenfehler-sieht-aus-wie-ein-datenfehler.md
  - docs/punkte/erledigt/coach-g-0582-der-coach-alarm-hat-keinen-aufrufer.md

beruehrt:
  tabellen: []
  dateien:
    - packages/shared/src/supabase/session.ts
    - apps/web/src/lib/fehler/ladefehler.ts
---

# Ein Uhrensprung wirft den Nutzer raus, statt die Sitzung zu erneuern

## Auftrag — Kopf

    AUFTRAG FUER Claude Code - G-586: erst den Beweis, dann einmal
                                     erneuern
    Bereich: packages/shared/src/ (der Sitzungsweg)
             apps/web/src/lib/fehler/
    Fremd:   supabase/ gehoert Codex. Die Umgebung (Docker, Uhren)
             aenderst du NICHT - du belegst sie. docs/ gehoert dem
             Orchestrator, auch diese Punktdatei.
    Stand:   2026-10-02

## Der Befund — und was G-553 schon geklaert hat

`[cmd]` **Tom sieht es heute wieder**, 16:07, im Browser auf
`localhost:3200`:

    Sitzung abgelaufen
    Die Sitzung ist nicht mehr gueltig. Melde dich neu an.
    user_goals: JWT issued at future

`[cmd]` **G-553 hat die EINORDNUNG richtig gestellt** (erledigt
2026-09-30, `20992639`): `JWT issued at future` ist ein
**Sitzungsfehler**, nicht ein Datenfehler. **Die Meldung ist also
korrekt** — sie steht hier nicht zur Debatte.

`[read]` **Was G-553 NICHT behandelt hat: die Ursache und die Reaktion.**
Tom sieht denselben Satz zum wiederholten Mal. **Ein Fehler, der dreimal
auftritt, ist kein Einzelfall mehr.**

`[cmd]` **Der Satz kommt von PostgREST selbst**, wenn das `iat` des
Tokens hinter seiner Uhr liegt. **PostgREST hat dafuer keine Toleranz** —
keine Sekunde.

`[cmd]` **Vom Orchestrator gemessen, 2026-10-02 um 16:10, drei Proben:**

    Postgres minus Host = 837 ms
    Postgres minus Host = 755 ms
    Postgres minus Host = 753 ms

**Die Containeruhr laeuft dem Host voraus**, konsistent um gut 0,75 s.
`[annahme]` **Daraus folgt noch nichts** — das Token wird in einem
Container gepraegt und in einem Container geprueft, beide teilen dieselbe
Uhr. **Meine Vermutung ist ein Ruecksprung der Containeruhr nach
Standby**, aber niemand hat es belegt.

`[cmd]` **G-582 hat denselben Satz gesehen und als Umgebungsfehler
verworfen:** keine Uhrendrift im Messfenster, Token-`iat` 0,5 s in der
Vergangenheit, ein zweiter Besuch rendert vollstaendig. **Das war
richtig gemessen und es widerspricht Toms Fall nicht** — bei ihm bleibt
es stehen.

## Auftrag

**A1 — den Beweis einfangen, bevor etwas gebaut wird.** `[read]` **Ohne
diese drei Zahlen bleibt jede Erklaerung eine Vermutung:** beim Fehler
das `iat` und `exp` des Tokens, die Uhr des pruefenden Dienstes und die
Hostuhr, alle drei im selben Augenblick. **Wo das Protokoll hingehoert,
entscheidest du** — aber es muss ohne Debugger reproduzierbar sein, und
es darf **kein Token und kein Geheimnis** in ein Log schreiben: Zeiten,
keine Inhalte.

**A2 — einmal erneuern statt rausschmeissen.** `[read]` **Das ist der
Teil, der Tom heute hilft, und er ist unabhaengig von A1 richtig:** bei
`JWT issued at future` wird die Sitzung **einmal** erneuert und die
Abfrage wiederholt. **Erst wenn das auch faellt, kommt die
Anmeldeaufforderung.** `[cmd]` **Nicht die Einordnung aendern** — der
Fehler bleibt ein Sitzungsfehler (G-553), er wird nur anders behandelt.

**A3 — die Grenze benennen.** `[read]` **Eine Erneuerungsschleife ist
schlimmer als die Fehlermeldung.** Genau einmal, mit einem Beleg, dass
ein zweiter Fehlschlag durchfaellt — **Sabotage in beide Richtungen.**

**A4 — wenn A1 die Uhr belegt, sag was die Umgebung braucht**, und
aender sie nicht: Docker-Resync, harter Zeitgeber, oder eine Toleranz,
die PostgREST gar nicht kennt. `[read]` **Ein Satz Befund, kein Eingriff.**

**Nicht Teil:** die Einordnung der Meldung (G-553, erledigt), Auth-Umbau,
und die Uhr selbst.

**Zu belegen:** die drei Zeiten aus A1 bei einem echten Fehlerfall ·
die Erneuerung einmal ausgeloest und zurueckgelesen · der zweite
Fehlschlag faellt durch · Sabotage je Zusicherung in beide Richtungen ·
`pnpm gate` gruen mit Testzahl · nichts committen.

`[read]` **Kein Kettenlauf.** Und wenn du den Fehler nicht reproduzieren
kannst: **das ist ein Befund und keine Niederlage** — dann liefert A1 den
Weg, ihn beim naechsten Mal einzufangen, und A2 steht trotzdem.
