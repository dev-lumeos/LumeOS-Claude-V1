---
nr: G-578
typ: fehler
modul: medical
schwere: hoch
angelegt: 2026-10-01
commit: 31ebb74e
erledigt: 2026-10-02
beauftragt: 2026-10-01
agent: claudecode

braucht: [G-535, G-555, G-571]
kind_von: G-571

quellen:
  - docs/punkte/erledigt/quer-g-0571-sechs-schreibwege-ohne-aufrufer.md
  - docs/punkte/erledigt/quer-g-0535-sechs-funktionen-lesen-den-alten-sitzungsnamen.md
  - docs/punkte/erledigt/quer-g-0555-derselbe-ladefehler-verschluckt-zwei-weitere-module.md

beruehrt:
  tabellen: []
  dateien:
    - apps/web/src/app/v2/medical/tab-biomarker.tsx
    - apps/web/src/app/v2/medical/import-zuordnung.tsx
    - apps/web/src/app/v2/medical/dokumente-aktionen.ts
    - apps/web/src/lib/fehler/ladefehler.ts

zahlen:
  gemessen: 2026-10-01
  funktionen_ohne_aufrufer: 3
---

# Der Laborimport hat drei Datenbankfunktionen und keine Oberflaeche

## Auftrag — Kopf

    AUFTRAG FUER Claude Code - G-578: der Laborimport bekommt seinen
                                     Aufrufer
    Bereich: apps/web/src/app/v2/medical/
             apps/web/src/lib/medical/
             apps/web/src/lib/fehler/ladefehler.ts
    Fremd:   supabase/ gehoert Codex (A-88 laeuft dort). Die Tabellen
             und die drei Funktionen sind fertig - sie werden
             aufgerufen, nicht geaendert. docs/ gehoert dem
             Orchestrator, auch diese Punktdatei: der Bericht kommt
             als Antwort, nicht als Anhang hier.
    Stand:   2026-10-01

**Zuerst lesen, vollstaendig:** diese Datei,
`docs/punkte/erledigt/quer-g-0571-sechs-schreibwege-ohne-aufrufer.md` (die
Entscheidung steht unten in jener Datei) und
`supabase/_pipeline/00_querschnitt/535_auth_uid_legacy_readers.sql` ab
Zeile 135 — dort stehen die Signaturen, gegen die du schreibst.

## Der Befund

`[cmd]` **Drei Funktionen, null Aufrufer**, gezaehlt in `apps/web/src`
und `packages/` ohne Tests. Der einzige Treffer im ganzen Produkt ist
ein Kommentar in `apps/web/src/app/v2/medical/katalog-suche.tsx`.

    medical.import_lab_report_rows        535_auth_uid_legacy_readers.sql:135
      Signatur: (UUID, DATE, TIME, TEXT, TEXT, TEXT, JSONB)
      zuerst gebaut in 14_medical/142_laborimport_matching.sql:191
      GRANT EXECUTE an authenticated und service_role
    medical.start_lab_report_ocr          535_auth_uid_legacy_readers.sql:287
    medical.store_lab_report_ocr_result   535_auth_uid_legacy_readers.sql:327

`[cmd]` **Die halbe Oberflaeche steht schon, und das ist der Grund, warum
dieser Punkt klein ist:**

    import-zuordnung.tsx:33   ImportZuordnung({ werte: BefundWert[] })
                              liest zuordnung() aus lib/medical/befund
                              - eine ANZEIGE, sie schreibt nichts
    dokumente-aktionen.ts     originalHochladen / originalEntfernen /
                              originalOeffnen - der Dateiweg existiert
    tab-biomarker.tsx:430     MedImportReferenz unter dem Trenner

`[read]` **Es fehlt also nicht die Ansicht und nicht der Upload, sondern
der Weg vom hochgeladenen Original zur gespeicherten Zeile.** Zuordnen
kann der Nutzer heute auf dem Schirm, uebernehmen kann er nichts.

`[cmd]` **Und die Meldung aus G-535 hat seit G-555 einen Ort, aber noch
keinen Text:** `medical import: user mismatch` mit `P0001`.
`apps/web/src/lib/fehler/ladefehler.ts` liegt seit Commit `bec132b6`
querliegend und nimmt den Modultitel als Parameter — **dort gehoert der
Text hin, nicht in einen medical-eigenen Zweig.**

## Auftrag

**A1 — der Uebernahmeweg.** Aus den zugeordneten Werten der
`ImportZuordnung` wird ein Aufruf von `medical.import_lab_report_rows`.
`[read]` **Die Signatur ist gegeben, nicht zu erfinden:** sieben
Parameter, der letzte ein `JSONB` mit den Zeilen. **Melde, welche
Parameter die Oberflaeche heute schon hat und welche sie erfinden
muesste** — ein erfundener Wert ist ein Befund, keine Loesung.

