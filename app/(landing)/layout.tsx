import type { Metadata } from "next"

import type React from "react" // Import React


export const metadata: Metadata = {
  title: "Cum Face AI - Generate your most preserved fantasy cum faces with AI",
  description: "Generate cum faces with prompts or from your own photos!",
  keywords: "AI face transformation, smile generator, happy face converter, facial expression AI, photo editing AI",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Cum Face AI - Generate your most preserved fantasy cum faces with AI",
    description: "Generate cum faces with prompts or from your own photos!",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "/how-it-works.png", // Make sure to add this image to your public folder
        width: 1200,
        height: 630,
        alt: "Cum Face AI Transform Demo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Cum Face AI - Generate your most preserved fantasy cum faces with AI",
    description: "Generate cum faces with prompts or from your own photos!",
    images: ["/how-it-works.png"], // Same image as OpenGraph
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
