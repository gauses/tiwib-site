export default function Hero({ searchQuery, onSearch, resultCount, selectedCategory }) {
    const getHeroTitle = () => {
        if (!selectedCategory || selectedCategory === 'all') {
            return (
                <h1 className="hero-title">
                    This Is Why <span className="gradient-text">I'm Broke</span>
                </h1>
            );
        }
        const cleanCat = selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1);
        return (
            <h1 className="hero-title">
                Cool <span className="gradient-text">{cleanCat}</span> Stuff
            </h1>
        );
    };

    return (
        <div className="hero">
            <div className="hero-content">
                {getHeroTitle()}
                <p className="hero-subtitle">
                    The internet's greatest gallery of things you don't need, but absolutely want. 💸
                </p>

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
                    {searchQuery && (
                        <div className="search-stats">
                            Found {resultCount} amazing {resultCount === 1 ? 'item' : 'items'}
                        </div>
                    )}
                </div>
            </div>

            {/* Floating emojis */}
            <div className="floating-emoji" style={{ top: '10%', left: '10%' }}>🎮</div>
            <div className="floating-emoji" style={{ top: '20%', right: '15%' }}>🚀</div>
            <div className="floating-emoji" style={{ top: '60%', left: '20%' }}>💎</div>
            <div className="floating-emoji" style={{ top: '70%', right: '10%' }}>🎁</div>
        </div>
    );
}
