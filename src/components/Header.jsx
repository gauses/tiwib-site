import './Header.css';
import { getCategoryPath } from '../utils/routes';

export default function Header({ wishlistCount, onToggleWishlist }) {
    return (
        <header className="header">
            <div className="header-container">
                <a href="/" className="logo" aria-label="Go to homepage">
                    <span className="logo-icon">💸</span>
                    <span className="logo-text">TIWIB</span>
                </a>
                <nav className="nav">
                    <a href="/" className="nav-link">
                        <span className="nav-label-desktop">Home</span>
                        <span className="nav-label-mobile">Catalog</span>
                    </a>
                    <a href={getCategoryPath('novelty')} className="nav-link">
                        <span className="nav-label-desktop">Popular Gifts</span>
                        <span className="nav-label-mobile">Popular</span>
                    </a>
                    <button
                        className="wishlist-toggle"
                        onClick={onToggleWishlist}
                        aria-label="View wishlist"
                    >
                        <span className="wishlist-icon">❤️</span>
                        {wishlistCount > 0 && (
                            <span className="wishlist-badge">{wishlistCount}</span>
                        )}
                    </button>
                </nav>
            </div>
        </header>
    );
}
