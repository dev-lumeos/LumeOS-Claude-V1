# 158 — Tab-Zustand in der Adresse, Wasser-Historie, Nährstoff-Klappen

**Auftrag:** G-117 · **Stand:** 2026-08-20 · **Module:** alle (Teil A),
Nutrition (B, C)
**Vorher:** G-111/G-115/G-113 (Toms Befunde), G-101 (Insights-Kacheln,
Schnellknöpfe), G-67 (Abfrage-Muster), C-157 (läuft bei Codex)

**Kurz:** Der Tab steht jetzt **in allen Modulen in der Adresse** — ein
Hook (`lib/tab-url.ts`), sechs Module als Drop-in umgestellt, Nutrition
hatte das Muster schon; **der eigentliche Täter am „Tagwechsel springt
auf Diary" war die Datumsnavigation**, die beim Blättern alle übrigen
Parameter wegwarf. Die **Wasser-Historie** zeigt die Einträge des Tages
und löscht mit benennender Abfrage — der Servercode dafür lag komplett
vor (Codex), es fehlten nur HTTP-Verb und Oberfläche. Die
**Nährstoffgruppen** sind standardmässig alle zu (12/12), der Platz für
den C-157-Zeitfilter ist markiert, der Filter bewusst nicht gebaut.
Alles gemessen; Tests 441/441.

---

## Wie der Tab in die URL kommt — und ob es alle Module betrifft

### Zwei Befunde vorab, beide gemessen

1. `[cmd]` **`?tab=insights` liefert heute Insights** — „Calorie
   balance" ×2, „Makroschnitt" ×1 im HTML, aktiver Tab „Insights". Der
   `[cmd]` aus G-111 (0 Treffer) war zum Zeitpunkt dieses Auftrags
   nicht mehr reproduzierbar; die plausible Erklärung ist der hängende
   Dev-Server desselben Tages (G-109) — Nutrition trägt den Tab schon
   seit G-38 in der Adresse (`tableiste.tsx`), und die Seite lädt je
   Tab serverseitig.
2. `[cmd]` **Der echte Täter am Diary-Sprung:** `datumsnavigation.tsx`
   baute die Adresse beim Blättern neu auf —
   `router.push('/v2/nutrition?datum=…')` — und **warf `?tab=` damit
   weg.** Toms „Tagwechsel springt auf Diary" war kein
   Zustandsproblem, sondern ein Parameterverlust.

### Was gebaut ist

- **Eine Stelle:** `apps/web/src/lib/tab-url.ts` — `useTabParam(
  standard)` als **Drop-in-Ersatz** für `React.useState('…')`: liest
  `?tab=`, schreibt beim Wechsel (der Standard hält die Adresse sauber
  und schreibt keinen Parameter), **erhält alle übrigen Parameter**,
  nutzt `router.push` (Zurück-Taste läuft über die Tabs). Ein von Hand
  getippter unbekannter Wert wird nicht geklammert — die Tab-Listen
  leben in den Modulen, eine zweite Liste im Hook wäre Drift; die
  Ansicht zeigt dann ihren Kopf ohne Inhalt.
- **Sechs Module umgestellt** (je zwei Zeilen: Import + Ersatz):
  Training (`today`), Recovery (`today`), Goals (`goals`), Medical
  (`dashboard`), Coach (`overview`), Coach/AI (`chat`).
- **Datumsnavigation repariert:** sie setzt jetzt nur noch `datum` und
  lässt den Rest stehen.

### Die sieben Module, geprüft

| Modul | Stand |
|---|---|
| Nutrition | hatte das Muster (G-38); Täter war die Datumsnavigation — behoben |
| Training, Recovery, Goals, Medical, Coach, Coach/AI | `[cmd]` alle hielten den Tab in `useState` — auf den Hook umgestellt |
| Dashboard | `[cmd]` hat keine Modultabs — nichts zu tun |
| **Supplements** | `[cmd]` hält den Tab weiter in `useState` (`ansicht.tsx`, dazu `tab-injektionen.tsx`) — **fremder Arbeitsbereich (Claude Code), nur gemeldet**; die Umstellung ist dieselbe Zwei-Zeilen-Änderung |

**Bewusst lokal geblieben:** innere Karten-Tabs (`tab-plans`,
`phase-editor`, `tab-injektionen`) — sie sind Zustände einer Kachel,
keine Ansichten; eine Adresse je Kachelzustand wäre Lärm.

`[cmd]` **Gemessen:** `/v2/training?tab=history` → aktiver Tab
„History"; Klick auf „Exercises" → Adresse `?tab=library`; **Neuladen →
Exercises bleibt.** Nutrition: `?tab=insights`, Pfeil zurück →
**`?tab=insights&datum=2026-08-19`**, aktiver Tab bleibt Insights.
`[read]` Damit ist jeder Tab jetzt auch **von aussen messbar** —
`tools/schuss.mjs` hat in diesem Auftrag erstmals einzelne Tabs
fotografiert.

---

## Was die Wasserliste zeigt

