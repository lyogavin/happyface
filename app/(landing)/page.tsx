import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { IconCoin, IconSticker, IconDragDrop, IconWand, IconInfinity, IconPhoto, IconApi, IconCode } from "@tabler/icons-react"
import PricingSection from "@/components/pricing-section"
import { GetCreditsButton } from "@/components/get-credits-button"
import { Blog } from "@/components/blog/blog"
import landingPageData from '@/app/tools/[generator-title]/enhanced_results_with_prompts_nsfw_image_gend.json'
import TrackDeskTrackClick from "@/components/track-desk-track-click"

export default function LandingPage() {
  return (
    <>
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
              
              {/* Social Media Icons */}
              <div className="flex space-x-4 mt-3">
                <a 
                  href="https://www.youtube.com/channel/UCAM4E9oswvb9IB7iFhZ6Lew" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-red-500 transition-colors"
                  aria-label="YouTube Channel"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
                  </svg>
                </a>
                <a 
                  href="https://www.facebook.com/profile.php?id=61574210206334" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-blue-600 transition-colors"
                  aria-label="Facebook Page"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
                  </svg>
                </a>
                <a 
                  href="https://www.instagram.com/happyfaceai/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-pink-500 transition-colors"
                  aria-label="Instagram Profile"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>
                {/* Reddit Icon */}
                <a 
                  href="https://www.reddit.com/user/Chemical-Parfait-452/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-orange-500 transition-colors"
                  aria-label="Reddit Profile"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 11.779c0-1.459-1.192-2.645-2.657-2.645-.715 0-1.363.286-1.84.746-1.81-1.191-4.259-1.949-6.971-2.046l1.483-4.669 4.016.941-.006.058c0 1.193.975 2.163 2.174 2.163 1.198 0 2.172-.97 2.172-2.163s-.975-2.164-2.172-2.164c-.92 0-1.704.574-2.021 1.379l-4.329-1.015c-.189-.046-.381.063-.44.249l-1.654 5.207c-2.838.034-5.409.798-7.3 2.025-.474-.438-1.103-.712-1.799-.712-1.465 0-2.656 1.187-2.656 2.646 0 .97.533 1.811 1.317 2.271-.052.282-.086.567-.086.857 0 3.911 4.808 7.093 10.719 7.093s10.72-3.182 10.72-7.093c0-.274-.029-.544-.075-.81.832-.447 1.405-1.312 1.405-2.318zm-17.224 1.816c0-.868.71-1.575 1.582-1.575.872 0 1.581.707 1.581 1.575s-.709 1.574-1.581 1.574-1.582-.706-1.582-1.574zm9.061 4.669c-.797.793-2.048 1.179-3.824 1.179l-.013-.003-.013.003c-1.777 0-3.028-.386-3.824-1.179-.145-.144-.145-.379 0-.523.145-.145.381-.145.526 0 .65.647 1.729.961 3.298.961l.013.003.013-.003c1.569 0 2.648-.315 3.298-.962.145-.145.381-.144.526 0 .145.145.145.379 0 .524zm-.189-3.095c-.872 0-1.581-.706-1.581-1.574 0-.868.709-1.575 1.581-1.575s1.581.707 1.581 1.575-.709 1.574-1.581 1.574z"/>
                  </svg>
                </a>
                {/* X (Twitter) Icon */}
                <a 
                  href="https://x.com/happyfaceai" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-blue-400 transition-colors"
                  aria-label="X (Twitter) Profile"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>
              </div>
            </div>
            <nav className="flex flex-wrap justify-center md:justify-end gap-4">
              {/* AI Tools Dropdown */}
              <div className="relative group">
                <button className="text-sm hover:text-gray-300 flex items-center gap-1">
                  AI Tools
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>
                <div className="absolute bottom-full mb-2 right-0 bg-gray-700 rounded-md shadow-lg w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 max-h-80 overflow-y-auto">
                  <div className="py-1">
                    {landingPageData.map((tool, index) => (
                      <Link 
                        key={index}
                        href={`/tools/${tool.title.toLowerCase().replace(/ /g, '-').replace(/:/g, '-')}`}
                        className="block px-4 py-2 text-sm hover:bg-gray-600"
                      >
                        {tool.title}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
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
                      className="block px-4 py-2 text-sm hover:bg-gray-600"
                    >
                      How to Generate Cum Face
                    </a>
                    <a 
                      href="https://cumfaceai.web.app/" 
                      target="_blank" 
                      className="block px-4 py-2 text-sm hover:bg-gray-600"
                    >
                      Ultimate Guide to Creating Cum Faces
                    </a>
                    <a 
                      href="https://lyo-gavin.systeme.io/cum-face-ai" 
                      target="_blank" 
                      className="block px-4 py-2 text-sm hover:bg-gray-600"
                    >
                      Intro of Cum Face AI
                    </a>
                    <a 
                      href="https://github.com/best-nsfw-image-generator/awesome-nsfw-generators" 
                      target="_blank" 
                      className="block px-4 py-2 text-sm hover:bg-gray-600"
                    >
                      Awesome NSFW Generator
                    </a>
                    <a 
                      href="https://community.fabric.microsoft.com/t5/user/viewprofilepage/user-id/1247640" 
                      target="_blank" 
                      className="block px-4 py-2 text-sm hover:bg-gray-600"
                    >
                      Fabric Community
                    </a>
                    <a 
                      href="https://dang.ai" 
                      target="_blank" 
                      className="block px-4 py-2 text-sm hover:bg-gray-600"
                    >
                      Dang AI
                    </a>
                    <a 
                      href="https://right-ai.com/" 
                      target="_blank" 
                      title="RightAI Tools Directory"
                      className="block px-4 py-2 text-sm hover:bg-gray-600"
                    >
                      RightAI Tools Diresctory
                    </a>
                    <a href="https://www.toolio.ai/tool/cumface-ai" 
                      target="_blank" 
                      className="block px-4 py-2 text-sm hover:bg-gray-600">
                      Toolio.ai
                    </a>
                    <a href="https://happy-face-ai.trackdesk.com/sign-up" className="block px-4 py-2 text-sm hover:bg-gray-600">
                      Affiliate
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
    <TrackDeskTrackClick />
    </>
  )
}

