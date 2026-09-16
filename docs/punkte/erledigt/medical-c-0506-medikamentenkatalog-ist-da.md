---
nr: C-506
typ: fehler
modul: medical
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: C-503
entscheidung: null
agent: codex
beauftragt: 2026-09-08
erledigt: 2026-09-08
commit: 5e970b18
beruehrt:
  tabellen: [medical.medication_active_substances]
zahlen:
  gemessen: 2026-09-08
  wirkstoffe: 498
---

# C-506 - der Medikamentenkatalog IST da

## Toms Befund

Tom, 2026-09-08, beim Ansehen der Settings:

> und was soll das in settings allergien?
> "Kein Medikamentenkatalog mit Allergie-Verknuepfung
> vorhanden; Freitext wird nicht gegen Medikamente geprueft"

`[read]` **Die Meldung stammt aus C-503** ? **und sie ist
falsch.**

## Gemessen

    medical.medication_active_substances   498 Wirkstoffe
    medical.medication_formulations        453
    medical.medication_products            448 Markennamen

`[cmd]` **`medication_active_substances` traegt:**

    canonical_name, generic_names, synonyms,
    atc_code, cas_number, rxnorm_code, unii_code,
    drug_class, raw_drug_class, cyp_profile,
    routes, dosage_forms, risk_flags, lab_effects,
    contraindications, precautions, regulatory_state

`[read]` **`synonyms` und `generic_names` sind genau das, was
eine Suche braucht** ? **und `contraindications` steht schon
da.**

`[read]` **C-503 hat nach `allerg` gesucht, nicht nach dem
KATALOG** ? **derselbe Fehler, den ich heute zwoelfmal gemacht
habe.**

## Was zu bauen ist

`[cmd]` **`allergy_catalog_suggestions(art, query)` muss bei
`art = medikament` aus diesem Katalog vorschlagen.**

    medical:<wirkstoff-id>     der Praefix
    gesucht wird in canonical_name,
      generic_names, synonyms

`[read]` **Ein Nutzer tippt *,,Penicillin"*, *,,Ibuprofen"*,
*,,Aspirin"*** ? **alle drei sollten treffen.**

`[cmd]` **MISS, welche der 498 wirklich vorkommen** ? **und ob
`synonyms` gefuellt ist.**

## Und die Trefferzahl

`[read]` **Bei Nahrung zeigt der Vorschlag, wie viele
Lebensmittel getroffen werden (Laktose 1.021).**

`[read]` **Bei Medikamenten ist die Frage eine andere:
*,,wie viele Produkte enthalten diesen Wirkstoff?"*** ?
`medication_formulations.active_substance_id`.

`[cmd]` **453 Formulierungen auf 498 Wirkstoffe** ? **miss, wie
viele davon zugeordnet sind.**

## Was NICHT zu tun ist

**KEINE Wechselwirkungspruefung** ? **das ist ein eigener
Punkt.**

`[read]` **Hier geht es nur darum, dass der Nutzer seine
Medikamentenallergie EINTRAGEN kann und sie einen Code
bekommt.**

**`contraindications` NICHT auswerten** ? **melden, dass es da
ist.**

## Abnahmebedingungen

    A1  art=medikament schlaegt aus
        medication_active_substances vor.
    A2  "penicillin", "ibuprofen", "aspirin" treffen.
        Drei Belege.
    A3  sind synonyms und generic_names gefuellt?
        Zahl.
    A4  je Vorschlag: wie viele Formulierungen?
    A5  der Praefix medical: wird validiert, wie
        nutrition: und supplements: (C-503).
    A6  Gegenprobe: ein erfundener Wirkstoff -> 0.
    A7  Sicherung, Vollkette, ALLE Waechter.

## Bericht

`[cmd]` Der Katalog ist belegt: 498 Wirkstoffe, davon 498 mit
`generic_names`, 457 mit `synonyms`; 453 von 453 Formulierungen zeigen auf
einen Wirkstoff. `contraindications` und `precautions` bleiben unveraendert
und werden hier nicht ausgewertet.

`[cmd]` `allergy_catalog_suggestions('medikament', ...)` sucht nun in
kanonischem Namen, Generika und Synonymen. `penicillin` liefert 3,
`ibuprofen` 1 und `aspirin` 1 Katalogtreffer; `qzvwxjplk` liefert 0.
Ibuprofen kommt als `medical:drug_10daca0041` mit 2 zugeordneten
Formulierungen zurueck.

`[cmd]` `medical:<wirkstoff-id>` ist durch
`allergy_catalog_code_is_valid('medikament', ...)` und die bestehende
Alias-Validierung abgesichert. Die Vorschlags- und Validierungsfunktionen
sind `authenticated`-only; es gibt keine neue Freigabe fuer `anon` und keine
Auswertung von Wechselwirkungen oder Kontraindikationen.

`[cmd]` Sicherung und Vollkette wie C-504; C-506-Vertragstest gruen.

## Abnahme

**2026-09-08, Orchestrator. Selbst getestet.**

    "penicillin"  medical:drug_9b962cf7aa | Penicillin V | 1
    "ibuprofen"   medical:drug_10daca0041 | Ibuprofen    | 2
    "aspirin"     medical:drug_90ea1eeaf3 | Aspirin      | 2
    "qzvwxjplk"   0 Treffer

`[cmd]` **Herkunft: `medical.medication_active_substances`.**

`[read]` **Die Trefferzahl ist die FORMULIERUNGSZAHL** ? **nicht
*,,wie viele Lebensmittel"*, sondern *,,wie viele Praeparate
enthalten diesen Wirkstoff"*.**

`[read]` **`penicillin` findet auch `Ampicillin Trihydrate`** ?
**derselbe Wirkstoffstamm, ueber `synonyms`.**

### Die Meldung aus C-503 ist damit weg

`[read]` **Tom hatte sie am Schirm gesehen:** *,,Kein
Medikamentenkatalog vorhanden"* ? **er war die ganze Zeit da,
498 Wirkstoffe.**

**Abgenommen.**


