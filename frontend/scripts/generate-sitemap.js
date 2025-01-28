import { generateSitemap } from '../src/utils/getSitemap.js';

async function main() {
  try {
    console.log('Generating sitemap...');
    await generateSitemap();
    console.log('Sitemap generated successfully!');
  } catch (error) {
    console.error('Error generating sitemap:', error);
    process.exit(1);
  }
}

main();
