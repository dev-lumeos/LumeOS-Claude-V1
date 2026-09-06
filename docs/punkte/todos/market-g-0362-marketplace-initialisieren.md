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

`[cmd]` **Spec: `docs/specs/Marketplace/`, 12 Dateien, 3.122
Zeilen.**

    SPEC_06_DATABASE_SCHEMA.md    417
    SPEC_07_API.md                384
    SPEC_04_FEATURES.md           334
    SPEC_02_ENTITIES.md           292
    SPEC_11_UI_DESIGN.md          283
    SPEC_09_SCORING.md            281
    SPEC_03_USER_FLOWS.md         236
    SPEC_08_IMPORT_PIPELINE.md    227
    SPEC_05_WALLET_ECONOMICS.md   226
    SPEC_10_COMPONENTS.md         203
    INDEX.md                      124
    SPEC_01_MODULE_CONTRACT.md    115

`[read]` **Die Spec ist vollstaendig** — **Schema, API, Wallet,
Scoring, Import.**

**Berichtigung 2026-09-07:** `[read]` **Der Orchestrator behauptete
zuerst, es gebe keine Marketplace-Spec.** `[cmd]` **Er hatte nach
Dateinamen gesucht, nicht nach Verzeichnissen** — **derselbe Fehler,
den er heute viermal bei Agenten angemerkt hat.**

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

`[cmd]` **`SPEC_05_WALLET_ECONOMICS.md` und `SPEC_09_SCORING.md`
beantworten das vermutlich** — **prufend lesen, bevor gefragt
wird.**

`[cmd]` **Und `SPEC_06_DATABASE_SCHEMA.md` mit 417 Zeilen sagt, was
Codex bauen muss** — **das ist der erste Auftrag, nicht die
Oberflaeche.**

## Und die Regeln gelten

`[cmd]` **E-68, E-69, E-70, E-71** — **von der ersten Zeile an.**

`[read]` **Das ist der Vorteil eines leeren Verzeichnisses:**
**nichts kann verschwinden, was von Anfang an sichtbar bleibt.**
