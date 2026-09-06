---
nr: G-354
typ: befund
modul: quer
schwere: mittel
angelegt: 2026-09-07
braucht: []
kind_von: G-352
entscheidung: null
agent: claudecode
beauftragt: 2026-09-07
beruehrt:
  tabellen: [goals.user_goals]
zahlen:
  gemessen: 2026-09-07
  listen: 6
---

# G-354 — ein sechstes Ziellisten-Modal

## Befund

Aus G-352, Claude Code, 2026-09-07.

`[cmd]` **Im *Neues Ziel*-Modal steht eine sechste Zielliste** —
**mit einem Wert, den die Datenbank nicht kennt.**

`[read]` **Damit sind es sechs Fassungen:**

    goal_type          4 Werte, CHECK
    subtype            5 gelebte Werte, kein CHECK
    phase_type         9 Werte
    difficulty_level   5 Werte
    profiles.nutrition_goal
    das Modal          eine sechste, mit unbekanntem Wert

`[read]` **Dieselbe Klasse wie die sechste Namensliste in
`modale.tsx`** (G-339) — **eine Liste, die niemand mitzaehlt, weil
sie in einem Fenster steht.**

`[cmd]` **Und wie dort ein Wert, den der CHECK ablehnen wuerde.**

## Zu tun

`[read]` **Den Wert berichtigen oder das Modal an eine bestehende
Liste anschliessen.**

`[read]` **Und pruefen, ob weitere Fenster eigene Listen tragen** —
`[cmd]` **G-339 hat gezeigt, dass ein Zaehlwaechter sie uebersehen
kann.**

## Auftrag — die sechste Liste und zwei Reste

**Mitbeauftragt: G-261, G-136.** Bericht in diese Datei.

**Beauftragt am 2026-09-07.**

### 1 · G-354 — der unbekannte Wert

`[cmd]` **Du hast ihn gefunden** — **eine sechste Zielliste mit einem
Wert, den die Datenbank nicht kennt.**

`[read]` **Berichtige ihn oder schliess das Modal an eine bestehende
Liste an.**

`[read]` **Und pruef, ob weitere Fenster eigene Listen tragen** —
`[cmd]` **G-339 hat gezeigt, dass ein Zaehlwaechter eine uebersehen
kann.**

### 2 · Die drei aktiven Ziele

`[cmd]` **Du hast gemeldet: das Anlegen von Zielen ist durch eine
unentschiedene Produktfrage blockiert** — **die drei aktiven
Plaetze.**

`[read]` **Miss, woher die Drei kommt** — **CHECK, Spec, oder
Annahme im Code?**

`[cmd]` **`priority` hat zwei CHECKs:** **1 bis 3 bei `active`, 1 bis
10 sonst.**

`[read]` **Wenn die Drei aus dem CHECK stammt, ist sie
entschieden** — **dann fehlt nur die Oberflaeche.** `[read]` **Wenn
sie aus einer Annahme stammt, gehoert sie zu Tom.**

### 3 · G-261 und G-136

`[cmd]` **G-261 ist bewusst zurueckgestellt hinter einem
funktionierenden Gate-Waechter** — **du hast es gemessen.**

`[read]` **Lass ihn liegen und sag im Bericht, wann er
weiterlaeuft.**

`[cmd]` **G-136 pruefe nur:** **die vier Karten aus E-48** — **ist
seit dem 02.09. etwas nachgerutscht?**

### Was nicht zu tun ist

**Keine siebte Liste.**
**Kein Ziel-Anlegen bauen** — **die Produktfrage ist offen.**
**Nichts auf `dev@lumeos.app` schreiben.**
Nicht committen, nicht stagen, nicht pushen.

### Der Dev-Server gehoert dir

`[cmd]` **`server.py start` bevorzugen.**

### Nachweis

    sechste Liste   berichtigt oder angeschlossen
    weitere Fenster gezaehlt
    die Drei        CHECK / Spec / Annahme, mit Fundstelle
    G-136           nachgerutscht oder nicht

## Bericht

**Claude Code, 2026-09-06.**

### 2 · Zuerst die Drei — sie steht im CHECK

`[read]` **Das war die Frage, an der am meisten haengt**, also
zuerst.

`[cmd]` **Gemessen am 2026-09-06:**

    user_goals_check1
      CHECK (status <> 'active' OR (priority >= 1 AND priority <= 3))

    user_goals_priority_check
      CHECK (priority >= 1 AND priority <= 10)

    uq_user_goals_active_slot
      UNIQUE INDEX ON (user_id, priority) WHERE status = 'active'

