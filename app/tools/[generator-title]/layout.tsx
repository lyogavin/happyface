import type { Metadata, ResolvingMetadata } from "next"
import { Inter } from "next/font/google"
import type React from "react"
import landingPageData from './enhanced_results_with_prompts_nsfw_rewritten.json'

const inter = Inter({ subsets: ["latin"] })

// Types for our landing page data
interface LandingPageRecord {
  title: string;
  subtitle_rewrite: string;
  title_seo?: string;
  description_seo?: string;
  main_image_gend?: string;
  // Other fields not needed for metadata
}

// Generate metadata for the page
export async function generateMetadata(
  { params }: { params: Promise<{ 'generator-title': string }> | undefined },
  parent: ResolvingMetadata
): Promise<Metadata> {
  try {
    // Await the params object before accessing its properties
    const resolvedParams = await params;
    const generatorTitle = decodeURIComponent(resolvedParams ? resolvedParams['generator-title'] || '' : '');
    
    // Find the matching record
    const pageData = (landingPageData as LandingPageRecord[]).find(item => 
      item.title.toLowerCase().replace(/ /g, '-').replace(/:/g, '-') === generatorTitle.toLowerCase()
    );
    
    // If no page data is found, return basic metadata
    if (!pageData) {
      return {
        title: 'AI Generator Tool | CumFace AI',
        description: 'Create amazing AI-generated content with our powerful AI tools.',
        robots: {
          index: true,
          follow: true,
        }
      };
    }

    // Get the SEO title and description, or fallback to regular title/subtitle
    const title = pageData.title_seo || pageData.title;
    const description = pageData.description_seo || pageData.subtitle_rewrite;
    
    // Strip HTML tags for clean meta description
    const cleanDescription = description.replace(/<\/?[^>]+(>|$)/g, '');
    
    // Create canonical URL
    const baseUrl = 'https://www.cumfaceai.com';
    const canonicalPath = `tools/${encodeURIComponent(generatorTitle.toLowerCase())}`;
    const canonicalUrl = `${baseUrl}/${canonicalPath}`;
    
    return {
      title: title,
      description: cleanDescription,
      keywords: `AI generator, ${title.toLowerCase()}, AI tools, image generator, content creator, AI-powered tools`,
      openGraph: {
        title: `${title}: Create Amazing Content with Our Advanced AI Tools`,
        description: cleanDescription,
        url: canonicalUrl,
        images: pageData.main_image_gend ? [pageData.main_image_gend] : ['/tools-cover.jpg'],
        siteName: 'CumFace AI Generators',
      },
      twitter: {
        card: 'summary_large_image',
        title: title,
        description: cleanDescription,
        images: pageData.main_image_gend ? [pageData.main_image_gend] : ['/tools-cover.jpg'],
      },
      alternates: {
        canonical: canonicalUrl,
      },
      robots: {
        index: true,
        follow: true,
      },
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: 'AI Generator Tool | CumFace AI',
      description: 'Create amazing AI-generated content with our powerful AI tools.',
      robots: {
        index: true,
        follow: true,
      }
    };
  }
}

export default function ToolsGeneratorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}
