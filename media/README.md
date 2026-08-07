# media/

Lokaler Medienbestand. **Nicht im Repo versioniert** — der Inhalt ist
zu gross fuer Git und liegt zusaetzlich in Supabase Storage.
Nur diese README ist getrackt.

## Woher

Uebernommen am 2026-08-06 aus `temp/lumeosold/assets/exercises/`, der
lokalen Kopie der Vorgaengerinstanz LumeOS-V2. `[cmd]` Beim Verschieben
gezaehlt: 4.645 Bilder, 2.363 Videos, 13,11 GB — vorher wie nachher
identisch.

Die Zahlen decken sich mit der Training-Spezifikation (4.645 / 2.363)
und mit dem Cloud-Bestand, den TODO-Sektion E als Grund nennt, das
Legacy-Projekt zu behalten.

## Struktur

```
media/
  exercises/
    images/<Muskelgruppe>/*.jpeg     4.645 Dateien
    videos/                          2.363 Dateien
    katalog/                         Katalog- und Fehlliste
```

## Warum das hier liegt

Der Punkt A-05 fuehrte `temp/` als Loeschkandidat. `[cmd]` Eine Loeschung
dem Namen nach haette die einzige lokale Kopie dieser 13 GB vernichtet.
Deshalb der eigene, benannte Ort statt eines Unterordners in einem
Wegwerf-Verzeichnis.

## Bevor hier etwas geloescht wird

Der Bestand ist die lokale Rueckversicherung gegen die Legacy-Cloud.
Loeschen erst, wenn E-05 (Uebernahmekandidaten exportieren und mappen)
abgeschlossen ist und feststeht, was uebernommen wird.

Verwandte Punkte: A-08 / ADR-0004 (Medienort), E-05, E-06 (Medienpfade
relativ speichern).
