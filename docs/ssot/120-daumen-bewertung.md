# 118 — Daumen hoch und runter in Liste und Detail (G-67)

Stand: 2026-08-19 · Anker: Zweig `dev` · Auftrag G-67
Herkunft: gebaut und am Bildschirm geprüft in dieser Sitzung.
Rangfolge: Code > dieses Dokument > Rest.

**Tom, 2026-08-18:** *„Bau in die Detailansicht des Foods einen Daumen
hoch und Daumen runter ein. Der User kann, wenn er sich ein Resultat
anschaut, das gleich klassifizieren für sich."*

`[cmd]` **Gebaut an beiden Stellen:** in der Trefferliste des
Food-DB-Tabs und an der Detailansicht der Suche. **Kein Schema
geändert** — `food_preference_items` trug alles Nötige.

---

## Wo der Daumen sitzt und was er schreibt

### Zwei Stellen, ein Bauteil

| Ort | Form |
|---|---|
| **Trefferliste** (`/v2/nutrition?tab=foods`) | in der schmalen ersten Spalte, die der Entwurf für das Lesezeichen vorsieht |
| **Detailansicht** (`/v2/nutrition/suche`) | über den Nährwerten, mit Klartext daneben („Mag ich" / „Mag ich nicht" / „Noch nicht bewertet") |

`[read]` **Die Spalte war schon da.** G-66 hat sie leer stehen lassen
mit dem Vermerk *„der Daumen ist G-67"* — sie ist jetzt gefüllt, die
Form des Entwurfs bleibt.

### Die Symbole: ✓ und ✕, nicht erfunden

`[cmd]` **`packages/ui` führt kein `thumb_up`/`thumb_down`**, und die
Datei darf in diesem Auftrag nicht angefasst werden.

`[cmd]` **Genommen sind `check` und `x`** — genau die Zeichen, die das
Vorgängerrepo benutzt: `FoodPreferences.tsx:709` rendert
`rating === 'like' ? '✓' : '✕'`, grün bzw. rot. **Keine Notlösung,
sondern die dort getroffene Produktentscheidung.**

`[read]` `trend_up`/`trend_down` wären vorhanden gewesen, sagen aber
etwas anderes — eine Vorliebe ist kein Verlauf.

### Was geschrieben wird

`[cmd]` Eine Zeile in `nutrition.food_preference_items`:

| Spalte | Daumen hoch | Daumen runter |
|---|---|---|
| `preference` | `liked` | `disliked` |
| `strength` | `like` | `soft_dislike` |
| `target_type` | `food` | `food` |
| `source` | **`search_thumb`** | **`search_thumb`** |

`[cmd]` **Gemessen nach einem Klick auf „Tofu":**

```
name_de | preference | strength | source
--------+------------+----------+--------------
Tofu    | liked      | like     | search_thumb
```

### Der Zyklus

`[cmd]` **neutral → like → dislike → neutral**, wie im Vorgängerrepo
(`FoodPreferences.tsx:695`). Ein zweiter Klick auf die aktive Richtung
setzt zurück.

`[read]` **`neutral` ist keine Zeile mit `strength: 'neutral'`, sondern
das Fehlen einer Zeile.** Eine Zeile, die „egal" sagt, wäre eine
Aussage, wo keine gemeint ist. Gemessen: nach dem Zurücksetzen sinkt
`search_thumb` von 2 auf 1 Zeile.

### Die Sicherheitsabfrage — nur abwärts

**Tom, 2026-08-18: Sicherheitsabfrage, dann weg.**

`[cmd]` **Daumen hoch fragt nicht.** Gemessen: kein Dialog,
`aria-pressed` springt auf `true`, die Zeile bleibt.

`[cmd]` **Daumen runter fragt**, und die Abfrage nennt das Lebensmittel:

> **Walnuss künftig nicht mehr anzeigen?**
> Das Lebensmittel verschwindet aus dieser Liste. Rückgängig geht es
> unter **Preferences · Individual foods**.
> [ Abbrechen ] [ Nicht mehr anzeigen ]

`[read]` **Nicht „Sind Sie sicher?"** — Tom hat ausdrücklich verlangt,
dass die Abfrage sagt, was sie tut, und wo es rückgängig geht.

`[cmd]` **Abbrechen schreibt nichts:** nach dem Abbruch stand weiter nur
die eine `liked`-Zeile in der Datenbank, alle 50 Zeilen blieben
sichtbar. **Bestätigen entfernt die Zeile:** 50 → 49, „Walnuss"
verschwunden.

### Der Klick öffnet die Zeile nicht

`[cmd]` Beide Knöpfe rufen `stopPropagation()` und `preventDefault()`,
zusätzlich die umschliessende Spanne. `[read]` **Sonst bewertet man
versehentlich, was man nur ansehen wollte** — die Zeile führt ins
Detail, der Daumen nicht.

---

## Wie `source` und `strength` gesetzt werden

### `source: 'search_thumb'` — die Herkunft trennt zwei Absichten

`[cmd]` **Die Spalte hat keine CHECK-Bedingung** und den Vorgabewert
`'user'`; G-65 schreibt `'settings'`. **Ein eigener Wert kostet keine
Schemaänderung.**

`[read]` **Warum die Trennung zählt** — und das ist Toms eigener Punkt:
Eine Bewertung aus dem Assistenten ist eine **Absicht** (jemand setzt
sich hin und geht Listen durch). Ein Daumen beim Suchen ist eine
**Gewohnheit** (es fällt nebenbei ab). **Beides zählt, aber nicht
gleich viel** — und wer später auswertet, muss es unterscheiden können,
auch wenn heute noch nichts davon abhängt.

### `strength` — eine Stufe unter dem Assistenten

**Entschieden: der Daumen wiegt schwächer.**

`[cmd]` Die erlaubten Stufen (`food_preference_items_strength_check`):

```
hard_exclude · strong_avoid · soft_dislike · neutral · like · boost
```

| | Assistent (G-65) | **Daumen (G-67)** |
|---|---|---|
| positiv | `boost` | **`like`** |
| negativ | `hard_exclude` | **`soft_dislike`** |

**Die Begründung, in dieser Reihenfolge:**

1. `[read]` **Der Aufwand sagt etwas über die Absicht.** Wer den
   Assistenten durchklickt, hat sich hingesetzt und *entschieden*. Wer
   beim Suchen einen Daumen drückt, hat *reagiert*. Ein Klick im
   Vorbeigehen soll nicht so schwer wiegen wie eine Sitzung.

2. `[read]` **Der Fehlklick ist hier wahrscheinlicher.** In einer Liste
   mit 50 Zeilen und kleinen Knöpfen trifft man leichter daneben als in
   einem Formular, das genau dafür gebaut ist. `soft_dislike` ist
   verzeihlicher als `hard_exclude`.

3. `[cmd]` **`hard_exclude` ist mehr als eine Vorliebe.** Es ist die
   Stufe, die auch für Allergene gilt — und `62-lebensmittel-tags.md`
   hält fest, dass *„enthält Nüsse belegbar ist, enthält keine nicht"*.
   Eine Ausschlussstufe, die aus einem Listenklick entsteht, würde
   diese Schwere verwässern.

`[annahme]` **Was das praktisch heisst, entscheidet C-94.** Dort wirkt
die Vorliebe auf die Suche. Der Daumen setzt nur; ob `soft_dislike`
dort abwertet oder ausblendet, ist die Frage des nächsten Auftrags.

---

## Was bei Widerspruch gilt

**Entschieden: das Spätere gewinnt — pro Lebensmittel, nicht pro
Quelle.**

`[cmd]` **Technisch erzwungen, nicht nur vereinbart:**
`uq_food_pref_items_user_food` ist ein eindeutiger Index auf
`(user_id, food_id)`. **Es kann je Nutzerin und Lebensmittel nur eine
Zeile geben.** Wer den Daumen drückt, ersetzt die vorhandene Zeile —
gleich, woher sie kam.

`[read]` **Warum das Spätere und nicht das Stärkere:** Eine Vorliebe
ist eine Aussage über den Moment. Wer im Assistenten „mag ich" gesetzt
hat und Monate später beim Suchen den Daumen runter drückt, hat seine
Meinung geändert — nicht sich geirrt. Ein System, das die ältere,
„stärkere" Aussage gewinnen liesse, würde die Korrektur verweigern.

`[read]` **Und es ist die einzige Regel, die man ohne Erklärung
versteht.** „Der letzte Klick zählt" braucht keine Dokumentation; „der
Assistent schlägt den Daumen, ausser bei hard_exclude" braucht sie.

### Der Sonderfall in der Anzeige

`[cmd]` `daumenStand()` zeigt eine Zeile mit `hard_exclude` als
**Ablehnung** an, nicht als eigenen Zustand. `[read]` Der Daumen kennt
drei Zustände und zeigt die **Richtung**, nicht die Stufe — sonst
stünde in der Liste ein vierter Knopf, den niemand drücken kann.

---

## Ein Befund an der Naht zu G-65

`[cmd]` **Meine beiden Testbewertungen sind während dieser Sitzung
verschwunden** — genauer: sie haben ihre Herkunft verloren.

**Vorher:**
```
Hafer Flocken | liked    | like         | search_thumb
Walnuss       | disliked | soft_dislike | search_thumb
```

**Nachher, ohne mein Zutun:**
```
Hafer Flocken | liked    | settings
Walnuss       | disliked | settings
```

`[cmd]` **Die Ursache ist gemessen, nicht vermutet:**

1. `nutrition.food_preferences_write` — die RPC, die G-65 benutzt —
   macht **`DELETE FROM nutrition.food_preference_items WHERE user_id =
   p_user_id`** und schreibt danach den ganzen Satz neu.
2. `vorlieben-aktionen.ts:103` schreibt dabei **fest `source:
   'settings'`**, obwohl `vorlieben-lesen.ts:154` die Spalte einliest.

`[read]` **Die Bewertung überlebt, die Herkunft nicht.** Inhaltlich ist
nichts verloren — Hafer Flocken bleibt `liked`, Walnuss bleibt
`disliked`. Aber sobald jemand den Preferences-Tab speichert, sehen alle
Daumen-Bewertungen aus wie Assistenten-Eingaben.

**Genau deshalb schreibt der Daumen nicht über diese RPC.** `[cmd]` Ein
einzelner Klick über `food_preferences_write` hätte **jede andere
Vorliebe gelöscht** — der Daumen schreibt stattdessen gezielt auf die
eine Zeile, was die vier RLS-Regeln (`auth.uid() = user_id`) und der
eindeutige Index erlauben.

**Meldung an G-65, keine Änderung von mir:** `vorlieben-aktionen.ts`
gehört dem parallel laufenden Auftrag, und der Auftrag sagt
ausdrücklich *„fass sie nicht an"*. **Der Vorschlag:** beim Speichern
die vorhandene `source` je Zeile übernehmen statt `'settings'` zu
setzen — die Spalte wird bereits gelesen.

---

## Was NICHT gebaut wurde

`[read]` **Kein automatisches Lernen aus dem Verhalten.** Was jemand
oft isst, ist keine Zustimmung — es kann Gewohnheit, Preis oder
Zeitmangel sein. **Der Daumen ist eine Aussage, das Protokoll nicht.**

`[cmd]` **Keine Empfehlung daraus abgeleitet** — das ist Buddys
Aufgabe.

`[cmd]` **Die Suche nicht umgebaut.** Das Ausblenden nach dem Abwerten
ist eine Anzeigewirkung in der Liste; **die Suche filtert weiterhin
nichts** — das ist C-94. `[read]` Hier wird gesetzt, dort gewirkt.

`[cmd]` **`packages/ui` nicht angefasst**, und die drei G-65-Dateien
(`tab-vorlieben.tsx`, `vorlieben-lesen.ts`, `vorlieben-aktionen.ts`)
ebenso wenig.

---

## Nachweise

`[cmd]` Am Bildschirm geprüft, 2026-08-19, als `dev@lumeos.app`:

| Prüfung | Ergebnis |
|---|---|
| Knöpfe je Zeile | `[cmd]` **2**, beschriftet („Tofu mag ich" / „…mag ich nicht") |
| **Daumen hoch fragt nicht** | `[cmd]` kein Dialog, `aria-pressed=true`, Zeile bleibt |
| **Daumen runter fragt** | `[cmd]` Dialog mit **Namen des Lebensmittels** und Rückgängig-Hinweis |
| **Abbrechen schreibt nichts** | `[cmd]` Datenbank unverändert, 50 Zeilen bleiben |
| **Bestätigen blendet aus** | `[cmd]` **50 → 49**, „Walnuss" verschwunden |
| **Zustand nach Neuladen** | `[cmd]` Tofu weiter `aria-pressed=true`, Walnuss weiter ausgeblendet (49) |
| **Zyklus schliesst sich** | `[cmd]` zweiter Klick → `aria-pressed=false`, Zeile in der Datenbank gelöscht (2 → 1) |
| **Detailansicht** | `[cmd]` Daumen über den Nährwerten, Klartext springt auf „Mag ich" |
| **Zeilenschutz** | `[cmd]` als `test-user@lumeos.local`: **0 Zeilen sichtbar**, als `dev@lumeos.app`: **6** |
| Konsolenfehler | `[cmd]` 0 |
| `pnpm gate` | `[cmd]` **grün, 8 von 8** |
| Vier Breiten | `[cmd]` 1440 / 1024 / 768 / **375 px** — 0 Karten mit Überlauf, kein Seitenüberlauf |
| Hell und dunkel | `[cmd]` beide geprüft |

### Die Tests

`[cmd]` **Sechs neue Prüfungen** in
`src/lib/nutrition/__tests__/daumen-schreiben.test.ts` — der Zyklus,
die Stufen und die Herkunft. Sie prüfen die Werte **gegen die
CHECK-Bedingungen der Tabelle**: ein Tippfehler in `strength` fiele
sonst erst in der Datenbank auf.

### Bildschirmfotos

| Datei | Inhalt |
|---|---|
| `g67-liste-hell-1440.png` | die Trefferliste mit Daumen, hell |
| `g67-liste-dunkel-{1440,1024,768,375}.png` | dunkel, vier Breiten |
| `g67-abfrage-hell-1440.png` | die Sicherheitsabfrage mit dem Namen |
| `g67-detail-hell-1440.png` | der Daumen an der Detailansicht |

### Geänderte Dateien

| Datei | Was |
|---|---|
| `lib/nutrition/daumen-schreiben.ts` | **neu** — Zyklus, Stufen, gezieltes Schreiben und Lesen |
| `v2/nutrition/daumen-aktion.ts` | **neu** — Serveraktion |
| `v2/nutrition/daumen.tsx` | **neu** — die Knöpfe und die Abfrage |
| `lib/nutrition/__tests__/daumen-schreiben.test.ts` | **neu** — sechs Prüfungen |
| `v2/nutrition/tab-foods.tsx` | Daumen in der ersten Spalte, Ausblenden nach dem Abwerten |
| `v2/nutrition/suche/ansicht.tsx` | Daumen an der Detailansicht |

**Nichts ist committet oder gestaged.**
