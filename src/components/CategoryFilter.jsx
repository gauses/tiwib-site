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
    'adult': 'Adult & Nightlife'
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
                    {categories.map(cat => (
                        cat !== 'general' && (
                            <button
                                key={cat}
                                className={`filter-item ${selectedCategory === cat ? 'active' : ''}`}
                                onClick={() => onSelectCategory(cat)}
                            >
                                {CATEGORY_MAP[cat] || cat}
                            </button>
                        )
                    ))}
                </div>
            </div>
        </div>
    );
}
