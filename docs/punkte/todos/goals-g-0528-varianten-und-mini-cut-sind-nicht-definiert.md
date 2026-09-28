---
nr: G-528
typ: befund
modul: goals
schwere: mittel
angelegt: 2026-09-28

quellen:
  - docs/specs/Goals/PHASE_MODELS.md
  - docs/specs/Goals/DATABASE.md
  - supabase/_pipeline/11_goals/111_goals_ziele_phasen.sql:99
  - supabase/_pipeline/_testdaten/testdaten-einspielen.ts:1145

braucht: [G-521]

beruehrt:
  tabellen:
    - goals.goal_phases
  dateien:
    - docs/specs/Goals/PHASE_MODELS.md
    - supabase/_pipeline/_testdaten/testdaten-einspielen.ts

zahlen:
  gemessen: 2026-09-28
  phasenarten: 9
  mit_parametersatz: 7
  mit_benannten_varianten: 1
  variant_werte_live: 3
  davon_aus_testdaten: 3
  check_auf_variant: 0
  default_auf_variant: 0
---

# G-528 - die Variantenachse und mini_cut sind nicht definiert

## Warum dieser Punkt existiert

Tom, 2026-09-28: *,,zeig mir alle werte fuer alle varianten in einer
auflistung, dann leiten wir daraus ab was es sein koennte und machen
einen hinweis (todo fuer spaeter dass das noch klar zu definieren
ist)."*

`[read]` **Dieser Punkt ist der Hinweis.** Er haelt die vollstaendige
Auflistung fest, damit die Ableitung nicht jedes Mal neu gemacht
werden muss, und er bleibt offen, bis die Definition steht.

---

## Die vollstaendige Auflistung

`[cmd]` **Alles aus `docs/specs/Goals/PHASE_MODELS.md`, gemessen am
2026-09-28. Fuenf Phasen haben GENAU EINEN Parametersatz, eine hat
zwei benannte, zwei haben keinen.**

### fat_loss / moderate — der einzige Ort mit einer benannten Variante

    calorie_deficit       -400 bis -600
    rate_of_loss          0.5 bis 0.75 % KG/Woche
    protein_g_per_kg      1.8 bis 2.4
    fat_min_g_per_kg      0.5
    max_duration_weeks    20
    diet_break            alle 8 Wochen, 1 Woche lang

### fat_loss / aggressive

    calorie_deficit       -750 bis -1000
    rate_of_loss          1.0 bis 1.5 % KG/Woche
    protein_g_per_kg      2.3 bis 3.1
    fat_min_g_per_kg      (fehlt)
    max_duration_weeks    8
    diet_break            alle 4 Wochen, 1 Woche lang

    Waechter beider Varianten:
      strength_loss > 10 %     -> reduce_deficit
      weekly_loss > 1.0 kg     -> +150 kcal
      duration > max_duration  -> force_transition
    transitions_to: reverse_diet, maintenance, lean_bulk

### lean_bulk — keine Variante

    calorie_surplus       +200 bis +400
    rate_of_gain          0.25 bis 0.5 % KG/Monat
    protein_g_per_kg      1.6 bis 2.2
    fat_pct_calories      25 bis 35
    max_duration_weeks    52
    Waechter:
      bf_increase > 2 % in 4 Wochen   -> -100 kcal
      weight_gain > 1 kg/Woche        -> Ueberschuss zu hoch
      kein Kraftfortschritt 3 Wochen  -> Training pruefen
    transitions_to: mini_cut, maintenance, contest_prep

### maintenance — keine Variante

    calorie_target        TDEE +/- 100
    protein_g_per_kg      1.4 bis 2.0
    duration              unbegrenzt
    transitions_to: fat_loss, lean_bulk, recomp, contest_prep

### reverse_diet — keine Variante

    weekly_calorie_increase   +50 bis +150
    primary_macro_increase    Kohlenhydrate
    protein                   halten
    max_duration_weeks        16
    Ausstieg:
      geschaetzter TDEE erreicht
      Zunahme > 0.5 kg/Woche
      Nutzer zufrieden
    Waechter:
      Zunahme > 0.5 kg/Woche  -> langsamer steigern
      Hunger normalisiert     -> nahe am TDEE
    transitions_to: maintenance, lean_bulk, fat_loss

### contest_prep — keine Variante, aber vier Unterphasen

    total_duration_weeks   16 bis 24
    protein_g_per_kg       2.3 bis 3.1
    Unterphasen:
      early      Woche 24-16   Defizit -300   Cardio niedrig
      mid        Woche 16-8    Defizit -600   Cardio mittel
      late       Woche 8-2     Defizit -750   Cardio hoch
      peak_week  1 Woche       special
    refeeds:
      ab Woche 8, 1 bis 2 mal pro Woche, High Carb
    peak_week (eigener Block):
      carb_depletion_days   3
      carb_load_days        2
      sodium_manipulation   ja
    Waechter:
      BF% < 5 (M) / < 10 (W)  -> Gesundheitswarnung
      strength_loss > 20 %    -> reduce_deficit
      hormonelle Symptome     -> medizinische Pruefung
    transitions_to: reverse_diet

