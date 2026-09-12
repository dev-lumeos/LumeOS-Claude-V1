---
nr: C-482
typ: feature
modul: quer
schwere: hoch
angelegt: 2026-09-12
braucht: []
kind_von: G-433
entscheidung: vierte_ebene_verschoben
erledigt: 2026-09-08
commit: 8cd5c6bf
beruehrt:
  tabellen: [training.muscle_groups, public.koerperflaechen]
zahlen:
  gemessen: 2026-09-12
  kartenflaechen: 43
  muscle_groups_vorher: 95
  muscle_groups_nachher: 105
---

# C-482 — Muskelnamen zur aufgeteilten Karte

## Bericht

Stand 2026-09-12, Codex. Die bestehende, gleich nummerierte
Vierte-Ebene-Punktdatei wurde aus `todos/` in diese vom Auftrag verlangte
Punktdatei überführt und inhaltlich auf G-433 aktualisiert.

### A1 — zehn Namen und ihre Eltern

Vorher enthielt `training.muscle_groups` nach Schritt 108 **95** Namen;
nachher sind es **105**. Schritt 107 legt die zehn Katalognamen samt
`body_region`, Anzeigeform und Elternbeziehung an. Er erwartet vor dem
bereits bestehenden Achilles-Sehnen-Cleanup 106 Namen; Schritt 108 entfernt
weiterhin nur `Achilles Tendon` und erwartet danach 105.

| Kartenfläche | Katalogname | Elternteil | Ergebnis |
|---|---|---|---|
| `vastus-lateralis` | Vastus Lateralis | Quadriceps | angelegt |
| `vastus-medialis` | Vastus Medialis | Quadriceps | angelegt |
| `gastrocnemius-lateralis` | Gastrocnemius Lateral Head | Calves | angelegt |
| `gastrocnemius-medialis` | Gastrocnemius Medial Head | Calves | angelegt |
| `triceps-longum` | Triceps Brachii Long Head | Triceps | angelegt |
| `triceps-lateralis` | Triceps Brachii Lateral Head | Triceps | angelegt |
| `triceps-mediale` | Triceps Brachii Medial Head | Triceps | angelegt |
| `external-oblique` | External Oblique | Obliques | angelegt |
| `serratus-anterior` | Serratus Anterior | Shoulders | angelegt |
| `nacken` | Posterior Neck Muscles | Neck Muscles | angelegt |

Die Gegenprüfung im Frischaufbau ergab zehn von zehn Namen mit genau diesem
Elternteil und dieser Region. Es wurden keine bestehenden
`exercise_muscles`-Zuordnungen verändert.

### A2 — Serratus anterior

