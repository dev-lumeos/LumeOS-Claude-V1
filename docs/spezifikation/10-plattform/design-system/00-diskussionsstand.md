---
status:     diskussionsstand
version:    0.1
stand:      2026-08-04
ankerhash:  b4edff9
quellen:    Gespräche Tom 2026-08-03/04; docs/ssot/34-design-bestandsaufnahme.md;
            Messungen an apps/web/src/app/globals.css
abhaengig:  10-plattform/konventionen
---

# Plattform: Design-System — Diskussionsstand

**Dies ist keine Spezifikation.** Es hält fest, was besprochen, gemessen und
festgestellt wurde, damit die Designsitzung nicht bei null anfängt.
Entscheidungen stehen aus (TODO A-06).

---

## 1. Drei Quellen, drei Rollen

| Quelle | Was es ist | Rolle |
|---|---|---|
| `docs/design-system/` | `[read]` Bestandsaufnahme des Vorgängercodes, generiert 2026-04-27 per AST-Analyse von 534 TSX-Dateien | **historisch** — die App existiert nicht mehr |
| `docs/Screenshots/` + `docs/prompts/mockup_*` | 13 Bilder vom 2026-07-31, drei Mockup-Prompts (41,6 KB) | **Ursprung des heutigen Designs** |
| `apps/web/src/app/globals.css` | `[cmd]` 32 Tokens, 104 OKLCH-Werte, 1.423 Zeilen | **der gebaute Stand** |

Die erste Quelle beschreibt ausdrücklich, was der heutige Stand ersetzt hat.
Ihr Abschnitt 7 nennt als Mangel: keine Design-Token-Variablen in CSS, Farben
hartkodiert, kein Laufzeit-Theming. Abschnitt 8 empfiehlt CSS-Custom-Properties
und echten Dunkelmodus — genau das, was heute existiert.

**Konsequenz:** `docs/design-system/` gehört ins Archiv, nicht in die
Quellenliste. Es ist Vorgeschichte, kein Vorgabe-Dokument.

## 2. Zwei Vorschauen zum Vergleich

Beide unter `docs/design-vorschau/`, ohne Build im Browser zu öffnen:

- **`tokens.html`** — der heutige Stand. Liest die Werte beim Bauen aus
  `globals.css`, zeigt also keine Kopie. Umschalter Dunkel/Hell.
- **`altbestand.html`** — das Konzept vom April, rekonstruiert aus
  `colors.json`: Verlaufsköpfe mit Emoji und Kennzahlkacheln, Standardkarte,
  Seitenleiste, Buddy-Karte.

Nach Änderungen an `globals.css`: `node docs/design-vorschau/build.mjs`.

## 3. Messbefund: die elf Akzente sind zu ähnlich

`[cmd]` Alle Akzenttokens liegen bei **L = 0,74 bis 0,80** — eine Spanne von
0,06. Sie unterscheiden sich fast ausschliesslich im Farbton.

| Token | L | C | H |
|---|---|---|---|
| `--acc-medic` | 0,76 | 0,09 | 15 |
| `--acc-suppl` | 0,76 | 0,10 | 25 |
| `--acc-mkt` | 0,78 | 0,08 | 145 |
| `--acc-recov` | 0,78 | 0,08 | 160 |
| `--acc-nutri` | 0,78 | 0,10 | 70 |
| `--acc-goals` | 0,80 | 0,10 | 95 |

Medizin und Supplemente liegen **10 Grad** auseinander, Marketplace und
Erholung **15 Grad**, Ernährung und Ziele **25 Grad**.

`[read]` Zwei Erkenntnisse aus der Recherche dazu:

- Farben mit unterschiedlichen **Helligkeitswerten** bleiben unterscheidbar,
  auch wenn die Farbwahrnehmung eingeschränkt ist. Bei gleicher Helligkeit und
  nur unterschiedlichem Farbton fällt die Unterscheidung weg.
- Kategorische Paletten sollten **höchstens sieben Farben** umfassen — darüber
  tun sich auch Normalsichtige schwer.

**Dazu:** `--pos` liegt bei L = 0,78, also exakt auf Akzenthöhe. Ein
Statuszeichen und ein Modulakzent sind per Helligkeit nicht trennbar.

**Das ist ein Befund zur Grundpalette, kein Themeproblem.** Er gehört vor jede
Themeentscheidung.

## 4. Die Akzente mischen zwei Achsen

