# 144 — Filter, Sortierung und die Vorlieben im Erfassungsdialog (G-13)

**Stand:** 2026-08-20 · **Modul:** Nutrition · **Auftrag:** G-13

---

## Vorbemerkung: der Auftrag nannte die falsche Datei

`[cmd]` **Der Auftrag beschrieb `erfassen.tsx` (477 Zeilen).** Diese
Datei hat **null Importeure** — sie ist toter Code:

```
grep -rn "from './erfassen'" apps/web/src/   ->   0 Treffer
```

`[cmd]` **Der laufende Erfassungsdialog ist `HinzufuegenModal` in
`mahlzeiten.tsx:410`.** Belegt im Browser: der Knopf
`aria-label="Position hinzufuegen"` sitzt in `mahlzeiten.tsx:287`, und
im geoeffneten Dialog gibt es kein `v2-suchblock` (die Klasse, die es
nur in `erfassen.tsx` gibt).

`[read]` **Die Befunde des Auftrags galten trotzdem** — beide Dateien
riefen `/api/nutrition/foods?q=…&limit=12` ohne jeden Parameter. **Nur
lag die Wirkung woanders.** Gebaut wurde in `mahlzeiten.tsx`;
`erfassen.tsx` blieb unberuehrt.

`[cmd]` **Eine Abweichung gibt es doch:** Der Auftrag sagt, der
Namensteil sei erledigt (`name_display_de || name_de`). **Das gilt fuer
`erfassen.tsx`.** Die laufende Fassung zeigt in der Trefferliste
`f.name_de` (`mahlzeiten.tsx:570`) — **also den amtlichen Namen, bei
5.014 von 7.140 Eintraegen der falsche.** Nicht geaendert, weil ausser
Auftrag; **als Befund unten aufgenommen.**

---

## Was die Vorlieben jetzt bewirken

`[cmd]` **`p_user_id` war an drei Stellen nicht vorhanden**, nicht an
einer: `FoodSearchRpcArgs` kannte das Feld nicht, `getLocalFoodSearch`
reichte es nicht durch, die Route las es nicht. **Die eine Zeile aus dem
Auftrag waren drei Dateien.**

`[read]` **Die Kennung kommt aus der Sitzung, nicht aus der Anfrage.**
`getLocalFoodSearch` liest sie selbst ueber
`createSessionClient().auth.getUser()`. **Ein durchgereichter Parameter
waere eine Sicherheitsluecke gewesen:** wer eine fremde UUID schickt,
liest aus dem Unterschied der Trefferzahlen fremde Allergien ab — und
das sind Gesundheitsdaten.

### Gemessen am 2026-08-20, angemeldet als `dev@lumeos.app`

| Suche | Katalog (ohne) | Dialog (mit) | `preferences_hidden` |
|---|---|---|---|
| mandel | 64 | **0** | **64** |
| erdnuss | 10 | **0** | **10** |
| walnuss | 6 | **0** | **6** |
| nuss | 125 | **42** | — (ueber Schwelle) |

`[cmd]` **Die Vorliebe, die das bewirkt:** `hard_exclude` auf
`contains_nuts` (120 Lebensmittel tragen den Tag).

`[cmd]` **Gegenprobe, warum „mandel" auf null faellt:** **63 von 64**
Treffern tragen `contains_nuts`. Der 64. faellt aus der Zerlegung, nicht
aus der Vorliebe. **Das ist richtig, nicht kaputt.**

### Der Hinweis, der dazugehoert

`[read]` **Eine leere Liste ohne Begruendung ist ein Fehler in der
Oberflaeche.** Wer „mandel" tippt und nichts bekommt, schliesst, die
Datenbank kenne keine Mandeln — und sucht weiter.

`[cmd]` **Die Route meldet deshalb zwei neue Felder:**
`preferences_applied` (griffen sie?) und `preferences_hidden` (wie
viele?). Im Dialog steht daraus:

> Kein Treffer — 64 Eintraege sind durch deine Vorlieben ausgeblendet.

`[cmd]` **Im Bild belegt** (`backup/g13-mandel.png`, hell;
`backup/g13-mandel-375.png`, dunkel bei 375 px).

`[read]` **Die Zahl kostet einen zweiten Aufruf** — dieselbe Suche mit
`p_user_id = NULL`. Er laeuft **nur bei bis zu 5 Treffern**, also
genau dann, wenn jemand die Frage stellt. Wer 40 Treffer sieht, fragt
nicht nach den fehlenden. Schlaegt er fehl, bleibt das Feld `null`; die
Suche selbst bricht daran nicht ab.

`[cmd]` **`total` ist limitunabhaengig** — bei `limit 1` und `limit 12`
identisch (mandel 64/64, nuss 125/125, reis 145/145). Deshalb fragt der
Zweitaufruf mit `p_limit: 1`.

