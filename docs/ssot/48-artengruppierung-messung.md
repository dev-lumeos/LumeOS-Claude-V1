# Artengruppierung über den BLS-Code: die Messung

`[cmd]` Erhoben 2026-08-16 gegen die laufende lokale Instanz
(`nutrition.foods`, 7.140 Einträge). Skript:
`supabase/_pipeline/_validierung/arten-gruppierung-messen.ts`,
aufrufbar mit
`pnpm exec tsx supabase/_pipeline/_validierung/arten-gruppierung-messen.ts`.

Anlass: C-28. Nur lesende Abfragen; es entstand kein Schema, keine
Migration, keine Änderung an `nutrition.foods` oder `food_search`.

---

## Fragestellung

`[read]` Die ersten vier Stellen des BLS-Codes kodieren die Art
(`T410` = Lachs), die Stellen 5–7 die Zubereitung — so
`44-bls-codestruktur.md`. Die **Vermutung**, die zu prüfen war: der
Bestand lässt sich darüber sauber in Arten gruppieren.

Die Vermutung war zu prüfen, nicht zu bestätigen. Sie hat die Prüfung
**nicht bestanden.**

---

## Das Ergebnis in drei Zahlen

| Frage | Ergebnis | Abnahme |
|---|---|---|
| **F1** Ist eine Gruppe wirklich eine Art? | `[cmd]` **39 von 100** einheitlich | ≥ 95 — **nicht erreicht** |
| **F2** Wer vertritt die Art? | `[cmd]` **1.564 von 2.646** eindeutig | keine |
| **F3** Wie viele Gattungsnamen taugen nicht? | `[cmd]` **468 von 1.596** ohne X/Y (29,3 %) | keine |

**F1 ist mit 39 von 100 weit unter der Schwelle von 95.** Das Ergebnis
lautet „Modell trägt in dieser Form nicht". Es wurde nicht nachgebessert,
bis die Zahl stimmt.

---

## Methode

### Grundmenge

`[cmd]` 7.140 Einträge, gruppiert nach `left(bls_code,4)`.

| | |
|---|---|
| Gruppen gesamt | `[cmd]` 2.646 |
| davon mit ≥ 2 Einträgen | `[cmd]` 1.400 |
| Gruppen ohne X/Y | `[cmd]` 1.945 |
| Einträge mit Codelänge ≠ 7 | `[cmd]` 0 |

Die Codelänge ist durchgängig 7, `left(…,4)` und `substr(…,5,3)` greifen
also überall.

### Stichprobe

`[cmd]` Deterministisch: die 1.400 Gruppen mit ≥ 2 Einträgen nach
Kürzel sortiert, davon jede 14., ergibt 100 Gruppen. Kein Zufall — die
Messung ist wiederholbar und liefert bei jedem Lauf dieselben Gruppen.

### Das Einheitlichkeitsmerkmal

Die Entscheidung „eine Art oder mehrere" fällt nicht frei, sondern über
ein nachprüfbares Merkmal. Aus jedem `name_de` einer Gruppe wird die
Zubereitungsangabe entfernt; bleibt für alle Einträge derselbe Rest,
gilt die Gruppe als einheitlich.

Entfernt werden:
1. alles ab dem ersten Komma (`Pute Brust, ohne Haut, roh` → `Pute Brust`),
2. die elf Muster aus `nutrition.preparation_kinds.name_pattern`,
3. zwanzig Zusatzangaben (`ohne Fett`, `Pfanne`, `Ofen`, `gezuckert`,
   `mariniert`, `paniert`, …).

Verglichen wird der gefaltete Rest, damit Schreibvarianten nicht
stören.

**Zu Schritt 2:** `[cmd]` Die Muster in `preparation_kinds` treffen nur
auf **gefalteten** Text — `\mgeduenstet\M` findet gefaltet 353 Einträge
und ungefaltet 0, weil der Bestand „gedünstet" schreibt. Die Muster
werden aus der Tabelle gelesen, nicht im Skript nachgebaut; eine zweite
Kopie liefe stumm auseinander.

