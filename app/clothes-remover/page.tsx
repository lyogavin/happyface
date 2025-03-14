"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { createClient } from "@supabase/supabase-js"
import { submitRemoveClothesJob, checkRemoveClothesStatus } from "@/lib/remove-clothes"
import { IconCoin, IconRefresh, IconLoader2, IconDownload, IconUpload, IconEdit, IconAlertCircle } from "@tabler/icons-react"
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
import { getUserGenerations } from "@/lib/user-utils"
import { UserGeneration } from "@/lib/user-utils"
import posthog from 'posthog-js'
import Link from "next/link"
import { ProfileMenu } from "@/app/components/ProfileMenu"
import { CreditsBadge } from "@/app/components/CreditsBadge"
import { Progress } from "@/components/ui/progress"
import { MaskEditorDialog } from "@/components/mask-editor-dialog"
import { ClothesRemoverSidebar } from "@/components/clothes-remover-sidebar"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { EditorFooter } from "@/app/components/EditorFooter"
import { ClothesRemoverLanding } from "@/app/components/clothes-remover-landing"
import { validateImage } from "@/lib/image-checker"
import pRetry, { AbortError } from 'p-retry'

export default function ClothesRemoverPage() {
  const { user, isLoaded } = useUser()
  const [prompt, setPrompt] = useState("")
  const [currentImage, setCurrentImage] = useState<string | null>(null)
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [maskImage, setMaskImage] = useState<string | null>(null)
  const [historicalImages, setHistoricalImages] = useState<UserGeneration[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [showCreditDialog, setShowCreditDialog] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [nudityStrength, setNudityStrength] = useState(1.0)
  const [progress, setProgress] = useState(0)
  const [showMaskEditor, setShowMaskEditor] = useState(false)
  const [canvasData, setCanvasData] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [generationStatus, setGenerationStatus] = useState<'idle' | 'pending' | 'processing' | 'completed' | 'error'>('idle')
  const [validationError, setValidationError] = useState<string | null>(null)
  const [showErrorDialog, setShowErrorDialog] = useState(false)

  // Add useEffect to load historical generations
  useEffect(() => {
    const loadHistoricalGenerations = async () => {
      if (user?.id) {
        try {
          setIsLoading(true)
          // if local limit 5, otherwise 20
          // check if it's from localhost
          const isLocal = window.location.hostname === 'localhost';
          const generations = await getUserGenerations(user.id, "clothes-remover", isLocal ? 5 : 20);
          setHistoricalImages(generations);
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
          // Call checkRemoveClothesStatus to get the result
          const status = await checkRemoveClothesStatus(
            gen.comfyui_prompt_id,
            userId,
            gen.upload_image,
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
    
    if (!uploadedImage) {
      toast({
        title: "Missing image",
        description: "Please upload an image to remove clothes from",
        variant: "destructive",
      })
      return
    }
    
    if (!maskImage) {
      toast({
        title: "Missing mask",
        description: "Please create a mask to indicate which areas to remove clothes from",
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

      posthog.capture('clothes_removal_started', {
        'user_id': userId,
        'prompt': prompt,
        'nudity_strength': nudityStrength,
        'uploaded_image': uploadedImage
      })

      // Upload mask image to Supabase
      let maskImageUrl = maskImage;
      if (maskImage && maskImage.startsWith('data:')) {
        try {
          const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
          )
          
          // Convert data URL to Blob
          const response = await fetch(maskImage);
          const blob = await response.blob();
          
          const fileName = `mask_${Math.random().toString(36).substring(2, 15)}.png`;
          const filePath = `uploadedMasks/${fileName}`;
          
          const { error } = await supabase.storage
            .from('images')
            .upload(filePath, blob);
            
          if (error) {
            console.error('Error uploading mask image:', error.message);
            throw new Error('Failed to upload mask image');
          }
          
          // Get the public URL for the uploaded mask
          const { data: { publicUrl } } = supabase.storage
            .from('images')
            .getPublicUrl(filePath);
          
          maskImageUrl = publicUrl;
        } catch (error) {
          console.error('Error uploading mask to Supabase:', error);
          throw new Error('Failed to upload mask image');
        }
      }

      // Use p-retry for submitRemoveClothesJob
      const jobId = await pRetry(
        async () => {
          const result = await submitRemoveClothesJob(
            userId || '', 
            uploadedImage,
            maskImageUrl,
            prompt
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
          'source': 'submitRemoveClothesJob_retry'
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
          const result = await checkRemoveClothesStatus(jobId, userId || '', uploadedImage, prompt)
          
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
                upload_image: uploadedImage || '', 
                comfyui_prompt_id: jobId, 
                comfyui_server: '', 
                prompt: prompt,
                mask_image: maskImage || ''
              }
            ])
            setIsGenerating(false)
            setProgress(0)
            setGenerationStatus('completed')
            toast({
              title: "Success!",
              description: "Your clothes-free image has been generated.",
            })
            posthog.capture('generation_success', {'url': result.url})
          } else if (result.status === 'job_error') {
            posthog.capture('generation_job_error', {'error': result, 'source': 'job_error'})
            // Update historical images to mark as job_error
            setHistoricalImages(prev => 
              prev.map(prevGen => 
                prevGen.comfyui_prompt_id === jobId
                  ? { ...prevGen, generation: 'job_error' }
                  : prevGen
              )
            )
            setError('Failed to generate image, please try again.')
            setIsGenerating(false)
          } else if (result.status === 'error') {
            posthog.capture('generation_error', {'error': result, 'source': 'returned error'})
            //setGenerationStatus('error')
            //throw new Error('Failed to generate image')
            // don't stop checking status
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
          /*setIsGenerating(false)
          setError('Failed to check generation status. Please try again.')
          toast({
            title: "Error",
            description: "Failed to check generation status. Please try again.",
            variant: "destructive",
          })
          setProgress(0)
          */
          posthog.capture('generation_error', {'error': error, 'source': 'checkRemoveClothesStatus'})
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
          setError("Error submitting the job, please try again.")
          toast({
            title: "Error",
            description: "Error submitting the job, please try again.",
            variant: "destructive",
          })
          posthog.capture('generation_error', {'error': error, 'source': 'submitRemoveClothesJob'})
        }
      }
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement> | React.DragEvent<HTMLDivElement>) => {
    let file: File | undefined;
    
    if ('dataTransfer' in e) {
      // Handle drag and drop
      e.preventDefault();
      file = e.dataTransfer?.files?.[0];
    } else {
      // Handle file input change
      file = e.target.files?.[0];
    }
    
    if (file) {
      // Validate image using the existing validateImage function
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
        const filePath = `clothes_remover_upload/${fileName}`

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
        setMaskImage(null) // Reset mask when new image is uploaded
        setCanvasData(null)

      } catch (error) {
        console.error('Error uploading to Supabase:', error)
      }
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  }

  const openMaskEditor = () => {
    if (!uploadedImage) {
      toast({
        title: "No image uploaded",
        description: "Please upload an image first before creating a mask",
        variant: "destructive",
      })
      return
    }
    
    setShowMaskEditor(true)
  }
  
  const handleSaveMask = (maskDataUrl: string) => {
    setMaskImage(maskDataUrl)
    toast({
      title: "Mask created",
      description: "Your mask has been created successfully",
    })
  }

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
        <ClothesRemoverSidebar className="border-r" currentFeature="clothes-remover"/>
        
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
                  Clothes Remover AI
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
            <CreditPurchaseDialog />
            
            <p className="text-3xl font-bold mb-8 text-center">AI Clothes Remover</p>

            {/* Container with much wider max width */}
            <div className="max-w-[1600px] mx-auto">
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
                        <div 
                          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                            uploadedImage ? 'border-green-300 bg-green-50' : 'border-gray-300 hover:border-gray-400'
                          }`}
                          onDrop={handleImageUpload}
                          onDragOver={handleDragOver}
                          onClick={() => document.getElementById('image-upload')?.click()}
                        >
                          <input
                            id="image-upload"
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                          
                          {uploadedImage ? (
                            <div className="relative w-full aspect-square max-h-[300px] flex justify-center">
                              <Image
                                src={uploadedImage}
                                alt="Uploaded preview"
                                width={300}
                                height={300}
                                className={`rounded-lg object-contain max-h-[300px] ${maskImage ? 'opacity-80' : ''}`}
                              />
                              {maskImage && (
                                <div className="absolute inset-0 flex justify-center">
                                  <Image
                                    src={maskImage}
                                    alt="Mask preview"
                                    width={300}
                                    height={300}
                                    className="rounded-lg object-contain max-h-[300px] opacity-50"
                                  />
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="py-12">
                              <IconUpload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                              <p className="text-lg font-medium">Drag and drop an image here</p>
                              <p className="text-sm text-gray-500 mt-2">or click to browse files</p>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <Button 
                            type="button" 
                            variant="outline"
                            onClick={openMaskEditor}
                            className="flex items-center gap-2"
                            disabled={!uploadedImage}
                          >
                            <IconEdit className="h-4 w-4" />
                            {maskImage ? "Edit Mask" : "Create Mask"}
                          </Button>
                          
                          {maskImage && (
                            <div className="text-sm text-green-600 flex items-center gap-1">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              Mask created
                            </div>
                          )}
                        </div>
                        
                        <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-700 mb-4">
                          <p className="font-medium mb-2">How to create a mask:</p>
                          <ol className="list-decimal pl-5 space-y-1">
                            <li>Click &quot;Create Mask&quot; after uploading your image</li>
                            <li>Use the brush tool to paint over the areas where you want to remove clothes</li>
                            <li>Be precise - don&apos;t miss any small areas</li>
                            <li>Click &quot;Save Mask&quot; when you&apos;re done</li>
                          </ol>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="prompt">Prompt (optional)</Label>
                          <Textarea
                            id="prompt"
                            placeholder="Describe additional details for the clothes removal (e.g., 'wearing a sexy lingerie', 'nude', etc.)"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            className="w-full"
                            rows={3}
                          />
                        </div>

                        <Accordion type="single" collapsible className="w-full">
                          <AccordionItem value="settings">
                            <AccordionTrigger>Advanced Settings</AccordionTrigger>
                            <AccordionContent>
                              <div className="space-y-6">
                                <div className="space-y-2">
                                  <Label htmlFor="nudity-strength">Nudity strength: {nudityStrength.toFixed(1)}</Label>
                                  <Slider
                                    id="nudity-strength"
                                    min={0.5}
                                    max={1.5}
                                    step={0.1}
                                    value={[nudityStrength]}
                                    onValueChange={(value) => setNudityStrength(value[0])}
                                  />
                                </div>
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>

                        <Button 
                          type="submit" 
                          className="w-full flex items-center justify-center gap-2" 
                          disabled={isGenerating || !uploadedImage || !maskImage || !isLoaded}
                        >
                          {isGenerating ? (
                            <>
                              <IconLoader2 className="h-4 w-4 animate-spin mr-2" />
                              {generationStatus === 'pending' ? 
                                "In Queue..." : 
                                "Removing Clothes..."}
                            </>
                          ) : (
                            "Remove Clothes"
                          )}
                          <div className="flex items-center gap-0.5">
                            <span className="text-yellow-500">1 x </span>
                            <IconCoin className="h-4 w-4 text-yellow-500" />
                          </div>
                        </Button>
                      </form>
                    </div>
                    <div className="space-y-4 flex flex-col h-full">
                      <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg shadow-sm">
                        <p className="text-lg font-medium text-center mb-2">How It Works</p>
                        <div className="flex items-center justify-center gap-4">
                          <div className="text-center">
                            <div className="bg-white p-2 rounded-lg shadow-sm mb-2">
                              <Image
                                src="/example-before.webp" 
                                alt="Upload"
                                width={100}
                                height={100}
                                className="mx-auto"
                              />
                            </div>
                            <p className="text-xs">1. Upload Image</p>
                          </div>
                          <div className="text-gray-400">→</div>
                          <div className="text-center">
                            <div className="bg-white p-2 rounded-lg shadow-sm mb-2">
                              <Image
                                src="/example-mask.webp" 
                                alt="Mask"
                                width={100}
                                height={100}
                                className="mx-auto"
                              />
                            </div>
                            <p className="text-xs">2. Create Mask</p>
                          </div>
                          <div className="text-gray-400">→</div>
                          <div className="text-center">
                            <div className="bg-white p-2 rounded-lg shadow-sm mb-2">
                              <Image
                                src="/example-after.png" 
                                alt="Generate"
                                width={100}
                                height={100}
                                className="mx-auto"
                              />
                            </div>
                            <p className="text-xs">3. Generate</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-center bg-gray-100 rounded-lg p-4 flex-grow">
                        {currentImage ? (
                          <div className="relative w-full h-full flex items-center justify-center">
                            {isGenerating ? (
                              <div className="w-full aspect-square rounded-lg bg-gray-200 animate-pulse flex items-center justify-center">
                                <IconLoader2 className="h-8 w-8 animate-spin text-gray-400" />
                              </div>
                            ) : (
                              <Image
                                src={currentImage}
                                alt="Generated Image"
                                width={512}
                                height={512}
                                className="rounded-lg shadow-lg object-contain max-h-full"
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
                          <div className="text-center w-full h-full flex flex-col items-center justify-center">
                            {isGenerating ? (
                              <div className="w-full aspect-square rounded-lg bg-gray-200 animate-pulse flex items-center justify-center">
                                <IconLoader2 className="h-8 w-8 animate-spin text-gray-400" />
                              </div>
                            ) : (
                              <>
                                <p className="text-gray-500 text-lg mb-4">Generated images will appear here.</p>
                                <p className="text-gray-400 mb-4">Upload an image, create a mask, and click &quot;Remove Clothes&quot; to get started!</p>
                                <Image
                                  src="/placeholder.svg?height=200&width=200&text=Clothes Remover"
                                  alt="Placeholder"
                                  width={200}
                                  height={200}
                                  className="opacity-50"
                                />
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <p className="text-2xl font-bold mb-4">
                Historical Images
                {!isLoading && historicalImages.some(gen => !gen.generation && gen.comfyui_prompt_id) && (
                  <span className="ml-2 text-sm font-normal text-muted-foreground">
                    ({historicalImages.filter(gen => !gen.generation && gen.comfyui_prompt_id).length} processing)
                  </span>
                )}
              </p>
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
                              <IconAlertCircle className="h-8 w-8 text-red-500 mb-2" />
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
                              <p className="text-sm font-medium text-muted-foreground">Processing...</p>
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
                <Card>
                  <CardContent className="p-8 text-center">
                    <p className="text-gray-500 text-lg mb-4">You haven&apos;t generated any clothes-free images yet.</p>
                    <p className="text-gray-400">Upload an image, create a mask, and click &quot;Remove Clothes&quot; to get started!</p>
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

              {/* Landing Page Component */}
              <ClothesRemoverLanding />
            </div>
          </div>
          
          {/* Footer */}
          <EditorFooter />
        </div>
        
        <MaskEditorDialog
          open={showMaskEditor}
          onOpenChange={setShowMaskEditor}
          imageUrl={uploadedImage}
          title="Create Mask for Clothes Removal"
          onSave={handleSaveMask}
          maskData={canvasData || undefined}
          setMaskData={setCanvasData}
        />
        
        {/* Add the error dialog */}
        <Dialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <IconAlertCircle className="h-5 w-5 text-red-500" />
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
    </SidebarProvider>
  )
}
