---
nr: C-350
typ: entscheidung
modul: nutrition
schwere: hoch
angelegt: 2026-08-30
braucht: []
kind_von: C-342
entscheidung: E-34
agent: codex
beauftragt: 2026-08-30
erledigt: 2026-08-30
commit: OFFEN
beruehrt:
  tabellen: [nutrition.nutrient_reference_values]
zahlen:
  gemessen: 2026-08-30
  live_ul_mg: 350
  vorlage_ul_mg: 250
---

# C-350 — zwei Obergrenzen fuer Magnesium

## Befund

Aus C-342, Codex, 2026-08-30.

    live       350 mg   NAM (National Academy of Medicine)
    Vorlage    250 mg   EFSA

`[read]` **Zwei Institutionen, zwei Werte, beide belegt.** `[cmd]`
**Codex hat den Bestand nicht ueberschrieben und es gemeldet.**

## Warum es zaehlt

`[cmd]` **Beide Werte liegen unter allen sechs Zielwerten** — der
DGE-Zielwert fuer Maenner ist 350 mg, fuer Sportler bis 550.

`[read]` **Und beide gelten nur fuer supplementaeres Magnesium**
(C-344). **Der Unterschied wird also erst sichtbar, wenn jemand
Praeparate erfasst** — dann aber sofort.

## Die Frage

**Welche Institution gilt fuer LumeOS?**

`[read]` **Der Bestand rechnet sonst gegen EFSA** — die
Referenzwerte tragen `EFSA Dietary Reference Values` als Quelle.
`[read]` **Ein einzelner NAM-Wert dazwischen ist eine zweite
Bezugsgroesse im selben Modul**, und das war schon bei NRF9.3 die
Falle (E-25).

`[read]` **Dagegen: der Bestandswert ist da und belegt.** **Ihn zu
aendern heisst, eine Zahl zu bewegen, die jemand einmal
nachgeschlagen hat.**

## Auftrag — drei Dinge, alle in den Daten

**Entschieden in `docs/entscheidungen/E-34`.** **Mitbeauftragt:
C-349, und der Vitamin-A-Nachtrag zu C-342.**

### Vorweg

`[read]` **Dieser Auftrag traegt Zahlen, weil sie gemessen sind** —
alle vom 2026-08-30 auf `dev`, 30 Tage. **Pruef sie nach; wenn deine
abweicht, gilt deine.**

### 1 · Vitamin A: die Sperre faellt

`[cmd]` **Du hast in C-342 gemeldet, der Katalog liefere nur µg RE
ohne Form.** `[cmd]` **Gemessen:**

    RETOL          385,1 ug/Tag      7.092 Lebensmittel
    CARTB       15.144,8             6.325
    CAROTPAXB    1.101,0             5.093

    RE  aus den Formen  3.001,0   gespeichert  3.002,4
    RAE aus den Formen  1.693,0   gespeichert  1.693,4

`[read]` **Abweichung unter einem Promille** — **die Form ist nicht
angegeben, sie ist ableitbar.**

**Tom, 2026-08-30:** *,,wir haben ein gerechnetes total und muessen
die einzelnen durchrechnen dann hast die form. dazu haben wir die
anderen angaben wie alter, sport/athlettyp etc im profil"*.

**Also: die Umrechnung nach IE ueber die Bestandteile.**

    IE = Retinol/0,3 + Beta-Carotin/0,6 + uebrige Carotinoide/1,2

`[read]` **Und C-149 bleibt richtig** — dort ging es darum, keinen
Faktor zu setzen, **wenn die Form unbekannt ist.** **Hier ist sie
bekannt.**

`[read]` **Was zu messen ist, bevor du baust:** `[cmd]` **`CARTB` und
`CAROTPAXB` zeigen im Reiter *0/30 Tage vollstaendig*** — sie tragen
Werte, aber nicht ueberall. **Was passiert an einem Tag, an dem eine
Form fehlt?** **Das ist C-48 Regel 1, angewandt auf eine Formel.**

### 2 · C-350 — EFSA gilt

`[cmd]` **Live 350 mg (NAM), Vorlage 250 mg (EFSA).**

**EFSA gilt. Der NAM-Wert bleibt als zweite Zeile mit eigener
Quelle** — nicht geloescht, sondern eingeordnet.

`[read]` **Die Begruendung steht in E-34.** `[read]` **Miss, ob es
weitere Naehrstoffe mit zwei Quellen gibt** — wenn Magnesium der
einzige ist, ist es ein Einzelfall; wenn nicht, braucht es eine
Regel.