**Zu Schritt 3, und das ist eine Schwäche der Messung:** Schritt 3 ist
eine Erweiterung **meines Maßstabs**, nicht des Modells. `[cmd]` Ohne
ihn sind 30 von 100 Gruppen einheitlich, mit ihm 39. Beide Zahlen stehen
im Skript nebeneinander, damit sichtbar bleibt, welcher Anteil auf die
Regel und welcher auf den Bestand entfällt. **Für das Ergebnis ist die
Wahl folgenlos** — 30 wie 39 liegen weit unter 95.

---

## F1 — Ist eine Gruppe wirklich eine Art?

`[cmd]` **39 von 100 einheitlich, 61 uneinheitlich.**

### Wo das Modell bricht, und wo mein Maßstab

Die 61 Ausreißer zerfallen in zwei Klassen. Unterscheidungsmerkmal,
prüfbar: ist ein Kern ein Präfix eines anderen, trägt der längere nur
Zusatzworte — sonst benennen sie Verschiedenes.

`[cmd]` Vor Schritt 3 gemessen: **20 Präfix-Fälle** (Maßstab zu kurz),
**50 echte Mischungen** (Modell trägt nicht). Schritt 3 räumt die
Präfix-Fälle weitgehend ab; die 61 verbleibenden sind überwiegend echte
Mischungen.

**Echte Mischungen — verschiedene Erzeugnisse unter einem Code:**

| Kürzel | Einträge |
|---|---|
| `F201` | Aprikose roh · Aprikose gedünstet · **Aprikosensaft** · Aprikose gezuckert |
| `F603` | Orange roh · **Orangensaft** · **Orangennektar** |
| `F310` | Weintraube roh · **Traubensaft** |
| `M710` | Skyr · **Frischkäsezubereitung natur** |
| `P273` | Roséwein · **Rotling** |
| `C433` | Hirse Mehl · **Braunhirse Mehl** |
| `W154` | Schinkenmettwurst · **Salami kroatische Art** |
| `B106` | Vollkornbrot mit Ölsamen · mit Sonnenblumenkernen · mit Kürbiskernen · mit Nüssen |
| `D655` | Feiner Honigkuchen · Ostpreußischer Honigkuchen · **Pfefferkuchen** · **Sirupkuchen** |
| `M113` | H-Milch entrahmt · H-Milch fettarm · H-Vollmilch |

`Aprikose` und `Aprikosensaft` teilen sich `F201`; `Orange`,
`Orangensaft` und `Orangennektar` teilen sich `F603`. Der Saft ist ein
anderes Erzeugnis als die Frucht — anderer Nährwert, andere Menge, andere
Suchabsicht. **Der vierstellige Code trennt sie nicht.**

Die vollständige Liste der 61 Kürzel mit allen Namen gibt das Skript aus.

### Der Gegenbefund: Gerichte und Nicht-Gerichte trennen sich

`[cmd]` 29 der 61 uneinheitlichen Gruppen beginnen mit `X` oder `Y` —
den Fertiggerichten. Dieselbe Messung nur auf Nicht-Gerichte
(Grundmenge 959 Gruppen, wieder jede n-te, 100 Stück):

| Menge | einheitlich |
|---|---|
| alle Gruppen mit ≥ 2 Einträgen | `[cmd]` **39 von 100** |
| nur Nicht-Gerichte (ohne X/Y) | `[cmd]` **61 von 100** |

**Das Modell trägt für Zutaten deutlich besser als für Gerichte** — aber
auch 61 von 100 verfehlt die Schwelle von 95 klar.

### Die Gegenprobe an bekannten Fällen

`[cmd]` `T410` — der Fall aus dem TODO — enthält 14 Einträge, alle
`Lachs …`. Sauber. `[cmd]` `G561` enthält sieben `Tomate …` plus
`Tomate Pulver`; der Maßstab wertet das als uneinheitlich, und zu Recht:
Pulver ist ein anderes Erzeugnis als die Frucht.

Das Modell funktioniert also dort, wo der TODO-Befund es zeigt. Es
verallgemeinert nur nicht.

---

## F2 — Wer vertritt die Art?

Die Regel steht bereits in `nutrition.such_rang_zubereitung`
(`073_suchfilter.sql`): Rohform `100` und Grundform `000` sind
gleichrangig, danach entscheidet `sort_weight`. Sie wurde nachvollzogen,
nicht neu erfunden.

