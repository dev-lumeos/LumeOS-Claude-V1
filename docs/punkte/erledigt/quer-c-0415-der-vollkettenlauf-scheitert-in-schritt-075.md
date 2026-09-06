---
nr: C-415
typ: befund
modul: quer
schwere: hoch
angelegt: 2026-09-07
braucht: []
kind_von: C-414
entscheidung: null
agent: codex
beauftragt: 2026-09-07
erledigt: 2026-09-07
commit: 9c9a250d
beruehrt:
  tabellen: [nutrition.food_tags]
zahlen:
  gemessen: 2026-09-07
  schritt: 75
---

# C-415 — der Vollkettenlauf scheitert in Schritt 075

## Befund

Aus C-414, Codex, 2026-09-07, als Hinweis gemeldet.

`[cmd]` **Der Vollkettenlauf scheitert vor Schritt 412 in Schritt
075** — **`food_tags_effective` fehlt dort.**

`[read]` **Das ist die Gegenrichtung von C-410:** `[cmd]` **dort
ueberschrieb Schritt 075 eine spaetere Aenderung.** `[read]` **Jetzt
verlangt 075 etwas, das erst spaeter entsteht.**

`[cmd]` **`food_tags_effective` kommt aus C-366** — **die Sicht ueber
`food_tags` und `food_tags_kuriert`.**

## Warum es zaehlt

`[read]` **Der Zustand entsteht aus der Kette.** `[read]` **Eine
Kette, die nicht durchlaeuft, kann den Zustand nicht erzeugen** —
**nur der Bestand, der zufaellig da ist, traegt weiter.**

`[cmd]` **Codex hat die Sicht separat auf einem Klon geprueft** —
**richtig, aber es ersetzt den Vollauf nicht.**

`[read]` **Und niemand hat es gemerkt, weil alle Aenderungen live
eingespielt wurden.**

## Zu messen

`[read]` **Seit wann scheitert der Lauf?** `[cmd]` **C-366 legte die
Sicht an, C-405 lief die Kette neu** — **dazwischen liegt der
Bruch.**

`[read]` **Und in welcher Reihenfolge die Schritte stehen
muessten:** `[cmd]` **wer die Sicht anlegt, muss vor 075 laufen.**

`[read]` **Ein Waechter waere richtig** — **aber erst, wenn der Lauf
wieder durchgeht.**

## Auftrag — die Kette wieder durchlaufen lassen

**Mitbeauftragt: C-389.** Bericht in diese Datei.

**Beauftragt am 2026-09-07.**

### 1 · C-415 — der Bruch in Schritt 075

`[cmd]` **Du hast es gemeldet** — richtig, **statt es im Hinweis zu
lassen.**

`[read]` **Miss, seit wann der Lauf scheitert** — `[cmd]` **C-366
legte `food_tags_effective` an, C-405 lief die Kette neu.**

`[read]` **Und stell die Reihenfolge her:** **wer die Sicht anlegt,
muss vor 075 laufen.**

`[read]` **Das ist der wichtigste offene Punkt heute:** **eine Kette,
die nicht durchlaeuft, kann den Zustand nicht erzeugen** — **und
alles, was seit dem Bruch live eingespielt wurde, steht auf keinem
Fundament.**

`[cmd]` **Nachweis: ein Vollkettenlauf auf einer Wegwerf-Datenbank,
der bis zum Ende geht.**

### 2 · Ein Waechter danach

`[read]` **Erst wenn der Lauf durchgeht.**

`[cmd]` **`pnpm gate` prueft heute Encoding, Punkte, Nummern,
Datenlogik** — **aber nicht, ob die Kette laeuft.**

`[read]` **Miss, was ein solcher Waechter kosten wuerde** — **ein
Vollauf je Commit waere zu teuer, einer je Tag vielleicht nicht.**

### 3 · C-389 — die drei Saftfamilien

`[cmd]` **Vier Zeilen berichtigt, drei Smoothies bleiben `raw`,
keine 53er-Regel.**

`[read]` **Miss, ob der Punkt zu ist.**

### Was nicht zu tun ist

**Keine Datenlogik in `migrations/`.**
**Nie gegen die laufende Datenbank testen** — Wegwerf-Datenbank.
`apps/` nicht anfassen.
Nicht committen, nicht stagen, nicht pushen.

### Der Dev-Server gehoert dir nicht

`[cmd]` **Kein `neustart`, kein `start`, kein `aufraeumen`.**

### Nachweis

    Vollauf     geht bis zum Ende, auf Wegwerf-Datenbank
    seit wann   der Bruch, mit Fundstelle
    Waechter    was er kosten wuerde, gemessen
    C-389       zu / was offen

## Bericht

### C-415 - Reihenfolge wiederhergestellt

Der Bruch beginnt mit C-410: Commit `9940d6b3` vom 2026-09-05
16:29:23 +07 stellt die Leser in Schritt 075 auf
`nutrition.food_tags_effective` um. Der vorhergehende C-405-Lauf ist Commit
`4b841cca` vom selben Tag um 13:41:10 +07. C-366 (`ae0fb34b`,
2026-09-02) hatte die Sicht nur als zwei nicht in der Kette registrierte
Strukturschritte angelegt. Erst C-410 machte sie zur zwingenden Vorbedingung
von 075.

