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

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