| | Gruppen |
|---|---|
| genau ein eindeutiger Vertreter | `[cmd]` **1.564** |
| mehrere gleichrangige | `[cmd]` **129** |
| **kein Vertreter** (weder `100` noch `000`) | `[cmd]` **953** |
| Summe | `[cmd]` 2.646 |

**953 Gruppen — 36 % — haben keinen Vertreter.** Das ist der zweite
gewichtige Befund dieser Messung und in C-28 nicht vorhergesehen.

`[cmd]` Beispiele: `B107` (Vollkornbrot mit Buttermilch `300`, mit Quark
`900`), `B780` (Pumpernickel `500`), `B515` (Weizenbrötchen mit Zwiebeln
`500`). Es sind überwiegend Erzeugnisse, die weder roh noch Grundform
sind — sie existieren nur in einer verarbeiteten Ausprägung.

`[cmd]` Die 129 gleichrangigen Fälle entstehen, wo `000` und `100`
nebeneinander stehen und dasselbe `sort_weight` tragen, etwa `B121`
(Roggenvollkornbrot `000` gegen Roggenvollkornbrot mit Kürbiskernen
`100`, beide `sort_weight` 520).

---

## F3 — Wie viele Gattungsnamen taugen nicht?

Der Gattungsname ist der Name des Vertreters ohne Zubereitungsangabe.
Unbrauchbar heißt hier prüfbar und ohne Geschmacksurteil: Schrägstrich,
Klammer, Mengenangabe, oder mehr als fünf Wörter.

**Geprüft wird der ROHE Name, nicht der gefaltete.** `[cmd]`
`nutrition.search_fold` entfernt Schrägstrich, Klammern und Prozent —
also genau die Merkmale, um die es geht (`Köhler/Seelachs` wird zu
`koehler seelachs`). Auf gefaltetem Text wäre die Zahl systematisch zu
niedrig.

### Gesamtbestand

`[cmd]` 1.693 Gruppen mit Vertreter, davon **491 unbrauchbar (29,0 %)**,
1.202 brauchbar.

| Kategorie | |
|---|---|
| Klammer | `[cmd]` 265 |
| Schrägstrich | `[cmd]` 220 |
| mehr als fünf Wörter | `[cmd]` 37 |
| Mengenangabe | `[cmd]` 33 |

### Nicht-Gerichte (Code beginnt nicht mit X oder Y)

`[cmd]` 1.596 Gruppen mit Vertreter, davon **468 unbrauchbar (29,3 %)**,
1.128 brauchbar.

| Kategorie | |
|---|---|
| Klammer | `[cmd]` 248 |
| Schrägstrich | `[cmd]` 216 |
| Mengenangabe | `[cmd]` 33 |
| mehr als fünf Wörter | `[cmd]` 31 |

Die Kategorien überschneiden sich (ein Name kann Klammer **und**
Mengenangabe tragen), die Summe der Zeilen übersteigt daher die 468.

**468 ist die Zahl, die den Kurationsaufwand beziffert.** Zum Vergleich:
`[read]` Toms Schätzung in C-31 lautete rund 2.000 Datensätze. Je Art
kuriert statt je Eintrag, und ohne Gerichte, sind es **468** — knapp ein
Viertel davon.

### Beispiele je Kategorie

**Schrägstrich:** `Weizenbrot/Weißbrot` · `Paniermehl/Semmelbrösel/Semmelmehl`
· `Eiweißbrot/Proteinbrot` · `Weizenkleber/Weizengluten`

**Klammer:** `Bulgur (Hartweizen)` · `Tortillachips (Nachos)` ·
`Fleischersatz glutenhaltig (Seitan)` ·
`Müsli Basismischung (ohne Trockenfrüchte) ungesüßt`

**Mengenangabe:** `Roquefort mind. 50 % Fett i. Tr.` ·
`Mozzarella mind. 20 % Fett i. Tr.` · `Ziegenmilch mind. 3 % Fett` ·
`Kondensmagermilch max. 1 % Fett`

