# G-190 — Sechs Abfragen nacheinander, obwohl keine auf der vorigen aufbaut

**Agent:** Claude Code · **Stichtag aller Zahlen: 2026-08-26**

---

## Kurz

Alle drei Punkte sind umgesetzt und belegt. **Und die Nachmessung hat
meine eigene Zahl aus der ersten Sitzung widerlegt** — nicht die
Richtung, aber die Ursache.

`[cmd]` **Der Nachweis, kalt und warm, beide Konten:**

| Konto | Fassung | kalt | warm (Median) |
|---|---|---|---|
| `dev@lumeos.app` | sequenziell | 1123 ms | 1087 ms |
| `dev@lumeos.app` | **parallel** | **998 ms** | **999 ms** |
| `test-user@lumeos.local` | sequenziell | 253 ms | 265 ms |
| `test-user@lumeos.local` | **parallel** | **199 ms** | **224 ms** |

**Beide Laeufe schneller, in beiden Konten** — die Bedingung ist
erfuellt.

`[read]` Gemessen wird `responseEnd - requestStart` der Hauptanfrage,
nicht `networkidle`: dort warten die Abfragen. Skripte und Schriften
aendert dieser Umbau nicht, sie gehoerten nicht in die Zahl.

---

## 1 · Die langsamste Einzelabfrage — und was sie wirklich ist

`[cmd]` **Gemessen, je Abfrage, angemeldet:**

| Abfrage | `dev` | `test-user` |
|---|---|---|
| **`ladeRegeln`** | **853–926 ms** | **61–62 ms** |
| `getStackDaten` | 94–116 | ~40 |
| `getKatalog` | 52–55 | ~30 |
| `ladeGate` | 51 | ~25 |
| `ladeEigeneStacks` | 49–52 | ~20 |
| `ladeSubstanzListe` | 15–17 | ~15 |
| **Summe nacheinander** | **1112–1157** | ~190 |
| **mit `Promise.all`** | **864–873** | ~100 |

**Die Untergrenze ist `ladeRegeln`** — parallel kann nicht schneller
werden als die langsamste Einzelabfrage. Bei `dev` sind das 88 % der
Gesamtzeit.

### Und da liegt deutlich mehr im Weg

`[cmd]` **Die Seite liefert in 999 ms, die langsamste Abfrage braucht
880 ms** — der Rest ist Rendern und Uebertragung. **Das passt.**

`[cmd]` **Aber `rule_assessment` braucht in der Datenbank nur 172 ms.**
Die Differenz zu 880 ms ist PostgREST, HTTP und JSON — **rund 700 ms
Weg fuer 172 ms Arbeit.** Das ist der groessere Posten und **nicht Teil
dieses Auftrags**; er gehoert benannt.

### Der Fehler in meiner ersten Messung

`[read]` **In der ersten Sitzung habe ich 1373 → 993 ms gemeldet und
die Ursache in `rule_assessment` allein verortet. Die Richtung stimmt,
die Erklaerung war unvollstaendig.**

`[cmd]` Bei der Nachmessung stand plotzlich **58 ms** dort, wo vorher
**880 ms** stand — dieselbe Funktion, derselbe Server, dieselbe Minute.
**Fuenf Hypothesen einzeln geprueft und einzeln verworfen:**

| Verdacht | Messung | Ergebnis |
|---|---|---|
| Aufrufreihenfolge | zuerst 59 / danach 65 ms | verworfen |
| Wiederholung (10×) | 57–93 ms, kein Anstieg | verworfen |
| Messhuelle | nackt 58 / durch Huelle 57 ms | verworfen |
| Thunk-Liste | 59 ms | verworfen |
| Importliste (alle sechs) | 51–73 ms | verworfen |

`[cmd]` **Es war das KONTO.** Dasselbe Skript, nur `LUMEOS_KONTO`
getauscht:

    dev@lumeos.app          926 ms · 880 ms
    test-user@lumeos.local   62 ms ·  61 ms

