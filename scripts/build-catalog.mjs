import { access, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getCategoryPath, getProductPath } from '../src/utils/routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const siteRoot = path.resolve(__dirname, '..');
const publicDir = path.join(siteRoot, 'public');
const catalogDir = path.join(publicDir, 'catalog');
const sourceCandidates = [
  path.join(siteRoot, 'data', 'products.json'),
  path.join(siteRoot, 'src', 'data', 'products.json'),
  path.join(publicDir, 'products.json'),
];
const chunkSize = 250;
const baseUrl = 'https://saucytits.com';

async function resolveSourcePath() {
  for (const candidate of sourceCandidates) {
    try {
      await access(candidate);
      return candidate;
    } catch {
      // Try the next location.
    }
  }

  throw new Error(`Unable to find a products source file. Checked: ${sourceCandidates.join(', ')}`);
}

function chunkItems(items, size) {
  const chunks = [];

  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }

  return chunks;
}

async function writeChunkSet(items, subdirectories, { onChunkWritten } = {}) {
  const directory = path.join(catalogDir, ...subdirectories);
  await mkdir(directory, { recursive: true });

  const chunks = chunkItems(items, chunkSize);
  const paths = [];

  for (const [index, chunk] of chunks.entries()) {
    const fileName = `chunk-${String(index + 1).padStart(3, '0')}.json`;
    const filePath = path.join(directory, fileName);
    const publicPath = `/${['catalog', ...subdirectories, fileName].join('/')}`;
    await writeFile(filePath, JSON.stringify(chunk));
    paths.push(publicPath);

    if (onChunkWritten) {
      onChunkWritten(chunk, publicPath);
    }
  }

  return paths;
}

async function writeSitemap(categories, products) {
  const today = new Date().toISOString().slice(0, 10);
  const sitemapEntries = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    '  <url>',
    `    <loc>${baseUrl}/</loc>`,
    `    <lastmod>${today}</lastmod>`,
    '    <changefreq>daily</changefreq>',
    '    <priority>1.0</priority>',
    '  </url>',
  ];

  for (const category of categories) {
    sitemapEntries.push(
      '  <url>',
      `    <loc>${baseUrl}${getCategoryPath(category.slug)}</loc>`,
      `    <lastmod>${today}</lastmod>`,
      '    <changefreq>weekly</changefreq>',
      '    <priority>0.8</priority>',
      '  </url>',
    );
  }

  for (const product of products) {
    sitemapEntries.push(
      '  <url>',
      `    <loc>${baseUrl}${getProductPath(product)}</loc>`,
      `    <lastmod>${today}</lastmod>`,
      '    <changefreq>weekly</changefreq>',
      '    <priority>0.6</priority>',
      '  </url>',
    );
  }

  sitemapEntries.push('</urlset>');

  await writeFile(path.join(publicDir, 'sitemap.xml'), sitemapEntries.join('\n'));
}

async function main() {
  const sourcePath = await resolveSourcePath();
  const raw = await readFile(sourcePath, 'utf8');
  const products = JSON.parse(raw);

  if (!Array.isArray(products)) {
    throw new Error(`Expected an array in ${sourcePath}`);
  }

  const categories = Array.from(
    new Set(products.map((product) => product.category).filter(Boolean)),
  ).sort();

  await rm(catalogDir, { recursive: true, force: true });
  const productMap = {};
  const allPaths = await writeChunkSet(products, ['all'], {
    onChunkWritten(chunk, publicPath) {
      for (const product of chunk) {
        productMap[product.id] = {
          category: product.category || 'general',
          allChunkPath: publicPath,
        };
      }
    },
  });
  const categoryEntries = [];

  for (const category of categories) {
    const categoryProducts = products.filter((product) => product.category === category);
    const safeCategory = encodeURIComponent(category);
    const paths = await writeChunkSet(categoryProducts, ['categories', safeCategory], {
      onChunkWritten(chunk, publicPath) {
        for (const product of chunk) {
          if (productMap[product.id]) {
            productMap[product.id].categoryChunkPath = publicPath;
          }
        }
      },
    });

    categoryEntries.push({
      slug: category,
      count: categoryProducts.length,
      paths,
      pagePath: getCategoryPath(category),
    });
  }

  for (const product of products) {
    if (!productMap[product.id]?.categoryChunkPath) {
      productMap[product.id].categoryChunkPath = productMap[product.id].allChunkPath;
    }
  }

  const catalogIndex = {
    generatedAt: new Date().toISOString(),
    totalProducts: products.length,
    chunkSize,
    all: {
      count: products.length,
      paths: allPaths,
      pagePath: '/',
    },
    categories: categoryEntries,
  };

  await mkdir(catalogDir, { recursive: true });
  await writeFile(path.join(catalogDir, 'index.json'), JSON.stringify(catalogIndex, null, 2));
  await writeFile(path.join(catalogDir, 'product-map.json'), JSON.stringify(productMap));
  await writeSitemap(categoryEntries, products);

  console.log(`Catalog generated from ${path.relative(siteRoot, sourcePath)}`);
  console.log(`Products: ${products.length.toLocaleString()}`);
  console.log(`Categories: ${categoryEntries.length}`);
  console.log(`All chunks: ${allPaths.length}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