**Mehr als fünf Wörter:**
`Mehrkornknusperbrot angereichert mit Vitaminen und Spurenelementen` ·
`Herrentorte (Mürbeteig und Wiener Boden hell) mit Apfel-Weincreme`

Die ersten 50 Fälle je Kategorie gibt das Skript aus.

### Ein Artefakt, das die Zahl nicht verfälscht

`[cmd]` Zwei Beispiele zeigen abgeschnittene Namen: `Schafmilch mind. 4`
und `Polenta (Maisgrieß mit Wasser`. Ursache ist Schritt 1 des Maßstabs
— „alles ab dem ersten Komma" schneidet hier mitten in einer Angabe. Auf
die **Zahl** wirkt es nicht: beide wären auch ungekürzt als unbrauchbar
gezählt worden (Mengenangabe bzw. Klammer). Auf die **Anzeige** eines
künftigen Gattungsnamens wirkt es sehr wohl; wer die Namen weiterverwendet,
muss das beheben.

---

## Was diese Messung nicht sagt

- **Sie sagt nicht, dass der BLS-Code nutzlos ist.** `[cmd]` `T410`
  gruppiert 14 Lachs-Einträge sauber, und der Code trennt `T207`
  (Köhler/Seelachs) verlässlich davon ab. Der Befund aus C-28 — der Code
  trennt, was der Name verwischt — bleibt gültig. Widerlegt ist nur die
  weitergehende Annahme, eine Gruppe entspreche **durchgängig** genau
  einer Art.

- **Sie sagt nicht, welches Modell stattdessen trägt.** Ob eine
  gröbere Ebene (drei Stellen), eine feinere (fünf), eine Kurationsliste
  für die Ausreißer oder eine Mischung besser passt, ist nicht gemessen.
  `[annahme]` Die Trennung 39 gegen 61 legt nahe, das Modell zunächst
  auf Nicht-Gerichte zu beschränken — **gemessen ist das nicht.**

- **Sie sagt nichts über die Suchqualität.** Es wurde keine einzige
  Suchanfrage ausgeführt. Ob eine Trefferliste nach Arten besser ist als
  die heutige, ist eine andere Frage.

- **Sie sagt nichts über die 1.246 Gruppen mit genau einem Eintrag.**
  Die Stichprobe zieht nur aus den 1.400 Gruppen mit ≥ 2 Einträgen;
  Einzelgruppen sind per Definition einheitlich und wurden ausgeschlossen,
  weil sie die Zahl beschönigen würden.

- **Die Stichprobe ist 100 Gruppen von 1.400** — rund 7 %. `[annahme]`
  Bei einem Ergebnis von 39 gegen die Schwelle 95 ist der Abstand so
  groß, dass eine größere Stichprobe die Aussage kaum kippt; eine
  Fehlerrechnung dazu wurde **nicht** durchgeführt. Für Zwischenwerte
  nahe der Schwelle wäre die Stichprobe zu klein.

- **F3 misst maschinelle Brauchbarkeit, nicht Verständlichkeit.**
  `Bulgur (Hartweizen)` ist für einen Menschen völlig klar und zählt hier
  trotzdem als unbrauchbar. Die 468 sind Fälle, die eine **Entscheidung**
  brauchen, nicht zwangsläufig eine Änderung.

---

## Folgerung für C-28

Die Abnahme ist nicht erreicht. `[cmd]` 39 von 100 statt der geforderten
95, für Nicht-Gerichte 61 von 100.

Nach der Vorgabe in C-28 — *„Scheitert das, fällt das Modell — und zwar
hier, nicht nach drei Tagen Bau"* — ist damit die Voraussetzung für
C-29/C-30 in der bisher gedachten Form nicht gegeben. Das ist der Zweck
dieser Messung gewesen.

Die drei Zahlen, die weiterhelfen:
- **61 von 100** für Nicht-Gerichte — das Modell trägt dort erheblich
  besser als im Gesamtbestand.
- **953 Gruppen ohne Vertreter** — ein Drittel der Gruppen hat keine
  Roh- oder Grundform, für die eine Vertreterregel greifen könnte.
- **468 Gattungsnamen** brauchen eine Entscheidung — deutlich weniger
  als die geschätzten 2.000.

Was daraus folgt, entscheidet Tom.
