---
nr: C-400
typ: befund
modul: nutrition
schwere: mittel
angelegt: 2026-09-02
braucht: []
kind_von: C-397
entscheidung: null
agent: codex
beauftragt: 2026-09-02
erledigt: 2026-09-02
commit: 7dc4073e
beruehrt:
  tabellen: [nutrition.meal_plan_entries]
zahlen:
  gemessen: 2026-09-02
  buddy_wochen: 1
  buddy_eintraege: 29
  backup_dateien: 11629
  backup_bytes: 6402543381
---

# C-400 -- eine Woche zuviel im Buddy-Plan

## Befund

Der Auftrag startete mit zwei Buddy-Wochen (57 Eintraege). Der
Live-Bestand ist inzwischen anders: Die Juni-Woche ist nicht mehr da.
Dieser Lauf hat keine Plan-, Mahlzeiten- oder Backup-Quelldaten
geloescht.

## Bericht vom 2026-09-02

### C-400 -- Plaene und Wochen

| Plan | Herkunft | angelegte Wochen | Tage mit Eintraegen | Eintraege | `days_count` |
| --- | --- | ---: | ---: | ---: | ---: |
| Buddy auto-plan | buddy | 1 (31.08.-06.09.) | 7 | 29 | 7 |
| Cut 4-Meal 2200 | coach_created | 1 (02.09.-08.09.) | 7 | 28 | 28 |
| Lean bulk 3100 | marketplace | 1 (31.08.-06.09.) | 7 | 28 | 84 |

Beim Buddy-Plan tragen sechs Tage je vier und der 02.09. fuenf
Eintraege. Die verbleibende Differenz ist damit ein einzelner
Probe-Eintrag, nicht mehr eine zweite Woche. Die drei Plaene wurden
im selben Anlage-Lauf erstellt.

Der fruehere Zielkonflikt -- alte Woche entfernen oder `days_count`
auf 14 setzen -- besteht im Live-Bestand nicht mehr. Der C-380-Test
erwartet fuer den Buddy-Plan weiterhin 28 Eintraege. Empfehlung:
`days_count = 7` beibehalten und den fuenften Probe-Eintrag nur nach
ausdruecklicher Loeschfreigabe entfernen. Den Test auf 14 Tage zu
erweitern waere gegen die vorhandene Wochenzahl und den beabsichtigten
28er-Nachweis. Die abweichenden `days_count`-Werte von Cut (28) und
Lean (84) verlangen getrennt eine Semantikentscheidung: Programm-
dauer oder Zahl der gespeicherten Plantage. Aus ihrer einen gespeicherten
Woche folgt keine sichere Korrektur.

### C-187 -- was zum Schliessen fehlt

| Luecke | Live-Bestand | Zum Schliessen erforderlich | Art |
| --- | --- | --- | --- |
| EAA | Alias `eaa` zeigt auf `AAE9`; dessen Baum hat 11 Kinder (`CYSTE`, `HIS`, `ILE`, `LEU`, `LYS`, `MET`, `PHE`, `THR`, `TRP`, `TYR`, `VAL`). | Entscheiden, ob die fachlichen neun Aminosaeuren oder die elf BLS-Baumkinder gemeint sind; danach Alias bzw. Gruppenmodell eindeutig machen. | Entscheidung, keine fehlenden Rohdaten |
| Medication-Monitoring | `medical.user_medications` hat 2 Zeilen, aber keine der zehn Spalten `monitoring`, `monitoring_frequency`, `last_test`, `next_due`, `monitoring_overdue`, `targets`, `side_effects`, `physician`, `rx`, `prescription_ref`; sie existieren auch nicht in `medical` oder `supplements`. | Datenmodell und Verantwortlichkeit festlegen (Nutzereingabe, Katalog oder abgeleitet). Insbesondere ist `monitoring_overdue` aus einer faelligen Pruefung abzuleiten, nicht zu speichern. | Schema- und Fachentscheidung; danach Erfassung |
| CHOL | Live existiert nur `CHORL`, mit Chlorid-Text und `source_key = CHORL`; `source_key = CHOL` fehlt. | Die vorhandene Kettenkorrektur C-346 (`CHOL -> CHORL`) auf den Live-Bestand anwenden bzw. den Katalog neu laden. | vorhandene Datenkorrektur, noch nicht eingespielt |

