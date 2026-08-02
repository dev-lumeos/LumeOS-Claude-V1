# backup/legacy-v2/

Produktionssicherung der Vorgängerinstanz **LumeOS-V2**, gezogen am 2026-03-05.

**Gesichert am:** 2026-08-02
**Gefunden in:** `temp/lumeosold/backups/` — untracked, auf der Löschliste (A-05)
**Archiv:** `lumeos_v2_prod_20260305.zip`, 2,6 MB

`[cmd]` Beide Dateien vor dem Packen per MD5 gegen das Original geprüft, identisch.

---

## Warum das hier liegt

Der Ordner `temp/` stand zur Löschung an. Darin lag eine vollständige Kopie des
Vorgängerrepos samt Produktionsdump — die einzige lokale Quelle der
Trainingsdaten. Zweiter Fall dieser Art innerhalb von zwei Tagen; der erste
waren die BLS-Rohdaten unter `tmp/`.

## Inhalt

| Datei | Grösse | Inhalt |
|---|---|---|
| `lumeos_prod_20260305_184212.sql` | 153 KB | Schema, 95 Tabellen |
| `lumeos_prod_data_20260305_184240.sql` | 11,5 MB | Daten, 33.671 Zeilen |

`[cmd]` Datenbestand, gezählt über die `INSERT INTO`-Blöcke:

| Tabelle | Zeilen im Dump | Cloud-Messung 2026-08-02 |
|---|---|---|
| `storage.objects` | ~10.312 | 10.776 Objekte |
| `public.exercises` | ~8.819 | 1.448 Datensätze |
| `public.foods` | ~7.429 | – |
| `public.exercise_muscles` | ~6.417 | 6.398 |
| `public.muscle_groups` | ~164 | 149 |
| `public.equipment` | ~68 | 61 |
| `public.body_measurements` | ~169 | – |
| `storage.buckets` | ~20 | 1 (`exercises`) |

Bei `exercises` liegt die Zeilenzahl über der Datensatzzahl, weil `instructions`
und `tips` mehrzeilige Texte sind.

## Bedeutung für Sektion E

`storage.objects` ist der Objektkatalog des Buckets. Zusammen mit
`exercises.video_url` und den `image_*`-Spalten liegt die vollständige
Verknüpfung Übung zu Mediendatei **lokal** vor.

Damit sind E-01 bis E-04 ohne Zugriff auf die Cloud-Instanz beantwortbar.
Die Cloud wird nur noch für die Dateien selbst gebraucht — 15 GB, die ohnehin
dort bleiben.

**Einschränkung:** Der Dump ist fünf Monate alt. Abweichungen zur heutigen Cloud
sind sichtbar (6.417 gegen 6.398 Zuordnungen, 10.312 gegen 10.776 Objekte).
Vor einer Übernahme ist zu klären, welcher Stand gilt.

## Regeln

- Nicht als Quelle für den Ist-Zustand zitieren — das ist ein Vorgängersystem.
- Vor Übernahme einzelner Tabellen: Abgleich gegen `docs/specs/Training/`
  und gegen den heutigen Cloud-Stand.
- `temp/lumeosold/` bleibt bis zur Auswertung von Sektion E unangetastet.
