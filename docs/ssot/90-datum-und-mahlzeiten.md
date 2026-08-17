# 90 — Datumsnavigation und mehrere Mahlzeiten je Typ (G-14 / G-15)

Stand: 2026-08-17 · Anker: Zweig `dev` · Aufträge G-14, G-15
Herkunft: gebaut und geprüft in dieser Sitzung.
Rangfolge: Code > dieses Dokument > Rest.

Beides betrifft denselben Lesepfad und dieselbe Ansicht.

| Datei | Rolle |
|---|---|
| `apps/web/src/lib/datum.ts` | **neu** — Datumsrechnung an einer Stelle |
| `apps/web/src/app/v2/nutrition/datumsnavigation.tsx` | **neu** — `‹ Heute ›` und der Zukunftshinweis |
| `apps/web/src/lib/nutrition/diary-write.ts` | liest `meal_time`, sortiert danach |
| `apps/web/src/lib/nutrition/diary-model.ts` | `meal_time` in `StoredMeal` |
| `apps/web/src/app/v2/nutrition/mahlzeiten.tsx` | keine Zusammenfassung je Typ mehr |
| `tools/i18n-pruefen.mjs` | zweite Prüfrunde (siehe unten) |

---

## G-15 — zwei Snacks sind zwei Karten

`[cmd]` **Der Fehler stand in einer Zeile:**

```
const vorhanden = new Map(mahlzeiten.map(m => [m.meal_type, m]))
```

Ein Schlüssel je Typ. Zwei Snacks am selben Tag überschrieben sich —
der erste verschwand **spurlos**, ohne Fehlermeldung, ohne Lücke im
Bild. Die Annahme „ein Typ, eine Mahlzeit" stammte aus der Zeit des
`UNIQUE`-Index auf `(user, datum, typ)`; `[cmd]` seit Kettenschritt
`052a` gibt es ihn nicht mehr, die Ansicht hatte es nicht mitbekommen.

**Jetzt:** jede vorhandene Mahlzeit bekommt eine eigene Karte, in der
Reihenfolge, die die Datenbank liefert. Für Typen **ohne** Eintrag
stehen weiterhin leere Karten da — sonst gäbe es keinen Platz für
„Search" und „Same as yesterday".

**Sortiert wird nach `meal_time`, nicht nach `created_at`.** `[read]`
Codex' Befund war richtig: `created_at` sortiert danach, wann jemand
getippt hat. Wer das Frühstück abends nachträgt, stand damit hinter dem
Abendessen. `nullsFirst: false` hält Zeilen ohne Zeit ans Ende — PostgREST
setzt `NULL` sonst nach vorn.

**Die Uhrzeit steht jetzt in der Karte.** Sie stand als `—` da, weil es
sie nicht gab; `[cmd]` heute trägt jede der 686 Mahlzeiten eine. Die
Vorlage zeigt `07:42 Breakfast` — genau das steht dort.

`[cmd]` Belegt am 14.08.:

```
07:30 Breakfast · 3 items   530 kcal · 27g P
10:14 Snack     · 1 items    63 kcal ·  1g P
12:30 Lunch     · 4 items   789 kcal · 66g P
16:00 Snack     · 2 items   291 kcal · 34g P
19:30 Dinner    · 4 items   762 kcal · 39g P
—     Post-workout · Empty
```

`[cmd]` Nebenbei korrigiert: der Kommentar an `createMeal` behauptete
noch, der `UNIQUE`-Index sei „die Wahrheit über Duplikate". Die
23505-Behandlung bleibt stehen — sie kostet nichts und deckt den Fall
ab, dass jemand den Index wieder einführt —, aber der Kommentar sagt
jetzt, wie es ist.

---

## G-14 — `‹ Heute ›`

**Sie funktionierte schon, man sah sie nur nicht.** `[cmd]` Zwei
`v2-btn-ghost`-Pfeile am Rand der Aktionsleiste, blass, neben „Find
food". `[read]` Derselbe Fall wie der Speichern-Knopf in C-58.

**Jetzt** steht `‹ Datum ›` als Block mit Rahmen zusammen:

| | |
|---|---|
| Heute | **das Wort „Heute"**, und das Feld ist dann kein Knopf (`disabled`, kein Zeigerwechsel) |
| anderer Tag | `Fr., 14. Aug. 2026` — Klick führt auf heute zurück |
| vorwärts | gesperrt auf heute, **ausser für Admins** |

