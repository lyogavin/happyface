import type { Metadata } from "next"
import { Inter } from "next/font/google"
import type React from "react"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "AI NSFW Image Generator: Premium AI Nude Generator for Realistic & Anime NSFW Art",
  description: "Our AI NSFW image generator is the most advanced AI nude maker available. Create stunning sexy AI art with our adult AI image generator that delivers unmatched quality. This NSFW art generator supports both realistic and anime styles, specially optimized for natural results. Whether you need an AI nude generator for personal or commercial use, our AI nude maker produces the most realistic outputs up to 8K resolution. Try the best adult AI image generator and NSFW art generator today!",
  keywords: "AI NSFW image generator, AI nude generator, AI nude maker, adult AI image generator, sexy AI art, NSFW art generator, realistic nudes, anime nudes, 8K NSFW art, NSFW AI, AI adult content creator",
  openGraph: {
    title: "AI NSFW Image Generator: Create Amazing AI Nudes with Our Advanced AI Nude Maker",
    description: "Experience the most powerful AI NSFW image generator and AI nude maker available. Our adult AI image generator creates stunning sexy AI art in both realistic and anime styles. This premium NSFW art generator is optimized for natural results with advanced customization options. Try our AI nude generator today for unmatched quality!",
    images: ['/nsfw-Cover.jpg'],
  },
  alternates: {
    canonical: "https://www.cumfaceai.com/NSFW-generator",
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function NSFWGeneratorLayout({
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