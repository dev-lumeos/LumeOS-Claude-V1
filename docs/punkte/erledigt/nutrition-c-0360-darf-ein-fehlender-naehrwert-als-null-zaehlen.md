---
nr: C-360
typ: entscheidung
modul: nutrition
schwere: hoch
angelegt: 2026-08-30
braucht: []
kind_von: C-49
entscheidung: E-38
erledigt: 2026-09-02
commit: OFFEN
beruehrt:
  tabellen: [nutrition.food_nutrients]
zahlen:
  gemessen: 2026-08-30
  vitc_vollstaendige_tage: 0
  vitc_fehlende_posten: 98
  foods_ohne_vitc: 420
  foods_gesamt: 7140
---

# C-360 — darf ein fehlender Naehrwert als 0 zaehlen?

## Der Befund

Aus C-49, Claude Code, 2026-08-30.

`[cmd]` **`VITC` ist an 0 von 30 Tagen vollstaendig, 98 fehlende
Posten.** `[cmd]` **Vitamin A ebenso, weil Beta-Carotin jeden Tag
bricht.**

`[cmd]` **Am 2026-08-29 fehlte `VITC` bei Ei, Kabeljau, weissem Reis
und Ziegenfleisch** — **alle enthalten tatsaechlich keins.**

`[read]` **Ein einziges Stueck Fleisch macht den Vitamin-C-Tag
unvollstaendig** — **nicht weil ein Wert fehlt, sondern weil eine Null
nicht erfasst wird.**

## Die Frage

**Darf ein fehlender Naehrwert als 0 zaehlen, wenn das Lebensmittel
ihn nicht enthaelt?**

## Was dagegen spricht

`[cmd]` **Die BLS-Dokumentation, Kapitel 4.3, sagt woertlich:** *,,Ein
fehlender Wert ist nicht gleichbedeutend mit Null und sollte nicht als
Null interpretiert werden."*

`[read]` **Und C-48 Regel 1 sagt dasselbe:** kein Fehlzaehler wird zur
Null.

## Was dafuer spricht — und wo die Antwort liegt

`[cmd]` **Der BLS fuehrt *Logische Null* als eigene Datenherkunft:
18.566 Werte.** `[cmd]` **Er unterscheidet also selbst zwischen
*nicht gemessen* und *enthaelt keins*.**

`[cmd]` **Der Import hat die Unterscheidung verworfen** — **das ist
C-345**, und dort liegen auch die 1.800 Spurenwerte.

`[read]` **Damit ist die Frage vielleicht keine Entscheidung, sondern
eine Wiederherstellung:** **wenn die Herkunft mitkaeme, waere
*logische Null* eine Null und *fehlend* weiter fehlend.**

`[read]` **Was zu messen ist, bevor Tom entscheidet:** `[cmd]` **wie
viele der 98 fehlenden Posten in der Quelle eine *Logische Null*
tragen** — **und wie viele wirklich leer sind.**

## Abnahme

**2026-09-02, durch E-38 beantwortet.**

`[cmd]` **E-38, 31.08.:** zensierte Messwerte (`<LOD`/`<LOQ`) zaehlen
als 0 nach dem Lower Bound, **echte Luecken bleiben unvollstaendig.**

`[cmd]` **Und Tom hat es am 01.09. bestaetigt:** *,,wenn die daten
nicht da sind erfinden wir sie nicht."*

`[read]` **Damit ist die Frage in beide Richtungen beantwortet:** ein
gemessener Wert unter der Grenze ist eine Null, **ein fehlender ist
eine Luecke.**

`[cmd]` **C-378 hat denselben Weg genommen und ist geschlossen.**

**Geschlossen.**
