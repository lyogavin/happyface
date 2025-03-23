'use client'

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { 
  IconHome, 
  IconShirt, 
  IconMoodSmileDizzy,
  IconInfoCircle,
  IconHeart,
  IconStar,
  IconCrown,
  IconLock
} from "@tabler/icons-react"
import { cn } from "@/lib/utils"
import { Sidebar, SidebarContent } from "@/components/ui/sidebar"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from "@/components/ui/dialog"
import React from "react"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string,
  currentFeature: string
}

export function ClothesRemoverSidebar({ className, currentFeature }: SidebarProps) {
  const [showComingSoonDialog, setShowComingSoonDialog] = React.useState(false);

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
      id: "NSFW-Generator",
      label: "NSFW Generator",
      icon: IconLock,
      href: "/NSFW-generator"
    },
    {
      id: "ai-onlyfans-creator",
      label: "AI OnlyFans(Coming Soon)",
      icon: IconLock,
      href: ""
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
      label: "Best AI Models",
      icon: IconCrown,
      isPremium: true
    },
    {
      id: "premium-3",
      label: "Any Pose",
      icon: IconHeart,
      isPremium: true
    }
  ]

  return (
    <Sidebar className={className}>
      <div className="py-4 px-2">
        <div className="mb-2 px-4 flex items-center gap-2">
            <Link href="/">
              <Image 
                src="/logo/logo.png" 
                alt="Logo" 
                width={24} 
                height={24} 
              />
            </Link>
            <p className="text-lg font-semibold tracking-tight">
              <Link href="/">
                Cum Face AI
              </Link>
            </p>
        </div>
        <SidebarContent className="px-2">
          {sidebarItems.map((item) => (
            <Link 
              key={item.id}
              href={item.href || "#"}
              onClick={(e) => {
                if (!item.href) {
                  e.preventDefault();
                  setShowComingSoonDialog(true);
                }
              }}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                currentFeature === item.id 
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
        <p className="mb-2 px-4 text-lg font-semibold tracking-tight">
          Premium Features
        </p>
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
            <p className="text-sm font-medium text-blue-600">Need Help?</p>
          </div>
          <p className="mt-2 text-xs text-blue-600">
            Check our tutorials or contact support for assistance with the clothes removal tool.
          </p>
          <Button variant="link" size="sm" className="mt-2 h-auto p-0 text-xs text-blue-600">
            <Link href="mailto:gavinli@animaai.cloud">
              Contact Us
            </Link>
          </Button>
        </div>
      </div>
      
      {/* Coming Soon Dialog */}
      <Dialog open={showComingSoonDialog} onOpenChange={setShowComingSoonDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Feature Coming Soon</DialogTitle>
            <DialogDescription className="pt-4">
              <p className="mb-4">This feature is being developed. Please wait patiently.</p>
              <p>Any other questions? Please email us: <a href="mailto:gavinli@animaai.cloud" className="text-blue-500 hover:underline">gavinli@animaai.cloud</a></p>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </Sidebar>
  )
} 