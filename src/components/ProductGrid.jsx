import { useState, useEffect } from 'react';
import ProductCard from './ProductCard';
import './ProductGrid.css';

function ProductGrid({ products }) {
    const [visibleProducts, setVisibleProducts] = useState([]);
    const [page, setPage] = useState(1);
    const PRODUCTS_PER_PAGE = 12;

    useEffect(() => {
        // Load initial products
        setVisibleProducts(products.slice(0, PRODUCTS_PER_PAGE));
    }, [products]);

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
        const nextPage = page + 1;
        const startIndex = 0;
        const endIndex = nextPage * PRODUCTS_PER_PAGE;

        if (endIndex <= products.length) {
            setVisibleProducts(products.slice(startIndex, endIndex));
            setPage(nextPage);
        }
    };

    return (
        <div className="product-grid-container">
            <div className="product-grid">
                {visibleProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>

            {visibleProducts.length < products.length && (
                <div className="loading-indicator">
                    <div className="spinner"></div>
                    <p>加载更多好物中...</p>
                </div>
            )}
        </div>
    );
}

export default ProductGrid;
