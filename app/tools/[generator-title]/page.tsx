import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import landingPageData from './enhanced_results_with_prompts_nsfw_image_gend.json';
import { Metadata, ResolvingMetadata } from 'next';
import Script from 'next/script';
import { EditorFooter } from '@/app/components/EditorFooter';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Types for our landing page data
interface LandingPageRecord {
  title: string;
  title_rewrite: string;
  subtitle_rewrite: string;
  main_image_gend?: string;
  how_to_use_title_rewrite: string;
  how_to_step1_title_rewrite: string;
  how_to_step1_content_rewrite: string;
  how_to_step1_image_gend?: string;
  how_to_step2_title_rewrite: string;
  how_to_step2_content_rewrite: string;
  how_to_step2_image_gend?: string;
  how_to_step3_title_rewrite: string;
  how_to_step3_content_rewrite: string;
  how_to_step3_image_gend?: string;
  feature1_title_rewrite: string;
  feature1_content_rewrite: string;
  feature1_image_gend?: string;
  feature2_title_rewrite: string;
  feature2_content_rewrite: string;
  feature2_image_gend?: string;
  feature3_title_rewrite: string;
  feature3_content_rewrite: string;
  feature3_image_gend?: string;
  faq_rewrite: string;
  faq?: string;
  faq_dict?: Record<string, string>;
  cta_title_rewrite: string;
  cta_content_rewrite: string;
  title_seo?: string;
  description_seo?: string;
  prefill_prompt?: string;
}

// Function to convert "**text**" to "<strong>text</strong>"
const formatBoldText = (text: string): string => {
  if (!text) return '';
  return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
};

// Function to render content with bold formatting
const renderContent = (content: string): { __html: string } => {
  return { __html: formatBoldText(content) };
};

// Function to generate the target URL with prefill prompt parameter
const generateTargetUrl = (prefillPrompt?: string): string => {
  // Default to /tools if no prefill prompt is available
  if (!prefillPrompt) return '/NSFW-generator';
  
  // Create the URL with the prefill_prompt parameter
  return `/NSFW-generator?prefill_prompt=${encodeURIComponent(prefillPrompt)}`;
};

