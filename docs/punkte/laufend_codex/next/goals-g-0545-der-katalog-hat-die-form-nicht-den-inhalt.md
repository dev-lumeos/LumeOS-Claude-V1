---
nr: G-545
typ: fehler
modul: goals
schwere: hoch
angelegt: 2026-09-29

braucht: [G-536]
kind_von: G-541

quellen:
  - docs/specs/Goals/PHASE_MODELS.md
  - docs/punkte/00-INDEX.md

beruehrt:
  tabellen:
    - goals.goal_strategies
  dateien:
    - supabase/_pipeline/11_goals/536_goal_strategies_seed.sql

zahlen:
  gemessen: 2026-09-29
  spalten: 10
  spalten_in_einer_zeile_gefuellt: 6
  zeilen_gesamt: 17
---

# Der Katalog hat die Form, nicht den Inhalt

`[cmd]` **Claude Code hat in G-541 gezaehlt, wie viele der 17 Zeilen einen
Wert tragen — nicht, ob die Spalte existiert:**

    editor_modes  17     guards         7     purpose    1
    protein       16     sub_phases     1     exits      1
    max_duration   9     best_for       1     success    1
                                             annual     1

**Sechs von zehn Spalten sind in genau einer Zeile gefuellt.**

`[read]` **Die Abnahme zu G-536 hat das gleichgesetzt** — *„die zehn
Elemente tragen jetzt eine Spalte"* — und das war der Fehler des
Orchestrators: eine Spalte zu haben ist nicht dasselbe wie einen Wert zu
haben. Die Oberflaeche zeigt darum bei sechzehn von siebzehn Strategien
einen Strich, wo eine Aussage stehen muesste.

## Die Quellen, die Tom am 2026-09-29 dazugegeben hat

Drei Dokumente, alle drei **Sekundaerliteratur** — sie zitieren
Primaerquellen (Helms et al. 2014/2015, Pasiakos et al. 2013, Roberts et
al. 2020, Chappell et al. 2018), sind aber selbst keine. `[read]` **Das
entscheidet, wie sie zu behandeln sind:** wo sie sich untereinander und
mit `PHASE_MODELS.md` decken, ist der Wert belastbar; wo eine allein
steht, wird sie als solche gekennzeichnet.

    A  Professional Bodybuilding Encyclopedia - Contest Prep Protocol
    B  Formelsammlung BMR/TDEE/Phasen
    C  Contest Prep - das wissenschaftliche Framework

**Alle drei liegen als Anhang am Gespraech vom 2026-09-29, 16:02.** Sie
sind nicht im Repo — wer sie braucht, bekommt sie von Tom. Kein Wert
aus dem Gedaechtnis.

## Was die Einheitenfrage betrifft: G-542 Frage 1 ist geklaert

`[cmd]` **Alle drei Dokumente rechnen in Prozent pro WOCHE**, an vier
unabhaengigen Stellen:

    A 1.4   Lean Bulk: "Target gain: 0.25-0.5% bodyweight/week"
    A 3.1   Phase 1: "Rate of loss: 0.5-0.8% bodyweight/week"
    B       Lean Bulk: "Ziel: +0.25-0.5% Koerpergewicht/Woche"
    C       Phase 1: "Zielgewichtsverlust: 0.5-0.8% Koerpergewicht/Woche"

`[read]` **Damit ist die vorlaeufige Setzung aus G-542 bestaetigt**, und
zwar durch Quellen, die Tom unabhaengig beigebracht hat. Keine der drei
nennt irgendwo %/Monat. **Die Spec-Zeile `rate_of_gain: 0.25–0.5% BW/month`
ist der Einzelfall und damit der Fehler.**

Tobias klaert morgen noch Frage 2 (12 oder 20 Wochen) und Frage 3.

## Auftrag

### A1 — `sub_phases` fuer `contest_prep`

`[read]` Dokument C nennt vier Phasen mit Wochen, Defizit und Rate;
Dokument A 3.1 dieselben drei Defizitstufen. Sie decken sich:

| Stage | Wochen | Defizit | Zielrate | Cardio |
|---|---|---|---|---|
| initiation | 0–4 | −15…20 % TDEE | 0,5–0,8 %/Woche | 2× 30 min LISS |
| progression | 4–12 | −20…25 % | 0,5–1,0 %/Woche | 3–5× 30–40 min |
| intensification | 12–18 | −25…35 % | 0,3–0,6 %/Woche | 5–6× + HIIT |
| peak_week | letzte 7–10 Tage | variabel | — | minimal |

