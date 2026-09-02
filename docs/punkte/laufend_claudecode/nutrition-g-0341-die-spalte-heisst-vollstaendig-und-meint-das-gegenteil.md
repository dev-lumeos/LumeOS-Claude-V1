---
nr: G-341
typ: befund
modul: nutrition
schwere: mittel
angelegt: 2026-09-02
braucht: []
kind_von: C-399
entscheidung: null
agent: claudecode
beauftragt: 2026-09-02
beruehrt:
  dateien:
    - apps/web/src/app/v2/nutrition/naehrstoff-ordnung-tab.tsx
zahlen:
  gemessen: 2026-09-02
---

# G-341 — die Spalte heisst *vollständig* und meint das Gegenteil

## Befund

`[cmd]` **Im Nutrients-Reiter steht je Zeile:**

    VITA        60/60 Tg. vollst.
    CARTB       18/60 Tg. vollst.
    CAROTPAXB    0/60 Tg. vollst.

`[read]` **Bei `60/60` liest es sich richtig.** `[read]` **Bei
`0/60 vollst.` liest es sich wie ein Fehler** — **die Zahl sagt
*null*, das Wort sagt *vollstaendig*.**

## Und der Schnitt sagt nicht, worauf er beruht

`[cmd]` **`SCHNITT/TAG` steht kommentarlos daneben.**

`[read]` **Wenn er aus unvollstaendigen Tagen stammt, gehoert es
dazu** — **oder er wird gar nicht gezeigt** (C-399).

## Zu tun

`[read]` **Erst C-399 messen** — **wenn der Schnitt keine Grundlage
hat, ist die Beschriftung das kleinere Problem.**

`[read]` **Danach: die Spalte sagt, was sie zaehlt.**

## Gemessen am 2026-09-02: 47 Codes betroffen

`[cmd]` **Von 138 Codes zeigt keiner einen Schnitt bei
`value_count = 0`** — **die Rechnung ist richtig.**

`[cmd]` **Aber 47 zeigen einen begruendeten Teilschnitt bei null
vollstaendigen Tagen.**

`[read]` **47 mal dieselbe missverstaendliche Beschriftung** — **Tom
hat drei davon gesehen und alles hinterfragt.**

`[read]` **C-399 ist widerlegt: die Zahlen stimmen.** **Was fehlt,
ist die Spalte, die sagt, was sie zaehlt.**

## Auftrag — die Spalte sagt, was sie zaehlt

**Mitbeauftragt: G-340, G-333.** Bericht in diese Datei.

**Beauftragt am 2026-09-02.**

### 1 · G-341 — 47 Codes, eine Beschriftung

`[cmd]` **Codex hat gemessen: von 138 Codes zeigt KEINER einen
Schnitt bei `value_count = 0`** — **die Rechnung ist richtig.**

`[cmd]` **Aber 47 zeigen einen begruendeten Teilschnitt bei null
vollstaendigen Tagen.**

`[cmd]` **`0/60 Tg. vollst.` heisst: kein Tag ist vollstaendig** —
**nicht: kein Tag hat einen Wert.**

`[read]` **Tom hat drei davon gesehen und alles hinterfragt** —
*,,der naechste schwachsinn der mich alles hinterfragen laesst was
ich hier an daten sehe."*

`[read]` **Die Zahlen stimmen. Die Beschriftung sagt nicht, was sie
zaehlt.**

`[cmd]` **Bei `CAROTPAXB`: 539 Postenwerte an allen 60 Tagen, 241
Posten fehlen** — **1.088,6 ug ist der Schnitt aus den vorhandenen.**

`[read]` **Sag es so, dass es niemand mehr fuer einen Fehler
haelt.**

### 2 · G-340 — Quick-Add ohne Schreibweg

`[cmd]` **Die Komponente ist gebaut, der Schreibweg fehlt.**

`[read]` **Zu klaeren, bevor du baust:** **ist Quick-Add ueberfluessig
geworden?** `[cmd]` **Seit G-320 gibt es `FoodSuchModal`, seit G-336
das Mahlzeiten-Modal.**

