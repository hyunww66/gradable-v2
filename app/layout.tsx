import type React from "react"
import "@/app/globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import Script from "next/script"

const inter = Inter({ subsets: ["latin"] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
        <Script 
          data-goatcounter="https://614.goatcounter.com/count"
          src="//gc.zgo.at/count.js" 
          strategy="afterInteractive"
        />
      </body>
    </html>
  )
}

export const metadata = {
      generator: 'v0.dev'
    };
