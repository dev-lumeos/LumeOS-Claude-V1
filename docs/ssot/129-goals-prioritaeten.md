# 129 — Prioritäten, Bearbeiten und die Zielhistorie (G-79)

Stand: 2026-08-20 · Anker: Zweig `dev` · Auftrag G-79
Herkunft: gebaut und am Bildschirm geprüft in dieser Sitzung.
Rangfolge: Code > dieses Dokument > Rest.

**Tom, 2026-08-18:** *„Goals brauchen noch Prioritäten, die man
festlegen kann — das bildet dann auch die Reihenfolge. Bestehende
müssen auch editierbar sein."*

`[cmd]` **Alle vier Punkte gebaut, ohne Schemaänderung.** Die Spalten
lagen bereits vor.

---

## Was Prioritäten und Bearbeiten brauchen

### Beide Spalten gibt es schon — die Frage war falsch gestellt

Der Auftrag sagt, ich soll prüfen, ob `user_goals` eine Spalte für
Priorität und Status hat, und **melden statt bauen**, falls nicht.
`[cmd]` **Beide sind da:**

| Spalte | Typ | Vorgabe |
|---|---|---|
| `priority` | smallint | **5** |
| `status` | text | **`active`** |

`[cmd]` **Und der Lesepfad sortiert längst danach** —
`lib/goals/lesen.ts:223` hat `.order('priority')`. Was fehlte, war
nicht die Spalte und nicht die Sortierung, sondern **der Weg, die Zahl
zu setzen**.

### Drei Regeln, die zusammen die eigentliche Vorgabe sind

`[cmd]` Gemessen an den Bedingungen der Tabelle:

| Regel | Wirkung |
|---|---|
| `user_goals_priority_check` | Priorität 1 bis 10 |
| `user_goals_check1` | **ein AKTIVES Ziel muss 1 bis 3 tragen** |
| `uq_user_goals_active_slot` | **eindeutiger Index auf (user_id, priority) für aktive Ziele** |

`[read]` **Zusammen heisst das: es gibt genau drei aktive Plätze, jeden
einmal.** Das steht in keiner Spezifikation — es steht in der
Datenbank, und der zweite Teil ist mir erst aufgefallen, als ein
Rücksetzen der Testdaten mit
`duplicate key value violates unique constraint` abbrach.

`[cmd]` **Beide Regeln sind in der Oberfläche abgebildet:** das
Prioritätsfeld begrenzt auf 1–3, solange der Status `active` ist, und
ein belegter Rang wird als Satz gemeldet, nicht als Postgres-Fehler:

> *„Priorität 2 ist schon vergeben. Aktive Ziele belegen die Plätze 1
> bis 3, jeden nur einmal."*

### Der Schreibweg

`[cmd]` **Die Zeilenschutzregeln standen bereits** — alle vier
(SELECT/INSERT/UPDATE/DELETE) auf `auth.uid() = user_id`, mit vollen
Rechten für `authenticated`. Es fehlte nur der Aufruf.

| Datei | Rolle |
|---|---|
| `lib/goals/ziel-regeln.ts` | **neu** — Konstanten und Prüfung, **ohne Server-I/O** |
| `lib/goals/schreiben.ts` | **neu** — `zielAendern`, `reihenfolgeSetzen` |
| `v2/goals/ziel-aktionen.ts` | **neu** — Serveraktion mit `revalidatePath` |
| `v2/goals/ziel-editor.tsx` | **neu** — Titel, Status, Priorität, Zielwert, Frist |

`[read]` **Das schliesst die Lücke aus GO-16:** dort stand, die
angebundenen Dateien hätten „kein einziges [Eingabefeld], und
`lesen.ts` hat keinen Schreibweg."

### Ein Fehler, den der Typecheck nicht sah

`[cmd]` **Die Regeln standen zuerst in `schreiben.ts`.** Der Typecheck
war grün — **die ganze Anwendung antwortete mit HTTP 500:**

> *„You're importing a component that needs `next/headers`."*

`[cmd]` Ursache: `ziel-karten.tsx` ist `'use client'` und holte von
dort **Werte** (`ABGESCHLOSSEN`, `STATUS_LABEL`). Ein Wert-Import zieht
die ganze Datei ins Browserbündel, und `schreiben.ts` importiert
`createSessionClient`. Ein `import type` wäre folgenlos geblieben.

`[read]` **Dieselbe Klasse Fehler wie in G-74** (dort mit
`stack-read.ts`). Deshalb liegen Konstanten und Prüfung jetzt in
`ziel-regeln.ts` — server-frei, von beiden Seiten benutzbar.

`[cmd]` **Nach der Trennung: `login` HTTP 500 → 200.**

### Ein zweiter, stiller Fehler

`[cmd]` Die erste Fassung meldete Erfolg, ohne zu schreiben: PostgREST
gibt bei `update` **auch dann `ok` zurück, wenn der Zeilenschutz alles
weggefiltert hat.** Der Editor schloss sich, und nichts war
gespeichert.

