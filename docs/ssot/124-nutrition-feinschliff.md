# 124 — Kopfzeile, Warnhinweis, Filter und Blättern (G-73)

Stand: 2026-08-20 · Anker: Zweig `dev` · Auftrag G-73
Herkunft: gebaut und am Bildschirm geprüft in dieser Sitzung.
Rangfolge: Code > dieses Dokument > Rest.

Drei Teile in `/v2/nutrition`: die Kopfzeile nach Toms drei Punkten,
der Warnhinweis an der Allergiekachel, und Blättern plus Filter im
Food-DB-Tab.

---

## Was die Kopfzeile jetzt zeigt

**Tom, 2026-08-19**, drei Änderungen — alle drei umgesetzt:

| | vorher | nachher |
|---|---|---|
| **1. Datumsnavigation** | rechts, neben den Aktionsknöpfen | **mittig**, eigene Rasterspalte |
| **2. Datumspille links** | „Donnerstag, 20. August 2026" | **weg** — „haben wir ja in der Mitte" |
| **3. Herkunftszeile** | „… · BLS 4.0 · Max Rubner-Institut" | **weg** |

`[cmd]` Der Kopf liest jetzt:

```
Nutrition | 138-nutrient tracking | Tagebuch, Mikronaehrstoff-Analyse
und Planung |     ‹ Heute ›     | Quick-add | Recalc macros | Find food | MealCam
```

### Die Zentrierung hat zwei Anläufe gebraucht

`[cmd]` **Erster Versuch, `flex: 1` auf der Mittelspalte: 71 px
daneben.** Der Titelblock ist schmaler als die Knopfreihe, und der
verbleibende Raum liegt damit nicht mittig im Kopf.

`[cmd]` **Zweiter Versuch, `position: absolute; left: 50%`: 0 px
Abweichung — aber die Navigation lag ÜBER den Aktionsknöpfen und war
abgeschnitten.** Am Bildschirm sichtbar: von `‹ Heute ›` stand nur noch
das `‹` da.

`[cmd]` **Und sie griff zunächst gar nicht.** `position` blieb auf
`relative`, weil `v2.css:1064` die Regel
`.v2-module-header.v2-module-hero-lite > *` führt — **zwei Klassen,
höhere Spezifität**, und sie setzt `position: relative` auf jedes
direkte Kind.

**Gebaut ist der dritte Weg: ein Raster mit drei Spalten**
(`1fr auto 1fr`). Die äusseren gleich breit, die mittlere nimmt, was
sie braucht.

`[cmd]` **Gemessen: 0 px Abweichung von der Kopfmitte, keine
Überlappung, volle 202 px Breite.**

`[read]` `packages/ui` ist in diesem Auftrag gesperrt — die
Anzeigeart wird deshalb lokal unter `.v2-nutri-kopf` überschrieben und
lässt die übrigen Module unberührt.

### Die Quellenangabe — geprüft, bevor sie entfernt wurde

**Der Auftrag verlangt ausdrücklich, das vorher zu klären.**

`[cmd]` **In der BLS-Dokumentation selbst nachgesehen**
(`docs/ssot/daten/BLS_4_0_Dokumentation_DE.pdf`, Textstrom
extrahiert). Zwei Kapitel stehen dort:

| Kapitel | Inhalt |
|---|---|
| **9.2 Zitierweise** | *„Bei Verwendung des BLS in wissenschaftlichen Publikationen wird folgende Zitierweise **empfohlen**"* — dann `Max Rubner-Institut (2025): Bundeslebensmittelschlüssel (BLS), Version 4.0. Karlsruhe.` |
| **9.3 Nutzungsbedingungen** | *„Der BLS 4.0 wird **kostenfrei und ohne Lizenzbarrieren** bereitgestellt"*, ausdrücklich erlaubt für **App- und Softwareentwicklung** |

