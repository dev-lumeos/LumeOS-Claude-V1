---
nr: C-558
typ: fehler
modul: supplements
schwere: hoch
angelegt: 2026-10-04
agent: codex
beauftragt: 2026-10-04
erledigt: 2026-10-04
commit: 4dd9aa11

braucht: [C-557, A-96]

quellen:
  - docs/punkte/erledigt/supplements-c-0557-vierzehn-von-siebzehn-naehrstoffzuordnungen-finden-ihre-substanz-nicht.md

beruehrt:
  tabellen:
    - supplements.supplement_aliases
    - supplements.substance_aliases
  dateien: []
---

# Die Kette laeuft gruen — Schritt fuer Schritt, heute, nicht eine Nacht pro Fehler

## Auftrag — Kopf

    AUFTRAG FUER Codex - C-558: die volle Kette laeuft gruen
    Bereich: supabase/_pipeline/
    Fremd:   apps/, packages/, tools/ gehoeren nicht dir. docs/ gehoert
             dem Orchestrator, auch diese Punktdatei.
    Stand:   2026-10-04

## Warum dieser Auftrag anders ist

`[cmd]` **Seit dem 01.10. ist kein Nachtlauf gruen.** Jede Nacht stirbt die
Kette an einem Schritt, tagsueber wird er repariert, in der naechsten Nacht
stirbt sie am naechsten. **Ein Versuch pro Nacht ist der Engpass.**

**Dieser Auftrag endet nicht mit einem reparierten Schritt, sondern mit einem
gruenen Gesamtlauf.** Du faehrst die Kette selbst, so oft wie noetig.

## Der erste bekannte Fehler

`[cmd]` **Nachtlauf 04.10., 04:00:01 bis 04:00:59, Exit 1:**

    ERROR:  duplicate key value violates unique constraint
            "supplement_aliases_supplement_id_alias_source_key"
    DETAIL: Key (supplement_id, alias, source)=
            (f2413e27-bcdf-bdb3-97e7-a69384678f5c, S-23, kimi_crawl_027)
            already exists.

`[read]` **Der Einsatz** bildet `supplements.substance_aliases` ueber
`COALESCE(sc.id, src.substance_id)` auf `supplement_id` ab — zwei Wege,
und zwei Quellzeilen landen auf derselben Kennung. **Erst messen, wie viele
Kollisionen es gibt und ob die Quellzeilen dasselbe meinen; dann
entscheiden** zwischen `DISTINCT ON`/`ON CONFLICT DO NOTHING` (Dublette) und
einer Korrektur der Zuordnung (falscher Weg). **Die Begruendung gehoert in
den Bericht.**

`[cmd]` **C-557 hat getragen:** `supplement_nutrient_mappings` lief in der
Nacht ohne Fehler durch.

## Wie gefahren wird

**Der Tageslauf schreibt seit `f5c46439` (A-96) seine Ausgabe mit:**

    node tools/kettenlauf-taeglich.mjs --database lumeos_c558_lauf<N>
      -> backup/_manifests/kettenlauf-lumeos_c558_lauf<N>.log
      -> Statusnachweis mit log_ende bei rot

**Die Schleife:**

1. Lauf fahren, eigener Datenbankname je Lauf.
2. Rot → Grund aus `log_ende`, Schritt reparieren, **naechster Lauf**.
3. Gruen → fertig. Der Tageslauf erneuert dabei den Grunddaten-Dump;
   **das ist A-91s Ziel** und darf passieren.

**Nach jedem Lauf** die Wegwerf-Datenbank dieses Laufs loeschen, ausser der
letzten roten (fuer die Diagnose) und der gruenen. Anzahl im Bericht.

## Harte Regeln

- **Nie gegen die laufende Datenbank.** Nur Wegwerf-Datenbanken.
- **Jeder reparierte Schritt ist eine eigene, benannte Aenderung** im Bericht:
  Schritt, Fehlertext, Ursache, Aenderung, Datei.
- **Braucht eine Reparatur eine fachliche Entscheidung** (Daten loeschen,
  Bedeutung aendern): anhalten und melden, nicht raten.
- **Keine neuen Waechter, keine neuen Proben**, ausser eine Reparatur braucht
  ihren eigenen Beleg.
- **Kein Commit, kein Push.**

## Bericht

Zahl der Laeufe, je Lauf: Dauer, Exit, gestorben an welchem Schritt. Am Ende
der gruene Statusnachweis (`kettenlauf-status`-Format) und die Zahl der
Kettenschritte.

## Abnahme — 2026-10-04, Commit `4dd9aa11`

`[cmd]` **Der Statusnachweis des Tageslaufs sagt es selbst**
(`backup/_manifests/kettenlauf-status.json`):

    status passed · exit 0 · 800,1 s · lumeos_c558_lauf15
    grunddaten_dump supabase/_pipeline/daten/grunddaten-20261004T011755Z.dump
    (418.887.599 Bytes, sha256 85db308e...)

**Der erste gruene Gesamtlauf seit dem 01.10.** 15 Laeufe an einem
Vormittag statt 15 Naechte. Die Wegwerf-Datenbanken der Laeufe sind
geloescht (uebrig nur `lumeos_tageskette_20261003`). `[cmd]` Gate gruen
im Vorcommit-Haken.

### Was offen bleibt — und vor jedem Live-Abgleich geklaert sein muss

`[cmd]` **Gruen ist die Kette auch, weil Sollzahlen nachgezogen wurden**
(596 → 572 Supplements in 137, 141t, 141x, 281, schema-sollstand). Der
Bericht nennt fuer jede Stelle den Grund, aber nicht, **welche 24 frueher
erwarteten Datensaetze es nicht mehr gibt.**

`[cmd]` **Live (nur gelesen):** `supplements.supplements` 617 Zeilen, 430
`im_katalog`. **Der neue Grundbestand: 572, davon 446 im Katalog.** Vor
einem Abgleich von Live auf diesen Stand ist zu klaeren, welche 45
Supplements wegfielen und ob Nutzerdaten an ihnen haengen → C-559.
