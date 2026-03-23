import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getCategoryLabel } from '../src/utils/categories.js';
import { hasProductOutboundUrl } from '../src/utils/affiliateLink.js';
import { SITE_URL, getProductPath } from '../src/utils/routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const siteRoot = path.resolve(__dirname, '..');
const reportsDir = path.join(siteRoot, 'reports');
const sourceCandidates = [
  path.join(siteRoot, 'data', 'products.json'),
  path.join(siteRoot, 'src', 'data', 'products.json'),
  path.join(siteRoot, 'public', 'products.json'),
];

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

function escapeCsvValue(value) {
  const normalized = String(value ?? '');
  if (normalized.includes(',') || normalized.includes('"') || normalized.includes('\n')) {
    return `"${normalized.replace(/"/g, '""')}"`;
  }

  return normalized;
}

function toCsv(rows) {
  return rows.map((row) => row.map(escapeCsvValue).join(',')).join('\n');
}

function formatDate(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

function sortMissingProducts(products) {
  return [...products].sort((left, right) => {
    if (left.category !== right.category) {
      return left.category.localeCompare(right.category);
    }

    return left.title.localeCompare(right.title);
  });
}

async function main() {
  const sourcePath = await resolveSourcePath();
  const raw = await readFile(sourcePath, 'utf8');
  const products = JSON.parse(raw);

  if (!Array.isArray(products)) {
    throw new Error(`Expected an array in ${sourcePath}`);
  }

  const missingProducts = sortMissingProducts(
    products.filter((product) => !hasProductOutboundUrl(product)),
  );

  const countsByCategory = missingProducts.reduce((accumulator, product) => {
    const key = product.category || 'uncategorized';
    accumulator[key] = (accumulator[key] || 0) + 1;
    return accumulator;
  }, {});

  const sortedCategoryCounts = Object.entries(countsByCategory)
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]));

  const csvRows = [
    [
      'id',
      'title',
      'category',
      'categoryLabel',
      'price',
      'productPageUrl',
      'amazonAsin',
      'productLink',
      'missingReason',
    ],
    ...missingProducts.map((product) => [
      product.id,
      product.title,
      product.category || '',
      getCategoryLabel(product.category || 'all'),
      product.price || '',
      `${SITE_URL}${getProductPath(product)}`,
      product.amazonAsin || '',
      product.productLink || '',
      'Missing amazonAsin and productLink',
    ]),
  ];

  const previewLines = missingProducts
    .slice(0, 20)
    .map((product) => `| ${product.id} | ${product.title.replace(/\|/g, '\\|')} | ${getCategoryLabel(product.category || 'all')} | ${product.price || '-'} | ${SITE_URL}${getProductPath(product)} |`)
    .join('\n');

  const markdown = [
    '# Missing Outbound Link Report',
    '',
    `Generated: ${formatDate()}`,
    `Source: \`${path.relative(siteRoot, sourcePath)}\``,
    '',
    `Total products missing a direct outbound link: **${missingProducts.length}**`,
    '',
    '## Counts By Category',
    '',
    ...sortedCategoryCounts.map(([category, count]) => `- ${getCategoryLabel(category)}: ${count}`),
    '',
    '## Preview',
    '',
    '| ID | Title | Category | Price | Product Page |',
    '| --- | --- | --- | --- | --- |',
    previewLines,
    '',
    `Full CSV: \`reports/missing-outbound-links.csv\``,
  ].join('\n');

  await mkdir(reportsDir, { recursive: true });
  await writeFile(path.join(reportsDir, 'missing-outbound-links.csv'), `${toCsv(csvRows)}\n`);
  await writeFile(path.join(reportsDir, 'missing-outbound-links.md'), `${markdown}\n`);

  console.log(`Missing outbound links: ${missingProducts.length}`);
  console.log(`CSV report: ${path.relative(siteRoot, path.join(reportsDir, 'missing-outbound-links.csv'))}`);
  console.log(`Markdown report: ${path.relative(siteRoot, path.join(reportsDir, 'missing-outbound-links.md'))}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
