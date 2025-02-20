import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { IconCoin, IconSticker, IconDragDrop, IconWand, IconInfinity } from "@tabler/icons-react"
import PricingSection from "@/components/pricing-section"
import { GetCreditsButton } from "@/components/get-credits-button"

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
                  title: "Easy-to-Use Editor",
                  description: "Simply upload an image, choose from a variety of cumshot stickers, and customize to your liking.",
                },
                {
                  icon: IconWand,
                  title: "Personalized Creations",
                  description: "Craft your own fantasy scenarios using a wide array of customizable sticker options.",
                },
                {
                  icon: IconSticker,
                  title: "Unique Stickers",
                  description: "Choose from over 200 unique cumshot designs along with other suggestive stickers.",
                },
                {
                  icon: IconInfinity,
                  title: "100% Free Access",
                  description: "Enjoy unlimited access to the generator without any sign-ups or payments.",
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

        {/* Featured On Section */}
        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-extrabold text-center mb-8">Featured On</h2>
            <div className="flex justify-center">
              <a 
                id="verification-aitoolhunt" 
                data-verify-aitoolhunt="102606411717093946378" 
                href="https://www.aitoolhunt.com/tool/cumfaceai.com?utm_medium=featured&utm_source=cumfaceai.com" 
                target="_blank"
                rel="noopener noreferrer"
              >
                <Image 
                  width={224}
                  height={50}
                  src="https://www.aitoolhunt.com/images/featured-light.png?a=1" 
                  alt="Featured on AI Tool Hunt"
                />
              </a>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <PricingSection />
      </main>

      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h3 className="text-lg font-semibold">Cum Face AI</h3>
              <p className="mt-2 text-sm text-gray-400">Bringing smiles to the world, one face at a time.</p>
            </div>
            <nav className="flex flex-wrap justify-center md:justify-end gap-4">
              <Link href="/terms-of-use/index.html" className="text-sm hover:text-gray-300">
                Terms of Service
              </Link>
              <Link href="/privacy_policy/index.html" className="text-sm hover:text-gray-300">
                Privacy Policy
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

