const { SitemapStream, streamToPromise } = require('sitemap');
const { Readable } = require('stream');
const Blog = require('../models/Blog');

const generateSitemap = async (hostname) => {
  try {
    const blogs = await Blog.find({ status: 'published' })
      .select('slug updatedAt title category')
      .lean();

    const stream = new SitemapStream({ hostname });

    // Main sections with high priority
    stream.write({
      url: '/',
      changefreq: 'daily',
      priority: 1.0,
      lastmod: new Date().toISOString()
    });

    // Main branch sections
    const sections = [
      { url: '/trending', priority: 0.9 },
      { url: '/treasure', priority: 0.9 },
      { url: '/recent', priority: 0.8 }
    ];

    sections.forEach(section => {
      stream.write({
        ...section,
        changefreq: 'daily',
        lastmod: new Date().toISOString()
      });
    });

    // Group blogs by category for better crawling
    const categorizedBlogs = blogs.reduce((acc, blog) => {
      if (!acc[blog.category]) {
        acc[blog.category] = [];
      }
      acc[blog.category].push(blog);
      return acc;
    }, {});

    // Add blogs with category context
    Object.entries(categorizedBlogs).forEach(([category, categoryBlogs]) => {
      categoryBlogs.forEach(blog => {
        stream.write({
          url: `/blog/${blog.slug}`,
          changefreq: 'weekly',
          priority: 0.7,
          lastmod: blog.updatedAt,
          links: [
            { lang: 'en', url: `/blog/${blog.slug}` },
            { lang: 'x-default', url: `/blog/${blog.slug}` }
          ],
          news: {
            publication: {
              name: 'GDG PDEA Blog',
              language: 'en'
            },
            publication_date: blog.updatedAt,
            title: blog.title
          }
        });
      });
    });

    stream.end();
    return streamToPromise(Readable.from(stream)).then(data => data.toString());
  } catch (error) {
    console.error('Error generating sitemap:', error);
    throw error;
  }
};

module.exports = generateSitemap;
