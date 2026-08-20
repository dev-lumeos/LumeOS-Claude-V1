# 154 — Preferences: speichern, bedienen, wirken

**Auftrag:** G-104 · **Stand:** 2026-08-20 · **Modul:** Nutrition
**Vorher:** G-65 (der Tab), G-67 (der Daumen), C-94 (Suche mit
Vorlieben), G-13 (Erfassungsdialog), C-156 (der reparierte Schreibweg,
eine Stunde vor diesem Auftrag)

**Kurz:** Das Speichern war zum Zeitpunkt dieses Auftrags **schon
repariert** — Toms Befund traf den Stand vor C-156; gemessen speichert
jetzt jede Kachel (setzen → neu laden → steht). Was wirklich fehlte und
jetzt gebaut ist: **ein Klickmuster statt drei** (tippen schaltet
weiter, der Wert steht am Element), **Individual Foods nimmt selbst
auf** (Suchfeld + Zyklus + Papierkorb), zwei echte Bugs
(Klick-Kreuzung bei schnellen Klicks; Daumen-Zeilen waren über die
Kachel unlöschbar), und der **veraltete Wirkungs-Hinweis** ist ersetzt.
Wirkung doppelt gemessen: `mandel` 64 → 0 (Allergen), „Honig" fällt
durch −50 auf die Kategorie aus den Top-8. Tests 441/441,
Zeilenschutz mit `test-user` belegt.

---

## Warum es nicht speicherte

`[cmd]` **Es speicherte zum Messzeitpunkt bereits** — der erste
Messlauf dieses Auftrags setzte fünf Kacheln (Diet `keto`, Allergen
`Senf` → Sensibel, Kategorie liked, Tag, Preset), lud neu: **alles da,
Fehlerzeile leer.** Der Tab schrieb schon immer über
`food_preferences_write`; das Löschen sass in der Funktion selbst —
die alte Fassung ersetzte den GESAMTEN Item-Bestand (auch
Daumen-Einträge), und C-156 (eine Stunde vor G-104) hat genau das
repariert: schlüsselbasiertes Zusammenführen, nur der
`settings`-Satz wird ersetzt, `source` bleibt erhalten, und **die
Funktion wirft sichtbar**, wenn sie weniger schrieb als geschickt
wurde (das G-79-Muster gegen das stille `ok`).

**Zwei echte Lücken blieben trotzdem — beide gefunden, beide zu:**

1. `[read]` **Klick-Kreuzung:** Jede Änderung sendet den ganzen Satz.
   Zwei schnelle Klicks auf verschiedenen Kacheln rechneten auf dem
   veralteten Render-Abzug — der zweite Klick schickte den Stand VOR
   dem ersten und löschte ihn wieder. Jetzt: synchroner `standRef`,
   serialisierte Schreibläufe (`ketteRef`), und nur die jüngste
   Antwort setzt den Stand (`folgeRef`). Der Wächter-Test prüft alle
   drei.
2. `[cmd]` **Daumen-Zeilen waren über die Kachel unlöschbar:** C-156
   löscht beim Kachel-Lauf nur `source='settings'`. Eine entfernte
   Daumen-Zeile fiel aus dem gesendeten Satz, blieb aber in der
   Datenbank — nach dem Neuladen war sie wieder da. Gemessen am
   Haferflocken-Daumen, dann gefixt: Zeilen fremder Herkunft laufen
   über den Daumen-Weg (`daumenSpeichern`, gezielte Einzelzeile).
   **Nachgemessen: Papierkorb → Neuladen → weg**, DB bestätigt.

**Die Auftragsfrage „kann der Daumen jetzt über die RPC?" — Nein,
und das ist richtig so:** `[read]` Die RPC ist ein
Satz-Ersetzungs-Vertrag für die Einstellungsseite; ein
Einzelzeilen-Aufruf würde alle nicht mitgeschickten settings-Zeilen
löschen. Es bleiben **bewusst zwei Schreibwege** — Satz für die
Kachel, Einzelzeile für den Daumen — unter EINER Bedienung; C-156
macht die Koexistenz erstmals gefahrlos, weil die Herkünfte getrennt
sind. Im Code dokumentiert, per Test festgehalten.

---

## Wie das Klickmuster jetzt aussieht

**Eine Regel überall: tippen schaltet weiter, und der Wert steht am
Element.**

