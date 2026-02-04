import { useState, useEffect } from 'react';
import './ProductCard.css';
import { handleProductClick } from '../utils/affiliateLink';

function ProductCard({ product, isSaved, onToggleSave }) {
    const toggleSave = (e) => {
        e.stopPropagation(); // Don't trigger card click
        onToggleSave();
    };

    const handleClick = () => {
        const affiliateLink = handleProductClick(product);
        window.open(affiliateLink, '_blank', 'noopener,noreferrer');
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick();
        }
    };

    return (
        <article
            className="product-card"
            onClick={handleClick}
            onKeyDown={handleKeyDown}
            tabIndex="0"
            role="button"
            aria-label={`View ${product.title}`}
        >
            <div className="product-image-wrapper">
                <img
                    src={product.image}
                    alt={product.title}
                    className="product-image"
                    loading="lazy"
                />
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
                <h3 className="product-title">{product.title}</h3>
                <p className="product-tagline">{product.tagline}</p>

                <div className="product-footer">
                    <span className="product-price">{product.price}</span>
                    <button
                        className="view-button"
                        tabIndex="-1"
                        aria-hidden="true"
                    >
                        Check It Out
                    </button>
                </div>
            </div>
        </article>
    );
}

export default ProductCard;