`[read]` **Oder ist es der Weg fuer den Fall ohne Suche: eine Zahl,
kein Lebensmittel.** **Miss und sag es.**

### 3 · G-333 — `erfassen.tsx`, 477 Zeilen ohne Aufrufer

`[cmd]` **Zuletzt geaendert am 16.08., kein Aufrufer.** `[cmd]`
**Ihr fehlen alle acht Suchlehren.**

`[read]` **A-59 sagt: geloescht, nicht auskommentiert.** `[read]`
**Aber 477 Zeilen wegzuwerfen ist eine Entscheidung** — **sag, was
darin steht, das anderswo fehlt.**

### Und drei Berichtigungen aus deinem letzten Lauf

`[cmd]` **G-339 nennt `kopfknoepfe.tsx`, es war `modale.tsx`** —
**berichtigt.**

`[cmd]` **`nutsettings` hat keinen Aufrufer, der
`meal_schedule`-Block ist toter Code** — **als G-342.**

`[cmd]` **GO-23s vier Zahlen sind nicht reproduzierbar, heute sind
es 7 Codes unter 50 Prozent** — **im Punkt berichtigt.**

### Was nicht zu tun ist

**Keine Zahl aendern** — die Rechnung stimmt.
**Nichts auf `dev@lumeos.app` schreiben.**
Nicht committen, nicht stagen, nicht pushen.

### Der Dev-Server gehoert dir

`[cmd]` **`server.py start` bevorzugen.**

### Nachweis

    47 Codes        Beschriftung sagt, was sie zaehlt
    CAROTPAXB       am Schirm verstaendlich, ohne Zahlaenderung
    Quick-Add       ueberfluessig oder eigener Weg, begruendet
    erfassen.tsx    was darin steht, das anderswo fehlt
    Bildschirmfoto  vorher / nachher

## Bericht

**Claude Code, 2026-09-02.** Gemessen auf `dev@lumeos.app`, 60-Tage-
Fenster. Dev-Server auf 3200 **nicht neu gestartet** — er lief gesund.
**Nichts auf `dev` geschrieben, keine Zahl geaendert.**

---

## 1 · G-341 — die Spalte sagt jetzt, was sie zaehlt

### Codex' Zahlen unabhaengig nachgemessen

`[cmd]` **`nutrient_summary_window(dev, '2026-09-02', 60)`:**

    138   Codes gesamt
      0   mit Schnitt bei `value_count = 0`   -> die Rechnung stimmt
     47   mit Teilschnitt bei null vollstaendigen Tagen

`[read]` **Deckungsgleich mit Codex.** **C-399 ist damit widerlegt —
und zwar zweimal unabhaengig gemessen.**

### Was am Schirm stand, vor dem Bau

`[cmd]` **Ausgelesen, `?tab=nutrients&fenster=60`:**

    CAROTPAXB    1.088,6 µg    0/60 Tg. vollst.
    CARTB       15.329,3 µg   18/60 Tg. vollst.
    VITA         3.038,5 µg   60/60 Tg. vollst.

`[cmd]` **18 solche Zeilen standen gleichzeitig auf dem Schirm.**

`[read]` **Die Zahl sagte *null*, das Wort sagte *vollstaendig* —
und dazwischen stand ein Wert.** **Das liest sich wie ein Fehler, und
Tom hat genau so reagiert.**

### Warum es keiner ist — gemessen

`[cmd]` **`CAROTPAXB` ueber 60 Tage:**

    Tage protokolliert          60
    Tage MIT WERT               60      <- hierauf beruht der Schnitt
    Tage ohne jede Luecke        0      <- das zeigte die Spalte
    Posten gesamt              780
    davon mit Wert             539
    davon fehlend              241

`[read]` **`complete_day_count` zaehlt Tage OHNE JEDE Luecke.**
**Fehlt an jedem einzelnen Tag ein Posten, ist sie null** — **auch
wenn alle 60 Tage einen Wert tragen.**

