---
nr: E-34
getroffen: 2026-08-30
von: Tom
status: gueltig
loest_ab: null
abgeloest_durch: null
betrifft: [C-342, C-350, C-149]
modul: nutrition
---

# E-34 — die Form ist ableitbar, und EFSA gilt

## Zwei Fragen, eine Antwort

**Tom, 2026-08-30:** *,,wir reden hier ueber belanglosigkeiten wo
alles loesbar in den daten liegt"*.

## 1 · Vitamin A: die Form steht nicht da, sie ist ableitbar

`[cmd]` **Codex hat in C-342 gemeldet, der Katalog liefere nur µg RE
ohne Form** — **und die Umrechnung deshalb gesperrt.**

`[cmd]` **Gemessen 2026-08-30 auf `dev`, 30 Tage:**

    RETOL          385,1 ug/Tag
    CARTB       15.144,8
    CAROTPAXB    1.101,0

    RE  = Retinol + Beta-Carotin/6  + Rest/12   = 3.001,0
                                   gespeichert    3.002,4
    RAE = Retinol + Beta-Carotin/12 + Rest/24   = 1.693,0
                                   gespeichert    1.693,4

`[read]` **Abweichung unter einem Promille.** `[cmd]` **Und alle drei
Formen tragen Werte im Katalog:** `RETOL` bei 7.092 Lebensmitteln,
`CARTB` bei 6.325, `CAROTPAXB` bei 5.093.

**Tom:** *,,wir haben ein gerechnetes total und muessen die einzelnen
durchrechnen dann hast die form"*.

`[read]` **Damit faellt die Sperre.** **Die Umrechnung nach IE geht
ueber die Bestandteile, nicht ueber einen pauschalen Faktor:**

    IE = Retinol/0,3 + Beta-Carotin/0,6 + uebrige Carotinoide/1,2

`[read]` **Und C-149 bleibt trotzdem richtig:** dort ging es darum,
**keinen Faktor zu setzen, wenn die Form unbekannt ist.** **Hier ist
sie bekannt, weil die Bestandteile es sind.**

## 2 · Magnesium: EFSA gilt

`[cmd]` **Live 350 mg (NAM), Vorlage 250 mg (EFSA).**

**EFSA gilt. Der NAM-Wert bleibt als zweite Zeile mit eigener Quelle
stehen.**

`[read]` **Drei Gruende:**

`[cmd]` **Der Bestand rechnet durchgehend gegen EFSA** — ein
einzelner NAM-Wert dazwischen ist eine zweite Bezugsgroesse im selben
Modul. **Genau die Falle, die bei NRF9.3 zum Blocker wurde (E-25).**

`[read]` **Der niedrigere Wert warnt frueher, und das kostet hier
nichts:** `[cmd]` die Grenze gilt nur fuer supplementaeres Magnesium
(C-344). **Wer 300 mg als Praeparat nimmt, bekommt bei 250 einen
Hinweis und bei 350 keinen.**

`[read]` **Und er passt zur Kette:** der Zielwert fuer Sportler liegt
bei 450 bis 550 mg aus Nahrung. **Wer zusaetzlich supplementiert,
sollte es wissen.**

`[read]` **Nicht geloescht, sondern eingeordnet** — eine Zahl, die
jemand nachgeschlagen hat, wird nicht bewegt, sondern bekommt ihren
Platz.

## Was daraus folgt

`[read]` **C-324 ist damit entblockt.** `[cmd]` NRF9.3 rechnet Vitamin
A gegen 5.000 IE — **die IE sind jetzt aus den Bestandteilen
rechenbar.**
