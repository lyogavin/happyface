import type { Metadata } from "next"
import { Inter } from "next/font/google"
import type React from "react"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "NSFW AI API: Advanced Image Generator API for General NSFW Image Generation, and Cum Face, Clothes Removal, and More.",
  description: "Integrate our powerful NSFW AI image generator API into your applications. Access cum face generator, clothes remover, and NSFW image generation technologies through simple API calls. High-resolution outputs up to 8K.",
  keywords: "NSFW AI API, image generator API, cum face generator, clothes remover API, NSFW content generation, API integration, adult content API",
  openGraph: {
    title: "NSFW AI Image Generator API | Cum Face & Clothes Remover",
    description: "Integrate our powerful NSFW AI image generator API into your applications. Access cum face generator, clothes remover, and NSFW image generation technologies through simple API calls.",
    images: ['/nsfw-api-og.png'],
  },
  alternates: {
    canonical: "https://www.cumfaceai.com/ai-nsfw-api",
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function NSFWApiLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
} 