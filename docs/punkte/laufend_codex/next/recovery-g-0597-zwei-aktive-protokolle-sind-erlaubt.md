---
nr: G-597
typ: fehler
modul: recovery
schwere: mittel
angelegt: 2026-10-03

braucht: [G-593]
kind_von: G-593

quellen:
  - docs/punkte/erledigt/recovery-g-0593-die-attrappe-nennt-eine-tabelle-die-es-unter-anderem-namen-gibt.md

beruehrt:
  tabellen:
    - recovery.recovery_protocols
  dateien:
    - supabase/migrations/20260907090000_c421_recovery_read_models.sql
---

# Zwei aktive Protokolle sind erlaubt — und im Nachweis sind sie entstanden

## Auftrag — Kopf

    AUFTRAG FUER Codex - G-597: ein Nutzer hat hoechstens ein laufendes
                               Protokoll
    Bereich: supabase/_pipeline/
    Fremd:   apps/ und packages/ gehoeren Claude Code. docs/ gehoert
             dem Orchestrator, auch diese Punktdatei.
    Stand:   2026-10-03

## Der Befund

`[cmd]` **Auf `recovery.recovery_protocols` gibt es keinen eindeutigen
Schluessel auf den laufenden Zustand.** Es gibt nur

    idx_recovery_protocols_user_status
      ON recovery.recovery_protocols (user_id, status, started_on DESC)

**und der ist nicht eindeutig.**

`[cmd]` **Im G-593-Nachweis ist der Fall eingetreten:** test-user hatte
nach dem Schreiblauf **zwei** Zeilen mit `status = 'active'`. Die
Oberflaeche hat es gesagt und nicht verhindert — *„Ein zweites aktives
Protokoll ist moeglich — die Datenbank begrenzt es nicht."*

`[read]` **Die Oberflaeche ist der falsche Ort fuer diese Regel.** Sie
kann zwei gleichzeitige Anfragen nicht trennen, und sie gilt nicht fuer
Importe, Seeds oder den Coach.

## Was zu tun ist

### A1 — die Regel in die Datenbank

**Ein Teilindex ist das Mittel:**

    CREATE UNIQUE INDEX ... ON recovery.recovery_protocols (user_id)
      WHERE status = 'active';

`[read]` **Der Schritt gehoert in `supabase/_pipeline/`**, nicht in
`supabase/migrations/` — der Zustand entsteht aus der Kette. **Nachsehen,
wo die C-421-Migration in `kette.json` steht** (sie IST ein Kettenschritt)
und den Index danach anlegen, als eigener Schritt mit eigener Nummer.

### A2 — der Bestand zuerst

`[cmd]` **Heute ist der Bestand sauber:** 1 `active`, 1 `completed`.
**Aber der Index scheitert, wenn irgendwo zwei aktive stehen.** Vor dem
Anlegen zaehlen — in der Wegwerf-Datenbank und auf dem Live-Stand
**lesend** —, und im Bericht die Zahl nennen. **Findest du zwei: melden,
nicht aufraeumen.**

### A3 — melden, nicht aendern

`[read]` **Die Oberflaeche erwartet `aktiv` als Liste** —
`ProtokollStand.aktiv` ist ein Array, bewusst (G-593/A3). **Nach dem
Index kann es nur noch eines sein.** Das ist kein Fehler, aber Claude
Code sollte es wissen: **in den Bericht, ich gebe es weiter.**

## Nachweise

1. **Wegwerf-Datenbank:** ein zweites `active` fuer denselben Nutzer →
   `23505` (unique violation).
2. **Gegenprobe:** ein zweites `completed` fuer denselben Nutzer → geht
   durch. **Der Index darf nur den laufenden Zustand binden.**
3. **Zwei Nutzer, je eines aktiv** → geht durch.
4. **Sabotage:** Index entfernt → Probe 1 wird gruen, also rot melden.

## Harte Regeln

- **Nie gegen die laufende Datenbank schreiben.** Das Zaehlen aus A2 ist
  lesend. Wegwerf-Datenbank, danach verwerfen, Anzahl im Bericht.
- **Kein Commit, kein Push.**
- **Kein `supabase db push`.**

**Nicht Teil:** `End protocol` und die Reiterkacheln (G-598, Claude
Code) · G-596 (Bibliothek gegen Verlauf) · die Frage, ob ein Protokoll
automatisch endet — die ist offen und gehoert Tom.
