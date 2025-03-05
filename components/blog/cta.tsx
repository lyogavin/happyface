import React from "react";
import { Button } from "@/components/ui/button"

export function CtaSection() {
  return (
    <div className="my-12 bg-gradient-to-r from-blue-100 to-purple-100 p-8 rounded-lg text-center max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Generate your cum face selfie today.</h2>
      <p className="mb-6">
        Upload a photo and generate realistic cum face selfies in seconds.
        Perfect for pranks, memes, and sharing with friends.
        Create viral content that will make everyone laugh.
      </p>
      <a href="/cum-face" target="_blank">
        <Button className="bg-black text-white hover:bg-gray-800">
          Start
        </Button>
      </a>
    </div>
  )
}

