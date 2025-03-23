import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
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
  ]
}
