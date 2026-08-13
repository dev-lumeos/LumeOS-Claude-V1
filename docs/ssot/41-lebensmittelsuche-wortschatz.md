# Lebensmittelsuche: die Wortschatzlücke (Analyse)

`[cmd]` Stand 2026-08-13, Anker `7ecb7dc`. **Reine Analyse — an Daten,
Schema und Suchfunktion wurde nichts geändert.** Alle Zahlen stammen aus
lesenden Abfragen gegen die laufende Instanz und aus Aufrufen der echten
`nutrition.food_search` mit denselben Parametern, die `apps/web` reicht.

**Ort:** `docs/ssot/`, weil das Ergebnis ein belegter Ist-Zustand mit
Markern ist und die 30er-Reihe bereits die Datenbefunde trägt
(`35-naehrwert-bezugsgroesse`, `36-testbasis`). Ein eigenes
`docs/analysen/` für eine Datei hätte die Struktur zersplittert.

---

## 0. Der Anlass, nachgemessen

Tom suchte `huehnchenbrust` und fand nichts. Er fand das Produkt über den
**Kategoriefilter Geflügel**, nicht über die Suche.

`[cmd]` Seine fünf Formen gegen die laufende Suchfunktion:

| Anfrage | Treffer |
|---|---|
| `huehnchenbrust` | **0** |
| `huehnerbrust` | **0** |
| `huehner brust` | **0** |
| `pouletbrust` | **0** |
| `chicken brust` | 31 |
| `haehnchen brust` | 31 |
| `huhn` | 31 |
| `haehnchenbrust` | 13 |

Vier von fünf führen ins Leere. Zwei Ergebnisse überraschen und sind
wichtiger als das erwartete Scheitern:

- **`chicken brust` funktioniert.** Weil jedes Lebensmittel einen
  englischen Alias trägt, greift die Mischform.
- **`huhn` trifft 31 — aber falsch.** `[cmd]` Die Treffer kommen aus
  `Suppenhuhn`, `Rebhuhn`, `Geflügelkraftbrühe (Huhn)`. Der Teilstring
  passt zufällig; das gesuchte `Hähnchen Brustfilet` ist **nicht**
  darunter. *Eine Trefferzahl über null ist noch kein Fund.*
- **`haehnchenbrust` trifft 13.** `[cmd]` Der Bestand schreibt denselben
  Begriff auch zusammen: `Hähnchenbrustfilet gebraten` existiert neben
  `Hähnchen Brustfilet, roh`. Der Bestand ist mit sich selbst uneins.

---

## 1. Wie die Suche arbeitet — die drei Mechanismen, die alles erklären

`[cmd]` Aus `pg_get_functiondef(nutrition.food_search)` gelesen:

1. **UND über alle Token.** Die Bedingung lautet
   `NOT EXISTS (… WHERE NOT (…))` — **jedes** Token muss irgendwo passen.
   Ein einziges unbekanntes Wort liefert null Treffer, egal wie gut der
   Rest passt.
2. **Teilstring, nicht Wortanfang.** `search_fold(…) LIKE '%' || tok || '%'`.
   Das erklärt sowohl die Zufallstreffer (`huhn` in `Suppenhuhn`) als
   auch das harte Scheitern der Zusammenschreibung: `haehnchenbrust` ist
   in `haehnchen brustfilet` **nicht** als Teilstring enthalten — das
   Leerzeichen steht dazwischen.
3. **Relevanz liest nur `name_de`.**
   `WHEN lower(name_de) = lower(p_query) THEN 1.0 … LIKE p_query||'%' THEN 0.85 ELSE 0.65`.
   Ein Treffer, der **nur** über einen Alias zustande kam, bekommt
   zwangsläufig 0.65 — er kann nie vor einen schwächeren Namenstreffer
   sortiert werden.

`[cmd]` `search_fold` normalisiert `ä/ö/ü/ß` und Kleinschreibung, sonst
nichts. `[cmd]` Die App reicht `p_tokens` selbst herein
(`buildFoodSearchTokens` = normalisieren + an Leerzeichen trennen).

