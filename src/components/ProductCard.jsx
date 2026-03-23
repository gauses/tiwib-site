import './ProductCard.css';
import { getProductPath } from '../utils/routes';

function ProductCard({ product, isSaved, onToggleSave }) {
    const productPath = getProductPath(product);

    const toggleSave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        onToggleSave();
    };

    return (
        <article className="product-card">
            <div className="product-image-wrapper">
                <a href={productPath} className="product-card-link" aria-label={`View details for ${product.title}`}>
                    <img
                        src={product.image}
                        alt={product.title}
                        className="product-image"
                        loading="lazy"
                    />
                </a>
                <button
                    className={`save-button ${isSaved ? 'is-saved' : ''}`}
                    onClick={toggleSave}
                    aria-label={isSaved ? "Remove from wishlist" : "Add to wishlist"}
                >
                    {isSaved ? '❤️' : '🤍'}
                </button>
                {product.featured && (
                    <span className="featured-badge">🔥 HOT</span>
                )}
                {product.category && product.category !== 'general' && (
                    <span className="category-badge">{product.category}</span>
                )}
            </div>

            <div className="product-content">
                <h3 className="product-title">
                    <a href={productPath} className="product-title-link">
                        {product.title}
                    </a>
                </h3>
                <p className="product-tagline">{product.tagline}</p>

                <div className="product-footer">
                    <span className="product-price">{product.price || 'See details'}</span>
                    <a href={productPath} className="view-button">
                        View Details
                    </a>
                </div>
            </div>
        </article>
    );
}

export default ProductCard;
