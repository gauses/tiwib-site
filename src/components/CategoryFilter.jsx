import React from 'react';
import './CategoryFilter.css';

const CATEGORY_MAP = {
    'general': 'All',
    'tech': 'Tech & Gadgets',
    'home': 'Home & Kitchen',
    'apparel': 'Apparel & Fashion',
    'gaming': 'Gaming & Fun',
    'outdoor': 'Lifestyle & Outdoor',
    'food': 'Food & Drink',
    'vehicles': 'Vehicles',
    'pet': 'Gifts for Pets',
    'office': 'Office Gear',
    'kids': 'Gifts for Kids',
    'novelty': 'Novelty & Gifts',
    'adult': 'Adult & Nightlife',
    'fitness': 'Fitness & Health'
};

export default function CategoryFilter({ categories, selectedCategory, onSelectCategory }) {
    return (
        <div className="category-filter">
            <div className="container">
                <div className="filter-scroll">
                    <button
                        className={`filter-item ${selectedCategory === 'all' ? 'active' : ''}`}
                        onClick={() => onSelectCategory('all')}
                    >
                        All
                    </button>
                    {categories.map(cat => {
                        if (cat === 'general') return null;

                        // Safeguard: Truncate very long AI categories if they somehow bypass cleanup
                        const displayName = CATEGORY_MAP[cat] || (cat.length > 20 ? cat.substring(0, 17) + '...' : cat);

                        return (
                            <button
                                key={cat}
                                className={`filter-item ${selectedCategory === cat ? 'active' : ''}`}
                                onClick={() => onSelectCategory(cat)}
                                title={cat}
                            >
                                {displayName}
                            </button>
                        );
                    })}
                </div>
                <div className="scroll-hint right"></div>
            </div>
        </div>
    );
}
