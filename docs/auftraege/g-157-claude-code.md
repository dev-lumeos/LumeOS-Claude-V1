# G-157 + G-163 (nutrition) + C-249 — Claude Code, 2026-08-23

Bericht: `docs/berichte/g-157-claude-code.md`

Drei Punkte, ein Modul: `apps/web/src/app/v2/nutrition`. Sie haengen
zusammen — deshalb ein Auftrag, aber ein Bericht mit drei Abschnitten.

---

## 1 · G-157: eine Kachelgruppe zeigt erfundene Zahlen OHNE Marke

`[cmd]` `nutrition/nutrients-entwurf.tsx` — **12 Kacheln, null Marken,
keine Lesezugriffe.** 79 erfundene Naehrstoffeintraege.

`[cmd]` Sie ist der Rueckfall des Nutrients-Tabs,
`nutrition/ansicht.tsx:531`:

    ordnung && ordnung.gruppen.length > 0
      ? <NaehrstoffOrdnungTab d={ordnung} />
      : <NutrientAnalysisView />

`[cmd]` `nutrition.nutrient_defs` traegt **138 Zeilen mit 40
Wurzelknoten** — der echte Zweig laedt. **Die Datei erscheint im
Betrieb nicht.** Wenn sie doch erscheint, zeigt sie erfundene Zahlen
ohne jede Warnung.

`[read]` *„eine erfundene 87 sieht aus wie eine gemessene 87"* (G-155).

**Zu tun:** Datei entfernen, Rueckfall durch eine leere Flaeche mit
Hinweis ersetzen.

## 2 · G-163 (nutrition-Teil): die markierten Rueckfaelle

`[cmd]` `nutrition/tab-plans` **8** · `nutrition/tab-prefs` **6**.

Tom hat am 2026-08-23 entschieden: **sie fliegen.**

`[read]` **`tab-prefs` behauptet, Vorlieben haetten keine Spalten** —
das stimmt nicht mehr. Ein Rueckfall mit veraltetem Text ist schlimmer
als keiner.

**Unterscheidung:** eine echte Attrappe hat **keinen** echten Zweig
daneben. Ein Rueckfall steht im `else` eines Ausdrucks, dessen `then`
echte Daten liest. **Nur die Rueckfaelle entfernen.**

`[cmd]` **Diese fuenf bleiben Attrappe, mit gemessener Begruendung** —
belegt in G-161: `meal_plan_entries` hat **0** Statusspalten,
`meal_plans` **0** der fuenf Lifecycle-Spalten.

## 3 · C-249: zwei Kacheln, deren Begruendung nicht mehr gilt

`[cmd]` G-161 liess *„Shopping list"* und *„Scale list"* als Attrappe
stehen, belegt mit *„0 `shopping%`-Tabellen"*. **Das stimmte
vormittags.**

`[cmd]` **Seit C-246 gibt es sie live:** `shopping_lists` und
`shopping_list_items`, 8 Policies, 4 Trigger, 5 Fremdschluessel.

**Zu tun:** beide Kacheln anbinden. `[cmd]` **Vorher die RLS-Sicht
messen, nicht die Gesamtzahl** — G-161 hat das richtig gemacht, C-241
hat gezeigt, was passiert, wenn nicht. Wenn auf
`test-user@lumeos.local` keine Einkaufsliste liegt: **melden**, dann
ist ein Seed noetig und der gehoert Codex.

## WAS NICHT ZU TUN IST

`apps/web/src/app/v2/recovery`, `apps/coach/` und
`apps/web/src/app/v2/supplements` **nicht anfassen** — dort laeuft ein
anderer Agent.

Keine echte Attrappe entfernen, nur weil sie eine Marke traegt. **Im
Zweifel stehen lassen und melden.**

Nicht committen, nicht stagen, nicht pushen.
Nichts in `docs/todo/` oder `docs/ssot/` schreiben.

## NACHWEIS — Erwartung VOR dem Lauf, beide Richtungen

**Schreib die erwartete Markenzahl je Tab hin, bevor du misst.**

Gemessen wird mit `node tools/schuss.mjs` an der **gerenderten** Seite,
nicht am Quelltext — `[cmd]` bei G-161 lagen Quelltextzahl und
Renderzahl auseinander (5 gegen 4).

**Gegenprobe:** eine Seite ohne Sitzung muss den Hinweis zeigen, **nicht
die alten erfundenen Zahlen.** Kannst du den Rueckfall nicht ausloesen,
ist der Beleg nicht gefuehrt.

**Negativprobe:** einen Rueckfall absichtlich wieder einbauen; die
Markenzaehlung muss steigen. `[cmd]` Dein eigener erster Test in G-161
blieb gruen, obwohl ein Fehler eingebaut war — die Fixtures waren
gleichverteilt. **Dieselbe Falle gilt hier.**

Fuer C-249: die gerenderten Zahlen muessen der RLS-Sicht von
`test-user@lumeos.local` entsprechen, nicht der Gesamtzahl.

## REGELN

`tools/lauf.py` fuer jeden Befehl, keine Konsolenfenster.
Nie `pnpm dev` oder `npx next dev` — nur `python tools/server.py`.
`.next` nie loeschen, `next build` nie direkt aufrufen.
Pruefschleifen als Skript-Datei, nicht als Shell-Einzeiler mit `$(...)`.
Nachweise auf `test-user@lumeos.local`, nicht auf `dev`.

**Wenn eine Vorgabe nicht aufgeht: melden, nicht passend machen.**