**Die Rate sinkt zum Ende, obwohl das Defizit steigt** — das ist kein
Widerspruch, sondern der Kern: bei niedrigem Koerperfett ist der
Muskelverlust das Risiko, nicht die Geschwindigkeit. Diese Begruendung
gehoert als Satz mit in die Zeile, nicht nur die Zahlen.

`[read]` **Und es widerlegt die heutige Rechnung:** `contest_prep` traegt
live `tdee_modifier −0,25` pauschal. Die Unterphasen brauchen **drei
verschiedene** Werte. Solange die Rechnung einen Faktor je Strategie
nimmt, kann sie Wettkampfvorbereitung nicht darstellen — **das ist der
Grund, warum G-543 vor der Oberflaeche kommt.**

### A2 — `guards` fuer alle Strategien, die heute keine haben

`[cmd]` 7 von 17 tragen Waechter. Dokument C liefert den
Anpassungsalgorithmus, und er ist symmetrisch:

    Verlust < 0,5 %/Woche ueber 2 Wochen  ->  -100…200 kcal ODER +1 Cardio
    Verlust > 1,2 %/Woche ueber 2 Wochen  ->  +100…150 kcal

`[read]` **Die zweite Zeile ist die wichtigere und fehlt in unseren
heutigen Waechtern ganz:** zu schneller Verlust ist ein Eingriffsgrund,
nicht ein Erfolg. G-520 hat `weekly_loss > 1.0kg` gebaut — das ist eine
absolute Zahl; **0,7 kg sind bei 60 kg dasselbe Problem wie 1,2 kg bei
100 kg.** Die Regel gehoert relativ, nicht absolut. Das ist ein eigener
Befund fuer den Bericht.

### A3 — `requirements` aus den Startbedingungen

`[read]` Dokument C nennt Mindestvoraussetzungen fuer `contest_prep`:
Maenner ≤ 15 % KFA (besser 12–13 %), Frauen ≤ 22 % (besser 18–20 %). Das
passt auf die Felder, die der Katalog schon hat: `min_body_fat`,
`max_body_fat`, `min_experience`.

**Geschlechtsabhaengig** — das hat der Katalog heute nicht. Melden, wie es
dort hingehoert, statt einen der zwei Werte zu waehlen. Ein Frauen-Schwellwert
als Maenner-Schwellwert gespeichert ist schlimmer als kein Schwellwert.

### A4 — `exits` und `success`

    reverse_diet   exit: TDEE in 4-8 Wochen erreicht  (C, Abschnitt 4)
                   exit: Gewichtszunahme > 0,5 %/Woche = zu schnell
    contest_prep   success: KFA 4-5 % contest-ready, 5-7 % nachhaltig
                            fuer 2-4 Wochen  (C, Abschnitt 3)
    fat_loss       success: KFA fallend, Kraft stabil  (PHASE_MODELS)

### A5 — `max_duration_weeks` ist fuer `contest_prep` keine Konstante

`[cmd]` Dokument C gibt eine **Rechnung**:

    Prep-Wochen = (Start-KFA % − Ziel-KFA %) × 1,5 bis 2,0
                  + 2-4 Wochen Puffer

    Beispiel: 12 % -> 5 %  =  7 × 1,5…2,0  =  10,5…14 Wochen + Puffer

`[read]` **Live steht 16 als feste Zahl.** Fuer jemanden bei 10 % KFA sind
16 Wochen zu lang, fuer jemanden bei 18 % zu kurz — und dann greift der
Waechter `duration > max_duration -> force_transition` am falschen Tag.

**Nicht loesen in diesem Auftrag.** Die Spalte bleibt, wie sie ist, und der
Bericht meldet: welche Strategien eine Dauer aus einer Rechnung brauchen
statt einer Zahl, und was dafuer an Eingangsgroessen fehlt (Start-KFA und
Ziel-KFA am Ziel, nicht an der Strategie). Das wird ein eigener Punkt.

### A6 — was ausdruecklich NICHT eingebaut wird

`[read]` **Dokument A, Abschnitt 2, ist Pharmakologie** — Dosierungen fuer
anabole Steroide, Insulin, Diuretika, Thyroidhormone, DNP. **Das kommt in
keinen Katalogeintrag.** Es ist eine Produktentscheidung mit rechtlicher
Dimension, sie liegt bei Tom, und sie ist als **G-546** vorgelegt.

