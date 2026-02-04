import './Header.css';

export default function Header({ wishlistCount, onToggleWishlist }) {
    return (
        <header className="header">
            <div className="header-container">
                <div className="logo">
                    <span className="logo-icon">💸</span>
                    <span className="logo-text">TIWIB</span>
                </div>
                <nav className="nav">
                    <a href="#" className="nav-link">Home</a>
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
