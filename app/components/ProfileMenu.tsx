"use client"
/* eslint-disable @typescript-eslint/no-explicit-any */
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

export function ProfileMenu() {
  const { user } = useUser()
  const clerk = useClerk()
  const [subscriptionStatus, setSubscriptionStatus] = useState<{
    status: string
    type: string
    credits: number
  }>({ status: 'inactive', type: 'free', credits: 0 })

  useEffect(() => {
    if (user) {
      getUserSubscriptionStatus(user.id).then((status) => {
        setSubscriptionStatus(status)
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
              <a href={"/#pricing"}>
                <IconCoin className="mr-2 h-4 w-4" />
                <span>Buy Credits</span>
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