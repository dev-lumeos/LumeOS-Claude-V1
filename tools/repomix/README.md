# Repomix Setup

Repomix packt die LumeOS Codebase in LLM-freundlichen Context.

## Installation

```bash
npm install -g repomix
# oder
npx repomix
```

## Verwendung

```bash
# Gesamte Codebase
npx repomix

# Nur bestimmte Pfade
npx repomix packages/ services/

# Mit Output-Datei
npx repomix -o context.txt
```

## Integration mit LightRAG

1. Repomix erstellt strukturierten Text-Output
2. LightRAG indexiert den Output
3. Knowledge Graph wird erstellt

## Konfiguration

Siehe `repomix.config.json` für Projekt-spezifische Settings.

## Output Formate

| Format | Verwendung |
|--------|-----------|
| Plain | Direkt in LLM Prompt |
| XML | Strukturierte Sections |
| Markdown | Human-readable |

## Referenzen

- [Repomix GitHub](https://github.com/yamadashy/repomix)
