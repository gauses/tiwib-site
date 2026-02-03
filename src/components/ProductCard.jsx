import './ProductCard.css';
import { handleProductClick } from '../utils/affiliateLink';

function ProductCard({ product }) {
    const handleClick = () => {
        const affiliateLink = handleProductClick(product);
        window.open(affiliateLink, '_blank', 'noopener,noreferrer');
    };

    return (
        <article className="product-card">
            <div className="product-image-wrapper">
                <img
                    src={product.image}
                    alt={product.title}
                    className="product-image"
                    loading="lazy"
                />
                {product.featured && (
                    <span className="featured-badge">🔥 HOT</span>
                )}
                {product.category && product.category !== 'general' && (
                    <span className="category-badge">{product.category}</span>
                )}
            </div>

            <div className="product-content">
                <h3 className="product-title">{product.title}</h3>
                <p className="product-tagline">{product.tagline}</p>

                <div className="product-footer">
                    <span className="product-price">{product.price}</span>
                    <button
                        className="btn btn-primary product-cta"
                        onClick={handleClick}
                        aria-label={`View ${product.title}`}
                    >
                        Check It Out →
                    </button>
                </div>
            </div>
        </article>
    );
}

export default ProductCard;
