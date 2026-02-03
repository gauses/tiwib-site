import React from 'react';
import './CategoryFilter.css';

const CATEGORY_MAP = {
    'general': '全部',
    'tech': '科技酷玩',
    'home': '家居厨房',
    'apparel': '服饰配件',
    'gaming': '娱乐游戏',
    'outdoor': '户外生活',
    'food': '美食饮品',
    'vehicles': '载具交通',
    'pet': '宠物用品',
    'office': '办公装备',
    'kids': '儿童礼物',
    'novelty': '新奇创意',
    'adult': '成人派对'
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
                        全部
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
