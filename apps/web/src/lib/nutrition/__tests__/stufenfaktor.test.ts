// G-283 (stiller Rueckfall), G-284 (Mockups oeffentlich),
// G-285 (der dreimal berichtigte Kommentar).
import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'

import {
  nutritionScore, stufenFaktor, stufeGilt,
  STUFE_OFFEN_SATZ, STUFE_UNBEKANNT_SATZ,
} from '../../../app/v2/nutrition/diary-entwurf'
import { EXPERIENCE_LEVELS } from '../../profile/profile-model'

const WURZEL = path.resolve(process.cwd(), '../..')
const lies = (rel: string) => fs.readFileSync(path.join(WURZEL, rel), 'utf8')
const ohneKommentare = (rel: string) => lies(rel)
  .replace(/\{\/\*[\s\S]*?\*\/\}/g, '')
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/^[ \t]*\/\/.*$/gm, '')

const C = { protein: 0.79, calorie: 0.68, carbs: 0.53, fat: 0.80, fiber: 0.69 }

// ══ G-283 ══════════════════════════════════════════════════════════

test('G-283: ein unbekannter Name wird nicht stillschweigend zu 0,90', () => {
  // `[cmd]` **Der Anlass, gemessen am 2026-08-31:** die Datenbank
  // kennt `pro` (2 von 7 Profilen), der Code kannte `intermediate`.
  // **`LEVEL_MULT[level] ?? 0.90` gab `pro` den Faktor von
  // `intermediate`** — kein Absturz, keine Meldung, nur ein falscher
  // Wert. **Dieselbe Klasse wie A-60.**
  assert.equal(nutritionScore(C, 'gibtsnicht'), null,
    'Ein unbekannter Name liefert wieder eine Zahl (G-283).')
  assert.equal(stufenFaktor('gibtsnicht'), null)
  assert.equal(stufeGilt('gibtsnicht'), false)
  // Und die Gegenprobe: bekannte Namen rechnen weiter.
  assert.ok((nutritionScore(C, 'advanced') ?? 0) > 0,
    '`advanced` rechnet nicht mehr (G-283).')
  assert.equal(stufenFaktor('advanced'), 1.00)
})

test('G-283: die Namen stimmen mit Datenbank und Profilmodell ueberein', () => {
  // `[cmd]` **`EXPERIENCE_LEVELS` in `profile-model.ts:79` ist die
  // massgebliche Liste** — dieselben vier wie der CHECK auf
  // `public.profiles.experience_level`.
  //
  // `[read]` **Die Wirkung pruefen, nicht das Wort:** jeder Name aus
  // der Liste muss der Tabelle bekannt sein. **Sonst faellt genau der
  // Fall wieder durch, den dieser Punkt behebt.**
  for (const stufe of EXPERIENCE_LEVELS) {
    assert.equal(stufeGilt(stufe), true,
      `Die Stufe "${stufe}" steht in EXPERIENCE_LEVELS, aber die `
      + 'Faktortabelle kennt sie nicht (G-283).')
  }
  // `intermediate` gibt es in der Datenbank NICHT — es darf auch
  // hier nicht als gueltige Stufe gelten.
  assert.equal(stufeGilt('intermediate'), false,
    '`intermediate` gilt wieder als Stufe — die Datenbank kennt sie '
    + 'nicht (G-283/G-228).')
})

test('G-283: `pro` hat keinen geratenen Faktor', () => {
  // `[read]` **Welche vier Faktoren gelten, ist G-228 und gehoert
  // Tom.** `[read]` **Ein geratener Wert waere hier schlimmer als
  // keiner** — er saehe aus wie eine Antwort.
  assert.equal(stufeGilt('pro'), true, '`pro` ist keine gueltige Stufe mehr.')
  assert.equal(stufenFaktor('pro'), null,
    '`pro` hat einen Faktor bekommen — der ist nicht entschieden (G-228).')
  assert.equal(nutritionScore(C, 'pro'), null,
    'Ein `pro`-Profil bekommt wieder einen Score (G-283).')
})

