---
nr: G-521
typ: feature
modul: goals
schwere: mittel
angelegt: 2026-09-27
quellen:
  - docs/specs/Goals/PHASE_MODELS.md
  - docs/specs/Goals/DATABASE.md
  - docs/specs/Goals/SCORING.md
  - docs/specs/Goals/CONSOLIDATED_KNOWLEDGE.md:4

braucht: []
kind_von: G-519
entscheidung: E-68

beruehrt:
  tabellen:
    - goals.goal_phases
  dateien:
    - docs/specs/Goals/PHASE_MODELS.md
    - docs/specs/Goals/DATABASE.md
    - docs/specs/Goals/SCORING.md

zahlen:
  gemessen: 2026-09-27
  variant_werte_live: 5
  davon_in_der_spec: 2
  check_auf_variant_live: 0
  check_auf_variant_in_der_spec: 0
  phasenarten_in_database_md: 9
  phasenarten_mit_parametersatz: 7
---

# G-521 - wie modelliert man Ernaehrungsphasen, ihre Varianten und Parameter

## Der Anlass

Tom, 2026-09-27: *,,die community ist gross und wir sind nicht die
einzigen oder ersten die sowas brauchen."*

`[cmd]` **`goal_phases.variant` ist ein freies Textfeld ohne CHECK.**
Live stehen fuenf Werte, davon kennt die Spec zwei: `lean_bulk/
moderate` (die Spec kennt `moderate` nur fuer FAT_LOSS), dazu
`baseline` und `performance_placeholder`, die dort gar nicht
vorkommen.

`[read]` **Eine erste, flache Suche stuetzt einen Verdacht, belegt
ihn aber nicht:** die Fachliteratur parametrisiert ueber die RATE
(Prozent Koerpergewicht je Woche), nicht ueber benannte Stufen —
,,moderate" und ,,aggressive" waeren dann Etiketten auf Ratenbaendern
und keine eigene Dimension. Die Spec sagt selbst
`rate_of_loss: "0.5-0.75% BW/week"`.

**Diese Recherche soll den Verdacht pruefen, nicht bestaetigen.**

## Was die Quellensichtung vom 2026-09-27 vorweg geklaert hat

`[cmd]` **Der fehlende CHECK auf `variant` ist kein Versaeumnis.**
`docs/specs/Goals/DATABASE.md` Abschnitt 2 schreibt
`variant TEXT DEFAULT 'moderate'` — **ohne CHECK.** Live ist es
genauso. Wer einen CHECK fordert, fordert etwas, das die Spec nicht
verlangt; das muss diese Recherche begruenden, nicht voraussetzen.

`[cmd]` **Die neun Phasenarten sind Spec, nicht Zutat.**
`DATABASE.md` Abschnitt 2 und `SCORING.md` Abschnitt 7
(`GoalPhaseType`) fuehren beide dieselben neun Werte, `mini_cut` und
`peak_week` eingeschlossen. Der CHECK
`goal_phases_phase_type_check` ist damit spectreu.

`[cmd]` **Der Widerspruch liegt INNERHALB der Spec.**
`PHASE_MODELS.md` fuehrt `peak_week` als Unterphase von
CONTEST_PREP, `DATABASE.md` und `SCORING.md` fuehren es als eigene
Art — zwei Dateien gegen eine.

`[cmd]` **`mini_cut` hat in keiner Quelle einen Parametersatz.**
`CONSOLIDATED_KNOWLEDGE.md` Abschnitt 4 nennt es in der
Zustandsmaschine (`LEAN_BULK -> MINI_CUT`), die Parametertabelle
daneben fuehrt es nicht. **Das Mockup hat dieselbe Luecke** (G-515,
W2). Sieben der neun Arten haben Parameter, zwei nicht.

`[read]` **Damit ist N11 kleiner geworden, aber nicht weg.** Dass
`peak_week` und `mini_cut` Phasenarten sind, steht in der Spec. Was
fehlt, sind ihre Werte — und bei `peak_week` die Antwort, ob eine
Unterphase zusaetzlich eine eigene Art sein soll.

## Die vier Fragen

**F1 — Wie heissen die Phasen, und wieviele sind es?** Gibt es eine
belegbare Standardmenge, oder ist jede Aufzaehlung Hausgebrauch?
Insbesondere: ist `recomp` eine Phase oder eine Strategie INNERHALB
einer Phase, und **traegt ein Modell ueberhaupt beides — eine
Unterphase UND eine gleichrangige Art** (der Widerspruch oben)?