**Der Grund steht in den Daten:**

| Konto | Stackpositionen | **Einnahmen** |
|---|---|---|
| `dev@lumeos.app` | 4 | **360** |
| `tom.seed@example.com` | 4 | **360** |
| `test-user@lumeos.local` | 3 | **24** |

`[cmd]` **`explain (analyze, buffers)`, dieselbe Funktion, beide
Konten:**

    dev:        temp read=9457 written=9457 · Execution Time 172 ms
    test-user:  (kein temp)                 · Execution Time  20 ms

`[read]` **Das Kreuzprodukt entsteht erst mit Einnahmehistorie.**
`rule_assessment` skaliert mit `intake_logs`, nicht mit der
Stackgroesse — 15× Daten, 15× Zeit, und die Temp-Bloecke erscheinen
genau dann.

**Das ist ein eigener Befund und ein Auftrag wert.** `[read]` Er war in
meiner ersten Meldung nicht sichtbar, weil ich nur ein Konto gemessen
habe.

---

## 2 · Der Waechter

`tools/ladekette-pruefen.mjs`, **Schwelle 3**, aus den Daten:

    0  coach/ai · coach · nutrition/suche · recovery · supplements
    1  coach/human · dashboard · settings
    2  medical
    ──── Luecke ────
    5  training
    10 nutrition

`[read]` **Acht Seiten liegen bei 0–2, dann der Sprung.** Die Schwelle
sitzt in der Luecke — sie laesst jedes Modul durch, das seine
unabhaengigen Abfragen buendelt, und faengt den Fall, der hier
aufgetreten ist.

**Zwei Ausnahmen sind eingebaut, beide begruendet:**

`[cmd]` **Identitaetsabfragen zaehlen nicht** — `angemeldeteNutzerin`,
`createSessionClient`, `auth.getUser`. **Fuenf Seiten brauchen die UUID,
BEVOR die naechste Abfrage laufen kann.** Das ist eine Abhaengigkeit,
kein Versaeumnis. `[read]` Ohne diese Ausnahme bestraft der Waechter
richtigen Code — und einer, der auf korrektem Code rot ist, wird
abgeschaltet statt befolgt.

`[cmd]` **`nutrition` (10) und `training` (5) stehen auf einer
Uebergangsliste mit ihrem Stand.** `[read]` Ein Waechter, der vom
ersten Tag an rot leuchtet, wirkt nicht. **Die Liste ist keine
Freigabe:** wer eine Abfrage anhaengt oder ein `Promise.all` zerlegt,
wird gefangen — die Zahl darf nur sinken.

**Nicht im Gate.** `[read]` `pnpm gate` ist eine `&&`-Kette und laut
`CLAUDE.md` bereits am Kennungswaechter rot; ein zweiter dauerhaft
roter Schritt macht sie wertlos. Der Befehl heisst `pnpm ladekette`.

### Warum es eine Pruefung sein musste

`[cmd]` **Die Kette ist in fuenf Auftraegen gewachsen**, je zwei
Abfragen: **0 → 2 → 2 → 4 → 6.** Nie ein Sprung. Jeder Schritt war fuer
sich klein und vertretbar; keiner hat die Summe gemessen.

`[cmd]` **`Promise.all` stand die ganze Zeit in sechs Nachbarmodulen**
— training, goals, recovery, nutrition, medical. **Nur in Supplements
nicht.**

`[read]` **C-189 hat dieselbe Lehre hinterlassen** — *„fuenf Auftraege
haben ihn angefasst, keiner hat es gemessen"*, 7.641 ms → 144 ms, als
Merksatz in `CLAUDE.md`. **Er hat nicht getragen.** Eine Lehre, die
keine Pruefung wird, wiederholt sich.

### Negativprobe

`[cmd]` Drei Sabotagen, je einzeln, SHA-identischer Rueckbau:

