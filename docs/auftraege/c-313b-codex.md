# C-313b — Codex, 2026-08-27

Bericht: `docs/berichte/c-313b-codex.md`

**Ein unbekannter Operator soll laut scheitern, statt still nicht zu
erfuellen. Entscheidung Tom: erst der Melder, dann die vier
`high`-Regeln.**

---

## Vorweg: die Zahlen sind Ausgangsvermutungen

`[read]` **Pruef sie zuerst. Weicht deine ab, gilt deine — und du
nennst beide.** `[cmd]` **Deine C-313-Erhebung gilt als Grundlage:**
12 echte Pfade, `dsl` fuer 3 von 15 individuell, **14 vollstaendig
fehlend, 25 Regeln unbehandelt**, vier `high`, keine `critical`.

## 1 · Die Entscheidung

`[read]` **Tom, 2026-08-27: Weg 3, dann Weg 2.** Erst der Melder,
dann die vier Operatoren fuer die vier `high`-Regeln.

`[read]` **Die Begruendung:** solange ein unbekannter Operator
schweigt, entsteht derselbe Fehler mit der naechsten Kimi-Welle
wieder — **und niemand merkt es.** `[cmd]` Deine Klonprobe mit
`c313_unknown_operator` endete lautlos mit `not_fulfilled`, ohne
Fehler. **Genau das soll aufhoeren.**

**Dieser Auftrag ist Weg 3. Weg 2 folgt als eigener Punkt.**

## 2 · Zu tun

**`rule_assessment` soll einen unbekannten Operator nicht mehr als
*nicht erfuellt* behandeln.**

`[read]` **Wie genau, ist deine Entscheidung, nicht meine Vorgabe** —
werfen, ein Ergebnisfeld setzen, oder in eine Protokolltabelle
schreiben. **Aber drei Bedingungen muessen gelten:**

**Die Auswertung darf nicht abstuerzen.** `[read]` `rule_assessment`
liest fuer jeden Seitenaufbau; ein Ausnahmefehler wuerde die ganze
Uebersicht leeren. **Eine unauswertbare Regel darf die anderen 63
nicht mitnehmen.**

**Der Zustand muss vom Nichtzutreffen unterscheidbar sein.**
`[read]` *,,Regel trifft nicht zu"* und *,,Regel kann nicht
ausgewertet werden"* sind zwei verschiedene Aussagen. **Heute sehen
sie gleich aus — das ist der Kern des Befunds.**

**Es muss ohne Menschen auffallen.** `[read]` Ein Feld, das niemand
liest, ist so still wie vorher. **Ein Gate-Waechter, der die Zahl der
unauswertbaren Regeln gegen einen erwarteten Stand haelt, waere der
Weg** — heute 25, und **jede neue ist rot.**

`[read]` **Der letzte Punkt ist mir der wichtigste.** Ein Melder ohne
Empfaenger ist ein Kommentar. **Wenn du einen besseren Weg siehst als
einen Gate-Waechter: nimm ihn und begruende ihn.**

## 3 · Der Stichtag gehoert festgehalten

`[cmd]` **Heute unauswertbar: 25 Regeln.** `[read]` **Diese Zahl ist
der Ausgangsstand, nicht das Ziel.** Sie sinkt, wenn Weg 2 die vier
Operatoren nachbaut. **Der Waechter muss beide Richtungen aushalten:
rot bei mehr, und rot bei weniger, wenn der Sollstand nicht
mitgezogen wurde.**

## 4 · WAS NICHT ZU TUN IST

**Keinen Operator implementieren** — das ist Weg 2 und ein eigener
Auftrag.
**Keine Regel aendern oder entfernen**, auch keine der 25.
`[read]` **Besonders nicht die vier `high`** — sie sollen sichtbar
werden, nicht verschwinden.
**`drug_class` nicht anfassen** (C-296 erhoben, C-314 wartet).
`apps/` nicht anfassen. Nicht committen, nicht stagen, nicht pushen.

## NACHWEIS

    unauswertbare Regeln              Zahl, Soll 25, je einzeln
    davon high                        4, namentlich
    auswertbare Regeln unveraendert   Zahl vorher = nachher
    rule_assessment Laufzeit          ms vorher / nachher
    Waechter mit erfundenem Operator  rot
    Waechter im Normalzustand         gruen

`[read]` **Negativprobe in beide Richtungen:** einen erfundenen
Operator einbauen — **der Waechter muss rot werden.** Und einen der
25 kuenstlich behandeln, sodass 24 uebrig bleiben — **auch das muss
rot werden**, solange der Sollstand 25 sagt. `[read]` **Ein Waechter,
der nur nach oben prueft, verpasst die stille Reparatur.**

`[cmd]` **Die Laufzeit gehoert dazu:** `rule_assessment` liegt nach
C-305 bei 147-155 ms unter `authenticated`. **Wenn der Melder das
verschiebt, ist die Zahl der Befund.**

## REGELN

`tools/lauf.py` fuer jeden Befehl, keine Konsolenfenster.
**Wegwerf-Datenbank, nie gegen die laufende testen.**
**Vollsicherung vor jedem Live-Eingriff nach `backup/`.**
Struktur gehoert in die Kette, nicht in eine Migration.

**Wenn eine Vorgabe nicht aufgeht: melden, nicht passend machen.**
