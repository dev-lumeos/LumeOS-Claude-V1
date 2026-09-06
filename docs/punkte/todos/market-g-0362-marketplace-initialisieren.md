---
nr: G-362
typ: feature
modul: market
schwere: hoch
angelegt: 2026-09-07
braucht: []
kind_von: G-360
entscheidung: E-71
beruehrt:
  dateien:
    - apps/coach/package.json
zahlen:
  gemessen: 2026-09-07
  seiten: 0
  mockup_zeilen: 3232
---

# G-362 — marketplace initialisieren

## Was gemessen ist

`[cmd]` **`apps/market` existiert nicht.** `[cmd]` **Kein
Verzeichnis, kein Port.**

`[cmd]` **Sieben Mockups, 3.232 Zeilen:**

    module-market-seller.jsx     658
    module-market-products.jsx   630
    module-market-wallet.jsx     553
    module-market-scoring.jsx    410
    module-market-home.jsx       339
    module-market-subs.jsx       324
    module-market-creator.jsx    318

`[read]` **Sieben Schirme, die es nur im Mockup gibt.**

## Die vier Quellen

`[cmd]` **Spec:** **160 Dateien nennen `market`, acht im Namen** —
**alle acht sind Mockups.** `[read]` **Es gibt keine
Marketplace-Spec.**

`[cmd]` **Altrepo:** `referenz/lumeos-2026/apps/marketplace`,
`docs/marketplace-module`, `research/marketplace`,
`src/api/marketplace`, `src/modules/marketplace` — **acht
Verzeichnisse.**

`[read]` **Das ist die wichtigste Quelle hier** — **es gab einen
Marketplace, und er wurde ersetzt.** `[cmd]` **Nachsehen, warum.**

`[cmd]` **Mockup:** die sieben Dateien oben.

## Was zuerst zu klaeren ist

`[read]` **Ein Wallet und ein Bewertungssystem sind keine
Oberflaechen** — **sie brauchen Datenmodelle.**

`[cmd]` **`module-market-wallet.jsx` mit 553 Zeilen und
`module-market-scoring.jsx` mit 410** — **das ist Fachlogik, keine
Ansicht.**

`[read]` **Und E-45 kennt `marketplace` bereits als
Rezept-Herkunft** — **die Anbindung an Nutrition ist gedacht.**

`[read]` **Vor dem Bauen: was ist V1?** `[read]` **Sieben Schirme
auf einmal ist kein Anfang.**

## Und die Regeln gelten

`[cmd]` **E-68, E-69, E-70, E-71** — **von der ersten Zeile an.**

`[read]` **Das ist der Vorteil eines leeren Verzeichnisses:**
**nichts kann verschwinden, was von Anfang an sichtbar bleibt.**
