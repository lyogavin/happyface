import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="w-full py-6 px-4 sm:px-6 lg:px-8 bg-white border-b">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-primary">
            Happy Face AI
          </Link>
          <nav className="hidden md:flex space-x-4">
            <Link href="#features" className="text-gray-600 hover:text-gray-900">
              How It Works
            </Link>
            <Link href="#examples" className="text-gray-600 hover:text-gray-900">
              Examples
            </Link>
            <Link href="#pricing" className="text-gray-600 hover:text-gray-900">
              Pricing
            </Link>
          </nav>
          <Button asChild>
            <Link href="#pricing">Start Free Trial</Link>
          </Button>
        </div>
      </header>

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-r from-purple-500 to-pink-500 text-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl font-extrabold sm:text-5xl md:text-6xl">
                Turn Any Face into a{" "}
                <span className="inline-block transform -rotate-3 bg-white text-purple-600 px-4 py-2 rounded-lg shadow-lg">
                  Happy Face
                </span>{" "}
                with AI
              </h1>
              <p className="mt-6 text-xl">
                Use our advanced AI to generate joyful expressions or transform your photos into beaming smiles!
              </p>
              <div className="mt-10">
                <Button asChild size="lg" className="bg-white text-purple-600 hover:bg-gray-100">
                  <Link href="#pricing">Start Your Free Trial</Link>
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
                  src="/placeholder.svg?height=400&width=600&text=How It Works Demo"
                  alt="How Happy Face AI works"
                  layout="fill"
                  objectFit="cover"
                  className="rounded-lg shadow-lg"
                />
              </div>
              <div className="space-y-8">
                {[
                  { title: "Describe or Upload", description: "Enter a text prompt or upload an image of a face." },
                  { title: "AI Magic", description: "Our AI processes your input to create a happy face." },
                  { title: "Enjoy & Share", description: "Download your new happy face image and share the joy!" },
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
            <h2 className="text-3xl font-extrabold text-center mb-12">Happy Faces Gallery</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="aspect-square relative overflow-hidden rounded-lg">
                  <Image
                    src={`/placeholder.svg?height=300&width=300&text=Happy Face ${i + 1}`}
                    alt={`Happy Face Example ${i + 1}`}
                    layout="fill"
                    objectFit="cover"
                    className="hover:scale-110 transition-transform duration-300"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-20 bg-gray-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-extrabold text-center mb-12">Simple Pricing, Unlimited Smiles</h2>
            <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="px-6 py-8">
                <h3 className="text-2xl font-semibold text-center mb-4">Premium Plan</h3>
                <div className="text-center mb-6">
                  <span className="text-4xl font-bold">$9.99</span>
                  <span className="text-gray-600">/month</span>
                </div>
                <ul className="mb-8">
                  <li className="flex items-center mb-3">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Unlimited happy face generations
                  </li>
                  <li className="flex items-center mb-3">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    High-resolution outputs
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Priority support
                  </li>
                </ul>
                <Button className="w-full" size="lg" asChild>
                  <Link href="https://buy.stripe.com/test_eVa3eUdqQ77R7uM288">
                    Start 3-Day Free Trial
                  </Link>
                </Button>
                <p className="text-sm text-gray-600 text-center mt-4">No charge if cancelled within the trial period</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h3 className="text-lg font-semibold">Happy Face AI</h3>
              <p className="mt-2 text-sm text-gray-400">Bringing smiles to the world, one face at a time.</p>
            </div>
            <nav className="flex flex-wrap justify-center md:justify-end gap-4">
              <Link href="#" className="text-sm hover:text-gray-300">
                Terms of Service
              </Link>
              <Link href="#" className="text-sm hover:text-gray-300">
                Privacy Policy
              </Link>
              <Link href="#" className="text-sm hover:text-gray-300">
                Contact Us
              </Link>
            </nav>
          </div>
          <div className="mt-8 text-center text-sm text-gray-400">
            © {new Date().getFullYear()} Happy Face AI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}

