---
nr: G-331
typ: feature
modul: nutrition
schwere: hoch
angelegt: 2026-09-02
braucht: []
kind_von: G-323
entscheidung: null
agent: claudecode
beauftragt: 2026-09-02
erledigt: 2026-09-02
commit: 13c12f6f
beruehrt:
  dateien:
    - apps/web/src/app/v2/nutrition/mahlzeiten.tsx
zahlen:
  gemessen: 2026-09-02
---

# G-331 — vier Suchen auf den Hook umstellen

## Befund

Aus G-323, Claude Code, 2026-09-02.

    Lehre                  tab-foods  mahlzeiten  vorlieben  erfassen
    G-70   Seitensortier.     ja          -          -          -
    G-112  mehrere Tags       ja          -          -          -
    G-133  ohne               ja          -          -          -
    G-154  prefs              ja         ja         ja          -
    G-251  herkunft           ja          -          -          -
    G-266  Erstlauf           ja          -          -          -
    Abbruch                   ja          -         ja          -
    Entprellen                ja         ja         ja          -
    fehlen von 8:              0          6          5          8

`[read]` **Der Schaden sind nicht die doppelten Zeilen** — **es sind
sechs teuer gelernte Lehren, die in Kopien fehlen.**

`[cmd]` **`rezepte-echt.tsx` ist seit G-323 umgestellt** — **die
uebrigen vier nicht.**

## Was jetzt geht

`[cmd]` **G-72 hat zehn Bauteile aus `tab-foods.tsx` exportiert:**
`PILLEN`, `SEITE_GROESSE`, `FILTERGRUPPEN`, `UNVERTRAEGLICH_LABEL`,
`filterLabel`, `FilterChip`, `facettenZahl`, `SortKopf`, `zahl`,
`makro`.

`[cmd]` **Und `food-suche-hook.ts` traegt Entprellen, Abbruch,
Filterparameter** (G-320).

`[read]` **Die Voraussetzung steht** — **es ist Verdrahtung, kein
Neubau.**

## Auftrag

**Mitbeauftragt: G-305, G-314.** Bericht in diese Datei.

**Beauftragt am 2026-09-02.**

### 1 · Die vier Suchen

`[cmd]` **`mahlzeiten` fehlen sechs Lehren, `vorlieben` fuenf,
`erfassen` alle acht.**

`[cmd]` **`food-suche-hook.ts` traegt Entprellen, Abbruch,
Filterparameter.** `[cmd]` **Und zehn Bauteile aus `tab-foods.tsx`
sind seit G-72 exportiert.**

`[read]` **Miss je Suche, ob der Hook passt** — **`erfassen.tsx`
koennte einen anderen Zweck haben als eine Trefferliste.**

`[read]` **Und wo eine Suche das Modal aus G-320 rufen kann statt
einer eigenen Liste: melden.**

### 2 · G-305 — vier Sackgassen in Plaenen und Planner

`[read]` **Lies den Punkt und miss, was davon noch gilt** — **seit
G-311, G-315, G-319 und G-326 ist viel daran gebaut worden.**

### 3 · G-314 — die Vorschau fuer nicht-aktive Plaene

`[cmd]` **`SPEC_03` Flow 3 Schritt 3: *Tap auf Plan →
Plan-Vorschau*, danach *Plan aktivieren*.**

`[cmd]` **Seit G-311 gibt es `?plan=`** — der Planner oeffnet einen
beliebigen Plan. `[read]` **Die Vorschau braucht dasselbe, nur
lesend.**

`[cmd]` **Und seit G-327 gilt `?plan=` nur im Planner** — **die
Vorschau darf den Reiter nicht wieder umschalten.**

### Was nicht zu tun ist

**Keine fuenfte Suche.**
**Nichts auf `dev@lumeos.app` schreiben.**
Nicht committen, nicht stagen, nicht pushen.

### Nachweis

    je Suche         welche Lehren jetzt gelten, gezaehlt
    erfassen.tsx     passt der Hook, oder anderer Zweck
    G-305            was gilt noch
    Vorschau         oeffnet nicht-aktive Plaene, Reiter bleibt
    Bildschirmfoto   vorher / nachher

## Bericht

**Claude Code, 2026-09-02.** Mitbeauftragt G-305 und G-314; alles in
diesem Bericht. **Nicht committet, nichts auf `dev@lumeos.app`
geschrieben** (letzte Mahlzeit unveraendert vom 01.09.).

**Umfang: 368 Zeilen dazu, 464 entfernt** — netto weniger Code.

### 1 · Die vier Suchen — je Fall gemessen

**Der Auftrag sagte: miss, ob der Hook passt. Er passt nicht ueberall,
und einmal gar nicht.**

    Datei              fehlten   Entscheidung
    mahlzeiten.tsx      6 von 8  FoodSuchModal statt eigener Liste
    tab-vorlieben.tsx   4 von 8  Hook, aber OHNE Vorlieben
    erfassen.tsx        8 von 8  toter Code -- gemeldet, nicht umgebaut

