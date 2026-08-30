---
nr: G-278
typ: befund
modul: quer
schwere: mittel
angelegt: 2026-08-30
braucht: []
kind_von: A-62
entscheidung: null
agent: claudecode
beauftragt: 2026-08-30
erledigt: 2026-08-30
commit: OFFEN
beruehrt:
  dateien:
    - tools/abwesenheit-pruefen.mjs
zahlen:
  gemessen: 2026-08-30
  lebende_aussagen: 222
  markiert: 3
  gekippt_gefunden: 9
---

# G-278 — die restlichen 222 Abwesenheitsaussagen

## Befund

Aus A-62, Claude Code, 2026-08-30.

`[cmd]` **`tools/abwesenheit-pruefen.mjs` steht im Gate.** Eine
Aussage traegt eine Marke, und der Gate faellt an dem Tag, an dem die
Abwesenheit endet.

`[cmd]` **Markiert sind drei. Gefunden und berichtigt wurden neun
bereits gekippte. Es bleiben 222 lebende Aussagen.**

`[read]` **Seine eigene Einordnung:** *,,die Marke faengt nur, was
jemand markiert. Ich habe die neun durch Suchen gefunden, nicht durch
den Waechter."*

`[read]` **Der Waechter verhindert das naechste stille Kippen. Er ist
keine flaechendeckende Pruefung.**

## Die Unterscheidung, die zaehlt

    Code-Eigenschaft    kippt nie von selbst
                        "kein .insert() in einer Lesedatei"
    Welt-Abwesenheit    kippt bei Lieferung
                        "die Spalte gibt es nicht"

`[cmd]` **Von 656 Treffern liegen 434 in `docs/ssot/` und
`docs/punkte/erledigt/`** — **Protokoll, das altern soll.**

## Zu entscheiden

**Lohnt sich der Durchgang durch die 222?**

`[read]` **Dafuer spricht:** neun waren bereits gekippt, ohne dass
jemand es bemerkte — **das ist eine Quote von vier Prozent, und die
tragende Stelle hat einen Leerzustand begruendet.**

`[read]` **Dagegen:** ein Durchgang ist Fleissarbeit, und die Marke
wirkt nur dort, wo sie steht.

`[read]` **Ein Mittelweg waere, nur die Aussagen zu markieren, die
eine Anzeige begruenden** — **die anderen kippen still, aber folgenlos.**

## Auftrag

**Mitbeauftragt mit G-277 am 2026-08-30.** Der Auftragstext
und der Bericht stehen dort.

## Bericht

**Claude Code, 2026-08-30.** Mitbeauftragt mit G-277. **Der
vollstaendige Bericht steht in [G-277](coach-g-0277-der-rechte-reiter-nennt-einen-grund-den-es-nicht-gibt.md#bericht).**

### Der Mittelweg, gemessen

`[cmd]` **194 Abwesenheitsaussagen in laufendem Code** — nicht 222;
die aeltere Zahl schloss die Protokollordner mit ein. **76 stehen im
Umfeld einer Anzeige-Entscheidung.**

`[read]` **Tragend sind die `grund=`-Texte** — der Satz, den ein
Nutzer liest, wenn ein Knopf nichts tut. Genau die Sorte, die G-277
ausgeloest hat.

`[cmd]` **Zehn darin genannte Tabellen geprueft: fuenf da, fuenf
fehlen.** **Eine war gekippt und stand am Schirm:**
`medical.symptoms` (8 Spalten, 34 Zeilen, wird von `lesen.ts:431`
gelesen) wurde als *„gibt es nicht"* behauptet.

`[read]` **Berichtigt mit dem, was wirklich fehlt:** `symptoms` ist
ein Katalog; **fuers Erfassen fehlt ein Protokoll je Nutzer.**

**Sechs Marken gesetzt; der Gate fuehrt jetzt 10, alle gueltig.**

`[read]` **Nicht alle 194** — die uebrigen stehen in Kommentaren,
Waechtern und Protokolldateien und altern zu Recht.

## Abnahme

**2026-08-30, mit G-277 abgenommen:** 194 statt 222, sechs Marken gesetzt, `medical.symptoms` war
gekippt und stand am Schirm.