**F2 — Ueber welche Groesse wird parametrisiert?** Absolute kcal,
Prozent vom TDEE, oder Rate in Prozent Koerpergewicht je Woche? Was
wird gespeichert, was nur angezeigt? **Tom hat fuer LumeOS bereits
entschieden: kcal UND Prozent zeigen.** Die Frage ist, was die
fuehrende Groesse ist.

**F3 — Gibt es eine Varianten-Dimension?** Oder folgt die Stufe aus
der gewaehlten Rate? Wenn benannte Stufen vorkommen: welche Namen,
welche Baender? **Und traegt ein Feld ohne Wertebereich, wie unsere
Spec es vorsieht, in der Praxis?**

**F4 — Wie wird die woechentliche Anpassung modelliert?** Feste
Betraege wie in unserer Spec (-100, +150), oder proportional? Was ist
die Eingangsgroesse — Gewichtstrend, Adherence, beides?

## Woran sich die Arbeit messen laesst

**A1** — **Je Aussage eine Fundstelle.** Autor, Titel, Jahr, Seite
oder Abschnitt. Keine Aussage ohne Beleg, auch keine, die ,,allgemein
bekannt" ist.

**A2** — **Mindestens drei Quellenarten**, und die erste ist
Pflicht:
- begutachtete Uebersichtsarbeiten zu natuerlichem Bodybuilding und
  Wettkampfvorbereitung
- Datenmodelle oder Dokumentation kommerzieller Systeme, soweit
  oeffentlich (API-Doku, Hilfeseiten, Feldbeschreibungen)
- quelloffene Systeme mit sichtbarem Schema

**A3** — **Ratgeberseiten und Blogs zaehlen nicht als Beleg.** Sie
duerfen als Hinweis auf verbreitete Praxis vorkommen, dann aber als
solche gekennzeichnet.

**A4** — **Widersprueche zwischen den Quellen werden benannt, nicht
geglaettet.** Wo sich zwei Systeme uneinig sind, steht das so da.

**A5** — **Der Abgleich mit uns.** Je Frage F1 bis F4: was sagt die
Recherche, was sagt `docs/specs/Goals/PHASE_MODELS.md`, was steht
live in der Datenbank. Drei Spalten, und die Abweichungen benannt.

**A6** — **Eine Empfehlung fuer `variant`**, mit Begruendung und mit
dem, was dagegen spricht — **einschliesslich der Empfehlung, es beim
freien Feld zu lassen, wenn die Quellen das stuetzen.** Dazu
ausdruecklich: was wird aus `baseline` und
`performance_placeholder` — einordnen, umbenennen oder leeren?

**A7** — **Ein Parametersatz fuer `mini_cut` und `peak_week`**, oder
der Beleg, dass es keinen belegbaren gibt. Das ist die Haelfte von
N11, die offen bleibt.

**A8** — **Was die Recherche NICHT beantworten konnte**, als eigener
Abschnitt. Eine Luecke ist ein Ergebnis.

## Abgrenzung

`[read]` **Dies ist eine Recherche, kein Bauauftrag.** Es wird keine
Tabelle angelegt, kein CHECK geschrieben, keine Spec geaendert. Das
Ergebnis ist ein Bericht unter `## Bericht`, aus dem ein oder mehrere
Bauauftraege entstehen.

`[read]` **Die Spec bleibt die Hausquelle.** Wenn die Recherche ihr
widerspricht, ist das ein Befund fuer Tom — nicht die Erlaubnis, die
Spec zu ueberschreiben.

## Recherchevorlage (zum Kopieren)

`[read]` **Der Text unten ist fuer ein fremdes Modell geschrieben**
und nennt deshalb keine Repo-Pfade. Er enthaelt alles, was wir
gemessen haben, und alles, was fehlt. Wer ihn aendert, aendert ihn
hier — nicht in einer Kopie.

