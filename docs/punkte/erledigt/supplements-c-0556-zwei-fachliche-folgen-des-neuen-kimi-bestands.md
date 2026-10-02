---
nr: C-556
typ: fehler
modul: supplements
schwere: hoch
angelegt: 2026-10-02
agent: codex
beauftragt: 2026-10-02
erledigt: 2026-10-02
commit: 16fd9c9c

braucht: [C-295, C-275]
kind_von: C-295

quellen:
  - docs/punkte/erledigt/quer-c-0295-die-kette-liest-aus-zwei-kimi-pfaden.md

beruehrt:
  tabellen: []
  dateien:
    - supabase/_pipeline/13_supplements/134_substance_catalog.ts
    - supabase/_pipeline/14_medical/147_substance_lab_markers.ts
    - supabase/_pipeline/_validierung/quer-c295-ein-kimi-pfad.test.ts
---

# Zwei fachliche Folgen des neuen Kimi-Bestands

## Auftrag — Kopf

    AUFTRAG FUER Codex - C-556: die zwei Folgen des Pfadwechsels, je
                               fachlich entschieden
    Bereich: supabase/_pipeline/13_supplements/134_substance_catalog.ts
             supabase/_pipeline/14_medical/147_substance_lab_markers.ts
             supabase/_pipeline/_validierung/
    Fremd:   apps/ gehoert Claude Code (G-586). docs/ gehoert dem
             Orchestrator, auch diese Punktdatei.
    Stand:   2026-10-02

## Der Befund — du hast ihn gemeldet statt passend gemacht

`[cmd]` **C-295 hat den Pfad umgestellt, und der Vollimport legte zwei
fachliche Fehler offen.** Du hast beide gemeldet und **nicht geraten** —
deshalb sind sie ein eigener Auftrag und nicht Teil von C-295.

`[cmd]` **Der neue Bestand ist groesser, belegt und richtig** (C-275):

    supplements.jsonl            154 -> 243
    peptides.jsonl                61 ->  79
    performance_compounds.jsonl   75 -> 124
    Substanzen je Schritt        290 -> 446

**25 von 28 gelesenen Quelldateien sind SHA-byteidentisch** — nur diese
drei unterscheiden sich.

### Erstens: 148 Datensaetze ohne C-230-Filter

`[cmd]` **Schritt 134 rechnet fuer den neuen Bestand 297 / 90 / 185
statt 307 / 82 / 177**, und **148 Datensaetze erhalten keinen
verpflichtenden C-230-Filter.**

`[read]` **Das ist eine Zuordnungsfrage, keine Zahlenfrage.** Die 148
sind neu im Bestand und passen in keine der bestehenden Gruppen.

### Zweitens: ein unbekannter Wirkungstyp

`[cmd]` **Schritt 147 bricht woertlich ab:**

    Unbekannter effect_type: detection_marker

`[read]` **Der Abbruch ist richtig** — ein unbekannter Wert darf nicht
still durchlaufen. Aber `detection_marker` ist offenbar eine Kategorie,
die der Katalog bisher nicht kannte.

`[cmd]` **Beides haelt den naechtlichen Vollimport rot**, und damit
haengt auch A-91/A5 daran: ohne gruenen Vollauf kein neuer Dump.

## Auftrag

**A1 — die 148 fachlich zuordnen, oder begruendet den Filterzwang
lockern.** `[read]` **Die Frage, die du entscheiden und melden sollst:**
sind die 148 Substanzen eine eigene Gruppe, gehoeren sie in bestehende,
oder ist der Zwang aus C-230 fuer diesen Bestand zu eng? **Begruende es
am Inhalt der 148, nicht an der Zahl** — und wenn die Antwort
"Produktentscheidung" lautet, **sag das und bau nichts.**

**A2 — `detection_marker` einordnen.** Was bedeutet der Wert im neuen
Bestand, wie viele Zeilen tragen ihn, und gehoert er in die bestehende
Aufzaehlung oder braucht er eine eigene Behandlung? `[read]` **Den
Abbruch nicht entfernen** — er ist die Zusicherung, die diesen Fund
moeglich gemacht hat.

**A3 — die Rohzaehlwaechter stehen schon auf den neuen Zahlen**
(`134_substance_catalog.ts:648`, in C-295 nachgezogen). **Pruef, ob deine
Loesung sie wieder verschiebt**, und zieh sie dann mit, mit der
gemessenen Zahl.

