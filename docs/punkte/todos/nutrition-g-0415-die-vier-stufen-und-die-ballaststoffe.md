---
nr: G-415
typ: entscheidung
modul: nutrition
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: G-412
entscheidung: null
beruehrt:
  tabellen: [goals.nutrition_targets]
zahlen:
  gemessen: 2026-09-08
  stufen: 4
---

# G-415 — die vier Stufen und die Ballaststoffe

## Frage 1: welche Erfahrungsstufen gibt es?

`[cmd]` **`public.profiles`, CHECK:**

    beginner | advanced | pro | elite

`[cmd]` **Wer hat welche: `pro` 2, der Rest NULL.**

`[cmd]` **`dev@lumeos.app` steht auf `pro`.**

### Und was G-228 nennt

`[cmd]` **`SPEC_04_FEATURES.md`, Feature 11:**

    beginner      0.75
    intermediate  0.90
    advanced      1.00
    elite         1.10

`[read]` **Die Listen decken sich NICHT:**

    Datenbank   beginner  advanced  pro   elite
    Spec        beginner  intermediate  advanced  elite

`[read]` **`pro` gibt es nur in der Datenbank,
`intermediate` nur in der Spec.**

`[cmd]` **Und G-228 nennt noch ein zweites Problem:** *,,Es ist
nicht spezifiziert, woher `user_level` kommt."*

`[cmd]` **Inzwischen ist das beantwortet** ?
`public.profiles.experience_level`, **und die Kachel liest es
(G-412).**

### Was zu entscheiden ist

**a** ? **Die Datenbank folgt der Spec:** `pro` **wird zu**
`intermediate`.

`[cmd]` **Zwei Zeilen zu aendern.**

`[read]` **Aber *pro* und *intermediate* heissen nicht dasselbe**
? **ein Profi ist ueber *advanced*, ein *intermediate*
darunter.**

**b** ? **Die Spec folgt der Datenbank:** **vier Stufen mit
Faktoren.**

    beginner  0.75
    advanced  1.00
    pro       ?
    elite     1.10

`[read]` **Dann fehlt genau ein Wert** ? **zwischen 1.00 und
1.10.**

**c** ? **Fuenf Stufen.**

    beginner      0.75
    intermediate  0.90
    advanced      1.00
    pro           1.05
    elite         1.10

`[read]` **Dann traegt die Datenbank einen Wert mehr.**

### Was der Multiplikator bewirkt

`[cmd]` **Der Score wird damit multipliziert** ? **ein Anfaenger
bekommt bei derselben Zufuhr einen hoeheren Wert.**

`[read]` **Die Begruendung dahinter: wer anfaengt, soll fuer
dasselbe weniger streng bewertet werden.**

`[cmd]` **`Thresholds: ok >= 80, warn 50-79, block < 50`** ?
**der Faktor verschiebt, wer in welche Klasse faellt.**

---

## Frage 2: warum fehlen Ballaststoffe im Schema?

`[cmd]` **Der gemessene Wert IST da:**

    nutrition.daily_summary.fibt
    nutrition.daily_summary.fibt_missing

`[cmd]` **Das ZIEL fehlt** ? **`goals.nutrition_targets` hat:**

    kcal, protein_g, carbs_g, fat_g,
    linoleic_acid_g, alpha_linolenic_acid_g

`[read]` **Kein `fiber_g`.**

`[read]` **Deshalb rechnet der Score mit 0.85 statt 1.00** ?
**der Anteil `fiber 0.15` hat keinen Bezugswert.**

### Woher ein Ziel kommen koennte

`[cmd]` **Die DGE nennt 30 g/Tag fuer Erwachsene** ? **eine feste
Zahl, keine Rechnung aus dem Gewicht.**

`[cmd]` **`linoleic_acid_g` und `alpha_linolenic_acid_g` stehen
schon in der Tabelle** ? **dieselbe Bauform.**

`[read]` **Also: eine Spalte `fiber_g`, und der Wert kommt aus
derselben Quelle wie die beiden Fettsaeuren.**

`[cmd]` **Messen, WIE die beiden gefuellt werden** ? **von Hand,
aus einer Formel, oder aus einem Referenzwert.**

`[read]` **Das ist ein Codex-Auftrag, sobald die Stufenfrage
entschieden ist.**
