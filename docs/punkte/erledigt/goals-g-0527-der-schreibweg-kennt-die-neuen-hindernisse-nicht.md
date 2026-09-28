---
nr: G-527
typ: fehler
modul: goals
schwere: mittel
angelegt: 2026-09-28
erledigt: 2026-09-28
commit: 0483f080
agent: claudecode
beauftragt: 2026-09-28

quellen:
  - apps/web/src/lib/profile/zielwerte-read.ts:53
  - apps/web/src/lib/profile/zielwerte-write.ts:54
  - docs/punkte/laufend_codex/goals-G-0511-phase-entscheidet-nicht-ueber-kalorien.md

braucht: [G-511]
kind_von: G-511

beruehrt:
  tabellen:
    - goals.nutrition_targets
  dateien:
    - apps/web/src/lib/profile/zielwerte-read.ts
    - apps/web/src/lib/profile/zielwerte-write.ts

zahlen:
  gemessen: 2026-09-28
  hindernisse_im_typ: 2
  hindernisse_nach_g511: 4
  treffer_auf_23514: 0
---

# G-527 - der Schreibweg kennt die neuen Hindernisse nicht

## Der Befund

`[cmd]` **Gemessen am 2026-09-28. `zielwerte-read.ts:53` fuehrt genau
zwei Hindernisse:**

    hindernis: 'profil_unvollstaendig' | 'zielrichtung_ohne_faktor' | null

`[cmd]` **G-511 bringt zwei weitere** — `keine_aktive_phase` und
`phasenparameter_fehlt`. **Beide stehen in keinem Typ und in keiner
Abfrage.** Treffer auf `23514` im ganzen Verzeichnis `apps/web/src`:
null.

`[cmd]` **`zielwerte-write.ts:54` endet fuer alles, was nicht
`profil_unvollstaendig` ist, in einem Satz:**

    throw new ProfileWriteError('INVALID_INPUT',
      'Die Formel lieferte keine Zielkalorien.')

`[read]` **Damit werden vier verschiedene Ursachen zu einer
Meldung.** Der Nutzer sieht ,,die Formel lieferte keine
Zielkalorien", obwohl die richtige Auskunft waere: ,,Du hast keine
aktive Phase" oder ,,Fuer diese Phase fehlt der Kalorienwert". **Das
erste ist ein Fehler, das zweite eine Aufgabe** — beides sieht gleich
aus.

`[read]` **Und der Fall, der wirklich durchschlaegt, ist schlimmer.**
Erreicht ein Schreibvorgang den neuen Trigger direkt, kommt ein
SQLSTATE `23514` zurueck, den niemand faengt. Ein nicht gefangener
Datenbankfehler wird zu HTTP 500 — **ein Serverfehler fuer eine
Situation, die der Nutzer selbst aufloesen kann.**

## Was Codex dazu gemeldet hat

`[read]` **Codex hat es selbst gefunden und `apps/` nicht angefasst**
— richtig, das ist Claude Codes Bereich. Der Befund stand als N15 im
G-511-Bericht und waere dort mit dem Punkt geschlossen worden.
**Deshalb steht er jetzt hier:** er ueberlebt G-511.

## Nachweiszeilen

**A1** — die vier Hindernisse in den Typ, je mit eigenem Text. Der
Text sagt, was zu tun ist, nicht was schiefging.

**A2** — `23514` faengt der Schreibweg und macht daraus dasselbe
Hindernis, das die Leseseite kennt. **Ein Zustand, zwei Wege, eine
Meldung.**

**A3** — die Gegenprobe laeuft ueber den ECHTEN Weg, nicht ueber
einen erfundenen Aufruf: ein Nutzer ohne aktive Phase, ein Nutzer mit
`fat_loss` ohne Kalorienwert. **Beide muessen eine verstaendliche
Auskunft bekommen, kein 500er.**

**A4** — **Grenze zu E-74 pruefen:** ,,Fuer diese Phase fehlt der
Kalorienwert" ist eine Aufforderung an den Nutzer. Sie faellt unter
die dort festgelegte Form.

