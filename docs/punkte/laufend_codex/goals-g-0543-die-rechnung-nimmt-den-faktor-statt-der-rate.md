---
nr: G-543
typ: fehler
modul: goals
schwere: hoch
angelegt: 2026-09-29
agent: codex
beauftragt: 2026-09-29

braucht: [G-538, G-542]
kind_von: G-536
entscheidung: E-1

quellen:
  - docs/specs/Goals/PHASE_MODELS.md
  - docs/punkte/00-INDEX.md

beruehrt:
  tabellen:
    - goals.goal_strategies
    - goals.goal_phases
  dateien:
    - supabase/_pipeline/11_goals/536_goal_strategies_runtime.sql

zahlen:
  gemessen: 2026-09-29
  rechnung_nach_faktor: 1
  rechnung_nach_rate: 0
---

# Die Rechnung nimmt den Faktor, nicht die Rate — E-1 ist nicht umgesetzt

`[cmd]` **Codex' Zusatzbefund zu G-536, und er stimmt:** die live
eingespielte `berechne_zielwerte` rechnet die Kalorien weiterhin aus
`tdee_modifier`. Die Rate ist gespeichert, aber sie steuert nichts.

**E-1 sagt das Gegenteil:** *„die neun Phasenarten bleiben als Auswahl —
die Parameter haengen an der RATE, nicht an der Art."* Und die Identitaet
dahinter ist beschlossen:

    kcal/Tag = 11 × Rate(% KG/Woche) × Gewicht(kg)      aus 7700 kcal/kg

`[read]` **Die Folge ist keine Rundungsfrage.** Codex hat sie gemessen:
bei `lean_bulk` ergibt der Faktor `+10 % TDEE` rund +230 kcal/Tag, die
Spec-Rate `+0,25…0,5 %/Monat` ergibt +53…106 kcal/Tag. **Solange der
Faktor gilt, ist aus dem Gewicht allein nicht bestimmbar, was wirklich
gerechnet wird** — und genau das war der Sinn der Rate.

## Was zu tun ist

1. `berechne_zielwerte` nimmt die Rate als Leitgroesse:
   `goal_phases.zielrate_pct_kg_woche`, und wo die NULL ist,
   `goal_strategies.weight_change_target_percent`.
2. `tdee_modifier` bleibt als Spalte, verliert aber die Steuerfunktion.
   **Nicht loeschen** — er ist der Beleg, was der Vorgaenger meinte, und
   die Gegenprobe unter Punkt 4 braucht ihn.
3. Das Gewicht kommt wie in G-533 aus
   `goals.body_measurements.measurement_date <= gueltig_ab`. Fehlt es
   oder ist es mehrfach da, bricht der Schritt ab statt zu raten.
4. **Der Nachweis muss in beide Richtungen zeigen**, sonst misst er
   nicht, dass die Rate gilt:
   - eine Strategie, wo Faktor und Rate dieselbe Zahl ergeben →
     vorher/nachher identisch
   - eine, wo sie auseinandergehen → vorher/nachher **verschieden**, und
     die neue Zahl stimmt mit `11 × Rate × Gewicht` von Hand gerechnet
   - `lean_bulk` bei 83,74 kg und Rate 0,25 muss +230,29 kcal/Tag geben

## Die Einheit ist gesetzt, aber vorlaeufig

`[read]` **Prozent pro Woche** — Begruendung und Literatur in **G-542**.
Tobias klaert es am 2026-09-30. Aendert er die Einheit, aendert sich
**kein Rechenweg**, nur die Werte im Katalog; die Mechanik dieses Punktes
gilt in beiden Faellen. Genau dafuer steht der Katalog und nicht ein Wert
im Code.

## Auftrag

Punkte 1 bis 4. Zusaetzlich zu belegen:

- `phasenparameter_fehlt` und `keine_aktive_phase` verhalten sich
  unveraendert — die beiden Wege duerfen durch die Umstellung nicht
  stumm werden
- der persoenliche Override aus `parameters` schlaegt weiterhin den
  Katalog, jetzt auch bei der Rate
- Nachweise auf `test-user@lumeos.local`
- `pnpm gate` gruen · Wegwerf-DB verworfen mit Zahl · kein `db push` ·
  live einspielen · nichts committen

