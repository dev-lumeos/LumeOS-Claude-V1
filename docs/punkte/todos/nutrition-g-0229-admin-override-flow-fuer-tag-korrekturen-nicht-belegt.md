---
nr: G-229
typ: feature
modul: nutrition
schwere: mittel
angelegt: 2026-08-28
braucht: [C-384]
kind_von: null
entscheidung: E-55
beruehrt:
  dateien: [docs/specs/Nutrition/05_reviews/OPUS_REVIEW_NUTRITION_03_UI_FLOWS_READINESS.md]
zahlen: null
---

# G-229 — Admin-Override-Flow für Tag-Korrekturen nicht belegt

## Befund

**Aus `OPUS_REVIEW_NUTRITION_03_UI_FLOWS_READINESS.md`, IMP-7.**
`[read]` **Wortlaut der Review, nicht vom Orchestrator formuliert.**

`NUTRITION_NEXT_SPEC_DECISIONS.md §5`:
> manuell gepflegte Tag-Liste für schwierige Tags
> Admin darf Tags bei BLS Foods korrigieren
> User darf Tags bei Custom Foods selbst setzen

`SPEC_06_DATABASE_SCHEMA.md` Trigger `auto_tag_food` — automatisch.
Manueller Override-Mechanismus für Admin nicht belegt:
- Kein Admin-API-Endpoint in SPEC_07 oder SPEC_07_PASS2_PATCH (nicht belegt)
- Kein Admin-UI in SPEC_10 (nicht belegt)
- Trigger löscht alle bestehenden Tags vor INSERT (`DELETE FROM food_tags WHERE food_id = p_food_id;`) — dadurch würde ein manueller Admin-Override beim nächsten `UPDATE foods` automatisch überschrieben.

User-Tags für Custom Foods:
- Decisions §5: "User darf Tags bei Custom Foods selbst setzen"
- `foods_custom` hat `custom_allergens TEXT[]` (EU-14 Allergene), aber kein generisches Tag-Feld.
- Kein API-Endpoint für `POST /foods/custom/:id/tags` in SPEC_07.

**Konsequenz:** Wenn V1 Admin-Tag-Korrekturen oder User-Custom-Tags verlangt, sind diese Pfade nicht implementierbar.

---

## Stand

`[read]` **Die Review stammt aus der Spec-Phase und ist nicht gegen
den heutigen Stand geprueft.** `[cmd]` **Sie kennt die Entscheidungen
vom 27./28.08. nicht** — was sie fordert, kann inzwischen entschieden
oder erledigt sein.

**Verwandter Punkt:** C-31 (Admin-Oberflaeche fuer die Kuration). `[read]` **Nicht zusammengelegt** — ob es
derselbe Befund ist, gehoert geprueft, nicht angenommen.

## Gegen den heutigen Stand gemessen, 2026-08-30

`[read]` **Dieser Punkt stammt aus
`OPUS_REVIEW_NUTRITION_03_UI_FLOWS_READINESS.md`** — **einer
Spec-Review von vor dem `/v2/`-Umbau.** `[cmd]` **Acht Punkte kommen
aus derselben Datei.**

`[cmd]` **Zu messen gegen `apps/admin`** — seit A-36 ist belegt,
dass Admin als eigene App gebaut ist, mit 314-zeiliger
Kurationsseite.

## Auftrag

**Mitbeauftragt mit G-226 am 2026-08-30.** Der Auftragstext
und der Bericht stehen dort.

## Bericht — Urteil: **offen**, praeziser gefasst

**Claude Code, 2026-08-31.** Mitbeauftragt mit G-226. **Der vollstaendige Bericht steht in [G-226](nutrition-g-0226-v1-status-marker-fehlen-fuer-recipes-shopping-mealplans-co.md#bericht).**

### Der Kern des Einwands faellt

`[cmd]` **`auto_tag_food` existiert nicht.** Kein Trigger im Schema
`nutrition` schreibt Tags — die 25 vorhandenen sind
`touch_updated_at`, Eigentuemerwaechter und zwei
Praeferenz-Auffrischungen.

`[read]` **Damit kann nicht passieren, was die Review beschreibt:**
*„der Trigger loescht alle Tags vor INSERT, ein Admin-Override wuerde
ueberschrieben."*

### Was bleibt, gilt

`[cmd]` **`food_tags` traegt 30.797 Zeilen, und es gibt keinen Weg,
sie zu aendern.** `[cmd]` `apps/admin/.../api/curation/route.ts:25`
liest `tag` als **Filter** — die Kurationsseite sucht nach Tags, sie
pflegt sie nicht. `[cmd]` **`foods_custom` hat kein Tag-Feld**, nur
`custom_allergens`.

`[read]` **Nicht „der Override wird ueberschrieben", sondern „es gibt
keinen Override".**

## Geprueft am 2026-08-31

**Urteil aus G-226:** offen, anders begruendet: `auto_tag_food` existiert nicht,
damit faellt der zentrale Einwand der Review.

`[read]` **Die Messung steht in der G-226-Datei.**

## Entschieden: E-55, 2026-09-02

**Kuration in einer zweiten Tabelle** — dasselbe Muster wie C-29 bei
den Anzeigenamen.

    food_tags           bleibt, was der Import erzeugt
    food_tags_kuriert   was ein Mensch gesetzt oder entfernt hat

`[read]` **Der Import muss dann nicht wissen, was er anfassen darf**
— **er leert seine Tabelle und fuellt sie neu.**

`[read]` **Und der Fall, den ein Herkunftsflag nicht koennte:**
*,,entferne `vegan` von Kokosmilch"* **braucht eine Zeile, die es
nicht gibt.** `[cmd]` **Die kuratierte Tabelle traegt ein
`entfernt`-Kennzeichen.**

`[cmd]` **`confidence` bleibt beim Import** — eine Kuration hat
keine, sie ist entschieden.

`[cmd]` **Und der Ort steht:** `apps/admin` hat eine Kurationsseite
mit 314 Zeilen, vollstaendig lesend (C-366). **C-31 fuehrt das als
Punkt.**

### Vorher: C-384

`[cmd]` **`auto_tag_food` existiert nicht.** `[read]` **Wer die
30.797 Zeilen schreibt, gehoert gemessen, bevor die zweite Tabelle
entsteht** — **sonst schuetzt sie vor einem Schreiber, den es nicht
gibt.**
