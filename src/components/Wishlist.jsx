import './Wishlist.css';
import { handleProductClick } from '../utils/affiliateLink';

export default function Wishlist({ isOpen, onClose, items, onRemove }) {
    const handleItemClick = (product) => {
        const affiliateLink = handleProductClick(product);
        window.open(affiliateLink, '_blank', 'noopener,noreferrer');
    };

    return (
        <div className={`wishlist-drawer ${isOpen ? 'is-open' : ''}`}>
            <div className="wishlist-overlay" onClick={onClose}></div>
            <div className="wishlist-content">
                <div className="wishlist-header">
                    <h2>Saved Items ({items.length})</h2>
                    <button className="close-drawer" onClick={onClose} aria-label="Close wishlist">✕</button>
                </div>

                <div className="wishlist-items">
                    {items.length === 0 ? (
                        <div className="empty-wishlist">
                            <span className="empty-icon">❤️</span>
                            <p>Your wishlist is empty.</p>
                            <button className="btn btn-primary" onClick={onClose}>Go Shopping</button>
                        </div>
                    ) : (
                        items.map(item => (
                            <div key={item.id} className="wishlist-item">
                                <div className="item-image-wrapper" onClick={() => handleItemClick(item)}>
                                    <img src={item.image} alt={item.title} />
                                </div>
                                <div className="item-details">
                                    <h4 onClick={() => handleItemClick(item)}>{item.title}</h4>
                                    <span className="item-price">{item.price}</span>
                                    <div className="item-actions">
                                        <button
                                            className="remove-item"
                                            onClick={() => onRemove(item)}
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
