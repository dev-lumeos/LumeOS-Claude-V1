---
nr: A-96
typ: fehler
modul: quer
schwere: hoch
angelegt: 2026-10-03
agent: claudecode
beauftragt: 2026-10-06
erledigt: 2026-10-06
commit: 7819aa89

braucht: [A-91, A-80]

quellen:
  - docs/punkte/erledigt/quer-a-0091-der-taegliche-lauf-erzeugt-bei-gruen-einen-neuen-dump.md
  - docs/punkte/erledigt/supplements-c-0556-zwei-fachliche-folgen-des-neuen-kimi-bestands.md

beruehrt:
  tabellen: []
  dateien:
    - tools/kettenlauf-taeglich.mjs
---

# Der Nachtlauf verwirft seinen eigenen Grund

## Der Befund

`[cmd]` **Der geplante Task fuehrt aus** (`schtasks /query /v`,
Aufgabenname `\LumeOS - taeglicher Kettenlauf`):

    C:\nvm4w\nodejs\node.exe tools/kettenlauf-taeglich.mjs

**Ohne Ausgabeumleitung.** `[cmd]` **Und der Laeufer gibt an den
Elternprozess weiter** — `tools/kettenlauf-taeglich.mjs` ruft
`spawnSync(... { stdio: 'inherit' })` fuer den Kettenlauf und fuer den
Publisher. **Damit landet die gesamte Ausgabe im Nichts.**

`[cmd]` **Was bleibt, ist `kettenlauf-status.json`:** Status, Start,
Ende, Dauer, Datenbank, Exit-Code. **Nicht, welcher Schritt gefallen ist
und warum.**

`[read]` **Der Schaden ist heute belegt.** Der Lauf vom 03.10., 04:00
Ortszeit, war nach 213,6 s rot. Der Orchestrator hat den Grund nur
gefunden, weil er im **Postgres-Containerlog** stand:

    ERROR:  supplement_nutrient_mappings: 3, erwartet 17

`[read]` **Dieser Weg ist Glueck, kein Nachweis:** das Containerlog
rotiert, es haelt nur Anweisungen, die die Datenbank gesehen hat, und
alles, was der Laeufer VOR der Datenbank entscheidet — eine fehlende
Datei, ein Abbruch in TypeScript, der Publisher — hinterlaesst dort
nichts. **Ein Lauf, der nachts rot wird, muss morgens sagen koennen,
warum.**

## Dazu die zweite Haelfte, die derselbe Lauf aufgedeckt hat

`[cmd]` **Ein fehlgeschlagener Tageslauf verwirft seine
Wegwerf-Datenbank nicht.** Gemessen am 03.10.:

    lumeos_tageskette_20260907 · _20260918 · _20260919 · _20260920
    _20260921 · _20261001 · _20261002          sieben Stueck
    Datenbanken gesamt 156   (02.10.: 152)
    davon mit lumeos-Praefix 117

`[cmd]` **Und der Preis ist heute messbar geworden.** Nach dem
Stromausfall um 05:59 brauchte Postgres beim Wiederanlauf **440 Sekunden
`syncing data directory (fsync)`** — bei einem `redo` von **0,00 s**.
`[read]` **Die Wiederherstellung selbst war nichts; die Wartezeit war
reines Durchsynchronisieren des Datenverzeichnisses.** Die vier groessten
Posten: `postgres` 4816 MB, `c511_final` 4085 MB, `lumeos_c538_green`
3364 MB, `lumeos_c531_kette` 3358 MB.

`[read]` **Damit hat A-80 eine Zahl, die nicht die Platte ist:** jeder
unsaubere Halt kostet gut sieben Minuten, und die wachsen mit jeder
liegengebliebenen Datenbank.

## Was zu tun ist — und was Tom entscheiden muss

`[read]` **Zwei Teile, und nur der erste ist unstrittig:**

1. **Der Lauf schreibt seine Ausgabe mit** — eine Logdatei je Lauf,
   neben `kettenlauf-status.json`, und der Status nennt ihren Pfad.
   `[annahme]` Entweder im Task (`> ... 2>&1`) oder im Laeufer selbst
   (`stdio: 'pipe'` und mitschreiben). **Im Laeufer ist es besser**, weil
   der Task auf Toms Maschine liegt und nicht im Repo — aber das ist eine
   Entscheidung, keine Messung.
