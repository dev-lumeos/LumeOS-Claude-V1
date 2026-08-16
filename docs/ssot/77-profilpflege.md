# GO-01: Profilpflege in der Oberfläche

`[cmd]` Erhoben am 2026-08-16, Zweig `dev`. Erster Schritt aus Block A
des Goals-Plans
(`docs/spezifikation/30-module/core/goals/00-umsetzungsplan.md`).

Gebaut: eine Seite unter `/v2/settings`, die die sechs Profilfelder
liest und schreibt. **Keine Datenbankänderung, kein Kettenschritt.**

---

## Warum `/v2/settings` und nicht `/v2/profil`

`[cmd]` Die Seitenleiste führt seit G-02 unter `SYSTEM` einen Eintrag
`Settings` mit `href: /v2/settings` — er zeigte bis heute ins Leere.

Eine Route `/v2/profil` daneben hätte zwei Kosten: der vorhandene
Eintrag bliebe tot, und es gäbe zwei Begriffe für dieselbe Ecke der
Anwendung.

`[read]` Der `ONBOARDING_ADR` stützt das: *„Jedes Modul hat einen
eigenen Settings-Tab"*, und Settings ist *„immer der letzte Tab"*. Das
Profil ist der modulübergreifende Teil davon — es gehört unter
Einstellungen, nicht daneben.

---

## Was gebaut wurde

| Datei | Rolle |
|---|---|
| `lib/profile/profile-model.ts` | Reines Modell, Zod-Prüfung, keine I/O |
| `lib/profile/profile-write.ts` | Lesen und Schreiben, Session-Client |
| `app/api/profile/route.ts` | `GET` und `PUT`, Fehlerformat `{ error, code }` |
| `app/v2/settings/page.tsx` | Serverkomponente, lädt das Profil |
| `app/v2/settings/formular.tsx` | Das Formular |

`[cmd]` Dieselbe Dreiteilung wie beim ersten Schreibpfad (C-02,
Food-Präferenzen): Modell rein, I/O getrennt, Route dünn.

### Die Felder

`[cmd]` Die Prüfbedingungen spiegeln die CHECK-Constraints von
`public.profiles` — sie ersetzen sie nicht, die Datenbank bleibt die
letzte Instanz. Sie stehen im Modell, damit die Nutzerin einen
brauchbaren Satz liest statt einer Postgres-Fehlermeldung.

| Feld | Eingabe | Grenzen |
|---|---|---|
| `birth_date` | Datumsfeld | ab 1900-01-01, nicht in der Zukunft |
| `biological_sex` | Auswahl | `male`, `female` |
| `height_cm` | Zahl mit Einheit | 80–260 |
| `body_weight_kg` | Zahl mit Einheit | 20–400 |
| `activity_level` | Liste mit Faktor | fünf Stufen |
| `nutrition_goal` | Auswahl | sechs Werte |

`[read]` **Datum, nicht Alter.** Ein gespeichertes Alter ist am nächsten
Geburtstag falsch; `daily_reference_assessment` rechnet es ohnehin aus
dem Geburtsdatum aus.

`[read]` **Die Aktivitätsliste zeigt den Multiplikator.** Das Muster
stammt aus `theme-v1/module-onboarding.jsx` — ohne den Faktor ist
„mässig aktiv" eine leere Behauptung. `[cmd]` Die Werte stammen aus
`SCORING.md` (`ACTIVITY_MULTIPLIER`); ein Test hält beide gegeneinander.

### Schwangerschaft und Stillzeit als Zeiträume

`[cmd]` So sind sie angelegt: je ein Start- und ein Enddatum, mit einem
CHECK, dass das Ende nicht vor dem Beginn liegt. Leeres Ende heisst
„läuft noch".

`[read]` Das ist kein Formalismus: `daily_reference_assessment` prüft
für **einen bestimmten Tag**, ob er im Zeitraum liegt. Ein Häkchen
„schwanger" würde für vergangene Tage falsche Referenzwerte liefern.

**Eine Regel geht über die Datenbank hinaus:** ein Ende ohne Beginn wird
abgelehnt. Der CHECK lässt das durch, weil er nur die Reihenfolge prüft
— fachlich ist es ein halber Datensatz.

---

## Der Schreibpfad

`[cmd]` Nach C-02 ist das der **zweite** Schreibpfad in `apps/web`.
Zweifach abgesichert:

1. **Session-Client**, kein Service-Schlüssel, kein `docker exec`.
2. **`id` wird explizit auf `auth.uid()` gesetzt**, nie aus der Eingabe
   übernommen. `[cmd]` Die Policies verlangen `auth.uid() = id` in
   `USING` und `WITH CHECK`; ein aus der Eingabe übernommener Wert wäre
   ein Weg, fremde Zeilen anzusprechen.

`[cmd]` **Keine Datenbankänderung nötig.** `authenticated` hat bereits
`SELECT, INSERT, UPDATE` auf `public.profiles`, und die vier Policies
stehen seit `090_profile.sql`. `[read]` Das war die Begründung dafür,
diesen Schritt vor die Zieltabelle zu setzen — und sie hat gehalten.

