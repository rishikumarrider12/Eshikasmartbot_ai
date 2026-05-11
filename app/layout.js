import './globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Eshika SmartBot AI - Your Intelligent Multilingual Companion',
  description: 'Eshika SmartBot AI is an advanced multilingual AI assistant founded by N Rishikumar.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
