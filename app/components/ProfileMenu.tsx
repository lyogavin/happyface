"use client"

import { useEffect, useState } from "react"
import { useUser, useClerk } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { User, Settings, LogOut } from "lucide-react"
import { getUserSubscriptionStatus, getStripePortalSession } from "@/lib/user-utils"

export function ProfileMenu() {
  const { user, isLoaded } = useUser()
  const clerk = useClerk()
  const [subscriptionStatus, setSubscriptionStatus] = useState<{
    status: string
    type: string
    credits: number
  }>({ status: 'inactive', type: 'free', credits: 0 })
  const [paymentPortalUrl, setPaymentPortalUrl] = useState("")

  useEffect(() => {
    if (user) {
      getUserSubscriptionStatus(user.id).then((status) => {
        setSubscriptionStatus(status)
      })
      getStripePortalSession(
        (user as any).privateMetadata?.stripe_id,
        user.primaryEmailAddress?.emailAddress ?? ""
      ).then((session) => {
        if (session) {
          setPaymentPortalUrl(session.url)
        }
      })
    }
  }, [user])

  const hasAccess = subscriptionStatus.status === 'active'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="w-8 h-8 rounded-full">
          <User className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuLabel className="text-sm text-muted-foreground">
          {user?.primaryEmailAddress?.emailAddress}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {hasAccess && (
          <>
            <DropdownMenuItem asChild>
              <a href={paymentPortalUrl}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Manage Subscription</span>
              </a>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        <DropdownMenuItem onClick={() => clerk.signOut()}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 