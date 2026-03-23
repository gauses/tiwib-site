import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  getCategoryDescription,
  getCategoryIcon,
  getCategoryLabel,
} from '../src/utils/categories.js';
import {
  getProductOutboundCtaLabel,
  getProductOutboundDestination,
  getProductOutboundSupportText,
  getProductTrustHighlights,
  getProductOutboundUrl,
  hasProductOutboundUrl,
} from '../src/utils/affiliateLink.js';
import {
  ROUTE_DATA_ELEMENT_ID,
  SEO_SHELL_ID,
  SITE_URL,
  getCategoryPath,
  getCollectionPageMeta,
  getProductPageMeta,
  getProductPath,
} from '../src/utils/routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const siteRoot = path.resolve(__dirname, '..');
const distDir = path.join(siteRoot, 'dist');
const sourceCandidates = [
  path.join(siteRoot, 'data', 'products.json'),
  path.join(siteRoot, 'src', 'data', 'products.json'),
  path.join(siteRoot, 'public', 'products.json'),
];
const HOME_PREVIEW_LIMIT = 48;
const CATEGORY_PREVIEW_LIMIT = 60;
const RELATED_LIMIT = 4;
const WRITE_BATCH_SIZE = 250;

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeJsonForHtml(value) {
  return JSON.stringify(value)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026');
}

function escapeAttribute(value = '') {
  return escapeHtml(value);
}

function getTaglineLead(tagline, fallbackCopy) {
  const normalizedTagline = typeof tagline === 'string' ? tagline.trim() : '';

  if (!normalizedTagline) {
    return fallbackCopy;
  }

  const sentenceMatch = normalizedTagline.match(/^(.+?[.!?])(?:\s|$)/);
  const lead = sentenceMatch ? sentenceMatch[1] : normalizedTagline;

  return lead.length > 160 ? `${lead.slice(0, 157).trimEnd()}...` : lead;
}

function splitTaglineCopy(tagline, fallbackLead, fallbackBody = '') {
  const normalizedTagline = typeof tagline === 'string' ? tagline.trim() : '';

  if (!normalizedTagline) {
    return {
      lead: fallbackLead,
      body: fallbackBody,
    };
  }

  const sentenceMatch = normalizedTagline.match(/^(.+?[.!?])(?:\s+|$)([\s\S]*)$/);

  if (!sentenceMatch) {
    return {
      lead: normalizedTagline,
      body: '',
    };
  }

  return {
    lead: sentenceMatch[1].trim(),
    body: sentenceMatch[2].trim(),
  };
}

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

function replaceTagAttribute(html, tagRegex, attribute, value, fallbackTag) {
  const match = html.match(tagRegex);
  if (!match) {
    return html.replace('</head>', `${fallbackTag}\n</head>`);
  }

  const attributeRegex = new RegExp(`${attribute}=(["'])(.*?)\\1`, 'i');
  const updatedTag = match[0].replace(
    attributeRegex,
    `${attribute}="${escapeAttribute(value)}"`,
  );

  return html.replace(match[0], updatedTag);
}