### 3 · C-349 — die Flag-Funktion einspielen

`[cmd]` **`nutrition.reference_assessment_window_flags` liegt in
`supabase/_pipeline/05_user_tabellen/059d_…sql`, 78 Zeilen, nie
eingespielt.**

`[read]` **Der C-195-Fall: die Kette ist gruen, die Aenderung steht
nicht dort, wo man sie sieht.**

`[cmd]` **Claude Code konnte G-273 deshalb nicht bauen** — ein Aufruf
auf eine nicht existierende Funktion bricht die Seite.

`[read]` **Nach dem Einspielen belegen:** dieselben zehn Flags,
dieselben Tageszaehlungen wie `flagVon`. **Die Regeln stimmen laut
Messung ueberein — 80 Prozent, mindestens vier Tage, 0,5 Anteil.**

### Was nicht zu tun ist

**Keinen pauschalen Vitamin-A-Faktor** — die Bestandteile rechnen.
**Den NAM-Wert nicht loeschen.**
`apps/` nicht anfassen.
Nicht committen, nicht stagen, nicht pushen.

### Nachweis

    Vitamin A in IE          rechenbar, an einem Tag belegt
    fehlende Form            was passiert dann? gemessen
    MG-UL                    EFSA gilt, NAM bleibt sichtbar
    weitere Doppelquellen    Zahl
    Flag-Funktion live       vorher / nachher
    Flags gegen flagVon      identisch, belegt
    Reiter-Ladezeit          ms vorher / nachher

### Regeln

`tools/lauf.py`, keine Konsolenfenster.
**Wegwerf-Datenbank, Vollsicherung vor jedem Live-Eingriff.**

**Wenn eine Vorgabe nicht aufgeht: melden, nicht passend machen.**

## Bericht

**C-350, C-349 und der C-342-Nachtrag sind am 30.08. auf `dev` eingespielt.**

### 1. Vitamin A: Bestandteile statt Gesamtfaktor

`[cmd]` Zeitraum `2026-08-01` bis `2026-08-30`, dev-Konto
`10000000-0000-0000-0000-000000000101`:

| Rechnung | Tagesmittel |
|---|---:|
| gespeichertes RE | 3.001,4613 µg |
| RE aus `RETOL + CARTB/6 + CAROTPAXB/12` | 2.999,9912 µg |
| gespeichertes RAE | 1.692,9395 µg |
| RAE aus `RETOL + CARTB/12 + CAROTPAXB/24` | 1.692,5295 µg |

Die Abweichungen liegen bei 0,049 % (RE) bzw. 0,024 % (RAE). Die drei
BLS-Bestandteile sind damit die Formangabe; es gibt keinen Faktor auf
`VITA` selbst. Neu sind drei belegte Faktoren auf die gespeicherten
Komponenten (`RETOL` 1/0,3, `CARTB` 1/0,6, `CAROTPAXB` 1/1,2) und
`nutrition.vitamin_a_iu_daily()`.

`[cmd]` Die C-48-Gegenprobe fiel auf allen 30 Tagen an: `CARTB` und
`CAROTPAXB` haben jeweils Werte, aber an keinem Tag vollständige
Eingaben. Am 01.08. ergeben die vorhandenen Bestandteile rechnerisch
10.717,3350 IE; zwei Bestandteile sind unvollständig. Die Funktion
liefert daher absichtlich `total_iu = NULL`, `status = incomplete`.
Eine Teilsumme wird nicht als Vitamin-A-Ergebnis ausgegeben.

### 2. Magnesium: EFSA primär, NAM erhalten

Die neue EFSA-UL ist `250 mg/day`, Quelle und Geltung
`{supplements, pharmacological}`, mit `source_priority = 100`. Die
NAM-UL `350 mg/day` bleibt mit eigener Quelle und Priorität 0 stehen.
`daily_reference_assessment()` löst bei gleicher Wertart nun zuerst
die höhere Quellenpriorität auf; am 29.08. liest es für Magnesium
250 mg aus EFSA.

`[cmd]` Vor dem Eintrag hatten 16 Nährstoffe mehrere Quellen, aber
keiner zwei Quellen bei derselben Wertart. Magnesium ist der erste
solche Auswahlfall. Deshalb ist die Priorität ein Feld an der
Referenzzeile, keine Namenssonderregel.

