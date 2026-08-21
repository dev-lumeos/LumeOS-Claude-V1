# 168 — Nährstoff-Tab: acht Karten, Volltextsuche, Ursachen im Filter

**Auftrag:** G-129 (GO-22, G-127, G-128) · **Stand:** 2026-08-21 ·
**Modul:** Nutrition
**Vorher:** 166 (G-122: Baum, Ansicht, Modal), 164 (C-161:
`parent_code`, `nutrient_details`), 161 (G-121: Fenster, Filter)

**Kurz:** Die drei Makro-Äste tragen eigene Karten — **acht in fester
Reihenfolge**, die Äste bleiben ganz (23+37+21+17+12+16+2+10 = 138).
Die **Volltextsuche läuft ohne Schema**: Name, Code, Erklärungen und
Quellen sind je Knoten normalisiert mitgeliefert (33.697 Zeichen für
alle 138); „Omega 3", „EPA", „Skorbut" und `FE` treffen, ein Treffer
steht mit seinem ganzen Ast da. Der Filter zeigt jetzt die **Ursache**:
unter einem selbst auffälligen Knoten erscheinen die Kinder mit Wert —
Vitamin A über UL zeigt seine vier Formen samt Zahlen. Tests
**453/453**.

---

## Wie die acht Karten stehen

`[cmd]` `karteFuerWurzel` ordnet die 40 Wurzeln zu, die Reihenfolge
ist fest (`KARTEN_REIHENFOLGE`), gemessen im Browser:

| Karte | Einträge | Inhalt |
|---|---:|---|
| Kohlenhydrate | 23 | `CHO`-Ast (Zucker, Stärke, Oligosaccharide, Zuckeralkohole) **und `FIBT`-Ast** |
| Fette | 37 | `FAT` mit den 36 Fettsäuren |
| Protein | 21 | `PROT625` mit den 19 Aminosäuren und `NT` |
| Fettlösliche Vitamine | 17 | unverändert |
| Wasserlösliche Vitamine | 12 | unverändert |
| Elemente | 16 | unverändert |
| Energie | 2 | kcal, kJ |
| Sonstige | 10 | Wasser, Alkohol, Organische Säuren, Rohasche, Cholesterin |

Summe 138, kein Knoten doppelt, **die Äste sind ganz** — nur die
Überschriften sind vertrauter (GO-22; wie Cronometer und die
wissenschaftliche Klassifikation).

`[read]` **Zwei Zuordnungen waren nicht wörtlich im Auftrag und sind
meine Auslegung:** (1) **`FIBT` unter „Kohlenhydrate"** — Ballaststoffe
sind Kohlenhydrate, Cronometer führt sie dort; die Auftragstabelle
nannte nur Zucker/Stärke/Oligosaccharide. (2) **Wasser, Alkohol,
Organische Säuren, Rohasche unter „Sonstige"** — die Acht-Karten-Liste
lässt ihnen keinen anderen Platz, eine neunte „Makronährstoffe"-Karte
hätte der Entscheidung widersprochen. Beides ist reine Anzeige und in
einer Zeile umgehängt, falls Tom es anders will.

`[cmd]` **Folge für gespeicherte Ansichten:** die Gruppen-Schlüssel
(`g:Makronährstoffe`) verfallen durch die Umbenennung — solche Karten
starten wieder zu; die Knoten-Codes gelten weiter. Einmalig, kein
Datenverlust.

## Was die Suche findet

**Ohne Schema, wie der Auftrag es zuerst wollte:** je Knoten liegen
zwei normalisierte Suchfelder bei (klein, ohne Akzente und
Trennzeichen — „Omega 3", „Omega-3" und „OMEGA_3" werden gleich):
`suchName` (Code + amtlicher Name) und `suchText` (Funktion, Mangel,
Überschuss, Detail, Tipp, `top_sources_de`). `[cmd]` Alle 138 zusammen
33.697 Zeichen — im Seitenpayload billiger als ein Alias-Schema.

**Die Nähe-Regel** (`trifftSuche`, Wächtertests): 2 Zeichen treffen nur
den ganzen Code, 3 auch den Namen, ab 4 auch die Erklärtexte. `[cmd]`
Der Grund ist gemessen: mit Texten ab 3 Zeichen fing „EPA" auch Valin
und Vitamin C — über das „epa" in *„Reparatur"*. Mit der Regel liefert
„EPA" exakt den Pfad Fett → FAPU → Omega-3 → Eicosapentaensäure.

| Anfrage | Treffer `[cmd]` |
|---|---|
| „Omega 3" | FAPUN3 (und FAPUN6 — die „3" ist als Einzelzeichen bewusst kein Filter), mit Ast FAT → FAPU |
| „EPA" | F20:5CN3, nur der Pfad — kein Beifang |
| „Skorbut" | genau Vitamin C (aus `deficiency_de`) |
| `FE` | genau Eisen — fällt nicht in jedes „…fe…" |
| „Lachs" | u. a. FAPUN3, DHA, Biotin (aus `top_sources_de`) |

