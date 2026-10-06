---
nr: G-587
typ: fehler
modul: quer
schwere: hoch
angelegt: 2026-10-02
agent: claudecode
beauftragt: 2026-10-06
erledigt: 2026-10-06
commit: 89844a2d

braucht: [G-585]
kind_von: G-585

quellen:
  - docs/punkte/erledigt/quer-g-0585-die-inventur-der-ausfuhren-ohne-aufrufer.md

beruehrt:
  tabellen: []
  dateien:
    - packages/shared/src/index.ts
    - apps/web/src/lib/supplements/substanz-read.ts
---

# Ein Service-Client ohne Aufrufer umgeht die Zeilensicherheit

## Der Befund

`[cmd]` **Aus der Inventur G-585, vom Orchestrator nachgemessen:**
`createServiceClient` steht in
`packages/shared/src/supabase/server.ts:6` und hat **null Aufrufer** in
`apps/` und `packages/` — die uebrigen Treffer sind Werkzeugzwischenspeicher
(`tools/lightrag/…`, `tools/repomix/…`), kein Code.

    export function createServiceClient() {
      return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { persistSession: false } }
      )
    }

`[read]` **Eine unbenutzte Ausfuhr ist harmlos. Diese nicht.** Sie
erzeugt einen Client mit dem Service-Role-Schluessel, der die
Zeilensicherheit **umgeht** — und sie liegt im geteilten Paket, das jede
App importiert. **Wer irgendwann ein RLS-Problem schnell loesen will,
findet hier das Werkzeug dafuer.**

`[cmd]` **Was heute dagegen steht:** `tools/serverimport-pruefen.mjs`
prueft die Client-Bundles (63 Chunks, 0 Treffer) — **die Bundle-Seite ist
bewacht.** `SUPABASE_SERVICE_ROLE_KEY` traegt kein `NEXT_PUBLIC_`, im
Browser waere der Schluessel also `undefined`.

`[read]` **Das Risiko ist nicht der Browser, es ist der naechste
Serverpfad** — ein Agent oder ein Mensch, der die Funktion benutzt, weil
sie da ist, und damit RLS still aushebelt.

## Was zu entscheiden ist

`[read]` **Drei Wege, und sie unterscheiden sich im Anspruch:**

1. **Weg damit** (A-59: entfernt, nicht auskommentiert). Braucht ein
   Serverpfad spaeter wirklich Service-Role, wird er mit Begruendung neu
   geschrieben — dann steht die Begruendung im Punkt und nicht im Nichts.
2. **Bleiben, aber bewacht:** ein Waechter zaehlt die Aufrufer und wird
   rot, sobald einer entsteht, der nicht in einer Ausnahmeliste steht.
3. **Bleiben, weil ein Weg geplant ist** — dann gehoert der Weg benannt,
   mit dem Punkt, der ihn baut.

`[annahme]` **Weg 1** — nichts ruft sie, niemand hat sie ausgetragen, und
ein ungenutztes RLS-Loch ist teurer als ein spaeterer Neubau. **Aber das
ist Toms Entscheidung, nicht meine**, weil sie davon abhaengt, ob ein
Service-Role-Pfad im Plan steht.

**Nicht Teil:** die uebrigen 55 toten Ausfuhren aus G-585 und die
Bundle-Pruefung (gebaut und gruen).

**Zu belegen, sobald entschieden:** die Aufrufzahl vorher und nachher ·
`pnpm gate` gruen · bei Weg 2 die Sabotage in beide Richtungen.

---

## Nachtrag 2026-10-02, 16:35 — Toms Frage, und sie aendert den Punkt

**Tom:** *„reden wir hier von der lokalen db oder von der in der cloud?"*

`[cmd]` **Lokal, gemessen:** beide Umgebungsdateien zeigen auf
`http://127.0.0.1:54321`.

    .env                 NEXT_PUBLIC_SUPABASE_URL = http://127.0.0.1:54321
                         SUPABASE_SERVICE_ROLE_KEY gesetzt: ja
    apps/web/.env.local  NEXT_PUBLIC_SUPABASE_URL = http://127.0.0.1:54321
                         SUPABASE_SERVICE_ROLE_KEY gesetzt: nein

`[cmd]` **Kein `*.supabase.co` in irgendeiner `.env*`.** Alle drei
Umgebungsdateien sind von Git ausgeschlossen (`.gitignore:11-12`).

### Und dabei ist der groessere Fund aufgefallen

