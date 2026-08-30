# G-211 — Claude Code, 2026-08-27

Auftrag: `docs/auftraege/g-211-claude-code.md`

**Der Erfassungsweg steht. „Scemblix" eintragen landet auf
`drug_0642bd1e2f`, „Concor" geht als Freitext durch — und sagt, was
das kostet.**

---

## 1 · Die Zahlen — drei Abweichungen

| | Auftrag | Gemessen |
|---|---|---|
| Spalten `user_medications` | 21 | **21** |
| Zeilen | 2 | **2** |
| Freitextspalten | `name`, `indication`, `notes` | **dieselben drei** |
| **Regeln, die Medikamente lesen** | **31** | **30** |
| **Schreibstellen in `apps/web`** | **3** | **1**, und die liest nur |
| Wirkstoffe / Marken | 498 / 428 | **498 / 428** |

### Die 31 sind 30 — und sie lesen etwas anderes, als der Auftrag sagt

`[cmd]` **Gemessen ueber `supplements.rule_catalog.input_paths`,
2026-08-27:**

    medications                          20 Regeln
    medical.medications[].drug_class      9
    medical.medications[].cyp_profile     1
                                         ──
                                         30

`[cmd]` **Und die Regeln stehen nicht in `medical`.** Der Auftrag
nennt *„medical.rule_definitions"* — die Tabelle gibt es nicht.
Gefunden habe ich `supplements.rule_catalog` (64 Zeilen) und
`wissen.rule_engine_rules` (64). **`modules_involved` sagt:
medical 48, supplements 31** — *die 31 sind die Supplements-Regeln,
nicht die Medikamentenregeln.*

`[read]` **Der wichtigere Fund ist aber nicht die Zahl, sondern der
Weg.** **Keine einzige Regel liest `active_substance_id`.** Sie lesen
`drug_class` und `cyp_profile` — **und das sind Spalten auf
`user_medications` selbst, nicht auf dem Katalog.**

`[cmd]` **Die Kette ist also mittelbar:**

    Zuordnung → drug_class + cyp_profile aus dem Katalog kopiert
              → auf die Zeile geschrieben
              → DIESE Felder trifft eine Regel

`[read]` **Das aendert, was der Schreibweg tun muss.** Es genuegt
nicht, `active_substance_id` zu setzen — **die beiden Arrays muessen
mitgeholt werden**, sonst ist die Zuordnung dekorativ. Genau das tut
`katalogFelder()`, und ein Test bewacht es.

`[cmd]` **Gegengeprobt am Nachweislauf:** der Scemblix-Eintrag traegt
`{CYP2C9_inhibitor, CYP2C8_inhibitor, CYP3A4_inhibitor,
CYP3A4_substrate, tki}`, der Concor-Eintrag `{}`.

### Die 3 Schreibstellen sind 1 — und die schreibt nicht

`[cmd]` **In `apps/web/src` gab es vor diesem Auftrag genau EINE
Fundstelle von `user_medications` im Code** — `page.tsx:104`, ein
`select`. **Die anderen zwei sind Kommentare** (`tab-tracking.tsx:40`
und `wirkstoff-tafel.tsx:479`), einer davon der Satz *„C-285 ist
unentschieden"* aus G-208.

`[read]` **Es gab also nichts zu buendeln, sondern etwas zu
verhindern.** Die Naht ist trotzdem gebaut — und per Test bewacht,
damit sie haelt.

### Und `cyp_profile` ist duenn

`[cmd]` **Nur 22 der 498 Wirkstoffe tragen `cyp_profile`**,
`drug_class` dagegen alle 498. `[read]` **Auch eine korrekte
Zuordnung garantiert damit nicht, dass die CYP-Regel greifen kann** —
sie ist die Voraussetzung, nicht die Zusage. Das gehoert in die
Erwartung an C-310.

---

## 2 · Was gebaut ist

    apps/web/src/lib/medical/medikament-eingabe.ts    Regeln, dritter
                                                     Zustand (serverfrei)
    apps/web/src/lib/medical/medikament-write.ts      DIE Schreibstelle
    apps/web/src/app/v2/medical/medikament-aktionen.ts   vier Serveraktionen
    apps/web/src/app/v2/medical/medikament-formular.tsx  das Formular
    apps/web/src/app/v2/medical/tab-tracking.tsx      Liste, Ändern, Absetzen
    apps/web/src/app/v2/medical/{page,echtdaten}.ts   `active_substance_id`
    .../__tests__/medikament-eingabe.test.ts          23 Tests

