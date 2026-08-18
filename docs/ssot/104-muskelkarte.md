# 104 — Die Muskelkarte

**Stand:** 2026-08-18 · **Auftrag:** G-26 · **Herkunft:** `[cmd]` am
Bildschirm gemessen, Zuordnungen per Test belegt.

`[read]` **Tom, 2026-08-17:** *„Da tauchen zum ersten Mal Muscle
Readiness etc. als Grafiken auf, die sind oberhässlich. Dazu habe ich
evaluiert, was ich will."* Und: *„Die Muskelkomponente nehmen wir sicher
mit rein und verwenden sie, wo gebraucht."*

---

## Vorher zwei Sätze zur Ausgangslage

Der Auftrag ging davon aus, dass die Muskelkarte **fehlt** — G-38 hatte
Recovery mit 67/71 gemessen und geschrieben, alle vier Fehlenden seien
die Karte.

`[cmd]` **Das war falsch.** Alle vier waren gebaut, nur anders benannt:

| Vorlage | war schon da als |
|---|---|
| `BodyMap18` | `Koerperkarte` in `recovery/koerperkarte.tsx` |
| `SILHOUETTE_PATH` | gleichnamig in `recovery/motor.ts` |
| `MuscleDetailModal2` | `MuscleDetailModal` in `recovery/modale.tsx` |

Die Umbenennungstabelle des Zählskripts war unvollständig, und **das
Skript meldet eine fehlende Zuordnung als fehlendes Bauteil.** Beides
ist nachgetragen; `101-vollstaendigkeit.md` trägt die Korrektur.

**Der Auftrag bleibt richtig, nur seine Begründung ändert sich:** Es
ging nie darum, eine Lücke zu füllen, sondern eine hässliche
Darstellung durch eine gute zu ersetzen. Genau das sagt Toms Satz auch.

---

## Was aus dem Mockup übernommen wurde und was angepasst

**Quelle:** `apps/web/public/mockup/components/MuscleBodyMap.js` —
593 Zeilen, Stand 2026-04-28.

### Übernommen

| | |
|---|---|
| **21 Muskelgruppen** | statt 18 Flächen; anatomische Pfade, nicht Blobs |
| **Zwei Ansichten** | vorne und hinten, mit eigenen Umrissen |
| **Fünf Aufrufarten** | Ermüdung · Aktivierung · Injektion · Punkte · kombiniert |
| **16 Injektionsorte** | mit Prozentkoordinaten je Ansicht |
| **Die Schwellen** | 25/60 % bei Ermüdung, 3/7/14 Tage bei Injektionen |

`[cmd]` **Die Pfaddaten sind mechanisch übernommen, nicht abgetippt** —
rund 200 Zeilen SVG. Ein Tippfehler in einer Bézierkurve fällt beim
Lesen nicht auf, sondern erst als verzogener Muskel. Sie liegen in
`packages/ui/src/koerperkarte-pfade.ts`, getrennt vom Code, weil sie
Datenhaltung sind.

### Angepasst

1. **`window.MuscleBodyMap` als IIFE → React-Komponente.** Der Mockup
   baut Knoten per `document.createElementNS` und hängt Ereignisse von
   Hand an. In React kollidiert das mit dem Rendern.
2. **Feste Farben → Tokens.** Nächster Abschnitt.
3. **Tastaturbedienung ergänzt.** Ein SVG-Pfad mit `onClick` ist per
   Tastatur nicht erreichbar — dieselbe Begründung wie bei `Tabs`.
4. **`ausgewaehlt` ergänzt.** Der Mockup kennt es nicht, der abgelöste
   Entwurf schon, und der Check-in benutzt es. Ergänzt, statt es beim
   Umbau zu verlieren.

### Warum `packages/ui` und nicht je Modul

`[cmd]` Drei Module brauchen sie: Recovery (Ermüdung), Training
(Aktivierung), Supplements (Injektionen). Je Modul nachzubauen hieße,
dieselben 200 Zeilen Pfaddaten dreimal zu halten.

---

## Wie die Farbskala auf die Tokens kam

`[cmd]` Der Mockup trägt **19 feste Hex-Werte**. Die Zuordnung ist nicht
erfunden, sondern folgt der Bedeutung, die der Mockup den Farben selbst
gibt — seine Legende sagt „Ready / Caution / Rest".

### Was sauber fällt

