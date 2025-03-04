import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { IconUpload, IconEdit } from "@tabler/icons-react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { ImageComparisonSlider } from "@/app/components/image-comparison-slider"

export function ClothesRemoverLanding() {
  return (
    <div className="mt-16 border-t pt-16">
      <div className="max-w-[1600px] mx-auto">
        <h1 className="text-4xl font-bold text-center mb-4">AI Clothes Remover: Transform Photos Instantly</h1>
        <h2 className="text-xl text-gray-700 text-center mb-12 max-w-3xl mx-auto">
          Experience the most advanced AI clothes remover technology available today. Our powerful yet easy-to-use tool delivers stunningly realistic results in seconds with just a few clicks. No technical skills required.
        </h2>
        
        {/* Three Simple Steps */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white rounded-xl shadow-md p-6 text-center hover:shadow-lg transition-shadow">
            <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <IconUpload className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">1. Upload Your Image</h3>
            <p className="text-gray-600">Upload any photo with clothed subjects. Our AI works best with clear, high-quality images.</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6 text-center hover:shadow-lg transition-shadow">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <IconEdit className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">2. Create a Mask</h3>
            <p className="text-gray-600">Use our intuitive mask editor to highlight the areas where you want to remove clothing.</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6 text-center hover:shadow-lg transition-shadow">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2">3. Generate Results</h3>
            <p className="text-gray-600">Our advanced AI will process your image and create a realistic nude version in seconds.</p>
          </div>
        </div>
        
        {/* Video Demo */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-center mb-6">See It In Action</h2>
          <div className="aspect-video max-w-3xl mx-auto bg-black rounded-xl overflow-hidden shadow-lg">
            <video
              className="w-full h-full"
              src="/clothes-remover-demo.mp4"
              poster="/clothes-remover-demo-Cover.jpg"
              controls
              preload="none"
            ></video>
          </div>
          <p className="text-center text-gray-500 mt-4">Watch our demo to see how easy it is to use our AI Clothes Remover</p>
        </div>
        
        {/* Examples */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-center mb-8">Any Pose, Any Clothes, Any Model</h2>
          <h3 className="text-xl text-center text-gray-700 mb-8 max-w-3xl mx-auto">
            No matter what pose the model is originally in or what clothes they wear, our AI delivers the most natural and realistic results possible. 
            Human models, anime models, any outfits are all supported.
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <ImageComparisonSlider 
              beforeImage="/clothes-removers-examples/example0-before.jpg"
              afterImage="/clothes-removers-examples/example0-after.png"
              beforeAlt="Before Example 1"
              afterAlt="After Example 1"
            />
            
            <ImageComparisonSlider 
              beforeImage="/clothes-removers-examples/example1-before.jpg"
              afterImage="/clothes-removers-examples/example1-after.png"
              beforeAlt="Before Example 2"
              afterAlt="After Example 2"
            />
            
            <ImageComparisonSlider 
              beforeImage="/clothes-removers-examples/example2-before.webp"
              afterImage="/clothes-removers-examples/example2-after.png"
              beforeAlt="Before Example 3"
              afterAlt="After Example 3"
            />
            
            <ImageComparisonSlider 
              beforeImage="/clothes-removers-examples/example3-before.jpg"
              afterImage="/clothes-removers-examples/example3-after.png"
              beforeAlt="Before Example 4"
              afterAlt="After Example 4"
            />
          </div>
        </div>
        
        {/* Other Features */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-center mb-8">Explore Our Other Features</h2>
          <div className="max-w-4xl mx-auto bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl p-8 shadow-md">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="md:w-1/2">
                <Image
                  src="/how-it-works.png" 
                  alt="Cum Face Generator Example"
                  width={960}
                  height={540}
                  className="rounded-lg shadow-md"
                />
              </div>
              <div className="md:w-2/3">
                <h3 className="text-xl font-bold mb-3">Cum Face Generator</h3>
                <p className="text-gray-700 mb-4">
                  Transform any portrait into a realistic cum face with our advanced AI technology. 
                  Upload any face photo and our AI will generate a hyper-realistic result in seconds.
                </p>
                <Link href="/editor" className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
                  Try Cum Face Generator
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
        
        {/* FAQ Section */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="faq-1">
                <AccordionTrigger className="text-left">Is it free?</AccordionTrigger>
                <AccordionContent>
                  Yes, we provide a free tier of 3 credits. Click the button on the top right to get started.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="faq-2">
                <AccordionTrigger className="text-left">How many credits does each generation cost?</AccordionTrigger>
                <AccordionContent>
                  Each clothes removal generation costs 1 credit. You can purchase credits in our pricing section, with discounts available for bulk purchases.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="faq-2">
                <AccordionTrigger className="text-left">What is the quality of the results?</AccordionTrigger>
                <AccordionContent>
                  Our AI is based on the latest and most advanced models, so you can expect the best quality, most natural results.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="faq-3">
                <AccordionTrigger className="text-left">Is my data private and secure?</AccordionTrigger>
                <AccordionContent>
                  Yes, we take privacy very seriously. Your uploaded images and generated results are stored securely and are only accessible to you. We do not share or use your images for training our models.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="faq-4">
                <AccordionTrigger className="text-left">What types of images work best?</AccordionTrigger>
                <AccordionContent>
                  Our AI works best with clear, well-lit images where the subject is clearly visible. Front-facing poses typically yield the best results. Complex patterns, loose clothing, or unusual poses may affect the quality of the output.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
        
        {/* CTA */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Ready to Try It Yourself?</h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Upload your image now and see the magic happen in seconds!
          </p>
          <Button 
            className="px-8 py-6 text-lg"
            onClick={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            Start Removing Clothes Now
          </Button>
        </div>
      </div>
    </div>
  )
}