
import type { Metadata } from "next"

import type React from "react" // Import React


export const metadata: Metadata = {
  title: "Happy Face AI - Turn Any Face into a Happy Face",
  description: "Use our advanced AI to generate joyful expressions or transform your photos into beaming smiles!",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
