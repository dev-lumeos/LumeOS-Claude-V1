# Die Quellen, die vor jedem Auftrag gelesen werden

**Tom, 2026-09-08:** *,,wir haben schon 90% von lumeos gebaut
vorher, und das ist eine quelle die fast alle fragen beantwortet.
und ich kaempfe immer noch gegen dich, dass du diese quellen auch
nutzt."*

`[read]` **Diese Datei ist die Antwort darauf.** `[read]` **Sie
nennt die Quellen mit Pfad und Zeilenzahl, damit *,,ich wusste
nicht, wo"* keine Ausrede mehr ist.**

---

## 1 · Der Ist-Zustand ? erzeugt, taeglich

    docs/ssot/00-MODULTABELLEN.md   Tabellen, Spalten, Zeilen
    docs/ssot/00-SCHEMA.md          Funktionen, Policies, CHECKs
    docs/ssot/00-SPEC-ABGLEICH.md   Spec gegen Schema
    docs/ssot/00-ABGENOMMEN.md      was wann abgenommen wurde

`[read]` **Heisst die Tabelle so? Gibt es den Schreibweg? Was
erlaubt der CHECK?** ? **hier nachsehen, nicht messen.**

`[cmd]` **Am 2026-09-08 hat der Orchestrator FUENFMAL behauptet
statt nachgesehen, und wurde fuenfmal von Agenten berichtigt.**

## 2 · Die Specs ? 159 Dateien

    docs/spezifikation/00-QUELLEN.md    429 Zeilen, je Modul
    docs/specs/<Modul>/                 direkt oeffnen

`[cmd]` **`00-QUELLEN.md` sagt, welche Dateien es je Modul gibt.**
`[read]` **Sie wird geoeffnet, nicht erinnert.**

**Besondere Dateien, die nicht im Modulschema liegen:**

    docs/specs/Supplements/
      Injection Planner - Spec Change Request.md   371 Zeilen
      16 Injektionsorte, siteState, suggestSite,
      Sperren und Warnungen

## 3 · Das Vorgaengerrepo ? `referenz/lumeos-2026/`

**Die vollstaendige Karte: `docs/lehren/altrepo-karte.md`.**

`[read]` **Dort steht, WAS es gibt** ? **fuenf Apps, zwoelf
Fachmodule, `docs/modules/` mit je sieben Dateien nach gleichem
Schema, 259 Forschungsdateien.**

`[read]` **Wer wissen will, ob es etwas gibt, sieht dort nach** ?
**statt zu suchen.**

`[cmd]` **2.863 Markdown-Dateien, 19.654 ts/tsx.**

`[read]` **ACHTUNG: `git grep` findet dort NICHTS** ? **das
Verzeichnis ist nicht getrackt.** `[cmd]` **Mit dem Dateisystem
suchen, nicht mit git.**

### Coach und Buddy ? 277 Dateien, 2,8 MB

**Die vollstaendige Messung:
`docs/lehren/coach-plattform-altrepo.md`.**

`[cmd]` **`src/api/coach` 119 Dateien, `src/modules/coach` 42
Bauteile, `src/api/human-coach` 32, `src/modules/human-coach` 30,
`apps/coach` 40 mit zwanzig Routen.**

`[read]` **LumeOS `apps/coach` heute: 23 Dateien, 75 KB** ?
**Faktor 37.**

### Coach und Buddy ? Einzelquellen

    specs/coach-buddy-killer-feature.md          1591 Zeilen
      Die Produktvision, v1.6, Tom als Co-Autor.
      22 Kapitel. Kapitel 13-21 stehen in KEINER
      heutigen Spec:
        13  Medical Safety Layer (Hard Gate)
        14  Decision Boundary: Engine vs LLM
        15  Output Contract, Evidence-Pflicht
        16  Event Model (Workout-First)
        17  Coach Memory, strukturiert
        18  Cost Model
        19  Emotional Coherence Model
        20  Local-First Architektur-Prinzip
        21  Adaptive Intervention Engine ? der Moat
            Manipulation Guard, Behavior Stability Score

    AUTONOMY_ARCHITECTURE.md                      444 Zeilen
      Die Erlaubnismatrix, Z165-220, vollstaendig.
      Der Empfehlungsalgorithmus, Z224-262.
      Beantwortet C-426.

    AUTONOMY_QUICK_REFERENCE.md                   434
    AUTONOMY_INTEGRATION_CHECKLIST.md             503
    docs/modules/human-coach/COMPONENTS.md         37 KB
      Die 78 Bauteile beschrieben.

