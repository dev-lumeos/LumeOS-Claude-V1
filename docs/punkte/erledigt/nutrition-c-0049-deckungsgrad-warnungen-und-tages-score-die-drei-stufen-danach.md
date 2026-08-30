---
nr: C-49
typ: befund
modul: nutrition
schwere: hoch
angelegt: 2026-08-15
braucht: []
kind_von: G-122
kinder: [C-323, C-324]
entscheidung: null
agent: claudecode
beauftragt: 2026-08-30
erledigt: 2026-08-30
commit: OFFEN
beruehrt:
  tabellen: [nutrition.food_nutrients]
zahlen: null
---

# C-49 - Deckungsgrad, Warnungen und Tages-Score — die drei Stufen danach

## Befund

(neu 2026-08-15). Jede braucht eine eigene Entscheidung.

  **Stufe 1, gebaut:** `daily_reference_assessment` liefert Zahl und
  Wertart. Keine Bewertung in Worten, kein Ampelzustand — bewusst.

  **Stufe 2, offen: `micro_flags`.** `[read]` `SPEC_06` sieht die Tabelle
  vor, sie existiert nicht. Eine Warnung bei Unterversorgung ist eine
  medizinisch heikle Aussage — sie braucht eine Entscheidung darüber,
  **ab wann gewarnt wird und mit welcher Formulierung**. `[cmd]` Bei 21
  Nährstoffen ohne Referenzwert und 57 ohne eigenständigen kann die
  Warnung nur einen Teil abdecken.

  **Stufe 3, offen: der Tages-Score.** `[read]` `SPEC_09` führt eine
  Kennzahl 0–100 in `packages/scoring/`. `[cmd]` Das Paket existiert
  nicht. Ein einzelner Wert, der 24 Nährstoffe zusammenfasst, ist eine
  Gewichtungsentscheidung — welcher Nährstoff wie stark zählt, steht
  nirgends.

  **Reihenfolge:** erst die Oberfläche für Stufe 1 (C-48), dann sehen,
  ob Stufe 2 und 3 überhaupt gebraucht werden. `[read]` Die Lehre aus dem
  Suchumbau: vier Tage an Modellen gearbeitet, bevor jemand gemessen hat,
  was Menschen tatsächlich suchen.






















### F-07-Folgepunkte (Coach-Portal, 2026-08-20) — Nummern vergibt der Orchestrator

Quelle und Belege: `docs/ssot/146-coach-portal.md`. Bewusst ohne
eigene Nummern angelegt (A-18: die Nummer vergibt der Orchestrator).

- [ ] **Der Ausführer** — ein bestätigter `pending_actions`-Eintrag
  ändert nur seinen Status; niemand wendet `payload` auf das Zielmodul
  an, `action_log`/`undo_data` bleiben ungenutzt (seit ssot/139 offen,
  in F-07 bewusst nicht gebaut: braucht die Autonomy-Wirkungsregeln).
- [ ] **@supabase/ssr-0.1.0-Befund in `packages/shared` prüfen:**
  `[cmd]` `createBrowserClient` mit `cookieOptions` ohne `cookies`
  stürzt beim Session-Speichern ab, und `cookieOptions.name` wird im
  BrowserClient nicht zum storageKey — **`apps/admin` nutzt genau
  diesen Pfad** (Anmeldung dort gegenprüfen); Umgehung liegt als
  Vorlage in `apps/coach/src/lib/browser-client.ts`.
- [ ] **`apps/coach/.env.local` anlegen** (Tom — der Hook sperrt
  `.env`-Dateien zu Recht): drei Variablen nach `apps/admin`-Muster,
  Scope `coach`; bis dahin Startbefehl aus ssot/146.
- [ ] **`testdaten-einspielen.ts`: unbekannte Argumente ablehnen.**
  `[cmd]` `--database` wird still ignoriert (DB kommt aus
  `PGDATABASE`) — ein Lauf ging dadurch gegen live und blieb nur dank
  Ein-Transaktions-Bauweise folgenlos.
- [ ] **`kette-ausfuehren.ts`: tar-Aufruf Git-Bash-fest machen**
  (`--force-local` oder absoluter bsdtar-Pfad) — `[cmd]` MSYS-tar
  liest `D:\…` als Hostnamen.
