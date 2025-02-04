"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { createClient } from "@supabase/supabase-js"
import { submitHappyFaceJob, checkHappyFaceStatus } from "@/lib/generate-happyface"
import { IconCoin } from "@tabler/icons-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { toast } from "@/hooks/use-toast"
import { useUser } from "@clerk/nextjs"
import { getUserGenerations } from "@/lib/user-utils"

export default function EditorPage() {
  const { user, isLoaded } = useUser()
  const [prompt, setPrompt] = useState("")
  const [currentImage, setCurrentImage] = useState<string | null>(null)
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [historicalImages, setHistoricalImages] = useState<string[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [showCreditDialog, setShowCreditDialog] = useState(false)
  const [error, setError] = useState<string | null>(null)
  

  // Add useEffect to load historical generations
  useEffect(() => {
    const loadHistoricalGenerations = async () => {
      if (user?.id) {
        try {
          const generations = await getUserGenerations(user.id);
          setHistoricalImages(generations);
        } catch (error) {
          console.error("Failed to load historical generations:", error);
          toast({
            title: "Error",
            description: "Failed to load your previous generations",
            variant: "destructive",
          });
        }
      }
    };

    if (isLoaded && user) {
      loadHistoricalGenerations();
    }
  }, [isLoaded, user]);

  const handlePromptSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsGenerating(true)
    setError(null)

    try {
      if (!uploadedImage) {
        throw new Error('An image is required for transformation')
      }

      // Get the current user ID (you'll need to implement this)
      const userId = user?.id // TODO: Get actual user ID from your auth system

      // Submit the generation request with userId and prompt
      const jobId = await submitHappyFaceJob(userId || '', uploadedImage, prompt)

      // Poll for results
      const checkStatus = async () => {
        try {
          const result = await checkHappyFaceStatus(jobId)
          
          if (result.status === 'completed' && result.url) {
            setCurrentImage(result.url)
            setHistoricalImages((prev) => [result.url!, ...prev])
            setIsGenerating(false)
            toast({
              title: "Success!",
              description: "Your happy face has been generated.",
            })
          } else if (result.status === 'error') {
            throw new Error('Failed to generate image')
          } else {
            // Continue polling if still processing
            setTimeout(checkStatus, 1000)
          }
        } catch (error) {
          console.error('Error checking generation status:', error)
          setIsGenerating(false)
          setError('Failed to check generation status. Please try again.')
          toast({
            title: "Error",
            description: "Failed to check generation status. Please try again.",
            variant: "destructive",
          })
        }
      }

      await checkStatus()
    } catch (error) {
      setIsGenerating(false)
      
      if (error instanceof Error) {
        if (error.message === 'Insufficient credits') {
          setShowCreditDialog(true)
          setError('You need more credits to generate images')
        } else {
          setError(error.message)
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive",
          })
        }
      }
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Show local preview
      const reader = new FileReader()
      reader.onload = (event) => {
        if (event.target?.result) {
          setUploadedImage(event.target.result as string)
        }
      }
      reader.readAsDataURL(file)

      // Upload to Supabase
      try {
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )

        const fileExt = file.name.split('.').pop()
        const fileName = `${Math.random()}.${fileExt}`
        const filePath = `happyface_upload/${fileName}`

        const { error } = await supabase.storage
          .from('images')
          .upload(filePath, file)

        if (error) {
          console.error('Error uploading image:', error.message)
          // You might want to show an error message to the user here
        }
      } catch (error) {
        console.error('Error uploading to Supabase:', error)
        // You might want to show an error message to the user here
      }
    }
  }

  const CreditPurchaseDialog = () => (
    <Dialog open={showCreditDialog} onOpenChange={setShowCreditDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Need More Credits</DialogTitle>
          <DialogDescription>
            You don{"'"}t have enough credits to generate images. Purchase more credits to continue.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            onClick={() => {
              // TODO: Implement navigation to credits purchase page
              window.location.href = '/credits'
            }}
          >
            Purchase Credits
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowCreditDialog(false)}
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )

  return (
    <div className="container mx-auto px-4 py-8">
      <CreditPurchaseDialog />
      
      <h1 className="text-3xl font-bold mb-8 text-center">Happy Face AI Editor</h1>

      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg">
          {error}
        </div>
      )}

      <Card className="mb-12">
        <CardContent className="p-6">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <form onSubmit={handlePromptSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="prompt">Enter your prompt</Label>
                  <Textarea
                    id="prompt"
                    placeholder={
                      uploadedImage
                        ? "Describe how you want to transform the uploaded image..."
                        : "Describe the happy face you want to generate..."
                    }
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="w-full"
                    rows={4}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="image-upload">Upload an image (optional)</Label>
                  <Input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="w-full"
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full flex items-center justify-center gap-2" 
                  disabled={isGenerating || !uploadedImage || !isLoaded}
                >
                  {isGenerating ? "Transforming..." : "Transform to Happy Face"}
                  <div className="flex items-center gap-0.5">
                    <span className="text-yellow-500">1 x </span>
                    <IconCoin className="h-4 w-4 text-yellow-500" />
                  </div>
                </Button>
              </form>
            </div>
            <div className="flex items-center justify-center bg-gray-100 rounded-lg p-4">
              {currentImage ? (
                <Image
                  src={currentImage || "/placeholder.svg"}
                  alt="Generated Happy Face"
                  width={512}
                  height={512}
                  className="rounded-lg shadow-lg"
                />
              ) : uploadedImage ? (
                <Image
                  src={uploadedImage || "/placeholder.svg"}
                  alt="Uploaded Image"
                  width={512}
                  height={512}
                  className="rounded-lg shadow-lg"
                />
              ) : (
                <div className="text-center">
                  <p className="text-gray-500 mb-4">Your generated or uploaded image will appear here</p>
                  <Image
                    src="/placeholder.svg?height=200&width=200&text=Happy Face"
                    alt="Placeholder"
                    width={200}
                    height={200}
                    className="mx-auto opacity-50"
                  />
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <h2 className="text-2xl font-bold mb-4">Historical Images</h2>
      {historicalImages.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {historicalImages.map((img, index) => (
            <Card key={index}>
              <CardContent className="p-2">
                <Image
                  src={img || "/placeholder.svg"}
                  alt={`Historical Image ${index + 1}`}
                  width={250}
                  height={250}
                  className="rounded-lg"
                />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-500 text-lg mb-4">You haven&apos;t generated any images yet.</p>
            <p className="text-gray-400">Use the prompt input above to create your first Happy Face!</p>
            <Image
              src="/placeholder.svg?height=200&width=200&text=No Images Yet"
              alt="No Images Placeholder"
              width={200}
              height={200}
              className="mx-auto mt-6 opacity-50"
            />
          </CardContent>
        </Card>
      )}
    </div>
  )
}

