---
nr: C-486
typ: fehler
modul: quer
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: C-484
entscheidung: null
agent: codex
beauftragt: 2026-09-08
erledigt: 2026-09-08
commit: b31cb284
beruehrt:
  tabellen: [public.koerperflaechen]
zahlen:
  gemessen: 2026-09-08
  betroffen: 4
---

# C-486 — UTF-8 beim Einspielen verloren

## Befund

Tom, 2026-09-08, am Schirm:

    Beine  Grosser Ges??ssmuskel   gluteus-maximus
    Beine  Mittlerer Ges??ssmuskel gluteus-medius

`[cmd]` **Der Hex-Dump entscheidet:**

    Grosser Ges??ssmuskel
    47726f73736572204765733f3f73736d75736b656c
                             ^^^^

`[read]` **`3f3f` sind ZWEI ECHTE FRAGEZEICHEN** ? **kein
Anzeigefehler, die Datenbank traegt Muell.**

## Wo es NICHT liegt

`[cmd]` **Die Datei ist gueltiges UTF-8, ohne BOM:**

    supabase/_pipeline/00_querschnitt/484_koerperflaechen_e81.sql
    UTF-8 gueltig, BOM False

`[cmd]` **Sechs Umlaute stehen korrekt darin.**

`[cmd]` **Und der Server:**

    server_encoding  UTF8
    client_encoding  UTF8

`[read]` **Datei richtig, Server richtig** ? **der Verlust
passiert beim EINSPIELEN.**

## Der Verdacht

`[read]` **Zwischen Datei und Datenbank steht ein Werkzeug, das
nicht auf UTF-8 steht.**

`[cmd]` **Kandidaten:**

    tools/lauf.py         psql() -- welche Kodierung?
    docker exec           -e LANG, -e PGCLIENTENCODING?
    PowerShell            die Ausgabekodierung des Fensters
    cmd /c                Codepage 850 statt 65001

`[cmd]` **Windows-Codepage 850 bildet `oe` und `ss` NICHT ab** ?
**sie werden zu `?`.**

`[read]` **Das ist die wahrscheinlichste Stelle** ? **aber
gemessen ist es nicht.**

## Wie viele betroffen sind

`[cmd]` **Vier Zeilen in `koerperflaechen`.**

`[read]` **Miss, ob es woanders auch passiert ist** ? **jede
Tabelle mit deutschen Namen.**

`[cmd]` **`nutrition` traegt 1,04 Mio Zeilen mit `name_de`** ?
**wenn dort auch `??` stehen, ist es ein alter Schaden.**

## Was zu tun ist

**1** ? **Die Ursache MESSEN, nicht raten.**

`[read]` **Eine Zeile mit Umlaut durch jeden Weg schicken und
sehen, wo sie kippt:**

    direkt in psql im Container
    ueber tools/lauf.py
    ueber den Kettenlauf

**2** ? **Beheben, wo es kippt.**

`[cmd]` **`lauf.py` hat `shell=False` und `CREATE_NO_WINDOW`** ?
**miss, ob `encoding=` gesetzt ist.**

**3** ? **Einen Waechter.**

`[read]` **Eine Pruefung, die nach `?` in `name_de` und `name_en`
sucht** ? **kein deutscher Muskelname enthaelt legitim ein
Fragezeichen.**

`[cmd]` **`encoding-pruefen.mjs` prueft heute DATEIEN** ? **die
Datenbank nicht.**

**4** ? **Die vier Zeilen berichtigen.**

`[read]` **Im Kettenschritt, nicht von Hand** ? **sonst kippen
sie beim naechsten Aufbau wieder.**

## Und die Regel steht schon

`[cmd]` **`docs/lehren/`:** *,,Bei Encoding-Verdacht entscheidet
der HEX-DUMP, nie die Konsolenausgabe."*

`[read]` **Genau so gefunden.**

## Abnahmebedingungen

    A1  die Ursache gemessen: wo kippt die Zeile?
        Je Weg belegt.
    A2  behoben, wo es kippt.
    A3  Gegenprobe: eine Zeile mit oe, ae, ue, ss
        durchgeschickt -> kommt heil an. HEX-DUMP.
    A4  ein Waechter sucht ? in name_de und name_en.
        GRUEN nach der Behebung.
    A5  wie viele Zeilen sind sonst noch betroffen?
        Alle Tabellen, alle Schemata. Zahl.
    A6  die vier Zeilen berichtigt, im Kettenschritt.
    A7  Sicherung, Vollkette, Punktelauf.

## Was nicht zu tun ist

**Die vier Zeilen NICHT von Hand in der Datenbank aendern** ?
**beim naechsten Aufbau kippen sie wieder.**

**`apps/` nicht anfassen.**

Nicht committen, nicht stagen, nicht pushen.

## Bericht

### A1-A3 - Ursache und Gegenprobe

Die Quelle und PostgreSQL waren korrekt UTF-8. Die Probe `Größer ÄÖÜ äöü ß`
hat als Soll-Hex `4772c3b6c39f657220c384c396c39c20c3a4c3b6c3bc20c39f`.

