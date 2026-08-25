# G-186 — Claude Code, 2026-08-25

Auftrag: `docs/auftraege/g-186-claude-code.md`

**Alle drei Punkte gemessen, zwei gebaut wie beschrieben, einer
anders** — die Zahlen tragen die Vorgabe dort nicht.

**Und: die Zahlen zu Punkt 2 stimmen so nicht.** Die 4.617 und 3.001
gehoeren ueberwiegend Medikamenten, nicht Katalogsubstanzen.

Nicht committet, nicht gestaged, nicht gepusht.

---

## 1 · DIE REITER — gemessen, dann ausgebaut

`[cmd]` **Abdeckung ueber die 318 im Katalog:**

| Dosierung | | Sicherheit | |
|---|---|---|---|
| `wann_wie_de` | **318** | `zu_viel_de` | **318** |
| `studied_dose_ranges` | 83 | `wer_nicht_de` | **317** |
| `upper_limit` | 38 | `mythen_de` | 288 |
| `usage_hint` | 19 | `rechtslage_klartext_de` | 136 |
| | | `nicht_im_blut_de` | 134 |
| | | `zu_wenig_de` | 64 |

`[read]` **Der Dosierungs-Reiter ist wirklich duenn** — ausser
`wann_wie_de` trifft nichts breit zu. **Aufgeloest habe ich ihn
trotzdem nicht:** der Satz steht bei allen 318, und mit der
Zerlegung aus G-183 wird aus dem Absatz eine Aufzaehlung.

`[cmd]` **Gemessen, BPC-157, Dosierung: 2 Zeilen → 3 Aussagen.**
Sicherheit dort: **2 Kaesten · 4 Abschnitte · 6 Listeneintraege.**

## 2 · WECHSELWIRKUNG UND LABOR — und die Zahlen im Auftrag stimmen nicht

### Der Befund zuerst

`[cmd]` **`entity_transporters` (4.617) und `entity_cyp` (3.001)
gehoeren ueberwiegend MEDIKAMENTEN:**

| Tabelle | gesamt | `entity_type='supplement'` | davon nicht `not_relevant` |
|---|---|---|---|
| `entity_transporters` | 4.617 | **135** (15 Substanzen) | **81** |
| `entity_cyp` | 3.001 | 816 + 295 perf. | **251** |

`[cmd]` **Von den 318 haben nur 94 ueberhaupt eine relevante Zeile —
224 haben keine.** Es sind also nicht *„10 Transporter je Substanz"*.

`[cmd]` **Zwei der drei genannten Faelle treffen nicht zu:**
**Digoxin ist nicht im Katalog** (9 Zeilen, alle
`entity_type='medication'`), **Metformin ebenso nicht**
(`im_katalog = false`). **Biotin: 0/0** — die Laborwirkung haengt an
`Vitamin B7 (biotin)`, einem anderen Eintrag.

### Was stattdessen taugt

`[cmd]` **Beide Tabellen sind vollstaendig im Katalog:**

    supplement_lab_effects    222 Zeilen · 90 Substanzen
    supplement_interactions    78 Zeilen · 78 Substanzen
    zusammen                  121 der 318 haben etwas

**Entschieden: ein Block im Sicherheits-Reiter, kein eigener Reiter.**
`[read]` Bei 121 von 318 waere ein eigener Reiter bei **197 Substanzen
leer** — die Blockregel aus §9 liesse ihn dann entfallen, und ein
Reiter, der bei zwei Dritteln fehlt, ist unberechenbar. **Ein Block,
der entfaellt, ist normal.**

`[read]` **Und er steht in der Sicherheit, nicht im Ueberblick:** dass
Biotin einen Troponinwert faelscht, zaehlt, wenn jemand einen Befund
in der Hand haelt.

`[cmd]` **222 Zeilen sind nur 156 verschiedene** — Biotins sieben sind
**drei**. Die Anzeige entdoppelt; ohne das stuende dieselbe Warnung
dreimal.

`[cmd]` **Am Bild belegt** (`g186-1-labor.png`):

    Troponin I/T (high-sensitivity)  [false low]
      Risk of MISSED myocardial infarction — FDA warned after a death

`[read]` **`not_relevant` bleibt draussen, aber der Unterschied wird
benannt** — *„N weitere Transporter und Enzyme geprüft, ohne Befund"*
als EINE Zeile, nicht als zehn leere. **Die Zahl ist heute 0**, weil
der Lesepfad sie noch nicht fuehrt; der Weg steht.

## 3 · DIE ZWECKE — die Vorgabe traegt nicht, gemessen

`[cmd]` **895 Zweck-Eintraege, davon 842 VERSCHIEDEN.**

    haeufigster    „Im Sport verboten (WADA S1.1)"   9 von 318
    zweiter        „Keine zugelassene Anwendung"     7
    danach         3 · 2 · 1

`[read]` **Das sind Saetze, keine Schlagworte** —
*„Muedigkeit bei nachgewiesenem Mangel"*, *„Haare/Naegel: Belege nur
bei Mangel"*. **Eine Filterleiste haette 842 Knoepfe**, und die
haeufigste Auswahl traefe 9 Substanzen.

