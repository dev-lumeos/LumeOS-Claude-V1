---
nr: C-520
typ: fehler
modul: supplements
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: G-481
entscheidung: null
agent: codex
beauftragt: 2026-09-08
beruehrt:
  tabellen: [supplements.supplier_products]
zahlen:
  gemessen: 2026-09-08
---

# C-520 - drei Luecken in search_supplier_products

## Befund

Aus G-481, Claude Code, 2026-09-08:

> *,,`search_supplier_products` gibt `produktform` nicht
zurueck (deshalb eine Nachlese, 37 ms), und `p_form` nimmt nur
EINEN Wert, waehrend Toms Regel VIER Formen nennt."*

`[cmd]` **Und ein dritter, selbst gemessen:**

    search_supplier_products(
      'whey isolate optimum nutrition','On Market',
      null,500,null,'Powder')
    -> 0 Treffer

`[read]` **Weil `produktform` den Wert `Powder [E0162]`
traegt** ? **`p_form` vergleicht offenbar exakt.**

`[cmd]` **Derselbe Fallstrick, den G-480 in der Oberflaeche
gefunden hat** ? **dort wurde er umgangen, hier steht er
noch.**

## Was zu bauen ist

    produktform in der Rueckgabe
      -> die Nachlese von 37 ms faellt weg
    p_formen text[] statt p_form text
      -> Toms Regel nennt vier Formen
    p_form vergleicht nicht exakt
      -> "Powder" muss "Powder [E0162]" treffen

`[cmd]` **G-454 hat `p_form` gebaut** ? **miss, ob es je
funktioniert hat.**

## Abnahmebedingungen

    A1  produktform steht in der Rueckgabe.
    A2  p_formen nimmt ein Array.
    A3  "Powder" trifft "Powder [E0162]". Beleg.
    A4  hat p_form je funktioniert? Gemessen.
    A5  Laufzeit vorher/nachher.
    A6  Gegenprobe: eine erfundene Form -> 0.
    A7  Sicherung, Vollkette, ALLE Waechter.

## Sichtbar geworden, 2026-09-08

`[cmd]` **Im G-491-Foto: die Spalte `FORM` der Produktliste ist
in ALLEN Zeilen leer.**

`[read]` **Das ist die Folge von Luecke 1: `produktform` fehlt
in der Rueckgabe.**

`[read]` **Und G-492 braucht die Form in der Liste** ? **der
Knopf in der Zeile soll wissen, ob er Stack oder beides
anbietet.**

## Die Kruecke steht jetzt im Code, 2026-09-08

`[cmd]` **G-492 hat eine serverseitige Nachlese gebaut:
`produkte-read.ts`, 2,8 ms je 500 Zeilen, gestueckelt zu
150.**

> *,,Da die Formregel entscheidet, ob der Knopf Stack oder
beides anbietet, waere JEDES Pulver auf *nur Stack*
gefallen."*

`[cmd]` **Markiert zum Entfernen, sobald dieser Punkt
`produktform` zurueckgibt.**

`[read]` **Nach dem Einspielen: Claude Code entfernt die
Nachlese** ? **als Folgeauftrag.**

