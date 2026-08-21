# 163 — Der Einstieg in `packages/shared` und der fünfte Fall

**Auftrag:** A-30 · **Datum:** 2026-08-21 · **Herkunft:** Claude Code
(Orchestrator) · **Stand:** gemessen am 2026-08-21

---

## Vorbemerkung: die Prämisse des Auftrags trifft nicht zu

Der Auftrag sagt, `next/headers` gerate über `packages/shared` ins
Browserbündel und **„der Build bricht heute"**.

`[cmd]` **Er bricht nicht.** Am 2026-08-21 vor jeder Änderung gemessen:

```
pnpm --filter @lumeos/web build   ->  ✓ Compiled successfully
```

69 Logzeilen, **0 Treffer** für `next/headers`, `Failed to compile`
oder `error`.

`[read]` **Das entwertet den Auftrag nicht** — es verschiebt ihn. Die
Fehlerklasse ist real und viermal belegt (G-74, G-79, G-97 und der
Anlass zu A-30). Die Frage ist damit nicht *„wie repariere ich den
Build"*, sondern *„warum ist er heute heil, und was hält ihn so"*.

Die vier Abschnitte unten beantworten die Auftragsfragen in dieser
Lesart. **Abschnitt 1 nennt die Ursache, die viermal gewirkt hat**,
nicht eine, die heute anliegt.

---

## 1. Warum der Build brach

**Nicht der Paketeinstieg war es.** `[cmd]` Die Importkette ab
`packages/shared/src/index.ts`, am 2026-08-21 vollständig verfolgt:

| Einstieg | Dateien in der Kette | zieht `next/headers`? |
|---|---:|---|
| `.` | 4 | **nein** |
| `./session` | 2 | **ja** — `supabase/session.ts` |
| `./auth` | 4 | **ja** — `auth/admin-session.ts`, `supabase/session.ts` |
| `./auth/role` | 1 | nein |
| `./auth/safe-redirect` | 1 | nein |
| `./nutrition/db` | 1 | nein |
| `./nutrition/preferences-catalog` | 1 | nein |
| `./cookie-name` | 1 | nein |

`index.ts` enthält genau zwei Zeilen — `export * from './supabase/client'`
und `export * from './supabase/server'`. **Keine der beiden erreicht
`next/headers`.** Wer `@lumeos/shared` blank importiert, zieht es nicht
mit; das tun nur `./session` und `./auth`, und beide sind Servereinstiege.

**Die Ursache lag jedes Mal in `apps/web`, nicht im Paket:** ein
**Wert-Import** aus einer Datei, die ihrerseits `@lumeos/shared/session`
zieht, in eine `'use client'`-Datei.

`[cmd]` **Am 2026-08-21 nachgestellt** — in `app/v2/coach/rechte-echt.tsx`
(eine `'use client'`-Datei, die aus `lib/coach/rechte-read.ts` bereits
*Typen* bezieht) zusätzlich einen Wert geholt:

```ts
import { ladeCoachRechte } from '../../../lib/coach/rechte-read'
React.useEffect(() => { void ladeCoachRechte() }, [])
```

Der Build brach sofort, mit derselben Meldung wie in A-30:

```
Failed to compile.
x You're importing a component that needs next/headers.
  15 | import { cookies } from 'next/headers'
Import trace for requested module:
./src/lib/coach/rechte-read.ts
```

`[read]` **Der Unterschied zwischen heil und kaputt ist ein einziges
Schlüsselwort.** `import type { … }` wird beim Übersetzen entfernt und
ist folgenlos; `import { … }` ohne `type` schleppt das ganze Modul mit.
**Der Typecheck sieht beides als gültig** — er kennt keine
Bündelgrenzen. Deshalb hat die Klasse viermal durchgeschlagen.

---

## 2. Wie der Einstieg jetzt aussieht

**Unverändert** — und das ist die Aussage, nicht eine ausgelassene
Arbeit.

