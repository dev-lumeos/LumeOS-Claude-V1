#!/usr/bin/env node
// 00-FRAGEN.md wird erzeugt, nicht geschrieben.
//
// Tom, 2026-08-29: "nur muessen wir sicher sein dass diese fragen datei auch
// richtig aus dateien abgeleitet ist oder aus deinem nicht brauchbarem
// gedaechtnis".
//
// Jeder Satz in 00-FRAGEN.md stammt woertlich aus einer Punktdatei. Dieses
// Werkzeug liest sie und setzt die Datei zusammen. Ohne --schreiben prueft
// es nur, ob die abgelegte Fassung mit der erzeugten uebereinstimmt - dann
// faellt das Gate, sobald jemand von Hand hineinschreibt.
//
// Was aufbereitet gehoert, gehoert in die Punktdatei. Nicht hierher.

import { readFileSync, readdirSync, existsSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const WURZEL = join(dirname(fileURLToPath(import.meta.url)), '..');
const PUNKTE = join(WURZEL, 'docs', 'punkte');
const ZIEL = join(PUNKTE, '00-FRAGEN.md');
const ORDNER = ['todos', 'laufend_codex', 'laufend_claudecode', 'laufend_kimi', 'laufend_fable'];
const SCHREIBEN = process.argv.includes('--schreiben');

const RANG = { hoch: 0, mittel: 1, niedrig: 2 };
const UEBERSCHRIFT = { hoch: 'Hoch', mittel: 'Mittel', niedrig: 'Niedrig' };

function feld(kopf, name) {
  const m = kopf.match(new RegExp('^' + name + ':\\s*(\\S+)\\s*$', 'm'));
  return m ? m[1] : null;
}

const fragen = [];

for (const ordner of ORDNER) {
  const pfad = join(PUNKTE, ordner);
  if (!existsSync(pfad)) continue;
  for (const name of readdirSync(pfad).filter((n) => n.endsWith('.md')).sort()) {
    const text = readFileSync(join(pfad, name), 'utf8');
    const teile = text.split('---');
    if (teile.length < 3) continue;
    const kopf = teile[1];
    if (feld(kopf, 'typ') !== 'entscheidung') continue;
    const ent = feld(kopf, 'entscheidung');
    if (ent && /^E-\d+$/.test(ent)) continue;      // schon entschieden

    let koerper = teile.slice(2).join('---');
    // Arbeitsteile schneiden - dort steht nicht die Frage.
    for (const marke of ['\n## Auftrag', '\n## Bericht', '\n## Abnahme', '\n## Entschieden']) {
      const i = koerper.indexOf(marke);
      if (i > 0) koerper = koerper.slice(0, i);
    }
    const titelZeile = koerper.match(/^#\s+(\S+)\s*[-\u2014]\s*(.+)$/m);
    koerper = koerper.replace(/^#\s+.*$/m, '').trim();

    fragen.push({
      nr: feld(kopf, 'nr'),
      modul: feld(kopf, 'modul'),
      schwere: feld(kopf, 'schwere'),
      angelegt: feld(kopf, 'angelegt') || '?',
      titel: titelZeile ? titelZeile[2].trim() : name,
      datei: ordner + '/' + name,
      text: koerper,
    });
  }
}

fragen.sort((a, b) =>
  (RANG[a.schwere] ?? 9) - (RANG[b.schwere] ?? 9) ||
  a.modul.localeCompare(b.modul) ||
  a.nr.localeCompare(b.nr));

const zeilen = [];
zeilen.push('# Offene Fragen an Tom');
zeilen.push('');
zeilen.push('**Erzeugt von `tools/fragen-index.mjs`. Nicht von Hand aendern.**');
zeilen.push('');
zeilen.push('`[cmd]` **' + fragen.length + ' Punkte tragen `typ: entscheidung`');
zeilen.push('und sind keiner Entscheidung zugeordnet.**');
zeilen.push('');
zeilen.push('`[read]` **Jeder Satz unten steht woertlich in der genannten');
zeilen.push('Punktdatei.** Das Gate prueft es bei jedem Lauf — wer hier');
zeilen.push('hineinschreibt, macht es rot.');
zeilen.push('');
zeilen.push('**Wenn eine Frage entschieden ist:** ein ADR in');
zeilen.push('`docs/entscheidungen/`, und der Punkt bekommt `entscheidung: E-xx`.');
zeilen.push('Dann faellt er hier heraus.');
zeilen.push('');
zeilen.push('`[read]` **Was aufbereitet gehoert, gehoert in die Punktdatei** —');
zeilen.push('nicht in diese Uebersicht.');

let letzte = null;
for (const f of fragen) {
  if (f.schwere !== letzte) {
    zeilen.push('');
    zeilen.push('---');
    zeilen.push('');
    zeilen.push('# ' + (UEBERSCHRIFT[f.schwere] || f.schwere));
    letzte = f.schwere;
  }
  zeilen.push('');
  zeilen.push('## ' + f.nr + ' \u2014 ' + f.titel);
  zeilen.push('');
  zeilen.push('**Modul:** ' + f.modul + ' \u00b7 **angelegt:** ' + f.angelegt +
              ' \u00b7 **Datei:** `' + f.datei + '`');
  zeilen.push('');
  zeilen.push(f.text.replace(/\s+$/, ''));
}
zeilen.push('');

const erzeugt = zeilen.join('\n');

if (SCHREIBEN) {
  writeFileSync(ZIEL, erzeugt, 'utf8');
  console.log('[fragen] ' + fragen.length + ' offene Fragen -> docs/punkte/00-FRAGEN.md');
  process.exit(0);
}

if (!existsSync(ZIEL)) {
  console.error('[fragen] ROT: 00-FRAGEN.md fehlt. `node tools/fragen-index.mjs --schreiben`');
  process.exit(1);
}

const abgelegt = readFileSync(ZIEL, 'utf8');
if (abgelegt !== erzeugt) {
  console.error('[fragen] ROT: 00-FRAGEN.md weicht von den Punktdateien ab.');
  console.error('');
  console.error('  Entweder wurde von Hand hineingeschrieben, oder ein Punkt hat');
  console.error('  sich geaendert. Beides loest derselbe Befehl:');
  console.error('');
  console.error('    node tools/fragen-index.mjs --schreiben');
  console.error('');
  console.error('  Was aufbereitet gehoert, gehoert in die Punktdatei.');
  process.exit(1);
}

console.log('[fragen] gruen: ' + fragen.length + ' offene Fragen, Datei deckt sich mit den Punkten.');
