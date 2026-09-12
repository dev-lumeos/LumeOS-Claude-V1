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

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
