cd D:\GitHub\LumeOS-Claude-V1

Write-Host "=== Tabellen in der lokalen Supabase ==="
psql postgresql://postgres:postgres@127.0.0.1:54322/postgres -c "\dt public.*"

Write-Host ""
Write-Host "=== Migrations die angewendet wurden ==="
psql postgresql://postgres:postgres@127.0.0.1:54322/postgres -c "SELECT name, executed_at FROM supabase_migrations.schema_migrations ORDER BY executed_at;"

Write-Host ""
Write-Host "=== Migration Files im Repo ==="
Get-ChildItem D:\GitHub\LumeOS-Claude-V1\supabase\migrations\ | Select-Object Name