`[read]` Elf Akzente: `dash`, `nutri`, `train`, `recov`, `suppl`, `goals`,
`medic`, `coach`, `buddy`, `mkt`, `admin`.

Davon sind nach Toms Modell **Module**: Dashboard, Nutrition, Training,
Recovery, Supplements, Goals, Medical, HumanCoach.
Und **Apps**: Buddy, Marketplace, Admin.

Es fehlen: Settings, Login, AICoach, Gym, Supplier.

Dieselbe Vermischung von App- und Modulachse wie im Altbestand — jetzt in den
Tokens. Sie aufzulösen ist Teil von A-06.

## 5. Kontrast im Dunkelmodus

`[read]` APCA, der Kandidat für WCAG 3, bewertet **helle Schrift auf dunklem
Grund strenger** als umgekehrt — es modelliert die Polarität getrennt, weil
Lesbarkeit bei gleichem Kontrastwert je nach Richtung unterschiedlich ist.

Das heutige Standardtheme ist dunkel. Es kann nach WCAG 2 bestehen und nach
dem kommenden Maßstab durchfallen. Zu prüfen, bevor Themes vervielfacht werden.

## 6. Themes als Produktmerkmal

**Entscheidung Tom 2026-08-04:** Es wird mehrere Templates geben, wählbar über
Settings. Der Altbestand-Look ist eines davon.

### Die Regel, die das tragbar macht

Ein Theme darf **ausschliesslich Tokenwerte tauschen**. Sobald ein Theme
entscheidet, *ob* ein Element erscheint oder *wie* es aufgebaut ist, wird aus
einem Theme eine zweite Anwendung.

Bei zwölf Modulen und fünf Themes sind das sechzig Kombinationen. Das trägt
nur, wenn die Komponente immer dasselbe rendert und das Theme nur die Werte
bestimmt.

**Praktisch für den Altbestand-Look:** Verlaufskopf und Emoji-Anker sind dort
Struktur, kein Token. Als Theme umsetzbar nur, wenn ein
`--modul-kopf-hintergrund` existiert, das ein Theme auf einen Verlauf und ein
anderes auf `var(--surface)` setzt. Die Komponente rendert immer einen Kopf.

### Warum Themes bei OKLCH billig sind

`[read]` OKLCH ist perzeptuell einheitlich: Helligkeitswerte korrelieren direkt
mit der wahrgenommenen Helligkeit, was Kontrastverhältnisse vorhersagbar macht
und die systematische Erzeugung ganzer Paletten über Formeln erlaubt.

Themes lassen sich damit **rechnen** statt entwerfen — L verschieben, C
skalieren, H behalten. 32 Tokens durch eine Formel, nicht durch 32
Einzelentscheidungen.

### Kandidaten

| Theme | Begründung | Umsetzung |
|---|---|---|
| **Dunkel** | Standard, existiert | — |
| **Hell** | existiert, 22 Überschreibungen | — |
| **Hoher Kontrast** | Zugänglichkeit; bei einer Gesundheitsplattform mit breiter Altersspanne praktisch verpflichtend | L-Spanne aufziehen, C reduzieren |
| **Farbsehschwäche-sicher** | rund jeder zwölfte Mann betroffen; löst zugleich Abschnitt 3 | Akzente über L staffeln (0,55–0,85) statt über H |
| **Ruhig** | Chroma nahe null, Farbe nur bei Status. Für Medical und für Dichte statt Buntheit | C auf ~0, Status behält Farbe |
| **Dicht** | kleinere Schrift, engere Abstände, mehr Zeilen je Bildschirm. Für 138 Nährstoffwerte oder Trainingsverläufe | Abstands- und Schrifttokens |
| **Vorgänger** | der Look aus `altbestand.html` | nur nach Tokenisierung des Kopfs |

**Verworfen:** *Draussen* (maximaler Kontrast für Sonnenlicht) — Tom
2026-08-04: LumeOS läuft auf Tablet, Notebook und Rechner, nicht unterwegs.
Wird wieder relevant, falls `apps/mobile` entsteht.

**Nicht empfohlen:** Glasmorphismus und ähnliche Effektthemes. Gerade in Mode,
kosten aber Kontrast — bei Nährwerten und Blutwerten ist Lesbarkeit nicht
verhandelbar.

## 7. Geräte und Breakpoints

**Entscheidung Tom 2026-08-04:** LumeOS läuft auf Tablet, Notebook und
Rechner. Es soll bis aufs Handy herunterskalieren, aber das Handy ist
**Testumgebung, kein Ziel**.

