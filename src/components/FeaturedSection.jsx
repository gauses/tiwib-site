import ProductCard from './ProductCard';
import './FeaturedSection.css';

export default function FeaturedSection({ products, wishlist, onToggleSave }) {
    if (!products || products.length === 0) return null;

    return (
        <section className="featured-section">
            <div className="container">
                <div className="section-header">
                    <h2 className="section-title">
                        <span className="title-icon">✨</span>
                        The <span className="text-gradient">Elite Selection</span>
                    </h2>
                    <p className="section-subtitle">Top-tier brain rot for the discerning consumer.</p>
                </div>

                <div className="featured-grid">
                    {products.map(product => (
                        <ProductCard
                            key={product.id}
                            product={product}
                            isSaved={wishlist.some(item => item.id === product.id)}
                            onToggleSave={() => onToggleSave(product)}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}
