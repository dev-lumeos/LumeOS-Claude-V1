---
nr: C-342
typ: entscheidung
modul: nutrition
schwere: hoch
angelegt: 2026-08-29
braucht: []
kind_von: C-324
entscheidung: E-32
agent: codex
beauftragt: 2026-08-29
erledigt: 2026-08-30
commit: OFFEN
beruehrt:
  tabellen: [nutrition.nutrient_reference_values, nutrition.meal_plans]
zahlen:
  gemessen: 2026-08-29
  einheit_bestand: ug_RE
  einheit_nrf: IU
---

# C-342 — Vitamin A in IE gegen Mikrogramm

## Befund

Aus C-324, Codex, 2026-08-29. **Vom Orchestrator nachgemessen.**

`[cmd]` **Der Bestand fuehrt Vitamin A in Mikrogramm
Retinol-Aequivalent** — `nutrient_defs` und
`nutrient_reference_values` beide.

`[cmd]` **NRF9.3 rechnet gegen 5.000 IU.**

`[read]` **Und die Umrechnung ist formabhaengig:** Retinol und
Beta-Carotin haben verschiedene Faktoren. `[cmd]` **C-149 hat Vitamin
A und E deshalb ausdruecklich ohne Zuordnung gelassen.**

## Die Frage

**Wie soll NRF9.3 mit Vitamin A umgehen?**

`[read]` **Drei Wege, alle mit Kosten:**

**Faktor setzen und begruenden.** `[read]` Ein pauschaler Faktor waere
eine Annahme ueber die Zusammensetzung — **genau das, was C-149
verweigert hat.**

**Vitamin A weglassen.** `[read]` Dann ist es NRF8.3, **und die
Validierungsstudien gelten nicht mehr** — sie sind fuer die
Neunerfassung gerechnet.

**Gegen einen Mikrogramm-Richtwert rechnen.** `[read]` Der
EFSA-Zielwert steht im Bestand. **Dann ist es nicht mehr die
Originalfassung** — E-25 haelt fest, dass die Studienlage fuer die
Originalwerte gilt.

`[read]` **Der dritte Weg ist der ehrlichste, wenn er benannt wird:**
*,,NRF9.3 mit europaeischen Referenzwerten"* ist eine eigene Formel,
**aber sie waere durchgehend eine.** Die anderen beiden mischen.

## Auftrag — Umrechnungsfaktoren und die Plan-Kette

**Entschieden in `docs/entscheidungen/E-32`.** **Mitbeauftragt:
C-239-Nachlauf (einspielen) und die Herkunftsspalte fuer G-269.**

### Vorweg

`[read]` **Dieser Auftrag traegt keine Zahlen vom Orchestrator.**
**Nenn Nutzer und Zeitraum bei jeder Messung.**

### 0 · Die Vorlage liegt im Repo

`[cmd]` **`docs/BrainstormDocs/Nutrition/micronutrients_audited_config.json`**
— drei Naehrstoffe als Muster, von Tom geprueft. **Die vollstaendigen
27 kommen nach.**

`[read]` **Bau die Struktur an diesen dreien.** Sie decken alle
Faelle ab: einen Naehrstoff mit IE-Faktor und normalem UL (Vitamin
D), einen mit Faktor und Formangabe in der Einheit (Vitamin A,
`µg RAE`), und einen, dessen UL nur fuer Supplemente gilt
(Magnesium).

### Drei Dinge, die die Vorlage offenlaesst

**1 · Die Sportlerwerte sind abgeleitet, nicht zitiert.**

`[cmd]` `source` nennt *,,AG Sporternaehrung der DGE / ACSM"*, und
`source_locator` sagt *,,Derivation: Oxidative-Stress-Pufferung (+30%
auf Basiswert)"*.

`[read]` **Die Quelle belegt das Prinzip, nicht die Zahl.** **1.100 µg
fuer `athlete_medium` stehen dort nicht.**

`[read]` **Also ein eigenes Feld, das den Wert als abgeleitet
kennzeichnet** — nicht nur im Fliesstext. **Die Oberflaeche muss es
zeigen koennen, damit niemand 1.300 µg fuer eine DGE-Empfehlung
haelt.**

**2 · `ul_locator` traegt die Quellengeltung als Fliesstext.**

