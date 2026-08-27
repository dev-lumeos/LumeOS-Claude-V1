# G-138 — Claude Code, 2026-08-27

Auftrag: `docs/auftraege/g-138-claude-code.md`

**Die Praemisse traegt nicht: der Schreibweg existiert seit G-148,
und die Snapshots sind korrekt eingefroren. Was fehlte, war ein
Knopf — `LogDoseModal` stand hinter dem Extended-Gate.**

---

## 1 · Die Zahlen — und die Praemisse

| | Auftrag | Gemessen |
|---|---|---|
| `im_katalog` sichtbar | 412 | **412** |
| `intake_logs` | 744 | **744** |
| `user_stacks` | 3 | **3** |
| `stack_items` | 11 | **11** |
| **„niemand kann eine Einnahme eintragen"** | — | **falsch** |

`[cmd]` **Die 744 teilen sich auf drei Konten:** `tom.seed` 360,
`dev@lumeos.app` 360, `test-user@lumeos.local` **24**. Der Auftrag
sagt *„die 360 im Punkt sind dev allein"* — das stimmt.

### Die Praemisse ist eine Woche alt und ueberholt

**Auftrag: *„Miss zuerst, was davon traegt."*** — Ich habe gemessen,
und es traegt fast alles:

`[cmd]` **`erfasseEinnahme()` in `stack-write.ts:115` existiert**,
schreibt beide Status, friert alle vier Snapshots ein und prueft auf
null Zeilen (G-79). **`LogDoseFenster` und `SkipFenster` in
`modale.tsx` existieren** und rufen die Route auf.

`[cmd]` **Gegengeprobt am laufenden System, `test-user@lumeos.local`:**

    POST /api/supplements/intake  status taken    -> 201
    POST /api/supplements/intake  status skipped  -> 201

**Beide Zeilen mit allen vier Snapshots.** Das Modul rechnet also
nicht *„aus Daten, die nur ein Seed-Skript erzeugen kann"* — der Weg
war da, er war nur schwer erreichbar.

`[read]` **Der Punkt stammt aus einer Komponentenzaehlung** — *„16 von
68 fehlen"* —, und die zaehlte Namen aus der Vorlage gegen Namen im
Code. `LogDoseModal` heisst hier `LogDoseFenster`. **Die Zaehlung
fand den Namen nicht und schloss auf eine Luecke.**

---

## 2 · Der eigentliche Nachweis: die Snapshots sind eingefroren

**Auftrag: *„Dosis im Stack aendern, alte Einnahme muss unveraendert
bleiben. Faellt sonst erst Monate spaeter im Echtbetrieb auf."***

`[cmd]` **Gemessen 2026-08-27, Creatine monohydrate:**

    Stack-Dosis vorher        5.000 g
    zwei Einnahmen gebucht    dose_snapshot 5.000 g  (beide)

    Stack-Dosis auf 10 gesetzt → Stack zeigt 10.000

    dieselben zwei Einnahmen  dose_snapshot 5.000 g  (UNVERAENDERT)

    Stack-Dosis zurueck auf 5.000

**Die Probe faellt richtig aus.** `[cmd]` Der Grund steht im Code:
`stack-write.ts` liest `dose`, `dose_unit` und den Namen aus
`stack_items` **zum Zeitpunkt des Schreibens** und setzt sie in den
Insert — sie werden nirgends beim Lesen nachgeschlagen.

`[read]` **Und der Lesezugriff ist zugleich die Rechtepruefung:**
`stack_items` haengt ueber `user_stacks.user_id` an RLS. Wer eine
fremde Id schickt, bekommt keine Zeile — **NOT_FOUND, bevor
irgendetwas geschrieben wird.**

`[cmd]` **Vier Waechter dafuer**, und alle drei Sabotagen fallen
(siehe Abschnitt 6).

---

## 3 · Eine Naht mit zwei Enden, nicht zwei Naehte

**Auftrag: *„Pruef, ob das zwei Naehte sind oder eine mit zwei
Enden, und sag es."***

**Es ist eine Naht mit zwei Enden.**

`[cmd]` **`api/supplements/intake/route.ts` enthaelt keinen einzigen
`.from(`-Aufruf.** Sie uebersetzt HTTP, waehlt zwischen `einnahme`
und `position` und ruft `erfasseEinnahme()` / `entferneEinnahme()`
auf. **Der Datenbankzugriff liegt ausschliesslich in
`stack-write.ts`.**

