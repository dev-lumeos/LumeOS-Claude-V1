---
nr: G-555
typ: fehler
modul: quer
schwere: hoch
angelegt: 2026-09-30
commit: bec132b6
erledigt: 2026-10-01
beauftragt: 2026-10-01
agent: claudecode

braucht: [G-553]
kind_von: G-553

quellen:
  - docs/punkte/00-INDEX.md

beruehrt:
  tabellen: []
  dateien:
    - apps/web/src/app/v2/medical/tab-biomarker.tsx
    - apps/web/src/app/v2/nutrition/tab-vorlieben.tsx
    - apps/web/src/lib/fehler/ladefehler.ts

zahlen:
  gemessen: 2026-10-01
  module_betroffen: 2
  module_behoben: 2
  ansichten_mit_kachel: 4
---

# Derselbe Ladefehler verschluckt zwei weitere Module

## Auftrag — Kopf

    AUFTRAG FUER Claude Code - G-555: derselbe Ladefehler verschluckt
                                     medical und nutrition
    Bereich: apps/web/src/app/v2/medical/
             apps/web/src/app/v2/nutrition/
             apps/web/src/lib/ (der neue Ort fuer ladefehler.ts)
    Fremd:   supabase/ gehoert Codex (A-90, der Grunddaten-Dump).
             docs/ gehoert dem Orchestrator, auch diese Punktdatei:
             der Bericht kommt als Antwort, nicht als Anhang hier.
    Stand:   2026-10-01

**Zuerst lesen, vollstaendig:** diese Datei und
`docs/punkte/erledigt/goals-g-0553-der-ladefehler-ist-ein-eigener-zustand.md`
— dort steht die Bauart, die hier zu uebertragen ist.

`[cmd]` **Claude Code hat es ausserhalb seines Auftrags gefunden und
gemeldet, statt es mitzunehmen:**

    apps/web/src/app/v2/medical/tab-biomarker.tsx:56
      MedImportReferenz steht in Zeile 399 - also HINTER dem Ternaer
    apps/web/src/app/v2/nutrition/tab-vorlieben.tsx:447

`[read]` **Dieselbe Bauart wie der Fehler, den G-553 in Goals behoben hat:**
ein Ternaer, dessen `else`-Zweig den ganzen Reiterinhalt traegt — Trennstrich
und Mockup inbegriffen. Faellt die Abfrage, ist die Seite leer, auch der Teil,
der keine Daten braucht.

`[cmd]` **Bei `medical` selbst nachgesehen, und es ist strenger als
gemeldet — kein Ternaer, sondern ein frueher `return`:**

```tsx
// tab-biomarker.tsx:55
if (echt.ladefehler) {
  return (
    <Card title="Biomarkers" sub="konnten nicht geladen werden">
```

`[read]` **Ein frueher `return` verlaesst die Komponente komplett.** Alles
danach wird nicht nur uebersprungen, es wird nie erreicht —
`MedImportReferenz` in Zeile 399 hat keine Chance. Beim Ternaer in Goals
stand der Entwurf wenigstens im anderen Zweig; hier gibt es keinen anderen
Zweig.

**Der Befund von Claude Code stimmt, die Bauart ist eine andere.** Wer nach
einem Ternaer sucht, findet in `medical` nichts.

## Warum das ein eigener Punkt ist und nicht Teil von G-553

`[read]` **Der Auftrag nannte `goals/`.** Claude Code hat die Grenze gehalten
und den Fund gemeldet — genau richtig. `medical/` und `nutrition/` sind
dieselbe Bereichszuteilung (Claude Code, `apps/web/src/app/v2/`), aber ein
anderer Modulstand: beide haben eigene Punkte, eigene Attrappenzahlen und
eigene Waechter.

**Tom sieht denselben Fehler dort genauso**, sobald eine Abfrage faellt — und
der Tokenfehler von gestern trifft jede Seite, nicht nur Goals.

## Auftrag

1. **Die Kopplung loesen**, wie in G-553: ein Schalter sperrt nur die
   datentragenden Bauteile, kein Mockup-Bauteil haengt daran.
2. **`lib/goals/ladefehler.ts` verwenden** — die Unterscheidung
   Sitzungsfehler / Datenfehler ist gebaut und liest den Text.
   `[read]` **Und damit gehoert die Datei verschoben:** sie liegt in
   `lib/goals/`, wird aber von drei Modulen gebraucht.
   `lib/fehler/ladefehler.ts` oder `packages/ui` — **melden, wohin, und
   die Importe aller drei Module nachziehen.**
3. **Je Modul ein Waechter**, der beide Richtungen prueft: mit Ladefehler
   steht der Trennstrich, ohne Mockup-Bauteil wird er rot.
4. **Die drei Reiter, die G-553 als nie betroffen belegt hat** (`cross`,
   `timeline`, `poses`), sind die Gegenprobe fuer die richtige Bauart —
   ansehen, bevor umgebaut wird.

## Zu belegen

- je Modul ein Bild mit Ladefehler: Fehlerkachel **und** Mockup sichtbar
- die Attrappenzahl je Reiter vorher/nachher — sie darf **nicht** sinken
- `ladefehler.ts` am neuen Ort, alle drei Importe umgestellt, kein
  verwaister Pfad