`[cmd]` **Der Service-Role-Schluessel wird NICHT nur von der unbenutzten
Fabrik gelesen.** Wer ihn in `apps/`, `packages/`, `tools/` und
`supabase/` liest:

    packages/shared/src/supabase/server.ts        die Fabrik, 0 Aufrufer
    apps/web/src/lib/supplements/substanz-read.ts LEBT  <-- das hier
    supabase/_pipeline/_validierung/*.mjs         zwei Pruefwerkzeuge
    tools/_g4xx-*.mjs                             sieben Werkzeuge

`[cmd]` **`substanz-read.ts:817-823` baut einen Service-Role-Client:**

    function wissenService() {
      const env = envMitRootFallback()
      const url = env.NEXT_PUBLIC_SUPABASE_URL ?? env.SUPABASE_URL
      const key = env.SUPABASE_SERVICE_ROLE_KEY
      if (!url || !key) return null
      return createSupabaseClient(url, key, { auth: { persistSession: false } })
    }

`[cmd]` **Und `envMitRootFallback():825-839` liest die `.env` zur
Laufzeit von der Platte** — erst `./.env`, dann `../../.env` —, wenn der
Prozess den Schluessel nicht hat.

`[cmd]` **13 lebende Module importieren diese Datei**, darunter
`app/api/supplements/substanz/route.ts`, `app/v2/supplements/page.tsx`
und `ansicht.tsx`.

`[read]` **Damit hat der Punkt zwei Haelften, und die zweite ist die
wichtigere:**

1. **Die unbenutzte Fabrik** (`server.ts:6`) — ein Werkzeug, das niemand
   braucht und das beim naechsten RLS-Problem griffbereit liegt.
2. **Der lebende Pfad** (`substanz-read.ts`) — er umgeht RLS bei jedem
   Aufruf, und er holt sich den Schluessel notfalls selbst von der
   Platte.

`[annahme]` **Fuer den Wissenskatalog kann das richtig sein:** Substanzen
und Erklaertexte sind globale Daten, kein Nutzerbesitz — RLS zu umgehen
waere dort kein Datenleck, sondern eine Abkuerzung um eine Policy, die es
vielleicht gar nicht gibt. **Das ist eine Vermutung und keine Messung** —
ob die Wissenstabellen RLS tragen und was sie ohne Service-Role
zurueckgeben, ist nicht geprueft.

`[read]` **Heute ist die Reichweite deine lokale Datenbank.** Der Punkt
aendert seinen Rang mit dem Deployment — E-8 (nach `main`), E-9
(Preview-Branches) und E-10 (*„RLS neu bewerten, sobald `main` produktiv
wird"*) sind offen. **E-10 ist genau diese Frage, und sie steht seit
laengerem da.**

### Was jetzt zu entscheiden ist

`[read]` **Die Fabrik ist der einfache Teil** — weg oder bewacht, wie
oben.

`[read]` **Der lebende Pfad ist die eigentliche Frage, und sie gehoert
zu E-10:** darf eine Leseansicht den Service-Role-Schluessel benutzen,
wenn die Daten global sind? **Wenn ja, gehoert es benannt und auf
Katalogtabellen begrenzt. Wenn nein, brauchen die Wissenstabellen eine
Lesepolicy** — und dann ist das ein eigener Punkt mit Messung, nicht eine
Aufraeumaktion.

`[cmd]` **Was ich nicht gemessen habe und was den Rang entscheidet:**
ob `supplements.*`-Wissenstabellen RLS aktiviert haben und was ein
angemeldeter Nutzer ohne Service-Role zurueckbekommt. **Das ist die erste
Zeile des Auftrags, wenn du ihn gibst.**

---

## Entschieden - 2026-10-06, Tom

**Tom:** *,ok entfernen"* - Weg 1.

`[cmd]` **Nachgemessen beim Schreiben des Auftrags, 06.10.:** Es gibt eine
ZWEITE Stelle derselben Klasse, im App-Code selbst:
`apps/web/src/lib/supplements/substanz-read.ts:817` `wissenService()` baut
einen Client mit `SUPABASE_SERVICE_ROLE_KEY` und liest dafuer notfalls die
`.env` von der Platte (`envMitRootFallback`, :824). **Aufrufer: 0** - nur
die Definition. Eingefuehrt am 26.08. (`7d54d4c6`/`d4e2b003`, Community-
Reiter). Gehoert in denselben Auftrag.

`[read]` Nicht Teil: die Einmal-Skripte `tools/_g4xx-*.mjs`, die den
Schluessel fuer Messungen lesen - Werkzeuge, kein App-Code.

## Auftrag - Kopf

    AUFTRAG FUER Claude Code - G-587: der Generalschluessel verschwindet aus dem App-Code
    Bereich: packages/shared, apps/web/src/lib/supplements, tools/
    Fremd:   supabase/_pipeline/ (Codex). docs/ gehoert dem Orchestrator.
    Stand:   2026-10-06

1. Messen: Aufrufer von `createServiceClient` und `wissenService` in
   `apps/*/src` und `packages/*/src` (erwartet je 0), dazu jede weitere
   Stelle, die `SUPABASE_SERVICE_ROLE_KEY` liest.
2. Entfernen (A-59: weg, nicht auskommentiert): `createServiceClient`
   in `packages/shared/src/supabase/server.ts`, `wissenService` und
   `envMitRootFallback` in `substanz-read.ts`, sofern ohne Aufrufer.
3. Waechter: ein Test oder Gate-Werkzeug wird rot, sobald
   `SUPABASE_SERVICE_ROLE_KEY` in `apps/*/src` oder `packages/*/src`
   auftaucht. Ausnahmeliste leer; wer sie fuellt, braucht einen Punkt.
4. Sabotage beidseitig, Gate gruen mit Testzahl. Kein Commit.

## Abnahme - 2026-10-06, Commit `89844a2d`

`[cmd]` **Diff:** `packages/shared/src/supabase/server.ts` geloescht (per
`git rm`), Re-Export aus `index.ts` weg; in `substanz-read.ts`
`wissenService`, `envMitRootFallback` und drei nur dafuer noetige Importe
entfernt; neuer Waechter `tools/__tests__/g587-kein-generalschluessel.test.mjs`.
Gate gruen, web 2672.

`[read]` Gemessen: beide Stellen ohne Aufrufer, sonst liest keine Stelle in
`apps/` oder `packages/` den Schluessel. Der Waechter verlangt mehr als 600
gelesene Dateien (857), damit ein falscher Wurzelpfad nicht gruen durchgeht.
Sabotage: Schluessel in apps und in packages rot, falscher Ort rot.

`[read]` Sein Gate war vorher rot, nur weil die Loeschung nicht im Index
stand (G-470-Waechter liest `git ls-files`). Mit `git rm` im Commit gruen.
Dev-Server 3200, Coach 3220, Admin 3210 danach neu gestartet
(`packages/shared` geaendert), alle 200 auf `/login`.
