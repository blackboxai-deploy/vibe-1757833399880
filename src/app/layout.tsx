import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { InventoryProvider } from '@/contexts/InventoryContext'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Inventario Flutter',
  description: 'Sistema de gestión de inventario con diseño Flutter',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={`${inter.className} bg-gray-50 min-h-screen`}>
        <InventoryProvider>
          {children}
          <Toaster 
            position="top-center"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#1f2937',
                color: '#f3f4f6',
                border: 'none',
                borderRadius: '12px',
              },
            }}
          />
        </InventoryProvider>
      </body>
    </html>
  )
}