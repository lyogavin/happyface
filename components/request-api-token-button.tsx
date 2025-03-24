"use client"

import { Button } from "@/components/ui/button"
import { ButtonProps } from "@/components/ui/button"

interface RequestApiTokenButtonProps extends ButtonProps {
  children: React.ReactNode
}

export function RequestApiTokenButton({ children, ...props }: RequestApiTokenButtonProps) {
  const openRequestApiTokenDialog = () => {
    window.dispatchEvent(new CustomEvent('openRequestApiTokenDialog'))
  }

  return (
    <Button 
      onClick={openRequestApiTokenDialog}
      {...props}
    >
      {children}
    </Button>
  )
} 