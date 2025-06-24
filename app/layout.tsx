import type { Metadata } from 'next'
import './globals.css'
import "@solana/wallet-adapter-react-ui/styles.css";
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

import { headers } from 'next/headers' // added
import ContextProvider from '@/context'
import { Toaster } from '@/components/ui/toaster';

export const metadata: Metadata = {
  title: 'TASS HUB Bridge',
  description: 'TASS HUB token bridge',
  generator: '@blockchainassisto',
  icons: {
    icon: '/image/favicon.png',
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const headersObj = await headers();
  const cookies = headersObj.get('cookie')
  return (
    <html lang="en">
      <body>
        <ContextProvider cookies={cookies}>
          {children}
        </ContextProvider>
        <Toaster />
      </body>
    </html>
  )
}
