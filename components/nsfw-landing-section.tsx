import type React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Sparkles, Zap, Image, Palette, Heart, Eye, User, Settings, Play } from "lucide-react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { useState, useRef } from "react"

export function LandingSection() {
  // Sample images for the gallery, shuffle the array
  const exampleImages = [
    "/nsfw-examples/1.jpeg",
    "/nsfw-examples/2.jpeg",
    "/nsfw-examples/3.jpeg",
    "/nsfw-examples/4.jpeg",
    "/nsfw-examples/5.jpeg",
    "/nsfw-examples/6.jpeg",
    "/nsfw-examples/7.jpeg",
    "/nsfw-examples/9.jpeg",
    "/nsfw-examples/10.png",
    "/nsfw-examples/11.png",
    "/nsfw-examples/12.png",
    "/nsfw-examples/13.png"
  ].sort(() => Math.random() - 0.5);

  // Add a ref for the video element
  const videoRef = useRef<HTMLVideoElement>(null);
  // State to track if video is playing
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  // Function to handle play button click
  const handlePlayClick = () => {
    if (videoRef.current) {
      videoRef.current.play()
        .then(() => setIsVideoPlaying(true))
        .catch(err => console.error("Error playing video:", err));
    }
  };

  return (
    <Card className="mb-8 border-0 shadow-none">
      <CardContent className="p-0">
        {/* Hero Section */}
        <div className="relative py-16 px-6 bg-gradient-to-b from-primary/5 to-background rounded-t-xl mb-16">
          <div className="absolute inset-0 bg-grid-white/10 mask-linear-gradient-to-b from-transparent to-background"></div>
          <div className="max-w-5xl mx-auto text-center relative z-10">
            <div className="inline-block mb-4 px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
              Next-generation AI Art
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-5 pb-2 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-purple-600 leading-normal">
              AI NSFW Image Generator
            </h1>
            <h2 className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Unleash your creativity with the most advanced AI nude generator. Whether you're into sexy AI art, realistic nudes, or anime-inspired NSFW art, our adult AI image generator brings your fantasies to life with stunning detail and precision.
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto mt-4 leading-relaxed">
              Our AI NSFW image generator is the ultimate AI nude maker for creating high-quality adult content. Unlike other NSFW art generators, our adult AI image generator delivers exceptional sexy AI art with remarkable realism. Whether you're seeking an AI nude generator for personal projects or professional use, our platform provides the most sophisticated AI nude maker technology available today, ensuring your NSFW art creation experience is seamless and the results are stunning.
            </p>
          </div>
        </div>

        {/* Features Section */}
        <div className="max-w-6xl mx-auto px-6 mb-20">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold mb-3">Premium Features</h2>
            <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
              Our AI image generator offers cutting-edge capabilities to help you create the perfect images.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCardWithImage
              imageSrc="/8k-sign.png"
              title="Up to 8K Resolution"
              description="Generate high-quality images up to 8K for crystal-clear NSFW art."
            />
            <FeatureCardWithImage
              imageSrc="/breasts.png"
              title="Specially optimized for breasts"
              description="Solved the common difficulty of generating breasts. Most natural and realistic breasts."
            />
            <FeatureCardWithImage
              imageSrc="/anime-beach.png"
              title="All sizes - Large to petite women"
              description="From large breasts to petite women, slender women. All body types are supported."
            />
            <FeatureCardWithImage
              imageSrc="/anime-large.png"
              title="Realistic & Anime Styles"
              description="Choose between hyper-realistic nudes or anime-inspired NSFW art."
            />
            <FeatureCardWithImage
              imageSrc="/img2img.png"
              title="Text & Image to Image"
              description="Generate based on the model from your own images."
            />
            <FeatureCardWithImage
              imageSrc="/rassian.png"
              title="Advanced Customization"
              description="Fine-tune every detail to create the perfect adult AI image."
            />
          </div>
        </div>

        {/* Image Examples Section */}
        <div className="bg-muted/30 py-20 px-6 mb-20">
          <div className="max-w-6xl mx-auto text-center">
            <h2 className="text-2xl font-bold mb-3">Explore Our AI NSFW Image Gallery</h2>
            <h3 className="text-sm text-muted-foreground max-w-2xl mx-auto mb-8">
              Check out some of the stunning examples created with our AI nude generator. From sexy AI art to hyper-realistic nudes, see what our adult AI image generator can do for you.
            </h3>
            
            {/* Image Gallery */}
            <div className="max-w-5xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {exampleImages.map((image, index) => (
                  <div key={index} className="overflow-hidden rounded-xl bg-background shadow-md hover:shadow-lg transition-all duration-300 aspect-[3/4] relative group">
                    <div className="w-full h-full flex items-center justify-center text-gray-500">
                      {/* Note: In a real implementation, you would use actual images */}
                      <img src={image} alt={`NSFW Example ${index + 1}`} className="w-full h-full object-cover" />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                      <div className="p-4 text-white text-left">
                        <p className="font-medium">Example {index + 1}</p>
                        <p className="text-xs text-white/70">AI-generated NSFW art</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Video Intro Section */}
        <div className="max-w-6xl mx-auto px-6 text-center mb-20">
          <h2 className="text-2xl font-bold mb-3">How Our AI NSFW Image Generator Works</h2>
          <h3 className="text-sm text-muted-foreground max-w-2xl mx-auto mb-8">
            Watch this quick video to learn how to create your own sexy AI art with our AI nude maker. It's easy, fast, and incredibly powerful.
          </h3>
          
          {/* Video Embed */}
          <div className="max-w-4xl mx-auto relative aspect-video overflow-hidden rounded-xl shadow-xl bg-gray-100 dark:bg-gray-800 border border-muted">
            <video 
              ref={videoRef}
              controls 
              className="w-full h-full object-cover"
              poster="https://bjqbwtqznzladztznntj.supabase.co/storage/v1/object/public/images/adhoc/nsfw-Cover.jpg"
              onPlay={() => setIsVideoPlaying(true)}
              onPause={() => setIsVideoPlaying(false)}
              onEnded={() => setIsVideoPlaying(false)}
            >
              <source src="https://bjqbwtqznzladztznntj.supabase.co/storage/v1/object/public/images/adhoc/nsfw.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            
            {/* Only show play button when video is not playing */}
            {!isVideoPlaying && (
              <button 
                className="group absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10"
                onClick={handlePlayClick}
              >
                <div className="absolute -inset-4 rounded-full bg-primary/20 blur-lg opacity-70 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative bg-primary rounded-full p-5 cursor-pointer transition-transform group-hover:scale-110 duration-300">
                  <Play className="h-12 w-12 text-white" />
                </div>
              </button>
            )}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-muted/30 py-20 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl font-bold mb-3">Frequently Asked Questions</h2>
            <p className="text-sm text-muted-foreground max-w-2xl mx-auto mb-10">
              Everything you need to know about our AI NSFW image generator
            </p>
            <div className="text-left bg-background rounded-xl p-6 shadow-sm">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1" className="border-b border-muted">
                  <AccordionTrigger className="py-4 text-base font-medium">What is an AI NSFW image generator?</AccordionTrigger>
                  <AccordionContent className="pb-4 text-sm text-muted-foreground">
                    An AI NSFW image generator is a tool that uses advanced artificial intelligence to create adult-themed images, including sexy AI art, realistic nudes, and anime-inspired NSFW art.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-5" className="border-b border-muted">
                  <AccordionTrigger className="py-4 text-base font-medium">Is it free?</AccordionTrigger>
                  <AccordionContent className="pb-4 text-sm text-muted-foreground">
                    Yes. We offer a free tier with a limit, but subscribers get unlimited generations and access to exclusive features.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2" className="border-b border-muted">
                  <AccordionTrigger className="py-4 text-base font-medium">Can I customize the results?</AccordionTrigger>
                  <AccordionContent className="pb-4 text-sm text-muted-foreground">
                    Yes! Our adult AI image generator allows you to choose poses, body types, resolutions, and more to create the perfect image.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3" className="border-b border-muted">
                  <AccordionTrigger className="py-4 text-base font-medium">Is it safe to use?</AccordionTrigger>
                  <AccordionContent className="pb-4 text-sm text-muted-foreground">
                    Absolutely. Our AI nude maker ensures privacy and security for all users.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-4" className="border-b border-muted">
                  <AccordionTrigger className="py-4 text-base font-medium">Can I generate anime-style NSFW art?</AccordionTrigger>
                  <AccordionContent className="pb-4 text-sm text-muted-foreground">
                    Yes, our AI supports both realistic and anime styles for all your sexy AI art needs.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-6">
                  <AccordionTrigger className="py-4 text-base font-medium">How realistic are the generated images?</AccordionTrigger>
                  <AccordionContent className="pb-4 text-sm text-muted-foreground">
                    Our AI is trained on millions of images to create incredibly realistic results. The quality depends on your chosen settings, but our premium tiers offer the most lifelike images possible.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="bg-background rounded-xl p-6 border border-muted shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col items-center text-center h-full">
      <div className="mb-4 text-primary bg-primary/10 p-4 rounded-full">{icon}</div>
      <h3 className="text-lg font-semibold mb-3">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  )
}

function FeatureCardWithImage({
  imageSrc,
  title,
  description,
}: {
  imageSrc: string
  title: string
  description: string
}) {
  return (
    <div className="bg-background rounded-xl overflow-hidden border border-muted shadow-sm hover:shadow-md transition-all duration-300 flex flex-col h-full">
      <div className="relative h-48 w-full bg-muted">
        <img 
          src={imageSrc} 
          alt={title} 
          className="w-full h-full object-cover"
          onError={(e) => {
            // Fallback if image doesn't load
            (e.target as HTMLImageElement).src = "/images/feature-placeholder.jpg";
          }}
        />
      </div>
      <div className="p-6 flex flex-col flex-grow">
        <h3 className="text-lg font-semibold mb-3">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  )
}