| Sabotage | |
|---|---|
| Kette in `supplements` zurueckgeholt | **rot** |
| `training` eine Abfrage mehr | **rot** |
| `Promise.all` in `training` zerlegt | **rot** |

---

## 3 · Jede Abfrage behaelt ihr eigenes `.catch()`

```ts
function ruhig<T>(f: () => Promise<T>, rueckfall: T): Promise<T> {
  return f().catch(() => rueckfall)
}
```

`[read]` **Ein gemeinsames `try` um das `Promise.all` haette die
Fehlertoleranz zerstoert** — der erste Fehler haette die ganze Seite
geleert. Jede Abfrage behaelt ihren eigenen Rueckfallwert: faellt der
Katalog aus, bleibt der Stack gueltig.

`[cmd]` **Gemessen, nicht behauptet.** `ladeSubstanzListe` sabotiert,
sodass sie wirft:

| | Status | Seite steht | Stack da | Katalogzahl | Fehlerseite |
|---|---|---|---|---|---|
| vorher | 200 | ja | ja | **412** | nein |
| **sabotiert** | **200** | **ja** | **ja** | **null** | **nein** |
| nachher | 200 | ja | ja | **412** | nein |

**Nur die eine Angabe faellt aus, die Seite steht.** Rueckbau
byteidentisch.

---

## 4 · Pruefungen

| Pruefung | Ergebnis |
|---|---|
| `tsc --noEmit` (web) | sauber |
| volle Testreihe (`.ts` + `.tsx`) | **625 pass, 0 fail** |
| `tools/ladekette-pruefen.mjs` | 13 Seiten, keine ueber 3 |
| `tools/encoding-pruefen.mjs` | 19.999 Dateien, sauber |
| `pnpm --filter @lumeos/web build` | Compiled successfully, 31/31 |

**Der Dev-Server wurde NICHT neu gestartet** — durchgehend **PID
351936**, Antwortzeit 0,1 s. `[read]` Der Vergleich lief ueber
kurzzeitige Codeaenderungen mit Rueckbau im `finally`, nicht ueber
Neustarts.

**Alle Messrouten sind wieder entfernt** (`api/messung-temp/`), samt
ihres Typrests in `.next/types` — gezielt dieser eine Ordner, **nicht
`.next` selbst.**

**Nicht angefasst:** `supabase/_pipeline/` (Codex).
**Nicht committet, nicht gestaged.**

---

## 5 · Was ich als Befund melde

**a) `rule_assessment` hat ein Kreuzprodukt ueber `intake_logs`.**
`[cmd]` `temp read=9457 written=9457` bei 360 Einnahmen, keine
Temp-Bloecke bei 24. **172 ms gegen 20 ms.** Das waechst mit der
Nutzung — bei einem Jahr Historie ist es das naechste C-189.

**b) Zwischen Datenbank und Anwendung liegen ~700 ms.** `[cmd]` 172 ms
in der Datenbank, 880 ms ueber PostgREST. **Der groessere Posten, und
noch unerklaert.**

**c) Eine Messung auf einem Konto ist keine Messung.** `[read]` Meine
erste Zahl war auf `dev` richtig und auf `test-user` um Faktor 15
daneben. **In jeden kuenftigen Leistungsauftrag gehoert, WELCHES Konto
gemessen wurde** — so wie seit dem 2026-08-18 der Stichtag zu jeder
Zahl gehoert.

---

## Geaenderte Dateien

| Datei | Was |
|---|---|
| `apps/web/src/app/v2/supplements/page.tsx` | `Promise.all` mit `ruhig()` je Abfrage |
| `tools/ladekette-pruefen.mjs` | **neu** — Waechter, Schwelle 3, Uebergangsliste |
| `package.json` | `pnpm ladekette` |
| `backup/g190-kalt-warm.mjs` | Nachweisskript (kalt/warm, Dokumentzeit) |
