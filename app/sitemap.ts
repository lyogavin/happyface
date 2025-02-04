import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://cumfaceai.com',
      lastModified: new Date(),
      priority: 1,
    },
  ]
}
