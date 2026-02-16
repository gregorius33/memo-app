import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'

import { AuthProvider } from '@/contexts/auth'
import './globals.css'

const _geist = Geist({ subsets: ['latin'] })
const _geistMono = Geist_Mono({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '나의 메모',
  description: '생각을 정리하고 아이디어를 기록하세요',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko">
      <body className="font-sans antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
