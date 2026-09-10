---
nr: G-413
typ: fehler
modul: nutrition
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: null
entscheidung: null
beruehrt:
  dateien:
    - apps/web/src/app/v2/nutrition/tab-foods.tsx
zahlen:
  gemessen: 2026-09-08
  treffer_db: 7140
---

# G-413 — reine Filtersuche liefert nichts

## Befund

Tom, 2026-09-08:

> food db zeigt nichts mehr an, wenn nichts in der suche ist:
> *,,Kein Lebensmittel passt zu dieser Auswahl."* sprich: reine
> filtersuche geht nicht.

## Die Datenbank ist gesund

`[cmd]` **Direkt gerufen, leeres `q`, keine Filter:**

    nutrition.food_search('', '', ARRAY[]::text[], NULL, NULL,
      NULL, NULL, 'relevance', 3, 0)

    -> total: 7140, result_count: 3
       erster Treffer: Tofu (H861000)

`[read]` **Die Funktion liefert bei leerer Suche den ganzen
Katalog** ? **wie sie soll.**

## Der Fehler liegt in der Oberflaeche

`[cmd]` **`tab-foods.tsx:503`:**

    const ersterLauf = React.useRef(suche.trim().length === 0)

`[cmd]` **Und Zeile 507:**

    if (ersterLauf.current) { ersterLauf.current = false; return }

`[read]` **Beim ERSTEN Lauf ohne Suchbegriff wird der Effekt
uebersprungen** ? **G-266 hat das eingebaut, weil `start` die
Anfangstreffer mitbringt.**

`[cmd]` **Der Kommentar Zeile 498-502 sagt es:**

> *,,Der erste Lauf wird uebersprungen, weil `start` die
> Anfangstreffer schon mitbringt. Kam der Begriff aber aus der
> Adresse, passt `start` nicht dazu."*

`[read]` **Die Annahme: ohne Suchbegriff sind die Anfangstreffer
richtig.**

`[read]` **Sie ist falsch, sobald ein FILTER gesetzt wird** ?
**dann muessten die Treffer neu geholt werden, aber der Effekt
haengt an `suche`, `kategorie`, `tags`, `ohne`, `herkunft`.**

`[read]` **Also: entweder feuert er und `start` wird
ueberschrieben, oder er feuert nicht und der Filter greift
nicht.**

## Was zu messen ist

**1** ? **Feuert der Effekt bei einer Filteraenderung ohne
Suchbegriff?**

`[cmd]` **Die Abhaengigkeiten stehen ab Zeile 560** ? **lesen,
ob `kategorie` und `tags` darin sind.**

`[read]` **Wenn ja: `ersterLauf` blockiert nur den ersten Lauf,
und der Fehler liegt woanders.**

**2** ? **Was bringt `start` mit?**

`[cmd]` **`page.tsx` ruft `getLocalFoodSearch`** ? **messen, mit
welchen Filtern.**

`[read]` **Vermutlich ohne** ? **dann sind die Anfangstreffer
ungefiltert, und der erste Filterklick zeigt entweder alles oder
nichts.**

**3** ? **Und die Meldung selbst.**

`[cmd]` **Zeile 1052-1056:** **sie erscheint, wenn `zeilen.length
=== 0` und nicht `laeuft` und kein `fehler`.**

`[read]` **Das ist richtig** ? **die Frage ist, warum `zeilen`
leer ist.**

## Die Gegenprobe

`[read]` **Am Schirm, nicht im Quelltext:**

    1  Food DB oeffnen, Suchfeld leer
       -> zeigt es Treffer?
    2  eine Kategorie waehlen, Suchfeld leer
       -> zeigt es Treffer?
    3  einen Tag waehlen, Suchfeld leer
       -> zeigt es Treffer?
    4  ein Wort tippen, dann loeschen
       -> zeigt es wieder Treffer?

`[cmd]` **Die Datenbank hat 7.140 Treffer bei leerem `q`** ?
**jeder dieser vier Faelle muss etwas zeigen.**
