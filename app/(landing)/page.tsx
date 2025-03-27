import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { IconCoin, IconSticker, IconDragDrop, IconWand, IconInfinity, IconPhoto, IconApi, IconCode } from "@tabler/icons-react"
import PricingSection from "@/components/pricing-section"
import { GetCreditsButton } from "@/components/get-credits-button"
import { Blog } from "@/components/blog/blog"

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-[100dvh]">
      <header className="w-full py-6 px-4 sm:px-6 lg:px-8 bg-white border-b">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-primary flex items-center gap-2">
            <Image
              src="/logo/logo.png"
              alt="Cum Face AI Logo"
              width={32}
              height={32}
            />
            Cum Face AI
          </Link>
          <nav className="hidden md:flex space-x-4">
            <Link href="#features" className="text-gray-600 hover:text-gray-900">
              How It Works
            </Link>
            <Link href="#examples" className="text-gray-600 hover:text-gray-900">
              Examples
            </Link>
            <Link href="#pricing" className="text-gray-600 hover:text-gray-900">
              Buy Credits
            </Link>
            <Link href="#nsfw-generator" className="text-gray-600 hover:text-gray-900">
              NSFW Generator
            </Link>
          </nav>
          <GetCreditsButton />
        </div>
      </header>

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-r from-purple-500 to-pink-500 text-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-3xl font-extrabold sm:text-5xl md:text-6xl">
                Generate Your Fantasy{" "}
                <span className="inline-block transform -rotate-3 bg-white text-purple-600 px-4 py-2 rounded-lg shadow-lg">
                  Cum Face
                </span>{" "}
                with AI
              </h1>
              <p className="mt-6 text-xl">
                See what your ex, friend, favourite celebrity looked like with cum on their face
              </p>
              <div className="mt-10">
                <Button asChild size="lg" className="bg-white text-purple-600 hover:bg-gray-100">
                  <Link href="/editor" className="flex items-center gap-2">
                    <IconCoin className="w-5 h-5 text-yellow-400" />
                    Get Free Credits
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Features/Steps Section */}
        <section id="features" className="py-20 bg-gray-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-extrabold text-center mb-12">How It Works</h2>
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="relative aspect-video">
                <Image
                  src="/how-it-works.png"
                  alt="How Cum Face AI works"
                  layout="fill"
                  objectFit="cover"
                  className="rounded-lg shadow-lg"
                />
              </div>
              <div className="space-y-8">
                {[
                  { title: "Prompts", description: "Describe the cum face you want to generate." },
                  { title: "Optionly Upload", description: "Optionaly upload a source image to generate a cum face based on it." },
                  { title: "Get Results Instantly", description: "Download your new cum face images right away!" },
                ].map((step, index) => (
                  <div key={index} className="flex items-start">
                    <div className="flex-shrink-0">
                      <div className="bg-purple-600 rounded-full w-10 h-10 flex items-center justify-center text-white font-bold">
                        {index + 1}
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                      <p className="text-gray-600">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Example Images Section */}
        <section id="examples" className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-extrabold text-center mb-12">Cum Faces Gallery</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((i) => (
                <div key={i} className="aspect-square relative overflow-hidden rounded-lg">
                  <Image
                    src={`/examples/${i}.webp`}
                    alt={`Cum Face Example ${i}`}
                    layout="fill"
                    objectFit="cover"
                    className="hover:scale-110 transition-transform duration-300"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-extrabold text-center mb-12">Features</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  icon: IconDragDrop,
                  title: "Text & Image Input",
                  description: "Support for both text-to-image and image-to-image generation to create cum face for your photo or model description.",
                },
                {
                  icon: IconWand,
                  title: "High Quality Results",
                  description: "Generate the most natural and realistic cum face images with advanced AI technology.",
                },
                {
                  icon: IconSticker,
                  title: "All about Controllability",
                  description: "Highly controllable settings to adjust the level of orgasm face and cum face intensity.",
                },
                {
                  icon: IconInfinity,
                  title: "Free Access",
                  description: "Offers a free tier for you to try out the features before upgrading.",
                },
              ].map((feature, index) => (
                <div key={index} className="p-6 bg-gray-50 rounded-lg">
                  <feature.icon className="w-8 h-8 text-blue-600 mb-4" />
                  <h3 className="text-xl font-semibold text-blue-600 mb-3">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Clothes Remover Section */}
        <section className="py-20 bg-gradient-to-r from-purple-50 to-pink-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 mb-12">
            <h2 className="text-3xl font-extrabold text-center mb-8">Try Our AI Clothes Remover</h2>
            <p className="text-xl text-center text-gray-600 max-w-3xl mx-auto mb-12">
              Transform any photo with our cutting-edge AI technology. Remove clothing from images with stunning realism and precision.
            </p>
            <div className="flex justify-center mb-12">
              <Button asChild size="lg" className="bg-purple-600 hover:bg-purple-700 text-white">
                <Link href="/clothes-remover" className="flex items-center gap-2">
                  Try Clothes Remover
                </Link>
              </Button>
            </div>
            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-xl shadow-md">
                  <h3 className="text-xl font-bold mb-4">Advanced AI Technology</h3>
                  <p className="text-gray-600 mb-4">
                    Our AI clothes remover uses state-of-the-art machine learning models to create hyper-realistic results that look natural and authentic.
                  </p>
                  <Image
                    src="/clothes-removers-examples/example0-after.png"
                    alt="AI Clothes Remover Example"
                    width={400}
                    height={300}
                    className="rounded-lg"
                  />
                </div>
                <div className="bg-white p-6 rounded-xl shadow-md">
                  <h3 className="text-xl font-bold mb-4">Easy to Use</h3>
                  <p className="text-gray-600 mb-4">
                    Simply upload your image, create a mask to highlight the areas you want to transform, and let our AI do the rest. No technical skills required!
                  </p>
                  <Image
                    src="/clothes-removers-examples/example1-after.png"
                    alt="AI Clothes Remover Interface"
                    width={400}
                    height={300}
                    className="rounded-lg"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* NSFW Generator Section */}
        <section id="nsfw-generator" className="py-20 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 mb-12">
            <h2 className="text-3xl font-extrabold text-center mb-8">Explore Our NSFW Image Generator</h2>
            <p className="text-xl text-center text-gray-600 max-w-3xl mx-auto mb-12">
              Transform your images into stunning NSFW content or create entirely new adult imagery from text prompts. Our advanced AI delivers unparalleled quality with powerful image-to-image capabilities.
            </p>
            <div className="flex justify-center mb-12">
              <Button asChild size="lg" className="bg-purple-600 hover:bg-purple-700 text-white">
                <Link href="/NSFW-generator" className="flex items-center gap-2">
                  <IconPhoto className="w-5 h-5 text-white" />
                  Try NSFW Generator
                </Link>
              </Button>
            </div>
            <div className="max-w-5xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-white p-6 rounded-xl shadow-md">
                  <h3 className="text-xl font-bold mb-4">High-Quality Results</h3>
                  <p className="text-gray-600 mb-4">
                    Generate high-resolution NSFW images up to 8K for crystal-clear adult content with remarkable realism.
                  </p>
                  <div className="aspect-[16/9] relative overflow-hidden rounded-lg">
                    <Image
                      src="/8k-sign.png"
                      alt="NSFW Generator Example"
                      layout="fill"
                      objectFit="cover"
                      className="hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-md">
                  <h3 className="text-xl font-bold mb-4">Powerful Image-to-Image</h3>
                  <p className="text-gray-600 mb-4">
                    Upload your own reference images and transform them into stunning NSFW content with our advanced AI technology.
                  </p>
                  <div className="aspect-[16/9] relative overflow-hidden rounded-lg">
                    <Image
                      src="/img2img.png"
                      alt="NSFW Generator Image to Image"
                      layout="fill"
                      objectFit="cover"
                      className="hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-md">
                  <h3 className="text-xl font-bold mb-4">Multiple Styles</h3>
                  <p className="text-gray-600 mb-4">
                    Choose between hyper-realistic nudes or anime-inspired NSFW art. Specialized options for different body types, poses, and styles.
                  </p>
                  <div className="aspect-[16/9] relative overflow-hidden rounded-lg">
                    <Image
                      src="/anime-large.png"
                      alt="NSFW Generator Customization"
                      layout="fill"
                      objectFit="cover"
                      className="hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Video Demo Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-extrabold text-center mb-8">See It In Action</h2>
            <p className="text-xl text-center text-gray-600 max-w-3xl mx-auto mb-12">
              Watch our AI in action as it transforms ordinary images into stunning cum face creations.
            </p>
            <div className="max-w-4xl mx-auto rounded-xl overflow-hidden shadow-2xl">
              <video 
                className="w-full aspect-video" 
                controls 
                poster="/how-it-works.png"
                muted 
                loop
              >
                <source src="https://ritdyhnvqjzooqc3.public.blob.vercel-storage.com/0204-fiBcevMbLHNPH4g1vzCteXXZX94gsr.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
        </section>

        {/* API Section */}
        <section className="py-12 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-extrabold text-center mb-6">Developer API Access</h2>
            <p className="text-center text-gray-600 max-w-3xl mx-auto mb-8">
              Integrate our powerful NSFW AI technologies directly into your applications with our developer-friendly APIs.
            </p>
            
            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-md text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <IconApi className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-lg font-bold mb-2">Cum Face Generator API</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Generate realistic cum faces programmatically through simple API calls.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-md text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <IconCode className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-lg font-bold mb-2">Clothes Remover API</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Access our clothes removal technology with robust API integration options.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-md text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <IconPhoto className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-lg font-bold mb-2">NSFW Generator API</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Create high-quality NSFW content at scale with our flexible API solutions.
                </p>
              </div>
            </div>
            
            <div className="text-center mt-8">
              <Button asChild size="lg" className="bg-purple-600 hover:bg-purple-700 text-white">
                <Link href="/ai-nsfw-api" className="flex items-center gap-2">
                  <IconApi className="w-5 h-5" />
                  Explore API Documentation
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Featured On Section */}
        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-extrabold text-center mb-8">Recommended by</h2>
            <div className="flex flex-col items-center">
              <div className="mb-4 text-center">
                <p className="text-lg font-semibold text-gray-700 mb-2">Featured in</p>
                <p className="text-xl font-bold text-purple-600">&ldquo;21 Best Cum Face Generator AI - 2025&rdquo;</p>
              </div>
              <a 
                id="verification-aitoolhunt" 
                data-verify-aitoolhunt="102606411717093946378" 
                href="https://www.aitoolhunt.com/?search=cum-face-generator-ai" 
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center"
              >
                <Image 
                  width={224}
                  height={50}
                  src="https://www.aitoolhunt.com/images/featured-light.png?a=1" 
                  alt="Featured on AI Tool Hunt"
                  className="mb-2"
                />
                <span className="text-sm text-gray-600 hover:text-purple-600 transition-colors">View the full list</span>
              </a>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <PricingSection />

        {/* Blog Section */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            
            <Blog />
            
            <div className="mt-12 text-center">
              <Button asChild variant="outline" size="lg">
                <Link href="/blog">
                  View All Articles
                </Link>
              </Button>
            </div>
          </div>
        </section>

      </main>

      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h3 className="text-lg font-semibold">Cum Face AI</h3>
              <p className="mt-2 text-sm text-gray-400">Bringing smiles to the world, one face at a time.</p>
            </div>
            <nav className="flex flex-wrap justify-center md:justify-end gap-4">
              {/* Other Info Dropdown */}
              <div className="relative group">
                <button className="text-sm hover:text-gray-300 flex items-center gap-1">
                  Other Info
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>
                <div className="absolute bottom-full mb-2 right-0 bg-gray-700 rounded-md shadow-lg w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <div className="py-1">
                    <a 
                      href="https://how-to-generate-cum-face.vercel.app/" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="block px-4 py-2 text-sm hover:bg-gray-600"
                    >
                      How to Generate Cum Face
                    </a>
                    {/* Add more dropdown links here as needed */}
                  </div>
                </div>
              </div>
              <Link href="/terms-of-use/index.html" className="text-sm hover:text-gray-300">
                Terms of Service
              </Link>
              <Link href="/disclaimer" className="text-sm hover:text-gray-300">
                Disclaimer
              </Link>
              <Link href="mailto:gavinli@animaai.cloud" className="text-sm hover:text-gray-300">
                Contact Us
              </Link>
            </nav>
          </div>
          <div className="mt-8 text-center text-sm text-gray-400">
            © {new Date().getFullYear()} Cum Face AI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}

