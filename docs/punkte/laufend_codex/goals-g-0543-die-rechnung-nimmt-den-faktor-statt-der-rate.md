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