```text
RECHERCHEAUFTRAG - MODELLIERUNG VON ERNAEHRUNGSPHASEN
Stand der eigenen Messungen: 2026-09-28

WORUM ES GEHT

Wir bauen eine Datenbank und eine Oberflaeche fuer Ernaehrungsphasen
(Fettabbau, Aufbau, Erhalt, Wettkampfvorbereitung). Die Zielgruppe
reicht von Abnehmwilligen bis zu Wettkampfbodybuildern. Wir muessen
entscheiden, WELCHE GROESSE gespeichert wird, ob es eine
Variantenachse gibt, und wie eine Phase parametrisiert wird, fuer die
unsere eigene Vorlage keine Werte nennt.

Wir brauchen KEINE Trainingsberatung und keine Empfehlungen fuer
Einzelpersonen. Wir brauchen die Modellierungsentscheidungen, die in
der Fachliteratur und in bestehenden Systemen belegbar getroffen
wurden - mit Fundstellen.

Einheiten: metrisch, kcal, g/kg Koerpergewicht, Prozent
Koerpergewicht je Woche. Wenn eine Quelle andere Einheiten benutzt,
bitte beides nennen.

================================================================
TEIL 1 - WAS WIR HABEN
================================================================

Das ist unsere eigene Vorlage. Sie ist nicht belegt; sie ist das,
was zu pruefen ist.

fat_loss / moderate
  Defizit            -400 bis -600 kcal/Tag
  Rate               0.5 bis 0.75 % KG/Woche
  Protein            1.8 bis 2.4 g/kg
  Fett Untergrenze   0.5 g/kg
  Maximaldauer       20 Wochen
  Diaetpause         alle 8 Wochen, 1 Woche

fat_loss / aggressive
  Defizit            -750 bis -1000 kcal/Tag
  Rate               1.0 bis 1.5 % KG/Woche
  Protein            2.3 bis 3.1 g/kg
  Fett Untergrenze   fehlt in der Vorlage (wir haben 0.5 ergaenzt)
  Maximaldauer       8 Wochen
  Diaetpause         alle 4 Wochen, 1 Woche

mini_cut   (UNSER VORSCHLAG, nicht belegt - das ist Frage 5)
  Defizit            -800 bis -1200 kcal/Tag
  Rate               1.0 bis 1.5 % KG/Woche
  Protein            2.3 bis 3.1 g/kg
  Fett Untergrenze   0.5 g/kg
  Maximaldauer       6 Wochen, empfohlen 3 bis 4
  Diaetpause         keine
  Zweck              kurzer Schnitt innerhalb einer Aufbauphase,
                     ohne den Aufbau lange zu unterbrechen

lean_bulk
  Ueberschuss        +200 bis +400 kcal/Tag
  Rate               0.25 bis 0.5 % KG/Monat
  Protein            1.6 bis 2.2 g/kg
  Fett               25 bis 35 % der Kalorien
  Maximaldauer       52 Wochen

maintenance
  Kalorien           TDEE +/- 100
  Protein            1.4 bis 2.0 g/kg
  Dauer              unbegrenzt

reverse_diet
  Schritt            +50 bis +150 kcal je Woche, zuerst Kohlenhydrate
  Protein            halten
  Maximaldauer       16 Wochen
  Ausstieg           geschaetzter TDEE erreicht / Zunahme > 0.5 kg
                     je Woche / Nutzer zufrieden

recomp
  Trainingstag       TDEE +200
  Ruhetag            TDEE -300
  Wochenmittel       etwa Erhalt
  Protein            2.0 bis 2.4 g/kg

contest_prep
  Gesamtdauer        16 bis 24 Wochen
  Protein            2.3 bis 3.1 g/kg
  Refeeds            ab Woche 8, ein- bis zweimal je Woche, High Carb
  Unterphasen        early  Woche 24-16  Defizit -300  Cardio niedrig
                     mid    Woche 16-8   Defizit -600  Cardio mittel
                     late   Woche 8-2    Defizit -750  Cardio hoch
                     peak_week  1 Woche  Sonderprotokoll

peak_week
  Entladung          Tage 1 bis 3
  Aufladung          Tage 4 bis 5
  Natrium            anpassen, nicht streichen
  Kalorien           in unserer Vorlage nicht festgelegt
  Tage 6 und 7       in unserer Vorlage NICHT belegt

expert_bb_annual   (Zwoelfmonatsplan, automatische Uebergaenge)
  Monat 1-4   lean_bulk
  Monat 5-6   maintenance
  Monat 7-10  contest_prep
  Monat 11    peak_week und Wettkampf
  Monat 12    reverse_diet
  Voraussetzung: fortgeschrittenes Trainingsalter

Woechentliche Anpassung, die unsere Vorlage nennt
  fat_loss:   Gewichtstrend > -0.1 kg und Befolgung > 85 %  -> -100 kcal
  fat_loss:   Gewichtstrend < -1.0 kg                       -> +150 kcal
  fat_loss:   Kraftverlust > 10 %                           -> +20 g Protein
  lean_bulk:  Gewichtstrend > 0.75 kg je Woche              -> -100 kcal
  lean_bulk:  Gewichtstrend < 0.1 kg und Befolgung > 85 %   -> +100 kcal
  alle:       HRV 7 Tage < 85 % der Basislinie              -> Deload pruefen

Uebergangswaechter, die unsere Vorlage nennt
  Gewichtsverlust > 1 kg/Woche bei fat_loss     -> +150 kcal
  Verlust < 0.1 kg/Woche bei Befolgung > 85 %   -> -100 kcal
  Kraftrueckgang > 10 % auf Grunduebungen       -> +20 g Protein
  HRV < 85 % der Basislinie ueber 5 Tage        -> Deload
  Maximaldauer erreicht                         -> Uebergang empfehlen
  KF% < 5 % (Mann) / < 10 % (Frau)              -> Gesundheitswarnung
  Zunahme > 0.75 kg/Woche bei lean_bulk         -> -100 kcal
  Kraftverlust > 20 % bei contest_prep          -> Defizit senken

================================================================
TEIL 2 - WAS WIR SELBST GERECHNET HABEN
================================================================

Diese vier Befunde sind unsere eigene Rechnung. Bitte pruefen, ob sie
stimmen, und ob die Literatur sie kennt und loest.

BEFUND A - Defizit in kcal und Rate in Prozent widersprechen sich

Mit 7700 kcal je kg Koerpermasse gilt:
    kcal/Tag = 11 x Rate(% KG/Woche) x Koerpergewicht(kg)

Damit deckt sich ein kcal-Band mit einem Ratenband nur in einem
Gewichtsfenster:

    fat_loss moderate     -400..-600    48.5 bis 109.1 kg
    fat_loss aggressive   -750..-1000   45.5 bis  90.9 kg
    mini_cut (Vorschlag)  -800..-1200   48.5 bis 109.1 kg

Ausserhalb dieses Fensters gibt es KEINEN Wert, der beide Angaben
erfuellt. Beispiel: bei 95 kg verlangt 1.0 % KG/Woche bereits 1045
kcal/Tag - das Defizitband von aggressive endet bei 1000.

Bekannte Unschaerfe: 7700 kcal/kg gilt fuer Fettmasse, eine Rate in
% KG/Woche misst Gesamtgewicht, und in den ersten Wochen geht
Glykogen und Wasser mit. Die Fenstergrenzen sind also ungefaehr.

BEFUND B - Die Makrountergrenzen passen nicht in jedes Ziel

Beispiel: 80 kg, TDEE 2400, Defizit -1200, also Ziel 1200 kcal.
    Protein 3.1 g/kg = 248 g  =  992 kcal
    Fett    bei 25 % der kcal =  300 kcal
    Summe                     = 1292 kcal   >  Ziel 1200 kcal
Die Kohlenhydrate sind der Rest und werden negativ. Unsere Rechnung
klemmt bei 0 und speichert eine in sich widersprechende Zeile.

BEFUND C - Die Diaetpause widerspricht der mini_cut-Dauer

aggressive verlangt alle 4 Wochen eine Pause. Unser mini_cut-Vorschlag
laeuft bis 6 Wochen bei GROESSEREM Defizit ohne Pause. Unser Argument
dafuer: ein mini_cut beginnt aus einem Kalorienueberschuss, also mit
gefuellten Glykogenspeichern. Wir wissen nicht, ob das traegt.

BEFUND D - Die Variantennamen sind nur Zahlen

Unsere Vorlage kennt benannte Stufen NUR bei fat_loss: moderate und
aggressive. Was sie unterscheidet, ist ausschliesslich quantitativ -
Defizit, Rate, Protein, Dauer, Pausentakt. Kein eigenes Verhalten.
Wer 0.9 % KG/Woche waehlt, liegt zwischen beiden Namen.

================================================================
TEIL 3 - WAS UNS FEHLT (die Fragen)
================================================================

F1  PHASENMENGE
    Gibt es eine belegbare Standardmenge von Ernaehrungsphasen, oder
    ist jede Aufzaehlung Hausgebrauch? Insbesondere:
    a) Ist eine Rekomposition eine eigene Phase oder eine Strategie
       innerhalb des Erhalts?
    b) Ist eine Peak Week eine eigene Phase oder die letzte
       Unterphase der Vorbereitung? Traegt ein Datenmodell beides
       gleichzeitig?
    c) Ist ein Mini-Cut eine eigene Phase oder nur ein kurzer
       aggressiver Fettabbau?

F2  FUEHRENDE GROESSE
    Wird ueber absolute kcal, ueber Prozent vom TDEE oder ueber die
    Rate (% KG/Woche) parametrisiert? Was speichern bestehende
    Systeme, was zeigen sie nur an? Wie loesen sie Befund A?

F3  VARIANTENACHSE
    Gibt es sie, oder folgt die Stufe aus der gewaehlten Rate? Wenn
    benannte Stufen vorkommen: welche Namen, welche Baender, und je
    welcher Phase? Traegt ein Feld ohne festen Wertebereich in der
    Praxis, oder fuehrt das zu Datenmuell?

F4  WOECHENTLICHE ANPASSUNG
    Feste Betraege wie in unserer Vorlage (-100, +150) oder
    proportional? Welche Eingangsgroessen sind belegt -
    Gewichtstrend, Befolgung, Kraftverlauf, HRV? Ueber welchen
    Zeitraum wird geglaettet, und mit welchem Verfahren?

F5  MINI-CUT - die Luecke, die uns am meisten fehlt
    a) Welches Defizit und welche Rate sind belegt?
    b) Welche Maximaldauer, und gibt es einen belegten Optimalwert?
    c) Braucht er Refeeds oder eine Pause, oder ist er kurz genug?
       Traegt unser Argument aus Befund C?
    d) Welches Protein, und gilt eine hoehere Vorgabe als bei
       laengerem Fettabbau?
    e) Was folgt darauf - zurueck in den Aufbau, in den Erhalt, oder
       eine Reverse Diet?
    f) Gibt es belegte Ausstiegsbedingungen?

F6  PEAK WEEK, TAGE 6 UND 7
    Unsere Vorlage belegt Entladung an Tag 1-3 und Aufladung an Tag
    4-5. Was ist fuer Vortag und Wettkampftag belegt? Und ist ein
    Kalorienziel in dieser Woche ueberhaupt die richtige Groesse,
    oder ist sie protokollgetrieben?

F7  UNMOEGLICHE KOMBINATIONEN
    Wie behandeln bestehende Systeme Befund B? Gibt es eine belegte
    Regel - Protein wird gesenkt, das Defizit wird gedeckelt, oder
    die Fettuntergrenze gibt nach? Was ist die dokumentierte
    Rangfolge?

F8  FETTUNTERGRENZE
    Ist 0.5 g/kg als Untergrenze belegt? Aendert sie sich mit der
    Defizitgroesse oder der Dauer? Ist ein kurzfristiges Absenken
    dokumentiert, und ab welcher Dauer gilt es nicht mehr?

F9  SCHWELLEN DER WAECHTER
    Sind die Zahlen in Teil 1 belegt - Kraftverlust 10 % und 20 %,
    HRV 85 % der Basislinie ueber 5 Tage, KF% 5 % und 10 % als
    Warnschwelle, Befolgung 85 %? Wo kommen sie her?

F10 PROTEIN "HALTEN"
    Bei der Reverse Diet sagt unsere Vorlage "halten". Halten
    heisst: den Wert der Vorphase uebernehmen, oder aus dem
    aktuellen Gewicht neu rechnen? Was ist belegt?

F11 UNTERSCHIEDE NACH GRUPPE
    Unterscheidet die Literatur die Baender nach Geschlecht, nach
    Trainingsalter, nach Ausgangskoerperfett? Unsere Vorlage tut es
    nur an einer Stelle (KF%-Warnschwelle 5 % gegen 10 %).
    Zusatzfrage, rein als Literaturfrage: unterscheidet die
    Literatur die Parameter zwischen natuerlichen und
    pharmakologisch unterstuetzten Athleten, und wenn ja, worin?

================================================================
TEIL 4 - WIE DIE ANTWORT AUSSEHEN SOLL
================================================================

BELEGE

1. Je Aussage eine Fundstelle: Autor, Titel, Jahr, Fundstelle
   (Seite, Abschnitt, Tabelle). Auch fuer Aussagen, die als
   allgemein bekannt gelten.
2. Mindestens drei Quellenarten, die erste ist Pflicht:
   - begutachtete Uebersichtsarbeiten und Positionspapiere zu
     Koerperzusammensetzung, Wettkampfvorbereitung und
     Energiebilanz
   - Datenmodelle oder Dokumentation kommerzieller Systeme, soweit
     oeffentlich: Schnittstellenbeschreibungen, Hilfeseiten,
     Feldbeschreibungen
   - quelloffene Systeme mit sichtbarem Datenmodell
3. Ratgeberseiten, Blogs und Videos zaehlen NICHT als Beleg. Sie
   duerfen als Hinweis auf verbreitete Praxis vorkommen, dann aber
   ausdruecklich als solche gekennzeichnet.
4. Widersprueche zwischen Quellen werden benannt, nicht geglaettet.
   Wo zwei Systeme sich uneinig sind, steht das so da.
5. Wo nichts Belegbares existiert, ist das die Antwort. Eine Luecke
   ist ein Ergebnis. Bitte NICHT mit einer plausiblen Zahl fuellen.

FORM

Je Frage F1 bis F11 ein eigener Abschnitt mit
  - der Antwort in einem Satz
  - den Belegen
  - dem Abgleich mit unserer Vorlage aus Teil 1: gleich, abweichend,
    oder in unserer Vorlage nicht vorhanden
  - bei Abweichung: welche Zahl wir aendern muessten

Dazu am Ende:
  - eine Tabelle mit dem vollstaendigen Parametersatz je Phase, so
    wie die Recherche ihn stuetzt, mit Quellenspalte
  - eine Empfehlung zur fuehrenden Groesse (F2) mit dem, was dagegen
    spricht
  - eine Liste dessen, was die Recherche nicht beantworten konnte
```

