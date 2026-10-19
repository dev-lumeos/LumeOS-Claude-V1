---
nr: G-681
typ: befund
modul: goals
schwere: mittel
angelegt: 2026-10-19

braucht: []
kind_von: G-670

quellen:
  - supabase/_pipeline/_testdaten/eigenes-konto-fuellen.sql

beruehrt:
  tabellen:
    - goals.body_measurements
  dateien:
    - supabase/_pipeline/_testdaten
---
# Die Gewichtsdaten sind ein gleichmässiger Sägezahn statt eines realistischen Verlaufs

## Befund

`[cmd]` 19.10.: dev hat 152 Gewichtsmessungen vom 20.05. bis 18.10.2026, zwischen 83,64 und 84,95 kg. Alle sind am 23.08. in einem Zug angelegt worden, mit `measurement_source = manual`.
`eigenes-konto-fuellen.sql` kopiert sie aus `tom.seed@example.com`, mit `source_detail` "Kopie aus tom.seed@example.com".

`[cmd]` Das Muster wiederholt sich exakt alle 5 Tage: viermal +0,09 kg, dann −0,31 kg. Ausschnitt: 84,57 · 84,66 · 84,75 · 84,83 · 84,92 · 84,61 · 84,69 …
Im Diagramm zeigen die Rohwerte deshalb einen regelmässigen Sägezahn.

`[annahme]` Ein echter Waagenverlauf schwankt unregelmässig, typischerweise um ±0,3 bis 1 kg von Tag zu Tag. Ursachen sind Wasser, Glykogen, Salz und Darminhalt, dazu gelegentliche Sprünge nach Refeed oder Wochenende, und einzelne Tage fehlen.
Der Sägezahn ist zu regelmässig und zu flach. Trend, Lage und Anpassung lassen sich damit nicht glaubwürdig vorführen oder prüfen.

`[read]` `manual` als Quelle ist bei kopierten Testwerten irreführend.

## Was zu tun ist (Codex)

- Den Gewichts-Seed deterministisch mit realistischem Rauschen erzeugen: fester Zufallsstartwert, Tagesrauschen, gelegentliche Ausreisser, Lücken. Der Trend folgt der Phase.
- Danach `trendgewicht_am`, das Wochenprotokoll und die Lage auf dem neuen Seed nachmessen.
- dev nur mit Toms Freigabe neu befüllen, nach A-105.