`[read]` Der Auftrag schlägt vor, den Einstieg zu teilen. **Die Teilung
existiert bereits** und ist oben gemessen: `.` ist serverfrei, die
Serverfunktionen hängen hinter `./session` und `./auth`. Ein weiterer
Schnitt löst kein gemessenes Problem und macht den Fall nicht
unmöglicher — **der Fehler entstand nie am Einstieg**, sondern an einem
Wert-Import in `apps/web`, den kein Zuschnitt von `packages/shared`
verhindert.

**Das eingespielte Muster für `apps/web` bleibt ebenfalls:** Werte und
Typen, die die Oberfläche zur Laufzeit braucht, stehen in einer
serverfreien Nachbardatei. `[cmd]` Belegt an drei Stellen:

| serverfrei (Client darf) | mit `next/headers` (nur Server) |
|---|---|
| `lib/coach/rechte-modell.ts` | `lib/coach/rechte-read.ts` |
| `lib/nutrition/plan-model.ts` | `lib/nutrition/plan-read.ts` |
| `lib/medical/reihe.ts` | `lib/medical/*-read.ts` |

---

## 3. Welche Umgehungen wegfallen

**Keine.**

`[read]` Der Auftrag vermutet, die Trennungen in `apps/web` seien
Umgehungen, die nach einer Paketreparatur entfielen. **Sie sind keine
Umgehungen, sondern die Lösung selbst.** `rechte-modell.ts` neben
`rechte-read.ts` zu legen ist die Antwort auf die Fehlerklasse — nicht
ein Notbehelf um ein kaputtes Paket herum.

`[cmd]` Der Kopf von `rechte-modell.ts` sagt es seit G-90 selbst:

> *„Warum diese Datei getrennt von `rechte-read.ts` steht: … Ein
> WERT-Import aus einer solchen Datei in eine `'use client'`-Datei holt
> Server-I/O ins Browserbündel — die Typprüfung bleibt grün, und jede
> Seite antwortet mit HTTP 500."*

**Fiele die Trennung weg, käme der Fehler zurück.** Der Rückbau in
Abschnitt 1 zeigt genau das: Ich habe die Trennung an einer Stelle
aufgehoben, und der Build brach.

**Was ein Aufräumen wert wäre, aber nicht Teil dieses Auftrags ist:**
`[cmd]` `apps/web/src/app/v2/coach/rechte-echt.tsx:33` bezieht Typen
aus `rechte-read.ts` und Werte aus `rechte-modell.ts` — zwei Importe
aus zwei Dateien für einen Sachverhalt. Das ist korrekt und
funktioniert; es liest sich nur uneinheitlich.

---

## 4. Wie der sechste Fall verhindert wird

`[cmd]` **`tools/serverimport-pruefen.mjs`**, seit diesem Auftrag als
letzter Schritt in `pnpm gate`:

```
"gate": "… && turbo run typecheck test build && node tools/serverimport-pruefen.mjs"
```

**Sie läuft nach dem Build**, weil sie das Bündel liest, nicht den
Quelltext. Eine Quelltextprüfung hätte die Klasse nicht sicher
gefunden: Ob ein Import den Wert wirklich mitzieht, entscheidet erst
das Bündeln.

### Die Marke, die der Auftrag vorschlägt, taugt nicht

`[cmd]` **Auf `next/headers` zu prüfen misst nichts.** Am 2026-08-21 im
Gate-Build gezählt:

| Marke | Serverdateien | Client-Chunks | brauchbar? |
|---|---:|---:|---|
| `next/headers` | **0** von 104 | **0** von 49 | **nein — misst nichts** |
| `createServerClient` | 3 | 0 | **ja — trennt** |
| `cookies()` | 4 | 0 | **ja — trennt** |
| `createBrowserClient` | 1 | 1 | nein — steht in beiden |

**Next löst den Import beim Bündeln auf**; die Zeichenkette überlebt
auf keiner Seite. Eine Prüfung darauf wäre dauerhaft grün und würde den
sechsten Fall durchlassen.

`[read]` **Geprüft wird deshalb auf `createServerClient` und
`cookies()`** — beide stehen ausschliesslich in Servercode und
überleben das Bündeln. `createBrowserClient` scheidet aus, weil es
erwartungsgemäss auch im Browser steht.

