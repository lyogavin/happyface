"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"

export default function EditorPage() {
  const [prompt, setPrompt] = useState("")
  const [currentImage, setCurrentImage] = useState<string | null>(null)
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [historicalImages, setHistoricalImages] = useState<string[]>([])

  const handlePromptSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement API call to generate image
    const newImage = `/placeholder.svg?height=512&width=512&text=Generated from: ${prompt}`
    setCurrentImage(newImage)
    setHistoricalImages((prev) => [newImage, ...prev])
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        if (event.target?.result) {
          setUploadedImage(event.target.result as string)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Happy Face AI Editor</h1>

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
                <Button type="submit" className="w-full">
                  {uploadedImage ? "Transform to Happy Face" : "Generate Happy Face"}
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