`[cmd]` **Und das gilt fuer fast alle 47:** **46 von ihnen haben an
JEDEM protokollierten Tag einen Wert**, der niedrigste liegt bei 29
von 60. **Keiner hat null Tage mit Wert.**

### Die Loesung: eine Zahl, die es schon gab

`[cmd]` **`nutrient_summary_window` liefert `days_with_value`** —
**und die Anzeige las sie nicht.** Sie kannte nur
`logged_day_count` und `complete_day_count`.

`[read]` **Genau diese Zahl fehlte.** **Sie ist die Grundlage des
Schnitts, und sie stand die ganze Zeit bereit.**

`[cmd]` **Durchgereicht ueber die ganze Kette** — Rohtyp, Zuweisung,
Knoten. **Ein Waechter prueft alle drei Glieder**, denn fehlt eines,
stuende dort still eine Null.

### Am Schirm, nachher

    CAROTPAXB    1.088,6 µg   60/60 Tg. mit Wert
                               241 Pos. ohne Wert
    CARTB       15.329,3 µg   60/60 Tg. mit Wert
                                59 Pos. ohne Wert
    VITA         3.038,5 µg   60/60 Tg. mit Wert

`[cmd]` **Zeilen mit `0/60 vollst.`: vorher 18, nachher 0.**

`[read]` **Die Werte links sind Zeichen fuer Zeichen dieselben** —
1.088,6 µg, 15.329,3 µg, 3.038,5 µg. **Geaendert hat sich nur,
welche Zahl rechts danebensteht.**

`[read]` **Der Luecken-Hinweis erscheint nur, wenn es eine Luecke
gibt** — bei `VITA` waere er Rauschen. **Ein Waechter sichert genau
das** (er faellt auch, wenn der Hinweis IMMER erscheint).

`[cmd]` **Und wer genauer hinsieht, bekommt den ganzen Satz** — im
Tooltip: *,,539 von 780 Posten haben einen Wert, 241 fehlen. Der
Schnitt beruht auf 60 Tagen; 0 davon sind lückenlos."*

`[read]` **Damit ist die Frage beantwortet, bevor sie entsteht.**

### Keine Zahl geaendert — und ein Waechter darauf

**Der Auftrag:** *,,Keine Zahl aendern — die Rechnung stimmt."*

`[cmd]` **Ein Waechter prueft die Abwesenheit von Arithmetik** in der
Spalte — `Math.round`, `Math.floor`, `toFixed`. `[read]` **Die
Sabotage, die ein `Math.round` einschmuggelt, laesst ihn fallen.**

---

## 2 · G-340 — Quick-Add ist NICHT ueberfluessig

**Die Frage:** *,,ist Quick-Add ueberfluessig geworden? Oder ist es
der Weg fuer den Fall ohne Suche: eine Zahl, kein Lebensmittel."*

### Die Antwort steht im Schema, und sie ist eindeutig

`[cmd]` **`meal_items` traegt einen CHECK, der genau drei Faelle
erlaubt:**

    food_source = 'bls'     food_id NOT NULL, custom_food_id NULL
    food_source = 'custom'  food_id NULL,     custom_food_id NOT NULL
    food_source = 'manual'  food_id NULL,     custom_food_id NULL

`[read]` **Der dritte Fall IST Quick-Add** — eine Zeile mit Makros
und ohne Lebensmittel. **Die Datenbank ist dafuer gebaut.**

`[cmd]` **`meal_items` fuehrt die Makros als eigene Spalten:**
`enercc`, `prot625`, `fat`, `cho`, `fibt`, `sugar` — **plus
`food_name` als NOT NULL.** **Eine Quick-Add-Zeile ist vollstaendig
speicherbar.**

### Und heute nutzt ihn niemand

`[cmd]` **Gemessen: 9.051 Posten, alle `food_source = 'bls'`, null
mit `food_id IS NULL`.**

`[cmd]` **Jeder Schreibweg setzt `'bls'` fest:**

    diary-model.ts:206      food_source: 'bls' as const
    rezept-write.ts:99      food_source: 'bls'
    plan-log-write.ts:187   p_food_source: 'bls'

