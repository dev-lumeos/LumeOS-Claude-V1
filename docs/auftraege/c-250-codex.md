# C-250 + C-251 — Codex, 2026-08-23

Bericht: `docs/berichte/c-250-codex.md`

Zwei Punkte. **C-251 zuerst** — er ist klein und ein anderer Agent
wartet darauf.

---

## C-251: Seed fuer die Einkaufslisten (blockiert C-249)

`[cmd]` `nutrition.shopping_lists` **0**, `shopping_list_items` **0** —
auf jedem Konto, Gesamtbestand null. Die Tabellen selbst gibt es seit
C-246 (je 4 Policies, 2 Trigger).

`[cmd]` **Claude Code ist deswegen blockiert.** Er kann die Kacheln
*„Shopping list"* und *„Scale list"* anbinden, aber nicht belegen: eine
gerenderte Null sieht aus wie ein kaputter Lesepfad.

`[cmd]` **Die Fremdschluesselspalte heisst `shopping_list_id`, nicht
`list_id`** — Claude Code ist darauf hereingefallen, das spart dir eine
Runde.

**Zu tun:** eine Einkaufsliste auf `test-user@lumeos.local` mit genug
Posten, dass eine Kachel etwas zu zeigen hat. **Positionen aus echten
`nutrition.foods`-Zeilen**, nicht aus Freitext — sonst ist der
Lesepfad ueber die Verknuepfung wieder nicht belegt.

**Nachweis:** Zahl der Listen und Posten in der RLS-Sicht von
`test-user@lumeos.local`, **vor dem Lauf hingeschrieben.** Nicht die
Gesamtzahl — das ist die Falle aus C-241.

---

## C-250: Schritt 4A, der Stack-Pfad

Schritt 4 des Supplements-Neuaufbaus, **Teil A.**
Teil B (Substanz-Pfad) kommt getrennt und ist nicht Gegenstand.

### Das ist eine Reparatur, keine Aufraeumarbeit


`[cmd]` C-243 hat den Fremdschluessel umgehaengt:
`stack_items_supplement_id_fkey` zeigt jetzt auf
`supplements.supplements(id) ON DELETE RESTRICT`. Der alte auf
`supplement_catalog` ist weg.

`[cmd]` `stack-read.ts:197` liest aber weiterhin ueber einen
PostgREST-Embed **auf den alten Fremdschluessel**:

    supplement_catalog:supplement_id (
      id, slug, name, category, evidence_grade, evidence_summary,
      typical_dose_min, typical_dose_max, dose_unit, serving_size,
      serving_unit, cost_per_serving, timing_default, requires_food,
      priority, benefits
    )

`[annahme]` Damit findet PostgREST die Beziehung nicht mehr und der
Stack-Lesepfad bricht. **Das ist noch nicht am Bildschirm belegt** —
belege es als Erstes, mit `node tools/schuss.mjs` auf `/v2/supplements`
und `/v2/medical`, angemeldet als `test-user@lumeos.local`.

`[read]` **Der Auftrag zu C-243 war meiner und hat den Lesepfad nicht
verlangt.** Derselbe Fehlertyp steht als A-50 im Register: *ein
`DROP COLUMN` prueft die Lesepfade nicht.*

## WAS ICH GEMESSEN HABE

`[cmd]` Betroffene Stellen:

    apps/web/src/lib/supplements/stack-read.ts     Z197, Z286, Z307
    apps/web/src/lib/supplements/stack-write.ts    Z119, Z260
    apps/web/src/app/v2/medical/page.tsx           Z162

`[cmd]` Alt gegen neu:

    supplements.supplement_catalog     44 Zeilen, flach
    supplements.supplements           566 Zeilen (290 mit im_katalog)
      + supplement_dosing             566
      + supplement_pharmacology       566
      + supplement_safety             290
      + supplement_categories          23
      + supplement_groups               3

`[cmd]` `supplements.supplements` hat: `id, slug, group_id,
category_id, name_de, name_en, name_th, description_de/en/th, form,
evidence_grade, sort_order, source, is_active, im_katalog`.

`[cmd]` **`supplement_groups` heisst `label_de`, nicht `name_de`** —
ich bin selbst darauf hereingefallen. **Spaltennamen nachsehen, nicht
raten.**

`[cmd]` **Die alte Tabelle hat Felder, die die neue nicht hat:**
`typical_dose_min/max`, `serving_size`, `serving_unit`,
`cost_per_serving`, `timing_default`, `requires_food`, `priority`,
`benefits`, `evidence_summary`. Ein Teil steckt in
`supplement_dosing` (`guideline_dose`, `studied_dose_ranges`,
`upper_limit`, `usage_hint_de/en/th`) — **ein Teil hat kein
Gegenstueck.**

## WAS ZU TUN IST

