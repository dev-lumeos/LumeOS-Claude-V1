---
nr: G-577
typ: fehler
modul: goals
schwere: hoch
angelegt: 2026-10-01
commit: a640e7af
erledigt: 2026-10-02
agent: claudecode
beauftragt: 2026-10-01

braucht: [G-571]
kind_von: G-571

quellen:
  - docs/punkte/erledigt/quer-g-0571-sechs-schreibwege-ohne-aufrufer.md
  - docs/punkte/erledigt/quer-g-0535-sechs-funktionen-lesen-den-alten-sitzungsnamen.md

beruehrt:
  funktionen:
    - goals.body_circumference_write
  dateien:
    - apps/web/src/app/v2/goals/
    - apps/web/src/lib/goals/
---

# Die Umfangserfassung hat keinen Schreibweg

## Auftrag

    AUFTRAG FUER Claude Code - G-577: die Umfangserfassung bekommt
                                     ihren Schreibweg
    Bereich: apps/web/src/app/v2/goals/
             apps/web/src/lib/goals/
    Fremd:   supabase/ gehoert Codex (A-91, der taegliche Dump).
             goals.body_circumference_write ist GEBAUT und geprueft -
             du rufst sie, du aenderst sie nicht.
             docs/ gehoert dem Orchestrator, auch diese Punktdatei:
             der Bericht kommt als Antwort, nicht als Anhang hier.
    Stand:   2026-10-01

**Zuerst lesen, vollstaendig:** diese Datei und
`docs/punkte/erledigt/quer-g-0571-sechs-schreibwege-ohne-aufrufer.md`.

## Der Befund

`[cmd]` **Bei der Abnahme von G-535 gezaehlt:**
`goals.body_circumference_write` hat **null Aufrufer** in `apps/` und
`packages/`. Die Funktion ist gebaut, geprueft, seit G-535 auf
`auth.uid()` umgestellt — **und ein Nutzer kann keinen Koerperumfang
eintragen.**

`[read]` **Tom hat am 2026-10-01 entschieden, dass alle vier Bereiche
eine Oberflaeche bekommen.** Dies ist der erste und der billigste: er
beruehrt kein anderes Modul und braucht keinen neuen Ort fuer
Fehlertexte.

`[cmd]` **Die Gegenseite steht:** die Reiter *Body metrics* und
*Measurements* lesen `body_measurements` und `body_circumferences`
schon (`tab-koerper.tsx`, echt seit GO-16). **Es fehlt der Weg hinein,
nicht der Weg heraus.**

## Auftrag

**A1 — messen, was die Funktion verlangt.** Signatur und Parameter aus
`pg_proc`, nicht aus einer Abschrift. `[cmd]` **Mit `prokind = 'f'`**,
sonst trifft `pg_get_functiondef` ein Aggregat.

**A2 — der Schreibweg, mit der Fehlerbehandlung von G-555.**
`apps/web/src/lib/fehler/ladefehler.ts` liegt seit G-555 querliegend und
nimmt den Modulnamen als Parameter. **Benutzen, nicht neu bauen.**
`[read]` **Faellt die Funktion fachlich** (fremder Nutzer, fehlende
Pflichtangabe), **ist das ein Datenfehler und kein Sitzungsfehler** —
die Unterscheidung ist gebaut.

**A3 — die Eingabe gehoert dorthin, wo die Zahlen stehen.** Messen, wo
das ist: *Measurements* oder *Body metrics*. **Sag, wie du abgegrenzt
hast**, und nimm keinen dritten Ort.

**A4 — ein Umfang ohne Datum ist kein Umfang.** `[read]` **Der Ortstag
des Nutzers**, wie bei `meals` und `goal_phases` — kein `timestamptz`.
**Und zwei Messungen am selben Tag fuer dieselbe Stelle:** sagt die
Datenbank dazu etwas? Wenn nicht, melden statt entscheiden.

