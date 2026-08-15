#!/usr/bin/env node
// C-16: Misst, ob deutsche Trainingsbegriffe den englischen Exercise-Bestand finden.
//
// Es gibt aktuell keine Training-Suchfunktion. Diese Vorhermessung nutzt deshalb
// bewusst nur ILIKE gegen training.exercises.name.
import { execFileSync } from 'node:child_process'

const C = 'supabase_db_LumeOS-Claude-V1'
const DB = process.env.PGDATABASE ?? 'postgres'

type Erwartung = [query: string, expectedId: string, expectedName: string]

const ERWARTUNGEN: Erwartung[] = [
  ['bankdruecken', '765e7a54-1bfe-4bb0-b1d3-e029994d81d7', 'Barbell Bench Press'],
  ['kurzhantel bankdruecken', 'c125ba06-622d-40b1-b213-7490fa249928', 'Dumbbell Bench Press'],
  ['schraegbankdruecken', '5bcabbfe-a7fa-435b-a162-eeb3f6e9df11', 'Barbell incline bench press'],
  ['kniebeuge', 'a96a88ce-7b9c-497f-aff1-a94d063a3fa2', 'Barbell full squat'],
  ['bodyweight squat', 'b21cc989-6856-4d41-8549-64f3ced7da7d', 'Bodyweight squat'],
  ['frontkniebeuge', 'c695379f-cce9-4ac4-8bc4-cd662b09aa1c', 'Barbell front squats'],
  ['hackenschmidt', '3fc92228-f629-4629-9481-ae2058855a96', 'Hack Squat Machine Squat'],
  ['kreuzheben', 'c048a6f9-96ae-4178-864c-e8e4e24bc8a8', 'Barbell deadlift'],
  ['rumänisches kreuzheben', '9952a3d8-33a1-4475-8e01-8bac6470b8e3', 'Barbell romanian deadlift'],
  ['sumo kreuzheben', '4dd217fe-d7e3-456c-b906-092bc88fe593', 'Barbell sumo deadlift'],
  ['klimmzug', 'df01457d-f98d-4ad5-89f8-0e3828a303c5', 'Assisted pull up'],
  ['chin up', '6129d7aa-6b58-4369-bbca-b134ad1546bb', 'Chin up'],
  ['bizepscurl', '7d4a7108-715d-46e0-a796-87c992904c87', 'Barbell bicep curl normal grip'],
  ['hammercurl', '9eba1776-8034-4121-ba1e-3ba96fecdb18', 'Dumbbell Hammer Curl'],
  ['schulterdruecken', '51e9e102-773d-4556-994b-af79e4204044', 'Barbell standing shoulder press'],
  ['latzug', '16c885e0-240e-4387-be84-1046ae04e49b', 'Cable close grip front lat pulldown'],
  ['lat pulldown', '94a062df-dff2-4768-93e5-c6f3183a6929', 'Lat pull down normal grip'],
  ['rudern', 'f0e85344-a706-4ef4-b256-6eba5b6c81f5', 'Cable seated row'],
  ['langhantel rudern', '6fa1b10e-67aa-4292-bed8-2e7f35577abf', 'Barbell bent over row pronated grip'],
  ['beinpresse', '8280a750-f61a-4672-9076-b12fa33af818', 'Leg press machine normal stance'],
  ['wadenheben', 'f81cd106-250b-48a2-a541-1b39c041c658', 'Bodyweight calf raises'],
  ['butterfly', '0e08a47d-5c4d-4e74-a6da-170d07b07531', 'Pec deck fly machine'],
  ['seitheben', '894e9e1f-4746-4fe8-ac66-23f37c4f2c89', 'Cable lateral raises'],
  ['trizepsdruecken', '4cd49c21-6a5f-4552-9ce1-83ffa310d3a5', 'Cable triceps push down straight bar'],
  ['trizepsstrecken', '4e6a8f63-0c2a-41b4-9df3-5c76db69ec53', 'Barbell lying triceps extension'],
  ['beinbeuger', '276006e0-8ae5-4d06-9b31-a82fb4c11e04', 'Lying leg curl machine'],
  ['hyperextension', 'ec472bf5-77e7-446c-ac55-97ba139871c0', '45 degree hyperextension (arms in front of chest)'],
  ['crunches', '21a977bf-4cde-43ae-9e36-4f216d16454b', 'Crunch floor'],
  ['planke', 'e46f2066-98f1-4056-82e5-b9d747a9b810', 'Plank on elbows'],
  ['ausfallschritt', '3e0e6090-4f2d-467f-97d7-80d348b1cae8', 'Bodyweight forward lunge'],
  ['bulgarian split squat', 'e6b98bb7-1491-4d50-91ef-74d4037bd3bb', 'Bulgarian split squat'],
  ['liegestuetz', 'c91fe64d-9014-4986-90f8-e23f50c4a301', 'Normal Push-up'],
  ['hip thrust', 'b35d8afd-c98c-4fdf-821f-73492dc84570', 'Barbell hip thrust'],
  ['good morning', '66422bbc-9ac9-4baf-ab64-9945ec085e4e', 'Good mornings barbell'],
]