`[cmd]` **Und `mealItemCreateSchema` verlangt eine `food_id` als
UUID** (Zeile 89). `[read]` **Der bestehende Weg kann eine
Quick-Add-Zeile strukturell nicht schreiben** — nicht aus
Nachlaessigkeit, sondern per Vertrag.

`[cmd]` **`FOOD_SOURCES` deklariert `['bls', 'manual']`** — **die
Absicht steht im Code, die Ausfuehrung fehlt.**

### Warum die beiden Alternativen ihn nicht ersetzen

    FoodSuchModal (G-320)    sucht im Katalog -> braucht food_id
    Mahlzeiten-Modal (G-336) legt die MAHLZEIT an, nicht ihre Posten

`[read]` **Beide setzen einen Katalogeintrag voraus.** **Wer eine
selbst gekochte Portion mit bekannten Makros erfasst, hat keinen** —
**und der Dialog sagt es selbst:** *,,No food lookup · for meal prep
in bulk"*.

### Die Antwort

**Quick-Add ist der Weg fuer den Fall ohne Suche** — **eine Zahl,
kein Lebensmittel.** `[read]` **Er ist nicht ueberfluessig, sondern
der einzige Zugang zu einem Pfad, den das Schema ausdruecklich
vorsieht und den heute nichts bedient.**

`[read]` **Nicht gebaut** — der Auftrag sagt *,,zu klaeren BEVOR du
baust"*. **Die Klaerung ist: bauen.** **Die Entscheidung liegt beim
Orchestrator.**

---

## 3 · G-333 — `erfassen.tsx`: nichts fehlt anderswo

**Der Auftrag:** *,,477 Zeilen wegzuwerfen ist eine Entscheidung —
sag, was darin steht, das anderswo fehlt."*

### Was drinsteht, Stueck fuer Stueck geprueft

    Bestandteil            anderswo?
    ---------------------  ----------------------------------------
    TYP_LABEL              ja — KATEGORIE_TEXT (G-335/G-339)
    Mahlzeit anlegen       ja — FreieMahlzeit-Modal (G-336),
                                mit Zeit, Slots und Freitext
    Position hinzufuegen   ja — FoodSuchModal (G-320)
    Menge aendern          ja — mahlzeiten.tsx:1063, PATCH
    Position entfernen     ja — mahlzeiten.tsx:1081, DELETE
    Suchfeld               ja — useFoodSuche, und deutlich besser
    search_events          ja — food-search.ts:864, gemeinsamer Weg

`[read]` **Kein Bestandteil ist einzigartig.**

### Die Suche ist der klarste Fall

`[cmd]` **`erfassen.tsx` ruft roh:**
`/api/nutrition/foods?q=...&limit=12` — **kein Entprellen, keine
Mindestlaenge, keine Sortierung, keine Filter, keine Portionen.**

`[read]` **Das bestaetigt *,,ihr fehlen alle acht Suchlehren"*
gegenstaendlich**, nicht nur als Behauptung.

### Und ihr einziges Alleinstellungsmerkmal ist heute FALSCH

`[cmd]` **`NeueMahlzeit` sperrt Mahlzeitentypen, die es am Tag schon
gibt** — mit dem Kommentar: *,,052 hat ein UNIQUE auf (user_id,
entry_date, meal_type)."*

`[cmd]` **Gemessen: dieses UNIQUE gibt es nicht mehr.**
`pg_constraint` fuehrt auf `nutrition.meals` nur `meals_pkey` und
drei CHECKs; **kein eindeutiger Index ausser dem Primaerschluessel.**

`[cmd]` **Und die Daten belegen es:** `dev@lumeos.app` hat an
mehreren Tagen **zwei `lunch`-Eintraege** (28.08., 29.08., 30.08.,
31.08.) und zwei `snack` am 01.06.

`[read]` **Die Sperre wuerde heute eine erlaubte Handlung
verhindern.** **Das ist kein Wissen, das verloren geht — es ist
eine Falschaussage, die verschwindet.**