| Kachel | vorher | jetzt |
|---|---|---|
| Kategorien (13 Wurzeln + gesetzte Unterkategorien) | vier unbeschriftete 22-px-Knöpfe je Zeile | **ein** Zyklusknopf mit Wert: `—` → `+50` → `−50` → `—`, farbig, mit Titel-Hinweis |
| Individual foods | **keine Bedienung** — Anzeige mit einem Seed-Eintrag | **Suchfeld in der Kachel** (gleiche Route wie Suchseite/Dialog, bewusst OHNE Vorlieben-Filter: wer abwerten will, muss finden können) · Treffer antippen = `+100` · Zyklusknopf `+100`/`−100` je Zeile · Papierkorb · Daumen-Einträge tragen eine „Daumen"-Pill |
| Tag-Merkmale | Zyklus mit nacktem `+`/`−` | Zyklus mit **`+30`/`−30` im Knopf**; ⊘-Merkmale (aus der Allergieliste) sind jetzt **gesperrt** statt heimlich umgewandelt — `[cmd]` vorher machte ein Klick auf ⊘ aus dem Ausschluss ein „mag ich" |
| Allergene | Zählklicks, Stufe nur farblich | Zyklus bleibt (Toms G-65-Entscheidung, 20 × 3 Stufen), das Stufenwort steht in der Pille (`Sensibel`/`Allergie`), Titel-Hinweis am Knopf |
| Diet type / Presets | Umschalt-Pillen | unverändert — passt ins Muster (an/aus am Element ablesbar) |

`[cmd]` **Je Kachel gemessen: setzen → neu laden → steht.** Diet,
Allergen, Kategorie (beide Richtungen über den Zyklus), Tag, Preset,
Individual food (aufnehmen `+100`, Zyklus auf `−100`, beides nach
Reload). Der Enkel-Fall bleibt: „Kekse & Plätzchen" steht unter
„Gesetzt · Unterkategorien" mit demselben Zyklusknopf.

---

## Wo die Vorlieben wirken

