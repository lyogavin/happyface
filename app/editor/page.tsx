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
import { IconCoin, IconRefresh, IconLoader2, IconDownload } from "@tabler/icons-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
/*import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Slider } from "@/components/ui/slider"*/
import { toast } from "@/hooks/use-toast"
import { useUser } from "@clerk/nextjs"
import { getUserGenerations } from "@/lib/user-utils"
import posthog from 'posthog-js'
import Link from "next/link"
import { ProfileMenu } from "@/app/components/ProfileMenu"
import { CreditsBadge } from "@/app/components/CreditsBadge"
import { Progress } from "@/components/ui/progress"

export default function EditorPage() {
  const { user, isLoaded } = useUser()
  const [prompt, setPrompt] = useState("")
  const [currentImage, setCurrentImage] = useState<string | null>(null)
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [historicalImages, setHistoricalImages] = useState<string[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [showCreditDialog, setShowCreditDialog] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cumStrength, setCumStrength] = useState(1.0)
  const [orgasmStrength, setOrgasmStrength] = useState(1.0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    setCumStrength(1.0)
    setOrgasmStrength(1.0)
    console.log('cumStrength', cumStrength, 'orgasmStrength', orgasmStrength)
  }, [cumStrength, orgasmStrength])

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
    const startTime = new Date()
    console.log(`Generation started at: ${startTime.toISOString()}`)

    try {
      const userId = user?.id

      const jobId = await submitHappyFaceJob(
        userId || '', 
        uploadedImage, 
        prompt,
        cumStrength,
        orgasmStrength
      )

      if (jobId === 'Insufficient credits') {
        posthog.capture('user_insufficient_credits')
        setShowCreditDialog(true)
        setError('You need more credits to generate images')
        setIsGenerating(false)
        return
      }

      const checkStatus = async () => {
        try {
          const result = await checkHappyFaceStatus(jobId, userId || '', uploadedImage, prompt)
          
          if (result.status === 'completed' && result.url) {
            const endTime = new Date()
            const totalTimeSeconds = (endTime.getTime() - startTime.getTime()) / 1000
            console.log(`Generation completed at: ${endTime.toISOString()}`)
            console.log(`Total generation time: ${totalTimeSeconds.toFixed(1)} seconds`)
            
            setCurrentImage(result.url)
            setHistoricalImages((prev) => [result.url!, ...prev])
            setIsGenerating(false)
            setProgress(0)
            toast({
              title: "Success!",
              description: "Your happy face has been generated.",
            })
          } else if (result.status === 'error') {
            posthog.capture('generation_error', {'error': result})
            throw new Error('Failed to generate image')
          } else {
            const elapsedSeconds = (new Date().getTime() - startTime.getTime()) / 1000
            const progressPercent = Math.min(Math.floor((elapsedSeconds / 45) * 100), 99)
            setProgress(progressPercent)
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
          posthog.capture('generation_error', {'error': error})
          setProgress(0)
        }
      }

      await checkStatus()
    } catch (error) {
      setIsGenerating(false)
      
      if (error instanceof Error) {
        if (error.message === 'Insufficient credits') {
          posthog.capture('user_insufficient_credits')
          setShowCreditDialog(true)
          setError('You need more credits to generate images')
        } else {
          setError("Error generating image, please try again.")
          toast({
            title: "Error",
            description: "Error generating image, please try again.",
            variant: "destructive",
          })
          posthog.capture('generation_error', {'error': error})
        }
      }
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        if (event.target?.result) {
          setUploadedImage(event.target.result as string)
        }
      }
      reader.readAsDataURL(file)

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
        }
      } catch (error) {
        console.error('Error uploading to Supabase:', error)
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
              window.location.href = '/#pricing'
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
    <>
      {isGenerating && (
        <Progress 
          value={progress} 
          className="fixed top-0 left-0 right-0 z-50 h-1 rounded-none"
        />
      )}
      <nav className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Link href="/" className="text-xl font-bold text-purple-600">
            Cum Face AI
          </Link>
          <div className="flex items-center space-x-4">
            <CreditsBadge isGenerating={isGenerating}/>
            <ProfileMenu />
          </div>
        </div>
      </nav>
      
      <div className="container mx-auto px-4 py-8">
        <CreditPurchaseDialog />
        
        <h1 className="text-3xl font-bold mb-8 text-center">Cum Face AI Editor</h1>

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
                    <Label htmlFor="prompt">Enter your prompt (optional)</Label>
                    <Textarea
                      id="prompt"
                      placeholder={
                        uploadedImage
                          ? "Describe how you want to transform the uploaded image..."
                          : "Describe the cum face you want to generate..."
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
                    {uploadedImage && (
                      <div className="mt-2">
                        <Image
                          src={uploadedImage}
                          alt="Uploaded preview"
                          width={100}
                          height={100}
                          className="rounded-lg object-cover"
                        />
                      </div>
                    )}
                  </div>

                  {/*<Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="settings">
                      <AccordionTrigger>Advanced Settings</AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-6">
                          <div className="space-y-2">
                            <Label htmlFor="cum-strength">Cum on face strength: {cumStrength.toFixed(1)}</Label>
                            <Slider
                              id="cum-strength"
                              min={0}
                              max={1}
                              step={0.1}
                              value={[cumStrength]}
                              onValueChange={(value) => setCumStrength(value[0])}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="orgasm-strength">Orgasm face strength: {orgasmStrength.toFixed(1)}</Label>
                            <Slider
                              id="orgasm-strength"
                              min={0}
                              max={1}
                              step={0.1}
                              value={[orgasmStrength]}
                              onValueChange={(value) => setOrgasmStrength(value[0])}
                            />
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>*/}

                  <Button 
                    type="submit" 
                    className="w-full flex items-center justify-center gap-2" 
                    disabled={isGenerating || (!uploadedImage && !prompt) || !isLoaded}
                  >
                    {isGenerating ? (
                      <>
                        <IconLoader2 className="h-4 w-4 animate-spin mr-2" />
                        Generating...
                      </>
                    ) : (
                      "Generate Cum Face"
                    )}
                    <div className="flex items-center gap-0.5">
                      <span className="text-yellow-500">1 x </span>
                      <IconCoin className="h-4 w-4 text-yellow-500" />
                    </div>
                  </Button>
                </form>
              </div>
              <div className="flex items-center justify-center bg-gray-100 rounded-lg p-4">
                {currentImage ? (
                  <div className="relative w-full max-w-[512px]">
                    {isGenerating ? (
                      <div className="w-full aspect-square rounded-lg bg-gray-200 animate-pulse flex items-center justify-center">
                        <IconLoader2 className="h-8 w-8 animate-spin text-gray-400" />
                      </div>
                    ) : (
                      <Image
                        src={currentImage}
                        alt="Generated Happy Face"
                        width={512}
                        height={512}
                        className="rounded-lg shadow-lg w-full h-auto"
                      />
                    )}
                    <div className="absolute top-2 right-2 flex gap-2">
                      <Button
                        variant="secondary"
                        size="icon"
                        className="rounded-full bg-white/80 hover:bg-white"
                        onClick={() => {
                          if (currentImage) {
                            posthog.capture('download_image', {
                              'image_url': currentImage
                            })
                            window.open(currentImage, '_blank')
                          }
                        }}
                        disabled={isGenerating}
                      >
                        <IconDownload className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="secondary"
                        size="icon"
                        className="rounded-full bg-white/80 hover:bg-white"
                        onClick={handlePromptSubmit}
                        disabled={isGenerating}
                      >
                        {isGenerating ? (
                          <IconLoader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <IconRefresh className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center w-full max-w-[512px]">
                    {isGenerating ? (
                      <div className="w-full aspect-square rounded-lg bg-gray-200 animate-pulse flex items-center justify-center">
                        <IconLoader2 className="h-8 w-8 animate-spin text-gray-400" />
                      </div>
                    ) : (
                      <>
                        <p className="text-gray-500 mb-4">Your generated image will appear here</p>
                        <Image
                          src="/placeholder.svg?height=200&width=200&text=Happy Face"
                          alt="Placeholder"
                          width={200}
                          height={200}
                          className="mx-auto opacity-50"
                        />
                      </>
                    )}
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
                <CardContent className="p-2 flex justify-center">
                  <div className="relative w-full aspect-square">
                    <Image
                      src={img || "/placeholder.svg"}
                      alt={`Historical Image ${index + 1}`}
                      fill
                      className="rounded-lg object-cover"
                    />
                  </div>
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
    </>
  )
}