### Beide Richtungen, gemessen

**Richtung 1 — sauberer Stand, Prüfung grün:**

```
[serverimport] 49 Client-Chunks geprueft, 0 Treffer;
               Gegenprobe: createServerClient 3x Server, cookies() 4x Server.
```

**Richtung 2 — Fehler wieder eingebaut, Prüfung rot:** Exitcode **1**.

`[read]` **Dabei ist etwas aufgefallen, das die Meldung mitträgt:** Der
Build bricht schon *vor* der Prüfung ab und **räumt `.next-gate` weg**.
Die Prüfung findet dann kein Bündel und meldet das — ebenfalls mit
Exitcode 1, also hält das Gate in beiden Fällen. **Damit die Meldung
nicht in die Irre führt**, nennt sie diesen Fall ausdrücklich und
verweist auf die Buildmeldung, die die Ursache dann selbst trägt.

### Die dritte Richtung: stumpf werden

`[read]` Eine Prüfung, die nur auf Abwesenheit schaut, meldet auch dann
„sauber", wenn sie nichts mehr findet — etwa nach einem Umbau des
Supabase-Einstiegs. **Deshalb zählt sie zuerst die Serverseite** und
bricht ab, wenn eine Marke dort auf 0 fällt:

```
[serverimport] FEHLER: die Pruefung misst nichts mehr.
  Keine Serverdatei enthaelt: …
```

---

## Was gemessen wurde

| Prüfung | Ergebnis |
|---|---|
| `pnpm gate` | **11/11 Tasks grün**, `Failed to compile: false` |
| Tests | **447 von 447 grün**, 18 Suites, 0 Fehler |
| Prüfung, sauberer Stand | grün, 49 Chunks, 0 Treffer |
| Prüfung, Fehler eingebaut | **Exitcode 1** |
| Anmeldung `/v2/coach` | „Human Coaches · LumeOS", **kein HTTP 500** |
| Anmeldung `/v2/nutrition` | „Tagebuch · LumeOS", **kein HTTP 500** |
| Rückbau der Gegenprobe | `rechte-echt.tsx` **nicht** in `git status` |

`[cmd]` **Die 2 Konsolenmeldungen je Seite sind der bekannte
`data-mode`-Hydrationswarnhinweis aus G-123**, kein neuer Befund.

---

## Geänderte Dateien

| Datei | Änderung |
|---|---|
| `tools/serverimport-pruefen.mjs` | **neu** — die Prüfung |
| `package.json` | `gate` um den Aufruf nach dem Build erweitert |

**Nichts in `packages/shared` und nichts in `apps/web` geändert** — es
lag dort kein gemessener Fehler vor.

---

## Offen

`[read]` **Der Anlass zu A-30 ist damit nicht erklärt.** C-158 meldete
den Bruch am 2026-08-20; gemessen wurde am 2026-08-21 ein heiler Build.

`[cmd]` **Was dagegen spricht, dass jemand ihn zwischendurch behob:**
`packages/shared` hat **seit dem 2026-08-19 keinen Commit** —
`session.ts`, die Datei aus C-158s Meldung, ist unverändert.

`[cmd]` **Was dafür spricht, dass er bei C-158 echt war:** Die
Trennung, die den Fall verhindert, entstand in `3e5e781` — dort wurden
`rechte-modell.ts` und `rechte-read.ts` gemeinsam angelegt (G-90).
**Ein Zwischenstand ohne diese Trennung hätte genau so gebrochen**, wie
der Rückbau in Abschnitt 1 zeigt.

`[read]` **Wahrscheinlich, aber nicht gemessen:** C-158 baute gegen
einen Arbeitsstand, in dem die Trennung noch nicht vollständig war.
**Wenn Codex die Buildmeldung von damals hat, lässt sich das in
Minuten zuordnen** — die Meldung nennt die Kette selbst.

**Die Prüfung schützt unabhängig davon**, weil sie den Zustand misst
und nicht die Geschichte.