**A2 — die beiden OCR-Funktionen gehoeren an den Dateiweg**, nicht an
die Zuordnung: `start_lab_report_ocr` nach dem Upload,
`store_lab_report_ocr_result` fuer das Ergebnis. `[read]` **Wenn der
OCR-Dienst nicht existiert, ist das ein Befund und kein Grund, einen zu
bauen** — dann steht der Aufruf an der Stelle, an der er hingehoert, und
du meldest, was dahinter fehlt. **Nichts behaupten, was nicht laeuft.**

**A3 — `P0001` und `medical import: user mismatch` bekommen einen Text**
in `lib/fehler/ladefehler.ts`. `[cmd]` Heute: null Treffer auf beides in
`apps/web/src/lib`. **Der Text sagt, was der Nutzer tun kann** — nicht
den Postgres-Fehler durchlassen.

**A4 — ein Waechter, der den Aufrufer haelt.** `[read]` **Genau das ist
hier die Fehlerklasse:** sechs Funktionen waren gebaut, geprueft und
unerreichbar, weil jede Messung gefragt hat, ob die Funktion richtig
ist, und keine, ob sie ankommt. **Der Waechter zaehlt den Aufruf, nicht
die Funktion** — und mit entferntem Aufruf muss er rot werden.

**Nicht Teil:** die drei Funktionen selbst (G-535, erledigt), die
Umfangserfassung (G-577, laeuft bei dir), der Plansprung und der
Coach-Alarm (eigene Punkte, andere Module). **Und nicht die Attrappe
unter dem Trenner** — `MedImportReferenz` bleibt stehen, solange
oberhalb etwas fehlt (E-68).

**Zu belegen:** die Aufrufzahl je Funktion vorher und nachher · ein Bild
mit uebernommenen Zeilen auf `test-user@lumeos.local` · die Attrappenzahl
des Reiters vorher und nachher, sie darf nicht sinken · der Fehlertext
einmal ausgeloest · Sabotage je Waechter in beide Richtungen · `pnpm
gate` gruen mit Testzahl · nichts committen.

`[read]` **Kein voller Kettenlauf als Nachweis** (00-LIESMICH.md) — die
Funktionen sind gebaut, du rufst sie auf. Was die Datenbank betrifft,
laeuft gegen die bestehende lokale Instanz als Lesepfad und gegen
`test-user@lumeos.local` als Schreibpfad.

---

## Nachtrag 2026-10-01, nach G-577 — der 42501-Blocker ist weg

`[cmd]` **G-577 hat gemessen, dass live alle sechs G-535-Funktionen noch
den alten GUC lasen**, und die Datei auf Freigabe ganz eingespielt:

    VORHER   alter GUC 6 · auth.uid() 0
    NACHHER  alter GUC 0 · auth.uid() 6
    Sicherung backup/g577-535-vorher.sql und -nachher.sql

`[read]` **Damit faellt fuer dich die Diagnose weg, nicht die Arbeit.**
`medical.import_lab_report_rows`, `start_lab_report_ocr` und
`store_lab_report_ocr_result` liegen live in der `auth.uid()`-Fassung —
ein `42501` darf dich hier also nicht mehr treffen. **Wenn doch, ist das
ein Befund und gehoert gemeldet, nicht umgangen.**

`[cmd]` **Und eine Lehre aus G-577, die hier dieselbe sein kann:** der
`InEntwicklungKnopf` im Umfangsmodal nannte als Grund
`goals.body_measurements` und einen fehlenden Schreibweg — **beide
Haelften waren falsch**, die Umfaenge lagen in `body_circumferences` und
der Schreibweg stand seit G-535. **Lies den Vermerk im Laborimport-Teil
als Behauptung, nicht als Befund** — und wenn er faellt, sag es im
Bericht.

`[read]` **Reihenfolge innerhalb von A2:** erst die Signatur der drei
Funktionen gegen `pg_proc` halten (`prokind = 'f'`, sonst wirft
`pg_get_functiondef`), dann schreiben. G-577 hat so gemessen, dass die
Umfangsfunktion **einen Satz mit dreizehn Spalten** nimmt und nicht eine
Zeile je Stelle — eine Annahme ueber die Form haette dort den ganzen
Aufrufer falsch gebaut.

---

## Abnahme — 2026-10-02, Commit `31ebb74e`

`[cmd]` **Gezaehlt am Ergebnis, je ein Aufruf an genannter Zeile:**