| Einspielweg | Ergebnis | Hex |
|---|---|---|
| Datei im Container mit `psql -f` | heil | Soll-Hex |
| `tools/lauf.py` mit `docker exec ... psql -c` | heil | Soll-Hex |
| Kettenlauf (`readFileSync`/`spawnSync` mit UTF-8-Input) | heil | die vier C-484-Namen korrekt |
| PowerShell: `Get-Content -Raw ... | docker exec -i ... psql -f -` | kaputt | alle Umlaute und ss wurden zu `3f` |

Der Verlust entsteht somit vor Docker/psql bei der Text-Serialisierung der
PowerShell-Pipe, nicht in `lauf.py`, im Container oder in der Kette.

### A2 - Behebung

`tools/lauf.py` hat `psql_datei()` erhalten: SQL-Dateien werden als Bytes
geöffnet und mit `subprocess.run(input=...)` bytegenau an `docker exec -i`
übergeben. Der Kettenlauf war bereits byteerhaltend; er wurde nicht durch
eine unnötige zweite Kodierungslogik ersetzt. Die Kettendaten liegen in
`00_querschnitt/486_koerperflaechen_utf8_korrektur.sql`; kein Strukturumbau
war erforderlich.

### A4-A6 - Daten, Waechter und Umfang

Der neue Datenbankteil von `tools/encoding-pruefen.mjs` verlangt fuer jeden
Muskelkarten-Namen ohne legitime Fragezeichen `name_de NOT LIKE '%?%'` und
gibt bei einem Befund Code und UTF-8-Hex aus. Die zugehoerige
`c486-koerperflaechen-utf8.test.ts` war vor der Korrektur mit vier Befunden
rot und ist danach gruen.

| Code | im Kettenschritt wiederhergestellt |
|---|---|
| `biceps-femoris` | `Zweiköpfiger Oberschenkelmuskel` |
| `external-oblique` | `Aeussere schräge Bauchmuskeln` |
| `gluteus-maximus` | `Grosser Gesässmuskel` |
| `gluteus-medius` | `Mittlerer Gesässmuskel` |

Alle 121 `_de`-Spalten in Basistabellen wurden gemessen. `??` gab es nur in
diesen vier Zeilen von `public.koerperflaechen`; die 4.292 einzelnen
Fragezeichen stehen in legitimen Fragetexten (vor allem FAQ) und sind kein
Encoding-Befund. Gegenprobe auf der Wegwerf-Datenbank: nur
`gluteus-maximus` absichtlich auf `Ges??ssmuskel` gesetzt - der Waechter war
rot mit `47726f73736572204765733f3f73736d75736b656c`; anschliessend den
nummerierten C-486-Schritt erneut ausgefuehrt, wieder gruen.

### A7 - Lauf

Sicherung vor der Live-Korrektur:
`backup/data/20260913131110_c486_c472_vor_live.dump`.
Vollkette auf `lumeos_c486_c472_final`: 212 Schritte, `SCHEMA VOLLSTAENDIG`,
`KETTE OK` in 1209,0 s. Anschliessend auf dieser Wegwerf-Datenbank: C-486-Test,
Encoding-Waechter, Datenlogik-Waechter samt Selbstprobe und
Migrationsketten-Waechter gruen.

## Abnahme

**2026-09-08, Orchestrator. Nachgemessen.**

`[cmd]` **Der Hex-Dump entscheidet:**

    vorher   47726f7373657220476573 3f3f 736d75736b656c
    jetzt    47726f7373657220476573 c3a4 736d75736b656c
                                    ^^^^

`[read]` **`c3a4` ist `ae` in UTF-8** ? **behoben.**

`[cmd]` **Und null Zeilen mit `??` in `koerperflaechen`.**

### Die Ursache, gemessen statt geraten

> *,,Ausschliesslich die PowerShell-Text-Pipe vor Docker/psql
zerstoert Umlaute. Datei, `lauf.py` und Kettenlauf bleiben
bytegenau."*

`[read]` **Mein Verdacht war Codepage 850 in `lauf.py` oder
`docker exec`** ? **beide unschuldig.**

`[cmd]` **Er hat jeden Weg einzeln durchgeschickt, wie
verlangt.**

### Der Waechter, erweitert statt neu gebaut

`[cmd]` **`encoding-pruefen.mjs`, 323 Zeilen** ? **prueft jetzt
auch `psql`, `docker`, `name_de` und `??`.**

`[read]` **Ich hatte einen NEUEN Waechter verlangt** ? **er hat
den bestehenden erweitert.**

`[read]` **Richtig: ein zweiter Waechter fuer dieselbe Sache
ist eine zweite Wahrheit.**

`[cmd]` **121 `_de`-Spalten gemessen, nur diese vier trugen
`??`.**

### Und die Berichtigung im Kettenschritt

`[read]` **Nicht von Hand** ? **beim naechsten Aufbau waeren sie
wieder gekippt.**

**Abgenommen.**

