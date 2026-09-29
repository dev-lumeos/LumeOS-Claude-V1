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
