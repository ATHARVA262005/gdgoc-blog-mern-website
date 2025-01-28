import axios from 'axios';

export async function generateSitemap() {
  try {
    const baseUrl = import.meta.env.VITE_APP_URL;
    
    // Fetch blogs from your API
    const response = await axios.get(`${import.meta.env.VITE_API_URL}/blogs`);
    const blogs = response.data.blogs || [];

    // Static routes
    const staticRoutes = [
      '',
      '/treasure',
      '/trending',
      '/recent',
    ];

    // Generate XML
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${staticRoutes.map(route => `
    <url>
      <loc>${baseUrl}${route}</loc>
      <changefreq>daily</changefreq>
      <priority>${route === '' ? '1.0' : '0.8'}</priority>
    </url>
  `).join('')}
  ${blogs.map(blog => `
    <url>
      <loc>${baseUrl}/blog/${blog._id}</loc>
      <lastmod>${blog.updatedAt}</lastmod>
      <changefreq>weekly</changefreq>
      <priority>0.6</priority>
    </url>
  `).join('')}
</urlset>`;

    return sitemap.trim();
  } catch (error) {
    console.error('Error generating sitemap:', error);
    throw error;
  }
}
