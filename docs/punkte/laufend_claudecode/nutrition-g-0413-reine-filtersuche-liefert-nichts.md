---
nr: G-413
typ: fehler
modul: nutrition
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: null
entscheidung: null
agent: claudecode
beauftragt: 2026-09-08
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

## Auftrag

**Beauftragt am 2026-09-08.**

`[read]` **Die Datenbank ist gesund** ? **7.140 Treffer bei
leerem `q`.**

`[read]` **Der Fehler liegt in der Oberflaeche.**

### Die Gegenprobe zuerst

`[read]` **Am SCHIRM, nicht im Quelltext** ? **vier Faelle:**

    1  Food DB oeffnen, Suchfeld leer
    2  eine Kategorie waehlen, Feld leer
    3  einen Tag waehlen, Feld leer
    4  ein Wort tippen, dann loeschen

`[read]` **Jeder muss Treffer zeigen.**

`[read]` **Miss ZUERST, welche der vier heute scheitern** ?
**vielleicht ist es nur einer.**

### Der Verdacht

`[cmd]` **`tab-foods.tsx:503`:**

    const ersterLauf = React.useRef(suche.trim().length === 0)

`[cmd]` **Und der Kommentar Zeile 498-502:**

> *,,Der erste Lauf wird uebersprungen, weil `start` die
> Anfangstreffer schon mitbringt. Kam der Begriff aber aus der
> Adresse, passt `start` nicht dazu."*

`[read]` **Die Annahme: ohne Suchbegriff sind die Anfangstreffer
richtig.**

`[read]` **Sie haelt nicht, sobald ein FILTER gesetzt ist.**

`[read]` **Aber der Effekt haengt auch an `kategorie` und `tags`**
? **lies die Abhaengigkeitsliste, bevor du das fuer die Ursache
haeltst.**

### Und was `start` mitbringt

`[cmd]` **`page.tsx` ruft `getLocalFoodSearch`** ? **messen, mit
welchen Filtern.**

`[read]` **Vermutlich ohne** ? **dann sind die Anfangstreffer
ungefiltert.**

### Die Meldung selbst ist richtig

`[cmd]` **`tab-foods.tsx:1052-1056`:** *,,Kein Lebensmittel passt
zu dieser Auswahl."*

`[read]` **Sie erscheint, wenn `zeilen.length === 0`** ? **das ist
korrekt.**

`[read]` **Die Frage ist, warum `zeilen` leer ist.**

## Abnahmebedingungen

    A1  die vier Faelle am Schirm, VORHER. Welche
        scheitern? Bildschirmfotos.
    A2  die Ursache gemessen, nicht vermutet.
    A3  die vier Faelle NACHHER, alle mit Treffern.
    A4  eine Gegenprobe, die rot wird: der alte Zustand
        wiederhergestellt -> faellt sie?
    A5  apps/web 1570 oder mehr.

## Was nicht zu tun ist

**Nichts in `supabase/`** ? **Codex arbeitet an C-465.**
**Die sechs Referenzbloecke bleiben** ? **Tom nimmt sie einzeln
ab.**
Nicht committen, nicht stagen, nicht pushen.

## Der Dev-Server

`[cmd]` **3200 laeuft** (PID 1332072), **3220 laeuft.**
`[cmd]` **NIE `start`, `neustart`, `aufraeumen`.**

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
