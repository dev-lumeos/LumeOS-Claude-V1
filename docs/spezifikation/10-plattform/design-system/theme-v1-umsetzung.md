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

## Die Vorlage ist die Vorgabe

**Tom, 2026-08-16, nach dem ersten Vergleich von `/v2/nutrition` mit
`module-nutrition.jsx`:** *„Wieso sieht es nicht wie die Vorlage aus?
Für was mache ich tagelang Design, wenn es nicht umgesetzt wird? Was
soll die Subnavigation links?"*

`[cmd]` **Was schiefging:** Der Auftrag G-03 nannte die Vorlage und gab
dann eine andere Struktur vor — *„zwei Seiten unter `/v2/nutrition`:
Tagebuch und Lebensmittelsuche"*. Die Vorlage führt **sieben Tabs im
Modul** (Diary, Insights, Nutrients, Food DB, Meal plans, Preferences,
Planner). Die Sub-Navigation in der Seitenleiste ist die Folge: Sie
musste erfunden werden, weil zwei Seiten nebeneinander lagen, wo eine
mit Tabs hingehört.

**Die Vorlage wurde als Materialsammlung behandelt statt als Vorgabe.**

### Wie hier entwickelt wird

**Tom, 2026-08-16:** *„Wie entwickelt man? Man hat eine Vision,
zerstückelt die in Module, plant die Specs, macht einen Mockup — jedes
Feature trägt einen Hinweis, ob es Mockup ist; wenn es verdrahtet ist,
fällt der Mockup-Hinweis weg — befüllt den Mockup mit Realdata. So sieht
man als Mensch das Gesamtbild und kann entscheiden."*

**Der Mockup-Hinweis ist der Fortschrittsbalken.** Was markiert ist, ist
offen. Was nicht mehr markiert ist, ist fertig. Wer die unfertigen
Kacheln weglässt, nimmt genau die Anzeige weg, die das Design liefern
soll — dann sieht man drei Kacheln und muss sich neun dazudenken.

**Deshalb: nichts weglässen, was die Vorlage zeigt.** Attrappe
kennzeichnen, verdrahten, Kennzeichnung entfernen.

### Was in einer Attrappe steht, ist gleichgültig

**Tom, 2026-08-16:** *„Alles kommt rein. Wenn es ein Modal öffnen will,
das es noch nicht gibt, kommt ein designpassendes Modal „in
Entwicklung". Wenn es eine Attrappe ist, ist scheissegal, was da drin
steht — es zeigt ja nur, wie es aussehen könnte."*

**Eine markierte Attrappe darf erfundene Zahlen enthalten.** Genau dafür
ist die Markierung da. `Recovery 82`, `2.142 TSS`, `7:42 h` — die Zahlen
aus dem Entwurf bleiben stehen, damit die Kachel aussieht, wie sie
aussehen wird.

**Knöpfe kommen alle rein.** Wo das Ziel fehlt, öffnet ein Modal
„in Entwicklung" im Stil des Themes. Ein fehlender Knopf ist unsichtbar;
ein Knopf, der sagt, dass er noch nicht fertig ist, steht auf der
Fortschrittsliste.

**Damit entfallen drei Argumente, die zum Weglässen geführt haben:**

| Argument | warum es nicht trägt |
|---|---|
| „eine erfundene Zahl neben echten sieht aus wie eine Messung" | die Marke sagt genau das Gegenteil, und sie steht daneben |
| „ein Knopf ohne Ziel ist schlimmer als kein Knopf" | ein Modal „in Entwicklung" ist ein Ziel |
| „im Kopf ist kein Platz für eine Marke" | dann gehört der Platz geschaffen, nicht die Kachel entfernt |

`[cmd]` Alle drei sind in dieser Sitzung aufgetreten — bei den neun
Dashboard-Kacheln, bei `Quick-add`/`Recalc macros`/`MealCam`, und beim
`Streak 23d` im Kopf.

### Der Unterschied zum Ring ohne Ziel

`[read]` In G-03 wurde entschieden, **keinen gefüllten Ring ohne Ziel**
zu zeigen: *„ein zu 68 % gefüllter Ring wäre eine Falschaussage mit
hoher Überzeugungskraft."* Das war richtig — und es ist **nicht**
dasselbe.

| | |
|---|---|
| Ring ohne Ziel | eine Zahl, die aussieht wie gemessen, **ohne Kennzeichnung** |
| Kachel mit Attrappenmarke | eine Fläche, die **sagt, dass sie noch nichts weiß** |

`[cmd]` Das Argument *„eine MOCK-Marke nimmt einer Zahl nicht ihre
Wirkung"* gilt für Endnutzer. **Auf einem Entwicklungsstand, den nur Tom
sieht, gibt es diesen Endnutzer nicht.** Vor der Auslieferung wird die
Frage neu gestellt; während gebaut wird, zählt das Gesamtbild.

---

### Vollstaendigkeit wird gezaehlt, nicht angesehen

**Tom, 2026-08-17, nach dem Supplements-Mockup:** *„Was ist daran so
schwer? Wir haben eine Designvorlage, du pruefst vorher gegen Spec und
altes Repo, ob alles vorhanden ist, und Claude dupliziert das rein als
Attrappe."*

`[cmd]` **Der Fehler lag im Nachweis.** Die Auftraege verlangten *„alle
Tabs durchgeklickt, Bildschirmfoto neben die Vorlage"* — **das prueft,
ob eine Seite erscheint, nicht ob sie vollstaendig ist.** Wer sieben
Tabs baut und je Tab die Haelfte der Unterkomponenten, besteht diesen
Nachweis.

