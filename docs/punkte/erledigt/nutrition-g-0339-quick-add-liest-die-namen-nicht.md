---
nr: G-339
typ: befund
modul: nutrition
schwere: mittel
angelegt: 2026-09-02
braucht: []
kind_von: G-232
entscheidung: E-58
agent: claudecode
beauftragt: 2026-09-02
erledigt: 2026-09-02
commit: 0c70caec
beruehrt:
  dateien:
    - apps/web/src/app/v2/nutrition/modale.tsx
zahlen:
  gemessen: 2026-09-02
---

# G-339 — Quick-Add liest die Namen nicht

## Befund

Aus G-294, Claude Code, 2026-09-02.

`[cmd]` **Die Komponente ist gebaut** — **aber sie traegt eine
sechste Namensliste**, mit einem ungueltigen Wert: `preworkout`
statt `pre_workout`.

`[read]` **G-335 hat fuenf Listen auf `KATEGORIE_TEXT`
zusammengefuehrt.** `[read]` **Diese ist durchgerutscht, weil sie
einen anderen Schluessel schreibt.**

`[cmd]` **Und der `meal_type`-CHECK kennt `preworkout` nicht** —
`pre_workout` ja, `preworkout` nein.

## Zu tun

**Anschluss an `KATEGORIE_TEXT`, und der Wert berichtigt.**

`[read]` **Danach gibt es eine Namensquelle, nicht sechs.**

## Auftrag — eine Namensquelle, und zwei Reste

**Mitbeauftragt: G-302, GO-23.** Bericht in diese Datei.

**Beauftragt am 2026-09-02.**

### 1 · G-339 — die sechste Liste

`[cmd]` **Du hast sie selbst gefunden:** `kopfknoepfe.tsx` **traegt
eine eigene Namensliste mit `preworkout` statt `pre_workout`.**

`[cmd]` **Der `meal_type`-CHECK kennt `preworkout` nicht.**

`[read]` **Anschluss an `KATEGORIE_TEXT`, Wert berichtigt** —
**danach gibt es eine Quelle, nicht sechs.**

### 2 · G-302 — die Zielzeile bricht um

`[cmd]` **Seit dem 31.08. offen.** `[read]` **Miss, ob es noch gilt**
— **seit G-326 ist der Rezepteditor umgebaut, seit G-330 die
Kopfzeile.**

### 3 · GO-23 — Dimmung unter 50 Prozent

`[read]` **Lies den Punkt und miss, ob er noch gilt.**

`[cmd]` **Das Theme-Audit steht seit langem offen** — **elf
Modul-Akzenttoken in engem Helligkeitsband.**

### Was nicht zu tun ist

**Keine siebte Namensliste.**
**Kein Schreibweg fuer Quick-Add** — das ist G-340, erst zu
entscheiden.
**Nichts auf `dev@lumeos.app` schreiben.**
Nicht committen, nicht stagen, nicht pushen.

### Der Dev-Server gehoert dir

`[cmd]` **`server.py start` bevorzugen.**

### Nachweis

    Namensquellen   von sechs auf eine, gezaehlt
    preworkout      berichtigt, CHECK-tauglich
    G-302           gilt noch / behoben
    GO-23           gilt noch / ueberholt
    Bildschirmfoto  vorher / nachher

## Bericht

**Claude Code, 2026-09-02.** Gemessen auf `dev@lumeos.app`.
Dev-Server auf 3200 **nicht neu gestartet** — er lief gesund, eine
Instanz. **Nichts auf `dev` geschrieben.**

---

### Vorab: die Datei im Auftrag stimmt nicht

`[cmd]` **Auftrag und Punktdatei nennen `kopfknoepfe.tsx`.** `[cmd]`
**Dort steht keine Namensliste** — die Datei traegt Knoepfe und
kein `meal_type`.

`[cmd]` **Die Liste steht in `modale.tsx:31`**, wo ich sie in G-294
gemessen hatte. `[read]` **`kopfknoepfe.tsx` oeffnet das Modal**
(`setModal('quickadd')`), **`modale.tsx` rendert es und haelt die
Liste.** **Die Datei des Knopfes wurde mit der Datei der Liste
verwechselt.**

`[read]` **Gebaut habe ich an `modale.tsx`** — die Sache war
eindeutig, nur der Dateiname falsch.

---

## 1 · G-339 — die sechste Liste ist weg

