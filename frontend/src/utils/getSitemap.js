import axios from 'axios';
import fs from 'fs';
import path from 'path';

// Cache mechanism
let sitemapCache = null;
let lastGenerated = null;
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

const fetchDynamicUrls = async (apiUrl) => {
  try {
    // Fetch blogs
    const blogsResponse = await fetch(`${apiUrl}/blogs`);
    const blogsData = await blogsResponse.json();
    const blogUrls = blogsData.blogs.map(blog => `/blog/${blog._id}`);

    // Fetch users
    const usersResponse = await fetch(`${apiUrl}/users`);
    const usersData = await usersResponse.json();
    const userUrls = usersData.users.map(user => `/profile/${user._id}`);

    return [...blogUrls, ...userUrls];
  } catch (error) {
    console.error('Error fetching dynamic URLs:', error);
    return [];
  }
};

// Static routes that should always be in the sitemap
const staticRoutes = [
  '/',
  '/trending',
  '/treasure',
  '/recent',
  '/login',
  '/signup'
];

export const generateSitemap = async (siteUrl = 'http://localhost:5173', apiUrl = 'http://localhost:5000/api') => {
  // Return cached version if valid
  if (sitemapCache && lastGenerated && (Date.now() - lastGenerated) < CACHE_DURATION) {
    return sitemapCache;
  }

  const dynamicUrls = await fetchDynamicUrls(apiUrl);
  const allUrls = [...staticRoutes, ...dynamicUrls];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${allUrls.map(url => `
    <url>
      <loc>${siteUrl}${url}</loc>
      <lastmod>${new Date().toISOString()}</lastmod>
      <changefreq>daily</changefreq>
      <priority>${url === '/' ? '1.0' : '0.8'}</priority>
    </url>
  `).join('')}
</urlset>`;

  // Write sitemap to public directory
  const publicDir = path.join(process.cwd(), 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  fs.writeFileSync(
    path.join(publicDir, 'sitemap.xml'),
    sitemap
  );

  // Update cache
  sitemapCache = sitemap;
  lastGenerated = Date.now();

  return sitemap;
};

// Auto-refresh cache periodically
setInterval(() => {
  const siteUrl = process.env.VITE_APP_URL || 'http://localhost:5173';
  const apiUrl = process.env.VITE_API_URL || 'http://localhost:5000/api';
  generateSitemap(siteUrl, apiUrl).catch(console.error);
}, CACHE_DURATION);

// Generate sitemap on startup
generateSitemap().catch(console.error);

// Replace filesystem paths with URL paths
const DEFAULT_PROFILE_IMAGE = new URL('/images/profile_administrator.webp', import.meta.url).href;