---

## Welche Filter der Dialog bekommt

`[cmd]` **Vier Filter, Einfachauswahl, jede Zahl gegen SQL geprueft:**

| Filter | Tag | SQL | Route |
|---|---|---|---|
| Vegetarisch | `vegetarian` | 1.751 | **1.751** |
| Vegan | `vegan` | 1.377 | **1.377** |
| Proteinreich | `high_protein` | 1.400 | **1.400** |
| Grundnahrungsmittel | `whole_food` | 2.884 | **2.884** |

**Vier von vier stimmen.** Die Zahl steht an der Pille, damit niemand
raet, wie gross die Einschraenkung ist.

`[cmd]` **Sortierung: zwei statt vier** — `relevance` und
`protein_desc`. Gemessen an „kaese": Relevanz fuehrt mit
Kaesealternativen (0,2 g P), Protein mit Hartkaese (**35,6 g P**).

---

## Was weggelassen wurde und warum

`[read]` **Der Auftrag verlangte ausdruecklich Sparsamkeit — hier ist
die Liste.**

**1. Kategoriepillen (13 im Food-DB-Register).** `[read]` Ein
Erfassungsdialog ist kein Katalog. Wer erfasst, hat das Lebensmittel
**gegessen** und kennt seinen Namen; er tippt ihn. Ein Filterband, das
breiter ist als die Trefferliste, steht dabei im Weg.

**2. Fuenf der neun Tag-Filter** — `low_carb` (4.659), `low_fat`
(2.648), `high_fiber` (558), `ultra_processed` (927). `[read]` Sie
beschreiben, **wonach man einkauft**, nicht, was man gegessen hat.

**3. `kcal_asc` und `name_asc`.** `[read]` Wer erfasst, sucht nicht das
kalorienaermste Lebensmittel — er sucht **seines**.

**4. Der Allergen-Ausschluss aus G-73.** `[read]` **Hier waere er
falsch:** Im Register wirkt er auf die geladene Seite, weil die Suche
keinen Ausschluss kennt. Im Dialog **erledigt C-94 dieselbe Sache
richtig** — ueber alle 7.140 und dauerhaft. Zwei Wege zum selben Ziel,
einer davon schlechter, waeren eine Zumutung.

**5. Blaettern.** `[read]` Zwoelf Treffer, ein Dialog. Wer auf Seite 2
suchen muss, hat den falschen Suchbegriff.

---

## Welche Sperren bleiben

`[cmd]` **Die drei aus C-120 gelten unveraendert** — gemeldet, nicht
umgangen, nicht danebengebaut:

1. **`p_tag_code` ist Singular.** Kein ODER, kein UND. Deshalb ist der
   Filter **Einfachauswahl**; ein zweiter Klick loest den ersten ab.
2. **Kein Ausschluss-Parameter.** „Ohne Laktose" geht ueber die Suche
   nicht — nur ueber die Vorlieben (`hard_exclude`).
3. **Kein `processing_level`.**

`[cmd]` **Vierte Sperre, hier gefunden:** `preference_excluded` schliesst
`strong_avoid` **nur bei leerer Anfrage** aus (075, Zeile 455). **Im
Dialog ist die Anfrage nie leer**, also wirkt dort nur `hard`. Das ist
der Grund, warum die Vorlieben im Dialog eingeschaltet sind und in der
Startliste nicht.

### Der Katalog bleibt ungefiltert

`[read]` **Die Vorgabe ist AUS, eingeschaltet wird mit `prefs=1`.**
Vier Stellen rufen `getLocalFoodSearch`; **drei davon sind Kataloge** —
Food-DB-Register (G-73), Foods-Seite, Startliste in
`v2/nutrition/page.tsx`. **Ein Katalog, dem Eintraege fehlen, ist
kaputt.**

`[cmd]` **Belegt:** `q=mandel` ohne `prefs` liefert weiter **64**,
`applied=false`. **Der Umbau nimmt dem Register nichts.**

`[read]` **Der Schalter kann keine fremden Vorlieben anfordern** — er
waehlt nur zwischen „meine" und „gar keine". Die Kennung steht nie in
der Adresse.

---

## Zeilenschutz

`[cmd]` **Zwei anmeldbare Konten, gegeneinander gemessen:**

| Suche | `test-user@lumeos.local` | `dev@lumeos.app` |
|---|---|---|
| mandel | **64** | 0 |
| nuss | **125** | 42 |

`[cmd]` **`test-user` hat 0 Zeilen in `food_preference_items`** — er
bekommt die ungefilterte Liste, obwohl `prefs=1` gesetzt ist und
`applied=true` meldet. **Die Vorlieben des einen wirken nicht beim
anderen.**

---

## Nachweis ohne Browserfenster

