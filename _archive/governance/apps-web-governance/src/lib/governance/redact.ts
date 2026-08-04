const SECRET_PATTERNS: RegExp[] = [
  /(sb_(?:secret|publishable)_[A-Za-z0-9._-]+)/g,
  /(eyJ[A-Za-z0-9._-]{20,})/g,
  /((?:anon|service_role|secret|api[_-]?key|access[_-]?token)\s*[:=]\s*)["']?[^"'\s]+/gi,
]

export function redactSecrets(value: string): string {
  return SECRET_PATTERNS.reduce((text, pattern) => {
    return text.replace(pattern, (_match, prefix) => {
      if (typeof prefix === 'string' && /[:=]\s*$/.test(prefix)) return `${prefix}[REDACTED]`
      return '[REDACTED]'
    })
  }, value)
}

export function parseJsonFromStdout(stdout: string): unknown | null {
  const trimmed = stdout.trim()
  if (!trimmed) return null
  try {
    return JSON.parse(trimmed)
  } catch {
    const first = trimmed.indexOf('{')
    const last = trimmed.lastIndexOf('}')
    if (first >= 0 && last > first) {
      try {
        return JSON.parse(trimmed.slice(first, last + 1))
      } catch {
        return null
      }
    }
    return null
  }
}
