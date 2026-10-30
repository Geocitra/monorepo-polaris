import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';
  const now = new Date();

  // 1. Rute Statis Platform Utama POLARIS
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/tentang`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/solusi`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/platform`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/konsultasi`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ];

  // 2. Rute Multi-Tenant Portal Dewan (Beranda, Profil, Artikel, Infografis, Kontak)
  const tenantSlugs = ['ahmadfauzi'];
  const tenantRoutes: MetadataRoute.Sitemap = [];

  for (const slug of tenantSlugs) {
    tenantRoutes.push(
      {
        url: `${baseUrl}/${slug}`,
        lastModified: now,
        changeFrequency: 'daily',
        priority: 0.9,
      },
      {
        url: `${baseUrl}/${slug}/profil`,
        lastModified: now,
        changeFrequency: 'weekly',
        priority: 0.9,
      },
      {
        url: `${baseUrl}/${slug}/artikel`,
        lastModified: now,
        changeFrequency: 'daily',
        priority: 0.9,
      },
      {
        url: `${baseUrl}/${slug}/infografis`,
        lastModified: now,
        changeFrequency: 'weekly',
        priority: 0.8,
      },
      {
        url: `${baseUrl}/${slug}/kontak`,
        lastModified: now,
        changeFrequency: 'monthly',
        priority: 0.7,
      }
    );

    // Artikel Publik Dewan (Termasuk Data Riil dari Database)
    const articles = [
      'buatkan-artikel-tentang-kemiskinan-67fffbcd',
      'buatkan-artikel-tentang-asap-karhutla-4cf9c438',
      'buatkan-artikel-tentang-korupsi-c59c8f9a',
      'optimalisasi-infografis-publik-untuk-penanggulanga-78a76a4a',
      'undang-undang-cipta-kerja-dampak-bagi-umkm',
      'sosialisasi-pendidikan-karakter-di-sekolah',
      'kajian-alokasi-apbd-pemulihan-ekonomi',
      'transformasi-digital-aspirasi-parlemen',
    ];

    for (const artSlug of articles) {
      tenantRoutes.push({
        url: `${baseUrl}/${slug}/artikel/${artSlug}`,
        lastModified: now,
        changeFrequency: 'weekly',
        priority: 0.8,
      });
    }
  }

  return [...staticRoutes, ...tenantRoutes];
}