`[cmd]` **`active_substance_id` wurde gar nicht gelesen.** Weder
`MedikationEcht` noch die Abfrage in `page.tsx` fuehrten die Spalte —
**das Feld, an dem der ganze Auftrag haengt, kam nie in der
Oberflaeche an.** Beide ergaenzt.

### Der Knopf ist frei

`[cmd]` **Hier stand `InEntwicklungKnopf`** mit der Begruendung, die
zehn Ueberwachungsspalten fehlten. `[read]` **Sie fehlen weiter** —
`monitoring`, `next_due`, `monitoring_overdue` und sieben andere.
**Aber das war nie ein Grund gegen die Erfassung**, sondern gegen die
Ueberwachungskachel, und die traegt ihre Marke selbst. **Wer ein
Medikament eintragen will, wartet sonst auf zehn Spalten, die er nicht
braucht.**

---

## 3 · Die Verknuepfung — der Kern

**Auftrag: *„Wer Scemblix eintraegt, muss auf `drug_0642bd1e2f`
landen."***

`[cmd]` **Gemessen im Browser, `test-user@lumeos.local`:**

    Eingabe „Scemblix" → Vorschlag „Asciminib"
                          „Scemblix ist ein Handelsname von Asciminib"
    gewaehlt            → „Zugeordnet — die Wechselwirkungsregeln
                          prüfen diesen Eintrag."
    in der Datenbank    → active_substance_id = drug_0642bd1e2f
                          drug_class = {CYP2C9_inhibitor, …, tki}

`[read]` **Die Wirkstoffsuche steht OBEN, das Namensfeld darunter** —
die Reihenfolge ist die Empfehlung. **Der Name wird vorbelegt, nicht
erzwungen:** wer Scemblix nimmt, darf *„Scemblix"* schreiben, auch
wenn der Wirkstoff Asciminib heisst.

`[cmd]` **Die Suche ist die aus G-210**, mit einem Unterschied: **hier
gilt eine Deckelung auf 8 Vorschlaege.** `[read]` G-176 hat sie im
Katalog entfernt, weil ein Katalog zum Blaettern da ist — **eine
Auswahlliste ist es nicht.**

---

## 4 · Der dritte Zustand

**Auftrag: *„Hier ist es ein dritter Fall: nicht zugeordnet — und er
hat eine Folge, nicht nur eine Anzeige."***

`[cmd]` **Gemessen im Browser:**

    Eingabe „Concor" → „Kein Wirkstoff und kein Handelsname passt zu
                        ‚Concor'. Trag den Namen unten trotzdem ein —
                        der Katalog kennt keine deutschen
                        Handelsnamen."
    nach dem Anlegen → „Ohne Wirkstoff aus dem Katalog. Dieser Eintrag
                        wird von keiner Wechselwirkungsregel geprüft.
                        Er bleibt in deiner Liste — die automatische
                        Prüfung übergeht ihn."
                       „Das heisst nicht, dass du etwas falsch gemacht
                        hast: der Katalog führt keine deutschen
                        Handelsnamen."
    ueber der Liste  → „1 von 2 Einträgen ist keinem Wirkstoff
                        zugeordnet und wird von den
                        Wechselwirkungsregeln übergangen."

`[read]` **Warnfarbe, nicht Fehlerfarbe, und kein Vorwurf.** Der
Eintrag ist richtig und vollstaendig; unvollstaendig ist der Katalog.
**Derselbe Ton wie das Leerergebnis aus G-210.**

`[read]` **Der Unterschied zu G-208 steht im Kopf der Datei:** dort
waren *begruendet leer* und *nicht bearbeitet* Aussagen ueber den
DATENBESTAND. **Hier ist es eine Aussage ueber die WIRKUNG** — und
deshalb steht die Folge im Satz, nicht der Zustand.

---

## 5 · Die eine Schreibstelle

**Auftrag: *„Alle Schreibzugriffe durch genau eine Stelle fuehren."***

`[cmd]` **`medikament-write.ts` ist die Stelle**, und ein Test zaehlt
alle `.tsx?`-Dateien unter `src/`, die `from('user_medications')` mit
`insert`/`update`/`upsert`/`delete` verbinden. **Soll: genau eine.**

`[cmd]` **Gegengeprobt durch Sabotage:** eine zweite Datei angelegt,
die daneben schreibt →

    not ok 257 - G-211: genau EINE Datei schreibt auf `user_medications`
    # pass 714  # fail 1

Rueckbau byteidentisch, SHA-256 `2444577c0dae…d426`.

