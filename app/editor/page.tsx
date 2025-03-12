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
import { submitHappyFaceJobAdvanced, checkHappyFaceStatusAdvanced } from "@/lib/generate-happyface-advanced"
import { IconCoin, IconRefresh, IconLoader2, IconDownload } from "@tabler/icons-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Slider } from "@/components/ui/slider"
import { toast } from "@/hooks/use-toast"
import { useUser } from "@clerk/nextjs"
import { getUserGenerations, UserGeneration } from "@/lib/user-utils"
import posthog from 'posthog-js'
import Link from "next/link"
import { ProfileMenu } from "@/app/components/ProfileMenu"
import { CreditsBadge } from "@/app/components/CreditsBadge"
import { Progress } from "@/components/ui/progress"
import { ClothesRemoverSidebar } from "@/components/clothes-remover-sidebar"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { EditorFooter } from "@/app/components/EditorFooter"
import { validateImage } from "@/lib/image-checker"
import { AlertCircle as LucideAlertCircle } from "lucide-react"
import pRetry, { AbortError } from 'p-retry'

export default function EditorPage() {
  const { user, isLoaded } = useUser()
  const [prompt, setPrompt] = useState("")
  const [currentImage, setCurrentImage] = useState<string | null>(null)
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [historicalImages, setHistoricalImages] = useState<UserGeneration[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [showCreditDialog, setShowCreditDialog] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cumStrength, setCumStrength] = useState(1.0)
  const [orgasmStrength, setOrgasmStrength] = useState(1.0)
  const [progress, setProgress] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [generationStatus, setGenerationStatus] = useState<'idle' | 'pending' | 'processing' | 'completed' | 'error'>('idle')
  const [validationError, setValidationError] = useState<string | null>(null)
  const [showErrorDialog, setShowErrorDialog] = useState(false)
  const [onlyModifyFace, setOnlyModifyFace] = useState(true)
  const [expectedTotalTime, setExpectedTotalTime] = useState(88)

  const [featureFlagControl, setFeatureFlagControl] = useState(true)

  useEffect(() => {
    const MOCK_LOCAL = true;
    if (MOCK_LOCAL && process.env.NODE_ENV === 'development') {
      setFeatureFlagControl(true)
      setExpectedTotalTime(129)
    } else {
      const flag = posthog.getFeatureFlag('new-happyface-workflow')
      setFeatureFlagControl(flag === 'control')
      setExpectedTotalTime(88)
    }
  }, [])

  // Add useEffect to load historical generations
  useEffect(() => {
    const loadHistoricalGenerations = async () => {
      if (user?.id) {
        try {
          setIsLoading(true)
          // if local limit 5, otherwise 20
          // check if it's from localhost
          const isLocal = window.location.hostname === 'localhost';
          const generations = await getUserGenerations(user.id, 'cum-face', isLocal ? 5 : 20);
          
          // Set the historical images first
          setHistoricalImages(generations)
          setIsLoading(false)
          
          // Filter out incomplete generations that need checking
          const incompleteGenerations = generations.filter(
            gen => !gen.generation && gen.comfyui_prompt_id
          );
          
          if (incompleteGenerations.length > 0) {
            console.log(`Found ${incompleteGenerations.length} incomplete generations to check`);
            // Check these incomplete generations directly
            checkIncompleteGenerations(user.id, incompleteGenerations);
          }
        } catch (error) {
          console.error("Failed to load historical generations:", error)
          toast({
            title: "Error",
            description: "Failed to load your previous generations",
            variant: "destructive",
          })
          setIsLoading(false)
        }
      }
    }

    if (isLoaded && user) {
      loadHistoricalGenerations()
    }
  }, [isLoaded, user])

  // Function to check incomplete generations without relying on state
  const checkIncompleteGenerations = async (
    userId: string, 
    incompleteGenerations: UserGeneration[]
  ) => {
    if (incompleteGenerations.length === 0) return;
    
    console.log(`Checking ${incompleteGenerations.length} incomplete generations...`);
    
    // Track which generations were updated
    const updatedGenerationIds: string[] = [];
    
    // Check each incomplete generation
    await Promise.all(
      incompleteGenerations.map(async (gen) => {
        if (!gen.comfyui_prompt_id) return;
        
        try {
          // Call the appropriate status checking function based on featureFlagControl
          const status = featureFlagControl
            ? await checkHappyFaceStatus(
                gen.comfyui_prompt_id,
                userId,
                gen.upload_image,
                gen.prompt || ''
              )
            : await checkHappyFaceStatusAdvanced(
                gen.comfyui_prompt_id,
                userId,
                gen.upload_image,
                gen.prompt || ''
              );
          
          // If the generation is completed, update it
          if (status.status === 'completed' && status.url) {
            console.log(`Generation ${gen.comfyui_prompt_id} completed!`);
            updatedGenerationIds.push(gen.comfyui_prompt_id);
            
            // Update our local state to reflect the change
            setHistoricalImages(prev => 
              prev.map(prevGen => 
                prevGen.comfyui_prompt_id === gen.comfyui_prompt_id
                  ? { ...prevGen, generation: status.url || '' }
                  : prevGen
              )
            );
          } else if (status.status === 'job_error') {
            console.error(`Generation ${gen.comfyui_prompt_id} failed with job error`);
            posthog.capture('generation_job_error', {'error': status, 'source': 'job_error'})
            updatedGenerationIds.push(gen.comfyui_prompt_id);
            
            // Update our local state to mark as job_error
            setHistoricalImages(prev => 
              prev.map(prevGen => 
                prevGen.comfyui_prompt_id === gen.comfyui_prompt_id
                  ? { ...prevGen, generation: 'job_error' }
                  : prevGen
              )
            );
          }
        } catch (error) {
          console.error(`Error checking generation ${gen.comfyui_prompt_id}:`, error);
        }
      })
    );
    
    // Get the generations that are still incomplete
    const stillIncompleteGenerations = incompleteGenerations.filter(
      gen => gen.comfyui_prompt_id && !updatedGenerationIds.includes(gen.comfyui_prompt_id)
    );
    
    // If there are still incomplete generations, check again after a delay
    if (stillIncompleteGenerations.length > 0) {
      console.log(`${stillIncompleteGenerations.length} generations still incomplete, checking again in 3 seconds...`);
      setTimeout(() => checkIncompleteGenerations(userId, stillIncompleteGenerations), 3000);
    } else {
      console.log('All generations are now complete!');
    }
  };

  const handlePromptSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsGenerating(true)
    setError(null)
    setGenerationStatus('idle')
    let startTime = new Date()
    console.log(`Generation started at: ${startTime.toISOString()}`)

    try {
      const userId = user?.id

      posthog.capture('generation_started', {
        'user_id': userId,
        'prompt': prompt,
        'cum_strength': cumStrength,
        'orgasm_strength': orgasmStrength,
        'uploaded_image': uploadedImage,
        'only_modify_face': onlyModifyFace
      })

      // Use p-retry for submitHappyFaceJob
      const jobId = await pRetry(
        async () => {
          let result;
          
          if (featureFlagControl) {
            // Use the standard version
            result = await submitHappyFaceJob(
              userId || '', 
              uploadedImage, 
              prompt,
              cumStrength,
              orgasmStrength
            )
          } else {
            // Use the advanced version
            result = await submitHappyFaceJobAdvanced(
              userId || '', 
              uploadedImage, 
              prompt,
              cumStrength,
              orgasmStrength,
              onlyModifyFace
            )
          }
          
          // Handle specific error cases that shouldn't be retried
          if (result === 'Insufficient credits') {
            throw new AbortError('Insufficient credits')
          }
          
          if (!result) {
            throw new Error('Failed to submit job')
          }
          
          return result
        },
        { 
          retries: 5,
          onFailedAttempt: (error: any) => {
            console.error(`Attempt ${error.attemptNumber} failed. ${error.retriesLeft} retries left.`, error)
          }
        }
      ).catch((error: any) => {
        if (error instanceof AbortError) {
          return 'Insufficient credits'
        }
        posthog.capture('generation_error', {
          'error': error,
          'source': 'submitHappyFaceJob error'
        })
        setError('Failed to submit the job, please try again.')
        setIsGenerating(false)
        throw error
      })

      if (jobId === 'Insufficient credits') {
        posthog.capture('user_insufficient_credits')
        setShowCreditDialog(true)
        setError('You need more credits to generate images')
        setIsGenerating(false)
        return
      }

      const checkStatus = async () => {
        try {
          const result = featureFlagControl 
            ? await checkHappyFaceStatus(jobId, userId || '', uploadedImage, prompt)
            : await checkHappyFaceStatusAdvanced(jobId, userId || '', uploadedImage, prompt);
          
          if (result.status === 'completed' && result.url) {
            const endTime = new Date()
            const totalTimeSeconds = (endTime.getTime() - startTime.getTime()) / 1000
            console.log(`Generation completed at: ${endTime.toISOString()}`)
            console.log(`Total generation time: ${totalTimeSeconds.toFixed(1)} seconds`)
            
            setCurrentImage(result.url)
            setHistoricalImages((prev) => [...prev, 
              { 
                generation: result.url!,
                upload_image: uploadedImage || '', 
                comfyui_prompt_id: jobId, 
                comfyui_server: '', 
                prompt: prompt 
              }
            ])
            setIsGenerating(false)
            setProgress(0)
            setGenerationStatus('completed')
            toast({
              title: "Success!",
              description: "Your happy face has been generated.",
            })
            posthog.capture('generation_success', {'url': result.url})
          } else if (result.status === 'job_error') {
            posthog.capture('generation_job_error', {'error': result, 'source': 'job_error'})
            setError('Failed to generate image, please try again.')
            setIsGenerating(false)
            // don't stop checking status
            // setTimeout(checkStatus, 2000) // Check again in 2 seconds
          } else if (result.status === 'error') {
            posthog.capture('generation_error', {'error': result, 'source': 'returned error'})
            //setGenerationStatus('error')
            //throw new Error('Failed to generate image')
            // don't stop checking status
            setTimeout(checkStatus, 2000) // Check again in 2 seconds
          } else if ((result.status as string) === 'pending') {
            // Update status to pending but don't update progress
            setGenerationStatus('pending')
            setTimeout(checkStatus, 2000) // Check again in 2 seconds
            // reset start time when pending
            startTime = new Date()
          } else if (result.status === 'processing') {
            // For 'processing' status
            setGenerationStatus('processing')
            const elapsedSeconds = (new Date().getTime() - startTime.getTime()) / 1000
            const progressPercent = Math.min(Math.floor((elapsedSeconds / expectedTotalTime) * 100), 99)
            setProgress(progressPercent)
            setTimeout(checkStatus, 1000)
          } else {
            // For any other status
            setGenerationStatus('processing')
            const elapsedSeconds = (new Date().getTime() - startTime.getTime()) / 1000
            const progressPercent = Math.min(Math.floor((elapsedSeconds / expectedTotalTime) * 100), 99)
            setProgress(progressPercent)
            setTimeout(checkStatus, 1000)
          }
        } catch (error) {
          console.error('Error checking generation status:', error)
          /*setIsGenerating(false)
          setError('Failed to check generation status. Please try again.')
          toast({
            title: "Error",
            description: "Failed to check generation status. Please try again.",
            variant: "destructive",
          })
          setProgress(0)
            */
          posthog.capture('generation_error', {'error': error, 'source': 'exception'})
          // for exception, log and report error, but don't stop re checking status
          setTimeout(checkStatus, 1000)
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
          setError("Error generating  , please try again.")
          toast({
            title: "Error",
            description: "Error submitting the job, please try again.",
            variant: "destructive",
          })
          posthog.capture('generation_error', {'error': error, 'source': 'submitHappyFaceJob'})
        }
      }
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate image before uploading
      const validation = validateImage(file);
      if (!validation.valid) {
        setValidationError(validation.error || "Please upload a valid image file.");
        setShowErrorDialog(true);
        return;
      }
      
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
          return
        }

        // Get the public URL for the uploaded file
        const { data: { publicUrl } } = supabase.storage
          .from('images')
          .getPublicUrl(filePath)

        setUploadedImage(publicUrl)

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
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        {/* Sidebar */}
        <ClothesRemoverSidebar className="border-r" currentFeature="cum-face-generator"/>
        
        {/* Main content area */}
        <div className="flex-1 flex flex-col">
          {isGenerating && (
            <Progress 
              value={progress} 
              className="fixed top-0 left-0 right-0 z-50 h-1 rounded-none"
            />
          )}
          
          {/* Header */}
          <nav className="bg-white shadow-sm">
            <div className="container mx-auto px-4 py-3 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <SidebarTrigger />
                <Link href="/" className="text-xl font-bold text-purple-600">
                  Cum Face AI
                </Link>
              </div>
              <div className="flex items-center space-x-4">
                <CreditsBadge isGenerating={isGenerating}/>
                <ProfileMenu />
              </div>
            </div>
          </nav>
          
          {/* Main content */}
          <div className="flex-1 p-8 overflow-auto">
            <div className="container mx-auto max-w-[1600px]">
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

                        <Accordion type="single" collapsible className="w-full" defaultValue="settings">
                          <AccordionItem value="settings">
                            <AccordionTrigger>Advanced Settings</AccordionTrigger>
                            <AccordionContent>
                              <div className="space-y-6">
                                <div className="space-y-2">
                                  <Label htmlFor="cum-strength">Cum on face strength: {cumStrength.toFixed(1)}</Label>
                                  <Slider
                                    id="cum-strength"
                                    min={0}
                                    max={1.5}
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
                                    max={1.5}
                                    step={0.1}
                                    value={[orgasmStrength]}
                                    onValueChange={(value) => setOrgasmStrength(value[0])}
                                  />
                                </div>
                                {!featureFlagControl && (
                                  <div className="flex items-center space-x-2">
                                    <input
                                      type="checkbox"
                                      id="only-modify-face"
                                      checked={onlyModifyFace}
                                      onChange={(e) => setOnlyModifyFace(e.target.checked)}
                                      className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                      disabled={!uploadedImage}
                                    />
                                    <Label htmlFor="only-modify-face">Only modify face</Label>
                                  </div>
                                )}
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>

                        <Button 
                          type="submit" 
                          className="w-full flex items-center justify-center gap-2" 
                          disabled={isGenerating || (!uploadedImage && !prompt) || !isLoaded}
                        >
                          {isGenerating ? (
                            <>
                              <IconLoader2 className="h-4 w-4 animate-spin mr-2" />
                              {generationStatus === 'pending' ? 
                                "In Queue..." : 
                                "Generating..."}
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

              <h2 className="text-2xl font-bold mb-4">
                Historical Images
                {!isLoading && historicalImages.some(gen => !gen.generation && gen.comfyui_prompt_id) && (
                  <span className="ml-2 text-sm font-normal text-muted-foreground">
                    ({historicalImages.filter(gen => !gen.generation && gen.comfyui_prompt_id).length} processing)
                  </span>
                )}
              </h2>
              {isLoading ? (
                <div className="flex justify-center items-center p-8">
                  <div className="flex flex-col items-center">
                    <IconLoader2 className="h-10 w-10 animate-spin text-primary mb-2" />
                    <p className="text-sm font-medium text-muted-foreground">Loading your previous generations...</p>
                  </div>
                </div>
              ) : historicalImages.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {historicalImages.map((generation, index) => (
                    <Card key={index}>
                      <CardContent className="p-2 flex justify-center">
                        <div className="relative w-full aspect-square">
                          {generation.generation === 'job_error' ? (
                            <div className="w-full h-full flex flex-col items-center justify-center bg-red-50 rounded-lg">
                              <LucideAlertCircle className="h-8 w-8 text-red-500 mb-2" />
                              <p className="text-sm font-medium text-red-600">Generation Failed</p>
                              <p className="text-xs text-red-500 mt-1">Please try again</p>
                            </div>
                          ) : generation.generation ? (
                            <Image
                              src={generation.generation || "/placeholder.svg"}
                              alt={`Historical Image ${index + 1}`}
                              fill
                              className="rounded-lg object-cover"
                            />
                          ) : generation.comfyui_prompt_id ? (
                            <div className="w-full h-full flex flex-col items-center justify-center bg-muted rounded-lg animate-pulse">
                              <IconLoader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                              <p className="text-sm font-medium text-muted-foreground">
                                {isGenerating && generationStatus === 'pending' ? 
                                  "In Queue..." : 
                                  "Processing..."}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">This may take a moment</p>
                            </div>
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-muted rounded-lg">
                              <p className="text-sm font-medium text-muted-foreground">No image available</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center p-8 border rounded-lg bg-muted">
                  <p>No historical images found. Generate your first image!</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Footer */}
          <EditorFooter />
          
          {/* Add the error dialog */}
          <Dialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <LucideAlertCircle className="h-5 w-5 text-red-500" />
                  Unsupported Image
                </DialogTitle>
                <DialogDescription>
                  {validationError}
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button onClick={() => setShowErrorDialog(false)}>OK</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </SidebarProvider>
  )
}

