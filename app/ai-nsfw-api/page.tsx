import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  IconBrandPython, 
  IconBrandJavascript, 
  IconTerminal2, 
  IconKey, 
  IconApi, 
  IconCode, 
  IconCreditCard, 
  IconUpload, 
  IconRobot,
  IconCopy,
  IconCheck,
  IconMail
} from "@tabler/icons-react"
import appConfig from "@/lib/app-config"
import { ContactDialogWrapper } from "@/components/contact-dialog-wrapper"
import { ContactButton } from "@/components/contact-button"
import { RequestApiTokenDialogWrapper } from "@/components/request-api-token-dialog-wrapper"
import { RequestApiTokenButton } from "@/components/request-api-token-button"
import { EditorFooter } from "@/app/components/EditorFooter"

export default function AIApiPage() {
  const contactEmail = "gavinli@animaai.cloud"

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Client components for dialog functionality */}
      <ContactDialogWrapper email={contactEmail} />
      <RequestApiTokenDialogWrapper />

      {/* Hero Section */}
      <section className="py-12 px-6 rounded-xl bg-gradient-to-b from-primary/10 to-background mb-16">
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center mb-4 px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
            <IconApi className="w-4 h-4 mr-2" />
            NSFW AI API Access
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-5 pb-2 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600 leading-normal">
            NSFW AI Image Generator API
          </h1>
          <h2 className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Integrate our powerful NSFW AI image generator API into your own applications. 
            Access our cum face generator, clothes remover, and NSFW image generation technologies through simple API calls.
          </h2>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <RequestApiTokenButton size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
              Get NSFW AI API Access
            </RequestApiTokenButton>
            <RequestApiTokenButton size="lg" variant="outline">
              View API Documentation
            </RequestApiTokenButton>
          </div>
        </div>
      </section>

      {/* Services Overview */}
      <section className="mb-20">
        <h2 className="text-3xl font-bold text-center mb-12">NSFW AI API Services</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="overflow-hidden border border-muted shadow-sm hover:shadow-md transition-all duration-300">
            <div className="h-64 w-full bg-muted relative">
              <Image 
                src="/how-it-works.png" 
                alt="Cum Face Generator API" 
                fill
                className="object-cover"
              />
            </div>
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold mb-3">Cum Face Generator API</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Generate realistic cum faces using our advanced NSFW AI image API. Works with both text prompts and image inputs.
              </p>
              <RequestApiTokenButton variant="outline" className="w-full">
                Learn More
              </RequestApiTokenButton>
            </CardContent>
          </Card>

          <Card className="overflow-hidden border border-muted shadow-sm hover:shadow-md transition-all duration-300">
            <div className="h-64 w-full bg-muted relative overflow-hidden">
              <Image 
                src="/clothes-removers-examples/example0-after.png" 
                alt="Clothes Remover NSFW AI API" 
                fill
                className="object-cover object-top scale-[1.8]"
                style={{ objectPosition: "0% 0%" }}
              />
            </div>
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold mb-3">Clothes Remover API</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Realistic clothes removal technology powered by our NSFW AI image generator API. Transform photos with our cutting-edge AI.
              </p>
              <RequestApiTokenButton variant="outline" className="w-full">
                Learn More
              </RequestApiTokenButton>
            </CardContent>
          </Card>

          <Card className="overflow-hidden border border-muted shadow-sm hover:shadow-md transition-all duration-300">
            <div className="h-64 w-full bg-muted relative">
              <Image 
                src="/nsfw-examples/1.jpeg" 
                alt="NSFW Image Generator API" 
                fill
                className="object-cover"
              />
            </div>
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold mb-3">NSFW Generator API</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Generate high-quality NSFW content with our advanced NSFW AI image generator API. Support for various styles and customizations.
              </p>
              <RequestApiTokenButton variant="outline" className="w-full">
                Learn More
              </RequestApiTokenButton>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Features Section */}
      <section className="mb-20 bg-gradient-to-r from-blue-50 to-purple-50 py-16 px-6 rounded-xl">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">Advanced NSFW AI API Features</h2>
          <p className="text-center text-muted-foreground max-w-2xl mx-auto mb-12">
            Our NSFW image generator API provides state-of-the-art capabilities for adult content generation with unmatched flexibility and quality.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl p-6 shadow-sm flex flex-col h-full">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                  <path d="M3 9h18"/>
                  <path d="M9 21V9"/>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Ultra High Resolution</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Generate crystal-clear NSFW AI images up to 8K resolution with our NSFW AI image API. Perfect for creating high-detail content that looks stunning even on large displays.
              </p>
              <div className="mt-auto">
                <div className="text-sm font-medium flex items-center text-primary">
                  <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  Up to 8192×8192 resolution
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-sm flex flex-col h-full">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 20.94c1.5 0 2.75 1.06 4 1.06 3 0 6-8 6-12.22A4.91 4.91 0 0 0 17 5c-2.22 0-4 1.44-5 2-1-.56-2.78-2-5-2a4.9 4.9 0 0 0-5 4.78C2 14 5 22 8 22c1.25 0 2.5-1.06 4-1.06Z"/>
                  <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2Z"/>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Dual Style Support</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Our NSFW AI image generator API is optimized for both hyper-realistic NSFW images and anime-style NSFW art. Switch between styles with a simple parameter change.
              </p>
              <div className="mt-auto">
                <div className="text-sm font-medium flex items-center text-primary">
                  <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  Realistic & anime styles
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-sm flex flex-col h-full">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 12c0-3.5 2.5-6 5.5-6 3 0 4.5 1.5 5.5 3.5 1-2 2.5-3.5 5.5-3.5 3 0 5.5 2.5 5.5 6 0 3.5-2 7-8 12-6-5-8-8.5-8-12Z"/>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Anatomy Perfection</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Our API is specially optimized for realistic anatomy, including perfect breast generation - from large to petite, with natural proportions and details.
              </p>
              <div className="mt-auto">
                <div className="text-sm font-medium flex items-center text-primary">
                  <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  All body types supported
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-sm flex flex-col h-full">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 8a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1Z"/>
                  <path d="M10 8a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1Z"/>
                  <path d="M17 8a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1Z"/>
                  <path d="M10 8V4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4"/>
                  <path d="M17 8V4a1 1 0 0 1 1-1h0a1 1 0 0 1 1 1v4"/>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Total Pose Flexibility</h3>
              <p className="text-sm text-muted-foreground mb-4">
                From standing to complex positions, our API handles all poses with remarkable accuracy. Generate NSFW content in virtually any position or camera angle.
              </p>
              <div className="mt-auto">
                <div className="text-sm font-medium flex items-center text-primary">
                  <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  All poses and angles
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
                  <circle cx="12" cy="13" r="3"/>
                </svg>
                Text-to-Image Generation
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Simply describe what you want to generate with detailed prompts. Our advanced AI understands complex descriptions and creates images matching your specifications.
              </p>
              <div className="bg-muted/30 p-3 rounded-md text-xs">
                <span className="font-semibold">Example:</span> "A beautiful blonde woman in lingerie on a beach at sunset, photorealistic, detailed lighting, perfect anatomy"
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <path d="M20.4 14.5 16 10 4 20"/>
                </svg>
                Image-to-Image Transformation
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Upload your own reference images and transform them into NSFW content. Great for creating NSFW versions of characters or generating content based on specific models.
              </p>
              <div className="bg-muted/30 p-3 rounded-md text-xs">
                <span className="font-semibold">Control options:</span> Strength, guidance scale, clothes removal areas, preservation of facial features, and style adaptation
              </div>
            </div>
          </div>
          
          <div className="mt-10 bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-xl font-semibold mb-4 text-center">Additional Advanced Features</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div className="flex items-center">
                <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <span className="text-sm">Background customization</span>
              </div>
              <div className="flex items-center">
                <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <span className="text-sm">Clothing style control</span>
              </div>
              <div className="flex items-center">
                <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <span className="text-sm">Facial expression adjustments</span>
              </div>
              <div className="flex items-center">
                <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <span className="text-sm">Body proportion tweaking</span>
              </div>
              <div className="flex items-center">
                <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <span className="text-sm">Lighting condition settings</span>
              </div>
              <div className="flex items-center">
                <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <span className="text-sm">Multi-model generation</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Examples Section */}
      <section className="mb-20">
        <h2 className="text-3xl font-bold text-center mb-8">NSFW AI Image Generator API Results</h2>
        <p className="text-center text-muted-foreground max-w-2xl mx-auto mb-12">
          See the impressive results our NSFW AI image API services can generate. These examples showcase the quality and flexibility of our NSFW AI generator models.
        </p>
        
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {/* Cum Face Generator examples */}
            <div className="overflow-hidden rounded-xl aspect-[3/4] relative group">
              <Image 
                src="/examples/1.webp" 
                alt="NSFW AI API Example 1" 
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                <div className="p-3 text-white text-left">
                  <p className="font-medium text-sm">Cum Face Generator API</p>
                </div>
              </div>
            </div>
            
            <div className="overflow-hidden rounded-xl aspect-[3/4] relative group">
              <Image 
                src="/examples/2.webp" 
                alt="NSFW AI API Example 2" 
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                <div className="p-3 text-white text-left">
                  <p className="font-medium text-sm">Cum Face Generator API</p>
                </div>
              </div>
            </div>
            
            {/* Clothes Remover examples */}
            <div className="overflow-hidden rounded-xl aspect-[3/4] relative group">
              <Image 
                src="/clothes-removers-examples/example0-after.png" 
                alt="NSFW Image Generator API Example 3" 
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105 rounded-xl "
                style={{ objectPosition: "50% 50%" }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                <div className="p-3 text-white text-left">
                  <p className="font-medium text-sm">Clothes Remover API</p>
                </div>
              </div>
            </div>
            
            <div className="overflow-hidden rounded-xl aspect-[3/4] relative group">
              <Image 
                src="/clothes-removers-examples/example1-after.png" 
                alt="NSFW AI Image API Example 4" 
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105 rounded-xl "
                style={{ objectPosition: "50% 50%" }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                <div className="p-3 text-white text-left">
                  <p className="font-medium text-sm">Clothes Remover API</p>
                </div>
              </div>
            </div>
            
            {/* NSFW Generator examples */}
            <div className="overflow-hidden rounded-xl aspect-[3/4] relative group">
              <Image 
                src="/nsfw-examples/1.jpeg" 
                alt="NSFW AI Image Generator API Example 5" 
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                <div className="p-3 text-white text-left">
                  <p className="font-medium text-sm">NSFW Generator API</p>
                </div>
              </div>
            </div>
            
            <div className="overflow-hidden rounded-xl aspect-[3/4] relative group">
              <Image 
                src="/nsfw-examples/2.jpeg" 
                alt="NSFW AI API Example 6" 
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                <div className="p-3 text-white text-left">
                  <p className="font-medium text-sm">NSFW Generator API</p>
                </div>
              </div>
            </div>
            
            <div className="overflow-hidden rounded-xl aspect-[3/4] relative group">
              <Image 
                src="/nsfw-examples/3.jpeg" 
                alt="NSFW AI Image API Example 7" 
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                <div className="p-3 text-white text-left">
                  <p className="font-medium text-sm">NSFW Generator API</p>
                </div>
              </div>
            </div>
            
            <div className="overflow-hidden rounded-xl aspect-[3/4] relative group">
              <Image 
                src="/nsfw-examples/4.jpeg" 
                alt="NSFW Image Generator API Example 8" 
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                <div className="p-3 text-white text-left">
                  <p className="font-medium text-sm">NSFW Generator API</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="mb-20 bg-muted/30 py-16 px-6 rounded-xl">
        <h2 className="text-3xl font-bold text-center mb-12">How Our NSFW AI API Works</h2>
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-background rounded-xl p-6 text-center shadow-sm flex flex-col items-center">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                <IconCreditCard className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">1. Sign Up & Purchase Credits</h3>
              <p className="text-sm text-muted-foreground">
                Create an account and purchase API credits for our NSFW image generator API. Our credit-based system ensures you only pay for what you use.
              </p>
            </div>

            <div className="bg-background rounded-xl p-6 text-center shadow-sm flex flex-col items-center">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                <IconKey className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">2. Create API Token</h3>
              <p className="text-sm text-muted-foreground">
                Generate your unique NSFW AI API token from your dashboard. This key will be used to authenticate all your API requests.
              </p>
            </div>

            <div className="bg-background rounded-xl p-6 text-center shadow-sm flex flex-col items-center">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                <IconCode className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">3. Make API Calls</h3>
              <p className="text-sm text-muted-foreground">
                Integrate our NSFW AI image API endpoints into your application using our comprehensive documentation and example code.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Code Examples */}
      <section className="mb-20">
        <h2 className="text-3xl font-bold text-center mb-8">NSFW AI API Code Examples</h2>
        <p className="text-center text-muted-foreground max-w-2xl mx-auto mb-12">
          Integrating our NSFW image generator API is simple. Below are examples in various programming languages to help you get started quickly.
        </p>
        
        <div className="max-w-4xl mx-auto bg-background border rounded-xl overflow-hidden">
          <Tabs defaultValue="curl">
            <div className="border-b px-4">
              <TabsList className="bg-transparent">
                <TabsTrigger value="curl" className="flex items-center gap-2">
                  <IconTerminal2 className="h-4 w-4" />
                  cURL
                </TabsTrigger>
                <TabsTrigger value="python" className="flex items-center gap-2">
                  <IconBrandPython className="h-4 w-4" />
                  Python
                </TabsTrigger>
                <TabsTrigger value="javascript" className="flex items-center gap-2">
                  <IconBrandJavascript className="h-4 w-4" />
                  JavaScript
                </TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="curl" className="p-6 max-h-[500px] overflow-auto">
              <h3 className="text-lg font-semibold mb-4">Generate NSFW image with cURL</h3>
              <pre className="bg-black text-green-400 p-4 rounded-md overflow-x-auto">
                <code>{`curl -X POST https://api.ainsfwapi.com/v1/generate \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -d '{
    "service": "nsfw-generator",
    "prompt": "A beautiful woman in a tropical setting, highly detailed",
    "negative_prompt": "deformed, ugly, bad anatomy",
    "width": 1024,
    "height": 1024,
    "samples": 1,
    "cfg_scale": 7.5,
    "style": "realistic"
  }'`}</code>
              </pre>
              
              <h3 className="text-lg font-semibold mt-8 mb-4">NSFW AI Image API - Clothes Remover Example</h3>
              <pre className="bg-black text-green-400 p-4 rounded-md overflow-x-auto">
                <code>{`curl -X POST https://api.ainsfwapi.com/v1/clothes-remover \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -F "image=@path/to/your/image.jpg" \\
  -F "remove_areas=body,top,bottom" \\
  -F "enhancement_level=high"`}</code>
              </pre>
            </TabsContent>
            
            <TabsContent value="python" className="p-6 max-h-[500px] overflow-auto">
              <h3 className="text-lg font-semibold mb-4">NSFW AI Image Generator API - Python Example</h3>
              <pre className="bg-black text-green-400 p-4 rounded-md overflow-x-auto">
                <code>{`import requests
import json
import base64
from PIL import Image
from io import BytesIO

# NSFW AI API configuration
API_KEY = "YOUR_API_KEY"
API_URL = "https://api.ainsfwapi.com/v1/generate"

# Request headers
headers = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json"
}

# Request payload for NSFW image generator API
payload = {
    "service": "nsfw-generator",
    "prompt": "A beautiful woman in a tropical setting, highly detailed",
    "negative_prompt": "deformed, ugly, bad anatomy",
    "width": 1024,
    "height": 1024,
    "samples": 1,
    "cfg_scale": 7.5,
    "style": "realistic"
}

# Send the request to the NSFW AI API
response = requests.post(API_URL, headers=headers, json=payload)

# Check if the request was successful
if response.status_code == 200:
    # Parse the response
    result = response.json()
    
    # The response contains base64-encoded images
    for i, image_data in enumerate(result["images"]):
        # Convert base64 to image
        image_bytes = base64.b64decode(image_data)
        image = Image.open(BytesIO(image_bytes))
        
        # Save the image
        image.save(f"generated_image_{i}.png")
        print(f"Image {i} saved successfully!")
else:
    print(f"Error: {response.status_code}")
    print(response.text)`}</code>
              </pre>
            </TabsContent>
            
            <TabsContent value="javascript" className="p-6 max-h-[500px] overflow-auto">
              <h3 className="text-lg font-semibold mb-4">NSFW AI API - JavaScript Example</h3>
              <pre className="bg-black text-green-400 p-4 rounded-md overflow-x-auto">
                <code>{`// Using fetch API with NSFW AI image generator API
const generateNSFWImage = async () => {
  const API_KEY = "YOUR_API_KEY";
  const API_URL = "https://api.ainsfwapi.com/v1/generate";
  
  const payload = {
    service: "nsfw-generator",
    prompt: "A beautiful woman in a tropical setting, highly detailed",
    negative_prompt: "deformed, ugly, bad anatomy",
    width: 1024,
    height: 1024,
    samples: 1,
    cfg_scale: 7.5,
    style: "realistic"
  };
  
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Authorization": \`Bearer \${API_KEY}\`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      throw new Error(\`HTTP error! Status: \${response.status}\`);
    }
    
    const data = await response.json();
    
    // Process the generated NSFW AI images
    data.images.forEach((base64Image, index) => {
      // Create an image element
      const img = document.createElement("img");
      img.src = \`data:image/png;base64,\${base64Image}\`;
      document.body.appendChild(img);
    });
    
    return data;
  } catch (error) {
    console.error("Error generating NSFW image:", error);
  }
};

// Call the function to use the NSFW AI image API
generateNSFWImage();`}</code>
              </pre>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="mb-20 bg-gray-50 py-16 px-6 rounded-xl">
        <h2 className="text-3xl font-bold text-center mb-8">NSFW AI Image API Pricing</h2>
        <p className="text-center text-muted-foreground max-w-2xl mx-auto mb-12">
          Our NSFW image generator API uses a simple credit-based pricing model. Purchase credits in bulk and use them across any of our NSFW AI API services.
        </p>
        
        <div className="max-w-3xl mx-auto text-center mb-12">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow">
              <h3 className="font-semibold text-xl mb-2">NSFW AI API Flexibility</h3>
              <p className="text-muted-foreground">Use your credits across any of our NSFW AI image generator API services with a single account and API key.</p>
            </div>
            <div className="p-6 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow">
              <h3 className="font-semibold text-xl mb-2">No Expiration</h3>
              <p className="text-muted-foreground">Your NSFW AI API credits never expire. Use them at your own pace without pressure.</p>
            </div>
            <div className="p-6 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow">
              <h3 className="font-semibold text-xl mb-2">Bulk Savings</h3>
              <p className="text-muted-foreground">Get better per-credit rates when you purchase larger NSFW image generator API credit packages.</p>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden p-8">
            <div className="text-center mb-4 h-[26px]"></div>
            <h3 className="text-2xl font-semibold text-center">30 Credits</h3>
            <p className="text-muted-foreground text-center mt-2 mb-6">Perfect for trying out our NSFW AI API</p>
            
            <div className="text-center mb-8">
              <div className="flex items-baseline justify-center">
                <span className="text-4xl font-bold">$2.90</span>
              </div>
              <span className="text-muted-foreground flex items-center justify-center gap-1 mt-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-amber-500" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="8" />
                  <path d="M9.5 9a2.5 2.5 0 0 1 5 0v6a2.5 2.5 0 0 1-5 0V9Z" />
                </svg>
                30 NSFW AI API credits
              </span>
            </div>

            <ul className="space-y-4 mb-8">
              <li className="flex items-start">
                <svg className="w-5 h-5 text-green-500 mr-3 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>30 NSFW image generations</span>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-green-500 mr-3 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>High-resolution NSFW outputs</span>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-green-500 mr-3 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>Pay as you go</span>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-green-500 mr-3 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>Standard NSFW AI API access</span>
              </li>
            </ul>

            <Button className="w-full" asChild>
              <Link href={appConfig.prices[0].url}>
                <span className="flex items-center justify-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-amber-400" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="8" />
                    <path d="M9.5 9a2.5 2.5 0 0 1 5 0v6a2.5 2.5 0 0 1-5 0V9Z" />
                  </svg>
                  Purchase API Credits
                </span>
              </Link>
            </Button>
            
            <p className="text-sm text-muted-foreground text-center mt-4">
              API Credits never expire
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg overflow-hidden p-8 ring-2 ring-primary">
            <div className="text-center mb-4 h-[26px]">
              <span className="bg-primary/20 text-primary text-sm font-medium px-3 py-1 rounded-full">
                Best Value
              </span>
            </div>
            <h3 className="text-2xl font-semibold text-center">80 Credits</h3>
            <p className="text-muted-foreground text-center mt-2 mb-6">Best value for NSFW image generation</p>
            
            <div className="text-center mb-8">
              <div className="flex items-baseline justify-center">
                <span className="text-4xl font-bold">$5.90</span>
              </div>
              <span className="text-muted-foreground flex items-center justify-center gap-1 mt-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-amber-500" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="8" />
                  <path d="M9.5 9a2.5 2.5 0 0 1 5 0v6a2.5 2.5 0 0 1-5 0V9Z" />
                </svg>
                80 NSFW AI API credits
              </span>
            </div>

            <ul className="space-y-4 mb-8">
              <li className="flex items-start">
                <svg className="w-5 h-5 text-green-500 mr-3 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>80 NSFW AI image generations</span>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-green-500 mr-3 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>High-resolution NSFW outputs</span>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-green-500 mr-3 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>Pay as you go</span>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-green-500 mr-3 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>Save 26% per credit</span>
              </li>
            </ul>

            <Button className="w-full bg-primary" asChild>
              <Link href={appConfig.prices[1].url}>
                <span className="flex items-center justify-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-amber-400" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="8" />
                    <path d="M9.5 9a2.5 2.5 0 0 1 5 0v6a2.5 2.5 0 0 1-5 0V9Z" />
                  </svg>
                  Purchase API Credits
                </span>
              </Link>
            </Button>
            
            <p className="text-sm text-muted-foreground text-center mt-4">
              API Credits never expire
            </p>
          </div>
        </div>
        
        <div className="mt-12 max-w-3xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-4">Free Trial Available</h3>
            <p className="text-muted-foreground mb-6">
              New users get {appConfig.freeCredits} free credits to try our NSFW image generator API services. Sign up today to start experimenting with our powerful NSFW AI image generation capabilities.
            </p>
            <div className="flex justify-center">
              <RequestApiTokenButton variant="outline">
                Sign Up for Free NSFW AI API Trial
              </RequestApiTokenButton>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section>
        <h2 className="text-3xl font-bold text-center mb-8">NSFW AI API Frequently Asked Questions</h2>
        <div className="max-w-3xl mx-auto bg-background rounded-xl p-6 shadow-sm">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1" className="border-b border-muted">
              <AccordionTrigger className="py-4 text-base font-medium">How do NSFW AI API credits work?</AccordionTrigger>
              <AccordionContent className="pb-4 text-sm text-muted-foreground">
                Each NSFW image generator API call consumes a specific number of credits based on the service and parameters used. Standard generations cost 1 credit, while higher resolution or more complex generations may cost more. Credits are deducted automatically when you make API calls.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2" className="border-b border-muted">
              <AccordionTrigger className="py-4 text-base font-medium">What happens if I run out of NSFW AI API credits?</AccordionTrigger>
              <AccordionContent className="pb-4 text-sm text-muted-foreground">
                When your credit balance reaches zero, your NSFW AI API calls will be rejected with an appropriate error message. You can purchase additional credits at any time from your dashboard, or enable auto-recharge to ensure uninterrupted service.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3" className="border-b border-muted">
              <AccordionTrigger className="py-4 text-base font-medium">How secure is the NSFW AI image API?</AccordionTrigger>
              <AccordionContent className="pb-4 text-sm text-muted-foreground">
                Our NSFW image generator API uses industry-standard security practices, including TLS encryption for all communications and token-based authentication. Your API key should be kept secure and never shared publicly. We also provide IP whitelisting options for additional security.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4" className="border-b border-muted">
              <AccordionTrigger className="py-4 text-base font-medium">Can I integrate with any application?</AccordionTrigger>
              <AccordionContent className="pb-4 text-sm text-muted-foreground">
                Yes! Our RESTful NSFW AI API is designed to be easily integrated with any application that can make HTTP requests. We provide client libraries for popular programming languages, and our comprehensive documentation includes examples for various use cases.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-5" className="border-b border-muted">
              <AccordionTrigger className="py-4 text-base font-medium">What are the NSFW AI API rate limits?</AccordionTrigger>
              <AccordionContent className="pb-4 text-sm text-muted-foreground">
                Rate limits for our NSFW image generator API depend on your usage volume. Basic API users can perform up to 10 requests per minute, while higher-volume users receive increased rate limits. Custom rate limits are available for enterprise customers with special needs.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-6">
              <AccordionTrigger className="py-4 text-base font-medium">Do you offer technical support for the NSFW AI API?</AccordionTrigger>
              <AccordionContent className="pb-4 text-sm text-muted-foreground">
                Yes, all NSFW AI image API plans include technical support. Basic plans receive standard email support, while higher-volume customers receive priority support with faster response times, and enterprise customers get dedicated support with direct contact to our engineering team.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to Get Started with our NSFW AI Image Generator API?</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
          Sign up today and get access to our powerful NSFW AI API. Start integrating advanced NSFW image generation capabilities into your applications.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <RequestApiTokenButton size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            Sign Up for NSFW AI API Access
          </RequestApiTokenButton>
          <ContactButton />
        </div>
      </section>
      
      {/* Footer */}
      <EditorFooter />
    </div>
  )
}
