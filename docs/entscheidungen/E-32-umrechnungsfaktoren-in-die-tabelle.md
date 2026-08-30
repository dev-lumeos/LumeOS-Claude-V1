---
nr: E-32
getroffen: 2026-08-29
von: Tom
status: gueltig
loest_ab: null
abgeloest_durch: null
betrifft: [C-342, C-149, C-324]
modul: nutrition
---

# E-32 — Umrechnungsfaktoren gehoeren in die Tabelle

## Frage

`[cmd]` **NRF9.3 rechnet Vitamin A gegen 5.000 IU, der Bestand fuehrt
Mikrogramm Retinol-Aequivalent.** `[cmd]` **C-149 hat Vitamin A und E
ausdruecklich ohne Zuordnung gelassen, weil ihre Faktoren
formabhaengig sind.**

## Entscheidung

Tom, 2026-08-29: *,,es gibt fuer jedes vitamin offizielle
umrechnungsformeln, das heisst wir koennen die table erweitern mit
dem faktor dass wir auch ui kennen"*.

**Die Faktoren kommen in die Tabelle, mit Quelle.**

## Was C-149 richtig gesehen hat und was daraus folgt

`[read]` **C-149 hat nicht gesagt, es gebe keine Faktoren** — sondern
**dass sie von der Form abhaengen.** `[read]` **Beides ist wahr, und
genau deshalb gehoeren sie in eine Tabelle statt in eine Formel:**

    ein Faktor je Naehrstoff        waere falsch
    ein Faktor je Naehrstoff+Form   ist das, was die Quellen fuehren

`[read]` **Retinol und Beta-Carotin rechnen verschieden. Alpha-
Tocopherol und die uebrigen Tocopherole ebenso.** **Eine Spalte, die
das nicht mitfuehrt, macht denselben Fehler wie ein gesetzter
Faktor** — sie sieht nur ordentlicher aus.

## Was zu bauen ist

**Je Naehrstoff und Form: Faktor, Ausgangseinheit, Zieleinheit,
Quelle.**

`[read]` **Und die Quelle je Zeile, wie ueberall sonst** —
`nutrient_reference_values` fuehrt `source`, `source_version`,
`source_locator`, `source_url`. **Dieselbe Form.**

`[read]` ***,,dass wir auch ui kennen"*** heisst: die Oberflaeche
muss den Faktor lesen koennen, **nicht nachrechnen.** **Ein zweiter
Rechenweg waere die zweite Wahrheit, die E-31 zurueckgestellt hat.**

## Was daran haengt

`[cmd]` **C-324 ist blockiert**, weil NRF9.3 Vitamin A in IE
verlangt. `[read]` **Mit der Tabelle faellt dieser Blocker.**

`[cmd]` **C-149 hat Folat mit einem Waechter versehen**, der ohne
Form und Einnahmebezug *unbekannt* liefert statt einen nicht
belegbaren Wert. `[read]` **Der Waechter bleibt richtig** — er greift
dort, wo die Form fehlt. **Die Tabelle loest den Fall, in dem sie
bekannt ist.**

## Die Vorlage, 2026-08-29

`[cmd]` **Tom hat eine gepruefte Fassung geliefert:**
`docs/BrainstormDocs/Nutrition/micronutrients_audited_config.json` —
drei Naehrstoffe als Muster, die vollstaendigen 27 folgen.

`[cmd]` **Sie traegt Quelle, Version und Fundstelle je Zielwert** —
genau was diese Entscheidung verlangt.

`[cmd]` **Und die Form steht in der Einheit statt in einer eigenen
Spalte:** `µg RAE`, nicht `µg Vitamin A`. `[read]` **Damit ist ein
Faktor je Naehrstoff zulaessig** — die Einheit sagt, worauf er sich
bezieht. **Sauberer waere eine eigene Spalte, aber die Aussage
stimmt.**

### Drei Dinge, die die Vorlage offenlaesst

**Die Sportlerwerte sind abgeleitet, nicht zitiert.** `[cmd]` Die
Quelle belegt das Prinzip, `source_locator` sagt *,,Derivation: +30%
auf Basiswert"*. `[read]` **Die Zahl steht dort nicht** — sie braucht
ein eigenes Feld, damit die Oberflaeche sie kennzeichnen kann.

**`ul_locator` traegt die Quellengeltung als Fliesstext.** `[cmd]`
*,,(gilt nur fuer Supplemente)"*. `[read]` **C-344 hat sie
strukturell gebaut — dorthin gehoert sie.**

**`upper_limit: 0` heisst *es gibt keine*.** `[cmd]` In der ersten
Fassung trugen neun Naehrstoffe eine Null. `[read]` **Beim Import
muss daraus `NULL` werden** — eine Null als Obergrenze macht jeden
Wert zur Ueberschreitung.

## Was nicht passieren darf

`[read]` **Kein Faktor ohne Beleg.** `[read]` **Wenn eine Form keine
offizielle Umrechnung hat, bleibt sie leer — und der Waechter aus
C-149 greift.** `[cmd]` **Das ist dieselbe Regel wie bei den
Tag-Schwellen in G-221 und den Recovery-Konstanten in E-06/E-09.**