Dasselbe gilt fuer die Abbruchkriterien aus Dokument C, soweit sie
Blutwerte nennen (`Testosteron < 200 ng/dL`): das sind **medizinische
Aussagen**, sie gehoeren ins Medical-Modul mit dessen Belegpflicht, nicht
als Textzeile an eine Ernaehrungsstrategie. Die nicht-medizinischen
Abbruchkriterien (Trainingsleistung, Schlafdauer) duerfen in `guards`.

## Zu belegen

- je gefuellte Zelle die Quelle im Kettenschritt als Kommentar: welches
  Dokument, welcher Abschnitt. **Ein Wert ohne Fundstelle wird nicht
  eingespielt.**
- vorher/nachher je Spalte: wie viele der 17 Zeilen tragen einen Wert
- wo sich zwei Dokumente widersprechen: **gemeldet, nicht gewaehlt**
- die CHECKs aus G-536 halten weiter — je neuer Wert die Gegenprobe, dass
  er innerhalb der Grenzen liegt, und einer knapp ausserhalb faellt
- `berechne_zielwerte` liefert fuer `test-user@lumeos.local` dieselbe Zahl
  wie vorher, solange kein Faktor geaendert wurde
- Nachweise auf `test-user@lumeos.local`
- `pnpm gate` gruen · Wegwerf-DB verworfen mit Zahl · kein `db push` ·
  live einspielen · nichts committen

**Reihenfolge:** nach G-543. Der Katalog bekommt hier Werte, die die
Rechnung erst nutzen kann, wenn sie die Rate liest statt den Faktor.

---

## Nachtrag, 2026-09-29 16:30 — A7: drei Proteinfaktoren liegen ausserhalb

**Tom, 16:19, zur Bezugsgroesse:** *„niemand kennt seine magermasse."* Die
Rechnung bleibt bei Koerpergewicht (G-543, Ruecknahme). **Damit ist die
Frage nicht die Bezugsgroesse, sondern ob die Faktoren zu ihr passen.**

`[read]` Das vierte Dokument vom 2026-09-29 liefert Baender **fuer
Koerpergewicht** — nicht fuer Magermasse, also direkt vergleichbar mit dem,
was live steht:

| Phase | Band g/kg Koerpergewicht |
|---|---|
| Off-Season / Bulk | 1,8 – 2,2 |
| Lean Bulk | 2,0 – 2,4 |
| Recomp / Maintenance | 2,0 – 2,4 |
| Cut (standard) | 2,2 – 2,6 |
| Contest Prep | 2,4 – 3,0 |
| Peak Week | 2,0 – 2,4 |

`[cmd]` **Gegen die 17 Live-Werte gehalten — drei liegen ausserhalb:**

    peak_week          2,50   Band 2,0-2,4   ZU HOCH
    conservative_cut   2,00   Band 2,2-2,6   ZU NIEDRIG
    aggressive_bulk    1,60   Band 1,8-2,2   ZU NIEDRIG

Die anderen vierzehn liegen drin, die meisten am unteren Rand.

`[read]` **`peak_week` ist der interessanteste Fall**, weil er eine
Begruendung hat: das Dokument senkt dort Protein auf 2,0–2,4 und Fett auf
0,5 g/kg, **um Platz fuer Kohlenhydrate zu machen** — in der Ladephase
sind 6–8 g/kg Kohlenhydrate das Ziel, und die muessen irgendwo herkommen.
Unsere 2,50 stehen dem im Weg. **Das ist kein Tippfehler, sondern eine
fehlende Fachregel.**

### Was zu tun ist

Die drei Werte auf das Band bringen, **je Wert mit der Fundstelle als
Kommentar**. Und im Bericht: welche der vierzehn anderen am Rand liegen,
damit Tom sieht, wo der Katalog konservativ ist.

`[read]` **Nicht mitbauen, nur melden:** dasselbe Dokument schlaegt eine
**KFA-Kategorie in fuenf Stufen** als Feinjustierung vor (Faktor 0,90 bis
1,15) und die Navy-Formel aus Taille und Hals als Schaetzung, wenn der
Nutzer keinen KFA kennt. Das braucht keine Magermasse und keine genaue
Messung — nur eine Selbsteinschaetzung oder zwei Umfaenge, **die wir schon
erfassen.** Ob das kommt, ist eine eigene Entscheidung; hier gehoert es
nur in den Bericht, damit der Gedanke nicht verloren geht.

Die Fettfaktoren aus demselben Dokument (0,5 bis 1,0 g/kg je Phase) sind
im Katalog als `fat_percent` abgebildet — **ein Prozentsatz der Kalorien,
keine Groesse pro Kilogramm.** Das sind zwei verschiedene Wege zum selben
Wert. Melden, welcher gilt; nicht umstellen.