Das ist **nicht mobile-first.** Die alte Konzeptdatei beschreibt ausdrücklich
das Gegenteil — mobile-first mit `lg:`-Aufsatz. Der heutige `globals.css`
denkt bereits von oben nach unten: `[cmd]` beide Media Queries sind
`max-width` (1023 und 1279).

**Folge:** Die Basisgrösse ist die Ausnahme, nicht die Regel. Geschrieben wird
das Notebook-Layout, reduziert wird nach unten. Gemischt entsteht Code, bei
dem niemand weiss, welche Breite der Ausgangspunkt war.

**Und:** Wenn eine dichte Tabelle mit acht Spalten auf dem Handy unbrauchbar
wird, ist das erwartet, kein Fehler. Ohne diese Festlegung wird jede Ansicht
zweimal entworfen.

### Vorgeschlagene Anker

`[cmd]` Bestand: 23 Breakpoint-Präfixe in ganz `apps/web`, keine eigenen
`screens` definiert — es gelten die Tailwind-Voreinstellungen.

| Anker | ab | Tailwind | Zweck |
|---|---|---|---|
| — | 0 | Basis | Handy, nur Test |
| `tablet` | 640 px | `sm` | Tablet hochkant |
| `notebook` | 1024 px | `lg` | Notebook, Tablet quer |
| `desktop` | 1280 px | `xl` | Monitor |

Die Namen kämen als **Aliase zusätzlich** in `tailwind.config.js`, nicht
statt der bestehenden — dann liest sich `notebook:grid-cols-2` von selbst und
`lg:` funktioniert weiter. Der Wert 1279 in `globals.css` ist genau die Grenze
darunter.

**Gehört nach `10-plattform/konventionen`**, sobald entschieden — Breakpoint-
*Werte* sind eine Layoutkonvention wie die Ports. Wie etwas bei welcher Breite
*aussieht*, bleibt Design.

### Was der Desktop-Fokus ermöglicht

Ohne Handy als Ziel entfallen Daumenreichweite und Platzmangel, Hover
funktioniert. Damit werden mehrspaltige Ansichten, eine dauerhaft sichtbare
Seitenleiste, dichte Tabellen und Tooltips statt Aufklappmenüs möglich.

Umgekehrt entwertet das den Altbestand-Look teilweise: Verlaufsköpfe mit drei
Kennzahlkacheln fressen auf einem grossen Bildschirm viel Platz für wenig
Information. Auf dem Handy war der Kopf der ganze Bildschirm.

## 8. Zu entscheiden

1. **Grundpalette vor Themes** — die elf Akzente über Helligkeit trennen?
   Und die Zahl auf sieben oder weniger reduzieren?
2. **Akzentachse** — je Modul, je App, oder beides getrennt? Fünf Einheiten
   fehlen heute ganz.
3. **Wo das Design-System lebt** — `apps/web/src/app/globals.css` oder
   `packages/ui`? `[cmd]` Letzteres ist leer, sechs weitere Apps sind geplant.
4. **Tailwind-Anbindung** — seit M2 sind 19 Tokens als `var()`-Verweise
   gespiegelt. Reicht das, oder sollen alle 32 erreichbar sein?
5. **Schrift** — `[cmd]` sieben `font-family`-Deklarationen, alle Monospace,
   kein Webfont geladen. Die Spec nennt JetBrains Mono. Und es gibt keine
   getrennte Schrift für Fliesstext.
6. **Themeliste** — welche der sieben Kandidaten kommen, in welcher Reihenfolge?
7. **Auswahl in Settings** — je Nutzer gespeichert? Dann braucht das Profil
   ein Feld, und die Auswahl gehört zur Modulspezifikation Settings.
8. **Kontrastprüfung** — gegen WCAG 2 oder zusätzlich gegen APCA?

---

## 9. Gespräch 2026-08-14: das Lichtmodell

Tom hat ein fremdes Dashboard als farblich ansprechend eingebracht (dunkler
Grund, sieben Kennzahlkarten in je eigener Farbfamilie, Leuchten um das
Symbol). Der Austausch drehte sich ausdrücklich **nicht** um die konkreten
Farbtöne, sondern um das Konzept dahinter. Vier Feststellungen, die morgen
Grundlage sind:

**Eine Lichtquelle für die gesamte Oberfläche.** In jeder Karte sitzt der
helle Punkt oben links, die Fläche wird nach unten rechts dunkler — bei
allen Karten gleich. Darin liegt der Effekt: Es wirkt nicht wie sieben
dekorierte Kacheln, sondern wie **ein Raum mit einer Lampe**, in dem sieben
Gegenstände liegen.