**A5** — Nachweise auf `test-user@lumeos.local`.

## Bericht

**Claude Code, 2026-09-28.**

### A1 — vier Hindernisse, vier Texte

`[cmd]` **`zielwerte-read.ts` fuehrt jetzt den Typ `Hindernis`**
mit allen vieren, dazu `hindernisSatz()` — **eine Stelle fuer Lese-
und Schreibweg**, damit die Woertlaute nicht driften.

    profil_unvollstaendig     „Ergaenze dein Profil: X fehlt noch."
    keine_aktive_phase        „Waehle eine Phase. Ohne sie gibt es
                               kein Kalorienziel, weil die Phase das
                               Tempo bestimmt."
    phasenparameter_fehlt     „Fuer diese Phase fehlt der
                               Kalorienwert. Trag ihn an der Phase
                               nach, dann rechnet das Ziel."
    zielrichtung_ohne_faktor  „…noch kein Kalorienzuschlag
                               hinterlegt. Das liegt nicht an
                               deinen Angaben."

`[read]` **Drei sagen eine HANDLUNG** (`Ergaenze`, `Waehle`,
`Trag`). `[read]` **Der vierte nicht — und das ist Absicht:** der
Katalog kennt die Zielrichtung nicht, der Nutzer kann nichts tun.
**Eine erfundene Handlung waere dort eine Luege.**

### A2 — 23514 wird zur Auskunft

`[cmd]` **`zielwerte-write.ts` faengt den Code** und ordnet ihn
ueber `hindernisAusFehler()` zu. `[read]` **Der Name wird aus der
Meldung GELESEN, nicht geraten** — findet sich keiner, bleibt es
ein Schreibfehler.

`[cmd]` **Und die Hindernispruefung steht VOR dem Auffangsatz** —
sonst faengt *,,Die Formel lieferte keine Zielkalorien"* sie
wieder alle ab. **Ein Waechter prueft die Reihenfolge.**

### A3 — die Gegenprobe ueber den ECHTEN Weg

`[cmd]` **Gemessen auf `test-user@lumeos.local`, 2026-09-28:**

    Phasen des Kontos                              0
    berechne_zielwerte gibt                        kcal 3090.3,
                                                   hindernis (leer)
    Funktionen mit keine_aktive_phase/…fehlt       0