2. **Der fehlgeschlagene Lauf verwirft seine Datenbank** — und die sieben
   liegengebliebenen werden entsorgt. `[read]` **Das ist A-80 und
   braucht Toms Wort**, weil `rm` auf Datenbanken nichts ist, was ein
   Punkt im Vorbeigehen macht. **Der Orchestrator legt vor, Tom
   entsorgt.**

**Nicht Teil:** der Inhalt des Fehlschlags (C-557) · die Aufbewahrung in
`backup/` (A-79) · der Dump und sein Manifest (A-91).

`[cmd]` **Keine Codeaenderung ohne Toms Freigabe** — dieser Punkt liegt
in `todos/`, bis sie da ist.

## Stand 06.10. und Auftrag

`[cmd]` **Erledigt ist die erste Haelfte:** seit `f5c46439` schreibt der
Laeufer `backup/_manifests/kettenlauf-<db>.log` und bei Rot einen
`log_ende`-Auszug in `kettenlauf-status.json`.

`[cmd]` **Offen, zweimal belegt:** ein roter (03.10.) und ein
abgebrochener Lauf (06.10., Freeze um 06:42) liessen ihre Datenbank
liegen - `lumeos_tageskette_20261003` 240 MB, `_20261006` 3,3 GB - und
der abgebrochene dazu einen halben Dump
`daten/grunddaten-<zeit>-<pid>.tmp` (418 MB, untracked). `kettenlauf-status.json`
zeigte danach weiter den gruenen Lauf vom Vortag. Tom hat beides von Hand
entsorgt. Der Task holt seit 06.10. keine verpassten Laeufe mehr nach
(`StartWhenAvailable = False`).

    AUFTRAG FUER Claude Code - A-96: ein roter oder abgebrochener Nachtlauf raeumt hinter sich auf
    Bereich: tools/
    Fremd:   supabase/_pipeline/ (Codex). docs/ gehoert dem Orchestrator.
    Stand:   2026-10-06

1. Messen: was `tools/kettenlauf-taeglich.mjs` heute bei Gruen, Rot und
   Abbruch mit Datenbank, `.tmp`-Dump und `kettenlauf-status.json` macht.
2. Bei Rot: Wegwerf-Datenbank loeschen, `.tmp` loeschen, Status `failed`
   mit `log_ende` - der Log bleibt als Beleg.
3. Bei Abbruch (Prozess stirbt, Rechner aus): beim NAECHSTEN Start
   erkennt der Laeufer verwaiste `lumeos_tageskette_*`-Datenbanken und
   `grunddaten-*.tmp` und raeumt sie weg, BEVOR er anfaengt - nur Namen
   mit genau diesem Muster, nie andere. Der Status vermerkt den
   abgebrochenen Vorlauf (`status: aborted`).
4. Nachweise auf einer Wegwerf-DB: Rot provoziert -> aufgeraeumt;
   Abbruch simuliert (Prozess beenden) -> naechster Start raeumt auf;
   eine fremde DB `lumeos_andere` bleibt stehen. Gate gruen. Kein Commit.

## Abnahme - 2026-10-06, Commit `7819aa89`

`[cmd]` Diff: `kettenlauf-taeglich.mjs` (+130), `kettenlauf-status-pruefen.mjs` (aborted als ,abgebrochen'), Test-Praefixe in `kettenlauf-status-pruefen.test.mjs`, neuer Test `a96-nachtlauf-raeumt-auf.test.mjs` (3, echte Wegwerf-DBs, Praefix `lumeos_a96probe`). Gate gruen, Werkzeugtests 66. `[cmd]` Aufraeum-Muster nachgelesen: `^<praefix>_\d{8}$` und `^grunddaten-\d{14,17}-\d+\.tmp$`, Praefix nur `[a-z][a-z0-9_]*`. Nach dem Lauf keine `lumeos_*`-DB im Container.

`[read]` Gemessen vorher: Rot liess die DB absichtlich ,zur Pruefung' liegen, Abbruch liess DB und .tmp liegen und den Status auf dem Vortag. Probe war zuerst blind (DB vor dem Start angelegt) - selbst gefunden und korrigiert. Sabotage 6/6.

Nebenbefund: im Container liegen weitere 21 alte Wegwerf-DBs anderer Namen (`c495_final` bis `g458_final`, September) - nicht vom Nachtlauf, nicht von diesem Muster erfasst; `g562_baseline` gehoert vermutlich zum laufenden A-105 und bleibt.