| Mockup | Token | Beleg |
|---|---|---|
| `#10B981` grün | `--pos` | Legende „Ready" |
| `#F59E0B` gelb | `--warn` | Legende „Caution" |
| `#EF4444` rot | `--neg` | Legende „Rest" |
| `#6b7280` grau | `--fg-dim` | „nie benutzt" — kein Ampelzustand, sondern ein fehlender Wert |
| `#b8bec8` Grundfläche | `--surface-2` | inaktiver Muskel |
| `#64748b` Umriss | `--border-strong` | Linie |

Beide Themes führen `--pos` / `--warn` / `--neg` (`lume.css:18-20` hell,
`:87-89` dunkel). `[cmd]` Am Bildschirm geprüft: der Dunkelmodus färbt
die Figur mit, ohne dass etwas nachgezogen werden musste.

### Wo es eng wurde — und wie es ohne neuen Token ging

**Die Aktivierungsskala hat vier Stufen**, das Theme auf dieser Achse
drei. Der Mockup staffelt `#fde047` · `#fb923c` · `#ef4444` · `#991b1b`.

**Gelöst ohne neuen Token:** die vierte Stufe entsteht aus `--neg` per
`color-mix(in oklch, var(--neg) 70%, black)` — dieselbe Farbe, dunkler.
Das ist die Technik, die `v2.css` an vielen Stellen benutzt, kein neuer
Wert.

**`[read]` Wenn Tom die vierte Stufe als eigenen Token will, ist das
seine Entscheidung** — gemeldet, nicht selbst getroffen.

### Zwei Farben, die absichtlich Festwerte bleiben

`[cmd]` `#c8c0b8` (Haut) und `#6b5b4e` (Haare) im `fixedFill` der Daten.

**Sie tragen keine Bedeutung und sind kein Flächenton, sondern
gegenständliche Farbe.** Ein Token dafür wäre ein neuer Token — und der
Auftrag sagt: keine erfinden. Sie stehen deshalb als Festwert in der
Datendatei und hier im Bericht.

**Am Bildschirm sichtbar:** der Kopf bleibt hautfarben, in beiden Modi.
Wenn das stört, ist die Antwort ein Token oder ein Weglassen des
Kopfes — beides eine Entscheidung, keine Messung.

### Die Zahlen dazu

`[cmd]` **`rgba` in `v2.css` bleibt bei 4** — unverändert. Die
Komponente färbt über Inline-Attribute im SVG, nicht über CSS.
`[cmd]` **Keine neuen Farbtokens.** Die elf Hex-Werte, die in
`koerperkarte.tsx` noch stehen, sind sämtlich Kommentare, die den
Ursprungswert festhalten (`// Mockup #10B981`).

`[cmd]` **`v2.css` ist über den Erzeuger gewachsen, nicht von Hand:**
die fünf Klassen stehen im `zusatz`-Block von
`klassen-uebernehmen.mjs`. Ein Lauf hat 44 Zeilen ergänzt und **keine
gelöscht** — in G-19 war das anders ausgegangen.

---

## Die Zuordnung Recovery → Karte

Recovery führt 18 Kürzel, die Karte 21 Gruppen. **Jede Zeile ist
geprüft, keine geraten** (`recovery/muskel-zuordnung.ts`).

**17 von 18 kommen an.** Eine Lücke bleibt:

- **`abductors`** (Außenseite des Oberschenkels) — die Karte führt nur
  `adductors` (Innenseite). **Nicht auf `gluteal` gelegt:** das ist ein
  anderer Muskel. Der Wert verschwindet, statt falsch zu landen.

Zwei Fälle brauchten eine Entscheidung:

- **`front_deltoids` / `back_deltoids` → `deltoids`.** Die Karte führt
  die Schulter einmal mit `side:'both'` und zeichnet vorne und hinten
  getrennt. Beide Kürzel zeigen auf dieselbe Gruppe; **der schlechtere
  Wert gewinnt** — eine Karte, die den besseren zeigt, beruhigt
  fälschlich.
- **Rückweg beim Klick.** Die Karte meldet ihre eigene ID, das
  Muskeldetail-Fenster schlägt in `MUSCLE_STATE` nach und braucht das
  Recovery-Kürzel. Ohne diese Richtung öffnet ein Klick auf die
  Schulter ein leeres Fenster.

### Der Beinahe-Fehler