// Function to generate the header for the generator page
function GeneratorHeader({ title, hasFaq, prefillPrompt }: { title?: string; hasFaq?: boolean; prefillPrompt?: string }) {
  return (
    <header className="w-full py-6 px-4 sm:px-6 lg:px-8 bg-white border-b">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-primary flex items-center gap-2">
          <Image
            src="/logo/logo.png"
            alt="HappyFace AI Logo"
            width={32}
            height={32}
          />
          Cum Face AI
        </Link>
        <nav className="hidden md:flex items-center space-x-1">
          {/* Direct navigation links styled like buttons for consistency */}
          <Button variant="ghost" asChild className="px-2">
            <Link href="#how-it-works">How It Works</Link>
          </Button>
          
          {hasFaq && (
            <Button variant="ghost" asChild className="px-2">
              <Link href="#faq">FAQ</Link>
            </Button>
          )}
          
          {/* AI Tools dropdown using Shadcn */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="px-2">
                AI Tools
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 max-h-96 overflow-y-auto">
              {landingPageData.map((tool, index) => (
                <DropdownMenuItem key={index} asChild>
                  <Link 
                    href={`/tools/${tool.title.toLowerCase().replace(/ /g, '-').replace(/:/g, '-')}`}
                    className="w-full"
                  >
                    {tool.title}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>
        {/* CTA Button */}
        <Button asChild className="bg-purple-600 hover:bg-purple-700 text-white">
          <Link href={generateTargetUrl(prefillPrompt)}>Try It Now</Link>
        </Button>
      </div>
    </header>
  );
}

// Generate metadata for the page
export async function generateMetadata(
  props: { params: Promise<{ 'generator-title': string }> },
  parent: ResolvingMetadata
): Promise<Metadata> {
  // Properly await the params object
  const params = await props.params;
  
  // Get the generator title from route params
  const generatorTitle = decodeURIComponent(params['generator-title']);
  
  // Find the matching record
  const pageData = (landingPageData as Array<any>).find(item => 
    item.title.toLowerCase().replace(/ /g, '-').replace(/:/g, '-') === generatorTitle.toLowerCase()
  );
  
  // If no page data is found, return basic metadata
  if (!pageData) {
    return {
      title: 'AI Generator | Tool not found',
      description: 'This AI generator tool cannot be found.'
    };
  }

  // Get the SEO title and description, or fallback to regular title/subtitle
  const title = pageData.title_seo || pageData.title_rewrite;
  const description = pageData.description_seo || pageData.subtitle_rewrite;
  
  // Strip HTML tags for clean meta description
  const cleanDescription = description.replace(/<\/?[^>]+(>|$)/g, '');
  
  // Create canonical URL
  const baseUrl = 'https://cumfaceai.com';
  const canonicalUrl = `${baseUrl}/tools/${encodeURIComponent(generatorTitle.toLowerCase())}`;
  
  return {
    title: title,
    description: cleanDescription,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: title,
      description: cleanDescription,
      url: canonicalUrl,
      images: pageData.main_image_gend ? [pageData.main_image_gend] : undefined,
      siteName: 'Cum Face AI Generators',
    },
    twitter: {
      card: 'summary_large_image',
      title: title,
      description: cleanDescription,
      images: pageData.main_image_gend ? [pageData.main_image_gend] : undefined,
    },
  };
}

// This function gets called at request time
export default async function GeneratorPage(
  props: { params: Promise<{ 'generator-title': string }> }
) {
  // Properly await the params object
  const params = await props.params;

  // Get the generator title from route params
  const generatorTitle = decodeURIComponent(params['generator-title']);
  
  // Find the matching record based on title
  const pageData = (landingPageData as Array<any>).find(item => {
    // replace all spaces with '-'
    return item.title.toLowerCase().replace(/ /g, '-').replace(/:/g, '-') === generatorTitle.toLowerCase();
  });
  
  // If no matching record is found, return 404
  if (!pageData) {
    notFound();
  } else {
    // console.log('pageData', pageData);
  }
  
  // Check if FAQ exists
  const hasFaq = pageData.faq_dict && Object.keys(pageData.faq_dict).length > 0;
  
  // Placeholder image URL for missing images
  const placeholderImage = "https://placehold.co/600x400/1a2238/ffffff?text=AI+Generator";
  
  // Generate WebPage structured data for SEO
  const generateStructuredData = () => {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://cumfaceai.com';
    const canonicalUrl = `${baseUrl}/tools/${encodeURIComponent(generatorTitle.toLowerCase())}`;
    
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": pageData.title_seo || pageData.title_rewrite,
      "description": pageData.description_seo || pageData.subtitle_rewrite,
      "url": canonicalUrl,
      "image": pageData.main_image_gend || placeholderImage,
      "isPartOf": {
        "@type": "WebSite",
        "name": "HappyFace AI Generators",
        "url": baseUrl
      },
      "datePublished": new Date().toISOString().split('T')[0], // Current date in YYYY-MM-DD format
      "speakable": {
        "@type": "SpeakableSpecification",
        "cssSelector": ["h1", ".subtitle", "h2", "h3", "p"]
      },
      "potentialAction": {
        "@type": "UseAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": `${canonicalUrl}#try-it-now`
        },
        "name": "Try This AI Generator"
      }
    };

    return (
      <Script id="webpage-structured-data" type="application/ld+json">
        {JSON.stringify(structuredData)}
      </Script>
    );
  };
  
  return (
    <>
      <GeneratorHeader title={pageData.title_rewrite} hasFaq={hasFaq} prefillPrompt={pageData.prefill_prompt}/>
      <div className="landing-page">
        {/* Structured data for SEO */}
        {generateStructuredData()}
        
        {/* Hero Section */}
        <section className="hero bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-24">
          <div className="container mx-auto px-6 flex flex-col lg:flex-row items-center justify-between">
            <div className="lg:w-1/2 mb-10 lg:mb-0">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6"
                  dangerouslySetInnerHTML={renderContent(pageData.title)} />
              <div className="text-xl md:text-2xl mb-8 opacity-90"
                  dangerouslySetInnerHTML={renderContent(pageData.subtitle_rewrite)} />
              <div>
                <a href={generateTargetUrl(pageData.prefill_prompt)} className="bg-white text-indigo-700 font-semibold py-3 px-8 rounded-full shadow-lg hover:shadow-xl transition-all hover:bg-opacity-90">
                  Try It Now
                </a>
                <a href="#how-it-works" className="ml-4 text-white border-2 border-white font-semibold py-3 px-8 rounded-full hover:bg-white hover:text-indigo-700 transition-all">
                  Learn More
                </a>
              </div>
            </div>
            <div className="lg:w-1/2 flex justify-center">
              <div className="relative w-full max-w-xl rounded-2xl overflow-hidden shadow-2xl" style={{ aspectRatio: '1152/896' }}>
                <Image 
                  src={pageData.main_image_gend || placeholderImage}
                  alt={pageData.title}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
            </div>
          </div>
        </section>
        
        {/* How to Use Section */}
        <section id="how-it-works" className="py-20 bg-gray-50">
          <div className="container mx-auto px-6">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-gray-800"
                dangerouslySetInnerHTML={renderContent(pageData.how_to_use_title_rewrite)} />
            
            <div className="grid md:grid-cols-3 gap-10">
              {/* Step 1 */}
              <div className="bg-white rounded-xl shadow-lg p-8 transform transition-all hover:-translate-y-2 hover:shadow-xl">
                <div className="w-full h-48 mb-6 relative rounded-lg overflow-hidden">
                  <Image 
                    src={pageData.how_to_step1_image_gend || placeholderImage}
                    alt={pageData.how_to_step1_title_rewrite}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 font-bold text-xl mb-4">1</div>
                <h3 className="text-xl font-bold mb-3 text-gray-800"
                    dangerouslySetInnerHTML={renderContent(pageData.how_to_step1_title_rewrite)} />
                <div className="text-gray-600"
                    dangerouslySetInnerHTML={renderContent(pageData.how_to_step1_content_rewrite)} />
              </div>
              
              {/* Step 2 */}
              <div className="bg-white rounded-xl shadow-lg p-8 transform transition-all hover:-translate-y-2 hover:shadow-xl">
                <div className="w-full h-48 mb-6 relative rounded-lg overflow-hidden">
                  <Image 
                    src={pageData.how_to_step2_image_gend || placeholderImage}
                    alt={pageData.how_to_step2_title_rewrite}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 font-bold text-xl mb-4">2</div>
                <h3 className="text-xl font-bold mb-3 text-gray-800"
                    dangerouslySetInnerHTML={renderContent(pageData.how_to_step2_title_rewrite)} />
                <div className="text-gray-600"
                    dangerouslySetInnerHTML={renderContent(pageData.how_to_step2_content_rewrite)} />
              </div>
              
              {/* Step 3 */}
              <div className="bg-white rounded-xl shadow-lg p-8 transform transition-all hover:-translate-y-2 hover:shadow-xl">
                <div className="w-full h-48 mb-6 relative rounded-lg overflow-hidden">
                  <Image 
                    src={pageData.how_to_step3_image_gend || placeholderImage}
                    alt={pageData.how_to_step3_title_rewrite}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 font-bold text-xl mb-4">3</div>
                <h3 className="text-xl font-bold mb-3 text-gray-800"
                    dangerouslySetInnerHTML={renderContent(pageData.how_to_step3_title_rewrite)} />
                <div className="text-gray-600"
                    dangerouslySetInnerHTML={renderContent(pageData.how_to_step3_content_rewrite)} />
              </div>
            </div>
          </div>
        </section>
        
        {/* Features Section */}
        <section className="py-20">
          <div className="container mx-auto px-6">
            {/* Feature 1 */}
            <div className="flex flex-col lg:flex-row items-center mb-20">
              <div className="lg:w-1/2 lg:pr-10 mb-10 lg:mb-0">
                <h3 className="text-3xl font-bold mb-6 text-gray-800"
                    dangerouslySetInnerHTML={renderContent(pageData.feature1_title_rewrite)} />
                <div className="text-lg text-gray-600"
                    dangerouslySetInnerHTML={renderContent(pageData.feature1_content_rewrite)} />
              </div>
              <div className="lg:w-1/2">
                <div className="relative w-full rounded-xl overflow-hidden shadow-xl" style={{ aspectRatio: '1/1' }}>
                  <Image 
                    src={pageData.feature1_image_gend || placeholderImage}
                    alt={pageData.feature1_title_rewrite}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
              </div>
            </div>
            
            {/* Feature 2 */}
            <div className="flex flex-col-reverse lg:flex-row items-center mb-20">
              <div className="lg:w-1/2">
                <div className="relative w-full rounded-xl overflow-hidden shadow-xl" style={{ aspectRatio: '1/1' }}>
                  <Image 
                    src={pageData.feature2_image_gend || placeholderImage}
                    alt={pageData.feature2_title_rewrite}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
              </div>
              <div className="lg:w-1/2 lg:pl-10 mb-10 lg:mb-0">
                <h3 className="text-3xl font-bold mb-6 text-gray-800"
                    dangerouslySetInnerHTML={renderContent(pageData.feature2_title_rewrite)} />
                <div className="text-lg text-gray-600"
                    dangerouslySetInnerHTML={renderContent(pageData.feature2_content_rewrite)} />
              </div>
            </div>
            
            {/* Feature 3 */}
            <div className="flex flex-col lg:flex-row items-center">
              <div className="lg:w-1/2 lg:pr-10 mb-10 lg:mb-0">
                <h3 className="text-3xl font-bold mb-6 text-gray-800"
                    dangerouslySetInnerHTML={renderContent(pageData.feature3_title_rewrite)} />
                <div className="text-lg text-gray-600"
                    dangerouslySetInnerHTML={renderContent(pageData.feature3_content_rewrite)} />
              </div>
              <div className="lg:w-1/2">
                <div className="relative w-full rounded-xl overflow-hidden shadow-xl" style={{ aspectRatio: '1/1' }}>
                  <Image 
                    src={pageData.feature3_image_gend || placeholderImage}
                    alt={pageData.feature3_title_rewrite}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* FAQ Section */}
        {pageData.faq_dict && Object.keys(pageData.faq_dict).length > 0 && (
          <section id="faq" className="py-20 bg-gray-50">
            <div className="container mx-auto px-6">
              <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-gray-800"
                  dangerouslySetInnerHTML={renderContent("Frequently Asked Questions")} />
              
              <div className="max-w-3xl mx-auto">
                {Object.entries(pageData.faq_dict).map(([question, answer], index) => (
                  <div key={index} className="mb-8">
                    <h3 className="text-xl font-semibold mb-3 text-gray-800">{question}</h3>
                    <div className="text-gray-600" dangerouslySetInnerHTML={renderContent(String(answer))} />
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
        
        {/* Discover More Section */}
        <section className="py-12 bg-black text-white">
          <div className="container mx-auto px-6">
            <h2 className="text-3xl font-bold mb-10">Discover more:</h2>
            
            <div className="flex flex-wrap gap-2">
              {/* Special tools with custom links */}
              <Link href="/editor" className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-md text-sm md:text-base transition-colors">
                Cum Face Generator
              </Link>
              <Link href="/clothes-remover" className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-md text-sm md:text-base transition-colors">
                Clothes Remover
              </Link>
              
              {/* Dynamically generate tags for all AI tools from landingPageData */}
              {landingPageData.map((tool, index) => (
                <Link 
                  href={`/tools/${tool.title.toLowerCase().replace(/ /g, '-').replace(/:/g, '-')}`}
                  key={index}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-md text-sm md:text-base transition-colors"
                >
                  {tool.title}
                </Link>
              ))}
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-8"
                dangerouslySetInnerHTML={renderContent(pageData.cta_title_rewrite)} />
            <div className="text-xl max-w-3xl mx-auto mb-10 opacity-90"
                dangerouslySetInnerHTML={renderContent(pageData.cta_content_rewrite)} />
            <a href={generateTargetUrl(pageData.prefill_prompt)} className="bg-white text-indigo-700 font-semibold py-3 px-8 rounded-full shadow-lg hover:shadow-xl transition-all hover:bg-opacity-90">
              Try It Now
            </a>
          </div>
        </section>

        {/* More from Cum Face AI Section */}
        <section className="py-16 bg-black text-white">
          <div className="container mx-auto px-6">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">More From Cum Face AI</h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              {/* Randomly select 3 tools from landingPageData */}
              {(() => {
                // Create a shuffled copy of the landingPageData array
                const shuffled = [...landingPageData].sort(() => 0.5 - Math.random());
                // Get the first 3 items (or fewer if there are less than 3 items)
                const selectedTools = shuffled.slice(0, 3);
                
                return selectedTools.map((tool, index) => {
                  // Get a clean URL-friendly version of the title
                  const toolUrl = `/tools/${tool.title.toLowerCase().replace(/ /g, '-').replace(/:/g, '-')}`;
                  
                  return (
                    <Link href={toolUrl} key={index} className="block">
                      <div className="bg-zinc-900 rounded-lg overflow-hidden transition-transform hover:scale-[1.02] hover:shadow-xl">
                        {/* Tool Image */}
                        <div className="relative w-full" style={{ aspectRatio: '16/9' }}>
                          <Image 
                            src={tool.main_image_gend || placeholderImage}
                            alt={tool.title}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
                          />
                        </div>
                        
                        {/* Tool Content */}
                        <div className="p-6">
                          <h3 className="text-xl font-bold mb-3">{tool.title}</h3>
                          <p className="text-gray-300 line-clamp-3">
                            {tool.subtitle_rewrite.replace(/<\/?[^>]+(>|$)/g, '')}
                          </p>
                        </div>
                      </div>
                    </Link>
                  );
                });
              })()}
            </div>
          </div>
        </section>
        
        <EditorFooter />
      </div>
    </>
  );
}

// Generate static paths for all landing pages
export async function generateStaticParams() {
  return (landingPageData as Array<{ title: string }>).map((item) => ({
    'generator-title': item.title.toLowerCase().replace(/ /g, '-').replace(/:/g, '-'),
  }));
}
