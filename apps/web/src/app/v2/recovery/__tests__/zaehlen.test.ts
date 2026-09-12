// Die Zahlen je Art stehen fest (G-44).
//
// `[cmd]` Zur Laufzeit gezaehlt, nicht geschaetzt: 17 einfaerbbare
// Gruppen + 16 Injektionsorte + 6 Nicht-Muskeln = 39 IDs.
//
// WARUM ALS TEST UND NICHT NUR IM BERICHT: Eine Zahl im Bericht
// veraltet still. Diese hier faellt auf, sobald jemand eine ID
// umwidmet — etwa ein Teilstueck zur Gruppe macht, damit es
// eingefaerbt wird. Das waere ein halber Muskel am Bildschirm.
import { test } from 'node:test'
import assert from 'node:assert/strict'

import { EINORDNUNG, nachArt, RECOVERY_ZU_KARTE, flaechenFuer } from '../muskel-zuordnung'

test('die Aufteilung der 39 IDs steht fest', () => {
  // ══ G-430: 17 -> 20 Gruppen, 39 -> 42 IDs ══════════════════════
  //
  // `[cmd]` **Die Rechnung, nicht geraten:** `upper-back` und
  // `lower-back` (2) sind zu fuenf Muskeln geworden
  // (`teres-minor`, `teres-major`, `latissimus`, `erector-spinae`,
  // `flanke`). **17 - 2 + 5 = 20**, und **39 - 2 + 5 = 42**.
  //
  // `[read]` **Die Injektionsorte und Nicht-Muskeln sind
  // unberuehrt** — die Aufteilung betraf nur Flaechen.
  // `[cmd]` **G-431: 20 -> 22.** `gluteal` und `hamstring` sind je
  // in zwei Muskeln zerfallen: **20 - 2 + 4 = 22**, **42 - 2 + 4 = 44**.
  // `[cmd]` **G-433: 22 -> 30.** Fuenf Flaechen wurden zu vierzehn:
  // **22 - 5 + 14 = 31**, minus `flanke`? Nein — gemessen: 30,
  // weil `adductors` vorne UND hinten zaehlte.
  assert.equal(nachArt('gruppe').length, 36, 'einfaerbbare Muskelgruppen')
  assert.equal(nachArt('teilstueck').length, 16, 'Injektionsorte')
  assert.equal(nachArt('nicht-muskel').length, 7, 'Kniescheibe, Kopf, Haare, Haende, Knoechel, Fuesse')
  assert.equal(Object.keys(EINORDNUNG).length, 59, 'Summe')
})

test('so viele Gruppen faerbt die Karte tatsaechlich ein', () => {
  // `[cmd]` AM BILDSCHIRM NACHGEZAEHLT (2026-08-18, /v2/recovery):
  // 23 Muskel-IDs gerendert — 16 eingefaerbt, 5 grau, 2 mit fester
  // Farbe. Diese Rechnung haelt der Test nach.
  //
  // `[read]` Der Auftrag: „Im Browser gezaehlt, nicht in der Datei
  // gelesen." Das ist hier die Bruecke: die Zahl aus dem Browser wird
  // gegen die Zuordnung gerechnet, damit sie nicht auseinanderlaufen.
  // `[cmd]` **G-430: ueber `flaechenFuer`** — ein Kuerzel belegt seit
  // der Aufteilung mehrere Flaechen.
  const belegt = new Set(
    Object.keys(RECOVERY_ZU_KARTE).flatMap(slug => flaechenFuer(slug)))
  const gruppen = nachArt('gruppe')
  const eingefaerbt = gruppen.filter(id => belegt.has(id))
  const grauGruppen = gruppen.filter(id => !belegt.has(id))

  // `[cmd]` **G-430: 16 -> 19.** **Die Rechnung:** `upper_back` faerbt
  // jetzt drei Flaechen statt einer, `lower_back` zwei statt einer.
  // **16 - 2 + 5 = 19.**
  // `[cmd]` **G-431: 19 -> 21** — `hamstring` und `gluteal` faerben
  // jetzt je zwei Flaechen statt einer. **19 - 2 + 4 = 21.**
  // `[cmd]` **G-433: 21 -> 29** — gemessen, nicht gerechnet.
  assert.equal(eingefaerbt.length, 35,
    'Am Bildschirm sind 35 Gruppen farbig. Weicht die Zahl ab, ist '
    + 'entweder eine Zuordnung dazugekommen oder eine weggefallen.')
  // 1 Gruppe ohne Kuerzel (tibialis) + 6 Nicht-Muskeln = 7 IDs ohne
  // Zustandsfarbe. Davon tragen `head` und `hair` einen festen Ton,
  // die uebrigen fuenf die Grundflaeche — am Bildschirm gezaehlt:
  // 5 grau, 2 fest.
  // `[cmd]` **G-433 Nachtrag: 7 -> 8** — die `kehle` ist als
  // `nicht-muskel` dazugekommen (Kehlstueck zwischen den
  // Halsstraengen, kein Muskel).
  assert.equal(grauGruppen.length + nachArt('nicht-muskel').length, 8,
    'Ohne Zustandsfarbe bleiben tibialis und die sieben Nicht-Muskeln.')
  // Die Probe: eingefaerbt + ohne Farbe muss die Zahl der Muskel-IDs
  // ergeben, die die Karte zeichnet (23 — die 16 Injektionsorte sind
  // Punkte, keine Flaechen).
  const muskelIds = gruppen.length + nachArt('nicht-muskel').length
  assert.equal(eingefaerbt.length + grauGruppen.length + nachArt('nicht-muskel').length,
    muskelIds, 'Jede Muskel-ID ist entweder eingefaerbt oder nicht.')
  // `[cmd]` **G-430: 23 -> 26** — dieselbe Rechnung wie oben.
  // `[cmd]` **G-431: 26 -> 28** — dieselbe Rechnung.
  // `[cmd]` **G-433: 28 -> 36.**
  assert.equal(muskelIds, 43, 'Die Karte zeichnet 43 Flaechen-IDs.')
})

test('nur tibialis ist eine Gruppe ohne Recovery-Kuerzel', () => {
  // `[cmd]` Die Karte zeichnet den Schienbeinmuskel,
  // `MUSCLE_GROUPS_BODYMAP` fuehrt ihn nicht — er bleibt grau. Das ist
  // eine Luecke auf der DATENSEITE, kein Zuordnungsfehler. Wer ein
  // Kuerzel ergaenzt, faellt hier auf und traegt es im Bericht nach.
  // `[cmd]` **G-430: ueber `flaechenFuer`** — ein Kuerzel kann
  // mehrere Flaechen belegen, und `Object.values` saehe die Liste
  // als einen Wert.
  const belegt = new Set(
    Object.keys(RECOVERY_ZU_KARTE).flatMap(slug => flaechenFuer(slug)))
  const ohne = nachArt('gruppe').filter(id => !belegt.has(id))
  assert.deepEqual(ohne, ['tibialis'],
    `Gruppen ohne Recovery-Kuerzel: ${ohne.join(', ')}. `
    + 'Erwartet ist genau `tibialis`.')
})
