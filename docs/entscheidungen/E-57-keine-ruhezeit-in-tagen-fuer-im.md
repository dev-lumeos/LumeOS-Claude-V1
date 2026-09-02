---
nr: E-57
getroffen: 2026-09-02
von: Tom
status: gueltig
loest_ab: null
abgeloest_durch: null
betrifft: [C-109, F-02, F-05]
modul: medical
---

# E-57 — keine Ruhezeit in Tagen fuer IM

## Die Recherche

Tom, 2026-09-02, extern recherchiert. **18 Quellen, mit Titel,
Herausgeber und Jahr.**

## Das Ergebnis ist ein belegtes Nein

**Fuer wiederholte IM-Injektionen gibt es keine belastbare,
evidenzbasierte Ruhezeit in Tagen je Injektionsstelle.**

`[cmd]` **Keine Leitlinie von WHO, CDC oder einer Fachgesellschaft.**
`[cmd]` **Keine kontrollierte Humanstudie.**

`[read]` **Die Zahlen, die auf TRT-Seiten und in Foren stehen, sind
Praxisregeln** — **nicht validierte Grenzwerte.**

`[cmd]` **WHO *Best Practices for Injections* (2010) behandelt
Infektionspraevention** — **keine Tabelle mit Ruhezeiten.**

## Was stattdessen belegt ist

### Fibrose ist belegt, eine Schwelle nicht

`[cmd]` **Oh, Smith, Spencer et al., *Fibrous contracture of muscles
following intramuscular injections in adults*, Clinical Orthopaedics
and Related Research, 1977:** fuenf Patienten mit Muskelfibrose und
Kontrakturen nach wiederholten Injektionen. **Haeufigkeit und Dauer
waren unterschiedlich, ein Mindestabstand wurde nicht abgeleitet.**

`[cmd]` **Fallserie 2006, Pulsus Group:** *,,die natuerliche
Entwicklung der fibrotischen Myopathie ist unklar"* — **man weiss
nicht, ob es eine Schwelle bei Gesamtzahl oder Frequenz gibt.**

`[read]` **Der Schaden ist real, die Grenze unbekannt.**

### Volumen wirkt, ergibt aber keine Formel

`[cmd]` **Diness, Acta Pharmacologica et Toxicologica, 1985:**
lokaler Muskelschaden proportional zum Volumen (Kaninchen 0,25-1 ml,
Schweine 0,5-3 ml).

`[cmd]` **Svendsen und Blom, Archives of Toxicology Supplement,
1984:** mehr Schaden bei groesserem Volumen, gleiche Dosis.

`[read]` **Beides Tierversuche.** **Keine Formel wie *0,5 ml = 3
Tage*.**

## Was gilt

    IM     minimum_rest_days = null
           rotation_required = true
           Begruendung: keine validierte Mindestdauer

    SC     minimum_rest_days = null
           mindestens 10 mm Abstand zur vorherigen Stelle
           Zonenrotation, ein Quadrant je Woche

`[cmd]` **Die SC-Regel hat eine Quelle:** **Klonoff et al., *Advance
Insulin Injection Technique and Education With FITTER Forward Expert
Recommendations*, Mayo Clinic Proceedings, 2025.**

`[read]` **Sie stammt aus der Insulintherapie** — **der anatomische
Gedanke ist uebertragbar, die Lipohypertrophie-Daten nicht
automatisch.**

### Und ein dritter Zustand, getrennt zu fuehren

`[cmd]` **Bei vorhandener Lipohypertrophie: die Stelle 3-6 Monate
nicht verwenden** (FITTER Forward 2025).

`[read]` **Das ist keine Ruhezeit, sondern eine Gewebeschadenregel** —
**gehoert als eigene Eigenschaft, nicht als laengere Pause.**

## Der Warnsatz

`[read]` **Statt *,,noch 4 Tage warten"*:**