`[cmd]` Belegt bei Supplements: Vorlage **1.605 Zeilen**, Umsetzung
**708**. `SuppCost` 115 gegen 60. Und `SuppExtended` ruft in der Vorlage
sieben Unterkomponenten auf — `ExtendedGate`, `ExtendedHeader`,
`ExtendedCompoundCard`, `CycleTimeline`, `SideEffectLog`,
`BloodworkPanel`, Sichtbarkeitskarte.

**Der Tab-Rumpf ist nicht das Modul.**

### Drei Regeln fuer das Zaehlskript

`[cmd]` Aus G-33, wo der Abgleich zum ersten Mal gefahren wurde — und
wo das erste Skript selbst danebenlag:

**1. Den Aufrufbaum pruefen, nicht die Zeilenzahl.** `[cmd]`
`SuppExtended` hatte in der Vorlage 46 Zeilen, die Umsetzung 97 — **nach
Zeilenzahl also mehr, tatsaechlich fehlten 365 Zeilen Inhalt.** Der
Rumpf ruft acht Komponenten auf.

**2. Ueber alle Vorlagendateien, nicht nur den Rahmen.** `[cmd]`
`CalendarView` steht in der Modaldatei — **das erste Skript las nur den
Rahmen und hielt sie fuer undefiniert.**

**3. Eigene Zustaende sind eigene Bildschirme.** `[cmd]` `ExtendedGate`
ist eine ganze Aufklaerungsseite; **ohne sie zeigt der Tab sofort
Hormonprotokolle.** Ein Zustand, der etwas verbirgt, ist kein Detail.

### Zwei Nachtraege aus G-36 (Medical)

**4. Nicht nur nach `window.` greppen.** `[cmd]` In
`module-medical-v2.jsx` findet ein `window.`-Grep **nichts** — nach dem
Goals-Muster hiesse das „steht allein". **Das ist falsch:** Der Rahmen
ruft acht Modale und zwanzig Datennamen als **blosse Globale** auf
(`<BiomarkerDetailModal/>`, nicht `window.X`), weil alle vier Dateien in
denselben Skript-Gueltigkeitsbereich geladen werden.

`[read]` **Wer nur nach `window.` greppt, baut acht Modale und den
halben Datenbestand nicht.**

**5. Kacheltitel zaehlen, nicht nur Komponentennamen.** `[cmd]` Bei
Medical melden **drei von fuenf Tabs „0 Unterkomponenten"**, weil die
Kacheln inline gesetzt sind. **Ein reines Namenszaehlen haette gruen
gemeldet, waehrend vier von fuenf Kacheln fehlen** — genau der
Supplements-Fehler in anderer Gestalt.

`[read]` **Die verbleibende Luecke, vom Agenten selbst benannt:** *„es
prueft Namen und Titel, nicht Inhalt."*

---

### Was der Abgleich ergab

| Tab | Vorlage | vorher | jetzt |
|---|---|---|---|
| `extended` | 8 | **0** | 8 |
| `compliance` | 3 | **0** | 3 |
| `today` / `stack` | 2 / 2 | 2 / 2 | unveraendert |

`[cmd]` 15 von 15 Unterkomponenten, 0 fehlend. **Die Umsetzung wuchs von
708 auf 1.865 Zeilen.**

---

### Der Pflichtnachweis

**Ein Skript, das je Tab die von der Vorlage aufgerufenen Komponenten
gegen die Umsetzung zaehlt — nach Namen, nicht nach Zeilen.** Fehlende
gehoeren in den Bericht, jede mit Grund.

`[read]` Das ist mechanisch pruefbar und laesst sich nicht mit *„sieht
gut aus"* bestehen. **Dieselbe Logik wie bei `v2-attrappen.test.ts`:
keine Kachel verschwindet still.**

**Gilt fuer jeden Mockup-Auftrag**, und nachtraeglich fuer die bereits
gebauten — `[cmd]` Dashboard, Nutrition, Training und Recovery wurden
ohne diese Zaehlung abgenommen.

---

### Die Regel

**Übernehmen, nicht nachempfinden** — dieselbe Regel wie beim
Vorgängerrepo in `CLAUDE.md`, und sie gilt hier genauso:

- **Struktur, Reihenfolge, Benennung und Anordnung kommen aus der
  Vorlage.** Tabs bleiben Tabs, Karten bleiben Karten, die Reihenfolge
  der Blöcke bleibt.
- **Angepasst wird nur, was technisch nicht geht** — anderes Schema,
  fehlende Daten, Barrierefreiheit, Bildschirmbreiten. `[cmd]` Der
  Entwurf hat null `@media`-Regeln; dass die Umsetzung welche braucht,
  ist eine Anpassung. Eine Tab-Leiste durch Sidebar-Einträge zu ersetzen
  ist keine.
- **Was noch keine Daten hat, wird als Attrappe gekennzeichnet, nicht
  weggelassen.** `[read]` Das Muster steht in G-03: `READ-ONLY MOCK`,
  `Nicht live` — eine Attrappe, die sich ausweist, ist ehrlich; eine
  weggelassene Kachel sieht aus, als sei sie nicht vorgesehen.
- **Abweichungen werden vorgelegt, nicht entschieden.** Wer beim Bauen
  einen Grund findet, von der Vorlage abzuweichen, meldet ihn — Tom
  entscheidet.

### Auch für Aufträge

`[cmd]` Der Fehler lag im Auftrag, nicht in der Ausführung. **Ein
Auftrag, der die Vorlage nennt, darf ihr nicht widersprechen.** Wo ein
Auftrag eine Struktur vorgibt, muss sie aus der Vorlage stammen — oder
die Abweichung muss ausdrücklich begründet und von Tom bestätigt sein.

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
