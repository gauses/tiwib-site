import React from 'react';
import './CategoryFilter.css';

const CATEGORY_MAP = {
    'general': { label: 'All', icon: '✨' },
    'tech': { label: 'Tech & Gadgets', icon: '⚡' },
    'home': { label: 'Home & Kitchen', icon: '🏠' },
    'apparel': { label: 'Apparel & Fashion', icon: '👕' },
    'gaming': { label: 'Gaming & Fun', icon: '🎮' },
    'outdoor': { label: 'Lifestyle & Outdoor', icon: '🏔️' },
    'food': { label: 'Food & Drink', icon: '🍕' },
    'vehicles': { label: 'Vehicles', icon: '🚗' },
    'pet': { label: 'Gifts for Pets', icon: '🐾' },
    'office': { label: 'Office Gear', icon: '💼' },
    'kids': { label: 'Gifts for Kids', icon: '🧸' },
    'novelty': { label: 'Novelty & Gifts', icon: '🎁' },
    'adult': { label: 'Adult & Nightlife', icon: '🔞' },
    'fitness': { label: 'Fitness & Health', icon: '💪' }
};

export default function CategoryFilter({ categories, selectedCategory, onSelectCategory }) {
    const scrollRef = React.useRef(null);

    const scroll = (direction) => {
        if (scrollRef.current) {
            const scrollAmount = 300;
            scrollRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    return (
        <div className="category-filter">
            <div className="container filter-container">
                <button className="scroll-btn left" onClick={() => scroll('left')} aria-label="Scroll left">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                </button>

                <div className="filter-scroll" ref={scrollRef}>
                    <button
                        className={`filter-item ${selectedCategory === 'all' ? 'active' : ''}`}
                        onClick={() => onSelectCategory('all')}
                    >
                        <span className="item-icon">{CATEGORY_MAP['general'].icon}</span>
                        <span className="item-label">All</span>
                    </button>
                    {categories.map(cat => {
                        if (cat === 'general') return null;

                        const config = CATEGORY_MAP[cat] || {
                            label: cat.length > 20 ? cat.substring(0, 17) + '...' : cat,
                            icon: '🏷️'
                        };

                        return (
                            <button
                                key={cat}
                                className={`filter-item ${selectedCategory === cat ? 'active' : ''}`}
                                onClick={() => onSelectCategory(cat)}
                                title={cat}
                            >
                                <span className="item-icon">{config.icon}</span>
                                <span className="item-label">{config.label}</span>
                            </button>
                        );
                    })}
                </div>

                <button className="scroll-btn right" onClick={() => scroll('right')} aria-label="Scroll right">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                </button>
            </div>
        </div>
    );
}
