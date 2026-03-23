import './Hero.css';
import { getCategoryLabel } from '../utils/categories';

export default function Hero({ searchQuery, onSearch, resultCount, selectedCategory }) {
    const normalizedQuery = searchQuery.trim();
    const hasSearch = normalizedQuery.length > 0;
    const hasCategory = selectedCategory && selectedCategory !== 'all';
    const isCompact = hasSearch || hasCategory;
    const cleanCat = hasCategory ? getCategoryLabel(selectedCategory) : 'All Categories';

    const getHeroTitle = () => {
        if (hasSearch) {
            return (
                <h1 className="hero-title">
                    Results for <span className="gradient-text">"{normalizedQuery}"</span>
                </h1>
            );
        }

        if (!hasCategory) {
            return (
                <h1 className="hero-title">
                    This Is Why <span className="gradient-text">I'm Broke</span>
                </h1>
            );
        }

        return (
            <h1 className="hero-title">
                Explore <span className="gradient-text">{cleanCat}</span>
            </h1>
        );
    };

    const getHeroEyebrow = () => {
        if (hasSearch && hasCategory) {
            return `${cleanCat} search`;
        }

        if (hasSearch) {
            return 'Catalog search';
        }

        if (hasCategory) {
            return 'Category spotlight';
        }

        return 'Curated catalog';
    };

    const getHeroSubtitle = () => {
        if (hasSearch) {
            return hasCategory
                ? `Scanning the ${cleanCat.toLowerCase()} shelf for the weirdest, most clickable matches first.`
                : 'Searching the full catalog so you can skip straight to the good stuff.';
        }

        if (hasCategory) {
            return `Jump directly into ${cleanCat.toLowerCase()} picks without wading through the entire catalog.`;
        }

        return "The internet's greatest gallery of things you don't need, but absolutely want. 💸";
    };

    return (
        <div className={`hero ${isCompact ? 'is-compact' : ''}`}>
            <div className="hero-content">
                <p className="hero-eyebrow">{getHeroEyebrow()}</p>
                {getHeroTitle()}
                <p className="hero-subtitle">{getHeroSubtitle()}</p>

                <div className="search-container">
                    <div className="search-bar">
                        <span className="search-icon">🔍</span>
                        <input
                            type="text"
                            placeholder="Search for weird stuff..."
                            value={searchQuery}
                            onChange={(e) => onSearch(e.target.value)}
                            className="search-input"
                        />
                        {searchQuery && (
                            <button className="search-clear" onClick={() => onSearch('')}>
                                ✕
                            </button>
                        )}
                    </div>
                    {searchQuery && !isCompact && (
                        <div className="search-stats">
                            Found {resultCount} amazing {resultCount === 1 ? 'item' : 'items'}
                        </div>
                    )}
                </div>
            </div>

            {!isCompact && (
                <>
                    <div className="floating-emoji" style={{ top: '10%', left: '10%' }}>🎮</div>
                    <div className="floating-emoji" style={{ top: '20%', right: '15%' }}>🚀</div>
                    <div className="floating-emoji" style={{ top: '60%', left: '20%' }}>💎</div>
                    <div className="floating-emoji" style={{ top: '70%', right: '10%' }}>🎁</div>
                </>
            )}
        </div>
    );
}