- [ ] **Tokens-Duplikat auflösen:** `apps/coach/src/app/tokens.css`
  ist eine dokumentierte Kopie von `apps/web/.../lume.css` — in ein
  Paket ziehen, sobald `apps/web` frei ist.
- [ ] **Coach-Passwort:** `coach@lumeos.app` / `LumeosCoach2026` aus
  dem Seed — Tom ändert es bei Bedarf.
### G-117-Folgepunkte (Tab-Zustand/Wasser, 2026-08-20) — Nummern vergibt der Orchestrator

Quelle und Belege: `docs/ssot/158-tab-zustand.md`.

- [ ] **Supplements-Tab auf `useTabParam` umstellen** — das einzige
  Modul, dessen Tab noch in `useState` liegt (fremder Arbeitsbereich
  bei G-117); Zwei-Zeilen-Aenderung nach dem Muster der sechs anderen
  (`lib/tab-url.ts`).
- [ ] **Wassereintrag korrigieren statt loeschen+neu:**
  `updateWaterLogAmount` (Codex) liegt fertig und ungenutzt — ein
  Stift-Knopf neben dem Papierkorb waere der vollstaendige
  Fehlklick-Weg.
- [ ] **`tools/schuss.mjs` Git-Bash-fest machen:** Pfade ohne `?`
  werden von MSYS umgewandelt (`/v2/nutrition` → `C:/Program
  Files/Git/...`); `MSYS_NO_PATHCONV=1` im Skriptkopf setzen oder
  dokumentieren.

### C-165-Folgepunkte (Naehrstoff-Aliase, 2026-08-21) — Nummern vergibt der Orchestrator

Quelle und Belege: `docs/ssot/172-naehrstoff-aliase.md`.

- [ ] **apps/web-Anschluss der Aliase** (G-Auftrag, Nutrition-Agent):
  eine Abfrage auf `nutrition.nutrient_search_aliases` in
  `ladeOrdnung`, drittes Suchfeld `suchAlias` je Knoten, und die
  **Kurz-Token-Regelerweiterung** (Token trifft auch bei exakter
  Gleichheit mit einem `aliases_folded`-Eintrag — sonst findet
  „Vitamin B5" oder „kJ" nie etwas). Ohne diesen Auftrag liegen die
  98 Zeilen brach.
- [ ] **Thai-Umgangsnamen:** bewusst 0 importiert — ohne Sprecher oder
  Quelle waere jede Zeile erfunden. Braucht Recherche oder einen
  Sprecher, dann eine Erweiterung der Datendatei.
- [ ] **„Mineralstoffe" als Suchbegriff:** deckungsgleich mit der
  Elemente-Karte (16 Treffer) — Produktfrage, ob das Rauschen oder
  Hilfe ist.

### G-129-Folgepunkte (Naehrstoff-Suche, 2026-08-21) — Nummern vergibt der Orchestrator

Quelle und Belege: `docs/ssot/168-naehrstoff-suche.md`.

