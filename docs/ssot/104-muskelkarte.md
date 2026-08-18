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
| **23 Flächen-IDs** | davon 17 Muskelgruppen (G-44 nachgezählt), statt 18 Blobs |
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

Recovery führt 18 Kürzel, die Karte 17 einfärbbare Gruppen (G-44
nachgezählt; hier stand zuerst „21 Gruppen"). **Jede Zeile ist
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

# Nachtrag G-44 (2026-08-18): Was jede der IDs ist

`[read]` **Tom, 2026-08-18:** *„Es fehlen diverse Aktivierungen von
Parts, dass man den ganzen Body erkennt. Recheck, ob alle Muskeln in
der Grafik auch in der Liste auftauchen."*

## Zuerst die Zählung berichtigt

`[cmd]` **Die Karte führt 39 IDs, nicht 41.** Zur Laufzeit gezählt
(`Object.keys` auf die geladenen Module), nicht per `grep` — genau daran
ist in G-26 schon `upper-back` durchgefallen.

Die beiden Mehr in der Auftragszählung sind erklärbar:

- **`label` und `side`** sind **Eigenschaften** der
  Injektionsort-Objekte, keine IDs.
- **`both` in der Zuordnung** gibt es nicht. Es ist der *Wert* von
  `side` bei beidseitigen Muskeln und steht nur in einem Kommentar
  (`muskel-zuordnung.ts:34`). `[cmd]` Nachgesehen: kein Eintrag mit
  diesem Schlüssel.

## Was jede der 39 IDs ist

Vollständig in `EINORDNUNG` (`recovery/muskel-zuordnung.ts`), hier die
Zahlen je Art:

| Art | Anzahl | |
|---|---|---|
| **Muskelgruppe** | **17** | einfärbbare Flächen |
| **Teilstück** | **16** | Injektionsorte — Punkte, keine Flächen |
| **Nicht-Muskel** | **6** | Kniescheibe, Kopf, Haare, Hände, Knöchel, Füße |
| | **39** | |

### Die 17 Muskelgruppen

`chest` · `abs` · `obliques` · `biceps` · `triceps` · `deltoids` ·
`trapezius` · `neck` · `forearm` · `adductors` · `quadriceps` ·
`calves` · `upper-back` · `lower-back` · `gluteal` · `hamstring` ·
**`tibialis`**

### Die 16 Injektionsorte und ihre Gruppe

| Ort | gehört zu | | Ort | gehört zu |
|---|---|---|---|---|
| `delt_l/r` | `deltoids` | | `glute_l/r` | `gluteal` |
| `pec_l/r` | `chest` | | `vg_l/r` | `gluteal` |
| `bicep_l/r` | `biceps` | | `lat_l/r` | `upper-back` |
| `quad_l/r` | `quadriceps` | | `tricep_l/r` | `triceps` |

Zwei Vermutungen aus dem Auftrag ließen sich klären:

- **`vg_*` ist „Ventrogluteal"** — eine anerkannte Injektionsstelle im
  vorderen oberen Gesäßbereich. `[cmd]` Die Vorlage beschriftet sie
  selbst so (`koerperkarte-pfade.ts:256`). **Kein Vastus, keine Wade.**
- **`lat_*` braucht keine Sammelgruppe.** `[cmd]` Der Latissimus hat
  keine eigene Fläche — er steckt in `upper-back`, das mit sechs Pfaden
  den ganzen oberen Rücken zeichnet. Die zwei Punkte liegen darüber.

## Der Test, der eine unzugeordnete ID zum Fehler macht

`[cmd]` Der bisherige Test hielt eine **Lückenliste** gegen eine feste
Erwartung — das fängt nur, was schon als Lücke bekannt ist. Eine neue
ID in der Karte fällt durch.

`karten-ids.test.ts` dreht die Richtung um: **er geht von den IDs der
Karte aus** und verlangt für jede einen Eintrag. Drei Prüfungen, jede
absichtlich zum Fehlschlagen gebracht:

| Prüfung | Gegenprobe |
|---|---|
| jede ID ist eingeordnet | neue ID `soleus` eingebaut → *„Diese IDs der Karte sind nicht eingeordnet: soleus"* |
| die Einordnung erfindet keine IDs | Eintrag `lats` erfunden → *„zeigt auf IDs, die die Karte nicht kennt"* |
| Recovery zeigt nur auf Gruppen | `chest → pec_l` gesetzt → *„das ist teilstueck, keine Gruppe"* |

Dazu `zaehlen.test.ts`: die Aufteilung 17/16/6 steht fest. `[cmd]`
Gegenprobe: `hands` zur Gruppe erklärt → zwei Prüfungen fallen.

---

## Was die Karte nicht kann

### `tibialis` — die einzige Gruppe ohne Recovery-Kürzel

`[cmd]` Die Karte **zeichnet** den Schienbeinmuskel,
`MUSCLE_GROUPS_BODYMAP` (`motor.ts:28`) **führt ihn nicht**. Er bleibt
deshalb grau.

**Das ist eine Lücke auf der Datenseite, kein Zuordnungsfehler.** Ein
Kürzel zu ergänzen hieße, eine Muskelgruppe zu erfinden, die das Modul
nicht misst — dieselbe Überlegung wie bei `abductors`. **Nicht selbst
entschieden; wenn Recovery den Schienbeinmuskel führen soll, ist das
eine Produktentscheidung.**

### `abductors` — bleibt eine echte Lücke

`[cmd]` Die Karte kennt nur `adductors` (Innenseite). `[read]` **Nicht
auf `gluteal` gelegt** — das ist ein anderer Muskel. In G-26 so
entschieden, bleibt so.

### Am Bildschirm nachgezählt

`[cmd]` `/v2/recovery`, 2026-08-18, 23 gerenderte Muskel-IDs:

| | |
|---|---|
| **16 eingefärbt** | alle Gruppen mit Recovery-Kürzel |
| **5 grau** | `tibialis`, `knees`, `hands`, `ankles`, `feet` |
| **2 fester Ton** | `head`, `hair` |

Bei 375 / 768 / 1440 px identisch, kein waagerechtes Scrollen.

> **Zwischenfall beim Messen:** Der erste Durchgang zählte **24** IDs
> und fand `soleus` — die ID aus meiner eigenen Gegenprobe. Die Datei
> war zurückgesetzt, **der Entwicklungsserver lieferte aber noch den
> alten Build.** Erst nach erzwungenem Neuübersetzen stimmte die Zahl.
> `[read]` Derselbe Fehler wie in G-05, wo ein zwei Tage alter Prozess
> eine ganze Sitzung lang veraltete Zustände lieferte.

---

## Zwei Gestaltungsfragen — gemeldet, nicht entschieden

### 1. Die grauen Teile heben sich nicht ab

`[read]` Toms Anlass war *„dass man den ganzen Body erkennt"*. `[cmd]`
Gemessen, warum das nicht gelingt:

| | Hintergrund | graues Teil | Unterschied |
|---|---|---|---|
| **dunkel** | `oklch(0.223 …)` | `oklch(0.235 …)` | **0,012** |
| **hell** | `oklch(0.987 …)` | `oklch(0.975 …)` | **0,012** |

**Ein Helligkeitsunterschied von 0,012 ist praktisch unsichtbar.**
Hände, Füße und Schienbein verschwinden im Kartenhintergrund; die linke
Hand wirkt abgetrennt. Das ist in beiden Modi gleich.

**Nicht selbst geändert** — die Grundfläche ist `--surface-2`, und jede
Änderung daran wirkt auf die ganze Oberfläche. Möglich wären: ein
anderer vorhandener Token für Nicht-Muskeln (`--surface-hover` liegt
0,02 höher, `--border` 0,045), oder eine dünne Kontur um die
Nicht-Muskeln. **Beides ist Gestaltung, keine Messung.**

### 2. Der Umriss der Vorlage ist kaputt

`[cmd]` **Der Körperumriss endet bei y=815, die Muskeln reichen bis
y=1340.** Von der Oberschenkelmitte abwärts hat die Figur **keine
Kontur** — deshalb lösen sich Beine und Füße auf.

**Der Fehler steckt in der Vorlage, nicht in der Übernahme.** `[cmd]`
Im Mockup selbst gemessen: dort endet der Umriss sogar schon bei y=435.
`[cmd]` Von 200 Pfadbefehlen in `UMRISS_VORNE` sind **118 fehlerhaft** —
`C`-Befehle mit vier statt sechs Zahlen. Der Browser hört an der ersten
kaputten Stelle stillschweigend auf zu zeichnen.

**Zu reparieren wäre der Pfad in der Mockup-Quelle**, nicht in der
Übernahme — sonst driftet beides auseinander. Das ist ein eigener
Auftrag und braucht die Originaldatei der Figur.

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

`[cmd]` **Stand nach G-44:** 16 Tests in drei Dateien
(`muskel-zuordnung.test.ts`, `karten-ids.test.ts`, `zaehlen.test.ts`),
alle grün — jeder absichtlich zum Fehlschlagen gebracht, bevor er als
Sicherheit gilt.

`[cmd]` **Alle Tests gruen: 252 von 252** (`pnpm test` in `apps/web`,
2026-08-18) — darin die 16 der Koerperkarte.

`[cmd]` **`pnpm gate` bricht dennoch ab, ausserhalb dieses Auftrags:**
die Encoding-Pruefung meldet 40 Ersetzungszeichen (U+FFFD) in
`supabase/README.md`. Die Datei wird gerade von der anderen Seite
bearbeitet und ist **nicht angefasst**. `[cmd]` Nachgesehen: keine der
in G-44 geaenderten Dateien traegt ein U+FFFD.

`[cmd]` Am Bildschirm geprüft: `/v2/recovery` bei 375 / 768 / 1440 px,
Hell- und Dunkelmodus, Klick auf einen Muskel öffnet das richtige
Fenster. **Kein waagerechtes Scrollen der Karte** bei keiner Breite.

`[cmd]` Zählung: **Recovery 71 / 71.**

**Nichts ist committet oder gestaged.**