`[cmd]` *,,(gilt nur fuer Supplemente)"* bei Magnesium.

`[cmd]` **Du hast die Quellengeltung in C-344 strukturell gebaut** —
**dorthin gehoert sie, nicht in den Text.** `[read]` **Ein Freitext
ist nicht abfragbar; genau das war der Befund.**

`[cmd]` **Und die Vorlage belegt, warum:** alle sechs
Magnesium-Zielwerte liegen ueber dem UL von 250 — **ohne die
strukturelle Geltung saehe jeder Nutzer bei jedem Zielwert eine
Ueberschreitung.**

**3 · `upper_limit: 0` heisst *,,es gibt keine"*, nicht *,,null"*.**

`[cmd]` **In der ersten Fassung der Liste trugen neun Naehrstoffe
eine Null:** `vit_k`, `vit_b1`, `vit_b2`, `vit_b5`, `vit_b7`,
`vit_b12`, `kalium`, `chlorid`, `chrom`.

`[read]` **Beim Import muss daraus `NULL` werden.** **Eine Null als
Obergrenze macht jeden Wert zur Ueberschreitung** — dieselbe
Unterscheidung wie C-48 Regel 1 und `NO_STANDALONE_REFERENCE`.

### 1 · C-342 — die Faktortabelle

**Tom, 2026-08-29:** *,,es gibt fuer jedes vitamin offizielle
umrechnungsformeln, das heisst wir koennen die table erweitern mit
dem faktor dass wir auch ui kennen"*.

`[read]` **Je Naehrstoff UND Form: Faktor, Ausgangseinheit,
Zieleinheit, Quelle.** `[read]` **Ein Faktor je Naehrstoff waere
falsch** — Retinol und Beta-Carotin rechnen verschieden,
Alpha-Tocopherol und die uebrigen Tocopherole ebenso.

`[cmd]` **C-149 hat Vitamin A und E deshalb ohne Zuordnung
gelassen.** `[read]` **Das war richtig, und es faellt nicht weg** —
es wandert in eine Spalte, die die Form mitfuehrt.

**Kein Faktor ohne Beleg.** `[read]` **Wo eine Form keine offizielle
Umrechnung hat, bleibt sie leer, und der Folat-Waechter aus C-149
greift.** `[cmd]` **Dieselbe Regel wie bei den Tag-Schwellen in
G-221.**

`[cmd]` **Die Quelle je Zeile, wie in `nutrient_reference_values`** —
`source`, `source_version`, `source_locator`, `source_url`.

`[read]` **Und die Oberflaeche muss den Faktor lesen koennen, nicht
nachrechnen** — ein zweiter Rechenweg waere die zweite Wahrheit aus
E-31.

### 2 · Die Plan-Kette einspielen

`[cmd]` **Der Lebenszyklus aus C-239 und der Status aus C-238 liegen
in der Kette, nicht live.** `[read]` **Vier Punkte warten darauf** —
G-267, G-268, G-269, G-270.

`[read]` **Miss vorher, was live steht, und danach, was sich
geaendert hat.** `[cmd]` **Vollsicherung vor dem Eingriff.**

### 3 · Die Herkunftsspalte am Plan

`[cmd]` **`coach.client_autonomy.nutrition_level` existiert und ist
gefuellt** — fuenf Zeilen, `CHECK 1..5`, `dev` auf Stufe 3.
**Gemessen in G-271.**

`[read]` **Was fehlt: die Spalte am Plan, die sagt woher er kommt** —
selbst erstellt, vom Coach, aus dem Marktplatz.

`[read]` **Und die Regel, die eine Autonomiestufe auf ein
Bearbeitungsrecht abbildet.** `[cmd]` **E-29 gilt: Modulzugriffe auf
`coach` gehen ueber eine Funktion**, nicht direkt.

`[read]` **Ob die Regel schon irgendwo steht, ist zu messen** —
`client_permissions` koennte sie tragen.

### Was nicht zu tun ist

**Keinen Faktor setzen, der nicht belegt ist.**
**Keine automatischen Ablaufaktionen erfinden** — das hast du in
C-239 richtig gelassen.
`apps/` nicht anfassen — Claude Code arbeitet dort.
Nicht committen, nicht stagen, nicht pushen.