`[cmd]` **Meine G-323-Zahl fuer `tab-vorlieben` war zu hoch** —
gemessen fehlen **vier**, nicht fuenf: Entprellen und Abbruch hatte
sie bereits.

**`mahlzeiten.tsx`:** `HinzufuegenModal`, **380 Zeilen seit C-03**,
ist entfernt (A-59). **Das Tagebuch ruft `FoodSuchModal`** —
gemessen: **10 Sortierknoepfe statt 2**, Filter, Treffergrund,
Naehrwertvorschau. **Der Schreibweg (`art: 'position'`) bleibt beim
Aufrufer.**

**`tab-vorlieben.tsx` — und hier gilt eine Lehre NICHT:**

`[cmd]` **`prefs=1` waere dort falsch.** `[read]` **Diese Suche SETZT
Vorlieben** (`foodSetzen(…, 'liked')`), sie liest nicht den
gefilterten Katalog. **Mit den Vorlieben angewandt versteckte der
Filter genau die Lebensmittel, die man aufnehmen will:** wer Nuesse
als Allergie gesetzt hat, faende keine Nuss mehr, um sie zu
berichtigen.

`[cmd]` **Deshalb traegt `sucheParams` jetzt einen Schalter**, mit
`true` als Vorgabe — wer ihn nicht setzt, bekommt das richtige
Verhalten. **Am Schirm gegengeprueft: „nuss" findet
*Kalbsnuss (im Ofen gebraten)*.**

### Ein Meldebefund: `erfassen.tsx` ist tot

`[cmd]` **477 Zeilen, `export function Erfassen`, KEIN Aufrufer** —
gemessen am 2026-09-02, zuletzt geaendert am **16.08.**

`[read]` **Nicht umgebaut, weil es nichts aendern wuerde.** **Ein
Waechter faengt es ab, wenn die Datei je einen Aufrufer bekommt** —
dann gehoert sie auf den Hook.

`[read]` **Zu entscheiden ist, ob sie geloescht wird.** `[cmd]`
**`ErfassenModal` (G-272) ist eine andere Datei und wird benutzt.**

### 2 · G-305 — was noch galt

    1  New plan legt Wochen an        erledigt  planMitWochenAnlegen (C-372)
    2  Planner meldet "kein Plan"     GALT      Attrappe entfernt
    3  New recipe informiert falsch   erledigt  G-319, nur noch Kommentar
    4  Copy week erklaert sich weg    erledigt  G-319, echter Dialog
    +  Lebenszyklus laeuft nie        erledigt  ablaufKlaeren (C-373)
    +  Plan nicht beendbar            erledigt  Status-Wechsel steht

**Einer von sechs galt noch.** `[cmd]` **Im Planner stand ein
`InEntwicklungKnopf`:** *„der Schreibpfad im Browser ist nicht Teil
dieses Auftrags (G-97)"*.

`[cmd]` **Gemessen: der Schreibpfad steht** — `planMitWochenAnlegen`
legt Plan, Wochen und Tage an, **und `NeuerPlanForm` ruft ihn in der
Werkbank.** `[read]` **Ein Knopf, der falsch informiert, ist
schlimmer als keiner** (G-305). **Ersetzt durch einen Verweis
dorthin, wo es geht.**

`[cmd]` **Damit ist der letzte `InEntwicklungKnopf` aus dem Planner
verschwunden** — der Import ist mit entfernt.

### 3 · G-314 — die Vorschau

`[cmd]` **`ladePlan(planId)` nimmt seit G-311 einen Bezeichner** —
**nur der Weg dorthin fehlte.** Neu: `GET ?vorschau=<uuid>`, rein
lesend, mit UUID-Pruefung.

`[cmd]` **Am Schirm gemessen:** 3 Vorschau-Knoepfe, Fenster oeffnet,
**7 Tageszeilen geladen** fuer *Lean bulk 3100* (1 Woche, 7 Tage, 28
Positionen), **URL unveraendert.**

`[read]` **Der Reiter bleibt stehen** — seit G-327 gilt `?plan=` nur
im Planner. **Die Vorschau laedt in ein Fenster, sie setzt keine
Adresse.** Ein Waechter prueft die Abwesenheit von `router.push` und
`?plan=` im Baustein.

`[read]` **Nur die erste Woche** — bei 28 Tagen waere das Fenster
eine Tabelle, durch die niemand scrollt. **Die Zahl daneben sagt, was
nicht gezeigt wird.**

### Nachweis

    Tagebuch      10 Sortierknoepfe (vorher 2), 12 von 24 Treffern,
                  Kontext "Breakfast am 2026-09-02 · Tag danach: 508 kcal"
    Vorlieben     "nuss" findet Kalbsnuss -- ohne prefs
    erfassen      0 Aufrufer, Waechter haelt es fest
    Planner       "nicht Teil dieses Auftrags" weg, Verweis steht
    Vorschau      3 Knoepfe, 7 Tage, URL unveraendert
    Bilder        backup/g331-diary.png, -prefs.png, -vorschau.png

