import {
  ClerkProvider,
} from '@clerk/nextjs'
import "./globals.css"
import { Inter } from "next/font/google"
import type React from "react" // Import React
import { PostHogProvider } from './providers'
const inter = Inter({ subsets: ["latin"] })

// Add metadata export
export const metadata = {
  metadataBase: new URL("https://www.cumfaceai.com"),
  alternates: {
    canonical: "/",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          <PostHogProvider>
            {children}
          </PostHogProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}