function replaceHeadMeta(html, meta) {
  let nextHtml = html.replace(/<title>.*?<\/title>/is, `<title>${escapeHtml(meta.title)}</title>`);

  nextHtml = replaceTagAttribute(
    nextHtml,
    new RegExp(`<meta\\s+[^>]*name=["']description["'][^>]*>`, 'i'),
    'content',
    meta.description,
    `<meta name="description" content="${escapeAttribute(meta.description)}" />`,
  );

  nextHtml = replaceTagAttribute(
    nextHtml,
    new RegExp(`<meta\\s+[^>]*property=["']og:title["'][^>]*>`, 'i'),
    'content',
    meta.title,
    `<meta property="og:title" content="${escapeAttribute(meta.title)}" />`,
  );

  nextHtml = replaceTagAttribute(
    nextHtml,
    new RegExp(`<meta\\s+[^>]*property=["']og:description["'][^>]*>`, 'i'),
    'content',
    meta.description,
    `<meta property="og:description" content="${escapeAttribute(meta.description)}" />`,
  );

  nextHtml = replaceTagAttribute(
    nextHtml,
    new RegExp(`<meta\\s+[^>]*property=["']og:type["'][^>]*>`, 'i'),
    'content',
    meta.type,
    `<meta property="og:type" content="${escapeAttribute(meta.type)}" />`,
  );

  nextHtml = replaceTagAttribute(
    nextHtml,
    new RegExp(`<meta\\s+[^>]*property=["']og:url["'][^>]*>`, 'i'),
    'content',
    meta.canonicalUrl,
    `<meta property="og:url" content="${escapeAttribute(meta.canonicalUrl)}" />`,
  );

  nextHtml = replaceTagAttribute(
    nextHtml,
    new RegExp(`<meta\\s+[^>]*property=["']og:image["'][^>]*>`, 'i'),
    'content',
    meta.image,
    `<meta property="og:image" content="${escapeAttribute(meta.image)}" />`,
  );

  nextHtml = replaceTagAttribute(
    nextHtml,
    new RegExp(`<meta\\s+[^>]*property=["']twitter:title["'][^>]*>`, 'i'),
    'content',
    meta.title,
    `<meta property="twitter:title" content="${escapeAttribute(meta.title)}" />`,
  );

  nextHtml = replaceTagAttribute(
    nextHtml,
    new RegExp(`<meta\\s+[^>]*property=["']twitter:description["'][^>]*>`, 'i'),
    'content',
    meta.description,
    `<meta property="twitter:description" content="${escapeAttribute(meta.description)}" />`,
  );

  nextHtml = replaceTagAttribute(
    nextHtml,
    new RegExp(`<meta\\s+[^>]*property=["']twitter:url["'][^>]*>`, 'i'),
    'content',
    meta.canonicalUrl,
    `<meta property="twitter:url" content="${escapeAttribute(meta.canonicalUrl)}" />`,
  );

  nextHtml = replaceTagAttribute(
    nextHtml,
    new RegExp(`<meta\\s+[^>]*property=["']twitter:image["'][^>]*>`, 'i'),
    'content',
    meta.image,
    `<meta property="twitter:image" content="${escapeAttribute(meta.image)}" />`,
  );

  nextHtml = replaceTagAttribute(
    nextHtml,
    new RegExp(`<link\\s+[^>]*rel=["']canonical["'][^>]*>`, 'i'),
    'href',
    meta.canonicalUrl,
    `<link rel="canonical" href="${escapeAttribute(meta.canonicalUrl)}" />`,
  );

  return nextHtml;
}

function injectHeadScripts(html, jsonLd) {
  const escapedJsonLd = escapeJsonForHtml(jsonLd);
  return html.replace(
    '</head>',
    `  <script type="application/ld+json">${escapedJsonLd}</script>\n</head>`,
  );
}

function renderHeader() {
  return `
    <header class="header">
      <div class="header-container">
        <a href="/" class="logo" aria-label="Go to homepage">
          <span class="logo-icon">💸</span>
          <span class="logo-text">TIWIB</span>
        </a>
        <nav class="nav">
          <a href="/" class="nav-link">
            <span class="nav-label-desktop">Home</span>
            <span class="nav-label-mobile">Catalog</span>
          </a>
          <a href="${getCategoryPath('novelty')}" class="nav-link">
            <span class="nav-label-desktop">Popular Gifts</span>
            <span class="nav-label-mobile">Popular</span>
          </a>
        </nav>
      </div>
    </header>
  `;
}

function renderFooter() {
  const currentYear = new Date().getFullYear();

  return `
    <footer class="footer">
      <div class="footer-container">
        <div class="footer-content">
          <div class="footer-section">
            <h3 class="footer-title">TIWIB Niche</h3>
            <p class="footer-description">
              Curating the most interesting and creative products from around the world.
            </p>
          </div>

          <div class="footer-section">
            <h4 class="footer-heading">Quick Links</h4>
            <ul class="footer-links">
              <li><a href="/">Home</a></li>
              <li><a href="${getCategoryPath('novelty')}">${escapeHtml(getCategoryLabel('novelty'))}</a></li>
              <li><a href="${getCategoryPath('tech')}">${escapeHtml(getCategoryLabel('tech'))}</a></li>
              <li><a href="/sitemap.xml">Sitemap</a></li>
            </ul>
          </div>

          <div class="footer-section">
            <h4 class="footer-heading">Disclaimer</h4>
            <p class="footer-disclaimer">
              We are an Amazon Associate and may earn commissions from qualifying purchases.
            </p>
          </div>
        </div>

        <div class="footer-bottom">
          <p>&copy; ${currentYear} TIWIB Niche. All rights reserved.</p>
          <p class="footer-tagline">Making your wallet lighter since 2026 💸</p>
        </div>
      </div>
    </footer>
  `;
}

