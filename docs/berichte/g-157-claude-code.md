# G-157 + G-163 (nutrition) + C-249 — Claude Code, 2026-08-23

Auftrag: `docs/auftraege/g-157-claude-code.md`

**Zwei von drei Punkten erledigt. C-249 ist blockiert** — die Tabellen
sind leer, ein Seed gehoert Codex.

Nicht committet, nicht gestaged, nicht gepusht.

---

## 1 · G-157 — der unmarkierte Entwurf ist weg

`[cmd]` **Die Praemisse stimmte, und war schlimmer als beschrieben.**
`nutrients-entwurf.tsx` trug **585 Zeilen, 12 Kacheln und null Marken**
— gezaehlt mit `rg -c "attrappe=\{ATTRAPPE\}"` am 2026-08-23. Dazu im
Detailfenster ein Verlauf ueber vierzehn Tage, im Quelltext selbst
beschriftet als `// Fake 14-day trend for visualization.` **Ebenfalls
ohne Marke.**

`[cmd]` **Der echte Zweig laedt:** `nutrition.nutrient_defs` traegt
**138 Zeilen mit 40 Wurzelknoten** (gemessen 2026-08-23). Die Datei
erschien im Betrieb also nicht — sie stand nur bereit.

`[cmd]` **Der Kommentar daneben war falsch.** `ansicht.tsx:524` sagte
*„79 erfundene Eintraege, aber mit Marke"*. Marken gab es keine. **Der
Kommentar ist mit der Datei entfernt.**

**Entfernt:** `nutrients-entwurf.tsx` (585 Zeilen).
**Neu:** `leer-hinweis.tsx` — eine Flaeche mit Grund, ohne Zahl.

## 2 · G-163 — `tab-prefs` ist weg, `tab-plans` bleibt

### `tab-prefs.tsx`: entfernt (203 Zeilen, 6 Marken)

`[cmd]` **Der Auftrag hatte recht: der Text war veraltet.** Die Marke
sagte *„dieser Entwurfs-Tab ist nicht an die vorhandenen
Vorlieben-Tabellen angebunden — die Schalter schreiben nichts"*.
**`VorliebenTab` liest `food_preferences` seit G-65 und schreibt seit
G-154.** Ein Rueckfall, der dem echten Zweig danebensteht und ihm
widerspricht.

### `tab-plans.tsx`: **bleibt, mit seinen 8 Marken**

`[read]` **Hier geht die Vorgabe nicht auf, und ich habe sie nicht
passend gemacht.** Der Auftrag zaehlt `tab-plans` unter den
Rueckfaellen — **nach seiner eigenen Regel ist die Datei keiner.**

> *„Ein Rueckfall steht im `else` eines Ausdrucks, dessen `then` echte
> Daten liest."*

`[cmd]` `ansicht.tsx:561` hat **kein `else`**: `<MealPlansTab d={plan} />`
wird immer gerendert. Die Datei traegt seit G-161 **drei echte
Kacheln**, die ueber `plan-lesen` lesen. Die acht Marken sitzen an den
fuenf verbliebenen Attrappen, deren Begruendung in G-161 gemessen ist:
`meal_plan_entries` hat **0 Statusspalten**, `meal_plans` **0 der fuenf
Lifecycle-Spalten**.

**Sie zu entfernen hiesse drei echte Kacheln mitloeschen.** Der Auftrag
sagt: *„Keine echte Attrappe entfernen, nur weil sie eine Marke
traegt. Im Zweifel stehen lassen und melden."* → **gemeldet.**

## 3 · C-249 — blockiert, Seed noetig

`[cmd]` **Die Tabellen gibt es, wie C-246 sagt:**
`nutrition.shopping_lists` und `nutrition.shopping_list_items`,
**je 4 Policies und 2 Trigger** (gemessen 2026-08-23).

`[cmd]` **Sie sind leer — auf jedem Konto:**

| Konto | Listen | Posten |
|---|---|---|
| `dev@lumeos.app` | 0 | 0 |
| `test-user@lumeos.local` | 0 | 0 |
| **Gesamtbestand** | **0** | **0** |

`[read]` **Damit sind die Kacheln nicht belegbar.** Anbinden koennte
ich sie; eine gerenderte Null unterscheidet sich aber nicht von einem
kaputten Lesepfad. **Der Auftrag sieht genau diesen Fall vor** —
*„dann ist ein Seed noetig und der gehoert Codex."*

`[cmd]` **Nebenbefund fuer den Seed:** die Fremdschluesselspalte heisst
`shopping_list_id`, nicht `list_id`. Meine erste Abfrage lief deswegen
auf einen Fehler.

---

## NACHWEIS

### Erwartung, vor der Messung geschrieben