---

## 2. Der Alias-Bestand trägt kein Wissen

`[cmd]` 21.420 Aliase = 7.140 × **exakt drei**, bei jedem Lebensmittel
dieselbe Mechanik, `source = 'editorial'` bei allen:

| Alias-Art | Beispiel (`Hähnchen Brustfilet, roh`) |
|---|---|
| der Name selbst | `Hähnchen Brustfilet, roh` |
| Name gefaltet | `haehnchen brustfilet roh` |
| Übersetzung | `Chicken breast fillet, raw` |

**Zwei Folgen.** Erstens ist `source = 'editorial'` eine Fehlbezeichnung —
nichts daran ist redaktionell. Zweitens erklärt der dritte Typ, warum
**Englisch durchgehend funktioniert** und Umgangssprache nicht: Die
Übersetzung ist da, der Dialekt nicht.

---

## 3. TEIL 1 — Die Wortschatzlücke, gemessen

`[cmd]` **2.643 verschiedene Erstwörter** auf 7.140 Lebensmittel. Die
häufigsten: `schwein` 240, `schaf` 171, `rind` 163, `kalb` 129,
`haehnchen` 78, `pute` 65.

**71 Alternativbezeichnungen zu den häufigsten Begriffen geprüft**, je
gegen die echte Suchfunktion. Ergebnis nach Art:

| Art | geprüft | ins Leere | Quote |
|---|---|---|---|
| Österreichisch | 7 | **6** | 86 % |
| Schreibvariante | 2 | **2** | 100 % |
| Regional (D) | 3 | **2** | 67 % |
| Schweizerdeutsch | 4 | **2** | 50 % |
| Umgangssprache | 23 | **3** | 13 % |
| Englisch | 20 | **0** | 0 % |
| Plural | 3 | 0 | 0 % |
| Teilbegriff | 6 | 0 | 0 % |
| Zusammengeschrieben | 3 | 0 | 0 % |
| **gesamt** | **71** | **15** | **21 %** |

**Die 15, die ins Leere führen** `[cmd]`:
`marille`, `karfiol`, `paradeiser`, `erdapfel`, `ribisel`,
`kohlsprossen` (österreichisch) · `poulet`, `schoggi` (schweizerisch) ·
`blaubeere`, `fleischkas` (regional) · `brokkoli`, `yoghurt`
(Schreibvariante) · `huehnchen`, `huehnerbrust`, `truthahn`
(Umgangssprache).

**`brokkoli` und `yoghurt` sind der bitterste Fall:** keine Mundart,
sondern die **gebräuchlichere deutsche Schreibung**. Der Bestand führt
`Broccoli` und `Joghurt`; wer die andere zulässige Variante tippt, findet
nichts.

`[annahme]` Die Auswahl der Alternativen ist mein Sprachwissen, nicht aus
den Daten belegt. Belegt ist ausschliesslich, **ob sie heute treffen**.

### Toms Strukturbeobachtung

Der Bestand trennt `Hähnchen Brust` von `Hähnchen Brustfilet` — zwei
Grundprodukte mit je eigenen Zubereitungsvarianten. `[cmd]` Für einen
Suchenden ist der Unterschied nicht erkennbar: beide sind Brustfleisch
vom Huhn, die Trennung ist eine BLS-interne Unterscheidung (mit/ohne
Knochen und Haut). Wer `haehnchen brust` tippt, bekommt **31 Treffer aus
beiden Gruppen** und muss selbst sortieren.

---

## 4. TEIL 2 — Zusammengeschrieben gegen getrennt

Das ist die **grösste einzelne Klasse**, und sie ist rein mechanisch.

`[cmd]` Von 7.140 Namen tragen **5.947 (83,3 %)** einen mehrwortigen Kopf
vor dem ersten Komma. Davon sind **1.944 zweiwortige Köpfe** verschieden
(`Hähnchen Brust`, `Rind Hackfleisch`, `Schwein Schnitzel`).

| Test: Kopf ohne Leerzeichen getippt | Zahl |
|---|---|
| zweiwortige Köpfe insgesamt | 1.944 |
| findet irgendetwas | 16 |
| **findet nichts** | **1.928 (99,2 %)** |