## Bericht — Recherche durch ein fremdes Modell, 2026-09-28

`[read]` **Die Antwort im Wortlaut liegt bei Tom.** Hier stehen die
Ergebnisse je Frage mit ihren Belegen, damit die Fundstellen im Repo
sind und spaeter geprueft werden koennen.

**F1 Phasenmenge** — keine normierte Liste. Die Literatur kennt drei
Hauptzustaende (Verlust, Erhalt, Zunahme); Helms et al. 2014 gliedert
in Off-Season und Contest Preparation. MacroFactor und Carbon Diet
Coach modellieren nur Lose / Gain / Maintain (Carbon zusaetzlich
Reverse Diet). Recomp: Barakat et al. 2020 beschreibt es als
Phaenomen, nicht als Phase. Peak Week: Chappell et al. 2018 als
isoliertes Siebentageprotokoll. Mini-Cut: in Studien kaum
formalisiert, in der RP Diet App eine kurze Lose-Phase mit hohem
Ratenziel.

**F2 fuehrende Groesse** — die RATE (% KG/Woche). Helms et al. 2014
empfiehlt 0.5 bis 1.0 % je Woche. MacroFactor verlangt nur die
Zielrate; die kcal sind Ausgabe, nicht Eingabe.

**F3 Variantenachse** — existiert nicht als eigene Entitaet. Die
Oberflaeche uebersetzt Ratenfenster in Etiketten (Slow, Standard,
Aggressive); das Rechenmodell aendert sich nicht.