- [ ] **Probelaeufe ueberschreiben die gespeicherte Nutzeransicht:**
  seit G-122 ist jeder Klick im Nutrients-Tab Nutzerzustand — der
  G-129-Messlauf hat Toms Sicht („Auffaellig", 30 Tage) mit seinen
  Proben ueberschrieben. Kuenftige Nachweise sichern die Zeile vorher
  und schreiben sie zurueck, oder laufen auf `test-user`.
- [ ] **Kartenzuordnung als Auslegung gemeldet:** `FIBT` unter
  „Kohlenhydrate", Wasser/Alkohol/Organische Saeuren/Rohasche unter
  „Sonstige" — je eine Zeile in `karteFuerWurzel`, falls Tom es anders
  will.

### G-122-Folgepunkte (Naehrstoffbaum-Anzeige, 2026-08-21) — Nummern vergibt der Orchestrator

Quelle und Belege: `docs/ssot/166-naehrstoffbaum-anzeige.md`.

- [ ] **`CHOL` → `CHORL` fehlt (Codex):** der Cholesterin-Erklaertext
  liegt im Altbestand (Schluessel `CHOL`), `nutrient_defs` fuehrt
  `CHORL` — das Legacy-Mapping wurde bei C-161 nicht gezogen; das
  Modal zeigt fuer Cholesterin darum keine Erklaerung.
- [ ] **28 Codes ohne Erklaertext** (26 einzelne Fettsaeuren, `OLSAC`,
  `F18:2C9T11`) — das Vorgaengerrepo hat sie nie beschrieben. Ob sie
  Texte brauchen oder bewusst leer bleiben, ist eine Fach-Entscheidung
  mit Quellenarbeit, kein Import.
- [ ] **Deckungsgrenze (Tom):** Vorschlag aus G-122 — unter 50 %
  gedeckter Positionen (heute 9 Codes) den Wert dimmen und die „aus X
  von Y"-Angabe hervorheben; nicht ausblenden, nicht werten.
- [ ] **`SE` (Selen) hat keinen Zielcode** — BLS/`nutrient_defs`
  fuehren kein Selen; der Erklaertext liegt brach. Falls Selen je als
  Code dazukommt (Supplements fuehren es), haengt der Text dann dran.

### G-121-Folgepunkte (Naehrstoffanzeige, 2026-08-20) — Nummern vergibt der Orchestrator

Quelle und Belege: `docs/ssot/161-naehrstoffanzeige.md`.

- [ ] **Die Ziele haengen am Stichtag:** `daily_reference_assessment`
  liefert an einem Tag ohne Eintraege keine Zeilen — ein Zeitfenster,
  das auf einem leeren Tag endet, zeigt Werte, aber keine Ziele.
  Entweder die Referenzauswahl vom Tagesprotokoll entkoppeln (Codex)
  oder in der Anzeige auf den letzten protokollierten Tag ausweichen.
- [ ] **`test-user@lumeos.local` traegt eine Mahlzeit** (2026-08-16,
  aus einem frueheren Nachweis) — Nullzustands-Messungen muessen sie
  erst abraeumen oder einrechnen.

### G-104-Folgepunkte (Preferences, 2026-08-20) — Nummern vergibt der Orchestrator

Quelle und Belege: `docs/ssot/154-preferences.md`.

- [ ] **`ultra_processed` filtert haerter, als die Kachel sagt:**
  `[cmd]` Ein General-Ausschluss mit Tag-Entsprechung wirkt hart wie
  ein Allergen (075:382-390) — `schokolade` 163 → 1. Entweder ein
  Wirkungshinweis an der Pille oder Toms Entscheidung, ob ein
  Verarbeitungsmerkmal hart ausschliessen soll.
- [ ] **Intoleranz-Stufe erklaeren:** „Sensibel" schliesst nur bei
  leerer Anfrage aus, sonst −25 (`[cmd]` 075:453-455) — gewollt, aber
  fuer den Nutzer nirgends gesagt.
- [ ] **Rezept-/Planner-Zutatensuche:** sobald G-97 dort ein Suchfeld
  bekommt, `prefs=1` mitentscheiden (Erfassungs-Grundsatz spricht
  fuer an).
- [ ] **Food-DB-Katalog:** sichtbarer „mit meinen
  Vorlieben"-Schalter (serverseitig) statt der
  G-73-Client-Ausblendung — Produktfrage, in G-104 bewusst nicht
  umgebaut.

- [ ] **Seed-Neulauf reisst die Portal-Athleten aus den Seed-Konten:**
  `[cmd]` `max.seed`/`sarah.seed` werden beim Auffrischen neu angelegt,
  ihre Beziehungen zu `coach@lumeos.app` sterben per FK-Kaskade — das
  Portal zeigt dann 1 statt 3 Athleten (die `dev`-Beziehung überlebt
  seit dem Fix vom 2026-08-20). Entweder `coach-portal-fuellen.sql` an
  den Auffrisch-Ablauf anhängen oder in den Seed-Erzeuger ziehen.

## Auftrag

**Mitbeauftragt mit C-346 am 2026-08-29.** Der Auftragstext
und der Bericht stehen dort.

## Verweis

Status der drei Stufen: [C-346 — zwei Detailtexte neu verknuepfen](nutrition-c-0346-zwei-detailtexte-neu-verknuepfen.md).

## Zwischenstand, 2026-08-29

**Aus C-346 geprueft.**

`[cmd]` **C-323 ist erledigt** — die Dauerregel steht.
`[cmd]` **C-324 ist blockiert** — NRF9.3 verlangt Vitamin A in IE.

`[read]` **Damit haengt diese Klammer an einer einzigen offenen
Frage: C-342, die Vitamin-A-Einheit.** `[cmd]` **C-343 ist
geschlossen** — die vermutete Vitamin-C-Luecke war keine.

`[read]` **Der Punkt bleibt offen, aber er ist kein Sammelpunkt
mehr.**

## Auftrag — die Klammer schliessen, und drei Module pruefen

**Mitbeauftragt: A-36.**

## Zu C-49 im Einzelnen

**Beauftragt am 2026-08-30.**

### Was uebrig ist

`[cmd]` **C-323 erledigt** — die Dauerregel steht und ist angebunden.
`[cmd]` **C-343 geschlossen** — die vermutete Vitamin-C-Luecke war
keine. `[cmd]` **C-342 erledigt** — die Faktoren stehen, Vitamin A
rechnet aus den Komponenten.

`[cmd]` **C-324 ist blockiert:** die Vitamin-A-Funktion liefert
`incomplete`, weil ueber alle 30 geprueften Tage keine
Komponentenbilanz vollstaendig war.

`[read]` **Miss, ob das noch gilt** — **seit dem 30.08. sind
Faktoren, Quellengeltung und Flag-Funktion eingespielt.**

### Die Frage

**Was bleibt von der Klammer, und ist der Score baubar?**

`[read]` **Wenn die Komponentenbilanz weiter unvollstaendig ist,
bleibt C-324 blockiert** — **und dann sag, woran genau.**

`[read]` **Wenn nicht: dann ist der Score baubar, und C-49 kann
geschlossen werden.**

`[cmd]` **E-25 gilt:** NRF9.3 in der Originalfassung, die Deckelung
bei 100 Prozent, Gesamtzucker statt *added sugars*, **und ein Tag mit
Fehlzaehlern liefert `incomplete`, keine kuenstlich niedrige Zahl.**

### Was nicht zu tun ist

**Keine Sportler-Variante** — sie waere unsere Formel, nicht die
belegte.
**Keinen Wert erfinden, wo Bestandteile fehlen.**
**Nichts auf `dev@lumeos.app` schreiben.**
Nicht committen, nicht stagen, nicht pushen.

### Nachweis

    Vitamin A in IE       rechenbar an wie vielen Tagen?
    NRF9.3                gebaut oder begruendet nicht
    incomplete            an wie vielen Tagen, warum
    C-49                  was bleibt, was faellt

## Bericht

**Claude Code, 2026-08-30.** Mitbeauftragt: A-36. Nichts auf
`dev@lumeos.app` geschrieben, nichts committet, nichts gestaged.

### 1 · C-49 — C-324 bleibt blockiert, und der Blocker ist ein anderer

`[cmd]` **Die Vitamin-A-Funktion liefert weiterhin `incomplete`, an
allen 30 Tagen** (2026-08-01 bis -08-30, `dev@lumeos.app`), **mit
konstant 2 von 3 fehlenden Komponenten.**

#### Woran genau

`[cmd]` **`vitamin_a_iu_daily` braucht drei Komponenten** — `RETOL`,
`CARTB`, `CAROTPAXB` — und rechnet nur, wenn **alle drei** vollstaendig
sind:

    RETOL       30 / 30 Tage vollstaendig
    + CARTB      0 / 30
    + CAROTPAXB  0 / 30

`[read]` **Beta-Carotin allein bricht jeden Tag.** Es liegt nicht an
der exotischen dritten Komponente.

`[cmd]` **Am 2026-08-29 fehlten die Werte bei genau drei Posten:**
Kabeljau und weisser Reis (kein `CARTB`, kein `CAROTPAXB`),
Ziegenfleisch (kein `CAROTPAXB`). **Alle drei enthalten
tatsaechlich kein Carotin.**

#### Und eine gefallene Praemisse: C-343 war zu frueh geschlossen

`[cmd]` **Der Auftrag sagt, die Vitamin-C-Luecke sei keine gewesen.**
`[cmd]` **Gemessen: `VITC` ist an 0 von 30 Tagen vollstaendig, mit 98
fehlenden Posten** — die groesste Luecke aller zwoelf
NRF9.3-Naehrstoffe.

    Naehrstoff        vollstaendige Tage    fehlende Posten
    PROT625, CA, FE,
    MG, K, FASAT,
    SUGAR, NACL              30 / 30                     0
    VITE                     25 / 30                     5
    FIBT                     24 / 30                     6
    NA                       23 / 30                     7
    VITC                      0 / 30                    98
    Vitamin A (IE)            0 / 30      je 2 v. 3 Komponenten

`[read]` **Zwei von neun positiven Naehrstoffen sind an keinem
einzigen Tag vollstaendig.** Damit ist NRF9.3 nicht rechenbar — und
E-25 verbietet ausdruecklich, die Luecke als Mangel auszugeben.

#### Die Ursache ist eine Datensemantik, kein Baufehler

`[cmd]` **`daily_nutrient_summary_long` setzt `value_complete` nur,
wenn JEDER Posten des Tages den Wert traegt:**

    value_complete = item_count > 0 AND item_count = value_count

`[cmd]` **Und der BLS verzeichnet ein Nichtvorkommen als FEHLEND,
nicht als 0.** Am 2026-08-29 fehlte `VITC` bei Ei, Kabeljau, weissem
Reis und Ziegenfleisch.

`[cmd]` **Das ist systematisch.** Von 7.140 Lebensmitteln fuehren:

    RETOL       7.092   (99,3 %)
    VITC        6.720   (94,1 %)   -> 420 ohne Zeile
    CARTB       6.325   (88,6 %)
    CAROTPAXB   5.093   (71,3 %)

`[cmd]` **Die 420 ohne `VITC` sind erwartbar:** 126 Lamm/Schaf, 64
rohe Koerner, 32 Schweinefleisch, 32 Huelsenfruechte/Nuesse, 26
magerer Seefisch, 15 Pflanzenoele.

`[read]` **Ein einziges Stueck Fleisch macht den Vitamin-C-Tag
unvollstaendig** — nicht weil ein Wert fehlt, sondern weil eine
Null nicht erfasst wird.

#### Was daraus folgt

`[read]` **Was fehlt, ist eine Entscheidung, keine Rechnung:** **darf
ein fehlender Naehrwert als 0 zaehlen, wenn das Lebensmittel ihn
erwartungsgemaess nicht enthaelt?**

`[read]` **Das ist eine fachliche Frage und betrifft mehr als den
Score** — jede Deckungsrechnung haengt daran. **Sie gehoert Tom, nicht
einem Auftrag.**

`[cmd]` **Nichts gebaut, wie beauftragt:** keine Formel, keine
Sportler-Variante, kein Wert, wo Bestandteile fehlen. **Die Messung
steht in `apps/web/src/lib/nutrition/score-lage.ts`**, damit der
naechste Auftrag sie nicht wiederholt.

#### Was von der Klammer bleibt

    C-323   erledigt      die Dauerregel steht
    C-343   NEU ZU OEFFNEN   die Vitamin-C-Luecke ist da:
                             0/30 Tage, 98 fehlende Posten
    C-342   erledigt      die Faktoren stehen, RETOL rechnet
    C-324   blockiert     nicht mehr an der Einheit, sondern an
                          der Erfassungssemantik (VITC + CARTB)

`[read]` **C-49 kann nicht geschlossen werden** — aber der Grund ist
jetzt benannt und ist ein anderer als im Nachtrag zu E-25.

### 2 · A-36 — die drei Module kommen nicht mehr aus dieser Datei

**Der Auftrag: zuerst messen, ob sie ueberhaupt noch von dort
kommen.** `[cmd]` **Sie tun es nicht.**

    module-stubs-replacement.jsx   liegt unter docs/spezifikation/
                                   10-plattform/design-system/theme-v1/
    Importe aus apps/ oder
      packages/ darauf             0

`[read]` **Der Punkt beschreibt eine Entwurfsquelle, kein Bauteil.**

#### Und es ist NICHT der Fall des Coaches-Reiters

`[cmd]` **Gemessen am Schirm, angemeldet:**

    Navigationseintrag   Ziel
    Marketplace          https://marketplace.lumeos.app
    Admin                https://admin.lumeos.app
    Coach Portal         https://coach.lumeos.app

    /v2/marketplace      HTTP 404
    /v2/admin            HTTP 404
    /v2/onboarding       HTTP 404

`[read]` **Beim Coaches-Reiter stand die echte Komponente daneben und
bekam kein Prop.** `[read]` **Hier gibt es keine Komponente, die man
verdrahten koennte** — die Module sind eigene Produkte auf eigenen
Domains, und die Verweise sagen das auch.

#### Admin ist gebaut, nur woanders

`[cmd]` **`AdminFoodDB` aus A-36 heisst heute `curation`:**
`apps/admin/src/app/curation/page.tsx`, **314 Zeilen**, mit
`middleware.ts`, Anmeldung, API-Route und zwei Testdateien daneben.

`[read]` **Ein Punkt, der das als Attrappe fuehrt, ist um eine ganze
App herum veraltet.**

#### Das Urteil je Modul

    Marketplace   nicht gebaut, keine Route, externer Verweis.
                  Eine Produktentscheidung, kein Befund.
    Admin         GEBAUT, als eigene App (apps/admin).
                  A-36 ist insoweit ueberholt.
    Onboarding    nicht gebaut, keine Route.
                  G-83 haelt das fest; unveraendert offen.

`[read]` **A-36 kann als Attrappen-Befund geschlossen werden.** Was
bleibt, ist die Produktfrage, ob Marketplace und Onboarding in diese
Anwendung gehoeren — **und die stand nie in diesem Punkt.**

### Nachweis

    Vitamin A in IE   an 0 von 30 Tagen rechenbar.
                      RETOL allein 30/30; mit CARTB 0/30.
    NRF9.3            NICHT gebaut, begruendet: zwei von neun
                      positiven Naehrstoffen an keinem Tag
                      vollstaendig (VITC 0/30, VitA 0/30).
                      E-25 verbietet die kuenstlich niedrige Zahl.
    incomplete        an 30 von 30 Tagen. Grund: `value_complete`
                      verlangt JEDEN Posten, und der BLS erfasst
                      ein Nichtvorkommen als fehlend statt als 0.
                      420 von 7.140 Lebensmitteln ohne VITC-Zeile,
                      erwartbar verteilt (Fleisch, Koerner, Oele).
    C-49              bleibt offen; C-343 ist neu zu oeffnen,
                      C-324 haengt an einer Fachentscheidung.
    A-36              geschlossen als Attrappen-Befund: kein Code
                      zieht aus dem Mockup, Marketplace/Admin sind
                      externe Verweise (404 als Route), Admin ist
                      als eigene App gebaut.

### Waechter und Sabotageprobe

**Neu:** `apps/web/src/lib/nutrition/score-lage.ts` (Messung, keine
Formel) und `__tests__/score-lage.test.ts` (6 Waechter).

**Neun Sabotagen, jede einzeln, Rueckbau je byte-gleich (SHA-256) —
alle neun fallen:**

    C-49  VITC als vollstaendig ausgeben
    C-49  Vitamin A als vollstaendig ausgeben
    C-49  die Blockerliste leeren
    C-49  `istBaubar` auf true drehen
    C-49  die NRF-Rechnung doch einbauen
    C-49  eine Sportler-Variante anlegen
    C-49  die offene Frage entkernen
    A-36  Marketplace auf eine eigene Route legen
    A-36  Admin auf eine eigene Route legen

`[cmd]` **Zwei eigene Fehler, von der Kette gefangen:**

**a) Ein Waechter fand sein Wort im eigenen Kommentar.** Die Pruefung
*„keine Sportler-Variante"* las die Datei roh — **und der Satz
*„Keine Sportler-Variante"* steht in ihrem Kopf.** `[read]` **G-186
zum dritten Mal.** Behoben: ohne Kommentare pruefen.