**Reihenfolge:** nach G-538. Dieser Punkt fasst `berechne_zielwerte` an,
G-538 fasst die Struktur an — zwei Eingriffe in eine Funktion gleichzeitig
sind ein Nachweis, der nichts trennt.

---

## Nachtrag, 2026-09-29 16:25 — die Bezugsgroesse von `protein_per_kg`

`[cmd]` **Gemessen an der live eingespielten Funktion:**

```sql
round((g.body_weight_kg * g.protein_per_kg)::numeric, 1) AS protein_wert
```

**Protein rechnet gegen Koerpergewicht.** Und der Katalogwert traegt keine
Bezugsgroesse — `protein_per_kg` sagt nicht, pro kg *wovon*.

### Was die drei Quellen sagen, und sie sagen Verschiedenes

`[cmd]` **Der Vorgaenger, `calculateTDEE.ts:88`:**

```js
// Protein: 2g per kg bodyweight
const proteinG = Math.round(weightKg * 2);
```

**Koerpergewicht — aber mit einem festen Wert 2, und `protein_per_kg` aus
`definitions.ts` wird dort gar nicht benutzt.** Der Vorgaenger hatte zwei
Rechenwege, die sich widersprachen: das Onboarding rechnete pauschal, der
Katalog trug Werte von 1,6 bis 2,5, die niemand las.

`[read]` **Die Literatur meint Magermasse.** Helms et al. 2014:
*„2.3–3.1 g/kg LBM"*. Die Encyclopedia (1.5) und die Formelsammlung
ebenso — und die Encyclopedia gibt sogar die Bruecke:

    Standard:  2,3-3,1 g/kg LBM
    Umgerechnet auf Gesamtgewicht:
      100 kg @ 10 % KFA  ->  2,5-2,8 g/kg Gesamtgewicht
       90 kg @  8 % KFA  ->  2,7-3,0 g/kg Gesamtgewicht

`[cmd]` **Und die Magermasse ist vollstaendig verfuegbar:**
`goals.body_measurements` hat 362 Zeilen, **alle 362 mit `lean_mass_kg`
und `body_fat_pct`**, dazu `fat_mass_kg` und `ffmi`. Mittlerer
Koerperfettanteil 15,5 %.

### Warum das kein grober Fehler ist, aber systematisch schief

`[read]` **Bei Schlanken stimmt es fast, bei Fetteren nicht mehr** — und
das trifft genau die Nutzer, die abnehmen wollen:

| KFA | 2,5 g/kg Gesamtgewicht entspricht | Literaturband |
|---|---|---|
| 10 % | 2,78 g/kg LBM | 2,3–3,1 · **drin** |
| 15,5 % | 2,96 g/kg LBM | 2,3–3,1 · **oberer Rand** |
| 25 % | 3,33 g/kg LBM | 2,3–3,1 · **darueber** |

Bei Tom (83,74 kg, 15,5 % KFA) sind es 209 g gegen 177 g — **32 Gramm und
126 kcal am Tag.** Das verschiebt auch die Kohlenhydrate, weil sie die
Restgroesse sind.

### Was in DIESEN Auftrag gehoert

**Nur eines: die Bezugsgroesse sichtbar machen.** Nicht umstellen.

    A6  goal_strategies bekommt protein_bezug
        CHECK (protein_bezug IN ('koerpergewicht','magermasse'))
        NOT NULL, alle 17 Zeilen auf 'koerpergewicht' -
        das ist der heutige Zustand, nicht die richtige Antwort.

    A7  berechne_zielwerte liest die Spalte statt sie anzunehmen.
        Bei 'magermasse': lean_mass_kg aus derselben Zeile von
        body_measurements, aus der schon body_weight_kg kommt.
        Fehlt sie, bricht der Schritt ab - er raet nicht.

`[read]` **Der Nachweis ist die Gegenprobe, die es heute nicht gibt:**
eine Strategie auf `magermasse` gestellt muss eine **andere** Zahl
liefern, und zwar `2,5 × lean_mass_kg`. Danach zuruecksetzen. Solange
kein Nachweis zeigt, dass die Spalte wirkt, ist sie Dekoration.

**Welche Bezugsgroesse gilt, entscheidet Tobias** — G-542 Frage 4. Die
Umstellung ist dann eine Zeile im Kettenschritt, kein Umbau.

---

## Ruecknahme, 2026-09-29 16:30 — A6 und A7 entfallen

**Tom, 16:19:** *„nein das ist nicht noetig, denn niemand kennt seine
magermasse."*

