---
nr: C-328
typ: blocker
modul: medical
schwere: hoch
angelegt: 2026-08-28
braucht: []
kind_von: G-215
agent: codex
beauftragt: 2026-08-28
entscheidung: null
beruehrt:
  tabellen: [medical.medication_active_substances, supplements.rule_catalog]
zahlen:
  gemessen: 2026-08-28
  wirkstoffe: 498
  mit_neun_schluesseln: 498
  bleeding_risk_true: 196
  bleeding_risk_false: 302
  betroffene_regeln: 5
---

# C-328 — `count_risk_flag_gte` zaehlt Schluessel statt Werte

## Befund

Aus G-215, Claude Code, 2026-08-28. **Vom Orchestrator nachgemessen.**

`[cmd]` **Alle 498 Wirkstoffe tragen alle neun `risk_flags`-Schluessel
— ausnahmslos.** `[cmd]` **196 haben `bleeding_risk: true`, 302 haben
`false`, keiner hat den Schluessel nicht.**

`[cmd]` **Der Evaluator baut die Liste ueber
`array_agg(DISTINCT key)` auf `jsonb_object_keys(risk_flags)`** —
**zwei unabhaengige Fehler in einer Zeile:**

**Kein Filter auf `true`.** `[read]` Furosemid mit
`bleeding_risk: false` erzeugt denselben Satz wie Warfarin. **Der
Schluessel ist da, also zaehlt er.**

**`DISTINCT` kollabiert ueber alle Medikamente.** `[cmd]` **Vier
Blutungswirkstoffe ergeben `count = 1`.**

## Was das bedeutet

`[cmd]` **Fuenf Regeln lesen `count_risk_flag_gte`:**

    wr_drug_bleeding_stack        high
    wr_drug_hyperkalemia_stack    high
    wr_drug_qt_stack              high
    wr_drug_serotonergic_combo    critical
    wr_drug_hyperkalemia_lab      high

`[read]` **Vier feuern nie** — sie verlangen `>= 2` oder mehr, und die
Zahl kann nie ueber 1 steigen. **Darunter die einzige
`critical`-Regel im Bestand: das Serotonin-Syndrom.**

`[read]` **Und die fuenfte ist die gefaehrlichere Haelfte.**
`wr_drug_hyperkalemia_lab` verlangt `>= 1` — **das ist ab dem ersten
beliebigen Medikament wahr.** Kein stiller Ausfall, sondern ein
**Falschalarm**, der heute nur ausbleibt, weil `test-user` keine
Laborwerte hat.

`[cmd]` **Und genau diese Regel hat Codex in C-313 Weg 2 gerade
freigeschaltet** — ueber `lab_above`. `[read]` **Sie haengt jetzt nur
noch am Laborwert; die zweite Bedingung ist immer wahr.** **Der Fund
kam eine Stunde zu spaet, um es zu verhindern, und rechtzeitig, um es
zu bemerken.**

## Warum es niemandem auffiel

`[read]` **Die Regeln liefen als `not_fulfilled`** — dasselbe
Ergebnis wie *,,trifft nicht zu"*. `[cmd]` **C-313b hat
`unsupported_operator` sichtbar gemacht; dieser Fall bleibt
unsichtbar, weil der Operator existiert und falsch rechnet.**

`[read]` **Ein Operator, der nicht da ist, meldet sich seit C-313b.
Einer, der falsch rechnet, nicht.**

## Auftrag

**Vor allem anderen.** `[read]` Vier stumme Warnungen und ein
Falschalarm sind kein Feature-Rueckstand, sondern ein Defekt in dem,
was das Produkt verspricht.

### Vorweg

`[read]` **Die Zahlen misst du.** `[cmd]` Seit dem 27.08. traegt ein
Auftrag keine Zahlen mehr vom Orchestrator. **Nenn die Abgrenzung
mit.**

`[read]` **Und der Zusammenhang zu deiner letzten Arbeit steht im
Befund:** `wr_drug_hyperkalemia_lab` hast du in C-313 Weg 2
freigeschaltet. **Sie haengt jetzt nur noch am Laborwert, weil die
zweite Bedingung immer wahr ist.** Deine Grenzwertproben waren
richtig — **sie konnten den Defekt nicht sehen, weil er die Bedingung
immer erfuellt.**

### Zu tun

**Den Operator so bauen, dass er zaehlt, was gemeint ist.**

`[read]` **Zwei Fehler, und beide muessen weg:** der fehlende Filter
auf `true`, und das `DISTINCT`, das ueber alle Medikamente
kollabiert. **Einer allein reicht nicht** — mit Filter, aber ohne
Behebung des `DISTINCT`, ergeben vier Blutungswirkstoffe weiter 1.

`[read]` **Was gezaehlt werden soll, ist eine fachliche Frage:**
zaehlt `>= 2` zwei Wirkstoffe mit demselben Risiko, oder zwei
verschiedene Risiken? `[read]` **Lies die fuenf Regeln und ihre
Meldungstexte** — `wr_drug_bleeding_stack` meint offensichtlich zwei
blutungsfoerdernde Medikamente, nicht zwei Risikoarten. **Wenn eine
Regel etwas anderes meint, sag es.**

### Der Nachweis ist wichtiger als die Behebung

**Je Regel eine Lage, in der sie zutreffen muss, und eine, in der sie
nicht zutreffen darf.**

`[read]` **`wr_drug_serotonergic_combo` ist `critical`** — die einzige
im Bestand. **Sie hat nie gefeuert. Nach der Behebung muss belegt
sein, dass sie feuert, wenn sie soll, und schweigt, wenn nicht.**

`[read]` **Und `wr_drug_hyperkalemia_lab` braucht die
Gegenprobe, die bisher fehlte:** ein Medikament **ohne**
Hyperkaliaemie-Risiko plus ein hoher Kaliumwert — **die Regel darf
nicht feuern.** `[cmd]` Heute wuerde sie.

### Was nicht zu tun ist

**Keine Regel aendern, keine `risk_flags` aendern.** `[read]` **Der
Operator wird zum Bestand gebaut, nicht der Bestand zum Operator.**
**Keine weiteren Operatoren** — C-313 hat noch 23 offene, sie warten.
`apps/` nicht anfassen.
Nicht committen, nicht stagen, nicht pushen.

### Nachweis

    Regeln mit count_risk_flag_gte   5, je einzeln
    je Regel: trifft zu              Lage hergestellt, feuert
    je Regel: trifft nicht zu        Lage hergestellt, feuert nicht
    wr_drug_serotonergic_combo       feuert erstmals - belegt
    wr_drug_hyperkalemia_lab         Falschalarm weg - belegt
    evaluation_state                 vorher / nachher, alle 64

`[read]` **Die vorletzte Zeile ist die, die heute niemand geprueft
hat** — und die einzige, bei der ein Fehler einen Nutzer erreicht
haette.

### Regeln

`tools/lauf.py` fuer jeden Befehl, keine Konsolenfenster.
**Wegwerf-Datenbank, nie gegen die laufende testen.**
**Vollsicherung vor jedem Live-Eingriff nach `backup/`.**

**Wenn eine Vorgabe nicht aufgeht: melden, nicht passend machen.**

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