| Ort | Stand | Beleg |
|---|---|---|
| **Erfassungsdialog** (`HinzufuegenModal`, `prefs=1`) | **wirkt** (G-13) | `[cmd]` `mandel` 64 → **0**, `preferences_hidden` 64 (Seed-Allergie `tree_nuts`) · Kategorie-Ranking: SÜSSES & SNACKS auf −50 → **„Honig" (SÜSSES) fällt von Rang 1 aus den Top-8, „Honigmelone" (OBST) übernimmt Rang 1**; `honig` 24 → 21 Treffer (3 hart verborgene) |
| Food-DB-Trefferliste (`tab=foods`) | Ranking **bewusst aus** — Katalog (G-13-Entscheidung); die G-73-Allergen-Schalter wirken clientseitig auf die geladene Seite | `[cmd]` kein `prefs`-Parameter im Aufruf (`tab-foods.tsx:288-297`); der irreführende Kommentar („sobald C-94 filtert") ist korrigiert |
| Startliste (`page.tsx:133`) | bewusst aus — Katalog; bei leerer Anfrage filtert C-94 zusätzlich `strong_avoid`, wirkte also breiter | `[read]` `food-search.ts:613-629` |
| Suchseite `/v2/nutrition/suche` | bewusst aus — **das ist der Bewertungsort** (Daumen, G-67): eine gefilterte Suche versteckte genau die Kandidaten, die man abwerten will | `[cmd]` kein `prefs` im Aufruf (`suche/ansicht.tsx:63`) |
| Planner und Rezepte (G-97) | **kein Ansatzpunkt** — dort findet keine Lebensmittelsuche statt; Planeinträge kommen aus Rezepten und Bestand | `[cmd]` Grep über `tab-planner-echt.tsx`: kein `fetch`, kein `food_search` |
| MealCam | **kein Ort** — Modal ist Entwurf ohne Modell | `[cmd]` `modale.tsx:21` „MealCam hat kein Modell" |

`[cmd]` **Der veraltete Hinweis ist ersetzt:** Die Priority-Kachel
sagte „wirkt aber noch nicht in der Suche" — falsch seit C-94. Jetzt
steht da, WO es wirkt (Erfassen) und wo bewusst nicht (Kataloge). Der
Wächter-Test, der den alten Wortlaut festschrieb, prüft jetzt beide
Hälften der neuen Aussage.

**Ein Messbefund, der erst wie ein Fehler aussah:** `[cmd]`
`schokolade` liefert mit Vorlieben 163 → **1** Treffer. Das ist NICHT
die Kategorie (−50 wertet nur ab): Der Seed führt `ultra_processed`
unter `general_exclusions`, und 075 behandelt einen General-Ausschluss
mit Tag-Entsprechung als **harten** Ausschluss (`075:382-390`) —
Schokolade ist fast durchweg hochverarbeitet markiert. Verhalten
korrekt, Stärke aber am Element nicht ablesbar (siehe „Was offen
bleibt").

---

## Was offen bleibt

- **`ultra_processed` wirkt härter, als die Kachel sagt:** Der Eintrag
  steht unter „Weitere gesetzte Ausschlüsse" ohne Hinweis, dass er wie
  ein Allergen hart filtert (163 → 1 bei `schokolade`). Kleiner
  Folgetext an der Pille — oder Toms Entscheidung, ob ein
  Verarbeitungsmerkmal überhaupt hart ausschliessen soll.
- **Intoleranzen (Stufe „Sensibel") schliessen nur bei leerer Anfrage
  aus** (`strong`, `075:453-455`), sonst werten sie −25 ab — gewollt
  laut C-94, aber nirgends für den Nutzer erklärt.
- **Rezept-/Planner-Zutatensuche gibt es noch nicht** — sobald G-97
  dort ein Suchfeld bekommt, stellt sich die `prefs=1`-Frage neu (der
  Erfassungs-Grundsatz „was gewählt wird, wird gegessen" spricht für
  an).
- **Food-DB-Trefferliste:** ob der Katalog einen sichtbaren
  „mit meinen Vorlieben"-Schalter bekommt (serverseitig statt der
  G-73-Client-Ausblendung), ist eine Produktfrage — nicht Teil von
  G-104 („Food DB nicht umbauen").
- **Zwei Konsolenfehler je Seitenaufruf** sind die bekannte
  `data-mode`-Hydrationswarnung der Web-Schale (Layout), nicht dieses
  Tabs; die **eine** gerenderte Attrappenmarke auf der Seite ist der
  Buddy-Orb der Schale (G-02). Der Preferences-Tab selbst rendert
  **null** Attrappen.

## Nachweise

| Behauptung | Beleg |
|---|---|
| Jede Kachel speichert | `[cmd]` Messläufe (`backup/g104-*.mjs`): setzen → neu laden → steht, sechs Kacheln inkl. Individual foods; Fehlerzeile leer |
| `source` überlebt | `[cmd]` Haferflocken-Daumen (`search_thumb`) blieb nach **drei** vollen Kachel-Schreibläufen unverändert in der DB — neben `settings`-Zeilen |
| Daumen-Zeile löschbar (Fix) | `[cmd]` Papierkorb → Reload → 0 Zeilen; DB ohne `search_thumb`-Rest |
| Allergen wirkt | `[cmd]` `mandel` ohne Vorlieben 64, mit 0, `preferences_hidden` 64 |
| Kategorie wirkt im Ranking | `[cmd]` `honig`: „Honig" (SÜSSES, Rang 1) aus den Top-8, „Honigmelone" (OBST) auf Rang 1; 24 → 21 |
| Zeilenschutz | `[cmd]` `test-user@lumeos.local`: sieht weder Quark noch Weissen Reis, SÜSSES steht auf `—`, `mandel` mit `prefs=1` = **64** (dev: 0) |
| Ein Klickmuster | `[cmd]` Wächter-Tests: Zyklus + Wert am Element + kein Drei-Schalter-Rückfall + Aufnahmeweg |
| Tests | `[cmd]` `pnpm --filter @lumeos/web test`: **441/441** (zwei Wächter auf die neue Wahrheit nachgezogen, zwei neue für G-104) |
| Typen | `[cmd]` `pnpm --filter @lumeos/web typecheck` grün |
| Bilder | `backup/g104/prefs-{1440,375}-{hell,dunkel}.png` — mit gesetztem Demo-Zustand; Dev-Konto danach auf den Seed-Stand zurückgeräumt (`[cmd]` Endbestand = 3 Seed-Items, alle Probereste entfernt) |

## Was nicht angefasst wurde

- **Suche/C-94, Food DB, Planner, Startliste** — nur geprüft und
  Kommentar/Texte berichtigt; kein `prefs`-Umbau.
- **Kein Schema** — C-156 ist Codex' Arbeit und wurde nur benutzt.
- **`packages/ui`, `supplements/`** — fremde Bereiche.
- `erfassen.tsx` (die tote Datei ohne Importeure, G-13-Befund) bleibt
  liegen — Löschliste, nicht dieser Auftrag.