**Behoben mit `.select('id')`** — die Antwort sagt jetzt, wie viele
Zeilen getroffen wurden. Null Zeilen melden:
*„Kein Ziel geändert — gehört es dieser Sitzung?"*

---

## Was die Timeline zeigt

`[cmd]` **Die Daten tragen sie**, das war die Frage des Auftrags:

| Art | Datum | vorhanden |
|---|---|---|
| Ziele | `gueltig_ab` → `target_date` | 2 |
| Phasen | `gueltig_ab` → `projected_end_date` | 1 |
| Meilensteine | `target_date` als Punkt | 3 |

`[cmd]` **Gebaut und gemessen:** *„Zeitachse · 2026 — 2 Ziele · 1
Phasen · 3 Meilensteine"*, **8 anwählbare Zeilen**.

**Tom:** *„Da müsste aber jede Zeile anwählbar sein für Details."*
`[cmd]` **Gebaut als `<button>` mit `aria-expanded`**, nicht als
`<div onClick>` — sonst wäre die Zeile per Tastatur nicht erreichbar.
Ein Klick klappt Zeitraum, Typ, Priorität und Werte auf; gemessen:
*„bis 20. August"*.

`[read]` **Was die Zeile NICHT sagt:** ob jemand im Plan liegt. Die
Attrappe führte dafür `pace: 'ahead' | 'on-track' | 'behind'` — drei
Urteile über die Person. Der Balken zeigt Zeitraum und Fortschritt,
sonst nichts.

`[cmd]` **Der Entwurf bleibt als Rückfall**, wenn nichts mit Datum
vorliegt.

---

## Wo die Historie sitzt

**Tom:** *„Ich sehe 2 Goals, die definiert — Meilensteine? Erreichte
Goals? Dann macht man einfach einen Seed mit abgelaufenen Goals, die in
Meilensteine landen (im Sinne von History)."*

`[cmd]` **Die Meilenstein-Kachel bleibt, wo GO-16 sie hingesetzt hat** —
Toms Entscheidung, und ich habe keine bessere Stelle gefunden. Der
Entwurf hat keine.

`[cmd]` **Dazu neu: eine Kachel „Abgeschlossene Ziele"** in derselben
Spalte. Sie zeigt Ziele mit Status `achieved` oder `abandoned` — **ohne
Stift**, denn Vergangenes wird nicht bearbeitet.

`[read]` **Die Trennung ist der Status, nicht ein Datum.** `paused`
gehört NICHT dazu: ein pausiertes Ziel läuft weiter, es ruht nur. Nur
`achieved` und `abandoned` sind vorbei — ein Test hält das fest.

### Die Kachel ist heute leer — und das ist der Befund

`[cmd]` **Kein Ziel trägt einen abgeschlossenen Status.** Alle fünf in
der Datenbank stehen auf `active`; `achievement_date` ist überall
`NULL`.

`[cmd]` **Und die Meilensteine widersprechen dem Auftragstext.** Er
nennt sie *„erreicht, offen, verfehlt"* — **gemessen sind alle drei
`open`**, zwei davon mit längst vergangenem Zieldatum:

| Meilenstein | Zieldatum | Status | Lage |
|---|---|---|---|
| 86 kg bis 20. August | 2026-06-07 | `open` | **überfällig** |
| 85 kg erreicht | 2026-07-01 | `open` | **überfällig** |
| 86,5 kg offen | 2026-12-16 | `open` | künftig |

`[read]` **Die Anzeige rechnet den Zustand trotzdem richtig** —
`goal_milestone_status` liefert `computed_status`, und die Kachel zeigt
den gegen den gespeicherten. **Der gespeicherte Stand ist veraltet, die
Rechnung nicht.**

`[annahme]` **Was Toms Seed bräuchte:** Ziele mit `status='achieved'`
und gesetztem `achievement_date`, dazu Meilensteine mit
`status='achieved'`/`'missed'` und `achieved_date`. **Das ist ein
Datenauftrag für Codex** — hier wurde kein Seed angelegt.

---

## Was noch Attrappe bleibt

`[cmd]` **Der Goals-Tab zeigt 0 Marken** — er war schon vor diesem
Auftrag echt (GO-16). Was dazukam, ist ebenfalls ohne Marke:
Prioritätspille, Stift, Editor, Historie-Kachel, Zeitachse.

| Tab | Lage |
|---|---|
| Goals · Phase engine · Adaptive TDEE · Body metrics · Measurements | echt seit GO-16 |
| **Timeline** | **echt seit G-79** |
| Cross-module · Composition · Physique ratios · Pose sessions | **bleibt Attrappe** |

`[read]` **Die vier übrigen wurden nicht angefasst** — der Auftrag
nennt Composition ausdrücklich als „nicht umbauen", und die anderen
drei brauchen Daten, die es nicht gibt.

### Die TDEE-Zeile war falsch geworden

`[cmd]` Der Auftrag weist darauf hin, und er hat recht: die Kachel
schrieb *„übernimmt je Schritt 30 % aus der Messung und behält 70 % des
Vorwerts — er bleibt damit nahe an der Formel."*