function renderCategoryFilter(categories, selectedCategory) {
  const items = [
    {
      href: getCategoryPath('all'),
      category: 'all',
    },
    ...categories.map((category) => ({
      href: getCategoryPath(category),
      category,
    })),
  ];

  const categoryItems = items.map(({ href, category }) => {
    const isActive = selectedCategory === category;

    return `
      <a
        href="${href}"
        class="filter-item ${isActive ? 'active' : ''}"
        ${isActive ? 'aria-current="page"' : ''}
      >
        <span class="item-icon">${escapeHtml(getCategoryIcon(category))}</span>
        <span class="item-label">${escapeHtml(getCategoryLabel(category))}</span>
      </a>
    `;
  }).join('\n');

  return `
    <div class="category-filter">
      <div class="container filter-container">
        <div class="filter-scroll">
          ${categoryItems}
        </div>
      </div>
    </div>
  `;
}

function renderProductCard(product) {
  const productPath = getProductPath(product);

  return `
    <article class="product-card">
      <div class="product-image-wrapper">
        <a href="${productPath}" class="product-card-link" aria-label="View details for ${escapeAttribute(product.title)}">
          <img
            src="${escapeAttribute(product.image)}"
            alt="${escapeAttribute(product.title)}"
            class="product-image"
            loading="lazy"
          />
        </a>
        ${product.featured ? '<span class="featured-badge">🔥 HOT</span>' : ''}
        ${product.category ? `<span class="category-badge">${escapeHtml(product.category)}</span>` : ''}
      </div>

      <div class="product-content">
        <h3 class="product-title">
          <a href="${productPath}" class="product-title-link">${escapeHtml(product.title)}</a>
        </h3>
        <p class="product-tagline">${escapeHtml(product.tagline || '')}</p>

        <div class="product-footer">
          <span class="product-price">${escapeHtml(product.price || 'See details')}</span>
          <a href="${productPath}" class="view-button">View Details</a>
        </div>
      </div>
    </article>
  `;
}

function renderCollectionSummary({
  selectedCategory = 'all',
  visibleCount,
  totalCount,
}) {
  const hasCategory = selectedCategory !== 'all';
  const categoryLabel = hasCategory ? getCategoryLabel(selectedCategory) : 'All Categories';
  const summaryTitle = hasCategory ? categoryLabel : 'Fresh picks from the full catalog';
  const summaryCopy = hasCategory
    ? `Previewing ${visibleCount.toLocaleString()} picks from ${totalCount.toLocaleString()} products in this category while the full catalog loads.`
    : `Previewing ${visibleCount.toLocaleString()} featured products from ${totalCount.toLocaleString()} items in the catalog while the full experience hydrates.`;

  return `
    <section class="collection-summary" aria-label="Browse summary">
      <div class="collection-summary-shell">
        <div class="collection-summary-copy">
          <p class="collection-summary-eyebrow">${hasCategory ? 'Category preview' : 'Catalog preview'}</p>
          <h2 class="collection-summary-title">${escapeHtml(summaryTitle)}</h2>
          <p class="collection-summary-text">${escapeHtml(summaryCopy)}</p>
        </div>

        <div class="collection-summary-chips">
          <span class="collection-summary-chip is-active">${escapeHtml(categoryLabel)}</span>
          <span class="collection-summary-chip">${visibleCount.toLocaleString()} visible</span>
          <span class="collection-summary-chip">${totalCount.toLocaleString()} total</span>
        </div>
      </div>
    </section>
  `;
}

