# Suchabdeckung über 152 Lebensmittel: die Messung mit Erwartungen

`[cmd]` Erhoben 2026-08-15 gegen die laufende lokale Instanz
(`nutrition.foods`, 7.140 Zeilen, 95 `sort_weight`-Stufen — der Stand
nach C-38). Nur lesende Abfragen.

- Messskript: `supabase/_pipeline/_validierung/suche-abdeckung-messen.ts`
- Sollwerte: `supabase/_pipeline/daten/abdeckung-sollwerte.json`
- Erzeuger der Sollwerte (lief **einmal**):
  `supabase/_pipeline/_ableitung/abdeckung-sollwerte-erzeugen.ts`
- Gegenprobe mit der alten Bauart:
  `supabase/_pipeline/_validierung/suche-abdeckung-altbauart.ts`

Anlass: C-23. Die dort genannten 48,0 % stammen von **vor** den
Sortierstufen aus Block 32 und vor C-38 und trugen seit gestern
`[annahme]`.

---

## Das Ergebnis in einer Tabelle

| | alte Bauart, 2026-08-14 | alte Bauart, **heute** | **neue Bauart, heute** |
|---|---|---|---|
| Sollwert auf Platz 1 | `[cmd]` 48,0 % | `[cmd]` **46,1 %** | `[cmd]` **79,5 %** |
| in den ersten drei | — | — | `[cmd]` 92,1 % |
| in den ersten zehn | `[cmd]` 90,8 % | `[cmd]` 90,1 % | `[cmd]` 97,4 % |
| gar kein Treffer | `[cmd]` 0 % | `[cmd]` 0 % | `[cmd]` 0 % |
| ohne Sollwert | — | — | `[cmd]` 1 von 152 |

**Die mittlere Spalte ist die wichtigste Zahl dieses Berichts.**

`[cmd]` Wiederholt man die **alte** Bauart unverändert auf der
**heutigen** Datenbank, kommen 46,1 % heraus — also **kein Zugewinn**
gegenüber den 48,0 % vom 2026-08-14, eher ein Hauch weniger.

Der Sprung auf 79,5 % entsteht damit **nicht durch C-38**, sondern
dadurch, dass die neue Bauart eine andere Frage stellt. Wer beide Zahlen
nebeneinander liest, darf daraus nicht „C-38 hat die Abdeckung von 48
auf 80 gehoben" machen. Das wäre falsch.

`[annahme]` Warum C-38 auf dieser Stichprobe nichts bewirkt, während der
MealCam-Massstab von 31 auf 34 stieg: die MealCam-Zutaten sind
Grundnahrungsmittel, für die die neue Formel gebaut wurde; diese
Stichprobe besteht zu 28 % aus Fertiggerichten. **Gemessen ist diese
Erklärung nicht.**

---

## Warum die alte Bauart die falsche Frage stellte

`[read]` Die erste Fassung erzeugte aus dem Namen eines Lebensmittels
eine Anfrage und prüfte, ob **dasselbe** Lebensmittel in der
Trefferliste auftaucht. Das misst, ob ein Name zu sich selbst
zurückfindet — nicht, ob ein Mensch findet, was er sucht.

`[cmd]` **113 der 152 gezogenen Lebensmittel (74 %) sind zubereitete
Varianten.** Beispiele:

```
G582182  Zucchini gebraten ohne Fett (Pfanne)   -> Anfrage "zucchini"
C111062  Weizen ganzes Korn, gekocht, gebacken  -> Anfrage "weizen ganzes"
F010600  Mehrfruchtsaft                          -> Anfrage "mehrfruchtsaft"
```

Wer `zucchini` tippt, meint `Zucchini roh` (G582100) — nicht die
Pfannenvariante. **In 74 % der Fälle war das gezogene Lebensmittel also
gar nicht der richtige Sollwert.** Die alte Zahl bestrafte die Suche
dafür, dass sie das Richtige lieferte.

Dazu kam ein zweiter Fehler in der Anfragebildung: `[cmd]` **42 der 152
Anfragen trugen ein Beiwort aus dem Bestandsnamen**, das niemand tippt —
`zucchini fett`, `schnittkaese mind`, `mornaysauce von`,
`fenchelblatt bologneser`. Diese 32 Wörter sind jetzt aus der
Anfragebildung entfernt.

---

## Die Sollwertregel, ausgeschrieben

