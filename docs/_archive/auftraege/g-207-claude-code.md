# G-207 — Claude Code, 2026-08-27

Bericht: `docs/berichte/g-207-claude-code.md`

**Der Medical-Modul zeigt fuenf Tabs. Zwei davon laufen auf
Konstanten aus einer Datei, nicht auf der Datenbank. Bau die
Symptome an — und nur die.**

---

## Vorweg: die Zahlen sind Ausgangsvermutungen

`[read]` **Pruef sie zuerst. Weicht deine ab, gilt deine — und du
nennst beide.** `[read]` **Du hast in G-190, G-200 und G-203 jedes
Mal etwas gefunden, das ich nicht gesehen hatte.** Diesmal gilt das
besonders fuer den Umfang: **wenn du meinst, der Zuschnitt unten ist
falsch, sag es, bevor du baust.**

## 1 · Der Stand, gemessen

`[cmd]` **`apps/web/src/app/v2/medical/` hat 16 Dateien und fuenf
Tabs:** `dashboard`, `biomarkers`, `import`, `tracking`, `insights`.

`[cmd]` **`daten.ts` haelt fuenfzehn exportierte Konstanten**, darunter
`SYMPTOMS`, `SYMPTOM_BIOMARKER_MAP`, `MEDICATIONS_V2`, `CORRELATIONS`,
`OCR_EXTRACTED`, `UNIT_CONVERSIONS`, `LAB_REPORTS`.

`[cmd]` **`SYMPTOMS` wird an drei Stellen benutzt** —
`ansicht.tsx:75` fuer den Zaehler im Tab, `tab-tracking.tsx:74` fuer
die aktiven, `tab-tracking.tsx:112` fuer die Liste.

`[cmd]` **27 Attrappen-Marker im Modul**, verteilt auf acht Dateien;
allein `tab-biomarker.tsx` und `tab-tracking.tsx` tragen je neun.

`[read]` **Das Modul ist also nicht leer — es ist halb angeschlossen.**
Biomarker kommen aus `echtdaten.ts`, Symptome aus einer Konstante.

## 2 · Was dieser Auftrag ist

**Genau eine Sache: `SYMPTOMS` und `SYMPTOM_BIOMARKER_MAP` bekommen
eine Tabelle und einen Leseweg.**

`[cmd]` C-159 meldete seinerzeit *,,keine Symptomtabelle im ganzen
Schema"* — der Entwurf hat sie, mit Zuordnung zu Biomarkern. `[read]`
**Die Zuordnung ist der eigentliche Wert**: sie verbindet, was jemand
spuert, mit dem, was messbar ist.

**Erst messen, dann bauen:**

    Wie viele Symptome stehen in SYMPTOMS?
    Wie viele Zuordnungen in SYMPTOM_BIOMARKER_MAP?
    Auf wie viele verschiedene Biomarker zeigen sie?
    Zeigt jede Zuordnung auf einen Biomarker, den es gibt?

`[read]` **Die letzte Frage ist die wichtige.** Eine Zuordnung auf
einen Biomarker, den der Katalog nicht kennt, ist beim Umzug in die
Datenbank ein Fremdschluesselbruch — **und in der Konstante faellt sie
nie auf.**

## 3 · WAS NICHT ZU TUN IST — bitte genau lesen

**Die vier fehlenden Tabs NICHT bauen.** `MedMedications`,
`MedHistory`, `MedDocuments`, `MedAppointments` stehen in C-171 und
bleiben dort.

`[cmd]` **Der Grund ist hart:** `medical.user_medications` speichert
`name`, `indication` und `notes` **im Klartext** — **C-285 ist offen
und unentschieden.** `[read]` **Ein Medikamenten-Tab waere eine
Oberflaeche fuer einen Speicher, den wir noch aendern werden.** Er
muesste danach zweimal umgebaut werden, und die erste Fassung wuerde
Nutzer einladen, unverschluesselte Daten einzugeben.

**Auch nicht bauen:** `APPOINTMENTS`, `DOCUMENTS`, `HISTORY_TIMELINE`,
`DIAGNOSES`, `OCR_EXTRACTED`, `CORRELATIONS`, `UNIT_CONVERSIONS`.
`[read]` **Sie stehen in derselben Datei und sehen aus wie dieselbe
Arbeit. Sie sind es nicht.**

`supabase/_pipeline/` gehoert Codex — er arbeitet dort an C-293.
**Wenn du eine Tabelle brauchst, beschreib sie im Bericht; leg sie
nicht selbst an.**
Nicht committen, nicht stagen, nicht pushen.

## 4 · Zwei Dinge aus heute, die dir Zeit sparen

`[cmd]` **Der Dev-Server beendet sich von selbst** — fuenfmal am
27.08., nach 30 bis 60 Sekunden, ohne Fehler im Log. **Das ist G-205,
nicht dein Fehler.** Starte ihn ueber `python tools/server.py start`,
**nie `pnpm dev`**, und wenn er weg ist, starte ihn neu ohne es zu
untersuchen.

`[cmd]` **Ein Neustart wirft den Uebersetzungsstand weg** — `/v2/...`
brauchte danach 8.050 ms statt Bruchteilen. **Wenn du Zeiten
nennst, nenn dazu, ob der Server warm war.**

## NACHWEIS

    Symptome in SYMPTOMS                 Zahl
    Zuordnungen in SYMPTOM_BIOMARKER_MAP Zahl
    davon auf unbekannte Biomarker       Zahl, je einzeln benannt
    Zeilen in der neuen Tabelle          Zahl, = Konstante
    Attrappen im Modul vorher/nachher    27 vorher, gemessene Zahl nachher
    Bildschirmfoto tracking-Tab          `node tools/schuss.mjs`

`[read]` **Negativprobe:** eine Zuordnung auf einen erfundenen
Biomarker setzen — **der Leseweg muss sie sichtbar ablehnen**, nicht
still verschlucken. **Danach zurueckbauen und die Datei auf
Byteidentitaet pruefen.**

## REGELN

`tools/lauf.py` fuer jeden Befehl, keine Konsolenfenster.
`.next` nie loeschen, `next build` nie direkt aufrufen.
`[cmd]` **Messungen mit echten Daten auf `dev@lumeos.app`, aber
nichts dort speichern** — das ueberschreibt Toms Ansichten.
Schreibende Nachweise auf `test-user@lumeos.local`.

**Wenn eine Vorgabe nicht aufgeht: melden, nicht passend machen.**