function renderCollectionToolbar() {
  return `
    <section class="collection-toolbar" aria-label="Browse controls">
      <div class="collection-toolbar-shell">
        <div class="collection-toolbar-group">
          <span class="collection-toolbar-label">Sort by</span>
          <span class="collection-summary-chip is-active">Featured first</span>
        </div>

        <div class="collection-toolbar-group collection-toolbar-actions">
          <span class="collection-summary-chip">Hot picks available</span>
          <span class="collection-toolbar-note">Interactive sort and filters appear after the catalog loads.</span>
        </div>
      </div>
    </section>
  `;
}

function parsePreviewPrice(price) {
  if (!price) {
    return null;
  }

  const numericPrice = Number.parseFloat(String(price).replace(/[$,]/g, '').trim());
  return Number.isFinite(numericPrice) ? numericPrice : null;
}

function sortProductsForPreview(products) {
  return [...products].sort((leftProduct, rightProduct) => {
    const leftPrice = parsePreviewPrice(leftProduct.price);
    const rightPrice = parsePreviewPrice(rightProduct.price);
    const leftWow = typeof leftProduct.wowFactor === 'number' ? leftProduct.wowFactor : -1;
    const rightWow = typeof rightProduct.wowFactor === 'number' ? rightProduct.wowFactor : -1;

    return (
      Number(rightProduct.featured) - Number(leftProduct.featured)
      || rightWow - leftWow
      || (leftPrice ?? Number.POSITIVE_INFINITY) - (rightPrice ?? Number.POSITIVE_INFINITY)
      || leftProduct.title.localeCompare(rightProduct.title)
    );
  });
}

function renderCollectionShell({
  title,
  subtitle,
  categories,
  selectedCategory = 'all',
  products,
  totalCount,
}) {
  const isCompact = selectedCategory !== 'all';

  return `
    <div id="${SEO_SHELL_ID}">
      ${renderHeader()}
      <main class="main-content">
        <section class="hero ${isCompact ? 'is-compact' : ''}">
          <div class="hero-content">
            <p class="hero-eyebrow">${isCompact ? 'Category spotlight' : 'Curated catalog'}</p>
            <h1 class="hero-title">${title}</h1>
            <p class="hero-subtitle">${subtitle}</p>
          </div>
          ${isCompact ? '' : `
            <div class="floating-emoji" style="top: 10%; left: 10%;">🎮</div>
            <div class="floating-emoji" style="top: 20%; right: 15%;">🚀</div>
            <div class="floating-emoji" style="top: 60%; left: 20%;">💎</div>
            <div class="floating-emoji" style="top: 70%; right: 10%;">🎁</div>
          `}
        </section>
        ${renderCategoryFilter(categories, selectedCategory)}
        <section class="product-grid-container">
          ${renderCollectionSummary({
            selectedCategory,
            visibleCount: products.length,
            totalCount,
          })}
          ${renderCollectionToolbar()}
          <div class="product-grid">
            ${products.map(renderProductCard).join('\n')}
          </div>
        </section>
      </main>
      ${renderFooter()}
    </div>
  `;
}

