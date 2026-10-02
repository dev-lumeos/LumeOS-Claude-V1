---
nr: G-588
typ: befund
modul: quer
schwere: hoch
angelegt: 2026-10-02

braucht: [G-585]
kind_von: G-585

quellen:
  - docs/punkte/erledigt/quer-g-0585-die-inventur-der-ausfuhren-ohne-aufrufer.md
  - docs/punkte/erledigt/quer-g-0571-sechs-schreibwege-ohne-aufrufer.md

beruehrt:
  tabellen: []
  dateien:
    - apps/web/src
---

# Sechs Serveraktionen ohne Aufrufer — dieselbe Klasse wie G-571, eine Ebene hoeher

## Der Befund

`[cmd]` **Aus der Inventur G-585:** von 56 toten Ausfuhren sind **sechs
Serveraktionen** — gebaut, geprueft, und von keiner Oberflaeche gerufen:

    messungAendernAktion
    checkinAktion
    modalitaetAnlegenAktion
    modalitaetAendernAktion
    prioritaetenSpeichern
    getHydrationSummary

`[read]` **Das ist genau die Klasse, die G-571 auf der Datenbankebene
hatte** — sechs Funktionen ohne Aufrufer, alle sechs gewollt, alle sechs
inzwischen angeschlossen (G-577 bis G-582). **Hier ist dasselbe eine
Ebene hoeher.**

`[cmd]` **Keine der sechs traegt eine Punktnummer an der Ausfuhr** — von
den 56 toten tun das nur 7. **Niemand hat sie ausgetragen**, sie sind
gebaut und nie angeschlossen worden.

## Was zu entscheiden ist

`[read]` **Dieselbe Frage wie bei G-571, und sie gehoert Tom:** ist der
Weg geplant und fehlt nur, oder ist er aufgegeben?

`[annahme]` **Geplant, wie bei G-571** — eine Messung aendern, ein
Check-in abschicken, eine Modalitaet anlegen, Prioritaeten speichern, die
Trinkmenge zusammenfassen: **das sind alles Dinge, die ein Nutzer tun
soll.** Aber bei G-571 war genau das Toms Entscheidung und nicht meine
Vermutung.

`[read]` **Wenn geplant, wird je Aktion ein Punkt** — nicht ein
Sammelauftrag: `prioritaetenSpeichern` haengt an Goals,
`modalitaetAnlegenAktion` an Recovery, `getHydrationSummary` an
Nutrition. **Drei Module, drei Lesepfade.**

`[cmd]` **Und die Lehre aus G-571 gilt hier genauso:** dreimal arbeitete
die Datenbankfunktion anders, als eine Annahme erwartet haette. **Erst
messen, was die Aktion tut, dann den Aufrufer bauen.**

**Nicht Teil:** die uebrigen 50 toten Ausfuhren,
`createServiceClient` (G-587) und die 328 ueberzaehligen Ausfuhren
(eigener Punkt).