Die 16 Ausnahmen sind `[cmd]` überwiegend Zufallstreffer in *anderen*
Gerichten (`Hähnchen Brust` → `Hähnchenbrustfilet mit Cornflakes
paniert`), nicht echte Doppelschreibungen.

**Der umgekehrte Fall existiert, ist aber nachweislich harmlos:** Der
Bestand schreibt lange Begriffe zusammen (`gemuesemischung` 54,
`milchmischgetraenk` 19, `vollmilchschokolade` 17). Wer sie trennt,
müsste am UND über beide Token scheitern — tut es aber nicht:
`[cmd]` `gemuese mischung` **55**, `gemuesemischung` **55** — identisch.
Der Grund ist derselbe Teilstring-Vergleich, der oben die Zufallstreffer
erzeugt: beide Wörter stecken im zusammengeschriebenen Namen. `[cmd]`
Ebenso `paprika` 60, `schokolade` 162.

*Die Asymmetrie ist der Kern:* Teilstring rettet, wenn der Bestand
**zusammen** schreibt und der Mensch trennt — aber nie umgekehrt. Ein
Leerzeichen im Bestandsnamen ist eine Mauer, ein fehlendes Leerzeichen
in der Anfrage nicht.

**Der Bestand löst Regionalvarianten teilweise selbst:** `[cmd]` 836
Namen tragen einen Schrägstrich (`Karotte/Möhre`, `Dorsch/Kabeljau`,
`Köhler/Seelachs`) — beide Hälften stehen im Namen und sind auffindbar.
423 verschiedene Köpfe nutzen dieses Muster. *Das ist die vorhandene,
funktionierende Antwort auf dieselbe Frage — nur unvollständig
angewandt.*

---

## 5. TEIL 3 — Warum die Kategorie funktioniert hat, und wo sie aufhört

`[cmd]` `food_search` kennt `p_category_slug`, `p_category_id` und
`p_tag_code`; `apps/web` reicht alle drei durch
(`FoodSearchFilterState` mit `category` und `tag`, Filter-Links in
`foods/page.tsx`). **Nichts liegt hier brach.**

`[cmd]` Der Kategorieaufruf ohne Suchbegriff liefert für `gefluegel`
**226 Treffer** — das ist der Weg, den Tom genommen hat.

**Aber die Kategorien tragen nur zwei Drittel:**

| Posten | Wert |
|---|---|
| Kategorien angelegt | 518 |
| davon **belegt** | **28** |
| Foods **ohne** Kategorie | **2.237 (31 %)** |

Und die Tags sind fast leer: `[cmd]` **4 von 16** Definitionen benutzt —
`low_carb` (4.659), `low_fat` (2.648), `high_protein` (1.400),
`high_fiber` (558). Alle vier sind **aus Nährwerten gerechnet**. Die
zwölf, die einem Suchenden helfen würden — `vegan`, `vegetarian`,
`gluten_free`, `lactose_free`, `halal`, `kosher`, `nut_free`, … — stehen
**auf null**.

### Der Rückfall auf die Kategorie: geprüft und verworfen

Die Idee war: findet die Suche nichts, aber der Begriff passt auf eine
Kategorie, zeig die Kategorie.

`[cmd]` **Sie scheitert an genau Toms Fall.** Kategorienamen, die
`huehnchen` oder `poulet` enthalten: **null**. Die Kategorien heissen
`Geflügel`, `Poularde & sonstiges Hausgeflügel`, `Suppenhuhn` — sie
benutzen **dieselbe Fachsprache wie die Lebensmittelnamen**. Ein
Rückfall hilft nur, wenn der Nutzer bereits das Fachwort kennt; dann
hätte die Suche ohnehin getroffen.

*Der Weg löst das Problem nicht, er verschiebt es auf eine zweite Menge
von Namen mit demselben Wortschatzproblem.*

---

## 6. TEIL 4 — Empfehlung

### 6.1 Reicht eine Alias-Erweiterung?