test('G-283: die Kachel sagt, warum kein Score dasteht', () => {
  // `[read]` **Ein Ring auf 0 waere eine Aussage ueber den Nutzer,
  // die niemand gemacht hat.**
  assert.notEqual(STUFE_OFFEN_SATZ, STUFE_UNBEKANNT_SATZ,
    'Beide Saetze sagen dasselbe — dann tragen sie nichts bei (G-283).')
  assert.match(STUFE_OFFEN_SATZ, /G-228/,
    'Der offene Fall nennt den Punkt nicht, der ihn entscheidet (G-283).')
  const s = ohneKommentare('apps/web/src/app/v2/nutrition/score-echt.tsx')
  assert.match(s, /score === null/,
    'Die Kachel prueft nicht mehr auf den fehlenden Score (G-283).')
  assert.doesNotMatch(s, /\?\?\s*0\.90/,
    'Der stille Rueckfall auf 0,90 ist zurueck (G-283).')
  // `[cmd]` **Gemessen am Schirm:** `pro` zeigt „offen (G-228)",
  // `gibtsnicht` zeigt „unbekannt". `[read]` **Ein unbekannter Name
  // hat mit G-228 nichts zu tun** — er darf den Punkt nicht zitieren.
  // `[cmd]` **G-412: die Variable heisst `stufe`** — sie kommt aus
  // dem Profil, nicht mehr aus einer festen Zuweisung.
  // `[read]` **`\s*` statt `\s*\n?\s*`** — die Einrueckung der
  // umgezogenen Kachel ist tiefer, und die Zusage haengt nicht an
  // der Zeilenlage.
  assert.match(s, /stufeGilt\(stufe\)\s*\?\s*`\$\{stufe\} · offen \(G-228\)`/,
    'Die Zeile unterscheidet „offen" nicht mehr von „unbekannt" — dann '
    + 'zitiert ein Tippfehler den Punkt G-228 (G-283).')
})