**b) Ein Waechter starb am Erfolgsfall.** `git grep -l` endet mit
Status 1, wenn es **nichts** findet — und genau das ist hier das
gewuenschte Ergebnis. Der Test meldete *„Command failed"* statt
*„sauber"*. Behoben: Status 1 abfangen, alles andere werfen.

### Laeufe

    pnpm --filter @lumeos/web test    1063 pass, 0 fail (vorher 1056)
    turbo typecheck                    gruen
    pnpm gate                          11/11 Tasks gruen
    [abwesenheit]                      10 Marken, alle gelten noch
    [encoding]                         20.547 Dateien sauber

### Dateien

    apps/web/src/lib/nutrition/score-lage.ts               neu
    apps/web/src/lib/nutrition/__tests__/
      score-lage.test.ts                                   neu
    backup/a36-nav.png                                Nachweis

## Abnahme

**2026-08-30, Orchestrator.**

### C-324 bleibt blockiert, und der Blocker ist ein anderer

`[cmd]` **`vitamin_a_iu_daily` braucht `RETOL`, `CARTB`,
`CAROTPAXB`** — **`RETOL` allein ist an 30 von 30 Tagen vollstaendig,
mit `CARTB` faellt es auf 0.**

`[read]` **Beta-Carotin allein bricht jeden Tag.** **Nicht die
exotische dritte Komponente, wie E-34 unterstellt hat.**