`[cmd]` **Gemessen: `alpha = 1,0`.** Der Text rechnete zwar aus dem
echten Wert (also „100 % / 0 %"), aber der Nachsatz *„nahe an der
Formel"* stimmte nur für alpha < 1.

**Berichtigt:** bei `alpha >= 1` steht jetzt *„keine Glättung — der
adaptive Wert ist der gemessene."*

---

## Nachweise

`[cmd]` Am Bildschirm geprüft, 2026-08-20, als `dev@lumeos.app`:

| Prüfung | Ergebnis |
|---|---|
| **Prioritäten sichtbar** | `[cmd]` „Prio 1" und „Prio 2" an den Karten |
| **Bearbeiten geht** | `[cmd]` Editor öffnet mit echten Werten (Titel, Status, Prio 2, Zielwert 120 kg, Frist 2026-08-18) |
| **Schreiben funktioniert** | `[cmd]` Priorität 2 → 3 gespeichert, **nach Neuladen noch da** |
| **Reihenfolge folgt der Priorität** | `[cmd]` getauscht: „1: Bankdrücken · 2: Lean Bulk" statt umgekehrt — danach zurückgesetzt |
| **Timeline** | `[cmd]` „2 Ziele · 1 Phasen · 3 Meilensteine", **8 anwählbare Zeilen**, Detail klappt auf |
| **Zeilenschutz** | `[cmd]` `test-user@lumeos.local`: **0 Ziele, 0 Meilensteine** · `dev@lumeos.app`: **2 und 3** |
| **Kacheln ohne Marke** | `[cmd]` Goals-Tab **0** — auch alles Neue |
| `pnpm gate` | `[cmd]` **grün, 8 von 8** |
| Vier Breiten | `[cmd]` 1440 / 1024 / 768 / **375 px** — 0 Karten mit Überlauf, kein Seitenüberlauf |

### Die Tests

`[cmd]` **Zehn neue Prüfungen** in
`src/lib/goals/__tests__/schreiben.test.ts`, zusammen mit den
bestehenden **14 grün**. Sie bilden die CHECK-Bedingungen ab: die fünf
Status, die Grenze 1–3 für aktive Ziele, 1–10 für abgeschlossene, der
leere Titel, die gebrochene Priorität.

### Zwei Dinge, die nicht an diesem Auftrag liegen

`[cmd]` **Die Registerkarten wechseln im Browser nicht.** Ein Klick auf
„Timeline" lässt `aria-selected` auf „Goals". **Gegengeprüft an
`/v2/recovery`, das dieser Auftrag nicht anfasst: dort genauso.** Die
Ursache liegt im Entwicklungsserver (RSC-Anfragen antworten mit 404),
nicht im Modul.

`[read]` **Der Timeline-Nachweis lief deshalb über die
Vorgabe-Registerkarte:** kurzzeitig auf `timeline` gestellt, gemessen,
**zurückgesetzt** — `React.useState('goals')` steht wieder.

`[cmd]` **Die Bildschirmfotos zeigen die Seite unformatiert**, obwohl
der DOM die Formatierung trägt (`.v2-card` vorhanden, Prioritäten
lesbar). Das Werkzeug fotografiert vor dem Zeichnen der Stile. **Die
Belege oben stammen deshalb aus dem DOM, nicht aus den Bildern.**

### Geänderte Dateien

| Datei | Was |
|---|---|
| `lib/goals/ziel-regeln.ts` | **neu** — Status, Grenzen, Prüfung, server-frei |
| `lib/goals/schreiben.ts` | **neu** — Schreib-I/O mit Zeilenzählung |
| `lib/goals/__tests__/schreiben.test.ts` | **neu** — zehn Prüfungen |
| `v2/goals/ziel-aktionen.ts` | **neu** — Serveraktionen |
| `v2/goals/ziel-editor.tsx` | **neu** — der Editor |
| `v2/goals/tab-timeline.tsx` | **neu** — die echte Zeitachse |
| `v2/goals/ziel-karten.tsx` | Prioritätspille, Stift, Historie-Kachel |
| `v2/goals/ansicht.tsx` | Weiche auf die echte Zeitachse |
| `v2/goals/tdee-kopf.tsx` | Glättungssatz berichtigt |

### Was dieser Auftrag NICHT getan hat

- **Kein Schema geändert** — beide Spalten lagen vor.
- **Keine Gamification** — Toms „kann später" heisst später.
- **Keinen Seed angelegt** — die Historie ist leer, weil kein Ziel
  abgeschlossen ist. Gemeldet, nicht erfunden.
- **Keine Bewertung**, ob jemand sein Ziel gut verfolgt.
- **`packages/ui` nicht angefasst.**
- **Adaptive TDEE und Composition nicht umgebaut** — nur der eine
  falsche Satz.

`[cmd]` Messskripte unter `tools/g79-*` — **nur lesend bzw.
zurücksetzend**, gehören vor dem Commit entfernt.

**Nichts ist committet oder gestaged.**
