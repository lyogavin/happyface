'use client'

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { 
  IconHome, 
  IconShirt, 
  IconMoodSmileDizzy,
  IconHistory, 
  IconSettings, 
  IconInfoCircle,
  IconHeart,
  IconStar,
  IconCrown
} from "@tabler/icons-react"
import { cn } from "@/lib/utils"
import { Sidebar, SidebarContent } from "@/components/ui/sidebar"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
}

export function ClothesRemoverSidebar({ className }: SidebarProps) {
  const [activeItem, setActiveItem] = useState("clothes-remover")

  const sidebarItems = [
    {
      id: "home",
      label: "Home",
      icon: IconHome,
      href: "/"
    },
    {
      id: "cum-face-generator",
      label: "Cum Face Generator",
      icon: IconMoodSmileDizzy,
      href: "/editor"
    },
    {
      id: "clothes-remover",
      label: "Clothes Remover",
      icon: IconShirt,
      href: "/clothes-remover"
    },
    {
      id: "history",
      label: "My History",
      icon: IconHistory,
      href: "/history"
    },
    {
      id: "settings",
      label: "Settings",
      icon: IconSettings,
      href: "/settings"
    }
  ]

  const premiumFeatures = [
    {
      id: "premium-1",
      label: "HD Resolution",
      icon: IconStar,
      isPremium: true
    },
    {
      id: "premium-2",
      label: "Batch Processing",
      icon: IconCrown,
      isPremium: true
    },
    {
      id: "premium-3",
      label: "Advanced Options",
      icon: IconHeart,
      isPremium: true
    }
  ]

  return (
    <Sidebar className={className}>
      <div className="py-4 px-2">
        <div className="mb-2 px-4 flex items-center gap-2">
          <Image 
            src="/logo/logo.png" 
            alt="Logo" 
            width={24} 
            height={24} 
          />
          <h2 className="text-lg font-semibold tracking-tight">
            Cum Face AI
          </h2>
        </div>
        <SidebarContent className="px-2">
          {sidebarItems.map((item) => (
            <Link 
              key={item.id}
              href={item.href}
              onClick={() => setActiveItem(item.id)}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                activeItem === item.id 
                  ? "bg-accent text-accent-foreground" 
                  : "hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </SidebarContent>
      </div>
      
      <Separator />
      
      <div className="py-4 px-2">
        <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
          Premium Features
        </h2>
        <ScrollArea className="h-[180px]">
          <SidebarContent className="px-2">
            {premiumFeatures.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-lg px-3 py-2 text-sm"
              >
                <div className="flex items-center gap-2">
                  <item.icon className="h-4 w-4 text-yellow-500" />
                  <span>{item.label}</span>
                </div>
                {item.isPremium && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-yellow-100 text-xs text-yellow-600">
                    <IconCrown className="h-3 w-3" />
                  </span>
                )}
              </div>
            ))}
          </SidebarContent>
        </ScrollArea>
      </div>
      
      <Separator />
      
      <div className="py-4 px-4">
        <div className="rounded-md bg-blue-50 p-3">
          <div className="flex items-center gap-2">
            <IconInfoCircle className="h-4 w-4 text-blue-600" />
            <h3 className="text-sm font-medium text-blue-600">Need Help?</h3>
          </div>
          <p className="mt-2 text-xs text-blue-600">
            Check our tutorials or contact support for assistance with the clothes removal tool.
          </p>
          <Button variant="link" size="sm" className="mt-2 h-auto p-0 text-xs text-blue-600">
            View Tutorials
          </Button>
        </div>
      </div>
    </Sidebar>
  )
} 