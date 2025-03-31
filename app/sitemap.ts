import { MetadataRoute } from 'next'
import landingPageData from './tools/[generator-title]/enhanced_results_with_prompts_nsfw_image_gend.json'

export default function sitemap(): MetadataRoute.Sitemap {
  // Base URLs
  const baseUrls = [
    {
      url: 'https://www.cumfaceai.com',
      lastModified: new Date(),
      priority: 1,
    },
    {
      url: 'https://www.cumfaceai.com/clothes-remover',
      lastModified: new Date(),
    },
    {
      url: 'https://www.cumfaceai.com/blog/how-to-generate-cum-face-easy-2025',
      lastModified: new Date(),
    },
    {
      url: 'https://www.cumfaceai.com/blog/how-to-remove-clothes-with-ai-2025',
      lastModified: new Date(),
    },
    {
      url: 'https://www.cumfaceai.com/NSFW-generator',
      lastModified: new Date(),
    },
    {
      url: 'https://www.cumfaceai.com/ai-nsfw-api',
      lastModified: new Date(),
    },
    {
      url: 'https://www.cumfaceai.com/blog/top-nsfw-ai-image-generators-2025',
      lastModified: new Date(),
    },
  ]

  // Generate dynamic URLs from generator titles in landingPageData
  const dynamicUrls = (landingPageData as Array<{ title: string }>).map(item => {
    // Format the title to match the URL structure (lowercase, spaces to hyphens)
    const formattedTitle = item.title.toLowerCase().replace(/ /g, '-').replace(/:/g, '-')
    
    return {
      url: `https://www.cumfaceai.com/tools/${formattedTitle}`,
      lastModified: new Date(),
    }
  })

  // Combine base URLs with dynamic URLs
  return [...baseUrls, ...dynamicUrls]
}