Zu jeder Anfrage ist der Sollwert die **Grundform derselben Art**:
Zubereitungscode `100` oder `000`, deren Name alle Anfragewörter trägt,
bei mehreren die mit dem höchsten `sort_weight` und kürzesten Namen.
Gibt es keine solche Grundform, ist der Sollwert das gezogene
Lebensmittel selbst — dann ist es die einzige Form.

`[cmd]` So verteilen sich die 152:

| | |
|---|---|
| Sollwert = Grundform (anderer Eintrag als der gezogene) | **99** |
| Sollwert = das gezogene Lebensmittel (einzige Form) | **52** |
| ohne brauchbare Anfrage, Sollwert offen gelassen | **1** |

`[cmd]` In **70 Fällen** weicht der Sollwert vom gezogenen Lebensmittel
ab — genau die Fälle, die die alte Bauart falsch bewertet hat.

**Die Liste steht als Datendatei und wird nicht zur Laufzeit
gerechnet.** `[read]` Eine Prüfung, die ihre Sollwerte aus dem Prüfling
ableitet, bestätigt jeden Zustand; dieser Fehler ist im Repo schon
passiert. Der Erzeuger lief **einmal**, das Ergebnis wurde geprüft und
liegt seitdem fest.

Der eine offene Sollwert ist ausgewiesen und wird getrennt gezählt:
`E605000 Hefeteig, gesalzen, mit Milch 3,5 % Fett, roh` — daraus lässt
sich keine Anfrage bilden, die ein Mensch tippen würde. `[read]` Ein
offener Sollwert ist ehrlich, ein geratener schlimmer als keiner.

---

## Wo die 152 Begriffe herkommen

**Sie sind nicht handverlesen.** `[cmd]` Es ist eine **systematische
Stichprobe**: jedes 47. Lebensmittel nach `bls_code` sortiert, was bei
7.140 Einträgen genau 152 ergibt. Deterministisch und wiederholbar —
derselbe Lauf zieht dieselben 152.

Das unterscheidet sie grundlegend von den 37 MealCam-Zutaten, die nach
der Praxis eines Kraftsportlers ausgewählt wurden.

**Sie bildet den Bestand ab, nicht die Praxis.** `[cmd]` Die
Zusammensetzung folgt dem Bestand fast exakt:

| | Stichprobe | Bestand |
|---|---|---|
| Fertiggerichte (X/Y) | `[cmd]` 42 von 151 = **28 %** | `[cmd]` 2.050 von 7.140 = **29 %** |

Je Warengruppe: `[cmd]` X 24 · Y 18 · U 15 · G 12 · T 11 · D 10 · V 10 ·
W 8 · F 6 · M 6 · C 5 · S 5 · B 4 · K 4 · H 3 · P 3 · E 2 · N 2 · R 2 ·
Q 1.

**Das ist zugleich ihre grösste Schwäche.** Der Bestand ist zu 29 % aus
Fertiggerichten, aber niemand sucht `mornaysauce von bechamelsauce` oder
`endiviensalat mit essigmarinde`. Die Stichprobe misst also zu einem
knappen Drittel Anfragen, die in der Praxis nicht vorkommen.

`[cmd]` 152 von 7.140 sind **2,1 %** des Bestands.

---

## Die Arbeitsliste

`[cmd]` 31 Fälle stehen nicht auf Platz 1. Vollständig im Skriptlauf;
hier die Muster.

**Fälle, in denen die Suche recht hat und mein Sollwert falsch liegt:**

```
PLATZ4  rinderfilet     -> Suche liefert "Rind Filetsteak roh"
                           mein Sollwert: Y111123 "Rinderfilet gebraten im Ofen, mit Sauce"
PLATZ7  schweinelende   -> Suche liefert "Schwein Filet/Lende, roh"
                           mein Sollwert: Y311712 "Schweinelende gebraten im Ofen"
PLATZ7  pastinaken      -> Suche liefert "Pastinake roh"
                           mein Sollwert: X573712 "Pastinaken gekocht, gebraten"
```

Hier liefert die Suche die **Grundzutat** und mein Sollwert zeigt auf
das **Gericht** — weil das gezogene Lebensmittel ein Gericht war und die
Regel keine passende Grundform fand (`rinderfilet` als ein Wort trifft
`Rind Filet` nicht).

`[cmd]` **39 der 151 Sollwerte zeigen auf ein Gericht (X/Y).** Für diese
fragt die Messung „findet die Suche genau dieses Gericht", nicht „findet
der Mensch seine Zutat". **Die 79,5 % sind deshalb eher eine Unter- als
eine Übergrenze.**