**Für die grosse Klasse ja, für die schwierige nein.**

| Klasse | Fälle | Alias-Erweiterung löst? |
|---|---|---|
| Zusammenschreibung | **1.928** | **ja, vollständig und ableitbar** |
| Regional/Dialekt/Schreibvariante | 15 von 71 geprüft | ja, aber nur mit Sprachwissen |
| Zufallstreffer (`huhn` → `Suppenhuhn`) | unbeziffert | **nein** — das ist die Relevanz, nicht der Alias |
| Grundprodukt-Trennung (`Brust`/`Brustfilet`) | strukturell | **nein** — Produktentscheidung |

### 6.2 Wieviele Einträge braucht es?

- **Ableitbar, ohne Sprachwissen:** `[cmd]` **5.947** Lebensmittel haben
  einen mehrwortigen Kopf. Ein Alias je Food (Kopf ohne Leerzeichen)
  ergibt **5.947 Einträge**, davon **4.308 verschiedene Zeichenfolgen**.
  Nimmt man den ganzen Namen ohne Leerzeichen und Kommata dazu:
  `[cmd]` **7.140** weitere, alle verschieden.
- **Sprachwissen, häufigste Begriffe:** Für die **50 häufigsten
  Erstwörter** mit je 2–4 Alternativen ergibt das **100 bis 200
  Einträge** — sie decken `[cmd]` aber nur **24,9 %** des Bestands ab.
- **Sprachwissen, brauchbare Abdeckung:** `[cmd]` Für 43,6 % braucht es
  die 200 häufigsten Erstwörter, für 71,9 % die 800 häufigsten. Bei 2–3
  Alternativen je Begriff sind das **400 bis 2.400 Einträge**. Für den
  ganzen Bestand (2.643 Erstwörter) **rund 5.000 bis 8.000** — und dann
  ist es kein Nachtrag mehr, sondern ein Wörterbuch.

**Die Zahl, auf die es ankommt: die 50 häufigsten Begriffe decken ein
Viertel ab.** Es gibt keinen kleinen Satz, der das Problem löst — der
Schwanz ist lang und flach.

### 6.3 Was sich ableiten lässt

| Ableitung | Einträge | Aufwand |
|---|---|---|
| Kopf ohne Leerzeichen (`haehnchenbrustfilet`) | 5.947 | ein `INSERT … SELECT` |
| ganzer Name ohne Leerzeichen/Kommata | 7.140 | dito |
| Schrägstrich-Hälften einzeln (`Karotte`, `Möhre`) | `[cmd]` 836 Namen | dito |

Zusammen **rund 13.900 Einträge, null Handarbeit** — und damit die
99,2-Prozent-Klasse erledigt. Diese Aliase sind **reproduzierbar**: Bei
einer Neueinspielung entstehen sie aus demselben `SELECT` neu, sie
veralten nicht und niemand muss sie pflegen.

### 6.4 Wer pflegt den Rest?

**Die ehrliche Antwort: niemand, solange es niemandes Aufgabe ist.** Und
eine zu 5 % gefüllte Alias-Tabelle, die trotzdem in die Relevanz
einfliesst, ist schlechter als keine — sie bevorzugt willkürlich die
gepflegten Einträge.

`[cmd]` Die Kurationstabellen (`food_curation_candidates`,
`food_curation_decisions`) sind **leer** und genau dafür gebaut. Der
gangbare Weg ist deshalb **nicht** eine Pflegeliste, sondern:

1. Den ableitbaren Teil sofort erzeugen (6.3) — er braucht keinen
   Pfleger.
2. Fehlsuchen **mitschreiben**: Anfragen mit null Treffern sind die
   einzige Quelle, die sagt, welches Wort wirklich fehlt. Heute
   `[annahme]` gibt es keine solche Erfassung — das wäre der erste
   Schritt, nicht das Wörterbuch.
3. Aus den häufigsten Fehlsuchen Kurationskandidaten machen. Dann
   pflegt man **die 30 Wörter, die Leute tatsächlich tippen**, statt
   2.643 Begriffe auf Verdacht.