### Und eine Praemisse von mir ist gefallen

`[cmd]` **`VITC` ist an 0 von 30 Tagen vollstaendig, mit 98 fehlenden
Posten** — **die groesste Luecke aller zwoelf NRF9.3-Naehrstoffe.**

    acht Naehrstoffe    30 / 30 Tage
    VITE                25 / 30
    FIBT                24 / 30
    NA                  23 / 30
    VITC                 0 / 30      98 fehlende Posten
    Vitamin A            0 / 30      je 2 von 3 Komponenten

`[read]` **Ich habe C-343 am 29.08. geschlossen mit *,,die vermutete
Vitamin-C-Luecke war keine"*.** `[read]` **Das war falsch, und es war
mein Fehler:** **Tom sagte, nicht jedes Lebensmittel habe Vitamin C —
richtig. Ich habe daraus geschlossen, es gebe keine Luecke.**

`[read]` **Beides stimmt gleichzeitig:** die 420 Lebensmittel ohne
`VITC` enthalten tatsaechlich keins, **und die Tagesbilanz ist
trotzdem an keinem Tag vollstaendig.**

**C-343 ist wieder offen.**

### Die Ursache ist Datensemantik, kein Baufehler

`[cmd]` **`value_complete = item_count > 0 AND item_count =
value_count`** — **jeder Posten des Tages muss den Wert tragen.**