### Der Kommentarblock

`[read]` **Er nennt vier Dinge**, und ein Test prueft sie: den Verweis
auf `SICHERHEIT.md`, die Entscheidung `C-285`, **die drei
Freitextspalten namentlich** (`name`, `indication`, `notes`) und die
vier Kippbedingungen.

`[cmd]` **Punkt 3 der Kippliste trifft genau diese Datei** — *„echte
Medikamente statt Seed-Daten"*. `[read]` **Der Erfassungsweg ist die
Einladung dazu.** Das steht so im Kopf, damit es niemand uebersieht.

`[read]` **Und warum der Rest klar bleibt, steht auch dort:** 30 der
64 Regeln lesen `drug_class` und `cyp_profile`. **Wer die
verschluesselt, schaltet die Regelauswertung ab** — SICHERHEIT.md sagt
dasselbe.

**Keine Verschluesselung gebaut.** SICHERHEIT.md begruendet es
selbst: *„Verschluesselte Spalten mit dem Schluessel im selben System
sehen nach Schutz aus und sind kaum einer."* **Die Frage *vor wem
schuetzt es* ist nicht beantwortet.**

---

## 6 · Absetzen ist kein Loeschen

`[cmd]` **Gemessen:** nach dem Absetzen steht die Zeile weiter da —
`is_active = f`, `end_date = 2026-08-20`, `start_date` und alle
uebrigen Werte unveraendert.

`[cmd]` **`authenticated` HAT das DELETE-Recht**, und es gibt eine
`user_medications_delete`-Policy. `[read]` **Der Schreibweg benutzt
beides nicht** — nicht weil es unmoeglich waere, sondern weil es die
falsche Handlung ist. **Ein Test prueft, dass `.delete(` dort nicht
vorkommt.**

`[read]` **Die Gegenrichtung gibt es auch** — *„Wieder aufnehmen"*,
sonst waere Absetzen doch endgueltig, nur ohne `delete`.

`[read]` **Und der Satz steht VOR dem Klick, nicht danach:** *„Der
Eintrag bleibt in deiner Liste. Was du genommen hast, erklärt spätere
Laborwerte."*

---

## 7 · `drug_class` ist aus der Anzeige verschwunden

**Auftrag: *„`drug_class` nicht anzeigen — C-296."***

`[cmd]` **Es wurde angezeigt** — `tab-tracking.tsx` hatte eine
Pill-Reihe *„Classes"*. **Entfernt**, per Test bewacht, im
Bildschirmfoto gegengezaehlt (`klassen: 0`).

`[read]` **Die Spalte wird weiter GESCHRIEBEN**, und das ist kein
Widerspruch: 9 der 30 Regeln lesen sie. **Sie wird nur nicht mehr als
Auskunft gezeigt.** `[cmd]` Der Grund aus G-208: die Spalte fuehrt
`MAOI` (15) und `maoi` (15) nebeneinander, und sechs SSRI tragen
gleichzeitig `MAOI`.

`[cmd]` **`cyp_profile` bleibt sichtbar** — es traegt keine
Fallverdopplung und ist bei 22 Wirkstoffen gefuellt.

---

## 8 · NACHWEIS

| | |
|---|---|
| Anlegen mit Katalogtreffer | `active_substance_id = drug_0642bd1e2f`, `drug_class` mit 5 Tags |
| Anlegen ohne Treffer | Eintrag da, Bindung leer, `drug_class {}`, **Folge benannt** |
| Ändern | `indication` neu, Menge 40 mg und `start_date` unverändert |
| Absetzen | `is_active f`, `end_date 2026-08-20`, **Zeile bleibt** |
| Schreibstellen im Code | **1** (Soll 1), per Test und Sabotage belegt |
| Attrappen im neuen Code | **0** (Soll 0) |
| Bildschirmfoto je Zustand | `backup/g211-anlegen-treffer.png`, `-anlegen-freitext.png`, `-absetzen.png`, `-liste.png` |

### Gates

    Tests            715 pass / 0 fail   (23 davon G-211)
    Typecheck        gruen
    Build            31/31 Routen
    serverimport     51 Client-Chunks, 0 Treffer  (A-30 gehalten)
    verdrahtung      kein unbewachter Zuwachs
    encoding         20.199 Dateien sauber

`[cmd]` **Rueckbau der Nachweiszeilen gezaehlt:** 4 → 2,
`dev@lumeos.app` unveraendert bei 1. **Alle schreibenden Nachweise
liefen auf `test-user@lumeos.local`.**

