"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { IconCoin } from "@tabler/icons-react"
import { useEffect, useState } from "react"
import { useUser } from "@clerk/nextjs"

export function GetCreditsButton() {
  const { user } = useUser()
  const [buttonText, setButtonText] = useState("Get Free Credits")

  useEffect(() => {
    if (user) {
      setButtonText("Editor")
    }
  }, [user])

  return (
    <Button asChild>
      <Link href="/editor" className="flex items-center gap-2">
        {!user && <IconCoin className="w-4 h-4 text-yellow-400" />}
        
        {buttonText}
      </Link>
    </Button>
  )
}