`upsert` statt `update`: existiert die Zeile nicht, entsteht sie. Die
Insert-Policy erlaubt genau das für die eigene Kennung.

---

## Nachweis

### Gate und Tests

`[cmd]` `pnpm gate`: **8 successful, 8 total**.
`[cmd]` Tests: **175 von 175** (vorher 155; zwanzig neue).

### Im Browser, angemeldet

`[cmd]` Mit `test-user@lumeos.local` über Playwright:

| Schritt | Ergebnis |
|---|---|
| Seite geladen | Formular da, 5 Aktivitätsstufen |
| Stand vorher | **0/6** |
| Sechs Werte eingetragen, gespeichert | „Gespeichert." |
| Neu geladen | `1990-05-17`, `male`, `182`, `78.4`, `gain_muscle`, Stufe 3 |
| Stand nachher | **6/6** |

Die Werte stehen nach dem Neuladen noch da — sie kommen aus der
Datenbank, nicht aus dem Formularzustand.

### Die Zählung geht von 0 auf 1

`[cmd]` Vor dem Speichern und danach:

```
 zeilen | mit_geburt
      2 |          0      ← vorher
      2 |          1      ← nachher
```

`[cmd]` Nur die Zeile der Testnutzerin wurde geschrieben; die zweite
Zeile ist unverändert leer.

### Zeilenschutz in beide Richtungen

`[cmd]` Mit zwei Sitzungen als Rolle `authenticated`:

| Sitzung | sichtbare Zeilen | sieht fremde Daten |
|---|---:|---:|
| Eigentümerin `61e9…0615` | 1 | 1 (die eigenen) |
| Fremd `d15f…e1a6` | 1 (ihre eigene) | **0** |

`[cmd]` Schreibversuch der fremden Sitzung auf die andere Zeile:
**`UPDATE 0`** — die Policy blockiert lautlos. `[cmd]` Der Wert danach
geprüft: `182.00`, nicht `999`.

`[cmd]` Ohne Sitzung antwortet `/api/profile` mit **307** nach
`/login?redirect=%2Fapi%2Fprofile` — die Middleware deckt die Route ohne
Zutun ab.

### Wirkung, an echten Zeilen belegt

Der eigentliche Punkt von GO-01. `[cmd]` Auf einer Wegwerf-Datenbank
(Kette von leer, danach verworfen), dieselbe Mahlzeit zweimal bewertet:

| | `missing_profile` | `incomplete` | `complete` |
|---|---:|---:|---:|
| **ohne Profil** | **33** | 0 | 0 |
| **mit Geburtsdatum und Geschlecht** | 0 | 30 | **15** |

`[cmd]` Mit Profil liefert die Funktion echte Werte:

```
 CA  | 800 | PRI | 84.2 % | Alter 35 | male
 CHO |  50 | RI  | 111.1 %
 FAT |  20 | RI  | 100.0 %
```

Das Alter 35 ist aus dem Geburtsdatum gerechnet, nicht gespeichert.

### Drei Breiten und die alte Oberfläche

`[cmd]` 1600 px, 1100 px, 800 px — kein waagrechter Überlauf.
`[cmd]` `/nutrition`: **0** Elemente mit `v2-`-Klasse, **1**
`.lume-shell`.

`[cmd]` Konsolenmeldungen: vier, alle die bekannte
`data-mode`-Hydrationswarnung aus `app/layout.tsx` — seit G-02
gemeldet, nicht aus diesem Auftrag.

---

## Zwei Befunde nebenbei

### 1. `resolveNav` kannte `/v2/settings` nicht

`[cmd]` Beim ersten Browserlauf schrieb die Kopfzeile **„Dashboard"**,
und die Seitenleiste hob den Dashboard-Eintrag hervor — auf
`/v2/settings`.

Ursache: `resolveNav` lief nur über `MODULES`; `SETTINGS_ENTRY` steht
unter `SYSTEM` und war nie dabei. Der Fehler stammt aus G-02 und fiel
erst auf, als Settings die erste echte Seite bekam. **Ein leerer Eintrag
zeigt nicht, dass er falsch aufgelöst wird.**

`[cmd]` Behoben (eine Zeile) und mit fünf Tests abgesichert, die jede
Route der Seitenleiste gegen sich selbst prüfen. Zum Fehlschlagen
gebracht: ohne die Zeile schlägt der Settings-Test an.

### 2. Die Referenzwerte haben ein Einheitenproblem

**Nicht aus diesem Auftrag, aber hier aufgefallen.** `[cmd]` Im Beleg
oben steht:

```
 CA | 800 | UL | 32000.0 %
```

`[cmd]` Grund: Der Calcium-`UL` ist als **2,5 g/day** hinterlegt, der
Nährstoff und die Tagessumme führen **mg**. Die Funktion teilt 800 durch
2,5, ohne umzurechnen.

`[cmd]` Der Abgleich über alle 72 Referenzzeilen mit Wert:

