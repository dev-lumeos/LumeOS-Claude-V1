import type { Metadata } from 'next'
import './globals.css'
import '../lib/dates'
import { AppShell } from '../components/shell/app-shell'
import { QueryProvider } from '../components/providers/query-provider'

export const metadata: Metadata = {
  title: 'LumeOS',
  description: 'Health & Performance Operating System'
}

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="de">
      <body>
        <QueryProvider>
          <AppShell>{children}</AppShell>
        </QueryProvider>
      </body>
    </html>
  )
}
