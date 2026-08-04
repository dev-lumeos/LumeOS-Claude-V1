# Serena Check — Konfiguration + DB-Layer Protection verifizieren

Bitte folgende Checks sequenziell ausführen und jeweils Ergebnis rapportieren:

## 1. Serena MCP Connection
Prüfe ob Serena-MCP verfügbar ist:
- Rufe ein Serena-Tool auf (z.B. list_memories oder get_symbols_overview auf einer kleinen Datei)
- Erwartetes Ergebnis: Tool antwortet ohne Fehler

## 2. Memories vorhanden
Prüfe ob Serena-Memories korrekt geschrieben wurden:
- list_memories → sollte "project-overview" und "db-layer-protection" zeigen
- read_memory("project-overview") → Inhalt korrekt?
- read_memory("db-layer-protection") → Inhalt korrekt?

## 3. TypeScript LSP aktiv
Prüfe ob Serena den TypeScript Language Server korrekt startet:
- get_symbols_overview("packages/wo-core/src/schema.ts")
- Erwartetes Ergebnis: Liste der exportierten Interfaces/Types (WorkOrder, WOBatch, etc.)

## 4. Symbol Navigation
Prüfe ob Symbol-Lookup funktioniert:
- find_symbol("WorkOrder") → sollte packages/wo-core/src/schema.ts finden
- find_symbol("fetchReadyWOs") → sollte services/scheduler-api/src/workorder-repository.ts finden

## 5. DB-Layer Protection — ignored_paths Test
Prüfe ob project.yml's ignored_paths greifen:
- Versuche read_file("supabase/migrations/20260423120000_control_plane_tables.sql") via Serena
- Erwartetes Ergebnis: Fehler oder leer (Datei ist in ignored_paths)
- Falls kein Fehler: Protection greift nicht — rapportieren

## 6. Protection Rules sichtbar
Prüfe ob initial_prompt aktiv ist:
- initial_instructions Tool aufrufen (falls verfügbar)
- ODER: Rapportiere ob die DB-Protection-Regeln aus project.yml beim Session-Start sichtbar waren

## 7. MCP Config Bereinigung
Prüfe .claude/mcp.json:
- paperclip sollte NICHT mehr drin sein
- lean-ctx sollte NICHT mehr drin sein  
- Nur: context7 + serena

---

## Erwartetes Gesamtergebnis
- Serena verbindet ✅
- Memories lesbar ✅
- TypeScript LSP läuft ✅
- Symbol Navigation funktioniert ✅
- supabase/migrations/ nicht über Serena zugänglich ✅
- mcp.json bereinigt ✅

## Falls Fehler:
Rapportiere welcher Check fehlschlägt und warum.
Für ignored_paths: Falls SQL-Files trotzdem lesbar → alternative Schutzstrategie:
excluded_tools: [replace_content, replace_symbol_body, rename_symbol, insert_after_symbol, insert_before_symbol]
auf supabase/** anwenden (falls Serena das unterstützt).