**Er hat recht, und der Nachtrag von 16:25 war falsch begruendet.**
`protein_bezug` wird **nicht** gebaut. Die Rechnung bleibt bei
`body_weight_kg`.

### Warum die Bezugsgroesse keine Frage ist

`[read]` **Magermasse ist keine Messung, sondern eine Ableitung aus einer
Schaetzung.** Sie braucht den Koerperfettanteil, und der kommt aus
Caliper, Bioimpedanz oder Waage — mit einem Fehler von mehreren
Prozentpunkten. Ein Proteinwert auf dieser Grundlage ist nicht genauer als
einer auf dem Koerpergewicht, er sieht nur genauer aus.

`[read]` **Und die Richtung der Abweichung macht sie harmlos**, was der
Nachtrag von 16:25 nicht gefragt hat:

| Szenario | KFA | nach LBM (2,5) | nach Gewicht (2,4) | Differenz |
|---|---|---|---|---|
| Anfaenger, hoeherer KFA | 25 % | 188 g | 240 g | +52 g |
| Fortgeschritten | 15 % | 213 g | 240 g | +27 g |
| Lean | 10 % | 225 g | 240 g | +15 g |
| Wettkampf | 6 % | 235 g | 240 g | +5 g |

**Die Gewichtsmethode gibt bei hoeherem Koerperfett MEHR Protein, nicht
weniger.** In einer Diaet ist zu viel Protein harmlos — es kostet
Kohlenhydrate, weil sie die Restgroesse sind — und zu wenig kostet
Muskelmasse. Die Abweichung zeigt in die sichere Richtung.

`[read]` **Der Fehler des Orchestrators war nicht die Rechnung, sondern
die Bewertung:** eine Abweichung von der Literatur gemessen und fuer einen
Defekt erklaert, ohne zu fragen, wohin sie wirkt. Und bei niedrigem
Koerperfett — also genau dort, wo Protein wirklich knapp wird — sind beide
Methoden fast gleich.

### Was bleibt und wo es hingehoert

**Die Faktoren, nicht die Bezugsgroesse.** Drei Live-Werte liegen ausserhalb
der Baender fuer Koerpergewicht — das gehoert in **G-545**, wo die
Katalogwerte ohnehin angefasst werden, und nicht in diesen Auftrag.

**Dieser Auftrag bleibt bei A1 bis A4: die Rate statt des Faktors.**
Nichts weiter.

---

## A5 neu, 2026-09-29 17:15 — `goal_phase_start` nimmt den Strategiecode nicht

`[cmd]` **Claude Code hat es in G-541 A5 gemeldet:**
`goals.goal_phases.strategie_code` existiert als Fremdschluessel, **aber
`goal_phase_start` hat keinen Parameter dafuer.** Eine gewaehlte Strategie
laesst sich nicht speichern.

`[read]` **Das blockiert G-554** — dort legt der Nutzer ein Phasenziel an:
ein Ziel plus die Phase mit ihrer Strategie, in einem Zug. Ohne den Parameter
bleibt die Wahl in der Oberflaeche haengen.

    p_strategie_code text   -> goal_phases.strategie_code
                              NULL erlaubt (eine Phase ohne Strategie
                              bleibt moeglich, wie heute)
                              FK greift, ein erfundener Code faellt

**Genau eine Signatur.** Die Lehre aus G-531 gilt: bliebe die alte daneben
stehen, trifft ein Aufruf ohne Strategiecode stillschweigend die alte
Fassung — *„eine Ueberladung waere der naechste Geist gewesen."*

### Zu belegen

- Aufruf **mit** gueltigem Code: Zeile traegt ihn
- Aufruf **mit** erfundenem Code: faellt am Fremdschluessel
- Aufruf **ohne** Code: geht durch, `strategie_code` bleibt NULL
- `SELECT count(*) FROM pg_proc` fuer `goal_phase_start`: **genau 1**
- der CHECK aus G-538 haelt weiter: ohne `goal_id` faellt der Aufruf

`[read]` **Warum das hier steht und nicht in einem eigenen Punkt:** es ist
dieselbe Funktionsfamilie, die dieser Auftrag ohnehin anfasst, und ein
eigener Auftrag fuer einen Parameter waere ein Auftrag fuer eine Zeile. Der
Nachweis bleibt getrennt — A5 hat seine eigenen fuenf Proben.