**Ein Treffer öffnet seinen Ast** — die Suche rendert Treffer samt
Elternpfad ausgeklappt; Klick auf die Zeile öffnet das Modal. Während
der Suche ist der Scope-Filter aus (zwei Filter übereinander wären
nicht mehr erklärbar; eine Hinweiszeile sagt es), **und die Suche wird
nicht gespeichert** — sie ist flüchtig, wie beauftragt.

## Wie die Ursachen sichtbar werden

`[cmd]` Die Regel (`zeigeKind`): unter einem Knoten, der **selbst** den
Filter trifft, erscheinen zusätzlich die Kinder, **die einen Wert
tragen** — Toms Frage „aufgeklappt oder nur mit Wert?" ist damit
beantwortet: nur mit Wert, sonst stünden bei den Fettsäuren dreissig
Kontextzeilen.

`[cmd]` Toms Beispiel, gemessen unter „Auffällig" (heute): **Vitamin A
3.582,8 µg RE gegen UL 3.000** — darunter sofort die Ursache:
Beta-Carotin **17.413,7 µg**, RAE 2.063,1 µg, Retinol 543,2 µg,
übrige Carotinoide 1.611,8 µg (vier von vier, alle mit Wert). Dieselbe
Regel wirkt überall: Vitamin D „74 % unter Ziel" zeigt D3 (11,1 µg)
und D2 (0 µg) darunter. Die Gegenrichtung aus G-121 (Eltern bleiben
wegen auffälliger Kinder stehen) gilt unverändert.

## Was ein Alias-Schema bräuchte

**Heute nicht nötig** — die vier Belege laufen über Namen und
C-161-Texte. Es bräuchte eines (Codex-Auftrag, analog `food_aliases`
mit 32.845 und `biomarker_aliases` mit 292 Zeilen), sobald Synonyme
gefragt sind, die **in keinem Text stehen**, z. B.:

- Umgangsnamen: „Blutzucker"→GLUS, „Salz"→NA, „Folsäure"→FOL (falls
  der Text sie nicht ohnehin nennt),
- Fremdsprachen (die en/th-Spalten liegen zwar in `nutrient_details`,
  sind aber nicht im Suchtext),
- Tippfehler-Toleranz — Teilzeichenketten fangen einiges, aber kein
  „Omga 3".

`[read]` Der ehrliche Auslöser wäre eine gemessene erfolglose Suche,
nicht eine Vermutung. Bis dahin: 138 Zeilen, Browser-Suche, kein
Schema.

## Nachweise

| Behauptung | Beleg |
|---|---|
| Acht Karten, Äste ganz | `[cmd]` 8 Kopfzeilen in bestellter Reihenfolge, Summen 23+37+21+17+12+16+2+10 = 138; Bild `backup/g129/acht-karten-1440.png` |
| Suche | `[cmd]` Tabelle oben; je Anfrage die sichtbaren Zeilen protokolliert |
| Treffer öffnet Ast | `[cmd]` „Omega 3" zeigt FAT → FAPU → FAPUN3 ohne einen Klick |
| Vitamin A über UL mit Kindern | `[cmd]` 3.582,8 gegen UL 3.000; CARTB 17.413,7 / VITAA 2.063,1 / RETOL 543,2 / CAROTPAXB 1.611,8; Bild `auffaellig-vita-1440.png` |
| Gespeicherte Ansicht lebt | `[cmd]` frischer Kontext lädt die zuletzt geschriebene Sicht aus der DB (Probelauf D); Umbenennungs-Verfall dokumentiert |
| Zeilenschutz | `[cmd]` test-user sucht „Omega 3" und sieht seine Striche; devs 3.583 kommt in seinem HTML **0**-mal vor |
| Bilder | `backup/g129/`: acht Karten (hell/dunkel × 1440/375 + Übersicht), Auffällig mit Vitamin-A-Kindern; je 1 Attrappe (Buddy-Orb, Bestand), 2 bekannte Konsolenfehler |
| Typen und Tests | `[cmd]` typecheck grün, Tests **453/453** (449 + 4: Suche, Normalisierung, Ursachen-Regel, Kartenzuordnung) |

## Befund am Rand

`[cmd]` Beim ersten Messlauf stand die **live gespeicherte Ansicht auf
„Auffällig" mit Fenster 30** — jemand (mutmasslich Tom) hatte den Tab
benutzt; meine Probeläufe haben diese Sicht überschrieben (Filter
„Alle", Fenster 1, Suchproben). Das ist das erwartete Verhalten der
Speicherung, aber: **Probeläufe verändern jetzt Nutzerzustand.**
Künftige Nachweise sollten die Ansicht am Ende zurückschreiben oder
auf test-user laufen.

## Was nicht angefasst wurde

- **Kein Schema** — kein Alias-Schema angelegt (Begründung oben),
  `supabase/` unberührt.
- **Die gespeicherte Ansicht ist nicht umgebaut** — die Suche bleibt
  bewusst draussen.
- **`packages/ui`**, Wasser-Kachel, Deckungsgrenze (GO-23) unberührt.