### recomp — keine Variante, aber zwei Tagesarten

    Trainingstag      TDEE +200
    Ruhetag           TDEE -300
    Wochenmittel      etwa Maintenance
    protein_g_per_kg  2.0 bis 2.4
    transitions_to: lean_bulk, fat_loss

### expert_bb_annual — keine Variante, zwoelf Monate

    Monat 1-4     lean_bulk        Masseaufbau
    Monat 5-6     maintenance      Uebergang
    Monat 7-10    contest_prep     Diaet
    Monat 11      peak_week + Show Wettkampf
    Monat 12      reverse_diet     Erholung
    auto_transitions  ja
    coach_override    ja
    Voraussetzung     experience_level >= advanced

### peak_week — Parameter ja, Kalorien nein

    carb_depletion_days   3
    carb_load_days        2
    sodium_manipulation   ja
    (keine Kalorienvorgabe, keine Proteinvorgabe eigen)

### mini_cut — NICHTS

`[cmd]` **Kein Parametersatz in keiner Quelle.** `mini_cut` kommt
zweimal vor: im Diagramm unter `LEAN_BULK` mit dem Zusatz `(opt.)`,
und in `transitions_to` von lean_bulk. **Das Mockup hat dieselbe
Luecke** (G-515, W2).

---

## Was live steht

`[cmd]` **Drei Variantenwerte, alle drei aus den Testdaten**
(`testdaten-einspielen.ts:1145` und folgende):

    lean_bulk    / moderate                  2 Zeilen
    maintenance  / baseline                  2 Zeilen
    maintenance  / performance_placeholder    1 Zeile

`[cmd]` **`variant` hat live keinen CHECK und keinen Default und ist
nullable.** `DATABASE.md` schreibt `variant TEXT DEFAULT 'moderate'` —
der Default ist nie gebaut worden,
`111_goals_ziele_phasen.sql:99` schreibt `variant TEXT,`.

`[read]` **Damit ist keine Nutzerzeile betroffen.** Eine
Normalisierung aendert Testdaten, keine gewachsenen Daten. Das ist
der Unterschied zwischen einer Aufraeumung und einer Migration.

---

## Die Ableitung — als Annahme, nicht als Regel

`[annahme]` **`variant` ist keine eigene Achse, sondern der Name
eines Parametersatzes.** Der Beleg dafuer steht in der Auflistung
oben: was `moderate` von `aggressive` unterscheidet, ist
**ausschliesslich quantitativ** — Defizit, Rate, Protein, Dauer,
Pausentakt. Fuenf Zahlen, kein eigenes Verhalten. Ein Nutzer, der
,,0.9 % KG/Woche" waehlt, liegt zwischen beiden Namen; die Zahl
traegt, der Name beschreibt.

`[annahme]` **`mini_cut` waere demnach ein kurzer, harter Schnitt
nach einem Aufbau.** Was sich aus der Spec selbst ableiten laesst:

    Ausloeser    lean_bulk-Waechter: bf_increase > 2 % in 4 Wochen
                 (dort ist -100 kcal die weiche Antwort; mini_cut
                 waere die harte)
    Defizit      wie fat_loss/aggressive: -750 bis -1000
    Protein      oberes Ende, 2.3 bis 3.1 - es geht darum, die
                 aufgebaute Masse zu halten
    Dauer        kuerzer als der Pausentakt von aggressive, also
                 hoechstens 4 Wochen. Sonst braeuchte er eine
                 diet_break und waere kein Mini-Cut mehr
    danach       zurueck zu lean_bulk oder maintenance, NICHT
                 reverse_diet - vier Wochen unterdruecken nichts,
                 was hochgefahren werden muesste

`[read]` **Jede dieser fuenf Zeilen ist abgeleitet, keine ist
belegt.** Sie stehen hier als Ausgangspunkt fuer G-521, nicht als
Vorgabe. **Aus einer Annahme wird keine Regel** — dafuer braucht es
`[cmd]`.

---

## Die Empfehlung

`[read]` **Den variant-CHECK jetzt NICHT bauen.** Codex' Vorschlag
(Varianten nur bei `fat_loss`, sonst NULL) friert eine Luecke ein:
**wenn `mini_cut` definiert wird, bekommt er mit hoher
Wahrscheinlichkeit selbst Stufen** — ein Schnitt ist genau die Sache,
die moderat oder hart sein kann. Der CHECK muesste dann wieder
geoeffnet werden, und jedes Oeffnen kostet eine Migration.

**Stattdessen, in dieser Reihenfolge:**

1. Die drei Testdatenwerte aufraeumen — `baseline` und
   `performance_placeholder` sind keine Varianten, sondern Notizen;
   sie gehoeren nach `parameters`, wo sie schon als `reason` und
   `note` stehen. `lean_bulk/moderate` wird NULL, solange lean_bulk
   keine Stufen hat.
