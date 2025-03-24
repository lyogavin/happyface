"use client"

import { Button } from "@/components/ui/button"

export function ContactButton() {
  const openContactDialog = () => {
    window.dispatchEvent(new CustomEvent('openContactDialog'))
  }

  return (
    <Button 
      size="lg" 
      variant="outline" 
      onClick={openContactDialog}
    >
      Contact NSFW AI API Sales
    </Button>
  )
} 