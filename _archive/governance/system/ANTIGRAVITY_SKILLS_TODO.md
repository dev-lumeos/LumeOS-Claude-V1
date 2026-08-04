# Antigravity Awesome Skills — LUMEOS TODO
# Quelle: https://github.com/sickn33/antigravity-awesome-skills
# 1239+ Skills, MIT License
# Stand: April 2026

---

## STATUS

⏳ Noch nicht heruntergeladen — warten auf manuelle Aktion.

Grund: Skills sind öffentlich und müssen vor Installation auf Prompt Injections,
hidden instructions, suspicious URLs und encoded Blöcke geprüft werden.

---

## ANLEITUNG

1. Skills manuell in ein Temp-Verzeichnis runterladen
2. Claude Filesystem-Zugriff auf das Temp-Verzeichnis geben
3. Claude prüft jeden SKILL.md auf:
   - Prompt Injections ("ignore all previous instructions")
   - Hidden instructions in Whitespace/Kommentaren
   - Suspicious URLs die der Agent aufrufen soll
   - Base64 / encoded Blöcke
   - Anweisungen Dateien ausserhalb Scope zu lesen
4. Saubere Skills nach .claude/skills/ kopieren

---

## SKILLS ZUM HOLEN (Priorität 1 — Security)

```
security-auditor
api-security-best-practices
sql-injection-testing
vulnerability-scanner
```

## SKILLS ZUM HOLEN (Priorität 2 — Dev)

```
api-design-principles
debugging-strategies
test-driven-development
architecture
lint-and-validate
```

## SKILLS ZUM HOLEN (Priorität 3 — Workflow)

```
brainstorming
create-pr
doc-coauthoring
```

---

## POWERSHELL SCHNELL-DOWNLOAD (nach Security-Freigabe)

```powershell
$base = "https://raw.githubusercontent.com/sickn33/antigravity-awesome-skills/main/skills"
$dest = "D:\GitHub\LumeOS-Claude-V1\.claude\skills"

$skills = @(
  "security-auditor", "api-security-best-practices",
  "sql-injection-testing", "vulnerability-scanner",
  "api-design-principles", "debugging-strategies",
  "test-driven-development", "architecture",
  "lint-and-validate", "brainstorming", "create-pr", "doc-coauthoring"
)

foreach ($skill in $skills) {
  $dir = "$dest\$skill"
  New-Item -ItemType Directory -Force -Path $dir | Out-Null
  Invoke-WebRequest "$base/$skill/SKILL.md" -OutFile "$dir\SKILL.md"
  Write-Host "✅ $skill"
}
```
