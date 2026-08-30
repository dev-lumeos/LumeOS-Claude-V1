# G-175 — das Pruefkonto ist dauerhaft anmeldbar — Fable, 2026-08-23

Auftrag: `docs/auftraege/g-175-fable.md`.

## Befund vorweg, der die Lage aenderte

`[cmd]` Beim Start gemessen: das dokumentierte Wort
`LumeosTestUser2026` PASSTE bereits wieder (crypt-Check live,
updated_at 11:31) — die angekuendigte Dauerloesung war zur Haelfte
geschehen. Mein frueherer Fehlschlag (G-149) hatte eine andere
Ursache: `tools/schuss.mjs` klopfte bei JEDEM Konto mit dem fest
verdrahteten dev-Wort an. Der Auftrag blieb voll gueltig — zentral
hinterlegen, kettengetragen setzen, Skripte entdrahten.

## Was gebaut ist

1. **`tools/konten.mjs` — die eine Stelle.** `KONTEN` (dev, test-user)
   plus `wortFuer(konto)`: `LUMEOS_WORT` aus der Umgebung schlaegt
   alles; ein UNBEKANNTES Konto ohne `LUMEOS_WORT` wirft, statt still
   mit einem fremden Wort anzuklopfen.
2. **`tools/schuss.mjs`** waehlt das Wort jetzt je `LUMEOS_KONTO` aus
   dieser Quelle (vorher: fest dev-Wort fuer alle).
3. **Neun Nachweisskripte entdrahtet** — nicht nur die drei genannten:
   `_g133-gegenprobe/-kette/-oberflaeche`, `_g154-kette/-oberflaeche`,
   `_g157-render`, `_g166-kreis`, `_g167-gate/-setze` trugen alle
   dasselbe Festwort; alle lesen jetzt `wortFuer()`. Syntax aller elf
   Dateien per `node --check` geprueft; `_g154-oberflaeche` als
   Funktionsbeleg gelaufen. Restvorkommen des Worts: nur Alt-Logs und
   ein Doku-Zitat in `admin-sperre-pruefen.mjs` (Kommentar).
4. **Der Kettenschritt** (`_testdaten/testdaten-einspielen.ts`): legt
   `test-user@lumeos.local` an, falls die Umgebung ihn nicht kennt,
   und setzt `encrypted_password` per
   `extensions.crypt(<Wort aus tools/konten.mjs>, gen_salt('bf'))`.
   `[read]` Der bcrypt-Hash ist je Lauf anders (Salz) — funktional
   identisch; die pruefbare Erwartung ist der crypt-Check.
   `dev@lumeos.app` bleibt unberuehrt.
5. **Der Kopierschritt ist damit tot** — kein Agent muss das Konto
   mehr zurechtbiegen.

## Nachweis — beide Richtungen

- **Ohne Kopierschritt angemeldet:** `schuss` als test-user, zweimal —
  vor und nach dem Kettenschritt-Setzen
  (`backup/g175-testuser-ohne-kopierschritt.png`,
  `backup/g175-nach-kettenschritt.png`).
- **Kettenschritt setzt wirklich:** Live-Lauf des Testdaten-Schritts →
  `NOTICE G-175: Pruefkonto-Passwort gesetzt`, danach crypt-Check `t`
  mit frischem `updated_at 12:05`.
- **Gegenprobe:** `LUMEOS_WORT=FalschesWort123` → schuss bleibt auf
  `/login` haengen, `TimeoutError`, **kein Bild geschrieben** — kein
  stilles Ausweichen auf ein anderes Konto.
- **Wegwerf-Kette:** voller kette.json-Lauf (89 Schritte,
  `--keep-database`) → KETTE OK, Live-Anmeldung danach unveraendert.

## Drei Befunde — melden, nicht passend machen

1. **`testdaten-einspielen` ist KEIN kette.json-Schritt**, und die
   kette.json-Wegwerf-DB traegt nur ein **Minimal-auth** (4 Spalten,
   kein `encrypted_password`, kein GoTrue) — dort ist „Anmeldung"
   konzeptlos. Der G-175-Block prueft die Spalte und ueberspringt sich
   dann mit `NOTICE`, statt den Lauf zu brechen. **Damit korrigiere
   ich auch meine eigene C-236-Formulierung:** der damalige
   „KETTE OK (inkl. Gate)"-Satz war zu viel — das Zaehlreihen-Gate
   sitzt im Testdaten-Schritt, nicht in der kette.json.
2. **An Codex (C-252):** `stack_items_supplement_id_fkey` zeigt live
   auf `supplements.supplements`; der Seed-Teil von
   `testdaten-einspielen` insertet noch alte `supplement_catalog`-UUIDs
   und bricht mit FK-Fehler (`5c2b2577-…` not present). Der Lauf
   rollte sauber zurueck (Bestand unversehrt, 370 Check-ins; der
   G-175-Block sitzt in einem frueheren Transaktionsabschnitt und
   blieb wirksam). **Der Supplement-Seed-Teil braucht die
   C-252-Nachfuehrung, sonst ist der Testdaten-Schritt live nicht
   mehr komplett lauffaehig.**
3. Wer den Hash am Vormittag (09:42) gedreht hat, bleibt offen — mit
   dem Kettenschritt ist es kuenftig egal: der naechste Lauf setzt ihn
   wieder auf das hinterlegte Wort.

Aufgeraeumt: `lumeos_kette_g175` gedroppt.