`[read]` **Der Auftrag sieht den Fall vor** — *„dann sind es die
haeufigsten plus Suche, nicht alle"*. **Bei dieser Verteilung traegt
auch das nicht:** die zehn haeufigsten decken zusammen 33 von 318.

**Gebaut habe ich stattdessen: die Suche durchsucht `wofuer_de` mit.**

`[cmd]` **Der Gewinn ist gemessen:**

| Suchwort | vorher | nachher |
|---|---|---|
| „Schlaf" | 11 | **22** |
| „Muskelaufbau" | 4 | **30** |
| „Regeneration" | 0 | **8** |

`[read]` Wer *„Schlaf"* sucht, findet Magnesium — **ohne zu wissen,
dass es ein Mineralstoff ist**, und ohne 842 Knoepfe.

---

## NACHWEIS

### Bloecke je Reiter — drei Substanzen

| Substanz | Reiter | Dosierung | Sicherheit |
|---|---|---|---|
| Creatine monohydrate | 5 | 1 Abschnitt · 2 Aussagen | 2 Kaesten · 2 Abschnitte · 3 Zeilen |
| **BPC-157** | 4 | 1 Abschnitt · **3 Aussagen** | 2 Kaesten · **4 Abschnitte · 6 Zeilen** |
| Vitamin B7 (biotin) | 5 | 1 Kasten · 2 Aussagen | 2 Kaesten · 3 Abschnitte · 3 Zeilen |

`[read]` **BPC-157 trennt besser als Kreatin** — es hat weniger
Dosisdaten und war der Fall auf Toms Bild.

### Negativprobe — sechs Eingriffe, je Funktion UND Verdrahtung

| Eingriff | Ergebnis |
|---|---|
| P3 Funktion: Zwecke aus `trifftSuche` | **ROT** |
| P3 Verdrahtung: Liste ruft es nicht | **ROT** |
| P3 Lesepfad: `wofuer_de` nicht geladen | **ROT** (nach drei Anlaeufen) |
| P2 Funktion: Labor traegt keinen Reiter | **ROT** |
| P2 Verdrahtung: Block nicht gerendert | **ROT** |
| P2 Lesepfad: Entdoppelung entfernt | **ROT** |

`[cmd]` **Der dritte brauchte drei Anlaeufe, und jedes Mal war es
derselbe Fehlertyp:**

1. Der Waechter suchte `wofuer_de` in der ganzen Datei — und fand es
   in der **Detail**-Abfrage, obwohl die **Listen**-Abfrage zerstoert
   war.
2. Auf den Listenpfad eingeengt — und fand es in der **Abbildung**
   darunter, nicht in der Abfrage.
3. Auf die `.select(...)`-Zeichenkette eingeengt — und fand es im
   **eigenen Kommentar** darueber.

`[read]` **Erst mit Kommentarentfernung misst er die Abfrage.** Genau
der blinde Fleck, den der Auftrag benennt — diesmal dreifach.

### Stand

`[cmd]` `tsc` **sauber** · Build **`Compiled successfully`** · Tests
**235 pass, 0 fail**.

**Bilder:** `g186-1-labor.png` · `g186-2-dosierung.png` ·
`g186-3-suche.png`

---

## GEAENDERT

| Datei | |
|---|---|
| `lib/supplements/substanz-read.ts` | `Laborwirkung`, `Wechselwirkung`, `zwecke`; Entdoppelung |
| `lib/supplements/substanz-kategorien.ts` | `trifftSuche()` **neu** |
| `lib/supplements/substanz-reiter.ts` | Labor/Wechsel tragen den Sicherheits-Reiter |
| `v2/supplements/substanz-tafel.tsx` | `Wechselwirkungsblock` **neu**, Dosierung mit Zerlegung |
| `v2/supplements/substanz-detail.tsx` | Suche ueber `trifftSuche` |
| `v2/supplements/supplements.css` | `.v2-supp-labor` |
| zwei Testdateien | 4 Faelle dazu |

**Keine Texte geaendert, kein Wert erfunden, kein Platzhalter.**
`supabase/_pipeline/` nicht angefasst.

## OFFEN

1. **`entity_transporters` und `entity_cyp` werden nicht gezeigt.**
   `[cmd]` Nur 94 der 318 haben eine relevante Zeile, und die Tabellen
   sind ueberwiegend medikamentenbezogen. `[read]` **Der Nutzen laege
   im Abgleich mit der Medikation des Nutzers** — das ist ein
   Medical-Punkt, kein Katalogpunkt.
2. **„Geprueft, ohne Befund" zeigt heute 0.** Der Lesepfad zaehlt die
   `not_relevant`-Zeilen noch nicht; die Anzeige steht.
3. **Alle deutschen Spalten der beiden Tabellen sind leer** —
   `analyte_de`, `clinical_consequence_de`, `description_de` je 0.
   Gezeigt wird englisch, mit Rueckfall nach C-254.
4. **Bei einigen Wechselwirkungen ist die Beschreibung woertlich der
   Partner** (*„stop biotin before lab draws"* zweimal). Die Anzeige
   laesst die Doppelung weg — **sauber waere es im Import.**
