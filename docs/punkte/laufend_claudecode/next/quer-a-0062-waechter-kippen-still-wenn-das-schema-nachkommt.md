---
nr: A-62
typ: befund
modul: quer
schwere: mittel
angelegt: 2026-08-30
braucht: []
kind_von: G-267
entscheidung: null
beruehrt:
  dateien: [apps/web/src/app/v2/nutrition]
zahlen: null
---

# A-62 — Waechter kippen still, wenn das Schema nachkommt

## Befund

Aus G-267, Claude Code, 2026-08-30.

`[cmd]` **Drei Faelle an einem Tag:**

    die Planumfang-Karte sagte "Lebenszyklus, Startdatum und
      Bestaetigungsmodus fehlen im Schema"
    ein Waechter aus G-272 verbot die Nutzung von `lifecycle`
    ein zweiter bestand, weil er den Text in einem Kommentar fand

`[read]` **Alle drei waren richtig, als sie geschrieben wurden.**
**Alle drei wurden falsch an dem Tag, an dem Codex das Schema
lieferte** — **und keiner hat es gemeldet.**

`[read]` **Ein Waechter, der einen Kommentar findet, prueft nichts.**
`[cmd]` **Das ist die vierte Erscheinungsform von *Wort statt
Wirkung*** — nach G-216, G-247, G-246 und G-108.

## Warum es eine eigene Klasse ist

`[read]` **Die anderen Faelle waren von Anfang an schwach.**
**Dieser war richtig und ist gekippt** — **weil sich die Welt
darunter geaendert hat.**

`[read]` **Ein Waechter, der eine Abwesenheit sichert, wird zur
Bremse, sobald die Sache da ist.** **Ein Kommentar, der eine Luecke
beschreibt, wird zur Falschaussage.**

## Zu messen

**Welche Waechter und welche Texte sichern eine Abwesenheit?**

`[read]` **Kandidaten: alles, was *fehlt*, *existiert nicht*, *ist
nicht angebunden* sagt.** `[cmd]` **C-175 war schon so einer** — der
Kommentar behauptete, `shopping_lists` gebe es nicht, und die Tabelle
stand da.

`[read]` **Und die Gegenfrage gehoert dazu:** kann ein Waechter
sagen, *,,ich sichere eine Abwesenheit, pruef mich, wenn sie
endet"*?

## Auftrag — die gekippten Waechter finden, bevor sie bremsen

**Mitbeauftragt: G-264, G-93.** Bericht in diese Datei.

`[read]` **Vorbereitet am 2026-08-30.**

### 1 · A-62 — der Befund, der dich viermal getroffen hat

`[cmd]` **Am 30.08. in vier Faellen:**

    G-272-Waechter    verbot die Nutzung von `lifecycle`
    G-270-Waechter    listete `GhostEintraegeEcht`, das du entfernt
                      hattest
    G-274-Waechter    invertierte, als der MealCam-Knopf fiel
    Planumfang-Karte  "Lebenszyklus fehlt im Schema" - vier Wochen
                      richtig, falsch am Tag der Lieferung

`[read]` **Alle vier waren richtig, als sie geschrieben wurden.**
**Du hast alle vier selbst gefunden und repariert** — **jedes Mal
erst, nachdem sie gekippt waren.**

**Miss, welche weiteren eine Abwesenheit sichern.**

`[read]` **Kandidaten sind Waechter und Texte, die *fehlt*,
*existiert nicht*, *ist nicht angebunden*, *hat keinen Aufrufer*
behaupten.** `[cmd]` **C-175 war schon so einer** — der Kommentar
sagte, `shopping_lists` gebe es nicht, **und die Tabelle stand da.**

`[read]` **Und die eigentliche Frage:** kann ein Waechter sagen,
*,,ich sichere eine Abwesenheit, pruef mich, wenn sie endet"*?
`[read]` **Wenn ja, ist das die Loesung. Wenn nein, ist eine Liste
das Beste, was geht** — und die gehoert dann irgendwohin, wo sie
gelesen wird.

### 2 · G-264 — Micronutrient trend

`[cmd]` **Die Attrappe steht weiter im Insights-Reiter.**

`[read]` **In G-11 wurde entschieden, sie nicht anzubinden** — der
Nutrients-Reiter zeigt denselben Verlauf je Naehrstoff. **Das war
richtig.**

`[read]` **Aber nicht angebunden ist nicht entfernt.** `[cmd]`
**G-254 fuehrte sie als *gestrichen, nicht offen* — und das war
falsch.**

`[read]` **A-59: was keinen Aufrufer hat, wird beim naechsten Auftrag
fuer gebaut gehalten. Bei einer sichtbaren Attrappe gilt das
doppelt** — sie sieht aus wie eine Zusage.

### 3 · G-93 — der Anzeigename im Erfassungsdialog

`[read]` **Klein und klar.** `[cmd]` **Miss zuerst, ob es den Befund
noch gibt** — der Dialog ist seit G-272 neu.

### Was nicht zu tun ist

**Keine Waechter loeschen, ohne zu sagen was sie sicherten.**
**Nichts auf `dev@lumeos.app` schreiben.**
Nicht committen, nicht stagen, nicht pushen.

### Nachweis

    Waechter mit Abwesenheit   Zahl, je einzeln benannt
    davon schon gekippt        welche behaupten Falsches
    Selbstmeldung moeglich?    gebaut oder begruendet nicht
    G-264                      entfernt, Attrappen am Schirm
    G-93                       noch da? gebaut oder ueberholt

`[read]` **Die dritte Zeile ist die wertvolle:** **ein Waechter, der
sein eigenes Ablaufdatum kennt, waere mehr wert als zwanzig
gepruefte.**

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