### Nachweis

    Faktoren je Naehrstoff+Form   Zahl, je Zeile eine Quelle
    ohne Beleg geblieben          welche, mit Grund
    Vitamin A in IE               rechenbar? belegt
    Plan-Kette live               vorher / nachher, alle vier
                                  Spalten
    Herkunftsspalte               vorhanden, Werte belegt
    Autonomieregel                gemessen: existiert sie schon?
    bestehende Plaene             unveraendert - belegt
    Naehrstoffe ohne BLS-Code     welche der 27 kennt der Katalog
                                  nicht?

`[read]` **Die letzte Zeile ist nicht nebensaechlich:** `[cmd]` **die
Liste fuehrt Selen, BLS kennt es nicht** (C-211/C-333, gemessen
2026-08-29). `[read]` **Ein Zielwert fuer einen Naehrstoff, den der
Katalog nicht misst, kann nie erfuellt werden** — **das gehoert als
Zustand angezeigt, nicht als Mangel.**

### Regeln

`tools/lauf.py`, keine Konsolenfenster.
**Wegwerf-Datenbank, Vollsicherung vor jedem Live-Eingriff nach
`backup/`.**

**Wenn eine Vorgabe nicht aufgeht: melden, nicht passend machen.**

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

**2026-08-30, Orchestrator. Nachgemessen.**

`[cmd]` **Live:** `nutrition.nutrient_unit_conversion_factors`
existiert, `is_derived` und `derivation_note` stehen in
`nutrient_reference_values`.

`[cmd]` **C-239 mit eingespielt:** `meal_plan_logs`, `plan_origin`,
und `coach.darf_nutrition_plan_aendern()`.

`[cmd]` **Vollsicherung vor dem Eingriff**, mit Pruefsumme.

### Der wertvollste Teil ist, was er nicht getan hat

`[read]` **Vitamin A wird nicht konvertiert, obwohl fuenf Formen
hinterlegt sind.** `[cmd]` **Der BLS-Katalog liefert nur µg RE ohne
Formangabe** — **also bleibt die Umrechnung gesperrt, statt einen
falschen Faktor anzuwenden.**

`[read]` **Das ist C-149 zu Ende gedacht:** die Tabelle loest den
Fall, in dem die Form bekannt ist. **Hier ist sie es nicht, und der
Waechter greift.**

### Ein Zahlenkonflikt, nicht aufgeloest

`[cmd]` **Live steht der Magnesium-UL bei 350 mg (NAM), die Vorlage
nennt 250 mg (EFSA).**

`[read]` **Zwei Institutionen, zwei Werte, beide belegt.** **Er hat
den Bestand nicht ueberschrieben und es gemeldet** — **als C-350 an
Tom.**

### Die Falle ist verriegelt, bevor die 27 kommen

`[cmd]` **`UL = 0` wird von einer Datenbankregel abgewiesen.** `[read]`
**Ein kuenftiger Importer muss `0` zu `NULL` normalisieren** — die
Regel erzwingt es, statt darauf zu hoffen.

### Die Quellengeltung ist maschinenlesbar

`[cmd]` **`MG`, `NIA` und `FOLAC` gelten nur fuer die jeweiligen
Supplement- und Anreicherungsquellen** — nicht mehr als Freitext.
**Das war der Befund aus C-344.**

### Was offen bleibt

`[cmd]` **Von den drei Mustern sind `VITA`, `VITD` und `MG` im
Katalog, `SE` fehlt.** `[cmd]` **Die versprochenen 27 liegen noch
nicht vor** — **deshalb keine vollstaendige Fehlliste.**

`[read]` **Und Selen muss spaeter als *nicht messbar im Katalog*
erscheinen, nicht als Mangel** — das hat er richtig festgehalten.

`[cmd]` **Die zwei Bestandsplaene bleiben `active`, Lebenszyklus und
`plan_origin` sind `NULL`** — **weil sie nicht belegbar sind.**
`[read]` **Nicht geraten.**

`[cmd]` **`coach.darf_nutrition_plan_aendern()` erlaubt direkte
Aenderungen nur bei voller Sicht, `nutrition_auto_apply` und Stufe
5.** `[cmd]` **`dev` steht auf Stufe 3 und bekommt keine Freigabe** —
E-29 ist damit gebaut, nicht behauptet.

**Abgenommen.**

