---
nr: C-483
typ: entscheidung
modul: quer
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: C-482
entscheidung: null
beruehrt:
  tabellen: [public.koerperflaechen]
zahlen:
  gemessen: 2026-09-08
  ebenen_heute: 3
---

# C-483 — die fuenfte Ebene

## Befund

Aus C-482, Codex, 2026-09-08:

> *,,Die vierte Ebene wurde nicht halb gebaut: Die seitengenaue
> Wadenhierarchie braucht mindestens FUENF Ebenen."*

`[cmd]` **`public.koerperflaechen` hat heute drei:**

    E1   8 Wurzeln
    E2  26 Flaechen
    E3  34 Seiten

`[read]` **Der vollstaendige Weg:**

    Legs > Lower Legs > Calves > Gastrocnemius > links

`[read]` **Das sind FUENF.**

`[cmd]` **`training.muscle_groups` hat vier** ? `Arms >
Forearms > Forearm Extensors > Extensor Carpi Radialis`.

`[read]` **Plus die Seite** ? **fuenf.**

## Was zu entscheiden ist

**a** ? **Fuenf feste Ebenen.**

`[read]` **Jede Zeile weiss, auf welcher sie steht.**

`[read]` **Aber nicht jeder Muskel hat fuenf** ? `Chest >
Pectoralis Major > links` **sind drei.**

`[cmd]` **Dann ist `ebene` eine Zahl zwischen 1 und 5, und die
Tiefe ist je Zweig verschieden.**

**b** ? **Keine Ebenenzahl, nur `parent_id`.**

`[read]` **Die Tiefe ergibt sich aus der Kette** ? **`ebene`
faellt weg.**

`[cmd]` **`training.muscle_groups` macht es so** ? **7 Wurzeln,
88 Kinder, kein Ebenenfeld.**

`[read]` **Und eine rekursive Abfrage rechnet die Tiefe, wenn
jemand sie braucht.**

**c** ? **Die Seite als EIGENSCHAFT, nicht als Ebene.**

`[cmd]` **`koerperflaechen` hat schon `seite`** ? **`links`,
`rechts`, oder leer.**

`[read]` **Dann sind `latissimus-l` und `latissimus-r` keine
eigenen Zeilen, sondern eine Zeile mit zwei Seiten.**

`[cmd]` **Heute sind es 34 Seitenzeilen** ? **die wuerden
wegfallen.**

## Was dafuer spricht, jetzt zu entscheiden

`[cmd]` **Die Karte hat 43 Flaechen** (G-434), **die Tabelle 26
plus 34 Seiten.**

`[read]` **Je laenger die beiden auseinanderlaufen, desto mehr
Bruecken wie `AUS_AUFTEILUNG`.**
