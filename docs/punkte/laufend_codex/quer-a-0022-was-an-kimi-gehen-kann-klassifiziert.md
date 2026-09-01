---
nr: A-22
typ: blocker
modul: quer
schwere: hoch
angelegt: 2026-08-19
braucht: []
kind_von: G-84
kinder: []
entscheidung: null
agent: codex
beauftragt: 2026-09-01
beruehrt:
  tabellen: []
  dateien: []
zahlen: null
---

# A-22 - Was an Kimi gehen kann — klassifiziert

## Befund

(neu
  2026-08-19). **Auftraege schreiben, sobald er frei ist.**

  ### Klasse A — Fachliteratur, klar umrissen

  `[read]` **Zahlen, die im Repo als *„conservative defaults"* stehen und
  niemand belegen kann. Jede blockiert eine Kachel.**

  | | |
  |---|---|
  | **C-105** | **MEV/MAV/MRV** — blockiert dreifach: Volume landmarks, Zielband *14/16 Saetze*, Einstufung Beginner…Elite |
  | **C-124 (E5)** | **Modalitaeten-Bonuswerte** — Sauna, Massage, Eisbad, Dehnen |
  | **C-124 (E8)** | **Motivations-Schwelle** · und: ab wie vielen Signalen ueber wie viele Tage ist ein Arzt-Hinweis angebracht? |
  | **C-109** | **`rest_days` und Nadelstaerke je Injektionsort** — die Volumina hat F-05 belegt |

  `[cmd]` **Vorschlag: C-105 und C-124 als ein Auftrag** — dieselbe
  Literatur, dieselben Zeitschriften, **zusammen fuenf Kacheln.**

  ### Klasse A — Nachtrag 2026-08-19

  `[cmd]` **G-89: Koerperproportionen.** 1.618, V-Taper und der
  Reeves-Wert stehen nur in `theme-v1/uploads/` — **Begleitdateien, keine
  Spezifikation.** *„`daten.ts:438` gibt fest 88 zurueck."*

  `[read]` **Zu recherchieren:** Gibt es belegte Referenzwerte fuer
  Koerperproportionen im Kraftsport — oder ist das durchweg Tradition
  ohne Datengrundlage? **Beide Antworten sind brauchbar.** WHO 2008 zu
  Taille:Huefte zeigt, dass es fuer manche Verhaeltnisse Belege gibt.

  `[cmd]` **C-145: Trainingsplanung.** *„Bloecke, Wochen mit Phasenzweck,
  Routinen mit Herkunft"* — **welche Strukturen sind in der
  Trainingsliteratur ueblich?** Periodisierung, Mesozyklen,
  Undulating gegen Block. `[read]` **Das entscheidet das Schema**, und
  ein falsches Schema kostet mehr als die Recherche.

  ### Klasse B — Datenluecken im bestehenden Format

  `[cmd]` **Die 9 Marker aus G-84** — ApoB, PSA, Zink, FSH, IGF-1,
  Prolaktin, Calcium. **Mit LOINC-Code, Einheit, Referenzbereich,
  Quelle.** `[read]` **Der einfachste Auftrag:** Das Format steht (C-84
  hat 560 Bereiche gebaut), es fehlen neun Zeilen.

  `[cmd]` **C-108** — die **6 Supplement×Medikament-Wechselwirkungen**
  (Warfarin, SSRIs, Pille). **Unsere 28 CSV-Zeilen sind unbelegt.**

  ### Klasse C — geht nicht an Kimi

  `[cmd]` **C-71, C-123** — Toms Entscheidungen, keine Recherche.
  **C-114, C-115** — von Fable erledigt. **C-116** — wartet auf Kimis
  eigene Lieferung. **C-127, E-14, G-70** — Befunde im Repo, keine
  Aussenfrage.

## Auftrag — was an Kimi gehen kann, und zwei Altbestaende

**Mitbeauftragt: A-23, C-129.** Bericht in diese Datei.

**Beauftragt am 2026-09-01.**

### 1 · A-22 — was an Kimi gehen kann

`[read]` **Lies den Punkt und miss, was er verlangt.**

`[cmd]` **Der Bestand hat sich seither bewegt:** C-352 hat 20
deutsche Nomenklaturnamen gesetzt, C-365 33 CAS-Kennungen, C-260 hat
UNII, PubChem, ChEMBL und InChIKey zurueckgefuehrt.

`[read]` **Also: was fehlt noch, und was davon kann eine externe
Recherche liefern?**

`[cmd]` **Und die Grenze steht:** E-03 — BLS 4.0 ist die einzige
Lebensmittelquelle. `[read]` **Fuer Supplements gilt das nicht, dort
ist Kimi bereits die Quelle.**

### 2 · A-23 — Lint bricht repoweit ab

`[read]` **Miss, ob es noch gilt.** `[cmd]` **Seit G-308 haben
`@lumeos/ui` und `@lumeos/shared` eigene `tsconfig` und eigene
Aufgaben, und das Root-`tsconfig` traegt `jsx`.**

`[read]` **Wenn Lint an derselben Ursache hing, ist er mit
erledigt.**

### 3 · C-129 — der Kimi-Bestand, brauchbar aber nicht eingespielt

`[cmd]` **Miss, was von den Forschungsdaten heute in der Datenbank
steht und was nicht.** `[cmd]` **C-260 hat die Kennungen
zurueckgefuehrt** — **offen blieben 27 Peptidsequenzen ohne
Zielspalte** (C-365).

`[read]` **Wenn der Rest eingespielt ist: schliessen.** **Wenn nicht:
sagen was fehlt und wie viel.**

### Was nicht zu tun ist

**Keine externe Quelle heranziehen** — das ist die Frage, nicht die
Antwort.
**Kein Katalogausbau.**
`apps/` nicht anfassen.
Nicht committen, nicht stagen, nicht pushen.

### Der Dev-Server gehoert dir nicht

`[cmd]` **Kein `neustart`, kein `start`, kein `aufraeumen`.**

### Nachweis

    je Punkt ein Urteil   erledigt / gebaut / offen / ueberholt
    was fehlt             benannt, mit Zahl
    Kimi-Bestand          was steht drin, was nicht
    Lint                  laeuft er? seit wann

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