**A4 — danach der Vollimport.** `[read]` **Das ist der einzige Nachweis,
der zaehlt**, und er traegt zwei Punkte zugleich: wird er gruen, erzeugt
der naechtliche Lauf einen neuen Dump und **A-91/A5 ist belegt.** `[cmd]`
**Kein Vollauf von Hand** — die Nacht macht ihn, und du sagst im Bericht,
was sie vorfinden wird.

**Nicht Teil:** der Pfadwechsel (C-295, erledigt), der
Inhaltsunterschied der drei Dateien (C-275) und `supabase/README.md`.

**Zu belegen:** die Gruppenzahlen vorher und nachher, gegen eine
Wegwerf-Datenbank · die Zahl der 148 nach deiner Zuordnung · die
Zeilenzahl mit `detection_marker` · die betroffenen Schritte einzeln
gruen, mit Laufzeit · Wegwerf-Datenbank verworfen mit Zaehler · kein
`db push` · nichts committen.

---

## Abnahme — 2026-10-02, Commit `16fd9c9c`

`[cmd]` **A1 eingeloest, und die Antwort war die dritte Form:** keine
neue Produktgruppe, sondern feinere Quellklassen innerhalb der
bestehenden neun Filter. **Ohne Filter 148 → 0, Zeilen mit Filter
424/572 → 572/572**, Gruppen 297 / 90 / 185 unveraendert. Der
Filterzwang bleibt — und `fail()` nennt jetzt die Datensaetze, die ihn
verfehlen, statt nur die Zahl.

`[cmd]` **A2 eingeloest:** `detection_marker` ist zehnmal das
T/E-Verhaeltnis im Urin zum Dopingnachweis — weder physiologische
Wirkung noch Messstoerung, also ein eigener Wert derselben Aufzaehlung.
`lab_interference` (2 Zeilen, Vitamin C) wird auf das bestehende
`assay_interference` normalisiert. **Der Abbruch steht**, und die
C-295-Probe zaehlt genau diese Zeile nach.

`[cmd]` **Vom Orchestrator nachgemessen, nicht geglaubt** — gegen die
Rohquellen in `docs/kimi_research/.../data/substances/`, ohne Datenbank:

    supplements 243 · peptides 79 · performance_compounds 124   = 446
    Substanzen mit Laboreffekten                                = 182
    rohe Effekte                                                = 403
    davon physiological 324 · monitoring 54 · assay 13
          detection_marker 10 · lab_interference 2

**Alle fuenf Sollwerte des Berichts getroffen.** Die Filterzaehlung
summiert sich auf 297 / 90 / 185 = 572 — handnachgerechnet ueber alle 23
Eintraege, keine Abweichung.

`[cmd]` **Ein Fund, der nicht im Auftrag stand und im Bericht steht:**
`wada_status = restricted` (Albuterol) war vorher verdeckt. Codex hat den
CHECK nicht per `IF NOT EXISTS` ergaenzt, sondern **unbedingt ersetzt**
(`DROP CONSTRAINT IF EXISTS` + `ADD CONSTRAINT`) — bei beiden CHECKs.
`[read]` **Das ist der Unterschied zwischen einer frischen Kette und
einer bestehenden Datenbank:** ein `IF NOT EXISTS` haette den alten CHECK
stehen gelassen und den neuen Wert live abgelehnt.

`[cmd]` **A4 wie verlangt:** kein Vollauf von Hand. Einzellaeufe auf
`lumeos_c556_20261002` gruen (134: 4,414 s, Nachlauf 4,831 s; 147:
4,968 s, Nachlauf 6,507 s), Wegwerf-Datenbank verworfen (152 → 153 →
152, Resttreffer 0). **Der naechtliche Lauf prueft die beiden Schritte
erstmals im Zusammenhang; erst dann veroeffentlicht A-91 den Dump.**

`[cmd]` **Commit `16fd9c9c`**, 3 Dateien, +195/−41, `pnpm gate` gruen,
18/18 Turbo-Aufgaben. **Claude Codes laufende G-586-Arbeit blieb
ausserhalb des Staging** — `packages/shared/src/supabase/session.ts` und
zwei untracked Dateien stehen unveraendert im Arbeitsbaum.

`[read]` **Offen und nicht Teil dieses Punkts:** `supabase/README.md`
nennt weiter den alten Kimi-Pfad — der einzige verbliebene Treffer aus
C-295, und er gehoert dem Orchestrator.
