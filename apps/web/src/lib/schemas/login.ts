// zod-Schema für die Anmeldung (M3 Login).
// Passwort-Minimum 6 spiegelt supabase/config.toml minimum_password_length.
import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().trim().email('Bitte eine gültige E-Mail-Adresse angeben.'),
  password: z.string().min(6, 'Das Passwort braucht mindestens 6 Zeichen.'),
})

export type LoginValues = z.infer<typeof loginSchema>
