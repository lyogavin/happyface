import { Card, CardContent } from "@/components/ui/card"
import { Loader2, AlertCircle, Download } from "lucide-react"
import { UserGeneration } from "@/lib/user-utils"
import Image from "next/image"
import { useState, useEffect } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import posthog from 'posthog-js'
import DownloadDialog from "@/components/download-dialog"

interface GenerationHistoryProps {
  historicalImages: (UserGeneration & {
    // Add possible timestamp fields that might be present in the data
    createdAt?: string;
    created_at?: string;
    timestamp?: number;
  })[]
  isLoading: boolean
}

export function GenerationHistory({ historicalImages, isLoading }: GenerationHistoryProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [sortedImages, setSortedImages] = useState<UserGeneration[]>([])
  const [showDownloadDialog, setShowDownloadDialog] = useState(false)
  const [currentImage, setCurrentImage] = useState<string | null>(null)
  const [currentImageHQ, setCurrentImageHQ] = useState<boolean>(false)
  
  // Sort images by creation time when historicalImages changes
  useEffect(() => {
    if (!historicalImages || historicalImages.length === 0) {
      setSortedImages([]);
      return;
    }
    
    // Create a copy of historicalImages to avoid modifying the original
    const sorted = [...historicalImages];
    
    // Get the first object to check what properties are available
    const firstItem = sorted[0];
    
    // Check for timestamp properties in a more robust way
    if (Object.prototype.hasOwnProperty.call(firstItem, 'createdAt')) {
      console.log('Sorting by createdAt field');
      sorted.sort((a, b) => {
        return new Date(b.createdAt as string).getTime() - new Date(a.createdAt as string).getTime();
      });
    } else if (Object.prototype.hasOwnProperty.call(firstItem, 'created_at')) {
      console.log('Sorting by created_at field');
      sorted.sort((a, b) => {
        return new Date(b.created_at as string).getTime() - new Date(a.created_at as string).getTime();
      });
    } else if (Object.prototype.hasOwnProperty.call(firstItem, 'timestamp')) {
      console.log('Sorting by timestamp field');
      sorted.sort((a, b) => {
        return (b.timestamp as number) - (a.timestamp as number);
      });
    } else {
      // If no timestamp field is found, we'll use the original order
      // But log what properties are available for debugging
      console.log('No timestamp field found in generation history data. Using original order.');
      console.log('Available properties:', Object.keys(firstItem));
      
      // Add index property to maintain original order if data is resorted
      sorted.forEach((item, index) => {
        (item as any)._originalIndex = index;
      });
    }
    
    setSortedImages(sorted);
  }, [historicalImages]);

  const handleDownloadClick = (generation: UserGeneration) => {
    if (generation.generation) {
      if (generation.generation_hq) {
        // If there's already an HQ version, open it directly
        window.open(generation.generation_hq, '_blank')
        posthog.capture('download_image', {
          'image_url': generation.generation_hq,
          'source': 'history',
          'type': 'hq'
        })
      }
      else if (generation.credits === 2) {
        // For HQ generations (identified by credits=2), show the download dialog
        setCurrentImage(generation.generation)
        setCurrentImageHQ(true)
        setShowDownloadDialog(true)
        posthog.capture('download_dialog_open', {
          'image_url': generation.generation,
          'source': 'history'
        })
      } else {
        // For regular quality images, download directly
        window.open(generation.generation, '_blank')
        posthog.capture('download_image', {
          'image_url': generation.generation,
          'source': 'history',
          'type': 'standard'
        })
      }
    }
  }

  if (isLoading) {
    return (
      <div className="mb-10">
        <h2 className="text-2xl font-bold mb-6">Generation History</h2>
        <div className="flex justify-center items-center py-12">
          <div className="flex flex-col items-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
            <p className="text-sm font-medium text-muted-foreground">Loading your previous generations...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!historicalImages || historicalImages.length === 0) {
    return (
      <div className="mb-10">
        <h2 className="text-2xl font-bold mb-6">Generation History</h2>
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-muted-foreground">
              You haven&apos;t generated any images yet. Create your first image above!
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="mb-10">
      <p className="text-2xl font-bold mb-6">
        Generation History
        {sortedImages.some(gen => !gen.generation && gen.comfyui_prompt_id) && (
          <span className="ml-2 text-sm font-normal text-muted-foreground">
            ({sortedImages.filter(gen => !gen.generation && gen.comfyui_prompt_id).length} processing)
          </span>
        )}
        {sortedImages.some(gen => gen.generation === 'job_error') && (
          <span className="ml-2 text-sm font-normal text-red-500">
            ({sortedImages.filter(gen => gen.generation === 'job_error').length} failed)
          </span>
        )}
      </p>
      
      <DownloadDialog 
        isOpen={showDownloadDialog}
        onClose={() => setShowDownloadDialog(false)}
        imageUrl={currentImage || undefined}
      />
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {sortedImages.map((generation, index) => (
          <Card key={index} className="overflow-hidden">
            <div className="relative aspect-square bg-muted">
              {generation.generation === 'job_error' ? (
                <div className="w-full h-full flex flex-col items-center justify-center bg-red-50">
                  <AlertCircle className="h-8 w-8 text-red-500 mb-2" />
                  <p className="text-sm font-medium text-red-600">Generation Failed</p>
                  <p className="text-xs text-red-500 mt-1">Please try again</p>
                </div>
              ) : generation.generation ? (
                <div className="relative w-full h-full">
                  <img
                    src={generation.generation}
                    alt={`Generated Image ${index + 1}`}
                    className="object-cover w-full h-full cursor-pointer"
                    onClick={() => {
                      setSelectedImage(generation.generation);
                      setDialogOpen(true);
                    }}
                  />
                  <div className="absolute top-2 right-2">
                    <Button
                      variant="secondary"
                      size="icon"
                      className="rounded-full bg-white/80 hover:bg-white"
                      onClick={() => handleDownloadClick(generation)}
                    >
                      <Download className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ) : generation.comfyui_prompt_id ? (
                <div className="w-full h-full flex flex-col items-center justify-center animate-pulse">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                  <p className="text-sm font-medium text-muted-foreground">Processing...</p>
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <p className="text-sm font-medium text-muted-foreground">No image</p>
                </div>
              )}
            </div>
            {generation.prompt && (
              <CardContent className="p-3">
                <p className="text-xs text-gray-500 truncate" title={generation.prompt}>
                  {generation.prompt}
                </p>
              </CardContent>
            )}
          </Card>
        ))}
      </div>
      
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl p-0">
          {selectedImage && (
            <div className="relative">
              <img
                src={selectedImage}
                alt="Full-size generated image"
                className="w-full h-auto rounded-lg"
              />
              <div className="absolute bottom-4 right-4">
                <Button 
                  onClick={() => {
                    // Find the generation object for this image
                    const generation = sortedImages.find(gen => gen.generation === selectedImage);
                    if (generation) {
                      handleDownloadClick(generation);
                    } else {
                      // Fallback to direct download if generation not found
                      window.open(selectedImage, '_blank');
                    }
                    // Close the dialog
                    setDialogOpen(false);
                  }}
                  className="flex items-center justify-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