const OHNE_SOLL: [string, string][] = [
  ['beinstrecker', 'Kein eindeutiger Leg-Extension-Eintrag im gelesenen Bestand'],
  ['reverse fly', 'Mehrere Geräte-/Kurzhantelvarianten, keine eindeutige Grundübung gewählt'],
  ['face pull', 'Band, Kurzhantel und Jump-Rope-Varianten konkurrieren'],
  ['shrugs', 'Mehrere Langhantel-/Kurzhantelvarianten konkurrieren'],
]

function sqlString(value: string) {
  return `'${value.replace(/'/g, "''")}'`
}

function suche(q: string) {
  const pattern = `%${q}%`
  const sql = `
    select id::text, name, coalesce(sort_weight, 0)::text
    from training.exercises
    where name ilike ${sqlString(pattern)}
    order by sort_weight desc nulls last, name
    limit 10;
  `
  const out = execFileSync('docker', [
    'exec', C, 'psql', '-U', 'postgres', '-d', DB,
    '-t', '-A', '-F', '\u0001', '-c', sql,
  ], { encoding: 'utf8', maxBuffer: 8 * 1024 * 1024 })

  return out.split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [id, name, sortWeight] = line.split('\u0001')
      return { id, name, sortWeight: Number(sortWeight) }
    })
}

let platz1 = 0
let top3 = 0
let drin = 0
let leer = 0
const details: string[] = []

for (const [query, expectedId, expectedName] of ERWARTUNGEN) {
  const result = suche(query)
  if (result.length === 0) {
    leer += 1
    details.push(`LEER    ${query.padEnd(24)} soll: ${expectedName}`)
    continue
  }

  const position = result.findIndex((row) => row.id === expectedId)
  if (position === 0) {
    platz1 += 1
    top3 += 1
    drin += 1
    details.push(`OK      ${query.padEnd(24)} ${result[0].name}`)
  } else if (position > 0 && position < 3) {
    top3 += 1
    drin += 1
    details.push(`PLATZ${position + 1}  ${query.padEnd(24)} statt: ${result[0].name} | soll: ${expectedName}`)
  } else if (position >= 0) {
    drin += 1
    details.push(`PLATZ${position + 1}  ${query.padEnd(24)} statt: ${result[0].name} | soll: ${expectedName}`)
  } else {
    details.push(`FEHL    ${query.padEnd(24)} ${result[0].name} | soll: ${expectedName}`)
  }
}

console.log(`Trainingsbegriffe: ${ERWARTUNGEN.length + OHNE_SOLL.length}`)
console.log(`  mit festem Sollwert     : ${ERWARTUNGEN.length}`)
console.log(`  ohne Sollwert           : ${OHNE_SOLL.length}`)
console.log('')
console.log(`  Sollwert auf Platz 1    : ${platz1} von ${ERWARTUNGEN.length}`)
console.log(`  in den ersten drei      : ${top3}`)
console.log(`  überhaupt in den Top 10 : ${drin}`)
console.log(`  gar keine Treffer       : ${leer}`)
console.log('')
details.forEach((line) => console.log(`  ${line}`))

if (OHNE_SOLL.length > 0) {
  console.log('')
  console.log('Ohne Sollwert:')
  for (const [query, reason] of OHNE_SOLL) {
    const first = suche(query)[0]
    console.log(`  ${query.padEnd(24)} ${first ? `aktueller erster Treffer: ${first.name}` : 'keine Treffer'} | ${reason}`)
  }
}

if (platz1 !== ERWARTUNGEN.length) process.exit(1)
