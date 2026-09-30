---
nr: E-83
getroffen: 2026-09-30
von: Tom
status: gueltig
loest_ab: null
abgeloest_durch: null
betrifft: [G-542, G-543, G-565]
modul: goals
---

# E-83 — der Nutzer waehlt die Einheit, gespeichert wird die Rate

## Entscheidung

**Tom, 2026-09-30, 17:43:**

> gerechnet wird immer in kcal, das kann man als mensch zaehlen,
> prozente sind nur als grafik besser lesbar und in formel einfacher
> rechenbar

**Und 17:45, auf den Einwand des Orchestrators, kcal sei damit die
Anzeigegroesse:**

> das soll doch ein user entscheiden, manchmal ist es klarer mit
> prozenten zu arbeiten und manchmal easier mit direkt kcal. fuer uns
> doch egal solange wir wissen wie rechnen

`[read]` **Damit ist es keine Entscheidung ueber DIE Einheit, sondern
ueber die Zustaendigkeit:** beide Einheiten stehen dem Nutzer offen, und
er waehlt je Situation. **Fuer den Bau ist nur wichtig, dass eine
gespeichert wird und die Umrechnung feststeht.**

## Was gespeichert wird: die Rate

`[cmd]` **`goals.goal_phases.zielrate_pct_kg_woche numeric(5,3)`** bleibt
die gefuehrte Groesse. **Der Grund ist nicht Geschmack, sondern
Haltbarkeit:**

    0,25 %/Woche  bei 83,74 kg  =  +230 kcal/Tag
    0,25 %/Woche  bei 60,00 kg  =  +165 kcal/Tag

`[read]` **Dieselbe Absicht, zwei Zahlen.** Eine gespeicherte
Kilokalorienzahl waere beim naechsten Wiegen falsch, ohne dass sich die
Absicht geaendert haette. **Die Rate ist die Absicht, kcal ist ihr
heutiger Betrag.**

`[cmd]` **Und aus demselben Grund kann der KATALOG keine kcal tragen:**
`goal_strategies` gilt fuer alle Nutzer, die Kilokalorienzahl gilt fuer
einen. Die 17 Strategien fuehren weiter eine Rate.

## Die Umrechnung ist E-1, in beide Richtungen

    kcal/Tag  =  11 × Rate(% KG/Woche) × Gewicht(kg)
    Rate      =  kcal/Tag / (11 × Gewicht(kg))

`[cmd]` **Der Faktor 11 kommt aus 7700 kcal/kg** (E-1, 2026-09-28) und
ist in `goals.kcal_delta_aus_zielrate` umgesetzt (G-543, `20992639`).
**Nachgerechnet an Toms Daten:** 2.552,4 + 11 × 0,271 × 83,74 = 2.802,0.

`[read]` **Welches Gewicht gilt:** das am Phasenbeginn, wie in G-543
festgelegt — nicht das heutige. Sonst verschiebt sich das Tagesziel mit
jedem Wiegen, und die Phase haette kein Ziel mehr, sondern eine Spur.

## Was daraus zu bauen ist

`[read]` **Ein Umschalter, kein zweites Feld.** Wo der Nutzer die Rate
sieht oder eingibt, steht die Einheit daneben und laesst sich wechseln;
der Wert rechnet mit. **Zwei Eingabefelder fuer dieselbe Groesse waere
die Fehlerklasse aus G-529** — zwei Namen fuer eine Sache.

`[cmd]` **Heute ist es nur Prozent:** das Editorfeld heisst
`weight_change_target_percent` und traegt `%` als Suffix
(`phasen-editor-echt.tsx`), `tdee_modifier` ist ein nackter Faktor
(0,85). **Keine Stelle zeigt den Kilokalorienbetrag daneben.**

`[read]` **Das Kalorienradeln im Editor rechnet schon in kcal**
(+200 / −300) — **dort ist es die natuerliche Einheit**, und niemand
wuerde sie in Prozent wollen. Das ist der Beleg dafuer, dass Tom recht
hat: es haengt an der Situation, nicht am Wert.

**Das wird G-565.** Was der Nutzer zuletzt gewaehlt hat, gehoert an den
Nutzer, nicht an die Phase — eine Einstellung, keine Spalte in
`goal_phases`.

## Was NICHT entschieden ist

`[read]` **Ob unsere Katalogwerte stimmen.** `lean_bulk` steht auf
+0,25 %/Woche, das sind bei 83,74 kg +230 kcal/Tag; die Formelsammlung
nennt fuer Fortgeschrittene +200 und fuer Profis +150. **Das ist eine
Frage an Tobias und steht als G-566** — sie betrifft den WERT, nicht die
Einheit.