`Serratus Anterior` hängt unter **Shoulders**, nicht unter Chest. Er liegt an
der seitlichen Thoraxwand, seine für die Kartenhierarchie maßgebliche Funktion
ist aber Protraktion und Aufwärtsrotation der Scapula; das passt zur
Schulterblatt-/Schulterwurzel. Fundstelle: [NCBI StatPearls: Serratus anterior](https://www.ncbi.nlm.nih.gov/books/NBK531457/).

### A3 — Nacken

`nacken` erhält den neuen, anatomisch kollektiven Namen **Posterior Neck
Muscles** unter `Neck Muscles`. Die Rückansicht zeigt pro Seite nur einen
Strang; eine Zuordnung ausschließlich zu `Scalenes` oder ausschließlich zu
`splenius capitis` wäre deshalb eine nicht belegte Scheingenauigkeit. Der
Nacken umfasst mehrere hintere Halsmuskeln; `splenius capitis` ist nur einer
davon. Fundstelle: [NCBI StatPearls: Cervical spine](https://www.ncbi.nlm.nih.gov/books/NBK557516/).

### A4 — ulnarer Unterarmstrecker

Kein neuer Name: In der Frischdatenbank steht genau ein `Extensor Carpi
Ulnaris` unter

    Arms > Forearms > Forearm Extensors > Extensor Carpi Ulnaris

Die Oberfläche kann daher ihren bestehenden Karten-Code
`forearm-extensors-ulnar` weiter auf diesen Katalognamen abbilden.

### A5 — Sehnen und Flanke

`achillessehne`, `tendinous-inscriptions` und `flanke` bleiben auswählbar,
aber erhalten **keinen** Eintrag in `training.muscle_groups`:

| Fläche | Entscheidung | Grund |
|---|---|---|
| `achillessehne` | nicht angelegt | Sehne, kein Muskel; Schritt 108 entfernt `Achilles Tendon` absichtlich aus dem Muskelkatalog. |
| `tendinous-inscriptions` | nicht angelegt | Sehnenzwischenstücke des Rectus abdominis, kein eigener Muskel. |
| `flanke` | nicht angelegt | Körperregion ohne belegten eigenen Muskelnamen; weder `Flank` noch `Quadratus Lumborum` stehen im Katalog. |

Die Frischdatenbank enthält für `Achilles Tendon`, `Tendinous Inscriptions`,
`Flank` und `Quadratus Lumborum` zusammen **0** Muskelkatalogzeilen. Apps und
`packages/ui` wurden nicht angefasst; die bestehenden auswählbaren
Painpoint-Flächen bleiben damit erhalten.

### A6 — vierte Ebene bewusst verschoben

Sie wurde **nicht** als unvollständige Vier-Ebenen-Struktur gebaut. Gemessen:
`public.koerperflaechen` hat 8 Wurzeln, 26 Ebene-2-Flächen und 34
Ebene-3-Seiten; die G-433-Karte hat dagegen 43 Flächen. Bereits vor C-482
standen 17 gezeichnete Namen auf Ebene 3 oder tiefer in
`training.muscle_groups`.

Die verlangte echte Kette für die jetzt getrennten Wadenköpfe wäre mindestens

    Legs > Lower Legs > Calves > Gastrocnemius-Kopf > Seite

also **fünf** Ebenen. Eine neue vierte Ebene hätte entweder `Lower Legs` oder
`Calves` unterschlagen und damit genau wieder eine falsche, verkürzte
Muskelhierarchie gespeichert. Ohne die Verschiebung bleibt daher richtig
benannt offen: `public.koerperflaechen` kann die seitengenauen,
aufgeteilten Stränge noch nicht vollständig ohne Übergangsbrücken abbilden.
Der nötige Folgeauftrag ist ein beliebig tiefes bzw. fünfstufiges
Flächenmodell, nicht ein falscher Vier-Ebenen-Check.

Folglich gibt es für C-482 keine Strukturmigration; die entschiedenen
Katalogzeilen liegen ausschließlich in
`supabase/_pipeline/10_training/107_muscle_groups_hierarchy.sql`, ihre
Endstandsprüfung in Schritt 108.

### A7 — Wächter, Sicherung und Vollkette

Der Wächter
`apps/web/src/lib/koerper/__tests__/g432-ebenen.test.ts` ist grün:
**10/10 Tests**, darunter `KEIN Name in EBENEN ist erfunden`. Er liest
`107_muscle_groups_hierarchy.sql` direkt; damit bleibt die Namensquelle
bewacht. Auch `node tools/migration-datenlogik-pruefen.mjs` ist grün:
44 historische Datenoperationen, genau Sollstand 44.

Die Vollkette lief erfolgreich in Wegwerf-Datenbank
`lumeos_c482_vollkette` (198 Schritte, Exit 0). Ihre automatische
Schemasicherung ist
`backup/schema/20260912055724_c43_vor_kettenlauf.sql`; der erste Lauf wurde
beim CSV-Import nur wegen der Sitzungs-Ausgabebegrenzung abgeschnitten, der
anschließende vollständige Lauf endete grün.

`punkte-pruefen.mjs` ist grün: 651 Punkte, 25 Befunde bei Soll 25. Die
unabhängige README/Ketten-Prüfung bleibt mit 103 alten, fehlenden
Dokumentationseinträgen rot; C-482 hat keinen neuen Eintrag und verändert
die Kette nicht.

Nicht gestaged, nicht committed, nicht gepusht.

## Abnahme

**2026-09-08, Orchestrator. Nachgemessen.**

    107_muscle_groups_hierarchy.sql   +61 Zeilen
    108_exercise_curation_rest.sql     +4
    alle zehn Namen im Kettenschritt
    Vollkette 198 Schritte, alle Waechter gruen

`[read]` **Die Arbeit ist da** ? **aber NICHT live.**

`[cmd]` **`training.muscle_groups`: 95 Zeilen, kein
`Serratus`.**

`[read]` **Die Vollkette lief auf einer Wegwerf-Datenbank, die
Live-Datenbank hat er nicht nachgezogen.**

`[read]` **Das ist eine Luecke im Bericht, kein Fehler im Bau** ?
**der naechste Vollaufbau bringt sie mit.**

### Der Ablageort ist richtig

`[cmd]` **Kettenschritt statt Migration** ? **`muscle_groups`
sind Katalogdaten (D-17).**

`[read]` **Keine Migration angelegt** ? **richtig, eine Migration
darf keine Katalogdaten schreiben.**

### Die drei Entscheidungen mit Quelle

**1** ? `[cmd]` **`Serratus anterior` unter `Shoulders`, nicht
`Chest`** ? **mit NCBI belegt, Scapula-Funktion.**

**2** ? `[cmd]` **`nacken` heisst *Posterior Neck Muscles*** ?
**statt faelschlich `Scalenes` oder `Splenius` zu behaupten.**

> *,,statt faelschlich NUR Scalenes oder Splenius zu
> behaupten"*

`[read]` **Eine Flaeche zeigt mehrere Muskeln** ? **der Name
sagt es, statt einen auszuwaehlen.**

**3** ? `[cmd]` **`ECU` nutzt den bestehenden `Extensor Carpi
Ulnaris`** ? **kein zweiter Eintrag.**

### A6 bewusst verschoben

> *,,Die vierte Ebene wurde nicht halb gebaut: Die seitengenaue
> Wadenhierarchie braucht mindestens FUENF Ebenen."*

`[cmd]` **Heute drei:** **Wurzel, Flaeche, Seite.**

`[read]` **`Legs > Lower Legs > Calves > Gastrocnemius >
links`** ? **das sind fuenf.**

`[read]` **Er hat nicht vier gebaut, um dann sechs zu
brauchen.**

### Was offen bleibt

`[cmd]` **Sehnen und die Flanke bleiben ausserhalb des
Muskelkatalogs** ? **fuenftes Mal gemeldet, fuenftes Mal nicht
erfunden.**

`[cmd]` **Und die Live-Datenbank traegt die zehn Namen noch
nicht.**

**Abgenommen.**
