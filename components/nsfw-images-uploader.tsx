"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Upload, X, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@supabase/supabase-js"
import { toast } from "@/hooks/use-toast"
import { validateImage } from "@/lib/image-checker"

interface ImageUploaderProps {
  onImagesUploaded?: (images: string[]) => void
}

export function ImageUploader({ onImagesUploaded }: ImageUploaderProps) {
  const [uploadedImages, setUploadedImages] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      try {
        setIsUploading(true)
        const filesArray = Array.from(e.target.files)
        
        // Validate each image
        for (const file of filesArray) {
          const validation = validateImage(file)
          if (!validation.valid) {
            setValidationError(validation.error || "Please upload a valid image file.")
            toast({
              title: "Invalid image",
              description: validation.error || "Please upload a valid image file.",
              variant: "destructive",
            })
            setIsUploading(false)
            return
          }
        }
        
        // Upload images to Supabase
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )
        
        const uploadPromises = filesArray.map(async (file) => {
          const fileExt = file.name.split('.').pop()
          const fileName = `${Math.random()}.${fileExt}`
          const filePath = `nsfw_images_upload/${fileName}`
          
          const { error } = await supabase.storage
            .from('images')
            .upload(filePath, file)
            
          if (error) {
            console.error('Error uploading image:', error.message)
            throw new Error(error.message)
          }
          
          // Get the public URL for the uploaded file
          const { data: { publicUrl } } = supabase.storage
            .from('images')
            .getPublicUrl(filePath)
            
          return publicUrl
        })
        
        const newImageUrls = await Promise.all(uploadPromises)
        const updatedImages = [...uploadedImages, ...newImageUrls]
        setUploadedImages(updatedImages)
        
        // Pass uploaded images to parent component via callback
        if (onImagesUploaded) {
          onImagesUploaded(updatedImages)
        }
        
        // Clear the input value to ensure onChange triggers even if same files are selected
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
        
        toast({
          title: "Upload successful",
          description: `${newImageUrls.length} image(s) uploaded successfully.`,
        })
        
      } catch (error) {
        console.error('Error uploading to Supabase:', error)
        toast({
          title: "Upload failed",
          description: "Failed to upload images. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsUploading(false)
      }
    }
  }

  const removeImage = (index: number) => {
    const updatedImages = uploadedImages.filter((_, i) => i !== index)
    setUploadedImages(updatedImages)
    
    // Pass updated images to parent component
    if (onImagesUploaded) {
      onImagesUploaded(updatedImages)
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-lg font-medium">Upload Reference Images</p>
      <p className="text-sm text-muted-foreground mb-2">
        Upload multiple images of the character you want to generate
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
        {uploadedImages.map((image, index) => (
          <div key={index} className="relative group">
            <img
              src={image || "/placeholder.svg"}
              alt={`Uploaded image ${index + 1}`}
              className="h-24 w-full object-cover rounded-md"
            />
            <button
              onClick={() => removeImage(index)}
              className="absolute top-1 right-1 bg-background/80 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      <div className="flex justify-center">
        <Button
          variant="outline"
          className="w-full relative"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
        >
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Upload Images
            </>
          )}
        </Button>
        <input
          ref={fileInputRef}
          id="file-upload"
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
          disabled={isUploading}
        />
      </div>
    </div>
  )
}

