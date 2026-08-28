---
nr: C-331
typ: messung
modul: medical
schwere: hoch
angelegt: 2026-08-28
braucht: []
kind_von: C-328
entscheidung: null
beruehrt:
  tabellen: [supplements.rule_catalog, medical.user_medications]
  dateien: [supabase/_pipeline/13_supplements/328_count_risk_flag_values.sql]
zahlen: null
agent: codex
beauftragt: 2026-08-28
---

# C-331 — C-328 live einspielen und den Durchstich wiederholen

## Befund

`[cmd]` **Der C-328-Umbau ist gebaut und in der Wegwerf-Kette
belegt** — fuenf positive und fuenf negative Proben, einschliesslich
der nie zuvor feuernden `critical`-Regel. `[cmd]` **Live ist er
nicht:** die Zustaende stehen unveraendert bei 39 / 23 / 1 / 1.

`[read]` **Und der Durchstich aus G-215 lief ueber `wr_anticoag_stack`
— eine Regel, die `drug_class` liest, nicht `risk_flags`.** **Genau
deshalb hat sie funktioniert, waehrend die fuenf anderen stumm
blieben.**

`[read]` **Was fehlt, ist der Beleg, dass die Behebung beim Nutzer
ankommt.** Eine Regel, die in der Wegwerf-Datenbank feuert, ist noch
keine Warnung auf einem Bildschirm.

## Auftrag

### Vorweg

`[read]` **Die Zahlen misst du.** `[cmd]` Seit dem 27.08. traegt ein
Auftrag keine Zahlen mehr vom Orchestrator.

`[read]` **Und eine Lehre aus C-328 gehoert hierher:** ich hatte
einen Defekt behauptet, den es nicht gab — der `true`-Filter war da,
ich hatte aus einer Messung ueber die Daten auf den Code
geschlossen. **Du hast den Code gelesen und mich berichtigt.**
**Dieselbe Vorsicht gilt fuer alles, was in diesem Auftrag steht.**

### Zu tun

**Den Kettenschritt live einspielen**, mit Vollsicherung vorher.

**Dann messen, was sich aendert** — `evaluation_state` ueber alle 64,
vorher und nachher.

**Und die fuenf Regeln einzeln pruefen**, live, nicht im Klon:
`wr_drug_bleeding_stack`, `wr_drug_hyperkalemia_stack`,
`wr_drug_qt_stack`, `wr_drug_serotonergic_combo`,
`wr_drug_hyperkalemia_lab`.

`[read]` **Je Regel eine Lage auf `test-user@lumeos.local`, in der
sie zutreffen muss** — und eine, in der sie nicht zutreffen darf.
`[cmd]` **Ueber `user_medications`**, nicht per direktem `INSERT` in
Hilfstabellen.

### Der Teil, der ueber deine bisherige Arbeit hinausgeht

`[read]` **Bis zur Datenbank ist es belegt. Bis zum Bildschirm
nicht.** `[cmd]` **Claude Code hat in G-215 sechs Stationen
nachgemessen** — Erfassung, `rule_assessment`, Rueckgabe, Leseweg,
Anzeige.

`[read]` **Miss die ersten drei; die letzten zwei kannst du nicht.**
**Sag im Bericht, wo deine Kette endet** — daraus wird ein
Anschlussauftrag fuer Claude Code, kein Versaeumnis.

### Was nicht zu tun ist

**Keine Regel aendern, keine `risk_flags` aendern.**
**Keine weiteren Operatoren** — die 23 warten.
**Nichts auf `dev@lumeos.app` schreiben.**
`apps/` nicht anfassen — Claude Code arbeitet dort an G-217.
Nicht committen, nicht stagen, nicht pushen.

### Nachweis

    Vollsicherung vor Live         Pfad genannt
    evaluation_state               vorher / nachher, alle 64
    je Regel: trifft zu            Lage ueber `user_medications`
    je Regel: trifft nicht zu      Lage ueber `user_medications`
    wr_drug_serotonergic_combo     feuert live - belegt
    Rueckbau                       gezaehlt, `dev` unberuehrt
    wo endet die Kette             benannt

`[read]` **Die vorletzte Zeile ist die, die zaehlt.** Die einzige
`critical`-Regel im Bestand hat nie gefeuert. **Wenn sie es jetzt
tut, ist das der erste Beleg, dass LumeOS vor etwas warnen kann, das
gefaehrlich ist.**

### Regeln

`tools/lauf.py` fuer jeden Befehl, keine Konsolenfenster.
**Vollsicherung vor jedem Live-Eingriff nach `backup/`.**
**Schreibende Nachweise auf `test-user@lumeos.local`**, mit
gezaehltem Rueckbau.

**Wenn eine Vorgabe nicht aufgeht: melden, nicht passend machen.**

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
