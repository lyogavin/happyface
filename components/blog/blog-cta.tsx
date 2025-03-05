import React from "react";
import { Button } from "@/components/ui/button"
import Link from "next/link";

export function CtaSection({title, description, buttonText, buttonLink}: {title: string, description: string, buttonText: string, buttonLink: string}) {
  return (
    <div className="my-12 bg-gradient-to-r from-blue-100 to-purple-100 p-8 rounded-lg text-center max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">{title}</h2>
      <p className="mb-6">
          {description}
      </p>
      <Link href={buttonLink}>
        <Button className="bg-black text-white hover:bg-gray-800">
          {buttonText}
        </Button>
      </Link>
    </div>
  )
}