### Was dastand

`[cmd]` **`modale.tsx:31`, vor dem Bau:**

    const MEAL_TYPES = [
      { id: 'breakfast',  label: 'Breakfast',   time: '07:00' },
      { id: 'lunch',      label: 'Lunch',       time: '13:00' },
      { id: 'dinner',     label: 'Dinner',      time: '20:00' },
      { id: 'snack',      label: 'Snack',       time: '16:00' },
      { id: 'preworkout', label: 'Pre-workout', time: '16:30' },
    ]

`[cmd]` **Zwei Verbraucher:** die Mahlzeitenauswahl im Quick-add
und der `meal_schedule`-Block in *Nutrition settings* — vor dem
Bau Zeile 363 und 412, nach dem Bau 398 und 441.

### Der Befund war schlimmer als gemeldet

`[cmd]` **Am Schirm gemessen, vor dem Bau** — die Werte der
`<option>`:

    Label:  Breakfast | Lunch | Dinner | Snack | Pre-workout
    value:  Breakfast | Lunch | Dinner | Snack | Pre-workout

`[read]` **Die `<option>` trug gar kein `value`.** `[cmd]` **Dann
schickt der Browser den TEXT** — also `Pre-workout`, **nicht einmal
das gemeldete `preworkout`.**

`[read]` **Beide Werte sind gegen den CHECK ungueltig** — er kennt
`pre_workout`. **Der gemeldete Fehler war der kleinere von zweien.**

### Was jetzt dasteht

`[cmd]` **Der Name kommt aus `KATEGORIE_TEXT`:**

    const MEAL_TYPES = Object.entries(KATEGORIE_TEXT)
      .map(([id, label]) => ({ id, label }))

`[cmd]` **Am Schirm gemessen, nachher:**

    Label:  Frühstück | Mittagessen | Abendessen | Snack |
            Vor dem Training | Nach dem Training | Sonstiges
    value:  breakfast | lunch | dinner | snack |
            pre_workout | post_workout | other

`[read]` **Sieben statt fuenf** — `post_workout` und `other` fehlten
in der alten Liste, **obwohl beide im CHECK stehen.**

