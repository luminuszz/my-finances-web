import './globals.css'

import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

import { QueryProvider } from '@/components/contexts/query-provider'
import { ThemeProvider } from '@/components/contexts/theme-provider'
import { Toaster } from '@/components/ui/sonner'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'My finances',
  description: 'Manage your finances with ease',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            <main className="flex min-h-screen flex-col antialiased">
              {children}
              <Toaster />
            </main>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
