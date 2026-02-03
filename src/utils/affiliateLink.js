/**
 * Amazon Affiliate Link Generator
 * Generates Amazon links with affiliate tags
 */

// TODO: Replace with your Amazon Associates Tag
const AFFILIATE_TAG = 'youraffid-20';

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
 * @returns {string} Affiliate link
 */
export function handleProductClick(product) {
    trackClick(product.id, product.title);
    return generateAffiliateLink(product.amazonAsin, `product-${product.id}`);
}
