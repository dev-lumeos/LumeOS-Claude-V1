import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import test from 'node:test'
const db = process.env.PGDATABASE
const container = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
if (!db || db === 'postgres') throw new Error('C-460 braucht eine Wegwerf-Datenbank.')
function one<T>(sql: string): T { const out=execFileSync('docker',['exec',container,'psql','-X','-q','-v','ON_ERROR_STOP=1','-U','postgres','-d',db,'-t','-A','-c',sql],{encoding:'utf8'}).trim(); return JSON.parse(out.split(/\r?\n/).at(-1)??'') as T }
test('C-460: eine Beziehung kann mehrere der vier Coach-Faecher sicher tragen',()=>{
 const coach='c4600000-0000-0000-0000-000000000001', client='c4600000-0000-0000-0000-000000000002', other='c4600000-0000-0000-0000-000000000003'
 const r=one<any>(`BEGIN; INSERT INTO auth.users(id,email) VALUES('${coach}','c@test'),('${client}','u@test'),('${other}','x@test'); INSERT INTO coach.relationships(coach_id,client_id,status,invited_by,started_at) VALUES('${coach}','${client}','active','${coach}',now()); SET LOCAL ROLE authenticated; SELECT set_config('request.jwt.claim.sub','${coach}',true); SELECT coach.set_relationship_specialties((SELECT id FROM coach.relationships WHERE coach_id='${coach}' AND client_id='${client}'),ARRAY['training','nutrition']::text[]); RESET ROLE; CREATE TEMP TABLE c460_seen(who text primary key,n integer); GRANT SELECT,INSERT ON c460_seen TO authenticated; SET LOCAL ROLE authenticated; SELECT set_config('request.jwt.claim.sub','${client}',true); INSERT INTO c460_seen VALUES('client',(SELECT count(*) FROM coach.relationship_specialties)); SELECT set_config('request.jwt.claim.sub','${other}',true); INSERT INTO c460_seen VALUES('other',(SELECT count(*) FROM coach.relationship_specialties)); RESET ROLE; SELECT json_build_object('rows',(SELECT count(*) FROM coach.relationship_specialties),'client',(SELECT n FROM c460_seen WHERE who='client'),'other',(SELECT n FROM c460_seen WHERE who='other'),'anon',has_function_privilege('anon','coach.set_relationship_specialties(uuid,text[])','EXECUTE')); ROLLBACK;`)
 assert.equal(r.rows,2);assert.equal(r.client,2);assert.equal(r.other,0);assert.equal(r.anon,false)
})