`[cmd]` **Der Servercode lag komplett vor** — `water-write.ts` (Codex)
führt `listOwnWaterLogs`, `removeWaterLog` (mit der
Null-Zeilen-Prüfung nach G-79: RLS macht „gibt es nicht" und „gehört
jemand anderem" bewusst ununterscheidbar) und sogar
`updateWaterLogAmount`. **Es fehlten nur HTTP-Verb und Oberfläche.**

- **Route:** `GET /api/nutrition/water?datum=…&liste=1` legt die
  Einzeleinträge bei (ohne den Parameter bleibt die Antwortform für
  Bestandsaufrufer unverändert); **`DELETE ?id=…&datum=…`** entfernt
  und antwortet mit neu gerechnetem Tag **plus** Restliste — dieselbe
  Quelle wie beim Laden.
- **Kachel:** „Eintraege ansehen" klappt die Tagesliste auf (Zeit ·
  Menge · Quelle: Schnellknopf/Eingabe), je Zeile ein Papierkorb. Das
  Löschen fragt nach dem **Daumen-Muster (G-67): die Abfrage NENNT den
  Eintrag** — `[cmd]` gemessen: *„750 ml von 20:00 loeschen? Das
  laesst sich nicht rueckgaengig machen."* Ein neuer Eintrag über die
  Schnellknöpfe erscheint sofort in der offenen Liste.

`[cmd]` **Der Kreis belegt:** Liste offen (2 Einträge) → 250 ml
angelegt (3) → letzter gelöscht mit Abfrage (2) → **Neuladen → 2.**
`updateWaterLogAmount` (Menge korrigieren statt löschen+neu) liegt
brach — als Folgepunkt notiert, kein Teil von G-117.

---

## Wie die Gruppen klappen

`[cmd]` Die Klappmechanik existierte seit G-101 (`aria-expanded`,
Chevron, „36 Einträge · 5 mit Wert" im Kopf) — **der Standard war
„erste Gruppe offen"**. Toms Vorgabe „standard eingeklappt" ist
umgesetzt: `[cmd]` **12 von 12 Gruppen zu, 0 offen**; der erste Klick
öffnet die Fettsäuren mit ihren **36 Zeilen** — genau der Block, der
den Tab vorher unlesbar machte.

**Der Platz für den Zeitfilter ist markiert, der Filter nicht
gebaut:** ein Kommentar an der Kopfkarte benennt die Stelle
(1/7/14/30/45/60/90 Tage) und die Abhängigkeit — die Klappen sind vom
Filter unabhängig, er ändert nur die Werte je Zeile, nicht die
Gliederung.

---

## Was auf C-157 wartet

- **Die Zeitfilter** (Toms zweite Hälfte von G-113): `daily_summary`
  führt 37 von 138 Nährstoffen als Spalten; erst die lange Form macht
  den Zeitraum-Schnitt zu einer Abfrage.
- **Der Stärke-Fall:** `[read]` Die Anzeige zeigt heute `sugar`
  (56,9 g), obwohl Stärke (188,1 g) und zehn weitere rechenbar wären —
  **C-157, nicht dieser Auftrag; nicht umgangen.**

## Nachweise

| Behauptung | Beleg |
|---|---|
| `?tab=insights` liefert Insights | `[cmd]` „Calorie balance" ×2, „Makroschnitt" ×1 im HTML, aktiver Tab Insights |
| Tagwechsel bleibt im Tab | `[cmd]` Pfeil zurück → `?tab=insights&datum=2026-08-19`, Tab bleibt |
| Hook wirkt in den Modulen | `[cmd]` Training: direkt `?tab=history` ✓, Klick → `?tab=library` in der Adresse, Neuladen hält |
| Wasserliste + Löschen | `[cmd]` 2 → 3 → 2 → nach Neuladen 2; Abfrage nennt Menge und Uhrzeit |
| Zeilenschutz | `[cmd]` `test-user@lumeos.local`: eigene Liste **0** Einträge; DELETE auf eine dev-Id → **404 `NOT_FOUND`**, devs Einträge unverändert (2/2) |
| Gruppen | `[cmd]` 12 zu / 0 offen; Klick → 1 offen, 36 Zeilen |
| Bilder | `backup/g117/`: Diary mit offener Liste (4: hell/dunkel × 1440/375), Nutrients zu (4), Insights (2). Attrappen: Diary 5 (Bestand, unverändert — Vorlage-Kacheln des Diary plus Buddy-Orb), Nutrients 1 (Orb), Insights 4 (Orb + drei G-101-Entwurfskacheln); je 2 Konsolenfehler = bekannte `data-mode`-Hydrationswarnung der Schale |
| Typen und Tests | `[cmd]` `pnpm --filter @lumeos/web typecheck` grün, Tests **441/441** |

## Was nicht angefasst wurde

- **`supplements/`** — der `useState`-Tab dort ist gemeldet, nicht
  umgestellt (Claude Codes Bereich).
- **Kein Schema, keine Zeitfilter, keine Preferences, kein
  `packages/ui`.**
- `water-write.ts`/`water-model.ts` (Codex) unverändert — nur benutzt.

## Werkzeugbefund am Rand

`[cmd]` `tools/schuss.mjs` mit Pfad **ohne** `?` scheitert unter
Git-Bash an der MSYS-Pfadumwandlung (`/v2/nutrition` →
`C:/Program Files/Git/v2/nutrition`); `MSYS_NO_PATHCONV=1` löst es.
Pfade mit `?tab=` waren nie betroffen — deshalb fiel es erst jetzt auf.
