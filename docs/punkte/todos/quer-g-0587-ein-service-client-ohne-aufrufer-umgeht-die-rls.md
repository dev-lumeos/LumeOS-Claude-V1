---
nr: G-587
typ: fehler
modul: quer
schwere: hoch
angelegt: 2026-10-02

braucht: [G-585]
kind_von: G-585

quellen:
  - docs/punkte/erledigt/quer-g-0585-die-inventur-der-ausfuhren-ohne-aufrufer.md

beruehrt:
  tabellen: []
  dateien:
    - packages/shared/src/supabase/server.ts
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