| Referenzeinheit | Nährstoffeinheit | Zeilen |
|---|---|---:|
| `mg/day` | `mg` | 23 |
| `ug/day` | `µg` | 11 |
| **`mg/day`** | **`µg`** | **9** |
| **`mg/kg bw/day`** | **`g`** | **9** |
| **`g/day`** | **`mg`** | **4** |
| **`E%`** | **`g`** | **4** |
| `ug RE/day` | `µg` | 3 |
| **`L/day`** | **`g`** | **2** |
| `g/day` | `g` | 2 |
| übrige (`mg/MJ`, `mg NE/MJ`, `ug DFE/day`, `g/kg bw/day`, `mg/day`↔`g`) | | 5 |

`[cmd]` **Nur 25 von 72 Zeilen haben passende Einheiten** (23 mg/mg
plus 2 g/g). Die übrigen mischen Grössenordnungen oder benutzen eine
ganz andere Bezugsgrösse (`E%` = Energieprozent, `mg/kg bw/day` = je
Kilogramm Körpergewicht, `mg/MJ` = je Megajoule).

`[read]` Für C-48 heisst das: **ein Teil der Prozentwerte ist falsch**,
und zwar nicht zufällig, sondern um Faktor 1.000 oder mehr. Die
Regeln 1 bis 4 aus C-48 halten trotzdem — sie betreffen, *ob* ein
Prozentwert gezeigt wird, nicht *welcher*.

`[annahme]` Das gehört in einen eigenen Auftrag: entweder rechnet
`daily_reference_assessment` die Einheiten um, oder
`nutrient_reference_values` speichert normalisiert. `mg/kg bw/day` und
`E%` brauchen zusätzlich Körpergewicht bzw. Tagesenergie — beides liegt
nach GO-01 vor.

---

## Was noch fehlt, bis die Ringe rechnen

Die Kette GO-01 bis GO-05 aus meiner Sicht, nachdem das erste Glied
steht.

| | Schritt | Zustand |
|---|---|---|
| **GO-01** | Profilpflege | **fertig** |
| **GO-02** | Entscheidung: Makro-Regel | offen — **Entscheidung für Tom** |
| **GO-03** | `nutrition_targets` | offen |
| **GO-04** | TDEE-Berechnung | offen |
| **GO-05** | Ringe anschliessen | offen |

### Was der Plan übersieht

**GO-02 ist nicht eine Entscheidung, sondern drei.** Der Plan
beschreibt sie als „welche Formel, welcher Punkt im Bereich, welche
kcal-Faktoren". Nach dem Bauen von GO-01 sehe ich eine vierte, die
vorher fällt:

**Welches Ziel bestimmt die Phase?** `[cmd]` `nutrition_goal` kennt
sechs Werte (`lose_weight`, `maintain`, `gain_muscle`,
`recomposition`, `performance`, `health`), die Phasenmodelle der Spec
neun (`fat_loss`, `lean_bulk`, …). Ohne eine Abbildung weiss GO-04
nicht, ob es ein Defizit oder einen Überschuss rechnen soll — und
`performance` und `health` haben in `PHASE_MODELS.md` **gar keine
Entsprechung**.

Das ist W-3 aus dem Plan, aber der Plan ordnet die Auflösung GO-06 zu
(Block B). **Für die Ringe wird sie schon in Block A gebraucht.**
`[annahme]` Entweder GO-06 rückt vor, oder GO-02 entscheidet eine
kleine Abbildung für die sechs vorhandenen Werte und lässt die neun
Phasen für später.

### Was ich anders einschätze als beim Schreiben des Plans

**GO-04 ist kleiner als gedacht.** Die reine Funktion ist zwei Formeln
und eine Multiplikation; `[cmd]` alle fünf Eingaben liegen nach GO-01
vor, und `activity_level` passt wertgleich auf `ACTIVITY_MULTIPLIER`.
Der Aufwand steckt in GO-02, nicht in GO-04.

**GO-03 ist grösser als gedacht.** Die Tabelle braucht ein
Gültigkeitsdatum, sonst lässt sich später nicht sagen, gegen welches
Ziel ein vergangener Tag lief — dieselbe Frage, die `meal_items` mit
eingefrorenen Werten löst. Vier Spalten reichen nicht.

**Ein Zwischenschritt fehlt ganz.** Zwischen GO-04 und GO-05 muss
jemand entscheiden, **was passiert, wenn das Profil unvollständig
ist**. Heute zeigt das Tagebuch „keine Ziele". Mit halbem Profil müsste
es sagen, *was* fehlt — und dorthin verweisen, wo man es einträgt.
`[annahme]` Das ist ein halber Tag Arbeit und gehört als GO-04b in den
Plan, nicht in GO-05.

### Was diese Seite nicht tut

- **Keine TDEE-Berechnung, keine Zielwerte.** Die Seite erfasst.
- **Kein Onboarding-Fluss.** `[read]` GO-12 steht bewusst spät: sieben
  Schritte zu bauen, bevor ein einziger Wert gebraucht wird, ist die
  falsche Reihenfolge.
- **Keine Historie.** Eine Zeile je Nutzerin, kein Gewichtsverlauf. Der
  gehört zu GO-10 — und die adaptive TDEE (GO-13) braucht ihn.
