import { useState, useEffect } from 'react';
import ProductCard from './ProductCard';
import './ProductGrid.css';

function ProductGrid({ products, wishlist, onToggleSave }) {
    const [visibleProducts, setVisibleProducts] = useState([]);
    const [page, setPage] = useState(1);
    const PRODUCTS_PER_PAGE = 12;

    useEffect(() => {
        // Load initial products
        setVisibleProducts(products.slice(0, page * PRODUCTS_PER_PAGE));
    }, [products, page]);

    useEffect(() => {
        // Infinite scroll handler
        const handleScroll = () => {
            const scrollTop = window.scrollY;
            const windowHeight = window.innerHeight;
            const documentHeight = document.documentElement.scrollHeight;

            // Load more when user is 200px from bottom
            if (scrollTop + windowHeight >= documentHeight - 200) {
                loadMore();
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [page, products]);

    const loadMore = () => {
        if (visibleProducts.length < products.length) {
            setPage(prev => prev + 1);
        }
    };

    if (products.length === 0) {
        return (
            <div className="no-products">
                <div className="no-products-icon">🔍</div>
                <h3>No products found</h3>
                <p>Try adjusting your search or filters to find what you're looking for.</p>
            </div>
        );
    }

    return (
        <div className="product-grid-container">
            <div className="product-grid">
                {visibleProducts.map((product) => (
                    <ProductCard
                        key={product.id}
                        product={product}
                        isSaved={wishlist.some(item => item.id === product.id)}
                        onToggleSave={() => onToggleSave(product)}
                    />
                ))}
            </div>

            {visibleProducts.length < products.length && (
                <div className="loading-indicator">
                    <div className="spinner"></div>
                    <p>Loading more cool stuff...</p>
                </div>
            )}
        </div>
    );
}

export default ProductGrid;
