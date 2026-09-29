---
nr: A-80
typ: befund
modul: quer
schwere: mittel
angelegt: 2026-09-29

braucht: []
quellen:
  - docs/punkte/00-INDEX.md
  - supabase/README.md

beruehrt:
  tabellen: []
  dateien:
    - supabase/README.md
    - docs/punkte/00-LIESMICH.md

zahlen:
  gemessen: 2026-09-29
  datenbanken_ausser_live: 150
  belegt_gb: 207
  live_mb: 4816
  container_gb: 212
  heissen_final: 49
  platte_frei_gb: 6726
---

# A-80 - 150 Wegwerf-Datenbanken, und 49 davon heissen "final"

## Der Befund

`[cmd]` **Gemessen 2026-09-29 gegen `pg_database`:**

    Datenbanken ausser der laufenden und _supabase    150
    die sie zusammen belegen                       207 GB
    die laufende (postgres)                        4816 MB
    der Container insgesamt                        212 GB

`[read]` **98 Prozent der Postgres-Daten sind Nachweislaeufe, die nie
verworfen wurden.**

## Nach Art

`[cmd]` **Gruppiert nach dem, was der Name verraet:**

    Vollkette (Auftragsnachweis)       41    74 GB
    Abnahmestand (_final/_verify)      49    63 GB
    rot/gruen-Paare (Gegenprobe)       15    33 GB
    sonstige                           16    15 GB
    Tageskette (taeglicher Lauf)        5    12 GB
    ausdruecklich Wegwerf              24    11 GB

`[cmd]` **Die aeltesten tragen Nummern aus dem C-490er-Bereich**
(`c495_final`, `c496_final`, `c500_final`, `c500_final3`) — sie
stehen seit Mitte September.

## Was daran NICHT das Problem ist

`[cmd]` **Die Platte:** `D:` hat 6.726 GB frei von 7.451 GB. **207 GB
sind 2,8 Prozent davon.** `[read]` **Das ist kein Notfall, und es als
einen darzustellen waere falsch.**

## Was das Problem ist

`[read]` **1. Verwechselbarkeit. 49 Datenbanken heissen `*_final`.**
Keine davon ist die laufende. Wer eine davon abfragt, weil der Name
nach Endstand klingt, misst einen Zustand von vor zwei Wochen — und
merkt es nicht, weil die Tabellen alle da sind. **Das ist dieselbe
Klasse wie C-554: eine Quelle, die aussieht wie die Wahrheit und
keine ist.**

`[read]` **2. Die Regel ist gebrochen, nicht vergessen.** ,,Nie gegen
die laufende Datenbank testen. Wegwerf-Datenbank, danach verwerfen"
steht in den Projektregeln. **Der erste Halbsatz wird befolgt, der
zweite nicht** — und zwar seit ungefaehr vierzig Auftraegen, von
mehreren Agenten. **Eine Regel, die einmal in einem Merkblatt steht
und nirgends nachgezaehlt wird, wird zur Empfehlung.**

`[cmd]` **Gegenbeispiel aus demselben Tag:** Codex hat die Wegwerf-DB
aus C-554 verworfen (0 Reste, selbst gemessen), und der Orchestrator
die aus der Zwei-Wahrheiten-Gegenprobe. **Es geht also.** Was fehlt,
ist der Zwang.

`[read]` **3. Jeder container-weite Vorgang traegt die 212 GB mit** —
ein `pg_dumpall`, ein Neustart, ein Umzug des Containers.

## Nachweiszeilen

**A1** — **Ein Waechter zaehlt die Datenbanken**, nicht ihre Groesse:
Sollstand ist die Zahl der Datenbanken ausser `postgres`,
`_supabase` und den Vorlagen. Steigt sie, ist ein Nachweislauf nicht
verworfen worden. **Gegenprobe:** eine angelegte Wegwerf-DB muss ihn
rot machen, ihr Verwerfen wieder gruen. Das ist derselbe Bau wie
`backup-wachstum.mjs` aus A-70, und aus dessen Erfahrung folgt die
naechste Zeile.

**A2** — **Der Sollstand darf nicht mitwachsen.** A-70 hat gezeigt,
dass ein Waechter, dessen Soll jemand beim Roten anhebt, nichts
misst. Hier gilt: der Soll ist **0 plus die benannten Ausnahmen**,
und eine neue Ausnahme braucht einen Satz, warum sie bleibt.

**A3** — **Die Liste zum Verwerfen vorlegen, nicht verwerfen.** Der
Orchestrator legt vor, Tom entsorgt. **Kein Agent loescht eine
Datenbank**, die er nicht selbst in demselben Auftrag angelegt hat.
Vorschlag als Datei, mit Groesse und Datum je Zeile.

**A4** — **Die Namensregel festhalten:** ein Nachweislauf heisst nach
seinem Auftrag UND traegt ein Datum, und `_final` ist als Name
verboten — er behauptet Geltung, die eine Wegwerf-DB nie hat.
Gehoert nach `supabase/README.md` unter `## Regeln`.

**A5** — **Die fuenf `lumeos_tageskette_*` sind ein eigener Fall.**
Sie entstehen taeglich automatisch (2026-09-07, 18, 19, 20, 21) und
**vier von fuenf fehlen** — zwischen dem 07. und dem 18. ist keine da,
und nach dem 21. auch nicht, obwohl der Kettenlauf-Waechter heute
einen Lauf von vor 13 Stunden meldet. **Entweder verwirft der
Tageslauf inzwischen selbst, oder er legt woanders ab.** Das ist zu
klaeren, bevor ein Waechter die Zahl festnagelt — sonst zaehlt er
etwas, das sich von selbst aendert.

## Wie das aufgefallen ist

`[read]` **Nicht durch Suchen.** Die Abnahme von C-554 fragte, ob
Codex seine Wegwerf-Datenbank verworfen hat. Die Abfrage nach
`(probe|wegwerf|c554|tageskette)` gab 27 Namen zurueck, von denen
keiner zu C-554 gehoerte. **Seine war weg; die anderen 26 waren die
Antwort auf eine Frage, die niemand gestellt hatte.**