**F4 woechentliche Anpassung** — proportional, nicht in festen
Stufen. EWMA ueber 14 bis 21 Tage (MacroFactor, Trexler); faellt der
geschaetzte TDEE um 70 kcal, faellt das Ziel um 70 kcal.
Gewichtstrend ist die primaere Eingangsgroesse. HRV und Kraftverlauf
sind Marker fuer Trainingsanpassung (Flatt et al. 2015), steuern
keine Makroregeln.

**F5 Mini-Cut** — 0.75 bis 1.25 % KG/Woche, hoechstens 6 Wochen,
meist 3 bis 4. Keine Pause notwendig: Peos et al. 2019 zeigt Vorteile
von Diaetpausen erst ab etwa 8 bis 12 Wochen Defizitdauer. **Unser
Argument aus Befund C (Start aus dem Ueberschuss) wird ausdruecklich
gestuetzt.** Danach Erhalt fuer 1 bis 2 Wochen oder zurueck in den
leichten Ueberschuss, nicht Reverse Diet.

**F6 Peak Week Tag 6 und 7** — protokollgetrieben, kein Kalorienziel.
Barakat et al. 2022 und Chappell et al. 2018: Wasser und Natrium
HALTEN, Kohlenhydrate nach Optik feinjustieren (Spillover vermeiden).