2. G-521 entscheiden lassen, ob die Rate die fuehrende Groesse ist.
3. Danach den CHECK — oder die Begruendung, warum das Feld frei
   bleibt.

## Nachweiszeilen

**A1** — die drei Testdatenwerte aufgeraeumt, mit Vor- und
Nachzaehlung der betroffenen Zeilen.

**A2** — **kein CHECK vor G-521.** Wer ihn vorher baut, begruendet
schriftlich, warum die Luecke bei `mini_cut` keine Rolle spielt.

**A3** — `mini_cut` bekommt einen Parametersatz oder wird aus dem
CHECK entfernt. **Eine Phasenart, die niemand parametrisieren kann,
ist in der Auswahl eine Falle** — der Nutzer waehlt sie und bekommt
`phasenparameter_fehlt`.

**A4** — die Ableitung oben gegen das Ergebnis von G-521 halten, Zeile
fuer Zeile. Was sich bestaetigt, wird `[cmd]`; was nicht, wird
gestrichen und nicht umgeschrieben.

## Nachtrag aus G-521, 2026-09-28 — der beschlossene Satz

`[cmd]` **Die Ableitung oben ist gepruefte.** Was sich bestaetigt
hat, was sich geaendert hat:

### mini_cut — bestaetigt, ein Wert korrigiert

    Rate            1.0 bis 1.25 % KG/Woche  (war 1.0 bis 1.5)
    Protein         oberes Band, je kg LBM   (bestaetigt)
    Fett            0.5 g/kg Untergrenze     (bestaetigt)
    Dauer           3 bis 6 Wochen           (bestaetigt)
    Diaetpause      keine                    (bestaetigt)
    danach          Erhalt 1 bis 2 Wochen oder leichter
                    Ueberschuss, NICHT reverse_diet

`[read]` **Unsere Begruendung wurde ausdruecklich gestuetzt:** Peos
et al. 2019 zeigt Vorteile von Diaetpausen erst ab etwa 8 bis 12
Wochen Defizitdauer. **Befund C traegt** — ein mini_cut aus dem
Ueberschuss braucht keine Pause.

`[read]` **Das Defizitband -800 bis -1200 entfaellt nicht, weil es
falsch war**, sondern weil kcal nach E1 nicht mehr das
Gespeicherte sind (G-529).

### Die Variantenachse — aufgeloest

`[cmd]` **Kein CHECK, kein Default, kein Speicher.** `variant`
wird zur Anzeige aus der Rate. Dauer und Pausentakt haengen an der
Rate, nicht an einem Namen — die Begruendung steht in G-529.

**A1 gilt unveraendert:** die drei Testdatenwerte aufraeumen.
`baseline` und `performance_placeholder` sind Notizen und stehen
in `parameters` schon als `reason` und `note`.

**A2 ist erledigt** — kein CHECK, und die Begruendung ist
schriftlich.

**A3 ist beantwortet:** `mini_cut` bekommt Parameter, bleibt also
im CHECK.

### Was NICHT belegt ist

`[read]` **Die Fundstellen fehlen.** Der Recherchebericht nennt
nirgends Seite oder Abschnitt. **Jede Zahl hier ist
`[wahrscheinlich]`, keine ist `[cmd]`**, bis sie ihre Fundstelle
hat (G-521 A1).

`[read]` **recomp behaelt seine Baender als Produktentscheidung**
(E3). Die Literatur kennt keine; Barakat et al. 2020 beschreibt es
als Phaenomen. +200 auf Trainingstagen und -300 an Ruhetagen sind
unsere Zahlen, und das steht so da.

## Warum dieser Punkt kein Entscheidungspunkt mehr ist

`[cmd]` **`sammelfragen-pruefen` hat ihn am 2026-09-28 rot
gemeldet:** `typ: entscheidung` mit sieben Abschnitten. Der
Waechter hat recht, und zwar doppelt — der Titel nennt ZWEI
Fragen, die Variantenachse und `mini_cut`.

`[read]` **Beide sind beantwortet.** Die Variantenachse loest sich
in die Rate auf (E1, G-529), `mini_cut` hat einen Parametersatz
(Toms Werte, von der Recherche bestaetigt bis auf den Ratendeckel).
**Was bleibt, ist A1: die drei Testdatenwerte aufraeumen** — eine
Aufgabe, keine Frage.

`[read]` **Der Typ wechselt deshalb auf `befund`, nicht weil der
Waechter rot war.** Die Probe dafuer: wuerde ich es auch ohne den
Waechter aendern? Ja — ein Entscheidungspunkt, dessen Entscheidung
getroffen ist, verfaelscht die Liste der offenen Entscheidungen.

`[read]` **Was dieser Punkt jetzt ist:** die vollstaendige
Auflistung aller Parameter je Phase, an einer Stelle, damit die
Ableitung nicht jedes Mal neu entsteht. Genau das, wofuer Tom ihn
angelegt hat.
