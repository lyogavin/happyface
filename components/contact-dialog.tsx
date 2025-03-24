"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { 
  IconCopy,
  IconCheck,
  IconMail
} from "@tabler/icons-react"

interface ContactDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  email: string
}

export function ContactDialog({ isOpen, onOpenChange, email }: ContactDialogProps) {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = () => {
    navigator.clipboard.writeText(email)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">Contact NSFW AI API Sales</DialogTitle>
          <DialogDescription>
            Send us an email with your inquiries about our NSFW AI API services.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-6 mb-2">
          <div className="bg-muted p-4 rounded-lg flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <IconMail className="h-5 w-5 text-primary" />
              <p className="text-md font-medium select-all">{email}</p>
            </div>
            <Button 
              type="button" 
              size="sm" 
              variant="outline"
              className={`px-3 flex items-center gap-1 ${copied ? "bg-green-100 text-green-700 border-green-200" : ""}`}
              onClick={copyToClipboard}
            >
              {copied ? (
                <>
                  <IconCheck className="h-4 w-4" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <IconCopy className="h-4 w-4" />
                  <span>Copy</span>
                </>
              )}
            </Button>
          </div>
        </div>
        <div className="mt-2 text-center text-sm text-muted-foreground">
          <p>We typically respond to inquiries within 24 hours.</p>
          <p className="mt-2">Questions about API pricing, custom plans, or technical integration are welcome!</p>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function ContactButton({ onClick, children }: { onClick: () => void, children: React.ReactNode }) {
  return (
    <Button 
      size="lg" 
      variant="outline" 
      onClick={onClick}
    >
      {children}
    </Button>
  )
} 