`[cmd]` **Jeder angebotene Wert ist jetzt CHECK-tauglich**, und ein
Waechter prueft genau das (Deckungsgleichheit mit den sieben
CHECK-Werten, nicht nur *,,kein preworkout"*).

### Zeiten und Namen sind getrennt

`[read]` **Die alte Liste vermischte zwei Dinge:** wie eine Kategorie
HEISST und wann sie ueblicherweise liegt.

`[cmd]` **`KATEGORIE_TEXT` kennt keine Zeiten** — also blieb eine
`VORGABE_ZEIT`-Tabelle noetig fuer den `meal_schedule`-Block.

`[read]` **Das ist KEINE siebte Namensliste:** sie traegt nur
`'07:00'`-Werte, keinen Text. **Ein Waechter sichert es** — steht
dort je eine Beschriftung, faellt er.

### Und der zweite Verbraucher ist unerreichbar

`[cmd]` **Gemessen: `'nutsettings'` wird nirgends gesetzt.** Der Typ
steht in Zeile 30, der Verteiler in Zeile 572 (nach dem Bau) — **aber kein Knopf
oeffnet es.**

`[cmd]` **`kopfknoepfe.tsx` setzt genau ZWEI:** `quickadd` und
`mealcam`. **`nutsettings`, `customfood` und `recipe` setzt dort
niemand.**

`[read]` **Der `meal_schedule`-Block ist damit toter Code.** **Ich
habe ihn nicht geloescht** — die Liste darin ist berichtigt, das
Loeschen ist eine eigene Entscheidung (A-59 gilt fuer Reste, die man
ersetzt, nicht fuer fremde Flaechen). **Als Befund gemeldet.**

`[read]` **Nebenbei erklaert es, warum die Liste so lange lebte:**
**die Haelfte ihrer Verwendung war nie sichtbar.**

### Namensquellen: von sechs auf eine, gezaehlt

`[cmd]` **Der Waechter aus G-335 zaehlt sie** — und **er hat diese
sechste nicht gesehen.** `[cmd]` **Warum, gemessen:**

    er verlangte   `breakfast:` UND `pre_workout:` als SCHLUESSEL
    hier stand     `{ id: 'breakfast' }` als WERT, und
                   `preworkout` ohne Unterstrich

`[read]` **Beide Bedingungen verfehlten sie.** **Ein Waechter, der
nur eine Schreibform kennt, findet die naechste Kopie nicht.**

`[cmd]` **Erweitert:** eine Datei gilt als Namensliste, wenn **drei
oder mehr** Kategoriecodes darin neben Text stehen — **als
Schluessel ODER als Wert**, und `preworkout`/`postworkout` zaehlen
mit. **Uhrzeiten sind ausgenommen**, sonst faende er `VORGABE_ZEIT`.

`[cmd]` **Nach dem Bau: genau EINE Datei** — `slots-lage.ts`.

---

## 2 · GO-23 — gilt noch, ist nicht gebaut

### Der Punkt ist entschieden, nicht offen

`[cmd]` **Tom, 2026-08-20: *,,ok"*.** `[read]` **Die Sachfrage ist
also nicht vorzulegen** — was fehlt, ist die Ausfuehrung.

### Gemessen: nicht umgesetzt

`[cmd]` **Am Schirm, `?tab=nutrients`, 1500×1000:**

    "aus X von Y"-Angabe        0 Treffer
    Wort "unvollstaendig"       nicht vorhanden
    verschiedene Deckkraefte    2 — beide `opacity: 1`

`[read]` **Die zwei Farben sind Akzent und Gedaempft**, die normale
Unterscheidung. **Keine Dimmung nach Deckungsgrad.**

`[cmd]` **Und im Quelltext:** keine 50-Prozent-Schwelle in
`naehrstoff-anzeige.ts` oder den Nutrient-Reitern.

### Die Zahlen des Punktes stimmen heute nicht mehr

`[cmd]` **Der Punkt nennt:** 59 Codes zu 100 %, 20 bei 80–99 %, 50
bei 50–79 %, 9 unter 50 %.

`[cmd]` **Heute gemessen, drei Abgrenzungen probiert:**

    Abgrenzung                     100%  80-99  50-79  <50  Codes
    nur `measured` zaehlt             4     96     31    7    138
    alles ausser `missing`            5    103     23    7    138
    Zeile vorhanden, Status egal    138      0      0    0    138

`[read]` **Keine reproduziert 59/20/50/9.** `[read]` **Die
Abgrenzung des Punktes ist nicht dokumentiert**, und ohne sie ist die
Zahl nicht nachpruefbar (CLAUDE.md: wer eine Zahl nennt, nennt die
Abfrage).

`[read]` **Was traegt, ist die Struktur:** `[cmd]` **7 Codes liegen
unter 50 % Deckung** — **die Gruppe, um die es geht, existiert.**

### Die Antwort

**GO-23 gilt** — entschieden, nicht gebaut, und die Datenlage
rechtfertigt ihn weiterhin. `[read]` **Nur die vier Zahlen im Punkt
gehoeren berichtigt**, mit der Abfrage dazu.

`[read]` **Nicht gebaut, weil er nicht beauftragt war** — der
Auftrag sagt *,,lies den Punkt und miss, ob er noch gilt"*.

---

## 3 · G-302 — es gibt keine Punktdatei

`[cmd]` **Die Punktdatei nennt G-302 als mitbeauftragt** (Zeile 44
und Abschnitt 2). `[cmd]` **Der Auftrag im Chat nennt ihn nicht.**

`[cmd]` **Gesucht in `docs/punkte/` — laufend, todos, erledigt:
keine Datei mit `0302`.**

`[read]` **Ich habe ihn deshalb nicht bearbeitet.** **Was in der
Datei ueber ihn steht** (*,,die Zielzeile bricht um, seit dem 31.08.
offen"*), **reicht nicht als Auftrag** — und aus dem Gedaechtnis zu
rekonstruieren, was ein Punkt verlangt, ist genau der Fehler, den
CLAUDE.md beschreibt.

**Zu klaeren: gibt es G-302, und unter welchem Namen?**

---

## Waechter

`[cmd]` **Vier neu in
`__tests__/mahlzeit-name-eine-quelle.test.ts`:**

    die Quick-Add-Auswahl kommt aus KATEGORIE_TEXT
    preworkout ist weg — jeder Wert deckt sich mit dem CHECK
    die option traegt ein value — sonst faehrt der Label los
    Namen und Zeiten sind getrennt

`[cmd]` **Und einer erweitert:** der Zaehler aus G-335 erkennt jetzt
auch Listen, die den Code als WERT schreiben.

`[read]` **Das ist der eigentliche Gewinn:** **die naechste Kopie
faellt auf, auch wenn sie wieder anders geschrieben ist.**

## Sabotageprobe: 6 Eingriffe, 6 Faelle

`[cmd]` **Je Zusage ein Eingriff, der nur sie verletzt.** Nach dem
Rueckbau war keiner rot.

    faellt   die sechste Namensliste kommt zurueck (alte Form)
    faellt   preworkout schleicht sich wieder ein
    faellt   die option verliert ihr value
    faellt   die Auswahl kommt nicht mehr aus KATEGORIE_TEXT
    faellt   die Zeittabelle traegt wieder Text
    faellt   eine der sieben Kategorien faellt weg

`[read]` **Der erste ist der wichtigste:** **er stellt genau die
Liste wieder her, die G-335 uebersehen hat** — **und jetzt faellt
der Waechter.**

## Bildschirmfotos

    backup/g339-vorher-quickadd.png    Breakfast … Pre-workout
    backup/g339-nachher-quickadd.png   Frühstück … Sonstiges
    backup/go23-nutrients.png          keine Dimmung, keine Deckung

## Laeufe

    pnpm --filter @lumeos/web test      1371 gruen, 0 rot  (+4)
    npx tsc --noEmit                    keine Ausgabe
    pnpm --filter @lumeos/web lint      keine Warnung

`[cmd]` **`pnpm gate` nicht gelaufen** — er faellt an fremden
ungetrackten Migrationen (C-327a, C-385, Codex) mit INSERT/DELETE.
**Nicht diese Arbeit.**

## Neue Befunde, die als Punkt gehoeren

    1  `nutsettings` hat keinen Aufrufer — der `meal_schedule`-Block
       in `modale.tsx` ist unerreichbar. Loeschen oder anschliessen.

    2  GO-23: die vier Zahlen im Punkt (59/20/50/9) sind mit keiner
       von drei Abgrenzungen reproduzierbar. Heute: 7 Codes unter
       50 %. Der Punkt bleibt gueltig, die Zahlen gehoeren berichtigt.

    3  G-302 hat keine Punktdatei.

## Nicht getan

    kein Schreibweg fuer Quick-Add — das ist G-340
    keine siebte Namensliste
    GO-23 nicht gebaut — nur gemessen, wie beauftragt
    nichts auf dev geschrieben
    nicht committet, nicht gestaged, nicht gepusht
    Dev-Server nicht neu gestartet

## Abnahme

**2026-09-02, Orchestrator.**

### Meine Fundstelle war wieder falsch

`[read]` **Mein Auftrag nannte `kopfknoepfe.tsx`.** `[cmd]` **Es war
`modale.tsx`.**

`[read]` **Zum dritten Mal an einem Tag habe ich eine Datei
genannt, ohne sie zu oeffnen** — nach `mikro-lage.ts` (G-136) und
`RecipeDetail` (G-311).

### Und die Liste war schlimmer als gemeldet

`[cmd]` **Die `<option>` trug gar kein `value`** — **sie haette den
Label statt `preworkout` abgeschickt.**

`[read]` **Der Punkt sagte *ungueltiger Wert*.** `[read]` **Es war
kein Wert.** `[cmd]` **Der `meal_type`-CHECK haette *Vor dem
Training* bekommen.**

### Der Zaehlwaechter hatte sie uebersehen

`[cmd]` **G-335 fuehrte einen Waechter fuer die Namensquellen ein**
— **und `modale.tsx` fiel durch.**

`[cmd]` **Er ist erweitert, 6 von 6 Sabotagen bestanden.**

`[read]` **Ein Waechter, der eine Quelle uebersieht, zaehlt falsch
und meldet gruen** — **dieselbe Klasse wie das Wort statt der
Wirkung.**

### GO-23 gilt, mit anderen Zahlen

`[cmd]` **Die vier Zahlen 59/20/50/9 sind mit keiner von drei
Abgrenzungen reproduzierbar.**

`[cmd]` **Heute: 7 Codes unter 50 Prozent.**

`[read]` **Der Punkt gilt, die Zahlen sind alt** — **im Punkt
berichtigt.**

**Abgenommen.**

