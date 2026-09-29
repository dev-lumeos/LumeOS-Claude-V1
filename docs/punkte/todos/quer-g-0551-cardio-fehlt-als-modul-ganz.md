---
nr: G-551
typ: befund
modul: quer
schwere: hoch
angelegt: 2026-09-29

braucht: []
kind_von: null

quellen:
  - docs/ssot/131-fachwissen-phasen-und-rechenwege.md
  - docs/punkte/00-INDEX.md

beruehrt:
  tabellen: []
  dateien:
    - docs/ssot/131-fachwissen-phasen-und-rechenwege.md

zahlen:
  gemessen: 2026-09-29
  cardio_schemata: 0
  cardio_tabellen: 0
  schemata_geprueft: 4
---

# Cardio fehlt als Modul ganz — und damit die Hälfte der Steuerung

`[cmd]` **Gemessen gegen die laufende Datenbank:** kein `cardio`-Schema, und
keine der 17 Tabellen in `training` heisst danach.

    goals 12 · nutrition 48 · recovery 9 · training 17 Tabellen
    training.workout_sessions · workout_sets · programs · routines · ...
    -> nichts fuer Cardio

`[read]` **Die Folge ist keine Luecke im Angebot, sondern in der Rechnung.**
Ein Defizit hat zwei Quellen: weniger essen und mehr bewegen. Ohne Cardio
kann LumeOS nur die erste steuern — und muss das ganze Defizit ueber die
Ernaehrung holen, auch wenn der Nutzer lieber laufen wuerde.

## Was die Quelle dazu liefert

`[read]` `docs/ssot/131`, Abschnitte 2.3, 3.5 — und es ist ungewoehnlich
konkret:

**Kalorien je Minute aus dem Gewicht**, nicht aus einer Pauschaltabelle:

    LISS  0,10 × kg/min      MISS  0,12 × kg/min      HIIT  0,15 × kg/min

**Die Bedarfsrechnung**, die Ernaehrung und Bewegung verbindet:

    Restdefizit = Zieldefizit − Defizit aus der Ernaehrung
    Minuten je Woche = Restdefizit-Kalorien / (Faktor × Gewicht)

**Die Vorgabe je Phase** (3.5): von 0–2 Einheiten im Off-Season bis 5–7 mit
HIIT in der spaeten Wettkampfvorbereitung.

**Und die Rueckkopplung:** +2 g Kohlenhydrate je 10 Minuten Cardio bei
Praeferenz `high` — 300 Minuten in der Woche sind +60 g am Tag.

## Warum das jetzt nur ein Befund ist

`[read]` **Ein neues Modul ist nicht das, was Tom verlangt hat.**

**Tom, 2026-09-29:** *„physique oder pose interessiert mich noch nicht, wenn
wir nicht mal in der lage sind grundlagen in der ui darzustellen."* Dasselbe
gilt hier: die Goals-Grundlagen (Bauordnung `docs/ssot/130`, sechs Ebenen)
stehen erst zur Haelfte.

**Dieser Punkt haelt fest, was gebraucht wird, und wartet.**

## Was er beruehrt, wenn er kommt

    goal_strategies      cardio_sessions_min/max, cardio_minuten,
                         cardio_typen je Strategie
    ein cardio-Schema    Einheiten mit Typ, Dauer, Puls, Kalorien
    berechne_zielwerte   das Defizit teilt sich auf Ernaehrung und Cardio
    packages/scoring     eine fuenfte Modulquelle fuer den Beitrag (G-514)

`[read]` **Der letzte Punkt ist der, der am meisten haengt:** G-514 hat vier
Modulbeitraege gebaut (nutrition, training, recovery, supplements). Cardio
waere der fuenfte — und in einer Diaet der zweitwichtigste.

## Eine Warnung fuer den Tag, an dem es gebaut wird

`[annahme]` **Cardio-Kalorien doppelt zu zaehlen ist der naheliegende
Fehler.** Der Aktivitaetsmultiplikator im TDEE enthaelt Training schon, und
v2.0 addiert die Cardio-Praeferenz dort noch einmal (+0,05 bis +0,15). Wer
danach die Cardio-Kalorien erneut abzieht, rechnet dieselbe Stunde zweimal.
**Die Quelle loest das nicht auf** — das muss beim Bau entschieden und
belegt werden.

---

## Entschieden, 2026-09-29 16:51

**Tom:** *„wir werden neu ein cardio modul bauen, darueber sprechen wir
spaeter noch."*

`[read]` **Damit ist dieser Punkt keine Frage mehr, sondern ein Vorlauf.**
Das Modul kommt; der Zeitpunkt und der Umfang werden besprochen. Was hier
steht, ist die Fachgrundlage dafuer — die Rechenwege aus `docs/ssot/131`
Abschnitte 2.3 und 3.5.

**Der Punkt bleibt in `todos/`** und wird nicht beauftragt, bis das Gespraech
stattgefunden hat. **Was vorher zu klaeren ist**, damit das Gespraech kurz
sein kann:

    1  Eigenes Schema oder Tabellen in training?
       training traegt Einheiten, Saetze und Programme - Cardio hat
       dieselbe Form (Einheit, Dauer, Intensitaet), aber keine Saetze.
    2  Zaehlt Cardio in den TDEE oder gegen ihn?
       Der Aktivitaetsmultiplikator enthaelt Training schon, und v2.0
       addiert die Cardio-Praeferenz dort noch einmal. Wer danach die
       Cardio-Kalorien abzieht, rechnet dieselbe Stunde zweimal.
       Die Quelle loest das nicht auf.
    3  Erfassen oder planen - oder beides?
       Eine erfasste Einheit ist ein Tagebucheintrag. Eine geplante ist
       ein Teil des Defizits und gehoert an die Strategie.
    4  Der fuenfte Modulbeitrag (G-514)?
       nutrition, training, recovery, supplements liefern heute Scores.
       Cardio waere der fuenfte - und in einer Diaet der zweitwichtigste.
       Die Gewichtungsreihen summieren auf 1,00 und muessten neu geteilt
       werden.

`[read]` **Frage 4 ist die, die den bestehenden Bau anfasst.**
`packages/scoring/src/beitrag.ts` ist abgenommen, die vier
Gewichtungsreihen summieren exakt auf 1,00 (selbst nachgerechnet, Commit
`dc55728a`). Ein fuenfter Beitrag aendert alle vier Reihen — **das ist keine
Ergaenzung, sondern eine Neuverteilung**, und sie braucht eine eigene
Abnahme mit derselben Summenprobe.