**Echte Rangfolgeprobleme:**

```
PLATZ2  mehrfruchtsaft  statt: Nearwater/Aqua Plus Getränk, mit Fruchtsaft
PLATZ3  mandeldrink     statt: Kaffee (Getränk) mit Mandeldrink, ungesüßt
PLATZ2  gemuesebruehe   statt: Gemüse Bouillon/Brühe/Suppe (Brühwürfel, Pulver)
PLATZ3  rind steak      statt: Rind Steak (Rücken) roh
PLATZ6  kalb fleisch    statt: Kalb Fleisch, vom Knochen, roh
```

`mandeldrink` liefert einen **Kaffee mit** Mandeldrink vor dem
Mandeldrink selbst — dasselbe Muster wie C-24 (Halbfertigprodukte).

**Drei Fälle ohne den Sollwert in den ersten zehn:**
`schnittkaese` (Fettstufe 20 % statt 60 %), `kartoffelsuppe`,
`speckkartoffeln` — in allen dreien ist der Sollwert eine sehr
spezifische Variante, die der Anfrage nicht näher steht als der
Gewinner.

---

## Was diese Messung nicht sagt

- **Sie misst gegen geratene Begriffe, nicht gegen echte Anfragen.**
  Die 152 Anfragen sind aus Bestandsnamen erzeugt, nicht von Menschen
  getippt. Ob jemand `gemuesekartoffelfleischbrei` oder
  `nussspritzgebaeck nougatfuellung` sucht, ist unbekannt. **Das bleibt
  C-18** (Fehlsuchen mitschreiben) — der einzige Hebel, der nicht auf
  geratenen Begriffen beruht.

- **Sie sagt nicht, dass C-38 die Abdeckung verbessert hat.** `[cmd]`
  Die Gegenprobe mit der alten Bauart auf der heutigen Datenbank ergibt
  46,1 % gegen 48,0 % vorher. Auf dieser Stichprobe ist **keine
  Verbesserung durch C-38 messbar**; der Sprung kommt aus der
  geänderten Frage.

- **Sie sagt nichts über die 98 % des Bestands ausserhalb der
  Stichprobe.** `[annahme]` Eine systematische Stichprobe von 2,1 % ist
  für eine Grössenordnung brauchbar; eine Fehlerrechnung wurde **nicht**
  durchgeführt.

- **Ein Teil der Sollwerte ist selbst fragwürdig.** `[cmd]` 39 zeigen
  auf ein Gericht, weil das gezogene Lebensmittel eines war. In
  mindestens drei nachgeprüften Fällen (`rinderfilet`, `schweinelende`,
  `pastinaken`) liefert die Suche die bessere Antwort und wird trotzdem
  als Fehlschlag gezählt. **Die Sollwerte wurden nicht nachträglich
  angepasst** — das wäre eine Prüfung, die ihren Massstab am Ergebnis
  ausrichtet.

- **Sie prüft nur Platzierung, nicht Nützlichkeit.** Ob ein Nutzer mit
  `Rind Steak (Rücken) roh` auf Platz 3 zufrieden wäre, misst niemand.

- **Sie ist eine Momentaufnahme.** `[cmd]` Claude Code baut parallel die
  Kette für C-41 um; das Skript bricht deshalb ab, wenn
  `nutrition.foods` nicht 7.140 Zeilen hat. Der Lauf fand auf einem
  stabilen Stand statt, aber die Anzeigenamen aus C-41 waren noch nicht
  eingespielt. `[cmd]` Die Suche liest `name_de`, nicht den
  Anzeigenamen — sie sollte davon unberührt sein, geprüft ist das nicht.

---

## Was daraus folgt

Die Aussage aus C-23 — *„der Wortschatz trägt, die Rangfolge nicht"* —
gilt weiter, aber milder: `[cmd]` 0 % gar nichts gefunden, 97,4 % in den
ersten zehn, 79,5 % auf Platz 1. Die Lücke zwischen 97,4 und 79,5 ist
die verbleibende Rangfolgearbeit.

Zwei der 31 Arbeitsfälle zeigen bekannte Muster:
`mandeldrink` → Kaffee mit Mandeldrink und `gemuesebruehe` → Brühwürfel
sind C-24 (Halbfertigprodukte ranken als Grundzutat).

**Kein Abnahmekriterium** — hier wurde gemessen, nicht verbessert.
