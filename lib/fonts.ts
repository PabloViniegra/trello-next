import { Inter, JetBrains_Mono, Playfair_Display } from 'next/font/google'

export const inter = Inter({
  display: 'swap',
  subsets: ['latin'],
  variable: '--font-sans',
})

export const playfairDisplay = Playfair_Display({
  display: 'swap',
  subsets: ['latin'],
  variable: '--font-display',
})

export const jetBrainsMono = JetBrains_Mono({
  display: 'swap',
  subsets: ['latin'],
  variable: '--font-mono',
})