| Tab | vorher | erwartet nachher | gemessen nachher |
|---|---|---|---|
| nutrients | 12 Kacheln, **0** Marken | 0 | **0** ✔ |
| prefs | 6 Kacheln, **6** Marken | 0 | **0** ✔ |
| plans | 8 Marken | **8, unveraendert** | **8** ✔ |

### Die gerenderte Seite, `dev@lumeos.app`

`[cmd]` Gemessen mit `tools/_g157-render.mjs`, 2026-08-23:

| Tab | Attrappen | Spur des Entwurfs | Laenge |
|---|---|---|---|
| nutrients | 1 | **keine** | 124.842 Z |
| prefs | 1 | **keine** | 27.526 Z |

`[read]` **Die eine Attrappe ist auf beiden Tabs der Buddy** der
Seitenleiste (G-02, *„Die Flaeche steht, der Modellaufruf fehlt
bewusst"*) — **nicht die Kacheln.** Nachgesehen im Umfeld des Treffers,
nicht aus der Zahl geschlossen.

`[cmd]` **Der echte Zweig traegt Zahlen:** `Rohasche ASH 18,3 g`,
`Cholesterin CHORL 648,4 mg`, `60/60 Tg. vollst.` — aus
`nutrient_defs`, nicht erfunden.

### Gegenprobe: sie ist schwaecher als verlangt

`[cmd]` **Der Auftrag wollte eine Seite ohne Sitzung.** Das geht nicht:
**der Server leitet auf `/login` um**, der Tab wird nie gerendert. Der
leere Zweig greift nur bei einem **angemeldeten Konto ohne Daten.**

`[cmd]` **Und `test-user@lumeos.local` war nicht anmeldbar.** Das
Passwort `LumeosTestUser2026`, das in `_g154`, `_g166` und `_g167`
steht, passt nicht mehr: der crypt-Vergleich schlaegt fehl, `updated_at`
steht auf **2026-08-23 09:42**. Bei `dev@lumeos.app` passt es noch
(09:21 geaendert). **Beide Konten wurden heute vormittag angefasst —
nicht von mir.**

`[read]` **Deshalb ist der leere Zweig als Komponente gemessen, nicht
als Seite** (`__tests__/leer-hinweis.test.tsx`). **Das ist der schwaechere
Beleg, und er steht hier als solcher.** Was die Seite zeigt, ist
getrennt belegt: keine Spur des Entwurfs auf beiden Tabs.

### Negativprobe: der erste Anlauf war blind

`[cmd]` **Rueckfall wieder eingebaut, Erwartung unveraendert — der Test
blieb gruen.** Der Grund: mit der Datei hatte ich auch ihre Zeile aus
der Erwartungsliste genommen. **Danach bewachte nichts mehr die
Entfernung.**

`[cmd]` **Erst mit der neuen Pruefung** *„die Nutrition-Entwuerfe kommen
nicht zurueck"* misst es:

| Lage | pass | fail |
|---|---|---|
| Sollzustand | 78 | 3 |
| **Rueckfall wieder da** | **77** | **4** ✔ rot |
| nach Rueckbau | 78 | 3 |

`[cmd]` **Und der Hinweis selbst:** eine erfundene `18,3 g` eingebaut →
`pass 0 / fail 1`; nach Rueckbau `pass 1 / fail 0`, Datei
byteweise identisch.

### Stand am Ende

`[cmd]` `npx tsc --noEmit` — **sauber ausser `apps/web/src/app/v2/recovery`**
(`Cannot find name 'Empty'`, zweimal). **Nicht meine Aenderung:** die
Datei ist von einem anderen Agenten veraendert und der Auftrag sperrt
das Verzeichnis. Gemeldet, nicht angefasst.

`[cmd]` `v2-attrappen.test.ts` — **82 pass, 0 fail.**

---

## GEAENDERT

| Datei | |
|---|---|
| `nutrition/nutrients-entwurf.tsx` | **geloescht** (585 Z) |
| `nutrition/tab-prefs.tsx` | **geloescht** (203 Z) |
| `nutrition/leer-hinweis.tsx` | **neu** |
| `nutrition/ansicht.tsx` | zwei Zweige, zwei Importe, Kommentare |
| `nutrition/__tests__/leer-hinweis.test.tsx` | **neu** |
| `shell/__tests__/v2-attrappen.test.ts` | prefs raus, neue Pruefung |
| `tools/_g157-render.mjs` | **neu**, Messwerkzeug |

**`tab-plans.tsx` ist unveraendert** — Begruendung oben.

## OFFEN

1. **C-249 braucht einen Seed** auf `test-user@lumeos.local`
   (Codex). Spalte: `shopping_list_id`.
2. **`test-user@lumeos.local` ist mit dem dokumentierten Passwort nicht
   anmeldbar** (seit 2026-08-23 09:42). Betrifft `_g154`, `_g166`,
   `_g167` — die laufen so nicht mehr.
3. **`v2/recovery/tab-messwerte.tsx` bricht den Typecheck** (fremder
   Agent).
