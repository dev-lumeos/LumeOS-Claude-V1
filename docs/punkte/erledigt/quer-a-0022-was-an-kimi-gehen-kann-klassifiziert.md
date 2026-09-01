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
erledigt: 2026-09-01
commit: cf61b6c4
beruehrt:
  tabellen: [supplements.supplements]
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

`[cmd]` **Und die Grenze steht:** E-43 — BLS 4.0 ist die einzige
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

### 2026-09-01 - Codex

## A-22 - die alte Kimi-Liste ist weitgehend ueberholt

Die Katalogreste aus C-352, C-260 und C-365 sind getrennt zu lesen:

- Von 412 sichtbaren Supplements haben **20** den regelbasierten
  deutschen Nomenklaturnamen; **392** fallen bewusst auf `name_en`
  zurueck. Das ist keine 392er-Importluecke. Externe Recherche kann
  allenfalls eine primaere Fachschreibweise fuer einen klaren Einzelfall
  belegen; Trivial-, Pflanzen-, Handels- und Forschungsnamen bleiben
  eine Produkt-/Sprachentscheidung und gehen nicht automatisch an Kimi.
- Die Kennungen stehen heute nicht mehr als Spalten am sichtbaren
  Katalog, sondern in `supplements.supplement_identifiers`: **272
  UNII**, **241 PubChem_CID**, **155 ChEMBL_ID**, **239 InChIKey** und
  **33 CAS**. Die 33 CAS tragen genau die Quelle `kimi:c365`.
  C-260s Rueckfluss ist damit im gebauten Identifikator-Modell, nicht
  nur im Bericht.
- **27 Peptidsequenzen** bleiben ohne Datenbankziel: Es gibt weder eine
  Spalte `peptide_sequence` noch einen Identifier-Typ `sequence`.
  Die Information ist bereits in Kimis Bestand; weitere externe
  Recherche kann die fehlende Repräsentation nicht beheben.

Auch die alte Fachliteratur-Liste ist nicht mehr geschlossen als
Ganzes: C-105, C-124, G-89 und C-108 sind erledigt. Als echte externe
Literaturfragen bleiben C-109 (Rest-/Nadelwerte) und C-124-E8 als
ausgegliederte C-213-Arzt-Hinweis-Schwelle. C-145 kann Literatur zu
Trainingsstrukturen nutzen, aber diese ersetzt nicht die notwendige
Schemaentscheidung. C-123 sind Toms Entscheidungen, C-127 und G-70
sind erledigte Repo-Befunde; sie sind keine Kimi-Auftraege.

Die Sachgrenze fuer Food-Daten gilt weiter: BLS 4.0 ist die alleinige
V1-Foodquelle laut `ADR_BLS_ONLY`. Der im Auftrag verwendete Verweis
E-43 ist im aktuellen `docs/entscheidungen/E-43` dagegen eine
Recovery-Entscheidung zu Soreness. Die Nummer passt also nicht zur
BLS-Regel; die Regel selbst ist eindeutig und wurde nicht umgedeutet.
Es wurde keine externe Quelle aufgerufen und kein Katalog ausgebaut.

## A-23 - Lint bricht weiterhin repoweit ab

`CI=true pnpm lint` endet weiterhin mit Exit 1. Turbo startet die drei
Next-Workspaces `web`, `admin` und `coach`; alle drei rufen `next lint`
auf und fragen interaktiv nach einer ESLint-Konfiguration. Damit ist
der Fehler dieselbe fehlende ESLint-Basis wie im Altbefund, nicht die
alte JSX-TypeScript-Konfiguration.

G-308 wirkt, aber auf der anderen Achse: `@lumeos/ui#typecheck`,
`@lumeos/shared#typecheck` und das Root-`tsc --noEmit` enden heute
alle mit Exit 0; die beiden Pakete haben eigene `tsconfig`, und das
Root-`tsconfig` setzt `jsx: preserve`. `ui` und `shared` haben aber
weiter kein `lint`-Skript. **A-23 bleibt offen; G-308 erledigt ihn
nicht mit.**

## C-129 - Import erledigt, Sequenzen ohne Ziel bleiben

Der alte Befund ist ueberholt: Die Kimi-Kennungen und Aliase sind im
heutigen Modell eingespielt. Die vier Identifier-Typen aus C-260 sind
oben gemessen, die 33 CAS aus C-365 ebenso. Damit bleibt kein
Rueckflussauftrag fuer diese Daten.

Nicht in der Datenbank stehen nur die **27 Peptidsequenzen**, weil
keine Zielspalte oder generische Sequenzkennung existiert. Das ist die
von C-365 bereits festgehaltene bewusste Nichtuebernahme, nicht ein
fehlgeschlagener Import. **C-129 kann geschlossen bleiben; eine
Sequenzspalte waere ein neuer, separat zu entscheidender Bedarf.**

## Abnahme

**2026-09-01, Orchestrator.**

`[cmd]` **Der Kimi-Rueckfluss steht:** 20 deutsche Regel-Namen, 33
CAS, die Identifier generisch.

`[cmd]` **Die 27 Peptidsequenzen haben weiterhin keinen Zielort** —
`[read]` **und sein Zusatz ist der wichtige: *,,mehr Recherche loest
das nicht"*.** **Es fehlt keine Quelle, es fehlt eine Spalte.**

### A-23 — offen, und die Ursache ist eine andere

`[cmd]` **`pnpm lint` scheitert in Web, Admin und Coach an der
interaktiven ESLint-Ersteinrichtung.** `[cmd]` **UI-, Shared- und
Root-Typecheck sind gruen.**

`[read]` **G-308 loeste eine andere Ursache** — er sagt es selbst,
statt den Erfolg mitzunehmen.

`[read]` **Ein Befehl, der nach Eingaben fragt, laeuft in keinem
Gate.** **Als Teil von B-20 beauftragt.**

### C-129 — erledigt

`[cmd]` **Der Import ist durch.** `[read]` **Nur die bewusst nicht
uebernehmbaren Peptidsequenzen bleiben aussen.**

### Und ein Befund, der mir gehoert

`[cmd]` **Er meldet: die BLS-Regel steht in `ADR_BLS_ONLY`,
`docs/entscheidungen/E-03` behandelt Recovery/Soreness.**

`[cmd]` **Nachgemessen: E-03 ist *Nur gemeldete Muskeln > 0*, vom
19.08.** `[cmd]` **Und ich habe die BLS-Regel in vier Punkten als
E-03 zitiert** — C-177, C-368, A-22, B-20.

`[read]` **Die Sache stimmte jedes Mal, die Nummer nie.** `[cmd]`
**Als E-43 angelegt, die vier Verweise berichtigt.**

**Abgenommen.**

