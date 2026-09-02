---
nr: C-389
typ: befund
modul: nutrition
schwere: mittel
angelegt: 2026-09-02
braucht: []
kind_von: C-386
entscheidung: null
agent: codex
beauftragt: 2026-09-02
erledigt: 2026-09-02
commit: cd07bf99
beruehrt:
  tabellen: [nutrition.foods]
zahlen:
  gemessen: 2026-09-02
---

# C-389 — Saft und Nektar liegen bei der Frucht

## Befund

Aus C-386, Codex, 2026-09-02.

`[cmd]` **Fuer `F201`, `F603` und `F310` liegen Frucht, Saft und
Nektar alle in Kategorie `obst`.** `[cmd]` **Es gibt keine Zellen-
oder Artenspalte.**

`[cmd]` **Und `processing_level` ist bei Saft und Nektar `raw`.**

`[read]` **Ein Saft ist kein rohes Obst.**

## Was es kostet

`[cmd]` **Die Rangfolge stellt *Aprikose* (F201100) vor
*Aprikosensaft* (F201600)** — **aber der Saft steht als sechster von
24 flachen Treffern.**

`[read]` **Wer *Aprikose* sucht, bekommt Saft und Nektar in der
Liste** — **und muss selbst erkennen, dass das etwas anderes ist.**

`[cmd]` **C-35 nannte es *,,je ein echter Suchfehler weniger, und
ohne Kuration zu haben"*** — **die Trennung waere ableitbar.**


## Gemessen am 2026-09-02: belegt, mit Rang.

`[cmd]` **Saft und Nektar bleiben in `obst` und `raw`.** `[cmd]`
**`Aprikosensaft` trifft bei *Aprikose* per `name_prefix`, Rang 6.**

`[read]` **Der Treffergrund zeigt: kein Synonym- oder Aliasfehler,
sondern der Name selbst.** **Der Punkt bleibt offen.**

## Auftrag

**Mitbeauftragt mit C-388 am 2026-09-02.** Der Auftragstext
und der Bericht stehen dort.

## Gemessen am 2026-09-02: trennbar, aber nicht global

`[cmd]` **Die drei Saftfamilien sind ueber BLS-Codes trennbar:**
**100 roh, 600 Saft, bei Orange 700 Nektar.**

`[cmd]` **Aber global ist 600 nicht eindeutig Saft:** **3 von 53
Obst-600-Zeilen sind Smoothies.**

`[read]` **Die Regel laesst sich nicht allgemein ausrollen** —
**C-35 nannte drei Familien, nicht alle.**

`[read]` **Der Umfang steht damit: `F201`, `F603`, `F310` — drei
Familien, keine Regel.**

## Auftrag — drei Familien, kein Regelversuch

**Mitbeauftragt: C-31, C-335.** Bericht in diese Datei.

**Beauftragt am 2026-09-02.**

### 1 · C-389 — die drei Saftfamilien

`[cmd]` **Du hast gemessen: `100` roh, `600` Saft, bei Orange `700`
Nektar** — **trennbar fuer `F201`, `F603`, `F310`.**

`[cmd]` **Aber global ist `600` nicht eindeutig:** **3 von 53
Obst-600-Zeilen sind Smoothies.**

`[read]` **Also keine Regel, sondern drei Familien** — **C-35 nannte
auch nur diese drei.**

`[cmd]` **`processing_level` steht bei Saft auf `raw`.** `[read]`
**Ein Saft ist kein rohes Obst** — **das ist die Zeile, die sich
berichtigen laesst.**

`[read]` **Und mit `match_reason` aus C-391 laesst sich zeigen, ob
es wirkt:** `[cmd]` **`Aprikosensaft` stand bei *Aprikose* auf Rang
6.**

### 2 · C-31 — die Kurationsoberflaeche

`[cmd]` **`apps/admin` hat eine Kurationsseite, 314 Zeilen,
vollstaendig lesend.**

`[cmd]` **Und seit C-366 gibt es `food_tags_kuriert` mit
`food_tags_effective`.**

`[read]` **Der Schreibweg fehlt.** `[read]` **Miss, was die Seite
heute zeigt und was ein Schreibweg braeuchte** — **die Oberflaeche
selbst ist ein UI-Auftrag, nicht deiner.**

### 3 · C-335 — keine Aenderungshistorie

`[read]` **Lies den Punkt und miss, ob er noch gilt.**

`[cmd]` **Seit E-42 sind geloggte Positionen eingefroren** —
`[cmd]` **und `coach.action_log` fuehrt seit C-381 ein Protokoll.**

`[read]` **Vielleicht ist die Frage inzwischen eine andere.**

### Was nicht zu tun ist

**Keine Regel fuer alle 53** — drei Familien.
`apps/` nicht anfassen.
Nicht committen, nicht stagen, nicht pushen.

### Der Dev-Server gehoert dir nicht

