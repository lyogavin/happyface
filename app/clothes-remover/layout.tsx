import type { Metadata } from "next"
import { Inter } from "next/font/google"
import type React from "react"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "AI Clothes Remover: Best AI Clothes Remover, Any Pose, Any Clothes, Human Model or Anime Model, Natural High Quality Results, Commercial Level",
  description: "Upload any photo with clothed subjects. Our AI works best with clear, high-quality images. Any pose, any clothes, any outfit are all supported. From human models to anime models. Best quality natural results. Commercial level quality up to 8K.",
  keywords: "AI clothes remover, photo transformation, outfit removal, virtual nudity, realistic AI, image editing",
  openGraph: {
    title: "AI Clothes Remover: Transform Photos Instantly",
    description: "Upload any photo with clothed subjects. Our AI works best with clear, high-quality images. Any pose, any clothes, any outfit are all supported. From human models to anime models. Best quality natural results. Commercial level quality up to 8K.",
    images: ['/clothes-remover-og.png'],
  },
  alternates: {
    canonical: "https://www.cumfaceai.com/clothes-remover",
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function ClothesRemoverLayout({
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
