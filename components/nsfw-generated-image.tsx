import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, Share2, Loader2 } from "lucide-react"
import Image from "next/image"
import posthog from 'posthog-js'

interface GeneratedImageProps {
  currentImage: string | null
  isGenerating: boolean
  generationStatus: 'idle' | 'pending' | 'processing' | 'completed' | 'error'
}

export function GeneratedImage({ currentImage, isGenerating, generationStatus }: GeneratedImageProps) {
  const handleDownload = () => {
    if (currentImage) {
      posthog.capture('download_nsfw_image', { 
        'image_url': currentImage 
      })
      window.open(currentImage, '_blank')
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
    <Card className="flex flex-col h-full">
      <CardContent className="pt-6 flex-1 flex flex-col">
        <p className="text-xl font-semibold mb-4">Generated NSFW Image</p>

        <div className="relative flex-1 bg-muted rounded-md flex items-center justify-center mb-4 min-h-[300px]">
          {isGenerating ? (
            <div className="flex flex-col items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin mb-2 text-primary" />
              <p className="text-sm text-center text-muted-foreground">
                {generationStatus === 'pending' 
                  ? 'Your image is in the queue...' 
                  : 'Generating your NSFW image...'}
              </p>
            </div>
          ) : currentImage ? (
            <div className="relative w-full h-full flex items-center justify-center">
              <img
                src={currentImage}
                alt="Generated NSFW image"
                className="max-h-full max-w-full object-contain"
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center">
              <div className="relative flex items-center justify-center">
                <img
                  src="/placeholder.svg?height=400&width=400"
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
            onClick={handleDownload}
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
  )
}

