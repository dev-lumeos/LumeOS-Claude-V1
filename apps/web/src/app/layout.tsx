import type { Metadata } from 'next'
import './globals.css'
import { AppShell } from '../components/shell/app-shell'

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
        <AppShell>{children}</AppShell>
      </body>
    </html>
  )
}
