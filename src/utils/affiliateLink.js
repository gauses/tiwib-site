/**
 * Amazon Affiliate Link Generator
 * Generates Amazon links with affiliate tags
 */

// TODO: Replace with your Amazon Associates Tag
const AFFILIATE_TAG = 'saucytits-20';
const DEFAULT_AFFILIATE_LINK = 'https://www.amazon.com?&linkCode=ll2&tag=saucytits-20&linkId=48b549603464d607233cf583d104da98&language=en_US&ref_=as_li_ss_tl';

/**
 * Generate Amazon Affiliate Link
 * @param {string} asin - Amazon Standard Identification Number
 * @param {string} source - Optional tracking parameter
 * @returns {string} Full affiliate link
 */
export function generateAffiliateLink(asin, source = 'website') {
    if (!asin) {
        console.warn('ASIN is required to generate affiliate link');
        return '#';
    }

    // Base Amazon URL
    const baseUrl = 'https://www.amazon.com/dp';

    // Add affiliate parameters
    const params = new URLSearchParams({
        tag: AFFILIATE_TAG,
        linkCode: 'ogi',
        th: '1',
        psc: '1',
        ref_: source
    });

    return `${baseUrl}/${asin}?${params.toString()}`;
}

export function hasProductOutboundUrl(product) {
    return Boolean(product?.amazonAsin || product?.productLink);
}

export function isAmazonProduct(product) {
    return Boolean(product?.amazonAsin);
}

export function getProductOutboundDestination(product) {
    return isAmazonProduct(product) ? 'Amazon' : 'Brand Store';
}

export function getProductOutboundCtaLabel(product) {
    return isAmazonProduct(product) ? 'Open on Amazon' : 'Visit Store';
}

export function getProductOutboundSupportText(product) {
    return isAmazonProduct(product)
        ? 'Affiliate link opens Amazon in a new tab with our tracking tag attached.'
        : 'Direct merchant link opens the original product page in a new tab.';
}

export function getProductTrustHighlights(product) {
    return [
        {
            title: 'Destination',
            description: isAmazonProduct(product) ? 'Amazon product listing' : 'Direct brand store',
        },
        {
            title: 'Checkout',
            description: isAmazonProduct(product) ? 'Handled on Amazon' : 'Handled on the merchant site',
        },
        {
            title: 'Window',
            description: 'Opens in a new tab',
        },
        {
            title: 'Disclosure',
            description: 'Commission-supported link',
        },
    ];
}

export function getProductOutboundUrl(product, options = {}) {
    const { logMissing = true } = options;

    if (!product) {
        return DEFAULT_AFFILIATE_LINK;
    }

    if (product.amazonAsin) {
        return generateAffiliateLink(product.amazonAsin, `product-${product.id}`);
    }

    if (product.productLink) {
        return product.productLink;
    }

    if (logMissing) {
        console.warn(`No link available for product: ${product.title} (ID: ${product.id}). Using fallback.`);
    }
    return DEFAULT_AFFILIATE_LINK;
}

/**
 * Track link click events
 * @param {string} productId - Product ID
 * @param {string} productTitle - Product Title
 */
export function trackClick(productId, productTitle) {
    // Send click event to Google Analytics (if configured)
    if (window.gtag) {
        window.gtag('event', 'click', {
            event_category: 'affiliate_link',
            event_label: productTitle,
            value: productId
        });
    }

    // Can be sent to other analytics tools
    console.log(`Clicked: ${productTitle} (ID: ${productId})`);
}

/**
 * Handle product link click
 * @param {object} product - Product object
 * @returns {string} Affiliate link or original product link
 */
export function handleProductClick(product) {
    trackClick(product.id, product.title);
    return getProductOutboundUrl(product);
}
