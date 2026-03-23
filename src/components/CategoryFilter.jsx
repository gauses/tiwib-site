import React from 'react';
import './CategoryFilter.css';
import { getCategoryMeta } from '../utils/categories';
import { getCategoryPath } from '../utils/routes';

export default function CategoryFilter({ categories, selectedCategory }) {
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
                    <a
                        href={getCategoryPath('all')}
                        className={`filter-item ${selectedCategory === 'all' ? 'active' : ''}`}
                        aria-current={selectedCategory === 'all' ? 'page' : undefined}
                    >
                        <span className="item-icon">{getCategoryMeta('all').icon}</span>
                        <span className="item-label">All</span>
                    </a>
                    {categories.map(cat => {
                        const config = getCategoryMeta(cat);

                        return (
                            <a
                                key={cat}
                                href={getCategoryPath(cat)}
                                className={`filter-item ${selectedCategory === cat ? 'active' : ''}`}
                                aria-current={selectedCategory === cat ? 'page' : undefined}
                                title={cat}
                            >
                                <span className="item-icon">{config.icon}</span>
                                <span className="item-label">{config.label}</span>
                            </a>
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