`[cmd]` **Kein `neustart`, kein `start`, kein `aufraeumen`.**

### Nachweis

    drei Familien    Saft und Nektar getrennt, mit match_reason
    Aprikose         wo steht der Saft jetzt
    Smoothies        die drei bleiben unberuehrt, gezaehlt
    C-31             was fehlt fuer den Schreibweg
    C-335            gilt / ueberholt

## Bericht

**Gemessen am 2026-09-02.** Keine `apps/`-Datei, kein Datenbestand und
kein Dev-Server wurden veraendert.

### C-389 — genau drei Familien, keine globale 600-Regel

`[cmd]` **Die sieben konkreten Zeilen sind eindeutig:**

    BLS-Code  Bezeichnung        processing_level
    F201100   Aprikose roh       raw
    F201600   Aprikosensaft      raw
    F603100   Orange roh         raw
    F603600   Orangensaft        raw
    F603700   Orangennektar      raw
    F310100   Weintraube roh     raw
    F310600   Traubensaft        raw

`[cmd]` **In Kategorie `obst` gibt es 53 Zeilen mit BLS-Stelle `600`,
aber drei davon sind Smoothies:** `F032600` *Smoothie purpur
(Fruechte)*, `F033600` *Smoothie gelb (Fruechte)* und `F034600`
*Smoothie gruen (Fruechte/Gemuese)*.

`[read]` **Damit ist `600 => Saft` keine tragfaehige Regel.** Die
ableitbare Korrektur beschraenkt sich auf `F201`, `F603` und `F310`:
`100` roh, `600` Saft und nur bei `F603` `700` Nektar. Die drei
Smoothies bleiben davon unberuehrt.

`[cmd]` **Die Suche nach `Aprikose` liefert 24 Treffer;
`F201600` steht auf Rang 6 und traegt
`match_reason = {kind: name_prefix}`.** Das belegt einen
Namens-/Verarbeitungsfall, keinen Alias- oder Synonymfall. Der Saft
ist weiterhin als `raw` hinterlegt; ein eventueller Schreibauftrag
muss daher nur diese drei Familien behandeln, nicht die 53er-Menge.

### C-31 — der Leser kennt die Kurations-Overlays noch nicht

`[cmd]` **Die Seite `apps/admin/src/app/curation/page.tsx` hat genau
314 Zeilen.** Sie und `/api/curation` besitzen nur `GET`, pruefen
zuerst die Adminrolle und rufen anschliessend
`nutrition.curation_overview` auf. Es gibt dort keinen Handler und
keinen Datenbankaufruf fuer `INSERT`, `UPDATE`, `UPSERT` oder
`DELETE`.

`[cmd]` **Der heutige Leser zeigt den Basiskatalog:** 7.140 Foods,
7.067 kategorisierte und 73 unkategorisierte Foods, 32.845 Aliase,
14 Tagdefinitionen und 30.797 `food_tags`; er zeigt bis zu 50 offene
Beispiele, Kategorien, Alias- und Tagabdeckung sowie die leeren
Kandidaten-/Entscheidungstabellen. Die Seite zaehlt und zeigt
`food_tags`, nicht `food_tags_effective`.

`[cmd]` **`nutrition.food_tags_kuriert` ist live und leer (0
Zeilen), `food_tags_effective` liefert 30.797 effektive Zuordnungen.**
Auf der Overlay-Tabelle ist RLS aktiv; fuer Anwendungsrollen gibt es
nur die Lesepolicy `food_tags_kuriert_select`. Auch die vom Leser
verwendeten TypeScript-Daten kennen lediglich die bereits aufgeloeste
Liste `tags`, aber weder `action` noch eine Overlay-Quelle.

`[read]` **Ein spaeter UI-Auftrag braucht daher vier klar getrennte
Teile:**

1. effektive Tags und vorhandene Kurationsentscheidung im Leser
   ausweisen;
2. eine nur serverseitig erreichbare, admin-autorisierte Mutation;
3. Validierung von `food_id` und definiertem `tag_code` sowie ein
   gezieltes Upsert von `(food_id, tag_code, action)` nach
   `food_tags_kuriert` (`set` oder `removed`);
4. erneutes Lesen aus `food_tags_effective`, damit Import und
   Kuration zusammen sichtbar sind.

`[read]` **Der Browser darf dafuer keinen direkten Schreibzugriff auf
die Tabelle erhalten.** Die eigentliche Oberflaeche und dieser
Schreibweg bleiben ein UI-Auftrag; hier wurde keiner gebaut.

### C-335 — gilt noch, aber der Befund ist nun enger

`[cmd]` **Eine Verlaufstabelle oder ein Audit-Trigger existiert weder
fuer `nutrition.meal_items` noch fuer
`nutrition.nutrient_reference_values`.** `meal_items` hat nur den
Eigentuemer- und den `updated_at`-Trigger; Referenzwerte haben gar
keinen Trigger. Von 9.051 Meal-Items tragen alle einen
Naehrwert-Snapshot (`frozen_at`), aber 1.725 wurden mindestens einmal
aktualisiert — die vorherige Fassung ist nirgends gespeichert.

