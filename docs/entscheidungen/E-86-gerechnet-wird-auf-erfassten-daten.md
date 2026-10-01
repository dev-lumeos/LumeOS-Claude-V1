---
nr: E-86
titel: Gerechnet und vorgeschlagen wird auf erfassten Daten
entschieden: 2026-10-01
entscheider: Tom
betrifft: [G-546, G-545]
---

# E-86 — Gerechnet und vorgeschlagen wird auf erfassten Daten

## Die Entscheidung

**Tom, 2026-10-01, 13:15:** *„alle daten die vom user erfasst werden
duerfen wir auch rechnen und vorschlagen. wir haben im katalog
referenzwerte aber fuer uns zaehlen die werte welche der user eingibt"*.

Die Grenze laeuft damit nicht zwischen „erfassen" und „empfehlen",
sondern an der **Herkunft der Zahl**:

| | |
|---|---|
| **Erlaubt** | Der Nutzer hat es erfasst. LumeOS rechnet damit und schlaegt vor — Zeitachse, Timing, Laborwert-Kopplung, Warnung bei Konflikt. |
| **Nicht erlaubt** | LumeOS liefert eine Dosierung aus, die der Nutzer nicht erfasst hat, weil eine Strategie sie vorsieht. |

## Was das konkret heisst

`[cmd]` **Die Peptid-Zeile aus Abschnitt 9.1 der Quelle wird KEIN
Phasenparameter.** Die Quelle ordnet elf Peptide den Phasen zu
(„Contest Prep: CJC+IPA+Frag+MT2"), als Zeile in derselben Tabelle wie
Kalorien und Makros. **Sie bleibt Referenzwert im Katalog.**

`[read]` **Der Unterschied in einem Satz:** erfasst der Nutzer sein
eigenes Protokoll, darf LumeOS ihm dazu etwas vorschlagen. Erfasst er
nichts, schlaegt LumeOS nichts vor.

`[cmd]` **Was damit nutzbar wird, ist schon gebaut:**
`medical.user_medications` speichert verschluesselt (C-285), der
Medikamentenkatalog steht (C-506), der Injektionsplaner hat sein
Datenmodell (C-385). **Dasselbe gilt fuer die drei Funktionen aus
G-535/G-571**, sobald sie eine Oberflaeche haben.

## Warum das die Haftungsfrage nicht offen laesst

`[read]` **Die vier Folgefragen aus G-546 — Sichtbarkeit, Abostufe,
Verantwortung, Land — entstanden an der ausgelieferten Dosierung.** Die
faellt weg. Was bleibt, ist eine Rechnung auf Selbstauskunft, und die
ist dieselbe Kategorie wie der Medikamentenabgleich, der schon laeuft.

`[read]` **Eine Grenze bleibt und ist keine Produktfrage:** ein
Vorschlag, der eine erfasste Dosis **erhoeht**, ist keine Rechnung auf
erfassten Daten mehr. **Vorschlaege zur Zeit, zur Reihenfolge, zum Ort
und zum Konflikt — nicht zur Hoehe.**

## Was damit nicht entschieden ist

`[read]` **Was Tobias fachlich dazu sagt** — er ist dafuer da, und seine
Antwort aendert die Grenze nicht, nur was innerhalb davon sinnvoll ist.

`[read]` **Und `docs/ssot/131` Abschnitt 6 ist nachzuziehen:** dort steht
heute, die Protokolle seien bewusst draussen. Richtig ist jetzt: sie sind
Referenz, nicht Vorgabe.