`[read]` **Die Drei kommt aus dem CHECK, nicht aus einer Annahme im
Code und nicht aus einer Spec.** **Und sie ist doppelt gesichert:**
der CHECK begrenzt den Wert, **der eindeutige Index verhindert, dass
zwei aktive Ziele denselben Platz belegen.**

`[read]` **Damit ist sie entschieden** — **es fehlt nur die
Oberflaeche, die einen freien Platz waehlt.**

`[cmd]` **Ich habe in G-352 geschrieben, das Anlegen sei durch eine
*unentschiedene Produktfrage* blockiert.** `[read]` **Das war zu
weit gefasst.** **Berichtigt: die Zahl der Plaetze ist entschieden;
offen ist nur, welchen freien Platz ein neues Ziel bekommt** — und
das ist eine kleine Frage, keine Produktentscheidung.

`[cmd]` **Der `InEntwicklungKnopf` im Modal trug denselben zu weiten
Satz** (*,,ist eine Produktentscheidung"*). **Berichtigt, mit
Fundstelle.**

### 1 · Die sechste Liste — angeschlossen, nicht nur berichtigt

`[read]` **Der Auftrag liess beides zu.** `[read]` **Anschliessen ist
richtig, weil ein berichtigter Wert in einer eigenen Liste beim
naechsten Mal wieder auseinanderlaeuft** — genau das ist bei G-339
passiert.

`[cmd]` **Neu: `apps/web/src/lib/goals/ziel-arten.ts`** — die vier
Werte des CHECK, ihre deutschen Namen, und die fuenf gemessenen
Unterarten aus G-352.

`[cmd]` **`modale.tsx:117` holt sie jetzt von dort:**

    vorher   const types = [{ id: <abgekuerzt>, … }, …]   6 Eintraege
    nachher  const types = zielArtAuswahl().map(…)        4 Eintraege

**Am Schirm gegengeprueft** (`dev@lumeos.app`, *New goal*):

    Koerperzusammensetzung · Leistung · Gesundheit · Lebensstil
    Weight / Habit / Custom:  nicht mehr vorhanden

**Bildschirmfoto:** `backup/g354-nachher-modal.png`.

`[read]` **`health` bekommt eine leere Unterartenliste** — **null
Zeilen im Bestand.** `[cmd]` **Kein erfundener Wert** (C-378).

### Was der Typecheck gefunden hat, nicht ich

`[cmd]` **Nach dem Anschluss meldete `tsc` drei Fehler in
`modale.tsx`:** `type === 'strength'` **hat keine Ueberschneidung
mehr.**

`[read]` **`strength` war in der Altrepo-Liste eine ART** — **in der
Datenbank ist es ein `subtype` unter `performance`.** **Die drei
Vergleiche steuerten Beispieltexte und haetten nach dem Anschluss
still den falschen Zweig genommen.**

`[cmd]` **Ersetzt durch `BEISPIEL`, eine Zuordnung ueber genau die
vier Arten** — **vollstaendig, weil `Record<ZielArt, …>` es
erzwingt.**

`[read]` **Das ist der Gewinn des Anschliessens:** **der Typ hat die
Folgestellen gemeldet.** **Ein berichtigter Wert in der alten Liste
haette sie nicht gefunden.**

### Weitere Fenster mit eigenen Listen — gezaehlt

`[read]` **Nicht nach `const types =` gesucht** (das ist der
G-339-Fehler), **sondern nach der Wirkung:** ein Literal-Feld aus
Auswahlobjekten, feste `<option>`-Reihen, oder Knoepfe mit
`aria-pressed`.

`[cmd]` **15 Fenster-Dateien tragen eine eigene Liste.** **Zwoelf
davon sind Reiternamen** (`today`, `plan`, `history` …) — **keine
Fachwerte, kein CHECK dahinter.**

`[cmd]` **Drei tragen Fachwerte, und zwei stimmen exakt:**

    supplements/tabs.tsx    8 Werte  = CHECK auf `timing`      OK
    training/tabs-spec.tsx  4 Werte  = CHECK auf `set_type`    OK
    goals/modale.tsx        6 Werte  != CHECK auf `goal_type`  FALSCH

`[cmd]` **`goals/phase-editor.tsx` sieht wie eine Liste aus, ist
aber keine:** `t1`, `s1` sind Zeilenkennungen einer Attrappe, keine
Fachwerte.

`[read]` **Damit war das Zielmodal die einzige abweichende Liste** —
**gemessen, nicht vermutet.**

### Und eine Falschaussage im Kopf der Datei

`[cmd]` **`modale.tsx:13` behauptete:** *,,es gibt weder
`goals.user_goals` noch `goals.body_measurements`"* (GO-07, GO-10).

`[cmd]` **Beide Tabellen gibt es** — `user_goals` mit 23 Spalten und
11 Zeilen, **und `lib/goals/schreiben.ts` aendert sie bereits.**

`[read]` **Ein Kommentar, der eine vorhandene Tabelle fuer abwesend
erklaert, wird beim naechsten Auftrag als Grund zitiert.**
**Berichtigt.**

### Waechter und Sabotage

`[cmd]` **Neu: `ziel-arten-eine-quelle.test.ts`, 12 Proben.**
**Rotlauf vor dem Anschluss: 3 von 12 rot.**

`[cmd]` **Je Zusage eine Sabotage, alle fuenf ROT:**

    unbekannter Wert zurueck in die Quelle    fail=5
    erfundene Unterart fuer `health`          fail=2
    die Drei wird zur Fuenf                   fail=1
    eine gemessene Unterart faellt weg        fail=1
    das Modal fuehrt wieder eine eigene Liste fail=1
    Nachlauf, zurueckgesetzt                  fail=0

`[cmd]` **Die Probe *,,keine v2-Datei nennt den abgekuerzten Wert"*
hat zuerst meinen eigenen Erklaerkommentar gefangen** — **er nannte
ihn woertlich.** `[read]` **Der Waechter kann Kommentar nicht von
Code unterscheiden, und das ist richtig so:** **ein Wert im
Kommentar wird beim Kopieren zum Wert im Code.** **Umformuliert
statt Waechter aufgeweicht.**

### 3 · G-261 — wann er weiterlaeuft

`[read]` **Liegengelassen, wie beauftragt.**

`[cmd]` **Er ist mit E-31 zurueckgestellt** — *,,nicht anbinden, aber
messbar halten"*. `[cmd]` **`tools/zwei-wahrheiten-pruefen.mjs`
steht als neunter Schritt in `pnpm gate` und meldet:** *,,gruen: 6
Naehrstoffspalten, Soll 6. G-261 bleibt zurueckgestellt."*

**Er laeuft weiter, wenn `goals.nutrition_targets` eine SIEBTE
Naehrstoffspalte bekommt.** `[read]` **Dann faellt das Gate, und der
Punkt wird von selbst wieder zur Frage** — **niemand muss daran
denken.**

`[read]` **Heute traegt die Tabelle sechs** (`kcal`, `protein_g`,
`carbs_g`, `fat_g`, `linoleic_acid_g`, `alpha_linolenic_acid_g`).

### 4 · G-136 — nichts nachgerutscht

`[cmd]` **Die Punktdatei nennt G-136 als dritten Mitauftrag** (der
Auftrag im Chat nicht) — **gemessen.**

`[read]` **Erste Messung war falsch gestellt:** ich habe `group_de`
aus der Datenbank gegen `KARTEN_REIHENFOLGE` gehalten und **zwoelf
Abweichungen** bekommen. `[read]` **Die Karten sind aber
Anzeigegruppen, keine Datenbankgruppen** — `Fette` und `Wasser`
stehen in keiner `group_de`. **Der Vergleich hat zwei verschiedene
Dinge gepaart.**

`[cmd]` **Richtig gemessen, ueber die zuordnende Funktion
`karteFuerWurzel`:** **neun Wurzeln tragen
`group_de = 'Makronaehrstoffe'` und fielen damit frueher in
*Sonstige*:**

    CHO, FIBT   -> Kohlenhydrate     FAT   -> Fette
    PROT625, NT -> Protein           WATER -> Wasser
    OA          -> Organische Saeuren ALC  -> Genussmittel
    ASH         -> Elemente

`[cmd]` **Alle neun sind namentlich zugeordnet.** `[cmd]` **Keine
weitere Wurzel traegt `Makronaehrstoffe` oder
`Sonstige Naehrstoffe`.**

`[read]` **Es ist nichts nachgerutscht.** **Die Sammelkarte
*Sonstige* steht in der Reihenfolge, bekommt aber nichts mehr.**

### Vollstaendiger Lauf

    tsc --noEmit          sauber
    next lint             keine Warnung, kein Fehler
    Tests                 1436 / 1436 gruen, 0 Fehler
    dev@lumeos.app        730 Mahlzeiten, unveraendert
    user_goals            11 Zeilen, unveraendert
    gestaged              nichts

### Was nicht gemacht wurde

**Keine siebte Liste** — `ziel-arten.ts` ERSETZT die sechste, sie
kommt nicht dazu.
**Kein Ziel-Anlegen gebaut.**
**Nichts in `supabase/`** — ob `subtype` einen CHECK bekommt, ist
weiter offen (G-352) und waere Codex' Arbeit.
**Nichts auf `dev@lumeos.app` geschrieben.** Nicht committet.

## Abnahme

_(vom Orchestrator)_