**F7 unmoegliche Kombinationen** — strikte Rangfolge: Protein zuerst,
dann Fett, Kohlenhydrate sind der Rest. Bleibt nichts uebrig, wird
das DEFIZIT gedeckelt, nicht das Protein gesenkt:
`Max_Defizit = TDEE - (Protein_kcal + Fett_min_kcal)`. Helms et al.
2014 warnt, dass sehr schlanke Athleten das theoretische
Prozentdefizit oft nicht fahren koennen.

**F8 Fettuntergrenze** — 0.5 g/kg als Konsens (Iraki et al. 2019).
Helms nennt 15 bis 30 % der Kalorien, was bei hohen Defiziten
versagt; deshalb der absolute g/kg-Wert.

**F9 Schwellen** — Daumenregeln aus der Praxis, keine validierten
Cut-offs. Flatt et al. 2015 stuetzt HRV als Marker, nennt aber keine
universelle Schwelle (geraet- und basislinienabhaengig). Fagerberg
2018 stuetzt das Gesundheitsrisiko unter 4 bis 5 % Koerperfett bei
Maennern.

**F10 Protein halten** — nicht den Grammwert uebernehmen, sondern mit
dem Erhaltungsfaktor auf das NEUE Gewicht rechnen (Trexler et al.
2014).