*Ohne Schritt 2 ist jede Wortliste geraten — auch meine 71.*

### 6.5 Muss `food_search` geändert werden?

**Für die ableitbaren Aliase: nein.** `[cmd]` Die Funktion liest
`food_aliases` bereits im `WHERE`; ein neuer Eintrag wirkt sofort. Die
Tabelle hat `locale` und `source`, ein Schema-Eingriff entfällt.

**Für brauchbare Ergebnisse: ja, zwei kleine Änderungen** — und sie sind
wichtiger als die Aliase selbst:

1. **Relevanz auch aus Aliasen speisen.** `[cmd]` Heute liest
   `text_rank` nur `name_de`; ein reiner Alias-Treffer bleibt bei 0.65.
   Nach 13.900 neuen Aliasen heisst das: `haehnchenbrustfilet` trifft —
   und landet hinter jedem beliebigen Namenstreffer. **Die kleinste
   Änderung:** im `CASE` zusätzlich prüfen, ob ein Alias exakt oder mit
   Präfix passt, und dann dieselben 1.0/0.85 vergeben.
2. **Zufallstreffer entschärfen.** `[cmd]` `huhn` trifft `Suppenhuhn`,
   weil `LIKE '%tok%'` mitten im Wort passt. Ein Treffer am **Wortanfang**
   (`LIKE tok || '%'` oder `LIKE '% ' || tok || '%'`) ist fast immer der
   gemeinte. Als zusätzliche Relevanzstufe, nicht als Filter — sonst
   verliert man Zusammensetzungen wie `Hähnchen**brust**filet`.

### 6.6 Reihenfolge nach Nutzen pro Aufwand

| # | Schritt | Nutzen | Aufwand |
|---|---|---|---|
| 1 | Ableitbare Aliase erzeugen (Zusammenschreibung, Schrägstrich) | **1.928 unerreichbare Köpfe erreichbar** | ein `INSERT … SELECT`, keine Pflege |
| 2 | Relevanz aus Aliasen speisen | ohne das bleibt Schritt 1 halb wirkungslos | ein `CASE`-Zweig |
| 3 | Fehlsuchen mitschreiben | macht die Pflegefrage **beantwortbar** | eine Tabelle, ein Insert im Suchpfad |
| 4 | Wortanfang-Stufe in der Relevanz | weniger Zufallstreffer | ein `CASE`-Zweig |
| 5 | Dialekt-/Regionalaliase aus den Fehlsuchen | die 15 gemessenen Fälle und ihresgleichen | Handarbeit, aber **belegt statt geraten** |

**Womit ich anfangen würde: Schritt 1 und 2 zusammen.** Einzeln bringt
keiner von beiden etwas — neue Aliase ohne Relevanzanbindung landen ganz
hinten, eine Relevanzanbindung ohne Aliase hat nichts zu bewerten.
Zusammen erledigen sie die grösste gemessene Klasse (99,2 %) ohne jede
Pflegeverpflichtung.

**Schritt 3 vor Schritt 5.** Die Wortliste ohne Fehlsuchdaten ist
geraten — meine 71 Alternativen sind ein Vorschlag, keine Messung des
tatsächlichen Nutzerwortschatzes.

---

## 7. Was diese Analyse nicht beantwortet

- **Wie oft die Fälle real vorkommen.** `[cmd]` Es gibt keine Erfassung
  von Suchanfragen; alle Häufigkeitsaussagen beziehen sich auf den
  **Bestand**, nicht auf das Nutzerverhalten.
- **Ob die BLS-Trennung `Brust`/`Brustfilet` bleiben soll.** Das ist eine
  Produktentscheidung, keine Suchfrage.
- **Die 2.237 Foods ohne Kategorie.** Sie sind über keinen Filter
  erreichbar — ein eigener Befund, hier nur benannt.
- **Ob `source = 'editorial'` umbenannt werden sollte.** Die Bezeichnung
  ist `[cmd]` falsch (nichts daran ist redaktionell) und würde spätestens
  dann stören, wenn es echte redaktionelle Aliase gibt.
