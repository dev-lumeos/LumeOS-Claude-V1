---
nr: G-546
typ: entscheidung
modul: quer
schwere: hoch
angelegt: 2026-09-29

braucht: []
kind_von: null

quellen:
  - docs/punkte/00-INDEX.md

beruehrt:
  tabellen:
    - medical.user_medications
  dateien:
    - docs/punkte/00-INDEX.md

zahlen:
  gemessen: 2026-09-29
  substanzklassen_im_dokument: 6
---

# Erfassen oder empfehlen — die Grenze bei Substanzprotokollen

`[cmd]` **Die Lektuere vom 2026-09-29 (Dokument A, Abschnitt 2) enthaelt
Dosierungsprotokolle fuer sechs Substanzklassen:** anabole Steroide,
Wachstumshormon und Peptide, Thyroidhormone, Fettabbaumittel
einschliesslich DNP, Insulin und Diuretika. Mit Wochendosierungen,
Halbwertszeiten, Zyklusplaenen und Nebenwirkungsmanagement.

**Das ist nicht in einen Katalogeintrag eingebaut worden** (G-545 A6), und
zwar nicht, weil es fachlich falsch waere, sondern weil die Entscheidung
Tom gehoert.

## Die Frage ist nicht, ob LumeOS Substanzen kennt

`[cmd]` **Es tut es schon:** `medical.user_medications` speichert
Medikamente verschluesselt (C-285), der Medikamentenkatalog steht (C-506),
und der Injektionsplaner hat ein Datenmodell fuer Injektionsstellen
(C-385). Ein Nutzer kann heute erfassen, was er nimmt.

**Die Frage ist die Richtung:**

| | |
|---|---|
| **Erfassen** | Der Nutzer traegt ein, was er nimmt. LumeOS rechnet damit — Wechselwirkungen, Laborwerte, Injektionsstellen. **Gebaut, unstrittig.** |
| **Empfehlen** | LumeOS liefert eine Dosierung aus, weil eine Strategie sie vorsieht. Der Katalog wuerde sagen: *„contest_prep, Woche 9–16: Trenbolon 400 mg/Woche."* **Nicht gebaut, und eine andere Kategorie.** |

`[read]` **Der Unterschied ist nicht graduell.** Im ersten Fall ist LumeOS
ein Tagebuch mit Rechenwerk. Im zweiten gibt es eine Anweisung zu
Substanzen, die in den meisten Laendern verschreibungspflichtig oder
verboten sind — an einen Nutzer, dessen Erfahrung und Gesundheitszustand
es nur als Selbstauskunft kennt.

## Was zu entscheiden ist

1. **Bleibt es beim Erfassen?** Dann ist dieser Punkt geschlossen, und
   Substanzen erscheinen in Goals nirgends.
2. **Oder werden Protokolle abgebildet** — dann: fuer wen sichtbar
   (Coach-Freigabe? Tier?), mit welchem Hinweis, und wer traegt die
   fachliche Verantwortung fuer den ausgelieferten Wert.
3. **Ein Mittelweg, der ohne Empfehlung auskommt:** der Nutzer erfasst
   sein eigenes Protokoll, und LumeOS **rechnet damit** statt es
   vorzugeben — Zeitachse, Laborwert-Kopplung, Warnung bei Konflikt. Das
   nutzt dieselben Daten, ohne eine Dosierung auszuliefern.

`[annahme]` **Weg 3 traegt den Nutzen ohne die Anweisung** und passt zu
dem, was schon gebaut ist (Medical, Injektionsplaner). Das ist eine
Einschaetzung, keine Messung — Tom entscheidet.

## Wer das beantworten kann

`[read]` Tobias ist IFBB-Profi und am 2026-09-30 da. Er kann die fachliche
Seite klaeren. **Die produkt- und haftungsseitige Frage kann er nicht
klaeren** — die bleibt bei Tom.

**Bis dahin:** in Goals erscheint keine Substanz, kein Katalogeintrag
traegt eine Dosierung, und die Lektuere wird fuer Ernaehrung, Training,
Cardio und Peak-Week-Wassermanagement genutzt — alles, was Abschnitt 2
nicht betrifft.

---

## Nachtrag, 2026-09-29 17:00 — die Neufassung baut die Empfehlung aus

`[cmd]` **Die v2.0 vom 16:45 ist in diesem Punkt deutlicher als die erste
Fassung.** Sie traegt elf Peptide mit vollstaendigem Protokoll — Dosierung,
Timing, Dauer, Stapelung, Injektionsort, **Nadelstaerke und Rekonstitution**
(Abschnitte 6.3 bis 6.5):

    BPC-157 · TB-500 · CJC-1295 DAC · CJC-1295 no DAC · Ipamorelin
    GHRP-6 · GHRP-2 · HGH-Fragment 176-191 · AOD9604 · IGF-1 LR3
    MGF · Melanotan 2 · PT-141

**Und Abschnitt 9.1 ordnet sie den Phasen zu**, als Zeile in derselben
Tabelle wie Kalorien und Makros:

    Off-Season      CJC+IPA+IGF
    Lean Bulk       CJC+GHRP6
    Cut             CJC+IPA+Frag
    Contest Prep    CJC+IPA+Frag+MT2
    Peak Week       Stop
    Reverse Diet    Optional

`[read]` **Damit ist die Frage dieses Punktes nicht mehr abstrakt.** Die
Quelle behandelt Peptide als Phasenparameter — gleichrangig mit dem
Proteinfaktor. Wer die Tabelle uebernimmt, uebernimmt die Empfehlung mit.

### Was das an der Entscheidung aendert: nichts, aber sie wird dringender

`[read]` **Tom, 16:39:** *„es folgt nochmal eine komplette wikipedia wo alle
aenderungen plus ergaenzend pepdtides auch noch drinnen haben werden."* Das
ist eine Ansage zur Quelle, **keine Entscheidung zum Produkt** — und der
Orchestrator behandelt sie nicht als eine.

**Was zusaetzlich zu entscheiden ist, wenn die Antwort „abbilden" lautet:**

    1  Nur erfassen, oder auch vorschlagen?
    2  Falls vorschlagen: an eine Coach-Freigabe gebunden, an eine
       Abostufe, oder an eine Selbstauskunft zur Erfahrung?
    3  Wer traegt die fachliche Verantwortung fuer den ausgelieferten
       Wert - LumeOS, der Coach, oder niemand?
    4  Gilt es in jedem Land gleich, oder haengt die Sichtbarkeit am
       Standort des Nutzers?

`[read]` **Frage 3 ist die, die kein Dokument beantwortet.** Ein
Katalogeintrag mit `250-500 mcg 2-3×/Tag` ist eine Aussage von LumeOS, auch
wenn die Zahl aus einer Quelle kommt.

**Unveraendert gilt:** bis zur Entscheidung erscheint in Goals keine
Substanz, kein Katalogeintrag traegt eine Dosierung, und `docs/ssot/131`
Abschnitt 6 haelt fest, dass die Protokolle bewusst draussen sind.