**F11 Gruppen** — bei hohem Koerperfett wird die fettfreie Masse statt
des Gesamtgewichts zur Proteinberechnung genommen (Helms et al. 2014:
2.3 bis 3.1 g/kg LBM). Fuer pharmakologisch unterstuetzte Athleten
existieren keine belegten Anpassungen; die Positionspapiere beruhen
aus ethischen Gruenden auf naturalen Kohorten.

## Pruefung des Berichts

`[cmd]` **Die Beweisanforderung ist nicht erfuellt.** A1 verlangte
Seite, Abschnitt oder Tabelle je Aussage — **keine einzige Fundstelle
nennt mehr als Autor und Jahr.** Eine Quelle hat weder Titel noch
Jahr (,,Fogelholm, Ernaehrungsrichtlinien"). Von den drei verlangten
Quellenarten fehlt die dritte vollstaendig: **kein quelloffenes
System mit sichtbarem Datenmodell.**

`[read]` **Deshalb wird aus diesem Bericht nichts `[cmd]`.** Er sagt,
wo zu graben ist. Jede Zahl, die in eine Rechnung wandert, braucht
vorher ihre Fundstelle.

`[wahrscheinlich]` Die genannten Arbeiten existieren und sind grob
richtig zugeordnet — Helms et al. 2014 (Wettkampfvorbereitung), Iraki
et al. 2019 (Off-Season), Peos et al. 2019 (Diaetpausen), Trexler et
al. 2014 (metabolische Anpassung), Chappell et al. 2018, Fagerberg
2018, Barakat et al. 2020 und 2022.

### Drei Widersprueche im Bericht selbst

**1. F3 sagt ,,Varianten streichen", die Abschlusstabelle gibt ihnen
eigene Daten** — 12 bis 16 gegen 4 bis 8 Wochen Maximaldauer, 8 gegen
4 Wochen Pausentakt. Beides gleichzeitig geht nicht. **Die Aufloesung
steckt im Widerspruch: Dauer und Pausentakt sind Funktionen der RATE,
nicht eines Namens.** Damit braucht es kein `variant`-Feld und keinen
CHECK — das beantwortet N12 besser als beide Vorschlaege, die auf dem
Tisch lagen.

**2. ,,Fett Min 0.5 bis 1.5" ist ein Kategoriefehler.** Ein Minimum
ist eine Zahl. 0.5 bis 1.5 g/kg ist Irakis Aufnahmeempfehlung, in die
Spalte ,,Minimum" geschrieben. F8 selbst nennt im Text 0.5 als hartes
Minimum — das ist der Wert, der gilt.

**3. Protein 2.3 bis 3.1 fuer ,,Fat Loss (Standard)" ist eine stille
Eskalation.** Helms et al. 2014 ist eine Arbeit ueber
WETTKAMPFVORBEREITUNG. Die Tabelle traegt das Band in eine allgemeine
Fettabbauphase. **Vierzig Prozent unserer Nutzer sind keine
Bodybuilder.** Iraki 2019 nennt 1.6 bis 2.2, unsere Vorlage hatte 1.8
bis 2.4 — dazwischen. Der Bericht macht diesen Wert an dieser Stelle
schlechter.

### Eine Empfehlung, die so nicht gilt

`[read]` **F9 will die Schwellen konfigurierbar machen (,,User
Preferences"). Fuer eine Gesundheitswarnung ist das falsch** — ein
Nutzer koennte seine eigene Warnung bei 4 % Koerperfett abschalten.
Fagerberg stuetzt 4 bis 5 % als Risikozone, also gehoert diese
Schwelle fest. **Die HRV-Schwelle ist der andere Fall** —
geraetabhaengig, da traegt Konfigurierbarkeit. Der Bericht wirft
beides zusammen.

### Eine Korrektur an unserer eigenen Formulierung

`[cmd]` **Der Bericht nennt Befund A ,,mathematisch unmoeglich". Das
ist er nicht.** Innerhalb von 48 bis 109 kg (aggressive: 45 bis 91)
erfuellen beide Baender sich gleichzeitig. Die richtige Aussage:
ausserhalb eines Gewichtsfensters gibt es keinen gemeinsamen Wert.
Das genuegt als Grund, nur die Rate zu speichern — aber die
Uebertreibung darf nicht in unsere Akten wandern.

### Was der Bericht stuetzt und was er kostet

`[cmd]` **Protein auf LBM ist ein Einzeiler, kein Projekt.**
`goals.body_measurements.lean_mass_kg` existiert als generierte Spalte
(`weight_kg * (1 - body_fat_pct/100)`), und **alle 362 Messungen
tragen `body_fat_pct`.** Gemessen 2026-09-28.

`[read]` **Der mini_cut uebersteht die Pruefung fast unveraendert:**
Ratendeckel 1.5 auf 1.25, Pause null bestaetigt, Dauer 3 bis 6
bestaetigt, das Argument aus Befund C gestuetzt.

`[read]` **Ein Verlust, der benannt gehoert:** recomp hat in der
Literatur keine Parameterbaender. Unsere +200 / -300 sind eine
Produktentscheidung, kein Forschungsstand.

## Entscheidungen — Tom, 2026-09-28

**E1** `[cmd]` **Die neun Phasenarten bleiben als Auswahl. Die
Parameter haengen an der Rate, nicht an der Art.** Damit sind F2 und
F3 umgesetzt, ohne das Schema zu brechen. Neuer Punkt: **G-529.**

**E2** `[cmd]` **Das Proteinband wird nach Trainingsstatus geteilt.**
Sonst bekommt ein Abnehmwilliger Wettkampfwerte. Geht in **G-526.**

**E3** `[cmd]` **recomp bleibt eine Phase**, mit dem Vermerk, dass die
Baender unsere sind und nicht die der Literatur.

**E4** `[cmd]` **contest_prep und expert_bb_annual bekommen eine
eigene Struktur.** Sie passen in kein Ratenmodell: Unterphasen mit
Wochenbereichen, ein Zwoelfmonatsplan mit automatischen Uebergaengen,
eine tagbasierte Peak Week. Neuer Punkt: **G-530.**

## Was aus diesem Punkt entstanden ist

    G-529  die gespeicherte Groesse ist die Rate (blockiert G-511)
    G-530  eigene Struktur fuer contest_prep und expert_bb_annual
    G-526  nachgezogen: LBM statt Gewicht, Rangfolge, Trainingsstatus
    G-527  nachgezogen: Peak Week ohne Kalorienpruefung
    G-528  nachgezogen: der beschlossene Satz

`[read]` **Offen bleibt A1 dieses Punktes: die Fundstellen.** Ohne sie
bleibt jede Zahl aus dem Bericht `[wahrscheinlich]`. **Der Punkt
schliesst erst, wenn die tragenden Zahlen ihre Seite nennen.**