`[cmd]` **Gezaehlt ueber alle `.tsx?` unter `src/`:** genau **eine**
Datei verbindet `from('intake_logs')` mit
`insert`/`update`/`upsert`/`delete`. **Zwei Tests halten das fest** —
einer zaehlt die Schreiber, einer prueft, dass die Route
datenbankfrei bleibt.

`[read]` **Damit gilt hier dieselbe Zusage wie in G-211**, ohne dass
etwas umgebaut werden musste: **wenn die Freitextspalten spaeter
verschluesselt werden, ist es eine Stelle.**

---

## 4 · Was wirklich fehlte

### „Log dose" war hinter dem Extended-Gate

`[cmd]` **`open('logDose', …)` gab es an genau einer Stelle:**
`tab-extended.tsx:495`. `[cmd]` Der Extended-Tab ist ab
Erfahrungsgrad **pro/elite** freigeschaltet (G-167).

`[read]` **Wer Uhrzeit oder eine abweichende Menge erfassen wollte,
kam nicht hin.** Im Today-Tab gab es nur *„Mark taken"* — ein Klick,
der sofort bucht, **ohne Zeit, ohne abweichende Menge, ohne Notiz.**

`[read]` **Das ist die Luecke, die der Punkt gemeint hat, nur an
anderer Stelle als er dachte.** Der Schreibweg fehlte nicht, sein
Zugang fehlte.

**Behoben:** *„Log dose"* steht jetzt neben *„Mark taken"* und
*„Skip"*. **Beide nebeneinander, nicht statt einander** — der
schnelle Weg bleibt der erste, der genaue steht daneben.

### „Skip" verlor die Position

`[cmd]` **Der Aufruf lautete `open('skip', { name: p.name })`** —
**ohne `id`**, obwohl `p.id` an der Stelle vorliegt.

`[read]` **Das Fenster faellt dann auf seine Auswahlliste zurueck**,
und der Nutzer muss die Position noch einmal suchen, die er gerade
angeklickt hat. **Behoben**, beide Fenster bekommen `id` mit —
gegengeprobt: `vorbelegt: true`.

### Eine unbrauchbare Id ergab 500 statt 400

`[cmd]` **Gemessen 2026-08-27:** `stack_item_id: "x"` →

    HTTP 500  {"error":"invalid input syntax for type uuid: \\"x\\"",
               "code":"WRITE_FAILED"}

`[read]` **Falscher Code und ein Leck.** 500 heisst *„der Server hat
einen Fehler"* — hier hat der Aufrufer einen. **Und die
durchgereichte Postgres-Meldung verraet Typ und Spalte** an eine
Stelle, die das nichts angeht.

**Behoben:** eine UUID-Pruefung neben der bestehenden Datumspruefung,
`VALIDATION_FAILED` → HTTP 400.

---

## 5 · Der dritte Zustand: moeglich, aber nicht erreichbar

**Auftrag: *„Was passiert, wenn jemand eine Einnahme fuer ein
Stack-Item eintraegt, das inzwischen `is_active = false` ist? Nicht
verhindern, sondern benennen — falls es ueberhaupt vorkommen kann."***

`[cmd]` **Gemessen 2026-08-27:**

    Positionen gesamt                     11, davon aktiv  11
    Einnahmen auf inaktive Positionen      0
    Einnahmen ohne Position (null)         0
    Insert auf eine inaktive Position      geht durch — kein Check

`[cmd]` **Die Datenbank erlaubt es, die Oberflaeche nicht.**
`stack-read.ts:373` filtert `.eq('is_active', true)`; beide Fenster
waehlen ausschliesslich aus `daten.positionen`. **Kein Weg fuehrt
hin.**

`[read]` **Deshalb steht der Hinweis im Leseweg und nicht in der
Oberflaeche.** Ein Zustand, den kein Weg erzeugen kann, waere dort
tote Anzeige — **anders als bei G-211, wo der Freitextfall taeglich
vorkommt.** Ein Test bewacht den Filter: **wer ihn loest, hebt die
Zusage auf und braucht dann eine Anzeige dafuer.**

`[read]` **Das ist ein Unterschied zu G-211, den ich nennen will:**
dort hat der dritte Zustand eine Folge fuer den Nutzer, hier ist er
eine Zusicherung des Lesewegs. **Dieselbe Frage, zwei verschiedene
richtige Antworten.**

---

## 6 · NACHWEIS

