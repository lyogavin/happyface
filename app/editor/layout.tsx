import type { Metadata } from "next"
import { Inter } from "next/font/google"
import Link from "next/link"
import type React from "react"
import { ProfileMenu } from "@/app/components/ProfileMenu"
import { CreditsBadge } from "@/app/components/CreditsBadge"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Happy Face AI - Turn Any Face into a Happy Face",
  description: "Use our advanced AI to generate joyful expressions or transform your photos into beaming smiles!",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <nav className="bg-white shadow-sm">
          <div className="container mx-auto px-4 py-3 flex justify-between items-center">
            <Link href="/" className="text-xl font-bold text-purple-600">
              Happy Face AI
            </Link>
            <div className="flex items-center space-x-4">
              <CreditsBadge />
              <ProfileMenu />
            </div>
          </div>
        </nav>
        {children}
      </body>
    </html>
  )
}

