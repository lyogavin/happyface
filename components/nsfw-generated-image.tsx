import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, Share2, Loader2 } from "lucide-react"
import Image from "next/image"
import posthog from 'posthog-js'
import DownloadDialog from "@/components/download-dialog"
import { useState } from "react"
import { UserGeneration } from "@/lib/user-utils"

interface GeneratedImageProps {
  currentImage: string | null
  isGenerating: boolean
  generationStatus: 'idle' | 'pending' | 'processing' | 'completed' | 'error'
  currentImageHQ?: boolean
}

export function GeneratedImage({ 
  currentImage, 
  isGenerating, 
  generationStatus, 
  currentImageHQ = false 
}: GeneratedImageProps) {
  const [showDownloadDialog, setShowDownloadDialog] = useState(false)

  const handleDownloadClick = (imageUrl: string, isHQ: boolean) => {
    if (imageUrl) {
      if (isHQ) {
        // For HQ generations, show the download dialog
        setShowDownloadDialog(true)
        posthog.capture('download_dialog_open', {
          'image_url': imageUrl,
          'source': 'nsfw-generator'
        })
      } else {
        // For regular quality images, download directly
        window.open(imageUrl, '_blank')
        posthog.capture('download_image', {
          'image_url': imageUrl,
          'source': 'nsfw-generator',
          'type': 'standard'
        })
      }
    }
  }

  const handleShare = () => {
    if (currentImage) {
      // Copy the image URL to clipboard
      navigator.clipboard.writeText(currentImage)
        .then(() => {
          alert("Image URL copied to clipboard!")
          posthog.capture('share_nsfw_image', { 
            'image_url': currentImage 
          })
        })
        .catch(err => {
          console.error('Failed to copy to clipboard:', err)
        })
    }
  }

  return (
    <>
      <DownloadDialog 
        isOpen={showDownloadDialog}
        onClose={() => setShowDownloadDialog(false)}
        imageUrl={currentImage || undefined}
      />

      <Card className="flex flex-col h-full">
        <CardContent className="pt-6 flex-1 flex flex-col">
          <p className="text-xl font-semibold mb-4">Generated NSFW Image</p>

          <div className="relative flex-1 bg-muted rounded-md flex items-center justify-center mb-4 overflow-hidden" style={{ maxHeight: "500px" }}>
            {isGenerating ? (
              <div className="flex flex-col items-center justify-center h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin mb-2 text-primary" />
                <p className="text-sm text-center text-muted-foreground">
                  {generationStatus === 'pending' 
                    ? 'Your image is in the queue...' 
                    : 'Generating your NSFW image...'}
                </p>
              </div>
            ) : currentImage ? (
              <div className="relative w-full h-full flex items-center justify-center" style={{ maxHeight: "500px" }}>
                <img
                  src={currentImage}
                  alt="Generated NSFW image"
                  className="max-h-[500px] max-w-full object-contain"
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[400px]">
                <div className="relative flex items-center justify-center">
                  <img
                    src="/placeholder.svg?height=400&width=500"
                    alt="Generated image will appear here"
                    className="max-h-full max-w-full object-contain opacity-50"
                  />
                  <p className="absolute text-sm text-center text-muted-foreground">
                    Your generated image will appear here
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="flex-1" 
              onClick={() => currentImage && handleDownloadClick(currentImage, currentImageHQ)}
              disabled={!currentImage || isGenerating}
            >
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={handleShare}
              disabled={!currentImage || isGenerating}
            >
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  )
}