### Die Admin-Ausnahme

`[cmd]` Die Rolle kommt aus **`app_metadata`**, nicht aus
`user_metadata`. `[read]` Letzteres kann die Nutzerin selbst setzen
(belegt am 2026-08-06 mit einem `PUT /auth/v1/user`), ersteres nicht.
Benutzt wird `isAdminFromAppMetadata` aus `@lumeos/shared/auth/role` —
dieselbe Funktion wie im Admin-Bereich, damit es **eine** Regel gibt und
nicht zwei.

`[read]` **Die Sperre ist Anzeige, kein Schutz.** Wer `?datum=` von Hand
tippt, kommt auf einen Zukunftstag. Das ist harmlos, weil dort nichts
steht — und weil ein serverseitiger Schutz nichts zu schützen hätte.

**Damit ein leerer Zukunftstag nicht wie ein Fehler aussieht**, sagt die
Ansicht dort, was los ist: *„Ein Tag in der Zukunft — hier ist noch
nichts erfasst, das ist kein Fehler."*

### Mittag statt Mitternacht

`[read]` Aus `DateContext.tsx` des Vorgängerrepos übernommen: beim
Blättern `new Date(datum + 'T12:00:00')`.

`[cmd]` Die bisherige Umsetzung nahm `T00:00:00`. **An einem Tag mit
Zeitumstellung springt Mitternacht um eine Stunde** — aus 00:00 wird
23:00 des Vortags, und `setDate(+1)` landet auf demselben Tag statt auf
dem nächsten. Für Thailand folgenlos (keine Sommerzeit), für Europa
nicht. Mittags kann das nicht passieren: zwölf Stunden Abstand zu beiden
Rändern.