Die Kette registriert nun die bestehenden C-366-Schritte unmittelbar vor 075:
`366_schema` legt `food_tags_kuriert` und `food_tags_effective` an,
`366_precedence` setzt die Kurator-Prioritaet; 075 haengt explizit von
`366_precedence` ab. Die Migrationen selbst blieben unveraendert - keine
Datenlogik wurde in Migrationen gelegt.

Ein frischer Lauf aller 157 Schritte auf ausschliesslich
`lumeos_c415_validation` endete mit `KETTE OK: 266.6s`. Die
Abschlusspruefung meldet 121/121 Fremdtabellen vollstaendig. Dabei fiel ein
unabhaengiger falscher Negativbefund des Sollstands auf:
`coach.client_consent_log` und die fuenf C-385-Injektionstabellen waren
bereits Kettenschritte, aber nicht als erwartete Fremdtabellen verzeichnet.
Ihr Pruefvertrag ist nachgetragen; keine Tabelle und keine Datenlogik wurden
geaendert.

### Waechter

`pnpm gate` dauerte auf demselben Rechner 31.6 s; der Volllauf 266.6 s
(4 min 27 s), also rund 8.4-mal so lang. Ein Vollauf pro Commit verlaengert
jeden Commit um diese vier Minuten und ist fuer die lokale Schleife
ungeeignet. Ein geplanter taeglicher Wegwerf-Lauf kostet rund 4.5 Minuten pro
Tag beziehungsweise rund 31 Minuten pro Woche und deckt genau diese
Klassenluecke ab.

Empfehlung: Kette nicht in `pnpm gate` aufnehmen, sondern als taeglichen
CI-Job mit eigener Wegwerf-Datenbank ausfuehren und bei Fehler alarmieren.
Kein Scheduler wurde angelegt: Es fehlt die Festlegung, welcher vorhandene
CI-Planer ihn traegt.

### C-389 - geschlossen

Der C-389-Test ist auf der Wegwerf-Datenbank gruen. Die vier Saft-/
Nektarzeilen `F201600`, `F603600`, `F603700` und `F310600` sind
`minimally_processed`; ihre drei frischen Vergleichszeilen bleiben `raw`.
Die drei Smoothies `F032600`, `F033600` und `F034600` bleiben ebenfalls
`raw`. Aprikosensaft erscheint weiter auf Position 6 ausschliesslich wegen
`name_prefix` und verschwindet beim Filter
`exclude_processing_levels = minimally_processed`.

Damit ist C-389 zu: genau die drei gemessenen Familien, keine pauschale
53er-Regel und kein weiterer Rest.

### Geprueft

    pnpm exec tsx --test supabase/_pipeline/_validierung/quer-c415-chain-order.test.ts
    pnpm exec tsx supabase/_pipeline/kette-ausfuehren.ts --database lumeos_c415_validation --keep-database
    pnpm exec tsx --test supabase/_pipeline/_validierung/nutrition-c389-juice-processing.test.ts (PGDATABASE=lumeos_c415_validation)
    pnpm gate

Alle Datenbanknachweise liefen nur auf `lumeos_c415_validation`; die
Wegwerf-Datenbank wurde danach wieder entfernt.

## Abnahme

**2026-09-07, Orchestrator.**

### Die Ursache, mit Commit und Uhrzeit

`[cmd]` **C-410 (`9940d6b3`, 05.09. 16:29 +07) machte
`food_tags_effective` zur Voraussetzung von 075.**

`[cmd]` **Und C-366 hatte die Sicht nie in der Kette registriert.**

`[read]` **Zwei Halbheiten ergeben einen Bruch:** **C-366 baute die
Sicht live, C-410 machte sie zur Bedingung** — **und keiner von
beiden trug sie in die Kette ein.**

`[read]` **Das ist genauer als meine Vermutung im Auftrag.**
`[read]` **Ich schrieb *,,dazwischen liegt der Bruch"*** — **er hat
die Minute genannt.**

### Der Vollauf geht durch

`[cmd]` **157 Schritte, `KETTE OK: 266.6s`, auf
`lumeos_c415_validation`.** `[cmd]` **Die Wegwerf-Datenbank wurde
danach entfernt.**

`[cmd]` **366_schema und 366_precedence laufen jetzt vor 075** —
**ein Regressionstest sichert die Reihenfolge.**

`[read]` **Nicht nur repariert, sondern gegen Rueckfall
gesichert** — **genau das, was bei C-366 gefehlt hat.**

### Und der Sollstand war falsch, nicht die Kette

`[cmd]` **Sechs bereits erzeugte Fremdtabellen fehlten im
Sollstand** — **die Abschlusspruefung meldete einen falschen
Fehler.**

`[read]` **Er hat es nebenbei berichtigt und gesagt, dass er es tat.**

`[read]` **Eine Pruefung, die falsch rot meldet, ist dieselbe Klasse
wie eine, die falsch gruen meldet** — **beide verlieren ihren
Wert.**

### C-389 ist geschlossen

`[cmd]` **Vier Saefte und Nektare `minimally_processed`, drei
Smoothies `raw`, keine pauschale 53er-Regel.**

### Die Waechter-Empfehlung ist richtig

`[cmd]` **266,6 s gegen 31,6 s Gate** — **achtmal so teuer.**

`[read]` **Nicht ins Gate, taeglich als Wegwerf-Lauf** —
**uebernommen als C-416.**

`[read]` **Und der Grund steht in seinem eigenen Befund:** **die
Kette war zwei Tage gebrochen, und in dieser Zeit entstanden sieben
Punkte, die alle live eingespielt wurden.**

**Abgenommen.**

