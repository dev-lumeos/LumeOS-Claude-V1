# C-289 / C-290 - Codex

Stand: 2026-08-26

## Ergebnis

### Wegwerf-Datenbank und Kettennachweis

Die Ausgangsvermutung war, dass der Klon/Restore wegen zunehmender Datenmenge
ausfaellt. Gemessen: Die laufende Datenbank hat 333 MB (`pg_database_size`),
das Datenverzeichnis 11 GB bei 816 GB frei. `wissen` belegt 8 MB bei 5.090
geschaetzten Zeilen; `medical` 34 MB bei 4.367. Platz und Datenmenge sind
nicht die Ursache.

Der fruehere Klonversuch scheiterte aus zwei technischen Gruenden:

- `CREATE DATABASE ... TEMPLATE postgres` verweigert den Klon, solange die
  Quelldatenbank aktive Sessions hat (gemessen: 23; beim ersten Versuch 20).
- Der Voll-Dump enthaelt eine `net`-Funktionsdefinition mit
  `SET log_min_messages`. Diese Option darf die Zielrolle beim Restore nicht
  setzen. Der Restore brach deshalb vor dem Medical-Schema ab.

Der Kettenausfuehrer klont jedoch nicht. Er erstellt korrekt eine leere
Wegwerf-Datenbank, installiert den Auth-Stub und baut sie aus Baseline und
Kette auf. Dabei fiel ein echter C-286-Fehler auf: Die Datenstufe setzte ihre
neuen Tabellen voraus, erzeugte sie aber in der frischen Kette nicht. Die
Struktur liegt nun sowohl als deploybare Migration als auch als struktureller
Kettenschritt `286`; die Daten folgen getrennt in `286a`.

Der frische Lauf `lumeos_c289_probe` war danach gruen: 119 Schritte in 134,6
Sekunden. Der Vergleich ist wieder moeglich:

| Umgebung | `im_katalog` | sichtbare Unterformen |
|---|---:|---:|
| Live | 412 | 0 |
| Frische Kette | 412 | 0 |

### Abschlusspruefer

Die Ausgangswerte waren 184 Sekunden (C-283) und 204 Sekunden (C-286).
Gemessen vor der Reparatur: 215 Sekunden, 653 einzelne `docker exec psql`-
Aufrufe. Fast alle dauerten gleichmaessig 0,30 bis 0,35 Sekunden. Es gab keinen
fachlichen Hänger; die Zeit war Prozess-Start-Overhead.

Der Pruefer buendelt nun unveraendert dieselben Katalog-, RLS-, Policy-,
Grant-, Funktions- und Mindestzeilenpruefungen. Statt je fremder Tabelle
existence/RLS/Policy/Grant einzeln abzufragen, liest er die jeweiligen
Katalogdaten einmal und wertet sie weiterhin je Objekt aus. Ergebnis:
24,1 Sekunden bei 51 Datenbankaufrufen, gruen mit derselben vollstaendigen
Sollliste.

### C-290: Migrationsgrenze

`supabase/README.md` dokumentiert jetzt die harte Grenze: Migrationen duerfen
Struktur definieren, aber keine Katalogdaten oder Backfills schreiben;
`INSERT`, `UPDATE` und `COPY` gehoeren in `_pipeline/`.

`tools/migration-datenlogik-pruefen.mjs` prueft alle Migrationen. Es ignoriert
Kommentare und Funktionskoerper, damit der `INSERT` im Triggerkoerper der
Baseline kein Fehlalarm ist, und findet ausfuehrbare Datenbefehle. Iststand:
0 Datenbefehle in Migrationen; eine absichtlich eingespeiste INSERT-Probe wird
rot gemeldet.

### Negativprobe Kette

Eine Testkopie des Manifests liess den neuen Datenimport `286a` aus. Der
118-Schritte-Lauf dauerte 131,4 Sekunden und wurde erst durch die
Abschlusspruefung rot, nicht durch einen Manifest- oder Parsingfehler:

- Reproduktion: 0 statt mindestens 417
- PK: 0 statt mindestens 407
- Nieren/Leber: 0 statt mindestens 391
- Clinical Context: 0 statt mindestens 107
- Thailand-Regulatorik: 0 statt mindestens 477

Damit erkennt die Sicherung wieder einen uebersprungenen Kettenschritt.

Keine Apps, Nutzermedikations-Schreibwege, Commits, Staging oder Pushes wurden
angefasst.
