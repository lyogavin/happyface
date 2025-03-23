import { Card, CardContent } from "@/components/ui/card"
import { Loader2, AlertCircle } from "lucide-react"
import { UserGeneration } from "@/lib/user-utils"
import Image from "next/image"
import { useState, useEffect } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"

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
                <img
                  src={generation.generation}
                  alt={`Generated Image ${index + 1}`}
                  className="object-cover w-full h-full cursor-pointer"
                  onClick={() => {
                    setSelectedImage(generation.generation);
                    setDialogOpen(true);
                  }}
                />
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
                <a 
                  href={selectedImage} 
                  download="generated-image.png"
                  className="flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md px-3 py-2 text-sm font-medium"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-download">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                  </svg>
                  Download
                </a>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

