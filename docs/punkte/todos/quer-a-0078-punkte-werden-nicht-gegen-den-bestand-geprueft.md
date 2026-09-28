---
nr: A-78
typ: befund
modul: quer
schwere: mittel
angelegt: 2026-09-28

quellen:
  - docs/punkte/todos/goals-G-0514-die-modulverrechnung-fehlt-ganz.md
  - docs/punkte/todos/goals-g-0524-vier-tabellen-und-beide-ansichten-fehlen.md
  - tools/nummern-pruefen.mjs
  - CLAUDE.md:391

braucht: []
kind_von: A-75

beruehrt:
  dateien:
    - tools/punkte-pruefen.mjs
    - docs/punkte/00-LIESMICH.md

zahlen:
  gemessen: 2026-09-28
  punkte_gesamt: 829
  dubletten_an_einem_tag: 2
  waechter_gegen_doppelte_nummern: 1
  waechter_gegen_doppelte_inhalte: 0
---

# A-78 - ein neuer Punkt wird nicht gegen den Bestand geprueft

## Der Befund

`[cmd]` **Am 27.09. hat der Orchestrator zwei Punkte angelegt, die es
schon gab.** `G-524` doppelt `G-514` vom 26.09. vollstaendig — dieselbe
Messung, dieselbe Schlussfolgerung. `G-522` beschreibt dieselbe Luecke
aus anderer Richtung und haette von Anfang an ein Kind von `G-514`
sein muessen.

`[read]` **Es passierte in derselben Sitzung, in der A-75 entstand** —
der Punkt darueber, dass Auftraege nicht gegen die Quellen geprueft
werden.

## Warum die bestehenden Waechter es nicht fangen

`[cmd]` **`nummern-pruefen` faengt doppelte NUMMERN, nicht doppelte
INHALTE.** Es gibt null Waechter fuer den zweiten Fall.

`[read]` **Und die Vier-Quellen-Regel nennt sie nicht.** Code, Daten,
Spec, Vorgaengerrepo — **die 829 bestehenden Punkte kommen in der
Liste nicht vor**, obwohl `docs/punkte/00-INDEX.md` genau das Register
ist, das sagt, was schon bekannt ist.

## Was NICHT hilft

`[read]` **Ein Waechter auf Titelaehnlichkeit haette diesen Fall
verschlafen.** ,,die Modulverrechnung fehlt ganz" gegen
,,Cross-Modul-Beitraege fehlen vollstaendig" teilen zwei Wortstaemme
(`modul`, `fehl`). Bei einer Schwelle, die das faengt, feuert er auf
829 Punkten dauernd; bei einer, die nicht dauernd feuert, faengt er
das hier nicht.

**Einen Waechter zu bauen, der bei genau der Sorte Dublette schweigt,
die gerade passiert ist, waere schlechter als keiner.**

## Was hilft

`[read]` **Der Kennungsabgleich, nicht der Wortabgleich.** Beide Punkte
nennen im Fliesstext dieselben Datenbankobjekte:

    goal_contributions      in G-514 und G-522 und G-524
    tdee_settings           in G-514 und G-524
    goal_adjustments        in G-514 und G-524
    weekly_reports          in G-514 und G-524

**Vier gemeinsame Kennungen sind kein Zufall, und sie sind maschinell
zu finden** — ein Bezeichner in `snake_case` oder mit `schema.tabelle`
ist ein Muster, kein Stilurteil.

## Der Vorschlag

**1.** Der Punktewaechter sammelt je Punkt die genannten
Datenbankkennungen und meldet, wenn ein Punkt **mit einem anderen
OFFENEN Punkt desselben Moduls drei oder mehr Kennungen teilt.**

**2.** Ein Pflichtfeld quittiert den Abgleich:

```yaml
geprueft_gegen: [G-510, G-514, G-515]
```

**Nicht alle offenen Punkte des Moduls** — das waere bei dreissig
offenen Punkten eine Liste, die niemand liest und jeder kopiert.
**Nur die, die der Kennungsabgleich genannt hat.** Damit ist die Liste
abgeleitet und kurz.

**3.** Stichtag statt Sollstand, wie bei A-75: Pflicht ab dem Tag, an
dem der Waechter steht. 829 bestehende Punkte bleiben frei.

## Nachweiszeilen

**A1** — die Kennungssammlung messen, BEVOR eine Schwelle gewaehlt
wird: wieviele Paare offener Punkte teilen drei, vier, fuenf
Kennungen? **Die Schwelle folgt aus der Verteilung, nicht aus dem
Gefuehl.**

**A2** — der Abgleich als Meldung, nicht als Rotlauf, bis A1 zeigt,
dass die Zahl klein ist.

**A3** — `geprueft_gegen:` als Pflichtfeld ab Stichtag, drei Faelle
rot: fehlt, nennt eine Nummer die es nicht gibt, nennt nicht die vom
Abgleich genannten Punkte.

**A4** — Gegenprobe in beide Richtungen. **Der harte Fall: G-524 mit
seinem heutigen Text und ohne `geprueft_gegen` muss rot werden, G-514
gruen.** Ohne diese Probe misst der Waechter nichts.

**A5** — die Vier-Quellen-Regel in `CLAUDE.md` bekommt eine fuenfte:
**der Bestand.** Eine Regel allein bindet nicht (A-75), aber sie
erklaert, was der Waechter erzwingt.

## Verhaeltnis zu A-75 und A-76

`[read]` **Dieselbe Krankheit, dritte Stelle.** A-75: Auftraege ohne
Quellenabgleich. A-76: die Quelle behauptet einen fremden Zustand.
A-78: der Bestand wird nicht gelesen, bevor etwas dazukommt. **Alle
drei sind Faelle von ,,niemand sieht nach, und nichts wird rot."**
