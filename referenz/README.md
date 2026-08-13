# referenz/

Fremde Repositories und Materialien, die als **Referenz** gebraucht werden.
Nicht Teil dieses Repos, nicht versioniert — nur diese README ist getrackt.

## Warum es diesen Ordner gibt

`lumeos-2026` lag bis 2026-08-12 unter `temp/lumeosold/`. Der Name hat es
zweimal beinahe gekostet:

1. In Block 15 stand `temp/` auf der Löschliste von A-05. `[cmd]` Darin
   lagen 13,11 GB Übungsmedien — die einzige lokale Kopie.
   Sie liegen seither unter `media/`.
2. In Block 23 stand es erneut zur Löschung an. `[cmd]` Dabei kam heraus,
   dass es ein vollständiges Git-Repo ist: **22 Stashes**, **16 ungepushte
   Commits auf `dev`**, 3 weitere auf `feature/supabase-migration-v2`,
   27 lokale Branches.

**Stashes werden nie gepusht.** Sie existieren ausschliesslich in dieser
Arbeitskopie; kein Zip, kein Klon, kein Backup enthält sie. Ein Löschen
wäre endgültig gewesen.

Beide Male hat dieselbe Regel getragen: *kein untracked Verzeichnis dem
Namen nach löschen — Inhalt zuerst zeigen.* Der Umzug hierher nimmt dem
dritten Mal die Gelegenheit.

## lumeos-2026

Der Vorgänger des heutigen LumeOS.
`origin` = `github.com/dev-lumeos/lumeos-2026`, letzter Commit 2026-03-24.

Wird als **Referenz** gebraucht: dort stecken Ansätze und Funktionen, die
in den Neubau einfliessen sollen. Der Cloud-Bestand derselben Instanz ist
in `docs/ssot/60-legacy-cloud.md` erhoben; die Trainingsstammdaten wurden
daraus nach `backup/legacy-v2/training/` exportiert und liegen inzwischen
als Schema `training` in der lokalen Datenbank.

### Bevor hier jemand aufräumt

Die 19 ungepushten Commits und 22 Stashes sind **nicht gesichert**. Wer
den Ordner verkleinern oder entfernen will, sichert sie vorher — durch
`git push` der betroffenen Branches oder ein Bundle
(`git bundle create … --all`).

`node_modules` und Build-Verzeichnisse darin sind gefahrlos entfernbar und
machen den Grossteil der 2,9 GB aus.

## Was hier NICHT hingehört

Eigener Code, eigene Dokumentation, eigene Daten. Dieser Ordner ist für
Fremdmaterial. Was zu LumeOS gehört, gehört ins Repo.