**A5 — ein Waechter, der den Aufrufer haelt.** `[read]` **Genau diese
Luecke ist zwei Monate unbemerkt geblieben**, weil niemand gezaehlt hat,
ob eine gebaute Funktion erreicht wird. **In beide Richtungen zu
belegen.**

**Nicht Teil:** die drei anderen Schreibwege (Laborimport, Plansprung,
Coach-Alarm — G-571), und die Frage, ob ein Ziel mehrere Messgroessen
traegt (G-575, wartet auf Tom).

**Zu belegen:** die Signatur aus `pg_proc` · ein Umfang auf
`test-user@lumeos.local` eingetragen und zurueckgelesen, danach
entfernt · der fachliche Fehlerfall am Schirm (fremder Nutzer) ·
Bild vorher und nachher · Sabotage je Waechter in beide Richtungen ·
`pnpm gate` gruen mit Testzahl · nichts committen. **Kein Kettenlauf** —
die Funktion ist gebaut, du rufst sie nur.

---

## Abnahme — 2026-10-02, Commit `a640e7af`

`[cmd]` **Gezaehlt am Ergebnis:**

| Merkmal | gezaehlt |
| --- | --- |
| `.rpc('body_circumference_write', …)` | genau 1 — `lib/goals/umfang-write.ts:91` |
| der Waechter | `lib/goals/__tests__/g577-umfang-schreibweg.test.ts:87` haelt genau diese Zeile als Text — er zaehlt den Aufruf, nicht den Namen |
| neue Dateien | `umfang-write.ts`, `umfang-rechnung.ts`, `app/v2/goals/umfang-aktionen.ts` |
| Bilder | 5 in `docs/bilder/g577/` — Reiter und Modal vorher, ausgefuellt, Konflikt, nachher |
| Commit | `a640e7af`, 10 Dateien, +837/−9 |

`[read]` **Die Form war gegen die Erwartung, und das ist der wertvollste
Teil des Berichts:** die Funktion nimmt **einen Satz mit dreizehn
Umfangsspalten**, nicht eine Zeile je Stelle. Alle 13 abgeleiteten
Parameternamen wurden gegen die echte Signatur geprueft, 0 Abweichungen.
**Eine Annahme ueber die Form haette den ganzen Aufrufer falsch
gebaut.**

`[cmd]` **A4 hat die Datenbank entschieden, nicht der Agent:**
`body_circumferences_user_date_time_uq` laeuft ueber
`(user_id, measurement_date, measurement_time)` — zwei Messungen am
selben Tag gehen, wenn die Uhrzeit abweicht. **Deshalb ist
`measurement_time` Pflicht und vorbelegt**, und der Konflikt erscheint am
Zeitfeld. Die Grenzen je Stelle kommen aus
`body_circumferences_positive_ck`, die vier Quellen aus
`body_circumferences_source_ck` — **nicht** aus `BF_METHODEN`, das ist
ein anderer CHECK an einer anderen Tabelle.

`[cmd]` **Der Griff in Codex' Bereich, auf meine Freigabe und als eigener
Absatz gemeldet:** `535_auth_uid_legacy_readers.sql` ganz eingespielt,
nicht als Ausschnitt. Alter GUC 6 → 0, `auth.uid()` 0 → 6, Sicherung in
`backup/g577-535-vorher.sql` und `-nachher.sql`. **Damit ist der
42501-Blocker fuer alle sechs Funktionen weg** — G-578 hat davon direkt
profitiert.

`[read]` **Der Vermerk war zweifach falsch:** er nannte
`goals.body_measurements` (die Umfaenge liegen in `body_circumferences`)
und einen fehlenden Schreibweg (der stand seit G-535). **Das ist dieselbe
Klasse wie die falsche Praemisse in G-555** — zwei an einem Tag, beide
vom Agenten gemessen statt uebernommen. Drei Sabotagen waren zuerst
gruen, alle drei echte Luecken in seinen eigenen Waechtern, alle behoben.