`[cmd]` Drei Stellen nahmen Mitternacht (`ansicht.tsx` zweimal,
`mahlzeiten.tsx` einmal in „Same as yesterday"). Alle drei laufen jetzt
über `lib/datum.ts`.

**Nicht übernommen:** der Vorgänger prüft `isToday` über
`toISOString()` und widerspricht damit seinem eigenen
`getLocalDateStr` — östlich von Greenwich liefert das vor 01:00 Uhr den
Vortag. Hier ist beides lokal.

---

## Wo das Datum lebt

**Entscheidung: das Datum bleibt in der Adresse je Modul. Kein
gemeinsamer Zustand jetzt.**

`[cmd]` Der Stand: `/v2/nutrition` führt `?datum=`, `/v2/dashboard`
führt ein eigenes. Wer im Tagebuch auf gestern blättert und aufs
Dashboard wechselt, sieht dort **heute**.

`[read]` Der Vorgänger löst das mit einem `DateContext` über alle
Module — ein `useState` im Provider, den jedes Modul liest.

**Warum das hier nicht einfach übernommen werden kann:** Der Vorgänger
ist eine Anwendung mit **einem** Router-Zustand im Browser. Hier sind
`/v2/dashboard` und `/v2/nutrition` **eigene Routen mit
Serverkomponenten**. Ein Kontext im Browser wüsste das Datum, der Server
nicht — er rendert gegen den Suchparameter. Beides gleichzeitig hiesse
zwei Wahrheiten: die im Kontext und die in der Adresse.

**Drei Wege, alle mit Preis:**

| Weg | Preis |
|---|---|
| **Kontext im Browser** (wie der Vorgänger) | Die Seiten müssten ihre Daten im Browser laden statt auf dem Server. `[read]` Das gäbe die Identität der Sitzung auf, die heute jede Abfrage trägt — und damit den Grund, warum `security_invoker` überhaupt greift. |
| **Datum im Cookie**, wie Sprache und Theme | Funktioniert serverseitig und über Routen hinweg. **Aber:** ein Cookie ist geräteweit und überlebt Tage. Wer gestern auf den 3. August geblättert hat, sieht morgen wieder den 3. August — ein Datum, das sich merkt, ist ein Datum, das man vergisst. |
| **Datum beim Modulwechsel mitgeben** (Links tragen `?datum=`) | Kein neuer Zustand, keine zweite Wahrheit. Kostet: jede Verlinkung zwischen Modulen muss es mitführen, und wer die Adresse ohne Parameter aufruft, landet auf heute. |

**Gewählt: keiner davon — jetzt.** Der dritte ist der richtige, aber er
gehört in den Auftrag, der das Dashboard mit dem Tagebuch verbindet.
`[cmd]` Heute gibt es genau **eine** Verlinkung zwischen den beiden
(„Open Nutrition" auf dem Dashboard), und die führt bewusst auf heute.

`[annahme]` Der Aufwand für den dritten Weg liegt bei einer Stelle je
Verlinkung. Solange es eine ist, ist ein gemeinsamer Zustand mehr
Maschinerie als Nutzen. **Sobald das Dashboard datumsabhängige Kacheln
bekommt, kippt das** — dann gehört es gebaut, und zwar als
Suchparameter, nicht als Kontext.

---

## Ein Fund: die A-15-Prüfung hatte eine Lücke

`[cmd]` Beim Umbau blieb die Seite leer. Ursache:
`MISSING_MESSAGE — Could not resolve 'Nutrition.zucker'`. Der Schlüssel
fehlte in **beiden** Pflichtsprachen.

**Die gestrige Prüfung sah das nicht.** Sie vergleicht `de` und `en`
gegeneinander — fehlt ein Schlüssel überall, sind sich beide einig.
Genau der Laufzeitfehler, den A-15 verhindern soll, kam trotzdem durch.

**Ergänzt:** eine zweite Runde, die jeden im Code benutzten Schlüssel
gegen die Dateien prüft. `[cmd]` 74 Verwendungen, alle vorhanden.

Sie liest zwei Formen: den direkten Aufruf `t('schluessel')` und den
**deklarierten** Schlüssel `label: 'schluessel'`, der später als
`t(m.label)` durchläuft. Ohne die zweite Form bliebe genau die Lücke
offen, die `zucker` hinterlassen hat — der Schlüssel steht im Code, aber
nie in einem `t(...)`.

`[cmd]` **Zum Fehlschlagen gebracht:** `Nutrition.zucker` aus beiden
Dateien entfernt → `Im Code benutzt, aber NIRGENDS hinterlegt — 1:
Nutrition.zucker | Allgemein.zucker (apps\web\src\app\v2\nutrition\ansicht.tsx)`,
Exit-Code 1. Danach zurückgesetzt, wieder grün.

`[annahme]` Berechnete Schlüssel (`t(variable)`) findet sie weiterhin
nicht. Das ist im Dateikopf benannt statt verschwiegen.

---

## Nachweise

| Prüfung | Ergebnis |
|---|---|
| Angemeldet als `dev@lumeos.app` | `[cmd]` ja |
| Zwei Snacks am 14.08. | `[cmd]` 10:14 (1 Position, 63 kcal) und 16:00 (2 Positionen, 291 kcal), getrennte Karten |
| Sortierung nach Zeit | `[cmd]` 07:30 · 10:14 · 12:30 · 16:00 · 19:30 |
| Uhrzeit in der Karte | `[cmd]` ja, statt `—` |
| `‹ Heute ›` mittig | `[cmd]` Block mit Rahmen, drei Knöpfe |
| „Heute" als Wort | `[cmd]` Feld zeigt „Heute", ist dann `disabled` |
| Klick auf Datum → heute | `[cmd]` „So., 16. Aug. 2026" → „Heute" |
| Vorwärts als **Admin** | `[cmd]` geht — 18.08. erreichbar, Zukunftshinweis erscheint |
| Vorwärts als **Nicht-Admin** | `[cmd]` `test-user@lumeos.local`: Knopf gesperrt, Titel „Kuenftige Tage sind gesperrt." |
| `pnpm gate` | `[cmd]` grün, **8 Tasks** unverändert |
| `pnpm test` | `[cmd]` 189 Tests, 0 fehlgeschlagen |
| i18n-Prüfung | `[cmd]` 103 Schlüssel je Pflichtsprache, 74 Verwendungen geprüft, `th` 0 von 103 |
| Drei Breiten | `[cmd]` 1600 / 1100 / 800 px, Navigation überall sichtbar, kein Überlauf |
| `/nutrition` unverändert | `[cmd]` 0 `v2-`-Elemente, `lume-shell` vorhanden |
| Seitenfehler | `[cmd]` 0 |

`[cmd]` Für den Nachweis wurde Toms Konto über
`eigenes-konto-fuellen.sql` neu befüllt — der Zwei-Snack-Tag lag nur bei
`tom.seed@example.com`. 173 Mahlzeiten (vorher 172), 536 Positionen.
