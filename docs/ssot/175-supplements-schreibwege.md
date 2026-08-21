# 175 — Die Schreibwege des Supplements-Moduls

**Auftrag:** G-148 · **Datum:** 2026-08-21 · **Herkunft:** Claude Code
(Orchestrator) · **Stand:** gemessen am 2026-08-21

---

## Welche Modale gebaut sind

### Vorbemerkung: alle elf standen schon da — als Hüllen mit einer falschen Begründung

`[cmd]` **`modale.tsx` führt seit G-45 alle zwölf Fälle** — `add`,
`catalogAdd`, `catalogAddEnh`, `skip`, `product`, `interaction`,
`reorder`, `addLab`, `addSideEffect`, `addCompound`, `planCycle`,
`permissions`, `logDose`, `logInjection`. **Der Auftrag las das als
„fehlt"; gefehlt hat der Schreibweg, nicht das Fenster.**

`[cmd]` **Und jedes trug denselben Satz:**

> *„Es gibt kein `supplements`-Schema — hier lässt sich noch nichts
> speichern."*

**Der Satz war falsch, seit es das Schema gibt.** `supplements` führt
**14 Tabellen**, darunter `intake_logs` mit **720 Zeilen** (656 `taken`,
64 `skipped`).

`[read]` **Der richtige Grund ist je Fenster verschieden** — „keine
Tabelle für diese Sache" statt „kein Schema". Deshalb nennt jetzt jedes
seinen eigenen.

### Vier Fenster schreiben, sieben nicht

| Fenster | Ziel | Stand |
|---|---|---|
| **`logDose`** | `intake_logs` | **schreibt** |
| **`skip`** | `intake_logs` (`status='skipped'`) | **schreibt** |
| **`add` / `catalogAdd` / `catalogAddEnh`** | `stack_items` | **schreibt** |
| **`reorder`** | `stack_items.stock_remaining` | **schreibt** |
| `addLab` | `EXTENDED_LABS` fehlt | Attrappe |
| `addSideEffect` | keine Tabelle | Attrappe |
| `addCompound` | keine Tabelle für Extended-Substanzen | Attrappe |
| `planCycle` | keine Zyklustabelle | Attrappe |
| `permissions` | `coach.*` — fremder Bereich | Attrappe |
| `product` | `PRODUCT_DETAILS` fehlt | Attrappe |
| `interaction` | liest `rule_catalog`, schreibt nichts | Anzeige |
| `logInjection` | `INJ_SITES`/`INJ_LOG` fehlen (C-109) | Attrappe |

### Was aus der Vorlage übernommen ist — und was nicht

`[cmd]` **Übernommen:** die acht Skip-Gründe wörtlich
(`module-supplements-modals.jsx:174-182`), die Notizpflicht bei *„Side
effect"*, der Aufbau von `SuppModal` (Titel · Untertitel · Fusszeile),
`FormField`/`Input`/`Select` als Muster.

`[cmd]` **Nicht übernommen: `LogDoseModal`s Feld *„Site (injectable
only)"*** mit acht Orten. `[read]` **Das gehört zu `Injections`, und
C-109 wartet auf `INJ_SITES`/`INJ_LOG`.** Ein Ort, der nirgends landet,
wäre ein Feld, das Arbeit verlangt und nichts tut.

`[cmd]` **Und die Vorlage hat selbst keinen Schreibweg** — ihre Knöpfe
rufen `onSave?.(…)` oder gar nichts. **Die Felder sind übernommen, die
Anbindung ist neu.**

---

## Was eine Einnahme auslöst

### Der Kreis, gemessen

`[cmd]` **Am 2026-08-21 über die laufende Oberfläche:**

```
POST   -> 201  Creatine Monohydrate 5 g | Zeit 07:42:00
          Einnahmen 360 -> 361, Protokolltage 91
Neuladen -> die Notiz „G-148 Nachweis" steht im DOM
DELETE -> 200  Einnahmen 361 -> 360
```

`[cmd]` **Und die Compliance bewegt sich:** **93,1 % → 93,2 %** nach
einer zusätzlichen Einnahme, zurück auf 93,1 % nach dem Entfernen.

`[read]` **Das ist der Beleg, den der Auftrag verlangt** — nicht „der
Knopf reagiert", sondern „die Zahl daneben ändert sich, weil sie aus
derselben Rechnung kommt".

### Die Momentaufnahme wird gelesen, nicht übernommen

`[cmd]` **`supplement_name_snapshot`, `dose_snapshot` und
`dose_unit_snapshot` sind `NOT NULL`** und kommen aus der
Stack-Position — **nicht aus dem Formular.** Käme sie vom Browser,
könnte eine Zeile einen Namen tragen, der nie im Stack stand.

