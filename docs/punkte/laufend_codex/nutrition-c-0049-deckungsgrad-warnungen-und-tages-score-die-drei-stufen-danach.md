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
agent: codex
beauftragt: 2026-08-29
beruehrt:
  tabellen: ["nutrition.nutrient_search_aliases"]
  dateien: ["docs/ssot/146-coach-portal.md", "apps/coach/src/lib/browser-client.ts", "supabase/_pipeline/_testdaten/testdaten-einspielen.ts", "supabase/_pipeline/kette-ausfuehren.ts", "apps/coach/src/app/tokens.css", "docs/ssot/158-tab-zustand.md", "apps/web/src/lib/tab-url.ts", "tools/schuss.mjs", "docs/ssot/172-naehrstoff-aliase.md", "docs/ssot/168-naehrstoff-suche.md", "docs/ssot/166-naehrstoffbaum-anzeige.md", "docs/ssot/161-naehrstoffanzeige.md", "docs/ssot/154-preferences.md", "supabase/_pipeline/_testdaten/coach-portal-fuellen.sql"]
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