| | |
|---|---|
| Einnahme eintragen | **201**, alle vier Snapshots gesetzt |
| Auslassen eintragen | **201**, `status skipped`, unterscheidbar |
| **Snapshot eingefroren** | **Stack 5 → 10, Einnahmen blieben 5.000 g** |
| Compliance vorher/nachher | **83,3 % · 91,7 %** → dazu **100 %** für Omega-3 |
| Schreibstellen im Code | **1** — eine Naht mit zwei Enden |
| Attrappen im neuen Code | **0** |
| Rückbau | **744 → 744**, `dev` unverändert bei **360** |
| Bildschirmfoto | `backup/g138-logdose.png`, `-skip.png`, `-today-vorher/-nachher.png`, `-compliance-vorher/-nachher.png` |

`[cmd]` **Die Compliance-Zahl kommt aus einer echten Eingabe:** vor
der Buchung fuehrte der Reiter zwei Zeilen (83,3 % und 91,7 %),
danach eine dritte mit **100 %** — Omega-3, das vorher keine Einnahme
hatte. **Nach dem Rueckbau ist der Stand wieder wie vorher.**

`[cmd]` **Die gebuchte Zeile im Nachweislauf:**

    2026-08-27 · 07:15 · taken · Omega-3 (EPA/DHA)
    dose_snapshot 2.000 g · actual_dose 3.000 g · manual

**Die abweichende Menge (3 g) steht neben der eingefrorenen
Stack-Dosis (2 g)** — genau dafuer sind die Spalten da.

### Gates

    Tests            726 pass / 0 fail   (11 davon G-138)
    Typecheck        gruen
    Build            31/31 Routen
    serverimport     51 Client-Chunks, 0 Treffer  (A-30 gehalten)
    verdrahtung      kein unbewachter Zuwachs (44 → 46 bewachte Namen)
    encoding         20.208 Dateien sauber

### Die Waechter fallen wirklich

`[cmd]` **Drei Sabotagen, je einzeln, je zurueckgerollt:**

    dose_snapshot aus der Eingabe   → not ok 553 (Snapshots)
    zweite Schreibstelle            → not ok 551 (Naht)
    „Log dose" wieder entfernt      → not ok 558 + 559

**Alle drei Rueckbauten byteidentisch**, SHA-256 geprueft:
`stack-write` `3ecd7babb062…4008`, `tabs` `fd05b73fe6f4…0f0d`.

---

## 7 · Was NICHT getan wurde

**Keine Tabelle angelegt**, `supabase/_pipeline/` nicht angefasst
(C-313b).
**Die 50er-Grenze im Katalog nicht angefasst** (G-176).
**Keine Reiter ergaenzt** (G-186).
**Nur `LogDose` und `LogSkip`** — `AddSupplementModal`,
`PlanCycleModal` und `ReorderModal` nicht angefasst.
**Nichts auf `dev@lumeos.app` gespeichert**, alle schreibenden
Nachweise auf `test-user@lumeos.local`, Rueckbau gezaehlt.
**Nicht committet, nicht gestaged, nicht gepusht.**

---

## 8 · Was mir aufgefallen ist

**1. Der Punkt zaehlte Namen, nicht Faehigkeiten.** `[read]` *„16 von
68 Komponenten fehlen"* verglich Vorlagennamen mit Codenamen —
`LogDoseModal` heisst hier `LogDoseFenster`. **Die uebrigen 14 sollten
auf dieselbe Weise nachgeprueft werden, bevor daraus Auftraege
werden.** Es kann gut sein, dass mehr davon existiert, als die Liste
sagt.

**2. „Mark taken" und „Log dose" buchen verschieden.** `[cmd]` Der
Schnellweg setzt weder `intake_time` noch `actual_dose`. `[read]`
**Das ist richtig so** — aber es heisst, dass die Uhrzeit bei den
meisten Zeilen fehlt. **Wer spaeter „wann am Tag" auswerten will,
rechnet auf duennem Bestand.**

**3. Der Skip-Grund landet in `notes`.** `[cmd]` `intake_logs` hat
keine eigene Spalte dafuer; das Fenster verkettet *„Grund — Notiz"*.
`[read]` **Auswertbar ist das nur ueber Textsuche.** Für eine
Statistik *„warum wird ausgelassen"* braeuchte es eine Spalte — **ein
Befund fuer C-313b, kein Mangel dieses Fensters.**

**4. `intake_logs.stack_item_id` ist `ON DELETE SET NULL`.** `[cmd]`
Wer eine Stack-Position loescht, behaelt die Einnahmen — **ohne
Bindung, aber mit Snapshot.** `[read]` **Das ist genau richtig
gebaut:** die vier Snapshot-Spalten sind der Grund, warum die Zeile
danach noch etwas aussagt. **Heute betrifft es 0 Zeilen.**

**5. Der Dev-Server war beim Start weg** (G-205), einmal neu
gestartet, danach stabil ueber alle Laeufe.