`[read]` **Der Lesezugriff ist zugleich die Rechteprüfung:**
`stack_items` hängt über `user_stacks.user_id` an der Zeilensperre. Wer
eine fremde Id schickt, bekommt keine Zeile — **und damit NOT_FOUND,
bevor irgendetwas geschrieben wird.**

### Die Nullzeilenprüfung, in beide Richtungen belegt

`[cmd]` **Gemessen, alle drei Schreibwege:**

| Versuch | Antwort |
|---|---|
| `POST` auf fremde `stack_item_id` | **404 NOT_FOUND** |
| `DELETE` fremde Einnahme | **404 NOT_FOUND** |
| `PATCH` fremder Bestand | **404 NOT_FOUND** |
| `DELETE` ohne `id` | 400 VALIDATION_FAILED |

`[read]` **G-79 war der Anlass:** *„PostgREST meldet `ok` bei einem
`update`, das der Zeilenschutz leergefiltert hat."* Jede Funktion hängt
deshalb `.select(...)` an und prüft auf null Zeilen.

### Zwei Prüfungen, die das Schema verlangt

`[cmd]` **`intake_logs_intake_time_check`** verlangt
`EXTRACT(second FROM intake_time) = 0`. Ein `<input type="time">`
liefert `HH:MM` — aber nicht überall. **`zeitOderNull` normalisiert auf
`HH:MM:00`**, belegt in der Antwort: `07:42` → `07:42:00`.

`[cmd]` **`intake_logs_actual_dose_check`** verlangt `> 0` oder NULL —
geprüft, bevor geschrieben wird.

### Keine Dosierungsempfehlung

`[read]` **Eine Dosis erfassen ist etwas anderes, als eine zu raten.**
Die Vorbelegung kommt aus `stack_items.dose` — was die Nutzerin selbst
eingetragen hat. Das Fenster schreibt es aus:

> *„Ohne Eingabe wird die Menge aus dem Stack gebucht: 5 g."*

`[cmd]` **`typical_dose_min/max` bleiben aussen vor** — auf allen 44
Katalogeinträgen leer, G-91 hat die Spalte deshalb entfernt. Das
Add-Fenster sagt es selbst: *„Die Dosis wird nicht vorgeschlagen — der
Katalog führt keine."*

---

## Welche Tabellen fehlen

`[cmd]` **Für die sieben nicht gebauten Fenster**, gemessen gegen
`information_schema`:

| Fehlt | Wofür | Bereits vermerkt |
|---|---|---|
| `INJ_SITES`, `INJ_SCHEDULE`, `INJ_LOG` | Injections | **C-109** |
| `EXTENDED_LABS`, `BLOODWORK_PANEL` | Laborwerte im Extended-Tab | SSOT 173 |
| `PRODUCT_DETAILS` | Produktdetails (Wirkstoffe, Siegel, SKU) | SSOT 173 |
| `STACK_TEMPLATES` | Vorlagen-Stacks | SSOT 173 |
| — | Nebenwirkungen | **neu: C-186** |
| — | Zyklusplanung | **neu: C-186** |
| `shopping_lists` | wirklich bestellen | **C-175** |

### Zwei Befunde, die keine Tabelle brauchen

`[cmd]` **`user_inventory` gibt es nicht — und braucht es nicht.**
Bestand und Schwelle stehen in `stack_items` (`stock_remaining`,
`low_stock_threshold`); daraus rechnet G-74 bereits `tage_bis_leer` und
`unter_schwelle`. **Das Reorder-Fenster schreibt dorthin.**

`[read]` **Es bestellt aber nichts.** Es trägt nach, was da ist — eine
Bestellung braucht `shopping_lists` (C-175). Das Fenster sagt es selbst.

`[cmd]` **Der Skip-Grund landet in `notes`.** `intake_logs` hat keine
Spalte dafür; es führt `status='skipped'` und `notes`. **Das Fenster
schreibt aus, was gespeichert wird**, damit niemand eine Auswertung
nach Gründen erwartet. **Als Befund vermerkt, nicht als Mangel.**

---

## Was Attrappe bleibt

`[cmd]` **Auf der Seite: 1** — unverändert, wie der Auftrag es nannte.
`[read]` **Sie stammt nicht aus den Fenstern**, sondern aus der
Randspalte des Rahmens; die Supplements-Tabs selbst rendern auf
`today`, `compliance` und `inventory` keine markierte Kachel mehr.
**Die Marke in `tabs.tsx:971` (`SuppInteractions`) zählt nicht mit** —
der Zweig ist seit G-110 durch den echten Interactions-Tab abgelöst und
wird nicht mehr gerendert.

`[cmd]` **In den Fenstern: sieben von zwölf.** Sie tragen die Marke und
je einen eigenen Grund.

### Der Befund aus G-135 — und er hat hier zugeschlagen

`[read]` **Die Warnung des Auftrags:** *„Eine gerechnete Attrappe zählt
nicht als Attrappe."*

