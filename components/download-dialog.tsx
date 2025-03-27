'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { upscaleAndDownload } from "@/lib/upscale-download"
import { useToast } from "@/hooks/use-toast"
import { Download } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import posthog from "posthog-js"
import pRetry from 'p-retry'

interface DownloadDialogProps {
  isOpen: boolean
  onClose: () => void
  imageUrl?: string
}

export default function DownloadDialog({ isOpen, onClose, imageUrl }: DownloadDialogProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [upscaledImageUrl, setUpscaledImageUrl] = useState<string | null>(null)
  const [processingTime, setProcessingTime] = useState<number | null>(null)
  const { toast } = useToast()
  const [isProDialogOpen, setIsProDialogOpen] = useState(false)

  useEffect(() => {
    if (!isOpen) {
      setIsProcessing(false)
      setProgress(0)
      setUpscaledImageUrl(null)
      setProcessingTime(null)
    }
  }, [isOpen])

  // Add progress bar animation effect
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    
    if (isProcessing) {
      // Reset progress when starting
      setProgress(0);
      
      // Update progress every 100ms
      intervalId = setInterval(() => {
        setProgress(prev => {
          // Slowly increase up to 90% over 10 seconds
          // The remaining 10% will be set when processing completes
          if (prev < 90) {
            return prev + 0.9; // 90% over 10 seconds = 0.9% per 100ms
          }
          return prev;
        });
      }, 100);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isProcessing]);

  // Function to download the image
  const downloadImage = async (url: string) => {
    const response = await fetch(url)
    const blob = await response.blob()
    const blobUrl = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = blobUrl
    link.download = 'high-quality-image.png' // Customize the filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(blobUrl)
    posthog.capture('download_image', {
      image_url: url
    })
  }

  const handleDownloadRegular = () => {
    if (!imageUrl) {
      console.log("No imageUrl provided");
      return;
    }
    
    // posthog event
    posthog.capture('download_regular_quality', {
      image_url: imageUrl
    })
    
    downloadImage(imageUrl)
  }

  const handleUpscaleAndDownload = async () => {
    if (!imageUrl) {
      console.log("No imageUrl provided");
      return;
    }

    // posthog event
    posthog.capture('download_high_quality', {
      image_url: imageUrl
    })

    try {
      setIsProcessing(true)
      const startTime = Date.now()
      
      const result = await pRetry(
        () => upscaleAndDownload(imageUrl),
        {
          retries: 3,
          onFailedAttempt: (error) => {
            console.log(`Attempt ${error.attemptNumber} failed. ${error.retriesLeft} retries left.`)
          }
        }
      )
      
      setProgress(100) // Jump to 100% when complete
      setIsProcessing(false)

      if (result !== 'pro only' && result !== 'no subscription') {
        setUpscaledImageUrl(result)
        setProcessingTime((Date.now() - startTime) / 1000)
      } else if (result === 'pro only') {
        setIsProDialogOpen(true)
      } else if (result === 'no subscription') {
        toast({
          variant: "destructive",
          title: "No Subscription",
          description: "This feature is only available with a subscription. Please subscribe to access this and other premium features."
        })
      }

    } catch (error) {
      console.error('Error generating high-quality image:', error)
      setIsProcessing(false)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to process image. Please try again."
      })
      posthog?.capture('download_high_quality_error', {
        error: error
      });
    }
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Download className="h-5 w-5 text-yellow-500" />
              Download Image
              <div className="flex items-center gap-1">
                <Badge variant="secondary" className="bg-yellow-500 text-black">
                  high quality
                </Badge>
              </div>
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            {isProcessing ? (
              <div className="space-y-4">
                <Progress value={progress} />
                <p className="text-left text-sm text-muted-foreground">
                  Preparing high quality version...
                </p>
              </div>
            ) : upscaledImageUrl ? (
              <div className="space-y-4">
                <p className="text-left text-sm text-muted-foreground">
                  Processing completed in {processingTime?.toFixed(1)} seconds, click the button below to download.
                </p>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={onClose}>Close</Button>
                  <Button onClick={() => downloadImage(upscaledImageUrl)}>
                    Download High Quality
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <p>Choose which version of the image you'd like to download:</p>
                
                <div className="space-y-3 pt-2">
                  <p className="text-sm text-muted-foreground">
                    Download the regular resolution immediately, or enhance the image quality to create a higher resolution version with more detail.
                  </p>
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button variant="secondary" onClick={handleDownloadRegular}>
                    Download Regular
                  </Button>
                  <Button onClick={handleUpscaleAndDownload}>
                    Download High Quality
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}