`[cmd]` **E-42 wirkt nur auf Planpositionen im Web-Schreibweg, nicht
auf `meal_items`:** sechs geloggte Positionen sind aktuell viermal
`confirmed`, einmal `deviated` und einmal `skipped`. Die
Positionen-Sperre schuetzt damit die vergangene Planposition, ersetzt
aber keine Aenderungshistorie einer Mahlzeit.

`[cmd]` **`coach.action_log` enthaelt aktuell eine Trainingsaktion.**
Sein Schema hat keine Referenz auf Meal, Meal-Item oder
Referenzwert; C-381 protokolliert bestaetigte Coach-Aktionen, nicht
Mahlzeiten- oder Referenzwert-Aenderungen.

`[read]` **C-335 gilt deshalb fuer die Nachvollziehbarkeit einer
Aenderung weiter.** Fuer die gegessene Menge ist das Risiko seit dem
Snapshot kleiner: eine Lebensmittel-Aenderung schreibt vergangene
Meal-Item-Naehrwerte nicht um. Die Referenzbewertung ist hingegen
bewusst dynamisch: `daily_reference_assessment` liest den aktuellen
Referenzbestand und verwendet `effective_from` nicht. Ein geaenderter
Massstab darf daher alte Tage heute anders bewerten; ohne Verlauf
laesst sich der fruehere Bildschirmstand dennoch nicht reproduzieren.

**Ergebnis:** Nicht ueberholt, sondern aufgeteilt: Planpositionen sind
am Schreibweg eingefroren, Meal-Items sind Naehrwert-Snapshots ohne
Versionshistorie, und Referenzwerte bleiben ein bewusst dynamischer,
aber nicht historisierter Massstab.

## Abnahme

**2026-09-02, Orchestrator.**

### C-389 — der Umfang steht, gebaut wurde nichts

`[cmd]` **Nur `F201`, `F603`, `F310` sind sicher trennbar.**
`[cmd]` **Keine Regel fuer alle 53 600-Zeilen — drei davon sind
Smoothies.**

`[cmd]` **`Aprikosensaft`: Rang 6, `name_prefix`.**

`[read]` **Der Auftrag sagte *drei Familien, keine Regel*** — **und
er hat es bestaetigt statt ausgeweitet.**

`[read]` **Der Punkt bleibt offen:** **die Trennung ist moeglich, sie
ist nicht vollzogen.** `[read]` **Ob sie sich lohnt, haengt an
derselben Frage wie C-388** — **wie oft trifft ein Saft eine Suche,
in der er stoert?**

### C-31 — was ein Schreibweg braucht

`[cmd]` **Die Admin-Kuration ist vollstaendig lesend.**

`[read]` **Und er nennt die drei Teile:** **serverseitige
Admin-Mutation, Overlay-Upsert, Lesen ueber `food_tags_effective`.**

`[cmd]` **Der dritte steht seit C-366** — **die Sicht ist gebaut und
angeschlossen.**

`[read]` **Damit ist der Punkt kein Entwurf mehr, sondern ein
UI-Auftrag mit bekannter Naht.**

### C-335 — gilt weiter, aber enger

`[cmd]` **Meal-Item-Naehrwerte sind eingefroren** — **Aenderungen
selbst bleiben ohne Verlauf.**

`[cmd]` **Referenzbewertungen sind bewusst dynamisch und nicht
historisierbar.**

`[cmd]` **`coach.action_log` deckt das nicht ab.**

`[read]` **Meine Vermutung war, E-42 und C-381 haetten den Punkt
ueberholt** — **sie haben ihn verkleinert, nicht erledigt.**

`[read]` **Was bleibt: wer eine Mahlzeit aendert, hinterlaesst keine
Spur.** `[read]` **Und das ist bei Referenzbewertungen gewollt, bei
Mahlzeiten nicht entschieden.**

**Abgenommen.** **Alle drei bleiben offen, mit engerem Umfang.**

## Auftrag

**Mitbeauftragt mit C-397 am 2026-09-02.** Der Auftragstext
und der Bericht stehen dort.

## Abnahme

**2026-09-02, mit C-397 abgenommen: vier Zeilen, keine Regel.**

`[cmd]` **`F201600`, `F310600`, `F603600`, `F603700` stehen auf
`minimally_processed`.** `[cmd]` **Die drei Smoothies bleiben
`raw`.**

`[cmd]` **`Aprikosensaft` bleibt Rang 6 mit `match_reason:
name_prefix`** — **ein Ausschlussfilter blendet ihn aus.**

`[read]` **Die Rangfolge aendert sich nicht, aber der Nutzer kann
filtern.**