`[read]` **Es gibt keine Pflicht zur Nennung in der Oberfläche.** Die
Zitierweise ist *empfohlen* und bezieht sich auf **wissenschaftliche
Publikationen**, nicht auf Anwendungen. Tom kann die Zeile also
entfernen.

`[annahme]` **Ein Vorbehalt zur Messung:** Die Schrift des PDF benutzt
eine eigene Kodierung; die Kapitelüberschriften und die Zitierweise
sind im Klartext lesbar, der Fliesstext von 9.3 nur bruchstückhaft.
**Für dessen genauen Wortlaut stützt sich dieser Bericht auf
`45-bls-dokumentation.md`**, das ihn als `[read]` festhält. Beide
Quellen sagen dasselbe.

`[cmd]` **Entfernt an vier Stellen in `/v2/nutrition`:**

| Stelle | vorher |
|---|---|
| Kopfzeile (i18n `Nutrition.untertitel`, de + en) | „… · BLS 4.0 · Max Rubner-Institut" |
| Food-DB-Suchfeld | „Search across 7,140 foods · BLS (Bundeslebensmittelschlüssel)" |
| `/v2/nutrition/suche`, Kachel „Suche" | Untertitel „Bestand: BLS 4.0" |
| Erfassungsfenster (`mahlzeiten.tsx`) | „Lebensmittel suchen — BLS 4.0" |

`[cmd]` **Die `BLS`-Marke in der Trefferliste bleibt** — Spalte
`SOURCE`. Dort trennt sie Katalog von eigenen Lebensmitteln, wie der
Auftrag verlangt.

