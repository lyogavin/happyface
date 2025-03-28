import {
  ClerkProvider,
} from '@clerk/nextjs'
import "./globals.css"
import { Inter } from "next/font/google"
import type React from "react" // Import React
import { PostHogProvider } from './providers'
const inter = Inter({ subsets: ["latin"] })
import { getBootstrapData } from '../lib/getBootstrapData'
import { Analytics } from "@vercel/analytics/react"
// Add metadata export
export const metadata = {
  metadataBase: new URL("https://www.cumfaceai.com"),
  alternates: {
    canonical: "/",
  },
}

export default async function RootLayout({
  children, 
}: {
  children: React.ReactNode
}) {
  const bootstrapData = await getBootstrapData()
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          <PostHogProvider bootstrapData={bootstrapData}>
            {children}
            <Analytics />
          </PostHogProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}

