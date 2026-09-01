---
nr: C-381
typ: befund
modul: coach
schwere: hoch
angelegt: 2026-09-02
braucht: []
kind_von: G-151
entscheidung: null
agent: codex
beauftragt: 2026-09-02
beruehrt:
  tabellen: [coach.pending_actions]
zahlen:
  gemessen: 2026-09-02
---

# C-381 — die Freigaberegel liegt im Browser

## Befund

Aus G-151, Codex, 2026-09-02.

`[cmd]` **Die RLS-Update-Regel an `coach.pending_actions` erlaubt
Coach und Client Aenderungen.**

`[cmd]` **Ablauf und bestaetigender Client werden nur im Clientcode
geprueft.**

`[read]` **Eine Regel, die im Browser liegt, ist keine Regel.**

## Dieselbe Klasse wie G-306

`[cmd]` **Dort blockierte `ON DELETE RESTRICT` nur das Loeschen einer
protokollierten Position, nicht das Aendern** — **ein `UPDATE
amount_g = 999` ging glatt durch.**

`[read]` **Hier ist es die Freigabe:** wer die Route direkt ruft,
kann eine abgelaufene Aktion bestaetigen **oder eine fremde.**

## Was ein Ausfuehrer koennen muss

Codex' Anforderung, vollstaendig:

    atomar pruefen
    den Akteur aus auth.uid() ableiten
    nur erlaubte Aktionstypen dispatchen
    die Zielaenderung schreiben
    protokollieren

`[read]` **Der zweite Punkt ist der Kern** — `confirmed_by` darf
nicht aus dem Aufruf kommen.

`[cmd]` **E-29 gilt:** ein Zugriff auf `coach.*` geht ueber eine
Funktion. `[cmd]` **`coach.offene_aktionen()` ist bereits
`SECURITY DEFINER` mit `auth.uid()`** — **die Lesenaht macht es
richtig, die Schreibnaht nicht.**

## Auftrag — die Schreibnaht absichern und ausfuehren

**Mitbeauftragt: G-151.** Bericht in diese Datei.

**Beauftragt am 2026-09-02.**

### 1 · C-381 — die Regel gehoert in die Datenbank

`[cmd]` **Du hast es in G-151 gefunden: die RLS-Update-Regel erlaubt
Coach und Client Aenderungen, Ablauf und bestaetigender Client
werden nur im Clientcode geprueft.**

`[read]` **Dieselbe Klasse wie G-306**, wo `ON DELETE RESTRICT` nur
das Loeschen blockierte.

`[cmd]` **`coach.offene_aktionen()` ist bereits `SECURITY DEFINER`
mit `auth.uid()`** — **die Lesenaht macht es richtig.**

### 2 · G-151 — der Ausfuehrer

`[cmd]` **`entscheideAktion` setzt `status`, `confirmed_at`,
`confirmed_by`** — **`payload` wird nicht angewandt.**

`[cmd]` **Zwei abgelaufene Aktionen: `adjust_macro_targets`,
`protein_g_delta`.**

**Deine eigene Anforderungsliste, umgesetzt:**

    atomar pruefen
    den Akteur aus auth.uid() ableiten
    nur erlaubte Aktionstypen dispatchen
    die Zielaenderung schreiben
    protokollieren

`[read]` **Der zweite Punkt ist der Kern** — `confirmed_by` darf
nicht aus dem Aufruf kommen.

`[read]` **Und die Zielaenderung:** `[cmd]` **`adjust_macro_targets`
zeigt auf `goals.nutrition_targets`** — sechs Naehrstoffspalten
(E-31). `[read]` **Miss, ob `payload` dorthin passt, bevor du
schreibst.**

### Was nicht zu tun ist

**Kein Coach-UI** — Funktion und RLS.
**Keine abgelaufene Aktion ausfuehren** — sie sind der Testfall fuer
die Ablaufpruefung.
`apps/` nicht anfassen.
Nicht committen, nicht stagen, nicht pushen.

### Der Dev-Server gehoert dir nicht

`[cmd]` **Kein `neustart`, kein `start`, kein `aufraeumen`.**

### Nachweis

    fremde Aktion       abgewiesen, belegt
    abgelaufene Aktion  abgewiesen, belegt
    gueltige Aktion     Zielwert geaendert, protokolliert
    confirmed_by        aus auth.uid(), nicht aus dem Aufruf
    Rueckbau            gezaehlt

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