**Offene Grenze:** Die Tagesbilanz trennt Nahrung und Präparate noch
nicht. Der heutige MG-Zähler vergleicht daher weiterhin die
Lebensmittelsumme mit einer nur für Supplemente geltenden UL; die
strukturierte Geltung ist vorhanden, kann ohne quellengetrennte Summe
aber noch nicht rechnerisch angewandt werden. Die 88 Tage sind keine
nachgewiesenen Supplementüberschreitungen.

### 3. C-349: Flag-Funktion live

Vorher fehlte `nutrition.reference_assessment_window_flags()` live.
Nach Einspielen liefert sie für dev, 90 Tage bis 29.08., dieselben zehn
Zeilen und Zähler wie die aus `daily_assessments` entfaltete
`flagVon`-Regel: CA 56/90, CLD 15/25 (65 unvollständig), F18:2CN6
84/90, F18:3CN3 55/90, MG 88/88 (2), NA 61/71 (19), NACL 78/90, NIA
51/73 (17), VITD 56/90, WATER 88/88 (2). Der MG-Zähler steigt durch
die beschlossene EFSA-UL von 87 auf 88; die Menge der Flag-Zeilen bleibt
zehn und die Datenbankfunktion entspricht dem bisherigen Zählen.

### Sicherung und Prüfung

Vollsicherung vor dem Live-Eingriff:
`backup/c350/20260830_before_live.dump`, SHA-256
`F5183B46193A45A562B2513CA8B9AB3BC1A51C7A7497AC2B8292A290BF6D2770`.

`[cmd]` Wegwerf-Datenbank: drei neue C-350-Tests sowie die bestehenden
C-342- und C-239/C-348-Vertragsprüfungen grün. `encoding-pruefen` und
Diff-Check grün. Kein Commit, keine Änderung unter `apps/`.

## Abnahme

**2026-08-30, Orchestrator. Nachgemessen.**

`[cmd]` **Live:** `nutrition.vitamin_a_iu_daily`, `source_priority`
in `nutrient_reference_values`, `reference_assessment_window_flags`.
`[cmd]` **Vollsicherung mit Pruefsumme.**

### Vitamin A ist gebaut und liefert trotzdem NULL

`[cmd]` **Am 01.08. ergeben die vorhandenen Werte 10.717,335 IE** —
**aber zwei Komponenten sind unvollstaendig, also gibt die Funktion
`incomplete` zurueck.** `[cmd]` **Ueber alle 30 geprueften Tage war
keine Komponentenbilanz vollstaendig.**

`[read]` **Das ist C-48 Regel 1, angewandt auf eine Formel** — genau
die Vormessung, die der Auftrag verlangt hat, **und die Antwort ist
unbequem.** `[read]` **Eine Zahl, die aus unvollstaendigen
Bestandteilen entsteht, ist keine Zahl.**

### EFSA gilt, NAM bleibt

`[cmd]` **`source_priority` macht die Auswahl deterministisch** —
250 mg (EFSA) vor 350 mg (NAM), **beide Zeilen erhalten.**

`[cmd]` **16 Naehrstoffe haben mehrere Quellen, aber Magnesium ist
der erste Fall mit zwei Quellen derselben Wertart.** `[read]`
**Damit ist die Frage aus dem Auftrag beantwortet: es ist ein
Einzelfall, aber die Mechanik traegt jetzt auch den zweiten.**

### Der Befund, den niemand bestellt hat

`[read]` Codex: *,,Die Tagesbilanz trennt Nahrung und Supplemente
nicht. Die 88 MG-Tage sind daher keine nachgewiesenen
Supplementueberschreitungen."*

`[cmd]` **Nachgemessen, und die Beschreibung ist falsch herum:**
`daily_summary` liest ausschliesslich `nutrition.meal_items`,
`daily_reference_assessment` erwaehnt Supplemente an keiner Stelle.

`[read]` **Nutrition trennt nicht schlecht — es rechnet Nahrung, und
das ist die Modullogik.** `[cmd]` **Die Luecke liegt auf der anderen
Seite: `supplements` fuehrt 744 Einnahmen und keine Tagesfunktion.**

**Tom hat es als E-35 entschieden:** jedes Modul rechnet seine eigene
Bilanz, **summiert wird oben.** **Als C-351 angelegt.**

`[cmd]` 7/7 Wegwerf-Tests gruen, `apps/` unberuehrt.

**Abgenommen.**

