# 182 — die vier Vorschlaege, jeder einzeln geprueft

**2026-09-08.** Tom hat vier Wege genannt. **Alle vier
geprueft, nicht nur einer.**

## 1 — wger: kleiner als unser Bestand

`[cmd]` **845 Uebungen, 16 Muskelgruppen, 12 Geraetetypen.**

`[cmd]` **Felder je Eintrag:** `primary_muscles`,
`secondary_muscles`, `equipment`, `category`,
`description_html`, `license`, `license_author`.

`[cmd]` **LumeOS hat 1.416 Uebungen auf 105 Muskeln.**

`[read]` **wger ist KLEINER in beiden Achsen** ? **und hat
dieselben zwei Stufen (primaer/sekundaer), keine Anteile.**

`[read]` **Kein `mechanics`-Feld** ? **die Heuristik bekommt es
dort nicht.**

`[cmd]` **Lizenz: CC-BY-SA 4 / AGPL, mit `license_author` je
Eintrag** ? **sauber, aber es bringt nichts Neues.**

`[read]` **ABGELEHNT als Quelle** ? **brauchbar hoechstens als
Gegenprobe fuer unsere Zuordnungen.**

## 2 — MuscleWiki: kommerziell, dieselben zwei Stufen

`[cmd]` **Die Vorlage nennt es selbst:** *,,Die Faktoren fuer
Dehnung und CNS muesstest du allerdings ueber deine eigene Logik
oben drauf legen."*

`[read]` **Also auch nur primaer/sekundaer** ? **gegen Geld.**

## 3 — Beardsley: das PRINZIP, nicht die Tabelle

`[cmd]` **Neuromechanisches Matching, seine eigene
Formulierung:**

> *,,Ein Muskel wird im Verhaeltnis zu seinem HEBEL fuer eine
> Gelenkbewegung aktiviert, gemessen am inneren
> Momentarm."*

`[read]` **Das ist die physiologische Begruendung fuer die
Anteile** ? **warum Bankdruecken die Brust zu 95 % und den
Trizeps zu 67 % trifft.**

### Was daraus FOLGT, und das ist neu

`[cmd]` **Beispiele, die er nennt:**

    Bizeps vs. Brachioradialis:
      supiniertes Handgelenk -> Bizeps hat den Hebel
      proniertes Handgelenk  -> Brachioradialis

    Gluteus vs. Adductor magnus in der Dehnung:
      bei gebeugter Huefte hat der Gluteus SCHLECHTEN Hebel
      -> er bekommt weniger Aktivierung als der Adductor

`[read]` **Das heisst: der Anteil haengt von der
GELENKSTELLUNG ab, nicht nur von der Uebung.**

`[cmd]` **Preacher Curl gegen Incline Curl:** **mehr
Bizepswachstum beim Preacher** ? **NICHT wegen der Dehnung,
sondern wegen des Hebels.**

`[read]` **Das widerspricht der Dehnungs-Heuristik aus der
Vorlage** ? **sie gibt dem Incline Curl 1,3-1,4 wegen der
Dehnung.**

### Und zur Ermuedung

`[cmd]` **Beardsley trennt ZWEI Mechanismen:**

    Kalziumionen-Ermuedung   langanhaltend, TAGE
                             aus Aktivierung UND Dehnung
    Metaboliten-Ermuedung    kurz, klingt schnell ab

`[read]` **Das ist die Begruendung fuer eine
ZWEI-Komponenten-Kurve** ? **nicht fuer eine einfache
Abklingfunktion.**

`[cmd]` **Und: Fortgeschrittene sind von der
Kalziumionen-Ermuedung STAERKER betroffen** ? **das ist der
Trainingsalter-Faktor, physiologisch begruendet.**

`[cmd]` **Eine Zahl aus der Literatur:** **Training bis zum
Versagen braucht 37 % mehr Erholungszeit als RIR 1-2.**

### Aber: keine Tabelle

`[read]` **Beardsley veroeffentlicht auf Patreon und Medium** ?
**Artikel, keine Datensaetze.**

`[read]` **Er liefert das PRINZIP und Einzelbeispiele** ?
**nicht 1.416 Uebungen mit Anteilen.**

## 4 — Alpha Progression: Nachbau ohne Quelle

`[read]` **Die Vorlage schlaegt vor, Testkonten anzulegen und
die Erholungsanzeige abzulesen.**

`[read]` **Das gibt Zahlen OHNE Beleg** ? **und Tom hat gesagt:**
*,,all diese berechnungen und daten sind bewiesen und werden
angewandt."*

`[read]` **ABGELEHNT** ? **es waere dieselbe Erfindung wie
`MUSCLE_STATE`, nur abgeschrieben.**

## Was BLEIBT

### Belegte Zahlen: ACE und Einzelstudien

`[cmd]` **Bankdruecken: Brust 95, Front-Delt 79, Trizeps 67
(% MVC).**

`[cmd]` **Brust, neun Uebungen, auf die beste normalisiert:**
**Langhantel 100, Pec-Deck 98, Kabelzug 93.**

`[cmd]` **PMC7112217: sechs Beinmuskeln ueber drei Uebungen.**

`[read]` **Das sind die Grundzuege** ? **und die machen den
Grossteil des Volumens aus.**

### Rueckfall: Pelland et al. 2026

`[cmd]` **67 Studien, 2.058 Teilnehmer:** **direkt 1,0,
indirekt 0,5.**

`[read]` **Fuer alles ohne Studie.**

### Die Begruendung: Beardsley

`[read]` **Warum ein Anteil so ist, wie er ist** ? **und warum
die Gelenkstellung zaehlt.**

`[read]` **Kein Datensatz, aber die Regel fuer
Zweifelsfaelle.**

## Die Reihenfolge, jetzt belegt

    1  exercise_muscles auf die richtige Ebene
       1.105 Wurzeln, 3.331 Gruppen  -- MESSBAR, NOETIG

    2  Faktor je Zuordnung
       ACE wo es Studien gibt, 1,0/0,5 sonst
       -- BELEGT (Pelland, ACE)

    3  Basiszeit je Muskel
       klein 36 h, gross 48 h, Erector 60 h
       -- die Vorlage nennt Zahlen, Quelle noch zu pruefen

    4  RPE-Faktor
       Versagen braucht 37 % mehr Erholung
       -- BELEGT (Beardsley zitiert die Literatur)

    5  CNS und Dehnung
       -- Heuristik ohne Merkmale (181), Beardsley
          widerspricht der Dehnungsregel teilweise
       -- ZURUECKSTELLEN

`[read]` **Schritt 1 bis 4 sind baubar. Schritt 5 nicht.**

