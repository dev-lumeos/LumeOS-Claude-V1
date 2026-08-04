// Minimale zod-Brücke für react-hook-form (M3 Login).
// Ersetzt @hookform/resolvers, das nicht installiert ist — neue Pakete
// nur mit explizitem Auftrag. Gleiche Signatur wie der offizielle
// zodResolver, damit ein späterer Umstieg ein reiner Import-Tausch ist.
import type { FieldErrors, FieldValues, Resolver } from 'react-hook-form'
import type { z } from 'zod'

export function zodResolver<T extends FieldValues>(
  schema: z.ZodType<T>,
): Resolver<T> {
  return async (values) => {
    const result = schema.safeParse(values)
    if (result.success) {
      return { values: result.data, errors: {} }
    }
    const errors: FieldErrors<T> = {}
    for (const issue of result.error.issues) {
      const path = issue.path.join('.') || 'root'
      if (!(path in errors)) {
        ;(errors as Record<string, unknown>)[path] = {
          type: issue.code,
          message: issue.message,
        }
      }
    }
    return { values: {}, errors }
  }
}
