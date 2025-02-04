'use client'
import { IconCoin, IconLoader2 } from '@tabler/icons-react'
import { useUser } from "@clerk/nextjs"
import { getUserSubscriptionStatus } from "@/lib/user-utils"
import { useState, useEffect } from "react"

export function CreditsBadge({ isGenerating }: { isGenerating: boolean }) {
  const { user, isLoaded } = useUser();
  const [credits, setCredits] = useState<number | null>(null);

  useEffect(() => {
    const fetchCredits = async () => {
      try {
        if (isLoaded && user?.id && !isGenerating) {
          const subscription = await getUserSubscriptionStatus(user.id);
          setCredits(subscription.credits);
        }
      } catch (error) {
        console.error("Error fetching credits:", error);
        setCredits(null);
      }
    };
    fetchCredits();
  }, [user?.id, isLoaded, isGenerating]);

  // Handle potential provider errors by returning null
  if (!user || !isLoaded) {
    return null;
  }

  return (
    <div className="flex items-center space-x-2 bg-gray-100 px-3 py-1 rounded-full">
      <IconCoin className="h-5 w-5 text-yellow-500" />
      {credits === null ? (
        <IconLoader2 className="h-4 w-4 animate-spin text-gray-500" />
      ) : (
        <span className="text-gray-700">{credits} credits</span>
      )}
    </div>
  );
} 