**Tom, 2026-08-20:** *„Keine Konsolenfenster. Punkt."*

`[cmd]` **Der gstack-Browser ist gestoppt** (`bun.exe` 0, `browse.exe`
0). Alle Messungen laufen ueber `tools/lauf.py` und `tools/schuss.mjs`.

`[cmd]` **Zwei Werkzeuge erweitert statt danebengeschrieben:**

- **`tools/lauf.py`** um `npx()`, `pnpm()`, `node()` (via
  `shutil.which`, weil `shell=False` `.cmd`-Shims nicht aufloest) und
  `hole()` fuer HTTP-Messungen.
- **`tools/schuss.mjs`** um `--klick` und `--tippe`. `[read]` **Anlass:**
  Der Dialog liegt hinter einem Klick — ein Foto der blossen Seite zeigt
  ihn nie. Zusaetzlich meldet es jetzt, **was im Bild steht** (Filter,
  Trefferzahl), nicht nur dass gerendert wurde.

`[cmd]` **Die Anmeldung per HTTP** braucht den Cookie
`sb-127-auth-token` mit **JSON-Wert, nicht `base64-`-praefixiert** —
`@supabase/ssr` ist hier **0.1.0**, das Praefix kam spaeter.
`MAX_CHUNK_SIZE` ist 3180, der Wert bleibt darunter. **Belegt:** 135 KB
und Titel `Tagebuch — LumeOS` statt 22 KB `Anmelden — LumeOS`.

---

## Gate

`[cmd]` **`pnpm gate`: 5 von 7 gruen, `@lumeos/web#test` rot — mit zwei
Fehlern, die nicht aus diesem Auftrag stammen.**

Beide sitzen in `v2-attrappen.test.ts` (107, 108) und lesen
ausschliesslich `apps/web/src/app/v2/supplements/tabs.tsx`:

| Stand | `attrappe={RUECKFALL}` | `attrappe={ATTRAPPE}` |
|---|---|---|
| HEAD (committet) | **16** | 1 |
| Arbeitsverzeichnis | **0** | 16 |

`[read]` **Die committete Fassung erfuellt die Erwartung, der
uneingecheckte Arbeitsstand nicht.** `tabs.tsx` war beim Beginn dieses
Auftrags bereits geaendert (`M` im Status) und **wird von G-13 nicht
angefasst** — die vier Dateien liegen in `nutrition/`, `lib/nutrition/`,
`api/nutrition/` und `tools/`.

`[cmd]` **Typecheck sauber** (`tsc --noEmit`, `apps/web`).

`[cmd]` **Vier Breiten fotografiert** — 1440, 1280, 768, **375**; hell
und dunkel. **7 Attrappen, 2 Konsolenfehler** an jeder Breite;
**beide Fehler sind Next-Hydrationswarnungen aus dem Rahmen**, nicht aus
diesem Umbau.

---

## Geaenderte Dateien

| Datei | Was |
|---|---|
| `apps/web/src/lib/nutrition/food-search.ts` | `p_user_id` im Argumenttyp, Kennung aus der Sitzung, `preferences_applied` / `preferences_hidden`, Zweitaufruf `verborgeneTreffer` |
| `apps/web/src/app/api/nutrition/foods/route.ts` | `prefs=1` durchreichen (Vorgabe aus) |
| `apps/web/src/app/v2/nutrition/mahlzeiten.tsx` | Vier Filter, zwei Sortierungen, Hinweis auf verborgene Treffer |
| `tools/lauf.py` | `npx`, `pnpm`, `node`, `hole` |
| `tools/schuss.mjs` | `--klick`, `--tippe`, Sichtbarkeitsmeldung |

**Nicht angefasst:** `erfassen.tsx`, `tab-foods.tsx`, `packages/ui`,
`supabase/`.

---

## Neue Befunde

1. **`erfassen.tsx` ist toter Code** — 477 Zeilen, null Importeure.
   **Loeschen oder anschliessen**, aber nicht so stehen lassen: der
   naechste Auftrag baut sonst wieder daran vorbei.
2. **Der Anzeigename fehlt an drei Stellen** in `mahlzeiten.tsx`:
   **750** (Trefferliste), **766** (Auswahl), **535** (der Text, der
   nach der Auswahl im Suchfeld steht). Ueberall `f.name_de` statt
   `name_display_de || name_de`. `[cmd]` **5.014 von 7.140 Eintraegen
   tragen einen abweichenden Anzeigenamen** — die Trefferliste zeigt
   also ueberwiegend den amtlichen statt des lesbaren Namens. **Genau
   der Punkt, den G-13 fuer erledigt hielt** — erledigt ist er in der
   toten Datei.
3. **Zwei Hydrationswarnungen** auf `/v2/nutrition`
   (`data-mode` am `<html>`), an jeder Breite.
