"use client"

import { useState, useEffect } from "react"
import { ContactDialog } from "@/components/contact-dialog"

interface ContactDialogWrapperProps {
  email: string
}

export function ContactDialogWrapper({ email }: ContactDialogWrapperProps) {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    // Event listener to open the dialog from anywhere in the app
    const handleOpenDialog = () => {
      setIsOpen(true)
    }

    // Add event listener
    window.addEventListener('openContactDialog', handleOpenDialog)

    // Clean up
    return () => {
      window.removeEventListener('openContactDialog', handleOpenDialog)
    }
  }, [])

  return (
    <ContactDialog 
      isOpen={isOpen} 
      onOpenChange={setIsOpen} 
      email={email} 
    />
  )
} 