1. **Zuerst den Bruch belegen.** Screenshot vor der Aenderung, mit
   Konsolenfehlern. Ohne diesen Beleg ist nicht messbar, ob die
   Reparatur etwas repariert hat.

2. Die drei Dateien auf `supplements.supplements` umstellen. Anzeige
   ueber `COALESCE(NULLIF(name_de,''), name_en)` — `[cmd]` `name_de`
   ist bei allen 566 leer, das ist laut Spec so gewollt, die Anzeige
   faellt auf Englisch zurueck.

3. **Fuer jedes Feld ohne Gegenstueck: melden, nicht erfinden.**
   Schreib in den Bericht, welches Feld wohin geht und welches keine
   Quelle hat. Eine Kachel, die `cost_per_serving` zeigt, weil das
   Feld frueher da war, zeigt sonst eine erfundene Zahl.
   `[read]` *„eine erfundene 87 sieht aus wie eine gemessene 87."*

4. Wo ein Feld keine Quelle hat: Kachel mit Marke und **gemessener**
   Begruendung stehen lassen, wie in G-161. **Keinen Strich und keine
   Null** — ein Strich hiesse „leer" statt „gibt es nicht".

## WAS NICHT ZU TUN IST

`apps/web/src/app/v2/nutrition` und `.../recovery` **nicht anfassen** —
dort laufen zwei andere Agenten. `apps/coach/` ebenfalls nicht.

`substanz-read.ts` und `substanz-detail.tsx` **nicht anfassen** — das
ist Teil B.

`supplement_catalog` und `substance_catalog` **nicht loeschen**. Das
ist Schritt 5 und kommt erst, wenn 4 gemessen ist.

Keine Entscheidung zur Salzform (C-244), keine zu den 276 verborgenen
Zeilen (entschieden in C-243).

Nicht committen, nicht stagen, nicht pushen.
Nichts in `docs/todo/` oder `docs/ssot/` schreiben.

## NACHWEIS — Erwartung VOR dem Lauf, beide Richtungen

`[cmd]` Auf `test-user@lumeos.local` liegt ein Stack *„Nachweis-Stack"*
mit **3 Positionen**: Creatine monohydrate (`sub_9f9bb8c160`, 12
Einnahmen), Omega-3 (EPA/DHA) (`sub_4480fcfa86`, 0), Vitamin D3
(`custom_name`, 12 Einnahmen).

**Nachher muessen genau diese drei mit Namen erscheinen** — zwei aus
dem Katalog, eine als freier Text. Schreib die Erwartung hin, bevor du
misst.

**Gegenprobe:** eine Position mit einer `supplement_id`, die es nicht
gibt, darf die Liste nicht leeren, sondern muss genau diese eine Zeile
als unbekannt zeigen.

**Negativprobe:** einen Feldnamen absichtlich falsch schreiben; der
Test muss rot werden. `[read]` Ein Test, der auch mit eingebautem
Fehler gruen bleibt, misst nichts — das ist bei G-161 passiert, weil
die Fixtures gleichverteilt waren.

Screenshot vorher und nachher, `node tools/schuss.mjs`, mit
Attrappenzahl und Konsolenfehlern.

## OFFENE ARBEIT VON DIR

`[cmd]` **C-248 ist durch und vom Orchestrator nachgemessen:**
`biomarker_reference_ranges` 560 · LOINC mit mehreren `curated_slug`
**0** · `supplement_evidence.overall_grade` **290** ·
`supplements.evidence_grade` **290**. Deine Dateien bleiben ungestaged
liegen, sie werden zusammen committet.

`[read]` **Der Encoding-Schaden in
`schema-vollstaendigkeit-pruefen.ts` ist von Fable behoben** (Zeile
610, `c3a2 e282ac e2809d`, ueber CP1252 zurueckgedreht, hex-verifiziert).
Das Gate ist frei.

`[read]` **Die Ursache lag mutmasslich in deiner Sitzung.** Schreib
Repo-Text mit Sonderzeichen nicht ueber die Standardeingabe einer
interaktiven Sitzung — `python - <<EOF` und Vergleichbares. Skriptdatei
im Scratchpad, oder direkt schreiben, `encoding="utf-8",
newline="\n"`. Der Hergang steht in `docs/ssot/32-encoding-schaeden.md`,
Fortschreibung 2026-08-23.


## REGELN

`tools/lauf.py` fuer jeden Befehl, keine Konsolenfenster.
Nie `pnpm dev` oder `npx next dev` — nur `python tools/server.py`.
`.next` nie loeschen, `next build` nie direkt aufrufen.
Pruefschleifen als Skript-Datei, nicht als Shell-Einzeiler mit `$(...)`.
Nachweise auf `test-user@lumeos.local`, nicht auf `dev`.
Nachweisdateien mit `encoding="utf-8", newline="\n"`.

**Wenn eine Vorgabe nicht aufgeht: melden, nicht passend machen.**