function renderProductShell(product, relatedProducts) {
  const categoryPath = getCategoryPath(product.category);
  const categoryLabel = getCategoryLabel(product.category);
  const outboundUrl = getProductOutboundUrl(product, { logMissing: false });
  const primaryCtaLabel = getProductOutboundCtaLabel(product);
  const destinationLabel = getProductOutboundDestination(product);
  const supportText = getProductOutboundSupportText(product);
  const trustHighlights = getProductTrustHighlights(product);
  const offerHeadline = product.price || 'See latest offer';
  const offerHighlights = [
    `${destinationLabel} checkout`,
    'Opens in new tab',
    'No extra cost to you',
  ];
  const wowFactorLabel = typeof product.wowFactor === 'number' ? `${product.wowFactor.toFixed(1)}/10` : null;
  const mediaHighlights = [
    {
      label: 'Listed',
      value: offerHeadline,
      accentClass: 'is-strong',
    },
    {
      label: 'Category',
      value: categoryLabel,
    },
    {
      label: 'Opens On',
      value: destinationLabel,
    },
    {
      label: wowFactorLabel ? 'Wow Factor' : 'Catalog Status',
      value: wowFactorLabel || (product.featured ? 'Hot Pick' : 'Curated Find'),
    },
  ];
  const mediaNote = getTaglineLead(
    product.tagline,
    `Curated ${categoryLabel.toLowerCase()} find that opens on ${destinationLabel}.`,
  );
  const storyCopy = splitTaglineCopy(
    product.tagline,
    `Curated ${categoryLabel.toLowerCase()} find built to stop the scroll.`,
    `Open the listing on ${destinationLabel} to see the full details and current offer.`,
  );
  const relatedFeaturedCount = relatedProducts.filter((item) => item.featured).length;
  const relatedBrowseCopy = `Keep the rabbit hole going with a tighter set of ${categoryLabel.toLowerCase()} picks from the same lane.`;

  return `
    <div id="${SEO_SHELL_ID}">
      ${renderHeader()}
      <main class="main-content">
        <div class="product-detail-page">
          <section class="product-detail-hero">
            <div class="container product-detail-layout">
              <div class="product-detail-media card">
                <div class="product-detail-visual-glow" aria-hidden="true"></div>
                <div class="product-detail-visual-meta">
                  <span class="product-detail-visual-chip">${escapeHtml(destinationLabel)}</span>
                  ${typeof product.wowFactor === 'number'
                    ? `<span class="product-detail-visual-chip">Wow ${escapeHtml(product.wowFactor.toFixed(1))}</span>`
                    : ''}
                </div>
                <a
                  href="${escapeAttribute(product.image)}"
                  class="product-detail-image-stage product-detail-image-zoom"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Open larger image for ${escapeAttribute(product.title)}"
                >
                  <div class="product-detail-image-backplate" aria-hidden="true"></div>
                  <div class="product-detail-image-frame">
                    <img
                      src="${escapeAttribute(product.image)}"
                      alt="${escapeAttribute(product.title)}"
                      class="product-detail-image"
                    />
                  </div>
                  <span class="product-detail-image-hint">Open larger image</span>
                </a>
                <p class="product-detail-visual-caption">
                  Scroll-stopping product shot with the main call to action anchored right beside it.
                </p>
                <div class="product-detail-media-summary" aria-label="At a glance">
                  <div class="product-detail-media-summary-head">
                    <p class="product-detail-media-summary-eyebrow">At a glance</p>
                    <span class="product-detail-media-summary-kicker">
                      ${product.featured ? 'Featured catalog pick' : 'Curated catalog pick'}
                    </span>
                  </div>
                  <div class="product-detail-media-grid">
                    ${mediaHighlights.map((item) => `
                      <div class="product-detail-media-stat${item.accentClass ? ` ${item.accentClass}` : ''}">
                        <span class="product-detail-media-stat-label">${escapeHtml(item.label)}</span>
                        <strong class="product-detail-media-stat-value">${escapeHtml(item.value)}</strong>
                      </div>
                    `).join('\n')}
                  </div>
                  <div class="product-detail-media-note">
                    <p class="product-detail-media-note-label">Editor note</p>
                    <p class="product-detail-media-note-copy">${escapeHtml(mediaNote)}</p>
                  </div>
                </div>
              </div>

              <div class="product-detail-copy">
                <nav class="product-detail-breadcrumbs" aria-label="Breadcrumb">
                  <a href="/">Home</a>
                  <span>/</span>
                  <a href="${categoryPath}">${escapeHtml(categoryLabel)}</a>
                  <span>/</span>
                  <span aria-current="page">${escapeHtml(product.title)}</span>
                </nav>

                <div class="product-detail-kicker">
                  <span class="product-detail-category">${escapeHtml(categoryLabel)}</span>
                  ${product.featured ? '<span class="product-detail-hot">Hot Pick</span>' : ''}
                </div>

                <h1 class="product-detail-title">${escapeHtml(product.title)}</h1>
                <div class="product-detail-story">
                  <div class="product-detail-story-head">
                    <p class="product-detail-story-eyebrow">Quick take</p>
                    <span class="product-detail-story-chip">
                      ${product.featured ? 'Featured take' : 'Editor pick'}
                    </span>
                  </div>
                  <p class="product-detail-story-lead">${escapeHtml(storyCopy.lead)}</p>
                  ${storyCopy.body ? `<p class="product-detail-story-body">${escapeHtml(storyCopy.body)}</p>` : ''}
                </div>

                <div class="product-detail-facts">
                  <div class="product-detail-facts-head">
                    <p class="product-detail-facts-eyebrow">Fast facts</p>
                    <span class="product-detail-facts-chip">
                      ${escapeHtml(wowFactorLabel ? `Wow ${wowFactorLabel}` : destinationLabel)}
                    </span>
                  </div>
                  <div class="product-detail-metrics">
                    ${product.price ? `
                      <div class="product-detail-metric">
                        <span class="metric-label">Listed Price</span>
                        <strong>${escapeHtml(product.price)}</strong>
                      </div>
                    ` : ''}
                    ${typeof product.wowFactor === 'number' ? `
                      <div class="product-detail-metric">
                        <span class="metric-label">Wow Factor</span>
                        <strong>${escapeHtml(product.wowFactor.toFixed(1))}/10</strong>
                      </div>
                    ` : ''}
                  </div>
                </div>

                <div class="product-detail-offer-card">
                  <div class="product-detail-offer-banner">
                    <div>
                      <p class="product-detail-offer-banner-eyebrow">Best next click</p>
                      <p class="product-detail-offer-banner-title">
                        Jump out to ${escapeHtml(destinationLabel)} when you are ready to check the live listing.
                      </p>
                    </div>
                    <div class="product-detail-offer-chip-row">
                      ${offerHighlights.map((item) => `
                        <span class="product-detail-offer-chip">${escapeHtml(item)}</span>
                      `).join('\n')}
                    </div>
                  </div>

                  <div class="product-detail-offer-copy">
                    <p class="product-detail-offer-eyebrow">Ready to click through?</p>

                    <div class="product-detail-offer-main">
                      <div>
                        <p class="product-detail-offer-price-label">
                          ${product.price ? 'Current listed price' : 'Latest offer'}
                        </p>
                        <strong class="product-detail-offer-price">${escapeHtml(offerHeadline)}</strong>
                      </div>
                      <span class="product-detail-offer-destination">${escapeHtml(destinationLabel)}</span>
                    </div>

                    <p class="product-detail-offer-support">${escapeHtml(supportText)}</p>
                  </div>

                  <div class="product-detail-action-cluster">
                    <a
                      href="${escapeAttribute(outboundUrl)}"
                      class="btn btn-primary product-detail-primary"
                      target="_blank"
                      rel="nofollow sponsored noopener noreferrer"
                    >
                      ${escapeHtml(primaryCtaLabel)}
                    </a>
                    <p class="product-detail-primary-note">
                      You will leave this page and land on the live ${escapeHtml(destinationLabel)} listing in a new tab.
                    </p>
                    <div class="product-detail-actions">
                      <a href="${categoryPath}" class="product-detail-category-link">
                        More ${escapeHtml(categoryLabel)}
                      </a>
                    </div>
                  </div>

                  <div class="product-detail-trust-panel" aria-label="Why click with confidence">
                    <p class="product-detail-trust-heading">Why click with confidence</p>
                    <div class="product-detail-trust-grid">
                      ${trustHighlights.map((item) => `
                        <div class="product-detail-trust-item">
                          <span class="product-detail-trust-label">${escapeHtml(item.title)}</span>
                          <strong class="product-detail-trust-value">${escapeHtml(item.description)}</strong>
                        </div>
                      `).join('\n')}
                    </div>
                  </div>

                  <p class="product-detail-disclaimer">
                    We may earn a commission if you buy through this page. It does not cost you extra.
                  </p>
                </div>
              </div>
            </div>
          </section>

          ${relatedProducts.length > 0 ? `
            <section class="product-detail-related">
              <div class="container">
                <div class="product-detail-related-shell">
                  <div class="product-detail-related-overview">
                    <div class="product-detail-section-head">
                      <div>
                        <p class="product-detail-section-label">Keep Browsing</p>
                        <h2>More ${escapeHtml(categoryLabel)} finds</h2>
                        <p class="product-detail-related-copy">${escapeHtml(relatedBrowseCopy)}</p>
                      </div>
                      <a href="${categoryPath}" class="product-detail-all-link">View full category</a>
                    </div>
                    <div class="product-detail-related-badges" aria-label="Browse highlights">
                      <span class="product-detail-related-badge">${relatedProducts.length} more picks</span>
                      ${relatedFeaturedCount > 0
                        ? `<span class="product-detail-related-badge is-strong">${relatedFeaturedCount} hot picks</span>`
                        : ''}
                      <span class="product-detail-related-badge">Same category lane</span>
                    </div>
                  </div>

                  <div class="product-detail-related-grid-shell">
                    <div class="product-detail-related-note">
                      <p class="product-detail-related-note-title">Keep the scroll alive</p>
                      <p class="product-detail-related-note-copy">
                        Open another detail page, save a contender, or jump back to the full ${escapeHtml(categoryLabel)} collection.
                      </p>
                    </div>

                    <div class="product-grid product-detail-grid">
                      ${relatedProducts.map(renderProductCard).join('\n')}
                    </div>
                  </div>
                </div>
              </div>
            </section>
          ` : ''}
        </div>

        <div class="product-detail-mobile-bar">
          <div class="product-detail-mobile-meta">
            <div class="product-detail-mobile-chip-row">
              <span class="product-detail-mobile-chip">${escapeHtml(destinationLabel)}</span>
              ${product.featured ? '<span class="product-detail-mobile-chip is-strong">Hot Pick</span>' : ''}
            </div>
            <span class="product-detail-mobile-label">${product.price ? 'Current listed price' : 'Latest offer'}</span>
            <strong class="product-detail-mobile-price">${escapeHtml(offerHeadline)}</strong>
          </div>
          <div class="product-detail-mobile-actions">
            <a href="${categoryPath}" class="product-detail-mobile-link">
              More ${escapeHtml(categoryLabel)}
            </a>
            <a
              href="${escapeAttribute(outboundUrl)}"
              class="btn btn-primary product-detail-mobile-button"
              target="_blank"
              rel="nofollow sponsored noopener noreferrer"
            >
              ${escapeHtml(primaryCtaLabel)}
            </a>
          </div>
        </div>
      </main>
      ${renderFooter()}
    </div>
  `;
}

