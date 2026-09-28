---
nr: A-79
typ: befund
modul: quer
schwere: mittel
angelegt: 2026-09-28

quellen:
  - tools/backup-wachstum.mjs
  - docs/punkte/00-INDEX.md
  - CLAUDE.md

braucht: []
kind_von: A-70

beruehrt:
  dateien:
    - tools/backup-wachstum.mjs

zahlen:
  gemessen: 2026-09-28
  backup_gib: 8.96
  grenze_gib: 2.5
  abzuege_452mib: 9
  davon_eingespielt: 2
  tage: 5
  raeumbar_gib: 6.6
---

# A-79 - jeder Auftrag legt 452 MiB ab, auch wenn nichts eingespielt wird

## Der Befund

`[cmd]` **`backup/` ist 8,96 GiB bei einer Grenze von 2,5 GiB**, und
der Waechter aus A-70 hat es heute gemeldet: *,,raeumen faellig,
zuletzt inventarisiert vor 25 Tagen."*

`[cmd]` **A-70 hat den Waechter gebaut und ist abgenommen.** Er tut,
was er soll — er erinnert. **Was fehlt, ist die Aufbewahrungsregel**,
und in der Zwischenzeit ist der Ordner auf das Dreieinhalbfache der
Grenze gewachsen.

`[read]` **A-70 notierte `schema` mit 211,6 MiB. Heute sind es 4090
MiB.** Das Zwanzigfache in dreieinhalb Wochen.

## Die Ursache, gemessen

`[cmd]` **Neun Abzuege von je 452 MiB, alle zwischen dem 26.09. und
heute:**

    2026-09-26 00:25   c543_vor_live
    2026-09-26 00:55   c544_vor_live
    2026-09-26 01:40   c544_vor_live      (zweiter am selben Tag)
    2026-09-27 03:35   g511_vor_bau
    2026-09-27 03:51   c551_vor_bau
    2026-09-27 04:01   c546_vor_bau
    2026-09-28 02:44   g526_vor_struktur
    2026-09-28 07:49   g524_vor_struktur
    2026-09-28 08:51   g511_e1_vor_struktur

`[read]` **Die Sicherung entsteht je AUFTRAG, nicht je AENDERUNG.**
Die Regel in `CLAUDE.md` lautet ,,vor strukturellen Aenderungen
Sicherung nach `backup/`" — und jeder Agent befolgt sie korrekt. Sechs
Auftraege in drei Tagen, sechs volle Abzuege.

`[cmd]` **Und von den neun Aenderungen sind ZWEI eingespielt worden**
(C-543 und C-544 am 26.09.). Die anderen sieben liegen bis heute
nicht live: G-511 ist gesperrt, G-523, G-526, G-529 und die
TDEE-Reihe haben im laufenden Schema null Treffer.

`[read]` **Eine Sicherung vor einer Aenderung, die nie stattfand,
sichert nichts.** Die Datenbank steht noch im Zustand davor. Sieben
der neun Abzuege sind Momentaufnahmen desselben Schemas.

`[cmd]` **Der Beleg dafuer steht in den Groessen:** die zwei von heute
unterscheiden sich um 700 Byte bei 452 MiB. Strukturell hat sich
zwischen ihnen nichts getan.

## Was daraus folgt

`[read]` **Nicht die Regel ist falsch, ihr Ausloeser ist es.** Eine
Sicherung gehoert vor das EINSPIELEN, nicht vor das Bauen. Wer in
einer Wegwerf-Datenbank baut — und das ist Vorschrift —, braucht
keinen Abzug der laufenden.

**Der Vorschlag, in dieser Reihenfolge:**

**1.** Die Regel in `CLAUDE.md` praezisieren: *,,vor dem Einspielen in
die laufende Datenbank"* statt *,,vor strukturellen Aenderungen"*.
Wer nur in einer Wegwerf-Datenbank arbeitet, sichert nicht.

**2.** Eine Aufbewahrungsregel, die der Waechter zaehlt und nicht nur
beklagt: **je Tag hoechstens ein voller Abzug, hoechstens zwei
Tage rueckwaerts, plus der letzte vor einer eingespielten
Aenderung.** Das ist mechanisch pruefbar.

**3.** Der Waechter faellt ROT, wenn die Regel gebrochen ist — heute
erinnert er nur. `[read]` **Eine Erinnerung, die man 25 Tage
ignorieren kann, ist keine.** Dieselbe Lehre wie A-75 und A-76.

## Die Raeumvorlage

`[cmd]` **Der Orchestrator legt vor, Tom entsorgt. Kein Agent
loescht.** Gemessen am 2026-09-28:

    3164 MiB   schema/: sieben der neun 452er-Abzuege
               BEHALTEN: 20260926083924_c544_vor_live.dump
                         (der letzte vor einer EINGESPIELTEN Aenderung)
               BEHALTEN: 20260928155121_g511_e1_vor_struktur.dump
                         (der neueste, als aktuelle Grundlinie)

    2200 MiB   data/: elf von zwoelf, neuester ist vom 13.09.
               BEHALTEN: den neuesten

     621 MiB   _taeglich/: 847 Dateien, letzter Eintrag 12.09.
               seit sechzehn Tagen toter Zweig

     615 MiB   Punktordner, deren Punkt in erledigt/ liegt oder die
               keinen Punkt haben -- 38 Ordner, einzeln aufgelistet
               im Bericht

      31 MiB   dev-server.log vom 18.09.

    ---------
    6631 MiB   Summe. 8,96 GiB - 6,47 GiB = 2,49 GiB, unter der Grenze.

`[cmd]` **NICHT raeumen:** `kimi-research/` (496 MiB) und
`legacy-v2/` (55 MiB) — **sechs Kettenschritte und Produktcode lesen
daraus** (A-70). Und `c262/` (659 MiB), weil C-262 noch in `todos/`
liegt.

`[read]` **Die kleinen `c43_vor_kettenlauf.sql` (elf Stueck, je 2 MiB)
bleiben.** Sie sind das Muster, das funktioniert: eine Sicherung je
Lauf, klein, taeglich.

## Nachweiszeilen

**A1** — die 38 Punktordner einzeln gegen ihren Punktzustand, mit
Groesse. **Ein Ordner ohne Punkt ist kein Freibrief** — erst pruefen,
ob die Nummer nur anders geschrieben ist.

**A2** — die Regel in `CLAUDE.md` praezisiert, mit dem Unterschied
zwischen Wegwerf-Datenbank und laufender.

**A3** — die Aufbewahrungsregel im Waechter, mit Sollstand und
Gegenprobe: **ein zweiter voller Abzug am selben Tag muss rot
werden.**

**A4** — nach dem Raeumen neu inventarisieren. Der Waechter zaehlt
das Manifestdatum; ohne Nachtrag erinnert er weiter.
