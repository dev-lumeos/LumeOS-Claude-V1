---
nr: G-578
typ: fehler
modul: medical
schwere: hoch
angelegt: 2026-10-01

braucht: [G-535, G-555, G-571]
kind_von: G-571

quellen:
  - docs/punkte/todos/quer-g-0571-sechs-schreibwege-ohne-aufrufer.md
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
`docs/punkte/todos/quer-g-0571-sechs-schreibwege-ohne-aufrufer.md` (die
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
