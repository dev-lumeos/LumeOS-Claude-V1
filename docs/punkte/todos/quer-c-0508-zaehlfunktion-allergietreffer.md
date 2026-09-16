---
nr: C-508
typ: feature
modul: quer
schwere: mittel
angelegt: 2026-09-08
braucht: []
kind_von: G-459
entscheidung: null
beruehrt:
  tabellen: [public.user_allergies]
zahlen:
  gemessen: 2026-09-08
---

# C-508 - eine Zaehlfunktion fuer die Allergietreffer

## Befund

Aus G-459, Claude Code, 2026-09-08:

> *,,Die Zahlen kosten weiter rund 1,4 s (eine Anfrage je
Allergie); eine Zaehlfunktion in der DB waere ein
Codex-Auftrag."*

`[cmd]` **Die Kachel zeigt je Allergie die Trefferzahl:
60, 1.021, 56.948.**

`[read]` **Drei Allergien, drei Anfragen** ? **bei zehn
Allergien sind es zehn.**

## Die Vorgeschichte

`[cmd]` **Zuerst kostete es 27 Sekunden** ? **57 Runden a 1.000
Zeilen, der PostgREST-Deckel.**

`[cmd]` **Mit `head: true, count: exact` sind es 2,1 s, dann
1,4 s.**

`[read]` **Besser, aber es bleibt eine Anfrage je Zeile.**

## Was zu bauen ist

    user_allergy_treffer(p_user_id uuid)
      -> stoff_code, treffer_lebensmittel,
         treffer_produkte, treffer_medikamente

`[cmd]` **`user_allergy_catalog_matches` existiert schon
(C-503)** ? **miss, ob sie erweitert werden kann.**

`[read]` **Eine Anfrage fuer alle Allergien, nicht eine je
Allergie.**

## Abnahmebedingungen

    A1  eine Funktion, alle Allergien auf einmal.
    A2  Laufzeit gemessen, gegen 1,4 s heute.
    A3  die drei Zahlen bleiben: 60, 1.021, 56.948.
    A4  RLS: nur die eigenen.
    A5  Gegenprobe: ein Nutzer ohne Allergien -> leer.
    A6  Sicherung, Vollkette, ALLE Waechter.