function renderCollectionJsonLd(products, selectedCategory = 'all') {
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      itemListElement: products.slice(0, 20).map((product, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'Product',
          name: product.title,
          description: product.tagline,
          image: product.image,
          url: `${SITE_URL}${getProductPath(product)}`,
        },
      })),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: `${SITE_URL}/`,
        },
        ...(selectedCategory !== 'all'
          ? [{
            '@type': 'ListItem',
            position: 2,
            name: getCategoryLabel(selectedCategory),
            item: `${SITE_URL}${getCategoryPath(selectedCategory)}`,
          }]
          : []),
      ],
    },
  ];
}

function renderProductJsonLd(product) {
  const productUrl = `${SITE_URL}${getProductPath(product)}`;
  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.tagline,
    image: product.image ? [product.image] : undefined,
    category: getCategoryLabel(product.category),
    url: productUrl,
  };

  if (product.price) {
    productSchema.offers = {
      '@type': 'Offer',
      price: product.price.replace(/[$,]/g, ''),
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
      url: productUrl,
    };
  }

  return [
    productSchema,
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: `${SITE_URL}/`,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: getCategoryLabel(product.category),
          item: `${SITE_URL}${getCategoryPath(product.category)}`,
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: product.title,
          item: productUrl,
        },
      ],
    },
  ];
}

