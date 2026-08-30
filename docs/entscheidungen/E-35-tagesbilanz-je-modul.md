---
nr: E-35
getroffen: 2026-08-30
von: Tom
status: gueltig
loest_ab: null
abgeloest_durch: null
betrifft: [C-344, C-350, C-323]
modul: quer
---

# E-35 — die Tagesbilanz gehoert ins Modul, die Summe nach oben

## Anlass

Codex meldete in C-350: *,,Die Tagesbilanz trennt Nahrung und
Supplemente nicht. Die 88 MG-Tage sind daher keine nachgewiesenen
Supplementueberschreitungen."*

**Tom, 2026-08-30:** *,,das ist fernab von jeder spec und modullogik
das tagesbilanzen nicht pro modul vorhanden sind und wenn noetig
fuer dashboard oder buddy summiert werden"*.

## Die Messung zeigt, dass die Beschreibung falsch herum war

`[cmd]` **`nutrition.daily_summary` liest ausschliesslich
`nutrition.meal_items`.** `[cmd]` **`daily_reference_assessment`
erwaehnt Supplemente an keiner Stelle** — kein `intake_log`, kein
`stack`, kein `supplement`.

`[read]` **Nutrition trennt also nicht schlecht — es rechnet Nahrung,
und das ist richtig so.**

`[cmd]` **Die Luecke liegt auf der anderen Seite:** `supplements`
fuehrt **744 Einnahmen und 17 Naehrstoffzuordnungen — und keine
einzige Tagesfunktion.**

## Die Regel

**Jedes Modul rechnet seine eigene Tagesbilanz.**
**Summiert wird oben — im Dashboard oder in Buddy, nicht im Modul.**

`[read]` **Warum das mehr ist als Ordnung:** ein Modul, das fremde
Daten mitrechnet, muss deren Regeln kennen. `[cmd]` **Die
Obergrenzen fuer Magnesium, Niacin und Folsaeure gelten nur fuer
Supplemente** (C-344) — **wer sie gegen eine gemischte Summe haelt,
bekommt in beide Richtungen falsche Antworten.**

`[read]` **Und die Trennung ist die Voraussetzung dafuer, dass die
Quellengeltung ueberhaupt wirken kann.** **Erst mit getrennten Summen
laesst sich sagen: *dieser Anteil kam aus Praeparaten*.**

## Was daraus folgt

`[read]` **Supplements braucht eine Tagesbilanz** — dieselbe Gestalt
wie `nutrition.daily_summary`, aus `intake_logs` und
`supplement_nutrients`.

`[cmd]` **Die Kette dorthin ist gebaut und leer:** von 360 Einnahmen
erreichen 90 einen Naehrstoffcode, alle denselben (C-323).
`[cmd]` **Und 2 von 4 Stack-Positionen auf `dev` haben kein
`supplement_id`.**

`[read]` **Die Summierung kommt danach** — und sie gehoert dorthin,
wo beide Bilanzen sichtbar sind, nicht in eines der beiden Module.