| Funktion | Aufrufer | vorher |
| --- | --- | --- |
| `import_lab_report_rows` | `lib/medical/laborimport-write.ts:117` | 0 |
| `start_lab_report_ocr` | `lib/medical/laborimport-write.ts:155` | 0 |
| `store_lab_report_ocr_result` | `lib/medical/laborimport-write.ts:184` | 0 |

| Merkmal | gezaehlt |
| --- | --- |
| Fehlercodes in `lib/fehler/ladefehler.ts` | 13 Treffer auf `P0001`, `P0002`, `28000`, `42501` — vorher 0 |
| neue Dateien | `laborimport.ts`, `laborimport-write.ts`, `app/v2/medical/laborimport-aktionen.ts`, Waechter in `lib/medical/__tests__/` |
| Bilder | 7 in `docs/bilder/g578/` — Reiter und Modal vorher, uebernommen, nachher, Fehlertext, OCR vorher und nachher |
| Commit | `31ebb74e`, 15 Dateien, +1179/−12 |

`[read]` **A1 hat zwei Annahmen zerstoert, bevor sie Schaden anrichten
konnten:** die Funktion **legt den Bericht selbst an** (`INSERT …
RETURNING id`) — wer vorher eine Zeile schriebe, erzeugte zwei — und sie
**ordnet selbst zu**, ruft je Zeile `biomarker_marker_candidates` und
setzt `match_status`. **Deshalb schickt die Oberflaeche keinen LOINC: es
gibt kein Feld dafuer.** Erfunden wird nichts: Pflicht sind nur
`report_date` und `source`; `lab_name` bleibt leer und `title` nennt die
Herkunft statt ein Labor.

`[cmd]` **Der Fund in A3 ist der wertvollste:** `medical OCR:
authentication required` trug **kein einziges Sitzungsmerkmal** und waere
als Datenfehler durchgegangen — ein Nutzer haette keinen Weg zur
Anmeldung gesehen. `fehlerart()` prueft jetzt zusaetzlich `28000` und
`42501`. **Das betrifft jeden Aufrufer, nicht nur diesen.**

`[read]` **Der Vermerk war zur Haelfte ueberholt**, wie mein Nachtrag
vermutete: `medical.biomarker_results` gibt es wirklich nicht (0 in
`information_schema.tables`, `lab_result_values` traegt 280 Zeilen) — die
`@abwesend`-Marke bleibt deshalb stehen. **Die zweite Haelfte war falsch:
der Schreibweg fehlte nicht, er hatte null Aufrufer.**

`[cmd]` **Zwei offene Befunde, beide gemeldet statt verdeckt:**
`store_lab_report_ocr_result` hat jetzt einen Weg, **aber keine Quelle** —
es gibt nichts, das ein Erkennungsergebnis erzeugt; der Aufruf steht an
der richtigen Stelle, ein Dienst wurde nicht gebaut. Und
`start_lab_report_ocr` **erkennt nichts, sie merkt vor** — das steht am
Knopf selbst, nicht nur im Bericht.

`[read]` **Zwei Sabotagen waren zuerst gruen, beide dieselbe Klasse und
beim zweiten Mal:** ein `assert.match` ueber eine Datei mit mehreren
erwarteten Vorkommen bleibt gruen, solange ein Geschwister ueberlebt.
**Jetzt wird auf 3 gezaehlt, und der doppelte Hinweis wird an beiden
Stellen einzeln geprueft.**

### Berichtigung — 2026-10-02: der Commit traegt sechs fremde Zeilen

`[cmd]` **`31ebb74e` enthaelt sechs Zeilen, die zu G-579 gehoeren** — die
drei Plansprung-Fachtexte in `lib/fehler/ladefehler.ts` (Kommentarzeile
`G-579: der Plansprung` und die drei `merkmal:`-Eintraege mit ihren
Saetzen). **Nicht der Agent hat sie hineingelegt, ich habe sie
mitgestagt:** ich habe die Datei als ganzen Pfad gestagt, waehrend
G-579 schon daran schrieb.

`[read]` **Die sieben medical-Texte dieses Punktes sind davon
unberuehrt** und stehen vollstaendig in diesem Commit. Was verschoben
ist, ist die Zuordnung dreier fremder Texte — **kein Code ist falsch,
keine Zeile fehlt.** Die Geschichte wird nicht umgeschrieben, solange
`dev` nicht gepusht ist und Tom nichts anderes sagt.

`[read]` **Ursache und Gegenmassnahme stehen in A-93:** zwei Agenten in
einem Arbeitsbaum, und eine geteilte Datei darf nicht per Pfad gestagt
werden.
