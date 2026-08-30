# G-183 — Claude Code, 2026-08-25

Auftrag: `docs/auftraege/g-183-claude-code.md`

**Der Widerspruch trifft zu. Gebaut, und zwar fuer fuenf Felder statt
drei.**

Nicht committet, nicht gestaged, nicht gepusht.

---

## 1 · MEIN GRUND IN G-182 WAR KEINER

`[read]` Ich habe **40 % gemessen — innerhalb der Spanne** — und dann
abgelehnt, weil *„82 von 136 Zeilen unveraendert bleiben"*. **Das ist
woertlich das Verhalten, das der Auftrag vorschreibt**, nicht ein
Argument dagegen. Der Auftrag sagt: *wo sie nicht greift, bleibt der
Absatz stehen, nicht zerhackt.*

`[cmd]` **Und die 40 % waren zu niedrig gerechnet.** Ich hatte gegen
alle 290 Zeilen geteilt statt gegen die **136 gefuellten** — ein leeres
Feld kann die Regel weder treffen noch verfehlen. **Richtig sind
99 %.**

`[read]` **Bei `mythen_de` war die Ablehnung richtig** (6 %), und
dieselbe Regel fuehrt hier zum anderen Ergebnis. Genau so war sie
gemeint.

## 2 · GEMESSEN VOR DEM BAU — und die Regel greift breiter

`[cmd]` **Mit der gebauten Zerlegung**, bezogen auf die gefuellten
Felder (2026-08-25):

| Feld | gefuellt | mehrteilig | Anteil | max. Teile |
|---|---|---|---|---|
| `rechtslage_klartext_de` | 136 | **135** | **99 %** | 5 |
| `reinheit_de` | 134 | **116** | **87 %** | 5 |
| `irreversibel_de` | 112 | **89** | **79 %** | 4 |
| `ueberwachung_de` | 96 | **63** | **66 %** | 2 |
| `nicht_im_blut_de` | 134 | **67** | **50 %** | 3 |

**Alle fuenf ueber 30 %. Alle fuenf gebaut.**

`[read]` **Zu den 99 %:** die Obergrenze von 90 % sollte verhindern,
dass eine Regel jeden Absatz zerhackt. **Hier ist der Grund ein
anderer — diese Texte sind durchweg mehrsaetzig**, und jeder Teil ist
eine vollstaendige Aussage. `[cmd]` Verteilung: 1 Teil → 1 · 2 → 62 ·
3 → 55 · 4 → 12 · 5 → 6. **Kein Feld zerfaellt in mehr als fuenf.**
Ich melde die Zahl und baue es, weil Tom genau diesen Absatz zitiert
hat.

## 3 · DIE REGEL

**Getrennt wird an Satzgrenzen und nach Semikolon — nie am
Doppelpunkt**, und nur vor einem Grossbuchstaben.

    | In USA, EU und Thailand verschreibungspflichtiges Arzneimittel.
    | Auf der WADA-Liste ist Liraglutid nicht verboten …

**Der Negativfall steht als Test:** *„WADA-Kategorie S2: jederzeit
verboten."* bleibt **eine** Zeile. `[cmd]` 5 Texte tragen dieses
Muster.

