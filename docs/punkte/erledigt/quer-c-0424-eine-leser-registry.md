---
nr: C-424
typ: feature
modul: quer
schwere: mittel
angelegt: 2026-09-08
braucht: []
kind_von: A-71
entscheidung: null
agent: codex
beauftragt: 2026-09-08
erledigt: 2026-09-08
commit: a5b1f323
beruehrt:
  tabellen: [nutrition.meals]
zahlen:
  gemessen: 2026-09-08
  faelle: 6
---

# C-424 — eine Leser-Registry

## Befund

Aus A-71, Codex, 2026-09-08:

> *,,Dafuer braeuchte es zuerst eine gepflegte, testbare
> Leser-Registry."*

`[cmd]` **Sechsmal am 07.09. lag ein Leseweg ungenutzt daneben** —
**und jedes Mal hat Tom es gefunden.**

`[cmd]` **Ein Waechter *Tabelle ohne Leser* ist nicht baubar:**
**Leser laufen ueber Sichten, RPCs und generische Funktionen, ohne
den Tabellennamen im Code zu tragen.**

## Auftrag — C-423 einspielen, dann die Registry pruefen

**Beauftragt am 2026-09-08.**

### 1 · C-423 einspielen

`[cmd]` **Nur auf Wegwerf-Datenbanken geprueft.** `[cmd]` **163
Schritte, 483,1 s, 3/3 Tests.**

`[read]` **Vorher Sicherung nach `backup/`, wie bei C-421 und
C-422.**

`[read]` **Ohne den Bestand zeigt die Vorlagenkachel eine Null** —
**und Null sieht aus wie ein Ergebnis** (E-72).

### 2 · Die Registry messen, nicht bauen

`[read]` **Miss zuerst, was sie kosten wuerde:**

`[cmd]` **Wie viele Tabellen gibt es, wie viele Sichten, wie viele
Funktionen?**

`[read]` **Eine Registry, die von Hand gepflegt wird, ist am Tag
ihrer Erstellung richtig und danach nie wieder** — **es sei denn,
ein Waechter prueft sie.**

`[read]` **Also die eigentliche Frage: laesst sie sich aus dem
Bestand ableiten?** `[cmd]` **`pg_depend` kennt Abhaengigkeiten
zwischen Sichten und Tabellen** — **aber nicht zwischen App-Code und
Datenbank.**

`[read]` **Sag, ob es geht und was es kostet.** `[read]` **Nicht
bauen.**

### Abnahmebedingungen

    A1  C-423 live: Zeilen je Tabelle auf test-user.
    A2  Sicherung: Pfad und Groesse.
    A3  Vollkette nach dem Einspielen: Schritte und Sekunden.
    A4  Registry: Tabellen / Sichten / Funktionen, gezaehlt.
    A5  Registry ableitbar? Ja mit Weg, nein mit Grund.

### Was nicht zu tun ist

**Die Registry nicht bauen** — **erst messen.**
`apps/` nicht anfassen.
Nicht committen, nicht stagen, nicht pushen.

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

**2026-09-08, Orchestrator. Nachgemessen.**

### C-423 ist live

`[cmd]` **Selbst gemessen: `user: 1, curated: 4`.**

`[cmd]` **Sechs Tabellen im `stack_`-Bereich:** `stack_templates`
(17 Sp), `stack_template_items`, `stack_items`,
`stack_curation_candidates`, `_candidate_items`, `_decisions`.

    A1  stack_templates                  5 (4 kuratiert, 1 Nutzer)
        stack_template_items             5
        user_stacks                      1
        stack_items                      1
        stack_curation_candidates        1
        stack_curation_candidate_items   1
        stack_curation_decisions         0
    A2  Sicherung 20260908_085105, 25,7 MiB
    A3  Vollkette 163 Schritte, 294,5 s, Schema vollstaendig
    A4  176 Tabellen, 12 Sichten, 164 Funktionen
    A5  nicht dauerhaft ableitbar -- mit Beweisen

`[read]` **Und die leere Entscheidungstabelle ist begruendet:**
**der Nutzerstack ist veroeffentlicht, der Katalogvorschlag bewusst
`pending`.**

`[read]` **Eine Null mit Grund ist etwas anderes als eine Null.**

### A5 ist ein Nein mit Beweisen

`[cmd]` **`pg_depend` findet 127 Kanten fuer 12 Sichten** — **aber
NULL fuer `card_read_all`, `publish_stack_template` und
`withdraw_stack_template`.**

`[read]` **Drei Funktionen, die nachweislich Tabellen lesen, und der
Katalog kennt keine einzige Kante.**

`[cmd]` **Dazu 108 App-Dateien mit `.from()` und 22 mit `.rpc()`** —
**die der Katalog grundsaetzlich nicht sieht.**

`[read]` **Damit ist meine Frage beantwortet:** **eine Registry
waere am Tag ihrer Erstellung richtig und danach nie wieder.**

`[cmd]` **Sein Ausweg ist der richtige:** **eine explizite,
code-nahe Leser-Deklaration oder eine verpflichtende statische
Pruefung** — **nicht eine Ableitung aus dem Bestand.**

`[read]` **Das ist kein Nebenbei, sondern eine Arbeitsregel** —
**und deshalb bleibt es liegen, bis Tom sie will.**

### Zwei Neins an einem Tag, beide richtig

`[cmd]` **A-71: der Waechter ist nicht baubar.** `[cmd]` **C-424:
die Registry ist nicht ableitbar.**

`[read]` **Beide Male mit Zahlen statt mit einer Vermutung.**
`[read]` **Ein begruendetes Nein ist mehr wert als ein Waechter, der
falsch rot meldet** (C-415).

**Abgenommen.**

