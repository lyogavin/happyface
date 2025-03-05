import React from "react";
import { Button } from "@/components/ui/button"
import Link from "next/link";

export function CtaSection() {
  return (
    <div className="my-12 bg-gradient-to-r from-purple-400 to-yellow-400 p-8 rounded-lg text-center max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">Cum Face Generator by Cum Face AI</h2>
      <p className="mb-6 text-gray-900 dark:text-gray-100">
        Create realistic cum face effects in seconds. Simply upload your image and our AI will generate a customized result.
        Easy to use, fully editable, and instantly shareable. Follow @happyface for more amazing AI-powered image tools.
      </p>
      <Link href="/editor"> 
        <Button className="bg-purple-600 text-white hover:bg-purple-800 mb-4">
          Generate your cum face
        </Button>
      </Link>
    </div>
  )
}