Als System heisst das: die Lichtrichtung ist **ein einziger Token**, kein
Gestaltungsmittel je Komponente — etwa `--light-angle: 135deg`. Daraus folgt
alles Weitere mechanisch: Verläufe laufen in diese Richtung, Schlagschatten
fallen nach unten rechts, obere und linke Innenkante bekommen eine feine
helle Linie, untere und rechte nicht. **Sobald eine Karte ihr Licht von
rechts bekommt, zerfällt die Wirkung für alle.**

**Das Modulsymbol ist die Lichtquelle, nicht nur ein Piktogramm.** Der
radiale Verlauf geht vom Symbol aus, nicht von der Kartenecke. Die Karte ist
der beleuchtete Raum, das Symbol der Leuchtkörper. Für LumeOS: jedes Modul
hat ein Symbol, dieses trägt die Modulfarbe am stärksten, alles andere ist
Abklingen.

**Der Verlauf hat zwei Achsen.** Radial vom Symbol nach aussen (höchste
Sättigung dort) und linear diagonal über die Fläche (abnehmende Helligkeit).
Eine Achse allein wirkt flach. Dazu eine dritte, sehr leise Schicht: eine
diagonale Schraffur im Kartenhintergrund in derselben Richtung — kaum
sichtbar, macht aber den Unterschied zwischen Farbfläche und Material.

**Farbe ist redundant, nicht tragend.** Häkchen und Grün sagen beide
„abgeschlossen", Kreuz und Rot beide „storniert". Nimmt man die Farbe weg,
funktioniert die Karte weiterhin. **Deshalb darf die Farbe kräftig sein — sie
muss nichts allein tragen.** Das ist die Antwort auf den Messbefund aus
Abschnitt 3: nicht elf unterscheidbare Farben suchen, sondern elf Module so
bauen, dass Symbol und Position bereits reichen und die Farbe verstärkt.

**Konsequenz für die Tokenstruktur:** Ein Modul ist dann nicht durch einen
Akzentwert definiert, sondern durch ein Tripel aus **Symbol, Farbton und
Rolle im Raster**. Lichtrichtung, Verlaufskurve, Abklingen und Kantenlichter
sind global und für alle elf gleich. `[cmd]` Die heutigen Tokens beschreiben
nur den Farbton; die Schicht darüber — die Physik des Raums, in dem sie
erscheinen — fehlt vollständig.

### Zahlenvergleich zum Referenzbild

`[cmd]` Die elf Akzente im Dunkelmodus (`apps/web/src/styles/themes/lume.css`)
liegen bei Helligkeit 0,74–0,80 und erreichen höchstens Chroma 0,10
(`--acc-dash` sogar nur 0,04). Das Referenzbild arbeitet `[annahme]` bei
geschätzt Chroma 0,15–0,25 und spreizt die Helligkeit deutlich weiter. Die
LumeOS-Farben sind also nicht nur zu ähnlich, sondern auch matt.

### Vorbehalte, die mit zu entscheiden sind

- **Acht Farben dort, elf Module hier.** Bei dieser Sättigung werden elf
  gleichzeitig sichtbare Akzente unruhig. Ausweg: ein Modul zeigt seinen
  Akzent, die übrigen sind nicht gleichzeitig sichtbar — dann darf jeder
  einzelne kräftig sein.
- **Nutzungsdauer.** Ein Geschäftsdashboard wird zweimal wöchentlich kurz
  angesehen; in eine Ernährungserfassung tippt jemand täglich mehrfach. Hohe
  Sättigung über zwanzig Minuten Tagebuchpflege ermüdet anders als über zwei
  Minuten Kennzahlenblick.
- **Rot und Grün als Bedeutungsträger.** Im Bild tragen sie „abgeschlossen"
  und „storniert". `[cmd]` Die LumeOS-Struktur ist hier bereits sauberer:
  `--pos`, `--warn`, `--neg` sind von den elf Modul-Akzenten getrennt.
  Bedeutung und Modulidentität sind zwei Achsen — das Bild vermischt sie,
  und diese Trennung sollte nicht aufgegeben werden (siehe Abschnitt 4).
- **Das Leuchten ist teuer.** Mehrfache Schatten und Verläufe je Karte kosten
  Renderzeit, besonders auf Mobilgeräten, und altern am schnellsten. Als
  optionale Schicht führen, nicht als Fundament.
