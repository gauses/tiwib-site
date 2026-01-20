/**
 * Amazon Affiliate Link Generator
 * 生成带有联盟标签的 Amazon 链接
 */

// TODO: 替换为你的 Amazon Associates Tag
const AFFILIATE_TAG = 'youraffid-20';

/**
 * 生成 Amazon 联盟链接
 * @param {string} asin - Amazon Standard Identification Number
 * @param {string} source - 可选的来源追踪参数
 * @returns {string} 完整的联盟链接
 */
export function generateAffiliateLink(asin, source = 'website') {
    if (!asin) {
        console.warn('ASIN is required to generate affiliate link');
        return '#';
    }

    // 构建基础 Amazon 链接
    const baseUrl = 'https://www.amazon.com/dp';

    // 添加联盟参数
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
 * 追踪链接点击事件
 * @param {string} productId - 产品ID
 * @param {string} productTitle - 产品标题
 */
export function trackClick(productId, productTitle) {
    // 发送点击事件到 Google Analytics（如果已配置）
    if (window.gtag) {
        window.gtag('event', 'click', {
            event_category: 'affiliate_link',
            event_label: productTitle,
            value: productId
        });
    }

    // 也可以发送到其他分析工具
    console.log(`Clicked: ${productTitle} (ID: ${productId})`);
}

/**
 * 处理产品链接点击
 * @param {object} product - 产品对象
 * @returns {string} 联盟链接
 */
export function handleProductClick(product) {
    trackClick(product.id, product.title);
    return generateAffiliateLink(product.amazonAsin, `product-${product.id}`);
}
