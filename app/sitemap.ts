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
  ]
}