### Die Antwort

**Nichts darin fehlt anderswo.** `[read]` **Ich habe sie NICHT
geloescht** — der Auftrag sagt *,,sag, was darin steht"*, nicht
*,,loesche"*, und 477 Zeilen zu entfernen ist laut Auftragstext
selbst eine Entscheidung.

`[read]` **Meine Empfehlung: loeschen.** **A-59 traegt** — und der
UNIQUE-Kommentar zeigt, was eine tote Datei anrichtet: **sie
konserviert eine Regel, die nicht mehr gilt, und wer sie liest,
glaubt ihr.**

`[cmd]` **`suchen-und-vorschau.test.ts` haelt fest, dass sie tot
ist** — der Waechter faellt, sobald jemand sie anschliesst.

---

## Waechter

`[cmd]` **Neu:
`__tests__/erfasst-spalte-sagt-was-sie-zaehlt.test.ts`, 6 Waechter:**

    die Dateiproben finden ihre Dateien
    die Spalte zeigt Tage MIT WERT, nicht vollstaendige
    die Luecke steht daneben, aber nur wenn es eine gibt
    der Tooltip nennt beide Zahlen und ihre Bedeutung
    tageMitWert wird gelesen, nicht erfunden (Kette dreifach)
    keine Zahl ist umgerechnet worden

## Sabotageprobe: 8 Eingriffe, 8 Faelle

`[cmd]` **Je Zusage ein Eingriff, der nur sie verletzt.** Nach dem
Rueckbau war keiner rot.

    faellt   die alte Beschriftung kommt zurueck
    faellt   der Zaehler kippt auf vollstaendig (Wort bleibt richtig)
    faellt   der Luecken-Hinweis faellt weg
    faellt   der Hinweis erscheint auch ohne Luecke
    faellt   der Tooltip nennt die Grundlage nicht mehr
    faellt   der Knoten bekommt tageMitWert nicht
    faellt   days_with_value wird nicht aus der Zeile gelesen
    faellt   eine Rechnung schleicht sich ein

`[read]` **Der zweite ist der schaerfste:** **er laesst das Wort
*mit Wert* stehen und tauscht nur den Zaehler.** **Ein Waechter, der
das Wort prueft, waere gruen geblieben** — dieser prueft die
Variable.

## Bildschirmfotos

    backup/g341-vorher-nutrients.png    18 Zeilen "0/60 Tg. vollst."
    backup/g341-nachher-nutrients.png   "60/60 Tg. mit Wert"

## Laeufe

    pnpm --filter @lumeos/web test      1377 gruen, 0 rot  (+6)
    npx tsc --noEmit                    keine Ausgabe
    pnpm --filter @lumeos/web lint      keine Warnung

`[cmd]` **`pnpm gate` nicht gelaufen** — er faellt an fremden
ungetrackten Migrationen (C-327a, C-385, Codex) mit INSERT/DELETE.
**Nicht diese Arbeit.**

## Neue Befunde, die als Punkt gehoeren

    1  Quick-Add ist der einzige Zugang zu `food_source = 'manual'`.
       Das Schema sieht ihn vor, `FOOD_SOURCES` deklariert ihn,
       kein Weg bedient ihn. Bauen oder begruenden, warum nicht.

    2  `erfassen.tsx` konserviert ein UNIQUE auf
       (user_id, entry_date, meal_type), das es nicht mehr gibt.
       Die Sperre wuerde heute Erlaubtes verhindern.

## Nicht getan

    keine Zahl geaendert — und ein Waechter darauf
    erfassen.tsx nicht geloescht — Empfehlung gegeben
    Quick-Add nicht gebaut — die Klaerung war der Auftrag
    nichts auf dev geschrieben (730 Mahlzeiten, 2.300 Posten
      unveraendert)
    nicht committet, nicht gestaged, nicht gepusht
    Dev-Server nicht neu gestartet

## Abnahme

_(vom Orchestrator)_