### Der Code, der mehr kann als LumeOS heute

    src/api/coach/utils/executionEngine.ts      53 KB
      fuehrt Handlungen aus
    src/api/coach/utils/buddyWatcher.ts         39 KB
      ueberwacht Buddy
    src/api/human-coach/routes/coach-actions.ts 50 KB
    src/api/human-coach/routes/autonomy.ts      404 Zeilen

    src/modules/human-coach/components/         27 Dateien
      ProgramBuilder.tsx        49 KB
      ClientDetail.tsx          39 KB
      BuddyDashboard.tsx        35 KB
      CoachDashboard.tsx        27 KB
      KnowledgeManager.tsx      26 KB
      CoachRoutineBuilder.tsx   24 KB

    src/modules/coach/components/               42 Dateien
      CoachRuleBuilder.tsx      30 KB
      MyCoachView.tsx           28 KB
      CoachOverridePanel.tsx    15 KB
      BuddyCommandCenter.tsx    15 KB

`[cmd]` **78 Bauteile, 428 KB.** `[cmd]` **LumeOS `apps/coach`: 23
Dateien, 75 KB, groesste Oberflaeche 10 KB.**

Tom: *,,wenn ich bei unserer variante reinschaue wird mir uebel."*

`[read]` **Struktur ja, Code nie** ? **und nachsehen, WARUM es
ersetzt wurde.**

### Marketplace ? eine eigene Domaene

`[cmd]` **Die Dokumentation ist vollstaendiger als beim Coach:**

    docs/modules/marketplace/DATABASE.md      960 Zeilen, 30 KB
      14 Tabellen mit vollem CREATE TABLE
    docs/modules/marketplace/MIGRATION.md      22 KB
    docs/modules/marketplace/FEATURES.md       21 KB
    docs/modules/marketplace/API.md            18 KB
    docs/modules/marketplace/COMPONENTS.md     17 KB
    docs/modules/marketplace/RESEARCH.md       14 KB
    docs/user-guide/07-wallet-marketplace.md   15 KB

    research/marketplace/competitive-analysis.md      16 KB
    research/marketplace/lumeos-marketplace-strategy.md 15 KB

`[cmd]` **Die 14 Tabellen:**

    marketplace_products          marketplace_creators
    marketplace_purchases         marketplace_wallet_transactions
    marketplace_categories        marketplace_product_variants
    marketplace_reviews           marketplace_review_votes
    marketplace_promotions        marketplace_promotion_usage
    marketplace_product_analytics + zwei Monatspartitionen
    marketplace_search_analytics

`[read]` **Auffaellig: Auswertung ist partitioniert nach Monat** ?
**`_2026_01`, `_2026_02`.** `[read]` **Jemand hat mit Menge
gerechnet.**

`[cmd]` **Und `seed-marketplace.ts`, 20 KB** ? **es gab Testdaten.**

**Die Oberflaeche:**

    src/modules/marketplace/components/
      CreatorHub.tsx        18 KB
      ProductDetail.tsx     16 KB
      MarketplaceView.tsx   15 KB
    apps/marketplace/app/    9 Dateien, eigene App

`[cmd]` **LumeOS heute: KEIN `market`-Schema.** `[cmd]` **C-419 hat
13 Tabellen gebaut und sie sind nicht eingespielt.**

---

## Die Regel

`[read]` **Vor jedem Auftrag, in dieser Reihenfolge:**

    1  docs/ssot/00-*        was IST
    2  00-QUELLEN.md         welche Spec es gibt
    3  die Spec selbst       was gewollt ist
    4  referenz/lumeos-2026  was schon gebaut war

`[read]` **Punkt 4 ist der, der uebersprungen wird** ? **und der,
der die meisten Fragen beantwortet.**

`[cmd]` **Beispiele vom 2026-09-08:**

    C-426  acht Achsen ohne Erlaubnisliste
           -> AUTONOMY_ARCHITECTURE.md:165 hat sie
    C-441  vier Injektionsorte statt sechzehn
           -> Injection Planner:48 hat alle sechzehn
    C-443  Coach kann nichts bauen
           -> ProgramBuilder, RuleBuilder, KnowledgeManager

`[read]` **Dreimal lag die Antwort bereit.** `[read]` **Dreimal
wurde stattdessen gemessen, vermutet oder gefragt.**
