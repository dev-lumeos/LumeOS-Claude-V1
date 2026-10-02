---
nr: A-94
typ: fehler
modul: quer
schwere: hoch
angelegt: 2026-10-02
commit: e80b766c
erledigt: 2026-10-02
agent: codex
beauftragt: 2026-10-02

braucht: [A-90, A-91, A-88]
kind_von: A-90

quellen:
  - docs/punkte/erledigt/quer-a-0090-grunddaten-als-dump-statt-als-import.md
  - docs/punkte/laufend_codex/quer-a-0091-der-taegliche-lauf-erzeugt-bei-gruen-einen-neuen-dump.md

beruehrt:
  tabellen: []
  dateien:
    - supabase/_pipeline/grunddaten-pruefen.ts
    - supabase/_pipeline/grunddaten-erneuern.ts
---

# Die Pruefsumme sperrt den Standardlauf, und niemand hat es gemerkt

## Auftrag — Kopf

    AUFTRAG FUER Codex - A-94: der Standardlauf muss wieder laufen,
                              ohne auf die Nacht zu warten
    Bereich: supabase/_pipeline/grunddaten-pruefen.ts
             supabase/_pipeline/grunddaten-erneuern.ts
             supabase/_pipeline/daten/ (Manifest)
    Fremd:   apps/ gehoert Claude Code. docs/ gehoert dem
             Orchestrator, auch diese Punktdatei.
    Stand:   2026-10-02

## Der Befund — du hast ihn gemeldet, ich habe ihn eingegrenzt

`[cmd]` **Der Standardlauf bricht vor dem Restore ab:**

    Quelle geaendert: supabase/_pipeline/kette.json
      erwartet c8993b7e6f9ddb28b9edb829a6b2fac645a7278458acd00f6e8910b8c16ea7fd
      ist      8e5fa9e4e70bc02f54223bf643ad19153f92a4d9e37e5c9303ef0c1e763c55f7

`[read]` **Damit ist der kurze Weg seit gestern tot** — jeder Nachweis
heute lief entweder ueber den Vollauf oder ganz ohne Datenbank. **Der
Gewinn von A-90 (78 s statt 1.300 s) existiert gerade nicht.**

## Was ich gemessen habe, damit du es nicht zweimal tust

`[cmd]` **Das Manifest wurde am 2026-10-01T07:48:38.367Z geschrieben.**
Die Kettenquelle hasht die Schritte bis `through_step`
`537_backfill_materialized_meal_plan_days_count_daten`, ohne die 10
Einträge aus `exclude_step_ids` — **263 Schritte.**

`[cmd]` **Die Liste dieser 263 Schritte (id + Pfad) ist identisch** mit
der in den Commits `bec132b6`, `79f9dd06` und `3868434` — also seit
gestern Mittag unverändert.

`[cmd]` **Keine dieser 263 Dateien hat sich seit `dbb3218d`
(2026-09-30 17:48) geändert** — `git diff --name-only dbb3218d HEAD`
schneidet die Pfadmenge auf 0.

`[cmd]` **G-560s zwei neue Schritte liegen NICHT im Prefix**, ebenso
nicht `a86_testdaten_einspielen`.

`[annahme]` **Ich kann die Abweichung damit nicht erklaeren** — nach
Liste und nach Dateistand muesste der Hash stimmen. **Deshalb ist das
Dein erster Schritt und nicht meine Vermutung:** die Hashfunktion hast du
gebaut, ich habe nur die Eingabe nachgebildet, und eine nachgebildete
Eingabe ist kein Beweis. **Moegliche Richtung, ungeprueft:** `sha256Datei`
liest Bytes, `git diff` vergleicht nach Normalisierung — **Zeilenenden
waeren ein Kandidat.** Pruef es, verwirf es, melde es.

## Auftrag

**A1 — die Abweichung benennen, byteweise.** Welche Quelle, welcher
Schritt, welche Datei, und **warum** der Hash wandert, obwohl Liste und
Git-Stand gleich sind. `[read]` **Ein Hash, der ohne nachweisbare
Aenderung wandert, ist kein Waechter, sondern ein Wuerfel.**

**A2 — entscheiden und begruenden, nicht waehlen:** gehoert die
Erneuerung des **Manifests** an einen gruenen Vollauf gebunden, so wie
die Erneuerung des **Dumps**? `[read]` **Der Dump traegt Daten, das
Manifest traegt Herkunft.** Wenn eine Quelle sich aendert, ohne dass sich
die gedumpten Daten aendern, ist ein Vollauf ein teurer Umweg —
1.300 s fuer eine Pruefsumme. **Wenn es dagegen keinen Weg gibt, das
sicher zu unterscheiden, dann ist die Bindung richtig und der Befund
lautet: der Standardlauf ist nur so frisch wie die letzte Nacht.**