> Diese Stelle wurde zuletzt verwendet. Wiederholte IM-Injektionen
> sollten ueber verfuegbare Stellen rotiert werden. Eine
> wissenschaftlich validierte Mindest-Ruhezeit fuer diese Stelle
> existiert nicht.

`[read]` **Damit sagt die App, was sie weiss, und was sie nicht
weiss.**

`[read]` **Dieselbe Haltung wie bei E-38 und C-378:** **wenn die
Daten nicht da sind, erfinden wir sie nicht.**

## Nadeln: hier ist die Evidenz gut

`[read]` **Und die Empfehlung der Recherche aendert das Datenmodell:**
**Gauge und Laenge haengen nicht nur an der Stelle.**

    Gauge    haengt an der Viskositaet des Praeparats
    Laenge   haengt an Route, Fettgewebsdicke und Koerperbau

### IM Deltoid

`[cmd]` **CDC, *Vaccine Administration: Needle Gauge and Length*,
Stand 11.03.2026:**

    <60 kg              25 mm      22-25G
    60-70 kg            25 mm      22-25G
    Maenner 70-118 kg   25-38 mm   22-25G
    Frauen 70-90 kg     25-38 mm   22-25G
    Maenner >118 kg     38 mm      22-25G
    Frauen >90 kg       38 mm      22-25G

`[cmd]` **Cook, Williamson, Pond, *Vaccine*, Elsevier, 2006:**
Ultraschall am Deltoid — **BMI <35 reichen 25 mm, Frauen mit BMI >35
brauchen 32 mm.**

### IM Vastus lateralis

`[cmd]` **Open RN, *Nursing Skills*, 2. Auflage, 2023:** 25-38 mm.
**Waessrig 20-25G, viskoes/oelig 18-21G.**

`[read]` **Die 18-21G fuer Oelpraeparate sind allgemeine
Pflegelehre** — **die Recherche raet ausdruecklich davon ab, sie als
TRT-Vorgabe zu uebernehmen.**

### IM Ventrogluteal — hier versagt eine starre Tabelle

`[cmd]` **Larkin et al., *Journal of Clinical Nursing*, Wiley, 2018,
145 Personen per Ultraschall:** **32 mm reichen fuer alle Maenner und
normalgewichtigen Frauen, 38 mm fuer alle Frauen.**

`[cmd]` **Zaybak et al., *Journal of Advanced Nursing*, Wiley, 2007,
119 Personen mit BMI >= 25:** SC-Gewebsdicke ventrogluteal
**Uebergewicht 38,2 mm, Adipositas 43,1 mm, starke Adipositas 53,8
mm.**

`[read]` **Eine 25- oder 38-mm-Nadel erreicht dort den Muskel
nicht.** **Eine pauschale Angabe *VG = 25 mm* waere falsch.**

### SC allgemein und SC-Testosteron

`[cmd]` **Open RN 2023: 25-31G, 12,7-16 mm** — allgemeine Pflege.

`[cmd]` **FITTER Forward 2025: Pen 4 mm, Spritze 6 mm** — Insulin,
unabhaengig vom BMI.

`[cmd]` **Spratt et al., *Journal of Clinical Endocrinology and
Metabolism*, 2017, 63 Personen:** **25G x 16 mm** fuer subkutanes
Testosteron in Oel, **BMI 19,0 bis 49,9.**

`[cmd]` **FDA, Xyosted NDA 209863, 2018/2019:** festes System mit
**27G x 12,7 mm**, 0,5 ml subkutan.

`[read]` **Fuer TRT-SC gibt es also produktbezogene Evidenz** —
**besser als jede Forenregel.**

## Was das fuer `injection_sites` heisst

`[read]` **Kein Feld `recommended_needle`.** **Stattdessen:**

    route
    site
    medication_viscosity
    gauge_range
    length_range
    body_size_modifier
    evidence_type

`[read]` **Und drei getrennte Eigenschaften statt einer Ruhezeit:**
**Ruhezeit, Rotation, Gewebezustand.**

`[cmd]` **Damit wird aus einer Praxisregel keine vermeintlich
belegte Zahl.**
