import type { MetadataRoute } from 'next'

/**
 * Sitemap dinámico para Trello Clone
 * Genera URLs para páginas públicas e indexables
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || 'https://trello-clone.example.com'

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/boards`,
      lastModified: new Date(),
      changeFrequency: 'always',
      priority: 0.9,
    },
    // Note: Individual board pages are dynamic and require authentication
    // They should be excluded from sitemap as they're private content
  ]
}