EAA und Medication-Monitoring sind keine Importluecken, die ohne
Entscheidung geschlossen werden koennen. CHOL hat dagegen eine
vorhandene, fachlich zuordenbare Korrektur; dieser Auftrag hat sie
nicht geschrieben.

### C-216 -- Manifest ohne Loeschung

Der neue Lauf [backup-manifest.mjs](../../../tools/backup-manifest.mjs)
inventarisiert `backup/` rekursiv und schreibt ausschliesslich ein
neues JSON-Manifest. Er verschiebt, archiviert oder loescht keine
Quelldatei. Das aktuelle Ergebnis liegt in
[manifest-2026-09-02T11-04-08-304Z.json](../../../backup/_manifests/manifest-2026-09-02T11-04-08-304Z.json).

| Zweck | Dateien |
| --- | ---: |
| Evidenz oder Referenz | 9.878 |
| Bildschirmfoto | 611 |
| Datenbanksicherung | 471 |
| Probe-Skript | 260 |
| noch nicht klassifiziert | 409 |
| **Gesamt** | **11.629** |

Die inventarisierten Dateien belegen 6.402.543.381 Byte (5,963 GiB).
Arbeitskennungen wie `G-329` oder `C-400` werden aus dem Dateinamen
mitgefuehrt; der Rest bleibt sichtbar als `unclassified`. Die
Manifestdatei selbst wird nicht in ihr eigenes Inventar aufgenommen.

Der zugehoerige Test
[backup-manifest.test.mjs](../../../tools/__tests__/backup-manifest.test.mjs)
prueft an einer Temporaerprobe die Zweckzuordnung und dass jede
Quelldatei unveraendert bleibt. `node --check` und `node --test` sind
gruen. Eine echte Archivierungsaktion braucht danach eine
Aufbewahrungsregel und Freigabe je Sicherung; sie ist absichtlich nicht
automatisiert, solange A-39 gilt.

### Was nicht getan wurde

- Keine Daten auf `dev@lumeos.app` geloescht oder geaendert.
- Keine Datei in `backup/` geloescht, verschoben oder gepackt.
- `apps/` nicht beruehrt.
- Nichts gestagt, committed oder gepusht.

## Abnahme

**2026-09-02, Orchestrator.**

### Die Woche ist weg, der Eintrag bleibt

`[cmd]` **`Buddy auto-plan` hat nur noch eine Woche** — **aber 29
statt 28 Eintraege.**

`[cmd]` **Der einzelne Probe-Eintrag am 02.09. bleibt** — **Codex
fasst ihn ohne Loeschfreigabe nicht an.**

`[read]` **Richtig.** **Er stammt vom Orchestrator, und eine Zeile
zu loeschen, die man nicht selbst angelegt hat, ist keine
Nebensache.**

`[cmd]` **Toms Freigabe liegt vor** (E-62) — **als C-401.**

### Und zwei `days_count`-Werte brauchen die Semantik

`[cmd]` **Cut traegt 28, Lean 84** — **beide mit einer Woche und 28
Eintraegen.**

`[cmd]` **`Aufbau-Wochenplan` traegt 21 bei 3 Wochen** — **dort
stimmt die Laufzeit.**

`[read]` **E-62 entscheidet:** `days_count` **ist die Laufzeit, nicht
die Zahl der beschriebenen Tage.**

`[read]` **Und E-44 hat den Fall schon:** **`rollover` — eine Woche,
mehrfach durchlaufen.** `[read]` **Zu messen, ob Cut und Lean ihn
tragen.**

### C-187 — zwei brauchen Entscheidungen, einer eine Einspielung

`[cmd]` **EAA und Medication-Monitoring: Fach- und
Schemaentscheidungen.**

`[cmd]` **Fuer CHOL existiert die C-346-Korrektur** — **nicht live
eingespielt.**

`[read]` **Der dritte ist also kein offener Befund, sondern ein
liegengebliebener Kettenschritt.**

### C-216 — der Manifestlauf steht

`[cmd]` **`tools/backup-manifest.mjs` mit Test.** `[cmd]`
**Inventar: 11.629 Dateien, 5,963 GiB.**

`[read]` **Loeschfrei, wie beauftragt** — **A-39 haelt.**

`[read]` **Und das erste Manifest liegt in
`backup/_manifests/`** — **damit weiss der naechste, was er dort
vorfindet.**

**Abgenommen.**