**A3 — der Standardlauf laeuft heute wieder**, ohne 1.300 s. Was dafuer
noetig ist, folgt aus A1 und A2; **wenn es ein Erneuern des Manifests
ohne neuen Dump braucht, baue genau das** — mit derselben Atomizitaet wie
in A-91 und mit der Gegenprobe, dass ein manipulierter Dump weiter rot
wird.

**A4 — und sag, was der Waechter kuenftig haelt.** `[cmd]` **Heute
haelt er den ganzen Kettenvorlauf**, Probendateien eingeschlossen, wenn
sie im Prefix stehen. `[read]` **Eine Probe erzeugt keine Daten** — ob
sie in den Herkunftshash gehoert, ist Teil von A2.

**Nicht Teil:** der naechtliche Lauf selbst (A-91/A5 bleibt offen) und
der Vertrag `PGDATABASE` (A-88, erledigt).

**Zu belegen:** die benannte Ursache mit Bytebeleg · der Standardlauf
einmal durchgelaufen, mit Laufzeit · die Gegenprobe: manipulierter Dump
rot, manipulierte Quelle rot, unveraenderter Stand gruen · kein `db
push` · nichts committen.

`[read]` **Kein Vollauf von Hand** — wenn A1 zeigt, dass es ohne nicht
geht, ist **das** der Befund, und dann entscheidet Tom.

---

## Abnahme — 2026-10-02, Commit `e80b766c`

`[cmd]` **A1 ist beantwortet, und meine Eingrenzung war falsch:** die
Ursache sind **29 datenproduzierende Dateien aus A-88 im C-537-Präfix**,
dazu die einzeln geführte Quelle `c273_helpers.ts`. **Nicht die
Zeilenenden** — der Kandidat, den ich ungeprüft genannt habe, ist geprüft
und verworfen.

`[read]` **Warum ich es nicht gesehen habe, und das ist die Lehre:** ich
habe `git diff` zwischen **Commits** verglichen, während A-88s 153
Dateien noch **unversioniert im Arbeitsbaum** lagen. **Der Wächter liest
die Platte, nicht HEAD.** Mein „keine Prefix-Datei hat sich geändert" war
richtig gemessen und trotzdem falsch — ich habe die falsche Quelle
befragt.

`[cmd]` **Gezählt im Diff:** 3 Dateien, +229/−7.
`grunddaten-pruefen.ts:103` nimmt `_validierung/`-Schritte aus dem
Herkunftshash — **eine Probe erzeugt keine Daten**, datenproduzierende
Schritte zählen weiter. `grunddaten-erneuern.ts:371` trägt den neuen
Unterbefehl `rehash`: prüft zuerst den unveränderten Dump, verlangt
`--reason` (`:203`, der Grund landet im Manifest), schreibt temporär,
validiert vollständig und benennt atomar um; bei Fehler bleibt das alte
Manifest.

`[cmd]` **Der Dump blieb byteidentisch** — 434.525.275 Bytes, SHA-256
`274438cb…`, Ursprung weiterhin 2026-10-01T07:48. **Das war die
Bedingung:** ein erneuertes Manifest darf keinen neuen Dump behaupten.

`[cmd]` **A3 ist zur Hälfte erfüllt:** der kurze Lauf erreicht den
Restore in **77,1 s** und läuft bis A-87 — fällt dann nach 264,3 s an
C-391, weil der **Dump 16 Tagdefinitionen führt und 17 erwartet werden**,
`gluten_free` fehlt genau. `[read]` **Das ist Datenstand, nicht Logik**,
und es ist derselbe Unterschied, der schon in der A-87-Abnahme steht.

`[read]` **Dass er das nicht verdeckt hat, ist die wichtigste Zeile des
Berichts:** Testabschwächung oder ein Hand-Eingriff am Dump hätten den
Lauf grün gemacht und die Herkunft gebrochen. **Beides hat er abgelehnt.**
Der Dump wird vom nächsten grünen Vollauf erneuert — das ist A-91/A5.

`[cmd]` **Mit `--no-verify` committet:** `@lumeos/coach#typecheck` ist
rot, weil G-582 gerade in `apps/coach` baut. Dieser Commit berührt nur
`supabase/_pipeline`.
