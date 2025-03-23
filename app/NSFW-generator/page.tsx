"use client"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { ImageUploader } from "@/components/nsfw-images-uploader"
import { GeneratedImage } from "@/components/nsfw-generated-image"
import { GenerationHistory } from "@/components/nsfw-generation-history"
import { LandingSection } from "@/components/nsfw-landing-section"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { ClothesRemoverSidebar } from "@/components/clothes-remover-sidebar"
import Link from "next/link"
import { ProfileMenu } from "@/app/components/ProfileMenu"
import { CreditsBadge } from "@/app/components/CreditsBadge"
import { useState, useEffect } from "react"
import { useUser } from "@clerk/nextjs"
import { toast } from "@/hooks/use-toast"
import posthog from 'posthog-js'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { getUserGenerations } from "@/lib/user-utils"
import pRetry, { AbortError } from 'p-retry'
import { submitNsfwGenerationJob, checkNsfwGenerationStatus } from "@/lib/nsfw-generator"
import { IconCoin, IconLoader2, IconChevronDown } from '@tabler/icons-react'
import { Checkbox } from "@/components/ui/checkbox"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Import for type
import { UserGeneration } from "@/lib/user-utils"
import { EditorFooter } from "../components/EditorFooter"

export default function Home() {
  const { user, isLoaded } = useUser()
  const [uploadedImages, setUploadedImages] = useState<string[]>([])
  const [prompt, setPrompt] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [currentImage, setCurrentImage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [generationStatus, setGenerationStatus] = useState<'idle' | 'pending' | 'processing' | 'completed' | 'error'>('idle')
  const [historicalImages, setHistoricalImages] = useState<UserGeneration[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showCreditDialog, setShowCreditDialog] = useState(false)
  const [optimizeForSm, setOptimizeForSm] = useState(false)
  const [outputSize, setOutputSize] = useState("1152x896")
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false)
  
  const handleImageUpload = (images: string[]) => {
    setUploadedImages(images)
  }

  // Load historical generations
  useEffect(() => {
    const loadHistoricalGenerations = async () => {
      if (user?.id) {
        try {
          setIsLoading(true)
          const isLocal = window.location.hostname === 'localhost';
          const generations = await getUserGenerations(user.id, "nsfw-generator", isLocal ? 5 : 20);
          
          // Include both completed generations (with valid URLs) AND in-progress generations (with comfyui_prompt_id)
          // Only filter out invalid ones without a prompt ID and without a valid URL
          const displayableGenerations = generations.filter(gen => 
            (gen.generation && gen.generation.startsWith('http')) || // Valid completed generations
            (gen.comfyui_prompt_id && !gen.generation) || // In-progress generations
            gen.generation === 'job_error' // Failed generations
          );
          
          setHistoricalImages(displayableGenerations);
          setIsLoading(false)
          
          // Check for incomplete generations
          const incompleteGenerations = generations.filter(
            gen => !gen.generation && gen.comfyui_prompt_id
          );
          
          if (incompleteGenerations.length > 0) {
            console.log(`Found ${incompleteGenerations.length} incomplete generations to check`);
            checkIncompleteGenerations(user.id, incompleteGenerations);
          }
        } catch (error) {
          console.error("Failed to load historical generations:", error);
          toast({
            title: "Error",
            description: "Failed to load your previous generations",
            variant: "destructive",
          });
          setIsLoading(false)
        }
      }
    };

    if (isLoaded && user) {
      loadHistoricalGenerations();
    }
  }, [isLoaded, user]);
  
  // Function to check incomplete generations
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
          // Call checkNsfwGenerationStatus to get the result
          const status = await checkNsfwGenerationStatus(
            gen.comfyui_prompt_id,
            userId,
            gen.reference_images || [],
            gen.prompt || ''
          );
          
          // If the generation is completed or failed with job_error, update it
          if (status.status === 'completed' && status.url) {
            console.log(`Generation ${gen.comfyui_prompt_id} completed!`);
            updatedGenerationIds.push(gen.comfyui_prompt_id);
            
            // Update our local state to reflect the change
            setHistoricalImages(prev => 
              prev.map(prevGen => 
                prevGen.comfyui_prompt_id === gen.comfyui_prompt_id
                  ? { ...prevGen, generation: status.url as string }
                  : prevGen
              )
            );
          } else if (status.status === 'job_error') {
            console.log(`Generation ${gen.comfyui_prompt_id} failed with job error`);
            posthog.capture('generation_job_error', {'error': status, 'source': 'job_error'})
            updatedGenerationIds.push(gen.comfyui_prompt_id);
            
            // Update our local state to mark as job_error
            setHistoricalImages(prev => 
              prev.map(prevGen => 
                prevGen.comfyui_prompt_id === gen.comfyui_prompt_id
                  ? { ...prevGen, generation: 'job_error', reference_images: prevGen.reference_images || [] }
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

  const handleGenerate = async () => {
    if (!uploadedImages.length && prompt.trim() === "") {
      toast({
        title: "Missing input",
        description: "Please upload at least one image or enter a prompt",
        variant: "destructive",
      })
      return
    }
    
    setIsGenerating(true)
    setGenerationStatus('idle')
    setError(null)
    setProgress(0)
    let startTime = new Date()
    console.log(`Generation started at: ${startTime.toISOString()}`)

    try {
      const userId = user?.id
      
      if (!userId) {
        throw new Error("User not authenticated")
      }

      posthog.capture('nsfw_generation_started', {
        'user_id': userId,
        'prompt': prompt,
        'reference_images': uploadedImages
      })

      // Use p-retry for submitNsfwGenerationJob
      const jobId = await pRetry(
        async () => {
          // Parse width and height from the outputSize selection
          const [width, height] = outputSize.split('x').map(Number);
          
          const result = await submitNsfwGenerationJob(
            userId, 
            uploadedImages,
            prompt,
            optimizeForSm,
            width,
            height
          )
          
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
          'source': 'submitNsfwGenerationJob_retry'
        })
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
          // Parse width and height from the outputSize selection
          const [width, height] = outputSize.split('x').map(Number);
          
          const result = await checkNsfwGenerationStatus(
            jobId, 
            userId, 
            uploadedImages || [], 
            prompt,
            optimizeForSm,
            width,
            height
          )
          
          if (result.status === 'completed' && result.url) {
            const endTime = new Date()
            const totalTimeSeconds = (endTime.getTime() - startTime.getTime()) / 1000
            console.log(`Generation completed at: ${endTime.toISOString()}`)
            console.log(`Total generation time: ${totalTimeSeconds.toFixed(1)} seconds`)
            
            setCurrentImage(result.url)
            setHistoricalImages((prev) => [
              ...prev, 
              { 
                generation: result.url!,
                upload_image: '', 
                comfyui_prompt_id: jobId, 
                comfyui_server: '', 
                prompt: prompt,
                reference_images: uploadedImages || []
              }
            ])
            setIsGenerating(false)
            setProgress(0)
            setGenerationStatus('completed')
            toast({
              title: "Success!",
              description: "Your NSFW image has been generated.",
            })
            posthog.capture('generation_success', {'url': result.url})
          } else if (result.status === 'job_error') {
            posthog.capture('generation_job_error', {'error': result, 'source': 'job_error'})
            // Update historical images to mark as job_error
            setHistoricalImages(prev => 
              prev.map(prevGen => 
                prevGen.comfyui_prompt_id === jobId
                  ? { ...prevGen, generation: 'job_error', reference_images: prevGen.reference_images || [] }
                  : prevGen
              )
            )
            setError('Failed to generate image, please try again.')
            setIsGenerating(false)
          } else if (result.status === 'error') {
            posthog.capture('generation_error', {'error': result, 'source': 'returned error'})
            setTimeout(checkStatus, 2000) // Check again in 2 seconds
          } else if (result.status === 'pending') {
            // Update status to pending but don't update progress
            setGenerationStatus('pending')
            setTimeout(checkStatus, 2000) // Check again in 2 seconds
            // reset start time when pending
            startTime = new Date()
          } else {
            // For 'processing' or any other status
            setGenerationStatus('processing')
            const elapsedSeconds = (new Date().getTime() - startTime.getTime()) / 1000
            const progressPercent = Math.min(Math.floor((elapsedSeconds / 45) * 100), 99)
            setProgress(progressPercent)
            setTimeout(checkStatus, 1000)
          }
        } catch (error) {
          console.error('Error checking generation status:', error)
          posthog.capture('generation_error', {'error': error, 'source': 'checkNsfwGenerationStatus'})
          // For exception, log and report error, but don't stop re-checking status
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
          setError("Error submitting the job, please try again.")
          toast({
            title: "Error",
            description: "Error submitting the job, please try again.",
            variant: "destructive",
          })
          posthog.capture('generation_error', {'error': error, 'source': 'submitNsfwGenerationJob'})
        }
      }
    }
  }

  // Disable button when both prompt and images are empty
  const isGenerateDisabled = prompt.trim() === "" && uploadedImages.length === 0
  
  const CreditPurchaseDialog = () => (
    <Dialog open={showCreditDialog} onOpenChange={setShowCreditDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Need More Credits</DialogTitle>
          <DialogDescription>
            You don&apos;t have enough credits to generate images. Purchase more credits to continue.
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
        <ClothesRemoverSidebar className="border-r" currentFeature="NSFW-Generator"/>
        
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
                <Link href="/" className="text-base md:text-xl font-bold text-purple-600">
                  NSFW Generator
                </Link>
              </div>

              <div className="flex items-center space-x-4">
                <CreditsBadge isGenerating={isGenerating} />
                <ProfileMenu />
              </div>
            </div>
          </nav>
          
          {/* Main content */}
          <main className="container mx-auto py-8 px-4">
            <p className="text-4xl font-bold mb-8 text-center">NSFW Image Generator</p>

            {error && (
              <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg">
                {error}
              </div>
            )}

            <CreditPurchaseDialog />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
              {/* Left Column - Input Controls */}
              <div className="space-y-6">
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-xl font-semibold mb-4">Enter Your Prompt</p>
                    <Textarea 
                      placeholder="Describe what you want to generate..." 
                      className="min-h-[120px] mb-4"
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                    />

                    <ImageUploader onImagesUploaded={handleImageUpload} />

                    <div className="mt-5 mb-5">
                      <Accordion 
                        type="single" 
                        collapsible
                        value={showAdvancedSettings ? "advanced" : ""}
                        onValueChange={(value) => setShowAdvancedSettings(value === "advanced")}
                        className="border-b border-muted"
                      >
                        <AccordionItem value="advanced" className="border-none">
                          <AccordionTrigger className="py-3 px-0 hover:no-underline">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">Advanced Settings</span>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="px-0 pb-4 pt-2">
                            <div className="space-y-5">
                              <div className="space-y-2">
                                <div className="flex items-start space-x-2">
                                  <Checkbox 
                                    id="optimize-sm" 
                                    checked={optimizeForSm}
                                    onCheckedChange={(checked: boolean | "indeterminate") => 
                                      setOptimizeForSm(checked === true)
                                    }
                                    className="mt-0.5 h-4 w-4"
                                  />
                                  <div className="grid gap-1">
                                    <label 
                                      htmlFor="optimize-sm" 
                                      className="text-sm font-medium leading-none cursor-pointer"
                                    >
                                      Optimize for Small Size Woman
                                    </label>
                                    <p className="text-xs text-muted-foreground">
                                      Enhance image for small size, slender, small breasts, and petite figure
                                    </p>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="space-y-2">
                                <div className="grid gap-0.5">
                                  <label 
                                    htmlFor="output-size" 
                                    className="text-sm font-medium"
                                  >
                                    Output Size
                                  </label>
                                  <p className="text-xs text-muted-foreground mb-1">
                                    Choose the dimensions of your generated image
                                  </p>
                                </div>
                                <Select 
                                  value={outputSize} 
                                  onValueChange={setOutputSize}
                                >
                                  <SelectTrigger className="w-[280px] ml-1">
                                    <SelectValue placeholder="Select output size" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="1152x896">Default (1152x896)</SelectItem>
                                    <SelectItem value="1024x1024">1024x1024 - Square</SelectItem>
                                    <SelectItem value="768x1024">768x1024 - Portrait</SelectItem>
                                    <SelectItem value="576x1024">576x1024 - Tall Portrait</SelectItem>
                                    <SelectItem value="1024x768">1024x768 - Landscape</SelectItem>
                                    <SelectItem value="1024x576">1024x576 - Wide Landscape</SelectItem>
                                    <SelectItem value="512x512">512x512 - Small Square</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </div>

                    <Button 
                      className="w-full h-12 mt-2 flex items-center justify-center gap-2 text-base" 
                      onClick={handleGenerate}
                      disabled={isGenerateDisabled || isGenerating || !isLoaded}
                    >
                      {isGenerating ? (
                        <>
                          <IconLoader2 className="h-4 w-4 animate-spin mr-2" />
                          {generationStatus === 'pending' ? 
                            "In Queue..." : 
                            "Generating Image..."}
                        </>
                      ) : (
                        <>
                          Generate NSFW Image
                          <div className="flex items-center gap-0.5 ml-2">
                            <span className="text-yellow-500">1 x </span>
                            <IconCoin className="h-4 w-4 text-yellow-500" />
                          </div>
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Generated Image */}
              <GeneratedImage 
                currentImage={currentImage} 
                isGenerating={isGenerating} 
                generationStatus={generationStatus} 
              />
            </div>

            {/* Generation History */}
            <GenerationHistory 
              historicalImages={historicalImages}
              isLoading={isLoading}
            />

            {/* Landing/Introduction Section */}
            <LandingSection />
            {/* Footer */}
            <EditorFooter />
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}

