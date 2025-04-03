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
import { User, LogOut } from "lucide-react"
import { getUserSubscriptionStatus } from "@/lib/user-utils"
import { IconCoin } from '@tabler/icons-react'
import posthog from 'posthog-js'
import TrackDeskTrackEmail from "@/components/track-desk-track-email"
export function ProfileMenu() {
  const { user, isLoaded } = useUser()
  const clerk = useClerk()
  const [subscriptionStatus, setSubscriptionStatus] = useState<{
    status: string
    type: string
    credits: number
  }>({ status: 'inactive', type: 'free', credits: 0 })

  useEffect(() => {
    if (user && isLoaded) {
      posthog.identify(
        user.id,  // Replace 'distinct_id' with your user's unique identifier
        { email: user.primaryEmailAddress?.emailAddress, name: user.fullName } // optional: set additional person properties
      );
      getUserSubscriptionStatus(user.id).then((status) => {
        setSubscriptionStatus(status)
      })
    }
  }, [user, isLoaded])

  return (
    <>
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
          <DropdownMenuLabel className="text-sm text-muted-foreground">
            <IconCoin className="inline mr-2 h-4 w-4" />
            Credits: {subscriptionStatus.credits}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          <DropdownMenuItem asChild>
            <a href={"/#pricing"}>
              <IconCoin className="mr-2 h-4 w-4" />
              <span>Buy Credits</span>
            </a>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
            
          <DropdownMenuItem onClick={() => clerk.signOut()}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <TrackDeskTrackEmail />
    </>
  )
} 