### Gate und Sabotageprobe

    pnpm gate        15 von 15 Tasks, 1.320 Tests, 0 Fehler
    Sabotageprobe    21 von 21 gefangen
    neuer Waechter   suchen-und-vorschau.test.ts, 8 Proben

### Zwei bestehende Waechter zeigten auf die entfernte Datei

`[cmd]` **G-93 prueft, dass die Trefferliste `name_display_de`
zeigt** — **5.014 von 7.140 Eintraegen tragen einen abweichenden.**
Er prueft jetzt `food-such-modal.tsx` statt `mahlzeiten.tsx`; **die
Zusage gilt unveraendert.**

`[cmd]` **Der zweite prueft, dass der ROHNAME ins Suchfeld
zurueckgeht** (G-265: der Anzeigename findet 0 Treffer). `[cmd]`
**`FoodSuchModal` schreibt gar nichts zurueck** — **damit ist die
Gefahr weg, nicht nur behoben.** Der Waechter prueft jetzt die
Abwesenheit.

## Abnahme

**2026-09-02, Orchestrator.** `[cmd]` Gate 15/15, 1.320 Tests, 21
von 21 Sabotagen.

`[cmd]` **368 Zeilen dazu, 464 entfernt** — **netto weniger Code.**

### Er hat je Fall gemessen statt durchgereicht

    mahlzeiten.tsx      6 von 8 fehlten   FoodSuchModal statt Liste
    tab-vorlieben.tsx   4 von 8           Hook, aber OHNE Vorlieben
    erfassen.tsx        8 von 8           toter Code, gemeldet

`[cmd]` **Und seine eigene G-323-Zahl war zu hoch:** `tab-vorlieben`
fehlten **vier, nicht fuenf** — Entprellen und Abbruch hatte sie
bereits.

### Eine Lehre gilt dort nicht — und das ist der beste Befund

`[cmd]` **`prefs=1` waere in `tab-vorlieben` falsch.**

`[read]` **Diese Suche SETZT Vorlieben, sie liest nicht den
gefilterten Katalog.** `[read]` **Mit den Vorlieben angewandt
versteckte der Filter genau die Lebensmittel, die man aufnehmen
will:** *,,wer Nuesse als Allergie gesetzt hat, faende keine Nuss
mehr, um sie zu berichtigen."*

`[cmd]` **Deshalb ein Schalter mit `true` als Vorgabe** — **wer ihn
nicht setzt, bekommt das richtige Verhalten.**

`[cmd]` **Belegt: *nuss* findet *Kalbsnuss*.**

`[read]` **Das ist keine Ausnahme von der Regel, sondern ihre
Grenze** — **und er hat sie gefunden, weil er je Fall gemessen hat.**

### `erfassen.tsx` ist tot

`[cmd]` **477 Zeilen, `export function Erfassen`, kein Aufrufer** —
**selbst nachgemessen: nur `erfassen-modal.tsx` wird importiert, eine
andere Datei.**

`[cmd]` **Zuletzt geaendert am 16.08.**

`[read]` **Nicht umgebaut, weil es nichts aendern wuerde** — **und
ein Waechter faengt es ab, wenn sie je einen Aufrufer bekommt.**

**Ob sie geloescht wird, als G-333.**

### G-305 — einer von sechs galt noch

`[cmd]` **Fuenf waren durch C-372, C-373 und G-319 erledigt.**

`[cmd]` **Der sechste: ein `InEntwicklungKnopf` mit dem Text *,,der
Schreibpfad im Browser ist nicht Teil dieses Auftrags"*.**

`[cmd]` **Gemessen: der Schreibpfad steht** — `planMitWochenAnlegen`
legt Plan, Wochen und Tage an, **`NeuerPlanForm` ruft ihn.**

`[read]` **Die Attrappe log ueber ihren eigenen Zustand.** `[cmd]`
**Ersetzt durch einen Verweis dorthin, wo es geht** — **und damit ist
der letzte `InEntwicklungKnopf` aus dem Planner weg.**

### G-314 — die Vorschau

`[cmd]` **`ladePlan(planId)` nahm seit G-311 einen Bezeichner** —
**nur der Weg dorthin fehlte.**

`[cmd]` **Neu: `GET ?vorschau=<uuid>`, rein lesend.** `[cmd]`
**Belegt: 3 Knoepfe, 7 Tageszeilen fuer *Lean bulk 3100*, URL
unveraendert.**

`[read]` **Und die Begruendung fuer nur eine Woche:** *,,bei 28 Tagen
waere das Fenster eine Tabelle, durch die niemand scrollt. Die Zahl
daneben sagt, was nicht gezeigt wird."*

`[cmd]` **Ein Waechter prueft die Abwesenheit von `router.push` und
`?plan=`** — **G-327 haelt.**

**Abgenommen.**