`[read]` **Der Zustand *,,Nutzer ohne aktive Phase"* laesst sich
heute NICHT ueber die Datenbank herstellen** — **G-511 ist nicht
live** (`laufend_codex/…G-0511…md:36`: *,,Kein SQL aus G-511 wurde
live eingespielt"*). **Die zwei neuen Hindernisse gibt es in
`pg_proc` null Mal.**

`[cmd]` **Was ich statt dessen gemessen habe — und es traegt
mehr:** `goals.nutrition_targets` hat **acht CHECKs, die schon
heute `23514` werfen.**

`[cmd]` **Ein echter Verstoss, als `authenticated` mit
JWT-Claim ausgeloest:**

    insert … kcal=100
    -> ERROR: new row for relation "nutrition_targets" violates
       check constraint "nutrition_targets_kcal_check"

`[cmd]` **Diese ECHTE Meldung durch `hindernisAusFehler()`:**

    fremder CHECK (echte Meldung)  -> null   bleibt Schreibfehler
    G-511-Trigger-Meldung          -> keine_aktive_phase
      Satz: „Waehle eine Phase. Ohne sie gibt es kein
             Kalorienziel, weil die Phase das Tempo bestimmt."
    23505 (kein CHECK)             -> null

`[read]` **Beide Zweige belegt, einer davon an einer Meldung, die
aus der laufenden Datenbank kam.** `[read]` **Der Rueckfall ist
damit kein gedachter Fall** — es gibt heute acht CHECKs, die ihn
ausloesen.

`[read]` **Was offen bleibt:** der Vollnachweis *,,Nutzer ohne
Phase bekommt den Satz statt eines 500ers"* **ist erst am Tag der
G-511-Einspielung fuehrbar.** **Die Zuordnung steht vorher bereit
— genau dafuer ist sie gebaut.**

### A4 — die Grenze zu E-74, geprueft

`[cmd]` **E-74 gelesen** (`docs/entscheidungen/E-74-…md`).
**Verboten ist dort:** *,,aus diesen Daten eine eigene Diagnose
ableiten"*, *,,eine Therapie empfehlen"*, *,,einen Wert als
krankhaft bewerten"*.

`[read]` **Der Satz *,,Fuer diese Phase fehlt der Kalorienwert"*
tut nichts davon.** **Er sagt etwas ueber den eigenen
Datenbestand und fordert zum Ergaenzen auf** — **keine Bewertung,
keine Empfehlung, kein medizinischer Gegenstand.**

`[cmd]` **E-74 ist eine Entscheidung ueber MEDIZINISCHE Inhalte**
(Diagnosen, Behandlungen, Operationen). `[read]` **Ein fehlender
Kalorienparameter faellt nicht in ihren Gegenstand** — die
Begruendung steht als Kommentar an `hindernisSatz()`.

### A6/A7 — zwei Phasen haben KEIN Tagesziel

`[cmd]` **`PHASEN_OHNE_TAGESZIEL` und `ohneTageszielSatz()`:**

    peak_week          „Die Peak Week laeuft nach Protokoll, nicht
                        nach Tagesziel — Entladen, Laden, Natrium."
    expert_bb_annual   „Der Jahreszyklus ist eine Vorlage: er
                        erzeugt Phasen, und die tragen das Ziel."

`[cmd]` **Belegt:** `PHASE_MODELS.md:127-131` (Entladen 3 Tage,
Laden 2 Tage, Natrium) und `:167-173` (zwoelf Monate, je ein
Phasenname).

`[read]` **Der Unterschied zum Hindernis ist der TON** — **ein
Waechter prueft ihn:** diese zwei Saetze duerfen weder `fehlt`
noch `Fehler` noch eine Handlung enthalten. **Hier gibt es nichts
zu tun, und das ist richtig so.**

### Die Pruefung

`[cmd]` **`__tests__/g527-hindernisse.test.ts`, 8 Zusicherungen,
alle gruen.**

`[cmd]` **Sabotageprobe, vier Eingriffe, jeder von seiner eigenen
Zusicherung gefangen:**

    zwei Hindernisse teilen einen Satz   -> 1   ROT
    23514 wird nicht mehr gefangen       -> 5   ROT
    Auffangsatz vor der Hindernispruefung-> 6   ROT
    peak_week aus der Liste entfernt     -> 7   ROT
    alles zurueck                        -> 8/8 GRUEN

`[cmd]` **Rueckbau byteidentisch** (`cmp` gegen drei Sicherungen).

### Abgrenzung

`[cmd]` **Geaendert: `zielwerte-read.ts`, `zielwerte-write.ts`.**
`[cmd]` **Nichts in `supabase/`, keine Aenderung an
`berechne_zielwerte`.** `[cmd]` **Keine Parameterwerte je Phase im
Code** — **die einzige Zahl, die ich uebernommen habe, ist
`transitions_to`** (G-519, unsere eigene Spec).

`[cmd]` **Nicht committet.**

## Abhaengigkeit

`[read]` **Haengt an G-511**, aber nicht streng: die zwei neuen
Hindernisse gibt es erst, wenn G-511 live ist. **A1 und A2 lassen
sich vorher bauen** — sie kosten nichts, solange die Werte nie
auftreten, und verhindern den 500er am Tag der Einspielung.

## Nachtrag aus G-521, 2026-09-28

`[read]` **Die Peak Week ist kein Fall fuer eine Fehlermeldung,
sondern fuer einen eigenen Zustand.** Die Recherche (G-521, F6)
sagt: protokollgetrieben, ein Kalorienziel verliert dort seinen
Wert. Barakat et al. 2022 und Chappell et al. 2018.

**A6 (neu)** — `peak_week` darf die Kalorienpruefung nicht
durchlaufen. Nicht ,,Hindernis mit freundlichem Text", sondern
**ein Kennzeichen, dass diese Phase kein Tagesziel hat.** Sonst
sieht der Nutzer in der wichtigsten Woche seines Jahres eine
Fehlermeldung.

**A7 (neu)** — dasselbe gilt fuer `expert_bb_annual`: eine
Vorlage, die Phasen erzeugt, hat selbst kein Kalorienziel
(G-530).

## Abnahme

`[cmd]` **Gebaut und committet am 2026-09-28 in `0483f080`.**
Der volle `pnpm gate` lief dabei gruen, 30 Schritte.

### Was steht

`[cmd]` **Vier Hindernisse, vier Texte, aus EINER Funktion.**
`hindernisSatz()` (`zielwerte-read.ts:97`) bedient Lese- und
Schreibweg, damit sie nicht auseinanderlaufen.

`[read]` **Drei Texte nennen eine Handlung, der vierte bewusst
nicht:** bei `zielrichtung_ohne_faktor` kann der Nutzer nichts tun,
und eine erfundene Handlung waere dort eine Luege. **Das ist die
richtige Entscheidung** — ein Text, der zum Handeln auffordert, wo
nichts zu tun ist, schickt die Suche in die Irre (dieselbe Krankheit
wie der falsche Attrappengrund in G-422).

`[cmd]` **`23514` wird gefangen** (`zielwerte-write.ts:34`) und ueber
`hindernisAusFehler()` demselben Hindernis zugeordnet, das die
Leseseite kennt. Vorher: null Treffer auf `23514` in
`apps/web/src`, und ein ungefangener Datenbankfehler haette HTTP 500
ergeben — fuer eine Situation, die der Nutzer selbst aufloesen kann.

`[cmd]` **Die Hindernispruefung steht VOR dem Auffangsatz**, sonst
faengt der sie wieder alle ab. Ein Waechter prueft die Reihenfolge.

`[cmd]` **`peak_week` und `expert_bb_annual` sind kein Hindernis,
sondern ein Zustand** (`zielwerte-read.ts:136-146`), je mit eigenem
Satz. Ein Waechter prueft den TON: diese zwei Saetze duerfen weder
*fehlt* noch *Fehler* noch eine Handlung enthalten.

### Der Stellvertreterbeweis

`[read]` **A3 war nicht erfuellbar, und der Ersatz traegt mehr.** Der
verlangte Zustand — ein Nutzer ohne aktive Phase — existiert nicht,
solange G-511 gesperrt ist; die zwei neuen Hindernisse gibt es in
`pg_proc` null Mal.

`[cmd]` **Statt die Zeile offen zu lassen, wurde ein ECHTER `23514`
ausgeloest** — `goals.nutrition_targets` hat acht CHECKs, die schon
heute einen werfen (`kcal = 100`). Die echte Datenbankmeldung ging
durch die Zuordnung und kam korrekt als `null` zurueck, blieb also
ein Schreibfehler. **Beide Zweige belegt, einer an einer Meldung aus
der laufenden Datenbank.**

`[cmd]` **Die acht CHECKs habe ich unabhaengig gemessen** — sie
existieren.

### Meine eigene Gegenprobe

`[cmd]` Nicht die gemeldete geglaubt, sondern gefahren:

    unveraendert                    GRUEN  pass=26 fail=0
    sabotiert zielwerte-write.ts    ROT    pass=25 fail=1
    sabotiert phase-regeln.ts       ROT    pass=24 fail=2
    nach Wiederherstellung          GRUEN  pass=26 fail=0

Beide Dateien byteidentisch wiederhergestellt, sha256 belegt.

### Was offen bleibt

`[read]` **A3 vollstaendig erst am Tag, an dem G-511 live geht.**
Dann muss ein Nutzer ohne aktive Phase den Satz sehen und keinen
500er. **Diese Zeile gehoert in den Auftrag, der G-511 einspielt** —
nicht hierher zurueck.
