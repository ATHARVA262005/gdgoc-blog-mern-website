import { writeFileSync } from 'fs';
import { generateSitemap } from '../src/utils/getSitemap.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function writeSitemap() {
  try {
    const sitemap = await generateSitemap();
    const outputPath = path.join(__dirname, '../public/sitemap.xml');
    writeFileSync(outputPath, sitemap);
    console.log('Sitemap generated successfully at:', outputPath);
  } catch (error) {
    console.error('Error writing sitemap:', error);
    process.exit(1);
  }
}

writeSitemap();
