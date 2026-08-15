# Theme V1 umsetzen — der Plan

`[cmd]` Erstellt 2026-08-15, Anker `f64daa5`.
Grundlage: `theme-v1/` — `[cmd]` 55 Modulseiten, `shell.jsx`, `shared.jsx`,
`styles.css` mit 32 Tokens und 123 Klassen, dazu zwölf Bildschirmfotos.

**Toms Vorgabe:** *„Was ich nicht will ist die bestehende Variante
löschen, ich will die neue Variante parallel haben."* Und: *„Es gibt
diverse Sachen die mir noch nicht gefallen, aber das sind grafische
Elemente die man anpassen kann wenn wir sie umsetzen."*

Der Entwurf ist **Vorlage, nicht Vertrag.** Änderungen kommen beim Bauen.

---

## Die Parallelität — und warum sie so aussieht

**Neue Oberfläche unter `/v2`, alte bleibt unberührt.**

| | |
|---|---|
| alt | `apps/web/src/app/nutrition/…` → `/nutrition` |
| neu | `apps/web/src/app/v2/nutrition/…` → `/v2/nutrition` |

`[cmd]` Zwölf Modulordner liegen heute direkt unter `app/`. Eine
Next.js-Routengruppe `(v2)` scheidet aus — sie erscheint nicht in der URL
und würde mit den bestehenden Pfaden kollidieren. Das sichtbare Präfix
ist die einfachste Trennung und am Ende ein Umbenennen.

**Was geteilt wird und was nicht:**

- **Geteilt:** die gesamte Datenschicht — `lib/nutrition/food-search.ts`,
  die `rpc()`-Aufrufe, die Supabase-Klienten, `middleware.ts`. `[cmd]`
  Dort steckt die Arbeit von zwei Tagen; sie wird nicht dupliziert.
- **Neu:** alle Komponenten, in `packages/ui`. `[cmd]` Das Paket enthält
  heute nur `src/.gitkeep` — es ist der vorgesehene Ort und leer.
- **Erweitert:** `lume.css`. `[cmd]` Die 32 Tokens im Entwurf sind
  identisch mit den vorhandenen; die 123 Klassen kommen dazu, unter einem
  eigenen Präfix, damit die alten Seiten unberührt bleiben.

**Die Umschaltung ist der letzte Schritt**, nicht der erste: wenn alle
Module stehen, werden die alten Ordner entfernt und `v2` hochgezogen.
Bis dahin läuft beides.

---

## Reihenfolge, und warum

**1. Shell zuerst, kein Modul.** `[cmd]` `sidebar`, `topbar`,
`breadcrumb`, die Kontextspalte, `card` in drei Varianten,
`module-header` mit Akzent — diese Klassen wiederholen sich in allen 55
Modulseiten. Wer sie beim zweiten Modul nachbaut, baut sie falsch.

**2. Nutrition als erstes echtes Modul.** `[cmd]` Nur dort ist die
Datenseite vollständig: Suche mit 234 ms, 7.140 Anzeigenamen, Tagebuch,
24 Mikros mit Fehlzählern, Bewertung gegen 165 Referenzwerte, eigene
Lebensmittel. Jedes andere Modul bräuchte zuerst Daten.

**3. Dashboard danach**, weil es aus allen Modulen zusammenträgt und
erst sinnvoll ist, wenn eines davon echt ist.

**4. Der Rest nach Datenlage.** `[cmd]` Training hat 1.416 Übungen, aber
keine deutsche Namensschicht und keine Suchfunktion (C-16). Recovery,
Supplements, Medical, Goals, Coach, Marketplace haben noch keine
Datenseite.

---

## Was beim Bauen mitentschieden wird

`[read]` Aus dem Diskussionsstand, Abschnitt 8 und 9, und aus der
Messung in `docs/ssot/68-theme-faehigkeit.md`:

- **Die elf Modul-Akzente liegen alle bei Helligkeit 0,74–0,80.** In
  Graustufen und bei Farbsehschwäche nicht unterscheidbar. Im Entwurf
  fällt das nicht auf, weil Symbol und Position mittragen — das ist die
  Absicherung, nicht die Lösung.
- **`--pos`, `--warn`, `--neg` fehlen im Hellmodus des Entwurfs.**
  `[cmd]` Im Repo am 2026-08-15 repariert; beim Übernehmen darf der
  Fehler nicht zurückkommen.
- **Die Kontextspalte auf jedem Bildschirm** braucht ab Tablet abwärts
  eine Antwort: Blatt, Reiter, oder weg.
- **Buddy antwortet kontextbezogen auf jeder Seite.** Das ist ein
  Modellaufruf je Seitenaufruf — eine Kostenfrage, keine Designfrage.

---

## Zwei Korrekturen an der Sidebar

**Tom, 2026-08-15.** Beide betreffen die Navigation, nicht das Aussehen.

**Workspaces sind Links, keine Module.** `[read]` `Coach Portal`,
`Marketplace` und `Admin` stehen im Entwurf unter „WORKSPACES", als lägen
sie in derselben Anwendung. Sie sind eigene Domain-Apps — `apps/web`
verlinkt sie, bettet sie nicht ein. `[cmd]` `apps/admin` läuft bereits
so: Port 3210, eigene Sitzung, eigener Cookie-Namensraum
`sb-127-admin-auth-token`.

Für die Shell heisst das: ein Verweis nach aussen, kein Eintrag im
Modulrouting, kein `--acc`-Wechsel. Optisch darf der Eintrag aussehen wie
die übrigen — verhalten muss er sich anders.

**`Test · Onboarding` gehört nicht in die Produktnavigation.** `[read]`
Es stand im Entwurf unter „SYSTEM", weil es einen Platz brauchte — Toms
Worte: *„das musste irgendwohin, ist aber natürlich nicht der richtige
Ort."* Wohin, ist offen. Eine Testfläche in der Nutzernavigation ist es
nicht.

---

## Zwei Zahlen im Entwurf, die nicht stimmen

**Der Nutrition-Score steht auf `1`.** `[read]` Der Bildschirm zeigt
Faktoren um 0,7 und Schwellen `ok ≥ 80 · warn 50–79 · block < 50`.
`[annahme]` Skalierung 0–1 gegen Schwellen 0–100. Es ist der Wert, den
ein Nutzer zuerst ansieht.

**Vitamin D: 20 µg im Entwurf, 15 µg in der Datenbank.** `[cmd]` Wir
haben EFSA `AI 15 µg` eingetragen, der Entwurf zeigt „12µg (target
20µg)" — das ist der DGE-Wert. Beide sind belegbar, aber es muss einer
gelten, sonst zeigt die Oberfläche etwas anderes, als die
Bewertungsfunktion rechnet.

---

## Was der Entwurf richtig macht und bleiben soll

- `[cmd]` **Gegen echte Zahlen gebaut:** „Food DB entries: BLS 4.0 ·
  7.140" stimmt exakt, „138-nutrient tracking" auch.
- **Medical trennt `dual-range (lab + optimal)`** — Laborbereich und
  Optimalbereich getrennt geführt. Das ist die Statusseite, sauber von
  der Zufuhrseite abgegrenzt.
- **Farbe ist redundant.** Symbol, Position und Farbe sagen dasselbe;
  nimmt man die Farbe weg, funktioniert die Karte weiter.
- **Der Nutrition-Score trägt `deterministic · no AI`** und zeigt seine
  Faktoren offen. Wer eine Zahl erklärt, statt sie zu behaupten, spart
  sich das Vertrauensproblem.
