import {
  getCategoryDescription,
  getCategoryLabel,
} from './categories.js';

export const SITE_URL = 'https://saucytits.com';
export const SITE_NAME = "This Is Why I'm Broke";
export const BASE_TITLE = `${SITE_NAME} | Cool Stuff, Unique Gifts & Weird Gadgets`;
export const BASE_DESCRIPTION = 'Discover the coolest, weirdest, and most innovative products on the web. A curated collection of unique gift ideas and must-have gadgets!';
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.png`;
export const ROUTE_DATA_ELEMENT_ID = 'tiwib-route-data';
export const SEO_SHELL_ID = 'tiwib-seo-shell';

function safeDecode(value) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export function normalizePathname(pathname = '/') {
  if (!pathname || pathname === '/') {
    return '/';
  }

  const prefixed = pathname.startsWith('/') ? pathname : `/${pathname}`;
  return `${prefixed.replace(/\/+$/, '')}/`;
}

export function getCategoryPath(category = 'all') {
  if (!category || category === 'all') {
    return '/';
  }

  return `/category/${encodeURIComponent(category)}/`;
}

export function getProductPath(productOrId) {
  const productId = typeof productOrId === 'string' ? productOrId : productOrId?.id;

  if (!productId) {
    return '/';
  }

  return `/product/${encodeURIComponent(productId)}/`;
}

export function getAbsoluteUrl(pathname = '/') {
  const normalizedPath = normalizePathname(pathname);
  return normalizedPath === '/'
    ? `${SITE_URL}/`
    : `${SITE_URL}${normalizedPath}`;
}

export function parseRouteFromLocation(locationLike = { pathname: '/', search: '' }) {
  const pathname = normalizePathname(locationLike.pathname || '/');
  const searchParams = new URLSearchParams(locationLike.search || '');

  const productMatch = pathname.match(/^\/product\/([^/]+)\/$/i);
  if (productMatch) {
    return {
      type: 'product',
      productId: safeDecode(productMatch[1]),
      pathname,
    };
  }

  const categoryMatch = pathname.match(/^\/category\/([^/]+)\/$/i);
  if (categoryMatch) {
    return {
      type: 'category',
      category: safeDecode(categoryMatch[1]),
      pathname,
    };
  }

  const legacyCategory = searchParams.get('category');
  if (pathname === '/' && legacyCategory) {
    return {
      type: 'category',
      category: legacyCategory,
      pathname,
      legacyQuery: true,
    };
  }

  return {
    type: 'home',
    pathname,
  };
}

export function getRoutePath(route) {
  if (!route || route.type === 'home') {
    return '/';
  }

  if (route.type === 'product') {
    return getProductPath(route.productId);
  }

  return getCategoryPath(route.category);
}

export function readEmbeddedRouteData() {
  if (typeof document === 'undefined') {
    return null;
  }

  const routeDataElement = document.getElementById(ROUTE_DATA_ELEMENT_ID);
  if (!routeDataElement?.textContent) {
    return null;
  }

  try {
    return JSON.parse(routeDataElement.textContent);
  } catch {
    return null;
  }
}

function truncateDescription(value, maxLength = 160) {
  const normalized = (value || '').replace(/\s+/g, ' ').trim();

  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, Math.max(0, maxLength - 3)).trim()}...`;
}

export function getCollectionPageMeta(category = 'all') {
  if (!category || category === 'all') {
    return {
      title: BASE_TITLE,
      description: BASE_DESCRIPTION,
      canonicalUrl: `${SITE_URL}/`,
      image: DEFAULT_OG_IMAGE,
      type: 'website',
    };
  }

  const label = getCategoryLabel(category);
  return {
    title: `${label} | ${SITE_NAME}`,
    description: truncateDescription(
      `${getCategoryDescription(category)} Discover curated finds, funny gifts, and products you can actually click through to shop.`,
    ),
    canonicalUrl: getAbsoluteUrl(getCategoryPath(category)),
    image: DEFAULT_OG_IMAGE,
    type: 'website',
  };
}

export function getProductPageMeta(product) {
  const categoryLabel = getCategoryLabel(product?.category || 'all');
  const primaryDescription = product?.tagline || product?.title || BASE_DESCRIPTION;
  const secondaryDescription = product?.price
    ? `Current listed price: ${product.price}.`
    : `Filed under ${categoryLabel}.`;

  return {
    title: `${product?.title || SITE_NAME} | ${SITE_NAME}`,
    description: truncateDescription(`${primaryDescription} ${secondaryDescription}`),
    canonicalUrl: getAbsoluteUrl(getProductPath(product)),
    image: product?.image || DEFAULT_OG_IMAGE,
    type: 'product',
  };
}