`[read]` **Die Zeile wird schlicht gesetzt**, nicht mit Ortsmarke
links und Aussage rechts. Der Auftrag laesst die Wahl; die Marken sind
uneinheitlich (*„In den USA"*, *„Die WADA"*, *„Fuer Sportler"*), und
eine erzwungene Spalte haette bei jedem dritten Text eine leere
Haelfte.

### Ein Fund aus dem eigenen Test

`[cmd]` **`„z. B."` zerfiel in `„z."` und `„B. 5 mg"`** — der
Grossbuchstabe hinter dem Punkt reicht als Schutz nicht. Im Bestand
kommt das **einmal** vor (`rechtslage_klartext_de`), also selten und
trotzdem falsch. **Abkuerzungsliste ergaenzt**; die Zahlen fielen
dadurch von 118 auf 116 und von 90 auf 89 — das sind die Faelle, die
jetzt richtig NICHT getrennt werden.

## 4 · EIN FEHLER AUS G-182, AUF DEM BILD ENTDECKT

`[cmd]` Auf dem Bild von Retatrutid stand **`„24 Prozent … bewiesen.""`**
— zwei schliessende Anfuehrungszeichen.

`[read]` **Das war mein Fehler aus G-182:** die Texte tragen ihre
Anfuehrungszeichen selbst, und die Anzeige setzte ein zweites Paar
darum. Mein damaliger Abraeumer traf nur ein fuehrendes `„` und ein
schliessendes am Textende — nicht das vor dem Gedankenstrich.

**Behoben und als Test festgehalten**, fuer beide Gestalten
(Zeichenkette und Objekt).

---

## NACHWEIS

### Gegenprobe, namentlich

| Substanz | Feld | erwartet | gemessen |
|---|---|---|---|
| **Retatrutide** (`sub_a69c95e352`) | Rechtslage | Aufschluesselung | **3 Punkte** ✔ |
| **Stanozolol** (`sub_25fa4abc12`) | Rechtslage | bleibt Absatz | **`liste: false`** ✔ |
| **Stanozolol** | Nicht im Blut | Aufschluesselung | **2 Punkte** ✔ |
| **6-OXO** | Sicherheit | Aufschluesselung | **2 Punkte** ✔ |

`[read]` **Stanozolol ist der schaerfste Fall:** sein Rechtslage-Text
traegt Semikolon UND Doppelpunkt und bleibt trotzdem eine Aussage —
das Semikolon steht vor Kleinschreibung, der Doppelpunkt trennt nie.
**Er ist die eine einteilige Zeile von 136.**

`[cmd]` **Keine doppelten Anfuehrungszeichen** bei allen drei.

### Negativprobe — fuenf Eingriffe

| Eingriff | vorher | mit Fehler | zurueck |
|---|---|---|---|
| Regel greift auch am Doppelpunkt | 28/0 | **26/2** | 28/0 |
| Grossbuchstabe nicht verlangt | 28/0 | **25/3** | 28/0 |
| Abkuerzungsliste leer | 28/0 | **27/1** | 28/0 |
| Rechtslage bleibt Fliesstext | 28/0 | **27/1** | 28/0 |
| „ein Teil wird trotzdem Liste" | 28/0 | **28/0 — gruen** | — |

**Zwei Runden noetig.** `[cmd]` Im ersten Anlauf blieben **zwei**
gruen: die Verdrahtung war unbewacht (nur die Funktion war geprueft,
nicht ihre Verwendung) — **Pruefung nachgezogen, jetzt rot.**

`[cmd]` **Der fuenfte bleibt gruen, und das ist richtig:** `teile.length
> 1 ? teile : [roh]` war **toter Code** aus der frueheren
`split()`-Fassung. Ohne Trennstelle laeuft die Schleife nie, und der
ganze Text steht als einziger Teil da. **Entfernt statt einen Test fuer
einen unerreichbaren Zweig zu erfinden.**

### Stand

`[cmd]` `tsc` **sauber** · Build **`Compiled successfully`** · Tests
**229 pass, 0 fail**.

**Bilder:** `g183-retatrutide.png` · `g183-stanozolol.png` ·
`g183-6oxo.png`

---

## GEAENDERT

| Datei | |
|---|---|
| `v2/supplements/substanz-abschnitte.tsx` | `inAussagen()`, `Aussagen`, `AufgeteilterAbschnitt`, Zitat-Fix |
| `v2/supplements/substanz-tafel.tsx` | Rechtslage · Nicht im Blut · Kachelrumpf |
| `v2/supplements/supplements.css` | `.v2-supp-aussagen` |
| `__tests__/abschnitte.test.tsx` | 10 Faelle dazu |
| `tools/_g183-messen.mjs` | **neu** |
| `backup/g183-werte.json` | Messgrundlage |

**Keine Texte geaendert.** Das ist Anzeige, nicht Inhalt.

## OFFEN

1. **`ueberwachung_de` zerfaellt in hoechstens 2 Teile** — dort ist der
   Gewinn am kleinsten. Die Regel greift bei 63 von 96, aber die Texte
   sind kuerzer als bei der Rechtslage.
2. **Die Abkuerzungsliste ist eine Liste**, kein Sprachmodell. Sie
   deckt die gaengigen deutschen Faelle; ein neuer Text mit einer
   ungewoehnlichen Abkuerzung wuerde falsch trennen. **Der Fall ist im
   Bestand einmal vorgekommen und jetzt abgedeckt.**