- Sabotageprobe je Waechter in beide Richtungen
- `pnpm gate` gruen, nichts committen

**Reihenfolge:** nach G-554. Die Goals-Grundlagen gehen vor, und dieser Punkt
betrifft zwei Module, die Tom heute nicht bearbeitet.

---

## Nachtrag 2026-10-01 — zwei Dinge sind seit dem 30.09. dazugekommen

`[cmd]` **Der Ort fuer `ladefehler.ts` ist jetzt dringlicher als am
30.09.** G-535 hat eine neue Fachmeldung erzeugt:
`medical import: user mismatch` mit `P0001`. Gezaehlt in
`apps/web/src/lib`: **null Treffer auf `P0001`, null auf
`user mismatch`.** Die Meldung hat heute keinen Ort, an dem sie zu einem
Text wird.

`[cmd]` **Und die Datei ist noch enger gebunden, als der Punkt sagt:**
`apps/web/src/lib/fehler/ladefehler.ts` fuehrt
`Fehlerart = 'sitzung' | 'daten'` und nennt im Kommentar
PostgREST-Codes. **Ein medical-Fehler hat dort keinen Platz, solange die
Datei unter `goals/` liegt.**

`[read]` **Damit haengt G-571 an diesem Punkt.** Dort ist entschieden,
dass der Laborimport eine Oberflaeche bekommt — und der braucht einen Ort
fuer seine Meldung. **Die Reihenfolge ist: dieser Punkt, dann der
Aufrufer.**

`[read]` **Was sich NICHT geaendert hat:** die Bauart in `medical` ist ein
frueher `return` (Zeile 55), kein Ternaer. Wer nach einem Ternaer sucht,
findet dort nichts — das steht oben und gilt weiter.

**Zu belegen, berichtigt:** wie oben, **aber kein voller Kettenlauf** —
dieser Punkt beruehrt die Datenbank nicht. `pnpm gate` gruen mit
Testzahl, Bild je Modul, Attrappenzahl je Reiter vorher und nachher,
Sabotage je Waechter in beide Richtungen.

---

## Abnahme — 2026-10-01, Commit `bec132b6`

`[cmd]` **Die Praemisse dieses Punktes war falsch, und der Agent hat es
gemessen statt es zu uebernehmen.** Der Punkt behauptet, der fruehe
`return` in `tab-biomarker.tsx` verschlucke das Mockup, namentlich
`MedImportReferenz` in Zeile 399. Der Agent hat die Attrappenzahl je
Reiter vorher und nachher gezaehlt: **sie ist in keiner Richtung
gesunken, 1/6 bleibt 1/6.** Der fruehe `return` stand nicht vor dem
Mockup, sondern vor einem Zweig, der es nicht trug. **Der Umbau bleibt
richtig, die Begruendung im Punkt war es nicht** — was hier zaehlt, ist
die geteilte Kachel, nicht ein verschlucktes Mockup.

`[cmd]` **Gezaehlt am Ergebnis, nicht im Bericht gelesen:**

| Merkmal | gezaehlt |
| --- | --- |
| `apps/web/src/lib/fehler/ladefehler.ts` | 140 Zeilen, Git erkennt die Umbenennung aus `lib/goals/` (66 %) |
| `fehlertexte(art: Fehlerart, modul?: string)` | der Modultitel ist ein Parameter, keine Goals-Konstante mehr |
| `components/shell/ladefehler-kachel.tsx` | neu, zieht `fehlerart`/`fehlertexte` aus `../../lib/fehler/ladefehler` |
| Ansichten mit `LadefehlerKachel` | 4 — `goals/ansicht.tsx:99`, `medical/tab-biomarker.tsx:21`, `nutrition/tab-vorlieben.tsx:56`, `nutrition/tab-planner-echt.tsx:73` |
| Schreibweg am neuen Pfad | `lib/goals/phasenziel-write.ts:37` |
| verwaister Pfad `lib/goals/ladefehler.ts` | 0 Treffer |
| Waechter | `apps/web/src/app/v2/__tests__/g555-ladefehler-quer.test.ts`, neu, quer ueber die Module |
| Bilder | 4 in `docs/bilder/g555/` — je Modul vorher und nachher |
| Gate beim Commit | 2.471 Tests, 102 Suiten, fail 0; 18 von 18 Tasks |
| Commit | `bec132b6`, 13 Dateien, 481 Zeilen dazu, 78 weg |

`[cmd]` **Nicht Teil dieses Commits:** `lib/goals/umfang-write.ts` zieht
`fehlerart` ebenfalls aus dem neuen Pfad, gehoert aber zu G-577 und lag
beim Commit noch unversioniert daneben. **Der neue Ort hat damit seinen
zweiten Nutzer, bevor er abgenommen ist** — das ist der Beleg, dass die
Verschiebung richtig war, und kein Teil dieser Abnahme.

`[read]` **Offen bleibt der Anlass aus dem Nachtrag:** `P0001` und
`medical import: user mismatch` haben jetzt einen Ort, aber noch keinen
Text. **Das gehoert zu G-571**, dem Aufrufer.
