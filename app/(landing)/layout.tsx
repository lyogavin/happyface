import type { Metadata } from "next"

import type React from "react" // Import React


export const metadata: Metadata = {
  title: "Happy Face AI - Turn Any Face into a Happy Face",
  description: "Use our advanced AI to generate joyful expressions or transform your photos into beaming smiles!",
  keywords: "AI face transformation, smile generator, happy face converter, facial expression AI, photo editing AI",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Happy Face AI - Turn Any Face into a Happy Face",
    description: "Transform any photo with our AI-powered smile generator. Create natural, joyful expressions instantly!",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "/og-image.jpg", // Make sure to add this image to your public folder
        width: 1200,
        height: 630,
        alt: "Happy Face AI Transform Demo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Happy Face AI - Turn Any Face into a Happy Face",
    description: "Transform any photo with our AI-powered smile generator. Create natural, joyful expressions instantly!",
    images: ["/og-image.jpg"], // Same image as OpenGraph
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
