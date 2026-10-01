---
nr: E-87
titel: Die Mikronaehrstoff-Tagesreferenz ist zielfrei
entschieden: 2026-10-01
entscheider: Tom
betrifft: [G-567, G-563, G-538]
---

# E-87 — Die Mikronaehrstoff-Tagesreferenz ist zielfrei

## Die Entscheidung

**Tom, 2026-10-01, 13:19:** *„ja das passt"* — zur recherchierten
Empfehlung: die Referenz rechnet zielfrei, die Phase wirkt ueber die
Zufuhr, nicht ueber den Referenzwert.

    Referenz        Alter, Geschlecht, Gewicht, TDEE - kein Phasenfaktor,
                    keine goal_id, auch fuer Nutzer ohne Ziel
    Deckung         gegen die tatsaechliche Zufuhr
    Was sich bei
    Defizit aendert die LUECKE, nicht die Referenz

## Die Belege

`[cmd]` **EFSA setzt Thiamin ausdruecklich pro Energie:** PRI
**0,1 mg/MJ = 0,4 mg/1000 kcal** fuer alle Erwachsenen, mit der
Begruendung, dass das Verhaeltnis von Thiaminbedarf zu Energiebedarf in
allen Bevoelkerungsgruppen gleich ist.
(https://efsa.europa.eu/en/efsajournal/pub/4653)

`[cmd]` **Riboflavin dagegen ist absolut:** AR 1,3 und PRI
**1,6 mg/Tag** fuer Erwachsene, ohne Energiebezug.
(https://efsa.europa.eu/en/efsajournal/pub/4919)

`[read]` **Der energieabhaengige Teil haengt am Energie-BEDARF, nicht am
Energie-ZIEL.** Wer in der Diaet 2300 statt 3000 kcal isst, hat deshalb
keinen niedrigeren Thiaminbedarf — sein Bedarf bleibt am Verbrauch, nur
seine Zufuhr sinkt.

`[wahrscheinlich]` **Und das ist das fachliche Thema bei Diaetphasen:**
die Sporternaehrungsliteratur behandelt niedrige Energieverfuegbarkeit
als URSACHE von Mikronaehrstoffmaengeln, nicht als Grund, die Referenz
zu verschieben.

## Was daraus folgt

`[cmd]` **Der Zielbezug faellt aus `nutrition.micronutrient_snapshot`
HERAUS statt hinzuzukommen** — betrifft auch
`micronutrient_snapshot_with_supplements` und die davon abhaengige
`micronutrient_below_threshold`.

`[read]` **Keine neue Eingabe, kein Feld, keine Einstellung.** Und ein
Nutzer ohne Ziel bekommt weiterhin eine Referenz — das konnte keine der
zielgebundenen Formen.

`[read]` **Das sichtbare Werfen bei Mehrdeutigkeit** (heute der
Zwischenzustand) entfaellt damit an dieser Stelle: es gibt keine
Mehrdeutigkeit mehr, weil keine Phase gewaehlt wird.

## Was damit nicht entschieden ist

`[vermutung]` **Einzelne Naehrstoffe werden fuer Sportler hoeher
diskutiert** — Eisen, Vitamin D, Calcium. Das haengt an Trainingslast,
Geschlecht und Status, **nicht an der Diaetphase**. Wenn das hinein
soll, ist es ein eigener Punkt mit eigener Quelle und beruehrt diese
Entscheidung nicht.