function createDocument(templateHtml, {
  meta,
  seoShell,
  routeData,
  jsonLd,
}) {
  let nextHtml = replaceHeadMeta(templateHtml, meta);
  nextHtml = injectHeadScripts(nextHtml, jsonLd);
  nextHtml = nextHtml.replace(
    '<div id="root"></div>',
    `${seoShell}\n<script id="${ROUTE_DATA_ELEMENT_ID}" type="application/json">${escapeJsonForHtml(routeData)}</script>\n<div id="root"></div>`,
  );

  return nextHtml;
}

function getHomePreviewProducts(products) {
  const featuredProducts = products.filter((product) => product.featured).slice(0, 24);
  const featuredIds = new Set(featuredProducts.map((product) => product.id));
  const fillerProducts = products
    .filter((product) => !featuredIds.has(product.id))
    .slice(0, Math.max(0, HOME_PREVIEW_LIMIT - featuredProducts.length));

  return [...featuredProducts, ...fillerProducts];
}

async function writeBatchedPages(items, renderPage, resolveTargetPath) {
  for (let index = 0; index < items.length; index += WRITE_BATCH_SIZE) {
    const batch = items.slice(index, index + WRITE_BATCH_SIZE);
    await Promise.all(batch.map(async (item) => {
      const targetPath = resolveTargetPath(item);
      await mkdir(path.dirname(targetPath), { recursive: true });
      await writeFile(targetPath, renderPage(item));
    }));
  }
}