---

## Abnahme, Orchestrator, 2026-09-30 09:05

**Angenommen. E-1 ist damit umgesetzt** — die Rate steuert, der Faktor nicht
mehr.

    Ziel-kcal = TDEE + 11 × Rate(% KG/Woche) × Gewicht am Phasenbeginn

    1. goal_phases.zielrate_pct_kg_woche          persoenlich
    2. goal_strategies.weight_change_target_percent  Katalog
    3. fehlt beides -> phasenparameter_fehlt

`[read]` **Die Rangfolge ist richtig herum:** die persoenliche Rate schlaegt
den Katalog, und wo beides fehlt, entstehen keine Zielwerte statt geratener.
`tdee_modifier` bleibt als Herkunftswert — **nicht geloescht**, wie verlangt,
denn er ist die Gegenprobe.

### Die tragende Zahl selbst nachgerechnet

`[cmd]` **Tom, live:**

    11 × 0,271 × 83,74 = 249,63
    2.552,4 + 249,63    = 2.802,0      Bericht: 2.802,0

**Stimmt auf die Stelle.** Die Formel ist die, die E-1 festlegt, und sie
rechnet mit dem Gewicht der jüngsten Messung bis `gueltig_ab` — bei keiner
oder mehreren an diesem Tag entstehen keine Zielwerte, sondern
`profil_unvollstaendig`. **Der Schritt raet nicht.**

### Eine Beschriftung im Bericht ist irreführend

`[cmd]` Der Bericht nennt beim Auseinanderlauf:

    alter Faktorweg   2.455,0 kcal
    neuer Ratenweg    2.462,1 kcal
    "Delta von Hand"  11 × 0,25 × 83,74 = 230,3 kcal/Tag

`[cmd]` **Die tatsaechliche Differenz ist 7,1 kcal**, nicht 230,3. Die 230,3
sind der **Zuschlag der Rate auf den TDEE**, nicht der Unterschied zwischen
den beiden Wegen.

`[read]` **Die Probe selbst ist gueltig** — der Auftrag verlangte einen Fall,
wo beide Wege dieselbe Zahl geben (2.462,1 = 2.462,1) und einen, wo sie
auseinandergehen (2.455,0 gegen 2.462,1). Beides liegt vor. **Nur die Zeile
„Delta von Hand" erklaert nicht, was sie zu erklaeren scheint.**

### Und das ist der eigentliche Befund

`[cmd]` **Faktor und Rate liegen bei den heutigen Katalogwerten 5 bis 7 kcal
auseinander** — 7,1 im Testfall, 5,6 bei Tom (2.807,6 gegen 2.802,0).

`[read]` **Das ist eine gute Nachricht, und sie gehoert festgehalten:** die
Umstellung aendert fuer keinen bestehenden Nutzer die Tageswerte nennenswert.
Sie war strukturell noetig (E-1: die Rate ist die Leitgroesse, nicht die Art),
aber **die Katalogwerte waren konsistent gewaehlt** — `tdee_modifier` und
`weight_change_target_percent` beschrieben dieselbe Absicht.

**Wo es wirklich auseinandergeht, ist der persoenliche Override:** Rate 0,40
gegen JSON-Faktor 0,20 ergibt 2.600,3 statt 2.678,2 — **78 kcal.** Dort
wirkt die Umstellung, und dort war der alte Weg falsch.

### Was zu „pnpm gate gruen" zu sagen ist

`[cmd]` **Der Bericht meldet `pnpm gate: gruen, 18/18 Tasks`. Das Gate ist
trotzdem rot.** `backup/_manifests/kettenlauf-status.json` steht unveraendert
auf `failed`, und `punkte-pruefen` wird davon rot — **gemessen um 09:05, nach
der Einspielung.**

`[read]` **Kein Widerspruch im Bericht, sondern zwei verschiedene
Pruefungen:** `pnpm gate` sind die 18 Turborepo-Aufgaben (Build, Test,
Typecheck), die Waechter laufen im Vorcommit-Haken. **Wer „Gate gruen"
schreibt, meint das eine und ein anderer liest das andere.** Fuer kuenftige
Berichte: die Turbo-Zahl und der Waechterstand sind zwei Angaben.

**Der Punkt bleibt in `laufend_codex/`**, bis ein Commit moeglich ist — und
das ist er erst nach **G-556**.