// ══ G-412: DIESE ZUSAGE HAT SICH UMGEDREHT ═══════════════
//
// `[cmd]` **G-283 verbot den Satz** *„Source of level:
// experience_level“*, weil die Kachel `level` fest auf
// `'advanced'` setzte — eine genannte, aber ungenutzte Quelle ist
// eine Falschaussage (A-62).
//
// `[cmd]` **G-412 bindet die Kachel an** — sie liest
// `public.profiles.experience_level` wirklich. `[read]` **Damit
// ist derselbe Satz keine Falschaussage mehr, sondern die
// Wahrheit**, und die Probe verlangt ihn statt ihn zu verbieten.
//
// `[read]` **Geprueft wird beides:** die Zeile nennt die Quelle,
// UND der Leseweg holt sie.
test('G-283/G-412: die genannte Quelle ist die gelesene', () => {
  // `[cmd]` **Die Kachel setzt `level` fest auf `'advanced'`** und
  // sagte trotzdem *„Source of level: Auth · experience_level"*.
  // `[read]` **Ein Satz, der eine Quelle nennt, die nicht benutzt
  // wird, ist eine Falschaussage** — dieselbe Klasse wie A-62.
  const s = ohneKommentare('apps/web/src/app/v2/nutrition/score-echt.tsx')
  const zeile = /Source of level" value=\{?"([^"]+)"/.exec(s)
  assert.ok(zeile, 'Die Zeile "Source of level" wurde nicht gefunden (G-283).')
  assert.match(zeile[1], /experience_level/,
    'Die Kachel nennt die Quelle nicht mehr, obwohl sie sie liest '
    + '(G-412: das Profil WIRD gelesen, der Satz ist damit wahr).')
})

// ══ G-284 ══════════════════════════════════════════════════════════

test('G-284: unter apps/web/public/ liegt kein Mockup mehr', () => {
  // `[cmd]` **Gemessen am 2026-08-31: 94 Dateien, 592 kB, ohne
  // Anmeldung ausgeliefert** — `/mockup/index.html` war ein
  // lauffaehiges zweites Produkt neben dem echten.
  //
  // `[read]` **A-16: archivieren, nicht loeschen.** Der Fundus liegt
  // jetzt unter `docs/spezifikation/10-plattform/design-system/
  // mockup-zwischenwurf/`, neben `theme-v1`.
  // `[read]` **Die PLATTE lesen, nicht `git ls-files`.** `[cmd]` Die
  // erste Fassung fragte git — und **die Sabotage ueberlebte**, weil
  // ein zurueckkopierter Ordner ungetrackt ist und git ihn nicht
  // nennt. **Next.js liefert aber aus, was auf der Platte liegt.**
  // Derselbe Fehler wie in A-29.
  const pub = path.join(WURZEL, 'apps', 'web', 'public')
  const gefunden: string[] = []
  const geheDurch = (d: string) => {
    let eintraege: fs.Dirent[]
    try {
      eintraege = fs.readdirSync(d, { withFileTypes: true })
    } catch {
      return
    }
    for (const e of eintraege) {
      const p = path.join(d, e.name)
      if (e.isDirectory()) {
        if (/mockup/i.test(e.name)) gefunden.push(path.relative(WURZEL, p))
        else geheDurch(p)
      } else if (/mockup/i.test(e.name)) {
        gefunden.push(path.relative(WURZEL, p))
      }
    }
  }
  geheDurch(pub)
  assert.deepEqual(gefunden, [],
    'Unter `public/` liegen wieder Mockup-Dateien — sie werden ohne '
    + `Anmeldung ausgeliefert (G-284):\n  ${gefunden.join('\n  ')}`)
})

test('G-284: der Fundus ist erhalten, nicht geloescht', () => {
  // `[read]` **Ein Waechter, der nur das Verschwinden sichert, laedt
  // zum Loeschen ein.** Beide Richtungen gehoeren geprueft.
  // `[cmd]` **Auch hier die Platte lesen, nicht den Index.** Die
  // verschobenen Dateien sind ungetrackt, bis jemand sie
  // committet — `git ls-files` meldete deshalb 0, obwohl alle 94 da
  // liegen. **Derselbe Fehler wie eine Zeile weiter oben.**
  const archivWurzel = path.join(WURZEL, 'docs', 'spezifikation',
    '10-plattform', 'design-system', 'mockup-zwischenwurf')
  const archiv: string[] = []
  const sammle = (d: string) => {
    let e: fs.Dirent[]
    try {
      e = fs.readdirSync(d, { withFileTypes: true })
    } catch {
      return
    }
    for (const x of e) {
      const p = path.join(d, x.name)
      if (x.isDirectory()) sammle(p)
      else archiv.push(path.relative(archivWurzel, p))
    }
  }
  sammle(archivWurzel)
  assert.ok(archiv.length >= 90,
    `Der Fundus ist auf ${archiv.length} Dateien geschrumpft — A-16 `
    + 'sagt archivieren, nicht loeschen (G-284).')
  // Die vier ausgearbeiteten Dateien, die A-16 nennt.
  for (const n of ['MicroDashboard.js', 'PreferencesView.js',
                   'DiaryView.js', 'index.html']) {
    assert.ok(archiv.some(p => p.endsWith(n)),
      `${n} fehlt im Archiv (G-284).`)
  }
})

// ══ G-285 ══════════════════════════════════════════════════════════

test('G-285: display_tier heisst nicht mehr Abo-Gate', () => {
  // `[cmd]` **Dreimal geklaert — G-140, G-239, G-235 —** und dreimal
  // in `page.tsx` stehengeblieben. `[cmd]` **G-235 hat es gemessen:**
  // Stufe 1 sind Alltagswerte (ALC, CA, CHO), Stufe 3 Aminosaeuren
  // und Carotinoide. **Ein Abo-Tier gibt es im Schema nicht.**
  //
  // `[read]` **G-173 hat gezeigt, dass eine Korrektur ohne Waechter
  // still zurueckkippt** — deshalb diese Zeile.
  // `[read]` **Den Kommentarblock herausschneiden, nicht die Datei
  // durchsuchen** — sonst faende der Waechter „Abo-Gate" auch dann
  // nicht, wenn es woanders steht, oder er faende es in einer
  // fremden Zeile. Der Block beginnt bei `G-101/C-54` und endet am
  // ersten `import`.
  const s = lies('apps/web/src/app/v2/nutrition/page.tsx')
  const stelle = /\/\/ G-101\/C-54:[\s\S]*?\nimport /.exec(s)
  assert.ok(stelle, 'Der Kommentarblock zu `display_tier` wurde nicht '
    + 'gefunden (G-285).')
  assert.match(stelle[0], /display_tier/,
    'Der Block spricht nicht mehr von `display_tier` (G-285).')
  // `[read]` **Auf die BEHAUPTUNG pruefen, nicht auf die Zeichen.**
  // `[cmd]` Die Berichtigung ZITIERT den alten Wortlaut („Hier stand
  // weiter, `display_tier` sei *das Abo-Gate*") — ein Waechter auf
  // `/das Abo-Gate/` faellt an der eigenen Korrektur. **G-186 zum
  // vierten Mal.**
  //
  // Die Behauptung hat eine Form: `display_tier` **ist** das Gate.
  // Das Zitat hat eine andere: es **stand** da, und **ist es nicht**.
  assert.doesNotMatch(stelle[0], /display_tier`? ist das Abo-Gate/,
    '`display_tier` wird wieder als „das Abo-Gate" behauptet — es ist '
    + 'eine Anzeigetiefe (G-140/G-239/G-235).')
  assert.doesNotMatch(stelle[0], /und das ist das Abo-Gate/,
    'Die alte Formulierung ist zurueck (G-285).')
  assert.match(stelle[0], /Anzeigetiefe|ANZEIGETIEFE/,
    'Die Berichtigung nennt nicht mehr, was `display_tier` wirklich '
    + 'ist (G-285).')
})
