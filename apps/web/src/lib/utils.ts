// shadcn-Helfer (Schritt A, 2026-08-05): Klassen zusammenfuehren.
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
