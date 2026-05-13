import fs from 'node:fs'
import path from 'node:path'

export interface MarkdownQualityResult {
  valid: boolean
  reason?: string
}

function normalizeLine(line: string): string {
  return line.trim()
}

function headingLines(content: string): string[] {
  return content
    .split(/\r?\n/)
    .map(normalizeLine)
    .filter(line => /^#{1,6}\s+\S+/.test(line))
}

function meaningfulBodyLines(content: string): string[] {
  return content
    .split(/\r?\n/)
    .map(normalizeLine)
    .filter(line =>
      line.length > 0 &&
      !line.startsWith('#') &&
      !line.startsWith('>') &&
      !line.startsWith('```') &&
      !/^[-*]\s*$/.test(line),
    )
}

export function isMarkdownOutputPath(filePath: string): boolean {
  return filePath.replace(/\\/g, '/').toLowerCase().endsWith('.md')
}

export function assessMarkdownContent(content: string): MarkdownQualityResult {
  const normalized = content.trim()
  if (normalized.length === 0) return { valid: false, reason: 'markdown output is empty' }

  const headings = headingLines(content)
  const bodyLines = meaningfulBodyLines(content)
  const totalBodyChars = bodyLines.join('\n').replace(/\s+/g, ' ').trim().length
  const longBodyLines = bodyLines.filter(line => line.replace(/\s+/g, ' ').length >= 20)

  if (headings.length < 2) return { valid: false, reason: 'markdown output has fewer than 2 headings' }
  if (longBodyLines.length < 2) return { valid: false, reason: 'markdown output has fewer than 2 meaningful body lines' }
  if (totalBodyChars < 160) return { valid: false, reason: 'markdown output body is too short' }

  const lastBodyLine = bodyLines[bodyLines.length - 1] ?? ''
  if (/^(this doc|todo|tbd|placeholder|coming soon)[\W_]*$/i.test(lastBodyLine)) {
    return { valid: false, reason: `markdown output ends in stub phrase: ${lastBodyLine}` }
  }

  return { valid: true }
}

export function assessMarkdownFile(repoRelativePath: string): MarkdownQualityResult {
  const fullPath = path.resolve(process.cwd(), repoRelativePath)
  if (!fs.existsSync(fullPath)) return { valid: false, reason: 'markdown output file is missing' }
  return assessMarkdownContent(fs.readFileSync(fullPath, 'utf8'))
}