async function main() {
  const sourcePath = await resolveSourcePath();
  const [templateHtml, rawProducts] = await Promise.all([
    readFile(path.join(distDir, 'index.html'), 'utf8'),
    readFile(sourcePath, 'utf8'),
  ]);

  const products = JSON.parse(rawProducts);
  if (!Array.isArray(products)) {
    throw new Error(`Expected an array in ${sourcePath}`);
  }

  const categories = Array.from(
    new Set(products.map((product) => product.category).filter(Boolean)),
  ).sort();

  const productsByCategory = new Map();
  let missingOutboundLinkCount = 0;
  for (const product of products) {
    const categoryProducts = productsByCategory.get(product.category) || [];
    categoryProducts.push(product);
    productsByCategory.set(product.category, categoryProducts);

    if (!hasProductOutboundUrl(product)) {
      missingOutboundLinkCount += 1;
    }
  }

  const homePreviewProducts = getHomePreviewProducts(products);
  const homeMeta = getCollectionPageMeta('all');
  const homeHtml = createDocument(templateHtml, {
    meta: homeMeta,
    seoShell: renderCollectionShell({
      title: `This Is Why <span class="gradient-text">I'm Broke</span>`,
      subtitle: 'The internet\'s greatest gallery of things you do not need, but absolutely want. Browse real product pages below while the interactive catalog loads.',
      categories,
      selectedCategory: 'all',
      products: homePreviewProducts,
      totalCount: products.length,
    }),
    routeData: {
      pageType: 'home',
    },
    jsonLd: renderCollectionJsonLd(homePreviewProducts),
  });

  await writeFile(path.join(distDir, 'index.html'), homeHtml);

  await writeBatchedPages(
    categories,
    (category) => {
      const categoryProducts = sortProductsForPreview(
        (productsByCategory.get(category) || []).slice(0, CATEGORY_PREVIEW_LIMIT * 2),
      ).slice(0, CATEGORY_PREVIEW_LIMIT);
      const meta = getCollectionPageMeta(category);
      const shell = renderCollectionShell({
        title: `Explore <span class="gradient-text">${escapeHtml(getCategoryLabel(category))}</span>`,
        subtitle: `${escapeHtml(getCategoryDescription(category))} Previewing crawlable product pages below while the full catalog loads.`,
        categories,
        selectedCategory: category,
        products: categoryProducts,
        totalCount: productsByCategory.get(category)?.length || categoryProducts.length,
      });

      return createDocument(templateHtml, {
        meta,
        seoShell: shell,
        routeData: {
          pageType: 'category',
          category,
        },
        jsonLd: renderCollectionJsonLd(categoryProducts, category),
      });
    },
    (category) => path.join(distDir, 'category', encodeURIComponent(category), 'index.html'),
  );

  await writeBatchedPages(
    products,
    (product) => {
      const relatedProducts = sortProductsForPreview((productsByCategory.get(product.category) || [])
        .filter((candidate) => candidate.id !== product.id)
        .slice(0, RELATED_LIMIT * 3)).slice(0, RELATED_LIMIT);
      const meta = getProductPageMeta(product);
      const shell = renderProductShell(product, relatedProducts);

      return createDocument(templateHtml, {
        meta,
        seoShell: shell,
        routeData: {
          pageType: 'product',
          product,
          relatedProducts,
        },
        jsonLd: renderProductJsonLd(product),
      });
    },
    (product) => path.join(distDir, 'product', encodeURIComponent(product.id), 'index.html'),
  );

  console.log(`Static pages generated from ${path.relative(siteRoot, sourcePath)}`);
  console.log(`Home page: 1`);
  console.log(`Category pages: ${categories.length}`);
  console.log(`Product pages: ${products.length.toLocaleString()}`);
  console.log(`Products missing a direct outbound link: ${missingOutboundLinkCount.toLocaleString()}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
