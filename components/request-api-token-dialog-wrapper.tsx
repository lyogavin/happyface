"use client"

import { useState, useEffect } from "react"
import { RequestApiTokenDialog } from "@/components/request-api-token-dialog"

export function RequestApiTokenDialogWrapper() {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    // Event listener to open the dialog from anywhere in the app
    const handleOpenDialog = () => {
      setIsOpen(true)
    }

    // Add event listener
    window.addEventListener('openRequestApiTokenDialog', handleOpenDialog)

    // Clean up
    return () => {
      window.removeEventListener('openRequestApiTokenDialog', handleOpenDialog)
    }
  }, [])

  return (
    <RequestApiTokenDialog 
      isOpen={isOpen} 
      onOpenChange={setIsOpen}
    />
  )
} 