`[cmd]` **Der umgekehrte Fall ist hier passiert, und die Messung hat
ihn gefunden:** Nach dem Anbinden zeigte das Add-Fenster *„Es sind
keine Daten gelesen"* — **obwohl die Seite daneben 360 Einnahmen und
vier Positionen zeigte.**

`[cmd]` **Die Ursache:** `<SupplementsModale>` stand **ausserhalb** von
`<SuppCtx.Provider>` (`ansicht.tsx:294`). `useSupp()` lieferte dort den
Vorgabewert — `daten: null`. **Der Typecheck war grün, die Tests waren
grün, und das Fenster log.**

`[read]` **Gefunden nur, weil das Fenster im Browser geöffnet und
angesehen wurde.** Ein Zähler hätte es nie gemeldet: Die Marke stand
korrekt da, nur aus dem falschen Grund.

### Und die Marke fällt weg, wenn geschrieben wird

`[cmd]` **`Rahmen` nimmt jetzt `echt`** — ohne den Schalter bleibt die
Marke. `[read]` **Ein Fenster, das schreibt und trotzdem „Attrappe"
sagt, wäre die Lüge in die andere Richtung.** Belegt: im geöffneten
Add-Fenster zählt `.v2-modal-h .v2-pill` **0**, vorher **1**.

---

## Was gemessen wurde

| Prüfung | Ergebnis |
|---|---|
| Einnahme eintragen → neu laden → steht da | **360 → 361, Notiz im DOM** |
| Compliance ändert sich | **93,1 % → 93,2 %** |
| Zurücknehmen | **361 → 360**, kein Rest |
| Supplement zum Stack, mit Katalogsuche | **4 → 5**, „Magnesium" mit Evidenzgrad |
| Position entfernen | **5 → 4**, kein Rest |
| **Zeilenschutz, drei Wege** | **je 404 NOT_FOUND** |
| Zeitnormalisierung | `07:42` → **`07:42:00`** |
| Attrappen gerendert | **1** (unverändert) |
| Konsolenfehler | 2 (`data-mode`, G-123), **0 SVG** |
| Tests | **469 von 469 grün** |
| `pnpm gate` | **11/11 Tasks** |

**Bildschirmfotos:** `backup/g148-today-{1440,375}-{hell,dunkel}.png`,
`backup/g148-{compliance,inventory}-1440-hell.png`,
`backup/g148-add.png`.

**Datenbestand nach dem Lauf:** 4 Positionen, 360 Einnahmen —
**exakt wie vorher.**

---

## Geänderte Dateien

| Datei | Änderung |
|---|---|
| `apps/web/src/lib/supplements/stack-write.ts` | **neu** — fünf Schreibfunktionen |
| `apps/web/src/app/api/supplements/intake/route.ts` | **neu** — POST · PATCH · DELETE |
| `apps/web/src/app/v2/supplements/modale.tsx` | vier Fenster angebunden, `echt`-Schalter |
| `apps/web/src/app/v2/supplements/kontext.tsx` | fünf Felder für die Schreibwege |
| `apps/web/src/app/v2/supplements/ansicht.tsx` | `toggleTaken` schreibt; Modale **in** den Provider |

**Kein Schema geändert. `nutrition` nicht berührt, `packages/ui` nicht
berührt, `Injections` nicht angefasst, die sechs gelesenen Tabs nicht
umgebaut.**

---

## Was offen bleibt

**1. Der Haken auf „Today" bucht auf den Stichtag, nicht auf heute.**
`[cmd]` `stichtag` ist der jüngste Protokolltag (**2026-08-20**), weil
`new Date()` im Browser die Hydration zerlegt (G-74). **Wer heute etwas
nachträgt, bucht auf den letzten protokollierten Tag.** `[read]` Der
saubere Weg ist ein serverseitiges `heute` als Prop — die Seite reicht
es bereits durch (`heuteProp`), sie setzt es nur nicht.

**2. Fünf Skip-Gründe sind Freitext in `notes`.** Eine Auswertung
danach gäbe es erst mit einer eigenen Spalte oder einem Enum.

**3. `LogDose` erreicht man nur über den Extended-Tab.** `[cmd]` Auf
„Today" gibt es den Haken und „Skip", aber keinen Weg, Zeit und Notiz
mitzugeben. **Ein Stift-Knopf je Zeile wäre der vollständige Weg** —
dasselbe Muster wie G-124 beim Wasser.

**4. Nebenwirkungen und Zyklen haben keine Tabelle** — als **C-186**
angelegt.

**5. Vier Hilfsskripte liegen unter `tools/_g148-*.mjs`.**
`_g148-kreis.mjs` (Zeilenschutz) und `_g148-rundgang.mjs` (der Kreis)
haben Zweitnutzen; die anderen zwei sind Wegwerfware.