---

## 9 · NEGATIVPROBE — strukturell ausgeschlossen

**Auftrag: *„Pruef, ob ein Fremdschluessel das schon erzwingt — dann
ist der Befund ‚strukturell ausgeschlossen' das Ergebnis. Kein
Constraint loesen."***

`[cmd]` **Er erzwingt es:**

    FOREIGN KEY (active_substance_id)
      REFERENCES medical.medication_active_substances(id)
      ON DELETE RESTRICT

`[cmd]` **Beide Wege abgewiesen** — Einfuegen mit
`drug_GIBTESNICHT` und Aendern auf `drug_AUCHNICHT`, je
`violates foreign key constraint`. **Zeilen unveraendert, kein
Constraint geloest.**

`[cmd]` **Und die Gegenzaehlung:** Eintraege, deren
`active_substance_id` auf einen nicht existierenden Wirkstoff zeigt —
**0.** Es faellt nichts auf einen falschen Wirkstoff.

`[read]` **Der Schreibweg prueft trotzdem selbst.** `katalogFelder()`
wirft `VALIDATION_FAILED` mit einem deutschen Satz, bevor die
Datenbank ihre englische Meldung schickt. **Zweiter Grund:** er muss
den Katalog ohnehin lesen, um `drug_class` zu holen — **die Pruefung
kostet nichts extra.**

`[cmd]` **Weitere Constraints, alle gegengeprobt:**
`name_check` (leerer Name), `user_medications_check` (`end_date`
vor `start_date`), `dose_amount_check`, `doses_per_day_check` —
**alle vier weisen ab.** Die Eingabepruefung bildet sie ab, um
deutsche Saetze am Feld zeigen zu koennen; **die Datenbank bleibt die
letzte Instanz, nicht die erste.**

---

## 10 · Was NICHT getan wurde

**Keine Verschluesselung gebaut** — C-285, SICHERHEIT.md.
**Keine Tabelle angelegt**, `supabase/_pipeline/` nicht angefasst
(C-310).
**`drug_class` nicht angezeigt** (C-296) — und die bestehende Anzeige
entfernt.
**Keine Marken erfunden oder abgeleitet.**
**Kein Constraint geloest.**
**Nicht committet, nicht gestaged, nicht gepusht.**

---

## 11 · Was mir aufgefallen ist

**1. Die Regeln lesen `drug_class`, und `drug_class` ist kaputt.**
`[cmd]` 9 der 30 Regeln haengen an einer Spalte, die `MAOI` und
`maoi` nebeneinander fuehrt und sechs SSRI gleichzeitig als MAO-Hemmer
(G-208). `[read]` **Das ist mehr als ein Anzeigeproblem:** eine
Regel, die auf `maoi` prueft, trifft die Haelfte ihrer Faelle nicht —
und eine, die auf `MAOI` prueft, trifft sechs SSRI zu Unrecht.
**C-296 ist damit nicht kosmetisch, sondern eine Frage der
Regelrichtigkeit.**

**2. `cyp_profile` ist bei 22 von 498 gefuellt.** `[read]` Eine
CYP-Regel kann heute fast nie greifen. **Das gehoert in die Erwartung
an C-310**, sonst sieht der Erfassungsweg funktionsfaehig aus und
liefert trotzdem keine Warnungen.

**3. `active_substance_id` wurde nie gelesen.** `[cmd]` Weder in
`page.tsx` noch im Typ. `[read]` **Das Feld existierte seit C-130 und
kam in keiner Oberflaeche an** — ein stiller Fall der Sorte, die
`tools/verdrahtung-pruefen.mjs` fuer Tabellennamen faengt, fuer
Spalten aber nicht.

**4. Die zehn Ueberwachungsspalten fehlen weiter.** `monitoring`,
`monitoring_frequency`, `last_test`, `next_due`, `monitoring_overdue`,
`targets`, `side_effects`, `physician`, `rx`, `prescription_ref`.
`[read]` **Die Kachel darueber traegt ihre Marke** — sie ist nicht
Teil dieses Auftrags, aber sie bleibt der Grund, warum vier der sechs
Kopfwarnungen erfunden sind.

**5. Das DELETE-Recht steht offen.** `[cmd]` `authenticated` hat es,
mit Policy. `[read]` **Heute benutzt es niemand** — aber es ist der
Weg, auf dem *„Absetzen ist kein Loeschen"* umgangen werden kann,
ohne dass ein Test es merkt. **Ein Punkt fuer die Rechtevergabe, kein
Fehler von heute.**
