import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'TeamFlow — Gestão de Colaboradores',
  description: 'Sistema interno de gestão de equipe',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
