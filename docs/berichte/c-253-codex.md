# C-253 - Kataloganker gegen falschen ID-Typ

Stand: 2026-08-23

Nicht committet, nicht gestaged, nicht gepusht.

## Ausgangslage

Gemessen wurde der Typbruch aus dem Auftrag:

```text
supplements.substance_catalog.id  text
supplements.supplements.id        uuid
supplements.supplements.slug      alte substance_catalog.id
```

Der `substance_catalog:<wert>`-Anker darf deshalb nicht auf
`supplements.supplements.id` zeigen und darf auch nicht gegen diese UUID
verglichen werden. Der Zielwert fuer solche Anker ist
`supplements.supplements.slug`.

## Vorher-Messung

Die neue Pruefung wurde vor der Korrektur einmal im Ist-Zustand
ausgefuehrt. Ergebnis:

```text
[kataloganker] FEHLER: 2 typfalsche oder fehlende Kataloganker.
  add-list-anchor-uses-id: apps/web/src/app/v2/supplements/substanz-detail.tsx:473
  stack-anchor-compares-uuid: apps/web/src/app/v2/supplements/substanz-detail.tsx:113
```

Die drei beauftragten Stellen wurden damit belegt:

```text
Stack-Anker: falsch, weil substance_catalog:<wert> noch gegen s.id treffen durfte.
Add-Knopf: falsch, weil die Listenzeile s.id als substanzId weitergab.
Detailkopf: bereits korrekt, weil satz.slug || satz.id angezeigt wird.
```

Dass live aktuell 0 von 11 `stack_items` einen solchen Anker tragen,
aendert nichts am Fehler: der Bruch haette erst bei einer spaeteren
Anker-Zeile sichtbar zugeschlagen.

## Korrektur

Geaendert:

```text
apps/web/src/app/v2/supplements/substanz-detail.tsx
package.json
tools/kataloganker-pruefen.mjs
```

Korrekturen in `substanz-detail.tsx`:

```text
imStackIds:
  vorher  anker.has(s.slug) || anker.has(s.id)
  nachher anker.has(s.slug)

Listen-Add:
  vorher  substanzId: s.id
  nachher substanzId: s.slug || s.id
```

Der Detail-Add war bereits korrekt:

```text
substanzId: satz.slug || satz.id
```

Der Detail-Lesepfad bleibt absichtlich tolerant:

```text
.eq(istUuid ? 'id' : 'slug', id)
```

Das ist kein `substance_catalog`-Anker, sondern der Detail-Loader fuer
Deep-Links und direkte UUIDs.

## Gate-Pruefung

Neu:

```text
tools/kataloganker-pruefen.mjs
```

Die Pruefung ist eng auf diese Ankerfamilie zugeschnitten:

```text
substance_catalog:<wert> muss ueber slug laufen
Listen-Add darf nicht s.id als Anker schreiben
Stack-Anker darf nicht gegen s.id vergleichen
Substanzlisten muessen slug lesen und typisieren
Detail muss slug oder uuid laden koennen
Detailkopf muss slug vor id anzeigen
```

In `package.json` ist sie in `pnpm gate` eingehangen, vor Turbo:

```text
node tools/kataloganker-pruefen.mjs
```

Nach der Korrektur:

```text
[kataloganker] 3 Ankerstellen geprueft, 0 typfalsche Verweise.
```

## Negativprobe

Die Pruefung hat einen eingebauten Selbsttest:

```text
LUMEOS_KATALOGANKER_SELBSTTEST=1 node tools/kataloganker-pruefen.mjs
```

Er ersetzt im Speicher den korrekten Listen-Add-Anker wieder durch
`substanzId: s.id`. Ergebnis:

```text
[kataloganker] Selbsttest rot wie erwartet: add-list-anchor-uses-id.
```

Damit meldet die Pruefung nicht nur rot, sondern die richtige Ursache.

## Validierung

Gruen:

```text
node tools/kataloganker-pruefen.mjs
LUMEOS_KATALOGANKER_SELBSTTEST=1 node tools/kataloganker-pruefen.mjs
pnpm --filter @lumeos/web typecheck
pnpm --filter @lumeos/web test
```

`pnpm gate` laeuft bis einschliesslich der neuen Pruefung gruen:

```text
[kataloganker] 3 Ankerstellen geprueft, 0 typfalsche Verweise.
```

Danach scheitert der Web-Build an einem `.next-gate`-Artefakt, nicht an
der C-253-Pruefung:

```text
Error: ENOENT: no such file or directory,
open apps/web/.next-gate/server/app/api/profile/ziele/route.js.nft.json
```

Ein einzelner Wiederholungslauf des Web-Builds ueber den vorhandenen
`gate-build.js`-Wrapper scheiterte erneut, aber an einer anderen
fehlenden `.next-gate`-Datei:

```text
Error: ENOENT: no such file or directory,
rename apps/web/.next-gate/export/500.html
  -> apps/web/.next-gate/server/pages/500.html
```

Ich habe `.next` und `.next-gate` nicht geloescht und den Build-Wrapper
nicht nebenbei geaendert.