`[read]` **Zwei weitere Fundstellen bleiben stehen:**
`/nutrition/foods` und `/nutrition` (ohne `/v2`) nennen den BLS
ebenfalls. **Das ist die alte Oberfläche und liegt ausserhalb dieses
Auftrags** („Alles in `/v2/nutrition`") — gemeldet, nicht angefasst.

---

## Was der Warnhinweis sagt

`[cmd]` Er steht in der Kachel **`Allergies`** unter `Preferences`, mit
Warnfarbe und `role="note"`:

> **Was der Ausschluss leistet — und was nicht**
>
> Als **Allergie** markierte Stoffe werden aus der Trefferliste
> **entfernt**, nicht nur abgewertet. Grundlage ist eine **kuratierte
> Markierung** im Lebensmittelkatalog — sie ist **nicht vollständig**:
> derzeit sind 120 von 7.140 Einträgen als nusshaltig erfasst, 622 als
> glutenhaltig, 1.021 als laktosehaltig. Ein Lebensmittel ohne
> Markierung wird **nicht** ausgeschlossen, auch wenn es den Stoff
> enthält. **Bei einer Allergie bleibt die Zutatenliste auf der
> Verpackung massgeblich.**

`[read]` **Er sagt drei Dinge und nicht „ohne Gewähr":**

1. **Was wirkt** — Ausschluss, nicht Abwertung. `[cmd]` Das greift seit
   C-94 und ist dort gemessen.
2. **Wo die Grenze liegt** — mit Zahlen, nicht mit „möglicherweise
   unvollständig". `[cmd]` `contains_nuts` deckt **120 von 7.140
   (1,7 %)**, `contains_gluten` 622 (8,7 %), `contains_lactose` 1.021
   (14,3 %).
3. **Was massgeblich bleibt** — die Zutatenliste.

`[read]` **Die Lücke ist die Markierung, nicht der Ausschluss.** Ein
Lebensmittel, das Nüsse enthält und kein Tag trägt, wird nicht
ausgeschlossen — genau das musste der Hinweis benennen.

`[cmd]` **Die Zahlen stehen fest im Code, mit Stichtag**
(`ALLERGEN_MARKIERT`, Stand 2026-08-20). `[read]` Absicht: der Hinweis
muss auch dann stehen, wenn eine Abfrage ausfällt. Wer die Kuration
erweitert, zieht sie dort nach; die Grössenordnung („ein Bruchteil")
bleibt bis dahin richtig.

---

## Welche Filter tragen

**Tom, 2026-08-18:** *„Wir haben so viel Platz — lass die Filter
einfach logisch darunter aufbauen, und der Filterknopf ist das Setup
zum Filter ein- oder ausblenden."*

`[cmd]` **So gebaut:** `Filters` klappt eine Leiste unter den
Kategorie-Pillen auf, mit vier Gruppen. Der Knopf zeigt die Zahl
aktiver Filter.

### Die Optionen, jede mit ihrer Trefferzahl

`[cmd]` Alle Zahlen am 2026-08-20 gegen `nutrition.food_tags`
gemessen:

| Gruppe | Optionen |
|---|---|
| **Ernährungsform** | Vegan **1.377** · Vegetarisch **1.751** |
| **Nährwert** | Proteinreich **1.400** · Low-Carb **4.659** · Fettarm **2.648** · Ballaststoffreich **558** |
| **Verarbeitung** | Grundnahrungsmittel **2.884** · Hochverarbeitet **927** |
| **Allergene ausschliessen** | Ohne Laktose **1.021** · Ohne Gluten **622** · Ohne Nüsse **120** |

`[cmd]` **Im Browser gegen SQL geprüft — 4 von 4 richtig:**

| Filter | Anzeige | SQL | |
|---|---|---|---|
| Vegan | 1.377 | 1.377 | ✓ |
| Proteinreich | 1.400 | 1.400 | ✓ |
| Ballaststoffreich | 558 | 558 | ✓ |
| Hochverarbeitet | 927 | 927 | ✓ |

`[cmd]` **`halal`, `kosher` und `thai_food` fehlen bewusst** — die
ersten beiden sind Presets (C-93), `thai_food` hat null Zuordnungen.

### Drei Befunde, die die Bauform bestimmt haben

`[cmd]` **1. Vegan ist eine Teilmenge von Vegetarisch.** Gemessen:
`vegan OHNE vegetarian` = **0**. „vegan ODER vegetarisch" ergibt
deshalb 1.751 — dieselbe Zahl wie „vegetarisch" allein. **Die beiden
stehen nebeneinander, nicht als Oder-Gruppe**; alles andere wäre eine
Scheinwahl.

`[cmd]` **2. Die Suchfunktion nimmt nur EINEN Tag.**
`nutrition.food_search` hat `p_tag_code` im Singular — sie kann kein
ODER innerhalb einer Gruppe und kein UND zwischen Gruppen.

`[read]` **Deshalb ist der Tag-Filter einfach-Auswahl**, nicht
Mehrfachauswahl. Ein zweiter Klick löst den ersten ab. **Das ist eine
Einschränkung, keine Entscheidung** — der Auftrag verlangt „ODER
innerhalb einer Gruppe, UND zwischen den Gruppen", und das braucht
einen zusätzlichen Parameter in der Suchfunktion. **Die Suche
umzubauen verbietet der Auftrag ausdrücklich (C-94 steht).**
**Gemeldet für den nächsten Durchgang.**

`[cmd]` **3. Ausschliessen kann die Suchfunktion gar nicht.**
`p_tag_code` wählt AUS, es gibt keinen Parameter für „ohne". Der
Ausschluss läuft dort nur über gespeicherte Vorlieben (C-94,
`hard_exclude`).

`[read]` **Die Allergen-Schalter wirken deshalb auf die angezeigte
Seite**, nicht auf den ganzen Bestand — und **sie sagen das an**:

> Blendet auf der angezeigten Seite aus. Dauerhaft und über den ganzen
> Bestand wirkt der Ausschluss über **Preferences · Allergies**.

`[cmd]` **`processing_level` ist nicht als Filter gebaut.** Die acht
Stufen aus C-100 liegen vor (`raw` 3.251, `cooked` 2.346,
`ultra_processed` 927, `minimally_processed` 254, `canned` 185,
`dried` 77, `fermented` 63, `smoked` 37) — **aber die Suchfunktion hat
keinen Parameter dafür.** Dieselbe Sperre wie oben; `whole_food` und
`ultra_processed` decken die Verarbeitung als Tags teilweise ab.

### Bei 375 px ein Vollbild-Fenster

`[cmd]` Gemessen: `position: fixed`, Breite **375 px = volle
Fensterbreite**. Die Gruppen stehen dort untereinander statt im
Raster, die Kopfzeile klebt oben.

### Sortierbare Spalten

`[cmd]` **`kcal/100g` und `P` sortieren**, ein zweiter Klick hebt die
Sortierung auf. Gemessen nach Klick auf `P`:

```
Sojaproteinisolat 88 | Gelatine 85 | Eiweiß getrocknet 81
```

`[cmd]` **`C` und `F` bleiben unsortierbar.** Die Suchfunktion kennt
vier Sortierungen — `relevance`, `kcal_asc`, `protein_desc`,
`name_asc` — und **keine für Kohlenhydrate oder Fett**. `[read]` Im
Browser über die geladene Seite zu sortieren wäre eine Falschaussage:
es sortierte 50 von 7.140.

`[read]` **Und je Spalte gibt es nur eine Richtung.** Deshalb an/aus
statt umkehren — ein Pfeil, der eine Richtung verspricht, die die
Datenbank nicht liefert, wäre schlechter als keiner.

---

## Wie geblättert wird

**Tom:** *„Wenn man Treffer 279 zeigt, dann gibt man auch die
Möglichkeit, die alle anzuschauen."*

`[cmd]` **Gebaut mit `p_offset`** — die Suchfunktion trägt es bereits.
Gegenprobe in SQL: Offset 0 liefert „Tofu", Offset 50 „Rind
Oberschale, roh".

`[cmd]` **Im Browser gemessen:**

| | Seite 1 | Seite 2 |
|---|---|---|
| Anzeige | `Seite 1 von 143` · `1–50` | `Seite 2 von 143` · `51–100` |
| erste Zeile | Tofu | Rinderoberschale (roh) |

`[cmd]` **Alle 7.140 sind erreichbar:** 143 Seiten × 50 = 7.150, die
letzte trägt 40 Zeilen. Statt „zeigt die ersten 50" steht jetzt der
Bereich (`1–50`), darunter `‹ Zurück` und `Weiter ›`.

`[cmd]` **Jede Filteränderung setzt auf Seite 1 zurück** — sonst stünde
man nach dem Filtern auf einer Seite, die es nicht mehr gibt.

---

## Nachweise

`[cmd]` Am Bildschirm geprüft, 2026-08-20, als `dev@lumeos.app`:

| Prüfung | Ergebnis |
|---|---|
| **Kopfzeile** | `[cmd]` Datumspille weg, Herkunftszeile weg, `‹ Heute ›` mittig |
| **Zentrierung** | `[cmd]` **0 px** Abweichung, keine Überlappung, 202 px breit |
| **Warnhinweis** | `[cmd]` steht in `Allergies`, mit den gemessenen Zahlen |
| **Jede Filteroption** | `[cmd]` **4 von 4** gegen SQL richtig |
| **Blättern** | `[cmd]` 143 Seiten, `1–50` → `51–100`, andere erste Zeile |
| **Sortierung** | `[cmd]` Protein absteigend: Sojaproteinisolat 88, Gelatine 85, Eiweiß 81 |
| **375 px** | `[cmd]` Filterleiste `position: fixed`, volle Breite |
| Konsolenfehler | `[cmd]` **0** |
| `pnpm gate` | `[cmd]` **grün, 8 von 8** |
| Vier Breiten | `[cmd]` 1440 / 1024 / 768 / **375 px** — 0 Karten mit Überlauf, kein Seitenüberlauf |
| Hell und dunkel | `[cmd]` beide geprüft |

### Die Laufzeit ist gestiegen — und nicht durch diesen Umbau

`[cmd]` **Gemessen: 330–492 ms** (hafer 330, milch 359, ohne Filter
492). **G-66 hatte 199–304 ms gemessen.**

`[cmd]` **Die Ursache liegt in der Suchfunktion, nicht in der
Oberfläche.** Direkt in SQL gemessen: `nutrition.food_search` braucht
ohne Filter **366–406 ms** — und **bei `limit 25` genauso lange wie
bei `limit 50`** (366,3 gegen 366,5 ms). Weder das Blättern noch die
Sortierung noch die Filter kosten die Zeit.

`[annahme]` **Die Funktion ist seit G-66 gewachsen:** C-93 hat die
Ausschluss-Presets ergänzt, C-94 die Vorlieben-Auswertung mit
`p_user_id`. Beides läuft bei jeder Suche mit. **Gemessen ist der
Anstieg, die Zuordnung ist eine Vermutung** — sie zu belegen hiesse,
die Funktion zu zerlegen, und das ist ein eigener Auftrag.

### Der Kopfüberlauf ist der bekannte

`[cmd]` `.v2-module-header` meldet bei jeder Breite 860 gegen 810 px.
**Gegengeprüft an `/v2/training`, das dieser Auftrag nicht anfasst:
dieselben 860/810.** Es ist die in G-57 dokumentierte
Hero-Lite-Eigenschaft, von `overflow-x: hidden` aufgefangen — **nicht
von diesem Umbau.**

### Bildschirmfotos

| Datei | Inhalt |
|---|---|
| `g73-kopf-hell-1440.png` | die neue Kopfzeile |
| `g73-filter-dunkel-1440.png` | die Filterleiste, dunkel |
| `g73-filter-375.png` | das Vollbild-Fenster bei 375 px |
| `g73-warnhinweis-dunkel.png` | der Warnhinweis in `Allergies` |
| `g73-hell-{1440,1024,768,375}.png` | die vier Breiten |

### Was dieser Auftrag NICHT getan hat

- **Kein Herkunfts-Filter** (Favoriten, gestern, Mealplan) — Rest von
  G-70.
- **Die Suche nicht umgebaut** — C-94 steht. Die drei Einschränkungen
  oben (ein Tag, kein Ausschluss, kein `processing_level`) sind
  gemeldet, nicht umgangen.
- **`packages/ui` nicht angefasst** — die Spezifitätsregel wurde
  lokal nachgezogen.
- **Kein Schema geändert.**
- **Die alte Oberfläche (`/nutrition` ohne `/v2`) nicht angefasst**,
  obwohl sie den BLS ebenfalls nennt.

### Geänderte Dateien

| Datei | Was |
|---|---|
| `v2/nutrition/ansicht.tsx` | Kopfzeile: Datumspille weg, Navigation in eigene Spalte |
| `v2/nutrition/nutrition.css` | Rasterkopf, Filterleiste, Blätterleiste, 375-px-Vollbild |
| `v2/nutrition/tab-foods.tsx` | Filterleiste, Blättern, Sortierung, Platzhalter |
| `v2/nutrition/tab-vorlieben.tsx` | Warnhinweis in `Allergies` |
| `v2/nutrition/suche/ansicht.tsx` | „Bestand: BLS 4.0" entfernt |
| `v2/nutrition/mahlzeiten.tsx` | „— BLS 4.0" aus dem Platzhalter |
| `messages/de.json`, `messages/en.json` | Herkunftszeile aus dem Untertitel |

`[cmd]` Messskripte unter `tools/g73-*` — **nur lesend**, gehören vor
dem Commit entfernt.

**Nichts ist committet oder gestaged.**
