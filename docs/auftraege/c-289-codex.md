# C-289 + C-290 — Codex, 2026-08-26

Bericht: `docs/berichte/c-289-codex.md`

**Der Nachweis, der dreimal Fehler gefunden hat, funktioniert nicht
mehr.**

---

## Vorweg: die Zahlen sind Ausgangsvermutungen

`[read]` **Pruef sie zuerst. Weicht deine ab, gilt deine — und du
nennst beide.**

`[cmd]` **In C-286 lagen meine dreimal daneben:** ATC 419 statt 490,
und ich hatte 475/23 vermutet.

## 1 · C-289 — die Kette laesst sich nicht mehr frisch pruefen

`[cmd]` **Du meldest zweierlei:** der frische Kettennachweis war wegen
**Klon/Restore-Fehlern** nicht moeglich, und der **Schema-Pruefer lief
nach 204 Sekunden ins Timeout** — in C-283 waren es 184.

`[read]` **Das ist der Nachweis, der uns dreimal gerettet hat.**
`[cmd]` **C-265** (drei unverkettete Medical-Schritte), **C-276** (18
Dublettengruppen), **C-277** (`im_katalog` ohne `parent_id`) wurden
**ausschliesslich** dadurch gefunden, dass Kette und Live verglichen
wurden.

`[read]` **Faellt der Vergleich aus, faellt die Sicherung aus** — und
seit heute ist jeder Pipeline-Auftrag ungeprueft, auch der naechste.

### Zu tun, in dieser Reihenfolge

**a) Der Klon-Fehler zuerst.** `[read]` Ohne Wegwerf-Datenbank gibt es
keinen Kettenlauf, und ohne den keinen Vergleich. **Miss, woran es
liegt** — Platz, Berechtigungen, ein haengender Prozess, eine
Erweiterung, die sich nicht wiederherstellen laesst.

`[read]` **Wenn es die Datenmenge ist, sag es** — `[cmd]` die
Datenbank ist heute deutlich groesser als vor einer Woche: allein
`wissen` traegt 5.000+ Zeilen, `medical` 1.799 neue.

**b) Dann die Laufzeit.** `[cmd]` **184 → 204 Sekunden**, und die
Datenbank waechst weiter.

`[read]` **Miss, ob der Pruefer gleichmaessig langsam ist oder an
einer Stelle haengt.** Das fuehrt zu verschiedenen Reparaturen: eine
einzelne Abfrage laesst sich richten, gleichmaessige Traegheit
braucht ein anderes Verfahren.

`[read]` **Und wenn du ihn schneller machst: nicht durch weniger
Pruefen.** Der Pruefer ist der Grund, warum wir dreimal einen Fehler
gefunden haben — **ein schneller Pruefer, der weniger sieht, ist
schlechter als ein langsamer.**

## 2 · C-290 — die Migrationsausnahme dokumentieren

`[cmd]` **Zwei Migrationen liegen im Repo:**
`20260826180000_c283_medication_catalog_mapping.sql` und
`20260826190000_c286_medication_enrichments.sql`.

`[cmd]` **Vom Orchestrator geprueft: die erste enthaelt reines
Schema** — `ADD COLUMN`, `CHECK`-Bedingungen, keine Daten. **Du hast
die Datenlogik ausdruecklich herausgenommen.**

`[read]` **Die Trennung ist sachlich richtig:** Migration aendert die
Struktur, Kette fuellt sie. **Zwei Zustaendigkeiten, nicht zwei
Quellen fuer denselben Zustand.**

`[read]` **Aber die Projektanweisung sieht `migrations/` gar nicht
vor.** Wer sie liest, findet: *„Der Zustand entsteht aus der Kette in
`_pipeline/`, nicht aus `supabase/migrations/`."*

**Zu tun:** in `supabase/README.md` festhalten, **wann eine Migration
richtig ist und wann nicht.**

`[read]` **Die Grenze ist es, worauf es ankommt** — nicht die
Erlaubnis. Schema ja, Daten nein. **Ohne diese Zeile steht beim
naechsten Mal vielleicht doch ein Backfill darin, und dann laufen
Kette und Live wieder auseinander.**

`[read]` **Und pruef, ob ein Waechter moeglich ist:** eine Migration,
die `INSERT`, `UPDATE` oder `COPY` enthaelt, ist ein Fehler. **Wenn
ja, bau ihn — er kostet zehn Zeilen und deckt den Fall dauerhaft.**

## WAS NICHT ZU TUN IST

**Den Pruefer nicht kuerzen, um ihn schneller zu machen.**
**Keine Migration loeschen** — die Struktur steht live.
**Keinen Schreibweg fuer `user_medications`** — `[cmd]` **C-285** ist
offen, die Tabelle speichert im Klartext.

`apps/` nicht anfassen — Claude Code arbeitet an G-200.
Nicht committen, nicht stagen, nicht pushen.

## NACHWEIS

    Klon/Restore                laeuft wieder / Ursache benannt
    Schema-Pruefer              204 s -> Zahl nennen
    Kette gegen Live            im_katalog beide Seiten
    Migration mit Datenlogik    0, und der Waechter findet eine

`[cmd]` **`im_katalog` steht bei 412, sichtbare Unterformen 0** — **das
ist der Vergleich, der heute nicht moeglich war.** Wenn er wieder
laeuft, ist das der Beleg.

**Negativprobe:** einen Kettenschritt ueberspringen — der Vergleich
muss es finden. `[read]` **Das ist der eigentliche Nachweis, dass die
Sicherung wieder steht.**

## REGELN

`tools/lauf.py` fuer jeden Befehl, keine Konsolenfenster.
Nie `pnpm dev` — nur `python tools/server.py`.
`.next` nie loeschen, `next build` nie direkt aufrufen.
Vollsicherung vor jedem Live-Eingriff, nach `backup/vollsicherung/`.

**Wenn eine Vorgabe nicht aufgeht: melden, nicht passend machen.**