`[cmd]` **Und der BLS verzeichnet ein Nichtvorkommen als FEHLEND,
nicht als 0.** `[cmd]` **Am 2026-08-29 fehlte `VITC` bei Ei,
Kabeljau, weissem Reis und Ziegenfleisch.**

`[read]` **Ein einziges Stueck Fleisch macht den Vitamin-C-Tag
unvollstaendig** — **nicht weil ein Wert fehlt, sondern weil eine
Null nicht erfasst wird.**

`[cmd]` **Systematisch: 420 von 7.140 ohne `VITC`** — 126 Lamm, 64
rohe Koerner, 32 Schweinefleisch, 26 magerer Seefisch, 15
Pflanzenoele.

`[read]` **Nichts gebaut: keine Formel, keine Sportler-Variante, kein
erfundener Wert.** **Die Messung ist festgehalten, damit der naechste
Auftrag sie nicht wiederholt.**

### A-36 — geschlossen, und es ist nicht der Coaches-Fall

`[cmd]` **Kein Import aus `apps/` oder `packages/` zeigt auf die
Entwurfsdatei.** `[cmd]` **Marketplace und Admin sind externe Verweise,
`/v2/marketplace`, `/v2/admin` und `/v2/onboarding` liefern 404.**

`[read]` **Beim Coaches-Reiter stand die echte Komponente daneben und
bekam kein Prop. Hier gibt es keine Komponente** — **die Module sind
eigene Produkte auf eigenen Domains.**

`[cmd]` **Und Admin ist gebaut: `apps/admin` mit 314-zeiliger
Kurationsseite, Middleware, Anmeldung und Tests.** `[read]`
**`AdminFoodDB` aus dem Punkt ist die heutige Kuration.**

### Zwei eigene Waechter fielen zuerst

`[cmd]` **Einer fand seinen eigenen Verbotstext im eigenen
Kommentarkopf** — **G-186 zum dritten Mal.** `[cmd]` **Und einer
starb am Erfolgsfall, weil `git grep -l` mit 1 endet, wenn es nichts
findet.**

`[cmd]` 1063 Tests, 9 Sabotagen, Gate 11/11.

**Abgenommen.** Die Entscheidung geht als **C-360** an Tom, C-343 ist
wieder offen.