`[cmd]` Der erste Durchgang führte `upper_back` und `lower_back` als
„keine Entsprechung" — **zu Unrecht.** Die Karte hat beide, nur mit
**Bindestrich** geschrieben (`upper-back`); meine Suche nach `[a-z_]+`
traf ihn nicht.

**Am Bildschirm wären zwei Muskelgruppen dauerhaft grau geblieben, ohne
Fehlermeldung.** Aufgefallen ist es erst beim Zählen der gerenderten
Gruppen im Browser — nicht beim Lesen des Codes. Deshalb prüft jetzt
ein Test die Liste der Lücken gegen eine feste Erwartung.

### Die Richtungsumkehr

`[cmd]` **Recovery führt Bereitschaft (100 = erholt), die Karte
Ermüdung (100 = platt).** `alsErmuedung()` dreht um. Ohne diese
Umrechnung stünde der Körper auf Rot, wenn er erholt ist. Ein Test hält
das fest.

**Beim Check-in nicht:** dort ist Stufe 0 = kein Muskelkater, also
bereits die Ermüdungsrichtung. Nur die Skala 0–3 wird gestreckt.

---

## Wo sie sonst noch hingehört

### Training — geht, aber nicht in diesem Durchgang

`[read]` Der Auftrag: *„erst Recovery sauber, dann melden — nicht beides
halb."* Recovery ist sauber, hier ist die Meldung.

`[cmd]` Was dafür bereitliegt:

- `AktivierungsKarte` ist **gebaut und exportiert** — die vier Stufen
  der Vorlage, mit Legende.
- Die Vorlage führt `MuscleFatigueHeatmap` und `MuscleReadinessWidget`.
- `training.exercise_muscles` hat **6.624 Zuordnungen**.
- `MUSCLE_SLUG_MAP` in `recovery/motor.ts` übersetzt bereits von
  Trainings-Muskelnamen („Pectoralis Major") auf Recovery-Kürzel.

**Was fehlt:** eine Zuordnung von `training.exercise_muscles` auf die
Karten-IDs. Der Umweg über `MUSCLE_SLUG_MAP` +
`RECOVERY_ZU_KARTE` geht, ist aber zwei Übersetzungen hintereinander —
sauberer wäre eine eigene Tabelle, gemessen an den 6.624 Zeilen.

### Supplements — nicht, und zwar mit Grund

`[cmd]` `InjektionsKarte` ist gebaut und exportiert, mit allen 16
Injektionsorten und der Fünf-Stufen-Skala nach Tagen. **Sie wird
nirgends aufgerufen.**

Der Injections-Tab ist nicht gebaut (G-31), und `renderInjection` gehört
dorthin. Der Auftrag sagt das ausdrücklich. **Wer G-31 baut, findet die
Komponente fertig vor.**

### Was noch offen ist

- **`renderCombined`** (Muskeln plus Punkte-Overlay) ist in der
  Grundkomponente möglich (`muskeln` und `punkte` zusammen), aber es
  gibt keine Kurzform dafür. Erst bauen, wenn jemand sie braucht.
- **`renderPoints`** (beliebige Punkte, z. B. Schmerz-Tracker) ebenso:
  die Grundkomponente kann es, eine benannte Variante fehlt.

---

## Attrappe bleibt Attrappe

`[cmd]` `recovery` hat **kein Schema für Muskelzustände** —
`recovery.checkins` gibt es seit `120`, Muskeldaten nicht. Die Karte
zeigt die erfundenen Werte der Vorlage; **die Kacheln tragen weiterhin
ihre Attrappenmarke.**

`[read]` Was hier besser wurde, ist die Darstellung, nicht die
Datenlage.

---

## Zustand

`[cmd]` `pnpm gate` — 8 von 8 Aufgaben grün, **237 Web-Tests + 7
Admin-Tests**, kein Fehlschlag. Davon 10 neu (`muskel-zuordnung.test.ts`),
jeder absichtlich zum Fehlschlagen gebracht, bevor er als Sicherheit gilt.

`[cmd]` Am Bildschirm geprüft: `/v2/recovery` bei 375 / 768 / 1440 px,
Hell- und Dunkelmodus, Klick auf einen Muskel öffnet das richtige
Fenster. **Kein waagerechtes Scrollen der Karte** bei keiner Breite.

`[cmd]` Zählung: **Recovery 71 / 71.**

**Nichts ist committet oder gestaged.**
