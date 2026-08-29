#!/usr/bin/env node
// Ein Punkt traegt eine Frage.
//
// Am 2026-08-29 hat der Orchestrator Tom eine von sechs Kacheln aus G-254
// vorgelegt und dessen Antwort auf den ganzen Punkt geschrieben. Fuenf
// Entscheidungen waeren getroffen worden, ohne dass Tom sie gesehen hat.
//
// Dieser Waechter findet Entscheidungspunkte, die mehrere Fragen buendeln,
// BEVOR sie vorgelegt werden.
//
// Sollstand: siehe SOLL. Neue Sammelpunkte muessen aufgeteilt werden.

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const WURZEL = join(dirname(fileURLToPath(import.meta.url)), '..');
const PUNKTE = join(WURZEL, 'docs', 'punkte');
const ORDNER = ['todos', 'laufend_codex', 'laufend_claudecode', 'laufend_kimi', 'laufend_fable'];

// Bekannte Sammelpunkte, die noch aufzuteilen sind. Beim Aufteilen hier
// senken.
const SOLL = 2;

const ZAHLWORT = '(?:zwei|drei|vier|f(?:ue|\u00fc)nf|sechs|sieben|acht|neun|zehn|elf|zw(?:oe|\u00f6)lf|\\d+)';
// "Punkte" ist absichtlich NICHT dabei: C-218 sagt "eine Verschlechterung um
// zehn Punkte" und meint Score-Punkte, keine Entscheidungen. Ein Waechter,
// der das Wort zaehlt statt der Wirkung, meldet Unsinn - derselbe Fehler,
// der in G-216, G-247 und G-246 dreimal in Folge auftrat.
const GEGENSTAND = '(?:Kacheln|Fragen|Entscheidungen|F(?:ae|\u00e4)lle|Konstanten)';

// Zweiter Weg zum selben Befund, unabhaengig vom Wortlaut: ein Punkt, der
// seinen Text in viele benannte Abschnitte gliedert, buendelt Themen -
// C-218 fuehrt A bis M. Das misst die Gestalt, nicht die Ankuendigung.
const ABSCHNITTE_MAX = 6;

const treffer = [];

for (const ordner of ORDNER) {
  const pfad = join(PUNKTE, ordner);
  if (!existsSync(pfad)) continue;
  for (const name of readdirSync(pfad).filter((n) => n.endsWith('.md'))) {
    const text = readFileSync(join(pfad, name), 'utf8');
    const teile = text.split('---');
    if (teile.length < 3) continue;
    if (!/^typ:\s*entscheidung\s*$/m.test(teile[1])) continue;

    // Auftrag, Bericht und Abnahme zaehlen nicht - dort steht die Arbeit,
    // nicht die Frage.
    let koerper = teile.slice(2).join('---');
    for (const marke of ['\n## Auftrag', '\n## Bericht', '\n## Abnahme']) {
      const i = koerper.indexOf(marke);
      if (i > 0) koerper = koerper.slice(0, i);
    }

    const m = koerper.match(new RegExp('\\b' + ZAHLWORT + '\\s+' + GEGENSTAND + '\\b', 'i'));
    if (m) {
      treffer.push({ ordner, name, stelle: m[0], grund: 'kuendigt an' });
      continue;
    }

    const abschnitte = (koerper.match(/^##\s+\S/gm) || []).length;
    if (abschnitte > ABSCHNITTE_MAX) {
      treffer.push({ ordner, name, stelle: abschnitte + ' Abschnitte', grund: 'gliedert' });
    }
  }
}

if (treffer.length) {
  console.log('[sammelfragen] ' + treffer.length + ' Entscheidungspunkt(e) buendeln mehrere Fragen:');
  console.log('');
  for (const t of treffer) {
    console.log('  ' + t.ordner + '/' + t.name);
    console.log('     ' + t.grund + ': "' + t.stelle + '"');
  }
  console.log('');
}

if (treffer.length > SOLL) {
  console.error('[sammelfragen] ROT: ' + treffer.length + ' Sammelpunkte, Soll ' + SOLL + '.');
  console.error('');
  console.error('  Ein Punkt traegt eine Frage. Wer mehrere buendelt, riskiert,');
  console.error('  dass eine Antwort auf alle geschrieben wird - so geschehen bei');
  console.error('  G-254 am 2026-08-29.');
  console.error('');
  console.error('  Aufteilen, bevor der Punkt vorgelegt wird. Dann SOLL senken.');
  process.exit(1);
}

console.log('[sammelfragen] gruen: ' + treffer.length + ' Sammelpunkte, Soll ' + SOLL + '.');
if (treffer.length) {
  console.log('  Diese sind bekannt und noch aufzuteilen - aber nicht vorlegen,');
  console.log('  bevor das geschehen ist.');
}
